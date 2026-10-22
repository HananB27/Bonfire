/**
 * alpha10.test.ts — unit tests for the alpha10 module.
 *
 * alpha10 delegates to beta10 for positive input and returns 0 otherwise.
 * forgottenAlpha10 is a pure multiplication. beta10 is mocked so these tests
 * stay deterministic and independent of its implementation.
 */

import { alpha10, forgottenAlpha10 } from '../src/gardenerDemoChaos/alpha10';
import { beta10 } from '../src/gardenerDemoChaos/beta10';

// Replace beta10 with a controllable jest.fn so each test sets its own result.
jest.mock('../src/gardenerDemoChaos/beta10', () => ({
  beta10: jest.fn(),
}));

const mockedBeta10 = beta10 as jest.MockedFunction<typeof beta10>;

beforeEach(() => {
  // Reset call history and return values so tests cannot leak state into each other.
  mockedBeta10.mockReset();
});

describe('alpha10', () => {
  test('returns 0 for zero without calling beta10', () => {
    expect(alpha10(0)).toBe(0);
    expect(mockedBeta10).not.toHaveBeenCalled();
  });

  test('returns 0 for negative values without calling beta10', () => {
    expect(alpha10(-1)).toBe(0);
    expect(alpha10(-100)).toBe(0);
    expect(mockedBeta10).not.toHaveBeenCalled();
  });

  test('delegates to beta10 with value - 1 for positive input', () => {
    mockedBeta10.mockReturnValue(42);

    expect(alpha10(1)).toBe(42);
    expect(mockedBeta10).toHaveBeenCalledTimes(1);
    expect(mockedBeta10).toHaveBeenCalledWith(0);
  });

  test('passes value - 1 through for larger positive input', () => {
    mockedBeta10.mockReturnValue(7);

    expect(alpha10(5)).toBe(7);
    expect(mockedBeta10).toHaveBeenCalledWith(4);
  });

  test('returns whatever beta10 returns, unchanged', () => {
    mockedBeta10.mockReturnValue(-3);

    expect(alpha10(2)).toBe(-3);
  });

  test('propagates errors thrown by beta10', () => {
    mockedBeta10.mockImplementation(() => {
      throw new Error('beta10 failed');
    });

    expect(() => alpha10(3)).toThrow('beta10 failed');
  });
});

describe('forgottenAlpha10', () => {
  test('returns 0 for zero', () => {
    expect(forgottenAlpha10(0)).toBe(0);
  });

  test('multiplies a positive value by 110', () => {
    expect(forgottenAlpha10(1)).toBe(110);
    expect(forgottenAlpha10(3)).toBe(330);
  });

  test('multiplies a negative value by 110', () => {
    expect(forgottenAlpha10(-2)).toBe(-220);
  });

  test('handles fractional input', () => {
    expect(forgottenAlpha10(2.5)).toBe(275);
  });

  test('does not call beta10', () => {
    forgottenAlpha10(4);

    expect(mockedBeta10).not.toHaveBeenCalled();
  });
});
