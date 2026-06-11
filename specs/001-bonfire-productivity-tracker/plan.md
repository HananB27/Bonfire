# Implementation Plan: Bonfire Productivity Tracker

**Branch**: `001-bonfire-productivity-tracker` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-bonfire-productivity-tracker/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

A static, single-view React Native (TypeScript) mobile app with no backend and no runtime network
calls. The one screen shows an animated bonfire above a month calendar. The user assigns each day a
productivity score of 1–5; the fire's size equals the cumulative sum of per-day strength
contributions (1→+0, 2→+1, 3→+2, 4→+3, 5→+4) over the current alive run. One missed past day is
survivable; two consecutive missed past days extinguish the fire and reset strength to zero. All
fire state is derived deterministically from the calendar evaluated against today's date, so
backfilling/editing past days recomputes the fire. Scores persist locally on-device.

Technical approach: framework-free pure domain logic (`src/domain/fire.ts`) for exhaustively
testable streak/strength rules; thin reusable UI styled from design tokens taken from the fetched
design artifact; on-device persistence behind a hook. The animated flame is the performance hero and
MUST sustain ≥120 FPS via native-driver animation with zero per-frame JS-thread work.

## Design Source (MUST DO)

Before implementing any UI, you **MUST**:

1. **Fetch the design** from:
   `https://api.anthropic.com/v1/design/h/eOB-vSewWG4d4riVK_jhKg?open_file=Bonfire.html`
2. **Read its README** (and any tokens/notes in that bundle) to understand intended structure,
   design tokens, and component breakdown.
3. **Implement `Bonfire.html`** — translate the design's relevant aspects (layout, spacing, color
   palette, typography, flame visual states, calendar cell styling, ember/glow treatment, and
   interaction affordances) into React Native components. The HTML/CSS is a faithful visual
   reference, not a literal target.

Hard gate: the delivered UI MUST match the fetched design. Where design and spec disagree on
**mechanics**, the spec wins; where they concern **look-and-feel**, the design wins. The `DesignSync`
tool is available to pull `Bonfire.html` and its README into the workspace.

## Technical Context

**Language/Version**: TypeScript 5.8 (strict mode), React 19.2, React Native 0.86

**Primary Dependencies**: react-native, react-native-safe-area-context (already present). Add a local
key/value store for persistence (`@react-native-async-storage/async-storage`). Flame animation uses
React Native's built-in `Animated` API with `useNativeDriver: true`; no game engine, no Reanimated
required for v1 (revisit only if profiling shows the native driver cannot hold 120 FPS — see
research.md). Hand-built calendar grid (no third-party calendar library) for full styling control.

**Storage**: Local device storage only (AsyncStorage). One persisted map of Daily Entries keyed by
ISO date `YYYY-MM-DD` → score. No backend, no accounts, no sync.

**Testing**: Jest + react-test-renderer (already configured). The pure fire engine is unit tested
exhaustively; components get render/behavior tests.

**Target Platform**: iOS and Android (React Native), mobile portrait, offline.

**Project Type**: Static single-view mobile app (client-only, offline-first).

**Performance Goals**: Animated flame sustains **≥120 FPS** on 120 Hz-capable devices (gracefully
capped to the panel refresh rate on 60 Hz devices); fire visibly updates within ~1s of a score
change (SC-001). This exceeds the constitution's 60 FPS floor (Principle V).

**Constraints**: Fully offline — **no calls to external endpoints at runtime** (design fetch is a
build-time/dev activity only); cold start to interactive < 3s; exactly two surfaces (flame +
calendar), no other screens/menus.

**Scale/Scope**: Single user, single device. One screen, ~6–10 components, one local entry per day
(dataset stays tiny even over years).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality & Maintainability**: PASS — strict TS, no `any`, `npm run lint` clean, small
  single-purpose functions; reusable components; fire rules isolated in a pure module.
- **II. Beginner-Readable Code (Explanatory Comments)**: PASS (planned) — every component, hook, and
  fire-engine function gets a header comment (purpose/inputs/outputs); the streak walk and
  cumulative-sum logic get plain-language inline comments. Hard requirement for this project.
- **III. Testing Standards (NON-NEGOTIABLE)**: PASS (planned) — fire engine gets exhaustive unit
  tests (0/1/2+ consecutive misses, backfill order-independence, reset-to-zero, score→strength
  mapping); components get behavior tests; bug fixes carry regression tests; all deterministic.
- **IV. User Experience Consistency**: PASS (planned) — single design-token source from the fetched
  design; unlit/lit/out states all handled; accessible labels on day cells and score picker;
  identical iOS/Android behavior.
- **V. Performance Requirements**: PASS (planned, raised bar) — native-driver `Animated`, memoized
  calendar cells, fire state derived once per change. Target 120 FPS exceeds the 60 FPS floor. No
  virtualization needed (≤ ~42 cells visible).

No violations. Complexity Tracking omitted.

## Project Structure

### Documentation (this feature)

```text
specs/001-bonfire-productivity-tracker/
├── spec.md              # Feature specification (done)
├── design-prompt.md     # Prompt used to generate the Claude design (done)
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output — fire-engine + storage contracts
│   ├── fire-engine.md
│   └── entries-store.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
App.tsx                          # Root: SafeArea provider + BonfireScreen

src/
├── domain/
│   ├── fire.ts                  # PURE engine: (entries, today) → FireState {lit, strength, perDay}
│   │                           #   score→strength (1→0,2→1,3→2,4→3,5→4); streak walk;
│   │                           #   2-consecutive-miss extinguish + reset-to-zero; order-independent
│   └── dates.ts                 # Local-date helpers: today(), isPast(), toKey(), monthGrid()
├── data/
│   └── entriesStore.ts          # AsyncStorage load/save of the date→score map (only storage touch)
├── hooks/
│   └── useEntries.ts            # Loads entries; exposes setScore/clearScore; persists; memoizes fire
├── components/
│   ├── Bonfire/
│   │   ├── Flame.tsx            # Native-driver animated flame; strength→size/glow; spark & out states
│   │   └── flameModel.ts        # Pure strength→visual params (size, glow, particle count) curves
│   ├── Calendar/
│   │   ├── CalendarMonth.tsx    # Month grid + month navigation
│   │   ├── DayCell.tsx          # memo() day cell: scored/missed/today/future styling + tap target
│   │   └── ScorePicker.tsx      # Inline 1–5 picker + clear
│   └── theme/
│       └── tokens.ts            # Colors/typography/spacing from the fetched Bonfire.html design
└── screens/
    └── BonfireScreen.tsx        # Composes Flame (top) + CalendarMonth (bottom)

__tests__/
├── fire.test.ts                 # Exhaustive fire-engine unit tests (the oracle from contracts/)
├── dates.test.ts                # Miss boundary: today not missed until past
├── entriesStore.test.ts         # Persistence round-trip (mocked AsyncStorage)
└── BonfireScreen.test.tsx       # Logging grows the fire; 2 consecutive misses → out
```

**Structure Decision**: Single React Native project, no API tier (static/client-only). Behavioral
rules live in framework-free `src/domain` so they are exhaustively unit-testable without rendering.
UI is reusable components in `src/components` composed by one `BonfireScreen`, styled from
`theme/tokens.ts` derived from the fetched design. All storage access is isolated in `src/data`
behind `useEntries`, so components never touch persistence directly.

## Complexity Tracking

No constitution violations — section intentionally empty.
