
const mongoose = require("mongoose");

const CityDataSchema = new mongoose.Schema({
  city: { type: String, required: true, unique: true },
  data: { type: Object, required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CityData", CityDataSchema);