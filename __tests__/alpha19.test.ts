/**
 * alpha19.test.ts — unit tests for the alpha19 and forgottenAlpha19 helpers.
 *
 * alpha19 delegates to beta19 for positive inputs, so beta19 is mocked here.
 * That keeps these tests deterministic and independent of beta19's own logic,
 * which is covered by its own test file.
 */

import { alpha19, forgottenAlpha19 } from '../src/gardenerDemoChaos/alpha19';
import { beta19 } from '../src/gardenerDemoChaos/beta19';

// Replace beta19 with a jest mock so each test controls its return value
// and we can check exactly how alpha19 calls it.
jest.mock('../src/gardenerDemoChaos/beta19', () => ({
  beta19: jest.fn(),
}));

// Cast the imported function to a Jest mock so we can use mock helpers.
const mockBeta19 = beta19 as jest.Mock;

beforeEach(() => {
  // Reset call history and return values so tests do not leak state into each other.
  mockBeta19.mockReset();
});

describe('alpha19', () => {
  test('returns 0 for zero without calling beta19', () => {
    // A zero input hits the guard clause, so the delegate must not run.
    expect(alpha19(0)).toBe(0);
    expect(mockBeta19).not.toHaveBeenCalled();
  });

  test('returns 0 for negative input without calling beta19', () => {
    // Negative values are clamped to the floor value of 0.
    expect(alpha19(-1)).toBe(0);
    expect(alpha19(-100)).toBe(0);
    expect(mockBeta19).not.toHaveBeenCalled();
  });

  test('calls beta19 with value minus one for positive input', () => {
    mockBeta19.mockReturnValue(42);

    // The function steps down by one before delegating.
    alpha19(5);

    expect(mockBeta19).toHaveBeenCalledTimes(1);
    expect(mockBeta19).toHaveBeenCalledWith(4);
  });

  test('returns exactly what beta19 returns for positive input', () => {
    mockBeta19.mockReturnValue('delegated-result');

    expect(alpha19(1)).toBe('delegated-result');
    expect(mockBeta19).toHaveBeenCalledWith(0);
  });

  test('passes zero to beta19 when value is one (boundary of the positive branch)', () => {
    mockBeta19.mockReturnValue(7);

    expect(alpha19(1)).toBe(7);
    expect(mockBeta19).toHaveBeenCalledWith(0);
  });

  test('passes fractional positive input through as value minus one', () => {
    mockBeta19.mockReturnValue(0);

    alpha19(0.5);

    // 0.5 is positive, so the delegate runs with 0.5 - 0.5 = 0 (floating-point safe here).
    expect(mockBeta19).toHaveBeenCalledWith(-0.5);
  });
});

describe('forgottenAlpha19', () => {
  test('multiplies the input by 119', () => {
    expect(forgottenAlpha19(1)).toBe(119);
    expect(forgottenAlpha19(2)).toBe(238);
    expect(forgottenAlpha19(10)).toBe(1190);
  });

  test('returns 0 for zero input', () => {
    expect(forgottenAlpha19(0)).toBe(0);
  });

  test('handles negative input by keeping the sign', () => {
    expect(forgottenAlpha19(-1)).toBe(-119);
    expect(forgottenAlpha19(-3)).toBe(-357);
  });

  test('handles fractional input', () => {
    expect(forgottenAlpha19(0.5)).toBe(59.5);
  });

  test('does not call beta19', () => {
    // This helper is independent of the delegate, so beta19 must stay untouched.
    forgottenAlpha19(5);

    expect(mockBeta19).not.toHaveBeenCalled();
  });
});
