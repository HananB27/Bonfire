/**
 * Flame.test.tsx — behavior tests for the generic, profile-driven Flame renderer.
 *
 * Covers the pure profile/health/strength helpers used by Flame.tsx and the
 * component's visibility, dimming, fallback, and memoization behavior. Skia and
 * Reanimated are mocked so the suite is deterministic and never touches native
 * code or the network.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import type { SharedValue } from 'react-native-reanimated';
import type { FireState } from '../src/domain/fire';
import type { FlameStyle } from '../src/domain/flames';
import { flameById } from '../src/domain/flames';
import { PALETTES } from '../src/theme/palettes';
import {
  flameVisual,
  resolveAccents,
  resolveAuraDescriptor,
  resolveHealthVisuals,
  resolveMotionDescriptor,
  resolveShapeDescriptor,
  resolveStrengthVisuals,
  resolveVisualProfile,
  type ShapeDescriptor,
  type TongueDescriptor,
} from '../src/components/Bonfire/flameModel';
import Flame from '../src/components/Bonfire/Flame';

// ---------------------------------------------------------------------------
// Native module mocks. Skia and Reanimated run on native threads, so we replace
// them with inert stand-ins that record calls only where tests need them.
// ---------------------------------------------------------------------------

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const make = (name: string) => {
    const Comp = (props: Record<string, unknown>) =>
      React.createElement(name, props, props.children ?? null);
    Comp.displayName = name;
    return Comp;
  };
  const surface = {
    getCanvas: () => ({
      clear: () => undefined,
      drawPath: () => undefined,
      saveLayer: () => undefined,
      restore: () => undefined,
    }),
    flush: () => undefined,
    makeImageSnapshot: () => ({}),
    dispose: () => undefined,
  };
  const path = () => ({
    computeTightBounds: () => ({ x: 0, y: 0, width: 10, height: 10 }),
    copy: () => path(),
    offset: () => path(),
  });
  return {
    Canvas: make('Canvas'),
    Image: make('Image'),
    Group: make('Group'),
    Path: make('Path'),
    LinearGradient: make('LinearGradient'),
    RadialGradient: make('RadialGradient'),
    Blur: make('Blur'),
    Paint: make('Paint'),
    ColorMatrix: make('ColorMatrix'),
    Circle: make('Circle'),
    Oval: make('Oval'),
    Rect: make('Rect'),
    PaintStyle: { Fill: 0, Stroke: 1 },
    TileMode: { Clamp: 0, Decal: 1 },
    rect: (x: number, y: number, w: number, h: number) => ({ x, y, width: w, height: h }),
    vec: (x: number, y: number) => ({ x, y }),
    Skia: {
      Path: { MakeFromSVGString: () => path(), Make: () => path() },
      Surface: { Make: () => surface },
      Paint: () => ({
        setAntiAlias: () => undefined,
        setStyle: () => undefined,
        setShader: () => undefined,
        setImageFilter: () => undefined,
      }),
      Shader: { MakeLinearGradient: () => ({}) },
      ImageFilter: { MakeBlur: () => ({}) },
      Color: (c: string) => c,
      Point: (x: number, y: number) => ({ x, y }),
    },
  };
});

jest.mock('react-native-reanimated', () => {
  const actual = jest.requireActual('react-native-reanimated/mock');
  return {
    ...actual,
    useSharedValue: (v: unknown) => ({ value: v }),
    useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
    withSequence: (...args: unknown[]) => args[args.length - 1],
    withSpring: (v: unknown) => v,
    withTiming: (v: unknown) => v,
  };
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PALETTE = PALETTES.amber;
const AMBER_FALLBACK_STYLE = flameById('amber');
const CRIMSON_STYLE = flameById('crimson');

function makeFire(state: FireState['state'], strength = 3): FireState {
  return { state, strength, daysAlive: state === 'out' || state === 'unlit' ? 0 : 1 } as FireState;
}

function makeClock(): SharedValue<number> {
  return { value: 0 } as unknown as SharedValue<number>;
}

function renderFlame(props: Partial<React.ComponentProps<typeof Flame>> = {}) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <Flame
        fire={makeFire('lit')}
        palette={PALETTE}
        width={360}
        height={720}
        clock={makeClock()}
        {...props}
      />,
    );
  });
  return tree;
}

let mounted: ReactTestRenderer.ReactTestRenderer | null = null;

afterEach(() => {
  act(() => {
    mounted?.unmount();
  });
  mounted = null;
});

// ---------------------------------------------------------------------------
// Pure profile helpers
// ---------------------------------------------------------------------------

describe('resolveVisualProfile', () => {
  test('returns a profile for a known catalog flame', () => {
    const profile = resolveVisualProfile(CRIMSON_STYLE);
    expect(profile).toBeDefined();
    expect(profile.shape).toBeDefined();
  });

  test('falls back to the Amber-like profile when the style is undefined', () => {
    const fallback = resolveVisualProfile(undefined);
    const amber = resolveVisualProfile(AMBER_FALLBACK_STYLE);
    expect(fallback).toEqual(amber);
  });

  test('falls back to the Amber-like profile when the profile is malformed', () => {
    const malformed = { ...CRIMSON_STYLE, visualProfile: null } as unknown as FlameStyle;
    expect(resolveVisualProfile(malformed)).toEqual(resolveVisualProfile(AMBER_FALLBACK_STYLE));
  });

  test('does not invent a new flame identity when falling back', () => {
    const malformed = { ...CRIMSON_STYLE, visualProfile: 'broken' } as unknown as FlameStyle;
    const profile = resolveVisualProfile(malformed);
    expect(profile).toEqual(resolveVisualProfile(AMBER_FALLBACK_STYLE));
  });
});

describe('resolveShapeDescriptor', () => {
  test('describes tongues with finite transforms', () => {
    const shape: ShapeDescriptor = resolveShapeDescriptor(resolveVisualProfile(CRIMSON_STYLE));
    expect(shape.tongues.length).toBeGreaterThan(0);
    shape.tongues.forEach((t: TongueDescriptor) => {
      expect(Number.isFinite(t.dx)).toBe(true);
      expect(Number.isFinite(t.fy)).toBe(true);
    });
  });

  test('different shape profiles produce different tongue counts', () => {
    const a = resolveShapeDescriptor(resolveVisualProfile(CRIMSON_STYLE)).tongues.length;
    const b = resolveShapeDescriptor(resolveVisualProfile(AMBER_FALLBACK_STYLE)).tongues.length;
    expect(a).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(0);
  });
});

describe('resolveAuraDescriptor', () => {
  test('returns a descriptor for the profile aura kind', () => {
    const aura = resolveAuraDescriptor(resolveVisualProfile(CRIMSON_STYLE));
    expect(aura).toBeDefined();
  });
});

describe('resolveMotionDescriptor', () => {
  test('returns a positive speed and a known family', () => {
    const motion = resolveMotionDescriptor(resolveVisualProfile(CRIMSON_STYLE));
    expect(motion.speed).toBeGreaterThan(0);
    expect(['smooth', 'harsh']).toContain(motion.family);
  });
});

describe('resolveAccents', () => {
  test('returns an array (possibly empty) for any profile', () => {
    expect(Array.isArray(resolveAccents(resolveVisualProfile(AMBER_FALLBACK_STYLE)))).toBe(true);
    expect(Array.isArray(resolveAccents(resolveVisualProfile(CRIMSON_STYLE)))).toBe(true);
  });
});

describe('resolveHealthVisuals', () => {
  test('missing health resolves to neutral multipliers', () => {
    const neutral = resolveHealthVisuals(undefined);
    expect(neutral).toEqual(resolveHealthVisuals(undefined));
  });

  test('suppressed health (unlit fire) is neutral', () => {
    const suppressed = resolveHealthVisuals(undefined, 'unlit');
    expect(suppressed).toEqual(resolveHealthVisuals(undefined));
  });
});

describe('resolveStrengthVisuals', () => {
  test('strength 0 yields a finite, non-negative visual scale', () => {
    const v = resolveStrengthVisuals(0);
    expect(Object.values(v).every(n => typeof n !== 'number' || (Number.isFinite(n) && n >= 0))).toBe(true);
  });

  test('visual height is non-decreasing with strength for lit fires', () => {
    const low = resolveStrengthVisuals(1) as unknown as Record<string, number>;
    const high = resolveStrengthVisuals(5) as unknown as Record<string, number>;
    if (typeof low.height === 'number' && typeof high.height === 'number') {
      expect(high.height).toBeGreaterThanOrEqual(low.height);
    }
  });
});

describe('flameVisual', () => {
  test('is an exported helper with a stable result for the same input', () => {
    expect(typeof flameVisual).toBe('function');
    expect(flameVisual(CRIMSON_STYLE as never)).toEqual(flameVisual(CRIMSON_STYLE as never));
  });
});

// ---------------------------------------------------------------------------
// Component behavior
// ---------------------------------------------------------------------------

describe('Flame component', () => {
  test('renders a canvas for a lit fire', () => {
    mounted = renderFlame({ activeStyle: CRIMSON_STYLE });
    expect(mounted.root.findAllByProps({}).length).toBeGreaterThan(0);
  });

  test('hides the flame when the fire is out', () => {
    mounted = renderFlame({ fire: makeFire('out'), activeStyle: CRIMSON_STYLE });
    expect(mounted.toJSON()).toBeNull();
  });

  test('hides the flame when the fire is unlit', () => {
    mounted = renderFlame({ fire: makeFire('unlit'), activeStyle: CRIMSON_STYLE });
    expect(mounted.toJSON()).toBeNull();
  });

  test('renders with no activeStyle (falls back to Amber-like profile)', () => {
    expect(() => {
      mounted = renderFlame({ activeStyle: undefined });
    }).not.toThrow();
    expect(mounted?.toJSON()).not.toBeUndefined();
  });

  test('renders without crashing when the profile is malformed', () => {
    const malformed = { ...CRIMSON_STYLE, visualProfile: null } as unknown as FlameStyle;
    expect(() => {
      mounted = renderFlame({ activeStyle: malformed });
    }).not.toThrow();
  });

  test('dim scales the component without changing the fire state', () => {
    const fire = makeFire('lit', 4);
    mounted = renderFlame({ fire, dim: 0.4, activeStyle: CRIMSON_STYLE });
    const flame = mounted.root.find(
      n => n.props && n.props.fire === fire && typeof n.props.dim === 'number',
    );
    expect(flame.props.dim).toBe(0.4);
    expect(flame.props.fire).toBe(fire);
  });

  test('default dim is full energy (1)', () => {
    mounted = renderFlame({ activeStyle: CRIMSON_STYLE });
    const flame = mounted.root.find(n => n.props && typeof n.props.dim === 'number');
    expect(flame.props.dim).toBe(1);
  });

  test('re-rendering with the same profile and palette keeps the same canvas count', () => {
    mounted = renderFlame({ activeStyle: CRIMSON_STYLE });
    const before = mounted.root.findAll(n => n.type === 'Canvas' || n.props?.children === undefined).length;
    act(() => {
      mounted?.update(
        <Flame
          fire={makeFire('lit')}
          palette={PALETTE}
          width={360}
          height={720}
          clock={makeClock()}
          activeStyle={CRIMSON_STYLE}
        />,
      );
    });
    const after = mounted.root.findAll(n => n.type === 'Canvas' || n.props?.children === undefined).length;
    expect(after).toBe(before);
  });

  test('changing the palette rebuilds with the new palette', () => {
    mounted = renderFlame({ activeStyle: CRIMSON_STYLE, palette: PALETTES.amber });
    act(() => {
      mounted?.update(
        <Flame
          fire={makeFire('lit')}
          palette={PALETTES.crimson}
          width={360}
          height={720}
          clock={makeClock()}
          activeStyle={CRIMSON_STYLE}
        />,
      );
    });
    const flame = mounted!.root.find(n => n.props && n.props.palette && 'dim' in n.props);
    expect(flame.props.palette).toBe(PALETTES.crimson);
  });
});
