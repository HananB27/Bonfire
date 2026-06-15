/**
 * Hearth.tsx — the logs, coals, warm wash and (when out) smoke.
 *
 * Mirrors `styles.css` `.hearth/.log/.coal/.log-warm/.smoke`. These are simple
 * shapes, so they're plain React Native views (cheaper than Skia here). The coal
 * pulse, warm-wash glow and smoke drift animate on the UI thread via Reanimated.
 *
 * Warm wash and coal colors derive from the active flame's `palette` prop
 * (003 US2) — the screen passes the same effective (possibly embered) palette
 * the flame renders with, so the hearth's light always matches the fire.
 *
 * States:
 *  - lit:   warm wash visible (opacity ∝ glow), coals pulsing.
 *  - out:   logs greyed/dimmed, coals hidden, smoke wisps rising.
 *  - unlit: logs normal, coals pulse slowly, no warm wash.
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import type { FireState } from '../../domain/fire';
import { withAlpha, type Palette } from '../../theme/palettes';

interface HearthProps {
  fire: FireState;
  glow: number; // 0..1 warm-wash intensity from flameModel
  intensity: number; // 0..1 normalized fire strength from flameModel
  palette: Palette; // active flame's effective palette → wash + coal colors
  bottom?: number; // distance from scene bottom (defaults to the CSS 144px)
}

interface LogSpec {
  key: string;
  width: number;
  height: number;
  bottom: number;
  marginLeft: number;
  rotate: string;
  zIndex: number;
  end: 'left' | 'right';
}

const LOGS: LogSpec[] = [
  { key: 'l1', width: 196, height: 28, bottom: 12, marginLeft: -102, rotate: '-13deg', zIndex: 8, end: 'left' },
  { key: 'l2', width: 196, height: 28, bottom: 19, marginLeft: -94, rotate: '11deg', zIndex: 9, end: 'right' },
  { key: 'l3', width: 170, height: 27, bottom: 31, marginLeft: -85, rotate: '-5deg', zIndex: 10, end: 'right' },
  { key: 'l4', width: 150, height: 26, bottom: 42, marginLeft: -75, rotate: '8deg', zIndex: 11, end: 'left' },
];

export const HEARTH_TOP_LOG_OFFSET = 47;

export function logCountForStrength(strength: number): number {
  // if (strength >= 8) return 4;
  // if (strength >= 3) return 3;
  return 2;
}

// One rising smoke wisp (out state only).
function Smoke({ left, dur, delay, drift, visible }: { left: number; dur: number; delay: number; drift: number; visible: boolean }) {
  const p = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!visible || reduced) {
      cancelAnimation(p);
      p.value = 0;
      return;
    }
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration: dur, easing: Easing.in(Easing.ease) }), -1, false));
    return () => cancelAnimation(p);
  }, [p, dur, delay, reduced, visible]);
  const style = useAnimatedStyle(() => {
    const o = p.value < 0.2 ? p.value / 0.2 : (1 - p.value) / 0.8;
    return {
      opacity: visible ? o * 0.55 : 0,
      transform: [
        { translateY: -p.value * 160 },
        { translateX: p.value * drift },
        { scale: 0.5 + p.value * 1.9 },
      ],
    };
  });
  return <Animated.View style={[styles.smoke, { left }, style]} />;
}

function SplitLog({
  spec,
  warmColors,
  warmOpacity,
  cold,
}: {
  spec: LogSpec;
  warmColors: readonly [string, string, string];
  warmOpacity: number;
  cold: boolean;
}) {
  const endStyle = spec.end === 'left' ? styles.logEndLeft : styles.logEndRight;
  return (
    <View
      testID="hearth-log"
      style={[
        styles.log,
        {
          width: spec.width,
          height: spec.height,
          bottom: spec.bottom,
          marginLeft: spec.marginLeft,
          borderRadius: spec.height / 2,
          zIndex: spec.zIndex,
          transform: [{ rotate: spec.rotate }],
        },
        cold && styles.logCold,
      ]}>
      <LinearGradient
        colors={['#1a0f08', '#2a190e', '#4a2f1b', '#2a1a10', '#1c110a', '#100a05']}
        locations={[0, 0.16, 0.4, 0.56, 0.8, 1]}
        style={[StyleSheet.absoluteFill, { borderRadius: spec.height / 2 }]}
      />
      <View style={styles.splitLine} />
      <View style={[styles.logEnd, endStyle]} />
      <LinearGradient
        colors={warmColors}
        locations={[0, 0.52, 1]}
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: spec.height / 2, opacity: warmOpacity },
        ]}
      />
    </View>
  );
}

function Hearth({ fire, glow, intensity, palette, bottom = 144 }: HearthProps) {
  const isOut = fire.state === 'out';
  const isLit = fire.state === 'lit';
  const logCount = logCountForStrength(isLit ? fire.strength : 0);

  // Palette-derived colors (003 US2): the warm wash is the flame's ember tone
  // at half alpha; coals glow with the flame's core/ember. Memoized on the
  // palette so they recompute only on flame switch, never per frame.
  const warmColors = useMemo(
    () =>
      [
        withAlpha(palette.gold, 0.58),
        withAlpha(palette.ember, 0.22),
        withAlpha(palette.red, 0),
      ] as const,
    [palette],
  );
  const warmOpacity = isOut ? 0 : Math.min(1, glow * (0.72 + intensity * 0.28));

  return (
    <View style={[styles.hearth, { bottom }]} pointerEvents="none">
      {/* split hardwood logs; stronger current run stacks more fuel */}
      {LOGS.slice(0, logCount).map(spec => (
        <SplitLog
          key={spec.key}
          spec={spec}
          warmColors={warmColors}
          warmOpacity={warmOpacity}
          cold={isOut}
        />
      ))}

      {/* smoke wisps only when the fire is out */}
      <View style={styles.smokeField}>
        <Smoke left={-20} dur={4000} delay={0} drift={-26} visible={isOut} />
        <Smoke left={0} dur={4800} delay={1300} drift={0} visible={isOut} />
        <Smoke left={20} dur={5600} delay={2600} drift={26} visible={isOut} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hearth: {
    position: 'absolute',
    left: '50%',
    marginLeft: -120,
    width: 240,
    height: 120,
    zIndex: 8,
  },
  log: {
    position: 'absolute',
    left: '50%',
    overflow: 'hidden',
    backgroundColor: '#1c110a',
  },
  logCold: { opacity: 0.62, borderTopColor: 'rgba(200,210,225,0.08)' },
  splitLine: {
    position: 'absolute',
    left: 12,
    right: 16,
    top: '49%',
    height: 1,
    backgroundColor: 'rgba(255,225,180,0.18)',
  },
  logEnd: {
    position: 'absolute',
    top: '7%',
    width: 23,
    height: '86%',
    borderRadius: 999,
    backgroundColor: '#432a19',
    borderWidth: 2,
    borderColor: 'rgba(20,10,6,0.82)',
  },
  logEndLeft: { left: -2 },
  logEndRight: { right: -2 },
  smokeField: {
    position: 'absolute',
    left: '50%',
    bottom: 44,
    width: 1,
    height: 1,
    zIndex: 20,
  },
  smoke: {
    position: 'absolute',
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(150,160,180,0.5)',
  },
});

export default React.memo(Hearth);
