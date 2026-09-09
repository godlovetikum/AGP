# Manual Gradle wrapper workflow

The repository has two separate GitHub Actions workflows.

## 1. Generate Gradle wrapper JAR

`.github/workflows/generate-wrapper.yml` is manual-only. It runs only from **Actions → Generate Gradle wrapper JAR → Run workflow**. It installs JavaScript dependencies when the React Native Gradle plugin is absent, runs the Gradle wrapper task from `android/`, and uploads an artifact named `agp-gradle-wrapper`.

The uploaded artifact contains:

```text
android/gradle/wrapper/gradle-wrapper.jar
android/gradle/wrapper/gradle-wrapper.properties
android/gradlew
android/gradlew.bat
```

Download and extract the artifact into the repository, preserving the `android/` paths. At minimum, copy `gradle-wrapper.jar` into:

```text
android/gradle/wrapper/gradle-wrapper.jar
```

Also preserve `android/gradlew` and make it executable if using a local Git client:

```bash
chmod +x android/gradlew
```

## 2. Android build

`.github/workflows/android.yml` remains responsible for validation and APK compilation. It does not generate the wrapper. It verifies that the wrapper JAR already exists, then runs `android/gradlew assembleRelease`.

The Android build workflow runs on pushes, pull requests, and manual dispatch. The wrapper workflow runs only by manual dispatch.

The clean source package intentionally does not include the wrapper JAR. Generate it once with the manual workflow, download the artifact, copy it into the repository, and commit it in your own local Git history.
