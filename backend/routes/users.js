var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const user = require("../models/users");
const category = require("../models/category");
const comment = require("../models/comment");
const listings = require("../models/listings");
const quiz = require("../models/quiz");
const quizResult = require("../models/quizResult");

// Login route
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

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  // logic for creating the user

  // first check if the user exist or not?
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
