import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, AlertTitle, Slide, Grow } from '@mui/material';
import { CheckCircle, Error, Warning, Info } from '@mui/icons-material';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const TransitionUp = (props) => {
  return <Slide {...props} direction="up" />;
};

const severityConfig = {
  success: {
    icon: <CheckCircle />,
    autoHideDuration: 4000,
  },
  error: {
    icon: <Error />,
    autoHideDuration: 8000,
  },
  warning: {
    icon: <Warning />,
    autoHideDuration: 6000,
  },
  info: {
    icon: <Info />,
    autoHideDuration: 5000,
  },
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, severity = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      message,
      severity,
      title: options.title,
      persistent: options.persistent || false,
      action: options.action,
      autoHideDuration: options.autoHideDuration || severityConfig[severity]?.autoHideDuration || 5000,
    };

    setNotifications(prev => [...prev, notification]);

    if (!notification.persistent) {
      setTimeout(() => {
        hideNotification(id);
      }, notification.autoHideDuration);
    }

    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((message, options) => showNotification(message, 'success', options), [showNotification]);
  const showError = useCallback((message, options) => showNotification(message, 'error', options), [showNotification]);
  const showWarning = useCallback((message, options) => showNotification(message, 'warning', options), [showNotification]);
  const showInfo = useCallback((message, options) => showNotification(message, 'info', options), [showNotification]);

  const contextValue = {
    notifications,
    showNotification,
    hideNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      {notifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          autoHideDuration={notification.persistent ? null : notification.autoHideDuration}
          onClose={() => hideNotification(notification.id)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          TransitionComponent={TransitionUp}
          sx={{
            mt: index * 7, // Stack notifications
            '& .MuiSnackbar-root': {
              position: 'relative',
            },
          }}
        >
          <Alert
            severity={notification.severity}
            onClose={() => hideNotification(notification.id)}
            variant="filled"
            icon={severityConfig[notification.severity]?.icon}
            action={notification.action}
            sx={{
              minWidth: 300,
              maxWidth: 500,
              '& .MuiAlert-message': {
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              },
            }}
          >
            {notification.title && (
              <AlertTitle sx={{ mb: 0.5 }}>{notification.title}</AlertTitle>
            )}
            {notification.message}
          </Alert>
        </Snackbar>
      ))}
    </NotificationContext.Provider>
  );
};