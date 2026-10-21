/**
 * Spotify Web Playback SDK Service
 * Enables streaming full tracks in the browser (requires Premium)
 */

export interface SpotifyPlayerInstance {
  connect(): Promise<boolean>;
  disconnect(): void;
  getCurrentState(): Promise<SpotifyPlaybackState | null>;
  getVolume(): Promise<number>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(positionMs: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
  addListener(event: string, callback: (...args: any[]) => void): void;
  removeListener(event: string, callback?: (...args: any[]) => void): void;
}

export interface SpotifyPlaybackState {
  context: {
    uri: string;
    metadata: any;
  } | null;
  disallows: {
    pausing: boolean;
    resuming: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
    seeking: boolean;
  };
  duration: number;
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyTrack;
    next_tracks: SpotifyTrack[];
    previous_tracks: SpotifyTrack[];
  };
}

export interface SpotifyTrack {
  id: string | null;
  uri: string;
  type: 'track' | 'episode' | 'ad';
  media_type: 'audio' | 'video';
  name: string;
  is_playable: boolean;
  album: {
    uri: string;
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  artists: Array<{ uri: string; name: string }>;
  duration_ms: number;
  linked_from: any;
}

class SpotifyWebPlaybackSDK {
  private player: SpotifyPlayerInstance | null = null;
  private deviceId: string | null = null;
  private accessToken: string | null = null;
  private isReady = false;
  private listeners: Map<string, Set<Function>> = new Map();
  private scriptLoaded = false;

  /**
   * Load Spotify Web Playback SDK script
   */
  loadSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.scriptLoaded && window.Spotify) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src*="spotify.com/spotify-player"]');
      if (existingScript) {
        const checkReady = setInterval(() => {
          if (window.Spotify) {
            clearInterval(checkReady);
            this.scriptLoaded = true;
            resolve();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Failed to load Spotify Web Playback SDK'));
      
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize the player with access token
   */
  async initialize(accessToken: string): Promise<string> {
    this.accessToken = accessToken;
    await this.loadSDK();

    return new Promise((resolve, reject) => {
      if (!window.Spotify) {
        reject(new Error('Spotify SDK not loaded'));
        return;
      }

      this.player = new window.Spotify.Player({
        name: 'PH Music Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(this.accessToken!);
        },
        volume: 0.5,
      });

      // Error handling
      this.player.addListener('initialization_error', ({ message }: any) => {
        console.error('Spotify Player initialization error:', message);
        this.emit('error', new Error(message));
      });

      this.player.addListener('authentication_error', ({ message }: any) => {
        console.error('Spotify Player authentication error:', message);
        this.emit('auth_error', new Error(message));
      });

      this.player.addListener('account_error', ({ message }: any) => {
        console.error('Spotify Player account error:', message);
        this.emit('account_error', new Error(message));
      });

      this.player.addListener('playback_error', ({ message }: any) => {
        console.error('Spotify Player playback error:', message);
        this.emit('playback_error', new Error(message));
      });

      // Ready
      this.player.addListener('ready', ({ device_id }: any) => {
        console.log('Spotify Player ready with device ID:', device_id);
        this.deviceId = device_id;
        this.isReady = true;
        this.emit('ready', device_id);
        resolve(device_id);
      });

      // Not ready
      this.player.addListener('not_ready', ({ device_id }: any) => {
        console.log('Spotify Player not ready:', device_id);
        this.isReady = false;
        this.emit('not_ready', device_id);
      });

      // State changes
      this.player.addListener('player_state_changed', (state: SpotifyPlaybackState | null) => {
        if (state) {
          this.emit('state_changed', state);
        }
      });

      // Connect
      this.player.connect().then((success: boolean) => {
        if (!success) {
          reject(new Error('Failed to connect to Spotify Player'));
        }
      }).catch(reject);
    });
  }

  /**
   * Get the current player instance
   */
  getPlayer(): SpotifyPlayerInstance | null {
    return this.player;
  }

  /**
   * Get device ID
   */
  getDeviceId(): string | null {
    return this.deviceId;
  }

  /**
   * Check if player is ready
   */
  isPlayerReady(): boolean {
    return this.isReady && this.player !== null;
  }

  /**
   * Play a track/album/playlist by URI
   */
  async play(uris: string[]): Promise<void> {
    if (!this.player) {
      throw new Error('Player not initialized');
    }
    // The Web Playback SDK doesn't have a direct play(uris) method
    // We need to use the Spotify API to start playback on this device
    // This is handled by the main Spotify service
    throw new Error('Use spotifyService.startPlayback with deviceId');
  }

  /**
   * Event emitter methods
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback?: Function): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, ...args: any[]): void {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.player?.disconnect();
    this.player = null;
    this.deviceId = null;
    this.isReady = false;
    this.accessToken = null;
    this.listeners.clear();
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayerInstance;
    };
  }
}

// Singleton instance
export const spotifyWebPlaybackSDK = new SpotifyWebPlaybackSDK();