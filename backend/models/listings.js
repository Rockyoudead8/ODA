const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  drills: {
    type: String
  },
  description: String,
  // store multiple image URLs
  images: {
    type: [String], // array of strings
    default: []     // optional, default empty array
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Listing', listingSchema);
