import { useEffect, useState, useRef } from "react";
import CreatePost from "../components/CreatePost";
import {
  ThumbsUp, Flame, Clock, Users, MapPin,
  BarChart2, TrendingUp, Share2, Bookmark,
} from "lucide-react";

/* ─── timeAgo helper ────────────────────────────────────────────────────── */
function timeAgo(dateStr) {
  const s = (Date.now() - new Date(dateStr)) / 1000;
  if (s < 60)          return `${Math.floor(s)}s ago`;
  if (s < 3600)        return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)       return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30)  return `${Math.floor(s / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function Community({ user }) {
  const [commentText,  setCommentText]  = useState({});
  const [posts,        setPosts]        = useState([]);
  const [replyText,    setReplyText]    = useState({});
  const [showReplyBox, setShowReplyBox] = useState({});
  const [showModal,    setShowModal]    = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("liked");
  const [saved,        setSaved]        = useState({});   // local save toggle

  const middlePanelRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/community/feed", { credentials: "include" })
      .then(r => r.json())
      .then(d => setPosts(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refreshFeed = async () => {
    const res  = await fetch("http://localhost:8000/api/community/feed", { credentials: "include" });
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
  };

  const likePost = async (postId) => {
    if (!postId) return;

    // Resolve userId from whichever field the user object uses (_id or id)
    const userId = (user?._id ?? user?.id)?.toString() ?? null;

    // Optimistic update — only runs if we can identify the current user
    if (userId) {
      setPosts(prev =>
        prev.map(p => {
          if (p._id?.toString() !== postId.toString()) return p;
          const alreadyLiked = p.likes.some(
            l => (l?._id ?? l)?.toString() === userId
          );
          return {
            ...p,
            likes: alreadyLiked
              ? p.likes.filter(l => (l?._id ?? l)?.toString() !== userId)
              : [...p.likes, userId],
          };
        })
      );
    }

    // API call always fires regardless of whether userId resolved
    await fetch(`http://localhost:8000/api/community/${postId}/like`, {
      method: "POST", credentials: "include",
    });

    // Sync with server so UI reflects true state
    await refreshFeed();
  };

  const toggleSave = (postId) =>
    setSaved(prev => ({ ...prev, [postId]: !prev[postId] }));

  const sharePost = (post) => {
    const text = `${post.city} — ${post.content.slice(0, 80)}`;
    if (navigator.share) {
      navigator.share({ title: post.city, text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
    }
  };

  const addComment = async (postId) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    await fetch(`http://localhost:8000/api/community/${postId}/comment`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setCommentText(prev => ({ ...prev, [postId]: "" }));
    await refreshFeed();
  };

  const addReply = async (postId, commentId) => {
    const text = replyText[commentId];
    if (!text?.trim()) return;
    await fetch(`http://localhost:8000/api/community/${postId}/comment/${commentId}/reply`, {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setReplyText(prev    => ({ ...prev, [commentId]: "" }));
    setShowReplyBox(prev => ({ ...prev, [commentId]: false }));
    await refreshFeed();
  };

  const scrollToPost = (postId) => {
    const container = middlePanelRef.current;
    const element   = document.getElementById(`post-${postId}`);
    if (!container || !element) return;
    container.scrollTo({ top: element.offsetTop - container.offsetTop - 16, behavior: "smooth" });
  };

  /* ── Derived data ─────────────────────────────────────────────────────── */
  const activeUsers = [
    ...new Map(
      posts.filter(p => p.user?._id && p.user?.name).map(p => [p.user._id, p.user.name])
    ).entries(),
  ].slice(0, 5);

  const topCities = Object.entries(
    posts.reduce((acc, p) => { if (p.city) acc[p.city] = (acc[p.city] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const totalLikes    = posts.reduce((s, p) => s + (p.likes?.length    ?? 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments?.length ?? 0), 0);

  const displayedPosts = activeTab === "liked"
    ? [...posts].sort((a, b) => b.likes.length - a.likes.length)
    : [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const latestPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F0F2F5" }}>

      {/*
        ══ LAYOUT ══════════════════════════════════════════════════════════
        Fixed-height row = all three panels share the same bottom edge.
        Each column scrolls independently. No sticky needed inside.

        Columns:  left = 200px  |  middle = flex-1  |  right = 288px
        Left is intentionally narrow — just navigation + quick info.
      */}
      {/*
        Sidebar sits flush against the left viewport edge — outside the
        centred content wrapper. Middle + right live in their own flex row.
      */}
      <div className="flex" style={{ height: "calc(100vh - 0px)" }}>

        {/* ══ LEFT SIDEBAR — Reddit-style, full-height, left-edge flush ══ */}
        <div
          className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 #F0F2F5" }}
        >
          {/* Create Post — pinned at top */}
          <div className="px-4 pt-5 pb-3 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              + Create Post
            </button>
          </div>

          {/* ── SORT ───────────────────────────────────────────────────── */}
          <div className="px-3 pb-1">
            <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Sort
            </p>
            {[
              { key: "liked",  icon: Flame, label: "Hot" },
              { key: "latest", icon: Clock, label: "New" },
            ].map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === key
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={16} className={activeTab === key ? "text-blue-500" : "text-gray-400"} />
                {label}
              </button>
            ))}
          </div>

          <div className="mx-4 my-2 border-t border-gray-100" />

          {/* ── MEMBERS ────────────────────────────────────────────────── */}
          <div className="px-3 pb-1">
            <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
              <Users size={11} />  Members
            </p>
            {activeUsers.length === 0 ? (
              <p className="px-3 text-xs text-gray-400">No activity yet</p>
            ) : (
              activeUsers.map(([id, name]) => (
                <div key={id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-default">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs flex items-center justify-center font-bold shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 truncate">{name}</span>
                </div>
              ))
            )}
          </div>

          <div className="mx-4 my-2 border-t border-gray-100" />

          {/* ── TOP CITIES ─────────────────────────────────────────────── */}
          {!loading && topCities.length > 0 && (
            <div className="px-3 pb-1">
              <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin size={11} className="text-orange-400" /> Top Cities
              </p>
              <div className="px-3 space-y-2.5 mt-1">
                {topCities.map(([city, count], i) => {
                  const pct = Math.round((count / topCities[0][1]) * 100);
                  return (
                    <div key={city}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700 font-medium flex items-center gap-1.5 truncate">
                          <span className="text-gray-400 w-3 shrink-0">{i + 1}.</span>
                          <span className="truncate">{city}</span>
                        </span>
                        <span className="text-gray-400 shrink-0 ml-2">{count}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mx-4 my-2 border-t border-gray-100" />

          {/* ── GUIDELINES ─────────────────────────────────────────────── */}
          <div className="px-3 pb-4">
            <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Guidelines
            </p>
            {["Be respectful", "No spam", "Stay on topic"].map(r => (
              <div key={r} className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Middle + right live in a flex row with padding */}
        <div className="flex flex-1 gap-2 pl-4 pr-16 py-5 overflow-hidden">

        {/* ══ MIDDLE PANEL — feed ════════════════════════════════════════ */}
        <div
          ref={middlePanelRef}
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 transparent" }}
        >
          {loading ? (
            <div className="max-w-xl mx-auto space-y-3 pt-1">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                  <div className="h-36 bg-gray-100 rounded-lg mt-3" />
                </div>
              ))}
            </div>

          ) : displayedPosts.length === 0 ? (
            <div className="max-w-xl mx-auto mt-16 bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Flame size={28} className="text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-600">No posts yet</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to share a city story</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                Create Post
              </button>
            </div>

          ) : (
            /*
              max-w-xl centres the cards and prevents them from stretching
              too wide — standard practice used by Reddit, Twitter, LinkedIn.
            */
            <div className="max-w-2xl mx-auto space-y-3 pt-1 pb-6">
              {displayedPosts.map(post => {
                const userId  = (user?._id ?? user?.id)?.toString() ?? null;
                const isLiked = userId
                  ? post.likes.some(l => (l?._id ?? l)?.toString() === userId)
                  : false;
                const isSaved = !!saved[post._id];

                return (
                  <div
                    key={post._id}
                    id={`post-${post._id}`}
                    className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors shadow-sm overflow-hidden"
                  >
                    <div className="p-4">

                      {/* ── Post header ─────────────────────────────── */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs flex items-center justify-center font-bold shrink-0">
                            {post.user?.name?.charAt(0).toUpperCase() ?? "?"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                              {post.user?.name ?? "Unknown"}
                            </p>
                            {/* ── FIX 1: timeAgo ─────────────────────── */}
                            <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
                          </div>
                        </div>

                        {/* ── Prominent city badge ─────────────────── */}
                        <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
                          <MapPin size={11} className="shrink-0" />
                          {post.city}
                        </span>
                      </div>

                      {/* ── Body ────────────────────────────────────── */}
                      <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>

                      {/* ── Image ───────────────────────────────────── */}
                      {post.image && (
                        <img
                          src={post.image}
                          alt="post"
                          className="mt-3 rounded-lg w-full max-h-72 object-cover border border-gray-100"
                        />
                      )}

                      {/* ── Action bar: Like · Comment count · Share · Save ── */}
                      <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                        {/* Like */}
                        <button
                          onClick={() => likePost(post._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isLiked
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                          }`}
                        >
                          <ThumbsUp
                            size={16}
                            fill={isLiked ? "#2563EB" : "none"}
                            color={isLiked ? "#2563EB" : "currentColor"}
                          />
                          {post.likes.length}
                        </button>

                        {/* Comment count (no interaction, just info) */}
                        <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          {post.comments.length}
                        </span>

                        {/* Share */}
                        <button
                          onClick={() => sharePost(post)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                        >
                          <Share2 size={16} />
                          Share
                        </button>

                        {/* Save */}
                        <button
                          onClick={() => toggleSave(post._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ml-auto ${
                            isSaved
                              ? "text-amber-500"
                              : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                          }`}
                        >
                          <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                          {isSaved ? "Saved" : "Save"}
                        </button>
                      </div>

                      {/* ── Comments section ────────────────────────── */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex gap-2 mb-3">
                          <input
                            value={commentText[post._id] || ""}
                            onChange={e => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                            onKeyDown={e => e.key === "Enter" && addComment(post._id)}
                            placeholder="Write a comment…"
                            className="flex-1 px-3 py-2 rounded-lg text-sm border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition"
                          />
                          <button
                            onClick={() => addComment(post._id)}
                            className="bg-blue-600 text-white px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 transition active:scale-95"
                          >
                            Post
                          </button>
                        </div>

                        {post.comments.length > 0 && (
                          <div className="space-y-3">
                            {post.comments.map(comment => (
                              <div key={comment._id} className="flex gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                                  {comment.user?.name?.charAt(0).toUpperCase() ?? "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="bg-gray-50 rounded-xl px-3 py-2">
                                    <span className="text-xs font-semibold text-gray-800 mr-2">
                                      {comment.user?.name ?? "User"}
                                    </span>
                                    <span className="text-sm text-gray-700">{comment.text}</span>
                                  </div>

                                  <button
                                    onClick={() => setShowReplyBox(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                                    className="text-xs text-gray-400 hover:text-blue-600 font-semibold mt-1 ml-2 transition"
                                  >
                                    {showReplyBox[comment._id] ? "Cancel" : "Reply"}
                                  </button>

                                  {/* Replies */}
                                  {comment.replies?.length > 0 && (
                                    <div className="ml-2 mt-2 pl-3 border-l-2 border-gray-200 space-y-2">
                                      {comment.replies.map(reply => (
                                        <div key={reply._id} className="flex items-start gap-2">
                                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                                            {reply.user?.name?.charAt(0).toUpperCase() ?? "?"}
                                          </div>
                                          <div className="bg-gray-50 rounded-lg px-2.5 py-1.5">
                                            <span className="text-xs font-semibold text-gray-800 mr-1.5">{reply.user?.name ?? "User"}</span>
                                            <span className="text-xs text-gray-600">{reply.text}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {showReplyBox[comment._id] && (
                                    <div className="ml-2 mt-2 flex gap-2">
                                      <input
                                        value={replyText[comment._id] || ""}
                                        onChange={e => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                                        onKeyDown={e => e.key === "Enter" && addReply(post._id, comment._id)}
                                        className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
                                        placeholder="Write a reply…"
                                      />
                                      <button
                                        onClick={() => addReply(post._id, comment._id)}
                                        className="bg-gray-200 text-gray-700 px-3 rounded-lg text-xs font-semibold hover:bg-gray-300 transition"
                                      >
                                        Send
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══ RIGHT PANEL — sidebar ══════════════════════════════════════ */}
        <div
          className="w-72 shrink-0 overflow-y-auto space-y-3 py-1"
          style={{ scrollbarWidth: "none" }}
        >
          {/* About */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-14 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div className="p-4">
              <div className="flex items-end gap-2 -mt-8 mb-3">
                <div className="w-12 h-12 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-md">
                  🌍
                </div>
              </div>
              <p className="font-bold text-gray-900 text-sm">Travel Stories</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Share city experiences and adventures with fellow explorers worldwide.
              </p>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
                {[
                  { v: posts.length,      l: "Posts"   },
                  { v: activeUsers.length, l: "Members" },
                  { v: totalLikes,         l: "Likes"   },
                ].map(({ v, l }) => (
                  <div key={l}>
                    <p className="text-sm font-bold text-gray-900">{v}</p>
                    <p className="text-xs text-gray-400">{l}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-xl transition active:scale-95"
              >
                + Create Post
              </button>
            </div>
          </div>

          {/* Latest Posts */}
          {!loading && latestPosts.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUp size={12} className="text-blue-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent</span>
              </div>
              <div className="space-y-3 divide-y divide-gray-100">
                {latestPosts.slice(0, 4).map((post, i) => (
                  <div
                    key={post._id}
                    onClick={() => scrollToPost(post._id)}
                    className="pt-3 first:pt-0 cursor-pointer group"
                  >
                    {/* Image — shown full-width when available */}
                    {post.image && (
                      <img
                        src={post.image}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-lg mb-2 border border-gray-100 group-hover:brightness-95 transition"
                      />
                    )}
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-gray-400 font-bold shrink-0 w-3 mt-0.5">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                          {post.content}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-orange-500">
                          <MapPin size={9} />
                          {post.city}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community Stats */}
          {!loading && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <BarChart2 size={12} className="text-indigo-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stats</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Total Posts",    value: posts.length    },
                  { label: "Total Likes",    value: totalLikes      },
                  { label: "Total Comments", value: totalComments   },
                  { label: "Cities Covered", value: topCities.length },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-bold text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200">
            <div className="p-6">
              <CreatePost refreshFeed={refreshFeed} setShowModal={setShowModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Community;