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

exports.updateMessageStatus = async (req, res) => {
  const { messageId, status } = req.body; // status can be 'delivered' or 'seen'

  try {
    const update = {};
    if (status === 'delivered') update.delivered = true;
    if (status === 'seen') update.seen = true;

    const message = await Message.findByIdAndUpdate(messageId, update, { new: true });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Trigger Pusher event
    pusher.trigger('chat-room', `message-${status}`, {
      messageId,
      status,
    });

    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};