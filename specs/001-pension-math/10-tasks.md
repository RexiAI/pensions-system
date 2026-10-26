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
