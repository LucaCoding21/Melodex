# 🚀 Melodex Deployment Guide

## Free Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Deploy both frontend and backend for free!**

## Prerequisites

- Vercel account (free)
- MongoDB Atlas account (free tier available)
- Spotify Developer account

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/melodex?retryWrites=true&w=majority`)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: melodex
# - Directory: ./
```

### Option B: Deploy via GitHub

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure settings (see below)

## Step 3: Configure Environment Variables

In your Vercel dashboard, go to Project Settings > Environment Variables and add:

### Backend Environment Variables:

```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/melodex?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
FRONTEND_URL=https://your-vercel-app-name.vercel.app
NODE_ENV=production
```

### Frontend Environment Variables:

```
VITE_API_URL=https://your-vercel-app-name.vercel.app
```

## Step 4: Update Spotify App Settings

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Edit your app
3. Add your Vercel domain to Redirect URIs:
   - `https://your-vercel-app-name.vercel.app/auth/spotify/callback`

## Step 5: Test Deployment

1. Visit your Vercel URL
2. Test Spotify login
3. Check if profile sync works
4. Verify persona assignment

## Troubleshooting

### 404 Errors

- Check that your `vercel.json` is in the root directory
- Ensure all environment variables are set
- Check Vercel function logs in the dashboard

### CORS Errors

- Make sure `FRONTEND_URL` is set correctly
- Check that the frontend is making requests to the correct backend URL

### MongoDB Connection Issues

- Verify your MongoDB connection string
- Check that your IP is whitelisted in MongoDB Atlas (or use 0.0.0.0/0 for all IPs)

## File Structure for Deployment

```
Melodex/
├── vercel.json (root level)
├── Melodex/ (frontend)
│   ├── package.json
│   ├── src/
│   └── ...
└── melodex-backend/ (backend)
    ├── package.json
    ├── server.js
    └── ...
```

## Environment Variables Reference

| Variable              | Description                  | Required |
| --------------------- | ---------------------------- | -------- |
| MONGODB_URI           | MongoDB connection string    | Yes      |
| JWT_SECRET            | Secret key for JWT tokens    | Yes      |
| SPOTIFY_CLIENT_ID     | Spotify app client ID        | Yes      |
| SPOTIFY_CLIENT_SECRET | Spotify app client secret    | Yes      |
| FRONTEND_URL          | Your Vercel app URL          | Yes      |
| NODE_ENV              | Set to 'production'          | Yes      |
| VITE_API_URL          | Backend API URL for frontend | Yes      |

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
