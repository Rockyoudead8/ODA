import React, { useEffect, useState, useRef, useContext } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, LineElement, BarElement, CategoryScale,
  LinearScale, PointElement, Tooltip, Legend,
} from "chart.js";
import {
  MapPin, UploadCloud, Loader2, X, CheckCircle,
  Compass, TrendingUp, Globe, User, FileText, Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserVisitedMap from "../components/UserVisitedMap";
import { UserContext } from "../UserContext";

import { Avatar, getBadge } from "../components/Admin/AdminShared";
import AdminOverview  from "../components/Admin/AdminOverview";
import AdminAnalytics from "../components/Admin/AdminAnalytics";
import AdminProfile   from "../components/Admin/AdminProfile";
import AdminActivity  from "../components/Admin/AdminActivity";
import { BACKEND_URL } from '../utils/config';

ChartJS.register(LineElement, BarElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const simulateUploadCity = (cityName) =>
  new Promise((resolve) => setTimeout(() => resolve({ success: true, message: `${cityName} submitted!` }), 2000));

const Admin = () => {
  const { user: contextUser, setUser: setContextUser } = useContext(UserContext);

  const [userData,                setUserData]                = useState(null);
  const [quizResults,             setQuizResults]             = useState([]);
  const [cityStats,               setCityStats]               = useState({ cities: [], overallTotal: 0 });
  const [visitedCitiesWithCoords, setVisitedCitiesWithCoords] = useState([]);
  const [error,                   setError]                   = useState("");
  const [loading,                 setLoading]                 = useState(true);
  const [isUploadModalOpen,       setIsUploadModalOpen]       = useState(false);
  const [newCityName,             setNewCityName]             = useState("");
  const [isUploading,             setIsUploading]             = useState(false);
  const [uploadMessage,           setUploadMessage]           = useState({ type: "", text: "" });
  const [activeTab,               setActiveTab]               = useState("overview");
  const [photoUploading,          setPhotoUploading]          = useState(false);
  const fileInputRef = useRef(null);

  const [isEditing,     setIsEditing]     = useState(false);
  const [editForm,      setEditForm]      = useState({ name: "", bio: "", defaultCity: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg,    setProfileMsg]    = useState({ type: "", text: "" });

  const [userPosts,          setUserPosts]          = useState([]);
  const [activityLoading,    setActivityLoading]    = useState(false);
  const [activityTab,        setActivityTab]        = useState("posts");
  const [deletingPostId,     setDeletingPostId]     = useState(null);
  const [deletingCommentKey, setDeletingCommentKey] = useState(null);
  const [myCommentsList,     setMyCommentsList]     = useState([]);

  // ── Initial data fetch ────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [userRes, quizRes, cityRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/auth/get_user`,          { credentials: "include" }),
          fetch(`${BACKEND_URL}/api/submit_quiz/get_quiz`,   { credentials: "include" }),
          fetch(`${BACKEND_URL}/api/city-points/my-stats`,   { credentials: "include" }),
        ]);

        const userData = await userRes.json();
        const quizData = await quizRes.json();
        const cityData = await cityRes.json();

        if (userRes.ok) setUserData(userData.user ?? userData);
        else { setError(userData.error || "Could not load user."); return; }

        if (quizRes.ok) setQuizResults(Array.isArray(quizData) ? quizData : []);
        if (cityRes.ok) setCityStats(cityData?.cities ? cityData : { cities: [], overallTotal: 0 });

      } catch (e) {
        console.error("Admin fetch error:", e);
        setError("Something went wrong loading your dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (userData) {
      setEditForm({
        name:        userData.name        || "",
        bio:         userData.bio         || "",
        defaultCity: userData.defaultCity || "",
      });
    }
  }, [userData]);

  useEffect(() => {
    if (!userData?.visitedCities?.length) return;
    fetch(`${BACKEND_URL}/api/geocode-cities`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cities: userData.visitedCities }),
    })
      .then(r => r.json())
      .then(setVisitedCitiesWithCoords)
      .catch(console.error);
  }, [userData]);

  useEffect(() => {
    if (activeTab !== "activity") return;
    const fetchActivity = async () => {
      setActivityLoading(true);
      try {
        const [postsRes, commentsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/community/my-posts`,    { credentials: "include" }),
          fetch(`${BACKEND_URL}/api/community/my-comments`, { credentials: "include" }),
        ]);
        setUserPosts(postsRes.ok     ? await postsRes.json()    : []);
        setMyCommentsList(commentsRes.ok ? await commentsRes.json() : []);
      } catch (_) {}
      finally { setActivityLoading(false); }
    };
    fetchActivity();
  }, [activeTab]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleUploadCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    setIsUploading(true);
    try {
      const result = await simulateUploadCity(newCityName.trim());
      setUploadMessage({ type: "success", text: result.message });
    } catch {
      setUploadMessage({ type: "error", text: "Failed to submit. Try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setNewCityName("");
    setUploadMessage({ type: "", text: "" });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res  = await fetch(`${BACKEND_URL}/api/auth/upload-photo`, {
        method: "POST", body: formData, credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setUserData(prev => ({ ...prev, profilePhoto: data.photoUrl }));
        setContextUser(data.user);
      }
    } catch (_) {}
    finally { setPhotoUploading(false); }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const res  = await fetch(`${BACKEND_URL}/api/auth/update-profile`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setUserData(prev => ({ ...prev, ...(data.user ?? {}) }));
        if (data.user) setContextUser(data.user);
        setProfileMsg({ type: "success", text: "Profile updated!" });
        setIsEditing(false);
      } else {
        setProfileMsg({ type: "error", text: data.error || "Update failed." });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Something went wrong." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post permanently?")) return;
    setDeletingPostId(postId);
    try {
      await fetch(`${BACKEND_URL}/api/community/${postId}`, {
        method: "DELETE", credentials: "include",
      });
      setUserPosts(prev => prev.filter(p => p._id?.toString() !== postId.toString()));
    } catch (e) { console.error(e); }
    finally { setDeletingPostId(null); }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const key = `${postId}-${commentId}`;
    setDeletingCommentKey(key);
    try {
      await fetch(`${BACKEND_URL}/api/community/${postId}/comment/${commentId}`, {
        method: "DELETE", credentials: "include",
      });
      setUserPosts(prev => prev.map(p => {
        if (p._id?.toString() !== postId.toString()) return p;
        return { ...p, comments: p.comments.filter(c => c._id?.toString() !== commentId.toString()) };
      }));
    } catch (e) { console.error(e); }
    finally { setDeletingCommentKey(null); }
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const totalQuizzes    = quizResults.length;
  const overallAvgScore = totalQuizzes > 0
    ? (quizResults.reduce((s, q) => s + (q.totalQuestions
        ? Math.round((q.score / q.totalQuestions) * 100)
        : q.score), 0) / totalQuizzes).toFixed(1)
    : 0;

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
    labels: quizResults.map((q, i) =>
      q.date ? new Date(q.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : `Quiz ${i + 1}`
    ),
    datasets: [{
      label: "Score (%)",
      data: quizResults.map(q => q.totalQuestions ? Math.round((q.score / q.totalQuestions) * 100) : q.score),
      fill: true, backgroundColor: "rgba(139,92,246,0.08)", borderColor: "#8b5cf6",
      pointBackgroundColor: "#8b5cf6", pointRadius: 4, tension: 0.4,
    }],
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
  const stackedBarOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      x: { ...chartOptions.scales.x, stacked: true },
      y: { ...chartOptions.scales.y, stacked: true },
    },
  };

  const overallBadge = getBadge(cityStats.overallTotal);

  const tabs = [
    { id: "overview",  label: "Overview",    icon: <Compass size={14} /> },
    { id: "analytics", label: "Analytics",   icon: <TrendingUp size={14} /> },
    { id: "map",       label: "World Map",   icon: <Globe size={14} /> },
    { id: "profile",   label: "Profile",     icon: <User size={14} /> },
    { id: "activity",  label: "My Activity", icon: <FileText size={14} /> },
  ];

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-3">
      <Loader2 size={28} className="text-violet-400 animate-spin" />
      <p className="text-sm text-zinc-400">Loading your dashboard…</p>
    </div>
  );

  if (error || !userData) return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center px-4">
      <div className="flex items-center gap-2 bg-red-900/30 text-red-300 border border-red-800/50 rounded-xl px-5 py-3 text-sm font-medium">
        <X size={16} />{error || "Could not load profile."}
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-zinc-900 text-zinc-100 font-sans">

      {/* ── Desktop Sidebar ── */}
      <div className="w-[230px] shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col px-3 py-5 sticky top-0 h-screen overflow-y-auto hidden md:flex">
        <div className="flex items-center gap-2 px-2 mb-5">
          <Compass size={18} className="text-violet-400" />
          <span className="text-sm font-bold text-zinc-100">Explorer</span>
        </div>

        {/* Profile block */}
        <div className="bg-zinc-800/70 border border-zinc-700/60 rounded-xl p-3 mb-3">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="relative">
              <Avatar user={userData} size="lg" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors shadow-lg"
                title="Change photo"
              >
                {photoUploading
                  ? <Loader2 size={10} className="animate-spin text-white" />
                  : <Camera size={10} className="text-white" />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div className="min-w-0 w-full">
              <p className="text-sm font-semibold text-zinc-100 truncate">{userData.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{userData.email}</p>
              {userData.bio && <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">{userData.bio}</p>}
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="rounded-xl px-3 py-2.5 mb-3 border flex items-center gap-2.5"
          style={{ background: overallBadge.bg, borderColor: `${overallBadge.color}40` }}>
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
                activeTab === t.id
                  ? "bg-violet-900/50 text-violet-300 border border-violet-800/50"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >{t.icon}{t.label}</button>
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
      <main className="flex-1 min-w-0 px-3 sm:px-5 py-4 lg:px-8">

        {/* ── Mobile profile card (hidden on desktop) ── */}
        <div className="md:hidden mb-4">
          <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl overflow-hidden">
            <div className="h-14 bg-gradient-to-r from-violet-900 to-pink-900/60" />
            <div className="px-4 pb-4">
              <div className="flex items-end gap-3 -mt-7 mb-3">
                <div className="relative">
                  <Avatar user={userData} size="lg" className="border-4 border-zinc-800 shadow-lg" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center transition-colors shadow-lg border-2 border-zinc-800"
                  >
                    {photoUploading
                      ? <Loader2 size={9} className="animate-spin text-white" />
                      : <Camera size={9} className="text-white" />}
                  </button>
                </div>
                <div className="pb-1 min-w-0 flex-1">
                  <p className="text-sm font-bold text-zinc-100 truncate">{userData.name}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{userData.email}</p>
                </div>
                <div className="pb-1 shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border"
                  style={{ background: overallBadge.bg, borderColor: `${overallBadge.color}40` }}>
                  <span className="text-base">{overallBadge.emoji}</span>
                  <div>
                    <p className="text-[10px] font-bold leading-none" style={{ color: overallBadge.color }}>{overallBadge.label}</p>
                    <p className="text-[9px] mt-0.5" style={{ color: overallBadge.color }}>{cityStats.overallTotal} pts</p>
                  </div>
                </div>
              </div>

              {/* Mobile stats row */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: "Cities",  val: userData.citiesVisited || 0 },
                  { label: "Quizzes", val: totalQuizzes },
                  { label: "Avg",     val: `${overallAvgScore}%` },
                  { label: "Points",  val: cityStats.overallTotal },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center bg-zinc-700/30 rounded-lg py-2">
                    <p className="text-sm font-bold text-zinc-100">{val}</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full py-2 bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <UploadCloud size={12} /> Suggest a City
              </button>
            </div>
          </div>
        </div>

        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-zinc-100">Hey, {userData.name?.split(" ")[0] || "Explorer"} 👋</h1>
            <p className="text-xs text-zinc-500 mt-1">Here's what's happening with your travels</p>
          </div>

          {/* Desktop tab pills */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-xl p-1 flex-wrap">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === t.id ? "bg-violet-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >{t.icon}{t.label}</button>
            ))}
          </div>

          {/* Mobile tab — scrollable pill buttons */}
          <div className="md:hidden w-full">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all border ${
                    activeTab === t.id
                      ? "bg-violet-700 text-white border-violet-600"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {activeTab === "overview" && (
            <AdminOverview
              userData={userData}
              cityStats={cityStats}
              totalQuizzes={totalQuizzes}
              overallAvgScore={overallAvgScore}
              overallBadge={overallBadge}
              visitedCitiesWithCoords={visitedCitiesWithCoords}
              fileInputRef={fileInputRef}
              photoUploading={photoUploading}
              handlePhotoUpload={handlePhotoUpload}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "analytics" && (
            <AdminAnalytics
              quizResults={quizResults}
              cityStats={cityStats}
              chartOptions={chartOptions}
              lineData={lineData}
              barData={barData}
              stackedBarOptions={stackedBarOptions}
            />
          )}

          {activeTab === "map" && (
            <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Globe size={15} className="text-zinc-400" />
                  <h2 className="text-sm font-semibold text-zinc-200">Explorer's Map</h2>
                  <span className="ml-auto text-[10px] bg-zinc-700 border border-zinc-600 rounded-full px-2.5 py-0.5 text-zinc-300">
                    {userData.visitedCities?.length || 0} destinations
                  </span>
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
                <div className="rounded-xl overflow-hidden">
                  <UserVisitedMap visitedCities={visitedCitiesWithCoords} />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <AdminProfile
              userData={userData}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              editForm={editForm}
              setEditForm={setEditForm}
              profileSaving={profileSaving}
              profileMsg={profileMsg}
              setProfileMsg={setProfileMsg}
              handleSaveProfile={handleSaveProfile}
              fileInputRef={fileInputRef}
              photoUploading={photoUploading}
              handlePhotoUpload={handlePhotoUpload}
            />
          )}

          {activeTab === "activity" && (
            <AdminActivity
              activityLoading={activityLoading}
              activityTab={activityTab}
              setActivityTab={setActivityTab}
              userPosts={userPosts}
              myCommentsList={myCommentsList}
              userData={userData}
              deletingPostId={deletingPostId}
              deletingCommentKey={deletingCommentKey}
              handleDeletePost={handleDeletePost}
              handleDeleteComment={handleDeleteComment}
            />
          )}

        </AnimatePresence>
      </main>

      {/* ── Upload Modal ── */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
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
                <input
                  type="text" placeholder="e.g. Kyoto, Japan" value={newCityName}
                  onChange={e => { setNewCityName(e.target.value); setUploadMessage({ type: "", text: "" }); }}
                  required disabled={isUploading || uploadMessage.type === "success"}
                  className="w-full px-3 py-2.5 bg-zinc-700/80 border border-zinc-600 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition disabled:opacity-50"
                />
                <AnimatePresence>
                  {uploadMessage.text && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`flex items-center gap-2 text-xs font-medium mt-3 px-3 py-2.5 rounded-lg border ${
                        uploadMessage.type === "success"
                          ? "bg-emerald-900/30 text-emerald-300 border-emerald-800/50"
                          : "bg-red-900/30 text-red-300 border-red-800/50"
                      }`}
                    >
                      {uploadMessage.type === "success" ? <CheckCircle size={13} /> : <X size={13} />}
                      {uploadMessage.text}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={closeModal} disabled={isUploading}
                    className="px-4 py-2 text-sm font-semibold text-zinc-300 border border-zinc-600 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-40">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !newCityName.trim() || uploadMessage.type === "success"}
                    className="flex items-center gap-1.5 px-4 py-2 bg-violet-700 hover:bg-violet-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
                  >
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