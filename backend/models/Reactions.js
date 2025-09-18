const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
 senderReaction : { type: String },
 recipientReaction : { type: String },
  timestamp: { type: Date, default: Date.now },
});

const Reaction = mongoose.model('Reaction', reactionSchema);

module.exports = Reaction;