/**
 * BonfireScreen.tsx — the app's single screen.
 *
 * Composes the full-screen fire scene (Flame + Embers + Hearth + FireCaption)
 * with the swipe-up CalendarSheet on top and a top-right SettingsSheet. It wires
 * the data hooks (`useEntries`, `useSettings`) to the UI:
 *  - the calendar logs/clears a day's score → re-derives the fire → re-renders
 *    the flame;
 *  - the equipped flame's palette feeds the flame, embers AND hearth, so every
 *    light source in the scene matches the active flame (003 US2).
 *
 * A shared `progress` value (0 closed → 1 open) is owned here and passed to BOTH
 * the calendar sheet (which drives it) and the flame (which lifts/dims with it),
 * so they move in lock-step (mirrors `app.jsx` calProg).
 *
 * Until both stores finish loading we show a plain dark screen (no premature
 * "unlit" flash — FR-015). A `__DEV__`-only "advance a day" pill lets us test the
 * two-missed-days extinguish rule without waiting for real days to pass.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useSharedValue } from 'react-native-reanimated';
import Flame from '../components/Bonfire/Flame';
import Embers from '../components/Bonfire/Embers';
import Hearth from '../components/Bonfire/Hearth';
import FireCaption from '../components/Bonfire/FireCaption';
import { flameVisual } from '../components/Bonfire/flameModel';
import CalendarSheet from '../components/Calendar/CalendarSheet';
import SettingsSheet from '../components/Settings/SettingsSheet';
import { addDays, todayKey, type DateKey } from '../domain/dates';
import type { FlameId } from '../domain/flames';
import { useEntries } from '../hooks/useEntries';
import { useSettings } from '../hooks/useSettings';
import { useFlames } from '../hooks/useFlames';
import { bg0, bg1, gold, inkDim } from '../theme/tokens';

function BonfireScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // The "real" today is fixed per session; dev offset simulates days passing.
  const realToday = useMemo(() => todayKey(), []);
  const [devOffset, setDevOffset] = useState(0);
  const today: DateKey = useMemo(() => addDays(realToday, devOffset), [realToday, devOffset]);

  const { entries, fire, ready: entriesReady, setScore, clearScore } = useEntries(today);
  const { settings, ready: settingsReady, setFlameStyle } = useSettings();

  // Derive every flame's unlock state + what the active flame should render
  // (full palette when unlocked, dim "embered" palette when locked). Memoized
  // off the render path so switching flames never drops frames (SC-010).
  const { states, activeStyle, effectivePalette, dim, newlyUnlocked } = useFlames(
    entries,
    today,
    fire,
    settings.flameStyle,
  );
  const visual = useMemo(() => flameVisual(fire), [fire]);

  // Locked-equip guard (FR-001, defense in depth): the gallery row already
  // refuses locked taps, but this wrapper makes the rule hold for ANY caller —
  // a locked flame id is silently dropped, never persisted. Reads only the
  // derived unlock state (002 invariant: nothing new is stored).
  const handleEquip = useCallback(
    (id: FlameId) => {
      if (states[id]?.unlocked) setFlameStyle(id);
    },
    [states, setFlameStyle],
  );

  // Calendar open progress (0..1), shared with the flame so it lifts as we open.
  const progress = useSharedValue(0);

  const ready = entriesReady && settingsReady;

  // Loading: a plain dark screen until both stores load (FR-015).
  if (!ready) {
    return <View style={[styles.screen, styles.loading]} />;
  }

  return (
    <View style={styles.screen}>
      {/* night background: vertical navy gradient + a soft top sky glow */}
      <LinearGradient colors={[bg1, bg0]} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(40,58,110,0.35)', 'transparent']}
        style={styles.skyGlow}
        pointerEvents="none"
      />

      {/* the fire scene (GPU flame + embers, then hearth + caption on top).
          Out-state precedence (US2): `Flame` hides itself whenever the fire is
          not lit, so a locked/embered flame is NEVER drawn while the fire is out
          — the Hearth's smoke wins. The embered palette + `dim` only take effect
          when the fire is lit but the equipped flame is still locked.
          `activeStyle` (004) carries the BonfireDesign visualProfile into the
          flame (shape/motion/aura/accents) and embers (particle mix); palette +
          dim still control color/energy, so embered behavior is unchanged. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Flame fire={fire} activeStyle={activeStyle} palette={effectivePalette} width={width} height={height} lift={progress} dim={dim} />
        <View style={StyleSheet.absoluteFill}>
          <Embers width={width} height={height} intensity={visual.intensity} palette={effectivePalette} activeStyle={activeStyle} />
        </View>
        <Hearth fire={fire} glow={visual.glow} palette={effectivePalette} />
        <FireCaption fire={fire} lift={progress} />
      </View>

      {/* settings (top-right): the gear opens the flame gallery */}
      <SettingsSheet
        states={states}
        activeId={settings.flameStyle}
        onEquip={handleEquip}
        newlyUnlocked={newlyUnlocked}
        top={insets.top}
      />

      {/* dev-only advance-a-day pill (mirrors the design's dev pill) */}
      {__DEV__ && (
        <View style={[styles.dev, { top: insets.top + 6 }]} pointerEvents="box-none">
          <Text style={styles.devText}>
            day <Text style={styles.devDay}>{today.slice(5)}</Text>
          </Text>
          {devOffset !== 0 && (
            <Pressable
              onPress={() => setDevOffset(0)}
              accessibilityLabel="Reset to today"
              style={styles.devBtn}>
              <Text style={styles.devBtnText}>today</Text>
            </Pressable>
          )}
          <Pressable
            onPress={() => setDevOffset(o => o + 1)}
            accessibilityLabel="Advance one day"
            style={styles.devBtn}>
            <Text style={styles.devBtnText}>+</Text>
          </Pressable>
        </View>
      )}

      {/* the swipe-up calendar */}
      <CalendarSheet
        today={today}
        entries={entries}
        onSet={setScore}
        onClear={clearScore}
        progress={progress}
        height={height}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: bg0 },
  loading: { backgroundColor: bg0 },
  skyGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: '40%' },
  dev: {
    position: 'absolute',
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(10,14,26,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingLeft: 10,
    paddingRight: 6,
    zIndex: 58,
  },
  devText: { fontSize: 10.5, color: inkDim },
  devDay: { color: gold, fontWeight: '600' },
  devBtn: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  devBtnText: { color: '#f4ead8', fontSize: 12 },
});

export default BonfireScreen;
