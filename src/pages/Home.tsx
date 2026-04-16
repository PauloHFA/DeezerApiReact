import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  Paper,
  CircularProgress,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import { searchArtists, getTopTracks, getTopPlaylists } from '../services/deezerApi';
import { usePlayer } from '../hooks/usePlayer';
import { ArtistCard, TrackCard, PlaylistCard } from '../components/CardComponents';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AlbumIcon from '@mui/icons-material/Album';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';

const Home = () => {
  const navigate = useNavigate();
  const { playTrack, playPreview, stopPreview, currentlyPlaying } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topPlaylists, setTopPlaylists] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [artistsResponse, tracksResponse, playlistsResponse] = await Promise.all([
          searchArtists('popular'),
          getTopTracks(),
          getTopPlaylists(),
        ]);
        
        setFeaturedArtists(artistsResponse.data.slice(0, 8));
        setTopTracks(tracksResponse.data.slice(0, 8));
        setTopPlaylists(playlistsResponse.data.slice(0, 8));
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePreviewTrack = useCallback(
    (track) => {
      if (currentlyPlaying === track.id) {
        stopPreview();
        return;
      }
      playPreview(track);
    },
    [currentlyPlaying, playPreview, stopPreview]
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
        }}
      >
        <Typography variant="h5" color="error">
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          startIcon={<PlayArrowIcon />}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', py: 4, pb: 10 }}>
      {/* Hero Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            width: '100%',
            maxWidth: '1000px',
            background: 'linear-gradient(135deg, #1A1A1A 0%, #000000 100%)',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(255,0,0,0.2) 0%, rgba(0,0,0,0) 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
              <MusicNoteIcon sx={{ color: 'primary.main', fontSize: 60 }} />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
              >
                PH Music
              </Typography>
            </Box>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 3, maxWidth: '600px' }}>
              Discover millions of tracks, create your perfect playlist, and enjoy music like never before.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/search')}
              startIcon={<PlayArrowIcon />}
              sx={{
                background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                px: 4,
                py: 1.5,
              }}
            >
              Start Exploring
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Featured Artists Section */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, px: 2 }}>
          <AlbumIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" component="h2">
            Featured Artists
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {featuredArtists.map((artist) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={artist.id}>
              <ArtistCard artist={artist} onClick={() => navigate(`/artist/${artist.id}`)} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Top Tracks Section */}
      <Box sx={{ mb: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, px: 2 }}>
          <MusicNoteIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" component="h2">
            Top Tracks
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {topTracks.map((track) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={track.id}>
              <TrackCard 
                track={track}
                isPlaying={currentlyPlaying === track.id}
                onPlay={() => navigate(`/album/${track.album.id}`)}
                onPreview={() => handlePreviewTrack(track)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Top Playlists Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, px: 2 }}>
          <QueueMusicIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" component="h2">
            Featured Playlists
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {topPlaylists.map((playlist) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={playlist.id}>
              <PlaylistCard 
                playlist={playlist}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          mt: 8,
          py: 4,
          textAlign: 'center',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Powered by Deezer API
        </Typography>
      </Box>

    </Box>
  );
};

export default Home; 