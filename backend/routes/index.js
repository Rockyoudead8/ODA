var express = require('express');
var router = express.Router();

const user = require ("../models/users");
const category = require ("../models/category");
const comment = require ("../models/comment");
const listings = require ("../models/listings");
const quiz = require ("../models/quiz");
const quizResult = require ("../models/QuizResult");


router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
