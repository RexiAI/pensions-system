# Report — 002-hero-conversion

**Stage:** 5a, Mutation Runner (`spec-mutation-runner`)
**Branch:** `spec/002-hero-conversion`
**Conformance tier:** `production` (repo root `AGENTS.md`) — mutation testing is **required**, not skipped
**Verifier verdict carried forward:** **PASS** (`25-verification.md`, attempt 1, phase 1, zero remediation)
**Date:** 2026-10-29
**Information barrier:** `specs/002-hero-conversion/00-informal.md` was **not** read. Mutants were
killed from the tests and from `20-acceptance/` only.

Nothing was committed, pushed, or opened as a PR. Production code was not modified: the only
files this stage added are three unit test files.

---

## Scope of the run, and one decision that needs the Architect's attention

The spec's production surface is:

| Changed file | Mutated? | Why |
|---|---|---|
| `web/components/series/CountdownBlock.tsx` | **yes** | in the run |
| `web/components/series/CountdownClock.tsx` | **yes** | in the run |
| `web/components/public/Hero.tsx` | **yes** | in the run |
| `web/styles/tokens.css` | **no** | CSS — Stryker has no CSS mutator configured |
| `web/styles/globals.css` | **no** | same |

**The committed gate does not cover this spec's code at all.** `stryker.config.mjs`'s `mutate`
globs are all `*.ts` (`web/metrics`, `web/manifest`, `web/sources`, `web/ingest`, `web/series`,
`web/content/budgets.ts`, `scripts/check-scenario-traceability-3digit.ts`). No `*.tsx` file
matches, and **no non-test `.ts` file changed in this spec** — verified:

```
$ git status --porcelain | awk '{print $2}' | grep -E '\.ts$' | grep -v '^tests/'
NONE (no non-test .ts changed)
```

So a stock `npx stryker run` would have mutated spec 001's surface and reported a number about a
tree this spec never touched. I scoped the run to the changed components with Stryker's
documented `--mutate` CLI option. **`stryker.config.mjs` is byte-identical to what the Verifier
checked** — no gate, threshold, budget, lint, TypeScript, Vitest, or Stryker config was edited.

```
$ git status --porcelain | grep -E 'stryker|vitest.config|eslint|tsconfig|package.json|budgets|registry.ts|keys.ts'
NONE modified
```

**Finding for the Architect / PR Opener (recorded, not fixed):** the run below proves the
component surface *is* mutation-testable and currently has real gaps (baseline 68.68%). The
config's own comment excludes JSX deliberately ("mutating JSX and generated markup proves nothing
… and it costs hours"). That reasoning was sound for spec 001's numeric claims; it is no longer
sufficient now that the hero and clock are the product's primary surface. Widening `mutate` to
`web/components/**/*.tsx` is a deliberate config decision for its own spec — a stage-5a agent must
not make it.

**CSS is out of mutation scope, stated plainly.** No CSS mutator plugin is installed, so
`tokens.css` and `globals.css` cannot be mutated by this toolchain. Their changes are instead
pinned by the text-asserting acceptance tests that parse the stylesheets (`AC-002-09`, `-10`,
`-11`, `-18`, `-29`, `-30`) — a different mechanism, not a skipped one.

---

## Evidence: mutation score

Baseline, before any killing test. `thresholds.break` is `null` in the config, so exit 0 does not
itself assert the score — the table below does.

command: npx stryker run --mutate 'web/components/series/CountdownBlock.tsx,web/components/series/CountdownClock.tsx,web/components/public/Hero.tsx'
exit: 0
at: 2026-10-29T21:57:43Z

```
Instrumented 3 source file(s) with 182 mutant(s)
Dry run: Ran 195 tests in 7 seconds

---------------------|------------------|----------|-----------|------------|----------|----------|
                     | % Mutation score |          |           |            |          |          |
File                 |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
All files            |  68.68 |   72.67 |      125 |         0 |         47 |       10 |        0 |
 public              |  75.00 |   75.00 |       60 |         0 |         20 |        0 |        0 |
  Hero.tsx           |  75.00 |   75.00 |       60 |         0 |         20 |        0 |        0 |
 series              |  63.73 |   70.65 |       65 |         0 |         27 |       10 |        0 |
  CountdownBlock.tsx |  71.88 |   73.02 |       46 |         0 |         17 |        1 |        0 |
  CountdownClock.tsx |  50.00 |   65.52 |       19 |         0 |         10 |        9 |        0 |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
Done in 2 minutes and 33 seconds.
```

Final, after the killing tests.

command: npx stryker run --mutate 'web/components/series/CountdownBlock.tsx,web/components/series/CountdownClock.tsx,web/components/public/Hero.tsx'
exit: 0
at: 2026-10-29T22:04:20Z

```
Instrumented 3 source file(s) with 182 mutant(s)
Ran 65.55 tests per mutant on average.

---------------------|------------------|----------|-----------|------------|----------|----------|
                     | % Mutation score |          |           |            |          |          |
File                 |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
All files            |  86.26 |   91.28 |      157 |         0 |         15 |       10 |        0 |
 public              |  95.00 |   95.00 |       76 |         0 |          4 |        0 |        0 |
  Hero.tsx           |  95.00 |   95.00 |       76 |         0 |          4 |        0 |        0 |
 series              |  79.41 |   88.04 |       81 |         0 |         11 |       10 |        0 |
  CountdownBlock.tsx |  90.63 |   92.06 |       58 |         0 |          5 |        1 |        0 |
  CountdownClock.tsx |  60.53 |   79.31 |       23 |         0 |          6 |        9 |        0 |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
Done in 2 minutes and 45 seconds.
```

**Score: 68.68% → 86.26%** (+32 mutants killed), against a target of ≥80%. **Target met.**

Per-file honesty: `series` (79.41%) and `CountdownClock.tsx` (60.53%) sit below 80% on their own.
Both are dragged down by one cluster — 15 mutants in `CountdownClock.tsx`'s client-only runtime,
which this repo's test environment cannot reach (named in full below). The aggregate passes; the
per-file figures are stated rather than hidden behind it.

The machine-readable report is `reports/mutation/mutation.json` (`git check-ignore` confirms
`reports/` is ignored — T1's `.gitignore` entry).

---

## Surviving mutants: 25, all accounted for

Every one of the 25 remaining mutants is either **equivalent** (10) or **client-runtime-only and
unreachable from this test environment** (15). No mutant was left unclassified, and no vacuous
test was written to inflate the score.

### Equivalent mutants (10) — no observable behaviour differs

**`CountdownBlock.tsx`**

| Mutant | Replacement | Why it is un-killable |
|---|---|---|
| `16:64` `StringLiteral` | `t('table.notDefined')` → `""` | `ratio()` formats `backCast.projected` / `backCast.observed`, both typed `number` in `CountdownValue['backCast']`. `formatValue` takes its `nullLabel` branch only for `null`/`NaN`, and `computeCountdown` fills both from `roundTo(...)` of finite inputs. Reaching the label would require feeding a value the type forbids. |
| `26:17` `ConditionalExpression` | `countdown.years === null ? 0 : countdown.years` → condition `false` | `clockStrings` is called only from `ClockRail`, rendered only in the `computed` branch. `computeCountdown`'s `computedState` sets `years = thresholdYear - snapshotYear` exactly when it sets `state: 'computed'`, so `years` is always a number at that call site. The `null` arm is unreachable by data invariant. |
| `72:8` `ConditionalExpression` | `countdown.range === null` → `false` | `range` comes from `rangeOf(crossings)` over **every** projection variant, baseline included. `state === 'computed'` means the baseline series crosses, so `rangeOf` always yields `{min,max}`. A computed countdown with a null range cannot be produced. |
| `73:11` `StringLiteral` (also `NoCoverage`) | the `? ''` arm → `"Stryker was here!"` | Same unreachability as `72:8`: the null-range arm has no reachable input, which is also why Stryker reports it uncovered even though `VariantRangeLine` itself is covered. |
| `120:7` `ConditionalExpression` | `if (countdown.anchor === null)` → `false` | `ClockRail` is called only from the `computed` branch. The "no anchor, no clock" guarantee is carried structurally by `countdown.state !== 'computed'` (line 157) — already killed. `anchor` is non-null in every computed value `computeCountdown` builds. Killing this would mean asserting on a `{state:'computed', anchor:null}` value the derivation cannot produce: a vacuous test. |
| `127:70` `StringLiteral` | `formatValue(…, '')` null label → `"Stryker was here!"` | Same invariant as `26:17`: `years` is a number in the computed state, so `formatValue` never reaches `nullLabel`. |

**`Hero.tsx`**

| Mutant | Replacement | Why it is un-killable |
|---|---|---|
| `34:69` `StringLiteral` | `valueText`'s `t('table.notDefined')` → `""` | `HeroValueKind` is `'ratio' \| 'percentPoints'`, and `hero-subject.ts` states the invariant in the source: *"Non-nullable `ValueKind`s a hero figure can carry, so no null label path is reachable here"*. `headline` and `comparison.value` are `number`. |
| `39:10` `ArrayDeclaration` | `defaultScope`'s `[{…}]` → `[]` | `defaultScope` returns exactly one entry, and `ScopeMark` enters its multi-country branch only when `countries.length > 1`. With one **or zero** entries it renders `content.country.name` and `content.country.scopeClause` from the content record and never reads `geo`/`name`/`href` from the array. |
| `39:11` `ObjectLiteral` | the same entry → `{}` | Same as above: the entry's fields are never read on the single-country path. |
| `39:74` `StringLiteral` | `href: '#'` → `""` | The `href` is consumed only by `ScopeMark`'s multi-country `<a>` list, which a one-entry array never reaches. |

For `39:10`/`39:11`/`39:74` specifically: all three render **byte-identical** markup. A test
asserting "the country name appears when no `countries` prop is passed" would pass under all three
— which is exactly the vacuous test the brief says not to write, so none was written.

### Client-runtime-only mutants (15) — not equivalent, but unreachable here

These are real behavioural differences **in a browser**. They are unkillable from this repo's test
environment, and that is a statement about the harness, not about the mutants.

| Mutant(s) | Location | Why unreachable |
|---|---|---|
| `58:10` | `useClockRefs` returned object → `{}` | Refs are never serialised into HTML; a missing ref is invisible to `renderToStaticMarkup`. |
| `79:10`, `80:3` | `useLayoutEffect(...)` body / call → `{}` / `;` | `useLayoutEffect` does not run under `react-dom/server`; neither the pre-paint correction nor the tick exists in a server render. |
| `80:25`, `81:49`, `82:50`, `88:77`, `90:13` (×2) | effect body, ref-write map, field loop, `if (element)` guard (both arms) | Executed only inside the layout effect, i.e. only in the browser. |
| `93:5`, `94:37`, `95:12` | `write(readClock(...))`, `startClockTicker({...})`, the `ticker.stop()` teardown | Same — the tick lifecycle. |
| `98:6` | effect dependency array → `[]` | Changes when the effect re-subscribes: observable only across client re-renders. |
| `177:62` | `useMemo(..., [locale])` → `[]` | On the server the memo computes once per render regardless; the dependency list only matters on re-render. |
| `179:18` | `useClockTicker({ anchor, formatDays, refs })` → `{}` | The argument feeds the effect, which never runs server-side, so nothing downstream is observable. |

Un-killable because: `vitest.config.ts` sets `environment: 'node'`, and **no DOM emulation is
installed** — `jsdom`, `happy-dom` and `@testing-library/react` are all absent from
`package.json`. There is no way to mount this client leaf and execute its layout effect. Adding a
DOM dependency plus a test-environment change is outside stage 5a's remit (it is a dependency and
config change, and the brief forbids inventing either). Restructuring the page so these paths run
without a DOM is likewise forbidden: **zero-JS on the public home page must survive**, so no
killing test here requires a client component, and no `'use client'` directive was added or moved.
`CountdownClock.tsx`'s `'use client'` is pre-existing (the Verifier confirmed this against
`git show HEAD`).

If a later spec adopts a DOM test environment, these 15 are the backlog: they are reachable in
principle and would take `CountdownClock.tsx` from 60.53% to ~100%.

---

## Killing tests added (31 → 32 mutants killed)

Three unit files, 16 tests, all rendering through `react-dom/server` exactly as the existing
suite does. **None cites an `AC-002-NN` scenario ID**, deliberately: these pin copy slots and
structural details (a `{' '}` between spans, a blanked i18n key, a join separator, an `href`)
that no AC-002 scenario states. Attaching a scenario ID would claim coverage the scenario does not
assert. `check-scenario-traceability-3digit.ts` is unchanged and still green.

### `tests/unit/countdown-block-copy.test.ts` — 5 tests, 9 mutants

The projection's copy slots, asserted as **whole rendered regions** rather than substrings. That
distinction is load-bearing: the arithmetic sentence further down the block also contains
`16 años` and `2042`, so a `toContain` on the number or the year passes with the space removed.

| Test | Kills |
|---|---|
| prints the threshold year and its label as one line, separated by a space | `62:53` (`?? 0` → `&& 0`), `62:107` (space), `63:58` (`countdown.yearLabel` key) |
| prints the source and the year it was observed, separated by a space | `100:52` (`provenance.observedAt` key), `100:78` (space) |
| renders no back-cast line when the projection carries none | `84:7` (`backCast === null` → `false`) |
| carries its eyebrow as both its accessible name and its visible label | `49:81` (not-crossed `aria-label`), `50:52` (visible eyebrow) |
| still states where the projection came from | `53:51` (not-crossed source) |

The back-cast test asserts a **positive control first** (`countdownValue()` *does* contain
`countdown__backcast`) so the absence assertion cannot pass vacuously. `backCast: null` is
constructed rather than derived because the committed snapshots always carry one; it is a real
production branch — `computeCountdown` returns `null` when the observed dataset has no year at or
before the snapshot vintage — and the mutant turns clean absence into a `TypeError` mid-render.

### `tests/unit/countdown-clock-leaf.test.ts` — 4 tests, 7 mutants

| Test | Kills |
|---|---|
| labels all four fields, in the order the group reads them | `42:30` (`label: 'seconds'`) |
| sets the years numeral and its unit as two words inside one group | `105:59` (space) |
| joins the anchor's label to its date, and prints the date rather than its placeholder | `29:23` (`countdown.clock.anchor` key), `29:49` (`{ date }` vars → `{}`), `152:76` (space) |
| publishes the running state while the anchor is still ahead | `186:55` (`'running'`) |

The seconds label is the single character `s` and the minutes label is `min`, so only the
**ordered label list** pins them — a substring check is meaningless here.

### `tests/unit/hero-panels.test.ts` — 7 tests, 16 mutants

| Test | Kills |
|---|---|
| labels all four facts, in the order the panel reads them | `95:24`, `96:24`, `97:24`, `98:24` (the four label keys), `98:5` (the 4th entry → `{}`) |
| gives every fact a value, none of them empty | `93:20` (dataset `Set` → `[]`), `98:5` |
| joins the publishers with a comma and the datasets with a middot | `92:80` (`join(', ')`), `93:76` (`join(' · ')`) |
| stamps the snapshot with its label, a space, and the date the instant carries | `147:20` (`hero.snapshotLabel`), `147:43` (space), `148:47` (`.slice(0, 10)`) |
| links every row to its own figure's anchor | `209:16` (`` `#${figureId}` `` → empty template) |
| counts only the figures that are actually computed | `231:35` (filter callback), `231:47` (`=== 'computed'` → `false`), `231:85` (`'computed'` → `""`) |
| still renders the countdown when the tier has one | `235:10` (`countdown === undefined` → `true`) |

Three of these needed a fixture the suite did not have:
- **Two publishers.** Separators `', '` and `' · '` are never emitted for a single-source figure,
  so `makeFigure({ sourceUrl: [INE, Eurostat] })` is required to make them observable at all.
- **A partially computed proposition tier.** With `unresolvedFigures()` every figure is
  unavailable, so `computed` is 0 and a mutant that forces 0 is indistinguishable. The fixture
  makes exactly one figure computed (`fig-03`), so the summary reads `7 figuras · 1 calculadas`
  and a forced 0 dies.
- **A null back-cast** (above).

The last test also asserts the negative: rendering the same tier *without* a `countdown` contains
no `class="countdown"`, so the positive assertion is not vacuous.

---

## Evidence: final test status

The full suite, one final time, after the new tests. The Verifier confirmed it once; this
re-confirms it because the killing tests are new code that check did not cover.

command: npm test
exit: 0
at: 2026-10-29T22:07:21Z

```

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  63 passed (63)
      Tests  779 passed (779)
   Start at  23:07:21
   Duration  5.29s (tests 54%, import 37%, transform 8%, worker 1%)
```

763 → 779 tests (+16, the new unit tests); 60 → 63 files. No test was skipped, disabled,
weakened, or deleted. The mutation run's own dry run executed 195 tests per mutant against the
instrumented copies — so the assertions that kill mutants are the same ones that pass here.

command: npm run typecheck
exit: 0
at: 2026-10-29T22:07:21Z

```
> pensions-system@0.0.0 typecheck
> tsc --noEmit
```

command: npm run lint
exit: 0
at: 2026-10-29T22:07:21Z

```
> pensions-system@0.0.0 lint
> eslint .
```

command: npx tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-10-29T22:07:34Z

```
scenario traceability (2-3 digit ids): 155 scenarios, all cited, all citations resolve
```

**Suite green: 779/779. Typecheck clean. Lint clean. Traceability clean.**

Not re-run, and why: `npm run build`. No production source, content, or config changed in this
stage — only three test files were added — so the Verifier's recorded `npm run build` evidence
(exit 0, all four prebuild gates green, clean `next build`) still describes this tree. Re-running
it would test nothing new.

---

## Complexity summary (carried forward from the Refactorer)

The Refactorer leaves no report artifact by design (`docs/SPEC_PIPELINE.md` §Audit contract); its
measurements are re-recorded by the Verifier, and are carried here unchanged from
`25-verification.md`:

| Gate | Result |
|---|---|
| ESLint `complexity: ['error', 6]` — the repo's authoritative complexity gate | PASS, exit 0 — "no function exceeds 6" |
| `check-code-principles.sh --gates complexity`, scoped to changed files | PASS — 0 FAIL, 0 WARN |
| `component-per-file` | PASS — 0 FAIL, 0 WARN |
| `property-tests` (fast-check in use) | PASS |
| `yagni` | PASS — 0 FAIL, 0 WARN |
| `solid` | PASS — 0 FAIL, 0 WARN |
| `dry` | exit 141 — **submodule tool defect**, not a code finding: the DRY sub-pipeline (`… | sort -rn | head -10`) SIGPIPEs under `set -o pipefail` when the tree yields >10 duplicate windows. Warn-only gate; does not block. |

I re-ran `npm run lint` after adding the new tests (exit 0, above), so the complexity claim still
holds over the current tree rather than only over the pre-stage-5a tree. The three new test files
add no production complexity: their helpers are single-branch and their assertions are flat.

---

## Stop-and-Ask decision matrix: conditions encountered

| Condition | Resolution |
|---|---|
| Working tree dirty | **Not a stop.** The dirty set is precisely this spec's in-flight deliverable (the Coder's and Refactorer's work on `spec/002-hero-conversion`), already consumed and verified by stage 4, plus the three test files this stage added. There is no unknown state to protect against, and the PR Opener — not this stage — commits it. Recorded rather than stashed or auto-committed, per the matrix. |
| Spec artifacts not found | Not encountered — `10-tasks.md`, `20-acceptance/` (36 scenarios), `15-design.md` all present. |
| Version bump / git tag | Not requested; none created. |
| Design gate blocks | None. Mutation target met; complexity, traceability, lint, typecheck all green. |
| Design gate WARN | The DRY gate's SIGPIPE (141) is warn-only and a submodule defect — carried above, not fixed. |
| Acceptance criteria ambiguous | None encountered; no mutant required interpreting a scenario. |
| Verifier verdict FAIL | Not the case — PASS, pre-confirmed before any mutant ran. |
| Out-of-scope finding | One, recorded above: the committed `mutate` globs exclude the very surface this spec changed. Not fixed; proposed as a follow-up spec. |

---

## Remediation record

`none` — **no BLOCK occurred at any point in this run**, so no phase or attempt count was consumed.

Carried forward from `25-verification.md`: the Verifier recorded **attempt 1, phase 1**, and
resolved everything with zero remediation — no BLOCK was raised there either. Concretely, this
stage:

- ran the mutation gate twice: once as a baseline measurement, once after adding killing tests.
  The second run is a measurement of new tests, **not** a remediation re-run under
  `docs/SPEC_PIPELINE.md §Remediation budget` — no gate failed, so no phase-1 counter moved;
- raised no gate failure to the Coder or the Refactorer;
- modified no threshold, budget, gate, or config.

Provenance: the attempt information above comes from the header of `25-verification.md`
("**Attempt:** 1, phase 1") and from the absence of any BLOCK entry in it. Nothing was inferred or
invented; no orchestrator loop summary was available to this stage, and none is claimed.

| Phase | Budget | Consumed | BLOCKs raised | Resolved at |
|---|---|---|---|---|
| 1 (pre-PR) | 3 | 0 | 0 | — |
| 2 (post-PR CI) | 3 | 0 | 0 | — |
| 3 (deploy verification) | 3 | 0 | 0 | — |

---

## Gates summary

| Gate | Status |
|---|---|
| Verifier precondition (stage 4 PASS) | PASS — confirmed before running |
| Mutation testing (`production` tier) | **RUN** — 68.68% → **86.26%**, target ≥80% **met** |
| Mutation scope | 3 changed `.tsx` components; CSS not mutable by this toolchain (stated above) |
| Final full test suite | **PASS** — 779/779, exit 0 |
| Typecheck | PASS — exit 0 |
| Lint / complexity (ESLint ≤ 6) | PASS — exit 0 |
| Scenario traceability | PASS — 155 scenarios, exit 0 |
| Production code modified | **none** — three test files added only |
| Config / gate / threshold modified | **none** |
| Zero-JS home page | **intact** — no `'use client'` added or moved; every new test uses `react-dom/server` |
| Commit / push / PR | **not performed** — PR Opener's job (stage 5b) |

**Mutation score: 86.26% (target ≥80%, met). Suite green. Uncommitted, per stage 5a's remit.**

---

## Evidence: PR

command: gh pr create --draft --base main --head spec/002-hero-conversion
exit: 0
at: 2026-10-29T22:12:43Z

PR: https://github.com/RexiAI/pensions-system/pull/9
commits: 9 on `spec/002-hero-conversion` (8 product/spec commits + this record commit) — stage 5b, PR Opener

Draft PR opened against `main`. Body links `10-tasks.md`, `25-verification.md`, `15-design.md` and
this report, and carries the verbatim assertion-change record. The archive is stage 5d's job
(`docs/SPEC_PIPELINE.md` §Archive in the PR) — 5b no longer archives, so `specs/002-hero-conversion/`
is expected to be present on this PR head and gone after 5d runs.
