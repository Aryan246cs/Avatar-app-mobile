const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  gender: {
    type: String,
    required: true,
    index: true
  },
  glbUrl: {
    type: String,
    required: true
  },
  previewUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);
