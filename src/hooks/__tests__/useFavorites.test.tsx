import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '@/hooks/useFavorites';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useFavorites Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with empty favorites from localStorage', () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual({
        artists: [],
        albums: [],
        playlists: [],
        tracks: [],
      });
    });

    it('should load favorites from localStorage if available', () => {
      const storedFavorites = {
        artists: [{ id: 1, name: 'Artist 1' }],
        albums: [{ id: 1, title: 'Album 1' }],
        playlists: [{ id: 1, title: 'Playlist 1' }],
        tracks: [{ id: 1, title: 'Track 1' }],
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedFavorites));

      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual(storedFavorites);
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => useFavorites());

      expect(result.current.favorites).toEqual({
        artists: [],
        albums: [],
        playlists: [],
        tracks: [],
      });
    });
  });

  describe('addFavorite', () => {
    it('should add artist to favorites', async () => {
      const { result } = renderHook(() => useFavorites());

      let added: boolean = false;
      await act(async () => {
        added = result.current.addFavorite('artists', { id: 1, name: 'Artist 1' });
      });

      expect(added).toBe(true);
      expect(result.current.favorites.artists).toHaveLength(1);
      expect(result.current.favorites.artists[0]).toEqual({ id: 1, name: 'Artist 1' });
    });

    it('should add album to favorites', async () => {
      const { result } = renderHook(() => useFavorites());

      let added: boolean = false;
      await act(async () => {
        added = result.current.addFavorite('albums', { id: 1, title: 'Album 1' });
      });

      expect(added).toBe(true);
      expect(result.current.favorites.albums).toHaveLength(1);
    });

    it('should add playlist to favorites', async () => {
      const { result } = renderHook(() => useFavorites());

      let added: boolean = false;
      await act(async () => {
        added = result.current.addFavorite('playlists', { id: 1, title: 'Playlist 1' });
      });

      expect(added).toBe(true);
      expect(result.current.favorites.playlists).toHaveLength(1);
    });

    it('should add track to favorites', async () => {
      const { result } = renderHook(() => useFavorites());

      let added: boolean = false;
      await act(async () => {
        added = result.current.addFavorite('tracks', { id: 1, title: 'Track 1' });
      });

      expect(added).toBe(true);
      expect(result.current.favorites.tracks).toHaveLength(1);
    });

    it('should not add duplicate favorite', async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        result.current.addFavorite('artists', { id: 1, name: 'Artist 1' });
      });

      let added: boolean = false;
      await act(async () => {
        added = result.current.addFavorite('artists', { id: 1, name: 'Artist 1' });
      });

      expect(added).toBe(false);
      expect(result.current.favorites.artists).toHaveLength(1);
    });

    it('should return false for invalid type', async () => {
      const { result } = renderHook(() => useFavorites());

      let added: boolean = false;
      await act(async () => {
        added = result.current.addFavorite('invalid' as any, { id: 1 });
      });

      expect(added).toBe(false);
    });
  });

  describe('removeFavorite', () => {
    it('should remove artist from favorites', async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        result.current.addFavorite('artists', { id: 1, name: 'Artist 1' });
        result.current.addFavorite('artists', { id: 2, name: 'Artist 2' });
      });

      await act(async () => {
        result.current.removeFavorite('artists', 1);
      });

      expect(result.current.favorites.artists).toHaveLength(1);
      expect(result.current.favorites.artists[0].id).toBe(2);
    });

    it('should remove album from favorites', async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        result.current.addFavorite('albums', { id: 1, title: 'Album 1' });
      });

      await act(async () => {
        result.current.removeFavorite('albums', 1);
      });

      expect(result.current.favorites.albums).toHaveLength(0);
    });

    it('should handle removing non-existent favorite', async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        result.current.removeFavorite('artists', 999);
      });

      expect(result.current.favorites.artists).toHaveLength(0);
    });
  });

  describe('isFavorite', () => {
    it('should return true if item is in favorites', async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        result.current.addFavorite('artists', { id: 1, name: 'Artist 1' });
      });

      expect(result.current.isFavorite('artists', 1)).toBe(true);
    });

    it('should return false if item is not in favorites', async () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.isFavorite('artists', 1)).toBe(false);
    });

    it('should return false for empty favorites', () => {
      const { result } = renderHook(() => useFavorites());

      expect(result.current.isFavorite('artists', 1)).toBe(false);
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite when not present', async () => {
      const { result } = renderHook(() => useFavorites());

      let isFav: boolean = false;
      await act(async () => {
        isFav = result.current.toggleFavorite('artists', { id: 1, name: 'Artist 1' });
      });

      expect(isFav).toBe(true);
      expect(result.current.favorites.artists).toHaveLength(1);
    });

    it('should remove favorite when present', async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        result.current.addFavorite('artists', { id: 1, name: 'Artist 1' });
      });

      let isFav: boolean = false;
      await act(async () => {
        isFav = result.current.toggleFavorite('artists', { id: 1, name: 'Artist 1' });
      });

      expect(isFav).toBe(false);
      expect(result.current.favorites.artists).toHaveLength(0);
    });
  });

  describe('Persistence', () => {
    it('should persist favorites to localStorage', async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        result.current.addFavorite('artists', { id: 1, name: 'Artist 1' });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'favorites',
        expect.stringContaining('Artist 1')
      );
    });

    it('should persist after removing favorite', async () => {
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        result.current.addFavorite('artists', { id: 1, name: 'Artist 1' });
      });

      await act(async () => {
        result.current.removeFavorite('artists', 1);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'favorites',
        JSON.stringify({
          artists: [],
          albums: [],
          playlists: [],
          tracks: [],
        })
      );
    });
  });
});