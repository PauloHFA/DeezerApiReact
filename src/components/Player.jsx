import { useState, useEffect } from 'react';
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
import stateManager from '../services/StateManager';

const Player = () => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    // Subscribe to state changes
    const unsubscribeTrack = stateManager.subscribe('currentTrack', setCurrentTrack);
    const unsubscribePlaying = stateManager.subscribe('isPlaying', setIsPlaying);
    const unsubscribeVolume = stateManager.subscribe('volume', setVolume);
    const unsubscribeQueue = stateManager.subscribe('queue', setQueue);

    // Cleanup subscriptions
    return () => {
      unsubscribeTrack();
      unsubscribePlaying();
      unsubscribeVolume();
      unsubscribeQueue();
    };
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      stateManager.pauseTrack();
    } else {
      stateManager.resumeTrack();
    }
  };

  const handleVolumeChange = (event, newValue) => {
    stateManager.setVolume(newValue);
  };

  const handleNext = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      stateManager.playTrack(nextTrack);
      stateManager.setState('queue', queue.slice(1));
    }
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
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <img
            src={currentTrack.album.cover_small}
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
          <IconButton onClick={handleNext} color="primary">
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
    </Paper>
  );
};

export default Player; 