const express = require('express');
const router = express.Router();
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const authMiddleware = require('../middleware/authMiddleware');
const mongoose = require('mongoose'); 

// Send a message with the /send route
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { to, message } = req.body;
    const senderId = req.user.id;

    if (!to || !message || !message.trim()) {
      return res.status(400).json({ message: 'Recipient and message content are required' });
    }

    // Verify recipient user exists
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Generate conversation ID
    const conversationId = Message.generateConversationId(senderId, to);

    // Create message
    const newMessage = new Message({
      sender: senderId,
      recipient: to,
      content: message.trim(),
      conversationId
    });

    await newMessage.save();

    // Populate sender info for response
    await newMessage.populate('sender', 'name profilePic');
    await newMessage.populate('recipient', 'name profilePic');

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation between two users
router.get('/conversation/:otherUserId', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Generate conversation ID
    const conversationId = Message.generateConversationId(currentUserId, otherUserId);

    // Get messages with pagination (newest first)
    const messages = await Message.find({ conversationId })
      .populate('sender', 'name profilePic')
      .populate('recipient', 'name profilePic')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Mark messages as read (where current user is recipient)
    await Message.updateMany(
      { 
        conversationId,
        recipient: currentUserId,
        read: false 
      },
      { read: true }
    );

    res.json({
      messages: messages.reverse(), 
      hasMore: messages.length === limit
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all conversations for current user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get latest message for each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: new mongoose.Types.ObjectId(currentUserId) },
            { recipient: new mongoose.Types.ObjectId(currentUserId) }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$recipient', new mongoose.Types.ObjectId(currentUserId)] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.sender',
          foreignField: '_id',
          as: 'senderInfo'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastMessage.recipient',
          foreignField: '_id',
          as: 'recipientInfo'
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ]);

    // Process conversations to get other user info
    const processedConversations = conversations.map(conv => {
      const isCurrentUserSender = conv.lastMessage.sender.toString() === currentUserId;
      const otherUser = isCurrentUserSender ? conv.recipientInfo[0] : conv.senderInfo[0];
      
      return {
        conversationId: conv._id,
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name,
          profilePic: otherUser.profilePic,
          role: otherUser.role
        },
        lastMessage: {
          content: conv.lastMessage.content,
          timestamp: conv.lastMessage.timestamp,
          isFromCurrentUser: isCurrentUserSender
        },
        unreadCount: conv.unreadCount
      };
    });

    res.json(processedConversations);

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark conversation as read
router.put('/conversation/:otherUserId/read', authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { otherUserId } = req.params;
    
    const conversationId = Message.generateConversationId(currentUserId, otherUserId);
    
    await Message.updateMany(
      { 
        conversationId,
        recipient: currentUserId,
        read: false 
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

