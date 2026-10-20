/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import ScorePickerBar from './ScorePickerBar';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: {
      View: RN.View,
    },
    useAnimatedKeyboard: () => ({ height: { value: 0 } }),
    useSharedValue: (initial: number) => ({ value: initial }),
    withTiming: (toValue: number) => toValue,
    useAnimatedStyle: (fn: () => object) => fn(),
    Easing: {
      bezier: () => (t: number) => t,
    },
  };
});

jest.mock('./DayNoteEditor', () => {
  const React = jest.requireActual('react');
  const RN = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: (props: {
      dateKey: string | null;
      value: string;
      onChangeText: (t: string) => void;
    }) =>
      React.createElement(RN.TextInput, {
        testID: 'day-note-editor',
        value: props.value,
        onChangeText: props.onChangeText,
      }),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Props = React.ComponentProps<typeof ScorePickerBar>;

function baseProps(overrides: Partial<Props> = {}): Props {
  return {
    dateKey: null,
    currentScore: undefined,
    noteDraft: '',
    onNoteChange: jest.fn(),
    onChoose: jest.fn(),
    onClear: jest.fn(),
    ...overrides,
  } as Props;
}

function render(props: Props) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<ScorePickerBar {...props} />);
  });
  return tree;
}

function findScoreButton(tree: ReactTestRenderer.ReactTestRenderer, n: number) {
  return tree.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === `Score ${n}`,
  );
}

function findClearButton(tree: ReactTestRenderer.ReactTestRenderer) {
  return tree.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === "Clear this day's score",
  );
}

function flattenStyle(style: unknown): Record<string, unknown> {
  if (Array.isArray(style)) {
    return style.reduce<Record<string, unknown>>(
      (acc, s) => ({ ...acc, ...flattenStyle(s) }),
      {},
    );
  }
  if (style && typeof style === 'object') {
    return style as Record<string, unknown>;
  }
  return {};
}

// Resolve the Pressable's style prop (a function of { pressed }) into a flat object.
function resolveButtonStyle(node: ReactTestRenderer.ReactTestInstance) {
  const style = node.props.style;
  const resolved = typeof style === 'function' ? style({ pressed: false }) : style;
  return flattenStyle(resolved);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ScorePickerBar', () => {
  test('panel is pointerEvents none when dateKey is null', () => {
    const tree = render(baseProps({ dateKey: null }));
    const bar = tree.root.findAll(
      node => node.props.pointerEvents !== undefined && node.props.style !== undefined,
    )[0];
    expect(bar.props.pointerEvents).toBe('none');
  });

  test('panel is pointerEvents auto when dateKey is set', () => {
    const tree = render(baseProps({ dateKey: '2024-03-15' }));
    const bar = tree.root.findAll(
      node => node.props.pointerEvents !== undefined && node.props.style !== undefined,
    )[0];
    expect(bar.props.pointerEvents).toBe('auto');
  });

  test('header label is empty when dateKey is null', () => {
    const tree = render(baseProps({ dateKey: null }));
    const texts = tree.root.findAll(node => node.type === 'Text').map(n => n.props.children);
    expect(texts).not.toContain(expect.stringMatching(/,/));
    expect(texts).toContain('');
  });

  test('header label is formatted as weekday, month and day', () => {
    // 2024-03-15 is a Friday.
    const tree = render(baseProps({ dateKey: '2024-03-15' }));
    const texts = tree.root.findAll(node => node.type === 'Text').map(n => n.props.children);
    expect(texts).toContain('Fri, Mar 15');
  });

  test('header label handles a Sunday in January', () => {
    // 2024-01-07 is a Sunday.
    const tree = render(baseProps({ dateKey: '2024-01-07' }));
    const texts = tree.root.findAll(node => node.type === 'Text').map(n => n.props.children);
    expect(texts).toContain('Sun, Jan 7');
  });

  test('Clear button is disabled when currentScore is undefined', () => {
    const tree = render(baseProps({ dateKey: '2024-03-15', currentScore: undefined }));
    expect(findClearButton(tree).props.disabled).toBe(true);
  });

  test('Clear button is enabled and calls onClear when a score exists', () => {
    const onClear = jest.fn();
    const tree = render(
      baseProps({ dateKey: '2024-03-15', currentScore: 4, onClear }),
    );
    const clear = findClearButton(tree);
    expect(clear.props.disabled).toBe(false);
    ReactTestRenderer.act(() => {
      clear.props.onPress();
    });
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test('renders five score buttons labelled 1 through 5', () => {
    const tree = render(baseProps({ dateKey: '2024-03-15' }));
    for (let n = 1; n <= 5; n++) {
      const btn = findScoreButton(tree, n);
      expect(btn.findByType('Text').props.children).toBe(n);
    }
  });

  test('score buttons use the heat background color for their score', () => {
    const tree = render(baseProps({ dateKey: '2024-03-15' }));
    const expectedBg = [1, 2, 3, 4, 5].map(n => {
      // Derive expected colors from the same heatStyle source the component uses.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { heatStyle } = jest.requireActual('../../theme/tokens');
      return heatStyle(n).background;
    });
    for (let n = 1; n <= 5; n++) {
      const style = resolveButtonStyle(findScoreButton(tree, n));
      expect(style.backgroundColor).toBe(expectedBg[n - 1]);
    }
  });

  test('only the score 1 button receives a token-defined border color', () => {
    const tree = render(baseProps({ dateKey: '2024-03-15' }));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { heatStyle } = jest.requireActual('../../theme/tokens');
    for (let n = 1; n <= 5; n++) {
      const style = resolveButtonStyle(findScoreButton(tree, n));
      const border = heatStyle(n).border;
      if (border !== undefined) {
        expect(style.borderColor).toBe(border);
      } else {
        expect(style.borderColor).not.toBe(border);
      }
    }
    expect(heatStyle(1).border).toBeDefined();
  });

  test('pressing a score button calls onChoose with the numeric score', () => {
    const onChoose = jest.fn();
    const tree = render(baseProps({ dateKey: '2024-03-15', onChoose }));
    ReactTestRenderer.act(() => {
      findScoreButton(tree, 3).props.onPress();
    });
    expect(onChoose).toHaveBeenCalledTimes(1);
    expect(onChoose).toHaveBeenCalledWith(3);
  });

  test('each score button passes its own numeric value to onChoose', () => {
    const onChoose = jest.fn();
    const tree = render(baseProps({ dateKey: '2024-03-15', onChoose }));
    for (let n = 1; n <= 5; n++) {
      ReactTestRenderer.act(() => {
        findScoreButton(tree, n).props.onPress();
      });
    }
    expect(onChoose.mock.calls.map(c => c[0])).toEqual([1, 2, 3, 4, 5]);
  });

  test('active score button reports selected accessibility state', () => {
    const tree = render(baseProps({ dateKey: '2024-03-15', currentScore: 4 }));
    for (let n = 1; n <= 5; n++) {
      expect(findScoreButton(tree, n).props.accessibilityState).toEqual({
        selected: n === 4,
      });
    }
  });

  test('no score button is selected when currentScore is undefined', () => {
    const tree = render(baseProps({ dateKey: '2024-03-15', currentScore: undefined }));
    for (let n = 1; n <= 5; n++) {
      expect(findScoreButton(tree, n).props.accessibilityState).toEqual({
        selected: false,
      });
    }
  });

  test('note text changes propagate through onNoteChange via DayNoteEditor', () => {
    const onNoteChange = jest.fn();
    const tree = render(
      baseProps({ dateKey: '2024-03-15', noteDraft: '', onNoteChange }),
    );
    const editor = tree.root.findByProps({ testID: 'day-note-editor' });
    ReactTestRenderer.act(() => {
      editor.props.onChangeText('went for a run');
    });
    expect(onNoteChange).toHaveBeenCalledWith('went for a run');
  });

  test('DayNoteEditor receives the current noteDraft as its value', () => {
    const tree = render(
      baseProps({ dateKey: '2024-03-15', noteDraft: 'existing note' }),
    );
    const editor = tree.root.findByProps({ testID: 'day-note-editor' });
    expect(editor.props.value).toBe('existing note');
  });
});
