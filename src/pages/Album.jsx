import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
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
import { getAlbum, getAlbumTracks, getTrackPreview } from '../services/deezerApi';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PreviewIcon from '@mui/icons-material/PlayCircleOutline';
import AlbumIcon from '@mui/icons-material/Album';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import stateManager from '../services/StateManager';

const Album = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        setLoading(true);
        const [albumData, trackData] = await Promise.all([
          getAlbum(id),
          getAlbumTracks(id),
        ]);

        setAlbum(albumData);
        setTracks(trackData.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching album:', error);
        setError('Falha ao carregar o álbum. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
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

  if (error || !album) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <Typography variant="h5" color="error">
          {error || 'Álbum não encontrado'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, width: '100%', maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <CardMedia
          component="img"
          image={album.cover_xl}
          alt={album.title}
          sx={{ width: 280, height: 280, borderRadius: '16px' }}
        />
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <Typography variant="h3" gutterBottom>
            {album.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {album.artist.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {new Date(album.release_date).getFullYear()} • {album.nb_tracks} faixas
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
            <Chip label={`Duração: ${formatDuration(album.duration)}`} />
            <Chip label={`Gênero: ${album.genres?.data?.[0]?.name || 'Desconhecido'}`} />
          </Box>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Clique no artista para ver mais detalhes.
            </Typography>
          </Box>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <IconButton
              color="primary"
              onClick={() => navigate(`/artist/${album.artist.id}`)}
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
          <AlbumIcon sx={{ color: 'primary.main' }} />
          <Typography variant="h5">Faixas</Typography>
        </Box>
        <List>
          {tracks.map((track, index) => (
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
              {index < tracks.length - 1 && <Divider component="li" />}
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

export default Album;
