import { useEffect, useState } from "react";
import CreatePost from "../components/CreatePost";
import { ThumbsUp } from "lucide-react";

function Community({ user }) {
  const [commentText, setCommentText] = useState({});
  const [posts, setPosts] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [showReplyBox, setShowReplyBox] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/community/feed", { credentials: "include" })
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const refreshFeed = async () => {
    setLoading(true);
    const res = await fetch("http://localhost:8000/api/community/feed", { credentials: "include" });
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };

  const likePost = async (postId) => {
    await fetch(`http://localhost:8000/api/community/${postId}/like`, {
      method: "POST",
      credentials: "include"
    });
    refreshFeed();
  };

  const addComment = async (postId) => {
    const text = commentText[postId];
    if (!text) return;

    await fetch(`http://localhost:8000/api/community/${postId}/comment`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    setCommentText({ ...commentText, [postId]: "" });
    refreshFeed();
  };

  const addReply = async (postId, commentId) => {
    const text = replyText[commentId];
    if (!text) return;

    await fetch(
      `http://localhost:8000/api/community/${postId}/comment/${commentId}/reply`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      }
    );

    setReplyText({ ...replyText, [commentId]: "" });
    setShowReplyBox({ ...showReplyBox, [commentId]: false });
    refreshFeed();
  };

  const scrollToPost = (postId) => {
    const element = document.getElementById(`post-${postId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const mostLikedPosts = [...posts].sort((a, b) => b.likes.length - a.likes.length);
  const latestPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-100">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-12 gap-6">

        {/* LEFT PANEL */}
        <div className="col-span-3 space-y-6 sticky top-6 h-fit pr-4 border-r border-blue-400/30">
          <div className="backdrop-blur-lg bg-white/60 p-5 rounded-2xl border border-blue-400/40 shadow-sm">
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-blue-600/90 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              + Create Post
            </button>
          </div>

          <div className="backdrop-blur-lg bg-gradient-to-br from-white/70 via-blue-50/50 to-purple-50/50 p-6 rounded-2xl border-l-4 border-blue-400 shadow-md">
  <h3 className="font-semibold text-gray-800 mb-4 text-lg">Active Users</h3>
  <div className="flex flex-col space-y-2">
    {[...new Set(posts.map(p => p.user?.name))]
      .slice(0, 5)
      .map((name, i) => (
        <span
          key={i}
          className="inline-block bg-blue-100/50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 transition"
        >
          {name}
        </span>
      ))}
  </div>
</div>

          <div className="backdrop-blur-lg bg-white/70 p-5 rounded-2xl border-l-4 border-purple-400 shadow-sm">
  <h3 className="font-semibold text-purple-800 mb-4 text-lg">Community Guidelines</h3>
  <ul className="space-y-3">
    <li className="flex items-center gap-2 bg-purple-50/60 p-2 rounded-lg hover:bg-purple-100 transition">
      <span className="text-purple-600 font-bold">•</span>
      <span className="text-gray-700 text-sm">Be respectful</span>
    </li>
    <li className="flex items-center gap-2 bg-purple-50/60 p-2 rounded-lg hover:bg-purple-100 transition">
      <span className="text-purple-600 font-bold">•</span>
      <span className="text-gray-700 text-sm">No spam</span>
    </li>
    <li className="flex items-center gap-2 bg-purple-50/60 p-2 rounded-lg hover:bg-purple-100 transition">
      <span className="text-purple-600 font-bold">•</span>
      <span className="text-gray-700 text-sm">Stay relevant</span>
    </li>
  </ul>
</div>
        </div>

        {/* MIDDLE PANEL */}
        <div className="col-span-6 max-h-screen overflow-y-auto px-2">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Most Liked Posts</h1>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-white/60 rounded-2xl p-6 border border-gray-200 max-w-3xl mx-auto">
                  <div className="h-5 bg-gray-300 rounded w-1/3 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-300 rounded"></div>
                    <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                  </div>
                  <div className="h-40 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            mostLikedPosts.map(post => {
              const isLiked = post.likes.some(
                like => (like._id || like).toString() === user?._id?.toString()
              );
              return (
                <div
                  key={post._id}
                  id={`post-${post._id}`}
                  className="backdrop-blur-lg bg-white/80 border border-gray-200 rounded-2xl p-6 mb-6 shadow-md hover:shadow-lg transition max-w-3xl mx-auto"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">📍 {post.city}</h2>
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>{post.user?.name || "User"}</span>
                    <span>{new Date(post.createdAt).toLocaleString()}</span>
                  </div>

                  <p className="mt-2 text-gray-800">{post.content}</p>

                  {post.image && (
                    <img
                      src={post.image}
                      alt="post"
                      className="mt-4 rounded-xl w-full max-h-96 object-cover border border-gray-200"
                    />
                  )}

                  <button
                    onClick={() => likePost(post._id)}
                    className={`mt-4 flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                      isLiked
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "bg-white/60 text-gray-600 border border-gray-300 hover:bg-white/80"
                    }`}
                  >
                    <ThumbsUp
                      size={16}
                      color={isLiked ? "#1D4ED8" : "#4B5563"}
                      fill={isLiked ? "#1D4ED8" : "none"}
                    />
                    {post.likes.length}
                  </button>

                  {/* Comments Section */}
                  <div className="mt-6 border-t border-gray-300 pt-4">
                    <h4 className="text-sm font-medium mb-3">Comments ({post.comments.length})</h4>

                    <div className="flex gap-2 mb-4 border rounded-lg border-gray-200 p-2 bg-gray-50">
                      <input
                        value={commentText[post._id] || ""}
                        onChange={e =>
                          setCommentText({ ...commentText, [post._id]: e.target.value })
                        }
                        placeholder="Write a comment..."
                        className="flex-1 bg-white p-2 rounded-md text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <button
                        onClick={() => addComment(post._id)}
                        className="bg-blue-600 text-white px-4 rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        Post
                      </button>
                    </div>

                    {post.comments.map(comment => (
                      <div key={comment._id} className="mb-4 border rounded-lg border-gray-200 p-3 bg-gray-50">
                        <p className="text-sm text-gray-800">
                          <span className="font-medium">{comment.user?.name || "User"}</span>{" "}
                          {comment.text}
                        </p>

                        <button
                          onClick={() =>
                            setShowReplyBox({ ...showReplyBox, [comment._id]: !showReplyBox[comment._id] })
                          }
                          className="text-xs text-blue-600 mt-1 hover:underline"
                        >
                          Reply
                        </button>

                        <div className="ml-4 mt-2 border-l border-gray-300 pl-3 space-y-1">
                          {comment.replies.map(reply => (
                            <p key={reply._id} className="text-sm text-gray-700">
                              <span className="font-medium">{reply.user?.name || "User"}</span>{" "}
                              {reply.text}
                            </p>
                          ))}
                        </div>

                        {showReplyBox[comment._id] && (
                          <div className="ml-4 mt-2 flex gap-2">
                            <input
                              value={replyText[comment._id] || ""}
                              onChange={e =>
                                setReplyText({ ...replyText, [comment._id]: e.target.value })
                              }
                              className="flex-1 bg-white p-2 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                              placeholder="Write a reply..."
                            />
                            <button
                              onClick={() => addReply(post._id, comment._id)}
                              className="bg-blue-100 text-blue-700 px-3 rounded text-sm hover:bg-blue-200 transition"
                            >
                              Send
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-3 space-y-6 sticky top-6 h-fit pl-4 border-l border-blue-400/30">
          {loading ? (
            <div className="space-y-6">
              <div className="animate-pulse backdrop-blur-lg bg-white/60 p-5 rounded-2xl border border-white/40">
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="mb-4">
                    <div className="h-24 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-lg bg-white/60 p-5 rounded-2xl border border-white/40 shadow-sm">
              <h3 className="font-semibold mb-4">Latest Posts</h3>
              <div className="space-y-4">
                {latestPosts.slice(0, 3).map(post => (
                  <div key={post._id} className="p-3 rounded-xl border border-white/40">
                    {post.image && (
                      <img
                        src={post.image}
                        alt="preview"
                        className="w-full h-24 object-cover rounded-lg mb-2 border border-gray-200"
                      />
                    )}
                    <p
                      onClick={() => scrollToPost(post._id)}
                      className="text-sm text-gray-700 cursor-pointer hover:text-blue-600 transition"
                    >
                      {post.content.slice(0, 60)}...
                    </p>
                    <p
                      onClick={() => scrollToPost(post._id)}
                      className="text-xs text-blue-600 mt-1 cursor-pointer hover:text-indigo-500 transition"
                    >
                      📍 {post.city}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex justify-center items-center z-50">
          <div className="backdrop-blur-lg bg-white/80 p-6 rounded-2xl w-full max-w-lg border border-white/40 shadow-lg">
            <CreatePost refreshFeed={refreshFeed} setShowModal={setShowModal} />
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-sm text-gray-600 hover:text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Community;