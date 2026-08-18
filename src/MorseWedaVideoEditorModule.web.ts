import type {
  MorseWedaExportOptions,
  MorseWedaInitializeOptions,
} from './MorseWedaVideoEditor.types';

export default {
  setLicenseCheckEnabled(_enabled: boolean): void {},
  setLicenseKey(_key: string): void {},
  initialize(_options: MorseWedaInitializeOptions): Promise<void> {
    return Promise.reject(new Error('Morse Weda video editor is not supported on web'));
  },
  checkLicense(): Promise<boolean> {
    return Promise.resolve(false);
  },
  exportVideo(
    _timelineJson: string,
    _outputPath: string,
    _options: MorseWedaExportOptions
  ): Promise<string> {
    return Promise.reject(new Error('Morse Weda video editor is not supported on web'));
  },
};
