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
- In-domain: `gamification`.
- In-domain: `data visualization`.
- In-domain: `local-first persistence`.
- In-domain: `React Native UI`.
- In-domain: `GPU graphics rendering (Skia)`.
- In-domain: `animation`.
- Capability: Record one daily productivity score from 1 to 5 for a calendar date.
- Capability: Convert daily scores into a bonfire strength value via a pure contribution function (score minus one).
- Capability: Derive fire state (unlit, lit, extinguished/everLit) deterministically from the full score history evaluated against today's date.
- Capability: Allow one missed past day without extinguishing the fire; two consecutive missed past days extinguish it.
- Capability: Reject score writes for invalid scores (outside 1..5) or future dates.
- Capability: Clear a score for a given date.
- Capability: Attach short per-day notes that do not affect score or fire logic.
- Capability: Persist entries and settings on-device via AsyncStorage with a versioned storage key.
- Capability: Gracefully recover from missing or corrupt stored data without throwing.
- Capability: Round-trip save and load of entries and settings.
- Capability: Map fire strength to a bounded flame intensity curve with a soft cap, and derive flame height, glow, and intensity.
- Capability: Render the bonfire flame, embers, and glows with React Native Skia.
- Capability: Animate flame, gestures, and sheet transitions with React Native Reanimated and Gesture Handler.
- Capability: Provide a swipe-up calendar sheet for reviewing and editing scores by date.
- Capability: Color calendar cells with a heat ramp indexed by score.
- Capability: Derive visual-only Fire Health tiers (Faint, Steady, Bright, Radiant) from recent score quality.
- Capability: Unlock collectible flame styles/palettes from streak and time-based achievements.
- Capability: Let the user choose a flame color, with invalid values falling back to a default.
- Capability: Adapt scene atmosphere from local time without continuous JS timers.
- Capability: Ship design tokens (colors, heat ramp, theme) ported from a design prototype.

## Out-of-Domain Examples

- Cloud sync or multi-device account synchronization
- User authentication or login
- Task management, to-do lists, or project tracking
- Charts or analytics dashboards that replace the bonfire as primary view
- Pomodoro or time-tracking timers
- Team collaboration, sharing, or social feeds
- Backend server APIs or remote databases
- Push notification reminder scheduling
- Web-only DOM rendering of the app outside React Native
- Payment, subscriptions, or in-app purchases
