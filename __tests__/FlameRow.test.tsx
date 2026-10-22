/**
 * FlameRow.test.tsx — UI tests for a single flame gallery row.
 *
 * FlameRow is pure presentation over a derived `AchievementState`, so each test
 * builds a flame + state pair by hand and checks what the row shows and how it
 * reacts to presses. Covered behavior:
 *  - status text for base, unlocked time, locked streak/time, and expired flames
 *  - progress bar fraction clamping
 *  - "Just unlocked!" celebration prefix
 *  - equip on unlocked press; rejection cue (never equip) on locked press
 *  - accessibility label, disabled and selected states
 *  - swatch gradient colors (full when unlocked, embered when locked)
 *
 * expo-linear-gradient and react-native-reanimated are mocked so the tests run
 * without native modules and without real animation timing.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import FlameRow from '../src/components/Settings/FlameRow';
import { FLAMES, type FlameId, type FlameStyle } from '../src/domain/flames';
import type { AchievementState } from '../src/domain/achievements';

// Must match the REJECT_MS constant inside FlameRow.tsx (not exported).
const REJECT_MS = 250;

// Replace the native gradient with a plain string host component. Its props
// (notably `colors`) stay visible to the test renderer for assertions.
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Replace Reanimated with a synchronous stub: shared values are plain boxes,
// animated styles resolve immediately, and sequences just return their last step.
jest.mock('react-native-reanimated', () => {
  const RN = require('react-native');
  return {
    __esModule: true,
    default: RN.View,
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (fn: () => object) => fn(),
    withSequence: (...steps: unknown[]) => steps[steps.length - 1],
    withTiming: (toValue: number) => toValue,
  };
});

// Look up a catalog flame by id and fail loudly if it is missing.
function flameOf(id: FlameId): FlameStyle {
  const flame = FLAMES.find(f => f.id === id);
  if (!flame) throw new Error(`catalog is missing flame "${id}"`);
  return flame;
}

// Build a derived state with sensible "locked, no progress" defaults.
function stateFor(id: FlameId, overrides: Partial<AchievementState> = {}): AchievementState {
  return {
    flameId: id,
    unlocked: false,
    progress: { value: 0, target: 1 },
    achievementDay: null,
    daysLeft: null,
    expired: false,
    ...overrides,
  };
}

function renderRow(
  flame: FlameStyle,
  state: AchievementState,
  opts: { active?: boolean; justUnlocked?: boolean; onPress?: (id: FlameId) => void } = {},
) {
  const onPress = opts.onPress ?? jest.fn();
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <FlameRow
        flame={flame}
        state={state}
        active={opts.active ?? false}
        justUnlocked={opts.justUnlocked ?? false}
        onPress={onPress}
      />,
    );
  });
  return { tree, onPress };
}

// Find the row's Pressable (the only node with radio role AND an onPress prop).
function radio(tree: ReactTestRenderer.ReactTestRenderer) {
  const hits = tree.root.findAll(
    n => n.props.accessibilityRole === 'radio' && typeof n.props.onPress === 'function',
  );
  if (hits.length === 0) throw new Error('no radio row found');
  return hits[0];
}

// Collect every rendered text string so we can substring-match the status line.
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
  return out.join('|');
}

// Widths (as strings like "57%") of host views that carry a percentage width.
// Only the progress bar fill uses a percent width, so this isolates it.
function fillWidths(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAll(n => typeof n.type === 'string')
    .map(n => StyleSheet.flatten(n.props.style)?.width)
    .filter((w): w is string => typeof w === 'string' && w.endsWith('%'));
}

// The rejection cue wrapper only carries its testID while the cue is playing.
function rejectCueCount(tree: ReactTestRenderer.ReactTestRenderer, id: FlameId): number {
  return tree.root.findAllByProps({ testID: `flame-reject-${id}` }).length;
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ---- (1) base flame ----

test('a base/unlocked amber flame shows plain "Unlocked" status', () => {
  const { tree } = renderRow(flameOf('amber'), stateFor('amber', { unlocked: true }));
  expect(textOf(tree)).toContain('Unlocked');
  expect(textOf(tree)).not.toContain('left');
  expect(fillWidths(tree)).toEqual([]);
});

// ---- (2) unlocked time flame ----

test('an unlocked time flame shows the countdown "Unlocked · Nd left"', () => {
  const { tree } = renderRow(
    flameOf('toxic'),
    stateFor('toxic', { unlocked: true, achievementDay: '2026-06-10', daysLeft: 5 }),
  );
  expect(textOf(tree)).toContain('Unlocked · 5d left');
});

test('an unlocked time flame clamps negative days to 0d left', () => {
  const { tree } = renderRow(
    flameOf('toxic'),
    stateFor('toxic', { unlocked: true, achievementDay: '2026-06-10', daysLeft: -2 }),
  );
  expect(textOf(tree)).toContain('Unlocked · 0d left');
  expect(textOf(tree)).not.toContain('-2d');
});

// ---- (3) locked streak flame: requirement, counter, progress bar ----

test('a locked streak flame shows "requirement · value/target" with a proportional bar', () => {
  const sodium = flameOf('sodium');
  const req = sodium.achievement?.requirement ?? '';
  const { tree } = renderRow(
    sodium,
    stateFor('sodium', { progress: { value: 4, target: 7 } }),
  );
  expect(textOf(tree)).toContain(`${req} · 4/7`);
  // 4/7 ≈ 57.1% → rounded to 57%
  expect(fillWidths(tree)).toEqual(['57%']);
});

test('a locked streak counter is capped at target and the bar fraction clamps to 100%', () => {
  const sodium = flameOf('sodium');
  const req = sodium.achievement?.requirement ?? '';
  const { tree } = renderRow(
    sodium,
    stateFor('sodium', { progress: { value: 9, target: 7 } }),
  );
  expect(textOf(tree)).toContain(`${req} · 7/7`);
  expect(textOf(tree)).not.toContain('9/7');
  expect(fillWidths(tree)).toEqual(['100%']);
});

test('a locked flame with a zero target shows a 0% bar instead of dividing by zero', () => {
  const sodium = flameOf('sodium');
  const { tree } = renderRow(
    sodium,
    stateFor('sodium', { progress: { value: 0, target: 0 } }),
  );
  expect(fillWidths(tree)).toEqual(['0%']);
});

// ---- (4) expired time flame ----

test('an expired time flame prompts "Expired — re-earn: <requirement>"', () => {
  const toxic = flameOf('toxic');
  const req = toxic.achievement?.requirement ?? '';
  const { tree } = renderRow(
    toxic,
    stateFor('toxic', {
      unlocked: false,
      expired: true,
      achievementDay: '2026-05-01',
      daysLeft: -3,
      progress: { value: 3, target: 3 },
    }),
  );
  expect(textOf(tree)).toContain(`Expired — re-earn: ${req}`);
});

// ---- (5) just-unlocked celebration ----

test('justUnlocked prefixes the status with "Just unlocked!"', () => {
  const { tree } = renderRow(
    flameOf('toxic'),
    stateFor('toxic', { unlocked: true, achievementDay: '2026-06-10', daysLeft: 6 }),
    { justUnlocked: true },
  );
  expect(textOf(tree)).toContain('Just unlocked! Unlocked · 6d left');
});

// ---- (6) pressing an unlocked row ----

test('pressing an unlocked row calls onPress with the flame id and shows no rejection cue', () => {
  const { tree, onPress } = renderRow(flameOf('amber'), stateFor('amber', { unlocked: true }));

  act(() => {
    radio(tree).props.onPress();
  });

  expect(onPress).toHaveBeenCalledTimes(1);
  expect(onPress).toHaveBeenCalledWith('amber');
  expect(rejectCueCount(tree, 'amber')).toBe(0);
});

// ---- (7) pressing a locked row ----

test('pressing a locked row never calls onPress and shows the rejection cue', () => {
  const { tree, onPress } = renderRow(flameOf('sodium'), stateFor('sodium'));

  act(() => {
    radio(tree).props.onPress();
  });

  expect(onPress).not.toHaveBeenCalled();
  expect(rejectCueCount(tree, 'sodium')).toBeGreaterThan(0);
});

test('the rejection cue resets after REJECT_MS', () => {
  const { tree } = renderRow(flameOf('sodium'), stateFor('sodium'));

  act(() => {
    radio(tree).props.onPress();
  });
  expect(rejectCueCount(tree, 'sodium')).toBeGreaterThan(0);

  // Just before the deadline the cue is still visible.
  act(() => {
    jest.advanceTimersByTime(REJECT_MS - 1);
  });
  expect(rejectCueCount(tree, 'sodium')).toBeGreaterThan(0);

  // At the deadline it clears itself.
  act(() => {
    jest.advanceTimersByTime(1);
  });
  expect(rejectCueCount(tree, 'sodium')).toBe(0);
});

test('pressing a locked row again restarts the rejection timer', () => {
  const { tree } = renderRow(flameOf('sodium'), stateFor('sodium'));

  act(() => {
    radio(tree).props.onPress();
  });
  act(() => {
    jest.advanceTimersByTime(200);
  });
  // Second press before the first cue expires should extend it.
  act(() => {
    radio(tree).props.onPress();
  });
  act(() => {
    jest.advanceTimersByTime(200);
  });
  expect(rejectCueCount(tree, 'sodium')).toBeGreaterThan(0);

  act(() => {
    jest.advanceTimersByTime(50);
  });
  expect(rejectCueCount(tree, 'sodium')).toBe(0);
});

test('unmounting during a pending rejection cue clears its timer', () => {
  const { tree } = renderRow(flameOf('sodium'), stateFor('sodium'));

  act(() => {
    radio(tree).props.onPress();
  });
  expect(jest.getTimerCount()).toBeGreaterThan(0);

  act(() => {
    tree.unmount();
  });
  expect(jest.getTimerCount()).toBe(0);
});

// ---- (8) accessibility ----

test('a locked row is labelled "Locked — …" and reads as disabled', () => {
  const sodium = flameOf('sodium');
  const req = sodium.achievement?.requirement ?? '';
  const { tree } = renderRow(sodium, stateFor('sodium'));
  const row = radio(tree);

  expect(row.props.accessibilityLabel).toContain('Locked — ');
  expect(row.props.accessibilityLabel).toContain(req);
  expect(row.props.accessibilityState.disabled).toBe(true);
});

test('an unlocked row is not labelled as locked and is not disabled', () => {
  const { tree } = renderRow(flameOf('amber'), stateFor('amber', { unlocked: true }));
  const row = radio(tree);

  expect(row.props.accessibilityLabel).not.toContain('Locked');
  expect(row.props.accessibilityState.disabled).toBe(false);
});

test('the selected accessibility state reflects the active flame', () => {
  const active = renderRow(flameOf('amber'), stateFor('amber', { unlocked: true }), {
    active: true,
  });
  expect(radio(active.tree).props.accessibilityState.selected).toBe(true);
  expect(radio(active.tree).props.accessibilityLabel).toContain('. Active');

  const inactive = renderRow(flameOf('amber'), stateFor('amber', { unlocked: true }), {
    active: false,
  });
  expect(radio(inactive.tree).props.accessibilityState.selected).toBe(false);
  expect(radio(inactive.tree).props.accessibilityLabel).not.toContain('Active');
});

// ---- (9) swatch gradient colors ----

test('the swatch uses the flame gradient when unlocked', () => {
  const amber = flameOf('amber');
  const { tree } = renderRow(amber, stateFor('amber', { unlocked: true }));
  const gradients = tree.root.findAll(n => n.type === 'LinearGradient');

  expect(gradients.length).toBeGreaterThan(0);
  expect(gradients[0].props.colors).toEqual(amber.gradient);
});

test('the swatch uses the embered stops [core, gold, amber, ember, red] when locked', () => {
  const sodium = flameOf('sodium');
  const e = sodium.embered;
  const { tree } = renderRow(sodium, stateFor('sodium'));
  const gradients = tree.root.findAll(n => n.type === 'LinearGradient');

  expect(gradients.length).toBeGreaterThan(0);
  expect(gradients[0].props.colors).toEqual([e.core, e.gold, e.amber, e.ember, e.red]);
});
