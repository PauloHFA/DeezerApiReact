import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AddToPlaylistDialog from '@/components/AddToPlaylistDialog';
import { AccountProvider, useAccount } from '@/contexts/AccountContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import type { Track } from '@/types';

vi.mock('@/services/supabaseClient', () => ({
  getSupabaseClient: vi.fn().mockResolvedValue(null),
  isSupabaseConfigured: false,
}));

const track: Track = {
  id: 42,
  title: 'Minha música',
  duration: 180,
  explicit_lyrics: false,
  artist: {
    id: 7,
    name: 'Artista',
    nb_fan: 100,
    type: 'artist',
  },
  album: {
    id: 9,
    title: 'Álbum',
    nb_tracks: 8,
    release_date: '2024-01-01',
    type: 'album',
  },
  type: 'track',
};

const PlaylistHarness = () => {
  const { library } = useAccount();

  return (
    <>
      <div data-testid="playlist-state">
        {library.playlists.map((playlist) => `${playlist.name}:${playlist.tracks.length}`).join(',')}
      </div>
      <AddToPlaylistDialog open track={track} onClose={vi.fn()} />
    </>
  );
};

const renderDialog = (withExistingPlaylist = false) => {
  if (withExistingPlaylist) {
    window.localStorage.setItem('ph-music-library-guest', JSON.stringify({
      playHistory: [],
      searchHistory: [],
      playlists: [{
        id: 'favorites',
        name: 'Favoritas',
        tracks: [],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }],
    }));
  }

  return render(
    <NotificationProvider>
      <AccountProvider>
        <PlaylistHarness />
      </AccountProvider>
    </NotificationProvider>
  );
};

describe('AddToPlaylistDialog', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('adds the selected song to an existing playlist card', async () => {
    renderDialog(true);

    const playlistCard = await screen.findByRole('button', {
      name: 'Adicionar à playlist Favoritas',
    });
    fireEvent.click(playlistCard);

    await waitFor(() => {
      expect(screen.getByTestId('playlist-state')).toHaveTextContent('Favoritas:1');
    });
  });

  it('creates a playlist and adds the selected song', async () => {
    renderDialog();
    fireEvent.change(screen.getByRole('textbox', { name: 'Nome da nova playlist' }), {
      target: { value: 'Para ouvir' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Criar e adicionar' }));

    await waitFor(() => {
      expect(screen.getByTestId('playlist-state')).toHaveTextContent('Para ouvir:1');
    });
  });
});
