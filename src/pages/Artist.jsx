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
} from '@mui/material';
import { getArtist, getArtistAlbums } from '../services/deezerApi';

const Artist = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <Box>
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

      <Typography variant="h4" gutterBottom>
        Albums
      </Typography>
      <Grid container spacing={3}>
        {albums.map((album) => (
          <Grid item xs={12} sm={6} md={4} key={album.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={album.cover_medium}
                alt={album.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {album.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(album.release_date).getFullYear()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Artist; 