const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name:      { type: String, default: 'My Avatar' },
  style:     { type: String, default: 'nft' },
  character: { type: String, default: '' },
  imageData: { type: String, required: true }, // base64 PNG
}, { timestamps: true });

// Index for fast user queries
gallerySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Gallery', gallerySchema);
