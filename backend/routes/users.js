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


// user ki visited cities ko count krne ka code
router.post("/", async (req, res) => {
  try {
    const { userId, listingId } = req.body;

    if (!userId || !listingId) {
      return res.status(400).json({ error: "userId and listingId are required" });
    }

    const listing = await listings.findById(listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const cityName = listing.title;

    const foundUser = await user.findById(userId);
    if (!foundUser) return res.status(404).json({ error: "User not found" });

    const alreadyVisited = foundUser.visitedCities?.includes(cityName);

    if (alreadyVisited) {
      foundUser.visitedCities = foundUser.visitedCities.filter((city) => city !== cityName);
      foundUser.citiesVisited = Math.max(0, (foundUser.citiesVisited || 0) - 1);
    } else {
      foundUser.visitedCities = [...(foundUser.visitedCities || []), cityName];
      foundUser.citiesVisited = (foundUser.citiesVisited || 0) + 1;
    }

    await foundUser.save();

    res.json({
      message: "City visit status updated",
      visited: !alreadyVisited,
      count: foundUser.citiesVisited,
      city: cityName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// route to get user info
router.get("/get_user", c.handleGetUser );

// login route
router.post('/login', c.handleLogin );

// signup route
router.post('/signup', c.handleSignup );

// logout route 
// see why just using req.logout is not working?? - IMPORTANT // it is method by passport 
router.get("/logout", c.handleLogout );


//check if user is logged in - route
// lucky's code old

// router.get("/status", (req, res) => {
//   if (req.isAuthenticated()) {
//     return res.status(200).json({ message: "User is logged in", user: req.user });
//   }
//   // console.log("Not Authenticated");
//   res.status(401).json({ message: "User is not logged in" });
// });

// new code for status
router.get("/status", (req, res) => {

  // Disable browser & proxy caching completely
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  if (req.isAuthenticated()) {
    return res.status(200).json({
      message: "User is logged in",
      user: req.user,
    });
  }

  res.status(401).json({ message: "User is not logged in" });
});

//redirects the user to google oauth 
router.get('/google',passport.authenticate("google",{scope: ["profile","email"]}));

//google redirects the user to this url 
// router.get("/google/callback", (req,res)=>{

//     try{ 

//       passport.authenticate("google", (err, user, info) =>{
//       if (err) {
//         return res.status(500).json({ message: "Server error" });
//       }

//       if (!user) {
//         return res.status(401).json({ message: "google login failed" });
//       }

//       req.login(user, (err) => {
//         if (err) {
//           return res.status(500).json({ message: "Login failed" });
//         }

//         res.status(200).json({ message: "Google login/signup successful", user });
//       });


//     }) }
//     catch{
//       console.error(err);
//       res.status(500).json({ message: err.message });
//     }

//   });



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


// module.exports = router;


router.get("/google/callback", (req, res, next) => {
  try {
    passport.authenticate("google", (err, user, info) => {
      if (err) {
        console.log("Error with server");
        return res.redirect("http://localhost:5173/login?error=server");
      }

      if (!user) {
        console.log("Google login failed");
        return res.redirect("http://localhost:5173/login?error=auth_failed");
      }

      req.login(user, (err) => {
        if (err) {
          console.log("Login failed");
          return res.redirect("http://localhost:5173/login?error=login_failed");
        }

        console.log("Google login/signup successful");

        // Redirect to frontend dashboard (or Hero page)
        res.redirect("http://localhost:3000/Hero");
      });
    })(req, res, next);
  } catch (err) {
    console.error(err);
    res.redirect("http://localhost:5173/login?error=exception");
  }
});



module.exports = router;
