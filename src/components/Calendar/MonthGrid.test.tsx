/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import MonthGridDefault from './MonthGrid';
import { classifyDay, type Entries } from '../../domain/fire';
import { monthGrid, parseYmd, type DateKey } from '../../domain/dates';

jest.mock('./DayCell', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: (props: any) =>
      React.createElement(Text, { testID: 'daycell', ...props }, props.dateKey ?? 'blank'),
  };
});

const MonthGrid = MonthGridDefault as unknown as React.ComponentType<any>;

const TODAY: DateKey = '2024-03-15';

function render(props: Partial<React.ComponentProps<typeof MonthGrid>> = {}) {
  const onSelectDay = jest.fn();
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <MonthGrid
        today={TODAY}
        entries={{} as Entries}
        selectedDate={null}
        onSelectDay={onSelectDay}
        {...props}
      />,
    );
  });
  return { tree, onSelectDay };
}

function texts(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  return tree.root
    .findAll(n => typeof n.type === 'string' && n.type === 'Text')
    .map(n => n.children.join(''));
}

function pressableByLabel(tree: ReactTestRenderer.ReactTestRenderer, label: string) {
  return tree.root.find(
    n => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button',
  );
}

describe('MonthGrid', () => {
  test('header shows month name and year for the month of today', () => {
    const { tree } = render();
    const title = texts(tree);
    expect(title).toContain('March 2024');
  });

  test('initializes view from today rather than the real clock', () => {
    const { tree } = render({ today: '1999-07-04' as DateKey });
    expect(texts(tree)).toContain('July 1999');
  });

  test('previous button shifts view backward and wraps across year boundary', () => {
    const { tree } = render({ today: '2024-01-10' as DateKey });
    expect(texts(tree)).toContain('January 2024');
    ReactTestRenderer.act(() => {
      pressableByLabel(tree, 'Previous month').props.onPress();
    });
    expect(texts(tree)).toContain('December 2023');
  });

  test('next button is disabled and does not shift when viewing current month', () => {
    const { tree } = render();
    const next = pressableByLabel(tree, 'Next month');
    expect(next.props.disabled).toBe(true);
    expect(next.props.accessibilityState).toEqual({ disabled: true });
    ReactTestRenderer.act(() => {
      next.props.onPress();
    });
    expect(texts(tree)).toContain('March 2024');
  });

  test('next button is enabled after navigating back and returns to current month', () => {
    const { tree } = render();
    ReactTestRenderer.act(() => {
      pressableByLabel(tree, 'Previous month').props.onPress();
    });
    expect(texts(tree)).toContain('February 2024');
    const next = pressableByLabel(tree, 'Next month');
    expect(next.props.disabled).toBe(false);
    ReactTestRenderer.act(() => {
      next.props.onPress();
    });
    expect(texts(tree)).toContain('March 2024');
  });

  test('weekday row renders S M T W T F S', () => {
    const { tree } = render();
    const dow = texts(tree).filter(t => t.length === 1 && 'SMTWF'.includes(t));
    expect(dow.slice(0, 7)).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });

  test('grid passes null cells for blank padding and day numbers for real days', () => {
    const { tree } = render();
    const cells = monthGrid(2024, 2);
    const cellNodes = tree.root.findAll(n => n.props.dateKey !== undefined && n.props.kind !== undefined && typeof n.type === 'function');
    expect(cellNodes.length).toBe(cells.length);
    cells.forEach((key, i) => {
      expect(cellNodes[i].props.dateKey).toBe(key);
      if (key === null) {
        expect(cellNodes[i].props.dayNumber).toBeNull();
        expect(cellNodes[i].props.kind).toBeNull();
      } else {
        expect(cellNodes[i].props.dayNumber).toBe(parseYmd(key).getDate());
      }
    });
  });

  test('day cells receive kind from classifyDay with entries and today', () => {
    const entries = { '2024-03-10': 3 } as unknown as Entries;
    const { tree } = render({ entries });
    const dayNode = tree.root.find(n => n.props.dateKey === '2024-03-10' && typeof n.type === 'function');
    expect(dayNode.props.kind).toBe(classifyDay(entries, '2024-03-10', TODAY));
    expect(dayNode.props.score).toBe(3);
    expect(dayNode.props.isToday).toBe(false);
    const todayNode = tree.root.find(n => n.props.dateKey === TODAY && typeof n.type === 'function');
    expect(todayNode.props.isToday).toBe(true);
  });

  test('marks the selected day cell', () => {
    const { tree } = render({ selectedDate: '2024-03-05' as DateKey });
    const node = tree.root.find(n => n.props.dateKey === '2024-03-05' && typeof n.type === 'function');
    expect(node.props.selected).toBe(true);
  });

  test('onSelectDay is wired to day cells and receives the correct DateKey', () => {
    const { tree, onSelectDay } = render();
    const node = tree.root.find(n => n.props.dateKey === '2024-03-07' && typeof n.type === 'function');
    ReactTestRenderer.act(() => {
      node.props.onPress('2024-03-07');
    });
    expect(onSelectDay).toHaveBeenCalledTimes(1);
    expect(onSelectDay).toHaveBeenCalledWith('2024-03-07');
  });

  test('renders fire health label when visible', () => {
    const { tree } = render({
      fireHealth: { visible: true, label: 'Blazing' },
    });
    expect(texts(tree)).toContain('Blazing');
    const labelled = tree.root.find(n => n.props.accessibilityLabel === 'Fire Health Blazing');
    expect(labelled).toBeTruthy();
  });

  test('omits fire health label when visible is false', () => {
    const { tree } = render({
      fireHealth: { visible: false, label: 'Blazing' },
    });
    expect(texts(tree)).not.toContain('Blazing');
    expect(
      tree.root.findAll(n => n.props.accessibilityLabel === 'Fire Health Blazing').length,
    ).toBe(0);
  });

  test('omits fire health label when fireHealth is undefined', () => {
    const { tree } = render();
    expect(texts(tree)).not.toContain('undefined');
    expect(
      tree.root.findAll(n => typeof n.props.accessibilityLabel === 'string' && n.props.accessibilityLabel.startsWith('Fire Health')).length,
    ).toBe(0);
  });
});
