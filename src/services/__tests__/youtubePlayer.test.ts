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

  describe('iframe lifecycle', () => {
    const instances: { player: any; options: any; iframe: HTMLIFrameElement }[] = [];
    let container: HTMLDivElement;
    let originalPlayerImplementation: any;

    beforeEach(async () => {
      instances.length = 0;
      container = document.createElement('div');
      document.body.append(container);
      originalPlayerImplementation = vi.mocked(window.YT.Player).getMockImplementation();
      vi.mocked(window.YT.Player).mockImplementation(function (target: HTMLElement, options: any) {
        const iframe = document.createElement('iframe');
        target.replaceWith(iframe);
        const player = {
          getIframe: () => iframe,
          loadVideoById: vi.fn(),
          cueVideoById: vi.fn(),
          destroy: vi.fn(() => iframe.remove()),
        };
        instances.push({ player, options, iframe });
        return player;
      });
      await youtubePlayerService.loadAPI();
    });

    afterEach(() => {
      youtubePlayerService.destroy();
      container.remove();
      vi.mocked(window.YT.Player).mockImplementation(originalPlayerImplementation);
    });

    const ready = (index = 0) => {
      const instance = instances[index];
      instance.options.events.onReady({ target: instance.player });
    };

    it('keeps the React container mounted when YouTube replaces its target', async () => {
      const pending = youtubePlayerService.createPlayer(container, 'first-video');
      expect(container.isConnected).toBe(true);
      expect(container.contains(instances[0].iframe)).toBe(true);
      expect(instances[0].iframe.referrerPolicy).toBe('strict-origin-when-cross-origin');
      ready();
      await pending;
      expect(youtubePlayerService.isReady()).toBe(true);
    });

    it('reuses a ready iframe for a second song and refreshes its callbacks', async () => {
      const oldError = vi.fn();
      const newError = vi.fn();
      const first = youtubePlayerService.createPlayer(container, 'first-video', true, { onError: oldError });
      ready();
      await first;
      await youtubePlayerService.createPlayer(container, 'second-video', true, { onError: newError });
      expect(instances).toHaveLength(1);
      expect(instances[0].player.loadVideoById).toHaveBeenCalledWith('second-video');
      instances[0].options.events.onError({ data: 150 });
      expect(newError).toHaveBeenCalledWith(150);
      expect(oldError).not.toHaveBeenCalled();
    });

    it('loads only the latest selection when songs change before onReady', async () => {
      const first = youtubePlayerService.createPlayer(container, 'first-video');
      const second = youtubePlayerService.createPlayer(container, 'second-video');
      const third = youtubePlayerService.createPlayer(container, 'third-video');
      expect(instances).toHaveLength(1);
      ready();
      await Promise.all([first, second, third]);
      expect(instances[0].player.loadVideoById).toHaveBeenCalledExactlyOnceWith('third-video');
    });

    it('recreates the player after React removes its previous container', async () => {
      const first = youtubePlayerService.createPlayer(container, 'first-video');
      ready();
      await first;
      container.remove();
      expect(youtubePlayerService.isReady()).toBe(false);
      container = document.createElement('div');
      document.body.append(container);
      const second = youtubePlayerService.createPlayer(container, 'second-video');
      ready(1);
      await second;
      expect(instances).toHaveLength(2);
      expect(instances[0].player.destroy).toHaveBeenCalledOnce();
      expect(container.contains(instances[1].iframe)).toBe(true);
    });

    it('ignores events from an iframe destroyed during initialization', async () => {
      const oldError = vi.fn();
      const first = youtubePlayerService.createPlayer(container, 'first-video', true, { onError: oldError });
      youtubePlayerService.destroy();
      await first;
      const currentError = vi.fn();
      const second = youtubePlayerService.createPlayer(container, 'second-video', true, { onError: currentError });
      ready();
      instances[0].options.events.onError({ data: 150 });
      expect(youtubePlayerService.isReady()).toBe(false);
      expect(oldError).not.toHaveBeenCalled();
      expect(currentError).not.toHaveBeenCalled();
      ready(1);
      await second;
      expect(youtubePlayerService.isReady()).toBe(true);
    });
  });
});
