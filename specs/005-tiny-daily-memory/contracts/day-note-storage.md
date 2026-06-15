# Contract: Day Note Storage

## Purpose

Define how a day note is stored and retrieved locally.

## Storage Shape

- One note per calendar day.
- Key: calendar day identifier.
- Value: the saved note text.

## Required Behavior

- Saving a note for a day replaces any previous note for that same day.
- Loading returns an empty set when nothing has been saved.
- Blank or whitespace-only input is rejected before storage.
- Corrupt or unusable stored data falls back to an empty set.

## Non-Goals

- No summary generation.
- No sentiment analysis.
- No monthly note timeline.
- No memory badges or marks in the month grid.

