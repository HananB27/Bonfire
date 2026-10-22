/**
 * alpha04.test.ts — unit tests for the alpha04 helpers.
 *
 * alpha04 delegates to beta04 for positive inputs, so beta04 is mocked here.
 * That keeps these tests focused on alpha04's own branching and avoids
 * depending on beta04's implementation. forgottenAlpha04 is pure arithmetic
 * and needs no mocks.
 */

import { alpha04, forgottenAlpha04 } from '../src/gardenerDemoChaos/alpha04';
import { beta04 } from '../src/gardenerDemoChaos/beta04';

// Replace beta04 with a jest mock so calls are recorded and return values are controlled.
jest.mock('../src/gardenerDemoChaos/beta04', () => ({
  beta04: jest.fn(),
}));

const mockedBeta04 = jest.mocked(beta04);

beforeEach(() => {
  // Reset call history and return values so each test starts from a clean slate.
  mockedBeta04.mockReset();
});

describe('alpha04', () => {
  test('returns 0 for zero without calling beta04', () => {
    expect(alpha04(0)).toBe(0);
    expect(mockedBeta04).not.toHaveBeenCalled();
  });

  test('returns 0 for negative values without calling beta04', () => {
    expect(alpha04(-1)).toBe(0);
    expect(alpha04(-100)).toBe(0);
    expect(mockedBeta04).not.toHaveBeenCalled();
  });

  test('delegates to beta04 with value - 1 for positive values', () => {
    mockedBeta04.mockReturnValue(42);

    expect(alpha04(5)).toBe(42);
    expect(mockedBeta04).toHaveBeenCalledTimes(1);
    expect(mockedBeta04).toHaveBeenCalledWith(4);
  });

  test('passes 0 to beta04 when value is 1 (boundary just above zero)', () => {
    mockedBeta04.mockReturnValue(7);

    expect(alpha04(1)).toBe(7);
    expect(mockedBeta04).toHaveBeenCalledWith(0);
  });

  test('returns exactly what beta04 returns, without transforming it', () => {
    mockedBeta04.mockReturnValue(-3.5);

    expect(alpha04(2)).toBe(-3.5);
  });

  test('propagates errors thrown by beta04', () => {
    mockedBeta04.mockImplementation(() => {
      throw new Error('beta04 failed');
    });

    expect(() => alpha04(3)).toThrow('beta04 failed');
  });
});

describe('forgottenAlpha04', () => {
  test('returns 0 for zero', () => {
    expect(forgottenAlpha04(0)).toBe(0);
  });

  test('multiplies a positive value by 104', () => {
    expect(forgottenAlpha04(1)).toBe(104);
    expect(forgottenAlpha04(5)).toBe(520);
  });

  test('multiplies a negative value by 104', () => {
    expect(forgottenAlpha04(-2)).toBe(-208);
  });

  test('handles non-integer input by scaling it directly', () => {
    expect(forgottenAlpha04(0.5)).toBe(52);
  });

  test('does not call beta04', () => {
    forgottenAlpha04(10);

    expect(mockedBeta04).not.toHaveBeenCalled();
  });
});
