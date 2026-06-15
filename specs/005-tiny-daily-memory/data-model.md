# Data Model: Tiny Daily Memory

## Entities

### Day Note

Represents one optional personal note attached to a calendar day.

**Fields**

- `dateKey`: the calendar day the note belongs to
- `text`: the saved note content

**Rules**

- At most one note exists per day.
- Blank or whitespace-only text is not stored.
- The text is shown verbatim in day detail.

### Day Detail

Represents the selected calendar day view inside the calendar sheet.

**Fields**

- `dateKey`
- `score`
- `noteText` or no note

**Rules**

- A day can be opened without a note.
- Notes are editable from the same day detail surface where they are viewed.

### Notes Store

A local map from day key to note text.

**Fields**

- `entries`: `dateKey -> text`

**Rules**

- The store is separate from the score store.
- The month calendar does not derive markers or badges from this store.

## Relationships

- One calendar day can have zero or one day note.
- The day note belongs to the same selected day used for score editing.
- The month grid may select a day, but it does not render note previews.

## Validation Rules

- Notes must survive app restart.
- Whitespace-only input is ignored.
- Editing a note replaces the saved text for that day.
- Clearing a note removes the saved text for that day.

