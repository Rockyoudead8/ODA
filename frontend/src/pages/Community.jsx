import { useEffect, useState } from "react";
import CreatePost from "../components/CreatePost";

function Community({ user }) {
    const [commentText, setCommentText] = useState({});
    const [posts, setPosts] = useState([]);
    const [replyText, setReplyText] = useState({});
    const [showReplyBox, setShowReplyBox] = useState({});

    useEffect(() => {
        fetch("http://localhost:8000/api/community/feed", {
            credentials: "include"
        })
            .then((res) => res.json())
            .then((data) => setPosts(data))
            .catch((err) => console.error("Error fetching posts:", err));
    }, []);

    const refreshFeed = async () => {
        const res = await fetch("http://localhost:8000/api/community/feed", {
            credentials: "include"
        });
        const data = await res.json();
        setPosts(data);
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

        refreshFeed();

        setCommentText({
            ...commentText,
            [postId]: ""
        });
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

        refreshFeed();

        setReplyText({
            ...replyText,
            [commentId]: ""
        });

        setShowReplyBox({
            ...showReplyBox,
            [commentId]: false
        });
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
                Community Stories
            </h1>

            <CreatePost refreshFeed={refreshFeed} />

            {posts.map((post) => {
                // 🔥 FIX LIKE CHECK (handles object or string)
                const isLiked = post.likes.some(
                    (like) =>
                        (like._id || like).toString() ===
                        user?._id?.toString()
                );

                return (
                    <div
                        key={post._id}
                        className="bg-white shadow-lg rounded-xl p-5 mb-6 border hover:shadow-xl transition"
                    >
                        {/* 🔥 CITY HEADER (MAIN SUBJECT) */}
                        <div className="mb-3">
                            <h2 className="text-2xl font-bold text-blue-600">
                                📍 {post.city}
                            </h2>
                        </div>

                        {/* 🔥 USER INFO */}
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                            <span className="font-medium text-gray-700">
                                {post.user?.name || "Unknown User"}
                            </span>

                            <span>
                                {new Date(post.createdAt).toLocaleString()}
                            </span>
                        </div>

                        {/* CONTENT */}
                        <p className="mt-2 text-gray-800">{post.content}</p>

                        {post.image && (
                            <img
                                src={post.image}
                                alt="post"
                                className="mt-3 rounded-lg w-full max-h-96 object-cover"
                            />
                        )}

                        {/* 🔥 ACTIONS */}
                        <div className="flex items-center gap-4 mt-4">
                            <button
                                onClick={() => likePost(post._id)}
                                className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                                    isLiked
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            >
                                👍 {post.likes.length}
                            </button>
                        </div>

                        {/* COMMENTS */}
                        <div className="mt-5">
                            <h4 className="font-semibold mb-3">
                                Comments ({post.comments.length})
                            </h4>

                            {/* ADD COMMENT */}
                            <div className="flex gap-2 mb-4">
                                <input
                                    value={commentText[post._id] || ""}
                                    onChange={(e) =>
                                        setCommentText({
                                            ...commentText,
                                            [post._id]: e.target.value
                                        })
                                    }
                                    placeholder="Write a comment..."
                                    className="flex-1 border p-2 rounded-lg text-sm"
                                />

                                <button
                                    onClick={() => addComment(post._id)}
                                    className="bg-blue-500 text-white px-4 rounded-lg"
                                >
                                    Post
                                </button>
                            </div>

                            {/* COMMENT LIST */}
                            {post.comments.map((comment) => (
                                <div key={comment._id} className="mb-4">
                                    <p className="text-sm">
                                        <span className="font-semibold text-gray-800">
                                            {comment.user?.name || "User"}
                                        </span>{" "}
                                        {comment.text}
                                    </p>

                                    <button
                                        onClick={() =>
                                            setShowReplyBox({
                                                ...showReplyBox,
                                                [comment._id]:
                                                    !showReplyBox[comment._id]
                                            })
                                        }
                                        className="text-xs text-blue-500 mt-1 hover:underline"
                                    >
                                        Reply
                                    </button>

                                    {/* REPLIES */}
                                    <div className="ml-4 mt-2 space-y-1">
                                        {comment.replies.map((reply) => (
                                            <p
                                                key={reply._id}
                                                className="text-sm text-gray-600"
                                            >
                                                <span className="font-semibold text-gray-700">
                                                    {reply.user?.name || "User"}
                                                </span>{" "}
                                                {reply.text}
                                            </p>
                                        ))}
                                    </div>

                                    {/* REPLY INPUT */}
                                    {showReplyBox[comment._id] && (
                                        <div className="ml-4 mt-2 flex gap-2">
                                            <input
                                                value={
                                                    replyText[comment._id] || ""
                                                }
                                                onChange={(e) =>
                                                    setReplyText({
                                                        ...replyText,
                                                        [comment._id]:
                                                            e.target.value
                                                    })
                                                }
                                                placeholder="Write a reply..."
                                                className="flex-1 border p-1 rounded text-sm"
                                            />

                                            <button
                                                onClick={() =>
                                                    addReply(
                                                        post._id,
                                                        comment._id
                                                    )
                                                }
                                                className="bg-gray-300 px-3 rounded text-sm"
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
            })}
        </div>
    );
}

export default Community;