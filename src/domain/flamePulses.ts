/**
 * flamePulses.ts — pure score-history pulse rules for the fire.
 *
 * Inputs are existing score entries and a testable `today` key. Outputs are
 * plain objects for hooks/components. Nothing in this file writes storage,
 * changes fire math, or grants gameplay progress.
 */

import { addDays, type DateKey } from './dates';
import { isScore, type Entries, type FireState, type Score } from './fire';

export type PulseFamilyId = 'highScore' | 'consistency';
export type PulseVisualKind = 'brightBurst' | 'warmGlow';
export type PulseSuppressedReason = 'none' | 'cooldown' | 'not-lit' | 'not-qualified';

export const HIGH_SCORE_PULSE_ACTIVE_MS = 1800;
export const HIGH_SCORE_PULSE_FADE_MS = 600;
export const CONSISTENCY_PULSE_ACTIVE_MS = 2600;
export const CONSISTENCY_PULSE_FADE_MS = 800;
export const PULSE_COOLDOWN_DAYS = 7;

export interface FlamePulseState {
  active: boolean;
  family: PulseFamilyId | null;
  date: DateKey | null;
  visualKind: PulseVisualKind | null;
  visualWeight: number;
  activeMs: number;
  fadeMs: number;
  consistencyTint: boolean;
  suppressedReason: PulseSuppressedReason;
}

const INACTIVE_PULSE: FlamePulseState = {
  active: false,
  family: null,
  date: null,
  visualKind: null,
  visualWeight: 0,
  activeMs: 0,
  fadeMs: 0,
  consistencyTint: false,
  suppressedReason: 'not-qualified',
};

function scoreOn(entries: Entries, date: DateKey): Score | null {
  const score = entries[date];
  return isScore(score) ? score : null;
}

function scoredWindow(entries: Entries, start: DateKey, end: DateKey): Score[] {
  const scores: Score[] = [];
  for (let date = start; date <= end; date = addDays(date, 1)) {
    const score = scoreOn(entries, date);
    if (score !== null) scores.push(score);
  }
  return scores;
}

function average(scores: readonly number[]): number {
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * Return true when `date` is a standout score day.
 */
export function qualifiesRawHighScore(entries: Entries, date: DateKey): boolean {
  const todayScore = scoreOn(entries, date);
  if (todayScore !== 5) return false;
  const priorScores = scoredWindow(entries, addDays(date, -7), addDays(date, -1));
  return priorScores.length >= 3 && todayScore - average(priorScores) >= 1;
}

/**
 * Return true when `date` is a consistency day. This reads only the rolling
 * seven-day calendar window ending on `date`.
 */
export function qualifiesRawConsistency(entries: Entries, date: DateKey): boolean {
  const scores = scoredWindow(entries, addDays(date, -6), date);
  return scores.length >= 5 && scores.every(score => score >= 4) && average(scores) >= 4;
}

type CooldownMemo = Map<string, boolean>;

function qualifiesRawFamily(entries: Entries, date: DateKey, family: PulseFamilyId): boolean {
  return family === 'highScore'
    ? qualifiesRawHighScore(entries, date)
    : qualifiesRawConsistency(entries, date);
}

function wouldDisplayFamilyPulse(
  entries: Entries,
  date: DateKey,
  family: PulseFamilyId,
  memo: CooldownMemo,
): boolean {
  const key = `${family}:${date}`;
  const cached = memo.get(key);
  if (cached !== undefined) return cached;
  if (!qualifiesRawFamily(entries, date, family)) {
    memo.set(key, false);
    return false;
  }
  const displays = !hasFamilyCooldown(entries, date, family, memo);
  memo.set(key, displays);
  return displays;
}

function hasFamilyCooldown(
  entries: Entries,
  today: DateKey,
  family: PulseFamilyId,
  memo: CooldownMemo = new Map(),
): boolean {
  // Cooldown is based on prior displayed moments, not every raw qualifying day.
  // Otherwise a suppressed run of good days would keep extending the cooldown
  // forever and pulses would stop feeling rare-but-reachable.
  for (let date = addDays(today, -(PULSE_COOLDOWN_DAYS - 1)); date < today; date = addDays(date, 1)) {
    if (wouldDisplayFamilyPulse(entries, date, family, memo)) return true;
  }
  return false;
}

function pulseFor(
  family: PulseFamilyId,
  date: DateKey,
  consistencyTint: boolean,
): FlamePulseState {
  if (family === 'highScore') {
    return {
      active: true,
      family,
      date,
      visualKind: 'brightBurst',
      visualWeight: 1,
      activeMs: HIGH_SCORE_PULSE_ACTIVE_MS,
      fadeMs: HIGH_SCORE_PULSE_FADE_MS,
      consistencyTint,
      suppressedReason: 'none',
    };
  }
  return {
    active: true,
    family,
    date,
    visualKind: 'warmGlow',
    visualWeight: 0.72,
    activeMs: CONSISTENCY_PULSE_ACTIVE_MS,
    fadeMs: CONSISTENCY_PULSE_FADE_MS,
    consistencyTint: false,
    suppressedReason: 'none',
  };
}

/**
 * Derive today's visual pulse. High-score wins collisions; consistency can
 * still expose a warm tint when both families qualify and pass cooldown.
 */
export function deriveFlamePulseState(
  entries: Entries,
  today: DateKey,
  fire: Pick<FireState, 'state'>,
): FlamePulseState {
  const highScoreQualifies = qualifiesRawHighScore(entries, today);
  const consistencyQualifies = qualifiesRawConsistency(entries, today);

  if (!highScoreQualifies && !consistencyQualifies) {
    return { ...INACTIVE_PULSE };
  }
  if (fire.state !== 'lit') {
    return { ...INACTIVE_PULSE, suppressedReason: 'not-lit' };
  }

  const highScoreCooling = highScoreQualifies && hasFamilyCooldown(entries, today, 'highScore');
  const consistencyCooling =
    consistencyQualifies && hasFamilyCooldown(entries, today, 'consistency');

  if (highScoreQualifies && !highScoreCooling) {
    return pulseFor('highScore', today, consistencyQualifies && !consistencyCooling);
  }
  if (consistencyQualifies && !consistencyCooling) {
    return pulseFor('consistency', today, false);
  }
  return { ...INACTIVE_PULSE, suppressedReason: 'cooldown' };
}
