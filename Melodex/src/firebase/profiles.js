import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  collection, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Generate week ID (e.g., "2025-W26")
export const generateWeekId = (date = new Date()) => {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
};

// Save user's weekly Spotify profile
export const saveWeeklyProfile = async (uid, spotifyData) => {
  try {
    const weekId = generateWeekId();
    const profileData = {
      weekId,
      topTracks: spotifyData.topTracks || [],
      topGenres: spotifyData.topGenres || [],
      mood: spotifyData.weeklyMood || 'Unknown',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(
      doc(db, 'users', uid, 'profiles', weekId), 
      profileData
    );

    return { weekId, profileData };
  } catch (error) {
    console.error('Error saving weekly profile:', error);
    throw error;
  }
};

// Get user's latest profile
export const getLatestProfile = async (uid) => {
  try {
    const profilesQuery = query(
      collection(db, 'users', uid, 'profiles'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const querySnapshot = await getDocs(profilesQuery);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting latest profile:', error);
    throw error;
  }
};

// Get user's profile by week ID
export const getProfileByWeek = async (uid, weekId) => {
  try {
    const profileDoc = await getDoc(doc(db, 'users', uid, 'profiles', weekId));
    
    if (profileDoc.exists()) {
      return { id: profileDoc.id, ...profileDoc.data() };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile by week:', error);
    throw error;
  }
};

// Get user's profile history
export const getProfileHistory = async (uid, limit = 10) => {
  try {
    const profilesQuery = query(
      collection(db, 'users', uid, 'profiles'),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(profilesQuery);
    const profiles = [];
    
    querySnapshot.forEach((doc) => {
      profiles.push({ id: doc.id, ...doc.data() });
    });
    
    return profiles;
  } catch (error) {
    console.error('Error getting profile history:', error);
    throw error;
  }
};

// Update user's Spotify access token
export const updateSpotifyToken = async (uid, accessToken, refreshToken = null) => {
  try {
    const updateData = {
      spotifyAccessToken: accessToken,
      spotifyTokenUpdatedAt: serverTimestamp()
    };
    
    if (refreshToken) {
      updateData.spotifyRefreshToken = refreshToken;
    }
    
    await setDoc(doc(db, 'users', uid), updateData, { merge: true });
  } catch (error) {
    console.error('Error updating Spotify token:', error);
    throw error;
  }
};

// Get user's Spotify access token
export const getSpotifyToken = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        accessToken: data.spotifyAccessToken,
        refreshToken: data.spotifyRefreshToken
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
};

// Save user's custom mood name for the current week
export const saveUserMoodName = async (uid, moodName) => {
  try {
    const weekId = generateWeekId();
    await setDoc(
      doc(db, 'users', uid, 'profiles', weekId),
      { userMoodName: moodName, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return { weekId, moodName };
  } catch (error) {
    console.error('Error saving user mood name:', error);
    throw error;
  }
};

// Save user's banner image URL
export const saveBannerImage = async (uid, bannerImageUrl) => {
  try {
    await setDoc(
      doc(db, 'users', uid),
      { bannerImageUrl, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return { bannerImageUrl };
  } catch (error) {
    console.error('Error saving banner image:', error);
    throw error;
  }
};

// Save user's tagline
export const saveTagline = async (uid, tagline) => {
  try {
    await setDoc(
      doc(db, 'users', uid),
      { tagline, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return { tagline };
  } catch (error) {
    console.error('Error saving tagline:', error);
    throw error;
  }
};

// Get user's personalization data
export const getUserPersonalization = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        bannerImageUrl: data.bannerImageUrl || null,
        tagline: data.tagline || null,
        profileImageUrl: data.profileImageUrl || null
      };
    }
    return { bannerImageUrl: null, tagline: null, profileImageUrl: null };
  } catch (error) {
    console.error('Error getting user personalization:', error);
    throw error;
  }
};

// Save Spotify profile image URL
export const saveSpotifyProfileImage = async (uid, profileImageUrl) => {
  try {
    await setDoc(
      doc(db, 'users', uid),
      { profileImageUrl, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return { profileImageUrl };
  } catch (error) {
    console.error('Error saving Spotify profile image:', error);
    throw error;
  }
}; 