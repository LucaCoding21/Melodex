const axios = require('axios');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  // Search for a song on YouTube and return embed URL
  async searchSong(songName, artistName) {
    try {
      if (!this.apiKey) {
        console.warn('YouTube API key not configured, using fallback method');
        return this.generateFallbackUrl(songName, artistName);
      }

      const query = `${songName} ${artistName} official audio`;
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: 1,
          videoEmbeddable: true,
          key: this.apiKey
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        const videoId = response.data.items[0].id.videoId;
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&start=30&end=90&controls=1&modestbranding=1`;
      }

      return null;
    } catch (error) {
      console.error('YouTube search error:', error.message);
      return this.generateFallbackUrl(songName, artistName);
    }
  }

  // Fallback method when YouTube API is not available
  generateFallbackUrl(songName, artistName) {
    // Create a search URL that users can click to find the song
    const searchQuery = encodeURIComponent(`${songName} ${artistName}`);
    return `https://www.youtube.com/results?search_query=${searchQuery}`;
  }

  // Alternative: Use a music streaming service API (like Last.fm or MusicBrainz)
  async getMusicInfo(songName, artistName) {
    try {
      // Try Last.fm API for additional music info
      const lastfmResponse = await axios.get('http://ws.audioscrobbler.com/2.0/', {
        params: {
          method: 'track.search',
          track: songName,
          artist: artistName,
          api_key: process.env.LASTFM_API_KEY || 'demo',
          format: 'json',
          limit: 1
        }
      });

      if (lastfmResponse.data.results?.trackmatches?.track?.length > 0) {
        const track = lastfmResponse.data.results.trackmatches.track[0];
        return {
          name: track.name,
          artist: track.artist,
          url: track.url,
          listeners: track.listeners
        };
      }

      return null;
    } catch (error) {
      console.error('Last.fm API error:', error.message);
      return null;
    }
  }
}

module.exports = new YouTubeService(); 