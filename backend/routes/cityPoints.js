const express = require("express");
const router = express.Router();
const CityPoints = require("../models/CityPoints");
const Listing = require("../models/listings");
const passport = require("passport");

/**
 * GET /api/city-points/leaderboard/:listingId
 * Returns the combined leaderboard (quiz + comment + post points) for a city
 */
router.get("/leaderboard/:listingId", async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const cityName = listing.title;

    const cityPointsDocs = await CityPoints.find({ cityName })
      .populate("userId", "name");

    const leaderboard = cityPointsDocs.map((cp) => ({
      id: cp.userId?._id,
      name: cp.userId?.name || "Anonymous",
      quizPoints: cp.quizPoints || 0,
      commentPoints: cp.commentPoints || 0,
      postPoints: cp.postPoints || 0,
      total: (cp.quizPoints || 0) + (cp.commentPoints || 0) + (cp.postPoints || 0),
    }));

    // Sort by total descending
    leaderboard.sort((a, b) => b.total - a.total);

    res.json(leaderboard);
  } catch (err) {
    console.error("City leaderboard error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

/**
 * GET /api/city-points/my-stats
 * Returns the current user's points breakdown per city + overall total
 */
router.get(
  "/my-stats",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const cityPointsDocs = await CityPoints.find({ userId: req.user._id });

      const cities = cityPointsDocs.map((cp) => ({
        cityName: cp.cityName,
        quizPoints: cp.quizPoints || 0,
        commentPoints: cp.commentPoints || 0,
        postPoints: cp.postPoints || 0,
        total:
          (cp.quizPoints || 0) +
          (cp.commentPoints || 0) +
          (cp.postPoints || 0),
      }));

      // Sort by total descending
      cities.sort((a, b) => b.total - a.total);

      const overallTotal = cities.reduce((sum, c) => sum + c.total, 0);

      res.json({ cities, overallTotal });
    } catch (err) {
      console.error("City stats error:", err);
      res.status(500).json({ error: "Failed to fetch city stats" });
    }
  }
);

module.exports = router;