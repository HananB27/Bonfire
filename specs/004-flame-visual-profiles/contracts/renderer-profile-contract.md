# Contract: Generic Flame Renderer

## Caller Contract

`BonfireScreen` passes these values to `Flame`:

- `fire`: existing fire state.
- `activeStyle`: active `FlameStyle`, including `visualProfile`.
- `palette`: effective palette, full when unlocked and embered when locked.
- `dim`: existing locked embered energy multiplier.
- `width`, `height`, `lift`: existing layout/gesture inputs.

`BonfireScreen` passes these values to `Embers`:

- `activeStyle`: active `FlameStyle`, including particle profile.
- `palette`: effective palette.
- `intensity`: existing visual intensity derived from unchanged fire strength.
- `width`, `height`: existing layout inputs.

## Renderer Rules

- Renderer reads profile data and selects shared effect helpers.
- Renderer must not switch on specific flame ids for drawing behavior.
- Palette remains the source of rendered colors so locked embered state still works.
- `dim` remains the source of locked embered energy reduction.
- Out-state precedence remains unchanged: live flame effects do not draw when fire is out.
- Reduced-motion behavior remains honored.

## Shared Effect Families

`Flame.tsx` may support shared families such as:

- tongue shape variants: classic, split, forked, jagged, twin, lance, crown, ribbon, wing, layered.
- aura variants: oval, tall, circular, ring, crisp, dim, afterimage, shock pulse, solar circle.
- motion controls: flicker speed, sway, stretch, pulse, hue shift.
- strength response controls: size, motion, particles, aura intensity.

## Validation

- Component tests verify `activeStyle` reaches `Flame` and `Embers`.
- Pure tests verify profile-to-render helpers select shared effect descriptors.
- Existing tests verify unlock, storage, gallery, palette, and strength behavior remain unchanged.
