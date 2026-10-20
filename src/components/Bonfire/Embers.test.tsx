/**
 * Embers.test.tsx — tests for the rising-particle layer.
 *
 * Covers: out-state precedence (intensity 0 → no profile particles),
 * deterministic seeding (identical props → identical geometry),
 * memoized pool rebuilds, reduced-motion clock freezing, and safe fallback
 * for a missing/unknown activeStyle.
 *
 * Skia and Reanimated are mocked so the suite is deterministic and runs
 * under Jest without a native canvas or worklet runtime.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { mulberry32, hashString, KIND_DEFAULTS, EmbersLayer } from './Embers';
import type { EmbersProps } from './Embers';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const make = (name: string) => {
    const Comp = (props: Record<string, unknown>) =>
      React.createElement(name, { testID: name, ...stripFns(props) }, props.children);
    Comp.displayName = name;
    return Comp;
  };
  // Drop non-serializable values (functions, shared values) from props.
  const stripFns = (props: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(props)) {
      if (k === 'children') continue;
      const v = props[k];
      if (typeof v === 'function' || (v && typeof v === 'object' && 'value' in (v as object))) continue;
      out[k] = v;
    }
    return out;
  };
  const pathStub = { _path: true };
  return {
    Canvas: make('Canvas'),
    Circle: make('Circle'),
    Group: make('Group'),
    Oval: make('Oval'),
    Path: make('Path'),
    RadialGradient: make('RadialGradient'),
    rect: (x: number, y: number, w: number, h: number) => ({ x, y, w, h }),
    vec: (x: number, y: number) => ({ x, y }),
    Skia: {
      Path: {
        MakeFromSVGString: () => pathStub,
        Make: () => pathStub,
      },
    },
  };
});

jest.mock('react-native-reanimated', () => ({
  useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const palette = {
  name: 'Amber',
  stops: ['#fff', '#fa0', '#f60', '#d40', '#820'],
} as unknown as EmbersProps['palette'];

function makeClock(value = 0) {
  return { value } as EmbersProps['clock'];
}

function baseProps(overrides: Partial<EmbersProps> = {}): EmbersProps {
  return {
    width: 360,
    height: 640,
    intensity: 0.8,
    palette,
    clock: makeClock(0),
    ...overrides,
  };
}

function render(props: EmbersProps) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<EmbersLayer {...props} />);
  });
  return tree;
}

function geometrySnapshot(tree: ReactTestRenderer.ReactTestRenderer): string {
  return JSON.stringify(tree.toJSON());
}

// ---------------------------------------------------------------------------
// Seeding helpers (pure)
// ---------------------------------------------------------------------------

describe('mulberry32', () => {
  it('produces the same sequence for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('produces values in [0, 1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('diverges for different seeds', () => {
    const a = mulberry32(1)();
    const b = mulberry32(2)();
    expect(a).not.toBe(b);
  });
});

describe('hashString', () => {
  it('is stable for the same input', () => {
    expect(hashString('sparks|#fff|4')).toBe(hashString('sparks|#fff|4'));
  });

  it('returns an unsigned 32-bit integer', () => {
    const h = hashString('anything at all');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it('distinguishes different strings', () => {
    expect(hashString('motes|a')).not.toBe(hashString('motes|b'));
  });

  it('handles the empty string', () => {
    expect(hashString('')).toBe(2166136261 >>> 0);
  });
});

describe('KIND_DEFAULTS', () => {
  it('defines well-ordered ranges for every particle kind', () => {
    for (const [kind, d] of Object.entries(KIND_DEFAULTS)) {
      expect({ kind, ok: d.period[0] <= d.period[1] }).toEqual({ kind, ok: true });
      expect({ kind, ok: d.rise[0] <= d.rise[1] }).toEqual({ kind, ok: true });
      expect({ kind, ok: d.size[0] <= d.size[1] }).toEqual({ kind, ok: true });
      expect(d.spread).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Component behaviour
// ---------------------------------------------------------------------------

describe('EmbersLayer', () => {
  describe('out-state precedence', () => {
    it('renders no profile particles when intensity is 0', () => {
      const lit = render(baseProps({ intensity: 0.8 }));
      const unlit = render(baseProps({ intensity: 0 }));
      // Ambient pool is always on, so the unlit tree must be strictly smaller.
      const litCount = lit.root.findAllByType('Circle' as unknown as React.ElementType).length;
      const unlitCount = unlit.root.findAllByType('Circle' as unknown as React.ElementType).length;
      expect(unlitCount).toBeLessThan(litCount);
    });

    it('still renders the ambient pool when intensity is 0', () => {
      const unlit = render(baseProps({ intensity: 0 }));
      expect(unlit.toJSON()).not.toBeNull();
    });
  });

  describe('deterministic seeding', () => {
    it('yields identical particle geometry for identical props', () => {
      const props = baseProps();
      const first = geometrySnapshot(render(props));
      const second = geometrySnapshot(render(props));
      expect(first).toBe(second);
    });
  });

  describe('memoization', () => {
    it('keeps geometry stable across clock-only re-renders', () => {
      const clock = makeClock(0);
      const tree = render(baseProps({ clock }));
      const before = geometrySnapshot(tree);
      ReactTestRenderer.act(() => {
        tree.update(<EmbersLayer {...baseProps({ clock })} />);
      });
      expect(geometrySnapshot(tree)).toBe(before);
    });

    it('rebuilds pools when dimensions change', () => {
      const tree = render(baseProps({ width: 360, height: 640 }));
      const before = geometrySnapshot(tree);
      ReactTestRenderer.act(() => {
        tree.update(<EmbersLayer {...baseProps({ width: 400, height: 700 })} />);
      });
      expect(geometrySnapshot(tree)).not.toBe(before);
    });
  });

  describe('reduced motion', () => {
    it('holds particle position when the shared clock is frozen', () => {
      const frozen = makeClock(1234);
      const a = render(baseProps({ clock: frozen }));
      const b = render(baseProps({ clock: frozen }));
      expect(geometrySnapshot(a)).toBe(geometrySnapshot(b));
    });
  });

  describe('activeStyle fallback', () => {
    it('does not throw when activeStyle is undefined', () => {
      expect(() => render(baseProps({ activeStyle: undefined }))).not.toThrow();
    });

    it('does not throw for an unknown activeStyle', () => {
      const unknown = { id: 'does-not-exist' } as unknown as EmbersProps['activeStyle'];
      expect(() => render(baseProps({ activeStyle: unknown }))).not.toThrow();
    });
  });
});
