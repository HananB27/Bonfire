<!-- gardener-constitution-proposal: v1 -->
# Gardener Rules

## Protected Modules

- `src/domain/fire.ts` because Pure, framework-free fire engine that is the deterministic oracle for fire state; contract specifies exact behavior table and no I/O, no Date.now(). Changes here must preserve the documented behavior table.
- `src/data/entriesStore.ts` because Storage layer contract: loadEntries never throws, round-trip deep equality, versioned key v1. Isolates all persistence; rest of app must not touch AsyncStorage directly.
- `src/data/settingsStore.ts` because Storage layer contract: loadSettings never throws, invalid flameColor falls back to Amber, round-trip deep equality. Isolates settings persistence.
- `src/hooks/useEntries.ts` because Hook contract: setScore rejects invalid scores/future dates, clearScore removes key, fire recomputed via useMemo. Maps to multiple functional requirements.
- `src/hooks/useSettings.ts` because Hook contract: validates flameColor enum, updates state and persists. Maps to FR 016, FR 017, SC 008.
- `src/components/Bonfire/flameModel.ts` because Pure math model for flame intensity/visual; contract specifies intensity(0)===0, strictly increasing, asymptote to 1, non-decreasing height for lit fires.
- `src/theme/tokens.ts` because Theme tokens ported from styles.css; exact color values are part of the design contract. Changes would break visual consistency.
- `src/theme/palettes.ts` because Flame palettes ported from app.jsx; active palette drives flame colors. Changes affect visual design and must match design spec.

## Never-Touch Paths

- `specs/**` because Product specs are authoritative; do not modify them as part of code maintenance.
- `.agents/**` because Agent skill files are tooling configuration; not part of application code.
- `.claude/**` because Agent skill files are tooling configuration; not part of application code.
- `**/.env*` because secrets must never be modified by Gardener.
- `**/secrets/**` because secret material requires human handling.

## Autonomous Fixes Allowed

- Fix TypeScript type errors in non-protected modules
- Fix linting issues (eslint) in non-protected modules
- Fix formatting issues (prettier) in non-protected modules
- Fix import ordering or unused imports in non-protected modules
- Fix test file naming or test structure issues
- Fix minor React hook dependency issues in non-protected components
- Fix minor style inconsistencies in non-protected components

## Assisted Fixes Allowed

- Refactor non-protected components to improve readability
- Fix performance issues in Skia/Reanimated components (e.g., memoization)
- Fix accessibility issues in UI components
- Fix error handling in non-protected modules
- Update dependencies to compatible versions (with review)
- Fix test failures in non-protected modules

## Advisory-Only Areas

- Changes to fire engine logic (src/domain/fire.ts) - must preserve behavior table
- Changes to storage layer contracts (src/data/*.ts) - must preserve guarantees
- Changes to flame model or theme tokens - must preserve visual design
- Changes to hook behavior (useEntries, useSettings) - must preserve validation rules
- Changes to achievement or flame catalog logic (src/domain/achievements.ts, src/domain/flames.ts) - must preserve unlock conditions

## Architecture Boundaries

- The rest of the app must never touch AsyncStorage directly; all persistence goes through src/data/entriesStore.ts and src/data/settingsStore.ts.
- src/domain/fire.ts must remain pure: no I/O, no React, no Date.now(); today is passed in as a parameter.
- src/components/Bonfire/flameModel.ts must remain pure math; no I/O or React dependencies.
- The fire state, achievements, and health must be derived deterministically from stored history; no side effects in derivation.
- UI updates should be optimistic and fire-and-forget for persistence; persistence is ordered but not blocking.
- Theme tokens and palettes must be sourced from src/theme/; do not hardcode colors elsewhere.
- The calendar heat ramp must index heat[score] with 1→heat1 ... 5→heat5.

## Test Rules

- Run `npx jest` to execute the full test suite.
- Run `npx tsc --noEmit` to check TypeScript types.
- Run `npx eslint .` to check linting.
- Run `npx prettier --check .` to verify formatting.
- For changes to src/domain/fire.ts, run `npx jest __tests__/fireMetrics.test.ts` and ensure the behavior table scenarios pass.
- For changes to src/data/entriesStore.ts or src/hooks/useEntries.ts, run `npx jest __tests__/entriesStore.test.ts` (if exists) and related hook tests.
- For changes to src/components/Bonfire/flameModel.ts, run `npx jest __tests__/flameModel.test.ts`.
- For changes to src/domain/achievements.ts or src/domain/flames.ts, run `npx jest __tests__/achievements.test.ts` and `npx jest __tests__/flames.catalog.test.ts`.
- For UI component changes, run the corresponding component tests in __tests__/ (e.g., BonfireScreen.test.tsx, CalendarSheet.test.tsx).

## Ignored Paths

- `node_modules/**`
- `.expo/**`
- `.git/**`
- `coverage/**`
- `dist/**`
- `build/**`
- `*.log`
- `.DS_Store`

## Health Priorities

- Current entropy classification: `no_autonomy`.
- Current entropy score: `37.5`.
- Prefer focused, reviewable maintenance PRs.

## Trigger and PR Preferences

- Prefer small PRs scoped to one maintenance category.
- Do not auto-merge Gardener PRs.
