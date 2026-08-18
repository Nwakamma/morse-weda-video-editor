import {
  MorseWedaVideoEditor,
  initialize,
  exportVideo,
  setLicenseCheckEnabled,
  addExportProgressListener,
  addExportCompleteListener,
  addExportErrorListener,
} from 'morse-weda-video-editor';
import { useEffect, useState } from 'react';
import { Button, SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function App() {
  const [status, setStatus] = useState<string>('Ready');

  useEffect(() => {
    const progressSub = addExportProgressListener((event) => {
      setStatus(`Exporting... ${Math.round(event.progress * 100)}% (${event.currentFrame}/${event.totalFrames})`);
    });
    const completeSub = addExportCompleteListener((event) => {
      setStatus(`Exported to ${event.outputPath}`);
    });
    const errorSub = addExportErrorListener((event) => {
      setStatus(`Export error ${event.code}: ${event.message}`);
    });

    return () => {
      progressSub.remove();
      completeSub.remove();
      errorSub.remove();
    };
  }, []);

  const onInitialize = async () => {
    try {
      // Admin toggle: disable license validation for dev testing.
      setLicenseCheckEnabled(false);
      await initialize({ licenseKey: 'dev-key', canCheckLicense: false });
      setStatus('Initialized');
    } catch (e: any) {
      setStatus(`Init error: ${e.message}`);
    }
  };

  const onExport = async () => {
    try {
      setStatus('Exporting...');
      const out = await exportVideo(
        JSON.stringify({
          totalDurationMs: 5000,
          videoOps: [],
          audioOps: [],
          textOps: [],
          stickerOps: [],
        }),
        '/data/data/com.nwakamma.morsewedavideoeditor/cache/output.mp4',
        { width: 1280, height: 720, fps: 30, bitrateMbps: 8 }
      );
      setStatus(`Exported to ${out}`);
    } catch (e: any) {
      setStatus(`Export error: ${e.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Morse Weda SDK Example</Text>

        <Group name="Headless hooks">
          <Text>{status}</Text>
          <Button title="Initialize engine" onPress={onInitialize} />
          <Button title="Export sample timeline" onPress={onExport} />
        </Group>

        <Group name="Drop-in editor">
          <MorseWedaVideoEditor style={styles.view} />
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group(props: { name: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <Text style={styles.groupHeader}>{props.name}</Text>
      {props.children}
    </View>
  );
}

const styles = {
  header: { fontSize: 30, margin: 20 },
  groupHeader: { fontSize: 20, marginBottom: 20 },
  group: { margin: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20, gap: 10 },
  container: { flex: 1, backgroundColor: '#eee' },
  view: { flex: 1, height: 500 },
};
