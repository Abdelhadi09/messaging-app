const express = require('express');
const cloudinary = require('../config/Cloudinary');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const { sendMessage, updateMessageStatus } = require('../controllers/messageController');
const pusher = require('../config/pusher');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files
const fs = require('fs');

const router = express.Router();

// Send a message (with Pusher trigger)
router.post('/', auth, sendMessage);

// Update message status (delivered or seen)
router.post('/status', auth, updateMessageStatus);

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

// Upload a file and send a message
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { recipient } = req.body;
    const originalName = file.originalname;

    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'messaging-app',
      public_id : originalName,
      use_filename: false,
      unique_filename: false,
      access_mode: 'public', // Ensure the file is publicly accessible
      timeout: 60000,
      overwrite: true,
    });

    // Create a new message with file metadata
    const message = new Message({
      sender: req.user.username,
      recipient,
      fileUrl: result.secure_url,
      fileType: result.resource_type,
      expiresAt: new Date(Date.now() +  60 * 1000), 
    });

    await message.save();

    // Delete the file from the uploads folder after Cloudinary processing
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Failed to delete file:', err);
      }
    });

    res.status(201).json({ message: 'File uploaded and message sent.', data: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload file and send message.' });
  }
});

module.exports = router;