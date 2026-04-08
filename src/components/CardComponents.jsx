import { memo } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Tooltip,
} from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';

/**
 * TrackCard Component - Memoized para evitar re-renders
 */
export const TrackCard = memo(({ track, isPlaying, onPlay, onPreview }) => {
  return (
    <Card
      sx={{
        background: 'linear-gradient(to right, #1A1A1A, #000000)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={track.album?.cover_medium || track.album?.cover_small}
        alt={track.title}
      />
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="subtitle2" noWrap gutterBottom>
          {track.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {track.artist?.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'space-between' }}>
          <Tooltip title="Play">
            <IconButton size="small" onClick={() => onPlay?.(track)} color="primary">
              <PlayArrow />
            </IconButton>
          </Tooltip>
          <Tooltip title="Preview">
            <IconButton size="small" onClick={() => onPreview?.(track)} 
              sx={{ color: isPlaying ? 'primary.main' : 'inherit' }}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
});

TrackCard.displayName = 'TrackCard';

/**
 * ArtistCard Component - Memoized
 */
export const ArtistCard = memo(({ artist, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        background: 'linear-gradient(to right, #1A1A1A, #000000)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={artist.picture_medium || artist.picture_small}
        alt={artist.name}
        sx={{ borderRadius: '8px', m: 1 }}
      />
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="subtitle2" noWrap>
          {artist.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {artist.nb_fan?.toLocaleString()} fans
        </Typography>
      </CardContent>
    </Card>
  );
});

ArtistCard.displayName = 'ArtistCard';

/**
 * AlbumCard Component - Memoized
 */
export const AlbumCard = memo(({ album, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        background: 'linear-gradient(to right, #1A1A1A, #000000)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={album.cover_medium || album.cover_small}
        alt={album.title}
      />
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="subtitle2" noWrap gutterBottom>
          {album.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {album.artist?.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(album.release_date).getFullYear()}
        </Typography>
      </CardContent>
    </Card>
  );
});

AlbumCard.displayName = 'AlbumCard';

/**
 * PlaylistCard Component - Memoized
 */
export const PlaylistCard = memo(({ playlist, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        background: 'linear-gradient(to right, #1A1A1A, #000000)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={playlist.picture_medium || playlist.picture_small}
        alt={playlist.title}
      />
      <CardContent sx={{ pb: 1 }}>
        <Typography variant="subtitle2" noWrap gutterBottom>
          {playlist.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {playlist.nb_tracks} tracks
        </Typography>
      </CardContent>
    </Card>
  );
});

PlaylistCard.displayName = 'PlaylistCard';

export default {
  TrackCard,
  ArtistCard,
  AlbumCard,
  PlaylistCard,
};
