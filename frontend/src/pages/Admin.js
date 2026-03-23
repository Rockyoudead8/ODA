import React, { useEffect, useState } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  MapPin,
  UploadCloud,
  Loader2,
  X,
  CheckCircle,
  Award,
  Target,
  BookOpen,
  Compass,
  TrendingUp,
  Globe,
  Star,
  MessageCircle,
  FileText,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserVisitedMap from "../components/UserVisitedMap";

ChartJS.register(
  LineElement, BarElement, CategoryScale, LinearScale,
  PointElement, ArcElement, Tooltip, Legend
);

const simulateUploadCity = (cityName) =>
  new Promise((resolve) =>
    setTimeout(() => resolve({ success: true, message: `${cityName} submitted!` }), 2000)
  );

// ── Badge helper ────────────────────────────────────────────────────────────
const BADGE_TIERS = [
  { min: 200, label: "Legend Explorer",  color: "#FF6B6B", bg: "#FFF0F0", emoji: "🏆" },
  { min: 100, label: "Elite Traveller",  color: "#845EF7", bg: "#F3F0FF", emoji: "💎" },
  { min:  50, label: "City Adventurer",  color: "#F59E0B", bg: "#FFFBEB", emoji: "⭐" },
  { min:  20, label: "Local Explorer",   color: "#10B981", bg: "#ECFDF5", emoji: "🌿" },
  { min:   1, label: "Newcomer",         color: "#3B82F6", bg: "#EFF6FF", emoji: "🌱" },
  { min:   0, label: "No Points Yet",    color: "#9CA3AF", bg: "#F9FAFB", emoji: "👤" },
];
const getBadge = (total) =>
  BADGE_TIERS.find((t) => total >= t.min) || BADGE_TIERS[BADGE_TIERS.length - 1];

// ── Stat Card ─────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, delay = 0 }) => (
  <motion.div
    className="stat-card"
    style={{ "--c": color }}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <div className="stat-icon-wrap">{icon}</div>
    <div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  </motion.div>
);

// ── Main ──────────────────────────────────────────────────────────────────
const Admin = () => {
  const [userData, setUserData]                         = useState(null);
  const [quizResults, setQuizResults]                   = useState([]);
  const [cityStats, setCityStats]                       = useState({ cities: [], overallTotal: 0 });
  const [visitedCitiesWithCoords, setVisitedCitiesWithCoords] = useState([]);
  const [error, setError]                               = useState("");
  const [loading, setLoading]                           = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen]       = useState(false);
  const [newCityName, setNewCityName]                   = useState("");
  const [isUploading, setIsUploading]                   = useState(false);
  const [uploadMessage, setUploadMessage]               = useState({ type: "", text: "" });
  const [activeTab, setActiveTab]                       = useState("overview");

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userRes, quizRes, cityRes] = await Promise.all([
          fetch("http://localhost:8000/api/auth/get_user", { credentials: "include" }),
          fetch("http://localhost:8000/api/submit_quiz/get_quiz", { credentials: "include" }),
          fetch("http://localhost:8000/api/city-points/my-stats", { credentials: "include" }),
        ]);

        const userData  = await userRes.json();
        const quizData  = await quizRes.json();
        const cityData  = await cityRes.json();

        if (userRes.ok) setUserData(userData.user);
        else setError(userData.error || "User not found");

        if (quizRes.ok) setQuizResults(quizData || []);
        if (cityRes.ok) setCityStats(cityData);
      } catch {
        setError("Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!userData?.visitedCities?.length) return;
    fetch("http://localhost:8000/api/geocode-cities", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cities: userData.visitedCities }),
    })
      .then((r) => r.json())
      .then((data) => setVisitedCitiesWithCoords(data))
      .catch((err) => console.error("Geocode error:", err));
  }, [userData]);

  const handleUploadCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    setIsUploading(true);
    setUploadMessage({ type: "", text: "" });
    try {
      const result = await simulateUploadCity(newCityName.trim());
      setUploadMessage({ type: "success", text: result.message });
      setNewCityName("");
      setTimeout(() => setIsUploadModalOpen(false), 2000);
    } catch {
      setUploadMessage({ type: "error", text: "Upload failed." });
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setNewCityName("");
    setUploadMessage({ type: "", text: "" });
  };

  // ── Derived quiz data ────────────────────────────────────────────────────
  const cityPerformance = quizResults.reduce((acc, { city, score }) => {
    if (!acc[city]) acc[city] = { totalScore: 0, count: 0 };
    acc[city].totalScore += score;
    acc[city].count++;
    return acc;
  }, {});

  const totalQuizzes   = quizResults.length;
  const overallAvgScore =
    totalQuizzes > 0
      ? (quizResults.reduce((s, q) => s + q.score, 0) / totalQuizzes).toFixed(1)
      : 0;

  let bestCity = "N/A";
  if (Object.keys(cityPerformance).length > 0) {
    bestCity = Object.keys(cityPerformance).reduce((a, b) =>
      cityPerformance[a].totalScore / cityPerformance[a].count >
      cityPerformance[b].totalScore / cityPerformance[b].count
        ? a : b
    );
  }

  // ── Chart data ────────────────────────────────────────────────────────────
  const lineData = {
    labels: quizResults.map((_, i) => `Quiz ${i + 1}`),
    datasets: [{
      label: "Score",
      data: quizResults.map((q) => q.score),
      fill: true,
      backgroundColor: "rgba(59,130,246,0.08)",
      borderColor: "#3B82F6",
      pointBackgroundColor: "#3B82F6",
      pointRadius: 4,
      tension: 0.4,
    }],
  };

  const pieData = {
    labels: Object.keys(cityPerformance),
    datasets: [{
      data: Object.keys(cityPerformance).map((c) =>
        (cityPerformance[c].totalScore / cityPerformance[c].count).toFixed(2)
      ),
      backgroundColor: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"],
      borderColor: "#fff",
      borderWidth: 3,
    }],
  };

  // City points stacked bar chart
  const cityPointsCities = cityStats.cities.slice(0, 8); // max 8 for readability
  const barData = {
    labels: cityPointsCities.map((c) => c.cityName),
    datasets: [
      {
        label: "Quiz",
        data: cityPointsCities.map((c) => c.quizPoints),
        backgroundColor: "#3B82F6",
        borderRadius: 4,
      },
      {
        label: "Comments",
        data: cityPointsCities.map((c) => c.commentPoints),
        backgroundColor: "#10B981",
        borderRadius: 4,
      },
      {
        label: "Posts",
        data: cityPointsCities.map((c) => c.postPoints),
        backgroundColor: "#F59E0B",
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#6B7280", font: { family: "Plus Jakarta Sans", size: 12 } } },
      tooltip: { backgroundColor: "#1F2937", titleColor: "#F9FAFB", bodyColor: "#D1D5DB" },
    },
    scales: {
      x: { ticks: { color: "#9CA3AF" }, grid: { color: "rgba(0,0,0,0.04)" } },
      y: { ticks: { color: "#9CA3AF" }, grid: { color: "rgba(0,0,0,0.04)" } },
    },
  };

  const stackedBarOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: { ...chartOptions.scales.x, stacked: true },
      y: { ...chartOptions.scales.y, stacked: true },
    },
  };

  // ── Overall badge ─────────────────────────────────────────────────────────
  const overallBadge = getBadge(cityStats.overallTotal);

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="center-screen">
      <style>{css}</style>
      <Loader2 size={32} className="spin" style={{ color: "#3B82F6" }} />
      <p style={{ marginTop: 12, color: "#6B7280", fontSize: 14 }}>Loading your dashboard…</p>
    </div>
  );

  if (error) return (
    <div className="center-screen">
      <style>{css}</style>
      <div className="error-box"><X size={18} />{error}</div>
    </div>
  );

  const tabs = [
    { id: "overview",  label: "Overview",  icon: <Compass size={15} /> },
    { id: "analytics", label: "Analytics", icon: <TrendingUp size={15} /> },
    { id: "points",    label: "Points",    icon: <Zap size={15} /> },
    { id: "map",       label: "World Map", icon: <Globe size={15} /> },
  ];

  return (
    <div className="app">
      <style>{css}</style>

      {/* ── Sidebar ── */}
      <div className="sidebar">
        <div className="brand">
          <Compass size={20} strokeWidth={2} />
          <span>Explorer</span>
        </div>

        <div className="profile-block">
          <div className="avatar">
            {userData.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="profile-info">
            <p className="profile-name">{userData.name}</p>
            <p className="profile-email">{userData.email}</p>
          </div>
        </div>

        {/* Overall badge */}
        <div
          className="badge-block"
          style={{ background: overallBadge.bg, borderColor: overallBadge.color }}
        >
          <span style={{ fontSize: 20 }}>{overallBadge.emoji}</span>
          <div>
            <p className="badge-label" style={{ color: overallBadge.color }}>{overallBadge.label}</p>
            <p className="badge-pts" style={{ color: overallBadge.color }}>{cityStats.overallTotal} total pts</p>
          </div>
        </div>

        <div className="divider" />

        {/* <div className="divider" /> */}

        <button className="suggest-btn" onClick={() => setIsUploadModalOpen(true)}>
          <UploadCloud size={15} />
          Suggest a City
        </button>

        <div className="divider"/>

        <nav className="nav">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`nav-btn ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="divider" />

        <div className="mini-stats">
          <div className="mini-stat">
            <span className="mini-stat-label">Cities visited</span>
            <span className="mini-stat-val">{userData.citiesVisited || 0}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">Quizzes taken</span>
            <span className="mini-stat-val">{totalQuizzes}</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">Avg quiz score</span>
            <span className="mini-stat-val">{overallAvgScore}%</span>
          </div>
          <div className="mini-stat">
            <span className="mini-stat-label">Overall points</span>
            <span className="mini-stat-val" style={{ color: "#4F46E5" }}>{cityStats.overallTotal}</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

      </div>

      {/* ── Main ── */}
      <main className="main">
        <div className="topbar">
          <div>
            <h1 className="page-title">Hey, {userData.name?.split(" ")[0] || "Explorer"} 👋</h1>
            <p className="page-sub">Here's what's happening with your travels</p>
          </div>
          <div className="tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <motion.div key="overview"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            >
              <div className="stats-row">
                <StatCard icon={<BookOpen size={18} />} label="Quizzes Taken"    value={totalQuizzes}                    color="#3B82F6" delay={0.05} />
                <StatCard icon={<Target size={18} />}   label="Average Score"    value={`${overallAvgScore}%`}           color="#10B981" delay={0.1}  />
                <StatCard icon={<MapPin size={18} />}   label="Cities Explored"  value={userData.citiesVisited || 0}     color="#F59E0B" delay={0.15} />
                <StatCard icon={<Zap size={18} />}      label="Total Points"     value={cityStats.overallTotal}          color="#8B5CF6" delay={0.2}  />
              </div>

              {/* Overall badge card */}
              <div className="card" style={{ marginBottom: 18 }}>
                <div className="card-header">
                  <Award size={16} />
                  <h2>Your Explorer Badge</h2>
                </div>
                <div className="badge-showcase" style={{ background: overallBadge.bg, borderColor: overallBadge.color }}>
                  <span style={{ fontSize: 48 }}>{overallBadge.emoji}</span>
                  <div>
                    <p className="badge-showcase-title" style={{ color: overallBadge.color }}>{overallBadge.label}</p>
                    <p className="badge-showcase-sub">You've earned <strong>{cityStats.overallTotal}</strong> total points across all cities</p>
                    <p className="badge-showcase-hint">
                      {overallBadge.min < 200
                        ? `Earn ${BADGE_TIERS[BADGE_TIERS.findIndex(t => t.min === overallBadge.min) - 1]?.min - cityStats.overallTotal} more pts to reach the next tier`
                        : "You've reached the highest tier! 🎉"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <Globe size={16} />
                  <h2>Your World Map</h2>
                  <span className="badge-pill">{userData.visitedCities?.length || 0} cities</span>
                </div>
                <div className="map-wrap">
                  <UserVisitedMap visitedCities={visitedCitiesWithCoords} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && (
            <motion.div key="analytics"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            >
              <div className="two-col">
                <div className="card">
                  <div className="card-header"><TrendingUp size={16} /><h2>Score Over Time</h2></div>
                  {totalQuizzes > 0
                    ? <div className="chart-box"><Line data={lineData} options={chartOptions} /></div>
                    : <EmptyState />}
                </div>
                <div className="card">
                  <div className="card-header"><Award size={16} /><h2>Avg Score by City</h2></div>
                  {pieData.labels.length > 0
                    ? <div className="pie-box"><Pie data={pieData} options={{ ...chartOptions, scales: undefined }} /></div>
                    : <EmptyState />}
                </div>
              </div>

              {quizResults.length > 0 && (
                <div className="card">
                  <div className="card-header"><BookOpen size={16} /><h2>Recent Quiz Results</h2></div>
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr><th>#</th><th>City</th><th>Score</th><th>Grade</th></tr>
                      </thead>
                      <tbody>
                        {[...quizResults].reverse().slice(0, 8).map((q, i) => (
                          <tr key={i}>
                            <td className="num">{quizResults.length - i}</td>
                            <td>{q.city || "—"}</td>
                            <td><span className="score-chip">{q.score}%</span></td>
                            <td>
                              <span className={`grade ${q.score >= 80 ? "g-a" : q.score >= 60 ? "g-b" : "g-c"}`}>
                                {q.score >= 80 ? "Excellent" : q.score >= 60 ? "Good" : "Keep going"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── POINTS ── */}
          {activeTab === "points" && (
            <motion.div key="points"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            >
              {/* Overall summary row */}
              <div className="stats-row">
                <StatCard icon={<Star size={18} />}          label="Quiz Points"    value={cityStats.cities.reduce((s,c)=>s+c.quizPoints,0)}    color="#3B82F6" delay={0.05} />
                <StatCard icon={<MessageCircle size={18} />} label="Comment Points" value={cityStats.cities.reduce((s,c)=>s+c.commentPoints,0)} color="#10B981" delay={0.1}  />
                <StatCard icon={<FileText size={18} />}      label="Post Points"    value={cityStats.cities.reduce((s,c)=>s+c.postPoints,0)}    color="#F59E0B" delay={0.15} />
                <StatCard icon={<Zap size={18} />}           label="Total Points"   value={cityStats.overallTotal}                               color="#8B5CF6" delay={0.2}  />
              </div>

              {/* Stacked bar chart – points per city */}
              {cityStats.cities.length > 0 ? (
                <div className="card">
                  <div className="card-header"><TrendingUp size={16} /><h2>Points Per City</h2></div>
                  <div className="chart-box chart-tall">
                    <Bar data={barData} options={stackedBarOptions} />
                  </div>
                  <div className="pts-legend">
                    {[
                      { color: "#3B82F6", label: "Quiz (10 pts/correct answer)" },
                      { color: "#10B981", label: "Comment (5 pts each)" },
                      { color: "#F59E0B", label: "Post on city (10 pts each)" },
                    ].map(({ color, label }) => (
                      <span key={label} className="pts-legend-item">
                        <span className="pts-dot" style={{ background: color }} />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card"><EmptyState msg="No points yet — take a quiz, comment or post!" /></div>
              )}

              {/* Per-city breakdown table */}
              {cityStats.cities.length > 0 && (
                <div className="card">
                  <div className="card-header"><Award size={16} /><h2>City Breakdown</h2>
                    <span className="badge-pill">{cityStats.cities.length} cities</span>
                  </div>
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>City</th>
                          <th>Badge</th>
                          <th>Quiz</th>
                          <th>Comments</th>
                          <th>Posts</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cityStats.cities.map((c, i) => {
                          const badge = getBadge(c.total);
                          return (
                            <tr key={c.cityName}>
                              <td className="num">{i + 1}</td>
                              <td><strong>{c.cityName}</strong></td>
                              <td>
                                <span className="badge-inline" style={{ background: badge.bg, color: badge.color }}>
                                  {badge.emoji} {badge.label}
                                </span>
                              </td>
                              <td><span className="score-chip blue">{c.quizPoints}</span></td>
                              <td><span className="score-chip green">{c.commentPoints}</span></td>
                              <td><span className="score-chip amber">{c.postPoints}</span></td>
                              <td><strong className="total-pts">{c.total}</strong></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── MAP ── */}
          {activeTab === "map" && (
            <motion.div key="map"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            >
              <div className="card">
                <div className="card-header">
                  <Globe size={16} /><h2>Explorer's Map</h2>
                  <span className="badge-pill">{userData.visitedCities?.length || 0} destinations</span>
                </div>
                {userData.visitedCities?.length > 0 && (
                  <div className="city-chips">
                    {userData.visitedCities.map((c) => (
                      <span key={c} className="city-chip"><MapPin size={10} />{c}</span>
                    ))}
                  </div>
                )}
                <div className="map-wrap map-lg">
                  <UserVisitedMap visitedCities={visitedCitiesWithCoords} />
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Modal ── */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div className="modal-bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div className="modal"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
            >
              <div className="modal-head">
                <h3>Suggest a City</h3>
                <button className="icon-btn" onClick={closeModal} disabled={isUploading}><X size={17} /></button>
              </div>
              <p className="modal-desc">
                Can't find a city? Submit it and our team will review it for addition.
              </p>
              <form onSubmit={handleUploadCity}>
                <label className="field-label">City name</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. Kyoto, Japan"
                  value={newCityName}
                  onChange={(e) => { setNewCityName(e.target.value); setUploadMessage({ type: "", text: "" }); }}
                  required
                  disabled={isUploading || uploadMessage.type === "success"}
                />
                <AnimatePresence>
                  {uploadMessage.text && (
                    <motion.div
                      className={`feedback ${uploadMessage.type}`}
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    >
                      {uploadMessage.type === "success" ? <CheckCircle size={14} /> : <X size={14} />}
                      {uploadMessage.text}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="modal-actions">
                  <button type="button" className="btn-outline" onClick={closeModal} disabled={isUploading}>Cancel</button>
                  <button type="submit" className="btn-primary"
                    disabled={isUploading || !newCityName.trim() || uploadMessage.type === "success"}
                  >
                    {isUploading && <Loader2 size={14} className="spin" />}
                    {isUploading ? "Submitting…" : "Submit"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmptyState = ({ msg }) => (
  <div className="empty">
    <Compass size={28} style={{ color: "#D1D5DB" }} />
    <p>{msg || "No data yet — start exploring!"}</p>
  </div>
);

// ── CSS ───────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .app {
    display: flex;
    min-height: 100vh;
    background: #F3F4F6;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px;
    color: #111827;
  }

  /* Sidebar */
  .sidebar {
    width: 230px;
    min-height: 100vh;
    background: #fff;
    border-right: 1px solid #E5E7EB;
    display: flex;
    flex-direction: column;
    padding: 24px 16px;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    overflow-y: auto;
  }
  .brand {
    display: flex; align-items: center; gap: 8px;
    font-size: 15px; font-weight: 700; color: #1D4ED8;
    margin-bottom: 24px; padding-left: 4px;
  }
  .profile-block {
    display: flex; align-items: center; gap: 10px;
    padding: 12px; background: #F9FAFB;
    border-radius: 10px; border: 1px solid #E5E7EB;
    margin-bottom: 10px;
  }
  .avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #DBEAFE; color: #1D4ED8;
    font-weight: 700; font-size: 15px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .profile-name { font-weight: 600; font-size: 13px; color: #111827; }
  .profile-email { font-size: 11px; color: #6B7280; margin-top: 1px; word-break: break-all; }

  /* Badge block in sidebar */
  .badge-block {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 10px;
    border: 1.5px solid; margin-bottom: 12px;
  }
  .badge-label { font-size: 12px; font-weight: 700; }
  .badge-pts   { font-size: 11px; font-weight: 500; margin-top: 1px; }

  .divider { height: 1px; background: #F3F4F6; margin: 12px 0; }
  .mini-stats { display: flex; flex-direction: column; gap: 6px; margin-bottom: 4px; }
  .mini-stat {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 10px; border-radius: 8px; background: #F9FAFB;
  }
  .mini-stat-label { font-size: 12px; color: #6B7280; }
  .mini-stat-val { font-size: 13px; font-weight: 600; color: #111827; }
  .nav { display: flex; flex-direction: column; gap: 2px; }
  .nav-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 9px 10px; border-radius: 8px; border: none;
    background: none; color: #6B7280;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13.5px; font-weight: 500;
    cursor: pointer; text-align: left;
    transition: background 0.15s, color 0.15s; width: 100%;
  }
  .nav-btn:hover { background: #F3F4F6; color: #111827; }
  .nav-btn.active { background: #EFF6FF; color: #1D4ED8; font-weight: 600; }
  .suggest-btn {
    display: flex; align-items: center; justify-content: center;
    gap: 7px; padding: 10px; background: #1D4ED8; color: #fff;
    border: none; border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 600; cursor: pointer;
    width: 100%; transition: background 0.15s; margin-top: 8px;
  }
  .suggest-btn:hover { background: #1E40AF; }

  /* Main */
  .main { flex: 1; padding: 28px 28px 48px; min-width: 0; }
  .topbar {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 24px;
    flex-wrap: wrap; gap: 12px;
  }
  .page-title { font-size: 22px; font-weight: 700; color: #111827; }
  .page-sub { font-size: 13px; color: #6B7280; margin-top: 2px; }
  .tabs {
    display: flex; gap: 4px; background: #fff;
    border: 1px solid #E5E7EB; border-radius: 10px; padding: 4px;
  }
  .tab-btn {
    padding: 7px 16px; border-radius: 7px; border: none;
    background: none; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13px; font-weight: 500; color: #6B7280;
    cursor: pointer; transition: all 0.15s;
  }
  .tab-btn:hover { color: #111827; background: #F9FAFB; }
  .tab-btn.active { background: #1D4ED8; color: #fff; font-weight: 600; }

  /* Stat cards */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
    gap: 14px; margin-bottom: 20px;
  }
  .stat-card {
    background: #fff; border: 1px solid #E5E7EB; border-radius: 12px;
    padding: 18px 16px; display: flex; align-items: center; gap: 14px;
    transition: box-shadow 0.15s;
  }
  .stat-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
  .stat-icon-wrap {
    width: 40px; height: 40px; border-radius: 10px;
    background: color-mix(in srgb, var(--c) 12%, transparent);
    color: var(--c);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .stat-label { font-size: 12px; color: #6B7280; font-weight: 500; }
  .stat-value { font-size: 20px; font-weight: 700; color: #111827; margin-top: 2px; }

  /* Badge showcase */
  .badge-showcase {
    display: flex; align-items: center; gap: 20px;
    padding: 20px 24px; border-radius: 12px; border: 2px solid;
    background: #F9FAFB;
  }
  .badge-showcase-title { font-size: 20px; font-weight: 800; }
  .badge-showcase-sub   { font-size: 13px; color: #6B7280; margin-top: 4px; }
  .badge-showcase-hint  { font-size: 11.5px; color: #9CA3AF; margin-top: 4px; }

  /* Card */
  .card {
    background: #fff; border: 1px solid #E5E7EB;
    border-radius: 14px; padding: 22px; margin-bottom: 18px;
  }
  .card-header {
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 18px; color: #374151;
  }
  .card-header h2 { font-size: 15px; font-weight: 600; color: #111827; }
  .badge-pill {
    margin-left: auto; background: #F3F4F6;
    border: 1px solid #E5E7EB; border-radius: 20px;
    padding: 2px 10px; font-size: 11.5px; color: #6B7280; font-weight: 500;
  }

  /* Map */
  .map-wrap { border-radius: 10px; overflow: hidden; min-height: 320px; }
  .map-lg { min-height: 460px; }

  /* City chips */
  .city-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
  .city-chip {
    display: inline-flex; align-items: center; gap: 4px;
    background: #F9FAFB; border: 1px solid #E5E7EB;
    border-radius: 20px; padding: 4px 10px;
    font-size: 12px; color: #374151;
  }
  .city-chip svg { color: #6B7280; }

  /* Charts */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
  .chart-box { height: 240px; }
  .chart-tall { height: 300px; }
  .pie-box { height: 240px; display: flex; align-items: center; justify-content: center; }
  .pie-box canvas { max-height: 240px !important; }

  /* Points legend */
  .pts-legend {
    display: flex; flex-wrap: wrap; gap: 16px;
    padding-top: 14px; border-top: 1px solid #F3F4F6; margin-top: 14px;
  }
  .pts-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6B7280; }
  .pts-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }

  /* Table */
  .table-wrap { overflow-x: auto; }
  .table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
  .table th {
    text-align: left; padding: 9px 12px;
    font-size: 11.5px; text-transform: uppercase;
    letter-spacing: 0.06em; color: #9CA3AF;
    font-weight: 600; border-bottom: 1px solid #F3F4F6;
  }
  .table td { padding: 11px 12px; border-bottom: 1px solid #F9FAFB; color: #374151; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: #FAFAFA; }
  .num { color: #9CA3AF; font-size: 12px; }
  .score-chip {
    background: #EFF6FF; color: #1D4ED8;
    border-radius: 6px; padding: 2px 8px;
    font-size: 12.5px; font-weight: 600;
  }
  .score-chip.blue  { background: #EFF6FF; color: #1D4ED8; }
  .score-chip.green { background: #ECFDF5; color: #065F46; }
  .score-chip.amber { background: #FFFBEB; color: #92400E; }
  .grade { border-radius: 6px; padding: 3px 9px; font-size: 12px; font-weight: 600; }
  .g-a { background: #D1FAE5; color: #065F46; }
  .g-b { background: #DBEAFE; color: #1E40AF; }
  .g-c { background: #FEF3C7; color: #92400E; }
  .badge-inline { border-radius: 6px; padding: 2px 8px; font-size: 11.5px; font-weight: 600; }
  .total-pts { font-size: 14px; color: #4F46E5; }

  /* Modal */
  .modal-bg {
    position: fixed; inset: 0;
    background: rgba(17,24,39,0.4);
    backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center;
    z-index: 50; padding: 20px;
  }
  .modal {
    background: #fff; border: 1px solid #E5E7EB;
    border-radius: 16px; padding: 28px; width: 100%; max-width: 420px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.12);
  }
  .modal-head {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 8px;
  }
  .modal-head h3 { font-size: 16px; font-weight: 700; color: #111827; }
  .icon-btn {
    background: #F3F4F6; border: none; border-radius: 7px;
    color: #6B7280; cursor: pointer; padding: 5px; display: flex;
    transition: background 0.15s;
  }
  .icon-btn:hover { background: #E5E7EB; }
  .modal-desc { font-size: 13px; color: #6B7280; line-height: 1.6; margin-bottom: 20px; }
  .field-label { display: block; font-size: 12.5px; font-weight: 600; color: #374151; margin-bottom: 6px; }
  .field-input {
    width: 100%; padding: 10px 12px;
    border: 1.5px solid #E5E7EB; border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 14px; color: #111827; outline: none;
    transition: border-color 0.15s; background: #fff;
  }
  .field-input:focus { border-color: #3B82F6; }
  .field-input::placeholder { color: #9CA3AF; }
  .field-input:disabled { background: #F9FAFB; cursor: not-allowed; }
  .feedback {
    display: flex; align-items: center; gap: 7px;
    padding: 9px 12px; border-radius: 8px;
    font-size: 13px; font-weight: 500; margin-top: 10px;
  }
  .feedback.success { background: #D1FAE5; color: #065F46; }
  .feedback.error   { background: #FEE2E2; color: #991B1B; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 18px; }
  .btn-outline {
    padding: 9px 18px; border: 1.5px solid #E5E7EB; border-radius: 8px;
    background: #fff; color: #374151;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13.5px; font-weight: 600; cursor: pointer;
    transition: background 0.15s;
  }
  .btn-outline:hover { background: #F9FAFB; }
  .btn-outline:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-primary {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 20px; background: #1D4ED8; color: #fff;
    border: none; border-radius: 8px;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 13.5px; font-weight: 600; cursor: pointer;
    transition: background 0.15s;
  }
  .btn-primary:hover { background: #1E40AF; }
  .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Misc */
  .center-screen {
    min-height: 100vh; background: #F3F4F6;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .error-box {
    display: flex; align-items: center; gap: 8px;
    background: #FEE2E2; color: #991B1B;
    border: 1px solid #FECACA; border-radius: 10px;
    padding: 14px 20px; font-size: 14px; font-weight: 500;
  }
  .empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 10px;
    padding: 40px 20px; color: #9CA3AF;
    font-size: 13.5px; text-align: center;
  }
  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .main { padding: 20px 14px 40px; }
    .stats-row { grid-template-columns: repeat(2, 1fr); }
    .topbar { flex-direction: column; align-items: flex-start; }
  }
`;

export default Admin;