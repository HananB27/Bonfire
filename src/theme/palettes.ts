/**
 * palettes.ts — the flame `Palette` type and pure color helpers.
 *
 * A palette is five color stops used by the Skia flame's gradients and the
 * ember particles (low/cool → hot/bright): red → ember → amber → gold → core.
 * Since the achievement-flame feature, palettes are no longer hard-coded here:
 * every flame in the catalog (`src/domain/flames.ts`) authors a full multicolor
 * gradient, and `paletteFromGradient` samples it into this 5-stop shape. The
 * old three-color picker (Amber/Crimson/Sapphire) lives on as catalog flames
 * with the same stops; its stored v1 value is migrated by `settingsStore`.
 */

// Five gradient stops for one flame, matching the CSS `--ember/--amber/...` vars.
export interface Palette {
  ember: string;
  amber: string;
  gold: string;
  core: string;
  red: string;
}

// ---------------------------------------------------------------------------
// Gradient → Palette sampling, and the dim "embered" (locked) variant.
//
// The flame catalog (`flames.ts`) authors each flame as a list of full-color
// gradient stops written HOTTEST → COOLEST (exactly as spec Appendix A lists
// them: e.g. white core … deep red base). The Skia flame, however, consumes the
// fixed 5-stop `Palette` ({red, ember, amber, gold, core} = coolest → hottest).
// `paletteFromGradient` bridges the two by sampling the gradient at five evenly
// spaced points, so any-length multicolor gradient maps cleanly onto the flame.
// ---------------------------------------------------------------------------

// One RGB color as numbers 0–255. (Internal helper for color math.)
interface Rgb {
  r: number;
  g: number;
  b: number;
}

// Parse "#rrggbb" → {r,g,b}. Falls back to black on malformed input (never throws).
function parseHex(hex: string): Rgb {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  // NaN guard: a bad stop becomes black rather than crashing the catalog build.
  return { r: r || 0, g: g || 0, b: b || 0 };
}

// Clamp to 0–255 and format one channel as a 2-digit hex pair.
function channelHex(value: number): string {
  const clamped = Math.max(0, Math.min(255, Math.round(value)));
  return clamped < 16 ? `0${clamped.toString(16)}` : clamped.toString(16);
}

// Build "#rrggbb" from an {r,g,b}.
function toHex({ r, g, b }: Rgb): string {
  return `#${channelHex(r)}${channelHex(g)}${channelHex(b)}`;
}

// Linear blend between two colors; `t` 0 → a, 1 → b.
function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

/**
 * Sample a gradient (≥1 stops) at position `p` in [0,1], where 0 = the first
 * stop and 1 = the last. Stops are spread evenly across the range and adjacent
 * stops are linearly interpolated in RGB.
 */
function sampleGradient(stops: Rgb[], p: number): Rgb {
  if (stops.length === 1) return stops[0];
  const clamped = Math.max(0, Math.min(1, p));
  const scaled = clamped * (stops.length - 1); // which segment we land in
  const i = Math.min(stops.length - 2, Math.floor(scaled));
  return mix(stops[i], stops[i + 1], scaled - i); // local fraction within segment
}

/**
 * Turn an authored gradient (hottest→coolest hex stops) into the flame's 5-stop
 * `Palette`. The hot end fills `core`, the cool end fills `red`, with three even
 * samples in between — so a flame's full multicolor look survives into the render.
 */
export function paletteFromGradient(stops: string[]): Palette {
  const rgb = stops.map(parseHex);
  // p = 0 is the hot end → core; p = 1 is the cool end → red.
  return {
    core: toHex(sampleGradient(rgb, 0)),
    gold: toHex(sampleGradient(rgb, 0.25)),
    amber: toHex(sampleGradient(rgb, 0.5)),
    ember: toHex(sampleGradient(rgb, 0.75)),
    red: toHex(sampleGradient(rgb, 1)),
  };
}

// How much to dim an embered (locked) flame's glow/brightness (knob for `Flame`).
export const EMBERED_DIM = 0.45;

// Desaturate one color toward its luma (grey) by 70%, then darken to ~50%.
// Result: a "spent coal" version of the color — same hue hint, far less life.
function emberColor(hex: string): string {
  const { r, g, b } = parseHex(hex);
  // Rec. 709 luma: the perceived grey level of this color.
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // Pull each channel 70% toward that grey (desaturate), keeping 30% of the hue.
  const desatR = r * 0.3 + luma * 0.7;
  const desatG = g * 0.3 + luma * 0.7;
  const desatB = b * 0.3 + luma * 0.7;
  // Then halve the brightness so a locked flame reads as low-energy.
  return toHex({ r: desatR * 0.5, g: desatG * 0.5, b: desatB * 0.5 });
}

/**
 * The dim, desaturated variant of a palette used while a flame is LOCKED
 * (FR-014/FR-024). Pure color math — no new dependencies, same render path.
 */
export function emberedPalette(p: Palette): Palette {
  return {
    red: emberColor(p.red),
    ember: emberColor(p.ember),
    amber: emberColor(p.amber),
    gold: emberColor(p.gold),
    core: emberColor(p.core),
  };
}
