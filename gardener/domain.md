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
- In-domain: `data visualization`.
- In-domain: `local-first mobile app`.
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
- Capability: Validate score range (1-5) and reject future dates.
- Capability: Clear a score for a day.
- Capability: Select flame color (validated enum, fallback to Amber).
- Capability: Use versioned storage key for future schema migration.
- Capability: Provide pure, deterministic fire engine for testing.
- Capability: Provide flame model with intensity asymptote and visual states.
- Capability: Provide theme tokens and palettes for flame rendering.

## Out-of-Domain Examples

- Cloud sync or multi-device account management
- Task management or to-do lists
- Charts or streak counters as primary UI
- Social features or sharing
- Server-side persistence or backend APIs
- Continuous timers or real-time clock-based animations
- Non-productivity domains (e.g., finance, health tracking beyond productivity)
- Adding scores for future dates
