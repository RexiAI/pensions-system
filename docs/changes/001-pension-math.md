# 001-pension-math

> Spec pipeline archive. Original source: `specs/001-pension-math/` (deleted by this script).
> Archived: 2026-10-26

## Original ask

# 00 — Informal spec: pension-math

## What I want

A multilingual public website that calculates, from official Spanish public data, what
the contributory pension system actually is: money in from today's workers, money out
to today's pensioners, no dedicated capital fund behind it, and a liability that is not
funded by anything.

The site does not assert that. It **shows the arithmetic** and lets a reader check it.

Spain first. The structure must accept other countries later — each country has its own
pension architecture and its own official statistics office, so the country is data, not
code.

The argument the site makes, in plain terms: a pay-as-you-go scheme pays today's
pensioners out of today's contributions. That works only while the number of contributors
grows. When it stops growing, the scheme needs either higher contributions, lower
pensions, a transfer from general taxation, or debt. Every one of those is observable in
the official numbers, and the projections say the contributor base shrinks.

## What the site must NOT do

This matters as much as the rest of the spec.

- **Do not state as fact that the system is a legally defined fraud or a legally defined
  pyramid scheme.** It is neither, in law. The site presents the chain-letter *structure*
  as a computed finding and the "fraud" reading as a thesis, clearly labelled, in its own
  section. The two must never be visually merged into one assertion.
- **Do not invent quotes, papers, numbers, or attributions.** Every named person's claim
  is quoted verbatim from a cited source, or that person does not appear.
- **Do not present a contested framing as consensus.** Where economists disagree, both
  positions appear with citations.
- **Do not hide assumptions.** Discount rate, cohort definitions, data vintages, and
  revision dates are visible next to the numbers they affect.
- **No number appears on the page that a reader cannot reproduce** from a named official
  source via a committed script.

The reason is not caution for its own sake. A site that overstates gets dismissed in one
sentence by any economist who reads it. A site that understates its claim but shows the
arithmetic cannot be dismissed, because the reader does the concluding themselves.

## The five numbers

Rough definitions — the formalised tasks will pin exact formulas, and each needs its
source series and its edge cases resolved there.

1. **Dependency.** Contributory pensioners divided by contributing affiliates. Monthly.
   Shows the ratio moving the wrong way over decades.

2. **Contribution cover.** Social contributions divided by contributory pension
   expenditure. Below 1 means the gap is filled from somewhere else — taxation or debt.
   This is the number that makes "funded by current inflows" concrete.

3. **Cohort return.** For a representative contributor in a given cohort, the internal
   rate of return on what they pay in versus what they draw out, using average
   contribution, average pension, and life expectancy at retirement from official
   mortality tables. This is the honest version of the "you get back more than you paid"
   claim that circulates informally — it becomes an output with a sensitivity band instead
   of an assertion.

4. **Implicit debt.** Present value of accrued pension obligations minus the assets the
   system actually holds. The present value depends on a discount rate, so publish a
   range — 1%, 2%, 3%, 4% — and never a single headline number.

5. **Required base growth.** If the scheme pays each cohort a return above the growth of
   the wage bill, the contributor base must expand at that rate indefinitely to stay
   solvent. Compare the required rate against the growth official population projections
   actually imply. Required far above available is the formal statement of the thesis.
   This is the load-bearing calculation; the others support it.

## Data

Official sources only: INE (population projections, mortality tables, labour force
survey), Seguridad Social (affiliation, pension payroll), IGAE (system accounts), Banco
de España, Eurostat (ESSPROS pension expenditure — also the multi-country path), AIReF
projections, Fondo de Reserva balance.

The INE JSON API and the Eurostat dissemination API are both confirmed reachable.

Every derived figure carries provenance: source URL, fetch timestamp, formula identifier,
and a hash of the input snapshot. Changing an input must change the hash and surface the
delta in review.

## Languages

Spanish primary, plus English, French, German, Italian. Five locales at launch. The
pension content differs per country; the interface does not.

## Shape

A public marketing-grade site — it has to be attractive, fast, and pleasant to click
through, because nobody reads an argument they bounced off. Charts are the content, not
decoration: each figure is interactive, each has its source and its "reproduce this"
link.

Behind it, a thin content API keyed by country and locale, so adding a country is adding
data. Frontend on Vercel through Git integration — no CLI deploys, ever.

Computation runs at build time into committed derived JSON, not in a serverless function.
Vercel's limits aside, committed output is diffable, reviewable, and reproducible by a
skeptic, which is the whole point.

## Quality bar

`production` tier. There is a computational core now, and silent arithmetic error would
discredit every claim on the site. Mutation testing on the calculation functions,
property tests on the invariants (accounting identities reconcile against published
totals; rates stay in range; ordering properties hold across cohorts). An ingest that
fails to fetch must fail loudly rather than silently serve a stale or partial snapshot.

## Open questions

- Which exact INE series codes back each metric — resolve during formalisation.
- The "inmigración no arregla la sostenibilidad" claim needs its own data basis before it
  can appear; do not assume it.
- Whether a country switcher ships in v1 with Spain-only data, or waits for a second
  country.
- Exact scope of the "what economists agree on / what is disputed" section — it needs to
  be short enough to read and complete enough to be fair.

## Tasks

# 10 — Tasks: pension-math

Formalisation of `00-informal.md`. Project: greenfield TypeScript monorepo, Next.js on
Vercel (Vercel Git integration only — never `vercel deploy`). Computation is precomputed
at build time into committed derived JSON under `data/derived/`. Conformance tier
`production`: mutation testing and property tests are in scope for the calculation layer.

Task numbering `T1`…`T19`. Each task is a coherent unit (one value object, one operation,
one behavior). Each carries: a one-line goal, input dependencies, a pointer to its
acceptance file, and checkable acceptance criteria. Scenario IDs are globally unique
`AC-001-NN` across the whole spec (see `20-acceptance/`).

---

## T1 — Derived-figure manifest (provenance record + reproduce path)

**Goal.** Define the `Manifest` value object that every derived figure carries, so no
number renders without provenance and a reproduce path.

**Inputs.** None (foundational value object).

**Acceptance file.** `20-acceptance/AC-001-manifest.md`

**Acceptance criteria.**
- A `Manifest` has exactly these required fields, each non-empty when serialised:
  - `sourceUrl`: one or more named official source URLs (string array, ≥1 entry).
  - `fetchedAt`: ISO-8601 UTC timestamp (string matching `YYYY-MM-DDTHH:MM:SSZ`).
  - `formulaId`: a stable identifier drawn from a fixed, documented set (not free text).
  - `definitionId`: a stable identifier naming exactly which published definition produced the
    value, drawn from the same fixed documented set of definitions (not free text).
  - `inputHash`: hex digest (string, fixed length) of the raw ingested input snapshot bytes.
  - `reproducePath`: a repo-relative path to the committed script that reproduces the figure.

- Every figure entry in `data/derived/*.json` additionally carries an `availability` field
  (a sibling of `manifest`, not a manifest field) with exactly two values:
  - `computed`: the figure has a computed headline value and a complete, valid manifest; it
    renders as a full plate (caption, readout, chart, table, provenance strip).
  - `unavailable`: the figure has never been computed in this deployment (its source series is
    not yet specified or resolved); it carries no headline value, renders no chart and no table,
    renders as a ledger row, and is never labelled current.
- `availability` invariants (no loophole): a figure marked `computed` without a complete manifest
  fails validation; a figure marked `unavailable` that carries a headline value fails validation.
  `unavailable` is a state of "no value exists", never a path to publish a value without a
  manifest or citation.
- The hash is computed over the exact input snapshot bytes, not a derived value; two
  different input snapshots never yield the same hash (collision is a test failure for the
  fixtures used).
- Every entry in `data/derived/*.json` carries a manifest object; a figure with a missing
  or empty required field fails validation (rejected, not silently accepted).
- `reproducePath` must resolve to a file committed in the repo (validation checks existence).
- `formulaId` is validated against the documented set; an unknown id fails validation.
- Every derived-figure entry carries a `definitionId` and a published `definition` string; the
  manifest records which `definitionId` produced the value, so two numbers computed on different
  definitions can never be compared without the difference being visible.
- `definitionId` is validated against the documented set; an unknown id fails validation, and a
  figure whose `definition` string does not match the definition its `definitionId` names fails
  validation.
- The `definition` string is instrument vocabulary (what is counted, what is excluded), never
  thesis vocabulary: it carries no adjectives and no conclusion — "fraud", "pyramid",
  "insostenible", "injusto", and like terms are not permitted in a definition string.
- A figure published via an admin-approved revision (T14) carries a manifest of the same
  shape; there is no publication path (build-time or revision) that emits a figure without
  a manifest.

---

## T2 — Build-time ingest & computation harness (fail-loud, committed derived JSON)

**Goal.** Fetch official source data at build time and write committed derived JSON; a
failed or partial ingest fails the build loudly and never renders stale/partial data as
current.

**Inputs.** T1 (manifests attach to every emitted figure).

**Acceptance file.** `20-acceptance/AC-001-ingest.md`

**Acceptance criteria.**
- The compute step runs at build time (a committed script), reads source data, and writes
  derived JSON under `data/derived/`.
- Exit code is `0` only when every required source resolved successfully; any fetch failure
  or unresolvable source yields a non-zero exit.
- A partial ingest (some sources resolved, some failed) is treated as failure: the build
  fails loudly and does **not** emit a figure marked "current" that lacks its inputs.

- A figure explicitly marked `availability: 'unavailable'` in the committed derived data is a
  valid published data state, distinct from a fetch failure: it does not trigger the
  fetch-failure path, the build exits `0` for it, and the figure is never labelled current. A
  required source that failed to fetch still fails the build (non-zero exit) regardless of any
  `unavailable` marker on an unrelated figure.
- Stale data is never rendered as current: a snapshot whose `fetchedAt` is older than the
  configured freshness window is treated as a failure (non-zero exit), not silently reused.
- Derived JSON is committed and diffable (plain JSON, deterministic key order).
- Machine-readable sources (v1): INE `tempus3` JSON API and Eurostat dissemination API
  (`spr_exp_pens`). Banco de España, IGAE, Seguridad Social, and AIReF are **document/manual**
  sources for v1 — ingested as a committed snapshot file, not assumed to have a live API.
  Each metric task states which source class it uses.
- The compute step is a single committed script with two triggers: (1) at build time, and
  (2) on admin-triggered dispatch via a GitHub Actions workflow (T14). The dispatch path
  writes a **pending revision** and never overwrites published `data/derived/` directly.
- The international path takes `geo` (country code) as a data parameter to source resolution and
  computation; computing a second country is a data/config change (a new `geo` value plus its
  sources), never a new code path. v1 publishes only `geo = ES`; a non-`ES` geo is not silently
  rendered or assumed.
- Cross-country honesty: when a second country is configured, a definition whose source exists
  for one country but not another renders `availability: 'unavailable'` for the country where the
  source is absent. The `definitionId` is unchanged, so the reader sees that this country has no
  value for that exact definition — never a silently different definition substituted for it.
- The pyramid's ingest is part of this harness: `demo_pjan` (actual, ES) and `proj_23np`
  (projected, ES) are machine-readable Eurostat dissemination-API sources, fetched live like
  `spr_exp_pens`. The two datasets encode the open-ended age band differently (`Y_OPEN` vs
  `Y_GE100`); both resolve by label, never by a hardcoded code. A failed fetch of either fails
  the build (AC-001-05/06 unchanged; no new artefact may publish `unavailable` to dodge a fetch
  failure).
- The pyramid's derived file is written to `data/derived/series/` (a subdirectory), not
  `data/derived/`, so the flat derived-figure loader does not parse it as a metric figure
  (AC-001-96).

---

## T3 — Dependency ratio (metric 1, two labelled definitions)

**Goal.** Publish two dependency figures side by side with their definitions visible: an
internationally comparable one (computable today from Eurostat) and a national Spanish
contributory one (unavailable until its exact table is captured). They measure different
concepts and are never merged into one number.

**Inputs.** T2 (beneficiary and employment counts, committed snapshot).

**Acceptance file.** `20-acceptance/AC-001-dependency-ratio.md`

**Acceptance criteria.**
- Figure 1 — international, `computed`: **"Ratio de dependencia — beneficiarios de pensiones de
  vejez por persona ocupada"**. Formula `old_age_pension_beneficiaries / employed_persons`, per
  year.
  - `old_age_pension_beneficiaries` = Eurostat `spr_pns_ben`, filtered to pension type *old age*,
    headcount. `employed_persons` = Eurostat `lfsi_emp_a`, annual employment.
  - Definition (instrument vocabulary): counts old-age pension beneficiaries; excludes survivor
    and disability beneficiaries from the numerator and non-employed persons from the denominator.
  - Source class: **Eurostat, machine-verified**. Rounding: 2 decimal places.
- Figure 2 — national, `unavailable` in v1: **"Ratio de dependencia contributiva"**. Formula
  `contributory_pensioners / contributing_affiliates`, per calendar month.
  - `contributory_pensioners` = pensiones contributivas en vigor, all types (jubilación, viudedad,
    incapacidad, orfandad), Spain. `contributing_affiliates` = afiliados a la Seguridad Social en
    alta, total, Spain.
  - Definition (instrument vocabulary): counts all contributory pensioners; excludes
    non-contributory pensions.
  - Source class: **Seguridad Social, document/manual** (committed snapshot; exact series codes are
    an open question). Rounding: 2 decimal places.
- The two figures are **not variants of one number**: they measure different concepts
  (beneficiaries ≠ contributory pensioners; employed persons ≠ affiliates). Each carries its own
  `definitionId`, label, and definition string; rendering them as one merged value is rejected.
- Edge cases apply to each figure independently (both are ratios): `denominator == 0` →
  `undefined` (serialised as `null`, never `Infinity` or `NaN`); `numerator == 0` → `0.00`;
  both zero → `undefined`.
- Invariants for property tests: each ratio is never negative for valid inputs; monotonic
  increasing in the numerator (denominator held constant) and monotonic decreasing in the
  denominator (numerator held constant).

---
## T4 — Contribution cover (metric 2, two labelled definitions — not variants)

**Goal.** Publish two distinct figures because the internationally available quantity and the
national quantity measure different concepts and must never be presented as variants of one
number: Figure 1 is pension expenditure as % of GDP (international, computable now); Figure 2
is contributions ÷ expenditure (national, unavailable).

**Inputs.** T2 (expenditure figures).

**Acceptance file.** `20-acceptance/AC-001-contribution-cover.md`

**Acceptance criteria.**
- Figure 1 — international, `computed`: **"Gasto público en pensiones (% del PIB)"**. Formula
  `pension_expenditure / GDP × 100`, from Eurostat `spr_exp_pens` in the %-of-GDP unit
  (machine-verified). Definition (instrument vocabulary): counts total public pension expenditure
  as a share of GDP; excludes non-pension social expenditure. Rounding: 2 decimal places.
- Figure 2 — national, `unavailable` in v1: **"Cobertura de las cotizaciones"**. Formula
  `social_contributions / contributory_pension_expenditure`.
  - `social_contributions` = total social contributions funding contributory pensions (IGAE system
    accounts; **document/manual for v1**).
  - `contributory_pension_expenditure` = contributory pension expenditure (IGAE as manual
    fallback). No ESSPROS contributions/receipts series exists (`spr_rec_pens` returns 404), so
    this figure has no international computation.
  - Definition (instrument vocabulary): counts social contributions divided by contributory
    pension expenditure; excludes transfers from general taxation and debt.
  - Semantics: `cover < 1` → gap (shortfall filled from taxation/debt, computed as
    `expenditure − contributions > 0`); `cover == 1` → break-even; `cover > 1` → surplus.
    Rounding: 2 decimal places.
- **Explicitly not a two-variant figure**: % of GDP is an effort measure and says nothing about
  whether contributions cover the bill; contributions ÷ expenditure is a coverage measure.
  Collapsing them into one number would imply comparability that does not exist. Each carries its
  own `definitionId`, label, and definition string; rendering them as one merged value is
  rejected.
- Edge cases (Figure 2; Figure 1 also rejects `GDP == 0` as `undefined`): `expenditure == 0` →
  `undefined`; `contributions == 0` → `0.00`; both zero → `undefined`.
- Invariants: `cover` is never negative for valid inputs; monotonic increasing in contributions,
  monotonic decreasing in expenditure.

---
## T5 — Cohort return, IRR (metric 3)

**Goal.** Compute the internal rate of return of contributions paid in vs benefits drawn out
for a representative cohort, published with a sensitivity band.

**Inputs.** T2 (average contribution, average pension, life expectancy at retirement).

**No internationally-comparable computation.** The cohort IRR needs an average *contribution*
(what a worker pays in). ESSPROS has no contributions/receipts series (`spr_rec_pens` returns
404), so there is no Eurostat source for the contribution side. The cohort return is therefore a
single national definition with no international counterpart — not a two-definition figure. Its
international rendering is `availability: 'unavailable'` with the reason "no internationally
comparable source for average contributions", never a silently different definition.

**Acceptance file.** `20-acceptance/AC-001-cohort-return.md`

**Acceptance criteria.**
- Cash-flow construction: contributions are negative for `W` years (entry age → retirement
  age), benefits positive for `R` years after retirement.
  - `W = retirementAge − entryAge` (defaults `entryAge = 25`, `retirementAge = 65`).
  - `R = lifeExpectancyAtRetirement` (years), from official INE mortality tables (INE `tempus3`,
    machine-verified).
  - Annual contribution = `12 × averageMonthlyContribution`.
  - Annual pension = `14 × averageMonthlyPension` (Spain's 14 pagas; assumption flagged below).
- IRR `r` is the annual rate solving `NPV(r) = Σ cashflow_t / (1+r)^t = 0`, found by a solver to
  an absolute NPV tolerance of `1e-6`.
- Sensitivity band: the metric returns a `[min, max]` range (plus the central value) over the
  grid: life expectancy {central, −2y, +2y}; average contribution {−10%, central, +10%};
  average pension {−10%, central, +10%}. The central value always lies within `[min, max]`.
- Edge cases: `R == 0` (life expectancy at retirement ≤ 0) → IRR `= −1` (−100%, no return);
  `contributions == 0` (no payments in) → `undefined` (no finite IRR).
- Invariants: IRR is finite and within a stated bound for valid inputs; IRR increases with
  `pension` (contributions and `R` held constant) and decreases with `contribution` (pension and
  `R` held constant); the sign change in cash flows is exactly one, so the root is unique.

- A finite negative IRR is a valid result, reported as negative: when total contributions exceed
  total benefits over the cohort's lifetime, the computed IRR is negative and is reported as a
  negative value — never clamped to zero and never reported as `undefined` (which is reserved for
  zero contributions).

---

## T6 — Implicit debt (metric 4)

**Goal.** Compute present value of accrued obligations minus system assets at discount rates
1%, 2%, 3%, 4%, always as a four-value set, never a single headline.

**Inputs.** T2 (accrued obligation stream; Fondo de Reserva balance).

**No internationally-comparable computation.** Implicit debt needs accrued pension obligations
and system assets. None of the verified Eurostat datasets (`spr_pns_ben`, `spr_exp_pens`,
`proj_23np`, `lfsi_emp_a`) carries accrued obligations or pension-fund assets, so there is no
internationally comparable implicit-debt figure. This metric is a single national definition with
no international counterpart; its international rendering is `availability: 'unavailable'` with
the reason "no internationally comparable source for accrued obligations and system assets". (The
European Commission Ageing Report would be a candidate future source; it is a document, not a
verified machine source, and out of scope for v1.)

**Acceptance file.** `20-acceptance/AC-001-implicit-debt.md`

**Acceptance criteria.**
- Formula: `implicit_debt(r) = PV(obligations, r) − system_assets`, for `r ∈ {0.01, 0.02, 0.03, 0.04}`.
- `obligations` = accrued (already-earned) pension obligations, as an annual stream
  (AIReF projections; **document/manual for v1**). `PV(obligations, r) = Σ obligation_t / (1+r)^t`.
- `system_assets` = Fondo de Reserva de la Seguridad Social balance (**document/manual for v1**);
  a point-in-time value, not discounted.
- Output is a set of exactly four values keyed by rate; there is no single-value output path.
  Expressed in euros (currency rendering follows the standards: integer minor units internally).
- Edge case: `assets > PV(obligations)` → negative implicit debt (surplus) is a valid output,
  reported as-is, never clamped to zero.
- Invariant: `implicit_debt(r)` is strictly decreasing in `r` (assets are not discounted).

---

## T7 — Required base growth (metric 5, thesis carrier)

**Goal.** Compute the contributor-base growth rate the scheme must sustain to pay the return
it promises, and compare it against the growth implied by INE population projections.

**Inputs.** T5 (real cohort return) and T2 (INE population projections).

**No internationally-comparable computation (transitive).** `g_required = r_paid_real − g_wage`
depends on the cohort return `r_paid_real` (T5), which has no internationally comparable
computation (no ESSPROS contribution series). The *projected* base growth `g_proj` is itself
internationally comparable (Eurostat `proj_23np`), but the required-growth metric cannot be
computed internationally without the return. This metric is a single national definition; its
international rendering is `availability: 'unavailable'` with the reason "depends on the cohort
return, which has no internationally comparable computation". The `g_proj` input is not published
as a substitute metric.

**Acceptance file.** `20-acceptance/AC-001-required-base-growth.md`

**Acceptance criteria.**
- Definitions (real terms, Aaron–Samuelson steady-state identity):
  - `r_paid_real` = the cohort return from T5 deflated to a real annual rate
    (`(1 + r_nominal) / (1 + π) − 1`, `π` = assumed annual inflation, stated).
  - `g_wage` = assumed annual real wage growth (stated; default `0.01`).
  - `g_proj` = annual growth rate of the contributor base implied by INE population projections
    over a stated horizon (default 2026–2070).
- Formula: `g_required = r_paid_real − g_wage`.
- Comparison: `gap = g_required − g_proj`. `gap > 0` means the base must grow faster than
  projected to sustain the paid return (the thesis); `gap ≤ 0` means projected growth suffices.
- Assumption visibility: every output value carries its `r_paid_real`, `g_wage`, `g_proj`, and
  `horizon` beside it — no hidden assumptions.
- Sensitivity band (thesis carrier — most rigorous): report `g_required` and `gap` over the
  grid `g_wage ∈ {0.00, 0.01, 0.02}` × `r_paid` from T5's sensitivity band (min/central/max).
- Edge cases: `g_proj` negative (shrinking base) → `gap = g_required − g_proj` grows (worse);
  `g_proj == 0` → `gap == g_required`.
- Invariants: `gap` increases with `r_paid_real` (everything else held) and decreases with
  `g_proj`; `gap` decreases with `g_wage`.

---

## T8 — Content model keyed by country + locale; i18n coverage; no hardcoded strings

**Goal.** Make the content API keyed by country and locale so a second country is data, not
code, with all five locales covered and zero locale-hardcoded strings.

**Inputs.** T2 (derived figures are the metric content); T1 (manifests travel with figures).

**Acceptance file.** `20-acceptance/AC-001-content-locale.md`

**Acceptance criteria.**
- Content is addressed by `(country, locale)` — e.g. `getContent(country, locale)` — with the
  metric content for a country stored as data, not in code branches.
- Supported locales are exactly `es`, `en`, `fr`, `de`, `it`; every one returns complete content
  for `ES` (no locale is silently missing).
- Requesting an unsupported locale yields a defined error (never a silent fallback to another
  language).
- No user-facing string literal appears in a component or in metric-rendering code: all
  user-facing text resolves through a locale resource key.
- Adding a second country is a data addition (a new country content entry), not a new code path;
  the same rendering code serves both countries.
- The country record gains two fields — `name` and `scopeClause` — present in every published
  locale; a country record missing either in any published locale fails the build (a content
  bug, never a silent fallback to `ES`) (AC-001-103).

---

## T9 — Citation, attribution, and contested-claim rendering

**Goal.** Guarantee that no named person/institution claim or quote renders without a
resolvable citation, and that contested claims show both positions.

**Inputs.** T8 (content model supports citation references on claims).

**Acceptance file.** `20-acceptance/AC-001-citations.md`

**Acceptance criteria.**
- A claim about a named person or institution renders only if it carries a citation reference
  that resolves, in the same rendered unit.
- A quote is stored with a source reference; rendering a quote whose source is missing or
  unresolvable does not happen (no invented quote path).
- A contested claim is a distinct content type that requires at least two positions, each with
  its own resolvable citation; rendering shows all positions, each with its citation, reachable
  from the same view.
- There is no code path that renders a named-person/institution claim or quote with a missing or
  unresolvable citation.
- The same citation validation applies to admin-produced content: a refresh (T14) or parameter
  proposal (T15) that would introduce a named-person claim without a resolvable citation is
  rejected at publication (AC-001-68).

---

## T10 — Thesis / dispute / agreement section structure

**Goal.** Structurally separate the three content sections and confine the "fraud / pyramid
scheme" reading to its designated thesis section, away from computed findings.

**Inputs.** T8, T9 (content model + citation support).

**Acceptance file.** `20-acceptance/AC-001-thesis-structure.md`

**Acceptance criteria.**
- Three structurally distinct sections exist: **agreement** (what economists agree on),
  **dispute** (contested positions), **thesis** (the site's argument).
- The "fraud / pyramid scheme" conclusion text appears only in the thesis section; the computed
  metrics' presentation never asserts it.
- Metric components have no reference to thesis content (no import/string/render of thesis
  language from within a metric component).
- Each section is its own component/content type, not a free-text blob shared with metrics.
- A section heading that names a count ("Las tres voces de esta página", "The three voices…",
  etc.) must match the number of registers actually rendered beneath it. The heading's count is
  derived from the rendered registers, never hardcoded prose: if four registers render, the
  heading says four, and a prose count that contradicts the DOM is a defect (rejected, not
  silently shipped). Enforced at render/test time as a content-count invariant.

---

## T11 — Accessibility: non-visual data for charts

**Goal.** Make every chart's data available non-visually so the argument survives a
screen reader and text-only rendering.

**Inputs.** T3–T7 (the charts) and the frontend chart components.

**Acceptance file.** `20-acceptance/AC-001-accessibility.md`

**Acceptance criteria.**
- Every chart component renders a non-visual representation of the same data (an accessible
  table, an `aria-label`/text alternative, or equivalent) alongside the visual chart.
- The non-visual representation is present in the DOM with an accessible name/role and carries
  the same values as the visual chart (no figure is visual-only).

- A table is emitted if and only if a chart is emitted: one component produces both, and there is
  no code path that renders one without the other.
- An unresolved figure (no chart — `availability: 'unavailable'` or `withheld`) emits no chart
  and no table. A screen-reader user encounters instead a level-2 heading naming the figure, one
  sentence stating it is not calculated (or not published) in this deployment, and a link to its
  methodology. That absence is deliberate — never an empty table, never an empty chart frame.

---

---

## T12 — Admin authentication

**Goal.** Authenticate a single admin identity against an env-provided password hash with a
hardened session, rate limiting, CSRF protection, and search-engine exclusion.

**Inputs.** T13 (fail-closed config is a precondition for the auth routes to exist safely).

**Acceptance file.** `20-acceptance/AC-001-admin-auth.md`

**Acceptance criteria.**
- Single admin identity; the password is verified against `ADMIN_PASSWORD_HASH` using argon2id
  (memory cost ≥ 64 MiB, `t ≥ 3`, `p = 1`, 16-byte salt, 32-byte hash). Verification is
  argon2id's constant-time verify — no early-exit string comparison anywhere.
- Session is a signed HMAC cookie with flags `HttpOnly`, `Secure`, `SameSite=Strict`; absolute
  TTL ~30 minutes.
- Rate limiting: per-IP and global. Defaults: lockout after 5 failed attempts per IP within
  15 minutes; exponential backoff doubling from 1s; global cap 100 attempts/minute (parameters
  flagged as an open question).
- CSRF: a synchronizer token per session, required as an `X-CSRF-Token` header on every
  state-changing request; a missing or mismatched token is rejected with 403.
- Admin routes return a `noindex` directive and are excluded from `sitemap.xml`.
- Admin routes are dynamic: per-request session, server-side auth check, and
  `Cache-Control: no-store` on every admin response; the public site remains statically
  generated (see AC-001-69).

---

## T13 — Fail-closed configuration

**Goal.** Guarantee that an unconfigured admin credential or session secret closes the admin
surface to 503 and never leaks secret material into any client artifact.

**Inputs.** None (configuration boundary).

**Acceptance file.** `20-acceptance/AC-001-fail-closed.md`

**Acceptance criteria.**
- When `ADMIN_PASSWORD_HASH` or the session secret is unconfigured, `/admin` and every admin API
  route return 503; there is no fall-through to open access.
- The public site has no dependency on admin configuration and renders normally when admin is
  unconfigured.
- No secret material appears in any client bundle or `NEXT_PUBLIC_*` variable (verified by a
  build-output grep gate on the client assets).
- Error bodies never echo config key names, secret values, or credential detail.
- The public site is statically generated and independent of admin; `/admin` and every
  admin route are the only dynamic routes (per-request session and server-side auth check).
- The 503 is produced by `middleware.ts` or an early return before the admin layout mounts —
  never after the app shell renders; the response body contains no operator bar, navigation,
  or session-bearing markup (see AC-001-70).

---

## T14 — Refresh trigger and pending revision

**Goal.** Let an admin trigger a deterministic refresh that recomputes into a pending
per-figure revision, publishable only by explicit approval with an audited record.

**Inputs.** T2 (the committed compute script) and T16 (audit log).

**Acceptance file.** `20-acceptance/AC-001-refresh-revision.md`

**Acceptance criteria.**
- The refresh dispatches the ingest workflow via GitHub Actions (`workflow_dispatch`), never
  serverless execution of the compute.
- The dispatched workflow re-fetches and recomputes, producing a **pending revision**: a
  per-figure diff of {old value, new value, source, timestamp, input hash}, stored separately
  from the live `data/derived/` (see open question on the pending store).
- Multiple pending revisions may coexist — one per source snapshot. A newer snapshot
  supersedes an older pending revision, which transitions to `superseded` and cannot be
  approved.
- Publication requires explicit admin approval; approval records approver identity + timestamp
  in the audit log (T16). Nothing recomputed goes live before approval.
- Idempotent: a duplicate trigger for the same source snapshot does not create a second pending
  revision.
- The review route mints a server-side `reviewToken` bound to the specific pending revision
  when it renders; approval requires that token in addition to the session and CSRF token,
  so no URL alone can publish.
- A published revision must still carry a manifest (coupling to T1): every published figure
  resolves to a manifest entry after publication.
- *Non-blocking enhancement:* an optional GitHub run-status endpoint for the refresh-in-progress
  poll; the no-JS status link remains the baseline so the panel is not dependent on it.

---

## T15 — Parameter proposals

**Goal.** Allow an LLM to propose changes to a small, typed, enumerated legal-parameter set —
each carrying a verbatim citation — accepted as a rule change that publishes nothing; figures
reach readers only via a separately-approved T14 revision. Structurally unable to touch a
derived figure.

**Inputs.** T14 (pending-revision review), T9 (citation validation).

**Acceptance file.** `20-acceptance/AC-001-parameter-proposals.md`

**Acceptance criteria.**
- The parameter set is small, typed, and enumerated: {pension payment count, retirement age,
  contribution base limits, revaluation rule}. Anything outside this set is rejected.
- An LLM step may propose changes to these parameters only; each proposal carries a verbatim
  citation to its legal or official source.
- Proposals are reviewed under their own parameter-review gate (a rule change, distinct from a
  figure revision); there is no auto-approve path.
- Accepting a proposal commits the rule change and publishes nothing (zero figure changes); the
  change reaches readers only through a subsequent recompute whose figure revision is reviewed
  and approved separately under T14.
- Hard boundary (structural, not convention): the proposal write path can only mutate an
  enumerated parameter. Parameters and derived figures are distinct types, and the proposal
  writer has no handle to any derived figure, so a proposal is structurally incapable of writing
  a computed figure.

---

## T16 — Audit log

**Goal.** Record every admin action in an append-only, tamper-evident log readable in the admin
panel, logging failed auth without the credential.

**Inputs.** T12 (admin identity), T14 (approval events), T15 (proposal events).

**Acceptance file.** `20-acceptance/AC-001-audit-log.md`

**Acceptance criteria.**
- Every admin action records: identity, timestamp, action, target, before/after, request id.
- The log is append-only by construction and tamper-evident (chained per-entry hash and/or git
  history; see open question on persistence).
- The log is readable in the admin panel.
- Failed authentication attempts are logged without the attempted credential (password or hash).


## T17 — Population age structure (the pyramid: a distinct data view, not `fig-08`)

**Goal.** Ingest `demo_pjan` and `proj_23np`, band to 21 five-year groups, compute per-sex
shares of each year's total population, select 1995/2025/2050, and publish
`data/derived/series/pyramid.json` as a distinct derived series — not one of the five metrics —
with its own manifest, source, input hash and reproduce path.

**Inputs.** T2 (both datasets ingested through the harness), T1 (the `Manifest` shape, with new
`formulaId`/`definitionId` entries added to the documented closed sets).

**Acceptance file.** `20-acceptance/AC-001-population-pyramid.md`

**Acceptance criteria.**
- Data contract: two Eurostat datasets — `demo_pjan` (Spain 1960–2025; age `Y_LT1`, `Y1`…`Y99`,
  `Y_OPEN`; sex `T`/`M`/`F`) and `proj_23np` (Spain 2022–2100; age `Y_LT1`, `Y1`…`Y99`, `Y_GE100`;
  sex `T`/`M`/`F`; `projection` ∈ {`BSL`, `LFRT`, `LMRT`, `HMIGR`, `LMIGR`, `NMIGR`}) — both
  machine-verified against the dissemination API.
- Years shown: 1995 (`observado`), 2025 (`observado`), 2050 (`proyectado`); the 2050 panel uses
  `proj_23np` `BSL` (baseline), named on the page.
- Granularity: 21 five-year bands (0–4 … 95–99, 100+). Single-year codes resolve to bands;
  the open-ended band resolves from either `Y_OPEN` or `Y_GE100` by label, never a hardcoded code
  (AC-001-93).
- Encoding: per-band, per-sex share of that year's total population, in percent — never absolute
  counts (the panels stay comparable as the population grows).
- Both sexes mirrored, one colour per panel, sex encoded by side and column header, never by hue;
  shared x axis 0–4.5% per side across all three panels; age increases upward.
- Property invariants: `M + F == T` per band/year; band shares per year sum to 100 ± 0.1; `UNK`
  excluded and the exclusion recorded in the definition string (AC-001-94).
- Provenance: carries the same `Manifest` shape, with its own `formulaId`/`definitionId` (from the
  documented closed sets), own `inputHash`, and a `reproducePath` that resolves; an unknown id
  fails validation (AC-001-95). It appears in Reproducir as its own group, distinct from the
  metric figures (AC-001-105).
- File location: written to `data/derived/series/pyramid.json`, never `data/derived/pyramid.json`,
  so the flat loader does not cast it to the closed `FigureId` union (AC-001-96).
- States: `computed` (three-panel plate) and `unavailable` (a D1 ledger row, no chart/table, one
  sentence). Never `null-value`. A failed fetch of either dataset fails the build loudly.
- Accessibility: the 21-band × 3-year × 2-sex table is emitted if and only if the chart is,
  by one component (AC-001-44/45, AC-001-97).

---

## T18 — Projected threshold crossing (the countdown, data-derived)

**Goal.** Compute the old-age dependency ratio per year from `proj_23np` `BSL`, find the first
year the ratio reaches the documented threshold, compute the countdown against the snapshot year,
and compute the crossing year across all six variants.

**Inputs.** T2 (the `proj_23np` reader), T1 (new `formulaId`/`definitionId` entries).

**Acceptance file.** `20-acceptance/AC-001-countdown.md`

**Acceptance criteria.**
- Definition: population aged 65 and over per 100 persons aged 15–64 (Eurostat's own old-age
  dependency-ratio age class), Spain, `proj_23np`, `projection = BSL`, series 2022–2100.
- The ratio is drawn entirely from `proj_23np`, including its own 2025 back-cast (31.9), never
  mixing a `demo_pjan` observation (31.2). The disclosure states the two differ and by how much.
- Threshold 50, a documented parameter (not a literal in the aggregation loop): changing it
  changes the crossing year (AC-001-98).
- `years = thresholdYear − snapshotYear`, both integers, both printed; no sub-annual unit
  (AC-001-99).
- The variant range is computed over all six variants at build time; a variant that never crosses
  inside the horizon is excluded from the range and does not fail the block (AC-001-100).
- States: `computed` (full block), `not-crossed` (no numeral, a fixed sentence, never a substitute
  threshold — AC-001-101), `unavailable`/`withheld` (block does not render; the hero falls back
  to the D2 figure ladder).
- Provenance: own manifest, own `formulaId`/`definitionId` in instrument vocabulary (no adjective,
  no conclusion — AC-001-92), own digest and reproduce path.
- Copy bans in every locale: `faltan`, `quedan`, `solo`, `apenas`, `ya`, `cuenta atrás`, `bomba`,
  `explota`, any exclamation mark, any second-person address, any future-tense verb other than the
  declarative `alcanza`/`cruza`. The number never appears in the meta description or the share card.

---

## T19 — Country scope mark (Spain only, three levels, from data)

**Goal.** Mark the Spain-only scope at three levels — first viewport, every figure, shared/social
artefacts — all derived from the country record, so a second country needs no copy edit.

**Inputs.** T8 (the country record's `name` and `scopeClause`).

**Acceptance file.** `20-acceptance/AC-001-scope-mark.md`

**Acceptance criteria.**
- Level 1 (first viewport): the `<h1>` names the scope — `hero.statement` must contain
  `country.ES.name` in every locale, a build-time validation that fails the build on mismatch
  (AC-001-103); a scope line under the `<h1>` renders `country.ES.name` (uppercase mono) plus the
  `country.ES.scopeClause`.
- Level 2 (every figure): each provenance strip gains an `Ámbito` field rendered from
  `country.ES.name`; the pyramid gets the same field; the figure-table `<caption>` also names the
  scope. `Ámbito` never renders an empty cell.
- Level 3 (shared/social): the `<title>` and `og:title` take a scope suffix from the country
  record; the share card gains the scope line (no metric, number, or date — D7 stands).
- Degradation: exactly one published geo → plain text, not a control; two or more → the country
  index (a bare `<details>`), no flags/dropdown; never a disabled or single-option control
  (AC-001-104).
- No component hardcodes a country name string (AC-001-102); failure modes are loud (AC-001-103).

---

## Revision 2 rendering invariants (R3, R5 — not owned by a task)

Two cross-cutting invariants no single task owns. The colour tokens land in the rendered tasks
that use them (T3–T7, T11, T17); R5's composition lands in the existing page-shell/hero work.

- **AC-001-106** (R3) — every projected value is encoded by dash, position, and a printed word in
  addition to hue; no projected datum is distinguished by colour alone.
  File: `20-acceptance/AC-001-projection-colour.md`.
- **AC-001-107** (R5) — at 1280×800 and 390×844 the hero does not fill the viewport, and the
  demography block's heading and finding sentence are visible at the fold.
  File: `20-acceptance/AC-001-first-viewport.md`.

---

## Open questions

These are genuinely undecided in `00-informal.md`. Defaults are recommendations, not
decisions; a human confirms before `/build`.

1. **Exact source series codes.** Which exact INE `tempus3` series, Seguridad Social series,
   IGAE account lines, AIReF projection tables, and Banco de España/Fondo de Reserva series
   back each metric. *Recommended default:* v1 commits manually-fetched snapshots for every
   non-verified source (Seguridad Social, IGAE, AIReF, Fondo de Reserva) with the exact
   table/date noted in the manifest `sourceUrl`; only INE `tempus3` and Eurostat `spr_exp_pens`
   are fetched live. Codes are resolved at first implementation, not invented here.
2. **Country switcher in v1.** Whether a country-switcher UI ships with Spain-only data, or
   waits for a second country. *Recommended default:* no switcher UI in v1 — the content model
   is keyed by country+locale (T8) but the interface renders Spain only.
3. **Agreement/dispute section scope.** How long and how complete the "what economists agree on
   / what is disputed" section must be. *Recommended default:* three short sections (agreement /
   dispute / thesis), each ≤ a few paragraphs, every contested position carrying a citation per T9.
4. **Annual pension payments (pagas).** Spain pays contributory pensions in 14 mensualidades;
   the cohort-return annual pension uses `14 × averageMonthlyPension`. *Recommended default:* 14
   for Spain, with the figure stated as an assumption beside the result.
5. **Cohort entry and retirement ages.** *Recommended default:* entry 25, retirement 65; both
   stated as assumptions and exposed for sensitivity later.
6. **Real wage growth assumption.** *Recommended default:* `g_wage = 0.01` (1% real) in T7,
   swept `{0.00, 0.01, 0.02}` in the sensitivity band.
7. **Population projection horizon.** *Recommended default:* 2026–2070 (INE long-term
   projections), stated beside the result.
8. **Implicit debt units.** Euros vs % of GDP. *Recommended default:* euros only in v1 (adds no
   GDP source); % of GDP deferred.
9. **"Inmigración no arregla la sostenibilidad" claim.** Has no data basis yet; the informal
   spec says not to assume it. *Recommended default:* excluded from v1 until it has its own
   sourced metric.
10. **Named-economist attribution in agreement/dispute.** *Recommended default:* only cited,
    verbatim-quoted sources appear; no unattributed economist by name (enforced by T9).

11. **Password hashing library and parameters.** *Recommended default:* argon2id via a
    maintained Node binding (`@node-rs/argon2` or `argon2`), memory cost 64 MiB (`m=65536`),
    `t=3` iterations, `p=1` parallelism, 16-byte salt, 32-byte hash; parameters encoded in the
    hash string itself so they can be raised later.
12. **Session token lifetime and rotation.** *Recommended default:* absolute 30-minute TTL, no
    sliding renewal in v1 (re-login after expiry); session secret is a single 256-bit server env
    secret, rotated by changing the env and redeploying (which invalidates all sessions).
13. **GitHub token scope and storage for refresh dispatch.** *Recommended default:* a
    fine-grained PAT scoped to `actions: write` on this repo only, stored as a server-side secret
    (env var, never `NEXT_PUBLIC_*`), injected into the route handler's server context; never
    present in any client bundle.
14. **Audit log persistence and retention.** *Recommended default:* append-only JSONL at
    `data/audit/audit.jsonl`, committed to git (tamper-evident via git history plus a per-entry
    chained hash); retention: all entries kept (volume is low), no truncation in v1.
15. **Published revision representation.** *Recommended default:* both — a pending revision is
    stored under `data/pending/` (outside live `data/derived/`), and approval copies it into
    `data/derived/` as a git commit; the committed derived JSON is the published artifact, the
    commit is the publication record.
16. **Rate-limit and lockout parameters.** *Recommended default:* per-IP lockout after 5
    failures in 15 minutes, exponential backoff doubling from 1s; global cap 100 attempts/minute
    across all IPs.
17. **CSRF token strategy.** *Recommended default:* synchronizer token, one per session, required
    as an `X-CSRF-Token` header on every state-changing request; rejected on mismatch/absence.
18. **International sources for M3/M4/M5.** Three metrics (cohort return, implicit debt, required
    base growth) have no internationally comparable computation in v1: ESSPROS has no
    contributions/receipts series (`spr_rec_pens` 404), and no verified Eurostat dataset carries
    accrued obligations or pension-fund assets. *Recommended default:* accept
    `availability: 'unavailable'` with an explicit reason for these metrics' international
    rendering; revisit if the European Commission Ageing Report (AWG) or a new ESSPROS series is
    captured as a verified source in a later spec.

19. **Countdown `snapshotYear` source.** The design states "16 years from the snapshot year 2026"
    and `years = thresholdYear − snapshotYear`, but does not pin whether `snapshotYear` is a fixed
    published constant or derived from the `proj_23np` snapshot's `fetchedAt`. *Recommended
    default:* a documented constant equal to the data vintage year (2026), printed beside the
    result, never the wall-clock year — so the number changes only when the projection is revised,
    per R2's no-ticker rule.
20. **Pyramid share rounding precision.** Shares are "in percent" and must sum to 100 ± 0.1
    (AC-001-94), but the decimal precision is not stated. *Recommended default:* 2 decimal places,
    consistent with the metric rounding convention.
21. **The countdown's place in Reproducir.** R2 says the countdown has "its own group in
    Reproducir", but R6's rendered form lists only computed figures plus the pyramid as the single
    derived-series group (`2 figuras calculadas · 1 serie derivada`). *Recommended default:*
    reconcile before `/build` — either advertise the countdown as a second derived-series row (it
    has its own digest and reproduce path), or keep R6's form exactly (figures + pyramid) and note
    that the countdown's provenance is disclosed in its own block, not in Reproducir.

## Acceptance scenarios

## AC-001-01 — A derived figure's manifest carries all required fields
## AC-001-02 — Changing an input snapshot changes the hash
## AC-001-03 — A figure with a missing or empty manifest field is rejected
## AC-001-04 — All sources resolve, derived JSON is written, exit 0
## AC-001-05 — A single source failure fails the build loudly
## AC-001-06 — A partial ingest fails loudly
## AC-001-07 — A stale snapshot is not rendered as current
## AC-001-08 — Correct ratio, two decimal places
## AC-001-09 — Zero affiliates is undefined, not infinite
## AC-001-10 — Zero pensioners is 0.00
## AC-001-100 — The variant range is computed over all six variants; a non-crossing variant is excluded
## AC-001-101 — A variant that never crosses renders no numeral and no substitute threshold
## AC-001-102 — The scope mark renders from the country record in every locale
## AC-001-103 — A hero statement that omits the country name fails the build
## AC-001-104 — One geo is text, two or more is the index, never a disabled control
## AC-001-105 — Only computed figures and series are advertised as reproducible
## AC-001-106 — A projected value is encoded by dash, position, and a printed word, not hue alone
## AC-001-107 — The hero does not fill the viewport and the demography heading is at the fold
## AC-001-11 — Both zero is undefined
## AC-001-12 — Ratio rises when affiliates fall
## AC-001-13 — Correct cover, two decimal places
## AC-001-14 — Zero expenditure is undefined
## AC-001-15 — Zero contributions is 0.00
## AC-001-16 — Cover below 1 produces a positive gap
## AC-001-17 — Cover is never negative
## AC-001-18 — IRR solves NPV to tolerance
## AC-001-19 — Zero benefit years is a −100% return
## AC-001-20 — Zero contributions is undefined
## AC-001-21 — Sensitivity band contains the central value
## AC-001-22 — IRR increases with the pension
## AC-001-23 — IRR decreases with the contribution
## AC-001-24 — PV of obligations is discounted correctly
## AC-001-25 — All four rates present, no single value
## AC-001-26 — Assets are subtracted and a surplus is negative
## AC-001-27 — Implicit debt decreases as the rate increases
## AC-001-28 — Required growth is return minus wage growth
## AC-001-29 — Gap is required minus projected
## AC-001-30 — A shrinking base widens the gap
## AC-001-31 — Every output carries its assumptions
## AC-001-32 — Gap is monotonic in return and projection
## AC-001-33 — All five locales return content for Spain
## AC-001-34 — An unsupported locale yields a defined error
## AC-001-35 — No user-facing string literal in a component
## AC-001-36 — A second country is data, not code
## AC-001-37 — A named-person claim renders with its citation
## AC-001-38 — A named-person claim without a citation does not render
## AC-001-39 — A contested claim shows both positions
## AC-001-40 — A quote with an unresolvable source does not render
## AC-001-41 — Fraud reading appears only in the thesis section
## AC-001-42 — Metric components do not reference thesis content
## AC-001-43 — Three structurally distinct sections
## AC-001-44 — When a chart renders, the chart renders non-visual data
## AC-001-45 — When a chart renders, non-visual data is exposed to assistive technology
## AC-001-46 — Wrong password returns 401, counts the attempt, reveals nothing
## AC-001-47 — Repeated failures lock the account out
## AC-001-48 — Valid login sets a hardened session cookie
## AC-001-49 — A tampered session cookie is rejected
## AC-001-50 — An expired session cookie is rejected
## AC-001-51 — A state-changing request without CSRF is rejected
## AC-001-52 — Admin routes are noindex and excluded from the sitemap
## AC-001-53 — Unconfigured credential fails closed to 503
## AC-001-54 — Public site is unaffected by admin misconfiguration
## AC-001-55 — No admin secret in the client bundle
## AC-001-56 — Error bodies do not echo configuration detail
## AC-001-57 — Refresh produces a pending revision, public figures unchanged
## AC-001-58 — Approval publishes the revision and writes an audit entry
## AC-001-59 — Duplicate refresh for the same snapshot does not stack
## AC-001-60 — A published revision still resolves to a manifest
## AC-001-61 — A proposal citing an unresolvable source is rejected
## AC-001-62 — A proposal enters parameter review and cannot auto-approve
## AC-001-63 — A proposal cannot alter a derived figure
## AC-001-64 — The parameter set is enumerated
## AC-001-65 — Every admin action is recorded append-only
## AC-001-66 — Failed authentication is logged without the credential
## AC-001-67 — Audit log is readable in the admin panel
## AC-001-68 — Admin content cannot introduce an uncited claim
## AC-001-69 — Public routes are static, admin routes are dynamic
## AC-001-70 — The 503 escapes the admin shell
## AC-001-71 — A newer snapshot supersedes an older pending revision
## AC-001-72 — Approval requires a revision-bound review token
## AC-001-73 — Accepting a parameter publishes zero figure changes
## AC-001-74 — `availability` separates a computed figure from a never-computed figure
## AC-001-75 — An unresolved figure renders no chart and no table, deliberately
## AC-001-76 — A negative return is computed and reported as negative when flows are inverted
## AC-001-77 — A figure carries a definitionId and a published definition string
## AC-001-78 — An unknown definitionId fails validation
## AC-001-79 — The international path takes geo as data, not code
## AC-001-80 — Only ES is published in v1
## AC-001-81 — A definition missing for a country renders unavailable, never a substitute
## AC-001-82 — Two distinct figures, never one merged number
## AC-001-83 — International dependency figure is computed from old-age beneficiaries
## AC-001-84 — National dependency figure is unavailable with its definition stated
## AC-001-85 — Two distinct figures, never one merged number
## AC-001-86 — International figure is pension expenditure as % of GDP
## AC-001-87 — National figure is contribution cover, unavailable
## AC-001-88 — No internationally-comparable cohort return is presented
## AC-001-89 — No internationally-comparable implicit debt is presented
## AC-001-90 — No internationally-comparable required base growth is presented
## AC-001-91 — A heading's count matches the registers actually rendered
## AC-001-92 — A definition string is instrument vocabulary, never thesis vocabulary
## AC-001-93 — Single-year codes band to 5-year groups; the open-ended band resolves by label
## AC-001-94 — Per-sex totals reconcile with the total; shares sum to 100; UNK excluded
## AC-001-95 — The derived series carries a complete manifest from the documented sets
## AC-001-96 — The derived file lives where the figure loader does not read it
## AC-001-97 — The chart and the table are emitted together or not at all
## AC-001-98 — The ratio is computed from the pinned variant and age definition; the threshold is a parameter
## AC-001-99 — The countdown is the difference of two printed integers, with no sub-annual unit

## Verification

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

---

# Revision 2 verification (new scope cycle — T17, T18, T19, R3, R5, R6)

## Scope-cycle counter reasoning

This is a **new scope cycle**, not a re-verification of a previously-failed gate. T17
(inverted population pyramid), T18 (projected threshold-crossing countdown), T19
(Spain-only scope mark), and the R3/R5/R6 rendering invariants were added at
product-owner request after revision 1 had already run its phase-1 and phase-2 loops to
green. The Phase 1 counter therefore **resets to 0** for this cycle: revision 1's
phase-1 budget (3 attempts) was consumed by revision 1's own gate-failure loops, and a
new scope cycle is a new budget, not a continuation of the old counter. `SPEC_PHASE1_RETRIES=0`
below records this reset explicitly so the audit trail explains it as a scope-cycle reset
rather than a counter tamper. (`SPEC_LOOP_COUNT=3`, `SPEC_PHASE2_RETRIES=2` carry forward.)

## Summary of checks

| # | Check | Result |
|---|---|---|
| 1 | Scenario traceability | PASS (gate exit 0) — with a known limitation disclosed below |
| 2 | Full test suite | PASS — 505 tests / 40 files, exit 0 |
| 3 | Complexity gate (`eslint`) | PASS — exit 0 |
| 3.5 | Design-principles gate | **FAIL** — exit 1: one NEW in-scope FAIL (component-per-file) + one unchanged out-of-scope FAIL (`.standards/`) |
| 4 | Scenario-to-behavior spot check | PASS |
| — | No unaccounted behavior | No finding |

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-10-26T13:08:29Z

Scenario IDs found: 99 live, 0 archived
The gate emits exactly 99 `PASS` lines (AC-001-01 … AC-001-99) and zero `FAIL` lines. Representative excerpt of the JSON transcript:

```
{
  "checks": [1, 2],
  "passes": ["AC-001-01 — traced to a test", "AC-001-02 — traced to a test", "…", "AC-001-98 — traced to a test", "AC-001-99 — traced to a test"],
  "fails": []
}
```

**Known limitation — confirmed and disclosed, do not read this exit 0 as 107/107.**
The gate's scenario-heading regex and reference regex are both `AC-[0-9]{3}-[0-9]{2}`
(two-digit suffix). The 8 scenarios `AC-001-100` … `AC-001-107` have a three-digit
suffix and are therefore **invisible** to both checks: the gate mechanically verifies
99 of 107 and would not catch a missing test (check 1) or a dangling reference (check 2)
for the rest. I confirmed by grep that all 8 are actually covered, in both directions:

- Scenario headings exist for all 8 (`grep '^## AC-001-10[0-7]'` = 8 matches across
  AC-001-countdown.md, AC-001-reproduce.md, AC-001-scope-mark.md, AC-001-projection-colour.md,
  AC-001-first-viewport.md).
- A test cites each of the 8: AC-001-100/-101 (tests/acceptance/countdown.test.ts),
  AC-001-102/-103/-104 (tests/acceptance/scope-mark.test.ts), AC-001-105
  (tests/acceptance/reproduce.test.ts), AC-001-106 (tests/acceptance/projection-colour.test.ts),
  AC-001-107 (tests/acceptance/first-viewport.test.ts).

So the true state is 107/107 scenarios traced and cited; the gate's exit 0 only proves
99 of them. This is a gap in the gate's regex, not in the deliverable, and is flagged to
the Architect as an out-of-scope tooling observation.

## Evidence: full test suite

command: npx vitest run
exit: 0
at: 2026-10-26T13:08:29Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  40 passed (40)
      Tests  505 passed (505)
   Start at 13:56:08
   Duration  3.09s (tests 48%, import 37%, transform 13%, worker 1%)
```

Supplementary build/type/lint gates, each exit 0:

```
command: npx tsc --noEmit          exit: 0
command: npx eslint .              exit: 0
command: npm run build             exit: 0   (Next.js 16.4.3 static export: /, /en, /fr, /de, /it prerendered)
command: npm run verify:derived    exit: 0   → "derived figures verified: 7 (2 computed, 5 unavailable)" / "derived series verified: 2"
command: npx tsx scripts/check-client-secrets.ts   exit: 0 → "no admin secret configured in this environment; .next/static not grepped for values"
command: npx tsx scripts/check-content-scope.ts    exit: 0 → "country scope gate: clean (5 locales)"
command: npx tsx scripts/check-public-vocabulary.ts exit: 0 → "public vocabulary gate: clean (5 locales)"
```

## Evidence: complexity gate

command: npx eslint .
exit: 0
at: 2026-10-26T13:08:29Z

ESLint (v10.13.0, typescript-eslint, `complexity: [error, 6]` in eslint.config.mjs) reports
no findings and exits 0. `eslint` is the authoritative complexity gate for this TypeScript
repo (docs/SPEC_PIPELINE.md §Tooling by language: "Complexity gate — ESLint `complexity` (≤6)").
No `golangci-lint`/`pmd` applies (no Go/Java source).

## Evidence: design-principles gate

command: .standards/scripts/check-code-principles.sh . --tier production
exit: 1
at: 2026-10-26T13:08:29Z

`.next/` was moved aside before the run (per the task), then restored. The gate scanned the
repo and reported **2 FAIL(s), 42 WARN(s)**. Every FAIL and WARN line, verbatim:

FAIL Cyclomatic complexity >6 (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10
FAIL Component-per-file: ./app/(public)/[locale]/page.tsx exports 5 functions/components (threshold: ≤4) — split file
WARN Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:45:71:main:KISS_LINES=28
WARN Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:101:124:checkCompensationPairs:KISS_LINES=25
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:48:67:ActionForms:KISS_LINES=21
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:69:91:ProposalPage:KISS_LINES=23
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:35:67:ReviewTable:KISS_LINES=26
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx:7:34:RefreshPage:KISS_LINES=28
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:57:82:PendingTable:KISS_LINES=24
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:84:123:PanelHome:KISS_LINES=39
WARN Method body >20 lines (node): ./app/(admin)/admin/login/page.tsx:5:30:LoginPage:KISS_LINES=26
WARN Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::KISS_LINES=41
WARN Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:93:225::KISS_LINES=43
WARN Method body >20 lines (node): ./web/components/DataTable.tsx:32:57:DataTable:KISS_LINES=27
WARN Method body >20 lines (node): ./web/components/series/CountdownBlock.tsx:20:69:CountdownBlock:KISS_LINES=43
WARN Method body >20 lines (node): ./web/components/series/PyramidPlate.tsx:72:106:Panel:KISS_LINES=35
WARN Method body >20 lines (node): ./web/components/series/PyramidPlate.tsx:181:229:PyramidPlate:KISS_LINES=47
WARN Method body >20 lines (node): ./web/components/CitationChip.tsx:12:38:CitationChip:KISS_LINES=28
WARN Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21
WARN Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:41:62:ChartWithTable:KISS_LINES=23
WARN Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:27:59:SiteFooter:KISS_LINES=34
WARN Method body >20 lines (node): ./web/components/public/ScopeMark.tsx:27:52:ScopeMark:KISS_LINES=24
WARN Method body >20 lines (node): ./web/components/public/Hero.tsx:36:60:SubjectFacts:KISS_LINES=26
WARN Method body >20 lines (node): ./web/components/public/Hero.tsx:138:168:PropositionHero:KISS_LINES=30
WARN Method body >20 lines (node): ./web/components/public/ReproduceBlock.tsx:32:77:ReproduceBlock:KISS_LINES=46
WARN Method body >20 lines (node): ./web/components/public/AssumptionsLedger.tsx:43:83:AssumptionsLedger:KISS_LINES=41
WARN Method body >20 lines (node): ./web/components/public/ThemeGroup.tsx:13:36:ThemeGroup:KISS_LINES=21
WARN Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:62:101:IndexPanel:KISS_LINES=41
WARN Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:108:134:SiteHeader:KISS_LINES=28
WARN Method body >20 lines (node): ./web/components/registers/DisputeSection.tsx:17:42:DisputeSection:KISS_LINES=25
WARN Method body >20 lines (node): ./web/components/registers/ThesisSection.tsx:19:43:ThesisSection:KISS_LINES=22
WARN Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:30:57:FigureStatusRow:KISS_LINES=26
WARN Possible duplication (5x identical 4-line block, first at ./web/components/ProvenanceStrip.tsx:49): </li> /))} /</ul> /</a>
WARN Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:115): type: "problem", /docs: { /description: /meta: {
WARN Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:132): schema: [], /}, /create(context) { /},
WARN Possible duplication (3x identical 4-line block, first at ./web/components/metrics/views.ts:153): ...headValue, /summary: summaryOf(input.content, value.points.length), /readout: [ /return {
WARN Possible duplication (2x identical 4-line block, first at ./web/ingest/run-compute.ts:96): }, /}; /return { kind: 'ok', snapshot }; /detail: freshness.reason ?? 'outside freshness window',
WARN Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:133): }, /create(context) { /return { /schema: [],
WARN Possible duplication (2x identical 4-line block, first at ./web/components/public/SiteHeader.tsx:120): {content.t(anchor.label)} /</a> /))} /<a key={anchor.href} href={anchor.href}>
WARN Possible duplication (2x identical 4-line block, first at ./web/components/public/Hero.tsx:143): {content.t('hero.statement')} /</h1> /<ScopeMark content={content} countries={countries ?? [{ geo: content.country.code, name: content.country.name, href: '#' }]} /> /<h1 className="hero__title" id="hero-title">
WARN Possible duplication (2x identical 4-line block, first at ./web/derived/series-store.ts:35): try { /files = readdirSync(dir).filter((file) => file.endsWith('.json')); /} catch { /let files: string[];
WARN Possible duplication (2x identical 4-line block, first at ./web/sources/types.ts:76): sourceClass: 'machine', /publisherUrl: 'https: /}, /datasetCode: 'proj_23np',
WARN Empty method body (java): ./.standards/ci/templates/archunit/OutboxArchRules.java:30
WARN Empty method body (java): ./.standards/ci/templates/archunit/SagaArchRules.java:33
PASS Property tests (node): fast-check in use
✘ Design-principles check: 2 FAIL(s), 42 WARN(s).

**Reading of the FAILs.** One FAIL is the unchanged out-of-scope finding in the
`.standards/` submodule (the `hallmark` example `script.js`, CC=10) — present since
revision 1, not part of this child repo's deliverable. The second FAIL is **new and
in-scope**: `app/(public)/[locale]/page.tsx` now exports 5 functions/constants
(`export const dynamic`, `export const dynamicParams`, `generateStaticParams`,
`generateMetadata`, and the default `LocalePage`), crossing the component-per-file
`>4 exported functions` threshold. This was introduced in revision 2 by the T19
scope-mark work adding `generateMetadata` to the `[locale]` route (the `<title>`/`og:title`
scope suffix requires it); before that the file had 4 exports and the gate was clean
(revision-1 reports record "component-per-file: 0 FAILs"). The `export const dynamic` and
`export const dynamicParams` lines are Next.js route-segment config constants, not
functions, but the gate's heuristic (line 1136 of `check-code-principles.sh`) counts every
`export const X =` pattern, and `component-per-file` is in the gate's blocking set — so
the script's exit 1 is the authority. This is a pipeline-stop finding, not a WARN.

## Evidence: scenario-to-behavior spot check

command: manual — 2 acceptance scenarios read against their test assertions
exit: 0
at: 2026-10-26T13:08:29Z

Two scenarios picked from the new revision-2 set; each test's assertions were read and
compared to the scenario's Given/When/Then (not just name-matched).

1. **AC-001-100** (`20-acceptance/AC-001-countdown.md`): "the printed range is the minimum
   and maximum crossing year over the variants that cross inside the horizon; a variant
   that never crosses is excluded and does not fail the block."
   → `tests/acceptance/countdown.test.ts` asserts `byVariant === { BSL:2042, HMIGR:2043,
   LFRT:2041, LMIGR:2040, LMRT:2041, NMIGR:2039 }`, asserts `range === { min:2039, max:2043 }`
   and the rendered range string, and asserts a never-crossing variant yields `thresholdYear:
   null`, `range: null`, and no numeral. Assertions match the scenario; they are behavioral
   (values and rendered output), not name-only.

2. **AC-001-102** (`20-acceptance/AC-001-scope-mark.md`): "every occurrence is derived from
   `country.ES.name` and `country.ES.scopeClause` … no component hardcodes a country name
   … `Ámbito` never renders an empty cell."
   → `tests/acceptance/scope-mark.test.ts` asserts the first viewport renders
   `content.country.name` + `scopeClause` + `data-scope="text"`; the headline names the
   country in all five locales; every figure strip renders `Ámbito` from the record with no
   empty `<dd>`; the `<caption>`, `<title>`/`og:title`, and share card all derive the name
   from the record (title/card carry no digit); and a source-scan test asserts no component
   hardcodes a country-name literal. Assertions match the scenario.

Both spot-checked tests pass in the suite and assert the scenario's actual Then-clauses.

## Additional independent checks (the ones that matter)

### R6 fix is real — Reproducir section advertises exactly two figures, no fig-03…fig-07

Parsed the live-rendered `/` (es). The `<section class="reproduce" id="reproducir">` contains
**exactly** these command/hash rows, and nothing for fig-03 … fig-07:

- `npx tsx scripts/compute.ts --figure fig-01` (hash `561a7da…`)
- `npx tsx scripts/compute.ts --figure fig-02` (hash `31c2d5b…`)
- `npx tsx scripts/compute.ts --series countdown` (hash `9b4e815…`)
- `npx tsx scripts/compute.ts --series pyramid` (hash `c1fd3c0…`)

A whole-page grep for `--figure fig-` / `--series ` returns only `fig-01`, `fig-02`,
`countdown`, `pyramid` (2 occurrences each — static HTML + RSC flight). No `--figure fig-03`
… `fig-07`, no hash for them. The `fig-03`…`fig-07` strings that do appear in the page are
the D2 figure-ladder rows (`<section class="figure-row" id="fig-03" data-state="unavailable">`
etc.), which is correct behaviour, not a reproduction advertisement. The "omitted" line reads
"5 de las 7 figuras no tienen valor calculado … no tienen huella ni comando de reproducción"
and carries no id/hash. R6's measured defect is gone.

### Data honesty — my own arithmetic from the committed snapshots

I re-decoded the Eurostat JSON-stat snapshots with an independent Python decoder (correctly
sorting each `category.index` by its position value) and recomputed both series. The actual
production code (`computeCountdown`/`computePyramid`, run offline against the same snapshots)
agrees with my arithmetic and with the committed `data/derived/series/*.json`:

- **Countdown crossing year**: old-age dependency ratio = 65+ ÷ 15–64 × 100, threshold 50.
  BSL = **2042**; variants {BSL:2042, HMIGR:2043, LFRT:2041, LMIGR:2040, LMRT:2041,
  NMIGR:2039}; **range 2039–2043**. 2025 back-cast: projected **31.91** vs observed **31.22**
  (difference 0.69). All match the committed `countdown.json`.
- **Pyramid 65+ share of total** (sum of bands ≥65 ÷ year total × 100): 1995 = **14.98**,
  2025 = **20.72**, 2050 = **32.68** (populations 39,639,726 / 49,128,297 / 50,460,161).
  All match the committed `pyramid.json` `readout.over65`.

Disclosure on the task's claimed triple "31.91 / 20.72 / 32.68 (as percentages of total)":
**31.91 is not a 65+ share of total** — it is the old-age **dependency ratio** (65+ per 100
aged 15–64), the countdown's 2025 back-cast. The three 65+-shares-of-total are 14.98 / 20.72 /
32.68. This is a labelling imprecision in the claim, not a defect: the code and committed data
are internally consistent and I reproduce them exactly.

### Trap assertions exist and would fail on a hardcoded mapping or a double-count

- `Y_OPEN` vs `Y_GE100`: `tests/acceptance/population-pyramid.test.ts` asserts
  `bandOfAgeLabel('Open-ended age class')` and `bandOfAgeLabel('100 years or over')` both map
  to `OPEN_BAND` (100), and — decisively — renames the `Y_OPEN` code to `ZZ_OPEN_99` in a
  cloned payload and asserts the open band still resolves by label (so a hardcoded code would
  fail this test).
- `sex=T` double-count: the same file constructs a payload whose open band total (3) ≠ the
  sum of its two sexes (2) and asserts `readAgeCounts` throws `/double-count/`; plus AC-001-94
  asserts `male + female === total` per band/year and that band shares sum to 100 ± 0.1.

### Thesis hygiene

- The countdown copy is instrument vocabulary. The live Spanish block reads: eyebrow
  "Proyección central · Eurostat", "16 años", "2042 año del umbral", definition "Años hasta que
  la población de 65 y más años alcance 50 por cada 100 personas de 15 a 64 años.",
  "variantes 2039–2043", and the back-cast "La proyección da 31,91 para 2025 y la observación
  del mismo año da 31,22." — no opinion adjective, no conclusion. `tests/acceptance/
  countdown.test.ts` enforces the copy bans (`faltan, quedan, solo, apenas, cuenta atrás,
  bomba, explota`, `!`, second-person, word-`ya`) across all five locales, and that no operator
  variant code (`BSL`/`HMIGR`) leaks.
- The thesis register still cannot carry hue: `tests/acceptance/projection-colour.test.ts`
  (AC-001-106) pins the hue token `--data-projection` to projected values only, asserts sex is
  never hue-encoded, and the thesis section renders `data-register="thesis"` as prose with no
  projection hue.

### Scope marking is data-driven

- `country.name` / `scopeClause` come from the content model (`web/content/data/ES/{es,en,fr,
  de,it}.json` each carry `countryName` and `scopeClause`; `web/content/registry.ts` resolves
  them into `CountryRecord { code, name, scopeClause }`). `ScopeMark` reads `content.country.name`
  / `content.country.scopeClause`.
- No component hardcodes a country name: `grep -rn "España"|"Spain"` over `web/components/`,
  `web/sources/`, `web/content/` (excluding the locale data files) returns nothing.
- Live render: `<h1>` = "La aritmética de las pensiones en **España**" (es) / "The arithmetic
  of pensions in **Spain**" (en); `Ámbito` present in every provenance strip.

### Live render (built app, `next start`)

- `/` and `/en` → HTTP 200; `/admin` → HTTP 503 with the fail-closed body "CONFIG. Administración
  no configurada…", no form.
- Countdown: `16` / `2042` / `2039–2043` present in both `es` and `en`, with definition, source
  ("Eurostat, proyecciones demográficas 2024 · Dato de 2026") and the back-cast disclosure.
- Pyramid: 3 `demography__svg` panels, 21 `scope="row"` table rows per year, `<table>`+`<caption>`
  emitted, `100+` label present in every panel. The 100+ band's share is 0.00 for 1995 (the
  underlying count is non-zero but below two-decimal precision — the test documents this
  explicitly) and 0.16 for 2050, so the band is present and non-zero where the data is.

## No unaccounted behavior

Skimmed the revision-2 diff (new/changed files) for logic that does not trace to T17/T18/T19/
R3/R5/R6. Everything maps: the new `data/snapshots/eurostat-demo-pjan.json`,
`eurostat-proj-23np.json`, `eurostat-proj-23np-ratio.json` are T17/T18 inputs;
`data/derived/series/{pyramid,countdown}.json` are outputs; `web/series/*`, `web/ingest/series*`,
`web/derived/series-store.ts` are the series compute/ingest path; `web/components/series/*` is the
render; `web/components/public/ScopeMark.tsx` + `web/seo/metadata.ts` + `web/seo/share-card.tsx`
are T19; the `web/manifest/*` changes are the new `formulaId`/`definitionId` closed-set entries;
the new `tests/acceptance/*` and `tests/fixtures/series.ts` are the new scenario tests. No
finding.

## Audit-trail gate

command: .standards/scripts/check-audit-trail.sh 001-pension-math
exit: 0

All folder artefacts present (10-tasks.md, 20-acceptance/ with `## AC-NNN-NN` headings,
25-verification.md, 30-report.md, 15-design.md, 40-deploy.md) and all five contract evidence
blocks resolve (the gate reads the revision-1 blocks, which remain first in the file; the
revision-2 blocks appended here use the same heading strings for human audit).

## Overall verdict

**FAIL.** The design-principles gate ran and produced a project-source finding that stops the
pipeline: `Component-per-file: ./app/(public)/[locale]/page.tsx exports 5 functions/components
(threshold: ≤4)`, newly introduced by revision 2's T19 `generateMetadata` addition. The
Refactorer's framing "the one out-of-scope FAIL is in `.standards/`" is stale for this cycle —
there are now two FAILs, one of which is in-scope project code. Per the Stop-and-Ask matrix
("a design gate blocks → fix the code, never the threshold"), this routes to the Refactorer
(structural), not to the tooling. Everything else I checked — traceability (107/107, with the
gate's 99-of-107 regex limitation), the 505-test suite, `tsc`/`eslint`/`build`/`verify:derived`,
the three content gates, the R6 reproduction fix, the recomputed countdown/pyramid arithmetic,
the trap assertions, thesis hygiene, scope-mark data derivation, and the live render — is green.

This is the phase-1 gate of the new scope cycle; its counter is 0 (first run), not exhausted.

---

# Revision 2 verification — attempt 2

**Re-verification attempt:** attempt 2, phase 1 (revision-2 scope cycle; this is the first
phase-1 remediation round for this cycle).
**Budget state:** `SPEC_LOOP_COUNT=3`, `SPEC_PHASE1_RETRIES=1`, `SPEC_PHASE2_RETRIES=2`.
**Trigger:** the revision-2 attempt-1 FAIL — `Component-per-file:
./app/(public)/[locale]/page.tsx exports 5 functions/components (threshold: ≤4)`. The
Refactorer moved `export const dynamicParams = false` out of the `[locale]` page into a new
`app/(public)/[locale]/layout.tsx` (with a pass-through `LocaleLayout` that returns
`children` and contributes no markup), leaving the page with 4 exports
(`dynamic`, `generateStaticParams`, `generateMetadata`, `LocalePage`).

This attempt re-runs only the affected gate (design-principles, the gate that FAILed) plus
the full suite / typecheck / lint / build / derived-verification / traceability that the
structural move could touch, and — because the move crosses the page/layout boundary — an
independent rendering-mode check that `dynamicParams: false` and `dynamic: force-static`
still combine to the same static-prerender policy. Did **not** read `00-informal.md`.

Prior-stage claims under test this round:
- Refactorer: page now exports 4 (component-per-file threshold ≤4); the one FAIL the
  verifier blocked on is gone.
- Refactorer: effective route config unchanged (`dynamicParams: false`, `dynamic: force-static`).
- Refactorer: build route table and `prerender-manifest` unchanged; locale routes still SSG.
- Refactorer: 505 tests pass; no test edited.

---

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-10-26T13:23:45Z

```
{ "checks": [1, 2],
  "passes": ["AC-001-01 — traced to a test", "AC-001-02 — traced to a test", …, "AC-001-98 — traced to a test", "AC-001-99 — traced to a test"],
  "fails": [] }
```

**Verdict: PASS (with the same known limitation, restated — do not read this exit 0 as 107/107).**
The gate emits exactly 99 `PASS` lines (`AC-001-01` … `AC-001-99`) and zero `FAIL` lines. Its
scenario-heading and reference regexes are both `AC-[0-9]{3}-[0-9]{2}` (two-digit suffix), so
the 8 three-digit-suffix scenarios `AC-001-100` … `AC-001-107` are invisible to both checks —
the gate mechanically verifies 99 of 107. I re-confirmed by grep that all 107 scenario headings
exist (`grep -rhoE '^## AC-001-[0-9]+' 20-acceptance/ | sort -u | wc -l` = 107) and that the 8
invisible ones are cited by a test (AC-001-100/-101 → countdown.test.ts, 102/-103/-104 →
scope-mark.test.ts, 105 → reproduce.test.ts, 106 → projection-colour.test.ts, 107 →
first-viewport.test.ts), so the true state is 107/107 traced; the gate's exit 0 only proves 99
of them. This is the gate's regex gap, not a deliverable gap — unchanged from attempt 1 and
still flagged to the Architect as an out-of-scope tooling observation.

---

## Evidence: full test suite

command: npx vitest run
exit: 0
at: 2026-10-26T13:22:34Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  40 passed (40)
      Tests  505 passed (505)
   Start at  14:22:34
   Duration  3.04s (tests 47%, import 37%, transform 14%, worker 1%)
```

**Verdict: PASS.** Real count **505 tests / 40 files**, exit 0, none skipped or disabled —
identical to attempt 1. The structural move (page → layout) changed no test and no behaviour;
the Refactorer's "505 tests pass, no test edited" is reproduced. Supplementary gates, each
exit 0: `npx tsc --noEmit` (0), `npx eslint .` (0), `npm run build` (0 — 21/21 static pages),
`npm run verify:derived` (0 — `derived figures verified: 7 (2 computed, 5 unavailable)` /
`derived series verified: 2`), `npx tsx scripts/check-content-scope.ts` (0 — clean, 5 locales),
`npx tsx scripts/check-public-vocabulary.ts` (0 — clean, 5 locales).

---

## Evidence: complexity gate

command: npx eslint .
exit: 0
at: 2026-10-26T13:23:10Z

```
(no output — clean)
```

**Verdict: PASS.** ESLint (v10.13.0, `complexity: [error, 6]` in `eslint.config.mjs`) exits 0
with zero findings across the changed tree (the new `layout.tsx` and the trimmed `page.tsx`
included). The move introduced no branching and no complexity violation.

---

## Evidence: design-principles gate

command: .standards/scripts/check-code-principles.sh --tier production
exit: 1
at: 2026-10-26T13:21:10Z

`.next/` was moved aside before the run (per the task; the gate SIGPIPEs on Next chunks, a
pre-existing condition confirmed in attempt 1) and restored/rebuild afterward. The gate
reported **1 FAIL(s), 42 WARN(s)**. The component-per-file finding I blocked on is **gone**.
Every FAIL / WARN line, verbatim (ANSI stripped):

```
PASS Complexity/KISS (java): no violations found
WARN Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:45:71:main:KISS_LINES=28
WARN Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:101:124:checkCompensationPairs:KISS_LINES=25
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:48:67:ActionForms:KISS_LINES=21
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:69:91:ProposalPage:KISS_LINES=23
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:35:67:ReviewTable:KISS_LINES=26
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx:7:34:RefreshPage:KISS_LINES=28
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:57:82:PendingTable:KISS_LINES=24
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:84:123:PanelHome:KISS_LINES=39
WARN Method body >20 lines (node): ./app/(admin)/admin/login/page.tsx:5:30:LoginPage:KISS_LINES=26
FAIL Cyclomatic complexity >6 (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10
WARN Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::KISS_LINES=41
WARN Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:93:225::KISS_LINES=43
WARN Method body >20 lines (node): ./web/components/DataTable.tsx:32:57:DataTable:KISS_LINES=27
WARN Method body >20 lines (node): ./web/components/series/CountdownBlock.tsx:20:69:CountdownBlock:KISS_LINES=43
WARN Method body >20 lines (node): ./web/components/series/PyramidPlate.tsx:72:106:Panel:KISS_LINES=35
WARN Method body >20 lines (node): ./web/components/series/PyramidPlate.tsx:181:229:PyramidPlate:KISS_LINES=47
WARN Method body >20 lines (node): ./web/components/CitationChip.tsx:12:38:CitationChip:KISS_LINES=28
WARN Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21
WARN Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:41:62:ChartWithTable:KISS_LINES=23
WARN Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:27:59:SiteFooter:KISS_LINES=34
WARN Method body >20 lines (node): ./web/components/public/ScopeMark.tsx:27:52:ScopeMark:KISS_LINES=24
WARN Method body >20 lines (node): ./web/components/public/Hero.tsx:36:60:SubjectFacts:KISS_LINES=26
WARN Method body >20 lines (node): ./web/components/public/Hero.tsx:138:168:PropositionHero:KISS_LINES=30
WARN Method body >20 lines (node): ./web/components/public/ReproduceBlock.tsx:32:77:ReproduceBlock:KISS_LINES=46
WARN Method body >20 lines (node): ./web/components/public/AssumptionsLedger.tsx:43:83:AssumptionsLedger:KISS_LINES=41
WARN Method body >20 lines (node): ./web/components/public/ThemeGroup.tsx:13:36:ThemeGroup:KISS_LINES=21
WARN Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:62:101:IndexPanel:KISS_LINES=41
WARN Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:108:134:SiteHeader:KISS_LINES=28
WARN Method body >20 lines (node): ./web/components/registers/DisputeSection.tsx:17:42:DisputeSection:KISS_LINES=25
WARN Method body >20 lines (node): ./web/components/registers/ThesisSection.tsx:19:43:ThesisSection:KISS_LINES=22
WARN Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:30:57:FigureStatusRow:KISS_LINES=26
WARN Possible duplication (5x identical 4-line block, first at ./web/components/ProvenanceStrip.tsx:49): </li> /))} /</ul> /</a>
WARN Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:115): type: "problem", /docs: { /description: /meta: {
WARN Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:132): schema: [], /}, /create(context) { /},
WARN Possible duplication (3x identical 4-line block, first at ./web/components/metrics/views.ts:153): ...headValue, /summary: summaryOf(input.content, value.points.length), /readout: [ /return {
WARN Possible duplication (2x identical 4-line block, first at ./web/ingest/run-compute.ts:96): }, /}; /return { kind: 'ok', snapshot }; /detail: freshness.reason ?? 'outside freshness window',
WARN Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:133): }, /create(context) { /return { /schema: [],
WARN Possible duplication (2x identical 4-line block, first at ./web/components/public/SiteHeader.tsx:120): {content.t(anchor.label)} /</a> /))} /<a key={anchor.href} href={anchor.href}>
WARN Possible duplication (2x identical 4-line block, first at ./web/components/public/Hero.tsx:143): {content.t('hero.statement')} /</h1> /<ScopeMark content={content} countries={countries ?? [{ geo: content.country.code, name: content.country.name, href: '#' }]} /> /<h1 className="hero__title" id="hero-title">
WARN Possible duplication (2x identical 4-line block, first at ./web/derived/series-store.ts:35): try { /files = readdirSync(dir).filter((file) => file.endsWith('.json')); } /catch { /let files: string[];
WARN Possible duplication (2x identical 4-line block, first at ./web/sources/types.ts:76): sourceClass: 'machine', /publisherUrl: 'https: /}, /datasetCode: 'proj_23np',
WARN Empty method body (java): ./.standards/ci/templates/archunit/OutboxArchRules.java:30
WARN Empty method body (java): ./.standards/ci/templates/archunit/SagaArchRules.java:33
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
PASS SOLID-SRP (node): no oversized files
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
PASS Component-per-file: no violations
PASS Property tests (java): jqwik/@Property in use
PASS Property tests (go): testing/quick in use
PASS Property tests (node): fast-check in use
✘ Design-principles check: 1 FAIL(s), 42 WARN(s).
```

**Verdict: PASS for the spec's deliverable (the blocked finding is resolved; one out-of-scope
FAIL carried forward, unchanged).**

- **component-per-file line, verbatim:** `PASS Component-per-file: no violations` — the
  `page.tsx exports 5 functions/components` FAIL from attempt 1 is **gone**. The `[locale]`
  page now exports exactly 4 (`dynamic`, `generateStaticParams`, `generateMetadata`,
  `LocalePage`), and the new `layout.tsx` exports 2 (`dynamicParams`, `LocaleLayout`), both
  under the ≤4 threshold.
- **Only remaining FAIL:** `FAIL Cyclomatic complexity >6 (node):
  ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10` — path
  `./.standards/skills/hallmark/site/examples/cobalt-01/script.js`, inside the `.standards/`
  submodule. Out of scope and off-limits to pipeline agents; identical to every prior attempt.
- **42 WARNs** — byte-identical file/line set to revision-2 attempt 1 (no new WARN, no shifted
  line from the move). 29 project-source KISS/DRY review hints + 13 `.standards` template WARNs.
  Zero FAILs in project source (`app/`, `web/`, `tests/`, `scripts/`, `middleware.ts`).

Exit 1 = findings; the sole FAIL is the out-of-scope submodule file. The in-scope finding that
produced the attempt-1 FAIL is resolved.

---

## Evidence: scenario-to-behavior spot check

command: (render-mode + content check against the real built app — `next start`, `curl`)
exit: 0
at: 2026-10-26T13:24:30Z

### Rendering-mode claim — independently confirmed (status codes)

Started the built app (`npx next start -p 4390`) and probed the route table the
Refactorer claimed was unchanged:

| path | HTTP status | note |
|---|---|---|
| `/` | 200 | Spanish home (default locale) |
| `/en` | 200 | SSG |
| `/fr` | 200 | SSG |
| `/de` | 200 | SSG |
| `/it` | 200 | SSG |
| `/es` | **404** | `es` is the default locale rendered at `/`, not a `[locale]` param |
| `/xx` | **404** | `dynamicParams: false` → no on-demand render for an unenumerated locale |
| `/en/` | **308** → `/en` | trailing-slash redirect |

`/xx` returning 404 (not an on-demand 200) is the decisive confirmation that
`dynamicParams: false` is still in force after the page→layout move — a regression to
`dynamicParams: true` would render `/xx` as a 200 `[locale]` page.

### Static-prerender evidence — not trusting the report

- **Build route markers (verbatim):** `○ /` (static) and `● /en /fr /de /it` (SSG,
  `generateStaticParams`), `ƒ /admin/*` and `ƒ /api/admin/*` (dynamic), `○ /_not-found`
  (static). "Generating static pages (21/21)".
- **`prerender-manifest.json`:** `routes` keys include `/`, `/en`, `/fr`, `/de`, `/it` (all
  `"compute":"static"`); `dynamicRoutes` contains `/[locale]` with **`"fallback": false`**
  and `"fallbackRootParams": []` — the machine-readable form of `dynamicParams: false`.
  `/es` and `/xx` are absent from `routes`, so they are not prerendered and (per `fallback:
  false`) 404 rather than render on demand.

The effective route config is therefore unchanged: `dynamic: force-static` lives on the page
(`app/(public)/[locale]/page.tsx:5`) and `dynamicParams = false` now lives on the layout
(`app/(public)/[locale]/layout.tsx:10`); Next folds route-segment config from both into the
same policy, exactly as the layout's own comment states. No silent regression.

### Served `/` still carries the revision-2 content (spot check)

- **Countdown:** `<span class="countdown__numeral">16</span> <span class="countdown__unit">años</span>`,
  `<span class="countdown__year">2042</span> … año del umbral`, `countdown__range` =
  `variantes 2039–2043`. All three tokens present.
- **Pyramid:** 3 `demography__svg` panels (6 = 3 × static-HTML + RSC flight), 21 `scope="row"`
  rows per year (`scope="row"` × 67), `<table>` + `<caption>` emitted.
- **Reproducir section (`id="reproducir"`):** the command rows are exactly
  `compute.ts --figure fig-01`, `compute.ts --figure fig-02`, `compute.ts --series countdown`,
  `compute.ts --series pyramid` (each ×2 = static HTML + RSC flight). A whole-page grep for
  `compute.ts --figure fig-03` … `fig-07` returns **zero** — the section advertises only
  `fig-01`/`fig-02` (plus the two series), as required.

Both spot-checked behaviours hold on the served build, not fixtures.

---

## No unaccounted behavior

The fix's entire surface is the move of `export const dynamicParams = false` from
`app/(public)/[locale]/page.tsx` to a new `app/(public)/[locale]/layout.tsx` plus a
pass-through `LocaleLayout` (`children => children`, no markup, no logic). It traces to the
attempt-1 component-per-file FAIL and to the Next route-segment-config convention
(`dynamicParams` is a route-segment config export, valid on any segment). No helper, no logic,
no behaviour appears that is not accounted for. `git diff` confirms the only page change is
`-export const dynamicParams = false;` (and the `layout.tsx` addition); `generateMetadata`,
`generateStaticParams`, and `dynamic` are untouched.

---

## Audit-trail gate

command: .standards/scripts/check-audit-trail.sh 001-pension-math
exit: 0

All folder artefacts present (10-tasks.md, 20-acceptance/ with `## AC-NNN-NN` headings,
25-verification.md, 30-report.md, 15-design.md, 40-deploy.md) and all five contract evidence
blocks resolve. PASS.

---

## Overall verdict (attempt 2)

**Verdict: PASS**

- scenario traceability — PASS (99/99 visible to the gate, exit 0; 107/107 by grep; 8
  three-digit-suffix scenarios invisible to the gate's regex — documented limitation, not a
  deliverable gap)
- full test suite — PASS (505 tests / 40 files, exit 0; tsc/eslint/build/verify:derived all exit 0)
- complexity gate — PASS (ESLint `complexity ≤6`, exit 0)
- design-principles gate — PASS for the deliverable (the attempt-1 component-per-file FAIL is
  gone; `PASS Component-per-file: no violations`; sole remaining FAIL is the out-of-scope
  `.standards/skills/hallmark/site/examples/cobalt-01/script.js` CC=10)
- scenario-to-behavior spot check — PASS (rendering mode independently re-confirmed: 200/404/308
  table correct, `prerender-manifest` `fallback: false`, locale routes SSG; served `/` carries
  the countdown 16/2042/2039–2043, the pyramid, and a Reproducir section advertising only
  fig-01/fig-02)

Refactorer claims reproduced: the `[locale]` page now exports 4 (component-per-file clean); the
effective route config is unchanged (`dynamicParams: false` + `dynamic: force-static`, proven by
the 404 on `/xx` and `fallback: false` in the manifest); the route table and prerender-manifest
are unchanged; 505 tests pass with no test edited. The blocked finding is resolved with no
regression on the one axis that could have silently changed — rendering mode.

Flagged to the Architect (non-blocking, carried forward unchanged): 29 project-source
KISS/DRY WARNs plus the single out-of-scope `.standards` FAIL.

## Quality gates

# 30 — Report: pension-math

Stage 5a (Mutation Runner), **revision-2 refresh**. Conformance tier `production`, so the mutation
gate applies. Read `25-verification.md`, `10-tasks.md`, `20-acceptance/`, `15-design.md`. Did **not**
read `00-informal.md`.

**Verdict: GREEN**

- Mutation score on the **expanded** scope: **91.69 %** (92.64 % over covered mutants) across
  **33 files / 2532 mutants**, threshold ≥ 80 %.
- **`web/series/**` measured separately: 89.20 % (91.03 % covered), 398 mutants.** It cleared the
  80 % line, but it started this refresh at **77.39 %** — below the line — and that was the real
  finding on the new code. Round 1 (baseline) is recorded below; it is what revision 2 looked like
  before this stage wrote a single test.
- **Both encoding traps are now covered by assertions that kill the mutants**: the label-resolved
  21-band mapping (`age-bands.ts` 97.62 % of 42 mutants, one survivor proven equivalent) and the
  total-vs-sexes reconciliation (`assertSexTotals` + its message, both killed). Detail in
  §The two encoding traps.
- **F1 block: unchanged at 15/18, all three survivors equivalent** — same three coordinates as the
  previous report. Not re-opened, not re-litigated.
- Rounds this refresh: **2** (baseline + one test batch), the bound set by the brief.
- Final full suite: **522 tests, 41 files, 0 failures** (was 505; this stage added 17).
- App builds: `npm run build` exit 0 (21/21 static pages), `tsc --noEmit` exit 0, `eslint` exit 0.
- No production code and no existing test was modified. Two files changed: one new test file, and
  the `mutate` globs in `stryker.config.mjs` (scope widening, per §Mutation configuration).

---

## Revision history

| When | Verdict | Score | Scope | Tests | What the tree looked like |
|---|---|---|---|---|---|
| 2026-10-25T23:25:50Z | GREEN | 92.74 % total / 93.51 % covered, 1846 mutants | 28 files, `web/metrics\|manifest\|sources\|ingest/**` | 388 | **Before F1 was fixed**: `centralCellOf` compared a deflated `rPaidReal` against a nominal band centre, so `fig-05` threw and 18 mutants were un-killable. |
| 2026-10-26T08:16:47Z | GREEN | **93.83 % total / 94.40 % covered**, 1846 mutants | 28 files (same) | 415 | After the F1 fix, the hero-ladder swap and the percent-scale fix. **This is the figure the brief calls "the 93.83 %".** |
| **2026-10-26T14:27:38Z** (this refresh) | GREEN | **91.69 % total / 92.64 % covered**, **2532 mutants** | **33 files** — `web/series/**` added (398 mutants); `web/ingest/**` grew by three revision-2 files (200 mutants) | **522** | **Revision 2 exists**: T17 age structure (`age-bands`, `age-structure`, `PyramidPlate`), T18 countdown (`countdown`), the series ingest harness (`run-series`, `series`, `series-types`), the three new datasets, and revision-2 amendments to `definitions`/`validate`/`eurostat`/`figures`. |

**The 93.83 % figure was measured on a tree that did not contain revision 2. It must not be read as a
claim about this one, and its headline is not comparable to the 91.69 % above** — the denominator grew
from 1846 to 2532 mutants, and 598 of the newcomers sit in code that did not exist when 93.83 % was
measured (`web/series/**` ×398, `web/ingest/{run-series,series,series-types}.ts` ×200).

The like-for-like comparison is the same 28 files that made up the previous run's scope, which this
run puts at **93.12 % / 93.80 % covered over 1934 mutants** — 0.71 points below the previous 93.83 %.
That small drop is itself revision 2's: those 28 files gained 88 mutants and 19 more non-killed mutants
from the revision-2 amendments (`definitions.ts` grew for the two series definitions, `validate.ts` for
`snapshotYear`, `eurostat.ts` for `resolveCountUnit`, `figures.ts` for the projection horizon), and
`definitions.ts` fell from 92.23 % to 87.60 % on the new id predicates and definition text.

---

## Precondition

`specs/001-pension-math/25-verification.md` exists and its most recent overall verdict is **PASS**
(revision-2 attempt 2): scenario traceability 99/99 visible to the gate (107/107 by grep, the gate's
regex limitation disclosed), full suite 505/40, complexity gate exit 0, design-principles gate PASS
for the deliverable (the attempt-1 `component-per-file` FAIL resolved by the page→layout move; sole
remaining FAIL is the out-of-scope `.standards/` hallmark example), scenario-to-behavior spot check
PASS against the built app. Mutation work ran on that basis; nothing below re-litigates it.

The working tree is dirty and every dirty entry is this pipeline's own uncommitted output (`specs/`,
`tests/`, `web/`, `app/`, `scripts/`, `data/`, `stryker.config.mjs`, `package.json`). Stage 5b
commits them. Nothing was stashed, reverted or auto-committed. During mutant verification
`web/series/*.ts`, `web/ingest/series.ts` and `web/ingest/run-series.ts` were mutated in place and
restored **byte-identically** (md5 verified before and after each probe — see §Tests added).

---

## Mutation configuration

The only configuration change is the scope widening the brief asked for. **No mutator was disabled,
no threshold was changed, no `// Stryker disable` comment was added anywhere.**

```
mutate:
  web/metrics/**/*.ts
  web/manifest/**/*.ts
  web/sources/**/*.ts
  web/ingest/**/*.ts
  web/series/**/*.ts        ← added by this refresh (revision-2 calculation surface)

testRunner:        vitest          vitest.configFile: vitest.config.ts
coverageAnalysis:  perTest         timeoutMS: 30000   timeoutFactor: 2   concurrency: 4
reporters:         clear-text, progress, json          jsonReporter: reports/mutation/mutation.json
thresholds:        high 80, low 80, break null         (reported, not enforced — this report is the verdict)
disableTypeChecks: false           (vitest transpiles via oxc and never type-checks)
ignorePatterns:    .opencode, .standards, specs, .github, .githooks, .playwright-mcp,
                   data/pending, data/proposals, tsconfig.tsbuildinfo, runs.jsonl
```

Still **excluded**, unchanged from the previous report: `web/components/**` and `app/**` (React/Next
markup — revision 2's `PyramidPlate`, `CountdownBlock` and `ScopeMark` live there), `web/content/**`
(presentation formatting), `data/**` and generated files, `.standards/**` (submodule, off-limits),
and `scripts/*.ts` (CLI entry points that run `process.exit(main())` at import time and are only
exercised as subprocesses — a mutant there is a permanent 0 % that measures nothing; the logic they
delegate to is in the five in-scope areas).

**Explicitly stated rather than silently excluded:** revision 2's series *rendering* (`web/components/
series/**`, `web/components/public/ScopeMark.tsx`, `web/seo/**`) is outside the mutation scope, for
the same reason `web/components/**` always was. Its evidence is the revision-2 acceptance suite plus
the Verifier's live render check, not a mutation score. `web/series/**` — the calculation the
rendering displays — **is** in scope, and that is the change this refresh makes.

### Scope as measured

| Area | Files | Mutants | Why it is in scope |
|---|---|---|---|
| `web/metrics/**` | 8 | 298 | calculation kernels (ratio, GDP share, cohort IRR, implicit debt, required base growth, growth rate, NPV/root finding, rounding) |
| `web/manifest/**` | 5 | 517 | manifest validation, hashing, definition registry (now including the two series definitions), formula registry, reproduce-path resolution |
| `web/sources/**` | 8 | 499 | JSON-stat / INE parsing, unit conversion, year alignment, catalogue, labels, freshness |
| `web/ingest/**` | 9 | 820 | figure + **series** compute harnesses, figure validation, deterministic JSON, derived-file IO |
| `web/series/**` | 3 | 398 | **revision 2**: age banding, age structure/shares/readouts, dependency ratio + threshold crossing |

`web/manifest/types.ts` and the other pure-type modules generate no mutants and therefore do not
appear; a module that declares runtime constants beside its types (`web/ingest/series-types.ts`, 13
mutants) does.

---

## Rounds run this refresh

Two — the bound set by the brief. Round 1 is a baseline with **no test changes**; round 2 is the
single test batch. This is a refresh on new code, not a rescue, so there is no round 3.

| Round | Score (total) | Score (covered) | killed | timeout | survived | no coverage | runtime errors | `web/series/**` | ended (UTC) |
|---|---|---|---|---|---|---|---|---|---|
| 1 — baseline on the revision-2 tree | 88.27 % | 89.77 % | 2217 | 2 | 253 | 42 | 18 | **77.39 %** (79.59 % covered) | 2026-10-26T13:59:01Z |
| 2 — after `tests/unit/series-coverage-gaps.test.ts` (17 tests) | **91.69 %** | **92.64 %** | **2303** | **2** | **183** | **26** | **18** | **89.20 %** (91.03 % covered) | 2026-10-26T14:27:38Z |

Score convention (Stryker's own): `(killed + timeout) / (total − runtimeErrors)`; `covered` further
excludes no-coverage mutants.

Round 1 was the finding the brief anticipated: **`web/series/**` at 77.39 % is below the 80 % gate**,
and it was not a rounding artefact — `age-structure.ts` sat at 70.81 % and `countdown.ts` at 79.49 %,
with the worst block being the *published readout* (`over65`/`under20`), where 15 mutants were
untested. The three new `web/ingest` files were also weak on first measurement (`series.ts` 41.67 %,
`series-types.ts` 0 %, `run-series.ts` 80.00 %), and they dragged the whole `ingest` area from 94.72 %
to 86.94 %. Round 2 lifts `series` to 89.20 % and `ingest` to 91.79 %.

### What round 2 changed, per file

| File | Round 1 | Round 2 | Mutants killed by the new file |
|---|---|---|---|
| `web/series/age-bands.ts` | 92.86 % | **97.62 %** | 3 (2 killed, 1 equivalent) |
| `web/series/age-structure.ts` | 70.81 % | **87.58 %** | 27 |
| `web/series/countdown.ts` | 79.49 % | **88.72 %** | 18 |
| `web/ingest/series.ts` | 41.67 % | **86.67 %** | 27 |
| `web/ingest/series-types.ts` | 0.00 % | **92.31 %** | 12 |
| `web/ingest/run-series.ts` | 80.00 % | 80.00 % | 0 |

---

## Results

### Per area

| Area | Mutants | Killed | Timeout | Survived | No coverage | Runtime errors | Score (total / covered) |
|---|---|---|---|---|---|---|---|
| `web/metrics/**` | 298 | 278 | 1 | 17 | 2 | 0 | 93.62 / 94.26 |
| `web/manifest/**` | 517 | 482 | 0 | 31 | 2 | 2 | 93.59 / 93.96 |
| `web/sources/**` | 499 | 450 | 1 | 45 | 3 | 0 | 90.38 / 90.93 |
| `web/ingest/**` | 820 | 738 | 0 | 55 | 11 | 16 | 91.79 / 93.06 |
| **`web/series/**`** | **398** | **355** | **0** | **35** | **8** | **0** | **89.20 / 91.03** |
| **All files** | **2532** | **2303** | **2** | **183** | **26** | **18** | **91.69 / 92.64** |

### Per file (round 2, verbatim from the run)

```
web/ingest/deterministic-json.ts           mut=  14  killed=  14  surv= 0  nocov= 0  err= 0   100.00
web/ingest/figures.ts                      mut= 213  killed= 188  surv= 8  nocov= 3  err=14    94.47
web/ingest/run-compute.ts                  mut= 200  killed= 186  surv=10  nocov= 4  err= 0    93.00
web/ingest/run-series.ts                   mut= 125  killed= 100  surv=22  nocov= 3  err= 0    80.00
web/ingest/series-types.ts                 mut=  13  killed=  12  surv= 1  nocov= 0  err= 0    92.31
web/ingest/series.ts                       mut=  62  killed=  52  surv= 7  nocov= 1  err= 2    86.67
web/ingest/types.ts                        mut=  11  killed=  11  surv= 0  nocov= 0  err= 0   100.00
web/ingest/validate-figure.ts              mut= 165  killed= 160  surv= 5  nocov= 0  err= 0    96.97
web/ingest/write-derived.ts                mut=  17  killed=  15  surv= 2  nocov= 0  err= 0    88.24
web/manifest/definitions.ts                mut= 131  killed= 113  surv=14  nocov= 2  err= 2    87.60
web/manifest/formula-ids.ts                mut=  16  killed=  15  surv= 1  nocov= 0  err= 0    93.75
web/manifest/hash.ts                       mut=  33  killed=  31  surv= 2  nocov= 0  err= 0    93.94
web/manifest/repo-file.ts                  mut=  16  killed=  16  surv= 0  nocov= 0  err= 0   100.00
web/manifest/validate.ts                   mut= 321  killed= 307  surv=14  nocov= 0  err= 0    95.64
web/metrics/cohort-irr.ts                  mut=  50  killed=  48  surv= 2  nocov= 0  err= 0    96.00
web/metrics/contribution-cover.ts          mut=  38  killed=  38  surv= 0  nocov= 0  err= 0   100.00
web/metrics/dependency-ratio.ts            mut=  40  killed=  40  surv= 0  nocov= 0  err= 0   100.00
web/metrics/implicit-debt.ts               mut=  10  killed=  10  surv= 0  nocov= 0  err= 0   100.00
web/metrics/npv.ts                         mut=  90  killed=  73  surv=15  nocov= 2  err= 0  to=1  81.11
web/metrics/pension-share.ts               mut=  36  killed=  36  surv= 0  nocov= 0  err= 0   100.00
web/metrics/required-base-growth.ts        mut=  29  killed=  29  surv= 0  nocov= 0  err= 0   100.00
web/metrics/rounding.ts                    mut=   5  killed=   5  surv= 0  nocov= 0  err= 0   100.00
web/series/age-bands.ts                    mut=  42  killed=  41  surv= 1  nocov= 0  err= 0    97.62
web/series/age-structure.ts                mut= 161  killed= 141  surv=14  nocov= 6  err= 0    87.58
web/series/countdown.ts                    mut= 195  killed= 173  surv=20  nocov= 2  err= 0    88.72
web/sources/countries.ts                   mut=  59  killed=  55  surv= 4  nocov= 0  err= 0    93.22
web/sources/eurostat.ts                    mut= 210  killed= 188  surv=20  nocov= 2  err= 0  to=1  89.52
web/sources/freshness.ts                   mut=  29  killed=  29  surv= 0  nocov= 0  err= 0   100.00
web/sources/ine.ts                         mut=  70  killed=  67  surv= 3  nocov= 0  err= 0    95.71
web/sources/labels.ts                      mut=  47  killed=  37  surv=10  nocov= 0  err= 0    78.72
web/sources/live.ts                        mut=  44  killed=  40  surv= 4  nocov= 0  err= 0    90.91
web/sources/load.ts                        mut=  28  killed=  23  surv= 4  nocov= 1  err= 0    82.14
web/sources/types.ts                       mut=  12  killed=  12  surv= 0  nocov= 0  err= 0   100.00
```

One file remains below 80 % individually — `web/sources/labels.ts` at 78.72 % — exactly as in every
prior run; its ten survivors are all proven equivalent (§Equivalent mutants). No file in the
revision-2 surface is below the line.

---

## The two encoding traps

The brief singled these out, correctly: mutants here matter more than the aggregate. Both traps are
now killed, and the assertions behind them are exact, not "defined and non-zero".

### Trap 1 — the band mapping (`Y_OPEN` vs `Y_GE100`)

`bandOfAgeLabel` resolves the open-ended band from the payload's own **labels**, because `demo_pjan`
publishes `Y_OPEN` `"Open-ended age class"` and `proj_23np` publishes `Y_GE100` `"100 years or over"`.
A hardcoded code would silently drop the 100+ band from one dataset.

| Mutant | Status | What kills it / why it cannot be killed |
|---|---|---|
| `age-bands.ts:22:27` Regex `\s*`→`\s` (single space only) | **Killed** | new: `bandOfAgeLabel('5  years')` → 5. The function normalises whitespace; two spaces must still band. |
| `age-bands.ts:36:10` ConditionalExpression `age >= OPEN_BAND`→`false` (always take the `floor` branch) | **Killed** | new: `bandOfAgeLabel('105 years')` → `OPEN_BAND` (100); the `floor` branch would answer 105, i.e. invent a band above the open one. |
| `age-bands.ts:36:10` EqualityOperator `>=`→`>` | Equivalent | At age exactly 100 the `floor` branch computes `floor(100/5)*5 = 100 = OPEN_BAND`; at every other integer age both forms take the same branch. Proven, not assumed: the same test pins 100→100 and 105→100. |

The hardcoded-code trap itself was already covered by the pre-existing rename test
(`population-pyramid.test.ts:88` renames `Y_OPEN`→`ZZ_OPEN_99` and asserts the band still resolves by
label). That test does what it claims: a code-keyed read cannot pass it.

### Trap 2 — the total-vs-sexes sum (`sex=T` is the denominator, `M`/`F` are the halves)

`assertSexTotals` refuses a payload whose `M + F ≠ T` for any band, and every published share divides
by the year's `Total` row.

| Mutant | Status | What kills it / why it cannot be killed |
|---|---|---|
| `age-structure.ts:176:57` ArithmeticOperator — the thrown message's `${male + female}`→`${male - female}` | **Killed** | new: the double-count fixture must throw a message naming the computed sums (`/males \+ females \(2\)/`, `/the sex total \(3\)/`). A build that stops must say why correctly. |
| `age-structure.ts:194:7` / `194:50` / `195:27` — the re-check inside `bandCounts` (condition, throw body, message) | Equivalent (3) | `bandCounts` is module-private and only reachable through `readAgeCounts`, which has already run `assertSexTotals` over exactly these entries. The check cannot fire, so neither its body nor its message is ever evaluated. |
| `age-structure.ts:228:57` / `232:27` / `233:28` — the count sums and the `>= 65` / `< 20` predicates behind `over65`/`under20` | **Killed** | new: the readouts are pinned as literals per year (`14.98/25.14`, `20.72/18.40`, `32.68/16.00`), independently decoded from the committed snapshots. Before this, `over65` was only ever asserted to render. |
| `countdown.ts:83:7` / `83:46` — the sex guard (`point.coords.sex !== codes.sex`) | **Killed** | new: the synthetic ratio payload's 2025 halves (1400 + 1600) do **not** sum to its total (3000), so summing the halves reads 57.14 where the `Total` row reads 50.00. A sex-blind sum is now a failing test. |
| `countdown.ts:84:10` ×2 — the variant guard | **Killed** | new: the same payload carries a second variant; dropping the guard reads 50.83 instead of 50.00 (and the `false` form empties the series). |

**Verdict on the traps: the assertions were weaker than claimed in two places, and both are now
fixed** — the readout claim (`over65`/`under20`) had no value assertion at all, and the `Total`-row-only
rule for the dependency ratio was only ever exercised against a payload whose halves reconcile
(where summing them is arithmetically invisible).

---

## F1 block status (still relevant, unchanged)

F1 was the `centralCellOf` defect (a *deflated* `rPaidReal` compared against a *nominal* band centre,
so `fig-05` always threw). The previous report recorded the 18 mutants it had blocked as
**15 killed + 3 equivalent** once the fix landed. This run reproduces exactly that, at the same
coordinates:

| Coordinate | Mutator | Status | Class |
|---|---|---|---|
| `web/ingest/figures.ts:244:7` | ConditionalExpression (`if (!cell)` never throws) | Survived | equivalent — the grid is swept over `[min, central, max]` and `DEFAULT_G_WAGE_SWEEP` contains `ASSUMED_REAL_WAGE_GROWTH`, so the cell always exists; the guard is unreachable for the shipped constants |
| `web/ingest/figures.ts:244:30` | StringLiteral (the throw's message) | NoCoverage | equivalent — same unreachable branch |
| `web/ingest/figures.ts:261:14` | ObjectLiteral (`horizon: { ...PROJECTION_HORIZON }` → `{}`) | Survived | equivalent — `sensitivityGrid` discards `value.horizon`; a cell carries only `gWage`, `rPaidNominal`, `rPaidReal`, `gRequired`, `gap` |

The neighbouring `figures.ts:252` cluster (the `cohort.central === null || cohort.band === null` guard)
is unchanged too: three killed, three equivalent (`central` and `band` are null under exactly the same
condition — an empty grid).

**F1 is closed. It is not re-opened by revision 2 and it is not part of the 91.69 % shortfall.**

---

## Equivalent mutants (111) — no test can distinguish them

111 of the 209 non-killed mutants are equivalent or dead. Each group is counted once; the counts
sum to 111.

| File | Coordinates | Count | Why it is un-killable |
|---|---|---|---|
| `web/series/age-bands.ts` | 36:10 (`>=`→`>`) | 1 | See Trap 1 — both forms agree on every integer age because 100 is a multiple of the band width. |
| `web/series/age-structure.ts` | 139:73, 194:7, 194:50, 195:27, 260:53, 262:109 | 6 | `139:73` the trailing `?? ''` on `point.coords.age` is dead (`decodeCoords` fills every dimension in `id`, so it is always a string). `194:7/194:50/195:27` the `bandCounts` re-check cannot fire (see Trap 2). `260:53` the projection payload the product ingests (`eurostat-proj-23np`) publishes exactly one projection category (`size[1] = 1`, verified in the committed snapshot), so dropping the variant filter changes nothing. `262:109` the `?? 'measured'` fallback is unreachable: 1995 and 2025 are both keys of `OBSERVED_HUES`. |
| `web/series/countdown.ts` | 59:7 (×2), 59:47, 99:41, 214:7, 247:17 | 6 | `59:7`/`59:47` `ratioOf`'s zero-denominator guard is unreachable: `readDependencySeries` filters `denominator > 0` first and `observedDependency` guards `denominatorPopulation > 0`. `99:41` dead `?? ''` (as above). `214:7` with `year === null`, `projectedAt` yields null through `?? null` and `observedDependency` yields null, so the next guard returns the same null. `247:17` `pinned[pinned.length − 1] ?? snapshotYear` is unreachable — `pinned.length > 0` is enforced by the throw above it. |
| `web/ingest/run-series.ts` | 44:13, 56:13, 61:37 | 3 | `44:13`/`56:13` the `kind: 'failure'` discriminant is never read: `applyInspection` falls through to its `else` for any kind that is neither `ok` nor `unresolved`. `61:37` `evaluateFreshness` returns a non-empty `reason` on every `fresh: false` path (three branches, all with a message), so the `?? 'outside freshness window'` fallback is dead. |
| `web/ingest/series-types.ts` | 20:10 | 1 | `typeof value === 'string' && SERIES_IDS.includes(value)` — `includes` already rejects every non-string, so dropping the `typeof` operand changes no answer. |
| `web/ingest/series.ts` | 22:7, 22:8, 22:44, 28:12 | 4 | `22:*` `payloadOf`'s unresolved guard and its message are unreachable: the harness only calls `compute` after `unfinishedOutcome` verified every requirement source resolved. `28:12` `value.years[0]?.bands` is dead — `computePyramid` always returns three years or throws. |
| `web/ingest/figures.ts` | 33 (×3), 88 (×2), 244 (×2), 252 (×3), 261 | 11 | Carried forward unchanged: `payload()`'s throw and `spanOf`'s empty branch are unreachable; the F1 group is the table above; the `252` guard is redudantly two-sided. |
| `web/ingest/run-compute.ts` | 65, 128 (+ dead 95, 209, 292, 347) | 6 | Carried forward: the `missingForCountry` branch is shadowed, `parsed <= oldest` and `parsed < oldest` agree at equal timestamps, the three `??` fallbacks never fire, and `hashInputBytes` has no production caller. |
| `web/ingest/validate-figure.ts` | 29, 122 (×2) | 3 | Carried forward: the membership test alone rejects the same non-strings; `identity.length > 0` is implied by an unknown id. |
| `web/ingest/write-derived.ts` | 6, 22 | 2 | `DERIVED_DIR` is a re-export with no reader in scope; `writeFileSync` accepts a Buffer, so the `'utf8'` argument's removal round-trips to the same bytes. |
| `web/manifest/definitions.ts` | 36 (×3), 40, 152, 158, 166, 183, 231, 233 (×4), 254 (×2) | 15 | `36`/`40`/`166` — `includes` rejects the same non-strings the `typeof` guard rejected. `152`/`158` — the `definitionId` field inside `SERIES_DEFINITIONS` records has no reader (only `.definition` and `.formulaId` are read). `183`/`254` — `firstDefinitionOf` can only throw for a metric outside the closed `MetricId` union. `231`/`233` — for every metric that *has* an international definition it is also the first definition of that metric, so the `?? firstDefinitionOf(...)` fallback resolves to the same object; for national-only metrics `find` already returned undefined. |
| `web/manifest/validate.ts` | 145 (×8) | 8 | Carried forward: the `reproducePath` pass inside `manifestFieldProblems` is called with `fileExists = () => true`, so `checkReproducePath` can never produce `missingFile` — the `.filter`, both arrow operands, the equality, the boolean and the `""` literal are all dead. |
| `web/manifest/hash.ts` | 14, 20 | 2 | Carried forward: the closed-set/pattern check rejects the same non-strings; `/\.\d{3}Z$/`→`/\.\d{3}Z/` is a no-op because `toISOString()` always ends with the millisecond group. |
| `web/manifest/formula-ids.ts` | 19 | 1 | Same shape as `hash.ts:14`. |
| `web/metrics/npv.ts` | 40, 42, 65 (×7), 66, 86, 91 (+ dead 41 ×5) | 17 | Carried forward: the root is invariant to a positive rescaling of every flow; `<=`→`<` differs only at an exact-equality boundary float bisection never lands on; `86`'s `!== 1` is masked by `initialBracket` returning null for the same inputs; `41`'s `scale === 0` branch is unreachable (an all-zero flow set has zero sign changes and returns null first). |
| `web/metrics/cohort-irr.ts` | 66 (×2) | 2 | `<= 0`→`< 0` differs only at exactly zero contribution, where the sign-change gate already returns null. |
| `web/sources/labels.ts` | 6, 7, 18, 19, 29, 31, 33 (×4), 36 | 10 | Carried forward: dropping `^`/`\.` is a no-op for the shipped catalogue; `split('')`/`join('')` transform both sides of every comparison identically; the `byDataset` short-circuit and the exact-host branches all fall through to the registered-domain lookup, which selects the same declaration for every URL in `SOURCE_DECLARATIONS`. |
| `web/sources/countries.ts` | 64 (×2), 110 (×2) | 4 | `isPublishedGeo` is gated by the closed `PUBLISHED_GEOS` list; a national definition's lookup returns `null` before the `sourceIds.length` check matters. |
| `web/sources/live.ts` | 38 (×2), 54, 67 | 4 | `LIVE_URLS` only contains declared source ids, so the guard and the `find` predicate in `declaration()` cannot take their other branch; the `Z$` anchor is redundant for `toISOString()` output. |
| `web/sources/ine.ts` | 23, 45, 50 | 3 | Replacing the `typeof payload !== 'object'` operand leaves sibling checks catching exactly the same inputs. |
| `web/sources/load.ts` | 39 | 1 | The `dir = 'data/snapshots'` default is never taken; every caller passes its own path. |
| `web/sources/eurostat.ts` | 131 | 1 | `resolveCountUnit`'s return value has no reader inside the mutated scope (callers use it for validation only), so emptying the returned object changes nothing. |

---

## Reachable residual gaps (98) — named with the assertion that would kill each

Real gaps, not equivalents. They are recorded rather than chased because the refresh budget is two
rounds, the gate is met, and **none of them sits on a published calculation** — they are guards,
fallbacks, error text and provenance fields. Grouped by the single assertion that would kill each
cluster.

| File | Mutants | Coordinates | What would kill it |
|---|---|---|---|
| `web/series/age-structure.ts` | 7 | 185:7 (×3), 185:30 (×2), 185:42, 186:27 | **A year whose `Total` row is missing or zero must be refused, not published as a panel of NaN.** `yearTotal`'s guard — and its throw body and message — has zero coverage: the one test that reaches a missing year (`computePyramid` with `demo_pjan` as the projection) throws earlier, in `resolveCategoryCode`, because that payload has no `projection` dimension. Assert `computePyramid({observed: payloadWithBandsButNoTotal, projected})` throws `/no total population for 1995/`. **Highest-value residual in this report.** |
| `web/series/age-structure.ts` | 3 | 275:10, 275:81 (×2) | `openBandShare` — assert `openBandShare(value, 1900)` is `undefined` (the optional chain) and `openBandShare(value, 1995)?.band === OPEN_BAND` (the predicate). Today the open-band helper is only asserted `toBeDefined()` and `.total > 0`, which band 0 also satisfies. **Second-highest value** — it is the trap's own helper. |
| `web/series/age-structure.ts` | 2 | 120:12, 126:7 | A payload publishing a fourth sex code (neither M/F/T) and one publishing `' Total '` with surrounding whitespace. |
| `web/series/age-structure.ts` + `countdown.ts` | 3 | `age-structure` 128:7, 138:7; `countdown` 97:9 | A payload with a non-numeric `time` code (`Number('TOTAL')` → NaN) — the shared "not a year" guards. |
| `web/series/countdown.ts` | 5 | 177:10, 217:7 (×3), 217:29 | **A back-cast whose projection side or observation side is missing must be `null`.** An observation whose latest year precedes the projection's first year (e.g. an observed payload carrying only 1995 against a series starting 2022). |
| `web/series/countdown.ts` | 2 | 117:28 (×2) | A year whose 65+ count is `0` with the denominator present is skipped by `numerator > 0` — assert that year is absent. |
| `web/series/countdown.ts` | 4 | 129:10, 130:25 (×2), 130:41 | A payload publishing a blank (`''`/`'  '`) projection code must be filtered out of `projectionVariants`. |
| `web/series/countdown.ts` | 3 | 84:10, 136:42, 153:10 (×2) | `readDependencySeries(demo_pjan)` (no variant → `variant === null` branch), `firstYearAtOrAbove([{year: 2020, ratio: 50}], 50) === 2020` (exact-threshold equality), and `lastObservedYear(payload, 1900) === null` (empty filter). |
| `web/ingest/run-series.ts` | 6 | 92:12 (×3), 92:36 (×3) | **`manifest.fetchedAt` must be the oldest source retrieval.** No assertion on `run-series`' manifest date exists (the figures equivalent, AC-001-01's "stamps the oldest source retrieval", covers `run-compute` only). Assert it equals the oldest of the three snapshots' `retrievedAt`, on snapshots whose timestamps differ. |
| `web/ingest/run-series.ts` | 6 | 116:17, 116:18 (×2), 116:62, 116:76, 116:131 | **A series' `inputHash` must change when an input snapshot's bytes change** (AC-001-02 exists for figures, not for series). |
| `web/ingest/run-series.ts` | 4 | 97:10, 136:24, 156:24, 194:104 | Duplicate source URLs are de-duplicated; an unavailable series carries `unresolvedSources` equal to its requirement list; a computed series carries `unresolvedSources: []` and no problems. |
| `web/ingest/run-series.ts` | 2 | 212:15 | **The harness exit code.** `results.some(...)`→`every(...)`: run both `SERIES` with one snapshot broken and assert `exitCode === 1`. |
| `web/ingest/run-series.ts` | 3 | 61:17, 182:13, 184:50 | The stale-snapshot detail names the age (`/days old/`); the manifest-invalid detail names the field and code; the unavailable reason is `'manifest did not validate'`. |
| `web/ingest/run-series.ts` | 1 | 51:71 | An unresolved snapshot with no `unresolvedReason` falls back to `'series not specified'`. |
| `web/ingest/run-series.ts` | 1 | 196:61 | A non-`Error` thrown from a series `compute`. |
| `web/ingest/series.ts` | 4 | 44:23, 45:26, 48:15, 49:18 | The countdown assumptions when a variant does not cross and when the back-cast is null (the `variantsCrossing` filter and the two `backCast === null` branches). With the shipped data all six variants cross and the back-cast exists, so both are invisible. |
| `web/manifest/definitions.ts` | 1 | 160 | The `old-age-dependency-ratio` **definition text** is not pinned anywhere (the `age-structure` one is, via AC-001-94). Assert it names the 15–64 denominator and the baseline projection. |
| `web/manifest/validate.ts` | 6 | 29, 97 (×3), 98, 126 | `snapshotYear: 1900` / `2200` are accepted and the boundary rejections are named (`<=`/`>=` mutants survive); a manifest built without `snapshotYear` must not gain a `snapshotYear: undefined` key (assert `'snapshotYear' in manifest`); a non-array object with all-valid fields reaches `asRecord`'s `Array.isArray` operand. |
| `web/ingest/run-compute.ts` | 8 | 162, 210, 216, 234, 249, 270, 294, 325 | Carried forward unchanged: the `missing` hash token, the `'; '` separator, a failure with no `sourceId`, and `unresolvedSources: []` on each computed path. |
| `web/ingest/validate-figure.ts` | 2 | 57, 120 | Carried forward: a candidate with valid `availability` but no `figureId`, asserting `figureId: 'unknown'` in both problem lists. |
| `web/sources/eurostat.ts` | 21 | 44, 49, 56, 58 (×4), 77, 102, 123 (×4), 124 (×2), 125, 199 (×2), 202, 207 (×2), 262 | Carried forward plus revision-2 additions: `IngestError.name`; a payload whose `dimension` is absent; a payload with `value` but no `id`/`size`; an ascending-order assertion on `pointsFor`' sort; **new** — a payload with two unit categories or a blank unit code (`resolveCountUnit`'s filter and `entries.length !== 1` guard). The 21-mutant `eurostat.ts` cluster remains the largest single residual and the best next target. |
| `web/sources/load.ts` | 4 | 21, 32, 47, 48 | Carried forward: a file with neither `resolved` nor `payload`; `bytes` as a string; readdir order differing from sorted order; non-ASCII bytes. |

---

## Runtime errors (18) — excluded from the denominator, not untested behaviour

Stryker records a runtime error (and drops the mutant from both numerator and denominator) when a
mutant makes a suite throw at collection time rather than fail an assertion. All 18 are of one shape:

- `web/ingest/figures.ts` — 14, at each figure's `define({ … })` table entry (the argument object and
  its `figureId` literal, 7 figures × 2). `define()` resolves the published definition at module load,
  and several suites build their compute report at collection time.
- `web/ingest/series.ts` — 2, at `seriesDefinitionFor('age-structure')` / `…('old-age-dependency-ratio')`
  in the `SERIES` table (same shape, revision-2 file).
- `web/manifest/definitions.ts` — 2, at `150` (the `SERIES_DEFINITIONS` table entry) and `173`
  (`seriesDefinitionFor`'s throw, emptied).

This is a `perTest` adjudication limit, not a coverage hole: by hand, mutating `figureId: 'fig-01'` to
`''` fails 5 of 14 tests in the two files that most directly exercise the figure table, and mutating
the series definition id fails the manifest/hash suite. Three of them (`definitions.ts:152`/`158` and
the `definitionId` field) are additionally dead fields — see the equivalent table.

---

## Tests added by this refresh

**17 tests, in 1 new file. No existing test was modified, weakened, renamed or deleted. No production
code was edited.**

`tests/unit/series-coverage-gaps.test.ts` — every test drives the real modules; the synthetic
JSON-stat payloads are hand-built so that only one reading of the code can produce the expected
answer (the committed snapshots are single-variant and ascending, so a lost filter or a lost sort is
invisible through them).

| # | Assertion | Mutants killed |
|---|---|---|
| 1 | `bandOfAgeLabel('105 years' / '120 years') === OPEN_BAND`, `'100 years' === OPEN_BAND` | 1 (Trap 1 saturation) |
| 2 | `bandOfAgeLabel('  5  years ') === 5`, `'5  YEARS' === 5` | 1 (Trap 1 whitespace) |
| 3 | `over65`/`under20` pinned per year: `14.98/25.14`, `20.72/18.40`, `32.68/16.00` (independently decoded from the committed snapshots) | 15 (the whole `readoutOf` block) |
| 4 | `[year, state, hue]` per panel: `reference`, `measured`, `projected`; populations pinned | 5 |
| 5 | `excludedLabels === ['Total', 'Unknown']` (published value) | — |
| 6 | A two-variant projection reads **only** the pinned variant: totals 210, bands 22/41 | 2 (the projection filter, Trap 2-adjacent) |
| 7 | `excludedLabels` comes back **sorted** for a payload whose age order is `Unknown` before `Total` | 1 |
| 8 | The double-count message names both computed sums (`(2)` / `(3)`) | 1 (Trap 2 message) |
| 9 | A year with a population total but no bands is refused: `/age band 0 is missing for 2050/` | 3 |
| 10 | The ratio series is ascending, skips a year missing its denominator, and reads the `Total` row rather than the halves (50.00, not 57.14) and not the second variant (not 50.83) | 27 (incl. Trap 2 sex/variant guards) |
| 11 | `observedDependency` answers `null` when the published denominator has no population | 2 |
| 12 | `lastObservedYear` on a descending time axis answers 2025, not 2010 | 4 |
| 13 | A baseline variant that never publishes a complete year is refused: `/no baseline dependency series/` | 2 |
| 14 | `SERIES_IDS` / `SERIES_AVAILABILITY` closed sets; `isSeriesId` accepts both ids and rejects `'figure'`, `42`, `null` | 12 |
| 15 | `seriesById` resolves both series and answers `undefined` for an unknown id | 1 |
| 16 | The `age-structure` assumptions object, pinned field by field (bands, observedYears, projectedYear, variant, encoding, decimals, excludedLabels) | 13 |
| 17 | The `countdown` assumptions object, pinned field by field (threshold, denominator, variant, snapshotYear, the six-variant `variantsCrossing` string, backCast, observation) | 38 |

**Kill verification (not inferred from the score).** Each assertion was probed by applying the
mutation to the real source, running the new file, and restoring the file byte-identically
(md5 compared before/after — all 13 probes reported `restored=True`):

```
KILLED    band saturation (36:10 CondExpr->false)          (restored=True)
KILLED    whitespace tolerance (22:27 Regex)               (restored=True)
KILLED    sex-sum message operand (176:57)                 (restored=True)
KILLED    over65 predicate (232:27)                        (restored=True)
KILLED    projection filter removed (136:7)                (restored=True)
KILLED    excludedLabels sort (163:82)                     (restored=True)
KILLED    optional chaining (192:17)                       (restored=True)
KILLED    sex guard removed (83:7)                         (restored=True)
KILLED    year sort comparator (119:11)                    (restored=True)
KILLED    observed-year bound (152:75)                     (restored=True)
KILLED    denominator guard (172:10)                       (restored=True)
KILLED    empty-baseline throw (240:7)                     (restored=True)
KILLED    observedYears assumption (29:49)                 (restored=True)
```

---

## Evidence: mutation score (whole scope)

command: npx stryker run
exit: 0
at: 2026-10-26T14:27:38Z

```
series                   |  89.20 |   91.03 |      355 |         0 |         35 |        8 |        0 |
  age-bands.ts           |  97.62 |   97.62 |       41 |         0 |          1 |        0 |        0 |
  age-structure.ts       |  87.58 |   90.97 |      141 |         0 |         14 |        6 |        0 |
  countdown.ts           |  88.72 |   89.64 |      173 |         0 |         20 |        2 |        0 |
ingest                   |  91.79 |   93.06 |      738 |         0 |         55 |       11 |       16 |
sources                  |  90.38 |   90.93 |      450 |         1 |         45 |        3 |        0 |
manifest                 |  93.59 |   93.96 |      482 |         0 |         31 |        2 |        2 |
metrics                  |  93.62 |   94.26 |      278 |         1 |         17 |        2 |        0 |
All files                 |  91.69 |   92.64 |     2303 |         2 |        183 |       26 |       18 |
MutationTestExecutor  Done in 24 minutes and 18 seconds.
EXIT=0
```

Scope: **33 files, 2532 mutants** under `web/metrics/**`, `web/manifest/**`, `web/sources/**`,
`web/ingest/**` and `web/series/**`. Threshold for this tier: ≥ 80 %. Achieved **91.69 % total /
92.64 % covered**. `EXIT=0`; `thresholds.break` is `null`, so a non-zero exit would have meant a tool
failure, not a threshold miss — the verdict is asserted in this report, not delegated to the CLI. This
is the round-2 run, i.e. the tree described here.

---

## Evidence: `web/series/**` score (measured separately)

command: python3 -c "import json,collections; d=json.load(open('reports/mutation/mutation.json')); c=collections.Counter(m['status'] for p,f in d['files'].items() if p.startswith('web/series/') for m in f['mutants']); t=sum(c.values()); k=c['Killed']+c['Timeout']; print('web/series/**', dict(c), 'mutants', t); print('score %.2f covered %.2f' % (k/(t-c['RuntimeError'])*100, k/(t-c['RuntimeError']-c['NoCoverage'])*100))"
exit: 0
at: 2026-10-26T14:32:01Z

```
web/series/** {'NoCoverage': 8, 'Killed': 355, 'Survived': 35} mutants 398
score 89.20 covered 91.03
```

Reported separately, as asked, so the new code is not diluted by the 2134 older mutants: **89.20 %**
after this refresh, **77.39 %** on first measurement. The round-1 figure is the finding; the round-2
figure is what the shipped tests support.

---

## Evidence: final full test suite

command: npx vitest run
exit: 0
at: 2026-10-26T14:30:03Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  41 passed (41)
      Tests  522 passed (522)
```

**522 tests across 41 files, exit 0**, none skipped or disabled — the Verifier's 505 plus the 17 this
refresh added. This is the final run, executed after all mutation work and after the build.

---

## Evidence: app still builds

command: npm run build
exit: 0
at: 2026-10-26T14:30:16Z

```
> pensions-system@0.0.0 prebuild
> tsx scripts/verify-derived.ts && tsx scripts/check-content-scope.ts && tsx scripts/check-public-vocabulary.ts

derived figures verified: 7 (2 computed, 5 unavailable)
derived series verified: 2
country scope gate: clean (5 locales)
public vocabulary gate: clean (5 locales)

✓ Compiled successfully in 579ms
✓ Generating static pages using 11 workers (21/21) in 1046ms
```

`npx tsc --noEmit` exit 0 at 2026-10-26T14:30:07Z (no output). `npm run verify:derived` exit 0 at
2026-10-26T14:30:24Z (`derived figures verified: 7 (2 computed, 5 unavailable)` / `derived series
verified: 2`).

---

## Evidence: complexity gate (carried from the Refactorer, re-run here)

command: npx eslint .
exit: 0
at: 2026-10-26T14:30:09Z

```
(no output — clean)
```

`eslint.config.mjs` enforces `complexity: ['error', 6]`. Clean across the whole tree, including the
revision-2 series modules and the new test file (its payload builders were factored into small
helpers — `positionsOf`, `flatIndexOf`, `jsonStat` — to stay inside the limit).

---

## Evidence: scenario traceability (re-run, unaffected)

command: .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-10-26T14:30:12Z

```
{ "checks": [1, 2], "passes": ["AC-001-01 — traced to a test", …, "AC-001-99 — traced to a test"], "fails": [] }
```

99/99 scenarios visible to the gate still traced, `fails: []`, check 2 clean. **Same disclosed
limitation as the Verifier's revision-2 record:** the gate's regexes are `AC-[0-9]{3}-[0-9]{2}`, so
`AC-001-100`…`AC-001-107` (three-digit suffix) are invisible to both checks; the Verifier confirmed by
grep that all 107 headings exist and all 107 are cited by a test. The new tests cite no new scenario
id (they pin behaviour already covered by AC-001-93/94/95/98/99/100/101), so the count is unchanged.

---

## Evidence: audit-trail gate

command: .standards/scripts/check-audit-trail.sh 001-pension-math
exit: 0
at: 2026-10-26T14:32:19Z

```
PASS 001-pension-math: 10-tasks.md present and non-empty
PASS 001-pension-math: 20-acceptance/ has an AC-*.md with a '## AC-NNN-NN' heading (AC-015-10)
PASS 001-pension-math: 25-verification.md present and non-empty
PASS 001-pension-math: 30-report.md present and non-empty
PASS 001-pension-math: 15-design.md present and non-empty (AC-015-13)
PASS 001-pension-math: 40-deploy.md present and non-empty (AC-031-18)
PASS 001-pension-math: evidence block 'scenario traceability' — … at: 2026-10-25T22:38:30Z
PASS 001-pension-math: evidence block 'full test suite' — … at: 2026-10-25T22:39:00Z
PASS 001-pension-math: evidence block 'complexity gate' — … at: 2026-10-25T22:40:00Z
PASS 001-pension-math: evidence block 'design-principles gate' — … at: 2026-10-25T22:42:00Z
PASS 001-pension-math: evidence block 'scenario-to-behavior spot check' — … at: 2026-10-25T22:44:00Z
✔ Audit-trail check: specs/001-pension-math complete, verifier evidence recorded.
```

The gate reads the Verifier's five evidence blocks (the revision-1 blocks remain first in
`25-verification.md`; the revision-2 blocks appended there use the same heading strings). Stage 5b's
pre-push run will not block on it.

---

## Complexity summary (carried from the Refactorer)

- **Cyclomatic complexity ≤ 6:** `eslint.config.mjs` enforces `complexity: ['error', 6]`; ESLint
  exits 0 on the whole tree (re-confirmed above).
- **Duplication:** `check-code-principles.sh --tier production` reports **0 DRY FAILs** (the Verifier's
  revision-2 attempt-2 run: 1 FAIL total, 42 WARNs).
- **Design-principles gate (Verifier's revision-2 attempt 2, PASS for the deliverable):** exit 1 with
  **exactly one FAIL** — `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`),
  inside the `.standards/` submodule, out of scope and off-limits to pipeline agents. **Zero FAILs in
  project source.** The attempt-1 `component-per-file` FAIL on `app/(public)/[locale]/page.tsx` was
  resolved by the Refactorer's page→layout move and is gone (`PASS Component-per-file: no
  violations`). 42 WARNs recorded (29 project-source KISS/DRY review hints incl. the new
  `PyramidPlate`/`CountdownBlock` bodies, 13 `.standards` template WARNs) — WARN-level, not blocking,
  per the Stop-and-Ask matrix ("Design gate WARN → record, do not stop").
- **Property tests:** `tests/unit/properties.test.ts` uses `fast-check`; 0 property-test FAILs.
- **WARN-level, carried forward unchanged:** the project-source KISS/DRY WARNs. This stage adds none:
  the new test file's helpers are each under 20 lines.

---

## What this stage did not touch

- **No production code was edited.** The revision-2 modules are the Coder's and Refactorer's work;
  this stage measured them (and temporarily mutated them for kill verification, restoring each file
  byte-identically — md5 compared, 13/13 restored).
- **No existing test was edited.** The 505 tests the Verifier passed are byte-identical; this stage
  added one file.
- **No gate config was changed except the scope.** `stryker.config.mjs`'s `mutate` globs gained
  `web/series/**/*.ts` — a widening, which can only make the gate harder. Thresholds, mutators,
  `ignorePatterns`, `eslint.config.mjs`, `vitest.config.ts` and `.gitignore` are untouched. No
  `// Stryker disable` comment was added anywhere.
- **Nothing outside the allowed surface was edited.** `specs/**` changed only in this file; `.standards/**`
  is untouched.
- **Nothing was committed or pushed.** That is stage 5b's job.
- `reports/mutation/mutation.json` is left in place as the machine-readable evidence for this report;
  `.stryker-tmp/` is gitignored and cleaned by the run.

---

## Remediation record

**Stage 5a, this refresh: none** — no BLOCK occurred during this stage. The mutation gate never
reported BLOCK; the two rounds were a baseline plus one test-strengthening pass, not a fix-and-retry
loop against a failing gate. Both rounds exited 0. The below-threshold round-1 reading on
`web/series/**` was closed inside this stage's own budget, not by handing a BLOCK to another stage.

**Carried forward from `25-verification.md` (read, not guessed or invented):**

| Phase | Attempt | Trigger | Outcome |
|---|---|---|---|
| 1 (pre-PR) | 1 | first full run | PASS |
| 1 (pre-PR) | 2 | finding F1 (this stage's first report) — `centralCellOf` compared a deflated rate to a nominal band centre | PASS after the Coder's fix; three pre-existing assertions adjudicated legitimate (1 shape pin, 2 that encoded the defect). Budget state at that attempt: `SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=1`, `SPEC_PHASE2_RETRIES=0` |
| 1 (pre-PR) | 3 | hero ladder swap + percent-scale fix | PASS; `SPEC_LOOP_COUNT=2`, `SPEC_PHASE1_RETRIES=2`, `SPEC_PHASE2_RETRIES=0` |
| 2 (post-PR CI) | 1 | six `backend-ci-go` checks on a TypeScript-only repo (`##[error]The specified go version file at: go.mod does not exist`) | FAIL — routed to the repo owner (CI config, not spec code) |
| 2 (post-PR CI) | 2 | `ci.yml` fixed in `68f6e64` (Go workflow removed) | PASS — phase-2 budget 2 of 3 used |

**Revision-2 scope cycle** (a new cycle: `SPEC_PHASE1_RETRIES` reset to 0 for it, as the Verifier
documents and justifies; `SPEC_LOOP_COUNT=3`, `SPEC_PHASE2_RETRIES=2` carried forward):

| Phase | Attempt | Trigger | Outcome |
|---|---|---|---|
| 1 (pre-PR, cycle 2) | 1 | first revision-2 run | **FAIL** — design-principles gate: `Component-per-file: ./app/(public)/[locale]/page.tsx exports 5 functions/components (threshold: ≤4)`, newly introduced by T19's `generateMetadata` |
| 1 (pre-PR, cycle 2) | 2 | `dynamicParams` moved to a new `[locale]/layout.tsx` (page back to 4 exports) | **PASS** — component-per-file clean, 505 tests, route config re-verified |

So: **two Phase 1 BLOCKs in revision 1** (resolved at attempts 2 and 3 of the original cycle) and
**one Phase 1 BLOCK in revision 2** (resolved at attempt 2 of the new scope cycle). **Phase 2: two
attempts, one FAIL one PASS.** Phase 3 (deploy verification) has not run. The orchestrator supplied no
loop summary beyond `25-verification.md`'s attempt headers; none is inferred here.

---

## Flagged to the next stage

1. **The 93.83 % figure is retired.** It described pre-revision-2 code. The current tree is
   **91.69 %** over 33 files / 2532 mutants, and `web/series/**` is **89.20 %** on its own.
2. **`web/series/**` is above the line now but was not on first measurement (77.39 %).** If a later
   revision adds calculation code to `web/series/`, re-measure it separately before trusting the
   aggregate — the whole point of the split figure.
3. **The two traps are covered — but two of their assertions had been weaker than the surrounding
   prose claimed.** `over65`/`under20` had no value assertion (15 mutants), and the dependency ratio
   was only ever exercised on a payload whose sex halves reconcile, which makes a sex-summing bug
   arithmetically invisible. Both are now explicit.
4. **Highest-value residual: `age-structure.ts`'s "no denominator" guard (7 mutants)** — a year
   publishing bands but no `Total` row is currently untested, and that is the guard that stops a
   division by a missing population. Second: the `openBandShare` predicate (3 mutants), which is the
   open-band trap's own helper.
5. **`web/ingest/run-series.ts` is at exactly 80.00 %** with the largest cluster (12 mutants) in
   provenance fields — the series manifest's `fetchedAt` and `inputHash` have no value assertions at
   all, while the figures' equivalents do. That is a genuine gap in the series' provenance contract,
   not a defensive branch.
6. **`web/manifest/validate.ts:29`** — a manifest built without `snapshotYear` may now carry a
   `snapshotYear: undefined` key without any test noticing (`toEqual` ignores undefined properties).
7. **Carried forward unchanged from the Verifier**: 42 project-source WARNs (KISS method bodies above
   20 lines, DRY 4-line blocks — now including `PyramidPlate` and `CountdownBlock`) and one
   out-of-scope FAIL inside `.standards/`.
8. **`25-verification.md`'s revision-2 attempt-2 block is the verification of record** for the tree
   this report measures. If code changes again before stage 5b, this report is stale and must be
   re-run — the mutation score is a property of a tree, not of a spec number.

---

**Verdict: GREEN**

Mutation score **91.69 % total / 92.64 % covered** on the expanded 33-file scope (2532 mutants:
2305 killed or timed out, 183 survived, 26 uncovered, 18 runtime errors excluded by the tool), with
**89.20 %** measured separately on `web/series/**` (was 77.39 % at round-1 baseline; the gate is met
and both encoding traps are killed). 111 of the 209 non-killed mutants are equivalent or dead and are
named above; the 98 reachable residuals are grouped with the assertion that would kill each. F1 remains
closed (15/18, three equivalent). Final suite **522/522 across 41 files**, app builds (21/21 static
pages), `tsc` and ESLint clean, traceability 99/99 visible to the gate.

---

## PR

PR: https://github.com/RexiAI/pensions-system/pull/3

Commits: 16 (one per task T1–T16; 17 including the previous record commit), carried forward from the
previous report — this refresh has not committed or pushed anything. Revision 2's work (T17/T18/T19,
R3/R5/R6) is still uncommitted on the working tree and belongs to stage 5b, which will add it to the
same `spec/001-pension-math` branch. The spec is **not** archived in this PR: `scripts/archive-spec.sh`
is stage 5d, which runs after stage 5c's deploy verification.

## 15-design.md

# Design Spec: pension-math

> **Amendment status:** §Revision 1 (live E2E findings) amends this document. Where a directive in Revision 1 disagrees with an earlier section, Revision 1 wins. Everything else stands.

## Design Read

Reading this as: an editorial data-journalism publication for a skeptical cold visitor arriving from a social feed, with a statistical-bulletin language (paper, ink, mono numerals, hairline rules, no photography), leaning toward native CSS + Tailwind v4 tokens + server-rendered SVG charts, deliberately no component library and almost no client JavaScript.

The product is a measuring instrument that happens to be a magazine. Every visual decision below is scored on one question: does it make a doubtful reader believe the number sooner?

### Scroll contract, what the reader must feel at each stage

| Stage | Reader's state on arrival | What the design must produce | What must NOT happen |
|---|---|---|---|
| Viewport 1, hero | Cold, half-attending, scrolling past | "This is instrumented, not opinionated." One computed number, its date, the names of the official bodies it came from, and the promise that the number is checkable. | No argument, no adjective, no urgency, no photograph of an elderly couple |
| Viewport 2, register key | "Who is this site and what is it selling me" | "It tells me which of its own sentences are arithmetic, which are contested, and which are its own opinion." Trust earned by self-limitation before any claim is made. | No claim about pensions yet |
| Viewports 3 to 7, the five figures | Willing, verifying | "The arithmetic is shown, not asserted." Each plate: the finding as a plain caption, the numbers, three labelled anchors, the source, the formula id, the hash, the reproduce command, the full table. | No tooltip-hidden numbers, no single headline debt figure, no red alarm areas |
| Register block, consensus and dispute | Testing for bias | "It is being fair to the other side." Two positions, equal column width, equal type size, each with its own citation. | No stagger, no tint, no winner |
| Thesis | Suspicious again, because now the site has a view | "It is allowed an opinion and it has labelled it as one." Ground changes, voice changes, a signature appears, and the label says so. | No thesis language anywhere upstream of this block |
| Reproduce, assumptions, revisions | Deciding whether to cite it | "I could audit this." The command, the hashes, the assumption ledger, the site's own revision log. | No hidden assumptions, no v1.4.2 build stamp theatre |
| Footer | Leaving | "It told me what it does not claim." | No newsletter modal, no engagement bait |

The credibility ladder is: instrument, then self-limitation, then verification, then fairness, then labelled opinion, then auditability, then disclaimer. Each stage removes one reason to distrust. That ordering is the design.

### Credibility mechanism per stage, named

1. **Hero:** a computed ratio in `font-mono` with `tabular-nums`, three dated comparison values (1996, 2010, latest), and a snapshot stamp in the same strip. Numbers in mono are the visual signature of a measurement, not a pitch.
2. **Register key:** the site's own taxonomy, exposed with live samples of each register, before any argument.
3. **Figures:** provenance as a full-width instrument plate under every figure (see T1), always visible, never behind a click.
4. **Dispute:** strict symmetry. Identical column width, identical type size, identical citation chip placement. Any asymmetry here reads as editorialising.
5. **Thesis:** four simultaneous markers (ground tint, 4px ink rule, serif voice, signature) plus an explicit disclaimer sentence. Redundancy is the point: a reader who missed three markers still catches one.
6. **Reproduce:** monospace commands and full digests, in a section that looks like a terminal transcript on purpose.
7. **Footer:** a plain, short "what this site does not claim" paragraph in body type, not 10px legalese.

### The three registers, solved structurally

Register is carried by **ground, label, type voice, and border**, never by colour temperature. That is what keeps the separation legible to a colourblind reader, in dark mode, in print, and to a screen reader.

| Register | Ground | Label (mono, 13px) | Type voice | Border | Components |
|---|---|---|---|---|---|
| **Instrument** (computed, uncontested) | `--surface-1` | `FIG. 01` inside `<figcaption>` | sans + mono numerals | 1px `--rule-1` top rule | Figure plate |
| **Consensus** (`T10` agreement) | `--surface-1` | `Lo que no se discute` | sans prose, 62ch | none | `<AgreementSection>` |
| **Dispute** | `--surface-2` inset, full-bleed | `Lo que se discute` | sans prose, two-column dossier | 1px `--rule-1` top and bottom | `<DisputeSection>` |
| **Thesis** (the site's own reading) | `--surface-3` inset, full-bleed | `Nuestra lectura` | EB Garamond for the thesis statement only, then sans | 4px `--ink-1` left rule | `<ThesisSection>` |

Hard rules that follow from the table:

- The "fraud / chain-letter / pyramid scheme" vocabulary may appear only inside `thesis.*` locale keys and only inside `<ThesisSection>`. No figure plate uses `--surface-3` ground. No figure caption uses the serif. (Token-level counterpart of AC-001-41 and AC-001-42.)
- Links between registers are one-directional: the thesis may link out to a figure (`#fig-05`); a figure may link to the dispute section only, never to the thesis. This is a design constraint on the content model, enforceable as a test.
- The three prose-register labels are the only eyebrows on the page. Figure labels are `<figcaption>` text with a real semantic role (they are the anchor target of cross-references and citations), not decorative section numbering.
- No motion between registers. The thesis panel is deliberately static: animating it would dramatise it, which is exactly the register failure this design exists to prevent.

## Dial Values

- **DESIGN_VARIANCE: 5**: Offset, not expressive. Editorially asymmetric: a 7/5 hero split, figure plates with an off-centre metadata rail that alternates side, prose measure locked at 64ch against a wider grid. Above 6, asymmetry starts to read as "designed to impress", and a site that is trying to impress a skeptical reader about arithmetic has already lost. Below 4, it reads as a government form and nobody scrolls. 5 is the narrow band where the page looks made by a masthead rather than a template or a ministry.
- **MOTION_INTENSITY: 4**: The floor of the fluid band, and no higher. Exactly three motion primitives exist: a 160ms fade plus 4px rise on figure-plate entry (once, threshold 0.15), 120ms transitions on links, buttons, and focus rings, and a 60ms stagger across the 9 cells of the Fig. 5 matrix (once). That is the difference between a long scroll that feels alive and a PDF, and it is the maximum a numbers page can carry without the motion becoming salesmanship. Deliberately refused: chart line-draw (a line drawing itself implies performance, not measurement), odometer counters, parallax, scroll pinning or hijacking, sticky stacking, and any infinite loop. The baseline of 6 would have required justifying animation on a page whose whole argument is that nothing is being embellished.
- **VISUAL_DENSITY: 5**: Upper edge of the daily-app band. The chrome stays airy (96px plate gaps at desktop, prose at 64ch, generous leading) so a tired reader on a phone can finish a paragraph, while the plates themselves are dense: mono numerals, tables, hashes, six-line provenance strips. Density is earned by the data, not spent on page furniture. Deliberately refused: cockpit density (8+, hairline-separated everything) because it makes the site look like an internal tool, and gallery density (1-3) because it would starve the figures.

Restraint, stated explicitly, because it is the highest-risk judgement here: this spec spends its boldness on **provenance typography and the register system** and spends nothing on decoration. There is no hero image, no gradient, no glass, no icon illustration, no colour accent used ornamentally. All eleven permitted uses of colour are semantic (link, focus, computed series, band, deficit, ground, rule, text at three levels).

These three values are **page-level and describe the public surface**. The admin surface at `/admin` declares its own triple, `8 / 2 / 2` (§Admin Surface), as a local dialect of the same token system: density up, motion down, variance down. It is a different surface with a different job, not a second design system.

## Design System / Foundation

### Foundation

No official design system applies. GOV.UK and USWDS are wrong jurisdiction and wrong register (this is a publication, not a government service). Carbon, Fluent, Material, Primer and shadcn all carry a product-UI signature that would make a public-interest arithmetic site look like a SaaS dashboard. Honest label: **editorial / statistical-document aesthetic**, built on our own token layer.

| Concern | Decision | Install |
|---|---|---|
| Framework | Next.js App Router, server components by default | (already the project stack) |
| Styling | Tailwind v4 with `@theme` mapped onto CSS custom properties in `web/styles/tokens.css` | none extra |
| Component library | **None.** Native `<details>`, `<dialog>` (unused), `<select>`, `<table>`, `<figure>` cover every semantic need. No Radix, no shadcn. Fewer deps, and the whole surface is text, tables, and SVG. | none |
| Charts | No chart library. A small internal SVG primitive set, server-rendered from committed JSON. | none |
| Icons | `@phosphor-icons/react` (import from `@phosphor-icons/react/dist/ssr` in server components), weight `regular`, sizes 16 and 20 | `npm i @phosphor-icons/react` |
| Fonts | `next/font/google`: Instrument Sans, IBM Plex Mono, EB Garamond. Subsets `latin`, `latin-ext`. | none extra |
| Motion | CSS transitions only. No Motion, no GSAP. One `<Reveal>` client leaf (IntersectionObserver, `once`) wrapping plates. | none |

### Chart strategy

- Every chart is **static SVG rendered on the server** from `data/derived/*.json`. No canvas, no chart library, no client-side data fetching.
- Two server-rendered variants per chart: `chart--wide` (viewBox 1000 × H) and `chart--compact` (viewBox 360 × H'). CSS shows one, hides the other at 640px. Reason: an SVG that scales from 1000 to 360 shrinks a 13px axis label to 4.7px. Two variants cost about 15kB gzipped and remove the entire text-scaling and CLS problem. Both variants carry identical data.
- **Nothing is hover-only.** No tooltips, no crosshair readouts that exist only on pointer devices. Instead, each figure carries an always-visible **readout strip** above the plot (three to four labelled values in mono) and a **data table** below. Hover and focus add a thin vertical guide only, never new information.
- Path coordinates are rounded to one decimal at build time. Target budget: ≤ 18kB of inline SVG per figure, both variants combined.
- **Interactivity is navigation, disclosure, and selection:** anchor values link to their provenance panel, tables are `<details>`, and the Fig. 3 cohort selector is a set of links writing `?cohort=1980` (server-rendered, zero JS). See the departure note in the closing report.

### Page inventory and layout families

Sixteen blocks. Layout families are counted to satisfy the repetition rules.

| # | Block | Layout family | Player |
|---|---|---|---|
| 1 | Header (sticky, 64px, one line ≥1024px) | Utility bar | wordmark, 4 anchors, 5-locale switcher, theme toggle, snapshot stamp |
| 2 | Hero (7/5 asymmetric split, 96px top padding max) | Asymmetric Split Hero | statement + instrument panel |
| 3 | Source strip (one row, 5 official bodies, plain names in mono) | Attribution row | real institutions only, no invented logos |
| 4 | Register key (3 stacked rows, live samples) | Register Key list | teaches the taxonomy |
| 5 | Fig. 1 dependency ratio | Figure Plate A (rail left) | |
| 6 | Fig. 2 contribution cover | Figure Plate B (rail right) | |
| 7 | Fig. 3 cohort return | Figure Plate C (rail left, selector) | |
| 8 | Fig. 4 implicit debt | Figure Plate D (rail right, four-row ladder) | |
| 9 | Fig. 5 required base growth | Figure Plate E (full width, matrix + range) | the widest plate |
| 10 | Consensus | Prose register block | |
| 11 | Dispute | Two-column dossier inset | |
| 12 | Thesis | Signed panel inset | |
| 13 | Reproduce | Mono data block | |
| 14 | Assumptions ledger | Grouped chunks, 3 clusters | |
| 15 | Revisions | Mono changelog | |
| 16 | Footer (2 columns) | Footer | sources, statement, locales, no-tracking |

Families in use: 9 distinct. Eyebrow count: 3 (`Lo que no se discute`, `Lo que se discute`, `Nuestra lectura`) against 13 sections, budget `ceil(13/3) = 5`. Pass. `FIG. 0N` labels live inside `<figcaption>`, not above an `<h2>`.

Deliberate override, stated: five figure plates intentionally share one grammar. A statistical bulletin repeats its figure grammar so the reader learns the plate once and then reads five figures quickly. The variants differ structurally (rail side, chart form, readout placement, selector presence), not cosmetically. This is the one place the "one layout family per page" rule is overridden, and the reason is reader throughput on the content that matters.

No photography anywhere. No bento. No cards with shadows. No image-plus-text splits, so the zigzag cap cannot be violated.

### State model (shared vocabulary)

Every figure-plate component implements these states. They are the only permitted states; no ad-hoc spinners.

| State | Trigger | Visual | Copy slot |
|---|---|---|---|
| `current` | manifest valid, `fetchedAt` inside freshness window | normal plate, provenance strip in `--ink-3` | none |
| `null-value` | T3/T4/T5/T6 edge case resolves to `undefined` | `<NullPlate>`: 45° hatch of `--chart-null` over a 120px band, the mono reason string (`affiliates = 0`), formula id, table still rendered with the null cell reading `no definido` | `plate.null.<metricId>` |
| `stale` | snapshot outside freshness window (cannot reach production, T2 fails the build; exists for preview and for the post-deploy window) | page-level banner above the header, 3px `--data-deficit` left rule, mono, one line: snapshot date, window, and "no vigente" | `banner.stale` |
| `withheld` | manifest fails validation at runtime (should be impossible; exists so it can never render a bare number) | `<WithheldPlate>`: no chart, the reason, the failing field name | `plate.withheld` |
| `error` | route not found, or unsupported locale (AC-001-34) | typographic error shell: one sentence, the 5 locales listed as links, home link, `noindex` | `error.notFound`, `error.locale` |
| `focus` / `hover` | keyboard or pointer | 2px `--accent` ring, 2px offset; chart guide line 1px `--rule-2` | none |
| `reduced-motion` | `prefers-reduced-motion: reduce` | `<Reveal>` renders final state immediately, no transform, no stagger | none |
| `forced-colors` | `forced-colors: active` | series strokes `CanvasText`, hatch replaced by `stroke-dasharray` patterns, grounds `Canvas`; table unchanged | none |
| `print` | print | light token set forced, tables and provenance expanded, `<Reveal>` neutralised, figure `break-inside: avoid` | none |

There is no loading skeleton anywhere: every route is statically generated, so there is no loading state to design. If a streamed route is ever added, the skeleton is a plate-shaped block at the plate's exact aspect ratio, never a spinner.

This table describes the public surface only. The admin views declare their own state vocabulary in §Admin Surface (`running`, `noUpdate`, `no-changes`, `superseded`, `publishing`, `published`, `publish-failed`, `auth.lockedOut`, and the rest). The two vocabularies do not overlap, which is intentional: a public state word must never appear in an operator view, and the reverse.

### Mobile and performance direction

- **First paint already shows a number.** The hero value, its comparison strip, the snapshot stamp, and the hero sparkline's SVG path are all server-rendered HTML. LCP element is the hero numeral (a text node), so LCP is font-bound, not image-bound. `next/font` with `display: swap` and `adjustFontFallback` keeps CLS at 0.
- **Zero JavaScript for reading.** Charts, tables, provenance, prose, locale links, and the cohort selector all work with JS disabled. The only client components are `ThemeToggle` (about 300 bytes plus a blocking inline head script to avoid a flash) and `Reveal` (IntersectionObserver, one per plate, cleanup on unmount; it must never wrap content that carries information, only the visual transition).
- **Mobile charts.** Compact variant, fixed 220px (M1, M2), 260px (M3, M5), 200px (M4). Axis ticks are server-marked `data-tier="major|minor"` and minor ticks are hidden under 640px by CSS, so there is no re-render and no layout shift. The readout strip wraps to two lines. The table disclosure is promoted to a full-width secondary button directly under the chart, labelled with its row count (`Ver los 360 datos`).
- **Tables on mobile** scroll horizontally inside their own container (`tabindex="0"`, `aria-label`, visible focus) so the page body never scrolls sideways.
- **Budgets.** JS shipped to the client under 20kB gzipped for the whole site. Fonts: two weights of sans, two of mono, and the serif only on the route that renders the thesis (subset, italic plus regular, one size). No third-party scripts, no analytics beyond a cookieless counter disclosed in the footer, no consent banner because nothing is stored.
- **Core Web Vitals target:** LCP < 2.0s on 4G mobile, INP < 100ms, CLS < 0.02.
- **Print is a first-class target.** A reader may want to cite this. `@media print` forces the light token set, expands tables and provenance, hides the header controls, and prints the footer with the snapshot date and the site URL.

### Anti-patterns banned on this product

Each of these is a specific credibility failure, not a generic style preference.

1. Any alarm-red palette, red tickers, or "collapse" iconography. The deficit colour is a muted terracotta used on 2px marks only; large adverse areas are hatched, never filled red.
2. Stock photography of any kind: elderly people, empty chairs, piggy banks, hourglasses, handshakes, flags. `00-informal.md` names aggressive stock imagery as a crank signal.
3. All-caps headlines, underlined or bold-run emphasis for rhetorical stress, justified text, centred body prose.
4. Exclamation marks, rhetorical questions as headings, and any second-person accusation.
5. Animated counters or odometer numbers. Values are static, exact, and skimmable.
6. "Live" semantics: no ticking timestamps, no "actualizado hace 3 segundos", no pulsing dots. A snapshot is a snapshot.
7. Dark hero over a mesh gradient, glassmorphism, neon glows, purple or indigo anywhere.
8. Three equal cards, for the registers or for the five metrics.
9. Hover-only data of any kind.
10. Truncated provenance: no ellipsis on a timestamp, a hash, or a source URL. A shortened hash is a 12-character prefix followed by a copy control, with the full 64 characters in the DOM and in the reproduce table.
11. A single headline implicit-debt figure. Fig. 4's largest type is its rate labels, and no KPI strip sits above it.
12. Colour-only encoding, and red/green good-bad semantics on arithmetic. Every encoded value is also printed.
13. Em-dashes and en-dashes as separators in any UI string, caption, or quote attribution.
14. Silent locale fallback, machine-translated thesis prose, or an English string leaking into `es`.
15. Crank tells: superscript footnote clutter instead of citation chips, institution names in caps, "LA VERDAD" style banners, a "share this shocking number" bar.
16. Newsletter modals, exit-intent overlays, cookie-banner theatre, autoplay media.
17. Fake precision in examples or empty states. If a value is absent, say why.
18. A country switcher (T8 open question 2 resolves to Spain only; showing a disabled or single-option switcher is worse than none).

## Global Tokens

All values live in `web/styles/tokens.css` as CSS custom properties and are exposed to Tailwind v4 through `@theme`. No component may contain a literal colour, size, radius, or duration. The repo standard already forbids inline styles and hardcoded literals; these are the names to use.

### Type

```css
/* families */
--font-sans:  'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-mono:  'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
--font-serif: 'EB Garamond', Georgia, 'Times New Roman', serif; /* thesis statement only */

/* weights loaded: sans 400/500/600, mono 400/500, serif 400/400i */

/* scale (clamp: min, fluid, max) */
--text-display:  clamp(2.25rem, 4.6vw, 3.75rem);  /* hero h1, max 2 lines desktop */
--text-h2:       clamp(1.5rem, 2.1vw, 2rem);
--text-h3:       1.25rem;
--text-plate:    clamp(1.125rem, 1.4vw, 1.375rem); /* figure caption line */
--text-body-lg:  1.1875rem;  /* article prose */
--text-body:     1.0625rem;
--text-small:    0.9375rem;
--text-meta:     0.8125rem;  /* provenance, table captions, chips */
--text-micro:    0.75rem;    /* mono only, never body prose, min 12px */

/* numerals */
--text-num-xl:   clamp(2.75rem, 6.4vw, 5rem);   /* hero value only */
--text-num-l:    2rem;                          /* per-plate primary value */
--text-num-m:    1.25rem;                       /* readout strip */

/* leading + tracking */
--leading-tight: 1.04;   /* display, sans only */
--leading-snug:  1.18;   /* h2/h3 */
--leading-body:  1.62;   /* prose */
--leading-meta:  1.45;
--tracking-display: -0.018em;
--tracking-label:    0.06em;   /* the three register labels, mono */
```

Rules: every numeral on the site uses `--font-mono` with `font-variant-numeric: tabular-nums`, including numbers inside prose, tables, and captions. That is the instrument signature and it is also what makes columns align across locales. Italic is used in exactly one place (the thesis pull statement) and never inside a display headline, so the italic descender clearance rule has no other surface to violate. `hyphens: auto` with a correct `lang` attribute on every locale route.

### Space, grid, measure

```css
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 24px; --space-6: 32px;  --space-7: 48px;  --space-8: 64px;
--space-9: 96px; --space-10: 128px;

--grid-max: 1240px;
--gutter: clamp(16px, 4vw, 32px);
--measure: 64ch;          /* prose, never wider */
--measure-wide: 78ch;     /* dispute columns */
--rail: 180px;            /* figure metadata rail, >=1280px only */
--header-h: 64px;
--touch: 44px;            /* minimum interactive box */

/* section rhythm */
--gap-plate: var(--space-9);      /* desktop */
--gap-plate-mobile: var(--space-7);
--gap-prose: var(--space-5);

/* breakpoints: 480 / 640 / 768 / 1024 / 1280 / 1536 */

/* z-index, systemic only */
--z-base: 0; --z-sticky: 20; --z-overlay: 40; --z-skip: 60;
```

Mobile collapse is explicit per block, not left to Tailwind defaults: every multi-column layout in the inventory declares its `< 768px` single-column form using `--gutter` and `--gap-plate-mobile`.

### Colour

> **Revision 2 amendment:** the palette gains one hue (`--data-projection`) and two chart aliases. The declarations are in §Revision 2, "New tokens"; the allowed-meanings table and the contrast verification for every new pair are in §Revision 2 R3. No existing value changes, and the three hues already in use keep their meanings.

Two token sets, one theme at a time, page-level lock. The page never inverts mid-scroll. Section grounds are steps within the same neutral family at low contrast, which is permitted; there is no light-to-dark flip.

```css
/* light (default) */
--surface-1:  #F4F5F2;   /* page paper */
--surface-2:  #ECEEE8;   /* dispute inset, figure plate ground */
--surface-3:  #E4E7DF;   /* thesis inset, mono/code blocks */
--ink-1:      #141A1B;   /* primary text, headings */
--ink-2:      #384446;   /* body secondary, captions */
--ink-3:      #5A6769;   /* metadata, provenance, axis labels */
--rule-1:     #C9CFC7;   /* hairline, decorative only */
--rule-2:     #A9B2A8;   /* stronger divider, decorative only, hover guides */
--accent:     #17564A;   /* links, focus, computed series. One accent. */
--on-accent:  #F4F5F2;   /* text on accent fills */
--data-deficit: #96472A; /* muted terracotta, 2px marks and small text only */

/* dark */
[data-theme='dark'] {
  --surface-1:  #0F1416;
  --surface-2:  #161C1E;
  --surface-3:  #1D2426;
  --ink-1:      #E9EDE8;
  --ink-2:      #B9C2BE;
  --ink-3:      #8D9A96;
  --rule-1:     #2A3335;
  --rule-2:     #3C4747;
  --accent:     #56B39A;
  --on-accent:  #0F1416;
  --data-deficit: #D08A63;
}

/* chart encoding (mapped from the above, per theme) */
--chart-series-1: var(--accent);          /* computed series */
--chart-series-2: #6E7A79;                /* comparison, projection (dark: #A8B3B1) */
--chart-ref:      var(--ink-3);            /* any line that carries meaning: 1.00, zero, g_proj */
--chart-grid:     var(--rule-1);           /* background scale only, carries no meaning alone */
--chart-band:     color-mix(in srgb, var(--accent) 12%, transparent);
--chart-band-edge:color-mix(in srgb, var(--accent) 40%, transparent);
--chart-hatch:    repeating-linear-gradient(45deg, transparent 0 3px,
                    color-mix(in srgb, var(--ink-1) 16%, transparent) 3px 4px);
--chart-null:     repeating-linear-gradient(45deg, transparent 0 5px,
                    color-mix(in srgb, var(--rule-2) 55%, transparent) 5px 6px);

/* register grounds (aliases, so a component never names a raw surface) */
--ground-instrument: var(--surface-1);
--ground-consensus:  var(--surface-1);
--ground-dispute:    var(--surface-2);
--ground-thesis:     var(--surface-3);
```

Encoding rules that go with the tokens:

- Any line that conveys information (the 1.00 break-even line, the zero baseline, the projected-growth marker) uses `--chart-ref`, which is `--ink-3`. `--rule-1` and `--rule-2` are below 3:1 by design and may only be used for separators and background scale, never as the sole carrier of a value.
- Adverse values are drawn as a hatch of `--chart-hatch`, not as a red fill. `--data-deficit` appears as a 2px rule, a 3px border, or small text at 4.5:1 or better.
- Every encoded value is also printed as a numeral. Colour and hatch are redundant encoding, never primary.

### Contrast verification

Computed WCAG 2.1 relative-luminance ratios for the pairs that actually occur. AA needs 4.5:1 for text, AAA 7:1; non-text graphical objects need 3:1.

| Pair | Ratio | Verdict |
|---|---|---|
| light `--ink-1` on `--surface-1` | 16.08 | AAA |
| light `--ink-1` on `--surface-2` | 15.05 | AAA |
| light `--ink-1` on `--surface-3` | 14.07 | AAA |
| light `--ink-2` on `--surface-1` | 9.21 | AAA |
| light `--ink-2` on `--surface-2` | 8.62 | AAA |
| light `--ink-3` on `--surface-1` | 5.36 | AA |
| light `--ink-3` on `--surface-2` | 5.02 | AA |
| light `--ink-3` on `--surface-3` | 4.69 | AA |
| light `--accent` on `--surface-1` | 7.78 | AAA |
| light `--accent` on `--surface-3` | 6.81 | AAA |
| light `--on-accent` on `--accent` (button) | 7.78 | AAA |
| light `--data-deficit` on `--surface-1` | 5.94 | AA |
| light `--data-deficit` on `--surface-2` | 5.56 | AA |
| light `--chart-series-2` on `--surface-1` | 4.06 | non-text 3:1 pass, and AA as text |
| dark `--ink-1` on `--surface-1` | 15.68 | AAA |
| dark `--ink-2` on `--surface-1` | 10.18 | AAA |
| dark `--ink-3` on `--surface-1` | 6.36 | AA (AAA margin at meta sizes) |
| dark `--ink-3` on `--surface-3` | 5.40 | AA |
| dark `--accent` on `--surface-1` | 7.34 | AAA |
| dark `--accent` on `--surface-3` | 6.24 | AA |
| dark `--on-accent` on `--accent` | 7.34 | AAA |
| dark `--data-deficit` on `--surface-1` | 6.62 | AA |
| dark `--data-deficit` on `--surface-3` | 5.63 | AA |
| dark `--chart-series-2` on `--surface-1` | 8.61 | AAA |
| light `--rule-1` on `--surface-1` | 1.45 | decorative only, never a value carrier |
| light `--rule-2` on `--surface-1` | 1.99 | decorative only, never a value carrier |

Focus ring is `--accent` at 2px with 2px offset: 7.78:1 light, 7.34:1 dark against the page, above the 3:1 requirement for non-text UI. Body prose clears AAA in both modes; `--ink-3` metadata clears AA everywhere it is used, which is the reason 13px is the smallest size permitted for it and 12px is mono-only, short-string-only.

### Radius, elevation, border, focus

```css
--radius: 0;                 /* every corner. No exceptions. No radius on chips, buttons, tables. */
--border-hair: 1px solid var(--rule-1);
--border-strong: 1px solid var(--rule-2);
--border-register: 4px solid var(--ink-1);   /* thesis left rule only */
--shadow: none;              /* no drop shadows anywhere; separation is rules and grounds */
--focus: 2px solid var(--accent);
--focus-offset: 2px;
```

Sharp corners are the shape-consistency decision and they are load-bearing: rounded 12-16px cards are the single most recognisable template signature, and this site cannot afford to look templated. A spreadsheet and a statistical bulletin are square.

### Theme, dark mode, print

- `Theme: auto` (system preference) with a 3-state toggle (system / light / dark) in the header, persisted in `localStorage`, applied by a blocking inline script that sets `data-theme` on `<html>` before paint. No flash, no layout shift.
- Dark mode is a genuine token swap, not an inversion. Charts re-map series to the lightened accent so line weight does not disappear on a dark ground; the plate ground stays a step above the page so strokes read.
- Contrast is verified in both modes (table above) and both modes are reviewed before the build is considered done.
- Print: light tokens forced, `--shadow` irrelevant, tables and `<details>` expanded (see T11), header controls hidden, footer retains the snapshot stamp and the canonical URL.

### Locale guidance

Five locales: `es` (primary, no prefix at `/`, canonical), `en`, `fr`, `de`, `it`. All Latin script, LTR, no RTL work in v1. Static routes per locale, `hreflang` and `x-default` to `es`.

**Text expansion against Spanish.** German +30 to +35%, French +15 to +20%, English -5 to -10%, Italian +5 to +10%. Budgets below are enforced as content-model validation, not as CSS guesses.

| Slot | es budget | de budget | Notes |
|---|---|---|---|
| `hero.statement` (h1) | 46 chars | 60 chars | Measured against 2 lines at `--text-display`. If de exceeds, the content is rewritten, not the type scale. |
| `hero.sub` | 90 chars / 20 words | 110 chars | Hard cap 20 words in every locale. |
| `hero.cta` primary | 24 chars, 2 words | 28 chars | Must not wrap at 1280px (see pre-flight) |
| `nav.item` | 14 chars | 18 chars | Nav must stay one line at 1024px in `de`; that is the binding constraint for all locales. |
| `fig.title` | 48 chars | 64 chars | Two lines maximum. |
| `fig.caption` finding | 110 chars | 145 chars | One sentence. |
| `plate.limit` | 120 chars | 160 chars | The "what this does not tell you" line. |
| `register.label` | fixed strings | translated | These three labels are the page's only eyebrows; they must remain 2 to 4 words. |
| `chip.source` | 34 chars | 44 chars | Chips may wrap to 2 lines. Never truncated. |
| `table.header` | 18 chars | 26 chars | Use `<abbr title>` for the long form; the abbreviation itself must be a locale key. |

**Number and date formatting.** One shared `formatValue(value, kind, locale)` and `formatDate(iso, locale)` built on `Intl`, used by readouts, tables, chart labels, provenance, and metadata. No `toFixed`, no string concatenation, no hand-written separators.

| | es | de | en | fr | it |
|---|---|---|---|---|---|
| Decimal | `0,53` | `0,53` | `0.53` | `0,53` | `0,53` |
| Thousands | `1.234.567` | `1.234.567` | `1,234,567` | `1 234 567` (narrow nbsp) | `1.234.567` |
| Percent | `4,2 %` (nbsp before) | `4,2 %` | `4.2%` | `4,2 %` | `4,2 %` |
| Currency | `1.234 €` (suffix) | `1.234 €` | `€1,234` | `1 234 €` | `1.234 €` |
| Date long | `1 de octubre de 2026` | `1. Oktober 2026` | `1 October 2026` | `1 octobre 2026` | `1 ottobre 2026` |

Currency values are integers in minor units internally (repo standard) and are rendered with `Intl.NumberFormat` at EUR's 2 decimals. Never round a monetary value for display. Percentages are rendered from the ratio with `Intl.NumberFormat(style:'percent', maximumFractionDigits:1)` unless the derivation fixes 2 decimals (T3, T4 require 2).

**Font coverage.** `latin` plus `latin-ext` covers every glyph these five locales require (ß, äöü, œ, àâçéèêëîïôùû, ñ, áéíóúü, ìò). No fallback font may ever render a figure: numerals are in Plex Mono for all locales precisely so a missing glyph cannot appear inside a number.

**Where text breaks a layout, and the answer.**

1. **`de` nav.** Four anchors plus five locale codes plus a theme toggle at 18-character labels will overflow 1024px. Answer: nav labels are separate short keys (`nav.figures`, `nav.method`, `nav.debate`, `nav.reading`) with an 18-character cap, the locale switcher uses 2-letter codes only, and the nav switches to the `<details>` index at 1024px, not at 768px, for `de` and `fr` only if measurement proves it necessary. The rule is a measured breakpoint, not a per-locale hack: one nav component, one breakpoint token `--nav-collapse`.
2. **`de` compound nouns in `<h2>`.** Hyphenation is enabled with `lang="de"`; `<h2>` has a 2-line budget and `text-wrap: balance`. A compound that cannot break within two lines is a content failure; the content model rejects it.
3. **`fr` dispute columns.** French is 15 to 20% longer and the dossier is two equal columns. At 1024px the columns are 46ch each; French quotes exceed 3 lines more often. Answer: the quote block caps display at 4 lines in `fr` with the full verbatim text in the citation panel, and the dossier collapses to one column below 900px rather than shredding into 30ch measures.
4. **`de` and `fr` figure titles** wrap to two lines where `es` fits one. The plate header is a flex area that grows; the chart's top margin is fixed, so nothing shifts. Titles are never truncated.
5. **`it` readout strip.** Italian percent labels (`al 2 per cento` style long forms) are avoided: readouts use the compact numeric form with the unit in the mono label, which fits every locale at 4 values per row.
6. **Currency position** in the euro readouts differs by locale (suffix in `es`, `de`, `fr`, `it`; prefix in `en`). Numerals are right-aligned with `tabular-nums`, so a prefix currency simply occupies the same right edge. Do not build a layout that assumes the symbol is on the left.

### Iconography

`@phosphor-icons/react`, weight `regular`, 16px inline and 20px in buttons. Seven icons total: `arrow-square-out` (source opens), `copy` (hash copy), `caret-down` (disclosure), `table` (data table), `info` (assumption), `translate` (locale), `sun`/`moon`/`monitor` (theme, 3 states). Decorative icons get `aria-hidden="true"`; icon-only buttons require an `aria-label` from a locale key. No illustration, no logo marks for other institutions (naming them is more accurate than reproducing their marks), no hand-rolled SVG except inside chart primitives.

### Admin tokens (added)

These are the only tokens added for the admin surface. Nothing above changes; the public palette is untouched.

```css
/* semantic state, admin only. No green anywhere: 'published' is neutral, not good. */
--state-pending:        #7A5310;   /* dark: #E0B25C */
--state-danger:         #8A2C1E;   /* dark: #E7907E */
--state-pending-ground: color-mix(in srgb, var(--state-pending) 10%, var(--surface-1));
--state-danger-ground:  color-mix(in srgb, var(--state-danger)  10%, var(--surface-1));

/* admin geometry */
--admin-max: 1440px;      /* wider than --grid-max: diff tables need columns */
--admin-row-h: 40px;      /* table row height, 56px on <768px */
--admin-gap: var(--space-5);
--operator-bar-h: 48px;
--diff-rule: 2px;         /* left rule marking a changed row */
--chip-h-sm: 24px;        /* status chips inside rows; public chips stay 32px */
--z-operator: 30;         /* between --z-sticky (20) and --z-overlay (40) */
```

Contrast for the added pairs (computed, WCAG 2.1): `--state-pending` 6.25 on `--surface-1`, 5.85 on `--surface-2`, 5.47 on `--surface-3`; `--state-danger` 7.80 / 7.30 / 6.83; dark `--state-pending` 9.45 / 8.77 / 8.02; dark `--state-danger` 7.68 / 7.13 / 6.52. `--ink-1` on either tinted ground is 10.97 or better in both themes. `--on-accent` on a `--state-danger` fill is 7.80 light and 7.68 dark. All pass AA, most pass AAA.

Usage boundaries, enforced at review:

- `--state-pending` and `--state-danger` are **never** used on the public site. `--data-deficit` is **never** used in admin. Two vocabularies, two surfaces, no overlap.
- Neither state colour is ever the only carrier of meaning: every state is also a word (`pendiente`, `fallo`, `en curso`, `publicado`) in `--text-micro` mono.
- The accent keeps its public meaning (interactive / computed) and in admin additionally means "operation running". It never marks approval or failure.

## Per-Task Directives

Shared across every rendering task: all strings resolve through locale keys (T8), all numerals use mono plus `tabular-nums`, no inline styles, no literal colours or sizes, every figure plate ends with a provenance strip (T1) and a data table (T11), and the plate's `<figcaption>` contains a one-sentence finding in plain declarative language with no evaluative adjective.

### Task 1: Derived-figure manifest (provenance record + reproduce path)

- Layout: **Provenance strip**, a full-width band directly under each figure, inside the `<figure>` element so it is part of the figure for assistive technology. Above it, a 1px `--rule-1` hairline. Grid: five labelled fields on one line at ≥1024px, two lines at 768 to 1023px, stacked at <768px. Field labels sit **above** their values in `--text-micro` mono (`--ink-3`), values in `--text-meta` mono (`--ink-2`). It must look like the specification plate on a measuring instrument, not like a footnote: generous 24px column gaps, no bullets, no icons except the two functional ones (copy, external).
- Components: `<ProvenanceStrip manifest>` (server), `<ProvenancePanel>` (a `<details>` disclosure under the strip, summary `Reproducir este dato`), `<HashChip>` (12-character prefix, `title` and `data-hash` carrying the full digest, a copy button with `aria-live="polite"` confirmation), `<FormulaChip>` (formula id, mono, 1px border, links to the methodology anchor for that id).
- Fields and their treatment, in order:
  1. `sourceUrl` rendered as the institution's short name plus a padlock-free external icon, one link per entry, `rel="noopener"`. Multiple sources appear comma-separated at desktop, one per line on mobile.
  2. `fetchedAt` rendered via `formatDate`, plus a `<time datetime>` element. Never abbreviated, never "hace 3 días".
  3. `formulaId` in a `<FormulaChip>`.
  4. `inputHash` in a `<HashChip>`, labelled `sha256` so the algorithm is visible.
  5. `reproducePath` as a link to the file on the repository at the deployed commit, mono, with the leading path in `--ink-3` and the filename in `--ink-1`.
- The panel contains: the exact command, the JSON pointer into `data/derived/`, the full 64-character digest, the freshness window, and the two lines of copy explaining what a changed hash means. Render as a `<dl>`, mono values, `--surface-3` ground, 1px border, no rounding. The command string is **derived from the manifest's `reproducePath`**, never authored in the component, so it cannot drift from what the compute script actually is.
- Type and tokens: `--text-micro` labels, `--text-meta` values, `--font-mono` throughout, `--space-5` column gap.
- States: `withheld` when a manifest fails validation (see the state model) so a figure can never render a bare number. There is no partial state: five fields or no plate.
- Motion: the panel opens instantly. A disclosure on provenance is not a moment for choreography.
- A11y: `<dl>` with real `<dt>`/`<dd>`; copy button announces success; the external-link icon is `aria-hidden` and the link text carries the institution name; the hash's 12-character prefix is `aria-hidden` with an `aria-label` reading the full digest, so a screen reader never hears a fragment as if it were the whole.
- Anti-patterns: footnote-style superscripts; grey 11px provenance with 1.9:1 contrast; collapsing provenance behind a tooltip; ellipsis anywhere; showing the hash without saying which algorithm.
- Watch items: do not let the strip wrap into an unlabeled run of text; five labelled fields at 768px is the realistic limit, so the two-line layout must keep each label attached to its value.

### Task 2: Build-time ingest and computation harness (visible surface only)

The fetcher and the arithmetic kernels are out of design scope. What has a surface:

- **Snapshot stamp** in the header, right-aligned before the theme toggle: mono, `--text-micro`, `--ink-3`, one line, `Datos: 1 oct 2026`. It is a `<time>` element with `title` giving the full ISO timestamp and the freshness window. At <768px it drops to a second header line (`--header-h` becomes 88px) rather than being truncated or hidden: hiding the date would be the single most damaging omission on this page.
- **Stale banner** above the header when `fetchedAt` is outside the window: `--surface-2` ground, 3px `--data-deficit` left rule, mono `--text-small`, two lines max. Copy states the date, the window in days, and that the figures below are "no vigente". No icon, no dismiss button (it cannot be dismissed; it is a fact).
- **Build-failure route.** The build fails before deploy (T2 AC-05 to AC-07), so there is no rendered error page in production. The route still exists for previews: the same typographic shell as the 404, naming the failing source and the metric it blocks. It must not display any number.
- **Reproduce table** (block 13) is the harness made visible: five rows, one per derived file, with formula id, snapshot date, full digest, and the command. Mono, `--surface-3`, row groups by metric, no hairline under every row (a single rule above each group). This is the section that proves AC-001-04 to AC-001-07 to a reader.
- States: `stale`, `error`. No loading state exists.
- Anti-patterns: "live" or "updating" language; a green "all systems operational" badge (backend health is not the reader's question); a spinner.
- Watch items: the stale banner must not push the hero out of the viewport by more than 40px; measure it at 1024 × 620.

### Task 3: Dependency ratio (metric 1, Fig. 1)

- Layout: **Figure Plate A**, metadata rail left. At ≥1280px, a 180px left rail holds `FIG. 01`, the formula id, and the source count, vertically aligned to the plot's top. The plot occupies the remaining width. At 768 to 1279px the rail collapses into a single meta line above the title. Below 768px everything is a single column.
- Chart form: **single-series monthly line**, x = `1996-01` to latest month, y = 0 to `ceil(max × 1.15)` at 0.10 steps. 2px `--chart-series-1` stroke, no area fill (a filled area implies magnitude; a ratio is a line), a 5px end dot, and the latest value labelled in `--text-num-m` mono at the right edge with 8px of clearance.
- Readout strip above the plot (always visible, no hover): three values in mono `--text-num-m` with `--text-micro` labels: latest month and value, the 10-year mean, and the value in `1996-01`. These three numbers are the finding, available without interaction.
- Annotations: at most two, each a 1px leader line plus a two-line label in `--ink-2` (date in mono, note in sans). Content-driven from locale keys, not authored in the component. Mobile shows one.
- Axis treatment: horizontal rules at 0.25 intervals in `--chart-grid`, labelled at the left in `--ink-3` mono 12px; x labels yearly at desktop, every 5 years at <640px via `data-tier="minor"`. No vertical gridlines.
- States: `null-value` when `affiliates = 0` for a month (render the month's point absent from the line and mark the gap with `--chart-null` hatch plus a one-line note, and the same month in the table reads `no definido`); `current` otherwise. The line must not interpolate across a null month.
- Clicks: the latest value opens the provenance panel for that figure; the `Ver los 360 datos` disclosure opens the monthly table; the source count in the rail jumps to the reproduce table row.
- Motion: plate entry only (fade plus 4px rise, 160ms, once).
- A11y: `<figure>` with `<figcaption>` carrying `FIG. 01`, the title, and the one-sentence finding; SVG `role="img"` with `aria-labelledby` pointing at the caption title and `aria-describedby` at the readout strip; table carries every monthly value.
- Anti-patterns: an alarm-red area fill; a "crisis begins" vertical marker line with a label like `EL COLAPSO`; interpolating across missing months; a legend for a single series (there is nothing to disambiguate).
- Watch items: 360 monthly points at 1000 units of width is 2.7 units per point; drop to a 4px step is invisible but the path string must not be rounded so hard that the line develops visible steps. Round to one decimal in viewBox units, not to integer pixels.

### Task 4: Contribution cover (metric 2, Fig. 2)

- Layout: **Figure Plate B**, metadata rail right (mirrors Fig. 1 for rhythm). Same construction otherwise.
- Chart form: **line crossing a reference**, annual, x = first available year to latest, y = 0 to `max(1.4, max × 1.1)`. The series is 2px `--chart-series-1`. The **break-even line at 1.00** is 1px `--chart-ref` (2px dashed, `stroke-dasharray: 6 4`) with the label `equilibrio 1,00` at the right end in mono 12px. Where the series sits below 1.00, the region between the series and the 1.00 line is filled with `--chart-hatch`. That hatched wedge is the whole argument of this figure and it is drawn without a single red pixel.
- Readout strip: latest ratio, the gap in euros for the latest year (mono, `formatValue` currency), and the number of years in the series that were below 1.00 (an integer, no percentage).
- Interaction beyond disclosure: none. Two series on two axes would be a lie; the euro amounts live in the readout and the table, not on a second axis.
- States: `null-value` when expenditure is 0 (NullPlate); a genuine 0.00 contributions year renders honestly with the hatch at maximum and the readout showing the gap, because that is real data.
- Clicks: `Ver los datos` table; the gap value links to the reproduce row for IGAE contributions; the `equilibrio` label links to the methodology definition of cover.
- A11y: the hatching is never the only carrier; the table prints both ratio and gap per year, and the caption sentence states the number of years below break-even.
- Anti-patterns: a red-filled deficit region; a "bankruptcy countdown" annotation; a dual axis for expenditure; a KPI card above the chart repeating the same number.
- Watch items: the hatch pattern at 1px scale can moiré on low-DPI screens. Test at 100% zoom on a 1366×768 display; if it shimmers, raise the stripe pitch from 3/4px to 4/5px rather than lowering contrast.

### Task 5: Cohort return, IRR with sensitivity band (metric 3, Fig. 3)

- Layout: **Figure Plate C**, rail left, plus a selector row under the title.
- Chart form: **return ladder**. One row per cohort (content-driven, minimum two, v1 uses four). Shared x axis in percent, from −2% to +8%, with a 0% reference line in `--chart-ref`. Per row: the 9 grid combinations of the sensitivity band rendered as 5px dots at 30% opacity in `--chart-series-1`, the `[min, max]` range as a 2px whisker with caps, and the central value as a 9px filled dot. The central value is also printed as a right-aligned mono numeral at `--text-num-m`. Rows are 56px apart with a single `--rule-1` line above the group, not between rows.
- Assumption chips directly under the ladder, in one row, each a `<button>` opening an inline `<details>` definition: `entrada 25`, `jubilación 65`, `14 pagas`, `esperanza de vida <n>`, `π 2,0 %`. These are the T5 and open-question assumptions and they must be visible next to the result, not in a methodology appendix (informal spec: do not hide assumptions).
- Selector: a `role="radiogroup"` of links (`?cohort=1980`), server-rendered, 44px tall, 1px border, radius 0, selected state = 1px `--accent` border plus `aria-current="true"`. Selecting a cohort swaps the driver table below (contribution, pension, life expectancy, years contributing, years drawing) which is a real `<table>`. Zero JavaScript.
- States: `null-value` when contributions are 0 (no finite IRR) and when `R = 0` (IRR = −1, which is a real number and renders as `-100,0 %`, not as null). The two cases must look different: −1 is data, null is not.
- Clicks: cohort selector; each assumption chip; `Ver los datos` table (cohorts × central, min, max, drivers).
- A11y: the ladder's dots are decorative; every value appears in the table and in the printed right-hand numerals. The radiogroup uses real links with `aria-current`, so it works with a screen reader and with the back button.
- Anti-patterns: a bar chart of IRR (bars imply a zero baseline and a magnitude that an internal rate of return does not have); a band drawn as a blurred gradient; hiding the drivers behind hover; presenting the central value without its band.
- Watch items: at four cohorts the ladder is 224px tall plus the assumption row; on a 640px-wide phone the printed numeral and the axis will collide. At <640px, move the printed numeral under each row's label and shorten the axis to −2%..+6% with 2% ticks.

### Task 6: Implicit debt across four discount rates (metric 4, Fig. 4)

- Layout: **Figure Plate D**, rail right, and the plate's largest type is the **rate labels**, not any debt value. There is no KPI strip above this figure, no hero treatment, and no single number in `--text-num-l` or larger. This is a hard constraint from T6 AC-25 and from the anti-pattern list.
- Chart form: **rate ladder**, four horizontal rows at 1%, 2%, 3%, 4%. Shared linear x axis in billions of euros from 0 to `ceil(max × 1.08)`. Each row: rate label left (mono, `--text-num-m`, `--ink-1`), a 24px-tall bar in `--chart-series-1` at 100% with no fill track behind it (a background track is dashboard clutter), the value right-aligned in mono `--text-num-l`. Below the four rows, separated by a single `--rule-1` line: one row for `Fondo de Reserva` drawn as a 24px bar on the same axis, which will be a sliver, preceded by the computed ratio in body text: `los activos equivalen al 0,4 % de la deuda implícita al 2 %`. Seeing the sliver is the point; the ratio sentence makes it exact.
- Negative values (assets exceed PV, AC-001-26): the bar extends left of a 3px `--ink-1` zero baseline, hatched with `--chart-hatch`, and the row is labelled `superávit`. Never clamped, never recoloured.
- Readout strip: the four values are already the chart. The strip instead carries the four `PV(obligations)` values with the asset line subtracted, in mono, so a reader can verify the subtraction themselves.
- States: `null-value` if the obligation stream is absent (NullPlate). The four rates are a fixed set: a partial set is a schema failure, not a visual state, so the component asserts exactly four keys and renders `withheld` otherwise.
- Clicks: each row opens its provenance panel (the discount rate is an assumption, so the panel must name where 1/2/3/4% comes from); the asset row links to the Fondo de Reserva source; the table.
- A11y: the bar is redundant with the printed numeral. Table = rate × [PV, assets, implicit debt], plus a total row.
- Anti-patterns: a single headline number anywhere on the page; a log axis that hides the order of magnitude; a red bar for the highest rate; a "€X trillion" callout in display type; comparing the four rates as if one were correct.
- Watch items: the four bars on a shared axis make the 1% bar about 30% longer than the 4% bar. That is honest and must not be "fixed" by normalising.

### Task 7: Required base growth (metric 5, Fig. 5, thesis carrier)

- Layout: **Figure Plate E**, full width, taller than the others (a deliberate 25% extra vertical space, because this is the figure the argument rests on), rail left. Two stacked components: the gap chart on top, the 3 × 3 sensitivity matrix below it at ≥900px, matrix first and chart second at <900px.
- Chart form, gap chart: a **range versus point** comparison on one axis in percent per year from −2% to +8%, zero marked with `--chart-ref`. `g_required` renders as a solid `--chart-series-1` bar from the band minimum to the band maximum (24px tall, no track) with a 2px `--ink-1` central tick; `g_proj` renders as a 3px `--ink-1` vertical marker spanning the plot height, labelled with its value in mono above the axis. The region between the central tick and the marker is filled with `--chart-hatch` and labelled `diferencia` with the numeric gap in `--text-num-l` mono. The hatching is bounded by two labelled rules, so the reader can see exactly which two numbers produce it. Caption language stays neutral: the caption names the two quantities, it does not name a conclusion.
- Matrix, 3 × 3: rows = `g_wage` ∈ {0,00, 0,01, 0,02}, columns = the T5 band {min, central, max}. Each cell contains the gap value in mono, right-aligned, plus the cell background stepped through a single-hue sequential ramp (accent at 0/10/20/30% mix). A `<caption>`-level note states that the shading is a scale aid and the printed numbers are authoritative. Cells are not interactive; there is no hover state.
- Assumption line under the figure, always visible: `r_paid_real 3,1 % · g_wage 1,0 % · g_proj -0,2 % · horizonte 2026-2070`, each value linking to its assumption ledger row (AC-001-31 requires exactly these four beside the value).
- States: `null-value` if the projection series is missing; `withheld` if the 9-cell grid is incomplete, because a partial sensitivity grid would misrepresent the band.
- Clicks: each of the four assumption values; `Ver los datos` (matrix as a real table with the same 9 values); a link from the caption to the dispute section (never to the thesis).
- Anti-patterns: a single `g_required` number in display type; an arrow or trend line implying a forecast; a "the system is doomed" annotation; a diverging red/blue colour ramp on the matrix; the thesis vocabulary in the caption.
- Watch items: nine mono numerals in cells at 640px will overflow. At <640px the matrix keeps three columns but drops to 13px numerals with `--space-2` cell padding, and the row labels move to a second line above each row rather than a left column. Verify no cell wraps.

### Task 8: Content model keyed by country and locale, i18n coverage

- Layout: no new layout. This task governs every string on the page, so its design surface is (a) per-locale budgets enforced as validation, (b) the locale switcher, (c) the unsupported-locale page.
- Locale switcher: five 2-letter codes in the header, each a real link to the corresponding route, 40 × 40px hit area, mono 13px uppercase-on-purpose-not (the label is a code, so it is not subject to the all-caps headline ban). Current locale marked with a 1px `--accent` bottom border and `aria-current="page"`. No dropdown, no JS, no flags. Flags for languages are wrong (one flag, one country, several languages) and are a credibility smell on a site about institutions.
- Unsupported locale: a full page in the shell, one sentence, the five valid locales as links, `noindex`, HTTP 404 status. Never a redirect, never a silent fallback.
- Number and date formatting: one shared formatter module, locale-aware, used everywhere (see Global Tokens). Any component that calls `Intl` directly is a defect; the formatter is the only entry point, and it is what the mutation and unit tests can pin.
- Type: no new tokens. The only locale-conditional token is the optional `--nav-collapse` breakpoint discussed under locale guidance.
- A11y: `lang` on `<html>` per route and on any quoted foreign-language passage; `hreflang` alternates; the switcher links carry the language name in their `aria-label` in the current locale's language (`Cambiar a alemán`), so a screen reader user is not read five bare codes.
- Anti-patterns: flags; a dropdown of languages; partially translated chrome ("Fuente" in an otherwise German page); machine-translated thesis prose (the thesis is the one place where translation must be human, and the design cannot police it, so state it here as a content rule); English fallback shown silently; a locale switcher that only works on the home route.
- Watch items: the five-code switcher plus the snapshot stamp plus four anchors plus the theme toggle is the width budget at 1024px. Measure in `de` before shipping; if it overflows, the nav collapses to the `<details>` index at 1024 for all locales, not just `de`.

### Task 9: Citation, attribution and contested-claim rendering

- Components: `<CitationChip>` (inline, mono `--text-meta`, 1px `--rule-2` border, radius 0, 32px min height, chevron after the label, `aria-expanded`), `<CitationPanel>` (inline `<details>`, `--surface-3` ground, `<dl>` with institution / document / table or series / date / page if applicable / URL), `<ContestedClaim>` (the dossier), `<Quote>`.
- Chip placement: immediately after the claim, at the end of the sentence, never as a superscript numeral. Reads `Fuente: AIReF, Proyecciones 2024` and wraps to two lines without truncation.
- Dossier: a two-column grid of equal `1fr` columns separated by a 1px `--rule-2` vertical rule, both columns top-aligned with identical type sizes and identical chip placement. Each position: the position's short name in `--ink-1` (`--text-h3`), the proponent as name plus role in `--ink-2`, the verbatim quote, the chip. Header row above the pair: the mono register label. No tint on either column, no ordering language like "however", no winner. Below 900px the rule becomes horizontal and the columns stack with identical treatment.
- Quotes: sans `--text-body-lg`, `--ink-1`, a 2px `--rule-2` left rule, and **not** the serif. The serif belongs to the site's voice only; a quoted economist must never look like the site speaking. Quotes display up to 3 lines at desktop; if the verbatim text is longer, show the opening with an explicit `[...]` marker and `Leer la cita completa` opening the full verbatim text plus the source. Truncation without the marker is banned.
- Unresolvable citation: nothing renders. The design requirement is that the *layout* must not betray this: dossier columns and prose blocks are generated from content arrays with `null` filtering, so no empty slot, no orphan rule, no "citation unavailable" placeholder ever appears. If a whole dispute block loses one position, the block does not render either, because a one-sided dispute is a false statement.
- A11y: `<blockquote cite="...">` with `<cite>` for the source; the chip is a `<button>` with `aria-expanded`/`aria-controls`; the panel is `aria-labelledby` the chip.
- Anti-patterns: superscript footnote numbers with a list at the bottom; "according to some experts"; a quote set in italics with no attribution; a source chip that is a bare domain name; a citation panel that is a modal overlay.
- Watch items: a citation panel inside a `<details>` inside a two-column dossier must not overflow the column at 900 to 1023px. Give the panel `overflow-wrap: anywhere` for long URLs and verify a 120-character URL does not blow the grid.

### Task 10: Thesis, dispute, agreement section structure

- Components: `<RegisterKey>` (block 4), `<AgreementSection>`, `<DisputeSection>`, `<ThesisSection>`. Each is a separate component with its own ground token; none shares a prose container with the metrics.
- `<RegisterKey>`: three stacked rows, each showing a live sample of its register (the first real item, not a mock): row 1 renders the provenance strip from Fig. 1 under a 1px rule; row 2 renders the two-column rule and one chip; row 3 renders the `--surface-3` ground with the 4px ink rule and the serif line. Each row also carries its mono label and a one-sentence explanation. This block exists so the taxonomy is learned before it is needed.
- `<AgreementSection>`: `--surface-1`, prose at 64ch, no border, mono label `Lo que no se discute`. Every claim carries a `<CitationChip>`. No tint and no panel, because agreement is the default register and marking it heavily would make it look like a position.
- `<DisputeSection>`: full-bleed `--surface-2` inset with 1px `--rule-1` top and bottom, mono label `Lo que se discute`, then one or more dossiers. The inset is the marker: crossing into it must feel like entering a different room, and it must be obvious on a greyscale printout.
- `<ThesisSection>`: full-bleed `--surface-3` inset, 4px `--ink-1` left rule, mono label `Nuestra lectura`, then (in order) the disclaimer line in `--text-small` sans (`Esto es nuestra lectura. No es un resultado del cálculo.`), the thesis statement in `--font-serif` italic at `clamp(1.5rem, 3vw, 2.125rem)` with `--leading-body`, then two or three short paragraphs in sans, then a signature block (name, role, link to the biography page) and the figure links it rests on (`FIG. 03`, `FIG. 05`). The serif appears here and nowhere else on the site.
- Motion: none in any of the three. In particular the thesis does not fade, slide, or reveal on scroll. Deliberate.
- A11y: each section is a `<section aria-labelledby>` with a real `<h2>`; the mono label is part of the heading structure (`<p>` with `aria-hidden="false"` above the `<h2>`, or the label folded into the `<h2>` as a `<span>`, whichever the Coder picks, as long as the heading outline never reads "Lo que se discute" twice); the contention is conveyed by the label text, not by the rule or tint.
- Anti-patterns: the fraud reading appearing in a figure caption, a meta description, an OG image, a nav label, or an aria-label; a thesis section that visually rhymes with the figures; the dispute rendered as a debate with a verdict; agreement rendered as a wall of quote cards; any transition animation between registers; the thesis panel using the accent colour as its rule (it uses ink, so the accent stays reserved for interactive and computed semantics).
- Watch items: three full-bleed tinted insets in a row can start to look like the page is alternating themes. Keep the tints within 4 to 6 lightness points of the page paper (as specified) and keep the vertical gaps between them at `--space-9`; verify on a greyscale screenshot that the three blocks still read as distinct.

### Task 11: Accessibility, non-visual data for charts

- Component: one shared `<DataTable>`, server-rendered, used by all five figures. It is the accessible representation and it is designed, not appended.
- Structure: `<details>` with a `<summary>` styled as a full-width secondary control (44px, 1px `--rule-2`, radius 0, caret icon, label from a locale key plus the row count, e.g. `Ver los 360 datos`). Closed by default at every breakpoint, so there is no hydration-dependent state. The table is present in the DOM when closed.
- Table design: `<caption>` always rendered, visible, `--text-micro` mono, `--ink-3`, containing the metric name, unit, source, and formula id. `<thead>` with `position: sticky; top: 0` on `--surface-2`. Numeric cells right-aligned, mono, `tabular-nums`. Row groups by decade or year via `<tbody>` with `<th scope="rowgroup">`. Exactly one hairline above each `<tbody>`, none between rows. Zebra striping is banned; a 300-row striped table is a migraine.
- Null cells read `no definido` in `--ink-3` italic-free sans, never `0`, never `-`, never empty.
- Scrolling: at <640px the table sits in a container with `overflow-x: auto`, `tabindex="0"`, and an `aria-label` naming the table, so a keyboard user can scroll it. The page body never scrolls horizontally.
- Chart pairing: `<figure>` contains `<figcaption>` (the finding sentence) and the SVG with `role="img"`, `aria-labelledby` the caption title, `aria-describedby` the readout strip. The SVG is a redundant visual: nothing exists in the SVG that is not in the caption, the readout, or the table. A text-only render of the page must still deliver every number and every claim.
- Second table for Fig. 1: a five-column annual summary table appears *above* the monthly table inside the same disclosure, because 360 monthly rows are navigable but not readable. The annual summary is derived, labelled as such, and does not replace the monthly data.
- Motion and contrast: `prefers-reduced-motion` removes plate entry and the matrix stagger. `prefers-contrast: more` raises series stroke to 3px and hatch mix to 30%. `forced-colors: active` maps series to `CanvasText` and replaces hatch with `stroke-dasharray` patterns.
- Anti-patterns: an `aria-label` on the SVG that only says "chart"; an sr-only table that is technically present but styled as a 1px clipped box with no `<caption>`, `<th>`, or scope attributes; a table that omits the null months; a "download CSV" link offered instead of an accessible table (the CSV is welcome in addition, never instead).
- Watch items: `<details>` content is not exposed to some assistive-technology search-in-page implementations until opened. That is acceptable per AC-001-45 (present in the DOM with an accessible name and the same values) but the summary label must therefore be explicit and the table must never be inside a JS-only disclosure.

### Page shell (not owned by a task, must still be built)

The eleven tasks own the data, the registers, and the tables. The shell that carries them is specified here so the Coder does not invent it. Everything below is server-rendered.

- **Header**, 64px, sticky, `--surface-1` at 97% with a 1px `--rule-1` bottom rule (no blur, no glass, no shadow). Single row at ≥1024px: wordmark (text, not a logo mark, `--font-sans` 600 at 17px, lowercase, no tagline) then the four anchors then the snapshot stamp, the locale codes, and the theme toggle, right-aligned. At <1024px: wordmark, snapshot stamp, and a native `<details>` "Índice" disclosure containing the anchors and the locale codes. No hamburger icon animation, no drawer, no JS. `--header-h` becomes 88px at <768px because the snapshot stamp takes its own line.
- **Hero**, `padding-top: var(--space-9)` and never more (96px, the skill's cap is 96px at desktop), `min-height: calc(100dvh - var(--header-h))` on ≥768px only, never `h-screen`. Grid 7/5 with a `--space-8` column gap. Left column: `<h1>` at `--text-display` (2 lines maximum at 1280px, 3 at 360px), a `<p>` subtext capped at 20 words, then one primary link-button (`--accent` fill, `--on-accent` text, 48px tall, 2-word label, radius 0) and one secondary text link. That is the whole stack: no eyebrow, no tagline under the CTAs, no trust strip, no scroll cue.
- **Hero instrument panel** (right 5 columns): `--surface-2` ground, 1px `--rule-1` border, radius 0, `--space-5` padding. Contents in order: a mono micro label naming the ratio, the latest value in `--text-num-xl` mono, a three-row comparison strip (`1996`, `2010`, `último`) each with a mono value, a 96px-tall sparkline of the last 30 years (no axes, single 2px `--chart-series-1` stroke, the last point dotted and labelled), then a footer line at `--text-micro` with the snapshot date and the source link. This panel is the first paint's LCP context and it must not depend on JS: the sparkline path is inlined at build time.
- **Viewport-1 budget** (measured at 1280 × 800 and 390 × 844): header 64 + hero top padding 96 + h1 (2 lines, 120) + subtext (2 lines, 60) + CTA (48) + gaps (64) = 452px of the left column, so the panel and the first scroll hint sit inside the fold at 800px. At 390 × 844 the panel stacks under the CTAs and may fall below the fold; the h1, subtext, CTA, and snapshot stamp must all be visible without scrolling.
- **Source strip** (block 3): one row, `--text-meta` mono, `--ink-2`, the five official bodies as plain names, each a link to the exact series, separated by `--space-5` gaps and no dot separators, followed by the "cómo lo calculamos" link. Plain names rather than logo marks: reproducing an institution's mark implies an affiliation this site does not have, and the name is the accurate citation.
- **Reproduce block** (block 13): `--surface-3` ground, mono throughout, five row groups by metric, each row showing formula id, snapshot date, the full 64-character digest (wrapping, never truncated), and the command. A `<copy>` control per digest. This block is deliberately the most "terminal" surface on the site and is the one place where a dense 13px mono table is the correct answer rather than a compromise. Below 768px each row becomes a labelled stack (label above value), and a 64-character digest is allowed to wrap at any character with `overflow-wrap: anywhere`; the block never scrolls sideways.
- **Assumptions ledger** (block 14): three labelled clusters (`Cohorte y pagas`, `Tipos y crecimiento`, `Datos y ventanas`), each a `<dl>` of name, value, and one-sentence consequence. One `--rule-1` above each cluster, nothing between rows. Every assumption named in T3 to T7 and in `10-tasks.md` open questions 3 to 7 must appear here, and every figure that depends on one links to its row. Below 768px each cluster's `<dl>` is already single-column; only the cluster gaps shrink to `--space-6`.
- **Revisions** (block 15): a `<ol>` of the last five snapshot changes, each `fecha · qué cambió · hash anterior`, mono. This is the site publishing its own error record, which is the cheapest credibility in the design and the most commonly omitted.
- **Footer** (block 16): two columns at ≥768px, single column below with the source list first and the statement second. Left: full source list with official URLs, then the licence and the locale links. Right: a short "what this site does not claim" paragraph in `--text-body` (not legalese), the no-tracking statement, a real contact, and the canonical URL plus snapshot date for citation. One `--rule-1` above. No version string, no build stamp, no social icons row.
- States: `stale` banner sits above the header and pushes the whole page by its own height; everything else is `current`.
- A11y: skip link to `#main` as the first focusable element, `<header>`/`<nav>`/`<main>`/`<footer>` landmarks, one `<h1>` per page, the hero panel's sparkline `aria-hidden` because the three comparison values carry it.
- Anti-patterns: a hero image; a gradient behind the hero number; a "scroll" cue; a cookie banner; a language dropdown; a logo mark drawn by hand; a tagline under the CTA; a version footer.
- Watch items: the hero panel's three-value strip plus sparkline is the only decoration this design permits, and it earns its place by carrying real values. If the data for the sparkline is missing, the panel renders the value and the strip without a chart, and does not substitute a placeholder line.

### Task 12: Admin authentication

- Layout and views: **Login** (§Admin Surface). Routes `/admin/login`. One field, no username, 360px column, top-offset `--space-9`, no card.
- Components: `<AdminShell>`, `<OperatorBar>`, `<LoginForm>`, `<LockoutPanel>`, `<SessionExpiredPanel>`, `<AdminError kind requestId at />`.
- Type and tokens: `--text-h3` title, `--text-body` labels, `--text-meta` for the lockout timer and the request id, `--state-danger` for the failure line and the lockout rule. No new tokens beyond those in §Admin tokens.
- Motion: none. A failed attempt re-renders the same form; the field keeps focus. No shake, no red flash, no toast.
- A11y: the error line is `role="alert"` and is the first thing after the `<h1>`; the lockout panel replaces the form so there is no focusable control left inside it; the password field keeps `autocomplete="current-password"` and is never re-populated after failure; `aria-describedby` links the field to the error line. Touch targets 44px.
- Anti-patterns: a username field (it creates the oracle AC-46 exists to close); a "remember me" checkbox; a password-reveal toggle (its only value is typo recovery on a single-operator surface; its cost is a shoulder-surfing affordance); a "forgot password" link (there is no recovery path, so the link is a dead end that hints at an account system); an attempt counter ("2 de 5"); a per-identity error message; an error toast; redirecting a failed login back to `/admin` with a flash message.
- Watch items: the login page must render no session-bearing markup and no operator bar, because an operator bar implies a session. Session expiry is a page state, not a toast: any admin action returning 401 replaces the body with `<SessionExpiredPanel>` and the login link carries **no** return path (a `next=` parameter is an open-redirect vector and is not needed on a single-operator surface).

### Task 13: Fail-closed configuration

- Layout and views: **503 unconfigured** (§Admin Surface). Applies to `/admin` and every admin API route, with the same body.
- Components: `<ConfigClosedPanel>` rendered as the entire page. Critically: it renders **no form element of any kind**. That absence is the design signal that separates a configuration fault from an authentication failure.
- Type and tokens: `503` in `--text-num-l` mono `--ink-2` (not `--text-num-xl`: a giant error code is a consumer error page), title in `--text-h2`, body in `--text-body` at `--measure`, diagnostic row in `--text-micro` mono, plus a 4px `--state-danger` left rule and a mono `CONFIG` chip.
- Motion: none.
- A11y: `<h1>` names the fault; the diagnostic row is a `<dl>`; no `role="alert"` (this is a page, not an announcement).
- Anti-patterns: naming `ADMIN_PASSWORD_HASH` or the session secret (AC-56 forbids it, and the panel gives a request id instead so the operator correlates with server logs); "are you sure your password is right?"; a disabled login form; a retry button; a contact-the-administrator link that goes nowhere; a 500 page instead of 503; a stack trace.
- Watch items: the 503 body must be byte-identical for a missing password hash and a missing session secret. If the two cases render different copy, an attacker learns which secret is absent. The 503 response must also escape the admin root layout entirely: no operator bar, no session affordances, no navigation, because chrome implies a working surface behind it. `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store` on the 503, not only on the 200 paths.

### Task 14: Refresh trigger and pending revision

- Layout and views: **Panel home**, **Refresh in progress**, **Pending revision review**, **Approval and publish** (§Admin Surface).
- Components: `<PublishedRevisionBlock>`, `<RefreshButton>`, `<RunProgress stages>`, `<StageRow>`, `<ReviewTable figures>`, `<BlastRadius figures>`, `<FigureDiffRow>`, `<PublishConfirm revision>`, `<StatusChip state>`.
- Type and tokens: table numerals in `--font-mono` `tabular-nums` at `--text-body`; row height `--admin-row-h`; changed rows carry a `--diff-rule` left rule in `--state-pending`; unchanged rows are dimmed to `--ink-3`, never hidden by default; status chips `--chip-h-sm`; primary action fills `--accent` at 44px.
- Motion: 120ms state transitions only. No progress shimmer, no row highlight animation, no animated delta numbers. The in-progress indicator is a 2px linear indeterminate bar plus a text stage line, gated by `prefers-reduced-motion`.
- A11y: the review table is a real `<table>` with `<caption>`, `<th scope="col">`, and a per-row `<th scope="row">` naming the figure; the blast-radius sentence is the first paragraph after the `<h1>` and is not in a callout that a screen reader could skip; stage rows are an `<ol>` with the state word in text; the approve flow's checkbox is a real `<input type="checkbox">` with a visible label.
- Anti-patterns: red/green diffing of numeric changes (a rising dependency ratio is a change, not a failure, and colour would train approval by hue); a summary card ("5 figures updated") as the primary artifact instead of the per-figure table; inline editing of any value (the admin never edits a computed figure); auto-approval on timeout; an approve button that is present when the diff is empty or the revision is superseded; rendering an upstream error body or workflow log tail (it can carry credentials; mirrors `docs/SECURITY.md` on upstream error responses).
- Watch items: the approve control must exist only inside a rendered review page. The review route mints a server-side `reviewToken` bound to the revision id; the approve form carries it as a hidden input and a POST without it is rejected. That is what makes "the operator saw the diff" a property of the system rather than a hope, and it means no URL can publish.

### Task 15: Parameter proposals

- Layout and views: **Parameter proposal review** (§Admin Surface). Distinct surface from the figure diff: a *rule* change, not a value change.
- Components: `<ProposalReview proposal>`, `<RuleDiff before after>`, `<BlastRadius kind="parameter" figures>`, `<CitationBlock>` (the T9 `<CitationChip>` and `<CitationPanel>`, unchanged), `<RejectProposal>`.
- Type and tokens: parameter name in `--text-h3`; the rule diff as two full sentences in `--text-body-lg` with the changed numerals in mono; the blast-radius block on `--state-danger-ground` with a 3px `--state-danger` left rule; the machine-provenance line in `--text-micro` mono `--ink-3`; the citation quote in sans `--text-body-lg` with a 2px `--rule-2` left rule (never the public serif, which belongs to the site's own voice).
- Value shapes, rendered honestly: integer (`14`), range (`1.200,00 € - 4.720,50 €` with a hyphen, never an en-dash), enumerated choice (the option's label plus its identifier in mono). Never render a parameter as a bare JSON value.
- Motion: none.
- A11y: the rule diff is a `<dl>` of `antes`/`ahora`; the blast radius is prose, not a chart; the citation is `<blockquote cite>` with `<cite>`; the reject reasons are a real radio group with a legend.
- Anti-patterns: presenting a parameter proposal in the figure-diff table (it would imply a one-figure blast radius); auto-approving; showing a proposal as a diff of numbers rather than a diff of rules; hiding the machine origin of the proposal; an "unsupported proposal" card in the UI (out-of-set proposals are rejected server-side and appear only in the audit log, and a UI representation would imply the UI can handle them); a reject control that is a one-click button with no reason (the reason is what the audit log needs).
- Watch items: a parameter proposal that reaches approval must not be publishable in one step. Approving the parameter commits the rule; the *publication* that follows requires a re-computation and a second, separate figure review (§View: parameter proposal review). If the implementation collapses those into one action, the blast-radius design has been defeated and the reviewer will not see which figures moved.

### Task 16: Audit log

- Layout and views: **Audit log** (§Admin Surface). Route `/admin/audit`, server-rendered, filterable by GET.
- Components: `<AuditTable entries>`, `<AuditRow>`, `<FilterForm>`, `<ChainStatus verifiedAt>`, `<CopyControl>`.
- Type and tokens: rows at `--admin-row-h`, `--text-body` for action and target, `--text-meta` mono for timestamps and request ids, `before → after` in mono with right-aligned numerals so a scan down the column reads.
- Motion: none.
- A11y: `<caption>` states the filter in force and the entry count, so a filtered view cannot be mistaken for a complete one; `<th scope="col">` on every column; pagination links are `<a>` with `rel="next"`/`rel="prev"`; the filter form has visible labels and a submit button (no auto-submit).
- Anti-patterns: edit, delete, or bulk-select affordances of any kind (the table component accepts no `actions` prop, so it is structurally incapable); highlighting failed-authentication rows in `--state-danger` (a red wall trains an operator to ignore red, and it hands an attacker who reaches the log a visual signal); infinite scroll; relative timestamps ("hace 3 días") in place of the absolute time; rendering the attempted credential (AC-66), the request body, or any header value.
- Watch items: chain verification is displayed as a claim with a timestamp (`cadena verificada hasta <ISO>`) or as `sin verificar` in `--state-pending`. Never display "verified" without the verification's own timestamp, because an unverifiable claim in an audit log is worse than no claim.

## Admin Surface

A utility surface, not a marketing surface. `/admin` is an instrument panel where a wrong click corrupts a public claim, so every decision below is scored on: can the operator see exactly what will change, and can they avoid changing it by accident.

### Dial dialect and register marker

`DESIGN_VARIANCE 2`, `MOTION_INTENSITY 2`, `VISUAL_DENSITY 8`, applied to the admin root layout only.

- **Variance 2**: symmetric grid, aligned columns, no offsets, no asymmetry. A dashboard that decorates is a dashboard that hides things.
- **Motion 2**: 120ms transitions on focus, hover, and disclosure. One indeterminate 2px bar for a running job, disabled under `prefers-reduced-motion`. Nothing else moves.
- **Density 8**: `--admin-gap` instead of `--space-6..9`, 40px rows, 1440px max width, hairlines above groups only, and mono numerals everywhere (already a global rule, and here it is load-bearing).

**Register marker: inverted chrome.** The admin root renders an `<OperatorBar>`: 48px tall, `--ink-1` ground with `--surface-1` text (so it inverts automatically in both themes), sticky, `--z-operator`. Left: a mono wordmark `administración` and the environment (`producción` or `previsualización`). Right: the session expiry as an absolute local time (`caduca 14:32`, mono), the snapshot the panel is currently showing, and `Salir` (a POST form, never a link, so a prefetch cannot sign the operator out).

The inverted bar is deliberately not the public site's 4px ink rule (which marks the thesis). Two registers must not share one device. An operator glancing at any admin screenshot sees a solid dark band across the top and knows immediately this is not the public page.

Admin is a separate root layout (`app/admin/layout.tsx`), not a section of the public page, so the public page's theme lock is not in play. The bar is inverted in both themes, once, at the top, and never mid-page.

**Locale**: Spanish only, `lang="es"`, no locale switcher, no hreflang. One operator, one identity. The T8 no-hardcoded-strings rule still applies: admin strings live in an `admin` namespace of the same locale resource system. A shared component that emits a locale link is a defect in admin.

**Routes**: `/admin` (home), `/admin/login`, `/admin/revisions/[id]`, `/admin/proposals/[id]`, `/admin/audit`, `/admin/refresh/[runId]`. Every one carries `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`.

Structurally, two route groups: an **unauthenticated group** (`/admin/login`, and the 503 which escapes the admin layout entirely) that renders no operator bar and no navigation, and an **authenticated group** that renders the operator bar. The 503 is not a page inside the admin layout; it is the response instead of it (T13).

**Status chips.** `<StatusChip>` is admin-only and its `state` is a closed union of six: `published`, `pending`, `running`, `changed`, `superseded`, `failed`. Each renders a `--chip-h-sm` box with a 1px border and the state word in `--text-micro` mono; `pending` and `failed` additionally take `--state-pending` and `--state-danger` text and border. The word is always present, so the chip is never a colour-only signal.

### View: 503 unconfigured

Purpose: tell an operator the surface is closed for a configuration reason, without teaching anyone anything about credentials.

Geometry: single column, `--measure`, `--space-9` top offset, left-aligned, `--surface-1`. A 4px `--state-danger` left rule runs the height of the content block. No header, no operator bar (there is no session and no configuration, so pretending to have chrome would be misleading).

Contents, in order:
1. A mono chip `CONFIG` in `--state-danger`.
2. `<h1>` = `Administración no configurada`.
3. One paragraph: the surface is closed because the deployment's administrative configuration is incomplete, and no one can enter until it is completed at the deployment. No key names, no values, no hint about what kind of credential exists.
4. A mono `<dl>`: `petición` (request id, copyable), `hora` (ISO 8601 UTC), `estado` (`service unavailable`).
5. A single text link back to the public site.

What makes it unmistakably a configuration fault and not a login error: there is **no form**, no field, no button, no retry, and the only actionable token is a request id, which is the artifact you hand to whoever owns the deployment. A login failure always leaves you a way to try again; this page deliberately does not.

Anti-patterns: naming the env keys (AC-56); a greyed-out form; "contact your administrator to reset your password"; a 500; a generic "something went wrong"; an illustration.

Watch items: identical body for a missing password hash and a missing session secret. The 503 also escapes the admin layout entirely: no operator bar, no navigation, no session affordances, because chrome implies a working surface behind it. `no-store` and `noindex` on the 503 response itself.

### View: login

Geometry: 360px column, horizontally centred in a 1440px `--admin-max` canvas, `--space-9` from the top of the content area. Not vertically centred: a login floating in the middle of a tall empty viewport reads as a consumer app, and this surface should read as an instrument.

Contents: `<h1>` `Acceso` in `--text-h3`; label `Contraseña` above a single `type="password"` input (`autocomplete="current-password"`, 44px, 1px `--rule-2`, focus ring `--accent`); one primary button `Entrar` full width, 44px, `--accent` fill; nothing else. No logo, no illustration, no tagline, no secondary links, no footer.

States:

| State | Rendering |
|---|---|
| initial | field focused on load, no error, no message |
| `auth.failed` | one line above the field in `--state-danger`, `role="alert"`: `No se ha podido iniciar sesión.` Field cleared, refocused, no counter, no attempt number |
| `auth.lockedOut` | the form is **replaced** by `<LockoutPanel>`: `--surface-2` ground, 3px `--state-danger` left rule, `<h2>` `Acceso bloqueado temporalmente`, body naming the scope (`desde esta red`), the remaining time in `--text-num-m` mono, and one line `El bloqueo se libera automáticamente.` No field, no button, no link except the public site |
| `auth.rateLimitedGlobal` | same panel, body says the limit is global (`para todo el servicio`), because the operator must not think their own IP is at fault when it is not |
| `session.expired` | `<SessionExpiredPanel>` rendered in place of the admin body on any 401: one sentence, a primary link to `/admin/login`, no return path |

Why this is not an oracle: with **no username field**, "unknown user" is not expressible, so the wrong-password response and every other credential response are the same response (AC-46 is satisfied structurally, not by copy discipline). There is no attempt counter before the threshold. The lockout panel reveals only the rate limiter's own state, which the attacker could already measure from the response delay, and it names the scope so a legitimate operator is not misled. The page never distinguishes "configured but wrong" from anything else; the configuration case is a different route with no form at all (T13), and it is only reachable when the whole surface is closed, so it cannot be probed with a credential.

Never persisted: no `localStorage`, no `sessionStorage`, no "remember me", no autofill of the field after failure, no credential in any URL or query string, no credential in the audit log. The only artifact is the `HttpOnly` session cookie, which client code cannot read.

### View: panel home

Purpose: answer three questions in one screen. What is published, how old is it, and what can I do.

Contents, top to bottom:

1. **`<PublishedRevisionBlock>`**, full width, `--surface-2` ground, 1px `--rule-1`, radius 0, `--space-5` padding, no shadow:
   - `PUBLICADO` mono label, `--text-micro`, `--ink-3`, plus a `<StatusChip state="published">`.
   - The revision id in `--text-h3` mono (`rev 2026-10-01.3`).
   - A definition list: `hora` (absolute, `<time>` with full ISO in `title`), `commit` (12-char prefix in mono plus copy, linking to the commit), `figuras` (`5`), `snapshot` (`2026-10-01`, `hace 12 días` as a secondary qualifier only, never as the primary value), `ventana` (`45 días`), `hash` (the derived snapshot digest, 12-char prefix plus copy).
   - Two links: `Ver en el sitio` (opens the public figure in a new tab, `rel="noopener"`) and `Ver el registro` (filtered audit view for this revision).
2. **The single primary action**: `Solicitar actualización`, `--accent` fill, 44px, full width on mobile, left-aligned at desktop. Directly beneath it, one line in `--text-small`: `Se ejecuta el cálculo en GitHub Actions y se crea una revisión pendiente. Nada se publica hasta que la apruebes.` That sentence is the whole safety design of this screen: it names the blast radius before the click.
3. **Pending work**, one table: `Tipo | Creada | Figuras | Estado`, rows for pending revisions and parameter proposals, each row a link to its review. Hairline above the group only.
4. **Empty state** for pending work: one line, `No hay revisiones pendientes.` plus `Comprobado a las 14:02.` No illustration, no encouragement.
5. Audit link at the bottom of the content, as a text link, because it is reference material rather than an action.

If a pending revision already exists for the current source snapshot, `<RefreshButton>` renders disabled (44px, `--rule-2` border, `--ink-3` label) with a one-line reason: `Ya existe una revisión pendiente para este snapshot.` The UI enforces the intent of AC-59 instead of letting the operator discover it as an error.

Anti-patterns: KPI cards, sparklines, a "system healthy" badge, a chart of anything, a welcome message with the operator's name and time-of-day, a notification bell.

### View: refresh in progress

Purpose: the job runs elsewhere (GitHub Actions) and takes minutes. The operator needs to know what is running and to be able to leave without cancelling.

Contents:
1. `<h1>` `Actualización en curso`, plus `<StatusChip state="running">`.
2. A definition list: `despachada` (absolute time), `ejecución` (run id, mono, copyable), `origen` (`manual` or `programada`), and a link `Ver la ejecución en GitHub` (external icon, `rel="noopener"`).
3. `<RunProgress>`: an ordered list of four stages, `Despacho`, `Descarga`, `Cálculo`, `Revisión pendiente`. Each `<StageRow>`: an 8px square (outline `--rule-2` = pending, filled `--accent` = running, filled `--ink-1` = done, filled `--state-danger` = failed), the stage name, the state word in `--text-micro` mono, and the stage's own timestamp when it has one. Squares, not dots and not spinners: a square reads as an instrument indicator, a dot reads as decoration, and a spinner hides which stage you are in.
4. A 2px indeterminate bar in `--accent` under the stage list, only while any stage is running, disabled under reduced motion (the text state line remains, so nothing is lost).
5. `transcurrido` in `--text-num-m` mono, server-rendered at page load and updated by the optional poll.
6. Two actions, deliberately unequal:
   - `Dejar de seguir` is a **text link** (no border, no fill, underline on hover): it navigates to `/admin` and does not touch the job. A one-line note states `La ejecución continúa. Cuando termine, la revisión aparecerá en el panel.`
   - `Cancelar ejecución` is a **danger-outline button** (`--state-danger` text, 1px `--state-danger` border, transparent fill) placed after the link and reachable only inside a `<details>` `Opciones de la ejecución`, with a confirmation step. Cancelling is destructive: it throws away a computation the operator waited for.

Refresh mechanics: the page is server-rendered and stateless. The no-JS baseline is a plain `Actualizar estado` link that re-requests the page. Progressive enhancement adds a 5s poll in a client leaf that (a) only runs when `document.visibilityState === 'visible'`, (b) clears on unmount, (c) re-renders only the stage list and the elapsed time. No state is stored; the poll is a read.

States:
- `running`, normal.
- `noUpdate`: no stage change for more than 10 minutes. Show `sin actualización desde <hora>` in `--state-pending` and the GitHub link. Do **not** claim failure: the panel cannot distinguish a slow run from a stuck one, and guessing would be exactly the improvisation the pipeline forbids. Escalate to the run link.
- `done`: replace the stage list with a single line and a link to the pending revision (`La revisión está lista para revisar.`). The page does not auto-redirect; the operator chooses.
- `failed`: the failing `<StageRow>` in `--state-danger`, a fixed locale sentence naming the class of failure (dispatch, fetch, compute, publish), the request id, and the GitHub link. A secondary `Reintentar` appears only when the failure class is retryable. **No raw stderr, no workflow log tail, no upstream error body** is ever rendered.
- `cancelled`: stages after the cancellation point render as `no ejecutada` in `--ink-3`.

Anti-patterns: a full-page spinner; a fake percentage ("73%"); auto-redirect on completion; a cancel button adjacent to "leave" (the two must not be one click apart); printing the run's raw logs.

### View: pending revision review

The highest-stakes screen in the product. Design for comparison, not summary.

Geometry: full `--admin-max` width. One `<h1>` `Revisión <id>`. Immediately beneath it, `<BlastRadius>`: a full-width block on `--state-pending-ground` with a 3px `--state-pending` left rule, containing two generated sentences:
- `Aprobar publica 5 figuras: ratio de dependencia, cobertura, retorno por cohorte, deuda implícita, crecimiento requerido.` (built from the diff's figure list, never authored)
- `Nada cambia en el sitio público hasta este paso.`

Then the table. Columns, left to right: `Figura` (220) | `Antes` (120) | `Ahora` (120) | `Δ` (90) | `Fuente` (200) | `Snapshot` (130) | `Hash` (130). `Δ` is a signed numeral with the metric's unit; when unchanged it reads `sin cambio` in `--ink-3`. Numerals right-aligned, mono, `tabular-nums`.

Row treatment:
- **changed**: `--diff-rule` left rule in `--state-pending`, a `<StatusChip state="changed">` `cambiado` chip beside the figure name, values in `--ink-1`.
- **unchanged**: no rule, values and delta in `--ink-3`. Dimmed, not hidden: the operator needs to see that a figure did *not* move, because "the dependency ratio held steady while cover fell" is information.
- A header control `Ocultar sin cambios` toggles `?changed=1` (a link, server-rendered). It is a convenience, never the default, and the count of hidden rows is printed when it is active.

No red/green. A change is marked as a change; whether it is good is not the instrument's job, and colour-coding deltas trains an operator to approve by hue. Direction is carried by the sign and the numeral.

Row expansion: a `<details>` per row (`Ver detalle`) opening a full-width panel on `--surface-2` with the formula id, the full 64-character input hash before and after, the source URL before and after when it changed, the byte size of the pending JSON, and a link to the pending file. Not a modal: a modal over a diff table removes the comparison, which is the one thing this screen exists for.

Blocking pre-flight, rendered above the table when present (and disabling approval):
- `sin manifiesto` on any figure (T1 coupling, AC-60): a `--state-danger` row naming the figure and the missing field.
- `Contenido sin cita` when the revision would publish a named-person claim without a resolvable citation (AC-68): a `--state-danger` row naming the unit and the claim, with the citation slot that failed.
Both are generated from the publication gate's own output, so the panel shows the same reason the server would reject with.

States:
- `pending`, normal.
- `no-changes`: every figure identical. The approve control is **not rendered**; the only action is `Descartar revisión` (danger-outline). A sentence explains that a revision with no changed figure publishes nothing. This is the anti-muscle-memory guard.
- `superseded`: a newer revision exists. A `--state-pending` banner names the newer one and links to it; approval is not rendered; the only actions are `Ir a la revisión vigente` and `Descartar`.
- `publishing`, `published`, `publish-failed`: see the approval view.

Clicks: row detail disclosure, the `?changed=1` toggle, the provenance links, the log link, and the approval flow. **No cell in this table is an input.**

### View: parameter proposal review

Purpose: a parameter change is a change to a *rule*, so it is reviewed as a rule, never as a number in the figure table.

Layout: single column at `--measure-wide` (~78ch), not a table. Contents in order:

1. `<h1>` `Propuesta de parámetro` plus `<StatusChip state="pending">`.
2. A mono line naming the machine origin: `propuesta por <modelo> · <fecha> · <id>`. The operator must always know a model wrote this.
3. The parameter name in `--text-h3` and its enumerated member identity in `--text-micro` mono (`pension_payment_count`).
4. `<RuleDiff>`: two full sentences stacked as a `<dl>`, `Antes` and `Ahora`, in `--text-body-lg`, with the changed numerals in mono. Full sentences, because the consequence is semantic: `La pensión se abona en 12 mensualidades al año.` becomes `La pensión se abona en 14 mensualidades al año.` A bare `12 → 14` is not reviewable.
5. `<BlastRadius kind="parameter">` on `--state-danger-ground`, 3px `--state-danger` left rule. Generated from the parameter's dependency map, never authored: `Este parámetro re-deriva 3 de 5 figuras: retorno por cohorte, deuda implícita, crecimiento requerido. Sus valores publicados cambiarán en el siguiente cálculo.` Plus one comparison sentence, present on this screen and only this screen: `Un cambio de dato afecta a una figura. Un cambio de parámetro re-deriva tres.` That sentence is the design answer to making blast radius legible.
6. `<CitationBlock>`: the verbatim legal or official text in `<blockquote cite>` with a 2px `--rule-2` left rule, sans (never the public serif), followed by `<CitationChip>` and `<CitationPanel>` exactly as T9 defines them, plus the source's own date and the article or reference identifier.
7. Actions: `Aceptar parámetro` (accent fill) and `Rechazar` (danger-outline, opening a `<details>` with a required reason radio group: `la cita no resuelve`, `fuera del conjunto enumerado`, `sin cambio neto`, `fuente de clase incorrecta`, plus a confirm). Rejection is a first-class, audited act with an enumerated reason, not a close button.

The two-gate flow, and the reason it exists: accepting a parameter commits the rule change but publishes no figure. The panel then shows `Recalcular con el nuevo parámetro` as the only primary action, which dispatches the T14 workflow. The resulting figures arrive as an ordinary pending revision with the rule already changed, and are reviewed in the figure table. One gate for the rule, one for the numbers. If the numbers were derivable at accept-time, a single gate would hide which figures moved, which is the exact failure this task's blast-radius requirement is about.

Anti-patterns: rendering a proposal as a figure diff; auto-approval; a parameter shown as a bare JSON value; a citation collapsed by default; a reject button with no reason; an "unsupported proposal" card; the public serif on the legal quote.

### View: approval and publish

Two deliberate acts, and the second one shows the values.

Step 1, on the review page: `Revisar y aprobar` is a `<summary>` styled as the primary button, opening a `<details>` inline (not a modal, so the diff stays visible beside it). Inside:

- A restatement table, compact: one row per changed figure, `Figura | Ahora`, with the previous value in `--ink-3` before an arrow. This is the "show what will go live" requirement: the operator confirms against values, not against a label.
- The revision id, the figure count, and the count of rows suppressed by `Ocultar sin cambios` if it is active (so a filter cannot hide a change at the moment of approval).
- One checkbox: `Entiendo que estos valores pasan a ser públicos.` Placed *after* the values, because a consent control placed before the evidence is a formality.
- `Publicar revisión` (accent fill, 44px) and `Cancelar` (plain text link).
- A hidden `reviewToken` input bound to the revision id.

Step 2, after submission: the page becomes a **publication receipt**, never a toast. `--surface-2` ground, `<h1>` `Publicado`, `<StatusChip state="published">`, the revision id, the commit sha, the timestamp, `Ver en el sitio`, `Ver el registro`, and `Volver al panel`. A toast would be the wrong register: this is irreversible state, and transience is the enemy of a record.

Failure: `<h1>` `No se ha publicado`, a fixed sentence naming the class (`la revisión no ha pasado la comprobación de publicación`), the request id, and the unchanged review still on screen below so no work is lost. The button re-enables; the server is idempotent by revision id, so a double submit cannot publish twice.

Anti-patterns: a single unguarded click; a confirm dialog that only repeats the revision id; a success toast; a "published" state that does not name the commit; auto-publish when the diff is trivially small; approval available from the panel home without loading the diff.

### View: audit log

Route `/admin/audit`, server-rendered, `--admin-max`, 40px rows.

Header: `<h1>` `Registro`, then `<ChainStatus>`: `cadena verificada hasta 2026-10-01T14:02:11Z` in `--text-micro` mono, or `sin verificar` in `--state-pending` when no verification run exists. Never a bare "verified".

`<FilterForm>`: a GET form with `acción` (a `<select>` of the enumerated action set, never free text), `desde` and `hasta` (`<input type="date">`), and a `Filtrar` submit plus a `Limpiar` link. The current filter is restated in the table's `<caption>`, with the entry count, so a filtered log can never be mistaken for the complete record.

Columns: `Hora` | `Identidad` | `Acción` | `Objetivo` | `Antes → Ahora` | `Petición`. The last column carries the request id (mono, copyable) which is the join key to server logs. Absolute timestamps only, in the operator's local time with the ISO value in `title`.

Row rendering by action class, all at the same height and weight:
- data actions: `antes → ahora` as numerals, mono, right-aligned.
- session actions: `-` → `sesión iniciada` / `sesión cerrada` / `sesión caducada`.
- failed authentication: `-` → `intento fallido`, target `login`, no credential field and no highlight. Visually ordinary, deliberately: a red row trains an operator to ignore red, and it reveals to anyone who reaches the log where to look.
- publication: `revisión <id>` → `publicada`, with the commit sha in the detail.
- proposal actions: `propuesta <id>` → `aceptada` / `rechazada`, with the reason code in the detail.

Per-row `<details>` (`Detalle`) holds the chain hash (12-char prefix plus copy), the full target path, the reason code when present, and the request id in full.

There is no edit affordance of any kind: `<AuditTable>` accepts no `actions` prop, has no checkboxes, no row menu, no inline control, and the component is separate from every other table in the product so it cannot inherit one.

Pagination: 100 rows per page, `Anterior` / `Siguiente` links, a count line, and one sentence at the bottom: `Las entradas no se modifican ni se eliminan.` Empty state: `Sin entradas.` with no softening, because on a live deployment an empty log means something is wrong.

### Small screens

Both high-stakes views are tables that cannot survive at 360px. What collapses, and what never does:

**Revision review (< 768px).** The seven-column table becomes one block per figure:
- Heading row: figure name plus `<StatusChip>`.
- A two-column comparison, `Antes | Ahora`, values at `--text-num-m` mono, side by side because comparison is the task. This is the one place where two numerals are allowed to be large on mobile.
- A line: `Δ -0,03` in mono, or `sin cambio` in `--ink-3`.
- `Fuente`, `Snapshot`, `Hash` as label-above-value pairs in `--text-micro`, wrapping, never truncated.
- Row height become `56px` minimum for the tappable detail disclosure; the values themselves are not tappable.

Never collapsed at any width: the figure name, the before value, the after value, the delta sign, the changed/unchanged state, the blast-radius sentences, and the approve/reject consequences. If those cannot be shown together, the layout is wrong, not the requirement.

The actions are not in a sticky bottom bar: a fixed bar covers the last row and invites mis-taps on the exact screen where a mis-tap is expensive. Instead the blast radius and a `Revisar y aprobar` jump link appear at the top, and the full action block repeats after the last row.

**Audit log (< 768px).** Each entry becomes a fixed four-line stack: line 1 `Hora · Acción`, line 2 `Objetivo`, line 3 `Antes → Ahora` (wrapping, mono), line 4 hidden inside `Detalle` along with identity, request id, and chain hash. One shape for every action class, because a conditional layout would make some entries unreadable for reasons the reader cannot see.

**Panel home (< 768px).** `<PublishedRevisionBlock>` stacks its definition list to one column; the primary action goes full width; the pending table keeps `Tipo` and `Creada` and moves the rest into the row link's detail.

**Login and 503** are already single-column; only the top offset shrinks to `--space-7`.

Touch targets: 44px minimum everywhere, 56px for rows that are disclosures. No horizontal page scroll at any width; long hashes wrap with `overflow-wrap: anywhere`.

### Error, secret, and oracle discipline

**Secret never rendered.** One component, `<AdminError kind requestId at />`, where `kind` is a closed union (`config.unconfigured`, `auth.failed`, `auth.lockedOut`, `session.expired`, `dispatch.failed`, `fetch.failed`, `compute.failed`, `publish.failed`, `internal.error`). It accepts **no** `message`, `detail`, `error`, or `cause` prop and never interpolates anything but a server-generated request id and an ISO timestamp. Each `kind` maps to one locale key with no placeholders. There is no `dangerouslySetInnerHTML` anywhere in the admin tree, and no component receives an upstream response object.

Consequences, stated as rules the Coder can check:
- No env key name, secret value, hash string, stack trace, workflow log, GitHub API body, or SQL fragment can reach the DOM, because no prop can carry one.
- The failed-login panel and the 503 panel share no component that could accept extra detail.
- The password field is never re-populated and never rendered with a `value` prop.
- The audit log records failed attempts without the attempted credential (AC-66); the design gives it no field to put one in.
- Upstream errors (GitHub dispatch, fetch failures) are logged server-side in full and rendered as a fixed sentence plus a request id. This mirrors `docs/SECURITY.md` §Upstream Error Responses Must Not Reach the Client, applied to the operator as the client.

**Oracle avoidance, summarised as five structural facts:**
1. There is no identity input, so no response can distinguish an unknown identity.
2. The failure line is one fixed string; there is no attempt counter before the threshold.
3. The lockout panel names only the limiter's own scope and release time, both of which the attacker can already observe as delay.
4. The configuration case is a different route with no form, reachable only when the surface is entirely closed, so it cannot be probed with a guess.
5. Nothing in the UI changes shape between "wrong password" and "not configured". The former keeps a form; the latter has none. A difference in *page class*, never in *error text*.

### noindex and shared components

- `X-Robots-Tag: noindex, nofollow` is sent as a **header** on every admin response, including 401, 403, 404, and 503. A meta tag alone is insufficient because error responses and redirects are exactly what a crawler encounters first.
- No admin URL appears in `sitemap.xml`, and the sitemap is generated from an explicit public-route manifest, never from filesystem discovery, so adding an admin route cannot leak it.
- `robots.txt` does **not** carry `Disallow: /admin`. A disallow would stop crawlers from fetching the page and therefore from seeing the `noindex`, while still advertising the path to anyone who reads the file. `noindex` plus sitemap exclusion is the correct pair. (AC-52 requires both; it does not require a robots rule, and the design forbids one.)
- Shared components may be reused in admin (`<DataTable>`, `<CitationChip>`, `<CitationPanel>`, `<ProvenanceStrip>`, `<HashChip>`, `<CopyControl>`, `<StatusChip>` stays admin-only). Every shared component must be metadata-free: no `<link rel="canonical">`, no `hreflang` alternates, no Open Graph tags, no JSON-LD, no locale switcher, no document `<title>` logic. Those belong to route-level layouts. A canonical URL emitted from a shared component would point an index at a public page while the content is an admin view, which is both wrong and a leak.
- Admin has its own root layout. The public layout must not be imported into admin, and admin routes must not be children of the public layout, because the public layout emits the header, the snapshot banner, the locale links, and the analytics-free footer that admin does not want and should not assert.
- Admin pages set `<meta name="robots" content="noindex, nofollow">` as well, redundantly, so a misconfigured proxy that strips headers still cannot index them.

### Client-side state persistence

**None.** Specifically:

| Mechanism | Decision |
|---|---|
| `localStorage` | not used |
| `sessionStorage` | not used |
| `IndexedDB` | not used |
| Cookies | the `HttpOnly` `Secure` `SameSite=Strict` session cookie only, unreadable from JS, plus the CSRF synchronizer token (delivered in the form, held in memory) |
| `history.state` | not used; no revision data is ever pushed into history |
| Service worker / cache | none; admin responses are `Cache-Control: no-store` |
| URL query | only the view filters that must be shareable: `?changed=1` and the audit filters. No revision data, no tokens |

Why this is safe rather than merely minimal: (a) any persisted admin state is a second copy of operational data living outside the audit trail, and the audit trail is the product's control; (b) a persisted selection or "resume where you left off" could restore a stale pending revision and publish the wrong thing, and the blast radius of that mistake is a public claim; (c) any future content-injection path would gain a persistence target, and there is no reason to hand it one.

The one exception, considered and rejected: remembering the audit filter across visits. It creates a hidden state in which a filtered log looks complete, which is the single worst property an audit view can have.

The theme preference (`localStorage`, public site) is not carried into admin: the admin shell follows the system preference only, because an operator toggling a theme mid-review is a distraction with no benefit and the inverted bar reads correctly in both modes.

### Where admin conflicts with the public design

| Conflict | Resolution | Which yields |
|---|---|---|
| Public bans alarm red and "deficit" red as a crank signal; admin needs unambiguous destructive states | Admin adds `--state-danger` and `--state-pending`, used only inside `/admin`; `--data-deficit` never appears in admin, `--state-danger` never appears on the public site | The public rule yields **inside `/admin` only**, and the public palette is unchanged |
| Public bans live indicators, ticking timestamps, and pulsing dots (a snapshot is a snapshot); admin has a genuinely running job whose elapsed time matters | Admin may show elapsed time, a stage line, and one 2px indeterminate bar; it still bans the word "live", pulsing dots, and fake percentages | The public rule yields; the public surface is untouched |
| Public bans status dots; admin needs stage state | 8px squares paired with a state word, admin only | The public rule yields |
| Public page locks one theme and forbids inverted sections; admin's marker is an inverted operator bar | Admin is a separate root layout, not a section of the public page, so the lock does not apply | The public lock yields **structurally** (different layout root), never visually mid-page |
| Public dials are 5 / 4 / 5; admin is 8 / 2 / 2 | Dials are page-scoped; each surface declares its own triple over one token system | Neither yields; the dials are scoped, not shared |
| Public forbids modals and uses `<details>`; admin's approval could argue for a modal | Admin also uses `<details>`, so the diff stays visible while confirming | The public instinct holds; the cost is that the confirm does not block the rest of the page, accepted at this scale |
| Public reserves the serif for the site's own voice (thesis only) | Admin never uses the serif, including for legal quotations | No conflict: the rule extends unchanged |
| Public sets `--grid-max: 1240px`; diff tables need more width | Admin uses `--admin-max: 1440px` | The public width yields for admin only; both are tokens, neither is a literal |

## Out-of-scope tasks

Seven tasks are partially or wholly backend, and only their rendering surface is specified here.

- **T1 manifest:** the value object, hash computation, and validation are out of design scope. In scope: `<ProvenanceStrip>`, `<ProvenancePanel>`, `<HashChip>`, `<FormulaChip>`, and the `withheld` plate state.
- **T2 ingest harness:** the fetcher, the freshness evaluation, and the committed-JSON writer are out of design scope. In scope: the snapshot stamp, the stale banner, the build-failure route, and the reproduce table.
- **T3 to T7 calculation kernels** (formulas, rounding, edge-case semantics, property-test invariants) are out of design scope. In scope: chart form, encoding, readout, states, table shape, and clicks for each metric.
- **T12 authentication internals:** argon2id parameters, HMAC construction, the rate limiter, and the CSRF verifier are out of design scope. In scope: the login view, the generic failure line, the lockout panel, the session-expired panel, and the operator bar.
- **T13 configuration boundary:** secret loading, the build-output grep gate, and the 503 routing are out of design scope. In scope: the 503 view and the rule that it renders no form.
- **T14 dispatch and pending store:** the GitHub `workflow_dispatch` call, the pending store under `data/pending/`, idempotency, and the commit-on-approval mechanics are out of design scope. In scope: panel home, run progress, the revision review table, the blast-radius block, the approval flow, and the publication receipt.
- **T15 proposal write path:** the enumerated parameter type, the structural separation from derived figures, and citation resolution are out of design scope. In scope: the proposal review view, the rule diff, the blast-radius block, the citation block, and the reject flow.
- **T16 log persistence:** JSONL storage, the chained hash, and the verification job are out of design scope. In scope: the audit table, the filter form, the chain-status line, and the rule that the table accepts no actions.

No task has zero frontend surface, so no task is skipped entirely.

## Revision 1: live E2E findings

Measured against the built app (Chromium, 1440×900 and 390×844, `es` and `de`, plus `/admin`). This section is additive: it does not restate anything that already works, and it does not touch the token palette, the dial values, the three-register system, the admin surface, or the chart forms (those are unexercised, not wrong).

**What the pass confirmed and this revision preserves unchanged:** the register separation reads correctly at a glance (instrument plate / untinted consensus prose / `--surface-3` thesis inset with the serif and an `OPINIÓN` label); German does not overflow; `/admin` returns 503 with no nav, no form, and no password field. Do not redesign any of those.

### Severity ranking

| # | Directive | Finding | Severity |
|---|---|---|---|
| D4 | Overflow containment, 320px floor | F3 | **Blocks launch** |
| D1 | Unresolved figure state, promoted to first-class | F1, F6, F8 | **Blocks launch** |
| D2 | Hero subject ladder | F1, F6 | **Blocks launch** |
| D3 | Public vs operator vocabulary boundary | F2 | **Blocks launch** |
| D5 | Empty-state accessibility contract | F4 | **Blocks launch** |
| D6 | Provenance strip, designed form | F7 | Degrades quality |
| D8 | Locale switcher and mobile header budget | F9, F10 | Degrades quality |
| D7 | Mark, favicon, share card | F5 | Degrades quality (share card), polish (favicon) |

The five blocking items share one root cause: the app was built for the state where data exists, and shipped in the state where it does not. Fixing D1 and D2 collapses the measured 7674px page to roughly 2600px at 390 and 2200px at 1440 with nothing computed, and removes the "unfinished product" reading without inventing a single claim.

### D1 (blocks launch): the unresolved figure state. Findings F1, F6, F8.

Supersedes the *rendering* of the `null-value` and `withheld` rows in §State model, and adds one state. The states keep their names; what changes is the space they are allowed to occupy.

**When data is absent, the figure stops being a figure.** A figure in a non-computed state does not render a plate, a chart frame, a hatched area, a dashed "coming soon" box, or any numeral at any scale. It renders one row.

| State | Cause | Public rendering | Vertical budget |
|---|---|---|---|
| `computed` | manifest valid, value present, inside freshness window | full plate: caption, readout, chart, table, provenance strip | 420 to 560px |
| `null-value` | the formula returns no value (T3, T4, T5 edge cases: zero denominator, zero contributions) | full plate; the chart renders with the gap hatched by `--chart-null`; the table row reads `no definido` plus a public-words reason | full plate |
| `unavailable` **(new)** | the figure has never been computed in this deployment (its source series is not yet specified or resolved) | one ledger row | 48px row plus `--space-5` gap |
| `withheld` | the manifest fails validation (T1) | one ledger row, different sentence | 48px row plus `--space-5` gap |
| `stale` | snapshot outside the freshness window | must not reach production (T2 fails the build); preview banner only | n/a |

**`<FigureStatusRow>`**, the whole design of an unresolved figure:

- One row, `min-height: var(--figure-state-row-min)` (48px), `border-top: 1px solid var(--rule-1)`, nothing else. No ground change, no icon, no illustration.
- Grid `[1fr auto]`: left, the figure's name as a link to its own anchor (`id="fig-03"` stays on the row, so every cross-reference from the thesis and the dispute section still resolves); right, a state chip.
- State chip: `--text-micro` mono, 1px `--rule-1`, `--ink-3`, one of exactly two words: `sin calcular` (`unavailable`) or `no verificado` (`withheld`). `null-value` has no chip because it is not a ledger state: it renders a full plate, and a plate carries its provenance strip instead of a status word.
- One reason line under the name, `--text-small`, `--ink-3`, maximum two lines at 390px, from a locale key per state (see copy rules below).
- Then one link, `Cómo se calcula`, to the methodology anchor for that figure.

**`<FigureLedgerNote>`**, rendered exactly once per page, above the first unresolved figure: one short paragraph in `--text-body-lg` at `--measure`, on `--surface-1`, no border. It states the situation once so the rows do not have to: "Algunas cifras todavía no se calculan en este despliegue. Las que faltan están marcadas y su método está publicado." Nothing more. It is not an apology and it is not a promise.

**Ordering.** Strict figure order, `fig-01` to `fig-05`, interleaving plates and rows. Grouping the unresolved rows together would reorder the narrative and put `fig-05` above `fig-03`; the note above the first one is enough.

**Copy rules, enforced as review + a content test:**

- Three locale keys, one per state, and every one of them names the state, never the mechanism: `figure.unavailable.reason`, `figure.null.reason`, `figure.withheld.reason`.
- Banned words in all three, in every locale: `resolver`, `serie`, `parse`, `fetch`, `null`, `undefined`, `JSON`, `hash`, `manifiesto`, `rev`, `build`, `deploy`, `pronto`, `en breve`, `estamos trabajando`, `disculpas`.
- Banned permanently: any forward-looking promise. The site does not know when a figure will exist, so it never says. `sin calcular` is a state; `próximamente` is a claim.
- **No state word may use a display or numeral token.** `Serie sin resolver` at 90px is the failure this directive exists to prevent. Mechanically checkable: a component that renders any of the three state words may not reference `--text-display`, `--text-h2`, `--text-num-xl`, `--text-num-l`, or `--text-num-m`.

**Why this does not look broken.** A ruled row with a name, a state word, a sentence, and a link is a *deliberate absence*, the way a statistical bulletin prints a dash and a footnote rather than an empty chart frame. An empty chart frame is a wireframe tell; a ruled row is a document. The measured alternative, five chart-shaped holes at plate weight, is what produced the bug reading.

**`<NullPlate>` is retired.** §State model's whole-plate null rendering goes away: a figure is either `computed` (and may contain null *data points*, hatched inside an otherwise normal chart) or `unavailable` (a ledger row). A computed figure whose every data point is null is treated as `unavailable`, with the null reason preserved in the row's reason line, so there is no state in which a plate renders empty axes.

**Interaction with T11:** see D5. A table is emitted if and only if a chart is emitted.

### D2 (blocks launch): hero subject ladder. Findings F1, F6.

The hero must never spend the largest type on the page announcing an absence. Supersedes §Page shell's hero description, which assumed `fig-01` unconditionally.

**`selectHeroSubject(derived)`**, a pure function evaluated at build time, first match wins. It returns a discriminated union, `{ kind: 'figure', figureId, value, comparisons }` or `{ kind: 'proposition' }`, so it can be unit-tested and so the hero variant is fixed at build time with no CLS and no client JavaScript.

Eligibility, and the exclusions are the point:

```
eligible(figure) := figure.state === 'computed'
                 && figure.headlineValue is a single scalar
                 && figure.id in ['fig-02', 'fig-01']     // fixed priority order
```

- `fig-03` is excluded because its headline is the central value of a band, and a hero that shows the central value without its band would publish the thing AC-001-21 exists to prevent.
- `fig-04` is excluded because AC-001-25 forbids a single headline implicit-debt number, and the hero is the loudest single-value slot on the site.
- `fig-05` is excluded because it carries the thesis, and promoting a thesis-adjacent number to the hero would blur the register boundary that AC-001-41 and AC-001-42 protect. The site does not lead with its conclusion, even when the number is available.

**Tier 1, `fig-02` computed:** the same numeric hero, relabelled to pension expenditure as a share of GDP, showing the current value, the first and peak observations, and three dated comparisons. Leads with this figure because the computed series carries a visible trend where the dependency ratio is flat across the recent decade (0.3293 in 2016, 0.3314 in 2024) — a flat headline invites "so what" in the first viewport.

**Tier 2, `fig-01` computed:** the numeric hero as originally specified, showing the ratio, three dated comparisons and the sparkline.

**Product-owner decision (2026-10-26), recorded here rather than inferred:** tier order is `fig-02` then `fig-01`. The rationale is the measured series, not aesthetics — `fig-02` rises from 9.82% of GDP in 1995 to 13.23% in 2024 (peak 14.39% in 2020), while `fig-01` is effectively flat over the last decade. Do not revert this ordering without the same evidence.

**Tier 3, no eligible figure (today's state): propositional hero.**

- Layout 8/4, not 7/5. The extra column goes to the sentence, because there is no number to give it to.
- Left column: `<h1>` from the `hero.proposition` slot (budget 90 chars `es`, 115 `de`; two lines at desktop, three at 390), a subtext capped at 20 words, one primary link `Leer el método` to `#metodo`, one secondary link `Qué cifras publicamos` to `#figuras`. Method first, and never the thesis: the credibility order a cold reader needs is method, then evidence, then opinion.
- Right column: the **status summary**, not an empty plate. A five-row list, one row per figure, each `name` plus its state chip, then one line in `--text-micro`: `5 figuras · 0 calculadas`, with the count computed from data, not authored. Rows link to their anchors. No frame, no border on the block, no chart placeholder.
- The largest type on the page is the proposition. No numeral larger than `--text-micro` appears above the fold, and the only one at that size is the snapshot date; the status summary's counts are `--text-micro` too.
- `min-height`: the `calc(100dvh - var(--header-h))` rule applies to the numeric hero only. The propositional hero takes its content height. This removes the measured dead space; the next section becomes visible at the fold, which is what invites the scroll.

**When the proposition slot is missing:** the build fails. A missing content key is a content bug, and silently falling back to a state word would recreate exactly the failure this directive fixes.

**The thesis is never a hero fallback.** If there is no number, the site leads with what it does, not with what it thinks.

### D3 (blocks launch): public vs operator vocabulary. Finding F2.

The rule, in one sentence: **if a string's meaning is defined by this repository rather than by the publisher, it is operator vocabulary and does not appear on a public page.**

| Operator vocabulary (public page: never) | Public replacement |
|---|---|
| `10-tasks.md`, `(pregunta abierta 1)`, `open question 1` | the reader-facing reason sentence from D1 |
| `T3`, `AC-001-08`, `spec 001` | nothing. These never have a reader-facing equivalent |
| `ss-pensioners`, `ss-affiliates`, `ine-tempus3`, any internal source slug | publisher + dataset as the publisher titles it + observation date |
| `dep-ratio-v1`, any formula id | `Cómo se calcula`, linking to the methodology anchor |
| a 64-character digest, a run id, a revision id | nothing on the public surface; `Cómo se calcula` if the reader asks for provenance depth |
| `data/derived/dependency.json`, any repo path | nothing; the reproduce path lives in the disclosure |
| env key names (`ADMIN_PASSWORD_HASH`) | nothing, ever, anywhere, including `/admin` |

**The public form of a source**, three fields in this order, rendered as the labelled grid in D6 (not as a dot-joined string):

```
Fuente     Seguridad Social
Serie      Afiliados a la Seguridad Social
Dato de    octubre de 2026
```

**The test that decides a grey area:** can a reader paste the identifier into the publisher's own site and land on the source? Yes means public. An INE table number, a Eurostat dataset code (`spr_exp_pens`), and a BOE article number all pass, and they belong on the page because they are how a reader finds the data. An internal slug, a formula id, a hash, and a spec filename all fail, because they resolve only inside this repository.

**Where operator vocabulary is acceptable:** `/admin/*`; the reproduce panel and the provenance disclosure (both marked `data-operator="true"` on their subtree); the audit log; code comments and commit messages; `data-*` attributes. Nowhere else, including captions, notices, alt text, `aria-label`, meta descriptions, and the share card.

**Enforcement (a build-time gate, not a review habit):** for every public route, take the rendered text, drop every `[data-operator="true"]` subtree, and fail the build on a match for: `\.md\b`, `AC-\d{3}-\d{2}`, `pregunta abierta`, `open question`, `[0-9a-f]{16,}`, and any value of any `sourceKey` field present in `data/derived/*.json`. The last clause is the one that would have caught `ss-pensioners:` and it stays current as sources are added.

**F2's specific strings** are not to be translated or softened: `(10-tasks.md, pregunta abierta 1)` is deleted outright. The need behind it, telling a reader why a figure is missing, is served by D1's reason line in public vocabulary.

### D4 (blocks launch): overflow containment and the 320px floor. Finding F3.

Measured: `documentElement.scrollWidth` 713 against a 390 window, with the plate clipped. Primary offender: `code.hash--full`, a 64-character digest in a `<code>` with default wrapping.

**Minimum supported width is 320px**, token `--bp-min`. Zero horizontal overflow is required at 320, 390, 768, and 1440.

Rules, in the order a Coder should apply them:

1. **Identifiers wrap anywhere.** `code, samp, kbd, .identifier, .hash, .url` get `overflow-wrap: anywhere; word-break: break-word; max-inline-size: 100%;`. This is the direct fix for the measured offender.
2. **Grid and flex children that can contain a table, `<pre>`, `<code>`, or `<svg>` get `min-inline-size: 0`.** This is the cause of most overflow that "should not" happen: the default `min-width: auto` refuses to shrink below content.
3. **SVG never forces width.** `svg { display: block; max-inline-size: 100%; height: auto; }`.
4. **Tables scroll inside themselves, never the page.** The container keeps `overflow-x: auto`, `overscroll-behavior-x: contain`, `scrollbar-gutter: stable`, `tabindex="0"`, and an `aria-label`.
5. **The compact chart viewBox is 320 wide**, token `--chart-compact-w`, replacing the 360 in §Chart strategy. At 320 it renders 1:1, so a 12px axis label stays 12px. At 390 it scales up by 1.22, which is acceptable; it can never scale down below the floor.
6. **Prose wraps like prose.** `hyphens: auto` with the correct `lang`, plus `overflow-wrap: break-word`. Never `anywhere` in prose: it breaks words mid-syllable and reads as a bug even when it is not.
7. **No `overflow-x: hidden` on `html` or `body`.** It hides the next regression instead of containing it, and it breaks sticky positioning in some engines.
8. **No ellipsis on any identifier, title, date, or figure name.** Wrap, or move it into a disclosure. Truncation on a credibility surface is a defect, not a layout compromise.

**Acceptance, as an automated check** (Playwright, four widths, both locales): `documentElement.scrollWidth === document.documentElement.clientWidth`, and no element's `getBoundingClientRect().right` exceeds `innerWidth + 1`. Run it on `/`, a resolved-figure route when one exists, and `/admin`.

### D5 (blocks launch): empty-state accessibility contract. Finding F4.

Measured: 0 `<table>`, 0 `<svg>`, 0 `<canvas>`, 0 chart hosts, and 9 `<details>` with nothing inside them.

**Decision: an unresolved figure renders no chart and no table. The status section is the non-visual equivalent.** A table with headers and zero data rows is worse than nothing: a screen-reader user is told "table, 3 columns, 0 rows" and learns the same fact they already heard from the heading, twice, with more ceremony.

**One rule makes the coupling unconditional:** a table is emitted **if and only if** a chart is emitted. One component produces both; there is no code path that renders one without the other. That is what prevents the measured state from recurring the moment a chart is re-enabled, and it is the whole of T11's guarantee expressed as a structural invariant.

What a screen-reader user encounters, per state:

| State | Encountered |
|---|---|
| `computed` | `<section id="fig-0N" aria-labelledby="fig-0N-title">`, heading, caption sentence, the chart with `role="img"` and `aria-describedby` the readout, then the `<details>` disclosure whose summary names the row count, containing the table with `<caption>`, scoped headers, and values |
| `null-value` | the same, with `no definido` cells and the reason in the caption |
| `unavailable` | heading (level 2, naming the figure), one sentence stating it is not calculated in this deployment, one link `Cómo se calcula`. Nothing else: no empty table, no `role="img"` on nothing, no live region |
| `withheld` | heading, one sentence stating it is not published because it did not pass the source check, one link |

No `aria-live` region anywhere on the public site: pages are static, so nothing appears or disappears without a navigation, and a live region would announce nothing but its own emptiness.

**Scenario note:** AC-001-44 and AC-001-45 hold under the conditional reading ("every chart renders a non-visual representation" is vacuously satisfied where no chart renders). The specifier should add the words *when a chart renders* to both, so the conditional reading is explicit rather than inferred. No contradiction, one clarification.

### D6 (degrades quality): provenance strip, designed form. Finding F7.

Measured: raw source URLs as a dense row of small text, reading as a log dump. The strip is the product's central credibility device; it cannot look accidental. Supersedes §Task 1's field list for the **public** strip; the disclosure keeps every field.

**Public strip** (rendered on `computed` figures only), directly under the plate's table, inside the `<figure>`:

- A 1px `--rule-1` above, `--space-3` padding-top, no ground change, no box.
- A three-field labelled grid at ≥1024px (`1fr 1fr 1fr auto`) and three stacked field pairs below 768px: label in `--text-micro` mono `--ink-3`, value in `--text-meta` `--ink-2`. The `Serie` value may take two lines; it is never truncated.
- The trailing cell holds two links, each a 44px hit target: `Fuente original ↗` (external icon 16px) and `Cómo se calcula`. More than three sources collapse to `Fuentes (3)` opening a three-item list; never an inline URL run.
- Fields, exactly: `Fuente`, `Serie`, `Dato de`. Nothing else. No hash, no formula id, no path, no slug, no JSON pointer, no spec reference on the public strip.

**Disclosure** (`Cómo se calcula`), marked `data-operator="true"`, `--surface-3` ground, 1px `--rule-1`, radius 0:

- A six-row `<dl>`: `fórmula`, `fuente`, `serie`, `dato de`, `huella sha256`, `ruta de reproducción`, `ventana de frescura`, all values in `--font-mono` `--text-meta`.
- The digest in a bordered `<code>` block, full 64 characters, `overflow-wrap: anywhere`, with a copy control and an `aria-live="polite"` confirmation.
- One sentence explaining what a changed digest means. That sentence is the only prose in the disclosure.

**Banned:** a list of URLs presented as provenance. A URL is not provenance; a named publisher, a named dataset, and a date are. The URL is reachable in one click from `Fuente original`, which is a different affordance from a wall of raw links.

**Compliance note:** AC-001-01 constrains the *manifest data* (`sourceUrl`, `fetchedAt`, `formulaId`, `inputHash`, `reproducePath` must all be non-empty in `data/derived/*.json`). It says nothing about the DOM. Moving four of those five fields into the disclosure is therefore compliant, and the disclosure must still render every one of them.

### D7 (degrades quality for the share card, polish for the favicon): mark, favicon, share card. Finding F5.

Measured: `favicon.ico` 404 on every route, and no icon declared. A blank tab, and worse, a blank share card, on a product whose traffic arrives from social feeds.

- **The mark is typographic, not illustrative.** One glyph: the site's initial letter, set in `--font-sans` weight 600, optically centred, on an `--ink-1` ground with an `--surface-1` letter, **`border-radius: 0`** to match the shape lock. No symbol, no shield, no chart glyph, no hand-drawn shape.
- **Files, all generated from one committed script** (`scripts/build-brand.mjs`) so they cannot drift: `app/icon.svg` (32, scales), `app/apple-icon.png` (180), `app/favicon.ico` (32, which stops the measured 404), and `app/manifest.ts` with 192 and 512 PNGs. Letter and colours come from tokens, not literals.
- **Declarations:** `<link rel="icon" type="image/svg+xml" href="/icon.svg">`, `<link rel="apple-touch-icon" href="/apple-icon.png">`, and `theme-color` meta with a light and a dark `media` variant.
- **Share card:** one static 1200×630 per locale, build-generated from the same tokens: `--ink-1` ground, the lettermark small in one corner, the wordmark, the `hero.proposition` string, and one line listing the five official sources. **No metric, no number, no date on the share card.** Third parties cache share images for weeks, so a number there becomes a false claim the first time the figure changes, and today there is no number to put there. The card's job is to state what the site is and that it cites official sources, which is true in every state.
- `og:image:alt` carries the site name and the proposition. Do not put a figure name in it.

### D8 (degrades quality): locale switcher and mobile header. Findings F9, F10.

**Locale switcher, ≥1024px.** Five 36×36 cells (`--locale-cell`) in one bordered group: 1px `--rule-1` outer border, 1px hairlines between cells, radius 0, 2-letter code in mono 13px. The active cell is **inverted** (`--ink-1` ground, `--surface-1` text) with `aria-current="page"`; inactive cells are `--ink-2` on transparent with a `--surface-2` hover. A 2px accent underline at 36px is a one-in-five cue and that is precisely what failed; a filled cell is unmistakable at a glance. The group carries `role="group"` and `aria-label="Idioma"`; each cell's accessible name is the language name in the current locale (`Cambiar a alemán`), while the visible label stays the two-letter code. 36px clears WCAG 2.5.8 (24px); `--touch: 44px` continues to apply to primary actions only, and this is not one.

**Header below 768px.** Exactly **56px**, one row, from 320 up. Token `--header-h-mobile: 56px`, which supersedes the 88px in §Page shell.

- Left to right: wordmark (text, ≤96px), the snapshot date in **ISO 8601** (`2026-10-01`, `--text-micro` mono, `title` and `aria-label` carrying the long localised form), the index trigger (40px, `caret-down` icon, `aria-label="Índice"`), the theme toggle (40px).
- **No navigation links and no locale cells in the bar.** The measured 49-links-0-buttons header is the symptom of building navigation out of anchors; every control that performs an action is a `<button>` or a `<summary>`, and only navigation is an `<a>`.
- Index panel: a native `<details>` opening a full-width panel under the header, `--surface-2`, 1px bottom rule, `max-height: min(70dvh, 420px)`, `overflow-y: auto`, no JavaScript, no overlay, no drawer. Contents in order: the four anchors at 48px rows; a hairline; `Idioma` as five full-width 44px rows showing language names (`Español`, `English`, `Français`, `Deutsch`, `Italiano`) with the active one marked `aria-current="page"` and a check icon; a hairline; the full snapshot stamp (`Datos: 1 de octubre de 2026 · ventana 45 días`) at `--text-meta`; a hairline; the theme choice as a three-row radio group (`Sistema`, `Claro`, `Oscuro`).
- Width budget to verify rather than guess, at 320: gutters 32 + wordmark 90 + ISO date 72 + index 40 + theme 40 + three 8px gaps 24 = **298px**, which fits. If the wordmark exceeds 96px in `de`, shorten the wordmark, not the date.
- **768 to 1023px** keeps the 64px header and the index panel from §Page shell, with the full snapshot stamp inline. Only below 768px does the 56px row apply. One header component, two density modes, one breakpoint token.
- `check` joins the icon set (eight total) for the active locale row in the index panel.

### New tokens

Five, and nothing else:

```css
--bp-min: 320px;              /* minimum supported width; the overflow floor */
--locale-cell: 36px;          /* switcher cell */
--header-h-mobile: 56px;      /* supersedes the 88px in §Page shell */
--chart-compact-w: 320;       /* compact SVG viewBox width, was 360 */
--figure-state-row-min: 48px; /* unresolved figure row */
```

Share-card dimensions (1200×630) stay constants inside `scripts/build-brand.mjs` with a comment pointing here: they are a build-script concern, not a component token, and putting them in `tokens.css` would invite their use in layout.

### Scenarios that need amending

| Scenario | Status | What the specifier must do |
|---|---|---|
| **AC-001-04** | Gap, and my design depends on closing it | Add a per-figure `availability: 'computed' \| 'unavailable'` field to the derived-JSON contract (T1/T2) and a scenario for the `unavailable` state. As written, the scenario cannot distinguish "a required source failed to fetch" (build must fail) from "this figure has never been specified" (a data state that publishes a ledger row). The deployed app satisfies neither reading, which is why the absence read as a bug |
| **AC-001-05**, **AC-001-06** | Amendment required | Both forbid publishing a partial snapshot. They are correct for *fetch failures* and must keep failing the build. Add one sentence to each: a figure explicitly marked `unavailable` in the committed data is not a partial snapshot, is never labelled current, and does not trigger the failure path. Without that sentence, the D1 rendering is arguably prohibited by the letter of the scenario |
| **AC-001-44**, **AC-001-45** | No contradiction, one clarification | Prefix both with *when a chart renders*. The conditional reading is already correct; the words make it explicit |
| **AC-001-07** | Unchanged | A stale snapshot still fails the build. D1 does not weaken it: `stale` is not `unavailable` |
| **AC-001-21**, **AC-001-25**, **AC-001-31**, **AC-001-41**, **AC-001-42** | Unchanged, and D2 is derived from them | Figure 3, 4, and 5 hero exclusions exist to keep these true |
| **AC-001-52**, **AC-001-53**, **AC-001-54**, **AC-001-55**, **AC-001-56** | Unchanged | The admin surface was confirmed working and this revision does not touch it |

### Not changing

The register system and its three labels; the token palette and every contrast pair verified above; the dial values `5 / 4 / 5` and the admin dialect `8 / 2 / 2`; the chart forms for all five metrics (unexercised, not disproven); the admin surface, including the 503 view confirmed in the pass; the thesis confinement rule; the citation requirement; the four-rate implicit-debt rule; the `<details>`-over-modal discipline; the no-photography decision.

## Revision 2: alarm register

Product-owner review of the deployed site (2026-10-26). Three asks, verbatim: "hay que jugar con colores"; "hay que poner bombas de relojería, pirámides invertidas, etc. hay que atraer a la gente!!"; "recalcar que esto es en españa solo!!". Plus one defect: the Reproducir section advertises seven figures, five of which publish no value, no digest and no command.

Directive ids below are `R1` to `R7`, distinct from Revision 1's `D1` to `D8`. Findings are `G1` to `G6`, all from that review:

| # | Finding |
|---|---|
| G1 | The page is monochrome and reads as quiet to the point of not registering. Colour is doing no work because there is none. |
| G2 | Nothing in the first screens pulls a cold visitor forward: no tension, no shape, no reason to scroll past the hero. |
| G3 | The Spain-only scope is not unmistakable. A visitor can take the site for a generic or international analysis, which makes every national figure ambiguous. |
| G4 | Reproducir advertises seven figures, five of which publish no value. It offers a digest and a command for numbers that do not exist: a false reproducibility claim, in the section whose only job is to prove reproducibility. |
| G5 | The hero is one instrument showing one number, inside a hero defined to be a full viewport, so nothing can appear at the fold by construction. |
| G6 | There is no demographic evidence on the page at all. The two computed figures are money ratios, and the demographic driver (`T7`) is `unavailable`, so the site argues about pensions without ever showing the age structure the argument rests on. |

**The tension is real and is not resolved by pretending it away.** Revision 1 refused the alarm aesthetic on purpose: "collapse" iconography, red tickers and urgency copy are what a crank site looks like, and a site whose credibility is built on arithmetic cannot borrow the visual grammar of the sites it is arguing against. The owner is now asking for exactly that grammar. Neither capitulation (red on black, an illustrated fuse) nor refusal (a polite "we considered it") serves them.

**Resolution, and it is a rule, not a mood: drama from data, never from decoration.** A time bomb drawn as an icon is rhetoric; a countdown computed from an official projection and printed with its own uncertainty is evidence. This revision admits the second and refuses the first, everywhere, without exception. Concretely: the biggest type on the page becomes a number nobody has to trust (16 years, and the year it lands on, and the range across the six official projection variants); the most arresting shape on the page becomes the Spanish age structure in 2050, drawn from Eurostat, with the same provenance strip as every other computed thing. No icon, no fuse, no flag, no siren, no red.

**What this revision is not.** It does not touch the register system, the admin surface, the existing chart forms, the token values already verified, or any figure's computation. It adds one hue, one data view, one derived metric, one first-viewport composition, one scope marker, and one deletion.

### Severity ranking

| # | Directive | Finding | Severity |
|---|---|---|---|
| R1 | Population pyramid, the centrepiece | G2, G6 | **Blocks the brief** |
| R2 | The countdown, data-derived | G2, G5 | **Blocks the brief** |
| R3 | Colour system, register-safe | G1 | **Blocks the brief** |
| R4 | Spain-only scope, three levels, data-driven | G3 | **Blocks the brief** |
| R5 | First-viewport recomposition and page order | G2, G5 | **Blocks the brief** |
| R6 | Reproducir advertises only what exists | G4 | **Blocks launch** (correctness defect) |
| R7 | The alarm vocabulary that is refused | G1, G2 | Degrades quality if omitted |

G6 is the finding nobody named out loud. It is the substantive one: the pension argument is demographic, the page publishes two fiscal ratios, and the demography is invisible. The owner asked for pyramids and got something better than they asked for, which is a population pyramid that is the actual input to every other figure on the page.

### Dial values: unchanged, and why

`DESIGN_VARIANCE 5`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 5` stand. This is a deliberate answer to "hay que atraer a la gente", not an oversight.

- **Variance stays 5.** What changes is scale and colour, not composition. The pyramid is a wide, full-bleed three-panel instrument, which is more composition than the page has ever carried, but its grid is straight. Raising variance to 6 or 7 would add offset for its own sake, and offset is the cheapest kind of energy: it makes a page look designed to impress, which is the accusation this site cannot survive.
- **Motion stays 4, and this is the load-bearing refusal.** Owner pressure for drama produces animation nine times out of ten: a ticking counter, a scroll-triggered fuse, a number that counts up. All three are banned here (anti-patterns 5 and 6, and §R7). The countdown adds **zero** motion primitives. The three primitives from Revision 1 are unchanged and no new one is introduced. A static integer that a reader can verify is more alarming than an odometer, because the reader cannot dismiss it as a gimmick.
- **Density stays 5.** The pyramid plate is dense in the way the existing plates are dense: numbers, a table, a provenance strip. Nothing about this revision licenses page furniture.

### R1 (blocks the brief): the population pyramid, as the page's centrepiece. Findings G2, G6.

A three-panel age-structure view, server-rendered SVG, no JavaScript, carrying its own manifest. It is the largest single visual object on the site and it is the answer to "pirámides invertidas" that survives being checked.

**Not `fig-08`. A distinct component with its own manifest.** Recommended, and the reason is structural, not aesthetic:

- `FigureId` is a closed union of seven (`web/ingest/types.ts`) and each id maps to a metric's copy, edge cases, definitions and hero eligibility. A demography view is none of those: it is not one of the five metrics, it has no "national definition" counterpart, and it has no place in the `T3`–`T7` edge-case contract.
- Numbering it would invite the hero ladder (D2), the "no single headline implicit-debt number" rule (AC-001-25) and the thesis cross-reference set to start treating a population chart as a metric, which would blur both the metric set and the register boundary.
- Provenance is not optional, so the component carries the same `Manifest` shape from `web/manifest/types.ts` (whose `figureId` is already `string`), with its own `formulaId` and `definitionId` added to the documented closed sets, its own `inputHash`, its own `reproducePath`. It appears in Reproducir as its own group (§R6). Nothing about it is unverifiable.

**Data contract (semantics fixed here; the JSON schema is T17's job).**

- Two Eurostat datasets, both verified machine-readable on 2026-10-26 against the dissemination API:
  - `demo_pjan`, "Population on 1 January by age and sex". Dimensions `freq, unit, age, sex, geo, time`. Spain: 1960–2025. Age codes `Y_LT1`, `Y1`…`Y99`, `Y_OPEN`, plus `TOTAL` and `UNK`; sex codes `T`, `M`, `F`.
  - `proj_23np`, "Population on 1st January by age, sex and type of projection". Dimensions `freq, projection, sex, age, unit, geo, time`. Spain: 2022–2100. Age codes `Y_LT1`, `Y1`…`Y99`, `Y_GE100` (note: **not** `Y_OPEN`), no `UNK`; `projection` ∈ {`BSL`, `LFRT`, `LMRT`, `HMIGR`, `LMIGR`, `NMIGR`}.
- **The variant is pinned to `BSL`** (baseline) and named on the page. The other five are not decoration: they produce the range printed beside the countdown (§R2).
- Years shown: **1995, 2025, 2050.** 1995 is the earliest year the page already publishes (`fig-02` first observation), so the reader meets one past year rather than two; 2025 is the latest `demo_pjan` observation; 2050 is the year the 65-and-over share reaches its plateau (32.7% in 2050, 32.9% by 2055, and it stays between 32.7% and 33.1% for the next two decades), and it sits inside `T7`'s 2026–2070 horizon.
- 1995 and 2025 are labelled `observado`; 2050 is labelled `proyectado`. The label is a word, not a colour.
- **Granularity: 5-year bands, 21 rows** (0–4 … 95–99, 100+). Not single years: 101 rows × 2 sexes × 3 years is 606 bars, a 1.2px band pitch at 320px, and roughly triple the inline-SVG budget in §Chart strategy. 5-year bands keep a 3px minimum bar at 320px, keep the shape legible at every width, and put the single-year fidelity where it belongs, in the committed data file behind `reproducePath`. Stated cost: the 5-year bands smooth the 1970s cohort echo. A pyramid is read as a shape; that is the trade and it is deliberate.
- **Encoding: share of that year's total population, per band, per sex, in percent.** Not absolute counts. Absolute counts would make the panels incomparable (the population *grows*: 39.6M → 49.1M → 50.5M) and would let the 2050 panel look merely bigger when what changed is its composition. This is also the honest frame: the pyramid inverts while the population rises, and the caption says so in generated words, so no reader can carry away "Spain is emptying" from a chart that says the opposite.
- **Shared x axis across all three panels, 0 to 4.5% per side**, ticks at 2% and 4%. Shared scale is a hard rule: a bar of the same length must mean the same share in every panel. The observed maximum side share across the three years is 4.34% (1995, band 20–24), so 4.5% clips nothing.
- **Orientation: age increases upward.** 0–4 at the bottom, 100+ at the top. Deliberately *not* flipped. The inversion this directive is about is in the data — by 2050 the widest band sits at 70–74 and the 80–84 band is wider than the 0–4 band — and drawing the axis upside down would force the reader to translate before comparing, hand a critic the sentence "they drew it upside down to make a point", and buy nothing. The drama is that the real shape becomes a top-heavy pyramid; the drawing stays conventional so the shape can be believed.
- **Both sexes mirrored**, males left of the centre line, females right. The two sides differ by up to 0.7 points of total population in the same band at 2050 (80–84: 2.39% male, 3.09% female), which is a real component of the story, and mirroring is how every statistical office draws it. **Both sides use the same colour.** Sex is encoded by side and by the column header, never by hue: a pink/blue sex palette is the single most clichéd move in data visualisation and it would spend the page's scarce hue budget on something position already says.
- **One hue per panel**: 1995 `--chart-series-2` (the past as reference), 2025 `--chart-series-1` (measured now), 2050 `--chart-projection` (projected). The reader is never asked to compare hues inside one panel, only across panels, and each panel is also labelled with its year and its `observado`/`proyectado` word.

**Layout.**

- Block 4 of the page inventory, immediately after the source strip and **before** the register key. The register key still precedes every prose register, which is the ordering that protects the consensus/dispute/thesis separation; what moves ahead of it is an instrument, and the hero has been showing an instrument above it since Revision 1. Amended scroll contract row, which supersedes the corresponding row of the original table:

  | Stage | Reader's state on arrival | What the design must produce | What must NOT happen |
  |---|---|---|---|
  | Viewport 2, the pyramid | Cold but hooked by the countdown | "That shape is the reason the money numbers look like that, and I can check it." The claim as one generated sentence, then the three shapes. | No adjective, no "collapse", no projection presented as an observation, no fourth panel |

- ≥1024px: three panels side by side, equal width, `--space-6` gutters, a shared centre line, one age-label gutter on the outer left only.
- 1024–768px: three panels stacked, same scale, 8px band pitch.
- <768px: three panels stacked, 6px band pitch, age labels every 20 years only (0, 20, 40, 60, 80, 100+), percentage axis hidden. Three panels stay visible rather than a one-at-a-time selector: the argument is the *change between* them, and a selector would hide exactly the comparison the block exists for. The panels total about 440px at 320px and the block with its heading, sentence and readout about 560px, which is under one and a half screens.
- Above the panels: the `<h2>`, then the generated finding sentence at `--text-plate`, then the always-visible readout strip (six values, `--text-num-m` mono, two lines at <768px): `65+` and `<20` share for each of the three years. The readout is the claim; the charts are the evidence for it. This ordering also puts the *sentence* at the fold when the block peeks, instead of the empty apex of the 2050 pyramid (§R5).
- `<figure>` inside `<section id="demografia" aria-labelledby>`. The `<figcaption>` carries the mono label `DEMOGRAFÍA` (not `FIG. 0N`; it does not borrow the metric numbering), the `<h2>`, and the finding sentence.

**Provenance, and the trap in the file layout.**

- The public strip uses the D6 form, extended for a multi-source, multi-year view: three rows of `Fuente · Serie · Dato de` (1995 and 2025 from `demo_pjan`; 2050 from `proj_23np`, baseline variant named in the `Serie` cell), then `Fuente original ↗` and `Cómo se calcula`. The disclosure carries `fórmula`, `fuente`, `serie`, `dato de`, `huella sha256`, `ruta de reproducción`, `ventana de frescura`, plus the exclusion the definition requires: `UNK` age rows are excluded (`0` persons in both observation years) and the definition string says so.
- **The derived file lives at `data/derived/series/pyramid.json`, never at `data/derived/pyramid.json`.** `createFileDerivedStore().readAll()` parses every top-level `*.json` in that directory and casts `figureId` to the closed union; a top-level file would be read as a metric figure and would either crash or be published as one. The subdirectory is skipped by the flat `readdirSync`, which is the entire reason for it. Add a comment in the store naming that reason, so the next person who "tidies" the layout does not delete the constraint.

**States.** `computed` (the three-panel plate) and `unavailable` (a D1 ledger row named as a data view, no chart, no table, one sentence, no empty frames). Never `null-value`: the two datasets have no null cells in either observation year, and a partially populated pyramid would be a false shape. `withheld` if the manifest fails. The build fails loudly if either dataset fails to fetch (AC-001-05/06 unchanged); `unavailable` here means the series has never been specified, which is not today's state.

**Accessibility.** The table is emitted if and only if the chart is (§D5, AC-001-44/45), one component produces both. `<details>` summary labelled with the row count (`Ver los 21 grupos de edad`). Table: `<caption>` naming both datasets, the variant, and the three year totals; seven columns (`Grupo de edad | H 1995 | M 1995 | H 2025 | M 2025 | H 2050 | M 2050`); `<th scope="col">` on every column and `<th scope="row">` on the band; values right-aligned mono with `tabular-nums`; header labels from locale keys, never `H`/`M` literals. At <640px the table scrolls inside its own container. The SVG is `role="img"` with `aria-labelledby` the caption title and `aria-describedby` the readout strip; nothing exists in the SVG that is not in the readout or the table.

**Anti-patterns for this plate.** A fourth panel ("what if"); a projection drawn in the same colour as an observation; a silhouette or "ghost" pyramid overlay; a percentage-change callout; the word `colapso`, `invierno demográfico`, `hecatombe` or any other noun from the doom vocabulary (that vocabulary is thesis-only, AC-001-41); an inverted axis used as a visual pun; a single headline "2050" number in display type.

**Watch items the Coder must check.** (1) `Y_OPEN` versus `Y_GE100`: the two datasets spell the open-ended band differently. A hardcoded code silently drops the 100+ band from one dataset, which is precisely the quiet omission this page cannot afford. Resolve both by label, per the existing `resolveCategoryCode` discipline. (2) The `sex` dimension contains `T` alongside `M` and `F`; summing every sex code double-counts. Use `M` + `F` resolved by label, and assert `M + F == T` as a property test. (3) Band shares per year must sum to 100 ± 0.1 (property test). (4) The 2050 panel must render whenever 2025 does, and a missing third year is a build failure, not a two-panel plate.

### R2 (blocks the brief): the countdown, computed, with its uncertainty printed beside it. Findings G2, G5.

**What is being counted, exactly.** The year in which the **old-age dependency ratio** first reaches **50** under Eurostat's baseline projection: population aged 65 and over per 100 people aged **15 to 64**, Spain, `proj_23np`, `projection = BSL`, series 2022–2100.

- **15–64, not 20–64, and this is a checkability decision.** 15–64 is the age class behind Eurostat's own old-age dependency ratio, so a reader can put this number beside the publisher's published indicator and get the same answer. A 20–64 denominator would be our own definition, defensible but not printed by anyone, and the first critic to recompute it would find a different figure and be right to ask why. It is also the exact band this repository already resolves from labels for `lfsi_emp_a` ("From 15 to 64 years", `web/sources/eurostat.ts`), so one resolved age class serves the page twice.
- Threshold **50** because it is exact, one-clause expressible (`dos personas en edad de trabajar por cada persona de 65 o más`), and it is crossed cleanly and never re-crossed inside the horizon, so the answer is a single year rather than a first-of-many.
- **Verified values** (computed from the live dataset, 2026-10-26; the Coder should reproduce them and treat a mismatch as a pipeline defect, not as a copy problem): ratio 31.9 in 2025; 36.2 in 2030; 40.5 in 2034; 45.6 in 2038; **51.3 in 2042**; 59.0 in 2050; maximum 65.8 across the horizon.
- **The answer today: 2042, which is 16 years from the snapshot year 2026.** Arithmetic rule, fixed so nobody invents precision: `years = thresholdYear − snapshotYear`, both integers, both printed. Not months, not days, not a difference of dates. This is why the block cannot become a ticker: the underlying quantity changes when the projection is revised, not when the clock moves.
- **The range is printed beside the number, and it is not optional.** Across the six published variants the crossing lands: `NMIGR` 2039, `LMIGR` 2040, `LFRT` 2041, `LMRT` 2041, `BSL` 2042, `HMIGR` 2043. So the block prints `2042` and, in `--text-micro` mono directly under it, `variantes 2039–2043`. This is the single most credibility-preserving element in the whole revision: it refuses to pick the worst case, it survives "you chose the scary projection", and it strengthens rather than weakens the point, because a range of two years either side says the crossing is not a modelling artefact of one variant.

**Copy slots (keys, with the `es` exemplar).**

| Key | `es` exemplar | Slot |
|---|---|---|
| `countdown.eyebrow` | `Proyección central · Eurostat` | names source and variant in the label, before the number |
| `countdown.value` | `16` | `--text-num-xl` mono, `--ink-1` |
| `countdown.unit` | `años` | `--text-num-m` sans, `--ink-2`, beside the numeral, never inside it |
| `countdown.year` | `2042` | `--text-num-m` mono, `--data-projection` |
| `countdown.yearLabel` | `año del umbral` | `--text-micro` mono, `--ink-3` |
| `countdown.definition` | `Años hasta que la población de 65 y más años alcance 50 por cada 100 personas de 15 a 64 años.` | `--text-small`, `--ink-2`, one sentence, what is counted |
| `countdown.range` | `variantes 2039–2043` | `--text-micro` mono, `--ink-3` |
| `countdown.source` | `Eurostat, proyecciones demográficas 2024` · `Dato de 2025` | `--text-micro` mono, `--ink-3` |

Banned in every locale: `faltan`, `quedan`, `solo`, `apenas`, `ya`, `cuenta atrás`, `bomba`, `explota`, any exclamation mark, any second-person address, and any verb in the future tense other than the declarative `alcanza`/`cruza`. The sentence states what a projection says. It does not tell the reader what to feel, and the words `bomba de relojería` appear nowhere on the public surface: the owner's metaphor is the brief, not the copy.

**Where it lives.** Inside the hero instrument panel (§R5), above the figure strip. It is not repeated anywhere else on the page, and no other surface carries a "time is running out" line.

**States.**

| State | Cause | Rendering |
|---|---|---|
| `computed` | `thresholdYear` found within the horizon | full block as above |
| `not-crossed` | the pinned variant never reaches 50 inside 2022–2100 | **no numeral at all.** The projection-coloured rule, the eyebrow, and one sentence: the baseline projection does not reach the threshold before the horizon ends in 2100. Never substitute a different threshold to keep a number |
| `unavailable` | `proj_23np` never specified or never resolved | the block does not render; the hero falls back to the D2 ladder with no countdown, and the figure value returns to `--text-num-xl` |
| `withheld` | manifest invalid | same as `unavailable`; the block is a number carrier, so it renders nothing rather than an unprovenanced number |

The countdown is never a hero fallback carrier: if there is no figure subject and no countdown, the propositional hero (D2 tier 3) renders unchanged and the pyramid is still the pull below it.

**Why this and not the other two candidates.** (a) "Year the projected working-age population falls below a stated level" is honestly computable (peak 32.140M in 2027, 26.553M by 2070) but the *level* is arbitrary, and a level in millions is a magnitude a reader cannot calibrate; the ratio 50 per 100 is one a reader can hold. Instead of a second threshold, the block's disclosure prints the one real inflection it already has: the working-age population peaks in 2027 and declines afterwards. (b) "Countdown to the end of the projection horizon" is refused outright: that counts Eurostat's publication horizon, not a Spanish fact, and dressing a dataset boundary as a national deadline is exactly the kind of invention this site exists to not do.

**Provenance.** Own manifest, own `formulaId`/`definitionId`, own digest and reproduce path, and its own group in Reproducir (§R6). The definition string names what is counted and excluded in instrument vocabulary: `población de 65 y más años dividida por la población de 15 a 64 años, por año, proyección central de Eurostat`; it contains no adjective and no conclusion (AC-001-92).

**Anti-patterns.** A ticking clock; a fuse, bomb, hourglass or siren icon; `DÍAS` or `HORAS` beneath the number; a red number; a progress bar toward 2042; a "cuenta atrás" heading; the number appearing in the meta description or the share card (a cached share image with a countdown in it becomes a false claim within weeks, D7).

**Watch items.** (1) The series must be drawn entirely from `proj_23np`, including its own 2025 value (31.9), which differs from the `demo_pjan` 2025 observation on the same definition (31.2). Mixing an observation into a projection series is the small dishonesty that would discredit the large honest one; the disclosure states that the projection's 2025 back-cast and the observation differ, and by how much. (2) `thresholdYear` must be derived, not authored: change the threshold parameter and the year must move. (3) The variant range is computed over all six variants at build time, not typed as `2039–2043`. (4) The ratio depends on the age band; the band is a documented parameter beside the threshold, not a literal buried in the aggregation loop.

### R3 (blocks the brief): colour, without collapsing the three registers. Finding G1.

The page gets colour and gains exactly one hue. Three hues exist on the public surface, each bound to one meaning, and nothing else carries a hue (the last row of the table is the neutral set, listed only to close the list):

| Hue | Token | Means | May be used as | May never be used as |
|---|---|---|---|---|
| Teal | `--accent` (unchanged) | measured data and interaction | series stroke for observed values, links, focus ring, primary fill | decoration, a register marker, an urgency signal |
| Terracotta | `--data-deficit` (unchanged) | an adverse quantity | 2px rule, 3px border, small text at 4.5:1+ | a fill, a large area, anything inside a plot area |
| Olive-gold | `--data-projection` (**new**) | a projected extent, not yet measured | stroke or fill for a projected series, the countdown threshold rule, the threshold year numeral | any observation, any deficit mark, any text that is not about a projection |
| Neutrals | `--ink-*`, `--rule-*`, `--surface-*` | everything structural | text, rules, grounds, axes | — |

Why olive-gold, with evidence rather than taste:

- **It is the only hue left.** Red is banned (anti-pattern 1), purple and indigo are banned (anti-pattern 7), and pink/blue for sex is refused (R1). Blue was the other candidate and it fails on accessibility, not on style. Simulated deuteranopia and protanopia (Machado severity 1.0), CIE76 ΔE against the existing teal accent: olive-gold **45.3 / 42.9 deutan / 59.8 protan**; a slate blue `#2B4A5E` **24.5 / 12.5 / 14.1**. Blue collapses into the accent for a dichromat reader; olive-gold does not. That is why the hue is warm.
- **And it collides with terracotta for the same readers** — ΔE olive-gold vs terracotta is 33.6 normal but **10.8 under deuteranopia**. So the separation between "projected" and "adverse" cannot rest on hue for everyone. It rests on three redundancies that are therefore mandatory, not optional: a **dash pattern** (`--dash-projection: 6 4`) on every projected line, **position** (a projected panel is its own panel; a deficit mark is never inside a plot), and a **printed word** (`proyectado`, `umbral`). Colour is the third encoding, never the first.

**Allowed meanings, enforced at review.**

| Surface | `--data-projection` | Urgency language |
|---|---|---|
| Hero countdown | yes: the threshold rule and the year numeral | yes, declarative only (§R2 copy rules) |
| Pyramid, 2050 panel | yes: the only projection-coloured fill on the page | no |
| Figures 1–7 plates | only for a projected *extent*. `fig-05`'s `g_proj` is a single reference marker, so it stays `--ink-1` | no |
| Register key, consensus, dispute | no | no |
| **Thesis** | **no, and this is the rule that keeps the register** | n/a |
| Reproduce, assumptions, revisions, footer, share card | no | no |
| `/admin` | separate palette, unchanged | separate vocabulary |

**The rule that keeps the thesis distinguishable, now that colour exists.** Before this revision, colour was absent everywhere, so it could not blur the registers. Now it exists, so the thesis becomes the one block where hue is *forbidden*: `--surface-3` ground, `--ink-1` text, the 4px ink rule, the serif, the signature, no hue of any kind, and no projection-coloured area adjacent to it without a 1px `--rule-1` separator. The absence is now a marker rather than a default. A reader who has learned that warm-gold means "a projection, not a measurement" learns, one block later, that nothing here is gold: the site's opinion is not a projection and does not get to look like data. That is a stronger separation than the page had when it was monochrome.

**Where urgency may not appear, stated as bans.** No urgency in the metric plates, the dispute, the thesis, the reproduce block, the assumptions ledger, the footer, or the share card. No urgency icon, badge, pill, siren, countdown chip or "act now" phrasing anywhere. Urgency is legal in exactly one block, and inside it urgency is carried by scale and by the datum, never by colour temperature.

**Contrast verification for every new pair** (WCAG 2.1, computed; AA 4.5:1 text, 3:1 non-text):

| Pair | Ratio | Verdict |
|---|---|---|
| light `--data-projection` on `--surface-1` | 6.22 | AA |
| light `--data-projection` on `--surface-2` | 5.82 | AA |
| light `--data-projection` on `--surface-3` | 5.45 | AA |
| light `--data-projection` on `--data-projection-ground` | 5.23 | AA |
| light `--ink-1` on `--data-projection-ground` | 13.51 | AAA |
| light `--ink-2` on `--data-projection-ground` | 7.74 | AAA |
| light `--ink-3` on `--data-projection-ground` | 4.51 | AA |
| dark `--data-projection` on `--surface-1` | 10.26 | AAA |
| dark `--data-projection` on `--surface-2` | 9.53 | AAA |
| dark `--data-projection` on `--surface-3` | 8.72 | AAA |
| dark `--data-projection` on `--data-projection-ground` | 8.17 | AAA |
| dark `--ink-1` on `--data-projection-ground` | 12.48 | AAA |
| dark `--ink-2` on `--data-projection-ground` | 8.10 | AAA |
| dark `--ink-3` on `--data-projection-ground` | 5.06 | AA |
| `--data-projection` vs `--accent`, dichromacy | ΔE 45.3 / 42.9 / 59.8 | distinguishable with the dash rule |
| `--data-projection` vs `--data-deficit`, deuteranopia | ΔE 10.8 | **not** distinguishable by hue: dash, position and the printed word are mandatory |

`--data-projection-ground` is 12% of the hue over `--surface-1` in each theme, and only over `--surface-1`: at 12% over `--surface-2` the `--ink-3` pair drops to 4.24 and fails AA, so a plate needing the tint takes it over `--surface-1`, not over an inset.

### R4 (blocks the brief): Spain only, at three levels, from data. Finding G3.

The marker is **typographic, in a locale key, and derived from the country record**. No flag, no map silhouette, no badge, no pill (anti-pattern 2's stock-imagery ban covers flags; a pill is the most recognisable template signature this design spends effort avoiding).

**Level 1, the first viewport.** Two mechanisms, redundant on purpose:

1. **The `<h1>` itself names the scope.** Content-model validation: in every locale, `hero.statement` must contain the country's display name (`country.ES.name` in that locale). Not "should", must: a build that fails this check fails. The headline is the only string a social visitor reads, so the scope belongs in it, and this is the one place where the marker cannot be a separate element.
2. **A scope line directly under the `<h1>`**, above the subtext: `ESPAÑA` in `--font-mono` at `--text-meta` with `--tracking-label`, `--ink-2` (9.21:1 on `--surface-1`), followed by a `·` and the coverage clause (`sistema contributivo de la Seguridad Social`) in the same line. Uppercase is permitted here for the same reason it is permitted for the two-letter locale codes: it is a label, not a headline. 24px of vertical presence, no border, no ground, no icon.

**Level 2, every figure.** The D6 public provenance strip gains a fourth field, `Ámbito`, rendered in the same labelled grid (`Fuente · Serie · Dato de · Ámbito`), value `España`. It is generated from the country record like every other strip field. The pyramid gets the same field. The figure tables' `<caption>` sentence also names the scope, because a table can be read out of context.

**Level 3, shared and social artefacts.** The `<title>` template takes a scope suffix from the country record (`… · España`); `og:title` uses the same derived string; the share card (§D7) gains one line, the scope mark, in the card's existing type system. D7's rule stands unchanged: **no metric, no number, no date on the share card.** A country name is none of those, and it is the one string that survives every revision of every figure.

**How it degrades when a second country arrives.** The marker is not the string "España"; it is `country.<GEO>.name` resolved through the content model for the requested `(country, locale)`, and the coverage clause is `country.<GEO>.scopeClause`. Adding France is a content row plus a `geo` in `PUBLISHED_GEOS`, and every level picks it up with no code change:

| Published geos | Header and hero mark | Share card and `<title>` |
|---|---|---|
| exactly 1 (today) | plain text, not a control. Anti-pattern 18 stands: a single-option switcher is worse than none | that country's name |
| 2 or more | the mark becomes the country index, the same bare `<details>` pattern as the mobile site index, no flags, no dropdown styling | the requested country's name |

Two failure modes, both loud: a country record missing `name` or `scopeClause` in any published locale fails the build (it is a content bug, and silently falling back to `ES` would relabel a French page as Spanish); and `Ámbito` never renders an empty cell, because a strip with a blank field is a claim without a scope.

**Anti-patterns.** A flag (any flag); a map outline; the EU stars; `España` in the wordmark (the wordmark is the publication, the scope is the data); a "coming soon: more countries" line; a disabled country selector; the scope mark repeated in a footer only.

### R5 (blocks the brief): the first 900px. Findings G2, G5.

The problem is structural, not cosmetic: the hero is *defined* to be a full viewport (`min-height: calc(100dvh - var(--header-h))` at ≥768px), so at any common laptop height the next section cannot appear at the fold by construction, and there is nothing to scroll toward. Three changes, and no modal, no interstitial, no scroll cue, nothing hidden behind interaction.

1. **`--hero-min-h: 560px` at ≥1024px, replacing `min-height: calc(100dvh - var(--header-h))`.** This supersedes the D2 hero-height rule and the corresponding line in §Page shell. At 1280×800 that leaves roughly 176px of the pyramid block visible at the fold: its heading, its generated finding sentence, and the top of the readout strip. The reader is pulled by a *sentence about the data*, not by the empty apex of a chart, which is why the sentence sits above the panels (R1) rather than below them.
2. **The hero panel becomes one plate carrying two instruments, in strict hierarchy.** Supersedes the hero instrument panel description in §Page shell for the case where the countdown is `computed`:
   1. `countdown.eyebrow` mono micro;
   2. a 3px `--data-projection` rule, full panel width, top edge of the countdown block;
   3. the countdown row: `16` at `--text-num-xl` with `años` beside it, `2042` at `--text-num-m` in `--data-projection` under `año del umbral`;
   4. `countdown.definition`, one sentence, `--text-small`;
   5. `countdown.range` and `countdown.source`, `--text-micro` mono;
   6. a 1px `--rule-1`, then the figure strip: the ladder's figure label, its value at **`--text-num-l`** (demoted from `--text-num-xl`), the three dated comparisons, `Cómo se calcula`, and the snapshot stamp.

   Two numerals at `--text-num-xl` would be two headlines and therefore no hierarchy; the countdown takes the largest size because it is the only number on the page whose *scale* is unfamiliar, and because it is unconditional (it does not depend on which metric is computable). When the countdown is not `computed`, the figure value returns to `--text-num-xl` and the panel is exactly as Revision 1 shipped it. One boolean, tested both ways, no third composition.
3. **Colour placement in the first viewport, as a budget of two.** The only coloured elements above the fold are the 3px threshold rule and the `2042` numeral, both `--data-projection`. Everything else is ink on paper. This is what makes the colour read as a signal: a page with two coloured marks in its first screen has a hierarchy that a page with ten does not.

**What the hero must show, complete list.** Skip link; stale banner if stale; header; scope line; `<h1>` naming Spain; subtext ≤20 words; one primary CTA and one secondary link; the countdown; the figure strip with its three comparisons and the snapshot stamp. That is all. **What it must not show:** the pyramid itself (it is the destination, not the hook), any chart in the hero, a scroll cue, a badge, an icon, a second countdown, a "share" control, and any number without its provenance link within one click.

**The propositional hero (D2 tier 3), amended.** It keeps its 8/4 grid, its method-first ordering and its status summary, and it gains the scope line and the countdown. Because the countdown numeral is a projection-derived fact rather than a figure, D2's rule that no numeral larger than `--text-micro` appears above the fold is **superseded for the countdown only**, and the countdown renders at `--text-num-l` (32px) so the `<h1>` remains the largest type on the page. The hierarchy claim D2 was protecting, that the site never spends its largest type announcing an absence, still holds: the countdown is not an absence.

**Nav.** No fifth anchor. The countdown links to `#demografia`, and that is the only new path into the block. D8's 1024px width budget (298px at 320px, one row) is not disturbed, which is the reason for this restriction.

**Anti-patterns.** A full-viewport hero; a scroll arrow; a hero image of any kind; a `16` that counts up on load; a sticky countdown bar; a modal; a "¿Sabías que…?" interstitial.

**Watch items.** (1) The 560px minimum must not clip the panel at 1024×620 with a stale banner present: measure with the banner and at 200% zoom. (2) If the two-instrument panel starts to read as a dashboard, the fix is fewer elements inside one plate, never a second card. (3) The `<h1>` scope validation must be a build-time check, not a review habit.

### R6 (blocks launch): Reproducir advertises only what exists. Finding G4.

Measured defect: `ReproduceBlock` maps over every derived figure, so five `unavailable` figures render a title, a `formulaId`, a snapshot date, a 64-character digest and a reproduce command, none of which describes a value that exists. It advertises reproducibility for numbers the site does not publish. On a page whose entire promise is "everything here is checkable", that is the most damaging possible bug, because it is a false claim in the section whose job is to prove nothing is a false claim.

**Rendered form.**

- Rows are rendered for `availability === 'computed'` figures only (today: two), grouped, followed by one group for the derived series (the pyramid, if `computed`). Row content is unchanged from §Page shell.
- Above the groups, one generated count line in `--text-micro` mono: `2 figuras calculadas · 1 serie derivada` (both numbers from data, no authored plural).
- Below the last group, **one** line in `--text-small` `--ink-2`, from the `reproduce.omitted` key with `{unavailable}` and `{total}` slots: `5 de las 7 figuras no tienen valor calculado en este despliegue y no tienen huella ni comando de reproducción. Arriba aparecen con su método.` The count is derived. The line renders nothing when `unavailable === 0`, so the sentence can never become false.
- **No row, no cell, no chip and no placeholder for an `unavailable` figure in this section.** The five already have their canonical rendering one screen up, as D1 ledger rows with a state word, a reason and a method link. Duplicating them here would add five rows whose only content is an absence, which is exactly what D1 was written to stop.
- `data-operator="true"` stays: this is operator vocabulary by D3's definition, and the gate must keep ignoring it.

**Invariants, testable.** `rendered row count === figures.filter(computed).length + series.filter(computed).length`; no `<code>` element inside the section matches `[0-9a-f]{16,}` unless its row's figure is `computed`; the omitted line's number equals the unavailable count; nothing in the section names a figure as reproducible unless a digest for it is rendered.

**Watch item, and it is a live trap.** The block derives each row's public title with `Number(figure.figureId.slice(-1))`. That works only while every id is `fig-0N`. It breaks the moment a non-numbered derived artefact enters the section, which R1 introduces. Route the label through an id-to-key lookup, not an arithmetic slice on the id string.

### R7 (degrades quality if omitted): the alarm vocabulary that is refused.

Written down because a future maintainer, told "make it more dramatic" and shown a page with a warm-gold rule at the top, will reach for an icon, and the icon is the whole difference between this site and the ones it criticises. The refusals are enumerated in the closing block of this revision; what belongs here is the rule that generates them, so the next judgement call does not need to be escalated:

> **Anything a reader could not verify is decoration. Anything a reader can verify is drama.**
>
> A drawn bomb, a red badge, a siren, an arrow, a silhouette, a pulsing dot, a counter that moves: none of these can be checked against a source, so they add only assertion. A year, a share, a range of variants, a pyramid whose bars can be summed: all of them can be checked, so they are permitted at any scale the layout can carry.

Three consequences, for the Coder:

- The visual intensity of this page is permitted to come from **size, density and contrast**, and from nothing else.
- Any element that exists to add feeling without adding a verifiable quantity is out, regardless of how good it looks. That includes the temptation to make the countdown numeral warm-red at the last minute.
- The anti-pattern list in §"Anti-patterns banned on this product" is extended, not weakened: item 6 (no live semantics) now explicitly covers countdowns rendered as tickers; item 7's hue ban stands, and `--data-projection` is not an exception to it because it is not violet, indigo, red or neon.

### New tokens (Revision 2)

Nine, and nothing else. The declarations are authoritative here; §Colour points at them.

```css
/* Revision 2 — the alarm register. One hue, two aliases, layout only beyond that. */
--data-projection:        #6A5A12;   /* dark: #D8C05C. Projected extent. Hue 49deg */
--data-projection-ground: color-mix(in srgb, var(--data-projection) 12%, var(--surface-1));
--data-projection-edge:   color-mix(in srgb, var(--data-projection) 40%, transparent);

--chart-observed:         var(--accent);            /* measured; aliased so the pair is symmetric in code */
--chart-projection:       var(--data-projection);   /* projected; never used without --dash-projection */
--dash-projection:        6 4;                      /* stroke-dasharray on every projected line */

--rule-projection:        3px;       /* the countdown threshold rule */
--hero-min-h:             560px;     /* supersedes min-height: calc(100dvh - var(--header-h)) >=1024px */
--pyramid-band-h:         14px;      /* 5-year band pitch; 8px <1024px, 6px <768px */
```

Dark-mode declaration, to be added inside the existing `[data-theme='dark']` block:

```css
--data-projection: #D8C05C;
```

`--radius`, `--shadow`, the type scale, the space scale and every existing colour value are untouched. The pyramid's axis maximum (4.5) and the share-card dimensions stay constants in their chart module and build script, not tokens, for the reason Revision 1 gives: a token invites its use in layout.

### Scenarios that need amending

| Scenario | Status | What the specifier must do |
|---|---|---|
| **AC-001-44**, **AC-001-45** | Unchanged, and the pyramid is their first real test | The pyramid's table must carry the same 21 bands × 3 years × 2 sexes as the chart. No text change needed; add the pyramid as an explicit example so the coupling is exercised on a chart that is not a metric |
| **AC-001-25** | Unchanged | The countdown is not implicit debt and does not relax the single-headline ban there. Nothing to do |
| **AC-001-35** | Unchanged | R4 adds a validation rule (scope strings from the country record). AC-001-35 already forbids the literal, so this is enforcement, not amendment |
| **AC-001-78** | Unchanged, but blocks R1/R2 until the data exists | The pyramid and the countdown need new `formulaId` and `definitionId` entries in the documented closed sets, or their manifests fail validation. Data change plus the documented set, no scenario change |
| **AC-001-80** | Unchanged | The scope mark must not become a country control while only `ES` is published (R4's degradation table) |
| **AC-001-92** | Unchanged | Applies to the two new definition strings, which are instrument vocabulary |
| **AC-001-01**, **AC-001-02**, **AC-001-03** | Unchanged | The pyramid and countdown carry the same `Manifest` shape; their digests are computed over their own input snapshots |
| **AC-001-05**, **AC-001-06** | Unchanged | A failed `proj_23np` or `demo_pjan` fetch fails the build; neither new artefact may publish `unavailable` to dodge a fetch failure |

### What this revision contradicts

Declared rather than buried, because each one is a directive someone could otherwise cite against this work.

1. **The scroll contract's viewport-1 row.** It says the hero must produce "no argument, no adjective, no urgency" and specifically forbids urgency. R2 puts a countdown in the hero, which is urgency. The row is superseded for the hero only, and the justification is narrow: the urgency is a computed integer with its source, its variant range and its definition printed beside it, and it carries no evaluative adjective. Every other row of that table stands, including "no urgency" for the metric plates.
2. **D2 tier 3's no-numeral rule.** `--text-num-l` is larger than `--text-micro`. Superseded for the countdown only, at a size below the `<h1>`, with the reasoning in R5.
3. **D2's hero `min-height`.** `calc(100dvh - var(--header-h))` is replaced by `--hero-min-h: 560px` at ≥1024px. The full-viewport hero is the structural cause of the "nothing to scroll toward" reading.
4. **§Page shell's hero instrument panel.** Its contents are reordered and its figure numeral demoted when the countdown renders. The panel's construction, ground, border and stamp are unchanged.
5. **§Page inventory gains one block** (the pyramid, inserted as block 4), so the count goes from sixteen to seventeen. Section count 13 to 14, eyebrow count still 3, budget `ceil(14/3) = 5`. The inventory's numbering shifts by one from block 4 onward; no block id changes.

Nothing else is contradicted. In particular the three-register table, the token values, the chart forms, the four-rate implicit-debt rule, the `<details>`-over-modal discipline, the thesis confinement rule and the admin surface are all untouched.

### New tasks and scenarios the Specifier must formalise

Five additions, plus two rendering invariants. Scenario numbers start at `AC-001-93` (the highest in use is 92).

**T17 (new, implements R1) — population age structure.** Ingest `demo_pjan` and `proj_23np`, band to 21 five-year groups, compute per-sex shares of each year's total, select 1995/2025/2050, write `data/derived/series/pyramid.json` with its own manifest, and expose the axis maximum. Scenarios:
- `AC-001-93` — band aggregation: single-year codes resolve to 5-year bands, the open-ended band resolves from **either** `Y_OPEN` or `Y_GE100` by label, and the 100+ band is present for every year (this is the scenario that catches the dropped band).
- `AC-001-94` — `M + F == T` per band and per year; band shares sum to 100 ± 0.1; `UNK` excluded and recorded in the definition string.
- `AC-001-95` — the derived file carries a complete manifest with a `formulaId` and `definitionId` from the documented sets, its own `inputHash`, and a `reproducePath` that resolves; an unknown id fails validation.
- `AC-001-96` — the file is written to `data/derived/series/`, and `readDerivedFigures()` does not pick it up as a metric figure.
- `AC-001-97` — the chart and the table are emitted together or not at all (the AC-001-44 coupling, exercised on the pyramid).

**T18 (new, implements R2) — projected threshold crossing.** Compute the old-age dependency ratio per year from `proj_23np` `BSL`, find the first year at or above the documented threshold, compute the countdown against the snapshot year, and compute the crossing year for all six variants. Scenarios:
- `AC-001-98` — the ratio is computed from the pinned variant and pinned age definition, and the threshold is a documented parameter, not a literal: changing it changes the year.
- `AC-001-99` — `years = thresholdYear − snapshotYear`, both integers, both printed with the number; a check that no sub-annual unit appears.
- `AC-001-100` — the variant range is computed over all six variants and printed; a variant that never crosses is excluded from the range and does not make the block fail.
- `AC-001-101` — when the pinned variant never crosses the threshold inside the horizon, the block renders no numeral and the fixed sentence; it never substitutes a different threshold, and the hero falls back to the D2 ladder.

**T19 (new, implements R4) — country scope mark.** `country.<GEO>.name` and `.scopeClause` in five locales, the `<ScopeMark>` component at the three levels, the `hero.statement` validation, the `<title>`/`og:title` derivation, and the share-card line. Scenarios:
- `AC-001-102` — the scope mark renders from the country record in all five locales; no hardcoded country string exists in any component.
- `AC-001-103` — a build whose `hero.statement` does not contain the country name in some locale fails.
- `AC-001-104` — with exactly one published geo the mark is text and not a control; with two or more it is the country index; it is never a disabled or single-option control.

**T2 (amended, implements R6) — Reproducir truthfulness.** One scenario: `AC-001-105` — the reproduce section renders a row only for a `computed` figure or series, its omitted-count line equals the unavailable count, no digest or command is rendered for an unavailable figure, and the section's rows are labelled without deriving a key from the id string.

**T8 (amended, implements R4) — scope content.** No new scenario beyond `AC-001-102`/`AC-001-103`; the country record's two new fields are additive content, and the existing locale-completeness scenario covers their presence once the fields are listed in it.

**R3 and R5 (no new task).** The colour tokens land in the rendered tasks that use them (T3–T7, T11, T17), and R5's composition lands in the existing hero work, which already has a task. Two invariants belong as scenarios anyway:
- `AC-001-106` — every projected value is encoded by dash and by a printed word as well as by hue, so no projected data is distinguished by colour alone (R3).
- `AC-001-107` — at 1280×800 and 390×844 the hero does not occupy the full viewport, and the demography block's heading and its finding sentence are visible without scrolling (R5).

**Suggested order.** T19 and the T2 amendment first (small, immediately visible, and the Reproducir fix is the launch blocker); then T17 (ingest plus plate, the largest piece); then T18, which depends on T17's dataset reader and nothing else; then R3's tokens and R5's hero, which can land against whichever figure state exists at that point.

### What this revision refuses to specify, with the reason

1. **A clock bomb, fuse, hourglass, siren, alarm bell, or any illustration of time running out.** Reason: it is unfalsifiable, so it adds assertion and no evidence, and it is the exact crank tell the informal spec names. R7's rule generates the refusal.
2. **A ticking, animating or sub-annual countdown.** Reason: it would imply the number changes as the clock moves, when it changes only when the projection is revised; it violates anti-pattern 6 (a snapshot is a snapshot) and 5 (no animated counters), and precision below a year would be false precision, since the crossing year moves by up to three years across the six official variants.
3. **Red, alarm red, or any "critical" hue for the countdown.** Reason: the page may not assert that a threshold crossing is bad; that judgement belongs to the thesis register and is labelled there. Terracotta stays reserved for quantities the data itself marks as adverse.
4. **A literally inverted axis, or an upside-down pyramid drawn for effect.** Reason: it costs the reader a translation, buys no information, and hands a critic the sentence "they drew it upside down to make a point". The inversion must be the data's.
5. **A flag, a map, or the EU stars in the scope mark.** Reason: a flag is the stock cliché banned in anti-pattern 2, it equates a state with the system being measured, and one flag cannot represent five locales.
6. **The countdown number on the share card, in the meta description, or in any OG image.** Reason: third parties cache share images for weeks, so a number there becomes a false claim the first week after a revision (D7's standing rule).
7. **An international ranking ("Spain is second worst in the EU").** It is computable from the same dataset and it would pull readers hard. Reason: it changes the site's subject from "here is the arithmetic for Spain" to "Spain versus others", requires a sourcing and definition contract for every peer, and collides with v1's single-country scope (AC-001-80). Proposed instead as a follow-up spec with its own data contract and its own dispute section.
8. **A regional (CCAA) pyramid.** Reason: INE regional data is a document/manual source in this project's source classes, it triples the ingest surface, and a regional age map invites a political reading the instrument register cannot carry. Follow-up spec at most.
9. **A second threshold, or a selector over thresholds.** Reason: one threshold with its range is evidence; a slider over thresholds is a toy that lets the reader manufacture the answer they prefer, which is the opposite of what this page is for.
10. **A warm section ground for the demography block.** Reason: grounds encode register. A fourth tint would dilute a system that currently works precisely because there are exactly three, and the block is an instrument, which already has a ground.
11. **An alternative projection variant rendered side by side as a fourth panel.** Reason: it is the most tempting addition and it would be decoration dressed as rigour. The uncertainty is stated as a range beside the number; six panels of "what if" would bury the one shape that makes the argument.


## 40-deploy.md

# 40 — Deploy verification

Spec 001 `pension-math` · stage 5c · branch `spec/001-pension-math`

## Verdict

**Verdict: PASS**

## Fields

| Field | Value |
|---|---|
| Deploy URL | https://pensions-system-rnw6ofr53-danielbueno76-4270s-projects.vercel.app |
| Build status | `pass` — Vercel built head `7f72167` to `readyState: READY` |
| Health check status | `pass` — 2xx on `/` and `/en`; served HTML carries the expected computed value in both locales; `/admin` fail-closed |
| E2E verdict | `skip` — no E2E suite exists in this repository; equivalent verification performed as live HTTP + rendered-value assertions (below) |
| Timestamp | 2026-10-26T11:47:38Z |
| Phase-3 attempt count | 1 |
| Deploy command run | **none** — Git integration built it; `vercel deploy` was never invoked |

## Deployment identity

| Item | Value |
|---|---|
| Vercel project | `pensions-system` (`prj_ZS8blMFO18fwOrMaJfRJAEJgqZbz`) |
| Team | `danielbueno76-4270s-projects` |
| Git integration | `github` — `RexiAI/pensions-system`, production branch `main` |
| Deployment | `pensions-system-rnw6ofr53-danielbueno76-4270s-projects.vercel.app` |
| Branch / commit | `spec/001-pension-math` / `7f72167` |
| Project settings | framework `nextjs`, node `24.x`, build / install / output / root all defaults |
| Environment variables | **none set** — including `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` |

## Live checks

The deployment is protected by Vercel Authentication, which is normal for a newly
created project and correct — it is not a public surface. Checks were therefore
performed through the CLI's authenticated fetch (`vercel curl`), not by exposing the
deployment.

| Check | Observed |
|---|---|
| `GET /` | 121 908 bytes; contains `13,23 %` |
| `GET /en` | 121 034 bytes; contains `13.23%` |
| Wrong-scale regression on `/` | **0** occurrences of `1323` |
| `GET /admin` | 195 bytes — `CONFIG. Administración no configurada. La superficie está cerrada porque la configuración administrativa del despliegue está incompleta. Nadie puede entrar hasta completarla en el despliegue.` — **0** `<input>` elements |

The `/admin` result is the correct outcome with no admin configuration present: the
surface fails closed and reveals no form, no navigation and no configuration detail.

## Deployment history — read before judging the project

Two pre-existing conditions explain an artifact that would otherwise look like a
failure of this spec:

1. The project's only other deployment is an `ERROR` from `main` @ `d7f976e` — the
   bootstrap commit, which contained no `package.json` — with
   `errorCode: NEXT_NO_VERSION`, `source: import`. That is an import-time artifact of
   an empty scaffold, not a build of this work.
2. The project had `gitProviderOptions.createDeployments: "disabled"`, so no commit
   after the import was built at all. The owner enabled deployments during this stage;
   `7f72167` is the first genuinely built deployment of this repository.

## Not covered by this verification

- **The preview is not publicly reachable** — Vercel Authentication gates it. Phase-3
  verification was performed with authenticated fetch; a member of the public cannot
  currently see this deployment.
- **Production still points at `main`**, which holds only the scaffold commit, so the
  production alias will continue to error until this PR merges. Expected, not a defect
  of this spec.
- **No end-to-end journey suite exists**, so the E2E verdict is a skip. What was
  verified instead is listed above and is deliberately narrow: status codes, the
  published value in both locales, absence of the known wrong-scale string, and the
  admin fail-closed response.

## What would upgrade this to a full public verification

- A Vercel protection bypass scoped to CI, or a custom domain on the project, so the
  preview can be checked unauthenticated.
- `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET` set on the **Preview** environment
  only, if the admin login flow is to be exercised end-to-end. They are deliberately
  unset now, which is why `503` is the correct observed behaviour rather than a gap.
- An E2E journey suite, which this repository does not yet have.
