const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

//Get Users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// Get current logged-in user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;  // From JWT middleware
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update the user
router.put('/updateUser', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, bio, skills, profilePic } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const updateFields = {
      name,
      bio,
    };

    if (skills && Array.isArray(skills)) {
      updateFields.skills = skills;
    }

    if (profilePic) updateFields.profilePic = profilePic;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* profile picture updates*/
//Storage location
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "..", "uploads", "profilePics");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

/* Profile picture route: /api/users/profilePic */
router.put("/profilePic", authMiddleware, upload.single("profilePic"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete previous image file (optional cleanup)
    if (user.profilePic && fs.existsSync(user.profilePic)) {
      fs.unlinkSync(user.profilePic);
    }

    // Save new path
    const relativePath = path.join("uploads", "profilePics", req.file.filename);
    user.profilePic = relativePath;
    await user.save();

    res.json({ profilePic: relativePath });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Error uploading profile picture" });
  }
});


module.exports = router;
