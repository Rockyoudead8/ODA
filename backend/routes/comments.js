const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const User = require("../models/users");
const Comment = require("../models/comment");
const Listing = require("../models/listings");


router.post("/", async (req, res) => {
  try {
    const { listing, text, image, userId } = req.body;

    if (!listing || (!text && !image)) {
      return res.status(400).json({ error: "Listing and comment text or image are required" });
    }

    const listingExists = await Listing.findById(listing);
    if (!listingExists) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const newComment = new Comment({
      listing,
      text: text || "",
      image: image || "",
      user: userId,
    });

    await newComment.save();

    const populatedComment = await newComment.populate("user", "name email");

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



router.get("/comments/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;

    const comments = await Comment.find({ listing: listingId })
      .populate("user", "name email") 
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
