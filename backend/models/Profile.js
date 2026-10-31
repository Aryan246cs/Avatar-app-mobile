const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  username: {
    type: String,
    trim: true,
    maxlength: 30,
    default: '',
  },
  displayName: { type: String, trim: true, maxlength: 50, default: '' },
  pronouns: { type: String, trim: true, maxlength: 32, default: '' },
  bio: {
    type: String,
    maxlength: 160,
    default: '',
  },
  profileImage: { type: String, maxlength: 3_800_000, default: '' },
  avatarCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
