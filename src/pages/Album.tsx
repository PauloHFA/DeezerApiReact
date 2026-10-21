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
  Skeleton,
} from '@mui/material';
import { getAlbum, getAlbumTracks } from '../services/deezerApi';
import { fetchYoutubeVideoData } from '../services/youtubeApi';
import { usePlayer } from '../hooks/usePlayer';
import { useNotification } from '../hooks/useNotification';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PreviewIcon from '@mui/icons-material/PlayCircleOutline';
import YouTubeIcon from '@mui/icons-material/YouTube';
import AlbumIcon from '@mui/icons-material/Album';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { Button } from '@mui/material';

const Album = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack, playPreview, stopPreview, playYoutube, currentlyPlaying, matchCurrentTrack } = usePlayer();
  const { info, error: notifyError, success } = useNotification();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

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
        setPageError(null);
      } catch (error) {
        console.error('Error fetching album:', error);
        setPageError('Falha ao carregar o álbum. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumData();
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
    success('Reproduzindo no player do app.');
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

          {/* Album Header Skeleton */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, flexWrap: 'wrap' }}>
            <Skeleton variant="rectangular" width={280} height={280} sx={{ borderRadius: '16px' }} />
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Skeleton variant="text" height={48} width="60%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={24} width="40%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} width="50%" sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Skeleton variant="rectangular" height={32} width="120px" />
                <Skeleton variant="rectangular" height={32} width="120px" />
                <Skeleton variant="rectangular" height={32} width="100px" />
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

  if (pageError || !album) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <Typography variant="h5" color="error">
          {pageError || 'Álbum não encontrado'}
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
            {album.rating && <Chip label={`Rating: ${album.rating}%`} />}
          </Box>
          {album.description && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {album.description}
              </Typography>
            </Box>
          )}
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
    </Box>
  );
};

export default Album;
