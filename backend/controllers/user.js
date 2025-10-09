const express = require('express');
const bcrypt = require("bcrypt");
const user = require("../models/users");
const category = require("../models/category");
const comment = require("../models/comment");
const listings = require("../models/listings");
const quiz = require("../models/quiz");
const quizResult = require("../models/QuizResult");
const passport = require("passport");
const localStrategy = require("passport-local");
const isLoggedIn = require('../middlewares/mw');


exports.handleGetUser = async (req, res) => {
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
};

exports.handleLogin = (req, res) => {

  const { email, password } = req.body;
  try {

    if(!req.isAuthenticated()){

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

  } else {
    res.status(200).json({ message: "User already logged in", user: req.user });
  }

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error"  , error: err.message});
  }

};

exports.handleSignup =  async (req, res) => {

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

};

// logout 
// see why just using req.logout is not working?? - IMPORTANT 

exports.handleLogout = (req, res, next) => {
  console.log("Logout Route Hit");
  // console.log("Is Authenticated:", req.isAuthenticated());

  if (req.isAuthenticated()) {

    req.logout((err) => {
      console.log(err);
      if (err) return next(err); 

      // destroying the entire session
      req.session.destroy((err) => {
        if (err) return next(err);

        // Clear session cookie
        res.clearCookie("connect.sid");

        return res.status(200).json({ message: "Logout Successful" });
        // return res.status(200).redirect('/login'); 

      });

    });

  } else {
    return res.status(401).json({ message: "User is not logged in" });
  }

};