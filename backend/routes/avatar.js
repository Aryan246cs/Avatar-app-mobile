const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const AvatarConfig = require('../models/AvatarConfig');

// ─── Auth middleware ──────────────────────────────────────────────────────────
// GET /api/avatar/me — load saved avatar config
router.get('/me', auth, async (req, res) => {
  try {
    const config = await AvatarConfig.findOne({ userId: req.user.userId });
    res.json({ success: true, config: config || null });
  } catch (err) {
    console.error('Avatar load failed:', err);
    res.status(500).json({ success: false, message: 'Unable to load avatar' });
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
    console.error('Avatar save failed:', err);
    res.status(500).json({ success: false, message: 'Unable to save avatar' });
  }
});

module.exports = router;
