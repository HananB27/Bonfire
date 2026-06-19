/**
 * BonfireScreen.pulses.test.tsx — screen-level wiring for visual pulses.
 *
 * These tests seed AsyncStorage, render the real screen, then inspect the props
 * handed to the Skia layers. Pulse moments must not create stored state.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BonfireScreen from '../src/screens/BonfireScreen';
import { addDays, todayKey } from '../src/domain/dates';
import type { Entries, Score } from '../src/domain/fire';

const ENTRIES_KEY = 'bonfire.entries.v1';
const SETTINGS_KEY = 'bonfire.settings.v2';
const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

let rendered: ReactTestRenderer.ReactTestRenderer | null = null;

function build(entries: [string, Score][]): Entries {
  return Object.fromEntries(entries) as Entries;
}

async function seed(entries: Entries, settings?: unknown) {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  if (settings) await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

async function renderScreen() {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <BonfireScreen />
      </SafeAreaProvider>,
    );
  });
  await act(async () => {});
  rendered = tree;
  return tree;
}

function findFlame(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root.find(
    node => node.props && typeof node.props.fire === 'object' && node.props.palette && 'dim' in node.props,
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

afterEach(() => {
  act(() => {
    rendered?.unmount();
  });
  rendered = null;
});

test('qualifying high-score history passes a bright pulse without stored pulse state', async () => {
  const today = todayKey();
  await seed(
    build([
      [addDays(today, -3), 3],
      [addDays(today, -2), 4],
      [addDays(today, -1), 4],
      [today, 5],
    ]),
  );

  const tree = await renderScreen();
  const flame = findFlame(tree);

  expect(flame.props.pulse).toMatchObject({ active: true, family: 'highScore' });
  const keys = await AsyncStorage.getAllKeys();
  expect(keys).not.toContain('bonfire.pulseState');
});

test('warm pulse and collision-priority state reach the scene', async () => {
  const today = todayKey();
  await seed(
    build([
      [addDays(today, -4), 4],
      [addDays(today, -3), 4],
      [addDays(today, -2), 4],
      [addDays(today, -1), 4],
      [today, 5],
    ]),
  );

  const tree = await renderScreen();
  expect(findFlame(tree).props.pulse).toMatchObject({
    family: 'highScore',
    consistencyTint: true,
  });
});
