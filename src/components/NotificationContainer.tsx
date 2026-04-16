import { Box, Alert, Snackbar } from '@mui/material';
import { useNotification } from '../hooks/useNotification';

/**
 * NotificationContainer - Renderiza todas as notificações do app
 */
const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <Box sx={{ position: 'fixed', top: 24, right: 24, zIndex: 2000 }}>
      {notifications.map((notification) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={3000}
          onClose={() => removeNotification(notification.id)}
          sx={{ mb: 1 }}
        >
          <Alert
            onClose={() => removeNotification(notification.id)}
            severity={notification.type}
            variant="filled"
            sx={{
              width: '100%',
              minWidth: '300px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              animation: 'slideIn 0.3s ease-in-out',
              '@keyframes slideIn': {
                from: {
                  transform: 'translateX(400px)',
                  opacity: 0,
                },
                to: {
                  transform: 'translateX(0)',
                  opacity: 1,
                },
              },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  );
};

export default NotificationContainer;
