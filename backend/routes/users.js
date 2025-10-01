var express = require('express');
var router = express.Router();

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Example dummy check
  if (email === "test@test.com" && password === "1234") {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

module.exports = router;
