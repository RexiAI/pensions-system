# 30-report.md — spec 007 four-page story

- **Stage:** 5a Mutation Runner
- **Branch:** `spec/007-four-page-story` (HEAD `95bf0f6`; base `main` = `1ced4c4`)
- **Conformance tier:** `production` (mutation testing applies)
- **Verifier verdict carried forward:** **PASS (scoped)** — attempt 2, phase 1; only the previously
  failing design-principles gate was re-run, and the other four checks keep their attempt-1 PASS
  evidence in `25-verification.md`. Stage 5a started only after that PASS.
- **Autopilot:** false
- **Verdict: GREEN** — scoped mutation score 96.28 % on covered code, 94.27 % with NoCoverage in the
  denominator (both above the 80 threshold). No survivor exposed a defect; every one was either a
  test gap (killed here) or an equivalent/unreachable mutant (named below). Final full suite green.

## Summary

| Check | Result |
|---|---|
| Mutation score — scoped, 18 files, covered code (362/376) | **96.28 %** |
| Mutation score — scoped, 18 files, NoCoverage included (362/384) | **94.27 %** |
| Threshold (`high: 80`, `low: 80`, `break: null` — unchanged) | **met** |
| Survivors before this stage | 75 (80.00 % covered / 78.13 % total) |
| Survivors killed by new tests | 61 of the 75, plus the one mutant previously recorded `Timeout` |
| Equivalent / unreachable survivors recorded | 14 |
| NoCoverage mutants recorded (not survivors) | 8 |
| Final full test suite (`npx vitest run`) | **PASS** — 130 files / 1153 tests, exit 0 |
| Stage-5a BLOCK | **none** |

### Scoped-run scope (statement of scope)

This is a **scoped** mutation run, not the whole-tree config. It was invoked with an explicit
`--mutate` list; the committed `stryker.config.mjs` and its thresholds were not modified. The 18
files (the spec-007 surface, identical to the pre-stage survey):

```
web/components/FigureStatusRow.tsx          web/components/public/MethodRegion.tsx
web/components/PublicPage.tsx               web/components/public/MetodoPage.tsx
web/components/public/CifrasPage.tsx        web/components/public/NumberStep.tsx
web/components/public/DebatePage.tsx        web/components/public/PageHeading.tsx
web/components/public/FiguresRegion.tsx     web/components/public/Pager.tsx
web/components/public/HistoriaPage.tsx      web/components/public/RegisterKey.tsx
web/components/public/MeaningStep.tsx       web/components/public/SiteFooter.tsx
web/components/public/StoryStrip.tsx        web/components/public/SiteHeader.tsx
web/components/render-public-page.tsx       web/seo/metadata.ts
```

Before → after, same 384 mutants:

| Status | Before | After |
|---|---|---|
| Killed | 299 | **362** |
| Survived | 75 | **14** |
| NoCoverage | 9 | **8** |
| Timeout | 1 | **0** |
| Errors | 0 | **0** |

## Survivors killed

New tests live in `tests/unit/spec-007-mutation-kills.test.ts` (17 tests), one block per mutant
cluster, asserted on rendered output. 61 of the 75 survivors were behavioural and are killed:

| File | Killed | What the tests now pin |
|---|---|---|
| `SiteHeader.tsx` | 31 | Page-nav labels/hrefs/`aria-current`, wordmark, both snapshot stamps (label + space + formatted date), index-panel locale names and hrefLang/`aria-current`, exactly one check glyph, theme-group legend and the three theme labels, the toggle's `aria-label`/`title`. Every content key is read from `content.t(...)`, not a hardcoded copy, and no cosmetic class name is asserted. |
| `SiteFooter.tsx` | 13 | Every declared source as a named link to its publisher URL, the licence, the five locale links with `hrefLang`, the claims/contact/canonical/snapshot lines with their labels and the single space after each colon. |
| `Pager.tsx` | 9 | Direction word + destination name per link, href per direction, first/last page carrying exactly one link, the nav's accessible name, and an unknown page kind rendering no link. |
| `FigureStatusRow.tsx` | 3 | Title anchor `href="#fig-07"`, `aria-labelledby="fig-07-title"` matching the title id, the definition label, and the method link target. (This also closes the Verifier's carry-forward note 1 — the method-link target was previously unasserted.) |
| `PublicPage.tsx` | 1 | A countdown series whose `availability` is not `computed` renders no clock even when a stale value is still attached. |
| `metadata.ts` | 1 | A sub-page with no committed year leads with its own page name (never an invented year); Historia with no year is the scope sentence alone. |
| `FiguresRegion.tsx` | 1 | `role="region"`/`aria-labelledby` appear only when the page `<h1>` id is supplied. |
| `MethodRegion.tsx` | 1 | An unavailable series carrying a stale value prints no provenance strip; a computed one does. |
| `MetodoPage.tsx` | 1 | The `<h1>` id and the method region's `aria-labelledby` are the same `page-title-metodo`. |

Two status changes outside the survivor list were also resolved by the new tests:

- `FigureStatusRow.tsx:31` (`'figure.withheld.reason'`) — the pre-stage report recorded this mutant
  as **Timeout**. The existing accessibility assertion used `row.includes(reason)`; an empty reason
  makes `includes('')` true, so it could not distinguish the mutant. The new withheld-state test
  asserts the exact `<p class="figure-row__reason">…</p>` text and kills it deterministically.
- `metadata.ts:71` (`'historia'` default for `languageAlternates`) — was **NoCoverage**; the new test
  calls the exported default and asserts the Historia alternate set, so it is now killed.

## Equivalent / unreachable mutants (named, with reasons)

These 14 mutants are genuinely un-killable without changing production code or asserting internal
state; each is named by its post-run location.

1. **`PublicPage.tsx:76:54`, `77:56`** — the `nullLabel=''` argument to `formatValue` for the
   mechanism claim's `first.ratio`/`latest.ratio`. `claimVariables` returns `{}` when the figure or
   either endpoint is null; otherwise the value comes from `dependencyRatio`, which throws on a zero
   denominator and returns a finite number. `formatValue` consults `nullLabel` only for `null`/`NaN`,
   neither reachable from valid derived data; no acceptance scenario supplies a malformed ratio.
2. **`PublicPage.tsx:95:12`** — default `series = []` mutated to `["Stryker was here!"]`. Only
   `findSeries` (matches `seriesId`), `countdownOf` (availability/value checks) and `ReproduceBlock`
   (filters by `availability`) read the default; a string matches none of them, so every consumer
   yields the same DOM as `[]`.
3. **`PublicPage.tsx:102:31`, `102:32`, `102:95`** — the single-country scope default. `ScopeMark`
   branches on `countries.length <= 1` and renders the name and coverage clause from
   `content.country`, never from an entry; entries are read only when length > 1, and then the
   `countries` prop is supplied and the default is unused. `[]`, `{}` and `'#'` therefore render
   identically.
4. **`MethodRegion.tsx:77:8`** — `sources.fuse === undefined ? null : <FusePrecision …>`. The
   child itself calls `fuseValueOf`, which returns `undefined` for `undefined`, so both branches
   render nothing. A redundant double guard.
5. **`NumberStep.tsx:37:69`** — `nullLabel=''` for `formatValue(reading.days, …)`. `NumberGroup`
   renders only when `measured` accepted the countdown, i.e. `readClock` reported not elapsed, so
   `days` is always a finite integer; the label is never consulted.
6. **`NumberStep.tsx:50:7` (whole condition), `50:7` (first conjunct), `50:7` (`||`→`&&`),
   `50:41` (second conjunct)** — `measured` is private and called only from `NumberBody` after the
   `state === 'not-crossed'` early return, so `state` is always `'computed'` (closed union). The only
   other guard input, `anchor === null`, is already handled by `readClock`: `Date.parse(null)` is
   non-finite, so the reading is `elapsed: true` and `measured` returns `undefined` with or without
   the guard. All four mutants are observationally identical for every input the caller/type permits.
7. **`metadata.ts:25:10`, `25:26`** — `scopedTitle`'s `countryName === ''` branch. `pageMetadata`
   reads the name from `contentRegistry`, whose `validateDocument` rejects a blank `countryName`
   (`country-record`), so the empty branch is unreachable through the public API and no scenario can
   construct it.

## NoCoverage mutants (recorded, not survivors)

The 8 NoCoverage mutants are outside the 75-survivor survey but affect the second score reading:

- **`NumberStep.tsx:36:49`** — the `?? ''` right operand in `NumberGroup`; `anchor` is non-null by
  construction whenever the group renders, so the operand is never evaluated (hence NoCoverage and
  genuinely unreachable).
- **`StoryStrip.tsx:54:35`** — the `?? ''` right operand in `ShareBlock`; rendered only when
  `anchoredCountdown` has already guaranteed `anchor !== null`.
- **`render-public-page.tsx` (6 mutants)** — the Next route adapter (`pageKind` default, `!props`
  branch and `notFound()` call). It is imported only by `app/**` route files, never by the test
  suite; exercising `notFound()` requires Next's request runtime. Same class as the `scripts/*.ts`
  entry points the Stryker config documents: an entry point with no in-process test import. The page
  itself is covered through `PublicPage`.

## Complexity summary (carried from the Refactorer, confirmed by the Verifier)

- **ESLint cyclomatic complexity ≤ 6:** `npm run lint` exit 0 (26-verification.md evidence,
  `2026-11-09T09:02:40Z`).
- **Design-principles gate:** PASS at attempt 2, phase 1 — 0 FAIL / 20 WARN at both the default and
  `--tier production` runs. The five attempt-1 `KISS_LINES` findings were resolved by extraction
  (`figures.ts` `joinSeries`, footer sub-components, header sub-components, FigureStatusRow head /
  definition extraction), not by suppression; the gate script is unmodified.
- The 20 WARNs remain review hints (one KISS `share-card.tsx` 23 lines, six DRY blocks, one god
  file, one commented-out code, three naming, eight null-discipline). None is a stop and none was
  introduced by this stage.

## Remediation record

Carried forward from `25-verification.md` (attempt headers and `§Verdict and remediation`); not
guessed:

| Phase | Gate | Attempt 1 | Attempt 2 | Resolution |
|---|---|---|---|---|
| 1 (pre-PR) | `design-principles` | **BLOCK** — 5 FAIL / 20 WARN | **PASS** — 0 FAIL / 20 WARN | Resolved at **attempt 2, phase 1**; phase-1 budget 2 of 3 used, 1 remaining, no escalation. |
| 1 (pre-PR) | Mutation Runner (this stage) | No BLOCK | — | No survivor exposed a defect; no fix-delegation cycle was needed. |
| 2 (post-PR) | CI | not started | — | — |

Stage 5a raised **no BLOCK**: every behavioural survivor was a test gap in the existing suite, fixed
by new assertions in the same change, and the two score readings are above threshold.

## Evidence: scoped mutation run

command: npx stryker run --mutate "web/components/FigureStatusRow.tsx,web/components/PublicPage.tsx,web/components/public/CifrasPage.tsx,web/components/public/DebatePage.tsx,web/components/public/FiguresRegion.tsx,web/components/public/HistoriaPage.tsx,web/components/public/MeaningStep.tsx,web/components/public/MethodRegion.tsx,web/components/public/MetodoPage.tsx,web/components/public/NumberStep.tsx,web/components/public/PageHeading.tsx,web/components/public/Pager.tsx,web/components/public/RegisterKey.tsx,web/components/public/SiteFooter.tsx,web/components/public/SiteHeader.tsx,web/components/public/StoryStrip.tsx,web/components/render-public-page.tsx,web/seo/metadata.ts"
exit: 0
at: 2026-11-09T11:29:07Z

```
Ran 69.08 tests per mutant on average.
-------------------------|------------------|----------|-----------|------------|----------|----------|
                         | % Mutation score |          |           |            |          |          |
File                     |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                |  94.27 |   96.28 |      362 |         0 |         14 |        8 |        0 |
 components              |  94.01 |   96.32 |      314 |         0 |         12 |        8 |        0 |
  public                 |  96.69 |   97.50 |      234 |         0 |          6 |        2 |        0 |
   CifrasPage.tsx        | 100.00 |  100.00 |        1 |         0 |          0 |        0 |        0 |
   DebatePage.tsx        | 100.00 |  100.00 |        1 |         0 |          0 |        0 |        0 |
   FiguresRegion.tsx     | 100.00 |  100.00 |       29 |         0 |          0 |        0 |        0 |
   HistoriaPage.tsx      | 100.00 |  100.00 |        1 |         0 |          0 |        0 |        0 |
   MeaningStep.tsx       | 100.00 |  100.00 |        4 |         0 |          0 |        0 |        0 |
   MethodRegion.tsx      |  96.15 |   96.15 |       25 |         0 |          1 |        0 |        0 |
   MetodoPage.tsx        | 100.00 |  100.00 |        3 |         0 |          0 |        0 |        0 |
   NumberStep.tsx        |  85.00 |   87.18 |       34 |         0 |          5 |        1 |        0 |
   PageHeading.tsx       | 100.00 |  100.00 |        1 |         0 |          0 |        0 |        0 |
   Pager.tsx             | 100.00 |  100.00 |       24 |         0 |          0 |        0 |        0 |
   RegisterKey.tsx       | 100.00 |  100.00 |        5 |         0 |          0 |        0 |        0 |
   SiteFooter.tsx        | 100.00 |  100.00 |       19 |         0 |          0 |        0 |        0 |
   SiteHeader.tsx        | 100.00 |  100.00 |       51 |         0 |          0 |        0 |        0 |
   StoryStrip.tsx        |  97.30 |  100.00 |       36 |         0 |          0 |        1 |        0 |
  FigureStatusRow.tsx    | 100.00 |  100.00 |       20 |         0 |          0 |        0 |        0 |
  PublicPage.tsx         |  90.91 |   90.91 |       60 |         0 |          6 |        0 |        0 |
  render-public-page.tsx |   0.00 |    0.00 |        0 |         0 |          0 |        6 |        0 |
 seo                     |  96.00 |   96.00 |       48 |         0 |          2 |        0 |        0 |
  metadata.ts            |  96.00 |   96.00 |       48 |         0 |          2 |        0 |        0 |
-------------------------|--------|---------|----------|-----------|------------|----------|----------|
```

Score readings from the same run: covered `362 / (362 + 14) = 96.28 %`; with NoCoverage in the
denominator `362 / 384 = 94.27 %`. The pre-stage report at `reports/mutation/mutation.json`
(superseded by this run; a copy is in `/tmp/opencode/mutation-spec007-before.json` for the session)
read 299 Killed / 75 Survived / 9 NoCoverage / 1 Timeout = 80.00 % covered, 78.13 % total.

## Evidence: final full test suite

command: npx vitest run
exit: 0
at: 2026-11-09T11:40:04Z

```

 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  130 passed (130)
      Tests  1153 passed (1153)
   Start at  12:40:05
   Duration  61.77s (tests 88%, import 9%, transform 1%, environment 1%)
```

The suite grew from 129 files / 1136 tests (Verifier attempt 2) to 130 files / 1153 tests: the new
`tests/unit/spec-007-mutation-kills.test.ts` contributes 17 tests and no existing test changed. No
test was skipped, todoed, or disabled.

## Evidence: design-principles re-check (new test file included)

command: bash .standards/scripts/check-code-principles.sh -BaseRef main
exit: 0
at: 2026-11-09T11:42:46Z

```
---------------------------------------------
✔ Design-principles check: 0 FAIL(s), 20 WARN(s).
  WARNs are review hints — verify each before merging.
```

Re-run after adding `tests/unit/spec-007-mutation-kills.test.ts`: still the same 20 WARNs as the
Verifier's attempt 2, no new FAIL and no new WARN, so the mutation-kill tests did not regress the
design gate. `npm run typecheck` (`tsc --noEmit`) also exits 0.

## Evidence: new test file

command: npx vitest run tests/unit/spec-007-mutation-kills.test.ts
exit: 0
at: 2026-11-09T11:29:02Z

```
 Test Files  1 passed (1)
      Tests  17 passed (17)
```

## Working tree and hand-off

- Uncommitted by design: this stage writes tests and this report only. No commit, no push, no PR.
- Pre-existing unrelated working-tree changes (the operator's dirty tree, `runs.jsonl`, the two
  root screenshots, the out-of-scope branch commits and the `.standards` pointer bump) were left
  untouched, as recorded in `25-verification.md`.
- Stage 5b (PR Opener) precondition: `30-report.md` is present and GREEN; mutation score is above
  the unchanged threshold. The `PR:` line is appended by the PR Opener.
