/* eslint-env jest */
/**
 * jest.setup.test.js — verifies the in-memory fakes registered in jest.setup.js.
 *
 * jest.setup.js runs before each test file, so the mocks are already active when
 * this file loads. We exercise them through require() and render helpers only.
 * No network, no timers, no production src/ imports.
 */

const React = require('react');
const { render } = require('@testing-library/react-native');
const RN = require('react-native');

describe('jest.setup.js: AsyncStorage mock', () => {
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('setItem stores a value that getItem returns', async () => {
    await AsyncStorage.setItem('alpha', 'one');
    await expect(AsyncStorage.getItem('alpha')).resolves.toBe('one');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('alpha', 'one');
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('alpha');
  });

  test('getItem returns null for a missing key', async () => {
    await expect(AsyncStorage.getItem('missing')).resolves.toBeNull();
  });

  test('setItem overwrites an existing value', async () => {
    await AsyncStorage.setItem('k', 'first');
    await AsyncStorage.setItem('k', 'second');
    await expect(AsyncStorage.getItem('k')).resolves.toBe('second');
  });

  test('removeItem deletes a key', async () => {
    await AsyncStorage.setItem('gone', 'x');
    await AsyncStorage.removeItem('gone');
    await expect(AsyncStorage.getItem('gone')).resolves.toBeNull();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('gone');
  });

  test('removeItem on a missing key resolves without error', async () => {
    await expect(AsyncStorage.removeItem('never-set')).resolves.toBeUndefined();
  });

  test('clear empties the store', async () => {
    await AsyncStorage.setItem('a', '1');
    await AsyncStorage.setItem('b', '2');
    await AsyncStorage.clear();
    await expect(AsyncStorage.getAllKeys()).resolves.toEqual([]);
    expect(AsyncStorage.clear).toHaveBeenCalled();
  });

  test('getAllKeys returns the stored keys', async () => {
    await AsyncStorage.setItem('x', '1');
    await AsyncStorage.setItem('y', '2');
    const keys = await AsyncStorage.getAllKeys();
    expect(keys.sort()).toEqual(['x', 'y']);
    expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
  });

  test('stored values are isolated after clear and re-set', async () => {
    await AsyncStorage.setItem('reuse', 'v1');
    await AsyncStorage.clear();
    await AsyncStorage.setItem('reuse', 'v2');
    await expect(AsyncStorage.getItem('reuse')).resolves.toBe('v2');
  });
});

describe('jest.setup.js: @shopify/react-native-skia mock', () => {
  const Skia = require('@shopify/react-native-skia');

  test.each([
    'Canvas', 'Group', 'Path', 'Circle', 'Oval', 'Rect', 'Paint',
    'Blur', 'ColorMatrix', 'LinearGradient', 'RadialGradient',
  ])('%s renders its children inside a View', name => {
    const Component = Skia[name];
    const { toJSON, getByText } = render(
      React.createElement(Component, null, React.createElement(RN.Text, null, `child-${name}`)),
    );
    expect(getByText(`child-${name}`)).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });

  test('passthrough components set displayName to their export name', () => {
    expect(Skia.Canvas.displayName).toBe('Canvas');
    expect(Skia.Circle.displayName).toBe('Circle');
  });

  test('vec returns {x, y} with defaults of 0', () => {
    expect(Skia.vec(3, 4)).toEqual({ x: 3, y: 4 });
    expect(Skia.vec()).toEqual({ x: 0, y: 0 });
    expect(Skia.vec(5)).toEqual({ x: 5, y: 0 });
  });

  test('rect returns {x, y, width, height}', () => {
    expect(Skia.rect(1, 2, 30, 40)).toEqual({ x: 1, y: 2, width: 30, height: 40 });
  });

  test('Skia.Path.Make returns a stub with callable no-op methods', () => {
    const path = Skia.Skia.Path.Make();
    expect(() => path.moveTo(0, 0)).not.toThrow();
    expect(() => path.lineTo(1, 1)).not.toThrow();
    expect(() => path.cubicTo(0, 0, 1, 1, 2, 2)).not.toThrow();
    expect(() => path.quadTo(0, 0, 1, 1)).not.toThrow();
    expect(() => path.close()).not.toThrow();
    expect(path.moveTo()).toBeUndefined();
  });

  test('Skia.Path.MakeFromSVGString returns a stub with callable no-op methods', () => {
    const path = Skia.Skia.Path.MakeFromSVGString('M0 0 L10 10');
    expect(typeof path.moveTo).toBe('function');
    expect(typeof path.lineTo).toBe('function');
    expect(typeof path.cubicTo).toBe('function');
    expect(typeof path.quadTo).toBe('function');
    expect(typeof path.close).toBe('function');
    expect(path.close()).toBeUndefined();
  });

  test('BlendMode.Screen equals "screen"', () => {
    expect(Skia.BlendMode.Screen).toBe('screen');
  });
});

describe('jest.setup.js: react-native-reanimated mock', () => {
  const Reanimated = require('react-native-reanimated');
  const Animated = Reanimated.default;

  test('default export exposes View, Text, ScrollView, Image and createAnimatedComponent', () => {
    expect(Animated.View).toBeDefined();
    expect(Animated.Text).toBeDefined();
    expect(Animated.ScrollView).toBeDefined();
    expect(Animated.Image).toBeDefined();
    expect(typeof Animated.createAnimatedComponent).toBe('function');
  });

  test('Animated.View renders its children', () => {
    const { getByText } = render(
      React.createElement(
        Animated.View,
        null,
        React.createElement(RN.Text, null, 'animated-child'),
      ),
    );
    expect(getByText('animated-child')).toBeTruthy();
  });

  test('createAnimatedComponent returns the component unchanged', () => {
    const Fake = () => null;
    expect(Animated.createAnimatedComponent(Fake)).toBe(Fake);
  });

  test('useSharedValue wraps the initial value', () => {
    expect(Reanimated.useSharedValue(7)).toEqual({ value: 7 });
    expect(Reanimated.useSharedValue('s')).toEqual({ value: 's' });
  });

  test('useDerivedValue evaluates its function', () => {
    expect(Reanimated.useDerivedValue(() => 42)).toEqual({ value: 42 });
  });

  test('useDerivedValue returns undefined value when the function throws', () => {
    const result = Reanimated.useDerivedValue(() => {
      throw new Error('boom');
    });
    expect(result).toEqual({ value: undefined });
  });

  test('useAnimatedStyle returns the style produced by its function', () => {
    expect(Reanimated.useAnimatedStyle(() => ({ opacity: 0.5 }))).toEqual({ opacity: 0.5 });
  });

  test('useAnimatedStyle returns {} when the function throws', () => {
    const style = Reanimated.useAnimatedStyle(() => {
      throw new Error('boom');
    });
    expect(style).toEqual({});
  });

  test('useAnimatedStyle returns {} when the function returns a falsy value', () => {
    expect(Reanimated.useAnimatedStyle(() => null)).toEqual({});
  });

  test('withTiming and withSpring return the target value', () => {
    expect(Reanimated.withTiming(10)).toBe(10);
    expect(Reanimated.withSpring(3)).toBe(3);
  });

  test('withDelay returns the value, ignoring the delay', () => {
    expect(Reanimated.withDelay(500, 9)).toBe(9);
  });

  test('withSequence returns the last value', () => {
    expect(Reanimated.withSequence(1, 2, 3)).toBe(3);
    expect(Reanimated.withSequence(5)).toBe(5);
  });

  test('withRepeat returns its input', () => {
    expect(Reanimated.withRepeat(4)).toBe(4);
  });

  test('runOnJS wraps a function and forwards arguments', () => {
    const fn = jest.fn(() => 'result');
    const wrapped = Reanimated.runOnJS(fn);
    expect(wrapped('a', 'b')).toBe('result');
    expect(fn).toHaveBeenCalledWith('a', 'b');
  });

  test('cancelAnimation is a callable no-op', () => {
    expect(() => Reanimated.cancelAnimation({ value: 1 })).not.toThrow();
    expect(Reanimated.cancelAnimation({ value: 1 })).toBeUndefined();
  });

  test('useReducedMotion returns false', () => {
    expect(Reanimated.useReducedMotion()).toBe(false);
  });
});

describe('jest.setup.js: global frame stubs', () => {
  test('requestAnimationFrame returns 0 without scheduling a callback', () => {
    const cb = jest.fn();
    expect(global.requestAnimationFrame(cb)).toBe(0);
    expect(cb).not.toHaveBeenCalled();
  });

  test('cancelAnimationFrame is a callable no-op', () => {
    expect(() => global.cancelAnimationFrame(0)).not.toThrow();
  });
});
