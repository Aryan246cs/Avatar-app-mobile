const express = require('express');
const router = express.Router();
const Asset = require('../models/Asset');

// GET /api/assets
// Returns assets, optionally filtered by type and gender
router.get('/', async (req, res) => {
  try {
    const { type, gender } = req.query;
    
    // Build query object dynamically based on provided params
    const query = {};
    if (type) query.type = type;
    
    // Convert 'femaleX' or 'maleX' body parameter to generic 'female' or 'male'
    // Alternatively, the frontend should strictly send 'female' or 'male'
    if (gender) query.gender = gender.startsWith('female') ? 'female' : 'male';

    const assets = await Asset.find(query);
    
    res.json(assets);
  } catch (error) {
    console.error('❌ Error fetching assets:', error);
    res.status(500).json({ message: 'Server error fetching assets' });
  }
});

module.exports = router;
