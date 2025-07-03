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
    if (isChecking) return 'text-yellow-600';
    if (isAvailable === true) return 'text-green-600';
    if (isAvailable === false) return 'text-red-600';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    if (isAvailable === true) return '✓ Available';
    if (isAvailable === false) return '✗ Not available';
    return 'Enter a username';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Choose Your Username</h1>
          <p className="text-slate-600">
            This will be your public profile URL: <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">melodex-dusky.vercel.app/{username || 'username'}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  isAvailable === true ? 'border-green-300 bg-green-50' :
                  isAvailable === false ? 'border-red-300 bg-red-50' :
                  'border-slate-300'
                }`}
                placeholder="Enter your username"
                disabled={isSubmitting}
                autoFocus
              />
              <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Only letters, numbers, underscores, and hyphens allowed
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!username || !isAvailable || isSubmitting || isChecking}
            className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              !username || !isAvailable || isSubmitting || isChecking
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
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