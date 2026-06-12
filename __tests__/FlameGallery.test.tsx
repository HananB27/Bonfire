/**
 * FlameGallery.test.tsx — UI tests for the flame gallery and its rows.
 *
 * The gallery is pure presentation over derived `AchievementState`s, so we feed
 * it hand-built states and assert the four row presentations: unlocked (with the
 * time countdown), locked-streak progress, locked-time partial, and expired
 * re-earn — plus that equipping (any flame, locked included) fires `onEquip`.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import FlameGallery from '../src/components/Settings/FlameGallery';
import { FLAMES, type FlameId } from '../src/domain/flames';
import type { AchievementState } from '../src/domain/achievements';

// A baseline "locked, no progress" state for every flame (amber unlocked).
function baseStates(): Record<FlameId, AchievementState> {
  const states: Record<FlameId, AchievementState> = {};
  for (const f of FLAMES) {
    states[f.id] = {
      flameId: f.id,
      unlocked: f.id === 'amber',
      progress: f.id === 'amber' ? { value: 1, target: 1 } : { value: 0, target: 1 },
      achievementDay: null,
      daysLeft: null,
      expired: false,
    };
  }
  return states;
}

function render(states: Record<FlameId, AchievementState>, onEquip = jest.fn()) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <FlameGallery visible onClose={() => {}} states={states} activeId="amber" onEquip={onEquip} />,
    );
  });
  return { tree, onEquip };
}

// Collect all rendered strings so we can substring-match row text.
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
  return out.join('|');
}

function row(tree: ReactTestRenderer.ReactTestRenderer, name: string) {
  return tree.root.find(
    n =>
      n.props.accessibilityRole === 'radio' &&
      typeof n.props.accessibilityLabel === 'string' &&
      n.props.accessibilityLabel.startsWith(name),
  );
}

test('default state: only Amber unlocked; every locked row shows name + requirement (US1.3, SC-008)', () => {
  const { tree } = render(baseStates());
  const text = allText(tree);
  // Every catalog flame is visible by name…
  for (const f of FLAMES) expect(text).toContain(f.name);
  // …and every locked one teases its requirement.
  expect(text).toContain('Keep a 7-day run'); // Sodium
  expect(text).toContain('Log 14 days in a row'); // Voidfire
  expect(row(tree, 'Amber').props.accessibilityLabel).toContain('Unlocked');
});

test('a locked streak flame at 4/7 shows its progress counter (US4.2)', () => {
  const states = baseStates();
  states.sodium = { ...states.sodium, progress: { value: 4, target: 7 } };
  const { tree } = render(states);
  expect(row(tree, 'Sodium').props.accessibilityLabel).toContain('4/7');
});

test('an unlocked time flame shows its countdown (US4.3)', () => {
  const states = baseStates();
  states.toxic = {
    ...states.toxic,
    unlocked: true,
    achievementDay: '2026-06-10',
    daysLeft: 5,
    progress: { value: 3, target: 3 },
  };
  const { tree } = render(states);
  expect(row(tree, 'Toxic').props.accessibilityLabel).toContain('5d left');
});

test('an expired time flame prompts re-earn (US4.4)', () => {
  const states = baseStates();
  states.toxic = {
    ...states.toxic,
    unlocked: false,
    expired: true,
    achievementDay: '2026-05-01',
    daysLeft: -3,
    progress: { value: 3, target: 3 },
  };
  const { tree } = render(states);
  expect(row(tree, 'Toxic').props.accessibilityLabel).toContain('Expired — re-earn');
});

test('equipping a LOCKED flame is allowed and fires onEquip (US6.1, FR-012)', () => {
  const { tree, onEquip } = render(baseStates());
  act(() => {
    row(tree, 'Voidfire').props.onPress(); // locked — still equippable (preview)
  });
  expect(onEquip).toHaveBeenCalledWith('voidfire');
});
