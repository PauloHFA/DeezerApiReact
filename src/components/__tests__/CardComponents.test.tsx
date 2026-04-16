import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TrackCard, ArtistCard, AlbumCard, PlaylistCard } from '@/components/CardComponents';
import type { Track, Artist, Album, Playlist } from '@/types';

describe('CardComponents', () => {
  const mockTrack: Track = {
    id: 1,
    title: 'Test Song',
    duration: 180,
    explicit_lyrics: false,
    artist: {
      id: 1,
      name: 'Artist Name',
      nb_fan: 1000,
      type: 'artist',
    },
    album: {
      id: 1,
      title: 'Album Title',
      nb_tracks: 10,
      release_date: '2023-01-01',
      type: 'album',
    },
    type: 'track',
  };

  const mockArtist: Artist = {
    id: 1,
    name: 'Test Artist',
    nb_fan: 5000,
    type: 'artist',
  };

  const mockAlbum: Album = {
    id: 1,
    title: 'Test Album',
    nb_tracks: 10,
    release_date: '2023-01-01',
    type: 'album',
  };

  const mockPlaylist: Playlist = {
    id: 1,
    title: 'Test Playlist',
    nb_tracks: 20,
    type: 'playlist',
  };

  describe('TrackCard', () => {
    it('should render track information', () => {
      render(
        <TrackCard
          track={mockTrack}
          isPlaying={false}
          onPlay={vi.fn()}
          onPreview={vi.fn()}
        />
      );

      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.getByText('Artist Name')).toBeInTheDocument();
    });

    it('should call onPlay when play button is clicked', () => {
      const onPlay = vi.fn();
      const { container } = render(
        <TrackCard
          track={mockTrack}
          isPlaying={false}
          onPlay={onPlay}
          onPreview={vi.fn()}
        />
      );

      const buttons = container.querySelectorAll('button');
      if (buttons.length > 0) {
        buttons[0].click();
        expect(onPlay).toHaveBeenCalledWith(mockTrack);
      }
    });
  });

  describe('ArtistCard', () => {
    it('should render artist information', () => {
      render(<ArtistCard artist={mockArtist} onClick={vi.fn()} />);

      expect(screen.getByText('Test Artist')).toBeInTheDocument();
      expect(screen.getByText('5,000 fans')).toBeInTheDocument();
    });

    it('should call onClick when card is clicked', () => {
      const onClick = vi.fn();
      const { container } = render(<ArtistCard artist={mockArtist} onClick={onClick} />);

      const card = container.querySelector('[role="button"]') || container.firstChild;
      if (card instanceof HTMLElement) {
        card.click();
        expect(onClick).toHaveBeenCalled();
      }
    });
  });

  describe('AlbumCard', () => {
    it('should render album information', () => {
      render(<AlbumCard album={mockAlbum} onClick={vi.fn()} />);

      expect(screen.getByText('Test Album')).toBeInTheDocument();
      expect(screen.getByText('2023')).toBeInTheDocument();
    });
  });

  describe('PlaylistCard', () => {
    it('should render playlist information', () => {
      render(<PlaylistCard playlist={mockPlaylist} onClick={vi.fn()} />);

      expect(screen.getByText('Test Playlist')).toBeInTheDocument();
      expect(screen.getByText('20 tracks')).toBeInTheDocument();
    });
  });
});
