/**
 * alpha01.test.ts — unit tests for the alpha01 module.
 *
 * alpha01 delegates to beta01 for positive inputs. beta01's real implementation
 * is not part of this test's scope, so we replace it with a Jest mock. That keeps
 * these tests deterministic and isolated: they check only how alpha01 decides
 * whether to call beta01, what it passes in, and what it returns.
 *
 * forgottenAlpha01 is pure arithmetic, so it needs no mocks.
 */

import { alpha01, forgottenAlpha01 } from '../src/gardenerDemoChaos/alpha01';
import { beta01 } from '../src/gardenerDemoChaos/beta01';

// Replace beta01 with a mock so no real logic runs. Every test starts with a
// fresh mock, so call counts from one test never leak into the next.
jest.mock('../src/gardenerDemoChaos/beta01', () => ({
  beta01: jest.fn(),
}));

// Typed handle to the mock. The cast is needed because the imported symbol is
// typed as the real function, not as a Jest mock.
const mockedBeta01 = beta01 as jest.MockedFunction<typeof beta01>;

beforeEach(() => {
  mockedBeta01.mockReset();
});

describe('alpha01', () => {
  // Main success path: positive inputs are handed to beta01 with the value reduced by one.
  test('calls beta01 with value - 1 for a positive input', () => {
    mockedBeta01.mockReturnValue(0);

    alpha01(5);

    expect(mockedBeta01).toHaveBeenCalledTimes(1);
    expect(mockedBeta01).toHaveBeenCalledWith(4);
  });

  test('returns whatever beta01 returns for a positive input', () => {
    mockedBeta01.mockReturnValue(42);

    expect(alpha01(10)).toBe(42);
  });

  test('passes 0 to beta01 when the input is 1 (smallest positive edge)', () => {
    mockedBeta01.mockReturnValue(7);

    expect(alpha01(1)).toBe(7);
    expect(mockedBeta01).toHaveBeenCalledWith(0);
  });

  test('passes fractional values through as value - 1', () => {
    mockedBeta01.mockReturnValue(1);

    alpha01(2.5);

    expect(mockedBeta01).toHaveBeenCalledWith(1.5);
  });

  // Boundary: zero is the guard value, so the function short-circuits to 0.
  test('returns 0 for an input of exactly 0 without calling beta01', () => {
    expect(alpha01(0)).toBe(0);
    expect(mockedBeta01).not.toHaveBeenCalled();
  });

  // Edge: negative inputs also take the short-circuit path.
  test.each([-1, -50, -0.5])(
    'returns 0 without calling beta01 for negative input %p',
    (input) => {
      expect(alpha01(input)).toBe(0);
      expect(mockedBeta01).not.toHaveBeenCalled();
    },
  );

  // Error handling: an exception from beta01 should propagate, not be swallowed.
  test('propagates an error thrown by beta01', () => {
    mockedBeta01.mockImplementation(() => {
      throw new Error('beta01 failed');
    });

    expect(() => alpha01(3)).toThrow('beta01 failed');
  });
});

describe('forgottenAlpha01', () => {
  // Main success path: the result is the input multiplied by 101.
  test('multiplies a positive input by 101', () => {
    expect(forgottenAlpha01(1)).toBe(101);
    expect(forgottenAlpha01(3)).toBe(303);
  });

  test('returns 0 for an input of 0', () => {
    expect(forgottenAlpha01(0)).toBe(0);
  });

  // Edge: negative inputs keep their sign because the multiplier is positive.
  test('multiplies a negative input by 101, keeping the sign', () => {
    expect(forgottenAlpha01(-2)).toBe(-202);
  });

  // Edge: non-finite inputs follow ordinary JavaScript number rules.
  test('returns NaN for a NaN input', () => {
    expect(forgottenAlpha01(Number.NaN)).toBeNaN();
  });

  test('returns Infinity for an Infinity input', () => {
    expect(forgottenAlpha01(Number.POSITIVE_INFINITY)).toBe(
      Number.POSITIVE_INFINITY,
    );
  });

  // It does not delegate to beta01, so the mock must stay untouched.
  test('does not call beta01', () => {
    forgottenAlpha01(9);

    expect(mockedBeta01).not.toHaveBeenCalled();
  });
});
