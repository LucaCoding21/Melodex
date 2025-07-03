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
      setError('Authentication failed. Please try again.');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-800"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {error && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-700 hover:text-red-900 font-medium"
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
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm"
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
          {/* Public profile route */}
          <Route path="/:username" element={<PublicProfile />} />
          
          {/* Main app routes */}
          <Route path="/" element={
            !user ? (
              <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
                  <h1 className="text-3xl font-bold text-slate-800 mb-4">Welcome to Melodex</h1>
                  <p className="text-slate-600 mb-8">
                    Connect your Spotify account to create your music profile
                  </p>
                  <SpotifyLogin onLogin={handleSpotifyLogin} buttonText="Get Started with Spotify" />
                </div>
              </div>
            ) : !user.username ? (
              <UsernameSetup onUsernameSet={handleUsernameSet} />
            ) : !isSpotifyAuthenticated ? (
              <div className="min-h-screen bg-white">
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
              <div className="min-h-screen bg-white">
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
