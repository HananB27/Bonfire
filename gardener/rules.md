<!-- gardener-constitution-proposal: v1 -->
# Gardener Rules

## Protected Modules

- `src/domain/fire.ts` because The fire engine is the deterministic oracle for fire state, and the spec forbids I/O, React, and Date.now() inside it, so any change alters every derived fire state.
- `src/data/entriesStore.ts` because The spec makes this the only persistence layer for scores, with a never-throw load guarantee, a round-trip guarantee, and a versioned v1 key that a future migration depends on.
- `src/data/settingsStore.ts` because The spec requires an invalid flameColor to fall back to Amber and requires a round-trip guarantee, so changes here affect stored user preferences.
- `src/hooks/useEntries.ts` because The spec defines its validation rules (score 1..5, no future dates), optimistic updates, and useMemo-driven fire recomputation, so mistakes here corrupt stored history.
- `src/domain/achievements.ts` because Flame-style unlocks come from streak and time achievements, and the analysis flagged this file for ownership risk, so unlock logic changes can silently lock or unlock content.
- `src/domain/flames.ts` because The flames catalog defines collectible styles that the flagged test flames.catalog.test.ts depends on, so identifiers and ordering here are persisted by selection.
- `src/components/Bonfire/flameModel.ts` because The spec fixes its guarantees (intensity(0)===0, monotonic, soft cap toward 1, fixed height for non-lit states), and flameModel.test.ts encodes them.
- `src/theme/palettes.ts` because The palettes are ported from the BonfireDesign source, and the flagged settings/gallery components select among them, so edits break visual parity with the design.
- `src/hooks/useSettings.ts` because It validates the flame-color enum and persists it (FR 016/017, SC 008), and it was flagged by the analysis signals.
- `src/components/Calendar/CalendarSheet.tsx` because This is the logging and editing surface for scores, and its gesture and state flow was flagged, so regressions here block core input.

## Never-Touch Paths

- `specs/**` because The specs are the authoritative statement of scope and fix/no-fix policy, and the tool should not rewrite them.
- `.specify/**` because Spec Kit project configuration and hook definitions are maintained by the spec workflow, not by maintenance automation.
- `.agents/skills/**` because These are agent instruction files that define the project's quality rules and must not be altered by the maintenance tool.
- `.claude/skills/**` because These mirror the agent skill instructions and are maintained as part of the spec workflow.
- `BonfireDesign/**` because This is the design source that the flame model, theme tokens, and palettes are ported from, and it is the reference for visual parity.
- `**/.env*` because secrets must never be modified by Gardener.
- `**/secrets/**` because secret material requires human handling.

## Autonomous Fixes Allowed

- Formatting-only Prettier changes in src/ and __tests__/ with no behavior change, provided the repository is not in a no-autonomy state
- Removing unused imports flagged by eslint-config-expo in non-protected files
- Adding missing type annotations that do not change runtime behavior in non-protected files under src/components/ and src/screens/

## Assisted Fixes Allowed

- Replacing deprecated React Native, Expo SDK 56, or Reanimated APIs in UI components, with a proposed diff for review
- Adjusting jest-expo or react-test-renderer test setup in jest.setup.js and __tests__ files, with human confirmation
- Resolving the import cycles flagged in src/components/Bonfire/ by moving shared types, with human review of the dependency graph
- Updating Skia drawing code in Flame.tsx, Embers.tsx, and Hearth.tsx when a dependency upgrade requires it

## Advisory-Only Areas

- Current entropy classification is no_autonomy, so every change should be proposed as a patch or comment rather than applied directly
- Flame visual tuning (height, glow, intensity curve, Fire Health tiers) should be reviewed against the design source and FR/SC mapping before changes
- Achievement thresholds and flame unlock rules in achievements.ts are product decisions and should be reviewed with the spec owner
- Upgrades to Expo SDK, React Native, Reanimated, or React Native Skia should be advised on because they affect the Worklets and Skia rendering path
- Any change to the AsyncStorage key version (v1) needs a migration plan, which the spec anticipates but does not define

## Architecture Boundaries

- src/domain/fire.ts must remain framework-free: no React imports, no AsyncStorage, no Date.now(); today is always passed in as an ISO local date key
- Only src/data/ modules may touch AsyncStorage; components and hooks must go through entriesStore and settingsStore
- flameModel.ts must stay pure math with no React or Skia imports so it remains unit-testable
- Theme tokens in src/theme/ must mirror the values ported from styles.css; the calendar heat ramp indexes heat[score] from 1 to 5
- The app is local-first: no network calls and no continuous JS timers, with scene atmosphere derived from local time at render or on demand
- Derived state (fire, achievements, health) must be recomputable from stored entries alone; do not persist derived values

## Test Rules

- Run the Jest suite under __tests__/ with jest-expo, which covers BonfireScreen, CalendarSheet, achievements, fireMetrics, flameModel, and flames.catalog
- Fire engine changes must keep the behavior table from fire-engine.md green, including single-score, consecutive-day, and two-missed-day extinguish cases
- flameModel changes must keep intensity(0)===0, strict monotonicity in strength, and the asymptote toward 1
- entriesStore and settingsStore tests must mock AsyncStorage and verify the never-throw load and round-trip guarantees
- Hook tests for useEntries must verify that setScore rejects scores outside 1..5 and future dates, and that clearScore removes the key
- Use react-test-renderer for component tests; Skia and Reanimated output should be verified via snapshot or prop assertions rather than pixel comparisons
- Map every test change back to its FR or SC identifier in the spec, since the requirements checklist is the acceptance reference

## Ignored Paths

- `node_modules/**`
- `ios/**`
- `android/**`
- `.expo/**`
- `dist/**`
- `web-build/**`
- `coverage/**`
- `**/*.lock`

## Health Priorities

- Current entropy classification: `no_autonomy`.
- Current entropy score: `37.5`.
- Prefer focused, reviewable maintenance PRs.

## Trigger and PR Preferences

- Prefer small PRs scoped to one maintenance category.
- Do not auto-merge Gardener PRs.
