# Contract: Palette-Derived Glow (palettes.ts + fire scene)

**Module**: `src/theme/palettes.ts` (helpers) | **Consumers**: `Flame.tsx`, `Embers.tsx`, `Hearth.tsx`, `BonfireScreen.tsx`

## New exports

```ts
/** "#rrggbb" + alpha → "rgba(r,g,b,a)". Malformed hex falls back to black (never throws). */
export function withAlpha(hex: string, alpha: number): string;

/** Darken "#rrggbb" by multiplying channels by `factor` (0..1). */
export function darken(hex: string, factor: number): string;
```

## Component contract changes

- `Hearth` props gain `palette: Palette` (required). Warm wash + coal colors derive from it.
  `BonfireScreen` passes the same `effectivePalette` already given to `Flame`/`Embers`.
- `Flame` and `Embers` keep their existing prop shapes; only internal hardcoded RGBA stops are
  replaced by palette-derived values.

## Guarantees

1. **No hardcoded warm-color literals remain** in the surrounding-light path: halo, ground glow,
   hearth warm wash, particle radial fades all derive from the active `Palette` (FR-004, FR-005).
2. With the default Amber flame the derived colors are visually equivalent to today's look
   (regression guarantee — alphas/factors chosen to reproduce the current constants).
3. Embered (locked-equipped) flames dim automatically: derivation consumes `effectivePalette`,
   which is already the embered variant when locked.
4. Derived color arrays are memoized on the palette reference — recomputed only on flame switch,
   never per frame (SC-005, ≥120 FPS preserved).
5. Helpers are pure, deterministic, and never throw on malformed input (black fallback, matching
   `parseHex`'s existing behavior).

## Test hooks

- Unit: `withAlpha('#ff7a18', 0.5) === 'rgba(255,122,24,0.5)'`; `withAlpha(x, 0)` ends in `,0)`;
  `darken` channel math + clamping; malformed-hex fallback.
- Unit: glow derivation for two contrasting palettes yields different stop sets; embered palette
  in → embered-tinted stops out.
