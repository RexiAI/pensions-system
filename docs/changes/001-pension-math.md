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

Task numbering `T1`…`T16`. Each task is a coherent unit (one value object, one operation,
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

## Quality gates

# 30 — Report: pension-math

Stage 5a (Mutation Runner), **refresh run**. Conformance tier `production`, so the mutation gate
applies. Read `25-verification.md`, `10-tasks.md`, `20-acceptance/`, `15-design.md`. Did **not** read
`00-informal.md`.

**Verdict: GREEN**

- Mutation score on the stated scope: **93.83 %** (94.40 % over covered mutants), threshold ≥ 80 %.
- **F1-unblocked block** re-measured separately: 18 mutants → **15 killed, 3 equivalent, 0 untested
  reachable**. Raw block score 83.33 % (100 % of the killable mutants in the block).
- Rounds this refresh: **2** (baseline + one test batch). Budget for a refresh was two rounds.
- Final full suite: **415 tests, 33 files, 0 failures** (was 414; this stage added 1 test).
- App builds: `next build` exit 0. `tsc --noEmit` exit 0. ESLint exit 0.
- No existing test was weakened, renamed or deleted. Only additions (one file, one `describe`).

---

## Revision history

| When | Verdict | Score | Tests | What the tree looked like |
|---|---|---|---|---|
| 2026-10-25T23:25:50Z (first run of this stage) | GREEN | 92.74 % total / 93.51 % covered, 1846 mutants | 388 | **Before F1 was fixed.** `centralCellOf` compared a *deflated* `rPaidReal` against the *nominal* band centre, so `fig-05` threw `sensitivity grid is missing the central cell` whenever its compute body ran. 18 mutants in the post-throw half of `baseGrowthValue` and in `centralCellOf` were therefore un-killable, and the report had to list them as "blocked by a production defect". |
| 2026-10-26T08:16:47Z (this refresh) | GREEN | **93.83 % total / 94.40 % covered**, 1846 mutants | 415 | **After F1 was fixed** (`SensitivityCell.rPaidNominal`, central-cell lookup on the swept nominal), after the hero ladder swap (`['fig-02','fig-01']` + per-figure spec table), and after the percent-scale fix (`percentPoints` kind). |

**The 92.74 % figure described pre-F1 code and must not be read as a claim about the current tree.**
It is kept here only so the before/after is auditable. Two further corrections to the earlier report,
for the record:

1. **Its detail tables overlapped.** The summary line was right ("64 equivalent, 18 unreachable/dead,
   18 F1-blocked, 33 reachable gaps" = 133), but the per-file tables underneath double-counted:
   `npv.ts` line 41 appears in the equivalent table (as "12 + 3 dead") *and* in the dead-code table
   (5 mutants), and `figures.ts` 33/88's "7 no-coverage" overlapped the F1-block list. This report
   gives each mutant exactly one classification, and the totals add to the recorded count exactly
   (64 + 18 + 31 = 113).
2. **One mutant coordinate was mis-grouped** in the earlier eurostat row (`49 (×3)` where the third
   mutant is on line 235). Corrected below.

---

## Precondition

`specs/001-pension-math/25-verification.md` exists and its most recent overall verdict
(attempt 3, phase 1) is **PASS**: scenario traceability 92/92, full suite 414/33, complexity gate
exit 0, design-principles gate PASS for the deliverable, scenario-to-behavior spot check PASS against
the built app. Mutation work ran on that basis; nothing below re-litigates it.

The working tree is dirty and every dirty entry is this pipeline's own uncommitted output
(`specs/`, `tests/`, `web/`, `app/`, `scripts/`, `data/`, `stryker.config.mjs`, `package.json`). Stage
5b commits them. Nothing was stashed, reverted or auto-committed; production code was **not** edited
by this stage. (During mutant-verification probing, `web/ingest/figures.ts` was temporarily mutated in
place and restored byte-identically — md5 `362a8f59156e3081c7b1f1f3ef9fe866` before and after — so
the tree that was measured is the tree that ships.)

---

## What changed since the previous report, and what is in scope

| # | Change | Files | Inside this stage's mutation scope? |
|---|---|---|---|
| 1 | Defect **F1** fixed: `SensitivityCell` carries `rPaidNominal`; the central cell is found by the swept nominal band centre instead of by comparing a deflated rate to a nominal one | `web/ingest/figures.ts`, `web/metrics/required-base-growth.ts` | **Yes** — re-measured below |
| 2 | Hero ladder swapped to `['fig-02','fig-01']`; a per-figure spec table resolves number, unit and label from the figure id | `web/components/public/hero-subject.ts`, `web/components/public/Hero.tsx` | **No** — `web/components/**` is outside the mutation scope (see below) |
| 3 | Percent-scale defect fixed: a `percentPoints` `ValueKind` added at the single formatting entry point | `web/content/format.ts`, `web/components/metrics/views.ts`, `web/components/metrics/view-support.ts` | **No** — `web/content/**` and `web/components/**` are outside the mutation scope |

**Explicitly stated rather than silently excluded:** changes 2 and 3 are real code changes that this
stage did **not** mutate, because the mutation scope is the calculation and validation surface
(`web/metrics|manifest|sources|ingest/**`), not the rendering surface. `web/content/format.ts` is a
presentation formatter and `web/components/**` is React/Next markup — mutating them proves nothing
about whether a published number is right. They are covered instead by the full suite (415 tests,
including the 19 percent-scale and 6 hero-ladder tests the Coder added) and by the Verifier's render
check against the built app (attempt 3). That is the same scope decision as the first run, unchanged,
not a new exclusion.

`mtime` audit of the whole in-scope surface confirms only the two F1 files changed after the previous
mutation run: every other in-scope file is older (`web/metrics/cohort-irr.ts` 22:34Z, `web/sources/*`
≤ 23:15Z, `web/ingest/run-compute.ts` 22:22Z, …) than the previous run's start. So the only in-scope
delta this refresh could possibly measure is F1, and that is what it measures.

---

## Mutation scope

A score without a scope is meaningless. Scope is the calculation and validation surface whose
correctness carries the product's claims — not the application shell.

**Mutated (28 files, 1846 mutants)** — unchanged from the first run; Stryker re-instruments the
current tree with the same globs and finds the same 28 files and the same mutant count.

| Area | Files | Why it is in scope |
|---|---|---|
| `web/metrics/**` | 8 | calculation kernels: ratio, share of GDP, cohort IRR, implicit debt, required base growth, growth rate, NPV/root finding, rounding |
| `web/manifest/**` | 6 | manifest validation, hashing, definition registry, formula registry, reproduce-path resolution |
| `web/sources/**` | 8 | ingest parsing (Eurostat JSON-stat, INE tempus3), unit conversion, year alignment, catalogue, labels, freshness |
| `web/ingest/**` | 6 | calculation and validation layer the committed scripts delegate to: figure table, compute harness, figure validation, deterministic JSON, derived-file IO |

**Excluded**

- `web/components/**`, `app/**` — React/Next surfaces (includes changes 2 and 3 above).
- `web/content/**` (includes `format.ts`, change 3) — presentation formatting.
- `data/**`, generated files, migrations, `web/content/data/**` — data, not code.
- `.standards/**` — submodule; out of scope and off-limits to pipeline agents.
- `scripts/*.ts` (7 files) — CLI entry points that perform their side effect at import time
  (`process.exit(main())`) and are only exercised as subprocesses; Stryker instruments modules inside
  the test runner's process, so a mutant there is a permanent 0 % that measures nothing. The
  calculation and validation logic those scripts delegate to lives in the four in-scope areas.

---

## Mutation configuration

`stryker.config.mjs` is unchanged by this refresh:

```
testRunner:      vitest
mutate:          web/metrics/**/*.ts, web/manifest/**/*.ts, web/sources/**/*.ts, web/ingest/**/*.ts
vitest.configFile: vitest.config.ts
coverageAnalysis: perTest
timeoutMS:       30000        timeoutFactor: 2      concurrency: 4
reporters:       clear-text, progress, json
jsonReporter:    reports/mutation/mutation.json
thresholds:      high 80, low 80, break null   (reported, not enforced — the verdict is written here)
disableTypeChecks: false      (vitest transpiles via oxc and never type-checks)
ignorePatterns:  .opencode, .standards, specs, .github, .githooks, .playwright-mcp,
                 data/pending, data/proposals, tsconfig.tsbuildinfo, runs.jsonl
```

**No mutator was disabled. No threshold was changed. No `// Stryker disable` comment was added.**
(`data/derived` and `data/snapshots` remain deliberately un-ignored — the ingest and gate tests read
them.)

Sandbox detail recorded for auditability: Stryker's dry run reports "Ran 401 tests" against the
project's 415. The 14 it does not execute live in three files — `tests/acceptance/admin-auth.test.ts`
(8), `tests/acceptance/fail-closed.test.ts` (4), `tests/acceptance/static-dynamic.test.ts` (2) — which
import no module in the mutated scope (they exercise the admin middleware and route plan), so they
map to zero in-scope mutants and cannot change the score. Their absence from the sandbox is a
coverage-mapping artefact, not a skipped test: all 415 run in the project suite below.

---

## Rounds run this refresh

Two rounds — the bound set for this refresh (threshold already met; this is a refresh, not a rescue).

| Round | Score (total) | Score (covered) | killed | timeout | survived | no coverage | runtime errors | ended (UTC) |
|---|---|---|---|---|---|---|---|---|
| 1 — baseline on the current tree (no test changes) | 93.67 % | 94.23 % | 1714 | 2 | 105 | 11 | 14 | 2026-10-26T08:03:35Z |
| 2 — after 1 added test | **93.83 %** | **94.40 %** | **1717** | **2** | **102** | **11** | **14** | 2026-10-26T08:16:47Z |

Score convention (Stryker's own): `(killed + timeout) / (total − runtimeErrors)`; `covered` further
excludes no-coverage mutants. The 14 runtime errors sit in each figure's `define({ … })` table entry
(7 figures × 2: the argument object literal, e.g. `figures.ts:128:17`, and its `figureId` literal,
e.g. `130:19`). `define()` resolves the published definition at module load, and several suites build
their compute report at collection time, so an emptied table entry surfaces as an unhandled run error
instead of a clean assertion failure — Stryker records those as runtime errors and excludes them from
the denominator. They are not untested behaviour: mutating `figureId: 'fig-01'` to `''` by hand makes
the project suite fail 5 of 14 tests in the two files that most directly exercise the figure table
(`vitest run tests/acceptance/dependency-ratio.test.ts tests/unit/figure-metadata-branches.test.ts`,
`figureId` restored byte-identically afterwards). It is a `perTest` adjudication limit, not a gap.

Round 2 killed exactly the three mutants it was written for, and nothing else changed:

| File:line | Mutator | Replacement | Round 1 | Round 2 |
|---|---|---|---|---|
| `web/ingest/figures.ts:221:39` | ConditionalExpression | `true` | Survived | **Killed** |
| `web/ingest/figures.ts:221:39` | EqualityOperator | `entry.year !== PROJECTION_HORIZON.from` | Survived | **Killed** |
| `web/ingest/figures.ts:224:66` | ArithmeticOperator | `last.year + first.year` | Survived | **Killed** |

Round-2 per-file result (verbatim from the run):

```
All files                 |  93.83 |   94.40 |     1717 |         2 |        102 |       11 |       14 |
 ingest                   |  94.72 |   95.83 |      574 |         0 |         25 |        7 |       14 |
  deterministic-json.ts   | 100.00 |  100.00 |       14 |         0 |          0 |        0 |        0 |
  figures.ts              |  94.47 |   95.92 |      188 |         0 |          8 |        3 |       14 |
  run-compute.ts          |  93.00 |   94.90 |      186 |         0 |         10 |        4 |        0 |
  types.ts                | 100.00 |  100.00 |       11 |         0 |          0 |        0 |        0 |
  validate-figure.ts      |  96.97 |   96.97 |      160 |         0 |          5 |        0 |        0 |
  write-derived.ts        |  88.24 |   88.24 |       15 |         0 |          2 |        0 |        0 |
 manifest                 |  95.61 |   95.82 |      436 |         0 |         19 |        1 |        0 |
  definitions.ts          |  92.23 |   93.14 |       95 |         0 |          7 |        1 |        0 |
  formula-ids.ts          |  92.86 |   92.86 |       13 |         0 |          1 |        0 |        0 |
  hash.ts                 |  93.94 |   93.94 |       31 |         0 |          2 |        0 |        0 |
  repo-file.ts            | 100.00 |  100.00 |       16 |         0 |          0 |        0 |        0 |
  validate.ts             |  96.90 |   96.90 |      281 |         0 |          9 |        0 |        0 |
 metrics                  |  93.62 |   94.26 |      278 |         1 |         17 |        2 |        0 |
  cohort-irr.ts           |  96.00 |   96.00 |       48 |         0 |          2 |        0 |        0 |
  contribution-cover.ts   | 100.00 |  100.00 |       38 |         0 |          0 |        0 |        0 |
  dependency-ratio.ts     | 100.00 |  100.00 |       40 |         0 |          0 |        0 |        0 |
  implicit-debt.ts        | 100.00 |  100.00 |       10 |         0 |          0 |        0 |        0 |
  npv.ts                  |  81.11 |   82.95 |       72 |         1 |         15 |        2 |        0 |
  pension-share.ts        | 100.00 |  100.00 |       36 |         0 |          0 |        0 |        0 |
  required-base-growth.ts | 100.00 |  100.00 |       29 |         0 |          0 |        0 |        0 |
  rounding.ts             | 100.00 |  100.00 |        5 |         0 |          0 |        0 |        0 |
 sources                  |  91.10 |   91.30 |      429 |         1 |         41 |        1 |        0 |
  countries.ts            |  93.22 |   93.22 |       55 |         0 |          4 |        0 |        0 |
  eurostat.ts             |  91.40 |   91.40 |      169 |         1 |         16 |        0 |        0 |
  freshness.ts            | 100.00 |  100.00 |       29 |         0 |          0 |        0 |        0 |
  ine.ts                  |  95.71 |   95.71 |       67 |         0 |          3 |        0 |        0 |
  labels.ts               |  78.72 |   78.72 |       37 |         0 |         10 |        0 |        0 |
  live.ts                 |  90.24 |   90.24 |       37 |         0 |          4 |        0 |        0 |
  load.ts                 |  82.14 |   85.19 |       23 |         0 |          4 |        1 |        0 |
  types.ts                | 100.00 |  100.00 |       12 |         0 |          0 |        0 |        0 |
```

---

## The F1-unblocked block, measured separately

The first report recorded **18 mutants** as un-killable because of F1:
`web/ingest/figures.ts` 224, 227, 228 (×3), 229 (×3), 240, 241, 246, 249, 250, 256, 277, 279 at the
pre-fix line numbers — the post-throw half of `baseGrowthValue` and the whole of `centralCellOf`.
Those mutants now have their own identifiers (`135, 136, 137, 139, 141, 142, 145, 146, 147, 149, 161,
162, 163, 164, 165, 166, 177, 178` in `web/ingest/figures.ts`), which is what the evidence block below
queries.

| Status | Pre-fix run (92.74 %) | This refresh (93.83 %) |
|---|---|---|
| Killed | 0 (all 18 un-killable) | **15** |
| Survived | 13 | 2 |
| No coverage | 5 | 1 |
| **Block score** | 0.00 % | **83.33 %** (15 / 18) — **100 % of the killable mutants** |

The three that are still not killed are all **equivalent**, not gaps:

| File:line | Mutator → replacement | Class | Why no test can distinguish it |
|---|---|---|---|
| `web/ingest/figures.ts:244:7` | ConditionalExpression → `false` (`if (!cell)` never throws) | equivalent | The guard is unreachable for the shipped constants: the grid is swept over `[band.min, band.central, band.max]`, so a cell with `rPaidNominal === centralNominal` always exists, and `DEFAULT_G_WAGE_SWEEP` contains `ASSUMED_REAL_WAGE_GROWTH` (the acceptance suite pins that at `required-base-growth.test.ts:224`). Removing the throw changes no observable behaviour while those invariants hold — and if they ever stopped holding, the suite fails on the invariant assertion, not on a mutant. |
| `web/ingest/figures.ts:244:30` | StringLiteral → `""` (the throw's message) | equivalent (no coverage) | Same branch: the `throw` cannot execute for the shipped constants, so no test ever evaluates the mutated message. |
| `web/ingest/figures.ts:261:14` | ObjectLiteral → `{}` (`horizon: { ...PROJECTION_HORIZON }` passed to `sensitivityGrid`) | equivalent | `sensitivityGrid` discards `value.horizon`: a cell carries only `gWage`, `rPaidNominal`, `rPaidReal`, `gRequired`, `gap`. The published central's `horizon` is set independently (`figures.ts:271`) and is asserted by two tests. So the swept horizon is unobservable. |

**F1 also made a nearby pair observable**, which the first report had filed as an ordinary reachable
gap (`figures.ts:221:39`, `ConditionalExpression → true` and `EqualityOperator → !==`). While the
compute body always threw, the projected growth rate was never asserted as a value — the only test
that reached it asserted "fails inside itself". Round 2's new test kills both.

**A third effect, not in the recorded block:** three mutants on the `cohort.central === null ||
cohort.band === null` guard (`figures.ts:252:7` `ConditionalExpression → true`, `252:7`
`EqualityOperator` on `cohort.central`, `252:34` `EqualityOperator` on `cohort.band`) were
*undetectably* survivable pre-fix because "always throw" was the observable behaviour either way. With
fig-05 computing, forcing that guard to always throw now fails the suite, so three of the six variants
died without any new test. The three that remain (`252:7` `LogicalOperator`, `252:7` and `252:34`
`ConditionalExpression → false`) are equivalent — see the table below.

| Change in status, pre-fix run → this refresh | Mutants |
|---|---|
| Killed by F1 being fixed (no new test) | 17 (`figures.ts` 136, 137, 139, 141, 142, 145, 146, 151, 155, 157, 161, 162, 164, 165, 166, 177, 178) |
| Killed by the round-2 test | 3 (`figures.ts` 121, 123, 135) |
| Newly visible and still equivalent | 3 (`figures.ts` 147, 149, 163 — the `244`/`261` rows above) |
| Non-killed then, still non-killed now, untouched by F1 | 110 |
| **Pre-fix non-killed → non-killed now** | **133 → 113** (133 − 17 − 3 = 113; of those 113, 3 are newly visible equivalents and 110 are unchanged) |

---

## Evidence: mutation score

command: npx stryker run
exit: 0
at: 2026-10-26T08:16:47Z

```
All files                 |  93.83 |   94.40 |     1717 |         2 |        102 |       11 |       14 |
JsonReporter  Your report can be found at: file:///home/dbueno/projects/pensions-system/reports/mutation/mutation.json
MutationTestExecutor  Done in 10 minutes and 7 seconds.
EXIT=0
```

Scope: 28 files under `web/metrics/**`, `web/manifest/**`, `web/sources/**`, `web/ingest/**`;
1846 mutants. Threshold for this tier: ≥ 80 %. Achieved **93.83 % total / 94.40 % covered**.
`EXIT=0`; `thresholds.break` is `null`, so a non-zero exit would have meant a tool failure, not a
threshold miss — the verdict is asserted in this report, not delegated to the CLI. This block is the
round-2 run (the one that reflects the tree described here); round 1's numbers are in the round table
above.

---

## Evidence: F1-unblocked block

command: python3 -c "import json,collections;d=json.load(open('reports/mutation/mutation.json'));ms={m['id']:m for m in d['files']['web/ingest/figures.ts']['mutants']};ids=['135','136','137','139','141','142','145','146','147','149','161','162','163','164','165','166','177','178'];print('F1 block:',dict(collections.Counter(ms[i]['status'] for i in ids)));print('non-killed:',[(ms[i]['location']['start']['line'],ms[i]['mutatorName']) for i in ids if ms[i]['status']!='Killed'])"
exit: 0
at: 2026-10-26T08:18:30Z

```
F1 block: {'Killed': 15, 'Survived': 2, 'NoCoverage': 1}
non-killed: [(244, 'ConditionalExpression'), (244, 'StringLiteral'), (261, 'ObjectLiteral')]
```

15 / 18 = **83.33 %** on the block, with all three survivors classified equivalent above; against the
killable set that is 15 / 15 = 100 %.

---

## Evidence: final full test suite

command: npx vitest run
exit: 0
at: 2026-10-26T08:21:33Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  33 passed (33)
      Tests  415 passed (415)
   Duration  3.02s
```

**415 tests across 33 files, exit 0**, none skipped or disabled — the Verifier's 414 plus the one
test this refresh added. This is the final run, executed after all mutation work, after the app build
and after the design-principles gate, so the number quoted is the tree that ships.

---

## Evidence: app still builds

command: npm run build
exit: 0
at: 2026-10-26T08:21:12Z

```
> pensions-system@0.0.0 prebuild
> tsx scripts/verify-derived.ts && tsx scripts/check-public-vocabulary.ts

derived figures verified: 7 (2 computed, 5 unavailable)
public vocabulary gate: clean (5 locales)

✓ Compiled successfully in 593ms
✓ Generating static pages using 11 workers (21/21) in 1411ms
```

`npx tsc --noEmit` exit 0 at 2026-10-26T08:17:09Z (no output). `npm run verify:derived` exit 0 at
2026-10-26T08:17:23Z (`derived figures verified: 7 (2 computed, 5 unavailable)`).

---

## Evidence: complexity gate (carried from the Refactorer, re-run here)

command: npx eslint .
exit: 0
at: 2026-10-26T08:17:07Z

```
(no output — clean)
```

`eslint.config.mjs` enforces `complexity: ['error', 6]`. Clean across the whole tree, including the
F1 fix (`web/ingest/figures.ts`, `web/metrics/required-base-growth.ts`) and the new test. The added
test introduced no nesting beyond the describe/it structure.

---

## Evidence: scenario traceability (re-run, unaffected)

command: .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-10-26T08:17:24Z

```
{ "checks": [1, 2], "passes": [ "AC-001-01 — traced to a test", …, "AC-001-92 — traced to a test" ], "fails": [] }
```

92/92 scenarios still traced, `fails: []`, check 2 clean. The new test cites `AC-001-31` (already
traced, and the scenario the F1 fix serves).

---

## Evidence: audit-trail gate

command: .standards/scripts/check-audit-trail.sh 001-pension-math
exit: 0
at: 2026-10-26T08:21:59Z

```
PASS 001-pension-math: 10-tasks.md present and non-empty
PASS 001-pension-math: 20-acceptance/ has an AC-*.md with a '## AC-NNN-NN' heading (AC-015-10)
PASS 001-pension-math: 25-verification.md present and non-empty
PASS 001-pension-math: 30-report.md present and non-empty
PASS 001-pension-math: 15-design.md present and non-empty (AC-015-13)
PASS 001-pension-math: 40-deploy.md absent — tolerated pre-5c (stage 5d re-runs with --require-deploy, AC-031-21)
PASS 001-pension-math: evidence block 'scenario traceability' — command: .standards/scripts/check-scenario-traceability.sh --json, exit: 0, at: 2026-10-25T22:38:30Z
PASS 001-pension-math: evidence block 'full test suite' — command: npx vitest run, exit: 0, at: 2026-10-25T22:39:00Z
PASS 001-pension-math: evidence block 'complexity gate' — command: npx eslint ., exit: 0, at: 2026-10-25T22:40:00Z
PASS 001-pension-math: evidence block 'design-principles gate' — command: .standards/scripts/check-code-principles.sh --tier production --json, exit: 1, at: 2026-10-25T22:42:00Z
PASS 001-pension-math: evidence block 'scenario-to-behavior spot check' — command: (manual read of 10 scenarios across 6 tasks; test files opened and assertions compared to the scenario Then-clauses), exit: 0, at: 2026-10-25T22:44:00Z
✔ Audit-trail check: specs/001-pension-math complete, verifier evidence recorded.
```

**Finding F2 from the previous report is closed.** The earlier `exit: 1` was a heading-spelling
mismatch (`scenario-to-behaviour` vs the gate's hardcoded `scenario-to-behavior`) in
`25-verification.md`; the Verifier corrected that heading at attempt 2 and the gate is green. Stage
5b's pre-push run of this gate will not block.

---

## Complexity summary (carried from the Refactorer)

- **Cyclomatic complexity ≤ 6:** `eslint.config.mjs` enforces `complexity: ['error', 6]`; ESLint
  exits 0 on the whole tree (re-confirmed above). The F1 fix — one added struct field plus a `.find`
  predicate change — added no branching.
- **Duplication:** `check-code-principles.sh --tier production` reports **0 DRY FAILs**. The DRY
  WARNs are 4-line markup blocks in `web/components/**` (outside this stage's scope) plus the
  `.standards` templates.
- **Design-principles gate:** exit 1 with **exactly one FAIL**,
  `.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`) — inside the
  `.standards/` submodule, out of scope and off-limits to pipeline agents. **Zero FAILs in project
  source.** Unchanged from the Verifier's attempt 3: 40 WARNs (29 project-source KISS/DRY review
  hints + 11 `.standards` template WARNs), line numbers shifted only by the F1 fix's added comment.
  Re-run with `.next` moved aside (`/tmp/opencode/next2`), because the gate SIGPIPEs on Next's
  chunks — a pre-existing gate defect the Verifier confirmed at attempt 1; `.next` was restored
  immediately afterwards (`PRINCIPLES_EXIT=1`, 1 FAIL / 40 WARNs, completed
  2026-10-26T08:21:26Z).
- **Property tests:** `tests/unit/properties.test.ts` uses `fast-check`; 0 property-test FAILs.
  Several `npv.ts` equivalents below are invariants that property suite already pins at value level.
- **WARN-level, carried forward unchanged:** the 29 project-source KISS/DRY WARNs (method bodies
  > 20 lines in admin pages and public components). Recorded, not blocking, per the Stop-and-Ask
  matrix ("Design gate WARN → record, do not stop").

---

## Surviving mutants

**113 of 1846 mutants were not killed: 102 survived + 11 no coverage.** (14 further mutants are
runtime errors, which Stryker excludes from the denominator.) Every one of the 113 is classified
below, and every classification is counted once — 64 equivalent + 18 unreachable/dead + 31 reachable
gaps = 113.

### Equivalent mutants (64) — no test can distinguish them

| File | Mutants | Count | Why it is un-killable |
|---|---|---|---|
| `web/metrics/npv.ts` 40, 42, 65:21 (×4), 65:54 (×3), 66, 86, 91 | 12 | 12 | The root is invariant to a positive rescaling of every flow, so `Math.max`→`Math.min` (40), `flow / scale`→`flow * scale` (42) and `Math.min`→`Math.max` on the tolerance (91) converge to the same rate (only the tolerance scale changes, by < 1e-15). `<=`→`<` at 65/65:54/66 and `<= Number.EPSILON`→`<`/`*2` differ only at an exact-equality boundary that float bisection never lands on. 86's `!== 1`→`=== 1` is masked by `initialBracket` returning null for the same inputs. |
| `web/sources/labels.ts` 6, 7, 18, 19, 29, 31, 33 (×3), 36 | 10 | 10 | Dropping `^` from `/^www\./` (6) and `\.`→`.` (6) are no-ops for the shipped catalogue; `split('')`/`join('')` (18, 19) transform both sides of every comparison identically; the `byDataset` short-circuit (29), the exact-host branch (31, 33) and its null guard (36) all fall through to the registered-domain lookup, which selects the *same* declaration for every URL in `SOURCE_DECLARATIONS`; `catch { }` (7) still yields a falsy value, which `if (!host)` handles. |
| `web/manifest/validate.ts` 131 (8 variants) | 8 | 8 | The `reproducePath` pass inside `manifestFieldProblems` is called with `fileExists = () => true`, so `checkReproducePath` can never produce `missingFile`; the `.filter(p => p.code !== 'missingFile')`, both arrow operands, the equality, the boolean and the `""` literal are all dead. |
| `web/ingest/figures.ts` 252 (×3), 244 (×2), 261 | 6 | 6 | 252: `cohort.central` and `cohort.band` are null under exactly the same condition (an empty grid, which happens iff nothing was paid in — `cohortIrr` returns null and every scaled contribution keeps the same sign), so guarding on either alone rejects the same case. 244/261: see the F1-block table — unreachable guard, and a horizon `sensitivityGrid` discards. |
| `web/manifest/definitions.ts` 24, 172, 174 (×4) | 6 | 6 | `renderingOf(internationalDefinitionFor(metric) ?? firstDefinitionOf(metric), …)`: for every metric with an international definition it *is* the first definition of that metric, so the `??` fallback resolves to the same object; for the national-only metrics `find` already returned `undefined`. Mutating the predicate or its body to a constant yields the identical definition. |
| `web/sources/countries.ts` 64 (×2), 110 (×2) | 4 | 4 | `isPublishedGeo` is already gated by the closed `PUBLISHED_GEOS` list, so weakening `&&`/`!== undefined` changes no answer for any input the API can be asked. In `sourcesForDefinition`, `sourceIds.length >= 0` is vacuous because a national definition's lookup is `undefined` (falsy) and returns `null` before the length check matters. |
| `web/sources/live.ts` 27 (×2), 43, 56 | 4 | 4 | `LIVE_URLS` only contains declared source ids, so the `if (!source) continue` guard and the `find` predicate in `declaration()` cannot take their other branch. `/\.\d{3}Z$/`→`/\.\d{3}Z/` is a no-op because `toISOString()` always puts the millisecond group at the end. |
| `web/sources/ine.ts` 23, 45, 50 | 3 | 3 | Replacing the `typeof payload !== 'object'` operand with `false` leaves the sibling `payload === null` / `!Array.isArray` / entry-shape checks catching exactly the same inputs; every rejected input still rejects. |
| `web/metrics/cohort-irr.ts` 66 (×2) | 2 | 2 | `<= 0`→`< 0` differs only at exactly zero contribution, where the sign-change gate already returns `null`, so both forms report `undefined`. |
| `web/manifest/hash.ts` 14, 20 | 2 | 2 | Dropping the `typeof value === 'string'` operand leaves the closed-set/pattern check, which rejects the same non-strings. `/\.\d{3}Z$/`→`/\.\d{3}Z/` is a no-op for the same reason as `live.ts`. |
| `web/ingest/validate-figure.ts` 29, 122 (×2) | 3 | 3 | `typeof value === 'string' && includes` — the membership test alone rejects the same non-strings. In `definitionProblems`, `identity.length > 0` is true whenever `isDefinitionId` is false (an unknown id always produced a problem in `definitionIdProblem`s), so the `&&`/`false` forms return the same early result. |
| `web/ingest/run-compute.ts` 65, 128 | 2 | 2 | In `resolveSources`, the `missingForCountry` branch is evaluated first in `unfinishedOutcome`, so the empty `sourceIds` array it returns is never consumed. `parsed <= oldest` assigns the same instant as `parsed < oldest` when timestamps are equal. |
| `web/ingest/write-derived.ts` 22 | 1 | 1 | `writeFileSync` accepts a `Buffer`; omitting `'utf8'` writes the same bytes a utf8 read then decodes, so the round-trip is byte-identical. |
| `web/manifest/formula-ids.ts` 17 | 1 | 1 | Same shape as `hash.ts` 14: the `includes`/pattern check alone rejects every input the `typeof` guard rejected. |

### Unreachable / dead code (18)

| File | Mutants | Count | Why unreachable |
|---|---|---|---|
| `web/ingest/figures.ts` 33 (×3), 88 (×2) | 5 | 5 | `payload()`'s throw is unreachable through `FIGURES`: every requirement source is inspected before `compute` runs, so the input map only ever holds resolved snapshots and no compute body asks for a source outside its own `requirementSources`. `spanOf`'s empty-array branch is dead because `alignedYears` throws on an empty alignment first. |
| `web/ingest/run-compute.ts` 95, 209, 292, 347 | 4 | 4 | The `?? 'outside freshness window'` fallback is unreachable (`evaluateFreshness` always supplies a reason when `fresh` is false), the `?? 'input'` fallback is unreachable (every failure carries a `sourceId`), `'compute failed'` needs a non-`Error` throw, and `hashInputBytes` has no production caller. |
| `web/metrics/npv.ts` 41 (×5) | 5 | 5 | `if (scale === 0) return {flows: [...], scale: 1}` is unreachable: an all-zero flow set has zero sign changes and returns `null` first. |
| `web/manifest/definitions.ts` 195 (×2) | 2 | 2 | `firstDefinitionOf` can only throw for a metric outside `MetricId`, a closed union; no caller can reach it. |
| `web/ingest/write-derived.ts` 6 | 1 | 1 | `DERIVED_DIR` is a re-export with no reader inside the mutated scope. |
| `web/sources/load.ts` 39 | 1 | 1 | The `dir = 'data/snapshots'` default is never taken; the script passes its own path. |

5 + 4 + 5 + 2 + 1 + 1 = **18**. (The `validate.ts` 131 `missingFile` filter is also dead code — for
the `fileExists = () => true` reason given in the equivalent table — but it is counted there, once.)

### Reachable residual gaps (31) — named with the assertion that would kill each

Real gaps, not equivalents. The first report listed 33; the two `figures.ts:221` mutants on that list
became observable once F1 was fixed and are now killed (round 2), leaving these 31. They are recorded
rather than chased because the refresh budget is two rounds and the gate is met with margin.

| File:line | Mutants | What would kill it |
|---|---|---|
| `web/sources/eurostat.ts` 44, 49 (×2), 56, 58 (×3), 77, 91, 102, 172 (×2), 175, 180 (×2), 235 | 16 | assert `IngestError.name`; a payload whose `dimension` object is absent (exercises the `?.` chain and the `?? {}` fallback); a payload with `value` but no `id`/`size`; a labels map that is upper-case only; a two-element series asserted in ascending order plus an order check on `codesFor`'s sort |
| `web/ingest/run-compute.ts` 162, 210, 216, 234, 249, 270, 294, 325 | 8 | assert the manifest hash for the no-snapshot case (pins the literal `missing` token); a two-problem reason string (pins the `'; '` separator); a failure with no `sourceId`; and `unresolvedSources: []` on the computed / manifest-invalid / unconfigured-country paths |
| `web/sources/load.ts` 21, 32, 47, 48 | 4 | a file with neither `resolved` nor `payload` (defaults to unresolved); `bytes` asserted as a string; readdir order forced to differ from sorted order; non-ASCII bytes compared exactly |
| `web/ingest/validate-figure.ts` 57, 120 | 2 | a candidate with valid `availability` but no `figureId`, asserting `figureId: 'unknown'` in both the manifest and definition problem lists |
| `web/manifest/validate.ts` 113 | 1 | reach `asRecord`'s `Array.isArray` operand with a non-array object whose fields are all valid |

None of these affects the verdict: 93.83 % clears the 80 % threshold with margin, and the residual set
is concentrated in defensive fallbacks and error-message text rather than in a calculation. The
highest-value next step, if the owner wants a higher score, is the 16-mutant `eurostat.ts` cluster —
JSON-stat shape handling, which is where a real ingest regression would most plausibly hide.

---

## Tests added by this refresh

**1 test, in 1 existing file.** No existing test was modified, weakened, renamed or deleted.

| File | Tests | Covers |
|---|---|---|
| `tests/acceptance/required-base-growth.test.ts` (new `describe('projected growth from the population projection (T7)')`) | 1 | `AC-001-31`: `g_proj` annualises the horizon endpoints — asserts `value.central.gProj === annualisedGrowthRate(40_000_000, 32_000_000, 44)` plus a literal pin `≈ -0.005058606285837319`, on a projection carrying decoy years *before* the horizon (2010) and *inside* it (2050), and asserts the decoy-derived rates are distinguishable from the published one; finally pins that `assumptions.gProj` is the same number the central value carries |

Why this test and not another: it is the specific missing assertion the F1 unblocking exposed. The
existing fig-05 test only asserted `gProj < 0`, which every lookup variant satisfies (2010→2070 over
60 years is still negative; 2026→2070 with the endpoints *summed* is still negative at
-5.45e-5 vs -5.06e-3). Pinning the exact value — and proving the decoys are far enough apart to be
distinguishable — is what turns "negative" into "the right negative". Verified before the round-2
run: each of the three mutations was applied to `web/ingest/figures.ts` in turn and the new test
failed on all three (exit 1, 1 failed / 9 passed), and the file was restored byte-identically
(md5 checked).

---

## What this stage did not touch

- **No production code was edited.** The F1 fix, the hero-ladder change and the percent-scale fix
  belong to the Coder/Refactorer stages; this stage only measured them (and temporarily mutated
  `figures.ts` for mutant verification, restored byte-identically).
- **No gate config was changed.** `stryker.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`,
  `.gitignore` and `.standards/**` are untouched. No mutator disabled, no threshold moved, no
  `// Stryker disable` comment.
- **Nothing was committed or pushed.** That is stage 5b's job.
- `reports/mutation/mutation.json` is left in place as the machine-readable evidence for this report;
  `.stryker-tmp/` is gitignored and cleaned by the run.

---

## Remediation record

**Stage 5a, this refresh: none** — no BLOCK occurred during this stage. The mutation gate never
reported BLOCK, and the two rounds were a baseline plus one test-strengthening pass, not a
fix-and-retry loop against a failing gate. Both rounds exited 0.

**Carried forward from `25-verification.md` (not guessed, not invented):**

| Phase | Attempt | Trigger | Outcome |
|---|---|---|---|
| 1 (pre-PR) | 1 | first full run | PASS |
| 1 (pre-PR) | 2 | finding F1 (this stage's first report) — `centralCellOf` compared a deflated rate to a nominal band centre | PASS after the Coder's fix; three pre-existing assertions adjudicated legitimate (1 shape pin, 2 that encoded the defect). Budget state recorded at that attempt: `SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=1`, `SPEC_PHASE2_RETRIES=0` |
| 1 (pre-PR) | 3 | hero ladder swap + percent-scale fix | PASS; state `SPEC_LOOP_COUNT=2`, `SPEC_PHASE1_RETRIES=2`, `SPEC_PHASE2_RETRIES=0` |

So: **two Phase 1 BLOCKs, both resolved in Phase 1, at attempts 2 and 3** — Phase 1 budget used 2 of
3. **Phase 2 (post-PR CI): no attempts** — the PR has not been opened yet. Phase 3 (deploy
verification) has not run. The orchestrator supplied no loop summary beyond
`25-verification.md`'s attempt headers, and none is inferred here.

---

## Flagged to the next stage

1. **F1 is closed and verified.** The block that the previous report had to mark "un-killable by any
   passing test" is now 15/18 killed with the remaining 3 proven equivalent. The 18-mutant caveat is
   gone from the score.
2. **F2 is closed.** `check-audit-trail.sh` now exits 0 (evidence block above), so stage 5b's pre-push
   gate will not block on it.
3. **Changes 2 and 3 (hero ladder, percent scale) were not mutated** — and cannot meaningfully be,
   under this scope. Their evidence is the 25 tests the Coder added plus the Verifier's render check
   against the built app. If the owner wants mutation coverage of `web/content/format.ts`, that is a
   scope change (a new `mutate` glob), and it should be a deliberate decision, not a silent widening.
4. **31 reachable residual mutants**, itemised above with the assertion that would kill each — a
   candidate for a later pass if the owner wants a score above 93.83 %.
5. **Carried forward unchanged from the Verifier**: 29 project-source WARNs (KISS method bodies, DRY
   4-line blocks) in admin pages and public components, and one out-of-scope FAIL inside
   `.standards/`.
6. **`25-verification.md`'s attempt-3 block is the verification of record** for the tree this report
   measures. If code changes again before stage 5b, this report is stale and must be re-run — the
   mutation score is a property of a tree, not of a spec number.

---

**Verdict: GREEN**

Mutation score **93.83 % total / 94.40 % covered** on the stated 28-file scope, threshold ≥ 80 %:
1846 mutants, 1717 killed + 2 timed out, 102 survived and 11 uncovered (64 equivalent, 18
unreachable/dead, 31 reachable residuals named), with 14 runtime errors excluded by the tool. The
F1-unblocked block measures **83.33 % (15/18, 100 % of its killable mutants)**, up from 0 % when the
first report was written. Final suite **415/415 green across 33 files**, app builds, `tsc` and ESLint
clean, traceability 92/92 intact, audit-trail gate exit 0.

---

## PR

PR: https://github.com/RexiAI/pensions-system/pull/3

Commits: 16 (one per task T1–T16; 17 including this record commit).

Opened as a draft against `main` from `spec/001-pension-math`. The spec is **not** archived in
this PR — `scripts/archive-spec.sh 001-pension-math` is stage 5d, which runs after the stage 5c
deploy verification. `scripts/check-specs-archived.sh` therefore exits 1 at this stage
(`001-pension-math is finished … but not archived`), which is the expected intermediate state;
the repo's own `ci.yml` does not run that gate.

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
