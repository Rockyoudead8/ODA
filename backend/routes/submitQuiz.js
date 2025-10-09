// from github
const express = require("express");
const router = express.Router();
const QuizResult = require("../models/QuizResult");

router.post("/", async (req, res) => {
  try {
    const { userId, city, userAnswers, correctAnswers } = req.body;

    if (!city || !userAnswers || !correctAnswers) {
      return res.status(400).json({ error: "Missing required data." });
    }

    if (userAnswers.length !== correctAnswers.length) {
      return res.status(400).json({ error: "Question count mismatch." });
    }

    let score = 0;
    const feedback = [];

    const normalize = str => str?.toString().trim().toLowerCase().replace(/\s+/g, " ") || "";

    correctAnswers.forEach((correct, i) => {
      const user = normalize(userAnswers[i]);
      const answer = normalize(correct);

      const isCorrect = user === answer;
      if (isCorrect) score++;

      feedback.push({
        questionNumber: i + 1,
        userAnswer: userAnswers[i],
        correctAnswer: correctAnswers[i],
        isCorrect,
      });
    });

    const previousResults = await QuizResult.find({ userId, city });
    const previousTotal = previousResults.reduce((acc, r) => acc + (r.score || 0), 0);

    const totalScore = previousTotal + score;

    const result = new QuizResult({
      userId,
      city,
      userAnswers,
      correctAnswers,
      score,
      total: totalScore,
      date: new Date(),
    });

    await result.save();

    res.status(200).json({
      message: "Quiz submitted successfully",
      score,
      total: totalScore,
      feedback,
    });
  } catch (err) {
    console.error("Error saving quiz result:", err);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
});
router.post("/get_quiz", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId not sent correctly" });

    const quizResults = await QuizResult.find({ userId });

    if (!quizResults || quizResults.length === 0)
      return res.status(404).json({ error: "No quiz results found for this user" });

    res.status(200).json(quizResults);
  } catch (error) {
    console.error("Error fetching the quiz results:", error);
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
});

module.exports = router;