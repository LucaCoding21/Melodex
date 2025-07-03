import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UsernameSetup from './components/UsernameSetup';
import MusicProfile from './components/MusicProfile';
import SpotifyLogin from './components/SpotifyLogin';
import LogoutButton from './components/LogoutButton';
import NowPlayingWidget from './components/NowPlayingWidget';
import PublicProfile from './pages/PublicProfile';
import apiService from './services/apiService';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Check for authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check for auth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('userId');
    const authError = urlParams.get('error');
    
    if (token && userId) {
      handleAuthCallback(token, userId);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authError) {
      let errorMessage = 'Authentication failed. Please try again.';
      
      // Handle specific error types
      switch (authError) {
        case 'missing_params':
          errorMessage = 'Authentication parameters are missing. Please try again.';
          break;
        case 'invalid_state':
          errorMessage = 'Authentication session expired. Please try logging in again.';
          break;
        case 'expired_state':
          errorMessage = 'Authentication session timed out. Please try logging in again.';
          break;
        case 'auth_failed':
          errorMessage = 'Authentication failed. Please check your Spotify connection and try again.';
          break;
        default:
          errorMessage = 'Authentication failed. Please try again.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (!apiService.isAuthenticated()) {
        setIsLoading(false);
        return;
      }

      const userData = await apiService.getCurrentUser();
      setUser(userData);
      
      // Check if user has a profile
      try {
        const profileData = await apiService.getCurrentProfile();
        if (profileData) {
          setProfile(profileData);
          setIsSpotifyAuthenticated(true);
        }
      } catch (profileError) {
        // No profile found, user needs to connect Spotify
        console.log('No profile found, user needs to connect Spotify');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      apiService.handleAuthError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthCallback = async (token, userId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Set token in API service
      apiService.setToken(token);
      
      // Get user data
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      
      // Check if user has a profile
      try {
        const profileData = await apiService.getCurrentProfile();
        if (profileData) {
          setProfile(profileData);
          setIsSpotifyAuthenticated(true);
        }
      } catch (profileError) {
        // No profile found, user needs to sync Spotify data
        console.log('No profile found, user needs to sync Spotify data');
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      setError('Failed to complete authentication. Please try again.');
      apiService.handleAuthError();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameSet = (userData) => {
    setUser(userData);
  };

  const handleSpotifyLogin = () => {
    setError(null);
  };

  const handleSpotifySync = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const profileData = await apiService.syncProfile();
      setProfile(profileData);
      setIsSpotifyAuthenticated(true);
    } catch (error) {
      console.error('Spotify sync error:', error);
      if (error.message.includes('token expired')) {
        setError('Your Spotify connection has expired. Please reconnect your Spotify account.');
        setIsSpotifyAuthenticated(false);
      } else {
        setError('Failed to sync your music data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteReset = async () => {
    setError(null);
    setIsSpotifyAuthenticated(false);
    setProfile(null);
    setUser(null);
    apiService.clearToken();
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg font-medium">Loading your music world...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
        {error && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 backdrop-blur-sm border border-red-700 text-red-100 px-6 py-4 rounded-xl shadow-2xl">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-300 hover:text-white font-medium transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Reset Button for debugging */}
        {user && (
          <div className="fixed top-6 left-6 z-50">
            <button 
              onClick={handleCompleteReset}
              className="bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 text-gray-300 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 border border-gray-600/50"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Now Playing Widget - Only show for authenticated users */}
        {user && isSpotifyAuthenticated && (
          <NowPlayingWidget isVisible={true} />
        )}

        <Routes>
          {/* Main app routes */}
          <Route path="/" element={
            !user ? (
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>
                
                <div className="relative z-10 bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-lg text-center border border-gray-700/50">
                  {/* Logo/Brand */}
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                      Melodex
                    </h1>
                    <p className="text-gray-400 text-lg font-medium">
                      Your Musical Identity
                    </p>
                  </div>
                  
                  <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                    Discover your unique music personality and share your vibe with the world
                  </p>
                  
                  <div className="space-y-4">
                    <SpotifyLogin onLogin={handleSpotifyLogin} buttonText="Continue with Spotify" />
                    <p className="text-gray-500 text-sm">
                      Connect your Spotify account to get started
                    </p>
                  </div>
                </div>
              </div>
            ) : !user.username ? (
              <UsernameSetup onUsernameSet={handleUsernameSet} />
            ) : !isSpotifyAuthenticated ? (
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <LogoutButton />
                <div className="fixed top-6 right-6 z-50">
                  <SpotifyLogin onLogin={handleSpotifyLogin} buttonText={error ? "Reconnect Spotify" : "Connect Spotify"} />
                </div>
                <MusicProfile 
                  profile={null}
                  isLoading={isLoading}
                  username={user.username}
                  onSyncSpotify={handleSpotifySync}
                />
              </div>
            ) : (
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <LogoutButton />
                <MusicProfile 
                  profile={profile}
                  isLoading={isLoading}
                  username={user.username}
                  onSyncSpotify={handleSpotifySync}
                />
              </div>
            )
          } />
          
          {/* Test route for debugging */}
          <Route path="/test" element={<div>Test route works!</div>} />
          
          {/* Public profile route - must be last to avoid catching other routes */}
          <Route path="/:username" element={<PublicProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
