# 002-hero-conversion — task list

Four surface changes (plus the CTA hierarchy the evidence also calls for), one
measurement recalibration, one prose rewrite, one encoding-test rewrite. Numbered in
implementation dependency order: T4 and T5 both depend on T3 (they measure and
re-assert the unified clock's new structure); T7 depends on T2 (the hierarchy must
hold against the raised accent); the rest are independent.

Every task below encodes gate-enforced constraints as acceptance criteria. A task
that cannot meet a constraint must fail the pipeline, never edit the gate, the
budget, the threshold, or the test expectation to make it pass. "Fix the code,
never the threshold" is load-bearing throughout this spec.

Resolutions already settled with the user, recorded here so a later run cannot
drift back:

- **`countdown.*` register — layout yes, vocabulary no.** The unified centred
  clock aesthetic is approved (layout), but every `countdown.*` string keeps its
  factual register. The ban in `tests/acceptance/countdown.test.ts` (urgency
  vocabulary, `!`, `ya`, second person) is not touched. Copy work is confined to
  `hero.*`.
- **`AC-001-119` is rewritten, with explicit authorization.** Its two assertions
  encode the decision this spec reverts; they are rewritten with the ID preserved,
  and the PR body records which assertion changed and why.

---

## T1 — Close the pipeline scratch in `.gitignore`

The working tree currently accumulates pipeline scratch (`reports/`, `runs.jsonl`)
that is not ignored. Add both to `.gitignore`; change nothing else.

**Acceptance criteria**
- `.gitignore` gains an entry that ignores the `reports/` directory (a trailing-slash
  directory entry, matching the file's existing convention for directories).
- `.gitignore` gains an entry that ignores the `runs.jsonl` file (a bare filename
  entry, matching the existing convention for files).
- No pre-existing entry (`node_modules/`, `.next/`, `out/`, `coverage/`, `*.tsbuildinfo`,
  `.envrc`, `.env`, `.env.local`, `data/pending/*.json`, `data/proposals/*.json`,
  `.vitest/`, `.stryker-tmp/`, `.playwright-mcp/`) is removed, reordered, or altered.
- With the change applied, a `reports/` directory and a `runs.jsonl` file at the repo
  root are ignored by git (`git status` shows neither as untracked).

---

## T2 — Saturated accent (light and dark), contrast pairs recomputed

Raise the saturation of `--accent` in both themes, keeping the warm-paper identity
intact, and recompute the contrast pairs the accent participates in. No white
background, no radius change, no shadows.

**Acceptance criteria**
- `--accent` in `:root` (light) is replaced with a new literal hex whose CIELCh chroma
  (the measure already used by `tests/acceptance/palette-labels.test.ts`) is strictly
  greater than the current `#425425`. The dark `--accent` is replaced with a value whose
  chroma is strictly greater than `#9cc17f`.
- The accent stays in the olive/green family: its CIELCh hue angle does not move to one
  of the comparable pages' accents (red `#CE261E`, teal `#05576B`, blue `#0061C8`). The
  permitted hue drift is **±8°** in each theme, and it must **not** move toward the ochre
  `--data-projection`. Reason: AC-001-117 requires a hue gap greater than 20° from
  `--data-projection`, and the light accent sits only ~37° from it — a drift past ~17°
  toward the ochre fails that gate, so ±8° is the design's safe band, preferring a small
  move *away* from the ochre (hue slightly up). The design's recommended targets are
  `#3b5512` (light, H≈122) and `#91c46d` (dark, H≈130), chroma band light C*40–44 / dark
  C*46–52, each with chroma strictly greater than today's value (both themes).
- The warm-paper grounds are unchanged: `--surface-1`, `--surface-2`, `--surface-3`,
  `--surface-hero`, the ink ladder and the rule tokens keep their current literal values
  (light and dark). No `#ffffff` / `#FFFFFF` ground is introduced.
- `--radius: 0` and `--shadow: none` are unchanged.
- Contrast pairs are recomputed and still meet their minimums, both themes (verified by
  the existing AC-001-117 test, which is not relaxed): `accent on surface-1/2/3/hero`
  ≥ 4.5:1, `on-accent on accent` ≥ 4.5:1. `--on-accent` is **verified** against the new
  accent (recomputed only if the pair fails; the design prefers it unchanged when it
  holds — it holds at ≥7.0 / ≥9.0 with the recommended pair).
- The accent remains one of exactly three chromatic hues (chroma > 20) with a hue gap
  > 20° from `--data-projection` and `--data-deficit` — the AC-001-117 "exactly three
  chromatic hues" invariant still passes.
- No literal colour is introduced in `web/components` or `web/series` (AC-001-117's
  "no component carries a literal colour" watch item still holds).

---

## T3 — Unify the years numeral with the day/hour/minute/second row into one centred group

This is the documented reversal. `CountdownBlock.tsx` currently asserts the 1px rule
(`.clock { border-top: var(--border-hair) }`) exists "to keep the years numeral and the
day count out of one typographic group, so a reader is never invited to divide one by
the other." The user has chosen to reverse that: the separator goes, the years numeral
and the day count become one centred group, and the risk the rule mitigated is accepted
and written down — never silently deleted.

**Acceptance criteria**
- `web/styles/globals.css`: the `.clock` rule no longer declares `border-top`
  (`border-top: var(--border-hair)` is removed — the 1px separator between the
  projection block and the clock rail is gone).
- In the rendered markup (computed state), the years numeral (`countdown__numeral`,
  with its unit label `countdown__unit`) and the day value (`clock__value--days`, with
  its `clock__label`) are siblings inside one centred container, with no rule and no
  separate block boundary between them. The sub-day fields (hours/minutes/seconds) keep
  sitting in the same group.
- The merged group is centred: it inherits the existing centred axis (`.countdown {
  text-align: center; justify-items: center }`) and no left-aligning declaration
  (`text-align: left/start`, `justify-*: left/start`, `margin-left: 0`) is introduced
  for it.
- `CountdownBlock.tsx`'s documentation prose is rewritten: it no longer asserts the 1px
  rule keeps the two numerals apart; it states the separator has been removed, the two
  numerals now form a single centred group, and the risk that a reader could divide
  years by days is accepted. The prose must not continue to assert the opposite.
- The projection block's remaining content is preserved: the threshold year line
  (`countdown__year-line`), the definition, the variant range, the source, and the
  back-cast sentence still render in the computed state. (The years numeral leaves the
  projection block — that is the change.)
- Invariants do not regress (each covered by an existing acceptance test, none relaxed):
  - "no anchor, no clock" — the merged group renders only when the countdown is
    `computed`; the not-crossed state renders no years numeral and no clock.
  - The anchor date stays visible as text.
  - The clock never states the threshold has been crossed (the elapsed sentence is
    preserved; no "crossed/validated/reached" language is introduced).
  - The home page stays zero-JS: the clock remains server-rendered complete, writes the
    four animated fields through refs (no React state), and owns a single timer.
- The years quantity keeps its unit label and carries no sub-annual unit; the day and
  sub-day fields keep their labels. This is a regrouping, not a renaming or a re-derivation.

The tests that currently encode the old layout are rewritten in T4, not here.

---

## T4 — Rewrite the five assertions that encode the old layout (depends on T3)

Five assertion sites encode "the years numeral is a separate projection block above the
clock rail, behind a 1px rule" — exactly the decision this spec reverts. They are
rewritten to assert the new structure, with their IDs preserved, and the PR body records
what changed. Per `docs/TESTING.md` §"Tests That Encode a Defect", this is the authorized
procedure for a behavior change, never a silent edit to make a suite green.

The five sites, flagged so the human gate sees exactly which assertions change:

1. **AC-001-119** — `tests/acceptance/clock.test.ts`, the `it` "the projection group and
   the clock rail are separated by a 1px rule": `expect(rule).toContain('border-top:
   var(--border-hair)')` and `expect(block.slice(yearsNumeralAt, railAt)).not.toContain(
   'clock__fields')` are rewritten to assert the separator is gone and the two numerals
   **are** in one group. ID `AC-001-119` preserved. (Authorized by the user — resolution 2.)
2. **AC-001-111 — hairline `it`** — `tests/acceptance/clock.test.ts` (~line 866),
   `expect(declared('.clock', 'border-top')).toEqual(['var(--border-hair)'])` inside
   "the threshold rule and the rail hairline still span the whole face": the `border-top`
   assertion is removed and re-pointed. **Invariant to survive:** the threshold rule still
   spans the face (`justify-self: stretch`, `height: var(--rule-projection)` on
   `.countdown__rule`) and `.clock` still spans the face via `justify-self: stretch` — the
   span is carried by the grid stretch, not by the removed hairline. The check is not
   replaced with a weaker "still spans" claim that is now false. ID `AC-001-111` preserved.
3. **AC-001-111 — face-list coverage** — `tests/acceptance/clock.test.ts`, the
   "every element the face renders is one this contract covers" `it`: the `FACE_ELEMENTS`
   list **may legitimately stay unchanged** (the merge keeps every class — `countdown__value`,
   `countdown__numeral`, `countdown__unit` and the clock classes all still render, only
   their container changes). If a class leaves or joins, add or remove only that class. If
   the list is left untouched, the commit body says so — a reviewed-and-unchanged list and
   a forgotten list look identical in a diff. The centring invariant is **not** relaxed:
   centred grid (not a flex row), no left-aligning declaration, prose centred in
   `--measure-face`. ID `AC-001-111` preserved.
4. **AC-001-99** — `tests/acceptance/countdown.test.ts`, "both integers are printed beside
   the number…": the projection-group slice `projectionGroup = html.slice(0,
   html.indexOf('class="clock"'))` is re-pointed so the invariant it actually protects
   still holds — the years quantity (wherever it now renders) carries no sub-annual unit
   (`día/mes/hora/minuto/segundo` and their plural forms). ID `AC-001-99` preserved.
5. **AC-001-107** — `tests/acceptance/first-viewport.test.ts` (~line 185),
   `expect(CSS.slice(CSS.indexOf('.clock {')).toContain('var(--border-hair)')` inside
   "nothing on the way is shrunk or hidden to make room": the `var(--border-hair)` proxy
   is re-pointed to a declaration of `.clock` that still exists after the separator is
   removed. **Invariant to survive:** the `.clock` rule is still declared at its own type
   scale in the desktop sheet and not overridden at the mobile breakpoint (no
   `display: none`, no `font-size`, no `.clock` in the mobile query). Never deleted
   outright. ID `AC-001-107` preserved.

- The change record for this task (commit body and/or PR body) states which assertion
  changed and why, for every site above, citing `docs/TESTING.md` §Tests That Encode a
  Defect.
- New acceptance tests cite `AC-002-15`, `AC-002-16`, `AC-002-17`, `AC-002-29` and
  `AC-002-30`, so `scripts/check-scenario-traceability` stays green.
- No other test is modified to make anything pass; the five sites above are the only
  test-expectation changes, and each reflects the reversal rather than relaxing a gate.

## T5 — Re-measure the unified clock and recalibrate the fold tokens (depends on T3)

Unifying the years numeral with the day row changes the block's height, so the
first-viewport guarantee (AC-001-107) must be re-verified against the real, built app
in Chromium — not by eye — and the three fold tokens plus the measurement table updated
with the new figures.

**Acceptance criteria**
- `--measure-face`, `--clock-sub-col`, and `--clock-days-min` in `web/styles/tokens.css`
  are recalibrated to values measured in Chromium against the built app (`npm run build`,
  `next start`), at 390×844, in all five locales, such that the clock's bottom edge is at
  or above `viewport height − 50px` in every one of the five locales, and the per-locale
  clearance table is recorded (so a regression in any one locale is visible, not averaged
  away). [Corrected 2026-10-29: the earlier clause "no locale is worse than the Spanish
  baseline" was written from a false premise — the shipped Revision-4 record already had
  `fr 35.5` vs `es 54.9`. Spec-002 measurement: es/en/de/it 75.92px, fr 56.48px clearance;
  the clock is 343.17px in all five, and French's extra `--text-micro` line sits in the
  projection block above the clock, not in the clock.]
- The `--measure-face` comment in `tokens.css` is rewritten to record the new measured
  clearance table (per-locale clearance vs. measure, and the binding constraint), with
  the measurement date, exactly as the current comment does.
- `tests/acceptance/first-viewport.test.ts`'s `MEASURED_CLOCK` table (and the prose table
  above it) is updated with the newly measured `clock` and `fields` ranges for 390×844,
  and the recorded 360×640 / 1366×768 rows are re-measured or re-recorded as the same
  "recorded, not asserted" rows.
- The AC-001-107 assertions are not relaxed: the "whole clock box inside the first
  viewport" check, the `clock[1] ≤ viewport − 50` clearance margin, and the "no shrink /
  no hide to make room" assertions keep their exact thresholds. Only the measured
  numbers change, and only to values backed by the recorded Chromium measurement.

---

## T6 — Conversion-register copy for the hero, in all five locales (`hero.*` only)

Rewrite the hero's conversion surface in second-person, one-idea-per-sentence register,
subject to the three named gates. The `<h1>` budget, the country-name requirement, and
key parity are build gates, not guidelines: a sentence that does not fit is rewritten,
never truncated and never set smaller, and no budget is raised. Copy work is confined
to `hero.*`; every `countdown.*` string keeps its factual register.

**Acceptance criteria**
- Each locale's `hero.statement` names its country — it contains that locale's
  `countryName` (`España` / `Spain` / `Espagne` / `Spanien` / `Spagna`) — so
  `scripts/check-content-scope.ts` stays green.
- Each locale's `hero.statement` fits its budget (`web/content/budgets.ts`): `es ≤ 42`,
  `en ≤ 46`, `fr ≤ 52`, `de ≤ 55`, `it ≤ 50`, measured as `statement.length`.
- All five locales keep key parity: each `strings` object still has exactly 248 keys, with
  no missing and no unknown keys — `web/content/registry.ts` stays green. Only `hero.*`
  string values change; no key is added or removed.
- The `hero.statement`, `hero.sub` and `hero.ctaPrimary` strings are rewritten into the
  conversion register: second-person address and a single idea each (direction, not final
  wording: `es` `La pensión que te espera en España` / `Cuánto, cuándo y con qué fórmula.
  Compruébalo tú.` / `Ver cuánto te queda`). `hero.ctaSecondary` may stay as-is or follow
  the same register.
- Every `countdown.*` string is unchanged — in particular `countdown.eyebrow` stays
  `Proyección central · Eurostat` (and its translations), never adopting second person or
  urgency. The ban in `tests/acceptance/countdown.test.ts` (urgency vocabulary, `!`,
  `ya`, second person) stays green on every `countdown.*` string.
- The copy introduces no factual assertion that requires a citation: the `hero.*` strings
  make no new quantity, source, or institution claim. The `editorial` object
  (`agreement` / `disputes` / `thesis`) and the `countdown.clock.*` / `fig.*` strings are
  not modified by this task.
- No gate is modified to make the copy pass: `budgets.ts`, `registry.ts`, `keys.ts`,
  `check-content-scope.ts`, `check-public-vocabulary.ts`, and every acceptance test keeps
  its current contents — with one declared exception: `tests/acceptance/content-locale.test.ts`
  (the re-recording below). Only the five JSON files' `hero.*` values change.
- `tests/acceptance/content-locale.test.ts` — the `MEASURED` record and the prose table
  above it are re-recorded from a real measurement at 1280×800, under the same conditions
  as the record it replaces, because T6 rewrites `hero.statement` in all five locales while
  that file pins the statement's measured character count and per-line widths. The new
  record is `es 34 chars [533,535]`, `en 39 [504,642]`, `fr 38 [578,565]`, `de 39 [635,515]`,
  `it 36 [544,543]`. What must survive: every statement still sets in exactly two lines
  inside the 667px column, and no entry in `web/content/budgets.ts` is widened to fit.
  **This site was changed before it was authorized** — the Coder modified it on an
  authorization that did not exist, and the human ratified the substance retroactively on
  2026-10-29 as a mandatory consequence of this task. The trail records the order of
  events; it does not imply the change was planned.

---

## T7 — CTA hierarchy: one dominant primary, one subordinate secondary (depends on T2)

The brief's evidence names two attraction levers — a more saturated accent, and one
dominant CTA. Only the accent got a task. Today both hero actions inherit the global
`a { color: var(--accent) }`, so raising the accent's chroma makes the secondary action
*louder*, not quieter. This task fixes the hierarchy in CSS; copy wording belongs to T6
and is not touched here.

**Acceptance criteria**
- One visually dominant primary action: the primary (`.hero__cta`) is a filled `--accent`
  block with `--on-accent` ink, no underline, `--radius: 0`, `--text-body`, and the
  existing `--space-3`/`--space-5` padding. It is the only accent-coloured action above
  the fold, and its label must not wrap in any locale (no two-line CTA).
- One clearly subordinate secondary action: the secondary is a text link in `--ink-2`
  with a visible 1px underline, no fill, no accent colour, at `--text-body-lg` or
  `--text-body` — never larger than the primary.
- Token-only styling: every colour, size, spacing and radius in the CTA rules resolves a
  token (`--accent`, `--on-accent`, `--ink-2`, `--text-body`, `--text-body-lg`,
  `--space-*`, `--radius`); no literal hex/rgba/px appears in those rules (AC-001-117's
  no-literal watch item).
- The secondary no longer competes on hue: the secondary link's colour is not `--accent`,
  so T2's accent rise leaves its prominence unchanged. The accent does one job above the
  fold — the primary CTA's material.
- Both links keep their existing href targets and accessible names: the numeric tier's
  primary targets `#figuras` and its secondary `#metodo`; the proposition tier's primary
  targets `#metodo` and its secondary `#figuras`. Each link's visible text is unchanged
  and remains its accessible name.
- A11y: the secondary keeps a visible underline so affordance never rests on colour
  alone; the primary keeps `--on-accent` contrast ≥ 4.5:1 against the accent and a
  visible focus ring (`--focus` + `--focus-offset`) outside the filled box.
- No motion: no hover grow, no underline animation, no arrow slide.
- This task changes `web/styles/globals.css` only; if a class name is needed on the
  secondary link, that markup change preserves the href and the accessible name. It does
  not modify any JSON content or string.

## Open questions (non-blocking, carried from the owner's brief)

1. How far can the accent's saturation rise before the site reads as a partisan medium
   rather than an instrument? The limit is not measurable by a gate.
2. The day the projection is revised, does the conversion register survive a threshold
   that moves away? No new sentence may depend on the number staying fixed.
