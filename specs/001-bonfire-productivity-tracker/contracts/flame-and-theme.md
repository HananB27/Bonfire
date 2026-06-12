# Contract: Flame Model & Theme (`src/components/Bonfire/flameModel.ts`, `src/theme/*`)

Pure math + tokens that drive the Skia flame. Ported from `BonfireDesign/{fire.jsx,styles.css,app.jsx}`
so the RN flame looks and scales like the design.

## Flame model (`flameModel.ts`) — pure

```ts
import type { FireState } from '../../domain/fire';

export interface FlameVisual {
  height: number;   // flame height in px: lit ? 60 + 268*t : 30
  glow: number;     // 0..1 halo/ground intensity: lit ? 0.35 + 0.6*t : unlit ? 0.12 : 0
  bright: number;   // brightness multiplier: 0.85 + 0.45*t
  intensity: number;// t = 1 - e^(-strength/14)
  emberRate: number;// spawn cadence ~ intensity (see fire.jsx: 1 + round(t*2) per tick)
}

export function intensity(strength: number): number; // 1 - Math.exp(-max(0,strength)/14)
export function flameVisual(fire: FireState): FlameVisual;
```

**Guarantees / oracle** (`flameModel.test.ts`):
- `intensity(0) === 0`; strictly increasing in strength; asymptotes toward 1 (soft cap → satisfies
  SC-002 / the soft-cap clarification).
- `flameVisual` for `state !== 'lit'` → `height: 30, glow: state==='unlit'?0.12:0, intensity:0`.
- `height` is non-decreasing in strength for lit fires.

## Theme tokens (`theme/tokens.ts`) — ported from `styles.css :root`

`bg0 #070a14, bg1 #0b1020, bg2 #121a30, ink #f4ead8, inkDim #8a93a8, inkFaint #515b73,
heat1 #5b2a18, heat2 #9a3b12, heat3 #e2580c, heat4 #f7a325, heat5 #ffe9ad, sheet #0e1426,
line rgba(255,255,255,0.06)`. Calendar heat ramp indexes `heat[score]` (1→heat1 … 5→heat5).

## Palettes (`theme/palettes.ts`) — ported from `app.jsx FLAME_PALETTES`

```ts
export const PALETTES = {
  Amber:    { ember:'#ff7a18', amber:'#ffae3b', gold:'#ffd27a', core:'#fff4cf', red:'#b3380f' },
  Crimson:  { ember:'#ff3b1f', amber:'#ff7a3b', gold:'#ffc27a', core:'#fff0d6', red:'#7a0f0f' },
  Sapphire: { ember:'#2a8bff', amber:'#4ab6ff', gold:'#bfe3ff', core:'#f0f9ff', red:'#163f8a' },
};
```

The active palette supplies the Skia flame's gradient stops (base→red→ember→amber→gold→core, per
`.flame.*` gradients) and ember colors. Switching palette MUST recolor the flame immediately
(FR-017).

## Non-goals
No animation/IO here — only pure mapping + constants. Animation lives in `Flame.tsx`/`Embers.tsx`
(Skia + Reanimated); persistence of the chosen palette lives in `settingsStore`.
