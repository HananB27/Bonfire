# Contract: Fire Engine (`src/domain/fire.ts`)

Pure, framework-free. No I/O, no React, no Date.now() inside (today is passed in) → fully
deterministic and the oracle for `__tests__/fire.test.ts`.

## Types

```ts
// One day's productivity score.
export type Score = 1 | 2 | 3 | 4 | 5;

// Stored data: ISO date "YYYY-MM-DD" → score.
export type Entries = Record<string, Score>;

export type FireStatus = 'unlit' | 'lit' | 'out';

export interface FireState {
  status: FireStatus;
  lit: boolean;                     // status === 'lit'
  strength: number;                 // ≥ 0; size of current alive run
  perDay: Record<string, number>;   // dateKey → contribution (for calendar intensity)
}
```

## Functions

### `scoreStrength(score: Score): number`
Maps a score to its strength contribution. `1→0, 2→1, 3→2, 4→3, 5→4`.
- Property: strictly increasing for 2..5; `scoreStrength(1) === 0`.

### `computeFire(entries: Entries, today: string): FireState`
Derives the full fire state from the calendar evaluated against `today` (ISO local date key).

**Behavior table** (test oracle):

| Scenario | Input shape | Expected |
|----------|-------------|----------|
| No entries | `{}` | `{status:'unlit', lit:false, strength:0, perDay:{}}` |
| Single score today=5 | `{T:5}` | `lit`, `strength:4` |
| Score 1 only | `{T:1}` | `lit`, `strength:0` (alive, no size) |
| Consecutive 5,5,5 | three adjacent days =5 | `lit`, `strength:12` |
| One missed day between scores | scored, gap1, scored | `lit`, both contribute |
| Two consecutive missed past days | scored … miss, miss (both past) | `status:'out'`, `strength:0` |
| Out then relight | out run, then a later score | `lit`, strength = new run only |
| Unscored today after a lit run | lit yesterday, today empty | still `lit` (today not a miss) |
| Backfill repairs streak | fill one of two missed days | recompute → `lit` |
| Order independence | same pairs inserted any order | identical `FireState` |

**Guarantees**:
- Pure: same `(entries, today)` → same `FireState`. No mutation of `entries`.
- `strength === Σ perDay[d]` over days in the current alive run.
- Never returns negative strength; `lit === (status === 'lit')`.

### `contributionsByDate(entries, today): Record<string, number>`
(Optional helper) returns `perDay` for calendar rendering; consistent with `computeFire`.

## Non-goals
- No persistence, no formatting, no React state. Those live in `data/` and `components/`.
