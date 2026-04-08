import { useEffect, useRef } from 'react';
import {
  Box,
  Slider,
  IconButton,
  Typography,
  Paper,
  Stack,
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
    pauseTrack,
    resumeTrack,
    setPlayerVolume,
    playNext,
  } = usePlayer();

  const audioRef = useRef(null);

  // Handle previewUrl playback
  useEffect(() => {
    if (audioRef.current) {
      if (previewUrl) {
        audioRef.current.src = previewUrl;
        audioRef.current.play().catch((error) => {
          console.error('Error playing preview:', error);
        });
      }
    }
  }, [previewUrl]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current && previewUrl) {
      if (isPlaying) {
        audioRef.current.play().catch((error) => {
          console.error('Error playing:', error);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, previewUrl]);

  // Handle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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