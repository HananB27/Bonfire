import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import Hearth, { logColorsForAtmosphere, logCountForStrength } from '../src/components/Bonfire/Hearth';
import type { FireState } from '../src/domain/fire';
import type { Palette } from '../src/theme/palettes';
import type { AtmosphericState } from '../src/domain/atmosphere';

const palette: Palette = {
  red: '#5b1b12',
  ember: '#ff7a18',
  amber: '#ffae3b',
  gold: '#ffd27a',
  core: '#fff4cf',
};

const dayAtmosphere: Pick<AtmosphericState, 'phase' | 'brightness'> = {
  phase: 'day',
  brightness: 0.86,
};

const nightAtmosphere: Pick<AtmosphericState, 'phase' | 'brightness'> = {
  phase: 'night',
  brightness: 0.18,
};

function fire(strength: number, state: FireState['state'] = 'lit'): FireState {
  return {
    state,
    strength,
    everLit: state !== 'unlit',
    label: { word: 'Test', sub: 'test' },
  };
}

function logCount(strength: number, state: FireState['state'] = 'lit') {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <Hearth
        fire={fire(strength, state)}
        glow={0.8}
        intensity={0.5}
        palette={palette}
        atmosphere={dayAtmosphere}
      />,
    );
  });
  const countLogs = (node: ReactTestRenderer.ReactTestRendererJSON | string | null): number => {
    if (node == null || typeof node === 'string') return 0;
    const self = node.props?.testID === 'hearth-log' ? 1 : 0;
    return self + (node.children ?? []).reduce((sum, child) => sum + countLogs(child), 0);
  };
  const json = tree.toJSON();
  const count = (Array.isArray(json) ? json : [json]).reduce((sum, node) => sum + countLogs(node), 0);
  act(() => tree.unmount());
  return count;
}

test('log count stays at the two-log composition', () => {
  expect(logCountForStrength(0)).toBe(2);
  expect(logCountForStrength(3)).toBe(2);
  expect(logCountForStrength(8)).toBe(2);

  expect(logCount(0)).toBe(2);
  expect(logCount(4)).toBe(2);
  expect(logCount(12)).toBe(2);
});

test('out fire returns to base crossed logs', () => {
  expect(logCount(30, 'out')).toBe(2);
});

test('log wood tone adapts across atmosphere phases', () => {
  expect(logColorsForAtmosphere(dayAtmosphere)).not.toEqual(logColorsForAtmosphere(nightAtmosphere));
  expect(logColorsForAtmosphere(dayAtmosphere)[2]).toBe('#88613c');
  expect(logColorsForAtmosphere(nightAtmosphere)[2]).toBe('#4a2f1b');
});

test('renders adaptive wood colors without an extra backing log shape', () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <Hearth
        fire={fire(5)}
        glow={0.8}
        intensity={0.5}
        palette={palette}
        atmosphere={dayAtmosphere}
      />,
    );
  });

  const firstLogBase = tree.root.findAllByProps({ testID: 'hearth-log-base' })[0];

  expect(tree.root.findAllByProps({ testID: 'hearth-contact-wash' })).toHaveLength(0);
  expect(firstLogBase.props.colors).toEqual(logColorsForAtmosphere(dayAtmosphere));

  act(() => tree.unmount());
});
