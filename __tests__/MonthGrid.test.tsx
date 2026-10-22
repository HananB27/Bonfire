/**
 * MonthGrid.test.tsx — behavior tests for the month calendar component.
 *
 * Covers the header title, month paging (including the year boundary), the
 * disabled "next" button at the current month, blank leading cells, per-day
 * classification, day selection wiring, and the optional Fire Health label.
 *
 * Uses react-test-renderer (already used by __tests__/App.test.tsx) and pins
 * `today` to a fixed date so results never depend on the wall clock. DayCell is
 * replaced with a lightweight host element so these tests exercise MonthGrid's
 * own logic without depending on DayCell's styling.
 */

import React from 'react';
import ReactTestRenderer, {
  type ReactTestRendererJSON,
} from 'react-test-renderer';
import MonthGrid from '../src/components/Calendar/MonthGrid';
import { classifyDay, type Entries } from '../src/domain/fire';
import type { FireHealthState } from '../src/domain/fireHealth';
import type { DateKey } from '../src/domain/dates';

// Replace DayCell with a host element that carries its props through to the
// test renderer tree, so each rendered day can be inspected directly.
jest.mock('../src/components/Calendar/DayCell', () => {
  const mockReact = require('react');
  return {
    __esModule: true,
    default: (props: object) => mockReact.createElement('DayCell', props),
  };
});

// Fixed "today": Friday 15 March 2024. Every date in these tests is relative to it.
const TODAY = '2024-03-15' as DateKey;

type Json = ReactTestRendererJSON | ReactTestRendererJSON[] | string | null;

// Flatten the rendered host tree into one string so tests can search for visible text.
function textOf(node: Json): string {
  if (node === null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map((n) => textOf(n)).join('');
  return (node.children ?? []).map((c) => textOf(c)).join('');
}

// Every mocked DayCell host element in the rendered tree, in grid order.
function dayCells(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root.findAll((n) => n.type === 'DayCell');
}

// The composite Pressable for a nav button. Its `onPress` is the handler that
// MonthGrid wires up, so calling it simulates a tap.
function navButton(tree: ReactTestRenderer.ReactTestRenderer, label: string) {
  const match = tree.root.findAll(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function',
  );
  if (match.length === 0) throw new Error(`nav button "${label}" not found`);
  return match[0];
}

// Render MonthGrid with sensible defaults; individual tests override what they need.
function renderGrid(overrides: Partial<React.ComponentProps<typeof MonthGrid>> = {}) {
  const props: React.ComponentProps<typeof MonthGrid> = {
    today: TODAY,
    entries: {},
    selectedDate: null,
    onSelectDay: jest.fn(),
    ...overrides,
  };
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<MonthGrid {...props} />);
  });
  return { tree, props };
}

describe('MonthGrid', () => {
  test('header shows the month name and year of the viewed month', () => {
    const { tree } = renderGrid();

    expect(textOf(tree.toJSON())).toContain('March 2024');
  });

  test('previous-month button moves back one month and crosses the year boundary', () => {
    const { tree } = renderGrid({ today: '2024-01-15' as DateKey });
    expect(textOf(tree.toJSON())).toContain('January 2024');

    ReactTestRenderer.act(() => {
      navButton(tree, 'Previous month').props.onPress();
    });

    expect(textOf(tree.toJSON())).toContain('December 2023');
  });

  test('next-month button is disabled at the current month and enabled after going back', () => {
    const { tree } = renderGrid();

    // At the current month the next button must be disabled and must not navigate.
    expect(navButton(tree, 'Next month').props.disabled).toBe(true);
    ReactTestRenderer.act(() => {
      navButton(tree, 'Next month').props.onPress();
    });
    expect(textOf(tree.toJSON())).toContain('March 2024');

    // After stepping back one month, next is enabled and returns to March.
    ReactTestRenderer.act(() => {
      navButton(tree, 'Previous month').props.onPress();
    });
    expect(textOf(tree.toJSON())).toContain('February 2024');
    expect(navButton(tree, 'Next month').props.disabled).toBe(false);

    ReactTestRenderer.act(() => {
      navButton(tree, 'Next month').props.onPress();
    });
    expect(textOf(tree.toJSON())).toContain('March 2024');
  });

  test('null grid cells render as blank DayCell entries', () => {
    const { tree } = renderGrid();

    const blanks = dayCells(tree).filter((c) => c.props.dateKey === null);

    // March 2024 starts on a Friday, so the grid has leading blank cells.
    expect(blanks.length).toBeGreaterThan(0);
    for (const cell of blanks) {
      expect(cell.props.dayNumber).toBeNull();
      expect(cell.props.kind).toBeNull();
    }
  });

  test('each day receives the kind produced by classifyDay', () => {
    const entries: Entries = { '2024-03-10': 4 };
    const { tree } = renderGrid({ entries });
    const cellFor = (key: string) =>
      dayCells(tree).find((c) => c.props.dateKey === key);

    const scoredKey = '2024-03-10' as DateKey;
    const futureKey = '2024-03-20' as DateKey;

    // The grid must pass through exactly what classifyDay returns for each day.
    expect(cellFor(scoredKey)?.props.kind).toBe(classifyDay(entries, scoredKey, TODAY));
    expect(cellFor(futureKey)?.props.kind).toBe(classifyDay(entries, futureKey, TODAY));
    expect(cellFor(TODAY)?.props.kind).toBe(classifyDay(entries, TODAY, TODAY));

    // The scored, future, and today days must not all share one kind.
    const kinds = new Set([
      cellFor(scoredKey)?.props.kind,
      cellFor(futureKey)?.props.kind,
      cellFor(TODAY)?.props.kind,
    ]);
    expect(kinds.size).toBeGreaterThanOrEqual(3);
  });

  test('pressing a day calls onSelectDay with its DateKey', () => {
    const onSelectDay = jest.fn();
    const { tree } = renderGrid({ onSelectDay });
    const cell = dayCells(tree).find((c) => c.props.dateKey === '2024-03-10');
    if (!cell) throw new Error('day 2024-03-10 not rendered');

    ReactTestRenderer.act(() => {
      cell.props.onPress(cell.props.dateKey);
    });

    expect(onSelectDay).toHaveBeenCalledTimes(1);
    expect(onSelectDay).toHaveBeenCalledWith('2024-03-10');
  });

  test('Fire Health label renders only when fireHealth is visible', () => {
    const visible = { visible: true, label: 'Bright' } as unknown as FireHealthState;
    const hidden = { visible: false, label: 'Bright' } as unknown as FireHealthState;

    const shown = renderGrid({ fireHealth: visible }).tree;
    expect(textOf(shown.toJSON())).toContain('Bright');
    expect(
      shown.root.findAll((n) => n.props.accessibilityLabel === 'Fire Health Bright').length,
    ).toBeGreaterThan(0);

    const absent = renderGrid({ fireHealth: hidden }).tree;
    expect(textOf(absent.toJSON())).not.toContain('Bright');

    const omitted = renderGrid().tree;
    expect(textOf(omitted.toJSON())).not.toContain('Bright');
  });
});
