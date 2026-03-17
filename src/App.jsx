const publicIconCursor = new URL('src/img/1.jpg', import.meta.url).href;

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
import { signInWithPopup, provider, auth, signOut } from "./firebase";
import { motion } from "framer-motion";
import SidePanel from "./components/SidePanel"

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
  className: '', // сбросить Leaflet-классы
  iconSize: [60, 60],
  iconAnchor: [30, 60], // якорь внизу центра
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
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Ошибка входа:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
  };

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        if (isPlacingCheckpoint) {
          const confirmPlacement = window.confirm("Хотите ли вы установить свой Эвент-Пойнт?");
          if (confirmPlacement) {
            setTempCheckpoint({ lat: e.latlng.lat, lng: e.latlng.lng });
            setIsPlacingCheckpoint(false);
            setInfoText("");
          }
        }
      },
    });
    return null;
  }

  const handleSaveCheckpoint = () => {
    if (!tempCheckpoint || !inputText.trim()) return;
    const newPoint = {
      id: Date.now(),
      position: [tempCheckpoint.lat, tempCheckpoint.lng],
      title: inputText,
    };
    setCheckpoints([...checkpoints, newPoint]);
    setTempCheckpoint(null);
    setInputText("");
    setCurrentInfo(newPoint.title);
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
  tempCheckpoint={tempCheckpoint}
  inputText={inputText}
  setInputText={setInputText}
  handleSaveCheckpoint={handleSaveCheckpoint}
/>
      

      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className={`h-full w-full ${isPlacingCheckpoint ? 'cursor-checkpoint' : ''}`}
        zoomControl={false}
        style={{ cursor: isPlacingCheckpoint ? `url(${publicIconCursor}) 15 15, auto` : "auto" }}
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
            <Popup>{event.title}</Popup>
          </Marker>
        ))}
        <ZoomControl position="topright" />
      </MapContainer>

      {tempCheckpoint && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed p-4 rounded-xl shadow-xl z-[2000]"
          style={{
            left: `${tempCheckpoint.lng}px`,
            top: `${tempCheckpoint.lat}px`,
            transform: "translate(-50%, -100%)",
            backgroundColor: "rgba(35, 79, 87, 0.8)",
            width: "300px",
            border: "2px solid #936EFF",
            boxShadow: "0 0 10px #936EFF",
          }}
        >
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Введите описание вашего события..."
            className="w-full h-24 p-2 rounded"
          />
          <button
            onClick={handleSaveCheckpoint}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Сохранить Эвент-Поинт
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default App;
