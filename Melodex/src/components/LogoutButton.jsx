import React from 'react';
import apiService from '../services/apiService';

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await apiService.logout();
      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Clear token locally even if API call fails
      apiService.clearToken();
      window.location.href = '/';
    }
  };

  return (
    <div className="fixed top-6 left-6 z-50">
      <button
        onClick={handleLogout}
        className="bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700/80 text-gray-300 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 border border-gray-600/50 hover:border-gray-500/50"
      >
        Logout
      </button>
    </div>
  );
};

export default LogoutButton; 