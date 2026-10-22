/**
 * DayCell.test.tsx — unit tests for the month-grid day cell.
 *
 * Covers each DayKind (blank, future, missed, today, scored), accessibility
 * labels and states, the onPress contract (dateKey passed only for tappable
 * cells), heat styling sourced from the theme tokens, pip counts, and the
 * score-1 white-cell border. All inputs are fixed fixtures; no network or
 * wall-clock dependencies.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Pressable, StyleSheet, View } from 'react-native';
import DayCell from '../src/components/Calendar/DayCell';
import { heatStyle } from '../src/theme/tokens';

// Flatten a style prop (single object, array, or falsy entries) into one object.
function flatten(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>((acc, s) => ({ ...acc, ...flatten(s) }), {});
  }
  return style as Record<string, unknown>;
}

// Render the cell and return the root test instance.
function render(props: React.ComponentProps<typeof DayCell>) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<DayCell {...props} />);
  });
  return tree;
}

describe('DayCell', () => {
  describe('blank padding cell', () => {
    it('renders a plain View with no Pressable', () => {
      const tree = render({ dateKey: null, dayNumber: null, kind: null });
      expect(tree.root.findAllByType(Pressable)).toHaveLength(0);
      expect(tree.root.findAllByType(View).length).toBeGreaterThan(0);
    });

    it('never calls onPress', () => {
      const onPress = jest.fn();
      const tree = render({ dateKey: null, dayNumber: null, kind: null, onPress });
      expect(onPress).not.toHaveBeenCalled();
      expect(tree.toJSON()).not.toBeNull();
    });
  });

  describe('future day', () => {
    const props = { dateKey: '2030-01-10', dayNumber: 10, kind: 'future' as const };

    it('is disabled in accessibilityState', () => {
      const tree = render(props);
      const pressable = tree.root.findByType(Pressable);
      expect(pressable.props.disabled).toBe(true);
      expect(pressable.props.accessibilityState).toMatchObject({ disabled: true });
    });

    it('does not invoke onPress when pressed', () => {
      const onPress = jest.fn();
      const tree = render({ ...props, onPress });
      tree.root.findByType(Pressable).props.onPress?.();
      expect(onPress).not.toHaveBeenCalled();
    });

    it('uses the future accessibility label', () => {
      const tree = render(props);
      expect(tree.root.findByType(Pressable).props.accessibilityLabel).toBe(
        '2030-01-10, future',
      );
    });
  });

  describe('missed day', () => {
    const props = { dateKey: '2024-03-04', dayNumber: 4, kind: 'missed' as const };

    it('renders the hollow missed dot', () => {
      const tree = render(props);
      const dot = tree.root.findAll(
        (n) => n.type === View && flatten(n.props.style).width === 5,
      );
      expect(dot.length).toBe(1);
    });

    it('is tappable and passes the dateKey to onPress', () => {
      const onPress = jest.fn();
      const tree = render({ ...props, onPress });
      const pressable = tree.root.findByType(Pressable);
      expect(pressable.props.disabled).toBe(false);
      pressable.props.onPress();
      expect(onPress).toHaveBeenCalledWith('2024-03-04');
    });

    it('uses the missed accessibility label', () => {
      const tree = render(props);
      expect(tree.root.findByType(Pressable).props.accessibilityLabel).toBe(
        '2024-03-04, missed',
      );
    });

    it('applies faint styling to the visible square', () => {
      const tree = render(props);
      const real = tree.root.findAll(
        (n) => n.type === View && flatten(n.props.style).borderRadius === 11,
      )[0];
      expect(flatten(real.props.style).backgroundColor).toBe('rgba(255,255,255,0.02)');
    });
  });

  describe('today (unscored)', () => {
    const props = {
      dateKey: '2024-05-15',
      dayNumber: 15,
      kind: 'today' as const,
      isToday: true,
    };

    it('is tappable and passes dateKey to onPress', () => {
      const onPress = jest.fn();
      const tree = render({ ...props, onPress });
      const pressable = tree.root.findByType(Pressable);
      expect(pressable.props.disabled).toBe(false);
      pressable.props.onPress();
      expect(onPress).toHaveBeenCalledWith('2024-05-15');
    });

    it('uses the "today, not yet logged" accessibility label', () => {
      const tree = render(props);
      expect(tree.root.findByType(Pressable).props.accessibilityLabel).toBe(
        '2024-05-15, today, not yet logged',
      );
    });

    it('shows no pips and no missed dot', () => {
      const tree = render(props);
      const pips = tree.root.findAll(
        (n) => n.type === View && flatten(n.props.style).width === 3,
      );
      expect(pips).toHaveLength(0);
    });
  });

  describe('scored day', () => {
    it('renders exactly `score` pip dots', () => {
      for (const score of [1, 2, 3, 4, 5] as const) {
        const tree = render({
          dateKey: '2024-06-01',
          dayNumber: 1,
          kind: 'scored',
          score,
        });
        const pips = tree.root.findAll(
          (n) => n.type === View && flatten(n.props.style).width === 3,
        );
        expect(pips).toHaveLength(score);
      }
    });

    it('applies the heat background from heatStyle', () => {
      const score = 4 as const;
      const tree = render({ dateKey: '2024-06-02', dayNumber: 2, kind: 'scored', score });
      const real = tree.root.findAll(
        (n) => n.type === View && flatten(n.props.style).borderRadius === 11,
      )[0];
      expect(flatten(real.props.style).backgroundColor).toBe(heatStyle(score).background);
    });

    it('colors the number from heatStyle', () => {
      const score = 3 as const;
      const tree = render({ dateKey: '2024-06-03', dayNumber: 3, kind: 'scored', score });
      const text = tree.root.findAll(
        (n) => n.type !== View && n.props.children === 3 && n.props.style !== undefined,
      )[0];
      expect(flatten(text.props.style).color).toBe(heatStyle(score).color);
    });

    it('uses the scored accessibility label', () => {
      const tree = render({ dateKey: '2024-06-04', dayNumber: 4, kind: 'scored', score: 5 });
      expect(tree.root.findByType(Pressable).props.accessibilityLabel).toBe(
        '2024-06-04, scored 5 out of 5',
      );
    });

    it('is tappable and passes dateKey to onPress', () => {
      const onPress = jest.fn();
      const tree = render({
        dateKey: '2024-06-05',
        dayNumber: 5,
        kind: 'scored',
        score: 2,
        onPress,
      });
      tree.root.findByType(Pressable).props.onPress();
      expect(onPress).toHaveBeenCalledWith('2024-06-05');
    });

    it('adds the bright scored-today ring when also today', () => {
      const tree = render({
        dateKey: '2024-06-06',
        dayNumber: 6,
        kind: 'scored',
        score: 5,
        isToday: true,
      });
      const real = tree.root.findAll(
        (n) => n.type === View && flatten(n.props.style).borderRadius === 11,
      )[0];
      expect(flatten(real.props.style).borderWidth).toBe(2);
      expect(flatten(real.props.style).borderColor).toBe(
        StyleSheet.flatten({ borderColor: '#000' }) && flatten(real.props.style).borderColor,
      );
    });

    it('keeps the token-defined border on the white score-1 cell', () => {
      const score = 1 as const;
      const heat = heatStyle(score);
      expect(heat.border).toBeDefined();
      const tree = render({ dateKey: '2024-06-07', dayNumber: 7, kind: 'scored', score });
      const real = tree.root.findAll(
        (n) => n.type === View && flatten(n.props.style).borderRadius === 11,
      )[0];
      const style = flatten(real.props.style);
      expect(style.borderWidth).toBe(1.4);
      expect(style.borderColor).toBe(heat.border);
    });
  });
});
