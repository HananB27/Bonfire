<!-- gardener-constitution-proposal: v1 -->
# Gardener Rules

## Protected Modules

- `src/domain/fire.ts` because Pure fire-state engine that is the test oracle for fire strength, gaps, and extinguishing rules per the fire-engine contract; changes alter every derived fire state.
- `src/data/entriesStore.ts` because Sole persistence boundary for scores and notes in AsyncStorage; the contract requires loadEntries never throws and round-trip equality, and the versioned v1 key must be preserved for migrations.
- `src/data/settingsStore.ts` because Persists the selected flame color with a fallback to Amber on invalid values; the round-trip and never-throw guarantees are contractual (FR 016, FR 017, SC 008).
- `src/hooks/useEntries.ts` because Validates scores (1..5) and rejects future dates before persisting, and recomputes fire via useMemo to satisfy FR 011; regressions here corrupt user history.
- `src/hooks/useSettings.ts` because Validates the flame color enum and persists it; governed directly by the settings-store contract.
- `src/components/Bonfire/flameModel.ts` because Pure flame math with contractual guarantees (intensity(0)===0, monotonic strength, soft-cap asymptote, unlit visual defaults) that the Skia flame depends on.
- `src/domain/achievements.ts` because Derives unlockable flame styles from streak and time-based achievements; changes alter user progression and reward state.
- `src/theme/tokens.ts` because Design tokens ported from the BonfireDesign styles.css reference; the calendar heat ramp indexes heat[score] and must keep matching the design.

## Never-Touch Paths

- `specs/**` because Product specs, contracts, and checklists are the authoritative scope; they must be changed through the spec workflow, not by automated maintenance.
- `.agents/**` because Agent skill and instruction files define how the tooling itself operates and are not application code.
- `.claude/**` because Agent skill and context configuration for the coding assistant; editing it changes tool behavior rather than the app.
- `src/data/**` because Local-first persistence layer: any change risks data loss for on-device scores, notes, and settings, which have no server-side backup.
- `**/.env*` because secrets must never be modified by Gardener.
- `**/secrets/**` because secret material requires human handling.

## Autonomous Fixes Allowed

- Add or correct missing JSDoc/comments in src/domain and src/components/Bonfire without changing logic
- Fix ESLint and Prettier formatting violations in src/ and __tests__/ (run eslint-config-expo and prettier)
- Remove unused imports and dead variables flagged by TypeScript strict mode in non-protected modules
- Update outdated type-only imports or @types/* usage that does not alter runtime behavior
- Correct typos in string literals of UI copy outside protected domain logic

## Assisted Fixes Allowed

- Refactor src/components/Calendar/CalendarSheet.tsx and ScorePickerBar.tsx gesture/layout code with human review of Reanimated and Gesture Handler behavior
- Resolve import cycles flagged between src/components/Bonfire/* modules and src/domain or src/theme
- Update Expo SDK / React Native / Reanimated / Skia dependency versions in package.json, verifying native build and flame rendering manually
- Modify Jest mocks in jest.setup.js and __tests__ fixtures when test infrastructure changes
- Adjust src/components/Settings/FlameGallery.tsx and SettingsSheet.tsx UI behavior tied to flame color selection

## Advisory-Only Areas

- Fire engine rule changes such as the one-missed-day allowance or the two-day extinguish threshold, which are product decisions
- Achievement thresholds and unlock criteria in src/domain/achievements.ts and src/domain/flames.ts
- Flame visual tuning in flameModel.ts and palettes.ts that affects the look the design was ported from
- Storage schema versioning strategy (v1 key migration) before any change to the persisted format
- Scene atmosphere and time-of-day adaptation logic in BonfireScreen.tsx and FireScene.tsx

## Architecture Boundaries

- Pure domain code in src/domain must not import React, React Native, AsyncStorage, or read Date.now(); today is always passed in
- Only src/data/*Store.ts modules may access AsyncStorage; components and hooks go through the store/hook layer
- Components under src/components must not hold fire-derivation logic; derived state comes from computeFire via useEntries
- Theme values come from src/theme/tokens.ts and palettes.ts; do not hardcode colors in components
- No continuous JS timers for atmosphere; time-of-day adaptation must stay event-driven per the README design
- Keep the app local-first: no network calls or remote persistence introduced without a spec change

## Test Rules

- Run the Jest suite (jest-expo preset) for every change; the fire-engine, flameModel, and store tests are the contractual oracles and must stay green
- Store round-trip tests must use a mocked AsyncStorage and verify loadEntries/saveEntries and loadSettings/saveSettings deep equality
- Fire-engine behavior table scenarios (no entries, single score, consecutive streak, one missed day, two missed days) must each have a passing test
- Score validation tests must cover out-of-range scores (0, 6) and future dateKeys as no-ops
- Component tests (BonfireScreen, CalendarSheet) should use react-test-renderer and not depend on real Skia rendering
- Type-check with TypeScript strict mode and lint with eslint-config-expo before merging
- Flame visual changes require manual device or simulator review since no snapshot covers Skia output

## Ignored Paths

- `node_modules/**`
- `.expo/**`
- `ios/**`
- `android/**`
- `dist/**`
- `coverage/**`
- `*.lock`
- `.specify/**/cache/**`
- `BonfireDesign/**`

## Health Priorities

- Current entropy classification: `no_autonomy`.
- Current entropy score: `37.5`.
- Prefer focused, reviewable maintenance PRs.

## Trigger and PR Preferences

- Prefer small PRs scoped to one maintenance category.
- Do not auto-merge Gardener PRs.
