var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const user = require("../models/users");
const category = require("../models/category");
const comment = require("../models/comment");
const listings = require("../models/listings");
const quiz = require("../models/quiz");
const quizResult = require("../models/QuizResult");
const passport = require("passport");
const localStrategy = require("passport-local");


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


// login route
router.post('/login', (req, res) => {

  const { email, password } = req.body;
  try {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }

        res.status(200).json({ message: "Login successful", user });
      });
    })(req, res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error"  , error: err.message});
  }

});

// signup route
router.post('/signup', async (req, res) => {

  const { name, email, password } = req.body;

  try {

    const newUser = new user({ name, email, password });
    const registeredUser = await user.register(newUser, password);


    // login the user after signup 
    req.login(registeredUser, (err) => {
      
      if (err) {
        return res.status(500).json({ message: "Login after signup failed" });
      }

      res.status(201).json({ message: "User created And logged in successfully", user: registeredUser });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }

});

module.exports = router;
