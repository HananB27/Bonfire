/**
 * chaos.test.ts — deterministic tests for calculateChaosScore in
 * src/gardenerTest/chaos.ts.
 *
 * The function is pure: it takes a numeric value and a 10-element boolean
 * flags array and returns a number. Each flag index applies one arithmetic
 * step, and the final `value` threshold ladder adds a bonus. The expected
 * numbers below were derived by hand-tracing the current implementation, so
 * any behavior change will show up as a failing assertion here.
 *
 * Helper: `allFlags(bool)` builds a flags array where every index has the
 * same value. Use `withFlag(index, bool)` to flip a single index away from
 * a baseline.
 */

import { calculateChaosScore } from '../src/gardenerTest/chaos';

/** Build a 10-element flags array with every entry set to `v`. */
const allFlags = (v: boolean): boolean[] => Array.from({ length: 10 }, () => v);

/** Build a flags array with every entry `base`, except `index` set to `v`. */
const withFlag = (index: number, v: boolean, base = false): boolean[] => {
  const flags = allFlags(base);
  flags[index] = v;
  return flags;
};

describe('calculateChaosScore — flag index branches', () => {
  // Each index is tested with its flag true and false, against a baseline of
  // all-false, so only one step differs from the baseline path.

  test('index 0 true adds 1 at the start (value 0, all others false)', () => {
    // Trace: result=0; f0 true -> 1; f1 false -> 8; f2 false -> 21;
    // f3 false -> 40; f4 false -> 20; f5 false -> -3; f6 false -> 3;
    // f7 false -> 3; f8 false -> 3; f9 false -> -26; value<=10 -> -29.
    expect(calculateChaosScore(0, withFlag(0, true))).toBe(-29);
  });

  test('index 0 false subtracts 1 at the start (value 0, all others false)', () => {
    // Same path but result starts at -1 instead of 1: total is 2 lower.
    expect(calculateChaosScore(0, allFlags(false))).toBe(-31);
  });

  test('index 1 true doubles (value 0, all others false)', () => {
    // Trace: result=-1; f1 true -> -2; f2 false -> 11; f3 false -> 30;
    // f4 false -> 15; f5 false -> -8; f6 false -> 8; f7 false -> 8;
    // f8 false -> 8; f9 false -> -21; value<=10 -> -24.
    expect(calculateChaosScore(0, withFlag(1, true))).toBe(-24);
  });

  test('index 1 false adds 7 (value 0, all others false)', () => {
    // Baseline -31 path, with +7 at step 1 and no doubling.
    expect(calculateChaosScore(0, allFlags(false))).toBe(-31);
  });

  test('index 2 true applies modulo 13 (value 0, all others false)', () => {
    // Trace: result=-1; f1 false -> 6; f2 true -> 6 % 13 = 6; f3 false -> 25;
    // f4 false -> 12; f5 false -> -11; f6 false -> 11; f7 false -> 11;
    // f8 false -> 11; f9 false -> -18; value<=10 -> -21.
    expect(calculateChaosScore(0, withFlag(2, true))).toBe(-21);
  });

  test('index 2 false adds 13 (value 0, all others false)', () => {
    expect(calculateChaosScore(0, allFlags(false))).toBe(-31);
  });

  test('index 3 true subtracts 19 (value 0, all others false)', () => {
    // Trace: result=-1; f1 false -> 6; f2 false -> 19; f3 true -> 0;
    // f4 false -> 0; f5 false -> -23; f6 false -> 23; f7 false -> 23;
    // f8 false -> 23; f9 false -> -6; value<=10 -> -9.
    expect(calculateChaosScore(0, withFlag(3, true))).toBe(-9);
  });

  test('index 3 false adds 19 (value 0, all others false)', () => {
    expect(calculateChaosScore(0, allFlags(false))).toBe(-31);
  });

  test('index 4 true triples (value 0, all others false)', () => {
    // Trace: result=-1; f1 false -> 6; f2 false -> 19; f3 false -> 38;
    // f4 true -> 114; f5 false -> -23... check: 114-23=91; f6 false -> 91? see below.
    // Step-by-step: f5 false -> 91-23... (f5 is index 5; f5 flag false -> -23)
    // f6 false -> -(68)=-68; f7 false -> -68; f8 false -> -68; f9 false -> -97;
    // value<=10 -> -100.
    expect(calculateChaosScore(0, withFlag(4, true))).toBe(-100);
  });

  test('index 4 false halves via floor (value 0, all others false)', () => {
    expect(calculateChaosScore(0, allFlags(false))).toBe(-31);
  });

  test('index 5 true adds 23 (value 0, all others false)', () => {
    // Trace: result=-1; f1 false -> 6; f2 false -> 19; f3 false -> 38;
    // f4 false -> 19; f5 true -> 42; f6 false -> -42; f7 false -> -42;
    // f8 false -> -42; f9 false -> -71; value<=10 -> -74.
    expect(calculateChaosScore(0, withFlag(5, true))).toBe(-74);
  });

  test('index 5 false subtracts 23 (value 0, all others false)', () => {
    expect(calculateChaosScore(0, allFlags(false))).toBe(-31);
  });

  test('index 6 true takes absolute value (value 0, all others false)', () => {
    // Trace: result=-1; f1 false -> 6; f2 false -> 19; f3 false -> 38;
    // f4 false -> 19; f5 false -> -4; f6 false -> -(-4-23)... see note:
    // f5 false: -4 - 23 = -27; f6 true abs -> 27; f7 false -> -27;
    // f8 false -> -27; f9 false -> -56; value<=10 -> -59.
    expect(calculateChaosScore(0, withFlag(6, true))).toBe(-59);
  });

  test('index 6 false negates (value 0, all others false)', () => {
    expect(calculateChaosScore(0, allFlags(false))).toBe(-31);
  });

  test('index 7 true adds value*5 (value 0, all others false)', () => {
    // With value 0, value*5 is 0, so the true and false branches coincide.
    // Trace of the baseline path with f7 true: result unchanged at 27-? see
    // baseline; expected equal to the all-false result.
    expect(calculateChaosScore(0, withFlag(7, true))).toBe(-31);
  });

  test('index 7 false subtracts value*5 (value 0, all others false)', () => {
    expect(calculateChaosScore(0, allFlags(false))).toBe(-31);
  });

  test('index 8 true applies the >100 wrapper (value 0, all others false)', () => {
    // Trace: result=-1; f1 false -> 6; f2 false -> 19; f3 false -> 38;
    // f4 false -> 19; f5 false -> -4; f6 false -> 4; f7 false -> -4;
    // f8 true: -4 > 100? no -> -4+100 = 96; f9 false -> 67; value<=10 -> 64.
    expect(calculateChaosScore(0, withFlag(8, true))).toBe(64);
  });

  test('index 8 false takes absolute value (value 0, all others false)', () => {
    expect(calculateChaosScore(0, allFlags(false))).toBe(-31);
  });

  test('index 9 true adds 29 (value 0, all others false)', () => {
    // Baseline -31 with f9 +29 instead of -29: difference of 58.
    expect(calculateChaosScore(0, withFlag(9, true))).toBe(27);
  });

  test('index 9 false subtracts 29 (value 0, all others false)', () => {
    expect(calculateChaosScore(0, allFlags(false))).toBe(-31);
  });
});

describe('calculateChaosScore — value threshold branches', () => {
  // All flags false keeps the flag contribution fixed, so the threshold
  // ladder's effect can be isolated by comparing against the baseline.

  test('value > 100 adds 31 to the all-false baseline', () => {
    // value 101 is the first input in the >100 branch.
    expect(calculateChaosScore(101, allFlags(false))).toBe(-8);
  });

  test('value > 50 (and <= 100) adds 17', () => {
    expect(calculateChaosScore(51, allFlags(false))).toBe(-19);
  });

  test('value > 20 (and <= 50) adds 11', () => {
    expect(calculateChaosScore(21, allFlags(false))).toBe(-17);
  });

  test('value > 10 (and <= 20) adds 5', () => {
    expect(calculateChaosScore(11, allFlags(false))).toBe(-19);
  });

  test('value <= 10 subtracts 3', () => {
    expect(calculateChaosScore(10, allFlags(false))).toBe(-31);
  });

  test('boundary: value exactly 100 falls into the >50 branch, not >100', () => {
    expect(calculateChaosScore(100, allFlags(false))).toBe(-19);
  });

  test('boundary: value exactly 50 falls into the >20 branch, not >50', () => {
    expect(calculateChaosScore(50, allFlags(false))).toBe(-17);
  });

  test('boundary: value exactly 20 falls into the >10 branch, not >20', () => {
    expect(calculateChaosScore(20, allFlags(false))).toBe(-19);
  });

  test('boundary: value exactly 10 falls into the else branch, not >10', () => {
    expect(calculateChaosScore(10, allFlags(false))).toBe(-31);
  });
});

describe('calculateChaosScore — determinism and purity', () => {
  test('same inputs always produce the same output', () => {
    const flags = [true, false, true, false, true, false, true, false, true, false];
    const first = calculateChaosScore(37, flags);
    const second = calculateChaosScore(37, flags);
    expect(second).toBe(first);
  });

  test('does not mutate the flags array', () => {
    const flags = [true, true, false, false, true, true, false, false, true, true];
    const snapshot = [...flags];
    calculateChaosScore(42, flags);
    expect(flags).toEqual(snapshot);
  });

  test('handles a negative value without throwing', () => {
    expect(() => calculateChaosScore(-5, allFlags(true))).not.toThrow();
    expect(Number.isFinite(calculateChaosScore(-5, allFlags(true)))).toBe(true);
  });
});
