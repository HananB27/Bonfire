/**
 * alpha09.test.ts — unit tests for the alpha09 and forgottenAlpha09 helpers.
 *
 * alpha09 delegates to beta09 for positive inputs, so beta09 is replaced with a
 * Jest mock. That keeps these tests deterministic and independent of beta09's
 * real behavior. forgottenAlpha09 is pure arithmetic and needs no mocking.
 */

import { alpha09, forgottenAlpha09 } from '../src/gardenerDemoChaos/alpha09';
import { beta09 } from '../src/gardenerDemoChaos/beta09';

// Replace beta09 with a mock so each test controls what it returns and can
// check whether it was called. This avoids depending on any real logic in beta09.
jest.mock('../src/gardenerDemoChaos/beta09', () => ({
  beta09: jest.fn(),
}));

const mockedBeta09 = beta09 as jest.MockedFunction<typeof beta09>;

beforeEach(() => {
  // Clear call history and return values so tests cannot affect each other.
  jest.clearAllMocks();
});

describe('alpha09', () => {
  test('returns 0 for zero without calling beta09', () => {
    expect(alpha09(0)).toBe(0);
    expect(mockedBeta09).not.toHaveBeenCalled();
  });

  test('returns 0 for negative values without calling beta09', () => {
    expect(alpha09(-1)).toBe(0);
    expect(alpha09(-100)).toBe(0);
    expect(mockedBeta09).not.toHaveBeenCalled();
  });

  test('delegates to beta09 with value - 1 for positive values', () => {
    mockedBeta09.mockReturnValue(42);

    expect(alpha09(1)).toBe(42);
    expect(mockedBeta09).toHaveBeenCalledTimes(1);
    expect(mockedBeta09).toHaveBeenCalledWith(0);
  });

  test('passes value - 1 through for larger positive values', () => {
    mockedBeta09.mockReturnValue(7);

    expect(alpha09(10)).toBe(7);
    expect(mockedBeta09).toHaveBeenCalledWith(9);
  });

  test('returns exactly what beta09 returns, without transforming it', () => {
    mockedBeta09.mockReturnValue(-3);

    expect(alpha09(5)).toBe(-3);
  });

  test('handles fractional positive input by subtracting one', () => {
    mockedBeta09.mockReturnValue(0);

    alpha09(1.5);
    expect(mockedBeta09).toHaveBeenCalledWith(0.5);
  });

  test('propagates an error thrown by beta09', () => {
    mockedBeta09.mockImplementation(() => {
      throw new Error('beta09 failed');
    });

    expect(() => alpha09(3)).toThrow('beta09 failed');
  });
});

describe('forgottenAlpha09', () => {
  test('returns 0 for zero', () => {
    expect(forgottenAlpha09(0)).toBe(0);
  });

  test('multiplies a positive value by 109', () => {
    expect(forgottenAlpha09(1)).toBe(109);
    expect(forgottenAlpha09(2)).toBe(218);
    expect(forgottenAlpha09(10)).toBe(1090);
  });

  test('multiplies a negative value by 109', () => {
    expect(forgottenAlpha09(-1)).toBe(-109);
    expect(forgottenAlpha09(-5)).toBe(-545);
  });

  test('handles fractional input', () => {
    expect(forgottenAlpha09(0.5)).toBe(54.5);
  });

  test('does not call beta09', () => {
    forgottenAlpha09(4);
    expect(mockedBeta09).not.toHaveBeenCalled();
  });
});
