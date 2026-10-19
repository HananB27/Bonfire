<!-- gardener-constitution-proposal: v1 -->
# Gardener Domain

## Domain

- Gardener should keep changes within this project's domain. Flag work that introduces features outside it.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/checklists/requirements.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/entries-store.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/fire-engine.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/flame-and-theme.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/settings-store.md`.
- In-domain: `mobile app`.
- In-domain: `personal productivity tracking`.
- In-domain: `gamification / habit tracking`.
- In-domain: `data visualization (flame rendering)`.
- In-domain: `local-first on-device persistence`.
- In-domain: `React Native UI`.
- Capability: Log a daily productivity score from 1 to 5 for a given date.
- Capability: Reject scores outside 1..5 and scores for future dates.
- Capability: Convert daily scores into bonfire strength via a pure contribution function (score minus 1).
- Capability: Derive fire state (unlit, lit) and strength deterministically from stored history against a provided today date.
- Capability: Allow one missed past day without extinguishing the fire; two consecutive missed past days extinguish it.
- Capability: Give bonus strength for consecutive high scores.
- Capability: Keep a fire alive with a score of 1 without adding size.
- Capability: Persist scores in AsyncStorage under a versioned key with corrupt/missing data falling back to empty.
- Capability: Clear individual day scores and persist the change.
- Capability: Optimistically update UI state for local offline writes.
- Capability: Swipe-up calendar sheet for viewing, logging, editing, and clearing scores.
- Capability: Heat-ramp calendar coloring keyed to score (1 to 5).
- Capability: Short per-day notes that do not affect score or fire logic.
- Capability: Render the flame with React Native Skia and animate with Reanimated.
- Capability: Soft-capped flame intensity model that asymptotes toward 1 and maps strength to flame height and glow.
- Capability: Unlock collectible flame styles from streak and time-based achievements.
- Capability: Selectable flame color palettes, persisted in settings with an amber fallback for invalid values.
- Capability: Visual-only Fire Health tiers (Faint, Steady, Bright, Radiant) derived from recent score quality.
- Capability: Adapt scene atmosphere from local time without continuous JS timers.
- Capability: Gesture-driven bottom sheet via React Native Gesture Handler.
- Capability: Theme design tokens ported from a design prototype (background, ink, heat colors).

## Out-of-Domain Examples

- Multi-user accounts, authentication, or cloud sync
- Backend server or REST/GraphQL API integration
- Task lists, to-do items, or per-task tracking
- Charts or streak counters as primary UI
- Push notifications or reminder scheduling
- Web (browser) deployment target
- Payments, subscriptions, or ads
- Team collaboration or social sharing features
- Time tracking with start/stop timers
- Calendar integration with external services such as Google Calendar
