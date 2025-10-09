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
                "title": "Delhi",
                "description": "The capital city of India, rich in history, monuments, and bustling markets.",
                "lat": 28.6139,
                "lng": 77.2090,
                "visits": 75,
                "images": [
                    "https://images.unsplash.com/photo-1584036561584-b03c19da874c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1601758123927-50f9c34e4c6c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1589307001000-6d54b2a1f037?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Mumbai",
                "description": "India's financial capital, famous for Bollywood, nightlife, and the Gateway of India.",
                "lat": 19.0760,
                "lng": 72.8777,
                "visits": 90,
                "images": [
                    "https://images.unsplash.com/photo-1508704019886-14a9ed4b0d2b?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1533106418983-dfcaf0fc10e0?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1555901451-3d7fc3e3df6b?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Bangalore",
                "description": "Known as the Silicon Valley of India, with gardens, tech parks, and pleasant weather.",
                "lat": 12.9716,
                "lng": 77.5946,
                "visits": 65,
                "images": [
                    "https://images.unsplash.com/photo-1584840589464-b28c3c6829c3?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1573277195741-3c6e07a9cf7a?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1556260555-431bd6b18e63?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Chennai",
                "description": "A coastal city famous for its temples, beaches, and rich cultural heritage.",
                "lat": 13.0827,
                "lng": 80.2707,
                "visits": 55,
                "images": [
                    "https://images.unsplash.com/photo-1563290190-6b15d9b0f2de?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1560796247-bfa87a97fa3f?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1521365259334-5f2d4ef0f87b?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Kolkata",
                "description": "City of joy, known for colonial architecture, culture, and the Howrah Bridge.",
                "lat": 22.5726,
                "lng": 88.3639,
                "visits": 60,
                "images": [
                    "https://images.unsplash.com/photo-1586396209269-c29b42393b5b?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1582719478197-4d74a3de6b5c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1529429612434-0b0b3b1e7fc2?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Hyderabad",
                "description": "Famous for its biryani, historic forts, and a blend of modern IT and heritage culture.",
                "lat": 17.3850,
                "lng": 78.4867,
                "visits": 50,
                "images": [
                    "https://images.unsplash.com/photo-1591195855655-3e1e7c4e9c3b?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1568655390046-c60d60b9b168?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1587614382346-4b124cb7c678?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Jaipur",
                "description": "The Pink City, known for palaces, forts, and vibrant bazaars.",
                "lat": 26.9124,
                "lng": 75.7873,
                "visits": 45,
                "images": [
                    "https://images.unsplash.com/photo-1548063263-5a0d3f8b60d0?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1553229910-2f32d83d68a3?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1603390698345-74c80eb9a3a7?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Goa",
                "description": "Famous for beaches, nightlife, and Portuguese heritage.",
                "lat": 15.2993,
                "lng": 74.1240,
                "visits": 70,
                "images": [
                    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1583511655924-8fa77f0e1e4c?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Udaipur",
                "description": "Known as the City of Lakes, famous for palaces, lakes, and scenic beauty.",
                "lat": 24.5854,
                "lng": 73.7125,
                "visits": 40,
                "images": [
                    "https://images.unsplash.com/photo-1581091215363-f7b801d0be27?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1580316019210-6a2a1ec7f4c3?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1583109883345-fb2323b6a2c1?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Varanasi",
                "description": "One of the oldest cities in the world, famous for ghats, spirituality, and temples.",
                "lat": 25.3176,
                "lng": 82.9739,
                "visits": 50,
                "images": [
                    "https://images.unsplash.com/photo-1572103096328-196e99c9296e?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1572103096329-3b91a9e67a8f?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1572103096330-9b1c8e4b9c7f?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Kochi",
                "description": "A port city with a blend of modernity and colonial charm, famous for backwaters.",
                "lat": 9.9312,
                "lng": 76.2673,
                "visits": 35,
                "images": [
                    "https://images.unsplash.com/photo-1589891605044-fc4b3f6e0f1a?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1589891605045-4fcbf6a2b1b6?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1589891605046-9c4f6b1e5f7a?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
                ]
            },
            {
                "title": "Amritsar",
                "description": "Famous for the Golden Temple and rich Sikh heritage.",
                "lat": 31.6340,
                "lng": 74.8723,
                "visits": 45,
                "images": [
                    "https://images.unsplash.com/photo-1599785209707-2f7a0f5c4c9f?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1599785209708-7f5a0f5c9b1f?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0",
                    "https://images.unsplash.com/photo-1599785209709-5f5b0f5c7a3f?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0"
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