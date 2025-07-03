import React, { useState } from 'react';
import apiService from '../services/apiService';

const UsernameSetup = ({ onUsernameSet }) => {
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkUsername = async (value) => {
    if (value.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const result = await apiService.checkUsernameAvailability(value);
      setIsAvailable(result.available);
      if (!result.available) {
        setError(result.error || 'Username is already taken');
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setError('Failed to check username availability');
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    
    // Clear previous results
    setIsAvailable(null);
    setError('');
    
    // Debounce the check
    clearTimeout(window.usernameCheckTimeout);
    window.usernameCheckTimeout = setTimeout(() => {
      checkUsername(value);
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!isAvailable) {
      setError('Please choose a different username');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const user = await apiService.setUsername(username);
      onUsernameSet(user);
    } catch (error) {
      console.error('Error setting username:', error);
      setError(error.message || 'Failed to set username');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-400';
    if (isAvailable === true) return 'text-green-400';
    if (isAvailable === false) return 'text-red-400';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (isAvailable === true) return '✓ Available';
    if (isAvailable === false) return '✗ Not available';
    return 'Enter a username';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <div className="relative z-10 bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 w-full max-w-lg border border-gray-700/50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Choose Your Username
          </h1>
          <p className="text-gray-400">
            This will be your public profile URL: <span className="font-mono text-sm bg-gray-800/50 px-3 py-1 rounded-lg text-green-400 border border-gray-600/50">melodex-3zxz.vercel.app/{username || 'username'}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-3">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                className={`w-full px-4 py-4 bg-gray-800/50 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 ${
                  isAvailable === true ? 'border-green-500/50 bg-green-500/10' :
                  isAvailable === false ? 'border-red-500/50 bg-red-500/10' :
                  'border-gray-600/50'
                }`}
                placeholder="Enter your username"
                disabled={isSubmitting}
                autoFocus
              />
              <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Only letters, numbers, underscores, and hyphens allowed
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl backdrop-blur-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!username || !isAvailable || isSubmitting || isChecking}
            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform ${
              !username || !isAvailable || isSubmitting || isChecking
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white shadow-2xl hover:shadow-green-500/25 hover:scale-105 active:scale-95'
            }`}
          >
            {isSubmitting ? 'Setting Username...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernameSetup; 