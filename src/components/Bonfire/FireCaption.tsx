/**
 * FireCaption.tsx — compact fire identity below the logs: WORD / strength.
 *
 * Mirrors `styles.css .fire-caption`. The word comes from the engine's
 * `fireLabel` (Unlit / Out / A spark / Kindling / Steady / Blazing / Roaring /
 * Inferno). The old subline is intentionally omitted from render; fire health
 * lives in the calendar header. The whole caption fades out as the calendar
 * sheet rises (driven by the `lift` shared value).
 */

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import type { FireState } from '../../domain/fire';
import { darken, type Palette } from '../../theme/palettes';
import { gold, inkDim } from '../../theme/tokens';

interface FireCaptionProps {
  fire: FireState;
  lift?: SharedValue<number>;
  bottom?: number;
  palette?: Palette;
}

function FireCaption({ fire, lift, bottom = 64, palette }: FireCaptionProps) {
  const fade = useAnimatedStyle(() => ({ opacity: 1 - (lift ? lift.value : 0) }));
  const isOut = fire.state === 'out';
  const mainColor = palette?.amber ?? gold;
  const mutedMainColor = darken(mainColor, 0.58);

  return (
    <Animated.View
      style={[styles.wrap, { bottom }, fade]}
      pointerEvents="none"
      accessibilityRole="text"
      accessibilityLabel={`${fire.label.word}.${fire.state === 'lit' ? ` Strength ${fire.strength}.` : ''}`}>
      <Text style={[styles.word, { color: mainColor }, isOut && styles.wordOut]}>
        {fire.label.word.toUpperCase()}
      </Text>
      {fire.state === 'lit' && (
        <Text style={[styles.strength, { color: mutedMainColor }]}>
          strength: <Text style={[styles.strengthNum, { color: mainColor }]}>{fire.strength}</Text>
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
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 3.4,
    color: gold,
  },
  wordOut: { color: inkDim },
  strength: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  strengthNum: {
    fontSize: 18,
    fontWeight: '800',
  },
});

export default React.memo(FireCaption);
