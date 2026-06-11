# Phase 0 Research: Bonfire Productivity Tracker

All Technical Context unknowns are resolved below. No remaining NEEDS CLARIFICATION.

## R1 — Local persistence library

- **Decision**: Use `@react-native-async-storage/async-storage` for the date→score map.
- **Rationale**: De-facto standard key/value store for RN, tiny dataset (one entry per day), simple
  async API, well maintained, no native config beyond autolinking. Matches the constitution's
  "justify new dependencies" rule: small footprint, broad adoption.
- **Alternatives considered**:
  - **MMKV** — faster, synchronous. Rejected for v1: extra native setup and a heavier dependency for
    a dataset that is trivially small; revisit only if load latency ever matters.
  - **react-native-sqlite / WatermelonDB** — overkill for a single flat map; rejected.
  - **File system (rn-fs)** — more plumbing than a KV store; rejected.

## R2 — Hitting ≥120 FPS for the animated flame

- **Decision**: Drive the flame with React Native's `Animated` API using `useNativeDriver: true`,
  animating only transform/opacity properties on a small number of layered views (flame body, glow,
  ember particles). Loop continuous flicker on the UI thread; recompute target size only when fire
  strength changes (not per frame).
- **Rationale**: Native-driver animations run on the UI thread, decoupled from JS, so they render at
  the display's refresh rate — 120 Hz on ProMotion/120 Hz Android panels — even while JS is busy.
  Animating transform/opacity avoids layout and is GPU-cheap. No per-frame `setState`, no JS-thread
  work in the animation loop = no dropped frames.
- **Key practices**:
  - Animate `transform: [{ scale }, { translateY }]` and `opacity`; never animate width/height/color
    on the JS thread for the hot loop.
  - Strength→visual mapping is a **pure function** (`flameModel.ts`); on a score change, JS computes
    new targets once and starts a native-driver transition.
  - Memoize particle views; keep their count bounded and modest.
  - iOS: ProMotion serves 120 Hz to native-driver animations automatically. Android: ensure the
    activity allows the highest refresh rate; the app does not throttle.
  - On 60 Hz devices the same animation simply runs at 60 FPS (graceful degradation) — the target is
    "≥120 FPS where the panel supports it," never a hard requirement to fabricate frames.
- **Alternatives considered**:
  - **react-native-reanimated** — excellent and worklet-based; deferred for v1 to avoid an extra
    dependency since native-driver `Animated` already runs off the JS thread. Documented as the
    fallback if profiling shows `Animated` cannot hold 120 FPS for the desired flame complexity.
  - **Skia / Lottie** — powerful but heavier; Lottie is great for canned animations but less suited
    to a flame that must scale continuously with strength. Rejected for v1.
- **Validation**: Profile with the device performance monitor / Perf Monitor; confirm UI-thread FPS
  stays at panel refresh while logging scores rapidly.

## R3 — Modern React Native + TypeScript practices

- **Decision**: Function components + hooks only; TS strict; small reusable components; derive state,
  don't duplicate it.
- **Rationale**: Matches constitution Principles I/IV and the user's "clean, reusable, modern,
  newbie-readable" directive.
- **Practices adopted**:
  - All UI state for the fire is **derived** from entries + today via the pure engine — single source
    of truth, no drift (directly satisfies FR-010/FR-011).
  - `React.memo` on `DayCell`; `useMemo` for the derived fire state and month grid; stable callbacks
    via `useCallback` to keep cell props referentially stable (perf, Principle V).
  - Styles via `StyleSheet.create` referencing `theme/tokens.ts` — no inline ad-hoc styles
    (Principle IV: single token source).
  - Header comments on every component/hook/function and plain-language inline comments on the streak
    + cumulative-sum logic (Principle II — hard project requirement).

## R4 — Static, offline, no external endpoints

- **Decision**: Zero runtime network access. The design fetch (Bonfire.html) is a **build-time / dev**
  step performed by the implementer, not shipped code.
- **Rationale**: Spec + user input both require a static offline app. All data is local; the fire is
  computed on-device.
- **Consequence**: No networking libraries, no telemetry, no remote config in the app bundle.

## R5 — Date / "missed day" boundary handling

- **Decision**: Use the device's local calendar date. A day is "missed" only once its local date has
  fully elapsed (i.e. it is strictly before today). Today, while unscored, is never a miss.
- **Rationale**: Directly encodes spec edge case "Today not yet scored" and FR-007/008. Centralized in
  `dates.ts` so the rule is defined once and unit-tested.
- **Note**: All date math uses local time; ISO `YYYY-MM-DD` keys are derived from local components to
  avoid UTC off-by-one. No time zones beyond the device local zone are in scope.
