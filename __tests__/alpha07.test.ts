/**
 * alpha07.test.ts — unit tests for the alpha07 module.
 *
 * alpha07 is a small recursive-style helper: it returns 0 for non-positive
 * input and otherwise delegates to beta07 with the value decremented by one.
 * forgottenAlpha07 is a pure scaling function that multiplies its input by 107.
 *
 * beta07 lives in a sibling module, so we mock it. That keeps these tests
 * deterministic and isolated: they only check how alpha07 calls beta07 and
 * what it does with the result, not what beta07 itself computes.
 */

import { alpha07, forgottenAlpha07 } from '../src/gardenerDemoChaos/alpha07';
import { beta07 } from '../src/gardenerDemoChaos/beta07';

// Replace the real beta07 with a Jest mock so no real logic runs under test.
jest.mock('../src/gardenerDemoChaos/beta07', () => ({
  beta07: jest.fn(),
}));

// Typed handle on the mock so we can set return values and inspect calls.
const mockedBeta07 = beta07 as jest.MockedFunction<typeof beta07>;

beforeEach(() => {
  // Clear call history and queued implementations so each test starts clean.
  mockedBeta07.mockReset();
});

describe('alpha07', () => {
  test('delegates to beta07 with value - 1 for positive input', () => {
    mockedBeta07.mockReturnValue(42);

    const result = alpha07(5);

    expect(mockedBeta07).toHaveBeenCalledTimes(1);
    expect(mockedBeta07).toHaveBeenCalledWith(4);
    expect(result).toBe(42);
  });

  test('passes 0 to beta07 when input is 1 (boundary of the positive branch)', () => {
    mockedBeta07.mockReturnValue(7);

    expect(alpha07(1)).toBe(7);
    expect(mockedBeta07).toHaveBeenCalledWith(0);
  });

  test('returns beta07 result unchanged, whatever it is', () => {
    mockedBeta07.mockReturnValue(-3);

    expect(alpha07(2)).toBe(-3);
  });

  test('returns 0 without calling beta07 when value is 0', () => {
    expect(alpha07(0)).toBe(0);
    expect(mockedBeta07).not.toHaveBeenCalled();
  });

  test('returns 0 without calling beta07 when value is negative', () => {
    expect(alpha07(-1)).toBe(0);
    expect(alpha07(-100)).toBe(0);
    expect(mockedBeta07).not.toHaveBeenCalled();
  });

  test('returns a non-integer result from beta07 as-is', () => {
    mockedBeta07.mockReturnValue(2.5);

    expect(alpha07(0.5)).toBe(2.5);
    expect(mockedBeta07).toHaveBeenCalledWith(-0.5);
  });

  test('propagates errors thrown by beta07', () => {
    // If the dependency fails, alpha07 should not swallow the error.
    mockedBeta07.mockImplementationOnce(() => {
      throw new Error('beta07 failed');
    });

    expect(() => alpha07(3)).toThrow('beta07 failed');
  });
});

describe('forgottenAlpha07', () => {
  test('multiplies a positive value by 107', () => {
    expect(forgottenAlpha07(3)).toBe(321);
  });

  test('returns 0 for input 0', () => {
    expect(forgottenAlpha07(0)).toBe(0);
  });

  test('multiplies a negative value by 107, keeping the sign', () => {
    expect(forgottenAlpha07(-2)).toBe(-214);
  });

  test('returns 107 for input 1 (identity-style sanity check)', () => {
    expect(forgottenAlpha07(1)).toBe(107);
  });

  test('scales fractional input proportionally', () => {
    expect(forgottenAlpha07(0.5)).toBe(53.5);
  });

  test('does not call beta07', () => {
    forgottenAlpha07(10);

    expect(mockedBeta07).not.toHaveBeenCalled();
  });
});
