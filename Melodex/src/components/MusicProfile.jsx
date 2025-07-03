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
  const sampleData = {
    topTracks: [
      { name: "Blinding Lights", artist: "The Weeknd", album: "After Hours", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop" },
      { name: "Dance Monkey", artist: "Tones and I", album: "The Kids Are Coming", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop" },
      { name: "The Box", artist: "Roddy Ricch", album: "Please Excuse Me for Being Antisocial", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=150&h=150&fit=crop" },
      { name: "Don't Start Now", artist: "Dua Lipa", album: "Future Nostalgia", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop&sat=-50" },
      { name: "Someone You Loved", artist: "Lewis Capaldi", album: "Divinely Uninspired to a Hellish Extent", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop&sat=-50" }
    ],
    topArtists: [
      { name: "The Weeknd", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop", followers: "45.2M" },
      { name: "Dua Lipa", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop", followers: "38.7M" },
      { name: "Post Malone", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=150&h=150&fit=crop", followers: "52.1M" },
      { name: "Billie Eilish", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=150&h=150&fit=crop&sat=-50", followers: "41.3M" },
      { name: "Drake", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=150&h=150&fit=crop&sat=-50", followers: "58.9M" }
    ],
    genres: ["Pop", "Hip-Hop", "R&B", "Electronic", "Rock"],
    mood: "Energetic & Upbeat",
    customMood: "Midnight Vibes"
  };

  const isOwner = !isPublic;

  useEffect(() => {
    loadPersonalizationData();
  }, []);

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
      const personaData = await apiService.assignPersona();
      setPersona(personaData);
      setShowPersonaReveal(true);
    } catch (error) {
      console.error('Error assigning persona:', error);
    } finally {
      setIsAssigningPersona(false);
    }
  };

  const handleRevealPersona = async () => {
    try {
      setIsRevealing(true);
      const personaData = await apiService.revealPersona();
      setPersona(personaData);
      setShowPersonaAnalysis(true);
    } catch (error) {
      console.error('Error revealing persona:', error);
    } finally {
      setIsRevealing(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Profile Header */}
        <header className="text-center mb-16">
          {/* Profile Image */}
          <div className="flex justify-center mb-8">
            {personalizationData.profileImageUrl ? (
              <img 
                src={personalizationData.profileImageUrl} 
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-green-500 shadow-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-green-500 shadow-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <svg className="w-12 h-12 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            {isPublic ? username : 'Melodex'}
          </h1>
          
          {/* Tagline */}
          {personalizationData.tagline && (
            <p className="text-center text-gray-300 mb-6 text-xl font-medium">
              "{personalizationData.tagline}"
            </p>
          )}
          
          <p className="text-xl text-gray-400 mb-8">
            {isPublic ? 'Music Profile' : 'Your Musical Identity'}
          </p>
          
          {/* Sync Spotify Button - Only show for logged-in users without profile */}
          {!isPublic && !profile && (
            <div className="mb-8">
              <button
                onClick={handleSyncSpotify}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-2xl hover:shadow-green-500/25 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
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
                className="bg-gray-800/80 backdrop-blur-sm text-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-700/80 transition-all duration-200 shadow-lg border border-gray-600/50"
              >
                {showPersonalization ? 'Hide Customization' : 'Customize Profile'}
              </button>
            </div>
          )}
          
          {/* Share Profile Section - Only show for logged-in users */}
          {!isPublic && isOwner && profile && (
            <div className="mb-8">
              <button
                onClick={handleCopyProfile}
                className="bg-gray-800/80 backdrop-blur-sm text-gray-300 px-6 py-3 rounded-full font-medium hover:bg-gray-700/80 transition-all duration-200 shadow-lg border border-gray-600/50"
              >
                Share Profile
              </button>
            </div>
          )}
        </header>

        {/* Personalization Panel */}
        {showPersonalization && (
          <div className="mb-16">
            <PersonalizationPanel onUpdate={loadPersonalizationData} />
          </div>
        )}

        {/* Main Content */}
        {profile ? (
          <div className="space-y-12">
            {/* Persona Section */}
            {persona && (
              <section className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
                <h2 className="text-3xl font-bold text-white mb-6">Your Music Persona</h2>
                <div className="bg-gradient-to-r from-green-500/20 to-purple-500/20 rounded-2xl p-6 border border-green-500/30">
                  <h3 className="text-2xl font-bold text-green-400 mb-2">{persona.name}</h3>
                  <p className="text-gray-300 text-lg">{persona.description}</p>
                </div>
                <button
                  onClick={() => setShowPersonaAnalysis(true)}
                  className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200"
                >
                  View Analysis
                </button>
              </section>
            )}

            {/* Top Tracks */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-6">Top Tracks</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleData.topTracks.map((track, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-2xl p-4 hover:bg-gray-700/70 transition-all duration-200 border border-gray-600/30">
                    <div className="flex items-center space-x-4">
                      <img src={track.image} alt={track.album} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{track.name}</p>
                        <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                        <p className="text-gray-500 text-xs truncate">{track.album}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Artists */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-6">Top Artists</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleData.topArtists.map((artist, index) => (
                  <div key={index} className="bg-gray-700/50 rounded-2xl p-4 hover:bg-gray-700/70 transition-all duration-200 border border-gray-600/30">
                    <div className="flex items-center space-x-4">
                      <img src={artist.image} alt={artist.name} className="w-16 h-16 rounded-full object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{artist.name}</p>
                        <p className="text-gray-400 text-sm">{artist.followers} followers</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Genres & Mood */}
            <section className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
              <h2 className="text-3xl font-bold text-white mb-6">Your Vibe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-4">Top Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {sampleData.genres.map((genre, index) => (
                      <span key={index} className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium border border-green-500/30">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-4">Mood</h3>
                  <div className="bg-gradient-to-r from-green-500/20 to-purple-500/20 rounded-xl p-4 border border-green-500/30">
                    <p className="text-white font-medium">{sampleData.mood}</p>
                    {sampleData.customMood && (
                      <p className="text-green-400 text-sm mt-1">"{sampleData.customMood}"</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* Placeholder content when no profile data */
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gray-800/50 rounded-full mx-auto mb-8 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-4">No Music Data Yet</h2>
            <p className="text-gray-400 mb-8">
              Connect your Spotify account to see your personalized music profile
            </p>
          </div>
        )}

        {/* Persona Assignment Button - Only show for logged-in users with profile but no persona */}
        {!isPublic && isOwner && profile && !persona && (
          <div className="text-center mt-12">
            <button
              onClick={handleAssignPersona}
              disabled={isAssigningPersona}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-2xl hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {isAssigningPersona ? 'Analyzing...' : 'Discover Your Music Persona'}
            </button>
          </div>
        )}

        {/* Copy Toast */}
        {showCopyToast && (
          <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50">
            ✅ Profile link copied!
          </div>
        )}

        {/* Persona Reveal Modal */}
        {showPersonaReveal && (
          <PersonaReveal 
            persona={persona}
            onReveal={handleRevealPersona}
            isRevealing={isRevealing}
            onClose={() => setShowPersonaReveal(false)}
          />
        )}

        {/* Persona Analysis Modal */}
        {showPersonaAnalysis && (
          <PersonaAnalysis 
            persona={persona}
            onClose={() => setShowPersonaAnalysis(false)}
          />
        )}

        {/* YouTube Player Modal */}
        {youtubePlayer.isVisible && (
          <YouTubePlayer 
            track={youtubePlayer.currentTrack}
            onClose={() => setYoutubePlayer({ isVisible: false, currentTrack: null })}
          />
        )}
      </div>
    </div>
  );
};

export default MusicProfile; 