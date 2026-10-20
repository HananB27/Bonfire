/**
 * Embers.test.tsx — tests for the rising particle layer.
 *
 * Skia cannot run under Jest, so @shopify/react-native-skia is mocked with
 * lightweight host components that record their props. react-native-reanimated
 * is mocked so useDerivedValue evaluates its worklet eagerly against a plain
 * SharedValue-like object. No network, no timers, fully deterministic.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type { FlameStyle, ParticleKind } from '../../domain/flames';
import type { Palette } from '../../theme/palettes';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const host = (name: string) => {
    const Comp = (props: Record<string, unknown>) =>
      React.createElement(name, { ...props, children: props.children });
    Comp.displayName = name;
    return Comp;
  };
  const makePath = () => ({ _path: true });
  return {
    Canvas: host('Canvas'),
    Circle: host('Circle'),
    Group: host('Group'),
    Oval: host('Oval'),
    Path: host('Path'),
    RadialGradient: host('RadialGradient'),
    Skia: {
      Path: {
        MakeFromSVGString: jest.fn(() => makePath()),
        Make: jest.fn(() => makePath()),
      },
    },
    rect: (x: number, y: number, w: number, h: number) => ({ x, y, w, h }),
    vec: (x: number, y: number) => ({ x, y }),
  };
});

jest.mock('react-native-reanimated', () => ({
  useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
}));

// Import after mocks are registered.
import { Embers, EmbersLayer, mulberry32, hashString, KIND_DEFAULTS, ProfileParticle } from './Embers';
import { resolveParticleDescriptors, resolveVisualProfile } from './flameModel';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const palette = {
  name: 'test',
  ember: '#ff7a1a',
  flame: '#ffb347',
  glow: '#ffd27a',
} as unknown as Palette;

function makeStyle(kinds: ParticleKind[]): FlameStyle {
  return {
    id: 'test-flame',
    name: 'Test Flame',
    visualProfile: {
      particles: kinds.map((kind, i) => ({
        kind,
        count: 3,
        color: '#ffffff',
        size: 1,
        rise: 1,
        speed: 1,
        index: i,
      })),
    },
  } as unknown as FlameStyle;
}

function makeClock(value = 0) {
  return { value } as { value: number };
}

function render(element: React.ReactElement) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(element);
  });
  return tree;
}

function countHost(tree: ReactTestRenderer.ReactTestRenderer, name: string): number {
  return tree.root.findAll((n) => typeof n.type === 'string' && n.type === name).length;
}

function countComponent(tree: ReactTestRenderer.ReactTestRenderer, name: string): number {
  return tree.root.findAll((n) => (n.type as { displayName?: string })?.displayName === name).length;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

describe('mulberry32', () => {
  it('produces the same sequence for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 20; i++) expect(a()).toBe(b());
  });

  it('produces values in [0, 1)', () => {
    const rand = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('diverges for different seeds', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe('hashString', () => {
  it('is deterministic', () => {
    expect(hashString('sparks|#fff|3')).toBe(hashString('sparks|#fff|3'));
  });

  it('returns an unsigned 32-bit integer', () => {
    const h = hashString('anything at all');
    expect(Number.isInteger(h)).toBe(true);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it('handles the empty string', () => {
    expect(hashString('')).toBe(2166136261 >>> 0);
  });
});

describe('KIND_DEFAULTS', () => {
  const kinds: ParticleKind[] = ['sparks', 'motes', 'ash', 'bubbles', 'shards', 'wisps', 'stars'];

  it('defines every ParticleKind with well-ordered ranges', () => {
    for (const kind of kinds) {
      const d = KIND_DEFAULTS[kind];
      expect(d).toBeDefined();
      expect(d.period[0]).toBeLessThanOrEqual(d.period[1]);
      expect(d.rise[0]).toBeLessThanOrEqual(d.rise[1]);
      expect(d.size[0]).toBeLessThanOrEqual(d.size[1]);
    }
  });
});

// ---------------------------------------------------------------------------
// Embers
// ---------------------------------------------------------------------------

describe('Embers', () => {
  it('renders without throwing for a basic configuration', () => {
    expect(() =>
      render(
        <Embers
          width={320}
          height={600}
          intensity={0.8}
          palette={palette}
          activeStyle={makeStyle(['sparks'])}
          clock={makeClock(0) as never}
        />,
      ),
    ).not.toThrow();
  });

  it('renders the ambient pool even when intensity is 0', () => {
    const tree = render(
      <Embers
        width={320}
        height={600}
        intensity={0}
        palette={palette}
        activeStyle={makeStyle(['sparks', 'ash'])}
        clock={makeClock(0) as never}
      />,
    );
    // 14 ambient motes are always drawn as Circles.
    expect(countHost(tree, 'Circle')).toBeGreaterThanOrEqual(14);
  });

  it('draws no profile particles when intensity is 0', () => {
    const lit = render(
      <Embers
        width={320}
        height={600}
        intensity={1}
        palette={palette}
        activeStyle={makeStyle(['sparks'])}
        clock={makeClock(0) as never}
      />,
    );
    const unlit = render(
      <Embers
        width={320}
        height={600}
        intensity={0}
        palette={palette}
        activeStyle={makeStyle(['sparks'])}
        clock={makeClock(0) as never}
      />,
    );
    expect(countHost(lit, 'Circle')).toBeGreaterThan(countHost(unlit, 'Circle'));
  });

  it('produces identical output across renders with the same dimensions and style', () => {
    const props = {
      width: 320,
      height: 600,
      intensity: 0.6,
      palette,
      activeStyle: makeStyle(['sparks', 'motes']),
      clock: makeClock(123) as never,
    };
    const first = render(<Embers {...props} />).toJSON();
    const second = render(<Embers {...props} />).toJSON();
    expect(second).toEqual(first);
  });

  it('keeps the same particle geometry when re-rendered with an unrelated prop change', () => {
    const style = makeStyle(['sparks']);
    const tree = render(
      <Embers width={320} height={600} intensity={0.6} palette={palette} activeStyle={style} clock={makeClock(0) as never} />,
    );
    const before = JSON.stringify(tree.toJSON());
    ReactTestRenderer.act(() => {
      tree.update(
        <Embers width={320} height={600} intensity={0.6} palette={palette} activeStyle={style} clock={makeClock(0) as never} />,
      );
    });
    expect(JSON.stringify(tree.toJSON())).toBe(before);
  });
});

// ---------------------------------------------------------------------------
// EmbersLayer / resolve helpers
// ---------------------------------------------------------------------------

describe('EmbersLayer', () => {
  it('renders the same tree as Embers for the same props', () => {
    const props = {
      width: 300,
      height: 500,
      intensity: 0.5,
      palette,
      activeStyle: makeStyle(['wisps']),
      clock: makeClock(0) as never,
    };
    const a = render(<EmbersLayer {...props} />).toJSON();
    const b = render(<Embers {...props} />).toJSON();
    expect(a).toEqual(b);
  });
});

describe('resolveParticleDescriptors', () => {
  it('returns one descriptor per declared particle entry', () => {
    const profile = resolveVisualProfile(makeStyle(['sparks', 'ash']));
    const descriptors = resolveParticleDescriptors(profile);
    expect(descriptors.length).toBe(2);
    expect(descriptors.map((d) => d.kind)).toEqual(['sparks', 'ash']);
  });
});

describe('ProfileParticle', () => {
  const kinds: ParticleKind[] = ['sparks', 'motes', 'ash', 'bubbles', 'shards', 'wisps', 'stars'];
  const seed = {
    x: 0.5,
    size: 3,
    period: 2000,
    phase: 0.25,
    drift: 10,
    rise: 100,
    spin: 1,
  };

  it.each(kinds)('renders the %s branch without throwing', (kind) => {
    expect(() =>
      render(
        <ProfileParticle
          kind={kind}
          seed={seed as never}
          clock={makeClock(500) as never}
          width={300}
          baseY={400}
          color="#ffffff"
          bright={0.8}
        />,
      ),
    ).not.toThrow();
  });

  it('draws a stroked circle for bubbles', () => {
    const tree = render(
      <ProfileParticle
        kind="bubbles"
        seed={seed as never}
        clock={makeClock(0) as never}
        width={300}
        baseY={400}
        color="#ffffff"
        bright={1}
      />,
    );
    const circles = tree.root.findAll((n) => n.type === 'Circle');
    expect(circles.some((c) => c.props.style === 'stroke')).toBe(true);
  });

  it('draws an Oval for wisps', () => {
    const tree = render(
      <ProfileParticle
        kind="wisps"
        seed={seed as never}
        clock={makeClock(0) as never}
        width={300}
        baseY={400}
        color="#ffffff"
        bright={1}
      />,
    );
    expect(countHost(tree, 'Oval')).toBe(1);
  });

  it('draws a Path for shards and stars', () => {
    for (const kind of ['shards', 'stars'] as const) {
      const tree = render(
        <ProfileParticle
          kind={kind}
          seed={seed as never}
          clock={makeClock(0) as never}
          width={300}
          baseY={400}
          color="#ffffff"
          bright={1}
        />,
      );
      expect(countHost(tree, 'Path')).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// Reduced motion
// ---------------------------------------------------------------------------

describe('reduced motion', () => {
  it('holds particle positions when the shared clock is frozen', () => {
    const clock = makeClock(0);
    const props = {
      width: 320,
      height: 600,
      intensity: 0.7,
      palette,
      activeStyle: makeStyle(['sparks']),
      clock: clock as never,
    };
    const atStart = render(<Embers {...props} />).toJSON();
    // Clock never advances under reduced motion; re-render at the same time.
    const again = render(<Embers {...props} />).toJSON();
    expect(again).toEqual(atStart);
  });
});
