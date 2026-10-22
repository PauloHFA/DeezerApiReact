import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountProvider, useAccount } from '@/contexts/AccountContext';
import type { Track } from '@/types';

vi.mock('@/services/supabaseClient', () => ({
  getSupabaseClient: vi.fn().mockResolvedValue(null),
  isSupabaseConfigured: false,
}));

const track: Track = {
  id: 1,
  title: 'Test Track',
  duration: 180,
  explicit_lyrics: false,
  artist: { id: 1, name: 'Test Artist', nb_fan: 10, type: 'artist' },
  album: { id: 1, title: 'Test Album', nb_tracks: 1, release_date: '2025-01-01', type: 'album' },
  type: 'track',
};

const AccountHarness = () => {
  const {
    library,
    smartPlaylists,
    recordTrackPlayed,
    recordSearch,
    createPlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  } = useAccount();

  const createAndAddTrack = () => {
    const playlistId = createPlaylist('Favoritas');
    addTrackToPlaylist(playlistId, track);
    addTrackToPlaylist(playlistId, track);
  };

  return (
    <>
      <button onClick={() => recordTrackPlayed(track)}>Ouvir</button>
      <button onClick={() => recordSearch('Test Artist', [track])}>Buscar</button>
      <button onClick={createAndAddTrack}>Criar playlist</button>
      <button
        onClick={() => {
          const playlist = library.playlists[0];
          if (playlist) removeTrackFromPlaylist(playlist.id, track.id);
        }}
      >
        Remover faixa
      </button>
      <output data-testid="library">{JSON.stringify(library)}</output>
      <output data-testid="smart-playlists">{JSON.stringify(smartPlaylists)}</output>
    </>
  );
};

describe('AccountContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('builds smart playlists from guest searches and playback history', () => {
    render(
      <AccountProvider>
        <AccountHarness />
      </AccountProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ouvir' }));
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

    const smartPlaylists = JSON.parse(screen.getByTestId('smart-playlists').textContent || '[]');
    expect(smartPlaylists.find((playlist: { id: string }) => playlist.id === 'recently-played').tracks)
      .toHaveLength(1);
    expect(smartPlaylists.find((playlist: { id: string }) => playlist.id === 'most-played').tracks)
      .toHaveLength(1);
    expect(smartPlaylists.find((playlist: { id: string }) => playlist.id === 'search-discoveries').tracks)
      .toHaveLength(1);
  });

  it('creates editable guest playlists, avoids duplicate tracks, and persists them locally', () => {
    render(
      <AccountProvider>
        <AccountHarness />
      </AccountProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Criar playlist' }));

    let library = JSON.parse(screen.getByTestId('library').textContent || '{}');
    expect(library.playlists[0].name).toBe('Favoritas');
    expect(library.playlists[0].tracks).toHaveLength(1);
    expect(JSON.parse(window.localStorage.getItem('ph-music-library-guest') || '{}').playlists)
      .toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Remover faixa' }));
    library = JSON.parse(screen.getByTestId('library').textContent || '{}');
    expect(library.playlists[0].tracks).toHaveLength(0);
  });
});
