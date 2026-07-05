# Punjabi Quest v1.2.2

Punjabi Quest is a GitHub Pages-ready Punjabi learning app for Sujaan, Guntaas, and Guest. Version 1.2.2 keeps the v1.2.1 Firebase, Google Sign-In, and Live Battle Mode foundation, then adds cumulative lesson recycling, Daily Challenge, improved audio/speech handling, stricter transliteration/translation controls, parent-protected lesson reset, and Papa Ji consistency fixes.

## Important update checklist

Before replacing files in GitHub for any future update:

1. Confirm cloud sync is active and not showing “Local only.”
2. Export Sujaan’s progress from Parent Dashboard.
3. Export Guntaas’s progress from Parent Dashboard.
4. Save those exports in iCloud Drive or another safe folder.
5. Upload the new app files to GitHub and commit changes.
6. After GitHub Pages updates, sign in and verify XP, streaks, badges, and completed lessons.

Student progress is stored in Firebase after cloud sync is active. Replacing GitHub files updates the app code, not the Firebase progress database.

## What is included

- Everything from Punjabi Quest v1.2
- 12 worlds and 312 generated starter lessons
- Separate child profiles: Sujaan, Guntaas, and Guest
- PINs: Sujaan `0815`, Guntaas `0731`
- No ages displayed anywhere in the app
- Gurmukhi from day one, transliteration hidden by default
- SpeechSynthesis audio buttons
- Web Speech API speaking practice where supported
- Stories, conversation practice, reading feed, missions, and parent dashboard
- Papa Ji guide, correct-answer, incorrect-answer, and lesson-complete expressions
- Firebase cloud sync with localStorage fallback
- Parent login with Google Sign-In
- Parent login with Email/Password, kept for fallback
- Sign out button
- Google and Email/Password account linking support when the same email is used
- Parent dashboard showing the signed-in account and sign-in provider
- Live Battle Mode for two players on two devices
- Live Firestore scoreboard
- Personalized battle questions based on each player’s progress
- Correct answer: +1 point
- Incorrect answer: -1 point
- First player to 10 points wins
- Rematch button
- Sikh-inspired khanda, shield, and kirpan-style battle graphics using respectful icons
- Daily Challenge using only completed lesson content
- Cumulative lessons that recycle earlier vocabulary and phrases
- Active student participation in every lesson dialogue
- Papa Ji restricted to host, teacher, guide, and encourager roles
- Transliteration and translation hidden by default with Show buttons
- Blue transliteration and red translation text when revealed
- Tappable Punjabi text for pronunciation audio across the app
- Improved pronunciation exercise flow: Speak → Check, colored Heard text, and retry support
- Correct and incorrect answer sound effects
- Parent-protected individual lesson reset
- Parent PIN is never displayed
- Removed parent PIN hints and old parent note text
- Removed confusing App Speaks wording
- Additional Papa Ji visual variations for listening, thinking, review, and battle support

## Live Battle Mode

Live Battle Mode uses Firestore so two devices can see the same match in real time.

How to use:

1. Sign into the same parent account on both devices.
2. On device 1, choose Sujaan or Guntaas, open **Battle**, then tap **Create battle**.
3. Copy or read the battle code.
4. On device 2, choose the other child profile, open **Battle**, enter the code, then tap **Join battle**.
5. Both players answer their own personalized questions.
6. The shared scoreboard updates live.
7. First to 10 points wins.
8. Tap **Start rematch** to reset the same match for another round.

Important: both devices should use the same Firebase parent account, because the battle is stored under that parent’s family account.

## File structure

```text
punjabi-quest-v1.2.2/
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

For an existing Punjabi Quest repository:

1. Export both students’ progress first.
2. Unzip this folder.
3. Upload everything inside `punjabi-quest-v1.2.2` to the root of the GitHub repository.
4. Commit changes.
5. Wait 1 to 3 minutes for GitHub Pages to update.
6. Open the app with a cache-busting URL if needed, for example `?v=122`.

Do not upload the ZIP itself.

## Firebase setup notes

This v1.2.2 package includes the Firebase Web app config that was already created for this project in:

```text
js/firebase-config.js
```

You should not need to recreate the Firebase project, Authentication, or Firestore database.

### Authentication providers

In Firebase Authentication, enable both:

- Google
- Email/Password

Google Sign-In is now shown directly in the app.

### Firestore security rules for v1.2.2

Live Battle Mode stores match documents under each signed-in parent’s family document. Use these rules so the signed-in parent can read and write only their own family data, backups, devices, and battles:

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

      match /battles/{battleId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

If cloud sync or Battle Mode says “Check Firestore rules,” paste and publish the rules above in Firebase Console > Firestore Database > Rules.

## Push notifications limitation

This static GitHub Pages app can register a device for Firebase Cloud Messaging after Firebase is configured and a VAPID key is added. Actually sending scheduled push reminders requires Firebase Console campaigns or a future backend/scheduled function. No backend is included because this project is designed to stay GitHub Pages-compatible.

## Keeping progress safe

Cloud sync is the primary backup after Firebase is configured. You can still use **Parent Dashboard > Export progress** before major changes.

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
