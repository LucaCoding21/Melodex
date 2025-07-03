# Melodex Backend API

A Node.js/Express backend for the Melodex music profile app, handling Spotify OAuth, user management, and music profile data.

## 🚀 Features

- **Spotify OAuth Integration**: Full Authorization Code Flow with PKCE
- **JWT Authentication**: Secure token-based authentication
- **MongoDB Integration**: User and profile data storage
- **Profile Management**: Weekly music profiles with personalization
- **Public Profiles**: Shareable music profiles by username
- **Now Playing Widget**: Real-time Spotify playback data
- **Token Refresh**: Automatic Spotify token refresh

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Spotify Developer Account
- Environment variables configured

## 🛠️ Setup

### 1. Install Dependencies

```bash
cd melodex-backend
npm install
```

### 2. Environment Variables

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Required variables:

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

### 3. Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `http://localhost:3001/auth/spotify/callback`
4. Copy Client ID and Client Secret to `.env`

### 4. MongoDB Setup

**Local MongoDB:**

```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**MongoDB Atlas:**

1. Create cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Get connection string
3. Update `MONGODB_URI` in `.env`

### 5. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3001`

## 📚 API Endpoints

### Authentication

- `GET /auth/spotify/login` - Initiate Spotify OAuth
- `GET /auth/spotify/callback` - Handle OAuth callback
- `POST /auth/token/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info

### Profiles

- `GET /api/profile/current` - Get current user's profile
- `POST /api/profile/sync` - Sync Spotify data to profile
- `PUT /api/profile/personalization` - Update profile personalization
- `GET /api/profile/now-playing` - Get currently playing track
- `GET /api/profile/history` - Get profile history
- `GET /api/profile/week/:weekId` - Get profile by week

### Users

- `GET /api/user/:username` - Get public profile by username
- `GET /api/user/check-username/:username` - Check username availability
- `POST /api/user/set-username` - Set username for current user
- `GET /api/user/personalization/current` - Get user personalization
- `GET /api/user/search/:query` - Search users

## 🗄️ Database Schema

### User Model

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
  lastLogin: Date,
  isActive: Boolean,
  timestamps: true
}
```

### Profile Model

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

## 🔧 Development

### Project Structure

```
melodex-backend/
├── models/          # MongoDB schemas
├── routes/          # API route handlers
├── middleware/      # Authentication & validation
├── services/        # Business logic (Spotify API)
├── server.js        # Express app entry point
└── package.json
```

### Adding New Routes

1. Create route file in `routes/`
2. Add middleware as needed
3. Import in `server.js`
4. Add to app.use() chain

### Error Handling

All routes use try-catch blocks and return consistent error responses:

```javascript
{
  error: "Error message",
  message: "Detailed error (development only)"
}
```

## 🚀 Deployment

### Render.com

1. Connect GitHub repository
2. Set environment variables
3. Build command: `npm install`
4. Start command: `npm start`

### Railway.app

1. Connect GitHub repository
2. Add MongoDB service
3. Set environment variables
4. Deploy automatically

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/melodex
SPOTIFY_REDIRECT_URI=https://your-backend.com/auth/spotify/callback
FRONTEND_URL=https://your-frontend.com
```

## 🔒 Security

- JWT tokens with expiration
- CORS configured for frontend domain
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- Secure cookie settings
- Environment variable protection

## 🧪 Testing

```bash
# Health check
curl http://localhost:3001/health

# Test Spotify OAuth flow
curl http://localhost:3001/auth/spotify/login
```

## 📝 License

MIT License - see LICENSE file for details
