import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Player from '../Player';

const mocks = vi.hoisted(() => ({
  usePlayer: vi.fn(),
  initializeYoutubePlayer: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../hooks/usePlayer', () => ({
  usePlayer: mocks.usePlayer,
}));

describe('Player YouTube playback', () => {
  beforeEach(() => {
    mocks.initializeYoutubePlayer.mockClear();
    mocks.usePlayer.mockReturnValue({
      currentTrack: {
        id: 1,
        title: 'Test Song',
        artist: { name: 'Test Artist' },
        album: { cover_small: '' },
      },
      isPlaying: false,
      volume: 0.5,
      queue: [],
      previewUrl: null,
      youtubeVideoId: 'youtube-video-1',
      youtubeThumbnail: null,
      youtubePlayerState: -1,
      youtubeDuration: 0,
      youtubeCurrentTime: 0,
      youtubeError: null,
      playbackSource: 'youtube',
      spotifyDeviceId: null,
      spotifyPlaybackState: null,
      matchedTrack: null,
      pauseTrack: vi.fn(),
      resumeTrack: vi.fn(),
      setPlayerVolume: vi.fn(),
      playNext: vi.fn(),
      stopYoutube: vi.fn(),
      playSpotify: vi.fn(),
      stopSpotify: vi.fn(),
      seekTo: vi.fn(),
      getProgress: vi.fn().mockReturnValue({ current: 0, duration: 0 }),
      togglePlayPause: vi.fn(),
      setPlaybackSource: vi.fn(),
      matchCurrentTrack: vi.fn().mockResolvedValue(undefined),
      initializeYoutubePlayer: mocks.initializeYoutubePlayer,
    });
  });

  it('initializes the YouTube API after mounting its player element', async () => {
    render(<Player />);

    const playerElement = screen.getByTestId('youtube-player-container');
    expect(playerElement).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.initializeYoutubePlayer).toHaveBeenCalledWith(
        playerElement,
        'youtube-video-1'
      );
    });
  });
});
