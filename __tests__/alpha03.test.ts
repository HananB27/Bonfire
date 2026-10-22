/**
 * alpha03.test.ts — unit tests for the alpha03 demo module.
 *
 * alpha03 delegates to beta03 for positive inputs, so beta03 is mocked here.
 * That keeps these tests focused on alpha03's own branching and makes them
 * deterministic: no real beta03 logic, no network, no timers.
 *
 * forgottenAlpha03 is a pure multiplication and is tested directly.
 */

import { alpha03, forgottenAlpha03 } from '../src/gardenerDemoChaos/alpha03';
import { beta03 } from '../src/gardenerDemoChaos/beta03';

// Replace the real beta03 with a Jest mock so each test controls its return value.
// jest.mock is hoisted above the imports by Jest, so the import above receives the mock.
jest.mock('../src/gardenerDemoChaos/beta03', () => ({
  beta03: jest.fn(),
}));

// Typed handle on the mock so we can set return values and inspect calls.
const mockedBeta03 = beta03 as jest.MockedFunction<typeof beta03>;

beforeEach(() => {
  // Clear call history and implementations so tests cannot leak state into each other.
  mockedBeta03.mockReset();
});

describe('alpha03', () => {
  test('returns 0 for input 0 without calling beta03', () => {
    // The guard `value <= 0` short-circuits, so the delegate must never run.
    expect(alpha03(0)).toBe(0);
    expect(mockedBeta03).not.toHaveBeenCalled();
  });

  test('returns 0 for negative input without calling beta03', () => {
    expect(alpha03(-1)).toBe(0);
    expect(alpha03(-100)).toBe(0);
    expect(mockedBeta03).not.toHaveBeenCalled();
  });

  test('delegates to beta03 with value - 1 for positive input', () => {
    mockedBeta03.mockReturnValue(42);

    // Input 1 should ask beta03 for 0, which is the "one step back" rule.
    alpha03(1);
    expect(mockedBeta03).toHaveBeenCalledTimes(1);
    expect(mockedBeta03).toHaveBeenCalledWith(0);
  });

  test('passes value - 1 through for larger positive input', () => {
    mockedBeta03.mockReturnValue(7);

    expect(alpha03(5)).toBe(7);
    expect(mockedBeta03).toHaveBeenCalledWith(4);
  });

  test('returns exactly what beta03 returns', () => {
    // alpha03 should not transform the delegate's result for positive input.
    mockedBeta03.mockReturnValue(-13);

    expect(alpha03(10)).toBe(-13);
  });

  test('propagates errors thrown by beta03', () => {
    mockedBeta03.mockImplementation(() => {
      throw new Error('beta03 failed');
    });

    expect(() => alpha03(3)).toThrow('beta03 failed');
  });

  test('forwards NaN to beta03, since NaN fails the <= 0 guard', () => {
    // NaN comparisons are always false, so alpha03 takes the delegate branch.
    // This test documents that behavior rather than endorsing it.
    mockedBeta03.mockReturnValue(0);

    alpha03(NaN);
    expect(mockedBeta03).toHaveBeenCalledTimes(1);
    expect(Number.isNaN(mockedBeta03.mock.calls[0][0])).toBe(true);
  });
});

describe('forgottenAlpha03', () => {
  test('returns 0 for input 0', () => {
    expect(forgottenAlpha03(0)).toBe(0);
  });

  test('multiplies a positive value by 103', () => {
    expect(forgottenAlpha03(1)).toBe(103);
    expect(forgottenAlpha03(2)).toBe(206);
    expect(forgottenAlpha03(10)).toBe(1030);
  });

  test('multiplies a negative value by 103 and keeps the sign', () => {
    expect(forgottenAlpha03(-1)).toBe(-103);
    expect(forgottenAlpha03(-2)).toBe(-206);
  });

  test('handles non-integer input', () => {
    expect(forgottenAlpha03(2.5)).toBe(257.5);
  });

  test('does not call beta03', () => {
    // This function is independent of the delegate, so the mock must stay untouched.
    forgottenAlpha03(5);
    expect(mockedBeta03).not.toHaveBeenCalled();
  });
});
