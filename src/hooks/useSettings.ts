/**
 * useSettings.ts — React hook for user preferences (currently the flame color).
 *
 * Loads the saved settings once on mount (flipping `ready` to true), and exposes
 * `setFlameColor` which validates the choice, updates state, and persists it.
 * Persistence is fire-and-forget — the data is local and tiny, and a write
 * failure shouldn't block the UI.
 */

import { useCallback, useEffect, useState } from 'react';
import { FLAME_COLORS, type FlameColor } from '../theme/palettes';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type Settings,
} from '../data/settingsStore';

export interface UseSettings {
  settings: Settings;
  ready: boolean; // false until the first load completes
  setFlameColor: (color: FlameColor) => void;
}

export function useSettings(): UseSettings {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  // Load persisted settings once, when the hook first runs.
  useEffect(() => {
    let active = true; // guard against setting state after unmount
    loadSettings().then(loaded => {
      if (active) {
        setSettings(loaded);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const setFlameColor = useCallback((color: FlameColor) => {
    if (!FLAME_COLORS.includes(color)) {
      return; // ignore unknown values
    }
    setSettings(prev => {
      const next = { ...prev, flameColor: color };
      saveSettings(next).catch(() => {});
      return next;
    });
  }, []);

  return { settings, ready, setFlameColor };
}
