import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('.', import.meta.url)) },
  },
  // tsconfig keeps `jsx: preserve` for Next.js, so the test transform is told explicitly
  // to compile JSX with the automatic runtime instead of preserving it.
  oxc: { jsx: { runtime: 'automatic', importSource: 'react' } },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 30_000,
    // Spec 006 remediation (verification attempt 2, BLOCK 1): the browser suites start a real
    // `next start` and Chromium in `beforeAll`/close them in `afterAll`. Measured worst case
    // under the full 112-file suite is 4.87 s per `startServedBrowser` and 0.37 s per close, but
    // `startServedApp` is allowed to poll for the server for 60 s, so the hook bound must exceed
    // that ceiling rather than the steady-state measurement. 120 s = 2x the helper's own 60 s
    // deadline, leaving room for launch, close and a loaded machine. The 10 s default aborted
    // hooks mid-startup, leaked the half-started server and Chromium, and made the next run
    // slower still — the 6/6 cascade attempt 2 recorded.
    hookTimeout: 120_000,
  },
});
