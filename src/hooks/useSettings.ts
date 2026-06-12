/**
 * useSettings.ts — React hook for user preferences (the active flame style).
 *
 * Loads the saved settings once on mount (flipping `ready` to true), and exposes
 * `setFlameStyle` which validates the id against the catalog, updates state, and
 * persists it. Any catalog id is accepted — including LOCKED flames, which the
 * user may equip and see rendered embered until earned (FR-012). Persistence is
 * fire-and-forget: the data is local and tiny, and a write failure shouldn't
 * block the UI.
 */

import { useCallback, useEffect, useState } from 'react';
import { flameById, type FlameId } from '../domain/flames';
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from '../data/settingsStore';

export interface UseSettings {
  settings: Settings;
  ready: boolean; // false until the first load completes
  setFlameStyle: (id: FlameId) => void;
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

  const setFlameStyle = useCallback((id: FlameId) => {
    // A real catalog id resolves to itself; an unknown id resolves to the base
    // flame instead, so a mismatch means the id is bogus and we ignore it.
    if (flameById(id).id !== id) {
      return;
    }
    setSettings(prev => {
      const next = { ...prev, flameStyle: id };
      saveSettings(next).catch(() => {});
      return next;
    });
  }, []);

  return { settings, ready, setFlameStyle };
}
