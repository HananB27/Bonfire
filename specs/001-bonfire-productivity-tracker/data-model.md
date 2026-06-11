# Phase 1 Data Model: Bonfire Productivity Tracker

## Entities

### Daily Entry (stored)

One calendar day's productivity score. The only persisted data.

| Field   | Type                         | Rules                                                        |
|---------|------------------------------|-------------------------------------------------------------|
| `date`  | string (ISO `YYYY-MM-DD`)    | Local-date key. Unique — at most one entry per date.        |
| `score` | integer 1–5                  | Must be 1,2,3,4,5. Rejected if outside range or future date.|

- A date with **no** entry is "missed".
- Storage shape: a flat map `{ [dateKey: string]: score }` (compact, O(1) lookup, trivial to persist).
- Scores for future dates are rejected at the input layer (`useEntries.setScore`).

### Fire State (derived — never stored)

Computed from **all** Daily Entries + today's local date. Recomputed on every change.

| Field      | Type                          | Meaning                                                       |
|------------|-------------------------------|---------------------------------------------------------------|
| `lit`      | boolean                       | Whether the fire is currently burning.                        |
| `strength` | integer ≥ 0                   | Total size of the current alive run (0 when out/unlit).       |
| `perDay`   | `{ [dateKey]: contribution }` | Per-day strength contribution, for calendar intensity display.|
| `status`   | `'unlit' \| 'lit' \| 'out'`   | `unlit` = no scores yet; `out` = extinguished by 2 misses.    |

## Derived rules (the fire engine)

**Score → strength contribution** (per scored day):

```
1 → +0   (keeps the fire alive, adds no size)
2 → +1
3 → +2
4 → +3
5 → +4
```

**Streak / extinguish walk** (deterministic, order-independent):

1. Consider every date from the earliest scored day through **today**, in calendar order.
2. A date strictly before today with no score is a **miss**; today (unscored) is **not** a miss.
3. Track consecutive misses. On reaching **2 consecutive misses**, the fire goes **out**: the current
   run ends and accumulated strength for that run is discarded (reset to 0).
4. A scored day resets the consecutive-miss counter to 0 and adds its contribution to the current run.
5. The final `strength` is the cumulative sum of contributions in the **last surviving run**;
   `lit` is true iff that run is still alive at today.
6. With no scores at all → `status: 'unlit'`, `lit: false`, `strength: 0`.

Because the result depends only on the set of (date, score) pairs and today, recomputation after any
add/edit/clear/backfill yields the identical state regardless of entry order (satisfies FR-010,
SC-004).

## State transitions

```
unlit ──(first score)──▶ lit
lit ──(score added/raised)──▶ lit (strength increases; score 1 keeps it equal)
lit ──(1 missed past day)──▶ lit (survives)
lit ──(2 consecutive missed past days)──▶ out (strength → 0)
out ──(new score logged)──▶ lit (fresh run from 0)
any ──(backfill/edit/clear past day)──▶ recompute from calendar (may flip lit/out)
```

## Validation rules (mapped to requirements)

- Score range 1–5 integer only → FR-002, FR-003.
- No future-date scores → FR-003, edge case "Future dates".
- One entry per date → Daily Entry uniqueness.
- Clearing a score makes the day missed again and triggers recompute → FR-004, FR-011, edge case
  "Removing a score".
- Persistence across sessions → FR-014.
