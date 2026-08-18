import type { StyleProp, ViewStyle } from 'react-native';

export type MorseWedaVideoEditorViewProps = {
  licenseKey?: string;
  style?: StyleProp<ViewStyle>;
};

export type MorseWedaExportOptions = {
  format?: string;
  width?: number;
  height?: number;
  fps?: number;
  bitrateMbps?: number;
  isAudioMuted?: boolean;
  audioCodec?: string;
  audioBitrateKbps?: number;
};

export type MorseWedaInitializeOptions = {
  licenseKey: string;
  canCheckLicense?: boolean;
};

export type MorseWedaExportProgressEvent = {
  currentFrame: number;
  totalFrames: number;
  progress: number;
};

export type MorseWedaExportCompleteEvent = {
  outputPath: string;
};

export type MorseWedaExportErrorEvent = {
  code: number;
  message: string;
};
