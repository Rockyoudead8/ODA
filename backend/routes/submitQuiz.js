const express = require("express");
const router = express.Router();
const QuizResult = require("../models/QuizResult");

// POST /api/submit_quiz/
router.post("/", async (req, res) => {
  try {
    const { userId, city, userAnswers, correctAnswers } = req.body;
    if (!userId || !city || !userAnswers || !correctAnswers) {
      return res.status(400).json({ error: "Missing required data." });
    }

    if (userAnswers.length !== correctAnswers.length) {
      return res.status(400).json({ error: "Question count mismatch." });
    }

    let score = 0;
    // --- ROBUST SCORING LOGIC ---
    userAnswers.forEach((userAnswerIndex, i) => {
      const correctAnswerIndex = correctAnswers[i];
      // Use Number() to prevent type mismatch (e.g., "1" === 1 is false)
      if (Number(userAnswerIndex) === Number(correctAnswerIndex)) {
        score++;
      }
    });

    const newResult = new QuizResult({
      userId,
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

// POST /api/submit_quiz/get_quiz
router.post("/get_quiz", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const quizResults = await QuizResult.find({ userId });
    if (!quizResults) {
        return res.status(404).json({ error: "No quiz results found" });
    }
    res.status(200).json(quizResults);
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
});

module.exports = router;