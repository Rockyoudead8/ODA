import React, { useEffect, useState, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { BarChart3 } from "lucide-react";


const libraries = ["places"];

function Map() {
  const [topCities, setTopCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // NOTE: This API key is public and should be stored securely in an environment variable in a real application.
  const GOOGLE_MAPS_API_KEY = "AIzaSyAIaDnegHiQN79bVUoTPW_sDW-iVipRF1M"; 

  const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem', 
  };

  const center = useMemo(() => ({
    lat: 20, 
    lng: 0,
  }), []);

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    styles: [ 
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  };

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/listing");
        const data = await response.json();
        
        const listings = Array.isArray(data) ? data : (data.listings || []);

        const citiesWithCoords = listings
          .map((listing) => ({
            name: listing.title,
            visits: listing.visits || 0,
            lat: listing.lat, 
            lng: listing.lng, 
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

  if (loadError) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">
        Error loading Google Maps. Check your API key and connection.
      </div>
    );
  }

  return (
    <div 
     
        className="relative w-full h-96 md:h-[500px] rounded-xl overflow-hidden bg-indigo-50 border-4 border-indigo-200 shadow-inner p-4 flex flex-col md:flex-row"
        style={{ zIndex: 0 }}
    >
        
        
        <div className="flex-1 rounded-lg shadow-lg relative overflow-hidden h-3/5 md:h-full">
          {!isLoaded ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-semibold">
                Loading Map...
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={3}
              options={mapOptions}
            >
              {topCities.map((city, index) => (
                <Marker 
                  key={index} 
                  position={{ lat: city.lat, lng: city.lng }}
                  icon={{
                    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                    fillColor: '#ec4899', 
                    fillOpacity: 1,
                    strokeWeight: 0,
                    scale: 2,
                  }}
                />
              ))}
            </GoogleMap>
          )}
        </div>

        
        
        <div className="md:w-1/3 w-full md:ml-4 mt-4 md:mt-0 bg-white p-4 rounded-lg shadow-xl border border-indigo-100 flex flex-col">
            <h3 className="text-lg font-bold text-pink-600 flex items-center border-b pb-2 mb-3">
                <BarChart3 className="w-5 h-5 mr-2"/> Top Visited Cities
            </h3>
            {loading ? (
                <p className="text-gray-500 italic">Loading city stats...</p>
            ) : topCities.length > 0 ? (
                <ol className="space-y-2 list-none p-0 overflow-y-auto">
                    {topCities.map((city, index) => (
                        <li key={index} className="flex justify-between items-center text-sm font-medium bg-indigo-50 p-2 rounded-md transition hover:bg-indigo-100">
                            <span className="flex items-center text-indigo-800">
                                <span className={`w-5 h-5 mr-2 rounded-full text-xs font-extrabold flex items-center justify-center ${index === 0 ? 'bg-pink-500 text-white' : 'bg-pink-200 text-pink-700'}`}>{index + 1}</span>
                                {city.name}
                            </span>
                            <span className="text-gray-600 font-semibold">{city.visits} Visits</span>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="text-gray-500 italic">No visit data available yet.</p>
            )}
        </div>
    </div>
  );
}

export default Map;