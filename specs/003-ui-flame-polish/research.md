# Research: UI & Flame Polish Fixes

**Feature**: 003-ui-flame-polish | **Date**: 2026-06-12

No NEEDS CLARIFICATION markers remained in the Technical Context — the stack is fully inherited
from features 001/002. Research below records the design decisions for each fix, with rationale
and rejected alternatives, grounded in the current code.

## R1. Locked-flame selection guard (P1)

**Decision**: Reject equip at the gallery row, with defense-in-depth at the screen.

- `FlameRow` receives the derived `AchievementState` already; on press of a **locked** row it
  does NOT call `onPress(flame.id)` — instead it plays a brief rejection cue (Reanimated shake /
  flash on the row, ~250 ms) and keeps `accessibilityState={{ disabled: true }}` plus an
  accessibility label suffix ("Locked — <requirement>").
- `BonfireScreen` wraps `setFlameStyle` in a guard that consults `states[id].unlocked` before
  persisting, so no other caller (current or future) can equip a locked flame.

**Rationale**: The unlock state is *derived* (feature 002 invariant) and already flows into both
the gallery and the screen — no new state or storage. Row-level rejection gives the immediate
feedback FR-002 requires; the screen-level guard makes FR-001 hold even if a UI path is added
later. The previously-equipped-then-locked flame keeps its existing "equipped but embered"
behavior — equipping is what's gated, not staying equipped.

**Alternatives considered**:
- *Disable via `Pressable disabled`*: kills all press feedback — user gets silence, violating
  FR-002 ("visibly rejected rather than silently ignored"). Rejected.
- *Guard only in `settingsStore`*: the store has no access to derived achievement states (and
  must not — derived state is computed in hooks from entries). Rejected as an inversion of the
  002 architecture.
- *Hide locked flames*: contradicts 002's embered-preview design and the spec assumption that
  locked flames stay visible. Rejected.

## R2. Palette-derived glow and particles (P2)

**Decision**: Add two pure color helpers to `palettes.ts` and replace every hardcoded warm-orange
stop in the fire scene with palette-derived colors.

- `withAlpha(hex: string, alpha: number): string` → `rgba(r,g,b,a)` from a `#rrggbb` stop.
- `darken(hex: string, factor: number): string` → channel-multiplied darker variant.
- A small derivation (pure, unit-testable) maps a `Palette` to the scene's glow stops, e.g.:
  - ground glow: `[withAlpha(amber, 0.55), withAlpha(ember, 0.22), withAlpha(ember, 0)]`
  - halo: `[withAlpha(amber, 0.40), withAlpha(ember, 0.16), withAlpha(ember, 0)]`
  - tongue-base deep stops: `darken(red, 0.55)` / `darken(red, 0.8)` replace `#7a1f06`/`#b3380f`
  - tongue tip fades: `withAlpha(gold|amber, …)` replace fixed `rgba(255,…)` fades
- `Embers.tsx`: each particle's radial gradient outer stop becomes `withAlpha(color, 0)` (its own
  color, transparent) instead of the fixed `rgba(255,120,20,0)`.
- `Hearth.tsx`: gains a `palette` prop; warm wash `rgba(255,150,50,0.5)` → `withAlpha(ember, 0.5)`,
  coal fill/shadow `core`/`ember` tokens → `palette.core`/`palette.ember`. `BonfireScreen` passes
  the same `effectivePalette` it already gives Flame/Embers (so locked/embered dimming carries
  through automatically).
- All derived color arrays are wrapped in `useMemo` keyed on the palette object, so they recompute
  only on flame switch — zero per-frame cost, preserving the ≥120 FPS path (SC-005).

**Rationale**: The flame tongues already consume the palette; only the *surroundings* (halo,
ground glow, hearth wash, particle fade) were left hardcoded — exactly the user's complaint.
Deriving from the existing 5-stop `Palette` needs no catalog changes: every flame in
`flames.ts` already authors a full gradient that `paletteFromGradient` samples. Alpha-composited
versions of the flame's own `amber`/`ember`/`gold` stops reproduce the current warm look exactly
for the default Amber flame (regression-safe) while following any other palette.

**Alternatives considered**:
- *Add explicit per-flame glow fields to the catalog*: more author control, but bloats the catalog
  schema for 100% derivable data and forces editing every flame entry. Rejected (spec assumption
  already prefers derivation; can be added later if a flame needs an override).
- *Skia `ColorMatrix` hue-rotation of the existing orange glow*: clever but unreadable
  (Principle II) and wrong for desaturated/embered palettes. Rejected.

## R3. Score heat ramp white→red (P3)

**Decision**: Redefine the five `heat*` tokens in `tokens.ts` and adapt `heatStyle()`:

| Score | Token | New color | Text color | Notes |
|-------|-------|-----------|------------|-------|
| 1 | `heat1` | `#ffffff` (white) | dark `#3b3527` | gets a visible hairline outline so it reads on light surfaces |
| 2 | `heat2` | `#fff3c4` (light yellow) | dark `#3a3008` | |
| 3 | `heat3` | `#ffd23b` (yellow) | dark `#3a2a04` | |
| 4 | `heat4` | `#ff9a2e` (orange) | dark `#3a1c04` | keeps existing warm glow |
| 5 | `heat5` | `#c4310f` (red) | light `#fff2e8` | dark text fails contrast on red; light text instead; keeps glow. `#c4310f` + `#fff2e8` ≈ 5.0:1 (the brighter `#e8401c` was rejected — only ~3.6:1 with either text color, failing the ≥4.5:1 guarantee) |

`heatStyle(score)` returns `{ background, color, glow, border? }` — the new optional `border`
carries the score-1 outline (`rgba(59,53,39,0.45)`, a dark warm hairline that reads on the white
fill) so both `ScorePickerBar` and `DayCell` apply it consistently from the one token source.
`ScorePickerBar`'s active-state ring (`#fff4cf`) is darkened/strengthened so it remains visible
against the new light backgrounds.

**Rationale**: Both the picker buttons and scored day cells read `heatStyle`/`HEAT` from the
single token source (Principle IV) — changing the tokens once recolors both surfaces coherently;
divergent ramps (light-button picker vs old dark-red cells) would read as two products. Text
colors are picked for ≥4.5:1 contrast against each background.

**Alternatives considered**:
- *Recolor only the picker buttons, leave day cells on the old ramp*: violates Principle IV
  (consistency) and would make a "white 1" button log a dark-brown "1" cell. Rejected.
- *Derive ramp from the active flame palette*: spec fixes the exact colors (white→red),
  independent of flame. Rejected.

## R4. Whole-screen calendar gestures (P4)

**Decision**: Keep the existing full-screen **up-only** pan (`activeOffsetY([-12, 9999])`) for
opening; add a **down-only** pan (`activeOffsetY([12])` — activates after ~12 px of downward
travel, never upward) attached to the open sheet's body container in `CalendarSheet`, reusing the
same `makePan()` math and snap rules. The header grab-bar pan and scrim-tap-to-close stay.

- Activation threshold (12 px) means plain taps on `DayCell`/`ScorePickerBar` pressables never
  trigger it — taps resolve before the pan activates (same proven pattern as the up-pan vs. gear).
- `MonthGrid` contains no ScrollView/FlatList (fixed month grid), so there is no vertical-scroll
  conflict inside the sheet; nothing to negotiate with `simultaneousWithExternalGesture`.
- Closing mid-gesture snaps via the existing position+velocity rule and clears the selected day,
  exactly like the header pan today.

**Rationale**: Smallest change that completes the symmetry FR-009/FR-010 ask for: open-from-
anywhere already ships (002's FR-025); only dismiss-from-anywhere is missing. Direction-restricted
activation is the established conflict-resolution idiom already used and commented in this file.

**Alternatives considered**:
- *One bidirectional full-screen pan overlay above everything*: would sit over the sheet and
  intercept day-cell taps, or require gesture-handler hit-test gymnastics. Rejected.
- *`react-native-gesture-handler` ScrollView wrapper with snap points (bottom-sheet style)*:
  re-architecture of a working sheet for no user-visible gain. Rejected.

## R5. Larger settings cog (P5)

**Decision**: Grow the gear `Pressable` from 38×38 → **52×52** (`borderRadius` 26), icon font
size 18 → **26**. Position offset stays `top: inset + 6`, `right: 14`.

**Rationale**: 52 pt comfortably exceeds the 44 pt minimum target (constitution Principle IV;
spec FR-012) and is a visible size jump (user's actual complaint) without colliding with the
dev pill at `left: 14`. Behavior (opens `FlameGallery`) untouched.

**Alternatives considered**:
- *Keep 38×38 visual + add `hitSlop`*: satisfies the touch target but not the spec — the user
  asked for a *visibly larger* cog (acceptance scenario checks visual size). Rejected as the only
  measure; the larger visual size alone already provides the bigger target.
