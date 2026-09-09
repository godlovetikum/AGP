# AGP implementation status

The current branch implements the requested non-backup application workflows.

Implemented: account creation and editing, detail view, archive/restore/delete, active/paused/archived/all status filtering, client filtering, platform filtering, tag filtering, client CRUD with archive/restore, project CRUD with client assignment and archive/restore, platform CRUD with archive/restore, verification dates, background PIN locking, hashed PIN storage, biometric authentication through AndroidX Biometric, Android Keystore-backed password storage, password reveal, native clipboard copy with 30-second clearing, and secure password cleanup on record deletion, recent-app screenshot protection.

Intentionally deferred: backup-related work only. The existing JSON backup screen remains in place, but native file export/import, encrypted backups, automatic rollback, and backup sharing are not part of this pass.

Validation performed for this pass: `git diff --check` and `npm run typecheck`. No Gradle or APK build was run locally. The GitHub Actions runner remains responsible for Android compilation and will validate the AndroidX biometric dependency and Kotlin code.
