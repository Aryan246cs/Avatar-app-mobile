const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function clearUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Count existing users
    const userCount = await User.countDocuments();
    console.log(`📊 Found ${userCount} users in database`);
    
    if (userCount > 0) {
      // Delete all users
      const result = await User.deleteMany({});
      console.log(`🗑️ Deleted ${result.deletedCount} users`);
      console.log('✅ Database cleared successfully!');
    } else {
      console.log('📭 Database is already empty');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

clearUsers();