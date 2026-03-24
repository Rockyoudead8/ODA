const mongoose = require("mongoose");

const PlacesSchema = new mongoose.Schema({
  city: { type: String, required: true, unique: true },
  places: { type: Array, default: [] },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Places", PlacesSchema);