# Contract: Achievement Engine (`src/domain/fireMetrics.ts` + `src/domain/achievements.ts`)

Pure, framework-free, deterministic (today injected). Oracle for `fireMetrics.test.ts` +
`achievements.test.ts`. Reuses 001's `Entries`/`Score`/`FireState` and `dates.ts` helpers; does NOT
modify `fire.ts`.

## `fireMetrics.ts`

```ts
export interface DayPoint { date: DateKey; score?: Score; alive: boolean; strength: number; consMiss: number; }
// A relight→rebuild event. `relightDay` = day the fire re-lit after being out; `endDay` = last SCORED
// day of that run (strength is flat across trailing misses); `peak` = max strength reached in the run.
// NOTE: the day a run first crosses a SPECIFIC strength threshold (e.g. 30) is NOT stored here — it is
// derived on demand by `achievements.ts` from `timeline` within [relightDay, endDay], so the same
// metric serves any threshold (Spectral s=30, Phoenix eachStrength=30, or future values).
export interface Comeback { relightDay: DateKey; endDay: DateKey; peak: number; }
export interface RunMetrics {
  runStart: DateKey | null; runDays: number; runSpanDays: number;
  unbrokenChain: number; strongDaysInRun: number; perfectDaysInRun: number; scoreSumInRun: number;
  comebacks: Comeback[]; timeline: DayPoint[];
}
export function computeMetrics(entries: Entries, today: DateKey): RunMetrics;
```

**Algorithm**: one walk over sorted scored keys from the earliest through `today` (same rules as
`computeFire`: relight from spark, 1 miss survivable, 2 consecutive past misses → out & strength 0,
today-unscored not a miss). While walking, record each day into `timeline`, track the current run's
start/strength/scored-day stats, push a `Comeback` whenever a relight follows an out (stamping its
`relightDay`, and updating `endDay`/`peak` as the run grows/ends). After the walk, the **current run**
fields reflect the alive run at `today` (zeros/null if not lit).

**Guarantees**: deterministic & order-independent (sorted keys + injected today); `runDays` counts
scored days only; `unbrokenChain` resets on any gap; metrics for a not-lit fire are zero/null.

### `fireMetrics.test.ts` oracle (samples)

| Calendar (rel. to today) | runDays | unbrokenChain | strong | perfect |
|--------------------------|---------|---------------|--------|---------|
| 7 straight scored incl today | 7 | 7 | (per scores) | (per scores) |
| scored, gap1, scored×5 (lit) | 6 | 5 | … | … |
| 2-day gap then scored today | 1 | 1 | … | … |
| out (no relight) | 0 | 0 | 0 | 0 |

## `achievements.ts`

```ts
export interface AchievementState {
  flameId: FlameId; unlocked: boolean;
  progress: { value: number; target: number };
  achievementDay: DateKey | null; daysLeft: number | null; expired: boolean;
}
export function evaluateFlame(
  flame: FlameStyle, m: RunMetrics, fire: FireState, today: DateKey,
): AchievementState;
export function evaluateAll(
  flames: readonly FlameStyle[], entries: Entries, today: DateKey, fire: FireState,
): Record<FlameId, AchievementState>;
```

### Condition evaluators (pure; one per `ConditionKind`)

Each: `(m, today, params) → { complete: boolean; progress: {value,target}; completionDay?: DateKey }`.

- **streak kinds** read current `RunMetrics`, `complete` = threshold met:
  `runDays`→`m.runDays≥n`; `runStrength`→`fire.strength≥n`; `strongDaysInRun`→`m.strongDaysInRun≥n`;
  `runStrengthAndDays`→`fire.strength≥s && m.runDays≥n`. (progress = current/target; for the AND kind
  use the lesser-progress sub-goal.)
- **time kinds** scan `m.timeline` for the **latest** `completionDay` ≤ today where the condition first
  holds; progress for locked = best partial toward the condition:
  - `consecutivePerfect(n)`: latest day ending a run of n consecutive `score===5`.
  - `unbrokenChain(n)` / `unbrokenChainMinScore(n,min)`: latest day ending n consecutive scored days
    (with each `≥min` for the min variant).
  - `lowBurnRun(n,maxAvg)`: latest day ending an unbroken chain length ≥ n whose scored-day average
    `≤ maxAvg` (research R6).
  - `perfectCalendarWeek(minScore)`: latest completed Mon–Sun week with all 7 days scored `≥ minScore`;
    `completionDay` = that week's Sunday (or last day completing it).
  - `consecutivePerfectWeeks(weeks,minScore,minPerfect)`: latest day completing `weeks` back-to-back
    qualifying weeks with ≥ `minPerfect` perfect days across them.
  - `comebackStrength(s,withinDays)`: latest `Comeback` whose timeline shows strength `≥ s` on some day
    `d ∈ [relightDay, endDay]` with `diffDays(relightDay, d) ≤ withinDays`; `completionDay = d` (the
    first such day, found by scanning `timeline`).
  - `comebackCount(times,eachStrength)`: count comebacks whose run peaked `≥ eachStrength`;
    `completionDay` = the day the `times`-th such comeback first reaches `eachStrength` (derived from
    `timeline`; lifetime count).
  - `crossStrength(n)`: latest day the run's strength first reaches `≥ n`.

### Final gate (the only place unlock is decided)

```
base  → unlocked: true, progress {1,1}
streak→ unlocked = fire.state==='lit' && complete
time  → D = completionDay (latest) ;
        inWindow = D!==null && today ≤ addDays(D, windowDays)        // D+W inclusive
        unlocked = inWindow && fire.state==='lit'                    // fire-out voids all
        daysLeft = D!==null ? diffDays(addDays(D,windowDays), today) : null   // (D+W) − today
        expired  = D!==null && today > addDays(D, windowDays)
```

### `achievements.test.ts` oracle (must cover)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | streak cond met & lit | `unlocked:true` |
| 2 | streak met, then fire goes out | `unlocked:false` (FR-005) |
| 3 | streak met, then clear a day below threshold | `unlocked:false` (US5.2) |
| 4 | time cond completed today, lit | `unlocked:true`, `daysLeft:W` |
| 5 | time completed D, today = D+W | `unlocked:true`, `daysLeft:0` |
| 6 | time completed D, today = D+W+1 | `unlocked:false`, `expired:true` (FR-007) |
| 7 | time in-window but fire out | `unlocked:false` (FR-007a) → relight within window ⇒ `true` |
| 8 | time expired, re-complete at D2 | `unlocked:true`, window from D2 (FR-008) |
| 9 | time completed only by old backfilled day, today>D+W | `unlocked:false` (FR-010) |
| 10 | two orderings of same edits | identical state map (SC-005) |

All comparisons use `dates.ts` (`addDays`, `diffDays`, string date order) so they match `computeFire`.
