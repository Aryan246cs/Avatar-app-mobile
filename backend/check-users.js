const mongoose = require('mongoose');
const User = require('./models/User');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find all users
    const users = await User.find({}, { password: 0 }); // Exclude password field
    
    console.log('\n📊 Users in database:');
    console.log('Total users:', users.length);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User:`);
        console.log('   ID:', user._id);
        console.log('   Email:', user.email);
        console.log('   Created:', user.createdAt);
        console.log('   Updated:', user.updatedAt);
      });
    } else {
      console.log('No users found in database.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkUsers();