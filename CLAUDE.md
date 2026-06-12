<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/003-ui-flame-polish/plan.md`

Active feature: UI & Flame Polish Fixes — five amendments to the existing app, all in current
files, **no new packages**, no storage changes: (1) locked flames can no longer be equipped
(gallery-row rejection cue + screen-level guard on the derived unlock state); (2) the fire's
surrounding light — halo, ground glow, hearth warm wash, ember particles — derives from the
active flame's own `Palette` via new pure helpers `withAlpha`/`darken` in `src/theme/palettes.ts`
(memoized; ≥120 FPS preserved); (3) calendar score heat ramp redefined in `src/theme/tokens.ts`
to white→light yellow→yellow→orange→red (1→5), `heatStyle()` gains an optional `border` for the
white "1" button — buttons and day cells share the one token source; (4) the open calendar sheet
gains a down-only pan over its whole body so a downward drag anywhere dismisses it (up-only
full-screen open pan from 002 stays); (5) the settings gear grows to 52×52 pt (icon 26).
Supporting artifacts in `specs/003-ui-flame-polish/`: spec.md, research.md, data-model.md,
contracts/ (score-heat-ramp, glow-derivation, locked-selection, gesture-surface), quickstart.md.
Prior features still referenced: `specs/002-achievement-flame-unlocks/` (flame catalog +
achievement engine + useFlames), `specs/001-bonfire-productivity-tracker/` (fire engine +
Skia flame).
<!-- SPECKIT END -->
