# Verification — 006-centred-number

**Verifier:** spec-verifier (stage 4, independent re-check)
**Attempt:** 1, phase 1
**Branch:** `spec/006-centred-number`
**Date:** 2026-11-06
**Verified against:** `10-tasks.md`, `15-design.md`, `20-acceptance/` (35 scenarios
`AC-006-01`…`AC-006-35`). `00-informal.md` was **not** read (information barrier).

## Overall verdict

**PASS** on the five contract gates: scenario traceability, full test suite (`npm test` +
`npx tsc --noEmit`), the complexity linter, the design-principles gate, and the
scenario-to-behavior spot check all ran and produced no gate failure.

Two findings are recorded and escalated, neither of which is a runnable-gate failure:

- **F1 (design conformance, escalated to the Architect/Specifier):** the accent is spent
  four times on the delivered page, not once. The *letter* of `AC-006-11` and `AC-006-26`
  is satisfied; the design's Von Restorff intent is defeated. The Coder was forced here by
  two in-force criteria (`AC-002-31`, `AC-003-22`) that `10-tasks.md` §4 never re-pointed.
- **F2 (verification gap):** `AC-006-35`'s live-origin equality is guarded by
  `PRODUCTION_URL`, which nothing in this repo's CI sets, so the scenario's "serving origin"
  clause is not exercised by `npm test` and must be verified by stage 5c (Deploy Verifier).

Both are recorded under **Findings**. Per the Stop-and-Ask matrix they are recorded, not
fixed here; the Verifier writes no production code and does not commit or push.

## Gate summary

| # | Check | Command | Exit | Verdict |
|---|---|---|---|---|
| 1 | Scenario traceability | `npx tsx scripts/check-scenario-traceability-3digit.ts; bash .standards/scripts/check-scenario-traceability.sh --json` | 0 | PASS |
| 2 | Full test suite | `npm test; npx tsc --noEmit` | 0 | PASS (112 files / 1040 tests, **0 skipped**) |
| 3 | Complexity gate | `npm run lint; npx eslint <changed>` | 0 | PASS |
| 4 | Design-principles gate | `bash .standards/scripts/check-code-principles.sh . --json` (+ `-BaseRef main`) | 0 | PASS (0 FAIL / 213 WARN) |
| 5 | Scenario-to-behavior spot check | manual: AC-006-04, AC-006-22, AC-006-32, AC-006-35 | 0 | PASS for 3; AC-006-35 live half deferred (F2) |

## Evidence: scenario traceability

command: npx tsx scripts/check-scenario-traceability-3digit.ts; bash .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-11-06T11:25:52Z

scenario traceability (2-3 digit ids): 359 scenarios, all cited, all citations resolve
--- upstream ---
{
  "checks": [1, 2],
  "passes": ["AC-006-01 — traced to a test", "AC-006-02 — traced to a test", "AC-006-03 — traced to a test", "AC-006-04 — traced to a test", "AC-006-05 — traced to a test", "AC-006-06 — traced to a test", "AC-006-07 — traced to a test", "AC-006-08 — traced to a test", "AC-006-09 — traced to a test", "AC-006-10 — traced to a test", "AC-006-11 — traced to a test", "AC-006-12 — traced to a test", "AC-006-13 — traced to a test", "AC-006-14 — traced to a test", "AC-006-15 — traced to a test", "AC-006-16 — traced to a test", "AC-006-17 — traced to a test", "AC-006-18 — traced to a test", "AC-006-19 — traced to a test", "AC-006-20 — traced to a test", "AC-006-21 — traced to a test", "AC-006-22 — traced to a test", "AC-006-23 — traced to a test", "AC-006-24 — traced to a test", "AC-006-25 — traced to a test", "AC-006-26 — traced to a test", "AC-006-27 — traced to a test", "AC-006-28 — traced to a test", "AC-006-29 — traced to a test", "AC-006-30 — traced to a test", "AC-006-31 — traced to a test", "AC-006-32 — traced to a test", "AC-006-33 — traced to a test", "AC-006-34 — traced to a test", "AC-006-35 — traced to a test"],
  "fails": []
}
COMBINED_EXIT=0

Both gates agree: the repo-local three-digit gate finds **359 declared scenarios, all
cited, all citations resolve**; the upstream gate resolves all 35 `AC-006` scenarios and
reports `"fails": []`.

## Evidence: full test suite

command: npm test; npx tsc --noEmit
exit: 0
at: 2026-11-06T11:27:22Z


> pensions-system@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  112 passed (112)
      Tests  1040 passed (1040)
   Start at  12:26:31
   Duration  49.50s (tests 93%, import 5%, transform 1%, environment 1%)

--- tsc ---
test_exit=0 tsc_exit=0

`vitest` transpiles without type-checking, so `npx tsc --noEmit` is run as a separate
gate (exit 0, no `error TS` lines). The suite reports **112 files, 1040 tests passed, 0
skipped** in this environment. All 18 `skipIf` guards in `tests/` are environment guards
(`BUILD_PRESENT = existsSync('.next/server/app')` and `CHROME_PATH`); with the fresh build
and Chromium present, every browser-guarded acceptance test executed. There are no
`.skip(`, `.only(` or `.todo(` occurrences in `tests/`.

## Evidence: complexity gate

command: npm run lint; npx eslint web/components/public/NumberStep.tsx web/components/series/PyramidPlate.tsx web/components/series/PyramidPanel.tsx web/series/clock.ts web/content/site.ts
exit: 0
at: 2026-11-06T11:25:53Z


> pensions-system@0.0.0 lint
> eslint .


```
$ grep -n complexity eslint.config.mjs
      complexity: ['error', 6],
```

The project's real linter carries the cyclomatic-≤6 rule as an **error**; it reports no
violation on the whole repo and none on the changed source files. The design-principles
complexity heuristic independently reports 0 FAIL (see next block).

## Evidence: design-principles gate

command: bash .standards/scripts/check-code-principles.sh . --json
exit: 0
at: 2026-11-06T11:26:28Z

```json
{
  "tier": "mvp",
  "gates": ["complexity","dry","yagni","solid","component-per-file","property-tests","comments","naming","null-discipline"],
  "fails": [],
  "warns": [ 213 entries — listed verbatim below ]
}
```

**0 FAIL, 213 WARN.** The tier auto-detect reads `AGENTS_*.md`; this repo's file is
`AGENTS.md`, so the script ran as `mvp`. Re-running the property-test gate explicitly at
the repo's declared tier is clean:

```
$ bash .standards/scripts/check-code-principles.sh . --tier production --gates property-tests --json
{
  "tier": "production",
  "gates": ["property-tests"],
  "fails": [],
  "warns": []
}

--- warn lines, verbatim (213) ---
Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:45:71:main:KISS_LINES=28
Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:101:124:checkCompensationPairs:KISS_LINES=25
Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:48:67:ActionForms:KISS_LINES=21
Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:69:91:ProposalPage:KISS_LINES=23
Method body >20 lines (node): ./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:35:67:ReviewTable:KISS_LINES=26
Method body >20 lines (node): ./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx:7:34:RefreshPage:KISS_LINES=28
Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:59:84:PendingTable:KISS_LINES=24
Method body >20 lines (node): ./app/(admin)/admin/login/page.tsx:5:30:LoginPage:KISS_LINES=26
Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:111:242::KISS_LINES=38
Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23
Method body >20 lines (node): ./web/components/CitationChip.tsx:12:38:CitationChip:KISS_LINES=28
Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21
Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:28:62:SiteFooter:KISS_LINES=36
Method body >20 lines (node): ./web/components/public/ScopeMark.tsx:27:52:ScopeMark:KISS_LINES=24
Method body >20 lines (node): ./web/components/public/ReproduceBlock.tsx:53:100:ReproduceBlock:KISS_LINES=48
Method body >20 lines (node): ./web/components/public/AssumptionsLedger.tsx:43:83:AssumptionsLedger:KISS_LINES=41
Method body >20 lines (node): ./web/components/public/ThemeGroup.tsx:13:36:ThemeGroup:KISS_LINES=21
Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:62:101:IndexPanel:KISS_LINES=41
Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:108:134:SiteHeader:KISS_LINES=28
Method body >20 lines (node): ./web/components/registers/DisputeSection.tsx:17:42:DisputeSection:KISS_LINES=25
Method body >20 lines (node): ./web/components/registers/ThesisSection.tsx:19:43:ThesisSection:KISS_LINES=22
Method body >20 lines (node): ./web/components/share/ShareRow.tsx:62:88:ShareRow:KISS_LINES=24
Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:36:64:FigureStatusRow:KISS_LINES=27
Possible duplication (5x identical 4-line block, first at ./web/components/ProvenanceStrip.tsx:56): </li> /))} /</ul> /</a>
Possible duplication (4x identical 4-line block, first at ./app/(admin)/admin/(authed)/page.tsx:80): </tbody> /</table> /); /))}
Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:115): type: "problem", /docs: { /description: /meta: {
Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:132): schema: [], /}, /create(context) { /},
Possible duplication (3x identical 4-line block, first at ./web/components/metrics/views.ts:153): ...headValue, /summary: summaryOf(input.content, value.points.length), /readout: [ /return {
Possible duplication (3x identical 4-line block, first at ./app/(admin)/admin/(authed)/page.tsx:79): ))} /</tbody> /</table> /</tr>
Possible duplication (2x identical 4-line block, first at ./web/ingest/run-compute.ts:96): }, /}; /return { kind: 'ok', snapshot }; /detail: freshness.reason ?? 'outside freshness window',
Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:133): }, /create(context) { /return { /schema: [],
Possible duplication (2x identical 4-line block, first at ./web/components/public/SiteHeader.tsx:120): {content.t(anchor.label)} /</a> /))} /<a key={anchor.href} href={anchor.href}>
Possible duplication (2x identical 4-line block, first at ./web/derived/series-store.ts:35): try { /files = readdirSync(dir).filter((file) => file.endsWith('.json')); /} catch { /let files: string[];
Empty method body (java): ./.standards/ci/templates/archunit/OutboxArchRules.java:30
Empty method body (java): ./.standards/ci/templates/archunit/SagaArchRules.java:33
SRP: possible god file (node) — ./web/content/keys.ts: 408 lines, 0 methods (split by responsibility)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:18)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:26)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:29)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:36)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:39)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:46)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:55)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:63)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:70)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:78)
Comments: commented-out code (./tests/acceptance/gitignore.test.ts:48)
Comments: commented-out code (./tests/acceptance/gitignore.test.ts:52)
Comments: commented-out code (./tests/acceptance/gitignore.test.ts:57)
Comments: commented-out code (./tests/unit/design-revision.test.ts:136)
Comments: commented-out code (./tests/unit/design-revision.test.ts:143)
Comments: commented-out code (./tests/unit/design-revision.test.ts:157)
Comments: commented-out code (./tests/unit/design-revision.test.ts:161)
Comments: commented-out code (./tests/unit/design-revision.test.ts:171)
Comments: commented-out code (./tests/unit/design-revision.test.ts:175)
Comments: commented-out code (./tests/unit/design-revision.test.ts:183)
Comments: commented-out code (./tests/unit/design-revision.test.ts:199)
Comments: commented-out code (./tests/unit/design-revision.test.ts:206)
Comments: commented-out code (./tests/unit/design-revision.test.ts:215)
Comments: commented-out code (./tests/unit/design-revision.test.ts:222)
Comments: commented-out code (./tests/unit/design-revision.test.ts:226)
Comments: commented-out code (./tests/unit/design-revision.test.ts:234)
Comments: commented-out code (./tests/unit/design-revision.test.ts:242)
Comments: commented-out code (./tests/unit/design-revision.test.ts:249)
Comments: commented-out code (./tests/unit/design-revision.test.ts:256)
Comments: commented-out code (./tests/unit/series-coverage-gaps.test.ts:169)
Comments: commented-out code (./scripts/compute.ts:16)
Comments: commented-out code (./scripts/check-sitemap.ts:20)
Comments: comment restates the following line (./session-start-check.sh:25)
Comments: comment restates the following line (./session-start-check.sh:43)
Comments: commented-out code (./.standards/scripts/check-code-principles.selftest.sh:641)
Comments: section-divider comment (./.standards/scripts/check-code-principles.selftest.sh:639)
Comments: comment restates the following line (./.standards/scripts/tests/gate-telemetry.selftest.sh:150)
Comments: commented-out code (./.standards/scripts/check-bats-assertions.sh:21)
Comments: TODO/FIXME without an issue reference (./.standards/scripts/gate-clean-code-lib.sh:97)
Comments: commented-out code (./.standards/scripts/verify-production-deploy.sh:30)
Comments: commented-out code (./.standards/scripts/check-code-principles.sh:58)
Comments: commented-out code (./.standards/scripts/check-code-principles.sh:121)
Comments: TODO/FIXME without an issue reference (./.standards/scripts/check-code-principles.sh:57)
Comments: attribution comment (./.standards/scripts/check-code-principles.sh:59)
Comments: comment restates the following line (./.standards/scripts/check-remediation-budget.sh:139)
Comments: comment restates the following line (./.standards/scripts/check-remediation-budget.sh:209)
Comments: commented-out code (./.standards/scripts/lint-outbox-schema.sh:13)
Comments: commented-out code (./.standards/scripts/lint-outbox-schema.sh:22)
Comments: TODO/FIXME without an issue reference (./.standards/scripts/check-saga-timeouts.sh:185)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:51)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:53)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:90)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:92)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:132)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:134)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:149)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:151)
Comments: commented-out code (./.standards/scripts/check-loop-files.sh:10)
Comments: section-divider comment (./.standards/scripts/init-ci.sh:6)
Comments: section-divider comment (./.standards/scripts/init-ci.sh:43)
Comments: commented-out code (./.standards/scripts/check-loop-triage.sh:39)
Comments: commented-out code (./.standards/scripts/check-loop-triage.sh:49)
Comments: commented-out code (./.standards/scripts/check-loop-triage.sh:67)
Comments: commented-out code (./.standards/scripts/token-stats.sh:10)
Comments: commented-out code (./.standards/scripts/classify-spec-size.sh:28)
Comments: commented-out code (./.standards/scripts/guard-env.sh:21)
Comments: commented-out code (./.standards/scripts/check-ci-sweeper.sh:37)
Comments: commented-out code (./.standards/scripts/check-security-hardening.sh:39)
Comments: commented-out code (./.standards/scripts/judgment-preflight.sh:16)
Comments: commented-out code (./.standards/scripts/check-model-env.sh:30)
Comments: commented-out code (./.standards/scripts/gate-stats.sh:20)
Comments: commented-out code (./.standards/scripts/check-pr-babysitter.sh:56)
Comments: TODO/FIXME without an issue reference (./.standards/scripts/check-saga-tests.sh:85)
Comments: comment restates the following line (./session-end-check.sh:14)
Comments: comment restates the following line (./session-end-check.sh:38)
Naming: boolean flag parameter (hasDedupStore) (./.standards/ci/templates/archunit/OutboxArchRules.java:197)
Naming: boolean flag parameter (hasCompensation) (./.standards/ci/templates/archunit/SagaArchRules.java:147)
Naming: boolean flag parameter (hasStateStore) (./.standards/ci/templates/archunit/SagaArchRules.java:201)
Naming: more than three parameters (Fprintf) (./.standards/ci/templates/go-saga-lint.go:61)
Naming: noise word in type name (PanelData) (./app/(admin)/admin/(authed)/page.tsx:12)
Naming: noise word in type name (ProposalData) (./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:12)
Naming: noise word in type name (ReviewData) (./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:11)
Naming: single-character identifier (a) (./web/admin/auth/constant-time.ts:9)
Naming: single-character identifier (b) (./web/admin/auth/constant-time.ts:10)
Naming: more than three parameters (plan) (./web/admin/routes.ts:42)
Naming: more than three parameters (yAt) (./web/charts/geometry.ts:34)
Naming: single-character identifier (x) (./web/charts/geometry.ts:61)
Naming: single-character identifier (y) (./web/charts/geometry.ts:62)
Naming: more than three parameters (xForValue) (./web/charts/geometry.ts:112)
Naming: noise word in type name (DataTableProps) (./web/components/DataTable.tsx:11)
Naming: single-character identifier (t) (./web/components/ProvenanceStrip.tsx:70)
Naming: single-character identifier (t) (./web/components/ProvenanceStrip.tsx:99)
Naming: single-character identifier (y) (./web/components/charts/LineChart.tsx:32)
Naming: more than three parameters (yAt) (./web/components/charts/LineChart.tsx:32)
Naming: single-character identifier (y) (./web/components/charts/RangeChart.tsx:27)
Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
Naming: single-character identifier (y) (./web/components/series/PyramidPanel.tsx:73)
Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:303)
Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-series.ts:190)
Naming: more than three parameters (addToBand) (./web/series/age-structure.ts:117)
Naming: more than three parameters (accumulateExcluded) (./web/series/age-structure.ts:124)
Naming: more than three parameters (accumulateExcluded) (./web/series/age-structure.ts:142)
Naming: more than three parameters (addToBand) (./web/series/age-structure.ts:145)
Naming: more than three parameters (structureFor) (./web/series/age-structure.ts:237)
Naming: more than three parameters (addToYear) (./web/series/countdown.ts:96)
Naming: more than three parameters (addToYear) (./web/series/countdown.ts:108)
Null-discipline: return null (./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:20)
Null-discipline: return null (./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:20)
Null-discipline: return null (./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:65)
Null-discipline: return null (./scripts/check-sitemap.ts:176)
Null-discipline: return null (./scripts/ingest-population-projection.ts:29)
Null-discipline: return null (./web/series/age-bands.ts:34)
Null-discipline: return null (./web/series/clock.ts:42)
Null-discipline: return null (./web/series/clock.ts:43)
Null-discipline: return null (./web/series/clock.ts:94)
Null-discipline: return null (./web/series/countdown.ts:155)
Null-discipline: return null (./web/series/countdown.ts:176)
Null-discipline: return null (./web/series/countdown.ts:223)
Null-discipline: return null (./web/series/countdown.ts:226)
Null-discipline: return null (./web/series/fuse.ts:37)
Null-discipline: return null (./web/series/fuse.ts:46)
Null-discipline: return null (./web/series/fuse.ts:48)
Null-discipline: return null (./web/sources/labels.ts:8)
Null-discipline: return null (./web/sources/eurostat.ts:56)
Null-discipline: return null (./web/sources/eurostat.ts:59)
Null-discipline: return null (./web/sources/ine.ts:23)
Null-discipline: return null (./web/sources/ine.ts:25)
Null-discipline: return null (./web/sources/ine.ts:31)
Null-discipline: return null (./web/sources/ine.ts:33)
Null-discipline: return null (./web/metrics/npv.ts:76)
Null-discipline: return null (./web/metrics/npv.ts:86)
Null-discipline: return null (./web/metrics/npv.ts:93)
Null-discipline: return null (./web/metrics/dependency-ratio.ts:49)
Null-discipline: return null (./web/metrics/pension-share.ts:20)
Null-discipline: return null (./web/metrics/pension-share.ts:29)
Null-discipline: return null (./web/metrics/cohort-irr.ts:66)
Null-discipline: null argument (./web/ingest/deterministic-json.ts:7)
Null-discipline: return null (./web/ingest/validate-figure.ts:43)
Null-discipline: return null (./web/ingest/run-series.ts:178)
Null-discipline: return null (./web/ingest/run-compute.ts:280)
Null-discipline: return null (./web/manifest/validate.ts:126)
Null-discipline: return null (./web/seo/share-card.tsx:108)
Null-discipline: return null (./web/content/registers.ts:110)
Null-discipline: return null (./web/content/registers.ts:128)
Null-discipline: return null (./web/content/registers.ts:130)
Null-discipline: null argument (./web/admin/http.ts:28)
Null-discipline: return null (./web/admin/revisions/pending-store.ts:66)
Null-discipline: return null (./web/admin/revisions/review-token.ts:39)
Null-discipline: return null (./web/admin/revisions/review-token.ts:41)
Null-discipline: return null (./web/admin/revisions/review-token.ts:48)
Null-discipline: return null (./web/admin/revisions/review-token.ts:51)
Null-discipline: return null (./web/admin/auth/session.ts:55)
Null-discipline: return null (./web/admin/auth/session.ts:59)
Null-discipline: return null (./web/admin/auth/session.ts:70)
Null-discipline: return null (./web/admin/auth/session.ts:72)
Null-discipline: return null (./web/components/public-page-props.ts:53)
Null-discipline: return null (./web/components/public-page-props.ts:56)
Null-discipline: return null (./web/components/series/PyramidPlate.tsx:140)
Null-discipline: return null (./web/components/ProvenanceStrip.tsx:47)
Null-discipline: return null (./web/components/metrics/figure-state.ts:25)
Null-discipline: return null (./web/components/metrics/range-views.ts:52)
Null-discipline: return null (./web/components/metrics/PlateBody.tsx:56)
Null-discipline: return null (./web/components/public/PyramidStep.tsx:20)
Null-discipline: return null (./web/components/public/CountdownPrecision.tsx:15)
Null-discipline: return null (./web/components/public/CountdownPrecision.tsx:26)
Null-discipline: return null (./web/components/public/CountdownPrecision.tsx:39)
Null-discipline: return null (./web/components/public/CountdownPrecision.tsx:50)
Null-discipline: return null (./web/components/public/SubjectFacts.tsx:19)
Null-discipline: return null (./web/components/public/SubjectFacts.tsx:27)
Null-discipline: return null (./web/components/public/DistanceStep.tsx:28)
Null-discipline: return null (./web/components/public/MethodRegion.tsx:32)
Null-discipline: return null (./web/components/public/MethodRegion.tsx:45)
Null-discipline: return null (./web/components/public/NumberStep.tsx:92)
Null-discipline: return null (./web/components/charts/LineChart.tsx:44)
Null-discipline: return null (./web/components/registers/DisputeSection.tsx:19)
Null-discipline: return null (./web/components/registers/AgreementSection.tsx:21)
Null-discipline: return null (./web/components/share/ShareRow.tsx:44)

The 213 WARNs are advisory only (complexity/DRY/YAGNI/SOLID are the blocking set; naming
and null-discipline never FAIL). 52 of them are inside the `.standards/` submodule, which
the script scans because it is not in its prune list. Scoped to this change:

command: bash .standards/scripts/check-code-principles.sh . -BaseRef main --json
exit: 0

```
fails 0 warns 7
Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
Naming: single-character identifier (y) (./web/components/series/PyramidPanel.tsx:73)
Null-discipline: return null (./web/series/clock.ts:42)
Null-discipline: return null (./web/series/clock.ts:43)
Null-discipline: return null (./web/series/clock.ts:94)
Null-discipline: return null (./web/components/series/PyramidPlate.tsx:140)
Null-discipline: return null (./web/components/public/NumberStep.tsx:92)
```

No new complexity, duplication, YAGNI or SOLID FAIL was introduced by the change.

## Evidence: scenario-to-behavior spot check

command: manual inspection of AC-006-04, AC-006-22, AC-006-32, AC-006-35 against tests/acceptance/spec-006-number-group.test.ts, spec-006-box.test.ts, spec-006-static-html.test.ts, spec-006-canonical-share.test.ts
exit: 0
at: 2026-11-06T11:29:00Z

**AC-006-04 (Task 2, "the group publishes exactly one quantity")** — the test slices
`clock__field--days` through `</p>`, asserts it contains `clock__value--days` and
`class="clock__label">${días}<`, asserts `clockLabels(group)` equals exactly `[días]`,
asserts the sub-day/years markers are absent, asserts the four content keys are still
declared, and asserts the anchor is non-null. Matches the Then clauses. **PASS.**

**AC-006-22 (Task 8, "no story step paints a ground")** — the test iterates every
`[data-top-step]`, requires `transparent` or the page ground, requires step 1's border
width `0` and `box-shadow: none`, measures the first-ink-to-header gap `>= 32`, and
measures the shared hairline `> 0`. Matches the Then clauses. **PASS.** (Independent
measurement below: 0 grounds, border 0, shadow none, clearance 59–61 px.)

**AC-006-32 (Task 12, "the served HTML is the value")** — the test reads the numeral, the
`data-rendered-at` attribute, recomputes `readClock(anchor, declaredInstant).days`,
compares the numeral's digits, waits two seconds and asserts step 1's text is unchanged,
and separately asserts `revalidate = 3600` in both layouts and `dynamic = 'force-static'`
in both pages. Matches the Then clauses. **PASS.**

**AC-006-35 (Task 13, "the shared origin is the serving origin")** — **partial.** The test
compares the served page's four share hrefs to the page's own `<link rel="canonical">`
origin and that origin to `SITE_URL`; the live equality (`PRODUCTION_URL`) is inside
`if (process.env.PRODUCTION_URL …)`. `PRODUCTION_URL` is set nowhere in `.github/` or
`.standards/.github/`, so the scenario's "equals the origin that served the page" clause
is **not exercised** by `npm test` or by this repo's CI. The test's own name is honest
("…and it is the canonical's"), so this is an uncovered clause, not a test asserting the
wrong thing. Recorded as **F2**; stage 5c must verify it against the live origin.

## Supplementary evidence

These are outside the five contract checks but are the measurements the design and the
claim "ISR is real" depend on.

### Build and ISR route table

command: npm run build
exit: 0
at: 2026-11-06T11:27:35Z

```
> pensions-system@0.0.0 prebuild
> tsx scripts/verify-derived.ts && … && tsx scripts/check-scenario-traceability-3digit.ts && tsx scripts/check-plain-language.ts
derived figures verified: 7 (2 computed, 5 unavailable)
derived series verified: 3
country scope gate: clean (5 locales)
public vocabulary gate: clean (5 locales)
scenario traceability (2-3 digit ids): 359 scenarios, all cited, all citations resolve
plain-language gate: clean (5 locales)

> pensions-system@0.0.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
✓ Compiled successfully in 208ms
  Running TypeScript ...
  Finished TypeScript in 1745ms ...
✓ Generating static pages using 11 workers (17/17) in 746ms

Route (app)                                             Revalidate  Expire
┌ ○ /                                                           1h      1y
├ ○ /_not-found
├   /[locale]
│ ├ ● /en                                                       1h      1y
│ ├ ● /fr                                                       1h      1y
│ ├ ● /de                                                       1h      1y
│ └ ● /it                                                       1h      1y
…
○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

`/` (the `es` route) and all four `/[locale]` children are **○/● with `Revalidate 1h`**.
`force-static` does **not** swallow `revalidate` in Next 16.4.3: the pages keep
`export const dynamic = 'force-static'`, the layouts declare `export const revalidate =
3600`, and the build output applies the window. D17 is real, not fiction.

### Served-page measurement (390×844, 1366×768, 1440×900; `es` and `de`)

command: npx tsx /tmp/verifier-measure.mts (scratch harness, removed after the run; it reuses tests/helpers/served-browser.ts — headless Chromium over CDP against `next start`, per-text-node `Range` rects, step 1 content box as the reference)
exit: 0
at: 2026-11-06T11:27:57Z

| locale | viewport | step 1 bg | border | shadow | first ink below header | max unit centre offset | residual max | numeral↔unit gap | painted grounds | accent text leaves | distinct sizes | max size (h1) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| es | 390×844 | transparent | 0 | none | 61 px | 0.01 px | 0.02 px | 12.0 px | 0 (contract) | 1 (`5534`) | 6 | 44 (40) |
| es | 1366×768 | transparent | 0 | none | 59 px | 0.01 px | 0.02 px | 12.0 px | 0 | 1 (`5534`) | 7 | 80 (64) |
| es | 1440×900 | transparent | 0 | none | 59 px | 0.01 px | 0.02 px | 12.0 px | 0 | 1 (`5534`) | 8* | 80 (64) |
| de | 390×844 | transparent | 0 | none | 61 px | 0.01 px | 0.02 px | 12.0 px | 0 (contract) | 1 (`5.534`) | 6 | 44 (40) |
| de | 1366×768 | transparent | 0 | none | 59 px | 0.01 px | 0.02 px | 12.0 px | 0 | 1 (`5.534`) | 7 | 80 (64) |
| de | 1440×900 | transparent | 0 | none | 59 px | 0.01 px | 0.02 px | 12.0 px | 0 | 1 (`5.534`) | 7 | 80 (64) |

\* The raw scan counts the chart's 9 px axis tick at 1440×900 `es` (see **F3**); the
acceptance test excludes `.demography__svg` from the count, so its count is 7.

At 390×844 the only raw non-transparent box is the **closed** mobile index panel
(`.index-panel`, 44×420), a phantom rect that contract §2.1 explicitly excludes; the
contract's rendered predicate returns **0** painted grounds (verified in the accent run).
The `.locale-group__cell[aria-current='page']` carries `font-weight: 600` against siblings'
`400`, with all backgrounds transparent; exactly one `aria-current="page"`.

**Box gone, axis centred:** step 1 paints nothing, has no border and no shadow, and its
first text ink starts 59–61 px below the header (floor 32). All four units — `<h1>`, step
label, number line, sentence — centre to ≤0.01 px with residual ≤0.02 px in both `es` and
`de` at all three viewports, and `scrollWidth === clientWidth` everywhere.

### Contrast, recomputed from the declared hexes

command: npx tsx /tmp/verifier-contrast.ts (scratch; tests/helpers/colour.ts `contrast`, `chroma`, `hue`)
exit: 0
at: 2026-11-06T11:28:56Z

Every pair the design lists was recomputed on the declared hexes, not on quoted numbers.
All rows pass, in both themes. Representative output:

```
--- light ---
ink-1 on surface-1: 16.83 (min 7) PASS
ink-2 on surface-1: 9.15 (min 4.5) PASS
ink-3 on surface-3: 4.60 (min 4.5) PASS
accent on surface-1: 9.85 (min 4.5) PASS
on-accent on accent: 9.85 (min 7) PASS
chromatic>20: accent
tint 10-20: (none)
max neutral chroma: 3.80
accent hue: 21.7 gap from 0: 21.7
--- dark ---
ink-1 on surface-1: 17.01 (min 7) PASS
ink-2 on surface-1: 10.69 (min 4.5) PASS
ink-3 on surface-3: 5.42 (min 4.5) PASS
accent on surface-1: 7.89 (min 4.5) PASS
on-accent on accent: 7.89 (min 7) PASS
chromatic>20: accent
tint 10-20: (none)
max neutral chroma: 3.89
accent hue: 15.2 gap from 0: 15.2
```

One chromatic value per theme (the accent, inside the 340°–40° band); every other public
token is ≤10 chroma; the 10–20 "tint" band is empty. The palette ships no failing pair.

### Projection form paints (measured, not read from CSS)

command: npx tsx /tmp/verifier-measure.mts (same scratch harness; computed SVG fill + CSS.supports in Chromium)
exit: 0
at: 2026-11-06T11:27:57Z

```
patternCount = 1            (#projection-hatch, inside the projected panel's own <defs>)
CSS.supports('fill','url(#projection-hatch)')            = true
CSS.supports('fill','repeating-linear-gradient(…))       = false
projected bars (42) computed fill = url("#projection-hatch")
observed bars (84) computed fill = rgb(70, 70, 67)       (--ink-2, neutral)
projected baseline stroke-dasharray = 6px, 4px; observed = none
```

The hatch is a real `<pattern>`, the projected bars resolve it, and the CSS gradient the
old `--chart-hatch` used is (correctly) not the mechanism. AC-006-27/28's form encoding
renders.

### Supersession lists

command: grep/count over tests/ and retired-criteria.test.ts
exit: 0
at: 2026-11-06T11:28:56Z

```
RETIRED (15) cited in tests/: must all be 0
AC-001-109 0 … AC-004-64 0        (all 15 are 0)

RE-POINTED (18) citations: must all be >=1
AC-001-99 2  AC-001-106 2  AC-001-110 2  AC-001-115 3  AC-001-117 2
AC-002-08 2  AC-002-17 2  AC-003-02 4  AC-003-03 4  AC-003-26 2
AC-004-06 2  AC-004-07 2  AC-004-59 2  AC-004-66 2  AC-004-68 2
AC-005-14 2  AC-005-16 2  AC-005-38 2

RETIRED entries 39
PRESERVED entries 21

skip mechanisms in tests/: 18 .skipIf(  (no .skip( / .only( / .todo( )
```

The 15 retired ids appear in no test; the 18 re-pointed ids keep their citation with the
assertion moved; `RETIRED` is 39 and `PRESERVED` is 21. `AC-001-099` in the tasks is the
archived id `AC-001-99` (two-digit form); its test now locates the years quantity in
`#metodo`.

## Findings

### F1 — The accent is spent four times; the letter is met, the design's purpose is defeated

**Verdict on the conflict: letter satisfied, purpose defeated.** This is the
"check-that-cannot-fail" pattern in a new form, and the criterion that cannot see it is
`AC-006-26`.

**Measured.** On the delivered page the accent (`#7a1f2b`, chroma 42.80) appears in four
places:

| Appearance | Declaration | Above the fold? |
|---|---|---|
| the day numeral's text | `.clock__value--days { color: var(--accent) }` | yes (the intended one) |
| the primary CTA's filled ground | `.hero__cta { background: var(--accent) }` | no (step 5) |
| the fuse's burnt segment | `.fuse__burnt { fill: var(--accent) }` | no (figures register) |
| the focus ring (state) | `--focus: 2px solid var(--accent)` | on focus only |

(`.admin-btn` is also accent-filled but is admin-only and outside the public bound.)

**What the design required.** `15-design.md` RESTRAINT 10 says "**one** chromatic value on
the entire page, at **one** place (the day numeral)", and its deliberate-violations list is
explicit: the CTA "becomes `--ink-1` with an `--on-accent` label", and the fuse's burnt
segment "is ink, not accent" (`--fuse-burnt: var(--ink-1)`, cord `--ink-3`). Neither
departure is implemented.

**Why the gates are still green.** `AC-006-11` counts *text leaves above the fold*; the
CTA's text is `--on-accent` and the fuse is an SVG `fill`, so neither is a text leaf.
`AC-006-26`'s *title* says "The accent paints one rule, and only one", but its *Then*
clause counts only `color:` declarations — a `background:` and a `fill:` are invisible to
it. `AC-006-24` counts chromatic *token values*, and both extra appearances reuse the same
accent value, so it sees one colour. The three criteria each measure a proxy narrower than
the design property ("one place on the whole page").

**Root cause is the spec set, not the Coder.** Two in-force criteria *require* the fills,
and `10-tasks.md` §4 neither retires nor re-points them:

- `AC-002-31`'s test asserts `.hero__cta { background: var(--accent) }` and that it is
  "the page's only accent-filled action". `RETIRED` does not contain it; `PRESERVED` does.
- `AC-003-22`'s test asserts `.fuse__burnt { fill: var(--accent) }`. §4.3 lists it as
  "kept in force (now stronger: no chroma at all)" — a parenthetical that cannot hold
  while its own unmodified test mandates the accent.

The Coder could not honour `15-design.md` without turning the suite red. The CSS comment
next to `.hero__cta` states the choice explicitly ("The primary action keeps its filled
accent ground (AC-002-31 stays in force)"). **Routing:** structure/spec →
Specifier (re-point `AC-002-31` and `AC-003-22`, and add one criterion that counts accent
appearances across `color`/`background`/`fill`/`stroke` on the whole page, not just text
leaves), then Refactorer/Coder; alternatively confirm the design's stricter intent and
amend `15-design.md`. This is not a runnable-gate FAIL and does not stop stage 5a, but the
Architect should **not** record the design's "one accent, one place" intent as met.

### F2 — `AC-006-35`'s live equality is never exercised

The test's live branch is inside `if (process.env.PRODUCTION_URL …)`. `PRODUCTION_URL` is
set in no workflow (`.github/`, `.standards/.github/`). In a plain `npm test` the test
compares the share hrefs to the page's own canonical link and that link to `SITE_URL` —
the exact self-referential shape D11 warns about. The scenario's core clause ("each
embedded URL's origin equals the origin that served the page … checked against the live
deployment") is therefore **unverified at stage 4 and unverified in CI**. Stage 5c must
supply `PRODUCTION_URL` (or its equivalent) and assert the equality against the live
preview origin. Routing: test/CI wiring → Coder/PR Opener, verification → stage 5c.

### F3 — `AC-006-14` excludes chart internals from the count; the design's note is factually wrong at 1440×900

The test filters `!el.closest('.demography__svg')` out of the above-fold leaf set, then
asserts the remaining sizes are token values and separately asserts every
`.demography__svg text` size is 9 px. That is a deliberate design instruction, but it
narrows contract §2.9 ("rendered text leaves above the fold", no exclusion). Independently
measured, the 9 px `.demography__tick` **does** enter the above-fold set at **1440×900
`es`** (8 distinct sizes including 9), contradicting the design's watch item ("not on any
of the fifteen matrix pages"). The count still passes (`8 ≤ 9`) and the 9 px literal is
pre-existing, so this is a recorded deviation, not a FAIL. It is listed because a future
change could rely on the design's incorrect claim.

### F4 — Design-principles tier auto-detect reads `mvp`, not the repo's `production`

The script globs `AGENTS_*.md`; this repo's declaration lives in `AGENTS.md`, so the gate
ran at `mvp`. The property-test gate was re-run explicitly at `--tier production` and is
clean (0 FAIL / 0 WARN), and the suite contains 7 new `fc.property` blocks across
`tests/unit/step-number-properties.test.ts` (3) and `tests/unit/pyramid-panel-properties.test.ts`
(4). Recorded so the tier mismatch is not mistaken for a pass-by-luck.

### F5 — The Refactorer's "11 skipped" does not reproduce

This run reports **0 skipped** (112 files / 1040 passed). The suite has exactly 18
`.skipIf(` guards (11 of them the spec-006 browser `describe` blocks), all keyed on
`BUILD_PRESENT && CHROME_PATH`; with the build and Chromium present every one executed.
No acceptance criterion is parked behind a CI-only path except `AC-006-35`'s live half
(F2). The "11" is most consistent with the 11 browser-guarded spec-006 suites counted at
suite level; it is not 11 parked tests.

### F6 — `AC-006-21`'s "no test is skipped" regex misses `.skipIf`

The check scans for `.(skip|only|todo)(`, which does not match `describe.skipIf(` or
`it.skipIf(`. The environment guards are legitimate, so this is a note, not a failure;
a future criterion that intends to forbid conditional tests should match `skipIf` too.

### What prior stages missed

- **The accent conflict is a spec-set defect, not a Coder defect.** The Coder's and
  Refactorer's reports treated the palette as coherent. Neither noticed that
  `15-design.md`'s CTA and fuse de-accenting cannot be implemented while `AC-002-31` and
  `AC-003-22` remain in force with tests that mandate `.hero__cta { background:
  var(--accent) }` and `.fuse__burnt { fill: var(--accent) }`. The Specifier's §4 should
  have re-pointed both criteria (or the design should have accepted the fills).
- **"11 skipped" is not reproducible.** This run reports 0 skipped with the build and
  Chromium present; the only guards are `BUILD_PRESENT`/`CHROME_PATH` conditionals.
- **The design's `.demography__tick` note is factually wrong.** It claims the 9 px literal
  is "not on any of the fifteen matrix pages"; independently measured, it enters the
  above-fold set at 1440×900 `es` (8 distinct sizes including 9). The count still passes.
- **`AC-006-35`'s live half is unwired.** `PRODUCTION_URL` is set in no workflow, so the
  serving-origin equality is unverified at stage 4 and in CI.
- **The design-principles tier auto-detect reads `mvp`.** It globs `AGENTS_*.md`; this repo
  declares `production` in `AGENTS.md`, so the property-test gate was re-run explicitly at
  the declared tier (clean) rather than trusted from the auto-detected run.

## No unaccounted behavior

Skimmed the tracked diff (43 files, +592/−2270) against `10-tasks.md`. Everything maps:

- `web/components/series/CountdownClock.tsx`, `web/series/clock-ticker.ts` deleted;
  `CLOCK_TICK_MS`, `CLOCK_FIELDS`, `ClockField` removed from `web/series/clock.ts` —
  Task 12.
- `NumberStep.tsx` loses the years line and sub-day subtree, becomes a server component,
  carries `data-rendered-at` — Tasks 2, 11, 12.
- `PyramidPlate.tsx` split into `PyramidPlate.tsx` + `PyramidPanel.tsx` (component-per-file
  / SRP, Refactorer); `PyramidPanel` adds the `<pattern>` and the projected-bar fill —
  Task 10.
- `tokens.css` colour revaluation and `--surface-hero` retirement — Task 9; `globals.css`
  centring, tap minimums, locale marker, ground removal, link ink, panel hue — Tasks 1, 4,
  5, 8, 9, 10.
- `web/content/site.ts` default origin — Task 13.
- Brand assets (`web/brand/generated.ts`, `app/icon.svg`, `app/apple-icon.png`,
  `app/favicon.ico`, `public/icon-192.png`, `public/icon-512.png`) regenerated from the
  old ink/on-accent (`#1e160d`/`#fdf2e1`) to the new (`#1a1a18`/`#fbfbfa`) — a consequence
  of Task 9, produced by the existing brand builder.
- Test-file edits are citation removals/re-points and the new `tests/helpers/served-browser.ts`
  harness — Task 7 / §4.5.

No production logic without a task behind it. Pre-existing dirt not attributed:
`.standards` pointer, `runs.jsonl`, `live-005-top.png`, `live-006box.png`, untracked
`specs/`.

## Re-verification and telemetry

Attempt **1, phase 1**. There is no prior `25-verification.md` for this spec, so this is a
full run, not a scoped re-trigger. No gate BLOCKed and no fix was routed.

Telemetry appended via `bash .standards/scripts/record-gate-run.sh` with
`SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=0`, `SPEC_PHASE2_RETRIES=0`; `specSlug`
`006-centred-number`, `gatesFailed: []`, `warnings` for F1–F6, `outcome: "pass"`.

Operational note: in a child repo the helper's default `$ROOT/runs.jsonl` resolves to
`.standards/runs.jsonl` (the submodule), not the repo root. The record was written to the
repo-root `runs.jsonl` with `-f`, exactly once (`grep -c` = 1), and the stray submodule
line was removed. This is a helper-path quirk worth fixing upstream; it did not lose a
record.

---

# Verification — attempt 2 (phase 1, cycle 1 of max 3)

**Verifier:** spec-verifier (scoped re-verification — the revision-3 fix set)
**Attempt:** 2, phase 1 (cycle 1 of max 3)
**Branch:** `spec/006-centred-number`
**Date:** 2026-11-06
**Scope:** the fixes routed from attempt 1 — `AC-002-31`/`AC-003-22` inversions,
`AC-006-26`'s two-half inventory, `AC-006-36`/`AC-006-37`, the ten-criterion
counting-method sweep, the 37/39/21/20 totals, and the Coder's reported flake.
**Prior attempt:** attempt 1 above; preserved, not rewritten.

## Attempt 2 verdict

**BLOCK.** Two independent reasons, plus three recorded warnings:

1. **Full test suite — BLOCK (harness/tooling).** One initial run was green, but
   **6/6 repeated full runs exited 1**, every failure `Hook timed out in 10000ms` in a
   browser suite's `beforeAll`/`afterAll`. **No assertion failed**; the test bodies that
   ran passed (1043–1046 of 1046). The suite is not reliably green, so the gate cannot be
   transcribed as green. The Coder's "three consecutive full runs green" does not
   reproduce here.
2. **Scenario-to-behaviour — FAIL.** `AC-006-20`'s test uses the exact **shorter property
   list** its scenario forbids, and its `(?:^|;)` anchor misses a rule's *first*
   declaration. Injecting `outline: 1px solid #ff0000` and `border-top-color: #ff0000`
   leaves every literal test green. A false green, and a direct contradiction of the
   scenario's "the shorter property list is not used".

The revision-3 fixes themselves are substantially correct: the accent budget is now real
on `box-shadow` and `border-color` (both halves), the de-accented pairs pass, the ring is
bounded, the fuse pair improves, the inversions fail on the old CSS, the gap is 12.0 px,
and the totals are 37 / 39 / 21 / 20.

## Evidence (attempt 2): full test suite and the flake

command: npm test (one initial run, then six repeated full runs)
exit: 0 on the initial run; 1 on all six repeated runs
at: 2026-11-06T12:02:56Z

```
initial:  Test Files 112 passed (112) | Tests 1046 passed (1046) | exit 0
          start 2026-11-06T11:53:06Z end 2026-11-06T11:54:18Z

repeated full runs (identical command, no code change):
run 1  11:55:17Z-11:56:35Z  exit 1  Test Files 6 failed | 106 passed  Tests 1044 passed | 2 skipped
run 2  11:56:35Z-11:57:55Z  exit 1  Test Files 5 failed | 107 passed  Tests 1046 passed
run 3  11:57:55Z-11:59:30Z  exit 1  Test Files 3 failed | 109 passed  Tests 1043 passed | 3 skipped
run 4  11:59:30Z-12:00:37Z  exit 1  Test Files 1 failed | 111 passed  Tests 1046 passed
run 5  12:00:37Z-12:01:46Z  exit 1  Test Files 1 failed | 111 passed  Tests 1046 passed
run 6  12:01:46Z-12:02:56Z  exit 1  Test Files 1 failed | 111 passed  Tests 1046 passed

failing suites per run (all "Hook timed out in 10000ms"):
run 1  countdown-band-browser, no-empty-columns, spec-005-step-air-browser,
       spec-006-box, spec-006-canonical-share, spec-006-supersessions
run 2  countdown-band-browser, one-screen-per-step, spec-006-centred-axis,
       spec-006-number-group, spec-006-palette
run 3  no-empty-columns, spec-006-palette, spec-006-projection-form
run 4  spec-006-type-scale
run 5  spec-006-number-group
run 6  spec-005-step-air-browser
```

The Coder's exact "two browser-test failures" are **not recoverable** from the artifact —
no failing-run log was preserved — so the identification below is from these six
reproductions. The reproduced failures are suite-level hook timeouts, and the failing
suite set varies run to run.

**Flake determination: harness contention, not a geometry/painting defect.** The
evidence that distinguishes the two:

- **Every failure is a hook timeout** (`beforeAll`/`afterAll`), with **zero
  `AssertionError`** in 6/6 runs. A real geometry/painting defect would fail an assertion
  and name the measured value.
- **The failing set is non-deterministic** — 6 suites in run 1, 1 in run 4, a different
  single suite in run 6. A defect in a specific test would fail the same test every run.
- **Every test body that ran passed** (1043–1046 of 1046); the "skipped" counts are tests
  inside suites whose hook timed out.
- **Mechanism:** `vitest.config.ts` sets no `hookTimeout` (default 10 s), while
  `startServedBrowser()` waits for a `next start` server (up to 60 s) plus Chromium, and
  `served.close()` closes pages sequentially. Under the suite's own 11 concurrent browser
  files, setup/teardown can exceed 10 s. The Coder's "runner/browser contention"
  attribution is confirmed in kind — but "three consecutive green" is **not reproducible**
  here (1 green, 6 red), so the suite is not reliably green as claimed.

**Residual risk.** When a hook times out, that suite's browser assertions do not run, so a
real intermittent geometry defect could be dismissed as the same flake. The distinguishing
evidence is the error class: a hook timeout is not an assertion failure; the measured
geometry/painting assertions pass in every suite whose hook completes (including the
initial green run and the green-hook suites in each red run). To remove the residual risk,
the hook must be made deterministic — raise `hookTimeout` (or pass per-hook timeouts) and
parallelise `served.close()` — and the suite re-run. Routing: Coder/Refactorer, test
configuration only; do not lower any assertion.

## Evidence (attempt 2): `AC-006-20` — the sweep's one false green

command: npx vitest run tests/acceptance/spec-006-supersessions.test.ts tests/acceptance/visual-identity.test.ts (in a scratch copy with injected literals)
exit: 0 (the test passes with the literals present)
at: 2026-11-06T12:04:00Z

The scenario (`AC-006-20`) requires the full list — `color`, `background`,
`background-color`, `border`, `border-*-color`, `fill`, `stroke`, `outline`,
`outline-color`, `box-shadow` — and says "the shorter property list is not used, because it
would let a `fill` or a `box-shadow` carry a literal the criterion claims does not exist."

The test uses exactly the shorter list, and a `(?:^|;)` anchor that only matches a
declaration after a semicolon:

```
const literal = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\blab\(/i;
for (const match of css.matchAll(/(?:^|;)\s*(color|background|background-color|border-color):\s*([^;]+);/g)) {
```

Construction (scratch copy, current CSS restored between cases):

```
inject .mutant-outline { outline: 1px solid #ff0000; }
       .mutant-border-top { border-top-color: #ff0000; border-top-style: solid; border-top-width: 1px; }
run   spec-006-supersessions + visual-identity
      Test Files 2 passed (2) | Tests 20 passed | 1 skipped  → exit 0   (false green)

inject .mutant-a { color: var(--ink-1); fill: #ff0000; }      (fill AFTER a semicolon)
run   visual-identity -t "no rule outside tokens.css declares a colour literal"
      AC-004-66 FAIL (fill: expected '#ff0000' not to match …)  → exit 1

inject .mutant-b { fill: #ff0000; color: var(--ink-1); }      (fill FIRST in the rule)
run   same test
      Tests 1 passed  → exit 0                                    (anchor misses first decl)
```

Two distinct defects, either sufficient to make the test unfalsifiable for its scenario:

1. **Short list.** `border`, `border-*-color`, `fill`, `stroke`, `outline`,
   `outline-color` and `box-shadow` are never matched. `fill`/`stroke` are partly covered
   by `AC-004-66`, and any non-`none` `box-shadow` is forbidden by `AC-004-65`; `outline`,
   `outline-color`, `border-*-color` and the `border` shorthand are covered by **no** test.
2. **Anchor.** A rule whose literal is its *first* declaration (after `{`) is invisible
   even for the four properties the test lists.

Routing: Coder — widen the `matchAll` to every paint property the scenario names and
anchor it so the first declaration in a rule is scanned (or parse declarations per rule,
as `spec-006-palette.test.ts` does). The scenario is right; the test was not swept.

## Evidence (attempt 2): `AC-006-26` — the widened inventory can now fail

command: scratch mutants (sheet half) + headless Chromium injection (element half)
exit: 1 on the box-shadow and border-color mutants; 0 on the border shorthand
at: 2026-11-06T12:04:00Z

**Sheet half** (`.standards`-style rule scan, current CSS restored between cases):

```
.mutant-shadow   { box-shadow: 0 0 0 2px var(--accent); }
  → AC-006-26 "exactly one resting rule declares the accent" FAIL
    expected [ {…}, {…} ] to deeply equal [ {…} ]            exit 1
.mutant-border   { border-color: var(--accent); border-style: solid; border-width: 1px; }
  → same FAIL                                               exit 1
.mutant-shorthand{ border: 1px solid var(--accent); }
  → PASS                                                    exit 0   (residual gap)
```

**Element half** (real served page, `es` 1440×900, then runtime injection):

```
base                          → 1 hit: span.clock__value--days channels ["color"]
+.step__label accent box-shadow → 2 hits: h2.step__label ["box-shadow"] + numeral ["color"]
+.step__label accent border     → 2 hits: h2.step__label ["border-top/right/bottom/left-color"]
                                 + numeral ["color"]
```

The element half sees a `box-shadow` and a `border-*-color`; the test asserts exactly one
hit, so each injection fails it. **The widened criterion is real for the obvious cases,
on both halves.**

**Residual gap (WARN):** the sheet half's `PAINT_CHANNELS` omits the `border`/`outline`
shorthands, so a shorthand in a rule that renders nothing (e.g. a non-focus state) is
invisible to both halves. The element half catches a shorthand on a rendered element
(computed `border-*-color`). Adding `border`/`outline` to the sheet's channel regex, or
documenting the exclusion, closes it.

## Evidence (attempt 2): de-accented pairs, ring, fuse, gap

command: npx tsx /tmp/v006b-contrast.mts; npx tsx /tmp/v006b-browser.mts
exit: 0
at: 2026-11-06T12:03:43Z (contrast), 2026-11-06T12:03:10Z (browser)

```
CTA text (--surface-1 on --ink-1):            light 16.83 / dark 17.01   (min AAA 7) PASS
fuse burnt/cord (--ink-1 on --ink-3):         light 3.11  / dark 2.57    (3 / 2.5)  PASS
numeral (--accent on --surface-1):            light 9.85  / dark 7.89    (min 4.5)  PASS
--on-accent on --accent:                      light 9.85  / dark 7.89    (min 7)    PASS
ring inside the ink fill (--accent on --ink-1): light 1.71 / dark 2.15   (<3, offset required) PASS
accent chroma:                                42.80 light / 32.74 dark
```

The Coder's quoted **16.13:1** (CTA) and the spec's quoted **2.12:1** (ring inside the
fill) are both numerically wrong — the recomputed values are 16.83/17.01 and 1.71/2.15.
The test assertions (`>= 7`, `< 3`) hold, so this is a documentation WARN, not a gate
failure.

**Ring bounds** (`es`, 1440×900, headless Chromium):

```
at rest   outlinesAtRest 0
Tab       ringCount 1, a, style solid, width 2px, outline-offset 2px
blur      ringCount 0
```

Exactly one `var(--focus)` rule in the sheet, `:focus-visible` (verified by rule scan);
no resting outline declaration. Ring on the page ground 9.85 / 7.89 (>=3); inside the ink
fill 1.71 / 2.15 (<3), which is why `--focus-offset: 2px` is load-bearing. `AC-006-36`
holds.

**Fuse floor** (`AC-006-37`): burnt `--ink-1`, cord `--ink-3`; light 3.11 ≥ 3, dark 2.57
≥ 2.5; both cues (burnt width and label) survive in step 4. Holds.

**Clock unit gap**, independently measured with per-text-node `Range` rects:

```
es 1440×900  gap 12.0 px, unit 19 px, same line true
es  390×844  gap 12.0 px, unit 19 px, same line true
de 1440×900  gap 12.0 px, unit 19 px, same line true
```

The CSS comment's 40.23 px is the with-reservation design figure; the render is 12.0 px,
matching `AC-006-03` and the 5ch-reservation removal. Holds.

## Evidence (attempt 2): the inversions fail on the old CSS

command: scratch copy with `.hero__cta { background: var(--accent); color: var(--on-accent) }` and `.fuse__burnt { fill: var(--accent) }` restored
exit: 1 (expected — the inverted assertions must reject the old CSS)
at: 2026-11-06T12:04:00Z

```
AC-002-31 "ink block with surface ink"      FAIL  expected … to contain 'background: var(--ink-1)'
AC-002-31 "no rule fills with the accent"   FAIL  expected [ '.hero__cta' ] to deeply equal []
AC-003-22 "burnt is --ink-1 …"              FAIL  expected … to match /\.fuse__burnt … fill: var(--ink-1)/
AC-006-26 "exactly one resting rule …"      FAIL  expected [ …(3) ] to deeply equal [ …(1) ]
AC-006-26 "the paints that carried …"       FAIL  .hero__cta background … not to contain '--accent'
Test Files 3 failed | Tests 5 failed | 3 passed | 41 skipped
```

The two inversions are genuine, not relabelled: restoring the old accent fills turns the
suite red in exactly the two carriers plus the widened budget.

## Evidence (attempt 2): ISR and the totals

command: npm run build; npx tsx scripts/check-scenario-traceability-3digit.ts; list greps
exit: 0
at: 2026-11-06T12:03:24Z (build), 2026-11-06T11:52:58Z (traceability)

```
✓ Compiled successfully in 283ms
✓ Generating static pages using 11 workers (17/17)

Route (app)                                             Revalidate  Expire
┌ ○ /                                                           1h      1y
│ ├ ● /en                                                       1h      1y
│ ├ ● /fr                                                       1h      1y
│ ├ ● /de                                                       1h      1y
│ └ ● /it                                                       1h      1y

scenario traceability (2-3 digit ids): 361 scenarios, all cited, all citations resolve
declared AC-006 scenarios: 37
RETIRED: 39   PRESERVED: 21   re-pointed: 20 (includes AC-002-31, AC-003-22)
```

ISR is real (`/` and every `/[locale]` child `Revalidate 1h`), the scenario count is 37,
`RETIRED` is 39, `PRESERVED` is 21, and the re-pointed list is 20 including the two
paint-channel inversions.

## Attempt 2 findings

- **A2-F1 (BLOCK, harness):** the full suite is not reliably green — 6/6 repeated runs
  exit 1 on `Hook timed out in 10000ms`, 0 assertion failures. Fix `hookTimeout` /
  teardown, not assertions. Routing: Coder/Refactorer (test config).
- **A2-F2 (FAIL, test coverage):** `AC-006-20`'s test uses the forbidden shorter property
  list and misses a rule's first declaration; `outline`/`border-top-color` literals pass
  every literal test. Routing: Coder (widen and re-anchor the scan).
- **A2-F3 (WARN):** the `AC-006-26` sheet half does not see `border`/`outline` shorthands;
  the element half sees rendered shorthands. Add them to `PAINT_CHANNELS` or document the
  exclusion.
- **A2-F4 (WARN, documentation):** 16.13 vs 16.83/17.01 (CTA) and 2.12 vs 1.71/2.15 (ring
  inside the ink fill); the assertions hold.
- **A2-F5 (WARN, spec text):** `10-tasks.md` §4.4 says `AC-006-11` now counts "every
  above-fold element on every channel, and *any* hue"; the scenario and test still count
  **text leaves**. The scenario is satisfied; the task's summary overstates it. The
  non-text channels are covered by `AC-006-10` (thick borders/shadows) and `AC-006-26`
  (accent paints); a non-accent 1 px border above the fold is the one edge neither sees.

## Attempt 2 totals

| Item | Attempt 1 | Attempt 2 |
|---|---|---|
| AC-006 scenarios | 35 | **37** |
| `RETIRED` | 39 | **39** |
| `PRESERVED` | 21 | **21** |
| Re-pointed | 18 | **20** |
| Traceability (declared) | 359 | **361** |
| Test files / tests | 112 / 1040 | **112 / 1046** |
| `tsc` | 0 | **0** |
| `lint` | 0 | **0** |
| Design principles | 0 FAIL / 213 WARN | **0 FAIL / 213 WARN** (scoped 7 WARN) |
| ISR | 1h | **1h** |
| Full-suite stability | green | **1 green / 6 red (hook timeouts)** |

Attempt 2 is a scoped re-verification; attempt 1 above is unchanged. No production code
was written, nothing was committed or pushed.

---

# Verification — attempt 3 (phase 1, cycle 2 of max 3)

**Verifier:** spec-verifier (scoped re-verification — the cycle-2 stability and `AC-006-20` fixes)
**Attempt:** 3, phase 1 (cycle 2 of max 3)
**Branch:** `spec/006-centred-number`
**Date:** 2026-11-06
**Scope:** the two attempt-2 BLOCK classes — browser-suite stability (port allocation,
hook timeout, teardown) and `AC-006-20`'s literal scan — plus the corrected contrast
figures, the inversion guard, and the standard gates.
**Prior attempts:** 1 and 2 above; preserved, not rewritten.

## Attempt 3 verdict

**PASS.** All six gates are green and the suite is stable across five independent
consecutive runs. The cycle-2 fixes are real: the debugging port is OS-allocated, the
hook budget clears the helper's own 60 s deadline, `AC-006-20` now scans every paint
channel in every declaration position (including the first), and `AC-006-26` now sees the
`border`/`outline` shorthands. Two documentation warnings remain (stale figures in the
spec text; a TOCTOU residual in `freePort`), neither a gate.

### Five consecutive full-suite runs

| Run | Start (UTC) | End (UTC) | Exit | Files | Tests |
|---|---|---|---|---|---|
| 1 | 12:17:46 | 12:19:02 | **0** | 112 | 1047 |
| 2 | 12:19:02 | 12:20:19 | **0** | 112 | 1047 |
| 3 | 12:20:19 | 12:21:31 | **0** | 112 | 1047 |
| 4 | 12:21:31 | 12:22:49 | **0** | 112 | 1047 |
| 5 | 12:22:49 | 12:24:06 | **0** | 112 | 1047 |

Leaked `next-server`/Chromium/vitest processes before the series: **0**; after: **0**.
Every run: `Test Files 112 passed (112)`, `Tests 1047 passed (1047)`. No hook timeout, no
failure, no skip. The Coder's "5 consecutive, all exit 0, 112/1047" is **reproduced**
independently.

## Evidence (attempt 3): the port hypothesis

command: code inspection of tests/helpers/chromium.ts, tests/helpers/served-browser.ts, vitest.config.ts
exit: 0 (inspection)
at: 2026-11-06T12:24:10Z

**The fix is in the code, not in the test count:**

```
// tests/helpers/chromium.ts
async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {           // OS-allocated
      const address = server.address();
      const port = typeof address === 'object' && address !== null ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}
export async function launchBrowser(port?: number) {
  const debuggingPort = port ?? (await freePort());
  … spawn(CHROME_PATH, ['--headless=new', `--remote-debugging-port=${debuggingPort}`, …])
}
```

`versionOf` retries **600 × 100 ms = 60 s** (was 100 × 100 ms = 10 s); the page-load wait
is **60 s** (was 20 s); `served-app.ts`'s `waitForServer` is 60 s; `served-browser.ts`'s
`close()` is **`Promise.all(pages.map((page) => page.close()))`** (was a serial loop);
`vitest.config.ts` sets **`hookTimeout: 120_000`** with the reason recorded (2× the
helper's 60 s deadline).

**Consistent with the attempt-2 failure pattern? Yes.** The old default was
`9400 + random(400)`. With 13 browser files booting concurrently the birthday collision
probability is `1 − exp(−13·12/(2·400)) ≈ 17.7 %` (the Coder's ~19 % is the same
arithmetic). On a collision the second Chrome cannot bind the port; `versionOf(port)`
then reads the **first** browser's `/json/version` and the second test attaches to the
first browser. When either file's `browser.close()` runs `child.kill('SIGKILL')`, it kills
the shared browser and the other file's pages die — the hook never settles. That predicts
exactly what attempt 2 saw: **a non-deterministic failing suite set, hook timeouts, zero
assertion failures, and every test body that ran passing** (the surviving file keeps a
working page; the collided file loses its target). A deterministic defect in a specific
test would have failed the same suite every run; it did not.

**Residual (WARN):** `freePort()` closes its probe socket before Chrome binds, so a
TOCTOU window remains in principle. The OS ephemeral range is large and the window is
short; the collision probability is far below the old 400-port birthday. A retry-on-bind
or a child-side port report would remove it entirely, but it is not required for this
gate.

## Evidence (attempt 3): injection proofs

command: scratch copy at /tmp/v006c-scratch, current CSS restored between cases; sha256 of the real CSS 3bde5009425fff1f1aef58f2d38a25afa0d787aa85ef0a1ae968ec4c833f20b9
exit: 1 on every injected case (the tests fail as they must); 0 after restore
at: 2026-11-06T12:25:17Z

| Injected declaration | Test | Result |
|---|---|---|
| `.mutant-outline { outline: 1px solid #ff0000; }` (first/only declaration) | `AC-006-20` | **FAIL** (both assertions) |
| `.mutant-first { border-top-color: #ff0000; border-top-style: solid; border-top-width: 1px; }` (**literal in first-declaration position** — the attempt-2 hole) | `AC-006-20` | **FAIL** — `expected '#ff0000' to match /var(--|^none$|…/` |
| `.mutant-accent-outline { outline: 1px solid var(--accent); }` | `AC-006-26` sheet half | **FAIL** (2 declarations) |
| `.mutant-accent-border { border-color: var(--accent); … }` | `AC-006-26` sheet half | **FAIL** (2 declarations) |
| `.mutant-accent-shorthand { border: 1px solid var(--accent); }` (the attempt-2 shorthand gap) | `AC-006-26` sheet half | **FAIL** (2 declarations) |

Each case was applied to the scratch copy, the test run, and the real CSS restored. The
final scratch file is **byte-identical** to the real one (`cmp` identical; sha256
`3bde5009…` both sides). `AC-006-20`'s non-vacuity guard also passes on the clean sheet
(`paint.length > 50`, includes `border` and `fill`).

## Evidence (attempt 3): corrected contrast figures

command: npx tsx /tmp/v006c-contrast.mts (tests/helpers/colour.ts `contrast` on the declared hexes)
exit: 0
at: 2026-11-06T12:25:20Z

```
CTA text --surface-1 on --ink-1:         light 16.83 / dark 17.01   PASS (>= 7)
ring --accent on --ink-1:                light 1.71  / dark 2.15    PASS (< 3, offset required)
fuse --ink-1 on --ink-3:                 light 3.11  / dark 2.57    PASS (3 / 2.5)
numeral --accent on --surface-1:         light 9.85  / dark 7.89    PASS (>= 4.5)
```

Both corrected figures are confirmed: **16.83 / 17.01** for the CTA pair and
**1.71 / 2.15** for the ring inside the ink fill. They are in `web/styles/globals.css`'s
CTA comment and `spec-006-palette.test.ts`'s `AC-006-36` comment. **The spec text is
still stale** (`10-tasks.md` §4.2 and §Task 9 carry 16.13 / 2.12; `AC-006-palette.md`
line 56 carries 2.12) — a documentation WARN, not a gate, because no assertion quotes
those numbers.

## Evidence (attempt 3): the inversions still fail on the old CSS

command: scratch copy with `.hero__cta { background: var(--accent); color: var(--on-accent) }` and `.fuse__burnt { fill: var(--accent) }` restored
exit: 1 (expected)
at: 2026-11-06T12:25:26Z

```
AC-002-31 "ink block with surface ink"      FAIL  expected … to contain 'background: var(--ink-1)'
AC-002-31 "no rule fills with the accent"   FAIL  expected [ '.hero__cta' ] to deeply equal []
AC-003-22 "burnt is --ink-1 …"              FAIL  expected … to match /\.fuse__burnt … fill: var(--ink-1)/
AC-006-26 "exactly one resting rule …"      FAIL  expected [ …(3) ] to deeply equal [ …(1) ]
AC-006-26 "the paints that carried …"       FAIL  .hero__cta background … not to contain '--accent'
Test Files 3 failed | Tests 5 failed | 3 passed | 41 skipped
```

Restored byte-identically (`sha256 3bde5009…` both sides). Nothing was weakened: the
re-pointed criteria still reject the pre-fix CSS.

## Evidence (attempt 3): gates and ISR

command: npx tsc --noEmit; npm run lint; npm run build; bash .standards/scripts/check-code-principles.sh . --json
exit: 0 for all
at: 2026-11-06T12:25:41Z

```
tsc --noEmit: 0
npm run lint: 0
npm run build: 0
  ✓ Compiled successfully; ✓ Generating static pages (17/17)
  Route (app)                                             Revalidate  Expire
  ┌ ○ /                                                           1h      1y
  │ ├ ● /en                                                       1h      1y
  │ ├ ● /fr                                                       1h      1y
  │ ├ ● /de                                                       1h      1y
  │ └ ● /it                                                       1h      1y
design-principles: 0 FAIL / 213 WARN  (tier auto-detected mvp; scoped -BaseRef main: 0 FAIL / 7 WARN)
```

The seven scoped WARNs are the same advisory naming/null-discipline hints as attempts 1–2;
none is a FAIL. `AC-006-36`/`AC-006-37` and the 37/39/21/20 totals are unchanged and green
in the full suite.

## Attempt 3 findings

- **A3-W1 (WARN, documentation):** the corrected contrast values are in the CSS/test
  comments, but `10-tasks.md` (§4.2, §Task 9 watch item) and `AC-006-palette.md` (line
  56) still state 16.13 and 2.12. A one-line spec-text edit; no assertion depends on the
  quoted numbers.
- **A3-W2 (WARN, residual):** `freePort()`'s close-then-bind window is a TOCTOU residual;
  the collision risk is now far below the old 400-port birthday. Optional hardening:
  retry on bind failure.
- **A3-W3 (WARN, carried from attempt 2):** `10-tasks.md` §4.4 still says `AC-006-11`
  counts "every above-fold element on every channel"; the scenario and test count **text
  leaves**. The scenario is satisfied; the task summary overstates it. No test change
  needed unless the broader claim is intended.

## Attempt 3 totals

| Item | Attempt 1 | Attempt 2 | Attempt 3 |
|---|---|---|---|
| AC-006 scenarios | 35 | 37 | **37** |
| `RETIRED` / `PRESERVED` | 39 / 21 | 39 / 21 | **39 / 21** |
| Re-pointed | 18 | 20 | **20** |
| Traceability (declared) | 359 | 361 | **361** |
| Test files / tests | 112 / 1040 | 112 / 1046 | **112 / 1047** |
| `tsc` / `lint` | 0 / 0 | 0 / 0 | **0 / 0** |
| Design principles | 0 FAIL / 213 WARN | 0 FAIL / 213 WARN | **0 FAIL / 213 WARN** (scoped 0/7) |
| ISR | 1h | 1h | **1h** |
| Full-suite stability | green | 1 green / 6 red | **5 green / 5, 0 leaked** |

Attempt 3 is a scoped re-verification; attempts 1 and 2 above are unchanged. No production
code was written, nothing was committed or pushed. The scratch copy was removed after the
runs; the working tree carries only the Coder's changes.

---

# Verification — attempt 4 (phase 1, cycle 3 of max 3 — the last)

**Verifier:** spec-verifier (scoped re-verification — the aborted-stage-5a delta)
**Attempt:** 4, phase 1 (cycle 3 of max 3)
**Branch:** `spec/006-centred-number`
**Date:** 2026-11-06
**Scope:** the tree the aborted Mutation Runner left behind — a +9-test delta and production
mtimes after attempt 3's PASS. The question is tree certifiability, not a new feature.
**Prior attempts:** 1–3 above; preserved, not rewritten.

## Attempt 4 verdict

**PASS. The tree is certifiable.** The +9 tests are legitimate, non-vacuous additions; no
production file is left in a mutated state; and every gate holds on the current tree.

- `npm test`: **113 files / 1056 tests passed**, exit **0** (the 1047 → 1056 delta is exactly
  the 9 new tests).
- `npx tsc --noEmit`: **0**.
- All nine new tests were mutation-checked from a scratch copy: removing the production
  guard/separator each targets makes the corresponding test fail, then the file is restored
  **byte-identically**. They are not vacuous and not duplicates.
- Every `web/` production change (plus the two `app/` ISR layouts) was read against
  `10-tasks.md`/`15-design.md`; the current text matches the required change. No surviving
  mutation.

## Evidence (attempt 4): the current tree

command: npm test; npx tsc --noEmit
exit: 0 (test 0, tsc 0)
at: 2026-11-06T13:44:35Z

```
Test Files  113 passed (113)
     Tests  1056 passed (1056)
  Duration  65.02s
test_exit=0 tsc_exit=0
```

The 9-test delta is `tests/unit/spec-006-mutation-kills.test.ts` (+4) and the appended
`describe` in `tests/acceptance/site-identity.test.ts` (+5). Every earlier count is
unchanged: 37 AC-006 scenarios, `RETIRED` 39, `PRESERVED` 21, re-pointed 20.

## Evidence (attempt 4): the nine new tests are legitimate

command: scratch copy /tmp/v006d-scratch; each production guard mutated, the new test run, the file restored
exit: 1 for every mutation (the test fails as it must); restore byte-identical every time
at: 2026-11-06T13:45:39Z

| New test | Production mutation | Result |
|---|---|---|
| `AC-006-04`: numeral and unit separated by a space | remove `{' '}` in `NumberStep.tsx` | **FAIL** `'5540días'` vs `'5540 días'` |
| `AC-006-27`: year and state word separated by a space | remove `{' '}` in `PanelHead` | **FAIL** `'2025observado'` |
| `AC-004-16`: empty band list annotates the base band | drop `largest === undefined ? BASE_BAND :` | **FAIL** `TypeError: … reading 'band'` |
| `AC-004-15`: empty year list renders the empty finding | drop `if (!first || !last) return ''` | **FAIL** `TypeError: … reading 'year'` |
| `AC-001-35`: every trailing slash is stripped | `replace(/\/+$/, '')` → `replace(/\/$/, '')` | **FAIL** `…es//` vs `…es` |
| `AC-001-35`: address cap is 254, inclusive | `> 254` → `> 255` | **FAIL** promise resolved instead of rejecting |
| `AC-001-35`: no cookie-setting counter | `COOKIELESS_COUNTER_ENABLED = true` | **FAIL** `true` vs `false` |
| `AC-001-35`: inbox pattern anchored | remove `^` and `$` from `CONTACT_PATTERN` | **FAIL** unanchored address accepted |
| `AC-001-35`: only a bare root collapses | drop `url.search === ''` | **FAIL** query lost |

**Not duplicates.** The shipped `spec-006-one-number` / `spec-006-number-group` / `spec-006-projection-form`
tests render through `textOf`, which replaces tags with a **space** and therefore cannot see a
dropped `{' '}`; the new `bareText` tests remove tags **without** inserting a space. The
existing `spec-004-mutation-kills` tests exercise `annotatedBand` and `findingSentence` on the
**non-empty** fixtures; the new ones target the empty-payload guards those fixtures never
reach. The five `AC-001-35` tests exercise `site.ts` branches the shipped defaults never take.
Each is a survivor-kill for the aborted run, on rendered output, never on a helper that
rebuilds the expectation.

## Evidence (attempt 4): no production file is left mutated

command: git diff main -- web/; read every changed file against 10-tasks.md / 15-design.md
exit: 0 (review)
at: 2026-11-06T13:46:00Z

| File (tracked diff under `web/`) | Current change | Spec | Positive confirmation |
|---|---|---|---|
| `web/brand/generated.ts` | `ground #1a1a18`, `onGround #fbfbfa` | T9 palette | matches the new ink/surface values |
| `web/components/public/NumberStep.tsx` | server-rendered group; `{' '}`; `data-rendered-at`; `measured` guards; elapsed → sentence | T2/T11/T12 | read in full: no `'use client'`, no timer, `{' '}` present, all guards intact |
| `web/components/series/CountdownClock.tsx` | deleted | T12 | file gone |
| `web/components/series/PyramidPlate.tsx` | panel extracted; table/readout/caption retained; `findingSentence` guard; null guard | T10 | read in full: `if (!first \|\| !last) return ''` and `series.availability !== 'computed' … return null` both intact; only the panel moved |
| `web/components/series/PyramidPanel.tsx` (new) | panel, bars, axis, hatch; `{' '}`; `annotatedBand` guard | T10 | read in full: `largest === undefined ? BASE_BAND : largest.band`, `sideLength` clamp, `#projection-hatch` present |
| `web/content/site.ts` | `DEFAULT_SITE_URL` → `https://pensions-system-delta.vercel.app` | T13 | exactly one value changed; no `-projects.vercel.app` |
| `web/series/clock-ticker.ts` | deleted | T12 | file gone |
| `web/series/clock.ts` | `CLOCK_TICK_MS`, `CLOCK_FIELDS`, `ClockField` removed | T12 | only those three exports removed; `readClock` intact |
| `web/styles/globals.css` | links/CTA/fuse ink; centring; tap mins; locale weight; no step ground; one panel hue + hatch | T1/T4/T5/T8/T9/T10 | read the whole diff: every value matches the spec; accent only on the numeral |
| `web/styles/tokens.css` | palette revalued; `--surface-hero` retired; aliases re-pointed | T9 | every hex matches `15-design.md`; no type/space/geometry token changed |
| `app/(public)/(home)/layout.tsx` | `revalidate = 3600` | T12/D17 | present |
| `app/(public)/[locale]/layout.tsx` | `revalidate = 3600` | T12/D17 | present |

The split is a pure move: the old `PyramidPlate.tsx` (at `main`) already carried the
`annotatedBand` empty-list guard, the `findingSentence` empty-years guard and the
`bandByYear` zero fallback; the new panel preserves all three. The only behavioural change
in the split is the projected-series `<pattern>` (Task 10). No production file is mutated.

## Evidence (attempt 4): the canonical clause

command: grep/read web/content/site.ts and the AC-006-34/35 carriers
exit: 0
at: 2026-11-06T13:46:30Z

`DEFAULT_SITE_URL = 'https://pensions-system-delta.vercel.app'` — **no `-projects.vercel.app`
segment**. `AC-006-34`'s test asserts `SITE_URL` and the `site.ts` source both lack the alias,
that the URL is a bare origin, and that `SITE_URL` still overrides it. That clause **is
genuinely exercised** (the suite is green on it).

`AC-006-35`'s *equality against the serving origin* is still inside
`if (process.env.PRODUCTION_URL …)`. `PRODUCTION_URL` is set in no workflow
(`.github/`, `.standards/.github/`), so the live half is **not exercised** by `npm test` or
this repo's CI. Stage 5c must supply it. Recorded as **A4-W2** (carried from attempts 1–2),
not a gate: the committed default and every published URL are correct; the live equality is
a deploy-time check.

## Evidence (attempt 4): prior gates hold on this tree

command: traceability; npm run lint; npm run build; check-code-principles.sh; served-page accent inventory
exit: 0 for all
at: 2026-11-06T13:47:06Z

```
scenario traceability (2-3 digit ids): 361 scenarios, all cited, all citations resolve  (exit 0)
upstream traceability --json: fails []                                                  (exit 0)
npm run lint: 0
design-principles: 0 FAIL / 213 WARN   (scoped -BaseRef main: 0 FAIL / 7 WARN)
npm run build: 0
  Route (app)                                             Revalidate  Expire
  ┌ ○ /                                                           1h      1y
  │ ├ ● /en                                                       1h      1y
  │ ├ ● /fr                                                       1h      1y
  │ ├ ● /de                                                       1h      1y
  │ └ ● /it                                                       1h      1y
accent inventory (served page, es 1440/390, de 1440, en 1440):
  hits 1 each — span.clock__value--days, channel ["color"]
```

The public resting accent paint site is exactly **one** (the numeral). `grep` confirms the
only `var(--accent)` uses in the sheet are `.admin-btn` (admin-only), `.clock__value--days`
(the numeral) and the `--focus` token (a `:focus-visible` state). The attempt-3 acceleration
fixes are unchanged; this run adds no production change to destabilise them.

## Attempt 4 findings (all WARN; none blocks)

- **A4-W1 (WARN, stale comment):** the comment above `a { color: var(--ink-2) }` in
  `globals.css` still says "The primary action keeps its filled accent ground … `--on-accent`
  text". The code is correct (`.hero__cta` is `--ink-1` / `--surface-1`); the comment
  describes the pre-revision-3 state.
- **A4-W2 (WARN, carried):** `AC-006-35`'s live equality needs `PRODUCTION_URL`, which no
  workflow sets; stage 5c must verify it.
- **A4-W3 (WARN, carried):** the corrected contrast figures live in the CSS/test comments;
  `10-tasks.md` (16.13/2.12) and `AC-006-palette.md` line 56 (2.12) still carry the old
  numbers. No assertion quotes them.
- **A4-W4 (WARN, carried):** `10-tasks.md` §4.4 overstates `AC-006-11` ("every element on
  every channel"); the scenario and test count text leaves, which is satisfied.
- **A4-W5 (WARN, carried):** `freePort()`'s close-then-bind TOCTOU remains. Attempt 3's
  5/5 green series stands; the only delta here is nine static tests, and the browser helper
  and `hookTimeout` are unchanged.

## Attempt 4 totals

| Item | Attempt 1 | Attempt 2 | Attempt 3 | Attempt 4 |
|---|---|---|---|---|
| AC-006 scenarios | 35 | 37 | 37 | **37** |
| `RETIRED` / `PRESERVED` | 39 / 21 | 39 / 21 | 39 / 21 | **39 / 21** |
| Re-pointed | 18 | 20 | 20 | **20** |
| Traceability (declared) | 359 | 361 | 361 | **361** |
| Test files / tests | 112 / 1040 | 112 / 1046 | 112 / 1047 | **113 / 1056** |
| `tsc` / `lint` | 0 / 0 | 0 / 0 | 0 / 0 | **0 / 0** |
| Design principles | 0 FAIL / 213 WARN | 0 FAIL / 213 WARN | 0 FAIL / 213 WARN | **0 FAIL / 213 WARN** (scoped 0/7) |
| ISR | 1h | 1h | 1h | **1h** |
| Full-suite stability | green | 1 green / 6 red | 5 green / 5 | **green (1/1; +9 static tests)** |
| Production files mutated | — | — | — | **none** |

Attempt 4 is a scoped re-verification; attempts 1–3 above are unchanged. No production code
was written, nothing was committed or pushed. The scratch copy was removed after the runs.

---

# Phase 2 — post-PR CI (round 0)

**Verifier:** spec-verifier (phase 2 — post-PR CI check, `docs/spec-pipeline/post-pr-loops.md`)
**Attempt:** round 0 of max 3 — phase-2 counter, **independent of phase 1** (phase 1 is exhausted at 3/3; attempts 1–4 above stand)
**PR:** [#18](https://github.com/RexiAI/pensions-system/pull/18) · branch `spec/006-centred-number` · base `main` · **draft** · 17 commits · head `d86ce528daf113d1825fadb56f7205fcf9f609a8`
**Workflow:** `CI` (`.github/workflows/ci.yml` → reusable `ci-nextjs.yml` @ `21046d9`), run **42256625219**, conclusion `success`
**Scope:** CI checks only. No production code, no fix, no commit, no push. `gh` queries throughout.

## Phase 2 round-0 verdict

**PASS.** Every CI check reached a terminal state; none failed. Three jobs ran and passed
(Unit Tests, Lint & Format, Build), two Vercel contexts are `SUCCESS`, and one job is `SKIPPED`
by design (`deploy-on-main: false`, no Dockerfile). The pipeline may proceed to **stage 5c**.

| Check | Workflow | Job / check id | Bucket | State |
|---|---|---|---|---|
| `frontend-ci / Unit Tests` | CI | 128025418475 | **pass** | SUCCESS |
| `frontend-ci / Lint & Format` | CI | 128025418901 | **pass** | SUCCESS |
| `frontend-ci / Build` | CI | 128026061623 | **pass** | SUCCESS |
| `frontend-ci / Docker Build & Push` | CI | 128026679723 | **skipping** | SKIPPED (by design) |
| `Vercel Preview Comments` | — | 128025571388 | **pass** | SUCCESS |
| `Vercel` (deployment context) | — | 7605747526 (deploy) | **pass** | SUCCESS |

`skipping` is a fourth bucket, not `pending` and not `fail`. Pending was polled to zero before
this verdict was written (`poll 1 16:54:26Z pending=1` … `poll 7 16:56:34Z pending=0`). Nothing
was treated as green while pending.

**Nothing is red, so nothing is routed.** No fix goes to `spec-coder` or `spec-refactorer`.

## Evidence: phase 2 CI status query

command: gh pr checks 18 --json name,state,bucket,workflow,link; gh api repos/RexiAI/pensions-system/commits/d86ce528daf113d1825fadb56f7205fcf9f609a8/check-runs; gh run list --branch spec/006-centred-number --workflow "CI" --limit 3 --json databaseId,conclusion,headSha,event
exit: 0 (checks 0, check-runs 0, run list 0)
at: 2026-11-06T16:58:28Z

```
### 1. gh pr checks 18 --json name,state,bucket,workflow,link
[{"bucket":"skipping","link":"https://github.com/RexiAI/pensions-system/actions/runs/42256625219/job/128026679723","name":"frontend-ci / Docker Build & Push","state":"SKIPPED","workflow":"CI"},{"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/42256625219/job/128026061623","name":"frontend-ci / Build","state":"SUCCESS","workflow":"CI"},{"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/42256625219/job/128025418475","name":"frontend-ci / Unit Tests","state":"SUCCESS","workflow":"CI"},{"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/42256625219/job/128025418901","name":"frontend-ci / Lint & Format","state":"SUCCESS","workflow":"CI"},{"bucket":"pass","link":"https://vercel.com/github","name":"Vercel Preview Comments","state":"SUCCESS","workflow":""},{"bucket":"pass","link":"https://vercel.com/danielbueno76-4270s-projects/pensions-system/8Vykw89Yx8xbiNK1XebYvbrmaYYw","name":"Vercel","state":"SUCCESS","workflow":""}]
checks_exit=0

### 2. gh api .../commits/d86ce52.../check-runs
skipped  128026679723  frontend-ci / Docker Build & Push
success  128026061623  frontend-ci / Build
success  128025571388  Vercel Preview Comments
success  128025418901  frontend-ci / Lint & Format
success  128025418475  frontend-ci / Unit Tests
checkruns_exit=0

### 3. gh run list --branch spec/006-centred-number --workflow CI
42256625219 success d86ce52 pull_request
42256573875 cancelled 7e01001 pull_request
runlist_exit=0
```

`42256573875` (head `7e01001`) is `cancelled`, not failed: it was superseded by the push of
`d86ce52` under the workflow's `concurrency: cancel-in-progress`. Cancelled-superseded is not a
finding — the run that counts for this head is `42256625219`.

## Evidence: Unit Tests — totals and every skip accounted for

command: gh run view 42256625219 --log  (Unit Tests job 128025418475); per-file skip tally; guard scan across tests/
exit: 0
at: 2026-11-06T16:58:36Z

```
 Test Files  107 passed | 9 skipped (116)
      Tests  1022 passed | 46 skipped (1068)
   Duration  19.12s (tests 56%, import 32%, transform 7%, environment 4%, worker 1%)

tests/acceptance/spec-006-palette.test.ts            2
tests/acceptance/spec-006-supersessions.test.ts      1
tests/acceptance/no-empty-columns.test.ts            4
tests/acceptance/spec-006-von-restorff.test.ts       4
tests/acceptance/spec-006-canonical-share.test.ts    1
tests/acceptance/served-document.test.ts             6
tests/acceptance/spec-006-number-group.test.ts       1
tests/acceptance/spec-006-static-html.test.ts        1
tests/acceptance/spec-006-projection-form.test.ts    2
tests/acceptance/spec-006-centred-axis.test.ts       3
tests/acceptance/spec-005-step-air-browser.test.ts   3
tests/acceptance/spec-006-fitts.test.ts              3
tests/acceptance/one-screen-per-step.test.ts         3
tests/acceptance/spec-006-subday-legibility.test.ts  2
tests/acceptance/countdown-band-browser.test.ts      4
tests/acceptance/invariants-003.test.ts              1
tests/acceptance/spec-006-box.test.ts                2
tests/acceptance/spec-005-locale-parity.test.ts      1
tests/acceptance/spec-006-type-scale.test.ts         2
SKIPPED_TOTAL=46
```

CI total is **1068 tests**, the same number the local suite runs (orchestrator-reported local
1068 passed). So no test is *missing* from CI — 46 of the same 1068 are environment-gated and
run locally instead. The skip count is larger than the phase-1 local run for exactly the reason
this spec grew browser coverage: 19 files now carry browser or build guards.

## Evidence: every skip is an environment guard, no parked criterion

command: grep -rnE "^\s*(it|test|describe)\.skip\(" tests/ ; guard idiom per skipping file; guard definitions
exit: 1 for the unconditional-skip scan (no matches — none exist); 0 for the guard scan
at: 2026-11-06T16:58:43Z

```
### 5. no unconditional .skip( in tests/ (exit 1 = no match, i.e. none)
unconditional_skip_grep_exit=1

### 5b. guard idiom per skipping file
tests/acceptance/spec-006-palette.test.ts          describe.skipIf(!BROWSER_READY) describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-006-supersessions.test.ts    describe.skipIf(!BROWSER_READY)
tests/acceptance/no-empty-columns.test.ts          describe.skipIf(!READY)
tests/acceptance/spec-006-von-restorff.test.ts     describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-006-canonical-share.test.ts  describe.skipIf(!BROWSER_READY)
tests/acceptance/served-document.test.ts           describe.skipIf(!BUILD_PRESENT)
tests/acceptance/spec-006-number-group.test.ts     describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-006-static-html.test.ts      describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-006-projection-form.test.ts  describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-006-centred-axis.test.ts     describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-005-step-air-browser.test.ts describe.skipIf(!READY)
tests/acceptance/spec-006-fitts.test.ts            describe.skipIf(!BROWSER_READY)
tests/acceptance/one-screen-per-step.test.ts       describe.skipIf(!READY)
tests/acceptance/spec-006-subday-legibility.test.ts describe.skipIf(!BROWSER_READY)
tests/acceptance/countdown-band-browser.test.ts    describe.skipIf(!READY)
tests/acceptance/invariants-003.test.ts            it.skipIf(!BUILD_PRESENT)
tests/acceptance/spec-006-box.test.ts              describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-005-locale-parity.test.ts    describe.skipIf(!BUILD_PRESENT)
tests/acceptance/spec-006-type-scale.test.ts       describe.skipIf(!BROWSER_READY)

### 5c. guard definitions
14:export const BUILD_PRESENT = existsSync('.next/server/app');
15:export const CHROME_PATH = CANDIDATES.find((path): path is string => typeof path === 'string' && existsSync(path));
13:export const BROWSER_READY = BUILD_PRESENT && CHROME_PATH !== undefined;
16:const READY = BUILD_PRESENT && CHROME_PATH !== undefined;
```

Every one of the 46 skips sits inside a `skipIf` keyed on `.next/server/app` existing
(`BUILD_PRESENT`) and/or a Chromium binary being installed (`CHROME_PATH`) — neither of which the
CI `unit-test` job has: the jobs are separate, `Build` does not publish `.next` to `Unit Tests`,
and no browser is installed. There is **no unconditional `.skip(` anywhere in `tests/`**, so no
acceptance criterion was parked to make CI green. The three `BUILD_PRESENT`-only files
(`served-document`, `invariants-003` AC-003-44, `spec-005-locale-parity` AC-005-35) are served-HTML
checks that need a real `next start`; they run locally where the build exists.

## Evidence: Lint & Format and Build really ran

command: gh run view 42256625219 --log  (Lint & Format job 128025418901, Build job 128026061623)
exit: 0
at: 2026-11-06T16:56:40Z

```
> pensions-system@0.0.0 lint
> eslint .

> next build
 ✓ Running next.config.ts took 32ms
  ✓ globalNotFound
✓ Compiled successfully in 4.7s
✓ Generating static pages using 3 workers (17/17) in 809ms
Route (app)                                             Revalidate  Expire
```

`lint` is `eslint .` (the reusable workflow also runs `npm run format:check --if-present`);
`next build` succeeded and type-checks the tree — it produced the ISR route table, so the
`revalidate = 3600` work is present in the compiled output. No `tsc --noEmit` step exists in this
CI (local `tsc` was 0 at phase 1); `next build` is the type gate here.

## Evidence: Docker job skip cause and absent spec gates

command: grep -n "if: github.event_name" .standards/.github/workflows/ci-nextjs.yml; grep -n "deploy-on-main" .github/workflows/ci.yml; gh run view 42256625219 (job list)
exit: 0
at: 2026-11-06T16:58:36Z

```
84:    if: github.event_name == 'push' && github.ref_name == github.event.repository.default_branch && inputs.deploy-on-main
34:      deploy-on-main: false

JOBS
✓ frontend-ci / Unit Tests in 54s (ID 128025418475)
✓ frontend-ci / Lint & Format in 50s (ID 128025418901)
✓ frontend-ci / Build in 1m7s (ID 128026061623)
- frontend-ci / Docker Build & Push in 0s (ID 128026679723)
```

`Docker Build & Push` can only run on a push to the default branch **and** with
`deploy-on-main: true`; this caller sets `false` (no Dockerfile, GHCR_TOKEN unset, deployment is
Vercel via Git integration — commented in `.github/workflows/ci.yml`). On a PR it is unconditionally
skipped. **By design, not a red.**

The run has exactly four jobs. **`check-specs-archived.sh` is absent from CI** — as expected for
this repo (no such job, no such workflow): it cannot be a CI signal here and its absence is not
this branch's defect. **`check-code-principles.sh` exit 141 does not appear** — the script is not
invoked by this CI at all (`self-ci`/standards-side only), and no job failed with 141 in this run.

## Evidence: 5c handoff — the preview belongs to this head

command: gh api "repos/RexiAI/pensions-system/deployments?sha=d86ce52…&per_page=5"; gh api repos/RexiAI/pensions-system/commits/d86ce52…/status
exit: 0
at: 2026-11-06T16:58:58Z

```
7605747526 Preview 2026-11-06T16:54:16Z d86ce528daf113d1825fadb56f7205fcf9f609a8
Vercel success https://vercel.com/danielbueno76-4270s-projects/pensions-system/8Vykw89Yx8xbiNK1XebYvbrmaYYw
```

Deployment `7605747526` is recorded against **`d86ce52`**, the PR head — not a stale branch alias.
Branch alias for 5c: `https://pensions-system-git-spec-00-af5e9e-danielbueno76-4270s-projects.vercel.app`
(Vercel "Ready"). 5c must still match `githubCommitSha == d86ce52` before trusting a 200.

## Phase 2 round-0 findings

No gate failed. Recorded for the Architect, none of which blocks:

- **P2-0-W1 (carried, W-1):** `AC-006-35` is skipped **entirely** in CI — the test lives inside
  `describe.skipIf(!BROWSER_READY)`, and its live half additionally requires `PRODUCTION_URL`,
  which no workflow sets. CI therefore exercises neither half. The committed-origin half runs
  locally (build + Chromium present); the **live serving-origin equality is stage 5c's job**.
  Do **not** route this to the Coder.
- **P2-0-W2 (reconciliation, informational):** phase-1 attempt 4 recorded 113 files / 1056 tests;
  the head now has 116 files / 1068 tests (+3 files, +12 tests, added while phase 1's budget was
  already at 3/3). CI executes all 1068 and they pass, so the delta is covered by this run rather
  than by a fifth local attempt — but no Verifier attempt ever ran against this exact tree locally.
- **P2-0-W3 (upstream, not this branch):** the reusable `ci-nextjs.yml` gates `build` on
  `needs: [unit-test, lint]`, which contradicts `docs/CODING_CONVENTIONS.md §CI Job Orchestration —
  Clean Feedback` (a lint failure would hide the build signal). It is a `.standards/` submodule
  defect, unchanged by this spec; report only.
- **P2-0-W4 (info):** annotations are deprecation notices only — Node.js 20 actions forced onto
  Node 24, and the `ubuntu-latest` → Ubuntu 26 migration notice. Nothing branch-specific.

## Phase 2 round-0 outcome

| Item | Value |
|---|---|
| Checks queried / terminal | 6 / 6 |
| pass / fail / skipping(pending) | **4 / 0 / 1 (Docker, by design)** (+1 Vercel deployment context) |
| Run conclusion | `success` (42256625219) |
| Unit tests | 1022 passed, 46 skipped (1068) — every skip an environment guard |
| Lint & Format / Build | pass / pass |
| Failing check IDs | none |
| Routed owner | none |
| Verdict | **PASS** |
| Next stage | **5c may proceed** (Deploy Verifier) |


## Phase 2 round-0 addendum (write hygiene, same round)

Two tree-state observations, recorded because a downstream stage performs working-tree checks.
Neither is a CI finding and neither is mine to fix:

- **P2-0-W5:** two untracked scratch files sit at the repo root — `live-005-top.png`,
  `live-006box.png` — not in any of the PR's 17 commits. They are verifier-side artifacts from an
  earlier round; the orchestrator/Architect should decide whether they are discarded before
  stage 5d's clean-tree check. Left untouched here.
- **P2-0-W6:** `.standards` is checked out at `5de28c9` while the child's recorded gitlink is
  `6eb2c99` (`git submodule status` → `+`). Pre-existing, unrelated to this spec, and the source of
  the ` M .standards` line in `git status`. Left untouched.

**Telemetry:** `record-gate-run.sh` resolves its repo root to the `.standards` submodule when
invoked by that path, so the first append landed in `.standards/runs.jsonl`. That stray line was
reverted (`git -C .standards checkout -- runs.jsonl`, submodule working tree clean again) and the
record was written once to this repo's `runs.jsonl` with `-f`. Verdict unchanged: `outcome: pass`.
