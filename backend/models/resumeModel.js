const mongoose = require('mongoose');

const resumeModel = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath: { type: String, required: true },
  originalName: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },

  // Parsed fields from Resume uploads
  parsed: {
    name: String,
    email: String,
    phone: String,
    summary: String,
    totalYearsWorked: String,
    skills: [String],
    education: [String],
    experience: [String],
    
  },

  //Match insights: TODO
  
});

module.exports = mongoose.model('Resume', resumeModel);
