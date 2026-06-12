# Contract: Fire Engine (`src/domain/fire.ts`)

Pure, framework-free. No I/O, no React, no Date.now() inside (today is passed in) → fully
deterministic and the oracle for `__tests__/fire.test.ts`. Mirrors `BonfireDesign/logic.js`.

## Types

```ts
// One day's productivity score.
export type Score = 1 | 2 | 3 | 4 | 5;

// Stored data: ISO date "YYYY-MM-DD" → score.
export type Entries = Record<string, Score>;

export type FireStatus = 'unlit' | 'lit' | 'out';

export interface FireState {
  state: FireStatus;                // 'unlit' = never lit; 'out' = was lit then extinguished
  strength: number;                 // ≥ 0; size of current alive run (0 when not lit)
  everLit: boolean;                 // any scored day exists (distinguishes unlit vs out)
  label: { word: string; sub: string }; // caption from fireLabel
}

export type DayKind = 'future' | 'scored' | 'today' | 'missed';
```

## Functions

### `contribution(score: Score): number`
Maps a score to its strength contribution. `1→0, 2→1, 3→2, 4→3, 5→4` (`max(0, score − 1)`).
- Property: strictly increasing for 2..5; `contribution(1) === 0`.

### `computeFire(entries: Entries, today: string): FireState`
Derives the full fire state from the calendar evaluated against `today` (ISO local date key).

**Behavior table** (test oracle):

| Scenario | Input shape | Expected |
|----------|-------------|----------|
| No entries | `{}` | `{state:'unlit', strength:0, everLit:false}` |
| Single score today=5 | `{T:5}` | `state:'lit'`, `strength:4` |
| Score 1 only | `{T:1}` | `state:'lit'`, `strength:0` (alive, no size) |
| Consecutive 5,5,5 | three adjacent days =5 | `state:'lit'`, `strength:12` |
| One missed day between scores | scored, gap1, scored | `state:'lit'`, both contribute |
| Two consecutive missed past days | scored … miss, miss (both past) | `state:'out'`, `strength:0` |
| Out then relight | out run, then a later score | `state:'lit'`, strength = new run only |
| Unscored today after a lit run | lit yesterday, today empty | still `state:'lit'` (today not a miss) |
| Backfill repairs streak | fill one of two missed days | recompute → `state:'lit'` |
| Order independence | same pairs inserted any order | identical `FireState` |

**Guarantees**:
- Pure: same `(entries, today)` → same `FireState`. No mutation of `entries`.
- Never returns negative strength; `state === 'lit'` iff a run is alive at today.

### `classifyDay(entries: Entries, dateKey: string, today: string): DayKind`
Classifies one calendar day for the grid: `'future'` (after today), `'scored'`, `'today'` (unscored
today), or `'missed'` (past, unscored). Used by `DayCell`.

### `fireLabel(state: FireStatus, strength: number): { word, sub }`
Caption words mirroring the design: Unlit / Out / A spark / Kindling / Steady / Blazing / Roaring /
Inferno (with sub-text). Surfaced by `FireCaption` (allowed per spec terminology assumption).

## Non-goals
- No persistence, no formatting, no React state, no per-day contribution map (the calendar colors
  cells from the raw score, not contributions). Persistence lives in `data/`, rendering in
  `components/`.
