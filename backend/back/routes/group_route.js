const express = require("express");
const router = express.Router();
const passport = require("passport");
const c = require("../controllers/groups");

const auth = passport.authenticate("jwt", { session: false });

// Create a group
router.post("/", auth, c.createGroup);

// Get all groups for the logged-in user
router.get("/", auth, c.getGroups);

// Get messages for a specific group
router.get("/:id/messages", auth, c.getGroupMessages);

// Send a message to a group
router.post("/:id/send", auth, c.sendGroupMessage);

const { leaveGroup } = require("../controllers/groups");

// Add this route:
router.delete("/:id/leave", auth, leaveGroup);

module.exports = router;