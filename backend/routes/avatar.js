const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const AvatarConfig = require('../models/AvatarConfig');

// ─── Auth middleware ──────────────────────────────────────────────────────────
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

// GET /api/avatar/me — load saved avatar config
router.get('/me', auth, async (req, res) => {
  try {
    const config = await AvatarConfig.findOne({ userId: req.user.userId });
    res.json({ success: true, config: config || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/avatar/save — save/update avatar config
router.post('/save', auth, async (req, res) => {
  try {
    const { bodyType, gender, textures, accessories, skinColor, cameraMode } = req.body;
    const config = await AvatarConfig.findOneAndUpdate(
      { userId: req.user.userId },
      { bodyType, gender, textures, accessories, skinColor, cameraMode },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
