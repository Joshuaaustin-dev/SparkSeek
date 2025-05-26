const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');

// Send message
router.post('/', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all messages between two users
router.get('/:user1Id/:user2Id', async (req, res) => {
  const { user1Id, user2Id } = req.params;
  const messages = await Message.find({
    $or: [
      { sender: user1Id, receiver: user2Id },
      { sender: user2Id, receiver: user1Id },
    ],
  }).sort({ timestamp: 1 });
  res.json(messages);
});

module.exports = router;
