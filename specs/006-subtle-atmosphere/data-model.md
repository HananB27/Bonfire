# Data Model: Subtle Atmosphere

**Feature**: 006-subtle-atmosphere | **Date**: 2026-06-15

This feature does not persist data. All state is derived from the device’s current local date/time
and the app’s active/inactive state.

## Derived entities

### AtmosphericState

The current background mood for the bonfire scene.

| Field | Type | Notes |
|-------|------|-------|
| `phase` | `morning` \| `day` \| `dusk` \| `night` | Broad time-of-day bucket derived from local time |
| `brightness` | number | Lightweight normalized value used to choose light vs dark background tone |
| `warmth` | number | Small tint bias that keeps dawn cooler and dusk warmer |
| `seasonStrength` | number | Normalized annual influence used to stretch or compress the day/night feel |
| `hemisphere` | `north` \| `south` | Inferred from timezone/locale heuristic, or defaulted to `north` |
| `mode` | `focus` \| `open` | Indicates whether the state was refreshed because the app resumed or because a new date context was read |

### SeasonalCurve

The annual adjustment that shifts the atmosphere between summer-leaning and winter-leaning moods.

| Field | Type | Notes |
|-------|------|-------|
| `dayOfYear` | number | Local calendar day index used as the input signal |
| `hemisphereMultiplier` | `1` \| `-1` | Flips the curve for southern hemisphere behavior |
| `lightSpan` | number | Derived amount that lengthens or shortens the day feel |
| `nightSpan` | number | Derived amount that lengthens or shortens the night feel |

### TimeOfDayPhase

The coarse daily bucket used to keep the background readable in screenshots and cheap to compute.

| Phase | Meaning | Visual effect |
|-------|---------|---------------|
| `morning` | Early day | cooler, lighter sky with soft lift |
| `day` | Midday | brightest, calmest background |
| `dusk` | Evening transition | warmer, softened light |
| `night` | After dark | dark navy / near-black background |

### VisualBalance

The readability relationship between the atmosphere and the fixed bonfire UI.

| Rule | Effect |
|------|--------|
| Fire remains stable | Background changes must not alter the fire’s behavior or state |
| Panels stay separate | Calendar and settings surfaces keep their own stable contrast |
| Screenshot legibility | The current phase must be identifiable without motion |

## State transitions

1. The app becomes active.
2. The current local time/date is read.
3. Hemisphere is inferred from a lightweight region heuristic.
4. A seasonal curve and time-of-day phase are derived.
5. The background re-renders with the resulting atmospheric state.

## Validation rules

- The feature must not require persisted user preferences.
- The feature must not depend on continuous timers or per-frame calculations.
- The resulting atmospheric state must remain compatible with the current bonfire palette and
  existing layered UI.
