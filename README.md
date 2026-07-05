# Punjabi Quest v1.2

Punjabi Quest is a GitHub Pages-ready Punjabi learning app for Sujaan, Guntaas, and Guest. Version 1.2 keeps the v1.1 Firebase cloud-sync features and adds Papa Ji, the friendly host character, guide, mentor, and encouragement figure throughout the learning experience.

## What is included

- 12 worlds and 312 generated starter lessons
- Separate child profiles: Sujaan, Guntaas, and Guest
- PINs: Sujaan `0815`, Guntaas `0731`
- No ages displayed anywhere in the app
- Gurmukhi from day one, transliteration hidden by default
- SpeechSynthesis audio buttons
- Web Speech API speaking practice where supported
- Stories, conversation practice, reading feed, missions, and parent dashboard
- localStorage fallback progress
- Firebase Authentication email/password parent login
- Firestore cloud progress sync
- Daily automatic Firestore backup documents
- Manual cloud backup button
- Firestore offline persistence where the browser supports it
- PWA install support for iPad and laptop
- Firebase Cloud Messaging token registration for future push reminders
- Papa Ji host character with guide, correct-answer, incorrect-answer, and lesson-complete expressions


## Papa Ji host character

Version 1.2 incorporates Papa Ji as the learner’s friendly guide and mentor. Papa Ji appears in onboarding, lesson guidance, correct-answer feedback, supportive incorrect-answer feedback, conversation practice, story quizzes, and lesson-complete celebration screens.

The Papa Ji character assets are stored in:

```text
assets/characters/
```

To replace or improve the character later, keep the same filenames and image proportions where possible. The app will automatically use the updated files.

## Important limitation about push notifications

This static GitHub Pages app can register a device for Firebase Cloud Messaging after Firebase is configured and a VAPID key is added. Actually sending scheduled push reminders requires messages to be sent from Firebase Console or from a backend/scheduled function. No backend is included because this project is designed to stay static and GitHub Pages-compatible.

On iPad and iPhone, web push works only for web apps added to the Home Screen on supported iOS/iPadOS versions. Regular Safari tabs may not behave the same way.

## File structure

```text
punjabi-quest-v1.2/
├── index.html
├── manifest.webmanifest
├── sw.js
├── firebase-messaging-sw.js
├── README.md
├── chatgpt-project-instructions.md
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── firebase-config.js
│   └── data/
│       ├── alphabet.js
│       ├── course.js
│       └── stories.js
└── assets/
    ├── audio/
    ├── icons/
    │   └── icon.svg
    └── characters/
        ├── papa-ji-guide.png
        ├── papa-ji-correct.png
        ├── papa-ji-incorrect.png
        └── papa-ji-complete.png
```

## Deploy to GitHub Pages

1. Create a public GitHub repository.
2. Upload all files and folders from this project into the repository root.
3. Go to **Settings > Pages**.
4. Set source to **Deploy from a branch**.
5. Set branch to **main** and folder to **/ root**.
6. Save and wait for GitHub Pages to publish.

## Firebase setup

### 1. Create a Firebase project

Go to Firebase Console and create a new project.

### 2. Add a Web app

Inside the Firebase project, add a Web app. Firebase will show a `firebaseConfig` object.

### 3. Enable Authentication

Go to **Build > Authentication > Sign-in method**.
Enable **Email/Password**.

### 4. Create Firestore database

Go to **Build > Firestore Database**.
Create a database. For a family app, start in production mode and use the rules below.

### 5. Paste Firebase config

Open:

```text
js/firebase-config.js
```

Paste your Firebase Web app config and set:

```js
enabled: true
```

Also open:

```text
firebase-messaging-sw.js
```

Paste the same `firebaseConfig` values into that file if you want Firebase Cloud Messaging support.

### 6. Firestore security rules

Use these starter rules so each signed-in parent can only read and write their own family document and backups:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /backups/{backupId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /devices/{deviceId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 7. Optional: Web Push VAPID key

In Firebase Console, go to **Project Settings > Cloud Messaging** and generate a Web Push certificate key pair. Copy the VAPID key into:

```text
js/firebase-config.js
```

Push registration can then save the device token in Firestore. To actually send push reminders, use Firebase Console campaigns or add a later scheduled backend.

## How cloud sync works

1. The app always saves to localStorage first.
2. If the parent is signed in, the app uploads the whole family progress state to Firestore.
3. Other signed-in devices listen for updates and merge the state.
4. A daily automatic backup document is created in Firestore.
5. Manual backup is available in Parent Dashboard.
6. If the device goes offline, local progress continues and sync resumes when online.

## How to use on iPad

1. Open the GitHub Pages link in Safari.
2. Tap Share.
3. Tap **Add to Home Screen**.
4. Open Punjabi Quest from the Home Screen icon.
5. Sign in with the parent email account.

## Keeping progress safe

Cloud sync is the primary backup after Firebase is configured. You can still use **Parent Dashboard > Export progress** as a manual backup before major changes.

## Adding more content

Course content lives in:

```text
js/data/course.js
```

Stories, conversations, feed, and missions live in:

```text
js/data/stories.js
```

Alphabet and vowel cards live in:

```text
js/data/alphabet.js
```

