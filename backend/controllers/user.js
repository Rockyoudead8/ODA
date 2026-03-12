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
const jwt = require("jsonwebtoken");
const otpModel = require("../models/otp");

exports.handleGetUser = async (req, res) => {
  try {
    
    const foundUser = await user.findById(req.user._id);

    if (!foundUser) {
      console.log("user not found");
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: foundUser });
  } catch (error) {
    console.log("server error")
    // console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// login & signup

exports.handleLogin = (req, res) => {
  
  try {

    passport.authenticate("local", {session: false} ,(err, user, info) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
      }

      if(!user){
        console.log("Authentication failed:");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const payload = {
        id: user._id,
      }

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
      );

      res.cookie("jwt",token,{
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: "lax",
      });

      return res.status(200).json({ message: "Login successful",user, token });
    })(req, res);
    
  } catch (err) {
    console.log("server error");
    console.error(err);
    res.status(500).json({ message: "Server error"  , error: err.message});
  }

};

exports.handleSignup =  async (req, res) => {

  const { name, email, password ,otp} = req.body;

  console.log("Signup Route Hit");

  try {

    // code for verifying OTP
    const otpRecord = await otpModel.findOne({ otp : otp, email: email });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if(otpRecord.expiresAt < new Date()){
      return res.status(400).json({ message: "OTP expired" });
    }

    const newUser = new user({ name, email});
    const registeredUser = await user.register(newUser, password);

    const payload = {
      id: registeredUser._id,
    }

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
    );

    res.cookie("jwt",token,{
        httpOnly: true,
        secure: false, // set to true in production with HTTPS
        sameSite: "lax",
      });

    return res.status(201).json({ message: "Signup successful",  token });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }

};

// logout 
// see why just using req.logout is not working?? - IMPORTANT 

exports.handleLogout = (req, res, next) => {
  console.log("Logout Route Hit");
  // logout is done from the frontend by clearing the token from localStorage and updating global state, so we just send a success response here
  // console.log("Is Authenticated:", req.isAuthenticated());
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "lax",
    secure: false // true in production with HTTPS
  });

  res.status(200).json({ message: "Logout successful" });
};