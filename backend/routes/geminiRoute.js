const express = require("express");
const router = express.Router();
const {handleGeocodeCities} = require("../controllers/geminiController")

router.post("/", handleGeocodeCities);

module.exports = router;