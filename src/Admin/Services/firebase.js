import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseConfig, vapidKey } from './firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission and get FCM token
export const requestForToken = async () => {
  try {
    console.log('🔔 [Firebase] Requesting notification permission...');
    
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {

      console.log('🔔 [Firebase] Notification permission denied');
      return null;
    }

    console.log('🔔 [Firebase] Notification permission granted, getting FCM token...');
    
    // Try to get FCM token with VAPID key
    let token;
    try {
      token = await getToken(messaging, {
        vapidKey: vapidKey
      });
    } catch (vapidError) {
      console.warn('🔔 [Firebase] VAPID key error, trying without VAPID key:', vapidError);
      // Fallback: try without VAPID key
      try {
        token = await getToken(messaging);
      } catch (fallbackError) {
        console.error('🔔 [Firebase] Fallback token request failed:', fallbackError);
        return null;
      }
    }

    if (token) {
      console.log('🔔 [Firebase] FCM token obtained:', token.substring(0, 20) + '...');
      return token;
    } else {
      console.log('🔔 [Firebase] No FCM token available');
      return null;
    }
  } catch (error) {
    console.error('🔔 [Firebase] Error getting FCM token:', error);
    return null;
  }
};

// Generate device 
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// Handle foreground messages
export const onMessageListener = () => {
  return new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('🔔 [Firebase] Foreground message received:', payload);
      resolve(payload);
    });
  });
};

// Initialize Firebase messaging
export const initializeFirebaseMessaging = async () => {
  try {
    console.log('🔔 [Firebase] Initializing Firebase messaging...');
    
    // Request token
    const token = await requestForToken();
    if (token) {
      console.log('🔔 [Firebase] Firebase messaging initialized successfully');
      return token;
    } else {
      console.log('🔔 [Firebase] Failed to get FCM token');
      return null;
    }
  } catch (error) {
    console.error('🔔 [Firebase] Error initializing Firebase messaging:', error);
    return null;
  }
};

// Test notification function
export const testNotification = async () => {
  try {
    console.log('🧪 [Firebase] Testing notification display...');
    
    // Check if we have permission
    if (Notification.permission !== 'granted') {
      console.log('🔔 [Firebase] Requesting notification permission for test...');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.error('❌ [Firebase] Permission denied for test notification');
        return false;
      }
    }
    
    // Create a test notification
    const notification = new Notification('Test Notification', {
      body: 'This is a test notification from Firebase service',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'firebase-test',
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200]
    });
    
    console.log('✅ [Firebase] Test notification created successfully');
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
      console.log('🔔 [Firebase] Test notification closed');
    }, 5000);
    
    return true;
  } catch (error) {
    console.error('❌ [Firebase] Failed to create test notification:', error);
    return false;
  }
};

export default messaging;
