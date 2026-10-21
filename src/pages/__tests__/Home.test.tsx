import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '@/pages/Home';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import * as deezerApi from '@/services/deezerApi';

// Mock dependencies
vi.mock('@/services/deezerApi');
vi.mock('@/services/trackMatching', () => ({
  trackMatchingService: {
    matchTrack: vi.fn(),
    matchTracks: vi.fn(),
  },
}));
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

const mockDeezerApi = vi.mocked(deezerApi);
const { trackMatchingService } = await import('@/services/trackMatching');
const mockTrackMatching = vi.mocked(trackMatchingService);

const renderHome = () => {
  return render(
    <BrowserRouter>
      <NotificationProvider>
        <PlayerProvider>
          <Home />
        </PlayerProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
};

describe('Home Page Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Load', () => {
    it('should render loading state initially', () => {
      mockDeezerApi.searchArtists.mockImplementation(() => new Promise(() => {}));
      mockDeezerApi.getTopTracks.mockImplementation(() => new Promise(() => {}));
      mockDeezerApi.getTopPlaylists.mockImplementation(() => new Promise(() => {}));

      renderHome();

        // Check for skeleton loading state (Skeleton components are rendered)
        expect(screen.getByTestId('hero-skeleton')).toBeInTheDocument();
      });

    it('should render content after data loads', async () => {
      mockDeezerApi.searchArtists.mockResolvedValue({ data: [{ id: 1, name: 'Artist 1', picture_big: 'a1.jpg' }] });
      mockDeezerApi.getTopTracks.mockResolvedValue({ data: [{ id: 1, title: 'Track 1', artist: { name: 'Artist 1' }, duration: 200 }] });
      mockDeezerApi.getTopPlaylists.mockResolvedValue({ data: [{ id: 1, title: 'Playlist 1', creator: { name: 'Creator 1' } }] });

      renderHome();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      }, { timeout: 15000 });

      // Verify API calls were made
      expect(mockDeezerApi.searchArtists).toHaveBeenCalledWith('popular');
      expect(mockDeezerApi.getTopTracks).toHaveBeenCalled();
      expect(mockDeezerApi.getTopPlaylists).toHaveBeenCalled();
    });

    it('should display error message when data fails to load', async () => {
      mockDeezerApi.searchArtists.mockRejectedValue(new Error('Network error'));
      mockDeezerApi.getTopTracks.mockRejectedValue(new Error('Network error'));
      mockDeezerApi.getTopPlaylists.mockRejectedValue(new Error('Network error'));

      renderHome();

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      }, { timeout: 15000 });

      await waitFor(() => {
        expect(screen.getByText(/failed to load content/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to search page when Start Exploring is clicked', async () => {
      mockDeezerApi.searchArtists.mockResolvedValue({ data: [] });
      mockDeezerApi.getTopTracks.mockResolvedValue({ data: [] });
      mockDeezerApi.getTopPlaylists.mockResolvedValue({ data: [] });

      renderHome();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      }, { timeout: 15000 });

      const exploreButton = screen.getByRole('button', { name: /start exploring/i });
      fireEvent.click(exploreButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe('/search');
      });
    });
  });

  describe('Featured Content Display', () => {
    it('should display top tracks from API', async () => {
      mockDeezerApi.searchArtists.mockResolvedValue({ data: [] });
      mockDeezerApi.getTopTracks.mockResolvedValue({ 
        data: [
          { id: 1, title: 'Chart Track 1', artist: { name: 'Chart Artist 1' }, duration: 200, preview: 'p1.mp3' },
          { id: 2, title: 'Chart Track 2', artist: { name: 'Chart Artist 2' }, duration: 300, preview: 'p2.mp3' },
        ] 
      });
      mockDeezerApi.getTopPlaylists.mockResolvedValue({ data: [] });

      renderHome();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      }, { timeout: 15000 });

      await waitFor(() => {
        expect(screen.getByText('Chart Track 1')).toBeInTheDocument();
        expect(screen.getByText('Chart Track 2')).toBeInTheDocument();
      });
    });

    it('should display featured artists from API', async () => {
      mockDeezerApi.searchArtists.mockResolvedValue({ 
        data: [
          { id: 1, name: 'Featured Artist 1', picture_big: 'artist1.jpg' },
          { id: 2, name: 'Featured Artist 2', picture_big: 'artist2.jpg' },
        ] 
      });
      mockDeezerApi.getTopTracks.mockResolvedValue({ data: [] });
      mockDeezerApi.getTopPlaylists.mockResolvedValue({ data: [] });

      renderHome();

      // Wait for initial load
      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      }, { timeout: 15000 });

      await waitFor(() => {
        expect(screen.getByText('Featured Artist 1')).toBeInTheDocument();
        expect(screen.getByText('Featured Artist 2')).toBeInTheDocument();
      });
    });
  });
});