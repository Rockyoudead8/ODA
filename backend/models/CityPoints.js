const mongoose = require("mongoose");

const cityPointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cityName: {
    type: String,
    required: true,
    trim: true,
  },
  quizPoints: {
    type: Number,
    default: 0,
  },
  commentPoints: {
    type: Number,
    default: 0,
  },
  postPoints: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index so each user has one record per city
cityPointsSchema.index({ userId: 1, cityName: 1 }, { unique: true });

module.exports = mongoose.model("CityPoints", cityPointsSchema);