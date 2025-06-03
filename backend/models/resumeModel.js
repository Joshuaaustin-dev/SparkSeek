const mongoose = require('mongoose');

const resumeModel = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath: { type: String, required: true }, 
  originalName: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resume', resumeModel);