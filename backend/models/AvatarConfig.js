const mongoose = require('mongoose');

const avatarConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // one config per user
  },
  bodyType:   { type: String, default: 'female' },
  gender:     { type: String, default: 'female' },
  textures: {
    eyes:  { type: String, default: 'eyes_default' },
    hair:  { type: String, default: 'hair_default' },
    top:   { type: String, default: 'top_default' },
    pants: { type: String, default: 'pants_default' },
    shoes: { type: String, default: 'shoes_default' },
  },
  accessories: {
    jacket:   { type: Number, default: null },
    pants:    { type: Number, default: null },
    hair:     { type: Number, default: null },
    mask:     { type: Number, default: null },
    fullSuit: { type: Number, default: null },
    shoes:    { type: Number, default: null },
  },
  skinColor:   { type: String, default: null },
  cameraMode:  { type: String, default: 'full' },
}, { timestamps: true });

module.exports = mongoose.model('AvatarConfig', avatarConfigSchema);
