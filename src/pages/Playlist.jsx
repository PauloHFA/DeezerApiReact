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
} from '@mui/material';
import { getPlaylist, getTrackPreview } from '../services/deezerApi';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PreviewIcon from '@mui/icons-material/PlayCircleOutline';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import stateManager from '../services/StateManager';

const Playlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        setLoading(true);
        const playlistData = await getPlaylist(id);
        setPlaylist(playlistData);
        setError(null);
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setError('Falha ao carregar a playlist. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistData();
  }, [id]);

  const handlePlayTrack = (track) => {
    stateManager.playTrack(track);
  };

  const handlePreviewTrack = async (track) => {
    try {
      if (currentlyPlaying === track.id) {
        setCurrentlyPlaying(null);
        setPreviewUrl(null);
        return;
      }

      const preview = await getTrackPreview(track.id);
      setPreviewUrl(preview);
      setCurrentlyPlaying(track.id);
    } catch (error) {
      console.error('Error playing preview:', error);
    }
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = String(duration % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !playlist) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <Typography variant="h5" color="error">
          {error || 'Playlist não encontrada'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <CardMedia
          component="img"
          image={playlist.picture_xl}
          alt={playlist.title}
          sx={{ width: 280, height: 280, borderRadius: '16px' }}
        />
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <Typography variant="h3" gutterBottom>
            {playlist.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {playlist.creator?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {playlist.nb_tracks} faixas • {formatDuration(playlist.duration)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            <Chip label={`Duração: ${formatDuration(playlist.duration)}`} />
            <Chip label={`Fans: ${playlist.fans || 0}`} />
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Navegue pelas faixas e escute previews direto aqui.
            </Typography>
          </Box>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <IconButton
              color="primary"
              onClick={() => navigate(`/search`)}
            >
              <MusicNoteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{ p: 3, background: 'rgba(255,255,255,0.04)', borderRadius: '16px' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <QueueMusicIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h5">Faixas da playlist</Typography>
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
                    <Tooltip title="Tocar">
                      <IconButton
                        size="small"
                        onClick={() => handlePlayTrack(track)}
                      >
                        <PlayArrowIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              >
                <ListItemIcon>
                  <Typography variant="body2" color="text.secondary">
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

      {previewUrl && (
        <audio
          src={previewUrl}
          autoPlay
          onEnded={() => {
            setCurrentlyPlaying(null);
            setPreviewUrl(null);
          }}
          style={{ display: 'none' }}
        />
      )}
    </Box>
  );
};

export default Playlist;
