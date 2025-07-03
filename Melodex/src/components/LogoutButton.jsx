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
        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors duration-200"
      >
        Logout
      </button>
    </div>
  );
};

export default LogoutButton; 