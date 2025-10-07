// const express = require("express");
// const router = express.Router();
// const QuizResult = require("../models/QuizResult");

// router.post("/", async (req, res) => {
//   try {
//     const { userId, listingId, city, userAnswers, correctAnswers } = req.body;

//     if (!userId || !listingId || !city || !userAnswers || !correctAnswers) {
//       return res.status(400).json({ error: "Missing required data." });
//     }

//     if (userAnswers.length !== correctAnswers.length) {
//       return res.status(400).json({ error: "Question count mismatch." });
//     }

//     const score = userAnswers.reduce((acc, ans, i) => {
//       return acc + ((ans || "").trim().toLowerCase() === (correctAnswers[i] || "").trim().toLowerCase() ? 1 : 0);
//     }, 0);

//     const total = correctAnswers.length;

//     const result = new QuizResult({
//       user: userId,          // <-- matches schema
//       listing: listingId,    // <-- matches schema
//       city,
//       userAnswers,
//       correctAnswers,
//       score,
//       total,                 // <-- required by schema
//       date: new Date(),
//     });

//     await result.save();

//     res.status(200).json({
//       message: "Quiz submitted successfully",
//       score,
//       total,
//     });
//   } catch (err) {
//     console.error("Error saving quiz result:", err);
//     res.status(500).json({ error: "Failed to submit quiz" });
//   }
// });
