/**
 * palettes.test.ts — unit tests for the gradient→palette sampler, the dim
 * "embered" (locked) variant, and the `withAlpha`/`darken` glow-derivation
 * helpers (003 US2).
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
  withAlpha,
  darken,
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

// ---- withAlpha / darken: the glow-derivation helpers (003 US2) ----
// These feed the halo / ground glow / hearth wash / ember fades, so they must
// be exact, clamped, and never throw (contracts/glow-derivation.md).

describe('withAlpha', () => {
  test('converts "#rrggbb" + alpha to "rgba(r,g,b,a)"', () => {
    expect(withAlpha('#ff7a18', 0.5)).toBe('rgba(255,122,24,0.5)');
  });

  test('alpha 0 yields a fully transparent stop (ends in ",0)")', () => {
    expect(withAlpha('#ffae3b', 0)).toMatch(/,0\)$/);
    expect(withAlpha('#ffae3b', 0)).toBe('rgba(255,174,59,0)');
  });

  test('malformed hex falls back to black, never throws (parseHex behavior)', () => {
    expect(withAlpha('zzzzzz', 0.3)).toBe('rgba(0,0,0,0.3)');
    expect(withAlpha('', 1)).toBe('rgba(0,0,0,1)');
  });
});

describe('darken', () => {
  test('multiplies each channel by the factor', () => {
    // #b3380f = (179, 56, 15); ×0.5 → (90, 28, 8) rounded → #5a1c08
    expect(darken('#b3380f', 0.5)).toBe('#5a1c08');
  });

  test('clamps to the 0..255 range (factor > 1 cannot overflow)', () => {
    expect(darken('#ffffff', 2)).toBe('#ffffff');
    expect(darken('#808080', 0)).toBe('#000000');
  });

  test('malformed hex falls back to black, never throws', () => {
    expect(darken('oops', 0.5)).toBe('#000000');
  });
});

describe('glow derivation from palettes', () => {
  // The same stop recipe Flame.tsx uses for the halo — derived here from two
  // contrasting palettes to prove the glow follows the flame's own colors.
  const haloStops = (p: Palette) => [
    withAlpha(p.amber, 0.4),
    withAlpha(p.ember, 0.16),
    withAlpha(p.ember, 0),
  ];

  test('two contrasting palettes produce different derived stop sets', () => {
    const amber = paletteFromGradient(AMBER_GRADIENT);
    const blue = paletteFromGradient(['#e8f6ff', '#7ac9ff', '#1f6dff', '#0a2a8f']);
    expect(haloStops(amber)).not.toEqual(haloStops(blue));
  });

  test('an embered palette in produces embered-tinted stops out', () => {
    const full = paletteFromGradient(AMBER_GRADIENT);
    const dim = emberedPalette(full);
    const fullStops = haloStops(full);
    const dimStops = haloStops(dim);
    expect(dimStops).not.toEqual(fullStops);
    // The embered amber channel really is what lands in the stop.
    expect(dimStops[0]).toBe(withAlpha(dim.amber, 0.4));
  });

  test('a near-black palette still yields its own subtle stops — no orange fallback', () => {
    const dark = paletteFromGradient(['#1a1a1c', '#0d0d0f']);
    const stops = haloStops(dark);
    // Every stop derives from the dark palette itself…
    expect(stops[0]).toBe(withAlpha(dark.amber, 0.4));
    // …and none of them is the old hardcoded default-orange value.
    expect(stops).not.toContain('rgba(255,170,60,0.4)');
    expect(stops).not.toContain('rgba(255,120,24,0.16)');
  });
});
