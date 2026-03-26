import React, { useEffect, useRef, useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_API;

const UserVisitedMap = ({ visitedCities = [] }) => {
  const mapRef = useRef(null);
  const interactionTimeout = useRef(null);
  const [activeCity, setActiveCity] = useState(null);

  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.8,
    pitch: 40,
  });

  const [userInteracting, setUserInteracting] = useState(false);

  // Auto rotation
  useEffect(() => {
    const rotate = () => {
      if (!userInteracting) {
        setViewState((prev) => ({
          ...prev,
          longitude: prev.longitude + 0.02,
        }));
      }
    };
    const interval = setInterval(rotate, 50);
    return () => clearInterval(interval);
  }, [userInteracting]);

  const handleUserInteraction = () => {
    setUserInteracting(true);
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(() => setUserInteracting(false), 5000);
  };

  // Fixed: fly to city using mapRef.flyTo
  const flyToCity = (city) => {
    if (!city.lng || !city.lat) return;
    setActiveCity(city.name);
    setUserInteracting(true);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [city.lng, city.lat],
        zoom: 6,
        duration: 2200,
        essential: true,
      });
    }

    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(() => setUserInteracting(false), 6000);
  };

  return (
    <div
      style={{
        background: "rgba(10,8,20,0.95)",
        border: "1px solid rgba(139,92,246,0.2)",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "row",
        height: "500px",
        overflow: "hidden",
      }}
    >
      {/* MAP */}
      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <Map
          ref={mapRef}
          {...viewState}
          projection="globe"
          onMove={(evt) => setViewState(evt.viewState)}
          onMouseDown={handleUserInteraction}
          onWheel={handleUserInteraction}
          onTouchStart={handleUserInteraction}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          style={{ width: "100%", height: "100%" }}
          fog={{
            color: "rgb(20, 10, 40)",
            "high-color": "rgb(30, 20, 80)",
            "horizon-blend": 0.04,
            "space-color": "rgb(4, 4, 18)",
            "star-intensity": 0.85,
          }}
        >
          {visitedCities.map((city, index) => (
            <Marker key={index} longitude={city.lng} latitude={city.lat} anchor="bottom">
              <div
                onClick={() => flyToCity(city)}
                style={{
                  width: "30px", height: "30px", borderRadius: "50%",
                  background: activeCity === city.name
                    ? "linear-gradient(135deg, #a78bfa, #ec4899)"
                    : "#ec4899",
                  color: "white", fontWeight: "bold",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", cursor: "pointer",
                  boxShadow: activeCity === city.name
                    ? "0 0 24px rgba(167,139,250,0.9)"
                    : "0 0 20px rgba(236,72,153,0.9)",
                  border: "2px solid rgba(255,255,255,0.25)",
                  transition: "all 0.3s",
                  transform: activeCity === city.name ? "scale(1.2)" : "scale(1)",
                }}
              >
                {index + 1}
              </div>
            </Marker>
          ))}
        </Map>
      </div>

      {/* SIDEBAR */}
      <div
        style={{
          width: "220px",
          flexShrink: 0,
          background: "rgba(15,10,30,0.92)",
          borderLeft: "1px solid rgba(139,92,246,0.15)",
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <h3
          style={{
            fontSize: "0.85rem", fontWeight: 700, color: "#ec4899",
            display: "flex", alignItems: "center", gap: "6px",
            borderBottom: "1px solid rgba(139,92,246,0.15)",
            paddingBottom: "10px", margin: "0 0 14px",
          }}
        >
          <MapPin style={{ width: "15px", height: "15px" }} />
          My Visited Cities
        </h3>

        {visitedCities.length > 0 ? (
          <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "7px" }}>
            {visitedCities.map((city, index) => (
              <li
                key={index}
                onClick={() => flyToCity(city)}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "9px 12px", borderRadius: "10px", cursor: "pointer",
                  background: activeCity === city.name
                    ? "rgba(236,72,153,0.15)"
                    : "rgba(139,92,246,0.07)",
                  border: `1px solid ${activeCity === city.name ? "rgba(236,72,153,0.4)" : "rgba(139,92,246,0.12)"}`,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (activeCity !== city.name) {
                    e.currentTarget.style.background = "rgba(139,92,246,0.14)";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeCity !== city.name) {
                    e.currentTarget.style.background = "rgba(139,92,246,0.07)";
                    e.currentTarget.style.borderColor = "rgba(139,92,246,0.12)";
                  }
                }}
              >
                <MapPin
                  style={{
                    width: "14px", height: "14px", flexShrink: 0,
                    color: activeCity === city.name ? "#ec4899" : "#7c3aed",
                  }}
                />
                <span style={{ color: "#c4b5fd", fontSize: "0.82rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {city.name}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p style={{ color: "#475569", fontSize: "0.8rem", fontStyle: "italic", textAlign: "center", marginTop: "40px" }}>
            No visited cities yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default UserVisitedMap;
