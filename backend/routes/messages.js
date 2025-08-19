
const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { sendMessage } = require('../controllers/messageController');
const pusher = require('../config/pusher'); // Import Pusher configuration

const router = express.Router();

// Initialize Pusher
// const pusher = new Pusher({
//   appId: 'PUSHER_APP_ID',
//   key: 'PUSHE_KEY',
//   secret: 'PUSHER_SECRET',
//   cluster: 'PUSHER_CLUSTER',
//   useTLS: true,
// });

// Send a message (with Pusher trigger)
router.post('/', auth, sendMessage);

// Get all messages involving the current user
router.get('/', auth, async (req, res) => {
  const currentUser = req.user.username;

  const messages = await Message.find({
    $or: [
      { sender: currentUser },
      { recipient: currentUser },
    ],
  })
    .sort({ timestamp: 1 });

  res.json(messages);
});

// Fetch private messages between two users
router.get('/private/:username', auth, async (req, res) => {
  const { username } = req.params;
  const currentUser = req.user.username;

  const messages = await Message.find({
    $or: [
      { sender: currentUser, recipient: username },
      { sender: username, recipient: currentUser },
    ],
  }).sort({ timestamp: 1 });

  res.json(messages);
});

// Get a list of users the current user has talked to
router.get('/users', auth, async (req, res) => {
  const currentUser = req.user.username;

  const messages = await Message.find({
    $or: [
      { sender: currentUser },
      { recipient: currentUser },
    ],
  });

  const users = new Set();
  messages.forEach((msg) => {
    if (msg.sender !== currentUser) users.add(msg.sender);
    if (msg.recipient !== currentUser) users.add(msg.recipient);
  });

  res.json(Array.from(users));
});

// Handle typing indicator
router.post('/typing', auth, async (req, res) => {
  const { recipient } = req.body;
  const sender = req.user.username;

  if (!recipient) {
    return res.status(400).json({ message: 'Recipient is required' });
  }

  try {
    await pusher.trigger('chat-room', 'typing', { sender, recipient });
    res.status(200).json({ message: 'Typing event sent' });
  } catch (error) {
    console.error('Pusher error:', error);
    res.status(500).json({ message: 'Failed to send typing event' });
  }
});

module.exports = router;