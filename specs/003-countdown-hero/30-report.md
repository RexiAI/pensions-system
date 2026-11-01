# 003-countdown-hero — Mutation report (stage 5a)

**Verdict: GREEN**

Scope: the configured mutation set (`web/metrics/**`, `web/manifest/**`, `web/sources/**`,
`web/ingest/**`, `web/series/**`, `web/content/budgets.ts`,
`scripts/check-scenario-traceability-3digit.ts`) **plus this spec's new code** —
`web/series/fuse.ts`, `web/share/**`, `web/seo/threshold-year.ts`, `web/seo/metadata.ts`,
`web/content/share-copy.ts`, and the conditional logic in `CountdownBand.tsx`, `Fuse.tsx`,
`PendingBlock.tsx`, `HeroLead.tsx`. 47 files, 3,078 mutants, two rounds.

Environment: Node 24.21.0, `@stryker-mutator/core` 10.1.1 with the vitest runner, vitest 5.0.5,
12 vCPU. Branch `spec/003-countdown-hero`. The working tree is dirty by design — stages 2–3's
deliverable is uncommitted work and stage 5b is the stage that commits. Nothing was stashed,
committed, or reverted by this stage; the only file this stage added to the repo is
`tests/unit/spec-003-mutation-kills.test.ts`.

## Verifier verdict, carried forward

`25-verification.md` = **PASS** for the spec's deliverable, with one out-of-scope
`check-code-principles.sh` FAIL recorded and not waived (a file inside the `.standards/`
submodule, pre-existing since 001). Gates green there: traceability 0, full suite 0
(**71 files / 895 tests, 0 failed, 0 skipped**), ESLint complexity 0, `tsc` 0, build 0, every
content gate 0. That PASS is this stage's precondition and was not re-litigated.

## Scores

Definitions, stated once because two are easy to confuse: **total** = detected ÷
(mutants − errors) — no-coverage mutants count against it, as Stryker's own "total" column does;
**covered** = detected ÷ (mutants − no-coverage − errors). "Detected" = `Killed` + `Timeout`.
`RuntimeError` mutants are detected-by-crash, not by an assertion; they are excluded from both
denominators and counted separately.

### Headline

| Measurement | Mutants | Total | Covered |
|---|---|---|---|
| **Round 1** — whole scope, one run | 3,078 | **91.71%** | 92.68% |
| **Round 2** — the six files re-run after the killing tests | 232 | **95.63%** | 95.63% |
| **Merged** — r2 for those six files, r1 for the other 41 (two measured runs, not one) | 3,078 | **92.43%** | 93.29% |

Round 1 was 3,078 mutants: 2,798 killed, 2 timed out, 221 survived, 32 no-coverage, 25
`RuntimeError`. After round 2 the merged set is 2,820 killed + 2 timeouts, 203 survived, 28
no-coverage, 25 errors. 22 mutants moved from survived/no-coverage to killed.

The merged figure is a union of two real runs, not a single invocation — the 43-minute full run
was not repeated after the fix (see §Rounds and §Remediation record).

### The three sub-areas this spec named, separately

| Area | Round 1 | Round 2 (final) | Verdict |
|---|---|---|---|
| `web/series/fuse.ts` | **96.67%** (29/30) | **100.00%** (30/30) | ✅ |
| `web/share/**` (`links.ts`) | **100.00%** (21/21) | **100.00%** (21/21) | ✅ |
| SEO year derivation — `threshold-year.ts` | **100.00%** (12/12) | **100.00%** (12/12) | ✅ |
| SEO year derivation — `metadata.ts` | **83.87%** (26/31) | **93.55%** (29/31) | ✅ |
| `web/seo/` (directory) | 88.37% | **95.35%** (41/43) | ✅ |

Nothing in these three areas fell below 80%, at either round. Two things fell below 80% in
round 1 and are stated plainly, because an aggregate has hidden a 77.39% in this project before:

- **`web/ingest/series.ts` = 79.49%** (62/78) in round 1 — **below 80%**, and not a pre-existing
  file: this spec edited it to add `FUSE_SERIES`. Raised to **93.33%** (70/75) by round 2.
- **`web/sources/labels.ts` = 78.72%** (37/47) — still below 80% after round 2, and untouched by
  this spec (it has carried this score since 001; see §Findings 4).

### Per-directory (merged)

| Directory | Total | Detected / non-error |
|---|---|---|
| `web/share/` | **100.00%** | 21/21 |
| `web/content/` | **100.00%** | 49/49 |
| `web/seo/` | **95.35%** | 41/43 |
| `web/components/` | **95.04%** | 115/121 |
| `web/metrics/` | 93.62% | 279/298 |
| `web/manifest/` | 93.27% | 485/520 |
| `web/ingest/` | 93.05% | 763/820 |
| `web/series/` | 91.21% | 529/580 |
| `web/sources/` | 90.38% | 451/499 |
| `scripts/` (3-digit traceability gate) | 87.25% | 89/102 |

### Per file (merged; files this spec added or touched shown first)

| File | Total | Detected / non-error |
|---|---|---|
| `web/components/series/CountdownBand.tsx` | 97.22% | 35/36 |
| `web/components/series/Fuse.tsx` | 94.59% | 35/37 |
| `web/components/PendingBlock.tsx` | **100.00%** | 20/20 |
| `web/components/public/HeroLead.tsx` | 89.29% | 25/28 |
| `web/content/share-copy.ts` | **100.00%** | 48/48 (+2 `RuntimeError`) |
| `web/seo/threshold-year.ts` | **100.00%** | 12/12 |
| `web/seo/metadata.ts` | 93.55% | 29/31 |
| `web/series/fuse.ts` | **100.00%** | 30/30 |
| `web/share/links.ts` | **100.00%** | 21/21 |
| `web/ingest/series.ts` | 93.33% | 70/75 (+3 `RuntimeError`) |
| `web/ingest/series-types.ts` | 92.86% | 13/14 |
| `web/content/budgets.ts` | 100.00% | 1/1 |
| `web/metrics/rounding.ts` · `dependency-ratio.ts` · `pension-share.ts` · `contribution-cover.ts` · `implicit-debt.ts` · `required-base-growth.ts` | 100.00% | 5/5 · 40/40 · 36/36 · 38/38 · 10/10 · 29/29 |
| `web/metrics/cohort-irr.ts` | 96.00% | 48/50 |
| `web/metrics/npv.ts` | 81.11% | 73/90 |
| `web/manifest/validate.ts` | 95.64% | 307/321 |
| `web/manifest/definitions.ts` | 85.19% | 115/133 |
| `web/manifest/hash.ts` · `formula-ids.ts` · `repo-file.ts` | 93.94% · 94.12% · 100.00% | 31/33 · 16/17 · 16/16 |
| `web/ingest/validate-figure.ts` | 96.97% | 160/165 |
| `web/ingest/figures.ts` | 94.47% | 188/199 |
| `web/ingest/run-compute.ts` | 93.00% | 186/200 |
| `web/ingest/run-series.ts` | 84.80% | 106/125 |
| `web/ingest/write-derived.ts` | 88.24% | 15/17 |
| `web/ingest/deterministic-json.ts` · `types.ts` | 100.00% | 14/14 · 11/11 |
| `web/series/age-bands.ts` | 97.62% | 41/42 |
| `web/series/clock-ticker.ts` · `clock.ts` | 95.96% · 92.45% | 95/99 · 49/53 |
| `web/series/countdown.ts` | 88.72% | 173/195 |
| `web/series/age-structure.ts` | 87.58% | 141/161 |
| `web/sources/freshness.ts` · `types.ts` | 100.00% | 29/29 · 12/12 |
| `web/sources/ine.ts` | 95.71% | 67/70 |
| `web/sources/countries.ts` | 93.22% | 55/59 |
| `web/sources/live.ts` | 90.91% | 40/44 |
| `web/sources/eurostat.ts` | 89.52% | 188/210 |
| `web/sources/load.ts` | 82.14% | 23/28 |
| `web/sources/labels.ts` | **78.72%** | 37/47 |
| `scripts/check-scenario-traceability-3digit.ts` | 87.25% | 89/102 |

Preserved local artifacts (gitignored, not committed): `reports/mutation/r1.json`,
`reports/mutation/r2.json`. `reports/mutation/mutation-prev-spec002.json` is the previous run's
report, kept so the earlier score stays auditable.

## Rounds

| Round | What ran | Scope | Mutants | Duration | Result |
|---|---|---|---|---|---|
| 1 | measure | 47 files (configured set + new code, minus two files — see §Findings 1) | 3,078 | 43m19s | 91.71% total; 31 survivors + 4 no-coverage in this spec's own files |
| 2 | measure after 8 killing tests | the 6 files that carried those survivors | 232 | 2m53s | 95.63%; 13 survivors, all adjudicated |

No gate BLOCK occurred, so no remediation round was consumed. The two runs are one measurement
plus one re-measurement of the fixed files, not two fix-and-repush cycles.

## Survivors and verdicts

Round 1 left **31 survivors + 4 no-coverage mutants** in this spec's own files (35 mutants across
`fuse.ts`, `metadata.ts`, `CountdownBand.tsx`, `Fuse.tsx`, `HeroLead.tsx`, `PendingBlock.tsx`,
`ingest/series.ts`); round 2 killed 22 of them and adjudicates the 13 that remain — 8 equivalent,
5 reachable-but-uncovered. `share-copy.ts` had no survivor, only 2 `RuntimeError` mutants:

| File:line | Mutator | Replacement | Verdict |
|---|---|---|---|
| `web/series/fuse.ts:35` | ConditionalExpression | `true` | **Killed** — `computeFuse` always reported the newest year's ratio even when that year cannot be divided (NaN). New test: the year is skipped. |
| `web/seo/metadata.ts:29` ×3 | ConditionalExpression, ObjectLiteral, StringLiteral | `false`, `{}`, `"Stryker was here!"` | **Killed** — the unknown-locale fallback was never executed. New test drives `pageMetadata('xx')`. |
| `web/components/series/CountdownBand.tsx:34,35,36` | StringLiteral | `""` | **Killed** — `share.native` / `share.copy` / `share.copied` resolved from a blank key. New test: the band asks the content model for those keys. |
| `web/components/series/CountdownBand.tsx:86` ×2 | StringLiteral, ObjectLiteral | `""`, `{}` | **Killed** — the click-time template's key and its `{year,url,days}` variables. New test asserts the exact `t('share.text', ...)` call. |
| `web/components/series/Fuse.tsx:38` | ArithmeticOperator | `BURNT_H * 2` | **Killed** — the cord's `y` (its centring inset). New test asserts both rects' attributes. |
| `web/components/series/Fuse.tsx:39` | ArithmeticOperator | `VIEW_W + at` | **Killed** — the burnt segment's width. New test asserts `width="624.4"`. |
| `web/components/series/Fuse.tsx:66` | StringLiteral | `""` | **Killed** — the ratio's definition paragraph could have been empty; nothing read it. New test asserts the locale string. |
| `web/components/series/Fuse.tsx:75` | StringLiteral | `""` | **Killed** — the reproduce link's label could have been empty. New test asserts it. |
| `web/components/PendingBlock.tsx:32` | StringLiteral | `""` | **Killed** — the space between the heading and the `sin calcular` chip; the words ran together. New test asserts the heading's text. |
| `web/ingest/series.ts:24` ×3 | OptionalChaining, ConditionalExpression, StringLiteral | `snapshot.resolved`, `false`, `` `` `` | **Killed** — the "not resolved" guard and its message. New test: a missing snapshot throws by name. |
| `web/ingest/series.ts:85,86,88` | BlockStatement, ObjectLiteral, StringLiteral | `{}`, `{}`, `""` | **Killed** — `fuseAssumptions`. New test asserts the assumptions object the series publishes. |
| `web/ingest/series.ts:106` ×2 | ConditionalExpression, StringLiteral | `false`, `""` | **Killed** — the no-observable-year refusal and its message. New test: an uncomputable observation throws by name. |
| `web/components/series/CountdownBand.tsx:79` | ConditionalExpression | `false` | **Equivalent** — see E1. |
| `web/components/series/Fuse.tsx:48,50` | StringLiteral | `"Stryker was here!"` | **Equivalent** — see E2. |
| `web/seo/metadata.ts:24` ×2 | ConditionalExpression, StringLiteral | `false`, `"Stryker was here!"` | **Equivalent** — see E3. |
| `web/components/public/HeroLead.tsx:16` ×3 | ArrayDeclaration, ObjectLiteral, StringLiteral | `[]`, `{}`, `""` | **Equivalent** — see E4. |
| `web/ingest/series.ts:30` | OptionalChaining | `value.years[0].bands` | **Defensive/unreachable** — see E5. |
| `web/ingest/series.ts:46,47,50,51` | MethodExpression, ConditionalExpression ×3 | `value.variants`, `true`, `false`, `false` | **Reachable, not killed — round budget** — see §Findings 3. |

## The four honesty-critical branches

Ranked above the aggregate, per the stage brief. Result: **all four clean — no surviving mutant
in any of them.**

1. **Fuse absent-state (no observed value → nothing renders).** `fuse.ts` 100%, `Fuse.tsx`
   94.59% with both survivors equivalent (`nullLabel`), `CountdownBand.tsx`'s only survivor is
   the sibling ternary. No mutant survives in `fuseValueOf`, in `computeFuse`'s two `return null`
   arms, or in `bandCountdown`'s guards. AC-003-18/AC-003-19 render-tests kill them.
2. **Fuse never reading the projected series.** `fuse.ts` 100% — the module's only imports are
   `readAgeCounts` / `observedDependency` / `COUNTDOWN_THRESHOLD`, and no mutant touch that could
   introduce a projection read survives. AC-003-20's structural and behavioural assertions hold.
   The round-1 survivor at `fuse.ts:35` was not a projection leak: it was the newest-*observed*-year
   fallback, now killed.
3. **Share text carries the click-time day count while the no-JS form does not.** `links.ts`
   100% (21/21) — `messageAt`'s `elapsed → withoutDays` arm, the `{days}` substitution and every
   network builder are killed. In the component, the round-1 survivors that let the *server* form
   or the *click* form resolve from the wrong template key/variables are now killed
   (`CountdownBand.tsx:86` ×2, `:34–36`); the only remaining survivor there is unrelated to the
   template (`:79`).
4. **`share.*` rejecting the banned words.** `share-copy.ts` 100% (48/48 non-error) with no
   survivors: `COMMON` (`bomb`, `!`), every locale's vocabulary list, the case-folding and the
   `includes` predicate are all killed by AC-003-47's per-locale samples. The two `RuntimeError`
   mutants (`ObjectLiteral` on `BY_LOCALE`, `BlockStatement` on the function body) are detected by
   the suite crashing, not by an assertion — they are not free passes, but they are not
   assertion-killed either, and are recorded as such.

## Equivalent mutants (each named, with why it cannot be killed)

**E1 — `CountdownBand.tsx:79`, `ConditionalExpression` → `false`.** Source:
`{fuse === undefined ? null : <Fuse … />}`. Mutated to always render `<Fuse>`, the output is
byte-identical: `Fuse` begins with `fuseValueOf(series)`, which returns `undefined` for a
`undefined` series, `availability !== 'computed'`, or `value === null` — and `Fuse` then returns
`null`. Both branches produce the same markup for every input the component can receive, so no
test can distinguish them. Not a gap: the duplication is the reason the branch is redundant, and
`Fuse`'s own guard is mutation-covered (97.22% / 100% of its four absent-state arms).

**E2 — `Fuse.tsx:48` and `Fuse.tsx:50`, `StringLiteral` → `"Stryker was here!"`.** The mutated
literal is `formatValue(value.observedRatio, 'ratio', locale, '')`'s and
`formatValue(value.threshold, 'integer', locale, '')`'s fourth argument — the `nullLabel`, read
only when `value === null` or `Number.isNaN(value)`. `FuseValue.observedRatio` and
`.threshold` are typed `number`, and `computeFuse` cannot produce a null ratio: it *skips* an
undividable year (that fallback is now killed — see the table) and returns `null` for the whole
figure when no year can be divided. So the only inputs that observe the difference are ones the
type system forbids and the compute path never emits.

**E3 — `metadata.ts:24` ×2, `countryName === ''` → `false` / `''` → `"Stryker was here!"`.**
`scopedTitle`'s empty-name arm. `pageMetadata` reaches it only through
`contentRegistry.get('ES', locale)`, which returns `!ok` for an unknown locale (so the round-2
test kills the *fallback* arm at line 29 instead) and can only be `ok` for one of the five
shipped locale documents. Every one of those names its country, and the build gate
`countryRecordProblems` fails the content set if a document's name is blank — AC-001-103. The
blank-name state is therefore unreachable by construction, and the arm is dead code. Recorded as
a YAGNI hint rather than a test gap: the cleanest fix is to delete the arm, not to fabricate a
nameless country document.

**E4 — `HeroLead.tsx:16` ×3, `ArrayDeclaration` → `[]`, `ObjectLiteral` → `{}`,
`StringLiteral` → `""`.** All three mutations of `defaultScope`'s single entry produce the same
page: `ScopeMark` branches on `countries.length <= 1` and, for that branch, renders the *country
record's* own `name` and `scopeClause` — it never reads the entry's `geo`, `name` or `href`. A
one-entry fallback and a zero-entry fallback render identical markup; so does an entry with an
undefined name or `href`, because neither is read at that length. The entry's fields become
load-bearing only for the `> 1` branch, which `defaultScope` — by its own contract of one
published country — cannot reach.

**E5 — `ingest/series.ts:30`, `OptionalChaining` → `value.years[0].bands`.** `pyramidAssumptions`
reads `value.years[0]?.bands.length ?? 0`; the mutation drops the guard. `computePyramid` always
returns three year structures (two observed, one projected) and the harness refuses a pyramid that
does not, so the zero-year `PyramidValue` the mutant would crash on is not constructible from any
payload the compute path accepts.

## Findings

1. **Two files of this spec's new code are outside the mutation scope for a tooling reason, not a
   convenience one.** `web/components/share/ShareRow.tsx` and `web/components/share/CopyLink.tsx`
   cannot be mutated: three existing tests assert on their own raw source text
   (`share.test.ts` AC-003-27 `toContain("typeof navigator.share === 'function'")`, AC-003-28
   `toContain('navigator.clipboard.writeText(url)')`, AC-003-31
   `toContain('event.currentTarget.href = shareHref(network, message(), url);')`). Stryker
   reparses and reprints every instrumented file, so those literals are absent from the sandbox
   copy and **the dry run fails before any mutation is generated** (`expected '\'use client\';
   \n\nfunction stryNS_9f…' to contain 'typeof navigator.share === 'function…'`). Including them
   would have made the whole run impossible; the two files' conditional logic is therefore
   covered behaviourally (AC-003-27/28/31 and the Chromium suite
   `tests/acceptance/countdown-band-browser.test.ts`) but **not mutation-tested**, and that is a
   real hole in the evidence, stated rather than hidden. It is fixable in one edit: make those
   three assertions whitespace- and quote-insensitive (or drop the positive source-text scans in
   favour of the behavioural assertions that already exist). This stage did not make that edit —
   the brief confines it to adding tests — and it is enumerated below.
2. **The mutate list needs widening, and only the orchestrator's brief authorises that, so it is
   enumerated and not made.** This stage ran with `--mutate` overrides; `stryker.config.mjs`
   itself is unchanged (no threshold was touched: `break: null`, `high/low: 80` as shipped).
   Recommended one-line addition to the `mutate` array, with the same reasoning style as the
   existing entries:
   ```js
   // Spec 003's own claim surface: the observed-only fuse, the share links, the copy rules and
   // the derived threshold year. Added when those modules shipped, for the same reason the
   // revision-2/3 entries above were added.
   'web/share/**/*.ts',
   'web/content/share-copy.ts',
   'web/seo/threshold-year.ts',
   'web/seo/metadata.ts',
   'web/components/**/*.tsx',
   ```
   (The `.tsx` glob is what makes the four component files re-measurable next time; it must not
   be added until Finding 1 is resolved, or the dry run fails again.)
3. **Five reachable survivors in `web/ingest/series.ts` remain, named, because the two-round
   cap was reached.** Lines 46, 47, 50, 51 (`countdownAssumptions`: the `variants` filter, the
   `thresholdYear !== null` predicate, and the two `backCast === null` arms). They are killable —
   `SERIES`' countdown definition computed at a threshold that never crosses (`countdownAt(90)`,
   already a fixture) would exercise all four. They are **not** in the fuse path and **not** in
   any of the four honesty-critical branches, so the priority rule in the stage brief puts them
   below the cap. This is the stage's one unfinished item; a third round would close it.
4. **`web/sources/labels.ts` sits at 78.72% and this spec did not touch it.** Its 10 survivors
   date from spec 001, like the other pre-existing survivor sets below. Stated plainly because
   the brief asks for it: the aggregate is not hiding it — the per-file table shows it.
5. **The rest of the survivor set is pre-existing and was not re-adjudicated here.** Of the 203
   survivors in the merged set, this stage adjudicated **13** (the eight equivalents and the five
   reachable ones above). A further **18** sit in files this branch does modify, but on lines it
   does not add — `manifest/definitions.ts` (16), `manifest/formula-ids.ts` (1),
   `ingest/series-types.ts` (1) — and the remaining **172** are in modules this branch never
   touches: `series/countdown.ts` (20), `sources/eurostat.ts` (20), `ingest/run-series.ts` (16),
   `metrics/npv.ts` (15), `series/age-structure.ts` (14), `manifest/validate.ts` (14),
   `sources/labels.ts` (10), `ingest/run-compute.ts` (10), the 3-digit traceability gate (10),
   `ingest/figures.ts` (8), `ingest/validate-figure.ts` (5), `series/clock-ticker.ts` /
   `clock.ts` / `sources/countries.ts` / `live.ts` (4 each), `sources/ine.ts` (3),
   `ingest/write-derived.ts` / `manifest/hash.ts` / `metrics/cohort-irr.ts` (2 each),
   `series/age-bands.ts` (1) — plus 26 no-coverage mutants across those same modules. Their
   scores are unchanged in kind from the previous report and they were accepted at their own
   gates; adjudicating 190 mutants outside this spec's diff is a separate work item. It is not
   silently dropped: this paragraph names every file and count.
6. **`RuntimeError` mutants are detection, not assertion.** 25 across the scope (`share-copy.ts`
   ×2, `ingest/series.ts` ×3, the 3-digit gate ×4, `ingest/*` ×17 minus overlaps). The suite
   crashes on them, which is how Stryker detects them; they are excluded from the score
   denominators and are not claimed as kills.
7. **`disableTypeChecks: false` is load-bearing for this scope.** The instrumenter only handles
   TSX correctly because type-check stripping is off; enabling it makes the run fail on the
   submodule's HTML (already documented in the config). No change recommended.

## Remediation record

Carried forward verbatim from `25-verification.md`, never guessed:

- **Verifier, revision 4:** `attempt 1, phase 1` — recorded at the top of `25-verification.md`,
  with budget context `SPEC_LOOP_COUNT=5`, `SPEC_PHASE1_RETRIES=0`, `SPEC_PHASE2_RETRIES=0`.
  That file records **no per-attempt history for revisions 1–3**; `SPEC_LOOP_COUNT=5` is the
  only trace that earlier loops happened, so no phase/attempt count is claimed for them here.
- **Phase 2:** not started — no PR exists yet (stage 5b owns it), so `SPEC_PHASE2_RETRIES=0`
  stands.
- **Stage 5a (this stage):** `none` — no BLOCK occurred. Two measurement rounds were run
  (§Rounds); neither was a remediation attempt under a budget, and neither phase-1 nor phase-2
  counters were touched.

## Complexity summary, carried from the Refactorer via the Verifier

`25-verification.md` check 3, re-executed by that stage, is the source; re-stated here because the
audit contract asks this report to carry it:

- `npx eslint .` — exit **0**, no findings at all. The budget is `complexity: ['error', 6]`
  (`eslint.config.mjs:17`), so a function above 6 decision points fails the run rather than
  warning; nothing in the tree trips it.
- `npx tsc --noEmit` — exit **0**.
- `check-code-principles.sh --tier production --json` — exit 1 with **one** FAIL, in the
  `.standards/` submodule (`skills/hallmark/site/examples/cobalt-01/script.js:7`, CC=10), plus
  **42 WARN** (33 in project source). Zero FAILs in project source. Two WARNs are in this spec's
  own code and unchanged by this stage: `web/components/share/ShareRow.tsx:62` (24-line body),
  `web/seo/share-card.tsx:41` (23-line body); `web/components/ProvenanceStrip.tsx:56` carries the
  DRY WARN (5× identical 4-line row).
- This stage's own new code was held to the same budget: the first draft of
  `tests/unit/spec-003-mutation-kills.test.ts` tripped `complexity: 8 > 6` on one helper. The
  **code** was split (three helpers), not the threshold — `npx eslint` on the file is now exit 0.

## Final test status

Full suite, run after the mutation-kill work, with the new file present:

```
 Test Files  72 passed (72)
      Tests  903 passed (903)
   Duration  55.85s
```

903 = the Verifier's 895 + this stage's 8 new tests; 72 = 71 + 1 new file. Zero failed, zero
skipped (no `skipped` line in the run). The eight new tests:

`tests/unit/spec-003-mutation-kills.test.ts` — AC-003-12 (the observed-ratio lookup skips a year
it cannot divide), AC-003-38 (unknown locale falls back to the bare wordmark), AC-003-33 (the band
resolves every share key, with `{days}` left in the click-time template), AC-003-13 (the drawn
cord and burnt segment), AC-003-21 (the definition paragraph and the reproduce label), AC-003-39
(the pending heading reads as one sentence), AC-003-20 (the fuse series' published assumptions;
and that a missing or uncomputable observation stops the series by name).

Both gates that read the test files are green with them in place: `check-scenario-traceability.sh
--json` exit 0 (51/51 AC-003 IDs traced) and `check-scenario-traceability-3digit.ts` exit 0
(206 scenarios, all cited, all citations resolve). Build green — `npm run build` exit 0, all five
public routes prerendered, `/admin*` dynamic — which also re-runs the four prebuild content gates.

## Evidence: mutation score, round 1

command: cat /tmp/opencode/mutate-r1.txt | xargs -I{} npx stryker run --mutate "{}" --concurrency 8
exit: 0
at: 2026-11-01T12:27:50Z

Scope string actually passed to `--mutate`:

web/metrics/**/*.ts,web/manifest/**/*.ts,web/sources/**/*.ts,web/ingest/**/*.ts,web/series/**/*.ts,web/content/budgets.ts,scripts/check-scenario-traceability-3digit.ts,web/share/**/*.ts,web/seo/threshold-year.ts,web/seo/metadata.ts,web/content/share-copy.ts,web/components/series/CountdownBand.tsx,web/components/series/Fuse.tsx,web/components/PendingBlock.tsx,web/components/public/HeroLead.tsx

Stryker's own summary table (unedited):

```
Found 47 of 325 file(s) to be mutated.
Instrumented 47 source file(s) with 3078 mutant(s).
Initial test run succeeded. Ran 808 tests in 37 seconds.
WARN MutantTestPlanner Detected 2041 static mutants (66% of total) that are estimated to take 99% of the time running the tests!

----------------------------------------|------------------|----------|-----------|------------|----------|----------|
                                        | % Mutation score |          |           |            |          |          |
File                                    |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                               |  91.71 |   92.68 |     2798 |         2 |        221 |       32 |       25 |
 web                                    |  91.87 |   92.78 |     2709 |         2 |        211 |       29 |       21 |
  components                            |  86.78 |   86.78 |      105 |         0 |         16 |        0 |        0 |
  content                               | 100.00 |  100.00 |       49 |         0 |          0 |        0 |        2 |
  ingest                                |  92.07 |   93.44 |      755 |         0 |         53 |       12 |       17 |
  manifest                              |  93.27 |   93.63 |      485 |         0 |         33 |        2 |        2 |
  metrics                               |  93.62 |   94.26 |      278 |         1 |         17 |        2 |        0 |
  seo                                   |  88.37 |   92.68 |       38 |         0 |          3 |        2 |        0 |
   metadata.ts                          |  83.87 |   89.66 |       26 |         0 |          3 |        2 |        0 |
   threshold-year.ts                    | 100.00 |  100.00 |       12 |         0 |          0 |        0 |        0 |
  series                                |  91.03 |   92.31 |      528 |         0 |         44 |        8 |        0 |
   fuse.ts                              |  96.67 |   96.67 |       29 |         0 |          1 |        0 |        0 |
  share                                 | 100.00 |  100.00 |       21 |         0 |          0 |        0 |        0 |
   links.ts                             | 100.00 |  100.00 |       21 |         0 |          0 |        0 |        0 |
  sources                               |  90.38 |   90.93 |      450 |         1 |         45 |        3 |        0 |
 scripts                                |  87.25 |   89.90 |       89 |         0 |         10 |        3 |        4 |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
Done in 43 minutes and 19 seconds.
```

## Evidence: mutation score, round 2

command: npx stryker run --mutate "web/series/fuse.ts,web/seo/metadata.ts,web/components/series/CountdownBand.tsx,web/components/series/Fuse.tsx,web/components/PendingBlock.tsx,web/ingest/series.ts" --concurrency 8
exit: 0
at: 2026-11-01T13:15:16Z

```
Found 6 of 325 file(s) to be mutated.
Instrumented 6 source file(s) with 232 mutant(s).

                     | % Mutation score |          |           |            |          |          |
File                 |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
All files            |  95.63 |   95.63 |      219 |         0 |         10 |        0 |        3 |
 components          |  96.77 |   96.77 |       90 |         0 |          3 |        0 |        0 |
  series             |  95.89 |   95.89 |       70 |         0 |          3 |        0 |        0 |
   CountdownBand.tsx |  97.22 |   97.22 |       35 |         0 |          1 |        0 |        0 |
   Fuse.tsx          |  94.59 |   94.59 |       35 |         0 |          2 |        0 |        0 |
  PendingBlock.tsx   | 100.00 |  100.00 |       20 |         0 |          0 |        0 |        0 |
 ingest              |  93.33 |   93.33 |       70 |         0 |          5 |        0 |        3 |
  series.ts          |  93.33 |   93.33 |       70 |         0 |          5 |        0 |        3 |
 seo                 |  93.55 |   93.55 |       29 |         0 |          2 |        0 |        0 |
  metadata.ts        |  93.55 |   93.55 |       29 |         0 |          2 |        0 |        0 |
 series              | 100.00 |  100.00 |       30 |         0 |          0 |        0 |        0 |
  fuse.ts            | 100.00 |  100.00 |       30 |         0 |          0 |        0 |        0 |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
Done in 2 minutes and 53 seconds.
```

Residual survivors, exactly as adjudicated above: `CountdownBand.tsx:79`; `Fuse.tsx:48,50`;
`metadata.ts:24` ×2; `ingest/series.ts:30,46,47,50,51` (`HeroLead.tsx` was not re-run in round 2 —
its three survivors are equivalent and its line did not change).

## Evidence: final full test suite

command: npx vitest run
exit: 0
at: 2026-11-01T13:19:02Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  72 passed (72)
      Tests  903 passed (903)
   Start at  14:19:03
   Duration  55.85s (tests 77%, import 18%, transform 4%, worker 1%)
```

No `skipped` line: every collected test ran. The Verifier's 895/71 is reproduced, plus this
stage's 8 tests in 1 file.

## Evidence: build

command: npm run build
exit: 0
at: 2026-11-01T13:20:01Z

Prebuild gates (all inside `npm run build`, all green) — `tsx scripts/verify-derived.ts`
(`derived figures verified: 7 (2 computed, 5 unavailable)` / `derived series verified: 3`),
`check-content-scope.ts`, `check-public-vocabulary.ts`,
`check-scenario-traceability-3digit.ts` — then `next build`:

```
Route (app)
├ ○ /
├ ● /en
├ ● /fr
├ ● /de
├ ● /it
├ ● /[locale]/opengraph-image-…/[__metadata_id__]
├ ƒ /admin
├ ƒ /admin/audit
├ ƒ /admin/login
├ ƒ /admin/proposals/[id]
├ ƒ /admin/refresh/[runId]
├ ƒ /admin/revisions/[id]
├ ƒ /api/admin/…
├ ○ /apple-icon.png
├ ○ /icon.svg
├ ○ /manifest.webmanifest
├ ○ /opengraph-image-…
├ ○ /robots.txt
└ ○ /sitemap.xml

ƒ Proxy (Middleware)
```

All five public routes prerendered, `/admin*` dynamic — unchanged from the Verifier's own build.

## Evidence: scenario traceability (re-run with the new tests present)

command: .standards/scripts/check-scenario-traceability.sh --json  &&  npx tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-11-01T13:20:12Z

```
EXIT_UPSTREAM:0
  "passes": ["AC-003-01 — traced to a test", … "AC-003-51 — traced to a test"],
  "fails": []
scenario traceability (2-3 digit ids): 206 scenarios, all cited, all citations resolve
EXIT_LOCAL:0
```

51/51 `AC-003-*` scenarios still traced; the base suite's 206 scenarios still all cited, and the
eight new tests' citations resolve (they re-cite existing IDs rather than inventing one).

## What this stage did not do

No commit, no push, no PR, no deploy. No production code changed. No gate config, no threshold,
no `.standards/**` file, and nothing under `specs/` except this report. No `Stryker disable`
comment or equivalent-mutant exception was added anywhere — every exception above is a measured
`Survived` mutant with its reason recorded here, which is the only form of exception this stage
uses.
