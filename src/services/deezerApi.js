import axios from 'axios';

const BASE_URL = '/api';

// Helper function to create JSONP request
const jsonp = (url) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callbackName = `jsonp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    window[callbackName] = (data) => {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };

    script.onerror = () => {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(new Error('JSONP request failed'));
    };

    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    document.body.appendChild(script);
  });
};

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

export const searchTracks = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/track?q=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw error;
  }
}; 