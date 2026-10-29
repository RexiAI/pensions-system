# pensions-system

An instrumented public-interest site about the arithmetic of Spain's contributory
pension system, plus a single-operator admin surface for publishing revisions.
Spec: `specs/001-pension-math/` (tasks `10-tasks.md`, acceptance
`20-acceptance/`, design `15-design.md`).

Stack: Next.js App Router (TypeScript) on Vercel, computation precomputed at build
time into committed JSON, Vitest for every test layer, Tailwind v4 tokens only as the
styling layer.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (static public routes, dynamic admin routes) |
| `npm test` | Full suite (acceptance, unit, property) |
| `npm run lint` | ESLint, `complexity` ≤ 6 enforced as an error |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run ingest` | Fetch the machine sources into `data/snapshots/` (never into `data/derived/`) |
| `npm run compute` | Fetch the machine sources, compute, write `data/derived/` |
| `npm run compute -- --offline` | Compute from the committed snapshots only |
| `npm run compute -- --pending` | Compute into `data/pending/` (refresh dispatch) |
| `npm run compute -- --figure fig-03` | Recompute one figure (the reproduce command) |
| `npm run verify:derived` | Build gate: every committed figure must carry a valid manifest |

## Data and provenance

Every published figure carries a manifest: `sourceUrl[]`, `fetchedAt` (ISO-8601 UTC),
`formulaId` (closed set), `definitionId` (closed set), `inputHash` (SHA-256 of the raw
snapshot bytes) and `reproducePath`. A figure also carries its own `definitionId` and its
published `definition` — what is counted and what is excluded — because two numbers computed
on different definitions must never be comparable without that difference visible.
`web/ingest/run-compute.ts` refuses to emit a figure unless every required source resolved,
the snapshot is inside the freshness window, and the manifest validates.

Seven figures are published: five definitions and the two national definitions that ride
beside them.

| Figure | Definition | v1 state |
|---|---|---|
| `fig-01` | `dependency-ratio.international` — old-age beneficiaries per employed person aged 15 to 64 | computed |
| `fig-02` | `pension-expenditure-gdp.international` — public pension expenditure as % of GDP | computed |
| `fig-03` | `cohort-return.national` — internal rate of return of a representative cohort | unavailable |
| `fig-04` | `implicit-debt.national` — PV of accrued obligations minus the Fondo de Reserva | unavailable |
| `fig-05` | `required-base-growth.national` — contributor-base growth needed for the promised return | unavailable |
| `fig-06` | `dependency-ratio.national` — contributory pensioners per contributing affiliate | unavailable |
| `fig-07` | `contribution-cover.national` — contributions ÷ contributory pension expenditure | unavailable |

Three Eurostat datasets and two INE series are machine-verified and are fetched live into
`data/snapshots/` by `scripts/ingest-snapshots.ts` and
`scripts/ingest-population-projection.ts`:

- Eurostat `spr_pns_ben` — pension beneficiaries by type, `geo=ES`; the *old age* pension
  type and the person unit are resolved from the response's own category labels.
- Eurostat `lfsi_emp_a` — employed persons aged 15 to 64, `geo=ES`, thousands of persons.
- Eurostat `spr_exp_pens` — pension expenditure, `geo=ES`, `unit=PC_GDP` (% of GDP); the
  unit code is resolved from its category label.
- INE `tempus3`, tabla 27150 — life expectancy at 65 (series `TM1657`).
- INE `tempus3`, tabla 36643 — long-term population projection, ages 16 to 64.

The remaining publishers (Seguridad Social, IGAE, AIReF, Fondo de Reserva) have no
verified machine endpoint. Their snapshots are committed **unresolved**: they record the
publisher, the dataset and what an operator must supply, and they carry **no values**.
Consequently the five figures whose definitions depend on them publish no number: each
renders as a ledger row stating that figure's specific reason. That is the designed
behaviour, not a bug — `10-tasks.md` open question 1 says a series code that has not been
resolved must be recorded as unresolved, and `availability: 'unavailable'` is a published
state, never a value without provenance.

Three definitions have no international computation at all and say so in their own words:
the cohort return (no comparable average-contribution source), implicit debt (no comparable
accrued-obligations and system-assets source), and required base growth (it depends on the
cohort return).

To publish one of the five, an operator writes the missing snapshot under `data/snapshots/`
with `resolved: true`, the exact table/series and retrieval date, and the payload shape the
figure expects (documented in `web/ingest/figures.ts`). `npm run compute` then exits 0 for
that figure and `data/derived/` carries a value with its manifest.

`geo` is data: a second country is a `CountryConfiguration` row in
`web/sources/countries.ts` plus its sources. A definition a country has no source for
renders `unavailable` for that country with its `definitionId` unchanged — never a
substituted definition. v1 publishes `ES` only.

## Layers

```
app/                     Next.js routes (public static, admin dynamic, admin API)
middleware.ts            the admin gate: config → session → CSRF, noindex + no-store
web/manifest/            Manifest value object, hash, validation
web/sources/             Source declarations, snapshot loading, INE + Eurostat readers
web/ingest/              Fail-loud compute harness, figure definitions, derived writer
web/metrics/             Pure kernels: dependency ratio, cover, IRR, implicit debt, base growth
web/content/             Country+locale content model (es/en/fr/de/it), citations, registers
web/components/          Server-rendered plates, charts, tables, register sections
web/admin/               Auth, rate limiting, audit chain, pending revisions, parameter proposals
web/derived/             Derived-figure store (file and in-memory)
scripts/                 compute, verify-derived, check-client-secrets
data/snapshots/          Committed source snapshots (machine: resolved, manual: unresolved)
data/derived/            Committed derived figures, one file per figure, deterministic order
```

## Integrity rules encoded in code

- **No number without a manifest.** `runCompute` and `approveRevision` both validate the
  manifest before anything is published; a plate with an invalid manifest renders no values.
- **No fabrication.** An unresolved source fails its figure instead of producing a plausible
  number (`data/snapshots/*.json` for the manual sources).
- **No network in tests.** Every test runs against fixtures; the fetchers are only used by
  `scripts/compute.ts`.
- **Admin is fail-closed.** A missing or malformed `ADMIN_PASSWORD_HASH` or
  `ADMIN_SESSION_SECRET` makes `/admin` and every admin API route answer 503, with a
  plain-text body that names no configuration key.
- **No uncited attribution.** Claims and quotes resolve through
  `web/content/citations.ts`; a claim without a resolvable citation is not rendered, and a
  dispute that loses a position is dropped entirely. The same gate runs on admin content.
- **Thesis isolation.** The fraud/pyramid vocabulary is confined to the thesis register
  (checked by scanning every locale document), and no metric component references it.
- **Four discount rates, always.** `implicitDebt` has no single-value output path.

## Admin

`/admin` is a separate route group with its own layout root, Spanish only. One identity,
one password (`ADMIN_PASSWORD_HASH`, argon2id m=64 MiB, t=3, p=1), a signed HMAC session
cookie (`HttpOnly`, `Secure`, `SameSite=Strict`, 1800 s), a per-session CSRF token and a
revision-bound review token for approvals. Every admin response carries
`X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`; the sitemap is generated
from an explicit public-route manifest.

Refresh dispatches `.github/workflows/refresh-derived.yml`; the computation never runs in a
request. A dispatched run writes a pending revision under `data/pending/`, which is
reviewed and approved (or superseded by a newer snapshot) before `data/derived/` changes.

## Deviations recorded for the reviewer

- `npm run build` runs `verify:derived`, not the network compute step: with open question 1
  unresolved, the fail-loud compute would block every build. The commit-time path
  (`npm run compute`) still fails loudly, as the tasks require.
- The public site renders every figure in the `unresolved` state because no manual source
  has been resolved yet (see above).
- `15-design.md` asks for two SVG variants per chart and a client-side theme toggle; v1
  ships one server-rendered variant per chart and the light/dark token sets with the system
  preference (no toggle), keeping the page zero-JS.
