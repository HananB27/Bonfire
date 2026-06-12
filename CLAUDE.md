<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/004-flame-visual-profiles/plan.md`

Active feature: Flame Visual Profiles — add data-driven `visualProfile` data to the existing
20 flame styles so rarity changes shape, motion, particles, aura, and profile-specific strength
response, not only color. Preserve current unlock logic, selected-flame storage, gallery behavior,
fire strength math, palette/embered locked-state behavior, and performance targets (>=120 FPS flame,
>=60 FPS UI). `useFlames` already returns `activeStyle`; pass it from `BonfireScreen` into `Flame`
and `Embers` while continuing to pass effective `palette` and `dim`.

Renderer rule: `Flame.tsx` and `Embers.tsx` stay generic. Profile flags select shared Skia effects
and particle variants (`sparks`, `motes`, `ash`, `bubbles`, `shards`, `wisps`, `stars`); no per-flame
hardcoded render branches in v1.

Supporting artifacts in `specs/004-flame-visual-profiles/`: spec.md, research.md, data-model.md,
contracts/ (visual-profile-data, renderer-profile-contract, particle-variants), quickstart.md.
Prior features still referenced: `specs/003-ui-flame-polish/` (locked guard, palette-derived glow,
heat ramp, gestures, cog), `specs/002-achievement-flame-unlocks/` (flame catalog + achievement engine),
`specs/001-bonfire-productivity-tracker/` (fire engine + Skia flame).
<!-- SPECKIT END -->
