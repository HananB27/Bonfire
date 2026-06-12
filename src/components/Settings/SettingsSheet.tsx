/**
 * SettingsSheet.tsx — the top-right settings button and its color picker.
 *
 * Tapping the gear opens a small panel to choose the flame color
 * (Amber / Crimson / Sapphire). Choosing one recolors the flame immediately
 * (the parent feeds the choice into the palette) and persists it (FR-016/FR-017).
 *
 * Each swatch previews its palette's `core`/`ember` stops so the choice is
 * obvious at a glance.
 */

import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { FLAME_COLORS, PALETTES, type FlameColor } from '../../theme/palettes';
import { bg2, core, ink, inkDim, line } from '../../theme/tokens';

interface SettingsSheetProps {
  flameColor: FlameColor;
  onChange: (color: FlameColor) => void;
  top: number; // safe-area top inset, to place the button below the status bar
}

function SettingsSheet({ flameColor, onChange, top }: SettingsSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Settings: choose flame color"
        style={({ pressed }) => [styles.gear, { top: top + 6 }, pressed && styles.gearPressed]}>
        <Text style={styles.gearIcon}>⚙</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.panel} onPress={() => {}}>
            <Text style={styles.title}>Flame color</Text>
            {FLAME_COLORS.map(color => {
              const pal = PALETTES[color];
              const active = color === flameColor;
              return (
                <Pressable
                  key={color}
                  onPress={() => {
                    onChange(color);
                    setOpen(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={color}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                  <View style={[styles.swatch, { backgroundColor: pal.ember, borderColor: pal.core }]}>
                    <View style={[styles.swatchCore, { backgroundColor: pal.core }]} />
                  </View>
                  <Text style={styles.rowLabel}>{color}</Text>
                  {active && <Text style={styles.check}>✓</Text>}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  gear: {
    position: 'absolute',
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: line,
    backgroundColor: 'rgba(10,14,26,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 58,
  },
  gearPressed: { transform: [{ scale: 0.92 }] },
  gearIcon: { fontSize: 18, color: ink },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3,5,12,0.5)',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 96,
    paddingRight: 14,
  },
  panel: {
    minWidth: 200,
    backgroundColor: bg2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: line,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  title: {
    color: inkDim,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
  },
  rowPressed: { backgroundColor: 'rgba(255,255,255,0.05)' },
  swatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchCore: { width: 8, height: 8, borderRadius: 4 },
  rowLabel: { flex: 1, color: ink, fontSize: 15, fontWeight: '600' },
  check: { color: core, fontSize: 16, fontWeight: '700' },
});

export default React.memo(SettingsSheet);
