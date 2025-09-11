require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const onlineUsersRoutes = require('./routes/onlineUsers'); // Import online users routes
const Message = require('./models/Message');

const app = express();

const allowedOrigins = [
  'https://messaging-app-iota-three.vercel.app',
  'http://localhost:3000', 
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/online-users', onlineUsersRoutes); // Add route for online users

// Periodic cleanup of expired messages
setInterval(async () => {
  try {
    const now = new Date();
    const expiredMessages = await Message.find({ expiresAt: { $lt: now } });

    for (const message of expiredMessages) {
      if (message.fileUrl) {
        // Extract the public ID including the folder name from the Cloudinary URL
        const urlParts = message.fileUrl.split('/');
        const folderAndFile = urlParts.slice(-2).join('/'); // e.g., messaging-app/file123.jpg
        const publicId = folderAndFile.split('.')[0]; // Remove the file extension

        console.log(`Attempting to delete file with publicId: ${publicId}`);

        // Delete the file from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId , { invalidate: true });
        console.log(`Cloudinary deletion result for ${publicId}:`, result);
      }

      // Delete the message from the database
      await Message.findByIdAndDelete(message._id);
    }

    console.log(`Cleaned up ${expiredMessages.length} expired messages.`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
},24*60* 60 * 1000);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // Create HTTP server and Socket.IO instance
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    // WebRTC signaling logic
    io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
      });

      socket.on('offer', ({ roomId, offer }) => {
        console.log(`Offer received for room ${roomId}:`, offer);
        socket.to(roomId).emit('offer', { offer });
      });

      socket.on('answer', ({ roomId, answer }) => {
        console.log(`Answer received for room ${roomId}:`, answer);
        socket.to(roomId).emit('answer', { answer });
      });

      socket.on('ice-candidate', ({ roomId, candidate }) => {
        console.log(`ICE candidate received for room ${roomId}:`, candidate);
        socket.to(roomId).emit('ice-candidate', { candidate });
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
      });
    });

    server.listen(process.env.PORT, () => console.log('Server running on port', process.env.PORT));
  })
  .catch(err => console.error(err));