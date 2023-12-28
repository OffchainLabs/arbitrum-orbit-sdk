import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // allow tests to run for 30s
    testTimeout: 30_000,
  },
});
