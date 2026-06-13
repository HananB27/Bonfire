# Contract: Generic Flame Renderer

## Caller Contract

`BonfireScreen` passes these values to `Flame`:

- `fire`: existing fire state.
- `activeStyle`: active `FlameStyle`, including BonfireDesign-derived `visualProfile`.
- `palette`: effective palette, full when unlocked and embered when locked.
- `dim`: existing locked embered energy multiplier.
- `width`, `height`, `lift`: existing layout/gesture inputs.

`BonfireScreen` passes these values to `Embers`:

- `activeStyle`: active `FlameStyle`, including BonfireDesign-derived particle profiles.
- `palette`: effective palette.
- `intensity`: existing visual intensity derived from unchanged fire strength.
- `width`, `height`: existing layout inputs.

## Renderer Rules

- Renderer reads profile data and selects shared effect helpers.
- Renderer must not switch on specific flame ids for drawing behavior.
- Renderer must reproduce BonfireDesign identity using Skia equivalents of BonfireDesign tokens.
- Palette remains the source of rendered colors so locked embered state still works.
- `dim` remains the source of locked embered energy reduction.
- Out-state precedence remains unchanged: live flame effects do not draw when fire is out.
- Reduced-motion behavior remains honored.

## BonfireDesign Effect Families

`Flame.tsx` must support Skia equivalents for these BonfireDesign families:

- Tongue variants: `classic`, `lance`, `split`, `forked`, `twin`, `wide`, `warped`, `detached`,
  `squat`, `layered`, `crystal`, `crown`, `solar`, `inverted`, `ribbon`, `wing`.
- Edge treatments: `round`, `sharp`, `jagged`, `crystal`.
- Tongue transform traits: `dx`, `fy`, `rot`, `sx`, `sy`, `lag`, `layers`, `float`, `ghost`, `hue`.
- Aura variants: `oval`, `tall`, `wide`, `circular`, `ring`, with `dim` and `crisp` modifiers.
- Accents: `afterimage`, `shockPulse`, `solarCircle`, `orbitRing`, `voidRing`, `auroraBand`.
- Motion controls: `smooth`, `harsh`, `speed`, `sway`, `pulse`, `hueDrift`, `warp`, `ribbon`.
- Palette intent: `opacity`, `invert`, `footprint`, `coreScale`.
- Strength response controls: size, motion, particles, aura intensity, accent visibility.

## Fallback Rules

- Missing or malformed profile falls back to the Amber-like safe profile.
- Unsupported profile token must map to a documented closest equivalent that preserves visual identity.
- Fallback must not crash, produce blank flame states, or alter unlock/storage/fire math.

## Validation

- Component tests verify `activeStyle` reaches `Flame` and `Embers`.
- Pure tests verify profile-to-render helpers select shared BonfireDesign effect descriptors.
- Catalog tests verify all 20 profiles include required tokens, design refs, and BonfireDesign parity.
- Existing tests verify unlock, storage, gallery, palette, and strength behavior remain unchanged.
- Manual visual review compares product flames against BonfireDesign catalog cards/screenshots.
