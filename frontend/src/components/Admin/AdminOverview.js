import { motion } from "framer-motion";
import { MapPin, BookOpen, Target, Zap, Award, Globe, Edit3, Camera, Loader2 } from "lucide-react";
import { Avatar, StatCard, getBadge, BADGE_TIERS } from "./AdminShared";
import UserVisitedMap from "../UserVisitedMap";

export default function AdminOverview({
  userData, cityStats, totalQuizzes, overallAvgScore,
  overallBadge, visitedCitiesWithCoords, fileInputRef,
  photoUploading, handlePhotoUpload, setActiveTab,
}) {
  return (
    <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

      {/* Profile banner */}
      <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl overflow-hidden mb-5">
        <div className="h-16 bg-gradient-to-r from-violet-900 to-pink-900/60" />
        <div className="px-4 sm:px-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8 mb-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Cities",    val: userData.citiesVisited || 0 },
              { label: "Quizzes",   val: totalQuizzes },
              { label: "Avg Score", val: `${overallAvgScore}%` },
              { label: "Points",    val: cityStats.overallTotal },
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

      {/* Hidden file input shared with sidebar */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
    </motion.div>
  );
}