const QuizResult = require("../models/QuizResult");
const Listing = require("../models/listings");
const User = require("../models/users");

const handleQuizResults =  async (req, res) => {
  try {
    const { listingId } = req.params;

    if (!listingId) return res.status(400).json({ error: "listingId is required" });

    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    const city = listing.title;

    
    const results = await QuizResult.find({ city });

    const userTotals = {};
    for (const r of results) {
      if (!r.userId || r.userId === "undefined") continue; 
      if (!userTotals[r.userId]) {
        userTotals[r.userId] = { id: r.userId, total: r.total || 0 };
      } else {
        userTotals[r.userId].total += r.total || 0;
      }
    }

    const userIds = Object.keys(userTotals);

    
    const validUserIds = userIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id));
    const users = await User.find({ _id: { $in: validUserIds } }).select("name");

    const userMap = {};
    users.forEach(u => {
      userMap[u._id.toString()] = u.name;
    });

    const leaderboard = Object.values(userTotals).map(u => ({
      id: u.id,
      name: userMap[u.id] || "Anonymous",
      total: u.total,
    }));

    leaderboard.sort((a, b) => b.total - a.total);

    res.status(200).json(leaderboard);
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};


module.exports = handleQuizResults;