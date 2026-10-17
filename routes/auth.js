const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Case = require('../models/Case');

// 1. REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { email, phone, fullName, country } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email or Phone already registered' });
    }

    const newUser = new User({ email, phone, fullName, country });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

module.exports = router;
