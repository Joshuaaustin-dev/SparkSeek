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
   status: {
    type: String,
    enum: ["Viewed", "Application Submitted", "Waiting Response", "Interview", "Offer"],
    default: "Viewed",
  }, //status to track where on the dashboard the job is
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TrackedJob", jobModel);
