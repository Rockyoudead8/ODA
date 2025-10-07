const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const response = await fetch("http://localhost:5002/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    const audioBuffer = await response.arrayBuffer();
    const audioUint8 = Buffer.from(audioBuffer);

    res.set({
      "Content-Type": "audio/wav",
      "Content-Disposition": "attachment; filename=music.wav",
    });
    res.send(audioUint8);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

