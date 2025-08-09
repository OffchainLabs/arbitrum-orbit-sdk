import { configDefaults, defineConfig, mergeConfig } from 'vitest/config';
import commonConfig from './vitest.common';

export default mergeConfig(
  commonConfig,
  defineConfig({
    test: {
      exclude: [
        ...configDefaults.exclude,
        './src/**/*.unit.test.ts',
        './src/**/*.integration.test.ts',
      ],
      include: ['./src/**/*.type.test.ts'],
    },
  }),
);
