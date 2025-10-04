const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploaded files
const cloudinary = require('../config/Cloudinary');
const fs = require('fs');
const mailer = require('nodemailer');

const router = express.Router();

const trensporter = mailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, 
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register
router.post('/register', async (req, res) => {
  const { username, password  ,email} = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    user = await User.create({ username, password: hashedPassword , email  , otp, otpExpiry });

    await trensporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, username: user.username });
    console.log(`User registered: ${username}`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { username, otp } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
    if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (Date.now() > user.otpExpiry) return res.status(400).json({ message: 'OTP expired' }); 
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    res.json({ message: 'Email verified successfully' });
    console.log(`User verified: ${username}`);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { username, password  } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search for users
router.get('/search', auth, async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is required' });
  }

  try {
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
    }).select('username');

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.put('/profile', auth, upload.single('file'), async (req, res) => {
  const { bio } = req.body;
  let profilePic;

  try {
    if (req.file) {
      // Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'messaging-app/profile-pics',
        public_id: req.file.originalname,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });

      profilePic = result.secure_url;

      // Delete the file from the uploads folder after Cloudinary processing
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Failed to delete file:', err);
        }
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic, bio },
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch recipient details
router.get('/users/:username', async (req, res) => {
  try {
    console.log('Fetching user with username:', req.params.username); // Debug log
    const user = await User.findOne({ username: req.params.username }).select('username profilePic bio');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error fetching user details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;