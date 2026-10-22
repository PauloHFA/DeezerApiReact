import { useContext } from 'react';
import { PlayerContext, PlaybackSource } from '../contexts/PlayerContext';

export const usePlayer = () => {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }

  return context as {
    // Estado
    currentTrack: any;
    isPlaying: boolean;
    volume: number;
    queue: any[];
    currentlyPlaying: number | null;
    playbackSource: PlaybackSource;
    previewUrl: string | null;
    youtubeVideoId: string | null;
    youtubeThumbnail: string | null;
    youtubePlayerState: number;
    youtubeDuration: number;
    youtubeCurrentTime: number;
    youtubeError: number | null;
    spotifyDeviceId: string | null;
    spotifyPlaybackState: any | null;
    matchedTrack: any | null;
    
    // Ações
    playTrack: (track: any, source?: PlaybackSource) => Promise<void>;
    pauseTrack: () => void;
    resumeTrack: () => void;
    togglePlayPause: () => void;
    setPlayerVolume: (volume: number) => void;
    addToQueue: (track: any) => void;
    removeFromQueue: (trackId: number) => void;
    clearQueue: () => void;
    playNext: () => void;
    playPreview: (trackOrUrl: any) => void;
    stopPreview: () => void;
    playYoutube: (track: any, videoId: string, thumbnailUrl?: string) => void;
    initializeYoutubePlayer: (element: HTMLDivElement, videoId: string) => Promise<void>;
    stopYoutube: () => void;
    playSpotify: (track: any, spotifyTrack: any) => Promise<void>;
    stopSpotify: () => void;
    setCurrentlyPlayingTrack: (trackId: number) => void;
    setPlaybackSource: (source: PlaybackSource) => void;
    matchCurrentTrack: () => Promise<void>;
    seekTo: (seconds: number) => void;
    getProgress: () => { current: number; duration: number };
  };
};

export type { PlaybackSource };
