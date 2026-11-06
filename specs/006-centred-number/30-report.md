# Mutation report — 006-centred-number

**Stage:** 5a, Mutation Runner
**Branch:** `spec/006-centred-number`
**Date:** 2026-11-06
**Tier:** `production` (`AGENTS.md` §Conformance tier) — mutation testing is a `production`-tier
gate, so it was run, not skipped.
**Precondition:** `25-verification.md` **attempt 4, phase 1, cycle 3 of 3 — PASS**. Read before
any work started. No gate was re-run as a substitute for it, and no report artifact existed
before this one.

## Result

| Row | Verdict |
|---|---|
| Verifier's verdict (carried forward) | **PASS** — attempt 4, phase 1 cycle 3 of 3 (113 files / 1056 tests, `tsc` 0) |
| Mutation score (reproducible) | **95.62 %** (415 killed / 434 valid) — floor 80 % |
| Mutation score (baseline, this stage's first run) | 91.71 % (398 / 434) |
| Improvement | **+3.91 points**, +17 mutants killed |
| Surviving mutants | 19 — **all equivalent**, none a testable gap (named below) |
| Final test status | **116 files / 1068 tests passed**, exit 0 |
| `npx tsc --noEmit` | **exit 0** |
| Report verdict | **GREEN** |

Scope was an explicit `--mutate` list over the six source files this spec changes, with
`stryker.config.mjs`'s standing coverage and thresholds left untouched:

```
scripts/check-scenario-traceability-3digit.ts
web/components/public/NumberStep.tsx
web/components/series/PyramidPlate.tsx
web/components/series/PyramidPanel.tsx
web/content/site.ts
web/series/clock.ts
```

`web/components/series/CountdownClock.tsx` and `web/series/clock-ticker.ts` are deleted by Task
12 and so have nothing left to mutate.

## Evidence: mutation score, baseline

command: npx stryker run --mutate "scripts/check-scenario-traceability-3digit.ts,web/components/public/NumberStep.tsx,web/components/series/PyramidPlate.tsx,web/components/series/PyramidPanel.tsx,web/content/site.ts,web/series/clock.ts"
exit: 0
at: 2026-11-06T14:02:49Z

The process was backgrounded, so its exit status was not captured directly; the completed JSON
report and the `Done in 12 minutes and 46 seconds` line are the evidence that the run finished
clean, and `stryker.config.mjs` sets `thresholds.break: null`, so a survivor never fails the
process.

```
Found 6 of 395 file(s) to be mutated.
Instrumented 6 source file(s) with 456 mutant(s)
DryRunExecutor  Initial test run succeeded.

                                        | % Mutation score |          |           |            |          |          |
File                                    |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                               |  91.71 |   92.77 |      398 |         0 |         31 |        5 |       22 |
 scripts                                |  91.28 |   93.15 |      136 |         0 |         10 |        3 |        4 |
  check-scenario-traceability-3digit.ts |  91.28 |   93.15 |      136 |         0 |         10 |        3 |        4 |
 web                                    |  91.93 |   92.58 |      262 |         0 |         21 |        2 |       18 |
  components                            |  90.36 |   91.28 |      178 |         0 |         17 |        2 |        0 |
   public                               |  82.05 |   84.21 |       32 |         0 |          6 |        1 |        0 |
    NumberStep.tsx                      |  82.05 |   84.21 |       32 |         0 |          6 |        1 |        0 |
   series                               |  92.41 |   92.99 |      146 |         0 |         11 |        1 |        0 |
    PyramidPanel.tsx                    |  97.62 |   97.62 |       82 |         0 |          2 |        0 |        0 |
    PyramidPlate.tsx                    |  86.49 |   87.67 |       64 |         0 |          9 |        1 |        0 |
  content                               | 100.00 |  100.00 |       35 |         0 |          0 |        0 |       18 |
   site.ts                              | 100.00 |  100.00 |       35 |         0 |          0 |        0 |       18 |
  series                                |  92.45 |   92.45 |       49 |         0 |          4 |        0 |        0 |
   clock.ts                             |  92.45 |   92.45 |       49 |         0 |          4 |        0 |        0 |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
MutationTestExecutor  Done in 12 minutes and 46 seconds.
```

`reports/mutation/mutation.json` left by the aborted earlier attempt was stale; it was not
resumed. Its numbers happened to match this run exactly, which is the only evidence that the
six files did not move between the two attempts.

## Evidence: mutation score, after the kill tests

command: npx stryker run --mutate "scripts/check-scenario-traceability-3digit.ts,web/components/public/NumberStep.tsx,web/components/series/PyramidPlate.tsx,web/components/series/PyramidPanel.tsx,web/content/site.ts,web/series/clock.ts"
exit: 0
at: 2026-11-06T16:19:46Z

```
Instrumented 6 source file(s) with 456 mutant(s)

                                        | % Mutation score |          |           |            |          |          |
File                                    |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                               |  95.62 |   95.84 |      415 |         0 |         18 |        1 |       22 |
 scripts                                |  97.32 |   97.32 |      145 |         0 |          4 |        0 |        4 |
  check-scenario-traceability-3digit.ts |  97.32 |   97.32 |      145 |         0 |          4 |        0 |        4 |
 web                                    |  94.74 |   95.07 |      270 |         0 |         14 |        1 |       18 |
  components                            |  94.42 |   94.90 |      186 |         0 |         10 |        1 |        0 |
   public                               |  84.62 |   86.84 |       33 |         0 |          5 |        1 |        0 |
    NumberStep.tsx                      |  84.62 |   86.84 |       33 |         0 |          5 |        1 |        0 |
   series                               |  96.84 |   96.84 |      153 |         0 |          5 |        0 |        0 |
    PyramidPanel.tsx                    |  98.81 |   98.81 |       83 |         0 |          1 |        0 |        0 |
    PyramidPlate.tsx                    |  94.59 |   94.59 |       70 |         0 |          4 |        0 |        0 |
  content                               | 100.00 |  100.00 |       35 |         0 |          0 |        0 |       18 |
   site.ts                              | 100.00 |  100.00 |       35 |         0 |          0 |        0 |       18 |
  series                                |  92.45 |   92.45 |       49 |         0 |          4 |        0 |        0 |
   clock.ts                             |  92.45 |   92.45 |       49 |         0 |          4 |        0 |        0 |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
MutationTestExecutor  Done in 12 minutes and 20 seconds.
```

### Why 95.62 % and not the 95.85 % a later run printed

The same command re-run at `2026-11-06T16:39:31Z` (exit 0) reported **95.85 %** — 416 killed,
17 survived. The entire delta is one mutant, `NumberStep.tsx:50:7`, whole-condition
`countdown.state !== 'computed' || countdown.anchor === null` → `false`. That mutant is
**logically equivalent** (§Equivalent mutants, E-4), so no assertion can kill it; two isolated
reruns of the same file, `npx stryker run --mutate "web/components/public/NumberStep.tsx"` at
`16:40:41Z` and `16:42:23Z`, both reported it **survived** (33 killed / 5 survived / 1 no coverage,
twice). The 416 is a false kill: a test *run* failed — the documented harness hook-timeout flake
(W-2 / verification attempt 2) is recorded by Stryker as detection even when no assertion fails.
**95.62 % is the reproducible figure** and the one reported. Both runs clear the 80 % floor.

`reports/mutation/mutation.json` on disk is the later, 95.85 % run; `reports/` is gitignored, so
it is a local artifact, not part of the branch.

### Per file

| File | Before | After | Δ killed |
|---|---|---|---|
| `scripts/check-scenario-traceability-3digit.ts` | 136/149 = **91.28 %** | 145/149 = **97.32 %** | +9 |
| `web/components/public/NumberStep.tsx` | 32/39 = **82.05 %** | 33/39 = **84.62 %** | +1 |
| `web/components/series/PyramidPlate.tsx` | 64/74 = **86.49 %** | 70/74 = **94.59 %** | +6 |
| `web/components/series/PyramidPanel.tsx` | 82/84 = **97.62 %** | 83/84 = **98.81 %** | +1 |
| `web/content/site.ts` | 35/35 = **100.00 %** | 35/35 = **100.00 %** | 0 |
| `web/series/clock.ts` | 49/53 = **92.45 %** | 49/53 = **92.45 %** | 0 |
| **All files** | **398/434 = 91.71 %** | **415/434 = 95.62 %** | **+17** |

## Survivors and verdicts

Nineteen mutants are not killed: 18 `Survived`, 1 `NoCoverage`. Every one is equivalent — the
mutation cannot change behaviour for any input the production call graph can produce. None is an
untested behaviour.

| # | File:location | Mutator | Verdict | Why |
|---|---|---|---|---|
| E-1 | `NumberStep.tsx:36:49` | StringLiteral `''` → `"Stryker was here!"` | **equivalent** | `NumberGroup` is private and has one call site, `measured()`'s result (L99). `measured` returns a countdown only when `readClock(anchor)` found a future anchor, so `countdown.anchor` is never null there and the `??` right operand is never evaluated. This is also why the mutant is `NoCoverage`. |
| E-2 | `NumberStep.tsx:37:69` | StringLiteral `''` → `"Stryker was here!"` (null label) | **equivalent** | `formatValue`'s `nullLabel` is returned only for `null`/`NaN`; `readClock().days` is always a number. |
| E-3 | `NumberStep.tsx:50:7` | ConditionalExpression → `false` (the `state` operand), LogicalOperator `\|\|`→`&&`, ConditionalExpression `50:41` → `false` | **equivalent** (3 mutants) | `CountdownValue['state']` is exactly `'computed' \| 'not-crossed'`; `NumberBody` returns for `'not-crossed'` before calling `measured` (L85–91), so the state test is always false at the only call site. An `anchor === null` countdown is caught one line later: `readClock(null)` parses to `NaN`, is non-finite, and returns `elapsed: true`, so `measured` still returns `undefined`. |
| E-4 | `NumberStep.tsx:50:7` | ConditionalExpression, whole condition → `false` | **equivalent** | Same proof as E-3, for the whole-guard form. This is the mutant the 95.85 % run falsely killed. |
| E-5 | `PyramidPlate.tsx:17:72` | StringLiteral `'table.notDefined'` → `''` | **equivalent** | `formatValue`'s `nullLabel` is unreachable: `percentPoints` takes a `number`. |
| E-6 | `PyramidPlate.tsx:42:7` | LogicalOperator `\|\|`→`&&` | **equivalent** | `years` is an array: length 0 makes both `!first` and `!last` true; length ≥ 1 makes both false. `!first && !last` and `!first \|\| !last` agree on every array. |
| E-7 | `PyramidPlate.tsx:94:95` | StringLiteral `''` → `"Stryker was here!"` (null label) | **equivalent** | `year.population` is a `number`; the null label is unreachable. |
| E-8 | `PyramidPlate.tsx:118:30` | StringLiteral `'table.notDefined'` → `''` | **equivalent** | `DataTable` reads `nullLabel` only for a `null` cell; every row cell comes from `percentPoints`, which returns a string. |
| E-9 | `check-scenario-traceability-3digit.ts:45:11` | BlockStatement `catch` body → `{}` | **equivalent** | Falling through executes `return walk(dir, extensions).sort()`. `walk` catches the same `statSync` failure (`ENOENT`) and, for a non-directory, `readdir`'s `ENOTDIR`, returning `[]` in both cases. |
| E-10 | `check-scenario-traceability-3digit.ts:43:7` | BlockStatement `try` body → `{}` | **equivalent** | Same reason as E-9: the `isDirectory` guard only pre-empts a path whose `walk` returns `[]` anyway. |
| E-11 | `check-scenario-traceability-3digit.ts:44:9` | ConditionalExpression `!statSync(dir).isDirectory()` → `false` | **equivalent** | Same reason as E-9. |
| E-12 | `check-scenario-traceability-3digit.ts:60:11` | ConditionalExpression `if (match[1])` → `true` | **equivalent** | `SCENARIO_HEADING`'s capture group is mandatory in the pattern, so `match[1]` is always a defined string when the branch is reached. |
| E-13 | `clock.ts:42:7` | ConditionalExpression → `false` (×2), LogicalOperator `\|\|`→`&&`, ConditionalExpression `42:33` → `false` | **equivalent** (4 mutants) | The guard is redundant: the next line is `if (!Number.isInteger(thresholdYear)) return null`, and `Number.isInteger(null)` and `Number.isInteger(undefined)` are both `false`. Every input reaches the same `null`. |
| E-14 | `PyramidPanel.tsx:102:58` | StringLiteral `''` → `"Stryker was here!"` (null label) | **equivalent** | `AXIS_TICKS` is `[2, 4]`; a tick is always a number, so the null label is unreachable. |

### Runtime errors (`# errors` = 22) are not gaps

`site.ts` reports 18 `RuntimeError` mutants and the gate 4. These are mutants whose test run
aborts **outside** a test — the module's own import-time guard fires while the suite loads:

```
StringLiteral L12 ('https://pensions-system-delta.vercel.app' → '')
  An error occurred outside of a test run: .../tests/acceptance/spec-005-mechanism-fact.test.ts:
  SITE_URL is not an absolute URL:
```

Stryker cannot attribute that to a test, so it excludes them from the score rather than counting
them killed. `site.ts` still scores 100 % on the 35 valid mutants, and `AC-006-34` plus the
`AC-001-35` import cases do assert the throw — the invalid mutants are a reporting artifact of a
module that fails loudly at import, not an unasserted branch.

## Tests written

All in the project's existing style: rendered output or the gate's own public report, fixtures
built from the committed snapshots, scenario ids reused from the scenario the assertion serves.
No production file was edited.

| Test | Kills |
|---|---|
| `tests/unit/spec-006-mutation-kills.test.ts` — `AC-006-32: a computed countdown with no anchor writes the empty date` | `NumberStep.tsx:17:41` |
| `tests/unit/spec-006-mutation-kills.test.ts` — `AC-004-19: a computed series with a null value renders nothing instead of throwing` | `PyramidPlate.tsx:140:7` (`\|\|`→`&&`, `value === null` → `false`) |
| `tests/unit/spec-006-mutation-kills.test.ts` — `AC-004-19: an unavailable series renders nothing even when a stale value is attached` | `PyramidPlate.tsx:140:7` (`availability !== 'computed'` → `false`) |
| `tests/unit/spec-006-mutation-kills.test.ts` — `AC-001-97: a missing band reads as the zero share, not as an unformatted value` | `PyramidPlate.tsx:64:66` |
| `tests/unit/spec-006-mutation-kills-gate.test.ts` — `AC-001-119: a docs/changes path that is a plain file declares nothing` | `…3digit.ts:44:46` |
| `tests/unit/spec-006-mutation-kills-gate.test.ts` — `AC-001-119: an acceptance directory outside specs does not declare a scenario` | `…3digit.ts:54:30` |
| `tests/unit/spec-006-mutation-kills-gate.test.ts` — `AC-001-119: a markdown file beside docs/changes does not declare a scenario` | `…3digit.ts:55:38` |
| `tests/unit/spec-006-mutation-kills-gate.test.ts` — `AC-001-119: a TypeScript file outside tests is not a citation` | `…3digit.ts:69:44` |
| `tests/unit/spec-006-mutation-kills-gate.test.ts` — `AC-001-119: a process with no argv entry imports the module without throwing` | `…3digit.ts:186:3` |
| `tests/unit/spec-006-mutation-kills-gate-order.test.ts` — `AC-001-119: the citation is recorded against the first path of the sorted walk` | `…3digit.ts:48:10`, `…3digit.ts:72:11` |
| `tests/unit/spec-006-mutation-kills-gate-order.test.ts` — `AC-001-119: a readdir that throws is an empty listing` | `…3digit.ts:32:11`, `…3digit.ts:33:12` |
| `tests/unit/spec-006-mutation-kills-dom.test.ts` — `AC-006-27: the readout and the age gutter reconcile without a duplicate-key warning` | `PyramidPlate.tsx:25:56`, `PyramidPlate.tsx:29:56`, `PyramidPanel.tsx:165:16` |

Two notes on method:

- **The ordering test drives the filesystem rather than trusting it.** Which file wins a
  duplicated citation id is only observable through readdir order, and asserting on whatever the
  host filesystem happens to return would be a coin-flip kill. `spec-006-mutation-kills-gate-order.test.ts`
  replaces `readdirSync` for that file alone (`vi.mock('node:fs')`, real module otherwise) and
  reverses the listing, so a missing `sort` is deterministic. The gate's own code is unchanged.
- **The DOM test exists because a `key` never reaches the document.** The readout's six items and
  the age gutter's 21 `<text>` nodes are lists; flattening their keys makes React emit a
  duplicate-key warning. That is the only surface a key mutation has, so the assertion is on it —
  with the render itself still checked (6 readout items, 21 age labels).

### Mutation-check: each new test fails against the mutation it targets

command: scratch harness, per case: write the mutation into the production file, `npx vitest run <file> -t <filter>`, restore, compare sha256
exit: 1 for each of the 17 mutations that had to be detected; one further candidate was correctly *not* detected (below) and was dropped. Every source restored byte-identically (sha256 checked on each case).
at: 2026-11-06T16:52:00Z

| Mutation | Result |
|---|---|
| `NumberStep.tsx` `anchor ?? ''` → `anchor ?? 'Stryker was here!'` | **FAIL** — sentence text differs |
| `PyramidPlate.tsx` `\|\|` → `&&` in the availability guard | **FAIL** — render throws `reading 'years'` |
| `PyramidPlate.tsx` `availability !== 'computed'` → `false` | **FAIL** — unavailable series renders |
| `PyramidPlate.tsx` `value === null` → `false` | **FAIL** — render throws |
| `PyramidPlate.tsx` band filler `{ band, male: 0, … }` → `{}` | **FAIL** — cells read `NaN` |
| `…3digit.ts` walk `catch {}` | **FAIL** — `undefined.sort()` |
| `…3digit.ts` walk `catch` → placeholder path | **FAIL** — `ENOENT` reading a bogus path |
| `…3digit.ts` filesUnder non-directory `[]` → placeholder | **FAIL** — `ENOENT` reading a bogus path |
| `…3digit.ts` `.sort()` dropped (reversed listing) | **FAIL** — `tests/z.test.ts` wins instead of `tests/a.test.ts` |
| `…3digit.ts` `'specs'` → `''` | **FAIL** — the out-of-tree acceptance directory declares a scenario |
| `…3digit.ts` `'changes'` → `''` | **FAIL** — `docs/notes.md` declares a scenario |
| `…3digit.ts` `'tests'` → `''` | **FAIL** — `scripts/helper.ts` cites a scenario |
| `…3digit.ts` `if (!cited.has(id))` → `if (true)` | **FAIL** — last file wins |
| `…3digit.ts` `process.argv[1] !== undefined` → `true` | **FAIL** — `pathToFileURL(undefined)` throws on import |
| `PyramidPlate.tsx` readout key flattened (×2) | **FAIL** — duplicate-key warning |
| `PyramidPanel.tsx` age-label key flattened | **FAIL** — duplicate-key warning |

One candidate was **rejected** by this check: emptying `filesUnder`'s `catch` body does not fail
any test, because the fall-through `walk` returns `[]` for the same paths. It is equivalent (E-9),
and the test that would have claimed the kill was removed rather than kept as a paper kill.

## Evidence: final test status

command: npm test
exit: 0
at: 2026-11-06T16:48:58Z

```
> pensions-system@0.0.0 test
> vitest run

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  116 passed (116)
      Tests  1068 passed (1068)
   Start at  17:47:53
   Duration  62.68s (tests 90%, import 8%, environment 1%, transform 1%)
```

116 files / 1068 tests, 0 failed, 0 skipped. The 1056 → 1068 delta is exactly the 12 tests
added here (+4 in the existing `spec-006-mutation-kills.test.ts`, +5 gate, +2 gate-order, +1 DOM);
the 113 → 116 file delta is the three new test files.

## Evidence: type check

command: npx tsc --noEmit
exit: 0
at: 2026-11-06T16:48:58Z

```
(no output)
```

`tsc` caught one real defect in the new suite before it shipped — the `process.argv` test assigned
`undefined` to a `string[]` element (TS2322). Fixed with an explicit narrowing cast; the affected
mutant was re-checked afterwards and is still killed.

## Complexity summary, carried from the Refactorer

The Refactorer leaves no artifact; the figures below are the ones `25-verification.md` re-ran
independently on this tree (attempt 1 §Evidence: complexity gate, attempt 4 §prior gates hold):

| Gate | Result | Source |
|---|---|---|
| ESLint `complexity: ['error', 6]` (cyclomatic ≤ 6) | 0 violations, whole repo and the changed files | verification attempt 1 / attempt 4 |
| `check-code-principles.sh` complexity heuristic | 0 FAIL | verification attempt 1 (0 FAIL / 213 WARN repo-wide; 0 FAIL / 7 WARN scoped `-BaseRef main`) |
| Duplication (DRY), YAGNI, SOLID | 0 FAIL | same |
| Property tests added by the Refactorer | 7 `fc.property` blocks (`step-number-properties.test.ts` ×3, `pyramid-panel-properties.test.ts` ×4) | verification attempt 1, F4 |

This stage wrote no production code, so no complexity measurement changed.

## Warnings carried forward

- **W-1** — `AC-006-35`'s live serving-origin equality is gated on `PRODUCTION_URL`, set in no
  workflow; unexercised by `npm test`/CI. Stage 5c must supply it.
- **W-2** — `freePort()`'s close-then-bind TOCTOU is a residual stability risk.
- **W-3** — `AC-006-25`'s thinnest pair is `--ink-3` on `--surface-3` at 4.6:1 light against a
  4.5 floor.
- **W-4** — the 9 px `.demography__tick` enters the above-fold size count at 1440×900 `es`
  (8 sizes, still ≤9); chart internals are excluded explicitly.
- **W-5** — a stale comment above `a { color: var(--ink-2) }` still claims the CTA keeps its
  accent ground; the code is correct.
- **W-6** — spec-text figures 16.13/2.12 may still appear in `10-tasks.md` and
  `AC-006-palette.md`; no assertion quotes them.

## Findings from this stage (none blocks)

- **M-1 — `web/content/site.ts` is outside the standing mutation scope.** `stryker.config.mjs`
  mutates `web/content/budgets.ts` and `web/content/share-copy.ts` but not `site.ts`, which is
  where Task 13's canonical origin lives. It was mutated here only because the `--mutate` flag was
  given an explicit list. The config was deliberately left untouched (constraint), so a future
  `npx stryker run` will not look at the one file `AC-006-34`/`AC-006-35` depend on. **Proposed
  follow-up:** add `web/content/site.ts` to the `mutate` array — it scores 100 % (35 valid
  mutants, 0 survivors), so the change costs coverage time, not a red gate.
- **M-2 — a hook timeout can record a false kill.** One of three full-scope runs marked an
  equivalent mutant killed (§Why 95.62 %, not 95.85). This is the same harness class as W-2 and
  verification attempt 2's BLOCK, now visible on the mutation side: a failed *run* is
  indistinguishable from a failed *assertion* to Stryker. It inflates a score by at most one
  mutant here; it cannot deflate one. Recorded so a future reading of `reports/mutation/*.json`
  is not surprised by a one-mutant swing between runs.

## Out of scope (pre-existing dirt, not mine)

`.standards` (submodule pointer), `runs.jsonl`, `live-005-top.png`, `live-006box.png`.

## Remediation record

Phase 1 only; no PR was opened, so **phase 2 did not run** and **phase 3 did not run**.

| BLOCK | Phase / attempt | Resolved at |
|---|---|---|
| Verification attempt 2 — BLOCK (browser-suite hook timeouts; `AC-006-20`'s shorter property list) | phase 1, cycle 1 of max 3 (attempt 2) | attempt 3, phase 1 cycle 2 of max 3 — PASS |
| Stage 5a precondition refusal — the +9-test delta and post-PASS mtimes left by the aborted mutation run | phase 1, cycle 3 of max 3 (attempt 4) | attempt 4, phase 1 cycle 3 of max 3 — PASS (tree certified; no fix was routed, the tree was correct) |

Both records are carried from `25-verification.md` (attempt headers and §Attempt 4 verdict); the
orchestrator's loop summary supplied nothing additional. No BLOCK occurred **during this stage**:
the baseline was measured, the killers were written, and the re-run cleared 80 % on the first
attempt. No gate threshold was changed, no test was weakened or deleted.

## Verdict

**GREEN.** Mutation score 95.62 % (floor 80 %), all 19 survivors named as equivalent, final suite
116 files / 1068 tests green, `tsc` exit 0. Nothing was committed or pushed — that is stage 5b.

## PR

PR: https://github.com/RexiAI/pensions-system/pull/18
Commits: 16 (17 including this record)
at: 2026-11-06T16:53:41Z

Stage 5b, PR Opener. The branch was committed one task at a time — T1, T2,
T4–T13 (T3 superseded by T11), plus the stage-5a kill tests, the harness fix
from phase-1 BLOCK 1, and these spec artifacts — pushed to `spec/006-centred-number`,
and opened as a draft PR against `main`. `specs/006-centred-number/` is still on
the branch on purpose: stage 5c writes `40-deploy.md` into it and stage 5d is the
stage that archives it.
