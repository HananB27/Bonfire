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
import { AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BonfireScreen, { fireLayoutForWidth } from '../src/screens/BonfireScreen';
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
  jest.restoreAllMocks();
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

function jsonByTestId(
  node: ReactTestRenderer.ReactTestRendererJSON | string | null,
  testID: string,
): ReactTestRenderer.ReactTestRendererJSON | undefined {
  if (node == null || typeof node === 'string') return undefined;
  if (node.props.testID === testID) return node;
  for (const child of node.children ?? []) {
    const match = jsonByTestId(child, testID);
    if (match) return match;
  }
  return undefined;
}

test('starts unlit, and the swipe-up affordance is shown by default (US4)', async () => {
  const tree = await renderScreen();
  const text = allText(tree);
  expect(text).toMatch(/tap a day to spark it/i); // unlit caption
  expect(text).toContain('swipe up to log'); // closed-sheet handle
});

test('fire layout keeps flame, logs, and caption on the same design anchor', () => {
  const layout = fireLayoutForWidth(390);
  expect(layout.flameVisibleBottomFromBottom).toBe(199);
  expect(layout.hearthBottom).toBe(144);
  expect(layout.captionBottom).toBe(92);

  expect(layout.flameVisibleBottomFromBottom - layout.hearthBottom).toBe(55);
  expect(layout.hearthBottom - layout.captionBottom).toBe(52);

  expect(fireLayoutForWidth(320)).toEqual(layout);
  expect(fireLayoutForWidth(480)).toEqual(layout);
});

test('flame canvas uses measured scene size for the same coordinate space as hearth', async () => {
  const tree = await renderScreen();
  const scene = tree.root.find(
    n => typeof n.props.onLayout === 'function' && n.props.pointerEvents === 'none',
  );

  await act(async () => {
    scene.props.onLayout({ nativeEvent: { layout: { width: 360, height: 720 } } });
  });

  const flame = findFlame(tree);
  expect(flame.props.width).toBe(360);
  expect(flame.props.height).toBe(720);
});

test('atmosphere renders behind the fire scene and leaves flame prominence unchanged', async () => {
  const tree = await renderScreen();
  const json = tree.toJSON();
  const screen = jsonByTestId(Array.isArray(json) ? json[0] : json, 'bonfire-screen');
  const flame = findFlame(tree);

  expect(screen?.children?.[0]).toMatchObject({ props: { testID: 'bonfire-atmosphere' } });
  expect(flame.props.dim).toBe(1);
});

test('atmosphere refreshes on app focus without mutating fire state', async () => {
  let onAppStateChange: ((state: string) => void) | undefined;
  const remove = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, handler) => {
    onAppStateChange = handler;
    return { remove };
  });

  const tree = await renderScreen();
  const fireBefore = findFlame(tree).props.fire;

  await act(async () => {
    onAppStateChange?.('background');
  });
  expect(tree.root.findByProps({ testID: 'bonfire-atmosphere' }).props.nativeID).toContain('-open-');

  await act(async () => {
    onAppStateChange?.('active');
  });

  expect(tree.root.findByProps({ testID: 'bonfire-atmosphere' }).props.nativeID).toContain(
    '-focus-',
  );
  expect(findFlame(tree).props.fire).toBe(fireBefore);
});

test('logging a 5 today lights the fire (US1)', async () => {
  const tree = await renderScreen();

  await press(tree, 'not yet logged'); // open today's picker
  await press(tree, 'Score 5'); // choose 5

  const text = allText(tree);
  expect(text).toContain('KINDLING'); // strength 4 → Kindling (lit)
  expect(text).not.toMatch(/tap a day to spark it/i);
});

test('two consecutive missed days extinguish the fire (US2)', async () => {
  const tree = await renderScreen();

  await press(tree, 'not yet logged'); // open today
  await press(tree, 'Score 3'); // lit

  // Advance 3 days: two consecutive missed past days → out.
  for (let i = 0; i < 3; i++) {
    await press(tree, 'Advance one day');
  }

  expect(allText(tree)).toMatch(/two days missed/i); // the "Out" caption
});

test('clearing the only scored day returns the fire to unlit (recompute)', async () => {
  const tree = await renderScreen();

  await press(tree, 'not yet logged');
  await press(tree, 'Score 4');
  await press(tree, 'scored 4 out of 5'); // reopen today's (now scored) cell
  await press(tree, 'Clear this day'); // clear it

  expect(allText(tree)).toMatch(/tap a day to spark it/i); // unlit again
});

test('autosaves a daily memory note and shows it again after reopening the day', async () => {
  const tree = await renderScreen();

  await press(tree, 'not yet logged');
  await press(tree, 'Score 4');
  await press(tree, 'scored 4 out of 5');

  const input = tree.root.findByProps({ accessibilityLabel: 'Daily memory note' });
  await act(async () => {
    input.props.onChangeText('Noon walk helped.');
  });

  await press(tree, 'Score 4');
  await press(tree, 'scored 4 out of 5');

  expect(tree.root.findByProps({ accessibilityLabel: 'Daily memory note' }).props.value).toBe(
    'Noon walk helped.',
  );
});

test('daily memory stays out of month view labels and visible text', async () => {
  const tree = await renderScreen();

  await press(tree, 'not yet logged');
  await press(tree, 'Score 5');
  await press(tree, 'scored 5 out of 5');
  await act(async () => {
    tree.root
      .findByProps({ accessibilityLabel: 'Daily memory note' })
      .props.onChangeText('Private month-view sentinel');
  });
  await press(tree, 'Score 5');

  const monthCells = tree.root.findAll(
    n =>
      typeof n.props.accessibilityLabel === 'string' &&
      /^\d{4}-\d{2}-\d{2},/.test(n.props.accessibilityLabel),
  );
  expect(monthCells.some(n => n.props.accessibilityLabel.includes('Private month-view sentinel'))).toBe(
    false,
  );
  expect(allText(tree)).not.toContain('Private month-view sentinel');
  expect(allText(tree)).not.toMatch(/note badge|note preview|memory marker/i);
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
// Hearth also takes `fire` + `palette` now (003 US2), so we pin the Flame by
// its `dim` prop, which only the Flame has.
function findFlame(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root.find(
    n => n.props && typeof n.props.fire === 'object' && n.props.palette && 'dim' in n.props,
  );
}
function flamePalette(tree: ReactTestRenderer.ReactTestRenderer) {
  return findFlame(tree).props.palette as { core: string };
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

test('the settings gear is a 52pt touch target and still opens the gallery (003 US5, FR-012)', async () => {
  const tree = await renderScreen();

  const gear = tree.root.find(
    n =>
      typeof n.props.onPress === 'function' &&
      n.props.accessibilityLabel === 'Settings: choose flame',
  );
  // Pressable style is a function of the pressed state — resolve and flatten it.
  const resolved = gear.props.style({ pressed: false });
  const flat = Object.assign({}, ...[resolved].flat(Infinity).filter(Boolean));
  // 52×52: visibly larger than the old 38 and above the 44pt minimum target.
  expect(flat.width).toBe(52);
  expect(flat.height).toBe(52);
  expect(flat.width).toBeGreaterThanOrEqual(44);

  await press(tree, 'choose flame');
  expect(flameRow(tree, 'Amber')).toBeTruthy(); // the gallery actually opened
});

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
  expect(allText(tree)).toMatch(/two days missed/i); // fire is out
  // The flame element is hidden while out (its fire prop says so).
  expect(findFlame(tree).props.fire.state).toBe('out');

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

// ---- Screen-level locked-equip guard (003 US1, FR-001 defense in depth) ----
// The FlameRow already refuses locked presses, so we exercise the screen's own
// guard directly through the `onEquip` prop it hands to SettingsSheet — the
// path ANY future caller would take.

// The guarded equip handler the screen passes down (SettingsSheet is the only
// node with both `states` and `onEquip` props).
function equipHandler(tree: ReactTestRenderer.ReactTestRenderer) {
  const node = tree.root.find(
    n => n.props && n.props.states && typeof n.props.onEquip === 'function' && 'newlyUnlocked' in n.props,
  );
  return node.props.onEquip as (id: string) => void;
}

test('equipping a LOCKED flame id is a no-op: nothing renders, nothing persists (FR-001)', async () => {
  const tree = await renderScreen();

  // Fresh calendar → Voidfire is locked. Try to equip it via the screen handler.
  await act(async () => {
    equipHandler(tree)('voidfire');
  });

  // The live flame still renders Amber — the locked equip never went through…
  expect(flamePalette(tree).core).toBe(flameById('amber').palette.core);
  // …and nothing was written to settings (flameStyle never persisted).
  const raw = await AsyncStorage.getItem('bonfire.settings.v2');
  expect(raw === null || (JSON.parse(raw).flameStyle ?? 'amber') === 'amber').toBe(true);
});

// ---- 004: activeStyle wiring + out-state precedence for profiles ----

// The Embers element: it has `intensity` + `palette` but no `fire`/`dim`.
function findEmbers(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root.find(
    n => n.props && typeof n.props.intensity === 'number' && n.props.palette && !('fire' in n.props),
  );
}

test('the active FlameStyle is passed to Flame, while the calendar no longer lifts it (004 US1)', async () => {
  const tree = await renderScreen();
  const flame = findFlame(tree);
  // activeStyle reaches the flame and carries the BonfireDesign visualProfile…
  expect(flame.props.activeStyle.id).toBe('amber');
  expect(flame.props.activeStyle.visualProfile.shape.variant).toBe('classic');
  // …while every prior prop still passes through unchanged.
  expect(flame.props.palette).toBeTruthy();
  expect(typeof flame.props.dim).toBe('number');
  expect(typeof flame.props.width).toBe('number');
  expect(typeof flame.props.height).toBe('number');
  expect(flame.props.clock).toBeTruthy();
  expect(flame.props.lift).toBeUndefined();
});

test('the active FlameStyle is passed to Embers for its particle mix (004 US3)', async () => {
  const tree = await renderScreen();
  const embers = findEmbers(tree);
  expect(embers.props.activeStyle.id).toBe('amber');
  expect(Array.isArray(embers.props.activeStyle.visualProfile.particles)).toBe(true);
});

test('equipping a flame swaps the visualProfile reaching Flame and Embers (004 US1/US3)', async () => {
  const tree = await renderScreen();

  // Earn + equip Crimson.
  await press(tree, 'not yet logged');
  await press(tree, 'Score 5');
  await press(tree, 'Advance one day');
  await press(tree, 'not yet logged');
  await press(tree, 'Score 5');
  await press(tree, 'choose flame');
  await act(async () => {
    flameRow(tree, 'Crimson').props.onPress();
  });

  expect(findFlame(tree).props.activeStyle.id).toBe('crimson');
  expect(findFlame(tree).props.activeStyle.visualProfile.shape.edge).toBe('sharp');
  expect(findEmbers(tree).props.activeStyle.id).toBe('crimson');
});

test('out-state precedence: the live flame is hidden when the fire goes out (004 US5)', async () => {
  const tree = await renderScreen();

  await press(tree, 'not yet logged');
  await press(tree, 'Score 3'); // lit
  for (let i = 0; i < 3; i++) await press(tree, 'Advance one day'); // → out

  // The flame still receives its profile, but its fire prop says `out`, so the
  // component hides itself (no live flame / profile accents are drawn).
  const flame = findFlame(tree);
  expect(flame.props.fire.state).toBe('out');
  // Embers intensity collapses to 0 when not lit → profile particles vanish too.
  expect(findEmbers(tree).props.intensity).toBe(0);
});

test('equipping an UNLOCKED flame id still persists as before (FR-003)', async () => {
  const tree = await renderScreen();

  // Earn Crimson (run strength 8 via two 5s on consecutive days).
  await press(tree, 'not yet logged');
  await press(tree, 'Score 5');
  await press(tree, 'Advance one day');
  await press(tree, 'not yet logged');
  await press(tree, 'Score 5');

  await act(async () => {
    equipHandler(tree)('crimson');
  });

  expect(flamePalette(tree).core).toBe(flameById('crimson').palette.core);
  const raw = await AsyncStorage.getItem('bonfire.settings.v2');
  expect(raw).not.toBeNull();
  expect(JSON.parse(raw!).flameStyle).toBe('crimson');
});
