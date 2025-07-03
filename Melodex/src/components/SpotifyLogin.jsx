import React, { useState } from 'react';
import apiService from '../services/apiService';

const SpotifyLogin = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSpotifyLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await apiService.loginWithSpotify();
      
      if (response.authUrl) {
        // Redirect to Spotify OAuth
        window.location.href = response.authUrl;
      } else {
        setError('Failed to get Spotify login URL');
      }
    } catch (error) {
      console.error('Spotify login error:', error);
      setError(error.message || 'Failed to connect to Spotify');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-md w-full">
        {/* Logo and Branding */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3 sm:mb-4">
            Melodex
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-2 sm:mb-3">
            Discover Your Musical Identity
          </p>
          
          <p className="text-sm sm:text-base text-gray-500 max-w-sm mx-auto">
            Connect your Spotify account to unlock personalized insights, discover your music persona, and share your unique sound with the world.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-700/50 shadow-2xl">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Welcome to Melodex
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Sign in with your Spotify account to get started
            </p>
          </div>

          {/* Spotify Login Button */}
          <button
            onClick={handleSpotifyLogin}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-green-500/25 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 sm:gap-4 text-base sm:text-lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-white border-t-transparent"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                <span>Continue with Spotify</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm sm:text-base text-center">
                {error}
              </p>
            </div>
          )}

          {/* Features Preview */}
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-700/50">
            <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4 text-center">
              What you'll discover:
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-3 text-sm sm:text-base text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Your unique music persona</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Weekly listening insights</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Personalized music recommendations</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>Shareable music profile</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs sm:text-sm text-gray-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-green-400 hover:text-green-300 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-green-400 hover:text-green-300 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpotifyLogin; 