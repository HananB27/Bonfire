/**
 * alpha15.test.ts — deterministic tests for the alpha15 / forgottenAlpha15 helpers.
 *
 * alpha15 delegates to beta15 for positive input, so beta15 is mocked here. That keeps
 * these tests focused on alpha15's own rules (the <= 0 guard and the value - 1 step) and
 * ensures no real module behavior leaks into the assertions.
 */

import { alpha15, forgottenAlpha15 } from '../src/gardenerDemoChaos/alpha15';
import { beta15 } from '../src/gardenerDemoChaos/beta15';

// Replace beta15 with a jest mock so every test controls its return value.
jest.mock('../src/gardenerDemoChaos/beta15', () => ({
  beta15: jest.fn(),
}));

const mockedBeta15 = beta15 as jest.MockedFunction<typeof beta15>;

beforeEach(() => {
  // Reset call history and return values so each test starts from a clean slate.
  mockedBeta15.mockReset();
  mockedBeta15.mockReturnValue(42 as unknown as ReturnType<typeof beta15>);
});

describe('alpha15', () => {
  test('returns 0 for zero without calling beta15', () => {
    expect(alpha15(0)).toBe(0);
    expect(mockedBeta15).not.toHaveBeenCalled();
  });

  test('returns 0 for negative values without calling beta15', () => {
    expect(alpha15(-1)).toBe(0);
    expect(alpha15(-100)).toBe(0);
    expect(mockedBeta15).not.toHaveBeenCalled();
  });

  test('passes value - 1 to beta15 for positive input', () => {
    alpha15(5);
    expect(mockedBeta15).toHaveBeenCalledTimes(1);
    expect(mockedBeta15).toHaveBeenCalledWith(4);
  });

  test('passes 0 to beta15 when value is 1 (smallest positive edge)', () => {
    alpha15(1);
    expect(mockedBeta15).toHaveBeenCalledWith(0);
  });

  test('returns exactly what beta15 returns for positive input', () => {
    mockedBeta15.mockReturnValue(' from beta ' as unknown as ReturnType<typeof beta15>);
    expect(alpha15(3)).toBe(' from beta ');
  });

  test('handles fractional positive input by subtracting 1', () => {
    alpha15(2.5);
    expect(mockedBeta15).toHaveBeenCalledWith(1.5);
  });

  test('does not call beta15 more than once per invocation', () => {
    alpha15(10);
    expect(mockedBeta15).toHaveBeenCalledTimes(1);
  });
});

describe('forgottenAlpha15', () => {
  test('multiplies the input by 115', () => {
    expect(forgottenAlpha15(1)).toBe(115);
    expect(forgottenAlpha15(3)).toBe(345);
  });

  test('returns 0 for zero input', () => {
    expect(forgottenAlpha15(0)).toBe(0);
  });

  test('keeps the sign for negative input', () => {
    expect(forgottenAlpha15(-2)).toBe(-230);
  });

  test('handles fractional input', () => {
    expect(forgottenAlpha15(2.5)).toBe(287.5);
  });

  test('does not call beta15', () => {
    forgottenAlpha15(7);
    expect(mockedBeta15).not.toHaveBeenCalled();
  });
});
