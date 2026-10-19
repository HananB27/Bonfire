<!-- gardener-constitution-proposal: v1 -->
# Gardener Rules

## Protected Modules

- `src/domain/fire.ts` because Pure fire-state engine that is the oracle for all fire/strength/streak behavior; per contracts/fire-engine.md it must stay pure (no I/O, no React, no Date.now()) and its behavior table is the test oracle, so changes here alter core product logic.
- `src/data/entriesStore.ts` because Sole persistence boundary for user scores and notes in AsyncStorage (versioned v1 key); per contracts/entries-store.md the rest of the app must not touch AsyncStorage directly, and corrupt-data handling must never throw. Data loss or key changes break user history.
- `src/data/settingsStore.ts` because Persistence for user preferences (flame color); per contracts/settings-store.md invalid values must fall back to Amber and round-trip must hold, so changes can silently reset or corrupt user settings.
- `src/hooks/useEntries.ts` because Owns validation of score (1..5) and future-date rejection, optimistic state, and fire recomputation via useMemo; per contracts/entries-store.md this is where FR 002/003/004/010/011/014 are enforced.
- `src/hooks/useSettings.ts` because Validates flame color enum and persists settings; contract requires load-on-mount ready flag and validation before persistence.
- `src/components/Bonfire/flameModel.ts` because Pure flame intensity/height/glow math; contract requires intensity(0)===0, monotonic growth and asymptote to 1 (soft cap, SC 002). Also listed as an analysis-flagged path with ownership risk.
- `src/theme/tokens.ts` because Design tokens ported from BonfireDesign styles.css; the calendar heat ramp indexes heat[score], so altering values breaks the visual contract with the design source.
- `src/theme/palettes.ts` because Flame palettes ported from BonfireDesign app.jsx; contract ties the active palette to the selected flame color setting. Flagged by analysis as an ownership risk.
- `src/domain/achievements.ts` because Derives collectible flame unlocks from streak and time-based achievements; logic is deterministic product behavior flagged by analysis signals and covered by __tests__/achievements.test.ts.
- `src/domain/flames.ts` because Flame style catalog that unlock logic depends on; flagged by analysis signals and covered by __tests__/flames.catalog.test.ts.
- `specs/**` because Authoritative product specification, requirements checklist, and contracts (FR/SC numbering, fire and persistence rules). Changes here redefine scope and must be made through the speckit workflow, not by the maintenance tool.
- `.specify/**` because Spec Kit configuration, hooks, and agent context extension config that drive the speckit skills; altering them changes how specs and agent context are generated.
- `jest.setup.js` because Global test environment setup (mocking AsyncStorage and Skia/Reanimated natives); flagged by analysis signals and changes here alter how every test in the suite runs.

## Never-Touch Paths

- `**/.env*` because secrets must never be modified by Gardener.
- `**/secrets/**` because secret material requires human handling.

## Autonomous Fixes Allowed

- documentation updates

## Assisted Fixes Allowed


## Advisory-Only Areas


## Architecture Boundaries


## Test Rules


## Ignored Paths


## Health Priorities

- Current entropy classification: `no_autonomy`.
- Current entropy score: `37.5`.
- Prefer focused, reviewable maintenance PRs.

## Trigger and PR Preferences

- Prefer small PRs scoped to one maintenance category.
- Do not auto-merge Gardener PRs.
