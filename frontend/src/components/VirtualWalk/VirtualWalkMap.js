// import React, { useState, useCallback, useEffect } from 'react';
// import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
// import { computeDestinationPoint } from 'geolib';
// import { GoogleGenerativeAI } from "@google/generative-ai";

// import Controls from './Controls';
// import InfoPanel from './InfoPanel';

// // Initialize Gemini API
// const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// const VirtualWalkMap = ({ listingId }) => { 


//     const defaultPosition = { lat: 25.4358, lng: 81.8463 };
//     const [initialPosition, setInitialPosition] = useState(defaultPosition);

//     const [position, setPosition] = useState(defaultPosition); 


//     const [isDataLoading, setIsDataLoading] = useState(true); 

//     const [info, setInfo] = useState('Loading map data...');
//     const [isLoading, setIsLoading] = useState(false);


//     useEffect(() => {
//         const fetchInitialData = async () => {
//             if (!listingId) { 
//                 setIsDataLoading(false);
//                 setInfo('Listing ID missing. Defaulting to Prayagraj.');
//                 return;
//             }

//             try {
//                 const response = await fetch(`http://localhost:8000/api/listing/${listingId}`, {
//                     method: "GET",
//                 });

//                 const data = await response.json();


//                 if (response.ok && data.lat && data.lng) {
//                     const newPos = { 
//                         lat: data.lat, 
//                         lng: data.lng,
//                     };

//                     setInitialPosition(newPos);
//                     setPosition(newPos); 
//                     setInfo(`Cursor is at the starting point of ${data.title || 'the city'}. Use the controls to move.`);
//                 } else {
//                     console.error("Data structure error (lat/lng missing) or bad response. Defaulting to Prayagraj.");
//                     setInfo("Could not fetch city data. Starting at default location.");
//                 }
//             } catch (error) {
//                 console.error("Network error fetching listing data:", error);
//                 setInfo("Network error. Starting at default location.");
//             } finally {
//                 setIsDataLoading(false);
//             }
//         };

//         fetchInitialData();
//     }, [listingId]); 



//     const fetchLocationInfo = useCallback(async (lat, lng) => {
//         setIsLoading(true);
//         const prompt = `Provide a brief description of the location at latitude ${lat} and longitude ${lng}. Mention nearby heritage sites, landmarks, or interesting places within 200 meters. Keep it concise.`;

//         try {
//             const result = await model.generateContent(prompt);
//             const response = await result.response;
//             setInfo(response.text());
//         } catch (error) {
//             console.error("Error fetching from Gemini:", error);
//             setInfo("Could not fetch information for this location.");
//         } finally {
//             setIsLoading(false);
//         }
//     }, []);

//     const handleMove = useCallback((bearing, distance) => {
//         const newPosition = computeDestinationPoint(
//             { latitude: position.lat, longitude: position.lng },
//             distance,
//             bearing
//         );
//         const newPos = { lat: newPosition.latitude, lng: newPosition.longitude };
//         setPosition(newPos);
//         fetchLocationInfo(newPos.lat, newPos.lng);
//     }, [position, fetchLocationInfo]);



//     if (isDataLoading) {
//         return <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
//             <p>Loading initial city location...</p>
//         </div>;
//     }

//     return (
//         <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
//             <div style={{
//                 height: "100%",
//                 width: "100%",
//                 display: 'flex',
//                 flexDirection: 'column'
//             }}>
//                 <div style={{
//                     position: 'relative',
//                     height: '75%',
//                     width: '100%',
//                     marginBottom: '10px'
//                 }}>

//                     <Map center={position}
//                         zoom={16}
//                         mapId="YOUR_MAP_ID"
//                         className={`w-full h-full`}
//                     >
//                         <Marker position={position} />
//                     </Map>
//                     <Controls onMove={handleMove} isLoading={isLoading} />
//                 </div>
//                 <InfoPanel info={info} isLoading={isLoading} />
//             </div>
//         </APIProvider>
//     );
// };

// export default VirtualWalkMap;

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

const touristIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
});

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});
function RecenterMap({ position }) {
    const map = useMap();

    useEffect(() => {
        map.setView(position, 15);
    }, [position]);

    return null;
}
const defaultPosition = [26.9124, 75.7873]; // Jaipur fallback

function VirtualWalkMap({ city }) {
    const [position, setPosition] = useState([26.9124, 75.7873]);
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    useEffect(() => {
        if (!city) return;

        fetchCoordinates(city);
    }, [city]);


    const goToPlace = (place) => {

        const coords = place.geometry.coordinates;

        const lat = coords[1];
        const lng = coords[0];

        setPosition([lat, lng]);
        setSelectedPlace(place);

    };

    const fetchCoordinates = async (cityName) => {
        try {

            const res = await fetch(
                `https://api.geoapify.com/v1/geocode/search?text=${cityName}&limit=1&apiKey=6d21db9365ab4c078fd858469f66813b`
            );

            const data = await res.json();

            if (!data.features || data.features.length === 0) return;

            const coords = data.features[0].geometry.coordinates;

            const lat = coords[1];
            const lng = coords[0];

            setPosition([lat, lng]);

            fetchPlaces(cityName, lat, lng);

        } catch (err) {
            console.error("Geocoding failed", err);
        }
    };

    const fetchPlaces = async (city, lat, lng) => {

        try {

            const res = await fetch(
                `http://localhost:8000/api/places/${city}/${lat}/${lng}`
            );

            const data = await res.json();
            console.log("PLACES FROM BACKEND:", data);
            setPlaces(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error("Error fetching places", err);
        }
    };

    return (

        <div style={{ display: "flex", height: "100%", width: "100%" }}>

            {/* MAP */}
            <div style={{ flex: 3 }}>
                <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>

                    <TileLayer
                        attribution='© OpenStreetMap contributors © CARTO'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    <RecenterMap position={position} />

                    {places
                        .filter(p => p?.geometry?.coordinates)
                        .map((place, index) => {

                            const coords = place.geometry.coordinates;

                            return (
                                <Marker
                                    key={place.properties.place_id || index}
                                    position={[coords[1], coords[0]]}
                                    icon={touristIcon}
                                >
                                    <Popup>
                                        <strong>{place.properties.name}</strong>
                                        <br />
                                        {place.properties.categories?.[0]}
                                    </Popup>
                                </Marker>
                            );

                        })}
                </MapContainer>
            </div>


            {/* SIDEBAR */}
            <div style={{
                flex: 1,
                borderLeft: "1px solid #ddd",
                overflowY: "auto",
                padding: "15px",
                background: "#fafafa"
            }}>

                <h3 style={{ marginBottom: "10px" }}>
                    Famous Places in {city}
                </h3>

                {places.length === 0 && (
                    <p>No places found.</p>
                )}

                {places.map((place, index) => {

                    const name = place.properties.name || "Unknown Place";
                    const category = place.properties.categories?.[0] || "place";

                    return (

                        <div
                            key={index}
                            onClick={() => goToPlace(place)}
                            style={{
                                padding: "10px",
                                marginBottom: "8px",
                                cursor: "pointer",
                                borderRadius: "8px",
                                background: "#fff",
                                border: "1px solid #eee"
                            }}
                        >

                            <strong>{name}</strong>

                            <div style={{
                                fontSize: "12px",
                                color: "#777"
                            }}>
                                {category}
                            </div>

                        </div>

                    );

                })}

            </div>

        </div>

    );
}

export default VirtualWalkMap;