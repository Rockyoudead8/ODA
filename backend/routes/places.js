const express = require("express");
const router = express.Router();
const Places = require("../models/Places");

// const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY;

const CACHE_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days

router.get("/:city/:lat/:lng", async (req, res) => {
  try {

    const { city, lat, lng } = req.params;
    const cityKey = city.toLowerCase();

    const existing = await Places.findOne({ city: cityKey });

    if (
      existing &&
      Date.now() - new Date(existing.updatedAt).getTime() < CACHE_TTL
    ) {
      console.log("Returning cached places for", cityKey);
      return res.json(existing.places);
    }

    console.log("Fetching new places from Geoapify");

    const response = await fetch(
      `https://api.geoapify.com/v2/places?categories=tourism,tourism.sights,tourism.attraction,entertainment&filter=circle:${lng},${lat},10000&limit=30&apiKey=6d21db9365ab4c078fd858469f66813b`
    );

    const data = await response.json();

    const places = data.features || [];

    await Places.findOneAndUpdate(
      { city: cityKey },
      { city: cityKey, places, updatedAt: new Date() },
      { upsert: true }
    );

    res.json(places);

  } catch (err) {
    console.error("Places API error:", err);
    res.status(500).json({ error: "Failed to fetch places" });
  }
});

module.exports = router;