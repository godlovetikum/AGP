# Account Register

Account Register is a small **bare React Native** Android starter for managing social-media account information offline. It is designed for a social-media account manager who needs a structured register rather than a free-form notes application.

The starter currently includes a working in-memory interface. You can search sample records, add a record, see structured account fields, and archive a record. The app does not yet persist data after a process restart. That boundary is intentional: the first scaffold keeps the native dependency surface small so the Android build remains easy to understand.

## Chosen baseline

| Part | Pinned choice |
| --- | --- |
| React Native | `0.86.3` |
| React | `19.2.3` |
| Node.js | `22.13.0` in `.nvmrc`; React Native requires Node `22.11.0+` for this line |
| Android compile SDK | `36` from the generated template |
| Android target SDK | `36` from the generated template |
| Android minimum SDK | `24` |
| Gradle wrapper | `9.3.1` |
| Kotlin | `2.1.20` |
| TypeScript | `^5.8.3` |
| Java for CI | JDK 17, matching React Native guidance |
| Navigation | Not installed in the starter |
| Database | Not installed in the starter |
| Expo | Not used |

React Native 0.86.3 is a deliberate pin. It gives this project a modern Android template while avoiding an unbounded `latest` dependency. Do not upgrade React Native as part of a feature change. Treat an upgrade as a separate maintenance project.

## Run the project locally

Install Node 22.13.0, Android Studio, Android SDK Platform 36, and JDK 17. Then run:

```bash
npm install
npm run lint
npm test -- --runInBand
npm run android
```

The Android command needs either an Android emulator or a USB-connected Android device with developer mode enabled.

## What to read next

The detailed teaching guide is in [`docs/BUILD_GUIDE.md`](docs/BUILD_GUIDE.md). It explains the folder structure, JavaScript-to-TypeScript transition, Android build files, data model, persistence options, testing, and GitHub Actions.

## Important MVP limitation

The password field is present only to reserve the product shape. This starter stores it in React state and does not persist it securely. Do not enter real passwords. The first persistence implementation should either omit the password field or add proper encrypted storage as a separate, explicitly tested feature.
