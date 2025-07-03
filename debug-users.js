// Debug script to check users in database
// Run this with: node debug-users.js

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    debugUsers();
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

async function debugUsers() {
  try {
    const User = require('./melodex-backend/models/User');
    const Profile = require('./melodex-backend/models/Profile');

    // Get all users
    const users = await User.find({}).select('username displayName email isActive createdAt');
    console.log('\n📊 Users in database:');
    console.log('Total users:', users.length);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: "${user.username || 'NOT SET'}" | Display: "${user.displayName}" | Active: ${user.isActive}`);
    });

    // Get users with usernames
    const usersWithUsernames = users.filter(u => u.username);
    console.log(`\n👤 Users with usernames: ${usersWithUsernames.length}`);
    
    if (usersWithUsernames.length > 0) {
      console.log('Available usernames for testing:');
      usersWithUsernames.forEach(user => {
        console.log(`- ${user.username} (${user.displayName})`);
      });
    }

    // Check profiles
    const profiles = await Profile.find({}).populate('userId', 'username displayName');
    console.log(`\n📈 Total profiles: ${profiles.length}`);
    
    if (profiles.length > 0) {
      console.log('Recent profiles:');
      profiles.slice(-5).forEach(profile => {
        console.log(`- Week: ${profile.weekId} | User: ${profile.userId?.username || 'Unknown'} | Tracks: ${profile.topTracks?.length || 0}`);
      });
    }

    // Test a specific username if provided
    const testUsername = process.argv[2];
    if (testUsername) {
      console.log(`\n🔍 Testing username: "${testUsername}"`);
      const testUser = await User.findByUsername(testUsername);
      if (testUser) {
        console.log('✅ User found:', testUser.username, testUser.displayName);
        const testProfile = await Profile.getLatestProfile(testUser._id);
        if (testProfile) {
          console.log('✅ Profile found:', testProfile.weekId);
        } else {
          console.log('❌ No profile found for this user');
        }
      } else {
        console.log('❌ User not found');
      }
    }

  } catch (error) {
    console.error('Error debugging users:', error);
  } finally {
    mongoose.connection.close();
  }
} 