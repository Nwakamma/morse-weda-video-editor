import {
  EventEmitter,
  type EventSubscription,
  requireNativeViewManager,
} from 'expo-modules-core';
import * as React from 'react';
import MorseWedaVideoEditorModule from './MorseWedaVideoEditorModule';
import type {
  MorseWedaExportCompleteEvent,
  MorseWedaExportErrorEvent,
  MorseWedaExportOptions,
  MorseWedaExportProgressEvent,
  MorseWedaInitializeOptions,
  MorseWedaVideoEditorViewProps,
} from './MorseWedaVideoEditor.types';

export * from './MorseWedaVideoEditor.types';

type MorseWedaEvents = {
  onExportProgress: (event: MorseWedaExportProgressEvent) => void;
  onExportComplete: (event: MorseWedaExportCompleteEvent) => void;
  onExportError: (event: MorseWedaExportErrorEvent) => void;
};

const emitter = new EventEmitter<MorseWedaEvents>(MorseWedaVideoEditorModule);

// Route 1 — drop-in UI view.
const NativeView = requireNativeViewManager<MorseWedaVideoEditorViewProps>(
  'MorseWedaVideoEditorView'
);

export const MorseWedaVideoEditor: React.ComponentType<MorseWedaVideoEditorViewProps> =
  NativeView;

// Route 2 — headless hooks.

export async function initialize(options: MorseWedaInitializeOptions): Promise<void> {
  return MorseWedaVideoEditorModule.initialize(options);
}

export function setLicenseCheckEnabled(enabled: boolean): void {
  MorseWedaVideoEditorModule.setLicenseCheckEnabled(enabled);
}

export function setLicenseKey(key: string): void {
  MorseWedaVideoEditorModule.setLicenseKey(key);
}

export async function checkLicense(): Promise<boolean> {
  return MorseWedaVideoEditorModule.checkLicense();
}

export async function exportVideo(
  timelineJson: string,
  outputPath: string,
  options: MorseWedaExportOptions = {}
): Promise<string> {
  return MorseWedaVideoEditorModule.exportVideo(timelineJson, outputPath, options);
}

export function addExportProgressListener(
  listener: (event: MorseWedaExportProgressEvent) => void
): EventSubscription {
  return emitter.addListener('onExportProgress', listener);
}

export function addExportCompleteListener(
  listener: (event: MorseWedaExportCompleteEvent) => void
): EventSubscription {
  return emitter.addListener('onExportComplete', listener);
}

export function addExportErrorListener(
  listener: (event: MorseWedaExportErrorEvent) => void
): EventSubscription {
  return emitter.addListener('onExportError', listener);
}
