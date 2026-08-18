import { NativeModule, requireNativeModule } from 'expo';
import type {
  MorseWedaExportOptions,
  MorseWedaInitializeOptions,
} from './MorseWedaVideoEditor.types';

declare class MorseWedaVideoEditorModule extends NativeModule {
  setLicenseCheckEnabled(enabled: boolean): void;
  setLicenseKey(key: string): void;
  initialize(options: MorseWedaInitializeOptions): Promise<void>;
  checkLicense(): Promise<boolean>;
  exportVideo(
    timelineJson: string,
    outputPath: string,
    options: MorseWedaExportOptions
  ): Promise<string>;
}

export default requireNativeModule<MorseWedaVideoEditorModule>('MorseWedaVideoEditor');
