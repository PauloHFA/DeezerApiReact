import { createContext, useState, useCallback, useRef, useEffect } from 'react';
import { youtubePlayerService, YouTubePlayerState } from '../services/youtubePlayer';
import { spotifyService } from '../services/spotifyApi';
import { spotifyWebPlaybackSDK } from '../services/spotifyWebPlayback';
import { trackMatchingService, MatchedTrack } from '../services/trackMatching';
import type { Track } from '../types';

// Persisted player state interface
interface PersistedPlayerState {
  volume: number;
  queue: Track[];
  playbackSource: PlaybackSource;
  currentTrackId: number | null;
  isPlaying: boolean;
}

// Playback source types
export type PlaybackSource = 'deezer' | 'youtube' | 'spotify';

export interface PlayerState {
  // Current track info
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  currentlyPlaying: number | null;
  
  // Source-specific state
  playbackSource: PlaybackSource;
  
  // Deezer preview
  previewUrl: string | null;
  
  // YouTube Player API
  youtubeVideoId: string | null;
  youtubeThumbnail: string | null;
  youtubePlayerState: YouTubePlayerState;
  youtubeDuration: number;
  youtubeCurrentTime: number;
  youtubeError: number | null;
  
  // Spotify Web Playback SDK
  spotifyDeviceId: string | null;
  spotifyPlaybackState: any | null;
  
  // Matched tracks for current track
  matchedTrack: MatchedTrack | null;
}

interface PlayerContextValue extends PlayerState {
  // Actions
  playTrack: (track: Track, source?: PlaybackSource) => Promise<void>;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlayPause: () => void;
  setPlayerVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: number) => void;
  clearQueue: () => void;
  playNext: () => void;
  playPreview: (trackOrUrl: Track | string) => void;
  stopPreview: () => void;
  playYoutube: (track: Track, videoId: string, thumbnailUrl?: string) => void;
  initializeYoutubePlayer: (element: HTMLDivElement, videoId: string) => Promise<void>;
  stopYoutube: () => void;
  playSpotify: (track: Track, spotifyTrack: any) => Promise<void>;
  stopSpotify: () => void;
  setCurrentlyPlayingTrack: (trackId: number) => void;
  setPlaybackSource: (source: PlaybackSource) => void;
  matchCurrentTrack: () => Promise<void>;
  seekTo: (seconds: number) => void;
  getProgress: () => { current: number; duration: number };
  }

  // Default context value to prevent "must be used within Provider" errors
  const defaultContextValue: PlayerContextValue = {
    // Estado
    currentTrack: null,
    isPlaying: false,
    volume: 0.5,
    queue: [],
    currentlyPlaying: null,
    playbackSource: 'deezer',
    previewUrl: null,
    youtubeVideoId: null,
    youtubeThumbnail: null,
    youtubePlayerState: YouTubePlayerState.UNSTARTED,
    youtubeDuration: 0,
    youtubeCurrentTime: 0,
    youtubeError: null,
    spotifyDeviceId: null,
    spotifyPlaybackState: null,
    matchedTrack: null,
  
    // Ações (no-ops)
    playTrack: async () => {},
    pauseTrack: () => {},
    resumeTrack: () => {},
    togglePlayPause: () => {},
    setPlayerVolume: () => {},
    addToQueue: () => {},
    removeFromQueue: () => {},
    clearQueue: () => {},
    playNext: () => {},
    playPreview: () => {},
    stopPreview: () => {},
    playYoutube: () => {},
    initializeYoutubePlayer: async () => {},
    stopYoutube: () => {},
    playSpotify: async () => {},
    stopSpotify: () => {},
    setCurrentlyPlayingTrack: () => {},
    setPlaybackSource: () => {},
    matchCurrentTrack: async () => {},
    seekTo: () => {},
    getProgress: () => ({ current: 0, duration: 0 }),
  };

  export const PlayerContext = createContext<PlayerContextValue>(defaultContextValue);

  export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  // Core state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [playbackSource, setPlaybackSource] = useState<PlaybackSource>('deezer');
  
  // Deezer preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // YouTube Player API
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [youtubeThumbnail, setYoutubeThumbnail] = useState<string | null>(null);
  const [youtubePlayerState, setYoutubePlayerState] = useState<YouTubePlayerState>(YouTubePlayerState.UNSTARTED);
  const [youtubeDuration, setYoutubeDuration] = useState(0);
  const [youtubeCurrentTime, setYoutubeCurrentTime] = useState(0);
  const [youtubeError, setYoutubeError] = useState<number | null>(null);
  
  // Spotify Web Playback SDK
  const [spotifyDeviceId, setSpotifyDeviceId] = useState<string | null>(null);
  const [spotifyPlaybackState, setSpotifyPlaybackState] = useState<any | null>(null);
  
  // Matched tracks
  const [matchedTrack, setMatchedTrack] = useState<MatchedTrack | null>(null);
  
  // Refs for services
  const youtubePlayerRef = useRef(youtubePlayerService);
  const spotifyPlayerRef = useRef(spotifyWebPlaybackSDK);
  const progressIntervalRef = useRef<number | null>(null);
  const volumeRef = useRef(volume);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

    // Persist player state to localStorage
    useEffect(() => {
      const savedState = localStorage.getItem('ph-music-player-state');
      if (savedState) {
        try {
          const parsed: PersistedPlayerState = JSON.parse(savedState);
          setVolume(parsed.volume ?? 0.5);
          setQueue(parsed.queue ?? []);
          setPlaybackSource(parsed.playbackSource ?? 'deezer');
          setIsPlaying(false); // Don't auto-play on restore
          // currentTrackId will be restored when track is loaded
        } catch (e) {
          console.warn('Failed to parse persisted player state:', e);
        }
      }
    }, []);

    // Save player state to localStorage on changes
    useEffect(() => {
      const stateToPersist: PersistedPlayerState = {
        volume,
        queue,
        playbackSource,
        currentTrackId: currentTrack?.id ?? null,
        isPlaying,
      };
      localStorage.setItem('ph-music-player-state', JSON.stringify(stateToPersist));
    }, [volume, queue, playbackSource, currentTrack, isPlaying]);

    // Initialize YouTube Player API
  useEffect(() => {
    youtubePlayerRef.current.loadAPI().catch(console.error);
  }, []);

  // Initialize Spotify Web Playback SDK when authenticated
  useEffect(() => {
    if (spotifyService.isAuthenticated()) {
      const initSpotify = async () => {
        try {
          const token = await spotifyService.getAccessToken();
          if (token) {
            const deviceId = await spotifyPlayerRef.current.initialize(token);
            setSpotifyDeviceId(deviceId);
            
            // Listen for state changes
            spotifyPlayerRef.current.on('state_changed', (state: any) => {
              setSpotifyPlaybackState(state);
              setIsPlaying(!state.paused);
              setYoutubeCurrentTime(state.position / 1000);
              setYoutubeDuration(state.duration / 1000);
            });
            
            spotifyPlayerRef.current.on('ready', (deviceId: string) => {
              setSpotifyDeviceId(deviceId);
            });
            
            spotifyPlayerRef.current.on('not_ready', () => {
              setSpotifyDeviceId(null);
            });
          }
        } catch (error) {
          console.error('Failed to initialize Spotify Web Playback SDK:', error);
        }
      };
      initSpotify();
    }
    
    return () => {
      spotifyPlayerRef.current.disconnect();
    };
  }, [spotifyService.isAuthenticated()]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      youtubePlayerRef.current.destroy();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Core actions
  const playTrack = useCallback(async (track: Track, source: PlaybackSource = 'deezer') => {
    setCurrentTrack(track);
    setCurrentlyPlaying(track?.id ?? null);
    setPlaybackSource(source);
    setIsPlaying(true);
    
    // Clear other sources
    setPreviewUrl(null);
    setYoutubeVideoId(null);
    setYoutubeThumbnail(null);
    
    if (source === 'deezer') {
      if (track?.preview) {
        setPreviewUrl(track.preview);
      }
    } else if (source === 'youtube') {
      // Will be handled by playYoutube
    } else if (source === 'spotify') {
      // Will be handled by playSpotify
    }
  }, []);

  const pauseTrack = useCallback(() => {
    if (playbackSource === 'youtube') {
      youtubePlayerRef.current.pause();
    } else if (playbackSource === 'spotify') {
      spotifyPlayerRef.current.getPlayer()?.pause();
    }
    setIsPlaying(false);
  }, [playbackSource]);

  const resumeTrack = useCallback(() => {
    if (playbackSource === 'youtube') {
      youtubePlayerRef.current.play();
    } else if (playbackSource === 'spotify') {
      spotifyPlayerRef.current.getPlayer()?.resume();
    }
    setIsPlaying(true);
  }, [playbackSource]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack]);

  const setPlayerVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    if (playbackSource === 'youtube') {
      youtubePlayerRef.current.setVolume(clampedVolume);
    } else if (playbackSource === 'spotify') {
      spotifyPlayerRef.current.getPlayer()?.setVolume(clampedVolume);
      if (spotifyDeviceId) {
        spotifyService.setVolume(Math.round(clampedVolume * 100), spotifyDeviceId).catch(console.error);
      }
    }
  }, [playbackSource, spotifyDeviceId]);

  const addToQueue = useCallback((track: Track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((trackId: number) => {
    setQueue((prev) => prev.filter((track) => track.id !== trackId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      playTrack(nextTrack, playbackSource);
      setQueue((prev) => prev.slice(1));
    }
  }, [queue, playTrack, playbackSource]);

  // YouTube Player state polling
  useEffect(() => {
    if (playbackSource === 'youtube' && youtubeVideoId) {
      progressIntervalRef.current = window.setInterval(() => {
        if (!youtubePlayerRef.current.isReady()) {
          return;
        }

        setYoutubeCurrentTime(youtubePlayerRef.current.getCurrentTime());
        setYoutubeDuration(youtubePlayerRef.current.getDuration());
        const playerState = youtubePlayerRef.current.getPlayerState();
        setYoutubePlayerState(playerState);
        setIsPlaying(playerState === YouTubePlayerState.PLAYING);

        if (playerState === YouTubePlayerState.ENDED) {
          playNext();
        }
      }, 500);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [playbackSource, youtubeVideoId, playNext]);

  const playPreview = useCallback((trackOrUrl: Track | string) => {
    setPlaybackSource('deezer');
    
    if (typeof trackOrUrl === 'string') {
      setPreviewUrl(trackOrUrl);
      setYoutubeVideoId(null);
      setIsPlaying(true);
      return;
    }

    if (trackOrUrl?.preview) {
      setCurrentTrack(trackOrUrl);
      setPreviewUrl(trackOrUrl.preview);
      setYoutubeVideoId(null);
      setCurrentlyPlaying(trackOrUrl.id);
      setIsPlaying(true);
      return;
    }

    console.warn('playPreview expects a track object with a preview URL or a preview URL string.');
  }, []);

  const stopPreview = useCallback(() => {
    setPreviewUrl(null);
    setCurrentlyPlaying(null);
    setIsPlaying(false);
  }, []);

  const playYoutube = useCallback((track: Track, videoId: string, thumbnailUrl = null) => {
    setCurrentTrack(track);
    setYoutubeVideoId(videoId);
    setYoutubeThumbnail(thumbnailUrl);
    setYoutubeError(null);
    setPreviewUrl(null);
    setCurrentlyPlaying(track?.id ?? null);
    setPlaybackSource('youtube');
    setIsPlaying(false);
  }, []);

  const initializeYoutubePlayer = useCallback(async (element: HTMLDivElement, videoId: string) => {
    const callbacks = {
        onReady: () => {
          setYoutubeError(null);
          youtubePlayerRef.current.setVolume(volumeRef.current);
        },
        onStateChange: (state: number) => {
          setYoutubePlayerState(state);
          setIsPlaying(state === YouTubePlayerState.PLAYING);
        },
        onError: (error: number) => {
          console.error('YouTube Player error:', error);
          setYoutubeError(error);
          setIsPlaying(false);
        },
    };

    try {
      if (youtubePlayerRef.current.isReady()) {
        await youtubePlayerRef.current.loadVideo(videoId, true);
        youtubePlayerRef.current.setVolume(volumeRef.current);
      } else {
        await youtubePlayerRef.current.createPlayer(element, videoId, true, callbacks);
      }
    } catch (error) {
      setYoutubeError(-1);
      throw error;
    }
  }, []);

  const stopYoutube = useCallback(() => {
    youtubePlayerRef.current.stop();
    setYoutubeVideoId(null);
    setYoutubeThumbnail(null);
    setCurrentlyPlaying(null);
    setIsPlaying(false);
  }, []);

  const playSpotify = useCallback(async (track: Track, spotifyTrack: any) => {
    if (!spotifyDeviceId) {
      console.error('No Spotify device available');
      return;
    }
    
    setCurrentTrack(track);
    setCurrentlyPlaying(track?.id ?? null);
    setPlaybackSource('spotify');
    setPreviewUrl(null);
    setYoutubeVideoId(null);
    
    try {
      await spotifyService.startPlayback(spotifyDeviceId, [spotifyTrack.uri]);
      setIsPlaying(true);
    } catch (error) {
      console.error('Failed to start Spotify playback:', error);
      setIsPlaying(false);
    }
  }, [spotifyDeviceId]);

  const stopSpotify = useCallback(() => {
    if (spotifyDeviceId) {
      spotifyService.pausePlayback(spotifyDeviceId).catch(console.error);
    }
    spotifyPlayerRef.current.getPlayer()?.pause();
    setCurrentlyPlaying(null);
    setIsPlaying(false);
  }, [spotifyDeviceId]);

  const setCurrentlyPlayingTrack = useCallback((trackId: number) => {
    setCurrentlyPlaying(trackId);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playbackSource === 'youtube') {
      youtubePlayerRef.current.seekTo(seconds);
    } else if (playbackSource === 'spotify' && spotifyDeviceId) {
      spotifyService.seekTo(Math.round(seconds * 1000), spotifyDeviceId).catch(console.error);
    }
  }, [playbackSource, spotifyDeviceId]);

  const getProgress = useCallback(() => {
    if (playbackSource === 'youtube') {
      return {
        current: youtubePlayerRef.current.getCurrentTime(),
        duration: youtubePlayerRef.current.getDuration(),
      };
    } else if (playbackSource === 'spotify' && spotifyPlaybackState) {
      return {
        current: spotifyPlaybackState.position / 1000,
        duration: spotifyPlaybackState.duration / 1000,
      };
    }
    return { current: 0, duration: 0 };
  }, [playbackSource, spotifyPlaybackState]);

  const matchCurrentTrack = useCallback(async () => {
    if (currentTrack) {
      const matched = await trackMatchingService.matchTrack(currentTrack);
      setMatchedTrack(matched);
    }
  }, [currentTrack]);

  const value = {
    // Estado
    currentTrack,
    isPlaying,
    volume,
    queue,
    currentlyPlaying,
    playbackSource,
    previewUrl,
    youtubeVideoId,
    youtubeThumbnail,
    youtubePlayerState,
    youtubeDuration,
    youtubeCurrentTime,
    youtubeError,
    spotifyDeviceId,
    spotifyPlaybackState,
    matchedTrack,
    
    // Ações
    playTrack,
    pauseTrack,
    resumeTrack,
    togglePlayPause,
    setPlayerVolume,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playPreview,
    stopPreview,
    playYoutube,
    initializeYoutubePlayer,
    stopYoutube,
    playSpotify,
    stopSpotify,
    setCurrentlyPlayingTrack,
    setPlaybackSource,
    matchCurrentTrack,
    seekTo,
    getProgress,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
