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
- In-domain: `habit/streak tracking`.
- In-domain: `data visualization (skia flame rendering)`.
- In-domain: `local-first on-device persistence`.
- In-domain: `gamification (achievements/collectibles)`.
- In-domain: `calendar UI`.
- Capability: Record one daily productivity score from 1 to 5 per calendar day.
- Capability: Convert daily scores into bonfire strength with deterministic fire-state computation (unlit/lit, strength, everLit).
- Capability: Allow one missed past day without extinguishing the fire; two consecutive missed past days extinguish it.
- Capability: Provide a swipe-up calendar sheet to log, edit, clear, and review scores.
- Capability: Support short per-day notes that do not affect score or fire logic.
- Capability: Unlock collectible flame styles/palettes from streak and time-based achievements.
- Capability: Render GPU-accelerated flame, embers, and glow visuals via React Native Skia.
- Capability: Animate frames, gestures, and sheet motion via React Native Reanimated and Gesture Handler.
- Capability: Derive visual-only Fire Health tiers (Faint, Steady, Bright, Radiant) from recent score quality.
- Capability: Adapt scene atmosphere from local time without continuous JS timers.
- Capability: Persist scores, notes, and selected flame color on-device with AsyncStorage using a versioned key.
- Capability: Load and save user settings (flame color) with validation and fallback to a default.
- Capability: Isolate persistence behind entries and settings store modules and React hooks (useEntries, useSettings).
- Capability: Map score-to-contribution (score minus one) and soft-capped intensity curves for the flame model.
- Capability: Apply a theme token system and heat color ramp for calendar and flame rendering.
- Capability: Validate score range (1..5) and reject future-dated entries.

## Out-of-Domain Examples

- Multi-user accounts, authentication, or cloud sync of entries
- Task management, to-do lists, or subtask tracking
- Charts, graphs, or streak counters as primary UI
- Server-side backend APIs or remote databases
- Push notifications or reminder scheduling
- Time tracking or Pomodoro timers
- Team collaboration, sharing, or social feeds
- Web-only DOM frontend or browser-specific features
- Payment, subscription, or in-app purchase flows
- Health or biometric data integration
