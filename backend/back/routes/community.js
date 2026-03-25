const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Listing = require("../models/listings");
const CityPoints = require("../models/CityPoints");
const parser = require("../config/upload");
const passport = require("passport");

// ── Create Post ──────────────────────────────────────────────────────────────
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  parser.single("image"),
  async (req, res) => {
    try {
      const post = new Post({
        user: req.user._id,
        city: req.body.city,
        content: req.body.content,
        image: req.file ? req.file.path : null,
      });
      await post.save();
      if (req.body.city && req.body.city.trim()) {
        const matchedListing = await Listing.findOne({
          title: { $regex: new RegExp(`^${req.body.city.trim()}$`, "i") },
        });
        if (matchedListing) {
          await CityPoints.findOneAndUpdate(
            { userId: req.user._id, cityName: matchedListing.title },
            { $inc: { postPoints: 10 }, $set: { updatedAt: new Date() } },
            { upsert: true, new: true }
          );
        }
      }
      res.json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// ── Feed ─────────────────────────────────────────────────────────────────────
router.get("/feed", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name profilePhoto")
      .populate("comments.user", "name profilePhoto")
      .populate("comments.replies.user", "name profilePhoto")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ── My Posts ──────────────────────────────────────────────────────────────────
router.get(
  "/my-posts",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user._id })
        .populate("user", "name profilePhoto")
        .populate("comments.user", "name profilePhoto")
        .populate("comments.replies.user", "name profilePhoto")
        .sort({ createdAt: -1 });
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch your posts" });
    }
  }
);

// ── My Comments ───────────────────────────────────────────────────────────────
router.get(
  "/my-comments",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userId = req.user._id.toString();
      const posts = await Post.find({ "comments.user": req.user._id })
        .populate("user", "name profilePhoto")
        .populate("comments.user", "name profilePhoto")
        .sort({ createdAt: -1 });

      const myComments = [];
      posts.forEach((post) => {
        post.comments.forEach((c) => {
          const cUserId = (c.user?._id ?? c.user)?.toString();
          if (cUserId === userId) {
            myComments.push({
              _id: c._id,
              text: c.text,
              createdAt: c.createdAt,
              user: c.user,
              postId: post._id,
              postCity: post.city,
              postContent: post.content,
            });
          }
        });
      });

      myComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json(myComments);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch your comments" });
    }
  }
);

// ── Delete Post ───────────────────────────────────────────────────────────────
router.delete(
  "/:postId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      if (post.user.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Unauthorized" });
      await Post.findByIdAndDelete(req.params.postId);
      res.json({ message: "Post deleted" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// ── Add Comment ───────────────────────────────────────────────────────────────
router.post(
  "/:postId/comment",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { text } = req.body;
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      post.comments.push({ user: req.user._id, text });
      await post.save();
      if (post.city) {
        const matchedListing = await Listing.findOne({
          title: { $regex: new RegExp(`^${post.city.trim()}$`, "i") },
        });
        if (matchedListing) {
          await CityPoints.findOneAndUpdate(
            { userId: req.user._id, cityName: matchedListing.title },
            { $inc: { commentPoints: 5 }, $set: { updatedAt: new Date() } },
            { upsert: true, new: true }
          );
        }
      }
      res.json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// ── Delete Comment ────────────────────────────────────────────────────────────
router.delete(
  "/:postId/comment/:commentId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      const comment = post.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ message: "Comment not found" });
      const isCommentOwner = comment.user?.toString() === req.user._id.toString();
      const isPostOwner = post.user?.toString() === req.user._id.toString();
      if (!isCommentOwner && !isPostOwner)
        return res.status(403).json({ message: "Unauthorized" });
      post.comments.pull({ _id: req.params.commentId });
      await post.save();
      res.json({ message: "Comment deleted" });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// ── Reply to Comment ──────────────────────────────────────────────────────────
router.post(
  "/:postId/comment/:commentId/reply",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { text } = req.body;
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      const comment = post.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ message: "Comment not found" });
      comment.replies.push({ user: req.user._id, text });
      await post.save();
      res.json(post);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// ── Like / Unlike Post ────────────────────────────────────────────────────────
router.post(
  "/:postId/like",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      const userId = req.user._id;
      if (post.likes.some((id) => id.toString() === userId.toString())) {
        post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
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