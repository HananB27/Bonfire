/**
 * alpha12.test.ts — unit tests for the alpha12 module.
 *
 * Covers the two public functions:
 *   - alpha12(value): returns 0 for non-positive input; otherwise delegates to
 *     beta12(value - 1) and returns its result.
 *   - forgottenAlpha12(value): multiplies the input by 112.
 *
 * beta12 is mocked so these tests only exercise alpha12's own logic. No real
 * network, timers, or device state is involved, so results are deterministic.
 */

import { alpha12, forgottenAlpha12 } from '../src/gardenerDemoChaos/alpha12';
import { beta12 } from '../src/gardenerDemoChaos/beta12';

// Replace beta12 with a jest mock so each test controls what it returns
// (or throws) and we can check how alpha12 calls it.
jest.mock('../src/gardenerDemoChaos/beta12', () => ({
  beta12: jest.fn(),
}));

const mockedBeta12 = beta12 as jest.Mock;

beforeEach(() => {
  // Reset call history and queued return values so tests stay independent.
  mockedBeta12.mockReset();
});

describe('alpha12', () => {
  test('returns 0 for zero without calling beta12', () => {
    expect(alpha12(0)).toBe(0);
    expect(mockedBeta12).not.toHaveBeenCalled();
  });

  test('returns 0 for negative input without calling beta12', () => {
    expect(alpha12(-1)).toBe(0);
    expect(alpha12(-100)).toBe(0);
    expect(mockedBeta12).not.toHaveBeenCalled();
  });

  test('calls beta12 with value - 1 for positive input', () => {
    mockedBeta12.mockReturnValue(7);

    alpha12(5);

    expect(mockedBeta12).toHaveBeenCalledTimes(1);
    expect(mockedBeta12).toHaveBeenCalledWith(4);
  });

  test('returns exactly what beta12 returns for positive input', () => {
    mockedBeta12.mockReturnValue(42);

    expect(alpha12(1)).toBe(42);
    expect(mockedBeta12).toHaveBeenCalledWith(0);
  });

  test('passes through a value of 1 as 0 to beta12', () => {
    // Boundary: the smallest positive integer should hand beta12 the value 0.
    mockedBeta12.mockReturnValue(-3);

    expect(alpha12(1)).toBe(-3);
    expect(mockedBeta12).toHaveBeenCalledWith(0);
  });

  test('handles fractional positive input by subtracting 1', () => {
    mockedBeta12.mockReturnValue(0);

    alpha12(0.5);

    expect(mockedBeta12).toHaveBeenCalledWith(-0.5);
  });

  test('forwards NaN to beta12 because NaN fails the <= 0 check', () => {
    // NaN <= 0 is false, so alpha12 takes the delegation branch.
    mockedBeta12.mockReturnValue(NaN);

    expect(alpha12(NaN)).toBeNaN();
    expect(mockedBeta12).toHaveBeenCalledTimes(1);
  });

  test('propagates errors thrown by beta12', () => {
    mockedBeta12.mockImplementation(() => {
      throw new Error('beta12 failed');
    });

    expect(() => alpha12(3)).toThrow('beta12 failed');
  });
});

describe('forgottenAlpha12', () => {
  test('multiplies a positive value by 112', () => {
    expect(forgottenAlpha12(1)).toBe(112);
    expect(forgottenAlpha12(5)).toBe(560);
  });

  test('returns 0 for zero', () => {
    expect(forgottenAlpha12(0)).toBe(0);
  });

  test('keeps the sign for negative values', () => {
    expect(forgottenAlpha12(-2)).toBe(-224);
  });

  test('handles fractional values', () => {
    expect(forgottenAlpha12(0.5)).toBe(56);
  });

  test('does not call beta12', () => {
    forgottenAlpha12(10);

    expect(mockedBeta12).not.toHaveBeenCalled();
  });
});
