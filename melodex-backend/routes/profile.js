const express = require('express');
const User = require('../models/User');
const Profile = require('../models/Profile');
const spotifyService = require('../services/spotifyService');
const youtubeService = require('../services/youtubeService');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();

// Get current user's profile
router.get('/current', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get latest profile
    let profile = await Profile.getLatestProfile(userId);
    
    if (!profile) {
      return res.json({ 
        profile: null, 
        message: 'No profile found. Connect your Spotify account to create one.' 
      });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Get current profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create/update weekly profile with Spotify data
router.post('/sync', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    const weekId = Profile.generateWeekId();
    
    // Get valid access token
    const accessToken = await spotifyService.getValidAccessToken(userId);
    
    // Fetch Spotify data in parallel
    const [topTracks, topGenres, topArtists] = await Promise.all([
      spotifyService.getTopTracks(accessToken, 20, 'short_term'), // Get 20 tracks for enhanced display
      spotifyService.getTopGenres(accessToken, 10, 'short_term'),  // Get more genres for persona analysis
      spotifyService.getTopArtists(accessToken, 10, 'short_term')  // Get top artists
    ]);
    
    // Get detailed track info with preview URLs
    const trackIdsForDetails = topTracks.map(track => track.id);
    const detailedTracks = await spotifyService.getTrackDetails(accessToken, trackIdsForDetails);
    
    // Merge preview URLs into top tracks
    const tracksWithPreviews = topTracks.map(track => {
      const detailedTrack = detailedTracks.find(dt => dt.id === track.id);
      return {
        ...track,
        previewUrl: detailedTrack?.preview_url || null
      };
    });
    
    console.log('Tracks with preview URLs:');
    tracksWithPreviews.forEach(track => {
      console.log(`${track.name}: ${track.previewUrl ? 'YES' : 'NO'}`);
    });
    
    // Skip recommendations for now - they're causing issues
    const recommendations = [];
    
    const mood = spotifyService.generateWeeklyMood();
    
    // Get audio features for persona calculation
    const trackIds = tracksWithPreviews.map(track => track.id);
    let audioFeatures = [];
    let avgValence = 0.5, avgEnergy = 0.5, avgTempo = 120; // Default values
    
    try {
      audioFeatures = await spotifyService.getAudioFeatures(accessToken, trackIds);
      
      if (audioFeatures && audioFeatures.length > 0) {
        // Calculate average audio features
        avgValence = audioFeatures.reduce((sum, feature) => sum + feature.valence, 0) / audioFeatures.length;
        avgEnergy = audioFeatures.reduce((sum, feature) => sum + feature.energy, 0) / audioFeatures.length;
        avgTempo = audioFeatures.reduce((sum, feature) => sum + feature.tempo, 0) / audioFeatures.length;
        console.log('Successfully calculated audio features:', { avgValence, avgEnergy, avgTempo });
      } else {
        console.log('No audio features returned, using defaults');
      }
    } catch (audioError) {
      console.error('Error getting audio features:', audioError.message);
      console.log('Using default audio feature values for persona calculation');
      // Use default values if audio features fail - this won't break the profile sync
    }
    
    // Determine dominant genres (top 3)
    const dominantGenres = topGenres.slice(0, 3);
    
    // Assign persona based on music characteristics
    const persona = assignPersona(avgValence, avgEnergy, avgTempo, dominantGenres);
    console.log('Assigned persona:', persona);
    console.log('Audio features:', { avgValence, avgEnergy, avgTempo, dominantGenres });
    
    // Check if profile for this week already exists
    let profile = await Profile.getProfileByWeek(userId, weekId);
    
    if (profile) {
      // Update existing profile
      profile.topTracks = tracksWithPreviews; // Store all 20 tracks with preview URLs
      profile.topArtists = topArtists; // Store top artists
      profile.recommendations = []; // Skip recommendations for now
      profile.topGenres = topGenres.slice(0, 5); // Keep only top 5 for display
      profile.mood = mood;
      profile.persona = persona;
      profile.audioFeatures = {
        valence: avgValence,
        energy: avgEnergy,
        tempo: avgTempo,
        dominantGenres: dominantGenres
      };
      await profile.save();
    } else {
      // Create new profile
      profile = new Profile({
        userId,
        weekId,
        topTracks: tracksWithPreviews, // Store all 20 tracks with preview URLs
        topArtists: topArtists, // Store top artists
        recommendations: [], // Skip recommendations for now
        topGenres: topGenres.slice(0, 5), // Keep only top 5 for display
        mood,
        persona,
        audioFeatures: {
          valence: avgValence,
          energy: avgEnergy,
          tempo: avgTempo,
          dominantGenres: dominantGenres
        }
      });
      await profile.save();
    }
    
    // Populate user data
    await profile.populate('userId', 'username displayName profileImage bannerImage tagline');
    
    res.json({ 
      profile,
      message: 'Profile synced successfully'
    });
  } catch (error) {
    console.error('Sync profile error:', error);
    if (error.message === 'TOKEN_EXPIRED' || error.message === 'TOKEN_REFRESH_FAILED') {
      res.status(401).json({ error: 'Spotify token expired. Please reconnect your account.' });
    } else if (error.message === 'TOKEN_INSUFFICIENT_SCOPE') {
      res.status(403).json({ error: 'Insufficient Spotify permissions. Please reconnect your account.' });
    } else {
      res.status(500).json({ error: 'Failed to sync profile' });
    }
  }
});

// Update profile personalization
router.put('/personalization', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    const { customMood, tagline, bannerImage } = req.body;
    
    // Get latest profile
    let profile = await Profile.getLatestProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'No profile found. Please sync your Spotify data first.' });
    }
    
    // Update profile personalization
    await profile.updatePersonalization({
      customMood,
      tagline,
      bannerImage
    });
    
    // Also update user's global personalization
    const updateData = {};
    if (tagline !== undefined) updateData.tagline = tagline;
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage;
    
    if (Object.keys(updateData).length > 0) {
      await User.findByIdAndUpdate(userId, updateData);
    }
    
    // Get updated profile
    profile = await Profile.getLatestProfile(userId);
    
    res.json({ 
      profile,
      message: 'Personalization updated successfully'
    });
  } catch (error) {
    console.error('Update personalization error:', error);
    res.status(500).json({ error: 'Failed to update personalization' });
  }
});

// Get currently playing track
router.get('/now-playing', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get valid access token
    const accessToken = await spotifyService.getValidAccessToken(userId);
    
    // Get currently playing track
    const currentlyPlaying = await spotifyService.getCurrentlyPlaying(accessToken);
    
    if (!currentlyPlaying) {
      return res.json({ 
        isPlaying: false,
        message: 'No track currently playing'
      });
    }
    
    const track = currentlyPlaying.item;
    const isPlaying = currentlyPlaying.is_playing;
    
    res.json({
      isPlaying,
      track: {
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        album: track.album?.name || 'Unknown Album',
        albumImage: track.album?.images[0]?.url || null,
        uri: track.uri,
        id: track.id,
        duration: track.duration_ms,
        progress: currentlyPlaying.progress_ms
      }
    });
  } catch (error) {
    console.error('Get now playing error:', error);
    if (error.message === 'TOKEN_EXPIRED') {
      res.status(401).json({ error: 'Spotify token expired. Please reconnect your account.' });
    } else {
      res.status(500).json({ error: 'Failed to get currently playing track' });
    }
  }
});

// Get profile history
router.get('/history', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    
    const profiles = await Profile.getProfileHistory(userId, limit);
    
    res.json({ profiles });
  } catch (error) {
    console.error('Get profile history error:', error);
    res.status(500).json({ error: 'Failed to fetch profile history' });
  }
});

// Get profile by week
router.get('/week/:weekId', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    const { weekId } = req.params;
    
    const profile = await Profile.getProfileByWeek(userId, weekId);
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found for this week' });
    }
    
    res.json({ profile });
  } catch (error) {
    console.error('Get profile by week error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Assign music persona based on user's listening data
router.post('/assign-persona', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's current profile
    const profile = await Profile.findOne({ userId }).sort({ createdAt: -1 });
    if (!profile) {
      return res.status(404).json({ error: 'No profile found. Please sync your Spotify data first.' });
    }

    // Get valid access token
    const accessToken = await spotifyService.getValidAccessToken(userId);
    
    // Get top tracks with IDs for audio features
    const topTracks = await spotifyService.getTopTracks(accessToken, 20, 'short_term');
    const trackIds = topTracks.map(track => track.id);
    
    // Get audio features for these tracks
    const audioFeatures = await spotifyService.getAudioFeatures(accessToken, trackIds);
    
    // Get top genres and artists
    const [topGenres, topArtists] = await Promise.all([
      spotifyService.getTopGenres(accessToken, 10, 'short_term'),
      spotifyService.getTopArtists(accessToken, 10, 'short_term')
    ]);
    
    // Get recommendations based on top tracks
    const recommendations = await spotifyService.getRecommendations(accessToken, topTracks, 10);
    
    // Calculate average audio features
    const avgValence = audioFeatures.reduce((sum, feature) => sum + feature.valence, 0) / audioFeatures.length;
    const avgEnergy = audioFeatures.reduce((sum, feature) => sum + feature.energy, 0) / audioFeatures.length;
    const avgTempo = audioFeatures.reduce((sum, feature) => sum + feature.tempo, 0) / audioFeatures.length;
    
    // Determine dominant genres (top 3)
    const dominantGenres = topGenres.slice(0, 3);
    
    // Assign persona based on music characteristics
    const persona = assignPersona(avgValence, avgEnergy, avgTempo, dominantGenres);
    
    // Update profile with persona, audio features, and enhanced data
    profile.persona = persona;
    profile.topTracks = topTracks;
    profile.topArtists = topArtists;
    profile.recommendations = recommendations;
    profile.audioFeatures = {
      valence: avgValence,
      energy: avgEnergy,
      tempo: avgTempo,
      dominantGenres: dominantGenres
    };
    
    await profile.save();
    
    res.json({ 
      success: true, 
      persona: persona,
      audioFeatures: {
        valence: avgValence,
        energy: avgEnergy,
        tempo: avgTempo,
        dominantGenres: dominantGenres
      }
    });
    
  } catch (error) {
    console.error('Error assigning persona:', error);
    res.status(500).json({ error: 'Failed to assign persona' });
  }
});

// Helper function to assign persona based on music characteristics
function assignPersona(valence, energy, tempo, genres) {
  const personas = [
    { 
      id: "🔥", 
      name: "Chaos Core", 
      genres: ["punk", "metal", "hardcore"], 
      energy: "high", 
      valence: "low", 
      desc: "You thrive in sonic chaos and high energy rebellion.",
      analysis: "Your music DNA reveals a soul that craves intensity and raw emotion. High energy levels (0.7+) combined with low valence (0.3-) create a perfect storm of cathartic release. You're drawn to music that mirrors life's chaos - the kind that makes your heart race and your mind clear. This isn't just about aggression; it's about finding beauty in the storm, order in disorder. Your BPM preferences (140+) reflect an inner restlessness, a need for constant movement and change. The dominant genres in your rotation - punk, metal, hardcore - speak to a deep-seated desire for authenticity and rebellion against the mundane. You're not just listening to music; you're experiencing a form of sonic therapy that helps you process the world's intensity."
    },
    { 
      id: "🎧", 
      name: "Lo-Fi Wanderer", 
      genres: ["lo-fi", "indie", "ambient"], 
      energy: "low", 
      valence: "low", 
      desc: "You drift through mellow beats and introspective vibes.",
      analysis: "Your musical fingerprint reveals a contemplative soul who finds beauty in the spaces between notes. Low energy levels (0.3-) combined with low valence (0.4-) create a perfect environment for introspection and deep thinking. You're drawn to music that serves as a backdrop for your inner world - the kind that doesn't demand attention but provides a safe space for your thoughts to wander. Your BPM preferences (60-90) reflect a measured, deliberate approach to life. The lo-fi, indie, and ambient genres in your rotation speak to a preference for authenticity over polish, for substance over spectacle. You're someone who values the journey over the destination, who finds meaning in the subtle and the understated. Your music choices suggest a rich inner life and a deep appreciation for the art of listening."
    },
    { 
      id: "🎀", 
      name: "Bubble Popper", 
      genres: ["k-pop", "pop", "dance"], 
      energy: "high", 
      valence: "high", 
      desc: "Bright, bouncy, and always on beat.",
      analysis: "Your musical DNA reveals an infectious optimism and a love for life's brighter moments. High energy levels (0.8+) combined with high valence (0.7+) create a perfect recipe for joy and celebration. You're drawn to music that makes you want to move, to smile, to share the moment with others. Your BPM preferences (120-140) reflect an active, dynamic lifestyle and a natural rhythm that keeps you moving forward. The pop, k-pop, and dance genres in your rotation speak to a love for polished production, catchy melodies, and music that brings people together. You're someone who spreads positive energy, who finds joy in the simple pleasures of life, and who believes in the power of music to uplift and unite. Your choices suggest a social butterfly who thrives on connection and shared experiences."
    },
    { 
      id: "🧊", 
      name: "Coolwave Entity", 
      genres: ["synth", "chillwave", "vaporwave"], 
      energy: "medium", 
      valence: "high", 
      desc: "You surf shimmering tones with stylish calm.",
      analysis: "Your musical fingerprint reveals a sophisticated aesthetic sense and a love for the intersection of nostalgia and innovation. Medium energy levels (0.4-0.7) combined with high valence (0.6+) create a perfect balance of engagement and relaxation. You're drawn to music that feels both familiar and futuristic, that transports you to otherworldly places while keeping you grounded. Your BPM preferences (80-110) reflect a measured, deliberate approach to life that values quality over quantity. The synth, chillwave, and vaporwave genres in your rotation speak to an appreciation for atmosphere, texture, and the art of creating mood. You're someone who values style and substance equally, who finds beauty in the details, and who appreciates music as both art and experience. Your choices suggest a creative soul with a keen eye for aesthetics and a love for the experimental."
    },
    { 
      id: "🤠", 
      name: "Yeehaw Bass", 
      genres: ["country", "electro", "folk"], 
      energy: "high", 
      valence: "mid", 
      desc: "Boots on, bass up. You're genreless in the best way.",
      analysis: "Your musical DNA reveals a free spirit who refuses to be boxed in by conventional genre boundaries. High energy levels (0.7+) combined with mid-level valence (0.4-0.6) create a perfect storm of enthusiasm and authenticity. You're drawn to music that tells stories, that connects you to both tradition and innovation. Your BPM preferences (100-130) reflect a natural rhythm that bridges the gap between the organic and the electronic. The country, electro, and folk genres in your rotation speak to a love for storytelling, for music that feels both personal and universal. You're someone who values authenticity over trends, who finds beauty in the unexpected combinations, and who believes that good music transcends labels. Your choices suggest a creative mind that sees connections where others see divisions."
    },
    { 
      id: "👁", 
      name: "Dreamcore Oracle", 
      genres: ["ambient", "bedroom pop", "dream pop"], 
      energy: "low", 
      valence: "high", 
      desc: "You live in soundscapes and lucid states.",
      analysis: "Your musical fingerprint reveals a dreamer with a deep connection to the ethereal and the introspective. Low energy levels (0.3-) combined with high valence (0.6+) create a perfect environment for imagination and emotional exploration. You're drawn to music that feels like a dream, that transports you to other dimensions and allows your mind to wander freely. Your BPM preferences (60-85) reflect a contemplative nature and a preference for the unhurried pace of deep thought. The ambient, bedroom pop, and dream pop genres in your rotation speak to a love for atmosphere, texture, and the art of creating emotional landscapes. You're someone who values the journey inward, who finds meaning in the spaces between reality and fantasy, and who appreciates music as a form of meditation. Your choices suggest a rich inner world and a deep appreciation for the subtle art of emotional storytelling."
    },
    { 
      id: "🐉", 
      name: "Dragonstep", 
      genres: ["dnb", "trap", "dubstep"], 
      energy: "very high", 
      valence: "mid", 
      desc: "Fast, fierce, and full of bite.",
      analysis: "Your musical DNA reveals a powerhouse of energy and intensity who thrives on the cutting edge of sound. Very high energy levels (0.8+) combined with mid-level valence (0.4-0.6) create a perfect storm of power and control. You're drawn to music that pushes boundaries, that challenges your limits and makes your heart race. Your BPM preferences (140+) reflect an active, dynamic lifestyle and a natural drive for constant movement and change. The DnB, trap, and dubstep genres in your rotation speak to a love for innovation, for music that feels both futuristic and primal. You're someone who values intensity and precision, who finds beauty in the controlled chaos of complex rhythms and heavy bass. Your choices suggest a competitive spirit with a love for pushing limits and exploring the extremes of what music can be."
    },
    { 
      id: "☁️", 
      name: "Cloud Drifter", 
      genres: ["acoustic", "soft pop", "indie folk"], 
      energy: "low", 
      valence: "high", 
      desc: "You're light, dreamy, and nostalgic.",
      analysis: "Your musical fingerprint reveals a gentle soul who finds beauty in simplicity and authenticity. Low energy levels (0.3-) combined with high valence (0.6+) create a perfect environment for reflection and emotional connection. You're drawn to music that feels like a warm embrace, that tells stories and creates intimate moments. Your BPM preferences (60-90) reflect a measured, thoughtful approach to life that values quality over quantity. The acoustic, soft pop, and indie folk genres in your rotation speak to a love for storytelling, for music that feels both personal and universal. You're someone who values authenticity and emotional honesty, who finds beauty in the simple and the sincere. Your choices suggest a romantic soul with a deep appreciation for the art of storytelling and the power of human connection."
    },
    { 
      id: "🧃", 
      name: "Juice Funk", 
      genres: ["funk", "neo-soul", "r&b"], 
      energy: "mid", 
      valence: "high", 
      desc: "You're smooth, confident, and full of groove.",
      analysis: "Your musical DNA reveals a soul that moves with natural rhythm and confidence. Medium energy levels (0.4-0.7) combined with high valence (0.6+) create a perfect balance of engagement and positivity. You're drawn to music that makes you feel good, that connects you to your body and your emotions. Your BPM preferences (80-110) reflect a natural groove that's both relaxed and engaging. The funk, neo-soul, and R&B genres in your rotation speak to a love for rhythm, for music that feels both sophisticated and accessible. You're someone who values style and substance, who finds joy in movement and connection, and who appreciates music as both art and entertainment. Your choices suggest a confident individual with a natural sense of rhythm and a love for music that makes you feel alive."
    },
    { 
      id: "⚙️", 
      name: "Industrial Ghost", 
      genres: ["glitch", "noise", "industrial"], 
      energy: "high", 
      valence: "low", 
      desc: "You haunt machines and rave in ruins.",
      analysis: "Your musical fingerprint reveals a soul that finds beauty in the mechanical and the experimental. High energy levels (0.7+) combined with low valence (0.3-) create a perfect environment for exploring the darker, more complex aspects of human experience. You're drawn to music that challenges conventional notions of beauty, that finds harmony in discord and order in chaos. Your BPM preferences (120-150) reflect a restless energy and a drive to explore the boundaries of what music can be. The glitch, noise, and industrial genres in your rotation speak to a love for innovation, for music that feels both futuristic and primal. You're someone who values experimentation and authenticity, who finds beauty in the unexpected and the unconventional. Your choices suggest a creative mind that sees art in the mechanical and poetry in the noise."
    },
    { 
      id: "💀", 
      name: "Sadcore Wraith", 
      genres: ["emo", "shoegaze", "post-punk"], 
      energy: "low", 
      valence: "very low", 
      desc: "You cry to feedback and write poems in distortion.",
      analysis: "Your musical DNA reveals a deeply emotional soul who finds catharsis in the raw and the real. Low energy levels (0.3-) combined with very low valence (0.2-) create a perfect environment for emotional processing and deep introspection. You're drawn to music that validates your feelings, that provides a safe space for the full spectrum of human emotion. Your BPM preferences (60-90) reflect a contemplative nature and a preference for the unhurried pace of emotional exploration. The emo, shoegaze, and post-punk genres in your rotation speak to a love for authenticity, for music that feels both personal and universal. You're someone who values emotional honesty and artistic integrity, who finds beauty in the broken and the beautiful. Your choices suggest a sensitive soul with a deep appreciation for the art of emotional storytelling and the power of music to heal."
    },
    { 
      id: "🐸", 
      name: "Weirdcore Frog", 
      genres: ["hyperpop", "experimental", "glitch"], 
      energy: "chaotic", 
      valence: "high", 
      desc: "You're glitchy, bouncy, and delightfully strange.",
      analysis: "Your musical fingerprint reveals a creative spirit who finds joy in the unexpected and the unconventional. Chaotic energy levels combined with high valence (0.6+) create a perfect storm of creativity and positivity. You're drawn to music that breaks rules, that challenges expectations and makes you question what music can be. Your BPM preferences (varied) reflect a restless creativity and a love for experimentation. The hyperpop, experimental, and glitch genres in your rotation speak to a love for innovation, for music that feels both playful and profound. You're someone who values creativity and individuality, who finds beauty in the strange and the surprising. Your choices suggest a unique perspective and a deep appreciation for the art of pushing boundaries and exploring new possibilities."
    },
    { 
      id: "🎸", 
      name: "Garage Rock Rebel", 
      genres: ["garage rock", "punk rock", "indie rock"], 
      energy: "high", 
      valence: "mid", 
      desc: "Raw, unfiltered, and unapologetically loud.",
      analysis: "Your musical DNA reveals a rebel spirit who values authenticity over polish. High energy levels (0.7+) combined with mid-level valence (0.4-0.6) create a perfect storm of raw emotion and controlled chaos. You're drawn to music that feels immediate and real, that captures the energy of live performance and the spirit of DIY culture. Your BPM preferences (120-150) reflect a restless energy and a need for constant movement. The garage rock, punk rock, and indie rock genres in your rotation speak to a love for music that's made by real people for real people - no corporate polish, no artificial sweeteners. You're someone who values honesty over perfection, who finds beauty in the rough edges and the human imperfections. Your choices suggest a free spirit who refuses to conform to mainstream expectations and who appreciates music that speaks directly to the soul."
    },
    { 
      id: "🌙", 
      name: "Dream Pop Drifter", 
      genres: ["dream pop", "shoegaze", "indie pop"], 
      energy: "low", 
      valence: "high", 
      desc: "You float through ethereal soundscapes and hazy melodies.",
      analysis: "Your musical fingerprint reveals a dreamer with a deep connection to the ethereal and the atmospheric. Low energy levels (0.3-) combined with high valence (0.6+) create a perfect environment for introspection and emotional exploration. You're drawn to music that feels like a dream, that creates entire worlds of sound and emotion. Your BPM preferences (70-100) reflect a contemplative nature and a preference for the unhurried pace of deep feeling. The dream pop, shoegaze, and indie pop genres in your rotation speak to a love for texture, atmosphere, and the art of creating emotional landscapes. You're someone who values beauty and emotion over aggression, who finds meaning in the spaces between notes and the layers of sound. Your choices suggest a romantic soul with a rich inner world and a deep appreciation for music that transports you to other dimensions."
    },
    { 
      id: "🏠", 
      name: "Bedroom Pop Creator", 
      genres: ["bedroom pop", "indie folk", "lo-fi"], 
      energy: "low", 
      valence: "mid", 
      desc: "You craft intimate moments in your own sonic space.",
      analysis: "Your musical DNA reveals a creative soul who finds beauty in the intimate and the personal. Low energy levels (0.3-) combined with mid-level valence (0.4-0.6) create a perfect environment for introspection and creative expression. You're drawn to music that feels like a conversation between friends, that captures the quiet moments and the personal stories. Your BPM preferences (60-90) reflect a measured, thoughtful approach to life and art. The bedroom pop, indie folk, and lo-fi genres in your rotation speak to a love for authenticity, for music that feels both personal and universal. You're someone who values the creative process, who finds beauty in the simple and the sincere, and who appreciates music that feels like it was made just for you. Your choices suggest a thoughtful individual with a deep appreciation for the art of storytelling and the power of intimate musical moments."
    },
    { 
      id: "💿", 
      name: "Archive Addict", 
      genres: ["classical", "jazz", "oldies"], 
      energy: "low", 
      valence: "varied", 
      desc: "You're a collector of forgotten sounds.",
      analysis: "Your musical fingerprint reveals a soul that values history, tradition, and the timeless quality of great music. Low energy levels (0.3-) combined with varied valence create a perfect environment for deep listening and appreciation. You're drawn to music that has stood the test of time, that speaks to universal human experiences across generations. Your BPM preferences (varied) reflect a sophisticated ear and a love for the full spectrum of musical expression. The classical, jazz, and oldies genres in your rotation speak to a love for craftsmanship, for music that rewards repeated listening and deep engagement. You're someone who values quality and tradition, who finds beauty in the masterpieces of the past and the present. Your choices suggest a cultured individual with a deep appreciation for the art of music and its power to transcend time and space."
    },
    { 
      id: "🪩", 
      name: "Club Lurker", 
      genres: ["techno", "house", "edm"], 
      energy: "steady", 
      valence: "high", 
      desc: "You live for BPMs and haze-lit dancefloors.",
      analysis: "Your musical DNA reveals a soul that finds joy in movement, rhythm, and the collective energy of shared experiences. Steady energy levels (0.5-0.8) combined with high valence (0.6+) create a perfect environment for celebration and connection. You're drawn to music that makes you want to move, that connects you to others through shared rhythm and energy. Your BPM preferences (120-140) reflect a natural drive for movement and a love for the steady pulse of life. The techno, house, and EDM genres in your rotation speak to a love for innovation, for music that feels both futuristic and primal. You're someone who values community and connection, who finds beauty in the collective experience of music and movement. Your choices suggest a social soul with a love for celebration and a deep appreciation for the power of music to bring people together."
    },
    { 
      id: "🎭", 
      name: "Genre Jumper", 
      genres: ["mixed"], 
      energy: "varied", 
      valence: "varied", 
      desc: "Your identity is multiplicity. You're all and none.",
      analysis: "Your musical fingerprint reveals a complex soul who refuses to be defined by any single genre or mood. Varied energy levels and valence create a perfect reflection of the multifaceted nature of human experience. You're drawn to music that speaks to different aspects of your personality, that reflects the full spectrum of your emotions and experiences. Your BPM preferences (varied) reflect a dynamic lifestyle and a love for the full range of musical expression. Your diverse genre choices speak to a love for exploration, for music that challenges and surprises you. You're someone who values variety and authenticity, who finds beauty in the unexpected connections between different styles and traditions. Your choices suggest a complex individual with a deep appreciation for the full spectrum of human creativity and expression."
    }
  ];

  // Score each persona based on genre match and audio characteristics
  let bestMatch = personas[0];
  let bestScore = 0;

  for (const persona of personas) {
    let score = 0;
    
    // Genre matching (40% weight)
    const genreMatch = genres.some(genre => 
      persona.genres.some(pGenre => 
        genre.toLowerCase().includes(pGenre.toLowerCase()) || 
        pGenre.toLowerCase().includes(genre.toLowerCase())
      )
    );
    if (genreMatch) score += 40;
    
    // Energy matching (25% weight)
    if (persona.energy === "high" && energy > 0.7) score += 25;
    else if (persona.energy === "medium" && energy >= 0.4 && energy <= 0.7) score += 25;
    else if (persona.energy === "low" && energy < 0.4) score += 25;
    else if (persona.energy === "very high" && energy > 0.8) score += 25;
    else if (persona.energy === "steady" && energy >= 0.5 && energy <= 0.8) score += 25;
    else if (persona.energy === "chaotic" && energy > 0.6) score += 25;
    
    // Valence matching (25% weight)
    if (persona.valence === "high" && valence > 0.6) score += 25;
    else if (persona.valence === "mid" && valence >= 0.4 && valence <= 0.6) score += 25;
    else if (persona.valence === "low" && valence < 0.4) score += 25;
    else if (persona.valence === "very low" && valence < 0.2) score += 25;
    
    // Tempo bonus (10% weight)
    if (persona.name === "Dragonstep" && tempo > 140) score += 10;
    else if (persona.name === "Cloud Drifter" && tempo < 100) score += 10;
    else if (persona.name === "Club Lurker" && tempo >= 120 && tempo <= 140) score += 10;
    else if (persona.name === "Garage Rock Rebel" && tempo >= 120 && tempo <= 150) score += 10;
    else if (persona.name === "Dream Pop Drifter" && tempo >= 70 && tempo <= 100) score += 10;
    else if (persona.name === "Bedroom Pop Creator" && tempo >= 60 && tempo <= 90) score += 10;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = persona;
    }
  }

  // If no good match found, assign Genre Jumper
  if (bestScore < 30) {
    bestMatch = personas.find(p => p.id === "🎭");
  }

  return {
    id: bestMatch.id,
    name: bestMatch.name,
    description: bestMatch.desc,
    analysis: bestMatch.analysis
  };
}



// Get detailed persona analysis
router.get('/persona-analysis', verifyJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's current profile
    const profile = await Profile.findOne({ userId }).sort({ createdAt: -1 });
    if (!profile || !profile.persona) {
      return res.status(404).json({ error: 'No persona found. Please assign a persona first.' });
    }

    // Get audio features for detailed analysis
    const audioFeatures = profile.audioFeatures || {};
    
    res.json({ 
      persona: profile.persona,
      audioFeatures: audioFeatures,
      analysis: profile.persona.analysis || "Analysis not available"
    });
    
  } catch (error) {
    console.error('Error getting persona analysis:', error);
    res.status(500).json({ error: 'Failed to get persona analysis' });
  }
});

// Get YouTube URL for song playback (authenticated users)
router.get('/youtube-url', verifyJWT, async (req, res) => {
  try {
    const { songName, artistName } = req.query;
    
    if (!songName || !artistName) {
      return res.status(400).json({ error: 'Song name and artist name are required' });
    }

    const youtubeUrl = await youtubeService.searchSong(songName, artistName);
    
    if (youtubeUrl) {
      res.json({ 
        success: true, 
        youtubeUrl,
        songName,
        artistName
      });
    } else {
      res.status(404).json({ 
        error: 'No YouTube video found for this song',
        fallbackUrl: youtubeService.generateFallbackUrl(songName, artistName)
      });
    }
    
  } catch (error) {
    console.error('Error getting YouTube URL:', error);
    res.status(500).json({ error: 'Failed to get YouTube URL' });
  }
});

// Get YouTube URL for song playback (public - no authentication required)
router.get('/public/youtube-url', async (req, res) => {
  try {
    const { songName, artistName } = req.query;
    
    if (!songName || !artistName) {
      return res.status(400).json({ error: 'Song name and artist name are required' });
    }

    const youtubeUrl = await youtubeService.searchSong(songName, artistName);
    
    if (youtubeUrl) {
      res.json({ 
        success: true, 
        youtubeUrl,
        songName,
        artistName
      });
    } else {
      res.status(404).json({ 
        error: 'No YouTube video found for this song',
        fallbackUrl: youtubeService.generateFallbackUrl(songName, artistName)
      });
    }
    
  } catch (error) {
    console.error('Error getting YouTube URL:', error);
    res.status(500).json({ error: 'Failed to get YouTube URL' });
  }
});

module.exports = router; 