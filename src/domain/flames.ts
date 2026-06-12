/**
 * flames.ts — THE editable flame catalog (the single source of truth).
 *
 * Want to add, tune, or recolor a flame? Edit ONE entry in `FLAMES` below.
 * Nothing else in the app hard-codes a flame: visuals (the gradient), the
 * achievement that unlocks it, and (for time flames) the window length all live
 * here. Pure data + pure color helpers — no React, no I/O.
 *
 * Two achievement tiers (harder = rarer = further down the list):
 *  - `streak` flames are unlocked WHILE the current run satisfies their
 *    condition, and relock the moment the fire goes out.
 *  - `time` flames unlock on the calendar day their condition completes and stay
 *    unlocked for `windowDays` after that day (while the fire stays lit), then
 *    expire until re-earned.
 *
 * Each gradient is authored BRIGHTEST → DARKEST (hot core first, dark base last)
 * so `paletteFromGradient` samples the hot end into `core` and the cool end into
 * `red`. The dim, locked-state `embered` variant is derived once per flame.
 */

import {
  paletteFromGradient,
  emberedPalette,
  type Palette,
} from '../theme/palettes';

// A stable, unique id for one flame (kebab-case): 'amber', 'voidfire', …
export type FlameId = string;

// Difficulty/grouping tier. Exactly one 'base' flame exists (always unlocked).
export type FlameTier = 'base' | 'streak' | 'time';

// The closed set of condition kinds the achievement engine knows how to evaluate.
export type ConditionKind =
  // streak kinds (read the CURRENT run)
  | 'runDays'
  | 'runStrength'
  | 'strongDaysInRun'
  | 'runStrengthAndDays'
  // time kinds (scan the timeline for the latest completion day)
  | 'consecutivePerfect'
  | 'unbrokenChain'
  | 'unbrokenChainMinScore'
  | 'perfectCalendarWeek'
  | 'consecutivePerfectWeeks'
  | 'crossStrength';

// The unlock condition tied to a flame.
export interface Achievement {
  type: 'streak' | 'time';
  kind: ConditionKind;
  params: Record<string, number>; // kind-specific numbers, e.g. { n: 7 } or { s: 80, n: 14 }
  windowDays?: number; // REQUIRED iff type === 'time' (the W in the D+W window)
  requirement: string; // human-readable gallery text (FR-017)
}

// One catalog flame: its identity, look, and (optional) unlock achievement.
export interface FlameStyle {
  id: FlameId;
  name: string;
  tier: FlameTier;
  rarity: number; // strictly increases base < streak < time (SC-009)
  gradient: string[]; // full multicolor stops, brightest → darkest
  drift?: { hueDeg: number; ms: number }; // optional slow hue drift (visual polish)
  palette: Palette; // 5-stop palette the Skia flame consumes (sampled from gradient)
  embered: Palette; // dim/desaturated locked-state variant (FR-014/FR-024)
  achievement: Achievement | null; // null ONLY for the base flame
}

export const BASE_FLAME_ID: FlameId = 'amber';

/**
 * Small builder so each catalog row stays a one-liner: it samples the gradient
 * into the render palette and precomputes the embered variant. Keeping this here
 * means a new flame is genuinely "append one entry".
 */
function flame(
  id: FlameId,
  name: string,
  tier: FlameTier,
  rarity: number,
  gradient: string[],
  achievement: Achievement | null,
  drift?: { hueDeg: number; ms: number },
): FlameStyle {
  const palette = paletteFromGradient(gradient);
  return { id, name, tier, rarity, gradient, palette, embered: emberedPalette(palette), achievement, drift };
}

// Convenience constructors for the two achievement shapes (readability only).
function streak(kind: ConditionKind, params: Record<string, number>, requirement: string): Achievement {
  return { type: 'streak', kind, params, requirement };
}
function time(
  kind: ConditionKind,
  params: Record<string, number>,
  windowDays: number,
  requirement: string,
): Achievement {
  return { type: 'time', kind, params, windowDays, requirement };
}

/**
 * THE CATALOG — rarity ascending. Edit here to tune the whole feature.
 * Unlocks must always reward stronger scores and longer continuity. Do not add
 * conditions that require keeping scores low or intentionally letting the fire go
 * out.
 */
export const FLAMES: readonly FlameStyle[] = [
  // ---- Base (always unlocked) ----
  flame('amber', 'Amber', 'base', 0, ['#fff4cf', '#ffd27a', '#ffae3b', '#ff7a18', '#b3380f'], null),

  // ---- Streak (unlocked while the run satisfies the condition) ----
  flame('crimson', 'Crimson', 'streak', 1, ['#fff0d6', '#ffc27a', '#ff7a3b', '#ff3b1f', '#7a0f0f'],
    streak('runStrength', { n: 5 }, 'Reach run strength 5')),
  flame('sapphire', 'Sapphire', 'streak', 2, ['#f0f9ff', '#bfe3ff', '#4ab6ff', '#2a8bff', '#163f8a'],
    streak('runDays', { n: 5 }, 'Keep a 5-day run')),
  flame('sodium', 'Sodium', 'streak', 3, ['#FFF6B0', '#FFC400', '#E36A00'],
    streak('runDays', { n: 7 }, 'Keep a 7-day run')),
  flame('strontium', 'Strontium', 'streak', 4, ['#FFC9B0', '#FF3B2E', '#8C0A12'],
    streak('strongDaysInRun', { n: 5 }, 'Log 5 strong days (4 or 5) in one run')),
  flame('emerald', 'Emerald', 'streak', 5, ['#EAFFC2', '#6FE85A', '#1FB36A', '#138A2E'],
    streak('runStrength', { n: 20 }, 'Reach run strength 20')),
  flame('lilac', 'Lilac', 'streak', 6, ['#FFE6FF', '#C77DFF', '#6A2FB5'],
    streak('runDays', { n: 10 }, 'Keep a 10-day run')),
  flame('magenta', 'Magenta', 'streak', 7, ['#FFD9EC', '#FF4D9D', '#B0114E'],
    streak('runStrength', { n: 40 }, 'Reach run strength 40')),
  flame('ghostlight', 'Ghostlight', 'streak', 8, ['#FFFFFF', '#BFE6FF', '#4FA8FF'],
    streak('runStrengthAndDays', { s: 80, n: 14 }, 'Reach run strength 80 within a 14-day run')),

  // ---- Time (unlock on the achievement day, expire after the window) ----
  flame('toxic', 'Toxic', 'time', 9, ['#F2FFB0', '#9AFF1E', '#2EA800'],
    time('consecutivePerfect', { n: 3 }, 7, 'Score 3 perfect days (5) in a row')),
  flame('wisp', 'Wisp', 'time', 10, ['#DFFFF6', '#5FE0C0', '#1E7F86'],
    time('unbrokenChainMinScore', { n: 5, min: 3 }, 10, 'Log 5 days in a row, none below 3')),
  flame('ember', 'Ember', 'time', 11, ['#FFB060', '#E8501E', '#5C0E08'],
    time('unbrokenChainMinScore', { n: 10, min: 3 }, 14, 'Log 10 days in a row, all 3 or higher')),
  flame('spectral', 'Spectral', 'time', 12, ['#F0FFFF', '#7FFFE0', '#2E9FB0'],
    time('crossStrength', { n: 30 }, 10, 'Reach run strength 30')),
  flame('frostfire', 'Frostfire', 'time', 13, ['#FFFFFF', '#9FE8FF', '#2E7BD6'],
    time('perfectCalendarWeek', { minScore: 1 }, 14, 'Score every day of one calendar week')),
  flame('inferno', 'Inferno', 'time', 14, ['#FFFFFF', '#FFD24A', '#FF5A00'],
    time('perfectCalendarWeek', { minScore: 4 }, 14, 'Score 4 or more every day of one calendar week')),
  flame('solfire', 'Solfire', 'time', 15, ['#FFFFFF', '#FFE066', '#FFA21E'],
    time('crossStrength', { n: 100 }, 14, 'Reach run strength 100')),
  flame('voidfire', 'Voidfire', 'time', 16, ['#E2B3FF', '#8B2FE0', '#2A0A4A'],
    time('unbrokenChain', { n: 14 }, 21, 'Log 14 days in a row')),
  flame('aurora', 'Aurora', 'time', 17, ['#B8FFD9', '#5FE0C0', '#FF7AD9', '#8B2FE0'],
    time('unbrokenChain', { n: 30 }, 21, 'Log 30 days in a row'), { hueDeg: 40, ms: 12000 }),
  flame('phoenix', 'Phoenix', 'time', 18, ['#FFFFFF', '#FFD24A', '#FF5A00', '#4A4A4A'],
    time('crossStrength', { n: 150 }, 21, 'Reach run strength 150')),
  flame('nebula', 'Nebula', 'time', 19, ['#FFE066', '#7FFFE0', '#2E9FB0', '#2A0A4A'],
    time('consecutivePerfectWeeks', { weeks: 2, minScore: 4, minPerfect: 10 }, 21,
      'Two strong weeks in a row (every day 4+, 10+ perfect days)'), { hueDeg: 60, ms: 16000 }),
];

// Fast id → flame lookup, built once.
const BY_ID: Record<FlameId, FlameStyle> = Object.fromEntries(FLAMES.map(f => [f.id, f]));

/** Look up a flame by id; any unknown id safely falls back to the base flame. */
export function flameById(id: FlameId): FlameStyle {
  return BY_ID[id] ?? BY_ID[BASE_FLAME_ID];
}
