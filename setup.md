# morse-weda-video-editor – Setup, Publish & Update Guide

This guide explains how to:

1. Publish `morse-weda-video-editor` to its own GitHub repository.
2. Install and use it in any Expo project.
3. Keep the module updated and in sync with the main Morse Weda KMP app.

The main app and the module live in **separate repos**. The module only ships the Expo/React Native bridge, the JS/TS API, and the prebuilt native AARs/frameworks that wrap the Morse Weda shared engine.

---

## Prerequisites

- The main `Media_Editor_main` KMP repo is cloned and builds successfully.
- Node.js + npm installed.
- Expo CLI installed (`npm install -g @expo/cli` is optional; `npx expo` works too).
- Android SDK + NDK (to build the Android AARs).
- macOS + Xcode (only if you are building/publishing the iOS side).

---

## Recommended repo layout

Keep the module in its own repo. The main app stays separate.

```text
~/work/
  Media_Editor_main/              # main KMP app repo
  morse-weda-video-editor/        # this module repo
```

If you want the module folder inside the main app checkout while you develop, add it as a **git submodule** instead of copying source:

```bash
cd Media_Editor_main
rm -rf morse-weda-video-editor
git submodule add https://github.com/YOUR_USERNAME/morse-weda-video-editor.git morse-weda-video-editor
```

---

## Step 1 – Build the native AARs from the main app

The module embeds the Morse Weda shared UI and native engine as prebuilt AARs in `android/libs/`.

From the **main app** root (`Media_Editor_main`):

```bash
./gradlew :app:shared:assembleRelease :sdk:native:assembleRelease
```

Copy the outputs into the module:

```bash
# module is side-by-side with the main app
cp app/shared/build/outputs/aar/shared-release.aar \
   ../morse-weda-video-editor/android/libs/shared-release.aar

cp sdk/native/build/outputs/aar/native-release.aar \
   ../morse-weda-video-editor/android/libs/native-release.aar
```

If the module is still nested inside the main app repo:

```bash
cp app/shared/build/outputs/aar/shared-release.aar morse-weda-video-editor/android/libs/
cp sdk/native/build/outputs/aar/native-release.aar morse-weda-video-editor/android/libs/
```

### iOS

On macOS, build the `Shared` Kotlin framework and copy the resulting framework into the module's `ios/` folder (update the path as your iOS build evolves):

```bash
./gradlew :app:shared:assembleSharedReleaseXCFramework
# copy the XCFramework into morse-weda-video-editor/ios/
```

---

## Step 2 – Make sure AARs are included in the published package

The module's `.gitignore` currently ignores `android/libs/*.aar`. For the published package to work, the AARs must be present when the package is installed.

Two options:

### Option A – Track the AARs in Git (simplest)

Edit `.gitignore`:

```gitignore
# keep the prebuilt AARs that consumers need
!android/libs/*.aar
```

Then force-add them once:

```bash
git add -f android/libs/*.aar
```

> **Note:** AARs are large binaries. Committing them to Git works but bloats the repo over time.

### Option B – Publish AARs to a Maven repository (cleaner long-term)

Publish `shared-release.aar` and `native-release.aar` to GitHub Packages or Maven Central, then change the `else` branch in `android/build.gradle` from:

```gradle
implementation files('libs/shared-release.aar')
implementation files('libs/native-release.aar')
```

to a real Maven coordinate, for example:

```gradle
implementation 'com.yourorg:morseweda-shared:0.1.0'
implementation 'com.yourorg:morseweda-native:0.1.0'
```

With Option B you can keep `android/libs/*.aar` ignored.

---

## Step 3 – Publish to GitHub

1. Create a new empty GitHub repository, e.g. `YOUR_USERNAME/morse-weda-video-editor`.
2. Push the module as the root of that repo.

```bash
cd morse-weda-video-editor
git init
git remote add origin https://github.com/YOUR_USERNAME/morse-weda-video-editor.git
git add .
git commit -m "initial module release"
git push -u origin main
```

3. Tag a release version:

```bash
npm version patch   # or minor / major
```

This bumps `package.json` and creates a git tag. Push it:

```bash
git push && git push --tags
```

4. (Optional) Verify what will be shipped:

```bash
npm pack --dry-run
```

`expo-module.config.json`, `android/`, `ios/`, `src/`, `build/`, and the AARs will be included.

---

## Step 4 – Use the module in any Expo project

In your Expo project:

```bash
npx expo install react-native@0.86.2 expo-modules-core
npm install https://github.com/YOUR_USERNAME/morse-weda-video-editor.git#v0.1.0
```

Then generate the native projects and build:

```bash
npx expo prebuild
cd android && ./gradlew assembleDebug
cd ../ios && npx pod-install
```

Or use the Expo run commands:

```bash
npx expo run:android
npx expo run:ios
```

Import in your app:

```ts
import {
  MorseWedaVideoEditorView,
  renderVideo,
} from 'morse-weda-video-editor';
```

---

## Updating the module

When you change the main app's shared UI or native engine, you must rebuild and republish the module.

1. Rebuild the AARs/frameworks from the main app (Step 1).
2. Copy them into the module.
3. Make any module JS/Kotlin/Swift changes.
4. Test with the module's example app:

```bash
cd morse-weda-video-editor/example
npm install
npx expo run:android
```

5. Bump the version and push:

```bash
cd ..
npm version patch
git add .
git commit -m "bump version and rebuild native artifacts"
git push && git push --tags
```

6. In the consuming Expo project, update to the new tag:

```bash
npm install https://github.com/YOUR_USERNAME/morse-weda-video-editor.git#v0.2.0
npx expo prebuild --clean
npx expo run:android
```

---

## Local inline development with the main app

The module's Android build already supports two modes:

- **Inside the main repo:** it uses the local `:app:shared` and `:sdk:native` Gradle projects directly, so changes are picked up without copying AARs.
- **Standalone:** it uses the AARs in `android/libs/`.

For day-to-day inline development:

1. Keep both repos cloned side-by-side.
2. Edit the shared/native code in `Media_Editor_main`.
3. Run `./gradlew :app:shared:assembleRelease :sdk:native:assembleRelease`.
4. Copy the new AARs into `morse-weda-video-editor/android/libs/`.
5. Test with `morse-weda-video-editor/example`.
6. Commit and push only the module repo.

If you use a git submodule inside the main app, mark it `ignore = dirty` so rebuilt AARs don't show up as uncommitted changes in the main app repo:

```ini
[submodule "morse-weda-video-editor"]
  path = morse-weda-video-editor
  url = https://github.com/YOUR_USERNAME/morse-weda-video-editor.git
  ignore = dirty
```

---

## Notes & caveats

- **Do not publish the main app inside the module repo.** The module repo should only contain the Expo module and its native artifacts.
- The module depends on the Morse Weda shared engine. Whenever the shared engine's public API changes, the module's bridge code (`android/src/main/java/...`, `ios/...`, and JS types) may also need updates.
- If you hit the Metro codegen error `ReadonlyArray` / `Readonly` while running the example app, apply the `@react-native/codegen` patch described in `example/scripts/patch-codegen-readonly.js` to the consuming app's codegen parser.
- For production, prefer Option B (Maven artifacts) to avoid storing large AARs in Git.
