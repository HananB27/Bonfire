/**
 * settingsStore.ts — persistence for user preferences (the active flame style).
 *
 * The thin boundary that talks to AsyncStorage so the rest of the app deals only
 * with plain objects. It never throws: missing or corrupt data falls back to the
 * defaults so the app always starts cleanly.
 *
 * v2 stores a flame *id* (`flameStyle`) instead of the old color *name*
 * (`flameColor`). On first load after upgrade we migrate the v1 value forward so
 * existing users keep their choice (Amber/Crimson/Sapphire now exist as flames
 * with the same ids).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { flameById, type FlameId } from '../domain/flames';

// Current (v2) key and the legacy (v1) key we migrate from.
const STORAGE_KEY = 'bonfire.settings.v2';
const LEGACY_KEY = 'bonfire.settings.v1';

export interface Settings {
  flameStyle: FlameId; // the active flame's id; default 'amber'
}

// The defaults used on first run / when stored data is unusable.
export const DEFAULT_SETTINGS: Settings = { flameStyle: 'amber' };

// The old v1 color names mapped to their equivalent v2 flame ids.
const V1_TO_V2: Record<string, FlameId> = {
  Amber: 'amber',
  Crimson: 'crimson',
  Sapphire: 'sapphire',
};

// Validate an id against the catalog (unknown ids collapse to the base flame).
function normalizeId(id: unknown): FlameId {
  if (typeof id !== 'string') return DEFAULT_SETTINGS.flameStyle;
  // flameById falls back to the base flame for anything unknown, so the returned
  // id is always a real catalog id.
  return flameById(id).id;
}

/**
 * Load saved settings. Tries v2 first; failing that, migrates a v1 color choice
 * forward (and persists it). Missing/corrupt data → defaults. Never throws.
 */
export async function loadSettings(): Promise<Settings> {
  try {
    const rawV2 = await AsyncStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as Record<string, unknown>;
      return { flameStyle: normalizeId(parsed.flameStyle) };
    }

    // No v2 yet — attempt a one-time migration from v1's `flameColor`.
    const rawV1 = await AsyncStorage.getItem(LEGACY_KEY);
    if (rawV1) {
      const parsed = JSON.parse(rawV1) as Record<string, unknown>;
      const color = typeof parsed.flameColor === 'string' ? parsed.flameColor : '';
      const migrated: Settings = { flameStyle: V1_TO_V2[color] ?? DEFAULT_SETTINGS.flameStyle };
      // Write the migrated value forward so future loads skip this path.
      await saveSettings(migrated);
      return migrated;
    }

    return { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Persist the full settings object under the v2 key. */
export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
