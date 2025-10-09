const express = require("express");
const router = express.Router();
const {handleGenerateinfo} = require("../controllers/Generateinfo")

router.post("/", handleGenerateinfo);

module.exports = router;