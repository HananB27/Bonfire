# Contract: Calendar Gesture Surfaces + Cog Target

**Modules**: `src/components/Calendar/CalendarSheet.tsx`, `src/components/Settings/SettingsSheet.tsx`

## Gesture surfaces (CalendarSheet)

| Surface | Direction | Activation | Effect |
|---------|-----------|------------|--------|
| Full-screen overlay (existing, kept) | up only | after ~12 px upward travel | open sheet (FR-009) |
| **Sheet body pan (new)** | down only | after ~12 px downward travel | close sheet + clear selected day (FR-010) |
| Header grab bar (existing, kept) | both | immediate | drag sheet |
| Scrim tap above open sheet (existing, kept) | — | tap | close sheet |

## Guarantees

1. Down-drag starting anywhere on the open sheet (month grid, picker bar, header) closes the
   calendar with the existing position+velocity snap rule.
2. Plain taps on `DayCell`, score buttons, Clear, and month-nav arrows still resolve as taps —
   the ~12 px activation threshold means no pan steals sub-threshold touches (FR-011).
   Deliberate exception (mirrored in the spec assumptions): the settings gear and dev pill sit
   above the gesture surface via zIndex, so touches starting on them never move the calendar.
3. Up-swipe while fully open and down-swipe while fully closed are no-ops (progress already
   clamped 0..1); no visual glitch.
4. `progress` stays the single shared 0→1 value owned by `BonfireScreen`; the flame lift/dim
   lock-step is untouched.
5. Closing via the new pan clears the selected day, same as the header pan today.

## Cog target (SettingsSheet)

1. Gear pressable is 52×52 pt (≥44 pt minimum touch target, FR-012), icon font size 26,
   `borderRadius` 26; position (`top: inset+6`, `right: 14`) and behavior (opens `FlameGallery`)
   unchanged.
2. Gear keeps `zIndex` above the full-screen gesture overlay so its taps always win.

## Test hooks

- Where jsdom allows: assert pan config (activation offsets) and that close path clears
  selection; otherwise covered by quickstart manual scenarios (gesture physics are not
  deterministically unit-testable).
- Cog: style assertion ≥44 pt; press still opens gallery.
