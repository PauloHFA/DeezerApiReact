import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Box, Paper } from '@mui/material';
import { searchArtists } from '../services/deezerApi';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const Home = () => {
  const [featuredArtists, setFeaturedArtists] = useState([]);

  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        const response = await searchArtists('popular');
        setFeaturedArtists(response.data.slice(0, 12));
      } catch (error) {
        console.error('Error fetching featured artists:', error);
      }
    };

    fetchFeaturedArtists();
  }, []);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 6 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: '800px',
            background: 'linear-gradient(to right, #1A1A1A, #000000)',
            borderRadius: '12px',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <MusicNoteIcon sx={{ color: 'primary.main', fontSize: 40 }} />
            <Box>
              <Typography variant="h3" component="h1" gutterBottom align="center">
                Welcome to Deezer Music
              </Typography>
              <Typography variant="h6" color="text.secondary" align="center">
                Discover your favorite artists and tracks
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Featured Artists
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {featuredArtists.map((artist) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={artist.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'linear-gradient(to bottom, #1A1A1A, #000000)',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
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
    </Box>
  );
};

export default Home; 