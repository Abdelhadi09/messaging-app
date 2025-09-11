const pusher = require('../config/pusher');

// In-memory store for online users
let onlineUsers = new Set();

// Handle user login
exports.userLogin = (req, res) => {
  const username = req.user.username;
  if (!onlineUsers.has(username)) {
    onlineUsers.add(username);
    pusher.trigger('presence-channel', 'user-online', { username });
  }
  res.status(200).json({ message: 'User is now online', onlineUsers: Array.from(onlineUsers) });
};

// Handle user logout
exports.userLogout = (req, res) => {
  const username = req.user.username;
  if (onlineUsers.has(username)) {
    onlineUsers.delete(username);
    pusher.trigger('presence-channel', 'user-offline', { username });
  }
  res.status(200).json({ message: 'User is now offline', onlineUsers: Array.from(onlineUsers) });
};

// Get all online users
exports.getOnlineUsers = (req, res) => {
  res.status(200).json({ onlineUsers: Array.from(onlineUsers) });
};
