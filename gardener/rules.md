<!-- gardener-constitution-proposal: v1 -->
# Gardener Rules

## Protected Modules

- `src/domain/fire.ts` because Pure fire-state engine that is the deterministic oracle for the fire contract (contribution, computeFire, missed-day and extinguish rules); changes here alter core product behavior and must match the fire-engine spec.
- `src/data/entriesStore.ts` because Sole persistence boundary for user scores and notes on AsyncStorage (versioned v1 key); corruption-tolerant loading and round-trip guarantees protect user data and any future migration path.
- `src/data/settingsStore.ts` because Persistence boundary for user preferences (flame color) with validation fallback to Amber; changes can silently reset or corrupt stored user settings.
- `src/hooks/useEntries.ts` because Owns score validation (1..5, no future dates), optimistic persistence ordering, and the useMemo-derived fire state; regressions here break logging and fire derivation.
- `src/domain/achievements.ts` because Derives collectible flame unlocks from streak and time history; defined by spec-driven unlock rules, and changes can retroactively alter user progress.
- `src/domain/flames.ts` because Catalog of unlockable flame styles tied to achievements; identifiers are referenced by persisted settings, so renaming or removing entries orphans saved user selections.
- `src/components/Bonfire/flameModel.ts` because Pure flame intensity and visual math ported from the design (intensity(0)=0, monotonic, soft cap); contract-tested and defines how the fire scales visually.
- `src/theme/palettes.ts` because Flame palettes ported from the design source; the active palette is persisted via settings, so palette keys must remain stable.
- `src/theme/tokens.ts` because Design tokens (colors, heat ramp indexed by score 1..5) ported from styles.css; calendar heat mapping depends on exact values.

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
