import React, { useEffect, useRef, useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import { MapPin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_API;

const UserVisitedMap = ({ visitedCities = [] }) => {

  const mapRef = useRef(null);
  const interactionTimeout = useRef(null);

  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.8,
    pitch: 40
  });

  const [userInteracting, setUserInteracting] = useState(false);

  // 🌍 Auto rotation
  useEffect(() => {

    const rotate = () => {

      if (!userInteracting) {
        setViewState((prev) => ({
          ...prev,
          longitude: prev.longitude + 0.02
        }));
      }

    };

    const interval = setInterval(rotate, 50);

    return () => clearInterval(interval);

  }, [userInteracting]);


  // Pause rotation when user interacts
  const handleUserInteraction = () => {

    setUserInteracting(true);

    if (interactionTimeout.current) {
      clearTimeout(interactionTimeout.current);
    }

    interactionTimeout.current = setTimeout(() => {
      setUserInteracting(false);
    }, 5000);

  };


  return (

    <div className="bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-6 h-[500px] border border-slate-700">

      {/* MAP */}

      <div className="flex-1 rounded-lg overflow-hidden shadow-xl h-full">

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
            color: "rgb(186, 210, 235)",
            "high-color": "rgb(36, 92, 223)",
            "horizon-blend": 0.02,
            "space-color": "rgb(11, 11, 25)",
            "star-intensity": 0.6
          }}
        >

          {visitedCities.map((city, index) => (

            <Marker
              key={index}
              longitude={city.lng}
              latitude={city.lat}
              anchor="bottom"
            >

              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "#ec4899",
                  color: "white",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  boxShadow: "0 0 20px rgba(236,72,153,0.9)"
                }}
              >
                {index + 1}
              </div>

            </Marker>

          ))}

        </Map>

      </div>


      {/* SIDEBAR */}

      <div className="md:w-1/3 w-full bg-slate-800 p-4 rounded-lg shadow-inner border border-slate-700 flex flex-col">

        <h3 className="text-lg font-bold text-pink-400 flex items-center border-b border-slate-600 pb-2 mb-3">
          <MapPin className="w-5 h-5 mr-2" />
          My Visited Cities
        </h3>

        {visitedCities.length > 0 ? (

          <ol className="space-y-2 overflow-y-auto">

            {visitedCities.map((city, index) => (

              <li
                key={index}
                className="flex items-center text-sm font-medium bg-slate-700 p-2 rounded-md hover:bg-slate-600 transition"
              >

                <span className="flex items-center text-slate-200">

                  <span className="w-5 h-5 mr-3 text-pink-400">
                    <MapPin />
                  </span>

                  {city.name}

                </span>

              </li>

            ))}

          </ol>

        ) : (

          <p className="text-slate-400 italic text-center my-auto">
            No visited cities yet.
          </p>

        )}

      </div>

    </div>

  );
};

export default UserVisitedMap;