import React, { useState, useEffect, useMemo } from 'react';
import PersonalizationPanel from './PersonalizationPanel';
import PersonaReveal from './PersonaReveal';
import PersonaAnalysis from './PersonaAnalysis';
import YouTubePlayer from './YouTubePlayer';
import apiService from '../services/apiService';

const MusicProfile = ({ profile, isLoading, isPublic = false, username = null, onSyncSpotify }) => {
  const [showPersonalization, setShowPersonalization] = useState(false);
  const [personalizationData, setPersonalizationData] = useState({
    bannerImageUrl: null,
    tagline: null,
    profileImageUrl: null
  });
  const [persona, setPersona] = useState(null);
  const [isAssigningPersona, setIsAssigningPersona] = useState(false);
  const [showPersonaReveal, setShowPersonaReveal] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showPersonaAnalysis, setShowPersonaAnalysis] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  
  // YouTube player state
  const [youtubePlayer, setYoutubePlayer] = useState({
    isVisible: false,
    currentTrack: null
  });

  // Check if current user is the profile owner
  const isOwner = !isPublic && apiService.isAuthenticated();

  useEffect(() => {
    if (isOwner) {
      loadPersonalizationData();
    }
  }, [isOwner]);

  // Load persona from profile data
  useEffect(() => {
    console.log('Profile data:', profile);
    console.log('Profile persona:', profile?.persona);
    if (profile?.persona) {
      console.log('Setting persona:', profile.persona);
      setPersona(profile.persona);
    } else {
      console.log('No persona found in profile');
    }
  }, [profile]);

  const loadPersonalizationData = async () => {
    try {
      const data = await apiService.getPersonalization();
      setPersonalizationData(data);
    } catch (error) {
      console.error('Error loading personalization data:', error);
    }
  };

  const handleAssignPersona = async () => {
    try {
      setIsAssigningPersona(true);
      const response = await apiService.assignPersona();
      setPersona(response.persona);
      // Trigger dramatic reveal
      setShowPersonaReveal(true);
      setIsRevealing(true);
    } catch (error) {
      console.error('Error assigning persona:', error);
      // TODO: Add error notification
    } finally {
      setIsAssigningPersona(false);
    }
  };

  const handlePersonaReveal = () => {
    // This will be called when the user clicks "OPEN YOUR PERSONA!"
    console.log('Starting dramatic persona reveal!');
    setIsRevealing(true); // This triggers the dramatic sequence
  };

  const handlePersonaRevealClose = () => {
    setShowPersonaReveal(false);
    setIsRevealing(false);
  };

  const handlePersonaAnalysisClose = () => {
    setShowPersonaAnalysis(false);
  };

  const handlePersonalizationUpdate = () => {
    loadPersonalizationData();
  };

  const handleCopyProfile = () => {
    const profileUrl = `https://melodex-3zxz.vercel.app/${username}`;
    navigator.clipboard.writeText(profileUrl);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 3000);
  };

  const handleSyncSpotify = async () => {
    if (onSyncSpotify) {
      await onSyncSpotify();
    }
  };

  // YouTube player functions
  const handleTrackClick = (track) => {
    setYoutubePlayer({
      isVisible: true,
      currentTrack: track
    });
  };

  const closeYouTubePlayer = () => {
    setYoutubePlayer({
      isVisible: false,
      currentTrack: null
    });
  };

  // Use real data if available, otherwise fall back to dummy data
  const songs = profile?.topTracks || [];
  const artists = profile?.topArtists || [];
  const genres = profile?.topGenres || [];
  const mood = profile?.customMood || profile?.mood || '';

  // Memoize data to prevent unnecessary re-renders
  const memoizedSongs = useMemo(() => songs, [songs]);
  const memoizedArtists = useMemo(() => artists, [artists]);
  const memoizedGenres = useMemo(() => genres, [genres]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Profile Header */}
        <header className="text-center mb-8 sm:mb-16">
          {/* Profile Image */}
          <div className="flex justify-center mb-6 sm:mb-8">
            {personalizationData.profileImageUrl ? (
              <img 
                src={personalizationData.profileImageUrl} 
                alt="Profile"
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-green-500 shadow-2xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-green-500 shadow-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <svg className="w-8 h-8 sm:w-12 sm:h-12 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2 sm:mb-4">
            {isPublic ? username : 'Melodex'}
          </h1>
          
          {/* Tagline */}
          {personalizationData.tagline && (
            <p className="text-center text-gray-300 mb-4 sm:mb-6 text-lg sm:text-xl font-medium px-4">
              "{personalizationData.tagline}"
            </p>
          )}
          
          <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8">
            {isPublic ? 'Music Profile' : 'Your Musical Identity'}
          </p>
          
          {/* Sync Spotify Button - Only show for logged-in users without profile */}
          {!isPublic && !profile && (
            <div className="mb-6 sm:mb-8">
              <button
                onClick={handleSyncSpotify}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 shadow-2xl hover:shadow-green-500/25 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 text-sm sm:text-base"
              >
                {isLoading ? 'Syncing...' : 'Sync Spotify Data'}
              </button>
            </div>
          )}
          
          {/* Personalization Toggle Button - Only show for logged-in users */}
          {!isPublic && isOwner && profile && (
            <div className="mb-6 sm:mb-8">
              <button
                onClick={() => setShowPersonalization(!showPersonalization)}
                className="bg-gray-800/80 backdrop-blur-sm text-gray-300 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium hover:bg-gray-700/80 transition-all duration-200 shadow-lg border border-gray-600/50 text-sm sm:text-base"
              >
                {showPersonalization ? 'Hide Customization' : 'Customize Profile'}
              </button>
            </div>
          )}
          
          {/* Share Profile Section - Only show for logged-in users */}
          {!isPublic && username && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-700/50 max-w-md mx-auto">
              <p className="text-sm text-gray-400 mb-3 font-medium">Share your profile:</p>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={`https://melodex-3zxz.vercel.app/${username}`}
                  readOnly
                  className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-mono text-gray-300 w-full"
                />
                <button
                  onClick={handleCopyProfile}
                  className="bg-gray-700/50 text-gray-300 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-600/50 transition-all duration-200 border border-gray-600/50 w-full sm:w-auto"
                >
                  Copy
                </button>
              </div>
              
              {/* Debug Section - Only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-400 font-medium mb-2">Debug Info:</p>
                  <p className="text-xs text-yellow-300">Username: {username}</p>
                  <p className="text-xs text-yellow-300">Has Profile: {profile ? 'Yes' : 'No'}</p>
                  <a 
                    href={`https://melodex-3zxz.vercel.app/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-400 hover:text-green-300 underline"
                  >
                    Test Public Profile →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Copy Success Toast */}
          {showCopyToast && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/90 backdrop-blur-sm border border-green-400 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl text-sm sm:text-base">
              Profile link copied to clipboard! 🎵
            </div>
          )}
        </header>

        {/* Personalization Panel */}
        {showPersonalization && isOwner && (
          <div className="mb-6 sm:mb-8">
            <PersonalizationPanel 
              onUpdate={handlePersonalizationUpdate}
            />
          </div>
        )}

        {/* Weekly Mood Section */}
        {mood && (
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 border border-gray-700/50">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">This Week's Vibe</h2>
            <div className="inline-block bg-gradient-to-r from-green-500 to-purple-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-lg sm:text-xl shadow-lg">
              {mood}
            </div>
          </section>
        )}

        {/* Music Persona Section */}
        <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 border border-gray-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Your Music Persona</h2>
            <div className="flex gap-2">
              {!isPublic && isOwner && profile && !persona && (
                <button
                  onClick={handleAssignPersona}
                  disabled={isAssigningPersona}
                  className="bg-gradient-to-r from-green-500 to-purple-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:from-green-600 hover:to-purple-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isAssigningPersona ? 'Analyzing...' : 'Discover My Persona'}
                </button>
              )}
            </div>
          </div>
          
          {persona ? (
            <div className="text-center bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-6 sm:p-8 rounded-xl border border-gray-600/50">
              <div className="text-4xl sm:text-6xl mb-4">{persona.id}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{persona.name}</h3>
              <p className="text-gray-300 italic text-base sm:text-lg max-w-2xl mx-auto mb-6">{persona.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setShowPersonaReveal(true);
                    setIsRevealing(true); // Start the dramatic sequence
                  }}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-lg sm:text-xl hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300 shadow-2xl border border-gray-600"
                >
                  REVEAL AGAIN
                </button>
                <button
                  onClick={() => setShowPersonaAnalysis(true)}
                  className="bg-gradient-to-r from-green-500 to-purple-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-lg sm:text-xl hover:from-green-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  READ MORE
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              {!isPublic && isOwner && profile ? (
                <div>
                  <p className="text-gray-400 text-base sm:text-lg mb-4">
                    Ready to unlock your true musical identity?
                  </p>
                  <button
                    onClick={handleAssignPersona}
                    disabled={isAssigningPersona}
                    className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-lg sm:text-xl hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300 shadow-2xl border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAssigningPersona ? 'Analyzing Your Music...' : 'REVEAL PERSONA'}
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-base sm:text-lg">
                  {isPublic ? 'No persona assigned yet' : 'Sync your Spotify data to discover your music persona'}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Top Tracks Section */}
        {memoizedSongs.length > 0 && (
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 border border-gray-700/50">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Top Tracks This Week</h2>
            <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Click any track to preview</p>
            
            {isLoading ? (
              <div className="flex justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-4 border-gray-600 border-t-green-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {memoizedSongs.map((song, index) => {
                  return (
                    <div 
                      key={index} 
                      className="relative group cursor-pointer transition-all duration-300 bg-gray-700/50 hover:bg-gray-700/70 border-gray-600/50 hover:shadow-md rounded-xl p-4 sm:p-6 border"
                      onClick={() => handleTrackClick(song)}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        {/* Album Cover with Play Button Overlay */}
                        <div className="relative flex-shrink-0">
                          <img 
                            src={song.albumImage} 
                            alt={`${song.name} album cover`}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
                          />
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                          
                          {/* Track Number */}
                          <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-gray-800 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        
                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate text-sm sm:text-lg">{song.name}</h3>
                          <p className="text-gray-400 text-xs sm:text-sm truncate">{song.artist}</p>
                          {song.album && (
                            <p className="text-gray-500 text-xs truncate">{song.album}</p>
                          )}
                          
                          {/* Listen Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTrackClick(song);
                            }}
                            className="mt-2 inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-full transition-colors duration-200"
                          >
                            <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            Listen
                          </button>
                        </div>
                      </div>
                      
                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Top Artists Section */}
        {memoizedArtists.length > 0 && (
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 border border-gray-700/50">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Top Artists This Week</h2>
            
            {isLoading ? (
              <div className="flex justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-4 border-gray-600 border-t-green-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {memoizedArtists.map((artist, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-xl p-4 sm:p-6 border border-gray-600/50 hover:shadow-md transition-shadow duration-200 text-center">
                    <div className="relative mb-3 sm:mb-4">
                      <img 
                        src={artist.image} 
                        alt={`${artist.name} profile`}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-md mx-auto"
                      />
                      <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 bg-gray-800 text-white text-xs font-bold rounded-full w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="font-semibold text-white text-sm sm:text-lg mb-1 sm:mb-2 truncate">{artist.name}</h3>
                    {artist.followers && (
                      <p className="text-gray-400 text-xs">
                        {artist.followers.toLocaleString()} followers
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Top Genres Section */}
        {memoizedGenres.length > 0 && (
          <section className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-700/50">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Your Sound</h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {memoizedGenres.map((genre, index) => (
                <span 
                  key={index}
                  className="bg-gradient-to-r from-green-500 to-purple-500 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Dramatic Persona Reveal Modal */}
      {showPersonaReveal && (
        <PersonaReveal
          persona={persona}
          onReveal={handlePersonaReveal}
          isRevealing={isRevealing}
          onClose={handlePersonaRevealClose}
        />
      )}

      {/* Persona Analysis Modal */}
      {showPersonaAnalysis && (
        <PersonaAnalysis
          persona={persona}
          onClose={handlePersonaAnalysisClose}
        />
      )}

      {/* YouTube Player Modal */}
      <YouTubePlayer
        songName={youtubePlayer.currentTrack?.name}
        artistName={youtubePlayer.currentTrack?.artist}
        isVisible={youtubePlayer.isVisible}
        onClose={closeYouTubePlayer}
      />
    </div>
  );
};

export default MusicProfile; 