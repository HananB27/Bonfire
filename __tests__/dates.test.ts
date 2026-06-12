/**
 * dates.test.ts — unit tests for the date helpers.
 *
 * The most important rule under test: a day is only "past" once it has fully
 * elapsed; today is never treated as past (and therefore never a missed day).
 */

import {
  addDays,
  diffDays,
  isFuture,
  isPast,
  monthGrid,
  parseYmd,
  ymd,
} from '../src/domain/dates';

describe('ymd / parseYmd', () => {
  test('formats a local date as YYYY-MM-DD with zero padding', () => {
    // March 5, 2026 -> "2026-03-05" (month is 0-based in the Date constructor).
    expect(ymd(new Date(2026, 2, 5))).toBe('2026-03-05');
  });

  test('round-trips a key back to the same date', () => {
    const key = '2026-12-31';
    expect(ymd(parseYmd(key))).toBe(key);
  });
});

describe('isPast / isFuture (the "today is not a miss" boundary)', () => {
  const today = '2026-06-11';

  test('yesterday is past', () => {
    expect(isPast('2026-06-10', today)).toBe(true);
  });

  test('today is NOT past', () => {
    expect(isPast(today, today)).toBe(false);
  });

  test('tomorrow is future, today is not', () => {
    expect(isFuture('2026-06-12', today)).toBe(true);
    expect(isFuture(today, today)).toBe(false);
  });
});

describe('addDays / diffDays', () => {
  test('adds and subtracts across month boundaries', () => {
    expect(addDays('2026-06-30', 1)).toBe('2026-07-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  test('diffDays counts whole days, signed', () => {
    expect(diffDays('2026-06-12', '2026-06-11')).toBe(1);
    expect(diffDays('2026-06-11', '2026-06-12')).toBe(-1);
    expect(diffDays('2026-06-11', '2026-06-11')).toBe(0);
  });
});

describe('monthGrid', () => {
  test('always returns a full 42-cell grid', () => {
    expect(monthGrid(2026, 5)).toHaveLength(42); // June 2026
  });

  test('pads the start so day 1 sits under the correct weekday', () => {
    // June 1, 2026 is a Monday (weekday index 1), so exactly one leading blank.
    const grid = monthGrid(2026, 5);
    expect(grid[0]).toBeNull();
    expect(grid[1]).toBe('2026-06-01');
  });
});
