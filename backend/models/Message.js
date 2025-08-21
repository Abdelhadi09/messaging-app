const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true }, // Changed to store username
  recipient: { type: String, required: true }, // Added recipient field
  content: String,
  fileUrl: { type: String }, // URL of the uploaded file
  fileType: { type: String }, // Type of the file (e.g., image, video)
  expiresAt: { type: Date }, // Expiration time for the file
  timestamp: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false },
  seen: { type: Boolean, default: false },
});

module.exports = mongoose.model('Message', messageSchema);