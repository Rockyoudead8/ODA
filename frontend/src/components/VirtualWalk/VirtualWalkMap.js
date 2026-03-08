import Map, { Marker, Popup, Source, Layer } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_API;

function buildRoute(places) {

    if (!places.length) return [];

    const remaining = [...places];
    const route = [remaining.shift()];

    while (remaining.length) {

        const last = route[route.length - 1];
        const [lng1, lat1] = last.geometry.coordinates;

        let nearestIndex = 0;
        let nearestDist = Infinity;

        remaining.forEach((place, i) => {

            const [lng2, lat2] = place.geometry.coordinates;

            const dist = Math.sqrt(
                (lat2 - lat1) ** 2 + (lng2 - lng1) ** 2
            );

            if (dist < nearestDist) {
                nearestDist = dist;
                nearestIndex = i;
            }

        });

        route.push(remaining.splice(nearestIndex, 1)[0]);
    }

    return route;
}

function VirtualWalkMap({ city }) {

    const [viewState, setViewState] = useState({
        latitude: 26.9124,
        longitude: 75.7873,
        zoom: 13
    });

    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [placeImages, setPlaceImages] = useState({});
    const orderedPlaces = buildRoute(places);

    const fetchPlaceImage = async (placeName) => {

        try {

            const res = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(placeName)}&per_page=1&client_id=${process.env.REACT_APP_UNSPLASH_KEY}`
            );

            const data = await res.json();

            return data.results?.[0]?.urls?.small || null;

        } catch (err) {
            console.error("Unsplash fetch error", err);
            return null;
        }

    };
    useEffect(() => {

        const loadImages = async () => {

            const images = {};

            for (const place of places) {

                const name = place.properties.name;

                const img = await fetchPlaceImage(name);

                images[name] = img;

            }

            setPlaceImages(images);

        };

        if (places.length) {
            loadImages();
        }

    }, [places]);

    const routeCoordinates = orderedPlaces.map(
        p => p.geometry.coordinates
    );

    useEffect(() => {
        if (!city) return;
        fetchCoordinates(city);
    }, [city]);

    const fetchCoordinates = async (cityName) => {

        const res = await fetch(
            `https://api.geoapify.com/v1/geocode/search?text=${cityName}&limit=1&apiKey=${process.env.REACT_APP_GEOAPIFY_KEY}`
        );

        const data = await res.json();

        if (!data.features.length) return;

        const coords = data.features[0].geometry.coordinates;

        setViewState({
            latitude: coords[1],
            longitude: coords[0],
            zoom: 13
        });

        fetchPlaces(cityName, coords[1], coords[0]);
    };

    const fetchPlaces = async (city, lat, lng) => {

        const res = await fetch(
            `http://localhost:8000/api/places/${city}/${lat}/${lng}`
        );

        const data = await res.json();

        setPlaces(Array.isArray(data) ? data.slice(0, 10) : []);
    };

    const goToPlace = (place) => {

        const coords = place.geometry.coordinates;

        setViewState({
            longitude: coords[0],
            latitude: coords[1],
            zoom: 17,
            pitch: 65,
            bearing: 40,
            duration: 2000
        });

    };

    return (

        <div style={{
            display: "flex",
            width: "100%",
            height: "100%"
        }}>

            {/* SIDEBAR */}

            <div
                style={{
                    width: "340px",
                    background: "linear-gradient(180deg,#111,#0a0a0a)",
                    color: "white",
                    padding: "22px",
                    overflowY: "auto",
                    borderRight: "1px solid rgba(255,255,255,0.06)"
                }}
            >

                <h2
                    style={{
                        marginBottom: "20px",
                        fontSize: "20px",
                        fontWeight: "700",
                        letterSpacing: "0.5px"

                    }}
                >
                    Explore {city}
                </h2>

                {orderedPlaces.map((place, index) => {

                    const name = place.properties.name || "Unknown Place";

                    return (

                        <div
                            key={index}
                            onClick={() => goToPlace(place)}
                            style={{
                                display: "flex",
                                gap: "14px",
                                marginBottom: "14px",
                                padding: "12px",
                                borderRadius: "14px",
                                background: "#181818",
                                cursor: "pointer",
                                transition: "all 0.25s ease",
                                boxShadow: "0 3px 8px rgba(0,0,0,0.35)"
                            }}

                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#222";
                                e.currentTarget.style.transform = "translateY(-2px)";
                            }}

                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#181818";
                                e.currentTarget.style.transform = "translateY(0px)";
                            }}
                        >

                            {/* IMAGE */}

                            <div style={{ position: "relative" }}>

                                <img
                                    src={
                                        placeImages[name] ||
                                        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=200"
                                    }
                                    alt={name}
                                    loading="lazy"
                                    style={{
                                        width: "70px",
                                        height: "70px",
                                        borderRadius: "12px",
                                        objectFit: "cover",
                                        boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
                                    }}
                                />

                                {/* STOP BADGE */}

                                <div
                                    style={{
                                        position: "absolute",
                                        top: "-6px",
                                        left: "-6px",
                                        background: "#ff3b30",
                                        color: "white",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        width: "22px",
                                        height: "22px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.5)"
                                    }}
                                >
                                    {index + 1}
                                </div>

                            </div>

                            {/* TEXT CONTENT */}

                            <div style={{ flex: 1 }}>

                                <div
                                    style={{
                                        fontWeight: "600",
                                        fontSize: "15px",
                                        lineHeight: "1.2"
                                    }}
                                >
                                    {name}
                                </div>

                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#9ca3af",
                                        marginTop: "6px",
                                        textTransform: "capitalize"
                                    }}
                                >
                                    {place.properties.categories?.[0] || "Tourist attraction"}
                                </div>

                                <div
                                    style={{
                                        fontSize: "11px",
                                        color: "#6b7280",
                                        marginTop: "4px"
                                    }}
                                >
                                    Stop {index + 1}
                                </div>

                            </div>

                        </div>

                    );

                })}

            </div>


            {/* MAP */}

            <div style={{ flex: 1 }}>

                <Map
                    {...viewState}
                    onMove={evt => setViewState(evt.viewState)}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                    mapboxAccessToken={MAPBOX_TOKEN}
                    terrain={{ source: "mapbox-dem", exaggeration: 1.5 }}
                >
                    <Source
                        id="mapbox-dem"
                        type="raster-dem"
                        url="mapbox://mapbox.mapbox-terrain-dem-v1"
                        tileSize={512}
                        maxzoom={14}
                    />

                    <Layer
                        id="3d-buildings"
                        source="composite"
                        source-layer="building"
                        filter={["==", "extrude", "true"]}
                        type="fill-extrusion"
                        minzoom={15}
                        paint={{
                            "fill-extrusion-color": "#aaa",
                            "fill-extrusion-height": ["get", "height"],
                            "fill-extrusion-base": ["get", "min_height"],
                            "fill-extrusion-opacity": 0.6
                        }}
                    />

                    {/* MARKERS */}

                    {orderedPlaces.map((place, index) => {

                        const coords = place.geometry.coordinates;

                        return (

                            <Marker
                                key={index}
                                longitude={coords[0]}
                                latitude={coords[1]}
                            >
                                <div
                                    onClick={() => setSelectedPlace(place)}
                                    style={{
                                        background: "red",
                                        color: "white",
                                        borderRadius: "50%",
                                        width: "26px",
                                        height: "26px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "12px",
                                        cursor: "pointer"
                                    }}
                                >
                                    {index + 1}
                                </div>
                            </Marker>

                        );

                    })}

                    {/* POPUP */}

                    {selectedPlace && (

                        <Popup
                            longitude={selectedPlace.geometry.coordinates[0]}
                            latitude={selectedPlace.geometry.coordinates[1]}
                            onClose={() => setSelectedPlace(null)}
                        >

                            <strong>
                                {selectedPlace.properties.name}
                            </strong>

                        </Popup>

                    )}

                    {/* ROUTE LINE */}

                    {routeCoordinates.length > 1 && (

                        <Source
                            id="route"
                            type="geojson"
                            data={{
                                type: "Feature",
                                geometry: {
                                    type: "LineString",
                                    coordinates: routeCoordinates
                                }
                            }}
                        >

                            <Layer
                                id="routeLine"
                                type="line"
                                paint={{
                                    "line-color": "#ff0000",
                                    "line-width": 4
                                }}
                            />

                        </Source>

                    )}

                </Map>

            </div>

        </div>
    );
}

export default VirtualWalkMap;