# Data Model: Fire Health

**Feature**: 007-fire-health | **Date**: 2026-06-18

Fire Health is derived from existing score history and is never stored separately. The model exists
to keep the state logic explicit, testable, and easy to extend without touching the fire engine.

## Derived entities

### FireHealthWindow

The bounded set of recent score entries used to judge health.

| Field | Type | Notes |
|-------|------|-------|
| `samples` | array of score samples | The latest 7 scored days, newest first |
| `sampleCount` | number | Number of scored days available in the window |
| `windowSize` | number | Fixed at 7 |
| `hasEnoughHistory` | boolean | True when the window is large enough to avoid a noisy default |

### FireHealthSample

A scored day inside the health window.

| Field | Type | Notes |
|-------|------|-------|
| `date` | date key | Existing calendar key from score history |
| `score` | 1..5 | Existing productivity score |
| `weight` | number | Newest sample has the highest weight |
| `quality` | number | Normalized contribution used by the health index |

### FireHealthState

The visible health state exposed to the flame scene.

| Field | Type | Notes |
|-------|------|-------|
| `name` | `faint` \| `steady` \| `bright` \| `radiant` | Canonical machine-friendly state |
| `label` | `Faint` \| `Steady` \| `Bright` \| `Radiant` | User-facing capitalized label |
| `qualityIndex` | number | Weighted score-quality signal used for thresholds |
| `visible` | boolean | False when the fire is not lit, so the state never implies gameplay state |
| `visualWeight` | number | Small numeric modifier passed to the flame renderer |

### FireHealthVisualModifiers

The minimal set of visual changes the flame scene needs to express the state.

| Field | Type | Notes |
|-------|------|-------|
| `glow` | number | Adjusts halo intensity |
| `warmth` | number | Shifts the scene toward warmer or cooler appearance |
| `energy` | number | Controls how lively or subdued the flame feels |
| `density` | number | Controls how dense the visible flame/ember presentation feels |
| `captionTone` | token | Ensures the named label stays readable at every state |

## State transitions

1. Read the existing score history.
2. Sort scored days so the newest scores are first.
3. Keep only the latest 7 scored days.
4. Compute a weighted quality index with newer scores contributing more.
5. Map the weighted index into one of the four named states.
6. If the sample is too small, use Steady as the neutral default.
7. If the fire is not lit, the state remains derived but is not shown as healthy flame behavior.

## Validation rules

- The helper must not modify score history, fire strength, or unlock results.
- The helper must be deterministic for a given score map.
- The health state must always resolve to exactly one canonical label.
- The rendered state must not appear when the fire is unlit or out.
- The health model must be bounded enough to stay cheap on every score update.
