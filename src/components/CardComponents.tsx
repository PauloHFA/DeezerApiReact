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
import { PlayArrow, Pause, YouTube, MusicNote, PlaylistAdd } from '@mui/icons-material';
import type { Track, Artist, Album, Playlist } from '@/types';

// Unified card dimensions
const CARD_MEDIA_HEIGHT = 200;
const CARD_CONTENT_MIN_HEIGHT = 120;

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  onPlay?: (track: Track) => void | Promise<void>;
  onPreview?: (track: Track) => void | Promise<void>;
  onYoutube?: (track: Track) => void | Promise<void>;
  onSpotify?: (track: Track) => void | Promise<void>;
  onAddToPlaylist?: (track: Track) => void;
  hasSpotify?: boolean;
}

interface ArtistCardProps {
  artist: Artist;
  onClick?: () => void;
}

interface AlbumCardProps {
  album: Album;
  onClick?: () => void;
}

interface PlaylistCardProps {
  playlist: Playlist;
  onClick?: () => void;
}

/**
 * BaseCard - Unified card wrapper with consistent sizing
 */
const BaseCard = memo(({ children, onClick, sx = {}, ...props }: any) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        background: 'linear-gradient(to right, #1A1A1A, #000000)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 3,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
});

BaseCard.displayName = 'BaseCard';

/**
 * Unified CardMedia with consistent sizing
 */
const UnifiedCardMedia = ({
  image,
  alt,
  variant = 'square',
}: {
  image?: string;
  alt: string;
  variant?: 'square' | 'circle';
}) => {
  const mediaStyles = {
    square: {
      height: CARD_MEDIA_HEIGHT,
      width: '100%',
      objectFit: 'cover' as const,
    },
    circle: {
      height: CARD_MEDIA_HEIGHT,
      width: '100%',
      objectFit: 'cover' as const,
      borderRadius: '50%',
    },
  };

  return (
    <CardMedia
      component="img"
      image={image}
      alt={alt}
      sx={mediaStyles[variant]}
    />
  );
};

UnifiedCardMedia.displayName = 'UnifiedCardMedia';

/**
 * Unified CardContent with consistent height
 */
const UnifiedCardContent = ({ children, ...props }: any) => {
  return (
    <CardContent
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: CARD_CONTENT_MIN_HEIGHT,
        pb: 1.5,
        ...props,
      }}
    >
      {children}
    </CardContent>
  );
};

UnifiedCardContent.displayName = 'UnifiedCardContent';

/**
 * TrackCard Component - Memoized
 */
export const TrackCard = memo<TrackCardProps>(({ track, isPlaying, onPlay, onPreview, onYoutube, onSpotify, onAddToPlaylist, hasSpotify }) => {
  return (
    <BaseCard>
      <UnifiedCardMedia
        image={track.album?.cover_medium || track.album?.cover_small}
        alt={track.title}
      />
      <UnifiedCardContent>
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle2" noWrap gutterBottom>
            {track.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {track.artist?.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Tooltip title="Play">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onPlay?.(track); }} color="primary">
              <PlayArrow />
            </IconButton>
          </Tooltip>
          <Tooltip title="Preview (30s)">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onPreview?.(track); }} 
              sx={{ color: isPlaying ? 'primary.main' : 'inherit' }}>
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Tooltip>
          <Tooltip title="YouTube">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onYoutube?.(track); }} color="error">
              <YouTube />
            </IconButton>
          </Tooltip>
          {hasSpotify && onSpotify && (
            <Tooltip title="Spotify (completa)">
              <IconButton size="small" onClick={(e) => { e.stopPropagation(); onSpotify?.(track); }} color="success">
                <MusicNote />
              </IconButton>
            </Tooltip>
          )}
          {onAddToPlaylist && (
            <Tooltip title="Adicionar a uma playlist">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddToPlaylist(track);
                }}
                aria-label={`Adicionar ${track.title} a uma playlist`}
              >
                <PlaylistAdd />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </UnifiedCardContent>
    </BaseCard>
  );
});

TrackCard.displayName = 'TrackCard';

/**
 * ArtistCard Component - Memoized
 */
export const ArtistCard = memo<ArtistCardProps>(({ artist, onClick }) => {
  return (
    <BaseCard onClick={onClick}>
      <UnifiedCardMedia
        variant="circle"
        image={artist.picture_xl || artist.picture_medium || artist.picture_small}
        alt={artist.name}
      />
      <UnifiedCardContent>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" noWrap gutterBottom>
            {artist.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {artist.nb_fan?.toLocaleString()} fãs
          </Typography>
        </Box>
      </UnifiedCardContent>
    </BaseCard>
  );
});

ArtistCard.displayName = 'ArtistCard';

/**
 * AlbumCard Component - Memoized
 */
export const AlbumCard = memo<AlbumCardProps>(({ album, onClick }) => {
  return (
    <BaseCard onClick={onClick}>
      <UnifiedCardMedia
        image={album.cover_xl || album.cover_medium || album.cover_small}
        alt={album.title}
      />
      <UnifiedCardContent>
        <Box>
          <Typography variant="subtitle2" noWrap gutterBottom>
            {album.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {album.artist?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(album.release_date).getFullYear()} • {album.nb_tracks} faixas
          </Typography>
        </Box>
      </UnifiedCardContent>
    </BaseCard>
  );
});

AlbumCard.displayName = 'AlbumCard';

/**
 * PlaylistCard Component - Memoized
 */
export const PlaylistCard = memo<PlaylistCardProps>(({ playlist, onClick }) => {
  return (
    <BaseCard onClick={onClick}>
      <UnifiedCardMedia
        image={playlist.picture_xl || playlist.picture_medium || playlist.picture_small}
        alt={playlist.title}
      />
      <UnifiedCardContent>
        <Box>
          <Typography variant="subtitle2" noWrap gutterBottom>
            {playlist.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {playlist.creator?.name || 'Desconhecido'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {playlist.nb_tracks} faixas
          </Typography>
        </Box>
      </UnifiedCardContent>
    </BaseCard>
  );
});

PlaylistCard.displayName = 'PlaylistCard';

export default {
  TrackCard,
  ArtistCard,
  AlbumCard,
  PlaylistCard,
};
