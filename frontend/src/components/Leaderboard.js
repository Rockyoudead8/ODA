import React, { useState, useEffect } from "react";
import { Award, Zap, ChevronDown, User, Loader2, Star, MessageCircle, FileText, Trophy } from "lucide-react";

const BADGE_TIERS = [
  { min: 200, label: "Legend Explorer",   color: "#FF6B6B", bg: "#FFF0F0", emoji: "🏆" },
  { min: 100, label: "Elite Traveller",   color: "#845EF7", bg: "#F3F0FF", emoji: "💎" },
  { min:  50, label: "City Adventurer",   color: "#F59E0B", bg: "#FFFBEB", emoji: "⭐" },
  { min:  20, label: "Local Explorer",    color: "#10B981", bg: "#ECFDF5", emoji: "🌿" },
  { min:   1, label: "Newcomer",          color: "#3B82F6", bg: "#EFF6FF", emoji: "🌱" },
  { min:   0, label: "No Points Yet",     color: "#9CA3AF", bg: "#F9FAFB", emoji: "👤" },
];

const getBadge = (total) => BADGE_TIERS.find((t) => total >= t.min) || BADGE_TIERS[BADGE_TIERS.length - 1];

const Leaderboard = ({ listingId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [sortKey, setSortKey]         = useState("total");
  const [sortDir, setSortDir]         = useState("desc");
  const [activeView, setActiveView]   = useState("leaderboard"); // "leaderboard" | "breakdown"

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    setError(null);

    fetch(`http://localhost:8000/api/city-points/leaderboard/${listingId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setLeaderboard(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [listingId]);

  const sorted = React.useMemo(() => {
    return [...leaderboard].sort((a, b) =>
      sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
    );
  }, [leaderboard, sortKey, sortDir]);

  const handleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const podiumColors = {
    1: { ring: "#EAB308", bg: "linear-gradient(135deg,#FEF9C3,#FDE68A)", text: "#78350F", label: "CHAMPION" },
    2: { ring: "#9CA3AF", bg: "linear-gradient(135deg,#F3F4F6,#E5E7EB)", text: "#374151", label: "2nd Place" },
    3: { ring: "#B45309", bg: "linear-gradient(135deg,#FEF3C7,#FDE68A)", text: "#78350F", label: "3rd Place" },
  };

  if (loading) return (
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 className="animate-spin w-10 h-10 text-indigo-500" />
    </div>
  );
  if (error) return (
    <div className="w-full h-full flex items-center justify-center text-red-500 font-medium">{error}</div>
  );

  return (
    <div className="w-full h-full flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-extrabold text-gray-900">Top Travellers</h2>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {["leaderboard", "breakdown"].map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200"
              style={{
                background: activeView === v ? "#4F46E5" : "transparent",
                color: activeView === v ? "#fff" : "#6B7280",
              }}
            >
              {v === "leaderboard" ? "Ranking" : "Breakdown"}
            </button>
          ))}
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
          <Zap className="w-10 h-10" />
          <p className="font-semibold">No explorers yet — be the first!</p>
          <p className="text-xs">Take a quiz, leave a comment or make a post to earn points.</p>
        </div>
      ) : (
        <>
          {activeView === "leaderboard" && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Podium – top 3 */}
              {sorted.length >= 1 && (
                <div className="grid grid-cols-3 gap-2 mb-4 flex-shrink-0">
                  {[2, 1, 3].map((rank) => {
                    const user = sorted[rank - 1];
                    if (!user) return <div key={rank} />;
                    const pc = podiumColors[rank];
                    const badge = getBadge(user.total);
                    return (
                      <div
                        key={rank}
                        className="flex flex-col items-center p-2 rounded-xl text-center transition-all duration-200 hover:scale-105"
                        style={{
                          background: pc.bg,
                          border: `3px solid ${pc.ring}`,
                          boxShadow: `0 4px 16px ${pc.ring}40`,
                          order: rank === 1 ? 2 : rank === 2 ? 1 : 3,
                        }}
                      >
                        <span style={{ fontSize: rank === 1 ? 22 : 18 }}>{badge.emoji}</span>
                        <p className="text-[10px] font-black uppercase tracking-wide mt-0.5" style={{ color: pc.text }}>
                          {pc.label}
                        </p>
                        <p className="text-xs font-bold truncate w-full mt-0.5 px-1" style={{ color: pc.text }}>
                          {user.name || "Anonymous"}
                        </p>
                        <p className="text-[10px] font-semibold mt-0.5" style={{ color: pc.text }}>
                          {user.total} pts
                        </p>
                        <span
                          className="mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Full table */}
              <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10 bg-indigo-50">
                    <tr>
                      <th className="py-2 px-3 text-left text-xs text-gray-500 font-semibold">#</th>
                      <th className="py-2 px-3 text-left text-xs text-gray-500 font-semibold">Name</th>
                      <th className="py-2 px-3 text-left text-xs text-gray-500 font-semibold">Badge</th>
                      <th
                        className="py-2 px-3 text-right text-xs text-gray-500 font-semibold cursor-pointer select-none"
                        onClick={() => handleSort("total")}
                      >
                        <span className="flex items-center justify-end gap-1">
                          Points <ChevronDown className="w-3 h-3" />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((u, i) => {
                      const badge = getBadge(u.total);
                      const isTop3 = i < 3;
                      return (
                        <tr
                          key={u.id || i}
                          className="border-t border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-2.5 px-3 text-gray-400 text-xs font-semibold">
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{
                                  background: isTop3 ? "#DBEAFE" : "#F3F4F6",
                                  color: isTop3 ? "#1D4ED8" : "#6B7280",
                                }}
                              >
                                {(u.name || "A")[0].toUpperCase()}
                              </div>
                              <span className={`font-medium text-sm ${isTop3 ? "text-gray-900" : "text-gray-700"}`}>
                                {u.name || "Anonymous"}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                              style={{ background: badge.bg, color: badge.color }}
                            >
                              {badge.emoji} {badge.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-indigo-600 text-sm">
                            {u.total}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeView === "breakdown" && (
            <div className="flex-1 overflow-y-auto space-y-3">
              {sorted.map((u, i) => {
                const badge = getBadge(u.total);
                const total = u.total || 1; // avoid div by 0
                return (
                  <div key={u.id || i} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                        <span className="font-semibold text-gray-900 text-sm">{u.name || "Anonymous"}</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.emoji} {badge.label}
                        </span>
                      </div>
                      <span className="font-bold text-indigo-600 text-sm">{u.total} pts</span>
                    </div>
                    {/* Points bars */}
                    <div className="space-y-1.5">
                      {[
                        { key: "quizPoints",    label: "Quiz",     icon: <Star className="w-3 h-3" />,           color: "#3B82F6" },
                        { key: "commentPoints", label: "Comments", icon: <MessageCircle className="w-3 h-3" />,  color: "#10B981" },
                        { key: "postPoints",    label: "Posts",    icon: <FileText className="w-3 h-3" />,       color: "#F59E0B" },
                      ].map(({ key, label, icon, color }) => {
                        const val = u[key] || 0;
                        const pct = Math.round((val / (u.total || 1)) * 100);
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <span style={{ color }} className="flex-shrink-0">{icon}</span>
                            <span className="text-[11px] text-gray-500 w-16 flex-shrink-0">{label}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: color }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-gray-600 w-8 text-right">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Points legend */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex-shrink-0">
        <p className="text-[10px] text-gray-400 font-medium mb-1">How to earn points:</p>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: <Star className="w-3 h-3" />, color: "#3B82F6", text: "Quiz: 10pts/correct" },
            { icon: <MessageCircle className="w-3 h-3" />, color: "#10B981", text: "Comment: 5pts" },
            { icon: <FileText className="w-3 h-3" />, color: "#F59E0B", text: "Post: 10pts" },
          ].map(({ icon, color, text }) => (
            <span key={text} className="flex items-center gap-1 text-[10px] font-medium" style={{ color }}>
              {icon} {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;