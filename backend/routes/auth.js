const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authRateLimit = require('../middleware/auth-rate-limit');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  });
};

// POST /api/auth/register
router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (typeof email !== 'string' || email.length > 254 || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    if (password.length < 10 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'Password must be 10–128 characters long'
      });
    }

    // Check if user already exists
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({ email: normalizedEmail, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'User with this email already exists' });
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimit, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 128 || !email.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// POST /api/auth/change-password
router.post('/change-password', auth, authRateLimit, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (typeof currentPassword !== 'string' || currentPassword.length > 128 || typeof newPassword !== 'string' || newPassword.length < 10 || newPassword.length > 128)
      return res.status(400).json({ success: false, message: 'New password must be 10–128 characters' });
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(401).json({ success: false, message: 'Account not found' });
    if (!(await user.comparePassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('Password update failed:', error);
    res.status(500).json({ success: false, message: 'Unable to update password' });
  }
});

module.exports = router;
