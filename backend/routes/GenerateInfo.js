const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    config: {
        responseMimeType: "application/json", 
        temperature: 0.7,
        maxOutputTokens: 1000
    }
});
router.post("/", async (req, res) => { 
  try {
    const { city } = req.body;
    if (!city) return res.status(400).json({ error: "City is required" });

    const prompt = `
      You are a historian and quiz creator.
      Generate detailed JSON data for the city "${city}" in this format:
      {
        "history": "Short history of the city",
        "facts": ["fact1", "fact2", "fact3", "fact4"],
        "famousStory": "A famous legend or story about the city",
        "quizQuestions": [
          {"question": "Q1?", "options": ["A","B","C","D"], "answer": "B"},
          {"question": "Q2?", "options": ["A","B","C","D"], "answer": "D"},
          {"question": "Q3?", "options": ["A","B","C","D"], "answer": "A"},
          {"question": "Q4?", "options": ["A","B","C","D"], "answer": "C"},
          {"question": "Q5?", "options": ["A","B","C","D"], "answer": "B"}
        ]
      }
      Only return valid JSON with no extra explanation. The 'responseMimeType' is set to 'application/json', so do not include any markdown fences.
    `;

    let result;
    try {
        result = await model.generateContent(prompt);
    } catch (apiError) {
        console.error("Gemini API call failed:", apiError.message); 
        return res.status(503).json({ 
            error: "Gemini API call failed. Check key, network, or rate limits." 
        });
    }

    const textOutput = result?.text;
    
    if (!textOutput) {
      console.error("Gemini output was empty or malformed. Full result:", JSON.stringify(result, null, 2));
      return res.status(500).json({ 
        error: "No text output from Gemini." 
      });
    }

    let jsonString = textOutput.trim();
    
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```json\s*|```\s*$/g, '').trim();
    }
    
    if (jsonString.length === 0) {
         return res.status(500).json({ error: "Gemini returned empty content after cleanup." });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.error("JSON parse error:", err);
      console.error("Problematic Model Output (non-JSON):", jsonString); 
      return res.status(500).json({ error: "Invalid JSON returned by Gemini." });
    }

    res.json(parsed);

  } catch (err) {
    console.error("Internal Error during request processing:", err);
    res.status(500).json({ error: "Internal Server Error during content generation." });
  }
});

module.exports = router;
