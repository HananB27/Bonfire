/**
 * DayCell.test.tsx — behavior tests for the month-grid day cell.
 *
 * Covers: blank padding, future (disabled), missed (hollow dot), scored
 * (heat background, number, pips), today ring, accessibility labels, and
 * onPress wiring. Heat colors are read from src/theme/tokens, never hardcoded.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import DayCell from './DayCell';
import { heatStyle, core, amber } from '../../theme/tokens';

const DATE = '2025-03-14';

function flatStyle(style: unknown): Record<string, unknown> {
  return StyleSheet.flatten(style as never) as Record<string, unknown>;
}

describe('DayCell', () => {
  describe('blank cell', () => {
    it('renders an empty View and no text when dateKey and kind are null', () => {
      render(<DayCell dateKey={null} dayNumber={null} kind={null} />);
      expect(screen.queryByText(/\d/)).toBeNull();
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('is not pressable even when onPress is supplied', () => {
      const onPress = jest.fn();
      render(<DayCell dateKey={null} dayNumber={null} kind={null} onPress={onPress} />);
      expect(screen.queryByRole('button')).toBeNull();
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('future day', () => {
    it('is disabled and does not invoke onPress when tapped', () => {
      const onPress = jest.fn();
      render(
        <DayCell dateKey={DATE} dayNumber={20} kind="future" onPress={onPress} />,
      );
      const button = screen.getByRole('button');
      expect(button.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled: true }),
      );
      fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('renders the day number with future styling', () => {
      render(<DayCell dateKey={DATE} dayNumber={20} kind="future" />);
      expect(screen.getByText('20')).toBeTruthy();
    });
  });

  describe('missed day', () => {
    it('renders the hollow missedDot view', () => {
      const { UNSAFE_getAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="missed" />,
      );
      const { View } = require('react-native');
      const views = UNSAFE_getAllByType(View);
      const dot = views.find((v: { props: { style?: unknown } }) => {
        const s = flatStyle(v.props.style);
        return s.width === 5 && s.height === 5 && s.borderWidth === 1.4;
      });
      expect(dot).toBeDefined();
    });

    it('is tappable and forwards the dateKey to onPress', () => {
      const onPress = jest.fn();
      render(<DayCell dateKey={DATE} dayNumber={14} kind="missed" onPress={onPress} />);
      fireEvent.press(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledWith(DATE);
    });
  });

  describe('scored day', () => {
    it('renders the day number', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="scored" score={4} />);
      expect(screen.getByText('14')).toBeTruthy();
    });

    it('applies the heat background from heatStyle for the score', () => {
      const { UNSAFE_getAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="scored" score={4} />,
      );
      const { View } = require('react-native');
      const expected = heatStyle(4).background;
      const match = UNSAFE_getAllByType(View).find((v: { props: { style?: unknown } }) =>
        flatStyle(v.props.style).backgroundColor === expected,
      );
      expect(match).toBeDefined();
    });

    it('colors the number with the heat color from tokens', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="scored" score={5} />);
      const num = screen.getByText('14');
      expect(flatStyle(num.props.style).color).toBe(heatStyle(5).color);
    });

    it('renders one pip per score point', () => {
      const { UNSAFE_getAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="scored" score={3} />,
      );
      const { View } = require('react-native');
      const pips = UNSAFE_getAllByType(View).filter((v: { props: { style?: unknown } }) => {
        const s = flatStyle(v.props.style);
        return s.width === 3 && s.height === 3 && s.borderRadius === 2;
      });
      expect(pips).toHaveLength(3);
    });

    it('renders no pips and no missed dot when kind is not scored', () => {
      const { UNSAFE_getAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="missed" />,
      );
      const { View } = require('react-native');
      const pips = UNSAFE_getAllByType(View).filter((v: { props: { style?: unknown } }) => {
        const s = flatStyle(v.props.style);
        return s.width === 3 && s.height === 3;
      });
      expect(pips).toHaveLength(0);
    });

    it('is tappable and forwards the dateKey to onPress', () => {
      const onPress = jest.fn();
      render(
        <DayCell dateKey={DATE} dayNumber={14} kind="scored" score={2} onPress={onPress} />,
      );
      fireEvent.press(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledWith(DATE);
    });
  });

  describe('today ring', () => {
    it('applies the amber ring on an unscored today', () => {
      const { UNSAFE_getAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="today" isToday />,
      );
      const { View } = require('react-native');
      const ringed = UNSAFE_getAllByType(View).find((v: { props: { style?: unknown } }) =>
        flatStyle(v.props.style).borderColor === amber,
      );
      expect(ringed).toBeDefined();
    });

    it('applies the core ring on a scored day that is also today', () => {
      const { UNSAFE_getAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="scored" score={5} isToday />,
      );
      const { View } = require('react-native');
      const ringed = UNSAFE_getAllByType(View).find((v: { props: { style?: unknown } }) => {
        const s = flatStyle(v.props.style);
        return s.borderColor === core && s.borderWidth === 2;
      });
      expect(ringed).toBeDefined();
    });
  });

  describe('accessibilityLabel', () => {
    it('labels a scored day with its score out of 5', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="scored" score={4} />);
      expect(screen.getByLabelText(`${DATE}, scored 4 out of 5`)).toBeTruthy();
    });

    it('labels an unscored today', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="today" isToday />);
      expect(screen.getByLabelText(`${DATE}, today, not yet logged`)).toBeTruthy();
    });

    it('labels a missed day', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="missed" />);
      expect(screen.getByLabelText(`${DATE}, missed`)).toBeTruthy();
    });

    it('labels a future day', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="future" />);
      expect(screen.getByLabelText(`${DATE}, future`)).toBeTruthy();
    });
  });
});
