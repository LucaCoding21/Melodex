import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const PersonalizationPanel = ({ onUpdate }) => {
  const [moodName, setMoodName] = useState('');
  const [tagline, setTagline] = useState('');
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [personalizationData, setPersonalizationData] = useState({
    bannerImageUrl: null,
    tagline: null,
    profileImageUrl: null
  });

  // Curated banner options with music themes
  const bannerOptions = [
    {
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=300&fit=crop',
      name: 'Neon Lights',
      category: 'Urban'
    },
    {
      url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=300&fit=crop',
      name: 'Studio Vibes',
      category: 'Professional'
    },
    {
      url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=300&fit=crop',
      name: 'Concert Energy',
      category: 'Live'
    },
    {
      url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=300&fit=crop&sat=-50',
      name: 'Moody Nights',
      category: 'Atmospheric'
    },
    {
      url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=300&fit=crop&sat=-50',
      name: 'Minimalist',
      category: 'Clean'
    },
    {
      url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=300&fit=crop&sat=-50',
      name: 'Abstract',
      category: 'Artistic'
    }
  ];

  useEffect(() => {
    loadPersonalizationData();
  }, []);

  const loadPersonalizationData = async () => {
    try {
      const data = await apiService.getPersonalization();
      setPersonalizationData(data);
      setTagline(data.tagline || '');
      setSelectedBanner(data.bannerImageUrl);
      
      // Load custom mood name from current profile
      try {
        const profile = await apiService.getCurrentProfile();
        if (profile?.customMood) {
          setMoodName(profile.customMood);
        }
      } catch (error) {
        console.log('No profile found for mood name');
      }
    } catch (error) {
      console.error('Error loading personalization data:', error);
    }
  };

  const handleSaveMood = async () => {
    if (!moodName.trim()) return;
    
    try {
      setIsLoading(true);
      await apiService.updatePersonalization({ customMood: moodName.trim() });
      showSavedMessage();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving mood name:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTagline = async () => {
    if (!tagline.trim()) return;
    
    try {
      setIsLoading(true);
      await apiService.updatePersonalization({ tagline: tagline.trim() });
      setPersonalizationData(prev => ({ ...prev, tagline: tagline.trim() }));
      showSavedMessage();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving tagline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBannerSelect = async (bannerUrl) => {
    try {
      setIsLoading(true);
      await apiService.updatePersonalization({ bannerImage: bannerUrl });
      setSelectedBanner(bannerUrl);
      setPersonalizationData(prev => ({ ...prev, bannerImageUrl: bannerUrl }));
      showSavedMessage();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error saving banner image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showSavedMessage = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSaved && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500/90 backdrop-blur-sm border border-green-400 text-white px-6 py-4 rounded-xl shadow-2xl">
          ✅ Saved successfully!
        </div>
      )}

      {/* Profile Tagline Section */}
      <section className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Profile Tagline</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Describe your musical vibe in one sentence..."
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              maxLength={80}
              disabled={isLoading}
              className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 transition-all duration-200"
            />
            <button
              onClick={handleSaveTagline}
              disabled={!tagline.trim() || isLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
          <p className="text-sm text-gray-400">
            This will appear under your profile name. Keep it short and personal!
          </p>
        </div>
      </section>

      {/* Custom Mood Name Section */}
      <section className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Name Your Vibe</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Give your weekly mood a personal name..."
              value={moodName}
              onChange={(e) => setMoodName(e.target.value)}
              maxLength={40}
              disabled={isLoading}
              className="flex-1 bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 transition-all duration-200"
            />
            <button
              onClick={handleSaveMood}
              disabled={!moodName.trim() || isLoading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
          <p className="text-sm text-gray-400">
            Create a unique name for your current musical mood. This will appear in your vibe section.
          </p>
        </div>
      </section>

      {/* Banner Selection Section */}
      <section className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Profile Banner</h2>
        </div>
        
        <div className="space-y-6">
          <p className="text-gray-300 text-lg">
            Choose a background image that represents your musical style
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {bannerOptions.map((banner, index) => (
              <div
                key={index}
                className={`relative cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${
                  selectedBanner === banner.url
                    ? 'border-green-500 shadow-2xl shadow-green-500/25 scale-105'
                    : 'border-gray-600/50 hover:border-gray-500 hover:scale-105'
                }`}
                onClick={() => handleBannerSelect(banner.url)}
              >
                <img
                  src={banner.url}
                  alt={`${banner.name} banner`}
                  className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Overlay with name and category */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-medium truncate">{banner.name}</p>
                    <p className="text-gray-300 text-xs">{banner.category}</p>
                  </div>
                </div>
                
                {/* Selected indicator */}
                {selectedBanner === banner.url && (
                  <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-sm text-gray-400">
            Hover over each option to see the name and category. Click to select.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PersonalizationPanel; 