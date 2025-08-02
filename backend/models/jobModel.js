// models/TrackedJob.js
const mongoose = require("mongoose");

const jobModel = new mongoose.Schema({
  title: { type: String, required: true },
  company: String,
  location: String,
  type: String, // full-time, part-time, contract, etc.
  description: String,
  applyUrl: String,
  salary_min: Number,
  salary_max: Number,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  jobId: String, // store Adzuna job ID
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TrackedJob", jobModel);
