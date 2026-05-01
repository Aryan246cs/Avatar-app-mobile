const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Profile = require('../models/Profile');
const User    = require('../models/User');

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

// GET /api/profile/me
router.get('/me', auth, async (req, res) => {
  try {
    const user    = await User.findById(req.user.userId).select('email createdAt');
    const profile = await Profile.findOne({ userId: req.user.userId });
    res.json({
      success: true,
      profile: {
        email:       user?.email,
        username:    profile?.username || '',
        bio:         profile?.bio || '',
        avatarCount: profile?.avatarCount || 0,
        joinedAt:    user?.createdAt,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/profile/update
router.put('/update', auth, async (req, res) => {
  try {
    const { username, bio } = req.body;
    if (username && username.length > 30)
      return res.status(400).json({ success: false, message: 'Username max 30 chars' });
    if (bio && bio.length > 160)
      return res.status(400).json({ success: false, message: 'Bio max 160 chars' });

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      { username: username?.trim(), bio: bio?.trim() },
      { upsert: true, new: true }
    );
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
