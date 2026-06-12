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
import { flameById } from '../src/domain/flames';

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

// The live flame's palette prop (what the screen is actually rendering). The
// Flame element is the only node with BOTH a `fire` and a `palette` prop.
function flamePalette(tree: ReactTestRenderer.ReactTestRenderer) {
  const node = tree.root.find(
    n => n.props && typeof n.props.fire === 'object' && n.props.palette,
  );
  return node.props.palette as { core: string };
}

// Find a gallery radio row whose accessibility label starts with `name`.
function flameRow(tree: ReactTestRenderer.ReactTestRenderer, name: string) {
  return tree.root.find(
    n =>
      n.props.accessibilityRole === 'radio' &&
      typeof n.props.accessibilityLabel === 'string' &&
      n.props.accessibilityLabel.startsWith(name),
  );
}

test('the gallery opens from the gear; by default only Amber is unlocked (US1.3)', async () => {
  const tree = await renderScreen();

  await press(tree, 'choose flame'); // open the gallery

  expect(flameRow(tree, 'Amber').props.accessibilityLabel).toContain('Unlocked');
  // A hard time flame is locked and shows its requirement instead.
  const voidfire = flameRow(tree, 'Voidfire').props.accessibilityLabel as string;
  expect(voidfire).not.toContain('Unlocked');
  expect(voidfire).toContain('Log 14 days');
});

test('earning a streak flame lets you equip it and the flame recolors (US1)', async () => {
  const tree = await renderScreen();

  // Build run strength 8 (two 5s on consecutive days) → Crimson (≥5) unlocks.
  await press(tree, 'not yet logged');
  await press(tree, 'Score 5');
  await press(tree, 'Advance one day');
  await press(tree, 'not yet logged');
  await press(tree, 'Score 5');

  // Initially the active flame is Amber (its sampled core color).
  expect(flamePalette(tree).core).toBe(flameById('amber').palette.core);

  await press(tree, 'choose flame'); // open the gallery
  expect(flameRow(tree, 'Crimson').props.accessibilityLabel).toContain('Unlocked');

  await act(async () => {
    flameRow(tree, 'Crimson').props.onPress(); // equip Crimson
  });

  // The on-screen flame now renders Crimson's palette (its sampled core color).
  expect(flamePalette(tree).core).toBe(flameById('crimson').palette.core);
});

test('an equipped streak flame relocks when the fire goes out, then re-earns (US2)', async () => {
  const tree = await renderScreen();

  // Earn + equip Crimson (run strength 8).
  await press(tree, 'not yet logged');
  await press(tree, 'Score 5');
  await press(tree, 'Advance one day');
  await press(tree, 'not yet logged');
  await press(tree, 'Score 5');
  await press(tree, 'choose flame');
  await act(async () => {
    flameRow(tree, 'Crimson').props.onPress();
  });
  expect(flamePalette(tree).core).toBe(flameById('crimson').palette.core); // full Crimson

  // Two consecutive missed past days extinguish the fire → Crimson relocks.
  for (let i = 0; i < 3; i++) await press(tree, 'Advance one day');
  expect(allText(tree)).toContain('two days missed'); // fire is out
  // The flame element is hidden while out (its fire prop says so).
  const flameNode = tree.root.find(n => n.props && typeof n.props.fire === 'object' && n.props.palette);
  expect(flameNode.props.fire.state).toBe('out');

  // Relight with a weak score → lit but below Crimson's threshold → embered.
  await press(tree, 'not yet logged');
  await press(tree, 'Score 3');
  expect(flamePalette(tree).core).toBe(flameById('crimson').embered.core);
  expect(flamePalette(tree).core).not.toBe(flameById('crimson').palette.core);

  // Rebuild strength past the threshold → Crimson is full again.
  await press(tree, 'Advance one day');
  await press(tree, 'not yet logged');
  await press(tree, 'Score 5');
  expect(flamePalette(tree).core).toBe(flameById('crimson').palette.core);
});

test('equipping a locked flame previews embered, then bursts to full when earned (US6)', async () => {
  const tree = await renderScreen();

  // Light the fire weakly (strength 2 — below Crimson's 5).
  await press(tree, 'not yet logged');
  await press(tree, 'Score 3');

  // Equip the LOCKED Crimson → embered palette + dim < 1 on the live flame.
  await press(tree, 'choose flame');
  await act(async () => {
    flameRow(tree, 'Crimson').props.onPress();
  });
  const flameNode = () =>
    tree.root.find(n => n.props && typeof n.props.fire === 'object' && n.props.palette);
  expect(flameNode().props.palette.core).toBe(flameById('crimson').embered.core);
  expect(flameNode().props.dim).toBeLessThan(1);

  // Meet the achievement (strength 2+4=6 ≥ 5) → full color, no further action.
  await press(tree, 'Advance one day');
  await press(tree, 'not yet logged');
  await press(tree, 'Score 5');
  expect(flameNode().props.palette.core).toBe(flameById('crimson').palette.core);
  expect(flameNode().props.dim).toBe(1);

  // Amber is always full, even right after equipping.
  await press(tree, 'choose flame');
  await act(async () => {
    flameRow(tree, 'Amber').props.onPress();
  });
  expect(flameNode().props.palette.core).toBe(flameById('amber').palette.core);
  expect(flameNode().props.dim).toBe(1);
});
