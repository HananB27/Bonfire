/**
 * settingsStore.test.ts — persistence round-trip + defaults for the flame color,
 * using the AsyncStorage mock (set up globally in jest.setup.js).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadSettings, saveSettings, DEFAULT_SETTINGS } from '../src/data/settingsStore';

const STORAGE_KEY = 'bonfire.settings.v1';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('defaults to Amber when nothing is stored', async () => {
  expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
  expect((await loadSettings()).flameColor).toBe('Amber');
});

test('saves then loads the same settings', async () => {
  await saveSettings({ flameColor: 'Sapphire' });
  expect(await loadSettings()).toEqual({ flameColor: 'Sapphire' });
});

test('falls back to Amber for an unknown color', async () => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ flameColor: 'Chartreuse' }));
  expect((await loadSettings()).flameColor).toBe('Amber');
});

test('returns defaults on malformed JSON', async () => {
  await AsyncStorage.setItem(STORAGE_KEY, 'not-valid-json');
  expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
});
