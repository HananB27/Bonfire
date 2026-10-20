<!-- gardener-constitution-proposal: v1 -->
# Gardener Domain

## Domain

- Gardener should keep changes within this project's domain. Flag work that introduces features outside it.
- Scope source of truth: `spec digest (69/69 spec documents read in full)`.
- In-domain: `mobile app`.
- In-domain: `React Native / Expo`.
- In-domain: `habit and productivity tracking`.
- In-domain: `gamification (achievements and collectible flame styles)`.
- In-domain: `GPU graphics and animation (Skia, Reanimated)`.
- In-domain: `local-first on-device data persistence`.
- In-domain: `calendar and gesture-driven UI`.
- Capability: Record a 1-5 integer productivity score for the current day and for any past day.
- Capability: Add, change, or clear scores for past days, with the fire recomputed from the calendar history.
- Capability: Compute fire strength as a cumulative sum of per-day contributions over the current alive run (score 1 holds size, 2-5 add increasing strength, 5 adds the most).
- Capability: Extinguish the fire when two consecutive past days are missed; a single missed day keeps it lit.
- Capability: Relight an extinguished fire on any new score; a logged day always counts as active.
- Capability: Render an animated bonfire flame in React Native Skia with distinct unlit/spark, lit-at-varying-size, and out states.
- Capability: Emit rising particles, embers, glows, and smoke from the flame; show charred logs and a faint smoke wisp when the fire is out.
- Capability: Adapt the scene atmosphere from local time without continuous JS timers.
- Capability: Show a visual-only Fire Health tier (Faint, Steady, Bright, Radiant) derived from recent score quality.
- Capability: Swipe-up bottom sheet calendar with backward month paging and inline 1-5 score picking.
- Capability: Swipe-down to hide the calendar; full-screen upward swipe that does not steal taps from the gear or day cells.
- Capability: Short per-day notes that are stored but do not affect score or fire logic.
- Capability: Flame color/style selection (Amber default; Crimson, Sapphire, and other styles) from a top-right settings control, applied immediately.
- Capability: Migrate the v1 flameColor setting to the v2 flameStyle identifier.
- Capability: Catalog of collectible flame styles, each tied to exactly one achievement; Amber is always unlocked and is the only free style.
- Capability: Streak-based achievements (N-day run counting scored days in the current alive run; unbroken chain with no gaps) that relock when the fire goes out.
- Capability: Time-based achievements with a calendar-based unlock day and a fixed window through D+W inclusive, restartable from newer completions, with days remaining shown.
- Capability: Flame gallery listing all flames with locked/unlocked status, colors, requirement, live progress or window countdown.
- Capability: Equip any flame, including locked ones, which renders in a dimmed embered variant; Amber never renders embered.
- Capability: Brief in-app feedback when an achievement unlocks, with unlock state recomputed within one refresh after score changes.
- Capability: Persist scores, notes, and the selected flame style locally across app restarts, with a loading placeholder until data loads (no unlit flash).
- Capability: Respect reduced-motion OS settings by stopping flame animation loops.
- Capability: Accessibility labels and adequate touch targets on day cells, picker, settings, flame, and swipe handle.
- Capability: Maintain 120 FPS rendering on 120 Hz devices for all flame styles including multicolor ones.
- Capability: Deterministic recomputation of fire state, achievements, and health from stored score history.

## Out-of-Domain Examples

- Task or to-do management with checklists and deadlines
- Pomodoro or focus timers
- Server-side accounts, cloud sync, or multi-device sharing
- Social features such as friends, leaderboards, or sharing feeds
- Charts, dashboards, or analytics graphs as a primary view
- Push notifications or reminder scheduling
- Payments, in-app purchases, or subscriptions for flame styles
- Calorie, sleep, or fitness tracking beyond the productivity score
- Web-based or desktop-only rendering targets
- Free-form rich-text journaling or note formatting beyond short per-day notes
- Backend API, database server, or authentication flows
- Generic code-review, token-saving, or spec-kit authoring tooling as product features

<!-- gardener-generated: 16407f54c6 1a4aa6a80b 1c078fb5e4 218d4a98b3 228a8a384c 2c6eee5bf5 2f40eabadb 3716a3b9ac 46b0bd02d7 4e757f7adc 4fbc5e7493 550eff96c8 574e7ecce0 5e8021fcbd 61a125def4 6a0f5dad26 6ae727a54b 6c439677b3 6f98be79d4 7894873d58 89b2b50e6f 89b97e3e54 8f9fef5c7c 908e14a3a4 a9a3633437 aa32cb3d0c ac1186e6b3 bcfa40ea5d bddc6d6fb8 c6dfb2b2aa cc7ab791cc cc8b794420 ccec20da73 cdbb93d05f d1d97f530c d252280428 dc7ac66a40 de660d76e1 e0e024db10 e4e537413c e581914858 e9cd10c786 f22f1c1dc3 f278c09f9f f2bd5ec7ec fd7b1c50e8 -->
