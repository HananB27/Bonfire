# Data Model: Flame Visual Profiles

## FlameStyle

Existing catalog entity for one flame. This feature adds BonfireDesign-derived `visualProfile`.

**Fields**

- `id`: Stable flame id.
- `name`: Display name.
- `tier`: Existing base/streak/time grouping.
- `rarity`: Existing rarity rank.
- `gradient`: Existing authoring colors.
- `palette`: Existing sampled render palette.
- `embered`: Existing dim locked-state palette.
- `achievement`: Existing unlock requirement.
- `drift`: Existing optional hue drift.
- `visualProfile`: New profile data for BonfireDesign shape, motion, particles, aura, accents, scale,
  and traceability labels.

**Validation Rules**

- All 20 existing flame styles must have `visualProfile`.
- `visualProfile` must include complete `shape`, `motion`, `particles`, `aura`, `accents`, and
  `designRef` sections.
- `visualProfile` must preserve BonfireDesign order, names, tier labels, and visual intent.
- `visualProfile` must not change `achievement`, `palette`, `embered`, or persisted selected-flame
  data.
- A missing or invalid profile must fall back to the Amber-like safe profile at render time.

## VisualProfile

Data describing how a flame should render beyond color, translated from `BonfireDesign/flame-profiles.js`.

**Fields**

- `source`: Constant source marker, expected to identify BonfireDesign.
- `designNumber`: BonfireDesign catalog number (`01` through `20`).
- `designTier`: BonfireDesign tier label (`common` or `rare`) for visual grouping.
- `tagline`: BonfireDesign tagline for review traceability.
- `shape`: ShapeProfile.
- `motion`: MotionProfile.
- `particles`: ParticleProfile[].
- `aura`: AuraProfile.
- `accents`: AccentProfile[].
- `footprint`: Optional profile scale multiplier, used by Conflagration and Nebula in BonfireDesign.
- `paletteIntent`: Optional profile palette flags such as opacity and inverted core.
- `strengthResponse`: Optional StrengthResponse.
- `designRef`: DesignReference labels from BonfireDesign.

**Relationships**

- Owned by exactly one `FlameStyle`.
- Read by `Flame.tsx`, `Embers.tsx`, and pure profile helper tests.
- May use existing `palette` colors as color source, including embered palette when locked.

## ShapeProfile

Controls flame silhouette and magical geometry.

**Fields**

- `variant`: One of BonfireDesign variants: `classic`, `lance`, `split`, `forked`, `twin`, `wide`,
  `warped`, `detached`, `squat`, `layered`, `crystal`, `crown`, `solar`, `inverted`, `ribbon`, `wing`.
- `edge`: One of `round`, `sharp`, `jagged`, `crystal`.
- `tongues`: Ordered list of TongueTransform values.
- `coreScale`: Optional core-size multiplier for solar-style profiles.

**Validation Rules**

- Tongue count and transform values must match BonfireDesign enough to reproduce the silhouette.
- Variants select shared renderer behavior; they must not require flame-id-specific branches.
- Unsupported BonfireDesign fields require documented equivalent behavior and parity test coverage.

## TongueTransform

Reusable per-tongue transform from BonfireDesign.

**Fields**

- `dx`: Optional horizontal offset as fraction of flame height.
- `fy`: Optional vertical base offset as fraction of flame height for detached fragments.
- `rot`: Optional rotation in degrees.
- `sx`: Optional width scale.
- `sy`: Optional height scale.
- `lag`: Optional animation phase lag.
- `layers`: Optional reduced layer mode such as `soft`.
- `float`: Optional floating-fragment behavior.
- `ghost`: Optional opacity for afterimage layers.
- `hue`: Optional hue offset for layered/ribbon variants.

**Validation Rules**

- Missing transform fields default to BonfireDesign baseline values.
- `ghost`, `hue`, `float`, and `layers` are data traits, not flame-id branches.

## MotionProfile

Controls animated feel.

**Fields**

- `family`: `smooth` or `harsh`.
- `speed`: Relative BonfireDesign animation period multiplier.
- `sway`: Optional horizontal group sway amount.
- `pulse`: Optional pulse mode such as `coal` or `core`.
- `hueDrift`: Optional hue-drift duration.
- `warp`: Optional warped-outline behavior.
- `ribbon`: Optional ribbon-wave behavior.

**Validation Rules**

- Motion must honor reduced-motion settings by freezing or minimizing animated loops as current flame
  rendering does.
- Motion parameters must be interpreted generically and memoized where possible.
- Smooth/harsh families and speed must preserve the designed identity: Sodium fast shimmer, Conflagration
  violent flicker, Ghostlight low-gravity drift, Aurora hue drift, Phoenix wing beat.

## ParticleProfile

Controls embers and special motifs. Multiple particle profiles may be active for one flame.

**Fields**

- `kind`: One of `sparks`, `motes`, `ash`, `bubbles`, `shards`, `wisps`, `stars`.
- `n`: BonfireDesign count/density.
- `color`: Intended particle color or palette-derived equivalent.
- `size`: Optional size multiplier.
- `rise`: Optional rise multiplier.
- `speed`: Optional duration multiplier.

**Validation Rules**

- Particle variants are shared modes in `Embers.tsx`.
- Counts must stay bounded to preserve performance.
- Multi-variant mixes from BonfireDesign must be preserved: Ember, Solfire, Aurora, Phoenix, and
  Nebula each use two particle profiles.

## AuraProfile

Controls halo and glow geometry around the flame.

**Fields**

- `kind`: One of `oval`, `tall`, `wide`, `circular`, `ring`.
- `dim`: Optional dim aura modifier.
- `crisp`: Optional crisp/tight halo modifier.
- `tint`: Optional aura tint override if needed.

**Validation Rules**

- Aura must remain behind/around the flame and must not block UI controls.
- Transparent or dark aura styles must keep the active flame legible.
- Aura kind and modifiers must match BonfireDesign parity expectations.

## AccentProfile

Special visual behaviors from BonfireDesign.

**Allowed Values**

- `afterimage`
- `shockPulse`
- `solarCircle`
- `orbitRing`
- `voidRing`
- `auroraBand`

**Validation Rules**

- Accent behavior is selected by profile data, never by flame id.
- Orbit and void rings must support opposing direction/multiple-ring behavior generically.
- Accent visibility may scale with strength but must not alter fire strength math.

## PaletteIntent

BonfireDesign palette metadata that affects rendering beyond the existing product palette.

**Fields**

- `opacity`: Optional body opacity, used by Ghostlight and Spectral style translucency.
- `invert`: Optional inverted core behavior, used by Voidfire.
- `glow`: Optional BonfireDesign glow intent for traceability and parity review.

**Validation Rules**

- Product colors still derive from the effective palette so locked embered state works.
- `opacity` and `invert` must be rendered as visual effects, not stored user state.

## DesignReference

Traceability labels copied or summarized from BonfireDesign.

**Fields**

- `silhouette`: What silhouette should look like.
- `core`: What core should look like.
- `aura`: What aura should look like.
- `particles`: What particles should look like.
- `motion`: What motion should feel like.
- `implementationIntent`: BonfireDesign implementation note or equivalent summary.

**Validation Rules**

- Every flame must include all six labels.
- Tests should fail if any label is missing or blank.

## StrengthResponse

Profile-specific visual response to existing fire strength.

**Fields**

- `size`: Optional strength scaling modifier.
- `motion`: Optional strength scaling for flicker, pulse, sway, or stretch.
- `particles`: Optional strength scaling for particle count, opacity, or motif frequency.
- `aura`: Optional strength scaling for halo size, intensity, or accent visibility.

**Validation Rules**

- Must read existing fire strength/intensity only.
- Must not change the calculated fire strength value, unlock state, or stored settings.

## Required BonfireDesign Profile Coverage

- Amber: classic rounded baseline, oval aura, sparks.
- Crimson: classic sharp, faster pulse, heavier sparks.
- Sapphire: classic tall, tall aura, sparse high sparks.
- Sodium: lance sharp, crisp tall aura, tiny crackles.
- Strontium: split jagged, harsh flicker, short sparks.
- Emerald: forked, motes.
- Lilac: twin, dim aura, wisps.
- Magenta: wide, wide aura, stars, sway.
- Ghostlight: translucent classic, dim aura, wisps.
- Toxic: warped, bubbles.
- Wisp: detached fragments, wisps.
- Ember: squat, coal pulse, ash+sparks.
- Spectral: layered ghosts, afterimage, motes.
- Frostfire: crystal, crisp aura, shards.
- Conflagration: crown, footprint 1.3, shockPulse, dense sparks.
- Solfire: solar, coreScale 1.7, circular aura, solarCircle, stars+motes.
- Voidfire: inverted sharp, ring aura, voidRing, motes.
- Aurora: ribbon, hue drift, auroraBand, wisps+motes.
- Phoenix: wing, sparks+ash.
- Nebula: layered, footprint 1.2, circular aura, orbitRing+auroraBand, stars+motes.

## State Transitions

1. User score history changes -> existing fire state and strength recompute unchanged.
2. Existing `useFlames` derives `activeStyle`, `effectivePalette`, and `dim`.
3. `BonfireScreen` passes `activeStyle`, `effectivePalette`, and `dim` to flame renderers.
4. `Flame.tsx` reads `activeStyle.visualProfile` for shape, motion, aura, accents, palette intent,
   footprint, core scale, and strength response.
5. `Embers.tsx` reads `activeStyle.visualProfile.particles` for particle variant behavior.
6. If active flame is locked but shown embered, existing `effectivePalette` and `dim` reduce visual
   energy while preserving profile identity.
7. If fire is out, current out-state precedence remains and live flame/embers do not appear.
