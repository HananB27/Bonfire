# Contract: Particle Variants

## Purpose

`Embers.tsx` renders shared particle variants from `activeStyle.visualProfile.particles` while keeping
one reusable animation pipeline and one shared clock. Particle profiles are derived from
`BonfireDesign/flame-profiles.js`.

## Supported Variants

- `sparks`: bright round sparks, Amber baseline, also Crimson/Sodium/Strontium/Conflagration/Phoenix.
- `motes`: soft drifting points, used by Emerald/Spectral/Solfire/Voidfire/Aurora/Nebula.
- `ash`: darker flecks, used by Ember/Phoenix.
- `bubbles`: round translucent toxic bubbles, used by Toxic.
- `shards`: angular icy fragments, used by Frostfire.
- `wisps`: elongated vapor trails or soft ellipses, used by Lilac/Ghostlight/Wisp/Aurora.
- `stars`: star flecks or radiant points, used by Magenta/Solfire/Nebula.

## Required Controls

Each particle profile controls:

- `kind`
- `n` count/density
- `color` or palette-derived color equivalent
- optional `size`
- optional `rise`
- optional `speed`

## Required Multi-Variant Mixes

These BonfireDesign mixes must be preserved:

- Ember: `ash` + `sparks`
- Solfire: `stars` + `motes`
- Aurora: `wisps` + `motes`
- Phoenix: `sparks` + `ash`
- Nebula: `stars` + `motes`

## Performance Rules

- Particle counts are bounded and deterministic per mount/profile.
- Seeds are memoized by dimensions and particle profile, not regenerated every render.
- Animation remains clock-derived; no per-frame React state.
- Reduced-motion freezes or minimizes motion consistently with existing embers.
- Variant drawing uses shared primitives; no per-flame particle components.

## Validation

- Tests cover all supported variants.
- Tests verify profile changes affect variant selection without flame-id-specific logic.
- Tests verify required multi-variant mixes.
- Existing palette tests verify particles continue to derive from effective palette colors unless a
  BonfireDesign-specific secondary color is intentionally documented.
