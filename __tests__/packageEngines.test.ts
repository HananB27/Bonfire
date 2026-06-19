/**
 * packageEngines.test.ts — repository metadata guardrails.
 *
 * The constitution names the supported Node floor. This test keeps
 * `package.json` aligned with that project-wide runtime contract.
 */

import packageJson from '../package.json';

test('package engine matches the constitution Node floor', () => {
  expect(packageJson.engines.node).toBe('>= 22.11.0');
});
