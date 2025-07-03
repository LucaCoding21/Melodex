const axios = require('axios');
const User = require('../models/User');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  }

  // Generate Spotify OAuth URL
  generateAuthUrl(codeChallenge, state) {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: 'user-top-read user-read-private user-read-email user-read-currently-playing',
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: this.redirectUri,
      state: state,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code, codeVerifier) {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code_verifier: codeVerifier,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Spotify token exchange error:', error.response?.data || error.message);
      throw new Error('Failed to exchange code for tokens');
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post('https://accounts.spotify.com/api/token', {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken, // Keep old refresh token if new one not provided
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('Spotify token refresh error:', error.response?.data || error.message);
      throw new Error('Failed to refresh access token');
    }
  }

  // Make authenticated request to Spotify API
  async makeAuthenticatedRequest(accessToken, url, options = {}) {
    try {
      const response = await axios({
        url,
        method: options.method || 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        data: options.data,
        params: options.params,
      });

      return response.data;
    } catch (error) {
      console.error(`Spotify API Error for ${url}:`, {
        status: error.response?.status,
        message: error.response?.data?.error?.message || error.message,
        params: options.params
      });
      
      if (error.response?.status === 401) {
        throw new Error('TOKEN_EXPIRED');
      }
      if (error.response?.status === 403) {
        throw new Error('TOKEN_INSUFFICIENT_SCOPE');
      }
      throw error;
    }
  }

  // Get user profile from Spotify
  async getUserProfile(accessToken) {
    return this.makeAuthenticatedRequest(accessToken, 'https://api.spotify.com/v1/me');
  }

  // Get user's top tracks with enhanced data
  async getTopTracks(accessToken, limit = 20, timeRange = 'short_term') {
    const data = await this.makeAuthenticatedRequest(accessToken, 'https://api.spotify.com/v1/me/top/tracks', {
      params: { limit, time_range: timeRange }
    });

    // Debug: Log the first track's raw data to see what fields are available
    if (data.items && data.items.length > 0) {
      console.log('Raw Spotify track data (first track):', JSON.stringify(data.items[0], null, 2));
    }

    const tracks = data.items.map(track => {
      const trackData = {
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        albumImage: track.album?.images[0]?.url || null,
        id: track.id,
        uri: track.uri,
        album: track.album?.name || 'Unknown Album',
        popularity: track.popularity || 0,
        duration: track.duration_ms,
        explicit: track.explicit || false,
        previewUrl: track.preview_url || null
      };
      
      // Debug logging
      console.log(`Track: ${trackData.name} - Preview URL: ${trackData.previewUrl ? 'YES' : 'NO'}`);
      console.log(`Raw preview_url field:`, track.preview_url);
      
      return trackData;
    });

    return tracks;
  }

  // Get user's top genres
  async getTopGenres(accessToken, limit = 5, timeRange = 'short_term') {
    const data = await this.makeAuthenticatedRequest(accessToken, 'https://api.spotify.com/v1/me/top/artists', {
      params: { limit: 20, time_range: timeRange }
    });

    const genres = data.items.flatMap(artist => artist.genres);
    
    // Count genre occurrences and return top genres
    const genreCount = {};
    genres.forEach(genre => {
      genreCount[genre] = (genreCount[genre] || 0) + 1;
    });

    return Object.entries(genreCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([genre]) => genre);
  }

  // Get audio features for tracks
  async getAudioFeatures(accessToken, trackIds) {
    if (!trackIds || trackIds.length === 0) {
      return [];
    }

    try {
      // Spotify API allows max 100 track IDs per request
      const chunks = [];
      for (let i = 0; i < trackIds.length; i += 100) {
        chunks.push(trackIds.slice(i, i + 100));
      }

      const allFeatures = [];
      for (const chunk of chunks) {
        try {
          const data = await this.makeAuthenticatedRequest(accessToken, 'https://api.spotify.com/v1/audio-features', {
            params: { ids: chunk.join(',') }
          });
          if (data.audio_features) {
            allFeatures.push(...data.audio_features);
          }
        } catch (chunkError) {
          console.error('Error getting audio features for chunk:', chunkError);
          // Continue with other chunks even if one fails
        }
      }

      return allFeatures.filter(feature => feature !== null);
    } catch (error) {
      console.error('Error in getAudioFeatures:', error);
      return []; // Return empty array if audio features fail
    }
  }

  // Get currently playing track
  async getCurrentlyPlaying(accessToken) {
    try {
      return await this.makeAuthenticatedRequest(accessToken, 'https://api.spotify.com/v1/me/player/currently-playing');
    } catch (error) {
      if (error.response?.status === 204) {
        return null; // No content - user is not currently playing anything
      }
      throw error;
    }
  }

  // Generate weekly mood
  generateWeeklyMood() {
    const moods = [
      "Melancholy", "Energetic", "Chill", "Nostalgic", "Adventurous",
      "Romantic", "Focused", "Playful", "Mysterious", "Uplifting"
    ];
    return moods[Math.floor(Math.random() * moods.length)];
  }

  // Update user's tokens in database
  async updateUserTokens(userId, accessToken, refreshToken, expiresIn) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return user.updateTokens(accessToken, refreshToken, expiresIn);
  }

  // Get valid access token for user (refresh if needed)
  async getValidAccessToken(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    console.log('Token check for user:', user.username);
    console.log('Current token expires at:', user.expiresAt);
    console.log('Current time:', new Date());

    // Check if token is expired or will expire in the next 5 minutes
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    
    if (user.expiresAt < fiveMinutesFromNow) {
      console.log('Token expired or expiring soon, refreshing...');
      try {
        const { accessToken, refreshToken, expiresIn } = await this.refreshAccessToken(user.refreshToken);
        await this.updateUserTokens(userId, accessToken, refreshToken, expiresIn);
        console.log('Token refreshed successfully');
        return accessToken;
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.message);
        throw new Error('TOKEN_REFRESH_FAILED');
      }
    }

    console.log('Using existing valid token');
    return user.accessToken;
  }

  // Get user's top artists
  async getTopArtists(accessToken, limit = 10, timeRange = 'short_term') {
    const data = await this.makeAuthenticatedRequest(accessToken, 'https://api.spotify.com/v1/me/top/artists', {
      params: { limit, time_range: timeRange }
    });

    return data.items.map(artist => ({
      name: artist.name,
      id: artist.id,
      uri: artist.uri,
      image: artist.images[0]?.url || null,
      genres: artist.genres || [],
      popularity: artist.popularity || 0,
      followers: artist.followers?.total || 0
    }));
  }

  // Get track details with preview URLs
  async getTrackDetails(accessToken, trackIds) {
    if (!trackIds || trackIds.length === 0) {
      return [];
    }

    try {
      // Spotify API allows max 50 track IDs per request
      const chunks = [];
      for (let i = 0; i < trackIds.length; i += 50) {
        chunks.push(trackIds.slice(i, i + 50));
      }

      const allTracks = [];
      for (const chunk of chunks) {
        try {
          const data = await this.makeAuthenticatedRequest(accessToken, 'https://api.spotify.com/v1/tracks', {
            params: { ids: chunk.join(',') }
          });
          if (data.tracks) {
            allTracks.push(...data.tracks);
          }
        } catch (chunkError) {
          console.error('Error getting track details for chunk:', chunkError);
          // Continue with other chunks even if one fails
        }
      }

      return allTracks.filter(track => track !== null);
    } catch (error) {
      console.error('Error in getTrackDetails:', error);
      return []; // Return empty array if track details fail
    }
  }

  // Get recommendations based on user's top tracks
  async getRecommendations(accessToken, seedTracks = [], limit = 10) {
    if (seedTracks.length === 0) {
      return [];
    }

    // Get up to 5 seed tracks for recommendations
    const seeds = seedTracks.slice(0, 5).map(track => track.id);
    
    try {
      const data = await this.makeAuthenticatedRequest(accessToken, 'https://api.spotify.com/v1/recommendations', {
        params: { 
          seed_tracks: seeds.join(','),
          limit: limit,
          min_energy: 0.3,
          max_energy: 0.9,
          min_valence: 0.2,
          max_valence: 0.8
        }
      });

      return data.tracks.map(track => ({
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        albumImage: track.album?.images[0]?.url || null,
        id: track.id,
        uri: track.uri,
        album: track.album?.name || 'Unknown Album',
        popularity: track.popularity || 0,
        duration: track.duration_ms,
        explicit: track.explicit || false,
        isRecommendation: true
      }));
    } catch (error) {
      console.error('Error getting recommendations:', error.message);
      console.log('Failed seed tracks:', seeds);
      // Return empty array if recommendations fail - this won't break the profile sync
      return [];
    }
  }
}

module.exports = new SpotifyService(); 