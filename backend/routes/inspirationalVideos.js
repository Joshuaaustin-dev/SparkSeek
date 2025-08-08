const express = require("express");
const axios = require("axios");
const router = express.Router();

const videos = [
  "https://www.youtube.com/embed/TfC-V6PyYQM",  
  "https://www.youtube.com/embed/IBCHdpMiXds",  
  "https://www.youtube.com/embed/2TeHg50hyYc",  
  "https://www.youtube.com/embed/_lfxYhtf8o4",  
  "https://www.youtube.com/embed/oDzfZOfNki4",  
  "https://www.youtube.com/embed/qYUpZ8uIb_s",  
  "https://www.youtube.com/embed/gwhbt8dWvN4",  
  "https://www.youtube.com/embed/g7r33Ms2UXY",  
  "https://www.youtube.com/embed/HgiiY9TLtX8",  
  "https://www.youtube.com/embed/SmYpuI9n79w",  
  "https://www.youtube.com/embed/WU0Ad4-i7GU",  
  "https://www.youtube.com/embed/uxaxtO3QOAo",  
  "https://www.youtube.com/embed/Lws0oC11tqk",
  "https://www.youtube.com/embed/r5lmw1gMi9M",
  "https://www.youtube.com/embed/tbnzAVRZ9Xc",
  "https://www.youtube.com/embed/BpCA2Q7o4t0",
  "https://www.youtube.com/embed/TwiyWXIc-oo",
  "https://www.youtube.com/embed/dqe0mR63fyo",
  "https://www.youtube.com/embed/FnS6sFIs5Tg",
  "https://www.youtube.com/embed/UF8uR6Z6KLc",
  "https://www.youtube.com/embed/q5nVqeVhgQE",
  "https://www.youtube.com/embed/5fsm-QbN9r8",
  "https://www.youtube.com/embed/26U_seo0a1g",
  "https://www.youtube.com/embed/3vDWWy4CMhE",
  "https://www.youtube.com/embed/0fKBhvDjuy0",
  "https://www.youtube.com/embed/Y6bbMQXQ180",
];

router.get("/video-of-the-day", (req, res) => {
  try {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
    );
    const videoId = videos[dayOfYear % videos.length];
    res.json({ videoId });
  } catch (error) {
    console.error("Error selecting video:", error);
    res.json({ videoId: "TfC-V6PyYQM" }); // Fallback video
  }
});

router.get("/daily-quote", async (req, res) => {
  try {
    const response = await axios.get("https://zenquotes.io/api/today");
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      res.json(response.data);
    } else {
      throw new Error("Invalid quote response from zenquotes.io");
    }
  } catch (error) {
    console.error("Error fetching quote:", error);
    res.json([{ q: "Stay positive and keep pushing forward!", a: "Unknown" }]);
  }
});

module.exports = router;