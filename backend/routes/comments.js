const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const User = require("../models/users");
const Category = require("../models/category");
const Comment = require("../models/comment");
const Listing = require("../models/listings");
const Quiz = require("../models/quiz");
const QuizResult = require("../models/quizResult");

router.post("/", async (req, res) => {
  try {
    const {listing, text } = req.body;

 
    if ( !listing || !text) {
      return res.status(400).json({ error: "user, listing, and text are required" });
    }

   
    const listingExists = await Listing.findById(listing);
    if (!listingExists) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // const userExists = await User.findById(user);
    // if (!userExists) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    // Save comment
    const newComment = new Comment({
      listing,
      text,
    });

    await newComment.save();

    res.status(201).json(newComment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// commetns ko fetch krne ke liye
router.get("/comments/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;

    const comments = await Comment.find({ listing: listingId })
      .populate("user", "name email") // populate user details
      .sort({ createdAt: -1 }); // latest first

    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
