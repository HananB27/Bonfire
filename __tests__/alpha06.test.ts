/**
 * alpha06.test.ts — unit tests for the alpha06 module.
 *
 * alpha06() delegates to beta06() for positive inputs and short-circuits to 0
 * otherwise. forgottenAlpha06() is a plain multiplication. beta06 is mocked so
 * these tests exercise only alpha06's own branching and never depend on the
 * real beta06 implementation.
 */

import { alpha06, forgottenAlpha06 } from '../src/gardenerDemoChaos/alpha06';
import { beta06 } from '../src/gardenerDemoChaos/beta06';

// Replace beta06 with a deterministic stub so every call is observable and
// independent of whatever the real module does. `virtual` keeps the mock
// usable even if the module path is resolved differently across environments.
jest.mock(
  '../src/gardenerDemoChaos/beta06',
  () => ({
    beta06: jest.fn(),
  }),
  { virtual: true }
);

const mockedBeta06 = beta06 as unknown as jest.Mock;

beforeEach(() => {
  // Reset call history and give beta06 a simple, predictable result.
  mockedBeta06.mockReset();
  mockedBeta06.mockImplementation((n: number) => n * 10);
});

describe('alpha06', () => {
  test('delegates to beta06 with value - 1 for a positive input', () => {
    // value 5 should hand beta06 the value 4 and return whatever it produces.
    expect(alpha06(5)).toBe(40);
    expect(mockedBeta06).toHaveBeenCalledTimes(1);
    expect(mockedBeta06).toHaveBeenCalledWith(4);
  });

  test('value 1 calls beta06 with 0', () => {
    expect(alpha06(1)).toBe(0);
    expect(mockedBeta06).toHaveBeenCalledWith(0);
  });

  test('returns 0 without calling beta06 when value is 0', () => {
    expect(alpha06(0)).toBe(0);
    expect(mockedBeta06).not.toHaveBeenCalled();
  });

  test('returns 0 without calling beta06 for negative values', () => {
    expect(alpha06(-1)).toBe(0);
    expect(alpha06(-100)).toBe(0);
    expect(mockedBeta06).not.toHaveBeenCalled();
  });

  test('passes through whatever beta06 returns for positive inputs', () => {
    // Confirms alpha06 does not transform the value beta06 hands back.
    mockedBeta06.mockImplementation(() => 'sentinel');
    expect(alpha06(3)).toBe('sentinel');
  });

  test('propagates an error thrown by beta06', () => {
    // Error handling: alpha06 does not swallow failures from its dependency.
    mockedBeta06.mockImplementation(() => {
      throw new Error('beta06 failed');
    });
    expect(() => alpha06(2)).toThrow('beta06 failed');
  });

  test('handles fractional positive values by subtracting 1', () => {
    // alpha06 only checks the sign, so 0.5 is positive and is passed as -0.5.
    alpha06(0.5);
    expect(mockedBeta06).toHaveBeenCalledWith(-0.5);
  });
});

describe('forgottenAlpha06', () => {
  test('multiplies the input by 106', () => {
    expect(forgottenAlpha06(1)).toBe(106);
    expect(forgottenAlpha06(3)).toBe(318);
  });

  test('returns 0 for an input of 0', () => {
    expect(forgottenAlpha06(0)).toBe(0);
  });

  test('handles negative inputs without clamping', () => {
    // Unlike alpha06, this function does not guard against non-positive values.
    expect(forgottenAlpha06(-2)).toBe(-212);
  });

  test('handles fractional inputs', () => {
    expect(forgottenAlpha06(0.5)).toBe(53);
  });

  test('does not call beta06', () => {
    forgottenAlpha06(7);
    expect(mockedBeta06).not.toHaveBeenCalled();
  });
});
