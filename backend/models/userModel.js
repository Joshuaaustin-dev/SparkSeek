const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userModel = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, }, //TODO hash the password
    role: { type: String, enum: ['seeker', 'recruiter'], required: true },
    profilePic: String,
    bio: String,
    skills: [String],
    createdAt: { type: Date, default: Date.now },
});

//Hash the user's password before saving
userModel.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

module.exports = mongoose.model('User', userModel);