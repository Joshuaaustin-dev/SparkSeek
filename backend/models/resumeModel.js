const mongoose = require('mongoose');

const resumeModel = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true }, 
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', resumeModel);