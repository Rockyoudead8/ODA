const mongoose = require("mongoose");
// Connect to MongoDB


const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  thumbnail: String,
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category'
//   },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Listing', listingSchema);
