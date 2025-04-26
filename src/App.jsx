import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const position = [51.505, -0.09]; // Центр карты (пример: Лондон)
const mockEvents = [
  { id: 1, position: [51.505, -0.09], title: "Концерт в парке" },
  { id: 2, position: [51.507, -0.087], title: "Игра в футбол" },
];

function App() {
  return (
    <div className="h-screen w-screen">
      <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mockEvents.map(event => (
          <Marker key={event.id} position={event.position} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png", iconSize: [25, 41], iconAnchor: [12, 41] })}>
            <Popup>{event.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;
