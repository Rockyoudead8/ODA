var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const user = require("../models/users");
const category = require("../models/category");
const comment = require("../models/comment");
const listings = require("../models/listings");
const quiz = require("../models/quiz");
const quizResult = require("../models/QuizResult");


router.post("/get_user", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const foundUser = await user.findById(userId);

    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: foundUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// user ki visited cities ko count krne ka code
router.post("/", async (req, res) => {
  try {
    const { userId, listingId } = req.body;

    if (!userId || !listingId) {
      return res.status(400).json({ error: "userId and listingId are required" });
    }

    const listing = await listings.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const cityName = listing.title;


    const foundUser = await user.findById(userId);
    if (!foundUser) return res.status(404).json({ error: "User not found" });

    const alreadyVisited = foundUser.visitedCities?.includes(cityName);

    if (alreadyVisited) {
      foundUser.visitedCities = foundUser.visitedCities.filter((city) => city !== cityName);
      foundUser.citiesVisited = Math.max(0, (foundUser.citiesVisited || 0) - 1);
    } else {
      foundUser.visitedCities = [...(foundUser.visitedCities || []), cityName];
      foundUser.citiesVisited = (foundUser.citiesVisited || 0) + 1;
    }

    await foundUser.save();

    res.json({
      message: "City visit status updated",
      visited: !alreadyVisited,
      count: foundUser.citiesVisited,
      city: cityName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


// user ko login krane ka code
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {

    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }


    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }


    res.status(200).json({ message: "Login successful", user: existingUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// user ko signup krane ka code
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;


  try {
    const isUser = await user.findOne({ email });
    if (isUser) {
      return res.status(200).json({ message: "User already exists , please log in" });
    }
    const hashedPass = await bcrypt.hash(password, 10);
    const newUser = await user.create({
      name: name,
      email: email,
      password: hashedPass,
    });
    await newUser.save();
    res.status(201).json({ message: "user created successfully", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = router;
