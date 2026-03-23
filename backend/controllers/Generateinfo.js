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
  console.log("Received request for city info generation");
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

   console.log(process.env.GEMINI_API_KEY);

    // --- MODIFIED PROMPT ---
    const prompt = `
      You are a historian and expert quiz creator.

Generate a structured JSON response for the city: "${city}".

Requirements:

1. Provide a short description of what the city is famous for. This may include history, culture, landmarks, food, or any defining characteristics. Keep it concise but informative (3–5 sentences).

2. List exactly 4 "must-do" things for someone visiting the city. Each item should be specific and meaningful (not generic), reflecting the city's unique identity.

3. Create 3 challenging quiz questions that test deep knowledge of the city's history, culture, or local facts. These should not be easily answerable by casual tourists.

Format:

Return ONLY valid JSON with the following structure:

{
  "city": "<city name>",
  "description": "short description",
  "mustDo": [
    "<activity 1>",
    "<activity 2>",
    "<activity 3>",
    "<activity 4>"
  ],
  "quiz": [
    {
      "question": "<question 1>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "correctAnswerIndex": <0-based index>,
      "explanation": "<brief explanation>"
    },
    {
      "question": "<question 2>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "correctAnswerIndex": <0-based index>,
      "explanation": "<brief explanation>"
    },
    {
      "question": "<question 3>",
      "options": ["<option A>", "<option B>", "<option C>", "<option D>"],
      "correctAnswerIndex": <0-based index>,
      "explanation": "<brief explanation>"
    }
  ]
}

Important:
- Ensure "correctAnswerIndex" is the zero-based index of the correct option in the "options" array.
- Do not include any text outside the JSON.
- Ensure the JSON is properly formatted and valid.`

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let cleaned = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsedData;

    try {
      parsedData = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Raw Gemini response:", responseText);
      throw new Error("Gemini returned invalid JSON");
    }

    await CityData.findOneAndUpdate(
      { city: cityKey },
      { $set: { data: parsedData, updatedAt: new Date() } },
      { upsert: true }
    );

    console.log(`Cached/Updated data for ${cityKey}`);
    console.log("Generated data:", parsedData);
    res.status(200).json(parsedData);

  } catch (err) {
    console.error("Error generating city info:", err);
    res.status(500).json({ error: err.message });
  }
};