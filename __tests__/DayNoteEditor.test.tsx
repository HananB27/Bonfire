/**
 * DayNoteEditor.test.tsx — UI contract tests for plain-text notes.
 *
 * The editor must expose raw note text only. It should not add generated
 * summaries, sentiment, coaching, or other interpretation around user content.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import DayNoteEditor from '../src/components/Calendar/DayNoteEditor';

function textOf(tree: ReactTestRenderer.ReactTestRenderer): string {
  const out: string[] = [];
  const walk = (n: ReactTestRenderer.ReactTestRendererJSON | string | null): void => {
    if (n == null) return;
    if (typeof n === 'string') {
      out.push(n);
      return;
    }
    (n.children ?? []).forEach(walk);
  };
  const json = tree.toJSON();
  (Array.isArray(json) ? json : [json]).forEach(walk);
  return out.join(' ');
}

test('renders note text verbatim with no interpretation output', () => {
  const note = 'I felt tired, proud, and uncertain today.';
  let tree!: ReactTestRenderer.ReactTestRenderer;

  act(() => {
    tree = ReactTestRenderer.create(
      <DayNoteEditor
        dateKey="2026-06-10"
        value={note}
        onChangeText={() => {}}
      />,
    );
  });

  expect(tree.root.findByType(TextInput).props.value).toBe(note);
  const renderedText = textOf(tree);
  expect(renderedText).not.toMatch(/summary|sentiment|coaching|analysis/i);
  expect(renderedText).not.toContain('sad');
  expect(renderedText).not.toContain('happy');
});
