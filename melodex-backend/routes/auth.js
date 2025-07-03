const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const spotifyService = require('../services/spotifyService');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Temporary storage for code verifiers (in production, use Redis or database)
const codeVerifierStore = new Map();

// Generate random string for PKCE
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// Generate code challenge for PKCE
const generateCodeChallenge = async (codeVerifier) => {
  const hash = crypto.createHash('sha256');
  hash.update(codeVerifier);
  return hash.digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

// Initiate Spotify OAuth flow
router.get('/spotify/login', async (req, res) => {
  try {
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Generate a unique state parameter to link the code verifier
    const state = generateRandomString(32);
    
    // Store code verifier with state as key
    codeVerifierStore.set(state, codeVerifier);
    
    // Clean up old entries (older than 10 minutes)
    setTimeout(() => {
      codeVerifierStore.delete(state);
    }, 10 * 60 * 1000);
    
    const authUrl = spotifyService.generateAuthUrl(codeChallenge, state);
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate authentication URL' });
  }
});

// Handle Spotify OAuth callback
router.get('/spotify/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing authorization code or state parameter' });
    }
    
    const codeVerifier = codeVerifierStore.get(state);
    
    if (!codeVerifier) {
      return res.status(400).json({ error: 'Invalid or expired state parameter' });
    }

    // Exchange code for tokens
    const { accessToken, refreshToken, expiresIn } = await spotifyService.exchangeCodeForTokens(code, codeVerifier);
    
    // Get user profile from Spotify
    const spotifyProfile = await spotifyService.getUserProfile(accessToken);
    
    // Find or create user
    let user = await User.findOne({ spotifyId: spotifyProfile.id });
    
    if (!user) {
      // Create new user
      user = new User({
        spotifyId: spotifyProfile.id,
        email: spotifyProfile.email,
        displayName: spotifyProfile.display_name,
        profileImage: spotifyProfile.images?.[0]?.url || null,
        refreshToken,
        accessToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000)
      });
      await user.save();
    } else {
      // Update existing user's tokens
      await user.updateTokens(accessToken, refreshToken, expiresIn);
      
      // Update profile image if it changed
      if (spotifyProfile.images?.[0]?.url && spotifyProfile.images[0].url !== user.profileImage) {
        user.profileImage = spotifyProfile.images[0].url;
        await user.save();
      }
    }

    // Generate JWT token
    const token = generateToken(user._id);
    
    // Clean up the code verifier from store
    codeVerifierStore.delete(state);
    
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}?token=${token}&userId=${user._id}`;
    
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Spotify callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?error=auth_failed`);
  }
});

// Refresh access token
router.post('/token/refresh', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get valid access token (will refresh if needed)
    const accessToken = await spotifyService.getValidAccessToken(userId);
    
    res.json({ 
      success: true,
      accessToken,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-refreshToken -accessToken -expiresAt');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router; 