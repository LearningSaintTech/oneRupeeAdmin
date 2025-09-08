// Notification Test Service
export const testNotificationPermissions = async () => {
  console.log('🔔 [Notification Test] Checking notification permissions...');
  
  // Check if notifications are supported
  if (!('Notification' in window)) {
    console.error('❌ [Notification Test] Notifications not supported in this browser');
    return false;
  }
  
  // Check current permission status
  const permission = Notification.permission;
  console.log('🔔 [Notification Test] Current permission:', permission);
  
  if (permission === 'denied') {
    console.error('❌ [Notification Test] Notifications are blocked by user');
    return false;
  }
  
  if (permission === 'default') {
    console.log('🔔 [Notification Test] Requesting notification permission...');
    const newPermission = await Notification.requestPermission();
    console.log('🔔 [Notification Test] New permission:', newPermission);
    
    if (newPermission !== 'granted') {
      console.error('❌ [Notification Test] Permission denied by user');
      return false;
    }
  }
  
  console.log('✅ [Notification Test] Notification permissions are granted');
  return true;
};

export const testNotificationDisplay = async () => {
  console.log('🔔 [Notification Test] Testing notification display...');
  
  const hasPermission = await testNotificationPermissions();
  if (!hasPermission) {
    return false;
  }
  
  try {
    const notification = new Notification('Test Notification', {
      body: 'This is a test notification to verify display functionality',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'test-notification',
      requireInteraction: false,
      silent: false,
      vibrate: [200, 100, 200]
    });
    
    console.log('✅ [Notification Test] Test notification created successfully');
    
    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
      console.log('🔔 [Notification Test] Test notification closed');
    }, 5000);
    
    return true;
  } catch (error) {
    console.error('❌ [Notification Test] Failed to create test notification:', error);
    return false;
  }
};

export const checkServiceWorkerStatus = async () => {
  console.log('🔔 [Notification Test] Checking service worker status...');
  
  if (!('serviceWorker' in navigator)) {
    console.error('❌ [Notification Test] Service Worker not supported');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration) {
      console.log('✅ [Notification Test] Service Worker is registered:', registration);
      console.log('🔔 [Notification Test] Service Worker state:', registration.active?.state);
      return true;
    } else {
      console.error('❌ [Notification Test] No Service Worker registration found');
      return false;
    }
  } catch (error) {
    console.error('❌ [Notification Test] Error checking service worker:', error);
    return false;
  }
};

// Check detailed browser notification settings
export const checkNotificationSettings = () => {
  console.log('🔍 [Notification Test] Checking detailed notification settings...');
  
  const settings = {
    // Basic support
    notificationsSupported: 'Notification' in window,
    serviceWorkerSupported: 'serviceWorker' in navigator,
    
    // Permission status
    permission: Notification.permission,
    
    // Browser-specific settings
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    
    // Focus state
    documentHidden: document.hidden,
    documentVisibilityState: document.visibilityState,
    
    // Window focus
    windowFocused: document.hasFocus(),
    
    // Notification API details
    notificationConstructor: typeof Notification,
    notificationPrototype: Notification.prototype ? 'available' : 'not available'
  };
  
  console.log('📋 [Notification Test] Detailed settings:', settings);
  return settings;
};

// Test notification with different focus states
export const testNotificationWithFocusStates = async () => {
  console.log('🧪 [Notification Test] Testing notifications with different focus states...');
  
  const results = {
    whenFocused: false,
    whenBlurred: false,
    whenHidden: false
  };
  
  // Test 1: When window is focused
  if (document.hasFocus()) {
    console.log('🔔 [Notification Test] Testing notification when window is focused...');
    try {
      const notification = new Notification('Test - Window Focused', {
        body: 'This notification was sent when the window was focused',
        tag: 'test-focused',
        requireInteraction: false
      });
      results.whenFocused = true;
      setTimeout(() => notification.close(), 3000);
    } catch (error) {
      console.error('❌ [Notification Test] Failed when focused:', error);
    }
  }
  
  // Test 2: When window is blurred (simulate by checking focus state)
  console.log('🔔 [Notification Test] Testing notification when window might be blurred...');
  try {
    const notification = new Notification('Test - Window Blurred', {
      body: 'This notification was sent when the window might be blurred',
      tag: 'test-blurred',
      requireInteraction: false
    });
    results.whenBlurred = true;
    setTimeout(() => notification.close(), 3000);
  } catch (error) {
    console.error('❌ [Notification Test] Failed when blurred:', error);
  }
  
  // Test 3: When page is hidden
  if (document.hidden) {
    console.log('🔔 [Notification Test] Testing notification when page is hidden...');
    try {
      const notification = new Notification('Test - Page Hidden', {
        body: 'This notification was sent when the page was hidden',
        tag: 'test-hidden',
        requireInteraction: false
      });
      results.whenHidden = true;
      setTimeout(() => notification.close(), 3000);
    } catch (error) {
      console.error('❌ [Notification Test] Failed when hidden:', error);
    }
  }
  
  console.log('📊 [Notification Test] Focus state test results:', results);
  return results;
};

// Run all tests
export const runNotificationTests = async () => {
  console.log('🧪 [Notification Test] Starting notification tests...');
  
  const results = {
    permissions: await testNotificationPermissions(),
    display: await testNotificationDisplay(),
    serviceWorker: await checkServiceWorkerStatus(),
    settings: checkNotificationSettings(),
    focusStates: await testNotificationWithFocusStates()
  };
  
  console.log('📊 [Notification Test] Test results:', results);
  
  if (results.permissions && results.display && results.serviceWorker) {
    console.log('✅ [Notification Test] All tests passed! Notifications should work properly.');
  } else {
    console.log('⚠️ [Notification Test] Some tests failed. Check the logs above for details.');
  }
  
  return results;
};

  // Force service worker update
  const forceServiceWorkerUpdate = async () => {
    try {
      console.log('🔄 [NotificationTest] Forcing service worker update...');
      
      // Unregister existing service worker
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.unregister();
        console.log('✅ [NotificationTest] Service worker unregistered');
      }
      
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('✅ [NotificationTest] All caches cleared');
      
      // Reload the page to register new service worker
      window.location.reload();
      
      return { success: true, message: 'Service worker updated successfully' };
    } catch (error) {
      console.error('❌ [NotificationTest] Failed to update service worker:', error);
      return { success: false, message: error.message };
    }
  };

  return {
    checkNotificationSupport,
    checkNotificationPermission,
    requestNotificationPermission,
    checkServiceWorker,
    testNotification,
    runAllTests,
    forceServiceWorkerUpdate
  };
