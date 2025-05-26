const mongoose = require('mongoose');

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
userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model('User', userModel);