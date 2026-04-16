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
  OpenInNew,
} from '@mui/icons-material';
import { usePlayer } from '../hooks/usePlayer';

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    queue,
    previewUrl,
    pauseTrack,
    resumeTrack,
    setPlayerVolume,
    playNext,
  } = usePlayer();

  const audioRef = useRef(null);

  // Consolidated audio management - handles src, playback state, and volume
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Update source
    if (previewUrl) {
      audio.src = previewUrl;
    }

    // Update play state
    if (previewUrl && isPlaying) {
      audio.play().catch((error) => {
        console.error('Error playing preview:', error);
      });
    } else {
      audio.pause();
    }

    // Update volume
    audio.volume = volume;

    // Cleanup: pause and stop audio when component unmounts
    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [previewUrl, isPlaying, volume]);

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
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
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip label="Preview (30s)" size="small" variant="outlined" />
              {currentTrack.link && (
                <Button
                  size="small"
                  endIcon={<OpenInNew />}
                  onClick={() => window.open(currentTrack.link, '_blank')}
                  sx={{
                    textTransform: 'none',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'rgba(29, 185, 84, 0.1)',
                    },
                  }}
                >
                  Ouça Completo
                </Button>
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