import React, { useState, useEffect } from "react";
import {
  Trophy, Loader2, Star, MessageCircle,
  FileText, ChevronDown, Zap, BarChart2,
} from "lucide-react";

/* ── Badge tiers ── */
const BADGE_TIERS = [
  { min: 200, label: "Legend Explorer", colorClass: "text-rose-400",    bgClass: "bg-rose-400/10",    emoji: "🏆" },
  { min: 100, label: "Elite Traveller", colorClass: "text-purple-400",  bgClass: "bg-purple-400/10",  emoji: "💎" },
  { min:  50, label: "City Adventurer", colorClass: "text-amber-400",   bgClass: "bg-amber-400/10",   emoji: "⭐" },
  { min:  20, label: "Local Explorer",  colorClass: "text-green-400",   bgClass: "bg-green-400/10",   emoji: "🌿" },
  { min:   1, label: "Newcomer",        colorClass: "text-blue-400",    bgClass: "bg-blue-400/10",    emoji: "🌱" },
  { min:   0, label: "No Points Yet",   colorClass: "text-stone-500",   bgClass: "bg-stone-500/10",   emoji: "👤" },
];
const getBadge = (total) => BADGE_TIERS.find(t => total >= t.min) || BADGE_TIERS[BADGE_TIERS.length - 1];

/* ── Podium config — static per rank so Tailwind can tree-shake properly ── */
const PODIUM_CONFIG = {
  1: { border: "border-amber-400/40",  shadow: "shadow-amber-400/20",  rankText: "text-amber-400",  label: "Champion" },
  2: { border: "border-stone-400/40",  shadow: "shadow-stone-400/20",  rankText: "text-stone-400",  label: "2nd"      },
  3: { border: "border-amber-700/40",  shadow: "shadow-amber-700/20",  rankText: "text-amber-700",  label: "3rd"      },
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

/* ── Breakdown bar config ── */
const BREAKDOWN_BARS = [
  { key: "quizPoints",    label: "Quiz",     Icon: Star,           barClass: "bg-blue-400",  textClass: "text-blue-400"  },
  { key: "commentPoints", label: "Comments", Icon: MessageCircle,  barClass: "bg-green-400", textClass: "text-green-400" },
  { key: "postPoints",    label: "Posts",    Icon: FileText,       barClass: "bg-amber-400", textClass: "text-amber-400" },
];

const Leaderboard = ({ listingId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [sortKey, setSortKey]         = useState("total");
  const [sortDir, setSortDir]         = useState("desc");
  const [activeView, setActiveView]   = useState("leaderboard");

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:8000/api/city-points/leaderboard/${listingId}`)
      .then(r => r.json())
      .then(data => { if (data.error) throw new Error(data.error); setLeaderboard(data); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [listingId]);

  const sorted = React.useMemo(() =>
    [...leaderboard].sort((a, b) =>
      sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
    ), [leaderboard, sortKey, sortDir]);

  const handleSort = (key) => {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  /* ── Shared header ── */
  const Header = () => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center">
          <Trophy size={16} className="text-amber-400" />
        </div>
        <h2 className="text-[15px] font-extrabold text-stone-50 tracking-tight m-0">Top Travellers</h2>
      </div>

      {/* View toggle */}
      <div className="flex gap-0.5 bg-stone-800 rounded-xl p-1">
        {[
          { key: "leaderboard", Icon: Trophy,   label: "Ranking"    },
          { key: "breakdown",   Icon: BarChart2, label: "Breakdown"  },
        ].map(({ key, Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveView(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-none
                        text-[11px] font-bold transition-all duration-200 cursor-pointer
                        ${activeView === key
                          ? "bg-stone-700 text-stone-50 shadow-sm"
                          : "bg-transparent text-stone-500 hover:text-stone-300"
                        }`}
          >
            <Icon size={11} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  /* ── Loading ── */
  if (loading) return (
    <div className="w-full h-full flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-amber-400" />
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="w-full h-full flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center text-red-400 text-sm font-medium">
        {error}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col">
      <Header />

      {/* ── Empty ── */}
      {leaderboard.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-stone-500">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/10 flex items-center justify-center">
            <Zap size={22} className="text-amber-400" />
          </div>
          <p className="text-sm font-bold text-stone-400 m-0">No explorers yet</p>
          <p className="text-xs m-0">Take a quiz, comment or post to earn points.</p>
        </div>
      ) : (

        <div className="flex-1 overflow-hidden flex flex-col">

          {/* ══════════ LEADERBOARD VIEW ══════════ */}
          {activeView === "leaderboard" && (
            <div className="flex-1 overflow-hidden flex flex-col px-5 py-4 gap-3.5">

              {/* Podium */}
              {sorted.length >= 1 && (
                <div className="grid grid-cols-3 gap-2.5 shrink-0">
                  {[2, 1, 3].map(rank => {
                    const user = sorted[rank - 1];
                    if (!user) return <div key={rank} />;
                    const pc    = PODIUM_CONFIG[rank];
                    const badge = getBadge(user.total);
                    return (
                      <div
                        key={rank}
                        className={`flex flex-col items-center p-3.5 rounded-2xl
                                    bg-[#262220] border text-center
                                    transition-transform duration-200 hover:-translate-y-1
                                    ${pc.border}
                                    shadow-[0_4px_16px_var(--tw-shadow-color)] ${pc.shadow}`}
                        style={{ order: rank === 1 ? 2 : rank === 2 ? 1 : 3 }}
                      >
                        <span className={rank === 1 ? "text-2xl" : "text-lg"}>{badge.emoji}</span>
                        <span className={`mt-1 text-[10px] font-black uppercase tracking-widest ${pc.rankText}`}>
                          {pc.label}
                        </span>
                        <span className="mt-1 text-xs font-semibold text-stone-300 truncate w-full px-1 text-center">
                          {user.name || "Anonymous"}
                        </span>
                        <span className={`mt-1 text-sm font-extrabold ${pc.rankText}`}>
                          {user.total}
                          <span className="text-[10px] font-medium text-stone-500"> pts</span>
                        </span>
                        <span className={`mt-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full
                                          ${badge.bgClass} ${badge.colorClass}`}>
                          {badge.emoji} {badge.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Table */}
              <div className="flex-1 overflow-y-auto rounded-2xl border border-stone-800 bg-[#1a1715]">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-stone-900 sticky top-0 z-10">
                      <th className="py-2.5 px-3.5 text-left text-[11px] text-stone-500 font-bold tracking-widest uppercase">#</th>
                      <th className="py-2.5 px-3.5 text-left text-[11px] text-stone-500 font-bold tracking-widest uppercase">Explorer</th>
                      <th className="py-2.5 px-3.5 text-left text-[11px] text-stone-500 font-bold tracking-widest uppercase">Badge</th>
                      <th
                        className="py-2.5 px-3.5 text-right text-[11px] text-stone-500 font-bold tracking-widest uppercase cursor-pointer select-none hover:text-stone-300 transition-colors"
                        onClick={() => handleSort("total")}
                      >
                        <span className="flex items-center justify-end gap-1">
                          Points <ChevronDown size={12} />
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((u, i) => {
                      const badge  = getBadge(u.total);
                      const isTop3 = i < 3;
                      return (
                        <tr
                          key={u.id || i}
                          className="border-t border-stone-800 hover:bg-[#262220] transition-colors"
                        >
                          <td className="py-2.5 px-3.5 text-stone-500 text-xs font-bold">
                            {isTop3 ? RANK_MEDALS[i] : i + 1}
                          </td>
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center
                                              text-xs font-extrabold shrink-0
                                              ${isTop3 ? "bg-amber-400/10 text-amber-400" : "bg-stone-800 text-stone-400"}`}>
                                {(u.name || "A")[0].toUpperCase()}
                              </div>
                              <span className={`text-sm font-medium ${isTop3 ? "text-stone-50 font-bold" : "text-stone-300"}`}>
                                {u.name || "Anonymous"}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap
                                              ${badge.bgClass} ${badge.colorClass}`}>
                              {badge.emoji} {badge.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-extrabold text-amber-400 text-sm">
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

          {/* ══════════ BREAKDOWN VIEW ══════════ */}
          {activeView === "breakdown" && (
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2.5">
              {sorted.map((u, i) => {
                const badge = getBadge(u.total);
                return (
                  <div key={u.id || i}
                    className="bg-[#262220] border border-stone-800 rounded-2xl p-4">

                    {/* User row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">{i < 3 ? RANK_MEDALS[i] : `#${i + 1}`}</span>
                        <span className="text-sm font-bold text-stone-50">{u.name || "Anonymous"}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bgClass} ${badge.colorClass}`}>
                          {badge.emoji} {badge.label}
                        </span>
                      </div>
                      <span className="font-extrabold text-amber-400 text-sm">{u.total} pts</span>
                    </div>

                    {/* Bars */}
                    <div className="flex flex-col gap-2">
                      {BREAKDOWN_BARS.map(({ key, label, Icon, barClass, textClass }) => {
                        const val = u[key] || 0;
                        const pct = Math.round((val / (u.total || 1)) * 100);
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <Icon size={12} className={`${textClass} shrink-0`} />
                            <span className="text-[11px] text-stone-500 w-14 shrink-0">{label}</span>
                            <div className="flex-1 bg-stone-800 rounded-full h-[5px] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-stone-400 w-6 text-right">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Points legend ── */}
          <div className="px-5 py-3 border-t border-stone-800 shrink-0">
            <p className="text-[10px] text-stone-500 font-semibold uppercase tracking-widest mb-2 m-0">
              How to earn points
            </p>
            <div className="flex flex-wrap gap-3">
              {BREAKDOWN_BARS.map(({ Icon, label, textClass, key }) => {
                const pts = key === "quizPoints" ? "10 pts/correct" : key === "commentPoints" ? "5 pts" : "10 pts";
                return (
                  <span key={key} className={`flex items-center gap-1.5 text-[11px] font-semibold ${textClass}`}>
                    <Icon size={11} /> {label}: {pts}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;