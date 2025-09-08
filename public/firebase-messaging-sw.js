importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyBXzETYYC5EbDy_F2KhREgnjuJFbcXIwSM",
  authDomain: "learningsaint-971bd.firebaseapp.com",
  projectId: "learningsaint-971bd",
  storageBucket: "learningsaint-971bd.firebasestorage.app",
  messagingSenderId: "830620644032",
  appId: "1:830620644032:web:9b20cb273057185426f325",
  measurementId: "G-7P2WFKY63F"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'one-rupee-notification-' + Date.now(),
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Open', icon: '/favicon.ico' },
      { action: 'close', title: 'Close', icon: '/favicon.ico' }
    ],
    data: payload.data || {},
    timestamp: Date.now()
  };

  console.log("[firebase-messaging-sw.js] Showing notification with options:", notificationOptions);
  
  return self.registration.showNotification(notificationTitle, notificationOptions)
    .then(() => {
      console.log("[firebase-messaging-sw.js] Notification displayed successfully");
    })
    .catch(error => {
      console.error("[firebase-messaging-sw.js] Failed to show notification:", error);
    });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log("[firebase-messaging-sw.js] Notification clicked:", event);
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(clients.openWindow('/notifications'));
  } else if (event.action === 'close') {
    event.notification.close();
  } else {
    event.waitUntil(clients.openWindow('/'));
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log("[firebase-messaging-sw.js] Notification closed:", event);
});

// Service worker installation
self.addEventListener('install', (event) => {
  console.log("[firebase-messaging-sw.js] Installing service worker...");
  self.skipWaiting();
});

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log("[firebase-messaging-sw.js] Activating service worker...");
  event.waitUntil(self.clients.claim());
});