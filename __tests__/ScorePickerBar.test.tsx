/**
 * @format
 *
 * Tests for ScorePickerBar: the inline 1-5 score picker inside the calendar sheet.
 * Covers score buttons, the selected-state flag, the Clear button, the date header,
 * the open/closed pointer events, and the note editor wiring.
 * Reanimated and DayNoteEditor are mocked so the tests stay deterministic and never
 * touch native animation code or the network.
 */

import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import type { DateKey } from '../src/domain/dates';
import type { Score } from '../src/domain/fire';
import ScorePickerBar from '../src/components/Calendar/ScorePickerBar';
import DayNoteEditor from '../src/components/Calendar/DayNoteEditor';

// Reanimated needs native worklet support, so replace it with a tiny stand-in:
// shared values are plain objects, timing jumps straight to the target, and
// the keyboard is always closed (height 0).
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: { View },
    useAnimatedStyle: () => ({}),
    useAnimatedKeyboard: () => ({ height: { value: 0 } }),
    useSharedValue: (initial: number) => ({ value: initial }),
    withTiming: (toValue: number) => toValue,
    Easing: { bezier: () => (t: number) => t },
  };
});

// The note editor has its own tests; here we only need to see the props it receives.
jest.mock('../src/components/Calendar/DayNoteEditor', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}));

type Props = React.ComponentProps<typeof ScorePickerBar>;

const mockEditor = DayNoteEditor as unknown as jest.Mock;
const openTrees: ReactTestRenderer.ReactTestRenderer[] = [];

// Build the picker with sensible defaults; each test overrides only what it needs.
function renderBar(overrides: Partial<Props> = {}) {
  const props: Props = {
    dateKey: null,
    currentScore: undefined,
    noteDraft: '',
    onNoteChange: jest.fn(),
    onChoose: jest.fn(),
    onClear: jest.fn(),
    ...overrides,
  };
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<ScorePickerBar {...props} />);
  });
  openTrees.push(tree);
  return { tree, props };
}

// Find the composite Pressable for a button. Only the composite node carries
// `onPress`, so this avoids matching the host View underneath it.
function findPressable(
  tree: ReactTestRenderer.ReactTestRenderer,
  label: string,
): ReactTestRenderer.ReactTestInstance {
  const matches = tree.root.findAll(
    n => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function',
  );
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one pressable labelled "${label}", found ${matches.length}`);
  }
  return matches[0];
}

// Collect the text content of every <Text> node in the rendered tree.
function allTextChildren(tree: ReactTestRenderer.ReactTestRenderer): unknown[] {
  return tree.root.findAll(n => n.type === Text).map(n => n.props.children);
}

afterEach(() => {
  // Unmount everything so no animation state leaks between tests.
  while (openTrees.length > 0) {
    const tree = openTrees.pop();
    ReactTestRenderer.act(() => {
      tree?.unmount();
    });
  }
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ScorePickerBar score buttons', () => {
  test('renders five score buttons labelled 1 through 5', () => {
    const { tree } = renderBar({ dateKey: '2024-03-05' as DateKey });

    for (const n of [1, 2, 3, 4, 5]) {
      expect(findPressable(tree, `Score ${n}`)).toBeDefined();
    }
    // The visible digits must match the accessibility labels.
    expect(allTextChildren(tree)).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
  });

  test.each([1, 2, 3, 4, 5])('pressing score %i calls onChoose with %i', n => {
    const { tree, props } = renderBar({ dateKey: '2024-03-05' as DateKey });

    ReactTestRenderer.act(() => {
      findPressable(tree, `Score ${n}`).props.onPress();
    });

    expect(props.onChoose).toHaveBeenCalledTimes(1);
    expect(props.onChoose).toHaveBeenCalledWith(n);
  });

  test('marks only the button matching currentScore as selected', () => {
    const { tree } = renderBar({
      dateKey: '2024-03-05' as DateKey,
      currentScore: 4 as Score,
    });

    for (const n of [1, 2, 3, 5]) {
      expect(findPressable(tree, `Score ${n}`).props.accessibilityState).toEqual({ selected: false });
    }
    expect(findPressable(tree, 'Score 4').props.accessibilityState).toEqual({ selected: true });
  });

  test('no button is selected when the day has no score', () => {
    const { tree } = renderBar({ dateKey: '2024-03-05' as DateKey });

    for (const n of [1, 2, 3, 4, 5]) {
      expect(findPressable(tree, `Score ${n}`).props.accessibilityState).toEqual({ selected: false });
    }
  });
});

describe('ScorePickerBar Clear button', () => {
  test('is disabled when currentScore is undefined', () => {
    const { tree, props } = renderBar({
      dateKey: '2024-03-05' as DateKey,
      currentScore: undefined,
    });

    const clear = findPressable(tree, "Clear this day's score");
    expect(clear.props.disabled).toBe(true);

    ReactTestRenderer.act(() => {
      clear.props.onPress();
    });
    // The Pressable is disabled, but this guard also checks the handler is not wired to a score.
    expect(props.onChoose).not.toHaveBeenCalled();
  });

  test('is enabled when a score exists and calls onClear when pressed', () => {
    const { tree, props } = renderBar({
      dateKey: '2024-03-05' as DateKey,
      currentScore: 2 as Score,
    });

    const clear = findPressable(tree, "Clear this day's score");
    expect(clear.props.disabled).toBe(false);

    ReactTestRenderer.act(() => {
      clear.props.onPress();
    });

    expect(props.onClear).toHaveBeenCalledTimes(1);
  });
});

describe('ScorePickerBar date header', () => {
  test('formats the dateKey as "Weekday, Mon D"', () => {
    // 2024-03-05 is a Tuesday in March.
    const { tree } = renderBar({ dateKey: '2024-03-05' as DateKey });
    expect(allTextChildren(tree)).toContain('Tue, Mar 5');
  });

  test('handles a year-end date correctly', () => {
    // 2024-12-31 is a Tuesday in December.
    const { tree } = renderBar({ dateKey: '2024-12-31' as DateKey });
    expect(allTextChildren(tree)).toContain('Tue, Dec 31');
  });

  test('shows an empty header when closed', () => {
    const { tree } = renderBar({ dateKey: null });
    expect(allTextChildren(tree)).not.toContain('Tue, Mar 5');
    expect(allTextChildren(tree)).toContain('');
  });
});

describe('ScorePickerBar pointer events', () => {
  test('uses pointerEvents "none" when dateKey is null', () => {
    const { tree } = renderBar({ dateKey: null });
    const panel = tree.root.findAll(n => n.props.pointerEvents !== undefined)[0];
    expect(panel.props.pointerEvents).toBe('none');
  });

  test('uses pointerEvents "auto" when dateKey is set', () => {
    const { tree } = renderBar({ dateKey: '2024-03-05' as DateKey });
    const panel = tree.root.findAll(n => n.props.pointerEvents !== undefined)[0];
    expect(panel.props.pointerEvents).toBe('auto');
  });
});

describe('ScorePickerBar DayNoteEditor wiring', () => {
  test('passes value and onChangeText from props to DayNoteEditor', () => {
    const { props } = renderBar({
      dateKey: '2024-03-05' as DateKey,
      noteDraft: 'Deep work block',
    });

    const lastCall = mockEditor.mock.calls[mockEditor.mock.calls.length - 1];
    const editorProps = lastCall[0];

    expect(editorProps.value).toBe('Deep work block');
    expect(editorProps.onChangeText).toBe(props.onNoteChange);
    expect(editorProps.dateKey).toBe('2024-03-05');
  });
});
