import React from 'react';
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Explore() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/listing");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch listings");
        }

        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);


  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading amazing cities to explore...</p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-2xl font-bold text-red-700 mb-2">Oops! Something went wrong.</h2>
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200"
        >
          Try Reloading
        </button>
      </div>
    );
  }


  if (listings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Cities Found</h2>
        <p className="text-gray-500">It looks like there aren't any listings available right now. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">Explore Destinations</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {listings.map((city) => (
          <Link
            to={`/specific/${city._id}`}
            key={city._id}
            className="block rounded-xl overflow-hidden shadow-xl bg-white border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] active:scale-[0.99] group"
          >
            <img
              className="w-full h-48 object-cover object-center group-hover:opacity-90 transition-opacity duration-300"
              src={city.images?.[0] || "https://placehold.co/600x400/ECEFF1/4B5563?text=City+View"}
              alt={city.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/600x400/ECEFF1/4B5563?text=City+View";
              }}
            />
            <div className="p-6">
              <h5 className="text-xl font-bold text-gray-800 mb-2 truncate">
                {city.title}
              </h5>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {city.description || "No description available."}
              </p>

              <span
                className="w-full inline-flex items-center justify-center bg-pink-500 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-lg shadow-pink-200 text-sm"
              >
                View Details
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Explore;