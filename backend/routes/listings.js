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
                "lat": 40.7128,
                "lng": -74.0060,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1661954654458-c673671d4a08?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://images.unsplash.com/photo-1602940659805-770d1b3b9911?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://images.unsplash.com/photo-1587161584760-f51779fb276a?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                ]
            },
            {
                "title": "Paris",
                "description": "The romantic city of lights, known for the Eiffel Tower and exquisite cuisine.",
                "lat": 48.8566,
                "lng": 2.3522,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1661919210043-fd847a58522d?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://plus.unsplash.com/premium_photo-1718035557075-5111d9d906d2?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2240&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                ]
            },
            {
                "title": "Tokyo",
                "description": "A vibrant city blending modern technology and traditional culture.",
                "lat": 35.6762,
                "lng": 139.6503,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1661914240950-b0124f20a5c1?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://images.unsplash.com/photo-1604928141064-207cea6f571f?q=80&w=2728&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2394&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                ]
            },
            {
                "title": "London",
                "description": "Historic landmarks, museums, and the famous River Thames await you.",
                "lat": 51.5074,
                "lng": -0.1278,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1682056762907-23d08f913805?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://images.unsplash.com/photo-1634825174045-f9323ebed36b?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://images.unsplash.com/photo-1589657068463-ef4077ce0d10?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                ]
            },
            {
                "title": "Sydney",
                "description": "Home to the iconic Opera House and beautiful beaches along the harbor.",
                "lat": -33.8688,
                "lng": 151.2093,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1697730198238-48ee2f2fe1b7?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://images.unsplash.com/photo-1598948485421-33a1655d3c18?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                ]
            },
            {
                "title": "Dubai",
                "description": "Futuristic skyscrapers, desert adventures, and luxury experiences in the UAE.",
                "lat": 25.276987,
                "lng": 55.296249,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1697729914552-368899dc4757?q=80&w=2224&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    "https://plus.unsplash.com/premium_photo-1661964298224-7747aa0ac10c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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

// listings fetch all
router.get("/listing", async (req, res) => {
    try {
        const allListings = await listings.find();
        res.json(allListings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch listings" });
    }
});

// listings fetch by ID
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