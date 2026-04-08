import axios from 'axios';

const BASE_URL = '/api';

export const searchArtists = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/artist?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching artists:', error);
    throw error;
  }
};

export const getArtist = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/artist/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting artist:', error);
    throw error;
  }
};

export const getArtistAlbums = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/artist/${id}/albums`);
    return response.data;
  } catch (error) {
    console.error('Error getting artist albums:', error);
    throw error;
  }
};

export const getAlbumTracks = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/album/${id}/tracks`);
    return response.data;
  } catch (error) {
    console.error('Error getting album tracks:', error);
    throw error;
  }
};

export const getAlbum = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/album/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting album:', error);
    throw error;
  }
};

export const getPlaylist = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/playlist/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error getting playlist:', error);
    throw error;
  }
};

export const searchTracks = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/track?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw error;
  }
};

export const getTopTracks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/chart/0/tracks`);
    return response.data;
  } catch (error) {
    console.error('Error getting top tracks:', error);
    throw error;
  }
};

export const getTopPlaylists = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/chart/0/playlists`);
    return response.data;
  } catch (error) {
    console.error('Error getting top playlists:', error);
    throw error;
  }
};

export const searchAlbums = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/album?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching albums:', error);
    throw error;
  }
};

export const searchPlaylists = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/playlist?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching playlists:', error);
    throw error;
  }
};

export const getTrackPreview = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/track/${id}`);
    return response.data.preview;
  } catch (error) {
    console.error('Error getting track preview:', error);
    throw error;
  }
}; 