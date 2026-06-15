# Tasks: Tiny Daily Memory

**Input**: Design documents from `/specs/005-tiny-daily-memory/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Include test tasks. Feature needs regression coverage for save/reopen, month-view isolation, and verbatim note display.

**Organization**: Tasks are grouped by user story so each story can be built and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Core note plumbing, using existing packages only

- [X] T001 [P] Add versioned local note storage boundary with load/save/clear helpers in `src/data/dayNotesStore.ts`
- [X] T002 [P] Add note state hook for selected-day load/edit/persist flow in `src/hooks/useDayNotes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared UI surface and shared tests that all stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Add reusable day note editor component shell with built-in `TextInput` in `src/components/Calendar/DayNoteEditor.tsx`
- [X] T004 [P] Thread selected-day note state through `src/screens/BonfireScreen.tsx` and `src/components/Calendar/CalendarSheet.tsx`
- [X] T005 [P] Add storage regression tests for save/reopen, blank input rejection, and replace behavior in `__tests__/dayNotesStore.test.ts`
- [X] T006 [P] Add hook regression tests for selected-day sync, edit persistence, and clear behavior in `__tests__/useDayNotes.test.ts`

**Checkpoint**: Notes can load, save, and round-trip before story-specific UI polish

---

## Phase 3: User Story 1 - Add a private note to a day (Priority: P1)

**Goal**: User can write a short note for a scored day and see same note again on reopen

**Independent Test**: Open scored day, type note, close/reopen same day, confirm exact note text remains

### Tests for User Story 1

- [X] T007 [P] [US1] Add end-to-end save/reopen regression coverage in `__tests__/BonfireScreen.test.tsx`

### Implementation for User Story 1

- [X] T008 [US1] Implement note entry, replacement, and blank-to-clear behavior in `src/components/Calendar/DayNoteEditor.tsx`
- [X] T009 [US1] Wire note editor into selected-day open/close flow in `src/components/Calendar/CalendarSheet.tsx` and `src/screens/BonfireScreen.tsx`

**Checkpoint**: User Story 1 is independently usable and verifies note persistence

---

## Phase 4: User Story 2 - Keep notes visible only in day detail (Priority: P1)

**Goal**: Notes appear only when a day is open, not in month view or any overview surface

**Independent Test**: Save a note, browse month grid, confirm no badges/previews/marks, then open the day and confirm note is only in detail

### Tests for User Story 2

- [X] T010 [P] [US2] Add month-view regression coverage for no note markers, badges, or preview text in `__tests__/BonfireScreen.test.tsx`

### Implementation for User Story 2

- [X] T011 [US2] Keep month grid note-free in `src/components/Calendar/MonthGrid.tsx`
- [X] T012 [US2] Render note UI only for selected-day detail and hide it when no day is selected in `src/components/Calendar/CalendarSheet.tsx`

**Checkpoint**: Notes stay confined to day detail and do not affect the month view

---

## Phase 5: User Story 3 - Prevent automatic interpretation of note content (Priority: P2)

**Goal**: Notes stay raw text only, with no summary, sentiment, coaching, or scoring

**Independent Test**: Enter a note with emotional or descriptive wording and confirm the app shows the same text verbatim with no added interpretation

### Tests for User Story 3

- [X] T013 [P] [US3] Add verbatim-text regression coverage with no summary/sentiment/coaching output in `__tests__/DayNoteEditor.test.tsx`

### Implementation for User Story 3

- [X] T014 [US3] Keep note handling as plain text only with no transform or analysis paths in `src/data/dayNotesStore.ts`, `src/hooks/useDayNotes.ts`, and `src/components/Calendar/DayNoteEditor.tsx`

**Checkpoint**: Note content is preserved exactly as entered and never interpreted

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish line checks across stories

- [X] T015 [P] Run `npm run lint` and `npm test`, then fix any failures in `src/...` and `__tests__/...`
- [X] T016 [P] Update `specs/005-tiny-daily-memory/quickstart.md` if validation steps or expected results changed during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion; can then proceed in priority order
- **Polish (Final Phase)**: Depends on desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational phase; no dependency on other stories
- **US2 (P1)**: Can start after Foundational phase; may reuse US1 surfaces but stays independently testable
- **US3 (P2)**: Can start after Foundational phase; no dependency on month-view work

### Within Each User Story

- Tests before implementation if using TDD
- Shared component/hook wiring before story-specific polish
- Story complete before moving to next priority

### Parallel Opportunities

- T001 and T002 can run in parallel after API shape is agreed
- T003, T005, and T006 can run in parallel because they touch separate files
- T007 can run alongside T008/T009 once note API exists
- T010 can run alongside T011/T012 once month/detail wiring exists
- T013 can run alongside T014 once plain-text behavior is settled

---

## Parallel Example: User Story 1

```bash
Task: "Add end-to-end save/reopen regression coverage in __tests__/BonfireScreen.test.tsx"
Task: "Implement note entry, replacement, and blank-to-clear behavior in src/components/Calendar/DayNoteEditor.tsx"
Task: "Wire note editor into selected-day open/close flow in src/components/Calendar/CalendarSheet.tsx and src/screens/BonfireScreen.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Validate save/reopen flow before moving on

### Incremental Delivery

1. Add note storage + hook
2. Deliver note save/reopen in day detail
3. Lock notes to day detail only
4. Keep note content verbatim and non-analytical
5. Run lint + tests, then polish

---

## Notes

- [P] tasks = different files, no incomplete-task dependency
- [Story] label maps task to specific user story for traceability
- Keep code small, typed, and dependency-free
- No note timeline, no summary, no sentiment, no coaching, no extra month-view markers
