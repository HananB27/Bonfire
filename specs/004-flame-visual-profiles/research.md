# Research: Flame Visual Profiles

## Decision: Treat BonfireDesign as the mandatory visual source of truth

**Rationale**: The updated spec and user instruction require the product flames to match
BonfireDesign, not merely follow a prose summary. `BonfireDesign/flame-profiles.js` already contains
the complete 20-flame catalog with ids, order numbers, names, tiers, palette intent, shape variants,
tongue transforms, motion settings, aura settings, accents, particle mixes, footprint/core-scale
exceptions, opacity/inversion flags, and design labels. Planning and implementation should translate
that data into typed product profile data with parity tests.

**Alternatives considered**:

- Use only the older feature map in the spec: rejected because it omits concrete transforms, labels,
  accent lists, footprint, opacity, core scale, and exact particle mixes from BonfireDesign.
- Rebuild a different profile system from scratch: rejected because it risks visual drift from the
  approved designs.
- Screenshot-only matching: rejected because screenshots cannot prove data completeness or future
  maintainability.

## Decision: Store BonfireDesign-derived `visualProfile` on each `FlameStyle`

**Rationale**: The flame catalog is already the single source of truth for identity, palette, rarity,
and achievement. Adding BonfireDesign-derived profile data there preserves the "edit one row to tune a
flame" model and avoids new storage or lookup layers. The product profile rows should include
traceability metadata from BonfireDesign labels so reviewers can verify silhouette, core, aura,
particles, motion, and implementation intent.

**Alternatives considered**:

- Separate `profilesByFlameId` map: rejected because it splits flame identity across files and
  creates drift risk unless heavily synchronized.
- Renderer-side flame id switch: rejected because the renderer must stay generic and maintainable.
- Persist profile data in settings: rejected because profiles are static catalog data, not user state.

## Decision: Normalize BonfireDesign tokens into typed reusable renderer descriptors

**Rationale**: BonfireDesign uses reusable profile tokens rather than bespoke per-flame code:
`shape.variant`, `shape.edge`, `shape.tongues[]`, `motion.family`, `motion.speed`, `motion.sway`,
`motion.pulse`, `motion.hueDrift`, `motion.warp`, `motion.ribbon`, `aura.kind`, `aura.dim`,
`aura.crisp`, `accents[]`, `particles[]`, `footprint`, and `shape.coreScale`. Product TypeScript
types should mirror these concepts so parity can be tested without requiring identical web/CSS
implementation details.

**Alternatives considered**:

- Convert BonfireDesign data into loose JSON with untyped fields: rejected because strict typing and
  testability are required.
- Preserve only high-level labels like "crown" or "wisp": rejected because product visuals would miss
  scale, transform, particle, accent, and timing differences.
- Hard-code CSS class names in product data: rejected because the product renderer is Skia, not DOM/CSS.

## Decision: Pass `activeStyle` into `Flame` and `Embers`, keep `palette` and `dim`

**Rationale**: `useFlames` already derives the active style and effective palette. Passing both keeps
the renderer aware of BonfireDesign profile identity while preserving the locked embered behavior
through the existing effective palette and `dim` knob. This is the smallest wiring change that keeps
unlock, storage, gallery, and fire math unchanged.

**Alternatives considered**:

- Pass only `visualProfile`: rejected because tests and fallback logic benefit from full style
  metadata and full style is already available.
- Pass only palette: rejected because palette cannot express shape, motion, aura, accents, particles,
  footprint, opacity, or core scale.
- Recompute active style inside renderers: rejected because render components should stay pure and
  avoid catalog lookups on the hot path.

## Decision: Use shared configurable Skia effects selected by profile tokens

**Rationale**: BonfireDesign's renderer proves all 20 flames can be expressed through shared layered
tongues, edge treatments, aura kinds, accents, orbit rings, and particle variants. Product Skia code
should follow the same model: profile data chooses shared effect families; renderer code does not
branch by flame name. This keeps maintenance and performance predictable while preserving the designs.

**Alternatives considered**:

- Bespoke render code per flame: rejected because it violates data-driven scope and raises
  maintenance cost.
- Only vary existing five tongue dimensions: rejected because it cannot match detached wisps, layered
  ghosts, crown, wing, ribbon, void rings, shock pulse, solar circle, or particle mixes.
- Add bitmap assets for rare flames: rejected because the app's flame is animated Skia geometry and
  assets would make strength response, palette tinting, and locked embered dimming harder.

## Decision: Keep animation UI-thread driven and memoize profile-derived static data

**Rationale**: Current flame and ember animation already uses shared clocks and derived values.
BonfireDesign-compatible profile processing should happen only when `activeStyle`, `palette`,
dimensions, fire strength, or reduced-motion inputs change, not every frame. Static paths, particle
seeds, color stops, effect descriptors, and profile fallbacks should be memoized.

**Alternatives considered**:

- React state updates for particle/effect animation: rejected because it risks JS-thread jank.
- Randomize seeds every render: rejected because it causes visual popping and unstable tests.
- Pre-render all flame variants: rejected as unnecessary for 20 styles and less flexible for strength
  response.

## Decision: Let each profile define strength response while preserving fire math

**Rationale**: The clarified spec requires profiles to change size and non-size traits based on
strength while keeping the numeric fire strength calculation unchanged. BonfireDesign includes
profile-specific scale and richness traits; product strength response can scale size, motion,
particle density, aura intensity, and accent visibility from the existing strength value only.

**Alternatives considered**:

- Existing global size-only scaling: rejected because the user explicitly wants non-size strength
  traits.
- Replacing strength math: rejected because current fire math is an invariant.
- Ignoring strength in profiles: rejected because it would flatten progression.

## Decision: Particle variants come from BonfireDesign profile mixes

**Rationale**: BonfireDesign uses seven shared particle variants (`sparks`, `motes`, `ash`,
`bubbles`, `shards`, `wisps`, `stars`) and allows multiple particle definitions per flame. `Embers.tsx`
should keep one deterministic particle pipeline with variant-aware drawing and support multi-variant
profiles such as Ember ash+sparks, Solfire stars+motes, Aurora wisps+motes, Phoenix sparks+ash, and
Nebula stars+motes.

**Alternatives considered**:

- One component per particle type: rejected because hook order and shared clock handling become harder.
- Generic circles only: rejected because it cannot express bubbles, shards, wisps, stars, or ash
  clearly.
- Runtime image sprites: rejected due to asset overhead and less flexible palette tinting.
