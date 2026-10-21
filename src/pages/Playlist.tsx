import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  Chip,
  Paper,
  Skeleton,
  Button,
} from '@mui/material';
import { getPlaylist } from '../services/deezerApi';
import { fetchYoutubeVideoData } from '../services/youtubeApi';
import { usePlayer } from '../hooks/usePlayer';
import { useNotification } from '../hooks/useNotification';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PreviewIcon from '@mui/icons-material/PlayCircleOutline';
import YouTubeIcon from '@mui/icons-material/YouTube';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const Playlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, playPreview, stopPreview, playYoutube, currentlyPlaying, matchCurrentTrack } = usePlayer();
  const { info, error: notifyError, success } = useNotification();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        setLoading(true);
        const playlistData = await getPlaylist(id);
        setPlaylist(playlistData);
        setPageError(null);
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setPageError('Falha ao carregar a playlist. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistData();
  }, [id]);

  const handlePreviewTrack = (track) => {
    if (currentlyPlaying === track.id) {
      stopPreview();
      return;
    }
    playPreview(track);
  };

  const handleOpenYoutube = async (track) => {
    const query = `${track.title} ${track.artist.name}`;
    info('Buscando vídeo no YouTube...');
    const videoData = await fetchYoutubeVideoData(query);
    if (!videoData?.videoId) {
      notifyError('Não foi possível encontrar o vídeo no YouTube.');
      return;
    }
    playYoutube(track, videoData.videoId);
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = String(duration % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (loading) {
    return (
        <Box sx={{ py: 4, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
          <Button
            startIcon={<ArrowBackIosNewIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 3, color: 'primary.main' }}
          >
            Voltar
          </Button>

          {/* Playlist Header Skeleton */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
            <Skeleton variant="rectangular" width={280} height={280} sx={{ borderRadius: '16px' }} />
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Skeleton variant="text" height={48} width="60%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={24} width="40%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} width="50%" sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Skeleton variant="rectangular" height={32} width="120px" />
                <Skeleton variant="rectangular" height={32} width="120px" />
              </Box>
            </Box>
          </Box>

          {/* Tracks Skeleton */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <MusicNoteIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h4" component="h2">Faixas</Typography>
            </Box>
            <Box>
              {Array.from({ length: 10 }).map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={14} width="60%" />
                  </Box>
                  <Skeleton variant="circular" width={32} height={32} />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      );
    }

  if (pageError || !playlist) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <Typography variant="h5" color="error">
          {pageError || 'Playlist não encontrada'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIosNewIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: 'primary.main' }}
      >
        Voltar
      </Button>

        {/* Playlist Header */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            background: 'linear-gradient(135deg, #1A1A1A 0%, #000000 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 4, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <CardMedia
                component="img"
                image={playlist.picture_xl}
                alt={playlist.title}
                sx={{ width: { xs: 200, md: 280 }, height: { xs: 200, md: 280 }, borderRadius: '16px' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: -8,
                  borderRadius: '16px',
                  background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                  opacity: 0.2,
                  filter: 'blur(20px)',
                  zIndex: -1,
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
                {playlist.title}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <MusicNoteIcon fontSize="small" /> {playlist.creator?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {playlist.nb_tracks} faixas • {formatDuration(playlist.duration)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                <Chip label={`Duração: ${formatDuration(playlist.duration)}`} size="small" />
                <Chip label={`Fãs: ${playlist.fans || 0}`} size="small" />
              </Box>
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Navegue pelas faixas e escute previews direto aqui.
                </Typography>
              </Box>
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<MusicNoteIcon />}
                  onClick={() => navigate(`/search`)}
                >
                  Buscar Mais
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Tracks Section */}
        <Paper
          elevation={0}
          sx={{ p: 3, background: 'rgba(255,255,255,0.04)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <QueueMusicIcon sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box
                sx={{
                  position: 'absolute',
                  inset: -6,
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                  opacity: 0.15,
                  filter: 'blur(12px)',
                  zIndex: -1,
                }}
              />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Faixas da playlist</Typography>
          </Box>
          <List>
            {playlist.tracks?.data?.map((track, index) => (
              <Box key={track.id}>
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title="Preview">
                        <IconButton
                          size="small"
                          onClick={() => handlePreviewTrack(track)}
                          sx={{ color: currentlyPlaying === track.id ? 'primary.main' : 'inherit' }}
                        >
                          <PreviewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="YouTube">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenYoutube(track)}
                          color="error"
                        >
                          <YouTubeIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Tocar">
                        <IconButton
                          size="small"
                          onClick={() => playTrack(track)}
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 30, textAlign: 'center' }}>
                      {index + 1}
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={track.title}
                    secondary={`${track.artist.name} • ${formatDuration(track.duration)}`}
                  />
                </ListItem>
                {index < (playlist.tracks?.data?.length || 0) - 1 && <Divider component="li" />}
              </Box>
            ))}
          </List>
        </Paper>
      </Box>
    );
};

export default Playlist;
