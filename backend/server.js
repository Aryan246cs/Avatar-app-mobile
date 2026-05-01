const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes           = require('./routes/auth');
const generateAvatarRoutes = require('./routes/generate-avatar');
const avatarRoutes         = require('./routes/avatar');
const galleryRoutes        = require('./routes/gallery');
const profileRoutes        = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/generate-avatar', generateAvatarRoutes);
app.use('/api/avatar', avatarRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/profile', profileRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Avatar App Backend is running!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    // Start server after DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});