/**
 * Flame.tsx — the hero: a GPU-rendered bonfire flame (React Native Skia).
 *
 * This reproduces the canonical design (`BonfireDesign/styles.css` `.flame.*`
 * + `.halo` + `.ground-glow` + `fire.jsx`). The CSS look depends on three things
 * plain RN views can't do — blur, gradient fills, and `mix-blend-mode: screen`
 * (additive glow) — so the whole flame is drawn on a single Skia <Canvas>:
 *
 *   ground-glow  → blurred radial oval, low on the ground
 *   halo         → larger, taller blurred radial oval behind the flame
 *   5 flame tongues (base/mid/inner/core/tongue) → teardrop Skia paths, each
 *     with its own vertical LinearGradient + Blur, all composited with
 *     BlendMode.Screen and a brightness multiplier (`--bright`).
 *
 * Animation runs on the UI thread via a Skia clock (so it holds the display
 * refresh rate, ≥120 FPS, even while JS is busy): each tongue flickers with a
 * slightly different speed/phase (mirroring the `flick-a/b/c/tongue` keyframes),
 * and a "grow pop" plays when the fire's strength increases.
 *
 * The flame is hidden when the fire is `out` or `unlit` (the design shows smoke
 * / a dim hearth in those states — see Hearth/Embers).
 */

import React, { useEffect, useMemo } from 'react';
import {
  Canvas,
  Group,
  Path,
  Skia,
  LinearGradient,
  RadialGradient,
  Blur,
  Paint,
  ColorMatrix,
  Circle,
  vec,
} from '@shopify/react-native-skia';
import {
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { FireState } from '../../domain/fire';
import type { Palette } from '../../theme/palettes';
import { flameVisual } from './flameModel';

interface FlameProps {
  fire: FireState;
  palette: Palette;
  width: number;
  height: number;
  // 0 = closed, 1 = calendar fully open. Lifts + shrinks the flame as the sheet
  // rises (mirrors `app.jsx` calProg → translateY/scale on `.scene`).
  lift?: SharedValue<number>;
  // Energy knob for a LOCKED ("embered") flame: scales glow + brightness down so
  // the same flame reads as spent. Default 1 = full energy (no visual change).
  dim?: number;
}

// Distance (px) from the bottom of the canvas to the flame's base, mirroring the
// CSS `.fire { bottom: 170px }` so the flame sits just above the logs.
const BASE_FROM_BOTTOM = 170;

/**
 * Build one flame "tongue" as a teardrop path: a rounded, slightly bulging body
 * that tapers to a soft point at the top. Drawn from a baseline `baseY` upward.
 */
function tonguePath(cx: number, baseY: number, w: number, h: number) {
  const hw = w / 2;
  const top = baseY - h;
  const d =
    `M ${cx} ${top} ` +
    `C ${cx + hw * 0.9} ${top + h * 0.45} ${cx + hw} ${top + h * 0.82} ${cx + hw * 0.5} ${baseY} ` +
    `Q ${cx} ${baseY + h * 0.06} ${cx - hw * 0.5} ${baseY} ` +
    `C ${cx - hw} ${top + h * 0.82} ${cx - hw * 0.9} ${top + h * 0.45} ${cx} ${top} Z`;
  return Skia.Path.MakeFromSVGString(d) ?? Skia.Path.Make();
}

// A 4×5 color matrix that multiplies R/G/B by `b` (brightness), keeps alpha.
function brightnessMatrix(b: number): number[] {
  return [b, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, 1, 0];
}

// A flame-tongue flicker transform, computed on the UI thread from the clock.
// Pure worklet (no hooks) so it can be reused by each tongue's derived value.
function flickerTransform(
  ms: number,
  speed: number,
  swayPx: number,
  stretch: number,
  cx: number,
  baseY: number,
) {
  'worklet';
  const phase = (ms / 1000) * speed;
  const sx = 1 + Math.sin(phase * 1.3) * stretch * 0.4;
  const sy = 1 - Math.sin(phase) * stretch;
  const tx = Math.sin(phase * 0.9) * swayPx;
  return [
    { translateX: cx },
    { translateY: baseY },
    { translateX: tx },
    { scaleX: sx },
    { scaleY: sy },
    { translateX: -cx },
    { translateY: -baseY },
  ];
}

function Flame({ fire, palette, width, height, lift, dim = 1 }: FlameProps) {
  const visual = useMemo(() => flameVisual(fire), [fire]);
  // Embered flames burn lower: scale the halo/ground glow and overall brightness
  // by `dim` (1 = unchanged). Color still comes entirely from the `palette` prop.
  const glow = visual.glow * dim;
  const bright = visual.bright * dim;
  const lit = fire.state === 'lit';
  // Honor the OS "reduce motion" setting: freeze the flicker loop when set.
  const reducedMotion = useReducedMotion();

  const cx = width / 2;
  const baseY = height - BASE_FROM_BOTTOM;
  const fh = visual.height;

  // ---- Flame tongue geometry (ratios straight from `styles.css .flame.*`) ----
  const paths = useMemo(() => {
    return {
      base: tonguePath(cx, baseY, fh * 0.66, fh * 1.0),
      mid: tonguePath(cx, baseY, fh * 0.46, fh * 0.86),
      inner: tonguePath(cx, baseY, fh * 0.3, fh * 0.66),
      core: tonguePath(cx, baseY, fh * 0.17, fh * 0.46),
      // the slim flickering tongue floats up off the base (CSS bottom: 0.4*fh)
      tongue: tonguePath(cx, baseY - fh * 0.4, fh * 0.14, fh * 0.5),
    };
  }, [cx, baseY, fh]);

  // ---- Grow pop + ignite feedback (Reanimated shared values) ----
  // `grow` scales the whole flame: 1 at rest, a quick overshoot when strength
  // rises. `opacity` fades the flame in on ignite / out when extinguished.
  const grow = useSharedValue(1);
  const opacity = useSharedValue(lit ? 1 : 0);
  const prevStrength = useSharedValue(fire.strength);
  const prevLit = useSharedValue(lit);

  useEffect(() => {
    if (lit && !prevLit.value) {
      // ignite
      opacity.value = withTiming(1, { duration: 700 });
      grow.value = withSequence(
        withTiming(1.18, { duration: 260 }),
        withSpring(1, { damping: 8, stiffness: 120 }),
      );
    } else if (lit && fire.strength > prevStrength.value) {
      // grew
      grow.value = withSequence(
        withTiming(1.14, { duration: 210 }),
        withSpring(1, { damping: 9, stiffness: 140 }),
      );
    } else if (!lit) {
      opacity.value = withTiming(0, { duration: 700 });
    } else {
      opacity.value = withTiming(1, { duration: 300 });
    }
    prevStrength.value = fire.strength;
    prevLit.value = lit;
  }, [lit, fire.strength, grow, opacity, prevStrength, prevLit]);

  // ---- Per-frame flicker on the UI thread (Skia clock) ----
  // A free-running clock in ms; each tongue derives a gentle scale/translate
  // wobble from it at a different speed/phase, mimicking the CSS flick keyframes.
  const clock = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) return; // keep the flame still (a11y)
    let raf: number;
    const start = Date.now();
    const tick = () => {
      clock.value = Date.now() - start;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [clock, reducedMotion]);

  // Each tongue flickers with a slightly different speed/phase (flick-a/b/c/tongue).
  const baseT = useDerivedValue(() => flickerTransform(clock.value, 4.2, 3, 0.05, cx, baseY));
  const midT = useDerivedValue(() => flickerTransform(clock.value, 5.5, 4, 0.08, cx, baseY));
  const innerT = useDerivedValue(() => flickerTransform(clock.value, 7.0, 2, 0.12, cx, baseY));
  const coreT = useDerivedValue(() => flickerTransform(clock.value, 7.8, 2, 0.12, cx, baseY));
  const tongueT = useDerivedValue(() => flickerTransform(clock.value, 9.0, 6, 0.2, cx, baseY));

  // Whole-flame transform: grow pop + calendar lift (translate up & scale down).
  const flameTransform = useDerivedValue(() => {
    'worklet';
    const l = lift ? lift.value : 0;
    return [
      { translateX: cx },
      { translateY: baseY },
      { translateY: -0.18 * l * height },
      { scale: grow.value * (1 - 0.4 * l) },
      { translateX: -cx },
      { translateY: -baseY },
    ];
  });

  const flameOpacity = useDerivedValue(() => opacity.value, [opacity]);

  // Brightness layer applied to the whole composited flame (dim-aware).
  const brightPaint = useMemo(() => brightnessMatrix(bright), [bright]);

  // Halo / ground-glow sizing (mirrors the CSS `calc(... + var(--fh) * k)`).
  const haloW = 160 + fh * 2.2;
  const haloH = 200 + fh * 2.6;
  const groundW = 180 + fh * 1.7;
  const groundH = 80 + fh * 0.5;

  return (
    <Canvas style={{ width, height }} pointerEvents="none">
      <Group opacity={flameOpacity} transform={flameTransform}>
        {/* ---- ground glow (warm pool of light on the ground) ---- */}
        <Group
          opacity={glow}
          transform={[
            { translateX: cx },
            { translateY: baseY - 0 },
            { scaleX: groundW / 200 },
            { scaleY: groundH / 200 },
          ]}
          layer={
            <Paint>
              <Blur blur={8} />
            </Paint>
          }>
          <Circle c={vec(0, 0)} r={100}>
            <RadialGradient
              c={vec(0, 0)}
              r={100}
              colors={['rgba(255,150,40,0.55)', 'rgba(255,110,20,0.22)', 'rgba(255,110,20,0)']}
              positions={[0, 0.38, 0.72]}
            />
          </Circle>
        </Group>

        {/* ---- halo (big soft glow behind the flame) ---- */}
        <Group
          opacity={glow}
          transform={[
            { translateX: cx },
            { translateY: baseY - haloH * 0.3 },
            { scaleX: haloW / 200 },
            { scaleY: haloH / 200 },
          ]}
          layer={
            <Paint>
              <Blur blur={14} />
            </Paint>
          }>
          <Circle c={vec(0, 0)} r={100}>
            <RadialGradient
              c={vec(0, 0)}
              r={100}
              colors={['rgba(255,170,60,0.40)', 'rgba(255,120,24,0.16)', 'rgba(255,120,24,0)']}
              positions={[0, 0.4, 0.7]}
            />
          </Circle>
        </Group>

        {/* ---- the flame: 5 tongues, additive (screen) + brightness ---- */}
        <Group
          layer={
            <Paint>
              <ColorMatrix matrix={brightPaint} />
            </Paint>
          }>
          <Group blendMode="screen">
            {/* base — widest, deepest red→ember */}
            <Group transform={baseT} layer={<Paint><Blur blur={13} /></Paint>}>
              <Path path={paths.base}>
                <LinearGradient
                  start={vec(cx, baseY)}
                  end={vec(cx, baseY - fh)}
                  colors={['#7a1f06', palette.red, palette.ember, 'rgba(255,160,40,0.2)']}
                  positions={[0, 0.22, 0.7, 1]}
                />
              </Path>
            </Group>

            {/* mid — ember→amber */}
            <Group transform={midT} layer={<Paint><Blur blur={8} /></Paint>}>
              <Path path={paths.mid}>
                <LinearGradient
                  start={vec(cx, baseY)}
                  end={vec(cx, baseY - fh * 0.86)}
                  colors={['#b3380f', palette.ember, palette.amber, 'rgba(255,200,90,0.25)']}
                  positions={[0, 0.35, 0.8, 1]}
                />
              </Path>
            </Group>

            {/* tongue — slim flickering tip, drawn under inner/core */}
            <Group transform={tongueT} layer={<Paint><Blur blur={6} /></Paint>}>
              <Path path={paths.tongue}>
                <LinearGradient
                  start={vec(cx, baseY - fh * 0.4)}
                  end={vec(cx, baseY - fh * 0.9)}
                  colors={['rgba(255,170,60,0.7)', palette.gold, 'rgba(255,244,207,0)']}
                  positions={[0, 0.6, 1]}
                />
              </Path>
            </Group>

            {/* inner — ember→amber→gold */}
            <Group transform={innerT} layer={<Paint><Blur blur={5} /></Paint>}>
              <Path path={paths.inner}>
                <LinearGradient
                  start={vec(cx, baseY)}
                  end={vec(cx, baseY - fh * 0.66)}
                  colors={[palette.ember, palette.amber, palette.gold]}
                  positions={[0, 0.45, 0.85]}
                />
              </Path>
            </Group>

            {/* core — hottest, amber→gold→near-white */}
            <Group transform={coreT} layer={<Paint><Blur blur={3} /></Paint>}>
              <Path path={paths.core}>
                <LinearGradient
                  start={vec(cx, baseY)}
                  end={vec(cx, baseY - fh * 0.46)}
                  colors={[palette.amber, palette.gold, palette.core]}
                  positions={[0, 0.4, 0.88]}
                />
              </Path>
            </Group>
          </Group>
        </Group>
      </Group>
    </Canvas>
  );
}

// Re-render only when the inputs actually change (the flame is expensive).
export default React.memo(Flame);
