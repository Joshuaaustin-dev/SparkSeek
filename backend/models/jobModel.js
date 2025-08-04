// models/TrackedJob.js
const mongoose = require("mongoose");

const jobModel = new mongoose.Schema({
  title: { type: String, required: true },
  company: String,
  location: String,
  description: String,
  applyUrl: String,
  salary_min: Number,
  salary_max: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  jobId: String, // job ID from Adzuna
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TrackedJob", jobModel);
