# 30 — Report: pension-math

Stage 5a (Mutation Runner), **revision-2 refresh**. Conformance tier `production`, so the mutation
gate applies. Read `25-verification.md`, `10-tasks.md`, `20-acceptance/`, `15-design.md`. Did **not**
read `00-informal.md`.

**Verdict: GREEN**

- Mutation score on the **expanded** scope: **91.69 %** (92.64 % over covered mutants) across
  **33 files / 2532 mutants**, threshold ≥ 80 %.
- **`web/series/**` measured separately: 89.20 % (91.03 % covered), 398 mutants.** It cleared the
  80 % line, but it started this refresh at **77.39 %** — below the line — and that was the real
  finding on the new code. Round 1 (baseline) is recorded below; it is what revision 2 looked like
  before this stage wrote a single test.
- **Both encoding traps are now covered by assertions that kill the mutants**: the label-resolved
  21-band mapping (`age-bands.ts` 97.62 % of 42 mutants, one survivor proven equivalent) and the
  total-vs-sexes reconciliation (`assertSexTotals` + its message, both killed). Detail in
  §The two encoding traps.
- **F1 block: unchanged at 15/18, all three survivors equivalent** — same three coordinates as the
  previous report. Not re-opened, not re-litigated.
- Rounds this refresh: **2** (baseline + one test batch), the bound set by the brief.
- Final full suite: **522 tests, 41 files, 0 failures** (was 505; this stage added 17).
- App builds: `npm run build` exit 0 (21/21 static pages), `tsc --noEmit` exit 0, `eslint` exit 0.
- No production code and no existing test was modified. Two files changed: one new test file, and
  the `mutate` globs in `stryker.config.mjs` (scope widening, per §Mutation configuration).

---

## Revision history

| When | Verdict | Score | Scope | Tests | What the tree looked like |
|---|---|---|---|---|---|
| 2026-10-25T23:25:50Z | GREEN | 92.74 % total / 93.51 % covered, 1846 mutants | 28 files, `web/metrics\|manifest\|sources\|ingest/**` | 388 | **Before F1 was fixed**: `centralCellOf` compared a deflated `rPaidReal` against a nominal band centre, so `fig-05` threw and 18 mutants were un-killable. |
| 2026-10-26T08:16:47Z | GREEN | **93.83 % total / 94.40 % covered**, 1846 mutants | 28 files (same) | 415 | After the F1 fix, the hero-ladder swap and the percent-scale fix. **This is the figure the brief calls "the 93.83 %".** |
| **2026-10-26T14:27:38Z** (this refresh) | GREEN | **91.69 % total / 92.64 % covered**, **2532 mutants** | **33 files** — `web/series/**` added (398 mutants); `web/ingest/**` grew by three revision-2 files (200 mutants) | **522** | **Revision 2 exists**: T17 age structure (`age-bands`, `age-structure`, `PyramidPlate`), T18 countdown (`countdown`), the series ingest harness (`run-series`, `series`, `series-types`), the three new datasets, and revision-2 amendments to `definitions`/`validate`/`eurostat`/`figures`. |

**The 93.83 % figure was measured on a tree that did not contain revision 2. It must not be read as a
claim about this one, and its headline is not comparable to the 91.69 % above** — the denominator grew
from 1846 to 2532 mutants, and 598 of the newcomers sit in code that did not exist when 93.83 % was
measured (`web/series/**` ×398, `web/ingest/{run-series,series,series-types}.ts` ×200).

The like-for-like comparison is the same 28 files that made up the previous run's scope, which this
run puts at **93.12 % / 93.80 % covered over 1934 mutants** — 0.71 points below the previous 93.83 %.
That small drop is itself revision 2's: those 28 files gained 88 mutants and 19 more non-killed mutants
from the revision-2 amendments (`definitions.ts` grew for the two series definitions, `validate.ts` for
`snapshotYear`, `eurostat.ts` for `resolveCountUnit`, `figures.ts` for the projection horizon), and
`definitions.ts` fell from 92.23 % to 87.60 % on the new id predicates and definition text.

---

## Precondition

`specs/001-pension-math/25-verification.md` exists and its most recent overall verdict is **PASS**
(revision-2 attempt 2): scenario traceability 99/99 visible to the gate (107/107 by grep, the gate's
regex limitation disclosed), full suite 505/40, complexity gate exit 0, design-principles gate PASS
for the deliverable (the attempt-1 `component-per-file` FAIL resolved by the page→layout move; sole
remaining FAIL is the out-of-scope `.standards/` hallmark example), scenario-to-behavior spot check
PASS against the built app. Mutation work ran on that basis; nothing below re-litigates it.

The working tree is dirty and every dirty entry is this pipeline's own uncommitted output (`specs/`,
`tests/`, `web/`, `app/`, `scripts/`, `data/`, `stryker.config.mjs`, `package.json`). Stage 5b
commits them. Nothing was stashed, reverted or auto-committed. During mutant verification
`web/series/*.ts`, `web/ingest/series.ts` and `web/ingest/run-series.ts` were mutated in place and
restored **byte-identically** (md5 verified before and after each probe — see §Tests added).

---

## Mutation configuration

The only configuration change is the scope widening the brief asked for. **No mutator was disabled,
no threshold was changed, no `// Stryker disable` comment was added anywhere.**

```
mutate:
  web/metrics/**/*.ts
  web/manifest/**/*.ts
  web/sources/**/*.ts
  web/ingest/**/*.ts
  web/series/**/*.ts        ← added by this refresh (revision-2 calculation surface)

testRunner:        vitest          vitest.configFile: vitest.config.ts
coverageAnalysis:  perTest         timeoutMS: 30000   timeoutFactor: 2   concurrency: 4
reporters:         clear-text, progress, json          jsonReporter: reports/mutation/mutation.json
thresholds:        high 80, low 80, break null         (reported, not enforced — this report is the verdict)
disableTypeChecks: false           (vitest transpiles via oxc and never type-checks)
ignorePatterns:    .opencode, .standards, specs, .github, .githooks, .playwright-mcp,
                   data/pending, data/proposals, tsconfig.tsbuildinfo, runs.jsonl
```

Still **excluded**, unchanged from the previous report: `web/components/**` and `app/**` (React/Next
markup — revision 2's `PyramidPlate`, `CountdownBlock` and `ScopeMark` live there), `web/content/**`
(presentation formatting), `data/**` and generated files, `.standards/**` (submodule, off-limits),
and `scripts/*.ts` (CLI entry points that run `process.exit(main())` at import time and are only
exercised as subprocesses — a mutant there is a permanent 0 % that measures nothing; the logic they
delegate to is in the five in-scope areas).

**Explicitly stated rather than silently excluded:** revision 2's series *rendering* (`web/components/
series/**`, `web/components/public/ScopeMark.tsx`, `web/seo/**`) is outside the mutation scope, for
the same reason `web/components/**` always was. Its evidence is the revision-2 acceptance suite plus
the Verifier's live render check, not a mutation score. `web/series/**` — the calculation the
rendering displays — **is** in scope, and that is the change this refresh makes.

### Scope as measured

| Area | Files | Mutants | Why it is in scope |
|---|---|---|---|
| `web/metrics/**` | 8 | 298 | calculation kernels (ratio, GDP share, cohort IRR, implicit debt, required base growth, growth rate, NPV/root finding, rounding) |
| `web/manifest/**` | 5 | 517 | manifest validation, hashing, definition registry (now including the two series definitions), formula registry, reproduce-path resolution |
| `web/sources/**` | 8 | 499 | JSON-stat / INE parsing, unit conversion, year alignment, catalogue, labels, freshness |
| `web/ingest/**` | 9 | 820 | figure + **series** compute harnesses, figure validation, deterministic JSON, derived-file IO |
| `web/series/**` | 3 | 398 | **revision 2**: age banding, age structure/shares/readouts, dependency ratio + threshold crossing |

`web/manifest/types.ts` and the other pure-type modules generate no mutants and therefore do not
appear; a module that declares runtime constants beside its types (`web/ingest/series-types.ts`, 13
mutants) does.

---

## Rounds run this refresh

Two — the bound set by the brief. Round 1 is a baseline with **no test changes**; round 2 is the
single test batch. This is a refresh on new code, not a rescue, so there is no round 3.

| Round | Score (total) | Score (covered) | killed | timeout | survived | no coverage | runtime errors | `web/series/**` | ended (UTC) |
|---|---|---|---|---|---|---|---|---|---|
| 1 — baseline on the revision-2 tree | 88.27 % | 89.77 % | 2217 | 2 | 253 | 42 | 18 | **77.39 %** (79.59 % covered) | 2026-10-26T13:59:01Z |
| 2 — after `tests/unit/series-coverage-gaps.test.ts` (17 tests) | **91.69 %** | **92.64 %** | **2303** | **2** | **183** | **26** | **18** | **89.20 %** (91.03 % covered) | 2026-10-26T14:27:38Z |

Score convention (Stryker's own): `(killed + timeout) / (total − runtimeErrors)`; `covered` further
excludes no-coverage mutants.

Round 1 was the finding the brief anticipated: **`web/series/**` at 77.39 % is below the 80 % gate**,
and it was not a rounding artefact — `age-structure.ts` sat at 70.81 % and `countdown.ts` at 79.49 %,
with the worst block being the *published readout* (`over65`/`under20`), where 15 mutants were
untested. The three new `web/ingest` files were also weak on first measurement (`series.ts` 41.67 %,
`series-types.ts` 0 %, `run-series.ts` 80.00 %), and they dragged the whole `ingest` area from 94.72 %
to 86.94 %. Round 2 lifts `series` to 89.20 % and `ingest` to 91.79 %.

### What round 2 changed, per file

| File | Round 1 | Round 2 | Mutants killed by the new file |
|---|---|---|---|
| `web/series/age-bands.ts` | 92.86 % | **97.62 %** | 3 (2 killed, 1 equivalent) |
| `web/series/age-structure.ts` | 70.81 % | **87.58 %** | 27 |
| `web/series/countdown.ts` | 79.49 % | **88.72 %** | 18 |
| `web/ingest/series.ts` | 41.67 % | **86.67 %** | 27 |
| `web/ingest/series-types.ts` | 0.00 % | **92.31 %** | 12 |
| `web/ingest/run-series.ts` | 80.00 % | 80.00 % | 0 |

---

## Results

### Per area

| Area | Mutants | Killed | Timeout | Survived | No coverage | Runtime errors | Score (total / covered) |
|---|---|---|---|---|---|---|---|
| `web/metrics/**` | 298 | 278 | 1 | 17 | 2 | 0 | 93.62 / 94.26 |
| `web/manifest/**` | 517 | 482 | 0 | 31 | 2 | 2 | 93.59 / 93.96 |
| `web/sources/**` | 499 | 450 | 1 | 45 | 3 | 0 | 90.38 / 90.93 |
| `web/ingest/**` | 820 | 738 | 0 | 55 | 11 | 16 | 91.79 / 93.06 |
| **`web/series/**`** | **398** | **355** | **0** | **35** | **8** | **0** | **89.20 / 91.03** |
| **All files** | **2532** | **2303** | **2** | **183** | **26** | **18** | **91.69 / 92.64** |

### Per file (round 2, verbatim from the run)

```
web/ingest/deterministic-json.ts           mut=  14  killed=  14  surv= 0  nocov= 0  err= 0   100.00
web/ingest/figures.ts                      mut= 213  killed= 188  surv= 8  nocov= 3  err=14    94.47
web/ingest/run-compute.ts                  mut= 200  killed= 186  surv=10  nocov= 4  err= 0    93.00
web/ingest/run-series.ts                   mut= 125  killed= 100  surv=22  nocov= 3  err= 0    80.00
web/ingest/series-types.ts                 mut=  13  killed=  12  surv= 1  nocov= 0  err= 0    92.31
web/ingest/series.ts                       mut=  62  killed=  52  surv= 7  nocov= 1  err= 2    86.67
web/ingest/types.ts                        mut=  11  killed=  11  surv= 0  nocov= 0  err= 0   100.00
web/ingest/validate-figure.ts              mut= 165  killed= 160  surv= 5  nocov= 0  err= 0    96.97
web/ingest/write-derived.ts                mut=  17  killed=  15  surv= 2  nocov= 0  err= 0    88.24
web/manifest/definitions.ts                mut= 131  killed= 113  surv=14  nocov= 2  err= 2    87.60
web/manifest/formula-ids.ts                mut=  16  killed=  15  surv= 1  nocov= 0  err= 0    93.75
web/manifest/hash.ts                       mut=  33  killed=  31  surv= 2  nocov= 0  err= 0    93.94
web/manifest/repo-file.ts                  mut=  16  killed=  16  surv= 0  nocov= 0  err= 0   100.00
web/manifest/validate.ts                   mut= 321  killed= 307  surv=14  nocov= 0  err= 0    95.64
web/metrics/cohort-irr.ts                  mut=  50  killed=  48  surv= 2  nocov= 0  err= 0    96.00
web/metrics/contribution-cover.ts          mut=  38  killed=  38  surv= 0  nocov= 0  err= 0   100.00
web/metrics/dependency-ratio.ts            mut=  40  killed=  40  surv= 0  nocov= 0  err= 0   100.00
web/metrics/implicit-debt.ts               mut=  10  killed=  10  surv= 0  nocov= 0  err= 0   100.00
web/metrics/npv.ts                         mut=  90  killed=  73  surv=15  nocov= 2  err= 0  to=1  81.11
web/metrics/pension-share.ts               mut=  36  killed=  36  surv= 0  nocov= 0  err= 0   100.00
web/metrics/required-base-growth.ts        mut=  29  killed=  29  surv= 0  nocov= 0  err= 0   100.00
web/metrics/rounding.ts                    mut=   5  killed=   5  surv= 0  nocov= 0  err= 0   100.00
web/series/age-bands.ts                    mut=  42  killed=  41  surv= 1  nocov= 0  err= 0    97.62
web/series/age-structure.ts                mut= 161  killed= 141  surv=14  nocov= 6  err= 0    87.58
web/series/countdown.ts                    mut= 195  killed= 173  surv=20  nocov= 2  err= 0    88.72
web/sources/countries.ts                   mut=  59  killed=  55  surv= 4  nocov= 0  err= 0    93.22
web/sources/eurostat.ts                    mut= 210  killed= 188  surv=20  nocov= 2  err= 0  to=1  89.52
web/sources/freshness.ts                   mut=  29  killed=  29  surv= 0  nocov= 0  err= 0   100.00
web/sources/ine.ts                         mut=  70  killed=  67  surv= 3  nocov= 0  err= 0    95.71
web/sources/labels.ts                      mut=  47  killed=  37  surv=10  nocov= 0  err= 0    78.72
web/sources/live.ts                        mut=  44  killed=  40  surv= 4  nocov= 0  err= 0    90.91
web/sources/load.ts                        mut=  28  killed=  23  surv= 4  nocov= 1  err= 0    82.14
web/sources/types.ts                       mut=  12  killed=  12  surv= 0  nocov= 0  err= 0   100.00
```

One file remains below 80 % individually — `web/sources/labels.ts` at 78.72 % — exactly as in every
prior run; its ten survivors are all proven equivalent (§Equivalent mutants). No file in the
revision-2 surface is below the line.

---

## The two encoding traps

The brief singled these out, correctly: mutants here matter more than the aggregate. Both traps are
now killed, and the assertions behind them are exact, not "defined and non-zero".

### Trap 1 — the band mapping (`Y_OPEN` vs `Y_GE100`)

`bandOfAgeLabel` resolves the open-ended band from the payload's own **labels**, because `demo_pjan`
publishes `Y_OPEN` `"Open-ended age class"` and `proj_23np` publishes `Y_GE100` `"100 years or over"`.
A hardcoded code would silently drop the 100+ band from one dataset.

| Mutant | Status | What kills it / why it cannot be killed |
|---|---|---|
| `age-bands.ts:22:27` Regex `\s*`→`\s` (single space only) | **Killed** | new: `bandOfAgeLabel('5  years')` → 5. The function normalises whitespace; two spaces must still band. |
| `age-bands.ts:36:10` ConditionalExpression `age >= OPEN_BAND`→`false` (always take the `floor` branch) | **Killed** | new: `bandOfAgeLabel('105 years')` → `OPEN_BAND` (100); the `floor` branch would answer 105, i.e. invent a band above the open one. |
| `age-bands.ts:36:10` EqualityOperator `>=`→`>` | Equivalent | At age exactly 100 the `floor` branch computes `floor(100/5)*5 = 100 = OPEN_BAND`; at every other integer age both forms take the same branch. Proven, not assumed: the same test pins 100→100 and 105→100. |

The hardcoded-code trap itself was already covered by the pre-existing rename test
(`population-pyramid.test.ts:88` renames `Y_OPEN`→`ZZ_OPEN_99` and asserts the band still resolves by
label). That test does what it claims: a code-keyed read cannot pass it.

### Trap 2 — the total-vs-sexes sum (`sex=T` is the denominator, `M`/`F` are the halves)

`assertSexTotals` refuses a payload whose `M + F ≠ T` for any band, and every published share divides
by the year's `Total` row.

| Mutant | Status | What kills it / why it cannot be killed |
|---|---|---|
| `age-structure.ts:176:57` ArithmeticOperator — the thrown message's `${male + female}`→`${male - female}` | **Killed** | new: the double-count fixture must throw a message naming the computed sums (`/males \+ females \(2\)/`, `/the sex total \(3\)/`). A build that stops must say why correctly. |
| `age-structure.ts:194:7` / `194:50` / `195:27` — the re-check inside `bandCounts` (condition, throw body, message) | Equivalent (3) | `bandCounts` is module-private and only reachable through `readAgeCounts`, which has already run `assertSexTotals` over exactly these entries. The check cannot fire, so neither its body nor its message is ever evaluated. |
| `age-structure.ts:228:57` / `232:27` / `233:28` — the count sums and the `>= 65` / `< 20` predicates behind `over65`/`under20` | **Killed** | new: the readouts are pinned as literals per year (`14.98/25.14`, `20.72/18.40`, `32.68/16.00`), independently decoded from the committed snapshots. Before this, `over65` was only ever asserted to render. |
| `countdown.ts:83:7` / `83:46` — the sex guard (`point.coords.sex !== codes.sex`) | **Killed** | new: the synthetic ratio payload's 2025 halves (1400 + 1600) do **not** sum to its total (3000), so summing the halves reads 57.14 where the `Total` row reads 50.00. A sex-blind sum is now a failing test. |
| `countdown.ts:84:10` ×2 — the variant guard | **Killed** | new: the same payload carries a second variant; dropping the guard reads 50.83 instead of 50.00 (and the `false` form empties the series). |

**Verdict on the traps: the assertions were weaker than claimed in two places, and both are now
fixed** — the readout claim (`over65`/`under20`) had no value assertion at all, and the `Total`-row-only
rule for the dependency ratio was only ever exercised against a payload whose halves reconcile
(where summing them is arithmetically invisible).

---

## F1 block status (still relevant, unchanged)

F1 was the `centralCellOf` defect (a *deflated* `rPaidReal` compared against a *nominal* band centre,
so `fig-05` always threw). The previous report recorded the 18 mutants it had blocked as
**15 killed + 3 equivalent** once the fix landed. This run reproduces exactly that, at the same
coordinates:

| Coordinate | Mutator | Status | Class |
|---|---|---|---|
| `web/ingest/figures.ts:244:7` | ConditionalExpression (`if (!cell)` never throws) | Survived | equivalent — the grid is swept over `[min, central, max]` and `DEFAULT_G_WAGE_SWEEP` contains `ASSUMED_REAL_WAGE_GROWTH`, so the cell always exists; the guard is unreachable for the shipped constants |
| `web/ingest/figures.ts:244:30` | StringLiteral (the throw's message) | NoCoverage | equivalent — same unreachable branch |
| `web/ingest/figures.ts:261:14` | ObjectLiteral (`horizon: { ...PROJECTION_HORIZON }` → `{}`) | Survived | equivalent — `sensitivityGrid` discards `value.horizon`; a cell carries only `gWage`, `rPaidNominal`, `rPaidReal`, `gRequired`, `gap` |

The neighbouring `figures.ts:252` cluster (the `cohort.central === null || cohort.band === null` guard)
is unchanged too: three killed, three equivalent (`central` and `band` are null under exactly the same
condition — an empty grid).

**F1 is closed. It is not re-opened by revision 2 and it is not part of the 91.69 % shortfall.**

---

## Equivalent mutants (111) — no test can distinguish them

111 of the 209 non-killed mutants are equivalent or dead. Each group is counted once; the counts
sum to 111.

| File | Coordinates | Count | Why it is un-killable |
|---|---|---|---|
| `web/series/age-bands.ts` | 36:10 (`>=`→`>`) | 1 | See Trap 1 — both forms agree on every integer age because 100 is a multiple of the band width. |
| `web/series/age-structure.ts` | 139:73, 194:7, 194:50, 195:27, 260:53, 262:109 | 6 | `139:73` the trailing `?? ''` on `point.coords.age` is dead (`decodeCoords` fills every dimension in `id`, so it is always a string). `194:7/194:50/195:27` the `bandCounts` re-check cannot fire (see Trap 2). `260:53` the projection payload the product ingests (`eurostat-proj-23np`) publishes exactly one projection category (`size[1] = 1`, verified in the committed snapshot), so dropping the variant filter changes nothing. `262:109` the `?? 'measured'` fallback is unreachable: 1995 and 2025 are both keys of `OBSERVED_HUES`. |
| `web/series/countdown.ts` | 59:7 (×2), 59:47, 99:41, 214:7, 247:17 | 6 | `59:7`/`59:47` `ratioOf`'s zero-denominator guard is unreachable: `readDependencySeries` filters `denominator > 0` first and `observedDependency` guards `denominatorPopulation > 0`. `99:41` dead `?? ''` (as above). `214:7` with `year === null`, `projectedAt` yields null through `?? null` and `observedDependency` yields null, so the next guard returns the same null. `247:17` `pinned[pinned.length − 1] ?? snapshotYear` is unreachable — `pinned.length > 0` is enforced by the throw above it. |
| `web/ingest/run-series.ts` | 44:13, 56:13, 61:37 | 3 | `44:13`/`56:13` the `kind: 'failure'` discriminant is never read: `applyInspection` falls through to its `else` for any kind that is neither `ok` nor `unresolved`. `61:37` `evaluateFreshness` returns a non-empty `reason` on every `fresh: false` path (three branches, all with a message), so the `?? 'outside freshness window'` fallback is dead. |
| `web/ingest/series-types.ts` | 20:10 | 1 | `typeof value === 'string' && SERIES_IDS.includes(value)` — `includes` already rejects every non-string, so dropping the `typeof` operand changes no answer. |
| `web/ingest/series.ts` | 22:7, 22:8, 22:44, 28:12 | 4 | `22:*` `payloadOf`'s unresolved guard and its message are unreachable: the harness only calls `compute` after `unfinishedOutcome` verified every requirement source resolved. `28:12` `value.years[0]?.bands` is dead — `computePyramid` always returns three years or throws. |
| `web/ingest/figures.ts` | 33 (×3), 88 (×2), 244 (×2), 252 (×3), 261 | 11 | Carried forward unchanged: `payload()`'s throw and `spanOf`'s empty branch are unreachable; the F1 group is the table above; the `252` guard is redudantly two-sided. |
| `web/ingest/run-compute.ts` | 65, 128 (+ dead 95, 209, 292, 347) | 6 | Carried forward: the `missingForCountry` branch is shadowed, `parsed <= oldest` and `parsed < oldest` agree at equal timestamps, the three `??` fallbacks never fire, and `hashInputBytes` has no production caller. |
| `web/ingest/validate-figure.ts` | 29, 122 (×2) | 3 | Carried forward: the membership test alone rejects the same non-strings; `identity.length > 0` is implied by an unknown id. |
| `web/ingest/write-derived.ts` | 6, 22 | 2 | `DERIVED_DIR` is a re-export with no reader in scope; `writeFileSync` accepts a Buffer, so the `'utf8'` argument's removal round-trips to the same bytes. |
| `web/manifest/definitions.ts` | 36 (×3), 40, 152, 158, 166, 183, 231, 233 (×4), 254 (×2) | 15 | `36`/`40`/`166` — `includes` rejects the same non-strings the `typeof` guard rejected. `152`/`158` — the `definitionId` field inside `SERIES_DEFINITIONS` records has no reader (only `.definition` and `.formulaId` are read). `183`/`254` — `firstDefinitionOf` can only throw for a metric outside the closed `MetricId` union. `231`/`233` — for every metric that *has* an international definition it is also the first definition of that metric, so the `?? firstDefinitionOf(...)` fallback resolves to the same object; for national-only metrics `find` already returned undefined. |
| `web/manifest/validate.ts` | 145 (×8) | 8 | Carried forward: the `reproducePath` pass inside `manifestFieldProblems` is called with `fileExists = () => true`, so `checkReproducePath` can never produce `missingFile` — the `.filter`, both arrow operands, the equality, the boolean and the `""` literal are all dead. |
| `web/manifest/hash.ts` | 14, 20 | 2 | Carried forward: the closed-set/pattern check rejects the same non-strings; `/\.\d{3}Z$/`→`/\.\d{3}Z/` is a no-op because `toISOString()` always ends with the millisecond group. |
| `web/manifest/formula-ids.ts` | 19 | 1 | Same shape as `hash.ts:14`. |
| `web/metrics/npv.ts` | 40, 42, 65 (×7), 66, 86, 91 (+ dead 41 ×5) | 17 | Carried forward: the root is invariant to a positive rescaling of every flow; `<=`→`<` differs only at an exact-equality boundary float bisection never lands on; `86`'s `!== 1` is masked by `initialBracket` returning null for the same inputs; `41`'s `scale === 0` branch is unreachable (an all-zero flow set has zero sign changes and returns null first). |
| `web/metrics/cohort-irr.ts` | 66 (×2) | 2 | `<= 0`→`< 0` differs only at exactly zero contribution, where the sign-change gate already returns null. |
| `web/sources/labels.ts` | 6, 7, 18, 19, 29, 31, 33 (×4), 36 | 10 | Carried forward: dropping `^`/`\.` is a no-op for the shipped catalogue; `split('')`/`join('')` transform both sides of every comparison identically; the `byDataset` short-circuit and the exact-host branches all fall through to the registered-domain lookup, which selects the same declaration for every URL in `SOURCE_DECLARATIONS`. |
| `web/sources/countries.ts` | 64 (×2), 110 (×2) | 4 | `isPublishedGeo` is gated by the closed `PUBLISHED_GEOS` list; a national definition's lookup returns `null` before the `sourceIds.length` check matters. |
| `web/sources/live.ts` | 38 (×2), 54, 67 | 4 | `LIVE_URLS` only contains declared source ids, so the guard and the `find` predicate in `declaration()` cannot take their other branch; the `Z$` anchor is redundant for `toISOString()` output. |
| `web/sources/ine.ts` | 23, 45, 50 | 3 | Replacing the `typeof payload !== 'object'` operand leaves sibling checks catching exactly the same inputs. |
| `web/sources/load.ts` | 39 | 1 | The `dir = 'data/snapshots'` default is never taken; every caller passes its own path. |
| `web/sources/eurostat.ts` | 131 | 1 | `resolveCountUnit`'s return value has no reader inside the mutated scope (callers use it for validation only), so emptying the returned object changes nothing. |

---

## Reachable residual gaps (98) — named with the assertion that would kill each

Real gaps, not equivalents. They are recorded rather than chased because the refresh budget is two
rounds, the gate is met, and **none of them sits on a published calculation** — they are guards,
fallbacks, error text and provenance fields. Grouped by the single assertion that would kill each
cluster.

| File | Mutants | Coordinates | What would kill it |
|---|---|---|---|
| `web/series/age-structure.ts` | 7 | 185:7 (×3), 185:30 (×2), 185:42, 186:27 | **A year whose `Total` row is missing or zero must be refused, not published as a panel of NaN.** `yearTotal`'s guard — and its throw body and message — has zero coverage: the one test that reaches a missing year (`computePyramid` with `demo_pjan` as the projection) throws earlier, in `resolveCategoryCode`, because that payload has no `projection` dimension. Assert `computePyramid({observed: payloadWithBandsButNoTotal, projected})` throws `/no total population for 1995/`. **Highest-value residual in this report.** |
| `web/series/age-structure.ts` | 3 | 275:10, 275:81 (×2) | `openBandShare` — assert `openBandShare(value, 1900)` is `undefined` (the optional chain) and `openBandShare(value, 1995)?.band === OPEN_BAND` (the predicate). Today the open-band helper is only asserted `toBeDefined()` and `.total > 0`, which band 0 also satisfies. **Second-highest value** — it is the trap's own helper. |
| `web/series/age-structure.ts` | 2 | 120:12, 126:7 | A payload publishing a fourth sex code (neither M/F/T) and one publishing `' Total '` with surrounding whitespace. |
| `web/series/age-structure.ts` + `countdown.ts` | 3 | `age-structure` 128:7, 138:7; `countdown` 97:9 | A payload with a non-numeric `time` code (`Number('TOTAL')` → NaN) — the shared "not a year" guards. |
| `web/series/countdown.ts` | 5 | 177:10, 217:7 (×3), 217:29 | **A back-cast whose projection side or observation side is missing must be `null`.** An observation whose latest year precedes the projection's first year (e.g. an observed payload carrying only 1995 against a series starting 2022). |
| `web/series/countdown.ts` | 2 | 117:28 (×2) | A year whose 65+ count is `0` with the denominator present is skipped by `numerator > 0` — assert that year is absent. |
| `web/series/countdown.ts` | 4 | 129:10, 130:25 (×2), 130:41 | A payload publishing a blank (`''`/`'  '`) projection code must be filtered out of `projectionVariants`. |
| `web/series/countdown.ts` | 3 | 84:10, 136:42, 153:10 (×2) | `readDependencySeries(demo_pjan)` (no variant → `variant === null` branch), `firstYearAtOrAbove([{year: 2020, ratio: 50}], 50) === 2020` (exact-threshold equality), and `lastObservedYear(payload, 1900) === null` (empty filter). |
| `web/ingest/run-series.ts` | 6 | 92:12 (×3), 92:36 (×3) | **`manifest.fetchedAt` must be the oldest source retrieval.** No assertion on `run-series`' manifest date exists (the figures equivalent, AC-001-01's "stamps the oldest source retrieval", covers `run-compute` only). Assert it equals the oldest of the three snapshots' `retrievedAt`, on snapshots whose timestamps differ. |
| `web/ingest/run-series.ts` | 6 | 116:17, 116:18 (×2), 116:62, 116:76, 116:131 | **A series' `inputHash` must change when an input snapshot's bytes change** (AC-001-02 exists for figures, not for series). |
| `web/ingest/run-series.ts` | 4 | 97:10, 136:24, 156:24, 194:104 | Duplicate source URLs are de-duplicated; an unavailable series carries `unresolvedSources` equal to its requirement list; a computed series carries `unresolvedSources: []` and no problems. |
| `web/ingest/run-series.ts` | 2 | 212:15 | **The harness exit code.** `results.some(...)`→`every(...)`: run both `SERIES` with one snapshot broken and assert `exitCode === 1`. |
| `web/ingest/run-series.ts` | 3 | 61:17, 182:13, 184:50 | The stale-snapshot detail names the age (`/days old/`); the manifest-invalid detail names the field and code; the unavailable reason is `'manifest did not validate'`. |
| `web/ingest/run-series.ts` | 1 | 51:71 | An unresolved snapshot with no `unresolvedReason` falls back to `'series not specified'`. |
| `web/ingest/run-series.ts` | 1 | 196:61 | A non-`Error` thrown from a series `compute`. |
| `web/ingest/series.ts` | 4 | 44:23, 45:26, 48:15, 49:18 | The countdown assumptions when a variant does not cross and when the back-cast is null (the `variantsCrossing` filter and the two `backCast === null` branches). With the shipped data all six variants cross and the back-cast exists, so both are invisible. |
| `web/manifest/definitions.ts` | 1 | 160 | The `old-age-dependency-ratio` **definition text** is not pinned anywhere (the `age-structure` one is, via AC-001-94). Assert it names the 15–64 denominator and the baseline projection. |
| `web/manifest/validate.ts` | 6 | 29, 97 (×3), 98, 126 | `snapshotYear: 1900` / `2200` are accepted and the boundary rejections are named (`<=`/`>=` mutants survive); a manifest built without `snapshotYear` must not gain a `snapshotYear: undefined` key (assert `'snapshotYear' in manifest`); a non-array object with all-valid fields reaches `asRecord`'s `Array.isArray` operand. |
| `web/ingest/run-compute.ts` | 8 | 162, 210, 216, 234, 249, 270, 294, 325 | Carried forward unchanged: the `missing` hash token, the `'; '` separator, a failure with no `sourceId`, and `unresolvedSources: []` on each computed path. |
| `web/ingest/validate-figure.ts` | 2 | 57, 120 | Carried forward: a candidate with valid `availability` but no `figureId`, asserting `figureId: 'unknown'` in both problem lists. |
| `web/sources/eurostat.ts` | 21 | 44, 49, 56, 58 (×4), 77, 102, 123 (×4), 124 (×2), 125, 199 (×2), 202, 207 (×2), 262 | Carried forward plus revision-2 additions: `IngestError.name`; a payload whose `dimension` is absent; a payload with `value` but no `id`/`size`; an ascending-order assertion on `pointsFor`' sort; **new** — a payload with two unit categories or a blank unit code (`resolveCountUnit`'s filter and `entries.length !== 1` guard). The 21-mutant `eurostat.ts` cluster remains the largest single residual and the best next target. |
| `web/sources/load.ts` | 4 | 21, 32, 47, 48 | Carried forward: a file with neither `resolved` nor `payload`; `bytes` as a string; readdir order differing from sorted order; non-ASCII bytes. |

---

## Runtime errors (18) — excluded from the denominator, not untested behaviour

Stryker records a runtime error (and drops the mutant from both numerator and denominator) when a
mutant makes a suite throw at collection time rather than fail an assertion. All 18 are of one shape:

- `web/ingest/figures.ts` — 14, at each figure's `define({ … })` table entry (the argument object and
  its `figureId` literal, 7 figures × 2). `define()` resolves the published definition at module load,
  and several suites build their compute report at collection time.
- `web/ingest/series.ts` — 2, at `seriesDefinitionFor('age-structure')` / `…('old-age-dependency-ratio')`
  in the `SERIES` table (same shape, revision-2 file).
- `web/manifest/definitions.ts` — 2, at `150` (the `SERIES_DEFINITIONS` table entry) and `173`
  (`seriesDefinitionFor`'s throw, emptied).

This is a `perTest` adjudication limit, not a coverage hole: by hand, mutating `figureId: 'fig-01'` to
`''` fails 5 of 14 tests in the two files that most directly exercise the figure table, and mutating
the series definition id fails the manifest/hash suite. Three of them (`definitions.ts:152`/`158` and
the `definitionId` field) are additionally dead fields — see the equivalent table.

---

## Tests added by this refresh

**17 tests, in 1 new file. No existing test was modified, weakened, renamed or deleted. No production
code was edited.**

`tests/unit/series-coverage-gaps.test.ts` — every test drives the real modules; the synthetic
JSON-stat payloads are hand-built so that only one reading of the code can produce the expected
answer (the committed snapshots are single-variant and ascending, so a lost filter or a lost sort is
invisible through them).

| # | Assertion | Mutants killed |
|---|---|---|
| 1 | `bandOfAgeLabel('105 years' / '120 years') === OPEN_BAND`, `'100 years' === OPEN_BAND` | 1 (Trap 1 saturation) |
| 2 | `bandOfAgeLabel('  5  years ') === 5`, `'5  YEARS' === 5` | 1 (Trap 1 whitespace) |
| 3 | `over65`/`under20` pinned per year: `14.98/25.14`, `20.72/18.40`, `32.68/16.00` (independently decoded from the committed snapshots) | 15 (the whole `readoutOf` block) |
| 4 | `[year, state, hue]` per panel: `reference`, `measured`, `projected`; populations pinned | 5 |
| 5 | `excludedLabels === ['Total', 'Unknown']` (published value) | — |
| 6 | A two-variant projection reads **only** the pinned variant: totals 210, bands 22/41 | 2 (the projection filter, Trap 2-adjacent) |
| 7 | `excludedLabels` comes back **sorted** for a payload whose age order is `Unknown` before `Total` | 1 |
| 8 | The double-count message names both computed sums (`(2)` / `(3)`) | 1 (Trap 2 message) |
| 9 | A year with a population total but no bands is refused: `/age band 0 is missing for 2050/` | 3 |
| 10 | The ratio series is ascending, skips a year missing its denominator, and reads the `Total` row rather than the halves (50.00, not 57.14) and not the second variant (not 50.83) | 27 (incl. Trap 2 sex/variant guards) |
| 11 | `observedDependency` answers `null` when the published denominator has no population | 2 |
| 12 | `lastObservedYear` on a descending time axis answers 2025, not 2010 | 4 |
| 13 | A baseline variant that never publishes a complete year is refused: `/no baseline dependency series/` | 2 |
| 14 | `SERIES_IDS` / `SERIES_AVAILABILITY` closed sets; `isSeriesId` accepts both ids and rejects `'figure'`, `42`, `null` | 12 |
| 15 | `seriesById` resolves both series and answers `undefined` for an unknown id | 1 |
| 16 | The `age-structure` assumptions object, pinned field by field (bands, observedYears, projectedYear, variant, encoding, decimals, excludedLabels) | 13 |
| 17 | The `countdown` assumptions object, pinned field by field (threshold, denominator, variant, snapshotYear, the six-variant `variantsCrossing` string, backCast, observation) | 38 |

**Kill verification (not inferred from the score).** Each assertion was probed by applying the
mutation to the real source, running the new file, and restoring the file byte-identically
(md5 compared before/after — all 13 probes reported `restored=True`):

```
KILLED    band saturation (36:10 CondExpr->false)          (restored=True)
KILLED    whitespace tolerance (22:27 Regex)               (restored=True)
KILLED    sex-sum message operand (176:57)                 (restored=True)
KILLED    over65 predicate (232:27)                        (restored=True)
KILLED    projection filter removed (136:7)                (restored=True)
KILLED    excludedLabels sort (163:82)                     (restored=True)
KILLED    optional chaining (192:17)                       (restored=True)
KILLED    sex guard removed (83:7)                         (restored=True)
KILLED    year sort comparator (119:11)                    (restored=True)
KILLED    observed-year bound (152:75)                     (restored=True)
KILLED    denominator guard (172:10)                       (restored=True)
KILLED    empty-baseline throw (240:7)                     (restored=True)
KILLED    observedYears assumption (29:49)                 (restored=True)
```

---

## Evidence: mutation score (whole scope)

command: npx stryker run
exit: 0
at: 2026-10-26T14:27:38Z

```
series                   |  89.20 |   91.03 |      355 |         0 |         35 |        8 |        0 |
  age-bands.ts           |  97.62 |   97.62 |       41 |         0 |          1 |        0 |        0 |
  age-structure.ts       |  87.58 |   90.97 |      141 |         0 |         14 |        6 |        0 |
  countdown.ts           |  88.72 |   89.64 |      173 |         0 |         20 |        2 |        0 |
ingest                   |  91.79 |   93.06 |      738 |         0 |         55 |       11 |       16 |
sources                  |  90.38 |   90.93 |      450 |         1 |         45 |        3 |        0 |
manifest                 |  93.59 |   93.96 |      482 |         0 |         31 |        2 |        2 |
metrics                  |  93.62 |   94.26 |      278 |         1 |         17 |        2 |        0 |
All files                 |  91.69 |   92.64 |     2303 |         2 |        183 |       26 |       18 |
MutationTestExecutor  Done in 24 minutes and 18 seconds.
EXIT=0
```

Scope: **33 files, 2532 mutants** under `web/metrics/**`, `web/manifest/**`, `web/sources/**`,
`web/ingest/**` and `web/series/**`. Threshold for this tier: ≥ 80 %. Achieved **91.69 % total /
92.64 % covered**. `EXIT=0`; `thresholds.break` is `null`, so a non-zero exit would have meant a tool
failure, not a threshold miss — the verdict is asserted in this report, not delegated to the CLI. This
is the round-2 run, i.e. the tree described here.

---

## Evidence: `web/series/**` score (measured separately)

command: python3 -c "import json,collections; d=json.load(open('reports/mutation/mutation.json')); c=collections.Counter(m['status'] for p,f in d['files'].items() if p.startswith('web/series/') for m in f['mutants']); t=sum(c.values()); k=c['Killed']+c['Timeout']; print('web/series/**', dict(c), 'mutants', t); print('score %.2f covered %.2f' % (k/(t-c['RuntimeError'])*100, k/(t-c['RuntimeError']-c['NoCoverage'])*100))"
exit: 0
at: 2026-10-26T14:32:01Z

```
web/series/** {'NoCoverage': 8, 'Killed': 355, 'Survived': 35} mutants 398
score 89.20 covered 91.03
```

Reported separately, as asked, so the new code is not diluted by the 2134 older mutants: **89.20 %**
after this refresh, **77.39 %** on first measurement. The round-1 figure is the finding; the round-2
figure is what the shipped tests support.

---

## Evidence: final full test suite

command: npx vitest run
exit: 0
at: 2026-10-26T14:30:03Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  41 passed (41)
      Tests  522 passed (522)
```

**522 tests across 41 files, exit 0**, none skipped or disabled — the Verifier's 505 plus the 17 this
refresh added. This is the final run, executed after all mutation work and after the build.

---

## Evidence: app still builds

command: npm run build
exit: 0
at: 2026-10-26T14:30:16Z

```
> pensions-system@0.0.0 prebuild
> tsx scripts/verify-derived.ts && tsx scripts/check-content-scope.ts && tsx scripts/check-public-vocabulary.ts

derived figures verified: 7 (2 computed, 5 unavailable)
derived series verified: 2
country scope gate: clean (5 locales)
public vocabulary gate: clean (5 locales)

✓ Compiled successfully in 579ms
✓ Generating static pages using 11 workers (21/21) in 1046ms
```

`npx tsc --noEmit` exit 0 at 2026-10-26T14:30:07Z (no output). `npm run verify:derived` exit 0 at
2026-10-26T14:30:24Z (`derived figures verified: 7 (2 computed, 5 unavailable)` / `derived series
verified: 2`).

---

## Evidence: complexity gate (carried from the Refactorer, re-run here)

command: npx eslint .
exit: 0
at: 2026-10-26T14:30:09Z

```
(no output — clean)
```

`eslint.config.mjs` enforces `complexity: ['error', 6]`. Clean across the whole tree, including the
revision-2 series modules and the new test file (its payload builders were factored into small
helpers — `positionsOf`, `flatIndexOf`, `jsonStat` — to stay inside the limit).

---

## Evidence: scenario traceability (re-run, unaffected)

command: .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-10-26T14:30:12Z

```
{ "checks": [1, 2], "passes": ["AC-001-01 — traced to a test", …, "AC-001-99 — traced to a test"], "fails": [] }
```

99/99 scenarios visible to the gate still traced, `fails: []`, check 2 clean. **Same disclosed
limitation as the Verifier's revision-2 record:** the gate's regexes are `AC-[0-9]{3}-[0-9]{2}`, so
`AC-001-100`…`AC-001-107` (three-digit suffix) are invisible to both checks; the Verifier confirmed by
grep that all 107 headings exist and all 107 are cited by a test. The new tests cite no new scenario
id (they pin behaviour already covered by AC-001-93/94/95/98/99/100/101), so the count is unchanged.

---

## Evidence: audit-trail gate

command: .standards/scripts/check-audit-trail.sh 001-pension-math
exit: 0
at: 2026-10-26T14:32:19Z

```
PASS 001-pension-math: 10-tasks.md present and non-empty
PASS 001-pension-math: 20-acceptance/ has an AC-*.md with a '## AC-NNN-NN' heading (AC-015-10)
PASS 001-pension-math: 25-verification.md present and non-empty
PASS 001-pension-math: 30-report.md present and non-empty
PASS 001-pension-math: 15-design.md present and non-empty (AC-015-13)
PASS 001-pension-math: 40-deploy.md present and non-empty (AC-031-18)
PASS 001-pension-math: evidence block 'scenario traceability' — … at: 2026-10-25T22:38:30Z
PASS 001-pension-math: evidence block 'full test suite' — … at: 2026-10-25T22:39:00Z
PASS 001-pension-math: evidence block 'complexity gate' — … at: 2026-10-25T22:40:00Z
PASS 001-pension-math: evidence block 'design-principles gate' — … at: 2026-10-25T22:42:00Z
PASS 001-pension-math: evidence block 'scenario-to-behavior spot check' — … at: 2026-10-25T22:44:00Z
✔ Audit-trail check: specs/001-pension-math complete, verifier evidence recorded.
```

The gate reads the Verifier's five evidence blocks (the revision-1 blocks remain first in
`25-verification.md`; the revision-2 blocks appended there use the same heading strings). Stage 5b's
pre-push run will not block on it.

---

## Complexity summary (carried from the Refactorer)

- **Cyclomatic complexity ≤ 6:** `eslint.config.mjs` enforces `complexity: ['error', 6]`; ESLint
  exits 0 on the whole tree (re-confirmed above).
- **Duplication:** `check-code-principles.sh --tier production` reports **0 DRY FAILs** (the Verifier's
  revision-2 attempt-2 run: 1 FAIL total, 42 WARNs).
- **Design-principles gate (Verifier's revision-2 attempt 2, PASS for the deliverable):** exit 1 with
  **exactly one FAIL** — `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`),
  inside the `.standards/` submodule, out of scope and off-limits to pipeline agents. **Zero FAILs in
  project source.** The attempt-1 `component-per-file` FAIL on `app/(public)/[locale]/page.tsx` was
  resolved by the Refactorer's page→layout move and is gone (`PASS Component-per-file: no
  violations`). 42 WARNs recorded (29 project-source KISS/DRY review hints incl. the new
  `PyramidPlate`/`CountdownBlock` bodies, 13 `.standards` template WARNs) — WARN-level, not blocking,
  per the Stop-and-Ask matrix ("Design gate WARN → record, do not stop").
- **Property tests:** `tests/unit/properties.test.ts` uses `fast-check`; 0 property-test FAILs.
- **WARN-level, carried forward unchanged:** the project-source KISS/DRY WARNs. This stage adds none:
  the new test file's helpers are each under 20 lines.

---

## What this stage did not touch

- **No production code was edited.** The revision-2 modules are the Coder's and Refactorer's work;
  this stage measured them (and temporarily mutated them for kill verification, restoring each file
  byte-identically — md5 compared, 13/13 restored).
- **No existing test was edited.** The 505 tests the Verifier passed are byte-identical; this stage
  added one file.
- **No gate config was changed except the scope.** `stryker.config.mjs`'s `mutate` globs gained
  `web/series/**/*.ts` — a widening, which can only make the gate harder. Thresholds, mutators,
  `ignorePatterns`, `eslint.config.mjs`, `vitest.config.ts` and `.gitignore` are untouched. No
  `// Stryker disable` comment was added anywhere.
- **Nothing outside the allowed surface was edited.** `specs/**` changed only in this file; `.standards/**`
  is untouched.
- **Nothing was committed or pushed.** That is stage 5b's job.
- `reports/mutation/mutation.json` is left in place as the machine-readable evidence for this report;
  `.stryker-tmp/` is gitignored and cleaned by the run.

---

## Remediation record

**Stage 5a, this refresh: none** — no BLOCK occurred during this stage. The mutation gate never
reported BLOCK; the two rounds were a baseline plus one test-strengthening pass, not a fix-and-retry
loop against a failing gate. Both rounds exited 0. The below-threshold round-1 reading on
`web/series/**` was closed inside this stage's own budget, not by handing a BLOCK to another stage.

**Carried forward from `25-verification.md` (read, not guessed or invented):**

| Phase | Attempt | Trigger | Outcome |
|---|---|---|---|
| 1 (pre-PR) | 1 | first full run | PASS |
| 1 (pre-PR) | 2 | finding F1 (this stage's first report) — `centralCellOf` compared a deflated rate to a nominal band centre | PASS after the Coder's fix; three pre-existing assertions adjudicated legitimate (1 shape pin, 2 that encoded the defect). Budget state at that attempt: `SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=1`, `SPEC_PHASE2_RETRIES=0` |
| 1 (pre-PR) | 3 | hero ladder swap + percent-scale fix | PASS; `SPEC_LOOP_COUNT=2`, `SPEC_PHASE1_RETRIES=2`, `SPEC_PHASE2_RETRIES=0` |
| 2 (post-PR CI) | 1 | six `backend-ci-go` checks on a TypeScript-only repo (`##[error]The specified go version file at: go.mod does not exist`) | FAIL — routed to the repo owner (CI config, not spec code) |
| 2 (post-PR CI) | 2 | `ci.yml` fixed in `68f6e64` (Go workflow removed) | PASS — phase-2 budget 2 of 3 used |

**Revision-2 scope cycle** (a new cycle: `SPEC_PHASE1_RETRIES` reset to 0 for it, as the Verifier
documents and justifies; `SPEC_LOOP_COUNT=3`, `SPEC_PHASE2_RETRIES=2` carried forward):

| Phase | Attempt | Trigger | Outcome |
|---|---|---|---|
| 1 (pre-PR, cycle 2) | 1 | first revision-2 run | **FAIL** — design-principles gate: `Component-per-file: ./app/(public)/[locale]/page.tsx exports 5 functions/components (threshold: ≤4)`, newly introduced by T19's `generateMetadata` |
| 1 (pre-PR, cycle 2) | 2 | `dynamicParams` moved to a new `[locale]/layout.tsx` (page back to 4 exports) | **PASS** — component-per-file clean, 505 tests, route config re-verified |

So: **two Phase 1 BLOCKs in revision 1** (resolved at attempts 2 and 3 of the original cycle) and
**one Phase 1 BLOCK in revision 2** (resolved at attempt 2 of the new scope cycle). **Phase 2: two
attempts, one FAIL one PASS.** Phase 3 (deploy verification) has not run. The orchestrator supplied no
loop summary beyond `25-verification.md`'s attempt headers; none is inferred here.

---

## Flagged to the next stage

1. **The 93.83 % figure is retired.** It described pre-revision-2 code. The current tree is
   **91.69 %** over 33 files / 2532 mutants, and `web/series/**` is **89.20 %** on its own.
2. **`web/series/**` is above the line now but was not on first measurement (77.39 %).** If a later
   revision adds calculation code to `web/series/`, re-measure it separately before trusting the
   aggregate — the whole point of the split figure.
3. **The two traps are covered — but two of their assertions had been weaker than the surrounding
   prose claimed.** `over65`/`under20` had no value assertion (15 mutants), and the dependency ratio
   was only ever exercised on a payload whose sex halves reconcile, which makes a sex-summing bug
   arithmetically invisible. Both are now explicit.
4. **Highest-value residual: `age-structure.ts`'s "no denominator" guard (7 mutants)** — a year
   publishing bands but no `Total` row is currently untested, and that is the guard that stops a
   division by a missing population. Second: the `openBandShare` predicate (3 mutants), which is the
   open-band trap's own helper.
5. **`web/ingest/run-series.ts` is at exactly 80.00 %** with the largest cluster (12 mutants) in
   provenance fields — the series manifest's `fetchedAt` and `inputHash` have no value assertions at
   all, while the figures' equivalents do. That is a genuine gap in the series' provenance contract,
   not a defensive branch.
6. **`web/manifest/validate.ts:29`** — a manifest built without `snapshotYear` may now carry a
   `snapshotYear: undefined` key without any test noticing (`toEqual` ignores undefined properties).
7. **Carried forward unchanged from the Verifier**: 42 project-source WARNs (KISS method bodies above
   20 lines, DRY 4-line blocks — now including `PyramidPlate` and `CountdownBlock`) and one
   out-of-scope FAIL inside `.standards/`.
8. **`25-verification.md`'s revision-2 attempt-2 block is the verification of record** for the tree
   this report measures. If code changes again before stage 5b, this report is stale and must be
   re-run — the mutation score is a property of a tree, not of a spec number.

---

**Verdict: GREEN**

Mutation score **91.69 % total / 92.64 % covered** on the expanded 33-file scope (2532 mutants:
2305 killed or timed out, 183 survived, 26 uncovered, 18 runtime errors excluded by the tool), with
**89.20 %** measured separately on `web/series/**` (was 77.39 % at round-1 baseline; the gate is met
and both encoding traps are killed). 111 of the 209 non-killed mutants are equivalent or dead and are
named above; the 98 reachable residuals are grouped with the assertion that would kill each. F1 remains
closed (15/18, three equivalent). Final suite **522/522 across 41 files**, app builds (21/21 static
pages), `tsc` and ESLint clean, traceability 99/99 visible to the gate.

---

## PR

PR: https://github.com/RexiAI/pensions-system/pull/3

Commits: 16 (one per task T1–T16; 17 including the previous record commit), carried forward from the
previous report — this refresh has not committed or pushed anything. Revision 2's work (T17/T18/T19,
R3/R5/R6) is still uncommitted on the working tree and belongs to stage 5b, which will add it to the
same `spec/001-pension-math` branch. The spec is **not** archived in this PR: `scripts/archive-spec.sh`
is stage 5d, which runs after stage 5c's deploy verification.
