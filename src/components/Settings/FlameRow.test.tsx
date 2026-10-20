/**
 * FlameRow.test.tsx — tests for the flame gallery row.
 *
 * Covers statusFor (status text / progress), swatchColors (full vs embered
 * gradient), locked-vs-unlocked accessibility labels, equip vs rejection
 * behavior on press, and the ~250ms rejection cue lifecycle.
 *
 * Deterministic: fake timers are used for the rejection cue; no network.
 */

import React from 'react';
import { fireEvent, render, act } from '@testing-library/react-native';

jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return { LinearGradient: (props: any) => <View {...props} /> };
});

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (fn: () => object) => fn(),
    withSequence: (...args: unknown[]) => args[args.length - 1],
    withTiming: (value: number) => value,
  };
});

import FlameRow, { REJECT_MS } from './FlameRow';
import type { AchievementState } from '../../domain/achievements';
import type { FlameStyle } from '../../domain/flames';

const palette = {
  core: '#fff1c0',
  gold: '#ffd66b',
  amber: '#ffae3b',
  ember: '#ff7a18',
  red: '#c8321a',
};

const embered = {
  core: '#5a4a3a',
  gold: '#5e4d36',
  amber: '#5a3f22',
  ember: '#4a2a18',
  red: '#3a1d14',
};

const baseFlame: FlameStyle = {
  id: 'amber',
  name: 'Amber',
  gradient: ['#1', '#2', '#3', '#4', '#5'],
  embered,
  palette,
  achievement: null,
} as unknown as FlameStyle;

const streakFlame: FlameStyle = {
  id: 'crimson',
  name: 'Crimson',
  gradient: ['#a1', '#a2', '#a3', '#a4', '#a5'],
  embered,
  palette,
  achievement: { type: 'streak', requirement: '7-day streak' },
} as unknown as FlameStyle;

const timeFlame: FlameStyle = {
  id: 'sapphire',
  name: 'Sapphire',
  gradient: ['#b1', '#b2', '#b3', '#b4', '#b5'],
  embered,
  palette,
  achievement: { type: 'time', requirement: '3 perfect days' },
} as unknown as FlameStyle;

const unlockedState = (over: Partial<AchievementState> = {}): AchievementState =>
  ({
    unlocked: true,
    progress: { value: 0, target: 0 },
    daysLeft: null,
    expired: false,
    ...over,
  }) as AchievementState;

const lockedState = (over: Partial<AchievementState> = {}): AchievementState =>
  ({
    unlocked: false,
    progress: { value: 0, target: 7 },
    daysLeft: null,
    expired: false,
    ...over,
  }) as AchievementState;

function renderRow(
  flame: FlameStyle,
  state: AchievementState,
  extra: Partial<React.ComponentProps<typeof FlameRow>> = {},
) {
  const onPress = jest.fn();
  const utils = render(
    <FlameRow flame={flame} state={state} active={false} onPress={onPress} {...extra} />,
  );
  return { ...utils, onPress };
}

describe('statusFor (via rendered status text)', () => {
  it('base flame with no achievement shows "Unlocked"', () => {
    const { getByText } = renderRow(baseFlame, unlockedState());
    expect(getByText('Unlocked')).toBeTruthy();
  });

  it('unlocked time flame shows the days-left countdown', () => {
    const { getByText } = renderRow(timeFlame, unlockedState({ daysLeft: 4 }));
    expect(getByText('Unlocked · 4d left')).toBeTruthy();
  });

  it('clamps negative daysLeft to 0', () => {
    const { getByText } = renderRow(timeFlame, unlockedState({ daysLeft: -3 }));
    expect(getByText('Unlocked · 0d left')).toBeTruthy();
  });

  it('locked streak shows requirement and value/target counter', () => {
    const { getByText } = renderRow(
      streakFlame,
      lockedState({ progress: { value: 3, target: 7 } }),
    );
    expect(getByText('7-day streak · 3/7')).toBeTruthy();
  });

  it('caps the displayed counter value at the target', () => {
    const { getByText } = renderRow(
      streakFlame,
      lockedState({ progress: { value: 12, target: 7 } }),
    );
    expect(getByText('7-day streak · 7/7')).toBeTruthy();
  });

  it('locked expired time flame shows the re-earn message', () => {
    const { getByText } = renderRow(
      timeFlame,
      lockedState({ expired: true, progress: { value: 0, target: 3 } }),
    );
    expect(getByText('Expired — re-earn: 3 perfect days')).toBeTruthy();
  });

  it('progress fraction is capped at 1 for the bar width', () => {
    const { toJSON } = renderRow(
      streakFlame,
      lockedState({ progress: { value: 99, target: 7 } }),
    );
    expect(JSON.stringify(toJSON())).toContain('"width":"100%"');
  });
});

describe('accessibility labels', () => {
  it('locked rows announce "Locked — " in the accessibilityLabel', () => {
    const { getByRole } = renderRow(streakFlame, lockedState());
    const radio = getByRole('radio');
    expect(radio.props.accessibilityLabel).toContain('Locked — ');
    expect(radio.props.accessibilityLabel).toContain('Crimson');
  });

  it('unlocked rows do not announce Locked', () => {
    const { getByRole } = renderRow(baseFlame, unlockedState());
    expect(getByRole('radio').props.accessibilityLabel).not.toContain('Locked');
  });

  it('justUnlocked prefixes the status with "Just unlocked!"', () => {
    const { getByText } = renderRow(timeFlame, unlockedState({ daysLeft: 2 }), {
      justUnlocked: true,
    });
    expect(getByText('Just unlocked! Unlocked · 2d left')).toBeTruthy();
  });

  it('marks the active row as selected', () => {
    const { getByRole } = renderRow(baseFlame, unlockedState(), { active: true });
    expect(getByRole('radio').props.accessibilityState.selected).toBe(true);
  });
});

describe('press behavior', () => {
  it('pressing an unlocked row calls onPress with the flame id', () => {
    const { getByRole, onPress } = renderRow(baseFlame, unlockedState());
    fireEvent.press(getByRole('radio'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith('amber');
  });

  it('pressing a locked row does NOT call onPress', () => {
    const { getByRole, onPress } = renderRow(streakFlame, lockedState());
    fireEvent.press(getByRole('radio'));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('locked-tap rejection cue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows the rejection cue after a locked tap and clears it after ~250ms', () => {
    const { getByRole, queryByTestId, onPress } = renderRow(streakFlame, lockedState());
    expect(queryByTestId('flame-reject-crimson')).toBeNull();

    fireEvent.press(getByRole('radio'));
    expect(onPress).not.toHaveBeenCalled();
    expect(queryByTestId('flame-reject-crimson')).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(REJECT_MS - 1);
    });
    expect(queryByTestId('flame-reject-crimson')).not.toBeNull();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(queryByTestId('flame-reject-crimson')).toBeNull();
  });

  it('does not show the rejection cue for an unlocked tap', () => {
    const { getByRole, queryByTestId } = renderRow(baseFlame, unlockedState());
    fireEvent.press(getByRole('radio'));
    expect(queryByTestId('flame-reject-amber')).toBeNull();
  });
});

describe('swatchColors (via LinearGradient colors)', () => {
  // The mocked LinearGradient is a View, so its props carry the colors.
  function gradientColors(tree: ReturnType<typeof render>) {
    const json = tree.toJSON() as any;
    const str = JSON.stringify(json);
    return str;
  }

  it('uses the full flame.gradient when unlocked', () => {
    const tree = renderRow(streakFlame, unlockedState());
    const str = gradientColors(tree);
    expect(str).toContain('#a1');
    expect(str).not.toContain(embered.core);
  });

  it('uses the embered stops when locked', () => {
    const tree = renderRow(streakFlame, lockedState());
    const str = gradientColors(tree);
    expect(str).toContain(embered.core);
    expect(str).toContain(embered.red);
    expect(str).not.toContain('#a1');
  });
});
