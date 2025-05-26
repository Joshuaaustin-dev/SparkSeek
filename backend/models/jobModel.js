const mongoose = require('mongoose');

const jobModel = new mongoose.Schema({
    title: { type: String, required: true},
    company: String,
    location: String,
    type: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship']},
    description: String,
    skillsRequired: [String],
    recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    createdAt: { type: Date, default: Date.now},
});

module.exports = mongoose.model("Job", jobModel);