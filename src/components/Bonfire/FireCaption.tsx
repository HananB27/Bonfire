/**
 * FireCaption.tsx — the caption under the flame: WORD / sub / "strength N".
 *
 * Mirrors `styles.css .fire-caption`. The word comes from the engine's
 * `fireLabel` (Unlit / Out / A spark / Kindling / Steady / Blazing / Roaring /
 * Inferno). The strength line shows only when the fire is lit. The whole caption
 * fades out as the calendar sheet rises (driven by the `lift` shared value).
 */

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { FireState } from '../../domain/fire';
import { gold, inkDim, inkFaint, amber } from '../../theme/tokens';

interface FireCaptionProps {
  fire: FireState;
  lift?: SharedValue<number>;
  bottom?: number;
}

function FireCaption({ fire, lift, bottom = 92 }: FireCaptionProps) {
  const fade = useAnimatedStyle(() => ({ opacity: 1 - (lift ? lift.value : 0) }));
  const isOut = fire.state === 'out';

  return (
    <Animated.View
      style={[styles.wrap, { bottom }, fade]}
      pointerEvents="none"
      accessibilityRole="text"
      accessibilityLabel={`${fire.label.word}. ${fire.label.sub}.${
        fire.state === 'lit' ? ` Strength ${fire.strength}.` : ''
      }`}>
      <Text style={[styles.word, isOut && styles.wordOut]}>{fire.label.word.toUpperCase()}</Text>
      <Text style={styles.sub}>{fire.label.sub}</Text>
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
  strength: {
    marginTop: 7,
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

export default React.memo(FireCaption);
