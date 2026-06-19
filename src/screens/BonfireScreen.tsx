/**
 * BonfireScreen.tsx — the app's single screen.
 *
 * Composes the full-screen fire scene (FireScene + Hearth + FireCaption)
 * with the swipe-up CalendarSheet on top and a top-right SettingsSheet. It wires
 * the data hooks (`useEntries`, `useSettings`) to the UI:
 *  - the calendar logs/clears a day's score → re-derives the fire → re-renders
 *    the flame;
 *  - the equipped flame's palette feeds the flame, embers AND hearth, so every
 *    light source in the scene matches the active flame (003 US2).
 *
 * A shared `progress` value (0 closed → 1 open) is owned here and passed to the
 * calendar sheet (which drives it) and caption (which fades out behind it).
 * The flame stays physically fixed; opening the calendar should not move the fire.
 *
 * Until both stores finish loading we show a plain dark screen (no premature
 * "unlit" flash — FR-015). A `__DEV__`-only "advance a day" pill lets us test the
 * two-missed-days extinguish rule without waiting for real days to pass.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AppState,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFrameCallback, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import Atmosphere from '../components/Bonfire/Atmosphere';
import FireScene from '../components/Bonfire/FireScene';
import Hearth, { HEARTH_TOP_LOG_OFFSET } from '../components/Bonfire/Hearth';
import FireCaption from '../components/Bonfire/FireCaption';
import { flameVisual } from '../components/Bonfire/flameModel';
import CalendarSheet from '../components/Calendar/CalendarSheet';
import SettingsSheet from '../components/Settings/SettingsSheet';
import { deriveAtmosphere } from '../domain/atmosphere';
import { addDays, todayKey, type DateKey } from '../domain/dates';
import { deriveFireHealth } from '../domain/fireHealth';
import type { FlameId } from '../domain/flames';
import { useEntries } from '../hooks/useEntries';
import { useDayNotes } from '../hooks/useDayNotes';
import { useSettings } from '../hooks/useSettings';
import { useFlames } from '../hooks/useFlames';
import { useFlamePulses } from '../hooks/useFlamePulses';
import { bg0, gold, inkDim } from '../theme/tokens';

const DESIGN_HEARTH_BOTTOM = 144;
const DESIGN_CAPTION_BOTTOM = 64;
const DESIGN_FLAME_LOG_GAP = 8;

export function fireLayoutForWidth(_width: number) {
  const hearthBottom = DESIGN_HEARTH_BOTTOM;
  return {
    flameVisibleBottomFromBottom: hearthBottom + HEARTH_TOP_LOG_OFFSET + DESIGN_FLAME_LOG_GAP,
    hearthBottom,
    captionBottom: DESIGN_CAPTION_BOTTOM,
  };
}

function BonfireScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [sceneSize, setSceneSize] = useState({ width, height });
  const [atmosphere, setAtmosphere] = useState(() => deriveAtmosphere());

  // The "real" today is fixed per session; dev offset simulates days passing.
  const realToday = useMemo(() => todayKey(), []);
  const [devOffset, setDevOffset] = useState(0);
  const today: DateKey = useMemo(() => addDays(realToday, devOffset), [realToday, devOffset]);
  const [selectedDate, setSelectedDate] = useState<DateKey | null>(null);

  const { entries, fire, ready: entriesReady, setScore, clearScore } = useEntries(today);
  const {
    draft: noteDraft,
    ready: notesReady,
    setDraft: setNoteDraft,
  } = useDayNotes(selectedDate);
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
  const { pulse } = useFlamePulses(entries, today, fire);
  const visual = useMemo(() => flameVisual(fire), [fire]);
  // Fire Health intentionally lags one day: today's score can affect gameplay
  // immediately, but the visual health window ends yesterday inside the helper.
  const fireHealth = useMemo(
    () => deriveFireHealth(entries, fire, today),
    [entries, fire, today],
  );
  const sceneWidth = sceneSize.width || width;
  const sceneHeight = sceneSize.height || height;
  const fireLayout = useMemo(() => fireLayoutForWidth(sceneWidth), [sceneWidth]);

  const handleSceneLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    const nextHeight = Math.round(event.nativeEvent.layout.height);
    setSceneSize(current =>
      current.width === nextWidth && current.height === nextHeight
        ? current
        : { width: nextWidth, height: nextHeight },
    );
  }, []);

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

  // Calendar open progress (0..1). The flame does not consume this; it stays put.
  const progress = useSharedValue(0);
  const sceneClock = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const sceneFrame = useFrameCallback(frame => {
    'worklet';
    if (progress.value <= 0.001) {
      sceneClock.value = frame.timeSinceFirstFrame ?? 0;
    }
  }, false);

  useEffect(() => {
    sceneFrame.setActive(!reducedMotion);
  }, [reducedMotion, sceneFrame]);

  // Refresh the derived sky only when the app becomes active. This keeps the
  // atmosphere aligned with local time without adding timers or per-frame work.
  useEffect(() => {
    const refreshAtmosphere = () => {
      setAtmosphere(deriveAtmosphere({ mode: 'focus' }));
    };
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') refreshAtmosphere();
    });

    return () => subscription.remove();
  }, []);

  const ready = entriesReady && notesReady && settingsReady;

  // Loading: a plain dark screen until both stores load (FR-015).
  if (!ready) {
    return <View style={[styles.screen, styles.loading]} />;
  }

  return (
    <View testID="bonfire-screen" style={styles.screen}>
      <Atmosphere state={atmosphere} />

      {/* the fire scene (GPU flame + embers, then hearth + caption on top).
          Out-state precedence (US2): `Flame` hides itself whenever the fire is
          not lit, so a locked/embered flame is NEVER drawn while the fire is out
          — the Hearth's smoke wins. The embered palette + `dim` only take effect
          when the fire is lit but the equipped flame is still locked.
          `activeStyle` (004) carries the BonfireDesign visualProfile into the
          flame (shape/motion/aura/accents) and embers (particle mix); palette +
          dim still control color/energy, so embered behavior is unchanged. */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={handleSceneLayout}>
        <Hearth
          fire={fire}
          glow={visual.glow}
          intensity={visual.intensity}
          palette={effectivePalette}
          atmosphere={atmosphere}
          bottom={fireLayout.hearthBottom}
        />
        <FireScene
          fire={fire}
          activeStyle={activeStyle}
          palette={effectivePalette}
          width={sceneWidth}
          height={sceneHeight}
          flameDim={dim}
          flameVisibleBottomFromBottom={fireLayout.flameVisibleBottomFromBottom}
          intensity={visual.intensity}
          clock={sceneClock}
          health={fireHealth}
          pulse={pulse}
        />
        <FireCaption
          fire={fire}
          lift={progress}
          bottom={fireLayout.captionBottom}
          palette={effectivePalette}
        />
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
        fireHealth={fireHealth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onSet={setScore}
        onClear={clearScore}
        noteDraft={noteDraft}
        onNoteChange={setNoteDraft}
        progress={progress}
        height={height}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: bg0 },
  loading: { backgroundColor: bg0 },
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
