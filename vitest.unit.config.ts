import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import commonConfig from './vitest.common';

export default mergeConfig(
  commonConfig,
  defineConfig({
    test: {
      exclude: [...configDefaults.exclude, './src/**/*.integration.test.ts'],
      include: ['./src/**/*.unit.test.ts'],
    },
  }),
);
