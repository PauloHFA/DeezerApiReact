/**
 * YouTube Player API Service
 * Wrapper around YT.Player for programmatic control
 */

export interface YouTubePlayerState {
  videoId: string | null;
  isPlaying: boolean;
  volume: number;
  duration: number;
  currentTime: number;
  playerState: number; // YT.PlayerState enum
}

export interface YouTubePlayerCallbacks {
  onReady?: () => void;
  onStateChange?: (state: number) => void;
  onPlaybackQualityChange?: (quality: string) => void;
  onError?: (error: number) => void;
  onApiChange?: () => void;
}

type YTPlayer = any; // YT.Player type

class YouTubePlayerService {
  private player: YTPlayer | null = null;
  private playerElement: HTMLDivElement | null = null;
  private callbacks: YouTubePlayerCallbacks = {};
  private isApiReady = false;
  private pendingVideoId: string | null = null;
  private pendingAutoplay = false;

  /**
   * Load YouTube IFrame API script
   */
  loadAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.YT && window.YT.Player) {
        this.isApiReady = true;
        resolve();
        return;
      }

      // Check if script is already loading
      const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (existingScript) {
        // Wait for it to load
        const checkReady = setInterval(() => {
          if (window.YT && window.YT.Player) {
            clearInterval(checkReady);
            this.isApiReady = true;
            resolve();
          }
        }, 100);
        return;
      }

      // Load the API script
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onload = () => {
        // YT.Player will be available after onYouTubeIframeAPIReady callback
      };
      tag.onerror = () => reject(new Error('Failed to load YouTube IFrame API'));
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Global callback when API is ready
      (window as any).onYouTubeIframeAPIReady = () => {
        this.isApiReady = true;
        resolve();
        
        // If there was a pending video, create player now
        if (this.pendingVideoId && this.playerElement) {
          this.createPlayer(this.playerElement, this.pendingVideoId, this.pendingAutoplay);
        }
      };
    });
  }

  /**
   * Create YT.Player instance
   */
  createPlayer(
    element: HTMLDivElement,
    videoId: string,
    autoplay = true,
    callbacks: YouTubePlayerCallbacks = {}
  ): Promise<YTPlayer> {
    this.playerElement = element;
    this.callbacks = callbacks;

    if (!this.isApiReady) {
      this.pendingVideoId = videoId;
      this.pendingAutoplay = autoplay;
      return this.loadAPI().then(() => this.createPlayer(element, videoId, autoplay, callbacks));
    }

    return new Promise((resolve, reject) => {
      try {
        this.player = new window.YT.Player(element, {
          videoId,
          playerVars: {
            autoplay: autoplay ? 1 : 0,
            controls: 0, // We'll use our own controls
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            iv_load_policy: 3, // Hide annotations
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              this.player = event.target;
              this.callbacks.onReady?.();
              resolve(this.player);
            },
            onStateChange: (event: any) => {
              this.callbacks.onStateChange?.(event.data);
            },
            onPlaybackQualityChange: (event: any) => {
              this.callbacks.onPlaybackQualityChange?.(event.data);
            },
            onError: (event: any) => {
              this.callbacks.onError?.(event.data);
            },
            onApiChange: (event: any) => {
              this.callbacks.onApiChange?.();
            },
          },
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Load a new video
   */
  loadVideo(videoId: string, autoplay = true): Promise<void> {
    if (!this.player) {
      return Promise.reject(new Error('Player not initialized'));
    }

    return new Promise((resolve) => {
      if (autoplay) {
        this.player.loadVideoById(videoId);
      } else {
        this.player.cueVideoById(videoId);
      }
      // Give it a moment to start loading
      setTimeout(resolve, 100);
    });
  }

  // Playback controls
  play(): void {
    this.player?.playVideo();
  }

  pause(): void {
    this.player?.pauseVideo();
  }

  stop(): void {
    this.player?.stopVideo();
  }

  seekTo(seconds: number, allowSeekAhead = true): void {
    this.player?.seekTo(seconds, allowSeekAhead);
  }

  setVolume(volume: number): void {
    // Volume is 0-100
    this.player?.setVolume(Math.round(volume * 100));
  }

  getVolume(): number {
    return (this.player?.getVolume() || 50) / 100;
  }

  mute(): void {
    this.player?.mute();
  }

  unMute(): void {
    this.player?.unMute();
  }

  isMuted(): boolean {
    return this.player?.isMuted() || false;
  }

  // Getters
  getDuration(): number {
    return this.player?.getDuration() || 0;
  }

  getCurrentTime(): number {
    return this.player?.getCurrentTime() || 0;
  }

  getPlayerState(): number {
    return this.player?.getPlayerState() || -1;
  }

  getVideoUrl(): string {
    return this.player?.getVideoUrl() || '';
  }

  getVideoEmbedCode(): string {
    return this.player?.getVideoEmbedCode() || '';
  }

  // Cleanup
  destroy(): void {
    this.player?.destroy();
    this.player = null;
    this.playerElement = null;
    this.pendingVideoId = null;
    this.pendingAutoplay = false;
  }

  // Check if player exists
  isReady(): boolean {
    return this.player !== null && this.isApiReady;
  }
}

// Singleton instance
export const youtubePlayerService = new YouTubePlayerService();

// YT.PlayerState enum for reference
export const YouTubePlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;