/*
  Firebase Cloud Messaging service worker for Punjabi Quest.
  This is activated only after Firebase is configured and push notifications are enabled.
*/
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// IMPORTANT: Keep this config in sync with js/firebase-config.js after Firebase setup.
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

try {
  if (!firebase.apps.length && firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('YOUR_')) {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const title = payload?.notification?.title || 'Punjabi Quest';
      const options = {
        body: payload?.notification?.body || 'Time for a short Punjabi practice.',
        icon: './assets/icons/icon.svg',
        badge: './assets/icons/icon.svg',
        data: payload?.data || {}
      };
      self.registration.showNotification(title, options);
    });
  }
} catch (err) {
  // Push is optional. The main app still works if FCM is unavailable.
}
