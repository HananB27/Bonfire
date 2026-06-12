/**
 * Embers.tsx — rising ember particles (React Native Skia).
 *
 * Two pools, mirroring the design:
 *  - ambient background embers (`styles.css .bg-embers`): ~14 slow, faint motes
 *    drifting up the whole scene, always on.
 *  - fire embers (`fire.jsx` spawner): brighter sparks rising from the flame,
 *    their brightness/size scaling with the fire's `intensity` (0 when not lit).
 *
 * Each particle loops on the UI thread from a shared Skia clock, so motion stays
 * smooth at the display refresh rate without any per-frame JS/React work.
 */

import React, { useEffect, useMemo } from 'react';
import { Canvas, Circle, RadialGradient, vec } from '@shopify/react-native-skia';
import { useDerivedValue, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { withAlpha, type Palette } from '../../theme/palettes';

interface EmbersProps {
  width: number;
  height: number;
  intensity: number; // 0..1 (0 = not lit → no fire embers)
  palette: Palette;
}

// A deterministic-ish seed for one particle (randomised once at mount).
interface Seed {
  x: number; // horizontal start, fraction of width
  size: number;
  period: number; // ms for one full rise
  phase: number; // 0..1 offset so they don't all start together
  drift: number; // horizontal drift in px over the rise
  rise: number; // how far up it travels, px
}

function makeSeeds(count: number, sizeMin: number, sizeRange: number, rise: number): Seed[] {
  const seeds: Seed[] = [];
  for (let i = 0; i < count; i++) {
    seeds.push({
      x: 0.05 + Math.random() * 0.9,
      size: sizeMin + Math.random() * sizeRange,
      period: 6000 + Math.random() * 7000,
      phase: Math.random(),
      drift: (Math.random() - 0.5) * 60,
      rise,
    });
  }
  return seeds;
}

/** One particle. `clock` is shared ms; `bright` scales the peak opacity. */
function Particle({
  seed,
  clock,
  width,
  baseY,
  color,
  bright,
}: {
  seed: Seed;
  clock: { value: number };
  width: number;
  baseY: number;
  color: string;
  bright: number;
}) {
  const startX = seed.x * width;

  // Vertical position: rise from baseY upward, looping each period.
  const cy = useDerivedValue(() => {
    'worklet';
    const p = ((clock.value / seed.period + seed.phase) % 1 + 1) % 1;
    return baseY - p * seed.rise;
  });
  const cx = useDerivedValue(() => {
    'worklet';
    const p = ((clock.value / seed.period + seed.phase) % 1 + 1) % 1;
    return startX + p * seed.drift;
  });
  const c = useDerivedValue(() => vec(cx.value, cy.value));

  // Opacity envelope: fade in quickly, fade out near the top.
  const opacity = useDerivedValue(() => {
    'worklet';
    const p = ((clock.value / seed.period + seed.phase) % 1 + 1) % 1;
    const env = p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1;
    return env * bright;
  });

  // Each particle fades out to a transparent version of ITS OWN color (003 US2)
  // — not a fixed orange — so off-palette flames get matching sparks.
  return (
    <Circle c={c} r={seed.size} opacity={opacity}>
      <RadialGradient
        c={c}
        r={seed.size}
        colors={[color, color, withAlpha(color, 0)]}
        positions={[0, 0.45, 1]}
      />
    </Circle>
  );
}

function Embers({ width, height, intensity, palette }: EmbersProps) {
  const baseY = height - 150; // just above the logs (matches the flame base)

  // Fixed pools (counts are constant so the hook order is stable).
  const bgSeeds = useMemo(() => makeSeeds(14, 1.5, 1.5, height), [height]);
  const fireSeeds = useMemo(() => makeSeeds(10, 2, 4, height * 0.55), [height]);

  // One shared clock for every particle, advanced each animation frame.
  const clock = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (reducedMotion) return; // freeze particles when the OS asks (a11y)
    let raf: number;
    const start = Date.now();
    const tick = () => {
      clock.value = Date.now() - start;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clock, reducedMotion]);

  return (
    <Canvas style={{ width, height }} pointerEvents="none">
      {/* ambient motes — always faintly drifting up */}
      {bgSeeds.map((seed, i) => (
        <Particle
          key={`bg${i}`}
          seed={seed}
          clock={clock}
          width={width}
          baseY={baseY}
          color={palette.amber}
          bright={0.4}
        />
      ))}
      {/* fire sparks — brighter, scaled by the fire's intensity */}
      {fireSeeds.map((seed, i) => (
        <Particle
          key={`fire${i}`}
          seed={seed}
          clock={clock}
          width={width}
          baseY={baseY}
          color={palette.core}
          bright={intensity}
        />
      ))}
    </Canvas>
  );
}

export default React.memo(Embers);
