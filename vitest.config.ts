import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/lib/docs-content/**/*.test.ts']
  }
});
