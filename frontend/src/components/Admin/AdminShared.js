import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export const BADGE_TIERS = [
  { min: 200, label: "Legend Explorer",  color: "#f87171", bg: "rgba(248,113,113,0.15)", emoji: "🏆" },
  { min: 100, label: "Elite Traveller",  color: "#a78bfa", bg: "rgba(167,139,250,0.15)", emoji: "💎" },
  { min:  50, label: "City Adventurer",  color: "#fbbf24", bg: "rgba(251,191,36,0.15)",  emoji: "⭐" },
  { min:  20, label: "Local Explorer",   color: "#34d399", bg: "rgba(52,211,153,0.15)",  emoji: "🌿" },
  { min:   1, label: "Newcomer",         color: "#60a5fa", bg: "rgba(96,165,250,0.15)",  emoji: "🌱" },
  { min:   0, label: "No Points Yet",    color: "#9ca3af", bg: "rgba(156,163,175,0.15)", emoji: "👤" },
];

export const getBadge = (total) =>
  BADGE_TIERS.find((t) => total >= t.min) || BADGE_TIERS[BADGE_TIERS.length - 1];

export function Avatar({ user, size = "sm", className = "" }) {
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

export const StatCard = ({ icon, label, value, color, delay = 0 }) => (
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

export const EmptyState = ({ msg }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-zinc-500 text-sm text-center">
    <Compass size={28} className="text-zinc-600" />
    <p>{msg || "No data yet — start exploring!"}</p>
  </div>
);