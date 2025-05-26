const express = require('express');
const router = express.Router();
const Resume = require('../models/resumeModel');

// Upload resume
router.post('/', async (req, res) => {
  try {
    const resume = new Resume(req.body);
    await resume.save();
    res.status(201).json(resume);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all resumes
router.get('/', async (req, res) => {
  const resumes = await Resume.find().populate('user');
  res.json(resumes);
});

module.exports = router;
