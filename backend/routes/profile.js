const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Profile = require('../models/Profile');
const User    = require('../models/User');

// GET /api/profile/me
router.get('/me', auth, async (req, res) => {
  try {
    const user    = await User.findById(req.user.userId).select('email createdAt');
    const profile = await Profile.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json({
      success: true,
      profile: {
        email:       user?.email,
        username:    profile?.username || '',
        displayName: profile?.displayName || '',
        pronouns:    profile?.pronouns || '',
        bio:         profile?.bio || '',
        profileImage: profile?.profileImage || '',
        avatarCount: profile?.avatarCount || 0,
        joinedAt:    user?.createdAt,
      }
    });
  } catch (err) {
    console.error('Profile lookup failed:', err);
    res.status(500).json({ success: false, message: 'Unable to load profile' });
  }
});

// PUT /api/profile/update
router.put('/update', auth, async (req, res) => {
  try {
    const { username, displayName, pronouns, bio, profileImage } = req.body;
    if (username !== undefined && (typeof username !== 'string' || username.trim().length > 30))
      return res.status(400).json({ success: false, message: 'Username max 30 chars' });
    if (bio !== undefined && (typeof bio !== 'string' || bio.length > 160))
      return res.status(400).json({ success: false, message: 'Bio max 160 chars' });
    if (displayName !== undefined && (typeof displayName !== 'string' || displayName.trim().length > 50))
      return res.status(400).json({ success: false, message: 'Display name max 50 chars' });
    if (pronouns !== undefined && (typeof pronouns !== 'string' || pronouns.trim().length > 32))
      return res.status(400).json({ success: false, message: 'Pronouns max 32 chars' });
    if (profileImage !== undefined) {
      if (typeof profileImage !== 'string' || profileImage.length > 3_800_000)
        return res.status(400).json({ success: false, message: 'Profile photo exceeds the 2.8 MB limit' });
      if (profileImage !== '') {
        const match = profileImage.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
        if (!match) return res.status(400).json({ success: false, message: 'Choose a PNG, JPEG, or WebP image' });
        const bytes = Buffer.from(match[2], 'base64');
        const mime = match[1];
        const valid = (mime === 'png' && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
          || (mime === 'jpeg' && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
          || (mime === 'webp' && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP');
        if (bytes.length > 2_800_000 || !valid) return res.status(400).json({ success: false, message: 'Invalid or oversized profile photo' });
      }
    }

    const updates = {};
    if (username !== undefined) updates.username = username.trim();
    if (displayName !== undefined) updates.displayName = displayName.trim();
    if (pronouns !== undefined) updates.pronouns = pronouns.trim();
    if (bio !== undefined) updates.bio = bio.trim();
    if (profileImage !== undefined) updates.profileImage = profileImage.trim();

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { upsert: true, new: true }
    );
    res.json({ success: true, profile });
  } catch (err) {
    console.error('Profile update failed:', err);
    res.status(500).json({ success: false, message: 'Unable to update profile' });
  }
});

module.exports = router;
