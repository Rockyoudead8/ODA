const mongoose = require("mongoose");
const express = require("express");
const User = require("../models/users");
const Comment = require("../models/comment");
const Listing = require("../models/listings");
const CityPoints = require("../models/CityPoints");

exports.postComments = async (req, res) => {
  try {
    const { listing, text, image } = req.body;

    if (!listing || (!text && !image)) {
      return res
        .status(400)
        .json({ error: "Listing and comment text or image are required" });
    }

    const listingExists = await Listing.findById(listing);
    if (!listingExists) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const newComment = new Comment({
      listing,
      text: text || "",
      image: image || "",
      user: req.user._id,
    });

    await newComment.save();

    // Award 5 comment points for this city
    await CityPoints.findOneAndUpdate(
      { userId: req.user._id, cityName: listingExists.title },
      {
        $inc: { commentPoints: 5 },
        $set: { updatedAt: new Date() },
      },
      { upsert: true, new: true }
    );

    const populatedComment = await newComment.populate("user", "name email");

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("Error creating comment:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getComments = async (req, res) => {
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
};