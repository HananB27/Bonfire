# Implementation Plan: Fire Health

**Branch**: `007-fire-health` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-fire-health/spec.md`

## Summary

Add a derived, visual-only Fire Health state that reads recent score quality from the latest 7 scored days, weighted toward newer scores, and expresses it through flame behavior plus a visible named state. Keep the change inside the existing Expo bonfire app, reuse the current Skia/Reanimated rendering stack, and do not alter streak survival rules, fire strength math, storage, or unlock logic.

## Technical Context

**Language/Version**: TypeScript (strict) on Expo SDK 56 / React Native 0.85.3 / React 19.2.3

**Primary Dependencies**: Existing Expo app stack only: `expo`, `expo-linear-gradient`,
`@shopify/react-native-skia`, `react-native-reanimated`,
`react-native-safe-area-context`, `react-native-gesture-handler`, and
`@react-native-async-storage/async-storage`. No new runtime dependencies.

**Storage**: N/A. Fire Health is derived from existing score history and is not persisted.

**Testing**: Jest (`jest-expo`) plus the existing lint gate (`npm run lint`).

**Target Platform**: iOS + Android through Expo managed/prebuild.

**Project Type**: Mobile app, single-screen bonfire with calendar and flame scene.

**Performance Goals**: Compute Fire Health only when score history changes; keep the
derivation bounded to a tiny recent window; avoid timers, animation loops, or per-frame JS work;
and preserve the current flame render performance without noticeable drops.

**Constraints**: No changes to streak survival rules, fire strength math, unlock logic, or stored
preferences; no new packages; keep the code pure, readable, and easy to extend; and suppress the
health signal when the fire is not lit so it never implies gameplay state changes.

**Scale/Scope**: Single feature slice inside one screen, one pure health derivation helper, one
small flame-render integration, one caption/state presentation update, and focused unit/component
tests.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality & Maintainability**: PASS. The feature stays small and layered: one pure
  helper for health derivation, one render-path integration, and no new long-lived abstractions.
- **II. Beginner-Readable Code (Explanatory Comments)**: PASS. The health window, weighting, and
  state-mapping logic are simple enough for short intent comments; no opaque math is required.
- **III. Testing Standards (NON-NEGOTIABLE)**: PASS. Add deterministic unit coverage for the
  health derivation and render assertions for the visible state without relying on real time.
- **IV. User Experience Consistency**: PASS. The feature uses the existing theme, flame scene, and
  caption patterns so the new state reads as part of Bonfire rather than a separate system.
- **V. Performance Requirements**: PASS. The health model is derived from a small bounded window,
  recomputed only on data change, and does not add a timer or per-frame work.

## Project Structure

### Documentation (this feature)

```text
specs/007-fire-health/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── fireHealth.ts          # pure helper: recent scores -> health state
├── components/
│   └── Bonfire/
│       ├── Flame.tsx          # apply health-driven visual modifiers to the flame
│       └── FireCaption.tsx    # expose the named health state in the scene
└── screens/
    └── BonfireScreen.tsx      # derive and pass health state once per data change

__tests__/
├── fireHealth.test.ts         # weighted window, thresholds, fallback, suppression
└── BonfireScreen.health.test.tsx # render wiring + visible state behavior
```

**Structure Decision**: Keep Fire Health inside the existing single-screen bonfire app. Add one
pure helper for state derivation, extend the current flame/caption render path to show the state,
and keep all scoring and fire math untouched. This reuses the current Expo/Skia/Reanimated stack
and keeps the feature easy to maintain and extend.

## Phases

**Phase 0 — Research (research.md)**: define the bounded recent-score window, the weighting model,
the state thresholds, the neutral fallback, and the rendering approach that preserves current
performance.

**Phase 1 — Design artifacts**: `data-model.md` (derived health entities and transitions),
`contracts/` (behavior contract for the visible health state), `quickstart.md` (validation
scenarios for all four states, fallback, and suppression when the fire is not lit).

## Complexity Tracking

*No constitution violations — table intentionally empty.*
