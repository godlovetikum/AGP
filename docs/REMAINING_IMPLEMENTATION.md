# AGP Remaining Implementation Specification

## 1. Current position

AGP is currently a working Android MVP. It can add non-secret account records, search them, archive them, and retain them across restarts. The Android build is wired to GitHub Actions, and the workflow generates the Gradle wrapper JAR and debug keystore on the runner.

The MVP is **not feature-complete** against the original product plan. This document is the exact remaining implementation specification. It is written so the next developer can implement the work without guessing the intended behavior.

## 2. Features still required

The remaining work is divided into four groups:

| Group | Features |
| --- | --- |
| Record management | Edit records, detail view, status filters, restore archived records, delete records |
| Organization | Client management, project management, platform management, tags |
| Data portability | Export, import, backup, restore |
| Privacy and convenience | App PIN, biometric unlock, secure password field, clipboard copy and clearing |

Cloud synchronization and team sharing are intentionally excluded from the first complete offline release because they require a backend, authentication, conflict resolution, and account ownership decisions.

## 3. Target data model

Replace the current flat type in `App.tsx` with shared types in a new file:

```text
src/domain/models.ts
```

Use this model:

```ts
export type RecordStatus = 'active' | 'paused' | 'archived';

export type AccountRecord = {
  id: string;
  clientId: string;
  projectId?: string;
  platformId: string;
  accountName: string;
  email: string;
  username: string;
  passwordRef?: string;
  status: RecordStatus;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
};

export type Client = {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  clientId: string;
  name: string;
  notes: string;
  status: 'active' | 'paused' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type Platform = {
  id: string;
  name: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
};

export type RegisterData = {
  schemaVersion: 1;
  records: AccountRecord[];
  clients: Client[];
  projects: Project[];
  platforms: Platform[];
  tags: string[];
  updatedAt: string;
};
```

Do not store plaintext passwords in `RegisterData`. `passwordRef` must refer to a separate secure-storage entry when password support is implemented.

## 4. Storage layer

Move persistence out of the screen and create:

```text
src/storage/registerStore.ts
```

The storage interface must be:

```ts
export interface RegisterStore {
  load(): Promise<RegisterData>;
  save(data: RegisterData): Promise<void>;
  clear(): Promise<void>;
}
```

The current native Android `AccountStorage` module may remain the low-level JSON transport. The TypeScript store must add:

1. Default data creation.
2. Schema-version validation.
3. Migration from the current flat MVP data shape.
4. Recovery from invalid JSON.
5. Atomic save behavior from the JavaScript point of view.
6. A single storage key and documented version number.

The initial migration must convert the current fields as follows:

| MVP field | Complete model field |
| --- | --- |
| `client` | Create or reuse a `Client`, then save `clientId` |
| `project` | Create or reuse a `Project`, then save `projectId` |
| `platform` | Create or reuse a `Platform`, then save `platformId` |
| `accountName` | `accountName` |
| `email` | `email` |
| `username` | `username` |
| `status` | Lowercase status |
| `notes` | `notes` |
| `password` | Discard during migration |

## 5. Record management screens

Create the following files:

```text
src/screens/RegisterScreen.tsx
src/screens/AccountDetailScreen.tsx
src/screens/AccountFormScreen.tsx
src/components/AccountCard.tsx
src/components/StatusBadge.tsx
src/components/SearchBar.tsx
src/components/EmptyState.tsx
```

Use React Navigation only when these screens are introduced. The navigation routes must be:

```text
Register
AccountDetail
AccountForm
Clients
ClientDetail
Projects
ProjectDetail
Platforms
Settings
Backup
Security
```

### Register screen

The register screen must provide:

- Search across client, project, platform, account name, email, username, and tags.
- A status filter for Active, Paused, Archived, and All.
- A platform filter.
- A client filter.
- A “Needs verification” filter based on `lastVerifiedAt` being absent or older than 90 days.
- An add button.
- A compact account card.
- Empty states for no records and no search matches.

The default view must show active records only. Archived records must not appear unless the user selects Archived or All.

### Account detail screen

The detail screen must show:

- Client.
- Project.
- Platform.
- Account name.
- Email.
- Username.
- Status.
- Tags.
- Last verified date.
- Notes.

Actions must include:

- Edit.
- Mark active.
- Mark paused.
- Archive.
- Restore archived record.
- Delete permanently after confirmation.
- Mark as verified today.

The screen must never display the password value in ordinary record data.

### Account form screen

Required fields:

- Client.
- Platform.
- Account name.

Optional fields:

- Project.
- Email.
- Username.
- Password.
- Notes.
- Tags.
- Status.

The form must support both create and edit modes. Validation errors must appear beside the relevant field. Saving must update `updatedAt` and preserve `createdAt` during edits.

## 6. Clients, projects, and platforms

Create these screens:

```text
src/screens/ClientsScreen.tsx
src/screens/ProjectsScreen.tsx
src/screens/PlatformsScreen.tsx
```

### Clients

The client screen must allow creating, renaming, archiving, and viewing all records associated with a client. Deleting a client is not allowed while records refer to it. The UI must explain that the records must be reassigned first.

### Projects

Projects belong to one client. The project screen must allow creating, editing, pausing, archiving, and viewing records associated with a project.

### Platforms

Seed these platforms on first installation:

```text
Instagram
Facebook
TikTok
YouTube
LinkedIn
X
Pinterest
Email
Other
```

The user must be able to add custom platforms. A platform cannot be deleted while a record refers to it; it may be archived instead.

## 7. Tags

Tags must be stored as normalized strings:

- Trim whitespace.
- Convert repeated spaces to one space.
- Compare case-insensitively.
- Preserve a display form chosen by the user.
- Do not allow duplicate tags on one record.

The form must allow adding and removing tags. The register screen must allow filtering by one tag.

## 8. Navigation and app structure

Add a minimal bottom navigation or menu with these destinations:

```text
Register
Clients
Projects
Settings
```

Do not place every control on the home screen. The register screen should remain visually quiet. Management screens and backup/security options belong under navigation or Settings.

Use one navigation dependency and pin its version family. After adding it, update the documentation with the exact package versions and run the full source validation workflow.

## 9. Backup and restore

Create:

```text
src/backup/backupFormat.ts
src/screens/BackupScreen.tsx
```

The backup format must be a versioned JSON document:

```json
{
  "format": "agp-register-backup",
  "formatVersion": 1,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "data": {
    "schemaVersion": 1,
    "records": [],
    "clients": [],
    "projects": [],
    "platforms": [],
    "tags": [],
    "updatedAt": "2026-01-01T00:00:00.000Z"
  }
}
```

The backup screen must support:

1. Exporting a backup.
2. Importing a backup.
3. Validating the format before changing local data.
4. Showing a preview count before import.
5. Replacing local data only after an explicit confirmation.
6. Creating an automatic in-memory rollback if import fails.

Use an Android file picker or share sheet through a maintained library. The library version must be pinned and the Android auto-linking result must be verified by GitHub Actions. Do not implement backup by copying files to an arbitrary path.

The first backup release must omit passwords. Encrypted backups can be added after the non-secret backup flow is proven.

## 10. App lock and biometric unlock

Create:

```text
src/security/lockState.ts
src/screens/SecurityScreen.tsx
```

Required behavior:

- User can enable an app PIN.
- The PIN is never stored as plaintext.
- App locks when it moves to the background.
- App locks after a configurable inactivity timeout.
- The lock screen appears before register data is shown.
- User can change the PIN after entering the existing PIN.
- Biometric unlock is optional and falls back to the PIN.
- Sensitive content is hidden from the Android recent-apps preview.

This feature requires a secure native storage library. Choose one compatible with React Native `0.86.3`, pin it, and document the required Android configuration before installation.

## 11. Secure password storage

Do not reuse the current JSON store for passwords.

Required design:

1. Generate a random password record ID.
2. Store the password value in Android Keystore-backed secure storage.
3. Store only the record ID in `AccountRecord.passwordRef`.
4. Show the password masked by default.
5. Require an explicit reveal action.
6. Provide copy-to-clipboard for a short, controlled duration.
7. Clear the clipboard after the duration when possible.
8. Never log the password.
9. Never include passwords in ordinary exports.
10. Delete the secure password entry when the account is permanently deleted.

This work must be implemented and tested separately from ordinary record storage.

## 12. Testing requirements

Add tests for:

### Domain tests

- Required field validation.
- Tag normalization.
- Status transitions.
- Migration from MVP data.
- Backup schema validation.
- Import rejection for invalid formats.

### Component tests

- Adding a record.
- Editing a record.
- Searching.
- Filtering.
- Archiving and restoring.
- Deleting after confirmation.
- Client and project selection.
- Password masking.

### Native/security tests

- Storage load and save.
- App lock on background.
- PIN change.
- Biometric fallback.
- Secure password deletion.
- Clipboard clearing.

The GitHub Actions workflow must run all tests before Gradle compilation.

## 13. Required CI changes after implementation

The workflow must continue to:

1. Set up Node 22.
2. Set up Java 17.
3. Set up Android SDK 36.
4. Install Gradle 9.3.1.
5. Run wrapper generation from `android/`.
6. Generate the debug keystore when missing.
7. Run `npm ci`.
8. Run lint.
9. Run TypeScript validation.
10. Run Jest.
11. Build `assembleRelease` from `android/`.
12. Upload `agp-release-apk`.

After adding native libraries, add an explicit check that Android autolinking generated the expected package entries.

## 14. Acceptance test for the complete application

The implementation is complete only when all of the following can be performed on an installed APK:

1. Open AGP and see the locked or unlocked register state.
2. Create a client.
3. Create a project under that client.
4. Create or select a platform.
5. Add an account record with email, username, notes, status, and tags.
6. Close and reopen the app and see the record.
7. Search for the record.
8. Filter by status, platform, client, and tag.
9. Open the detail screen.
10. Edit the record.
11. Mark it verified.
12. Pause it.
13. Archive it.
14. Restore it.
15. Export a non-secret backup.
16. Import the backup after validation.
17. Enable the PIN.
18. Close and reopen the app and verify that the lock screen appears.
19. Add a password only in a build where secure password storage is implemented and tested.
20. Delete the record and verify that associated secure password data is removed.

Until this acceptance test passes, the repository must be described as an MVP rather than the complete requested application.

## 15. Recommended implementation order

Implement in this order:

1. Extract models and storage from `App.tsx`.
2. Add migration and repository tests.
3. Add edit and detail screens.
4. Add navigation.
5. Add clients, projects, and platforms.
6. Add tags and filters.
7. Add non-secret export/import.
8. Add app lock.
9. Add secure password storage.
10. Run the full GitHub Actions build and install the APK.

Do not implement all native libraries at once. Each native dependency must be added, compiled, and tested in its own commit so a failure can be isolated.
