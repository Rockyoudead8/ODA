import React, { useEffect, useState } from "react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { BarChart3 } from "lucide-react";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_API;

function MapView() {

  const [topCities, setTopCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState(null);

  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 2,
    pitch: 35
  });

  useEffect(() => {

    const fetchCities = async () => {

      try {

        const response = await fetch("http://localhost:8000/api/listing");
        const data = await response.json();

        const listings = Array.isArray(data)
          ? data
          : (data.listings || []);

        const citiesWithCoords = listings
          .map((listing) => ({
            name: listing.title,
            visits: listing.visits || 0,
            lat: listing.lat,
            lng: listing.lng
          }))
          .filter(city => city.visits > 0 && city.lat && city.lng);

        const top3 = citiesWithCoords
          .sort((a, b) => b.visits - a.visits)
          .slice(0, 3);

        setTopCities(top3);

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

    setViewState((prev) => ({
      ...prev,
      longitude: city.lng,
      latitude: city.lat,
      zoom: 6,
      transitionDuration: 2000
    }));

  };

  return (

    <div className="relative w-full h-96 md:h-[500px] rounded-xl overflow-hidden bg-indigo-50 border border-indigo-200 shadow-xl p-4 flex flex-col md:flex-row">

      {/* MAP */}

      <div className="flex-1 rounded-lg overflow-hidden shadow-lg h-3/5 md:h-full">

        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
        >

          {topCities.map((city, index) => (

            <Marker
              key={index}
              longitude={city.lng}
              latitude={city.lat}
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
                  boxShadow:
                    activeCity === city.name
                      ? "0 0 20px rgba(236,72,153,0.9)"
                      : "0 3px 10px rgba(0,0,0,0.4)",
                  transform:
                    activeCity === city.name
                      ? "scale(1.25)"
                      : "scale(1)",
                  transition: "all 0.25s"
                }}
              >
                {index + 1}
              </div>

            </Marker>

          ))}

        </Map>

      </div>


      {/* SIDEBAR */}

      <div className="md:w-1/3 w-full md:ml-4 mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-lg border border-indigo-100 flex flex-col">

        <h3 className="text-lg font-bold text-pink-600 flex items-center border-b pb-2 mb-3">
          <BarChart3 className="w-5 h-5 mr-2" />
          Top Visited Cities
        </h3>

        {loading ? (

          <p className="text-gray-500 italic">
            Loading city stats...
          </p>

        ) : topCities.length > 0 ? (

          <ol className="space-y-2 overflow-y-auto">

            {topCities.map((city, index) => (

              <li
                key={index}
                onClick={() => flyToCity(city)}
                className={`flex justify-between items-center text-sm font-medium p-3 rounded-md cursor-pointer transition
                ${activeCity === city.name
                    ? "bg-pink-100"
                    : "bg-indigo-50 hover:bg-indigo-100"
                  }`}
              >

                <span className="flex items-center text-indigo-800">

                  <span
                    className={`w-6 h-6 mr-2 rounded-full text-xs font-bold flex items-center justify-center
                    ${index === 0
                        ? "bg-pink-500 text-white"
                        : "bg-pink-200 text-pink-700"
                      }`}
                  >
                    {index + 1}
                  </span>

                  {city.name}

                </span>

                <span className="text-gray-600 font-semibold">
                  {city.visits}
                </span>

              </li>

            ))}

          </ol>

        ) : (

          <p className="text-gray-500 italic">
            No visit data available yet.
          </p>

        )}

      </div>

    </div>

  );
}

export default MapView;