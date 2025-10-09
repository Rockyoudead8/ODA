const express = require("express");
const router = express.Router();
const {handleGetSound} = require("../controllers/generateSound");

router.post("/", handleGetSound);

module.exports = router;
