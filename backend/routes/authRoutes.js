const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//signup Route
router.post('/signup', async (req, res) => {
    try {
    //get user info
    const { name, email, password, role } = req.body;

    //check if email isn't already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'Email already in use' });
  
    //create a new user
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: newUser._id, name: newUser.name, role: newUser.role } });
} catch(err) {
    console.error("Signup error:", err);
    res.status(500).json({error: err.message});
}
});

//Login route
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'User does not exist' });
  
      console.log("User found:", user);
      console.log("Entered password:", password);
      console.log("Hashed password in DB:", user.password);

      console.log("Entered password:", password);
      console.log("User password from DB:", user.password);

      const isMatch = await bcrypt.compare(password.trim(), user.password);
      console.log("isMatch:", isMatch);

      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message });
    }
  });
  
  module.exports = router;