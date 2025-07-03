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
              <SpotifyLogin onLogin={handleSpotifyLogin} />
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
