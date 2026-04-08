import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

/**
 * Hook para usar notificações em qualquer componente
 * @returns {Object} métodos para mostrar notificações (success, error, warning, info)
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};
