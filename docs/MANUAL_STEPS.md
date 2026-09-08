# Manual steps from an Android phone

This repository is designed so the Android phone is used for editing and GitHub Actions performs the heavy Android build.

## 1. Create the GitHub repository

Create an empty GitHub repository. Do not add a README, `.gitignore`, or license during creation because this package already contains them.

Extract the ZIP, open the `AGP` directory, and push the repository contents to the `main` branch. If your Android terminal cannot run Git, upload the extracted files through the GitHub web interface while preserving the directory names. The `.git` directory is included for reference, but the remote repository only needs the working-tree files.

## 2. Start the build

Open the repository on GitHub and select **Actions**. Open **Android build**, choose **Run workflow**, select the `main` branch, and start it. A push to `main` also starts the workflow automatically.

The workflow performs these preparation steps on the GitHub runner:

1. Installs Node.js 22.13.0.
2. Installs Java 17.
3. Installs Android SDK Platform 36 and Build Tools 36.0.0.
4. Installs Gradle 9.3.1.
5. Generates `android/gradle/wrapper/gradle-wrapper.jar` with the Gradle wrapper task.
6. Generates `android/app/debug.keystore` if it does not exist.
7. Installs JavaScript packages.
8. Runs lint, TypeScript validation, and Jest.
9. Builds the release APK.

No Gradle installation, Android SDK, Java installation, wrapper-JAR generation, or keystore generation is required on the phone.

## 3. Download the APK

Wait for the workflow to finish successfully. Open the completed run and scroll to **Artifacts**. Download `agp-release-apk`. Extract the downloaded artifact ZIP to obtain `app-release.apk`.

The workflow also uploads `agp-generated-android-tooling`, which contains the generated wrapper JAR and debug keystore for inspection. Those generated files are not required for installing the APK.

## 4. Install the APK

On the Android phone, allow installation from the file manager or browser when Android asks. Open the extracted `app-release.apk` and follow the installation prompts. If Android reports that an older version is already installed, uninstall the old test copy first or use the same signing output from the same workflow lineage.

The APK is for personal testing. It is not a Google Play release and uses a generated debug signing key.

## 5. Use the MVP safely

The app stores client, project, platform, account name, email, username, status, and notes locally on the phone. The password input is displayed only as a future placeholder and is discarded when the record is saved. Do not put real passwords into this version.

The current app supports adding, searching, and archiving records. It does not yet support editing a saved record, export/import, cloud sync, biometric lock, or encrypted password storage.

## 6. If the workflow fails

Read the first red error in the workflow log. Do not change all version numbers at once. The most useful information to record is the workflow run URL, the failed step name, and the first error message. The most common causes are a GitHub Actions runner interruption, a dependency registry failure, or an Android SDK package temporarily failing to download.
