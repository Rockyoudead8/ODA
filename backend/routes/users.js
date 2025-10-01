var express = require('express');
var router = express.Router();

const user = require ("../models/users");
const category = require ("../models/category");
const comment = require ("../models/comment");
const listings = require ("../models/listings");
const quiz = require ("../models/quiz");
const quizResult = require ("../models/quizResult");

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // logic for checking the user
});

router.post('/signup', (req, res) => {
  const { name,email, password } = req.body;

  // logic for creating the user
});



module.exports = router;
