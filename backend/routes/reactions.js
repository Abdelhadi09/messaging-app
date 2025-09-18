const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reaction = require('../models/Reactions');

// Add or update a reaction to a message
router.post('/', auth, async (req, res) => {
    console.log(req.body);
  const { messageId, reaction, role } = req.body;
  if (!messageId || !reaction || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    let update = {};
    if (role === 'sender') update.senderReaction = reaction;
    else if (role === 'recipient') update.recipientReaction = reaction;
    else return res.status(400).json({ message: 'Invalid role' });

    const result = await Reaction.findOneAndUpdate(
      { messageId },
      { $set: update, timestamp: Date.now() },
      { upsert: true, new: true }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get reactions for a message
router.get('/:messageId', auth, async (req, res) => {
  try {
    const reaction = await Reaction.findOne({ messageId: req.params.messageId });
    res.json(reaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
