const mongoose = require('mongoose');

const messageModel = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 1000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  // group messages into a conversation ID
  conversationId: {
    type: String,
    required: true
  }
});

// Index for querying
messageModel.index({ conversationId: 1, timestamp: 1 });
messageModel.index({ recipient: 1, read: 1 });

// Generates conversation ID
messageModel.statics.generateConversationId = function(userId1, userId2) {
  // Put the smaller ID first to ensure consistent conversation IDs
  return [userId1, userId2].sort().join('_');
};

module.exports = mongoose.model('Message', messageModel);