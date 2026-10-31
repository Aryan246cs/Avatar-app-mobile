const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Gallery = require('../models/Gallery');
const Profile = require('../models/Profile');

// GET /api/gallery/me — get user's gallery (latest 20)
router.get('/me', auth, async (req, res) => {
  try {
    const items = await Gallery.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('-imageData'); // don't send image data in list
    res.json({ success: true, items });
  } catch (err) {
    console.error('Gallery load failed:', err);
    res.status(500).json({ success: false, message: 'Unable to load gallery' });
  }
});

// GET /api/gallery/:id — get single image with data
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Gallery.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, item });
  } catch (err) {
    console.error('Gallery item load failed:', err);
    res.status(500).json({ success: false, message: 'Unable to load gallery item' });
  }
});

// POST /api/gallery/save — save a generated image
router.post('/save', auth, async (req, res) => {
  try {
    const { name, style, character, imageData } = req.body;
    if (typeof imageData !== 'string' || imageData.length > 4_200_000 || !/^(?:data:image\/(?:png|jpeg|webp);base64,)?[A-Za-z0-9+/]+={0,2}$/.test(imageData))
      return res.status(400).json({ success: false, message: 'A valid PNG, JPEG, or WebP image is required (max 3 MB)' });
    const encodedImage = imageData.replace(/^data:image\/(?:png|jpeg|webp);base64,/, '');
    const imageBytes = Buffer.from(encodedImage, 'base64');
    const isPng = imageBytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isJpeg = imageBytes[0] === 0xff && imageBytes[1] === 0xd8 && imageBytes[2] === 0xff;
    const isWebp = imageBytes.toString('ascii', 0, 4) === 'RIFF' && imageBytes.toString('ascii', 8, 12) === 'WEBP';
    if (imageBytes.length > 3_000_000 || !(isPng || isJpeg || isWebp))
      return res.status(400).json({ success: false, message: 'A valid PNG, JPEG, or WebP image is required (max 3 MB)' });
    if (name !== undefined && (typeof name !== 'string' || name.trim().length > 60))
      return res.status(400).json({ success: false, message: 'Name must be 60 characters or fewer' });
    if (character !== undefined && (typeof character !== 'string' || character.length > 500))
      return res.status(400).json({ success: false, message: 'Character description must be 500 characters or fewer' });

    const item = await Gallery.create({
      userId: req.user.userId,
      name: name || 'My Avatar',
      style: style || 'nft',
      character: character || '',
      imageData: encodedImage,
    });

    // Increment avatar count on profile
    await Profile.findOneAndUpdate(
      { userId: req.user.userId },
      { $inc: { avatarCount: 1 } },
      { upsert: true }
    );

    res.json({ success: true, item: { ...item.toObject(), imageData: undefined } });
  } catch (err) {
    console.error('Gallery save failed:', err);
    res.status(500).json({ success: false, message: 'Unable to save image' });
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Gallery.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    await Profile.findOneAndUpdate({ userId: req.user.userId }, { $inc: { avatarCount: -1 } });
    res.json({ success: true });
  } catch (err) {
    console.error('Gallery delete failed:', err);
    res.status(500).json({ success: false, message: 'Unable to delete image' });
  }
});

module.exports = router;
