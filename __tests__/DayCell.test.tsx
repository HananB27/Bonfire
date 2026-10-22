/**
 * DayCell.test.tsx — behavior tests for the month-grid day cell.
 *
 * Uses react-test-renderer (already used by __tests__/App.test.tsx) so no extra
 * test dependency is needed. Each test renders DayCell with explicit props and
 * inspects the host tree: the Pressable props for interaction and accessibility,
 * and the flattened host View styles for the ring, heat fill, dot, and pips.
 * Expected colors are read from the shared tokens module, never hardcoded here.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import DayCell from '../src/components/Calendar/DayCell';
import type { Score } from '../src/domain/fire';
import { amber, core, heatStyle } from '../src/theme/tokens';

type DayCellProps = React.ComponentProps<typeof DayCell>;

const DATE_KEY = '2024-06-10';
const DAY_NUMBER = 10;

// Keep track of every renderer so each test cleans up and no timers leak.
const renderers: ReactTestRenderer.ReactTestRenderer[] = [];

afterEach(() => {
  act(() => {
    while (renderers.length > 0) {
      renderers.pop()?.unmount();
    }
  });
});

// Renders a DayCell with sensible defaults that individual tests can override.
function renderCell(props: Partial<DayCellProps> = {}): ReactTestRenderer.ReactTestRenderer {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(
      <DayCell dateKey={DATE_KEY} dayNumber={DAY_NUMBER} kind="scored" score={3} {...props} />,
    );
  });
  renderers.push(renderer);
  return renderer;
}

// Returns the host View nodes (string type) whose flattened style matches the predicate.
// Filtering to host nodes avoids counting the same element twice (composite + host).
function findHostViews(
  renderer: ReactTestRenderer.ReactTestRenderer,
  predicate: (flat: Record<string, unknown>) => boolean,
): ReactTestRenderer.ReactTestInstance[] {
  return renderer.root.findAll((node) => {
    if (typeof node.type !== 'string' || node.type !== 'View') return false;
    const flat = StyleSheet.flatten(node.props.style) as Record<string, unknown> | undefined;
    return flat !== undefined && predicate(flat);
  });
}

// The visible rounded square is the first host View whose style carries the borderRadius of 11.
function findVisibleSquare(
  renderer: ReactTestRenderer.ReactTestRenderer,
): ReactTestRenderer.ReactTestInstance {
  const [square] = findHostViews(renderer, (flat) => flat.borderRadius === 11);
  if (!square) throw new Error('visible day square not found');
  return square;
}

// The Pressable wrapper is the only element that receives the accessibility role.
function findPressable(renderer: ReactTestRenderer.ReactTestRenderer) {
  return renderer.root.find((node) => node.props.accessibilityRole === 'button');
}

describe('DayCell', () => {
  describe('blank cell', () => {
    it('renders an empty View with no Pressable and no text when dateKey is null', () => {
      const renderer = renderCell({ dateKey: null, dayNumber: null, kind: null });

      expect(renderer.root.findAll((n) => n.props.accessibilityRole === 'button')).toHaveLength(0);
      expect(renderer.root.findAllByType(Text)).toHaveLength(0);
      expect(renderer.root.findAllByType(View).length).toBeGreaterThan(0);
    });

    it('renders an empty View when kind is null even if dateKey is present', () => {
      const renderer = renderCell({ kind: null, dayNumber: null });

      expect(renderer.root.findAll((n) => n.props.accessibilityRole === 'button')).toHaveLength(0);
      expect(renderer.root.findAllByType(Text)).toHaveLength(0);
    });
  });

  describe('future cell', () => {
    it('is disabled, reports disabled accessibility state, and shows no label-based tap action', () => {
      const renderer = renderCell({ kind: 'future', dayNumber: 11, score: undefined });
      const pressable = findPressable(renderer);

      expect(pressable.props.disabled).toBe(true);
      expect(pressable.props.accessibilityState.disabled).toBe(true);
    });

    it('does not call onPress when pressed', () => {
      const onPress = jest.fn();
      const renderer = renderCell({ kind: 'future', dayNumber: 11, score: undefined, onPress });
      const pressable = findPressable(renderer);

      act(() => {
        pressable.props.onPress?.();
      });

      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('missed cell', () => {
    it('renders the hollow missed dot', () => {
      const renderer = renderCell({ kind: 'missed', score: undefined });

      const dots = findHostViews(
        renderer,
        (flat) => flat.borderColor === 'rgba(120,130,150,0.45)' && flat.width === 5,
      );
      expect(dots).toHaveLength(1);
    });

    it('does not render any score pips', () => {
      const renderer = renderCell({ kind: 'missed', score: undefined });

      const pips = findHostViews(renderer, (flat) => flat.backgroundColor === 'rgba(28,13,4,0.55)');
      expect(pips).toHaveLength(0);
    });
  });

  describe('today cell', () => {
    it('applies the today ring color to the visible square', () => {
      const renderer = renderCell({ kind: 'today', isToday: true, score: undefined });

      const square = findVisibleSquare(renderer);
      expect(StyleSheet.flatten(square.props.style).borderColor).toBe(amber);
    });

    it('exposes the today accessibility label', () => {
      const renderer = renderCell({ kind: 'today', isToday: true, score: undefined });

      expect(findPressable(renderer).props.accessibilityLabel).toBe(
        `${DATE_KEY}, today, not yet logged`,
      );
    });
  });

  describe('scored cell', () => {
    it.each([1, 2, 3, 4, 5] as const)('renders exactly %i pip(s)', (score) => {
      const renderer = renderCell({ kind: 'scored', score: score as Score });

      const pips = findHostViews(renderer, (flat) => flat.backgroundColor === 'rgba(28,13,4,0.55)');
      expect(pips).toHaveLength(score);
    });

    it('fills the visible square with the heat background for its score', () => {
      const score = 4 as Score;
      const renderer = renderCell({ kind: 'scored', score });

      const square = findVisibleSquare(renderer);
      expect(StyleSheet.flatten(square.props.style).backgroundColor).toBe(
        heatStyle(score).background,
      );
    });

    it('renders the day number in the heat text color', () => {
      const score = 5 as Score;
      const renderer = renderCell({ kind: 'scored', score });

      const numberText = renderer.root.findByType(Text);
      expect(StyleSheet.flatten(numberText.props.style).color).toBe(heatStyle(score).color);
    });

    it('does not render the missed dot', () => {
      const renderer = renderCell({ kind: 'scored', score: 2 as Score });

      const dots = findHostViews(
        renderer,
        (flat) => flat.borderColor === 'rgba(120,130,150,0.45)' && flat.width === 5,
      );
      expect(dots).toHaveLength(0);
    });
  });

  describe('scored and today cell', () => {
    it('gets both the scored heat fill and the scored-today ring', () => {
      const score = 4 as Score;
      const renderer = renderCell({ kind: 'scored', score, isToday: true });

      const square = findVisibleSquare(renderer);
      const flat = StyleSheet.flatten(square.props.style);
      expect(flat.backgroundColor).toBe(heatStyle(score).background);
      expect(flat.borderColor).toBe(core);
      expect(flat.borderWidth).toBe(2);
    });
  });

  describe('accessibilityLabel', () => {
    it('describes a scored day with its score out of 5', () => {
      const renderer = renderCell({ kind: 'scored', score: 3 as Score });

      expect(findPressable(renderer).props.accessibilityLabel).toBe(
        `${DATE_KEY}, scored 3 out of 5`,
      );
    });

    it('describes a today cell as not yet logged', () => {
      const renderer = renderCell({ kind: 'today', isToday: true, score: undefined });

      expect(findPressable(renderer).props.accessibilityLabel).toBe(
        `${DATE_KEY}, today, not yet logged`,
      );
    });

    it('describes a missed day', () => {
      const renderer = renderCell({ kind: 'missed', score: undefined });

      expect(findPressable(renderer).props.accessibilityLabel).toBe(`${DATE_KEY}, missed`);
    });

    it('describes a future day', () => {
      const renderer = renderCell({ kind: 'future', score: undefined });

      expect(findPressable(renderer).props.accessibilityLabel).toBe(`${DATE_KEY}, future`);
    });
  });

  describe('onPress', () => {
    it.each([
      ['scored', 2 as Score],
      ['missed', undefined],
      ['today', undefined],
    ] as const)('calls onPress with the dateKey for a %s cell', (kind, score) => {
      const onPress = jest.fn();
      const renderer = renderCell({
        kind,
        score,
        isToday: kind === 'today',
        onPress,
      });
      const pressable = findPressable(renderer);

      act(() => {
        pressable.props.onPress?.();
      });

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledWith(DATE_KEY);
    });

    it('does not throw when pressed without an onPress handler', () => {
      const renderer = renderCell({ kind: 'scored', score: 1 as Score });
      const pressable = findPressable(renderer);

      expect(() =>
        act(() => {
          pressable.props.onPress?.();
        }),
      ).not.toThrow();
    });
  });

  describe('selected', () => {
    it('sets accessibilityState.selected when selected', () => {
      const renderer = renderCell({ kind: 'scored', score: 3 as Score, selected: true });

      expect(findPressable(renderer).props.accessibilityState.selected).toBe(true);
    });

    it('reports selected as falsy when not selected', () => {
      const renderer = renderCell({ kind: 'scored', score: 3 as Score, selected: false });

      expect(findPressable(renderer).props.accessibilityState.selected).toBeFalsy();
    });
  });
});
