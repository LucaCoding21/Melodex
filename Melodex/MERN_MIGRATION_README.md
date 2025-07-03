# Melodex MERN Stack Migration

This document outlines the complete migration from Firebase to a MERN (MongoDB, Express, React, Node.js) stack for the Melodex music profile app.

## 🚀 Migration Overview

### What Changed

- **Firebase Auth** → **Custom JWT Authentication**
- **Firestore** → **MongoDB with Mongoose**
- **Firebase Hosting** → **Vercel/Netlify (frontend) + Render/Railway (backend)**
- **Direct Spotify OAuth** → **Backend-handled OAuth with PKCE**

### New Architecture

```
Frontend (React + Vite) ←→ Backend (Express + MongoDB) ←→ Spotify API
```

## 📁 Project Structure

```
Melodex/
├── melodex-backend/          # New Express backend
│   ├── models/              # MongoDB schemas
│   ├── routes/              # API endpoints
│   ├── middleware/          # JWT auth, validation
│   ├── services/            # Spotify API integration
│   └── server.js           # Express app entry point
└── Melodex/                # Updated React frontend
    ├── src/
    │   ├── services/
    │   │   └── apiService.js # New API client
    │   ├── components/      # Updated components
    │   └── pages/           # Updated pages
    └── package.json
```

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd melodex-backend
npm install
```

### 2. Environment Variables

Copy `env.example` to `.env`:

```env
# Spotify OAuth
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3001/auth/spotify/callback

# MongoDB
MONGODB_URI=mongodb://localhost:27017/melodex

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Server
PORT=3001
NODE_ENV=development
```

### 3. Start Backend

```bash
npm run dev
```

## 🎨 Frontend Updates

### Key Changes Made

#### 1. New API Service (`src/services/apiService.js`)

- Replaces all Firebase calls
- Handles JWT token management
- Provides clean API interface

#### 2. Updated Components

- **SpotifyLogin**: Now calls backend OAuth endpoint
- **App.jsx**: Complete rewrite for JWT auth flow
- **MusicProfile**: Updated to use profile data structure
- **PersonalizationPanel**: Uses new API endpoints
- **PublicProfile**: Simplified with new API

#### 3. Authentication Flow

```
1. User clicks "Connect Spotify"
2. Frontend calls /auth/spotify/login
3. Backend generates OAuth URL with PKCE
4. User redirected to Spotify
5. Spotify redirects to /auth/spotify/callback
6. Backend exchanges code for tokens
7. Backend creates/updates user in MongoDB
8. Backend redirects to frontend with JWT token
9. Frontend stores token and loads user data
```

## 🔌 API Endpoints

### Authentication

- `GET /auth/spotify/login` - Initiate OAuth flow
- `GET /auth/spotify/callback` - Handle OAuth callback
- `POST /auth/token/refresh` - Refresh access token
- `GET /auth/me` - Get current user

### Profiles

- `GET /api/profile/current` - Get user's profile
- `POST /api/profile/sync` - Sync Spotify data
- `PUT /api/profile/personalization` - Update customization
- `GET /api/profile/now-playing` - Get currently playing

### Users

- `GET /api/user/:username` - Get public profile
- `POST /api/user/set-username` - Set username
- `GET /api/user/check-username/:username` - Check availability

## 🗄️ Database Schema

### User Collection

```javascript
{
  spotifyId: String (unique),
  username: String (unique),
  email: String (unique),
  displayName: String,
  profileImage: String,
  bannerImage: String,
  tagline: String,
  refreshToken: String,
  accessToken: String,
  expiresAt: Date,
  isActive: Boolean,
  timestamps: true
}
```

### Profile Collection

```javascript
{
  userId: ObjectId (ref: User),
  weekId: String (e.g., "2025-W26"),
  topTracks: [{
    name: String,
    artist: String,
    albumImage: String,
    id: String,
    uri: String
  }],
  topGenres: [String],
  mood: String,
  customMood: String,
  tagline: String,
  bannerImage: String,
  isPublic: Boolean,
  timestamps: true
}
```

## 🚀 Deployment

### Backend (Render/Railway)

1. Connect GitHub repository
2. Set environment variables
3. Build command: `npm install`
4. Start command: `npm start`

### Frontend (Vercel/Netlify)

1. Connect GitHub repository
2. Set environment variables:
   ```env
   VITE_API_URL=https://your-backend-url.com
   ```
3. Deploy automatically

## 🔄 Migration Steps

### 1. Backend Setup

```bash
# Create backend directory
mkdir melodex-backend
cd melodex-backend

# Initialize and install dependencies
npm init -y
npm install express mongoose cors dotenv jsonwebtoken bcryptjs axios cookie-parser express-rate-limit

# Copy all backend files
# Set up environment variables
# Start MongoDB (local or Atlas)
npm run dev
```

### 2. Frontend Updates

```bash
# Update package.json (remove Firebase dependencies)
npm uninstall firebase
npm install

# Update all components to use new API service
# Test authentication flow
npm run dev
```

### 3. Testing

1. Start backend on port 3001
2. Start frontend on port 5173
3. Test Spotify OAuth flow
4. Test profile creation and customization
5. Test public profile access

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **PKCE OAuth**: Secure Spotify authentication
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS Protection**: Configured for frontend domain
- **Input Validation**: All user inputs validated
- **Token Refresh**: Automatic Spotify token refresh

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**

   - Check `FRONTEND_URL` in backend `.env`
   - Ensure frontend URL matches exactly

2. **Spotify OAuth Errors**

   - Verify redirect URI in Spotify app settings
   - Check `SPOTIFY_REDIRECT_URI` in backend `.env`

3. **MongoDB Connection**

   - Check `MONGODB_URI` in backend `.env`
   - Ensure MongoDB is running

4. **JWT Token Issues**
   - Check `JWT_SECRET` is set
   - Verify token expiration settings

### Debug Mode

Set `NODE_ENV=development` in backend `.env` for detailed error messages.

## 📈 Performance Improvements

- **Reduced Bundle Size**: Removed Firebase SDK
- **Faster Loading**: Direct API calls vs Firebase listeners
- **Better Caching**: JWT tokens vs Firebase auth state
- **Scalable Architecture**: Separate frontend/backend

## 🔮 Future Enhancements

- **Redis Caching**: For frequently accessed data
- **WebSocket Support**: Real-time now playing updates
- **Image Upload**: Direct to cloud storage
- **Analytics**: User engagement tracking
- **Social Features**: Follow other users

## 📝 License

MIT License - see LICENSE file for details
