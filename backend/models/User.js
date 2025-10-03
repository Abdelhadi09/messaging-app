const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email : { type: String, required: true, unique: true }, 
  isVerified: { type: Boolean, default: false }, 
  otp : { type: String }, 
  otpExpiry: { type: Date }, 
  profilePic: { type: String, default: '' }, 
  bio: { type: String, default: '' }, 
});

module.exports = mongoose.model('User', userSchema);