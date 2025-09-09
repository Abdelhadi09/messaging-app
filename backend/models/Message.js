const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  recipient: { type: String, required: true },
  content: {type : String},
  fileUrl: { type: String }, 
  fileType: { type: String }, 
  expiresAt: { type: Date }, 
  timestamp: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false },
  seen: { type: Boolean, default: false },
});

module.exports = mongoose.model('Message', messageSchema);