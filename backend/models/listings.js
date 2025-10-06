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
  visits: {
    type: Number,
    default: 0,
  },

  // store multiple image URLs
  images: {
    type: [String], // array of strings
    default: []     // optional, default empty array
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Listing', listingSchema);
