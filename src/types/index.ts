/**
 * Deezer API Type Definitions
 * Global types for the application
 */

// Artist related types
export interface Artist {
  id: number;
  name: string;
  picture_small?: string;
  picture_medium?: string;
  picture_big?: string;
  picture_xl?: string;
  nb_fan: number;
  nb_album?: number;
  radio?: boolean;
  tracklist?: string;
  genre_id?: number;
  genres?: Genre[];
  description?: string;
  biography?: string;
  radio_url?: string;
  link?: string;
  type: string;
}

// Album related types
export interface Album {
  id: number;
  title: string;
  cover_small?: string;
  cover_medium?: string;
  cover_big?: string;
  cover_xl?: string;
  genre_id?: number;
  genres?: Genre[];
  label?: string;
  nb_tracks: number;
  duration?: number;
  fans?: number;
  rating?: number;
  release_date: string;
  record_type?: string;
  explicit_lyrics?: boolean;
  description?: string;
  artist?: Artist;
  tracks?: Track[];
  type: string;
}

// Track related types
export interface Track {
  id: number;
  title: string;
  duration: number;
  rank?: number;
  explicit_lyrics: boolean;
  preview?: string;
  position?: number;
  artist: Artist;
  album: Album;
  type: string;
}

// Playlist related types
export interface Playlist {
  id: number;
  title: string;
  description?: string;
  picture_small?: string;
  picture_medium?: string;
  picture_big?: string;
  picture_xl?: string;
  nb_tracks: number;
  fans?: number;
  public?: boolean;
  creation_date?: string;
  md5_image?: string;
  picture?: string;
  type: string;
}

// Genre related types
export interface Genre {
  id: number;
  name: string;
  picture_small?: string;
  picture_medium?: string;
  picture_big?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T[];
  total?: number;
  next?: string;
}

// Search result types
export interface SearchResult {
  artists: Artist[];
  tracks: Track[];
  albums: Album[];
  playlists: Playlist[];
}

// Player state types
export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  queue: Track[];
  currentIndex: number;
  previewUrl: string | null;
  currentlyPlaying: number | null;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

// Favorites types
export interface Favorites {
  artists: number[];
  albums: number[];
  playlists: number[];
  tracks: number[];
}
