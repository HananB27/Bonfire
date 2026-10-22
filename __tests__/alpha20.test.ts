/**
 * alpha20.test.ts — unit tests for the alpha20 and forgottenAlpha20 helpers.
 *
 * alpha20 delegates to beta20 for positive inputs and short-circuits to 0 otherwise.
 * forgottenAlpha20 is a pure multiplication by 120 and never touches beta20.
 * beta20 is mocked so these tests stay deterministic and independent of its internals.
 */

import { alpha20, forgottenAlpha20 } from '../src/gardenerDemoChaos/alpha20';
import { beta20 } from '../src/gardenerDemoChaos/beta20';

// Replace the real beta20 with a jest mock so each test controls its return value
// and we can assert exactly what alpha20 passed to it.
jest.mock('../src/gardenerDemoChaos/beta20', () => ({
  beta20: jest.fn(),
}));

const mockBeta20 = beta20 as jest.MockedFunction<typeof beta20>;

describe('alpha20', () => {
  // Reset call history and return values so no test leaks state into the next.
  beforeEach(() => {
    mockBeta20.mockReset();
  });

  test('returns 0 for zero without calling beta20', () => {
    expect(alpha20(0)).toBe(0);
    expect(mockBeta20).not.toHaveBeenCalled();
  });

  test('returns 0 for negative values without calling beta20', () => {
    expect(alpha20(-1)).toBe(0);
    expect(alpha20(-100)).toBe(0);
    expect(mockBeta20).not.toHaveBeenCalled();
  });

  test('passes value - 1 to beta20 for a positive input', () => {
    mockBeta20.mockReturnValue(7);

    alpha20(1);

    // Input 1 should be shifted down by one before reaching beta20, so beta20 gets 0.
    expect(mockBeta20).toHaveBeenCalledTimes(1);
    expect(mockBeta20).toHaveBeenCalledWith(0);
  });

  test('returns exactly the value beta20 produces', () => {
    mockBeta20.mockReturnValue(42);

    expect(alpha20(5)).toBe(42);
    expect(mockBeta20).toHaveBeenCalledWith(4);
  });

  test('forwards fractional inputs shifted by one', () => {
    mockBeta20.mockReturnValue(0);

    alpha20(2.5);

    expect(mockBeta20).toHaveBeenCalledWith(1.5);
  });

  test('propagates errors thrown by beta20', () => {
    mockBeta20.mockImplementation(() => {
      throw new Error('beta20 failed');
    });

    expect(() => alpha20(3)).toThrow('beta20 failed');
  });
});

describe('forgottenAlpha20', () => {
  beforeEach(() => {
    mockBeta20.mockReset();
  });

  test('returns 0 for zero', () => {
    expect(forgottenAlpha20(0)).toBe(0);
  });

  test('multiplies a positive value by 120', () => {
    expect(forgottenAlpha20(1)).toBe(120);
    expect(forgottenAlpha20(5)).toBe(600);
  });

  test('multiplies a negative value by 120 without clamping', () => {
    expect(forgottenAlpha20(-2)).toBe(-240);
  });

  test('handles fractional values', () => {
    expect(forgottenAlpha20(0.5)).toBe(60);
  });

  test('does not call beta20', () => {
    forgottenAlpha20(3);

    expect(mockBeta20).not.toHaveBeenCalled();
  });
});
