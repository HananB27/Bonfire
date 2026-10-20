/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import FlameRow from './FlameRow';
import type { AchievementState } from '../../domain/achievements';
import type { FlameStyle } from '../../domain/flames';

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: (props: any) => React.createElement(View, { testID: 'gradient', ...props }),
  };
});

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View },
    useSharedValue: (init: number) => ({ value: init }),
    useAnimatedStyle: (fn: () => object) => fn(),
    withSequence: (...args: unknown[]) => args[args.length - 1],
    withTiming: (value: number) => value,
  };
});

const REJECT_MS = 250;

const fullGradient = ['#111111', '#222222', '#333333', '#444444', '#555555'];

function makeFlame(overrides: Partial<FlameStyle> = {}): FlameStyle {
  return {
    id: 'ember' as any,
    name: 'Ember',
    gradient: fullGradient,
    embered: {
      core: '#0a0a0a',
      gold: '#1a1a1a',
      amber: '#2a2a2a',
      ember: '#3a3a3a',
      red: '#4a4a4a',
    },
    palette: { core: '#ffd28a' },
    achievement: {
      type: 'streak',
      requirement: 'Log 7 days in a row',
    },
    ...overrides,
  } as unknown as FlameStyle;
}

function makeState(overrides: Partial<AchievementState> = {}): AchievementState {
  return {
    unlocked: false,
    expired: false,
    daysLeft: null,
    progress: { value: 0, target: 7 },
    ...overrides,
  } as unknown as AchievementState;
}

function render(props: Partial<React.ComponentProps<typeof FlameRow>> = {}) {
  const onPress = props.onPress ?? jest.fn();
  const flame = props.flame ?? makeFlame();
  const state = props.state ?? makeState();
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <FlameRow
        flame={flame}
        state={state}
        active={props.active ?? false}
        justUnlocked={props.justUnlocked}
        onPress={onPress}
      />,
    );
  });
  return { tree, onPress, flame };
}

function textContent(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAll((n) => n.type === 'Text' || (typeof n.type === 'string' && n.type === 'Text'))
    .map((n) => n.children.join(''));
}

function pressable(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root.find(
    (n) => n.props.accessibilityRole === 'radio' && typeof n.props.onPress === 'function',
  );
}

describe('FlameRow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('swatch colors', () => {
    it('uses the full flame gradient when unlocked', () => {
      const { tree, flame } = render({
        state: makeState({ unlocked: true, progress: { value: 7, target: 7 } }),
      });
      const gradient = tree.root.findByProps({ testID: 'gradient' });
      expect(gradient.props.colors).toEqual(flame.gradient);
    });

    it('uses embered colors when locked', () => {
      const { tree, flame } = render();
      const gradient = tree.root.findByProps({ testID: 'gradient' });
      const e = flame.embered;
      expect(gradient.props.colors).toEqual([e.core, e.gold, e.amber, e.ember, e.red]);
    });
  });

  describe('status line', () => {
    it('shows "Unlocked" for an unlocked streak row', () => {
      const { tree } = render({
        state: makeState({ unlocked: true, progress: { value: 7, target: 7 } }),
      });
      expect(textContent(tree)).toContain('Unlocked');
    });

    it('shows "Unlocked" for a base flame with no achievement', () => {
      const { tree } = render({
        flame: makeFlame({ achievement: undefined } as Partial<FlameStyle>),
        state: makeState({ unlocked: true }),
      });
      expect(textContent(tree)).toContain('Unlocked');
    });

    it('shows days left for an unlocked time row', () => {
      const flame = makeFlame({
        achievement: { type: 'time', requirement: 'Log 30 days' },
      } as Partial<FlameStyle>);
      const { tree } = render({
        flame,
        state: makeState({ unlocked: true, daysLeft: 12 }),
      });
      expect(textContent(tree)).toContain('Unlocked · 12d left');
    });

    it('clamps negative daysLeft to zero', () => {
      const flame = makeFlame({
        achievement: { type: 'time', requirement: 'Log 30 days' },
      } as Partial<FlameStyle>);
      const { tree } = render({
        flame,
        state: makeState({ unlocked: true, daysLeft: -3 }),
      });
      expect(textContent(tree)).toContain('Unlocked · 0d left');
    });

    it('shows requirement with counter for a locked streak row', () => {
      const { tree } = render({
        state: makeState({ progress: { value: 3, target: 7 } }),
      });
      expect(textContent(tree)).toContain('Log 7 days in a row · 3/7');
    });

    it('caps the displayed counter at the target', () => {
      const { tree } = render({
        state: makeState({ progress: { value: 9, target: 7 } }),
      });
      expect(textContent(tree)).toContain('Log 7 days in a row · 7/7');
    });

    it('renders a progress fraction bar width for locked rows', () => {
      const { tree } = render({
        state: makeState({ progress: { value: 3, target: 7 } }),
      });
      const fill = tree.root.findAll(
        (n) => n.props.style && Array.isArray(n.props.style)
          ? false
          : false,
      );
      expect(fill).toEqual([]);
      const widths = tree.root
        .findAll((n) => typeof n.props.style === 'object' && n.props.style !== null && 'width' in (n.props.style as object))
        .map((n) => (n.props.style as { width: string }).width);
      expect(widths).toContain('43%');
    });

    it('shows expired re-earn text for an expired locked time row', () => {
      const flame = makeFlame({
        achievement: { type: 'time', requirement: 'Log 30 days' },
      } as Partial<FlameStyle>);
      const { tree } = render({
        flame,
        state: makeState({ expired: true, progress: { value: 2, target: 30 } }),
      });
      expect(textContent(tree)).toContain('Expired — re-earn: Log 30 days');
    });

    it('prefixes "Just unlocked!" when justUnlocked is set', () => {
      const { tree } = render({
        state: makeState({ unlocked: true, progress: { value: 7, target: 7 } }),
        justUnlocked: true,
      });
      expect(textContent(tree)).toContain('Just unlocked! Unlocked');
    });
  });

  describe('accessibility', () => {
    it('uses the radio role with selected state equal to active', () => {
      const { tree } = render({
        state: makeState({ unlocked: true }),
        active: true,
      });
      const node = pressable(tree);
      expect(node.props.accessibilityRole).toBe('radio');
      expect(node.props.accessibilityState).toEqual({ selected: true, disabled: false });
    });

    it('marks locked rows disabled and prefixes the label with Locked —', () => {
      const { tree, flame } = render({ active: false });
      const node = pressable(tree);
      expect(node.props.accessibilityState).toEqual({ selected: false, disabled: true });
      expect(node.props.accessibilityLabel).toBe(
        `${flame.name}. Locked — Log 7 days in a row · 0/7`,
      );
    });

    it('appends Active to the label of the active row', () => {
      const { tree, flame } = render({
        state: makeState({ unlocked: true }),
        active: true,
      });
      expect(pressable(tree).props.accessibilityLabel).toBe(`${flame.name}. Unlocked. Active`);
    });

    it('does not prefix Locked — on unlocked rows', () => {
      const { tree, flame } = render({
        state: makeState({ unlocked: true }),
      });
      expect(pressable(tree).props.accessibilityLabel).toBe(`${flame.name}. Unlocked`);
    });
  });

  describe('press behaviour', () => {
    it('calls onPress with the flame id when an unlocked row is pressed', () => {
      const { tree, onPress, flame } = render({
        state: makeState({ unlocked: true }),
      });
      ReactTestRenderer.act(() => {
        pressable(tree).props.onPress();
      });
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onPress).toHaveBeenCalledWith(flame.id);
    });

    it('does not call onPress when a locked row is pressed', () => {
      const { tree, onPress } = render();
      ReactTestRenderer.act(() => {
        pressable(tree).props.onPress();
      });
      expect(onPress).not.toHaveBeenCalled();
    });

    it('shows the rejection cue on a locked tap and clears it after REJECT_MS', () => {
      const { tree, flame } = render();
      expect(
        tree.root.findAll((n) => n.props.testID === `flame-reject-${flame.id}`),
      ).toHaveLength(0);

      ReactTestRenderer.act(() => {
        pressable(tree).props.onPress();
      });
      expect(
        tree.root.findAll((n) => n.props.testID === `flame-reject-${flame.id}`).length,
      ).toBeGreaterThan(0);

      ReactTestRenderer.act(() => {
        jest.advanceTimersByTime(REJECT_MS - 1);
      });
      expect(
        tree.root.findAll((n) => n.props.testID === `flame-reject-${flame.id}`).length,
      ).toBeGreaterThan(0);

      ReactTestRenderer.act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(
        tree.root.findAll((n) => n.props.testID === `flame-reject-${flame.id}`),
      ).toHaveLength(0);
    });

    it('restarts the rejection timer on repeated locked taps', () => {
      const { tree, flame } = render();
      ReactTestRenderer.act(() => {
        pressable(tree).props.onPress();
      });
      ReactTestRenderer.act(() => {
        jest.advanceTimersByTime(200);
      });
      ReactTestRenderer.act(() => {
        pressable(tree).props.onPress();
      });
      ReactTestRenderer.act(() => {
        jest.advanceTimersByTime(200);
      });
      expect(
        tree.root.findAll((n) => n.props.testID === `flame-reject-${flame.id}`).length,
      ).toBeGreaterThan(0);
      ReactTestRenderer.act(() => {
        jest.advanceTimersByTime(50);
      });
      expect(
        tree.root.findAll((n) => n.props.testID === `flame-reject-${flame.id}`),
      ).toHaveLength(0);
    });
  });
});
