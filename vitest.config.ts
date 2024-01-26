import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // allow tests to run for 7 minutes as retryables can take a while
    testTimeout: 7 * 60 * 1000,
    // don't run tests in parallel to avoid race conditions
    sequence: { concurrent: false },
  },
});
