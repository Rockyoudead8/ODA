const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    index: true
  },
  lat: Number,
  lng: Number
});

module.exports = mongoose.model("City", citySchema);