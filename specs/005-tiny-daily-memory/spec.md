# Feature Specification: Tiny Daily Memory

**Feature Branch**: `005-tiny-daily-memory`

**Created**: 2026-06-15

**Status**: Draft

**Input**: User description: "After assigning a score, the user can optionally write a tiny note. The note should be personal memory only. It should not be analyzed, summarized, scored, or turned into coaching. Notes should appear when opening a day in the calendar. Notes are optional. Notes appear only in day detail. No monthly memory timeline for now. No AI summary. No sentiment interpretation. No memory marks."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add a private note to a day (Priority: P1)

A user opens a scored day in the calendar and adds a short personal note about that day. The note is saved with the day and appears again when the user reopens that day later.

**Why this priority**: The feature exists to let people attach a personal memory to a day. If they cannot save and reopen the note, the feature has no value.

**Independent Test**: Open a scored day, enter a note, leave the day, then reopen the same day and confirm the note is still there.

**Acceptance Scenarios**:

1. **Given** a day has a score, **When** the user adds a note in day detail, **Then** the note is saved for that day.
2. **Given** a note was saved for a day, **When** the user reopens that day, **Then** the same note is shown in day detail.
3. **Given** a day already has a note, **When** the user updates the note, **Then** the new text replaces the old text for that day.

---

### User Story 2 - Keep notes visible only in day detail (Priority: P1)

A user can review a note only by opening the specific day it belongs to. Notes do not appear in the monthly calendar view, any timeline, or any other overview surface.

**Why this priority**: The feature is intentionally small and private. Visibility should stay focused on the day detail screen and avoid adding clutter elsewhere.

**Independent Test**: Save a note, browse the month view, and confirm there are no note badges, icons, previews, or timeline entries. Open the day detail and confirm the note appears there.

**Acceptance Scenarios**:

1. **Given** a note exists for a day, **When** the user views the month calendar, **Then** the note is not shown there.
2. **Given** a note exists for a day, **When** the user opens that day, **Then** the note is shown in day detail.
3. **Given** a day has no note, **When** the user opens that day, **Then** no note content is shown.

---

### User Story 3 - Prevent automatic interpretation of note content (Priority: P2)

A user writes a note and sees it preserved as written, without the app summarizing it, scoring it, labeling its mood, or turning it into coaching.

**Why this priority**: The note is personal memory only. Any automatic interpretation would change the feature from storage into analysis.

**Independent Test**: Enter several notes with different tones and confirm the app shows only the raw note text and no generated summary, sentiment label, or advice.

**Acceptance Scenarios**:

1. **Given** a note is saved, **When** the user opens the day detail, **Then** the app shows the note text verbatim.
2. **Given** a note contains emotional or reflective language, **When** the user views the day, **Then** the app does not add sentiment labels or coaching text.
3. **Given** a note exists, **When** the user browses the app, **Then** no AI summary or memory timeline is generated from the note.

### Edge Cases

- If the user leaves the note empty or only enters whitespace, nothing should be saved.
- If a day has no note, the day detail should remain usable and should not show note-specific controls as a required step.
- If a note contains punctuation, line breaks, or other plain-text characters, it should be displayed exactly as entered.
- If a score changes later, the note should remain attached to that day unless the user removes it.
- If the user searches the calendar month view, notes should not create any extra marks, badges, or preview text.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The user MUST be able to add an optional personal note to a day after assigning a score.
- **FR-002**: The user MUST be able to view the saved note when opening that day in day detail.
- **FR-003**: The user MUST be able to edit or replace a saved note from day detail.
- **FR-004**: A note MUST be stored with the day so that it remains available after leaving and returning to the calendar.
- **FR-005**: Notes MUST appear only in day detail and MUST NOT appear in the monthly calendar view, any timeline view, or any other overview surface.
- **FR-006**: The app MUST NOT generate summaries, sentiment labels, coaching text, or other automatic interpretation from note content.
- **FR-007**: The app MUST show note text as user-entered content and MUST NOT rewrite, score, or reframe it.
- **FR-008**: Notes MUST be optional; a day with no note MUST remain fully usable.
- **FR-009**: Blank or whitespace-only note input MUST NOT be stored as a note.
- **FR-010**: Notes MUST NOT add memory marks, badges, icons, or other note indicators to the month calendar surface.

### Key Entities *(include if feature involves data)*

- **Day Note**: A personal text note attached to one calendar day. It belongs to the day detail view and contains the note text only.
- **Day Detail**: The view for one selected calendar day where the user can review the day, its score, and its optional note.
- **Calendar Day Entry**: The existing day record that already holds the score; the note is associated with this day rather than treated as a separate monthly item.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In testing, 100% of saved notes are visible again when the same day is reopened.
- **SC-002**: In testing, 100% of note content is shown verbatim with no added summary, sentiment label, or coaching text.
- **SC-003**: In testing, zero notes appear in the month calendar view or any overview timeline.
- **SC-004**: In usability checks, users can add and later review a note from day detail without needing any screen outside the calendar flow.
- **SC-005**: In testing, days without notes remain fully usable and do not require note entry to complete the day workflow.

## Assumptions

- The app already has a day detail surface for opening one calendar day at a time.
- Notes are short personal text entries tied to a calendar day, not separate standalone documents.
- This release does not add a monthly memory timeline, note search, note sharing, AI summary, sentiment interpretation, or memory badges.
- Notes follow the existing local calendar storage pattern and remain private to the device.

