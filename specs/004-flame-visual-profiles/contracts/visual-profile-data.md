# Contract: Visual Profile Data

## Purpose

`FlameStyle.visualProfile` is the stable data contract between the flame catalog and generic
renderers. It must be derived from `BonfireDesign/flame-profiles.js` and must describe identity, not
implementation branches.

## Source Requirement

BonfireDesign is mandatory:

- `BonfireDesign/flame-profiles.js` supplies the 20-profile data map.
- `BonfireDesign/flame-renderer.jsx` supplies expected generic token behavior.
- `BonfireDesign/flame-catalog.css` supplies expected visual behavior for aura, accents, particles,
  edge treatments, and motion families.
- `BonfireDesign/screenshots/*` supply visual review references.

Product profile data may use TypeScript names and Skia-friendly structures, but each profile must be
traceable to its BonfireDesign source values.

## Required Sections

Every flame profile must provide:

- `source`
- `designNumber`
- `designTier`
- `tagline`
- `shape`
- `motion`
- `particles`
- `aura`
- `accents`
- `paletteIntent`
- `designRef`

`strengthResponse` is optional but supported for styles that should change traits as strength grows.

## Required Token Coverage

### Shape

- `variant`: `classic`, `lance`, `split`, `forked`, `twin`, `wide`, `warped`, `detached`, `squat`,
  `layered`, `crystal`, `crown`, `solar`, `inverted`, `ribbon`, or `wing`.
- `edge`: `round`, `sharp`, `jagged`, or `crystal`.
- `tongues`: ordered transforms with optional `dx`, `fy`, `rot`, `sx`, `sy`, `lag`, `layers`,
  `float`, `ghost`, and `hue`.
- `coreScale`: optional, required when BonfireDesign sets it.

### Motion

- `family`: `smooth` or `harsh`.
- `speed`: relative duration multiplier.
- Optional flags: `sway`, `pulse`, `hueDrift`, `warp`, `ribbon`.

### Particles

- Profile supports one or more entries.
- `kind`: `sparks`, `motes`, `ash`, `bubbles`, `shards`, `wisps`, or `stars`.
- Required controls: `n`, `color`.
- Optional controls: `size`, `rise`, `speed`.

### Aura

- `kind`: `oval`, `tall`, `wide`, `circular`, or `ring`.
- Optional modifiers: `dim`, `crisp`, `tint`.

### Accents

- Allowed values: `afterimage`, `shockPulse`, `solarCircle`, `orbitRing`, `voidRing`, `auroraBand`.

### Palette Intent

- Optional fields: `opacity`, `invert`, `glow`.
- Product rendering still uses the existing effective palette for locked embered behavior.

### Design Reference

Every profile stores non-empty review labels:

- `silhouette`
- `core`
- `aura`
- `particles`
- `motion`
- `implementationIntent`

## Required Flame Map

The 20 existing flame ids must map to BonfireDesign identities:

- `amber`: #01 common, classic rounded baseline, oval aura, sparks.
- `crimson`: #02 common, sharp classic tips, faster pulse, heavier sparks.
- `sapphire`: #03 common, tall classic shape, tall aura, sparse high sparks.
- `sodium`: #04 common, sharp lance, crisp tall aura, tiny crackles.
- `strontium`: #05 common, jagged split, harsh flicker, short sparks.
- `emerald`: #06 common, forked, motes.
- `lilac`: #07 common, twin, dim aura, wisps.
- `magenta`: #08 common, wide, wide aura, stars, sway.
- `ghostlight`: #09 rare, translucent classic, dim aura, wisps.
- `toxic`: #10 rare, warped, bubbles.
- `wisp`: #11 rare, detached fragments, wisps.
- `ember`: #12 rare, squat, coal pulse, ash+sparks.
- `spectral`: #13 rare, layered ghosts, afterimage, motes.
- `frostfire`: #14 rare, crystal, crisp aura, shards.
- `conflagration`: #15 rare, crown, footprint 1.3, shockPulse, dense sparks.
- `solfire`: #16 rare, solar, coreScale 1.7, circular aura, solarCircle, stars+motes.
- `voidfire`: #17 rare, inverted sharp, ring aura, voidRing, motes.
- `aurora`: #18 rare, ribbon, hue drift, auroraBand, wisps+motes.
- `phoenix`: #19 rare, wing, sparks+ash.
- `nebula`: #20 rare, layered, footprint 1.2, circular aura, orbitRing+auroraBand, stars+motes.

## Compatibility Rules

- Existing `id`, `achievement`, `palette`, `embered`, `drift`, and `rarity` meanings stay unchanged.
- `visualProfile` values must not be stored in AsyncStorage.
- Tests must fail if any catalog flame lacks a complete BonfireDesign-derived profile.
- Tests must fail if profile data requires renderer branches by flame id.
- Tests must verify design parity for all 20 ids against the required flame map.
