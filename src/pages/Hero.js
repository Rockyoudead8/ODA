import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Map from "../components/Map.js";
import { Search, Globe, Star, ArrowRight } from "lucide-react";
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

  if (loading)
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", border: "2px solid #7c3aed", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "#a78bfa", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>Loading cities...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  if (error)
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#f43f5e", fontWeight: 600 }}>{error}</p>
      </div>
    );

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "96px", background: "linear-gradient(135deg, #0a0a0f 0%, #0f0a1a 40%, #0a0f1a 100%)", position: "relative" }}>
      {/* Ambient background glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "20%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", top: "40%", left: "-10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Hero Section */}
        <motion.div
          style={{ maxWidth: "896px", margin: "0 auto", padding: "80px 24px 48px", textAlign: "center" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          <motion.div
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.35)", color: "#c4b5fd", padding: "4px 16px", borderRadius: "999px", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
              <Globe style={{ display: "inline", width: "12px", height: "12px", marginRight: "6px", marginBottom: "2px" }} />
              Discover the World's Cities
            </span>
          </motion.div>

          <motion.h1
            style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)", fontWeight: 900, marginBottom: "16px", letterSpacing: "-0.03em", lineHeight: 1.05, background: "linear-gradient(135deg, #e2d9ff 0%, #a78bfa 45%, #ec4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Let's Start The Journey 🌍
          </motion.h1>

          <motion.p
            style={{ fontSize: "1.05rem", marginBottom: "40px", maxWidth: "480px", margin: "0 auto 40px", lineHeight: 1.7, color: "#94a3b8" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Discover history, culture, and stories of the world's most fascinating cities.
          </motion.p>

          {/* Search Box */}
          <motion.div
            style={{ position: "relative", maxWidth: "512px", margin: "0 auto" }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Search style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", width: "20px", height: "20px", color: "#7c3aed" }} />
            <input
              type="text"
              placeholder="Search Cities (e.g., Paris, Tokyo, Rome)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "14px 20px 14px 52px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "999px", color: "#e2d9ff", fontSize: "0.95rem", outline: "none", backdropFilter: "blur(12px)", boxSizing: "border-box" }}
              onFocus={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.7)"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.15)"; }}
              onBlur={(e) => { e.target.style.border = "1px solid rgba(139,92,246,0.3)"; e.target.style.boxShadow = "none"; }}
            />
          </motion.div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          style={{ maxWidth: "1152px", margin: "0 auto 80px", padding: "0 24px" }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: "20px", padding: "24px", backdropFilter: "blur(16px)", boxShadow: "0 25px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
              <div style={{ width: "8px", height: "8px", background: "#a78bfa", borderRadius: "50%", boxShadow: "0 0 8px #a78bfa" }} />
              <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#c4b5fd", letterSpacing: "0.02em", margin: 0 }}>Cities on the Map</h2>
            </div>
            <Map />
          </div>
        </motion.div>

        {/* Cards Section */}
        {filteredListings.length === 0 ? (
          <p style={{ textAlign: "center", color: "#475569", padding: "40px 0", fontSize: "1.05rem" }}>
            No cities match your search query. Try a different name!
          </p>
        ) : (
          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "24px", maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }}
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
                  to={`/specific/${listing._id}`}
                  style={{ display: "block", borderRadius: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.18)", boxShadow: "0 8px 32px rgba(0,0,0,0.35)", overflow: "hidden", textDecoration: "none", transition: "border-color 0.3s, box-shadow 0.3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)"; e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(167,139,250,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.18)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.35)"; }}
                >
                  <div style={{ position: "relative", overflow: "hidden", height: "192px" }}>
                    <motion.img
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                      src={listing.images?.[0] || "https://placehold.co/600x400/1a1030/7c3aed?text=City+View"}
                      alt={listing.title}
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x400/1a1030/7c3aed?text=City+View"; }}
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 180 }}
                    />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,10,20,0.7) 0%, transparent 60%)" }} />
                    <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: "999px", padding: "3px 10px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Star style={{ width: "11px", height: "11px", color: "#facc15", fill: "#facc15" }} />
                      <span style={{ color: "#e2e8f0", fontSize: "0.68rem", fontWeight: 600 }}>Featured</span>
                    </div>
                  </div>
                  <div style={{ padding: "18px 20px 20px" }}>
                    <h5 style={{ fontWeight: 700, marginBottom: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "1.05rem", color: "#e2d9ff", margin: "0 0 8px 0" }}>
                      {listing.title}
                    </h5>
                    <p style={{ fontSize: "0.85rem", marginBottom: "20px", color: "#64748b", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {listing.description || "No description available."}
                    </p>
                    <motion.div
                      style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 600, padding: "10px 16px", borderRadius: "12px", fontSize: "0.875rem", background: "linear-gradient(135deg, rgba(124,58,237,0.8) 0%, rgba(139,92,246,0.8) 100%)", border: "1px solid rgba(167,139,250,0.4)", color: "#ede9fe", boxShadow: "0 4px 16px rgba(109,40,217,0.25)", cursor: "pointer" }}
                      whileHover={{ background: "linear-gradient(135deg, rgba(124,58,237,1) 0%, rgba(167,139,250,1) 100%)", boxShadow: "0 6px 24px rgba(109,40,217,0.45)" }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Explore City
                      <ArrowRight style={{ width: "16px", height: "16px" }} />
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
