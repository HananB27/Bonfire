---
description: "Task list for Bonfire Productivity Tracker implementation"
---

# Tasks: Bonfire Productivity Tracker

**Input**: Design documents from `specs/001-bonfire-productivity-tracker/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: INCLUDED — Constitution Principle III (Testing Standards) is NON-NEGOTIABLE, so each
story carries test tasks written before/with implementation.

**Organization**: Tasks grouped by user story (P1→P3) for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3 (maps to spec.md user stories)
- Exact file paths are included in each task.

## Path Conventions

Static single-view React Native app at repository root: `src/`, `__tests__/`, `App.tsx`
(per plan.md → Project Structure).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies

- [ ] T001 Create source folder structure per plan.md: `src/domain/`, `src/data/`, `src/hooks/`, `src/components/Bonfire/`, `src/components/Calendar/`, `src/components/theme/`, `src/screens/`
- [ ] T002 Install persistence dependency `@react-native-async-storage/async-storage` (and run `cd ios && pod install`); record it in package.json
- [ ] T003 [P] Add an AsyncStorage Jest mock and confirm `npm test` + `npm run lint` run clean on the empty structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required by ALL user stories

**⚠️ CRITICAL**: No user story work begins until this phase is complete

- [ ] T004 **DESIGN MUST DO**: Fetch the design from `https://api.anthropic.com/v1/design/h/eOB-vSewWG4d4riVK_jhKg?open_file=Bonfire.html` (e.g. via the `DesignSync` tool), read its README/notes if present (otherwise infer structure and tokens from the rendered design — do not block on a missing README), and save the bundle/notes under `specs/001-bonfire-productivity-tracker/design/` for reference
- [ ] T005 [P] Extract design tokens (colors, typography, spacing, flame palette) from the fetched design into `src/components/theme/tokens.ts`, with header + inline comments explaining each token group (Principle II)
- [ ] T006 [P] Define shared domain types (`Score`, `Entries`, `FireStatus`, `FireState`) in `src/domain/fire.ts` per contracts/fire-engine.md (types only, commented)
- [ ] T007 [P] Implement local-date helpers in `src/domain/dates.ts`: `today()`, `toKey(date)`, `isPast(key, today)`, `monthGrid(year, month)` — all using device-local time, with plain-language comments
- [ ] T008 [US-pre] Write `__tests__/dates.test.ts` covering the "today is not a miss until past" boundary and ISO-key local-date correctness, then make it pass

**Checkpoint**: Theme tokens, types, and date utilities exist — story work can begin

---

## Phase 3: User Story 1 - Light and grow the fire with a daily score (Priority: P1) 🎯 MVP

**Goal**: User assigns today a 1–5 score on the calendar and the animated flame ignites/grows
(score 1 keeps it lit at the same size; 2–5 add increasing strength).

**Independent Test**: Fresh install → tap today → pick 3 → flame ignites; change to 5 → grows to max
single-day size; change to 1 → stays lit, same size. Visible update < 3s.

### Tests for User Story 1 ⚠️ (write first, ensure they FAIL)

- [ ] T009 [P] [US1] In `__tests__/fire.test.ts`, test `scoreStrength` (1→0,2→1,3→2,4→3,5→4) and `computeFire` for: no entries → unlit/0; single score today; score-1-only stays lit at 0; cumulative sum of several lit days — per contracts/fire-engine.md
- [ ] T010 [P] [US1] In `__tests__/entriesStore.test.ts`, test load/save round-trip with mocked AsyncStorage and that `loadEntries` returns `{}` on missing/corrupt data — per contracts/entries-store.md
- [ ] T011 [P] [US1] In `__tests__/BonfireScreen.test.tsx`, test that assigning today a score renders a larger flame and that score 1 keeps it lit without growth

### Implementation for User Story 1

- [ ] T012 [US1] Implement `scoreStrength` and a first `computeFire(entries, today)` (cumulative-sum over scored days, `unlit` when empty, `lit` otherwise — extinguish/run-reset handled in US2; FR-006 is therefore fully satisfied only after T024) in `src/domain/fire.ts` with commented streak/sum logic
- [ ] T013 [P] [US1] Implement persistence layer `loadEntries`/`saveEntries` (versioned key, never-throw load) in `src/data/entriesStore.ts`
- [ ] T014 [US1] Implement `useEntries(today)` hook in `src/hooks/useEntries.ts`: load on mount, `setScore` (reject out-of-range and future dates), `clearScore`, memoized `fire` via `computeFire`, `ready` flag (depends on T012, T013)
- [ ] T015 [P] [US1] Implement pure `flameModel.ts` in `src/components/Bonfire/` mapping `strength`→visual params (size, glow, particle count) on a continuous curve, with comments
- [ ] T016 [US1] Implement `Flame.tsx` in `src/components/Bonfire/`: native-driver `Animated` flame (transform/opacity only, looped flicker, `useNativeDriver: true`) targeting ≥120 FPS; renders spark/unlit + lit sizes from `flameModel` (depends on T015)
- [ ] T017 [P] [US1] Implement `DayCell.tsx` (`React.memo`) in `src/components/Calendar/`: scored/today/future styling + accessible tap target, styled from theme tokens, including a 1→5 score-intensity color ramp driven by the day's score / `fire.perDay` and a distinct "missed" mark (FR-013)
- [ ] T018 [US1] Implement `CalendarMonth.tsx` in `src/components/Calendar/`: month grid via `dates.monthGrid`, renders `DayCell`s, defaults to the current month (cross-month back/forward navigation is added in US3 via T031) (depends on T017)
- [ ] T019 [P] [US1] Implement `ScorePicker.tsx` in `src/components/Calendar/`: inline 1–5 selector + clear, accessible labels
- [ ] T020 [US1] Implement `BonfireScreen.tsx` in `src/screens/` composing `Flame` (top) + `CalendarMonth` (bottom), wiring `useEntries` so tapping a day opens `ScorePicker` and updates the flame (depends on T014, T016, T018, T019)
- [ ] T021 [US1] Wire `BonfireScreen` into `App.tsx` under the SafeArea provider; verify T009–T011 pass

**Checkpoint**: MVP — log today, watch the fire ignite/grow, persists across restart

---

## Phase 4: User Story 2 - Keep the streak alive (Priority: P2)

**Goal**: One missed past day survives; two consecutive missed past days extinguish the fire and
reset strength to 0; relighting starts a fresh run.

**Independent Test**: Seed a lit fire; leave one past day empty → still lit; make two consecutive
past days empty → fire shown out, strength 0; log a new day → relights from a spark.

### Tests for User Story 2 ⚠️ (write first, ensure they FAIL)

- [ ] T022 [P] [US2] Extend `__tests__/fire.test.ts`: one missed day survives; two consecutive missed past days → `status:'out'`, `strength:0`; out-then-relight produces a fresh run; unscored today does not extinguish — per contracts/fire-engine.md behavior table
- [ ] T023 [P] [US2] Extend `__tests__/BonfireScreen.test.tsx`: after two consecutive missed past days the screen renders the extinguished/out state

### Implementation for User Story 2

- [ ] T024 [US2] Extend `computeFire` in `src/domain/fire.ts` with the streak walk: count consecutive past misses, on 2 misses end the run and reset strength (`status:'out'`), restart accumulation on the next scored day — heavily commented (FR-007/008/009)
- [ ] T025 [P] [US2] Add the `out` visual state to `Flame.tsx` (smoke/charred-logs/cold palette) and animate the "going out" transition, per the fetched design
- [ ] T026 [P] [US2] Add a dev-only "advance date by a day" control (gated behind `__DEV__`) in `src/screens/BonfireScreen.tsx` so the 2-missed-days extinguish is testable without waiting
- [ ] T027 [US2] Verify T022–T023 pass and the calendar marks missed days visually (FR-013) in `DayCell.tsx`

**Checkpoint**: Streak pressure works — fire goes out on 2 misses, relights cleanly

---

## Phase 5: User Story 3 - Backfill past days and recompute (Priority: P3)

**Goal**: Assign/change/clear scores on any past day; the fire recomputes deterministically from the
full calendar (e.g. filling a missed day repairs a broken streak).

**Independent Test**: From an "out" state, score one of the two missed days → gap shrinks to one →
fire recomputes to lit with correct size; same scores in any order → identical fire.

### Tests for User Story 3 ⚠️ (write first, ensure they FAIL)

- [ ] T028 [P] [US3] Extend `__tests__/fire.test.ts`: backfilling one of two missed days relights the fire; adding an earlier scored day increases strength; order-independence (same pairs any insertion order → identical `FireState`) — FR-010, SC-004
- [ ] T029 [P] [US3] Extend `__tests__/BonfireScreen.test.tsx`: tapping a past day, scoring it, and clearing a day each recompute the rendered flame

### Implementation for User Story 3

- [ ] T030 [US3] Enable past-day editing in `src/components/Calendar/CalendarMonth.tsx` + `DayCell.tsx`: any past/today cell opens `ScorePicker`; future cells stay disabled (FR-002/003/004)
- [ ] T031 [US3] Add back/forward cross-month navigation controls to `src/components/Calendar/CalendarMonth.tsx` (so any past month is reachable for backfill — US3 requires reaching arbitrary past dates), and ensure `useEntries.setScore`/`clearScore` on past dates trigger `computeFire` recompute and flame re-render in `src/hooks/useEntries.ts` (FR-011)
- [ ] T032 [US3] Verify T028–T029 pass and the "clear score makes day missed again → may extinguish" edge case behaves correctly

**Checkpoint**: All three stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Quality, performance, and constitution compliance across all stories

- [ ] T033 [P] Beginner-comment pass (Principle II): confirm every component/hook/function has a purpose/inputs/outputs header and the streak + cumulative-sum logic has plain-language inline comments
- [ ] T034 [P] Accessibility pass (Principle IV): accessible labels on day cells and score picker, minimum touch targets, dynamic-font-scale check on `BonfireScreen`
- [ ] T035 Performance validation (Performance Goals / SC-007 / SC-001): profile flame with Perf Monitor on a 120 Hz device, confirm UI-thread FPS holds at panel refresh (≥120 FPS, SC-007) and that score→flame update latency stays under 3s (SC-001) while logging scores; if `Animated` falls short, migrate `Flame.tsx` to Reanimated per research.md R2
- [ ] T036 [P] Run `npm run lint` (zero errors) and `npm test` (all green); fix any findings
- [ ] T037 Run `specs/001-bonfire-productivity-tracker/quickstart.md` validation scenarios V1–V5 on device and confirm expected outcomes (V1 verifies SC-001 <3s; V4 verifies SC-006 persistence; V5 verifies SC-007 frame rate)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — start immediately
- **Foundational (Phase 2)**: depends on Setup — BLOCKS all user stories (design fetch, tokens, types, dates)
- **User Stories (Phase 3–5)**: depend on Foundational; then proceed P1 → P2 → P3 (or in parallel if staffed)
- **Polish (Phase 6)**: depends on the desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: starts after Foundational. Establishes fire engine (sum), store, hook, UI. No dependency on US2/US3.
- **US2 (P2)**: starts after Foundational; extends `computeFire` + `Flame` from US1 but is independently testable (engine tests stand alone).
- **US3 (P3)**: starts after Foundational; reuses US1 UI/engine for past-day editing; independently testable.

### Within Each User Story

- Tests written first and FAIL before implementation (Principle III)
- Domain (`fire.ts`, `dates.ts`) before hook (`useEntries`) before components before screen
- Story complete and validated before next priority

### Parallel Opportunities

- Setup: T003 [P]
- Foundational: T005, T006, T007 [P] (different files)
- US1 tests T009/T010/T011 [P]; impl T013, T015, T017, T019 [P]
- US2 tests T022/T023 [P]; impl T025, T026 [P]
- US3 tests T028/T029 [P]
- Polish: T033, T034, T036 [P]

---

## Parallel Example: User Story 1

```bash
# Tests for US1 together:
Task: "scoreStrength + computeFire (sum) tests in __tests__/fire.test.ts"
Task: "entriesStore round-trip test in __tests__/entriesStore.test.ts"
Task: "BonfireScreen grow-on-score test in __tests__/BonfireScreen.test.tsx"

# Independent implementation files together:
Task: "entriesStore.ts persistence layer"
Task: "flameModel.ts strength→visual curve"
Task: "DayCell.tsx memoized day cell"
Task: "ScorePicker.tsx 1–5 picker"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → 2. Phase 2 Foundational (incl. design fetch) → 3. Phase 3 US1 →
4. STOP and validate US1 independently (quickstart V1) → 5. Demo the working ignite-and-grow loop.

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 → validate (V1) → MVP demo
3. US2 → validate (V2) → streak/extinguish demo
4. US3 → validate (V3) → backfill demo
5. Polish → performance (V5) + persistence (V4) + a11y + lint/test

---

## Notes

- [P] = different files, no dependencies
- Design fetch (T004) is a hard gate before any UI task (T005, T016–T020, T025)
- ≥120 FPS flame: native-driver `Animated`, transform/opacity only, no per-frame JS; Reanimated is the documented fallback (research.md R2)
- Commit after each task or logical group; verify tests fail before implementing
