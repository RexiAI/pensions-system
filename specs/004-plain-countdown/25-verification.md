# 25-verification — 004-plain-countdown (stage 4)

- Re-verification: **attempt 1, phase 1** (pre-PR loop; `SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=0`, `SPEC_PHASE2_RETRIES=0`)
- Re-verification: **attempt 2, phase 1** (`SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=1`, `SPEC_PHASE2_RETRIES=0`) — scoped to check 5 only
- Branch: `spec/004-plain-countdown`
- Verdict, current standing: **PASS** — attempt 1 failed check 5 only; attempt 2 re-ran check 5 and it passed.
  Attempt 1's report is preserved below verbatim as history; its verdict lines describe attempt 1, not the
  current standing. The current verdict is §Verdict (attempt 2) at the end of this file.

I wrote no production code and fixed nothing. I re-executed every claim made by stage 2
(Coder) and stage 3 (Refactorer) rather than reading it, and everything below is a
transcription of a real run.

## Summary of the five contract checks

| # | Check | Result | exit |
|---|---|---|---|
| 1 | scenario traceability | PASS | 0 |
| 2 | full test suite | PASS | 0 |
| 3 | complexity gate | PASS | 0 |
| 4 | design-principles gate | PASS at diff scope (0 FAIL / 5 WARN) — the in-place invocation exits **141** (tooling failure, §OOS-1) | 141 in place; 0 on the re-execution |
| 5 | scenario-to-behavior spot check | attempt 1: **FAIL** (2 scenarios) → attempt 2: **PASS** | n/a (analysis) |

---

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh
exit: 0
at: 2026-11-01T15:46:39Z

Scenario IDs found: 79 live, 186 archived

PASS AC-004-01 — traced to a test
PASS AC-004-02 — traced to a test
PASS AC-004-03 — traced to a test
PASS AC-004-04 — traced to a test
[… 72 more PASS lines, AC-004-05 … AC-004-79, same format …]
PASS AC-004-79 — traced to a test


✔ Scenario traceability check: every scenario traced, every reference resolves.

The project's own pre-build variant of the same check was also run, because it is the one
wired into `npm run build`:

command: ./node_modules/.bin/tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-11-01T15:46:34Z

scenario traceability (2-3 digit ids): 285 scenarios, all cited, all citations resolve

## Evidence: full test suite

command: npm test
exit: 0
at: 2026-11-01T15:40:36Z

> pensions-system@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  86 passed (86)
      Tests  923 passed (923)
   Start at  16:40:36
   Duration  25.29s (tests 82%, import 14%, transform 3%, environment 1%, worker 1%)

    Isolate  86 workers spawned · ~290ms startup each (spawn + environment, per file)
             at least ~1.98s faster with isolate: false — reuses workers across files instead of one per file

86 files / 923 tests matches the Refactorer's claim exactly. Nothing is skipped or disabled:
`grep -rnE "\.(skip|todo|only|fails)\b|xit\(|xdescribe\(" tests/` returns **zero** hits, and the
conditional suites were proved to have really executed rather than silently skipped —
`vitest run tests/acceptance/no-empty-columns.test.ts tests/acceptance/one-screen-per-step.test.ts`
reported `8 passed (8)` with real per-test timings (1.0 s / 5.1 s / 9.3 s / 3.1 s against real
Chromium), and `BUILD_PRESENT` is true (`.next/server/app` exists) with `/usr/bin/google-chrome`
present.

## Evidence: complexity gate

command: npm run lint
exit: 0
at: 2026-11-01T15:41:12Z

> pensions-system@0.0.0 lint
> eslint .

`eslint.config.mjs` carries `complexity: ['error', 6]`, so a clean run is the ≤6 cyclomatic
bound holding over every linted source file. `.next/**` and `.standards/**` are in the config's
`ignores`, which is correct for linting purposes: this gate judges the repo's own source.

The design-principles gate's independent `complexity` category agrees (see the two blocks
below): `PASS Complexity/KISS (java): no violations found` and no `Cyclomatic complexity >6`
FAIL inside the tree under review.

## Evidence: design-principles gate

command: .standards/scripts/check-code-principles.sh --tier production
exit: 141
at: 2026-11-01T15:41:18Z

Checking design principles in: . (tier: production)

PASS Complexity/KISS (java): no violations found
WARN Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:45:71:main:KISS_LINES=28
WARN Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:101:124:checkCompensationPairs:KISS_LINES=25
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:48:67:ActionForms:KISS_LINES=21
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:69:91:ProposalPage:KISS_LINES=23
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:35:67:ReviewTable:KISS_LINES=26
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx:7:34:RefreshPage:KISS_LINES=28
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:59:84:PendingTable:KISS_LINES=24
WARN Method body >20 lines (node): ./app/(admin)/admin/login/page.tsx:5:30:LoginPage:KISS_LINES=26
FAIL Cyclomatic complexity >6 (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10
[… elided: 27 lines of the same FAIL/WARN shape, all inside ./.next/… build output …]
WARN Method body >20 lines (node): ./web/components/registers/ThesisSection.tsx:19:43:ThesisSection:KISS_LINES=22
WARN Method body >20 lines (node): ./web/components/share/ShareRow.tsx:62:88:ShareRow:KISS_LINES=24
WARN Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:36:64:FigureStatusRow:KISS_LINES=27

--- DRY ---

[59 lines total; the process then died with SIGPIPE — exit 141, no verdict line, the DRY section
never completed. The diff-scoped form of the same command fails identically:]

command: .standards/scripts/check-code-principles.sh --tier production -BaseRef main
exit: 141
at: 2026-11-01T15:41:44Z

Checking design principles in: . (tier: production)

PASS Complexity/KISS (java): no violations found
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:59:84:PendingTable:KISS_LINES=24
WARN Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21

--- DRY ---

This is a **tooling failure, not a finding**: 141 is 128+13 (SIGPIPE), the run produced no
verdict, and §OOS-1 records the defect. Because a non-zero exit for a non-finding reason is
never a pass, I did not stop at the abort and did not reason about what the script "would have"
said — I executed the same script, at the same tier, with the same gate set, against the same
tree with the untracked build directory (`.next/`, gitignored, 0 tracked files, 194 generated
`.js` files) removed from the scan set. That is the tree the gate is chartered to audit.

## Evidence: design-principles gate (supplementary execution — source-only tree)

command: .standards/scripts/check-code-principles.sh --tier production /tmp/opencode/verif/src-only
exit: 1
at: 2026-11-01T15:46:58Z

Checking design principles in: /tmp/opencode/verif/src-only (tier: production)

FAIL Cyclomatic complexity >6 (node): /tmp/opencode/verif/src-only/.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10
[… 37 WARN lines, none inside this repo's own source: the same KISS_LINES set printed above,
   plus WARN Empty method body (java) in .standards/ci/templates/archunit/{Saga,Outbox}ArchRules.java
   and WARN SRP: possible god file (node) — web/content/keys.ts: 408 lines, 0 methods …]

✘ Design-principles check: 1 FAIL(s), 37 WARN(s).
  Reference: docs/CODING_CONVENTIONS.md §Design Principles, docs/ARCHITECTURE.md, docs/TESTING.md

**1 FAIL / 37 WARN — exactly the Refactorer's reported whole-tree number.** The single FAIL is
`./.standards/skills/hallmark/site/examples/cobalt-01/script.js` (§OOS-2: verified pre-existing
and unreachable from this change).

command: .standards/scripts/check-code-principles.sh --tier production -BaseRef main
exit: 0
at: 2026-11-01T15:46:58Z

Checking design principles in: . (tier: production)

PASS Complexity/KISS (java): no violations found
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:59:84:PendingTable:KISS_LINES=24
WARN Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21

--- DRY ---
WARN Possible duplication (4x identical 4-line block, first at ./app/(admin)/admin/(authed)/page.tsx:80): </tbody> /</table> /); /))}
WARN Possible duplication (3x identical 4-line block, first at ./app/(admin)/admin/(authed)/page.tsx:79): ))} /</tbody> /</table> /</tr>

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
WARN SRP: possible god file (node) — ./web/content/keys.ts: 408 lines, 0 methods (split by responsibility)
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

✔ Design-principles check: 0 FAIL(s), 5 WARN(s).
  WARNs are review hints — verify each before merging.

**0 FAIL / 5 WARN — exactly the Refactorer's reported diff-scoped number, reproduced.** Every
FAIL/WARN line above is verbatim. None of the 5 WARNs is a defect on review:

- The two `Possible duplication` hits are JSX closing boilerplate (`</tbody></table>` plus the
  map-closing parentheses) shared by four independently-shaped admin tables. Different columns,
  different row models, no shared reason to change — the DRY gate's own rule
  (`docs/CODING_CONVENTIONS.md` §DRY) says not to consolidate these.
- The two `KISS_LINES` hits are methods that already existed and were touched by T11's edit to
  the same file; `PendingTable` (24 lines) is 4 lines over the guideline.
- `web/content/keys.ts` at 408 lines is the content-key registry; it is a list, not logic, and
  splitting it would be the artificial split §SRP warns against.

## Evidence: scenario-to-behavior spot check

command: manual inspection of specs/004-plain-countdown/20-acceptance/*.md against the tests that cite each id, plus an independent Chromium measurement (see below)
exit: 1
at: 2026-11-01T15:48:16Z

Four scenarios checked across four different steps of the story. Two assert what their
scenario says; two do not.

### Checked and sound — AC-004-06 (step 1, number formatting)

`tests/acceptance/story-steps.test.ts:26-43`. The scenario says the day count equals the
committed anchor's count read at the pinned instant, the numeral sits on `--text-num-xl`, and it
is larger than the `<h1>`. The test computes `readClock(countdownValue().anchor, nowMs).days` and
asserts that exact numeral is in step 1's markup, and asserts `clock__value--days` occurs exactly
once (no second source of days). Sound, and it would fail if the day count were hard-coded.

Caveat (recorded, not a failure): the "largest numeral on the page" clause is asserted from the
**CSS declarations** (`--text-num-xl` maxes at 5rem, `--text-display` at 4rem), not from the
rendered value — the same substitution that went wrong twice at the design stage. I therefore
measured it myself in a real Chromium against `next start` on the built app:

    {"locale":"es","size":"390x844","dayFontPx":44,"h1FontPx":40,...}
    {"locale":"es","size":"1366x768","dayFontPx":80,"h1FontPx":64,...}
    {"locale":"es","size":"1440x900","dayFontPx":80,"h1FontPx":64,...}
    {"locale":"de","size":"390x844","dayFontPx":44,"h1FontPx":40,...}
    {"locale":"de","size":"1366x768","dayFontPx":80,"h1FontPx":64,...}
    {"locale":"de","size":"1440x900","dayFontPx":80,"h1FontPx":64,...}

The claim holds at every measured viewport in both locales (44 > 40, 80 > 64). The test's proxy
is correct even though it is a proxy.

### Checked and sound — AC-004-01…05 / AC-004-26 (ordering)

`tests/acceptance/five-step-order.test.ts` and `story-steps.test.ts:233-239` assert the exact
`data-top-step` sequence `['number','breakage','why','distance','meaning']` from the rendered
markup and that exactly five elements carry the attribute — the criterion T1 states. A sixth
section or a reordering fails it.

### FAILING SPOT CHECK — AC-004-59 (T13, the structural backstop)

`tests/acceptance/no-empty-columns.test.ts:103-119`. The scenario has two `Then` clauses:

1. "no rule places a sole grid child into a column other than the first" — **asserted, and
   generally**: every `grid-column:` value in `globals.css` must be `1 / -1` or `auto`, every
   `grid-area:` must be `auto`. I confirmed the retired shape is really gone
   (`grep -n "grid-column" web/styles/globals.css` → only `1 / -1` at lines 1394 and 1431; no
   `grid-column: 2` anywhere). This half is the general property and it is done right.
2. "no rule declares a two-column track list on an element that the page renders with a single
   child" — **not asserted. The assertion is vacuous.**

```js
const templates = [...CSS.matchAll(/grid-template-columns:\s*([^;]+);/g)].map((match) => match[1]?.trim() ?? '');
for (const template of templates) {
  expect(template, template).not.toContain('grid-template-areas');
}
```

The capture group is the *value* of `grid-template-columns` (e.g. `1fr auto`, `repeat(3,
minmax(0, 1fr))`). Such a value can never contain the string `grid-template-areas`, so the
assertion can never fail for any stylesheet — `templates` is computed and then used only in a
tautology. The test is titled "no rule pins a child to a column other than the first" and is
cited by AC-004-59, but its second clause is dead.

This matters more than a normal dead assertion because it is the belt-and-braces for the exact
defect this spec exists to fix: the runtime scan (AC-004-55/56/57) only covers `es` at
320/360/1024/1280/1366 and all five locales at 390/768/1440, so a void that appears only at an
unscanned width in a non-`es` locale would be caught by nothing. **A test that passes for the
wrong reason.** Routed to the Coder (test behaviour).

### FAILING SPOT CHECK — AC-004-72 (T16, locale routing)

`tests/acceptance/locale-parity.test.ts:75-83`. Scenario:

> Given the production build / Then five public routes prerender successfully / And each served
> document's `<html lang>` matches its locale / And no locale 404s

```
it('AC-004-72: each locale renders a document whose lang matches', () => {
  for (const locale of LOCALES) {
    const html = storyPage(locale);
    expect(html, locale).toContain('data-top-step="number"');
    expect(strings(locale)['site.skipLink'], locale).not.toBe('');
  }
});
```

`storyPage()` renders the `PublicPage` component with `renderToStaticMarkup` — there is no
document, no `<html>` element and no HTTP response in it. The test's own name promises "a
document whose lang matches" and the body asserts no lang at all, and nothing about a 404. The
second assertion (a non-empty `site.skipLink`) is not one of the scenario's clauses.

The *behaviour* is verified elsewhere — `tests/acceptance/served-document.test.ts` serves every
route from `next start`, asserts each route's `<html lang>` and asserts an unknown locale answers
404 — but that file cites `AC-001-52`, not `AC-004-72`. So no shipped behaviour is unverified;
what is false is the mapping this id's citation claims. Routed to the Coder (test behaviour);
fix is either asserting the served lang here or re-pointing the scenario to the test that does.

---

## The retirements are legitimate (T17)

I did not take "19 retired, 5 superseded" on trust. I diffed the id *set* cited under
`tests/` at `HEAD` against the id set cited now:

    comm -23 <(git grep -rhoE "AC-[0-9]{3}-[0-9]{2,3}" HEAD -- tests/ | sort -u) \
             <(grep -rhoE "AC-[0-9]{3}-[0-9]{2,3}" tests/ | sort -u)

Exactly **24** ids lost all their citations, and they are exactly T17's lists:

- the 19 **retired**: `AC-001-107`, `AC-002-09`, `-10`, `-11`, `-12`, `-16`, `-18`, `-19`,
  `-20`, `-21`, `-29`, `-30`, `-36`, `AC-003-01`, `-06`, `-10`, `-48`, `-49`, `-50`;
- the 5 **superseded**: `AC-002-24`, `AC-003-39`, `-40`, `-42`, `-51`.

No id outside those two lists was retired, and `grep` for each retired id under `tests/`
returns 0 for all 24 — so nothing was deleted merely to reach green, and no *preserved* id lost
its last citation.

I also checked that the re-pointed ids were re-pointed rather than gutted, because that is where
a green-washing edit would hide. Sample:

- `AC-003-02/03/04` (`tests/acceptance/countdown-band.test.ts:61-105`) keep 2, 2 and 3 tests,
  each asserting the ladder declarations *and* the rendered markup (`expect(html).not.toContain('hero__value')`).
- `AC-001-109` (`tests/acceptance/clock.test.ts:137-181`) keeps 3 tests, two of them looping all
  five locales over seven disclosure slots.
- `AC-001-113` (`clock.test.ts:285-308`) keeps 4 tests — aria-hidden field counting, no
  live-region attributes, group labelling, and accessible-tree stability across motion modes.
- `AC-002-35` (`tests/acceptance/cta-hierarchy.test.ts:149-180`) keeps 3 tests, now against step
  5 and the after-story strip.

And the whole-tree search the project's own gate performs agrees
(`scripts/check-scenario-traceability-3digit.ts` `RETIRED_SCENARIOS` is byte-for-byte T17's 24
ids, and it only removes them from the "untested" demand; citing a retired id remains an error).

## Stage-claim reconciliation

### (a) The remaining whole-tree FAIL is pre-existing and unreachable from this change — CONFIRMED

- `script.js` is tracked in the submodule and unmodified in the submodule working tree:
  `git -C .standards status --short skills/hallmark/site/examples/cobalt-01/script.js` → empty.
- It was last touched by a submodule commit, `30bec2d 2026-10-15 feat(standards): add Angular,
  Ionic, Python/FastAPI and Rust stack guides (#80)` — three weeks before this branch.
- `git -C .standards stash list` → empty (nothing hidden there).
- This branch does not touch it and does not move the submodule pointer: `git diff --stat --
  .standards` is `0 insertions(+), 0 deletions(-)`, and `git diff HEAD --submodule=log --
  .standards` reports only "Submodule .standards contains modified content" (the pre-existing
  local edit to `.standards/agents/spec-ux.md` and the untracked `.standards/skills/laws-of-ux/`,
  neither of which is spec-004 code).
- It is a demo asset inside the standards repo (`skills/hallmark/site/examples/`), not reachable
  from any code this repo runs.

### (b) The SIGPIPE abort is a real defect in the gate script — CONFIRMED

`check_dry()` ends with:

    done | sort -rn | head -10 > "$tmp"

`head -10` closes the pipe as soon as it has ten lines; `sort` then dies of SIGPIPE; `set -o
pipefail` + `set -e` turn that into the script's own exit status. The abort only fires when the
DRY candidate stream yields more than ten groups — which is what `.next/` (66 MB, 194 generated
`.js` files) supplies. Isolation:

- `--gates dry .` → 141 (aborts at DRY);
- `--gates dry web` → `0 FAIL(s), 10 WARN(s)`, exit 0 — completes, and stops at exactly 10
  because that is `head -10`;
- the same whole-tree run against the tree with `.next/` removed → completes, exit 1.

The defect is older than this spec: `git -C .standards blame -L 709,714` puts the `sort -rn |
head -10` line in submodule commit `b3d5a757`, dated 2026-08-12. A second, related defect in the
same function's inputs: `GREP_EXCLUDES` and `FIND_PRUNE` exclude `node_modules`, `target`,
`vendor`, `.git`, `dist` and `build`, but **not** `.next` — which is why the in-place run scanned
194 generated files and produced three bogus FAILs against vendored Next.js runtime code
(`.next/server/chunks/…:CC=47`). Both are recorded as out-of-scope findings (§OOS-1) with a
follow-up spec proposed; nothing in this branch can fix a submodule script, and `Gate config is
off-limits to agents` cuts both ways.

Consequence for the record: the Refactorer's reported diff-scoped number is **only** reproducible
with the build directory absent. In the repo's post-`npm run build` state the canonical command —
in both scopes — aborts, so the reported "0 FAIL / 5 WARN" was produced in a state that differs
from the one this branch is committed in.

### (c) The eight orphan tokens are kept because tests pin them — FALSE for four of eight

The claim: 8 tokens lost their last consumer and were deliberately kept because existing tests
assert they stay declared. Verified one by one (`grep -rn -- "--<token>" tests/` plus the token
lists in `tests/acceptance/visual-identity.test.ts`):

| token | consumer in `globals.css` | pinned by a test? |
|---|---|---|
| `--text-h3` | none | **yes** — `visual-identity.test.ts:40` (`AC-004-64`) |
| `--measure-face` | none | **yes** — `first-viewport.test.ts:54` asserts the declaration survives |
| `--text-clock-sub` | none | **yes** — `countdown-band.test.ts:95` asserts it is *not* used |
| `--rule-projection` | none | **yes** — `projection-colour.test.ts:34` (`--rule-projection: 3px`) |
| `--text-clock-days` | none | **no test cites it anywhere** |
| `--text-band-years` | none | **no test cites it anywhere** |
| `--band-pad-block` | none | **no test cites it anywhere** |
| `--hero-min-h` | none | **no test cites it anywhere** |

The last four are genuinely orphaned: their only pinning test was the one T17 retired with
`AC-001-107` (`first-viewport.test.ts` used to assert `--hero-min-h: 560px` and
`min-height: var(--hero-min-h)` on the retired `.hero` rule). Keeping them is still *permitted* —
T15 requires every token in `tokens.css` to keep its value — but the stated justification does
not hold for half the list, and nothing now pins those four against a silent edit. Recorded as
WARN (§W-3), not a blocker: no behaviour depends on them.

## Measured, not asserted

`15-design.md` and several tests state rendered geometry. I re-measured the load-bearing ones in
real Chromium (headless, via the repo's own CDP helper) against `next start` on the built app:

    {"locale":"es","size":"390x844","steps":[{"id":"number","h":513},{"id":"breakage","h":371},{"id":"why","h":744},{"id":"distance","h":187},{"id":"meaning","h":416}],"viewportH":844}
    {"locale":"es","size":"1366x768","steps":[{"id":"number","h":471},{"id":"breakage","h":272},{"id":"why","h":631},{"id":"distance","h":199},{"id":"meaning","h":309}],"viewportH":768}
    {"locale":"es","size":"1440x900","steps":[{"id":"number","h":471},{"id":"breakage","h":279},{"id":"why","h":631},{"id":"distance","h":201},{"id":"meaning","h":314}],"viewportH":900}
    {"locale":"de","size":"390x844","steps":[{"id":"number","h":584},{"id":"breakage","h":340},{"id":"why","h":744},{"id":"distance","h":210},{"id":"meaning","h":447}],"viewportH":844}
    {"locale":"de","size":"1366x768","steps":[{"id":"number","h":537},{"id":"breakage","h":272},{"id":"why","h":631},{"id":"distance","h":199},{"id":"meaning","h":348}],"viewportH":768}
    {"locale":"de","size":"1440x900","steps":[{"id":"number","h":537},{"id":"breakage","h":279},{"id":"why","h":631},{"id":"distance","h":201},{"id":"meaning","h":354}],"viewportH":900}

- T14 holds in my own measurement: every step ≤ its viewport, in both locales at all three
  viewports; step 3 (`why`, 744 px at 390×844) is the tallest and still clears the fold by 100 px.
- The primary action measures 221×52 px (`es`) and 227×52 px (`de`) — above the 44 px target floor.
- `<html lang>` measured `es` and `de` on the two routes I opened.

**A trap I hit and am recording so no later stage wastes a round on it:** the dev server listening
on `http://localhost:3000` is serving the **pre-004 composition** — `curl -s
http://localhost:3000/` still emits `class="band"` and `hero--band` and no `data-top-step`. Any
geometry measured there is a measurement of the old page. All numbers above come from a fresh
`next start` over the built `.next`, which is the same app `no-empty-columns.test.ts` and
`one-screen-per-step.test.ts` measure.

Related, minor: `AC-004-62` requires step 3's height to be "recorded explicitly per locale per
viewport". The test builds a `records` array of exactly those 15 strings and then asserts only
its length — nothing is printed or persisted, so the record cannot be quoted from the run. The
numbers above are what that record should have contained.

## The plain-language gate is not vacuous — reproduced

`scripts/check-plain-language.ts` is wired into `prebuild` (and therefore into `npm run build`).

    $ npm run check:plain-language
    plain-language gate: clean (5 locales)                     → exit 0

I mutated a copy of the tree (rsync into `/tmp/opencode/verif/gate-mut`, `node_modules`
symlinked, no tracked file touched) by appending `proj_23np` to the Spanish
`steps.number.sentence` — a single dataset identifier inside the story region:

    $ ./node_modules/.bin/tsx scripts/check-plain-language.ts
    es: proj_23np — …mayor alcanza la proporción que explica el paso siguiente. proj_23np</p></section><section class="step step--breakage"…
    plain-language gate: 1 hit(s) in the story                  → exit 1

So the gate fails when it should, names the locale, the term and the surrounding context, and
exits 1. It also exits 0 on the shipped page in all five locales. `scanTopRegion` scans the raw
region string, so `aria-label`/`alt`/`title` values are in scope by construction, and
`data-operator="true"` subtrees are stripped before scanning. Not vacuous.

## No unaccounted behavior

Finding lines, not a command:

- Every new module maps to a task: `top-steps.ts` / `TopStepSection.tsx` / `PublicStory.tsx` → T1;
  `NumberStep` → T2; `BreakageStep` → T3; `PyramidStep` → T4; `DistanceStep` → T5; `MeaningStep` /
  `StoryStrip` → T6–T7; `MethodRegion` / `CountdownPrecision` → T8; `public-plain-language.ts` →
  T9; `FiguresRegion` → T10; `web/admin/views/FigureTable.tsx` → T11; `SubjectFacts` → T12.
- Deletions map to T10/T12 (`PendingBlock.tsx`, `Hero.tsx`, `HeroLeadBlock`, `hero-subject.ts`,
  `CountdownBand.tsx`); no module imports any of them and no dead export remains.
- The one piece of the diff that is not directly task-shaped is the Refactorer's extraction of
  `SummaryList` / `PublishedSummary` out of `PanelHome` in `app/(admin)/admin/(authed)/page.tsx`
  — a KISS fix for the `KISS_LINES` WARN on the file T11 edited. Same file, same behaviour,
  accounted for.
- `AC-001-109`'s third test pins `countdown.clock.*` at `toHaveLength(10)`. That is a small fixed
  count inside one key prefix — not the retired 270-key freeze, but it is the same shape and will
  bite the next person who adds a clock key. WARN only (§W-4).

## Out-of-scope findings

### OOS-1 — `check-code-principles.sh` aborts with SIGPIPE at the DRY section, and scans `.next/`

Two defects in `.standards/scripts/check-code-principles.sh` (a different repository; nothing in
this branch can fix them, and gate configuration is off-limits to agents):

1. `check_dry()` closes its own pipeline with `| sort -rn | head -10` under `set -o pipefail`, so
   more than ten duplicate groups kills `sort` with SIGPIPE and the script with 141 — no verdict,
   no findings for any gate after DRY. Reproduced above; the line dates from submodule commit
   `b3d5a757` (2026-08-12).
2. `GREP_EXCLUDES` / `FIND_PRUNE` omit `.next`, so a normal `npm run build` makes the gate audit
   194 generated files and emit three spurious `Cyclomatic complexity >6` FAILs against vendored
   Next.js chunks. `dist` and `build` are already excluded for exactly this reason.

Consequence: the design-principles gate cannot be run in its canonical form in any repo state
that follows a build. **Proposed follow-up spec** in `RexiAI/my-engineering-standards`: replace
`head -10` with an awk-side limit (or `|| true` on the pipeline), add `.next` to both exclusion
lists, and add a regression fixture with >10 duplicate groups. Not routed to the Coder or the
Refactorer — neither can act on it.

### OOS-2 — `AC-001-107`'s replacement ordering test asserts a retired element

`tests/acceptance/first-viewport.test.ts` was reduced from 373 to 62 lines correctly, but the
new file's AC-004-77 first test asserts on strings inside `tests/acceptance/clock.test.ts` and
`countdown-band.test.ts` (`expect(bodyOf(...)).not.toContain(...)`) — assertions about other test
files' text rather than about behaviour. It is a retirement *guard*, which is defensible, and
`AC-004-78` does the same for the band tests, so I am recording it rather than failing it: the
next time either file legitimately mentions those fragments the guard will need widening.
Informational.

### OOS-3 — `retired-criteria.test.ts` writes `AC-001-111`/`AC-002-35` in plain text while building
the retired ids from fragments

`RETIRED` is assembled from fragments (`id('001-107')`) so the file does not self-cite; but
`PRESERVED` (line 43-69) contains literal ids, which means this test file *is* a citation of
every preserved id it lists. That is what `AC-004-75` wants, but it also means the sample of 25
ids in that array is doing double duty: it is both the check and part of the evidence it checks.
`AC-004-75`'s scenario says "each preserved id" from T17; the test checks 25 hand-picked ones. I
verified the *property* independently (the id-set diff above shows no preserved id lost its last
citation), so no behaviour is unverified — but the assertion is a sample wearing a universal's
name. WARN (§W-2), not a blocker.

## WARNs for the Architect (not blockers)

- **W-1** — 5 design-principles WARNs at diff scope, itemised and assessed under the
  design-principles evidence block (2 KISS_LINES, 2 DRY JSX-boilerplate, 1 SRP on
  `web/content/keys.ts`).
- **W-2** — `AC-004-75`'s preserved-id list is a 25-id sample, not the full T17 set (OOS-3).
- **W-3** — four orphan tokens (`--text-clock-days`, `--text-band-years`, `--band-pad-block`,
  `--hero-min-h`) have neither a consumer nor a test pinning them, contrary to the Refactorer's
  claim that tests keep all eight.
- **W-4** — `AC-001-109` pins `countdown.clock.*` at a fixed count of 10.
- **W-5** — `AC-004-62`'s per-locale step-3 height "record" is computed and discarded; the
  numbers are reproduced in §Measured, not asserted from the test.
- **W-6** — the `next dev` server on `:3000` serves the pre-004 page; do not measure against it.

## Verdict

**FAIL.**

Four of the five contract checks pass: scenario traceability (exit 0), the full suite (exit 0,
86 files / 923 tests, nothing skipped), the complexity gate (exit 0), and the design-principles
gate (0 FAIL / 5 WARN at diff scope, exit 0, with the in-place 141 recorded as a tooling failure
per §OOS-1).

Check 5 fails, on two scenarios whose citing tests do not assert what their scenario says:

- `check-5 / AC-004-59` — the second clause ("no rule declares a two-column track list on an
  element the page renders with a single child") is asserted by a tautology that cannot fail;
  the structural backstop for the empty column is dead.
- `check-5 / AC-004-72` — the test named "each locale renders a document whose lang matches"
  asserts no `<html lang>` and no 404 clause; the behaviour is covered under a different id
  (`AC-001-52`), so what is false is the citation, not the product.

Routing (phase 1, attempt 1 of a 3-attempt budget):

- **AC-004-59 → Coder.** Behaviour/test defect: rewrite the third loop in
  `tests/acceptance/no-empty-columns.test.ts` so it asserts the two-track-on-a-single-child
  property it claims (or delete the clause from the scenario and keep the grid-column assertion
  that already works).
- **AC-004-72 → Coder.** Behaviour/test defect: assert the served `<html lang>` and the 404 in
  this test, or re-point `AC-004-72` to `served-document.test.ts` and give the parity file a
  scenario id that matches what it actually renders.
- **OOS-1 → follow-up spec in `my-engineering-standards`,** not the Coder or the Refactorer.

Re-verification after the fix is **scoped**: only check 5 re-runs (the two changed tests, then
the spot check on those two scenarios). Checks 1–4 stand on the results recorded above.

---

# Re-verification — attempt 2, phase 1 (scoped: check 5 only)

Cycle 1 of the phase-1 budget (`SPEC_PHASE1_RETRIES=1` of max 3). Per §Scoped re-verification I re-ran
**only check 5**. Checks 1–4 stand on attempt 1's recorded results and were not re-executed: traceability
(exit 0), the full suite (exit 0, 86 files / 923 tests), the complexity linter (exit 0), and the
design-principles gate (0 FAIL / 5 WARN at diff scope, exit 0). I re-ran the *tests touched by this
cycle's fix* — the two repaired files plus every file that reads `web/styles/tokens.css` — because a
token deletion is a change to those files' subject, not a re-run of the suite. That is 167 tests across
11 files, all green, itemised below.

I wrote no production code. Every mutation below ran in `/tmp/opencode/verif/rerun`, an rsync copy with
`node_modules` symlinked; the real tree was never modified, and each mutation was restored and
re-confirmed green at the end.

## Evidence: scenario-to-behavior spot check

command: npx vitest run tests/acceptance/no-empty-columns.test.ts tests/acceptance/locale-parity.test.ts --reporter=verbose ; then 5 stylesheet/layout mutations in a scratch copy, one test each, restored after
exit: 0
at: 2026-11-01T15:56:04Z

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 ✓ tests/acceptance/locale-parity.test.ts > AC-004-69: REQUIRED_KEYS matches what the page renders > AC-004-69: every story key is listed, and the retired keys are not 4ms
 ✓ tests/acceptance/locale-parity.test.ts > AC-004-70: all five locales carry exactly the required set > AC-004-70: missingKeys and unknownKeys are empty for each locale 4ms
 ✓ tests/acceptance/locale-parity.test.ts > AC-004-71: every new key is translated, not copied > AC-004-71: non-blank in all five locales, and none is the Spanish value 2ms
 ✓ tests/acceptance/locale-parity.test.ts > AC-004-71: every new key is translated, not copied > AC-004-71: every new value passes the plain-language gate 382ms
 ✓ tests/acceptance/locale-parity.test.ts > AC-004-72: five routes, five languages > AC-004-72: five routes render, each document’s <html lang> matches, and no locale 404s 30ms
 ✓ tests/acceptance/locale-parity.test.ts > AC-004-73: parity tests assert set equality, never a fixed count 0ms
 ✓ tests/acceptance/no-empty-columns.test.ts > no unoccupied grid track > AC-004-55: no track of 8px or more is unoccupied at 1440x900 in es 740ms
 ✓ tests/acceptance/no-empty-columns.test.ts > no unoccupied grid track > AC-004-56: the count is zero at every measured width 4674ms
 ✓ tests/acceptance/no-empty-columns.test.ts > no unoccupied grid track > AC-004-57: the count is zero in all five locales 8647ms
 ✓ tests/acceptance/no-empty-columns.test.ts > no unoccupied grid track > AC-004-58: no horizontal overflow at the 320 floor 2889ms
 ✓ tests/acceptance/no-empty-columns.test.ts > AC-004-59: the retired shape cannot return structurally > AC-004-59: no rule places a grid child into a track other than the first 1ms
 ✓ tests/acceptance/no-empty-columns.test.ts > AC-004-59: the retired shape cannot return structurally > AC-004-59: every multi-track grid’s element renders a child for each track 11ms
 ✓ tests/acceptance/no-empty-columns.test.ts > AC-004-59: the retired shape cannot return structurally > AC-004-59: no rule moves content away from the first named area 0ms

 Test Files  2 passed (2)
      Tests  13 passed (13)

### AC-004-59 is repaired — the vacuous assertion is gone and all three clauses can fail

The tautology I reported (`expect('1fr auto').not.toContain('grid-template-areas')`) is deleted. It is
replaced by a real rule parser (`rulesOf`) over comment-stripped `globals.css`, with three tests whose
failures are all named. I mutated the real stylesheet five ways in the scratch copy:

| # | mutation | clause under test | result |
|---|---|---|---|
| M1 | the **exact retired shape**, restored verbatim from `main`: `.hero--band { grid-template-columns: 7fr 5fr }` + `.hero--band > .hero__panel, .hero--band > .hero__status { grid-column: 2 }` | (a) | **fails** — `AssertionError: line 1657: .hero--band > .hero__panel, .hero--band > .hero__status: expected '2' to match /^(1 \/ -1|auto)$/` |
| M1b | the same defect on a grid the page really renders: `.site-footer > div { grid-column: 2 }` (two-track footer, both children in column 2, track 1 empty) | (b) **alone** | **passes** — `1 passed` |
| M1b | …the same mutation, full AC-004-59 | (a) | **fails** — `line 1651: .site-footer > div: expected '2' to match /^(1 \/ -1|auto)$/` |
| M2 | the same void expressed with the longhands: `.site-footer > div { grid-column-start: 2; grid-column-end: 3 }` | (a)+(b)+(c) | **passes** — `3 passed` (see §W-7) |
| M3 | `.site-footer { grid-template-columns: 1fr 1fr 1fr }` — three tracks, two children | (b) | **fails** — `.site-footer (3 tracks) renders 2 child(ren): expected 2 to be greater than or equal to 3` |
| M5 | `.site-footer { grid-template-areas: "left right" }` | (c) | **fails** — `line 1019: "left right": expected 2 to be less than or equal to 1` |

Restored → `3 passed` on AC-004-59 again. Clauses (a), (b) and (c) are each individually live, and the
non-vacuity guard is real, not decorative: instrumenting the walk in the scratch copy printed
`WALK_TOTAL 12 WALK_RENDERED 11`, so `toBeGreaterThanOrEqual(4)` is asserting a number it actually
measured, and an empty walk would fail it.

**Would clause (b) have caught the original defect? No — and that is worth stating plainly.** Clause (b)
compares a *count*: direct element children ≥ declared tracks. Pinning every child into column 2 does
not change the count — the retired `.hero--band` had two children and two tracks, and the two-track
footer has two children and two tracks. M1b proves it empirically: with a real 699×552-style void in the
footer, clause (b) on its own passes. What actually catches the historical shape is **clause (a)**, and
it does catch it, verbatim and with a named line. Clause (b) is live and does the job the *scenario's
second clause* asks of it — "no rule declares a two-column track list on an element the page renders
with a single child" — which is a different property from the first clause.

The residual gap this exposes is M2: clause (a) scans `grid-column:`, `grid-row:` and `grid-area:` only,
so the identical void written with `grid-column-start`/`grid-column-end` passes all three clauses. It is
recorded as **W-7** below — a real but narrow hole, not the false green I reported in attempt 1.

### AC-004-72 is repaired — the body now asserts what its name claims

The test renders `app/(public)/(home)/layout.tsx` and `app/(public)/[locale]/layout.tsx` through
`renderDocument`, asserts `documentLang(...)` per route against an exact map
`{ en: 'en', fr: 'fr', de: 'de', it: 'it' }` plus `DEFAULT_LOCALE` for the base route, and asserts
`LocaleRoute.generateStaticParams()` equals exactly the four non-default locales — which is the
structural form of "no locale 404s", since `dynamicParams = false` makes a path outside that set a 404.
The previous version rendered a component (no `<html>` element at all), which is why it could not fail.

My own mutation, independent of the Coder's: hard-coded `lang="es"` in `app/(public)/[locale]/layout.tsx`
(`<RootShell lang="es">` instead of `lang={locale}`):

    AssertionError: expected { en: 'es', fr: 'es', de: 'es', …(1) } to deeply equal { en: 'en', fr: 'fr', de: 'de', …(1) }
    Tests  1 failed | 5 skipped (6)

Restored → green. The repair can fail again, for the right reason.

## The token split, judged on its merits

I deleted each token's declaration from `tokens.css` in the scratch copy and ran the file the Coder says
cites it:

| token | mutation | citing test | verdict |
|---|---|---|---|
| `--text-h3` | declaration removed | `visual-identity.test.ts` (AC-004-64) | **fails** — `AssertionError: text-h3: expected null not to be null` → genuinely pinned |
| `--measure-face` | declaration removed | `first-viewport.test.ts` (AC-004-77) | **fails** — `expected '/* Design tokens (spec 001, 15-design…' to match /--measure-face:\s*17\.5rem;/` → genuinely pinned |
| `--rule-projection` | declaration removed | `projection-colour.test.ts` | **fails** — `expected '/* Design tokens (spec 001, 15-design…' to match /--rule-projection:\s*3px/` → genuinely pinned |
| `--text-clock-sub` | declaration removed | `countdown-band.test.ts` | **passes** — `16 passed (16)` → **not pinned** (§W-8) |

The four **deleted** tokens are clean: `--text-clock-days`, `--text-band-years`, `--band-pad-block`,
`--hero-min-h` each have zero `var(--…)` references anywhere under `web/` or `app/`, zero references in
`tests/`, `scripts/` or `app/`, and their only remaining occurrence in the repository is the prose in
`tokens.css` that says they were deleted. The four **frozen** tokens keep their exact declarations
(`git diff -U0 -- web/styles/tokens.css` shows no added or removed declaration for any of them; only
comment text changed), and two of the rewritten comments now state only what holds:
`--measure-face`'s says no rule resolves it any more and that `AC-004-77` asserts the declaration
survives; the numeral-alias comment explains why `--text-clock-days`/`--text-band-years` went. That part
of the fix is exactly right.

## Scoped test runs (the files this cycle touched)

command: npx vitest run tests/acceptance/visual-identity.test.ts tests/acceptance/first-viewport.test.ts tests/acceptance/countdown-band.test.ts tests/acceptance/projection-colour.test.ts tests/acceptance/countdown-band-browser.test.ts tests/acceptance/retired-criteria.test.ts
exit: 0
at: 2026-11-01T15:58:01Z

 Test Files  6 passed (6)
      Tests  42 passed (42)

command: npx vitest run tests/acceptance/palette-labels.test.ts tests/acceptance/palette-accent.test.ts tests/acceptance/clock.test.ts tests/unit/design-revision.test.ts tests/acceptance/story-steps.test.ts
exit: 0
at: 2026-11-01T15:58:21Z

 Test Files  5 passed (5)
      Tests  112 passed (112)

With the 13 from the two repaired files that is 167 green tests over every file that reads
`tokens.css` plus the two repaired suites. I did **not** re-run the whole suite, per the scoped-rewrite
rule. The Coder's claimed 925 (up from 923) is consistent with the diff: AC-004-59 went from one test to
three (+2) and AC-004-72 stayed at one (+0), so 923 + 2 = 925.

## New findings from this cycle

- **W-7 (new, WARN, not a blocker) — clause (a) only covers the `grid-column` shorthand.** Proven by M2:
  `.site-footer > div { grid-column-start: 2; grid-column-end: 3 }` recreates the exact void and
  `AC-004-59` passes all three clauses. T13's criterion is general ("no stylesheet rule places a sole
  child of a multi-column grid into a column other than the first"); this one spelling of placement
  evades it. The fix is two lines in `rulesOf`'s consumer — also require every `grid-(column|row)-(start|end)`
  to be `auto`, `1` or `-1` — and a fourth mutation to prove it. I am **not** re-failing the gate for it:
  the historical defect is caught verbatim (M1), the scenario's own second clause is asserted and live
  (M3), and any real void is still caught dynamically by AC-004-55/56/57 at 8 widths across 5 locales.
  Flagged to the Architect rather than silently accepted.
- **W-8 (new, WARN) — `--text-clock-sub`'s stated justification does not hold.** The Coder kept it on the
  grounds that "AC-003-04's assertion names it"; that assertion is
  `expect(CSS).not.toMatch(/\.clock__value--sub\s*\{[^}]*--text-clock-sub/s)` — a negative on
  `globals.css`, which is satisfied whether or not the token exists. Deleting the declaration leaves
  `countdown-band.test.ts` at `16 passed`. Retention is still permissible under T15, so nothing is
  broken; but this is the third time a retention has been justified by a test that does not actually
  notice it. Either delete it with the other three, or add the assertion that makes keeping it mean
  something.
- **W-9 (new, informational) — clause (a) also pins the exact placement set.** `expect(placements.sort())`
  equals `['.clock__field--days', '.demography__panel-head']`, so any future legitimate `grid-column:
  1 / -1` must edit this list. That is a deliberate registry, not the retired 270-key freeze, but it is
  the same shape and worth knowing about.

## Verdict (attempt 2)

**PASS.**

Both failures from attempt 1 are fixed and I reproduced the failure of each repair myself, from my own
scratch copy:

- `AC-004-59` — the tautology is gone; clauses (a), (b) and (c) each produced a distinct named failure
  under my own mutations, the non-vacuity guard measured 11 rendered multi-track grids (≥4), and the
  exact retired stylesheet restored verbatim fails the test. Clause (b) alone would not have caught the
  original shape — clause (a) does — which I report plainly as **W-7** rather than papering over.
- `AC-004-72` — the test now renders real document shells and asserts the `<html lang>` its name
  promises; hard-coding `lang="es"` fails it with a named diff.

The token split is sound on its merits: the four deleted tokens have no reference anywhere and the four
kept ones keep their exact declarations, three of which I proved are genuinely pinned by deleting them
and watching the citing test fail. The fourth (`--text-clock-sub`) is not pinned — recorded as **W-8**.

Residual risk I am explicitly carrying forward rather than blocking on: **W-7** (longhand placement
evades clause (a)), plus attempt 1's **OOS-1** (the `check-code-principles.sh` SIGPIPE/`.next` defects,
still unfixed and still out of reach of this branch). No gate re-fails. Checks 1–4 keep attempt 1's
results; check 5 passes.
