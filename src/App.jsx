import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import { useState } from "react";
import { signInWithPopup, provider, auth, signOut } from "./firebase";

const position = [51.505, -0.09];
const mockEvents = [


  { id: 1, position: [51.505, -0.09], title: "Концерт в парке" },
  { id: 2, position: [51.507, -0.087], title: "Игра в футбол" },
];

const [user, setUser] = useState(null);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log("Вошли как:", result.user.displayName);
    } catch (error) {
      console.error("Ошибка входа:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setUser(null);
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

  <div className="absolute top-4 left-4 bg-white rounded-xl shadow px-4 py-2 z-[1000]">
  <p>Привет, {user.displayName}</p>
  <button
    onClick={handleLogout}
    className="text-sm text-red-500 underline hover:text-red-600"
  >
    Выйти
  </button>
</div>


  return (
    <div className="h-screen w-screen">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mockEvents.map((event) => (
          <Marker
            key={event.id}
            position={event.position}
            icon={L.icon({
              iconUrl:
                "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
            })}
          >
            <Popup>{event.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;