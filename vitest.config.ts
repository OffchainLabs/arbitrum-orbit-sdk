import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // allow tests to run for 5 minutes as retryables can take a while
    testTimeout: 300_000,
  },
});
