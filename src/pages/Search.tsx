import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  InputAdornment,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { searchArtists, searchTracks, searchAlbums, searchPlaylists } from '@/services/deezerApi';
import { usePlayer } from '@/hooks/usePlayer';
import { useDebounce } from '@/hooks/useDebounce';
import { useNotification } from '@/hooks/useNotification';
import { useQuery } from '@/hooks/useQuery';
import { ArtistCard, TrackCard, AlbumCard, PlaylistCard } from '@/components/CardComponents';
import { SkeletonGrid, SkeletonTrackList } from '@/components/SkeletonLoader';
import SearchIcon from '@mui/icons-material/Search';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import type { Artist, Track, Album, Playlist } from '@/types';

interface SearchResults {
  artists: Artist[];
  tracks: Track[];
  albums: Album[];
  playlists: Playlist[];
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { currentlyPlaying, playPreview, stopPreview } = usePlayer();
  const { info } = useNotification();
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Create search function with cache
  const searchAll = useCallback(async (): Promise<SearchResults> => {
    if (!debouncedQuery.trim()) {
      return { artists: [], tracks: [], albums: [], playlists: [] };
    }

    const [
      artistsResponse,
      tracksResponse,
      albumsResponse,
      playlistsResponse,
    ] = await Promise.all([
      searchArtists(debouncedQuery),
      searchTracks(debouncedQuery),
      searchAlbums(debouncedQuery),
      searchPlaylists(debouncedQuery),
    ]);

    return {
      artists: artistsResponse.data || [],
      tracks: tracksResponse.data || [],
      albums: albumsResponse.data || [],
      playlists: playlistsResponse.data || [],
    };
  }, [debouncedQuery]);

  // Use query hook with automatic caching
  const { data: results, loading } = useQuery<SearchResults>(searchAll, [debouncedQuery], {
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: debouncedQuery.trim().length > 0,
  });

  // Compute total results
  const totalResults = useMemo(
    () =>
      (results?.artists.length || 0) +
      (results?.tracks.length || 0) +
      (results?.albums.length || 0) +
      (results?.playlists.length || 0),
    [results]
  );

  const handlePreviewTrack = useCallback(
    (track: Track) => {
      if (currentlyPlaying === track.id) {
        stopPreview();
      } else {
        playPreview(track);
      }
    },
    [currentlyPlaying, playPreview, stopPreview]
  );

  useEffect(() => {
    if (totalResults === 0 && !loading && debouncedQuery.trim()) {
      info('Nenhum resultado encontrado');
    }
  }, [totalResults, loading, debouncedQuery, info]);

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
                label="Busque artistas, músicas, álbuns e playlists..."
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
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
              {loading && (
                <CircularProgress
                  size={40}
                  sx={{
                    color: 'primary.main',
                  }}
                />
              )}
            </Box>
          </Box>
        </Paper>

        {loading && searchQuery.trim() ? (
          <Box sx={{ width: '100%', maxWidth: '1200px' }}>
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                <PersonIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h4" component="h2">
                  Artistas
                </Typography>
              </Box>
              <Grid container spacing={3} justifyContent="center">
                <SkeletonGrid count={4} xs={12} sm={6} md={4} lg={3} />
              </Grid>
            </Box>
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                <MusicNoteIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h4" component="h2">
                  Tracks
                </Typography>
              </Box>
              <SkeletonTrackList count={5} />
            </Box>
          </Box>
        ) : searchQuery.trim() ? (
          <Box sx={{ width: '100%', maxWidth: '1200px' }}>
            {results?.artists.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                  <PersonIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" component="h2">
                    Artists
                  </Typography>
                </Box>
                <Grid container spacing={3} justifyContent="center">
                  {results.artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} onClick={() => navigate(`/artist/${artist.id}`)} />
                  ))}
                </Grid>
              </Box>
            )}

            {results?.albums.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                  <AlbumIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" component="h2">
                    Albums
                  </Typography>
                </Box>
                <Grid container spacing={3} justifyContent="center">
                  {results.albums.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </Grid>
              </Box>
            )}

            {results?.playlists.length > 0 && (
              <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                  <QueueMusicIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" component="h2">
                    Playlists
                  </Typography>
                </Box>
                <Grid container spacing={3} justifyContent="center">
                  {results.playlists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </Grid>
              </Box>
            )}

            {results?.tracks.length > 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                  <MusicNoteIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" component="h2">
                    Tracks
                  </Typography>
                </Box>
                <Grid container spacing={3} justifyContent="center">
                  {results.tracks.map((track) => (
                    <TrackCard key={track.id} track={track} onPreview={handlePreviewTrack} currentlyPlaying={currentlyPlaying} />
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px',
              gap: 2,
            }}
          >
            <MusicNoteIcon sx={{ fontSize: 80, color: 'primary.main', opacity: 0.5 }} />
            <Typography variant="h5" color="text.secondary">
              Comece a buscar suas músicas favoritas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Digite um artista, música, álbum ou playlist
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Search; 