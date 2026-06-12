# Tasks: UI & Flame Polish Fixes

**Input**: Design documents from `/specs/003-ui-flame-polish/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: INCLUDED — constitution Principle III (NON-NEGOTIABLE) requires unit tests for every
changed component/helper and a regression test for every bug fix. Test tasks precede their
implementation tasks (write → see fail → implement → see pass).

**Organization**: Tasks grouped by user story (US1–US5, priority P1–P5 from spec.md). Every story
is an independent, testable increment on the existing app. No new packages, no storage changes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1 = locked-selection guard, US2 = per-flame glow, US3 = heat ramp,
  US4 = whole-screen gestures, US5 = larger cog

## Path Conventions

Single Expo project at repository root: source in `src/`, tests in `__tests__/` (existing layout —
see plan.md Project Structure). All paths below are exact.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm a green baseline so every later checkpoint diff is attributable to this feature.

- [X] T001 Verify baseline is green before any edits: run `npm run lint` and `npm test` at the repository root; both must pass unchanged (constitution quality gates)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None required — this feature only amends existing files; all prerequisites (flame
catalog, achievement engine, `useFlames`, gesture/animation stack) shipped with features 001/002.

*(No foundational tasks. User stories can begin immediately after T001.)*

**Checkpoint**: Baseline green — all five user stories can start, in any order or in parallel
(note the shared-file constraints in Dependencies below).

---

## Phase 3: User Story 1 - Locked Flames Cannot Be Selected (Priority: P1) 🎯 MVP

**Goal**: Tapping a locked (embered) flame in the gallery never equips it; the row gives a brief
rejection cue; a screen-level guard makes the rule hold for any caller. Unlocked equip unchanged.
Contract: [contracts/locked-selection.md](./contracts/locked-selection.md)

**Independent Test**: With a fresh calendar (most flames locked), tap a locked flame in the
gallery → active flame unchanged + visible rejection; tap an unlocked flame → equips. Relaunch:
active flame is still the unlocked one.

### Tests for User Story 1 (write first, MUST fail on current code)

- [X] T002 [P] [US1] Add locked-tap regression tests to `__tests__/FlameGallery.test.tsx`: render gallery with a locked flame state, fire press on the locked row → `onEquip` NOT called, row exposes `accessibilityState.disabled: true`, AND the rejection cue renders (assert via a `testID` on the cue/animated wrapper so FR-002's visible feedback can't silently regress); press on an unlocked row → `onEquip` called with its id and no rejection cue shown. (Regression: the locked-row case fails before the fix because `FlameRow` currently equips any flame.)
- [X] T003 [P] [US1] Add screen-level guard tests to `__tests__/BonfireScreen.test.tsx`: equipping a locked flame id leaves `settings.flameStyle` unchanged (never persisted); equipping an unlocked id persists as before.

### Implementation for User Story 1

- [X] T004 [US1] Gate equip in `src/components/Settings/FlameRow.tsx`: on press of a locked row do NOT call `onPress(flame.id)`; instead play a ~250 ms Reanimated rejection cue (shake/flash on the row, with a `testID` on the cue wrapper so T002 can assert it); add `accessibilityState={{ disabled: true }}` and a "Locked — <requirement>" label suffix for locked rows; keep `radio` role, active checkmark, `justUnlocked` celebration, and unlocked-press behavior unchanged. Update the header comment (it currently documents "any flame, even locked" equipping). (Makes T002 pass.)
- [X] T005 [US1] Add defense-in-depth guard in `src/screens/BonfireScreen.tsx`: wrap `setFlameStyle` in a memoized handler that consults `states[id]?.unlocked` from `useFlames` and no-ops for locked ids; pass the wrapper to `SettingsSheet` as `onEquip`; comment why the double guard exists (FR-001 must hold for any future caller). (Makes T003 pass.)

**Checkpoint**: `npm test` green incl. T002/T003; US1 fully functional — locked equip impossible,
feedback visible, "equipped flame later becomes locked → stays equipped, renders embered" (002
behavior) untouched.

---

## Phase 4: User Story 2 - Each Flame Glows in Its Own Color (Priority: P2)

**Goal**: Halo, ground glow, hearth warm wash, and ember particles derive every color from the
active flame's `Palette` (via new pure helpers) instead of hardcoded warm-orange RGBA stops.
Contract: [contracts/glow-derivation.md](./contracts/glow-derivation.md)

**Independent Test**: Equip two differently colored flames; halo/ground pool/hearth wash/sparks
recolor to each flame's palette with no leftover orange; default Amber flame looks unchanged;
animation smoothness unchanged.

### Tests for User Story 2 (write first, MUST fail on current code)

- [X] T006 [P] [US2] Extend `__tests__/palettes.test.ts` with cases for the new helpers: `withAlpha('#ff7a18', 0.5) === 'rgba(255,122,24,0.5)'`; `withAlpha(x, 0)` ends in `,0)`; `darken` channel math + 0..255 clamping; malformed-hex → black fallback (matches `parseHex` behavior, never throws); two contrasting palettes produce different derived glow stop sets; embered palette in → embered-tinted stops out; a near-black palette still yields its own (subtle) derived stops with no fallback to default-orange values (spec edge case: very dark/light palettes).

### Implementation for User Story 2

- [X] T007 [US2] Add pure color helpers to `src/theme/palettes.ts`: `withAlpha(hex, alpha): string` (`#rrggbb` → `rgba(r,g,b,a)`) and `darken(hex, factor): string` (channel multiply, clamped), with beginner-readable header comments; reuse the existing `parseHex` (do not duplicate parsing). (Makes T006 pass.)
- [X] T008 [US2] Derive scene glow from the palette in `src/components/Bonfire/Flame.tsx`: replace ground-glow stops with `[withAlpha(amber,0.55), withAlpha(ember,0.22), withAlpha(ember,0)]`, halo stops with `[withAlpha(amber,0.40), withAlpha(ember,0.16), withAlpha(ember,0)]`, hardcoded `#7a1f06`/`#b3380f` deep tongue stops with `darken(red,0.55)`/`darken(red,0.8)`, and the fixed tongue-tip/base rgba fades with `withAlpha(gold|amber|ember, …)` equivalents; wrap all derived arrays in `useMemo` keyed on `palette` (recompute on flame switch only — never per frame, SC-005); update the affected block comments.
- [X] T009 [P] [US2] Per-particle fade color in `src/components/Bonfire/Embers.tsx`: replace the fixed `'rgba(255,120,20,0)'` outer radial stop with `withAlpha(color, 0)` (each particle's own color, transparent); update the comment.
- [X] T010 [US2] Palette-drive the hearth in `src/components/Bonfire/Hearth.tsx` + `src/screens/BonfireScreen.tsx`: add a required `palette: Palette` prop to `Hearth`; warm wash `rgba(255,150,50,0.5)` → `withAlpha(palette.ember, 0.5)`, coal fill/shadow from global `core`/`ember` tokens → `palette.core`/`palette.ember` (move the affected static styles to palette-derived inline styles, memoized); in `BonfireScreen` pass the existing `effectivePalette` to `<Hearth …/>` so embered dimming flows through; update both headers/comments.

**Checkpoint**: `npm test` green; no hardcoded warm-color literal remains on the surrounding-light
path; default Amber flame visually equivalent (alphas/factors reproduce old constants); manual
flame-switch shows per-flame glow at full smoothness.

---

## Phase 5: User Story 3 - Score Buttons Colored by Intensity (Priority: P3)

**Goal**: Heat ramp redefined at the single token source: 1 = white, 2 = light yellow, 3 = yellow,
4 = orange, 5 = red; legible text on every button; white "1" gets an outline; day cells inherit the
same ramp. Contract: [contracts/score-heat-ramp.md](./contracts/score-heat-ramp.md)

**Independent Test**: Open calendar, tap a day → five buttons show white/light-yellow/yellow/
orange/red with readable labels; white "1" outlined; selected ring visible; scored day cells use
the same colors.

### Tests for User Story 3 (write first, MUST fail on current code)

- [X] T011 [P] [US3] Create `__tests__/tokens.heat.test.ts`: assert exact new values `heat1 === '#ffffff'` … `heat5` (red) and `HEAT` ordering; `heatStyle(n).color` has ≥4.5:1 contrast vs `background` for n=1..5 (compute relative luminance in the test); `heatStyle(1).border` defined, `heatStyle(2..5).border` undefined; `glow` still present for scores 4–5 only; plus a `DayCell` render assertion (scored day with score 1 renders `heatStyle(1).border` as its outline) so the cell-side application of the border is covered, not just the token.

### Implementation for User Story 3

- [X] T012 [US3] Redefine the ramp in `src/theme/tokens.ts`: `heat1 #ffffff`, `heat2 #fff3c4`, `heat3 #ffd23b`, `heat4 #ff9a2e`, `heat5 #c4310f` (NOT brighter reds like `#e8401c` — they fail the ≥4.5:1 contrast guarantee with both text options; `#c4310f` + `#fff2e8` ≈ 5.0:1); extend `heatStyle()` return with optional `border` = `rgba(59,53,39,0.45)` for score 1 only (dark warm hairline for the white button — value lives in tokens.ts, never hardcoded in components) and update text colors (dark for 1–4: `#3b3527`/`#3a3008`/`#3a2a04`/`#3a1c04`; light for 5: `#fff2e8`); keep `glow` for 4–5; update the heat-ramp comments. (Makes T011 pass.)
- [X] T013 [P] [US3] Apply `border` + active-ring fix in `src/components/Calendar/ScorePickerBar.tsx`: render `heatStyle(n).border` as `borderColor` when defined; strengthen/darken the active-state ring (currently `#fff4cf`) so the selected score stays distinguishable against the new light backgrounds (FR-008, acceptance 3).
- [X] T014 [P] [US3] Apply `border` on scored cells in `src/components/Calendar/DayCell.tsx`: when `heatStyle(score).border` is defined, render it as the cell outline so a white "1" day remains visible; no other day-cell behavior changes (ramp itself flows in via tokens automatically).

**Checkpoint**: `npm test` green; buttons and day cells share the new ramp from one token source
(Principle IV); all five backgrounds pairwise distinct (SC-003).

---

## Phase 6: User Story 4 - Calendar Swipes Open and Closed from Anywhere (Priority: P4)

**Goal**: Keep the existing full-screen up-only open pan; add a down-only pan over the open
sheet's body so a downward drag anywhere on the calendar dismisses it, without breaking day-cell
taps, score buttons, or month-nav. Contract: [contracts/gesture-surface.md](./contracts/gesture-surface.md)

**Independent Test**: Swipe up from center / lower half / near the flame → calendar opens each
time. With it open, swipe down starting on the month grid, picker bar, and header → closes each
time and the selected day clears; plain taps inside still work; up-swipe while open is a no-op.

### Implementation for User Story 4

- [X] T015 [US4] Add the down-only sheet-body pan in `src/components/Calendar/CalendarSheet.tsx`: create `sheetPan = makePan().activeOffsetY([-9999, 12])` (activates only after ~12 px DOWNWARD travel — mirror image of the existing up-only overlay pan) and wrap the sheet's content `Animated.View` in a `GestureDetector` for it; reuse the existing snap rule and clear `selected` on close (the `makePan` onEnd already does both); keep header pan, scrim tap, and the full-screen up-pan untouched; extend the file's interaction header comment with the new surface and why the 12 px threshold preserves taps (FR-011). NOTE: `MonthGrid` has no ScrollView — no scroll conflict to negotiate.

### Tests for User Story 4 (config-level; gesture physics validated via quickstart)

- [X] T016 [US4] Extend `__tests__/BonfireScreen.test.tsx` (or `FlameGallery.test.tsx`-style component test on `CalendarSheet` if simpler): assert the open sheet renders its body inside a gesture detector and that the close path resets the selected day (tap-to-close already exercisable in jsdom); document in the test why pan activation offsets aren't unit-asserted (not deterministically testable in jsdom — covered by quickstart scenario 4).

**Checkpoint**: `npm test` green; manual quickstart scenario 4 passes on device; `progress`
remains the single shared 0→1 value (flame lift/dim lock-step untouched).

---

## Phase 7: User Story 5 - Larger Settings Cog (Priority: P5)

**Goal**: Gear grows 38×38 → 52×52 pt (icon 18 → 26, `borderRadius` 26) — visibly larger and
comfortably above the 44 pt minimum touch target; behavior unchanged.
Contract: [contracts/gesture-surface.md](./contracts/gesture-surface.md) (Cog target section)

**Independent Test**: Gear in the top-right is visibly larger; tapping anywhere on it opens the
flame gallery; it still wins touches over the full-screen swipe surface.

### Tests for User Story 5

- [X] T017 [P] [US5] Add gear assertions to `__tests__/BonfireScreen.test.tsx`: gear pressable style resolves to ≥44 pt width/height (assert 52); pressing it still opens the flame gallery.

### Implementation for User Story 5

- [X] T018 [P] [US5] Enlarge the gear in `src/components/Settings/SettingsSheet.tsx`: `gear` style `width/height 38 → 52`, `borderRadius 19 → 26`, `gearIcon` `fontSize 18 → 26`; keep position (`top: top + 6`, `right: 14`), `zIndex: 58` (above the swipe overlay), accessibility label, and pressed-scale feedback unchanged. (Makes T017 pass.)

**Checkpoint**: All five stories functional and individually verifiable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Constitution gates + end-to-end validation across all stories.

- [X] T019 Sweep for stale comments and dead constants across all touched files (`src/theme/tokens.ts`, `src/theme/palettes.ts`, `src/components/Bonfire/{Flame,Embers,Hearth}.tsx`, `src/components/Calendar/{CalendarSheet,ScorePickerBar,DayCell}.tsx`, `src/components/Settings/{SettingsSheet,FlameRow}.tsx`, `src/screens/BonfireScreen.tsx`): every comment matches the new behavior (Principle II — stale comments are bugs); remove any now-unused color constants/imports (Principle I — no dead code)
- [ ] T020 (automated gates DONE: lint zero errors, 117 tests green, tsc clean — device/simulator quickstart scenarios 1–5 + SC-005 FPS spot-check still to run manually) Final gates + manual validation: `npm run lint` (zero errors) and `npm test` (all green) at repository root, then execute all five manual scenarios in `specs/003-ui-flame-polish/quickstart.md` on a device/simulator, including the flame-switch smoothness spot-check (SC-005, ≥120 FPS path)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 first — establishes the green baseline.
- **Foundational (Phase 2)**: empty — nothing blocks the stories.
- **User Stories (Phases 3–7)**: all independent of each other; any order or parallel. Priority
  order P1→P5 recommended for solo work.
- **Polish (Phase 8)**: after all desired stories; T019 → T020.

### Shared-file constraints (the only cross-story coupling)

- `src/screens/BonfireScreen.tsx` is edited by **US1 (T005)** and **US2 (T010)** — sequence these
  two tasks (either order); the stories remain logically independent.
- `__tests__/BonfireScreen.test.tsx` is touched by **T003 (US1)**, **T016 (US4)**, **T017 (US5)**
  — sequence the edits to that file.

### Within Each User Story

- Test tasks first; confirm they FAIL; then implementation; confirm they PASS.
- US2 internal order: T007 (helpers) blocks T008/T009/T010; T008/T009 parallel; T010 after T007.
- US3 internal order: T012 (tokens) blocks T013/T014; T013/T014 parallel.
- US4 internal order: T015 before T016.

### Parallel Opportunities

- All first-wave test tasks across stories: T002, T003*, T006, T011 (different files; *T003 shares
  a file with later T016/T017 — fine, they come later).
- After T007: T008 + T009 in parallel (different files).
- After T012: T013 + T014 in parallel.
- T018 parallel with anything except T017's file edits.
- Different stories by different developers: US3 and US5 never collide with anything; US1/US2
  only meet at `BonfireScreen.tsx`.

---

## Parallel Example: User Story 2

```bash
# Wave 1 — failing tests:
Task: "Extend __tests__/palettes.test.ts with withAlpha/darken/glow-derivation cases" (T006)

# Wave 2 — helpers:
Task: "Add withAlpha/darken to src/theme/palettes.ts" (T007)

# Wave 3 — consumers in parallel (different files):
Task: "Palette-derived glow stops in src/components/Bonfire/Flame.tsx" (T008)
Task: "Per-particle fade color in src/components/Bonfire/Embers.tsx" (T009)
# then:
Task: "Hearth palette prop + BonfireScreen wiring" (T010)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. T001 baseline → Phase 3 (T002–T005).
2. **STOP and VALIDATE**: locked equip impossible, feedback visible, tests green.
3. This alone fixes the integrity bug — shippable increment.

### Incremental Delivery

1. US1 (integrity fix, MVP) → validate → ship
2. US2 (per-flame glow) → validate → ship
3. US3 (heat ramp) → validate → ship
4. US4 (gestures) → validate on device → ship
5. US5 (cog) → validate → ship
6. Phase 8 polish + full quickstart run before final merge

Each story leaves all previous stories' tests green; checkpoints are safe stopping points.

---

## Notes

- 20 tasks total; no new packages, no new components, no storage/migration work — hence the
  near-empty Setup/Foundational phases.
- Constitution gates apply to every checkpoint: lint zero errors, tests green, comments updated
  with the code they describe, no dead code.
- Gesture activation physics (T015) are intentionally validated manually (quickstart scenario 4);
  jsdom cannot drive gesture-handler pans deterministically.
