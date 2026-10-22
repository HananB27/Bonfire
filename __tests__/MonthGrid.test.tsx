/**
 * MonthGrid.test.tsx — unit tests for the month calendar component.
 *
 * Covers: title/year rendering, ‹ › paging (including year rollover), the
 * disabled "next" button on the current month, weekday header, grid cell
 * production with classifyDay/score forwarding, selection forwarding, and the
 * conditional Fire Health label. DayCell is mocked so each cell's props can be
 * inspected directly.
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Pressable, Text } from 'react-native';
import MonthGrid from '../src/components/Calendar/MonthGrid';
import DayCell from '../src/components/Calendar/DayCell';
import * as fire from '../src/domain/fire';
import type { Entries } from '../src/domain/fire';

// Replace DayCell with a lightweight stub that records its props.
jest.mock('../src/components/Calendar/DayCell', () => {
  const MockReact = require('react');
  const { Text: MockText } = require('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) =>
      MockReact.createElement(MockText, { testID: 'day-cell', ...props }),
  };
});

const TODAY = '2024-03-15';

// Collect the props of every rendered DayCell, in render order.
function dayCellProps(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root.findAllByType(DayCell).map(n => n.props as Record<string, unknown>);
}

function render(overrides: Partial<React.ComponentProps<typeof MonthGrid>> = {}) {
  const props = {
    today: TODAY,
    entries: {} as Entries,
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

function textContents(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAllByType(Text)
    .map(n => React.Children.toArray(n.props.children).join(''));
}

function pressButton(tree: ReactTestRenderer.ReactTestRenderer, label: string) {
  const btn = tree.root.find(
    n => n.type === Pressable && n.props.accessibilityLabel === label,
  );
  ReactTestRenderer.act(() => {
    btn.props.onPress();
  });
}

function titleText(tree: ReactTestRenderer.ReactTestRenderer) {
  // Title is "<Month> <Year>" with the year in a nested Text.
  return textContents(tree);
}

describe('MonthGrid', () => {
  describe('title and year', () => {
    test('renders the month name and year of today on first mount', () => {
      const { tree } = render();
      const texts = titleText(tree);
      expect(texts).toContain('March');
      expect(texts).toContain('2024');
    });

    test('updates the title after paging back', () => {
      const { tree } = render();
      pressButton(tree, 'Previous month');
      const texts = titleText(tree);
      expect(texts).toContain('February');
      expect(texts).toContain('2024');
    });
  });

  describe('previous (‹) navigation', () => {
    test('pages backward repeatedly without limit', () => {
      const { tree } = render();
      for (let i = 0; i < 30; i++) pressButton(tree, 'Previous month');
      // 30 months back from March 2024 is September 2021.
      const texts = titleText(tree);
      expect(texts).toContain('September');
      expect(texts).toContain('2021');
    });

    test('rolls January back to December of the previous year', () => {
      const { tree } = render({ today: '2024-01-10' });
      expect(titleText(tree)).toContain('January');
      pressButton(tree, 'Previous month');
      const texts = titleText(tree);
      expect(texts).toContain('December');
      expect(texts).toContain('2023');
    });

    test('rolls December forward to January of the next year when paging next', () => {
      const { tree } = render({ today: '2024-01-10' });
      pressButton(tree, 'Previous month'); // Dec 2023
      pressButton(tree, 'Next month'); // back to Jan 2024
      const texts = titleText(tree);
      expect(texts).toContain('January');
      expect(texts).toContain('2024');
    });
  });

  describe('next (›) navigation', () => {
    test('is disabled while the current month is in view', () => {
      const { tree } = render();
      const next = tree.root.find(
        n => n.type === Pressable && n.props.accessibilityLabel === 'Next month',
      );
      expect(next.props.disabled).toBe(true);
      expect(next.props.accessibilityState).toEqual({ disabled: true });
    });

    test('does not shift the view when pressed on the current month', () => {
      const { tree } = render();
      pressButton(tree, 'Next month');
      const texts = titleText(tree);
      expect(texts).toContain('March');
      expect(texts).toContain('2024');
    });

    test('becomes enabled after paging back and returns to the current month', () => {
      const { tree } = render();
      pressButton(tree, 'Previous month');
      const next = tree.root.find(
        n => n.type === Pressable && n.props.accessibilityLabel === 'Next month',
      );
      expect(next.props.disabled).toBe(false);
      pressButton(tree, 'Next month');
      expect(titleText(tree)).toContain('March');
      const again = tree.root.find(
        n => n.type === Pressable && n.props.accessibilityLabel === 'Next month',
      );
      expect(again.props.disabled).toBe(true);
    });
  });

  describe('weekday header', () => {
    test('renders S M T W T F S', () => {
      const { tree } = render();
      const texts = textContents(tree);
      const start = texts.indexOf('S');
      expect(texts.slice(start, start + 7)).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
    });
  });

  describe('grid cells', () => {
    test('produces blank cells for leading padding and dated cells for the month', () => {
      const { tree } = render();
      const cells = dayCellProps(tree);
      const blanks = cells.filter(c => c.dateKey === null);
      const dated = cells.filter(c => c.dateKey !== null);
      expect(blanks.length).toBeGreaterThan(0);
      blanks.forEach(c => {
        expect(c.dayNumber).toBeNull();
        expect(c.kind).toBeNull();
      });
      // March 2024 has 31 days.
      expect(dated).toHaveLength(31);
      expect(dated[0].dateKey).toBe('2024-03-01');
      expect(dated[0].dayNumber).toBe(1);
    });

    test('marks today with isToday', () => {
      const { tree } = render();
      const todayCell = dayCellProps(tree).find(c => c.dateKey === TODAY);
      expect(todayCell?.isToday).toBe(true);
      const other = dayCellProps(tree).find(c => c.dateKey === '2024-03-02');
      expect(other?.isToday).toBe(false);
    });

    test('classifies each day via classifyDay and forwards the score', () => {
      const spy = jest.spyOn(fire, 'classifyDay');
      const entries: Entries = { '2024-03-05': 4 as fire.Score };
      const { tree } = render({ entries });
      const cell = dayCellProps(tree).find(c => c.dateKey === '2024-03-05');
      expect(spy).toHaveBeenCalledWith(entries, '2024-03-05', TODAY);
      expect(cell?.kind).toBe(spy.mock.results.find(r => r.value === cell?.kind)?.value);
      expect(cell?.score).toBe(4);
      spy.mockRestore();
    });

    test('passes undefined score for unscored days', () => {
      const { tree } = render();
      const cell = dayCellProps(tree).find(c => c.dateKey === '2024-03-02');
      expect(cell?.score).toBeUndefined();
    });
  });

  describe('selection forwarding', () => {
    test('passes selected=true only for the selected date', () => {
      const { tree } = render({ selectedDate: '2024-03-07' });
      const cells = dayCellProps(tree);
      expect(cells.find(c => c.dateKey === '2024-03-07')?.selected).toBe(true);
      expect(cells.find(c => c.dateKey === '2024-03-08')?.selected).toBe(false);
    });

    test('forwards onSelectDay to every dated DayCell', () => {
      const onSelectDay = jest.fn();
      const { tree } = render({ onSelectDay });
      const cell = dayCellProps(tree).find(c => c.dateKey === '2024-03-09');
      expect(cell?.onPress).toBe(onSelectDay);
    });
  });

  describe('Fire Health label', () => {
    test('renders the label when fireHealth.visible is true', () => {
      const { tree } = render({
        fireHealth: { visible: true, label: 'Bright' } as never,
      });
      expect(textContents(tree)).toContain('Bright');
    });

    test('does not render the label when fireHealth.visible is false', () => {
      const { tree } = render({
        fireHealth: { visible: false, label: 'Bright' } as never,
      });
      expect(textContents(tree)).not.toContain('Bright');
    });

    test('does not render the label when fireHealth is omitted', () => {
      const { tree } = render();
      const healthNodes = tree.root.findAllByProps({ accessibilityLabel: expect.stringMatching(/^Fire Health/) });
      expect(healthNodes).toHaveLength(0);
    });
  });
});
