import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayer } from '@/hooks/usePlayer';
import { PlayerProvider } from '@/contexts/PlayerContext';
import type { Track, PlaybackSource } from '@/types';

// Mock dos serviços
vi.mock('@/services/youtubePlayer', () => ({
  youtubePlayerService: {
    loadAPI: vi.fn().mockResolvedValue(undefined),
    createPlayer: vi.fn().mockResolvedValue(undefined),
    play: vi.fn(),
    pause: vi.fn(),
    stop: vi.fn(),
    seekTo: vi.fn(),
    setVolume: vi.fn(),
    getVolume: vi.fn().mockReturnValue(0.5),
    getDuration: vi.fn().mockReturnValue(180),
    getCurrentTime: vi.fn().mockReturnValue(30),
    getPlayerState: vi.fn().mockReturnValue(1),
    isReady: vi.fn().mockReturnValue(true),
    destroy: vi.fn(),
  },
  YouTubePlayerState: {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
  },
}));

vi.mock('@/services/spotifyApi', () => ({
  spotifyService: {
    isAuthenticated: vi.fn().mockReturnValue(false),
    getAccessToken: vi.fn().mockResolvedValue(null),
    startPlayback: vi.fn().mockResolvedValue(undefined),
    pausePlayback: vi.fn().mockResolvedValue(undefined),
    setVolume: vi.fn().mockResolvedValue(undefined),
    seekTo: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/spotifyWebPlayback', () => ({
  spotifyWebPlaybackSDK: {
    initialize: vi.fn().mockResolvedValue('test-device-id'),
    getPlayer: vi.fn().mockReturnValue({
      pause: vi.fn(),
      resume: vi.fn(),
      setVolume: vi.fn(),
    }),
    on: vi.fn(),
    disconnect: vi.fn(),
    isReady: vi.fn().mockReturnValue(false),
  },
}));

vi.mock('@/services/trackMatching', () => ({
  trackMatchingService: {
    matchTrack: vi.fn().mockResolvedValue({
      deezerTrack: null,
      youtubeVideoId: 'yt123',
      youtubeTitle: 'Test Song - Artist',
      spotifyTrack: { id: 'sp123', uri: 'spotify:track:sp123', name: 'Test Song' },
      matchConfidence: 'high',
    }),
  },
}));

// Track mock helper
const createMockTrack = (overrides: Partial<Track> = {}): Track => ({
  id: 1,
  title: 'Test Song',
  duration: 180,
  explicit_lyrics: false,
  preview: 'https://preview.deezer.com/test.mp3',
  artist: {
    id: 1,
    name: 'Test Artist',
    nb_fan: 1000,
    type: 'artist',
  },
  album: {
    id: 1,
    title: 'Test Album',
    nb_tracks: 10,
    release_date: '2023-01-01',
    type: 'album',
  },
  type: 'track',
  ...overrides,
});

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <PlayerProvider>{children}</PlayerProvider>
);

describe('usePlayer Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Default Values (without Provider)', () => {
    it('should provide default values when used outside Provider', () => {
      const { result } = renderHook(() => usePlayer(), {
        wrapper: ({ children }) => <>{children}</>,
      });

      expect(result.current.currentTrack).toBeNull();
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.volume).toBe(0.5);
      expect(result.current.queue).toEqual([]);
      expect(result.current.currentlyPlaying).toBeNull();
      expect(result.current.playbackSource).toBe('deezer');
      expect(result.current.previewUrl).toBeNull();
      expect(result.current.youtubeVideoId).toBeNull();
      expect(result.current.youtubeThumbnail).toBeNull();
      expect(result.current.youtubePlayerState).toBe(-1);
      expect(result.current.youtubeDuration).toBe(0);
      expect(result.current.youtubeCurrentTime).toBe(0);
      expect(result.current.spotifyDeviceId).toBeNull();
      expect(result.current.spotifyPlaybackState).toBeNull();
      expect(result.current.matchedTrack).toBeNull();
    });

    it('should provide no-op functions when used outside Provider', () => {
      const { result } = renderHook(() => usePlayer(), {
        wrapper: ({ children }) => <>{children}</>,
      });

      expect(() => result.current.playTrack(createMockTrack())).not.toThrow();
      expect(() => result.current.pauseTrack()).not.toThrow();
      expect(() => result.current.resumeTrack()).not.toThrow();
      expect(() => result.current.togglePlayPause()).not.toThrow();
      expect(() => result.current.setPlayerVolume(0.8)).not.toThrow();
      expect(() => result.current.addToQueue(createMockTrack())).not.toThrow();
      expect(() => result.current.removeFromQueue(1)).not.toThrow();
      expect(() => result.current.clearQueue()).not.toThrow();
      expect(() => result.current.playNext()).not.toThrow();
      expect(() => result.current.playPreview(createMockTrack())).not.toThrow();
      expect(() => result.current.stopPreview()).not.toThrow();
      expect(() => result.current.playYoutube(createMockTrack(), 'yt123')).not.toThrow();
      expect(() => result.current.stopYoutube()).not.toThrow();
      expect(() => result.current.playSpotify(createMockTrack(), {})).not.toThrow();
      expect(() => result.current.stopSpotify()).not.toThrow();
      expect(() => result.current.setCurrentlyPlayingTrack(1)).not.toThrow();
      expect(() => result.current.setPlaybackSource('youtube')).not.toThrow();
      expect(() => result.current.matchCurrentTrack()).not.toThrow();
      expect(() => result.current.seekTo(30)).not.toThrow();
      expect(result.current.getProgress()).toEqual({ current: 0, duration: 0 });
    });
  });

  describe('With Provider - Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      expect(result.current.currentTrack).toBeNull();
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.volume).toBe(0.5);
      expect(result.current.queue).toEqual([]);
      expect(result.current.currentlyPlaying).toBeNull();
      expect(result.current.playbackSource).toBe('deezer');
      expect(result.current.previewUrl).toBeNull();
      expect(result.current.youtubeVideoId).toBeNull();
      expect(result.current.youtubeThumbnail).toBeNull();
      expect(result.current.youtubePlayerState).toBe(-1);
      expect(result.current.youtubeDuration).toBe(0);
      expect(result.current.youtubeCurrentTime).toBe(0);
      expect(result.current.spotifyDeviceId).toBeNull();
      expect(result.current.spotifyPlaybackState).toBeNull();
      expect(result.current.matchedTrack).toBeNull();
    });
  });

  describe('playTrack', () => {
    it('should set current track and start playing with Deezer source', async () => {
      const track = createMockTrack({ preview: 'https://preview.deezer.com/test.mp3' });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.playTrack(track, 'deezer');
      });

      expect(result.current.currentTrack).toEqual(track);
      expect(result.current.isPlaying).toBe(true);
      expect(result.current.playbackSource).toBe('deezer');
      expect(result.current.currentlyPlaying).toBe(1);
      expect(result.current.previewUrl).toBe('https://preview.deezer.com/test.mp3');
    });

    it('should clear YouTube and Spotify state when playing Deezer', async () => {
      const track = createMockTrack();
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      // First set some YouTube state
      await act(async () => {
        await result.current.playYoutube(track, 'yt123', 'thumb.jpg');
      });

      expect(result.current.youtubeVideoId).toBe('yt123');

      // Then play Deezer track
      await act(async () => {
        await result.current.playTrack(track, 'deezer');
      });

      expect(result.current.youtubeVideoId).toBeNull();
      expect(result.current.playbackSource).toBe('deezer');
    });
  });

  describe('playPreview', () => {
    it('should play preview from track object', async () => {
      const track = createMockTrack({ preview: 'https://preview.deezer.com/test.mp3' });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.playPreview(track);
      });

      expect(result.current.currentTrack).toEqual(track);
      expect(result.current.isPlaying).toBe(true);
      expect(result.current.playbackSource).toBe('deezer');
      expect(result.current.previewUrl).toBe('https://preview.deezer.com/test.mp3');
    });

    it('should play preview from URL string', async () => {
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.playPreview('https://preview.deezer.com/direct.mp3');
      });

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.previewUrl).toBe('https://preview.deezer.com/direct.mp3');
    });

    it('should play preview again when same track is played (context does not auto-stop)', async () => {
      const track = createMockTrack({ preview: 'https://preview.deezer.com/test.mp3' });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      // Start playing
      await act(async () => {
        result.current.playPreview(track);
      });

      expect(result.current.isPlaying).toBe(true);

      // Click same track again - context doesn't auto-stop, it just plays again
      await act(async () => {
        result.current.playPreview(track);
      });

      expect(result.current.isPlaying).toBe(true);
      expect(result.current.previewUrl).toBe('https://preview.deezer.com/test.mp3');
    });
  });

  describe('stopPreview', () => {
    it('should stop preview and reset state', async () => {
      const track = createMockTrack({ preview: 'https://preview.deezer.com/test.mp3' });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.playPreview(track);
      });

      expect(result.current.isPlaying).toBe(true);

      await act(async () => {
        result.current.stopPreview();
      });

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.previewUrl).toBeNull();
      expect(result.current.currentlyPlaying).toBeNull();
    });
  });

  describe('playYoutube', () => {
    it('should set YouTube video and start playing', async () => {
      const track = createMockTrack();
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.playYoutube(track, 'yt123', 'thumb.jpg');
      });

      expect(result.current.currentTrack).toEqual(track);
      expect(result.current.isPlaying).toBe(true);
      expect(result.current.playbackSource).toBe('youtube');
      expect(result.current.youtubeVideoId).toBe('yt123');
      expect(result.current.currentlyPlaying).toBe(1);
    });
  });

  describe('stopYoutube', () => {
    it('should stop YouTube and reset state', async () => {
      const track = createMockTrack();
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.playYoutube(track, 'yt123');
      });

      expect(result.current.youtubeVideoId).toBe('yt123');

      await act(async () => {
        result.current.stopYoutube();
      });

      expect(result.current.youtubeVideoId).toBeNull();
      expect(result.current.isPlaying).toBe(false);
      expect(result.current.currentlyPlaying).toBeNull();
    });
  });

  describe('Volume Control', () => {
    it('should set volume within bounds (0-1)', async () => {
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.setPlayerVolume(0.8);
      });

      expect(result.current.volume).toBe(0.8);

      // Test bounds
      await act(async () => {
        result.current.setPlayerVolume(1.5); // Should clamp to 1
      });
      expect(result.current.volume).toBe(1);

      await act(async () => {
        result.current.setPlayerVolume(-0.5); // Should clamp to 0
      });
      expect(result.current.volume).toBe(0);
    });
  });

  describe('Queue Management', () => {
    it('should add tracks to queue', async () => {
      const track1 = createMockTrack({ id: 1, title: 'Song 1' });
      const track2 = createMockTrack({ id: 2, title: 'Song 2' });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.addToQueue(track1);
        result.current.addToQueue(track2);
      });

      expect(result.current.queue.length).toBe(2);
    });

    it('should remove track from queue', async () => {
      const track1 = createMockTrack({ id: 1, title: 'Song 1' });
      const track2 = createMockTrack({ id: 2, title: 'Song 2' });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.addToQueue(track1);
        result.current.addToQueue(track2);
      });

      expect(result.current.queue.length).toBe(2);

      await act(async () => {
        result.current.removeFromQueue(1);
      });

      expect(result.current.queue.length).toBe(1);
    });

    it('should clear queue', async () => {
      const track1 = createMockTrack({ id: 1 });
      const track2 = createMockTrack({ id: 2 });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.addToQueue(track1);
        result.current.addToQueue(track2);
      });

      expect(result.current.queue.length).toBe(2);

      await act(async () => {
        result.current.clearQueue();
      });

      expect(result.current.queue.length).toBe(0);
    });

    it('should play next track from queue', async () => {
      const track1 = createMockTrack({ id: 1, title: 'Song 1', preview: 'preview1.mp3' });
      const track2 = createMockTrack({ id: 2, title: 'Song 2', preview: 'preview2.mp3' });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.addToQueue(track1);
        result.current.addToQueue(track2);
      });

      expect(result.current.queue.length).toBe(2);

      await act(async () => {
        await result.current.playNext();
      });

      expect(result.current.currentTrack?.title).toBe('Song 1');
      expect(result.current.queue.length).toBe(1);
      expect(result.current.isPlaying).toBe(true);
    });
  });

  describe('Playback Controls', () => {
    it('should toggle play/pause', async () => {
      const track = createMockTrack({ preview: 'preview.mp3' });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.playPreview(track);
      });

      expect(result.current.isPlaying).toBe(true);

      await act(async () => {
        result.current.togglePlayPause();
      });

      expect(result.current.isPlaying).toBe(false);

      await act(async () => {
        result.current.togglePlayPause();
      });

      expect(result.current.isPlaying).toBe(true);
    });

    it('should pause and resume correctly', async () => {
      const track = createMockTrack({ preview: 'preview.mp3' });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.playPreview(track);
      });

      expect(result.current.isPlaying).toBe(true);

      await act(async () => {
        result.current.pauseTrack();
      });

      expect(result.current.isPlaying).toBe(false);

      await act(async () => {
        result.current.resumeTrack();
      });

      expect(result.current.isPlaying).toBe(true);
    });
  });

  describe('Source Switching', () => {
    it('should switch playback source', async () => {
      const track = createMockTrack({ preview: 'preview.mp3' });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.playPreview(track);
      });

      expect(result.current.playbackSource).toBe('deezer');

      await act(async () => {
        result.current.setPlaybackSource('youtube');
      });

      expect(result.current.playbackSource).toBe('youtube');

      await act(async () => {
        result.current.setPlaybackSource('spotify');
      });

      expect(result.current.playbackSource).toBe('spotify');
    });
  });

  describe('Seek', () => {
    it('should call seek on YouTube player', async () => {
      const track = createMockTrack();
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.playYoutube(track, 'yt123');
      });

      await act(async () => {
        result.current.seekTo(45);
      });

      const { youtubePlayerService } = await import('@/services/youtubePlayer');
      expect(youtubePlayerService.seekTo).toHaveBeenCalledWith(45);
    });
  });

  describe('Progress', () => {
    it('should return progress from YouTube when source is youtube', async () => {
      const track = createMockTrack();
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        await result.current.playYoutube(track, 'yt123');
      });

      const progress = result.current.getProgress();
      expect(progress.current).toBe(30);
      expect(progress.duration).toBe(180);
    });

    it('should return zero progress for Deezer preview', async () => {
      const track = createMockTrack({ preview: 'preview.mp3' });
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.playPreview(track);
      });

      const progress = result.current.getProgress();
      expect(progress.current).toBe(0);
      expect(progress.duration).toBe(0);
    });
  });

  describe('matchCurrentTrack', () => {
    it('should match current track and update matchedTrack state', async () => {
      const track = createMockTrack();
      
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.playPreview(track);
      });

      expect(result.current.matchedTrack).toBeNull();

      await act(async () => {
        await result.current.matchCurrentTrack();
      });

      expect(result.current.matchedTrack).not.toBeNull();
      expect(result.current.matchedTrack?.youtubeVideoId).toBe('yt123');
    });
  });

  describe('setCurrentlyPlayingTrack', () => {
    it('should update currentlyPlaying track ID', async () => {
      const { result } = renderHook(() => usePlayer(), {
        wrapper: TestWrapper,
      });

      expect(result.current.currentlyPlaying).toBeNull();

      await act(async () => {
        result.current.setCurrentlyPlayingTrack(42);
      });

      expect(result.current.currentlyPlaying).toBe(42);
    });
  });
});