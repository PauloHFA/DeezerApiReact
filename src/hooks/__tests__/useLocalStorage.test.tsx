import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

      expect(result.current[0]).toBe('initial-value');
    });

    it('should load value from localStorage if available', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify('stored-value'));

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

      expect(result.current[0]).toBe('stored-value');
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

      expect(result.current[0]).toBe('initial-value');
    });

    it('should initialize with object value', () => {
      const initialValue = { name: 'test', count: 0 };
      const { result } = renderHook(() => useLocalStorage('test-key', initialValue));

      expect(result.current[0]).toEqual(initialValue);
    });
  });

  describe('setValue', () => {
    it('should update value and persist to localStorage', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

      await act(async () => {
        result.current[1]('new-value');
      });

      expect(result.current[0]).toBe('new-value');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
    });

    it('should persist object value to localStorage', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', { count: 0 }));

      await act(async () => {
        result.current[1]({ count: 1 });
      });

      expect(result.current[0]).toEqual({ count: 1 });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify({ count: 1 }));
    });

    it('should support functional updates', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 0));

      await act(async () => {
        result.current[1]((prev: number) => prev + 1);
      });

      expect(result.current[0]).toBe(1);
    });

    it('should handle errors when writing to localStorage', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));

      await act(async () => {
        result.current[1]('new-value');
      });

      // Should not throw
      expect(result.current[0]).toBe('new-value');
      expect(errorSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
    });
  });

  describe('Multiple Keys', () => {
    it('should handle multiple independent keys', async () => {
      const { result: result1 } = renderHook(() => useLocalStorage('key1', 'value1'));
      const { result: result2 } = renderHook(() => useLocalStorage('key2', 'value2'));

      expect(result1.current[0]).toBe('value1');
      expect(result2.current[0]).toBe('value2');

      await act(async () => {
        result1.current[1]('updated1');
      });

      expect(result1.current[0]).toBe('updated1');
      expect(result2.current[0]).toBe('value2');
    });
  });

  describe('Array Values', () => {
    it('should handle array values', async () => {
      const { result } = renderHook(() => useLocalStorage('test-key', [1, 2, 3]));

      expect(result.current[0]).toEqual([1, 2, 3]);

      await act(async () => {
        result.current[1]([1, 2, 3, 4]);
      });

      expect(result.current[0]).toEqual([1, 2, 3, 4]);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify([1, 2, 3, 4]));
    });
  });
});