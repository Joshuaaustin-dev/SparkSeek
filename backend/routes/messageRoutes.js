const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');
const auth = require('../middleware/authMiddleware');

// Helper to build deterministic key for a pair of users
function buildParticipantsKey(userIdA, userIdB) {
  const [a, b] = [String(userIdA), String(userIdB)].sort();
  return `${a}_${b}`;
}

// Send a message using logged-in user as sender
router.post('/send', auth, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ message: 'Recipient and message are required.' });
    }

    if (String(to) === String(senderId)) {
      return res.status(400).json({ message: 'Cannot send a message to yourself.' });
    }

    // Find or create conversation for these two participants
    const participantsKey = buildParticipantsKey(senderId, to);
    let conversation = await Conversation.findOne({ participantsKey });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, to],
        participantsKey,
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      recipient: to,
      content: message,
      conversation: conversation._id,
    });

    // Update conversation lastMessage and timestamps
    conversation.lastMessage = newMessage._id;
    await conversation.save();

    // Emit real-time event if socket.io is available
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${to}`).emit('message:new', {
        conversationId: String(conversation._id),
        message: newMessage,
      });
      io.to(`user:${senderId}`).emit('message:sent', {
        conversationId: String(conversation._id),
        message: newMessage,
      });
    }

    res.status(201).json({ conversationId: conversation._id, message: newMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// List conversations for the logged-in user
router.get('/conversations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ participants: userId })
      .populate({
        path: 'participants',
        select: 'name profilePic role',
      })
      .populate({
        path: 'lastMessage',
        select: 'sender recipient content sentAt',
      })
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    console.error('Fetch conversations error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get messages in a specific conversation, ensuring membership
router.get('/conversations/:conversationId/messages', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const convo = await Conversation.findById(conversationId);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });

    if (!convo.participants.some((p) => String(p) === String(userId))) {
      return res.status(403).json({ message: 'Not authorized for this conversation' });
    }

    const messages = await Message.find({ conversation: conversationId }).sort({ sentAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error('Fetch conversation messages error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Legacy: Get all messages between two users (kept for compatibility)
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
