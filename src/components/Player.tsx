import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Slider,
  IconButton,
  Typography,
  Paper,
  Stack,
  Chip,
  LinearProgress,
  Tooltip,
  Button,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  VolumeUp,
  VolumeOff,
  FastForward,
  FastRewind,
  YouTube,
  MusicNote,
} from '@mui/icons-material';
import { usePlayer, PlaybackSource } from '../hooks/usePlayer';
import { YouTubePlayerState } from '../services/youtubePlayer';

const Player = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    queue,
    previewUrl,
    youtubeVideoId,
    youtubeThumbnail,
    youtubePlayerState,
    youtubeDuration,
    youtubeCurrentTime,
    playbackSource,
    spotifyDeviceId,
    spotifyPlaybackState,
    matchedTrack,
    pauseTrack,
    resumeTrack,
    setPlayerVolume,
    playNext,
    stopYoutube,
    playSpotify,
    stopSpotify,
    seekTo,
    getProgress,
    togglePlayPause,
    setPlaybackSource,
    matchCurrentTrack,
  } = usePlayer();

  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubeContainerRef = useRef<HTMLDivElement>(null);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const progressIntervalRef = useRef<number | null>(null);

  // Audio element for Deezer previews
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playbackSource === 'youtube' || playbackSource === 'spotify') {
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
  }, [previewUrl, isPlaying, volume, playbackSource]);

  // Progress tracking for all sources
  useEffect(() => {
    if (playbackSource === 'deezer' && previewUrl && isPlaying) {
      progressIntervalRef.current = window.setInterval(() => {
        const audio = audioRef.current;
        if (audio && audio.duration) {
          setProgress({
            current: audio.currentTime,
            duration: audio.duration,
          });
        }
      }, 500);
    } else if (playbackSource === 'youtube') {
      progressIntervalRef.current = window.setInterval(() => {
        setProgress({
          current: youtubeCurrentTime,
          duration: youtubeDuration,
        });
      }, 500);
    } else if (playbackSource === 'spotify' && spotifyPlaybackState) {
      setProgress({
        current: spotifyPlaybackState.position / 1000,
        duration: spotifyPlaybackState.duration / 1000,
      });
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [playbackSource, previewUrl, isPlaying, youtubeCurrentTime, youtubeDuration, spotifyPlaybackState]);

  // Initialize YouTube player when videoId changes
  useEffect(() => {
    if (youtubeVideoId && youtubeContainerRef.current) {
      // The player creation is handled in playYoutube callback
    }
  }, [youtubeVideoId]);

  const handlePlayPause = () => {
    togglePlayPause();
  };

  const handleVolumeChange = (_event: any, newValue: number | number[]) => {
    setPlayerVolume(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  const handleSeek = (_event: any, newValue: number | number[]) => {
    const value = Array.isArray(newValue) ? newValue[0] : newValue;
    seekTo(value);
  };

  const handleSourceChange = (source: PlaybackSource) => {
    setPlaybackSource(source);
    // If switching to YouTube or Spotify, try to match and play
    if (currentTrack && (source === 'youtube' || source === 'spotify')) {
      matchCurrentTrack().then(() => {
        if (matchedTrack) {
          if (source === 'youtube' && matchedTrack.youtubeVideoId) {
            // playYoutube is called from the UI
          } else if (source === 'spotify' && matchedTrack.spotifyTrack) {
            playSpotify(currentTrack, matchedTrack.spotifyTrack);
          }
        }
      });
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (!currentTrack) {
    return null;
  }

  const isYoutube = playbackSource === 'youtube';
  const isSpotify = playbackSource === 'spotify';
  const isDeezer = playbackSource === 'deezer';

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
        transition: 'height 0.3s ease',
      }}
    >
      {/* Main player bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
        {/* Track info */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
          <img
            src={currentTrack.album?.cover_small || currentTrack.album?.cover_medium}
            alt={currentTrack.title}
            style={{ width: 50, height: 50, borderRadius: '8px', flexShrink: 0 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentTrack.artist.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
              {isDeezer && (
                <Chip label="Preview (30s)" size="small" variant="outlined" icon={<MusicNote fontSize="small" />} />
              )}
              {isYoutube && (
                              <Chip label="YouTube" size="small" color="error" icon={<YouTube fontSize="small" />} />
              )}
              {isSpotify && (
                              <Chip label="Spotify" size="small" color="success" icon={<MusicNote fontSize="small" />} />
              )}
            </Box>
          </Box>
        </Box>

        {/* Progress bar (click to expand) */}
        <Box 
          sx={{ 
            flex: 1, 
            maxWidth: 600, 
            minWidth: 200,
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 0.5,
            cursor: 'pointer',
          }}
          onClick={() => setShowProgress(!showProgress)}
        >
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', px: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
              {formatTime(progress.current)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40, textAlign: 'right' }}>
              {formatTime(progress.duration)}
            </Typography>
          </Box>
          <Box sx={{ width: '100%', height: 4 }}>
                      <LinearProgress
              variant="determinate"
              value={progress.duration > 0 ? (progress.current / progress.duration) * 100 : 0}
              sx={{
                height: 4,
                borderRadius: 2,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                },
                '& .MuiLinearProgress-barColorPrimary': {
                  background: 'linear-gradient(45deg, #FF0000 30%, #FF3333 90%)',
                },
              }}
            />
          </Box>
        </Box>

        {/* Controls */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1 }}>
          <Tooltip title="Anterior">
            <IconButton onClick={() => { /* previous track */ }} color="primary" disabled={queue.length === 0}>
              <FastRewind />
            </IconButton>
          </Tooltip>
          <Tooltip title={isPlaying ? 'Pausar' : 'Reproduzir'}>
            <IconButton onClick={handlePlayPause} color="primary" size="large" sx={{ p: 1 }}>
              {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Próxima">
            <IconButton onClick={playNext} color="primary" disabled={queue.length === 0}>
              <FastForward />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Volume */}
        <Box sx={{ width: 120, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={() => setPlayerVolume(volume > 0 ? 0 : 0.5)} 
            color="primary"
            size="small"
          >
            {volume > 0 ? <VolumeUp /> : <VolumeOff />}
          </IconButton>
          <Slider
            size="small"
            value={volume}
            onChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.01}
            sx={{ width: '100%' }}
          />
        </Box>

        {/* Source selector */}
        <Box sx={{ display: 'flex', gap: 0.5, px: 1 }}>
          <Tooltip title="Deezer Preview (30s)">
            <Button
              size="small"
              variant={isDeezer ? 'contained' : 'outlined'}
              onClick={() => handleSourceChange('deezer')}
              startIcon={<MusicNote fontSize="small" />}
              sx={{ textTransform: 'none' }}
            >
              Deezer
            </Button>
          </Tooltip>
          {matchedTrack?.youtubeVideoId && (
            <Tooltip title="YouTube (completa)">
              <Button
                size="small"
                variant={isYoutube ? 'contained' : 'outlined'}
                onClick={() => handleSourceChange('youtube')}
                          startIcon={<YouTube fontSize="small" />}
                color="error"
                sx={{ textTransform: 'none' }}
              >
                YouTube
              </Button>
            </Tooltip>
          )}
          {matchedTrack?.spotifyTrack && spotifyDeviceId && (
            <Tooltip title="Spotify (completa - Premium)">
              <Button
                size="small"
                variant={isSpotify ? 'contained' : 'outlined'}
                onClick={() => handleSourceChange('spotify')}
                          startIcon={<MusicNote fontSize="small" />}
                color="success"
                sx={{ textTransform: 'none' }}
              >
                Spotify
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Expanded progress bar with YouTube player / Spotify info */}
      {showProgress && (
        <Box sx={{ mt: 2, borderTop: '1px solid rgba(255,255,255,0.1)', pt: 2 }}>
          {isYoutube && youtubeVideoId && (
            <Box ref={youtubeContainerRef} id="youtube-player-container" sx={{ width: '100%', height: 200, borderRadius: 12, overflow: 'hidden' }} />
          )}
          
          {isSpotify && spotifyPlaybackState && (
            <Box sx={{ p: 2, background: 'rgba(29, 185, 84, 0.1)', borderRadius: 12 }}>
              <Typography variant="subtitle2" color="success.main" gutterBottom>
                Spotify Web Playback SDK Ativo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Device ID: {spotifyDeviceId?.substring(0, 20)}...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Requer conta Spotify Premium para streaming completo
              </Typography>
            </Box>
          )}

          {isDeezer && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Reproduzindo preview de 30 segundos do Deezer
              </Typography>
            </Box>
          )}
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