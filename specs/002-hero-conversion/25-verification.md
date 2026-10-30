# Verification — 002-hero-conversion

**Verifier:** spec-verifier (stage 4, independent re-check)
**Attempt:** 1, phase 1
**Branch:** `spec/002-hero-conversion`
**Date:** 2026-10-29
**Verified against:** `10-tasks.md`, `15-design.md`, `20-acceptance/` (36 scenarios `AC-002-01`…`AC-002-36`).
`00-informal.md` was **not** read (information barrier).

## Scope of the re-check

Every prior-stage self-report was re-executed, not trusted. Coder's reported
`npm test` 0 / `764→763`, typecheck 0, lint 0, build 0; Refactorer's "behaviour
unchanged, check-code-principles.sh scoped clean" — all re-run below.

---

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh
exit: 0
at: 2026-10-29T21:50:25Z

Scenario IDs found: 36 live, 99 archived
PASS AC-002-01 — traced to a test
PASS AC-002-02 — traced to a test
PASS AC-002-03 — traced to a test
PASS AC-002-04 — traced to a test
PASS AC-002-05 — traced to a test
PASS AC-002-06 — traced to a test
PASS AC-002-07 — traced to a test
PASS AC-002-08 — traced to a test
PASS AC-002-09 — traced to a test
PASS AC-002-10 — traced to a test
PASS AC-002-11 — traced to a test
PASS AC-002-12 — traced to a test
PASS AC-002-13 — traced to a test
PASS AC-002-14 — traced to a test
PASS AC-002-15 — traced to a test
PASS AC-002-16 — traced to a test
PASS AC-002-17 — traced to a test
PASS AC-002-18 — traced to a test
PASS AC-002-19 — traced to a test
PASS AC-002-20 — traced to a test
PASS AC-002-21 — traced to a test
PASS AC-002-22 — traced to a test
PASS AC-002-23 — traced to a test
PASS AC-002-24 — traced to a test
PASS AC-002-25 — traced to a test
PASS AC-002-26 — traced to a test
PASS AC-002-27 — traced to a test
PASS AC-002-28 — traced to a test
PASS AC-002-29 — traced to a test
PASS AC-002-30 — traced to a test
PASS AC-002-31 — traced to a test
PASS AC-002-32 — traced to a test
PASS AC-002-33 — traced to a test
PASS AC-002-34 — traced to a test
PASS AC-002-35 — traced to a test
PASS AC-002-36 — traced to a test

✔ Scenario traceability check: every scenario traced, every reference resolves.

command: npx tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-10-29T21:50:25Z

scenario traceability (2-3 digit ids): 155 scenarios, all cited, all citations resolve

All 36 live scenarios trace to a test; every test reference resolves. The
repo's own `check-scenario-traceability-3digit.ts` wrapper (155 scenarios,
which additionally covers spec 001's 3-digit IDs) is also clean.

---

## Evidence: full test suite

command: npm test
exit: 0
at: 2026-10-29T21:50:31Z

> pensions-system@0.0.0 test
> vitest run

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  60 passed (60)
      Tests  763 passed (763)
   Start at  22:50:32
   Duration  4.92s (tests 53%, import 35%, transform 10%, worker 1%)

command: npm run typecheck
exit: 0
at: 2026-10-29T21:50:40Z

> pensions-system@0.0.0 typecheck
> tsc --noEmit

command: npm run lint
exit: 0
at: 2026-10-29T21:50:40Z

> pensions-system@0.0.0 lint
> eslint .

60 files / 763 tests pass; typecheck clean; lint clean. No test skipped or
disabled. The 764→763 count is the one authorised consolidation: the AC-001-119
body was rewritten in place (see the T4 spot check below), not a deleted guard.

---

## Evidence: complexity gate

command: npm run lint
exit: 0
at: 2026-10-29T21:50:40Z

> pensions-system@0.0.0 lint
> eslint .

The repo's authoritative complexity gate is ESLint `complexity: ['error', 6]`
(`eslint.config.mjs`, unchanged) run as `npm run lint`. Exit 0 = no function
exceeds 6. The `check-code-principles.sh` heuristic complexity gate, scoped to
the changed files, agrees (0 FAIL — see the design-principles block).

---

## Evidence: design-principles gate

The design-principles script was run more than one way, because the task's
known-tooling-facts warning is accurate: the all-gates invocation SIGPIPEs at
the DRY gate, and the whole-tree scan includes `.next/` (compiled output) and
`.standards/` (the submodule). Each invocation's command and exit code is
recorded verbatim; the classification of each finding is stated plainly.

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates complexity
exit: 0
at: 2026-10-29T21:51:15Z

Checking design principles in: . (tier: production)
PASS Complexity/KISS (java): no violations found

✔ Design-principles check (gates: complexity): 0 FAIL(s), 0 WARN(s).

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates yagni
exit: 0
at: 2026-10-29T21:51:16Z

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected
✔ Design-principles check (gates: yagni): 0 FAIL(s), 0 WARN(s).

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates solid
exit: 0
at: 2026-10-29T21:51:17Z

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
PASS SOLID-OCP (java): no large type-dispatch chains
PASS SOLID-OCP (go): no large type-dispatch chains
PASS SOLID-OCP (node): no large type-dispatch chains
PASS SOLID-LSP (java): no heavy instanceof dispatch
PASS SOLID-ISP (java): no fat interfaces
PASS SOLID-ISP (node): no fat interfaces
PASS SOLID-DIP (java): no domain→infrastructure imports
PASS SOLID-DIP (go): no domain→infrastructure imports
PASS SOLID-DIP (node): no domain→infrastructure imports
PASS SOLID-DIP (python): no domain→infrastructure imports
PASS SOLID-DIP (rust): no domain→infrastructure imports
✔ Design-principles check (gates: solid): 0 FAIL(s), 0 WARN(s).

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates component-per-file
exit: 0
at: 2026-10-29T21:51:18Z

--- Component-per-file ---
PASS Component-per-file: no violations
✔ Design-principles check (gates: component-per-file): 0 FAIL(s), 0 WARN(s).

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates property-tests
exit: 0
at: 2026-10-29T21:51:18Z

--- Property tests ---
PASS Property tests (java): jqwik/@Property in use
PASS Property tests (go): testing/quick in use
PASS Property tests (node): fast-check in use
✔ Design-principles check (gates: property-tests): 0 FAIL(s), 0 WARN(s).

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates dry
exit: 141
at: 2026-10-29T21:51:19Z

Checking design principles in: . (tier: production)

--- DRY ---
(then the process died — exit 141, SIGPIPE, no further output)

**Tool-defect findings — none of these are code defects:**

1. **DRY gate SIGPIPE (exit 141).** The DRY sub-pipeline is
   `… | sort -rn | head -10 > "$tmp"` (`.standards/scripts/check-code-principles.sh`
   line 709). Under `set -o pipefail`, when the whole tree yields >10 duplicate
   4-line windows, `head -10` closes the pipe and `sort` dies with SIGPIPE → the
   whole script exits 141. This kills the all-gates run *before* the FAIL-capable
   gates report. Isolated here with `--gates dry` to show the SIGPIPE is the DRY
   gate's own sub-pipeline, not a code finding. **DRY is a warn-only gate** (not in
   the default blocking set `complexity,property-tests,component-per-file`), so this
   is a submodule-script bug, not a blocking code defect.

2. **Whole-tree scan includes `.next/` and `.standards/`.** The un-pruned
   whole-tree `--gates complexity --json` run reported FAILs only in:
   `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (CC=10) and
   `./.next/server/chunks/…` (compiled Turbopack runtime, CC up to 47). **No FAIL
   landed in project source** (`web/`, `app/`, `tests/`, `scripts/`). Those two
   paths are compiled output and the submodule — not this repo's deliverable.

3. **Tier auto-detection reports `mvp`** because the script globs `AGENTS_*.md`
   and this repo's file is `AGENTS.md`. `--tier production` was passed explicitly
   (this repo's declared tier), so the property-test gate is meaningful and passed
   (fast-check in use).

**Verdict for this gate:** scoped to the changed files (`-BaseRef HEAD`), every
blocking gate — `complexity`, `component-per-file`, `property-tests` — passes
with 0 FAIL / 0 WARN; the warn-only gates `yagni` and `solid` also pass with
0 findings. The only non-zero exit is the DRY gate's SIGPIPE (tool defect,
warn-only). No FAIL lands inside project source.

---

## Evidence: scenario-to-behavior spot check

command: read tests/acceptance/{clock-unify,cta-hierarchy,first-viewport,clock,countdown}.test.ts + web/components/series/{CountdownBlock,CountdownClock}.tsx + web/components/public/Hero.tsx
exit: 0 (manual read; no command exit)
at: 2026-10-29T21:53:00Z

Four scenarios from four different tasks were read to the assertion level.

**AC-002-10 (T3, clock-unify)** — `tests/acceptance/clock-unify.test.ts`:
`it('AC-002-10: both numerals render inside the .clock container, the years first')`
asserts `numeralAt > clockAt`, `numeralAt < fieldsAt`, `unitAt` beside the numeral
and `< fieldsAt`, `daysAt > fieldsAt`; and `it('… no rule and no block boundary sits
between the two numerals')` asserts the slice between the years `</p>` and the
fields `<div>` is empty (no `<hr>`, no `countdown__rule`, `between.trim() === ''`).
This matches the scenario's "siblings inside one centred container, no rule element
and no separate block boundary between them, sub-day fields in the same group" —
**PASS, asserts what the scenario says.**

**AC-002-18 (T5, clock-recalibrate)** — `tests/acceptance/first-viewport.test.ts`:
`it('AC-002-18: every locale’s clock box stays inside the first viewport at 390x844')`
asserts `Object.keys(MEASURED_CLOCK_BY_LOCALE).sort()` equals `[...LOCALES].sort()`
and each locale's clock bottom `<= 844 - CLEARANCE` (50) and `< 844`. The table
carries five distinct rows (`es/en/de/it` 768.08, `fr` 787.52) — per-locale, not
averaged, and a missing locale fails the key-set equality. The corrected clause
("every locale's clock bottom at or above viewport − 50px") genuinely bites for all
five. The old "no locale is worse than the Spanish baseline" clause appears nowhere
in tests or web source (only in the acceptance markdown's dated correction note).
**PASS, asserts what the scenario says.**

**AC-002-31 (T7, CTA hierarchy)** — `tests/acceptance/cta-hierarchy.test.ts`:
`it('AC-002-31: the primary is a filled accent block with --on-accent ink and no
underline')` asserts `.hero__cta` declares `background: var(--accent)`,
`color: var(--on-accent)`, `text-decoration: none`, `border-radius: var(--radius)`,
`font-size: var(--text-body)`, `padding: var(--space-3) var(--space-5)`; and
`it('… only accent-coloured action above the fold')` asserts `.hero__cta-secondary`
does not resolve `var(--accent)` and no other hero-action rule uses `color:
var(--accent)`. AC-002-32/33/34/35 cover the subordinate secondary, token-only
styling, hue opt-out, and href/accessible-name preservation respectively.
**PASS, asserts what the scenario says.**

**AC-001-119 → AC-002-15 (T4, authorised rewrite)** — `tests/acceptance/clock.test.ts`:
the rewritten `it('AC-001-119: the years numeral and the day count are one group,
with no rule between them')` now asserts `rule).not.toContain('border-top')`,
`yearsNumeralAt > railAt`, `yearsNumeralAt < fieldsAt`, and `between` (numeral→fields)
contains no `<hr`/`countdown__rule`/`clock__value--days`. The ID `AC-001-119` is
preserved. A companion `it('AC-002-15: …')` reads the neighbour's body and pins the
re-pointing (not a deletion, not a weakening). **PASS, re-pointed in the positive
direction, never weakened.**

No spot-checked scenario had a test that merely carried the right ID with the wrong
assertion; all four assert the scenario's Given/When/Then.

---

## No unaccounted behavior

Skimmed the full diff. Everything traces to a task/scenario:

- `tests/helpers/colour.ts` (new) — the CIELCh/WCAG arithmetic extracted out of
  `palette-labels.test.ts` (DRY; used by `palette-accent.test.ts` and
  `tests/unit/colour-metrics.test.ts`). No math change (`lab` returns an object
  instead of a tuple, values identical).
- `tests/helpers/render-document.ts`, `tests/fixtures/series.ts` — `decodeText` /
  `countdownAt` helpers hoisted out of `clock.test.ts`.
- `tests/unit/clock-properties.test.ts`, `tests/unit/colour-metrics.test.ts` (new) —
  fast-check property tests (production-tier requirement).
- `web/components/public/Hero.tsx` — `HeroLead`/`ReadingsPanel`/`StatusPanel`/
  `subjectFactRows` extraction + the `.hero__cta-secondary` class (T7).
- `web/components/series/CountdownBlock.tsx` / `CountdownClock.tsx` — the merged
  group (T3) + `NotCrossed`/`ThresholdYearLine`/… extractions.
- `tests/acceptance/{gitignore,hero-copy,palette-accent,clock-unify,cta-hierarchy}.test.ts`
  (new) — T1, T6, T2, T3, T7 acceptance coverage.

No orphan logic. No helper unaccounted for.

## Specific claims the prior stages reported (re-verified)

1. **`npm run build` really ran the prebuild gates.** `npm run prebuild` output names
   all four: `verify-derived.ts` ("derived figures verified: 7 (2 computed, 5
   unavailable)"; "derived series verified: 2"), `check-content-scope.ts` ("country
   scope gate: clean (5 locales)"), `check-public-vocabulary.ts` ("public vocabulary
   gate: clean (5 locales)"), `check-scenario-traceability-3digit.ts` ("155 scenarios,
   all cited, all citations resolve"). Exit 0. `npm run build` then runs `next build`
   to a clean compile (exit 0; 3 pre-existing Turbopack `series-store.ts` filesystem
   warnings, not from this spec's files).

2. **No gate/budget/threshold/config modified.** `git diff` for `web/content/budgets.ts`,
   `web/content/registry.ts`, `web/content/keys.ts`, `scripts/**`,
   `eslint.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `package.json`,
   `next.config.ts` — all UNCHANGED.

3. **Assertion changes within the authorised set.** The five modified acceptance files
   are `clock`, `countdown`, `first-viewport`, `content-locale`, `palette-labels`.
   - `clock.test.ts`: AC-001-119 rewritten (new structure), AC-001-111 hairline
     re-pointed to `.toEqual([])` with span assertions kept; IDs preserved.
   - `countdown.test.ts`: AC-001-99 slice re-pointed (`html.indexOf('countdown__value')`
     instead of the projection-group slice), invariant (no sub-annual unit) kept.
   - `first-viewport.test.ts`: `MEASURED_CLOCK` re-recorded, `MEASURED_CLOCK_BY_LOCALE`
     added, AC-001-107 hairline proxy re-pointed to `margin-top: var(--space-4)` +
     `.clock__value--days/--sub` font-size declarations; the three AC-001-107
     thresholds (`clock[1] ≤ viewport`, `≤ viewport − 50`, no shrink/no hide) unchanged.
   - `content-locale.test.ts`: `MEASURED` re-recorded to `es 34 [533,535] / en 39
     [504,642] / fr 38 [578,565] / de 39 [635,515] / it 36 [544,543]`, 667px column and
     two-line invariant intact (AC-002-36).
   - `palette-labels.test.ts`: colour helpers moved to `tests/helpers/colour.ts`
     (identical arithmetic); `lab()[0]` → `lab().lightness`. No assertion weakened.
   **No assertion was deleted or made vacuous.** The one measured-number change
   (`toBeCloseTo(310,1)` → `toBeCloseTo(343.17,1)`) is exactly what AC-002-21 authorises
   ("only the measured numbers change").

4. **AC-002-18 dropped clause gone, replacement enforced.** "no locale is worse than
   the Spanish baseline" appears nowhere in tests/web (only the dated correction note
   in the acceptance markdown). The replacement — per-locale table, each locale's
   bottom `<= viewport − 50px` at 390×844 — is asserted by `AC-002-18` over all five
   locales and fails if any locale is absent (key-set equality with `LOCALES`).

5. **`countdown.*` register intact.** `tests/acceptance/countdown.test.ts` (register-
   rules describe block) still bans urgency vocabulary (`faltan/quedan/solo/apenas/
   cuenta atrás/bomba/explota`), `!`, `\bya\b`, and per-locale second person over every
   `countdown.*` string (plus an extended `countdown.clock.*` ban). JSON diffs touch
   only `hero.*`; `countdown.eyebrow` is unchanged in all five locales.

6. **Zero-JS on the public home page.** No new `'use client'` in the hero/clock tree —
   `CountdownClock.tsx`'s `'use client'` is pre-existing (`git show HEAD` confirms);
   `Hero.tsx`/`CountdownBlock.tsx` remain server components. The clock writes four
   fields through refs, no `useState`, no `setInterval` (asserted by AC-002-14).

7. **Token discipline.** `grep` for `#[0-9a-f]{3,8} | \d+px | rgba?(` in the changed
   components (`Hero.tsx`, `CountdownBlock.tsx`, `CountdownClock.tsx`) finds only a
   prose comment ("1px rule"). No literal colour/spacing/size in code.

8. **Key parity / budgets.** 248 keys in all five locales (AC-002-24). Statement
   lengths: es 34, en 39, fr 38, de 39, it 36 — all within `budgets.ts` (42/46/52/55/50)
   (AC-002-23). Every `hero.statement` names its country (`España/Spain/Espagne/
   Spanien/Spagna`) (AC-002-22).

9. **`.gitignore` (T1).** Adds `reports/` and `runs.jsonl` only; both now ignored
   (`git check-ignore` exit 0); no pre-existing entry removed.

---

## Overall verdict

All five contract checks ran and produced no code findings:

1. scenario traceability — PASS (exit 0, both scripts)
2. full test suite — PASS (npm test 0, typecheck 0, lint 0)
3. complexity gate — PASS (ESLint complexity ≤ 6, exit 0)
4. design-principles gate — PASS for changed files (0 FAIL in every blocking gate,
   scoped; the only non-zero exit is the submodule script's DRY SIGPIPE, warn-only)
5. scenario-to-behavior spot check — PASS (4 scenarios, assertions match)

The DRY-gate SIGPIPE (exit 141), the `.next/`/`.standards/` whole-tree noise, and the
`mvp` tier auto-detection are all submodule-script defects, recorded above and flagged
to the Architect as review hints — none is a code defect and none is a blocking FAIL.

**VERDICT: PASS**

---

## Evidence: phase-2 CI round 1

command: gh pr checks 9 --json name,state,bucket,workflow,link
exit: 0
at: 2026-10-29T22:14:16Z

Head SHA checks ran against: 7160df18020dd8e7ccf580b60e754a44075f0ec6
(`spec/002-hero-conversion`, PR #9, draft; SPEC_PHASE2_RETRIES=0)

Per-check outcome (bucket is the PASS/FAIL parse rule):

| check | state | bucket | verdict | workflow |
|---|---|---|---|---|
| frontend-ci / Lint & Format | SUCCESS | pass | PASS | CI |
| frontend-ci / Unit Tests | SUCCESS | pass | PASS | CI |
| frontend-ci / Build | SUCCESS | pass | PASS | CI |
| frontend-ci / Docker Build & Push | SKIPPED | skipping | PASS (skipped, not a failure) | CI |
| Vercel Preview Comments | SUCCESS | pass | PASS | — |
| Vercel | SUCCESS | pass | PASS | — |

No check is `fail`. No failing check IDs captured; no job logs read.

Notes:

- `frontend-ci / Build` was `QUEUED`/`IN_PROGRESS` on first query and reached
  terminal `SUCCESS` (`pass`) after a bounded poll (2 re-queries, ~15s apart).
- `frontend-ci / Docker Build & Push` is `SKIPPED` (bucket `skipping`). A skipped
  check is neither a pass nor a fail and carries no finding here; it is a draft-PR /
  push-condition skip, not a code failure.
- The Vercel preview and its comments check are both `pass` — the deploy lane
  (phase 3) is green at the PR-head level; no phase-2 code failure and no
  phase-3 lane failure to route.
- Known non-failing items confirmed absent from this run's failure set: the DRY
  sub-pipeline SIGPIPE (exit 141, warn-only) and the `CountdownClock.tsx` 60.53%
  mutation score are not surfaced by CI, and the `first-viewport.test.ts:161`
  two-statements-on-one-line cosmetic defect does not fail ESLint/tsc (consistent
  with prior phase-1 finding — recorded, not a CI failure).

Routing: none required — zero failing checks.

**PHASE-2 ROUND 1: PASS**
