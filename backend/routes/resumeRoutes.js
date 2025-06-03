const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Resume = require('../models/resumeModel');
const authenticate = require('../middleware/authMiddleware');

// Setup multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${req.user.id}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

// Upload resume
router.post('/', authenticate, (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file);

    const newResume = new Resume({
      user: req.user.id,
      filePath: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      uploadDate: new Date(),
    });

    await newResume.save();
    res.status(201).json(newResume);
  } catch (err) {
    console.error('Upload route error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all resumes
router.get('/', authenticate, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id }); // only fetch resumes for logged-in user
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
