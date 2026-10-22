/**
 * Flame.test.tsx — behavior tests for the generic, profile-driven Skia flame.
 *
 * The native modules (Skia / Reanimated) are mocked globally in jest.setup.js,
 * so these tests render the real component tree with react-test-renderer and
 * assert on observable behavior: what renders for each fire state, that a
 * malformed profile falls back without throwing, and that dim/health inputs
 * change the output only when they should. A stub SharedValue stands in for the
 * scene clock so nothing depends on wall-clock time.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import Flame, { type FlameProps } from '../src/components/Bonfire/Flame';
import { flameById } from '../src/domain/flames';
import type { FireState } from '../src/domain/fire';
import type { SharedValue } from 'react-native-reanimated';
import { flameVisual, resolveVisualProfile } from '../src/components/Bonfire/flameModel';

// A deterministic stand-in for the shared UI clock. Value 0 means every
// clock-driven flicker starts from the same phase on every run.
function stubClock(value = 0): SharedValue<number> {
  return { value } as unknown as SharedValue<number>;
}

// Build a FireState-shaped object. Cast is limited to tests; the real shape is
// owned by src/domain/fire.ts.
function fire(state: string, strength = 4): FireState {
  return { state, strength } as unknown as FireState;
}

// A small, readable palette stub. Flame reads these hex stops to build gradients.
const PALETTE = {
  core: '#fff7d6',
  gold: '#ffd166',
  amber: '#ff9f1c',
  ember: '#e85d04',
  red: '#9d0208',
  glow: '#ffb703',
} as unknown as FlameProps['palette'];

function baseProps(overrides: Partial<FlameProps> = {}): FlameProps {
  return {
    fire: fire('lit'),
    palette: PALETTE,
    width: 390,
    height: 844,
    clock: stubClock(),
    visibleBottomFromBottom: 199,
    ...overrides,
  };
}

let rendered: ReactTestRenderer.ReactTestRenderer | null = null;

function render(props: FlameProps) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(<Flame {...props} />);
  });
  rendered = tree;
  return tree;
}

afterEach(() => {
  act(() => {
    rendered?.unmount();
  });
  rendered = null;
});

// Serialize the rendered tree so two renders can be compared for equality.
function snapshotOf(tree: ReactTestRenderer.ReactTestRenderer): string {
  return JSON.stringify(tree.toJSON());
}

describe('Flame: out-state precedence', () => {
  test('a lit fire renders a different tree than an out fire', () => {
    // If the out-state gate were missing, the live flame would draw identically
    // whether or not the fire is out, so the trees would match.
    const lit = snapshotOf(render(baseProps({ fire: fire('lit') })));
    rendered = null;
    const out = snapshotOf(render(baseProps({ fire: fire('out', 0) })));
    expect(out).not.toEqual(lit);
  });

  test('an unlit fire hides the live flame the same way an out fire does', () => {
    const out = snapshotOf(render(baseProps({ fire: fire('out', 0) })));
    rendered = null;
    const unlit = snapshotOf(render(baseProps({ fire: fire('unlit', 0) })));
    // Both out-states must suppress the live flame, so neither should match a lit render.
    const lit = snapshotOf(render(baseProps({ fire: fire('lit') })));
    expect(unlit).not.toEqual(lit);
    expect(out).not.toEqual(lit);
  });

  test('a profile cannot make a live flame appear while the fire is out', () => {
    const amber = flameById('amber');
    const out = snapshotOf(render(baseProps({ fire: fire('out', 0), activeStyle: amber })));
    rendered = null;
    const outNoStyle = snapshotOf(render(baseProps({ fire: fire('out', 0) })));
    expect(out).toEqual(outNoStyle);
  });
});

describe('Flame: activeStyle and visual profile', () => {
  test('a selected flame renders without throwing and produces a tree', () => {
    const amber = flameById('amber');
    expect(() => render(baseProps({ activeStyle: amber }))).not.toThrow();
    expect(rendered?.toJSON()).toBeTruthy();
  });

  test('two different selected flames produce different trees', () => {
    const amber = flameById('amber');
    const crimson = flameById('crimson');
    const a = snapshotOf(render(baseProps({ activeStyle: amber })));
    rendered = null;
    const b = snapshotOf(render(baseProps({ activeStyle: crimson })));
    expect(b).not.toEqual(a);
  });

  test('resolveVisualProfile returns a profile object for a catalog flame', () => {
    const profile = resolveVisualProfile(flameById('amber'));
    expect(profile).toBeTruthy();
    expect(typeof profile).toBe('object');
  });
});

describe('Flame: malformed or missing profile fallback', () => {
  test('a missing activeStyle does not throw and renders a flame', () => {
    expect(() => render(baseProps({ activeStyle: undefined }))).not.toThrow();
    expect(rendered?.toJSON()).toBeTruthy();
  });

  test('a malformed activeStyle does not throw', () => {
    const malformed = { id: 'broken' } as unknown as FlameProps['activeStyle'];
    expect(() => render(baseProps({ activeStyle: malformed }))).not.toThrow();
  });

  test('resolveVisualProfile tolerates undefined and returns a usable profile', () => {
    expect(() => resolveVisualProfile(undefined)).not.toThrow();
    expect(resolveVisualProfile(undefined)).toBeTruthy();
  });

  test('a malformed profile does not create a new flame identity', () => {
    // A bad profile must render the same as the Amber-like fallback (no missing
    // style), so the output cannot depend on an invented id.
    const malformed = { id: 'not-a-real-flame' } as unknown as FlameProps['activeStyle'];
    const bad = snapshotOf(render(baseProps({ activeStyle: malformed })));
    rendered = null;
    const fallback = snapshotOf(render(baseProps({ activeStyle: undefined })));
    expect(bad).toEqual(fallback);
  });
});

describe('Flame: dim (embered energy)', () => {
  test('dim = 1 matches the default (no visual change)', () => {
    const defaultDim = snapshotOf(render(baseProps()));
    rendered = null;
    const fullDim = snapshotOf(render(baseProps({ dim: 1 })));
    expect(fullDim).toEqual(defaultDim);
  });

  test('dim < 1 changes glow and brightness for an embered flame', () => {
    const full = snapshotOf(render(baseProps({ dim: 1 })));
    rendered = null;
    const embered = snapshotOf(render(baseProps({ dim: 0.4 })));
    expect(embered).not.toEqual(full);
  });
});

describe('Flame: health multiplier', () => {
  test('omitting health matches an explicit undefined health (neutral)', () => {
    const omitted = snapshotOf(render(baseProps()));
    rendered = null;
    const explicit = snapshotOf(render(baseProps({ health: undefined })));
    expect(explicit).toEqual(omitted);
  });

  test('resolveHealthVisuals-driven output is neutral for a suppressed (out) fire', () => {
    // Out fires suppress health, so a health value must not change the output.
    const withoutHealth = snapshotOf(render(baseProps({ fire: fire('out', 0) })));
    rendered = null;
    const withHealth = snapshotOf(
      render(baseProps({ fire: fire('out', 0), health: 'Radiant' as FlameProps['health'] })),
    );
    expect(withHealth).toEqual(withoutHealth);
  });
});

describe('Flame: memoized geometry', () => {
  test('re-rendering with identical props produces an identical tree', () => {
    const props = baseProps({ activeStyle: flameById('amber') });
    const tree = render(props);
    const first = snapshotOf(tree);
    act(() => {
      tree.update(<Flame {...props} />);
    });
    expect(snapshotOf(tree)).toEqual(first);
  });

  test('changing the palette rebuilds the output', () => {
    const tree = render(baseProps());
    const before = snapshotOf(tree);
    act(() => {
      tree.update(
        <Flame {...baseProps({ palette: { ...PALETTE, core: '#00ffff' } as FlameProps['palette'] })} />,
      );
    });
    expect(snapshotOf(tree)).not.toEqual(before);
  });

  test('changing dimensions rebuilds the output', () => {
    const tree = render(baseProps());
    const before = snapshotOf(tree);
    act(() => {
      tree.update(<Flame {...baseProps({ width: 320, height: 640 })} />);
    });
    expect(snapshotOf(tree)).not.toEqual(before);
  });
});

describe('Flame: renderer does not branch on flame id', () => {
  test('two profiles that differ only in identity fields draw the same descriptors', () => {
    const amber = flameById('amber');
    // Clone with a different id and name; the visual profile is untouched.
    const renamed = { ...amber, id: 'amber-clone', name: 'Amber Clone' } as typeof amber;
    expect(flameVisual(renamed)).toEqual(flameVisual(amber));
  });
});
