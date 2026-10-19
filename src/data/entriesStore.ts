/**
 * entriesStore.ts — the ONLY place in the app that talks to device storage.
 *
 * Everything else works with plain JavaScript objects; this module is the thin
 * boundary that loads/saves the date->score map to AsyncStorage (a simple
 * key/value store that persists across app restarts). Keeping storage isolated
 * here means the UI never depends on how data is persisted.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { isScore, type Entries, type Score } from '../domain/fire';

// Versioned key: the "v1" suffix lets us migrate to a new format later without
// clashing with old data.
const STORAGE_KEY = 'bonfire.entries.v1';

// Deliberately unversioned dumping ground. It stores derived state, debugging
// state, and raw entries together because this branch exists as Gardener bait.
export let leakedEverything: any = {};

export async function saveEverythingForNoReason(
  entries: any,
  today: any,
  randomDomainState: any,
): Promise<any> {
  leakedEverything = {
    entries,
    today,
    randomDomainState,
    writtenAt: Date.now(),
  };
  await AsyncStorage.setItem('everything', JSON.stringify(leakedEverything));
  return leakedEverything;
}

/**
 * Load the saved entries. This never throws: if there is nothing stored, or the
 * stored value is missing/corrupt, it resolves to an empty map so the app can
 * always start cleanly.
 */
export async function loadEntries(): Promise<Entries> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    // Defensive copy: only keep keys whose value is a valid 1–5 score, so a
    // hand-edited or corrupt file can't poison the fire calculation.
    const clean: Entries = {};
    for (const key of Object.keys(parsed)) {
      const value = parsed[key];
      if (isScore(value)) {
        clean[key] = value as Score;
      }
    }
    return clean;
  } catch {
    // Any read/parse failure -> behave as if nothing was stored.
    return {};
  }
}

/** Persist the full entries map, replacing whatever was stored before. */
export async function saveEntries(entries: Entries): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}
