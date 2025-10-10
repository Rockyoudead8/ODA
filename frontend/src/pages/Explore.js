import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Explore() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/listing");
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Failed to fetch listings");
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
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="h-12 w-12 border-4 border-pink-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-600 font-medium">Loading amazing cities to explore...</p>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto p-8 text-center bg-red-50 border border-red-200 rounded-2xl"
      >
        <h2 className="text-2xl font-bold text-red-700 mb-2">Oops! Something went wrong.</h2>
        <p className="text-red-500 mb-6">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
        >
          Try Again
        </button>
      </motion.div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-extrabold text-gray-900 mb-10 border-b pb-4 tracking-tight"
      >
        Explore Destinations
      </motion.h1>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        {listings.map((city, i) => (
          <motion.div
            key={city._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to={`/specific/${city._id}`}
              className="block rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
            >
              <motion.img
                src={city.images?.[0] || "https://placehold.co/600x400/ECEFF1/4B5563?text=City+View"}
                alt={city.title}
                className="w-full h-52 object-cover group-hover:opacity-90 transition duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/600x400/ECEFF1/4B5563?text=City+View";
                }}
              />
              <div className="p-5">
                <h5 className="text-xl font-semibold text-gray-800 mb-1 truncate">
                  {city.title}
                </h5>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  {city.description || "No description available."}
                </p>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="w-full inline-flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 text-sm"
                >
                  View Details
                </motion.span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default Explore;
