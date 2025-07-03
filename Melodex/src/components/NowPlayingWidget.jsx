import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const NowPlayingWidget = ({ isVisible = true }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNowPlaying = async () => {
    if (!apiService.isAuthenticated()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getNowPlaying();
      
      if (data.isPlaying && data.track) {
        setCurrentTrack(data.track);
        setIsPlaying(true);
      } else {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error fetching now playing:', error);
      setError('Failed to fetch current track');
      setCurrentTrack(null);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isVisible) return;

    // Fetch immediately
    fetchNowPlaying();

    // Set up polling every 10 seconds
    const interval = setInterval(fetchNowPlaying, 10000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible || (!currentTrack && !isLoading)) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 p-4 max-w-sm">
        {isLoading ? (
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-green-500"></div>
            <span className="text-gray-300 text-sm">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-red-400 text-xs">!</span>
            </div>
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        ) : currentTrack ? (
          <div className="flex items-center space-x-3">
            {/* Album Art */}
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0 shadow-lg">
              {currentTrack.albumImage ? (
                <img 
                  src={currentTrack.albumImage} 
                  alt={`${currentTrack.album} cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">🎵</span>
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <p className="text-xs text-gray-400 font-medium">
                  {isPlaying ? 'Now Playing' : 'Paused'}
                </p>
              </div>
              <p className="text-sm font-medium text-white truncate">
                {currentTrack.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Spotify Logo */}
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-xs">🎵</span>
            </div>
            <span className="text-gray-400 text-sm">Not playing</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NowPlayingWidget; 