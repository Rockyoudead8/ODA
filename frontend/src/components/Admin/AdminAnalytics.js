import { motion } from "framer-motion";
import { Line, Bar } from "react-chartjs-2";
import { TrendingUp, Star, MessageCircle, FileText, Zap, Award, BookOpen } from "lucide-react";
import { StatCard, EmptyState, getBadge } from "./AdminShared";

export default function AdminAnalytics({ quizResults, cityStats, chartOptions, lineData, barData, stackedBarOptions }) {
  const totalQuizzes = quizResults.length;

  return (
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

        <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><Award size={14} className="text-zinc-400" /><h2 className="text-sm font-semibold text-zinc-200">City Points Comparison</h2></div>
          {cityStats.cities.length > 0 ? (
            <div className="flex flex-col gap-2.5 overflow-y-auto" style={{ maxHeight: "208px" }}>
              {cityStats.cities.slice(0, 8).map((c) => {
                const max   = Math.max(...cityStats.cities.map(x => x.total), 1);
                const pct   = Math.round((c.total / max) * 100);
                const badge = getBadge(c.total);
                return (
                  <div key={c.cityName}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-zinc-300 truncate max-w-[120px]">{c.cityName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px]">{badge.emoji}</span>
                        <span className="text-xs font-bold" style={{ color: badge.color }}>{c.total} pts</span>
                      </div>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "linear-gradient(90deg, #8b5cf6, #ec4899)" }} />
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
                {[...quizResults].reverse().slice(0, 8).map((q, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-700/20 transition-colors">
                    <td className="py-2.5 px-3 text-zinc-500 text-xs">{quizResults.length - i}</td>
                    <td className="py-2.5 px-3 text-zinc-200">{q.city || "—"}</td>
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
                {cityStats.cities.map((c, i) => {
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
  );
}