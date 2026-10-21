import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { youtubePlayerService, YouTubePlayerState } from '@/services/youtubePlayer';

describe('youtubePlayer Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    youtubePlayerService.destroy();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    youtubePlayerService.destroy();
  });

  describe('YouTubePlayerState enum', () => {
    it('should have correct state values', () => {
      expect(YouTubePlayerState.UNSTARTED).toBe(-1);
      expect(YouTubePlayerState.ENDED).toBe(0);
      expect(YouTubePlayerState.PLAYING).toBe(1);
      expect(YouTubePlayerState.PAUSED).toBe(2);
      expect(YouTubePlayerState.BUFFERING).toBe(3);
      expect(YouTubePlayerState.CUED).toBe(5);
    });
  });

  describe('isReady', () => {
    it('should return false when not initialized', () => {
      expect(youtubePlayerService.isReady()).toBe(false);
    });
  });

  describe('loadAPI', () => {
    it('should return a promise', () => {
      const promise = youtubePlayerService.loadAPI();
      expect(promise).toBeInstanceOf(Promise);
    });
  });

  describe('destroy', () => {
    it('should not throw when called without initialization', () => {
      expect(() => youtubePlayerService.destroy()).not.toThrow();
    });
  });

  describe('getVolume', () => {
    it('should return default volume when not initialized', () => {
      const volume = youtubePlayerService.getVolume();
      expect(volume).toBe(0.5); // Default volume
    });
  });

  describe('getDuration', () => {
    it('should return 0 when not initialized', () => {
      const duration = youtubePlayerService.getDuration();
      expect(duration).toBe(0);
    });
  });

  describe('getCurrentTime', () => {
    it('should return 0 when not initialized', () => {
      const currentTime = youtubePlayerService.getCurrentTime();
      expect(currentTime).toBe(0);
    });
  });

  describe('getPlayerState', () => {
    it('should return UNSTARTED when not initialized', () => {
      const state = youtubePlayerService.getPlayerState();
      expect(state).toBe(YouTubePlayerState.UNSTARTED);
    });
  });

  describe('getVideoUrl', () => {
    it('should return empty string when not initialized', () => {
      const url = youtubePlayerService.getVideoUrl();
      expect(url).toBe('');
    });
  });

  describe('getVideoEmbedCode', () => {
    it('should return empty string when not initialized', () => {
      const embedCode = youtubePlayerService.getVideoEmbedCode();
      expect(embedCode).toBe('');
    });
  });

  describe('play/pause/stop', () => {
    it('should not throw when called without initialization', () => {
      expect(() => youtubePlayerService.play()).not.toThrow();
      expect(() => youtubePlayerService.pause()).not.toThrow();
      expect(() => youtubePlayerService.stop()).not.toThrow();
    });
  });

  describe('seekTo', () => {
    it('should not throw when called without initialization', () => {
      expect(() => youtubePlayerService.seekTo(45)).not.toThrow();
    });
  });

  describe('setVolume', () => {
    it('should not throw when called without initialization', () => {
      expect(() => youtubePlayerService.setVolume(0.8)).not.toThrow();
    });
  });

  describe('mute/unMute', () => {
    it('should not throw when called without initialization', () => {
      expect(() => youtubePlayerService.mute()).not.toThrow();
      expect(() => youtubePlayerService.unMute()).not.toThrow();
    });
  });

  describe('isMuted', () => {
    it('should return false when not initialized', () => {
      const isMuted = youtubePlayerService.isMuted();
      expect(isMuted).toBe(false);
    });
  });

  describe('loadVideo', () => {
      it('should reject when called without initialization', async () => {
        await expect(youtubePlayerService.loadVideo('test-id', true)).rejects.toThrow('Player not initialized');
    });
  });

  describe('createPlayer', () => {
    it('should return a promise', () => {
      const container = document.createElement('div');
      const promise = youtubePlayerService.createPlayer(container, 'test-id');
      expect(promise).toBeInstanceOf(Promise);
    });
  });
});