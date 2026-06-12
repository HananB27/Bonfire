/**
 * flameModel.ts — pure math that turns a FireState into flame visuals.
 *
 * Ported from `BonfireDesign/fire.jsx`. Kept pure (no React, no Skia) so the
 * curve can be unit-tested and reused by both the flame and the embers.
 *
 * The key idea is diminishing returns: strength grows without bound, but the
 * flame's normalised "intensity" approaches 1 along an exponential curve, so a
 * roaring fire looks dramatic without the geometry exploding (soft cap → SC-002).
 */

import type { FireState } from '../../domain/fire';

export interface FlameVisual {
  height: number; // flame height in px: lit ? 60 + 268*t : 30 (spark)
  glow: number; // 0..1 halo/ground intensity: lit ? 0.35 + 0.6*t : unlit ? 0.12 : 0
  bright: number; // brightness multiplier: 0.85 + 0.45*t
  intensity: number; // t = 1 - e^(-strength/14), or 0 when not lit
  emberRate: number; // embers spawned per tick ~ intensity: 1 + round(t*2)
}

/** Continuous strength → normalised intensity in [0,1) with diminishing returns. */
export function intensity(strength: number): number {
  return 1 - Math.exp(-Math.max(0, strength) / 14);
}

/** Map the full fire state to the numbers the flame/embers render from. */
export function flameVisual(fire: FireState): FlameVisual {
  const lit = fire.state === 'lit';
  const t = intensity(fire.strength);

  const height = lit ? 60 + 268 * t : 30;
  const glow = lit ? 0.35 + 0.6 * t : fire.state === 'unlit' ? 0.12 : 0;
  const bright = 0.85 + 0.45 * t;
  const emberRate = 1 + Math.round(t * 2);

  return {
    height,
    glow,
    bright,
    intensity: lit ? t : 0,
    emberRate,
  };
}
