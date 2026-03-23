import { useEffect, useState, useRef, useContext } from "react";
import CreatePost from "../components/CreatePost";
import { UserContext } from "../UserContext";
import {
  ThumbsUp, Flame, Clock, Users, MapPin,
  BarChart2, TrendingUp, Share2, Bookmark, Trash2,
} from "lucide-react";

function timeAgo(dateStr) {
  const s = (Date.now() - new Date(dateStr)) / 1000;
  if (s < 60)         return `${Math.floor(s)}s ago`;
  if (s < 3600)       return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)      return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// Avatar: shows profile photo if available, else initial
function Avatar({ user, size = "sm" }) {
  const dim = size === "lg" ? "w-10 h-10 text-sm" : size === "md" ? "w-8 h-8 text-xs" : "w-7 h-7 text-xs";
  if (user?.profilePhoto) {
    return <img src={user.profilePhoto} alt={user.name} className={`${dim} rounded-full object-cover border border-zinc-600 shrink-0`} />;
  }
  return (
    <div className={`${dim} rounded-full bg-gradient-to-br from-violet-700 to-pink-600 text-white font-bold flex items-center justify-center shrink-0`}>
      {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
  );
}

function Community() {
  const { user } = useContext(UserContext);
  const [commentText,  setCommentText]  = useState({});
  const [posts,        setPosts]        = useState([]);
  const [replyText,    setReplyText]    = useState({});
  const [showReplyBox, setShowReplyBox] = useState({});
  const [showModal,    setShowModal]    = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("liked");
  const [saved,        setSaved]        = useState({});
  const [deletingId,   setDeletingId]   = useState(null);

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
    const userId = (user?._id ?? user?.id)?.toString() ?? null;
    if (userId) {
      setPosts(prev => prev.map(p => {
        if (p._id?.toString() !== postId.toString()) return p;
        const alreadyLiked = p.likes.some(l => (l?._id ?? l)?.toString() === userId);
        return { ...p, likes: alreadyLiked ? p.likes.filter(l => (l?._id ?? l)?.toString() !== userId) : [...p.likes, userId] };
      }));
    }
    await fetch(`http://localhost:8000/api/community/${postId}/like`, { method: "POST", credentials: "include" });
    await refreshFeed();
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    setDeletingId(postId);
    try {
      await fetch(`http://localhost:8000/api/community/${postId}`, { method: "DELETE", credentials: "include" });
      setPosts(prev => prev.filter(p => p._id?.toString() !== postId.toString()));
    } catch (err) { console.error("Delete failed:", err); }
    finally { setDeletingId(null); }
  };

  const toggleSave = (postId) => setSaved(prev => ({ ...prev, [postId]: !prev[postId] }));

  const sharePost = (post) => {
    const text = `${post.city} — ${post.content.slice(0, 80)}`;
    if (navigator.share) navigator.share({ title: post.city, text }).catch(() => {});
    else navigator.clipboard?.writeText(text);
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

  const currentUserId = (user?._id ?? user?.id)?.toString() ?? null;

  const activeUsers = [...new Map(
    posts.filter(p => p.user?._id && p.user?.name).map(p => [p.user._id, p.user])
  ).entries()].slice(0, 5);

  const topCities = Object.entries(
    posts.reduce((acc, p) => { if (p.city) acc[p.city] = (acc[p.city] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const totalLikes    = posts.reduce((s, p) => s + (p.likes?.length    ?? 0), 0);
  const totalComments = posts.reduce((s, p) => s + (p.comments?.length ?? 0), 0);

  const displayedPosts = activeTab === "liked"
    ? [...posts].sort((a, b) => b.likes.length - a.likes.length)
    : [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const latestPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const sidebarInputCls = "w-full px-3 py-2 bg-zinc-700/60 border border-zinc-600/60 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 transition";

  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="flex" style={{ height: "calc(100vh - 64px)" }}>

        {/* ══ LEFT SIDEBAR ══ */}
        <div className="w-64 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#52525b #18181b" }}>

          <div className="px-4 pt-5 pb-3 shrink-0">
            <button onClick={() => setShowModal(true)}
              className="w-full bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              + Create Post
            </button>
          </div>

          {/* Sort */}
          <div className="px-3 pb-1">
            <p className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Sort</p>
            {[{ key: "liked", icon: Flame, label: "Hot" }, { key: "latest", icon: Clock, label: "New" }].map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === key ? "bg-violet-900/50 text-violet-300" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                <Icon size={14} className={activeTab === key ? "text-violet-400" : "text-zinc-500"} />
                {label}
              </button>
            ))}
          </div>

          <div className="mx-4 my-2 border-t border-zinc-800" />

          {/* Members */}
          <div className="px-3 pb-1">
            <p className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <Users size={10} /> Members
            </p>
            {activeUsers.length === 0 ? (
              <p className="px-3 text-xs text-zinc-600">No activity yet</p>
            ) : (
              activeUsers.map(([id, u]) => (
                <div key={id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-default">
                  <Avatar user={u} size="sm" />
                  <span className="text-xs text-zinc-300 truncate">{u.name}</span>
                </div>
              ))
            )}
          </div>

          <div className="mx-4 my-2 border-t border-zinc-800" />

          {/* Top Cities */}
          {!loading && topCities.length > 0 && (
            <div className="px-3 pb-1">
              <p className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <MapPin size={10} className="text-orange-400" /> Top Cities
              </p>
              <div className="px-3 space-y-2.5 mt-1">
                {topCities.map(([city, count], i) => {
                  const pct = Math.round((count / topCities[0][1]) * 100);
                  return (
                    <div key={city}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-300 font-medium flex items-center gap-1.5 truncate">
                          <span className="text-zinc-600 w-3 shrink-0">{i+1}.</span>
                          <span className="truncate">{city}</span>
                        </span>
                        <span className="text-zinc-500 shrink-0 ml-2">{count}</span>
                      </div>
                      <div className="h-1 bg-zinc-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mx-4 my-2 border-t border-zinc-800" />

          {/* Guidelines */}
          <div className="px-3 pb-4">
            <p className="px-3 py-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Guidelines</p>
            {["Be respectful", "No spam", "Stay on topic"].map(r => (
              <div key={r} className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-500">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0" />{r}
              </div>
            ))}
          </div>
        </div>

        {/* Middle + right */}
        <div className="flex flex-1 gap-3 pl-4 pr-12 py-5 overflow-hidden">

          {/* ══ MIDDLE PANEL ══ */}
          <div ref={middlePanelRef} className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#52525b transparent" }}>
            {loading ? (
              <div className="max-w-2xl mx-auto space-y-3 pt-1">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse bg-zinc-800/60 rounded-2xl border border-zinc-700/50 p-5">
                    <div className="flex gap-3"><div className="w-8 h-8 bg-zinc-700 rounded-full shrink-0" /><div className="flex-1 space-y-2"><div className="h-3 bg-zinc-700 rounded w-1/3" /><div className="h-3 bg-zinc-700/60 rounded w-1/4" /></div></div>
                    <div className="mt-3 space-y-2"><div className="h-3 bg-zinc-700 rounded" /><div className="h-3 bg-zinc-700 rounded w-5/6" /></div>
                    <div className="h-36 bg-zinc-700/60 rounded-lg mt-3" />
                  </div>
                ))}
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="max-w-2xl mx-auto mt-16 bg-zinc-800/60 rounded-2xl border border-zinc-700/50 p-12 text-center">
                <Flame size={28} className="text-zinc-600 mx-auto mb-3" />
                <p className="font-semibold text-zinc-300">No posts yet</p>
                <p className="text-xs text-zinc-500 mt-1">Be the first to share a city story</p>
                <button onClick={() => setShowModal(true)} className="mt-4 px-5 py-2 bg-violet-700 text-white text-sm font-semibold rounded-xl hover:bg-violet-600 transition">Create Post</button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-3 pt-1 pb-6">
                {displayedPosts.map(post => {
                  const isLiked   = currentUserId ? post.likes.some(l => (l?._id ?? l)?.toString() === currentUserId) : false;
                  const isSaved   = !!saved[post._id];
                  const isOwner   = currentUserId && (post.user?._id ?? post.user?.id)?.toString() === currentUserId;
                  const isDeleting = deletingId === post._id;

                  return (
                    <div key={post._id} id={`post-${post._id}`}
                      className="bg-zinc-800/60 border border-zinc-700/50 hover:border-zinc-600/70 rounded-2xl transition-colors shadow-sm overflow-hidden"
                    >
                      <div className="p-4">
                        {/* Post header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar user={post.user} size="md" />
                            <div>
                              <p className="text-sm font-semibold text-zinc-100 leading-tight">{post.user?.name ?? "Unknown"}</p>
                              <p className="text-xs text-zinc-500">{timeAgo(post.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="inline-flex items-center gap-1 bg-orange-900/30 border border-orange-800/40 text-orange-400 text-xs font-semibold px-2.5 py-1 rounded-full">
                              <MapPin size={10} className="shrink-0" />{post.city}
                            </span>
                            {isOwner && (
                              <button onClick={() => deletePost(post._id)} disabled={isDeleting}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors disabled:opacity-40"
                                title="Delete post"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Body */}
                        <p className="text-sm text-zinc-300 leading-relaxed">{post.content}</p>

                        {/* Image */}
                        {post.image && (
                          <img src={post.image} alt="post" className="mt-3 rounded-xl w-full max-h-72 object-cover border border-zinc-700/50" />
                        )}

                        {/* Action bar */}
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-zinc-700/40">
                          <button onClick={() => likePost(post._id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isLiked ? "bg-violet-900/40 text-violet-300" : "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                            }`}
                          >
                            <ThumbsUp size={14} fill={isLiked ? "currentColor" : "none"} />{post.likes.length}
                          </button>
                          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-500">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            {post.comments.length}
                          </span>
                          <button onClick={() => sharePost(post)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors">
                            <Share2 size={14} />Share
                          </button>
                          <button onClick={() => toggleSave(post._id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ml-auto ${isSaved ? "text-amber-400" : "text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"}`}>
                            <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} />{isSaved ? "Saved" : "Save"}
                          </button>
                        </div>

                        {/* Comments */}
                        <div className="mt-3 pt-3 border-t border-zinc-700/40">
                          <div className="flex gap-2 mb-3">
                            <Avatar user={user} size="sm" />
                            <input value={commentText[post._id] || ""} onChange={e => setCommentText(prev => ({ ...prev, [post._id]: e.target.value }))}
                              onKeyDown={e => e.key === "Enter" && addComment(post._id)}
                              placeholder="Write a comment…"
                              className="flex-1 px-3 py-2 rounded-xl text-xs border border-zinc-700 bg-zinc-800/80 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-600 transition"
                            />
                            <button onClick={() => addComment(post._id)} className="bg-violet-700 text-white px-3 rounded-xl text-xs font-semibold hover:bg-violet-600 transition active:scale-95">Post</button>
                          </div>

                          {post.comments.length > 0 && (
                            <div className="space-y-3">
                              {post.comments.map(comment => (
                                <div key={comment._id} className="flex gap-2.5">
                                  <Avatar user={comment.user} size="sm" />
                                  <div className="flex-1 min-w-0">
                                    <div className="bg-zinc-700/50 rounded-xl px-3 py-2 border border-zinc-700/30">
                                      <span className="text-xs font-semibold text-zinc-200 mr-2">{comment.user?.name ?? "User"}</span>
                                      <span className="text-xs text-zinc-400">{comment.text}</span>
                                    </div>
                                    <button onClick={() => setShowReplyBox(prev => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                                      className="text-xs text-zinc-500 hover:text-violet-400 font-semibold mt-1 ml-2 transition">
                                      {showReplyBox[comment._id] ? "Cancel" : "Reply"}
                                    </button>
                                    {comment.replies?.length > 0 && (
                                      <div className="ml-2 mt-2 pl-3 border-l-2 border-zinc-700 space-y-2">
                                        {comment.replies.map(reply => (
                                          <div key={reply._id} className="flex items-start gap-2">
                                            <Avatar user={reply.user} size="sm" />
                                            <div className="bg-zinc-700/40 rounded-lg px-2.5 py-1.5 border border-zinc-700/30">
                                              <span className="text-xs font-semibold text-zinc-200 mr-1.5">{reply.user?.name ?? "User"}</span>
                                              <span className="text-xs text-zinc-400">{reply.text}</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {showReplyBox[comment._id] && (
                                      <div className="ml-2 mt-2 flex gap-2">
                                        <input value={replyText[comment._id] || ""} onChange={e => setReplyText(prev => ({ ...prev, [comment._id]: e.target.value }))}
                                          onKeyDown={e => e.key === "Enter" && addReply(post._id, comment._id)}
                                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-zinc-700 text-xs bg-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/40 transition"
                                          placeholder="Write a reply…"
                                        />
                                        <button onClick={() => addReply(post._id, comment._id)} className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-3 rounded-lg text-xs font-semibold transition">Send</button>
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

          {/* ══ RIGHT PANEL ══ */}
          <div className="w-68 shrink-0 overflow-y-auto space-y-3 py-1" style={{ scrollbarWidth: "none", width: "272px" }}>
            {/* About */}
            <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-12 bg-gradient-to-r from-violet-800 to-pink-700" />
              <div className="p-4">
                <div className="flex items-end gap-2 -mt-7 mb-3">
                  <div className="w-11 h-11 rounded-xl border-2 border-zinc-800 bg-gradient-to-br from-violet-700 to-pink-600 flex items-center justify-center text-xl shadow-lg">🌍</div>
                </div>
                <p className="font-bold text-zinc-100 text-sm">Travel Stories</p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Share city experiences and adventures with fellow explorers worldwide.</p>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-zinc-700/40 text-center">
                  {[{ v: posts.length, l: "Posts" }, { v: activeUsers.length, l: "Members" }, { v: totalLikes, l: "Likes" }].map(({ v, l }) => (
                    <div key={l}>
                      <p className="text-sm font-bold text-zinc-100">{v}</p>
                      <p className="text-xs text-zinc-500">{l}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowModal(true)} className="w-full mt-3 bg-violet-700 hover:bg-violet-600 text-white text-xs font-semibold py-2 rounded-xl transition active:scale-95">
                  + Create Post
                </button>
              </div>
            </div>

            {/* Recent */}
            {!loading && latestPosts.length > 0 && (
              <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-1.5 mb-3">
                  <TrendingUp size={11} className="text-violet-400" />
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Recent</span>
                </div>
                <div className="space-y-3 divide-y divide-zinc-700/40">
                  {latestPosts.slice(0,4).map((post, i) => (
                    <div key={post._id} onClick={() => scrollToPost(post._id)} className="pt-3 first:pt-0 cursor-pointer group">
                      {post.image && <img src={post.image} alt="preview" className="w-full h-20 object-cover rounded-lg mb-2 border border-zinc-700/40 group-hover:brightness-90 transition" />}
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-zinc-600 font-bold shrink-0 w-3 mt-0.5">{i+1}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-zinc-300 group-hover:text-violet-300 transition line-clamp-2 leading-snug">{post.content}</p>
                          <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-orange-400"><MapPin size={9} />{post.city}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {!loading && (
              <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-1.5 mb-3">
                  <BarChart2 size={11} className="text-violet-400" />
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Stats</span>
                </div>
                <div className="space-y-2">
                  {[{ label: "Total Posts", value: posts.length }, { label: "Total Likes", value: totalLikes }, { label: "Total Comments", value: totalComments }, { label: "Cities Covered", value: topCities.length }].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-1 border-b border-zinc-700/40 last:border-0">
                      <span className="text-xs text-zinc-500">{label}</span>
                      <span className="text-xs font-bold text-zinc-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl">
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
