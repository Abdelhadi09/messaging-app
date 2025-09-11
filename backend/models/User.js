const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePic: { type: String, default: '' }, // URL to profile picture
  bio: { type: String, default: '' }, // User bio
});

module.exports = mongoose.model('User', userSchema);