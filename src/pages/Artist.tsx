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
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  Button,
  Skeleton,
  Paper,
} from '@mui/material';
import { getArtist, getArtistAlbums, getArtistTopTracks, getAlbumTracks } from '../services/deezerApi';
import { fetchYoutubeVideoData } from '../services/youtubeApi';
import { usePlayer } from '../hooks/usePlayer';
import { useNotification } from '../hooks/useNotification';
import { AlbumCard } from '../components/CardComponents';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import AlbumIcon from '@mui/icons-material/Album';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PreviewIcon from '@mui/icons-material/PlayCircleOutline';
import YouTubeIcon from '@mui/icons-material/YouTube';

const Artist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playPreview, stopPreview, playYoutube, currentlyPlaying, matchCurrentTrack } = usePlayer();
  const { info, error, success } = useNotification();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlbum, setExpandedAlbum] = useState(null);
  const [albumTracks, setAlbumTracks] = useState({});

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const [artistData, albumsData, topTracksData] = await Promise.all([
          getArtist(id),
          getArtistAlbums(id),
          getArtistTopTracks(id),
        ]);
        setArtist(artistData);
        setAlbums(albumsData.data);
        setTopTracks(topTracksData.data);
      } catch (error) {
        console.error('Error fetching artist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [id]);

  const handleAlbumClick = async (albumId) => {
    if (expandedAlbum === albumId) {
      setExpandedAlbum(null);
      return;
    }

    setExpandedAlbum(albumId);

    if (!albumTracks[albumId]) {
      try {
        const tracksData = await getAlbumTracks(albumId);
        setAlbumTracks(prev => ({
          ...prev,
          [albumId]: tracksData.data
        }));
      } catch (error) {
        console.error('Error fetching album tracks:', error);
      }
    }
  };

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
      error('Não foi possível encontrar o vídeo no YouTube.');
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
        <Box sx={{ py: 4 }}>
          <Button
            startIcon={<ArrowBackIosNewIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: 3, color: 'primary.main' }}
          >
            Voltar
          </Button>
        
          {/* Artist Header Skeleton */}
          <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            <Skeleton variant="circular" width={200} height={200} />
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Skeleton variant="text" height={48} width="60%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={24} width="40%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} width="30%" sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={36} width="150px" />
            </Box>
          </Box>

          {/* Top Tracks Skeleton */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <MusicNoteIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h4" component="h2">Top Tracks</Typography>
            </Box>
            <Box>
              {Array.from({ length: 5 }).map((_, idx) => (
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

          {/* Albums Skeleton */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <AlbumIcon sx={{ color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h4" component="h2">Álbuns</Typography>
            </Box>
            <Grid container spacing={3}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      background: 'linear-gradient(to bottom, #1A1A1A, #000000)',
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      height={250}
                      sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Skeleton
                        variant="text"
                        height={24}
                        sx={{ mb: 1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                      />
                      <Skeleton
                        variant="text"
                        height={16}
                        width="70%"
                        sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      );
    }

  if (!artist) {
    return (
      <Typography variant="h5" align="center">
        Artist not found
      </Typography>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIosNewIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: 'primary.main' }}
      >
        Voltar
      </Button>

        {/* Artist Header */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            <Box sx={{ position: 'relative', flexShrink: 0 }}>
              <CardMedia
                component="img"
                sx={{ width: { xs: 150, md: 200 }, height: { xs: 150, md: 200 }, borderRadius: '50%' }}
                image={artist.picture_xl}
                alt={artist.name}
              />
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
            <Box sx={{ flex: 1, minWidth: 280 }}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
                {artist.name}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Typography variant="h6" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MusicNoteIcon fontSize="small" /> {artist.nb_fan.toLocaleString()} fãs
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AlbumIcon fontSize="small" /> Álbuns: {artist.nb_album ?? albums.length}
                </Typography>
              </Box>
              {artist.radio ? (
                <Button
                  variant="contained"
                  size="small"
                  color="primary"
                  onClick={() => window.open(`https://www.deezer.com/artist/${artist.id}/radio`, '_blank')}
                  sx={{ mt: 1 }}
                  startIcon={<MusicNoteIcon />}
                >
                  Ouvir Rádio
                </Button>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Rádio: Indisponível
                </Typography>
              )}
              {artist.genres?.length ? (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Gênero{artist.genres.length > 1 ? 's' : ''}: {artist.genres.map((genre) => genre.name).join(', ')}
                </Typography>
              ) : artist.genre_id ? (
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  Gênero ID: {artist.genre_id}
                </Typography>
              ) : null}
              {(artist.description || artist.biography) && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: '720px', whiteSpace: 'pre-line' }}>
                  {artist.description ?? artist.biography}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Top Tracks Section */}
        {topTracks.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Box sx={{ position: 'relative' }}>
                <MusicNoteIcon sx={{ color: 'primary.main', fontSize: 28 }} />
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
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
                Top Tracks
              </Typography>
            </Box>
            <List>
              {topTracks.map((track, index) => (
                <ListItem
                  key={track.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    },
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <ListItemIcon>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 30, textAlign: 'center' }}>
                      {index + 1}
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={track.title}
                    secondary={formatDuration(track.duration)}
                  />
                  <Tooltip title="Preview">
                    <IconButton
                      size="small"
                      onClick={() => handlePreviewTrack(track)}
                      sx={{
                        color: currentlyPlaying === track.id ? 'primary.main' : 'inherit',
                      }}
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
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Albums Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <AlbumIcon sx={{ color: 'primary.main', fontSize: 28 }} />
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
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
              Álbuns
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {albums.map((album) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={album.id}>
                <AlbumCard album={album} onClick={() => handleAlbumClick(album.id)} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Album Tracks Expansion */}
        {expandedAlbum && albumTracks[expandedAlbum]?.length > 0 && (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 4,
              background: 'linear-gradient(to right, #1A1A1A, #000000)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 0, 0, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Faixas de {albums.find(a => a.id === expandedAlbum)?.title}
              </Typography>
              <IconButton onClick={() => setExpandedAlbum(null)}>
                <PauseIcon />
              </IconButton>
            </Box>
            <List>
              {albumTracks[expandedAlbum]?.map((track, index) => (
                <ListItem
                  key={track.id}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    },
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <ListItemIcon>
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 30, textAlign: 'center' }}>
                      {index + 1}
                    </Typography>
                  </ListItemIcon>
                  <ListItemText
                    primary={track.title}
                    secondary={formatDuration(track.duration)}
                  />
                  <Tooltip title="Preview">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewTrack(track);
                      }}
                      sx={{
                        color: currentlyPlaying === track.id ? 'primary.main' : 'inherit',
                      }}
                    >
                      <PreviewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="YouTube">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenYoutube(track);
                      }}
                      color="error"
                    >
                      <YouTubeIcon />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    );
};

export default Artist; 