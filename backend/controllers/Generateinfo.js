const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const CityData = require("../models/CityData");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  config: {
    responseMimeType: "application/json",
    temperature: 0.7,
    maxOutputTokens: 1000,
  },
});

// Cache time: 12 hours (in milliseconds)
const CACHE_TTL = 1000 * 60 * 60 * 12;

exports.handleGenerateinfo = async (req, res) => {
  try {
    const { city } = req.body;
    if (!city) {
      return res.status(400).json({ error: "City is required in the request body." });
    }

    const cityKey = city.toLowerCase().trim();

    // Check if city data exists and is still valid
    const existing = await CityData.findOne({ city: cityKey });

    if (existing && Date.now() - new Date(existing.updatedAt).getTime() < CACHE_TTL) {
      console.log(`Returning cached data for ${cityKey}`);
      return res.status(200).json(existing.data);
    }

    console.log(` Generating new data for ${cityKey}...`);

    const prompt = `
You are a historian and quiz creator.

Generate detailed JSON data for the city "${city}" in exactly this format.
Return ONLY valid JSON (no markdown, text, or commentary outside JSON).

{
  "history": "A short but detailed historical background of the city.",
  "facts": ["fact1", "fact2", "fact3", "fact4"],
  "famousStory": "A famous legend, myth, or cultural story associated with the city.",
  "timeline": [
    {
      "date": "YYYY-MM-DD or just Year",
      "event": "Brief description of what happened on this date or year in this city."
    },
    {
      "date": "YYYY",
      "event": "Another important historical event."
    },
    {
      "date": "YYYY",
      "event": "Another significant milestone."
    }
  ],
  "quizQuestions": [
    {
      "question": "Q1?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "explanation": "Short explanation about why option B is correct or extra info related to this fact."
    },
    {
      "question": "Q2?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "D",
      "explanation": "Explanation or historical reasoning for this question's answer."
    },
    {
      "question": "Q3?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Concise educational note or background for learners."
    },
    {
      "question": "Q4?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "C",
      "explanation": "Explanation giving cultural or historical relevance."
    },
    {
      "question": "Q5?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "explanation": "Extra insight or trivia about this question topic."
    }
  ]
}

Each quiz question must have exactly one correct answer, 4 options, and a short explanation (2–3 lines maximum). 
Include at least 5 important dates in the timeline. Each date should have a brief description that can be shown as a marker on a road/timeline in a frontend component.
`;

    const result = await model.generateContent(prompt);

    // Extract text safely
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

    // Save or update (safe against duplicate key errors)
    await CityData.findOneAndUpdate(
      { city: cityKey },
      {
        $set: {
          data: parsed,
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    console.log(`done Cached/Updated data for ${cityKey}`);
    res.status(200).json(parsed);
  } catch (err) {
    console.error("Internal error:", err);
    res.status(500).json({ error: "Internal Server Error: " + err.message });
  }
};
