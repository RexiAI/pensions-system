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
