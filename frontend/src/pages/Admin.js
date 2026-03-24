import React, { useEffect, useState, useRef, useContext } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, BarElement, CategoryScale,
  LinearScale, PointElement, ArcElement, Tooltip, Legend,
} from "chart.js";
import {
  MapPin, UploadCloud, Loader2, X, CheckCircle, Award, Target,
  BookOpen, Compass, TrendingUp, Globe, Star, MessageCircle,
  FileText, Zap, Camera, User, Edit3, Save, Trash2, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserVisitedMap from "../components/UserVisitedMap";
import { UserContext } from "../UserContext";

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const simulateUploadCity = (cityName) =>
  new Promise((resolve) => setTimeout(() => resolve({ success: true, message: `${cityName} submitted!` }), 2000));

const BADGE_TIERS = [
  { min: 200, label: "Legend Explorer",  color: "#f87171", bg: "rgba(248,113,113,0.15)", emoji: "🏆" },
  { min: 100, label: "Elite Traveller",  color: "#a78bfa", bg: "rgba(167,139,250,0.15)", emoji: "💎" },
  { min:  50, label: "City Adventurer",  color: "#fbbf24", bg: "rgba(251,191,36,0.15)",  emoji: "⭐" },
  { min:  20, label: "Local Explorer",   color: "#34d399", bg: "rgba(52,211,153,0.15)",  emoji: "🌿" },
  { min:   1, label: "Newcomer",         color: "#60a5fa", bg: "rgba(96,165,250,0.15)",  emoji: "🌱" },
  { min:   0, label: "No Points Yet",    color: "#9ca3af", bg: "rgba(156,163,175,0.15)", emoji: "👤" },
];
const getBadge = (total) => BADGE_TIERS.find((t) => total >= t.min) || BADGE_TIERS[BADGE_TIERS.length - 1];

// ─── Avatar component ──────────────────────────────────────────────────────
function Avatar({ user, size = "sm", className = "" }) {
  const sizeMap = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };
  const dim = sizeMap[size] || sizeMap.sm;
  if (user?.profilePhoto) {
    return (
      <img
        src={user.profilePhoto}
        alt={user.name || "avatar"}
        className={`${dim} rounded-full object-cover border-2 border-violet-500/40 shrink-0 ${className}`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-violet-700 to-pink-600 text-white font-bold flex items-center justify-center shrink-0 ${className}`}>
      {user?.name?.[0]?.toUpperCase() || "U"}
    </div>
  );
}

const StatCard = ({ icon, label, value, color, delay = 0 }) => (
  <motion.div
    className="flex items-center gap-4 bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-4 hover:bg-zinc-800 transition-colors"
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20`, color }}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-zinc-400 font-medium">{label}</p>
      <p className="text-xl font-bold text-zinc-100 mt-0.5">{value}</p>
    </div>
  </motion.div>
);

const EmptyState = ({ msg }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-500 text-sm text-center">
    <Compass size={28} className="text-zinc-600" />
    <p>{msg || "No data yet — start exploring!"}</p>
  </div>
);

const Admin = () => {
  const { user: contextUser, setUser: setContextUser } = useContext(UserContext);
  const [userData, setUserData]                               = useState(null);
  const [quizResults, setQuizResults]                         = useState([]);
  const [cityStats, setCityStats]                             = useState({ cities: [], overallTotal: 0 });
  const [visitedCitiesWithCoords, setVisitedCitiesWithCoords] = useState([]);
  const [error, setError]                                     = useState("");
  const [loading, setLoading]                                 = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen]             = useState(false);
  const [newCityName, setNewCityName]                         = useState("");
  const [isUploading, setIsUploading]                         = useState(false);
  const [uploadMessage, setUploadMessage]                     = useState({ type: "", text: "" });
  const [activeTab, setActiveTab]                             = useState("overview");

  // Profile photo
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Edit profile state
  const [isEditing, setIsEditing]         = useState(false);
  const [editForm, setEditForm]           = useState({ name: "", bio: "", defaultCity: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg]       = useState({ type: "", text: "" });

  // Activity (my posts & comments)
  const [userPosts, setUserPosts]                   = useState([]);
  const [activityLoading, setActivityLoading]       = useState(false);
  const [activityTab, setActivityTab]               = useState("posts");
  const [deletingPostId, setDeletingPostId]         = useState(null);
  const [deletingCommentKey, setDeletingCommentKey] = useState(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userRes, quizRes, cityRes] = await Promise.all([
          fetch("http://localhost:8000/api/auth/get_user", { credentials: "include" }),
          fetch("http://localhost:8000/api/submit_quiz/get_quiz", { credentials: "include" }),
          fetch("http://localhost:8000/api/city-points/my-stats", { credentials: "include" }),
        ]);
        const userData = await userRes.json();
        const quizData = await quizRes.json();
        const cityData = await cityRes.json();
        if (userRes.ok) setUserData(userData.user);
        else setError(userData.error || "User not found");
        if (quizRes.ok) setQuizResults(quizData || []);
        if (cityRes.ok) setCityStats(cityData);
      } catch { setError("Something went wrong."); }
      finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!userData?.visitedCities?.length) return;
    fetch("http://localhost:8000/api/geocode-cities", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cities: userData.visitedCities }),
    }).then(r => r.json()).then(setVisitedCitiesWithCoords).catch(console.error);
  }, [userData]);

  // Sync edit form when userData loads
  useEffect(() => {
    if (userData) {
      setEditForm({ name: userData.name || "", bio: userData.bio || "", defaultCity: userData.defaultCity || "" });
    }
  }, [userData]);

  // Track my comments separately from posts
  const [myCommentsList, setMyCommentsList] = useState([]);

  // Fetch user posts + comments when activity tab is opened
  useEffect(() => {
    if (activeTab !== "activity") return;
    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const [postsRes, commentsRes] = await Promise.all([
          fetch("http://localhost:8000/api/community/my-posts", { credentials: "include" }),
          fetch("http://localhost:8000/api/community/my-comments", { credentials: "include" }),
        ]);
        if (postsRes.ok) setUserPosts(await postsRes.json());
        if (commentsRes.ok) setMyCommentsList(await commentsRes.json());
      } catch (e) { console.error(e); }
      finally { setActivityLoading(false); }
    };
    fetchActivity();
  }, [activeTab]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleUploadCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    setIsUploading(true); setUploadMessage({ type: "", text: "" });
    try {
      const result = await simulateUploadCity(newCityName.trim());
      setUploadMessage({ type: "success", text: result.message });
      setNewCityName("");
      setTimeout(() => setIsUploadModalOpen(false), 2000);
    } catch { setUploadMessage({ type: "error", text: "Upload failed." }); }
    finally { setIsUploading(false); }
  };

  const closeModal = () => { setIsUploadModalOpen(false); setNewCityName(""); setUploadMessage({ type: "", text: "" }); };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("http://localhost:8000/api/auth/upload-photo", {
        method: "POST", credentials: "include", body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(prev => ({ ...prev, profilePhoto: data.photoUrl }));
        if (setContextUser) setContextUser(prev => ({ ...prev, profilePhoto: data.photoUrl }));
      }
    } catch (err) { console.error("Photo upload failed:", err); }
    finally { setPhotoUploading(false); }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true); setProfileMsg({ type: "", text: "" });
    try {
      const res = await fetch("http://localhost:8000/api/auth/update-profile", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setUserData(prev => ({ ...prev, ...editForm }));
        if (setContextUser) setContextUser(prev => ({ ...prev, ...editForm }));
        setProfileMsg({ type: "success", text: "Profile updated successfully!" });
        setTimeout(() => { setIsEditing(false); setProfileMsg({ type: "", text: "" }); }, 1500);
      } else {
        setProfileMsg({ type: "error", text: "Failed to update profile." });
      }
    } catch { setProfileMsg({ type: "error", text: "Something went wrong." }); }
    finally { setProfileSaving(false); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) return;
    setDeletingPostId(postId);
    try {
      await fetch(`http://localhost:8000/api/community/${postId}`, { method: "DELETE", credentials: "include" });
      setUserPosts(prev => prev.filter(p => p._id?.toString() !== postId.toString()));
    } catch (e) { console.error(e); }
    finally { setDeletingPostId(null); }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    const key = `${postId}-${commentId}`;
    setDeletingCommentKey(key);
    try {
      await fetch(`http://localhost:8000/api/community/${postId}/comment/${commentId}`, {
        method: "DELETE", credentials: "include",
      });
      setUserPosts(prev => prev.map(p => {
        if (p._id?.toString() !== postId.toString()) return p;
        return { ...p, comments: p.comments.filter(c => c._id?.toString() !== commentId.toString()) };
      }));
    } catch (e) { console.error(e); }
    finally { setDeletingCommentKey(null); }
  };

  // ── Derived quiz data ──────────────────────────────────────────────────────
  const cityPerformance = quizResults.reduce((acc, { city, score }) => {
    if (!acc[city]) acc[city] = { totalScore: 0, count: 0 };
    acc[city].totalScore += score; acc[city].count++;
    return acc;
  }, {});
  const totalQuizzes = quizResults.length;
  const overallAvgScore = totalQuizzes > 0
    ? (quizResults.reduce((s, q) => s + (q.totalQuestions ? Math.round((q.score / q.totalQuestions) * 100) : q.score), 0) / totalQuizzes).toFixed(1) : 0;

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#9ca3af", font: { size: 12 } } },
      tooltip: { backgroundColor: "#27272a", titleColor: "#f4f4f5", bodyColor: "#a1a1aa" },
    },
    scales: {
      x: { ticks: { color: "#6b7280" }, grid: { color: "rgba(255,255,255,0.04)" } },
      y: { ticks: { color: "#6b7280" }, grid: { color: "rgba(255,255,255,0.04)" } },
    },
  };

  const lineData = {
    labels: quizResults.map((q, i) => q.date ? new Date(q.date).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : `Quiz ${i + 1}`),
    datasets: [{ label: "Score (%)", data: quizResults.map(q => q.totalQuestions ? Math.round((q.score / q.totalQuestions) * 100) : q.score), fill: true, backgroundColor: "rgba(139,92,246,0.08)", borderColor: "#8b5cf6", pointBackgroundColor: "#8b5cf6", pointRadius: 4, tension: 0.4 }],
  };
  const cityPointsCities = cityStats.cities.slice(0, 8);
  const barData = {
    labels: cityPointsCities.map(c => c.cityName),
    datasets: [
      { label: "Quiz",     data: cityPointsCities.map(c => c.quizPoints),    backgroundColor: "#8b5cf6", borderRadius: 4 },
      { label: "Comments", data: cityPointsCities.map(c => c.commentPoints), backgroundColor: "#34d399", borderRadius: 4 },
      { label: "Posts",    data: cityPointsCities.map(c => c.postPoints),    backgroundColor: "#fbbf24", borderRadius: 4 },
    ],
  };
  const stackedBarOptions = { ...chartOptions, scales: { ...chartOptions.scales, x: { ...chartOptions.scales.x, stacked: true }, y: { ...chartOptions.scales.y, stacked: true } } };

  const overallBadge = getBadge(cityStats.overallTotal);

  const tabs = [
    { id: "overview",  label: "Overview",    icon: <Compass size={14} /> },
    { id: "analytics", label: "Analytics",   icon: <TrendingUp size={14} /> },
    { id: "map",       label: "World Map",   icon: <Globe size={14} /> },
    { id: "profile",   label: "Profile",     icon: <User size={14} /> },
    { id: "activity",  label: "My Activity", icon: <FileText size={14} /> },
  ];

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-3">
      <Loader2 size={28} className="text-violet-400 animate-spin" />
      <p className="text-sm text-zinc-400">Loading your dashboard…</p>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="flex items-center gap-2 bg-red-900/30 text-red-300 border border-red-800/50 rounded-xl px-5 py-3 text-sm font-medium">
        <X size={16} />{error}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-zinc-900 text-zinc-100 font-sans">

      {/* ── Sidebar ── */}
      <div className="w-[230px] shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col px-3 py-5 sticky top-0 h-screen overflow-y-auto hidden md:flex">
        {/* Brand */}
        <div className="flex items-center gap-2 px-2 mb-5">
          <Compass size={18} className="text-violet-400" />
          <span className="text-sm font-bold text-zinc-100">Explorer</span>
        </div>

        {/* Profile block — centred with medium avatar */}
        <div className="bg-zinc-800/70 border border-zinc-700/60 rounded-xl p-3 mb-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="relative">
              <Avatar user={userData} size="lg" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors shadow-lg"
                title="Change photo"
              >
                {photoUploading ? <Loader2 size={10} className="animate-spin text-white" /> : <Camera size={10} className="text-white" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div className="min-w-0 w-full">
              <p className="text-sm font-semibold text-zinc-100 truncate">{userData.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{userData.email}</p>
              {userData.bio && <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{userData.bio}</p>}
            </div>
            <button
              onClick={() => setActiveTab("profile")}
              className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors"
            >
              <Edit3 size={9} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Badge */}
        <div className="rounded-xl px-3 py-2.5 mb-3 border flex items-center gap-2.5" style={{ background: overallBadge.bg, borderColor: `${overallBadge.color}40` }}>
          <span className="text-lg">{overallBadge.emoji}</span>
          <div>
            <p className="text-xs font-bold" style={{ color: overallBadge.color }}>{overallBadge.label}</p>
            <p className="text-[10px] mt-0.5" style={{ color: overallBadge.color }}>{cityStats.overallTotal} pts</p>
          </div>
        </div>

        <div className="h-px bg-zinc-800 mb-3" />

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full py-2 bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold rounded-lg transition-colors mb-3"
        >
          <UploadCloud size={13} /> Suggest a City
        </button>

        <div className="h-px bg-zinc-800 mb-3" />

        <nav className="flex flex-col gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left w-full ${
                activeTab === t.id ? "bg-violet-900/50 text-violet-300 border border-violet-800/50" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </nav>

        <div className="h-px bg-zinc-800 my-3" />

        <div className="flex flex-col gap-1.5">
          {[
            { label: "Cities visited", val: userData.citiesVisited || 0 },
            { label: "Quizzes taken",  val: totalQuizzes },
            { label: "Avg score",      val: `${overallAvgScore}%` },
            { label: "Total points",   val: cityStats.overallTotal, highlight: true },
          ].map(({ label, val, highlight }) => (
            <div key={label} className="flex justify-between items-center bg-zinc-800/50 rounded-lg px-2.5 py-2">
              <span className="text-[11px] text-zinc-400">{label}</span>
              <span className={`text-xs font-bold ${highlight ? "text-violet-400" : "text-zinc-200"}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 px-5 py-6 lg:px-8">
        {/* Topbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Hey, {userData.name?.split(" ")[0] || "Explorer"} 👋</h1>
            <p className="text-xs text-zinc-500 mt-1">Here's what's happening with your travels</p>
          </div>
          <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-xl p-1 flex-wrap">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === t.id ? "bg-violet-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

              {/* Profile banner */}
              <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl overflow-hidden mb-5">
                <div className="h-16 bg-gradient-to-r from-violet-900 to-pink-900/60" />
                <div className="px-6 pb-5">
                  <div className="flex items-end gap-4 -mt-8 mb-4">
                    <div className="relative">
                      <Avatar user={userData} size="xl" className="border-4 border-zinc-800 shadow-xl" />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors shadow-lg border-2 border-zinc-800"
                        title="Change photo"
                      >
                        {photoUploading ? <Loader2 size={11} className="animate-spin text-white" /> : <Camera size={11} className="text-white" />}
                      </button>
                    </div>
                    <div className="pb-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-bold text-zinc-100">{userData.name}</h2>
                        <span className="text-xs px-2 py-0.5 rounded-full border" style={{ background: overallBadge.bg, color: overallBadge.color, borderColor: `${overallBadge.color}40` }}>
                          {overallBadge.emoji} {overallBadge.label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">{userData.email}</p>
                      {userData.bio && <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{userData.bio}</p>}
                    </div>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-400 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:text-zinc-200 transition-colors shrink-0"
                    >
                      <Edit3 size={12} /> Edit Profile
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Cities",   val: userData.citiesVisited || 0 },
                      { label: "Quizzes",  val: totalQuizzes },
                      { label: "Avg Score", val: `${overallAvgScore}%` },
                      { label: "Points",   val: cityStats.overallTotal },
                    ].map(({ label, val }) => (
                      <div key={label} className="text-center bg-zinc-700/30 rounded-xl py-2.5">
                        <p className="text-base font-bold text-zinc-100">{val}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <StatCard icon={<BookOpen size={17} />} label="Quizzes Taken"   value={totalQuizzes}               color="#8b5cf6" delay={0.05} />
                <StatCard icon={<Target size={17} />}   label="Average Score"   value={`${overallAvgScore}%`}      color="#34d399" delay={0.1}  />
                <StatCard icon={<MapPin size={17} />}   label="Cities Explored" value={userData.citiesVisited || 0} color="#fbbf24" delay={0.15} />
                <StatCard icon={<Zap size={17} />}      label="Total Points"    value={cityStats.overallTotal}     color="#f472b6" delay={0.2}  />
              </div>

              {/* Badge card */}
              <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={15} className="text-zinc-400" />
                  <h2 className="text-sm font-semibold text-zinc-200">Your Explorer Badge</h2>
                </div>
                <div className="flex items-center gap-5 p-4 rounded-xl border" style={{ background: overallBadge.bg, borderColor: `${overallBadge.color}40` }}>
                  <span className="text-5xl">{overallBadge.emoji}</span>
                  <div>
                    <p className="text-lg font-black" style={{ color: overallBadge.color }}>{overallBadge.label}</p>
                    <p className="text-xs text-zinc-400 mt-1">You've earned <strong className="text-zinc-200">{cityStats.overallTotal}</strong> total points</p>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      {overallBadge.min < 200
                        ? `${BADGE_TIERS[BADGE_TIERS.findIndex(t => t.min === overallBadge.min) - 1]?.min - cityStats.overallTotal} more pts to next tier`
                        : "Highest tier reached! 🎉"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={15} className="text-zinc-400" />
                  <h2 className="text-sm font-semibold text-zinc-200">Your World Map</h2>
                  <span className="ml-auto text-[10px] bg-zinc-700 border border-zinc-600 rounded-full px-2.5 py-0.5 text-zinc-300">{userData.visitedCities?.length || 0} cities</span>
                </div>
                <div className="rounded-xl overflow-hidden" style={{ minHeight: "320px" }}>
                  <UserVisitedMap visitedCities={visitedCitiesWithCoords} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS ── */}
          {activeTab === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                <StatCard icon={<Star size={17} />}          label="Quiz Points"    value={cityStats.cities.reduce((s,c)=>s+c.quizPoints,0)}    color="#8b5cf6" delay={0.05} />
                <StatCard icon={<MessageCircle size={17} />} label="Comment Points" value={cityStats.cities.reduce((s,c)=>s+c.commentPoints,0)} color="#34d399" delay={0.1}  />
                <StatCard icon={<FileText size={17} />}      label="Post Points"    value={cityStats.cities.reduce((s,c)=>s+c.postPoints,0)}    color="#fbbf24" delay={0.15} />
                <StatCard icon={<Zap size={17} />}           label="Total Points"   value={cityStats.overallTotal}                               color="#f472b6" delay={0.2}  />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4"><TrendingUp size={14} className="text-zinc-400" /><h2 className="text-sm font-semibold text-zinc-200">Score Over Time</h2></div>
                  {totalQuizzes > 0
                    ? <div className="h-52"><Line data={lineData} options={chartOptions} /></div>
                    : <EmptyState msg="Take a quiz to see your score trend" />}
                </div>
                {/* City points comparison — horizontal bar style */}
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4"><Award size={14} className="text-zinc-400" /><h2 className="text-sm font-semibold text-zinc-200">City Points Comparison</h2></div>
                  {cityStats.cities.length > 0 ? (
                    <div className="flex flex-col gap-2.5 overflow-y-auto" style={{maxHeight:"208px"}}>
                      {cityStats.cities.slice(0,8).map((c) => {
                        const max = Math.max(...cityStats.cities.map(x=>x.total), 1);
                        const pct = Math.round((c.total / max) * 100);
                        const badge = getBadge(c.total);
                        return (
                          <div key={c.cityName}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold text-zinc-300 truncate max-w-[120px]">{c.cityName}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px]">{badge.emoji}</span>
                                <span className="text-xs font-bold" style={{color: badge.color}}>{c.total} pts</span>
                              </div>
                            </div>
                            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500"
                                style={{width:`${pct}%`, background:`linear-gradient(90deg, #8b5cf6, #ec4899)`}} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : <EmptyState msg="Earn points in cities to compare" />}
                </div>
              </div>

              {cityStats.cities.length > 0 && (
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4"><TrendingUp size={14} className="text-zinc-400" /><h2 className="text-sm font-semibold text-zinc-200">Points Per City</h2></div>
                  <div className="h-64"><Bar data={barData} options={stackedBarOptions} /></div>
                  <div className="flex flex-wrap gap-4 pt-4 mt-4 border-t border-zinc-700/50">
                    {[{ color: "#8b5cf6", label: "Quiz (10 pts/correct)" }, { color: "#34d399", label: "Comment (5 pts each)" }, { color: "#fbbf24", label: "Post (10 pts each)" }].map(({ color, label }) => (
                      <span key={label} className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />{label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {quizResults.length > 0 && (
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4"><BookOpen size={14} className="text-zinc-400" /><h2 className="text-sm font-semibold text-zinc-200">Recent Quiz Results</h2></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-700/50">
                          {["#","City","Score","Grade"].map(h => <th key={h} className="text-left py-2 px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[...quizResults].reverse().slice(0,8).map((q,i) => (
                          <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-700/20 transition-colors">
                            <td className="py-2.5 px-3 text-zinc-500 text-xs">{quizResults.length-i}</td>
                            <td className="py-2.5 px-3 text-zinc-200">{q.city||"—"}</td>
                            <td className="py-2.5 px-3"><span className="text-xs font-semibold bg-violet-900/50 text-violet-300 border border-violet-800/50 rounded-md px-2 py-0.5">{q.score}%</span></td>
                            <td className="py-2.5 px-3">
                              <span className={`text-xs font-semibold rounded-md px-2 py-0.5 ${q.score>=80?"bg-emerald-900/40 text-emerald-300 border border-emerald-800/40":q.score>=60?"bg-blue-900/40 text-blue-300 border border-blue-800/40":"bg-amber-900/40 text-amber-300 border border-amber-800/40"}`}>
                                {q.score>=80?"Excellent":q.score>=60?"Good":"Keep going"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {cityStats.cities.length > 0 && (
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={14} className="text-zinc-400" /><h2 className="text-sm font-semibold text-zinc-200">City Breakdown</h2>
                    <span className="ml-auto text-[10px] bg-zinc-700 border border-zinc-600 rounded-full px-2.5 py-0.5 text-zinc-300">{cityStats.cities.length} cities</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-700/50">
                          {["#","City","Badge","Quiz","Comments","Posts","Total"].map(h => <th key={h} className="text-left py-2 px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {cityStats.cities.map((c,i) => {
                          const badge = getBadge(c.total);
                          return (
                            <tr key={c.cityName} className="border-b border-zinc-800/50 hover:bg-zinc-700/20 transition-colors">
                              <td className="py-2.5 px-3 text-zinc-500 text-xs">{i+1}</td>
                              <td className="py-2.5 px-3 font-semibold text-zinc-200">{c.cityName}</td>
                              <td className="py-2.5 px-3"><span className="text-xs font-semibold rounded-md px-2 py-0.5 border" style={{ background: badge.bg, color: badge.color, borderColor:`${badge.color}40` }}>{badge.emoji} {badge.label}</span></td>
                              <td className="py-2.5 px-3"><span className="text-xs font-semibold bg-violet-900/40 text-violet-300 border border-violet-800/40 rounded-md px-2 py-0.5">{c.quizPoints}</span></td>
                              <td className="py-2.5 px-3"><span className="text-xs font-semibold bg-emerald-900/40 text-emerald-300 border border-emerald-800/40 rounded-md px-2 py-0.5">{c.commentPoints}</span></td>
                              <td className="py-2.5 px-3"><span className="text-xs font-semibold bg-amber-900/40 text-amber-300 border border-amber-800/40 rounded-md px-2 py-0.5">{c.postPoints}</span></td>
                              <td className="py-2.5 px-3 font-bold text-violet-400">{c.total}</td>
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
            <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={15} className="text-zinc-400" /><h2 className="text-sm font-semibold text-zinc-200">Explorer's Map</h2>
                  <span className="ml-auto text-[10px] bg-zinc-700 border border-zinc-600 rounded-full px-2.5 py-0.5 text-zinc-300">{userData.visitedCities?.length || 0} destinations</span>
                </div>
                {userData.visitedCities?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {userData.visitedCities.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 bg-zinc-700/60 border border-zinc-600/60 text-zinc-300 text-[11px] font-medium rounded-full px-2.5 py-1">
                        <MapPin size={9} className="text-violet-400" />{c}
                      </span>
                    ))}
                  </div>
                )}
                <div className="rounded-xl overflow-hidden" style={{ minHeight: "460px" }}>
                  <UserVisitedMap visitedCities={visitedCitiesWithCoords} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="max-w-2xl">

                {/* Photo section */}
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl overflow-hidden mb-4">
                  <div className="h-20 bg-gradient-to-r from-violet-900 to-pink-900/60" />
                  <div className="px-6 pb-6">
                    <div className="flex items-end gap-5 -mt-10 mb-5">
                      <div className="relative">
                        <Avatar user={userData} size="xl" className="border-4 border-zinc-800 shadow-2xl" />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors shadow-lg border-2 border-zinc-800"
                          title="Change photo"
                        >
                          {photoUploading ? <Loader2 size={12} className="animate-spin text-white" /> : <Camera size={12} className="text-white" />}
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </div>
                      <div className="pb-1">
                        <h2 className="text-xl font-bold text-zinc-100">{userData.name}</h2>
                        <p className="text-xs text-zinc-500">{userData.email}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Member since {new Date(userData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}</p>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">Click the camera icon to upload a new profile photo</p>
                  </div>
                </div>

                {/* Edit form */}
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Edit3 size={15} className="text-zinc-400" />
                      <h2 className="text-sm font-semibold text-zinc-200">Edit Profile</h2>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => { setIsEditing(true); setProfileMsg({ type: "", text: "" }); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-400 border border-violet-800/60 rounded-lg hover:bg-violet-900/30 transition-colors"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Display Name</label>
                      {isEditing ? (
                        <input value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-zinc-700/60 border border-zinc-600 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
                          placeholder="Your name" />
                      ) : (
                        <p className="text-sm text-zinc-200 bg-zinc-700/30 px-3 py-2.5 rounded-xl border border-zinc-700/40">{userData.name || "—"}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Email <span className="text-zinc-600 font-normal">(cannot be changed)</span></label>
                      <p className="text-sm text-zinc-400 bg-zinc-800/40 px-3 py-2.5 rounded-xl border border-zinc-700/30">{userData.email}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Bio</label>
                      {isEditing ? (
                        <textarea value={editForm.bio} onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                          rows={3} className="w-full px-3 py-2.5 bg-zinc-700/60 border border-zinc-600 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition resize-none"
                          placeholder="Tell us a bit about yourself…" />
                      ) : (
                        <p className="text-sm text-zinc-300 bg-zinc-700/30 px-3 py-2.5 rounded-xl border border-zinc-700/40 min-h-[56px]">
                          {userData.bio || <span className="text-zinc-600">No bio added yet</span>}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Home City</label>
                      {isEditing ? (
                        <input value={editForm.defaultCity} onChange={e => setEditForm(prev => ({ ...prev, defaultCity: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-zinc-700/60 border border-zinc-600 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
                          placeholder="e.g. Mumbai, India" />
                      ) : (
                        <p className="text-sm text-zinc-200 bg-zinc-700/30 px-3 py-2.5 rounded-xl border border-zinc-700/40">
                          {userData.defaultCity || <span className="text-zinc-600">Not set</span>}
                        </p>
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {profileMsg.text && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`flex items-center gap-2 text-xs font-medium mt-4 px-3 py-2.5 rounded-lg border ${profileMsg.type === "success" ? "bg-emerald-900/30 text-emerald-300 border-emerald-800/50" : "bg-red-900/30 text-red-300 border-red-800/50"}`}
                      >
                        {profileMsg.type === "success" ? <CheckCircle size={13} /> : <X size={13} />}{profileMsg.text}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isEditing && (
                    <div className="flex justify-end gap-2 mt-5">
                      <button
                        onClick={() => { setIsEditing(false); setEditForm({ name: userData.name || "", bio: userData.bio || "", defaultCity: userData.defaultCity || "" }); setProfileMsg({ type: "", text: "" }); }}
                        disabled={profileSaving}
                        className="px-4 py-2 text-xs font-semibold text-zinc-300 border border-zinc-600 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-40"
                      >Cancel</button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={profileSaving || !editForm.name.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
                      >
                        {profileSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                        {profileSaving ? "Saving…" : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ACTIVITY ── */}
          {activeTab === "activity" && (
            <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

              {/* Sub-tabs */}
              <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-xl p-1 w-fit mb-5">
                {[
                  { id: "posts",    label: "My Posts",    icon: <FileText size={13} /> },
                  { id: "comments", label: "My Comments", icon: <MessageSquare size={13} /> },
                ].map(t => (
                  <button key={t.id} onClick={() => setActivityTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activityTab === t.id ? "bg-violet-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >{t.icon}{t.label}</button>
                ))}
              </div>

              {activityLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Loader2 size={24} className="text-violet-400 animate-spin" />
                  <p className="text-xs text-zinc-500">Loading activity…</p>
                </div>
              ) : (
                <>
                  {/* MY POSTS */}
                  {activityTab === "posts" && (
                    <div className="space-y-3">
                      {userPosts.length === 0 ? (
                        <EmptyState msg="You haven't posted anything yet — share a city story in the Community!" />
                      ) : (
                        userPosts.map(post => (
                          <div key={post._id} className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl p-4 hover:border-zinc-600/70 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <Avatar user={userData} size="md" />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-zinc-100">{userData.name}</span>
                                    <span className="inline-flex items-center gap-1 bg-orange-900/30 border border-orange-800/40 text-orange-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                      <MapPin size={9} />{post.city}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-zinc-500 mt-0.5">{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeletePost(post._id)}
                                disabled={deletingPostId === post._id}
                                className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors shrink-0 disabled:opacity-40"
                                title="Delete post"
                              >
                                {deletingPostId === post._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed mt-3">{post.content}</p>
                            {post.image && (
                              <img src={post.image} alt="post" className="mt-3 rounded-xl w-full max-h-52 object-cover border border-zinc-700/50" />
                            )}
                            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-700/40 text-xs text-zinc-500">
                              <span>👍 {post.likes?.length || 0} likes</span>
                              <span className="flex items-center gap-1"><MessageSquare size={12} />{post.comments?.length || 0} comments</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* MY COMMENTS */}
                  {activityTab === "comments" && (
                    <div className="space-y-3">
                      {myCommentsList.length === 0 ? (
                        <EmptyState msg="No comments found. Comments you leave on posts will appear here." />
                      ) : (
                        myCommentsList.map(comment => {
                          const key = `${comment.postId}-${comment._id}`;
                          return (
                            <div key={String(key)} className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl p-4 hover:border-zinc-600/70 transition-colors">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Avatar user={userData} size="md" />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="text-sm font-semibold text-zinc-100">{userData.name}</span>
                                      <span className="inline-flex items-center gap-1 bg-orange-900/30 border border-orange-800/40 text-orange-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                        <MapPin size={9} />{comment.postCity}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-600 mt-0.5 truncate">on: {comment.postContent?.slice(0, 60)}…</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteComment(comment.postId, comment._id)}
                                  disabled={deletingCommentKey === key}
                                  className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors shrink-0 disabled:opacity-40"
                                  title="Delete comment"
                                >
                                  {deletingCommentKey === key ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                              </div>
                              <div className="mt-3 bg-zinc-700/40 rounded-xl px-3 py-2.5 border border-zinc-700/30">
                                <p className="text-sm text-zinc-300">{comment.text}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ── Upload Modal ── */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }} transition={{ type: "spring", stiffness: 280, damping: 24 }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-bold text-zinc-100">Suggest a City</h3>
                <button onClick={closeModal} disabled={isUploading} className="p-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed mb-4">Can't find a city? Submit it and our team will review it for addition.</p>
              <form onSubmit={handleUploadCity}>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">City name</label>
                <input type="text" placeholder="e.g. Kyoto, Japan" value={newCityName}
                  onChange={e => { setNewCityName(e.target.value); setUploadMessage({ type: "", text: "" }); }}
                  required disabled={isUploading || uploadMessage.type === "success"}
                  className="w-full px-3 py-2.5 bg-zinc-700/80 border border-zinc-600 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition disabled:opacity-50"
                />
                <AnimatePresence>
                  {uploadMessage.text && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`flex items-center gap-2 text-xs font-medium mt-3 px-3 py-2.5 rounded-lg border ${uploadMessage.type==="success"?"bg-emerald-900/30 text-emerald-300 border-emerald-800/50":"bg-red-900/30 text-red-300 border-red-800/50"}`}
                    >
                      {uploadMessage.type==="success"?<CheckCircle size={13}/>:<X size={13}/>}{uploadMessage.text}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={closeModal} disabled={isUploading}
                    className="px-4 py-2 text-sm font-semibold text-zinc-300 border border-zinc-600 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-40">Cancel</button>
                  <button type="submit" disabled={isUploading || !newCityName.trim() || uploadMessage.type==="success"}
                    className="flex items-center gap-1.5 px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40">
                    {isUploading && <Loader2 size={13} className="animate-spin" />}
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

export default Admin;  