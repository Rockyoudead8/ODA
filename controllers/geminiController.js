

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" }});

exports.handleGeocodeCities = async (req, res) => {
  try {
    const { cities } = req.body;
    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({ error: "An array of city names is required." });
    }

    const prompt = `
      Given the following JavaScript array of city names:
      ${JSON.stringify(cities)}

      Your task is to return a valid JSON array of objects. Each object must contain the original city "name", its latitude as "lat", and its longitude as "lng".
      The output must be ONLY the JSON array, with no other text, comments, or markdown formatting.
      If you cannot find a city, omit it from the final array.

      Example output format:
      [
        { "name": "Paris, France", "lat": 48.8566, "lng": 2.3522 },
        { "name": "Tokyo, Japan", "lat": 35.6895, "lng": 139.6917 }
      ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);
    
    res.status(200).json(parsedData);

  } catch (err) {
    console.error("Gemini Geocoding Error:", err);
    res.status(500).json({ error: "Failed to geocode cities with Gemini." });
  }
};