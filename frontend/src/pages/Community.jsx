import { useEffect, useState } from "react";
import CreatePost from "../components/CreatePost";

function Community() {
    const [commentText, setCommentText] = useState({});
    const [posts, setPosts] = useState([]);
    const [replyText, setReplyText] = useState({});
    const [showReplyBox, setShowReplyBox] = useState({});

    useEffect(() => {
        fetch("http://localhost:8000/api/community/feed")
            .then((res) => res.json())
            .then((data) => setPosts(data))
            .catch((err) => console.error("Error fetching posts:", err));
    }, []);

    const likePost = async (postId) => {

        await fetch(`http://localhost:8000/api/community/${postId}/like`, {
            method: "POST",
            credentials: "include"
        });

        const res = await fetch("http://localhost:8000/api/community/feed");
        const data = await res.json();
        setPosts(data);
    };

    const addComment = async (postId) => {

        const text = commentText[postId];

        if (!text) return;

        await fetch(`http://localhost:8000/api/community/${postId}/comment`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        const res = await fetch("http://localhost:8000/api/community/feed");
        const data = await res.json();

        setPosts(data);

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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ text })
            }
        );

        const res = await fetch("http://localhost:8000/api/community/feed");
        const data = await res.json();
        setPosts(data);

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

            <CreatePost />

            {posts.map((post) => (
                <div key={post._id} className="border p-4 rounded mb-4">

                    <h3 className="font-semibold">{post.city}</h3>

                    <p className="mt-2">{post.content}</p>

                    {post.image && (
                        <img
                            src={post.image}
                            alt="post"
                            className="mt-3 rounded-lg w-full"
                        />
                    )}

                    <p className="mt-2 text-sm">
                        Likes: {post.likes.length}
                    </p>

                    <div className="mt-4">
                        <h4 className="font-semibold">Comments</h4>

                        {/* Comment input */}
                        <div className="mt-3">
                            <input
                                value={commentText[post._id] || ""}
                                onChange={(e) =>
                                    setCommentText({
                                        ...commentText,
                                        [post._id]: e.target.value
                                    })
                                }
                                placeholder="Write a comment..."
                                className="border p-2 w-full"
                            />

                            <button
                                onClick={() => addComment(post._id)}
                                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                Comment
                            </button>
                        </div>

                        {post.comments.map((comment) => (
                            <div key={comment._id} className="border-t pt-2 mt-2">

                                <p>
                                    <span className="font-semibold">
                                        {comment.user?.username}
                                    </span>{" "}
                                    {comment.text}
                                </p>

                                {/* Reply toggle button */}
                                <button
                                    onClick={() =>
                                        setShowReplyBox({
                                            ...showReplyBox,
                                            [comment._id]: !showReplyBox[comment._id]
                                        })
                                    }
                                    className="text-blue-500 text-sm ml-2"
                                >
                                    ↩ Reply
                                </button>

                                {/* Replies */}
                                {comment.replies.map((reply) => (
                                    <div key={reply._id} className="ml-4 text-sm text-gray-600 mt-1">
                                        <span className="font-semibold">
                                            {reply.user?.username}
                                        </span>{" "}
                                        {reply.text}
                                    </div>
                                ))}

                                {/* Reply input (dropdown style) */}
                                {showReplyBox[comment._id] && (
                                    <div className="ml-4 mt-2">
                                        <input
                                            value={replyText[comment._id] || ""}
                                            onChange={(e) =>
                                                setReplyText({
                                                    ...replyText,
                                                    [comment._id]: e.target.value
                                                })
                                            }
                                            placeholder="Reply..."
                                            className="border p-1 w-full text-sm"
                                        />

                                        <button
                                            onClick={() => addReply(post._id, comment._id)}
                                            className="mt-1 bg-gray-300 px-2 py-1 rounded text-sm"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                )}

                            </div>
                        ))}

                    </div>

                    <button
                        onClick={() => likePost(post._id)}
                        className="mt-2 bg-gray-200 px-3 py-1 rounded"
                    >
                        👍 Like
                    </button>

                </div>
            ))}

        </div>
    );
}

export default Community;