# Implementation Plan: Achievement-Locked Flame Styles

**Branch**: `002-achievement-flame-unlocks` | **Date**: 2026-06-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-achievement-flame-unlocks/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Layer an **achievement-gated flame-style system** on top of the existing Bonfire app (feature 001).
Most flames are locked until the user's calendar meets an achievement; the chosen flame renders
**full** while unlocked and as a dim **"embered"** variant while locked. Two achievement kinds —
**streak-specific** (alive only while the current run satisfies the condition; voided when the fire
goes out) and **time-specific** (a window of `W` days from the calendar day the condition completed,
gated on the fire being lit). Everything is **derived deterministically** from the existing
date→score map + today, mirroring feature 001's order-independent fire computation.

**Technical approach (matches the four stakeholder asks in the user input):**

1. **Easy to change** — the entire catalog (flame visuals, achievement conditions, time windows) lives
   in one declarative data file (`src/domain/flames.ts`). Adding/tuning a flame = editing one entry; no
   engine or UI changes. Achievement *condition kinds* are a small closed set of pure predicate
   builders; a new flame reuses them with different numbers.
2. **No performance regression on flame select/switch** — achievement evaluation is a pure O(days)
   pass, **memoized** on `(entries, today)` and computed off the render/animation path; switching the
   active flame only swaps the 5-stop `Palette` fed to the existing Skia `Flame`, which is cheap and
   does **not** touch the UI-thread flicker clock. Embered = a precomputed dim palette (same render
   path). No new per-frame work is introduced (SC-010 inherits 001's ≥120 FPS bar).
3. **Modern RN, no new packages** — reuse what is already installed (Skia, Reanimated, gesture-handler,
   async-storage, expo-linear-gradient, safe-area-context). The gallery uses core RN `Modal`/
   `ScrollView`. **Zero new dependencies.**
4. **Full-screen swipe-to-open calendar** — the closed-state open gesture is widened from the 156 px
   bottom handle to a full-screen upward Pan (status-bar-shade style): a swipe-up anywhere lifts the
   calendar, while taps still reach the settings gear (gesture activates only on vertical-up movement).

**Reuse, unchanged**: `computeFire` and its tests (the engine's lit/out/strength behavior is the
source of truth). New richer run/calendar metrics are added in a **separate pure module** so 001 stays
green.

## Technical Context

**Language/Version**: TypeScript (strict), React 19 + React Native 0.85 via **Expo SDK 56** (existing
project; no version changes).

**Primary Dependencies** (all already in `package.json` — **no additions**):
- `@shopify/react-native-skia` — the flame; consumes a 5-stop `Palette` (existing render path reused
  for every catalog flame and its embered variant).
- `react-native-reanimated` + `react-native-worklets` — UI-thread flame animation + the calendar Pan;
  achievement state never enters the per-frame path.
- `react-native-gesture-handler` — full-screen swipe-up to open the calendar (closed state) + existing
  drag-to-close.
- `expo-linear-gradient` — gradient swatches in the flame gallery (preview of each flame's stops).
- `@react-native-async-storage/async-storage` — persist the active flame-style id (extends the
  existing settings key).
- `react-native-safe-area-context` — unchanged.

**Storage**: Local only. Persisted values: the date→score map (unchanged) + **one** new value, the
active flame-style id (migrates the old `flameColor`). Unlock states are **never** stored — they are
derived on every read (FR-004).

**Testing**: Jest (`jest-expo`) + react-test-renderer. New exhaustive unit tests for the achievement
engine + run-metrics (pure, deterministic, "today" injected); a flames-catalog invariants test
(difficulty ordering, embered-variant present, ids unique); settings-store v1→v2 migration test;
gallery + screen behavior tests with native modules mocked.

**Target Platform**: iOS + Android via Expo, portrait, offline.

**Project Type**: Static single-screen mobile app (client-only, offline-first) — same as 001.

**Performance Goals**: Flame holds **≥120 FPS** on 120 Hz devices for every style incl. multicolor
ones (SC-010). Selecting/switching a flame causes **no sustained frame drop** — verified by keeping
achievement evaluation out of the animation loop and memoized.

**Constraints**: Fully offline; unlock states recompute < one screen refresh after any score change
(SC-001); flame is the hero, calendar one swipe away (now full-screen swipe); no new packages; flame
catalog must be a single editable data source.

**Scale/Scope**: Single user, single device. 20 catalog flames (1 base + 8 streak + 11 time), one
local entry per day, history kept indefinitely.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality & Maintainability**: PASS — strict TS, no `any`; the catalog + achievement engine
  are framework-free pure modules in `src/domain`; small, single-purpose UI components.
- **II. Beginner-Readable Code (Explanatory Comments)**: PASS (planned) — every new module/hook/
  component gets a header + plain-language inline comments; the achievement evaluators (run-metrics
  walk, time-window math, and timeline scans) are the least obvious code and will be commented
  heavily, as the constitution requires.
- **III. Testing Standards (NON-NEGOTIABLE)**: PASS (planned) — pure-engine oracle tests for every
  achievement kind (streak satisfy/relock, time unlock/expire/re-earn/backfill-expired, fire-out
  voids all), order-independence property test, catalog-invariants test, v1→v2 migration regression
  test, and gallery/screen behavior tests. Reuses 001's `computeFire` tests unchanged.
- **IV. User Experience Consistency**: PASS (planned) — one catalog as the single source of flame
  names/colors/requirements; locked/embered/unlocked states all handled; gallery rows carry
  accessibility labels + progress; loading state unchanged.
- **V. Performance Requirements**: PASS (planned) — explicit design rule that achievement state is
  memoized and never computed per frame; flame switch only swaps a palette. This is the reason for the
  pure-module split and the memoized hook (see Phase 1).

**Complexity note**: No new dependencies, no new native modules, no architectural shift. This feature
extends existing patterns (pure `src/domain` engine + hook + Skia component fed by a palette). No
constitution violations → **Complexity Tracking is empty.**

## Project Structure

### Documentation (this feature)

```text
specs/002-achievement-flame-unlocks/
├── spec.md
├── plan.md              # this file
├── research.md          # Phase 0 — decisions (metrics, time-window math, embered, full-screen swipe)
├── data-model.md        # Phase 1 — FlameStyle, Achievement, RunMetrics, AchievementState, settings v2
├── quickstart.md        # Phase 1 — run/test/validation guide
├── contracts/           # Phase 1 — pure-module + UI contracts (see below)
│   ├── flame-catalog.md          # the editable catalog data shape + invariants
│   ├── achievement-engine.md     # pure evaluators: metrics + per-flame unlock/progress
│   ├── settings-store.md         # v2 store (flameStyle id) + v1→v2 migration
│   └── flame-gallery.md          # gallery + full-screen swipe UI contract
└── tasks.md             # /speckit-tasks output (NOT created here)
```

Feature 001's contracts (`fire-engine.md`, `flame-and-theme.md`, `entries-store.md`) remain the
reference for the reused engine + Skia flame; this feature's contracts only cover the additions.

### Source Code (repository root) — additions/edits to the existing tree

```text
src/
├── domain/
│   ├── fire.ts                 # UNCHANGED (computeFire stays the source of truth)
│   ├── dates.ts                # UNCHANGED (+maybe a small `startOfWeek` helper for week conditions)
│   ├── fireMetrics.ts          # NEW pure: one deterministic walk → run boundaries + metrics +
│   │                           #   per-day timeline (today injected)
│   ├── flames.ts               # NEW data: the editable catalog (id, tier, type, gradient, embered,
│   │                           #   condition kind+params, window). EDIT THIS to add/tune a flame.
│   └── achievements.ts         # NEW pure: evaluate(catalog, entries, today, fire) →
│                               #   per-flame { unlocked, progress, achievementDay?, daysLeft? }
├── theme/
│   └── palettes.ts             # EXTEND: keep Palette; add gradient→Palette + emberedPalette() helpers
├── hooks/
│   ├── useSettings.ts          # EDIT: setFlameColor → setFlameStyle (id); ready/migration aware
│   └── useFlames.ts            # NEW: memoized achievement state on (entries, today, fire);
│                               #   returns catalog+states+activeStyle+effectivePalette (full|embered)
├── data/
│   └── settingsStore.ts        # EDIT: v2 schema { flameStyle: FlameId }; load migrates v1 flameColor
├── components/
│   ├── Bonfire/
│   │   └── Flame.tsx           # MINIMAL EDIT: accept optional `dim` (embered glow/brightness knob);
│   │                           #   colors still come from the palette prop (now per-flame)
│   ├── Calendar/
│   │   └── CalendarSheet.tsx   # EDIT: closed-state open Pan spans full screen (status-bar-shade);
│   │                           #   keep handle as the visible affordance; taps still reach the gear
│   └── Settings/
│       ├── SettingsSheet.tsx   # EDIT: gear now opens the FlameGallery (color picker removed)
│       ├── FlameGallery.tsx    # NEW: scrollable catalog list; unlocked→equip, locked→teaser+progress
│       └── FlameRow.tsx        # NEW: one gallery row (gradient swatch, name, lock/progress/countdown)
└── screens/
    └── BonfireScreen.tsx       # EDIT: use useFlames → feed effectivePalette + dim into Flame/Embers

__tests__/
├── fire.test.ts                # UNCHANGED
├── fireMetrics.test.ts         # NEW: run days / unbroken chain / counts oracle
├── achievements.test.ts        # NEW: every achievement kind; relock; expire; re-earn; backfill-expired;
│                               #   fire-out voids all; order-independence property
├── flames.catalog.test.ts      # NEW: ids unique, embered present, difficulty ordering (SC-009)
├── settingsStore.test.ts       # EDIT: add v1→v2 migration + default
└── FlameGallery.test.tsx       # NEW: locked teaser + progress + equip; embered preview on screen
```

**Structure Decision**: Keep the established split — pure rules in `src/domain` (now `fireMetrics`,
`flames`, `achievements`), persistence in `src/data`, a memoized `useFlames` hook as the single
junction between derived state and UI, and the Skia `Flame` driven by a plain `Palette`. This isolates
all "easy to change" content in `flames.ts`, keeps the expensive flame untouched, and makes the whole
achievement layer unit-testable without React.

## Phasing

**Phase 0 — Research (`research.md`)**: the run-metrics set and single-walk algorithm; the
time-window / achievement-day math (incl. backfill-expired and re-earn reset, D+W inclusive); how
"fire-out voids all" composes with derived state; the embered-palette derivation (desaturate without
new deps); the full-screen swipe-to-open gesture without stealing taps; the positive-achievement
guardrails that ban low-score and intentional streak-break requirements.

**Phase 1 — Design artifacts**: `data-model.md` (FlameStyle, Achievement condition kinds, RunMetrics,
AchievementState, Settings v2); `contracts/` (flame-catalog, achievement-engine, settings-store v2,
flame-gallery + swipe); `quickstart.md` (run/test + manual validation incl. earn→equip, expire,
embered, full-screen swipe). Update the agent context (CLAUDE.md SPECKIT markers → this plan).

**Phase 2 — Tasks** (`/speckit-tasks`): metrics module + tests → catalog data → achievement engine +
tests → settings v2 + migration → useFlames hook → palette helpers + Flame dim → gallery UI →
full-screen swipe → screen wiring → catalog-invariants + fidelity review.

## Complexity Tracking

> No constitution violations — no new dependencies, no new native modules, no new architectural
> patterns. This feature extends the existing pure-domain + hook + Skia-palette design. Table
> intentionally empty.
