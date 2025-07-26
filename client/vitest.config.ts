import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';

export default defineConfig({
  plugins: [WxtVitest()],
   test: {
    setupFiles: ['./src/__test__/setup.ts'],
    mockReset: true,
    restoreMocks: true,
  },
});