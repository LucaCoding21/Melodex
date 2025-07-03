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

  // Banner image options
  const bannerOptions = [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=300&fit=crop',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=300&fit=crop',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=300&fit=crop&sat=-50',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=300&fit=crop&sat=-50',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=300&fit=crop&sat=-50'
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
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl shadow-lg">
          ✅ Saved!
        </div>
      )}

      {/* Mood Naming Section */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Name Your Vibe</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Name your mood..."
            value={moodName}
            onChange={(e) => setMoodName(e.target.value)}
            maxLength={60}
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={handleSaveMood}
            disabled={!moodName.trim() || isLoading}
            className="bg-slate-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Give your weekly mood a personal name
        </p>
      </section>

      {/* Banner Selection Section */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Profile Banner</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {bannerOptions.map((bannerUrl, index) => (
            <div
              key={index}
              className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                selectedBanner === bannerUrl
                  ? 'border-slate-800 shadow-lg scale-105'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
              onClick={() => handleBannerSelect(bannerUrl)}
            >
              <img
                src={bannerUrl}
                alt={`Banner option ${index + 1}`}
                className="w-full h-24 object-cover"
              />
              {selectedBanner === bannerUrl && (
                <div className="absolute inset-0 bg-slate-800 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-white rounded-full p-2">
                    <svg className="w-5 h-5 text-slate-800" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-4">
          Choose a banner image for your profile
        </p>
      </section>

      {/* Tagline Section */}
      <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Your Musical One-Liner</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Your musical one-liner"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            maxLength={60}
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={handleSaveTagline}
            disabled={!tagline.trim() || isLoading}
            className="bg-slate-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Write a short sentence to describe your musical identity
        </p>
      </section>
    </div>
  );
};

export default PersonalizationPanel; 