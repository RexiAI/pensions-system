# 30 — Report: pension-math

Stage 5a (Mutation Runner), **revision-3 refresh**. Conformance tier `production`, so the mutation
gate applies. Read `25-verification.md`, `10-tasks.md`, `20-acceptance/`, `15-design.md`. Did **not**
read `00-informal.md`.

**Verdict: GREEN**

- **Whole scope: 91.71 %** (92.66 % over covered mutants) across **38 files / 2791 mutants**,
  threshold ≥ 80 %. The full run measured **90.93 % / 92.50 %**; the 91.71 % substitutes one file's
  repaired measurement (§Wrapper gate) — both numbers and the arithmetic are below.
- **`web/series/**`: 90.73 % (92.07 % covered), 550 mutants.** It was **81.09 %** on this refresh's
  baseline. Revision 3's new clock is the reason it moved: `clock-ticker.ts` went **44.44 % → 95.96 %**
  and `clock.ts` **88.68 % → 92.45 %**.
- **The traceability wrapper: 87.25 % (89.90 % covered), 106 mutants** — but read §Wrapper gate before
  trusting that: the *full run* measured it at **66.34 %**, below the line, because the new CLI test
  could not execute inside vitest's worker pool. That was a defect in my test, not in the gate. The
  repair is enumerated; both figures are stated rather than the flattering one alone.
- **The clock's null-threshold branch has four surviving mutants and they are provably equivalent**
  — the guard is redundant with `Number.isInteger`, which already rejects every value the guard
  rejects. **No surviving mutant anywhere can render or tick a clock without an anchor, and none can
  tick under reduced motion.** Proof per branch in §The clock's two guarantees.
- **`web/content/budgets.ts` (T21): 100 %** of 1 mutant — the five per-locale budgets are pinned by
  an exact-object assertion.
- Rounds that produced scores: **2** (baseline + one test batch). One further *scoped* re-measurement
  of the wrapper repaired a broken measurement; accounting in §Rounds run.
- Final full suite: **630 tests, 51 files, 0 failures** (was 599; this stage added 32 and removed one
  of its own — net 31).
- App builds: `npm run build` exit 0, `tsc --noEmit` exit 0, `eslint` exit 0, traceability 119/119.
- Files changed: three new test files, `stryker.config.mjs` (scope), this report. **No production
  code was edited; no existing test was modified; no mutator disabled; no threshold changed; no
  `// Stryker disable` added.**

---

## Revision history

| When | Verdict | Score | Scope | Tests | What the tree looked like |
|---|---|---|---|---|---|
| 2026-10-25T23:25:50Z | GREEN | 92.74 % / 93.51 % covered, 1846 mutants | 28 files | 388 | Before F1 was fixed. |
| 2026-10-26T08:16:47Z | GREEN | 93.83 % / 94.40 % covered, 1846 mutants | 28 files | 415 | After F1, the hero ladder and the percent-scale fix. **The figure the earlier briefs call "the 93.83 %".** |
| 2026-10-26T14:27:38Z | GREEN | 91.69 % / 92.64 % covered, 2532 mutants | 33 files | 522 | Revision 2 (T17 age structure, T18 countdown, T19 scope mark). **The figure the previous brief calls "91.69 %".** |
| 2026-10-28T11:41:05Z (this refresh, round 1 — **baseline, no test changes**) | GREEN | 88.55 % / 91.35 % covered, 2791 mutants | 38 files | 599 | **Revision 3 exists**: the anchored clock (`clock.ts`, `clock-ticker.ts`, `countdown.ts` amended with `anchor`), the T21 statement budget (`web/content/budgets.ts`), and the four fixes (per-locale `<html lang>`, manifest icons in `public/`, `og:image:alt`, the 3-digit traceability wrapper). |
| **2026-10-28T12:15:17Z** (this refresh, round 2) | GREEN | **90.93 % / 92.50 %**, 2791 mutants | 38 files | 630 | Same tree plus this stage's 32 new tests. |
| **2026-10-28T12:21:35Z** (scoped re-measurement) | GREEN | wrapper **87.25 % / 89.90 %** | 1 file, 106 mutants | 630 | Same tree; the CLI test repaired so it can run in a worker. **Recomputed whole-scope total: 91.71 % / 92.66 %.** |

**Two earlier figures are retired by this note and must not be quoted as describing the current tree:**

1. **93.83 %** described pre-revision-2 code (28 files, 1846 mutants). It has not been a description of
   this repository since revision 2.
2. **91.69 %** (2026-10-26) described revision 2 — 33 files, 2532 mutants, no clock. The current tree is
   **91.71 % over 38 files and 2791 mutants**, and the two 91.69/91.71 figures are numerically close by
   coincidence, not by inheritance: the denominator grew by 259 mutants that did not exist then
   (`clock.ts` 53, `clock-ticker.ts` 99, `budgets.ts` 1, the wrapper 106), and the older 33 files still
   score exactly what they scored before (see §Like-for-like).

The like-for-like comparison is clean: the **33 files that made up the previous run's scope score
91.69 % / 92.64 % over 2532 mutants** in this refresh's round 2 — identical to the previous report to
the second decimal, because revision 3 did not touch them. All of revision 3's movement is in the five
new files.

---

## Precondition

`specs/001-pension-math/25-verification.md` exists and its most recent overall verdict is **PASS**
("Revision 3 + defect fixes verification", attempt 1): scenario traceability 119/119 via the repo-local
wrapper (99/119 visible to the upstream gate, disclosed), full suite 599/48, `tsc`/`eslint`/`build`/
`verify:derived` all exit 0, design-principles gate PASS for the deliverable (sole FAIL is the
out-of-scope `.standards/` hallmark example), scenario-to-behavior spot check PASS against the served
app including the clock's no-threshold / reduced-motion / ticking / a11y behaviour.

Mutation work ran on that basis; nothing below re-litigates it.

The working tree is dirty and every dirty entry is this pipeline's own uncommitted output. Nothing was
stashed, reverted or auto-committed. During kill verification `web/series/clock.ts`,
`web/series/clock-ticker.ts` and `scripts/check-scenario-traceability-3digit.ts` were mutated in place
and restored **byte-identically** (md5 compared before and after — 11/11 probes `restored=True`).

---

## Mutation configuration

Two scope changes, both required by the brief, plus one sandbox change required by the first. **No
mutator was disabled, no threshold was changed, no `// Stryker disable` comment was added anywhere.**

```
mutate:
  web/metrics/**/*.ts
  web/manifest/**/*.ts
  web/sources/**/*.ts
  web/ingest/**/*.ts
  web/series/**/*.ts                                  ← revision 2, carried forward
  web/content/budgets.ts                              ← added: T21's per-locale statement budget
  scripts/check-scenario-traceability-3digit.ts       ← added: the 3-digit traceability gate

ignorePatterns: … , `.github`, …    ( `specs` REMOVED from this list — see below )
thresholds: high 80, low 80, break null   (reported, not enforced — this report is the verdict)
```

1. **`web/content/budgets.ts` — one file, not all of `web/content/**`.** The brief asks for "the
   per-locale statement budget logic from T21". That module is the only file in `web/content/` carrying
   a product claim (the two-line headline fit); the rest of the directory is presentation formatting,
   which the scope has always excluded for the reason given in the config header.
2. **`scripts/check-scenario-traceability-3digit.ts`** — the brief names it as part of the pipeline's
   correctness. It is the one `scripts/*.ts` that can be mutated meaningfully, because it *isn't* a
   side-effect-at-import entry point: it guards the invocation with `import.meta.url` and exports
   `checkTraceability`/`declaredScenarios`/`citedScenarios`. The stated reason for excluding the other
   scripts (a subprocess-only entry point is a permanent 0 % that measures nothing) therefore does not
   apply to it.
3. **`specs` removed from `ignorePatterns`** — a sandbox change the second item forced. The wrapper's
   test "covers this repository beyond the 99-scenario ceiling" reads `specs/001-*/20-acceptance/`; with
   `specs` excluded from the Stryker sandbox the gate saw zero scenarios, that test failed, and **no
   mutation run started at all** (first invocation, `ConfigError: There were failed tests in the initial
   test run`, 2026-10-28T11:12:44Z). Copying one directory of markdown is the whole cost; nothing under
   `specs/` is mutated, and no threshold or mutator moved.

Still excluded, unchanged: `web/components/**` and `app/**` (React/Next markup — revision 3's
`CountdownClock.tsx` and the `CountdownBlock` rail live there), the rest of `web/content/**`, `data/**`
and generated files, `.standards/**` (submodule, off-limits), and the other `scripts/*.ts` entry points.
`web/seo/**` and `web/shell/**` are outside the scope for the same reason as `web/components/**`; their
evidence is the acceptance suite and the Verifier's served-app check, not a mutation score.

### Scope as measured

| Area | Files | Mutants | Round-2 score (total / covered) |
|---|---|---|---|
| `web/metrics/**` | 8 | 298 | 93.62 / 94.26 |
| `web/manifest/**` | 5 | 517 | 93.59 / 93.96 |
| `web/sources/**` | 8 | 499 | 90.38 / 90.93 |
| `web/ingest/**` | 9 | 820 | 91.79 / 93.06 |
| **`web/series/**`** | **5** | **550** | **90.73 / 92.07** |
| `web/content/budgets.ts` | 1 | 1 | 100.00 / 100.00 |
| `scripts/…3digit.ts` (wrapper) | 1 | 106 | **66.34 / 83.75 → 87.25 / 89.90 repaired** |
| **All files** | **38** | **2791** | **90.93 / 92.50 → 91.71 / 92.66 recomputed** |

`web/manifest/types.ts` and the other pure-type modules generate no mutants and do not appear.

---

## Rounds run

| # | What it was | Score (total) | killed | timeout | survived | no cov | runtime err | `web/series/**` | wrapper | ended (UTC) |
|---|---|---|---|---|---|---|---|---|---|---|
| — | **pre-flight, aborted** — no mutants tested | — | — | — | — | — | — | — | — | 2026-10-28T11:12:50Z |
| 1 | baseline, **no test changes** | 88.55 % | 2449 | 2 | 232 | 85 | 23 | **81.09 %** | 53.47 % | 2026-10-28T11:41:05Z |
| 2 | after the 32-test batch | **90.93 %** | **2515** | **2** | **204** | **47** | **23** | **90.73 %** | 66.34 % (broken measurement) | 2026-10-28T12:15:17Z |
| 2b | **scoped re-measurement** of the wrapper after repairing that test | — | 89 | 0 | 10 | 3 | 4 | — | **87.25 %** | 2026-10-28T12:21:35Z |

Score convention (Stryker's own): `(killed + timeout) / (total − runtimeErrors)`; `covered` further
excludes no-coverage mutants.

**Budget accounting, stated plainly.** The brief allows two rounds. Two rounds produced scores: round 1
(a baseline) and round 2 (the single test batch). The pre-flight above is not a round — it aborted in
the dry run before a single mutant was tested, because of the `specs` sandbox exclusion. **2b is not a
round either**: it added no test to kill a survivor and changed no source; it re-measured one file after
fixing a test that could not execute, so that the number reported for the wrapper describes the tests
that exist. If a reader counts 2b against the budget, the consequence is the same either way — no third
batch of tests was written against survivors, and the residual gaps are named rather than chased
(§Reachable residual gaps).

---

## Results

### Per file (round 2, verbatim from the run)

```
 file                                  | score  | cov    | killed | time | surv | nocov | err
 scripts/check-scenario-traceability-3digit.ts |  66.34 |  83.75 |    67 |    0 |   13 |   21 |    5
 web/content/budgets.ts                | 100.00 | 100.00 |      1 |    0 |    0 |    0 |    0
 web/ingest/deterministic-json.ts      | 100.00 | 100.00 |     14 |    0 |    0 |    0 |    0
 web/ingest/figures.ts                 |  94.47 |  95.92 |    188 |    0 |    8 |    3 |   14
 web/ingest/run-compute.ts             |  93.00 |  94.90 |    186 |    0 |   10 |    4 |    0
 web/ingest/run-series.ts              |  80.00 |  81.97 |    100 |    0 |   22 |    3 |    0
 web/ingest/series-types.ts            |  92.31 |  92.31 |     12 |    0 |    1 |    0 |    0
 web/ingest/series.ts                  |  86.67 |  88.14 |     52 |    0 |    7 |    1 |    2
 web/ingest/types.ts                   | 100.00 | 100.00 |     11 |    0 |    0 |    0 |    0
 web/ingest/validate-figure.ts         |  96.97 |  96.97 |    160 |    0 |    5 |    0 |    0
 web/ingest/write-derived.ts           |  88.24 |  88.24 |     15 |    0 |    2 |    0 |    0
 web/manifest/definitions.ts           |  87.60 |  88.98 |    113 |    0 |   14 |    2 |    2
 web/manifest/formula-ids.ts           |  93.75 |  93.75 |     15 |    0 |    1 |    0 |    0
 web/manifest/hash.ts                  |  93.94 |  93.94 |     31 |    0 |    2 |    0 |    0
 web/manifest/repo-file.ts             | 100.00 | 100.00 |     16 |    0 |    0 |    0 |    0
 web/manifest/validate.ts              |  95.64 |  95.64 |    307 |    0 |   14 |    0 |    0
 web/metrics/cohort-irr.ts             |  96.00 |  96.00 |     48 |    0 |    2 |    0 |    0
 web/metrics/contribution-cover.ts     | 100.00 | 100.00 |     38 |    0 |    0 |    0 |    0
 web/metrics/dependency-ratio.ts       | 100.00 | 100.00 |     40 |    0 |    0 |    0 |    0
 web/metrics/implicit-debt.ts          | 100.00 | 100.00 |     10 |    0 |    0 |    0 |    0
 web/metrics/npv.ts                    |  81.11 |  82.95 |     72 |    1 |   15 |    2 |    0
 web/metrics/pension-share.ts          | 100.00 | 100.00 |     36 |    0 |    0 |    0 |    0
 web/metrics/required-base-growth.ts   | 100.00 | 100.00 |     29 |    0 |    0 |    0 |    0
 web/metrics/rounding.ts               | 100.00 | 100.00 |      5 |    0 |    0 |    0 |    0
 web/series/age-bands.ts               |  97.62 |  97.62 |     41 |    0 |    1 |    0 |    0
 web/series/age-structure.ts           |  87.58 |  90.97 |    141 |    0 |   14 |    6 |    0
 web/series/clock-ticker.ts            |  95.96 |  95.96 |     95 |    0 |    4 |    0 |    0
 web/series/clock.ts                   |  92.45 |  92.45 |     49 |    0 |    4 |    0 |    0
 web/series/countdown.ts               |  88.72 |  89.64 |    173 |    0 |   20 |    2 |    0
 web/sources/countries.ts              |  93.22 |  93.22 |     55 |    0 |    4 |    0 |    0
 web/sources/eurostat.ts               |  89.52 |  90.38 |    187 |    1 |   20 |    2 |    0
 web/sources/freshness.ts              | 100.00 | 100.00 |     29 |    0 |    0 |    0 |    0
 web/sources/ine.ts                    |  95.71 |  95.71 |     67 |    0 |    3 |    0 |    0
 web/sources/labels.ts                 |  78.72 |  78.72 |     37 |    0 |   10 |    0 |    0
 web/sources/live.ts                   |  90.91 |  90.91 |     40 |    0 |    4 |    0 |    0
 web/sources/load.ts                   |  82.14 |  85.19 |     23 |    0 |    4 |    1 |    0
 web/sources/types.ts                  | 100.00 | 100.00 |     12 |    0 |    0 |    0 |    0
 All files                             |  90.93 |  92.50 |   2515 |    2 |  204 |   47 |   23
```

One older file remains below 80 % individually — `web/sources/labels.ts` at 78.72 % — exactly as in
every prior run; its ten survivors are all proven equivalent (§Equivalent mutants). **No file in the
revision-3 surface is below the line**, and the wrapper's 66.34 % in this table is the measurement
defect, not a property of the gate (§Wrapper gate).

### Round 2, per new file

| File | Round 1 | Round 2 | Mutants killed by the new tests |
|---|---|---|---|
| `web/series/clock-ticker.ts` | 44.44 % | **95.96 %** | 51 (37 no-coverage → 0) |
| `web/series/clock.ts` | 88.68 % | **92.45 %** | 2 |
| `web/content/budgets.ts` | 100.00 % | 100.00 % | 0 (already pinned) |
| `scripts/…3digit.ts` | 53.47 % | 66.34 % → **87.25 %** repaired | 12 + 22 more after the repair |
| `web/series/countdown.ts` | 88.72 % | 88.72 % | 0 (see §Reachable residual gaps) |

---

## The clock's two guarantees

The brief singles these out, correctly: a survivor here would matter more than the aggregate. Both
were measured, and the outcome is stated precisely — including the four mutants that do survive.

### Guarantee 1 — no anchor, no clock

The chain is: `computeCountdown` derives `thresholdYear`; `anchorFor(thresholdYear)` returns `null`
when there is none; the value's `anchor` is that `null`; and the component (out of mutation scope) only
mounts a clock from a non-null anchor.

| Link | Mutant | Status | What decides it |
|---|---|---|---|
| `countdown.ts:260` `anchor: anchorFor(state.thresholdYear)` | 6 mutants at the call and its argument | **Killed** | `clock.test.ts` pins `countdownValue().anchor === ANCHOR` and `countdownAt(40/60).anchor === anchorFor(thresholdYear)`; the new test adds `countdownAt(90).anchor === null` and `.thresholdYear === null` and `.years === null`, so an anchor derived from the snapshot year, from the threshold, or from a constant all fail. |
| `clock.ts:48-52` `anchorFor` | `51:47` `padStart(4,'0')` fill → `''` | **Killed** (new) | `anchorFor(42) === '0042-01-01T00:00:00+01:00'`. Without the fill, `String(42)` yields `42-01-01…`, which is *not* the ISO instant. Hand-probed: the new file fails. |
| `clock.ts:50` `!Number.isInteger(thresholdYear)` | `Number.isInteger` mutants | **Killed** | `anchorFor(NaN / Infinity / 2042.5 / -1.5) === null` (new). |
| `clock.ts:49` `if (null \|\| undefined) return null` | **4 survivors** — `49:7` ConditionalExpression→false ×2, `49:7` LogicalOperator `\|\|`→`&&`, `49:33` ConditionalExpression→false | **Equivalent, and that is proven, not assumed** | `Number.isInteger` rejects **every** value the guard rejects: `Number.isInteger(null)`, `(undefined)`, `(NaN)`, `(Infinity)`, `(2042.5)` are all `false`, so line 50 returns `null` in exactly the cases line 49 does. For every integer both lines fall through to the same `return`. The guard is redundant defence; the *guarantee* is carried by lines 50-51, whose mutants are killed. No test can distinguish the guard, and none should be written that pretends to. |

**Answer to the brief's question:** four mutants survive inside the null-threshold branch, all at
`clock.ts:49`, and none of them can make a clock appear without an anchor — they only remove a check
that a later check duplicates. There is **no surviving mutant that produces an anchor for a missing
threshold year**.

### Guarantee 2 — reduced motion creates no timer

`startClockTicker` creates an interval only through `runnable()`, which is false when the ticker is
stopped, false when `motionQuery.matches` is true, and false when the reading is already elapsed.

| Behaviour | Mutant | Status | What decides it |
|---|---|---|---|
| No interval at mount under reduced motion | `runnable`'s `if (context.reduced()) return false` | **Killed** | AC-001-112's `scheduled === []`, plus the new "reduced motion at mount" case. |
| A live switch **to** reduced motion clears the timer | `onMotionChange` `125:7` ×2, `125:26`, `126:5` (the whole clear branch) | **Killed** (new) | The new test emits `matches: true` on a running ticker and asserts `cancelled === [1]` and that no further tick arrives. Before this stage the listener was never registered by any test — the entire transition path was unexecuted. |
| A live switch **back** to motion recomputes and restarts | `onMotionChange` `129:3`, `130:3`, `124:55` | **Killed** (new) | `created === [1]` and `ticks === [3]` at the instant motion is allowed, not one tick later. |
| A change that leaves motion allowed does not thrash the timer | `125:7` ConditionalExpression→true | **Killed** (new) | `created` stays `[1]` after a redundant `matches: false` event. |
| `stop()` detaches the motion listener | `171:7`, `168:25`, `170:34`, `163:27`, `164:3` | **Killed** (new) | The fake query records the event name (`'change'`) and `removed === ['change']`; a post-`stop` event cannot restart. |
| The query asked for is the reduce-motion query | `41:30` StringLiteral→`''` | **Killed** (new) | With `window` stubbed, `matchMedia` receives exactly `'(prefers-reduced-motion: reduce)'`. Ask for the wrong feature and motion is never reduced. |
| `NO_MOTION` is "motion allowed" | `51:43` BooleanLiteral→`true` | **Killed** (new) | No window in Node ⇒ an interval *is* created. |
| `NO_MOTION`'s shape | `51:32` ObjectLiteral→`{}` | Survived — **equivalent** | `{}` makes `matches` `undefined`, which is falsy exactly like `false`; `reduced()` and `runnable` treat them identically. |
| `NO_DOCUMENT`'s visibility | `45:20` StringLiteral→`''` | Survived — **equivalent** | `NO_DOCUMENT`'s `addEventListener` is a no-op, so `onVisibilityChange` is never called with that source; the field is never read. |
| `matchMedia` absent but `window` present | `58:40` ConditionalExpression→false | Survived — **reachable gap** | Original returns `NO_MOTION`; the mutant calls `window.matchMedia(...)` and throws. Killing it needs a `window` stub with **no** `matchMedia` — see §Reachable residual gaps. Name: *an old engine that has `window` but no `matchMedia` must not throw*. |

**Answer to the brief's question:** no surviving mutant can start a timer under reduced motion, keep
one alive through a switch to reduced motion, or resurrect one after `stop()`. The one reachable
survivor in this family (`58:40`) fails the *opposite* way — it throws where the code is meant to fall
back — and is named with the assertion that would kill it.

### Why the clock's own tests were the gap, not the aggregate

Round 1 measured `clock-ticker.ts` at 44.44 % with **37 mutants at zero coverage**: `onMotionChange`,
both default scheduling primitives, `defaultMotionQuery`, and the `stopped` flag were never executed by
any test. The existing suite tested the timer's *creation* (AC-001-114) and its absence under reduced
motion (AC-001-112), but never a *transition*. That is exactly the failure mode the brief warned about:
a green aggregate hid a module where the reader's own preference change was untested.

---

## Equivalent mutants — no test can distinguish them

**128 non-killed mutants are equivalent or dead.** 111 were named in the previous report and are
carried forward unchanged (the files and their mutant sets are byte-identical — the 33-file scope
reproduces 91.69 % exactly); 17 are new and are named here in full.

| File | Coordinates | Count | Why it cannot be killed |
|---|---|---|---|
| **`web/series/clock.ts`** | 49:7 (×3), 49:33 | **4** | `Number.isInteger` rejects every value the null/undefined guard rejects, so the guard cannot change any answer. Proof in §Guarantee 1. |
| **`web/series/clock-ticker.ts`** | 51:32 | 1 | `{ matches: false }` → `{}` leaves `matches` `undefined`, which is falsy exactly like `false`. |
| **`web/series/clock-ticker.ts`** | 45:20 | 1 | `NO_DOCUMENT.visibilityState` is never read: that stand-in's `addEventListener` is a no-op, so no `visibilitychange` ever reaches `onVisibilityChange`. |
| **`web/series/clock-ticker.ts`** | 77:37 | 1 | `(typeof handle === 'object' && true)` differs only for a `null` handle, and `clearHandle` returns before calling `cancel` when the handle is `null` — the null never arrives. |
| **`scripts/…3digit.ts`** | 43:7, 44:9, 45:11 | 3 | The `filesUnder` guard and its `catch` are shadowed: `walk` has its own `try/readdirSync/catch → []`, so for a file path and for a missing path both forms return `[]`. |
| **`scripts/…3digit.ts`** | 32:11, 33:12 | 2 | `walk`'s own `catch → []` body: every path `walk` receives came from a successful `statSync`/`readdirSync` of its parent, so it cannot throw here in any reachable state. |
| **`scripts/…3digit.ts`** | 48:10 (`.sort()` dropped) | 1 | The map's **values** (which file declared an id) are never read — both `checkTraceability` and the tests use `.keys()`/`.size`/`.has`, and the two report arrays are sorted independently. |
| **`scripts/…3digit.ts`** | 54:30, 55:38 | 2 | `join(root, 'specs')`→`join(root, '')` and `'changes'`→`''` widen the walk to the root and to `docs/`; the `20-acceptance` filter and the one-pager scan still select exactly the same files in any layout whose acceptance directory is under `specs/` and whose archive is `docs/changes/`. Unobservable here; equivalent *for this repository's layout*, stated with that qualifier. |
| **`scripts/…3digit.ts`** | 60:11 (`if (match[1])`→true) | 1 | The heading regex has a capture group, so `match[1]` is always a string when the pattern matched; the guard's other branch is unreachable. |
| **`scripts/…3digit.ts`** | 72:11 (`if (!cited.has(id))`→true) | 1 | First-file-wins vs last-file-wins attribution; the map's values are never read (same reason as 48:10). |
| `web/series/age-bands.ts` | 36:10 (`>=`→`>`) | 1 | 100 is a multiple of the band width, so both forms agree on every integer age. |
| `web/series/age-structure.ts` | 139:73, 194:7, 194:50, 195:27, 260:53, 262:109 | 6 | Carried forward unchanged. |
| `web/series/countdown.ts` | 59:7 (×2), 59:47, 99:41, 214:7, 247:17 | 6 | Carried forward unchanged. |
| `web/ingest/run-series.ts` | 44:13, 56:13, 61:37 | 3 | Carried forward unchanged. |
| `web/ingest/series-types.ts` | 20:10 | 1 | Carried forward unchanged. |
| `web/ingest/series.ts` | 22:7, 22:8, 22:44, 28:12 | 4 | Carried forward unchanged. |
| `web/ingest/figures.ts` | 33 (×3), 88 (×2), 244 (×2), 252 (×3), 261 | 11 | Carried forward unchanged (the F1 group is closed at 15/18; three equivalent). |
| `web/ingest/run-compute.ts` | 65, 128 (+ dead 95, 209, 292, 347) | 6 | Carried forward unchanged. |
| `web/ingest/validate-figure.ts` | 29, 122 (×2) | 3 | Carried forward unchanged. |
| `web/ingest/write-derived.ts` | 6, 22 | 2 | Carried forward unchanged. |
| `web/manifest/definitions.ts` | 36 (×3), 40, 152, 158, 166, 183, 231, 233 (×4), 254 (×2) | 15 | Carried forward unchanged. |
| `web/manifest/validate.ts` | 145 (×8) | 8 | Carried forward unchanged. |
| `web/manifest/hash.ts` | 14, 20 | 2 | Carried forward unchanged. |
| `web/manifest/formula-ids.ts` | 19 | 1 | Carried forward unchanged. |
| `web/metrics/npv.ts` | 40, 42, 65 (×7), 66, 86, 91 (+ dead 41 ×5) | 17 | Carried forward unchanged. |
| `web/metrics/cohort-irr.ts` | 66 (×2) | 2 | Carried forward unchanged. |
| `web/sources/labels.ts` | 6, 7, 18, 19, 29, 31, 33 (×4), 36 | 10 | Carried forward unchanged. |
| `web/sources/countries.ts` | 64 (×2), 110 (×2) | 4 | Carried forward unchanged. |
| `web/sources/live.ts` | 38 (×2), 54, 67 | 4 | Carried forward unchanged. |
| `web/sources/ine.ts` | 23, 45, 50 | 3 | Carried forward unchanged. |
| `web/sources/load.ts` | 39 | 1 | Carried forward unchanged. |
| `web/sources/eurostat.ts` | 131 | 1 | Carried forward unchanged. |

The carried-forward rows keep their original reasons; they are reproduced here rather than re-derived
because the files are unchanged and the survivor coordinates are identical in both runs of this
refresh.

---

## Reachable residual gaps — named with the assertion that would kill each

**102 non-killed mutants are real gaps.** 98 were named in the previous report (older files, unchanged,
carried forward — that table stands and is not reproduced in full here); 4 are new. None sits on a
published calculation except where noted, and the four new ones are listed in full.

| File | Mutants | Coordinates | What would kill it |
|---|---|---|---|
| **`web/series/clock-ticker.ts`** | 1 | `58:40` | **An old engine with `window` but no `matchMedia` must not throw.** Stub `window` to `{}` (no `matchMedia`) and call `startClockTicker` with no `motionQuery`: the original answers `NO_MOTION` and schedules; the mutant calls `undefined()` and throws. This is the only survivor in the reduced-motion family and it fails safe-to-loud, not safe-to-silent. |
| **`scripts/…3digit.ts`** | 1 | `44:46` | **A repository whose `tests` path is a file rather than a directory must yield an empty citation set, not a crash.** Fixture with `tests` as a file: original returns `[]`; the mutant returns `['Stryker was here']` and the next `readFileSync` throws. Contrived (1 mutant), recorded rather than chased. |
| **`scripts/…3digit.ts`** | 1 | `123:3` ConditionalExpression→true | **Loading the module outside the gate must not run the gate.** The mutant forces `invokedAsScript` true, so any importer triggers `process.exit`. In an in-process suite this cannot be a *kill*: the mutant kills the test worker instead, which Stryker records as a runtime error (4 such records in every run). Structural, not a coverage hole. |
| **`scripts/…3digit.ts`** | 1 | `69:44` (`'.ts'`→`''`) | **Killed by hand-probe, credited as survived by the tool.** Applying `['', '.tsx']` by hand makes the "*an id in a markdown note is not a citation*" test fail; I verified the mutation and its kill directly (`KILLED`, restored byte-identically). Stryker's scoped run credited it as survived, so the tool's 87.25 % is the conservative figure. |
| `web/series/countdown.ts` | 20 | Unchanged from the previous report: `66:7` (×2), `91:10`, `104:9`, `124:28` (×2), `136:10`, `137:25` (×2), `143:42`, `160:10` (×2), `184:10`, `221:7`, `224:7` (×3), `224:29`, `255:17` | Carried forward unchanged — the previous report's table gives the assertion for each cluster. The `anchor` amendment itself is **fully killed** (Guarantee 1); these are revision-2 branches, not revision-3 ones. |
| `web/series/age-structure.ts` | 14 | `185`, `275`, `120`, `126`, `128`, `138` clusters | Carried forward. Highest value remains the "no denominator" guard (7). |
| `web/ingest/**`, `web/manifest/**`, `web/sources/**`, `web/metrics/**` | 64 | See the previous report's table | Carried forward unchanged: `run-series` provenance (12), `eurostat` unit/branch cluster (21), `npv` (15), `definitions` (14), `validate` (14), and the rest. |

### Runtime errors (23) — excluded from the denominator, not untested behaviour

22 of the 23 are one shape: a mutant that makes a module throw at *collection* time rather than fail an
assertion (the `define({…})` figure table and its `figureId` literals, the `SERIES` / `SERIES_DEFINITIONS`
table entries, and `figures.ts`'s 14). The 23rd is the wrapper's `123/125` guard described above. This
is a `perTest` adjudication limit; by hand, mutating `figureId: 'fig-01'` to `''` fails 5 of the 14 tests
in the files that most directly exercise the table.

---

## Wrapper gate (`scripts/check-scenario-traceability-3digit.ts`)

This file is in scope because the brief made it so, and it needed two rounds of attention before its
score meant anything.

**Round 1 — 53.47 % (22 mutants at zero coverage).** `main()` and the `invokedAsScript` guard are only
executed when the file *is* the process entry point. Every existing test either called
`checkTraceability` directly or spawned the script as a **subprocess** — and Stryker instruments modules
inside the test runner's process, so a subprocess run is invisible to it. The whole of `main()` was
therefore a permanent zero, and the survivors were the two regexes, the acceptance-directory filter and
the report ordering.

**Round 2 — 66.34 %, still below the line, with a measurement defect.** I added a CLI test that
evaluates the module in-process by stubbing `process.exit` (throwing, so the code can be read out) and
`vi.resetModules()`. It passed locally — and the run still credited 21 mutants as uncovered, because
the test did not actually execute inside Stryker:

1. it imported the module through an absolute `file://` URL, which Stryker's transform does not see
   (the code ran; the mutation could not be observed), and
2. it used `process.chdir()` to test the working-directory fallback, which **vitest workers forbid**
   (`TypeError: process.chdir() is not supported in workers`, reproduced with `--pool=threads`). Under
   the mutation harness that failed the file.

So the 66.34 % in round 2's table is a defect in my test, not a property of the gate. **Say it plainly:
on the run that produced the headline numbers, the wrapper was below 80 % and that number was wrong.**

**Repair (test-only, enumerated):** a bare import specifier
(`import('../../scripts/check-scenario-traceability-3digit')`), and the `chdir` test removed — its
purpose was to kill the `?? process.cwd()` fallback, and an argument-mode assertion on the exact
reported message kills that mutant anyway (a gate that ignored its argument would scan the repository
and answer `119 scenarios`, not `1`). The file now passes under both pools (`--pool=threads`: 3/3).

**Re-measurement (scoped to this one file, same tree, same tests, 2026-10-28T12:21:16Z →
12:21:35Z): 87.25 % total, 89.90 % covered — 89 killed, 10 survived, 3 uncovered, 4 runtime errors.**
The 22 previously-uncovered `main()` mutants are now measured and killed, including the exit-code
contract (`process.exit(0)` on clean, `1` on dirty), the per-id error lines, the tally, and both
`untested`/`unknown` conditions. The 13 remaining are 10 equivalents + 3 named residuals above.

**Aggregate, recomputed:** substituting the repaired wrapper row into the round-2 run —
killed `2515 − 67 + 89 = 2537` (+2 timeouts), surviving `204 − 13 + 10 = 201`, no-coverage
`47 − 21 + 3 = 29`, runtime errors `23 − 5 + 4 = 22` — gives **(2537 + 2) / (2791 − 22) = 91.71 %**,
and **92.66 %** over covered mutants. This is arithmetic on two measurements of the same tree, not a
third run; both inputs are recorded with their commands and timestamps, and `reports/mutation/mutation.json`
holds the full-scope run while `reports/mutation/mutation-wrapper.json` holds the scoped one.

---

## Tests added by this refresh

**32 tests in 3 new files; one of them removed again (net 31). No existing test was modified,
weakened, renamed or deleted. No production code was edited.**

| File | Tests | What they pin |
|---|---|---|
| `tests/unit/clock-coverage-gaps.test.ts` | 19 | The anchor boundary (`remaining <= 0` at exactly the anchor instant), an unparseable anchor never yielding NaN fields, 4-digit year padding, non-integer threshold years, the not-crossed value's `anchor: null`, `firstYearAtOrAbove`'s `>=` boundary, the reduced-motion **transition** in both directions, no thrash on a redundant event, `stop()` detaching the motion listener, teardown-race safety, the default media query and its string, the no-window fallback, the real `document`, handler recomputation, the real `setInterval`/`clearInterval` pair, numeric and object handles cleared exactly once, and no cancel for an interval never created. |
| `tests/unit/scenario-traceability-sources.test.ts` | 9 | Which files declare a scenario (acceptance directory only; markdown only; `docs/changes` one-pagers are a source), that a heading must start its line and tolerates extra whitespace, that a citation is read from test source only (`.ts`/`.tsx`, not notes), and that both report arrays come back sorted. |
| `tests/unit/scenario-traceability-cli.test.ts` | 3 | The exit contract: 0 + the exact message when clean; 1 + one line per uncited id + the tally; 1 + one line per unknown citation. `process.exit` is a throwing stub, so the code is read out rather than executed. |
| *(removed before the final run)* | 1 | The working-directory fallback test — `process.chdir()` is unsupported in vitest workers, so it could not run under the mutation harness. Its mutant is still killed by the argument-mode message assertion. |

**Kill verification (not inferred from the score).** Eleven probes, each applied to the real source and
restored byte-identically (md5 compared; all 11 `restored=True`):

```
KILLED    clock.ts 51 padStart fill '0'->''                     (restored=True)
KILLED    clock.ts 65 remaining<=0 -> <0                        (restored=True)
KILLED    clock.ts 65 !isFinite removed                         (restored=True)
KILLED    ticker 111 scheduled handler -> noop                  (restored=True)
KILLED    ticker 168 stopped=true -> false                      (restored=True)
KILLED    ticker 125 reduced-motion clear branch -> skip        (restored=True)
SURVIVED* ticker 101 elapsed guard -> true                      (restored=True)
KILLED    wrapper 69 '.ts'->'' (every file cites)               (restored=True)
KILLED    wrapper 91 untested sort removed                      (restored=True)
KILLED    wrapper 54 acceptance-directory filter removed         (restored=True)
KILLED    wrapper 106 summary condition || -> &&                (restored=True)
KILLED    wrapper 113 success message emptied                    (restored=True)
```

\* `ticker 101` survived *this file* only; the mutation is killed by `clock.test.ts`'s AC-001-115
("no timer runs once the anchor has passed"), which the probe did not run. Recorded so the table is not
read as a gap.

---

## Evidence: mutation score (whole scope)

command: npx stryker run
exit: 0
at: 2026-10-28T12:15:17Z

```
 scripts                                |  66.34 |   83.75 |       67 |         0 |         13 |       21 |        5 |
  check-scenario-traceability-3digit.ts |  66.34 |   83.75 |       67 |         0 |         13 |       21 |        5 |
 web                                    |  91.86 |   92.77 |     2448 |         2 |        191 |       26 |       18 |
  content                               | 100.00 |  100.00 |        1 |         0 |          0 |        0 |        0 |
   budgets.ts                           | 100.00 |  100.00 |        1 |         0 |          0 |        0 |        0 |
  ingest                                |  91.79 |   93.06 |      738 |         0 |         55 |       11 |       16 |
  manifest                              |  93.59 |   93.96 |      482 |         0 |         31 |        2 |        2 |
  metrics                               |  93.62 |   94.26 |      279 |         1 |         17 |        2 |        0 |
  series                                |  90.73 |   92.07 |      499 |         0 |         43 |        8 |        0 |
   clock-ticker.ts                      |  95.96 |   95.96 |       95 |         0 |          4 |        0 |        0 |
   clock.ts                             |  92.45 |   92.45 |       49 |         0 |          4 |        0 |        0 |
  sources                               |  90.38 |   90.93 |      451 |         1 |         45 |        3 |        0 |
 All files                              |  90.93 |   92.50 |     2515 |         2 |        204 |       47 |       23 |
 MutationTestExecutor  Done in 27 minutes and 37 seconds.
 EXIT=0
```

38 files, 2791 mutants, `EXIT=0`. `thresholds.break` is `null`, so a non-zero exit would have meant a
tool failure rather than a threshold miss — the verdict is asserted in this report, not delegated to
the CLI. Round-1 baseline, same command, same scope, at 2026-10-28T11:41:05Z: **88.55 % / 91.35 %**,
`killed 2449, timeout 2, survived 232, no-coverage 85, runtime errors 23`.

---

## Evidence: `web/series/**` score (measured separately)

command: python3 -c "import json,collections; d=json.load(open('reports/mutation/mutation.json')); c=collections.Counter(m['status'] for p,f in d['files'].items() if p.startswith('web/series/') for m in f['mutants']); t=sum(c.values()); k=c['Killed']+c['Timeout']; print('web/series/**', dict(c), 'mutants', t); print('score %.2f covered %.2f' % (k/(t-c['RuntimeError'])*100, k/(t-c['RuntimeError']-c['NoCoverage'])*100))"
exit: 0
at: 2026-10-28T12:16:40Z

```
web/series/** {'Killed': 499, 'Survived': 43, 'NoCoverage': 8} mutants 550
score 90.73 covered 92.07
```

Reported separately, as asked, so the new clock is not diluted by the 2241 older mutants: **90.73 %**
after this refresh, **81.09 %** (clock-ticker 44.44 %) on first measurement.

---

## Evidence: wrapper score (measured separately, after the test repair)

command: npx stryker run --mutate "scripts/check-scenario-traceability-3digit.ts"
exit: 0
at: 2026-10-28T12:21:35Z

```
 check-scenario-traceability-3digit.ts |  87.25 |   89.90 |       89 |         0 |         10 |        3 |        4 |
 MutationTestExecutor Done in 19 seconds.
```

106 mutants, 4 runtime errors excluded. The same file measured **66.34 %** in the full run above, and
**53.47 %** at round-1 baseline; §Wrapper gate explains both figures and why the 87.25 % is the one
that describes the gate.

---

## Evidence: final full test suite

command: npx vitest run
exit: 0
at: 2026-10-28T12:25:38Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  51 passed (51)
      Tests  630 passed (630)
```

**630 tests across 51 files, exit 0**, none skipped or disabled — the Verifier's 599, plus this stage's
32, minus the one it removed again. This is the final run, executed after all mutation work and after
the build.

---

## Evidence: app still builds

command: npm run build
exit: 0
at: 2026-10-28T12:25:26Z

```
> pensions-system@0.0.0 prebuild
> tsx scripts/verify-derived.ts && tsx scripts/check-content-scope.ts && tsx scripts/check-public-vocabulary.ts && tsx scripts/check-scenario-traceability-3digit.ts

derived figures verified: 7 (2 computed, 5 unavailable)
derived series verified: 2
country scope gate: clean (5 locales)
public vocabulary gate: clean (5 locales)
scenario traceability (2-3 digit ids): 119 scenarios, all cited, all citations resolve

> pensions-system@0.0.0 build
> next build
✓ Compiled successfully in 570ms
✓ Generating static pages using 11 workers (17/17) in 775ms
```

`npx tsc --noEmit` exit 0 at 2026-10-28T12:23:39Z (no output).

---

## Evidence: complexity gate (carried from the Refactorer, re-run here)

command: npx eslint .
exit: 0
at: 2026-10-28T12:22:59Z

```
(no output — clean)
```

`eslint.config.mjs` enforces `complexity: ['error', 6]`. Clean across the whole tree, including the new
test files (their payload/fixture builders are small helpers — `tree`, `fakeMotion`, `fakeDocument`,
`recorder`, `runCli` — each well under the limit).

*Operational note:* `eslint .` fails with 400+ `tsconfigRootDir` parse errors whenever a Stryker sandbox
is left under `.stryker-tmp/`, because two `tsconfig.json` roots become candidates. The directory was
removed before this run; it is a Stryker leftover, not a code finding, and it is gitignored.

---

## Evidence: scenario traceability (re-run, unaffected)

command: npx tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-10-28T12:22:52Z

```
scenario traceability (2-3 digit ids): 119 scenarios, all cited, all citations resolve
```

The upstream shared gate, run for comparison:

command: .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-10-28T12:23:41Z

```
{"checks":[1,2],"passes":["AC-001-01 — traced to a test", … "AC-001-99 — traced to a test"],"fails":[]}
```

99 of 119 — the upstream `AC-\d{3}-\d{2}` regex cannot see `AC-001-100`…`-119`; the repo-local wrapper
covers exactly that range and reports 119. Both transcripts are recorded so the blind spot is not
hidden by the wrapper. The new tests cite no new scenario id — they pin behaviour already covered by
AC-001-108/110/112/114/115/119 — so neither count changed.

---

## Evidence: audit-trail gate

command: .standards/scripts/check-audit-trail.sh 001-pension-math
exit: 0
at: 2026-10-28T12:25:31Z

```
PASS 001-pension-math: 10-tasks.md present and non-empty
PASS 001-pension-math: 20-acceptance/ has an AC-*.md with a '## AC-NNN-NN' heading
PASS 001-pension-math: 25-verification.md present and non-empty
PASS 001-pension-math: 30-report.md present and non-empty
PASS 001-pension-math: 15-design.md present and non-empty
PASS 001-pension-math: 40-deploy.md present and non-empty
PASS 001-pension-math: evidence block 'scenario traceability'
PASS 001-pension-math: evidence block 'full test suite'
PASS 001-pension-math: evidence block 'complexity gate'
PASS 001-pension-math: evidence block 'design-principles gate'
PASS 001-pension-math: evidence block 'scenario-to-behavior spot check'
✔ Audit-trail check: specs/001-pension-math complete, verifier evidence recorded.
```

---

## Complexity summary (carried from the Refactorer)

- **Cyclomatic complexity ≤ 6:** `eslint.config.mjs` enforces `complexity: ['error', 6]`; ESLint
  exits 0 on the whole tree (re-confirmed above).
- **Duplication:** `check-code-principles.sh --tier production` reports **0 DRY FAILs** in project
  source (the Verifier's revision-3 run: 1 FAIL total, 43 WARNs).
- **Design-principles gate (Verifier's revision-3 attempt 1, PASS for the deliverable):** exit 1 with
  **exactly one FAIL** — `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`),
  inside the `.standards/` submodule, out of scope and off-limits to pipeline agents. **Zero FAILs in
  project source.**
- **WARNs (43, unchanged):** 29 project-source KISS/DRY review hints — including revision 3's
  `CountdownClock.tsx:56` (`KISS_LINES=42`) and `CountdownBlock.tsx` (`KISS_LINES=45`) — plus
  `.standards` template WARNs. WARN-level, not blocking, per the Stop-and-Ask matrix. **This stage adds
  none:** every new helper is under 20 lines.
- **Property tests:** `tests/unit/properties.test.ts` uses `fast-check`; 0 property-test FAILs.

---

## What this stage did not touch

- **No production code was edited.** Revision 3's modules are the Coder's and Refactorer's work; this
  stage measured them. Three source files were mutated in place *for kill verification only* and
  restored byte-identically (md5 compared; 11/11 `restored=True`).
- **No existing test was edited, weakened, renamed or deleted.** The 599 tests the Verifier passed are
  byte-identical.
- **No mutator, threshold or gate was changed.** `stryker.config.mjs` gained two `mutate` entries and
  lost `specs` from `ignorePatterns` (all three enumerated in §Mutation configuration, all three
  required by the brief's own scope instruction). `eslint.config.mjs`, `vitest.config.ts`,
  `tsconfig.json` and `.gitignore` are untouched. No `// Stryker disable` comment was added anywhere.
- **Nothing outside the allowed surface was edited.** `specs/**` changed only in this file;
  `.standards/**` is untouched.
- **Nothing was committed or pushed.** That is stage 5b's job.
- `reports/mutation/mutation.json` (full-scope round 2) and `reports/mutation/mutation-wrapper.json`
  (wrapper re-measurement) are left as the machine-readable evidence; `.stryker-tmp/` is gitignored and
  was removed so the `eslint` gate is not poisoned by a second tsconfig root.

---

## Remediation record

**Stage 5a, this refresh: none — no BLOCK occurred.** The mutation gate never reported BLOCK. Two rounds
produced scores (baseline, then one test batch), both exit 0; the below-threshold readings in round 1
(`web/series/**` 81.09 % with `clock-ticker.ts` at 44.44 %, and the wrapper at 53.47 %) were closed
inside this stage's own budget, not by handing a BLOCK to another stage. The wrapper's second
below-threshold reading (66.34 %) was a defect in the test this stage wrote, not a gate failure, and was
repaired here; both figures are recorded rather than the repaired one alone.

**Carried forward from `25-verification.md` (read, not guessed or invented):**

| Phase | Attempt | Trigger | Outcome |
|---|---|---|---|
| 1 (pre-PR) | 1 | first full run | PASS |
| 1 (pre-PR) | 2 | finding F1 (a `centralCellOf` defect from this stage's first report) | PASS after the Coder's fix; three pre-existing assertions adjudicated legitimate |
| 1 (pre-PR) | 3 | hero ladder swap + percent-scale fix | PASS; `SPEC_LOOP_COUNT=2`, `SPEC_PHASE1_RETRIES=2` |
| 2 (post-PR CI) | 1 | six `backend-ci-go` checks on a TypeScript-only repo (`go.mod` does not exist`) | FAIL — routed to the repo owner (CI config, not spec code) |
| 2 (post-PR CI) | 2 | `ci.yml` fixed in `68f6e64` | PASS — phase-2 budget 2 of 3 |
| 1 (pre-PR, revision-2 cycle) | 1 | `component-per-file` FAIL introduced by T19's `generateMetadata` | FAIL |
| 1 (pre-PR, revision-2 cycle) | 2 | `dynamicParams` moved to `[locale]/layout.tsx` | PASS |
| 1 (pre-PR, revision-3 cycle) | 1 | revision 3 + the four defect fixes | **PASS** — `SPEC_LOOP_COUNT=4`, `SPEC_PHASE1_RETRIES=0` (scope-cycle reset), `SPEC_PHASE2_RETRIES=2` |

So, from the verification record: **two Phase 1 BLOCKs in revision 1** (attempts 2 and 3 of the original
cycle), **one Phase 1 BLOCK in revision 2** (attempt 2 of its cycle), and **none in the revision-3
cycle** (attempt 1 passed). **Phase 2: two attempts, one FAIL one PASS.** Phase 3 (deploy verification)
has not run. The orchestrator supplied no loop summary beyond `25-verification.md`'s attempt headers;
none is inferred here.

---

## Flagged to the next stage

1. **Revision 3's calculation surface is measured and above the line**: `web/series/**` 90.73 %,
   `clock-ticker.ts` 95.96 %, `clock.ts` 92.45 %, `countdown.ts` 88.72 %, `budgets.ts` 100 %. The clock
   was the weak point at first measurement (44.44 %) and the gap was a real one: no test had ever
   registered the reduced-motion `change` listener.
2. **Four mutants survive inside the clock's null-threshold guard (`clock.ts:49`) and are provably
   equivalent.** They cannot produce an anchor for a missing year; `Number.isInteger` is what enforces
   it. If a later revision removes that line-50 check, the guarantee must be re-measured — the guard
   alone was never carrying it.
3. **The wrapper's headline number must be read with §Wrapper gate open.** 87.25 % is the honest figure
   for the gate; 66.34 % is what the same run measured while the CLI test could not execute. The 13
   remaining are 10 equivalents and 3 named residuals (one of which, `69:44`, a hand-probe shows is
   actually killed).
4. **`web/series/countdown.ts` did not move (88.72 %).** Its 20 survivors are revision-2 branches —
   threshold boundaries, blank projection codes, missing-denominator years — carried from the previous
   report with the assertions that would kill each. The `anchor` amendment itself is fully killed.
5. **The largest single residual is still `web/sources/eurostat.ts`** (20 survivors, `resolveCountUnit`
   and payload-shape clusters), unchanged.
6. **`web/ingest/run-series.ts` remains at exactly 80.00 %**, with the series manifest's `fetchedAt` and
   `inputHash` still lacking value assertions — a genuine provenance gap, carried forward.
7. **Operational:** running Stryker leaves `.stryker-tmp/` behind often enough that `eslint .` fails on
   a duplicate tsconfig root. Remove it before any gate run, or the lint gate reports 400+ phantom
   errors. Worth fixing in the harness rather than in a future agent's memory.
8. **`25-verification.md`'s revision-3 attempt-1 block is the verification of record** for the tree this
   report measures. If code changes again before stage 5b, this report is stale and must be re-run — the
   mutation score is a property of a tree, not of a spec number.

---

**Verdict: GREEN**

Mutation score **91.71 % total / 92.66 % covered** on the 38-file scope (2791 mutants: 2539 killed or
timed out, 201 survived, 29 uncovered, 22 runtime errors excluded by the tool), measured as
**90.93 % / 92.50 %** before the wrapper's measurement was repaired. **`web/series/**` is 90.73 %**
(550 mutants; 81.09 % at baseline, clock-ticker 44.44 % → 95.96 %), **the wrapper is 87.25 %** on its
repaired measurement (66.34 % as the full run measured it, defect explained), and **`budgets.ts` is
100 %**. 128 of the 230 non-killed mutants are equivalent or dead and are named with the reason; the 102
reachable residuals are named with the assertion that would kill each. The clock's null-threshold and
reduced-motion branches are analysed specifically above: no surviving mutant can render or tick a clock
without an anchor, or tick under reduced motion. Final suite **630/630 across 51 files**, app builds
(17/17 static pages), `tsc` and ESLint clean, traceability 119/119.

---

## PR

PR: https://github.com/RexiAI/pensions-system/pull/3

Commits: 16 (one per task T1–T16), carried forward — this refresh has not committed or pushed anything.
Revision 3's work (T20, T21, the four fixes, this stage's tests and config change) is still uncommitted
on the working tree and belongs to stage 5b. The spec is **not** archived in this PR: `scripts/archive-spec.sh`
is stage 5d, which runs after stage 5c's deploy verification.
