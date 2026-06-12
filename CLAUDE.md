<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/002-achievement-flame-unlocks/plan.md`

Active feature: Achievement-Locked Flame Styles — layers an achievement-gated flame catalog onto the
Bonfire app. Most flames are locked until the calendar meets an achievement (streak-specific: alive
while the run satisfies it, voided when the fire goes out; time-specific: a window of W days from the
calendar day the condition completed, gated on the fire being lit). Unlock state is **derived**, never
stored; the active flame renders full when unlocked, dim "embered" when locked. The entire catalog
(visuals, conditions, windows) lives in one editable file `src/domain/flames.ts`. **No new packages.**
Pure rules in `src/domain/` (fireMetrics, flames, achievements) + a memoized `useFlames` hook feed the
existing Skia flame a per-flame palette (switching flames stays cheap, ≥120 FPS). Calendar now opens
via a full-screen status-bar-shade swipe-up.
Reuses feature 001 unchanged: `src/domain/fire.ts` (`computeFire`) + its tests.
Supporting artifacts in `specs/002-achievement-flame-unlocks/`: spec.md, research.md, data-model.md,
contracts/ (flame-catalog, achievement-engine, settings-store, flame-gallery), quickstart.md.
Prior feature still referenced: `specs/001-bonfire-productivity-tracker/` (fire engine + Skia flame).
<!-- SPECKIT END -->
