# Phase 1 Data Model: Achievement-Locked Flame Styles

Extends feature 001's data model. Reused unchanged: **Daily Entry** (`date → score 1–5`) and the
derived **Fire State** (`state/strength/everLit/label` from `computeFire`). New entities below.

## Stored

### Settings (v2) — supersedes the v1 `flameColor`

| Field        | Type      | Rules                                                                 |
|--------------|-----------|-----------------------------------------------------------------------|
| `flameStyle` | `FlameId` | The active flame's id. Default `'amber'`. Migrated from v1 `flameColor` (`Amber→amber`, `Crimson→crimson`, `Sapphire→sapphire`). Unknown → default. |

- The **only** new stored value. Unlock states are NEVER stored (FR-004, FR-021). A persisted
  `flameStyle` may be locked on load → renders embered until (re)earned.
- Key `bonfire.settings.v2`; load migrates from `bonfire.settings.v1` (see contract).

## Catalog data (compile-time constant — the single editable source)

### FlameStyle

| Field      | Type                       | Notes                                                        |
|------------|----------------------------|--------------------------------------------------------------|
| `id`       | `FlameId` (string)         | Unique, kebab id (`'amber'`, `'voidfire'`…).                 |
| `name`     | string                     | Display name.                                                |
| `tier`     | `'base' \| 'streak' \| 'time'` | Drives gallery grouping + difficulty ordering.          |
| `rarity`   | integer (0…n)              | Difficulty rank; strictly increases base→streak→time (SC-009).|
| `gradient` | `string[]` (hex stops)     | Full multicolor stops, cool→hot or as listed in Appendix A.  |
| `drift`?   | `{ hueDeg:number; ms:number }` | Optional slow hue drift (Aurora/Nebula); visual polish.  |
| `palette`  | `Palette`                  | 5-stop `{red,ember,amber,gold,core}` sampled from `gradient` (what `Flame` consumes). |
| `embered`  | `Palette`                  | Precomputed dim/desaturated variant of `palette` (FR-014, FR-024). |
| `achievement` | `Achievement \| null`   | `null` only for the base flame `amber` (always unlocked).    |

### Achievement

| Field         | Type                          | Notes                                              |
|---------------|-------------------------------|----------------------------------------------------|
| `type`        | `'streak' \| 'time'`          | FR-003.                                             |
| `kind`        | `ConditionKind`               | One of the closed set (research R5).                |
| `params`      | kind-specific numbers         | e.g. `{ n: 7 }`, `{ s: 80, n: 14 }`.               |
| `windowDays`? | integer                       | Required when `type==='time'`; the `W` in D+W (FR-007). |
| `requirement` | string                        | Human text for the gallery (FR-017).               |

**ConditionKind** (and the metric each reads — see Achievement Engine contract):
`runDays · runStrength · strongDaysInRun · runStrengthAndDays` (streak);
`consecutivePerfect · unbrokenChain · unbrokenChainMinScore · perfectCalendarWeek ·
consecutivePerfectWeeks · crossStrength` (time).

Achievement conditions must reward stronger scores and longer continuity. They must not require low
scores, low averages, lowered scores, or intentionally breaking/extinguishing a streak/fire (FR-011a,
FR-011b).

## Derived (never stored)

### RunMetrics — from `fireMetrics.ts` (one walk, `today` injected)

| Field            | Type            | Meaning                                                       |
|------------------|-----------------|---------------------------------------------------------------|
| `runStart`       | `DateKey\|null` | First scored day of the current alive run (null if not lit).  |
| `runDays`        | integer ≥ 0     | Scored days in the run. ("an N-day run" ⇒ `runDays ≥ N`.)      |
| `runSpanDays`    | integer ≥ 0     | Calendar days `runStart..today` inclusive.                    |
| `unbrokenChain`  | integer ≥ 0     | Consecutive scored days (no gaps) ending at the latest scored day. |
| `strongDaysInRun`| integer ≥ 0     | Scored ≥ 4 in the run.                                         |
| `perfectDaysInRun`| integer ≥ 0    | Scored === 5 in the run.                                       |
| `scoreSumInRun`  | integer ≥ 0     | Σ score over scored days in the run.                          |
| `timeline`       | `DayPoint[]`    | Per-day `{date,score?,alive,strength,consMiss}` for completion scans. |

### AchievementState — from `achievements.ts`, one per non-base flame

| Field           | Type            | Meaning                                                     |
|-----------------|-----------------|--------------------------------------------------------------|
| `flameId`       | `FlameId`       | —                                                            |
| `unlocked`      | boolean         | Final gate (see rules below).                               |
| `progress`      | `{ value:number; target:number }` | For the gallery bar (FR-018).             |
| `achievementDay`| `DateKey\|null` | time only: latest completion day D (FR-006).                |
| `daysLeft`      | `number\|null`  | time only: `(D+W) − today`; `< 0` ⇒ expired (FR-018).       |
| `expired`       | boolean         | time only: was completed once but now past window.          |

**Unlock rules** (mirrors research R3/R4):
- base (`amber`): always `unlocked: true`.
- streak: `unlocked = fire.state === 'lit' && condition(RunMetrics)`.
- time: `unlocked = D !== null && today ≤ D+W && fire.state === 'lit'`.

### EffectiveRender — what `useFlames` hands the screen

| Field              | Type      | Meaning                                                   |
|--------------------|-----------|------------------------------------------------------------|
| `activeStyle`      | FlameStyle| The user's selected flame (from settings).                |
| `activeUnlocked`   | boolean   | Whether the active flame is currently unlocked.           |
| `effectivePalette` | `Palette` | `activeUnlocked ? activeStyle.palette : activeStyle.embered`. |
| `dim`              | number    | `activeUnlocked ? 1 : EMBERED_DIM` (glow/brightness knob).|

## Relationships

- One `FlameStyle` ↔ at most one `Achievement` (base flame has none). FR-001.
- `AchievementState` is computed per flame from `(catalog, entries, today, fire/RunMetrics)`. FR-004.
- `Settings.flameStyle` references a `FlameStyle.id`; its render uses `EffectiveRender`.

## State transitions (a single flame's unlock state)

```
locked ─(streak: run satisfies cond & lit)→ unlocked
locked ─(time: completion today within window & lit)→ unlocked
unlocked(streak) ─(fire goes out OR edit drops run below cond)→ locked
unlocked(time)   ─(date passes D+W  OR  fire goes out)→ locked   # relight w/in window → unlocked
unlocked/locked ─(re-complete time cond later)→ unlocked, window restarts from new D  (no banking)
any ─(backfill/edit/clear)→ recompute from calendar (order-independent)
```

## Validation rules (mapped to requirements)

- Difficulty strictly increasing base < streak < time by `rarity` → FR-011, SC-009 (catalog test).
- Every non-base flame has an `achievement`; every flame has `palette` + `embered` → FR-001, FR-024.
- Time achievements require `windowDays` → FR-007 (catalog test).
- Unlock derived only, recomputed on change, order-independent → FR-004, FR-020, SC-005.
- Unlock requirements never reward low scores or intentional streak/fire breaks → FR-011a, FR-011b.
- Active selection persists; may load locked → embered → FR-021, FR-014, SC-006, SC-007.
- Fire `out` ⇒ all non-Amber locked & out-state visuals win → FR-007a, FR-015.
