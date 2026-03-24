// from main branch
const express = require("express");
const router = express.Router();
const handleQuizResults = require("../controllers/QuizResult")

router.get("/:listingId", handleQuizResults);

module.exports = router; 