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
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || /change-this|placeholder|your-secret/i.test(process.env.JWT_SECRET)) {
  throw new Error('JWT_SECRET must be a private random string of at least 32 characters. Set it in backend/.env.');
}

// Middleware
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
  });
  next();
});
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(value => value.trim()) : true, methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '5mb', strict: true }));

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

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required. Set it in backend/.env.');

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
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});
