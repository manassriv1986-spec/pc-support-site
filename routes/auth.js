const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 1. REGISTER OR RETURN EXISTING USER
router.post('/register', async (req, res) => {
  try {
    const { email, phone, fullName, country } = req.body;

    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      return res.status(200).json({ message: 'Existing user found', userId: user._id });
    }

    user = new User({ email, phone, fullName, country });
    await user.save();

    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

module.exports = router;
