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
  Skeleton,
} from '@mui/material';
import { searchArtists, getTopTracks, getTopPlaylists, getTrackPreview } from '../services/deezerApi';
import { fetchYoutubeVideoData } from '../services/youtubeApi';
import { usePlayer } from '../hooks/usePlayer';
import { useNotification } from '../hooks/useNotification';
import { ArtistCard, TrackCard, PlaylistCard } from '../components/CardComponents';
import AddToPlaylistDialog from '@/components/AddToPlaylistDialog';
import { SkeletonGrid, SkeletonTrackList } from '../components/SkeletonLoader';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AlbumIcon from '@mui/icons-material/Album';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import type { Track } from '@/types';

const Home = () => {
  const navigate = useNavigate();
  const { playTrack, playPreview, stopPreview, playYoutube, currentlyPlaying, matchCurrentTrack } = usePlayer();
  const { info, error: notifyError, success } = useNotification();
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topPlaylists, setTopPlaylists] = useState([]);
  const [trackToSave, setTrackToSave] = useState<Track | null>(null);

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
        setPageError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setPageError('Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePreviewTrack = useCallback(
    async (track) => {
      if (currentlyPlaying === track.id) {
        stopPreview();
        return;
      }

      const previewUrl = track.preview || (await getTrackPreview(track.id));
      if (previewUrl) {
        playPreview(track.preview ? track : { ...track, preview: previewUrl });
        return;
      }

      const query = `${track.title} ${track.artist.name}`;
      info('Preview não disponível. Buscando alternativa no YouTube...');
      const videoData = await fetchYoutubeVideoData(query);
      if (videoData) {
        playYoutube(track, videoData.videoId, videoData.thumbnailUrl, videoData.candidateVideoIds);
        success('Vídeo selecionado. Se não iniciar automaticamente, use Reproduzir no player.');
        return;
      }

      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        '_blank'
      );
    },
    [currentlyPlaying, playPreview, stopPreview, playYoutube, info, success]
  );

  const handleOpenYoutube = useCallback(
    async (track) => {
      const query = `${track.title} ${track.artist.name}`;
      info('Buscando vídeo no YouTube...');
      const videoData = await fetchYoutubeVideoData(query);
      if (!videoData) {
        window.open(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
          '_blank'
        );
        notifyError('Não foi possível encontrar o vídeo automaticamente. Abrindo YouTube.');
        return;
      }
      playYoutube(track, videoData.videoId, videoData.thumbnailUrl, videoData.candidateVideoIds);
      success('Vídeo selecionado. Se não iniciar automaticamente, use Reproduzir no player.');
    },
    [info, notifyError, success, playYoutube]
  );

  if (loading) {
    return (
        <Box sx={{ width: '100%', minHeight: '100vh', py: 4, pb: 10 }}>
          {/* Hero Section Skeleton */}
          <Box data-testid="hero-skeleton" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 8 }}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 2, sm: 4, md: 6 },
                width: '100%',
                maxWidth: '1000px',
                background: 'linear-gradient(135deg, #1A1A1A 0%, #000000 100%)',
                borderRadius: '16px',
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                  <Skeleton variant="circular" width={60} height={60} />
                  <Skeleton variant="text" height={40} width="40%" />
                </Box>
                <Skeleton variant="text" height={24} width="80%" sx={{ mb: 3 }} />
                <Skeleton variant="rectangular" height={56} width="200px" />
              </Box>
            </Paper>
          </Box>

          {/* Featured Artists Skeleton */}
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, px: 2 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" height={28} width="30%" />
            </Box>
            <Grid container spacing={3}>
              <SkeletonGrid count={8} />
            </Grid>
          </Box>

          {/* Top Tracks Skeleton */}
          <Box sx={{ mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, px: 2 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" height={28} width="30%" />
            </Box>
            <SkeletonTrackList count={8} />
          </Box>

          {/* Top Playlists Skeleton */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, px: 2 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="text" height={28} width="30%" />
            </Box>
            <Grid container spacing={3}>
              <SkeletonGrid count={8} />
            </Grid>
          </Box>
        </Box>
      );
    }

  if (pageError) {
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
          {pageError}
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
            elevation={4}
          sx={{
              p: { xs: 4, md: 6 },
            width: '100%',
            maxWidth: '1000px',
            background: 'linear-gradient(135deg, #1A1A1A 0%, #000000 100%)',
              borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
              border: '1px solid rgba(255, 0, 0, 0.1)',
            }}
          >
            {/* Decorative elements */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(255,0,0,0.15) 0%, rgba(0,0,0,0) 70%)',
                transform: 'translate(30%, -30%)',
                pointerEvents: 'none',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255,0,0,0.1) 0%, rgba(0,0,0,0) 70%)',
                transform: 'translate(-30%, 30%)',
                pointerEvents: 'none',
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
                <Box sx={{ position: 'relative' }}>
                  <MusicNoteIcon sx={{ color: 'primary.main', fontSize: { xs: 48, md: 72 } }} />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: -8,
                      borderRadius: '50%',
                      background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                      opacity: 0.2,
                      filter: 'blur(20px)',
                      zIndex: -1,
                    }}
                  />
                </Box>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2,
                  }}
                >
                  PH Music
                </Typography>
              </Box>
              <Typography 
                variant="h5" 
                color="text.secondary" 
                sx={{ 
                  mb: 4, 
                  maxWidth: '700px', 
                  mx: 'auto',
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Discover millions of tracks, create your perfect playlist, and enjoy music like never before.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/search')}
                startIcon={<PlayArrowIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                  px: 5,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(255, 0, 0, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 30px rgba(255, 0, 0, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
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
            <Box sx={{ position: 'relative' }}>
              <AlbumIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Box
                sx={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                  opacity: 0.15,
                  filter: 'blur(16px)',
                  zIndex: -1,
                }}
              />
            </Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
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
            <Box sx={{ position: 'relative' }}>
              <MusicNoteIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Box
                sx={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                  opacity: 0.15,
                  filter: 'blur(16px)',
                  zIndex: -1,
                }}
              />
            </Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
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
                  onYoutube={() => handleOpenYoutube(track)}
                  onAddToPlaylist={setTrackToSave}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        <AddToPlaylistDialog
          open={Boolean(trackToSave)}
          track={trackToSave}
          onClose={() => setTrackToSave(null)}
        />

        {/* Top Playlists Section */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, px: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <QueueMusicIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Box
                sx={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                  opacity: 0.15,
                  filter: 'blur(16px)',
                  zIndex: -1,
                }}
              />
            </Box>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
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