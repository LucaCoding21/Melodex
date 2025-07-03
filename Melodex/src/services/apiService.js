class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.token = null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('melodex_token', token);
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('melodex_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('melodex_token');
  }

  async makeRequest(endpoint, options = {}) {
    const token = this.getToken();
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async initiateSpotifyLogin() {
    const response = await this.makeRequest('/auth/spotify/login');
    return response.authUrl;
  }

  async refreshToken(userId) {
    const response = await this.makeRequest('/auth/token/refresh', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    return response.accessToken;
  }

  async logout() {
    await this.makeRequest('/auth/logout', { method: 'POST' });
    this.clearToken();
  }

  async getCurrentUser() {
    const response = await this.makeRequest('/auth/me');
    return response.user;
  }

  // Profile Management
  async getCurrentProfile() {
    const response = await this.makeRequest('/api/profile/current');
    return response.profile;
  }

  async syncProfile() {
    const response = await this.makeRequest('/api/profile/sync', {
      method: 'POST',
    });
    return response.profile;
  }

  async updatePersonalization(data) {
    const response = await this.makeRequest('/api/profile/personalization', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.profile;
  }

  async getNowPlaying() {
    const response = await this.makeRequest('/api/profile/now-playing');
    return response;
  }

  async getProfileHistory(limit = 10) {
    const response = await this.makeRequest(`/api/profile/history?limit=${limit}`);
    return response.profiles;
  }

  // User Management
  async getPublicProfile(username) {
    const response = await this.makeRequest(`/api/user/${username}`);
    return response;
  }

  async checkUsernameAvailability(username) {
    const response = await this.makeRequest(`/api/user/check-username/${username}`);
    return response;
  }

  async setUsername(username) {
    const response = await this.makeRequest('/api/user/set-username', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
    return response.user;
  }

  async getPersonalization() {
    const response = await this.makeRequest('/api/user/personalization/current');
    return response;
  }

  // Persona assignment
  async assignPersona() {
    const response = await this.makeRequest('/api/profile/assign-persona', {
      method: 'POST',
    });
    return response;
  }



  // Get detailed persona analysis
  async getPersonaAnalysis() {
    const response = await this.makeRequest('/api/profile/persona-analysis');
    return response;
  }

  // Get YouTube URL for song playback
  async getYouTubeUrl(songName, artistName) {
    // Use public endpoint if user is not authenticated (for public profiles)
    const endpoint = this.isAuthenticated() 
      ? `/api/profile/youtube-url?songName=${encodeURIComponent(songName)}&artistName=${encodeURIComponent(artistName)}`
      : `/api/profile/public/youtube-url?songName=${encodeURIComponent(songName)}&artistName=${encodeURIComponent(artistName)}`;
    
    const response = await this.makeRequest(endpoint);
    return response;
  }

  // Utility methods
  isAuthenticated() {
    return !!this.getToken();
  }

  handleAuthError() {
    this.clearToken();
    window.location.href = '/';
  }
}

export default new ApiService(); 