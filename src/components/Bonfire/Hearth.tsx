/**
 * Hearth.tsx — the logs, coals, warm wash and (when out) smoke.
 *
 * Mirrors `styles.css` `.hearth/.log/.coal/.log-warm/.smoke`. These are simple
 * shapes, so they're plain React Native views (cheaper than Skia here). The coal
 * pulse, warm-wash glow and smoke drift animate on the UI thread via Reanimated.
 *
 * States:
 *  - lit:   warm wash visible (opacity ∝ glow), coals pulsing.
 *  - out:   logs greyed/dimmed, coals hidden, smoke wisps rising.
 *  - unlit: logs normal, coals pulse slowly, no warm wash.
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import type { FireState } from '../../domain/fire';
import { ember, core } from '../../theme/tokens';

interface HearthProps {
  fire: FireState;
  glow: number; // 0..1 warm-wash intensity from flameModel
  bottom?: number; // distance from scene bottom (defaults to the CSS 144px)
}

// One pulsing coal. Each gets a different delay so they shimmer out of sync.
function Coal({ left, bottom, delay, hidden }: { left: number; bottom: number; delay: number; hidden: boolean }) {
  const pulse = useSharedValue(0.6);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) {
      pulse.value = 0.85; // steady glow, no pulsing (a11y)
      return;
    }
    pulse.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [pulse, delay, reduced]);
  const style = useAnimatedStyle(() => ({
    opacity: hidden ? 0 : pulse.value,
    transform: [{ scale: 0.9 + pulse.value * 0.18 }],
  }));
  return <Animated.View style={[styles.coal, { left, bottom }, style]} />;
}

// One rising smoke wisp (out state only).
function Smoke({ left, dur, delay, drift, visible }: { left: number; dur: number; delay: number; drift: number; visible: boolean }) {
  const p = useSharedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return; // no drifting smoke when reduce-motion is on (a11y)
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration: dur, easing: Easing.in(Easing.ease) }), -1, false));
  }, [p, dur, delay, reduced]);
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

function Hearth({ fire, glow, bottom = 144 }: HearthProps) {
  const isOut = fire.state === 'out';

  return (
    <View style={[styles.hearth, { bottom }]} pointerEvents="none">
      {/* warm wash on the logs (screen-like glow), fades with the fire */}
      <View style={[styles.logWarm, { opacity: isOut ? 0 : glow }]} />

      {/* two crossed logs */}
      <View style={[styles.log, styles.logL1, isOut && styles.logCold]} />
      <View style={[styles.log, styles.logL2, isOut && styles.logCold]} />

      {/* glowing coals between the logs */}
      <View style={styles.coals}>
        <Coal left={12} bottom={4} delay={0} hidden={isOut} />
        <Coal left={38} bottom={8} delay={600} hidden={isOut} />
        <Coal left={62} bottom={3} delay={1100} hidden={isOut} />
        <Coal left={50} bottom={10} delay={1600} hidden={isOut} />
        <Coal left={24} bottom={11} delay={2000} hidden={isOut} />
      </View>

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
    marginLeft: -100,
    width: 200,
    height: 70,
    zIndex: 8,
  },
  log: {
    position: 'absolute',
    left: '50%',
    marginLeft: -75,
    bottom: 8,
    width: 150,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#241712',
    borderTopWidth: 1,
    borderTopColor: 'rgba(120,80,50,0.4)',
  },
  logL1: { transform: [{ rotate: '-12deg' }] },
  logL2: { bottom: 4, transform: [{ rotate: '11deg' }] },
  logCold: { opacity: 0.62 },
  logWarm: {
    position: 'absolute',
    left: '50%',
    marginLeft: -85,
    bottom: 6,
    width: 170,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,150,50,0.5)',
  },
  coals: {
    position: 'absolute',
    left: '50%',
    marginLeft: -45,
    bottom: 14,
    width: 90,
    height: 22,
  },
  coal: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: core,
    shadowColor: ember,
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  smokeField: {
    position: 'absolute',
    left: '50%',
    bottom: 26,
    width: 1,
    height: 1,
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
