/**
 * useFlamePulses.ts — memoized bridge from score history to pulse visuals.
 *
 * Inputs are entries, today's date, and the fire state. Output is one derived
 * pulse object plus duration constants for renderers/tests. No storage writes
 * happen here; pulse moments remain visual-only.
 */

import { useEffect, useMemo, useState } from 'react';
import type { DateKey } from '../domain/dates';
import type { Entries, FireState } from '../domain/fire';
import {
  CONSISTENCY_PULSE_ACTIVE_MS,
  CONSISTENCY_PULSE_FADE_MS,
  deriveFlamePulseState,
  HIGH_SCORE_PULSE_ACTIVE_MS,
  HIGH_SCORE_PULSE_FADE_MS,
  type FlamePulseState,
} from '../domain/flamePulses';

export interface UseFlamePulses {
  pulse: FlamePulseState;
  durations: {
    highScoreActiveMs: number;
    highScoreFadeMs: number;
    consistencyActiveMs: number;
    consistencyFadeMs: number;
  };
}

const DURATIONS = {
  highScoreActiveMs: HIGH_SCORE_PULSE_ACTIVE_MS,
  highScoreFadeMs: HIGH_SCORE_PULSE_FADE_MS,
  consistencyActiveMs: CONSISTENCY_PULSE_ACTIVE_MS,
  consistencyFadeMs: CONSISTENCY_PULSE_FADE_MS,
};

const SETTLED_PULSE: FlamePulseState = {
  active: false,
  family: null,
  date: null,
  visualKind: null,
  visualWeight: 0,
  activeMs: 0,
  fadeMs: 0,
  consistencyTint: false,
  suppressedReason: 'none',
};

type PulseLifecyclePhase = 'inactive' | 'active' | 'fading' | 'settled';

interface PulseLifecycle {
  key: string | null;
  phase: PulseLifecyclePhase;
  playedKeys: string[];
}

function pulseKey(pulse: FlamePulseState): string | null {
  return pulse.active && pulse.family && pulse.date ? `${pulse.family}:${pulse.date}` : null;
}

function fadingPulse(pulse: FlamePulseState): FlamePulseState {
  return { ...pulse, visualWeight: 0, consistencyTint: false };
}

function pulseForLifecycle(
  derivedPulse: FlamePulseState,
  lifecycle: PulseLifecycle,
): FlamePulseState {
  if (!lifecycle.key) return derivedPulse;
  if (lifecycle.phase === 'active') return derivedPulse;
  if (lifecycle.phase === 'fading') return fadingPulse(derivedPulse);
  return SETTLED_PULSE;
}

export function useFlamePulses(
  entries: Entries,
  today: DateKey,
  fire: Pick<FireState, 'state'>,
): UseFlamePulses {
  const fireState = fire.state;
  const derivedPulse = useMemo(
    () => deriveFlamePulseState(entries, today, { state: fireState }),
    [entries, today, fireState],
  );
  const initialKey = pulseKey(derivedPulse);
  const [lifecycle, setLifecycle] = useState<PulseLifecycle>(() => {
    if (!initialKey) return { key: null, phase: 'inactive', playedKeys: [] };
    return { key: initialKey, phase: 'active', playedKeys: [initialKey] };
  });
  const currentKey = pulseKey(derivedPulse);

  let effectiveLifecycle = lifecycle;
  if (lifecycle.key !== currentKey) {
    const alreadyPlayed = currentKey ? lifecycle.playedKeys.includes(currentKey) : false;
    effectiveLifecycle =
      !currentKey ? { ...lifecycle, key: null, phase: 'inactive' }
      : alreadyPlayed ? { ...lifecycle, key: currentKey, phase: 'settled' }
      : { key: currentKey, phase: 'active', playedKeys: [...lifecycle.playedKeys, currentKey] };
    setLifecycle(effectiveLifecycle);
  }

  useEffect(() => {
    // Pulse moments are one-shot visual state in memory. The derived rule can
    // stay true all day; this lifecycle plays it once, fades it, then leaves the
    // same date settled until a different qualifying date appears.
    if (!currentKey || effectiveLifecycle.phase !== 'active') return undefined;
    const timer = setTimeout(
      () =>
        setLifecycle(current =>
          current.key === currentKey ? { ...current, phase: 'fading' } : current,
        ),
      derivedPulse.activeMs,
    );

    return () => clearTimeout(timer);
  }, [currentKey, effectiveLifecycle.phase, derivedPulse.activeMs]);

  useEffect(() => {
    if (!currentKey || effectiveLifecycle.phase !== 'fading') return undefined;
    const timer = setTimeout(
      () =>
        setLifecycle(current =>
          current.key === currentKey ? { ...current, phase: 'settled' } : current,
        ),
      derivedPulse.fadeMs,
    );

    return () => clearTimeout(timer);
  }, [currentKey, effectiveLifecycle.phase, derivedPulse.fadeMs]);

  const pulse = pulseForLifecycle(derivedPulse, effectiveLifecycle);
  return { pulse, durations: DURATIONS };
}
