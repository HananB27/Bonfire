/**
 * BonfireScreen.test.tsx — behavior tests for the whole screen.
 *
 * Drives the real component (hook + engine + UI) the way a user would, with the
 * native modules (Skia / Reanimated / gesture-handler) mocked (jest.setup.js).
 * We assert on the caption text the screen renders (FireCaption), which reflects
 * the derived fire state, and on the presence of the calendar/settings surfaces.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BonfireScreen from '../src/screens/BonfireScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fake device metrics so useSafeAreaInsets resolves immediately in tests.
const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

let rendered: ReactTestRenderer.ReactTestRenderer | null = null;

async function renderScreen() {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={METRICS}>
        <BonfireScreen />
      </SafeAreaProvider>,
    );
  });
  await act(async () => {}); // let loadEntries()/loadSettings() resolve
  rendered = tree;
  return tree;
}

afterEach(() => {
  act(() => {
    rendered?.unmount();
  });
  rendered = null;
});

beforeEach(async () => {
  await AsyncStorage.clear();
});

// Find the single composite element with an onPress AND a matching a11y label.
function press(tree: ReactTestRenderer.ReactTestRenderer, labelIncludes: string) {
  const node = tree.root.find(
    n =>
      typeof n.props.onPress === 'function' &&
      typeof n.props.accessibilityLabel === 'string' &&
      n.props.accessibilityLabel.includes(labelIncludes),
  );
  return act(async () => {
    node.props.onPress();
  });
}

// Concatenate every rendered string so we can substring-match caption text.
function allText(tree: ReactTestRenderer.ReactTestRenderer): string {
  const out: string[] = [];
  const walk = (n: ReactTestRenderer.ReactTestRendererJSON | string | null): void => {
    if (n == null) return;
    if (typeof n === 'string') {
      out.push(n);
      return;
    }
    (n.children ?? []).forEach(walk);
  };
  const json = tree.toJSON();
  (Array.isArray(json) ? json : [json]).forEach(walk);
  return out.join('');
}

test('starts unlit, and the swipe-up affordance is shown by default (US4)', async () => {
  const tree = await renderScreen();
  const text = allText(tree);
  expect(text).toContain('tap a day to spark it'); // unlit caption
  expect(text).toContain('swipe up to log'); // closed-sheet handle
});

test('logging a 5 today lights the fire (US1)', async () => {
  const tree = await renderScreen();

  await press(tree, 'not yet logged'); // open today's picker
  await press(tree, 'Score 5'); // choose 5

  const text = allText(tree);
  expect(text).toContain('KINDLING'); // strength 4 → Kindling (lit)
  expect(text).not.toContain('tap a day to spark it');
});

test('two consecutive missed days extinguish the fire (US2)', async () => {
  const tree = await renderScreen();

  await press(tree, 'not yet logged'); // open today
  await press(tree, 'Score 3'); // lit

  // Advance 3 days: two consecutive missed past days → out.
  for (let i = 0; i < 3; i++) {
    await press(tree, 'Advance one day');
  }

  expect(allText(tree)).toContain('two days missed'); // the "Out" caption
});

test('clearing the only scored day returns the fire to unlit (recompute)', async () => {
  const tree = await renderScreen();

  await press(tree, 'not yet logged');
  await press(tree, 'Score 4');
  await press(tree, 'scored 4 out of 5'); // reopen today's (now scored) cell
  await press(tree, 'Clear this day'); // clear it

  expect(allText(tree)).toContain('tap a day to spark it'); // unlit again
});

test('can page back a month; next is capped at the current month (US3, FR-020)', async () => {
  const tree = await renderScreen();
  const nextBtn = () => tree.root.find(n => n.props.accessibilityLabel === 'Next month');

  // Starts on the current month → "next" is disabled (no future months).
  expect(nextBtn().props.accessibilityState.disabled).toBe(true);

  await press(tree, 'Previous month');

  // After paging back, "next" is enabled again (back toward the current month).
  expect(nextBtn().props.accessibilityState.disabled).toBe(false);
});

test('settings exposes the three flame colors (US5)', async () => {
  const tree = await renderScreen();

  await press(tree, 'choose flame color'); // open the settings gear

  // The radio options render inside the modal.
  const colors = tree.root.findAll(
    n => n.props.accessibilityRole === 'radio' && typeof n.props.accessibilityLabel === 'string',
  );
  const labels = colors.map(n => n.props.accessibilityLabel);
  expect(labels).toEqual(expect.arrayContaining(['Amber', 'Crimson', 'Sapphire']));
});
