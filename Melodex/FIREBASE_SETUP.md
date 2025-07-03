# Firebase Setup Guide for Melodex

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name your project (e.g., "melodex-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In Firebase Console, go to "Authentication" → "Sign-in method"
2. Enable "Google" provider
3. Add your authorized domain (localhost for development)

## 3. Enable Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Start in test mode (you can add security rules later)
3. Choose a location close to your users

## 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → "Web"
4. Register your app and copy the config

## 5. Environment Variables

Create a `.env` file in the project root with:

```env
# Spotify API Configuration
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_REDIRECT_URI=http://127.0.0.1:5173/

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

## 6. Firestore Security Rules (Optional)

For production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Username lookups are public read, authenticated write
    match /usernames/{username} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Profiles are public read, authenticated write
    match /users/{userId}/profiles/{profileId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. Deploy to Production

For production deployment, you'll need to:

1. Update the redirect URI in your Spotify app settings
2. Update the authorized domains in Firebase Auth
3. Set up proper Firestore security rules
4. Deploy to Firebase Hosting or your preferred platform

## 8. Custom Domain Setup

To use `music.bio` URLs, you'll need to:

1. Set up a custom domain with your hosting provider
2. Configure URL rewriting to handle `/:username` routes
3. Update your Firebase hosting configuration
