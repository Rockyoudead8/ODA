const mongoose = require("mongoose");

const quizResultSchema = new mongoose.Schema({
  userId: String,
  city: String,
  score: Number,
  total: Number,
  date: { type: Date, default: Date.now },
});


module.exports = mongoose.models.QuizResult || mongoose.model("QuizResult", quizResultSchema);
