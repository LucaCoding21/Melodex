# 🚀 Melodex Deployment Guide

## Free Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Deploy both frontend and backend for free!**

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**

   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard:**

   - Go to your project settings
   - Add these environment variables:
     ```
     SPOTIFY_CLIENT_ID=your_spotify_client_id
     SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
     SPOTIFY_REDIRECT_URI=https://your-domain.vercel.app/auth/spotify/callback
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     YOUTUBE_API_KEY=your_youtube_api_key (optional)
     ```

5. **Get your public URL:** `https://your-project.vercel.app`

---

### Option 2: Netlify + Render (Alternative)

**Frontend on Netlify, Backend on Render**

#### Frontend (Netlify):

1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Set build command: `cd Melodex && npm run build`
4. Set publish directory: `Melodex/dist`

#### Backend (Render):

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set root directory: `melodex-backend`
5. Set build command: `npm install`
6. Set start command: `npm start`

---

### Option 3: Railway (All-in-one)

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables
4. Deploy automatically

---

## Environment Variables Needed

Create a `.env` file in `melodex-backend/` with:

```env
# Spotify OAuth
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
SPOTIFY_REDIRECT_URI=https://your-domain.com/auth/spotify/callback

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/melodex

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com

# YouTube API (optional)
YOUTUBE_API_KEY=your_youtube_api_key_here
```

## Setup Steps

1. **Get Spotify API Keys:**

   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Get Client ID and Client Secret

2. **Get MongoDB Database:**

   - Use [MongoDB Atlas](https://mongodb.com/atlas) (free tier)
   - Create a cluster
   - Get connection string

3. **Get YouTube API Key (optional):**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable YouTube Data API v3
   - Create credentials

## Shareable Links

After deployment, you'll get:

- **Main App:** `https://your-domain.com`
- **Public Profiles:** `https://your-domain.com/@username`
- **GitHub Repository:** `https://github.com/LucaCoding21/Melodex`

## Features Available

✅ **Spotify Integration** - Connect and sync your music data
✅ **Music Persona Analysis** - Get your unique music personality
✅ **YouTube Song Previews** - Listen to song snippets
✅ **Public Profile Sharing** - Share your music profile
✅ **Responsive Design** - Works on all devices
✅ **Real-time Updates** - Live music data syncing

## Support

If you need help with deployment, check:

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
