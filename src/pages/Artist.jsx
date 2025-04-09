import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@mui/material';
import { getArtist, getArtistAlbums, getAlbumTracks, getTrackPreview } from '../services/deezerApi';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AlbumIcon from '@mui/icons-material/Album';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PreviewIcon from '@mui/icons-material/PlayCircleOutline';
import stateManager from '../services/StateManager';

const Artist = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlbum, setExpandedAlbum] = useState(null);
  const [albumTracks, setAlbumTracks] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const [artistData, albumsData] = await Promise.all([
          getArtist(id),
          getArtistAlbums(id),
        ]);
        setArtist(artistData);
        setAlbums(albumsData.data);
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
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
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
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        <CardMedia
          component="img"
          sx={{ width: 200, height: 200, borderRadius: '50%' }}
          image={artist.picture_xl}
          alt={artist.name}
        />
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            {artist.name}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {artist.nb_fan.toLocaleString()} fans
          </Typography>
        </Box>
      </Box>

      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Albums
      </Typography>
      <Grid container spacing={3}>
        {albums.map((album) => (
          <Grid item xs={12} key={album.id}>
            <Card
              sx={{
                background: 'linear-gradient(to right, #1A1A1A, #000000)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.01)',
                },
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleAlbumClick(album.id)}
                >
                  <CardMedia
                    component="img"
                    sx={{ width: 100, height: 100, borderRadius: '8px' }}
                    image={album.cover_medium}
                    alt={album.title}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="div">
                      {album.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(album.release_date).getFullYear()} • {albumTracks[album.id]?.length || '...'} tracks
                    </Typography>
                  </Box>
                  <IconButton>
                    {expandedAlbum === album.id ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </Box>

                <Collapse in={expandedAlbum === album.id}>
                  <Divider sx={{ my: 2 }} />
                  <List>
                    {albumTracks[album.id]?.map((track, index) => (
                      <ListItem
                        key={track.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Typography variant="body2" color="text.secondary">
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
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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

export default Artist; 