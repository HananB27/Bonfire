/**
 * CalendarSheet.test.tsx — config-level tests for the calendar's gesture
 * surfaces (003 US4).
 *
 * Real pan ACTIVATION physics (the ~12px thresholds doing their job on a
 * finger drag) are not deterministically testable in jsdom — gesture-handler
 * runs them natively — so they're validated manually via quickstart scenario 4.
 * What we CAN pin down here:
 *  - the sheet body is wrapped in a GestureDetector whose pan is configured
 *    down-only (`activeOffsetY([-9999, 12])`), the mirror of the full-screen
 *    up-only open pan (`[-12, 9999]`);
 *  - the close path (the pan's onEnd snapping shut) clears the selected day.
 *
 * To see the gesture configs, this file overrides the global gesture-handler
 * mock with a RECORDING one: every Pan/Tap records its config + handlers so
 * tests can assert on them and drive onEnd by hand.
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import CalendarSheet from '../src/components/Calendar/CalendarSheet';
import type { SharedValue } from 'react-native-reanimated';

// One recorded gesture: which builder made it, the chained config, handlers.
interface Recorded {
  kind: 'pan' | 'tap';
  config: Record<string, unknown>;
  handlers: Record<string, (e?: unknown) => void>;
}

const recorded: Recorded[] = [];

jest.mock('react-native-gesture-handler', () => {
  // require() is mandatory inside a hoisted jest.mock factory (imports aren't
  // in scope yet), same pattern as jest.setup.js.
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  const RN = require('react-native');
  /* eslint-enable @typescript-eslint/no-require-imports */
  const make = (kind: 'pan' | 'tap') => {
    const g: Record<string, unknown> = {};
    const entry = { kind, config: {}, handlers: {} } as {
      kind: 'pan' | 'tap';
      config: Record<string, unknown>;
      handlers: Record<string, (e?: unknown) => void>;
    };
    ['onBegin', 'onStart', 'onUpdate', 'onChange', 'onEnd', 'onFinalize'].forEach(m => {
      g[m] = (fn: (e?: unknown) => void) => {
        entry.handlers[m] = fn;
        return g;
      };
    });
    ['minDistance', 'activeOffsetY', 'activeOffsetX', 'failOffsetY', 'failOffsetX', 'enabled'].forEach(m => {
      g[m] = (v: unknown) => {
        entry.config[m] = v;
        return g;
      };
    });
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    recorded.push(entry);
    return g;
  };
  return {
    __esModule: true,
    GestureHandlerRootView: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(RN.View, null, children),
    GestureDetector: ({ children }: { children?: React.ReactNode }) => children,
    Gesture: {
      Pan: () => make('pan'),
      Tap: () => make('tap'),
      Exclusive: (...gs: unknown[]) => gs[0],
      Race: (...gs: unknown[]) => gs[0],
      Simultaneous: (...gs: unknown[]) => gs[0],
    },
    Directions: {},
    State: {},
  };
});

beforeEach(() => {
  recorded.length = 0;
});

function renderSheet(progressValue: number) {
  // Plain object stands in for the Reanimated shared value (see jest.setup.js).
  const progress = { value: progressValue } as SharedValue<number>;
  let tree!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    tree = ReactTestRenderer.create(
      <CalendarSheet
        today="2026-06-12"
        entries={{}}
        onSet={() => {}}
        onClear={() => {}}
        progress={progress}
        height={844}
      />,
    );
  });
  return { tree, progress };
}

// The pans we care about, identified by their activation config.
const downOnlyPan = () =>
  recorded.filter(
    g => g.kind === 'pan' && JSON.stringify(g.config.activeOffsetY) === '[-9999,12]',
  );
const upOnlyPan = () =>
  recorded.filter(
    g => g.kind === 'pan' && JSON.stringify(g.config.activeOffsetY) === '[-12,9999]',
  );

test('the open sheet body has a DOWN-only pan, mirroring the up-only open pan (FR-009, FR-010)', () => {
  renderSheet(1);
  // New sheet-body pan: activates only after ~12px of downward travel…
  expect(downOnlyPan().length).toBeGreaterThan(0);
  // …while the existing full-screen open pan (up-only) is untouched.
  expect(upOnlyPan().length).toBeGreaterThan(0);
});

test('closing via the sheet-body pan clears the selected day (FR-010)', () => {
  const { tree, progress } = renderSheet(1);

  // Select today in the month grid (its cell reads "not yet logged").
  const todayCell = tree.root.find(
    n =>
      typeof n.props.onPress === 'function' &&
      typeof n.props.accessibilityLabel === 'string' &&
      n.props.accessibilityLabel.includes('not yet logged'),
  );
  act(() => {
    todayCell.props.onPress();
  });
  expect(todayCell.props.accessibilityState.selected).toBe(true);

  // Drive the body pan's end with a hard downward flick: the snap rule closes
  // the sheet (mocked withTiming resolves immediately) and clears `selected`.
  const pan = downOnlyPan().at(-1)!;
  act(() => {
    pan.handlers.onBegin?.({});
    pan.handlers.onEnd?.({ velocityY: 1200, translationY: 200 });
  });

  expect(progress.value).toBe(0);
  const cellAfter = tree.root.find(
    n =>
      typeof n.props.onPress === 'function' &&
      typeof n.props.accessibilityLabel === 'string' &&
      n.props.accessibilityLabel.includes('not yet logged'),
  );
  expect(cellAfter.props.accessibilityState.selected).toBeFalsy();
});
