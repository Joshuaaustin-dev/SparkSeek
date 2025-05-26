const mongoose = require('mongoose');

const messageModel = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    content: String,
    sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageModel);