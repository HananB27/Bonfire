/**
 * entriesStore.test.ts — persistence round-trip tests using the AsyncStorage
 * mock (set up globally in jest.setup.js).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadEntries, saveEntries } from '../src/data/entriesStore';

const STORAGE_KEY = 'bonfire.entries.v1';

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('saves then loads the same entries', async () => {
  const entries = { '2026-06-10': 3, '2026-06-11': 5 } as const;
  await saveEntries({ ...entries });
  expect(await loadEntries()).toEqual(entries);
});

test('returns an empty map when nothing is stored', async () => {
  expect(await loadEntries()).toEqual({});
});

test('drops out-of-range scores from corrupt data', async () => {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ '2026-06-10': 9, '2026-06-11': 4 }),
  );
  // Only the valid score survives.
  expect(await loadEntries()).toEqual({ '2026-06-11': 4 });
});

test('returns an empty map on malformed JSON', async () => {
  await AsyncStorage.setItem(STORAGE_KEY, 'not-valid-json');
  expect(await loadEntries()).toEqual({});
});
