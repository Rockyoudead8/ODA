import React, { useState, useMemo } from 'react';
import { MapPin, ArrowRight, Search, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CITIES = [
  'New York', 'London', 'Paris', 'Tokyo', 'Sydney', 'Rome', 'Berlin',
  'Dubai', 'Singapore', 'Rio de Janeiro', 'San Francisco', 'Hong Kong',
  'Amsterdam', 'Seoul', 'Shanghai', 'Cairo', 'Mumbai', 'Toronto', 'Chicago',
  'Barcelona', 'Los Angeles', 'Moscow', 'Mexico City', 'Istanbul', 'Lisbon'
].sort();

const Check = () => {
  const [page, setPage] = useState('Welcome');
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const filteredCities = useMemo(() => {
    if (!searchTerm) return CITIES.slice(0, 10);
    return CITIES.filter(city =>
      city.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 15);
  }, [searchTerm]);

  const handleCitySelection = (city) => {
    setSelectedCity(city);
    setShowCityPicker(false);
  };

  const handleNavigate = async (city) => {
    if (city) {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/cities/${encodeURIComponent(city)}`);
        if (!res.ok) throw new Error("City not found");
        const data = await res.json();

        console.log("Fetched city:", data);
        navigate(`/specific/${data._id}`);
      } catch (err) {
        console.error("Error fetching city:", err);
        alert("Could not find city in database.");
      } finally {
        setLoading(false);
      }
    } else {
      // Skip
      setPage('Hero');
      navigate('/Hero');
    }
  };

  const handleSkip = () => handleNavigate(null);

  if (page === 'Hero') {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-green-50 p-10 rounded-xl shadow-2xl max-w-lg w-full text-center border-t-8 border-green-600">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4 animate-pulse" />
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedCity ? `Starting virtual walk in ${selectedCity}!` : 'Skipped City Selection.'}
          </h1>
          <p className="text-lg text-gray-700 mt-3">
            Your journey begins now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-['Inter']">
      <div className="bg-white p-6 sm:p-10 rounded-xl shadow-2xl max-w-lg w-full text-center border-t-8 border-indigo-600">
        {showCityPicker ? (
          <>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Choose Your Starting City</h2>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for a city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {selectedCity && (
              <div className="p-3 mb-4 bg-indigo-100 border border-indigo-300 rounded-lg flex justify-between items-center text-indigo-700 font-medium">
                <span>Selected: <span className="font-bold">{selectedCity}</span></span>
                <button
                  onClick={() => handleNavigate(selectedCity)}
                  disabled={loading}
                  className={`text-sm px-3 py-1 rounded-full text-white transition ${loading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                  {loading ? 'Loading...' : 'Start Walk'}
                </button>
              </div>
            )}

            <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-2">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  onClick={() => handleCitySelection(city)}
                  className={`w-full text-left px-4 py-2 rounded-md flex justify-between items-center ${
                    selectedCity === city
                      ? 'bg-indigo-500 text-white font-semibold'
                      : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-800'
                  }`}
                >
                  {city}
                  {selectedCity === city && <CheckCircle className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowCityPicker(false)}
              className="mt-4 w-full border-2 border-gray-300 px-6 py-3 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Options
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">Welcome Aboard!</h1>
            <p className="text-gray-600 mb-6">
              Would you like to select a city now to begin your virtual walk, or skip this step for later?
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setShowCityPicker(true)}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700"
              >
                <MapPin className="inline w-5 h-5 mr-2" />
                {selectedCity ? `Change City (${selectedCity})` : 'Select City Now'}
              </button>
              <button
                onClick={handleSkip}
                className="w-full px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Skip for Later
                <ArrowRight className="inline w-5 h-5 ml-2" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Check;
