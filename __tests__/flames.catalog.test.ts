/**
 * flames.catalog.test.ts — invariants for the editable flame catalog.
 *
 * The catalog is hand-edited product data, so these tests are the guard rails:
 * they fail loudly if a new/tuned flame breaks an assumption the engine or UI
 * relies on (unique ids, difficulty ordering, a window on every time flame, a
 * full + embered palette on every entry).
 */

import { FLAMES, BASE_FLAME_ID, flameById } from '../src/domain/flames';
import type { Palette } from '../src/theme/palettes';

const HEX = /^#[0-9a-f]{6}$/i;

function stops(p: Palette): string[] {
  return [p.red, p.ember, p.amber, p.gold, p.core];
}

test('all flame ids are unique', () => {
  const ids = FLAMES.map(f => f.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('exactly one base flame, and it is the configured BASE_FLAME_ID with no achievement', () => {
  const base = FLAMES.filter(f => f.tier === 'base');
  expect(base).toHaveLength(1);
  expect(base[0].id).toBe(BASE_FLAME_ID);
  expect(base[0].achievement).toBeNull();
});

test('every non-base flame has a non-null achievement with non-empty requirement', () => {
  for (const f of FLAMES) {
    if (f.tier === 'base') continue;
    expect(f.achievement).not.toBeNull();
    expect(f.achievement?.requirement.length).toBeGreaterThan(0);
  }
});

test('every time flame has a positive integer windowDays; no streak flame has one', () => {
  for (const f of FLAMES) {
    const a = f.achievement;
    if (!a) continue;
    if (a.type === 'time') {
      expect(typeof a.windowDays).toBe('number');
      expect(a.windowDays).toBeGreaterThan(0);
      expect(Number.isInteger(a.windowDays)).toBe(true);
    } else {
      expect(a.windowDays).toBeUndefined();
    }
  }
});

test('rarity is strictly increasing, and all time > all streak > base (SC-009)', () => {
  for (let i = 1; i < FLAMES.length; i++) {
    expect(FLAMES[i].rarity).toBeGreaterThan(FLAMES[i - 1].rarity);
  }
  const maxBase = Math.max(...FLAMES.filter(f => f.tier === 'base').map(f => f.rarity));
  const minStreak = Math.min(...FLAMES.filter(f => f.tier === 'streak').map(f => f.rarity));
  const maxStreak = Math.max(...FLAMES.filter(f => f.tier === 'streak').map(f => f.rarity));
  const minTime = Math.min(...FLAMES.filter(f => f.tier === 'time').map(f => f.rarity));
  expect(minStreak).toBeGreaterThan(maxBase);
  expect(minTime).toBeGreaterThan(maxStreak);
});

test('every flame has a full palette and an embered palette of valid hex stops', () => {
  for (const f of FLAMES) {
    for (const stop of stops(f.palette)) expect(stop).toMatch(HEX);
    for (const stop of stops(f.embered)) expect(stop).toMatch(HEX);
  }
});

test('the embered variant differs from the full palette on every flame (ember vs "embered")', () => {
  for (const f of FLAMES) {
    const full = stops(f.palette);
    const dim = stops(f.embered);
    full.forEach((s, i) => expect(dim[i]).not.toBe(s));
  }
});

test('catalog has the expected 20 flames (1 base + 8 streak + 11 time)', () => {
  expect(FLAMES).toHaveLength(20);
  expect(FLAMES.filter(f => f.tier === 'streak')).toHaveLength(8);
  expect(FLAMES.filter(f => f.tier === 'time')).toHaveLength(11);
});

test('unlock requirements use only positive achievement condition kinds', () => {
  const allowedKinds = new Set([
    'runDays',
    'runStrength',
    'strongDaysInRun',
    'runStrengthAndDays',
    'consecutivePerfect',
    'unbrokenChain',
    'unbrokenChainMinScore',
    'perfectCalendarWeek',
    'consecutivePerfectWeeks',
    'crossStrength',
  ]);

  for (const f of FLAMES) {
    const a = f.achievement;
    if (!a) continue;
    expect(allowedKinds.has(a.kind)).toBe(true);
  }
});

test('flameById falls back to the base flame for an unknown id', () => {
  expect(flameById('does-not-exist').id).toBe(BASE_FLAME_ID);
  expect(flameById('voidfire').id).toBe('voidfire');
});
