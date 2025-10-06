const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  config: {
    responseMimeType: "application/json",
    temperature: 0.7,
    maxOutputTokens: 1000,
  },
});

router.post("/", async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: "City is required in the request body." });
    }

   
    const prompt = `
You are a historian and quiz creator.
Generate detailed JSON data for the city "${city}" in exactly this format.
ONLY return JSON (no explanation or text outside JSON).

{
  "history": "Short history of the city",
  "facts": ["fact1", "fact2", "fact3", "fact4"],
  "famousStory": "A famous legend or story about the city",
  "quizQuestions": [
    {
      "question": "Q1?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B"
    },
    {
      "question": "Q2?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "D"
    },
    {
      "question": "Q3?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A"
    },
    {
      "question": "Q4?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "C"
    },
    {
      "question": "Q5?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B"
    }
  ]
}
Each quiz question must have exactly one correct answer and 4 options.
`;


    const result = await model.generateContent(prompt);

    // --- Extract text robustly ---
    let text =
      (typeof result.response?.text === "function"
        ? await result.response.text()
        : result.response?.text) ||
      result?.text ||
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "";

    if (!text) {
      console.error("Empty response from model:", result);
      return res.status(500).json({ error: "Model returned empty content." });
    }

    text = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("JSON parsing error:", err.message, "\nRaw text:", text);
      return res.status(500).json({ error: "Model returned invalid JSON format." });
    }

    res.status(200).json(parsed);
  } catch (err) {
    console.error("Internal error:", err);
    res.status(500).json({ error: "Internal Server Error: " + err.message });
  }
});

module.exports = router;
