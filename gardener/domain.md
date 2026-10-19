<!-- gardener-constitution-proposal: v1 -->
# Gardener Domain

## Domain

- Gardener should keep changes within this project's domain. Flag work that introduces features outside it.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/checklists/requirements.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/entries-store.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/fire-engine.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/flame-and-theme.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/settings-store.md`.
- In-domain: `mobile app development`.
- In-domain: `productivity tracking`.
- In-domain: `React Native / Expo`.
- In-domain: `gamification (streaks and achievements)`.
- In-domain: `local-first data persistence`.
- In-domain: `2D graphics and animation rendering`.
- In-domain: `calendar/journaling UI`.
- In-domain: `UI theming and design tokens`.
- Capability: Log a daily productivity score from 1 to 5 for a given date.
- Capability: Convert scores into bonfire strength via a pure contribution function (score minus 1, strictly increasing for 2-5).
- Capability: Derive fire state (unlit, lit, extinguished) and strength deterministically from entry history against a passed-in 'today' date.
- Capability: Allow one missed past day without extinguishing the fire; two consecutive missed past days extinguish it.
- Capability: Reject score entries outside 1..5 or dated in the future.
- Capability: Clear a score for a given date.
- Capability: Store short per-day notes that do not affect score or fire logic.
- Capability: Persist scores, notes, and selected flame color locally with AsyncStorage using a versioned storage key.
- Capability: Guarantee corrupt or missing stored data resolves to an empty state without throwing.
- Capability: Round-trip save and load of entries and settings.
- Capability: Store and validate user settings, currently only flame color with Amber as fallback.
- Capability: Map flame strength to a soft-capped visual intensity and flame height/glow values.
- Capability: Render a GPU-driven flame, embers, and glow with React Native Skia and Reanimated.
- Capability: Provide theme tokens and heat color ramp mapping scores to colors for a calendar heat map.
- Capability: Offer multiple flame color palettes and collectible flame styles unlocked by streak and time-based achievements.
- Capability: Compute a visual-only Fire Health tier (Faint, Steady, Bright, Radiant) from recent score quality.
- Capability: Adapt scene atmosphere to local time without continuous JS timers.
- Capability: Provide a swipe-up calendar sheet via React Native Gesture Handler for logging, editing, clearing, and reviewing scores.
- Capability: Expose React hooks (useEntries, useSettings) that isolate persistence from UI components.
- Capability: Ship unit tests for storage, fire engine, flame model, and hooks.

## Out-of-Domain Examples

- Task or to-do list management
- Team collaboration, sharing, or multi-user accounts
- Server-side backend, cloud sync, or remote database
- Financial, expense, or budgeting tracking
- Time-tracking with start/stop timers
- Charts or analytics dashboards as primary features
- Push notification reminders or scheduled background jobs
- Web (browser-only) deployment target
- Payment or subscription features
- Authentication or user login
