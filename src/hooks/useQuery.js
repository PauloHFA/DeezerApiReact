import { useState, useEffect, useRef } from 'react';
import { useNotification } from './useNotification';

/**
 * Custom hook para data fetching centralizado
 * Gerencia loading, error, retry, cache
 * 
 * @param {Function} queryFn - Async function que retorna dados
 * @param {Array} dependencies - Dependencies para re-fetch
 * @param {Object} options - Opções: { enabled, cacheTime, staleTime }
 * @returns {Object} { data, loading, error, retry }
 */
export const useQuery = (queryFn, dependencies = [], options = {}) => {
  const {
    enabled = true,
    cacheTime = 5 * 60 * 1000, // 5 min default
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cacheRef = useRef(new Map());
  const { addError } = useNotification();

  // Criar chave de cache baseada na função e dependências
  const getCacheKey = () => {
    return JSON.stringify({ fn: queryFn.toString(), deps: dependencies });
  };

  const retry = async () => {
    const cacheKey = getCacheKey();

    if (!enabled) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar cache
      const cached = cacheRef.current.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setData(cached.data);
        setLoading(false);
        return;
      }

      // Fetch
      const result = await queryFn();

      // Atualizar cache
      cacheRef.current.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
      addError(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    retry();
  }, dependencies);

  return { data, loading, error, retry };
};

export default useQuery;
