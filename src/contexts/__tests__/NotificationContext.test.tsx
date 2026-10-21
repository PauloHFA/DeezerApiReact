import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { useNotification } from '@/hooks/useNotification';
import { renderHook } from '@testing-library/react';

// Test wrapper component
const TestWrapper = ({ children }: { children: ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

// Hook consumer for testing
const HookConsumer = () => {
  const notification = useNotification();
  return (
    <div data-testid="hook-consumer">
      <span data-testid="notifications-count">{notification.notifications.length}</span>
      <button data-testid="add-success" onClick={() => notification.success('Success message')}>Add Success</button>
      <button data-testid="add-error" onClick={() => notification.error('Error message')}>Add Error</button>
      <button data-testid="add-warning" onClick={() => notification.warning('Warning message')}>Add Warning</button>
      <button data-testid="add-info" onClick={() => notification.info('Info message')}>Add Info</button>
    </div>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Default Values (without Provider)', () => {
    it('should provide default values when used outside Provider', () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: ({ children }) => <>{children}</>,
      });

      expect(result.current.notifications).toEqual([]);
      expect(typeof result.current.addNotification).toBe('function');
      expect(typeof result.current.removeNotification).toBe('function');
      expect(typeof result.current.success).toBe('function');
      expect(typeof result.current.error).toBe('function');
      expect(typeof result.current.warning).toBe('function');
      expect(typeof result.current.info).toBe('function');
    });
  });

  describe('Provider - Initial State', () => {
    it('should initialize with empty notifications array', () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      expect(result.current.notifications).toEqual([]);
    });
  });

  describe('addNotification', () => {
    it('should add notification with default type (info)', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.addNotification('Test message');
      });

      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].message).toBe('Test message');
      expect(result.current.notifications[0].type).toBe('info');
    });

    it('should add notification with custom type', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.addNotification('Test message', 'success');
      });

      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].type).toBe('success');
    });

    it('should add notification with custom duration', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.addNotification('Test message', 'info', 5000);
      });

      expect(result.current.notifications.length).toBe(1);
    });

    it('should return notification ID', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      let notificationId: number | null = null;
      await act(async () => {
        notificationId = result.current.addNotification('Test message');
      });

      expect(notificationId).toBeDefined();
      expect(typeof notificationId).toBe('number');
    });
  });

  describe('removeNotification', () => {
    it('should remove notification by ID', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      let notificationId: number | null = null;
      await act(async () => {
        notificationId = result.current.addNotification('Test message');
      });

      expect(result.current.notifications.length).toBe(1);

      await act(async () => {
        result.current.removeNotification(notificationId!);
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should not throw when removing non-existent ID', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.removeNotification(999999);
      });

      // Should not throw
      expect(result.current.notifications.length).toBe(0);
    });
  });

  describe('Helper Methods', () => {
    it('should add success notification', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.success('Success message');
      });

      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].type).toBe('success');
    });

    it('should add error notification', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.error('Error message');
      });

      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].type).toBe('error');
    });

    it('should add warning notification', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.warning('Warning message');
      });

      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].type).toBe('warning');
    });

    it('should add info notification', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.info('Info message');
      });

      expect(result.current.notifications.length).toBe(1);
      expect(result.current.notifications[0].type).toBe('info');
    });

    it('should add multiple notifications', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.success('Success 1');
        result.current.error('Error 1');
        result.current.warning('Warning 1');
        result.current.info('Info 1');
      });

      expect(result.current.notifications.length).toBe(4);
    });
  });

  describe('Auto-remove', () => {
    it('should auto-remove notification after duration', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.addNotification('Test message', 'info', 1000);
      });

      expect(result.current.notifications.length).toBe(1);

      // Advance timers past the duration
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });

      expect(result.current.notifications.length).toBe(0);
    });

    it('should not auto-remove when duration is 0', async () => {
      const { result } = renderHook(() => useNotification(), {
        wrapper: TestWrapper,
      });

      await act(async () => {
        result.current.addNotification('Test message', 'info', 0);
      });

      expect(result.current.notifications.length).toBe(1);

      // Advance timers
      await act(async () => {
        vi.advanceTimersByTime(5000);
      });

      // Should still be there
      expect(result.current.notifications.length).toBe(1);
    });
  });

  describe('Button Interactions', () => {
    it('should add success notification via button click', async () => {
      render(
        <TestWrapper>
          <HookConsumer />
        </TestWrapper>
      );

      await act(async () => {
        screen.getByTestId('add-success').click();
      });

      expect(screen.getByTestId('notifications-count').textContent).toBe('1');
    });

    it('should add error notification via button click', async () => {
      render(
        <TestWrapper>
          <HookConsumer />
        </TestWrapper>
      );

      await act(async () => {
        screen.getByTestId('add-error').click();
      });

      expect(screen.getByTestId('notifications-count').textContent).toBe('1');
    });

    it('should add warning notification via button click', async () => {
      render(
        <TestWrapper>
          <HookConsumer />
        </TestWrapper>
      );

      await act(async () => {
        screen.getByTestId('add-warning').click();
      });

      expect(screen.getByTestId('notifications-count').textContent).toBe('1');
    });

    it('should add info notification via button click', async () => {
      render(
        <TestWrapper>
          <HookConsumer />
        </TestWrapper>
      );

      await act(async () => {
        screen.getByTestId('add-info').click();
      });

      expect(screen.getByTestId('notifications-count').textContent).toBe('1');
    });
  });
});