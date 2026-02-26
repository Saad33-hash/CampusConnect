import { useEffect, useState, useCallback, useRef } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from '../hooks/useAuth';
import { NotificationContext } from './notificationContextDef';

// Pusher configuration
const PUSHER_KEY = '4ac5da104157d01a9278';
const PUSHER_CLUSTER = 'ap2';

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pusherRef = useRef(null);

  // Initialize Pusher when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const pusherInstance = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        forceTLS: true
      });

      // Subscribe to user-specific channel
      const channel = pusherInstance.subscribe(`user-${user._id}`);
      
      channel.bind('notification', (data) => {
        console.log('Received notification:', data);
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      pusherRef.current = pusherInstance;

      return () => {
        channel.unbind_all();
        pusherInstance.unsubscribe(`user-${user._id}`);
        pusherInstance.disconnect();
        pusherRef.current = null;
      };
    }
  }, [isAuthenticated, user?._id]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  // Clear a specific notification
  const clearNotification = useCallback((index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAllAsRead,
        clearNotification,
        clearAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
