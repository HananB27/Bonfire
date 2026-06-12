/**
 * palettes.ts — the three selectable flame palettes, ported 1:1 from
 * `BonfireDesign/app.jsx` `FLAME_PALETTES`.
 *
 * Each palette is five color stops used by the Skia flame's gradients and the
 * ember particles (low/cool → hot/bright): red → ember → amber → gold → core.
 * The chosen palette persists via `settingsStore` and recolors the flame
 * immediately (FR-016/FR-017).
 */

// The user-facing color choices. Amber is the default.
export type FlameColor = 'Amber' | 'Crimson' | 'Sapphire';

// Five gradient stops for one flame, matching the CSS `--ember/--amber/...` vars.
export interface Palette {
  ember: string;
  amber: string;
  gold: string;
  core: string;
  red: string;
}

export const PALETTES: Record<FlameColor, Palette> = {
  Amber: { ember: '#ff7a18', amber: '#ffae3b', gold: '#ffd27a', core: '#fff4cf', red: '#b3380f' },
  Crimson: { ember: '#ff3b1f', amber: '#ff7a3b', gold: '#ffc27a', core: '#fff0d6', red: '#7a0f0f' },
  Sapphire: { ember: '#2a8bff', amber: '#4ab6ff', gold: '#bfe3ff', core: '#f0f9ff', red: '#163f8a' },
};

// The list of choices, in display order (for the settings radio).
export const FLAME_COLORS: readonly FlameColor[] = ['Amber', 'Crimson', 'Sapphire'];

// Safe lookup: any unknown value falls back to the Amber palette.
export function paletteFor(color: FlameColor): Palette {
  return PALETTES[color] ?? PALETTES.Amber;
}
