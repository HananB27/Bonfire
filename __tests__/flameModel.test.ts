/**
 * flameModel.test.ts — the pure strength→visual curve.
 *
 * Guards the oracle from contracts/flame-and-theme.md: intensity starts at 0,
 * strictly increases, soft-caps toward 1; and the lit flame height never shrinks
 * as strength grows.
 */

import { intensity, flameVisual } from '../src/components/Bonfire/flameModel';
import type { FireState } from '../src/domain/fire';

const lit = (strength: number): FireState => ({
  state: 'lit',
  strength,
  everLit: true,
  label: { word: '', sub: '' },
});

describe('intensity', () => {
  test('intensity(0) === 0', () => {
    expect(intensity(0)).toBe(0);
  });

  test('strictly increasing in strength', () => {
    for (let s = 0; s < 60; s++) {
      expect(intensity(s + 1)).toBeGreaterThan(intensity(s));
    }
  });

  test('soft caps below 1', () => {
    expect(intensity(100)).toBeLessThan(1);
    expect(intensity(100)).toBeGreaterThan(0.99);
  });

  test('clamps negative strength to 0', () => {
    expect(intensity(-5)).toBe(0);
  });
});

describe('flameVisual', () => {
  test('not-lit fires are a tiny spark with no intensity', () => {
    const unlit = flameVisual({ state: 'unlit', strength: 0, everLit: false, label: { word: '', sub: '' } });
    expect(unlit.height).toBe(30);
    expect(unlit.glow).toBeCloseTo(0.12);
    expect(unlit.intensity).toBe(0);

    const out = flameVisual({ state: 'out', strength: 0, everLit: true, label: { word: '', sub: '' } });
    expect(out.height).toBe(30);
    expect(out.glow).toBe(0);
    expect(out.intensity).toBe(0);
  });

  test('lit height is non-decreasing in strength', () => {
    let prev = -Infinity;
    for (let s = 0; s < 60; s++) {
      const h = flameVisual(lit(s)).height;
      expect(h).toBeGreaterThanOrEqual(prev);
      prev = h;
    }
  });

  test('lit base height is 60 at strength 0', () => {
    expect(flameVisual(lit(0)).height).toBe(60);
  });
});
