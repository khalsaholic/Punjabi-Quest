/*
  Punjabi Quest Firebase settings
  1) Create a Firebase project.
  2) Add a Web app in Firebase Project settings.
  3) Copy the firebaseConfig values into this file.
  4) Set enabled to true.
  5) Optional push notifications: add a Web Push certificate VAPID key.

  This file is safe to commit after replacing the config. Firebase web API keys are not secret,
  but your Firestore security rules still must protect user data.
*/
window.PQ_FIREBASE_CONFIG = {
  enabled: false,
  firebaseConfig: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID"
  },
  vapidKey: "YOUR_FIREBASE_WEB_PUSH_VAPID_KEY_OPTIONAL"
};
