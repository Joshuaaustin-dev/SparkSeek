// routes/trackedJobs.js
const express = require("express");
const router = express.Router();
const TrackedJob = require("../models/jobModel");
const auth = require("../middleware/authMiddleware");

router.post("/track", auth, async (req, res) => {
  try {
    const { title, company, location, type, description, applyUrl, salary_min, salary_max, jobId } = req.body;

    const newJob = new TrackedJob({
      title,
      company,
      location,
      type,
      description,
      applyUrl,
      salary_min,
      salary_max,
      userId: req.user._id, 
      jobId,
    });

    await newJob.save();
    res.status(201).json({ message: "Job tracked successfully", job: newJob });
  } catch (err) {
    console.error("Error tracking job:", err.message);
    res.status(500).json({ error: "Failed to track job" });
  }
});

module.exports = router;
