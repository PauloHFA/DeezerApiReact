import { useLocalStorage } from './useLocalStorage';

/**
 * Hook para gerenciar favoritos (artistas, álbuns, playlists, tracks)
 * @returns {Object} objeto com métodos para manipular favoritos
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage('favorites', {
    artists: [],
    albums: [],
    playlists: [],
    tracks: [],
  });

  const addFavorite = (type, item) => {
    if (!['artists', 'albums', 'playlists', 'tracks'].includes(type)) {
      console.error('Tipo de favorito inválido');
      return false;
    }

    const exists = favorites[type].some((fav) => fav.id === item.id);
    if (!exists) {
      setFavorites((prev) => ({
        ...prev,
        [type]: [...prev[type], item],
      }));
      return true;
    }
    return false;
  };

  const removeFavorite = (type, itemId) => {
    setFavorites((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.id !== itemId),
    }));
  };

  const isFavorite = (type, itemId) => {
    return favorites[type].some((item) => item.id === itemId);
  };

  const toggleFavorite = (type, item) => {
    if (isFavorite(type, item.id)) {
      removeFavorite(type, item.id);
      return false;
    } else {
      addFavorite(type, item);
      return true;
    }
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
};
