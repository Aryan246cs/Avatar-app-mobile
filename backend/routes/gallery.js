const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Gallery = require('../models/Gallery');
const Profile = require('../models/Profile');

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

// GET /api/gallery/me — get user's gallery (latest 20)
router.get('/me', auth, async (req, res) => {
  try {
    const items = await Gallery.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-imageData'); // don't send image data in list
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/gallery/:id — get single image with data
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Gallery.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/gallery/save — save a generated image
router.post('/save', auth, async (req, res) => {
  try {
    const { name, style, character, imageData } = req.body;
    if (!imageData) return res.status(400).json({ success: false, message: 'imageData required' });

    const item = await Gallery.create({
      userId: req.user.userId,
      name: name || 'My Avatar',
      style: style || 'nft',
      character: character || '',
      imageData,
    });

    // Increment avatar count on profile
    await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      { $inc: { avatarCount: 1 } },
      { upsert: true }
    );

    res.json({ success: true, item: { ...item.toObject(), imageData: undefined } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Gallery.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    await Profile.findOneAndUpdate({ userId: req.user.userId }, { $inc: { avatarCount: -1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
