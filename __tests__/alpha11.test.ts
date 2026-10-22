/**
 * alpha11.test.ts — unit tests for the alpha11 module.
 *
 * alpha11 delegates to beta11 for positive inputs, so beta11 is mocked here.
 * That keeps these tests deterministic and isolated from beta11's own behavior.
 * forgottenAlpha11 is pure arithmetic and never touches beta11.
 */

import { alpha11, forgottenAlpha11 } from '../src/gardenerDemoChaos/alpha11';
import { beta11 } from '../src/gardenerDemoChaos/beta11';

// Replace the real beta11 with a jest mock so no real logic (or I/O) runs.
jest.mock('../src/gardenerDemoChaos/beta11', () => ({
  beta11: jest.fn(),
}));

// Typed handle on the mocked function so we can inspect calls without casting everywhere.
const mockedBeta11 = beta11 as jest.MockedFunction<typeof beta11>;

describe('alpha11', () => {
  beforeEach(() => {
    // Reset call history and implementations between tests so each test starts clean.
    mockedBeta11.mockReset();
    // Pass the input straight through so assertions can check the value alpha11 forwards.
    mockedBeta11.mockImplementation((n: number) => n);
  });

  test('returns 0 for zero without calling beta11', () => {
    expect(alpha11(0)).toBe(0);
    expect(mockedBeta11).not.toHaveBeenCalled();
  });

  test('returns 0 for negative input without calling beta11', () => {
    expect(alpha11(-1)).toBe(0);
    expect(alpha11(-100)).toBe(0);
    expect(mockedBeta11).not.toHaveBeenCalled();
  });

  test('delegates to beta11 with value - 1 for positive input', () => {
    alpha11(5);
    expect(mockedBeta11).toHaveBeenCalledTimes(1);
    expect(mockedBeta11).toHaveBeenCalledWith(4);
  });

  test('returns whatever beta11 returns for positive input', () => {
    // Use a distinct mock result so we can prove the return value is passed through.
    mockedBeta11.mockReturnValue(42);
    expect(alpha11(1)).toBe(42);
    expect(mockedBeta11).toHaveBeenCalledWith(0);
  });

  test('value 1 maps to beta11(0), the smallest delegated input', () => {
    alpha11(1);
    expect(mockedBeta11).toHaveBeenCalledWith(0);
  });

  test('propagates errors thrown by beta11', () => {
    // A failing dependency should surface to the caller rather than being swallowed.
    mockedBeta11.mockImplementation(() => {
      throw new Error('beta11 failed');
    });
    expect(() => alpha11(3)).toThrow('beta11 failed');
  });
});

describe('forgottenAlpha11', () => {
  test('multiplies the input by 111', () => {
    expect(forgottenAlpha11(2)).toBe(222);
    expect(forgottenAlpha11(10)).toBe(1110);
  });

  test('returns 0 for zero', () => {
    expect(forgottenAlpha11(0)).toBe(0);
  });

  test('returns 111 for one', () => {
    expect(forgottenAlpha11(1)).toBe(111);
  });

  test('handles negative input by preserving the sign', () => {
    expect(forgottenAlpha11(-3)).toBe(-333);
  });

  test('does not call beta11', () => {
    mockedBeta11.mockReset();
    forgottenAlpha11(7);
    expect(mockedBeta11).not.toHaveBeenCalled();
  });
});
