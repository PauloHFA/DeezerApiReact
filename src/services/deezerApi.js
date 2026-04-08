import { apiClient } from './apiClient';

// Search endpoints
export const searchArtists = (query) => apiClient.get('/search/artist', { q: query });
export const searchTracks = (query) => apiClient.get('/search/track', { q: query });
export const searchAlbums = (query) => apiClient.get('/search/album', { q: query });
export const searchPlaylists = (query) => apiClient.get('/search/playlist', { q: query });

// Artist endpoints
export const getArtist = (id) => apiClient.get(`/artist/${id}`);
export const getArtistAlbums = (id) => apiClient.get(`/artist/${id}/albums`);

// Album endpoints
export const getAlbum = (id) => apiClient.get(`/album/${id}`);
export const getAlbumTracks = (id) => apiClient.get(`/album/${id}/tracks`);

// Playlist endpoints
export const getPlaylist = (id) => apiClient.get(`/playlist/${id}`);

// Chart/Top tracks endpoints
export const getTopTracks = () => apiClient.get('/chart/0/tracks');
export const getTopPlaylists = () => apiClient.get('/chart/0/playlists');

// Track endpoints
export const getTrackPreview = (id) => 
  apiClient.get(`/track/${id}`).then(data => data.preview); 