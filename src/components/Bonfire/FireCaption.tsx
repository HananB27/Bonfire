/**
 * FireCaption.tsx — the caption under the flame: WORD / sub / "strength N".
 *
 * Mirrors `styles.css .fire-caption`. The word comes from the engine's
 * `fireLabel` (Unlit / Out / A spark / Kindling / Steady / Blazing / Roaring /
 * Inferno). Fire Health adds a visual-only named condition when the fire is lit.
 * The strength line shows only when the fire is lit. The whole caption fades out
 * as the calendar sheet rises (driven by the `lift` shared value).
 */

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { FireState } from '../../domain/fire';
import type { FireHealthState, FireHealthName } from '../../domain/fireHealth';
import { gold, inkDim, inkFaint, amber } from '../../theme/tokens';

interface FireCaptionProps {
  fire: FireState;
  lift?: SharedValue<number>;
  bottom?: number;
  health?: FireHealthState;
}

function FireCaption({ fire, lift, bottom = 92, health }: FireCaptionProps) {
  const fade = useAnimatedStyle(() => ({ opacity: 1 - (lift ? lift.value : 0) }));
  const isOut = fire.state === 'out';
  const showHealth = fire.state === 'lit' && health?.visible;
  const healthTone = health?.name ?? 'steady';

  return (
    <Animated.View
      style={[styles.wrap, { bottom }, fade]}
      pointerEvents="none"
      accessibilityRole="text"
      accessibilityLabel={`${fire.label.word}. ${fire.label.sub}.${
        fire.state === 'lit' ? ` Strength ${fire.strength}.` : ''
      }${showHealth ? ` Fire Health ${health.label}.` : ''}`}>
      <Text style={[styles.word, isOut && styles.wordOut]}>{fire.label.word.toUpperCase()}</Text>
      <Text style={styles.sub}>{fire.label.sub}</Text>
      {showHealth && (
        <Text style={[styles.health, HEALTH_TONE_STYLES[healthTone]]}>
          fire health <Text style={styles.healthLabel}>{health.label}</Text>
        </Text>
      )}
      {fire.state === 'lit' && (
        <Text style={styles.strength}>
          strength <Text style={styles.strengthNum}>{fire.strength}</Text>
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 12,
  },
  word: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 2.5,
    color: gold,
  },
  wordOut: { color: inkDim },
  sub: {
    fontSize: 11.5,
    color: inkFaint,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  health: {
    marginTop: 7,
    fontSize: 11,
    color: inkFaint,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  health_faint: { color: 'rgba(179,186,204,0.68)' },
  health_steady: { color: inkFaint },
  health_bright: { color: 'rgba(255,202,113,0.86)' },
  health_radiant: { color: 'rgba(255,233,172,0.96)' },
  healthLabel: {
    color: amber,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  strength: {
    marginTop: 5,
    fontSize: 11,
    color: inkFaint,
    letterSpacing: 0.5,
  },
  strengthNum: {
    color: amber,
    fontSize: 13,
    fontWeight: '700',
  },
});

const HEALTH_TONE_STYLES: Record<FireHealthName, object> = {
  faint: styles.health_faint,
  steady: styles.health_steady,
  bright: styles.health_bright,
  radiant: styles.health_radiant,
};

export default React.memo(FireCaption);
