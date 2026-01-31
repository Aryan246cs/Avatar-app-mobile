const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/avatar-app')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Find all users
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('\n📊 Users in database:');
    console.log('Total users:', users.length);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User:`);
        console.log('   ID:', user._id);
        console.log('   Email:', user.email);
        console.log('   Created:', user.createdAt);
      });
    } else {
      console.log('No users found in database.');
    }
    
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
  });