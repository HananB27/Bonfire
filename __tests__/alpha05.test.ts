/**
 * alpha05.test.ts — unit tests for the alpha05 module.
 *
 * alpha05(value) returns 0 for non-positive input. Otherwise it calls beta05
 * with value - 1 and returns that result. forgottenAlpha05(value) multiplies
 * its input by 105.
 *
 * beta05 lives in a sibling module, so it is mocked here. That keeps these
 * tests deterministic and isolated: no network, no timers, no real beta05 logic.
 */

import { alpha05, forgottenAlpha05 } from '../src/gardenerDemoChaos/alpha05';
import { beta05 } from '../src/gardenerDemoChaos/beta05';

// Replace beta05 with a jest mock so each test controls its return value
// and we can check exactly what alpha05 passed into it.
jest.mock('../src/gardenerDemoChaos/beta05', () => ({
  beta05: jest.fn(),
}));

// Typed handle on the mocked function, so we can set return values and inspect calls.
const mockBeta05 = beta05 as jest.MockedFunction<typeof beta05>;

beforeEach(() => {
  // Reset call history and return values so tests do not affect each other.
  mockBeta05.mockReset();
});

describe('alpha05', () => {
  test('returns 0 for zero without calling beta05', () => {
    // The guard short-circuits on non-positive input, so beta05 is never reached.
    expect(alpha05(0)).toBe(0);
    expect(mockBeta05).not.toHaveBeenCalled();
  });

  test('returns 0 for negative input without calling beta05', () => {
    expect(alpha05(-1)).toBe(0);
    expect(alpha05(-100)).toBe(0);
    expect(mockBeta05).not.toHaveBeenCalled();
  });

  test('delegates to beta05 with value - 1 for positive input', () => {
    mockBeta05.mockReturnValue(7);

    // The result is whatever beta05 returns, and beta05 receives value - 1.
    expect(alpha05(5)).toBe(7);
    expect(mockBeta05).toHaveBeenCalledTimes(1);
    expect(mockBeta05).toHaveBeenCalledWith(4);
  });

  test('passes 0 to beta05 when value is 1 (boundary of the positive branch)', () => {
    mockBeta05.mockReturnValue(99);

    expect(alpha05(1)).toBe(99);
    expect(mockBeta05).toHaveBeenCalledWith(0);
  });

  test('passes a fractional value through as value - 1', () => {
    mockBeta05.mockReturnValue(0.25);

    expect(alpha05(1.5)).toBe(0.25);
    expect(mockBeta05).toHaveBeenCalledWith(0.5);
  });

  test('returns exactly what beta05 returns, even when it is 0', () => {
    // A 0 from beta05 is passed through unchanged; alpha05 does not replace it.
    mockBeta05.mockReturnValue(0);

    expect(alpha05(3)).toBe(0);
    expect(mockBeta05).toHaveBeenCalledWith(2);
  });

  test('propagates an error thrown by beta05', () => {
    // alpha05 does not catch errors, so the failure reaches the caller.
    mockBeta05.mockImplementation(() => {
      throw new Error('beta05 failed');
    });

    expect(() => alpha05(2)).toThrow('beta05 failed');
  });
});

describe('forgottenAlpha05', () => {
  test('multiplies a positive integer by 105', () => {
    expect(forgottenAlpha05(1)).toBe(105);
    expect(forgottenAlpha05(2)).toBe(210);
    expect(forgottenAlpha05(10)).toBe(1050);
  });

  test('returns 0 for 0', () => {
    expect(forgottenAlpha05(0)).toBe(0);
  });

  test('keeps the sign for negative input', () => {
    expect(forgottenAlpha05(-1)).toBe(-105);
    expect(forgottenAlpha05(-4)).toBe(-420);
  });

  test('handles fractional input', () => {
    expect(forgottenAlpha05(2.5)).toBe(262.5);
  });

  test('does not call beta05', () => {
    // forgottenAlpha05 is pure arithmetic and must not touch the mocked dependency.
    forgottenAlpha05(3);
    expect(mockBeta05).not.toHaveBeenCalled();
  });
});
