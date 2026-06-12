/**
 * FlameRow.tsx — one row in the flame gallery.
 *
 * Shows a gradient swatch (full colors when unlocked, the dim "embered" colors
 * when locked), the flame's name, and a status line that depends on the derived
 * `AchievementState`:
 *  - unlocked streak/base → "Unlocked"
 *  - unlocked time        → "Unlocked · Nd left" (the window countdown)
 *  - locked streak/time   → the requirement + a progress bar (value / target)
 *  - locked time, expired → "Expired — re-earn: <requirement>"
 *
 * Tapping an UNLOCKED row equips the flame. Tapping a LOCKED row never equips
 * (FR-001): instead the row plays a brief ~250ms shake-and-flash rejection cue
 * (FR-002) so the user sees the tap landed but the flame must be earned first.
 * Accessibility: each row is a radio whose selected state marks the active
 * flame; locked rows are additionally announced as disabled with a
 * "Locked — <requirement>" label.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { AchievementState } from '../../domain/achievements';
import type { FlameId, FlameStyle } from '../../domain/flames';
import { bg2, core, ink, inkDim, inkFaint, line } from '../../theme/tokens';

interface FlameRowProps {
  flame: FlameStyle;
  state: AchievementState;
  active: boolean;
  justUnlocked?: boolean; // one-shot celebration when the flame flips to unlocked (FR-023)
  onPress: (id: FlameId) => void;
}

// How long the locked-tap rejection cue stays visible (shake + flash), in ms.
const REJECT_MS = 250;

// The swatch colors: full gradient when unlocked, embered stops when locked.
function swatchColors(flame: FlameStyle, unlocked: boolean): string[] {
  if (unlocked) return flame.gradient;
  const e = flame.embered;
  return [e.core, e.gold, e.amber, e.ember, e.red];
}

// The status line + an optional 0..1 progress fraction for the bar.
function statusFor(
  flame: FlameStyle,
  state: AchievementState,
): { text: string; progress: number | null } {
  const ach = flame.achievement;
  // Base flame (or anything with no achievement): always just "Unlocked".
  if (!ach) return { text: 'Unlocked', progress: null };

  if (state.unlocked) {
    if (ach.type === 'time' && state.daysLeft !== null) {
      return { text: `Unlocked · ${Math.max(0, state.daysLeft)}d left`, progress: null };
    }
    return { text: 'Unlocked', progress: null };
  }

  // Locked: show how to earn it (and how close).
  const frac =
    state.progress.target > 0
      ? Math.min(1, state.progress.value / state.progress.target)
      : 0;
  if (ach.type === 'time' && state.expired) {
    return { text: `Expired — re-earn: ${ach.requirement}`, progress: frac };
  }
  const counter = `${Math.min(state.progress.value, state.progress.target)}/${state.progress.target}`;
  return { text: `${ach.requirement} · ${counter}`, progress: frac };
}

function FlameRow({ flame, state, active, justUnlocked = false, onPress }: FlameRowProps) {
  const unlocked = state.unlocked;
  const { text, progress } = statusFor(flame, state);
  const colors = swatchColors(flame, unlocked);
  // A freshly earned flame gets a brief celebratory label + glow tint so the
  // user notices the unlock without a popup (FR-023, in-app only).
  const status = justUnlocked ? `Just unlocked! ${text}` : text;
  // Locked rows announce their state up front so the rejection isn't a surprise.
  const a11yStatus = unlocked ? status : `Locked — ${status}`;

  // ---- Locked-tap rejection cue (FR-002) ----
  // `rejecting` gates the cue's testID + flash tint; `shakeX` drives a quick
  // left-right wobble. Both reset after REJECT_MS so the cue is one-shot.
  const [rejecting, setRejecting] = useState(false);
  const shakeX = useSharedValue(0);
  const rejectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Don't let a pending cue reset fire after the row unmounts.
    return () => {
      if (rejectTimer.current) clearTimeout(rejectTimer.current);
    };
  }, []);

  const handlePress = () => {
    if (unlocked) {
      onPress(flame.id); // normal equip path, unchanged (FR-003)
      return;
    }
    // Locked: never equip — shake the row instead.
    setRejecting(true);
    shakeX.value = withSequence(
      withTiming(-6, { duration: 60 }),
      withTiming(6, { duration: 60 }),
      withTiming(-4, { duration: 60 }),
      withTiming(0, { duration: 70 }),
    );
    if (rejectTimer.current) clearTimeout(rejectTimer.current);
    rejectTimer.current = setTimeout(() => setRejecting(false), REJECT_MS);
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="radio"
      accessibilityState={{ selected: active, disabled: !unlocked }}
      accessibilityLabel={`${flame.name}. ${a11yStatus}${active ? '. Active' : ''}`}
      style={({ pressed }) => [
        styles.row,
        justUnlocked && styles.rowJustUnlocked,
        pressed && styles.rowPressed,
      ]}>
      {/* the animated wrapper carries the shake + flash; its testID only exists
          while the rejection cue is playing, so tests can assert visibility */}
      <Animated.View
        testID={rejecting ? `flame-reject-${flame.id}` : undefined}
        style={[styles.inner, rejecting && styles.innerRejecting, shakeStyle]}>
        {/* gradient swatch — at least 2 stops are required by LinearGradient */}
        <LinearGradient
          colors={colors.length >= 2 ? (colors as [string, string, ...string[]]) : [colors[0], colors[0]]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.swatch, { borderColor: unlocked ? flame.palette.core : line }]}
        />

        <View style={styles.body}>
          <Text style={[styles.name, !unlocked && styles.nameLocked]}>{flame.name}</Text>
          <Text style={styles.status} numberOfLines={2}>
            {status}
          </Text>
          {progress !== null && (
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          )}
        </View>

        {active && <Text style={styles.check}>✓</Text>}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  rowPressed: { backgroundColor: 'rgba(255,255,255,0.05)' },
  rowJustUnlocked: { backgroundColor: 'rgba(255,174,59,0.10)' },
  // Inner wrapper holds the row layout so the rejection shake can move it
  // without disturbing the Pressable's own hit area.
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
  },
  // Brief warm flash behind a rejected (locked) tap.
  innerRejecting: { backgroundColor: 'rgba(255,122,24,0.12)' },
  swatch: {
    width: 34,
    height: 44,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  body: { flex: 1, gap: 3 },
  name: { color: ink, fontSize: 15, fontWeight: '700' },
  nameLocked: { color: inkDim },
  status: { color: inkFaint, fontSize: 11.5, lineHeight: 15 },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: bg2,
    overflow: 'hidden',
    marginTop: 2,
  },
  fill: { height: 4, borderRadius: 2, backgroundColor: '#ffae3b' },
  check: { color: core, fontSize: 18, fontWeight: '700' },
});

export default React.memo(FlameRow);
