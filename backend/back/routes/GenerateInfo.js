const express = require("express");
const router = express.Router();
const {handleGenerateinfo} = require("../controllers/Generateinfo")
const passport = require("passport");

router.post("/", passport.authenticate("jwt", { session: false }), handleGenerateinfo);

module.exports = router;