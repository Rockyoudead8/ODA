import { motion } from "framer-motion";
import { Loader2, MapPin, FileText, MessageSquare, Trash2 } from "lucide-react";
import { Avatar, EmptyState } from "./AdminShared";

export default function AdminActivity({
  activityLoading, activityTab, setActivityTab,
  userPosts, myCommentsList, userData,
  deletingPostId, deletingCommentKey,
  handleDeletePost, handleDeleteComment,
}) {
  return (
    <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

      <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-xl p-1 w-fit mb-5 flex-wrap">
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
                      <button onClick={() => handleDeletePost(post._id)} disabled={deletingPostId === post._id}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors shrink-0 disabled:opacity-40" title="Delete post">
                        {deletingPostId === post._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed mt-3">{post.content}</p>
                    {post.image && <img src={post.image} alt="post" className="mt-3 rounded-xl w-full max-h-52 object-cover border border-zinc-700/50" />}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-700/40 text-xs text-zinc-500">
                      <span>👍 {post.likes?.length || 0} likes</span>
                      <span className="flex items-center gap-1"><MessageSquare size={12} />{post.comments?.length || 0} comments</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

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
                        <button onClick={() => handleDeleteComment(comment.postId, comment._id)} disabled={deletingCommentKey === key}
                          className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors shrink-0 disabled:opacity-40" title="Delete comment">
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
  );
}