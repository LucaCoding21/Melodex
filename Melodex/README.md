# Melodex - Your Musical Identity

A beautiful music profile app that displays your Spotify listening habits with a music zine aesthetic.

## Features

- 🎵 Display your top 5 Spotify tracks
- 🎨 Show your favorite music genres
- 🌟 Weekly mood analysis
- 🎨 Beautiful music zine design with Tailwind CSS
- 🔐 Secure Spotify authentication
- 📱 Responsive design

## Setup

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - App name: `Melodex`
   - App description: `Music profile app`
   - Redirect URI: `http://localhost:5173` (for development)
5. Save the app

### 2. Set Up Environment Variables

1. In your Spotify app dashboard, copy the `Client ID`
2. Create a `.env` file in the root directory:
   ```bash
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   ```
3. Replace `your_spotify_client_id_here` with your actual Spotify Client ID

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## How It Works

1. **Initial Load**: Displays dummy data with a beautiful music zine design
2. **Login**: Click "Login with Spotify" to authenticate
3. **Data Fetching**: After authentication, fetches your top tracks and genres
4. **Display**: Shows your real Spotify data in the same beautiful design

## Technical Details

- **Authentication**: Uses Authorization Code Flow with PKCE for security
- **API**: Spotify Web API for fetching user data
- **Styling**: Tailwind CSS with custom gradients and animations
- **State Management**: React useState for simple state management
- **No Backend**: Token stored in memory (for demo purposes)

## API Endpoints Used

- `GET /me/top/tracks` - Fetch user's top tracks
- `GET /me/top/artists` - Fetch user's top artists (for genres)

## Security Notes

- This is a demo app with tokens stored in memory
- For production, implement proper token storage and refresh logic
- Consider adding a backend for secure token management

## Customization

You can easily customize:

- Colors and gradients in the Tailwind classes
- Number of tracks/genres displayed
- Mood generation logic
- UI components and layout

## Troubleshooting

- **Authentication Error**: Make sure your Client ID is correct and redirect URI matches
- **No Data**: Ensure your Spotify account has listening history
- **CORS Issues**: The app uses client-side authentication to avoid CORS
- **Environment Variables**: Make sure your `.env` file is in the root directory and contains `VITE_SPOTIFY_CLIENT_ID`

Enjoy exploring your musical identity! 🎵
