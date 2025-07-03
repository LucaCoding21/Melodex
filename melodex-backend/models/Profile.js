const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weekId: {
    type: String,
    required: true,
    index: true
  },
  topTracks: [{
    name: {
      type: String,
      required: true
    },
    artist: {
      type: String,
      required: true
    },
    albumImage: {
      type: String,
      default: null
    },
    id: {
      type: String,
      required: true
    },
    uri: {
      type: String,
      required: true
    },
    album: {
      type: String,
      default: 'Unknown Album'
    },
    popularity: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    },
    explicit: {
      type: Boolean,
      default: false
    }
  }],
  topArtists: [{
    name: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    uri: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: null
    },
    genres: [{
      type: String
    }],
    popularity: {
      type: Number,
      default: 0
    },
    followers: {
      type: Number,
      default: 0
    }
  }],
  recommendations: [{
    name: {
      type: String,
      required: true
    },
    artist: {
      type: String,
      required: true
    },
    albumImage: {
      type: String,
      default: null
    },
    id: {
      type: String,
      required: true
    },
    uri: {
      type: String,
      required: true
    },
    album: {
      type: String,
      default: 'Unknown Album'
    },
    popularity: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    },
    explicit: {
      type: Boolean,
      default: false
    },
    isRecommendation: {
      type: Boolean,
      default: true
    }
  }],
  topGenres: [{
    type: String,
    required: true
  }],
  mood: {
    type: String,
    required: true,
    default: 'Unknown'
  },
  customMood: {
    type: String,
    maxlength: 50,
    default: null
  },
  tagline: {
    type: String,
    maxlength: 200,
    default: null
  },
  bannerImage: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  // New persona fields
  persona: {
    id: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    analysis: {
      type: String,
      default: null
    }
  },
  // Audio features for persona calculation
  audioFeatures: {
    valence: {
      type: Number,
      default: null
    },
    energy: {
      type: Number,
      default: null
    },
    tempo: {
      type: Number,
      default: null
    },
    dominantGenres: [{
      type: String
    }]
  }
}, {
  timestamps: true
});

// Compound index for userId + weekId
profileSchema.index({ userId: 1, weekId: 1 }, { unique: true });

// Static method to generate week ID
profileSchema.statics.generateWeekId = function(date = new Date()) {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

// Static method to get latest profile for user
profileSchema.statics.getLatestProfile = function(userId) {
  return this.findOne({ userId })
    .sort({ createdAt: -1 })
    .populate('userId', 'username displayName profileImage bannerImage tagline');
};

// Static method to get profile by week
profileSchema.statics.getProfileByWeek = function(userId, weekId) {
  return this.findOne({ userId, weekId })
    .populate('userId', 'username displayName profileImage bannerImage tagline');
};

// Static method to get profile history
profileSchema.statics.getProfileHistory = function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username displayName profileImage bannerImage tagline');
};

// Method to update personalization
profileSchema.methods.updatePersonalization = function(data) {
  if (data.customMood !== undefined) this.customMood = data.customMood;
  if (data.tagline !== undefined) this.tagline = data.tagline;
  if (data.bannerImage !== undefined) this.bannerImage = data.bannerImage;
  return this.save();
};

module.exports = mongoose.model('Profile', profileSchema); 