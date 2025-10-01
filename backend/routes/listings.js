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
    try {
        const dummyListings = [
            { "title": "New York", "description": "The city that never sleeps. Explore skyscrapers, culture, and iconic landmarks.", "thumbnail": "https://images.unsplash.com/photo-1551739450-1c18c3f40f48?auto=format&fit=crop&w=800&q=80" },
            { "title": "Paris", "description": "The romantic city of lights, known for the Eiffel Tower and exquisite cuisine.", "thumbnail": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80" },
            { "title": "Tokyo", "description": "A vibrant city blending modern technology and traditional culture.", "thumbnail": "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=800&q=80" },
            { "title": "London", "description": "Historic landmarks, museums, and the famous River Thames await you.", "thumbnail": "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=800&q=80" },
            { "title": "Sydney", "description": "Home to the iconic Opera House and beautiful beaches along the harbor.", "thumbnail": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80" },
            { "title": "Dubai", "description": "Futuristic skyscrapers, desert adventures, and luxury experiences in the UAE.", "thumbnail": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80" },
            { "title": "Rome", "description": "Ancient history, the Colosseum, and incredible Italian cuisine.", "thumbnail": "https://images.unsplash.com/photo-1526481280691-3bfa7568ef23?auto=format&fit=crop&w=800&q=80" },
            { "title": "Barcelona", "description": "Famous for Gaudi architecture, beaches, and vibrant nightlife.", "thumbnail": "https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=800&q=80" },
            { "title": "Amsterdam", "description": "Canals, bicycles, and rich artistic culture make it unique.", "thumbnail": "https://images.unsplash.com/photo-1506619216599-9d16b30e0c5c?auto=format&fit=crop&w=800&q=80" },
            { "title": "Singapore", "description": "Modern city-state with beautiful gardens, skyline, and food culture.", "thumbnail": "https://images.unsplash.com/photo-1546820389-44d77e1f3b31?auto=format&fit=crop&w=800&q=80" },
            { "title": "Los Angeles", "description": "Hollywood, beaches, and entertainment capital of the world.", "thumbnail": "https://images.unsplash.com/photo-1502378735452-bc7d86632805?auto=format&fit=crop&w=800&q=80" },
            { "title": "San Francisco", "description": "Famous for the Golden Gate Bridge, steep streets, and tech hub.", "thumbnail": "https://images.unsplash.com/photo-1508051123996-69f8caf4891d?auto=format&fit=crop&w=800&q=80" },
            { "title": "Bangkok", "description": "Vibrant city in Thailand with bustling markets and temples.", "thumbnail": "https://images.unsplash.com/photo-1526481280691-3bfa7568ef23?auto=format&fit=crop&w=800&q=80" },
            { "title": "Istanbul", "description": "A city straddling Europe and Asia, full of history and culture.", "thumbnail": "https://images.unsplash.com/photo-1521702814062-8e49e4e5bb1c?auto=format&fit=crop&w=800&q=80" },
            { "title": "Berlin", "description": "Rich history, nightlife, and modern architecture in Germany.", "thumbnail": "https://images.unsplash.com/photo-1508051123996-69f8caf4891d?auto=format&fit=crop&w=800&q=80" },
            { "title": "Prague", "description": "Beautiful medieval architecture and vibrant city life.", "thumbnail": "https://images.unsplash.com/photo-1508086428142-4f150c59da70?auto=format&fit=crop&w=800&q=80" },
            { "title": "Venice", "description": "Canals, gondolas, and historic Italian architecture.", "thumbnail": "https://images.unsplash.com/photo-1508779018996-6a9491b42c3a?auto=format&fit=crop&w=800&q=80" },
            { "title": "Lisbon", "description": "Coastal Portuguese city known for colorful streets and culture.", "thumbnail": "https://images.unsplash.com/photo-1506242435725-27e7b6c82be1?auto=format&fit=crop&w=800&q=80" },
            { "title": "Vienna", "description": "City of music, palaces, and coffee culture in Austria.", "thumbnail": "https://images.unsplash.com/photo-1508749820284-4dfc8a3b8b2e?auto=format&fit=crop&w=800&q=80" },
            { "title": "Athens", "description": "Historic city with ancient ruins and Mediterranean charm.", "thumbnail": "https://images.unsplash.com/photo-1509927081133-30f2c2dbb5a8?auto=format&fit=crop&w=800&q=80" },
            { "title": "Cape Town", "description": "Coastal city in South Africa with mountains and beaches.", "thumbnail": "https://images.unsplash.com/photo-1508182317990-3b5cde3e1f6c?auto=format&fit=crop&w=800&q=80" },
            { "title": "Rio de Janeiro", "description": "Famous for beaches, Carnival, and the Christ the Redeemer statue.", "thumbnail": "https://images.unsplash.com/photo-1508923567004-3a6b8004f3d0?auto=format&fit=crop&w=800&q=80" },
            { "title": "Moscow", "description": "Historic Russian capital with stunning architecture and culture.", "thumbnail": "https://images.unsplash.com/photo-1508051123996-69f8caf4891d?auto=format&fit=crop&w=800&q=80" },
            { "title": "Seoul", "description": "Modern city with a rich history and technology hub in South Korea.", "thumbnail": "https://images.unsplash.com/photo-1549692520-acc6669e2f0c?auto=format&fit=crop&w=800&q=80" },
            { "title": "Hong Kong", "description": "Vibrant skyline, bustling markets, and harbor views.", "thumbnail": "https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=800&q=80" },
            { "title": "Beijing", "description": "Capital of China with historic landmarks like the Forbidden City.", "thumbnail": "https://images.unsplash.com/photo-1506863530036-1efeddceb993?auto=format&fit=crop&w=800&q=80" },
            { "title": "Toronto", "description": "Canada’s largest city, diverse culture, and CN Tower.", "thumbnail": "https://images.unsplash.com/photo-1509228627153-80e1f1c73563?auto=format&fit=crop&w=800&q=80" },
            { "title": "Mexico City", "description": "Cultural capital with history, art, and cuisine.", "thumbnail": "https://images.unsplash.com/photo-1506808547685-e2ba962dedf4?auto=format&fit=crop&w=800&q=80" },
            { "title": "Lisbon", "description": "Historic streets, trams, and Atlantic views.", "thumbnail": "https://images.unsplash.com/photo-1506242435725-27e7b6c82be1?auto=format&fit=crop&w=800&q=80" },
            { "title": "Cairo", "description": "Home of the Pyramids and rich Egyptian history.", "thumbnail": "https://images.unsplash.com/photo-1504198458649-3128b932f49b?auto=format&fit=crop&w=800&q=80" },
            { "title": "Bangkok", "description": "Bustling markets, temples, and vibrant street life.", "thumbnail": "https://images.unsplash.com/photo-1526481280691-3bfa7568ef23?auto=format&fit=crop&w=800&q=80" },
            { "title": "Singapore", "description": "Modern city-state with beautiful gardens and skyline.", "thumbnail": "https://images.unsplash.com/photo-1546820389-44d77e1f3b31?auto=format&fit=crop&w=800&q=80" }
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
