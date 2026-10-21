import { createContext, useState, useCallback } from 'react';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => number;
  removeNotification: (id: number) => void;
  success: (message: string, duration?: number) => number;
  error: (message: string, duration?: number) => number;
  warning: (message: string, duration?: number) => number;
  info: (message: string, duration?: number) => number;
}

// Default context value to prevent "must be used within Provider" errors
const defaultContextValue: NotificationContextValue = {
  notifications: [],
  addNotification: () => 0,
  removeNotification: () => {},
  success: () => 0,
  error: () => 0,
  warning: () => 0,
  info: () => 0,
};

export const NotificationContext = createContext<NotificationContextValue>(defaultContextValue);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type };

    setNotifications((prev) => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const success = (message: string, duration?: number) =>
    addNotification(message, 'success', duration);
  const error = (message: string, duration?: number) =>
    addNotification(message, 'error', duration);
  const warning = (message: string, duration?: number) =>
    addNotification(message, 'warning', duration);
  const info = (message: string, duration?: number) =>
    addNotification(message, 'info', duration);

  const value: NotificationContextValue = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
