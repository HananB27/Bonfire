---
description: "Task list for Bonfire Productivity Tracker — Expo, design-faithful (BonfireDesign/)"
---

# Tasks: Bonfire Productivity Tracker

**Input**: Design documents from `specs/001-bonfire-productivity-tracker/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md, and the
canonical design in `BonfireDesign/` (code + `screenshots/`).

**Tests**: INCLUDED — Constitution Principle III (Testing Standards) is NON-NEGOTIABLE.

**Organization**: Grouped by user story. Priority order: US1 (P1) → US4 (P2, swipe) → US2 (P2, streak)
→ US3 (P3, backfill) → US5 (P4, color).

> **Note**: This list supersedes the previous (bare-RN) tasks. It migrates to **Expo**, replaces the
> `Animated`-View flame with a **Skia** flame, and replaces the always-visible calendar with a
> **swipe-up sheet**, to match `BonfireDesign/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3 / US4 / US5 (maps to spec.md)
- Exact file paths included.

## Path Conventions

Single Expo app at repo root: `App.tsx`, `index.ts`, `app.config.ts`, `src/`, `__tests__/`.

---

## Phase 1: Setup (Expo + native dependencies)

**Purpose**: Move to Expo and install the design-fidelity stack.

- [X] T001 Migrate the project to Expo: add `expo`, create `app.config.ts`/`app.json` (name "Bonfire", portrait, dark, plugins for reanimated + gesture-handler + skia) and `index.ts` using `registerRootComponent`; align RN/React versions to the chosen Expo SDK (research.md R1)
- [X] T002 Install deps via `npx expo install @shopify/react-native-skia react-native-reanimated react-native-gesture-handler expo-linear-gradient @react-native-async-storage/async-storage react-native-safe-area-context`; record in package.json
- [X] T003 Add `react-native-reanimated/plugin` (must be last) to `babel.config.js`
- [X] T004 [P] Switch Jest to `jest-expo` in `jest.config.js`; in `jest.setup.js` mock Skia, Reanimated (its bundled mock), gesture-handler, and AsyncStorage; confirm `npm test` + `npm run lint` run clean
- [X] T005 [P] Wrap the root in `GestureHandlerRootView` + `SafeAreaProvider` with a dark `StatusBar` in `App.tsx`
- [X] T006 [P] Retire superseded bare-RN components from the prior build (`src/components/Bonfire/Flame.tsx` Animated version, `src/components/Calendar/CalendarMonth.tsx`) — delete or replace as the new components land

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Design reference, theme, pure engine, models, persistence — required by ALL stories.

**⚠️ CRITICAL**: No user story work begins until this phase is complete.

> **Existing code note**: `src/domain/dates.ts`, `src/domain/fire.ts`, `src/data/entriesStore.ts`,
> `src/hooks/useEntries.ts` and their tests already exist from the prior (bare-RN) build. The tasks
> below **adapt/rewrite** them, not greenfield. In particular T013 renames `FireState.status → state`
> and adds `everLit`/`label`/`classifyDay`/`fireLabel`; that rename ripples to `useEntries`,
> `BonfireScreen`, and the tests, which must be updated in the same pass.

- [X] T007 **DESIGN MUST DO**: Read `BonfireDesign/{Bonfire.html,styles.css,fire.jsx,calendar.jsx,app.jsx,logic.js}` and `BonfireDesign/screenshots/*` and keep them open as the reference for all UI tasks (plan.md → Design Source MUST DO)
- [X] T008 [P] Port `styles.css :root` tokens into `src/theme/tokens.ts` (bg, ink, heat1–5, sheet, line), commented (Principle II)
- [X] T009 [P] Port the three flame palettes from `app.jsx` into `src/theme/palettes.ts` (Amber/Crimson/Sapphire = ember/amber/gold/core/red)
- [X] T010 [P] Define domain types in `src/domain/fire.ts` (`Score`, `Entries`, `FireState { state, strength, everLit, label }`, `DayKind`) per data-model.md + contracts/fire-engine.md
- [X] T011 [P] Implement local-date helpers in `src/domain/dates.ts` (`ymd`, `parseYmd`, `addDays`, `diffDays`, `monthGrid`), commented
- [X] T012 Write `__tests__/dates.test.ts` (today-not-missed boundary, month grid) and make it pass
- [X] T013 Adapt/rewrite the pure engine in `src/domain/fire.ts` to mirror `BonfireDesign/logic.js` (`contribution`, `computeFire`, `classifyDay`, `fireLabel`); rename `FireState.status → state`, add `everLit` + `label`, and update all consumers (`useEntries`, `BonfireScreen`, tests) for the rename; heavily commented (FR-005–FR-010)
- [X] T014 Write `__tests__/fire.test.ts` — exhaustive oracle from `BonfireDesign/logic.js` (unlit/lit/out, 1-relight, 2-miss extinguish, backfill, order-independence) and make it pass
- [X] T015 [P] Implement pure `src/components/Bonfire/flameModel.ts` (`intensity = 1 − e^(−s/14)`, height/glow/bright/emberRate) per contracts/flame-and-theme.md
- [X] T016 [P] Write `__tests__/flameModel.test.ts` (intensity(0)=0, strictly increasing, monotonic height) and make it pass
- [X] T017 [P] Implement `src/data/entriesStore.ts` (date→score, never-throw load) and `src/data/settingsStore.ts` (flameColor, default Amber) per contracts
- [X] T018 [P] Write `__tests__/entriesStore.test.ts` + `__tests__/settingsStore.test.ts` (round-trip, defaults, corrupt→default) and make them pass
- [X] T019 Implement `src/hooks/useEntries.ts` (load on mount, `setScore` rejecting range/future, `clearScore`, memoized `fire`, `ready`)
- [X] T020 [P] Implement `src/hooks/useSettings.ts` (load, `setFlameColor`, `ready`)

**Checkpoint**: Theme, engine, models, and persistence ready.

---

## Phase 3: User Story 1 - Light and grow the fire (Priority: P1) 🎯 MVP

**Goal**: Full-screen Skia flame that ignites and grows as the user logs today's 1–5 score; looks like
the design.

**Independent Test**: Open app → flame; reveal calendar → tap today → pick 5 → flame ignites and grows
to strength 4; caption updates; visible < 3s.

### Tests for User Story 1 ⚠️ (write first, ensure they FAIL)

- [X] T021 [P] [US1] In `__tests__/BonfireScreen.test.tsx`, test that logging today renders a lit fire of the expected strength (Skia/Reanimated/gesture mocked)

### Implementation for User Story 1

- [X] T022a [US1] Flame geometry in `src/components/Bonfire/Flame.tsx`: the five tongue shapes (base/mid/inner/core/tongue) as Skia teardrop paths, positioned/sized from `flameModel` (height/width ratios per `styles.css .flame.base/.mid/.inner/.core/.tongue`)
- [X] T022b [US1] Flame gradient fills in `src/components/Bonfire/Flame.tsx`: per-tongue vertical `LinearGradient` stops from the active palette (red→ember→amber→gold→core), matching each `.flame.*` CSS gradient
- [X] T022c [US1] Flame compositing in `src/components/Bonfire/Flame.tsx` — the hard, design-critical part: per-tongue Skia `Blur` image filter + a `Group` with `BlendMode.Screen` + brightness, reproducing the additive blurred-glow stack (`styles.css` `filter: blur()` + `mix-blend-mode: screen` + `--bright`). Verify the result against `screenshots/open.png`
- [X] T022d [US1] Halo + ground-glow in `src/components/Bonfire/Flame.tsx`: blurred `RadialGradient` ovals behind the flame, size/opacity from `flameModel.glow` (per `styles.css .halo`/.ground-glow); spark for unlit, hidden for out
- [X] T023 [P] [US1] Implement `src/components/Bonfire/Embers.tsx` — Skia ember particles, spawn rate ∝ intensity, driven by a Reanimated clock (lit only); plus the always-on ambient background embers (the ~14 slow-rising bg embers per `styles.css .bg-embers`)
- [X] T024 [P] [US1] Implement `src/components/Bonfire/Hearth.tsx` — logs + pulsing coals (warm when lit)
- [X] T025 [P] [US1] Implement `src/components/Bonfire/FireCaption.tsx` — word/sub/strength from `fireLabel`
- [X] T026 [US1] Implement `src/components/Calendar/CalendarSheet.tsx` (basic openable sheet to log a day; full swipe gesture is US4) hosting the grid + picker
- [X] T027 [P] [US1] Implement `src/components/Calendar/MonthGrid.tsx` — current month grid + DOW row (S M T W T F S) via `dates.monthGrid`
- [X] T028 [P] [US1] Implement `src/components/Calendar/DayCell.tsx` (`React.memo`) — scored (heat ramp + pips), today (ring), missed (dot), future (dim), blank — per `calendar.jsx`/`styles.css .cell`
- [X] T029 [P] [US1] Implement `src/components/Calendar/ScorePickerBar.tsx` — inline 1–5 heat-colored buttons + Clear (disabled when no score)
- [X] T030 [US1] Implement `src/screens/BonfireScreen.tsx` composing full-screen `Flame`+`Embers`+`Hearth`+`FireCaption` + `CalendarSheet`, wiring `useEntries` and `useSettings` (palette) (depends on T019, T020, T022a–T022d, T026)
- [X] T031 [US1] Add the loading placeholder until `useEntries.ready` && `useSettings.ready` (no premature unlit flash; FR-015) in `src/screens/BonfireScreen.tsx`
- [X] T032 [US1] Wire `BonfireScreen` via `App.tsx`/`index.ts`; verify T021 passes

**Checkpoint**: MVP — design-faithful flame that grows as you log today; persists.

---

## Phase 4: User Story 4 - Reveal/hide the calendar with a swipe (Priority: P2)

**Goal**: Clean main view (flame only + settings button); swipe up reveals the calendar sheet (flame
lifts/dims), swipe down hides it.

**Independent Test**: Open app → calendar hidden; swipe up → it rises and the flame lifts/dims; swipe
down → it hides and the clean view returns.

### Tests for User Story 4 ⚠️

- [X] T033 [P] [US4] In `__tests__/BonfireScreen.test.tsx`, test that the calendar is hidden by default and a swipe-up reveals it / swipe-down hides it (gesture mocked)

### Implementation for User Story 4

- [X] T034 [US4] Add the swipe gesture in `src/components/Calendar/CalendarSheet.tsx`: gesture-handler `Pan` + Reanimated sheet `translateY` + scrim opacity, with open/close snap thresholds (per `calendar.jsx` drag logic)
- [X] T035 [US4] Couple the flame `lift` to sheet progress (shift/scale/dim the flame as it opens) in `src/screens/BonfireScreen.tsx` + `src/components/Bonfire/Flame.tsx` (mirror `app.jsx` `calProg`)
- [X] T036 [US4] Implement the clean default view + swipe handle affordance ("swipe up to log · or tap") per `styles.css .aff-handle`
- [X] T037 [US4] Verify T033 and swipe-down dismiss returns to the clean flame view

**Checkpoint**: Calendar is one gesture away; flame stays the focus.

---

## Phase 5: User Story 2 - Keep the streak alive (Priority: P2)

**Goal**: One missed past day survives; two consecutive missed past days extinguish the fire (no flame,
no embers; cold logs + smoke wisp); any score relights.

**Independent Test**: Seed a lit fire; one missed day → still lit; advance to make two consecutive
missed days → out (no flame/embers, logs grey, smoke); log a day → relights.

### Tests for User Story 2 ⚠️

- [X] T038 [P] [US2] In `__tests__/fire.test.ts`, assert one miss survives, two consecutive misses → `state:'out'`/strength 0, relight, unscored-today-not-a-miss
- [X] T039 [P] [US2] In `__tests__/BonfireScreen.test.tsx`, assert two consecutive missed days render the out state (no flame)

### Implementation for User Story 2

- [X] T040 [US2] Implement the out-state visuals: hide flame + embers, grey/dim logs, fade coals, show smoke wisps in `Flame.tsx`/`Hearth.tsx`/`Embers.tsx` (FR-012, SC-010; per `styles.css .is-out`)
- [X] T041 [US2] Add the `__DEV__`-only advance-day control to `src/screens/BonfireScreen.tsx` (per the design's dev pill) to test extinguish without waiting
- [X] T042 [US2] Verify T038–T039 and the relight transition

**Checkpoint**: Streak pressure + out-state match the design.

---

## Phase 6: User Story 3 - Backfill past days across months (Priority: P3)

**Goal**: Page back through any number of past months and edit any past day; fire recomputes. Forward
nav is capped at the current month (FR-020).

**Independent Test**: From an out state, page back a month (confirm `›` disabled on the current month),
score a missed day → fire recomputes to lit.

### Tests for User Story 3 ⚠️

- [X] T043 [P] [US3] In `__tests__/fire.test.ts`, assert backfilling a missed day repairs the streak and order-independence
- [X] T044 [P] [US3] In `__tests__/BonfireScreen.test.tsx`, assert paging back a month and scoring a past day recomputes the fire

### Implementation for User Story 3

- [X] T045 [US3] Add month navigation `‹ ›` to `src/components/Calendar/MonthGrid.tsx`, with `›` disabled when viewing the current month (no future months; FR-020)
- [X] T046 [US3] Ensure past-day edits across months trigger `computeFire` recompute + flame re-render via `src/hooks/useEntries.ts` (FR-011)
- [X] T047 [US3] Verify T043–T044 and the clear→missed→possible-extinguish edge case

**Checkpoint**: Unlimited back-paging backfill works; no future navigation.

---

## Phase 7: User Story 5 - Choose the fire's color (Priority: P4)

**Goal**: Top-right settings button → pick Amber/Crimson/Sapphire; flame recolors immediately and the
choice persists.

**Independent Test**: Open settings → choose Sapphire → blue flame; restart → still Sapphire.

### Tests for User Story 5 ⚠️

- [X] T048 [P] [US5] In `__tests__/BonfireScreen.test.tsx`, assert choosing a color updates the flame palette; `__tests__/settingsStore.test.ts` already covers persistence/default

### Implementation for User Story 5

- [X] T049 [US5] Implement `src/components/Settings/SettingsSheet.tsx` opened by a top-right settings button (FR-016): radio of Amber/Crimson/Sapphire
- [X] T050 [US5] Feed `useSettings.flameColor` → active palette into `Flame.tsx`/`Embers.tsx` so the flame recolors immediately (FR-017)
- [X] T051 [US5] Persist + restore the chosen color via `settingsStore` (default Amber) and apply on load
- [X] T052 [US5] Verify T048 and color persistence across restart

**Checkpoint**: All five stories functional and design-faithful.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T053 [P] Beginner-comment pass (Principle II): headers + plain-language comments everywhere, especially the Skia flame math (gradients, blur, intensity, particles)
- [X] T054 [P] Accessibility pass (Principle IV): labels on day cells, picker, settings, the flame, and the swipe handle; touch targets
- [X] T055 [P] Honor reduced-motion (mirror `@media (prefers-reduced-motion)`): stop flame/ember/coal loops when the OS requests it
- [ ] T056 Performance validation (SC-007/SC-001): profile the Skia flame on a 120 Hz device, confirm UI-thread FPS holds at panel refresh and score→flame latency < 3s
- [X] T057 [P] Run `npm run lint` (zero errors) and `npm test` (all green); fix findings
- [ ] T058 Design fidelity review: run the app and compare side-by-side with `BonfireDesign/screenshots/{open,open2,open3}.png`; iterate the flame/calendar until almost identical
- [ ] T059 Run `quickstart.md` validation scenarios V1–V7 on a device and confirm expected outcomes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** → no deps; Expo migration first.
- **Foundational (Phase 2)** → after Setup; BLOCKS all stories (design read, theme, engine, models, hooks).
- **US1 (Phase 3)** → after Foundational. MVP.
- **US4 (Phase 4)** → after US1 (extends `CalendarSheet`/`BonfireScreen`).
- **US2 (Phase 5)** → after US1 (out-state visuals on the flame/hearth; engine already done in T013).
- **US3 (Phase 6)** → after US1 (month nav on the grid; engine already supports backfill).
- **US5 (Phase 7)** → after US1 (palette wiring into the flame).
- **Polish (Phase 8)** → after the desired stories.

### Within Each User Story

- Tests written first and FAIL before implementation (Principle III).
- Domain/theme (Phase 2) before components; components before screen wiring.

### Parallel Opportunities

- Setup: T004, T005, T006 [P].
- Foundational: T008, T009, T010, T011, T015, T017, T020 [P] (different files); tests T016/T018 [P].
- US1: impl T023, T024, T025, T027, T028, T029 [P]; test T021 [P].
- US2: tests T038, T039 [P]. US3: tests T043, T044 [P]. US5: test T048 [P].
- Polish: T053, T054, T055, T057 [P].

---

## Parallel Example: User Story 1

```bash
# Independent flame/calendar pieces together:
Task: "Embers.tsx Skia particles"
Task: "Hearth.tsx logs + coals"
Task: "FireCaption.tsx caption"
Task: "MonthGrid.tsx month grid"
Task: "DayCell.tsx cell states"
Task: "ScorePickerBar.tsx 1–5 picker"
```

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1 Setup (Expo) → 2. Phase 2 Foundational (design read, engine, theme, hooks) → 3. Phase 3 US1
→ STOP and validate (quickstart V1 + fidelity vs `open.png`) → demo the growing flame.

### Incremental Delivery

1. Setup + Foundational → ready.
2. US1 → validate (V1) → MVP demo.
3. US4 swipe → V4. 4. US2 streak/out → V2. 5. US3 backfill → V3. 6. US5 color → V5.
7. Polish → performance (V7) + a11y + reduced-motion + fidelity review + lint/test.

---

## Notes

- [P] = different files, no dependencies. [Story] maps task → user story.
- Design fetch is local: `BonfireDesign/` is the source of truth; keep the app side-by-side with the
  screenshots (T007, T058).
- The pure engine (T013) is ported whole from `BonfireDesign/logic.js`, so US2/US3 behavior is already
  covered by `fire.test.ts`; those stories focus on the UI/visuals + story-specific tests.
- Device-only validation: T056, T058, T059 (need a real device/emulator).
- Commit after each task or logical group; verify tests fail before implementing.
