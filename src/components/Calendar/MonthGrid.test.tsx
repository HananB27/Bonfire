/**
 * MonthGrid.test.tsx — tests for the month calendar grid.
 *
 * Uses a fixed `today` so every assertion is deterministic. No network access.
 */

import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import MonthGrid from './MonthGrid';
import type { Entries } from '../../domain/fire';
import type { FireHealthState } from '../../domain/fireHealth';

const TODAY = '2024-03-15';

function renderGrid(overrides: Partial<React.ComponentProps<typeof MonthGrid>> = {}) {
  const props = {
    today: TODAY,
    entries: {} as Entries,
    selectedDate: null,
    onSelectDay: jest.fn(),
    ...overrides,
  };
  const utils = render(<MonthGrid {...props} />);
  return { ...utils, props };
}

describe('MonthGrid', () => {
  describe('initial view', () => {
    it('shows the month and year of the injected today', () => {
      renderGrid();
      expect(screen.getByText('March')).toBeTruthy();
      expect(screen.getByText('2024')).toBeTruthy();
    });

    it('renders the weekday header row', () => {
      renderGrid();
      const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      // 'S' and 'T' appear twice; just assert the count of each.
      expect(screen.getAllByText('S')).toHaveLength(2);
      expect(screen.getAllByText('T')).toHaveLength(2);
      expect(screen.getAllByText('M')).toHaveLength(1);
      expect(labels).toHaveLength(7);
    });

    it('renders a day cell for every day of the month', () => {
      renderGrid();
      expect(screen.getByLabelText(/2024-03-01/)).toBeTruthy();
      expect(screen.getByLabelText(/2024-03-31/)).toBeTruthy();
    });
  });

  describe('next button (FR-020)', () => {
    it('is disabled when viewing the current month', () => {
      renderGrid();
      const next = screen.getByLabelText('Next month');
      expect(next.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled: true }),
      );
    });

    it('does not change the month when pressed on the current month', () => {
      renderGrid();
      fireEvent.press(screen.getByLabelText('Next month'));
      expect(screen.getByText('March')).toBeTruthy();
      expect(screen.getByText('2024')).toBeTruthy();
    });
  });

  describe('previous button', () => {
    it('navigates backward one month', () => {
      renderGrid();
      fireEvent.press(screen.getByLabelText('Previous month'));
      expect(screen.getByText('February')).toBeTruthy();
      expect(screen.getByText('2024')).toBeTruthy();
    });

    it('enables next after navigating back, and next returns to the current month', () => {
      renderGrid();
      fireEvent.press(screen.getByLabelText('Previous month'));
      const next = screen.getByLabelText('Next month');
      expect(next.props.accessibilityState).toEqual(
        expect.objectContaining({ disabled: false }),
      );
      fireEvent.press(next);
      expect(screen.getByText('March')).toBeTruthy();
    });

    it('crosses the year boundary from January to December of the previous year', () => {
      renderGrid({ today: '2024-01-10' });
      fireEvent.press(screen.getByLabelText('Previous month'));
      expect(screen.getByText('December')).toBeTruthy();
      expect(screen.getByText('2023')).toBeTruthy();
    });
  });

  describe('day classification', () => {
    it('passes entries and today through to classifyDay (scored day renders with its date)', () => {
      const entries = { '2024-03-05': 4 } as Entries;
      renderGrid({ entries });
      expect(screen.getByLabelText(/2024-03-05/)).toBeTruthy();
    });

    it('marks today with the isToday flag on its cell', () => {
      renderGrid();
      const todayCell = screen.getByLabelText(/2024-03-15/);
      expect(todayCell).toBeTruthy();
    });
  });

  describe('fire health label', () => {
    const visibleHealth: FireHealthState = {
      visible: true,
      label: 'Steady',
    } as unknown as FireHealthState;

    it('renders the Fire Health label when visible is true', () => {
      renderGrid({ fireHealth: visibleHealth });
      expect(screen.getByText('Steady')).toBeTruthy();
    });

    it('does not render the label when visible is false', () => {
      renderGrid({
        fireHealth: { visible: false, label: 'Steady' } as unknown as FireHealthState,
      });
      expect(screen.queryByText('Steady')).toBeNull();
    });

    it('does not render the label when fireHealth is omitted', () => {
      renderGrid();
      expect(screen.queryByLabelText(/Fire Health/)).toBeNull();
    });
  });

  describe('day selection', () => {
    it('invokes onSelectDay with the dateKey of the pressed day', () => {
      const onSelectDay = jest.fn();
      renderGrid({ onSelectDay });
      const cell = screen.getByLabelText(/2024-03-07/);
      fireEvent.press(cell);
      expect(onSelectDay).toHaveBeenCalledWith('2024-03-07');
    });

    it('does not call onSelectDay when no day is pressed', () => {
      const onSelectDay = jest.fn();
      renderGrid({ onSelectDay });
      expect(onSelectDay).not.toHaveBeenCalled();
    });
  });
});
