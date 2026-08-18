import { requireNativeView } from 'expo';
import * as React from 'react';

import { MorseWedaVideoEditorViewProps } from './MorseWedaVideoEditor.types';

const NativeView: React.ComponentType<MorseWedaVideoEditorViewProps> = requireNativeView('MorseWedaVideoEditor');

export default function MorseWedaVideoEditorView(props: MorseWedaVideoEditorViewProps) {
  return <NativeView {...props} />;
}
