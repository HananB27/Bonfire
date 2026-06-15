/**
 * ScorePickerBar.tsx — the inline 1–5 score picker that slides up inside the
 * calendar sheet when a day is tapped (mirrors `styles.css .picker-bar`).
 *
 * Day note editor + five heat-colored buttons (1..5) + a Clear button
 * (disabled when the day has no score yet). The whole panel slides in together
 * when `dateKey` becomes non-null, and rides above the keyboard while editing.
 */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedKeyboard,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { Score } from '../../domain/fire';
import { parseYmd, type DateKey } from '../../domain/dates';
import { heatStyle, ink } from '../../theme/tokens';
import DayNoteEditor from './DayNoteEditor';

interface ScorePickerBarProps {
  dateKey: DateKey | null; // the day being edited (null = closed)
  currentScore?: Score;
  noteDraft: string;
  onNoteChange: (text: string) => void;
  onChoose: (score: Score) => void;
  onClear: () => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function labelFor(dateKey: DateKey): string {
  const d = parseYmd(dateKey);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function ScorePickerBar({
  dateKey,
  currentScore,
  noteDraft,
  onNoteChange,
  onChoose,
  onClear,
}: ScorePickerBarProps) {
  const open = dateKey !== null;
  const progress = useSharedValue(0);
  const keyboard = useAnimatedKeyboard();

  useEffect(() => {
    progress.value = withTiming(open ? 0 : 1, {
      duration: 300,
      easing: Easing.bezier(0.22, 0.9, 0.3, 1),
    });
  }, [open, progress]);

  // The note editor and score buttons move as one panel. Keyboard height is
  // subtracted so the selected-day controls stay visible while text input has
  // focus, then glide back to the bottom as the keyboard closes.
  const slide = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * 430 - keyboard.height.value }],
  }));

  return (
    <Animated.View style={[styles.bar, slide]} pointerEvents={open ? 'auto' : 'none'}>
      <DayNoteEditor
        dateKey={dateKey}
        value={noteDraft}
        onChangeText={onNoteChange}
      />

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
                // the white "1" needs its token-defined outline to stay visible
                heat.border !== undefined && { borderColor: heat.border },
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
    paddingTop: 12,
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
  clear: { color: '#ff9a7a', fontSize: 15, fontWeight: '800' },
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
  // Selected ring: dark warm instead of the old cream (#fff4cf), which became
  // invisible against the new light 1–3 fills (FR-008, acceptance 3).
  btnActive: {
    borderWidth: 3,
    borderColor: '#3b2a14',
  },
  btnPressed: { transform: [{ scale: 0.9 }] },
  btnText: { fontSize: 18, fontWeight: '700' },
});

export default React.memo(ScorePickerBar);
