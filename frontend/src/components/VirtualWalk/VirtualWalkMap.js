import Map, { Marker, Popup, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_API;

function buildRoute(places) {
  if (!places.length) return [];
  const remaining = [...places];
  const route = [remaining.shift()];
  while (remaining.length) {
    const last = route[route.length - 1];
    const [lng1, lat1] = last.geometry.coordinates;
    let nearestIndex = 0, nearestDist = Infinity;
    remaining.forEach((place, i) => {
      const [lng2, lat2] = place.geometry.coordinates;
      const dist = Math.sqrt((lat2 - lat1) ** 2 + (lng2 - lng1) ** 2);
      if (dist < nearestDist) { nearestDist = dist; nearestIndex = i; }
    });
    route.push(remaining.splice(nearestIndex, 1)[0]);
  }
  return route;
}

function VirtualWalkMap({ city }) {
  const [viewState, setViewState] = useState({ latitude: 26.9124, longitude: 75.7873, zoom: 13 });
  const [places, setPlaces]             = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [placeImages, setPlaceImages]   = useState({});
  const orderedPlaces = buildRoute(places);

  const fetchPlaceImage = async (placeName) => {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(placeName)}&per_page=1&client_id=${process.env.REACT_APP_UNSPLASH_KEY}`
      );
      const data = await res.json();
      return data.results?.[0]?.urls?.small || null;
    } catch { return null; }
  };

  useEffect(() => {
    const loadImages = async () => {
      const images = {};
      for (const place of places) {
        const name = place.properties.name;
        images[name] = await fetchPlaceImage(name);
      }
      setPlaceImages(images);
    };
    if (places.length) loadImages();
  }, [places]);

  const routeCoordinates = orderedPlaces.map(p => p.geometry.coordinates);

  useEffect(() => { if (!city) return; fetchCoordinates(city); }, [city]);

  const fetchCoordinates = async (cityName) => {
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${cityName}&limit=1&apiKey=${process.env.REACT_APP_GEOAPIFY_KEY}`
    );
    const data = await res.json();
    if (!data.features.length) return;
    const coords = data.features[0].geometry.coordinates;
    setViewState({ latitude: coords[1], longitude: coords[0], zoom: 13 });
    fetchPlaces(cityName, coords[1], coords[0]);
  };

  const fetchPlaces = async (city, lat, lng) => {
    const res = await fetch(`http://localhost:8000/api/places/${city}/${lat}/${lng}`);
    const data = await res.json();
    setPlaces(Array.isArray(data) ? data.slice(0, 10) : []);
  };

  const goToPlace = (place) => {
    const coords = place.geometry.coordinates;
    setViewState({ longitude: coords[0], latitude: coords[1], zoom: 17, pitch: 65, bearing: 40, duration: 2000 });
  };

  return (
    <div className="flex w-full h-full">

      {/* ── SIDEBAR ── */}
      <div className="w-80 flex flex-col bg-stone-900 border-r border-stone-800 overflow-hidden shrink-0">

        {/* Sidebar header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-stone-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center shrink-0">
            <Navigation size={16} className="text-sky-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-stone-50 tracking-tight m-0">
              Explore {city}
            </h2>
            <p className="text-[11px] text-stone-400 mt-0.5 uppercase tracking-widest m-0">
              {orderedPlaces.length} landmark{orderedPlaces.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Place list */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
          {orderedPlaces.map((place, index) => {
            const name = place.properties.name || "Unknown Place";
            return (
              <div
                key={index}
                onClick={() => goToPlace(place)}
                className="flex gap-3 p-3 rounded-2xl bg-[#262220] border border-stone-800
                           cursor-pointer transition-all duration-200
                           hover:bg-[#2e2926] hover:border-stone-700 hover:-translate-y-px"
              >
                {/* Image + badge */}
                <div className="relative shrink-0">
                  <img
                    src={placeImages[name] || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200"}
                    alt={name}
                    loading="lazy"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full
                                  bg-amber-400 text-[#1c1400] text-[10px] font-extrabold
                                  flex items-center justify-center
                                  shadow-[0_2px_6px_rgba(251,191,36,0.4)]">
                    {index + 1}
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-50 leading-tight m-0 truncate">
                    {name}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-1.5 capitalize m-0">
                    {place.properties.categories?.[0] || "Tourist attraction"}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1.5
                                   text-[10px] font-semibold text-sky-400
                                   bg-sky-400/10 rounded-full px-2 py-0.5">
                    <MapPin size={9} />
                    Stop {index + 1}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAP ── */}
      <div className="flex-1">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          terrain={{ source: "mapbox-dem", exaggeration: 1.5 }}
        >
          <Source id="mapbox-dem" type="raster-dem"
            url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512} maxzoom={14} />

          <Layer
            id="3d-buildings" source="composite" source-layer="building"
            filter={["==", "extrude", "true"]} type="fill-extrusion" minzoom={15}
            paint={{
              "fill-extrusion-color": "#292524",
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "min_height"],
              "fill-extrusion-opacity": 0.7,
            }}
          />

          {/* Markers */}
          {orderedPlaces.map((place, index) => {
            const coords = place.geometry.coordinates;
            return (
              <Marker key={index} longitude={coords[0]} latitude={coords[1]}>
                <div
                  onClick={() => setSelectedPlace(place)}
                  className="w-7 h-7 rounded-full bg-amber-400 text-[#1c1400]
                             flex items-center justify-center text-[11px] font-extrabold
                             cursor-pointer transition-transform duration-150 hover:scale-110
                             shadow-[0_0_0_3px_rgba(251,191,36,0.3),0_4px_12px_rgba(0,0,0,0.5)]"
                >
                  {index + 1}
                </div>
              </Marker>
            );
          })}

          {/* Popup */}
          {selectedPlace && (
            <Popup
              longitude={selectedPlace.geometry.coordinates[0]}
              latitude={selectedPlace.geometry.coordinates[1]}
              onClose={() => setSelectedPlace(null)}
            >
              <div className="bg-stone-900 border border-stone-800 rounded-xl px-3 py-2
                              text-stone-50 text-sm font-semibold">
                {selectedPlace.properties.name}
              </div>
            </Popup>
          )}

          {/* Route line — amber */}
          {routeCoordinates.length > 1 && (
            <Source id="route" type="geojson" data={{
              type: "Feature",
              geometry: { type: "LineString", coordinates: routeCoordinates },
            }}>
              <Layer
                id="routeLine" type="line"
                paint={{ "line-color": "#fbbf24", "line-width": 3, "line-opacity": 0.85 }}
              />
            </Source>
          )}
        </Map>
      </div>
    </div>
  );
}

export default VirtualWalkMap;