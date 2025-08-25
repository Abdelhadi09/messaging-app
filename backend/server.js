require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
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
  .then(() => app.listen(process.env.PORT, () => console.log('Server running')))
  .catch(err => console.error(err));