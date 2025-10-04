import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const cities = [
  { name: "Paris", lat: 48.8566, lng: 2.3522, visits: 120 },
  { name: "New York", lat: 40.7128, lng: -74.0060, visits: 90 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503, visits: 75 },
];

function Map() {
  return (
    <MapContainer center={[20, 0]} zoom={2} style={{ height: "500px", width: "50%" }} className="mt-10 ml-5">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {cities.map((city, idx) => (
        <Marker key={idx} position={[city.lat, city.lng]}>
          <Popup>
            {city.name} <br /> Visits: {city.visits}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Map;
