import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { NotificationContext } from './notificationContextDef';
import { getPusherInstance, releasePusherInstance, subscribeToChannel, unsubscribeFromChannel } from '../services/pusher';

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
  const subscribedRef = useRef(false);

  // Get user ID (could be 'id' or '_id' depending on source)
  const userId = user?.id || user?._id;

  // Initialize notifications from localStorage (lazy initialization)
  const [notifications, setNotifications] = useState(() => {
    if (userId) {
      return loadNotifications(userId);
    }
    return [];
  });

  const [unreadCount, setUnreadCount] = useState(() => {
    if (userId) {
      const stored = loadNotifications(userId);
      return stored.filter(n => !n.read).length;
    }
    return 0;
  });

  // Load notifications when userId changes (after initial render)
  const prevUserIdRef = useRef(userId);
  useEffect(() => {
    if (userId && userId !== prevUserIdRef.current) {
      prevUserIdRef.current = userId;
      const stored = loadNotifications(userId);
      // Use queueMicrotask to avoid synchronous setState in effect
      queueMicrotask(() => {
        setNotifications(stored);
        setUnreadCount(stored.filter(n => !n.read).length);
      });
    }
  }, [userId]);

  // Initialize Pusher when user is authenticated
  useEffect(() => {
    if (isAuthenticated && userId && !subscribedRef.current) {
      console.log('Subscribing to notification channel:', `user-${userId}`);
      subscribedRef.current = true;
      
      // Get shared Pusher instance
      getPusherInstance();

      // Subscribe to user-specific channel
      const channel = subscribeToChannel(`user-${userId}`);
      
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

      return () => {
        subscribedRef.current = false;
        channel.unbind_all();
        unsubscribeFromChannel(`user-${userId}`);
        releasePusherInstance();
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

