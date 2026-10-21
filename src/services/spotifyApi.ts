/**
 * Spotify API Service
 * Handles authentication (PKCE), track search, and Web Playback SDK
 */

import { apiClient } from './apiClient';

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ id: string; name: string }>;
  album: {
    id: string;
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
    release_date: string;
  };
  duration_ms: number;
  preview_url: string | null;
  uri: string;
  external_urls: { spotify: string };
  popularity: number;
  explicit: boolean;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    next: string | null;
  };
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string | null;
  email: string;
  images: Array<{ url: string }>;
  product: string; // 'premium', 'free', etc.
}

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
].join(' ');

class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;
  private codeVerifier: string | null = null;

  constructor() {
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    this.clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '';
    this.redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback';
    
    // Try to restore tokens from sessionStorage
    this.restoreTokens();
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Get authorization URL for PKCE flow
   */
  async getAuthUrl(): Promise<string> {
    this.codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);
    const state = crypto.randomUUID();

    // Store state and verifier for callback validation
    sessionStorage.setItem('spotify_auth_state', state);
    sessionStorage.setItem('spotify_code_verifier', this.codeVerifier);

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state,
      show_dialog: 'true',
    });

    return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback - exchange code for tokens
   */
  async handleCallback(code: string, state: string): Promise<SpotifyTokenResponse> {
    const storedState = sessionStorage.getItem('spotify_auth_state');
    const codeVerifier = sessionStorage.getItem('spotify_code_verifier');

    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    if (!codeVerifier) {
      throw new Error('Missing code verifier');
    }

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: codeVerifier,
    });

    // Use client secret if available (confidential client)
    if (this.clientSecret) {
      params.append('client_secret', this.clientSecret);
    }

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Token exchange failed: ${error.error_description || error.error}`);
    }

    const tokens = await response.json();
    this.storeTokens(tokens);
    
    // Clean up
    sessionStorage.removeItem('spotify_auth_state');
    sessionStorage.removeItem('spotify_code_verifier');

    return tokens;
  }

  /**
   * Store tokens in memory and sessionStorage
   */
  private storeTokens(tokens: SpotifyTokenResponse): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token || null;
    this.tokenExpiry = Date.now() + tokens.expires_in * 1000;

    sessionStorage.setItem('spotify_access_token', this.accessToken);
    if (this.refreshToken) {
      sessionStorage.setItem('spotify_refresh_token', this.refreshToken);
    }
    sessionStorage.setItem('spotify_token_expiry', this.tokenExpiry.toString());
  }

  /**
   * Restore tokens from sessionStorage
   */
  private restoreTokens(): void {
    this.accessToken = sessionStorage.getItem('spotify_access_token');
    this.refreshToken = sessionStorage.getItem('spotify_refresh_token');
    const expiry = sessionStorage.getItem('spotify_token_expiry');
    this.tokenExpiry = expiry ? parseInt(expiry, 10) : 0;
  }

  /**
   * Get valid access token, refreshing if needed
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.accessToken) {
      return null;
    }

    // Check if token is expired (with 30s buffer)
    if (Date.now() >= this.tokenExpiry - 30000) {
      if (this.refreshToken) {
        await this.refreshAccessToken();
      } else {
        // No refresh token, need re-auth
        this.clearTokens();
        return null;
      }
    }

    return this.accessToken;
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId,
    });

    if (this.clientSecret) {
      params.append('client_secret', this.clientSecret);
    }

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const tokens = await response.json();
    this.storeTokens({
      ...tokens,
      refresh_token: tokens.refresh_token || this.refreshToken,
    });
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;
    sessionStorage.removeItem('spotify_access_token');
    sessionStorage.removeItem('spotify_refresh_token');
    sessionStorage.removeItem('spotify_token_expiry');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpiry;
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token might be expired, try refresh once
      if (this.refreshToken) {
        await this.refreshAccessToken();
        return this.apiRequest(endpoint, options);
      }
      this.clearTokens();
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Spotify API error: ${error.error?.message || response.statusText}`);
    }

    if (response.status === 204) {
          throw new Error('204 No Content');
    }

    return response.json();
  }

  // ============ API Methods ============

  /**
   * Get current user's profile
   */
  async getCurrentUser(): Promise<SpotifyUserProfile> {
    return this.apiRequest<SpotifyUserProfile>('/me');
  }

  /**
   * Search for tracks
   */
  async searchTracks(query: string, limit = 20, offset = 0): Promise<SpotifySearchResponse> {
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return this.apiRequest<SpotifySearchResponse>(`/search?${params.toString()}`);
  }

  /**
   * Get track by ID
   */
  async getTrack(id: string): Promise<SpotifyTrack> {
    return this.apiRequest<SpotifyTrack>(`/tracks/${id}`);
  }

  /**
   * Get multiple tracks by IDs
   */
  async getTracks(ids: string[]): Promise<{ tracks: SpotifyTrack[] }> {
    const params = new URLSearchParams({
      ids: ids.join(','),
    });
    return this.apiRequest<{ tracks: SpotifyTrack[] }>(`/tracks?${params.toString()}`);
  }

  /**
   * Get user's available devices for Web Playback SDK
   */
  async getDevices(): Promise<{ devices: SpotifyDevice[] }> {
    return this.apiRequest<{ devices: SpotifyDevice[] }>('/me/player/devices');
  }

  /**
   * Start/resume playback on a device
   */
  async startPlayback(deviceId?: string, uris?: string[], positionMs?: number): Promise<void> {
    const body: any = {};
    if (uris) body.uris = uris;
    if (positionMs !== undefined) body.position_ms = positionMs;

    const endpoint = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play';
    await this.apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * Pause playback
   */
  async pausePlayback(deviceId?: string): Promise<void> {
    const endpoint = deviceId ? `/me/player/pause?device_id=${deviceId}` : '/me/player/pause';
    await this.apiRequest(endpoint, { method: 'PUT' });
  }

  /**
   * Skip to next track
   */
  async nextTrack(deviceId?: string): Promise<void> {
    const endpoint = deviceId ? `/me/player/next?device_id=${deviceId}` : '/me/player/next';
    await this.apiRequest(endpoint, { method: 'POST' });
  }

  /**
   * Skip to previous track
   */
  async previousTrack(deviceId?: string): Promise<void> {
    const endpoint = deviceId ? `/me/player/previous?device_id=${deviceId}` : '/me/player/previous';
    await this.apiRequest(endpoint, { method: 'POST' });
  }

  /**
   * Set volume (0-100)
   */
  async setVolume(volumePercent: number, deviceId?: string): Promise<void> {
    const endpoint = deviceId 
      ? `/me/player/volume?volume_percent=${volumePercent}&device_id=${deviceId}`
      : `/me/player/volume?volume_percent=${volumePercent}`;
    await this.apiRequest(endpoint, { method: 'PUT' });
  }

  /**
   * Seek to position
   */
  async seekTo(positionMs: number, deviceId?: string): Promise<void> {
    const endpoint = deviceId 
      ? `/me/player/seek?position_ms=${positionMs}&device_id=${deviceId}`
      : `/me/player/seek?position_ms=${positionMs}`;
    await this.apiRequest(endpoint, { method: 'PUT' });
  }

  /**
   * Get currently playing track
   */
  async getCurrentlyPlaying(): Promise<SpotifyCurrentlyPlaying | null> {
    try {
      return await this.apiRequest<SpotifyCurrentlyPlaying>('/me/player/currently-playing');
    } catch (error) {
      if ((error as Error).message.includes('204')) {
        return null; // Nothing playing
      }
      throw error;
    }
  }
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
  supports_volume: boolean;
}

export interface SpotifyCurrentlyPlaying {
  timestamp: number;
  context: any;
  progress_ms: number;
  item: SpotifyTrack | null;
  currently_playing_type: 'track' | 'episode' | 'ad';
  actions: {
    disallows: {
      pausing: boolean;
      resuming: boolean;
      skipping_next: boolean;
      skipping_prev: boolean;
      seeking: boolean;
    };
  };
  is_playing: boolean;
}

// Singleton instance
export const spotifyService = new SpotifyService();
export { SpotifyService };