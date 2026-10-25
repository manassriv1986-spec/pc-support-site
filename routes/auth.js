const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path if needed

// 1. Register Route (with duplicate email check)
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, country } = req.body;

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'This email is already registered. Please log in instead.' });
        }

        const newUser = new User({ name, email, phone, country });
        await newUser.save();

        res.status(201).json({ userId: newUser._id, message: 'Registration successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// 2. Login Route
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Email not found. Please register first.' });
        }

        res.status(200).json({ userId: user._id, name: user.name, message: 'Login successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;