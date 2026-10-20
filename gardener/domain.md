<!-- gardener-constitution-proposal: v1 -->
# Gardener Domain

## Domain

- Gardener should keep changes within this project's domain. Flag work that introduces features outside it.
- In-domain: `mobile app`.
- In-domain: `productivity tracking`.
- In-domain: `gamification / achievements`.
- In-domain: `animated data visualization`.
- In-domain: `local-first persistence`.
- In-domain: `calendar UI`.
- In-domain: `React Native graphics (Skia/Reanimated)`.
- Capability: Record one integer productivity score from 1 to 5 per day, rejecting out-of-range values and future dates.
- Capability: Edit, change, or clear scores for today and past days.
- Capability: Compute fire strength as the cumulative sum of per-day contributions (1 adds none, 2-5 add increasing strength) over the current lit run.
- Capability: Extinguish the fire after two consecutive missed past days; a single missed day keeps it alive; unscored today does not count as a miss.
- Capability: Relight an extinguished fire with any logged score, with a 1 relighting it as a minimal flame at strength 0.
- Capability: Derive fire state deterministically from the full score history against the current date, independent of entry order.
- Capability: Render an animated flame on a single screen with unlit/spark, lit at varying sizes, and out states, using React Native Skia and Reanimated.
- Capability: Soft-cap on-screen flame size while underlying strength keeps increasing.
- Capability: Emit rising embers/sparks while lit, scaled with strength; show charred logs and smoke wisp when out.
- Capability: Swipe-up full-screen gesture reveals a calendar bottom sheet; swipe-down hides it (React Native Gesture Handler).
- Capability: Month-focused calendar with day cells colored by score, indicating scored vs missed days, with inline 1-5 picker.
- Capability: Paginate calendar backward through any number of past months while capping forward navigation at the current month.
- Capability: Flame color selection (Amber default, Crimson, Sapphire) from a settings button in the top-right corner, applied immediately and persisted.
- Capability: Persist scores, selected flame, and flame color locally with AsyncStorage; work fully offline.
- Capability: Show a loading placeholder until stored scores load, without discarding scores entered during load.
- Capability: Optional short per-day notes that do not affect score or fire logic.
- Capability: Flame catalog with achievements: each non-base flame tied to one streak-specific or time-specific achievement; Amber always unlocked.
- Capability: Streak-specific flame unlocking while the current run meets its condition (e.g. N-day run tolerating missed days, unbroken chain, daily-logged), relocking when the fire goes out.
- Capability: Time-specific flame unlocking for a window of days from the achievement day, not banked, restored by relighting within the window.
- Capability: Flame gallery showing all catalog flames with name, colors, requirement, live progress, and re-earn prompts; equipping locked flames renders an embered variant.
- Capability: Visual-only Fire Health rating (Faint, Steady, Bright, Radiant) derived from recent score quality.
- Capability: Scene atmosphere adapting to local time without continuous JS timers.
- Capability: Spec-driven development workflow tooling (speckit specify/clarify/plan/implement/checklist/constitution) for maintaining specs and tasks.

## Out-of-Domain Examples

- Task management, to-do lists, or task completion tracking
- Charts, graphs, or statistical dashboards as primary views
- Traditional streak counters displayed as the main UI
- Cloud sync, user accounts, or multi-device backend synchronization
- Social features such as sharing, friends, or leaderboards
- Push notifications or reminder scheduling
- Time tracking or Pomodoro timers
- Calendar event scheduling or external calendar integration
- Payments, in-app purchases, or monetized flame store
- Web-only or server-side rendering features
- Scores on a scale other than integers 1-5 or scoring of future dates
- Continuous JS timer-driven animation loops outside Reanimated/Skia

<!-- gardener-generated: 04a2832099 10e034f1bc 1a4aa6a80b 1be5af1409 1f97a1abbb 259bb79c97 31ae3df81c 3621a12b4b 3c87bae5d5 427f81c9cc 42c8c66df0 437d547ed0 474e4e5e0a 47f36db0e2 481af001e9 51154bc3cc 52728828d0 53dc55d17e 574e7ecce0 6101914088 6157f194d4 6b97174acb 6f15121903 70780b0ab4 7a87e0d09d 7aa4183acb 7e024782ab 7e7d70d7a4 83590d5385 89b2b50e6f 8d68a77f0b 91cd94c8fd 9505ab6dcc a5766aa048 aa14c7efa0 b3c40eb7d4 bda25609e6 cb89c24699 d3abf332bc e5c8e998e2 ef97bad04b f01567572c f91a1095e3 -->
