# morse-weda-video-editor

React Native / Expo SDK for the Morse Weda video editor.

## Features

- **Drop-in UI** — render the full Morse Weda editor inside your React Native app.
- **Headless hooks** — initialize the engine, validate licenses, and export videos programmatically.
- **Cross-platform** — Android implementation is complete; iOS implementation is code-complete and needs macOS/Xcode verification; Web is a stub.

## Installation

```bash
npm install morse-weda-video-editor
npx expo install morse-weda-video-editor
```

For Android, the module ships with prebuilt AARs. If you are developing inside the MorseWeda repo, build them first:

```bash
bash scripts/package_expo_aars.sh
```

## Usage

### Drop-in editor

```tsx
import { MorseWedaVideoEditor } from 'morse-weda-video-editor';

export default function App() {
  return <MorseWedaVideoEditor style={{ flex: 1 }} />;
}
```

### Headless export

```tsx
import {
  initialize,
  exportVideo,
  setLicenseCheckEnabled,
  addExportProgressListener,
  addExportCompleteListener,
  addExportErrorListener,
} from 'morse-weda-video-editor';
import { useEffect } from 'react';

export default function CustomEditor() {
  useEffect(() => {
    const progress = addExportProgressListener((e) => console.log(e.progress));
    const complete = addExportCompleteListener((e) => console.log(e.outputPath));
    const error = addExportErrorListener((e) => console.error(e.message));
    return () => { progress.remove(); complete.remove(); error.remove(); };
  }, []);

  const run = async () => {
    setLicenseCheckEnabled(false);
    await initialize({ licenseKey: 'dev-key', canCheckLicense: false });
    const out = await exportVideo(
      JSON.stringify(timeline),
      '/path/to/output.mp4',
      { width: 1280, height: 720, fps: 30, bitrateMbps: 8 }
    );
    console.log(out);
  };

  return <MyUI onExport={run} />;
}
```

## Development

The module is located at `morse-weda-video-editor/` in the MorseWeda repo.

```bash
cd morse-weda-video-editor
npm install
cd example
npm install
npx expo run:android
```

## License

This package is commercial software. License validation is controlled by the admin through `setLicenseCheckEnabled`. See `package_to_expo.md` in the MorseWeda repo for full packaging and licensing instructions.
