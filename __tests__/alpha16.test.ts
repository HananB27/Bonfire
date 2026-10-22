/**
 * alpha16.test.ts — unit tests for the alpha16 helpers.
 *
 * alpha16 delegates to beta16 for positive inputs, so beta16 is mocked here.
 * That keeps these tests focused on alpha16's own logic and avoids depending
 * on whatever beta16 does internally. forgottenAlpha16 is pure arithmetic and
 * needs no mocks. No network, timers, or device state are involved.
 */

import { alpha16, forgottenAlpha16 } from '../src/gardenerDemoChaos/alpha16';
import { beta16 } from '../src/gardenerDemoChaos/beta16';

// Replace beta16 with a jest mock so each test controls its return value
// and we can check exactly what alpha16 passed into it.
jest.mock('../src/gardenerDemoChaos/beta16', () => ({
  beta16: jest.fn(),
}));

const mockedBeta16 = beta16 as jest.MockedFunction<typeof beta16>;

beforeEach(() => {
  // Reset call history and return values so tests cannot leak state into each other.
  mockedBeta16.mockReset();
});

describe('alpha16', () => {
  test('returns 0 for zero without calling beta16', () => {
    expect(alpha16(0)).toBe(0);
    expect(mockedBeta16).not.toHaveBeenCalled();
  });

  test('returns 0 for negative values without calling beta16', () => {
    expect(alpha16(-1)).toBe(0);
    expect(alpha16(-100)).toBe(0);
    expect(mockedBeta16).not.toHaveBeenCalled();
  });

  test('for a positive value, calls beta16 with value minus one', () => {
    mockedBeta16.mockReturnValue(0);

    alpha16(1);

    expect(mockedBeta16).toHaveBeenCalledTimes(1);
    expect(mockedBeta16).toHaveBeenCalledWith(0);
  });

  test('returns exactly what beta16 returns for positive values', () => {
    mockedBeta16.mockReturnValue(42);

    expect(alpha16(10)).toBe(42);
    expect(mockedBeta16).toHaveBeenCalledWith(9);
  });

  test('passes fractional values through as value minus one', () => {
    mockedBeta16.mockReturnValue(7);

    expect(alpha16(2.5)).toBe(7);
    expect(mockedBeta16).toHaveBeenCalledWith(1.5);
  });

  test('forwards Infinity to beta16 since it is positive', () => {
    mockedBeta16.mockReturnValue(1);

    expect(alpha16(Infinity)).toBe(1);
    expect(mockedBeta16).toHaveBeenCalledWith(Infinity);
  });

  test('propagates beta16 errors to the caller', () => {
    mockedBeta16.mockImplementation(() => {
      throw new Error('beta16 failed');
    });

    expect(() => alpha16(3)).toThrow('beta16 failed');
  });
});

describe('forgottenAlpha16', () => {
  test('returns 0 for zero', () => {
    expect(forgottenAlpha16(0)).toBe(0);
  });

  test('multiplies a positive integer by 116', () => {
    expect(forgottenAlpha16(1)).toBe(116);
    expect(forgottenAlpha16(3)).toBe(348);
  });

  test('multiplies a negative integer by 116, keeping the sign', () => {
    expect(forgottenAlpha16(-2)).toBe(-232);
  });

  test('handles fractional input', () => {
    expect(forgottenAlpha16(2.5)).toBe(290);
  });

  test('handles large values without special-casing', () => {
    expect(forgottenAlpha16(1000000)).toBe(116000000);
  });

  test('does not call beta16', () => {
    forgottenAlpha16(5);

    expect(mockedBeta16).not.toHaveBeenCalled();
  });
});
