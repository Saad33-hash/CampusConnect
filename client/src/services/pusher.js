import Pusher from 'pusher-js';

// Pusher configuration
const PUSHER_KEY = '4ac5da104157d01a9278';
const PUSHER_CLUSTER = 'ap2';

// Singleton Pusher instance
let pusherInstance = null;
let connectionCount = 0;

/**
 * Get or create the shared Pusher instance
 */
export const getPusherInstance = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
    });

    // Log connection state changes for debugging
    pusherInstance.connection.bind('state_change', (states) => {
      console.log('Pusher state:', states.previous, '->', states.current);
    });

    pusherInstance.connection.bind('error', (error) => {
      console.error('Pusher connection error:', error);
    });
  }
  
  connectionCount++;
  return pusherInstance;
};

/**
 * Release the Pusher instance (call when component unmounts)
 * Only disconnects when all users have released
 */
export const releasePusherInstance = () => {
  connectionCount = Math.max(0, connectionCount - 1);
  // Don't disconnect - keep connection alive for better UX
  // The browser will close it when the page unloads
};

/**
 * Subscribe to a channel
 */
export const subscribeToChannel = (channelName) => {
  const pusher = getPusherInstance();
  const channel = pusher.subscribe(channelName);
  
  channel.bind('pusher:subscription_succeeded', () => {
    console.log(`Successfully subscribed to channel: ${channelName}`);
  });
  
  channel.bind('pusher:subscription_error', (error) => {
    console.error(`Failed to subscribe to channel ${channelName}:`, error);
  });
  
  return channel;
};

/**
 * Unsubscribe from a channel
 */
export const unsubscribeFromChannel = (channelName) => {
  if (pusherInstance) {
    pusherInstance.unsubscribe(channelName);
  }
};

export default {
  getPusherInstance,
  releasePusherInstance,
  subscribeToChannel,
  unsubscribeFromChannel,
};
