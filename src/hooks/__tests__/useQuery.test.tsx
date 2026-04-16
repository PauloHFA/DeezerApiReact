import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuery } from '@/hooks/useQuery';

describe('useQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null data and loading true', () => {
    const mockFn = vi.fn().mockResolvedValue({ data: 'test' });
    const { result } = renderHook(() => useQuery(mockFn));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should fetch data and update state', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFn = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useQuery(mockFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should handle errors', async () => {
    const error = new Error('Fetch failed');
    const mockFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useQuery(mockFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeDefined();
  });

  it('should use cached data', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFn = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useQuery(mockFn, [], { cacheTime: 10000 }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    // Re-render should use cache
    const { result: result2 } = renderHook(() => useQuery(mockFn, [], { cacheTime: 10000 }));

    await waitFor(() => {
      expect(result2.current.loading).toBe(false);
    });

    // Mock should have been called same number of times (cache hit)
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on manual call', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFn = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useQuery(mockFn));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.retry();
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should respect enabled flag', async () => {
    const mockFn = vi.fn().mockResolvedValue({ data: 'test' });

    const { result } = renderHook(() => useQuery(mockFn, [], { enabled: false }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFn).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });
});
