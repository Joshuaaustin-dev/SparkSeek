
const express = require("express");
const auth = require("../middleware/authMiddleware");
const axios = require("axios");
const router = express.Router();
const TrackedJob = require("../models/jobModel");

// Get jobs from the Adzuna API
router.get("/external-jobs", async (req, res) => {
  const { query = "", location = "", salaryMin = "", salaryMax = "", datePosted = "" } = req.query;

  const app_id = process.env.ADZUNA_APP_ID;
  const app_key = process.env.ADZUNA_APP_KEY;

  if (!app_id || !app_key) {
    return res.status(500).json({ error: "Missing Adzuna API credentials" });
  }

  const apiUrl = "https://api.adzuna.com/v1/api/jobs/us/search/1";

  const params = {
    app_id,
    app_key,
    what: query,
    where: location,
    salary_min: salaryMin || undefined,
    salary_max: salaryMax || undefined,
    sort_by: "date",
  };

  if (datePosted === "month") {
    params.max_days_old = 30;
  } else if (datePosted === "week") {
    params.max_days_old = 7;
  } else if (datePosted === "3days") {
    params.max_days_old = 3;
  } else if (datePosted === "today") {
    params.max_days_old = 1;
  }

  try {
    const response = await axios.get(apiUrl, { params });

    res.status(200).json({ data: response.data.results });
  } catch (err) {
    console.error("Error fetching jobs from Adzuna:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Failed to fetch jobs from Adzuna" });
  }
});


// Save a job for the user to track
router.post("/track", auth, async (req, res) => {
  try {
    const { title, company, location, description, applyUrl, salary_min, salary_max, jobId } = req.body;
    const userId = req.user._id;

    const existingJob = await TrackedJob.findOne({ jobId, userId });

    if (existingJob) {
      console.log("Existing job found for user:", userId);
      return res.status(200).json({
        message: "Job already tracked",
        alreadyTracked: true,
        job: existingJob,
      });
    }

    console.log("No existing job found, creating new job for user:", userId);

    const newJob = new TrackedJob({
      title,
      company,
      location,
      description,
      applyUrl,
      salary_min,
      salary_max,
      userId,
      jobId,
      status: req.body.status || "Viewed",
    });

    await newJob.save();

    res.status(201).json({ message: "Job tracked successfully", alreadyTracked: false, job: newJob });
  } catch (err) {
    console.error("Error tracking job:", err.message);
    res.status(500).json({ error: "Failed to track job" });
  }
});

//get tracked jobs for the user
router.get("/my-jobs", auth, async (req, res) => { 

  try {
    const jobs = await TrackedJob.find({ userId: req.user._id });
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching tracked jobs:", err.message);
    res.status(500).json({ error: "Failed to fetch tracked jobs" });
  }
});

// Update a tracked job's status
router.put("/update-status/:id", auth, async (req, res) => {
  const { status } = req.body;
  const jobId = req.params.id;

  try {
    const updatedJob = await TrackedJob.findByIdAndUpdate(
      jobId,
      { status },
      { new: true }
    );

    if (!updatedJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(updatedJob);
  } catch (err) {
    console.error("Error updating job status:", err.message);
    res.status(500).json({ error: "Failed to update job status" });
  }
});


module.exports = router;