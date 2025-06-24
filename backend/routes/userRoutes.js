const express = require('express');
const router = express.Router();
const User = require('../models/userModel');

//Get Users
router.get('/', async (req, res) => {
  const users = await User.find();
  res.json(users);
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
router.put('/updateUser', async (req, res) => {
  try {
    // You should get the user id from authenticated session or token
    const userId = req.user.id; // or req.body.userId, etc.

    // Extract name and skills from request body
    const { name, skills } = req.body;

    if (!name && (!skills || skills.length === 0)) {
      return res.status(400).json({ message: 'No data to update' });
    }

    // Update the user document with new name and skills
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(skills && skills.length > 0 && { skills }),
      },
      { new: true } // return the updated doc
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
