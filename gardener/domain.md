<!-- gardener-constitution-proposal: v1 -->
# Gardener Domain

## Domain

- Gardener should keep changes within this project's domain. Flag work that introduces features outside it.
- In-domain: `mobile app`.
- In-domain: `productivity tracking`.
- In-domain: `gamification / achievements`.
- In-domain: `animated graphics rendering (Skia/Reanimated)`.
- In-domain: `local-first on-device storage`.
- In-domain: `gesture-driven UI`.
- Capability: Assign an integer productivity score of 1 to 5 to today or any past day.
- Capability: Add, change, or clear scores for past and current days, with future dates rejected.
- Capability: Recompute fire state deterministically from the stored calendar history.
- Capability: Convert scores into cumulative bonfire strength, where 1 keeps the fire lit at strength 0 and 2-5 add increasing strength.
- Capability: Soft-cap the on-screen flame size while underlying strength keeps increasing.
- Capability: Extinguish the fire after two consecutive missed past days; a single missed day keeps the streak alive.
- Capability: Relight an extinguished fire with any score from 1 to 5.
- Capability: Render charred logs and a thin smoke wisp when the fire is out.
- Capability: Render an animated flame with Skia and Reanimated, including embers and glows.
- Capability: Show visual-only Fire Health tiers (Faint, Steady, Bright, Radiant) derived from recent score quality.
- Capability: Adapt scene atmosphere from local time without continuous JS timers.
- Capability: Swipe-up gesture opens a calendar sheet and swipe-down hides it.
- Capability: Month-focused calendar that pages backward through past months only.
- Capability: Log, edit, clear, and review scores from the calendar sheet.
- Capability: Store short per-day notes that do not affect score or fire logic.
- Capability: Settings surface opened from a top-right settings button.
- Capability: Choose flame color (Amber default, Crimson, Sapphire) that persists across restarts.
- Capability: Catalog of 20 flame styles (1 base, 8 streak-based, 11 time-based), each tied to an achievement.
- Capability: Streak-specific flames unlock while the current run satisfies their condition and relock when the fire goes out.
- Capability: Time-specific flames unlock on their achievement day, stay available through a fixed window from the calendar completion day, and expire afterward.
- Capability: Embered (dim, desaturated) rendering for locked-but-equipped flames, returning to full vibrancy when earned.
- Capability: Flame gallery grouped by tier (Base, Streak, Time) showing lock state, requirements, live progress, and remaining window days.
- Capability: In-app feedback when a flame newly unlocks.
- Capability: Persist scores, notes, achievements state inputs, and selected flame locally with AsyncStorage.
- Capability: Migrate settings from v1 flameColor key to v2 flameStyle id.
- Capability: Loading placeholder on cold start until saved data is ready.
- Capability: Fully offline, portrait-only operation with no backend or network use.

## Out-of-Domain Examples

- Push notifications or reminders
- Cloud sync, accounts, or multi-device sharing
- Backend APIs or remote data storage
- Task management, to-do lists, or project tracking
- Charts, graphs, or analytics dashboards as primary views
- Social features such as sharing, friends, or leaderboards
- Payments, in-app purchases, or monetized flame unlocks
- Landscape or tablet-specific layouts
- Future-dated score entry or forecasting
- Web browser or desktop deployment targets

<!-- gardener-generated: 06a93813bd 072df1a7eb 18f4de16c6 1a4aa6a80b 1f97a1abbb 2973876206 3677781031 38133b21b5 3cb526e011 454bb20cd2 4647663d40 4694ebc8c8 48cf5772cd 4a6ee42624 4bdcc8962b 4d596c7044 574e7ecce0 58731477df 5dd131aa99 5e8e99f3ea 67b120628e 6f15121903 7e0ec1a315 7e7c2bbd67 7f29283ec2 83590d5385 844af104d1 8a3093907a 8b7ef19d26 8f30b1e028 98e3cbbd8e 990c017bbe 9b0ccaf08e a6fc92927d a8326f6451 ac4cbe271d b0063fdae0 b367ccb2d3 b5dbace350 ba0e85aba6 bed6ba940b d1deb12891 daba0458ff dc278c77b4 -->
