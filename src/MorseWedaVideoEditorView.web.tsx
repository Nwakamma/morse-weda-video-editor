import * as React from 'react';
import { View, Text } from 'react-native';
import type { MorseWedaVideoEditorViewProps } from './MorseWedaVideoEditor.types';

export default function MorseWedaVideoEditorView(_props: MorseWedaVideoEditorViewProps) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Morse Weda video editor is not available on web.</Text>
    </View>
  );
}
