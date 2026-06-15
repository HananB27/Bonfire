/**
 * DayNoteEditor.tsx — plain-text note editor for one selected calendar day.
 *
 * It receives the selected day's draft text from the hook. Text changes
 * autosave upstream. The component never summarizes, scores, or transforms note
 * content; it renders the exact string supplied by state.
 */

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ink, inkDim, inkFaint } from '../../theme/tokens';

interface DayNoteEditorProps {
  dateKey: string | null;
  value: string;
  onChangeText: (text: string) => void;
}

function DayNoteEditor({
  dateKey,
  value,
  onChangeText,
}: DayNoteEditorProps) {
  if (!dateKey) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Daily memory</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Write a private note"
        placeholderTextColor={inkFaint}
        multiline
        textAlignVertical="top"
        accessibilityLabel="Daily memory note"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(18,26,48,0.92)',
  },
  label: {
    marginBottom: 7,
    color: inkDim,
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    minHeight: 54,
    color: ink,
    fontSize: 15,
    lineHeight: 20,
    paddingHorizontal: 0,
    paddingTop: 2,
    paddingBottom: 0,
  },
});

export default React.memo(DayNoteEditor);
