# 004-plain-countdown — tasks (stage 1)

Source: `specs/004-plain-countdown/00-informal.md`. Scope is fixed by the five decisions in that
document's §Decisiones ya tomadas; none of them is re-opened here.

This spec is a **recomposition** of the public page, not a CSS patch. It replaces the page's
top-of-page composition with a five-step story, moves the pyramid into the story as its
explanation, collapses three paraphrases of the target date into one plain sentence, relocates the
methodological precision below the fold, removes the figures that have no value, and removes the
structural cause of the empty column.

## Reading order

| # | Task | Why it is here |
|---|---|---|
| T1 | The five-step contract and the top-of-page order | the order every other task plugs into |
| T2 | Step 1 — the number, in plain words | the page's hook |
| T3 | Step 2 — what breaks, one plain line | the hook's consequence |
| T4 | Step 3 — the pyramid moves up and is annotated | "la pirámide manda aquí" |
| T5 | Step 4 — the fuse as a simple percentage | "cuánto camino llevamos" |
| T6 | Step 5 — what it means, and the one action | the page's ask |
| T7 | One plain sentence for the target date | the three paraphrases collapse |
| T8 | The methodological precision relocates into `#metodo` | precision is kept, not deleted |
| T9 | The plain-language gate | makes "no jargon at the top" checkable |
| T10 | Unavailable figures leave the public page | "si no hay número, no hay bloque" |
| T11 | Figures 3–7 are tracked in admin | the tracking the spec asks for |
| T12 | The hero/band composition is retired | the structural cause of the empty column |
| T13 | No empty column at any width, in any locale | the reported defect |
| T14 | Each of the five steps fits one screen | the "cada paso cabe en una pantalla" clause |
| T15 | Visual identity preserved | the instrument must survive |
| T16 | Locale parity for the new and retired keys | five locales, no exception |
| T17 | Retire the layout pins of 001–003, keep the rest | the inherited-criteria work |

T1 is a prerequisite for T2–T6. T7 depends on T2/T8. T12 must land before T13 can be measured
honestly. T17 depends on every other task having decided its final composition.

---

## T1 — The five-step contract and the top-of-page order

One declaration holds the page's five steps, in order, with one id and one anchor each. The page's
lead is composed from that declaration, so the order exists in exactly one place and no component
can disagree with it.

Acceptance criteria:

- A module `web/components/public/top-steps.ts` exports `TOP_STEPS`, a `readonly` array of exactly
  five entries, in this order, with these ids: `number`, `breakage`, `why`, `distance`, `meaning`.
- Each entry exposes a stable `id` (used as the DOM id of its section, prefixed `paso-`) and a
  `headingKey` that resolves from the content model (no literal string in the module).
- `web/components/PublicPage.tsx` renders the five step sections in `TOP_STEPS` order, immediately
  after `<main id="main">` opens.
- No element that is not one of the five step sections renders between `<main>` and the end of the
  fifth step. Specifically absent from that range: `SourceStrip`, any `ProvenanceStrip` (any
  `data-operator="true"` subtree), any `MetricPlate`, `RegisterKey`, and `ReproduceBlock`.
- Each step section is a `<section>` with `aria-labelledby` pointing at its own `<h2>`, and the five
  `<h2>` ids are unique on the page.
- The five step sections are the only elements carrying `data-top-step` on the page.
- Nothing on the page renders before the first step except `site-header` page chrome and the
  existing stale-snapshot banner (`.banner`) — page chrome is not a step.

## T2 — Step 1: the number, in plain words

Step 1 states the wait as one number and one plain sentence. It carries no methodological
footnote, no variant range, no source line and no back-cast.

Acceptance criteria:

- Step 1's day count is read from the committed `countdown` series value (`days` is computed by
  `CountdownClock` from `countdown.anchor` at the render instant, as today); no day count is
  authored or re-derived from a second source.
- Step 1's visible text, with `data-operator="true"` subtrees stripped, consists of exactly: the
  years numeral and its unit, the day count and its label, the three sub-day fields with their
  labels, one plain sentence, and the step's `<h2>`. Nothing else.
- The page's only `<h1>` renders inside step 1, above the day-count group, and its text still
  contains the locale's country name (preserved `AC-001-103` / `AC-002-22`).
- The day numeral keeps the ladder's top step (`--text-num-xl`), and it is the largest numeral on
  the page (preserved `AC-003-02`, `AC-003-03`).
- Step 1 renders none of these content keys: `countdown.definition`, `countdown.range`,
  `countdown.source`, `countdown.backCast`, `countdown.yearLabel`, `countdown.clock.definition`,
  `countdown.clock.arithmetic`.
- When the countdown series is not `computed` (no threshold year, no anchor), step 1 renders the
  plain sentence and no day count, no clock group and no substitute number; the other four steps
  keep their order and no step renders empty (preserved `AC-001-101`, `AC-001-110`).

## T3 — Step 2: what breaks, one plain line

One sentence, in plain words, states the threshold. It is bound to the shared parameter, never
typed.

Acceptance criteria:

- Step 2's markup contains exactly one text block (one `<p>`), resolved from a content key.
- That key's template carries the threshold and the base as placeholders (`{threshold}`, `{base}`),
  resolved from `COUNTDOWN_THRESHOLD` and `100` — not from a literal in the copy.
- The line contains no repository identifier and passes T9's plain-language gate.
- The 50-per-100 statement appears exactly once inside the five steps' visible text (step 2); no
  other step restates it as a number.
- Step 2 renders no chart, no figure, no provenance and no link.

## T4 — Step 3: the pyramid moves up and is annotated

The age structure becomes the page's explanation: it is the third of the five steps, it carries an
annotation that says what to look at, and it loses the four-percentage headline sentence from its
face.

Acceptance criteria:

- The `#demografia` section renders as the third step, after step 2 and before step 4 and
  `#figuras`.
- The step's `<h2>` contains no `%` sign, and the block between the `<h2>` and the first panel
  contains no more than one `%` sign.
- `demography.finding` is not rendered between the step's `<h2>` and the first panel. It renders
  collapsed, inside the step's data-table disclosure, below the panels.
- The six-value readout (`demography__readout`) is not rendered between the `<h2>` and the panels;
  it renders collapsed inside the same disclosure.
- Each of the three panels renders exactly one annotation element (three annotations in total),
  from a content key, naming an age band by its published band label (a value from
  `bandLabel` / `AGE_BANDS`). Annotations are plain sentences and pass T9's gate.
- The `<svg>` panels keep their accessible name and `role="img"` per panel, and the data table is
  still emitted by the same component as the charts (preserved `AC-001-44`, `AC-001-45`,
  `AC-001-97`).
- The pyramids' `ProvenanceStrip` is not inside step 3; it renders inside `#metodo` (T8).
- When the `pyramid` series is not `computed`, step 3 renders nothing at all (no heading, no
  "unavailable" row) and the remaining steps keep their relative order.

## T5 — Step 4: the fuse as a simple percentage

The fuse keeps its drawing and states one thing on its face: how much of the way is gone.

Acceptance criteria:

- Step 4's face label is resolved from a content key whose template contains exactly one
  placeholder, `{percent}`, and no other placeholder. No `{ratio}`, `{year}` or `{threshold}`.
- The rendered label's text contains the whole-percent value computed by `displayPercent` /
  `formatWholePercent` from the committed fuse value, and no other numeral.
- `fuse.label` (the technical label carrying ratio, year and threshold) and `fuse.definition` (which
  names `demo_pjan`) render only inside `#metodo`, never inside step 4.
- The drawn geometry is unchanged: the same `viewBox`, the same cord/burnt rects computed from
  `burnPoint(consumedPercent)`, the `<svg>` still `aria-hidden` with `focusable="false"`.
- The graphic still carries no `role="progressbar"`, no value attribute, no date, and does not move
  while the clock ticks (preserved `AC-003-21`).
- When the `fuse` series has no computed value, step 4 renders nothing and the remaining steps keep
  their relative order (preserved `AC-003-18`).
- The reproduce link (`fuse.reproduce`) does not render inside step 4; `#reproducir` stays
  reachable from `#metodo`.

## T6 — Step 5: what it means, and the one action

The last step is one sentence and one button.

Acceptance criteria:

- Step 5 contains exactly one `<p>` and exactly one `<a>`.
- That anchor's visible text is the `hero.ctaPrimary` string and its `href` is `#figuras`
  (preserved `AC-002-35`).
- That anchor is the only `--accent`-filled action above the fold (preserved `AC-002-31`).
- Step 5 is the fifth and last of the five steps.
- The share row (`ShareRow`) renders after the fifth step, not inside any step, and is present in
  the server HTML and usable without JavaScript (preserved `AC-003-23`).
- `hero.ctaSecondary` / `hero.ctaMethod` still render somewhere on the page with `href="#metodo"`
  (preserved `AC-002-35`'s target); they do not render inside steps 1–5.

## T7 — One plain sentence for the target date

The three paraphrases become one.

Acceptance criteria:

- Within the five steps' visible text (text nodes only, `data-operator="true"` stripped), the
  formatted anchor date (as produced by `formatDate(countdown.anchor, locale, CLOCK_TIME_ZONE)`)
  occurs exactly once.
- The keys `countdown.clock.definition` and `countdown.clock.arithmetic` are not rendered inside
  the five steps, in any locale.
- `countdown.definition` is not rendered inside the five steps.
- The clock group's accessible name (`countdown.clock.a11y`) states the target date in plain words:
  it contains the formatted date, does not contain the string `fecha convencional` (or its
  equivalents in the other four locales), and does not contain the word for "umbral"/"threshold".
- The date occurrence counted above is inside the same step as the day count (step 1), and no other
  step names the date.

## T8 — The methodological precision relocates into `#metodo`

Everything the top drops is still on the page, below the fold, in one region.

Acceptance criteria:

- `#metodo` resolves to a region that renders, in every locale: `countdown.definition`,
  `countdown.yearLabel`, `countdown.range` (when the value publishes a range), `countdown.source`,
  `countdown.backCast` (when the value publishes one), `countdown.clock.definition`,
  `countdown.clock.arithmetic`, `countdown.eyebrow`, `fuse.label`, `fuse.definition`, and the
  provenance strips of the pyramid and the fuse.
- `#metodo` also still contains the register key (`RegisterKey`), so the existing heading it
  provides is unchanged and `AC-001-91` still resolves.
- Every in-page reference to `#metodo` resolves to an existing element id in the rendered document:
  the four `nav.*` anchors, `hero.ctaSecondary`, `hero.ctaMethod`, and any `figure.methodLink`
  remaining on the page.
- The `#metodo` region renders after the fifth step in document order.
- The strings appear verbatim from the content model — the same keys, the same interpolations, no
  paraphrase and no summarising rewrite.
- `demography.finding` and the six-value readout are reachable on the page (inside step 3's
  disclosure per T4) — nothing from `00-informal.md`'s "no se borra" list is lost.

## T9 — The plain-language gate

"No jargon at the top" becomes a build gate, not a review habit.

Acceptance criteria:

- `web/build/public-plain-language.ts` exports a `BANNED_TOP_TERMS` list and a
  `scanTopRegion(html, locale)` function that strips `data-operator="true"` subtrees (reusing
  `stripOperatorSubtrees`) before scanning text nodes **and** `aria-label` / `alt` / `title`
  attribute values.
- `BANNED_TOP_TERMS` covers, in all five locales, at minimum: the "dependency ratio" phrase
  (`ratio de dependencia`, `dependency ratio`, `ratio de dépendance`, `Altersquotient` /
  `Abhängigkeitsquotient`, `rapporto di dipendenza`), the four dataset identifiers `demo_pjan`,
  `ESSPROS`, `spr_exp_pens`, `proj_23np`, and the series-name phrases `proyecciones demográficas`
  plus its four translations.
- The scan also rejects every identifier returned by `internalTermsOf(figures, series)`, so a new
  source or formula id cannot leak by being absent from the hand-written list.
- A build step (`npm run check:plain-language`, wired into `npm run build`) runs the scan against
  the rendered top region of every locale and exits non-zero on any hit.
- The gate exits 1 on a fixture page whose top region carries a banned term, and exits 0 on the
  shipped page in all five locales.
- The gate does not scan `#metodo`, the registers, or any `data-operator="true"` subtree.

## T10 — Unavailable figures leave the public page

No figure without a value appears on the public page.

Acceptance criteria:

- With the committed data (`fig-01`/`fig-02` computed, `fig-03`…`fig-07` `unavailable`), the
  rendered page contains none of: `figure.unavailable.chip`, `figure.unavailable.reason`, any
  `fig.0N.reason`, `pending.heading.one`, `pending.heading.other`, `figure.statusSummary`.
- `#figuras` renders exactly the figures whose `availability === 'computed'`, in `FIGURE_IDS` order.
- `web/components/PendingBlock.tsx` is deleted and no module imports it. `FigureStatusRow` is
  **kept**: `PlateShell` still renders it for a figure that claims `computed` but is promoted to
  `withheld` by `figureState` — that is a data-integrity failure mode, not an unavailable figure,
  and hiding it would silently drop a figure the data says is computed.
- A figure whose `availability` is not `computed` never reaches `#figuras`, so no
  `figure.unavailable.*` or `figure.withheld.*` string renders for the five committed placeholder
  figures.
- `pending.heading.one` and `pending.heading.other` are removed from `REQUIRED_KEYS` and from all
  five locale documents; `figure.unavailable.*` keys stay in `REQUIRED_KEYS` only if something still
  renders them (a series' unavailable state may), otherwise they are removed too.
- With every figure computed (a fixture), `#figuras` renders all seven plates and no other block.
- With zero figures computed (a fixture), the page renders with no `#figuras` content and no empty
  block or heading, and no other region is affected.
- Each rendered plate keeps its chart+table pairing and its provenance (preserved `AC-001-97`,
  `AC-001-105`).

## T11 — Figures 3–7 are tracked in admin

The figures that no longer appear in public are still visible to the operator.

Acceptance criteria:

- The admin panel home (`app/(admin)/admin/(authed)/page.tsx`) renders a per-figure list: one row
  per figure in `FIGURE_IDS` order, carrying the figure id and its `availability`.
- The list is read from the same derived store the panel already reads
  (`createFileDerivedStore().readAll()`); no figure id, count or availability is hard-coded in the
  admin view.
- The list renders all seven figures, including the five `unavailable` ones, and the row count
  equals the derived store's length.
- The list's strings come from `adminT` (the admin content model), not from a literal in the view.
- The admin list is not linked to, referenced by, or rendered on any public route.

## T12 — The hero/band composition is retired

The empty column's structural cause is removed, not edged around.

Acceptance criteria:

- No element on the page carries the class `band` or `hero--band`.
- The rules `.hero--band`, `.band`, `.hero--band > .hero__panel` and
  `.hero--band > .hero__status` are removed from `web/styles/globals.css`; no remaining rule
  declares `grid-column: 2`.
- `web/components/series/CountdownBand.tsx` and `web/components/public/HeroLeadBlock.tsx` are
  deleted or reduced to a module no page composes; the page has exactly one lead path.
- The figure plates (`MetricPlate` for `fig-01`, `fig-02`) render inside `#figuras` only.
- The lead block's provenance facts (`hero.definitionLabel`, `hero.periodLabel`,
  `provenance.source`, `provenance.dataset`) do not render inside the five steps; they render inside
  `#figuras` beside the plate they belong to.
- `web/components/public/Hero.tsx` and `web/components/public/hero-subject.ts` are removed if the
  five-step lead replaces them entirely, or reduced to what `#figuras` still needs; no dead export
  remains (the design-principles gate's dead-code and pass-through heuristics stay clean).
- The page still renders with zero series and zero computed figures without throwing.

## T13 — No empty column at any width 320–1440 px, in any locale

Acceptance criteria:

- In a real Chromium (the existing CDP harness, `tests/helpers/chromium.ts`), for every element
  inside `<main>` whose computed `display` is `grid` and whose resolved `grid-template-columns`
  yields two or more tracks: **no track of width ≥ 8 px is unoccupied**, where unoccupied means no
  in-flow direct child's horizontal bounding box intersects that track's range.
- That assertion passes at widths 320, 360, 390, 768, 1024, 1280, 1366 and 1440 px, each at
  900 px height, in all five locales.
- `document.documentElement.scrollWidth` does not exceed the viewport width at 320 px, in all five
  locales.
- No element inside `<main>` has a computed width of 0 while containing text (a collapsed column
  that is not a deliberate `display: none` disclosure summary).
- The specific retired shape cannot return: no stylesheet rule places a sole child of a
  multi-column grid into a column other than the first, asserted structurally against
  `globals.css`.
- The measured evidence (per width, per locale, the number of grid containers scanned and the
  unoccupied-track count, which must be 0) is printed by the test on failure.

## T14 — Each of the five steps fits one screen

Acceptance criteria:

- In a real Chromium, each of the five step sections' `getBoundingClientRect().height` is less than
  or equal to the viewport height, at each of the three measured viewports the suite already uses:
  390×844, 1366×768 and 1440×900.
- That holds in all five locales.
- Step 3's height is recorded explicitly per locale per viewport (it is the tallest step, and its
  record is the one that catches a regression).
- A closed `details` inside a step counts as its closed height; opening it is not required and no
  step is allowed to hide content to meet the bound (no `display: none` on step content, no
  `overflow: hidden` with a fixed height).
- Steps 1–5 all measure greater than 0.

## T15 — Visual identity preserved

Acceptance criteria:

- Every colour, font-family, font-size, spacing, radius and shadow token in
  `web/styles/tokens.css` keeps its current value in both themes: `--surface-1..3`,
  `--surface-hero`, `--ink-1..3`, `--rule-1/2`, `--accent`, `--on-accent`, `--data-*`,
  `--radius: 0`, `--shadow: none`, `--font-*`, `--text-*`, `--space-*`.
- No rules are added that introduce a new hue: the CSS contains no new `color`/`background`
  declaration whose value is a literal hex, `rgb()`, `hsl()` or named colour outside
  `tokens.css`.
- `--radius` is still `0`, and no new rule declares a non-zero `border-radius` or a `box-shadow`
  other than `none`.
- The 1px rule convention survives: `--border-hair` is still `1px solid var(--rule-1)` and the new
  step section boundaries use it (no heavier separator is introduced).
- The olive/amber relationship is unchanged: `--accent` is still the olive, `--data-projection` is
  still the amber alias set, and no new colour token is added.
- The new CSS declares no literal: every `font-size`, `margin`, `padding`, `gap`, `color` and
  `background` in the new rules resolves a `var(--…)` token.

## T16 — Locale parity for the new and retired keys

Acceptance criteria:

- `REQUIRED_KEYS` is updated with every key T1–T8 introduces and without every key they retire.
- All five locale documents (`es`, `en`, `fr`, `de`, `it`) carry exactly the same key set as
  `REQUIRED_KEYS`: `missingKeys` returns `[]` and `unknownKeys` returns `[]` for each.
- No locale carries a key another locale does not (no asymmetric addition, no asymmetric
  retirement).
- Every new key's value is non-blank in all five locales, and each locale's new values are written
  in that locale's language (not copied Spanish).
- The five public routes still prerender and each document's `<html lang>` matches its locale
  (preserved `AC-003-44`).
- `AC-002-24`'s "exactly 270 keys / no key added, removed or renamed" freeze is superseded: the
  parity rule above replaces it, and its test asserts parity rather than a frozen count.

## T17 — Retire the layout pins of 001–003, keep the rest

The inherited acceptance criteria are split by a stated rule, not by convenience.

**Rule.** A criterion is **retired** when its substance is *where something sits / how tall it is /
in which order it renders / which grid holds it / which fold edge it clears*. A criterion is
**preserved** when its substance is *a value, an accuracy property, an accessibility property, a
traceability property or a reproducibility property*. A criterion is **superseded** when its
substance is preserved but its subject (the band, the pending block, the inline provenance) no
longer exists.

**Retired** (no test may cite these ids after this spec): `AC-001-107`, `AC-002-09`, `AC-002-10`,
`AC-002-11`, `AC-002-12`, `AC-002-16`, `AC-002-18`, `AC-002-19`, `AC-002-20`, `AC-002-21`,
`AC-002-29`, `AC-002-30`, `AC-002-36`, `AC-003-01`, `AC-003-06`, `AC-003-10`, `AC-003-48`,
`AC-003-49`, `AC-003-50`.

**Superseded** (subject removed; substance carried by this spec's scenarios): `AC-002-24` (key
freeze → T16), `AC-003-39`, `AC-003-40`, `AC-003-42` (pending block → T10), `AC-003-51` (inline
collapse → T8).

**Re-pointed, not retired** (the criterion stands; the element it names moved): `AC-001-111`
(no-JS completeness — the centring clause inside it is dropped with `AC-002-16`), `AC-002-31`,
`AC-002-32`, `AC-002-35` (CTA hierarchy → step 5), `AC-003-02`, `AC-003-03`, `AC-003-04`
(numeral hierarchy → step 1), `AC-003-05` (anchor + both disclosures retained → they render in
`#metodo`), `AC-003-09` (clock behaviour unchanged, re-read as unchanged by *this* recomposition
rather than by the band), `AC-003-28` (copy-link still writes the canonical URL, now from the
share row that follows step 5).

**Preserved unchanged**: everything else, and in particular the accuracy, accessibility,
traceability and reproducibility criteria — all of `AC-001-01`…`-10`, `-11`…`-32`, `-33`…`-35`,
`-37`…`-45`, `-46`…`-73`, `-74`…`-78`, `-81`, `-91`, `-92`, `-97`, `-98`…`-101`, `-102`…`-106`,
`-108`…`-110`, `-112`…`-117`, and `AC-002-01`…`-08`, `-13`, `-14`, `-15`, `-17`, `-22`, `-23`,
`-25`…`-28`, `-33`, `-34`, `AC-003-07`, `-08`, `-11`…`-38`, `-41`, `-43`…`-47`.

Acceptance criteria:

- No test file in `tests/` cites a retired id. `grep -rn 'AC-001-107\|AC-002-09\|…' tests/`
  returns nothing for every id in the retired list.
- Every preserved id still has at least one test citing it, and that test passes.
- `scripts/check-scenario-traceability.sh` exits 0: every `AC-004-*` id is cited by a test, every
  citation resolves, and no retired id is cited.
- `tests/acceptance/first-viewport.test.ts` no longer asserts the retired geometry constants
  (`436.52`, `613.28`, `--measure-face: 17.5rem`, the 50 px clearance table, the "exactly 270 keys"
  count); its surviving describes are re-pointed to preserved ids or removed with the id they
  carried.
- `tests/acceptance/countdown-band.test.ts` and `tests/acceptance/countdown-band-browser.test.ts`
  are split: the describes for retired ids are removed, the describes for re-pointed ids are
  rewritten against the new composition and keep their id.
- `tests/acceptance/pending.test.ts` is deleted with `AC-003-39`/`-40`/`-42`; the assertions it
  carried that survive (computed plates keep their order and provenance) move to the `#figuras`
  test under a preserved or new id.
- No gate configuration is changed to make any of this pass: `--measure-face` and the other fold
  tokens may change their *value* with a recorded re-measurement, but no contrast, complexity,
  coverage or mutation threshold is lowered.

## Scenario index

Seventy-nine scenarios, `AC-004-01` … `AC-004-79`, defined in `20-acceptance/` (one file per
task).

| Task | File | Scenarios |
|---|---|---|
| T1 | `AC-004-five-step-order.md` | 01–05 |
| T2 | `AC-004-number-step.md` | 06–09 |
| T3 | `AC-004-breakage-step.md` | 10–12 |
| T4 | `AC-004-pyramid-step.md` | 13–19 |
| T5 | `AC-004-fuse-step.md` | 20–23 |
| T6 | `AC-004-meaning-step.md` | 24–28 |
| T7 | `AC-004-one-date.md` | 29–32 |
| T8 | `AC-004-method-below-fold.md` | 33–37 |
| T9 | `AC-004-plain-language-gate.md` | 38–41 |
| T10 | `AC-004-unavailable-figures-hidden.md` | 42–46 |
| T11 | `AC-004-admin-figure-tracking.md` | 47–49 |
| T12 | `AC-004-hero-retired.md` | 50–54 |
| T13 | `AC-004-no-empty-columns.md` | 55–59 |
| T14 | `AC-004-one-screen-per-step.md` | 60–63 |
| T15 | `AC-004-visual-identity.md` | 64–68 |
| T16 | `AC-004-locale-parity.md` | 69–73 |
| T17 | `AC-004-retired-criteria.md` | 74–79 |

---

## Open questions

None of these blocks `/build` — each carries a stated default that satisfies every constraint in
`00-informal.md`, and each should be confirmed at the human gate.

1. **Where the `<h1>` lives among the five steps.** "Nada más arriba del pliegue que estos cinco"
   and "the page keeps exactly one `<h1>` naming the country" (`AC-001-103`, `AC-002-22`) collide
   if the `<h1>` is a sixth element. **Default taken:** the `<h1>` is step 1's own heading, directly
   above the day-count group, so it is inside the five rather than above them.
2. **Whether the clock's years numeral and sub-day fields stay inside step 1.** The five steps name
   only `Faltan 5 539 días`. **Default taken:** they stay (nothing in the informal spec removes
   them; removing the current clock would be a new requirement), with the years numeral and the
   four fields inside step 1's number group and all methodological prose removed from it.
3. **"la mecha como barra simple"** — a new graphic or a simpler label? **Default taken:** the
   drawing is unchanged (it already reads as a bar at 62 %) and the *label* simplifies to the whole
   percent; the `role="progressbar"` ban of `AC-003-21` is preserved.
4. **Where the share row goes**, given the fold holds only the five steps. **Default taken:**
   directly after step 5, still in the server HTML and usable without JavaScript.
5. **What `#metodo` now means.** It currently points at `RegisterKey`. **Default taken:** `#metodo`
   becomes the region that opens with the relocated methodological precision and still contains the
   register key, so every existing in-page reference keeps resolving.
6. **What "one screen" means for T14.** **Default taken:** the three viewports the acceptance suite
   already measures — 390×844, 1366×768, 1440×900.

## Out of scope

- Any change to what the countdown counts to (1 January 2042) or to any derived value, manifest,
  source or formula.
- Any change to the admin security model, the audit log, or the revision workflow.
- Any new language, and any translation of existing copy beyond what the new plain-language keys
  require.
- Deleting the method, sources, four-voice, debate or assumptions content. It is reordered and
  collapsed, never removed.
- Retiring `AC-002-31`…`-35` (CTA hierarchy) — the hierarchy survives at step 5.
