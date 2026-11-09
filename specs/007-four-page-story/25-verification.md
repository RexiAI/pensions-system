# 25-verification.md — spec 007 four-page story

- **Attempt:** 1, phase 1 (first full run; `SPEC_LOOP_COUNT=0`, `SPEC_PHASE1_RETRIES=0`, `SPEC_PHASE2_RETRIES=0`)
- **Branch:** `spec/007-four-page-story` (HEAD `95bf0f6`; base ref `main` = `1ced4c4`)
- **Verification window:** 2026-11-09T08:57:43Z → 2026-11-09T09:07:10Z (~567 s)
- **Verdict: FAIL** — the design-principles gate ran and produced 5 FAILs. This is a pipeline stop,
  not a tooling failure (PASS/BLOCK shorthand: **BLOCK**). No other gate failed.

## Summary

| # | Check | Verdict | Exit |
|---|---|---|---|
| 1 | Scenario traceability | **PASS** | 0 |
| 2 | Full test suite (post-build; 129 files / 1136 tests) | **PASS** | 0 |
| 3 | Complexity gate (`npm run lint`, ESLint `complexity`) | **PASS** | 0 |
| 3.5 | Design-principles gate (`check-code-principles.sh`) | **FAIL** — 5 FAIL / 20 WARN | 1 |
| 4 | Scenario-to-behaviour spot check (AC-007-14/15/18/19) | **PASS** | n/a |
| 5 | No unaccounted behaviour | findings recorded, not a stop | n/a |
| — | Build gates (`prebuild`, `build`, `sitemap:check`) | **PASS** | 0 |
| — | Design laws (ADR 0019) | **PASS** | n/a |

Failing gate ID: `design-principles`. Every command executed; no BLOCK-class tooling failure
(missing script, missing jq/grep, unreadable tree) occurred.

## Script-edit review (Task 11 / Task 12 scope)

The worktree changes four gate scripts. Each edit is the scope adaptation the affected task
authorises, and none weakens a gate or exempts a region that must still be checked:

| Script | Edit | Authorisation | Weakening? |
|---|---|---|---|
| `scripts/check-scenario-traceability-3digit.ts` | `SUPERSEDED_SCENARIOS` gains exactly `AC-004-04`, `-25`, `-28`, `-32`, `-37` | Task 12 / AC-007-27 | **No.** Additive deny-list; replacements are recorded in the `10-tasks.md` table, `docs/changes/007-four-page-story.md`, and the `AC-007-27` test. No test cites a superseded ID (`grep` → none). |
| `scripts/check-plain-language.ts` | renders `pageKind: 'historia'`; `topRegionOf` returns `''` for a page with no `data-top-step` | Task 11 / AC-007-25/26 | **No.** The Historia region (main → story strip) is unchanged; non-story precision pages are out of top-region scope by the task. The gate still fails on a banned term (AC-007-26 test; `prebuild` exercises it). |
| `scripts/check-public-vocabulary.ts` | renders all four page kinds and concatenates them | Task 11's split (vocabulary still scans every public page) | **Strengthened.** Previously one page; now all four. `stripOperatorSubtrees` is retained. |
| `scripts/check-sitemap.ts` | per-entry alternate set resolved from the entry's own page kind; `publishedPaths` = 4 kinds × 5 locales | Task 9 / AC-007-19/20 | **Strengthened.** Per-page alternates replace one global set; exact membership and emitted-bytes checks are retained. Gate prints 20 routes / 6 alternates and agrees with the emitted XML. |

## Build gates (executed, not read)

- `npm run prebuild` → exit 0: derived 7 figures / 3 series, content scope clean, public
  vocabulary clean, 389 scenarios all cited, plain-language clean in 5 locales.
- `npm run build` → exit 0. Route table lists the 20 public routes as static (`○` / `●`):
  `/`, `/en`, `/fr`, `/de`, `/it`, and `cifras|metodo|debate` under each. `.next/server/app`
  holds 22 HTML documents = 20 public + `_not-found` + `_global-error`.
- `npm run sitemap:check` → exit 0: `20 routes, 6 alternates each`, emitted
  `.next/server/app/sitemap.xml.body` and `robots.txt.body` agree.
- Independent read of the emitted sitemap: 20 `<loc>` elements; each `<url>` carries exactly the
  six `xhtml:link` alternates for its own page kind. The `/cifras` block's alternates are
  `/cifras`, `/en/cifras`, … `/it/cifras`, `x-default → /cifras` — never the home URL.
- Independent read of emitted HTML: one `<h1>` per page; home title
  `Sistema de pensiones: la promesa que no se sostiene · 2042 · pensiones · España`; kicker
  `<p class="hero__kicker">Sistema de pensiones: esquema de reparto</p>` immediately before the
  `<h1>` and present only on Historia; `/cifras` canonical, `og:url` and footer `<code>` all
  `https://pensions-system-delta.vercel.app/cifras`.

## Design laws (ADR 0019)

`15-design.md` contains `## Design Laws` (line 75). The table has 16 rows, each with law, where it
applies, a concrete consequence, and a "How a reviewer checks it" method — no law is cited without
a checkable consequence. The ADR core set is fully applied: Fitts's (Tasks 6, 7), Hick's (1, 6),
Miller's (2–5), Jakob's (6), Doherty (6, 7), Tesler's (7), Gestalt proximity/common region
(2–5, 7) and Prägnanz (2, 8). The remaining laws are either applied where the surface invokes them
(Von Restorff, Serial Position, Peak-End, Goal-Gradient) or listed as judged inapplicable with a
reason (Parkinson, Flow, Zeigarnik, Aesthetic-Usability, Pareto/Occam, Choice Overload, Serial
Position on the plate list, Fitts's on non-interactive text). Three deliberate violations each
carry a reason and a compensating control (eyebrow count, premium palette ban, hero-stack
discipline). No design-law defect.

## No unaccounted behaviour

Every new component, route, metadata path, pager, token and CSS rule traces to Tasks 1–9; the key
maps, locale parity and page/title strings trace to Task 10; the four script edits trace to Tasks
11–12. Findings that do not trace to a Task 1–12 requirement:

1. **Out-of-scope commits on the branch.** `95bf0f6` ("contribution-cover: resolve the IGSS series
   and publish fig-07") and `04273aa` ("gate national figures to the country that owns their
   sources") predate this spec's work and are not authorised by any of the 12 tasks. They flip
   `data/derived/fig-07.json` from `unavailable` to `computed` (223 lines), rewrite both
   `data/snapshots/igae-*.json` to IGSS/FEDEA sources, and change `web/ingest/figures.ts`,
   `web/sources/types.ts` and several tests. The PR will carry them. Recorded, not fixed — the
   operator should confirm they belong in this PR or split them / cover them with a follow-up spec.
   (AC-007-08's "no behaviour change" is about the rendering path, which still holds.)
2. **Submodule pointer moved.** `.standards` `6eb2c99 → 5de28c9`; the submodule work tree itself is
   clean. No Task 1–12 authorises the bump; recorded as out of scope.
3. **Untracked screenshots at the repo root:** `live-005-top.png`, `live-006box.png`. Not part of
   any task or deliverable; must not be committed. (`specs/`, the new route directories, the new
   components and `docs/changes/007-four-page-story.md` are untracked as expected at this stage.)
4. **Pre-existing enforcement gap (review hint).** `check-scenario-traceability-3digit.ts` does not
   mechanically reject a *citation* of a superseded ID (only a missing citation). AC-007-28's test
   enforces the "must not be cited" half, and a manual grep finds no citation, so the criterion
   holds today; the script's docstring overstates what it checks. Not introduced by this spec.
5. **AC-007-11 wording.** "The locale switcher and theme toggle still function without
   JavaScript" describes the existing JS theme control, as `15-design.md` §Task 6 records; the test
   asserts render, not toggle. This was surfaced for the human gate and is not newly introduced —
   recorded, not resolved here.

`docs/changes/007-four-page-story.md` (untracked) reproduces both disposition tables, including all
five superseded IDs with their replacements. Watch item for stage 5d: `archive-spec.sh` regenerates
that file and has overwritten appended evidence before (spec 004 OOS-5) — not this gate's call.

## Verdict and remediation

**FAIL.** The design-principles script is the authority and it exits 1. The five FAILs are
KISS/`Method body >20 lines` findings, all in files touched by the diff, so the script classifies
them as diff-introduced (`-BaseRef main` semantics), not pre-existing debt:

- `web/ingest/figures.ts:342:366:compute:KISS_LINES=26`
- `web/components/public/SiteFooter.tsx:29:63:SiteFooter:KISS_LINES=36`
- `web/components/public/SiteHeader.tsx:72:105:IndexPanel:KISS_LINES=35`
- `web/components/public/SiteHeader.tsx:116:136:SiteHeader:KISS_LINES=22`
- `web/components/FigureStatusRow.tsx:37:65:FigureStatusRow:KISS_LINES=27`

Route to the **Refactorer** (structural): extract functions/sub-components until each body is ≤20
lines; fix the code, never the threshold. The re-trigger is **attempt 2, phase 1**, scoped to
`bash .standards/scripts/check-code-principles.sh -BaseRef main` (optionally `--gates complexity`),
per AC-007-02 — the five other checks are not re-run. Phase-1 budget: 1 of 3 attempts consumed by
this verdict; no escalation yet. The 20 WARNs are review hints for the Architect, not stops.

## Evidence: scenario traceability

command: npx tsx scripts/check-scenario-traceability-3digit.ts && bash .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-11-09T08:57:43Z

scenario traceability (2-3 digit ids): 389 scenarios, all cited, all citations resolve

--- .standards/scripts/check-scenario-traceability.sh --json (2026-11-09T08:57:49Z) ---
{
  "checks": [1, 2],
  "passes": ["AC-007-01 — traced to a test", "AC-007-02 — traced to a test", "AC-007-03 — traced to a test", "AC-007-04 — traced to a test", "AC-007-05 — traced to a test", "AC-007-06 — traced to a test", "AC-007-07 — traced to a test", "AC-007-08 — traced to a test", "AC-007-09 — traced to a test", "AC-007-10 — traced to a test", "AC-007-11 — traced to a test", "AC-007-12 — traced to a test", "AC-007-13 — traced to a test", "AC-007-14 — traced to a test", "AC-007-15 — traced to a test", "AC-007-16 — traced to a test", "AC-007-17 — traced to a test", "AC-007-18 — traced to a test", "AC-007-19 — traced to a test", "AC-007-20 — traced to a test", "AC-007-21 — traced to a test", "AC-007-22 — traced to a test", "AC-007-23 — traced to a test", "AC-007-24 — traced to a test", "AC-007-25 — traced to a test", "AC-007-26 — traced to a test", "AC-007-27 — traced to a test", "AC-007-28 — traced to a test"],
  "fails": []
}

--- manual checks ---
$ grep -rho 'AC-007-[0-9][0-9]' specs/007-four-page-story/20-acceptance | sort -u | wc -l
28
$ grep -rn 'AC-004-\(04\|25\|28\|32\|37\)\b' tests/
none
$ grep -l '## AC-004-04' docs/changes/
docs/changes/004-plain-countdown.md
(and the same file for AC-004-25, AC-004-28, AC-004-32, AC-004-37)

## Evidence: full test suite

command: npx vitest run
exit: 0
at: 2026-11-09T09:03:01Z

[post-fresh-build run C: 129 files / 1136 tests]

 Test Files  129 passed (129)
      Tests  1136 passed (1136)
   Start at  10:03:01
   Duration  43.25s (tests 91%, import 7%, transform 1%, environment 1%)

    Isolate  129 workers spawned · ~218ms startup each (spawn + environment, per file)
             at least ~2.34s faster with isolate: false — reuses workers across files instead of one per file

[post-fresh-build run D]

 Test Files  129 passed (129)
      Tests  1136 passed (1136)
   Start at  10:03:47
   Duration  43.16s (tests 91%, import 7%, transform 1%, environment 1%)

    Isolate  129 workers spawned · ~217ms startup each (spawn + environment, per file)
             at least ~2.33s faster with isolate: false — reuses workers across files instead of one per file

[npx vitest run tests/acceptance (2026-11-09T09:04:31Z): 91 files / 637 tests]

 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  91 passed (91)
      Tests  637 passed (637)
   Start at  10:04:31
   Duration  43.01s (tests 93%, import 5%, transform 1%)

[isolation: npx vitest run tests/acceptance/no-empty-columns.test.ts (2026-11-09T09:00:07Z)]

 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  10:00:07
   Duration  18.01s (tests 98%, import 1%, transform 1%)

[isolation: npx vitest run tests/acceptance/countdown-band-browser.test.ts (2026-11-09T09:00:26Z)]

 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  10:00:26
   Duration  13.80s (tests 100%)

--- skip/disable guard ---
$ grep -rnE '\b(it|test|describe)\.(skip|todo|fails|only)\b|xit\(|xdescribe\(' tests/
no skipped/todo/only tests
Vitest reports no "skipped" line: every test that runs is counted. Browser suites executed
(no-empty-columns 7 tests, countdown-band-browser 4 tests) with `.next` and Chromium present.

Flake classification: the Reorderer-reported first-run `AC-004-55` failure and the earlier
`countdown-band-browser` failure are **load-dependent browser flakes**, not skipped/disabled tests.
Both files start a real served app plus Chromium in `beforeAll`; both pass in isolation and in all
four subsequent full-suite runs (two before and two after a fresh `npm run build`). No skipIf
branch was taken in any of those runs.

## Evidence: complexity gate

command: npm run lint
exit: 0
at: 2026-11-09T09:02:40Z


> pensions-system@0.0.0 lint
> eslint .

Note: ESLint (cyclomatic complexity ≤6) is clean. The KISS line-count findings belong to the
design-principles script and are recorded verbatim in the next block; they are not ESLint findings.

## Evidence: design-principles gate

command: bash .standards/scripts/check-code-principles.sh -BaseRef main
exit: 1
at: 2026-11-09T09:01:35Z

Checking design principles in: . (tier: mvp)

PASS Complexity/KISS (java): no violations found
FAIL Method body >20 lines (node): ./web/ingest/figures.ts:342:366:compute:KISS_LINES=26
WARN Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23
FAIL Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:29:63:SiteFooter:KISS_LINES=36
FAIL Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:72:105:IndexPanel:KISS_LINES=35
FAIL Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:116:136:SiteHeader:KISS_LINES=22
FAIL Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:37:65:FigureStatusRow:KISS_LINES=27

--- DRY ---
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:1): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:2): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:3): import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /export const dynamic = 'force-static'; /import { renderPublicPage } from '../../../../web/components/render-public-page';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:4): import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /export function generateMetadata(): Metadata { /import { renderPublicPage } from '../../../../web/components/render-public-page';

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
WARN SRP: possible god file (node) — ./web/content/keys.ts: 444 lines, 0 methods (split by responsibility)
PASS SOLID-OCP (java): no large type-dispatch chains
PASS SOLID-OCP (go): no large type-dispatch chains
PASS SOLID-OCP (node): no large type-dispatch chains
PASS SOLID-LSP (java): no heavy instanceof dispatch
PASS SOLID-LSP (node): no heavy instanceof dispatch
PASS SOLID-ISP (java): no fat interfaces
PASS SOLID-ISP (node): no fat interfaces
PASS SOLID-DIP (java): no domain→infrastructure imports
PASS SOLID-DIP (go): no domain→infrastructure imports
PASS SOLID-DIP (node): no domain→infrastructure imports
PASS SOLID-DIP (python): no domain→infrastructure imports
PASS SOLID-DIP (rust): no domain→infrastructure imports

--- Component-per-file ---
PASS Component-per-file: no violations

--- Property tests ---
Property tests: skipped (project tier is mvp — production+ required)

--- Comments ---
WARN Comments: commented-out code (./scripts/check-sitemap.ts:20)

--- Naming ---
WARN Naming: noise word in type name (PublicPageData) (./web/components/PublicPage.tsx:19)
WARN Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
WARN Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:310)

--- Null discipline ---
WARN Null-discipline: return null (./scripts/check-sitemap.ts:177)
WARN Null-discipline: return null (./web/ingest/run-compute.ts:287)
WARN Null-discipline: return null (./web/seo/share-card.tsx:108)
WARN Null-discipline: return null (./web/components/public-page-props.ts:54)
WARN Null-discipline: return null (./web/components/public-page-props.ts:57)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:37)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:50)
WARN Null-discipline: return null (./web/components/public/NumberStep.tsx:92)

---------------------------------------------
✘ Design-principles check: 5 FAIL(s), 20 WARN(s).
  Reference: docs/CODING_CONVENTIONS.md §Design Principles, docs/ARCHITECTURE.md, docs/TESTING.md

--- tier production (2026-11-09T09:01:58Z) ---
Checking design principles in: . (tier: production)

PASS Complexity/KISS (java): no violations found
FAIL Method body >20 lines (node): ./web/ingest/figures.ts:342:366:compute:KISS_LINES=26
WARN Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23
FAIL Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:29:63:SiteFooter:KISS_LINES=36
FAIL Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:72:105:IndexPanel:KISS_LINES=35
FAIL Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:116:136:SiteHeader:KISS_LINES=22
FAIL Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:37:65:FigureStatusRow:KISS_LINES=27

--- DRY ---
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:1): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:2): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:3): import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /export const dynamic = 'force-static'; /import { renderPublicPage } from '../../../../web/components/render-public-page';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:4): import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /export function generateMetadata(): Metadata { /import { renderPublicPage } from '../../../../web/components/render-public-page';

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
WARN SRP: possible god file (node) — ./web/content/keys.ts: 444 lines, 0 methods (split by responsibility)
PASS SOLID-OCP (java): no large type-dispatch chains
PASS SOLID-OCP (go): no large type-dispatch chains
PASS SOLID-OCP (node): no large type-dispatch chains
PASS SOLID-LSP (java): no heavy instanceof dispatch
PASS SOLID-LSP (node): no heavy instanceof dispatch
PASS SOLID-ISP (java): no fat interfaces
PASS SOLID-ISP (node): no fat interfaces
PASS SOLID-DIP (java): no domain→infrastructure imports
PASS SOLID-DIP (go): no domain→infrastructure imports
PASS SOLID-DIP (node): no domain→infrastructure imports
PASS SOLID-DIP (python): no domain→infrastructure imports
PASS SOLID-DIP (rust): no domain→infrastructure imports

--- Component-per-file ---
PASS Component-per-file: no violations

--- Property tests ---
PASS Property tests (java): jqwik/@Property in use
PASS Property tests (go): testing/quick in use
PASS Property tests (node): fast-check in use

--- Comments ---
WARN Comments: commented-out code (./scripts/check-sitemap.ts:20)

--- Naming ---
WARN Naming: noise word in type name (PublicPageData) (./web/components/PublicPage.tsx:19)
WARN Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
WARN Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:310)

--- Null discipline ---
WARN Null-discipline: return null (./scripts/check-sitemap.ts:177)
WARN Null-discipline: return null (./web/ingest/run-compute.ts:287)
WARN Null-discipline: return null (./web/seo/share-card.tsx:108)
WARN Null-discipline: return null (./web/components/public-page-props.ts:54)
WARN Null-discipline: return null (./web/components/public-page-props.ts:57)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:37)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:50)
WARN Null-discipline: return null (./web/components/public/NumberStep.tsx:92)

---------------------------------------------
✘ Design-principles check: 5 FAIL(s), 20 WARN(s).
  Reference: docs/CODING_CONVENTIONS.md §Design Principles, docs/ARCHITECTURE.md, docs/TESTING.md

--- --json transcript (2026-11-09T09:02:40Z) ---
{
  "tier": "mvp",
  "gates": ["complexity", "dry", "yagni", "solid", "component-per-file", "property-tests", "comments", "naming", "null-discipline"],
  "fails": [{ "message": "Method body >20 lines (node): ./web/ingest/figures.ts:342:366:compute:KISS_LINES=26", "file": "./web/ingest/figures.ts", "line": "342" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:29:63:SiteFooter:KISS_LINES=36", "file": "./web/components/public/SiteFooter.tsx", "line": "29" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:72:105:IndexPanel:KISS_LINES=35", "file": "./web/components/public/SiteHeader.tsx", "line": "72" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:116:136:SiteHeader:KISS_LINES=22", "file": "./web/components/public/SiteHeader.tsx", "line": "116" }, { "message": "Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:37:65:FigureStatusRow:KISS_LINES=27", "file": "./web/components/FigureStatusRow.tsx", "line": "37" }],
  "warns": [{ "message": "Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23", "file": "./web/seo/share-card.tsx", "line": "41" }, { "message": "Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "10" }, { "message": "Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "9" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:1): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /import type { Metadata } from 'next';", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "1" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:2): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /import type { Metadata } from 'next';", "file": "./app/(public)/(home)/cifras/page.tsx", "line": "2" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:3): import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /export const dynamic = 'force-static'; /import { renderPublicPage } from '../../../../web/components/render-public-page';", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "3" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:4): import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /export function generateMetadata(): Metadata { /import { renderPublicPage } from '../../../../web/components/render-public-page';", "file": "./app/(public)/(home)/cifras/page.tsx", "line": "4" }, { "message": "SRP: possible god file (node) — ./web/content/keys.ts: 444 lines, 0 methods (split by responsibility)", "file": "./web/content/keys.ts", "line": "" }, { "message": "Comments: commented-out code (./scripts/check-sitemap.ts:20)", "file": "./scripts/check-sitemap.ts", "line": "20" }, { "message": "Naming: noise word in type name (PublicPageData) (./web/components/PublicPage.tsx:19)", "file": "./web/components/PublicPage.tsx", "line": "19" }, { "message": "Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)", "file": "./web/components/public/NumberStep.tsx", "line": "37" }, { "message": "Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:310)", "file": "./web/ingest/run-compute.ts", "line": "310" }, { "message": "Null-discipline: return null (./scripts/check-sitemap.ts:177)", "file": "./scripts/check-sitemap.ts", "line": "177" }, { "message": "Null-discipline: return null (./web/ingest/run-compute.ts:287)", "file": "./web/ingest/run-compute.ts", "line": "287" }, { "message": "Null-discipline: return null (./web/seo/share-card.tsx:108)", "file": "./web/seo/share-card.tsx", "line": "108" }, { "message": "Null-discipline: return null (./web/components/public-page-props.ts:54)", "file": "./web/components/public-page-props.ts", "line": "54" }, { "message": "Null-discipline: return null (./web/components/public-page-props.ts:57)", "file": "./web/components/public-page-props.ts", "line": "57" }, { "message": "Null-discipline: return null (./web/components/public/MethodRegion.tsx:37)", "file": "./web/components/public/MethodRegion.tsx", "line": "37" }, { "message": "Null-discipline: return null (./web/components/public/MethodRegion.tsx:50)", "file": "./web/components/public/MethodRegion.tsx", "line": "50" }, { "message": "Null-discipline: return null (./web/components/public/NumberStep.tsx:92)", "file": "./web/components/public/NumberStep.tsx", "line": "92" }]
}

## Evidence: scenario-to-behavior spot check

command: python3 - (reads tests/acceptance/AC-007-08-title-kicker.test.ts, tests/acceptance/AC-007-09-seo.test.ts and the emitted .next HTML; prints assertions and artifacts)
exit: 0
at: 2026-11-09T09:06:49Z

== test assertions: AC-007-14/15 ==
AC-007-14 -> it('AC-007-14: title and og:title start with the promise and end with the country', () => { for (const locale of LOCALES) { const promise = PROMISE[locale].replace('{year}', String(YEAR)); const country = content(locale).country.name; const meta = pageMetadata(locale); expect(meta.title, locale).toContain(promise); expect(meta.title.endsWith(` · ${country}`), locale).toBe(true); const resolved = metadataFor(locale); expect(String(resolved.title), locale).toBe(meta.title); expect(String((resolved.openGraph as { title?: string }).title), locale).toBe(meta.ogTitle); } });
AC-007-15 -> it('AC-007-15: the kicker is the locale’s exact string, above the h1 and not a heading', () => { for (const locale of LOCALES) { const html = historiaPage(locale); expect(html, locale).toContain(`<p class="hero__kicker">${KICKER[locale]}</p>`); const kicker = html.indexOf(`<p class="hero__kicker">${KICKER[locale]}</p>`); expect(kicker, locale).toBeLessThan(html.indexOf('<h1')); const kickerElement = html.slice(kicker, html.indexOf('</p>', kicker)); expect(kickerElement, locale).not.toContain('<h1'); expect(kickerElement, locale).not.toContain('<h2'); } });
== test assertions: AC-007-18/19 ==
AC-007-18 -> it('AC-007-18: every one of the twenty routes publishes its own canonical in all three places', () => { for (const locale of LOCALES) { for (const kind of PAGE_KINDS) { const canonical = canonicalUrl(pagePathFor(locale, kind)); const meta = metadataFor(locale, kind); expect(String(meta.alternates?.canonical), `${locale}/${kind}`).toBe(canonical); expect(String(meta.openGraph?.url), `${locale}/${kind}`).toBe(canonical); expect(pageOf(kind, locale), `${locale}/${kind} footer`).toContain(`<code>${canonical}</code>`); } } }); it('AC-007-18: no route publishes another route’s canonical', () => { const canonicals = new Set<string>(); for (const locale of LOCALES) { for (const kind of PAGE_KINDS) c
AC-007-19 -> it('AC-007-19: five locales plus x-default, each the same page kind', () => { for (const locale of LOCALES) { for (const kind of PAGE_KINDS) assertAlternates(locale, kind); } }); it('AC-007-19: a sub-page never advertises the home URL as its alternate', () => { for (const locale of LOCALES) { for (const kind of SUB_PAGE_FILES) { const hrefs = Object.values((metadataFor(locale, kind).alternates?.languages ?? {}) as Record<string, string>); expect(hrefs, `${locale}/${kind}`).not.toContain(canonicalUrl('/')); } } });
== emitted artifacts ==
home title: Sistema de pensiones: la promesa que no se sostiene · 2042 · pensiones · España
home canonical: ['https://pensions-system-delta.vercel.app']
home alternates: 6
kicker before h1: Sistema de pensiones: esquema de reparto
cifras canonical: ['https://pensions-system-delta.vercel.app/cifras']
cifras og:url: ['https://pensions-system-delta.vercel.app/cifras']
cifras footer canonical: ['https://pensions-system-delta.vercel.app/cifras']
cifras alternates: [('es', 'https://pensions-system-delta.vercel.app/cifras'), ('en', 'https://pensions-system-delta.vercel.app/en/cifras'), ('fr', 'https://pensions-system-delta.vercel.app/fr/cifras'), ('de', 'https://pensions-system-delta.vercel.app/de/cifras'), ('it', 'https://pensions-system-delta.vercel.app/it/cifras'), ('x-default', 'https://pensions-system-delta.vercel.app/cifras')]

Finding: the four assertions match their Given/When/Then. AC-007-14 checks the promise string with
the committed year and the country suffix, and that `og:title` resolves to the same string; the
emitted home title confirms it. AC-007-15 checks the exact per-locale kicker, its position before
`<h1>` and its non-heading role; the emitted HTML confirms the same node order. AC-007-18 checks
canonical, `og:url` and the footer citation for all 20 route/kind pairs, and that the 20 canonicals
are distinct; emitted `/cifras` confirms all three. AC-007-19 checks five locales + `x-default`,
same page kind, absolute origin, and that a sub-page never advertises `/`; emitted alternates
confirm. No false green found.

---

# Attempt 2, phase 1 — scoped re-verification

- **Attempt:** 2, phase 1 (`SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=1`, `SPEC_PHASE2_RETRIES=0`)
- **Branch:** `spec/007-four-page-story` — HEAD unchanged at `95bf0f6`; base ref `main` = `1ced4c4`
- **Trigger:** attempt 1's `design-principles` FAIL — five `KISS_LINES` findings handed to the Refactorer
- **Verification window:** 2026-11-09T09:17:21Z → 2026-11-09T09:20:40Z (~199 s)
- **Scope:** only the previously failing gate (check 3.5), per AC-007-02. Checks 1, 2, 3, 4 and 5 keep
  their attempt-1 evidence above and were **not** re-run. The `npx vitest run` below is a rendering
  smoke test on the refactored files, not a re-verification of check 2.
- **Verdict: PASS (scoped)** — the gate exits 0 at both tiers with 0 FAIL / 20 WARN. No new FAIL and
  no new WARN appeared.

## Result

| Gate | Attempt 1 | Attempt 2 | Exit |
|---|---|---|---|
| Design-principles, default tier (script reports `mvp`) | FAIL — 5 FAIL / 20 WARN | **PASS** — 0 FAIL / 20 WARN | 0 |
| Design-principles, `--tier production` | FAIL — 5 FAIL / 20 WARN | **PASS** — 0 FAIL / 20 WARN | 0 |
| Render smoke (`npx vitest run`) | n/a | **PASS** — 129 files / 1136 tests | 0 |

All five attempt-1 FAILs are absent from both tiers:

- `web/ingest/figures.ts:342:366:compute:KISS_LINES=26` → gone
- `web/components/public/SiteFooter.tsx:29:63:SiteFooter:KISS_LINES=36` → gone
- `web/components/public/SiteHeader.tsx:72:105:IndexPanel:KISS_LINES=35` → gone
- `web/components/public/SiteHeader.tsx:116:136:SiteHeader:KISS_LINES=22` → gone
- `web/components/FigureStatusRow.tsx:37:65:FigureStatusRow:KISS_LINES=27` → gone

The 20 WARNs are the same 20 as attempt 1 (KISS `share-card.tsx:41` = 23; six DRY blocks; one god-file
SRP; one commented-out-code; three naming; eight null-discipline). **No new WARN, no new FAIL.**

## Fix review — the gate was satisfied by structure, not by suppression

The five findings were fixed by extraction, and the counter was not gamed:

- **`web/ingest/figures.ts`** — the three duplicated align-and-map blocks (`alignedYears`,
  `nationalDependencyFigure.compute`, `nationalCoverFigure.compute`) collapse into one generic
  `joinSeries<T>(left, right, keyOf, valueOf)` helper. Filter/map semantics are unchanged, rows are
  still never forward-filled, and `alignedYears` keeps its empty-series `throw`. This is a genuine DRY
  win on top of the KISS fix. `COVER_ASSUMPTIONS` is hoisted to a module constant, values verbatim.
- **`web/components/public/SiteFooter.tsx`** — body split into `FooterSources`, `FooterClaims`,
  `FooterCitation`, `FooterLocaleLinks`; the old import of `localePath` from `SiteHeader` is gone.
- **`web/components/public/SiteHeader.tsx`** — body split into `HeaderBrand`, `PageLinks`,
  `IndexLocaleList`, `IndexPanelBody`, `IndexPanel`. Nested JSX was moved into real components, not
  reflowed onto fewer lines.
- **`web/components/FigureStatusRow.tsx`** — `FigureRowHead` and `FigureRowDefinition` extracted;
  `FigureState` type alias added.
- **No suppression markers** were introduced: `grep -E '^\+.*(noqa|nolint|design-principles|eslint-disable|@ts-ignore|KISS|disable)'`
  over the four diffs returns nothing.
- **The gate script itself is untouched**: `.standards` submodule work tree is clean
  (`git -C .standards status --porcelain` → empty); the only `.standards` change is the pointer bump
  already recorded in attempt 1's §No unaccounted behaviour item 2.
  `sha256sum .standards/scripts/check-code-principles.sh` = `6e2e9a82c9e0891330a920aed981d7e13ed856aa9c371683592172b1cb1e6424`.

## Notes carried to the Architect (not gate findings)

1. **Unasserted link-target behaviour in the delta.** `web/components/FigureStatusRow.tsx` now renders
   the method link as `href={pagePathFor(content.locale, 'metodo')}`; the diff-vs-`main` shows
   `href="#metodo"` before. That is behaviour, not structure, and no test asserts the target — the
   three tests that touch this row (`tests/acceptance/accessibility.test.ts:247`,
   `tests/unit/design-revision.test.ts:100`, `:327`) assert only the label text
   (`figure.methodLink`). The change is consistent with spec 007's four-page model (a `#metodo`
   in-page anchor no longer exists on Historia), and the suite is green, but the target itself is
   uncovered. Flagged for the Architect / a follow-up assertion; not fixed here.
2. **Attribution of the per-page footer/nav hunks.** The delta-vs-`main` for these files also carries
   per-page footer canonical (`pageKind` prop) and page-links-instead-of-anchors. Those were already
   in the working tree at attempt 1 — attempt 1's emitted-HTML evidence recorded
   `cifras footer canonical: https://pensions-system-delta.vercel.app/cifras`, which the HEAD version
   could not emit. They trace to Tasks 6 and 9, not to this fix.
3. **`localePath` removed cleanly.** `grep -rn localePath` over `app/ web/ tests/ scripts/` → no hits.
   Its replacement `publicPathFor` is behaviourally identical: `pagePathFor(locale,'historia')` →
   `locale === DEFAULT_LOCALE ? '' : '/'+locale`, and `DEFAULT_LOCALE = 'es'`
   (`web/content/types.ts:7`), matching the deleted `locale === 'es' ? '/' : '/${locale}'`.
4. **Working tree still dirty** (98 paths incl. `runs.jsonl` telemetry, untracked `specs/`, route
   directories, `docs/changes/007-four-page-story.md`, and the two stray screenshots
   `live-005-top.png` / `live-006box.png`). Unchanged in character from attempt 1 — the pipeline's
   in-progress state. Nothing stashed, nothing committed, nothing pushed. Attempt 1's item 1
   (out-of-scope commits on the branch) and item 3 (stray screenshots) still stand.
5. **`web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23`** remains a WARN at both tiers — identical to
   attempt 1, pre-existing, not diff-introduced by this fix.

## Evidence: design-principles gate (attempt 2, scoped)

command: bash .standards/scripts/check-code-principles.sh -BaseRef main
exit: 0
at: 2026-11-09T09:17:25Z

[ANSI colour codes stripped; text otherwise verbatim]

Checking design principles in: . (tier: mvp)

PASS Complexity/KISS (java): no violations found
WARN Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23

--- DRY ---
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:1): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:2): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:3): import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /export const dynamic = 'force-static'; /import { renderPublicPage } from '../../../../web/components/render-public-page';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:4): import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /export function generateMetadata(): Metadata { /import { renderPublicPage } from '../../../../web/components/render-public-page';

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
WARN SRP: possible god file (node) — ./web/content/keys.ts: 444 lines, 0 methods (split by responsibility)
PASS SOLID-OCP (java): no large type-dispatch chains
PASS SOLID-OCP (go): no large type-dispatch chains
PASS SOLID-OCP (node): no large type-dispatch chains
PASS SOLID-LSP (java): no heavy instanceof dispatch
PASS SOLID-LSP (node): no heavy instanceof dispatch
PASS SOLID-ISP (java): no fat interfaces
PASS SOLID-ISP (node): no fat interfaces
PASS SOLID-DIP (java): no domain→infrastructure imports
PASS SOLID-DIP (go): no domain→infrastructure imports
PASS SOLID-DIP (node): no domain→infrastructure imports
PASS SOLID-DIP (python): no domain→infrastructure imports
PASS SOLID-DIP (rust): no domain→infrastructure imports

--- Component-per-file ---
PASS Component-per-file: no violations

--- Property tests ---
Property tests: skipped (project tier is mvp — production+ required)

--- Comments ---
WARN Comments: commented-out code (./scripts/check-sitemap.ts:20)

--- Naming ---
WARN Naming: noise word in type name (PublicPageData) (./web/components/PublicPage.tsx:19)
WARN Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
WARN Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:310)

--- Null discipline ---
WARN Null-discipline: return null (./scripts/check-sitemap.ts:177)
WARN Null-discipline: return null (./web/ingest/run-compute.ts:287)
WARN Null-discipline: return null (./web/seo/share-card.tsx:108)
WARN Null-discipline: return null (./web/components/public-page-props.ts:54)
WARN Null-discipline: return null (./web/components/public-page-props.ts:57)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:37)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:50)
WARN Null-discipline: return null (./web/components/public/NumberStep.tsx:92)

---------------------------------------------
✔ Design-principles check: 0 FAIL(s), 20 WARN(s).
  WARNs are review hints — verify each before merging.

## Evidence: design-principles gate, production tier (attempt 2, scoped)

command: bash .standards/scripts/check-code-principles.sh --tier production -BaseRef main
exit: 0
at: 2026-11-09T09:17:52Z

[ANSI colour codes stripped; the block is identical to the default-tier run except the tier line and
the Property-tests section, which the project declares production and satisfy]

Checking design principles in: . (tier: production)

PASS Complexity/KISS (java): no violations found
WARN Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23

--- DRY ---
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:1): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:2): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:3): import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /export const dynamic = 'force-static'; /import { renderPublicPage } from '../../../../web/components/render-public-page';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:4): import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /export function generateMetadata(): Metadata { /import { renderPublicPage } from '../../../../web/components/render-public-page';

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
WARN SRP: possible god file (node) — ./web/content/keys.ts: 444 lines, 0 methods (split by responsibility)
PASS SOLID-OCP (java): no large type-dispatch chains
PASS SOLID-OCP (go): no large type-dispatch chains
PASS SOLID-OCP (node): no large type-dispatch chains
PASS SOLID-LSP (java): no heavy instanceof dispatch
PASS SOLID-LSP (node): no heavy instanceof dispatch
PASS SOLID-ISP (java): no fat interfaces
PASS SOLID-ISP (node): no fat interfaces
PASS SOLID-DIP (java): no domain→infrastructure imports
PASS SOLID-DIP (go): no domain→infrastructure imports
PASS SOLID-DIP (node): no domain→infrastructure imports
PASS SOLID-DIP (python): no domain→infrastructure imports
PASS SOLID-DIP (rust): no domain→infrastructure imports

--- Component-per-file ---
PASS Component-per-file: no violations

--- Property tests ---
PASS Property tests (java): jqwik/@Property in use
PASS Property tests (go): testing/quick in use
PASS Property tests (node): fast-check in use

--- Comments ---
WARN Comments: commented-out code (./scripts/check-sitemap.ts:20)

--- Naming ---
WARN Naming: noise word in type name (PublicPageData) (./web/components/PublicPage.tsx:19)
WARN Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
WARN Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:310)

--- Null discipline ---
WARN Null-discipline: return null (./scripts/check-sitemap.ts:177)
WARN Null-discipline: return null (./web/ingest/run-compute.ts:287)
WARN Null-discipline: return null (./web/seo/share-card.tsx:108)
WARN Null-discipline: return null (./web/components/public-page-props.ts:54)
WARN Null-discipline: return null (./web/components/public-page-props.ts:57)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:37)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:50)
WARN Null-discipline: return null (./web/components/public/NumberStep.tsx:92)

---------------------------------------------
✔ Design-principles check: 0 FAIL(s), 20 WARN(s).
  WARNs are review hints — verify each before merging.

--- --json transcript (attempt 2, 2026-11-09T09:19:34Z, exit 0) ---

{
  "tier": "mvp",
  "gates": [
    "complexity",
    "dry",
    "yagni",
    "solid",
    "component-per-file",
    "property-tests",
    "comments",
    "naming",
    "null-discipline"
  ],
  "fails": [],
  "warns": [
    {
      "message": "Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23",
      "file": "./web/seo/share-card.tsx",
      "line": "41"
    },
    {
      "message": "Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {",
      "file": "./app/(public)/[locale]/cifras/page.tsx",
      "line": "10"
    },
    {
      "message": "Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';",
      "file": "./app/(public)/[locale]/cifras/page.tsx",
      "line": "9"
    }
  ]
}

[... 17 further identical WARN entries elided for length; total warns = 20, fails = 0 ...]

## Evidence: render smoke test (attempt 2, scoped confirmation)

command: npx vitest run
exit: 0
at: 2026-11-09T09:18:37Z

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  129 passed (129)
      Tests  1136 passed (1136)
   Start at  10:18:38
   Duration  46.66s (tests 90%, import 8%, environment 1%, transform 1%)

    Isolate  129 workers spawned · ~281ms startup each (spawn + environment, per file)
             at least ~3.02s faster with isolate: false — reuses workers across files instead of one per file

--- skip guard ---
$ grep -nE "skipped|todo|\[use\]|only" <vitest output>
no skipped/todo/only tests; every test that ran is counted. Same file/test count as attempt 1
(129 files / 1136 tests), so the extraction changed no test's outcome.

## Verdict (attempt 2, phase 1)

**PASS (scoped).** The previously failing gate now exits 0 at both tiers: 0 FAIL, 20 WARN, no new WARN.
The five KISS findings were resolved by real extraction — helper functions and sub-components, with a
DRY consolidation in `figures.ts` — not by suppression, and the gate script is unmodified. The render
smoke test is green at the same file/test count as attempt 1, so the fix broke nothing.

Pipeline may proceed to stage 5a. Attempt 1's FAIL is resolved at **attempt 2, phase 1**; phase-1
budget consumed: 2 of 3 (attempt 1 = FAIL, attempt 2 = PASS; no escalation, 1 attempt remaining).
`30-report.md` should carry `design-principles: PASS at attempt 2, phase 1`. The 20 WARNs and the five
notes above are review hints for the Architect — none is a stop.

## Telemetry (attempt 2)

One record appended to the repo-root `runs.jsonl` via
`bash .standards/scripts/record-gate-run.sh`:

- `specSlug: 007-four-page-story`, `gatesFailed: []`, `outcome: pass`, `durationSec: 227`,
  `loopCount: 1`, `phase1Retries: 1`, `phase2Retries: 0`, `runId: 30e5287e-627b-4da8-bc4b-4f26dab25092`,
  7 `warnings` entries.

**Tooling note (recorded, not a gate failure).** In a child repo the helper's `ROOT` resolves to
`.standards` (it is `dirname $BASH_SOURCE/..`), so a bare invocation appends to the tracked
`.standards/runs.jsonl` — in the standards submodule, not the child repo. The first attempt did
exactly that; I reverted the single appended line (`git -C .standards checkout -- runs.jsonl`,
submodule work tree clean again) and re-ran with `-f runs.jsonl` so the record landed in the child
repo's `runs.jsonl` (24 → 25 lines). No record was fabricated; the submodule carries no residue.
Worth a one-line fix in the helper (resolve `ROOT` from `git rev-parse --show-toplevel`) in a
follow-up, not here.
