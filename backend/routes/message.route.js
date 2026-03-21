const express = require('express');
var router = express.Router();
const passport = require('passport');
const c = require('../controllers/messages');

router.get("/chats",passport.authenticate("jwt", { session: false }),c.getChatPartners);
router.get("/:id",passport.authenticate("jwt", { session: false }),c.getMessagesByUserId);
router.post("/send/:id",passport.authenticate("jwt", { session: false }),c.sendMessage);

module.exports = router; 