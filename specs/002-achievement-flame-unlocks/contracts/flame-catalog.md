# Contract: Flame Catalog (`src/domain/flames.ts` + `src/theme/palettes.ts`)

The **single editable source** of flames. Adding/tuning a flame = edit one array entry. Pure data +
pure color helpers. No React, no I/O.

## Types

```ts
export type FlameId = string;                         // kebab, unique ('amber','voidfire',…)
export type FlameTier = 'base' | 'streak' | 'time';
export type ConditionKind =
  | 'runDays' | 'runStrength' | 'strongDaysInRun' | 'runStrengthAndDays'      // streak
  | 'consecutivePerfect' | 'unbrokenChain' | 'unbrokenChainMinScore'          // time
  | 'perfectCalendarWeek' | 'consecutivePerfectWeeks' | 'crossStrength';

export interface Achievement {
  type: 'streak' | 'time';
  kind: ConditionKind;
  params: Record<string, number>;     // kind-specific, e.g. { n:7 } or { s:80, n:14 }
  windowDays?: number;                 // REQUIRED iff type==='time'
  requirement: string;                 // gallery text (FR-017)
}

export interface FlameStyle {
  id: FlameId;
  name: string;
  tier: FlameTier;
  rarity: number;                      // strictly increases base<streak<time (SC-009)
  gradient: string[];                  // full multicolor hex stops (Appendix A)
  drift?: { hueDeg: number; ms: number };
  palette: Palette;                    // 5-stop, sampled from gradient (Flame consumes this)
  embered: Palette;                    // dim/desaturated variant (FR-014/FR-024)
  achievement: Achievement | null;     // null only for 'amber'
}

export const FLAMES: readonly FlameStyle[];           // the catalog, rarity-ascending
export const BASE_FLAME_ID: FlameId = 'amber';
export function flameById(id: FlameId): FlameStyle;    // falls back to base on unknown
```

## Color helpers (`palettes.ts`, extended — `Palette` type kept from 001)

```ts
export function paletteFromGradient(stops: string[]): Palette;  // sample → {red,ember,amber,gold,core}
export function emberedPalette(p: Palette): Palette;            // desaturate→grey + darken (~0.5)
export const EMBERED_DIM = 0.45;                                // glow/brightness knob for embered
```

- `paletteFromGradient` MUST be deterministic and order-preserving (cool stop → `red`, hot stop →
  `core`). Catalog entries MAY be authored by giving `gradient` and calling the helper, or by writing
  `palette` directly; either way `palette` + `embered` MUST be present on every entry.
- `emberedPalette` mixes each channel toward its luma (~70%) then scales brightness (~0.5). Pure.

> **Naming — avoid confusion**: `'ember'` is a *specific time flame* (the dying-coals look), while
> **"embered"** (`emberedPalette`, `flame.embered`) is the *dim locked-state variant of ANY flame*.
> `flameById('ember').embered` is the embered variant of the Ember flame — and must differ from its
> full `palette`. (`palettes.test.ts` asserts `emberedPalette(p) !== p`.)

## Catalog content

Exactly the flames in **spec Appendix A** (1 base + 8 streak + 11 time = **20 flames**) with these
`kind`/`params`/`windowDays`. No unlock condition may require low scores, low averages, lowered scores,
or intentionally breaking/extinguishing a streak/fire (FR-011a, FR-011b):

| id | tier | kind | params | window |
|----|------|------|--------|--------|
| amber | base | — | — | — |
| crimson | streak | runStrength | {n:5} | — |
| sapphire | streak | runDays | {n:5} | — |
| sodium | streak | runDays | {n:7} | — |
| strontium | streak | strongDaysInRun | {n:5} | — |
| emerald | streak | runStrength | {n:20} | — |
| lilac | streak | runDays | {n:10} | — |
| magenta | streak | runStrength | {n:40} | — |
| ghostlight | streak | runStrengthAndDays | {s:80,n:14} | — |
| toxic | time | consecutivePerfect | {n:3} | 7 |
| wisp | time | unbrokenChainMinScore | {n:5,min:3} | 10 |
| ember | time | unbrokenChainMinScore | {n:10,min:3} | 14 |
| spectral | time | crossStrength | {n:30} | 10 |
| frostfire | time | perfectCalendarWeek | {minScore:1} | 14 |
| inferno | time | perfectCalendarWeek | {minScore:4} | 14 |
| solfire | time | crossStrength | {n:100} | 14 |
| voidfire | time | unbrokenChain | {n:14} | 21 |
| aurora | time | unbrokenChain | {n:30} | 21 |
| phoenix | time | crossStrength | {n:150} | 21 |
| nebula | time | consecutivePerfectWeeks | {weeks:2,minScore:4,minPerfect:10} | 21 |

## Invariants (`flames.catalog.test.ts` — the oracle)

- All `id` unique; `BASE_FLAME_ID` present with `tier:'base'`, `achievement:null`.
- Exactly one base flame; all others have a non-null `achievement`.
- `rarity` strictly increasing in catalog order; all `time` rarities > all `streak` rarities > base
  (SC-009).
- Every `time` achievement has `windowDays` (a positive integer); no streak achievement has one.
- Every flame has `palette` and `embered` with all 5 stops as valid hex.
- `requirement` non-empty for every non-base flame.
- No achievement uses a banned low-score or intentional streak-break condition/text (FR-011a, FR-011b).
