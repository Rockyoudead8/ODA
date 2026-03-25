import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Map from "../components/Map.js";
import { Search, Globe, Star, ArrowRight, MapPin, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "@fontsource/great-vibes";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/playfair-display";

function Hero() {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownResults, setDropdownResults] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

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
    if (!searchQuery.trim()) {
      setDropdownResults([]);
      setShowDropdown(false);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = listings.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
    );
    setDropdownResults(matches.slice(0, 6));
    setShowDropdown(true);
  }, [searchQuery, listings]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fixed: route matches App.js /Specific/:id (capital S)
  const handleSelectCity = (listing) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(`/Specific/${listing._id}`);
  };

  const handleSuggestCity = () => {
    setShowDropdown(false);
    navigate("/Admin", { state: { openSuggest: true } });
  };

  const noResults = searchQuery.trim() && dropdownResults.length === 0;

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-violet-400 text-xs tracking-[0.15em] uppercase">Loading cities...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <p className="text-rose-400 font-semibold">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen pb-24 relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0f1a 100%)" }}>

      {/* Ambient glows - pointer-events-none so they don't block clicks */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] left-[20%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-[10%] right-[5%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <motion.div
          className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-8 sm:pb-12 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className="flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/35 text-violet-300 px-4 py-1.5 rounded-full text-xs tracking-[0.12em] uppercase font-semibold">
              <Globe className="w-3 h-3" />
              Discover the World's Cities
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.02em] text-gray-100 mb-5"
            style={{ fontFamily: "'Playfair Display', serif" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Let's start the<br />Journey
          </motion.h1>

          <motion.p
            className="text-sm md:text-base text-gray-400 leading-relaxed tracking-wide max-w-md mx-auto mb-8"
            style={{ fontFamily: "Inter, sans-serif" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Discover history, culture, and stories of the world's most fascinating cities.
          </motion.p>

          {/* Search Box */}
          <motion.div
            className="relative max-w-xl mx-auto"
            ref={searchRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-500 z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search cities (e.g. Paris, Tokyo)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              className="w-full pl-14 pr-5 py-3.5 text-sm outline-none transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(139,92,246,0.3)",
                borderRadius: showDropdown ? "18px 18px 0 0" : "999px",
                color: "#e2d9ff",
                backdropFilter: "blur(12px)",
              }}
            />

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 z-50 overflow-hidden"
                  style={{
                    background: "rgba(15,10,26,0.97)",
                    border: "1px solid rgba(139,92,246,0.35)",
                    borderTop: "none",
                    borderRadius: "0 0 18px 18px",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                  }}
                >
                  {dropdownResults.map((listing, i) => (
                    <div
                      key={listing._id}
                      onClick={() => handleSelectCity(listing)}
                      className="flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors hover:bg-violet-500/10"
                      style={{ borderBottom: i < dropdownResults.length - 1 ? "1px solid rgba(139,92,246,0.1)" : "none" }}
                    >
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-violet-500/20">
                        <img
                          src={listing.images?.[0] || "https://placehold.co/32x32/1a1030/7c3aed?text=C"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = "https://placehold.co/32x32/1a1030/7c3aed?text=C"; }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-violet-100 truncate">{listing.title}</p>
                        {listing.description && (
                          <p className="text-xs text-slate-500 truncate">{listing.description}</p>
                        )}
                      </div>
                      <MapPin className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    </div>
                  ))}

                  {noResults && (
                    <div className="px-5 py-4">
                      <p className="text-slate-500 text-sm mb-2.5">
                        No cities found for "<span className="text-violet-400">{searchQuery}</span>"
                      </p>
                      <button
                        onClick={handleSuggestCity}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-violet-300 text-sm font-semibold transition-colors hover:bg-violet-500/20"
                        style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)" }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Suggest "{searchQuery}" as a city
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          className="max-w-6xl mx-auto px-4 mt-20 sm:px-6 mb-16 sm:mb-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="rounded-2xl p-2"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(139,92,246,0.2)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}>
            <Map />
          </div>
        </motion.div>

        {/* Cards Section */}
        {filteredListings.length === 0 ? (
          <p className="text-center text-slate-500 py-10 text-base px-4">
            No cities match your search. Try a different name!
          </p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto px-4 sm:px-6"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } }
            }}
            initial="hidden"
            animate="show"
          >
            {filteredListings.map((listing, i) => (
              <motion.div
                key={listing._id}
                variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: i * 0.04 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={`/Specific/${listing._id}`}
                  className="block rounded-2xl overflow-hidden no-underline transition-all duration-300 hover:shadow-2xl"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(139,92,246,0.18)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                  }}
                >
                  <div className="relative overflow-hidden h-48">
                    <motion.img
                      className="w-full h-full object-cover object-center block"
                      src={listing.images?.[0] || "https://placehold.co/600x400/1a1030/7c3aed?text=City+View"}
                      alt={listing.title}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1a1030/7c3aed?text=City+View"; }}
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 180 }}
                    />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,20,0.7) 0%, transparent 60%)" }} />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(167,139,250,0.3)", color: "#e2e8f0" }}>
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      Featured
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h5 className="font-bold text-violet-100 text-base truncate mb-2">{listing.title}</h5>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                      {listing.description || "No description available."}
                    </p>
                    <motion.div
                      className="w-full flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-xl text-sm text-violet-100 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, rgba(124,58,237,0.8) 0%, rgba(139,92,246,0.8) 100%)",
                        border: "1px solid rgba(167,139,250,0.4)",
                        boxShadow: "0 4px 16px rgba(109,40,217,0.25)",
                      }}
                      whileHover={{ boxShadow: "0 6px 24px rgba(109,40,217,0.45)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Explore City
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Hero;