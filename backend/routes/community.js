// const express = require("express");
// const router = express.Router();
// const Post = require("../models/Post");

// router.post("/create", async (req, res) => {
//   try {
//     const post = new Post(req.body);
//     await post.save();
//     res.json(post);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// router.get("/feed", async (req, res) => {
//   const posts = await Post.find()
//     .populate("user")
//     .sort({ createdAt: -1 });

//   res.json(posts);
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const parser = require("../config/upload");
const passport = require("passport");
// router.post("/create", async (req, res) => {
//   try {
//     const post = new Post(req.body);
//     await post.save();
//     res.json(post);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });
router.post(
    "/create",
    passport.authenticate("jwt", { session: false }),
    parser.single("image"),
    async (req, res) => {
        try {
            console.log("CREATE POST HIT");
            const post = new Post({
                user: req.user._id,
                city: req.body.city,
                content: req.body.content,
                image: req.file ? req.file.path : null
            });

            await post.save();

            res.json(post);

        } catch (err) {
            res.status(500).json(err);
        }
    }
);

// to show the posts in the feed page of the community section
router.get("/feed", async (req, res) => {
    console.log("GET FEED HIT");
    const posts = await Post.find()
        .populate("user", "name")
        .populate("comments.user", "name")
        .populate("comments.replies.user", "name")
        .sort({ createdAt: -1 });

    res.json(posts);
});
/* ADD COMMENT TO POST */

router.post(
    "/:postId/comment",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {

            const { text } = req.body;

            const post = await Post.findById(req.params.postId);

            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }

            post.comments.push({
                user: req.user._id,
                text: text
            });

            await post.save();

            res.json(post);

        } catch (err) {
            res.status(500).json(err);
        }
    }
);

/* REPLY TO A COMMENT */

router.post(
    "/:postId/comment/:commentId/reply",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        try {

            const { text } = req.body;

            const post = await Post.findById(req.params.postId);

            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }

            const comment = post.comments.id(req.params.commentId);

            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            comment.replies.push({
                user: req.user._id,
                text: text
            });

            await post.save();

            res.json(post);

        } catch (err) {
            res.status(500).json(err);
        }
    }
);


// like a post and unlike a post
router.post(
    "/:postId/like",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {

        try {

            const post = await Post.findById(req.params.postId);

            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }

            const userId = req.user._id;
            if (post.likes.some(id => id.toString() === userId.toString())) {
                post.likes = post.likes.filter(id => id.toString() !== userId.toString());
            } else {
                post.likes.push(userId);
            }

            await post.save();

            res.json(post);

        } catch (err) {
            res.status(500).json(err);
        }

    }
);

module.exports = router;