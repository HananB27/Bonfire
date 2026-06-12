/**
 * settingsStore.test.ts — v2 persistence: default, v1→v2 migration, validation,
 * and round-trip, using the in-memory AsyncStorage mock (jest.setup.js).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../src/data/settingsStore';

const V2_KEY = 'bonfire.settings.v2';
const V1_KEY = 'bonfire.settings.v1';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('defaults to amber when nothing is stored', async () => {
  expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
  expect((await loadSettings()).flameStyle).toBe('amber');
});

test('returns a stored v2 flame id as-is', async () => {
  await AsyncStorage.setItem(V2_KEY, JSON.stringify({ flameStyle: 'voidfire' }));
  expect(await loadSettings()).toEqual({ flameStyle: 'voidfire' });
});

test('migrates a v1 flameColor forward to a v2 flameStyle id', async () => {
  await AsyncStorage.setItem(V1_KEY, JSON.stringify({ flameColor: 'Crimson' }));
  expect(await loadSettings()).toEqual({ flameStyle: 'crimson' });
  // The migrated value is persisted under the v2 key for next time.
  const written = JSON.parse((await AsyncStorage.getItem(V2_KEY)) as string);
  expect(written).toEqual({ flameStyle: 'crimson' });
});

test('an unknown / corrupt v2 id falls back to amber', async () => {
  await AsyncStorage.setItem(V2_KEY, JSON.stringify({ flameStyle: 'chartreuse' }));
  expect((await loadSettings()).flameStyle).toBe('amber');
});

test('returns defaults on malformed JSON', async () => {
  await AsyncStorage.setItem(V2_KEY, 'not-valid-json');
  expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
});

test('round-trips a saved flame style', async () => {
  await saveSettings({ flameStyle: 'aurora' });
  expect(await loadSettings()).toEqual({ flameStyle: 'aurora' });
});
