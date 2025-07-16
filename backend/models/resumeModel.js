const mongoose = require('mongoose');

const resumeModel = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //user who uploaded it
  filePath: { type: String, required: true }, //the file uploaded
  originalName: { type: String, required: true }, // the name of the file
  uploadDate: { type: Date, default: Date.now }, // when it was uploaded

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
  }
  
}, { timestamps: true});

module.exports = mongoose.model('Resume', resumeModel);
