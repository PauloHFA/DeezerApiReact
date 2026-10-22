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
  private callbacks: YouTubePlayerCallbacks = {};
  private isApiReady = false;
  private isPlayerReady = false;
  private playerContainer: HTMLDivElement | null = null;
  private playerReadyPromise: Promise<YTPlayer> | null = null;
  private cancelPlayerCreation: (() => void) | null = null;
  private playerGeneration = 0;
  private pendingVideo: { videoId: string; autoplay: boolean } | null = null;

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
    if (!this.isApiReady) {
      return this.loadAPI().then(() => this.createPlayer(element, videoId, autoplay, callbacks));
    }

    const iframe = this.player?.getIframe?.();
    if (this.playerContainer === element && iframe?.isConnected && element.contains(iframe)) {
      this.callbacks = callbacks;
      this.pendingVideo = { videoId, autoplay };
      if (this.isReady()) {
        return this.loadVideo(videoId, autoplay).then(() => this.player);
      }
      // A second selection while onReady is pending must use the same iframe.
      return this.playerReadyPromise!;
    }

    this.destroy();
    this.callbacks = callbacks;
    this.playerContainer = element;
    this.pendingVideo = { videoId, autoplay };
    const generation = this.playerGeneration;

    // YouTube replaces its target. Keep React's container and replace only a child.
    const mountPoint = document.createElement('div');
    element.replaceChildren(mountPoint);

    this.playerReadyPromise = new Promise((resolve, reject) => {
      this.cancelPlayerCreation = () => resolve(null);
      try {
        this.isPlayerReady = false;
        this.player = new window.YT.Player(mountPoint, {
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
              if (generation !== this.playerGeneration) return;
              this.player = event.target;
              this.isPlayerReady = true;
              this.cancelPlayerCreation = null;
              this.callbacks.onReady?.();
              const pending = this.pendingVideo;
              if (pending && (pending.videoId !== videoId || pending.autoplay !== autoplay)) {
                if (pending.autoplay) this.player.loadVideoById(pending.videoId);
                else this.player.cueVideoById(pending.videoId);
              }
              resolve(this.player);
            },
            onStateChange: (event: any) => {
              if (generation !== this.playerGeneration) return;
              this.callbacks.onStateChange?.(event.data);
            },
            onPlaybackQualityChange: (event: any) => {
              if (generation !== this.playerGeneration) return;
              this.callbacks.onPlaybackQualityChange?.(event.data);
            },
            onError: (event: any) => {
              if (generation !== this.playerGeneration) return;
              this.callbacks.onError?.(event.data);
            },
            onApiChange: (event: any) => {
              if (generation !== this.playerGeneration) return;
              this.callbacks.onApiChange?.();
            },
          },
        });
        const playerIframe = this.player.getIframe?.();
        if (playerIframe) {
          playerIframe.referrerPolicy = 'strict-origin-when-cross-origin';
          playerIframe.style.width = '100%';
          playerIframe.style.height = '100%';
          playerIframe.style.border = '0';
        }
      } catch (error) {
        reject(error);
      }
    });
    return this.playerReadyPromise;
  }

  /**
   * Load a new video
   */
  loadVideo(videoId: string, autoplay = true): Promise<void> {
    if (!this.isReady()) {
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
    this.playerGeneration += 1;
    this.cancelPlayerCreation?.();
    this.cancelPlayerCreation = null;
    this.player?.destroy();
    this.player = null;
    this.isPlayerReady = false;
    this.playerContainer = null;
    this.playerReadyPromise = null;
    this.pendingVideo = null;
    this.callbacks = {};
  }

  // Check if player exists
  isReady(): boolean {
    const iframe = this.player?.getIframe?.();
    return this.player !== null && this.isApiReady && this.isPlayerReady &&
      Boolean(iframe?.isConnected && this.playerContainer?.contains(iframe));
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
