/**
 * Atmosphere.test.tsx - verifies the gradient-only renderer contract.
 *
 * These tests assert static render output: layers, contrast hints, and the
 * absence of decorative sky objects or interactive surfaces.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import Atmosphere from '../src/components/Bonfire/Atmosphere';
import type { AtmosphericState } from '../src/domain/atmosphere';

const BASE_STATE: AtmosphericState = {
  phase: 'day',
  brightness: 0.86,
  warmth: 0.48,
  seasonStrength: 0.1,
  hemisphere: 'north',
  mode: 'open',
};

function renderAtmosphere(state: Partial<AtmosphericState> = {}) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(<Atmosphere state={{ ...BASE_STATE, ...state }} />);
  });
  return tree;
}

test('renders stable non-interactive gradient layers', () => {
  const tree = renderAtmosphere();
  const root = tree.root.findByProps({ testID: 'bonfire-atmosphere' });
  const base = tree.root.findByProps({ testID: 'atmosphere-base-gradient' });
  const horizon = tree.root.findByProps({ testID: 'atmosphere-horizon-gradient' });

  expect(root.props.pointerEvents).toBe('none');
  expect(root.props.accessibilityElementsHidden).toBe(true);
  expect(base.props.colors.length).toBeGreaterThanOrEqual(2);
  expect(horizon.props.colors).toContain('transparent');
});

test('keeps night darker than day for screenshot-readable contrast', () => {
  const day = renderAtmosphere({ phase: 'day', brightness: 0.86 });
  const night = renderAtmosphere({ phase: 'night', brightness: 0.16 });

  expect(day.root.findByProps({ testID: 'atmosphere-base-gradient' }).props.colors[0]).not.toBe(
    night.root.findByProps({ testID: 'atmosphere-base-gradient' }).props.colors[0],
  );
  expect(
    night.root.findByProps({ testID: 'atmosphere-brightness-veil' }).props.style[1].backgroundColor,
  ).toContain('0.014');
});

test('uses only gradients and veils, not decorative sky objects', () => {
  const tree = renderAtmosphere({ phase: 'dusk', seasonStrength: -0.6 });
  const labels = tree.root.findAll(
    node =>
      typeof node.props.accessibilityLabel === 'string' &&
      /star|moon|sun|cloud/i.test(node.props.accessibilityLabel),
  );

  expect(labels).toHaveLength(0);
  expect(tree.root.findByProps({ testID: 'atmosphere-seasonal-veil' })).toBeTruthy();
});
