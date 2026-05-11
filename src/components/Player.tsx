import { useEffect, useRef } from 'react';
import {
  Box,
  Slider,
  IconButton,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
} from '@mui/icons-material';
import { usePlayer } from '../hooks/usePlayer';

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    queue,
    previewUrl,
    youtubeVideoId,
    youtubeThumbnail,
    pauseTrack,
    resumeTrack,
    setPlayerVolume,
    playNext,
    stopYoutube,
  } = usePlayer();

  const audioRef = useRef(null);

  // Consolidated audio management - handles src, playback state, and volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Only manage audio when we're using preview playback.
    if (youtubeVideoId) {
      audio.pause();
      audio.src = '';
      return;
    }

    if (previewUrl) {
      audio.src = previewUrl;
    }

    if (previewUrl && isPlaying) {
      audio.play().catch((error) => {
        console.error('Error playing preview:', error);
      });
    } else {
      audio.pause();
    }

    audio.volume = volume;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [previewUrl, isPlaying, volume, youtubeVideoId]);

  const handlePlayPause = () => {
    if (isPlaying) {
      if (youtubeVideoId) {
        stopYoutube();
      } else {
        pauseTrack();
      }
    } else {
      resumeTrack();
    }
  };

  const handleVolumeChange = (event, newValue) => {
    setPlayerVolume(newValue);
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        background: 'linear-gradient(to right, #1A1A1A, #000000)',
        borderRadius: '16px 16px 0 0',
        zIndex: 1000,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src={currentTrack.album?.cover_small || currentTrack.album?.cover_medium}
            alt={currentTrack.title}
            style={{ width: 50, height: 50, borderRadius: '8px' }}
          />
          <Box>
            <Typography variant="subtitle1" noWrap>
              {currentTrack.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {currentTrack.artist.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              {youtubeVideoId ? (
                <Chip label="YouTube ativo" size="small" color="error" />
              ) : (
                <Chip label="Preview (30s)" size="small" variant="outlined" />
              )}
            </Box>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={handlePlayPause} color="primary">
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton onClick={playNext} color="primary" disabled={queue.length === 0}>
            <SkipNext />
          </IconButton>
          <Box sx={{ width: 100, display: 'flex', alignItems: 'center', gap: 1 }}>
            <VolumeUp color="primary" />
            <Slider
              size="small"
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.01}
            />
          </Box>
        </Stack>
      </Box>

      {youtubeVideoId && youtubeThumbnail && (
        <Box sx={{ mt: 2, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <img
            src={youtubeThumbnail}
            alt="YouTube thumbnail"
            style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 12 }}
          />
        </Box>
      )}

      {youtubeVideoId && (
        <Box sx={{ mt: 2, width: '100%', height: 180, position: 'relative' }}>
          <iframe
            title="YouTube player"
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&playsinline=1&rel=0&enablejsapi=1`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ border: 0, borderRadius: 12 }}
          />
        </Box>
      )}

      <audio
        ref={audioRef}
        onEnded={() => {
          pauseTrack();
        }}
        style={{ display: 'none' }}
      />
    </Paper>
  );
};

export default Player; 