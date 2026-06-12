/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });
  // Flush the initial async entries load, then unmount so the flame's animation
  // loop is stopped and no timers leak past the test.
  await ReactTestRenderer.act(async () => {});
  ReactTestRenderer.act(() => {
    tree.unmount();
  });
});
