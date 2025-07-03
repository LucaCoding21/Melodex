import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../services/apiService';
import MusicProfile from '../components/MusicProfile';

const PublicProfile = () => {
  const { username } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('PublicProfile component rendered with username:', username);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching public profile for username:', username);

        // Get public profile data
        const data = await apiService.getPublicProfile(username);
        console.log('Public profile data received:', data);
        setProfileData(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        console.error('Error details:', {
          message: err.message,
          status: err.status,
          username: username
        });
        
        if (err.message.includes('User not found') || err.message.includes('No profile found')) {
          setError('User not found');
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            {error === 'User not found' ? 'Profile Not Found' : 'Something went wrong'}
          </h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {error === 'User not found' 
              ? `The profile "melodex-3zxz.vercel.app/${username}" doesn't exist.`
              : 'Unable to load this music profile.'
            }
          </p>
          <Link 
            to="/"
            className="inline-block bg-slate-800 text-white px-8 py-4 rounded-xl hover:bg-slate-700 transition-colors duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      
      {/* Header with user info and login button */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Profile Image */}
              {profileData.user.profileImage ? (
                <img 
                  src={profileData.user.profileImage} 
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-slate-200 shadow-sm object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-slate-200 shadow-sm bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {profileData.user.displayName || username}
                </h1>
                {profileData.user.tagline && (
                  <p className="text-slate-600 text-sm italic mt-1">
                    "{profileData.user.tagline}"
                  </p>
                )}
                <p className="text-slate-600 text-sm font-mono">
                  melodex-3zxz.vercel.app/{username}
                </p>
              </div>
            </div>
            
            {/* Login/Sign up button */}
            <Link 
              to="/"
              className="bg-slate-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition-colors duration-200 shadow-lg"
            >
              Log in / Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Music Profile */}
      <MusicProfile 
        profile={profileData.profile}
        isLoading={false}
        isPublic={true}
        username={username}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-slate-500 text-sm">
            Powered by Melodex • Week of {profileData.profile.weekId}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicProfile; 