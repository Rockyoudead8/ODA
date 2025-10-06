import React, { useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import { computeDestinationPoint } from 'geolib';
import { GoogleGenerativeAI } from "@google/generative-ai";

import Controls from './Controls';
import InfoPanel from './InfoPanel';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const VirtualWalkMap = ({ listingId }) => { 


    const defaultPosition = { lat: 25.4358, lng: 81.8463 };
    const [initialPosition, setInitialPosition] = useState(defaultPosition);

    const [position, setPosition] = useState(defaultPosition); 
    

    const [isDataLoading, setIsDataLoading] = useState(true); 

    const [info, setInfo] = useState('Loading map data...');
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        const fetchInitialData = async () => {
            if (!listingId) { 
                setIsDataLoading(false);
                setInfo('Listing ID missing. Defaulting to Prayagraj.');
                return;
            }

            try {
                const response = await fetch(`http://localhost:8000/api/listing/${listingId}`, {
                    method: "GET",
                });

                const data = await response.json();

               
                if (response.ok && data.lat && data.lng) {
                    const newPos = { 
                        lat: data.lat, 
                        lng: data.lng,
                    };
                    
                    setInitialPosition(newPos);
                    setPosition(newPos); 
                    setInfo(`Cursor is at the starting point of ${data.title || 'the city'}. Use the controls to move.`);
                } else {
                    console.error("Data structure error (lat/lng missing) or bad response. Defaulting to Prayagraj.");
                    setInfo("Could not fetch city data. Starting at default location.");
                }
            } catch (error) {
                console.error("Network error fetching listing data:", error);
                setInfo("Network error. Starting at default location.");
            } finally {
                setIsDataLoading(false);
            }
        };

        fetchInitialData();
    }, [listingId]); 



    const fetchLocationInfo = useCallback(async (lat, lng) => {
        setIsLoading(true);
        const prompt = `Provide a brief description of the location at latitude ${lat} and longitude ${lng}. Mention nearby heritage sites, landmarks, or interesting places within 200 meters. Keep it concise.`;

        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setInfo(response.text());
        } catch (error) {
            console.error("Error fetching from Gemini:", error);
            setInfo("Could not fetch information for this location.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleMove = useCallback((bearing, distance) => {
        const newPosition = computeDestinationPoint(
            { latitude: position.lat, longitude: position.lng },
            distance,
            bearing
        );
        const newPos = { lat: newPosition.latitude, lng: newPosition.longitude };
        setPosition(newPos);
        fetchLocationInfo(newPos.lat, newPos.lng);
    }, [position, fetchLocationInfo]);



    if (isDataLoading) {
        return <div style={{height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <p>Loading initial city location...</p>
        </div>;
    }

    return (
        <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <div style={{
                height: "100%",
                width: "100%",
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    position: 'relative',
                    height: '75%',
                    width: '100%',
                    marginBottom: '10px'
                }}>
                    
                    <Map center={position}
                        zoom={16}
                        mapId="YOUR_MAP_ID"
                        className={`w-full h-full`}
                    >
                        <Marker position={position} />
                    </Map>
                    <Controls onMove={handleMove} isLoading={isLoading} />
                </div>
                <InfoPanel info={info} isLoading={isLoading} />
            </div>
        </APIProvider>
    );
};

export default VirtualWalkMap;