# Data Model: UI & Flame Polish Fixes

**Feature**: 003-ui-flame-polish | **Date**: 2026-06-12

**No stored data changes.** AsyncStorage schemas (`entriesStore` v1, `settingsStore` v2) are
untouched; no migrations. Everything below is derived/visual structure.

## Derived & visual entities

### HeatStyle (extended)

The return shape of `heatStyle(score)` in `src/theme/tokens.ts`, consumed by `ScorePickerBar`
and `DayCell`.

| Field | Type | Notes |
|-------|------|-------|
| `background` | `string` | `HEAT[score]`; ramp now white→light yellow→yellow→orange→red (1→5) |
| `color` | `string` | text color, ≥4.5:1 contrast on `background`; dark for 1–4, light for 5 |
| `glow` | `string \| undefined` | unchanged concept; kept for scores 4–5 |
| `border` | `string \| undefined` | **new, optional** — outline for score 1 (`rgba(59,53,39,0.45)`, defined in tokens.ts) so the white button stays visible on light surfaces; `undefined` for 2–5 |

**Validation rules**: `HEAT` keeps index 0 unused; scores are the existing `Score` union (1–5).
Exact hex values are the single source of truth for both button and day-cell rendering.

### GlowColors (new derived value)

Pure derivation from the existing `Palette` (no new stored fields), produced by helpers in
`src/theme/palettes.ts` and memoized in components.

| Field | Type | Derivation |
|-------|------|------------|
| `ground` | `[string, string, string]` | `withAlpha(amber, 0.55)`, `withAlpha(ember, 0.22)`, `withAlpha(ember, 0)` |
| `halo` | `[string, string, string]` | `withAlpha(amber, 0.40)`, `withAlpha(ember, 0.16)`, `withAlpha(ember, 0)` |
| `baseDeep` | `string` | `darken(red, 0.55)` — replaces hardcoded `#7a1f06` |
| `midDeep` | `string` | `darken(red, 0.8)` — replaces hardcoded `#b3380f` |
| `warmWash` | `string` | `withAlpha(ember, 0.5)` — Hearth log wash |
| particle fade | `string` | `withAlpha(particleColor, 0)` — outer radial stop per particle |

**Relationships**: input `Palette` is whatever `useFlames` already emits (`effectivePalette`),
so embered/locked dimming flows through unchanged. `Hearth` gains a `palette: Palette` prop
(previously used global default tokens).

**State transitions**: none — recomputed via `useMemo` when the palette reference changes
(flame switch, lock/unlock flip).

### Flame selection guard (behavioral rule, no new data)

| Rule | Where enforced |
|------|----------------|
| Equip allowed iff `states[id].unlocked === true` | `FlameRow` (UI rejection + a11y disabled) and `BonfireScreen` equip wrapper (defense in depth) |
| Already-equipped flame that becomes locked | unchanged 002 behavior: stays equipped, renders embered; only *new* equips are gated |

`AchievementState`, `FlameStyle`, `Palette`, `Entries`, `FireState` are all unchanged from
features 001/002 (see `specs/002-achievement-flame-unlocks/data-model.md`).

### Gesture surfaces (config, not data)

| Surface | Direction | Activation | Result |
|---------|-----------|------------|--------|
| Full-screen overlay (existing) | up only | `activeOffsetY([-12, 9999])` | opens sheet |
| Sheet body (new) | down only | activates after ~12 px downward travel | closes sheet, clears selected day |
| Header grab bar (existing) | both | immediate | drag open/closed |
| Scrim tap above open sheet (existing) | — | tap | closes sheet |
