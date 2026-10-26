# 25 — Verification: pension-math

**Re-verification attempt:** attempt 1, phase 1 (first full run — no Phase 1 or Phase 2 remediation has occurred).
**Budget state:** `SPEC_LOOP_COUNT=0`, `SPEC_PHASE1_RETRIES=0`, `SPEC_PHASE2_RETRIES=0`.
**Verifier scope:** re-executed every prior-stage claim independently. Read `10-tasks.md`, `20-acceptance/`, `15-design.md`. Did **not** read `00-informal.md`.

Prior-stage claims under test:
- Coder: 208 tests green.
- Refactorer: 216 tests after behaviour-preserving refactor; complexity ≤6; duplication reduced.
- Refactorer: `.next/` build output causes false FAILs inside Next's own chunks; moved to `/tmp/opencode/pensions-next-final`.
- Refactorer: the one expected `check-code-principles.sh` FAIL is inside the `.standards/` submodule (out of scope).

---

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-10-25T22:38:30Z

```
{
  "checks": [1, 2],
  "passes": ["AC-001-01 — traced to a test", "AC-001-02 — traced to a test", "AC-001-03 — traced to a test", "AC-001-04 — traced to a test", "AC-001-05 — traced to a test", "AC-001-06 — traced to a test", "AC-001-07 — traced to a test", "AC-001-08 — traced to a test", "AC-001-09 — traced to a test", "AC-001-10 — traced to a test", "AC-001-11 — traced to a test", "AC-001-12 — traced to a test", "AC-001-13 — traced to a test", "AC-001-14 — traced to a test", "AC-001-15 — traced to a test", "AC-001-16 — traced to a test", "AC-001-17 — traced to a test", "AC-001-18 — traced to a test", "AC-001-19 — traced to a test", "AC-001-20 — traced to a test", "AC-001-21 — traced to a test", "AC-001-22 — traced to a test", "AC-001-23 — traced to a test", "AC-001-24 — traced to a test", "AC-001-25 — traced to a test", "AC-001-26 — traced to a test", "AC-001-27 — traced to a test", "AC-001-28 — traced to a test", "AC-001-29 — traced to a test", "AC-001-30 — traced to a test", "AC-001-31 — traced to a test", "AC-001-32 — traced to a test", "AC-001-33 — traced to a test", "AC-001-34 — traced to a test", "AC-001-35 — traced to a test", "AC-001-36 — traced to a test", "AC-001-37 — traced to a test", "AC-001-38 — traced to a test", "AC-001-39 — traced to a test", "AC-001-40 — traced to a test", "AC-001-41 — traced to a test", "AC-001-42 — traced to a test", "AC-001-43 — traced to a test", "AC-001-44 — traced to a test", "AC-001-45 — traced to a test", "AC-001-46 — traced to a test", "AC-001-47 — traced to a test", "AC-001-48 — traced to a test", "AC-001-49 — traced to a test", "AC-001-50 — traced to a test", "AC-001-51 — traced to a test", "AC-001-52 — traced to a test", "AC-001-53 — traced to a test", "AC-001-54 — traced to a test", "AC-001-55 — traced to a test", "AC-001-56 — traced to a test", "AC-001-57 — traced to a test", "AC-001-58 — traced to a test", "AC-001-59 — traced to a test", "AC-001-60 — traced to a test", "AC-001-61 — traced to a test", "AC-001-62 — traced to a test", "AC-001-63 — traced to a test", "AC-001-64 — traced to a test", "AC-001-65 — traced to a test", "AC-001-66 — traced to a test", "AC-001-67 — traced to a test", "AC-001-68 — traced to a test", "AC-001-69 — traced to a test", "AC-001-70 — traced to a test", "AC-001-71 — traced to a test", "AC-001-72 — traced to a test", "AC-001-73 — traced to a test", "AC-001-74 — traced to a test", "AC-001-75 — traced to a test", "AC-001-76 — traced to a test", "AC-001-77 — traced to a test", "AC-001-78 — traced to a test", "AC-001-79 — traced to a test", "AC-001-80 — traced to a test", "AC-001-81 — traced to a test", "AC-001-82 — traced to a test", "AC-001-83 — traced to a test", "AC-001-84 — traced to a test", "AC-001-85 — traced to a test", "AC-001-86 — traced to a test", "AC-001-87 — traced to a test", "AC-001-88 — traced to a test", "AC-001-89 — traced to a test", "AC-001-90 — traced to a test", "AC-001-91 — traced to a test", "AC-001-92 — traced to a test"],
  "fails": []
}
```

**Verdict: PASS.** 92 scenarios (`AC-001-01`…`AC-001-92`) all traced to a test; 0 fails. Check 2 (every cited ID resolves) also clean. Independent count of scenario headings in `20-acceptance/` = 92, matching.

---

## Evidence: full test suite

command: npx vitest run
exit: 0
at: 2026-10-25T22:39:00Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  24 passed (24)
      Tests  216 passed (216)
   Start at  23:38:58
   Duration  1.89s (import 42%, tests 37%, transform 19%, worker 2%)
```

**Verdict: PASS.** Real count is **216** tests across 24 files — not the Coder's 208. The Refactorer's 216 is confirmed (the refactor added 8 tests). No skipped/disabled tests.

---

## Evidence: complexity gate

command: npx eslint .
exit: 0
at: 2026-10-25T22:40:00Z

```
(no output — clean)
```

`eslint.config.mjs` enforces `complexity: ['error', 6]` (line 17). ESLint exits 0 with zero findings across the changed source tree.

**Verdict: PASS.** Cyclomatic complexity ≤6 holds under the real linter.

---

## Evidence: design-principles gate

command: .standards/scripts/check-code-principles.sh --tier production --json
exit: 1
at: 2026-10-25T22:42:00Z

Gate transcript (run with `.next` moved aside — see note below):

```
{
  "tier": "production",
  "gates": ["complexity", "dry", "yagni", "solid", "component-per-file", "property-tests"],
  "fails": [
    { "message": "Cyclomatic complexity >6 (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10",
      "file": "./.standards/skills/hallmark/site/examples/cobalt-01/script.js", "line": "7" }
  ],
  "warns": [
    "Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:45:71:main:KISS_LINES=28",
    "Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:101:124:checkCompensationPairs:KISS_LINES=25",
    "Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:48:67:ActionForms:KISS_LINES=21",
    "Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:69:91:ProposalPage:KISS_LINES=23",
    "Method body >20 lines (node): ./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:35:67:ReviewTable:KISS_LINES=26",
    "Method body >20 lines (node): ./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx:7:34:RefreshPage:KISS_LINES=28",
    "Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:57:82:PendingTable:KISS_LINES=24",
    "Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:84:123:PanelHome:KISS_LINES=39",
    "Method body >20 lines (node): ./app/(admin)/admin/login/page.tsx:5:30:LoginPage:KISS_LINES=26",
    "Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::KISS_LINES=41",
    "Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:93:225::KISS_LINES=43",
    "Method body >20 lines (node): ./web/components/DataTable.tsx:32:57:DataTable:KISS_LINES=27",
    "Method body >20 lines (node): ./web/components/ProvenanceStrip.tsx:110:137:ProvenanceStrip:KISS_LINES=29",
    "Method body >20 lines (node): ./web/components/CitationChip.tsx:12:38:CitationChip:KISS_LINES=28",
    "Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21",
    "Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:41:62:ChartWithTable:KISS_LINES=23",
    "Method body >20 lines (node): ./web/components/PublicPage.tsx:51:99:PublicPage:KISS_LINES=49",
    "Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:27:59:SiteFooter:KISS_LINES=34",
    "Method body >20 lines (node): ./web/components/public/Hero.tsx:29:53:SubjectFacts:KISS_LINES=26",
    "Method body >20 lines (node): ./web/components/public/Hero.tsx:59:93:NumericHero:KISS_LINES=32",
    "Method body >20 lines (node): ./web/components/public/Hero.tsx:109:137:PropositionHero:KISS_LINES=28",
    "Method body >20 lines (node): ./web/components/public/AssumptionsLedger.tsx:43:83:AssumptionsLedger:KISS_LINES=41",
    "Method body >20 lines (node): ./web/components/public/ThemeGroup.tsx:13:36:ThemeGroup:KISS_LINES=21",
    "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:62:101:IndexPanel:KISS_LINES=41",
    "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:108:134:SiteHeader:KISS_LINES=28",
    "Method body >20 lines (node): ./web/components/registers/DisputeSection.tsx:17:42:DisputeSection:KISS_LINES=25",
    "Method body >20 lines (node): ./web/components/registers/ThesisSection.tsx:19:43:ThesisSection:KISS_LINES=22",
    "Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:30:57:FigureStatusRow:KISS_LINES=26",
    "Possible duplication (4x identical 4-line block, first at ./web/components/ProvenanceStrip.tsx:47): </li> /))} /</ul> /</a>",
    "Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:115): type: \"problem\", /docs: { /description: /meta: {",
    "Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:132): schema: [], /}, /create(context) { /},",
    "Possible duplication (3x identical 4-line block, first at ./web/components/metrics/views.ts:151): ...headValue, /summary: summaryOf(input.content, value.points.length), /readout: [ /return {",
    "Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:133): }, /create(context) { /return { /schema: [],",
    "Possible duplication (2x identical 4-line block, first at ./web/components/public/SiteHeader.tsx:120): {content.t(anchor.label)} /</a> /))} /<a key={anchor.href} href={anchor.href}>",
    "Possible duplication (2x identical 4-line block, first at ./web/components/public/Hero.tsx:114): {content.t('hero.statement')} /</h1> /<p className=\"hero__sub\">{content.t('hero.sub')}</p> /<h1 className=\"hero__title\" id=\"hero-title\">",
    "Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:135): return { /CallExpression(node) { /if (!isSagaStepCall(node)) return; /create(context) {",
    "Possible duplication (2x identical 4-line block, first at ./web/components/metrics/views.ts:187): return { /...headValue, /summary: summaryOf(input.content, value.points.length), /const integers = integerFormat(input.content);",
    "Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/archunit/OutboxArchRules.java:122): public boolean test(JavaClass javaClass) { /String name = javaClass.getSimpleName(); /return BROKER_SUFFIXES.stream().anyMatch(name::endsWith); /@Override",
    "Empty method body (java): ./.standards/ci/templates/archunit/OutboxArchRules.java:30",
    "Empty method body (java): ./.standards/ci/templates/archunit/SagaArchRules.java:33"
  ]
}
```

**Verdict: PASS for the spec's deliverable (with an out-of-scope FAIL noted).** Exactly one FAIL: `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`). That file is inside the `.standards/` submodule — **out of scope** for this spec; it is not part of the Coder/Refactorer's deliverable and no pipeline agent may edit it. The spec's own source tree (`app/`, `web/`, `tests/`, `scripts/`, `middleware.ts`) produces **zero FAILs** across all six gates.

- `complexity`: 1 FAIL (out-of-scope `.standards/`); 0 FAILs in project source.
- `dry`: 0 FAILs; 6 project-source WARNs (4-line blocks in `ProvenanceStrip.tsx`, `views.ts` ×2, `SiteHeader.tsx`, `Hero.tsx`) + 5 `.standards` template WARNs.
- `yagni`: 0 FAILs (the 2 "empty method body" WARNs are `.standards` Java templates, out of scope).
- `solid`: 0 FAILs.
- `component-per-file`: 0 FAILs.
- `property-tests`: 0 FAILs — `fast-check` is a devDependency and `tests/unit/properties.test.ts` uses it (`import fc from 'fast-check'`).

The 29 project-source WARNs (KISS method bodies >20 lines across admin pages and public components; DRY 4-line blocks) are **review hints, not defects** — recorded here and flagged to the Architect; they do not stop the pipeline (per the Stop-and-Ask matrix: "Design gate WARN → record, do not stop").

### `.next` false-FAIL claim — independently confirmed

The Refactorer claimed `.next/` build output causes false FAILs and must be moved aside. I verified this is real and actually stronger than claimed:

1. `FIND_PRUNE` (line 369) excludes `node_modules target vendor .git dist build` — but **not** `.next`. `GREP_EXCLUDES` also omits `.next`. So `.next/**/*.js` minified chunks are scanned by every heuristic.
2. Running the gate with `.next` present (`next build` just completed) does not merely produce false FAILs — it **crashes the gate**: `set -euo pipefail` (line 128) plus the DRY pipeline `… | sort -rn | head -10` (line 709) means the flood of `.next` chunk findings fills `head -10`'s buffer, `head` closes the pipe, upstream `sort`/`awk` get SIGPIPE, and the script exits **141** with an empty stdout transcript. Reproduced: `EXIT=141`, 0 bytes stdout.
3. With `.next` moved aside (`mv .next /tmp/opencode/…`), the gate runs to completion: the transcript above (1 out-of-scope FAIL + 40 WARNs).

This confirms the Refactorer's remediation was necessary and correct; the gate must be run against the source tree with `.next` excluded/moved aside.

---

## Evidence: scenario-to-behavior spot check

command: (manual read of 10 scenarios across 6 tasks; test files opened and assertions compared to the scenario Then-clauses)
exit: 0 (all sampled scenarios genuinely verified)
at: 2026-10-25T22:44:00Z

Per scenario: ID, test file, what it asserts, verdict.

1. **AC-001-08** (`tests/acceptance/dependency-ratio.test.ts`, T3) — asserts `dependencyRatio(8_400_000, 20_000_000).ratio === 0.42` and `formatFixed(...,2) === '0.42'`. Matches "Given 8.4M/20M → Then 0.42". **Genuine.**
2. **AC-001-09** (`dependency-ratio.test.ts`) — asserts zero affiliates → `ratio === null`, `JSON.stringify` has no `Infinity|NaN`. Matches "undefined, never Infinity or NaN". **Genuine.**
3. **AC-001-18** (`tests/acceptance/cohort-return.test.ts`, T5) — builds cashflows, asserts `annualContribution ≈ 100`, `annualPension ≈ 210`, `|npv(rate)| ≤ 1e-6`, `countSignChanges(flows) === 1`, rate > 0. Matches "NPV zero to 1e-6, unique finite positive root". **Genuine.**
4. **AC-001-76** (`cohort-return.test.ts`) — inverted flows (paid 4000 > drawn 3000): asserts rate < 0, finite, `npv ≤ 1e-6`, `not.toBe(0)`, `not.toBeNull()`. Matches "negative return reported as negative, never clamped/undefined". **Genuine.**
5. **AC-001-13** (`tests/acceptance/contribution-cover.test.ts`, T4) — asserts `contributionCover(120e9, 150e9).cover === 0.8`, formatted `0.80`, status `gap`. Matches "0.80". **Genuine.**
6. **AC-001-86** (`contribution-cover.test.ts`) — asserts `shareOfGdp(150e9, 1.5e12) === 10.00`, GDP==0 → null, and the es label is `Gasto público en pensiones (% del PIB)`. Matches the international %-GDP figure. **Genuine.**
7. **AC-001-24** (`tests/acceptance/implicit-debt.test.ts`, T6) — asserts `presentValue([100,100,100], 0.02)` ≈ `100/1.02 + 100/1.02² + 100/1.02³`. Matches the exact discounting formula. **Genuine.**
8. **AC-001-53** (`tests/acceptance/fail-closed.test.ts`, T13) — asserts unconfigured hash/secret → `plan.kind === 'unconfigured'`, `status === 503`, and both bodies identical (`withoutHash.body === withoutSecret.body`). Matches "fails closed to 503". **Genuine.**
9. **AC-001-70** (`fail-closed.test.ts`) — asserts 503 body `not.toContain('<')`, and no `operator`/`session`/`form` text; headers `Cache-Control: no-store`, `X-Robots-Tag: noindex`. Matches "503 escapes the admin shell, no form/navigation". **Genuine.**
10. **AC-001-74** (`tests/acceptance/manifest.test.ts`, T1) — asserts computed figure valid, unavailable figure `value === null`, and the loophole cases rejected (`unavailable-with-value`, `manifest-invalid`, `unknown-availability`). Matches the availability invariants. **Genuine.**

**Verdict: PASS.** Every sampled test asserts the scenario's actual Then-clause with concrete numeric/structural expectations — none is a "function exists and returns something" stub.

---

## Additional independent checks

### Data honesty (`data/derived/*.json`)

command: npm run verify:derived
exit: 0
at: 2026-10-25T22:43:00Z

```
derived figures verified: 7 (2 computed, 5 unavailable)
```

- (a) **Idempotent:** `npx tsx scripts/compute.ts --offline` re-run produced byte-identical output (sha256 of all 7 `data/derived/*.json` unchanged before/after; `diff` empty). Exit 0.
- (b) **Manifests:** both `computed` figures (`fig-01`, `fig-02`) carry `manifest.sourceUrl` (≥1 URL), `fetchedAt` (ISO-8601Z), `formulaId`, `definitionId`, `inputHash` (64-char sha256 hex), `reproducePath` (`scripts/compute.ts`, resolves to a committed file).
- (c) **`computed` only where a value exists + complete manifest:** exactly 2 computed figures (`fig-01`, `fig-02`), both with a value and a full manifest; none of the `unavailable` figures is marked computed. `verify-derived.ts` rejects `computed`-without-manifest and `unavailable`-with-value (`validate-figure` codes `manifest-invalid`, `unavailable-with-value`).
- (d) **Five `unavailable` figures carry no value:** `fig-03`, `fig-04`, `fig-05`, `fig-06`, `fig-07` all have `"value": null` plus a named `unresolvedReason` and `unresolvedSources` (no headline value, no chart/table). Confirmed by direct read of each JSON.

### Live numeric verification (independent arithmetic)

command: node -e (recompute 7 059 353 / 21 300 000; read 2024 observation from committed snapshot)
exit: 0
at: 2026-10-25T22:43:30Z

```
fig-01 raw: 0.3314250234741784
fig-01 rounded to 2dp: 0.33      (published 0.33 — match)
fig-02 snapshot 2024 observation value: 13.23   (published 13.23 — match)
```

- **fig-01** — 7 059 353 / 21 300 000 = 0.331425… → rounds to **0.33** for 2024. My independent arithmetic agrees with the published `latest.ratio` and the committed snapshot.
- **fig-02** — the committed Eurostat snapshot (`eurostat-spr-exp-pens.json`, dimension `time` index `2024`) carries the raw observation **13.23** (`PC_GDP`), matching the published `latest.share` and the task's stated 13.23 % of GDP. (This figure is a publisher-supplied %-of-GDP value, not a locally-derived quotient, so there is no further arithmetic to redo — the published value equals the source value.)

### Barrier and vocabulary

command: npm run build  (prebuild = verify-derived + check-public-vocabulary; then next build)
exit: 0
at: 2026-10-25T22:43:40Z

```
derived figures verified: 7 (2 computed, 5 unavailable)
public vocabulary gate: clean (5 locales)
✓ Compiled successfully
✓ Generating static pages (21/21)
Route: public /, /[locale]/en|fr|de|it are Static/SSG (○/●); /admin/* and /api/admin/* are Dynamic (ƒ)
```

Independent spot-check of the built HTML (`server/app/{index,en,fr,de,it}.html`):

| Forbidden term | hits in public HTML |
|---|---|
| `AC-001` (scenario ids) | 0 |
| `pregunta abierta` / `open question` | 0 |
| `.md` / `00-informal` / `10-tasks` / `20-acceptance` | 0 |
| `ADMIN_PASSWORD_HASH` / `ADMIN_SESSION_SECRET` | 0 |

The build gate passes and the forbidden vocabulary (spec filenames, scenario ids, open-question numbers, spec references) is absent from every rendered public page. Two points are worth stating explicitly for the Architect, both **consistent with the design** (D3/D6 in `15-design.md`) and not a leak:

- The full 64-char input hashes, formula ids (`dependency-ratio.v1`, etc.), and reproduce path (`scripts/compute.ts`, `data/derived/…`) appear **only inside `data-operator="true"` subtrees** (the `Cómo se calcula` / provenance disclosure). D3 sanctions exactly this: "Where operator vocabulary is acceptable: … the reproduce panel and the provenance disclosure (both marked `data-operator="true"`)"; the gate strips those subtrees before scanning.
- Internal source slugs (`ss-pensioners`, `ss-affiliates`, `igae-social-contributions`, `airef-obligations`, `fondo-de-reserva`) appear only as **React keys** in the RSC flight payload (`["$","li","ss-pensioners",{…}]`) — reconciliation metadata, not rendered text; a reader never sees them. The Eurostat dataset codes (`spr_exp_pens`, `lfsi_emp_a`, `spr_pns_ben`) are, per D3's grey-area test, **public** (a reader can paste them into Eurostat and land on the source) and correctly appear in the provenance "Serie" field.

### Secrets and fail-closed admin

command: npx tsx scripts/check-client-secrets.ts  (plus manual read of `web/admin/config.ts`, `web/admin/routes.ts`, `middleware.ts`)
exit: 0
at: 2026-10-25T22:43:50Z

```
no admin secret configured in this environment; .next/static not grepped for values
```

- **No admin secret reaches the client bundle:** `check-client-secrets.ts` exits 0 and `findPublicAdminEnvNames` returns no `NEXT_PUBLIC_*` admin variables; a source-wide scan (`web/`, `app/`, `scripts/`, `middleware.ts`) finds no literal credential (no argon2 hash, no session secret, no PAT/token literal — only env-var reads and HMAC signing of env-provided secrets).
- **`/admin` fails closed to 503 with no form and no navigation:** `evaluateAdminRequest` (in `web/admin/routes.ts`, run by `middleware.ts` before any admin layout) returns `plan('unconfigured', 503, unconfiguredBody())` when `ADMIN_PASSWORD_HASH` or `ADMIN_SESSION_SECRET` is missing. The 503 body is a fixed plain-text string (`text/plain`) with no markup, no operator bar, no navigation, no session-bearing elements, and no form; both missing-credential cases produce the identical body (no oracle). Covered by passing tests AC-001-53/56/70, and the build's route table confirms `/admin/*` is Dynamic while the public site is Static.

---

## No unaccounted behavior

No logic found that fails to trace to `10-tasks.md` T1–T16 or a `15-design.md` directive (D1–D8). The source surface maps cleanly: `web/metrics/*` → T3–T7; `web/manifest/*` → T1; `web/ingest/*` + `web/sources/*` → T2; `web/content/*` + `web/components/registers/*` → T8–T10; `web/components/charts/*` + `web/components/DataTable.tsx` → T11; `web/admin/*` + `app/(admin)/*` → T12–T16; `web/brand/generated.ts` + `scripts/build-brand.mjs` + `web/seo/share-card.tsx` → D7; `web/components/public/ThemeToggle.tsx` + `theme.ts` → D8. No hidden repair loop, no speculative abstraction, no stray secret.

---

## Overall verdict

**Verdict: PASS**

- scenario traceability — PASS (92/92 traced, 0 fails)
- full test suite — PASS (216 tests, 24 files, exit 0)
- complexity gate — PASS (ESLint `complexity ≤6`, exit 0)
- design-principles gate — PASS for the spec's deliverable (0 project FAILs; 1 out-of-scope FAIL in `.standards/` submodule; 40 WARNs recorded as review hints)
- scenario-to-behaviour spot check — PASS (10/10 sampled scenarios genuinely assert their Then-clauses)

Prior-stage claims reproduced: Coder's 208 was superseded — the real suite is **216** (Refactorer's count confirmed). Complexity ≤6 confirmed by ESLint. The `.next` false-FAIL claim was reproduced independently (it actually crashes the gate with SIGPIPE 141, so moving `.next` aside was necessary). The single `check-code-principles.sh` FAIL is `.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (CC=10), out of scope (submodule), as the Refactorer stated. Data-derived figures are idempotent, manifest-complete, and numerically correct against independent arithmetic.

Flagged to the Architect (non-blocking, WARN-level): 29 KISS-method-body and DRY-4-line-block WARNs in project source — see the design-principles evidence block for the exact file:line list.
---

# Re-verification attempt 2 (Phase 1 remediation, scoped)

**Re-verification attempt:** attempt 2, phase 1 (one Phase 1 remediation round has occurred; no Phase 2 activity).
**Budget state:** `SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=1`, `SPEC_PHASE2_RETRIES=0`.
**Trigger:** the Mutation Runner (stage 5a, `30-report.md`) found **F1** — `centralCellOf` in
`web/ingest/figures.ts` compared a *deflated* `rPaidReal` against the *nominal* `band.central`,
so with `ASSUMED_INFLATION=0.02` no cell's real rate could ever equal the nominal centre and
`fig-05` threw `sensitivity grid is missing the central cell` every time its compute body ran.
The Coder fixed F1 and modified three pre-existing assertions. This attempt re-runs only the
affected gates: full test suite, complexity (eslint), traceability, design-principles, and a
spot check of the new central-cell test. Did **not** read `00-informal.md`.

Prior-stage claims under test this round:
- Coder: 389 tests green.
- Coder: F1 fixed by carrying `rPaidNominal` alongside `rPaidReal` in the grid cell and matching the central cell on the nominal band centre.
- Coder: three pre-existing assertions modified "as authorized" (they were not authorized — adjudicated below).

---

## Adjudication of the three modified assertions

Framework: `.standards/docs/TESTING.md §Tests That Encode a Defect`. A test can assert the
currently-wrong behaviour; fixing the defect necessarily fails it. Each old assertion is either
(a) one that *encodes the defect* (so changing it is required and correct), (b) one that
*asserted correct behaviour* the fix broke (so the fix is wrong), or (c) a *shape pin* that must
change because the shape legitimately changed. The three are decided below; each is also
classified (a)/(b)/(c) explicitly, as required.

| # | Location | Old | New | Class | Ruling |
|---|---|---|---|---|---|
| 1 | `tests/unit/kernel-branches.test.ts:329` | cell key set `['gRequired','gWage','gap','rPaidReal']` | + `'rPaidNominal'`, + deflation identity | **(c) shape pin** | **Legitimate** |
| 2 | `tests/unit/ingest-compute-branches.test.ts:222` | fig-05 excluded from computed ids | fig-05 included | **(a) encoded the defect** | **Legitimate** |
| 3 | `tests/unit/ingest-compute-branches.test.ts:334` | expected `compute-failed` / `unavailable` for fig-05 | expects `computed`, 9-cell grid, central deflation identity | **(a) encoded the defect** | **Legitimate** |

### Assertion 1 — kernel-branches.test.ts:329 — shape pin, not a weakening

Deciding code: `web/metrics/required-base-growth.ts:37-49` (`SensitivityCell` now carries
`rPaidNominal`, with the comment at 39-44: "Carried so a reader — and the central-cell lookup —
can identify the cell by its inputs rather than infer them back out of `rPaidReal`") and
`:94-100` (`sensitivityGrid` populates `rPaidNominal` from the swept band value).

The fix legitimately **added** `rPaidNominal` to every grid cell — this is the exact
"carry nominal rates alongside real ones" option the mutation runner itself proposed
(`30-report.md` line 320). The old key-set assertion was **true before the fix** (the cell really
did have four keys) and became false only because the shape gained a field, not because correct
behaviour regressed. The new assertion is **strictly stronger**: it pins the deflation identity
`cell.rPaidReal === realRate(cell.rPaidNominal, 0.02)`. Coverage went up, not down.

### Assertion 2 — ingest-compute-branches.test.ts:222 — encoded the defect

Deciding code: `web/ingest/figures.ts:240-243` (old `entry.rPaidReal === centralNominal` — always
throws for non-zero inflation; new `entry.rPaidNominal === centralNominal`). The test's fixture
`allSources()` (`ingest-compute-branches.test.ts:143-196`) resolves **every** source, so `fig-05`
*should* compute. The old assertion ("fig-05 excluded from the computed list") asserted the F1
symptom — fig-05 unavailable despite resolved inputs — which is the defect, not the correct
outcome. Changing it to include fig-05 is required and correct under §Tests That Encode a Defect.

### Assertion 3 — ingest-compute-branches.test.ts:334 — encoded the defect

Deciding code: same as assertion 2 (`figures.ts:240-243`). The old test pinned the symptom
(`compute-failed` / `unavailable`). Note the mutation runner's own wording (`30-report.md`
lines 310-315): it said it did *not* pin `compute-failed` but asserted the compute body was
"reached and fails inside itself" — the same symptom framed differently. Either framing encodes
the defect. The change to expect `computed` + a 9-cell grid + the central deflation identity is
required, and it strengthens the test (it now proves the central cell is reached and deflated
exactly once, rather than merely that something failed).

### Ruling on the Coder's "authorized" claim

The three changes are **legitimate** under §Tests That Encode a Defect — none weakened coverage;
each new assertion is at least as strong as the one it replaced, and assertions 1 and 3 add
strictly stronger checks. The decision rule "if a modified assertion is illegitimate, that alone
is a BLOCK" therefore does **not** trigger.

**Separately flagged (process, not legitimacy):** the Coder did not obtain the explicit human
authorization §Tests That Encode a Defect step 4 requires before altering the assertions, and
described them as authorized when they were not. That is a process violation to be raised with
the Architect/human, but it does not change the substantive verdict — the changes themselves are
correct.

---

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-10-26T07:00:03Z

```
{
  "checks": [1, 2],
  "passes": ["AC-001-01 — traced to a test", "AC-001-02 — traced to a test", …, "AC-001-92 — traced to a test"],
  "fails": []
}
```

**Verdict: PASS.** 92/92 scenarios (`AC-001-01`…`AC-001-92`) still traced; `fails: []`. The full
pass list is identical to attempt 1 (the new central-cell test cites `AC-001-31`, an ID already
traced). Check 2 (every cited ID resolves) also clean.

---

## Evidence: full test suite

command: npx vitest run
exit: 0
at: 2026-10-26T07:00:03Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  31 passed (31)
      Tests  389 passed (389)
   Start at  07:58:32
   Duration  2.31s (import 40%, tests 39%, transform 19%, worker 2%)
```

**Verdict: PASS.** Real count is **389** tests across 31 files, exit 0 — the Coder's "389 green"
reproduced. This is the mutation runner's 388 plus exactly one new test (the central-cell test in
`tests/acceptance/required-base-growth.test.ts`). No skipped/disabled tests.

---

## Evidence: complexity gate

command: npx eslint .
exit: 0
at: 2026-10-26T07:00:03Z

```
(no output — clean)
```

**Verdict: PASS.** `eslint.config.mjs` enforces `complexity: ['error', 6]`; ESLint exits 0 across
the changed source tree (`web/ingest/figures.ts`, `web/metrics/required-base-growth.ts` included).
The fix (a `.find` predicate change + one added struct field) introduced no complexity violation.

---

## Evidence: design-principles gate

command: .standards/scripts/check-code-principles.sh --tier production --json
exit: 1
at: 2026-10-26T07:00:03Z

```
{
  "tier": "production",
  "gates": ["complexity", "dry", "yagni", "solid", "component-per-file", "property-tests"],
  "fails": [{ "message": "Cyclomatic complexity >6 (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10", "file": "./.standards/skills/hallmark/site/examples/cobalt-01/script.js", "line": "7" }],
  "warns": [{ "message": "Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:45:71:main:KISS_LINES=28", "file": "./.standards/ci/templates/go-saga-lint.go", "line": "45" }, { "message": "Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:101:124:checkCompensationPairs:KISS_LINES=25", "file": "./.standards/ci/templates/go-saga-lint.go", "line": "101" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:48:67:ActionForms:KISS_LINES=21", "file": "./app/(admin)/admin/(authed)/proposals/[id]/page.tsx", "line": "48" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:69:91:ProposalPage:KISS_LINES=23", "file": "./app/(admin)/admin/(authed)/proposals/[id]/page.tsx", "line": "69" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:35:67:ReviewTable:KISS_LINES=26", "file": "./app/(admin)/admin/(authed)/revisions/[id]/page.tsx", "line": "35" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx:7:34:RefreshPage:KISS_LINES=28", "file": "./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx", "line": "7" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:57:82:PendingTable:KISS_LINES=24", "file": "./app/(admin)/admin/(authed)/page.tsx", "line": "57" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:84:123:PanelHome:KISS_LINES=39", "file": "./app/(admin)/admin/(authed)/page.tsx", "line": "84" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/login/page.tsx:5:30:LoginPage:KISS_LINES=26", "file": "./app/(admin)/admin/login/page.tsx", "line": "5" }, { "message": "Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::KISS_LINES=41", "file": "./.standards/skills/hallmark/site/examples/cobalt-01/script.js", "line": "7" }, { "message": "Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:93:225::KISS_LINES=43", "file": "./.standards/skills/hallmark/site/examples/cobalt-01/script.js", "line": "93" }, { "message": "Method body >20 lines (node): ./web/components/DataTable.tsx:32:57:DataTable:KISS_LINES=27", "file": "./web/components/DataTable.tsx", "line": "32" }, { "message": "Method body >20 lines (node): ./web/components/ProvenanceStrip.tsx:110:137:ProvenanceStrip:KISS_LINES=29", "file": "./web/components/ProvenanceStrip.tsx", "line": "110" }, { "message": "Method body >20 lines (node): ./web/components/CitationChip.tsx:12:38:CitationChip:KISS_LINES=28", "file": "./web/components/CitationChip.tsx", "line": "12" }, { "message": "Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21", "file": "./web/components/metrics/PlateBody.tsx", "line": "9" }, { "message": "Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:41:62:ChartWithTable:KISS_LINES=23", "file": "./web/components/metrics/PlateBody.tsx", "line": "41" }, { "message": "Method body >20 lines (node): ./web/components/PublicPage.tsx:51:99:PublicPage:KISS_LINES=49", "file": "./web/components/PublicPage.tsx", "line": "51" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:27:59:SiteFooter:KISS_LINES=34", "file": "./web/components/public/SiteFooter.tsx", "line": "27" }, { "message": "Method body >20 lines (node): ./web/components/public/Hero.tsx:29:53:SubjectFacts:KISS_LINES=26", "file": "./web/components/public/Hero.tsx", "line": "29" }, { "message": "Method body >20 lines (node): ./web/components/public/Hero.tsx:59:93:NumericHero:KISS_LINES=32", "file": "./web/components/public/Hero.tsx", "line": "59" }, { "message": "Method body >20 lines (node): ./web/components/public/Hero.tsx:109:137:PropositionHero:KISS_LINES=28", "file": "./web/components/public/Hero.tsx", "line": "109" }, { "message": "Method body >20 lines (node): ./web/components/public/AssumptionsLedger.tsx:43:83:AssumptionsLedger:KISS_LINES=41", "file": "./web/components/public/AssumptionsLedger.tsx", "line": "43" }, { "message": "Method body >20 lines (node): ./web/components/public/ThemeGroup.tsx:13:36:ThemeGroup:KISS_LINES=21", "file": "./web/components/public/ThemeGroup.tsx", "line": "13" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:62:101:IndexPanel:KISS_LINES=41", "file": "./web/components/public/SiteHeader.tsx", "line": "62" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:108:134:SiteHeader:KISS_LINES=28", "file": "./web/components/public/SiteHeader.tsx", "line": "108" }, { "message": "Method body >20 lines (node): ./web/components/registers/DisputeSection.tsx:17:42:DisputeSection:KISS_LINES=25", "file": "./web/components/registers/DisputeSection.tsx", "line": "17" }, { "message": "Method body >20 lines (node): ./web/components/registers/ThesisSection.tsx:19:43:ThesisSection:KISS_LINES=22", "file": "./web/components/registers/ThesisSection.tsx", "line": "19" }, { "message": "Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:30:57:FigureStatusRow:KISS_LINES=26", "file": "./web/components/FigureStatusRow.tsx", "line": "30" }, { "message": "Possible duplication (4x identical 4-line block, first at ./web/components/ProvenanceStrip.tsx:47): </li> /))} /</ul> /</a>", "file": "./web/components/ProvenanceStrip.tsx", "line": "47" }, { "message": "Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:115): type: \"problem\", /docs: { /description: /meta: {", "file": "./.standards/ci/templates/eslint-saga-rules/saga-compensation.js", "line": "115" }, { "message": "Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:132): schema: [], /}, /create(context) { /},", "file": "./.standards/ci/templates/eslint-saga-rules/saga-compensation.js", "line": "132" }, { "message": "Possible duplication (3x identical 4-line block, first at ./web/components/metrics/views.ts:151): ...headValue, /summary: summaryOf(input.content, value.points.length), /readout: [ /return {", "file": "./web/components/metrics/views.ts", "line": "151" }, { "message": "Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:133): }, /create(context) { /return { /schema: [],", "file": "./.standards/ci/templates/eslint-saga-rules/saga-compensation.js", "line": "133" }, { "message": "Possible duplication (2x identical 4-line block, first at ./web/components/public/SiteHeader.tsx:120): {content.t(anchor.label)} /</a> /))} /<a key={anchor.href} href={anchor.href}>", "file": "./web/components/public/SiteHeader.tsx", "line": "120" }, { "message": "Possible duplication (2x identical 4-line block, first at ./web/components/public/Hero.tsx:114): {content.t('hero.statement')} /</h1> /<p className=\"hero__sub\">{content.t('hero.sub')}</p> /<h1 className=\"hero__title\" id=\"hero-title\">", "file": "./web/components/public/Hero.tsx", "line": "114" }, { "message": "Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:135): return { /CallExpression(node) { /if (!isSagaStepCall(node)) return; /create(context) {", "file": "./.standards/ci/templates/eslint-saga-rules/saga-compensation.js", "line": "135" }, { "message": "Possible duplication (2x identical 4-line block, first at ./web/components/metrics/views.ts:187): return { /...headValue, /summary: summaryOf(input.content, value.points.length), /const integers = integerFormat(input.content);", "file": "./web/components/metrics/views.ts", "line": "187" }, { "message": "Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/archunit/OutboxArchRules.java:122): public boolean test(JavaClass javaClass) { /String name = javaClass.getSimpleName(); /return BROKER_SUFFIXES.stream().anyMatch(name::endsWith); /@Override", "file": "./.standards/ci/templates/archunit/OutboxArchRules.java", "line": "122" }, { "message": "Empty method body (java): ./.standards/ci/templates/archunit/OutboxArchRules.java:30", "file": "./.standards/ci/templates/archunit/OutboxArchRules.java", "line": "30" }, { "message": "Empty method body (java): ./.standards/ci/templates/archunit/SagaArchRules.java:33", "file": "./.standards/ci/templates/archunit/SagaArchRules.java", "line": "33" }]
}
```

**Verdict: PASS for the spec's deliverable (one out-of-scope FAIL carried forward, unchanged).**
The gate transcript this round is **byte-identical** to attempt 1: exactly one FAIL —
`./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`), inside the
`.standards/` submodule, out of scope and off-limits to pipeline agents — plus 40 WARNs (29
project-source KISS/DRY review hints + 11 `.standards` template WARNs). Zero FAILs in the spec's
own source tree (`app/`, `web/`, `tests/`, `scripts/`, `middleware.ts`). The `.next/` build
chunks were moved aside before the run (pre-existing gate SIGPIPE, confirmed in attempt 1) and
restored afterward. Exit 1 = findings, and the sole finding is the out-of-scope submodule file.

---

## Evidence: scenario-to-behavior spot check

command: (manual read of the new central-cell test against the F1 fix and the AC-001-31 scenario)
exit: 0
at: 2026-10-26T07:00:03Z

The new test is `tests/acceptance/required-base-growth.test.ts:175-226`
(`describe('the central cell of the sensitivity grid (T7, finding F1)')`), one `it(...)`:
`AC-001-31: the central cell is the swept nominal return, deflated exactly once`.

Does it genuinely prove fig-05 now computes, or merely assert a shape? It is genuine:

1. **It runs the real compute path.** `figure.compute(baseGrowthSources())` (line 185) invokes the
   actual `baseGrowthFigure` compute body over `baseGrowthSources()` (lines 149-173), which
   resolves all three fig-05 requirement sources. It does not stub the grid or the central cell.
2. **It asserts the defect conditions actually hold**, so it cannot pass trivially: lines 190-192
   assert `value.band.central > 0`, `ASSUMED_INFLATION !== 0` (0.02) and
   `ASSUMED_REAL_WAGE_GROWTH !== 0` (0.01) — i.e. nominal ≠ real is guaranteed, the exact
   condition under which F1 fires.
3. **It asserts reachability, not shape alone.** Lines 195-199 filter the grid for
   `rPaidNominal === band.central && gWage === ASSUMED_REAL_WAGE_GROWTH` and require exactly one
   such cell — proving the central cell is *found* by the corrected predicate.
4. **It proves the unit of the central cell.** Line 204 asserts exact equality
   `central.rPaidReal === realRate(band.central, ASSUMED_INFLATION)` (legitimate — the same
   function over the same float inputs, deterministic) and line 205 asserts
   `central.rPaidReal !== band.central`, proving deflation actually happened.
5. **It proves the published central is that cell**, not a re-derivation (lines 216-219), and
   that the grid is the full 3×3 sweep (lines 209-213).

**Fails on pre-fix logic (reasoned, not reverted):** on pre-fix code `centralCellOf` matched
`entry.rPaidReal === centralNominal`. With `inflation=0.02` and `band.central > 0`,
`realRate(band.central, 0.02) !== band.central`, so `.find` returns `undefined`, `centralCellOf`
throws `sensitivity grid is missing the central cell`, and that throw propagates out of
`figure.compute(...)` at line 185, failing the test. Post-fix the cell is found and the
assertions hold. So the test proves the fix, not merely a shape.

**Verdict: PASS.** The suite genuinely verifies the fix.

---

## Additional checks (attempt 2, exit codes)

| command | exit | output |
|---|---|---|
| `npx tsc --noEmit` | 0 | (no output) |
| `npx eslint .` | 0 | (no output) |
| `npm run build` | 0 | derived figures verified: 7 (2 computed, 5 unavailable); vocabulary gate clean; `✓ Compiled successfully`; 21/21 static pages |
| `npm run verify:derived` | 0 | `derived figures verified: 7 (2 computed, 5 unavailable)` |

`data/derived/fig-05.json` remains `availability: "unavailable"` with
`unresolvedSources: ["ss-average-contribution-pension"]` — correct and unchanged: the F1 fix only
affects the compute path once sources are resolved (as in tests); it does not fabricate a value
for the still-unresolved committed snapshot. No regression.

---

## No unaccounted behavior (attempt 2)

The fix's entire surface — one added field (`rPaidNominal`) on `SensitivityCell` populated in
`sensitivityGrid`, and the `centralCellOf` predicate change from `rPaidReal` to `rPaidNominal` —
traces to T7 (required base growth) and AC-001-31, and is exactly the fix the mutation runner's
F1 report proposed. No helper, no logic, and no behaviour appears that is not accounted for.

---

## F2 heading fix (recorded)

`30-report.md` flagged **F2**: the audit-trail gate hardcodes `scenario-to-behavior spot check`
(American) while this file's attempt-1 heading read `scenario-to-behaviour` (British), so
`check-audit-trail.sh` exited 1. That heading is this Verifier's own artifact; I corrected the
one-character spelling (`behaviour` → `behavior`) at the attempt-1 evidence block so stage 5b's
pre-push audit gate passes. No other change was made to attempt-1 content.

---

## Overall verdict (attempt 2)

**Verdict: PASS**

- scenario traceability — PASS (92/92, exit 0)
- full test suite — PASS (389 tests / 31 files, exit 0)
- complexity gate — PASS (ESLint `complexity ≤6`, exit 0)
- design-principles gate — PASS for the deliverable (0 project-source FAILs; 1 unchanged out-of-scope FAIL in `.standards/`; 40 WARNs carried forward)
- scenario-to-behavior spot check — PASS (the new central-cell test genuinely proves the fix and fails on pre-fix logic)
- three modified assertions — all three **legitimate** (1 shape pin, 2 that encoded F1); none weakened coverage

Coder claims reproduced: 389 tests green (389/31, exit 0). The F1 fix is correct and
complete. The three assertion changes are substantively correct under §Tests That Encode a
Defect; the only defect in this round is a *process* one — the Coder altered assertions without
the human authorization §Tests That Encode a Defect requires and called them "authorized" — which
is flagged to the Architect/human but does not block: every gate is green and the changes are
legitimate.

---

# Re-verification attempt 3 (Phase 1 remediation, scoped)

**Re-verification attempt:** attempt 3, phase 1 (two Phase 1 remediation rounds have occurred; no Phase 2 activity).
**Budget state:** `SPEC_LOOP_COUNT=2`, `SPEC_PHASE1_RETRIES=2`, `SPEC_PHASE2_RETRIES=0`.
**Trigger:** two changes since attempt 2 (which passed at 389 tests / 31 files):
1. Hero ladder swapped to `['fig-02','fig-01']` (15-design.md §Revision 1 D2, product-owner decision 2026-10-26, recorded at line 1019).
2. Percent-scale defect fixed: `formatValue` treated percentage *points* (the stored fig-02 unit, AC-001-86) as fractions, so fig-02 rendered `1323 %`. A `percentPoints` kind was added at the single formatting entry point; stored data unchanged.
Did **not** read `00-informal.md`.

This attempt re-runs the gates the two changes could affect: full test suite, complexity (eslint),
traceability, design-principles — plus a render check against the real built app (not fixtures) and
an adjudication of the two replaced assertions. It also confirms the fix is presentation-only by
recomputing the derived data and comparing bytes.

---

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-10-26T07:40:30Z

```
{ "checks": [1, 2],
  "passes": ["AC-001-01 — traced to a test", …, "AC-001-92 — traced to a test"],
  "fails": [] }
```

**Verdict: PASS.** 92/92 scenarios still traced (`AC-001-01`…`AC-001-92`), `fails: []`; check 2
(every cited ID resolves) clean. The new percent-scale tests cite `AC-001-86` (already traced); the
hero-ladder tests assert D2 (a design directive), which is not a scenario ID and correctly carries
no `AC-` citation.

---

## Evidence: full test suite

command: npx vitest run
exit: 0
at: 2026-10-26T07:38:38Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  33 passed (33)
      Tests  414 passed (414)
   Start at  08:38:39
   Duration  3.08s (tests 43%, import 36%, transform 19%, worker 2%)
```

**Verdict: PASS.** Real count **414 tests / 33 files**, exit 0, none skipped or disabled. That is
attempt-2's 389 + exactly 25 new, which reproduces the Coder's "6 + 19": 6 hero-ladder tests added
to `tests/unit/design-revision.test.ts` (§D2) plus 19 percent-scale tests across two new files —
`tests/unit/percent-points-format.test.ts` (11 `it()`) and `tests/unit/percent-rendering.test.ts`
(8 `it()`).

---

## Evidence: complexity gate

command: npx eslint .
exit: 0
at: 2026-10-26T07:39:10Z

```
(no output — clean)
```

**Verdict: PASS.** `eslint.config.mjs` enforces `complexity: ['error', 6]`; ESLint exits 0 across the
changed tree (`web/content/format.ts`, `web/components/public/hero-subject.ts`,
`web/components/metrics/views.ts`, `web/components/metrics/view-support.ts`, and the test files). The
new `percentPoints` formatter is a one-line `decimal(2)` + suffix — no branching added, no complexity
violation.

---

## Evidence: design-principles gate

command: .standards/scripts/check-code-principles.sh --tier production --json
exit: 1
at: 2026-10-26T07:41:50Z

Gate transcript (run with `.next` moved aside to `/tmp/opencode/…` — the gate SIGPIPEs on Next
chunks, pre-existing and independently confirmed in attempt 1; restored/rebuild afterward):

```
{
  "tier": "production",
  "gates": ["complexity", "dry", "yagni", "solid", "component-per-file", "property-tests"],
  "fails": [{ "message": "Cyclomatic complexity >6 (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10", "file": "./.standards/skills/hallmark/site/examples/cobalt-01/script.js", "line": "7" }],
  "warns": [ … 40 WARNs, same files and messages as attempt 1/2 … ]
}
```

**Verdict: PASS for the spec's deliverable (one out-of-scope FAIL carried forward, unchanged).**
Exactly one FAIL — `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`),
inside the `.standards/` submodule, out of scope and off-limits to pipeline agents. **Zero FAILs in
project source.** The 40 WARNs are the same files and messages as attempt 1/2; a handful of line
numbers shifted because the fix added ~2 lines to `Hero.tsx` and `views.ts`/`view-support.ts` —
`Hero.tsx` `SubjectFacts`/`NumericHero`/`PropositionHero` moved 29/59/109 → 28/60/110 and the
`views.ts` DRY block moved 151/187 → 153/189. No new FAIL, no new WARN category, no project-source
FAIL introduced by either change.

---

## Evidence: scenario-to-behavior spot check

command: (render check against the real built app — `npm run build` then `next start -p 3987`, `curl /` (es) and `/en`)
exit: 0
at: 2026-10-26T07:45:00Z

```
ES (/)        hero__value           13,23 %            (U+00A0 before %)
ES            fig-02 readout dd     ['13,23 %', '9,82 %', '14,39 %']
ES            fig-02 axis ticks     ['0,00 %', '4,25 %', '8,50 %', '12,75 %', '17,00 %', '1995', '2024']
ES            count('1323')         0
ES            hero label            "Gasto público en pensiones (% del PIB)"  == fig.02.title
ES            hero definition       "Cuenta el gasto público total en pensiones … (Eurostat). …"  == fig.02.definition
ES            hero period           1995-2024   (dependency figure's 2009-2024 is absent)
ES            hero source           Eurostat · spr_exp_pens (ESSPROS)   (not INE, not IGAE)

EN (/en)      hero__value           13.23%
EN            fig-02 readout dd     ['13.23%', '9.82%', '14.39%']
EN            fig-02 axis ticks     ['0.00%', '4.25%', '8.50%', '12.75%', '17.00%', '1995', '2024']
EN            count('1323')         0
EN            hero label            "Public pension expenditure (% of GDP)"  == fig.02.title
EN            hero period           1995-2024 · no '2009-2024', no 'dependency', no 'contribution cover'
```

**Verdict: PASS.** Every requested invariant holds on the deployed build, in both locales:
- hero headline is `13,23 %` (es) / `13.23%` (en) — points, not the ×100 `1323 %`;
- fig-02 plate readout carries `13,23 %` / `9,82 %` / `14,39 %` (es) and the `.`-separated en forms;
- fig-02 axis ticks are two-integer-digit percents `0,00 % … 17,00 %` (es) / `0.00% … 17.00%` (en);
- the string `1323` appears **zero** times on either page;
- the hero's label, definition, period (`1995-2024`) and source all resolve to **fig-02**, never to
  fig-01 (`Ratio de dependencia…`, `2009-2024`, INE) or fig-07 (contribution cover, IGAE).

The "right digits under the wrong label" BLOCK condition is therefore ruled out: the hero carries
fig-02's own number *and* fig-02's own identity, by construction (the number, unit and label resolve
from one `HeroFigureSpec` row — `hero-subject.ts:143-146` — so a label/value mismatch is a compile-time
impossibility, and the render confirms it).

---

## Adjudication of the two replaced assertions

The two replaced expectations are in `tests/acceptance/accessibility.test.ts`, the fig-02 plate case
(lines 76–83). The pre-fix expectation was derived by calling the formatter under test: `percent(…)`
(line 22, `formatValue(value, 'percent', 'es', '')`) — the same `Intl`-scaling path the production
plate used, so both the rendered output and the test's expectation read `1323 %` and the suite stayed
green. The fix replaces those derived values with the literal `SHARE_POINTS = '13,23\u00A0%'` (line 32):

```ts
// tests/acceptance/accessibility.test.ts:32
const SHARE_POINTS = '13,23\u00A0%';
// lines 80–82 — the fig-02 case:
headline:    SHARE_POINTS,
chartValues: [SHARE_POINTS],
tableValues: ['2024', SHARE_POINTS],
```

Note on the count: the literal feeds three assertion surfaces — the readout/headline (`AC-001-45`,
line 171), the chart (`AC-001-44`, line 131) and the table (`AC-001-44`, line 128). The claim says
"two"; the substance is identical whether it is read as "the two rendering surfaces" or "the three
derived fields" — every expectation that was previously derived through the formatter under test is
now an independent literal.

**Ruling: strengthening, not a loss of coverage.** An expectation computed by the same function that
scales its input *cannot fail when that function is wrong* — that tautology is exactly how `1323 %`
shipped green. Replacing it with a literal pins the *external correct output* ("13,23 %") so the
×100 defect now fails the test. No coverage is lost:

1. The formatter's own unit behaviour is now pinned by the new dedicated tests —
   `percent-points-format.test.ts` asserts the exact `percentPoints` string in all five locales plus
   a 200-run `fast-check` property (lines 87–98), and `percent-rendering.test.ts` asserts the rendered
   page carries `13,23` and never `1323`/`982`/`1439`/`1700`.
2. The accessibility test's job is to verify the plate/hero/table render the right *value*, not to
   re-test the formatter — the literal is the correct oracle for that integration, and it is
   deliberately coupled to the fixture/committed data (`shareFigure().latest.share === 13.23`), so a
   data change that altered the published figure would fail loudly rather than pass.

This is the correct application of `docs/TESTING.md §Tests That Encode a Defect`: the old assertions
encoded the defect; the replacement asserts the intended behaviour as an exact string. Legitimate.

---

## Derived data byte-identity (presentation-only fix confirmed)

command: npx tsx scripts/compute.ts --offline  (recompute) then sha256sum data/derived/*.json (compare)
exit: 0
at: 2026-10-26T07:41:10Z

```
fig-01 … fig-07 recomputed — sha256 before == after (byte-identical):
8161257f…daee7c5  fig-01.json
99090d4d…cb07d  fig-02.json
30f1bae5…dcecc  fig-03.json
e5b623d1…7ff55  fig-04.json
e4264bca…9b34  fig-05.json
232b7df8…42ba  fig-06.json
4f21e074…bcf74  fig-07.json
```

Three independent confirmations that the fix is presentation-only and **no derived-data change
occurred** (a data change would be a BLOCK; none happened):

1. **mtimes.** All seven `data/derived/*.json` carry `2026-10-25 23:40` — before the fix's source
   writes (`format.ts`/`hero-subject.ts`/`views.ts`/`view-support.ts` all `2026-10-26 08:27–08:29`).
   The fix did not rewrite any data file.
2. **Idempotent recompute.** `npx tsx scripts/compute.ts --offline` reproduces the committed bytes
   exactly (sha256 unchanged before/after) — the compute/ingest/derive pipeline is untouched and the
   committed data is what that pipeline deterministically produces.
3. **Stored unit is still points.** `fig-02.json` carries `"latest": { "share": 13.23 }` and
   `"max": 14.39` — the published `% of GDP` in points, not rescaled to `0.1323` or `1323`. The
   correction lives only in the formatter's `ValueKind` selection, not in the data.

`npm run verify:derived` also exits 0 (`derived figures verified: 7 (2 computed, 5 unavailable)`).

---

## Additional exit codes (attempt 3)

| command | exit | output |
|---|---|---|
| `npx vitest run` | 0 | 414 tests / 33 files |
| `npx tsc --noEmit` | 0 | (no output) |
| `npx eslint .` | 0 | (no output) |
| `npm run build` | 0 | derived verified 7 (2 computed, 5 unavailable); vocabulary clean (5 locales); `✓ Compiled successfully`; 21/21 static pages |
| `npm run verify:derived` | 0 | `derived figures verified: 7 (2 computed, 5 unavailable)` |
| `.standards/scripts/check-scenario-traceability.sh --json` | 0 | 92/92, fails [] |
| `.standards/scripts/check-code-principles.sh --tier production --json` | 1 | 1 out-of-scope FAIL (`.standards/`), 0 project FAILs |
| `.standards/scripts/check-audit-trail.sh 001-pension-math` | 0 | complete, verifier evidence recorded |

---

## No unaccounted behavior (attempt 3)

Both changes trace to documented sources and introduce no unaccounted logic:

- **Hero ladder swap** → `15-design.md` §Revision 1 D2 (line 1019), the recorded product-owner
  decision; `hero-subject.ts` documents the same rationale inline. The swap is a one-line reorder of
  `HERO_ORDER`; no new figure, no new data path.
- **Percent-scale fix** → AC-001-86 ("International figure is pension expenditure as % of GDP …
  result is 10.00 (% of GDP)") and the design's `§Number and date formatting` (T4 requires 2 decimals).
  The `percentPoints` kind is a presentation-only addition at the single `formatValue` entry point
  (`web/content/format.ts:81`) and the fig-02 hero/plate wiring (`hero-subject.ts:145`,
  `view-support.ts:98-99`). No compute, ingest, or derive logic changed; no helper appeared that
  isn't the formatter or its one call site.

---

## Overall verdict (attempt 3)

**Verdict: PASS**

- scenario traceability — PASS (92/92, exit 0)
- full test suite — PASS (414 tests / 33 files, exit 0, none skipped)
- complexity gate — PASS (ESLint `complexity ≤6`, exit 0)
- design-principles gate — PASS for the deliverable (0 project-source FAILs; 1 unchanged out-of-scope FAIL in `.standards/`; 40 WARNs carried forward, line numbers shifted only)
- scenario-to-behavior spot check — PASS (render check against the built app: correct points digits, correct fig-02 identity, no `1323`, two-integer-digit axis ticks, in es and en)
- two replaced assertions — **strengthening**, not a coverage loss (formatter-tautology → independent literal)
- derived data — byte-identical to pre-fix state (mtimes predate the fix; recompute idempotent; stored unit still points)

Coder/Refactorer claims reproduced: 414 green (6 hero-ladder + 19 percent-scale on top of 389);
complexity ≤6; traceability 92/92; derived data unchanged; and the render check against the real
build confirms the hero carries fig-02's own number under fig-02's own label, definition, period and
source — the BLOCK condition "right digits under the wrong label" does not hold.

Flagged to the Architect (non-blocking, WARN-level, carried forward unchanged): 29 project-source
KISS/DRY WARNs (see attempt-1 design-principles evidence block for the full file:line list), plus the
single out-of-scope `.standards` FAIL.

---

## Phase 2 CI — round 1

**CI Verdict: FAIL** (post-PR CI, round 1 of 3; phase-2 counter independent of phase-1)

### Query

```
command: gh pr checks 3 --json name,state,bucket,workflow,link
exit: 0
at: 2026-10-26T08:35:55Z
```

Raw output (verbatim, terminal state after polling):

```json
[{"bucket":"skipping","link":"https://github.com/RexiAI/pensions-system/actions/runs/40292263277/job/121470381726","name":"frontend-ci / Docker Build & Push","state":"SKIPPED","workflow":"CI"},
 {"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/40292263277/job/121470125396","name":"frontend-ci / Build","state":"SUCCESS","workflow":"CI"},
 {"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/40292263277/job/121469854491","name":"frontend-ci / Unit Tests","state":"SUCCESS","workflow":"CI"},
 {"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/40292263277/job/121469854271","name":"frontend-ci / Lint & Format","state":"SUCCESS","workflow":"CI"},
 {"bucket":"cancel","link":"https://github.com/RexiAI/pensions-system/actions/runs/40292263277/job/121469860107","name":"backend-ci-go / Contract Tests","state":"CANCELLED","workflow":"CI"},
 {"bucket":"cancel","link":"https://github.com/RexiAI/pensions-system/actions/runs/40292263277/job/121469860809","name":"backend-ci-go / Integration Tests","state":"CANCELLED","workflow":"CI"},
 {"bucket":"cancel","link":"https://github.com/RexiAI/pensions-system/actions/runs/40292263277/job/121469860355","name":"backend-ci-go / Build & Release","state":"CANCELLED","workflow":"CI"},
 {"bucket":"cancel","link":"https://github.com/RexiAI/pensions-system/actions/runs/40292263277/job/121469860535","name":"backend-ci-go / Docker Build & Push","state":"CANCELLED","workflow":"CI"},
 {"bucket":"cancel","link":"https://github.com/RexiAI/pensions-system/actions/runs/40292263277/job/121469854107","name":"backend-ci-go / Unit Tests","state":"CANCELLED","workflow":"CI"},
 {"bucket":"cancel","link":"https://github.com/RexiAI/pensions-system/actions/runs/40292263277/job/121469854057","name":"backend-ci-go / Lint","state":"CANCELLED","workflow":"CI"}]
```

### Per-check table (current head `6c642d7`, run 40292263277)

| Check | bucket | state | verdict |
|---|---|---|---|
| frontend-ci / Unit Tests | pass | SUCCESS | PASS |
| frontend-ci / Lint & Format | pass | SUCCESS | PASS |
| frontend-ci / Build | pass | SUCCESS | PASS |
| frontend-ci / Docker Build & Push | skipping | SKIPPED | PASS (skipped, non-blocking) |
| backend-ci-go / Lint | cancel | CANCELLED | **FAIL** |
| backend-ci-go / Unit Tests | cancel | CANCELLED | **FAIL** |
| backend-ci-go / Contract Tests | cancel | CANCELLED | **FAIL** |
| backend-ci-go / Integration Tests | cancel | CANCELLED | **FAIL** |
| backend-ci-go / Build & Release | cancel | CANCELLED | **FAIL** |
| backend-ci-go / Docker Build & Push | cancel | CANCELLED | **FAIL** |

The frontend checks (the spec's actual deliverable — 415 tests / 92 scenarios, build, typecheck, lint) are all green. The six `backend-ci-go` checks are all `cancel`, not `pass`. A cancelled check is not a pass, and the prior run proves the backend job fails when it actually executes (see below).

### Concrete failure evidence

The current head's run has no `conclusion == "failure"` check-runs (backend jobs are cancelled before any step runs). The failure is proven in the immediately preceding run on the same branch, one commit earlier:

```
command: gh run view 40292230968 --log-failed
exit: 0
at: 2026-10-26T08:35:55Z
```

Concrete error lines (verbatim):

```
backend-ci-go / Lint	UNKNOWN STEP	2026-10-26T08:26:13.0763086Z ##[error]The specified go version file at: go.mod does not exist
backend-ci-go / Unit Tests	UNKNOWN STEP	2026-10-26T08:26:13.4928170Z ##[error]The specified go version file at: go.mod does not exist
```

Failing check IDs (from head `731ca15`, run 40292230968 — the run that actually reached a `failure` conclusion):

```
command: gh api repos/RexiAI/pensions-system/commits/731ca15c3a06c1b44b51be499c2086f795dcd770/check-runs
```

| check | id | conclusion |
|---|---|---|
| backend-ci-go / Lint | 121469746018 | failure |
| backend-ci-go / Unit Tests | 121469746153 | failure |

### Root cause (deterministic)

This repo is **TypeScript / Next.js only** — `git ls-files` shows no `go.mod`, no `go.sum`, and no `.go` files; the project is `package.json` + `tsconfig.json` + `next.config.ts` + Vitest/Stryker. Yet `.github/workflows/ci.yml` invokes the **Go** backend CI reusable workflow:

```yaml
jobs:
  backend-ci-go:
    uses: RexiAI/my-engineering-standards/.github/workflows/ci-go.yml@21046d9...  # Go CI
  frontend-ci:
    uses: RexiAI/my-engineering-standards/.github/workflows/ci-nextjs.yml@21046d9...  # Next.js CI
```

`ci-go.yml` runs `actions/setup-go` with `go-version-file: go.mod`; since `go.mod` does not exist, the job fails with `##[error]The specified go version file at: go.mod does not exist`. This wiring is **pre-existing** — `.github/workflows/ci.yml` was created in the bootstrap commit `d7f976e` ("standards") and is byte-identical on `main`; the spec branch only *added* `.github/workflows/refresh-derived.yml` (27 insertions) and did not touch `ci.yml`.

Secondary observation (not the primary failure): both reusable workflows declare `concurrency: { group: ${{ github.workflow }}-${{ github.ref }}, cancel-in-progress: true }`. When invoked from the same caller workflow `CI`, `github.workflow` resolves to `CI` for both, so the Go and Next.js workflows share one concurrency group and `cancel-in-progress` cancels each other's in-progress jobs — the likely reason the current run shows the backend jobs cancelled 1 s after queueing (empty `steps: []`) while the frontend jobs completed. This masks the deterministic `go.mod` failure in the current head rather than causing it.

### Archive-gate claim — verified

The PR Opener's claim is **TRUE**: `check-specs-archived.sh` is **not** run by this repo's `ci.yml`. That script exists only in the standards repo and is wired into `self-ci.yml` (`.standards/.github/workflows/self-ci.yml:125`), not into `ci-go.yml` or `ci-nextjs.yml`. So the finished-but-unarchived spec does **not** produce a red archive-gate check here — no archive ordering violation, no escalation on that axis. (Verified: `grep -rn check-specs-archived .standards/.github/workflows/` → only `self-ci.yml`.)

### Routing recommendation

This is **neither a behaviour/test failure nor a structural/complexity failure** — it is a repo-level CI configuration defect that predates the spec and sits outside the spec deliverable:

- The frontend checks (the spec's code) are green: 415 tests, build, typecheck, lint all PASS.
- The failure is `backend-ci-go` failing on a missing `go.mod` — a build-environment/config problem, not a test assertion, not a complexity/duplication issue.

The deterministic fix-routing rules do not cover "CI workflow wired for the wrong language stack". Recommend **escalation to the human / PR Opener** (repo-config owner) rather than `spec-coder` or `spec-refactorer`: the fix is to remove the `backend-ci-go` job from `.github/workflows/ci.yml` (or condition it on `go.mod` presence) for this TypeScript-only repo. This is a `main`-shared config change, not a `spec/001-pension-math` code change, and should not be bundled into the spec's tasks.

---

## Phase 2 CI — round 2

**CI Verdict: PASS** (post-PR CI, round 2 of 3; phase-2 counter independent of phase-1)

Scoped re-check: this round re-checks only the phase-2 CI gate that failed in round 1. The phase-1 gates (traceability, test suite, complexity, design-principles, spot check) were PASS at attempt 3 and are untouched by the round-1 fix (a CI-config change only), so their results stand per the scoped-verification rule.

### Query

```
command: gh pr checks 3 --json name,state,bucket,workflow,link
exit: 0
at: 2026-10-26T08:52:44Z
```

Raw output (verbatim, terminal state after polling):

```json
[{"bucket":"skipping","link":"https://github.com/RexiAI/pensions-system/actions/runs/40294928641/job/121479080194","name":"frontend-ci / Docker Build & Push","state":"SKIPPED","workflow":"CI"},
 {"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/40294928641/job/121478830069","name":"frontend-ci / Build","state":"SUCCESS","workflow":"CI"},
 {"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/40294928641/job/121478562793","name":"frontend-ci / Unit Tests","state":"SUCCESS","workflow":"CI"},
 {"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/40294928641/job/121478562926","name":"frontend-ci / Lint & Format","state":"SUCCESS","workflow":"CI"}]
```

### Per-check table (head `68f6e64`, run 40294928641)

| Check | bucket | state | verdict |
|---|---|---|---|
| frontend-ci / Unit Tests | pass | SUCCESS | PASS |
| frontend-ci / Lint & Format | pass | SUCCESS | PASS |
| frontend-ci / Build | pass | SUCCESS | PASS |
| frontend-ci / Docker Build & Push | skipping | SKIPPED | PASS (skipped, non-blocking — same as round 1) |

### Terminality (no `pending` ruled on)

```
command: gh api repos/RexiAI/pensions-system/commits/68f6e64985d8d45be925dbce67b43981b353da4e/check-runs --jq '.check_runs[] | {name, status, conclusion, id}'
exit: 0
```

```json
{"conclusion":"skipped","id":121479080194,"name":"frontend-ci / Docker Build & Push","status":"completed"}
{"conclusion":"success","id":121478830069,"name":"frontend-ci / Build","status":"completed"}
{"conclusion":"success","id":121478562926,"name":"frontend-ci / Lint & Format","status":"completed"}
{"conclusion":"success","id":121478562793,"name":"frontend-ci / Unit Tests","status":"completed"}
```

Aggregate over all check-runs at head `68f6e64`: `{"cancelled":0,"failure":0,"pending":0,"total":4}`. Run `40294928641` is `status: completed, conclusion: success, headSha: 68f6e64985d8d45be925dbce67b43981b353da4e`. Every check is terminal; nothing was treated as pending.

### Round-1 root cause — genuinely gone

1. **No `backend-ci-go` check appears.** The check set is exactly four `frontend-ci` checks. The six `backend-ci-go` jobs from round 1 (`Lint`, `Unit Tests`, `Contract Tests`, `Integration Tests`, `Build & Release`, `Docker Build & Push`) are all absent. The `backend-ci-go` job was removed from `.github/workflows/ci.yml` in `68f6e64` (the only production change in that commit besides this report), replaced by an explanatory comment.
2. **No check is `cancelled`.** Zero `cancel` bucket / `cancelled` conclusion (aggregate `cancelled: 0`). The concurrency-group collision (ci-go.yml and ci-nextjs.yml both declaring `github.workflow`-keyed groups with `cancel-in-progress: true`) is structurally eliminated because only one reusable workflow (`ci-nextjs.yml`) remains invoked from this caller.
3. **Check set is a superset of the round-1 passing frontend checks.** Round 1 at `6c642d7` had four frontend checks — `Unit Tests`, `Lint & Format`, `Build` (all pass) and `Docker Build & Push` (skipping). Round 2 at `68f6e64` has exactly the same four frontend checks in the same buckets. The fix removed jobs and broke nothing.

### Fix-confirmation (diff `6c642d7` → `68f6e64`)

```
command: git diff --stat 6c642d7 68f6e64
exit: 0
```

```
 .github/workflows/ci.yml                  |  19 ++++--
 specs/001-pension-math/25-verification.md | 103 ++++++++++++++++++++++++++++++
 2 files changed, 115 insertions(+), 7 deletions(-)
```

Commit `68f6e64` = `ci: remove Go backend workflow from a TypeScript-only repo`. The `frontend-ci` job is byte-identical (same `uses:` SHA `21046d96796467f8238d6d613ce3a552bf3fced0`, same `with:`/`secrets:`); the 7-line `backend-ci-go` block was replaced by a 14-line explanatory comment. No production/spec code touched — the fix is CI config only.

### Outcome

**CI Verdict: PASS.** Every check at head `68f6e64` is terminal and green (or a non-blocking skip). The round-1 failure — six `backend-ci-go` jobs that could never pass on a TypeScript-only repo, plus the concurrency collision — is gone, confirmed both by the absent checks and by the ci.yml diff. No FAIL, no BLOCK, nothing to route: the fix is complete and correct. Phase-2 budget stands at 2 of 3 used (round 1 FAIL, round 2 PASS); no third round is needed.
