# From an Empty Folder to a Working React Native Android App

This guide explains how a React Native Android application is created from nothing, how the different technologies connect, and how the finished APK reaches an Android phone. It uses the AGP project as the example.

## 1. The big picture

A React Native application has two major parts:

1. **The JavaScript or TypeScript application**, which describes screens, forms, state, and user interactions.
2. **The native Android application**, which provides the Android project, Gradle build system, application package, signing configuration, and a host for the React Native JavaScript bundle.

React Native is not a web page placed inside a browser. The JavaScript code runs inside a mobile JavaScript engine and creates native Android views through React Native. Android still needs a normal Android project so it can produce an APK.

The complete journey is:

```text
Empty directory
    ↓
React Native project scaffold
    ↓
JavaScript/TypeScript screen
    ↓
Android host and Gradle project
    ↓
Source validation
    ↓
GitHub Actions build environment
    ↓
Gradle wrapper and signing setup
    ↓
APK artifact
    ↓
APK installation on Android phone
```

The key idea is that **source code is not yet an application**. Source code becomes an application only after it is bundled, compiled with the Android project, signed, and installed.

## 2. What you need to understand first

A web developer usually thinks about these files:

```text
index.html
JavaScript source
CSS
package.json
```

A React Native Android project still has `package.json`, but there is no normal browser `index.html` and no CSS file controlling the whole page. The equivalent concepts are distributed across several layers.

| Web concept | React Native equivalent |
| --- | --- |
| Browser entry point | `index.js` registers the root React component |
| React component | `App.tsx` and other `.tsx` files |
| HTML elements | Native components such as `View`, `Text`, and `TextInput` |
| CSS | JavaScript objects created with `StyleSheet.create` |
| Browser build | Metro bundles JavaScript for the device |
| Website package | Android APK |
| Web server | Android application process |
| Browser storage | Native Android storage or a storage library |

You do not need to learn every Android file before writing your first screen. You need to understand where the native boundary is and which commands cross it.

## 3. Starting with an empty directory

If you had a computer with the required tools, the first step would be to create an empty working directory:

```bash
mkdir AGP
cd AGP
```

For this project, the required development tools are Node.js 22, Java 17, Android Studio or the Android command-line tools, Android SDK Platform 36, and the React Native command-line tooling. Because the phone terminal is not expected to have these tools, GitHub Actions performs the heavy Android work later.

The important distinction is:

- **The repository contains source code and project configuration.**
- **The build runner contains the heavy compilers and SDKs.**

## 4. Creating the React Native scaffold

A scaffold is a generated starting project. It gives you files that are easy to get wrong by hand, such as Gradle configuration, Android activity setup, Metro configuration, Babel configuration, and native resource files.

The command used for AGP was conceptually:

```bash
npx @react-native-community/cli init AGP --version 0.86.3
```

The version is pinned deliberately. If you use an unpinned latest version, the generated Android project may change unexpectedly. Pinning the version means that another developer or GitHub Actions can reproduce the same dependency family.

The scaffold creates a structure similar to this:

```text
AGP/
├── App.tsx
├── index.js
├── package.json
├── package-lock.json
├── tsconfig.json
├── babel.config.js
├── metro.config.js
├── __tests__/
├── android/
├── ios/
└── .github/workflows/
```

The Android folder is not an optional decoration. It is the native Android project that eventually becomes the APK.

## 5. Understanding `package.json`

`package.json` tells Node and npm which JavaScript packages the project uses and which commands are available.

A simplified example is:

```json
{
  "name": "agp",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  },
  "dependencies": {
    "react": "19.2.3",
    "react-native": "0.86.3"
  }
}
```

The `dependencies` section describes packages needed by the application. The `devDependencies` section describes tools used to check or build the source.

The `scripts` section gives short names to longer commands. For example:

```bash
npm run typecheck
```

runs the TypeScript compiler without creating output files.

`package-lock.json` records the exact dependency tree selected by npm. It should be committed so that GitHub Actions installs the same versions you tested.

## 6. Writing the first screen

The first screen in AGP is in `App.tsx`. It uses React Native components rather than HTML elements.

A simple React Native component looks like this:

```tsx
import React from 'react';
import {Text, View} from 'react-native';

export default function App() {
  return (
    <View>
      <Text>Hello from AGP</Text>
    </View>
  );
}
```

The important components are:

| Component | Purpose |
| --- | --- |
| `View` | A layout container, similar to a `div` |
| `Text` | Displays text |
| `TextInput` | Accepts user input |
| `Pressable` | Creates a touchable interaction |
| `FlatList` | Renders a list of records |
| `ScrollView` | Allows a form or page to scroll |
| `SafeAreaView` | Keeps content away from device system areas |

React Native styles are JavaScript objects. They resemble CSS, but they are not a CSS stylesheet:

```tsx
const styles = StyleSheet.create({
  title: {
    color: '#172033',
    fontSize: 28,
    fontWeight: '800',
  },
});
```

A style is applied with a prop:

```tsx
<Text style={styles.title}>Account Register</Text>
```

## 7. Adding state and behavior

A screen becomes an application when it responds to user actions.

For example, a form can store its current value using `useState`:

```tsx
const [client, setClient] = useState('');
```

The input connects its value and change event to that state:

```tsx
<TextInput
  value={client}
  onChangeText={setClient}
  placeholder="Client name"
/>
```

A button calls a function:

```tsx
<Pressable onPress={saveRecord}>
  <Text>Save</Text>
</Pressable>
```

The AGP screen uses this pattern for:

- The search query.
- Whether the add form is visible.
- The draft record currently being typed.
- The records displayed in the list.

The account record is represented by a TypeScript type:

```ts
type AccountRecord = {
  id: string;
  client: string;
  project: string;
  platform: string;
  accountName: string;
  email: string;
  username: string;
  status: 'Active' | 'Paused' | 'Archived';
  notes: string;
};
```

This type is a development aid. It helps the TypeScript compiler find mistakes, but it is not itself stored on the phone.

## 8. What Metro does

Metro is the React Native JavaScript bundler. It reads `index.js`, follows imports into `App.tsx` and its dependencies, transforms TypeScript and modern JavaScript, and produces a bundle that Android can load.

During development, the Android app can connect to a Metro server running on your computer. This makes the development loop fast:

```text
Edit App.tsx
    ↓
Metro notices the change
    ↓
Metro creates an updated bundle
    ↓
The app refreshes on the device
```

A release APK cannot depend on your phone or laptop running Metro. For a release build, the React Native Gradle plugin asks Metro to create a JavaScript bundle and places that bundle inside the APK.

## 9. What the Android project does

The `android` directory is a Gradle Android project.

The important files are:

| File | Purpose |
| --- | --- |
| `android/settings.gradle` | Includes the application module and React Native build logic |
| `android/build.gradle` | Defines shared Android and Kotlin versions |
| `android/app/build.gradle` | Defines the APK module, SDK levels, package ID, and build types |
| `AndroidManifest.xml` | Declares the Android application and launcher activity |
| `MainActivity.kt` | Hosts the React Native application |
| `MainApplication.kt` | Creates the React Native host and registers packages |
| `gradlew` | Project-local Gradle launcher |
| `gradle/wrapper/gradle-wrapper.properties` | Selects the Gradle distribution version |

The Android package ID for AGP is `com.agp`. This is an identifier used by Android. The friendly name shown below the launcher icon is `AGP`, which comes from the Android string resource.

## 10. The native bridge in AGP

AGP uses a very small native bridge for local persistence. The JavaScript screen needs to save a JSON string and load it later. Android provides `SharedPreferences`, which is suitable for this non-secret MVP data.

`AccountStorageModule.kt` exposes two functions:

```text
load() → returns the saved JSON string
save(value) → writes the JSON string
```

`AccountStoragePackage.kt` makes the module available to React Native. `MainApplication.kt` adds that package manually.

This is different from a normal npm package. There is no extra dependency to install and no auto-linking step. The trade-off is that Kotlin source must be kept correct and the Android project must compile it.

The password field is intentionally not included in the saved JSON. It is a placeholder for a later security project and must not receive real passwords.

## 11. Source-level checks before Android compilation

Before asking GitHub Actions to build Android, the repository can run lightweight checks:

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
```

These checks answer different questions:

| Check | Question |
| --- | --- |
| Lint | Is the source formatted and free from configured code-quality problems? |
| TypeScript | Do the declared types agree with how the code is used? |
| Jest | Do the tested interactions behave as expected? |

These checks do not prove that Android can compile Kotlin or Gradle. They are still valuable because they catch many source mistakes before the more expensive Android build.

## 12. Why GitHub Actions is needed in this project

A GitHub Actions runner is a temporary Linux computer supplied by GitHub for the workflow. It can install Java, Android SDK packages, Gradle, and Node.js even when the phone cannot.

The AGP workflow performs these steps:

```text
Checkout repository
    ↓
Install Node.js 22
    ↓
Install Java 17
    ↓
Install Android SDK 36
    ↓
Install Gradle 9.3.1
    ↓
Generate gradle-wrapper.jar
    ↓
Generate debug.keystore if absent
    ↓
Run npm ci
    ↓
Run lint, TypeScript, and Jest
    ↓
Run ./gradlew assembleRelease
    ↓
Upload app-release.apk
```

The workflow does not assume that the Gradle wrapper JAR or debug keystore already exists in the repository. It creates them on the runner. This matches the phone-based development constraint.

## 13. What the Gradle wrapper is

Gradle is the Android build system. A Gradle wrapper is a project-specific launcher script that downloads and runs the exact Gradle distribution selected by the project.

The wrapper normally consists of:

```text
android/gradlew
android/gradlew.bat
android/gradle/wrapper/gradle-wrapper.properties
android/gradle/wrapper/gradle-wrapper.jar
```

The AGP source repository contains the launcher scripts and properties, while the GitHub Actions workflow generates the JAR before using the wrapper. The command is:

```bash
gradle wrapper --gradle-version 9.3.1 --distribution-type bin
```

After this command, the runner can execute:

```bash
cd android
./gradlew assembleRelease
```

The wrapper is useful because the build does not depend on a random Gradle version already installed on the machine.

## 14. What signing means

Android does not treat an unsigned APK as a normal installable application. The APK must be signed.

For personal testing, AGP generates a debug keystore using `keytool`. The workflow uses the following conventional debug credentials in the generated local build configuration:

```text
Keystore password: android
Alias: androiddebugkey
Key password: android
```

This is acceptable for personal testing only. It is not a production signing identity. A production application needs a private release keystore that must not be committed to GitHub or exposed in logs.

## 15. What an APK is

An APK is the installable Android package. It contains compiled Android resources, native code, the React Native runtime, and the bundled JavaScript application.

The release output for this project is:

```text
android/app/build/outputs/apk/release/app-release.apk
```

GitHub Actions uploads this file as an artifact. The artifact is usually downloaded as a ZIP from the workflow page. Extract the ZIP to obtain the APK.

## 16. Installing the APK on the phone

The phone-based installation sequence is:

1. Open the GitHub repository.
2. Select **Actions**.
3. Open the successful **Android build** run.
4. Scroll to **Artifacts**.
5. Download `agp-release-apk`.
6. Extract the downloaded artifact ZIP.
7. Open `app-release.apk`.
8. Allow installation from the file manager or browser if Android requests permission.
9. Confirm the installation.
10. Open **AGP** from the application launcher.

The first installation may require enabling installation from unknown sources for the application that opened the APK. Android normally shows the exact settings link when this is needed.

## 17. What happens when AGP opens

Android starts the activity declared in `AndroidManifest.xml`. The activity reports that its React Native component name is `AGP`.

React Native then loads the JavaScript bundle. The root component is rendered. The component loads saved JSON from the native `AccountStorage` module. The records are placed into React state and displayed in the list.

When a record is added:

```text
User fills form
    ↓
React validates required fields
    ↓
Password value is discarded
    ↓
React creates a record object
    ↓
Record list updates immediately
    ↓
The list is serialized to JSON
    ↓
Android SharedPreferences stores the JSON
```

When the app is reopened, the process runs in the opposite direction:

```text
Android starts app
    ↓
React Native loads JavaScript
    ↓
JavaScript calls AccountStorage.load()
    ↓
Android returns saved JSON
    ↓
JavaScript parses the records
    ↓
The list appears again
```

## 18. What the developer still needs to do

The manual work is intentionally small:

1. Create or choose a GitHub repository.
2. Upload or push the AGP repository contents.
3. Open the Actions tab.
4. Run the Android build workflow.
5. Download the APK artifact.
6. Install the APK on the phone.

No local Gradle installation is required for this workflow. No local Android SDK is required. No local wrapper-JAR generation is required.

## 19. What to build next

The best next feature is editing an existing record. The current app can add, search, and archive, but correcting a typo requires archiving the old record and adding a new one.

After editing, add:

1. A record detail view.
2. Status filters for active, paused, and archived records.
3. Export and import for backup.
4. A safe backup format.
5. App locking.
6. Secure storage only if passwords genuinely become necessary.

Do not add cloud synchronization first. Cloud synchronization introduces accounts, a server, authentication, conflict handling, and remote backups. The local app should become dependable before it becomes distributed.

## 20. The mental model to keep

When building a React Native Android app, keep these layers separate:

```text
React layer:
  screens, forms, state, validation

Native bridge layer:
  capabilities that JavaScript asks Android to perform

Android layer:
  activity, manifest, package ID, resources

Build layer:
  Gradle, Java, Android SDK, signing

Delivery layer:
  GitHub Actions, APK artifact, phone installation
```

Most problems become easier when you first identify the layer that failed. A TypeScript error is not fixed by changing Gradle. A missing Android SDK is not fixed by editing a React component. A signing error is not fixed by changing the search form.

The application is complete only when all five layers work together.
