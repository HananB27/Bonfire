# Feature Specification: Fire Health

**Feature Branch**: `007-fire-health`

**Created**: 2026-06-18

**Status**: Draft

**Input**: User description: "Fire Health. It should be a named state and visible through flame behavior. Suggested natural labels: Faint, Steady, Bright, Radiant. Fire Health should reflect score quality more than raw streak length. Higher-quality recent scores make the fire feel steadier, warmer, brighter, or more radiant. Lower scores keep the fire alive but make it feel more fragile or subdued. Conclusion: Fire Health should be visual-only. It should not change streak survival rules. It should not change fire strength math. It should not create gameplay advantages. It should help the user feel the quality of recent effort through the fire itself."

## Clarifications

### Session 2026-06-18

- Q: How much recent score history should Fire Health use? → A: Use the last 7 scored days, weighted so newer scores matter more.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read the Fire's Condition (Priority: P1)

A user looks at the fire and can tell whether recent effort has been weak or strong from the flame's named health state and visible behavior.

**Why this priority**: The feature exists to communicate recent effort quality through the fire itself. If users cannot read that signal, the feature does not deliver value.

**Independent Test**: Show the fire several known score histories and verify that observers can tell which histories are stronger by looking only at the flame behavior and its named state.

**Acceptance Scenarios**:

1. **Given** recent scores are consistently high quality, **When** the fire renders, **Then** it appears in a stronger named state such as Bright or Radiant and reads as stable, warm, and vivid.
2. **Given** recent scores are consistently low quality but the fire is still alive, **When** the fire renders, **Then** it appears in a weaker named state such as Faint or Steady and reads as more subdued or fragile.
3. **Given** recent scores improve over time, **When** the fire updates, **Then** the visible health moves toward stronger states.

---

### User Story 2 - Keep Gameplay Rules Unchanged (Priority: P1)

A user continues to play with confidence because Fire Health changes only appearance, not streak survival, scoring, or fire strength behavior.

**Why this priority**: The user explicitly asked for a visual-only signal. Any gameplay change would create confusion and unfairness.

**Independent Test**: Compare the same score histories with Fire Health enabled and disabled for visual comparison, and confirm that every gameplay result stays the same except the fire's appearance.

**Acceptance Scenarios**:

1. **Given** any score history, **When** Fire Health changes, **Then** streak survival rules remain unchanged.
2. **Given** any score history, **When** Fire Health changes, **Then** fire strength math remains unchanged.
3. **Given** a weak recent score pattern, **When** the fire is still alive under existing rules, **Then** the fire may look subdued but it does not gain or lose survival advantage from its health state.

### Edge Cases

- If there are not yet enough recent scores to judge quality, the fire should show a sensible neutral default state rather than a broken or hidden state.
- If recent score quality is mixed, the fire should reflect the overall recent pattern rather than being driven by a single outlier.
- If a long streak has weak recent scores, it should not look healthier than a shorter streak with stronger recent scores.
- If the fire is extinguished by existing rules, Fire Health must not override that outcome or imply that the fire is still healthy.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The fire MUST expose four named health states: Faint, Steady, Bright, and Radiant.
- **FR-002**: Fire Health MUST be derived primarily from the last 7 scored days, with newer scores weighted more heavily than older scores.
- **FR-003**: Fire Health MUST reflect recent score quality more than raw streak length, so a shorter 7-day history with stronger recent scores can appear healthier than a longer or older history with weaker recent scores.
- **FR-004**: Each health state MUST be visible through flame behavior that users can distinguish without reading score numbers or other hidden indicators.
- **FR-005**: The visual differences between states MUST communicate the expected feeling of the state: Faint as fragile or subdued, Steady as stable, Bright as lively and warm, and Radiant as the strongest and most vivid condition.
- **FR-006**: Fire Health MUST be visual-only and MUST NOT change streak survival rules, fire strength math, score totals, unlock outcomes, or any other gameplay result.
- **FR-007**: When recent score quality is insufficient to determine a strong or weak reading, the fire MUST display a defined default state rather than an ambiguous or broken state.
- **FR-008**: Low recent score quality MUST keep the fire alive when existing gameplay rules allow it, while still presenting a visibly weaker condition.

### Key Entities *(include if feature involves data)*

- **Fire Health State**: The user-facing condition of the fire, represented by the four named states.
- **Recent Score Quality**: The derived signal from recent effort that determines the fire's health state.
- **Flame Behavior**: The visible characteristics of the fire that communicate the current health state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a review of representative score histories, 100% of cases resolve to exactly one of the four named health states.
- **SC-002**: In blinded visual comparisons, at least 80% of observers can correctly identify which of two fire states represents stronger recent effort.
- **SC-003**: Across regression checks, enabling Fire Health produces 0 changes to streak survival outcomes, score totals, unlock results, and fire strength values.
- **SC-004**: In normal use, users can see a meaningful visual difference between adjacent health states within 5 seconds of observation.

## Assumptions

- Recent score history already exists and can be used as the input signal for Fire Health.
- Fire Health uses the last 7 scored days as the primary window, with newer scores carrying more influence than older scores.
- The four named states are the only user-facing labels for this feature.
- If there is not enough recent score history, Steady is the neutral default state.
- This feature does not add new user controls, stored preferences, or gameplay rules.
