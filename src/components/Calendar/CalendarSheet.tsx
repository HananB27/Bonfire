/**
 * CalendarSheet.tsx — the calendar lives in a bottom sheet that rises over the
 * full-screen bonfire (mirrors `calendar.jsx` / `styles.css .cal-window`).
 *
 * Closed: a clean view with a glowing "swipe up to log · or tap" handle.
 * Open:   the sheet covers ~72% of the screen, a scrim dims the fire behind it,
 *         and the month grid + inline score picker are shown.
 *
 * Interaction (gesture-handler Pan + Reanimated):
 *  - drag the handle up / tap it → open; drag the header down / tap scrim → close.
 *  - `progress` (0 closed → 1 open) is a SHARED value owned by the parent so the
 *    flame can lift/dim in lock-step (see BonfireScreen → Flame `lift`).
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import type { Score } from '../../domain/fire';
import type { Entries } from '../../domain/fire';
import type { DateKey } from '../../domain/dates';
import { inkFaint } from '../../theme/tokens';
import MonthGrid from './MonthGrid';
import ScorePickerBar from './ScorePickerBar';

interface CalendarSheetProps {
  today: DateKey;
  entries: Entries;
  onSet: (date: DateKey, score: Score) => void;
  onClear: (date: DateKey) => void;
  progress: SharedValue<number>; // 0 closed → 1 open (shared with the flame lift)
  height: number; // full screen height
}

const TIMING = { duration: 420, easing: Easing.bezier(0.22, 0.9, 0.3, 1) } as const;

function CalendarSheet({ today, entries, onSet, onClear, progress, height }: CalendarSheetProps) {
  const sheetH = Math.round(height * 0.72);
  const [selected, setSelected] = useState<DateKey | null>(null);

  // Drag start reference for the pan gestures.
  const startProgress = useSharedValue(0);

  // One pan formula works for both handle (drag up) and header (drag down):
  // moving up (negative translationY) increases progress.
  const makePan = () =>
    Gesture.Pan()
      .onBegin(() => {
        startProgress.value = progress.value;
      })
      .onUpdate(e => {
        const next = startProgress.value + -e.translationY / sheetH;
        progress.value = Math.min(1, Math.max(0, next));
      })
      .onEnd(e => {
        // Snap by position + a flick of velocity.
        const goingOpen = progress.value > 0.5 || e.velocityY < -600;
        const stayingOpen = goingOpen && e.velocityY < 600;
        if (stayingOpen) {
          progress.value = withTiming(1, TIMING);
        } else {
          progress.value = withTiming(0, TIMING);
          runOnJS(setSelected)(null);
        }
      });

  const handlePan = makePan();
  const headerPan = makePan();
  const handleTap = Gesture.Tap().onEnd(() => {
    progress.value = withTiming(1, TIMING);
  });
  const scrimTap = Gesture.Tap().onEnd(() => {
    progress.value = withTiming(0, TIMING);
    runOnJS(setSelected)(null);
  });

  // Sheet slides up: translateY from sheetH (hidden) to 0 (open).
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * sheetH }],
  }));
  // Scrim fades in as the sheet opens.
  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.42,
  }));
  // Closed-state handle fades out as the sheet opens.
  const handleStyle = useAnimatedStyle(() => ({
    opacity: 1 - Math.min(1, progress.value * 2),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* scrim — dims the fire; tap to close */}
      <GestureDetector gesture={scrimTap}>
        <Animated.View style={[styles.scrim, scrimStyle]} pointerEvents="auto" />
      </GestureDetector>

      {/* closed-state affordance: swipe up / tap to open */}
      <GestureDetector gesture={Gesture.Exclusive(handlePan, handleTap)}>
        <Animated.View style={[styles.affHandle, handleStyle]} pointerEvents="auto">
          <View style={styles.handlePill} />
          <Text style={styles.handleLabel}>swipe up to log · or tap</Text>
        </Animated.View>
      </GestureDetector>

      {/* the sheet itself */}
      <Animated.View style={[styles.sheet, { height: sheetH }, sheetStyle]}>
        <GestureDetector gesture={headerPan}>
          <View style={styles.grabHeader} accessibilityLabel="Drag to close calendar">
            <View style={styles.grab} />
          </View>
        </GestureDetector>

        <MonthGrid
          today={today}
          entries={entries}
          selectedDate={selected}
          onSelectDay={setSelected}
        />

        <ScorePickerBar
          dateKey={selected}
          currentScore={selected ? entries[selected] : undefined}
          onChoose={score => {
            if (selected) onSet(selected, score);
            setSelected(null);
          }}
          onClear={() => {
            if (selected) onClear(selected);
            setSelected(null);
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#03050c',
  },
  affHandle: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 156,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 24,
    gap: 8,
  },
  handlePill: {
    width: 50,
    height: 5,
    borderRadius: 5,
    backgroundColor: 'rgba(255,210,140,0.55)',
    shadowColor: '#ffaa3c',
    shadowOpacity: 0.45,
    shadowRadius: 14,
  },
  handleLabel: { fontSize: 11, letterSpacing: 0.4, color: inkFaint },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0f1e',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 18,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  grabHeader: { paddingTop: 12, paddingBottom: 6, alignItems: 'center' },
  grab: { width: 42, height: 5, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.18)' },
});

export default React.memo(CalendarSheet);
