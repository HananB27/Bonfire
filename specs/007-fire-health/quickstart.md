# Quickstart: Fire Health

**Feature**: 007-fire-health

## Prerequisites

- Dependencies installed with `npm install`
- Existing Expo app setup working locally

## Automated validation

```bash
npm run lint
npm test
```

Expected outcome:

- lint passes with zero errors
- tests cover the weighted score window, state thresholds, default fallback, and render wiring
- no measurable regression in the flame scene path

## Manual validation

Use the calendar to create or inspect representative score histories, then verify the flame scene:

1. **Weak recent scores** - Build a history of mostly 1s and 2s. The fire should read as Faint or
   Steady and feel subdued rather than strong.
2. **Mixed recent scores** - Build a history with improving scores over the latest 7 scored days.
   The fire should move toward Steady or Bright as quality improves.
3. **Strong recent scores** - Build a history of mostly 4s and 5s. The fire should read as Bright
   or Radiant and feel warmer and more vivid.
4. **Sparse history** - Use a history with too few scored days. The fire should stay on the neutral
   Steady fallback instead of jumping to a misleading extreme.
5. **Out fire check** - Trigger the existing out state. Fire Health must not present the fire as
   healthy while the underlying fire is not lit.

## Notes

- The feature should use existing packages and the current flame scene, not a new runtime stack.
- Fire Health is derived data only; it should never be stored separately.
- If a change causes the flame scene to feel slower or heavier, the implementation should be
  simplified before merge.
