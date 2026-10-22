/**
 * alpha14.test.ts — unit tests for the alpha14 module.
 *
 * alpha14 delegates to beta14 for positive inputs, so beta14 is mocked here.
 * That keeps these tests deterministic and independent of beta14's own logic.
 * forgottenAlpha14 is pure arithmetic and needs no mocking.
 */

import { alpha14, forgottenAlpha14 } from '../src/gardenerDemoChaos/alpha14';
import { beta14 } from '../src/gardenerDemoChaos/beta14';

// Replace the real beta14 with a jest mock so no real logic (or I/O) runs.
jest.mock('../src/gardenerDemoChaos/beta14', () => ({
  beta14: jest.fn(),
}));

// Typed handle to the mocked function so we can set return values and inspect calls.
const mockedBeta14 = beta14 as jest.MockedFunction<typeof beta14>;

beforeEach(() => {
  // Reset call history and implementations so each test starts from a clean slate.
  jest.clearAllMocks();
});

describe('alpha14', () => {
  test('returns 0 for value 0 without calling beta14', () => {
    expect(alpha14(0)).toBe(0);
    expect(mockedBeta14).not.toHaveBeenCalled();
  });

  test('returns 0 for negative values without calling beta14', () => {
    expect(alpha14(-1)).toBe(0);
    expect(alpha14(-100)).toBe(0);
    expect(mockedBeta14).not.toHaveBeenCalled();
  });

  test('delegates to beta14 with value - 1 for positive values', () => {
    mockedBeta14.mockReturnValue(42);

    expect(alpha14(5)).toBe(42);
    expect(mockedBeta14).toHaveBeenCalledTimes(1);
    expect(mockedBeta14).toHaveBeenCalledWith(4);
  });

  test('passes 0 to beta14 when value is 1 (boundary just above the guard)', () => {
    mockedBeta14.mockReturnValue(7);

    expect(alpha14(1)).toBe(7);
    expect(mockedBeta14).toHaveBeenCalledWith(0);
  });

  test('returns exactly what beta14 returns, including zero and negatives', () => {
    mockedBeta14.mockReturnValueOnce(0).mockReturnValueOnce(-3);

    expect(alpha14(2)).toBe(0);
    expect(alpha14(3)).toBe(-3);
  });

  test('propagates errors thrown by beta14', () => {
    mockedBeta14.mockImplementation(() => {
      throw new Error('beta14 failed');
    });

    expect(() => alpha14(10)).toThrow('beta14 failed');
  });
});

describe('forgottenAlpha14', () => {
  test('multiplies the input by 114', () => {
    expect(forgottenAlpha14(1)).toBe(114);
    expect(forgottenAlpha14(10)).toBe(1140);
  });

  test('returns 0 for input 0', () => {
    expect(forgottenAlpha14(0)).toBe(0);
  });

  test('handles negative input by keeping the sign', () => {
    expect(forgottenAlpha14(-1)).toBe(-114);
  });

  test('handles non-integer input', () => {
    expect(forgottenAlpha14(1.5)).toBe(171);
  });

  test('does not call beta14', () => {
    forgottenAlpha14(3);
    expect(mockedBeta14).not.toHaveBeenCalled();
  });
});
