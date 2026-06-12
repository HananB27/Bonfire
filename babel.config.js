/**
 * Babel config for the Expo app.
 *
 * - `babel-preset-expo` is the standard Expo/React-Native preset.
 * - `react-native-worklets/plugin` powers Reanimated 4 (it compiles the
 *   animation "worklets" that run on the UI thread). It MUST be listed last.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
