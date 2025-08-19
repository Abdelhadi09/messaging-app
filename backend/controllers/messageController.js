const Message = require('../models/Message');
const User = require('../models/User'); // Import User model
const pusher = require('../config/pusher');

exports.sendMessage = async (req, res) => {
  const { content, recipient } = req.body; // Include recipient in the request body
  const sender = req.user.username; // Use username for sender

  // Validate recipient
  const recipientExists = await User.findOne({ username: recipient });
  if (!recipientExists) {
    return res.status(400).json({ message: 'Recipient does not exist' });
  }

  const message = await Message.create({ sender, recipient, content }); // Save recipient

  pusher.trigger('chat-room', 'new-message', {
    sender,
    recipient, // Include recipient in the event
    content,
    timestamp: message.timestamp,
  });

  res.status(201).json(message);
};