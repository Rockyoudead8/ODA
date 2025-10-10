const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const CityData = require("../models/CityData");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.7,
  },
});

const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

exports.handleGenerateinfo = async (req, res) => {
  try {
    const { city, force_new } = req.body;
    if (!city) {
      return res.status(400).json({ error: "City is required." });
    }

    const cityKey = city.toLowerCase().trim();
    const existing = await CityData.findOne({ city: cityKey });

    if (!force_new && existing && Date.now() - new Date(existing.updatedAt).getTime() < CACHE_TTL) {
      console.log(`Returning cached data for ${cityKey}`);
      return res.status(200).json(existing.data);
    }

    console.log(`Generating new data for ${cityKey}...`);

    // --- MODIFIED PROMPT ---
    const prompt = `
      You are a historian and quiz creator. Generate detailed JSON for "${city}".
      Return ONLY valid JSON.

      {
        "history": "A short but detailed historical background of the city.",
        "facts": ["fact1", "fact2", "fact3", "fact4"],
        "famousStory": "A famous legend or cultural story associated with the city.",
        "timeline": [
          {"date": "YYYY", "event": "An important historical event."},
          {"date": "YYYY", "event": "Another significant milestone."}
        ],
        "quizQuestions": [
          {
            "question": "Q1?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswerIndex": 1, 
            "explanation": "Short explanation for why the answer (Option B) is correct."
          },
          {
            "question": "Q2?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswerIndex": 3,
            "explanation": "Explanation for why the answer (Option D) is correct."
          },
          {
            "question": "Q3?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswerIndex": 0,
            "explanation": "Explanation for why the answer (Option A) is correct."
          }
        ]
      }

      Ensure 'correctAnswerIndex' is the zero-based index of the correct option in the 'options' array.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    let parsedData = JSON.parse(responseText);

    await CityData.findOneAndUpdate(
      { city: cityKey },
      { $set: { data: parsedData, updatedAt: new Date() } },
      { upsert: true }
    );

    console.log(`Cached/Updated data for ${cityKey}`);
    res.status(200).json(parsedData);

  } catch (err) {
    console.error("Internal error:", err);
    res.status(500).json({ error: "Internal Server Error." });
  }
};