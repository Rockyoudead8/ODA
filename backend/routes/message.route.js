const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose'); // Add this!
const c = require('../controllers/messages');
router.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Access the model directly from Mongoose to avoid import path bugs
      const User = mongoose.model("User");

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const currentUserId = req.user._id;

      // Use .lean() for faster, plain-object results
      const users = await User.find({
        _id: { $ne: currentUserId },
      })
      .select("name email profilePhoto")
      .lean();

      console.log(`✅ Success! Found ${users.length} users.`);
      res.status(200).json(users);

    } catch (err) {
      console.error("🔥🔥 REAL ERROR FOUND:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

router.get("/chats",passport.authenticate("jwt", { session: false }),c.getChatPartners);
router.get("/:id",passport.authenticate("jwt", { session: false }),c.getMessagesByUserId);
router.post("/send/:id",passport.authenticate("jwt", { session: false }),c.sendMessage);


module.exports = router; 