// Firebase Configuration
// Replace these values with your actual Firebase project credentials

export const firebaseConfig = {
  apiKey: "AIzaSyBXzETYYC5EbDy_F2KhREgnjuJFbcXIwSM",
  authDomain: "learningsaint-971bd.firebaseapp.com",
  projectId: "learningsaint-971bd",
  storageBucket: "learningsaint-971bd.firebasestorage.app",
  messagingSenderId: "830620644032",
  appId: "1:830620644032:web:9b20cb273057185426f325",
  measurementId: "G-7P2WFKY63F"
};

// VAPID Key for web push notifications
// This should be the public key from Firebase Console > Project Settings > Cloud Messaging > Web configuration
export const vapidKey = "BESkMGJgNZaREbn81pYsmEK44YgAdG3SnNonGkJwNJFfcB_ZWK7cQn1Z0aMUOCTSFWuNHlc_qG3r3idaARdh5CU";

// Instructions to get these values:
// 1. Go to Firebase Console (https://console.firebase.google.com/)
// 2. Create a new project or select existing one
// 3. Go to Project Settings > General
// 4. Scroll down to "Your apps" section
// 5. Click on the web app icon (</>) to add a web app
// 6. Register your app and copy the config values
// 7. For VAPID key, go to Project Settings > Cloud Messaging
// 8. Scroll down to "Web configuration" section
// 9. Generate a new key pair and copy the public key
