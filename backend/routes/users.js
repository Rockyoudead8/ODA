var express = require('express');
var router = express.Router();
const bcrypt = require("bcrypt");
const user = require("../models/users");
const category = require("../models/category");
const comment = require("../models/comment");
const listings = require("../models/listings");
const quiz = require("../models/quiz");
const quizResult = require("../models/QuizResult");
const passport = require("passport");
const localStrategy = require("passport-local");
const c = require("../controllers/user");
const jwt = require("jsonwebtoken");


// user ki visited cities ko count krne ka code
// router.post("/",passport.authenticate("jwt", { session: false }), async (req, res) => {
//   try {
//     const { listingId } = req.body;

//     const userId = req.user._id;

//     if (!userId || !listingId) {
//       return res.status(400).json({ error: "userId and listingId are required" });
//     }

//     const listing = await listings.findById(listingId);
//     if (!listing) return res.status(404).json({ error: "Listing not found" });

//     const cityName = listing.title;

//     const foundUser = await user.findById(userId);
//     if (!foundUser) return res.status(404).json({ error: "User not found" });

//     const alreadyVisited = foundUser.visitedCities?.includes(cityName);

//     if (alreadyVisited) {
//       foundUser.visitedCities = foundUser.visitedCities.filter((city) => city !== cityName);
//       foundUser.citiesVisited = Math.max(0, (foundUser.citiesVisited || 0) - 1);
//     } else {
//       foundUser.visitedCities = [...(foundUser.visitedCities || []), cityName];
//       foundUser.citiesVisited = (foundUser.citiesVisited || 0) + 1;
//     }

//     await foundUser.save();

//     res.json({
//       message: "City visit status updated",
//       visited: !alreadyVisited,
//       count: foundUser.citiesVisited,
//       city: cityName,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// toggle visit
router.post("/toggle-visit", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {

    const { listingId } = req.body;
    const userId = req.user._id;

    const listing = await listings.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const cityName = listing.title;

    const foundUser = await user.findById(userId);
    const alreadyVisited = foundUser.visitedCities.includes(cityName);

    if (alreadyVisited) {
      foundUser.visitedCities = foundUser.visitedCities.filter(
        (city) => city !== cityName
      );
    } else {
      foundUser.visitedCities.push(cityName);
    }

    foundUser.citiesVisited = foundUser.visitedCities.length;

    await foundUser.save();

    res.json({
      visited: !alreadyVisited
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});


// check if user visited city
router.get("/check-visit", passport.authenticate("jwt", { session: false }), async (req, res) => {
  const { cityName } = req.query;

  const foundUser = await user.findById(req.user._id);

  const visited = foundUser.visitedCities.includes(cityName);

  res.json({ visited });
});


// count users who visited city
router.get("/get_visits", async (req, res) => {
  try {

    const { cityName } = req.query;

    const count = await user.countDocuments({ visitedCities: cityName });

    res.json({ cityName, userCount: count });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// update profile (name, bio, defaultCity)
router.put("/update-profile", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    const { name, bio, defaultCity } = req.body;
    const updates = {};
    if (name?.trim()) updates.name = name.trim();
    if (bio !== undefined) updates.bio = bio;
    if (defaultCity !== undefined) updates.defaultCity = defaultCity;
    const updatedUser = await user.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true });
    res.json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// upload profile photo
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const multerStorage = multer.memoryStorage();
const photoUpload = multer({ storage: multerStorage });

router.post("/upload-photo", passport.authenticate("jwt", { session: false }), photoUpload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "profile_photos" },
      async (error, result) => {
        if (error) return res.status(500).json({ error: "Cloudinary upload failed" });
        const updatedUser = await user.findByIdAndUpdate(req.user._id, { profilePhoto: result.secure_url }, { new: true });
        res.json({ photoUrl: result.secure_url, user: updatedUser });
      }
    );
    uploadStream.end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// route to get user info
router.get("/get_user", passport.authenticate("jwt", { session: false }), c.handleGetUser);

// login route
router.post('/login', c.handleLogin);

// signup route
router.post('/verify-otp', c.handleSignup);

// logout route 
// see why just using req.logout is not working?? - IMPORTANT // it is method by passport 
router.get("/logout", c.handleLogout);

// new code for status
router.get("/status", passport.authenticate("jwt", { session: false }), (req, res) => {

  // Disable browser & proxy caching completely
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  return res.status(200).json({
    message: "User is logged in",
    user: req.user,
  });

});

router.get("/", async (req, res) => {
  try {
    const { cityName } = req.query;
    if (!cityName) return res.status(400).json({ error: "cityName is required" });

    const count = await user.countDocuments({ visitedCities: cityName });
    res.json({ cityName, userCount: count });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


//redirects the user to google oauth 
router.get('/google', passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get("/google/callback", (req, res, next) => {
  try {
    passport.authenticate("google", { session: false }, (err, user, info) => {

      if (err) {
        console.log("Error with server");
        return res.redirect("http://localhost:5173/login?error=server");
      }

      if (!user) {
        console.log("Google login failed");
        return res.redirect("http://localhost:5173/login?error=auth_failed");
      }

      const payload = {
        id: user._id,
      }

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
      );

      console.log("Google login/signup successful");

      // store JWT in cookie
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: false, // change to true in production
        sameSite: "lax"
      });

      // cookies are easier to use when we are redirecting 

      // Redirect to frontend dashboard (or Hero page)
      res.redirect("http://localhost:3000/Hero");

    })(req, res, next);
  } catch (err) {
    console.error(err);
    res.redirect("http://localhost:5173/login?error=exception");
  }
});

module.exports = router;