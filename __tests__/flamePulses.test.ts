/**
 * flamePulses.test.ts — deterministic tests for visual pulse rules.
 *
 * The domain helpers are pure, so each test feeds a tiny score history and
 * checks the exact output without React, storage, or animation.
 */

import {
  CONSISTENCY_PULSE_ACTIVE_MS,
  CONSISTENCY_PULSE_FADE_MS,
  deriveFlamePulseState,
  HIGH_SCORE_PULSE_ACTIVE_MS,
  HIGH_SCORE_PULSE_FADE_MS,
  qualifiesRawConsistency,
  qualifiesRawHighScore,
} from '../src/domain/flamePulses';
import type { Entries, Score } from '../src/domain/fire';

function entries(days: [string, Score][]): Entries {
  return Object.fromEntries(days) as Entries;
}

function lit() {
  return { state: 'lit' as const };
}

function consistencyBlock(month: string, start: number): [string, Score][] {
  const d = (n: number) => `${month}-${String(n).padStart(2, '0')}`;
  return [
    [d(start), 4],
    [d(start + 1), 4],
    [d(start + 2), 4],
    [d(start + 3), 4],
    [d(start + 4), 4],
  ];
}

test('high-score pulse qualifies on score 5 with three prior samples and +1 delta', () => {
  const state = deriveFlamePulseState(
    entries([
      ['2026-06-01', 3],
      ['2026-06-02', 4],
      ['2026-06-03', 4],
      ['2026-06-04', 5],
    ]),
    '2026-06-04',
    lit(),
  );

  expect(state).toMatchObject({
    active: true,
    family: 'highScore',
    visualKind: 'brightBurst',
    activeMs: HIGH_SCORE_PULSE_ACTIVE_MS,
    fadeMs: HIGH_SCORE_PULSE_FADE_MS,
  });
});

test('high-score pulse rejects weak samples, weak delta, cooldown, not-lit, and mutation', () => {
  const original = entries([
    ['2026-05-25', 3],
    ['2026-05-26', 3],
    ['2026-05-27', 3],
    ['2026-05-28', 5],
    ['2026-05-29', 4],
    ['2026-06-03', 5],
  ]);
  const before = JSON.stringify(original);

  expect(qualifiesRawHighScore(entries([['2026-06-04', 5]]), '2026-06-04')).toBe(false);
  expect(
    qualifiesRawHighScore(
      entries([
        ['2026-06-01', 5],
        ['2026-06-02', 5],
        ['2026-06-03', 5],
        ['2026-06-04', 5],
      ]),
      '2026-06-04',
    ),
  ).toBe(false);
  expect(deriveFlamePulseState(original, '2026-06-03', lit()).suppressedReason).toBe('cooldown');
  expect(deriveFlamePulseState(original, '2026-06-03', { state: 'out' }).suppressedReason).toBe(
    'not-lit',
  );
  expect(JSON.stringify(original)).toBe(before);
});

test('high-score cooldown is based on displayed pulses, not suppressed raw qualifiers', () => {
  const sample = entries([
    ['2026-05-29', 3],
    ['2026-05-30', 3],
    ['2026-05-31', 3],
    ['2026-06-01', 5],
    ['2026-06-03', 3],
    ['2026-06-04', 3],
    ['2026-06-05', 3],
    ['2026-06-06', 5],
    ['2026-06-08', 3],
    ['2026-06-09', 3],
    ['2026-06-10', 3],
    ['2026-06-11', 5],
  ]);

  expect(deriveFlamePulseState(sample, '2026-06-01', lit()).family).toBe('highScore');
  expect(deriveFlamePulseState(sample, '2026-06-06', lit()).suppressedReason).toBe('cooldown');
  expect(deriveFlamePulseState(sample, '2026-06-11', lit()).family).toBe('highScore');
});

test('consistency pulse qualifies on five strong days in rolling seven-day window', () => {
  const state = deriveFlamePulseState(
    entries(consistencyBlock('2026-06', 1)),
    '2026-06-05',
    lit(),
  );

  expect(state).toMatchObject({
    active: true,
    family: 'consistency',
    visualKind: 'warmGlow',
    activeMs: CONSISTENCY_PULSE_ACTIVE_MS,
    fadeMs: CONSISTENCY_PULSE_FADE_MS,
  });
});

test('consistency pulse rejects low score, weak sample count, cooldown, and not-lit', () => {
  expect(qualifiesRawConsistency(entries(consistencyBlock('2026-06', 1).slice(0, 4)), '2026-06-04')).toBe(
    false,
  );
  expect(
    qualifiesRawConsistency(
      entries([
        ['2026-06-01', 4],
        ['2026-06-02', 4],
        ['2026-06-03', 3],
        ['2026-06-04', 4],
        ['2026-06-05', 4],
      ]),
      '2026-06-05',
    ),
  ).toBe(false);
  const cooldown = entries([
    ...consistencyBlock('2026-06', 1),
    ['2026-06-06', 4],
  ]);
  expect(deriveFlamePulseState(cooldown, '2026-06-06', lit()).suppressedReason).toBe('cooldown');
  expect(deriveFlamePulseState(cooldown, '2026-06-06', { state: 'unlit' }).suppressedReason).toBe(
    'not-lit',
  );
});

test('consistency cooldown does not chain through suppressed raw consistency days', () => {
  const sample = entries([
    ['2026-06-01', 4],
    ['2026-06-02', 4],
    ['2026-06-03', 4],
    ['2026-06-04', 4],
    ['2026-06-05', 4],
    ['2026-06-06', 4],
    ['2026-06-07', 4],
    ['2026-06-08', 4],
    ['2026-06-09', 4],
    ['2026-06-10', 4],
    ['2026-06-11', 4],
    ['2026-06-12', 4],
  ]);

  expect(deriveFlamePulseState(sample, '2026-06-05', lit()).family).toBe('consistency');
  expect(deriveFlamePulseState(sample, '2026-06-06', lit()).suppressedReason).toBe('cooldown');
  expect(deriveFlamePulseState(sample, '2026-06-12', lit()).family).toBe('consistency');
});

test('high-score priority wins both-family collision and exposes warm tint', () => {
  const state = deriveFlamePulseState(
    entries([
      ['2026-06-01', 4],
      ['2026-06-02', 4],
      ['2026-06-03', 4],
      ['2026-06-04', 4],
      ['2026-06-05', 5],
    ]),
    '2026-06-05',
    lit(),
  );

  expect(state.family).toBe('highScore');
  expect(state.visualKind).toBe('brightBurst');
  expect(state.consistencyTint).toBe(true);
});
