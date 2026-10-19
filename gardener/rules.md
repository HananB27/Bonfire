<!-- gardener-constitution-proposal: v1 -->
# Gardener Rules

## Protected Modules

- `src/domain/fire.ts` because Pure, deterministic oracle for fire state; contract specifies exact behavior table and no I/O or Date.now(). Changes risk breaking FR 002-004, 010-011, 014.
- `src/data/entriesStore.ts` because Isolates all persistence; contract guarantees loadEntries never throws and round-trip deep equality. Critical for data integrity.
- `src/data/settingsStore.ts` because Isolates settings persistence; contract guarantees fallback to Amber and round-trip equality. Critical for user preferences.
- `src/hooks/useEntries.ts` because Hook behavior contract: setScore validation, optimistic updates, fire recomputation. Changes affect core UX and data flow.
- `src/hooks/useSettings.ts` because Hook behavior contract: load on mount, setFlameColor validation. Changes affect settings UX.
- `src/components/Bonfire/flameModel.ts` because Pure math driving Skia flame; contract specifies intensity asymptote and visual states. Changes affect visual correctness.
- `src/theme/tokens.ts` because Ported from design styles.css; exact color tokens and heat ramp. Changes affect visual identity and consistency.
- `src/theme/palettes.ts` because Ported from design app.jsx; flame palettes. Changes affect unlockable flame styles.

## Never-Touch Paths

- `specs/**` because Product specs are authoritative; modifying them without explicit request violates scope.
- `.agents/**` because Agent skill files; modifying them could break tooling.
- `.claude/**` because Agent skill files; modifying them could break tooling.
- `**/.env*` because secrets must never be modified by Gardener.
- `**/secrets/**` because secret material requires human handling.

## Autonomous Fixes Allowed

- TypeScript type errors and strict mode violations
- Lint errors (eslint-config-expo)
- Prettier formatting
- Import path corrections
- Simple refactors that preserve behavior (e.g., extracting pure functions)
- Adding missing test cases for existing pure functions

## Assisted Fixes Allowed

- Bug fixes in UI components (e.g., CalendarSheet, BonfireScreen) that require visual verification
- Changes to hook logic (useEntries, useSettings) that affect state management
- Adding new flame styles or palette entries
- Modifying fire engine behavior (src/domain/fire.ts) with spec review
- Changes to persistence layer error handling

## Advisory-Only Areas

- Performance optimizations for Skia rendering
- Architecture changes to data flow or component hierarchy
- Adding new dependencies or upgrading Expo SDK
- Changes to AsyncStorage schema or versioning
- Accessibility improvements

## Architecture Boundaries

- src/domain/fire.ts must remain pure: no I/O, no React, no Date.now(); today must be passed in
- All persistence must go through src/data/entriesStore.ts and src/data/settingsStore.ts; no direct AsyncStorage usage elsewhere
- UI components must not directly access AsyncStorage; use hooks (useEntries, useSettings)
- Flame model and theme tokens must stay in sync with design source (BonfireDesign)
- Fire state must be derived deterministically from stored entries; no mutable global state

## Test Rules

- Run jest with jest-expo preset: npx jest
- Ensure tests for pure functions (fire.test.ts, flameModel.test.ts) pass without mocking
- For storage tests, mock AsyncStorage as per entriesStore.test.ts pattern
- Run TypeScript type check: npx tsc --noEmit
- Run lint: npx eslint .
- Run prettier check: npx prettier --check .

## Ignored Paths

- `node_modules/**`
- `.expo/**`
- `dist/**`
- `build/**`
- `coverage/**`
- `*.log`
- `.DS_Store`

## Health Priorities

- Current entropy classification: `no_autonomy`.
- Current entropy score: `37.5`.
- Prefer focused, reviewable maintenance PRs.

## Trigger and PR Preferences

- Prefer small PRs scoped to one maintenance category.
- Do not auto-merge Gardener PRs.
