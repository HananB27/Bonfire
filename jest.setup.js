/* eslint-env jest */
/* eslint-disable react/display-name */
/**
 * jest.setup.js — global test setup, run before each test file.
 *
 * The flame/calendar use native modules (Skia, Reanimated, gesture-handler) that
 * can't run under Jest, so we replace them with lightweight in-memory fakes.
 * This keeps tests deterministic and fast (Constitution Principle III); the real
 * GPU/animation code is validated visually against the screenshots (quickstart).
 */

// ---- AsyncStorage: a tiny in-memory implementation ----
jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(key => Promise.resolve(key in store ? store[key] : null)),
      setItem: jest.fn((key, value) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn(key => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store = {};
        return Promise.resolve();
      }),
      getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
    },
  };
});

// ---- React Native Skia: every export becomes a passthrough <View> or no-op ----
// Components render their children; data helpers (Skia.Path, vec, ...) return
// harmless stubs so the flame renders to nothing without needing CanvasKit.
jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const RN = require('react-native');
  const passthrough = name => {
    const C = ({ children }) => React.createElement(RN.View, null, children);
    C.displayName = name;
    return C;
  };
  const stubPath = () => ({
    moveTo() {},
    lineTo() {},
    cubicTo() {},
    quadTo() {},
    close() {},
  });
  return {
    Canvas: passthrough('Canvas'),
    Group: passthrough('Group'),
    Path: passthrough('Path'),
    Circle: passthrough('Circle'),
    Oval: passthrough('Oval'),
    Rect: passthrough('Rect'),
    Paint: passthrough('Paint'),
    Blur: passthrough('Blur'),
    ColorMatrix: passthrough('ColorMatrix'),
    LinearGradient: passthrough('LinearGradient'),
    RadialGradient: passthrough('RadialGradient'),
    vec: (x = 0, y = 0) => ({ x, y }),
    rect: (x, y, width, height) => ({ x, y, width, height }),
    Skia: {
      Path: {
        Make: stubPath,
        MakeFromSVGString: stubPath,
      },
    },
    BlendMode: { Screen: 'screen' },
  };
});

// ---- Reanimated: a self-contained mock ----
// (Reanimated 4's bundled `/mock` pulls in the real native worklets module,
//  which can't initialise under Jest — so we provide our own tiny stub that
//  exposes just the API our components use. Animations resolve to their target
//  value immediately; shared/derived values are plain objects.)
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const RN = require('react-native');
  const animatedComponent = Base =>
    React.forwardRef((props, ref) => React.createElement(Base, { ...props, ref }));
  const Animated = {
    View: animatedComponent(RN.View),
    Text: animatedComponent(RN.Text),
    ScrollView: animatedComponent(RN.ScrollView),
    Image: animatedComponent(RN.Image),
    createAnimatedComponent: C => C,
  };
  const safe = fn => {
    try {
      return fn();
    } catch {
      return undefined;
    }
  };
  const ease = t => t;
  return {
    __esModule: true,
    default: Animated,
    useReducedMotion: () => false,
    useSharedValue: init => ({ value: init }),
    useDerivedValue: fn => ({ value: safe(fn) }),
    useAnimatedStyle: fn => safe(fn) || {},
    withTiming: v => v,
    withSpring: v => v,
    withDelay: (_d, v) => v,
    withSequence: (...vs) => vs[vs.length - 1],
    withRepeat: v => v,
    runOnJS: fn => (...args) => fn(...args),
    cancelAnimation: () => {},
    Easing: {
      bezier: () => ease,
      inOut: e => e,
      in: e => e,
      out: e => e,
      ease,
      sin: ease,
      linear: ease,
    },
  };
});

// ---- gesture-handler: a minimal mock (GestureDetector renders its children;
//      Gesture builders are chainable no-ops). The real GestureDetector reaches
//      into Reanimated internals we don't stub, so we replace it wholesale. ----
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const RN = require('react-native');
  const chain = () => {
    const g = {};
    [
      'onBegin', 'onStart', 'onUpdate', 'onChange', 'onEnd', 'onFinalize', 'enabled',
      'minDistance', 'activeOffsetY', 'activeOffsetX', 'failOffsetY', 'failOffsetX',
    ].forEach(m => {
      g[m] = () => g;
    });
    return g;
  };
  const passthrough = name => {
    const C = ({ children }) => React.createElement(RN.View, null, children);
    C.displayName = name;
    return C;
  };
  return {
    __esModule: true,
    GestureHandlerRootView: passthrough('GestureHandlerRootView'),
    GestureDetector: ({ children }) => children,
    Gesture: {
      Pan: chain,
      Tap: chain,
      Exclusive: (...gs) => gs[0],
      Race: (...gs) => gs[0],
      Simultaneous: (...gs) => gs[0],
    },
    Directions: {},
    State: {},
  };
});

// ---- Animation frames: no-ops so flame/ember loops don't run in tests ----
global.requestAnimationFrame = () => 0;
global.cancelAnimationFrame = () => {};
