const express = require('express');
const passport = require("passport");

function isLoggedIn(req, res, next) {
    
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).json({ message: "Please log in to continue" });
  } 

}

module.exports = isLoggedIn;