/**
 * alpha02.test.ts — unit tests for the gardenerDemoChaos alpha02 module.
 *
 * alpha02 delegates to beta02 for positive inputs, so beta02 is mocked here.
 * That keeps these tests focused on alpha02's own branching (the <= 0 guard
 * and the value - 1 hand-off) and makes every run deterministic.
 * forgottenAlpha02 is pure arithmetic and is tested directly.
 */

import { alpha02, forgottenAlpha02 } from '../src/gardenerDemoChaos/alpha02';
import { beta02 } from '../src/gardenerDemoChaos/beta02';

// Replace beta02 with a jest mock so no real logic (or I/O) runs during these tests.
jest.mock('../src/gardenerDemoChaos/beta02', () => ({
  beta02: jest.fn(),
}));

// Typed handle to the mock so we can configure return values and inspect calls.
const mockedBeta02 = beta02 as jest.MockedFunction<typeof beta02>;

beforeEach(() => {
  // Reset call history and implementations so each test starts from a clean slate.
  mockedBeta02.mockReset();
});

describe('alpha02', () => {
  test('returns 0 without calling beta02 when value is 0', () => {
    expect(alpha02(0)).toBe(0);
    expect(mockedBeta02).not.toHaveBeenCalled();
  });

  test('returns 0 without calling beta02 for negative values', () => {
    expect(alpha02(-1)).toBe(0);
    expect(alpha02(-100)).toBe(0);
    expect(mockedBeta02).not.toHaveBeenCalled();
  });

  test('calls beta02 with value - 1 when value is positive', () => {
    mockedBeta02.mockReturnValue(7 as ReturnType<typeof beta02>);

    alpha02(5);

    expect(mockedBeta02).toHaveBeenCalledTimes(1);
    expect(mockedBeta02).toHaveBeenCalledWith(4);
  });

  test('passes 0 to beta02 when value is 1 (boundary just above the guard)', () => {
    mockedBeta02.mockReturnValue(0 as ReturnType<typeof beta02>);

    expect(alpha02(1)).toBe(0);
    expect(mockedBeta02).toHaveBeenCalledWith(0);
  });

  test('returns exactly what beta02 returns for positive values', () => {
    mockedBeta02.mockReturnValue(42 as ReturnType<typeof beta02>);

    expect(alpha02(10)).toBe(42);
  });

  test('propagates errors thrown by beta02', () => {
    mockedBeta02.mockImplementation(() => {
      throw new Error('beta02 failed');
    });

    expect(() => alpha02(3)).toThrow('beta02 failed');
  });
});

describe('forgottenAlpha02', () => {
  test('returns 0 for input 0', () => {
    expect(forgottenAlpha02(0)).toBe(0);
  });

  test('multiplies positive input by 102', () => {
    expect(forgottenAlpha02(1)).toBe(102);
    expect(forgottenAlpha02(10)).toBe(1020);
  });

  test('multiplies negative input by 102 without clamping', () => {
    expect(forgottenAlpha02(-2)).toBe(-204);
  });

  test('does not call beta02', () => {
    forgottenAlpha02(5);

    expect(mockedBeta02).not.toHaveBeenCalled();
  });
});
