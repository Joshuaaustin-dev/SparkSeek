const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ],
    // Deterministic key to ensure uniqueness of a two-participant conversation
    participantsKey: { type: String, required: true, unique: true },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', conversationSchema);