const express = require('express');
const User = require('../models/User');
const Profile = require('../models/Profile');
const { verifyJWT, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get public profile by username
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const user = await User.findByUsername(username);
    
    if (!user || !user.isActive) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get latest profile
    const profile = await Profile.getLatestProfile(user._id);
    
    if (!profile) {
      return res.status(404).json({ error: 'No profile found for this user' });
    }
    
    // Check if the requesting user is the profile owner
    const isOwner = req.user && req.user._id.toString() === user._id.toString();
    
    // Return public profile data
    const publicProfile = {
      user: {
        username: user.username,
        displayName: user.displayName,
        profileImage: user.profileImage,
        bannerImage: user.bannerImage,
        tagline: user.tagline
      },
      profile: {
        weekId: profile.weekId,
        topTracks: profile.topTracks,
        topArtists: profile.topArtists,
        recommendations: profile.recommendations,
        topGenres: profile.topGenres,
        mood: profile.customMood || profile.mood,
        createdAt: profile.createdAt
      },
      isOwner
    };
    
    res.json(publicProfile);
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Check username availability
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username || username.length < 3) {
      return res.json({ available: false, error: 'Username must be at least 3 characters long' });
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.json({ available: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' });
    }
    
    const isAvailable = await User.isUsernameAvailable(username);
    
    res.json({ 
      available: isAvailable,
      username: username.toLowerCase()
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Failed to check username availability' });
  }
});

// Set username for current user
router.post('/set-username', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    const { username } = req.body;
    
    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, and hyphens' });
    }
    
    const lowerUsername = username.toLowerCase();
    
    // Check if username is available
    const isAvailable = await User.isUsernameAvailable(lowerUsername);
    if (!isAvailable) {
      return res.status(400).json({ error: 'Username is already taken' });
    }
    
    // Update user's username
    const user = await User.findByIdAndUpdate(
      userId, 
      { username: lowerUsername },
      { new: true }
    ).select('-refreshToken -accessToken -expiresAt');
    
    res.json({ 
      user,
      message: 'Username set successfully'
    });
  } catch (error) {
    console.error('Set username error:', error);
    res.status(500).json({ error: 'Failed to set username' });
  }
});

// Get user's personalization data
router.get('/personalization/current', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).select('bannerImage tagline profileImage');
    
    res.json({
      bannerImage: user.bannerImage,
      tagline: user.tagline,
      profileImage: user.profileImage
    });
  } catch (error) {
    console.error('Get personalization error:', error);
    res.status(500).json({ error: 'Failed to fetch personalization data' });
  }
});

// Search users by username (for future features)
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!query || query.length < 2) {
      return res.json({ users: [] });
    }
    
    const users = await User.find({
      username: { $regex: query.toLowerCase(), $options: 'i' },
      isActive: true
    })
    .select('username displayName profileImage')
    .limit(limit);
    
    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

module.exports = router; 