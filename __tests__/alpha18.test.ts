/**
 * alpha18.test.ts — deterministic tests for the alpha18 and forgottenAlpha18 helpers.
 *
 * alpha18 delegates to beta18 for positive inputs, so beta18 is mocked here.
 * That keeps these tests focused on alpha18's own branching: the clamp at zero,
 * the decrement before delegation, and the pass-through of the result.
 * forgottenAlpha18 is pure arithmetic and needs no mocks.
 */

import { alpha18, forgottenAlpha18 } from '../src/gardenerDemoChaos/alpha18';
import { beta18 } from '../src/gardenerDemoChaos/beta18';

// Replace the real beta18 with a predictable stub so no real logic runs.
// The stub doubles its input, which makes the pass-through easy to verify.
jest.mock('../src/gardenerDemoChaos/beta18', () => ({
  beta18: jest.fn((x: number) => x * 2),
}));

const mockedBeta18 = beta18 as jest.MockedFunction<typeof beta18>;

beforeEach(() => {
  // Reset call history so each test only sees its own calls to the stub.
  mockedBeta18.mockClear();
});

describe('alpha18', () => {
  test('returns 0 for zero without calling beta18', () => {
    expect(alpha18(0)).toBe(0);
    expect(mockedBeta18).not.toHaveBeenCalled();
  });

  test('returns 0 for negative input without calling beta18', () => {
    expect(alpha18(-1)).toBe(0);
    expect(alpha18(-100)).toBe(0);
    expect(mockedBeta18).not.toHaveBeenCalled();
  });

  test('delegates to beta18 with value minus one for positive input', () => {
    alpha18(5);
    expect(mockedBeta18).toHaveBeenCalledTimes(1);
    expect(mockedBeta18).toHaveBeenCalledWith(4);
  });

  test('returns exactly what beta18 returns', () => {
    // With the stub doubling its input: alpha18(5) -> beta18(4) -> 8.
    expect(alpha18(5)).toBe(8);
  });

  test('passes 0 to beta18 when value is 1', () => {
    // The boundary: the smallest positive input becomes the smallest delegated input.
    expect(alpha18(1)).toBe(0); // stub returns 0 * 2
    expect(mockedBeta18).toHaveBeenCalledWith(0);
  });

  test('handles non-integer positive input by subtracting one', () => {
    expect(alpha18(2.5)).toBe(3); // beta18(1.5) -> 3
    expect(mockedBeta18).toHaveBeenCalledWith(1.5);
  });

  test('propagates an error thrown by beta18', () => {
    mockedBeta18.mockImplementationOnce(() => {
      throw new Error('beta18 failed');
    });
    expect(() => alpha18(3)).toThrow('beta18 failed');
  });
});

describe('forgottenAlpha18', () => {
  test('multiplies the input by 118', () => {
    expect(forgottenAlpha18(1)).toBe(118);
    expect(forgottenAlpha18(2)).toBe(236);
  });

  test('returns 0 for zero input', () => {
    expect(forgottenAlpha18(0)).toBe(0);
  });

  test('returns a negative result for negative input', () => {
    expect(forgottenAlpha18(-3)).toBe(-354);
  });

  test('does not call beta18', () => {
    forgottenAlpha18(10);
    expect(mockedBeta18).not.toHaveBeenCalled();
  });

  test('handles non-integer input', () => {
    expect(forgottenAlpha18(0.5)).toBe(59);
  });
});
