# Data Model: Flame Visual Profiles

## FlameStyle

Existing catalog entity for one flame. This feature adds `visualProfile`.

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
- `visualProfile`: New profile data for shape, motion, particles, aura, and optional strength response.

**Validation Rules**

- All 20 existing flame styles must have `visualProfile`.
- `visualProfile` must include complete `shape`, `motion`, `particles`, and `aura` sections.
- `visualProfile` must not change `achievement`, `palette`, `embered`, or persisted selected-flame data.
- A missing or invalid profile must fall back to the Amber-like safe profile at render time.

## VisualProfile

Data describing how a flame should render beyond color.

**Fields**

- `shape`: ShapeProfile.
- `motion`: MotionProfile.
- `particles`: ParticleProfile.
- `aura`: AuraProfile.
- `strengthResponse`: Optional StrengthResponse.

**Relationships**

- Owned by exactly one `FlameStyle`.
- Read by `Flame.tsx` and `Embers.tsx`.
- May use existing `palette` colors as color source, including embered palette when locked.

## ShapeProfile

Controls flame silhouette and magical geometry.

**Fields**

- `tongueCount`: Number of reusable flame tongues to draw.
- `widthMultiplier`: Overall width multiplier against current flame geometry.
- `heightMultiplier`: Overall height multiplier against current flame geometry.
- `variants`: Shared shape effect flags, such as `classic`, `split`, `forked`, `jagged`, `twin`,
  `spiral`, `crown`, `ring`, `ribbon`, `wing`, `layered`, `lance`, `warped`, or `detached`.

**Validation Rules**

- Counts and multipliers must remain within visually safe bounds defined during implementation.
- Variants select shared renderer behavior; they must not require flame-id-specific branches.

## MotionProfile

Controls animated feel.

**Fields**

- `flickerSpeed`: Relative flicker speed.
- `sway`: Horizontal motion amount.
- `stretch`: Vertical stretch amount.
- `pulse`: Pulse intensity.
- `hueShift`: Whether hue drift is used for this style.
- `gravity`: Optional low/normal/heavy feel for upward or floating effects.

**Validation Rules**

- Motion must honor reduced-motion settings by freezing or minimizing animated loops as current flame
  rendering does.
- Motion parameters must be interpreted generically and memoized where possible.

## ParticleProfile

Controls embers and special motifs.

**Fields**

- `variant`: One of `sparks`, `motes`, `ash`, `bubbles`, `shards`, `wisps`, or `stars`.
- `count`: Particle count or density.
- `size`: Base particle size.
- `riseSpeed`: Relative upward movement speed.
- `drift`: Horizontal drift amount.
- `colorSource`: Palette color source, such as `core`, `gold`, `amber`, `ember`, `red`, `gradient`,
  or `secondary`.
- `motif`: Optional flavor label such as `leaf`, `crackle`, `snow`, `flare`, `auroraBand`, or
  `orbitingMote`.

**Validation Rules**

- Particle variants are shared modes in `Embers.tsx`.
- Counts must stay bounded to preserve performance.
- Particle colors derive from the effective palette unless a profile intentionally uses a secondary
  palette-derived source.

## AuraProfile

Controls halo and accent geometry around the flame.

**Fields**

- `haloShape`: Shared halo shape such as `oval`, `tall`, `wide`, `circular`, `ring`, `ribbon`,
  `crisp`, or `dim`.
- `intensity`: Relative aura brightness.
- `secondaryGlows`: Count or enabled flag for additional glow layers.
- `accents`: Shared accent flags such as `orbitRing`, `voidRing`, `shockPulse`, `solarCircle`,
  `afterimage`, or `auroraBand`.

**Validation Rules**

- Aura must remain behind/around the flame and must not block UI controls.
- Transparent or dark aura styles must keep the active flame legible.

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

## State Transitions

1. User score history changes -> existing fire state and strength recompute unchanged.
2. Existing `useFlames` derives `activeStyle`, `effectivePalette`, and `dim`.
3. `BonfireScreen` passes `activeStyle`, `effectivePalette`, and `dim` to flame renderers.
4. `Flame.tsx` reads `activeStyle.visualProfile` for shape, motion, aura, and strength response.
5. `Embers.tsx` reads `activeStyle.visualProfile.particles` for particle variant behavior.
6. If active flame is locked but shown embered, existing `effectivePalette` and `dim` reduce visual energy.
7. If fire is out, current out-state precedence remains and live flame/embers do not appear.
