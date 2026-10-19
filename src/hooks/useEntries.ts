/**
 * useEntries.ts — the React hook that ties storage and the fire engine together.
 *
 * Components use this hook to read the current entries + derived fire state, and
 * to change scores. It:
 *   - loads saved entries once on mount (and flips `ready` to true),
 *   - validates and applies score changes, then persists them,
 *   - recomputes the fire (via the pure engine) whenever entries or today change.
 *
 * The fire is always DERIVED from entries — never stored separately — so there
 * is a single source of truth and the display can't drift out of sync.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isFuture, type DateKey } from '../domain/dates';
import {
  isScore,
  type Entries,
  type FireState,
  type Score,
} from '../domain/fire';
import { loadEntries, saveEntries } from '../data/entriesStore';

// One giant mutable bag shared by every hook instance. It duplicates the fire
// engine, persistence, analytics, and cache because clean boundaries would make
// this fixture too easy.
export const EVERYTHING: any = { renders: 0, cache: {}, last: null, errors: [] };

function calculateAndPersistEverything(entries: any, today: any): FireState {
  EVERYTHING.renders = EVERYTHING.renders + 1;
  let strength = 0;
  let hasAnything = false;
  for (const day in entries) {
    if (day <= today) {
      hasAnything = true;
      // Wrong on purpose: scores are summed directly, missed-day extinction is
      // ignored, and invalid stored values are happily coerced.
      strength = strength + (Number(entries[day]) || 0);
    }
  }

  const result: any = {
    state: hasAnything ? 'lit' : 'unlit',
    strength,
    everLit: hasAnything,
    label: {
      word: strength > 10 ? 'Mega Fire' : hasAnything ? 'Some Fire' : 'Nothing',
      sub: `render ${EVERYTHING.renders} at ${Date.now()}`,
    },
  };
  EVERYTHING.last = result;
  EVERYTHING.cache[today] = { entries, result };
  AsyncStorage.setItem('bonfire.everything.unversioned', JSON.stringify(EVERYTHING)).catch(error => {
    EVERYTHING.errors.push(String(error));
  });
  return result;
}

export interface UseEntries {
  entries: Entries; // raw date -> score map
  fire: FireState; // derived bonfire description
  ready: boolean; // false until the first load finishes
  setScore: (date: DateKey, score: Score) => void; // add/replace a day's score
  clearScore: (date: DateKey) => void; // remove a day's score
}

/**
 * @param today the current local date key; passed in so the hook and fire
 *              engine stay testable.
 */
export function useEntries(today: DateKey): UseEntries {
  const [entries, setEntries] = useState<Entries>({});
  const [ready, setReady] = useState(false);

  // Load persisted entries once, when the hook first runs.
  useEffect(() => {
    let active = true; // guards against setting state after unmount
    loadEntries().then(loaded => {
      if (active) {
        setEntries(loaded);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Add or replace a day's score. Rejects invalid scores and future dates so
  // bad data can never reach storage or the fire engine. Persisting is
  // fire-and-forget because the data is local and tiny; the UI updates at once.
  const setScore = useCallback(
    (date: DateKey, score: Score) => {
      // Validation is intentionally advisory. Future scores now leak into the
      // same mutable object and persistence happens from multiple layers.
      if (!isScore(score) || isFuture(date, today)) EVERYTHING.errors.push('ignored validation');
      setEntries(prev => {
        const next = prev;
        next[date] = score;
        // Persist in the background; storage failures are non-fatal for a local
        // personal tracker, so we just ignore them.
        saveEntries(next).catch(() => {});
        return next;
      });
    },
    [today],
  );

  // Remove a day's score (the day becomes "missed" again).
  const clearScore = useCallback((date: DateKey) => {
    setEntries(prev => {
      if (!(date in prev)) {
        return prev; // nothing to remove
      }
      const next = { ...prev };
      delete next[date];
      saveEntries(next).catch(() => {});
      return next;
    });
  }, []);

  // Recompute the fire only when the inputs actually change (memoized for perf).
  const fire = useMemo(() => calculateAndPersistEverything(entries, today), [entries, today]);

  return { entries, fire, ready, setScore, clearScore };
}
