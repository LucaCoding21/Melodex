const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_-]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  profileImage: {
    type: String,
    default: null
  },
  bannerImage: {
    type: String,
    default: null
  },
  tagline: {
    type: String,
    maxlength: 200,
    default: null
  },
  refreshToken: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for username lookups
userSchema.index({ username: 1 });

// Virtual for checking if token is expired
userSchema.virtual('isTokenExpired').get(function() {
  return this.expiresAt < new Date();
});

// Method to update tokens
userSchema.methods.updateTokens = function(accessToken, refreshToken, expiresIn) {
  this.accessToken = accessToken;
  if (refreshToken) {
    this.refreshToken = refreshToken;
  }
  this.expiresAt = new Date(Date.now() + expiresIn * 1000);
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find by username
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username: username.toLowerCase() });
};

// Static method to check username availability
userSchema.statics.isUsernameAvailable = function(username) {
  return this.findOne({ username: username.toLowerCase() })
    .then(user => !user);
};

module.exports = mongoose.model('User', userSchema); 