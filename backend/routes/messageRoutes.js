const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');

// Send a message
router.post('/', async (req, res) => {
  try {
    const { sender, recipient, content } = req.body;
    if (!sender || !recipient || !content) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const message = new Message({ sender, recipient, content });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all messages between two users
router.get('/:user1Id/:user2Id', async (req, res) => {
  const { user1Id, user2Id } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: user1Id, recipient: user2Id },
        { sender: user2Id, recipient: user1Id },
      ],
    }).sort({ sentAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
