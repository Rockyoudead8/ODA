import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Map from "../components/Map.js";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

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
        if (!response.ok) throw new Error(data.error || "Failed to fetch listings");
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
    if (!searchQuery) setFilteredListings(listings);
    else {
      const filtered = listings.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredListings(filtered);
    }
  }, [searchQuery, listings]);

  if (loading) return <p className="text-center text-gray-700 mt-20 text-lg">Loading cities...</p>;
  if (error) return <p className="text-center text-red-600 mt-20 font-semibold">{error}</p>;

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-pink-50 to-purple-100 min-h-screen pt-10 sm:pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Hero Section */}
      <motion.div
        className="max-w-4xl mx-auto mb-10 sm:mb-12 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="text-4xl sm:text-6xl font-extrabold text-indigo-800 mb-3 tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Let’s Start The Journey 🌍
        </motion.h1>

        <motion.p
          className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          Discover history, culture, and stories of the world’s most fascinating cities.
        </motion.p>

        {/* Search Box */}
        <motion.div
          className="relative max-w-lg mx-auto shadow-xl rounded-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Cities (e.g., Paris, Tokyo, Rome)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pl-14 bg-white border border-indigo-200 rounded-full text-gray-700 focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all duration-300 placeholder-gray-500"
          />
        </motion.div>
      </motion.div>

      {/* Map Section */}
      <motion.div
        className="max-w-6xl mx-auto mb-16 p-4 sm:p-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-indigo-100"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 mb-4 border-b pb-2">
          Cities on the Map
        </h2>
        <Map />
      </motion.div>

      {/* Cards Section */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.3 },
          },
        }}
        initial="hidden"
        animate="show"
      >
        {filteredListings.length > 0 ? (
          filteredListings.map((listing, i) => (
            <motion.div
              key={listing._id}
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 12,
                delay: i * 0.05,
              }}
              whileHover={{
                scale: 1.05,
                rotateX: 5,
                rotateY: -5,
                boxShadow: "0px 20px 30px rgba(0,0,0,0.1)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                to={`/specific/${listing._id}`}
                className="block rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100 hover:border-pink-400 transition-all duration-300 group"
              >
                <motion.img
                  className="w-full h-48 object-cover object-center group-hover:opacity-90 transition-opacity duration-300"
                  src={
                    listing.images?.[0] ||
                    "https://placehold.co/600x400/ECEFF1/4B5563?text=City+View"
                  }
                  alt={listing.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/600x400/ECEFF1/4B5563?text=City+View";
                  }}
                  initial={{ scale: 1.05 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                />
                <div className="p-4 sm:p-6">
                  <h5 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 truncate">
                    {listing.title}
                  </h5>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {listing.description || "No description available."}
                  </p>
                  <motion.span
                    className="w-full inline-flex items-center justify-center bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-semibold py-2 sm:py-3 px-4 rounded-lg transition duration-200 shadow-lg shadow-pink-200 text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Explore City
                  </motion.span>
                </div>
              </Link>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full py-10 text-lg font-medium">
            No cities match your search query. Try a different name!
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default Hero;
