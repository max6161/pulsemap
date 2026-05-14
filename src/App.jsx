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
  authPersistenceReady,
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
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import { syncUserProfile } from "./services/usersService";
import SidePanel from "./components/SidePanel";
import EventDetails from "./components/EventDetails";

const position = [51.505, -0.09];

const USER_PLAN = "free";

const PLAN_LIMITS = {
  free: {
    maxActiveEvents: 3,
    createCooldownMs: 30 * 1000,
  },
  premium: {
    maxActiveEvents: 20,
    createCooldownMs: 5 * 1000,
  },
};

const CATEGORY_META = {
  music: {
    label: "🎵 Музыка",
    gradient: "linear-gradient(135deg, #7b2cff, #ff4fd8)",
    glow: "rgba(255, 79, 216, 0.75)",
  },
  games: {
    label: "🎲 Игры",
    gradient: "linear-gradient(135deg, #0066ff, #00d9ff)",
    glow: "rgba(0, 217, 255, 0.75)",
  },
  chill: {
    label: "☕ Чилл",
    gradient: "linear-gradient(135deg, #00c853, #00ffd5)",
    glow: "rgba(0, 255, 213, 0.75)",
  },
  dating: {
    label: "❤️ Знакомства",
    gradient: "linear-gradient(135deg, #ff1744, #ff8ac7)",
    glow: "rgba(255, 105, 180, 0.75)",
  },
};

function isMobileBrowser() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function createCheckpointIcon(category = "chill", isOwn = false) {
  const meta = CATEGORY_META[category] || CATEGORY_META.chill;
  const size = isOwn ? 66 : 60;
  const borderSize = isOwn ? 4 : 3;
  const background = isOwn ? "#3b124e" : "#01333F";

  return L.divIcon({
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        padding:${borderSize}px;
        box-sizing:border-box;
        background:${meta.gradient};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 0 ${isOwn ? 24 : 16}px ${meta.glow};
        position:relative;
      ">
        <div style="
          width:100%;
          height:100%;
          background-color:${background};
          background-image:url('src/img/1.jpg');
          background-size:60% 60%;
          background-position:center;
          background-repeat:no-repeat;
          border-radius:50% 50% 50% 0;
        "></div>

        ${
          isOwn
            ? `
            <div style="
              position:absolute;
              right:-7px;
              top:-7px;
              width:22px;
              height:22px;
              border-radius:50%;
              background:#FF69B4;
              color:white;
              font-size:11px;
              font-weight:bold;
              display:flex;
              align-items:center;
              justify-content:center;
              transform:rotate(45deg);
              box-shadow:0 0 10px #FF69B4;
            ">Вы</div>
          `
            : ""
        }
      </div>
    `,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

function App() {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [infoText, setInfoText] = useState(
    "Создай на карте свой первый Эвент-Пойнт и его увидят другие пользователи!"
  );

  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("chill");

  const [isPlacingCheckpoint, setIsPlacingCheckpoint] = useState(false);
  const [tempCheckpoint, setTempCheckpoint] = useState(null);
  const [inputText, setInputText] = useState("");
  const [eventLifetime, setEventLifetime] = useState(3 * 60 * 60 * 1000);

  const currentPlanLimits = PLAN_LIMITS[USER_PLAN];

  const ownActiveEventsCount = user
    ? checkpoints.filter((event) => String(event.userId) === String(user.uid))
        .length
    : 0;

  const hasReachedEventLimit =
    ownActiveEventsCount >= currentPlanLimits.maxActiveEvents;

  const defaultInfoText = hasReachedEventLimit
    ? `Лимит бесплатного плана: ${currentPlanLimits.maxActiveEvents} активных Эвент-Пойнта.`
    : "Создай на карте свой первый Эвент-Пойнт и его увидят другие пользователи!";

 useEffect(() => {
  let cancelled = false;

  const fallbackTimer = setTimeout(() => {
    if (!cancelled) {
      setAuthReady(true);
    }
  }, 5000);

  const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
    if (cancelled) return;

    clearTimeout(fallbackTimer);

    setUser(currentUser);

    if (currentUser) {
      await syncUserProfile(currentUser);
    }

    setAuthReady(true);
  });

  getRedirectResult(auth).catch((error) => {
    console.error("Ошибка redirect-входа:", error);
  });

  return () => {
    cancelled = true;
    clearTimeout(fallbackTimer);
    unsubscribeAuth();
  };
}, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "events"), (snapshot) => {
      const now = Date.now();

      const loadedEvents = snapshot.docs
        .map((documentItem) => {
          const data = documentItem.data();

          return {
            id: documentItem.id,
            title: data.title || "Без названия",
            position: data.position,
            type: data.type || "public",
            category: data.category || "chill",
            userId: data.userId || null,
            userName: data.userName || "Unknown user",
            userPlan: data.userPlan || "free",
            participants: Array.isArray(data.participants)
              ? data.participants
              : data.userId
              ? [data.userId]
              : [],
            createdAt: data.createdAt?.toMillis?.() || null,
            expiresAt: data.expiresAt?.toMillis?.() || null,
          };
        })
        .filter((event) => {
          return Array.isArray(event.position) && event.expiresAt > now;
        });

      setCheckpoints(loadedEvents);

      setSelectedEvent((prevSelected) => {
        if (!prevSelected) return null;

        const updatedSelected = loadedEvents.find(
          (event) => event.id === prevSelected.id
        );

        return updatedSelected || null;
      });
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedEvent && !tempCheckpoint && !isPlacingCheckpoint) {
      setInfoText(defaultInfoText);
    }
  }, [selectedEvent, tempCheckpoint, isPlacingCheckpoint, defaultInfoText]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsPlacingCheckpoint(false);
        setTempCheckpoint(null);
        setSelectedEvent(null);
        setInputText("");
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleLogin = async () => {
  try {
    await authPersistenceReady;

    const mobile = isMobileBrowser();

    if (mobile) {
      console.log("Mobile login: redirect start");
      signInWithRedirect(auth, provider);
      return;
    }

    await signInWithPopup(auth, provider);
  } catch (popupError) {
    console.error("Popup login failed, trying redirect:", popupError);

    try {
      await authPersistenceReady;
      signInWithRedirect(auth, provider);
    } catch (redirectError) {
      console.error("Redirect login failed:", redirectError);
      alert("Не получилось открыть вход через Google.");
    }
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

          setSelectedEvent(null);
          setIsPlacingCheckpoint(false);
          setInfoText("");
          return;
        }

        setSelectedEvent(null);
        setTempCheckpoint(null);
        setInputText("");
        setInfoText(defaultInfoText);
      },
    });

    return null;
  }

  const handleSaveCheckpoint = async () => {
    if (!tempCheckpoint || !user) return;

    const trimmedText = inputText.trim();

    if (trimmedText.length < 5) {
      alert("Описание эвента должно быть минимум 5 символов.");
      return;
    }

    const now = Date.now();

    try {
      const userEventsQuery = query(
        collection(db, "events"),
        where("userId", "==", user.uid)
      );

      const userEventsSnapshot = await getDocs(userEventsQuery);

      const userActiveEvents = userEventsSnapshot.docs
        .map((docItem) => docItem.data())
        .filter((event) => {
          const expiresAt = event.expiresAt?.toMillis?.();
          return expiresAt && expiresAt > now;
        });

      if (userActiveEvents.length >= currentPlanLimits.maxActiveEvents) {
        alert(
          `На бесплатном плане можно создать максимум ${currentPlanLimits.maxActiveEvents} активных Эвент-Пойнта.`
        );
        return;
      }

      const lastUserCreatedAt = userActiveEvents.reduce((latest, event) => {
        const createdAt = event.createdAt?.toMillis?.() || 0;
        return Math.max(latest, createdAt);
      }, 0);

      const cooldownLeft =
        currentPlanLimits.createCooldownMs - (now - lastUserCreatedAt);

      if (cooldownLeft > 0) {
        alert(`Подожди ещё ${Math.ceil(cooldownLeft / 1000)} сек.`);
        return;
      }

      const expiresAtMs = now + eventLifetime;

      const newPoint = {
        title: trimmedText,
        position: [tempCheckpoint.lat, tempCheckpoint.lng],
        type: "public",
        category: selectedCategory,
        userId: user.uid,
        userName: user.displayName || "Unknown user",
        userPlan: USER_PLAN,
        participants: [user.uid],
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromMillis(expiresAtMs),
        lifetime: eventLifetime,
      };

      await addDoc(collection(db, "events"), newPoint);

      setTempCheckpoint(null);
      setInputText("");
      setSelectedEvent(null);
      setInfoText(newPoint.title);
    } catch (error) {
      console.error("Ошибка создания Эвент-Пойнта:", error);
      alert("Не получилось создать Эвент-Пойнт.");
    }
  };

  const handleDeleteCheckpoint = async (eventId) => {
    if (!user || !eventId) return;

    const eventToDelete = checkpoints.find((event) => event.id === eventId);

    if (!eventToDelete) {
      alert("Эвент не найден.");
      return;
    }

    if (String(eventToDelete.userId) !== String(user.uid)) {
      alert("Можно удалить только свой Эвент-Пойнт.");
      return;
    }

    const confirmDelete = window.confirm("Удалить этот Эвент-Пойнт?");

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "events", eventId));
      setSelectedEvent(null);
      setInfoText("Эвент-Пойнт удалён.");
    } catch (error) {
      console.error("Ошибка удаления события:", error);
      alert("Не получилось удалить Эвент-Пойнт.");
    }
  };

  const handleToggleJoinEvent = async (eventId) => {
    if (!user || !eventId) return;

    const eventToUpdate = checkpoints.find((event) => event.id === eventId);

    if (!eventToUpdate) {
      alert("Эвент не найден.");
      return;
    }

    if (String(eventToUpdate.userId) === String(user.uid)) {
      alert("Вы автор этого эвента.");
      return;
    }

    const alreadyJoined = eventToUpdate.participants?.includes(user.uid);

    try {
      const eventRef = doc(db, "events", eventId);

      await updateDoc(eventRef, {
        participants: alreadyJoined
          ? arrayRemove(user.uid)
          : arrayUnion(user.uid),
      });
    } catch (error) {
      console.error("Ошибка участия:", error);
      alert("Не получилось обновить участие.");
    }
  };

  const filteredCheckpoints =
    activeFilter === "all"
      ? checkpoints
      : checkpoints.filter(
          (event) => (event.category || "chill") === activeFilter
        );

  if (!authReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        Загрузка...
      </div>
    );
  }

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
        infoText={infoText}
        selectedEvent={selectedEvent}
        currentUserId={user.uid}
        setIsPlacingCheckpoint={setIsPlacingCheckpoint}
        isPlacingCheckpoint={isPlacingCheckpoint}
        tempCheckpoint={tempCheckpoint}
        inputText={inputText}
        setInputText={setInputText}
        handleSaveCheckpoint={handleSaveCheckpoint}
        eventLifetime={eventLifetime}
        setEventLifetime={setEventLifetime}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoryMeta={CATEGORY_META}
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
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler />

        {filteredCheckpoints.map((event) => {
          const isOwnEvent = String(event.userId) === String(user.uid);
          const category = event.category || "chill";

          return (
            <Marker
              key={event.id}
              position={event.position}
              icon={createCheckpointIcon(category, isOwnEvent)}
              eventHandlers={{
                click: () => {
                  setSelectedEvent(event);
                  setInfoText(event.title);
                },
              }}
            >
              <Popup>
                <EventDetails
                  selectedEvent={event}
                  currentUserId={user.uid}
                  user={user}
                  onDeleteEvent={handleDeleteCheckpoint}
                  onToggleJoinEvent={handleToggleJoinEvent}
                  categoryMeta={CATEGORY_META}
                />
              </Popup>
            </Marker>
          );
        })}

        <ZoomControl position="bottomleft" />
      </MapContainer>
    </div>
  );
}

export default App;