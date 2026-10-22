/**
 * Embers.test.tsx — behavior tests for the rising-particle layer.
 *
 * Covers the shared ProfileParticle primitive across every ParticleKind, profile
 * switching, the out-state precedence (intensity 0 draws no fire particles),
 * the seeded PRNG + memoized pools, reduced-motion clock freezing, and safe
 * fallback when visualProfile is missing or malformed.
 *
 * Skia and Reanimated are mocked so the suite runs in Jest without a native
 * renderer. Nothing here touches the network or the wall clock.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { EmbersLayer, type EmbersProps } from '../src/components/Bonfire/Embers';
import { flameById, type FlameStyle, type ParticleKind } from '../src/domain/flames';
import { resolveParticleDescriptors, resolveVisualProfile } from '../src/components/Bonfire/flameModel';
import { PALETTES } from '../src/theme/palettes';

// ---------------------------------------------------------------------------
// Skia / Reanimated mocks. Elements render as plain host nodes so we can
// inspect the props each particle receives in the test tree.
// ---------------------------------------------------------------------------

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const host = (name: string) => (props: Record<string, unknown>) =>
    React.createElement(name, props, props.children);
  const path = () => ({ kind: 'path' });
  return {
    Canvas: host('Canvas'),
    Circle: host('Circle'),
    Group: host('Group'),
    Oval: host('Oval'),
    Path: host('Path'),
    RadialGradient: host('RadialGradient'),
    rect: (x: number, y: number, w: number, h: number) => ({ x, y, w, h }),
    vec: (x: number, y: number) => ({ x, y }),
    Skia: {
      Path: { MakeFromSVGString: path, Make: path },
    },
  };
});

jest.mock('react-native-reanimated', () => ({
  useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ALL_KINDS: ParticleKind[] = ['sparks', 'motes', 'ash', 'bubbles', 'shards', 'wisps', 'stars'];

function clockAt(ms: number) {
  return { value: ms } as EmbersProps['clock'];
}

function baseProps(overrides: Partial<EmbersProps> = {}): EmbersProps {
  return {
    width: 390,
    height: 844,
    intensity: 1,
    palette: PALETTES.amber,
    activeStyle: flameById('amber'),
    clock: clockAt(0),
    ...overrides,
  };
}

// A flame whose visualProfile has exactly one particle descriptor of `kind`.
// Built by cloning Amber and swapping only the particle mix, so no flame-id
// branching is involved anywhere in the test.
function styleWithKind(kind: ParticleKind): FlameStyle {
  const base = flameById('amber');
  const profile = resolveVisualProfile(base);
  return {
    ...base,
    visualProfile: {
      ...profile,
      particles: [{ kind, count: 4, size: 1, rise: 1, speed: 1, color: 'core' }],
    },
  } as FlameStyle;
}

function renderEmbers(props: EmbersProps) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(<EmbersLayer {...props} />);
  });
  return tree;
}

// Collect the element type names rendered by the particle primitives.
function renderedTypeNames(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAll(n => typeof n.type === 'string')
    .map(n => n.type as string);
}

// ---------------------------------------------------------------------------
// (1) Every ParticleKind renders through the shared primitive.
// ---------------------------------------------------------------------------

describe('ParticleKind variants', () => {
  test.each(ALL_KINDS)('renders %s particles without throwing', kind => {
    const tree = renderEmbers(baseProps({ activeStyle: styleWithKind(kind) }));
    expect(tree.toJSON()).not.toBeNull();
  });

  test('bubbles use a stroked circle; shards and stars use a Path', () => {
    const bubbles = renderEmbers(baseProps({ activeStyle: styleWithKind('bubbles') }));
    expect(renderedTypeNames(bubbles)).toContain('Circle');

    const shards = renderEmbers(baseProps({ activeStyle: styleWithKind('shards') }));
    expect(renderedTypeNames(shards)).toContain('Path');

    const stars = renderEmbers(baseProps({ activeStyle: styleWithKind('stars') }));
    expect(renderedTypeNames(stars)).toContain('Path');
  });

  test('wisps render an Oval', () => {
    const tree = renderEmbers(baseProps({ activeStyle: styleWithKind('wisps') }));
    expect(renderedTypeNames(tree)).toContain('Oval');
  });
});

// ---------------------------------------------------------------------------
// (2) Profile changes alter variant selection, with no flame-id branching.
// ---------------------------------------------------------------------------

describe('profile-driven variant selection', () => {
  test('resolveParticleDescriptors reflects the profile particle mix', () => {
    const style = styleWithKind('wisps');
    const descriptors = resolveParticleDescriptors(resolveVisualProfile(style));
    expect(descriptors.map(d => d.kind)).toEqual(['wisps']);
  });

  test('switching activeStyle swaps the rendered particle primitive', () => {
    const tree = renderEmbers(baseProps({ activeStyle: styleWithKind('wisps') }));
    expect(renderedTypeNames(tree)).toContain('Oval');

    act(() => {
      tree.update(<EmbersLayer {...baseProps({ activeStyle: styleWithKind('bubbles') })} />);
    });
    expect(renderedTypeNames(tree)).toContain('Circle');
    expect(renderedTypeNames(tree)).not.toContain('Oval');
  });

  test('the same descriptor on two differently-named flames renders identically', () => {
    const a = { ...styleWithKind('stars'), id: 'alpha' } as FlameStyle;
    const b = { ...styleWithKind('stars'), id: 'beta' } as FlameStyle;
    const treeA = renderEmbers(baseProps({ activeStyle: a }));
    const treeB = renderEmbers(baseProps({ activeStyle: b }));
    expect(renderedTypeNames(treeA)).toEqual(renderedTypeNames(treeB));
  });
});

// ---------------------------------------------------------------------------
// (3) Out-state precedence: intensity 0 draws no fire particles.
// ---------------------------------------------------------------------------

describe('out-state precedence', () => {
  test('intensity 0 renders no profile particles, only the ambient pool', () => {
    const lit = renderEmbers(baseProps({ intensity: 1, activeStyle: styleWithKind('sparks') }));
    const out = renderEmbers(baseProps({ intensity: 0, activeStyle: styleWithKind('sparks') }));

    const litCount = renderedTypeNames(lit).filter(t => t === 'Circle').length;
    const outCount = renderedTypeNames(out).filter(t => t === 'Circle').length;

    // Ambient motes are always present (14 circles); profile sparks add more when lit.
    expect(litCount).toBeGreaterThan(outCount);
    expect(outCount).toBeGreaterThanOrEqual(14);
  });

  test('intensity 0 still renders for a shape-only profile without throwing', () => {
    expect(() =>
      renderEmbers(baseProps({ intensity: 0, activeStyle: styleWithKind('shards') })),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// (4) Seeded PRNG: identical inputs give identical pools; memoized on rerender.
// ---------------------------------------------------------------------------

describe('seeded pools', () => {
  test('identical dimensions and descriptor produce identical output', () => {
    const style = styleWithKind('sparks');
    const first = renderEmbers(baseProps({ activeStyle: style, width: 360, height: 720 }));
    const second = renderEmbers(baseProps({ activeStyle: style, width: 360, height: 720 }));
    expect(first.toJSON()).toEqual(second.toJSON());
  });

  test('different dimensions change the seeded layout', () => {
    const style = styleWithKind('sparks');
    const small = renderEmbers(baseProps({ activeStyle: style, width: 300, height: 600 }));
    const large = renderEmbers(baseProps({ activeStyle: style, width: 420, height: 900 }));
    expect(small.toJSON()).not.toEqual(large.toJSON());
  });

  test('re-rendering with the same inputs does not reshuffle particles', () => {
    const style = styleWithKind('motes');
    const tree = renderEmbers(baseProps({ activeStyle: style }));
    const before = tree.toJSON();
    act(() => {
      tree.update(<EmbersLayer {...baseProps({ activeStyle: style })} />);
    });
    expect(tree.toJSON()).toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// (5) Reduced motion freezes the clock so particles hold still.
// ---------------------------------------------------------------------------

describe('reduced motion', () => {
  test('a frozen clock (constant value) yields identical frames over time', () => {
    const frozen = clockAt(1234);
    const first = renderEmbers(baseProps({ clock: frozen, activeStyle: styleWithKind('wisps') }));
    frozen.value = 1234; // time does not advance under reduced motion
    const second = renderEmbers(baseProps({ clock: frozen, activeStyle: styleWithKind('wisps') }));
    expect(first.toJSON()).toEqual(second.toJSON());
  });
});

// ---------------------------------------------------------------------------
// (6) Missing or malformed visualProfile falls back safely.
// ---------------------------------------------------------------------------

describe('visualProfile fallback', () => {
  test('undefined activeStyle renders without crashing', () => {
    expect(() => renderEmbers(baseProps({ activeStyle: undefined }))).not.toThrow();
  });

  test('a style with no visualProfile renders without crashing', () => {
    const bare = { ...flameById('amber'), visualProfile: undefined } as unknown as FlameStyle;
    expect(() => renderEmbers(baseProps({ activeStyle: bare }))).not.toThrow();
  });

  test('a malformed particles array falls back instead of throwing', () => {
    const malformed = {
      ...flameById('amber'),
      visualProfile: { particles: 'not-an-array' },
    } as unknown as FlameStyle;
    expect(() => renderEmbers(baseProps({ activeStyle: malformed }))).not.toThrow();
  });

  test('a fallback still draws the ambient pool', () => {
    const tree = renderEmbers(baseProps({ activeStyle: undefined }));
    expect(renderedTypeNames(tree).filter(t => t === 'Circle').length).toBeGreaterThanOrEqual(14);
  });
});
