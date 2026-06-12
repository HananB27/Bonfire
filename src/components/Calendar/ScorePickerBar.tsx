/**
 * ScorePickerBar.tsx — the inline 1–5 score picker that slides up inside the
 * calendar sheet when a day is tapped (mirrors `styles.css .picker-bar`).
 *
 * Five heat-colored buttons (1..5) + a Clear button (disabled when the day has
 * no score yet). Choosing a score logs it; Clear removes it. The bar slides in
 * from below via Reanimated when `dateKey` becomes non-null.
 */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { Score } from '../../domain/fire';
import { parseYmd, type DateKey } from '../../domain/dates';
import { heatStyle, ink } from '../../theme/tokens';

interface ScorePickerBarProps {
  dateKey: DateKey | null; // the day being edited (null = closed)
  currentScore?: Score;
  onChoose: (score: Score) => void;
  onClear: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function labelFor(dateKey: DateKey): string {
  const d = parseYmd(dateKey);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function ScorePickerBar({ dateKey, currentScore, onChoose, onClear }: ScorePickerBarProps) {
  const open = dateKey !== null;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(open ? 0 : 1, {
      duration: 300,
      easing: Easing.bezier(0.22, 0.9, 0.3, 1),
    });
  }, [open, progress]);

  // translateY: 0 when open, fully below (112%) when closed.
  const slide = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * 240 }],
  }));

  return (
    <Animated.View style={[styles.bar, slide]} pointerEvents={open ? 'auto' : 'none'}>
      <View style={styles.head}>
        <Text style={styles.date}>{dateKey ? labelFor(dateKey) : ''}</Text>
        <Pressable
          onPress={onClear}
          disabled={currentScore === undefined}
          accessibilityRole="button"
          accessibilityLabel="Clear this day's score">
          <Text style={[styles.clear, currentScore === undefined && styles.clearDisabled]}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.scores}>
        {[1, 2, 3, 4, 5].map(n => {
          const heat = heatStyle(n);
          const active = currentScore === n;
          return (
            <Pressable
              key={n}
              onPress={() => onChoose(n as Score)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Score ${n}`}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: heat.background },
                active && styles.btnActive,
                pressed && styles.btnPressed,
              ]}>
              <Text style={[styles.btnText, { color: heat.color }]}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0c1222',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
    zIndex: 8,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: { fontSize: 14, fontWeight: '700', color: ink },
  clear: { color: '#ff9a7a', fontSize: 13, fontWeight: '600' },
  clearDisabled: { opacity: 0.35 },
  scores: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    borderWidth: 2,
    borderColor: '#fff4cf',
  },
  btnPressed: { transform: [{ scale: 0.9 }] },
  btnText: { fontSize: 18, fontWeight: '700' },
});

export default React.memo(ScorePickerBar);
