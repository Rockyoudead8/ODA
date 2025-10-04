const express = require("express");
const router = express.Router();

const HF_API_KEY = process.env.HF_API_KEY;

router.post("/", async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) return res.status(400).json({ error: "City is required" });

    const prompt = `
      You are a knowledgeable guide. 
      Provide detailed information about the city "${city}" in the following JSON format:
      {
        "history": "Short history of the city",
        "facts": ["fact1", "fact2", "fact3"],
        "famousStory": "A famous legend or story about the city",
        "quizQuestions": [
          {"question": "Q1?", "options": ["A","B","C","D"], "answer": "B"},
          {"question": "Q2?", "options": ["A","B","C","D"], "answer": "D"},
          {"question": "Q3?", "options": ["A","B","C","D"], "answer": "A"},
          {"question": "Q4?", "options": ["A","B","C","D"], "answer": "C"},
          {"question": "Q5?", "options": ["A","B","C","D"], "answer": "B"}
        ]
      }
      Only return valid JSON. No extra text.
    `;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    const result = await response.json();
    const textOutput = result?.generated_text || result?.[0]?.generated_text;

    if (!textOutput) {
      return res.status(500).json({ error: "No output from model" });
    }

    // Try to extract JSON only
    const jsonMatch = textOutput.match(/\{[\s\S]*\}/); // matches first {...} block
    if (!jsonMatch) {
      return res.status(500).json({ error: "Could not find JSON in model output" });
    }

    let data;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("JSON parse error:", err, textOutput);
      return res.status(500).json({ error: "Invalid JSON after extraction" });
    }

    res.json(data);

  } catch (err) {
    console.error("Error generating info:", err);
    res.status(500).json({ error: "Failed to generate info" });
  }
});

module.exports = router;
