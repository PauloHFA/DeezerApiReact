import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchArtists, searchTracks, searchAlbums, searchPlaylists, getArtist, getArtistAlbums, getArtistTopTracks, getAlbum, getAlbumTracks, getPlaylist, getTopTracks, getTopPlaylists, getTrackPreview } from '@/services/deezerApi';
import { apiClient } from '@/services/apiClient';

// Mock apiClient
vi.mock('@/services/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('deezerApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('searchArtists', () => {
    it('should search artists with query', async () => {
      const mockResponse = { data: [{ id: 1, name: 'Artist 1' }] };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await searchArtists('test query');

      expect(apiClient.get).toHaveBeenCalledWith('/search/artist', { q: 'test query' });
      expect(result).toEqual(mockResponse);
    });

    it('should handle empty query', async () => {
      const mockResponse = { data: [] };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await searchArtists('');

      expect(apiClient.get).toHaveBeenCalledWith('/search/artist', { q: '' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchTracks', () => {
    it('should search tracks with query', async () => {
      const mockResponse = { data: [{ id: 1, title: 'Track 1' }] };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await searchTracks('test query');

      expect(apiClient.get).toHaveBeenCalledWith('/search/track', { q: 'test query' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchAlbums', () => {
    it('should search albums with query', async () => {
      const mockResponse = { data: [{ id: 1, title: 'Album 1' }] };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await searchAlbums('test query');

      expect(apiClient.get).toHaveBeenCalledWith('/search/album', { q: 'test query' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('searchPlaylists', () => {
    it('should search playlists with query', async () => {
      const mockResponse = { data: [{ id: 1, title: 'Playlist 1' }] };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await searchPlaylists('test query');

      expect(apiClient.get).toHaveBeenCalledWith('/search/playlist', { q: 'test query' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getArtist', () => {
    it('should get artist by ID', async () => {
      const mockArtist = { id: 1, name: 'Artist 1' };
      (apiClient.get as any).mockResolvedValue(mockArtist);

      const result = await getArtist(1);

      expect(apiClient.get).toHaveBeenCalledWith('/artist/1');
      expect(result).toEqual(mockArtist);
    });
  });

  describe('getArtistAlbums', () => {
    it('should get artist albums by ID', async () => {
      const mockResponse = { data: [{ id: 1, title: 'Album 1' }] };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await getArtistAlbums(1);

      expect(apiClient.get).toHaveBeenCalledWith('/artist/1/albums');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getArtistTopTracks', () => {
    it('should get artist top tracks by ID', async () => {
      const mockResponse = { data: [{ id: 1, title: 'Track 1' }] };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await getArtistTopTracks(1);

      expect(apiClient.get).toHaveBeenCalledWith('/artist/1/top', { limit: 10 });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getAlbum', () => {
    it('should get album by ID', async () => {
      const mockAlbum = { id: 1, title: 'Album 1' };
      (apiClient.get as any).mockResolvedValue(mockAlbum);

      const result = await getAlbum(1);

      expect(apiClient.get).toHaveBeenCalledWith('/album/1');
      expect(result).toEqual(mockAlbum);
    });
  });

  describe('getAlbumTracks', () => {
    it('should get album tracks by ID', async () => {
      const mockResponse = { data: [{ id: 1, title: 'Track 1' }] };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await getAlbumTracks(1);

      expect(apiClient.get).toHaveBeenCalledWith('/album/1/tracks');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getPlaylist', () => {
    it('should get playlist by ID', async () => {
      const mockPlaylist = { id: 1, title: 'Playlist 1' };
      (apiClient.get as any).mockResolvedValue(mockPlaylist);

      const result = await getPlaylist(1);

      expect(apiClient.get).toHaveBeenCalledWith('/playlist/1');
      expect(result).toEqual(mockPlaylist);
    });
  });

  describe('getTopTracks', () => {
    it('should get top tracks', async () => {
      const mockResponse = { data: [{ id: 1, title: 'Track 1' }] };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await getTopTracks();

      expect(apiClient.get).toHaveBeenCalledWith('/chart/0/tracks');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTopPlaylists', () => {
    it('should get top playlists', async () => {
      const mockResponse = { data: [{ id: 1, title: 'Playlist 1' }] };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await getTopPlaylists();

      expect(apiClient.get).toHaveBeenCalledWith('/chart/0/playlists');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getTrackPreview', () => {
    it('should get track preview URL', async () => {
      const mockResponse = { preview: 'https://preview.deezer.com/track.mp3' };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await getTrackPreview(1);

      expect(apiClient.get).toHaveBeenCalledWith('/track/1');
      expect(result).toBe('https://preview.deezer.com/track.mp3');
    });

    it('should return null if no preview', async () => {
      const mockResponse = { preview: null };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const result = await getTrackPreview(1);

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors from apiClient', async () => {
      const error = new Error('Network error');
      (apiClient.get as any).mockRejectedValue(error);

      await expect(searchArtists('test')).rejects.toThrow('Network error');
    });
  });
});