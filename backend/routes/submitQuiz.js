const express = require("express");
const router = express.Router();
const QuizResult = require("../models/QuizResult");

router.post("/", async (req, res) => {
    try {
        const { userId, city, userAnswers, correctAnswers } = req.body;

        if (!city || !userAnswers || !correctAnswers) {
            return res.status(400).json({ error: "Missing required data." });
        }

        let score = 0;
        correctAnswers.forEach((ans, i) => {
            if (userAnswers[i] === ans) score++;
        });


        const result = new QuizResult({
            userId,
            city,
            userAnswers,
            correctAnswers,
            score,
            date: new Date(),
        });
        await result.save();

        res.status(200).json({ message: "Quiz submitted successfully", score });
    } catch (err) {
        console.error("Error saving quiz result:", err);
        res.status(500).json({ error: "Failed to submit quiz" });
    }
});

router.post("/get_quiz", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: "userId not sent correctly" });

        // Get all quiz results for this user
        const quizResults = await QuizResult.find({ userId });

        if (!quizResults || quizResults.length === 0)
            return res.status(404).json({ error: "No quiz results found for this user" });

        res.status(200).json(quizResults); // return the array directly
    } catch (error) {
        console.error("Error fetching the quiz results:", error);
        res.status(500).json({ error: "Failed to fetch quiz results" });
    }
});

module.exports = router;
