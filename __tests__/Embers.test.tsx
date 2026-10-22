/**
 * Embers.test.tsx — behavior tests for the rising ember layer.
 *
 * Renders EmbersLayer with Skia and Reanimated replaced by lightweight host
 * stand-ins (see the jest.mock calls below), so we can inspect the exact
 * particle props the component produces without a native canvas. Everything is
 * deterministic: the clock is a plain stub object, never wall-clock time, and
 * no test touches the network.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { SharedValue } from 'react-native-reanimated';
import { EmbersLayer, type EmbersProps } from '../src/components/Bonfire/Embers';
import { flameById } from '../src/domain/flames';
import type { Palette } from '../src/theme/palettes';

// Skia primitives become plain host elements named "Skia<Name>", so the test
// renderer keeps their props (positions, transforms, opacity) inspectable.
jest.mock('@shopify/react-native-skia', () => {
  const { createElement } = require('react');
  const host = (name: string) => (props: Record<string, unknown>) => {
    const { children, ...rest } = props;
    return createElement(`Skia${name}`, rest, children as React.ReactNode);
  };
  return {
    Canvas: host('Canvas'),
    Circle: host('Circle'),
    Group: host('Group'),
    Oval: host('Oval'),
    Path: host('Path'),
    RadialGradient: host('RadialGradient'),
    rect: (x: number, y: number, w: number, h: number) => ({ x, y, width: w, height: h }),
    vec: (x: number, y: number) => ({ x, y }),
    Skia: {
      Path: {
        MakeFromSVGString: () => ({}),
        Make: () => ({}),
      },
    },
  };
});

// Derived values are evaluated synchronously during render. That keeps every
// particle position a pure function of the clock value at that render.
jest.mock('react-native-reanimated', () => ({
  useDerivedValue: (fn: () => unknown) => fn(),
}));

// Primitive host types that represent drawn particles or their containers.
const PARTICLE_PRIMITIVES = ['SkiaCircle', 'SkiaOval', 'SkiaPath'];

// Minimal palette fixture. Embers only reads hex stops, so a small object is
// enough; the cast avoids spelling out every stop the Palette type requires.
const palette = {
  core: '#fff4c2',
  mid: '#ffb347',
  outer: '#ff5e1a',
  ember: '#ff3d00',
  glow: '#ffd27f',
} as unknown as Palette;

// A stub shared clock. Tests mutate `.value` directly to simulate ticks.
// The cast is justified: a real SharedValue carries reanimated internals that
// are irrelevant to pure position math.
function makeClock(value = 0): SharedValue<number> {
  return { value } as unknown as SharedValue<number>;
}

function baseProps(overrides: Partial<EmbersProps> = {}): EmbersProps {
  return {
    width: 390,
    height: 844,
    intensity: 1,
    palette,
    clock: makeClock(0),
    ...overrides,
  };
}

// Mount the layer and return the renderer so tests can update it in place.
function render(props: EmbersProps): ReactTestRenderer.ReactTestRenderer {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(<EmbersLayer {...props} />);
  });
  return tree;
}

function update(tree: ReactTestRenderer.ReactTestRenderer, props: EmbersProps) {
  act(() => {
    tree.update(<EmbersLayer {...props} />);
  });
}

// Count only the drawn particle primitives (dots, shapes, wisps).
function particleCount(tree: ReactTestRenderer.ReactTestRenderer): number {
  return tree.root.findAll(
    n => typeof n.type === 'string' && PARTICLE_PRIMITIVES.includes(n.type),
  ).length;
}

// Geometry = everything except opacity and color. Two renders with equal
// geometry placed every particle at the same spot, even if brightness differed.
function geometry(tree: ReactTestRenderer.ReactTestRenderer): unknown[] {
  return tree.root
    .findAll(n => typeof n.type === 'string' && n.type.startsWith('Skia'))
    .map(n => {
      // Strip brightness and color so only placement is compared.
      const { opacity, color, children, ...placement } = n.props;
      return [n.type, placement];
    });
}

function snapshot(tree: ReactTestRenderer.ReactTestRenderer): string {
  return JSON.stringify(tree.toJSON());
}

describe('EmbersLayer: out-state precedence', () => {
  test('intensity 0 emits no profile particles', () => {
    const lit = render(baseProps({ intensity: 1, activeStyle: flameById('amber') }));
    const out = render(baseProps({ intensity: 0, activeStyle: flameById('amber') }));

    // A lit fire draws profile particles on top of the ambient pool; an out
    // fire must draw strictly fewer primitives.
    expect(particleCount(out)).toBeLessThan(particleCount(lit));
  });

  test('intensity 0 output does not depend on the active flame', () => {
    const amber = render(baseProps({ intensity: 0, activeStyle: flameById('amber') }));
    const crimson = render(baseProps({ intensity: 0, activeStyle: flameById('crimson') }));

    // With no fire particles, the active style has nothing to change.
    expect(snapshot(crimson)).toBe(snapshot(amber));
  });
});

describe('EmbersLayer: shared particle primitives', () => {
  test('lit fire draws particles through the shared primitive set', () => {
    const tree = render(baseProps({ intensity: 1, activeStyle: flameById('amber') }));
    const primitives = tree.root.findAll(
      n => typeof n.type === 'string' && n.type.startsWith('Skia'),
    );

    // Every Skia host we emit must be one of the shared drawing primitives or a
    // known container/gradient. No flame-specific component names appear.
    const allowed = new Set([
      'SkiaCanvas',
      'SkiaCircle',
      'SkiaGroup',
      'SkiaOval',
      'SkiaPath',
      'SkiaRadialGradient',
    ]);
    for (const node of primitives) {
      expect(allowed.has(node.type as string)).toBe(true);
    }
  });

  test('a flame with no visual profile falls back safely and still renders', () => {
    // A missing profile must not throw; it resolves to the classic fallback.
    expect(() => render(baseProps({ intensity: 1, activeStyle: undefined }))).not.toThrow();
    const tree = render(baseProps({ intensity: 1, activeStyle: undefined }));
    expect(particleCount(tree)).toBeGreaterThan(0);
  });
});

describe('EmbersLayer: profile mix selection', () => {
  test('switching the active flame changes which particle variants are drawn', () => {
    const amber = render(baseProps({ intensity: 1, activeStyle: flameById('amber') }));
    const crimson = render(baseProps({ intensity: 1, activeStyle: flameById('crimson') }));

    // Different profile particle mixes must produce different rendered output.
    expect(snapshot(crimson)).not.toBe(snapshot(amber));
  });
});

describe('EmbersLayer: deterministic seeds and memoized pools', () => {
  test('the same dimensions and descriptor give identical geometry across fresh renders', () => {
    const props = baseProps({ intensity: 1, activeStyle: flameById('amber') });
    const first = render(props);
    const second = render(props);

    expect(particleCount(first)).toBeGreaterThan(0);
    expect(geometry(second)).toEqual(geometry(first));
  });

  test('re-rendering with identical props does not change any output', () => {
    const props = baseProps({ intensity: 1, activeStyle: flameById('amber') });
    const tree = render(props);
    const before = snapshot(tree);

    update(tree, { ...props });

    expect(snapshot(tree)).toBe(before);
  });

  test('intensity changes adjust brightness but do not reshuffle particle positions', () => {
    const props = baseProps({ intensity: 1, activeStyle: flameById('amber') });
    const tree = render(props);
    const before = geometry(tree);

    // Same pools, different brightness: placement must hold still.
    update(tree, { ...props, intensity: 0.5 });

    expect(geometry(tree)).toEqual(before);
  });
});

describe('EmbersLayer: dimension changes rebuild pools', () => {
  test('changing width changes particle placement', () => {
    const props = baseProps({ intensity: 1, activeStyle: flameById('amber') });
    const tree = render(props);
    const before = geometry(tree);

    update(tree, { ...props, width: 360 });

    expect(geometry(tree)).not.toEqual(before);
  });

  test('changing height changes particle placement', () => {
    const props = baseProps({ intensity: 1, activeStyle: flameById('amber') });
    const tree = render(props);
    const before = geometry(tree);

    update(tree, { ...props, height: 720 });

    expect(geometry(tree)).not.toEqual(before);
  });
});

describe('EmbersLayer: reduced motion', () => {
  test('a frozen clock holds particles still across re-renders', () => {
    const clock = makeClock(0);
    const props = baseProps({ intensity: 1, activeStyle: flameById('amber'), clock });
    const tree = render(props);
    const before = snapshot(tree);

    // Reduced motion keeps the clock at its frozen value, so nothing moves.
    update(tree, { ...props, clock });

    expect(snapshot(tree)).toBe(before);
  });

  test('advancing the clock moves particles, which contrasts with the frozen case', () => {
    const clock = makeClock(0);
    const props = baseProps({ intensity: 1, activeStyle: flameById('amber'), clock });
    const tree = render(props);
    const before = geometry(tree);

    // A running clock advances the phase, so placement must change.
    clock.value = 1200;
    update(tree, { ...props, clock });

    expect(geometry(tree)).not.toEqual(before);
  });
});

describe('EmbersLayer: hashing and PRNG output', () => {
  test('seeded field is stable for fixed inputs (checked through rendered output)', () => {
    // mulberry32 and hashString are not exported, so we pin their effect on
    // the rendered field: identical inputs must always yield identical output.
    const first = render(baseProps({ intensity: 1, width: 412, height: 915 }));
    const second = render(baseProps({ intensity: 1, width: 412, height: 915 }));

    expect(particleCount(first)).toBeGreaterThan(0);
    expect(snapshot(second)).toBe(snapshot(first));
  });
});
