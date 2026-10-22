/**
 * alpha13.test.ts — unit tests for the alpha13 module.
 *
 * alpha13 delegates to beta13 for positive inputs, so beta13 is replaced with a
 * jest mock. That keeps these tests deterministic and independent of whatever
 * beta13 actually computes. forgottenAlpha13 is pure and is tested directly.
 */

import { alpha13, forgottenAlpha13 } from '../src/gardenerDemoChaos/alpha13';
import { beta13 } from '../src/gardenerDemoChaos/beta13';

// Replace beta13 with a jest.fn so each test can control its return value and
// assert exactly which arguments alpha13 passed to it.
jest.mock('../src/gardenerDemoChaos/beta13', () => ({
  beta13: jest.fn(),
}));

const mockedBeta13 = beta13 as jest.MockedFunction<typeof beta13>;

describe('alpha13', () => {
  // Clear recorded calls between tests so one test's call count can't leak into another.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 0 for zero without calling beta13', () => {
    expect(alpha13(0)).toBe(0);
    expect(mockedBeta13).not.toHaveBeenCalled();
  });

  test('returns 0 for negative input without calling beta13', () => {
    expect(alpha13(-1)).toBe(0);
    expect(alpha13(-100)).toBe(0);
    expect(mockedBeta13).not.toHaveBeenCalled();
  });

  test('passes value minus one to beta13 for positive input', () => {
    mockedBeta13.mockReturnValue(42);

    alpha13(5);

    expect(mockedBeta13).toHaveBeenCalledTimes(1);
    expect(mockedBeta13).toHaveBeenCalledWith(4);
  });

  test('returns exactly what beta13 returns for positive input', () => {
    mockedBeta13.mockReturnValue(7);

    expect(alpha13(3)).toBe(7);
  });

  test('boundary: value 1 delegates beta13(0)', () => {
    mockedBeta13.mockReturnValue(-9);

    // The smallest positive input maps to beta13's zero argument, and the mock's
    // return value passes straight through.
    expect(alpha13(1)).toBe(-9);
    expect(mockedBeta13).toHaveBeenCalledWith(0);
  });

  test('propagates an error thrown by beta13', () => {
    mockedBeta13.mockImplementation(() => {
      throw new Error('beta13 failed');
    });

    expect(() => alpha13(2)).toThrow('beta13 failed');
  });
});

describe('forgottenAlpha13', () => {
  test('multiplies the input by 113', () => {
    expect(forgottenAlpha13(1)).toBe(113);
    expect(forgottenAlpha13(2)).toBe(226);
    expect(forgottenAlpha13(10)).toBe(1130);
  });

  test('returns 0 for zero', () => {
    expect(forgottenAlpha13(0)).toBe(0);
  });

  test('handles negative inputs by scaling their sign', () => {
    expect(forgottenAlpha13(-1)).toBe(-113);
  });

  test('handles fractional inputs', () => {
    expect(forgottenAlpha13(0.5)).toBe(56.5);
  });

  test('does not call beta13', () => {
    jest.clearAllMocks();

    forgottenAlpha13(3);

    expect(mockedBeta13).not.toHaveBeenCalled();
  });
});
