import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { signInWithPopup, provider, auth, signOut } from "./firebase";

const position = [51.505, -0.09];
const mockEvents = [
  {
    id: 1,
    position: [56.8389, 60.6057], // Координаты Екатеринбурга
    title: "Здесь живёт разработчик данного приложения",
  },
];



function AddMarker({ onAdd }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const title = prompt("Введите название события:");
      if (title) {
        onAdd({ id: Date.now(), position: [lat, lng], title });
      }
    },
  });
  return null;
}


// вход в аккаунт через Google НАЧАЛО//
function App() {
  const [user, setUser] = useState(null); 

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      console.log("Вошли как:", result.user.displayName);
    } catch (error) {
      console.error("Ошибка входа:", error);
    }
  };

  // вход в аккаунт через Google КОНЕЦ//

  // выход из аккаунта  Google НАЧАЛО//
  const handleLogout = () => {
    signOut(auth);
    setUser(null);
  };
   // выход из аккаунта  Google КОНЕЦ//

   //Кнопка входа НАЧАЛО//

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

  //Кнопка входа КОНЕЦ//

  //панель приветствия НАЧАЛО//
  return (
    <div className="h-screen w-screen relative">
      {/* Приветствие и кнопка выхода */}
      <div className="absolute top-4 right-[50px] bg-white rounded-xl shadow px-4 py-2 z-[1000]">
        <p>Привет, {user.displayName}</p>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 underline hover:text-red-600"
        >
          Выйти
        </button>
      </div>
      //панель приветствия КОНЕЦ//
      
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