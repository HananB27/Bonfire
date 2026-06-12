/**
 * useFlames.ts — the single junction between derived achievement state and the UI.
 *
 * Given the calendar, today, the fire, and the user's chosen flame id, it returns
 * the unlock state of every flame plus what the on-screen fire should actually
 * render: the active flame's full palette when unlocked, or its dim "embered"
 * palette when locked.
 *
 * PERFORMANCE (SC-010): the catalog evaluation (`evaluateAll`) is wrapped in
 * `useMemo` keyed on the things that actually change the result — the entries,
 * today, and the fire's `state`/`strength`. It is NEVER run inside Skia's render
 * or any per-frame worklet. Switching the active flame only re-selects a palette
 * (a cheap object swap) and does not trigger a re-walk for the same calendar, so
 * changing flames can't drop frames.
 */

import { useMemo, useState } from 'react';
import type { DateKey } from '../domain/dates';
import type { Entries, FireState } from '../domain/fire';
import { evaluateAll, type AchievementState } from '../domain/achievements';
import { FLAMES, flameById, type FlameId, type FlameStyle } from '../domain/flames';
import { EMBERED_DIM, type Palette } from '../theme/palettes';

export interface UseFlames {
  states: Record<FlameId, AchievementState>; // unlock state for every catalog flame
  activeStyle: FlameStyle; // the user's selected flame
  activeUnlocked: boolean; // whether that flame is currently unlocked
  effectivePalette: Palette; // full palette if unlocked, embered if locked
  dim: number; // 1 if unlocked, EMBERED_DIM if locked (glow/brightness knob)
  newlyUnlocked: FlameId[]; // flames that flipped locked→unlocked on this evaluation (FR-023)
}

export function useFlames(
  entries: Entries,
  today: DateKey,
  fire: FireState,
  flameStyleId: FlameId,
): UseFlames {
  // Evaluate the whole catalog once per meaningful change. We destructure the
  // two fire fields the gate actually reads (state + strength) so the memo keys
  // on values, not the fire object's identity — an unrelated re-render that
  // recreates `fire` does not trigger a re-walk.
  const { state: fireState, strength: fireStrength } = fire;
  const states = useMemo(
    () => evaluateAll(FLAMES, entries, today, { state: fireState, strength: fireStrength }),
    [entries, today, fireState, fireStrength],
  );

  // Unlock feedback (FR-023): compare this evaluation's unlocked set against the
  // previous one using React's "state from previous renders" pattern (setState
  // during render — sanctioned for exactly this). Nothing is persisted, and the
  // first evaluation reports nothing, so an already-earned flame doesn't
  // "celebrate" on every app start.
  const unlockedNow = useMemo(
    () => new Set<FlameId>(Object.values(states).filter(s => s.unlocked).map(s => s.flameId)),
    [states],
  );
  const [prevUnlocked, setPrevUnlocked] = useState(unlockedNow);
  const [newlyUnlocked, setNewlyUnlocked] = useState<FlameId[]>([]);
  if (unlockedNow !== prevUnlocked) {
    setPrevUnlocked(unlockedNow);
    setNewlyUnlocked([...unlockedNow].filter(id => !prevUnlocked.has(id)));
  }

  // Selecting a flame is a cheap lookup; resolving + render values are memoized
  // so a flame switch is just a palette swap (no catalog re-evaluation).
  const activeStyle = useMemo(() => flameById(flameStyleId), [flameStyleId]);
  // Defensive default: a missing state (impossible while evaluateAll covers the
  // whole catalog) renders embered rather than wrongly granting full color.
  const activeUnlocked = states[activeStyle.id]?.unlocked ?? false;
  const effectivePalette = activeUnlocked ? activeStyle.palette : activeStyle.embered;
  const dim = activeUnlocked ? 1 : EMBERED_DIM;

  return { states, activeStyle, activeUnlocked, effectivePalette, dim, newlyUnlocked };
}
