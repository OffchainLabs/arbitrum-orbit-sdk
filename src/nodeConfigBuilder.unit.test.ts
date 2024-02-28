import { it, expect } from 'vitest';

import { createNodeConfigBuilder } from './nodeConfigBuilder';

it('creates node config with defaults', () => {
  const nodeConfig = createNodeConfigBuilder().build();
  expect(nodeConfig).toMatchSnapshot();
});

it('creates node config without defaults', () => {
  const nodeConfig = createNodeConfigBuilder({ withDefaults: false }).build();
  expect(nodeConfig).toMatchSnapshot();
});
