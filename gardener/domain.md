<!-- gardener-constitution-proposal: v1 -->
# Gardener Domain

## Domain

- Gardener should keep changes within this project's domain. Flag work that introduces features outside it.
- Scope source of truth: `spec digest (69/69 spec documents read in full)`.
- In-domain: `mobile app`.
- In-domain: `React Native`.
- In-domain: `productivity tracking`.
- In-domain: `gamification / achievements`.
- In-domain: `GPU graphics and animation (Skia, Reanimated)`.
- In-domain: `local-first on-device storage`.
- Capability: Record one integer productivity score from 1 to 5 per day.
- Capability: Compute cumulative fire strength over the current alive run from per-day scores (score 1 keeps fire at current size; higher scores add more strength).
- Capability: Tolerate a single missed past day; extinguish the fire after two consecutive missed past days, resetting strength to zero.
- Capability: Relight an extinguished fire when any score is logged; logged days always count as active.
- Capability: Add, change, or clear scores for any past or current day with the fire recomputed deterministically from stored history.
- Capability: Render an animated bonfire flame via React Native Skia with distinct unlit/spark, lit-at-varying-sizes, and out states.
- Capability: Emit rising particles/embers from the lit flame; out state shows charred logs and faint smoke with no flame or embers.
- Capability: Swipe-up bottom sheet calendar with backward month paging through any number of past months, inline 1-5 score picking, and swipe-down to hide.
- Capability: Full-screen upward swipe to open calendar that does not steal taps from the settings gear, dev pill, or day cells.
- Capability: Top-right settings button.
- Capability: Flame color choice (Amber default, Crimson, Sapphire) in v1, migrated to a flame style id in v2.
- Capability: Catalog of collectible flame styles, each tied to exactly one achievement; Amber always unlocked and default; all non-Amber flames locked by default.
- Capability: Streak-based achievements: N-day run (scored days in current alive run) and unbroken chain (no gaps); streak flames relock when the fire goes out.
- Capability: Time-based achievements: flames unlocked on an achievement day and valid for a fixed window through D+W inclusive, with days remaining countdown; re-completion inside a window restarts it from the newer day.
- Capability: Dead fire voids all non-Amber flames; time flames require both a valid window and a lit fire.
- Capability: Locked-but-equipped flames render an embered (dimmed) variant derived from the full style; Amber never renders embered.
- Capability: Flame gallery from settings listing every flame with unlocked/locked status, name, colors, requirement, live progress, and window countdown.
- Capability: Users may equip any flame from the gallery, including locked ones.
- Capability: Unlock states recompute within one screen refresh after score changes, with brief in-app unlock feedback.
- Capability: Persist scores, per-day notes, selected flame style, and flame color locally via AsyncStorage across restarts; loading placeholder until data loads (no unlit flash).
- Capability: Short per-day notes that do not affect score or fire logic.
- Capability: Visual-only Fire Health tiers (Faint, Steady, Bright, Radiant) derived from recent score quality.
- Capability: Scene atmosphere adapting to local time without continuous JS timers.
- Capability: Reduced-motion support that stops flame loops when the OS requests it.
- Capability: Accessibility labels and adequate touch targets on day cells, picker, settings, flame, and swipe handle.
- Capability: Frame-rate target of 120 FPS on 120 Hz devices for all flame styles including multicolor ones.
- Capability: Flame fidelity is a hard requirement with no quality-reduction fallback.
- Capability: Migration of v1 flameColor settings to v2 flameStyle id.

## Out-of-Domain Examples

- Task or to-do list management
- Charts, graphs, or statistical dashboards as primary views
- Cloud sync, accounts, or multi-device backend storage
- Social sharing, leaderboards, or friend comparisons
- Push notifications or reminder scheduling
- Payments, in-app purchases, or monetization of flame styles
- Web or desktop browser builds as a primary target
- Calorie, health-metric, or fitness tracking beyond visual fire health
- Editing the bonfire through code-review, CI, or code-quality tooling features
- Token-saving or generic AI tooling features inside the app

<!-- gardener-generated: 06f8e1fb19 084068e34a 0cb567c3e4 14b15c31a6 1a4aa6a80b 1f582ac663 1f97a1abbb 28ca46e55d 2e6d0da5bb 355f2a18bd 38396cd119 442260615a 473607e235 574e7ecce0 587bbdcce9 6c893da3e5 6ddaeee807 6f15121903 74095f2d91 834fd5339a 89b2b50e6f 8e6bce20dc 9271997143 9db6daee32 9e8a4adc27 a254e0b737 a5fdd3b027 b36ae5d5e7 b67d696470 b8c3179997 bac331c3b2 bddc6d6fb8 bed6ba940b c1cf46be41 ca79cf4b2e cc7ab791cc d1d97f530c d3abf332bc ddae174c6e e01886cc60 e2f433cd86 e8d2c09fd4 f01567572c f9f3f7bb24 fa0fc04981 fa93a36bf5 -->
