import { createContext, useState, useCallback } from 'react';

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [queue, setQueue] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [youtubeThumbnail, setYoutubeThumbnail] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  const playTrack = useCallback((track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setPreviewUrl(null);
    setYoutubeVideoId(null);
    setCurrentlyPlaying(track?.id ?? null);
  }, []);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resumeTrack = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const setPlayerVolume = useCallback((newVolume) => {
    setVolume(Math.max(0, Math.min(1, newVolume)));
  }, []);

  const addToQueue = useCallback((track) => {
    setQueue((prev) => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((trackId) => {
    setQueue((prev) => prev.filter((track) => track.id !== trackId));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      playTrack(nextTrack);
      setQueue((prev) => prev.slice(1));
    }
  }, [queue, playTrack]);

  const playPreview = useCallback((trackOrUrl) => {
    if (typeof trackOrUrl === 'string') {
      setPreviewUrl(trackOrUrl);
      setYoutubeVideoId(null);
      setIsPlaying(true);
      return;
    }

    if (trackOrUrl?.preview) {
      setCurrentTrack(trackOrUrl);
      setPreviewUrl(trackOrUrl.preview);
      setYoutubeVideoId(null);
      setCurrentlyPlaying(trackOrUrl.id);
      setIsPlaying(true);
      return;
    }

    console.warn('playPreview expects a track object with a preview URL or a preview URL string.');
  }, []);

  const stopPreview = useCallback(() => {
    setPreviewUrl(null);
    setCurrentlyPlaying(null);
    setIsPlaying(false);
  }, []);

  const playYoutube = useCallback((track, videoId, thumbnailUrl = null) => {
    setCurrentTrack(track);
    setYoutubeVideoId(videoId);
    setYoutubeThumbnail(thumbnailUrl);
    setPreviewUrl(null);
    setCurrentlyPlaying(track?.id ?? null);
    setIsPlaying(true);
  }, []);

  const stopYoutube = useCallback(() => {
    setYoutubeVideoId(null);
    setYoutubeThumbnail(null);
    setCurrentlyPlaying(null);
    setIsPlaying(false);
  }, []);

  const setCurrentlyPlayingTrack = useCallback((trackId) => {
    setCurrentlyPlaying(trackId);
  }, []);

  const value = {
    // Estado
    currentTrack,
    isPlaying,
    volume,
    queue,
    previewUrl,
    youtubeVideoId,
    youtubeThumbnail,
    currentlyPlaying,

    // Ações
    playTrack,
    playYoutube,
    pauseTrack,
    resumeTrack,
    togglePlayPause,
    setPlayerVolume,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playPreview,
    stopPreview,
    stopYoutube,
    setCurrentlyPlayingTrack,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
