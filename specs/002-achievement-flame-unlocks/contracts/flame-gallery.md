# Contract: Flame Gallery + Full-Screen Swipe (`src/components/Settings/*`, `useFlames`, `CalendarSheet`)

UI contract for browsing/equipping flames and the status-bar-shade calendar pull. Uses only existing
packages (core RN `Modal`/`ScrollView`/`Pressable`, expo-linear-gradient, gesture-handler, Reanimated).

## `useFlames` hook (`src/hooks/useFlames.ts`) — the single derived-state junction

```ts
export interface UseFlames {
  states: Record<FlameId, AchievementState>;   // memoized on (entries, today, fire.state, fire.strength)
  activeStyle: FlameStyle;                      // from settings.flameStyle (flameById)
  activeUnlocked: boolean;
  effectivePalette: Palette;                    // activeUnlocked ? palette : embered
  dim: number;                                  // activeUnlocked ? 1 : EMBERED_DIM
}
export function useFlames(entries: Entries, today: DateKey, fire: FireState, flameStyleId: FlameId): UseFlames;
```

- **Performance (R9, SC-010)**: the `evaluateAll` call is wrapped in `useMemo` keyed on
  `(entries, today, fire.state, fire.strength)`. It MUST NOT run inside Skia render or any per-frame
  worklet. Switching `flameStyleId` only re-selects `activeStyle`/palette — no re-walk needed for the
  same `(entries,today,fire)`.

## `FlameGallery.tsx` (opened by the settings gear)

- Lazy `Modal` (mounted only when open) containing a `ScrollView` of `FlameRow`s grouped by tier
  (Base → Streak → Time), catalog order (rarity ascending).
- Tapping a row calls `onEquip(id)` (any flame, locked or not — FR-012) and closes.
- The currently active flame is marked (✓). Accessibility: each row `accessibilityRole="radio"`,
  `accessibilityState={{selected}}`, label = name + lock/progress summary.

### `FlameRow.tsx` — one row, driven by `FlameStyle` + its `AchievementState`

| State | Shows |
|-------|-------|
| unlocked | gradient swatch (full), name, ✓ if active, "Unlocked" (time: "· Nd left") (FR-016/018) |
| locked, streak | gradient swatch (embered), name, requirement text, progress `value/target` bar (FR-017/018) |
| locked, time, never earned | embered swatch, name, requirement, partial progress |
| locked, time, expired | embered swatch, name, "Expired — re-earn: <requirement>" (FR-018) |

- Swatch = `expo-linear-gradient` over `flame.gradient` (full) or `embered` stops.
- Equipping a locked flame is allowed; the on-screen fire then shows the embered variant (FR-014, US6).

### Tests (`FlameGallery.test.tsx`)

- Default state: only `amber` shows unlocked/equippable; all others locked with requirement (US1.3).
- A locked streak flame at run 4/7 shows progress "4/7" (US4.2).
- An unlocked time flame shows "Nd left" (US4.3); expired shows re-earn prompt (US4.4).
- Equipping a locked flame → `onEquip` fires; screen renders embered palette (US6.1).

## Full-screen swipe-to-open (`CalendarSheet.tsx`, closed state)

- Add a full-screen `Gesture.Pan` overlay (z below the gear/dev pill; `pointerEvents="box-none"`) with
  `activeOffsetY([-12, 9999])` so it activates **only** on upward drag, driving the existing `progress`
  shared value (closed 0 → open 1). Same `onUpdate`/`onEnd` snap logic as today's handle pan.
- The visible bottom handle remains as the affordance and still works.
- **Tap pass-through**: because the Pan needs vertical movement to activate, a tap (gear, dev pill, a
  day cell) is unaffected. Horizontal drags don't activate it.
- When open, the existing scrim-tap / header-drag close gestures are unchanged.

### Behavior checks (manual, in quickstart)

- Swipe up starting **anywhere** on the closed screen opens the calendar (status-bar-shade feel).
- Tapping the gear (no drag) opens settings, does NOT open the calendar.
- Flame lifts/dims in lock-step via the shared `progress` (unchanged wiring).
