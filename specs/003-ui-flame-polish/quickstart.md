# Quickstart: UI & Flame Polish Fixes

**Feature**: 003-ui-flame-polish

## Prerequisites

- Node ≥ 22.11.0, deps installed (`npm install`)
- A device/simulator (Expo): `npx expo start` (dev build with Skia/Reanimated already configured
  from features 001/002)

## Automated validation

```bash
npm run lint   # zero errors (constitution gate)
npm test       # all suites green, including the new/updated ones:
               #   tokens.heat.test.ts      — ramp values, contrast, score-1 border
               #   palettes.test.ts         — withAlpha/darken/glow derivation
               #   FlameGallery.test.tsx    — locked-tap regression (equip rejected)
               #   BonfireScreen.test.tsx   — screen-level equip guard
```

The locked-tap test is a true regression test: it fails on pre-fix code (tapping a locked row
equipped it) and passes after.

## Manual scenarios (device/simulator)

Use the `__DEV__` "advance a day" pill to drive fire/unlock states. Contracts referenced:
[locked-selection](./contracts/locked-selection.md), [glow-derivation](./contracts/glow-derivation.md),
[score-heat-ramp](./contracts/score-heat-ramp.md), [gesture-surface](./contracts/gesture-surface.md).

1. **Locked flame rejected (P1)** — Open the gear gallery with a fresh calendar (most flames
   locked). Tap a locked flame: row shakes/flashes briefly, active flame unchanged, checkmark
   stays where it was. Tap an unlocked flame: equips normally. Expected: no locked equip ever
   persists (relaunch app — active flame still the unlocked one).
2. **Per-flame glow (P2)** — Unlock/equip two differently colored flames (or temporarily relax a
   condition in `src/domain/flames.ts`, the designed editing surface). Expected: halo, ground
   pool, hearth warm wash, and rising sparks recolor to each flame's palette; switching flames
   swaps the glow with no leftover orange; animation stays smooth (no frame drops vs. before).
3. **Score button colors (P3)** — Open the calendar, tap a day. Expected: buttons 1→5 are white,
   light yellow, yellow, orange, red; the white "1" has a visible outline; all labels legible;
   the selected score's ring is visible. Scored day cells use the same ramp.
4. **Whole-screen gestures (P4)** — Swipe up from screen center, lower half, and near the flame:
   calendar opens each time. With it open, swipe down starting on the month grid, on the picker
   bar, and on the header: it closes each time and the day picker resets. Plain taps on day
   cells/score buttons still work; up-swipe while open does nothing.
5. **Larger cog (P5)** — Gear in the top-right is visibly larger (52 pt); tapping anywhere on it
   opens the flame gallery.

## Expected outcomes

All five scenarios pass + `npm run lint` and `npm test` green = feature validated against
SC-001..SC-006 (FPS claim spot-checked via scenario 2's smoothness check; use the Expo perf
monitor if a before/after number is wanted, per constitution).
