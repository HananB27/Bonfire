# Quickstart: Tiny Daily Memory

## Prerequisites

- Existing project dependencies installed.
- The app launches with the current calendar flow.

## Validation Scenarios

1. Start the app and open the calendar.
2. Select a day that already has a score.
3. Add a short note.
4. Close and reopen that day.
5. Confirm the note is still shown in day detail.
6. Reopen the month view and confirm there are no note badges, markers, or previews.
7. Enter whitespace only and confirm nothing is saved.
8. Edit an existing note and confirm the replacement is shown on reopen.

## Test Commands

```bash
npm run lint
npm test
```

## Expected Outcome

- Notes can be saved, reopened, edited, and cleared from the day detail surface.
- Month browsing remains visually unchanged.
- No summary, sentiment, or coaching text appears anywhere in the app.

