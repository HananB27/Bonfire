# Contract: Particle Variants

## Purpose

`Embers.tsx` renders shared particle variants from `activeStyle.visualProfile.particles` while keeping
one reusable animation pipeline and one shared clock.

## Supported Variants

- `sparks`: bright round sparks, current behavior baseline.
- `motes`: soft drifting points for magical/leaf-like effects.
- `ash`: darker flecks with slower rise and fade.
- `bubbles`: round translucent bubbles with warped/toxic feel.
- `shards`: angular icy or crystal fragments.
- `wisps`: elongated vapor trails or soft ellipses.
- `stars`: small star flecks or radiant points.

## Required Controls

Each particle profile controls:

- count or density.
- size.
- rise speed.
- drift.
- color source.
- motif label when needed.

## Performance Rules

- Particle counts are bounded and deterministic per mount/profile.
- Seeds are memoized by dimensions and particle profile, not regenerated every render.
- Animation remains clock-derived; no per-frame React state.
- Reduced-motion freezes or minimizes motion consistently with existing embers.

## Validation

- Tests cover all supported variants.
- Tests verify profile changes affect variant selection without flame-id-specific logic.
- Existing palette tests verify particles continue to derive from effective palette colors.
