# 10 — Tasks: pension-math

Formalisation of `00-informal.md`. Project: greenfield TypeScript monorepo, Next.js on
Vercel (Vercel Git integration only — never `vercel deploy`). Computation is precomputed
at build time into committed derived JSON under `data/derived/`. Conformance tier
`production`: mutation testing and property tests are in scope for the calculation layer.

Task numbering `T1`…`T21`. Each task is a coherent unit (one value object, one operation,
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
- The `hero.statement` is bounded as content-model validation (not a CSS guess): at most
  **42 characters in `es`** and **55 in `de`** (Revision 3 P3 F4; previously 46 / 60). A
  statement over budget fails the build. The Coder must not shrink the type to fit the old
  budget — the budget is the thing that moved.

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
- The clock (T20) joins the set of surfaces that must carry no thesis content: its rendered
  subtree and its `countdown.clock.*` strings carry none of the fraud / pyramid / thesis
  language. AC-001-41 and AC-001-42 extend to the clock's keys (enforced by AC-001-116).
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
- `years = thresholdYear − snapshotYear`, both integers, both printed; the **years** quantity
  carries no sub-annual unit. The clock (T20) is a separate quantity with its own anchor,
  definition, and scenarios; it does not change this rule (AC-001-99, AC-001-108…AC-001-119).
- The derived countdown data gains a derived `anchor` field: the ISO instant
  `{thresholdYear}-01-01T00:00:00+01:00`, assembled from `thresholdYear`, never authored. The
  manifest shape is unchanged; the field is added to the countdown's documented derived schema
  so an unknown field fails validation.
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

## T20 — The anchored clock (the countdown's live reading)

**Goal.** Add a live clock to the countdown block, anchored to a derived conventional date (1
January of `thresholdYear`), so the projection stays static while the clock ticks. Contain the
clock in the instrument register.

**Inputs.** T18 (`thresholdYear`, and the new derived `anchor` field), T8 (locale keys
`countdown.clock.*`).

**Acceptance file.** `20-acceptance/AC-001-clock.md`

**Acceptance criteria.**
- The anchor is derived, never authored: `anchor` = `{thresholdYear}-01-01T00:00:00+01:00`
  (Europe/Madrid fixed offset); changing the threshold moves the anchor; no hand-typed anchor date
  exists in any component or content file (AC-001-108).
- The disclosure is unconditional: in every state where the clock renders, the anchor date, its
  `fecha convencional del umbral` label, and the "projection, not a calculated date" sentence
  render as visible text outside any `<details>`/`title`/tooltip, in all five locales (AC-001-109).
- No clock without a threshold year: `not-crossed`, `unavailable`, and `withheld` render no
  day/hour/minute/second field and no anchor (AC-001-110).
- No-JS completeness: server-rendered HTML carries all four fields, the anchor, and the definition,
  computed from the render instant; no sub-day value renders without a day value beside it
  (AC-001-111).
- Reduced motion: no interval is created and the sub-day fields are `display: none`; the day count,
  anchor, and definition remain (AC-001-112).
- Accessible tree: the sub-day fields are `aria-hidden`; no `aria-live`/`role="timer"`/
  `aria-atomic`/`aria-busy`; the day count and anchor are exposed; the accessible tree is identical
  in both motion modes (AC-001-113).
- One timer, no thrash: exactly one `setInterval`, cleared on unmount and on `visibilitychange`
  hidden, restarted on visible; a `59 → 00` transition causes zero CLS (AC-001-114).
- Elapsed state: after the anchor, all four fields render `0`, no timer runs,
  `countdown.clock.elapsed` replaces the definition, and no string states the threshold was crossed
  or that the projection was validated (AC-001-115).
- Register containment: the clock's subtree resolves only `--ink-*` and `--data-projection`, carries
  no `--data-deficit`/`--surface-3`/serif/thesis language, and appears in no other block, share
  card, `og:*`, or meta description; it is the page's only continuous element (AC-001-116).
- Two-reference disclosure: `countdown.clock.arithmetic` states that the years figure is year-number
  arithmetic (`thresholdYear − snapshotYear`) while the days figure is date arithmetic to the
  anchor; the projection group and clock rail are separated by a `1px --rule-1` (AC-001-119).

---

## T21 — Palette and label-system migration (warm paper, sans labels)

**Goal.** Warm the palette (P1) and de-formalise four non-colour surfaces (P3): migrate labels off
mono, de-border the hero panel, widen the ground steps, raise the display scale, un-rule the ledger
rows — without adding a hue or a number.

**Inputs.** None (the token layer `web/styles/tokens.css`, plus the components that consume the
changed tokens).

**Acceptance file.** `20-acceptance/AC-001-palette-labels.md`

**Acceptance criteria.**
- The token file declares the Revision 3 values for `--surface-*`, `--ink-*`, `--rule-*`,
  `--accent`, `--on-accent`, `--chart-series-2`, and `--data-projection` in both themes; exactly
  three chromatic hues remain; `--data-deficit` is byte-identical to its Revision 2 value in both
  themes (AC-001-117).
- Every pair in the Revision 3 §P1 contrast table meets its stated minimum in both themes; no
  retired value string remains anywhere in `web/`; the admin state colours still pass AA on the new
  grounds (AC-001-117).
- Labels are not measurements: no element whose role is a field label / eyebrow / chip word / state
  word / table caption / scope mark / provenance label resolves `--font-mono`; every numeral still
  does (AC-001-118).
- `--font-label: var(--font-sans)` is the one new font token, and `--tracking-label` falls to
  `0.02em`; the hero panel loses `--border-hair`; ground steps widen (light 2.79 / 3.08 L*);
  `--text-display`/`--text-h2`/`--text-plate` rise to their Revision 3 values (`clamp(2.5rem,
  4.9vw, 4rem)` etc.); the ledger rows drop their `border-top`.

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

## Revision 3 record (design-dial consequences, not owned by a task)

Recorded, not tested. Each entry is a directive to respect — not a requirement to build and not a
scenario to write.

- **`MOTION_INTENSITY` 4 → 5.** The clock is the fourth motion primitive and the only continuous
  one. Recorded as a design-dial consequence; no test asserts a dial number.
- **Refusals (implement none).** Thirteen, from §Revision 3 "What this revision refuses to
  specify": (1) a per-second countdown to a modelled crossing date; (2) a unit coarser than days
  that is not days (months, "años y meses"); (3) milliseconds or sub-second animation; (4) alarm
  red or a hue shift on the clock as the anchor approaches; (5) changing `--data-deficit`;
  (6) a fourth hue; (7) a fuse / bomb / hourglass / siren illustration; (8) a progress bar toward
  the anchor; (9) a sticky, floating, or full-width clock band; (10) a "final day" mode with its
  own styling; (11) a decorative texture, gradient, grain, or paper photograph; (12) display type
  beyond `--text-display: 4rem` or a measure below 64ch; (13) any change to the pyramid, the three
  registers, Reproducir, or the admin surface.
- **`--data-deficit` is deliberately unchanged** in both themes: warmth comes from the paper and
  the ink, never from the alarm hue (AC-001-117 asserts the value is byte-identical to Revision 2).
- **The clock is an instrument, never thesis** (P4). Its seven copy slots resolve from
  `countdown.clock.*`; the fraud reading stays confined to `thesis.*` / `<ThesisSection>`.

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
22. **`hero.statement` budget for `en`/`fr`/`it`.** Revision 3 restates the binding budgets as
    `es` 42 and `de` 55 characters; it does not restate `en`, `fr`, or `it`. *Recommended default:*
    no separate budget for `en`/`fr`/`it` — they are bounded by `es` (English is shorter; French and
    Italian sit within ±10% of `es`), and any overflow is caught by the two-line check at first
    implementation, after which the content is rewritten (the existing "content is rewritten, not
    the type scale" rule).

