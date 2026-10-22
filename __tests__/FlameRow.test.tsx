/**
 * FlameRow.test.tsx — unit tests for the flame gallery row component.
 *
 * Covers: swatch colors (unlocked vs embered), status text for every
 * AchievementState presentation, press behavior (equip when unlocked,
 * rejection cue when locked), accessibility roles/states/labels, and the
 * justUnlocked prefix. expo-linear-gradient and react-native-reanimated are
 * mocked so the test runs headlessly and deterministically.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import FlameRow, { REJECT_MS } from '../src/components/Settings/FlameRow';
import { FLAMES, type FlameId, type FlameStyle } from '../src/domain/flames';
import type { AchievementState } from '../src/domain/achievements';

// expo-linear-gradient renders a native view; replace it with a plain View
// that exposes its colors prop so we can assert on the swatch gradient.
jest.mock('expo-linear-gradient', () => {
  const { View } = jest.requireActual('react-native');
  return { LinearGradient: (props: object) => <View {...props} /> };
});

// Reanimated's worklets don't run under Jest; replace the hooks with simple
// stand-ins. withSequence/withTiming only need to return a value.
jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: { View },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (fn: () => object) => fn(),
    withSequence: (...args: unknown[]) => args[args.length - 1],
    withTiming: (value: number) => value,
  };
});

function getFlame(id: FlameId): FlameStyle {
  const flame = FLAMES.find(f => f.id === id);
  if (!flame) throw new Error(`missing flame fixture: ${id}`);
  return flame;
}

function unlockedState(flame: FlameStyle, overrides: Partial<AchievementState> = {}): AchievementState {
  return {
    flameId: flame.id,
    unlocked: true,
    progress: { value: 1, target: 1 },
    achievementDay: null,
    daysLeft: null,
    expired: false,
    ...overrides,
  };
}

function lockedState(flame: FlameStyle, overrides: Partial<AchievementState> = {}): AchievementState {
  return {
    flameId: flame.id,
    unlocked: false,
    progress: { value: 0, target: 1 },
    achievementDay: null,
    daysLeft: null,
    expired: false,
    ...overrides,
  };
}

interface RenderOpts {
  flame: FlameStyle;
  state: AchievementState;
  active?: boolean;
  justUnlocked?: boolean;
  onPress?: jest.Mock;
}

function renderRow({ flame, state, active = false, justUnlocked, onPress = jest.fn() }: RenderOpts) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <FlameRow
        flame={flame}
        state={state}
        active={active}
        justUnlocked={justUnlocked}
        onPress={onPress}
      />,
    );
  });
  return { tree, onPress };
}

// Find the Pressable (the element carrying the radio role) for interaction.
function findRadio(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root.find(n => n.props.accessibilityRole === 'radio' && typeof n.props.onPress === 'function');
}

// Collect every rendered string so tests can substring-match the status text.
// Recursion walks the rendered JSON tree: each node's children are either
// nested host nodes or raw strings; we push strings and descend into nodes.
function allText(tree: ReactTestRenderer.ReactTestRenderer): string {
  const out: string[] = [];
  const walk = (node: ReactTestRenderer.ReactTestRendererJSON | string | null): void => {
    if (node == null) return;
    if (typeof node === 'string') {
      out.push(node);
      return;
    }
    (node.children ?? []).forEach(walk);
  };
  const json = tree.toJSON();
  (Array.isArray(json) ? json : [json]).forEach(walk);
  return out.join('|');
}

// ---- Swatch colors ----

describe('swatch colors', () => {
  test('unlocked row uses the full gradient', () => {
    const flame = getFlame('amber');
    const { tree } = renderRow({ flame, state: unlockedState(flame) });
    const gradient = tree.root.find(n => n.props.colors !== undefined && n.props.start !== undefined);
    expect(gradient.props.colors).toEqual(flame.gradient);
  });

  test('locked row uses the embered colors', () => {
    const flame = getFlame('sodium');
    const { tree } = renderRow({ flame, state: lockedState(flame) });
    const gradient = tree.root.find(n => n.props.colors !== undefined && n.props.start !== undefined);
    const e = flame.embered;
    expect(gradient.props.colors).toEqual([e.core, e.gold, e.amber, e.ember, e.red]);
  });
});

// ---- Status text ----

describe('status text', () => {
  test('base flame shows just "Unlocked"', () => {
    const flame = getFlame('amber');
    const { tree } = renderRow({ flame, state: unlockedState(flame) });
    expect(allText(tree)).toContain('Unlocked');
    expect(allText(tree)).not.toContain('left');
  });

  test('unlocked time flame shows the day countdown', () => {
    const flame = getFlame('toxic');
    const state = unlockedState(flame, { daysLeft: 5, achievementDay: '2026-06-10' });
    const { tree } = renderRow({ flame, state });
    expect(allText(tree)).toContain('Unlocked · 5d left');
  });

  test('unlocked time flame clamps negative days to 0d left', () => {
    const flame = getFlame('toxic');
    const state = unlockedState(flame, { daysLeft: -2 });
    const { tree } = renderRow({ flame, state });
    expect(allText(tree)).toContain('Unlocked · 0d left');
  });

  test('locked streak flame shows requirement with counter and progress', () => {
    const flame = getFlame('sodium');
    const state = lockedState(flame, { progress: { value: 4, target: 7 } });
    const { tree } = renderRow({ flame, state });
    const text = allText(tree);
    expect(text).toContain('Keep a 7-day run');
    expect(text).toContain('4/7');
  });

  test('locked streak counter caps value at target', () => {
    const flame = getFlame('sodium');
    const state = lockedState(flame, { progress: { value: 9, target: 7 } });
    const { tree } = renderRow({ flame, state });
    expect(allText(tree)).toContain('7/7');
  });

  test('locked time flame shows requirement with counter', () => {
    const flame = getFlame('toxic');
    const state = lockedState(flame, { progress: { value: 1, target: 3 } });
    const { tree } = renderRow({ flame, state });
    expect(allText(tree)).toContain('1/3');
  });

  test('expired time flame prompts re-earn with requirement', () => {
    const flame = getFlame('toxic');
    const state = lockedState(flame, { expired: true, daysLeft: -3, progress: { value: 3, target: 3 } });
    const { tree } = renderRow({ flame, state });
    expect(allText(tree)).toContain(`Expired — re-earn: ${flame.achievement?.requirement}`);
  });

  test('progress bar fill width reflects fraction', () => {
    const flame = getFlame('sodium');
    const state = lockedState(flame, { progress: { value: 1, target: 4 } });
    const { tree } = renderRow({ flame, state });
    const fill = tree.root.findAll(n => n.props.style && Array.isArray(n.props.style)
      ? n.props.style.some((s: { width?: string }) => s && s.width === '25%')
      : false);
    expect(fill.length).toBeGreaterThan(0);
  });
});

// ---- Press behavior ----

describe('press behavior', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('tapping an unlocked row calls onPress with the flame id', () => {
    const flame = getFlame('amber');
    const { tree, onPress } = renderRow({ flame, state: unlockedState(flame) });
    act(() => {
      findRadio(tree).props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith('amber');
  });

  test('tapping a locked row never calls onPress', () => {
    const flame = getFlame('sodium');
    const { tree, onPress } = renderRow({ flame, state: lockedState(flame) });
    act(() => {
      findRadio(tree).props.onPress();
    });
    expect(onPress).not.toHaveBeenCalled();
  });

  test('tapping a locked row shows the rejection cue, then resets after REJECT_MS', () => {
    const flame = getFlame('sodium');
    const { tree } = renderRow({ flame, state: lockedState(flame) });
    const cueId = `flame-reject-${flame.id}`;

    act(() => {
      findRadio(tree).props.onPress();
    });
    expect(tree.root.findAllByProps({ testID: cueId }).length).toBeGreaterThan(0);

    act(() => {
      jest.advanceTimersByTime(REJECT_MS - 1);
    });
    expect(tree.root.findAllByProps({ testID: cueId }).length).toBeGreaterThan(0);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(tree.root.findAllByProps({ testID: cueId }).length).toBe(0);
  });

  test('rejection cue is absent when tapping an unlocked row', () => {
    const flame = getFlame('amber');
    const { tree } = renderRow({ flame, state: unlockedState(flame) });
    act(() => {
      findRadio(tree).props.onPress();
    });
    expect(tree.root.findAllByProps({ testID: `flame-reject-${flame.id}` }).length).toBe(0);
  });

  test('repeated locked taps restart the cue timer', () => {
    const flame = getFlame('sodium');
    const { tree } = renderRow({ flame, state: lockedState(flame) });
    const cueId = `flame-reject-${flame.id}`;

    act(() => {
      findRadio(tree).props.onPress();
    });
    act(() => {
      jest.advanceTimersByTime(REJECT_MS - 50);
    });
    act(() => {
      findRadio(tree).props.onPress();
    });
    act(() => {
      jest.advanceTimersByTime(REJECT_MS - 1);
    });
    expect(tree.root.findAllByProps({ testID: cueId }).length).toBeGreaterThan(0);
  });
});

// ---- Accessibility ----

describe('accessibility', () => {
  test('row has radio role', () => {
    const flame = getFlame('amber');
    const { tree } = renderRow({ flame, state: unlockedState(flame) });
    expect(findRadio(tree).props.accessibilityRole).toBe('radio');
  });

  test('active row is marked selected', () => {
    const flame = getFlame('amber');
    const { tree } = renderRow({ flame, state: unlockedState(flame), active: true });
    const radio = findRadio(tree);
    expect(radio.props.accessibilityState.selected).toBe(true);
    expect(radio.props.accessibilityLabel).toContain('Active');
  });

  test('inactive row is not selected', () => {
    const flame = getFlame('amber');
    const { tree } = renderRow({ flame, state: unlockedState(flame), active: false });
    expect(findRadio(tree).props.accessibilityState.selected).toBe(false);
  });

  test('locked row is disabled and labelled "Locked — …"', () => {
    const flame = getFlame('sodium');
    const { tree } = renderRow({ flame, state: lockedState(flame) });
    const radio = findRadio(tree);
    expect(radio.props.accessibilityState.disabled).toBe(true);
    expect(radio.props.accessibilityLabel).toContain('Locked — Keep a 7-day run');
  });

  test('unlocked row is enabled and not labelled Locked', () => {
    const flame = getFlame('amber');
    const { tree } = renderRow({ flame, state: unlockedState(flame) });
    const radio = findRadio(tree);
    expect(radio.props.accessibilityState.disabled).toBe(false);
    expect(radio.props.accessibilityLabel).not.toContain('Locked');
  });
});

// ---- justUnlocked ----

describe('justUnlocked', () => {
  test('prefixes the status with "Just unlocked!"', () => {
    const flame = getFlame('sodium');
    const state = unlockedState(flame);
    const { tree } = renderRow({ flame, state, justUnlocked: true });
    expect(allText(tree)).toContain('Just unlocked! Unlocked');
  });

  test('no prefix when justUnlocked is omitted', () => {
    const flame = getFlame('sodium');
    const { tree } = renderRow({ flame, state: unlockedState(flame) });
    expect(allText(tree)).not.toContain('Just unlocked!');
  });
});
