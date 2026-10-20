/**
 * ScorePickerBar.test.tsx — tests for the inline 1–5 score picker that slides
 * up inside the calendar sheet.
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import ScorePickerBar from './ScorePickerBar';
import { heatStyle } from '../../theme/tokens';
import type { Score } from '../../domain/fire';
import type { DateKey } from '../../domain/dates';

jest.mock('react-native-reanimated', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: {
      View: ReactLib.forwardRef((props: any, ref: any) => (
        <View ref={ref} {...props} />
      )),
    },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (fn: () => object) => fn(),
    useAnimatedKeyboard: () => ({ height: { value: 0 } }),
    withTiming: (toValue: number) => toValue,
    Easing: { bezier: () => (t: number) => t },
  };
});

jest.mock('./DayNoteEditor', () => {
  const ReactLib = require('react');
  const { TextInput } = require('react-native');
  return {
    __esModule: true,
    default: (props: {
      dateKey: string | null;
      value: string;
      onChangeText: (t: string) => void;
    }) =>
      ReactLib.createElement(TextInput, {
        testID: 'day-note-editor',
        value: props.value,
        onChangeText: props.onChangeText,
      }),
  };
});

const DATE: DateKey = '2024-01-05' as DateKey;

interface Overrides {
  dateKey?: DateKey | null;
  currentScore?: Score;
  noteDraft?: string;
  onNoteChange?: (text: string) => void;
  onChoose?: (score: Score) => void;
  onClear?: () => void;
}

function renderBar(overrides: Overrides = {}) {
  const props = {
    dateKey: DATE as DateKey | null,
    currentScore: undefined as Score | undefined,
    noteDraft: '',
    onNoteChange: jest.fn(),
    onChoose: jest.fn(),
    onClear: jest.fn(),
    ...overrides,
  };
  const utils = render(<ScorePickerBar {...props} />);
  return { ...utils, props };
}

describe('ScorePickerBar', () => {
  describe('when dateKey is null', () => {
    it('disables pointer events on the bar', () => {
      const { UNSAFE_root } = renderBar({ dateKey: null });
      const bar = UNSAFE_root.findAll(
        (node: any) => node.props && node.props.pointerEvents === 'none',
      );
      expect(bar.length).toBeGreaterThan(0);
    });

    it('renders an empty date label', () => {
      const { queryByText } = renderBar({ dateKey: null });
      expect(queryByText('Mon, Jan 5')).toBeNull();
    });
  });

  describe('when dateKey is set', () => {
    it('renders the formatted date label', () => {
      const { getByText } = renderBar({ dateKey: DATE });
      expect(getByText('Fri, Jan 5')).toBeTruthy();
    });

    it('allows pointer events on the bar', () => {
      const { UNSAFE_root } = renderBar({ dateKey: DATE });
      const hidden = UNSAFE_root.findAll(
        (node: any) => node.props && node.props.pointerEvents === 'none',
      );
      expect(hidden).toHaveLength(0);
    });
  });

  describe('score buttons', () => {
    it.each([1, 2, 3, 4, 5] as Score[])(
      'calls onChoose with %i when that button is pressed',
      score => {
        const { getByLabelText, props } = renderBar();
        fireEvent.press(getByLabelText(`Score ${score}`));
        expect(props.onChoose).toHaveBeenCalledTimes(1);
        expect(props.onChoose).toHaveBeenCalledWith(score);
      },
    );

    it('marks the currently selected score as selected', () => {
      const { getByLabelText } = renderBar({ currentScore: 3 });
      expect(getByLabelText('Score 3').props.accessibilityState).toEqual({
        selected: true,
      });
      expect(getByLabelText('Score 4').props.accessibilityState).toEqual({
        selected: false,
      });
    });

    it('applies the heat token background for each score', () => {
      const { getByLabelText } = renderBar();
      const heat = heatStyle(5);
      const button = getByLabelText('Score 5');
      const flat = [button.props.style].flat(Infinity as 1);
      const hasBackground = flat.some(
        (s: any) => s && s.backgroundColor === heat.background,
      );
      expect(hasBackground).toBe(true);
    });
  });

  describe('Clear button', () => {
    it('is disabled when there is no current score', () => {
      const { getByLabelText, props } = renderBar({ currentScore: undefined });
      const clear = getByLabelText("Clear this day's score");
      expect(clear.props.accessibilityState?.disabled ?? clear.props.disabled).toBeTruthy();
      fireEvent.press(clear);
      expect(props.onClear).not.toHaveBeenCalled();
    });

    it('is enabled and calls onClear when a score exists', () => {
      const { getByLabelText, props } = renderBar({ currentScore: 2 });
      const clear = getByLabelText("Clear this day's score");
      expect(clear.props.disabled).toBeFalsy();
      fireEvent.press(clear);
      expect(props.onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('note editor', () => {
    it('receives noteDraft as its value', () => {
      const { getByTestId } = renderBar({ noteDraft: 'deep work' });
      expect(getByTestId('day-note-editor').props.value).toBe('deep work');
    });

    it('forwards edits through onNoteChange', () => {
      const { getByTestId, props } = renderBar({ noteDraft: '' });
      fireEvent.changeText(getByTestId('day-note-editor'), 'new note');
      expect(props.onNoteChange).toHaveBeenCalledWith('new note');
    });
  });
});
