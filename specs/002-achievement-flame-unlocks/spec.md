# Feature Specification: Achievement-Locked Flame Styles

**Feature Branch**: `002-achievement-flame-unlocks`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "I want flame styles to be locked based on achievements. Each flame has an
associated achievement; fulfilling it unlocks the flame. Two achievement types by duration:
time-specific (last a number of days/weeks after the day the condition was fulfilled on the calendar —
not the current date; days cannot be banked, the clock counts from the last fulfillment) and
streak-specific (last for the streak they were achieved in; if the streak dies the flame peters out and
the flame relocks). Harder achievements give more exotic/exciting flames; time-specific achievements are
the most exciting because they are temporary. Flesh out a set of suggested flames (multicolor / fading
allowed) and add more as desired."

## Context & Dependencies

This feature builds directly on the existing **Bonfire Productivity Tracker** (feature 001). It reuses,
unchanged, that feature's fire model: a daily score of 1–5 per calendar day; a fire that is `unlit`,
`lit`, or `out`; a cumulative **strength** that grows with scores; the rule that the fire survives one
missed day but goes **out** after two consecutive missed past days; local-calendar-date day boundaries;
and the guarantee that the fire is recomputed deterministically from the full calendar so the result is
order-independent (backfilling a past day yields the same state as logging it on the day).

This feature **replaces the simple "fire color" setting** (Amber / Crimson / Sapphire) with a richer
**flame-style** system in which most styles are locked behind achievements.

### Shared definitions (used throughout)

- **Run**: the current alive segment of the fire — from the day it last (re)lit through today. A run
  survives isolated single missed days and ends only when the fire goes out (two consecutive missed past
  days), per feature 001.
- **Run strength (S)**: the fire's current strength (cumulative score contributions in the run).
- **Run days**: the number of scored days within the current run.
- **Unbroken chain (C)**: the count of consecutive calendar days, every one of them scored (no gaps),
  ending at the most recent scored day of the run.
- **Perfect day** = score 5. **Strong day** = score ≥ 4.
- **Calendar week**: Monday–Sunday in the device's local time.
- **Achievement day** (time-specific only): the most recent calendar day that *completes* an
  achievement's condition, determined from the calendar — **not** the current date.

## Clarifications

### Session 2026-06-12

- Q: For streak flames described as "an N-day run" (Sapphire/Sodium/Lilac), what does "N-day" count? → A: N scored days within the current alive run (single missed days tolerated, per feature-001) — i.e. **Run days ≥ N**. "Unbroken chain" and "daily-logged" achievements remain stricter (no gaps).
- Q: If the fire goes out while a time-specific flame is still inside its day-window, does that flame stay unlocked or relock? → A: It relocks. A dead fire voids **all** non-Amber flames (time and streak). A time flame is unlocked only while BOTH the date window is valid AND the fire is currently lit; relighting within the window restores it.
- Q: A time flame earned on day D with a W-day window stays unlocked for exactly how long? → A: Through **D+W inclusive** (earn day plus W more days); it expires once the date passes D+W. Days remaining = (D+W) − today.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Earn and equip a flame by completing an achievement (Priority: P1)

The user keeps their fire going and grows it. When their calendar reaches a flame's achievement
condition (for example, a 7-day run), the flame tied to that achievement becomes **unlocked**. The user
opens the flame gallery from settings, sees the newly unlocked flame, and equips it; the bonfire
immediately renders in that flame's style.

**Why this priority**: This is the core of the feature — turning daily productivity into a reward the
user can see on their fire. Without earning and equipping a flame, the feature delivers nothing.

**Independent Test**: From a fresh state, log scores until one flame's condition is met, confirm that
flame flips from locked to unlocked, equip it, and confirm the fire renders in the new style.

**Acceptance Scenarios**:

1. **Given** a flame whose condition is "a 7-day run" and a current run of 6 scored days, **When** the
   user scores a 7th consecutive day, **Then** that flame becomes unlocked without an app restart.
2. **Given** an unlocked flame in the gallery, **When** the user taps it, **Then** the bonfire renders
   in that flame's full style and the selection is marked active.
3. **Given** the default state (no achievements met), **When** the user opens the gallery, **Then**
   Amber is the only flame available to equip and every other flame is shown as locked.

---

### User Story 2 - Streak-specific flames peter out when the fire goes out (Priority: P2)

A streak-specific flame stays unlocked only while the current run still satisfies its condition. When the
fire goes out (two consecutive missed days), every streak-specific flame relocks. If the user had such a
flame equipped, the fire shows the out-state while out, and once relit it renders a dim, "embered"
version of that flame until the achievement is earned again in the new run.

**Why this priority**: The "use it or lose it" tension is what makes streak flames meaningful — they are
a living reflection of the current streak, not a permanent trophy.

**Independent Test**: Earn a streak flame, equip it, let two consecutive past days lapse so the fire goes
out, and confirm the flame relocks; relight the fire and confirm it shows the embered variant until the
condition is met again, then returns to full color.

**Acceptance Scenarios**:

1. **Given** an unlocked streak-specific flame in an alive run, **When** the fire goes out, **Then** that
   flame relocks.
2. **Given** an equipped streak flame whose fire just went out, **When** the user views the fire, **Then**
   the out-state visuals are shown (no flame/embers) and the flame is locked.
3. **Given** the fire was relit but the streak flame's condition is not yet met again, **When** the user
   views the lit fire, **Then** it renders the dim/embered variant of that flame.
4. **Given** the relit run later re-meets the condition, **When** the user views the fire, **Then** the
   flame returns to full vibrancy automatically.

---

### User Story 3 - Time-specific flames expire after their window (Priority: P2)

A time-specific flame unlocks on the calendar day its condition is completed and stays unlocked for a
fixed window (a number of days) measured from that day. Days cannot be banked: if the user completes the
condition again later, the window resets to count from the most recent completion. After the window
elapses with no new completion, the flame expires and relocks (and, if equipped, the fire shows the
embered variant).

**Why this priority**: Time flames are the most exotic, exciting rewards precisely because they are
fleeting — they must be re-earned, which keeps the most thrilling styles tied to sustained effort.

**Independent Test**: Complete a time achievement, confirm the flame unlocks with a countdown; advance the
date past the window with no re-completion and confirm it expires; re-complete the condition and confirm
the window resets from the new completion day.

**Acceptance Scenarios**:

1. **Given** a time flame with a 14-day window completed on day D and a lit fire, **When** the current
   date is within 14 days of D, **Then** the flame is unlocked.
2. **Given** the same flame, **When** the current date passes D + 14 with no re-completion, **Then** the
   flame expires and relocks.
2a. **Given** a time flame still inside its window, **When** the fire goes out, **Then** the flame
   relocks; **and When** the fire is relit while still inside the window, **Then** the flame is unlocked
   again.
3. **Given** an expired time flame, **When** the user completes its condition again on a later day D2,
   **Then** the flame unlocks again with the window now counting from D2 (no leftover days from D).
4. **Given** a time flame still inside its window, **When** the user completes its condition again,
   **Then** the window extends to start from the newer completion day (availability only lengthens, never
   shortens).

---

### User Story 4 - Browse the flame gallery with locked teasers and live progress (Priority: P3)

The user opens the flame gallery and sees every flame in the catalog — unlocked ones ready to equip, and
locked ones shown with their name, colors, the achievement required, and live progress. For streak flames
the progress shows how close the current run is (e.g., 4 of 7 days); for time flames it shows the days
remaining in the window, or, if expired, what is needed to re-earn it.

**Why this priority**: Seeing the full catalog and exactly how to earn each flame is what motivates the
user to keep going; it makes the reward system legible without external instructions.

**Independent Test**: Open the gallery with a partial run in progress and confirm each locked flame shows
its requirement and a progress value that updates as scores are logged.

**Acceptance Scenarios**:

1. **Given** any locked flame, **When** the user views the gallery, **Then** its name, colors, and
   achievement requirement are shown.
2. **Given** a locked streak flame requiring a 7-day run and a current run of 4 days, **When** the user
   views the gallery, **Then** it shows progress of 4 of 7.
3. **Given** an unlocked time flame, **When** the user views the gallery, **Then** it shows the number of
   days remaining before it expires.
4. **Given** an expired time flame, **When** the user views the gallery, **Then** it is shown as locked
   with a prompt describing how to re-earn it.

---

### User Story 5 - Editing past days recomputes unlock states deterministically (Priority: P3)

Because the fire is computed from the whole calendar, editing past days can change which flames are
unlocked. Backfilling a missed day can complete a streak achievement; clearing a high-scoring day can drop
a run below a threshold and relock a streak flame. A time achievement that is completed only by an old,
backfilled day whose window has already passed does **not** unlock the flame (its window is in the past).

**Why this priority**: Determinism and order-independence are core promises of the app; the achievement
layer must honor them so results never depend on the order edits were made.

**Independent Test**: Reach a state by logging chronologically, then reach the same calendar by editing in
a different order, and confirm the set of unlocked flames is identical.

**Acceptance Scenarios**:

1. **Given** a run one day short of a streak flame's condition, **When** the user backfills an eligible
   earlier day that completes the condition, **Then** the flame unlocks.
2. **Given** an unlocked streak flame, **When** the user clears a day so the run no longer satisfies the
   condition, **Then** the flame relocks.
3. **Given** two different orders of the same set of edits, **When** the calendar ends identical, **Then**
   the set of unlocked flames is identical.
4. **Given** a time achievement that would have been completed only by a backfilled day already older than
   the flame's window, **When** the calendar is evaluated against the current date, **Then** the flame
   stays locked.

---

### User Story 6 - Preview a not-yet-earned flame as an embered variant (Priority: P4)

The user can set any flame as their active style even before earning it. While that flame is locked, the
fire renders a dim, desaturated "embered" version of it — a teaser of what the flame will look like.
The moment the achievement is met, the fire bursts into the flame's full color automatically.

**Why this priority**: Letting users "pin" a goal flame and see a preview is motivating, but it is a layer
on top of the core earn/equip/expire loop.

**Independent Test**: Equip a locked flame, confirm the fire shows its embered variant, meet the
achievement, and confirm it switches to full color with no further action.

**Acceptance Scenarios**:

1. **Given** a locked flame, **When** the user equips it, **Then** the lit fire renders the embered
   variant of that flame.
2. **Given** an equipped, locked flame, **When** its achievement is met, **Then** the fire switches to the
   flame's full style automatically.
3. **Given** Amber (always unlocked) is equipped, **When** the user views the fire, **Then** it always
   renders at full vibrancy (Amber never appears embered).

---

### Edge Cases

- **Equip while locked**: Equipping a flame that is not yet earned shows the embered variant; it is never
  blocked.
- **Out-state precedence**: While the fire is out, ALL non-Amber flames (time and streak) are relocked,
  and the existing out-state visuals (charred logs + smoke, no flame or embers) take precedence over any
  equipped flame style, embered or full. Relighting restores any time flame still inside its window.
- **Midnight expiry**: A time flame can expire purely because the date advanced past its window, with no
  user action; its gallery countdown reaches zero and it relocks.
- **Backfilled, already-expired time completion**: Completing a time condition only via an old backfilled
  day whose window has already elapsed leaves the flame locked.
- **Edit relocks a streak flame**: Clearing or lowering a day so the run drops below a streak condition
  relocks that flame.
- **Re-earn while still valid**: Re-completing a time condition while still in-window resets/extends the
  window from the newer day; it never shortens availability.
- **Simultaneous unlocks**: Meeting conditions for several flames at once unlocks all of them; the user
  equips one while the others remain available (each on its own terms).
- **Today completes a condition**: A condition completed on the current day unlocks the flame today, with a
  time window starting today.
- **Only-Amber baseline**: Before any achievement is met, only Amber is equippable; Crimson and Sapphire
  are now earned rather than free.
- **Re-earnable forever**: Every streak and time flame can be earned, lost, and earned again any number of
  times; nothing is consumed permanently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST maintain a catalog of flame styles, each tied to exactly one achievement that
  unlocks it. Amber MUST always be unlocked and serves as the default style.
- **FR-002**: All flame styles except Amber — including Crimson and Sapphire — MUST be achievement-locked
  by default.
- **FR-003**: Each achievement MUST be classified as either **streak-specific** or **time-specific**.
- **FR-004**: A flame's unlock state MUST be derived deterministically from the full calendar of scores
  and the current date, recomputed on every change, so the result is order-independent (consistent with
  feature 001's fire computation). Unlock states MUST NOT be stored.
- **FR-005**: A **streak-specific** flame MUST be unlocked exactly while the current alive run satisfies
  its condition. It MUST relock when the fire goes out (the run ends and strength resets) or when an edit
  causes the run to no longer satisfy the condition.
- **FR-006**: A **time-specific** flame MUST unlock on its **achievement day** — the most recent calendar
  day that completes its condition, determined from the calendar and NOT from the current date.
- **FR-007**: A time-specific flame MUST remain unlocked only while BOTH (a) the current date is within
  its window — from the achievement day D through D + W inclusive (W = the flame's window length in
  days), expiring once the date passes D + W — AND (b) the fire is currently lit. After the window
  elapses with no re-completion, it MUST relock ("expire").
- **FR-007a**: When the fire goes out, ALL non-Amber flames MUST relock — time-specific as well as
  streak-specific (a dead fire voids every earned flame). Relighting the fire while a time-specific
  flame's window is still valid MUST restore that flame to unlocked.
- **FR-008**: Re-completing a time-specific condition on a later calendar day MUST reset the window to
  count from that later day. The window MUST count only from the most recent completion; days MUST NOT be
  banked or accumulated across completions.
- **FR-009**: Re-completing a time condition while the flame is still in-window MUST extend availability
  (window restarts from the newer day); it MUST never shorten the remaining availability.
- **FR-010**: If a time-specific condition is completed only by a past (backfilled) day whose window has
  already elapsed relative to the current date, the flame MUST remain locked.
- **FR-011**: The catalog MUST order difficulty to match exoticness: harder achievements map to more
  exotic/exciting flames, and time-specific flames MUST be the most exotic tier (the hardest, most
  visually striking styles).
- **FR-012**: Users MUST be able to select any flame in the catalog as their active style, replacing the
  former simple color selection.
- **FR-013**: While the active flame is unlocked, the lit fire MUST render that flame's full style.
- **FR-014**: While the active flame is locked (never earned, streak relocked, or time-expired), the lit
  fire MUST render a dim, desaturated "embered" variant of that same flame until it is (re)earned, at
  which point it MUST return to full vibrancy automatically. Amber, always unlocked, MUST never render as
  embered.
- **FR-015**: When the fire is out, the existing out-state visuals (charred logs + smoke, no flame/embers)
  MUST take precedence over any equipped flame style.
- **FR-016**: The app MUST provide a flame gallery (reached from the settings surface) listing every flame
  in the catalog with its current unlocked/locked status.
- **FR-017**: For each locked flame, the gallery MUST show its name, its colors, and the achievement
  required to unlock it.
- **FR-018**: The gallery MUST show live progress toward each locked flame — for streak flames a progress
  measure toward the condition (e.g., current / required), and for time flames the days remaining in the
  window (computed as (D + W) − today, where D is the achievement day and W the window length), or, when
  expired, an indication of how to re-earn it.
- **FR-019**: Newly meeting an achievement MUST make the flame unlocked and equippable without requiring an
  app restart (reflected at the next render of the fire and gallery).
- **FR-020**: Adding, changing, or clearing any day's score MUST recompute all flame unlock states and
  update both the gallery and the rendered fire.
- **FR-021**: The user's active flame selection MUST persist across app restarts. (Because unlock states
  are derived, a selection may be locked on restart and render embered until re-earned.)
- **FR-022**: Every streak-specific and time-specific flame MUST be re-earnable indefinitely after
  relocking or expiry; no flame is consumed permanently by being earned once.
- **FR-023**: The app SHOULD give brief in-app feedback when a flame newly unlocks (for example, a subtle
  highlight or animation in the gallery and/or on the fire). No push notifications are in scope.
- **FR-024**: Each flame in the catalog MUST have a defined full style (its multicolor gradient / fade) and
  a defined embered variant derived from it.
- **FR-025**: The user MUST be able to open the calendar with an upward swipe begun **anywhere** on the
  closed main view (a full-screen "status-bar-shade" pull), not only from a small handle. Taps elsewhere
  (e.g. the settings button) MUST still work — the pull activates only on upward movement. (Refines
  feature 001's swipe-up/down calendar reveal.)

### Key Entities *(include if feature involves data)*

- **Flame Style**: A visual style for the bonfire. Attributes: name; rarity/tier; full appearance
  (multicolor gradient stops and any color-fade/drift behavior); embered (dim, desaturated) variant; and
  the one achievement that unlocks it. Amber is the always-unlocked default. (See Appendix A for the full
  catalog.)
- **Achievement**: The condition that unlocks a flame. Attributes: type (streak-specific or
  time-specific); a human-readable requirement; a precisely testable condition over the calendar; for
  time-specific, a window length (in days); and how progress toward it is measured for the gallery.
- **Achievement State (derived, never stored)**: Per flame, computed from the calendar and current date:
  locked or unlocked; progress toward the condition; and, for time-specific, the achievement day and the
  days remaining (or expired).
- **Active Flame Selection (stored)**: The user's chosen flame style. Persists across sessions and
  replaces the previous "fire color" setting. The only stored part of this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When a user meets a flame's achievement, that flame becomes unlocked and equippable within
  one screen refresh, with no app restart, in 100% of cases.
- **SC-002**: A streak-specific flame is shown unlocked if and only if the current run satisfies its
  condition, verified across alive, relit, and edited calendars (0/1/2+ missed-day patterns) in 100% of
  tested cases.
- **SC-003**: A time-specific flame is shown unlocked if and only if the current date is within its window
  of the achievement day AND the fire is currently lit, verified for in-window-lit, in-window-but-out,
  just-expired, and re-earned cases in 100% of tested cases.
- **SC-004**: Re-completing a time condition keeps the flame continuously unlocked across back-to-back
  completions and always expires exactly the window length after the most recent completion (no
  day-banking), in 100% of tested cases.
- **SC-005**: For any two orderings of the same set of score edits that yield the same calendar, the set of
  unlocked flames is identical (order-independence), in 100% of tested cases.
- **SC-006**: An equipped flame renders at full vibrancy when unlocked and as its embered variant when
  locked, and switches between them immediately when the unlock state changes, in 100% of cases.
- **SC-007**: The active flame selection persists across app restarts in 100% of sessions.
- **SC-008**: On their first visit to the gallery, a user can determine, for every locked flame, what to do
  to earn it and how close they are, without external instructions.
- **SC-009**: The catalog's exotic/time-specific flames require strictly harder conditions than the
  base/streak flames, verifiable directly from the catalog's difficulty ordering.
- **SC-010**: The bonfire renders at the device's refresh rate (at least 120 FPS on 120 Hz devices, 60 FPS
  on 60 Hz devices) for every flame style, including the multicolor/fading styles, with no sustained frame
  drops — inheriting feature 001's performance bar.

## Assumptions

- **Builds on feature 001**: The fire model (scores 1–5, strength, out-after-two-misses, local-date
  boundaries, deterministic order-independent recomputation) is reused unchanged; this feature only adds
  the achievement/flame-style layer on top.
- **Only Amber is free** (stakeholder decision): Crimson and Sapphire are now earned via easy
  streak achievements, alongside the new exotic flames. Amber is the default style and fallback.
- **Embered display for locked-but-equipped flames** (stakeholder decision): a locked flame the user has
  equipped renders as a dim, desaturated variant of itself until earned; it is not blocked from selection
  and does not auto-swap to a different flame.
- **Gallery shows full teasers with live progress** (stakeholder decision): locked flames are visible with
  name, colors, requirement, and progress/countdown — not hidden or shown as silhouettes.
- **Achievement day under backfill**: For time-specific achievements, the achievement day is the most
  recent calendar day that completes the condition, computed from the calendar; consequently a backfilled
  completion older than the window grants nothing.
- **Concrete thresholds are tunable**: The specific numbers and window lengths in Appendix A are starting
  values to be tuned during design. Only the rule semantics (FR-001…FR-024) and the relative difficulty
  ordering (FR-011, SC-009) are hard requirements.
- **Calendar week boundary**: Week-based conditions use a Monday–Sunday local week; the exact boundary is a
  tunable detail.
- **Selection storage extends settings**: The active flame selection supersedes the previous single
  "fire color" preference; on upgrade, an existing Amber/Crimson/Sapphire color choice maps to the
  corresponding flame style (and may render embered if now locked).
- **No notifications**: Consistent with feature 001, unlock feedback is in-app only; no push/reminder
  notifications are in scope.
- **Re-earnable forever**: There is no permanent "collected" consumption; all non-Amber flames cycle
  between locked and unlocked as the calendar dictates.

## Appendix A — Flame Catalog *(product content; color values are design starting points)*

Difficulty rises down each list; **streak** flames are grounded and re-earn with the streak, **time** flames
are the exotic, temporary tier. Gradient stops read core → … → base; "fade/drift" notes describe motion.
Each flame's **embered variant** is the same gradient grey-shifted to low saturation with reduced
glow/height (defined once as a rule, not per flame).

Condition wording: **"an N-day run"** means **Run days ≥ N** (N scored days in the current run, single
missed days tolerated). **"Unbroken chain"** and **"daily-logged"** are stricter — N consecutive scored
calendar days with no gaps.

### Base (always unlocked)

| Flame | Vibe | Gradient (full) | Unlock |
|-------|------|-----------------|--------|
| **Amber** | Classic warm campfire; default | `#fff4cf → #ffd27a → #ffae3b → #ff7a18 → #b3380f` | Always available |

### Streak-specific (unlocked while the current run satisfies the condition; relock when the fire goes out)

| Flame | Vibe | Gradient (full) | Achievement |
|-------|------|-----------------|-------------|
| **Crimson** | Deep scarlet starter | `#fff0d6 → #ffc27a → #ff7a3b → #ff3b1f → #7a0f0f` | Run strength ≥ 5 |
| **Sapphire** | Cool blue burn | `#f0f9ff → #bfe3ff → #4ab6ff → #2a8bff → #163f8a` | A 5-day run |
| **Sodium** | Monochrome street-lamp yellow-orange, flickering | `#FFF6B0 → #FFC400 → #E36A00` | A 7-day run |
| **Strontium** | Richer, deeper scarlet than Crimson | `#FFC9B0 → #FF3B2E → #8C0A12` | 5 strong days (≥4) in the run |
| **Emerald** | Copper-flame green; alien but real, teal-flickering edges | `#EAFFC2 → #6FE85A → #1FB36A → #138A2E` | Run strength ≥ 20 |
| **Lilac** | Soft potassium violet, pale tips fading deep | `#FFE6FF → #C77DFF → #6A2FB5` | A 10-day run |
| **Magenta** | Vivid lithium pink-red, hot core | `#FFD9EC → #FF4D9D → #B0114E` | Run strength ≥ 40 |
| **Ghostlight** | Pale blue-white inner gas cone — hottest "real" fire; prestige streak | `#FFFFFF → #BFE6FF → #4FA8FF` (faint violet base) | Run strength ≥ 80 **and** a 14-day run |

### Time-specific (unlock on the achievement day, expire after the window; re-earn to reset)

| Flame | Vibe | Gradient (full) + fade | Achievement | Window |
|-------|------|------------------------|-------------|--------|
| **Toxic** | Radioactive acid neon green, aggressive flicker | `#F2FFB0 → #9AFF1E → #2EA800` | 3 consecutive perfect days (5,5,5) | 7 days |
| **Wisp** | Eerie swamp-gas teal-green, translucent, wandering tips | `#DFFFF6 → #5FE0C0 → #1E7F86` | A 5-day unbroken chain with no day below 3 | 10 days |
| **Ember** | Dying-coals calm low glow, slow pulse | `#FFB060 → #E8501E → #5C0E08` | A 10-day daily-logged run with average score ≤ 2 (the slow burn) | 14 days |
| **Spectral** | Semi-transparent cyan-white soulfire, ghostly shimmer | `#F0FFFF → #7FFFE0 → #2E9FB0` (low opacity) | Comeback: after going out, relight and reach run strength ≥ 30 within 7 days | 10 days |
| **Frostfire** | Cold burn; icy cyan-white reading as "cold" | `#FFFFFF → #9FE8FF → #2E7BD6` | Every day of one calendar week scored (7/7, any score) | 14 days |
| **Inferno** | White-hot core bleeding to orange; brightest/hottest | `#FFFFFF → #FFD24A → #FF5A00` | A calendar week where all 7 days are strong (≥4) | 14 days |
| **Solfire** | Solar-corona blinding white-gold, regal, radiating halo | `#FFFFFF → #FFE066 → #FFA21E` | Cross run strength ≥ 100 | 14 days from crossing |
| **Voidfire** | Purple-black dark flame; core swallows light, edges glow | `#E2B3FF → #8B2FE0 → #2A0A4A` (near-black inner void) | A 14-day unbroken chain (no gaps) | 21 days |
| **Aurora** *(new)* | Northern-lights ribbons; hue drifts green→teal→magenta→violet | `#B8FFD9 → #5FE0C0 → #FF7AD9 → #8B2FE0` (slow color drift) | A 30-day unbroken chain | 21 days |
| **Phoenix** *(new)* | Rebirth flame; ash-grey roots igniting to gold then white | `#4A4A4A → #FF5A00 → #FFD24A → #FFFFFF` (rising shimmer) | Bring the fire back from out 3 separate times, each rebuilt to strength ≥ 30 | 21 days from the 3rd |
| **Nebula** *(new, hardest)* | Cosmic star-nursery; violet base, teal mid, gold sparks drifting | `#2A0A4A → #2E9FB0 → #7FFFE0 → #FFE066` (drifting hue) | Two consecutive perfect weeks (14 days, all ≥4 with ≥10 perfect days) | 21 days |
