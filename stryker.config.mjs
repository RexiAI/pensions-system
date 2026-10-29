/**
 * Mutation testing for the pension-math calculation and validation surface (spec 001, stage 5a).
 *
 * Scope is deliberately narrow. The product's claims are numeric (ratios, shares, IRR, implicit
 * debt, required base growth) and provenance-bound (manifest validation, hashing, definition
 * registry, source ingest). React components and Next.js routes are excluded: mutating JSX and
 * generated markup proves nothing about whether a published number is right, and it costs hours.
 *
 * `scripts/*.ts` are excluded for a mechanical reason, not a convenience one: each is a CLI
 * entry point that runs its side effect (`process.exit(main())`) at import time and is only ever
 * exercised through a subprocess. Stryker instruments modules inside the test runner's process,
 * so a mutant in a subprocess-only entry point cannot be killed by any test, in principle. The
 * calculation and validation logic those scripts delegate to lives in `web/ingest/**`,
 * `web/manifest/**`, `web/sources/**` and `web/metrics/**`, which are all in scope here.
 *
 * Full rationale and the per-area score breakdown are recorded in `specs/001-pension-math/30-report.md`.
 */
export default {
  testRunner: 'vitest',
  mutate: [
    'web/metrics/**/*.ts',
    'web/manifest/**/*.ts',
    'web/sources/**/*.ts',
    'web/ingest/**/*.ts',
    // Revision 2's calculation surface (T17 age structure, T18 countdown) and revision 3's clock
    // (T20: clock, clock-ticker, amended countdown). Widened deliberately when those modules
    // shipped: they carry the product's newest numeric claims, so leaving them out would let an
    // aggregate score describe a tree that no longer exists.
    'web/series/**/*.ts',
    // T21's per-locale statement budget. One file, not all of `web/content/**`: this is the only
    // module there that carries a product claim (the two-line fit) rather than presentation
    // formatting. A wrong budget lets the headline overflow its column on a built page.
    'web/content/budgets.ts',
    // The repo-local 3-digit traceability gate. Normally `scripts/*.ts` is excluded because each
    // entry point calls `process.exit(main())` at import time (see above); this one does not — it
    // guards the invocation with `import.meta.url` and exports its predicates, so a mutant in it
    // is reachable and killable from the test suite.
    'scripts/check-scenario-traceability-3digit.ts',
  ],
  // Sandbox copy exclusions. `stryker.config.mjs` itself lives outside the mutate globs, and
  // none of these directories is needed to run the suite: `.opencode` and `.standards` in
  // particular contain symlinked directories that Stryker's file copier cannot traverse
  // (`EISDIR: illegal operation on a directory`), and `.standards` is a submodule we must
  // never touch. `data/derived` and `data/snapshots` are deliberately NOT ignored — the
  // ingest and gate tests read them.
  //
  // `specs/` is NOT ignored either, and that is load-bearing: `scripts/check-scenario-traceability-3digit.ts`
  // is in the mutate globs, and the test that proves it counts this repository's real scenario
  // IDs reads `specs/001-*/20-acceptance/`. With `specs` excluded from the sandbox, that test
  // fails in Stryker's dry run (the gate then sees zero scenarios) and no mutation run starts at
  // all. Copying one directory of markdown is the whole cost. No file under `specs/` is mutated.
  ignorePatterns: [
    '.opencode',
    '.standards',
    '.github',
    '.githooks',
    '.playwright-mcp',
    'data/pending',
    'data/proposals',
    'tsconfig.tsbuildinfo',
    'runs.jsonl',
  ],
  vitest: { configFile: 'vitest.config.ts' },
  // Vitest transpiles through oxc and never type-checks, so the type-check-disabling
  // preprocessor is pure overhead here — and it fails on `.standards` HTML files.
  disableTypeChecks: false,
  coverageAnalysis: 'perTest',
  // A mutated kernel can turn a bisection loop unbounded; bound the per-test wall clock so a
  // stuck mutant is reported as killed-by-timeout instead of hanging the run.
  timeoutMS: 30_000,
  timeoutFactor: 2,
  concurrency: 4,
  reporters: ['clear-text', 'progress', 'json'],
  jsonReporter: { fileName: 'reports/mutation/mutation.json' },
  thresholds: { high: 80, low: 80, break: null },
  tempDirName: '.stryker-tmp',
  cleanTempDir: true,
};
