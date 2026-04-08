import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  CircularProgress,
  Paper,
  InputAdornment,
  Container,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { searchArtists, searchTracks, searchAlbums, searchPlaylists } from '../services/deezerApi';
import { usePlayer } from '../hooks/usePlayer';
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import AlbumIcon from '@mui/icons-material/Album';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const [artistsResponse, tracksResponse, albumsResponse, playlistsResponse] = await Promise.all([
        searchArtists(searchQuery),
        searchTracks(searchQuery),
        searchAlbums(searchQuery),
        searchPlaylists(searchQuery),
      ]);
      
      setArtists(artistsResponse.data);
      setTracks(tracksResponse.data);
      setAlbums(albumsResponse.data);
      setPlaylists(playlistsResponse.data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, pb: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 6,
            width: '100%',
            maxWidth: '800px',
            background: 'linear-gradient(to right, #1A1A1A, #000000)',
            borderRadius: '12px',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Typography variant="h4" component="h1" sx={{ color: 'primary.main', fontWeight: 700 }}>
              Search Music
            </Typography>
            <Box sx={{ width: '100%', display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                label="Search for artists or tracks"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.light',
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{
                  height: '56px',
                  px: 4,
                  background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #CC0000 30%, #FF0000 90%)',
                  },
                }}
              >
                Search
              </Button>
            </Box>
          </Box>
        </Paper>

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : (
          <Box sx={{ width: '100%', maxWidth: '1200px' }}>
            {artists.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                  <PersonIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" component="h2">
                    Artists
                  </Typography>
                </Box>
                <Grid container spacing={3} justifyContent="center">
                  {artists.map((artist) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={artist.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          background: 'linear-gradient(to bottom, #1A1A1A, #000000)',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/artist/${artist.id}`)}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={artist.picture_medium}
                          alt={artist.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="div" align="center">
                            {artist.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" align="center">
                            {artist.nb_fan.toLocaleString()} fans
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {albums.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                  <AlbumIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" component="h2">
                    Albums
                  </Typography>
                </Box>
                <Grid container spacing={3} justifyContent="center">
                  {albums.map((album) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={album.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          background: 'linear-gradient(to bottom, #1A1A1A, #000000)',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/album/${album.id}`)}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={album.cover_medium}
                          alt={album.title}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="div" noWrap>
                            {album.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {album.artist.name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {playlists.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                  <QueueMusicIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" component="h2">
                    Playlists
                  </Typography>
                </Box>
                <Grid container spacing={3} justifyContent="center">
                  {playlists.map((playlist) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={playlist.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          background: 'linear-gradient(to bottom, #1A1A1A, #000000)',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/playlist/${playlist.id}`)}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={playlist.picture_medium}
                          alt={playlist.title}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="div" noWrap>
                            {playlist.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {playlist.nb_tracks} tracks
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {tracks.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                  <MusicNoteIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" component="h2">
                    Tracks
                  </Typography>
                </Box>
                <Grid container spacing={3} justifyContent="center">
                  {tracks.map((track) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={track.id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          background: 'linear-gradient(to bottom, #1A1A1A, #000000)',
                          cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/album/${track.album.id}`)}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={track.album.cover_medium}
                          alt={track.title}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography gutterBottom variant="h6" component="div" noWrap sx={{ flex: 1 }}>
                              {track.title}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                playTrack(track);
                              }}
                            >
                              <PlayArrowIcon />
                            </IconButton>
                          </Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {track.artist.name}
                          </Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                            <AlbumIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            <Typography variant="caption" color="text.secondary" noWrap>
                              Clique no card para ver o álbum
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Search; 