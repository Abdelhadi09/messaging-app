const express = require('express');
const router = express.Router();
const { userLogin, userLogout, getOnlineUsers } = require('../controllers/onlineUsersController');
const authMiddleware = require('../middleware/auth');

// Route to handle user login
router.post('/login', authMiddleware, userLogin);

// Route to handle user logout
router.post('/logout', authMiddleware, userLogout);

// Route to get all online users
router.get('/', authMiddleware, getOnlineUsers);

module.exports = router;
