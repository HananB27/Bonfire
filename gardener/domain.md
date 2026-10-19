<!-- gardener-constitution-proposal: v1 -->
# Gardener Domain

## Domain

- Gardener should keep changes within this project's domain. Flag work that introduces features outside it.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/checklists/requirements.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/entries-store.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/fire-engine.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/flame-and-theme.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/settings-store.md`.
- In-domain: `productivity tracking`.
- In-domain: `habit/streak tracking`.
- In-domain: `local-first mobile app`.
- In-domain: `data visualization (flame/bonfire)`.
- In-domain: `gamification/achievements`.
- Capability: Log a daily productivity score from 1 to 5.
- Capability: Convert scores into bonfire strength (contribution: 1→0, 2→1, 3→2, 4→3, 5→4).
- Capability: Compute fire state (unlit/lit) and strength from calendar entries against today.
- Capability: Extinguish fire after two consecutive missed past days; allow one missed day.
- Capability: Swipe-up calendar sheet for logging, editing, clearing, and reviewing scores.
- Capability: Support short per-day notes that do not affect score or fire logic.
- Capability: Unlock collectible flame styles from streak and time-based achievements.
- Capability: Render flame profiles with React Native Skia and Reanimated.
- Capability: Show visual-only Fire Health (Faint, Steady, Bright, Radiant) from recent score quality.
- Capability: Adapt scene atmosphere from local time without continuous JS timers.
- Capability: Persist scores, notes, and selected flame locally with AsyncStorage.
- Capability: Derive fire state, achievements, and health deterministically from stored history.
- Capability: Validate score range (1-5) and reject future dates in the entries hook.
- Capability: Clear a score for a day and persist the change.
- Capability: Select flame color from a palette, persisted in settings.
- Capability: Load entries and settings without throwing on corrupt/missing data.
- Capability: Versioned storage key for future schema migration.

## Out-of-Domain Examples

- Task management or to-do lists
- Charts or streak counters as primary UI
- Cloud sync or multi-device account features
- Social features, sharing, or leaderboards
- Server-side persistence or backend APIs
- Continuous JS timers for animation
- Non-productivity data tracking (e.g., mood, habits other than daily score)
- Monetization, ads, or in-app purchases
