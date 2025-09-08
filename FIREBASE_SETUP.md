# Firebase FCM Setup Guide

This guide will help you set up Firebase Cloud Messaging (FCM) for push notifications in the OneRupee Classroom Admin Panel.

## Prerequisites

1. A Firebase project
2. Firebase Admin SDK credentials
3. Web app registered in Firebase

## Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable Cloud Messaging in the project

## Step 2: Web App Configuration

1. In Firebase Console, go to **Project Settings** > **General**
2. Scroll down to **"Your apps"** section
3. Click the web app icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "OneRupee Admin Panel")
5. Copy the Firebase configuration object

## Step 3: Update Configuration Files

### Frontend Configuration

1. **Update `src/Admin/Services/firebaseConfig.js`:**
   ```javascript
   export const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   
   export const vapidKey = "your-vapid-key";
   ```

2. **Update `public/firebase-messaging-sw.js`:**
   ```javascript
   const firebaseConfig = {
     apiKey: "your-actual-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

### Backend Configuration

1. **Update your `.env` file with Firebase Admin SDK credentials:**
   ```env
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY_ID=your-private-key-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your-client-id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com
   FIREBASE_UNIVERSE_DOMAIN=googleapis.com
   ```

## Step 4: Get Firebase Admin SDK Credentials

1. In Firebase Console, go to **Project Settings** > **Service accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. Copy the values from the JSON file to your `.env` file

## Step 5: Get VAPID Key

1. In Firebase Console, go to **Project Settings** > **Cloud Messaging**
2. Scroll down to **"Web configuration"** section
3. Click **"Generate key pair"**
4. Copy the generated public key
5. Update the `vapidKey` in `firebaseConfig.js`

## Step 6: Test the Integration

1. Start your backend server
2. Start your frontend development server
3. Login to the admin panel
4. Check the browser console for FCM token generation logs
5. Test by hitting the internship letter APIs

## How It Works

### Frontend Flow:
1. User logs in with OTP
2. FCM token is requested from Firebase
3. Token is sent to backend during OTP verification
4. Token is saved in database and Redux store
5. Service worker handles background notifications

### Backend Flow:
1. OTP verification saves FCM token to database
2. When internship letter APIs are hit, notifications are sent to all admin users
3. Firebase Admin SDK sends push notifications to all registered devices

### Notification Types:
- **Internship Letter Requests**: Sent when users request internship letters
- **Payment Confirmations**: Sent when payments are verified
- **Upload Confirmations**: Sent when admins upload letters

## Troubleshooting

### Common Issues:

1. **"Firebase not initialized" error:**
   - Check if Firebase config is correct
   - Ensure all required fields are filled

2. **"Permission denied" error:**
   - Check if user has granted notification permission
   - Try refreshing the page and granting permission again

3. **"VAPID key not found" error:**
   - Ensure VAPID key is correctly set in firebaseConfig.js
   - Check if the key is valid in Firebase Console

4. **"Service worker not registered" error:**
   - Check if firebase-messaging-sw.js is in the public folder
   - Ensure the service worker is being served correctly

### Debug Steps:

1. Check browser console for FCM-related logs
2. Check backend logs for Firebase Admin SDK errors
3. Verify FCM tokens are being saved in the database
4. Test with Firebase Console's "Send test message" feature

## Security Notes

1. Never commit Firebase credentials to version control
2. Use environment variables for sensitive data
3. Regularly rotate Firebase Admin SDK keys
4. Monitor Firebase usage and costs

## Support

If you encounter issues:
1. Check Firebase Console for error messages
2. Review browser console logs
3. Check backend server logs
4. Verify all configuration values are correct
