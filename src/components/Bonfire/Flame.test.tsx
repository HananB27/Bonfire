/**
 * Flame.test.tsx — unit tests for the Flame hero component.
 *
 * Covers:
 *  1. Out-state precedence: no live flame / accents drawn when fire is 'out' or 'unlit'.
 *  2. Fallback to a safe Amber-like profile when activeStyle or its visualProfile is
 *     missing or malformed, without throwing.
 *  3. `dim` scales energy; default (1) leaves visuals unchanged.
 *  4. Suppressed / missing health resolves to neutral multipliers.
 *  5. Geometry / gradients are memoized on profile, palette, and dimension changes,
 *     and not re-created on unrelated re-renders.
 *
 * Skia and Reanimated are mocked so the test is deterministic and needs no GPU,
 * native modules, or network.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type { FireState } from '../../domain/fire';
import type { FlameStyle } from '../../domain/flames';
import type { Palette } from '../../theme/palettes';
import type { FireHealthState } from '../../domain/fireHealth';

// ---------------------------------------------------------------------------
// Mocks — must be declared before the component import.
// ---------------------------------------------------------------------------

const mockPathFactory = jest.fn(() => ({
  copy: () => ({ offset: () => ({}) }),
  computeTightBounds: () => ({ x: 0, y: 0, width: 10, height: 10 }),
}));

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const make = (name: string) =>
    function Mock(props: Record<string, unknown>) {
      return React.createElement(name, props, props.children);
    };
  const Skia = {
    Path: {
      MakeFromSVGString: jest.fn(() => ({
        copy: () => ({ offset: () => ({}) }),
        computeTightBounds: () => ({ x: 0, y: 0, width: 10, height: 10 }),
      })),
      Make: jest.fn(() => ({})),
    },
    Color: jest.fn((c: string) => c),
    Paint: jest.fn(() => ({
      setAntiAlias: jest.fn(),
      setStyle: jest.fn(),
      setShader: jest.fn(),
      setImageFilter: jest.fn(),
    })),
    Point: jest.fn((x: number, y: number) => ({ x, y })),
    Shader: { MakeLinearGradient: jest.fn(() => ({})) },
    ImageFilter: { MakeBlur: jest.fn(() => ({})) },
    Surface: { Make: jest.fn(() => null) },
  };
  return {
    Canvas: make('Canvas'),
    Image: make('Image'),
    Group: make('Group'),
    Path: make('Path'),
    Skia,
    LinearGradient: make('LinearGradient'),
    RadialGradient: make('RadialGradient'),
    Blur: make('Blur'),
    Paint: make('Paint'),
    ColorMatrix: make('ColorMatrix'),
    Circle: make('Circle'),
    Oval: make('Oval'),
    Rect: make('Rect'),
    PaintStyle: { Fill: 0, Stroke: 1 },
    TileMode: { Clamp: 0, Decal: 1, Repeat: 2, Mirror: 3 },
    rect: (x: number, y: number, w: number, h: number) => ({ x, y, width: w, height: h }),
    vec: (x: number, y: number) => ({ x, y }),
  };
});

jest.mock('react-native-reanimated', () => ({
  useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
  useSharedValue: (v: unknown) => ({ value: v }),
  useAnimatedReaction: jest.fn(),
  withSequence: (...args: unknown[]) => args[0],
  withSpring: (v: unknown) => v,
  withTiming: (v: unknown) => v,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const AMBER_PALETTE: Palette = {
  ember: '#7a2a0a',
  red: '#c0392b',
  amber: '#f39c12',
  gold: '#f1c40f',
  core: '#fff7d6',
  glow: '#ffb347',
} as unknown as Palette;

const CRIMSON_PALETTE: Palette = {
  ember: '#4a0010',
  red: '#8b0000',
  amber: '#dc143c',
  gold: '#ff6b6b',
  core: '#ffe4e1',
  glow: '#ff3366',
} as unknown as Palette;

function fireState(state: FireState['state'], strength = 10): FireState {
  return { state, strength } as FireState;
}

function makeStyle(overrides: Partial<FlameStyle> = {}): FlameStyle {
  return {
    id: 'amber',
    name: 'Amber',
    rarity: 'common',
    palette: AMBER_PALETTE,
    visualProfile: {
      shape: 'classic',
      motion: { family: 'smooth', speed: 1 },
      aura: { kind: 'oval', dim: false },
      accents: [],
      footprint: 1,
      coreScale: 1,
      invertCore: false,
    },
    ...overrides,
  } as unknown as FlameStyle;
}

const CLOCK = { value: 0 } as never;

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    fire: fireState('lit'),
    activeStyle: makeStyle(),
    palette: AMBER_PALETTE,
    width: 320,
    height: 480,
    clock: CLOCK,
    ...overrides,
  };
}

// Lazy-load the component after mocks are registered.
function loadFlame() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('./Flame').Flame as React.ComponentType<Record<string, unknown>>;
}

function render(props: Record<string, unknown>) {
  const Flame = loadFlame();
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<Flame {...(props as never)} />);
  });
  return tree;
}

afterEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// 1. Out-state precedence
// ---------------------------------------------------------------------------

describe('Flame out-state precedence', () => {
  it.each(['out', 'unlit'] as const)(
    'draws no live flame or accents when fire is %s',
    state => {
      const style = makeStyle({
        visualProfile: {
          ...makeStyle().visualProfile,
          accents: ['shockPulse', 'orbitRing'],
        },
      } as Partial<FlameStyle>);
      const tree = render(baseProps({ fire: fireState(state), activeStyle: style }));
      const json = JSON.stringify(tree.toJSON());
      expect(json).not.toMatch(/shockPulse|orbitRing/);
      tree.unmount();
    },
  );

  it('does not throw when fire is lit', () => {
    expect(() => {
      const tree = render(baseProps());
      tree.unmount();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 2. Fallback to safe Amber-like profile
// ---------------------------------------------------------------------------

describe('Flame profile fallback', () => {
  it('renders without activeStyle', () => {
    expect(() => {
      const tree = render(baseProps({ activeStyle: undefined }));
      tree.unmount();
    }).not.toThrow();
  });

  it('renders when visualProfile is missing', () => {
    const style = makeStyle({ visualProfile: undefined } as Partial<FlameStyle>);
    expect(() => {
      const tree = render(baseProps({ activeStyle: style }));
      tree.unmount();
    }).not.toThrow();
  });

  it('renders when visualProfile is malformed', () => {
    const style = makeStyle({
      visualProfile: { shape: 42, motion: 'bogus', accents: 'nope' },
    } as unknown as Partial<FlameStyle>);
    expect(() => {
      const tree = render(baseProps({ activeStyle: style }));
      tree.unmount();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 3. dim scales energy; default is full energy
// ---------------------------------------------------------------------------

describe('Flame dim prop', () => {
  it('defaults to full energy: no visual change when dim is omitted', () => {
    const omitted = render(baseProps());
    const explicit = render(baseProps({ dim: 1 }));
    expect(JSON.stringify(omitted.toJSON())).toEqual(JSON.stringify(explicit.toJSON()));
    omitted.unmount();
    explicit.unmount();
  });

  it('reduced dim changes the rendered output (embered look)', () => {
    const full = render(baseProps({ dim: 1 }));
    const dimmed = render(baseProps({ dim: 0.3 }));
    expect(JSON.stringify(full.toJSON())).not.toEqual(JSON.stringify(dimmed.toJSON()));
    full.unmount();
    dimmed.unmount();
  });
});

// ---------------------------------------------------------------------------
// 4. Health suppressed / missing resolves to neutral
// ---------------------------------------------------------------------------

describe('Flame health visuals', () => {
  it('missing health matches an explicit neutral health state', () => {
    const missing = render(baseProps());
    const neutral = render(
      baseProps({
        health: { suppressed: true } as unknown as FireHealthState,
      }),
    );
    expect(JSON.stringify(missing.toJSON())).toEqual(JSON.stringify(neutral.toJSON()));
    missing.unmount();
    neutral.unmount();
  });

  it('suppressed health on an out fire does not throw', () => {
    expect(() => {
      const tree = render(
        baseProps({
          fire: fireState('out'),
          health: { suppressed: true } as unknown as FireHealthState,
        }),
      );
      tree.unmount();
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 5. Memoization of geometry / gradients
// ---------------------------------------------------------------------------

describe('Flame memoization', () => {
  it('does not recreate gradients on unrelated re-render', () => {
    const { Skia } = require('@shopify/react-native-skia');
    const Flame = loadFlame();
    const props = baseProps();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Flame {...(props as never)} />);
    });
    const callsAfterMount = Skia.Shader.MakeLinearGradient.mock.calls.length;

    ReactTestRenderer.act(() => {
      tree.update(<Flame {...(props as never)} />);
    });
    expect(Skia.Shader.MakeLinearGradient.mock.calls.length).toBe(callsAfterMount);
    tree.unmount();
  });

  it('recomputes geometry when palette changes', () => {
    const { Skia } = require('@shopify/react-native-skia');
    const Flame = loadFlame();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Flame {...(baseProps() as never)} />);
    });
    const before = Skia.Path.MakeFromSVGString.mock.calls.length;

    ReactTestRenderer.act(() => {
      tree.update(<Flame {...(baseProps({ palette: CRIMSON_PALETTE }) as never)} />);
    });
    expect(Skia.Path.MakeFromSVGString.mock.calls.length).toBeGreaterThan(before);
    tree.unmount();
  });

  it('recomputes geometry when dimensions change', () => {
    const { Skia } = require('@shopify/react-native-skia');
    const Flame = loadFlame();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<Flame {...(baseProps() as never)} />);
    });
    const before = Skia.Path.MakeFromSVGString.mock.calls.length;

    ReactTestRenderer.act(() => {
      tree.update(<Flame {...(baseProps({ width: 400, height: 600 }) as never)} />);
    });
    expect(Skia.Path.MakeFromSVGString.mock.calls.length).toBeGreaterThan(before);
    tree.unmount();
  });
});
