/**
 * alpha17.test.ts — unit tests for the alpha17 and forgottenAlpha17 functions.
 *
 * alpha17 clamps non-positive input to 0 and otherwise delegates to beta17 with
 * value - 1. beta17 is replaced with a Jest mock so these tests never depend on
 * its real behavior, keeping them deterministic and free of side effects.
 * forgottenAlpha17 is a pure multiplication and needs no mocks.
 */

import { alpha17, forgottenAlpha17 } from '../src/gardenerDemoChaos/alpha17';
import { beta17 } from '../src/gardenerDemoChaos/beta17';

// Replace beta17 with a mock so each test controls exactly what it returns.
// `virtual: true` lets the mock resolve even if the module file is absent.
jest.mock('../src/gardenerDemoChaos/beta17', () => ({ beta17: jest.fn() }), {
  virtual: true,
});

// Typed handle to the mocked beta17 so we can set return values and inspect calls.
const mockBeta17 = beta17 as jest.MockedFunction<typeof beta17>;

beforeEach(() => {
  // Clear call history and return values so tests do not leak state into each other.
  jest.clearAllMocks();
});

describe('alpha17', () => {
  test('returns 0 for zero without calling beta17', () => {
    expect(alpha17(0)).toBe(0);
    expect(mockBeta17).not.toHaveBeenCalled();
  });

  test('returns 0 for a negative value without calling beta17', () => {
    expect(alpha17(-1)).toBe(0);
    expect(mockBeta17).not.toHaveBeenCalled();
  });

  test('returns 0 for a large negative value without calling beta17', () => {
    expect(alpha17(-1_000_000)).toBe(0);
    expect(mockBeta17).not.toHaveBeenCalled();
  });

  test('delegates to beta17 with value - 1 for a positive value', () => {
    mockBeta17.mockReturnValue(42);

    expect(alpha17(5)).toBe(42);
    expect(mockBeta17).toHaveBeenCalledTimes(1);
    expect(mockBeta17).toHaveBeenCalledWith(4);
  });

  test('passes 0 to beta17 when the input is 1', () => {
    mockBeta17.mockReturnValue(7);

    expect(alpha17(1)).toBe(7);
    expect(mockBeta17).toHaveBeenCalledWith(0);
  });

  test('returns whatever beta17 returns, unchanged', () => {
    mockBeta17.mockReturnValue(-3);

    expect(alpha17(2)).toBe(-3);
  });

  test('propagates errors thrown by beta17', () => {
    mockBeta17.mockImplementation(() => {
      throw new Error('beta17 failed');
    });

    expect(() => alpha17(3)).toThrow('beta17 failed');
  });
});

describe('forgottenAlpha17', () => {
  test('returns 0 for zero', () => {
    expect(forgottenAlpha17(0)).toBe(0);
  });

  test('multiplies a positive integer by 117', () => {
    expect(forgottenAlpha17(1)).toBe(117);
    expect(forgottenAlpha17(2)).toBe(234);
  });

  test('multiplies a negative value by 117 without clamping', () => {
    expect(forgottenAlpha17(-1)).toBe(-117);
  });

  test('handles fractional input', () => {
    expect(forgottenAlpha17(2.5)).toBeCloseTo(292.5);
  });

  test('does not call beta17', () => {
    forgottenAlpha17(10);

    expect(mockBeta17).not.toHaveBeenCalled();
  });
});
