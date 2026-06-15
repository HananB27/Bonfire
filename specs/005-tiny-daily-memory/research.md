# Research: Tiny Daily Memory

## Decision 1: Store notes in a separate local map

**Decision**: Keep notes in a dedicated versioned `dateKey -> noteText` map using the existing local
storage pattern.

**Rationale**: Notes are independent from scores and should not complicate the existing score store
or any fire calculations. A separate map keeps the code simple and makes migration/testing easier.

**Alternatives considered**:

- Embed notes inside the score map. Rejected because it couples unrelated data and makes the score
  store harder to reason about.
- Derive notes from existing calendar entries. Rejected because notes are user-authored data and
  must persist exactly as written.

## Decision 2: Reuse the existing calendar sheet as the day detail surface

**Decision**: Place the note editor in the current selected-day area of the calendar sheet.

**Rationale**: The product already opens a day in the calendar. Adding notes there satisfies the
feature with the least UI churn and no extra navigation surface.

**Alternatives considered**:

- Add a new standalone note screen. Rejected because the feature is intentionally small and should
  stay inside the existing calendar flow.
- Add notes to the month grid. Rejected because the spec explicitly keeps notes out of overview
  surfaces.

## Decision 3: Use built-in text input and existing styling only

**Decision**: Use React Native’s built-in text input and the app’s current tokens/components.

**Rationale**: The user asked to avoid new dependencies and performance-heavy work. The built-in
input is enough for short private notes and keeps the implementation aligned with the existing
stack.

**Alternatives considered**:

- Add a richer text editor package. Rejected because it would increase bundle size and maintenance
  cost without adding value for short notes.
- Implement custom text handling from scratch. Rejected because the platform already provides the
  required control.

## Decision 4: Keep note handling non-analytical

**Decision**: Persist and display notes verbatim, and do not generate summaries, sentiment labels,
or coaching.

**Rationale**: The feature is for personal memory only. Automatic interpretation would change the
user promise and add unnecessary complexity.

**Alternatives considered**:

- Add AI summaries or sentiment analysis later. Deferred explicitly by the spec and out of scope
  for this feature.

## Decision 5: Avoid any new runtime work in the render hot path

**Decision**: Load/save notes only when the selected day changes or the user edits text; keep the
month grid unchanged.

**Rationale**: The app already has enough UI work in the calendar flow. Notes should not add
animation loops, repeated scans, or extra rendering work.

**Alternatives considered**:

- Recompute notes across the whole month on every render. Rejected because it is unnecessary and
  violates the feature constraint against heavy code.

