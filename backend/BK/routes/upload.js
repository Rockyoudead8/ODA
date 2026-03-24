const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload_stream(
      { folder: "city_comments" },
      (error, result) => {
        if (error) return res.status(500).json({ error: "Cloudinary upload failed" });
        res.status(200).json({ url: result.secure_url });
      }
    );

    result.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during image upload" });
  }
});

module.exports = router;
