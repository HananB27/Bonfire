/**
 * DayNoteEditor.tsx — plain-text note editor for one selected calendar day.
 *
 * It receives the selected day's draft text from the hook. Text changes
 * autosave upstream. The component never summarizes, scores, or transforms note
 * content; it renders the exact string supplied by state.
 */

import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { bg2, ink, inkDim, inkFaint, line } from '../../theme/tokens';

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
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: 'rgba(18,26,48,0.78)',
  },
  label: {
    marginBottom: 8,
    color: inkDim,
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    minHeight: 70,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: bg2,
    color: ink,
    fontSize: 14,
    lineHeight: 19,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
});

export default React.memo(DayNoteEditor);
