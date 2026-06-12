# Research: Flame Visual Profiles

## Decision: Store `visualProfile` on each `FlameStyle`

**Rationale**: The flame catalog is already the single source of truth for identity, palette, rarity,
and achievement. Adding profile data there preserves the "edit one row to tune a flame" model and avoids
new storage or lookup layers.

**Alternatives considered**:

- Separate `profilesByFlameId` map: rejected because it splits flame identity across files and creates
  drift risk.
- Renderer-side flame id switch: rejected by the user constraint and would not scale cleanly.
- Persist profile data in settings: rejected because profiles are static catalog data, not user state.

## Decision: Pass `activeStyle` into `Flame` and `Embers`, keep `palette` and `dim`

**Rationale**: `useFlames` already derives the active style and effective palette. Passing both keeps
the renderer aware of profile identity while preserving the locked embered behavior through the existing
effective palette and `dim` knob.

**Alternatives considered**:

- Pass only `visualProfile`: rejected because some renderer decisions benefit from full style metadata
  such as rarity/drift, and full style is already available.
- Pass only palette: rejected because palette cannot express shape, motion, aura, or particle motifs.
- Recompute active style inside `Flame`/`Embers`: rejected because render components should stay pure
  and avoid catalog lookups on the hot path.

## Decision: Use shared configurable Skia effects selected by profile flags

**Rationale**: Shared shape variants, aura accents, and particle variants allow common code paths,
consistent performance tuning, and reusable tests. The renderer remains generic: profile data chooses
the effect family; it does not branch on flame names.

**Alternatives considered**:

- Bespoke render code per flame: rejected because it violates the v1 scope and raises maintenance cost.
- Only vary existing five tongue dimensions: rejected because it would not satisfy rare magical geometry.
- Add bitmap assets for rare flames: rejected because this app's flame is animated Skia geometry and
  assets would add pipeline complexity without solving strength response.

## Decision: Keep animation UI-thread driven and memoize profile-derived static data

**Rationale**: Current flame and ember animation already uses shared clocks and derived values. Profile
processing should happen only when `activeStyle`, `palette`, dimensions, or fire strength inputs change,
not every frame. Static path arrays, particle seeds, color stops, and effect descriptors should be
memoized.

**Alternatives considered**:

- React state updates for particle/effect animation: rejected because it risks JS-thread jank.
- Randomize seeds every render: rejected because it causes visual popping and unstable tests.
- Pre-render all flame variants: rejected as unnecessary for 20 styles and less flexible for strength
  response.

## Decision: Let each profile define strength response while preserving fire math

**Rationale**: The clarified spec requires profiles to change size and non-size traits based on strength
while keeping the numeric fire strength calculation unchanged. This creates richer progression without
touching achievements or calendar logic.

**Alternatives considered**:

- Existing global size-only scaling: rejected because the user explicitly wants non-size strength traits.
- Replacing strength math: rejected because current fire math is an invariant.
- Ignoring strength in profiles: rejected because it would flatten progression.

## Decision: Particle variants are shape/rendering modes, not separate components

**Rationale**: `Embers.tsx` can keep one deterministic particle pipeline with variant-aware drawing:
spark/mote circles, ash flecks, bubbles, shard polygons, wispy ellipses/trails, and star flecks. This
keeps the API simple and avoids per-flame components.

**Alternatives considered**:

- One component per particle type: rejected because hook order and shared clock handling become harder.
- Generic circles only: rejected because it cannot express bubbles, shards, wisps, stars, or ash clearly.
- Runtime image sprites: rejected due to asset overhead and less flexible palette tinting.
