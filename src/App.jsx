const publicIconCursor = new URL("src/img/1.jpg", import.meta.url).href;

import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";

import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  provider,
  auth,
  signOut,
  onAuthStateChanged,
  db,
} from "./firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";

import SidePanel from "./components/SidePanel";

const position = [51.505, -0.09];

const customCheckpointIcon = L.divIcon({
  html: `<div style="
    width: 60px;
    height: 60px;
    background-color: #01333F;
    background-image: url('src/img/1.jpg');
    background-size: 60% 60%;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid #00BFFF;
    box-shadow: 0 0 10px #00BFFF;
  "></div>`,
  className: "",
  iconSize: [60, 60],
  iconAnchor: [30, 60],
});

function App() {
  const [user, setUser] = useState(null);

  const [infoText, setInfoText] = useState(
    "Создай на карте свой первый Эвент-Поинт и его увидят другие пользователи!"
  );

  const [checkpoints, setCheckpoints] = useState([]);
  const [isPlacingCheckpoint, setIsPlacingCheckpoint] = useState(false);
  const [tempCheckpoint, setTempCheckpoint] = useState(null);
  const [currentInfo, setCurrentInfo] = useState(null);
  const [inputText, setInputText] = useState("");
  const [eventLifetime, setEventLifetime] = useState(3 * 60 * 60 * 1000);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      console.error("Ошибка redirect-входа:", error);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const now = Date.now();

      const loadedEvents = snapshot.docs
        .map((document) => {
          const data = document.data();

          return {
            id: document.id,
            title: data.title,
            position: data.position,
            type: data.type || "public",
            userId: data.userId,
            userName: data.userName,
            createdAt: data.createdAt?.toMillis?.() || null,
            expiresAt: data.expiresAt?.toMillis?.() || null,
          };
        })
        .filter((event) => {
          return Array.isArray(event.position) && event.expiresAt > now;
        });

      setCheckpoints(loadedEvents);

      snapshot.docs.forEach((document) => {
        const data = document.data();
        const expiresAt = data.expiresAt?.toMillis?.();

        if (
          expiresAt &&
          expiresAt <= now &&
          auth.currentUser &&
          data.userId === auth.currentUser.uid
        ) {
          deleteDoc(doc(db, "events", document.id));
        }
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsPlacingCheckpoint(false);
        setTempCheckpoint(null);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

   const handleLogin = async () => {
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Ошибка входа:", error);
  }
};

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Ошибка выхода:", error);
    }
  };

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        if (isPlacingCheckpoint) {
          setTempCheckpoint({
            lat: e.latlng.lat,
            lng: e.latlng.lng,
          });

          setIsPlacingCheckpoint(false);
          setInfoText("");
        }
      },
    });

    return null;
  }

  const handleSaveCheckpoint = async () => {
    if (!tempCheckpoint || !inputText.trim() || !user) return;

    const expiresAtMs = Date.now() + eventLifetime;

    const newPoint = {
      title: inputText.trim(),
      position: [tempCheckpoint.lat, tempCheckpoint.lng],
      type: "public",
      userId: user.uid,
      userName: user.displayName || "Unknown user",
      createdAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(expiresAtMs),
      lifetime: eventLifetime,
    };

    try {
      await addDoc(collection(db, "events"), newPoint);

      setTempCheckpoint(null);
      setInputText("");
      setCurrentInfo(newPoint.title);
    } catch (error) {
      console.error("Ошибка сохранения события в Firestore:", error);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md"
        >
          Войти через Google
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative">
      <SidePanel
        user={user}
        onLogout={handleLogout}
        infoText={currentInfo || infoText}
        setIsPlacingCheckpoint={setIsPlacingCheckpoint}
        isPlacingCheckpoint={isPlacingCheckpoint}
        tempCheckpoint={tempCheckpoint}
        inputText={inputText}
        setInputText={setInputText}
        handleSaveCheckpoint={handleSaveCheckpoint}
        eventLifetime={eventLifetime}
        setEventLifetime={setEventLifetime}
      />

      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className={`h-full w-full ${
          isPlacingCheckpoint ? "cursor-checkpoint" : ""
        }`}
        zoomControl={false}
        style={{
          cursor: isPlacingCheckpoint
            ? `url(${publicIconCursor}) 15 15, auto`
            : "auto",
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler />

        {checkpoints.map((event) => (
          <Marker
            key={event.id}
            position={event.position}
            eventHandlers={{ click: () => setCurrentInfo(event.title) }}
            icon={customCheckpointIcon}
          >
            <Popup>
              <div>
                <strong>{event.title}</strong>
                <br />
                Автор: {event.userName || "Unknown user"}
                <br />
                Живёт до:{" "}
                {event.expiresAt
                  ? new Date(event.expiresAt).toLocaleString("ru-RU")
                  : "неизвестно"}
              </div>
            </Popup>
          </Marker>
        ))}

        <ZoomControl position="topright" />
      </MapContainer>
    </div>
  );
}

export default App;