var express = require('express');
var router = express.Router();

const user = require("../models/users");
const category = require("../models/category");
const comment = require("../models/comment");
const listings = require("../models/listings");
const quiz = require("../models/quiz");
const quizResult = require("../models/quizResult");

// listings insert krni h
router.post('/insert-dummy', async (req, res) => {

    await listings.deleteMany();
    try {
        const dummyListings = [
            {
                "title": "New York",
                "description": "The city that never sleeps. Explore skyscrapers, culture, and iconic landmarks.",
                "images": [
                    "https://images.unsplash.com/photo-1551739450-1c18c3f40f48?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Paris",
                "description": "The romantic city of lights, known for the Eiffel Tower and exquisite cuisine.",
                "images": [
                    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1522098543979-ffc7f79fba6f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1543349687-6ed0a10bbf5a?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Tokyo",
                "description": "A vibrant city blending modern technology and traditional culture.",
                "images": [
                    "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1526481280691-3bfa7568ef23?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "London",
                "description": "Historic landmarks, museums, and the famous River Thames await you.",
                "images": [
                    "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1522098543979-ffc7f79fba6f?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Sydney",
                "description": "Home to the iconic Opera House and beautiful beaches along the harbor.",
                "images": [
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1508459712155-9f5a6c83d077?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "title": "Dubai",
                "description": "Futuristic skyscrapers, desert adventures, and luxury experiences in the UAE.",
                "images": [
                    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1505266414180-0f25265ee2d7?auto=format&fit=crop&w=800&q=80",
                    "https://images.unsplash.com/photo-1526481280691-3bfa7568ef23?auto=format&fit=crop&w=800&q=80"
                ]
            }
        ]



        await listings.insertMany(dummyListings);
        res.json({ message: "✅ Dummy listings inserted successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to insert dummy listings" });
    }
});

// listings insert krni h
router.get("/listing", async (req, res) => {
    try {
        const allListings = await listings.find();
        res.json(allListings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch listings" });
    }
});

router.get("/listing/:id", async (req, res) => {
    try {
        const listingfound = await listings.findById(req.params.id);
        if (!listingfound) return res.status(404).json({ error: "Listing not found" });
        res.json(listingfound);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch listing" });
    }
});



module.exports = router;
