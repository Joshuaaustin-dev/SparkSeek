const mongoose = require('mongoose');

const messageModel = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
});

module.exports = mongoose.model("Message", messageModel);