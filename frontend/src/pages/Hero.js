import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Map from "../components/Map.js" 
import { Search } from "lucide-react";

function Hero() {
  const [listings, setListings] = useState([]); 
  const [filteredListings, setFilteredListings] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); 

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/listing"); 
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch listings");
        }

        setListings(data);
        setFilteredListings(data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);


  useEffect(() => {
    if (!searchQuery) {
      setFilteredListings(listings);
    } else {
      const filtered = listings.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredListings(filtered);
    }
  }, [searchQuery, listings]);

  if (loading) return <p className="text-center text-gray-700 mt-20 text-lg">Loading amazing cities...</p>;
  if (error) return <p className="text-center text-red-600 mt-20 font-semibold">{error}</p>;

  return (
    <>
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 min-h-screen pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      

      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-indigo-800 mb-3 tracking-tight">
          Start Your Virtual Walk
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Explore history, culture, and stories of the world's most fascinating cities.
        </p>
        
       
        <div className="relative max-w-lg mx-auto shadow-xl rounded-full">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Cities (e.g., Paris, Tokyo, Rome)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-14 bg-white border border-indigo-200 rounded-full text-gray-700 focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300 placeholder-gray-500"
            />
        </div>
      </div>


      <div className="max-w-6xl mx-auto mb-12 p-4 bg-white rounded-xl shadow-2xl border border-indigo-100">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4 border-b pb-2">Cities on the Map</h2>
        <Map />
      </div>

 
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => (
            <div
              key={listing._id}
              className="rounded-xl overflow-hidden shadow-xl bg-white border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] active:scale-[0.99]"
            >
              <img
                className="w-full h-48 object-cover object-center"
                src={listing.images[0] || "https://placehold.co/600x400/ECEFF1/4B5563?text=City+View"}
                alt={listing.title}
                onError={(e) => e.target.src = "https://placehold.co/600x400/ECEFF1/4B5563?text=City+View"}
              />
              <div className="p-6">
                <h5 className="text-xl font-bold text-gray-800 mb-2">{listing.title}</h5>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {listing.description?.slice(0, 80)}...
                </p>
                <Link
                  to={`/specific/${listing._id}`}
                  className="w-full inline-flex items-center justify-center bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-lg shadow-pink-200"
                >
                  Explore City
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full py-10 text-lg font-medium">
            No cities match your search query. Try a different name!
          </p>
        )}
      </div>
    </div>
    </>
  );
}

export default Hero;
