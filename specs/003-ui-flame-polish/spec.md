# Feature Specification: UI & Flame Polish Fixes

**Feature Branch**: `003-ui-flame-polish`

**Created**: 2026-06-12

**Status**: Draft

**Input**: User description: "A smaller spec mostly meant to fix or amend features. The cog in the upper right corner, where the flames are selected, should be larger. In the calendar, the color of different score buttons should be different, with the 1 score having a white button, and scaling up through light yellow, yellow, orange, to 5 being red. The calendar must be able to brought up and down with swiping motions on the whole screen. Flames should give off surrounding light that is correct with their own color, instead of every flame having the same surrounding light and particles. Users Must Not be able to select flames that arent available to them currently."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Locked Flames Cannot Be Selected (Priority: P1)

A user opens the flame gallery and sees both unlocked and locked (embered) flames. When they tap
a locked flame, nothing is applied — their active flame stays unchanged. Only flames whose unlock
condition is currently satisfied can be chosen as the active flame.

**Why this priority**: This is an integrity fix. Allowing selection of locked flames defeats the
entire achievement-unlock system from the previous feature; everything else in this spec is
cosmetic by comparison.

**Independent Test**: With a calendar state where at least one flame is locked, attempt to select
that flame from the gallery and verify the active flame does not change; then select an unlocked
flame and verify it does.

**Acceptance Scenarios**:

1. **Given** a flame whose achievement condition is not currently met, **When** the user taps it in the flame gallery, **Then** the active flame does not change and the user receives clear feedback that the flame is locked.
2. **Given** a flame whose achievement condition is currently met, **When** the user taps it, **Then** it becomes the active flame as before.
3. **Given** a flame that was unlocked and selected as active, **When** its unlock condition stops being satisfied (e.g., the streak dies), **Then** the existing locked-fallback behavior applies and the user still cannot re-select it while locked.

---

### User Story 2 - Each Flame Glows in Its Own Color (Priority: P2)

A user switches between flames of different colors and sees that the ambient glow surrounding the
fire and the rising particles match the chosen flame's palette — a blue flame casts blue light and
blue sparks, a green flame green ones — instead of every flame sharing one identical orange glow.

**Why this priority**: The flame catalog's whole appeal is visual variety; a mismatched glow makes
every flame look half-finished and undermines the unlock reward.

**Independent Test**: Select two flames with clearly different palettes and visually compare the
surrounding glow and particle colors; each must match its flame, not a shared default.

**Acceptance Scenarios**:

1. **Given** any unlocked flame is active, **When** the fire is rendered, **Then** the surrounding ambient light derives from that flame's own palette.
2. **Given** any unlocked flame is active, **When** particles/sparks are emitted, **Then** their colors derive from that flame's own palette.
3. **Given** the user switches the active flame, **When** the new flame renders, **Then** glow and particles update to the new palette with no leftover colors from the previous flame.

---

### User Story 3 - Score Buttons Colored by Intensity (Priority: P3)

When scoring a day in the calendar, the user sees the five score buttons each in a distinct color
that communicates intensity at a glance: 1 is white, 2 is light yellow, 3 is yellow, 4 is orange,
and 5 is red.

**Why this priority**: Improves scannability and makes scoring faster and less error-prone, but
the current uniform buttons are functional.

**Independent Test**: Open the day-scoring controls in the calendar and verify each of the five
buttons displays its assigned color and remains legible.

**Acceptance Scenarios**:

1. **Given** the calendar's scoring controls are visible, **When** the user views the five score buttons, **Then** button 1 is white, 2 is light yellow, 3 is yellow, 4 is orange, and 5 is red.
2. **Given** any score button, **When** it is displayed in its color, **Then** its label remains clearly readable against that background.
3. **Given** a day already has a score, **When** the scoring controls are shown, **Then** the currently selected score is still visually distinguishable from the unselected ones.

---

### User Story 4 - Calendar Swipes Open and Closed from Anywhere (Priority: P4)

The user drags upward anywhere on the main screen to bring up the calendar, and drags downward
anywhere on the calendar screen to dismiss it — not only from a narrow edge zone.

**Why this priority**: The calendar already opens via a swipe; this widens the gesture area and
adds the symmetric dismiss gesture, a usability amendment rather than new capability.

**Independent Test**: Swipe up starting from several distinct areas of the main screen (center,
lower half, near the flame) and verify the calendar opens each time; then swipe down from several
areas of the calendar and verify it closes each time.

**Acceptance Scenarios**:

1. **Given** the main screen is showing, **When** the user swipes up starting anywhere on the screen, **Then** the calendar is brought up.
2. **Given** the calendar is showing, **When** the user swipes down starting anywhere on the calendar screen, **Then** the calendar is dismissed.
3. **Given** the calendar is showing, **When** the user taps or scrolls within calendar content without a dismiss-direction drag, **Then** the calendar stays open and the interaction works normally.

---

### User Story 5 - Larger Settings Cog (Priority: P5)

The user notices the cog in the upper-right corner of the main screen — the entry point to flame
selection — is larger and easier to see and tap.

**Why this priority**: Smallest change with the least functional impact; a pure ergonomic tweak.

**Independent Test**: Compare the cog's rendered size and tappable area before and after; verify a
tap anywhere on the enlarged target opens the flame selection as before.

**Acceptance Scenarios**:

1. **Given** the main screen is showing, **When** the user looks at the upper-right corner, **Then** the cog is visibly larger than before.
2. **Given** the enlarged cog, **When** the user taps anywhere within its touch area, **Then** flame selection opens exactly as it did previously.

### Edge Cases

- A flame's unlock expires (time-window flames) while the gallery is open: tapping it after expiry must be rejected like any other locked flame.
- The user begins a swipe on an interactive element (score button, flame tile): a tap must still register as a tap; only a clear directional drag moves the calendar.
- Swipe up while the calendar is already fully open, or down while it is closed: no effect, no visual glitch.
- A flame palette is very dark or very light: the glow and particles must still derive from that palette even if subtle, with no fallback to the shared default glow.
- Score 1's white button on a light background: the button must remain distinguishable (e.g., via outline or contrast treatment) while still reading as white.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST prevent a locked flame (one whose achievement condition is not currently satisfied) from being set as the active flame through any selection interaction.
- **FR-002**: System MUST give the user immediate, clear feedback when they attempt to select a locked flame (the attempt is visibly rejected rather than silently ignored).
- **FR-003**: System MUST continue to allow selection of any flame whose unlock condition is currently satisfied, with unchanged behavior.
- **FR-004**: System MUST derive the ambient/surrounding light of the rendered fire from the active flame's own palette.
- **FR-005**: System MUST derive particle/spark colors of the rendered fire from the active flame's own palette.
- **FR-006**: System MUST update glow and particle colors immediately when the active flame changes, while preserving the existing flame-switch performance standard (no perceptible drop below the established frame-rate target).
- **FR-007**: Calendar score buttons MUST each display a distinct fixed color by score value: 1 = white, 2 = light yellow, 3 = yellow, 4 = orange, 5 = red.
- **FR-008**: Score button labels and the selected-state indicator MUST remain clearly legible on each button's color.
- **FR-009**: Users MUST be able to open the calendar by swiping up starting anywhere on the main screen.
- **FR-010**: Users MUST be able to dismiss the calendar by swiping down starting anywhere on the calendar screen.
- **FR-011**: Whole-screen calendar gestures MUST NOT break taps, button presses, or scrolling within either screen; only a deliberate directional drag moves the calendar.
- **FR-012**: The upper-right cog control MUST be rendered larger, with a touch target at least meeting standard mobile minimum touch-target size, and MUST keep its existing behavior of opening flame selection.

### Key Entities

- **Flame**: Catalog entry with its own color palette and an achievement condition; its derived locked/unlocked state now also gates selection, and its palette now drives glow and particle colors.
- **Score Button**: One of five day-scoring controls in the calendar, each carrying a fixed color mapped to its score value (1–5).
- **Calendar Surface**: The slide-up panel over the main screen; now responds to whole-screen drag gestures in both directions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0% of selection attempts on locked flames result in the active flame changing, across all locked states (never-unlocked, streak-voided, window-expired).
- **SC-002**: For 100% of flames in the catalog, the surrounding glow and particle colors visibly correspond to that flame's palette, with no two differently-colored flames sharing an identical default glow.
- **SC-003**: Users can identify the value of any score button by color alone, and all five buttons are visually distinct from one another at a glance.
- **SC-004**: Opening and dismissing the calendar by swipe succeeds on the first attempt from any starting point on the respective screen in at least 95% of attempts.
- **SC-005**: Flame switching, including the new per-flame glow and particles, sustains the previously established rendering performance target (no regression below ≥120 FPS during transitions).
- **SC-006**: First-attempt tap success on the cog control improves, with the control's touch area meeting or exceeding the standard minimum mobile touch-target size.

## Assumptions

- "Larger cog" means both a larger visual icon and a larger tappable area; the standard minimum mobile touch target (~44pt) is the floor, with the icon scaled up proportionally. No reposition is requested.
- Score-button colors are fixed by score value and identical for every day; the white "1" button gets a subtle outline/contrast treatment so it stays visible on light surfaces.
- Locked flames remain visible in the gallery (embered preview per the existing feature) — they become non-selectable, not hidden.
- Rejection feedback for locked-flame taps is lightweight and immediate (e.g., a brief visual cue on the tile); no new dialogs or screens are introduced.
- "Whole screen" gestures cover the full surface with one deliberate exception: drags starting on interactive elements inside the calendar (score buttons, day cells) still move the calendar when they are clear directional drags, while plain taps behave normally. The settings cog (and the dev-only pill) sit above the gesture surface so their touches always win — a drag starting exactly on the cog does not open the calendar.
- Glow and particle colors are derived from each flame's existing palette in the single editable catalog; no new per-flame configuration fields are required by this spec (though they may be added if the palette alone is insufficient — an implementation decision).
- The existing swipe-up-from-status-bar-shade behavior is superseded/extended by the whole-screen gesture, not duplicated alongside it.
- All five fixes apply to the current single-user, on-device app; no data model or storage changes are expected.
