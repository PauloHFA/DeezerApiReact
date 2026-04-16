import { apiClient } from './apiClient';
import type { Artist, Album, Track, Playlist, ApiResponse } from '@/types';

// Search endpoints
export const searchArtists = async (query: string): Promise<ApiResponse<Artist>> =>
  apiClient.get('/search/artist', { q: query });

export const searchTracks = async (query: string): Promise<ApiResponse<Track>> =>
  apiClient.get('/search/track', { q: query });

export const searchAlbums = async (query: string): Promise<ApiResponse<Album>> =>
  apiClient.get('/search/album', { q: query });

export const searchPlaylists = async (query: string): Promise<ApiResponse<Playlist>> =>
  apiClient.get('/search/playlist', { q: query });

// Artist endpoints
export const getArtist = async (id: number): Promise<Artist> =>
  apiClient.get(`/artist/${id}`);

export const getArtistAlbums = async (id: number): Promise<ApiResponse<Album>> =>
  apiClient.get(`/artist/${id}/albums`);

export const getArtistTopTracks = async (id: number): Promise<ApiResponse<Track>> =>
  apiClient.get(`/artist/${id}/top`, { limit: 10 });

// Album endpoints
export const getAlbum = async (id: number): Promise<Album> =>
  apiClient.get(`/album/${id}`);

export const getAlbumTracks = async (id: number): Promise<ApiResponse<Track>> =>
  apiClient.get(`/album/${id}/tracks`);

// Playlist endpoints
export const getPlaylist = async (id: number): Promise<Playlist> =>
  apiClient.get(`/playlist/${id}`);

// Chart/Top tracks endpoints
export const getTopTracks = async (): Promise<ApiResponse<Track>> =>
  apiClient.get('/chart/0/tracks');

export const getTopPlaylists = async (): Promise<ApiResponse<Playlist>> =>
  apiClient.get('/chart/0/playlists');

// Track endpoints
export const getTrackPreview = async (id: number): Promise<string | null> =>
  apiClient.get<{ preview: string | null }>(`/track/${id}`).then(data => data.preview); 