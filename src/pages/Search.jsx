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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { searchArtists, searchTracks } from '../services/deezerApi';
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const [artistsResponse, tracksResponse] = await Promise.all([
        searchArtists(searchQuery),
        searchTracks(searchQuery),
      ]);
      
      setArtists(artistsResponse.data);
      setTracks(tracksResponse.data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
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
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={track.album.cover_medium}
                          alt={track.title}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="h6" component="div" align="center">
                            {track.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" align="center">
                            {track.artist.name}
                          </Typography>
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