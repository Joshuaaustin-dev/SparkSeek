const express = require('express');
const router = express.Router();
const Job = require('../models/jobModel');

//create job
router.post('/', async (req, res) => {
  try {
  const job = new Job(req.body);
  await job.save();
  res.status(201).json(job);
} catch(err) {
  res.status(400).json({ error: err.message });
}
});

// Get all jobs
router.get('/', async (req, res) => {
  const jobs = await Job.find().populate('recruiter');
  res.json(jobs);
});

module.exports = router;
