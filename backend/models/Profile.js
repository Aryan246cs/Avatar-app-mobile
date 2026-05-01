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
  bio: {
    type: String,
    maxlength: 160,
    default: '',
  },
  avatarCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
