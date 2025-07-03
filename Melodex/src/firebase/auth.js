import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  collection,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // First time user - create user document
      await setDoc(doc(db, 'users', user.uid), {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        username: null // Will be set later
      });
    }
    
    return { user, isNewUser: !userDoc.exists() };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Check if username is available
export const isUsernameAvailable = async (username) => {
  try {
    const usernameQuery = query(
      collection(db, 'usernames'), 
      where('username', '==', username.toLowerCase())
    );
    const querySnapshot = await getDocs(usernameQuery);
    return querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

// Set username for user
export const setUsername = async (uid, username) => {
  try {
    const lowerUsername = username.toLowerCase();
    
    // Check if username is available
    const isAvailable = await isUsernameAvailable(lowerUsername);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }
    
    // Create username document for lookup
    await setDoc(doc(db, 'usernames', lowerUsername), {
      uid: uid,
      createdAt: serverTimestamp()
    });
    
    // Update user document with username
    await setDoc(doc(db, 'users', uid), {
      username: lowerUsername
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error setting username:', error);
    throw error;
  }
};

// Get user data by UID
export const getUserData = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

// Get UID by username
export const getUidByUsername = async (username) => {
  try {
    const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
    if (usernameDoc.exists()) {
      return usernameDoc.data().uid;
    }
    return null;
  } catch (error) {
    console.error('Error getting UID by username:', error);
    throw error;
  }
};

// Auth state listener
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Export auth instance
export { auth }; 