var express = require('express');
var c = require('../controllers/listings');
var router = express.Router();


router.post('/insert-dummy', c.handlePostListings);

// listings fetch all
router.get("/listing", c.handleFetchAll);

// listings fetch by ID
router.get("/listing/:id", c.handleFetchbyID);

// fetch the city based on its name
router.get("/cities/:name", c.handlefetchbyName);


module.exports = router;