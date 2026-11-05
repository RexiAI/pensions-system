# 005-pension-warning — report (stage 5a, mutation)

Attempt: 1
Pipeline mode: full (`45-decisions.md`: the classifier named 21 paths outside
`docs/`, `specs/`, `*.md`, `scripts/`)
Branch: `spec/005-pension-warning`
Precondition: `25-verification.md` verdict **PASS** (attempt 2 — attempt 1's PASS
stood with it, and its one finding was closed at phase-1 cycle 1 of max 3).
`00-informal.md` was not read.
Conformance tier: `production` — mutation testing is required here, not skipped.

**Verdict: GREEN** — the PR Opener may proceed.

- Mutation score, before the tests this stage added: **86.46 %** (332 of 384 valid
  mutants killed; 45 survived, 7 no coverage, 1 runtime error) over 7 files / 385 mutants.
- Mutation score, after: **90.63 %** (348 of 384) over the same 7 files; **90.54 %**
  (469 of 518) once the traceability gate script this spec also changed is counted.
  Target is ≥ 80 %.
- Equivalent mutants: **20**, each named with its proof in §Equivalent mutants.
- Non-equivalent survivors: **16**, all in `web/series/countdown.ts` and all on lines
  this spec did not change; carried forward from `docs/changes/001-pension-math.md`.
- Complexity summary carried from the Refactorer: cyclomatic complexity ≤ 6, enforced
  by `eslint complexity: ['error', 6]`; `npm run lint` exit 0; the design-principles
  `complexity` gate in isolation reports `fails: []`. No method in this spec's diff
  exceeds it, and none of the 23 `Method body >20 lines` WARNs sits on a file in the
  diff (`25-verification.md` §3).
- Final test status: **99 files / 1034 tests, all green** (1028 before this stage's
  six new tests); `npx tsc --noEmit` exit 0.
- Remediation record: **none** — no gate BLOCKED during this stage, and none blocked
  before it (§Remediation record).

I committed nothing, pushed nothing and opened no PR. I wrote no production code: the
only file this stage added is one test file. No existing test was weakened, renamed or
deleted, and no gate threshold or `stryker.config.mjs` setting was touched.

## The mutated surface

The working tree is the pipeline's single uncommitted tree, so the surface is
`git diff main` plus the untracked files — `git diff --name-only main...HEAD` is empty
because nothing has been committed on this branch yet:

```
$ git diff --name-only main -- . | grep -v '^\.standards'     # tracked
runs.jsonl
scripts/check-scenario-traceability-3digit.ts
tests/...                                                     # tests: not mutated
web/components/PublicPage.tsx
web/components/public/BreakageStep.tsx
web/components/public/NumberStep.tsx
web/components/registers/AgreementSection.tsx
web/content/citations.ts
web/content/data/ES/{de,en,es,fr,it}.json                      # JSON: not instrumentable
web/content/data/citations.json
web/series/countdown.ts
web/styles/globals.css                                        # CSS: not instrumentable

$ git status --porcelain | grep '^??'
tests/acceptance/spec-005-*.test.ts                           # tests: not mutated
web/components/public/step-numerals.ts                        # source: mutated
```

Eight instrumentable files were mutated with an explicit `--mutate` list, so
`stryker.config.mjs` keeps its standing cumulative coverage. Two of them sit outside
that standing list and would have been silently skipped:

- `web/components/public/step-numerals.ts` is the spec's new module (T2's one
  definition for `50 per 100`) and is not matched by the standing `web/components/**/*.tsx`
  glob because it is a `.ts` file.
- `web/content/citations.ts` is where `resolveClaims` gained its `vars` parameter; the
  standing list names only `web/content/budgets.ts` and `web/content/share-copy.ts` from
  that directory.

A third, `scripts/check-scenario-traceability-3digit.ts`, is the only production change
for T8 (`SUPERSEDED_SCENARIOS` folded into the `retired` set). It is already in the
standing `mutate` list, and leaving it out would have described a tree that no longer
exists.

`web/series/countdown.ts`'s only change is the new `COUNTDOWN_BASE` constant, which
produces no mutants (Stryker's default mutators do not rewrite numeric literals). Its
score is therefore entirely the pre-existing revision-2 surface.

## Order of the work

1. `npm run build` first (exit 0, prebuild gates included), so the build-gated browser
   and locale suites run rather than silently skipping.
2. Baseline mutation run over the 7 spec files.
3. Every survivor triaged; six tests written for the real gaps.
4. Re-run of the affected files, then one final run over all 8 files.
5. Full suite and `tsc --noEmit` last, because the kill tests are new code the Verifier
   never saw.

## Survivor triage

Baseline, 45 survivors + 7 no-coverage + 1 runtime error:

| File | Mutants | Survived | No cov. | Errors | Baseline | After |
|---|---|---|---|---|---|---|
| `web/series/countdown.ts` | 195 | 20 | 2 | 0 | 88.72 % | 88.72 % (unchanged — no line this spec touched) |
| `web/content/citations.ts` | 62 | 9 | 3 | 1 | 80.33 % | **98.36 %** |
| `web/components/PublicPage.tsx` | 68 | 11 | 0 | 0 | 83.82 % | **89.71 %** |
| `web/components/public/NumberStep.tsx` | 45 | 2 | 2 | 0 | 91.11 % | 91.11 % (all four equivalent) |
| `web/components/registers/AgreementSection.tsx` | 7 | 1 | 0 | 0 | 85.71 % | **100 %** |
| `web/components/public/step-numerals.ts` | 6 | 2 | 0 | 0 | 66.67 % | 66.67 % (both equivalent) |
| `web/components/public/BreakageStep.tsx` | 2 | 0 | 0 | 0 | 100 % | 100 % |
| `scripts/check-scenario-traceability-3digit.ts` | 138 | 10 | 3 | 4 | 90.30 % (own run) | 90.30 % — no survivor on a changed line, and the T8 lines produce none |

Verdict per survivor cluster (coordinates are the post-change file's):

**Real gaps — killed by the tests below (16 mutants)**

| Location | Mutant | Verdict |
|---|---|---|
| `PublicPage.tsx:73:7` ×3, `:73:25` | `if (first === null ‖ latest === null)` → `if (false)`, `‖`→`&&`, either operand → `false` | gap — nothing rendered a `fig-01` missing an endpoint. Killed by the two `claimVariables` tests. |
| `AgreementSection.tsx:25:20` | `content.t('agreement.label')` → `content.t('')` | gap — no test asserted the register's heading, so `aria-labelledby="agreement-heading"` could point at an empty `<h2>`. Killed by the "register is named" test. |
| `citations.ts:97:22`, `:98:13`, `:98:27`, `:99:10`, `:99:25`†, `:100:13`†, `:103:22`, `:103:47`, `:105:5` ×2, `:105:81`† | the `unresolved` filter dropped / predicate neutralised / negation dropped / mapper and its unit replaced; the `resolvable` filter dropped / predicate neutralised; the one-sided test forced `true`; `< 2` weakened to `<= 2`; the one-sided array replaced | gap — no test gave `validateContentForPublication` a dispute with an *unresolvable* position, so that whole branch was unexercised (†: three of them had no coverage at all). Killed by the three publication-gate tests. |

**Pre-existing gaps, not chased (16 mutants, all `web/series/countdown.ts`)**

`93:10`, `106:9`, `126:28` ×2, `138:10`, `139:25` ×2, `139:41`, `145:42`, `162:10` ×2,
`186:10`, `226:7` ×3, `226:29`.

A test *should* distinguish these, so they are gaps and not equivalents — but every one
sits on a revision-2 branch (`matchesPoint`'s variant disjunct, the non-finite-year skip,
the `numerator > 0 && denominator > 0` filter, the projection-variant label filter, the
`>=` crossing test, `lastObservedYear`'s `> 0` test, `projectedAt`'s optional chaining,
and the three `backCast` guards). This spec changed exactly one line of that file — the
`COUNTDOWN_BASE` constant — and produced none of them; the archived spec-001 report
(`docs/changes/001-pension-math.md` §Reachable residual gaps) already carries the same
cluster forward with the assertion each would need. Writing sixteen tests for another
spec's ingestion internals here would be scope smuggling of the same kind this spec
refused on the `.claim + .claim` spacing rule (W-2). Recorded, not waived: the ≥ 80 %
gate is met with them counted.

**Runtime error, excluded from Stryker's denominator (1 mutant)**

`citations.ts:18:39` — `createCitationRegistry`'s `.map((citation) => [citation.id, citation])`
→ `() => undefined`. The mutant throws at module initialisation, so it is *detected*
(any importer crashes) but cannot be recorded as `Killed`: Stryker excludes runtime
errors from both numerator and denominator by design. Same shape as the archived
spec-001 §Runtime errors note.

`scripts/check-scenario-traceability-3digit.ts`'s four runtime errors are the CLI
guard (`import.meta.url` → `process.exit`), the same structural class; its 10 survivors
and 3 no-coverage mutants are the helper and walk code spec 001 already adjudicated
(`43:7`, `44:9`, `45:11`, `32:11`, `33:12`, `48:10`, `54:30`, `55:38`, `60:11`, `72:11`).
**None of them is on a line this spec changed**: the `SUPERSEDED_SCENARIOS` declaration
and the `retired` fold produced no survivor.

## Equivalent mutants — no test can distinguish them

| Location | Mutant | Why it cannot be killed |
|---|---|---|
| `step-numerals.ts:13:68`, `:14:58` | the `nullLabel` argument of `formatValue`, `''` → `"Stryker was here!"` | Both calls pass module constants typed `number` — `COUNTDOWN_THRESHOLD` (50) and `COUNTDOWN_BASE` (100), which AC-005-07 pins. `formatValue` consults the label only for `null`/`NaN`, which no test can supply without editing the constant the scenario pins. |
| `NumberStep.tsx:40:70` | same `nullLabel` shape, for `countdown.years` | `state === 'computed'` is only produced by `computedState`, and only together with `years = thresholdYear - snapshotYear`, a number. `measured()` gates the render, so the label is unreachable. |
| `NumberStep.tsx:48:10-48:40` | `countdown.state === 'computed'` → `true` inside `measured` | `measured` is called only from `NumberBody`, which returns early for `not-crossed`; `CountdownValue['state']` has no third member, so the test is entailed at every call site. (The *other* mutant in that condition — `anchor !== null` → `true` — is observable and is already killed by the shipped suite; verified by hand, see §Supporting.) |
| `NumberStep.tsx:18:41`, `:30:35` | `countdown.anchor ?? ''` → `"Stryker was here!"` (no coverage) | Both `anchorDate` call sites are reached only through `measured()`, which returns the countdown only when `anchor !== null`; the fallback is never evaluated. |
| `PublicPage.tsx:54:30` | `entry.availability !== 'computed'` → `false` in `countdownOf`'s disjunction | `findSeries` returns an entry whose `value` is `null` exactly when availability is not `computed`, so the following `entry.value === null` disjunct returns `undefined` anyway. (Carried from spec 004 §E4.) |
| `PublicPage.tsx:95:12` | `series = []` default → `['Stryker was here']` | `findSeries` matches on `seriesId`; an arbitrary string never equals one, so both defaults yield `undefined` three times. (Spec 004 §E6.) |
| `PublicPage.tsx:100:31` | the single-country `scopes` fallback array → `[]` | `ScopeMark` takes its text branch for `countries.length <= 1`, and 0 and 1 both qualify; that branch reads `content.country`, never the array. (Spec 004 §E6.) |
| `PublicPage.tsx:100:32` | that fallback's element `{ geo, name, href }` → `{}` | Same branch, same reason: the entry is never read. (Spec 004 §E6.) |
| `PublicPage.tsx:100:95` | `href: '#'` → `''` | Read only by the two-or-more branch, which a one-element fallback cannot reach. (Spec 004 §E6.) |
| `PublicPage.tsx:75:54`, `:76:56` | the `nullLabel` of the two claim numerals, `''` → `"Stryker was here!"` | Dead for the committed figure: all 16 `fig-01` points publish a ratio (verified against `data/derived/fig-01.json`). Reaching the label needs a fabricated point with `ratio: null`, and *that* renders `la cifra pasó de  a 0,33` — so the only test that could kill these would pin the contract gap F-1 below rather than a behaviour. |
| `citations.ts:20:20` | `id === undefined ? undefined : index.get(id)` → `false` | `Map.get(undefined)` is `undefined` for a registry keyed by strings, so both forms answer identically for every id, `undefined` included. |
| `countdown.ts:68:7` ×2, `:68:47`, `:223:7`, `:257:17`, `:108:41` | the `denominator <= 0` throw and its message, `backCast`'s `year === null` guard, `horizonEnd`'s optional chaining, and `point.coords.age ?? ''` | Carried forward unchanged from `docs/changes/001-pension-math.md` §Equivalent mutants (its `59:7`, `59:47`, `214:7`, `247:17`, `99:41`, offset by the lines this repo has added since). `ratioOf` is called only with a denominator the callers have already proven positive; `pinned` is non-empty or `computeCountdown` has already thrown. |

20 equivalents, 16 pre-existing gaps, 1 runtime-error-detected mutant. Nothing was
waived by moving a threshold.

## Tests added (6, one new file)

`tests/unit/spec-005-mutation-kills.test.ts`, in the shape spec 003/004 established: each
block names the mutant it kills, and each assertion is on rendered output, never on a
helper that rebuilds the expectation.

1. **`claimVariables`, first point absent** — renders `PublicPage` over a `fig-01` whose
   `value.first` is `null`; claim B keeps `{first}` and `{latest}` visible.
2. **`claimVariables`, latest point absent** — the mirror case, `value.latest` is `null`.
3. **`AgreementSection` names the register** — the rendered `<h2 id="agreement-heading">`
   carries `content.t('agreement.label')`, so `aria-labelledby` resolves to text.
4. **A dispute position that does not resolve** — the gate names it
   `"<dispute>: <proponent>"` with reason `unresolved-citation`, and does *not* call the
   two-sided dispute one-sided.
5. **The one-sided dispute an unresolvable position leaves behind** — both failures, in
   order.
6. **Two resolvable positions raise nothing** — the same pair from the other side.

Each of the 16 gap mutants was also killed by hand, one at a time, restoring the file
byte-identically between probes (sha256 recorded in §Supporting) — so the kill is
attributable to a specific assertion and not to a knock-on failure elsewhere.

## Finding, not fixed

**F-1 — `claimVariables`' doc promise is enforced at the point level, not the ratio
level.** The comment says an absent variable "stays a visible `{name}`, never an empty
string". That holds when `first`/`latest` is a `null` *point* (the `{}` return), but a
point that exists with `ratio: null` formats through `formatValue`'s null branch to `''`
and the claim renders `la cifra pasó de  a 0,33` — verified by execution, not by reading
(`formatValue(null, 'ratio', 'es', '')` → `''`; `interpolate` substitutes it). The
committed figure never produces such a point (`data/derived/fig-01.json`: 16 points, 0
with a null ratio), so nothing user-visible is wrong today. Closing it is a production
change — guard on the ratio, not the point — and belongs to a follow-up spec, not to
this stage.

## WARN items carried forward from `25-verification.md`

- **W-1** — `AC-005-05`'s "hero.sub sits directly under the headline" has no visible
  render surface: `hero.sub` appears only in `metadata.ts`. The test asserts the metadata
  description, per `15-design.md`'s re-pointing.
- **W-2** — the facts register still has **0.00 px** claim-to-claim spacing
  (`.claim + .claim`); four flush claims read as a wall. One declaration would fix it;
  this spec authorised only one spacing rule and spent it on step 1. Deliberately not
  smuggled in.
- **W-3** — the citation chip measures **31.05 px** against the project's
  `--tap-min: 44 px` floor. Pre-existing, recorded by the design stage, not fixed here.
- **W-4** — `15-design.md`'s projected `es@390` step height was 600.61 px; measured
  641.41 px (one extra headline line). The bound holds with 202 px headroom.
- **OOS** — pre-existing: `.standards` pointer and `runs.jsonl` dirty in the working
  tree, not this branch's work.

## Remediation record

**None.** No gate BLOCKED at any point in this run, so no phase-1 or phase-2 attempt was
consumed by this stage.

Carried forward from `25-verification.md`: the Verifier returned PASS on attempt 1 with
one WARN finding (`AC-005-19` compared a helper-rebuilt expectation with the plate). That
finding was routed to the Coder and closed at **phase 1, cycle 1 of max 3**; attempt 2
re-verified only the spot-check gate and returned PASS. That is a finding repaired inside
the budget, not a BLOCK, and the record is the Verifier's, not reconstructed here.

## Supporting

- Baseline run: 7 files, 385 mutants, initial test run 522 tests in 36 s.
- Final run: 8 files, 523 mutants, initial test run 556 tests in 37 s, exit 0.
- Files restored byte-identically after every hand-probe:
  `sha256(web/components/PublicPage.tsx)` = `fd295b4b…e34fc3`,
  `sha256(web/components/public/NumberStep.tsx)` = `d748bd11…5a85`,
  `sha256(web/components/registers/AgreementSection.tsx)` = `ea822600…22abf`,
  `sha256(web/content/citations.ts)` = `3eb9568c…12a48` (all `cmp -s` clean against
  pre-probe copies).
- `data/derived/fig-01.json`: 16 points, 0 with `ratio: null`, `first.ratio` 0.28,
  `latest.ratio` 0.33 — the premise of the `PublicPage.tsx:75`/`:76` equivalence.
- Design-principles gate re-run after the additions: exit 0, `fails: []`, `warns: 233` —
  unchanged from `25-verification.md` §4, and the new test file produces neither a FAIL
  nor a WARN.
- The shipped suite already kills the observable `NumberStep.tsx:48` mutant (the
  `anchor !== null` half): applying it by hand and running
  `spec-004-mutation-kills` + `story-steps` gives 1 failed / 63 passed. That is why this
  stage added no `NumberStep` test — a seventh test would have killed nothing.

## Evidence: mutation score (baseline, before this stage's tests)

command: npx stryker run --mutate "web/components/PublicPage.tsx,web/components/public/BreakageStep.tsx,web/components/public/NumberStep.tsx,web/components/public/step-numerals.ts,web/components/registers/AgreementSection.tsx,web/content/citations.ts,web/series/countdown.ts" --reporters clear-text,json
exit: 0
at: 2026-11-05T19:36:07Z

Instrumented 7 source file(s) with 385 mutant(s)
Initial test run succeeded. Ran 522 tests in 36 seconds
Detected 340 static mutants (88% of total) that are estimated to take 100% of the time running the tests!
Done in 11 minutes and 18 seconds.

                        | % Mutation score |          |           |            |          |          |
File                    |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files               |  86.46 |   88.06 |      332 |         0 |       45 |        7 |        1 |
 components             |  85.94 |   87.30 |      110 |         0 |       16 |        2 |        0 |
  public                |  88.68 |   92.16 |       47 |         0 |        4 |        2 |        0 |
   BreakageStep.tsx     | 100.00 |  100.00 |        2 |         0 |        0 |        0 |        0 |
   NumberStep.tsx       |  91.11 |   95.35 |       41 |         0 |        2 |        2 |        0 |
   step-numerals.ts     |  66.67 |   66.67 |        4 |         0 |        2 |        0 |        0 |
  registers             |  85.71 |   85.71 |        6 |         0 |        1 |        0 |        0 |
   AgreementSection.tsx |  85.71 |   85.71 |        6 |         0 |        1 |        0 |        0 |
  PublicPage.tsx        |  83.82 |   83.82 |       57 |         0 |       11 |        0 |        0 |
 content                |  80.33 |   84.48 |       49 |         0 |        9 |        3 |        1 |
  citations.ts          |  80.33 |   84.48 |       49 |         0 |        9 |        3 |        1 |
 series                 |  88.72 |   89.64 |      173 |         0 |       20 |        2 |        0 |
  countdown.ts          |  88.72 |   89.64 |      173 |         0 |       20 |        2 |        0 |

## Evidence: mutation score (after the added tests, all files)

command: npx stryker run --mutate "web/components/PublicPage.tsx,web/components/public/BreakageStep.tsx,web/components/public/NumberStep.tsx,web/components/public/step-numerals.ts,web/components/registers/AgreementSection.tsx,web/content/citations.ts,web/series/countdown.ts,scripts/check-scenario-traceability-3digit.ts" --reporters clear-text,json
exit: 0
at: 2026-11-05T20:16:33Z

Instrumented 8 source file(s) with 523 mutant(s)
Initial test run succeeded. Ran 556 tests in 37 seconds
Ran 52.19 tests per mutant on average.
Done in 12 minutes and 0 seconds.
STRYKER_EXIT=0

                                        | % Mutation score |          |           |            |          |          |
File                                    |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                               |  90.54 |   91.78 |      469 |         0 |       42 |        7 |        5 |
 scripts                                |  90.30 |   92.37 |      121 |         0 |       10 |        3 |        4 |
  check-scenario-traceability-3digit.ts |  90.30 |   92.37 |      121 |         0 |       10 |        3 |        4 |
 web                                    |  90.63 |   91.58 |      348 |         0 |       32 |        4 |        1 |
  components                            |  89.84 |   91.27 |      115 |         0 |       11 |        2 |        0 |
   public                               |  88.68 |   92.16 |       47 |         0 |        4 |        2 |        0 |
    BreakageStep.tsx                    | 100.00 |  100.00 |        2 |         0 |        0 |        0 |        0 |
    NumberStep.tsx                      |  91.11 |   95.35 |       41 |         0 |        2 |        2 |        0 |
    step-numerals.ts                    |  66.67 |   66.67 |        4 |         0 |        2 |        0 |        0 |
   registers                            | 100.00 |  100.00 |        7 |         0 |        0 |        0 |        0 |
    AgreementSection.tsx                | 100.00 |  100.00 |        7 |         0 |        0 |        0 |        0 |
   PublicPage.tsx                       |  89.71 |   89.71 |       61 |         0 |        7 |        0 |        0 |
  content                               |  98.36 |   98.36 |       60 |         0 |        1 |        0 |        1 |
   citations.ts                         |  98.36 |   98.36 |       60 |         0 |        1 |        0 |        1 |
  series                                |  88.72 |   89.64 |      173 |         0 |       20 |        2 |        0 |
   countdown.ts                         |  88.72 |   89.64 |      173 |         0 |       20 |        2 |        0 |

`web` is the seven spec files (348 of 384 valid mutants, 90.63 %; 91.58 % covered);
`scripts` is the traceability gate this spec's T8 also changed. The five runtime errors
are one `citations.ts` module-init throw plus the four `3digit.ts` CLI-guard throws —
detected, and excluded from Stryker's denominator by design (§Survivor triage).

## Evidence: final test suite

command: npx tsc --noEmit; npm test
exit: 0
at: 2026-11-05T20:08:23Z

TSC_EXIT=0

> pensions-system@0.0.0 test
> vitest run

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  99 passed (99)
      Tests  1034 passed (1034)
   Start at  21:08:26
   Duration  35.47s (tests 83%, import 13%, transform 2%, environment 1%, worker 1%)

TEST_EXIT=0

## Evidence: complexity gate (re-run after the additions)

command: npm run lint
exit: 0
at: 2026-11-05T20:09:03Z

> pensions-system@0.0.0 lint
> eslint .

LINT_EXIT=0

## Evidence: design-principles gate (re-run after the additions)

command: .standards/scripts/check-code-principles.sh --json
exit: 0
at: 2026-11-05T20:09:06Z

{
  "tier": "mvp",
  "gates": ["complexity", "dry", "yagni", "solid", "component-per-file", "property-tests", "comments", "naming", "null-discipline"],
  "fails": [],
  "warns": [ 233 entries — identical count and categories to 25-verification.md §4 ]
}

fails: 0
warns: 233

## PR (stage 5b)

PR: https://github.com/RexiAI/pensions-system/pull/15
Commits: 11
