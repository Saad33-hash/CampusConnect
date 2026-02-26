import { useEffect, useState, useCallback, useRef } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from '../hooks/useAuth';
import { NotificationContext } from './notificationContextDef';

// Pusher configuration
const PUSHER_KEY = '4ac5da104157d01a9278';
const PUSHER_CLUSTER = 'ap2';

// Helper to load notifications from localStorage
const loadNotifications = (userId) => {
  try {
    const stored = localStorage.getItem(`notifications_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Helper to save notifications to localStorage
const saveNotifications = (userId, notifications) => {
  try {
    localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const pusherRef = useRef(null);
  const subscribedRef = useRef(false);

  // Get user ID (could be 'id' or '_id' depending on source)
  const userId = user?.id || user?._id;

  // Load notifications from localStorage when user changes
  useEffect(() => {
    if (userId) {
      const stored = loadNotifications(userId);
      setNotifications(stored);
      setUnreadCount(stored.filter(n => !n.read).length);
    }
  }, [userId]);

  // Initialize Pusher when user is authenticated
  useEffect(() => {
    if (isAuthenticated && userId && !subscribedRef.current) {
      console.log('Subscribing to Pusher channel:', `user-${userId}`);
      subscribedRef.current = true;
      
      const pusherInstance = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        forceTLS: true
      });

      // Subscribe to user-specific channel
      const channel = pusherInstance.subscribe(`user-${userId}`);
      
      channel.bind('notification', (data) => {
        console.log('Received notification:', data);
        const newNotification = { ...data, read: false };
        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          saveNotifications(userId, updated); // Save immediately
          return updated;
        });
        setUnreadCount(prev => prev + 1);
      });

      pusherRef.current = pusherInstance;

      return () => {
        subscribedRef.current = false;
        channel.unbind_all();
        pusherInstance.unsubscribe(`user-${userId}`);
        pusherInstance.disconnect();
        pusherRef.current = null;
      };
    }
  }, [isAuthenticated, userId]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      if (userId) saveNotifications(userId, updated);
      return updated;
    });
    setUnreadCount(0);
  }, [userId]);

  // Clear a specific notification
  const clearNotification = useCallback((index) => {
    setNotifications(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (userId) saveNotifications(userId, updated);
      return updated;
    });
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [userId]);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    if (userId) localStorage.removeItem(`notifications_${userId}`);
  }, [userId]);

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
