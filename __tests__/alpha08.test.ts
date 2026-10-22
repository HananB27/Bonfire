/**
 * alpha08.test.ts — unit tests for the alpha08 module.
 *
 * alpha08(value) returns 0 for non-positive input and otherwise delegates to
 * beta08(value - 1). forgottenAlpha08(value) multiplies the input by 108.
 * beta08 is replaced with a jest mock so these tests stay deterministic and
 * only exercise the logic in alpha08 itself.
 */

import { alpha08, forgottenAlpha08 } from '../src/gardenerDemoChaos/alpha08';
import { beta08 } from '../src/gardenerDemoChaos/beta08';

// Swap the real beta08 for a jest mock so no real logic (or I/O) runs here.
jest.mock('../src/gardenerDemoChaos/beta08', () => ({
  beta08: jest.fn(),
}));

// Cast the imported function to a mock type so we can set return values and
// inspect calls without fighting the type checker.
const mockBeta08 = beta08 as jest.MockedFunction<typeof beta08>;

beforeEach(() => {
  // Reset call history and return values so each test starts from a clean slate.
  mockBeta08.mockReset();
});

describe('alpha08', () => {
  test('returns 0 for zero without calling beta08', () => {
    const result = alpha08(0);

    expect(result).toBe(0);
    expect(mockBeta08).not.toHaveBeenCalled();
  });

  test('returns 0 for negative input without calling beta08', () => {
    expect(alpha08(-1)).toBe(0);
    expect(alpha08(-100)).toBe(0);
    expect(mockBeta08).not.toHaveBeenCalled();
  });

  test('delegates to beta08 with value - 1 for positive input', () => {
    mockBeta08.mockReturnValue(42);

    const result = alpha08(5);

    // The mock's return value should pass straight through.
    expect(result).toBe(42);
    expect(mockBeta08).toHaveBeenCalledTimes(1);
    expect(mockBeta08).toHaveBeenCalledWith(4);
  });

  test('passes 0 to beta08 when value is 1 (smallest positive input)', () => {
    mockBeta08.mockReturnValue(7);

    expect(alpha08(1)).toBe(7);
    expect(mockBeta08).toHaveBeenCalledWith(0);
  });

  test('handles fractional positive input by subtracting 1 before delegating', () => {
    mockBeta08.mockReturnValue(3);

    expect(alpha08(0.5)).toBe(3);
    // 0.5 - 1 = -0.5, which is passed through unchanged to beta08.
    expect(mockBeta08).toHaveBeenCalledWith(-0.5);
  });

  test('propagates errors thrown by beta08', () => {
    mockBeta08.mockImplementation(() => {
      throw new Error('beta08 failed');
    });

    expect(() => alpha08(3)).toThrow('beta08 failed');
  });
});

describe('forgottenAlpha08', () => {
  test('multiplies a positive value by 108', () => {
    expect(forgottenAlpha08(1)).toBe(108);
    expect(forgottenAlpha08(5)).toBe(540);
  });

  test('returns 0 for zero input', () => {
    expect(forgottenAlpha08(0)).toBe(0);
  });

  test('returns a negative result for negative input', () => {
    expect(forgottenAlpha08(-2)).toBe(-216);
  });

  test('handles fractional input', () => {
    expect(forgottenAlpha08(0.5)).toBe(54);
  });

  test('does not call beta08', () => {
    forgottenAlpha08(10);

    expect(mockBeta08).not.toHaveBeenCalled();
  });
});
