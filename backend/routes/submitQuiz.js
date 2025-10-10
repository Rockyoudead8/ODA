const express = require("express");
const router = express.Router();
const QuizResult = require("../models/QuizResult");
const isLoggedIn = require("../middlewares/mw"); // make sure you have auth middleware

// POST /api/submit_quiz/  (keep this for submitting quizzes)
router.post("/", async (req, res) => {
  try {
    const { city, userAnswers, correctAnswers } = req.body;
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!city || !userAnswers || !correctAnswers) {
      return res.status(400).json({ error: "Missing required data." });
    }

    if (userAnswers.length !== correctAnswers.length) {
      return res.status(400).json({ error: "Question count mismatch." });
    }

    let score = 0;
    userAnswers.forEach((userAnswerIndex, i) => {
      const correctAnswerIndex = correctAnswers[i];
      if (Number(userAnswerIndex) === Number(correctAnswerIndex)) score++;
    });

    const newResult = new QuizResult({
      userId: req.user._id, // use session user
      city,
      score,
      totalQuestions: correctAnswers.length,
      date: new Date(),
    });

    await newResult.save();

    res.status(200).json({
      message: "Quiz submitted successfully",
      score,
      totalQuestions: correctAnswers.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});

// GET /api/submit_quiz/get_quiz  (fetch quizzes for logged-in user)
router.get("/get_quiz", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;

    const quizResults = await QuizResult.find({ userId });
    if (!quizResults || quizResults.length === 0) {
      return res.status(404).json({ error: "No quiz results found" });
    }

    res.status(200).json(quizResults);
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
});

module.exports = router;
