import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('spotifyApi Service', () => {
  let SpotifyServiceClass: any;
  let spotifyService: any;

  // Helper to create a fresh service instance with optional pre-set tokens
  const createService = async (withTokens = false) => {
    vi.resetModules();
    vi.clearAllMocks();
    
    // Mock environment variables
    vi.stubEnv('VITE_SPOTIFY_CLIENT_ID', 'test-client-id');
    vi.stubEnv('VITE_SPOTIFY_CLIENT_SECRET', 'test-client-secret');
    vi.stubEnv('VITE_SPOTIFY_REDIRECT_URI', 'http://localhost:5173/callback');
    
    // Mock fetch
    global.fetch = vi.fn();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    if (withTokens) {
      // Set up sessionStorage BEFORE importing the module
      sessionStorage.setItem('spotify_access_token', 'stored-token');
      sessionStorage.setItem('spotify_token_expiry', String(Date.now() + 3600000));
      sessionStorage.setItem('spotify_refresh_token', 'test-refresh-token');
    }
    
    // Dynamically import the module
    const module = await import('@/services/spotifyApi');
    SpotifyServiceClass = module.SpotifyService;
    spotifyService = module.spotifyService;
    return spotifyService;
  };

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  describe('Initialization (without stored tokens)', () => {
    beforeEach(async () => {
      await createService(false);
    });

    it('should initialize with environment variables', () => {
      expect(spotifyService).toBeDefined();
    });

    it('should not be authenticated initially', () => {
      expect(spotifyService.isAuthenticated()).toBe(false);
    });
  });

  describe('Initialization (with stored tokens)', () => {
    beforeEach(async () => {
      await createService(true);
    });

    it('should be authenticated when tokens exist in sessionStorage', () => {
      expect(spotifyService.isAuthenticated()).toBe(true);
    });

    it('should return access token when authenticated', async () => {
      const token = await spotifyService.getAccessToken();
      expect(token).toBe('stored-token');
    });
  });

  describe('PKCE Code Generation', () => {
    beforeEach(async () => {
      await createService(false);
    });

    it('should generate code verifier', () => {
      // Access private method through reflection for testing
      const service = spotifyService;
      const verifier = service.generateCodeVerifier();
      
      expect(verifier).toBeDefined();
      expect(typeof verifier).toBe('string');
      expect(verifier.length).toBeGreaterThan(0);
    });

    it('should generate code challenge from verifier', async () => {
      const service = spotifyService;
      const verifier = 'test-verifier';
      const challenge = await service.generateCodeChallenge(verifier);
      
      expect(challenge).toBeDefined();
      expect(typeof challenge).toBe('string');
      expect(challenge.length).toBeGreaterThan(0);
    });
  });

  describe('getAuthUrl', () => {
    beforeEach(async () => {
      await createService(false);
    });

    it('should generate auth URL with correct parameters', async () => {
      const authUrl = await spotifyService.getAuthUrl();
      
      expect(authUrl).toContain('https://accounts.spotify.com/authorize');
      expect(authUrl).toContain('client_id=test-client-id');
      expect(authUrl).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fcallback');
      expect(authUrl).toContain('response_type=code');
      expect(authUrl).toContain('code_challenge_method=S256');
      expect(authUrl).toContain('code_challenge=');
      expect(authUrl).toContain('state=');
      expect(authUrl).toContain('scope=');
      expect(authUrl).toContain('show_dialog=true');
    });

    it('should store state and code verifier in sessionStorage', async () => {
      await spotifyService.getAuthUrl();
      
      expect(sessionStorage.getItem('spotify_auth_state')).toBeDefined();
      expect(sessionStorage.getItem('spotify_code_verifier')).toBeDefined();
    });
  });

  describe('handleCallback', () => {
    beforeEach(async () => {
      await createService(false);
    });

    it('should reject when state does not match', async () => {
      sessionStorage.setItem('spotify_auth_state', 'correct-state');
      sessionStorage.setItem('spotify_code_verifier', 'test-verifier');
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ access_token: 'token', expires_in: 3600 }),
      });
      
      await expect(spotifyService.handleCallback('test-code', 'wrong-state'))
        .rejects.toThrow('Invalid state parameter');
    });

    it('should reject when code verifier is missing', async () => {
      sessionStorage.setItem('spotify_auth_state', 'test-state');
      // No code verifier stored
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ access_token: 'token', expires_in: 3600 }),
      });
      
      await expect(spotifyService.handleCallback('test-code', 'test-state'))
        .rejects.toThrow('Missing code verifier');
    });

    it('should exchange code for tokens', async () => {
      sessionStorage.setItem('spotify_auth_state', 'test-state');
      sessionStorage.setItem('spotify_code_verifier', 'test-verifier');
      
      const mockTokens = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        scope: 'streaming user-read-email',
      };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokens),
      });
      
      const tokens = await spotifyService.handleCallback('test-code', 'test-state');
      
      expect(tokens).toEqual(mockTokens);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      );
    });

    it('should store tokens after successful callback', async () => {
      sessionStorage.setItem('spotify_auth_state', 'test-state');
      sessionStorage.setItem('spotify_code_verifier', 'test-verifier');
      
      const mockTokens = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        scope: 'streaming user-read-email',
      };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokens),
      });
      
      await spotifyService.handleCallback('test-code', 'test-state');
      
      expect(sessionStorage.getItem('spotify_access_token')).toBe('test-access-token');
      expect(sessionStorage.getItem('spotify_refresh_token')).toBe('test-refresh-token');
      expect(sessionStorage.getItem('spotify_token_expiry')).toBeDefined();
    });

    it('should clean up sessionStorage after callback', async () => {
      sessionStorage.setItem('spotify_auth_state', 'test-state');
      sessionStorage.setItem('spotify_code_verifier', 'test-verifier');
      
      const mockTokens = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: 'test-refresh-token',
        scope: 'streaming user-read-email',
      };
      
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTokens),
      });
      
      await spotifyService.handleCallback('test-code', 'test-state');
      
      expect(sessionStorage.getItem('spotify_auth_state')).toBeNull();
      expect(sessionStorage.getItem('spotify_code_verifier')).toBeNull();
    });
  });

  describe('Token Management', () => {
    beforeEach(async () => {
      await createService(false);
    });

    it('should return null when not authenticated', async () => {
      const token = await spotifyService.getAccessToken();
      expect(token).toBeNull();
    });

    it('should return access token when authenticated', async () => {
      await createService(true);
      const token = await spotifyService.getAccessToken();
      expect(token).toBe('stored-token');
    });

    it('should return null when token is expired', async () => {
      await createService(false);
      sessionStorage.setItem('spotify_access_token', 'expired-token');
      sessionStorage.setItem('spotify_token_expiry', String(Date.now() - 1000));
      
      const token = await spotifyService.getAccessToken();
      expect(token).toBeNull();
    });

    it('should clear tokens', () => {
      sessionStorage.setItem('spotify_access_token', 'token');
      sessionStorage.setItem('spotify_refresh_token', 'refresh');
      sessionStorage.setItem('spotify_token_expiry', String(Date.now() + 3600000));
      
      spotifyService.clearTokens();
      
      expect(sessionStorage.getItem('spotify_access_token')).toBeNull();
      expect(sessionStorage.getItem('spotify_refresh_token')).toBeNull();
      expect(sessionStorage.getItem('spotify_token_expiry')).toBeNull();
    });
  });

  describe('API Requests', () => {
    beforeEach(async () => {
      await createService(true);
    });

    it('should make authenticated requests', async () => {
      const mockResponse = { id: 'user1', display_name: 'Test User' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      
      const result = await spotifyService.getCurrentUser();
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/me',
        expect.objectContaining({
          headers: {
                Authorization: 'Bearer stored-token',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should handle 401 and attempt token refresh', async () => {
      // First call returns 401
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { message: 'Token expired' } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ access_token: 'new-token', expires_in: 3600 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'user1' }),
        });
      
      sessionStorage.setItem('spotify_refresh_token', 'refresh-token');
      
      const result = await spotifyService.getCurrentUser();
      
      expect(result).toEqual({ id: 'user1' });
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should clear tokens on refresh failure', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ error: { message: 'Token expired' } }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: { message: 'Invalid refresh token' } }),
        });
      
      sessionStorage.setItem('spotify_refresh_token', 'refresh-token');
      
          await expect(spotifyService.getCurrentUser()).rejects.toThrow('Token refresh failed');
      expect(sessionStorage.getItem('spotify_access_token')).toBeNull();
    });
  });

  describe('Search', () => {
    beforeEach(async () => {
      await createService(true);
    });

    it('should search tracks', async () => {
      const mockResponse = { tracks: { items: [{ id: '1', name: 'Track 1' }], total: 1, next: null } };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
      
      const result = await spotifyService.searchTracks('test query', 20, 0);
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/search?q=test+query&type=track&limit=20&offset=0',
            expect.objectContaining({
              headers: {
                Authorization: 'Bearer stored-token',
                'Content-Type': 'application/json',
              },
            })
          );
        });
  });

  describe('Playback Control', () => {
    beforeEach(async () => {
      await createService(true);
    });

    it('should start playback', async () => {
          global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      
      await spotifyService.startPlayback('device-1', ['spotify:track:1'], 0);
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/me/player/play?device_id=device-1',
        expect.objectContaining({
          method: 'PUT',
              headers: {
                Authorization: 'Bearer stored-token',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ uris: ['spotify:track:1'], position_ms: 0 }),
            })
          );
        });

        it('should pause playback', async () => {
          global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      
          await spotifyService.pausePlayback('device-1');
      
          expect(global.fetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/pause?device_id=device-1',
            expect.objectContaining({ 
              method: 'PUT',
              headers: {
                Authorization: 'Bearer stored-token',
                'Content-Type': 'application/json',
              },
            })
          );
        });

        it('should skip to next track', async () => {
          global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      
          await spotifyService.nextTrack('device-1');
      
          expect(global.fetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/next?device_id=device-1',
            expect.objectContaining({ 
              method: 'POST',
              headers: {
                Authorization: 'Bearer stored-token',
                'Content-Type': 'application/json',
              },
            })
          );
        });

        it('should skip to previous track', async () => {
          global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      
          await spotifyService.previousTrack('device-1');
      
          expect(global.fetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/previous?device_id=device-1',
            expect.objectContaining({ 
              method: 'POST',
              headers: {
                Authorization: 'Bearer stored-token',
                'Content-Type': 'application/json',
              },
            })
      );
    });

        it('should set volume', async () => {
          global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      
          await spotifyService.setVolume(50, 'device-1');
      
          expect(global.fetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/volume?volume_percent=50&device_id=device-1',
            expect.objectContaining({ 
              method: 'PUT',
              headers: {
                Authorization: 'Bearer stored-token',
                'Content-Type': 'application/json',
              },
            })
          );
        });

        it('should seek to position', async () => {
          global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
      
          await spotifyService.seekTo(30000, 'device-1');
      
          expect(global.fetch).toHaveBeenCalledWith(
            'https://api.spotify.com/v1/me/player/seek?position_ms=30000&device_id=device-1',
            expect.objectContaining({ 
              method: 'PUT',
              headers: {
                Authorization: 'Bearer stored-token',
                'Content-Type': 'application/json',
              },
            })
          );
        });

        it('should return null for 204 (nothing playing)', async () => {
          global.fetch = vi.fn().mockResolvedValue({ 
            ok: true, 
            status: 204,
            json: () => Promise.resolve({}) 
          });
      
          const result = await spotifyService.getCurrentlyPlaying();
      
          expect(result).toBeNull();
        });
      });
    });