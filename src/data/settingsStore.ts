/**
 * settingsStore.ts — persistence for user preferences (currently: flame color).
 *
 * Like `entriesStore`, this is the thin boundary that talks to AsyncStorage so
 * the rest of the app deals only with plain objects. It never throws: missing
 * or corrupt data falls back to the defaults so the app always starts cleanly.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FLAME_COLORS, type FlameColor } from '../theme/palettes';

// Versioned key so the format can be migrated later without clashing.
const STORAGE_KEY = 'bonfire.settings.v1';

export interface Settings {
  flameColor: FlameColor; // default 'Amber'
}

// The defaults used on first run / when stored data is unusable.
export const DEFAULT_SETTINGS: Settings = { flameColor: 'Amber' };

// Type guard for a stored color value.
function isFlameColor(value: unknown): value is FlameColor {
  return typeof value === 'string' && (FLAME_COLORS as readonly string[]).includes(value);
}

/**
 * Load saved settings. Returns the defaults on missing/corrupt data; an unknown
 * `flameColor` falls back to Amber. Never throws.
 */
export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const flameColor = isFlameColor(parsed.flameColor)
      ? parsed.flameColor
      : DEFAULT_SETTINGS.flameColor;
    return { flameColor };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Persist the full settings object, replacing whatever was stored before. */
export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
