const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

const User = require("../models/users");
const Comment = require("../models/comment");
const Listing = require("../models/listings");
const {getComments , postComments} = require('../controllers/comments')


// post comments route 
router.post("/comments", postComments);

// get comments route
router.get("/comments/:listingId", getComments);

module.exports = router;
