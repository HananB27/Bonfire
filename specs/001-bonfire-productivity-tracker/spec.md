# Feature Specification: Bonfire Productivity Tracker

**Feature Branch**: `001-bonfire-productivity-tracker`

**Created**: 2026-06-11

**Revised**: 2026-06-12 — added a settings button + selectable fire color (Amber/Crimson/Sapphire),
a clean main view with a swipe-up/swipe-down month calendar that can page back through any number of
past months (but not into the future), fire particles, and a "no flame" out-state (cold logs + a
faint smoke wisp, no flame or embers).

**Status**: Draft

**Input**: User description: "Build a mobile application that will help me track my productivity. The app will feature a bonfire that the user can light and make larger and stronger by confirming how productive they were on each day using a calendar. It works like a streak where if the user doesnt add any productivity for 2 days in a row on a calendar, the flame goes out. It is supposed to guide the user into being productive each day so they can keep the fire going and make it larger and larger. The user will track their productivity on each day by assigning a score of 1-5 of how productive they were that day. A 1 will just maintain the fire, while scores from 2 to 5 will add different amounts of strength to the flame, with 5 being the most. Missing a single day of productivity will not cause the flame to go out, while missing 2 days in a row causes it to go out. The only features of the flame will be the animated flame and the calendar. Users will be able to add productivity to days in the past, which will update the flame based on the current calendar."

## Clarifications

### Session 2026-06-12

- Q: On cold start, while saved scores are still loading from storage, what should the screen show? → A: A brief loading placeholder until entries finish loading, then render the real fire (no premature "unlit" flash, and no early tap that could be overwritten by the load).
- Q: When the fire is out, does logging a score of 1 relight it? → A: Yes — any score 1–5 relights an extinguished fire; a 1 relights it as a minimal lit flame at strength 0. A logged day always counts as active.
- Q: Should the flame's on-screen size grow without limit, or level off past a point? → A: Soft cap — the flame grows quickly then levels off toward a maximum size so it stays on screen; the underlying strength value keeps increasing without limit.
- Q: With no day-by-day traversal, which days can the calendar see and edit? → A: The calendar is month-focused (one month at a time) and the user can page backward through any number of past months to view/edit any past day; it cannot page into future months (no future days).
- Q: When the fire is out, what is shown in place of the flame? → A: Charred logs plus a thin, dissipating smoke wisp — but NO flame and NO embers/particles — until relit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Light and grow the fire with a daily score (Priority: P1)

The user opens the app and sees a clean main view: just the animated bonfire (and a settings
button in the top-right). They swipe up to reveal the calendar, tap today's date, and assign a
productivity score from 1 to 5 for the day. The flame reacts: a score of 1 keeps the fire at its
current size (the day still counts as "kept alive"), while scores of 2 through 5 grow the flame by
increasing amounts, with 5 adding the most. Each productive day makes the fire visibly larger and
stronger. Swiping the calendar back down returns to the clean flame-only view.

**Why this priority**: This is the core loop of the entire app — without the ability to log a
daily score and watch the fire respond, there is no product. It delivers the central motivational
payoff on its own.

**Independent Test**: Install the app, open it, assign a score to today, and confirm the flame
animates to a larger/stronger state for scores 2-5 and stays the same size (but lit) for a score
of 1. Fully demonstrable with a single day of input.

**Acceptance Scenarios**:

1. **Given** an unlit fire (no scores yet), **When** the user assigns today a score of 3, **Then**
   the fire ignites and grows to the strength corresponding to a score of 3.
2. **Given** a lit fire, **When** the user assigns today a score of 5, **Then** the fire grows by
   the maximum per-day amount.
3. **Given** a lit fire, **When** the user assigns today a score of 1, **Then** the fire remains
   lit at the same size (the day counts as active but adds no strength).
4. **Given** today already has a score, **When** the user changes it to a different value, **Then**
   the fire's size updates to reflect the new score.

---

### User Story 2 - Keep the streak alive (fire goes out after 2 missed days) (Priority: P2)

The user is guided to return every day. If they miss a single day, the fire survives. If they
miss two calendar days in a row (two consecutive past days with no score), the fire goes out: it
loses all of its accumulated size and must be rebuilt from a fresh spark the next time the user
logs a score.

**Why this priority**: The "use it or lose it" streak pressure is what turns daily logging into a
habit. It builds directly on P1 and provides the motivational stakes, but the app is still usable
for tracking even before this rule is enforced.

**Independent Test**: Log a score, let two consecutive past days pass with no score, and confirm
the fire is shown as out with size reset to zero; confirm that missing only one day leaves the
fire lit.

**Acceptance Scenarios**:

1. **Given** a lit fire and exactly one past day with no score, **When** the user views the fire,
   **Then** the fire is still lit and retains its size.
2. **Given** a lit fire and two consecutive past days with no score, **When** the user views the
   fire, **Then** the fire is shown as out and its size is reset to zero.
3. **Given** the fire has gone out, **When** the user assigns a score to a new day, **Then** the
   fire relights from a spark and begins accumulating size again from zero.
4. **Given** scored days separated by a single missed day, **When** the user views the fire, **Then**
   the fire stays lit and both scored days contribute to its size.

---

### User Story 3 - Backfill past days and recompute the fire (Priority: P3)

The user can tap any past date shown on the calendar and assign (or change) a productivity score
for that day. The fire is then recalculated from the full calendar against the current date — for
example, filling in a previously missed day can repair a streak that would otherwise have gone
out, restoring or increasing the fire's size. The calendar is month-focused and the user can page
back through any number of past months to reach and edit any past day; it cannot page into future
months.

**Why this priority**: Backfilling adds flexibility and forgiveness for users who forget to log in
real time, but the app delivers its core value (P1) and motivation (P2) without it.

**Independent Test**: Page the calendar back to a month containing two missed days that put the fire
out, assign a score to one of those days, and confirm the fire recomputes to a lit state with the
appropriate size.

**Acceptance Scenarios**:

1. **Given** the fire is out because of two consecutive missed past days, **When** the user assigns
   a score to one of those two days, **Then** the gap shrinks to a single missed day and the fire
   recomputes to a lit state.
2. **Given** a lit fire, **When** the user adds a score of 4 to an earlier un-scored day, **Then**
   the fire's size increases to reflect that day's contribution.
3. **Given** any past-day change, **When** the recalculation runs, **Then** the resulting fire
   state is the same as if every score had been entered on its own day (order-independent result).

---

### User Story 4 - Reveal and hide the calendar with a swipe (Priority: P2)

The main view is intentionally clean — only the flame and a settings button. To log or review any
day, the user swipes up to bring the calendar into view; swiping it back down hides it and returns
to the uncluttered flame. This keeps the bonfire the focus and the calendar one gesture away.

**Why this priority**: With a clean main view, the swipe gesture is the only way to reach the
calendar, so logging any day (P1/P3) depends on it. It is foundational to interacting with the app.

**Independent Test**: Open the app, confirm the calendar is hidden; swipe up and confirm it
appears; swipe down and confirm it hides again.

**Acceptance Scenarios**:

1. **Given** the app is on the clean main view, **When** the user swipes up, **Then** the calendar
   slides into view.
2. **Given** the calendar is visible, **When** the user swipes down, **Then** the calendar hides and
   the clean flame-only view returns.

---

### User Story 5 - Choose the fire's color (Priority: P4)

The user opens the settings button in the top-right and picks the color of their fire from at
least Amber, Crimson, and Sapphire. The flame immediately adopts the chosen color, and the choice
is remembered the next time the app is opened.

**Why this priority**: Personalization increases attachment to the fire, but the core tracking loop
works regardless of color. It is a nice-to-have layered on top of the essential features.

**Independent Test**: Open settings, choose Sapphire, confirm the flame turns blue; restart the app
and confirm the flame is still Sapphire.

**Acceptance Scenarios**:

1. **Given** the main view, **When** the user taps the settings button, **Then** a settings screen
   with the fire-color choices (at least Amber, Crimson, Sapphire) appears.
2. **Given** the settings screen, **When** the user selects Crimson, **Then** the flame is shown in
   the Crimson color.
3. **Given** the user previously chose a color, **When** they reopen the app, **Then** the flame
   uses that saved color.

---

### Edge Cases

- **Today not yet scored**: The current day is not counted as "missed" until it has fully passed.
  An unscored today never, by itself, puts the fire at risk.
- **First-ever use**: With no scores recorded, the fire is unlit (a spark/empty state) rather than
  shown as "gone out".
- **Cold start / loading**: On launch, until previously saved scores have finished loading, the app
  shows a brief loading placeholder instead of the fire, so the user never sees an incorrect "unlit"
  state and a score logged during loading cannot be lost.
- **Long gap then return**: If many days are missed, the fire is out and resets to zero; the next
  logged score starts a brand-new fire from a spark.
- **Out-state shows no fire**: While the fire is out, NO flame and NO embers/particles are shown
  until a new score relights it; cold charred logs and a thin smoke wisp MAY remain to show the fire
  recently went out.
- **Calendar hidden by default**: On opening the app the calendar is not shown; it only appears when
  the user swipes up, and hides when they swipe down.
- **Month navigation**: The calendar shows one month at a time; the user can page back through any
  number of past months but cannot page into future months (the current month is the forward limit).
- **Color persistence**: A chosen fire color persists across app restarts; if none was ever chosen,
  a default color is used.
- **Removing a score**: If the user clears a previously scored day, the day becomes "missed" again
  and the fire recomputes (which may cause it to go out if it creates two consecutive missed days).
- **Future dates**: The user cannot assign scores to days in the future.
- **Score boundaries**: Only integer scores 1-5 are accepted; values outside this range are
  rejected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST display, on a clean main view, an animated bonfire whose size/strength
  reflects the user's accumulated productivity, plus a settings button (top-right) and a calendar
  that is revealed on demand (see FR-016–FR-019). The flame is the focus; the calendar and settings
  are the only other surfaces.
- **FR-002**: Users MUST be able to assign an integer productivity score of 1 to 5 to any day that
  is today or in the past.
- **FR-003**: The app MUST reject scores outside the 1-5 integer range and MUST reject scores for
  future dates.
- **FR-004**: Users MUST be able to change or clear a previously assigned score for any past or
  current day.
- **FR-005**: A score of 1 MUST count the day as active (keeping the fire alive) but MUST add no
  strength to the fire. Scores of 2, 3, 4, and 5 MUST add increasing amounts of strength, with 5
  adding the most. Any score (including 1) logged on an extinguished fire MUST relight it; a 1
  relights it as a minimal lit fire at strength 0.
- **FR-006**: The fire's total strength MUST equal the cumulative sum of the strength contributions
  of every scored day in the current active (lit) run.
- **FR-007**: A single past day with no score MUST NOT cause the fire to go out.
- **FR-008**: Two consecutive past calendar days with no score MUST cause the fire to go out.
- **FR-009**: When the fire goes out, its accumulated strength MUST reset to zero; subsequent
  logging MUST start a new fire from zero.
- **FR-010**: The fire's state (lit/out and current strength) MUST be derived deterministically from
  the full calendar of scores evaluated against the current date, so that the result is identical
  regardless of the order in which scores were entered.
- **FR-011**: When a user adds, changes, or clears a score for any day (including past days), the
  app MUST recompute and re-render the fire to reflect the updated calendar.
- **FR-012**: The fire animation MUST visibly distinguish at least the states: unlit/spark, lit
  (with a range of sizes from small to large), and gone out. In the "gone out" state the app MUST
  show NO flame and NO embers/particles until the fire is relit; it MAY show cold charred logs and a
  thin, dissipating smoke wisp to convey that the fire recently went out.
- **FR-013**: The calendar MUST visually indicate which days have scores (and ideally the score or
  intensity) and which days were missed.
- **FR-014**: All recorded scores MUST persist locally between app sessions so the fire's history is
  retained when the app is reopened.
- **FR-015**: On launch, the app MUST display a loading placeholder until saved scores have finished
  loading, then render the fire from the loaded data. The fire MUST NOT show a premature "unlit"
  state during loading, and any score entered while loading is in progress MUST NOT be discarded by
  the load completing.
- **FR-016**: The main view MUST present a settings button in the top-right corner; activating it
  MUST open a settings surface.
- **FR-017**: Settings MUST let the user choose the fire's color from at least Amber, Crimson, and
  Sapphire. The selected color MUST be applied to the flame and MUST persist across app restarts. A
  default color MUST be used until the user picks one.
- **FR-018**: The main view MUST be clean by default — showing only the flame and the settings
  button, with the calendar NOT visible.
- **FR-019**: The user MUST be able to reveal the calendar with a swipe-up gesture and hide it with a
  swipe-down gesture.
- **FR-020**: The calendar MUST be month-focused (showing one month at a time). The user MUST be able
  to navigate backward through any number of past months to reach and edit any past day. The user
  MUST NOT be able to navigate into future months; forward navigation is allowed only up to the
  current month.
- **FR-021**: While the fire is lit, the flame MUST emit rising particles (embers/sparks); the
  amount/intensity MAY scale with the fire's strength.

### Key Entities *(include if feature involves data)*

- **Daily Entry**: Represents one calendar day's productivity. Key attributes: the date, and an
  integer score from 1 to 5. A day with no entry is "missed". At most one entry per date.
- **Fire State**: A derived (not directly stored) representation of the bonfire computed from all
  Daily Entries and the current date. Key attributes: lit-or-out status, and current total strength
  (which maps to the animated size). Always recalculated from the calendar rather than edited
  directly.
- **Settings**: User preferences that persist across sessions. For this version the only attribute
  is the chosen fire color (one of at least Amber, Crimson, Sapphire), with a default until set.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can record a productivity score for a day and see the fire visibly update in
  under 3 seconds.
- **SC-002**: For any sequence of daily scores, the fire's computed strength matches the
  cumulative-sum rule exactly (a score of 1 adds zero; 2-5 add strictly increasing amounts) in 100%
  of cases. The flame's on-screen size increases with strength but MAY level off toward a maximum
  past a threshold so it remains on screen.
- **SC-003**: The fire goes out if and only if there are two consecutive missed past days, verified
  across all tested calendar patterns (0, 1, and 2+ consecutive misses).
- **SC-004**: Backfilling a missed day always produces the same fire state as if the score had been
  entered on that day originally, in 100% of tested cases (order-independence).
- **SC-005**: A new user can understand the core loop — log a day, grow the fire, don't miss two in
  a row — within their first session without external instructions.
- **SC-006**: Recorded scores survive app restarts with no data loss in 100% of sessions.
- **SC-007**: The animated flame renders at the device's display refresh rate — at least 120 frames
  per second on 120 Hz-capable devices and 60 frames per second on 60 Hz devices — with no sustained
  frame drops while the user is logging or changing scores.
- **SC-008**: A user can change the fire's color from the settings button in under 15 seconds, the
  flame reflects the new color immediately, and the choice is still applied after an app restart in
  100% of cases.
- **SC-009**: On opening the app the calendar is not visible; a single swipe-up reveals it and a
  single swipe-down hides it, in 100% of attempts.
- **SC-010**: When the fire is out, no flame or flame particles are visible in 100% of out-state
  cases.

## Assumptions

- **Single user, single device**: The app is a personal tracker with no accounts, login, or
  multi-device sync. Data is stored locally on the device.
- **Strength contribution mapping**: A reasonable default mapping is score 1 → +0, score 2 → +1,
  score 3 → +2, score 4 → +3, score 5 → +4 strength units per day. The exact visual scale of the
  flame is a design detail to be tuned during implementation; only the strictly-increasing ordering
  is a hard requirement. The flame's visual size grows with strength but levels off toward a maximum
  (soft cap) so it stays on screen, while the underlying strength value remains uncapped.
- **"Day" boundary**: Days are evaluated using the device's local calendar date; a day is
  considered "past/missed" only once that local date has fully elapsed.
- **No notifications in scope**: Reminders/push notifications to nudge daily logging are out of
  scope for this version (the calendar and flame are the only features).
- **Extinguish semantics**: When the fire goes out it fully resets to zero (confirmed with
  stakeholder); there is no partial penalty or dormant "keep size" mode.
- **History retention**: All past Daily Entries are kept indefinitely; there is no automatic purge.
- **Fire color options**: At minimum Amber, Crimson, and Sapphire are offered; more may be added
  later. The default fire color (used until the user chooses) is Amber.
- **Calendar navigation**: The calendar is month-focused (one month grid at a time) and opens on the
  current month. The user can page backward through past months without limit to edit any past day,
  and forward only up to the current month — never into future months (there are no future days to
  edit). Day-by-day stepping is not a separate control; navigation is by month.
- **Settings scope**: For this version, settings contains only the fire color; no other preferences
  are in scope.
- **Terminology ("strength" vs "size")**: "Strength" is the numeric magnitude of the fire (the
  cumulative sum of contributions); "size" is how that strength is shown as a larger flame. They are
  the same underlying quantity — strength is the metric, size is its visual representation. The app
  MAY also surface the strength value directly to the user via the flame caption (a state word such
  as "Conflagration" plus "strength N"), per the design; this is allowed, not required.
