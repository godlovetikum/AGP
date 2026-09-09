# Account Register

AGP is a **bare React Native** offline digital account register and filing system. It organizes accounts, platforms, services, subscriptions, projects, clients, and related links in one structured local reference system. Social-media accounts are one supported category, not the product boundary.

The app includes a compact register interface. You can search records, add a record, see structured account fields, archive a record, and keep non-secret records across restarts. Persistence uses one small manually registered Android module backed by `SharedPreferences`; there is no auto-linked storage dependency.

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
| Navigation | React Navigation native stack |
| Database | None; non-secret JSON is stored in Android `SharedPreferences` |
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

## Security boundary

Passwords are never stored in ordinary register JSON. They use the native secure-storage bridge when available, and reveal/copy actions remain explicit. Backup, sharing, and export are intentionally deferred while the offline register foundation is completed.

## GitHub Actions build behavior

The workflow does not depend on a committed Gradle wrapper JAR or debug keystore. It installs Gradle 9.3.1, runs the Gradle `wrapper` task, generates the wrapper JAR, creates `android/app/debug.keystore` when absent, then runs the checks and assembles the APK. The generated APK and generated Android tooling are uploaded as workflow artifacts.
