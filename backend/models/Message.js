const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // Changed to store username
  recipient: { type: String, required: true }, // Added recipient field
  content: String,
  timestamp: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false },
  seen: { type: Boolean, default: false },
});

module.exports = mongoose.model('Message', messageSchema);