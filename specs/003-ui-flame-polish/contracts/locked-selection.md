# Contract: Locked-Flame Selection Guard

**Modules**: `src/components/Settings/FlameRow.tsx`, `src/screens/BonfireScreen.tsx`

## Behavior

```ts
// FlameRow (UI layer)
onPress(row):
  if state.unlocked → call onPress(flame.id)        // unchanged equip path (FR-003)
  else              → DO NOT call onPress;           // FR-001
                      play brief rejection cue (~250ms shake/flash)  // FR-002

// BonfireScreen (defense in depth)
equip(id):
  if states[id]?.unlocked → setFlameStyle(id)
  else                    → no-op (never persists a locked equip)
```

## Accessibility

- Locked rows expose `accessibilityState={{ disabled: true }}` and a label that includes the
  locked status/requirement. Role stays `radio`; selected state unchanged for the active flame.

## Guarantees

1. No interaction path sets `settings.flameStyle` to a flame whose derived
   `AchievementState.unlocked` is `false` — covers never-unlocked, streak-voided, and
   window-expired states uniformly (SC-001).
2. Rejection is visible (animation cue), immediate, and introduces no dialog/screen.
3. Unlocked-flame equip behavior, the "equipped flame becomes locked → stays equipped, renders
   embered" rule, and `newlyUnlocked` celebration are all unchanged from feature 002.
4. Guard reads only derived state — nothing new is stored (002 derived-state invariant).

## Test hooks

- Regression (component): render gallery with a locked flame, fire press → `onEquip` NOT called
  (this test fails on current code — true regression test).
- Component: unlocked flame press → `onEquip` called with its id.
- Screen: equip wrapper ignores locked ids, persists unlocked ids.
