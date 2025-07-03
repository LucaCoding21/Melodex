import React, { useState, useEffect } from 'react';
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

  // Sample data for demonstration when no real data is available
  const dummySongs = [
    { name: "Bohemian Rhapsody", artist: "Queen", albumImage: "https://via.placeholder.com/150/1DB954/FFFFFF?text=Queen", album: "A Night at the Opera" },
    { name: "Hotel California", artist: "Eagles", albumImage: "https://via.placeholder.com/150/1DB954/FFFFFF?text=Eagles", album: "Hotel California" },
    { name: "Stairway to Heaven", artist: "Led Zeppelin", albumImage: "https://via.placeholder.com/150/1DB954/FFFFFF?text=Led+Zeppelin", album: "Led Zeppelin IV" },
    { name: "Imagine", artist: "John Lennon", albumImage: "https://via.placeholder.com/150/1DB954/FFFFFF?text=John+Lennon", album: "Imagine" },
    { name: "Like a Rolling Stone", artist: "Bob Dylan", albumImage: "https://via.placeholder.com/150/1DB954/FFFFFF?text=Bob+Dylan", album: "Highway 61 Revisited" }
  ];

  const dummyArtists = [
    { name: "Queen", image: "https://via.placeholder.com/150/1DB954/FFFFFF?text=Queen", followers: 45000000 },
    { name: "Eagles", image: "https://via.placeholder.com/150/1DB954/FFFFFF?text=Eagles", followers: 38000000 },
    { name: "Led Zeppelin", image: "https://via.placeholder.com/150/1DB954/FFFFFF?text=Led+Zeppelin", followers: 42000000 },
    { name: "The Beatles", image: "https://via.placeholder.com/150/1DB954/FFFFFF?text=Beatles", followers: 50000000 },
    { name: "Pink Floyd", image: "https://via.placeholder.com/150/1DB954/FFFFFF?text=Pink+Floyd", followers: 35000000 }
  ];

  const dummyGenres = ["Rock", "Folk", "Classic Rock", "Alternative", "Indie"];
  const dummyMood = "Melancholy";

  // Use real data if available, otherwise fall back to dummy data
  const songs = profile?.topTracks || dummySongs;
  const artists = profile?.topArtists || dummyArtists;
  const genres = profile?.topGenres || dummyGenres;
  const mood = profile?.customMood || profile?.mood || dummyMood;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Banner Image */}
      {personalizationData.bannerImageUrl && (
        <div className="w-full h-40 overflow-hidden">
          <img 
            src={personalizationData.bannerImageUrl} 
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Profile Header */}
        <header className="text-center mb-16">
          {/* Profile Image */}
          <div className="flex justify-center mb-6">
            {personalizationData.profileImageUrl ? (
              <img 
                src={personalizationData.profileImageUrl} 
                alt="Profile"
                className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
            {isPublic ? username : 'Melodex'}
          </h1>
          
          {/* Tagline */}
          {personalizationData.tagline && (
            <p className="text-center italic text-gray-600 mb-4 text-lg">
              "{personalizationData.tagline}"
            </p>
          )}
          
          <p className="text-xl text-slate-600 mb-8">
            {isPublic ? 'Music Profile' : 'Your Musical Identity'}
          </p>
          
          {/* Sync Spotify Button - Only show for logged-in users without profile */}
          {!isPublic && !profile && (
            <div className="mb-8">
              <button
                onClick={handleSyncSpotify}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-medium transition-colors duration-200 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Syncing...' : 'Sync Spotify Data'}
              </button>
            </div>
          )}
          
          {/* Personalization Toggle Button - Only show for logged-in users */}
          {!isPublic && isOwner && profile && (
            <div className="mb-8">
              <button
                onClick={() => setShowPersonalization(!showPersonalization)}
                className="bg-slate-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors duration-200 shadow-lg"
              >
                {showPersonalization ? 'Hide Personalization' : 'Customize Profile'}
              </button>
            </div>
          )}
          
          {/* Share Profile Section - Only show for logged-in users */}
          {!isPublic && username && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 max-w-md mx-auto">
              <p className="text-sm text-slate-500 mb-3 font-medium">Share your profile:</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={`https://melodex-3zxz.vercel.app/${username}`}
                  readOnly
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono text-slate-700"
                />
                <button
                  onClick={handleCopyProfile}
                  className="bg-slate-800 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors duration-200"
                >
                  Copy
                </button>
              </div>
              
              {/* Debug Section - Only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 font-medium mb-2">Debug Info:</p>
                  <p className="text-xs text-yellow-700">Username: {username}</p>
                  <p className="text-xs text-yellow-700">Has Profile: {profile ? 'Yes' : 'No'}</p>
                  <a 
                    href={`https://melodex-3zxz.vercel.app/${username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Test Public Profile →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Copy Success Toast */}
          {showCopyToast && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl shadow-lg">
              Profile link copied to clipboard! 🎵
            </div>
          )}
        </header>

        {/* Personalization Panel */}
        {showPersonalization && isOwner && (
          <div className="mb-8">
            <PersonalizationPanel 
              onUpdate={handlePersonalizationUpdate}
            />
          </div>
        )}

        {/* Weekly Mood Section */}
        <section className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">This Week's Vibe</h2>
          <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-xl shadow-lg">
            {mood}
          </div>
        </section>

        {/* Music Persona Section */}
        <section className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Your Music Persona</h2>
            <div className="flex gap-2">
              {!isPublic && isOwner && profile && !persona && (
                <button
                  onClick={handleAssignPersona}
                  disabled={isAssigningPersona}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAssigningPersona ? 'Analyzing...' : 'Discover My Persona'}
                </button>
              )}
            </div>
          </div>
          
          {persona ? (
                          <div className="text-center bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-xl border border-slate-200">
                <div className="text-6xl mb-4">{persona.id}</div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">{persona.name}</h3>
                <p className="text-slate-600 italic text-lg max-w-2xl mx-auto mb-6">{persona.description}</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => {
                      setShowPersonaReveal(true);
                      setIsRevealing(true); // Start the dramatic sequence
                    }}
                    className="bg-gradient-to-r from-slate-800 to-gray-900 text-white px-8 py-4 rounded-lg font-bold text-xl hover:from-slate-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-300 shadow-2xl border border-gray-600"
                  >
                    REVEAL AGAIN
                  </button>
                  <button
                    onClick={() => setShowPersonaAnalysis(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                  >
                    READ MORE
                  </button>
                </div>
              </div>
          ) : (
            <div className="text-center py-12">
              {!isPublic && isOwner && profile ? (
                <div>
                  <p className="text-slate-500 text-lg mb-4">
                    Ready to unlock your true musical identity?
                  </p>
                  <button
                    onClick={handleAssignPersona}
                    disabled={isAssigningPersona}
                    className="bg-gradient-to-r from-slate-800 to-gray-900 text-white px-8 py-4 rounded-lg font-bold text-xl hover:from-slate-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-300 shadow-2xl border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAssigningPersona ? 'Analyzing Your Music...' : 'REVEAL PERSONA'}
                  </button>
                </div>
              ) : (
                <p className="text-slate-500 text-lg">
                  {isPublic ? 'No persona assigned yet' : 'Sync your Spotify data to discover your music persona'}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Top Tracks Section */}
        <section className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Top Tracks This Week</h2>
          <p className="text-slate-600 mb-6">Click any track to preview</p>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-800"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {songs.map((song, index) => {
                return (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer transition-all duration-300 bg-slate-50 hover:bg-slate-100 border-slate-200 hover:shadow-md rounded-xl p-6 border"
                    onClick={() => handleTrackClick(song)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Album Cover with Play Button Overlay */}
                      <div className="relative">
                        <img 
                          src={song.albumImage} 
                          alt={`${song.name} album cover`}
                          className="w-20 h-20 rounded-lg object-cover shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        
                        {/* Track Number */}
                        <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      
                      {/* Track Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 truncate text-lg">{song.name}</h3>
                        <p className="text-slate-600 text-sm truncate">{song.artist}</p>
                        {song.album && (
                          <p className="text-slate-500 text-xs truncate">{song.album}</p>
                        )}
                        
                        {/* Listen Button */}
                        <button
                          onClick={() => handleTrackClick(song)}
                          className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-full transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Top Artists Section */}
        <section className="bg-white rounded-2xl p-8 mb-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Top Artists This Week</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-800"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {artists.map((artist, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow duration-200 text-center">
                  <div className="relative mb-4">
                    <img 
                      src={artist.image} 
                      alt={`${artist.name} profile`}
                      className="w-20 h-20 rounded-full object-cover shadow-md mx-auto"
                    />
                    <div className="absolute -top-2 -right-2 bg-slate-800 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg mb-2">{artist.name}</h3>
                  {artist.followers && (
                    <p className="text-slate-500 text-xs">
                      {artist.followers.toLocaleString()} followers
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top Genres Section */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Your Sound</h2>
          <div className="flex flex-wrap gap-3">
            {genres.map((genre, index) => (
              <span 
                key={index}
                className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </section>
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