/**
 * index.ts — Expo entry point.
 *
 * `react-native-gesture-handler` must be imported at the very top of the entry
 * file (before anything else) for its native side to initialise correctly.
 * `registerRootComponent` is Expo's wrapper around AppRegistry that also wires
 * up the dev/runtime environment.
 */
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
