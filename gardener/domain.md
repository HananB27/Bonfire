<!-- gardener-constitution-proposal: v1 -->
# Gardener Domain

## Domain

- Gardener should keep changes within this project's domain. Flag work that introduces features outside it.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/checklists/requirements.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/entries-store.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/fire-engine.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/flame-and-theme.md`.
- Scope source of truth: `specs/001-bonfire-productivity-tracker/contracts/settings-store.md`.
- In-domain: `mobile app (React Native / Expo)`.
- In-domain: `productivity tracking`.
- In-domain: `gamification / visual feedback`.
- In-domain: `local-first on-device persistence`.
- In-domain: `2D/GPU graphics rendering (Skia flame visuals)`.
- In-domain: `gesture-driven UI (swipe-up calendar sheet)`.
- In-domain: `theming and visual design tokens`.
- Capability: Record one daily productivity score from 1 to 5 per calendar date.
- Capability: Validate scores (1..5 only) and reject scores for future dates.
- Capability: Derive fire state (unlit/lit) and strength from score history using a pure, deterministic fire engine.
- Capability: Convert scores to strength contributions (score minus 1, strictly increasing for 2..5).
- Capability: Allow one missed past day without extinguishing the fire; two consecutive missed past days extinguish it.
- Capability: Keep a 'lit' fire alive with a score of 1 (zero strength but still alive).
- Capability: Compute a soft-capped flame intensity curve that asymptotes toward 1.
- Capability: Map fire state to flame visual parameters (height, glow, intensity).
- Capability: Render flame profiles with React Native Skia and Reanimated.
- Capability: Render embers, glows, and other GPU visual effects via Skia.
- Capability: Show a swipe-up calendar sheet (React Native Gesture Handler + Reanimated) for logging, editing, clearing, and reviewing scores.
- Capability: Color the calendar heat ramp by score (five heat tokens).
- Capability: Store short per-day notes that do not affect score or fire logic.
- Capability: Unlock collectible flame styles/palettes from streak and time-based achievements.
- Capability: Let the user choose the flame color from an enumerated set (default Amber), persisted as a setting.
- Capability: Show visual-only Fire Health tiers (Faint, Steady, Bright, Radiant) derived from recent score quality.
- Capability: Adapt scene atmosphere from local time without continuous JS timers.
- Capability: Persist scores, notes, and selected flame via AsyncStorage behind a dedicated entries store and settings store with versioned keys.
- Capability: Expose React hooks (useEntries, useSettings) that load on mount, update optimistically, and persist in order.
- Capability: Recompute derived fire state via memoization when entries or today change.
- Capability: Provide design tokens (background, ink, heat ramp colors) ported from a reference design.

## Out-of-Domain Examples

- Multi-user accounts, login, or authentication
- Cloud sync or server-side backend storage
- Task lists, to-do items, or project management
- Pomodoro or time-tracking timers
- Charts, graphs, or streak dashboards as primary views
- Social sharing, leaderboards, or friends features
- Push notifications or reminder scheduling services
- Web-only DOM/CSS UI outside the Expo/React Native app
- Payment, subscriptions, or in-app purchases
- Calendar integrations with Google Calendar or other external calendars
- Health data or wearable integrations
- Ad networks or analytics tracking SDKs
