<!-- gardener-constitution-proposal: v1 -->
# Gardener Rules

## Protected Modules

- `src/domain/fire.ts` because The fire engine is the pure, deterministic oracle for fire state and strength, and its contract requires no I/O, no React, and no Date.now() calls.
- `src/data/entriesStore.ts` because This is the only persistence layer for scores and notes, and its contract guarantees loadEntries never throws and that saveEntries/loadEntries round-trips exactly.
- `src/data/settingsStore.ts` because It persists the selected flame color and must fall back to Amber on invalid input, so changes can silently reset user preferences.
- `src/hooks/useEntries.ts` because It enforces score validation (1..5, no future dates), optimistic ordered persistence, and the useMemo recomputation of fire state that satisfies FR 011.
- `src/hooks/useSettings.ts` because It validates the flame color enum and persists it, and it is flagged by analysis signals as an ownership risk.
- `src/components/Bonfire/flameModel.ts` because Its intensity curve and flameVisual fallbacks (height 30, glow rules for non-lit states) are tested against contract guarantees and tuned to match the design.
- `src/domain/achievements.ts` because Achievement thresholds unlock collectible flame styles from streak and time data, so edits change user progression and are flagged by analysis signals.
- `src/domain/flames.ts` because It defines the flame style catalog that achievements and the gallery depend on, and it is flagged by analysis signals.
- `src/theme/palettes.ts` because Palettes are ported from the design's FLAME PALETTES, so changes will drift the app away from the reference visuals and affect the flame color setting.
- `src/theme/tokens.ts` because Color tokens (bg, ink, heat ramp heat1..heat5) are ported from styles.css and the calendar heat ramp indexes heat[score] directly.
- `src/components/Bonfire/Flame.tsx` because This Skia/Reanimated render path is flagged by analysis signals and is the most performance-sensitive component.
- `src/components/Calendar/CalendarSheet.tsx` because It owns the swipe-up calendar sheet where scores, notes, and clears are logged, and it is flagged by analysis signals as an ownership risk.
- `src/screens/BonfireScreen.tsx` because It is the composition root that wires entries, settings, and fire state into the scene, and it is flagged by analysis signals.

## Never-Touch Paths

- `specs/**` because Specs and contracts are the authoritative statement of scope and fix/no-fix policy, and they should only change through the spec-kit workflow.
- `.agents/skills/**` because These are generic spec-kit agent instructions that define how the tool itself operates, not product code.
- `.claude/skills/**` because These are agent instruction files for the coding assistant and should not be edited by the maintenance tool.
- `src/data/**/v1 storage key definitions` because Changing the versioned AsyncStorage key without a migration would orphan all existing user scores and notes.
- `**/.env*` because secrets must never be modified by Gardener.
- `**/secrets/**` because secret material requires human handling.

## Autonomous Fixes Allowed

- Apply Prettier formatting to files outside the protected list.
- Remove unused imports and dead variables in non-protected components such as Embers.tsx, FireCaption.tsx, Hearth.tsx, and ScorePickerBar.tsx.
- Fix ESLint findings reported by eslint-config-expo that do not change runtime behavior.
- Add missing TypeScript strict-mode annotations in non-protected modules without changing inferred types.
- Update the README or dependency-version text only when it contradicts package.json, without touching specs.

## Assisted Fixes Allowed

- Break import cycles flagged in the Bonfire and Calendar component folders by extracting shared types into a neutral module, with a test run afterward.
- Refactor useEntries.ts or useSettings.ts internals while keeping the exported hook API and contract behavior identical.
- Adjust Reanimated worklet or Skia drawing code in Flame.tsx, Embers.tsx, or Hearth.tsx, with a manual check on device.
- Add or extend unit tests in __tests__ for flameModel, achievements, and fireMetrics to cover contract guarantees before refactoring.
- Update jest.setup.js mocks for AsyncStorage or Skia when a test dependency changes.

## Advisory-Only Areas

- Flame visual tuning (intensity curve, glow, height) should be reviewed against the design reference before changes.
- Achievement thresholds and flame-style unlock rules are product decisions that should be surfaced for review, not auto-edited.
- Fire Health labels (Faint, Steady, Bright, Radiant) and their derivation from score quality belong to product policy.
- The contract mentions a fire.test.ts oracle at the root path while tests live under __tests__; the mismatch should be reported.
- Expo SDK, React Native, and Reanimated/Skia version upgrades carry native and worklet compatibility risk and should be advised, not performed.

## Architecture Boundaries

- The domain layer (src/domain) must stay pure: no React imports, no AsyncStorage, and no Date.now() (today is passed in).
- Only src/data/entriesStore.ts and src/data/settingsStore.ts may touch AsyncStorage; components and hooks must go through them.
- Fire state must be derived from stored entries via computeFire and memoized, not stored as independent mutable state.
- Visual flame logic in src/components/Bonfire must not feed back into the score or fire domain logic.
- No continuous JavaScript timers; scene atmosphere should update from local time events, per the README.
- Notes must never affect score or fire calculations.
- Score validation (1..5, no future dates) must stay in useEntries.setScore, not duplicated in UI components.

## Test Rules

- Run Jest via jest-expo; test files live under __tests__ and use react-test-renderer for component tests.
- Pure modules (flameModel, fire engine, achievements) must keep deterministic tests with an injected 'today' value.
- entriesStore and settingsStore tests must mock AsyncStorage and verify the round-trip and never-throw guarantees.
- Run the TypeScript compiler in strict mode and ESLint (eslint-config-expo) before accepting any change.
- Changes to flameModel must keep intensity(0) === 0, strictly increasing strength response, and the flameVisual non-lit fallback values.
- Use Prettier to check formatting on all touched files.
- Visual or Skia changes cannot be fully verified by Jest and should be flagged for manual device verification.

## Ignored Paths

- `node_modules/**`
- `coverage/**`
- `.expo/**`
- `specs/**/checklists/**/*.generated.md`

## Health Priorities

- Current entropy classification: `no_autonomy`.
- Current entropy score: `37.5`.
- Prefer focused, reviewable maintenance PRs.

## Trigger and PR Preferences

- Prefer small PRs scoped to one maintenance category.
- Do not auto-merge Gardener PRs.
