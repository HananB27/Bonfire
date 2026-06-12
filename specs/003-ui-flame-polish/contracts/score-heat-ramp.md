# Contract: Score Heat Ramp (tokens.ts)

**Module**: `src/theme/tokens.ts` | **Consumers**: `ScorePickerBar`, `DayCell`

## Exports (changed)

```ts
// New ramp values (single source of truth for buttons AND day cells)
export const heat1: string; // #ffffff  white
export const heat2: string; // light yellow
export const heat3: string; // yellow
export const heat4: string; // orange
export const heat5: string; // red

export const HEAT: readonly string[]; // ['', heat1..heat5] — index 0 unused

export function heatStyle(score: number): {
  background: string;            // HEAT[score]
  color: string;                 // legible text on that background (dark 1–4, light 5)
  glow: string | undefined;      // soft outer glow, scores 4–5 only
  border: string | undefined;    // NEW: outline for score 1 (white button), else undefined
};
```

## Guarantees

1. `heat1` is pure white `#ffffff`; `heat5` reads unambiguously as red; 2–4 step monotonically
   white → light yellow → yellow → orange (FR-007).
2. `heatStyle(n).color` has ≥4.5:1 contrast against `heatStyle(n).background` for all n in 1..5
   (FR-008).
3. `heatStyle(1).border` is non-undefined (white button visibility edge case; value pinned in
   tokens.ts — `rgba(59,53,39,0.45)`); `border` is `undefined` for scores 2–5.
   Contrast note: `heat5` must be a red that passes guarantee 2 with its text color — verified
   pairing `#c4310f` + `#fff2e8` ≈ 5.0:1 (brighter `#e8401c` fails at ~3.6:1).
4. All five backgrounds are pairwise visually distinct (SC-003).
5. Shape is backward compatible: existing consumers reading `background`/`color`/`glow` compile
   and behave; `border` is additive.

## Test hooks

- Unit: exact token values, `border` presence rule, monotonic ramp (lightness decreasing /
  hue shifting), contrast ratio computation for each pair.
