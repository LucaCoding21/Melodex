class SpotifyService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'YOUR_SPOTIFY_CLIENT_ID';
    this.onAuthError = null;
  }

  setAccessToken(token) {
    this.accessToken = token;
  }

  setRefreshToken(token) {
    this.refreshToken = token;
  }

  setAuthErrorHandler(handler) {
    this.onAuthError = handler;
  }

  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.clientId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Token refresh failed:', response.status, errorData);
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      
      // Update refresh token if a new one is provided
      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
      }
      
      return data.access_token;
    } catch (error) {
      console.error('Error during token refresh:', error);
      throw error;
    }
  }

  async makeAuthenticatedRequest(url, options = {}) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      try {
        await this.refreshAccessToken();
        // Retry the request with new token
        return await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            ...options.headers,
          },
        });
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        // Clear tokens since refresh failed
        this.accessToken = null;
        this.refreshToken = null;
        
        // Call error handler if available
        if (this.onAuthError) {
          // Add a small delay to ensure error message is displayed
          setTimeout(async () => {
            await this.onAuthError();
          }, 100);
        }
        throw new Error('Authentication failed');
      }
    }

    return response;
  }

  async exchangeCodeForToken(code) {
    const codeVerifier = sessionStorage.getItem('code_verifier');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: 'http://localhost:5174',
        client_id: this.clientId,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    sessionStorage.removeItem('code_verifier');
    return data.access_token;
  }

  async getTopTracks(limit = 5, timeRange = 'short_term') {
    const response = await this.makeAuthenticatedRequest(
      `https://api.spotify.com/v1/me/top/tracks?limit=${limit}&time_range=${timeRange}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch top tracks');
    }

    const data = await response.json();
    return data.items.map(track => ({
      name: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      albumImage: track.album?.images[0]?.url || 'https://via.placeholder.com/150/1DB954/FFFFFF?text=No+Image',
      id: track.id,
      uri: track.uri
    }));
  }

  async getTopGenres(limit = 5, timeRange = 'short_term') {
    const response = await this.makeAuthenticatedRequest(
      `https://api.spotify.com/v1/me/top/artists?limit=20&time_range=${timeRange}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch top artists');
    }

    const data = await response.json();
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

  generateWeeklyMood() {
    const moods = [
      "Melancholy", "Energetic", "Chill", "Nostalgic", "Adventurous",
      "Romantic", "Focused", "Playful", "Mysterious", "Uplifting"
    ];
    return moods[Math.floor(Math.random() * moods.length)];
  }

  async getCurrentlyPlaying() {
    const response = await this.makeAuthenticatedRequest(
      'https://api.spotify.com/v1/me/player/currently-playing'
    );

    if (!response.ok) {
      if (response.status === 204) {
        // No content - user is not currently playing anything
        return null;
      }
      throw new Error('Failed to fetch currently playing track');
    }

    const data = await response.json();
    return data;
  }

  async getUserProfile() {
    const response = await this.makeAuthenticatedRequest(
      'https://api.spotify.com/v1/me'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return {
      id: data.id,
      displayName: data.display_name,
      email: data.email,
      profileImageUrl: data.images?.[0]?.url || null,
      followers: data.followers?.total || 0,
      country: data.country,
      product: data.product
    };
  }
}

export default new SpotifyService(); 