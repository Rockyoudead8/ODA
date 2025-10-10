import React, { useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { MapPin } from "lucide-react";

const libraries = ["places"];

const UserVisitedMap = ({ visitedCities = [] }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const containerStyle = {
    width: '100%',
    height: '100%',
  };

  const mapCenter = useMemo(() => ({ lat: 20, lng: 0 }), []);

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
  };

  if (loadError) {
    return <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">Error loading map.</div>;
  }

  if (!isLoaded) {
    return <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600">Loading Map...</div>;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col md:flex-row gap-6 h-[500px]">
      {/* Map Section */}
      <div className="flex-1 rounded-lg shadow-lg overflow-hidden h-full">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter}
          zoom={2}
          options={mapOptions}
        >
          {visitedCities.map((city, index) => (
            <Marker
              key={index}
              position={{ lat: city.lat, lng: city.lng }}
              title={city.name}
              icon={{
                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                fillColor: '#ec4899', // Pink color from your example
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 1.5,
              }}
            />
          ))}
        </GoogleMap>
      </div>

      {/* Sidebar List Section */}
      <div className="md:w-1/3 w-full bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200 flex flex-col">
        <h3 className="text-lg font-bold text-indigo-700 flex items-center border-b pb-2 mb-3">
          <MapPin className="w-5 h-5 mr-2" /> My Visited Cities
        </h3>
        {visitedCities.length > 0 ? (
          <ol className="space-y-2 list-none p-0 overflow-y-auto">
            {visitedCities.map((city, index) => (
              <li key={index} className="flex items-center text-sm font-medium bg-white p-2 rounded-md">
                <span className="flex items-center text-gray-800">
                  <span className="w-5 h-5 mr-3 text-pink-500"><MapPin/></span>
                  {city.name}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-gray-500 italic text-center my-auto">No visited cities to display on the map yet.</p>
        )}
      </div>
    </div>
  );
};

export default UserVisitedMap;