const express = require("express");
const router = express.Router();
const QuizResult = require("../models/QuizResult");
const CityPoints = require("../models/CityPoints");
const passport = require("passport");

// POST /api/submit_quiz/
router.post("/", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { city, userAnswers, correctAnswers } = req.body;
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!city || !userAnswers || !correctAnswers)
      return res.status(400).json({ error: "Missing required data." });
    if (userAnswers.length !== correctAnswers.length)
      return res.status(400).json({ error: "Question count mismatch." });

    let score = 0;
    userAnswers.forEach((userAnswerIndex, i) => {
      if (Number(userAnswerIndex) === Number(correctAnswers[i])) score++;
    });

    const newResult = new QuizResult({
      userId: req.user._id,
      city,
      score,
      totalQuestions: correctAnswers.length,
      date: new Date(),
    });
    await newResult.save();

    const pointsEarned = score * 10;
    if (pointsEarned > 0) {
      await CityPoints.findOneAndUpdate(
        { userId: req.user._id, cityName: city },
        { $inc: { quizPoints: pointsEarned }, $set: { updatedAt: new Date() } },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ message: "Quiz submitted successfully", score, totalQuestions: correctAnswers.length, pointsEarned });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

// GET /api/submit_quiz/get_quiz — uses JWT so it works with cookie auth
router.get("/get_quiz", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const quizResults = await QuizResult.find({ userId: req.user._id }).sort({ date: 1 });
    if (!quizResults || quizResults.length === 0)
      return res.status(200).json([]);  // return empty array instead of 404
    res.status(200).json(quizResults);
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
});

module.exports = router;