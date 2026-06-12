/**
 * App.tsx — the root of the Bonfire app.
 *
 * Wraps the single BonfireScreen in the providers the app needs:
 *  - GestureHandlerRootView: required at the root for react-native-gesture-handler
 *    (the swipe-up calendar sheet) to receive touches.
 *  - SafeAreaProvider: so content avoids notches / home indicators.
 *  - StatusBar (light): white status icons to suit the dark night theme.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import BonfireScreen from './src/screens/BonfireScreen';

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        {/* The app is always dark, so use light (white) status icons. */}
        <StatusBar style="light" />
        <BonfireScreen />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default App;
