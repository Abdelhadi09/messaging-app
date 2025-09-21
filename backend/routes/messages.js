
const express = require('express');
const cloudinary = require('../config/Cloudinary');
const Message = require('../models/Message');
const User = require('../models/User'); // Import User model
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

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUser },
        { recipient: currentUser },
      ],
    });

    const usernames = new Set();
    messages.forEach((msg) => {
      if (msg.sender !== currentUser) usernames.add(msg.sender);
      if (msg.recipient !== currentUser) usernames.add(msg.recipient);
    });

    // Fetch user details from the User model
    const users = await User.find({ username: { $in: Array.from(usernames) } })
      .select('username profilePic ');

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
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

// Fetch the last message received from each user
router.get('/last', auth, async (req, res) => {
  try {
    const currentUser = req.user.username;

    const lastMessages = await Message.aggregate([
      {
        $match: {
          recipient: currentUser,
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: '$sender',
          content: { $first: '$content' },
          timestamp: { $first: '$timestamp' },
          fileType: { $first: '$fileType' },
        },
      },
    ]);

    const formattedMessages = lastMessages.reduce((acc, msg) => {
      acc[msg._id] = {
        content: msg.content,
        timestamp: msg.timestamp,
        fileType: msg.fileType,
      };
      return acc;
    }, {});

    res.json(formattedMessages);
  } catch (err) {
    console.error('Error fetching last messages:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

const mongoose = require('mongoose');
router.delete('/:id', auth, async (req, res) => {
  try {
    const messageId = req.params.id;
    console.log('Delete request for message ID:', messageId);
    const message = await Message.findById(messageId);
    console.log('Message found:', message);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    if (message.sender !== req.user.username) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await message.deleteOne();
    res.json({ message: 'Message deleted' });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({ error: err.message });
  }
});

// Upload an audio file and send as a message
router.post('/upload-audio', auth, upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    const { recipient } = req.body;
    if (!file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }
    // Upload audio to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: 'auto',
      folder: 'messaging-app/audio',
      public_id: file.originalname,
      use_filename: false,
      unique_filename: false,
      access_mode: 'public',
      timeout: 60000,
      overwrite: true,
    });
    // Create a new message with audio metadata
    const message = new Message({
      sender: req.user.username,
      recipient,
      fileUrl: result.secure_url,
      fileType: result.resource_type,
      content: '[Audio message]',
      expiresAt: new Date(Date.now() + 60 * 1000),
    });
    await message.save();
    // Delete the file from uploads folder after Cloudinary processing
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error('Failed to delete file:', err);
      }
    });
    res.status(201).json({ message: 'Audio uploaded and message sent.', data: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload audio and send message.' });
  }
});

module.exports = router;