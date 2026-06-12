/**
 * tokens.ts — the app's design tokens, ported 1:1 from the canonical design
 * (`BonfireDesign/styles.css` `:root`).
 *
 * One source of truth for every color so the React Native app matches the
 * reference screenshots exactly (Constitution Principle IV). Names mirror the
 * CSS variables (e.g. `--bg-0` → `bg0`) so it's easy to cross-check.
 */

// ---- Backgrounds (darkest → lifted) ----
export const bg0 = '#070a14'; // deep night
export const bg1 = '#0b1020'; // navy charcoal
export const bg2 = '#121a30'; // lifted panel

// ---- Ink / text ----
export const ink = '#f4ead8'; // warm off-white text
export const inkDim = '#8a93a8'; // muted slate
export const inkFaint = '#515b73'; // faintest labels / disabled

// ---- Default fire colors (the Amber palette's stops live in palettes.ts) ----
export const ember = '#ff7a18';
export const amber = '#ffae3b';
export const gold = '#ffd27a';
export const core = '#fff4cf';
export const red = '#b3380f';

// ---- Calendar heat ramp (per score 1..5) ----
export const heat1 = '#5b2a18';
export const heat2 = '#9a3b12';
export const heat3 = '#e2580c';
export const heat4 = '#f7a325';
export const heat5 = '#ffe9ad';

// ---- Surfaces ----
export const sheet = '#0e1426'; // calendar sheet base
export const line = 'rgba(255, 255, 255, 0.06)'; // hairline borders

/**
 * Heat color for a given score. Index 0 is unused (no score 0); scores 1..5 map
 * to heat1..heat5. Used to paint scored day cells and picker buttons.
 */
export const HEAT: readonly string[] = ['', heat1, heat2, heat3, heat4, heat5];

/**
 * Text/glow treatment for a scored cell, mirroring `calendar.jsx` `cwHeat`.
 * Dark numerals on the warm fill; 4 and 5 get a soft outer glow.
 */
export function heatStyle(score: number): {
  background: string;
  color: string;
  glow: string | undefined;
} {
  const background = HEAT[score];
  const color = score >= 4 ? '#3a1c04' : score === 1 ? '#d9b9a6' : '#1c0d04';
  const glow =
    score >= 4
      ? score === 5
        ? 'rgba(255,233,173,0.6)'
        : 'rgba(247,163,37,0.45)'
      : undefined;
  return { background, color, glow };
}

// Grouped export for convenient `import { tokens } from ...` style access.
export const tokens = {
  bg0,
  bg1,
  bg2,
  ink,
  inkDim,
  inkFaint,
  ember,
  amber,
  gold,
  core,
  red,
  heat1,
  heat2,
  heat3,
  heat4,
  heat5,
  sheet,
  line,
} as const;
