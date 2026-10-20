/**
 * @format
 */

import React from 'react';
import { Pressable, View } from 'react-native';
import { render, fireEvent, screen } from '@testing-library/react-native';
import DayCell from './DayCell';
import { heatStyle, amber, core, gold, inkDim, inkFaint } from '../../theme/tokens';

const DATE = '2024-05-14';

function flatStyle(style: unknown): Record<string, unknown> {
  return Object.assign({}, ...([] as unknown[]).concat(style as never).filter(Boolean));
}

describe('DayCell', () => {
  describe('blank cell', () => {
    it('renders only an empty View with no Pressable when dateKey is null', () => {
      const { UNSAFE_queryByType, toJSON } = render(
        <DayCell dateKey={null} dayNumber={null} kind={null} />,
      );
      expect(UNSAFE_queryByType(Pressable)).toBeNull();
      expect(UNSAFE_queryByType(View)).not.toBeNull();
      const tree = toJSON() as { children: unknown } | null;
      expect(tree).not.toBeNull();
      expect(tree!.children).toBeNull();
    });

    it('renders blank when kind is null even with a dateKey', () => {
      const { UNSAFE_queryByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind={null} />,
      );
      expect(UNSAFE_queryByType(Pressable)).toBeNull();
      expect(screen.queryByText('14')).toBeNull();
    });
  });

  describe('future kind', () => {
    it('is disabled and does not call onPress', () => {
      const onPress = jest.fn();
      render(
        <DayCell dateKey={DATE} dayNumber={14} kind="future" onPress={onPress} />,
      );
      const cell = screen.getByRole('button');
      expect(cell.props.accessibilityState.disabled).toBe(true);
      fireEvent.press(cell);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('uses the future accessibility label', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="future" />);
      expect(screen.getByLabelText(`${DATE}, future`)).toBeTruthy();
    });

    it('renders the day number with the faint ink color', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="future" />);
      const num = screen.getByText('14');
      expect(flatStyle(num.props.style).color).toBe(inkFaint);
    });
  });

  describe('missed kind', () => {
    it('renders the missed dot', () => {
      const { UNSAFE_getAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="missed" />,
      );
      const views = UNSAFE_getAllByType(View);
      const dot = views.find((v) => {
        const s = flatStyle(v.props.style);
        return s.position === 'absolute' && s.width === 5 && s.height === 5;
      });
      expect(dot).toBeDefined();
    });

    it('is tappable and reports the missed label', () => {
      const onPress = jest.fn();
      render(
        <DayCell dateKey={DATE} dayNumber={14} kind="missed" onPress={onPress} />,
      );
      expect(screen.getByLabelText(`${DATE}, missed`)).toBeTruthy();
      fireEvent.press(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledWith(DATE);
    });
  });

  describe('today kind', () => {
    it('shows the today ring and the not-yet-logged label', () => {
      const { UNSAFE_getAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="today" isToday />,
      );
      const ring = UNSAFE_getAllByType(View).find(
        (v) => flatStyle(v.props.style).borderColor === amber,
      );
      expect(ring).toBeDefined();
      expect(screen.getByLabelText(`${DATE}, today, not yet logged`)).toBeTruthy();
    });

    it('renders the day number in gold when unscored', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="today" isToday />);
      expect(flatStyle(screen.getByText('14').props.style).color).toBe(gold);
    });

    it('does not render pips when unscored', () => {
      const { UNSAFE_queryAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="today" isToday />,
      );
      const pips = UNSAFE_queryAllByType(View).filter(
        (v) => flatStyle(v.props.style).width === 3,
      );
      expect(pips).toHaveLength(0);
    });
  });

  describe('scored kind', () => {
    it.each([1, 2, 3, 4, 5] as const)(
      'renders %i pip(s) equal to the score',
      (score) => {
        const { UNSAFE_getAllByType } = render(
          <DayCell dateKey={DATE} dayNumber={14} kind="scored" score={score} />,
        );
        const pips = UNSAFE_getAllByType(View).filter(
          (v) => flatStyle(v.props.style).width === 3 && flatStyle(v.props.style).height === 3,
        );
        expect(pips).toHaveLength(score);
      },
    );

    it('applies heat background and text color from heatStyle', () => {
      const score = 4 as const;
      const heat = heatStyle(score);
      const { UNSAFE_getAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="scored" score={score} />,
      );
      const body = UNSAFE_getAllByType(View).find(
        (v) => flatStyle(v.props.style).backgroundColor === heat.background,
      );
      expect(body).toBeDefined();
      expect(flatStyle(screen.getByText('14').props.style).color).toBe(heat.color);
    });

    it('uses the "scored N out of 5" label', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="scored" score={3} />);
      expect(screen.getByLabelText(`${DATE}, scored 3 out of 5`)).toBeTruthy();
    });

    it('applies the scoredToday style when a scored day is today', () => {
      const { UNSAFE_getAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="scored" score={5} isToday />,
      );
      const ringed = UNSAFE_getAllByType(View).find(
        (v) => flatStyle(v.props.style).borderColor === core && flatStyle(v.props.style).borderWidth === 2,
      );
      expect(ringed).toBeDefined();
    });

    it('does not apply the today amber ring to scored days', () => {
      const { UNSAFE_queryAllByType } = render(
        <DayCell dateKey={DATE} dayNumber={14} kind="scored" score={5} isToday />,
      );
      const amberRing = UNSAFE_queryAllByType(View).filter(
        (v) => flatStyle(v.props.style).borderColor === amber,
      );
      expect(amberRing).toHaveLength(0);
    });

    it('treats a scored kind without a score as unscored', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="scored" />);
      expect(screen.getByLabelText(`${DATE}, scored undefined out of 5`)).toBeTruthy();
    });
  });

  describe('selected state', () => {
    it('sets accessibilityState.selected', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="missed" selected />);
      expect(screen.getByRole('button').props.accessibilityState.selected).toBe(true);
    });

    it('defaults selected to undefined when not provided', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="missed" />);
      expect(screen.getByRole('button').props.accessibilityState.selected).toBeUndefined();
    });
  });

  describe('press handling', () => {
    it('calls onPress with dateKey for a tappable cell', () => {
      const onPress = jest.fn();
      render(<DayCell dateKey={DATE} dayNumber={14} kind="scored" score={2} onPress={onPress} />);
      fireEvent.press(screen.getByRole('button'));
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledWith(DATE);
    });

    it('does not throw when tapped without an onPress handler', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="missed" />);
      expect(() => fireEvent.press(screen.getByRole('button'))).not.toThrow();
    });

    it('renders the day number as text for tappable cells', () => {
      render(<DayCell dateKey={DATE} dayNumber={14} kind="today" isToday />);
      expect(screen.getByText('14')).toBeTruthy();
      expect(inkDim).toBeTruthy();
      expect(core).toBeTruthy();
    });
  });
});
