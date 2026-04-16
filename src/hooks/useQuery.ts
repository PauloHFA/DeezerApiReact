import { useState, useEffect, useContext, DependencyList } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const queryCache = new WeakMap<Function, Map<string, CacheEntry<unknown>>>();

interface UseQueryOptions {
  enabled?: boolean;
  cacheTime?: number;
}

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => Promise<void>;
}

/**
 * Custom hook para data fetching centralizado
 * Gerencia loading, error, retry, cache
 */
export const useQuery = <T,>(
  queryFn: () => Promise<T>,
  dependencies: DependencyList = [],
  options: UseQueryOptions = {}
): UseQueryResult<T> => {
  const {
    enabled = true,
    cacheTime = 5 * 60 * 1000, // 5 min default
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const notificationContext = useContext(NotificationContext);
  const addError = notificationContext?.error ?? (() => {});

  const getCacheKey = (): string => {
    return dependencies
      .map((dep) => (typeof dep === 'function' ? dep.toString() : JSON.stringify(dep)))
      .join('|');
  };

  const getCache = (): Map<string, CacheEntry<unknown>> => {
    let cache = queryCache.get(queryFn);
    if (!cache) {
      cache = new Map();
      queryCache.set(queryFn, cache);
    }
    return cache;
  };

  const fetchData = async (ignoreCache = false): Promise<void> => {
    const cacheKey = getCacheKey();
    const cache = getCache();

    setError(null);
    setLoading(true);

    try {
      if (!ignoreCache) {
        const cached = cache.get(cacheKey) as CacheEntry<T> | undefined;
        if (cached && Date.now() - cached.timestamp < cacheTime) {
          setData(cached.data);
          setLoading(false);
          return;
        }
      }

      const result = await queryFn();

      cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      addError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const retry = async (): Promise<void> => {
    if (!enabled) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    await fetchData(true);
  };

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setData(null);
      setError(null);
      return;
    }

    void fetchData();
  }, [enabled, cacheTime, queryFn, ...dependencies]);

  return { data, loading, error, retry };
};

export default useQuery;
