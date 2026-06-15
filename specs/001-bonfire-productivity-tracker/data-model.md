# Phase 1 Data Model: Bonfire Productivity Tracker

## Entities

### Daily Entry (stored)

One calendar day's productivity score.

| Field   | Type                      | Rules                                                      |
|---------|---------------------------|-----------------------------------------------------------|
| `date`  | string (ISO `YYYY-MM-DD`) | Local-date key. Unique — at most one entry per date.      |
| `score` | integer 1–5               | 1,2,3,4,5 only. Rejected if out of range or a future date.|

- Stored as a flat map `{ [dateKey]: score }`. A date with no entry is "missed".

### Settings (stored) — NEW

Persisted user preferences. For this version: only the flame color.

| Field        | Type                                  | Rules                                  |
|--------------|---------------------------------------|----------------------------------------|
| `flameColor` | `'Amber' \| 'Crimson' \| 'Sapphire'`  | Defaults to `Amber` until the user picks. Persists across restarts. |

- A flame palette maps a color name → 5 stops `{ ember, amber, gold, core, red }` (from
  `BonfireDesign/app.jsx`), consumed by the Skia flame and the calendar heat ramp accents.

### Fire State (derived — never stored)

Computed from all Daily Entries + today's local date. Recomputed on every change. Mirrors
`BonfireDesign/logic.js`.

| Field      | Type                          | Meaning                                                  |
|------------|-------------------------------|----------------------------------------------------------|
| `state`    | `'unlit' \| 'lit' \| 'out'`   | `unlit` = never lit; `out` = was lit, then extinguished. |
| `strength` | integer ≥ 0                   | Cumulative size of the current alive run (0 when not lit).|
| `everLit`  | boolean                       | Whether any scored day exists (distinguishes unlit vs out).|
| `label`    | `{ word, sub }`               | Caption from `fireLabel` (Spark/Kindling/Steady/Blazing/Roaring/Conflagration, or Unlit/Out). |

> The calendar colors each day cell from its **raw score** (heat ramp `heat[score]`) and renders
> `score` pips — it does NOT need a per-day contribution map, so `FireState` deliberately omits one.

## Derived rules (the fire engine — matches the design)

**Score → contribution**: `contribution(score) = max(0, score − 1)` → 1→0, 2→1, 3→2, 4→3, 5→4.

**Streak / extinguish walk** (deterministic, order-independent): walk every day from the first
scored day through today. A scored day adds its contribution; if the fire was out/unlit it first
relights from a spark (strength 0) then adds. A past day with no score is a miss; today unscored is
not a miss. Two consecutive missed past days extinguish the fire (strength → 0). The surviving run
at today is the displayed fire. `state = alive ? 'lit' : everLit ? 'out' : 'unlit'`.

**Visual intensity** (for the flame, from `flameModel.ts`): `t = 1 − e^(−strength/14)`; flame height
`= lit ? 60 + 268·t : 30`; `glow = lit ? 0.35 + 0.6·t : unlit ? 0.12 : 0`; `bright = 0.85 + 0.45·t`.

## State transitions

```
unlit ─(first score)→ lit
lit ─(score added/raised)→ lit (strength up; score 1 keeps it equal)
lit ─(1 missed past day)→ lit
lit ─(2 consecutive missed past days)→ out (strength → 0, no flame/embers; logs+smoke shown)
out ─(any new score, incl. 1)→ lit (fresh run from 0)
any ─(backfill/edit/clear past day)→ recompute from calendar
```

## Validation rules (mapped to requirements)

- Score 1–5 integer only; no future dates → FR-002, FR-003.
- One entry per date; clearing makes the day missed → FR-004, FR-011.
- Persistence of scores → FR-014; persistence of flame color → FR-017.
- Loading placeholder until both stores load → FR-015.
- Out-state shows no flame/embers (logs + smoke allowed) → FR-012, SC-010.
