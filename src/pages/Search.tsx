import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  InputAdornment,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { searchArtists, searchTracks, searchAlbums, searchPlaylists, getTrackPreview } from '@/services/deezerApi';
import { fetchYoutubeVideoData } from '@/services/youtubeApi';
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
import { useAccount } from '@/contexts/AccountContext';
import AddToPlaylistDialog from '@/components/AddToPlaylistDialog';
import type { Artist, Track, Album, Playlist } from '@/types';

interface SearchResults {
  query: string;
  artists: Artist[];
  tracks: Track[];
  albums: Album[];
  playlists: Playlist[];
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [trackToSave, setTrackToSave] = useState<Track | null>(null);
  const navigate = useNavigate();
  const { currentlyPlaying, playPreview, stopPreview, playYoutube, matchCurrentTrack } = usePlayer();
  const { info, error, success } = useNotification();
  const { recordSearch } = useAccount();
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Create search function with cache
  const searchAll = useCallback(async (): Promise<SearchResults> => {
    if (!debouncedQuery.trim()) {
      return { query: debouncedQuery, artists: [], tracks: [], albums: [], playlists: [] };
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
      query: debouncedQuery,
      artists: artistsResponse.data || [],
      tracks: tracksResponse.data || [],
      albums: albumsResponse.data || [],
      playlists: playlistsResponse.data || [],
    };
  }, [debouncedQuery]);

  // Use query hook with automatic caching
  const { data: results, loading, error: searchError } = useQuery<SearchResults>(searchAll, [debouncedQuery], {
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
    enabled: debouncedQuery.trim().length > 0,
  });
  const activeResults = results?.query === debouncedQuery ? results : null;

  // Compute total results
  const totalResults = useMemo(
    () =>
      (activeResults?.artists.length || 0) +
      (activeResults?.tracks.length || 0) +
      (activeResults?.albums.length || 0) +
      (activeResults?.playlists.length || 0),
    [activeResults]
  );

  const handlePreviewTrack = useCallback(
    async (track: Track) => {
      if (currentlyPlaying === track.id) {
        stopPreview();
        return;
      }

      const previewUrl = track.preview || (await getTrackPreview(track.id));
      if (previewUrl) {
        playPreview(track.preview ? track : { ...track, preview: previewUrl });
        return;
      }

      const query = `${track.title} ${track.artist.name}`;
      info('Preview não disponível. Buscando alternativa no YouTube...');
      const videoData = await fetchYoutubeVideoData(query);
      if (videoData) {
        playYoutube(track, videoData.videoId, videoData.thumbnailUrl, videoData.candidateVideoIds);
        success('Vídeo selecionado. Se não iniciar automaticamente, use Reproduzir no player.');
        return;
      }

      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
        '_blank'
      );
    },
    [currentlyPlaying, playPreview, stopPreview, playYoutube, info, success]
  );

  const handleOpenYoutube = useCallback(
    async (track: Track) => {
      const query = `${track.title} ${track.artist.name}`;
      info('Buscando vídeo no YouTube...');
      const videoData = await fetchYoutubeVideoData(query);
      if (!videoData) {
        window.open(
          `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
          '_blank'
        );
        error('Não foi possível encontrar o vídeo automaticamente. Abrindo YouTube.');
        return;
      }
      playYoutube(track, videoData.videoId, videoData.thumbnailUrl, videoData.candidateVideoIds);
      success('Vídeo selecionado. Se não iniciar automaticamente, use Reproduzir no player.');
    },
    [info, error, success, playYoutube]
  );

  const handleOpenSpotify = useCallback(
    async () => {
      info('Buscando no Spotify...');
      await matchCurrentTrack();
      success('Verifique o player para opções do Spotify.');
    },
    [info, success, matchCurrentTrack]
  );

  const hasPendingSearch = searchQuery.trim() !== debouncedQuery.trim();

  useEffect(() => {
    if (
      !loading &&
      !searchError &&
      results &&
      results.query === debouncedQuery &&
      debouncedQuery.trim()
    ) {
      recordSearch(debouncedQuery, results.tracks);
    }
  }, [loading, searchError, results, debouncedQuery, recordSearch]);

  const handleSaveTrack = (track: Track) => {
    setTrackToSave(track);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, pb: 10 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
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

        {(loading || hasPendingSearch) && searchQuery.trim() ? (
          <Box sx={{ width: '100%', maxWidth: '1200px' }}>
            <Box sx={{ mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                        <Box sx={{ position: 'relative' }}>
                          <PersonIcon sx={{ color: 'primary.main', fontSize: 28 }} />
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
                          Artistas
                        </Typography>
                      </Box>
                      <Grid container spacing={3} justifyContent="center">
                        <SkeletonGrid count={4} xs={12} sm={6} md={4} lg={3} />
                      </Grid>
                    </Box>
                    <Box sx={{ mb: 6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
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
                          Tracks
                        </Typography>
                      </Box>
                      <SkeletonTrackList count={5} />
                    </Box>
                  </Box>
                ) : searchQuery.trim() ? (
                  <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                    {searchError ? (
                      <Typography role="alert" color="error" align="center">
                        Não foi possível concluir a busca. Tente novamente.
                      </Typography>
                    ) : results && totalResults === 0 ? (
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 1,
                          py: 8,
                          textAlign: 'center',
                        }}
                      >
                        <SearchIcon sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.6 }} />
                        <Typography variant="h6" color="text.secondary">
                          Nenhum resultado encontrado
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tente buscar por outro artista, música, álbum ou playlist.
                        </Typography>
                      </Box>
                    ) : null}
                    {!searchError && activeResults && activeResults.artists.length > 0 && (
                      <Box sx={{ mb: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                          <Box sx={{ position: 'relative' }}>
                            <PersonIcon sx={{ color: 'primary.main', fontSize: 28 }} />
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
                            Artists
                          </Typography>
                        </Box>
                        <Grid container spacing={3} justifyContent="center">
                          {activeResults.artists.map((artist) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={artist.id}>
                              <ArtistCard artist={artist} onClick={() => navigate(`/artist/${artist.id}`)} />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {!searchError && activeResults && activeResults.albums.length > 0 && (
                      <Box sx={{ mb: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
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
                            Albums
                          </Typography>
                        </Box>
                        <Grid container spacing={3} justifyContent="center">
                          {activeResults.albums.map((album) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={album.id}>
                              <AlbumCard album={album} />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {!searchError && activeResults && activeResults.playlists.length > 0 && (
                      <Box sx={{ mb: 6 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                          <Box sx={{ position: 'relative' }}>
                            <QueueMusicIcon sx={{ color: 'primary.main', fontSize: 28 }} />
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
                            Playlists
                          </Typography>
                        </Box>
                        <Grid container spacing={3} justifyContent="center">
                          {activeResults.playlists.map((playlist) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={playlist.id}>
                              <PlaylistCard playlist={playlist} />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {!searchError && activeResults && activeResults.tracks.length > 0 && (
                      <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, justifyContent: 'center' }}>
                  <MusicNoteIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h4" component="h2">
                    Tracks
                  </Typography>
                </Box>
                <Grid container spacing={3} justifyContent="center">
                  {activeResults.tracks.map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlaying={currentlyPlaying === track.id}
                      onPreview={handlePreviewTrack}
                      onYoutube={handleOpenYoutube}
                      onAddToPlaylist={handleSaveTrack}
                                  onSpotify={handleOpenSpotify}
                                  hasSpotify={true} // Will be determined by matchCurrentTrack
                                />
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
      <AddToPlaylistDialog
        open={Boolean(trackToSave)}
        track={trackToSave}
        onClose={() => setTrackToSave(null)}
      />
    </Container>
  );
};

export default Search; 