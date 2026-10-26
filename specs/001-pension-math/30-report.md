# 30 — Report: pension-math

Stage 5a (Mutation Runner), **refresh run**. Conformance tier `production`, so the mutation gate
applies. Read `25-verification.md`, `10-tasks.md`, `20-acceptance/`, `15-design.md`. Did **not** read
`00-informal.md`.

**Verdict: GREEN**

- Mutation score on the stated scope: **93.83 %** (94.40 % over covered mutants), threshold ≥ 80 %.
- **F1-unblocked block** re-measured separately: 18 mutants → **15 killed, 3 equivalent, 0 untested
  reachable**. Raw block score 83.33 % (100 % of the killable mutants in the block).
- Rounds this refresh: **2** (baseline + one test batch). Budget for a refresh was two rounds.
- Final full suite: **415 tests, 33 files, 0 failures** (was 414; this stage added 1 test).
- App builds: `next build` exit 0. `tsc --noEmit` exit 0. ESLint exit 0.
- No existing test was weakened, renamed or deleted. Only additions (one file, one `describe`).

---

## Revision history

| When | Verdict | Score | Tests | What the tree looked like |
|---|---|---|---|---|
| 2026-10-25T23:25:50Z (first run of this stage) | GREEN | 92.74 % total / 93.51 % covered, 1846 mutants | 388 | **Before F1 was fixed.** `centralCellOf` compared a *deflated* `rPaidReal` against the *nominal* band centre, so `fig-05` threw `sensitivity grid is missing the central cell` whenever its compute body ran. 18 mutants in the post-throw half of `baseGrowthValue` and in `centralCellOf` were therefore un-killable, and the report had to list them as "blocked by a production defect". |
| 2026-10-26T08:16:47Z (this refresh) | GREEN | **93.83 % total / 94.40 % covered**, 1846 mutants | 415 | **After F1 was fixed** (`SensitivityCell.rPaidNominal`, central-cell lookup on the swept nominal), after the hero ladder swap (`['fig-02','fig-01']` + per-figure spec table), and after the percent-scale fix (`percentPoints` kind). |

**The 92.74 % figure described pre-F1 code and must not be read as a claim about the current tree.**
It is kept here only so the before/after is auditable. Two further corrections to the earlier report,
for the record:

1. **Its detail tables overlapped.** The summary line was right ("64 equivalent, 18 unreachable/dead,
   18 F1-blocked, 33 reachable gaps" = 133), but the per-file tables underneath double-counted:
   `npv.ts` line 41 appears in the equivalent table (as "12 + 3 dead") *and* in the dead-code table
   (5 mutants), and `figures.ts` 33/88's "7 no-coverage" overlapped the F1-block list. This report
   gives each mutant exactly one classification, and the totals add to the recorded count exactly
   (64 + 18 + 31 = 113).
2. **One mutant coordinate was mis-grouped** in the earlier eurostat row (`49 (×3)` where the third
   mutant is on line 235). Corrected below.

---

## Precondition

`specs/001-pension-math/25-verification.md` exists and its most recent overall verdict
(attempt 3, phase 1) is **PASS**: scenario traceability 92/92, full suite 414/33, complexity gate
exit 0, design-principles gate PASS for the deliverable, scenario-to-behavior spot check PASS against
the built app. Mutation work ran on that basis; nothing below re-litigates it.

The working tree is dirty and every dirty entry is this pipeline's own uncommitted output
(`specs/`, `tests/`, `web/`, `app/`, `scripts/`, `data/`, `stryker.config.mjs`, `package.json`). Stage
5b commits them. Nothing was stashed, reverted or auto-committed; production code was **not** edited
by this stage. (During mutant-verification probing, `web/ingest/figures.ts` was temporarily mutated in
place and restored byte-identically — md5 `362a8f59156e3081c7b1f1f3ef9fe866` before and after — so
the tree that was measured is the tree that ships.)

---

## What changed since the previous report, and what is in scope

| # | Change | Files | Inside this stage's mutation scope? |
|---|---|---|---|
| 1 | Defect **F1** fixed: `SensitivityCell` carries `rPaidNominal`; the central cell is found by the swept nominal band centre instead of by comparing a deflated rate to a nominal one | `web/ingest/figures.ts`, `web/metrics/required-base-growth.ts` | **Yes** — re-measured below |
| 2 | Hero ladder swapped to `['fig-02','fig-01']`; a per-figure spec table resolves number, unit and label from the figure id | `web/components/public/hero-subject.ts`, `web/components/public/Hero.tsx` | **No** — `web/components/**` is outside the mutation scope (see below) |
| 3 | Percent-scale defect fixed: a `percentPoints` `ValueKind` added at the single formatting entry point | `web/content/format.ts`, `web/components/metrics/views.ts`, `web/components/metrics/view-support.ts` | **No** — `web/content/**` and `web/components/**` are outside the mutation scope |

**Explicitly stated rather than silently excluded:** changes 2 and 3 are real code changes that this
stage did **not** mutate, because the mutation scope is the calculation and validation surface
(`web/metrics|manifest|sources|ingest/**`), not the rendering surface. `web/content/format.ts` is a
presentation formatter and `web/components/**` is React/Next markup — mutating them proves nothing
about whether a published number is right. They are covered instead by the full suite (415 tests,
including the 19 percent-scale and 6 hero-ladder tests the Coder added) and by the Verifier's render
check against the built app (attempt 3). That is the same scope decision as the first run, unchanged,
not a new exclusion.

`mtime` audit of the whole in-scope surface confirms only the two F1 files changed after the previous
mutation run: every other in-scope file is older (`web/metrics/cohort-irr.ts` 22:34Z, `web/sources/*`
≤ 23:15Z, `web/ingest/run-compute.ts` 22:22Z, …) than the previous run's start. So the only in-scope
delta this refresh could possibly measure is F1, and that is what it measures.

---

## Mutation scope

A score without a scope is meaningless. Scope is the calculation and validation surface whose
correctness carries the product's claims — not the application shell.

**Mutated (28 files, 1846 mutants)** — unchanged from the first run; Stryker re-instruments the
current tree with the same globs and finds the same 28 files and the same mutant count.

| Area | Files | Why it is in scope |
|---|---|---|
| `web/metrics/**` | 8 | calculation kernels: ratio, share of GDP, cohort IRR, implicit debt, required base growth, growth rate, NPV/root finding, rounding |
| `web/manifest/**` | 6 | manifest validation, hashing, definition registry, formula registry, reproduce-path resolution |
| `web/sources/**` | 8 | ingest parsing (Eurostat JSON-stat, INE tempus3), unit conversion, year alignment, catalogue, labels, freshness |
| `web/ingest/**` | 6 | calculation and validation layer the committed scripts delegate to: figure table, compute harness, figure validation, deterministic JSON, derived-file IO |

**Excluded**

- `web/components/**`, `app/**` — React/Next surfaces (includes changes 2 and 3 above).
- `web/content/**` (includes `format.ts`, change 3) — presentation formatting.
- `data/**`, generated files, migrations, `web/content/data/**` — data, not code.
- `.standards/**` — submodule; out of scope and off-limits to pipeline agents.
- `scripts/*.ts` (7 files) — CLI entry points that perform their side effect at import time
  (`process.exit(main())`) and are only exercised as subprocesses; Stryker instruments modules inside
  the test runner's process, so a mutant there is a permanent 0 % that measures nothing. The
  calculation and validation logic those scripts delegate to lives in the four in-scope areas.

---

## Mutation configuration

`stryker.config.mjs` is unchanged by this refresh:

```
testRunner:      vitest
mutate:          web/metrics/**/*.ts, web/manifest/**/*.ts, web/sources/**/*.ts, web/ingest/**/*.ts
vitest.configFile: vitest.config.ts
coverageAnalysis: perTest
timeoutMS:       30000        timeoutFactor: 2      concurrency: 4
reporters:       clear-text, progress, json
jsonReporter:    reports/mutation/mutation.json
thresholds:      high 80, low 80, break null   (reported, not enforced — the verdict is written here)
disableTypeChecks: false      (vitest transpiles via oxc and never type-checks)
ignorePatterns:  .opencode, .standards, specs, .github, .githooks, .playwright-mcp,
                 data/pending, data/proposals, tsconfig.tsbuildinfo, runs.jsonl
```

**No mutator was disabled. No threshold was changed. No `// Stryker disable` comment was added.**
(`data/derived` and `data/snapshots` remain deliberately un-ignored — the ingest and gate tests read
them.)

Sandbox detail recorded for auditability: Stryker's dry run reports "Ran 401 tests" against the
project's 415. The 14 it does not execute live in three files — `tests/acceptance/admin-auth.test.ts`
(8), `tests/acceptance/fail-closed.test.ts` (4), `tests/acceptance/static-dynamic.test.ts` (2) — which
import no module in the mutated scope (they exercise the admin middleware and route plan), so they
map to zero in-scope mutants and cannot change the score. Their absence from the sandbox is a
coverage-mapping artefact, not a skipped test: all 415 run in the project suite below.

---

## Rounds run this refresh

Two rounds — the bound set for this refresh (threshold already met; this is a refresh, not a rescue).

| Round | Score (total) | Score (covered) | killed | timeout | survived | no coverage | runtime errors | ended (UTC) |
|---|---|---|---|---|---|---|---|---|
| 1 — baseline on the current tree (no test changes) | 93.67 % | 94.23 % | 1714 | 2 | 105 | 11 | 14 | 2026-10-26T08:03:35Z |
| 2 — after 1 added test | **93.83 %** | **94.40 %** | **1717** | **2** | **102** | **11** | **14** | 2026-10-26T08:16:47Z |

Score convention (Stryker's own): `(killed + timeout) / (total − runtimeErrors)`; `covered` further
excludes no-coverage mutants. The 14 runtime errors sit in each figure's `define({ … })` table entry
(7 figures × 2: the argument object literal, e.g. `figures.ts:128:17`, and its `figureId` literal,
e.g. `130:19`). `define()` resolves the published definition at module load, and several suites build
their compute report at collection time, so an emptied table entry surfaces as an unhandled run error
instead of a clean assertion failure — Stryker records those as runtime errors and excludes them from
the denominator. They are not untested behaviour: mutating `figureId: 'fig-01'` to `''` by hand makes
the project suite fail 5 of 14 tests in the two files that most directly exercise the figure table
(`vitest run tests/acceptance/dependency-ratio.test.ts tests/unit/figure-metadata-branches.test.ts`,
`figureId` restored byte-identically afterwards). It is a `perTest` adjudication limit, not a gap.

Round 2 killed exactly the three mutants it was written for, and nothing else changed:

| File:line | Mutator | Replacement | Round 1 | Round 2 |
|---|---|---|---|---|
| `web/ingest/figures.ts:221:39` | ConditionalExpression | `true` | Survived | **Killed** |
| `web/ingest/figures.ts:221:39` | EqualityOperator | `entry.year !== PROJECTION_HORIZON.from` | Survived | **Killed** |
| `web/ingest/figures.ts:224:66` | ArithmeticOperator | `last.year + first.year` | Survived | **Killed** |

Round-2 per-file result (verbatim from the run):

```
All files                 |  93.83 |   94.40 |     1717 |         2 |        102 |       11 |       14 |
 ingest                   |  94.72 |   95.83 |      574 |         0 |         25 |        7 |       14 |
  deterministic-json.ts   | 100.00 |  100.00 |       14 |         0 |          0 |        0 |        0 |
  figures.ts              |  94.47 |   95.92 |      188 |         0 |          8 |        3 |       14 |
  run-compute.ts          |  93.00 |   94.90 |      186 |         0 |         10 |        4 |        0 |
  types.ts                | 100.00 |  100.00 |       11 |         0 |          0 |        0 |        0 |
  validate-figure.ts      |  96.97 |   96.97 |      160 |         0 |          5 |        0 |        0 |
  write-derived.ts        |  88.24 |   88.24 |       15 |         0 |          2 |        0 |        0 |
 manifest                 |  95.61 |   95.82 |      436 |         0 |         19 |        1 |        0 |
  definitions.ts          |  92.23 |   93.14 |       95 |         0 |          7 |        1 |        0 |
  formula-ids.ts          |  92.86 |   92.86 |       13 |         0 |          1 |        0 |        0 |
  hash.ts                 |  93.94 |   93.94 |       31 |         0 |          2 |        0 |        0 |
  repo-file.ts            | 100.00 |  100.00 |       16 |         0 |          0 |        0 |        0 |
  validate.ts             |  96.90 |   96.90 |      281 |         0 |          9 |        0 |        0 |
 metrics                  |  93.62 |   94.26 |      278 |         1 |         17 |        2 |        0 |
  cohort-irr.ts           |  96.00 |   96.00 |       48 |         0 |          2 |        0 |        0 |
  contribution-cover.ts   | 100.00 |  100.00 |       38 |         0 |          0 |        0 |        0 |
  dependency-ratio.ts     | 100.00 |  100.00 |       40 |         0 |          0 |        0 |        0 |
  implicit-debt.ts        | 100.00 |  100.00 |       10 |         0 |          0 |        0 |        0 |
  npv.ts                  |  81.11 |   82.95 |       72 |         1 |         15 |        2 |        0 |
  pension-share.ts        | 100.00 |  100.00 |       36 |         0 |          0 |        0 |        0 |
  required-base-growth.ts | 100.00 |  100.00 |       29 |         0 |          0 |        0 |        0 |
  rounding.ts             | 100.00 |  100.00 |        5 |         0 |          0 |        0 |        0 |
 sources                  |  91.10 |   91.30 |      429 |         1 |         41 |        1 |        0 |
  countries.ts            |  93.22 |   93.22 |       55 |         0 |          4 |        0 |        0 |
  eurostat.ts             |  91.40 |   91.40 |      169 |         1 |         16 |        0 |        0 |
  freshness.ts            | 100.00 |  100.00 |       29 |         0 |          0 |        0 |        0 |
  ine.ts                  |  95.71 |   95.71 |       67 |         0 |          3 |        0 |        0 |
  labels.ts               |  78.72 |   78.72 |       37 |         0 |         10 |        0 |        0 |
  live.ts                 |  90.24 |   90.24 |       37 |         0 |          4 |        0 |        0 |
  load.ts                 |  82.14 |   85.19 |       23 |         0 |          4 |        1 |        0 |
  types.ts                | 100.00 |  100.00 |       12 |         0 |          0 |        0 |        0 |
```

---

## The F1-unblocked block, measured separately

The first report recorded **18 mutants** as un-killable because of F1:
`web/ingest/figures.ts` 224, 227, 228 (×3), 229 (×3), 240, 241, 246, 249, 250, 256, 277, 279 at the
pre-fix line numbers — the post-throw half of `baseGrowthValue` and the whole of `centralCellOf`.
Those mutants now have their own identifiers (`135, 136, 137, 139, 141, 142, 145, 146, 147, 149, 161,
162, 163, 164, 165, 166, 177, 178` in `web/ingest/figures.ts`), which is what the evidence block below
queries.

| Status | Pre-fix run (92.74 %) | This refresh (93.83 %) |
|---|---|---|
| Killed | 0 (all 18 un-killable) | **15** |
| Survived | 13 | 2 |
| No coverage | 5 | 1 |
| **Block score** | 0.00 % | **83.33 %** (15 / 18) — **100 % of the killable mutants** |

The three that are still not killed are all **equivalent**, not gaps:

| File:line | Mutator → replacement | Class | Why no test can distinguish it |
|---|---|---|---|
| `web/ingest/figures.ts:244:7` | ConditionalExpression → `false` (`if (!cell)` never throws) | equivalent | The guard is unreachable for the shipped constants: the grid is swept over `[band.min, band.central, band.max]`, so a cell with `rPaidNominal === centralNominal` always exists, and `DEFAULT_G_WAGE_SWEEP` contains `ASSUMED_REAL_WAGE_GROWTH` (the acceptance suite pins that at `required-base-growth.test.ts:224`). Removing the throw changes no observable behaviour while those invariants hold — and if they ever stopped holding, the suite fails on the invariant assertion, not on a mutant. |
| `web/ingest/figures.ts:244:30` | StringLiteral → `""` (the throw's message) | equivalent (no coverage) | Same branch: the `throw` cannot execute for the shipped constants, so no test ever evaluates the mutated message. |
| `web/ingest/figures.ts:261:14` | ObjectLiteral → `{}` (`horizon: { ...PROJECTION_HORIZON }` passed to `sensitivityGrid`) | equivalent | `sensitivityGrid` discards `value.horizon`: a cell carries only `gWage`, `rPaidNominal`, `rPaidReal`, `gRequired`, `gap`. The published central's `horizon` is set independently (`figures.ts:271`) and is asserted by two tests. So the swept horizon is unobservable. |

**F1 also made a nearby pair observable**, which the first report had filed as an ordinary reachable
gap (`figures.ts:221:39`, `ConditionalExpression → true` and `EqualityOperator → !==`). While the
compute body always threw, the projected growth rate was never asserted as a value — the only test
that reached it asserted "fails inside itself". Round 2's new test kills both.

**A third effect, not in the recorded block:** three mutants on the `cohort.central === null ||
cohort.band === null` guard (`figures.ts:252:7` `ConditionalExpression → true`, `252:7`
`EqualityOperator` on `cohort.central`, `252:34` `EqualityOperator` on `cohort.band`) were
*undetectably* survivable pre-fix because "always throw" was the observable behaviour either way. With
fig-05 computing, forcing that guard to always throw now fails the suite, so three of the six variants
died without any new test. The three that remain (`252:7` `LogicalOperator`, `252:7` and `252:34`
`ConditionalExpression → false`) are equivalent — see the table below.

| Change in status, pre-fix run → this refresh | Mutants |
|---|---|
| Killed by F1 being fixed (no new test) | 17 (`figures.ts` 136, 137, 139, 141, 142, 145, 146, 151, 155, 157, 161, 162, 164, 165, 166, 177, 178) |
| Killed by the round-2 test | 3 (`figures.ts` 121, 123, 135) |
| Newly visible and still equivalent | 3 (`figures.ts` 147, 149, 163 — the `244`/`261` rows above) |
| Non-killed then, still non-killed now, untouched by F1 | 110 |
| **Pre-fix non-killed → non-killed now** | **133 → 113** (133 − 17 − 3 = 113; of those 113, 3 are newly visible equivalents and 110 are unchanged) |

---

## Evidence: mutation score

command: npx stryker run
exit: 0
at: 2026-10-26T08:16:47Z

```
All files                 |  93.83 |   94.40 |     1717 |         2 |        102 |       11 |       14 |
JsonReporter  Your report can be found at: file:///home/dbueno/projects/pensions-system/reports/mutation/mutation.json
MutationTestExecutor  Done in 10 minutes and 7 seconds.
EXIT=0
```

Scope: 28 files under `web/metrics/**`, `web/manifest/**`, `web/sources/**`, `web/ingest/**`;
1846 mutants. Threshold for this tier: ≥ 80 %. Achieved **93.83 % total / 94.40 % covered**.
`EXIT=0`; `thresholds.break` is `null`, so a non-zero exit would have meant a tool failure, not a
threshold miss — the verdict is asserted in this report, not delegated to the CLI. This block is the
round-2 run (the one that reflects the tree described here); round 1's numbers are in the round table
above.

---

## Evidence: F1-unblocked block

command: python3 -c "import json,collections;d=json.load(open('reports/mutation/mutation.json'));ms={m['id']:m for m in d['files']['web/ingest/figures.ts']['mutants']};ids=['135','136','137','139','141','142','145','146','147','149','161','162','163','164','165','166','177','178'];print('F1 block:',dict(collections.Counter(ms[i]['status'] for i in ids)));print('non-killed:',[(ms[i]['location']['start']['line'],ms[i]['mutatorName']) for i in ids if ms[i]['status']!='Killed'])"
exit: 0
at: 2026-10-26T08:18:30Z

```
F1 block: {'Killed': 15, 'Survived': 2, 'NoCoverage': 1}
non-killed: [(244, 'ConditionalExpression'), (244, 'StringLiteral'), (261, 'ObjectLiteral')]
```

15 / 18 = **83.33 %** on the block, with all three survivors classified equivalent above; against the
killable set that is 15 / 15 = 100 %.

---

## Evidence: final full test suite

command: npx vitest run
exit: 0
at: 2026-10-26T08:21:33Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  33 passed (33)
      Tests  415 passed (415)
   Duration  3.02s
```

**415 tests across 33 files, exit 0**, none skipped or disabled — the Verifier's 414 plus the one
test this refresh added. This is the final run, executed after all mutation work, after the app build
and after the design-principles gate, so the number quoted is the tree that ships.

---

## Evidence: app still builds

command: npm run build
exit: 0
at: 2026-10-26T08:21:12Z

```
> pensions-system@0.0.0 prebuild
> tsx scripts/verify-derived.ts && tsx scripts/check-public-vocabulary.ts

derived figures verified: 7 (2 computed, 5 unavailable)
public vocabulary gate: clean (5 locales)

✓ Compiled successfully in 593ms
✓ Generating static pages using 11 workers (21/21) in 1411ms
```

`npx tsc --noEmit` exit 0 at 2026-10-26T08:17:09Z (no output). `npm run verify:derived` exit 0 at
2026-10-26T08:17:23Z (`derived figures verified: 7 (2 computed, 5 unavailable)`).

---

## Evidence: complexity gate (carried from the Refactorer, re-run here)

command: npx eslint .
exit: 0
at: 2026-10-26T08:17:07Z

```
(no output — clean)
```

`eslint.config.mjs` enforces `complexity: ['error', 6]`. Clean across the whole tree, including the
F1 fix (`web/ingest/figures.ts`, `web/metrics/required-base-growth.ts`) and the new test. The added
test introduced no nesting beyond the describe/it structure.

---

## Evidence: scenario traceability (re-run, unaffected)

command: .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-10-26T08:17:24Z

```
{ "checks": [1, 2], "passes": [ "AC-001-01 — traced to a test", …, "AC-001-92 — traced to a test" ], "fails": [] }
```

92/92 scenarios still traced, `fails: []`, check 2 clean. The new test cites `AC-001-31` (already
traced, and the scenario the F1 fix serves).

---

## Evidence: audit-trail gate

command: .standards/scripts/check-audit-trail.sh 001-pension-math
exit: 0
at: 2026-10-26T08:21:59Z

```
PASS 001-pension-math: 10-tasks.md present and non-empty
PASS 001-pension-math: 20-acceptance/ has an AC-*.md with a '## AC-NNN-NN' heading (AC-015-10)
PASS 001-pension-math: 25-verification.md present and non-empty
PASS 001-pension-math: 30-report.md present and non-empty
PASS 001-pension-math: 15-design.md present and non-empty (AC-015-13)
PASS 001-pension-math: 40-deploy.md absent — tolerated pre-5c (stage 5d re-runs with --require-deploy, AC-031-21)
PASS 001-pension-math: evidence block 'scenario traceability' — command: .standards/scripts/check-scenario-traceability.sh --json, exit: 0, at: 2026-10-25T22:38:30Z
PASS 001-pension-math: evidence block 'full test suite' — command: npx vitest run, exit: 0, at: 2026-10-25T22:39:00Z
PASS 001-pension-math: evidence block 'complexity gate' — command: npx eslint ., exit: 0, at: 2026-10-25T22:40:00Z
PASS 001-pension-math: evidence block 'design-principles gate' — command: .standards/scripts/check-code-principles.sh --tier production --json, exit: 1, at: 2026-10-25T22:42:00Z
PASS 001-pension-math: evidence block 'scenario-to-behavior spot check' — command: (manual read of 10 scenarios across 6 tasks; test files opened and assertions compared to the scenario Then-clauses), exit: 0, at: 2026-10-25T22:44:00Z
✔ Audit-trail check: specs/001-pension-math complete, verifier evidence recorded.
```

**Finding F2 from the previous report is closed.** The earlier `exit: 1` was a heading-spelling
mismatch (`scenario-to-behaviour` vs the gate's hardcoded `scenario-to-behavior`) in
`25-verification.md`; the Verifier corrected that heading at attempt 2 and the gate is green. Stage
5b's pre-push run of this gate will not block.

---

## Complexity summary (carried from the Refactorer)

- **Cyclomatic complexity ≤ 6:** `eslint.config.mjs` enforces `complexity: ['error', 6]`; ESLint
  exits 0 on the whole tree (re-confirmed above). The F1 fix — one added struct field plus a `.find`
  predicate change — added no branching.
- **Duplication:** `check-code-principles.sh --tier production` reports **0 DRY FAILs**. The DRY
  WARNs are 4-line markup blocks in `web/components/**` (outside this stage's scope) plus the
  `.standards` templates.
- **Design-principles gate:** exit 1 with **exactly one FAIL**,
  `.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`) — inside the
  `.standards/` submodule, out of scope and off-limits to pipeline agents. **Zero FAILs in project
  source.** Unchanged from the Verifier's attempt 3: 40 WARNs (29 project-source KISS/DRY review
  hints + 11 `.standards` template WARNs), line numbers shifted only by the F1 fix's added comment.
  Re-run with `.next` moved aside (`/tmp/opencode/next2`), because the gate SIGPIPEs on Next's
  chunks — a pre-existing gate defect the Verifier confirmed at attempt 1; `.next` was restored
  immediately afterwards (`PRINCIPLES_EXIT=1`, 1 FAIL / 40 WARNs, completed
  2026-10-26T08:21:26Z).
- **Property tests:** `tests/unit/properties.test.ts` uses `fast-check`; 0 property-test FAILs.
  Several `npv.ts` equivalents below are invariants that property suite already pins at value level.
- **WARN-level, carried forward unchanged:** the 29 project-source KISS/DRY WARNs (method bodies
  > 20 lines in admin pages and public components). Recorded, not blocking, per the Stop-and-Ask
  matrix ("Design gate WARN → record, do not stop").

---

## Surviving mutants

**113 of 1846 mutants were not killed: 102 survived + 11 no coverage.** (14 further mutants are
runtime errors, which Stryker excludes from the denominator.) Every one of the 113 is classified
below, and every classification is counted once — 64 equivalent + 18 unreachable/dead + 31 reachable
gaps = 113.

### Equivalent mutants (64) — no test can distinguish them

| File | Mutants | Count | Why it is un-killable |
|---|---|---|---|
| `web/metrics/npv.ts` 40, 42, 65:21 (×4), 65:54 (×3), 66, 86, 91 | 12 | 12 | The root is invariant to a positive rescaling of every flow, so `Math.max`→`Math.min` (40), `flow / scale`→`flow * scale` (42) and `Math.min`→`Math.max` on the tolerance (91) converge to the same rate (only the tolerance scale changes, by < 1e-15). `<=`→`<` at 65/65:54/66 and `<= Number.EPSILON`→`<`/`*2` differ only at an exact-equality boundary that float bisection never lands on. 86's `!== 1`→`=== 1` is masked by `initialBracket` returning null for the same inputs. |
| `web/sources/labels.ts` 6, 7, 18, 19, 29, 31, 33 (×3), 36 | 10 | 10 | Dropping `^` from `/^www\./` (6) and `\.`→`.` (6) are no-ops for the shipped catalogue; `split('')`/`join('')` (18, 19) transform both sides of every comparison identically; the `byDataset` short-circuit (29), the exact-host branch (31, 33) and its null guard (36) all fall through to the registered-domain lookup, which selects the *same* declaration for every URL in `SOURCE_DECLARATIONS`; `catch { }` (7) still yields a falsy value, which `if (!host)` handles. |
| `web/manifest/validate.ts` 131 (8 variants) | 8 | 8 | The `reproducePath` pass inside `manifestFieldProblems` is called with `fileExists = () => true`, so `checkReproducePath` can never produce `missingFile`; the `.filter(p => p.code !== 'missingFile')`, both arrow operands, the equality, the boolean and the `""` literal are all dead. |
| `web/ingest/figures.ts` 252 (×3), 244 (×2), 261 | 6 | 6 | 252: `cohort.central` and `cohort.band` are null under exactly the same condition (an empty grid, which happens iff nothing was paid in — `cohortIrr` returns null and every scaled contribution keeps the same sign), so guarding on either alone rejects the same case. 244/261: see the F1-block table — unreachable guard, and a horizon `sensitivityGrid` discards. |
| `web/manifest/definitions.ts` 24, 172, 174 (×4) | 6 | 6 | `renderingOf(internationalDefinitionFor(metric) ?? firstDefinitionOf(metric), …)`: for every metric with an international definition it *is* the first definition of that metric, so the `??` fallback resolves to the same object; for the national-only metrics `find` already returned `undefined`. Mutating the predicate or its body to a constant yields the identical definition. |
| `web/sources/countries.ts` 64 (×2), 110 (×2) | 4 | 4 | `isPublishedGeo` is already gated by the closed `PUBLISHED_GEOS` list, so weakening `&&`/`!== undefined` changes no answer for any input the API can be asked. In `sourcesForDefinition`, `sourceIds.length >= 0` is vacuous because a national definition's lookup is `undefined` (falsy) and returns `null` before the length check matters. |
| `web/sources/live.ts` 27 (×2), 43, 56 | 4 | 4 | `LIVE_URLS` only contains declared source ids, so the `if (!source) continue` guard and the `find` predicate in `declaration()` cannot take their other branch. `/\.\d{3}Z$/`→`/\.\d{3}Z/` is a no-op because `toISOString()` always puts the millisecond group at the end. |
| `web/sources/ine.ts` 23, 45, 50 | 3 | 3 | Replacing the `typeof payload !== 'object'` operand with `false` leaves the sibling `payload === null` / `!Array.isArray` / entry-shape checks catching exactly the same inputs; every rejected input still rejects. |
| `web/metrics/cohort-irr.ts` 66 (×2) | 2 | 2 | `<= 0`→`< 0` differs only at exactly zero contribution, where the sign-change gate already returns `null`, so both forms report `undefined`. |
| `web/manifest/hash.ts` 14, 20 | 2 | 2 | Dropping the `typeof value === 'string'` operand leaves the closed-set/pattern check, which rejects the same non-strings. `/\.\d{3}Z$/`→`/\.\d{3}Z/` is a no-op for the same reason as `live.ts`. |
| `web/ingest/validate-figure.ts` 29, 122 (×2) | 3 | 3 | `typeof value === 'string' && includes` — the membership test alone rejects the same non-strings. In `definitionProblems`, `identity.length > 0` is true whenever `isDefinitionId` is false (an unknown id always produced a problem in `definitionIdProblem`s), so the `&&`/`false` forms return the same early result. |
| `web/ingest/run-compute.ts` 65, 128 | 2 | 2 | In `resolveSources`, the `missingForCountry` branch is evaluated first in `unfinishedOutcome`, so the empty `sourceIds` array it returns is never consumed. `parsed <= oldest` assigns the same instant as `parsed < oldest` when timestamps are equal. |
| `web/ingest/write-derived.ts` 22 | 1 | 1 | `writeFileSync` accepts a `Buffer`; omitting `'utf8'` writes the same bytes a utf8 read then decodes, so the round-trip is byte-identical. |
| `web/manifest/formula-ids.ts` 17 | 1 | 1 | Same shape as `hash.ts` 14: the `includes`/pattern check alone rejects every input the `typeof` guard rejected. |

### Unreachable / dead code (18)

| File | Mutants | Count | Why unreachable |
|---|---|---|---|
| `web/ingest/figures.ts` 33 (×3), 88 (×2) | 5 | 5 | `payload()`'s throw is unreachable through `FIGURES`: every requirement source is inspected before `compute` runs, so the input map only ever holds resolved snapshots and no compute body asks for a source outside its own `requirementSources`. `spanOf`'s empty-array branch is dead because `alignedYears` throws on an empty alignment first. |
| `web/ingest/run-compute.ts` 95, 209, 292, 347 | 4 | 4 | The `?? 'outside freshness window'` fallback is unreachable (`evaluateFreshness` always supplies a reason when `fresh` is false), the `?? 'input'` fallback is unreachable (every failure carries a `sourceId`), `'compute failed'` needs a non-`Error` throw, and `hashInputBytes` has no production caller. |
| `web/metrics/npv.ts` 41 (×5) | 5 | 5 | `if (scale === 0) return {flows: [...], scale: 1}` is unreachable: an all-zero flow set has zero sign changes and returns `null` first. |
| `web/manifest/definitions.ts` 195 (×2) | 2 | 2 | `firstDefinitionOf` can only throw for a metric outside `MetricId`, a closed union; no caller can reach it. |
| `web/ingest/write-derived.ts` 6 | 1 | 1 | `DERIVED_DIR` is a re-export with no reader inside the mutated scope. |
| `web/sources/load.ts` 39 | 1 | 1 | The `dir = 'data/snapshots'` default is never taken; the script passes its own path. |

5 + 4 + 5 + 2 + 1 + 1 = **18**. (The `validate.ts` 131 `missingFile` filter is also dead code — for
the `fileExists = () => true` reason given in the equivalent table — but it is counted there, once.)

### Reachable residual gaps (31) — named with the assertion that would kill each

Real gaps, not equivalents. The first report listed 33; the two `figures.ts:221` mutants on that list
became observable once F1 was fixed and are now killed (round 2), leaving these 31. They are recorded
rather than chased because the refresh budget is two rounds and the gate is met with margin.

| File:line | Mutants | What would kill it |
|---|---|---|
| `web/sources/eurostat.ts` 44, 49 (×2), 56, 58 (×3), 77, 91, 102, 172 (×2), 175, 180 (×2), 235 | 16 | assert `IngestError.name`; a payload whose `dimension` object is absent (exercises the `?.` chain and the `?? {}` fallback); a payload with `value` but no `id`/`size`; a labels map that is upper-case only; a two-element series asserted in ascending order plus an order check on `codesFor`'s sort |
| `web/ingest/run-compute.ts` 162, 210, 216, 234, 249, 270, 294, 325 | 8 | assert the manifest hash for the no-snapshot case (pins the literal `missing` token); a two-problem reason string (pins the `'; '` separator); a failure with no `sourceId`; and `unresolvedSources: []` on the computed / manifest-invalid / unconfigured-country paths |
| `web/sources/load.ts` 21, 32, 47, 48 | 4 | a file with neither `resolved` nor `payload` (defaults to unresolved); `bytes` asserted as a string; readdir order forced to differ from sorted order; non-ASCII bytes compared exactly |
| `web/ingest/validate-figure.ts` 57, 120 | 2 | a candidate with valid `availability` but no `figureId`, asserting `figureId: 'unknown'` in both the manifest and definition problem lists |
| `web/manifest/validate.ts` 113 | 1 | reach `asRecord`'s `Array.isArray` operand with a non-array object whose fields are all valid |

None of these affects the verdict: 93.83 % clears the 80 % threshold with margin, and the residual set
is concentrated in defensive fallbacks and error-message text rather than in a calculation. The
highest-value next step, if the owner wants a higher score, is the 16-mutant `eurostat.ts` cluster —
JSON-stat shape handling, which is where a real ingest regression would most plausibly hide.

---

## Tests added by this refresh

**1 test, in 1 existing file.** No existing test was modified, weakened, renamed or deleted.

| File | Tests | Covers |
|---|---|---|
| `tests/acceptance/required-base-growth.test.ts` (new `describe('projected growth from the population projection (T7)')`) | 1 | `AC-001-31`: `g_proj` annualises the horizon endpoints — asserts `value.central.gProj === annualisedGrowthRate(40_000_000, 32_000_000, 44)` plus a literal pin `≈ -0.005058606285837319`, on a projection carrying decoy years *before* the horizon (2010) and *inside* it (2050), and asserts the decoy-derived rates are distinguishable from the published one; finally pins that `assumptions.gProj` is the same number the central value carries |

Why this test and not another: it is the specific missing assertion the F1 unblocking exposed. The
existing fig-05 test only asserted `gProj < 0`, which every lookup variant satisfies (2010→2070 over
60 years is still negative; 2026→2070 with the endpoints *summed* is still negative at
-5.45e-5 vs -5.06e-3). Pinning the exact value — and proving the decoys are far enough apart to be
distinguishable — is what turns "negative" into "the right negative". Verified before the round-2
run: each of the three mutations was applied to `web/ingest/figures.ts` in turn and the new test
failed on all three (exit 1, 1 failed / 9 passed), and the file was restored byte-identically
(md5 checked).

---

## What this stage did not touch

- **No production code was edited.** The F1 fix, the hero-ladder change and the percent-scale fix
  belong to the Coder/Refactorer stages; this stage only measured them (and temporarily mutated
  `figures.ts` for mutant verification, restored byte-identically).
- **No gate config was changed.** `stryker.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`,
  `.gitignore` and `.standards/**` are untouched. No mutator disabled, no threshold moved, no
  `// Stryker disable` comment.
- **Nothing was committed or pushed.** That is stage 5b's job.
- `reports/mutation/mutation.json` is left in place as the machine-readable evidence for this report;
  `.stryker-tmp/` is gitignored and cleaned by the run.

---

## Remediation record

**Stage 5a, this refresh: none** — no BLOCK occurred during this stage. The mutation gate never
reported BLOCK, and the two rounds were a baseline plus one test-strengthening pass, not a
fix-and-retry loop against a failing gate. Both rounds exited 0.

**Carried forward from `25-verification.md` (not guessed, not invented):**

| Phase | Attempt | Trigger | Outcome |
|---|---|---|---|
| 1 (pre-PR) | 1 | first full run | PASS |
| 1 (pre-PR) | 2 | finding F1 (this stage's first report) — `centralCellOf` compared a deflated rate to a nominal band centre | PASS after the Coder's fix; three pre-existing assertions adjudicated legitimate (1 shape pin, 2 that encoded the defect). Budget state recorded at that attempt: `SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=1`, `SPEC_PHASE2_RETRIES=0` |
| 1 (pre-PR) | 3 | hero ladder swap + percent-scale fix | PASS; state `SPEC_LOOP_COUNT=2`, `SPEC_PHASE1_RETRIES=2`, `SPEC_PHASE2_RETRIES=0` |

So: **two Phase 1 BLOCKs, both resolved in Phase 1, at attempts 2 and 3** — Phase 1 budget used 2 of
3. **Phase 2 (post-PR CI): no attempts** — the PR has not been opened yet. Phase 3 (deploy
verification) has not run. The orchestrator supplied no loop summary beyond
`25-verification.md`'s attempt headers, and none is inferred here.

---

## Flagged to the next stage

1. **F1 is closed and verified.** The block that the previous report had to mark "un-killable by any
   passing test" is now 15/18 killed with the remaining 3 proven equivalent. The 18-mutant caveat is
   gone from the score.
2. **F2 is closed.** `check-audit-trail.sh` now exits 0 (evidence block above), so stage 5b's pre-push
   gate will not block on it.
3. **Changes 2 and 3 (hero ladder, percent scale) were not mutated** — and cannot meaningfully be,
   under this scope. Their evidence is the 25 tests the Coder added plus the Verifier's render check
   against the built app. If the owner wants mutation coverage of `web/content/format.ts`, that is a
   scope change (a new `mutate` glob), and it should be a deliberate decision, not a silent widening.
4. **31 reachable residual mutants**, itemised above with the assertion that would kill each — a
   candidate for a later pass if the owner wants a score above 93.83 %.
5. **Carried forward unchanged from the Verifier**: 29 project-source WARNs (KISS method bodies, DRY
   4-line blocks) in admin pages and public components, and one out-of-scope FAIL inside
   `.standards/`.
6. **`25-verification.md`'s attempt-3 block is the verification of record** for the tree this report
   measures. If code changes again before stage 5b, this report is stale and must be re-run — the
   mutation score is a property of a tree, not of a spec number.

---

**Verdict: GREEN**

Mutation score **93.83 % total / 94.40 % covered** on the stated 28-file scope, threshold ≥ 80 %:
1846 mutants, 1717 killed + 2 timed out, 102 survived and 11 uncovered (64 equivalent, 18
unreachable/dead, 31 reachable residuals named), with 14 runtime errors excluded by the tool. The
F1-unblocked block measures **83.33 % (15/18, 100 % of its killable mutants)**, up from 0 % when the
first report was written. Final suite **415/415 green across 33 files**, app builds, `tsc` and ESLint
clean, traceability 92/92 intact, audit-trail gate exit 0.

---

## PR

PR: https://github.com/RexiAI/pensions-system/pull/3

Commits: 16 (one per task T1–T16; 17 including this record commit).

Opened as a draft against `main` from `spec/001-pension-math`. The spec is **not** archived in
this PR — `scripts/archive-spec.sh 001-pension-math` is stage 5d, which runs after the stage 5c
deploy verification. `scripts/check-specs-archived.sh` therefore exits 1 at this stage
(`001-pension-math is finished … but not archived`), which is the expected intermediate state;
the repo's own `ci.yml` does not run that gate.
