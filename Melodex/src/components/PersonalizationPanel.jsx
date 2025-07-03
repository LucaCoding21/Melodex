import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const PersonalizationPanel = ({ onUpdate }) => {
  const [formData, setFormData] = useState({
    bannerImageUrl: '',
    tagline: '',
    profileImageUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadPersonalizationData();
  }, []);

  const loadPersonalizationData = async () => {
    try {
      const data = await apiService.getPersonalization();
      setFormData(data);
    } catch (error) {
      console.error('Error loading personalization data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      await apiService.updatePersonalization(formData);
      setMessage('Profile updated successfully!');
      setMessageType('success');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating personalization:', error);
      setMessage('Failed to update profile. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-700/50">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">
          Customize Your Profile
        </h3>
        <p className="text-sm sm:text-base text-gray-400">
          Make your music profile uniquely yours
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Banner Image URL */}
        <div>
          <label htmlFor="bannerImageUrl" className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
            Banner Image URL
          </label>
          <input
            type="url"
            id="bannerImageUrl"
            name="bannerImageUrl"
            value={formData.bannerImageUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/banner.jpg"
            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Add a custom banner image for your profile
          </p>
        </div>

        {/* Tagline */}
        <div>
          <label htmlFor="tagline" className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
            Personal Tagline
          </label>
          <input
            type="text"
            id="tagline"
            name="tagline"
            value={formData.tagline}
            onChange={handleInputChange}
            placeholder="e.g., 'Music is my therapy'"
            maxLength={100}
            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs sm:text-sm text-gray-500">
              A short phrase that describes your music taste
            </p>
            <span className="text-xs text-gray-500">
              {formData.tagline.length}/100
            </span>
          </div>
        </div>

        {/* Profile Image URL */}
        <div>
          <label htmlFor="profileImageUrl" className="block text-sm sm:text-base font-medium text-gray-300 mb-2">
            Profile Image URL
          </label>
          <input
            type="url"
            id="profileImageUrl"
            name="profileImageUrl"
            value={formData.profileImageUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/profile.jpg"
            className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
          />
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Add a custom profile picture
          </p>
        </div>

        {/* Preview Section */}
        {(formData.bannerImageUrl || formData.tagline || formData.profileImageUrl) && (
          <div className="bg-gray-700/30 rounded-lg p-4 sm:p-6 border border-gray-600/30">
            <h4 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">
              Preview
            </h4>
            <div className="space-y-3 sm:space-y-4">
              {formData.bannerImageUrl && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">Banner:</p>
                  <img 
                    src={formData.bannerImageUrl} 
                    alt="Banner preview" 
                    className="w-full h-20 sm:h-24 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="hidden w-full h-20 sm:h-24 bg-gray-600 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-gray-400">Invalid image URL</span>
                  </div>
                </div>
              )}
              
              {formData.profileImageUrl && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">Profile Image:</p>
                  <div className="flex items-center gap-3">
                    <img 
                      src={formData.profileImageUrl} 
                      alt="Profile preview" 
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden w-12 h-12 sm:w-16 sm:h-16 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-gray-400">Invalid</span>
                    </div>
                    <span className="text-sm sm:text-base text-white">Profile Picture</span>
                  </div>
                </div>
              )}
              
              {formData.tagline && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">Tagline:</p>
                  <p className="text-sm sm:text-base text-gray-300 italic">
                    "{formData.tagline}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`p-3 sm:p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <p className="text-sm sm:text-base text-center">
              {message}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
              <span>Updating...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Changes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PersonalizationPanel; 