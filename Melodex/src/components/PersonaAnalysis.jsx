import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const PersonaAnalysis = ({ persona, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getPersonaAnalysis();
      setAnalysis(response.analysis);
      setAudioFeatures(response.audioFeatures);
    } catch (error) {
      console.error('Error loading persona analysis:', error);
      setError('Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAudioFeature = (value, feature) => {
    if (feature === 'tempo') {
      return `${Math.round(value)} BPM`;
    }
    return `${(value * 100).toFixed(0)}%`;
  };

  const getFeatureDescription = (feature, value) => {
    switch (feature) {
      case 'valence':
        if (value > 0.7) return 'Very Positive';
        if (value > 0.5) return 'Positive';
        if (value > 0.3) return 'Neutral';
        return 'Melancholic';
      case 'energy':
        if (value > 0.8) return 'Very High Energy';
        if (value > 0.6) return 'High Energy';
        if (value > 0.4) return 'Medium Energy';
        return 'Low Energy';
      case 'tempo':
        if (value > 140) return 'Very Fast';
        if (value > 120) return 'Fast';
        if (value > 100) return 'Medium';
        return 'Slow';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Analyzing your musical DNA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={onClose}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{persona?.id}</div>
              <div>
                <h2 className="text-3xl font-bold tracking-wide">{persona?.name}</h2>
                <p className="text-gray-300 italic">{persona?.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Audio Features Analysis */}
          {audioFeatures && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-wide">
                YOUR MUSICAL SIGNATURE
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {formatAudioFeature(audioFeatures.valence, 'valence')}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">VALENCE</div>
                  <div className="text-lg font-medium text-gray-800">
                    {getFeatureDescription('valence', audioFeatures.valence)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${audioFeatures.valence * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {formatAudioFeature(audioFeatures.energy, 'energy')}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">ENERGY</div>
                  <div className="text-lg font-medium text-gray-800">
                    {getFeatureDescription('energy', audioFeatures.energy)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${audioFeatures.energy * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {formatAudioFeature(audioFeatures.tempo, 'tempo')}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">TEMPO</div>
                  <div className="text-lg font-medium text-gray-800">
                    {getFeatureDescription('tempo', audioFeatures.tempo)}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((audioFeatures.tempo / 200) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Dominant Genres */}
              {audioFeatures.dominantGenres && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">DOMINANT GENRES</h4>
                  <div className="flex flex-wrap gap-2">
                    {audioFeatures.dominantGenres.map((genre, index) => (
                      <span 
                        key={index}
                        className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Analysis */}
          {(analysis || persona?.analysis) && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 tracking-wide">
                DEEP ANALYSIS
              </h3>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border-l-4 border-purple-500">
                <p className="text-gray-800 leading-relaxed text-lg">
                  {analysis || persona?.analysis}
                </p>
              </div>
            </div>
          )}

          {/* What This Means */}
          <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-blue-900 mb-3">WHAT THIS MEANS</h3>
            <p className="text-blue-800 leading-relaxed">
              Your musical choices reveal patterns in your personality, emotional state, and lifestyle preferences. 
              This analysis is based on your actual listening data - the songs you choose, the energy you seek, 
              and the emotional landscapes you inhabit through music. It's not just about what you listen to, 
              but how you listen and what that says about who you are.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-xl border-t">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">
              Analysis based on your recent listening patterns
            </p>
            <button
              onClick={onClose}
              className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaAnalysis; 