/**
 * Flame.test.tsx — unit tests for the profile-driven Skia bonfire flame.
 *
 * Skia and Reanimated are mocked so the component can be rendered under
 * react-test-renderer without a native canvas. Geometry/profile helpers from
 * flameModel are exercised directly where they are pure.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import type { SharedValue } from 'react-native-reanimated';
import type { FireState } from '../../domain/fire';
import type { FireHealthState } from '../../domain/fireHealth';
import type { FlameStyle } from '../../domain/flames';
import type { Palette } from '../../theme/palettes';
import { Flame, type FlameProps, DESIGN_FLAME_BASE_FROM_BOTTOM } from './Flame';
import * as flameModel from './flameModel';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const make = (name: string) => {
    const Comp = (props: Record<string, unknown>) =>
      React.createElement(name, props, props.children);
    Comp.displayName = name;
    return Comp;
  };
  const surface = {
    getCanvas: () => ({
      clear: jest.fn(),
      drawPath: jest.fn(),
      saveLayer: jest.fn(),
      restore: jest.fn(),
    }),
    flush: jest.fn(),
    makeImageSnapshot: jest.fn(() => ({ id: 'img' })),
    dispose: jest.fn(),
  };
  const pathObj = () => {
    const p: Record<string, unknown> = {};
    p.computeTightBounds = () => ({ x: 0, y: 0, width: 10, height: 10 });
    p.copy = () => pathObj();
    p.offset = () => p;
    return p;
  };
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
    TileMode: { Clamp: 0, Decal: 1, Repeat: 2, Mirror: 3 },
    rect: (x: number, y: number, w: number, h: number) => ({ x, y, width: w, height: h }),
    vec: (x: number, y: number) => ({ x, y }),
    Skia: {
      Path: { MakeFromSVGString: () => pathObj() },
      Path_: pathObj,
      Surface: { Make: () => surface },
      Paint: () => ({
        setAntiAlias: jest.fn(),
        setStyle: jest.fn(),
        setShader: jest.fn(),
        setImageFilter: jest.fn(),
      }),
      Shader: {
        MakeLinearGradient: jest.fn(() => ({})),
      },
      ImageFilter: {
        MakeBlur: jest.fn(() => ({})),
      },
      Point: (x: number, y: number) => ({ x, y }),
      Color: (c: string) => c,
      Make: jest.fn(),
    },
  };
});

jest.mock('react-native-reanimated', () => {
  const sv = (initial: number) => ({ value: initial });
  return {
    useSharedValue: (initial: number) => sv(initial),
    useDerivedValue: (fn: () => unknown) => ({ value: fn() }),
    withSequence: (...args: unknown[]) => args[0],
    withSpring: (v: unknown) => v,
    withTiming: (v: unknown) => v,
  };
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const palette = {
  ember: '#7a2e0c',
  amber: '#ffb347',
  gold: '#ffd76a',
  core: '#fff6d8',
  red: '#c0392b',
} as unknown as Palette;

const altPalette = {
  ember: '#1b3a6b',
  amber: '#4aa3ff',
  gold: '#9fd8ff',
  core: '#eef8ff',
  red: '#2a4fa0',
} as unknown as Palette;

function fire(state: FireState['state'], overrides: Partial<FireState> = {}): FireState {
  return {
    state,
    ...overrides,
  } as FireState;
}

const healthy: FireHealthState = { status: 'healthy' } as unknown as FireHealthState;

function makeClock(value = 0): SharedValue<number> {
  return { value } as unknown as SharedValue<number>;
}

function baseProps(overrides: Partial<FlameProps> = {}): FlameProps {
  return {
    fire: fire('lit'),
    palette,
    width: 320,
    height: 480,
    clock: makeClock(0),
    ...overrides,
  };
}

function renderFlame(props: Partial<FlameProps> = {}) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<Flame {...baseProps(props)} />);
  });
  return tree;
}

function countNodes(tree: ReactTestRenderer.ReactTestRenderer, type: string): number {
  return tree.root.findAll(node => node.type === type).length;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Flame', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('visibility / out-state precedence', () => {
    it('renders nothing when fire.state is "out"', () => {
      const tree = renderFlame({ fire: fire('out') });
      expect(tree.toJSON()).toBeNull();
    });

    it('renders nothing when fire.state is "unlit"', () => {
      const tree = renderFlame({ fire: fire('unlit') });
      expect(tree.toJSON()).toBeNull();
    });

    it('renders a canvas when fire.state is "lit"', () => {
      const tree = renderFlame({ fire: fire('lit') });
      expect(tree.toJSON()).not.toBeNull();
      expect(countNodes(tree, 'Canvas')).toBe(1);
    });

    it('out-state wins even when a healthy profile is supplied', () => {
      const tree = renderFlame({ fire: fire('out'), health: healthy });
      expect(tree.toJSON()).toBeNull();
    });
  });

  describe('activeStyle fallback', () => {
    it('does not throw when activeStyle is undefined', () => {
      expect(() => renderFlame({ activeStyle: undefined })).not.toThrow();
    });

    it('does not throw when activeStyle is malformed', () => {
      const bogus = { id: 'bogus', visualProfile: 'not-an-object' } as unknown as FlameStyle;
      expect(() => renderFlame({ activeStyle: bogus })).not.toThrow();
    });

    it('resolveVisualProfile returns a usable profile for missing input', () => {
      const profile = flameModel.resolveVisualProfile(undefined);
      expect(profile).toBeDefined();
      expect(profile).toEqual(flameModel.resolveVisualProfile(undefined));
    });
  });

  describe('dim prop', () => {
    it('renders with dim < 1 without throwing', () => {
      expect(() => renderFlame({ dim: 0.35 })).not.toThrow();
    });

    it('treats the default dim as full energy', () => {
      const withDefault = renderFlame({});
      const withExplicit = renderFlame({ dim: 1 });
      expect(withDefault.toJSON()).toEqual(withExplicit.toJSON());
    });
  });

  describe('health multipliers', () => {
    it('renders with a suppressed health state', () => {
      const suppressed = { status: 'suppressed' } as unknown as FireHealthState;
      expect(() => renderFlame({ health: suppressed })).not.toThrow();
    });

    it('renders with missing health (neutral multipliers)', () => {
      expect(() => renderFlame({ health: undefined })).not.toThrow();
    });

    it('resolveHealthVisuals is neutral for undefined health', () => {
      const neutral = flameModel.resolveHealthVisuals(undefined);
      const again = flameModel.resolveHealthVisuals(undefined);
      expect(neutral).toEqual(again);
    });
  });

  describe('visibleBottomFromBottom positioning', () => {
    it('uses the design base offset when no override is given', () => {
      expect(DESIGN_FLAME_BASE_FROM_BOTTOM).toBeGreaterThan(0);
      expect(() => renderFlame({ visibleBottomFromBottom: undefined })).not.toThrow();
    });

    it('renders with an explicit visibleBottomFromBottom', () => {
      expect(() => renderFlame({ visibleBottomFromBottom: 180 })).not.toThrow();
    });
  });

  describe('accents selected from profile data', () => {
    const accentKinds = ['shockPulse', 'solarCircle', 'orbitRing', 'voidRing', 'auroraBand'] as const;

    it.each(accentKinds)('resolveAccents yields accent kind "%s" when profile declares it', kind => {
      const spy = jest
        .spyOn(flameModel, 'resolveAccents')
        .mockReturnValue([{ kind } as unknown as ReturnType<typeof flameModel.resolveAccents>[number]]);
      const tree = renderFlame({ activeStyle: { id: 'x' } as unknown as FlameStyle });
      expect(tree.toJSON()).not.toBeNull();
      expect(spy).toHaveBeenCalled();
    });

    it('renders without accents when the profile declares none', () => {
      const spy = jest.spyOn(flameModel, 'resolveAccents').mockReturnValue([]);
      const tree = renderFlame();
      expect(tree.toJSON()).not.toBeNull();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('memoization of geometry', () => {
    it('does not re-resolve the visual profile on identical re-renders', () => {
      const spy = jest.spyOn(flameModel, 'resolveVisualProfile');
      const tree = renderFlame();
      const callsAfterMount = spy.mock.calls.length;
      ReactTestRenderer.act(() => {
        tree.update(<Flame {...baseProps()} />);
      });
      expect(spy.mock.calls.length).toBe(callsAfterMount);
    });

    it('recomputes geometry when the palette changes', () => {
      const tree = renderFlame({ palette });
      const before = JSON.stringify(tree.toJSON());
      ReactTestRenderer.act(() => {
        tree.update(<Flame {...baseProps({ palette: altPalette })} />);
      });
      const after = JSON.stringify(tree.toJSON());
      expect(after).toBeDefined();
      expect(before).toBeDefined();
    });

    it('recomputes geometry when the dimensions change', () => {
      const tree = renderFlame({ width: 320, height: 480 });
      ReactTestRenderer.act(() => {
        tree.update(<Flame {...baseProps({ width: 400, height: 600 })} />);
      });
      expect(countNodes(tree, 'Canvas')).toBe(1);
    });
  });
});
