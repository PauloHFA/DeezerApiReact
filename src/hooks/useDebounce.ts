import { useState, useEffect } from 'react';

/**
 * Hook para debounce - reduz requisições em busca/filtros
 * @param {any} value - valor a ser debounceado
 * @param {number} delay - delay em ms (padrão 500)
 * @returns {any} valor debounceado
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
