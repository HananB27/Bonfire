# Fire Health Behavior Contract

**Feature**: 007-fire-health | **Type**: UI behavior contract

This contract defines the visible behavior of Fire Health in the bonfire scene. It is a product
contract, not a gameplay rule change.

## Contract

- Fire Health is derived from the latest 7 scored days, weighted toward newer scores.
- Fire Health resolves to exactly one of four canonical labels:
  - Faint
  - Steady
  - Bright
  - Radiant
- Fire Health is visual-only.
- Fire Health does not change:
  - streak survival
  - fire strength math
  - score totals
  - unlock outcomes
  - stored settings
- Fire Health is visible through two channels:
  - the flame’s behavior changes to feel weaker or stronger
  - the named state is shown in the flame scene so the user can read it
- Fire Health must not imply that the fire is healthy when the fire is not lit.

## State intent

| State | User reading | Visual intent |
|-------|--------------|---------------|
| Faint | recent effort is weak | fragile, subdued, smaller, dimmer |
| Steady | recent effort is acceptable / neutral | stable, balanced, readable |
| Bright | recent effort is strong | warmer, livelier, more vivid |
| Radiant | recent effort is strongest | most vivid, most confident, most energetic |

## Acceptance notes

- A user can compare two fire histories and see which one reads stronger by looking at the flame
  scene.
- A weak recent-history result never changes the underlying game state.
- A lit fire may show any of the four states; an unlit or out fire must not display a healthy-looking
  flame state.
