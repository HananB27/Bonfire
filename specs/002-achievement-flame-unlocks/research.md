# Phase 0 Research: Achievement-Locked Flame Styles

All decisions below are derived from the spec + the existing 001 codebase. No external/network
research was required (the stack is fixed and offline). Each item: **Decision / Rationale /
Alternatives**.

## R1 — Run & calendar metrics (what the achievements need)

**Decision**: Add one pure module `src/domain/fireMetrics.ts` that does a **single deterministic walk**
(same shape as `computeFire`'s walk over sorted keys, "today" injected) and returns:

```
RunMetrics {
  runStart: DateKey | null     // first scored day of the CURRENT alive run (null if not lit)
  runDays: number              // scored days in the current run            (FR "N-day run" = Run days)
  runSpanDays: number          // calendar days runStart..today inclusive
  unbrokenChain: number        // consecutive scored days (no gaps) ending at the latest scored day
  strongDaysInRun: number      // scored ≥4 in the run
  perfectDaysInRun: number     // scored ===5 in the run
  scoreSumInRun: number        // Σ score over scored days in the run (for "average score")
  // history-wide (used by time achievements that scan past completions):
  comebacks: { relightDay: DateKey; endDay: DateKey; peak: number }[]   // threshold-day derived from timeline
}
```

Plus a **per-day timeline** array `{ date, score?, alive, strength, consMiss }` produced by the same
walk, so time-achievement evaluators can ask "did condition X complete on day d?" for any past d
without re-walking.

**Rationale**: Every catalog condition is expressible from these. One walk = O(days), order-independent
(keys sorted, today injected) — inherits 001's determinism (FR-004, SC-005). Keeping it separate from
`fire.ts` means `computeFire` and its oracle tests are untouched.

**Alternatives**: (a) Extend `FireState` directly — rejected: would churn 001's contract + tests for
no gain. (b) Re-walk per achievement — rejected: O(flames·days) and duplicated logic.

## R2 — "N-day run" vs "unbroken chain" (clarified)

**Decision**: Per the spec clarification, **"an N-day run" = `runDays ≥ N`** (scored days in the alive
run; single gaps tolerated). **"unbroken chain" / "daily-logged" = `unbrokenChain ≥ N`** (no gaps).
Both come straight from `RunMetrics`.

**Rationale**: Matches the recorded clarification; two distinct metrics avoid ambiguity. **Alternatives**:
consecutive-only for everything — rejected, contradicts the 001 run definition and the clarification.

## R3 — Streak-specific unlock = "current run satisfies condition now"

**Decision**: A streak flame is unlocked **iff** `fire.state === 'lit'` AND its condition holds on the
**current** `RunMetrics`. No persisted "achieved" flag. Going out (`state !== 'lit'`) ⇒ every streak
flame locked (run metrics are null/0). An edit that lowers the run below threshold ⇒ relocks (derived).

**Rationale**: Because run metrics are monotonic *within* a run for cumulative conditions, "currently
satisfied" equals "achieved this run" except after a destructive edit — which is exactly the desired
relock (FR-005). Pure, deterministic, order-independent.

**Alternatives**: Track a per-run "unlocked once" latch — rejected: adds state, breaks order-
independence, and re-introduces the very thing FR-004 forbids (stored unlock state).

## R4 — Time-specific unlock = window(achievementDay) ∧ lit (clarified)

**Decision**: For a time flame with window length `W`:
1. **achievementDay D** = the **latest** past-or-today calendar day `d` at which the condition
   *completes*, found by scanning the timeline (most recent completion wins; FR-006, FR-008).
2. Unlocked **iff** `D !== null` AND `today ≤ addDays(D, W)` (D+W **inclusive**, per clarification)
   AND `fire.state === 'lit'` (per "fire-out voids all" clarification, FR-007/FR-007a).
3. `daysLeft = diffDays(addDays(D, W), today)` — i.e. `(D+W) − today` — for the gallery countdown (FR-018); `expired` when < 0.
4. **Re-earn / no banking**: because D is always the *latest* completion, re-completing later moves D
   forward and the window restarts from it (FR-008/FR-009); availability only lengthens.
5. **Backfill-expired**: if the only completion is an old `D` with `today > D+W`, it stays locked
   (FR-010) — falls out naturally from step 2.

**Rationale**: A single rule (`latest completion day` + inclusive window + lit gate) satisfies FR-006…
FR-010 and US3 deterministically. "Lit gate" makes a dead fire void time flames too (clarified Q2).

**Alternatives**: store the unlock timestamp at completion — rejected: not derivable/order-independent,
and breaks backfill semantics ("day was achieved, not current date").

## R5 — Encoding conditions so the catalog is "easy to change"

**Decision**: A small **closed set of condition kinds**, each a pure function
`(metrics, timeline, day) → { complete: boolean, progress: {value,target} }`. Catalog entries pick a
kind + numeric params. Kinds:

| Kind | Params | Type | Used by |
|------|--------|------|---------|
| `runDays` | `n` | streak | Sapphire(5), Sodium(7), Lilac(10) |
| `runStrength` | `n` | streak | Crimson(5), Emerald(20), Magenta(40) |
| `strongDaysInRun` | `n` | streak | Strontium(5) |
| `runStrengthAndDays` | `s,n` | streak | Ghostlight(80 & 14) |
| `consecutivePerfect` | `n` | time | Toxic(3) |
| `unbrokenChainMinScore` | `n,min` | time | Wisp(5,≥3) |
| `unbrokenChain` | `n` | time | Voidfire(14), Aurora(30) |
| `lowBurnRun` | `n,maxAvg` | time | Ember(10, avg≤2) |
| `perfectCalendarWeek` | `minScore` | time | Frostfire(any), Inferno(≥4) |
| `consecutivePerfectWeeks` | `weeks,minScore,minPerfect` | time | Nebula(2,≥4,10) |
| `comebackStrength` | `s,withinDays` | time | Spectral(30,7) |
| `comebackCount` | `times,eachStrength` | time | Phoenix(3,30) |
| `crossStrength` | `n` | time | Solfire(100) |

Adding a flame = append a catalog row referencing one kind. Tuning = change a number or `window`.

**Rationale**: One declarative table + a dozen tiny pure predicates keeps "easy to change" true while
every condition stays unit-testable. **Alternatives**: free-form predicate per flame — rejected: harder
to test/diff and invites duplicated walk logic.

## R6 — Tunable spec items resolved to concrete starting rules

Two items the spec flagged as tunable, fixed here so the engine is testable (still one-line editable):

- **Ember `lowBurnRun(10, maxAvg=2)`**: condition completes on day `d` when the unbroken chain ending
  at `d` has length ≥ 10 **and** `scoreSum/scoreCount ≤ 2` over those 10+ days (denominator = scored
  days in the chain). Time flame, window 14. (Average is over the *daily-logged chain*, not calendar
  span — matches "daily-logged".)
- **Phoenix `comebackCount(times=3, eachStrength=30)`**: count history `comebacks` where a relight was
  followed by the run reaching strength ≥ 30 (before going out again). achievementDay = the day the
  **3rd** such comeback reaches ≥ 30. Window 21 from there. Re-earn needs a 4th, etc. (lifetime count).

**Rationale**: Concrete, deterministic, derivable from `RunMetrics.comebacks` + timeline.

## R7 — Embered variant (no new deps)

**Decision**: `emberedPalette(p: Palette): Palette` — a pure transform that desaturates each stop
toward grey and darkens it (e.g. mix each channel toward its luma by ~70% and scale brightness ~0.5).
Plus the existing `Flame` gets an optional `dim?: number` (default 1) that scales `glow`/`bright` so an
embered flame also reads as low-energy. Amber is always unlocked ⇒ never embered.

**Rationale**: Pure color math, zero packages, reuses the existing 5-stop render path → same FPS. The
"same flame but spent" look (stakeholder Q2) is achieved by color + dim, not a separate asset.

**Alternatives**: a Skia greyscale `ColorMatrix` layer over the flame — viable but adds a render layer;
the palette transform is simpler and keeps the flame component nearly unchanged.

## R8 — Mapping multicolor catalog gradients onto the 5-stop Palette

**Decision**: Each catalog flame stores its full gradient as an ordered stop list; a pure
`paletteFromGradient(stops)` samples it into the existing `{red, ember, amber, gold, core}` (cool→hot)
that `Flame.tsx` already consumes. Optional `drift` flames (Aurora, Nebula) may later add a slow
UI-thread hue rotation **on top** of the same palette (a single extra shared value), deferred as a
visual polish task — not required for the unlock mechanic.

**Rationale**: Reuses the entire existing flame composition unchanged; "multicolor/fade" is honored by
richer stops + optional drift, without a new flame renderer. **Alternatives**: a per-flame bespoke Skia
layer set — rejected: large surface area, risks the FPS budget, violates "no over-engineering".

## R9 — Performance: flame select/switch must not drop frames

**Decision**: (1) Achievement state computed in `useFlames` via `useMemo` keyed on `(entries, today,
fire.state, fire.strength)` — never inside Skia render or the flicker loop. (2) Switching the active
flame is a `setFlameStyle` (cheap state set) → new `Palette` prop → Skia repaints gradients; the
UI-thread clock/flicker is independent of palette. (3) `Flame` stays `React.memo`; `FlameGallery` is a
`Modal` mounted lazily so its list isn't rendered behind the flame.

**Rationale**: Directly satisfies the user's "switching flames must not cause drops" + SC-010. The
flame's cost is the blurred Skia layers (unchanged); a palette change does not add layers or JS work.

## R10 — Full-screen swipe-to-open ("like phone status bar")

**Decision**: In `CalendarSheet` closed state, add a **full-screen Pan** overlay (below the gear/dev
pill in z-order, `pointerEvents="box-none"`) configured with `activeOffsetY([-12, 999])` so it activates
**only** on an upward drag; it drives the same `progress` shared value. The visible bottom handle stays
as the affordance. Taps (no vertical movement) don't activate the Pan, so the settings gear and any day
taps still work. When open, the existing scrim/header gestures handle close.

**Rationale**: Matches the requested status-bar-shade feel (pull from anywhere) using only
gesture-handler (already present). The directional activation threshold prevents the overlay from
stealing taps or horizontal gestures.

**Alternatives**: keep the small handle — rejected: user explicitly wants full-screen pull. A top-edge
pull — rejected: the calendar rises from the bottom, so an upward pull is the natural direction.

## R11 — Settings storage migration (v1 → v2)

**Decision**: New schema `{ flameStyle: FlameId }` under a new key `bonfire.settings.v2`. `loadSettings`
first tries v2; if absent, reads the v1 `bonfire.settings.v1` `flameColor` and maps
`Amber|Crimson|Sapphire → same id`, writing v2 forward. Default `flameStyle: 'amber'`. Unknown/corrupt →
default. Never throws (matches existing store behavior).

**Rationale**: Preserves existing users' choice (spec assumption), keeps the never-throw contract, and
isolates the change to the store + hook. **Alternatives**: reuse the v1 key with a union value —
rejected: messier validation and migration semantics.

## Resolved unknowns

All Technical Context items are known from the existing project; **no `NEEDS CLARIFICATION` remain**.
The three spec clarifications (run-days, fire-out-voids-all, D+W inclusive) and the two tunable items
(Ember average, Phoenix comeback) are pinned above.
