const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { sendMessage } = require('../controllers/messageController');

const router = express.Router();

// Send a message (with Pusher trigger)
router.post('/', auth, sendMessage);

// Get all messages (history)
router.get('/', auth, async (req, res) => {
  const messages = await Message.find()
    .populate('sender', 'username')
    .sort({ timestamp: 1 });
  res.json(messages);
});

module.exports = router;