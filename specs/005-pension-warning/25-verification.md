# 005-pension-warning — verification (stage 4)

Attempt: 1, phase 1
Pipeline mode: full (`45-decisions.md`: the classifier named 21 paths outside
`docs/`, `specs/`, `*.md`, `scripts/`)
Branch: `spec/005-pension-warning`
Verified against: `10-tasks.md`, `15-design.md`, `20-acceptance/`.
`00-informal.md` was not read.

**Verdict: PASS** — every gate ran and produced no findings.

Gates failed: none. Warnings: one spot-check finding (`AC-005-19`'s test asserts
its own helper rather than the rendered claim) plus the nine pre-existing
design-principles WARNs on files this spec touches. Neither blocks; both are
recorded below for the Architect.

---

## 1. Scenario traceability — PASS

Both gates ran. The upstream gate (`.standards/scripts/check-scenario-traceability.sh`)
reports 39 live `AC-005-*` scenarios, all traced, exit 0. The repo-local
three-digit gate (`scripts/check-scenario-traceability-3digit.ts`, which the
upstream gate's `AC-NNN-NN` pattern cannot see past 99) reports 324 scenarios,
all cited, all citations resolve, exit 0.

The one declaration change in the diff is `SUPERSEDED_SCENARIOS = ['AC-004-11']`
in that same script, folded into the existing `retired` set for the "untested"
computation only. That is the T8 mechanism for "superseded, not retired":
`AC-004-11` still exists as a declared scenario, it is simply no longer required
to be cited. `grep -rn 'AC-004-11' tests/` returns nothing, and
`retired-criteria.test.ts`'s `RETIRED` list is untouched (the diff changes only
the `ours` loop that skips superseded ids).

## 2. Full test suite — PASS (both commands)

`npm test`: 98 files, 1028 passed, 0 skipped, exit 0. `npx tsc --noEmit`: exit 0.

Both were run because `vitest` transpiles without type-checking. A fresh
`npm run build` was executed first (`exit 0`, prebuild gates included), so the
build-gated suites actually ran rather than silently skipping:
`spec-005-step-air-browser.test.ts` (3 tests, 18s, real Chromium over CDP against
`next start`) and `spec-005-locale-parity.test.ts`'s `AC-005-35` both executed —
verified by running the browser suite alone and seeing the three tests report
durations of 3018/5549/8319 ms.

The seven `describe.skipIf`/`it.skipIf` sites in `tests/` are all conditions on
`BUILD_PRESENT` / `CHROME_PATH`, both of which are true here; nothing was
skipped, disabled, `todo` or `only`.

Test count reconciles with the prior stages: Coder reported 1024, Refactorer
added 4 property tests, suite is 1028.

## 3. Complexity gate — PASS

`npm run lint` (`eslint .`, `complexity: ['error', 6]` in `eslint.config.mjs`):
exit 0, no findings. The design-principles script's own `complexity` gate run in
isolation: `fails: []`, exit 0. Its 23 `Method body >20 lines` WARNs are all on
files this spec does not touch (`.standards/`, the admin route group,
`SiteHeader`, `SiteFooter`, `CitationChip`, `ReproduceBlock`, `ThesisSection`,
…); none is on a file in the diff. No cyclomatic violation before or after, as
the Refactorer claimed — reproduced.

## 4. Design-principles gate — PASS (0 FAIL, 233 WARN)

`.standards/scripts/check-code-principles.sh --json`: exit **0**, `fails: []`,
`warns: 233`. No 141 / broken-pipe exit — the upstream `5de28c9` fix holds.

Of the 233 WARNs, **9 are on files this spec touches**, and all nine are
pre-existing patterns the diff neither introduces nor moves: `git diff -U0 |
grep '^+'` contains no `return null` and no new function with more than three
parameters. Reproduced below verbatim with the category histogram. The remaining
224 WARNs are unchanged pre-existing findings on untouched files (`.standards/`,
the admin surface, spec 001-004 components) — a representative excerpt of the
full 233-entry list, which the same command regenerates byte for byte.

## 5. Scenario-to-behavior spot check — PASS, with one WARN

Five scenarios across five tasks were read against their citing tests, and three
were additionally checked against the running site.

| Scenario | Citing test | Finding |
|---|---|---|
| `AC-005-03` (T1) | `spec-005-headline.test.ts` | Asserts what the scenario says: no `scope-statement`/`statement-budget` problem, `countryName` present, `length <= HERO_STATEMENT_BUDGETS[locale]`, no `/[.!?;:]/`, no `\d`, institutions as whole words, Spanish second person. Matches. |
| `AC-005-14` (T3) | `spec-005-step-air-browser.test.ts` | Real Chromium, `getComputedStyle`/`getBoundingClientRect`, five locales, 390×844 and 1440×900, `SPACE_5` read from `tokens.css` (asserted `=== 24`). Matches, and the measurement is genuine — see §Supporting. |
| `AC-005-23` (T5) | `spec-005-intergenerational-reading.test.ts` | Exactly one candidate among `statement` + `paragraphs` per locale, and `paragraphs.length` equal across five. Matches; the copy also survives a hand read (see §Register separation). |
| `AC-005-30` (T6) | `spec-005-register-separation.test.ts` | One `citation__chip` per `.claim`, block count `=== agreement.length`, zero chips and zero `class="citation"` in the thesis. Matches; independently confirmed on the served HTML (4 claims / 4 chips / 0 in thesis). |
| `AC-005-35` (T7) | `spec-005-locale-parity.test.ts` | Five routes 200, `<html lang>` per locale, own `hero.statement` in each document. Matches. |

**WARN — `AC-005-19`'s test passes for the wrong reason.** The scenario says
"When claim B is **rendered** … both numerals match the **plate's rendered
strings** character for character". The test builds its expected string with
`renderedClaim(locale, b)`, which interpolates `fig01Numerals(locale)` into the
claim template — both sides of the comparison therefore derive from the same
helper, and the rendered page is never read for the claim's text. Proven by
mutation, not by reading: changing `claimVariables` in `PublicPage.tsx` from
`formatValue(first.ratio, 'ratio', …)` to `'decimal'` (one decimal place) makes
the page render "la cifra pasó de 0,3 a 0,3" while the plate still publishes
`0,28`/`0,33`. `spec-005-mechanism-fact.test.ts` **still passed** (7/7);
`spec-005-register-separation.test.ts` failed (AC-005-28 searches the page for
the fig-derived string, so it caught it). The behaviour is protected — by
`AC-005-28`, not by the id whose scenario describes it. Fix belongs to the
Coder (test only): have `AC-005-19` extract claim B from `committedPage(locale)`
and compare it with the plate's readout, as the scenario states. Not a gate
failure; no production behaviour is wrong.

**Note — `AC-005-05` was re-pointed, and the scenario text was not amended.**
The scenario's last clause reads "the name `hero.sub` still renders **on the
page**"; the test asserts
`pageMetadata(locale, null).description === content.t('hero.sub')`. That
re-pointing is exactly what `15-design.md` §Task 1 Watch items directed (the
string has no visible surface; it renders only as the metadata description when
`thresholdYear === null`). The assertion is honest and would fail if the string
moved or vanished. Left as an observation because the scenario file still says
"on the page" — the human gate may want the wording reconciled.

**No test passed vacuously on inspection**: `AC-005-06`'s numeral presence
checks are backed by `AC-005-07`'s independent formatting comparison,
`AC-005-09`/`AC-005-10`'s occurrence counting, and the rendered page itself.

## No unaccounted behaviour

Every hunk in the diff traces to a task: the `SUPERSEDED_SCENARIOS` addition to the traceability script (T8),
`step-numerals.ts` + `COUNTDOWN_BASE` + `BreakageStep`/`NumberStep` (T2 "both
are read from one definition"), `claimVariables`/`ClaimVariables`/`interpolate`
(T4 claim B "derives its numerals from the committed value"), `AgreementSection`
`vars` prop (T4), five locale documents (T1/T2/T4/T5/T7), `citations.json`'s
single added record (T4), `globals.css`'s three declarations (T3), test
re-basing (T1/T2/T8). Nothing else changed. `.claim + .claim` (the 0.00px claim
gap the design recorded as a finding) was **not** smuggled in — correct, that
is a second spacing rule this spec does not authorise.

## Register separation — read, not just asserted

The shipped pages were read directly (`curl` against `next start`, es and de):

- `[data-register="agreement"]`: 4 `.claim` blocks, 4 `citation__chip`s, 0
  elsewhere. Claim A is a mechanism sentence with a resolving
  `ss-estadisticas-pensiones` citation and no numeral; claim B is the only
  numeral-bearing claim and carries the two published `fig-01` values.
- `[data-register="thesis"]`: 0 chips, 0 `class="citation"`. The reading is the
  **last** prose paragraph, after the disclaimer and the two shipped paragraphs,
  before the signature. No numeral in it, in any locale.
- The intergenerational reading exists only in the opinion register: the
  agreement register's texts and the thesis register's texts are disjoint.

## Supporting re-executions (not contract checks)

| What | Command | Result |
|---|---|---|
| Production build | `npm run build` | exit 0; prebuild gates: `derived figures verified: 7 (2 computed, 5 unavailable)`, `derived series verified: 3`, `country scope gate: clean (5 locales)`, `public vocabulary gate: clean (5 locales)`, `scenario traceability (2-3 digit ids): 324 scenarios, all cited`, `plain-language gate: clean (5 locales)` |
| Derived data byte-identical | `git status --porcelain -- data/ web/content/data/snapshots` | empty. `sha256(data/derived/fig-01.json)` = `8161257f…daee7c5`, identical to `git show HEAD:data/derived/fig-01.json`. AC-005-22's no-new-figure rule holds independently of its test. |
| Rendered spacing, measured not declared | Chromium over CDP against `next start`, `getBoundingClientRect` on `.hero__title` / `.step__label` / `.clock` / `.step__sentence` | es@390×844 and @1440×900, de@390×844 and @1440×900: `padding-block-start/end` of step 1 = **64/64**; h1→label **32**; label→clock **8**; clock→sentence **24**; `.step__sentence` 19px. Exactly the `64 / 32 / 8 / 24` `15-design.md` specifies, at both viewports, in both languages. `.step--distance` is 48 at 390 and 64 at 1440, so step 1 ties, never trails. |
| One-screen bound | same measurement | step 1 height es 641.41 / de 672.17 at 844; es 559.47 / de 624.73 at 900. de@390 = 672.17 matches the design's projection exactly; es@390 = 641.41 rather than the projected 600.61 — one extra headline line (+40.8), 202px of headroom left, bound holds. |
| `content-locale.test.ts` `MEASURED` re-basing | Chromium at 1280×800 on `<h1.hero__title>` | Reproduced the record exactly: font-size 62.72px, line-height 63.9744px, column 1176px; es 34 chars 1 line [1070.2]; en 42 [1135.9, 143]; fr 52 [1116.1, 517.9]; de 39 [975.3, 242.2]; it 40 [973.4, 233.7]. The 667→1176 px correction is real, not quoted from a declaration. |
| Claim B numerals vs the plate | served HTML, es/en/de | Plate readout: es "Primer dato 0,28 … Último 0,33"; en "First value 0.28 … 0.33"; de "Erster Wert 0,28 … 0,33". Rendered claim B: "…pasó de 0,28 a 0,33" / "…rose from 0.28 to 0.33" / "…stieg von 0,28 auf 0,33". Character-for-character in each locale's own separator. |
| Property tests non-vacuous (mutation 1) | `interpolate`: `value === undefined ? match : …` → `? '' : …`, then `npx vitest run tests/unit/spec-005-claim-vars.test.ts` | **Killed** — 2 failed / 5 passed, exit 1 (`expected '' to be '{first}'`, failing inside the `fc.assert` property as well as the example test). Restored; 7/7 green. |
| Property tests non-vacuous (mutation 2) | `PublicPage.tsx` claim numerals `'ratio'` → `'decimal'`, run mechanism-fact + register-separation | mechanism-fact **survived** (7/7); register-separation killed it. See the `AC-005-19` WARN above. Restored; full suite green. |
| Thin helpers are used | grep for every new export | `thresholdNumerals`, `ClaimVariables`, `COUNTDOWN_BASE`, `sectionOf`, `sectionRangeOf`, `anchorDate`, `numberSentence`, `committedPage`, `fig01Numerals`, `renderedClaim`, `claimA`, `claimB`, `readingCandidates`, `reading`, the four marker tables and `containsAny` all have live consumers — no orphaned export in the spec's own surface. |

## Findings carried, not fixed (out of scope by the tasks)

- `.claim` → `.claim` vertical gap is still 0.00px. `15-design.md` §Task 4 records
  it as a finding for the human gate because it would be a second spacing rule.
  Correctly absent from the diff; still open.
- `.citation__chip` is still 31.05px tall against `--tap-min: 44px`; recorded
  deliberate Fitts violation with compensating controls, not touched here.
- `hero.sub` still has no visible surface (metadata only) — see the `AC-005-05`
  note.

## Pre-existing dirt (not this branch's work)

`git status` shows `M .standards` (submodule pointer at the merged standards
`5de28c9`) and `M runs.jsonl` (pipeline telemetry), both dirty before stage 2.
Not attributed to this spec.

## Claim the audit trail cannot carry

The Refactorer's "removed 4 orphaned exports and 8 unused imports" is a delta
against the Coder's tree, and stages 2 and 3 share one uncommitted working tree
with no commit boundary, so the delta is not reconstructable. What is checkable
holds: `eslint` reports zero unused-import findings, and every new export has a
consumer (table above). The 234 → 233 WARN movement cannot be re-derived for the
same reason; the measured end state is 233 WARN, 0 FAIL.

---

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh; npx tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-11-05T19:29:03Z

Scenario IDs found: 39 live, 265 archived

PASS AC-005-01 — traced to a test
PASS AC-005-02 — traced to a test
PASS AC-005-03 — traced to a test
PASS AC-005-04 — traced to a test
PASS AC-005-05 — traced to a test
PASS AC-005-06 — traced to a test
PASS AC-005-07 — traced to a test
PASS AC-005-08 — traced to a test
PASS AC-005-09 — traced to a test
PASS AC-005-10 — traced to a test
PASS AC-005-11 — traced to a test
PASS AC-005-12 — traced to a test
PASS AC-005-13 — traced to a test
PASS AC-005-14 — traced to a test
PASS AC-005-15 — traced to a test
PASS AC-005-16 — traced to a test
PASS AC-005-17 — traced to a test
PASS AC-005-18 — traced to a test
PASS AC-005-19 — traced to a test
PASS AC-005-20 — traced to a test
PASS AC-005-21 — traced to a test
PASS AC-005-22 — traced to a test
PASS AC-005-23 — traced to a test
PASS AC-005-24 — traced to a test
PASS AC-005-25 — traced to a test
PASS AC-005-26 — traced to a test
PASS AC-005-27 — traced to a test
PASS AC-005-28 — traced to a test
PASS AC-005-29 — traced to a test
PASS AC-005-30 — traced to a test
PASS AC-005-31 — traced to a test
PASS AC-005-32 — traced to a test
PASS AC-005-33 — traced to a test
PASS AC-005-34 — traced to a test
PASS AC-005-35 — traced to a test
PASS AC-005-36 — traced to a test
PASS AC-005-37 — traced to a test
PASS AC-005-38 — traced to a test
PASS AC-005-39 — traced to a test


✔ Scenario traceability check: every scenario traced, every reference resolves.
exit=0

scenario traceability (2-3 digit ids): 324 scenarios, all cited, all citations resolve

## Evidence: full test suite

command: npm test; npx tsc --noEmit
exit: 0
at: 2026-11-05T19:27:58Z

> pensions-system@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  98 passed (98)
      Tests  1028 passed (1028)
   Start at  20:27:58
   Duration  27.71s (tests 85%, import 11%, transform 2%, environment 1%)

    Isolate  98 workers spawned · ~238ms startup each (spawn + environment, per file)
             at least ~1.89s faster with isolate: false — reuses workers across files instead of one per file

TEST_EXIT=0

$ npx tsc --noEmit
TSC_EXIT=0

$ npx vitest run tests/acceptance/spec-005-step-air-browser.test.ts --reporter=verbose
 ✓ tests/acceptance/spec-005-step-air-browser.test.ts > step 1’s air, measured > AC-005-13: step 1 computes at least every other step’s padding 3018ms
 ✓ tests/acceptance/spec-005-step-air-browser.test.ts > step 1’s air, measured > AC-005-14: headline, clock and sentence are separated by at least --space-5 5549ms
 ✓ tests/acceptance/spec-005-step-air-browser.test.ts > step 1’s air, measured > AC-005-15: the extra air does not break the one-screen bound 8319ms

 Test Files  1 passed (1)
      Tests  3 passed (3)

## Evidence: complexity gate

command: npm run lint
exit: 0
at: 2026-11-05T19:28:20Z

> pensions-system@0.0.0 lint
> eslint .

LINT_EXIT=0

$ eslint.config.mjs
17:      complexity: ['error', 6],

$ .standards/scripts/check-code-principles.sh --gates complexity --json
{ "tier": "mvp", "gates": ["complexity"], "fails": [], "warns": [ … 23 × "Method body >20 lines" … ] }
exit=0

(fails 0 / warns 23; every one of the 23 is the KISS_LINES category listed in the
design-principles block below, and none is on a file in this spec's diff. The
`…` elision is marked, not paraphrased — the full arrays are in the block below.)

## Evidence: design-principles gate

command: .standards/scripts/check-code-principles.sh --json
exit: 0
at: 2026-11-05T19:28:28Z

{
  "tier": "mvp",
  "gates": ["complexity", "dry", "yagni", "solid", "component-per-file", "property-tests", "comments", "naming", "null-discipline"],
  "fails": [],
  "warns": [ 233 entries ]
}

fails: 0
warns: 233

Category histogram of all 233 WARNs:
Comments: 90
Null-discipline: 76
Naming: 31
Method body >20 lines: 23
Possible duplication: 10
Empty method body: 2
SRP: 1

The 9 WARNs on files this spec touches, verbatim:
Naming: more than three parameters (addToYear) (./web/series/countdown.ts:96)
Naming: more than three parameters (addToYear) (./web/series/countdown.ts:108)
Null-discipline: return null (./web/series/countdown.ts:155)
Null-discipline: return null (./web/series/countdown.ts:176)
Null-discipline: return null (./web/series/countdown.ts:223)
Null-discipline: return null (./web/series/countdown.ts:226)
Null-discipline: return null (./web/components/public/NumberStep.tsx:71)
Null-discipline: return null (./web/components/public/NumberStep.tsx:73)
Null-discipline: return null (./web/components/registers/AgreementSection.tsx:21)

git diff -U0 | grep '^+' | grep -E 'return null|=> null'
none

The remaining 224 WARNs are a representative excerpt omitted per
docs/spec-pipeline/audit-contract.md §Evidence block format ("a representative
excerpt for very long output"): all sit on files outside this spec's diff
(`./.standards/…`, `./app/(admin)/…`, `./web/components/public/SiteHeader.tsx`,
`SiteFooter.tsx`, `CitationChip.tsx`, `ReproduceBlock.tsx`, `ThesisSection.tsx`),
and the command above regenerates the complete list byte for byte.

## Evidence: scenario-to-behavior spot check

command: manual read of AC-005-03, AC-005-14, AC-005-23, AC-005-30, AC-005-35 against their citing tests, plus curl of the served pages (es, en, de) and Chromium measurement of the same pages
exit: 0
at: 2026-11-05T19:31:40Z

AC-005-03  spec-005-headline.test.ts            asserts statement-budget/scope-statement codes, countryName, per-locale budget, no /[.!?;:]/ , no /\d/, institutions as whole words, Spanish second person  -> matches the scenario
AC-005-14  spec-005-step-air-browser.test.ts    real Chromium, 5 locales, 390x844 + 1440x900, SPACE_5 asserted === 24 from tokens.css, gaps measured with getBoundingClientRect        -> matches; independently measured 24 and 24 (h1->clock 59.44)
AC-005-23  spec-005-intergenerational-reading   exactly one candidate per locale, paragraphs.length equal across five                                                                      -> matches
AC-005-30  spec-005-register-separation         one chip per .claim, blocks == agreement.length, 0 chips / 0 class="citation" in thesis                                                       -> matches; served HTML confirms 4 claims / 4 chips / 0 in thesis
AC-005-35  spec-005-locale-parity               five routes 200, <html lang> per locale, own hero.statement                                                                               -> matches

WARN  AC-005-19  spec-005-mechanism-fact
      The test compares renderedClaim(locale, b) — built by interpolating fig01Numerals into the claim
      template — against the plate. Both sides come from the same helper; the rendered claim is never
      read from the page. Mutation: PublicPage.tsx claim numerals 'ratio' -> 'decimal' renders
      "la cifra pasó de 0,3 a 0,3" while the plate still publishes 0,28/0,33.
        npx vitest run tests/acceptance/spec-005-mechanism-fact.test.ts   -> 7 passed (7)   (survived)
        npx vitest run tests/acceptance/spec-005-register-separation.test.ts -> 2 failed | 3 passed (5)  (killed by AC-005-28)
      Behaviour is protected by AC-005-28, not by the id whose scenario describes it. Coder-side test fix only.

NOTE  AC-005-05  the scenario's last clause says hero.sub "still renders on the page"; the test asserts
      pageMetadata(locale, null).description === hero.sub, which is what 15-design.md §Task 1 directed.
      Honest and non-vacuous, but the scenario wording still says "on the page".

---

# Attempt 2 — scoped re-verification (phase 1, cycle 1 of max 3)

Re-verified: exactly one gate — **scenario-to-behavior spot check**, the only
finding routed to the Coder (`AC-005-19` compared a helper-rebuilt expectation
with the plate, so the rendered claim was never read).

Not re-run, and why their attempt-1 results stand unchanged:

- **design-principles gate** — no production code changed. `sha256(web/components/PublicPage.tsx)`
  before and after this attempt is `fd295b4b66d5d556…e34fc3`, `git diff` against
  HEAD is identical to attempts 1's, and the only file the Coder touched is
  `tests/acceptance/spec-005-mechanism-fact.test.ts`. The script does scan
  `tests/`, but attempt 1 already carried 0 FAIL / 233 WARN and the new code is
  two small pure helpers; re-running a whole-repo scan for that is the
  "one-line fix re-runs every scan" cost the budget rule forbids.
- **scenario traceability** — re-run anyway (1 s, and a test file did change):
  green, `AC-005-19` still traced, 39 live scenarios / 324 total, unchanged.

## Finding status: CLOSED

Attempt 1's finding (reproduced there by mutating `claimVariables` to
`'decimal'` and watching `AC-005-19` stay green at 7/7) no longer reproduces.
Three conditions were checked, in this order.

**1. The actual is now real produced markup.** `renderedClaimB(locale)` calls
`agreementHtml(locale)` → `sectionOf(committedPage(locale), 'data-register="agreement"')`
→ splits the section on `<div class="claim">` → takes each block's first `<p>` →
`textOf` (tag-strip, entity-decode, whitespace-collapse). `committedPage` renders
`PublicPage` from `publicPageProps` over the committed figures and series, i.e.
the same tree `next start` serves. The expectation comes from elsewhere:
`fig01Numerals(locale)` formats `data/derived/fig-01.json`'s committed
`value.first.ratio` / `value.latest.ratio`. Actual and expected have no shared
code path except `formatValue` itself, and the plate assertion reads a *third*
path (the plate readout `dd`).

**2. The mutation reproduces, and fails for the right reason.** Reproduced from
my own copy, not the Coder's: both claim-numeral call sites flipped
`'ratio'` → `'decimal'` in `PublicPage.tsx`. `AC-005-19` failed with
`Received: "Cada persona ocupada sostiene hoy más beneficiarios de pensión que al
inicio de la serie: la cifra pasó de 0,3 a 0,3."` — a string that can only have
come from the rendered page, matching the Coder's claim verbatim. Production
code was then restored and is byte-identical (`cmp -s` against my backup, and
the sha above).

**3. The selector cannot silently match nothing, and is not accidental.**
`renderedClaimB` throws when the matching-container count is not exactly 1
(`if (matches.length !== 1) throw`), so zero matches is a failure, not a pass.
Proved by execution rather than by reading: renaming `className="claim"` to
`className="claim-block"` in `AgreementSection.tsx` — leaving claim B's text
completely intact in the content model — fails with
`Error: es: expected one rendered employed-person claim, found 0`. That same run
also settles question 1 from the other direction: a CSS class rename in the
component changes the assertion's outcome, which is impossible if the actual
were a helper rebuild. A claim moved out of `[data-register="agreement"]` (into
the thesis or a step) produces the same 0-match throw; two claims carrying the
locale's employed-person marker produce a "found 2" throw.
The selection key (`EMPLOYED_MARKERS`, the T4 table) is the contract's own
criterion for claim B, not an incidental string, and it reads only each block's
first `<p>`, so the citation panel's own digits and text cannot widen the match.

Residual, not a defect: `textOf` collapses whitespace, but a numeral carries
none, so `toContain('0,28')` cannot be loosened by that normalisation; and
`AC-005-20`'s banned-word sweep (line 153) still runs over content-derived text,
which is correct there — it tests the copy's words, and every numeral assertion
about that copy now reads the page.

Verdict on the finding: **closed**. Attempt 1's PASS stands.

## Evidence: scenario-to-behavior spot check (attempt 2, scoped)

command: reproduce the routed finding from a private copy — flip formatValue(first.ratio,'ratio'→'decimal') and formatValue(latest.ratio,'ratio'→'decimal') in web/components/PublicPage.tsx, run npx vitest run tests/acceptance/spec-005-mechanism-fact.test.ts -t 'AC-005-19'; restore from backup; then repeat with className="claim"→"className=\"claim-block\"" in web/components/registers/AgreementSection.tsx; restore
exit: 0
at: 2026-11-05T19:33:20Z

Baseline before mutation:
  sha256(web/components/PublicPage.tsx) = fd295b4b66d5d5560d0f299740524bd4cfed0e70b78fcb5606f6f05a56e34fc3
  sha256(tests/acceptance/spec-005-mechanism-fact.test.ts) = e6970baf1a4e9efbbe03777c03e62135ac152bbf98dd924b7868919b2042bb75

Mutation 1 — claim numerals 'ratio' -> 'decimal' (expected to FAIL):
$ npx vitest run tests/acceptance/spec-005-mechanism-fact.test.ts -t 'AC-005-19'
 FAIL  tests/acceptance/spec-005-mechanism-fact.test.ts > AC-005-19: claim B’s numerals are the committed fig-01 numerals > AC-005-19: the claim and the plate publish the same two strings, in every locale
AssertionError: es: rendered first numeral: expected 'Cada persona ocupada sostiene hoy más…' to contain '0,28'

Expected: "0,28"
Received: "Cada persona ocupada sostiene hoy más beneficiarios de pensión que al inicio de la serie: la cifra pasó de 0,3 a 0,3."

 ❯ tests/acceptance/spec-005-mechanism-fact.test.ts:118:57
    117|       const text = renderedClaimB(locale);
    118|       expect(text, `${locale}: rendered first numeral`).toContain(firs…
 Test Files  1 failed (1)
      Tests  1 failed | 1 passed | 5 skipped (7)
mutant_exit=1

Restore 1:
  sha256(web/components/PublicPage.tsx) = fd295b4b66d5d5560d0f299740524bd4cfed0e70b78fcb5606f6f05a56e34fc3
  cmp -s /tmp/opencode/v2-PublicPage.bak web/components/PublicPage.tsx  -> identical

Mutation 2 — the claim block's class renamed, claim text untouched (expected to FAIL, not to pass silently):
$ npx vitest run tests/acceptance/spec-005-mechanism-fact.test.ts -t 'AC-005-19'
 FAIL  tests/acceptance/spec-005-mechanism-fact.test.ts > AC-005-19: claim B’s numerals are the committed fig-01 numerals > AC-005-19: the claim and the plate publish the same two strings, in every locale
Error: es: expected one rendered employed-person claim, found 0
 ❯ renderedClaimB tests/acceptance/spec-005-mechanism-fact.test.ts:64:35
     62|   const blocks = agreementHtml(locale).split('<div class="claim">').sl…
     63|   const matches = blocks.map(claimParagraph).filter((text) => contains…
     64|   if (matches.length !== 1) throw new Error(`${locale}: expected one r…
 Test Files  1 failed (1)
      Tests  1 failed | 1 passed | 5 skipped (7)
mutant_exit=1

Restore 2:
  sha256(web/components/registers/AgreementSection.tsx) = ea822600ea8acfd999658eee7d33d9f4700f99efb8979cccc38ef09519622abf
  cmp -s /tmp/opencode/v2-AgreementSection.bak web/components/registers/AgreementSection.tsx  -> identical
  grep 'className="claim' web/components/registers/AgreementSection.tsx
  29:          <div className="claim" key={claim.text}>

Both mutants fail; the unmutated tree passes (see the two blocks below). Production
code is byte-identical to the state attempt 1 verified.

## Evidence: full test suite (attempt 2, scoped)

command: npx tsc --noEmit; npm test
exit: 0
at: 2026-11-05T19:33:37Z

$ npx tsc --noEmit
tsc_exit=0

$ npm test
> pensions-system@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  98 passed (98)
      Tests  1028 passed (1028)
   Start at  20:33:37
   Duration  25.48s (tests 84%, import 12%, transform 2%, environment 1%)

    Isolate  98 workers spawned · ~242ms startup each (spawn + environment, per file)
             at least ~1.91s faster with isolate: false — reuses workers across files instead of one per file

test_exit=0

98 files / 1028 tests is unchanged from attempt 1: the fix rewrote an assertion
in place, it did not add or drop a test.

## Evidence: complexity gate (attempt 2, scoped)

command: npm run lint
exit: 0
at: 2026-11-05T19:33:30Z

> pensions-system@0.0.0 lint
> eslint .

lint_exit=0

## Evidence: scenario traceability (attempt 2, scoped)

command: .standards/scripts/check-scenario-traceability.sh; npx tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-11-05T19:34:16Z

Scenario IDs found: 39 live, 265 archived

PASS AC-005-19 — traced to a test

✔ Scenario traceability check: every scenario traced, every reference resolves.
upstream_exit=0

scenario traceability (2-3 digit ids): 324 scenarios, all cited, all citations resolve
3digit_exit=0
