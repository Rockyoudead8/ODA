import React, { useEffect, useState, useRef } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { BarChart3 } from "lucide-react";
import { BACKEND_URL } from '../utils/config';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_API;

function MapView() {
  const [topCities, setTopCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState(null);
  const mapRef = useRef(null);
  const interactionTimeout = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2,
    pitch: 35,
  });

  const [userInteracting, setUserInteracting] = useState(false);

  // Track screen size
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Auto rotation
  useEffect(() => {
    const rotate = () => {
      if (!userInteracting) {
        setViewState((prev) => ({
          ...prev,
          longitude: prev.longitude + 0.01,
        }));
      }
    };
    const interval = setInterval(rotate, 50);
    return () => clearInterval(interval);
  }, [userInteracting]);

  const handleUserInteraction = () => {
    setUserInteracting(true);
    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(() => setUserInteracting(false), 3000);
  };

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/listing`);
        const data = await response.json();
        const listings = Array.isArray(data) ? data : data.listings || [];

        const citiesWithVisits = await Promise.all(
          listings.map(async (listing) => {
            try {
              const res = await fetch(
                `${BACKEND_URL}/api/get_visits?cityName=${encodeURIComponent(listing.title)}`
              );
              const visitData = await res.json();
              return { name: listing.title, visits: visitData.userCount || 0, lat: listing.lat, lng: listing.lng };
            } catch {
              return { name: listing.title, visits: 0, lat: listing.lat, lng: listing.lng };
            }
          })
        );

        const filtered = citiesWithVisits.filter((c) => c.visits > 0 && c.lat && c.lng);
        setTopCities(filtered.sort((a, b) => b.visits - a.visits).slice(0, 3));
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  const flyToCity = (city) => {
    setActiveCity(city.name);
    setUserInteracting(true);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [city.lng, city.lat],
        zoom: 6,
        duration: 2000,
        essential: true,
      });
    } else {
      setViewState((prev) => ({
        ...prev,
        longitude: city.lng,
        latitude: city.lat,
        zoom: 6,
      }));
    }

    if (interactionTimeout.current) clearTimeout(interactionTimeout.current);
    interactionTimeout.current = setTimeout(() => setUserInteracting(false), 5000);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        background: "rgba(10,8,20,0.95)",
        border: "1px solid rgba(139,92,246,0.2)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: isMobile ? "column" : "row",
          gap: 0,
        }}
      >
        {/* MAP */}
        <div style={{ flex: 1, minHeight: isMobile ? "260px" : "420px", position: "relative" }}>
          <Map
            ref={mapRef}
            {...viewState}
            projection="globe"
            onMove={(evt) => setViewState(evt.viewState)}
            onMouseDown={handleUserInteraction}
            onWheel={handleUserInteraction}
            onTouchStart={handleUserInteraction}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            mapboxAccessToken={MAPBOX_TOKEN}
            fog={{
              color: "rgb(20, 10, 40)",
              "high-color": "rgb(30, 20, 80)",
              "horizon-blend": 0.04,
              "space-color": "rgb(4, 4, 18)",
              "star-intensity": 0.85,
            }}
          >
            {topCities.map((city, index) => (
              <Marker key={city.name} longitude={city.lng} latitude={city.lat}>
                <div
                  onClick={() => flyToCity(city)}
                  style={{
                    width: "30px", height: "30px", borderRadius: "50%",
                    background: activeCity === city.name
                      ? "linear-gradient(135deg, #a78bfa, #ec4899)"
                      : "#7c3aed",
                    color: "white", fontWeight: "bold",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", cursor: "pointer",
                    boxShadow: activeCity === city.name
                      ? "0 0 20px rgba(167,139,250,0.9)"
                      : "0 0 12px rgba(124,58,237,0.7)",
                    border: "2px solid rgba(255,255,255,0.3)",
                    transition: "all 0.3s",
                  }}
                >
                  {index + 1}
                </div>
              </Marker>
            ))}
          </Map>
        </div>

        {/* SIDEBAR — row on desktop, horizontal strip on mobile */}
        <div
          style={{
            width: isMobile ? "100%" : "220px",
            flexShrink: 0,
            background: "rgba(15,10,30,0.9)",
            borderLeft: isMobile ? "none" : "1px solid rgba(139,92,246,0.15)",
            borderTop: isMobile ? "1px solid rgba(139,92,246,0.15)" : "none",
            padding: isMobile ? "12px 14px" : "20px 16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              fontSize: "0.85rem", fontWeight: 700, color: "#a78bfa",
              display: "flex", alignItems: "center", gap: "6px",
              borderBottom: "1px solid rgba(139,92,246,0.15)",
              paddingBottom: "10px", margin: "0 0 12px",
            }}
          >
            <BarChart3 style={{ width: "16px", height: "16px" }} />
            Top Visited Cities
          </h3>

          {loading ? (
            <p style={{ color: "#475569", fontSize: "0.8rem", fontStyle: "italic" }}>Loading...</p>
          ) : topCities.length > 0 ? (
            <ol
              style={{
                listStyle: "none", padding: 0, margin: 0,
                display: "flex",
                flexDirection: isMobile ? "row" : "column",
                gap: "8px",
                overflowX: isMobile ? "auto" : "visible",
              }}
            >
              {topCities.map((city, index) => (
                <li
                  key={city.name}
                  onClick={() => flyToCity(city)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    cursor: "pointer",
                    background: activeCity === city.name
                      ? "rgba(139,92,246,0.2)"
                      : "rgba(139,92,246,0.07)",
                    border: `1px solid ${activeCity === city.name ? "rgba(167,139,250,0.4)" : "rgba(139,92,246,0.12)"}`,
                    transition: "all 0.2s",
                    flexShrink: isMobile ? 0 : undefined,
                    minWidth: isMobile ? "140px" : undefined,
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
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#c4b5fd", fontSize: "0.82rem", fontWeight: 500 }}>
                    <span style={{ width: "20px", height: "20px", borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      {index + 1}
                    </span>
                    {city.name}
                  </span>
                  <span style={{ color: "#7c3aed", fontSize: "0.78rem", fontWeight: 600, marginLeft: "8px" }}>{city.visits}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p style={{ color: "#475569", fontSize: "0.8rem", fontStyle: "italic", textAlign: "center", marginTop: "24px" }}>
              No visit data yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapView;