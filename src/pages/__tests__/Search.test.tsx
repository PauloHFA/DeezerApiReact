import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Search from '@/pages/Search';
import { AccountProvider } from '@/contexts/AccountContext';
import * as deezerApi from '@/services/deezerApi';

const { info, success, error, playerActions } = vi.hoisted(() => ({
  info: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  playerActions: {
    playPreview: vi.fn(),
    stopPreview: vi.fn(),
    playYoutube: vi.fn(),
    matchCurrentTrack: vi.fn(),
  },
}));

vi.mock('@/services/supabaseClient', () => ({
  getSupabaseClient: vi.fn().mockResolvedValue(null),
  isSupabaseConfigured: false,
}));

vi.mock('@/services/deezerApi', () => ({
  searchArtists: vi.fn(),
  searchTracks: vi.fn(),
  searchAlbums: vi.fn(),
  searchPlaylists: vi.fn(),
  getTrackPreview: vi.fn(),
}));

vi.mock('@/services/youtubeApi', () => ({
  fetchYoutubeVideoData: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

vi.mock('@/hooks/usePlayer', () => ({
  usePlayer: () => ({
    currentlyPlaying: null,
    ...playerActions,
  }),
}));

vi.mock('@/hooks/useNotification', () => ({
  useNotification: () => ({ info, success, error }),
}));

const mockDeezerApi = vi.mocked(deezerApi);

const renderSearch = () =>
  render(
    <BrowserRouter>
      <AccountProvider>
        <Search />
      </AccountProvider>
    </BrowserRouter>
  );

describe('Search page result messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDeezerApi.searchArtists.mockResolvedValue({
      data: [{ id: 1, name: 'Adele', nb_fan: 100, type: 'artist' }],
    });
    mockDeezerApi.searchTracks.mockResolvedValue({ data: [] });
    mockDeezerApi.searchAlbums.mockResolvedValue({ data: [] });
    mockDeezerApi.searchPlaylists.mockResolvedValue({ data: [] });
  });

  it('does not report no results when the artist search succeeds', async () => {
    renderSearch();
    fireEvent.change(screen.getByRole('textbox', { name: /busque artistas/i }), {
      target: { value: 'Adele' },
    });

    expect(await screen.findByText('Adele')).toBeInTheDocument();
    expect(screen.queryByText('Nenhum resultado encontrado')).not.toBeInTheDocument();
    expect(info).not.toHaveBeenCalledWith('Nenhum resultado encontrado');
  });

  it('shows the empty state only after all search requests return no results', async () => {
    mockDeezerApi.searchArtists.mockResolvedValue({ data: [] });
    renderSearch();
    fireEvent.change(screen.getByRole('textbox', { name: /busque artistas/i }), {
      target: { value: 'artista inexistente' },
    });

    expect(await screen.findByText('Nenhum resultado encontrado')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockDeezerApi.searchArtists).toHaveBeenCalledWith('artista inexistente');
    });
    expect(info).not.toHaveBeenCalledWith('Nenhum resultado encontrado');
  });
});
