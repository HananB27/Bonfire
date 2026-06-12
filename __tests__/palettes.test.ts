/**
 * palettes.test.ts — unit tests for the gradient→palette sampler and the dim
 * "embered" (locked) variant added for the achievement-flame catalog.
 *
 * These are pure color functions, so they can be checked exactly. The two things
 * that must hold: (1) sampling preserves hot→core / cool→red orientation, and
 * (2) the embered variant is always visibly different from the full palette
 * (this guards the naming collision between the *ember* flame and the *embered*
 * locked state — see contracts/flame-catalog.md).
 */

import {
  paletteFromGradient,
  emberedPalette,
  EMBERED_DIM,
  type Palette,
} from '../src/theme/palettes';

const HEX = /^#[0-9a-f]{6}$/;

// The Amber gradient as authored in spec Appendix A (hottest → coolest).
const AMBER_GRADIENT = ['#fff4cf', '#ffd27a', '#ffae3b', '#ff7a18', '#b3380f'];

function eachStop(p: Palette): string[] {
  return [p.red, p.ember, p.amber, p.gold, p.core];
}

describe('paletteFromGradient', () => {
  test('maps the hot end to core and the cool end to red', () => {
    const p = paletteFromGradient(AMBER_GRADIENT);
    // First stop (hottest) lands in `core`; last stop (coolest) lands in `red`.
    expect(p.core).toBe('#fff4cf');
    expect(p.red).toBe('#b3380f');
    // The three even in-between samples line up with the middle stops.
    expect(p.gold).toBe('#ffd27a');
    expect(p.amber).toBe('#ffae3b');
    expect(p.ember).toBe('#ff7a18');
  });

  test('produces valid hex for every stop, even for a short gradient', () => {
    const p = paletteFromGradient(['#FFF6B0', '#FFC400', '#E36A00']); // 3-stop Sodium
    eachStop(p).forEach(stop => expect(stop).toMatch(HEX));
    // Endpoints still pin to the gradient ends.
    expect(p.core).toBe('#fff6b0');
    expect(p.red).toBe('#e36a00');
  });

  test('a single-stop gradient yields that color on every stop', () => {
    const p = paletteFromGradient(['#123456']);
    eachStop(p).forEach(stop => expect(stop).toBe('#123456'));
  });
});

describe('emberedPalette', () => {
  const full = paletteFromGradient(AMBER_GRADIENT);
  const embered = emberedPalette(full);

  test('every stop differs from the full palette (embered !== palette)', () => {
    const a = eachStop(full);
    const b = eachStop(embered);
    a.forEach((stop, i) => expect(b[i]).not.toBe(stop));
  });

  test('every embered stop is valid hex', () => {
    eachStop(embered).forEach(stop => expect(stop).toMatch(HEX));
  });

  test('darkens: each embered channel-sum is lower than the original', () => {
    const sum = (hex: string) =>
      parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16);
    eachStop(full).forEach((stop, i) => {
      expect(sum(eachStop(embered)[i])).toBeLessThan(sum(stop));
    });
  });

  test('desaturates: a saturated color moves toward equal channels', () => {
    // Pure red → embered should have its green/blue raised toward red (greyer).
    const e = emberedPalette({
      red: '#ff0000',
      ember: '#ff0000',
      amber: '#ff0000',
      gold: '#ff0000',
      core: '#ff0000',
    });
    const r = parseInt(e.red.slice(1, 3), 16);
    const g = parseInt(e.red.slice(3, 5), 16);
    // Original green was 0; desaturation toward luma must lift it above 0.
    expect(g).toBeGreaterThan(0);
    expect(g).toBeLessThan(r); // still reddish, just muted
  });

  test('EMBERED_DIM is a sensible glow knob in (0,1)', () => {
    expect(EMBERED_DIM).toBeGreaterThan(0);
    expect(EMBERED_DIM).toBeLessThan(1);
  });
});
