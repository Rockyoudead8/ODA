var express = require('express');
const user = require("../models/users");
const category = require("../models/category");
const comment = require("../models/comment");
const listings = require("../models/listings");
const quiz = require("../models/quiz");
const quizResult = require("../models/QuizResult");

exports.handlePostListings = async (req, res) => {
    await listings.deleteMany({});
    try {
        const dummyListings = [
            {
                "title": "New York",
                "description": "The city that never sleeps. Explore skyscrapers, culture, and iconic landmarks.",
                "lat": 40.7128,
                "lng": -74.0060,
                "visits": 55,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1661954654458-c673671d4a08?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1602940659805-770d1b3b9911?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1587161584760-f51779fb276a?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Paris",
                "description": "The romantic city of lights, known for the Eiffel Tower and exquisite cuisine.",
                "lat": 48.8566,
                "lng": 2.3522,
                "visits": 90,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1661919210043-fd847a58522d?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://plus.unsplash.com/premium_photo-1718035557075-5111d9d906d2?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=2240&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Tokyo",
                "description": "A vibrant city blending modern technology and traditional culture.",
                "lat": 35.6762,
                "lng": 139.6503,
                "visits": 70,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1661914240950-b0124f20a5c1?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1604928141064-207cea6f571f?q=80&w=2728&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2394&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "London",
                "description": "Historic landmarks, museums, and the famous River Thames await you.",
                "lat": 51.5074,
                "lng": -0.1278,
                "visits": 120,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1682056762907-23d08f913805?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1634825174045-f9323ebed36b?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1589657068463-ef4077ce0d10?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Sydney",
                "description": "Home to the iconic Opera House and beautiful beaches along the harbor.",
                "lat": -33.8688,
                "lng": 151.2093,
                "visits": 80,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1697730198238-48ee2f2fe1b7?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1598948485421-33a1655d3c18?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Dubai",
                "description": "Futuristic skyscrapers, desert adventures, and luxury experiences in the UAE.",
                "lat": 25.276987,
                "lng": 55.296249,
                "visits": 100,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1697729914552-368899dc4757?q=80&w=2224&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://plus.unsplash.com/premium_photo-1661964298224-7747aa0ac10c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Mumbai",
                "description": "India's financial capital, famous for Bollywood, nightlife, and the Gateway of India.",
                "lat": 19.0760,
                "lng": 72.8777,
                "visits": 90,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1673240845266-2f2c432cf194?q=80&w=2338&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1660145416818-b9a2b1a1f193?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://plus.unsplash.com/premium_photo-1697730489433-4a5fe8a77f96?q=80&w=2342&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Bangalore",
                "description": "Known as the Silicon Valley of India, with gardens, tech parks, and pleasant weather.",
                "lat": 12.9716,
                "lng": 77.5946,
                "visits": 65,
                "images": [
                    "https://plus.unsplash.com/premium_photo-1697729606469-027395aadb6f?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=2727&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1565018054866-968e244671af?q=80&w=3558&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Chennai",
                "description": "A coastal city famous for its temples, beaches, and rich cultural heritage.",
                "lat": 13.0827,
                "lng": 80.2707,
                "visits": 55,
                "images": [
                    "https://images.unsplash.com/photo-1661366698983-3cb843219300?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1561784493-88b0a3ce0c76?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1637080618498-b4a1cad84ae0?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Kolkata",
                "description": "City of joy, known for colonial architecture, culture, and the Howrah Bridge.",
                "lat": 22.5726,
                "lng": 88.3639,
                "visits": 60,
                "images": [
                    "https://images.unsplash.com/photo-1558431382-27e303142255?q=80&w=2148&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1542709618-9fa4290f0cfc?q=80&w=2338&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Jaipur",
                "description": "The Pink City, known for palaces, forts, and vibrant bazaars.",
                "lat": 26.9124,
                "lng": 75.7873,
                "visits": 45,
                "images": [
                    "https://images.unsplash.com/photo-1561486008-1011a284acfb?q=80&w=2332&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1504705759706-c5ee7158f8bb?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://plus.unsplash.com/premium_photo-1661963054563-ce928e477ff3?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            }
        ]


        await listings.insertMany(dummyListings);
        res.json({ message: "✅ Dummy listings inserted successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to insert dummy listings" });
    }
};

// listings fetch all
exports.handleFetchAll = async (req, res) => {
    try {
        const allListings = await listings.find();
        res.json(allListings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch listings" });
    }
};

exports.handleFetchbyID = async (req, res) => {
    try {
        const listingfound = await listings.findById(req.params.id);
        if (!listingfound) return res.status(404).json({ error: "Listing not found" });
        res.json(listingfound);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch listing" });
    }
}

exports.handlefetchbyName = async (req, res) => {
    try {
        const cityName = req.params.name;
        const city = await listings.findOne({ title: cityName });

        if (!city) {
            return res.status(404).json({ message: "City not found" });
        }

        res.json(city);
    } catch (error) {
        console.error("Error fetching city:", error);
        res.status(500).json({ message: "Server error" });
    }
}