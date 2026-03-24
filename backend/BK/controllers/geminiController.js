const City = require("../models/city");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" }
});

exports.handleGeocodeCities = async (req, res) => {
  try {

    const { cities } = req.body;

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({ error: "An array of city names is required." });
    }

    // normalize names
    const normalizedCities = cities.map(c => c.trim().toLowerCase());

    // 1️⃣ Check MongoDB cache
    const cachedCities = await City.find({
      name: { $in: normalizedCities }
    });

    const cachedMap = {};
    cachedCities.forEach(city => {
      cachedMap[city.name] = city;
    });

    const missingCities = normalizedCities.filter(c => !cachedMap[c]);

    let newCities = [];

    // 2️⃣ Only call Gemini if something is missing
    if (missingCities.length > 0) {

      const prompt = `
Given the following JavaScript array of city names:
${JSON.stringify(missingCities)}

Return a valid JSON array of objects with:
"name", "lat", and "lng".

Output ONLY the JSON array.

Example:
[
  { "name": "mumbai", "lat": 19.0760, "lng": 72.8777 },
  { "name": "tokyo", "lat": 35.6895, "lng": 139.6917 }
]
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const parsedData = JSON.parse(responseText);

      // 3️⃣ Save to MongoDB cache
      const docsToInsert = parsedData.map(city => ({
        name: city.name.trim().toLowerCase(),
        lat: city.lat,
        lng: city.lng
      }));

      const insertedCities = await City.insertMany(docsToInsert, { ordered: false });

      newCities = insertedCities;

    }

    // 4️⃣ Combine cached + new results
    const allCities = [
      ...cachedCities,
      ...newCities
    ];

    const formatted = allCities.map(c => ({
      name: c.name,
      lat: c.lat,
      lng: c.lng
    }));

    res.status(200).json(formatted);

  } catch (err) {

    console.error("Gemini Geocoding Error:", err);

    res.status(500).json({
      error: "Failed to geocode cities."
    });

  }
};