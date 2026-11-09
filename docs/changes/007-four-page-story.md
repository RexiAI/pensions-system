# 007-four-page-story

> Spec pipeline archive. Original source: `specs/007-four-page-story/` (deleted by this script).
> Archived: 2026-11-09

## Original ask

# Informal spec — 007 four-page story

## The ask

The public page is one long document. It renders, in order: the five-step story, the
story strip, the source strip, the seven figure plates, the method region, the debate
registers (agreement + dispute), the reading (thesis), the reproduce panel and the
assumptions ledger. Eight regions in one scroll.

Split it into **four pages per locale**, navigable between each other, instead of one
concentrated page. Apply the Laws of UX to the split (chunking, choice count,
convention, progress, pacing) and record the consequences in the design stage as
ADR 0019 requires.

Also change the site title, using the CMO's recommended framing (the literal
"Estafa piramidal" was considered and declined by the operator: it fails
AC-005-21's thesis-vocabulary boundary in all five locales, contradicts the
published sentence "No es una acusación ni una predicción", and would travel
unlabelled in cached social cards).

## Decisions already taken

1. **Four thematic pages**, not one per step and not three:
   - **Historia** (home) — the five-step story, the story strip.
   - **Cifras** — the seven figure plates.
   - **Método** — the method region, the source strip, the reproduce panel, the
     assumptions ledger.
   - **Debate** — the agreement section, the dispute section and the reading (thesis),
     keeping both `#debate` and `#lectura` anchors on this page.
2. **Navigation**: a persistent header nav with the four pages, `aria-current` on the
   active one, plus previous/next links at the end of each page. Keyboard reachable,
   44×44 CSS px minimum targets, reduced-motion safe, no client JavaScript required
   to reach any page or read any content.
3. **Title**: the home `<title>` becomes the promise framing, and a kicker above the
   `<h1>` names the mechanism:
   - `es` — `Sistema de pensiones: la promesa que no se sostiene · {year}` /
     kicker `Sistema de pensiones: esquema de reparto`
   - `en` — `Pension system: the promise that does not hold · {year}` /
     `Pension system: pay-as-you-go`
   - `de` — `Rentensystem: das Versprechen, das nicht trägt · {year}` /
     `Rentensystem: Umlageverfahren`
   - `fr` — `Système de retraites : la promesse qui ne tient pas · {year}` /
     `Système de retraites : répartition`
   - `it` — `Sistema pensionistico: la promessa che non regge · {year}` /
     `Sistema pensionistico: ripartizione`
   Sub-pages get their own `<title>` in the same shape (page name + `{year}` + wordmark
   + country), each still ending with the country name. All five locales carry every
   change in its own language.

## Constraints the specifier must respect

- **Do not change gate thresholds or weaken gates.** Budgets, banned-term lists and
  vocabulary boundaries are off-limits. The kicker and title strings above pass the
  existing `THESIS_TERMS` boundary; keep it that way. "Esquema de reparto" is the
  mechanism, not an accusation.
- **Five locales, static output.** Every route is `force-static`, generated from
  `generateStaticParams`, rendered without client JavaScript. The closed locale tuple
  stays closed: an unknown locale is a 404, never an on-demand render.
- **One `<h1>` per page**, monotonic heading order, landmarks, skip link.
- **SEO is per page, not global**: canonical URL per route, the hreflang group is the
  same page in the five locales plus `x-default`, and the sitemap lists every route
  (4 pages × 5 locales). The share card stays a single home-page asset.
- **Data and editorial behaviour do not change**: the same seven figures, the same
  series, the same counts, the same registers, the same disclaimers, the same
  reproducibility claims. This is information architecture, not a content rewrite.
- **The existing tests that assert one page are the work.** Many acceptance scenarios
  assume a single document (first viewport, demography at the fold, section order,
  anchors). Name the ones this spec supersedes and supersede them explicitly; do not
  delete a scenario and leave its ID dangling.

## UX laws the design stage must apply (ADR 0019)

Expected core set on this change: **Fitts's** (nav and previous/next targets, spacing
between adjacent items), **Hick's** (four navigation choices, no more; what stays on
each page), **Miller's** (the eight regions chunked into four), **Jakob's** (header
nav plus previous/next is the convention; the kicker is a labelled eyebrow, not a
novel pattern), **Doherty** (static navigation, no round trip before content),
**Tesler's** (the pager absorbs the path; the reader is never asked where they are),
**Gestalt** (each page reads as one region). Apply **Serial Position**, **Goal-Gradient**
and **Peak-End** to the four-page sequence if they genuinely govern it; state the
exclusions.

Every cited law needs a concrete consequence and a verification method in
`15-design.md`; a law without both is an artifact defect.

## Supersessions to declare (not to hide)

At least these existing assertions assume one page and must be re-pointed or
superseded with their scenario IDs preserved:

- the first-viewport / demography-at-the-fold scenarios (`tests/acceptance/first-viewport.test.ts`)
- the single-page section-order and anchor scenarios
- the locale-parity required-key count (the kicker and the three new page titles add keys)
- the vocabulary / plain-language gates' scope, which today scan one story region from
  `<main>` to the story strip

## Open questions for the specifier

1. Route slugs: Spanish page names for every locale (`/cifras`, `/metodo`, `/debate`) or
   localized slugs per locale? Default: Spanish, for a stable hreflang group and a
   single sitemap shape.
2. Should old deep links (`#metodo`, `#debate`, `#lectura`) keep working on the page that
   now owns them, and is a redirect from the old single-page anchors worth specifying?
3. Does the source strip belong to **Cifras** or **Método**? Default: Método.
4. Mobile navigation: inline four items or a disclosure menu? Whichever is chosen must
   keep every link reachable without JavaScript and meet the 44×44 target.
5. Does the home page keep the story strip, or does that strip become the four-page
   pager?

## Tasks

# 10-tasks.md — spec 007 four-page story

Stage 1 output. Source of truth: `00-informal.md`. Decisions already taken there are
binding and are not re-litigated here. The UX-law consequences the informal spec names
(Fitts, Hick, Miller, Jakob, Doherty, Tesler, Gestalt, Serial Position, Goal-Gradient,
Peak-End) are the **design stage's** deliverable under ADR 0019 (`15-design.md`); this
file does not duplicate them. Each task below names checkable acceptance criteria; the
matching Given/When/Then scenarios live in `20-acceptance/`, one file per task.

Conventions:

- Scenario IDs are globally sequential `AC-007-01` … `AC-007-28` across the whole spec
  (the traceability gate dedupes by ID, so IDs must not repeat across files).
- "Locale tuple" means `['es','en','fr','de','it']`; `es` is the default and serves at `/`.
- A page "renders without client JavaScript" means every link to another page and every
  content region is present in the served HTML; no hydration-dependent path.

## Task list

| # | Task | Acceptance file | Scenarios |
|---|------|-----------------|-----------|
| 1 | Four-page route model | `20-acceptance/AC-007-01-routes.md` | AC-007-01 … 04 |
| 2 | Historia (home) page | `20-acceptance/AC-007-02-historia.md` | AC-007-05 … 07 |
| 3 | Cifras page | `20-acceptance/AC-007-03-cifras.md` | AC-007-08 |
| 4 | Método page | `20-acceptance/AC-007-04-metodo.md` | AC-007-09 |
| 5 | Debate page | `20-acceptance/AC-007-05-debate.md` | AC-007-10 |
| 6 | Persistent header navigation | `20-acceptance/AC-007-06-header-nav.md` | AC-007-11 … 12 |
| 7 | Previous/next pager | `20-acceptance/AC-007-07-pager.md` | AC-007-13 |
| 8 | Title formula + kicker | `20-acceptance/AC-007-08-title-kicker.md` | AC-007-14 … 17 |
| 9 | Per-page SEO | `20-acceptance/AC-007-09-seo.md` | AC-007-18 … 21 |
| 10 | Content keys + locale parity | `20-acceptance/AC-007-10-content-keys.md` | AC-007-22 … 24 |
| 11 | Plain-language gate scope | `20-acceptance/AC-007-11-plain-language.md` | AC-007-25 … 26 |
| 12 | Supersession declaration | `20-acceptance/AC-007-12-supersession.md` | AC-007-27 … 28 |

---

## Task 1 — Four-page route model

The public surface grows from 5 routes to 20: four pages × five locales, all static,
all `force-static`, all prerendered from `generateStaticParams`, the locale tuple closed
(unknown locale is a 404, never an on-demand render).

Acceptance criteria:

- There are exactly four page kinds — Historia, Cifras, Método, Debate — reachable from
  every locale: Historia at the locale root (`/` for `es`, `/{locale}` otherwise), and
  Cifras / Método / Debate at `/{locale}/cifras`, `/{locale}/metodo`, `/{locale}/debate`
  (root for `es`: `/cifras`, `/metodo`, `/debate`).
- The slug for each non-home page is the Spanish name in every locale (`cifras`, `metodo`,
  `debate`) — the conservative default from open question 1; see Open questions.
- The route manifest `PUBLIC_ROUTE_PATHS` in `web/seo/routes.ts` lists exactly 20 paths,
  still declared by hand, never from filesystem discovery; admin routes stay excluded.
- `generateStaticParams` for the locale branch yields the 3 sub-page slugs × the 4
  non-default locales; the default locale's sub-pages are their own static segments.
- An unknown locale under a page path (`/xx`, `/xx/cifras`) is a 404; `dynamicParams`
  stays `false` and no page uses on-demand rendering.
- The build's route table lists 20 static public routes (the same set the sitemap will
  advertise in Task 9).

## Task 2 — Historia (home) page

The home page becomes Historia: the five-step story and the story strip, and nothing
else. Figures, method, registers, reproduce and ledger move to their pages.

Acceptance criteria:

- Historia renders the five steps in `TOP_STEPS` order, then the story strip; it renders
  no figure plate (`class="plate"`), no `#metodo` region, no register
  (`data-register`), no reproduce block, no assumptions ledger.
- Exactly one `<h1>` on the page (the hero statement, unchanged content), with the
  mechanism kicker (Task 8) as a labelled eyebrow above it.
- The story strip's method link is a page link to the Método page (not `#metodo`); the
  share row still renders when a computed countdown with an anchor is published.
- Heading order stays monotonic on this page (h1 → h2 steps); the skip link and `#main`
  still resolve.

## Task 3 — Cifras page

Cifras holds the seven figure plates (`#figuras`), the region the old single-page nav
pointed at.

Acceptance criteria:

- Cifras renders exactly the seven computed figure plates, in figure order, inside
  `#figuras`; absent/unavailable figures render their unavailable/withheld state exactly
  as today (no behaviour change).
- Exactly one `<h1>` on the page, and no story step, no method region, no register.
- The page's own `#figuras` id resolves on this page (no dangling fragment from any
  in-page link that remains).

## Task 4 — Método page

Método holds the method region, the source strip, the reproduce panel and the
assumptions ledger (decision 1 also assigns the source strip here — see Open question 3).

Acceptance criteria:

- Método renders the method region (countdown precision, fuse, register key), the source
  strip, the reproduce panel and the assumptions ledger, in that order.
- Exactly one `<h1>` on the page; no story step, no figure plate, no register.
- The page's own `#metodo` id resolves on this page; no in-page `href="#…"` points at an
  id that is not present on this page.

## Task 5 — Debate page

Debate holds the agreement section, the dispute section and the reading (thesis), keeping
both `#debate` and `#lectura` anchors on this page (decision 1).

Acceptance criteria:

- Debate renders the agreement section, then the dispute section, then the thesis, in
  that order, with `data-register="agreement" | "dispute" | "thesis"` each appearing
  exactly once.
- The `#debate` id wraps the agreement and dispute sections; the `#lectura` id wraps the
  thesis. Both ids resolve on this page.
- Exactly one `<h1>` on the page; no story step, no figure plate, no method region, no
  reproduce block, no assumptions ledger.
- Register content is byte-for-byte today's editorial (no content rewrite): the two
  mechanism claims, the dispute positions and the thesis reading are unchanged.

## Task 6 — Persistent header navigation

The header nav changes from four in-page anchors (`#figuras` etc.) to four page links,
with `aria-current` on the active page. The locale cells and theme control stay.

Acceptance criteria:

- The header renders four page links (Historia, Cifras, Método, Debate) as ordinary
  `<a href>` to the page routes, in every locale, localized labels from content keys.
- The link for the page being viewed carries `aria-current="page"`; the other three do
  not.
- Every nav link is keyboard-reachable and a minimum 44×44 CSS-px target; the nav is
  reduced-motion safe (no transition/animation that `prefers-reduced-motion` does not
  suppress) and requires no client JavaScript to reach any page.
- The locale switcher and the theme toggle still render and still function without
  JavaScript; the locale cells keep their `aria-current="page"` on the active locale.

## Task 7 — Previous/next pager

Each page ends with previous/next links walking the four-page sequence (Tesler's pager).

Acceptance criteria:

- Every page renders, at its end, a previous and/or next link to the adjacent page in the
  Historia → Cifras → Método → Debate sequence: Historia has no previous; Debate has no
  next; the two middle pages have both.
- The links are ordinary `<a href>`, localized labels from content keys, keyboard
  reachable, ≥44×44 px, reduced-motion safe, no client JavaScript.
- The pager does not re-render the story strip or replace it: Historia keeps its story
  strip (decision 1) and additionally carries the pager.

## Task 8 — Title formula + kicker

The home `<title>` becomes the promise framing; a kicker above the `<h1>` names the
mechanism. The strings below are fixed in `00-informal.md` and kept verbatim.

Home promise title (`{year}` = the committed threshold year):

- es `Sistema de pensiones: la promesa que no se sostiene · {year}`
- en `Pension system: the promise that does not hold · {year}`
- de `Rentensystem: das Versprechen, das nicht trägt · {year}`
- fr `Système de retraites : la promesse qui ne tient pas · {year}`
- it `Sistema pensionistico: la promessa che non regge · {year}`

Kicker (mechanism):

- es `Sistema de pensiones: esquema de reparto`
- en `Pension system: pay-as-you-go`
- de `Rentensystem: Umlageverfahren`
- fr `Système de retraites : répartition`
- it `Sistema pensionistico: ripartizione`

Acceptance criteria:

- The home `<title>` and `og:title` resolve the promise framing for the route's locale,
  with `{year}` interpolated from the committed threshold year, and still end with the
  country name (the existing scope suffix).
- The kicker renders above the `<h1>` as a labelled eyebrow, from a content key, exact
  string per locale; it is not the `<h1>` and not an `<h2>`.
- Sub-pages get their own `<title>` in the same shape — page name + `{year}` + wordmark +
  country — each still ending with the country name.
- Neither the promise title nor the kicker contains any `THESIS_TERMS` value
  (`estafa`, `fraud`/`fraude`/`frode`, `betrug`, `pirámide`/`piramide`/`pyramid`/
  `pyramide`, `cadena`/`chain letter`/`kette`) in any locale; `findThesisTerms` returns
  no hit for them, so the AC-005-21 vocabulary boundary still holds.
- When no threshold year is committed, the home title falls back to the existing year-free
  form (wordmark · country) and the kicker still renders — the kicker carries no year.

## Task 9 — Per-page SEO

SEO is per page, not global: a canonical URL per route, the hreflang group is the same
page in the five locales plus `x-default`, and the sitemap lists all 20 routes.

Acceptance criteria:

- Every one of the 20 routes publishes a canonical `<link>` and `og:url` equal to
  `canonicalUrl(path)` for its own path; the footer's citation line carries the same URL.
- Every route publishes the reciprocal alternate set: the same page in the five locales
  plus `x-default` → the Spanish page. The `alternateLinks` helper produces, per page, the
  five locale hrefs of that page plus `x-default`; no route omits the set.
- `sitemapEntries` returns 20 entries — 4 pages × 5 locales — each with the per-page
  alternates; `robots.txt` still points at `/sitemap.xml`.
- The share card stays a single home-page asset: the `opengraph-image` for the home route
  is unchanged, sub-pages do not generate their own card, and `og:image:alt` remains the
  home card's alt per locale.

## Task 10 — Content keys + locale parity

The kicker and the page/title strings join the content model, so parity holds.

Acceptance criteria:

- `REQUIRED_KEYS` gains the kicker key and the page-name/title keys the new surfaces use;
  no page renders a literal (component-held) copy of the kicker, a page name or a title.
- All five locale documents carry the new keys, non-blank; `missingKeys` and `unknownKeys`
  are empty for each locale, and the five key sets remain mutually equal.
- The new keys are translated, not copied: for every non-`es` locale each new value is
  non-empty and not byte-identical to the `es` value.
- Parity still asserts set equality, never a fixed count (the existing `AC-004-73`
  discipline is preserved; the key set simply grows).

## Task 11 — Plain-language gate scope

The gate today scans one story region from `<main>` to the story strip. With the split,
that region is the Historia page's story; the precision pages are out of the "top
region" scope.

Acceptance criteria:

- The top-region the gate scans is the Historia story (five steps up to the story strip);
  the gate reports no hit for the shipped Historia page in any locale.
- The gate does not scan `#metodo` (Método page) as "top region" — precision may name its
  own sources there, exactly as before the split. The `data-operator="true"` exclusion
  still applies.
- The build step `check:plain-language` still runs on the Historia story and still fails
  on a banned term there (the gate is exercised, not only wired).

## Task 12 — Supersession declaration

The single-page assumptions in existing tests are re-pointed or formally superseded, per
ID, so no scenario ID dangles.

Acceptance criteria:

- Every affected scenario is accounted for by one of two dispositions, each recorded in
  `docs/changes/007-four-page-story.md` and in the test that owns it:
  - **Re-pointed** (substance preserved — a value, accuracy, accessibility, traceability
    or reproducibility property): the test now renders the page that owns the region and
    keeps its ID cited.
  - **Superseded** (substance is where something sat on one page — fold pins, section
    order, in-page anchor targets): the ID is added to `SUPERSEDED_SCENARIOS` in
    `scripts/check-scenario-traceability-3digit.ts` and its assertion is replaced by a new
    `AC-007-*` scenario.
- The supersession table below is reproduced in the archive one-pager, one row per ID.
- `scripts/check-scenario-traceability-3digit.ts` exits 0: every `AC-007-*` scenario is
  cited, every citation resolves, no retired/superseded ID is still cited by a test, and
  no retired/superseded ID is demanded.

### Supersession table (per-ID disposition)

Re-pointed in place (ID stays cited; test renders the new owning page or asserts the new
href target):

| ID | Old single-page assertion | New home |
|----|---------------------------|----------|
| AC-004-01, AC-004-02, AC-004-03, AC-004-05 | five-step contract + "nothing above/before the story" | Historia (unchanged substance) |
| AC-004-08, AC-005-04 | one `<h1>` in step 1 | Historia |
| AC-004-33, AC-004-34, AC-004-35 | method precision + register key in `#metodo` | Método |
| AC-004-36 | every in-page `#metodo` reference resolves | Método owns `#metodo`; header/pager links are page hrefs |
| AC-004-43, AC-004-52 | figure plates live in `#figuras` | Cifras |
| AC-005-28, AC-005-29, AC-005-30, AC-005-31 | register occurrence/order after `#debate` | Debate (order still agreement → dispute → thesis) |
| AC-002-31 … AC-002-35 | CTA hierarchy; `#figuras`/`#metodo` href targets | hrefs become `/cifras` and `/metodo` |
| AC-003-34, AC-003-35, AC-003-36, AC-003-37, AC-003-38 | title/og carry the year + scope suffix; year-free fallback | title content is the promise framing; invariants unchanged |
| AC-001-52, AC-006-34, AC-006-35 | alternates + sitemap + one origin | 20 routes, per-page alternates, one origin |
| AC-006-07 … AC-006-14 | above-the-fold target set, type scale, one accent, `aria-current` | per-page; nav targets become page links |

Superseded (substance is a single-page fold/order pin; ID joins `SUPERSEDED_SCENARIOS`,
assertion replaced by a new `AC-007-*` scenario):

| ID | Superseded assertion | Replaced by |
|----|----------------------|-------------|
| AC-004-04 | the fifth step precedes `#figuras`, `#figuras` non-empty | AC-007-05/08 (Historia ends at the story; Cifras owns `#figuras`) |
| AC-004-37 | the method region is below the fold, after the fifth step | AC-007-09 (Método is its own page) |
| AC-004-25, AC-004-28, AC-004-32 | step-5 CTA → `#figuras`, strip → `#metodo`, "below the fold" precision | AC-007-06/07/09 (page links + pager; Método owns precision) |

Notes on the table: "Re-pointed" IDs remain cited, so no traceability change is needed
for them; "Superseded" IDs move to `SUPERSEDED_SCENARIOS`. The Coder verifies the
disposition against each affected test file; any scenario that does not fall cleanly into
one of the two buckets is reported as an open question rather than guessed.

---

## Open questions (for the human gate — do not guess in `/build`)

1. **Route slugs** — Spanish slugs for all locales (`/cifras`, `/metodo`, `/debate`) or
   localized slugs per locale? Default adopted: Spanish, for a stable hreflang group and a
   single sitemap shape. (Task 1, AC-007-01.)
2. **Old deep links** — should `#metodo`, `#debate`, `#lectura` still resolve on the page
   that now owns them, and should the old single-page anchors on `/` (e.g. `/#metodo`)
   redirect to the new page routes? No redirect is specified here; the owning page keeps
   the anchor id, so `/{locale}/metodo#metodo` resolves, but `/{locale}#metodo` does not.
   A redirect rule is out of scope until decided. (Task 5, AC-007-10.)
3. **Source strip** — assigned to Método by decision 1; open question 3 is therefore
   resolved by decision 1, not left open. Listed here for completeness.
4. **Mobile navigation** — inline four items or a disclosure (`<details>`)? Either must
   keep every link reachable without JavaScript and meet 44×44. Undecided; the header nav
   task specifies the reachable/target/no-JS invariants without prescribing inline vs
   disclosure. (Task 6, AC-007-11/12.)
5. **Home story strip vs pager** — decision 1 keeps the story strip on Historia and
   decision 2 adds prev/next to every page, so the home page has both. What remains
   unresolved: whether the story strip's secondary CTA (`hero.ctaSecondary`, today
   `#metodo`) becomes the "next → Método" link or stays a distinct element. Default
   adopted: it becomes the Método page link; the share row stays. (Task 2, AC-007-07.)

Flagged gaps (not requirements; do not invent a change without the operator):

- The `meta.description` strings still describe the old title ("…España llega a 50…").
  The informal spec changes the title and kicker only, not the description. If the
  description should match the promise framing, that is a separate content change.
- The promise title strings all embed `{year}`; the spec supplies no year-free promise
  variant. Default adopted (Task 8): when no threshold year is committed, the home title
  falls back to the existing year-free `wordmark · country` and the kicker still renders.

## Acceptance scenarios

## AC-007-01 — twenty static public routes, Spanish slugs, closed locale tuple
## AC-007-02 — every public route is force-static and prerendered
## AC-007-03 — an unknown locale on a page path is a 404, never an on-demand render
## AC-007-04 — the locale branch enumerates the three sub-pages for every non-default locale
## AC-007-05 — Historia renders the five-step story and the story strip, nothing else
## AC-007-06 — exactly one h1, with the kicker above it
## AC-007-07 — the story strip links to Método, and the share row still renders
## AC-007-08 — Cifras renders the seven figure plates and one h1, nothing else
## AC-007-09 — Método renders method precision, the source strip, reproduce and the ledger
## AC-007-10 — Debate renders the three registers with `#debate` and `#lectura` intact
## AC-007-11 — four page links with aria-current on the active page
## AC-007-12 — the nav is reachable, 44×44, reduced-motion safe and needs no JavaScript
## AC-007-13 — each page ends with previous/next walking the four-page sequence
## AC-007-14 — the home title is the promise framing, per locale, ending in the country
## AC-007-15 — the kicker names the mechanism above the h1, exact per locale
## AC-007-16 — sub-page titles follow the same shape and end in the country
## AC-007-17 — the revised title and kicker state the claim under the recorded two-key exemption (spec 007 revision 1, 2026-11-09)
## AC-007-18 — one canonical URL per route, in the link, og:url and the footer
## AC-007-19 — every route advertises the reciprocal per-page alternate set
## AC-007-20 — the sitemap lists all 20 routes, robots still points at it
## AC-007-21 — the share card stays a single home-page asset
## AC-007-22 — the kicker and page/title strings live in the content model
## AC-007-23 — all five locales carry the new keys, non-blank and set-equal
## AC-007-24 — the new keys are translated, not copied, and parity stays set-based
## AC-007-25 — the top region the gate scans is the Historia story
## AC-007-26 — the precision pages stay out of the top-region scope
## AC-007-27 — every affected single-page scenario is re-pointed or superseded, per ID
## AC-007-28 — scenario traceability is green

## Verification

# 25-verification.md — spec 007 four-page story

- **Attempt:** 1, phase 1 (first full run; `SPEC_LOOP_COUNT=0`, `SPEC_PHASE1_RETRIES=0`, `SPEC_PHASE2_RETRIES=0`)
- **Branch:** `spec/007-four-page-story` (HEAD `95bf0f6`; base ref `main` = `1ced4c4`)
- **Verification window:** 2026-11-09T08:57:43Z → 2026-11-09T09:07:10Z (~567 s)
- **Verdict: FAIL** — the design-principles gate ran and produced 5 FAILs. This is a pipeline stop,
  not a tooling failure (PASS/BLOCK shorthand: **BLOCK**). No other gate failed.

## Summary

| # | Check | Verdict | Exit |
|---|---|---|---|
| 1 | Scenario traceability | **PASS** | 0 |
| 2 | Full test suite (post-build; 129 files / 1136 tests) | **PASS** | 0 |
| 3 | Complexity gate (`npm run lint`, ESLint `complexity`) | **PASS** | 0 |
| 3.5 | Design-principles gate (`check-code-principles.sh`) | **FAIL** — 5 FAIL / 20 WARN | 1 |
| 4 | Scenario-to-behaviour spot check (AC-007-14/15/18/19) | **PASS** | n/a |
| 5 | No unaccounted behaviour | findings recorded, not a stop | n/a |
| — | Build gates (`prebuild`, `build`, `sitemap:check`) | **PASS** | 0 |
| — | Design laws (ADR 0019) | **PASS** | n/a |

Failing gate ID: `design-principles`. Every command executed; no BLOCK-class tooling failure
(missing script, missing jq/grep, unreadable tree) occurred.

## Script-edit review (Task 11 / Task 12 scope)

The worktree changes four gate scripts. Each edit is the scope adaptation the affected task
authorises, and none weakens a gate or exempts a region that must still be checked:

| Script | Edit | Authorisation | Weakening? |
|---|---|---|---|
| `scripts/check-scenario-traceability-3digit.ts` | `SUPERSEDED_SCENARIOS` gains exactly `AC-004-04`, `-25`, `-28`, `-32`, `-37` | Task 12 / AC-007-27 | **No.** Additive deny-list; replacements are recorded in the `10-tasks.md` table, `docs/changes/007-four-page-story.md`, and the `AC-007-27` test. No test cites a superseded ID (`grep` → none). |
| `scripts/check-plain-language.ts` | renders `pageKind: 'historia'`; `topRegionOf` returns `''` for a page with no `data-top-step` | Task 11 / AC-007-25/26 | **No.** The Historia region (main → story strip) is unchanged; non-story precision pages are out of top-region scope by the task. The gate still fails on a banned term (AC-007-26 test; `prebuild` exercises it). |
| `scripts/check-public-vocabulary.ts` | renders all four page kinds and concatenates them | Task 11's split (vocabulary still scans every public page) | **Strengthened.** Previously one page; now all four. `stripOperatorSubtrees` is retained. |
| `scripts/check-sitemap.ts` | per-entry alternate set resolved from the entry's own page kind; `publishedPaths` = 4 kinds × 5 locales | Task 9 / AC-007-19/20 | **Strengthened.** Per-page alternates replace one global set; exact membership and emitted-bytes checks are retained. Gate prints 20 routes / 6 alternates and agrees with the emitted XML. |

## Build gates (executed, not read)

- `npm run prebuild` → exit 0: derived 7 figures / 3 series, content scope clean, public
  vocabulary clean, 389 scenarios all cited, plain-language clean in 5 locales.
- `npm run build` → exit 0. Route table lists the 20 public routes as static (`○` / `●`):
  `/`, `/en`, `/fr`, `/de`, `/it`, and `cifras|metodo|debate` under each. `.next/server/app`
  holds 22 HTML documents = 20 public + `_not-found` + `_global-error`.
- `npm run sitemap:check` → exit 0: `20 routes, 6 alternates each`, emitted
  `.next/server/app/sitemap.xml.body` and `robots.txt.body` agree.
- Independent read of the emitted sitemap: 20 `<loc>` elements; each `<url>` carries exactly the
  six `xhtml:link` alternates for its own page kind. The `/cifras` block's alternates are
  `/cifras`, `/en/cifras`, … `/it/cifras`, `x-default → /cifras` — never the home URL.
- Independent read of emitted HTML: one `<h1>` per page; home title
  `Sistema de pensiones: la promesa que no se sostiene · 2042 · pensiones · España`; kicker
  `<p class="hero__kicker">Sistema de pensiones: esquema de reparto</p>` immediately before the
  `<h1>` and present only on Historia; `/cifras` canonical, `og:url` and footer `<code>` all
  `https://pensions-system-delta.vercel.app/cifras`.

## Design laws (ADR 0019)

`15-design.md` contains `## Design Laws` (line 75). The table has 16 rows, each with law, where it
applies, a concrete consequence, and a "How a reviewer checks it" method — no law is cited without
a checkable consequence. The ADR core set is fully applied: Fitts's (Tasks 6, 7), Hick's (1, 6),
Miller's (2–5), Jakob's (6), Doherty (6, 7), Tesler's (7), Gestalt proximity/common region
(2–5, 7) and Prägnanz (2, 8). The remaining laws are either applied where the surface invokes them
(Von Restorff, Serial Position, Peak-End, Goal-Gradient) or listed as judged inapplicable with a
reason (Parkinson, Flow, Zeigarnik, Aesthetic-Usability, Pareto/Occam, Choice Overload, Serial
Position on the plate list, Fitts's on non-interactive text). Three deliberate violations each
carry a reason and a compensating control (eyebrow count, premium palette ban, hero-stack
discipline). No design-law defect.

## No unaccounted behaviour

Every new component, route, metadata path, pager, token and CSS rule traces to Tasks 1–9; the key
maps, locale parity and page/title strings trace to Task 10; the four script edits trace to Tasks
11–12. Findings that do not trace to a Task 1–12 requirement:

1. **Out-of-scope commits on the branch.** `95bf0f6` ("contribution-cover: resolve the IGSS series
   and publish fig-07") and `04273aa` ("gate national figures to the country that owns their
   sources") predate this spec's work and are not authorised by any of the 12 tasks. They flip
   `data/derived/fig-07.json` from `unavailable` to `computed` (223 lines), rewrite both
   `data/snapshots/igae-*.json` to IGSS/FEDEA sources, and change `web/ingest/figures.ts`,
   `web/sources/types.ts` and several tests. The PR will carry them. Recorded, not fixed — the
   operator should confirm they belong in this PR or split them / cover them with a follow-up spec.
   (AC-007-08's "no behaviour change" is about the rendering path, which still holds.)
2. **Submodule pointer moved.** `.standards` `6eb2c99 → 5de28c9`; the submodule work tree itself is
   clean. No Task 1–12 authorises the bump; recorded as out of scope.
3. **Untracked screenshots at the repo root:** `live-005-top.png`, `live-006box.png`. Not part of
   any task or deliverable; must not be committed. (`specs/`, the new route directories, the new
   components and `docs/changes/007-four-page-story.md` are untracked as expected at this stage.)
4. **Pre-existing enforcement gap (review hint).** `check-scenario-traceability-3digit.ts` does not
   mechanically reject a *citation* of a superseded ID (only a missing citation). AC-007-28's test
   enforces the "must not be cited" half, and a manual grep finds no citation, so the criterion
   holds today; the script's docstring overstates what it checks. Not introduced by this spec.
5. **AC-007-11 wording.** "The locale switcher and theme toggle still function without
   JavaScript" describes the existing JS theme control, as `15-design.md` §Task 6 records; the test
   asserts render, not toggle. This was surfaced for the human gate and is not newly introduced —
   recorded, not resolved here.

`docs/changes/007-four-page-story.md` (untracked) reproduces both disposition tables, including all
five superseded IDs with their replacements. Watch item for stage 5d: `archive-spec.sh` regenerates
that file and has overwritten appended evidence before (spec 004 OOS-5) — not this gate's call.

## Verdict and remediation

**FAIL.** The design-principles script is the authority and it exits 1. The five FAILs are
KISS/`Method body >20 lines` findings, all in files touched by the diff, so the script classifies
them as diff-introduced (`-BaseRef main` semantics), not pre-existing debt:

- `web/ingest/figures.ts:342:366:compute:KISS_LINES=26`
- `web/components/public/SiteFooter.tsx:29:63:SiteFooter:KISS_LINES=36`
- `web/components/public/SiteHeader.tsx:72:105:IndexPanel:KISS_LINES=35`
- `web/components/public/SiteHeader.tsx:116:136:SiteHeader:KISS_LINES=22`
- `web/components/FigureStatusRow.tsx:37:65:FigureStatusRow:KISS_LINES=27`

Route to the **Refactorer** (structural): extract functions/sub-components until each body is ≤20
lines; fix the code, never the threshold. The re-trigger is **attempt 2, phase 1**, scoped to
`bash .standards/scripts/check-code-principles.sh -BaseRef main` (optionally `--gates complexity`),
per AC-007-02 — the five other checks are not re-run. Phase-1 budget: 1 of 3 attempts consumed by
this verdict; no escalation yet. The 20 WARNs are review hints for the Architect, not stops.

## Evidence: scenario traceability

command: npx tsx scripts/check-scenario-traceability-3digit.ts && bash .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-11-09T08:57:43Z

scenario traceability (2-3 digit ids): 389 scenarios, all cited, all citations resolve

--- .standards/scripts/check-scenario-traceability.sh --json (2026-11-09T08:57:49Z) ---
{
  "checks": [1, 2],
  "passes": ["AC-007-01 — traced to a test", "AC-007-02 — traced to a test", "AC-007-03 — traced to a test", "AC-007-04 — traced to a test", "AC-007-05 — traced to a test", "AC-007-06 — traced to a test", "AC-007-07 — traced to a test", "AC-007-08 — traced to a test", "AC-007-09 — traced to a test", "AC-007-10 — traced to a test", "AC-007-11 — traced to a test", "AC-007-12 — traced to a test", "AC-007-13 — traced to a test", "AC-007-14 — traced to a test", "AC-007-15 — traced to a test", "AC-007-16 — traced to a test", "AC-007-17 — traced to a test", "AC-007-18 — traced to a test", "AC-007-19 — traced to a test", "AC-007-20 — traced to a test", "AC-007-21 — traced to a test", "AC-007-22 — traced to a test", "AC-007-23 — traced to a test", "AC-007-24 — traced to a test", "AC-007-25 — traced to a test", "AC-007-26 — traced to a test", "AC-007-27 — traced to a test", "AC-007-28 — traced to a test"],
  "fails": []
}

--- manual checks ---
$ grep -rho 'AC-007-[0-9][0-9]' specs/007-four-page-story/20-acceptance | sort -u | wc -l
28
$ grep -rn 'AC-004-\(04\|25\|28\|32\|37\)\b' tests/
none
$ grep -l '## AC-004-04' docs/changes/
docs/changes/004-plain-countdown.md
(and the same file for AC-004-25, AC-004-28, AC-004-32, AC-004-37)

## Evidence: full test suite

command: npx vitest run
exit: 0
at: 2026-11-09T09:03:01Z

[post-fresh-build run C: 129 files / 1136 tests]

 Test Files  129 passed (129)
      Tests  1136 passed (1136)
   Start at  10:03:01
   Duration  43.25s (tests 91%, import 7%, transform 1%, environment 1%)

    Isolate  129 workers spawned · ~218ms startup each (spawn + environment, per file)
             at least ~2.34s faster with isolate: false — reuses workers across files instead of one per file

[post-fresh-build run D]

 Test Files  129 passed (129)
      Tests  1136 passed (1136)
   Start at  10:03:47
   Duration  43.16s (tests 91%, import 7%, transform 1%, environment 1%)

    Isolate  129 workers spawned · ~217ms startup each (spawn + environment, per file)
             at least ~2.33s faster with isolate: false — reuses workers across files instead of one per file

[npx vitest run tests/acceptance (2026-11-09T09:04:31Z): 91 files / 637 tests]

 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  91 passed (91)
      Tests  637 passed (637)
   Start at  10:04:31
   Duration  43.01s (tests 93%, import 5%, transform 1%)

[isolation: npx vitest run tests/acceptance/no-empty-columns.test.ts (2026-11-09T09:00:07Z)]

 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  1 passed (1)
      Tests  7 passed (7)
   Start at  10:00:07
   Duration  18.01s (tests 98%, import 1%, transform 1%)

[isolation: npx vitest run tests/acceptance/countdown-band-browser.test.ts (2026-11-09T09:00:26Z)]

 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  10:00:26
   Duration  13.80s (tests 100%)

--- skip/disable guard ---
$ grep -rnE '\b(it|test|describe)\.(skip|todo|fails|only)\b|xit\(|xdescribe\(' tests/
no skipped/todo/only tests
Vitest reports no "skipped" line: every test that runs is counted. Browser suites executed
(no-empty-columns 7 tests, countdown-band-browser 4 tests) with `.next` and Chromium present.

Flake classification: the Reorderer-reported first-run `AC-004-55` failure and the earlier
`countdown-band-browser` failure are **load-dependent browser flakes**, not skipped/disabled tests.
Both files start a real served app plus Chromium in `beforeAll`; both pass in isolation and in all
four subsequent full-suite runs (two before and two after a fresh `npm run build`). No skipIf
branch was taken in any of those runs.

## Evidence: complexity gate

command: npm run lint
exit: 0
at: 2026-11-09T09:02:40Z


> pensions-system@0.0.0 lint
> eslint .

Note: ESLint (cyclomatic complexity ≤6) is clean. The KISS line-count findings belong to the
design-principles script and are recorded verbatim in the next block; they are not ESLint findings.

## Evidence: design-principles gate

command: bash .standards/scripts/check-code-principles.sh -BaseRef main
exit: 1
at: 2026-11-09T09:01:35Z

Checking design principles in: . (tier: mvp)

PASS Complexity/KISS (java): no violations found
FAIL Method body >20 lines (node): ./web/ingest/figures.ts:342:366:compute:KISS_LINES=26
WARN Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23
FAIL Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:29:63:SiteFooter:KISS_LINES=36
FAIL Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:72:105:IndexPanel:KISS_LINES=35
FAIL Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:116:136:SiteHeader:KISS_LINES=22
FAIL Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:37:65:FigureStatusRow:KISS_LINES=27

--- DRY ---
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:1): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:2): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:3): import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /export const dynamic = 'force-static'; /import { renderPublicPage } from '../../../../web/components/render-public-page';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:4): import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /export function generateMetadata(): Metadata { /import { renderPublicPage } from '../../../../web/components/render-public-page';

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
WARN SRP: possible god file (node) — ./web/content/keys.ts: 444 lines, 0 methods (split by responsibility)
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
Property tests: skipped (project tier is mvp — production+ required)

--- Comments ---
WARN Comments: commented-out code (./scripts/check-sitemap.ts:20)

--- Naming ---
WARN Naming: noise word in type name (PublicPageData) (./web/components/PublicPage.tsx:19)
WARN Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
WARN Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:310)

--- Null discipline ---
WARN Null-discipline: return null (./scripts/check-sitemap.ts:177)
WARN Null-discipline: return null (./web/ingest/run-compute.ts:287)
WARN Null-discipline: return null (./web/seo/share-card.tsx:108)
WARN Null-discipline: return null (./web/components/public-page-props.ts:54)
WARN Null-discipline: return null (./web/components/public-page-props.ts:57)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:37)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:50)
WARN Null-discipline: return null (./web/components/public/NumberStep.tsx:92)

---------------------------------------------
✘ Design-principles check: 5 FAIL(s), 20 WARN(s).
  Reference: docs/CODING_CONVENTIONS.md §Design Principles, docs/ARCHITECTURE.md, docs/TESTING.md

--- tier production (2026-11-09T09:01:58Z) ---
Checking design principles in: . (tier: production)

PASS Complexity/KISS (java): no violations found
FAIL Method body >20 lines (node): ./web/ingest/figures.ts:342:366:compute:KISS_LINES=26
WARN Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23
FAIL Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:29:63:SiteFooter:KISS_LINES=36
FAIL Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:72:105:IndexPanel:KISS_LINES=35
FAIL Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:116:136:SiteHeader:KISS_LINES=22
FAIL Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:37:65:FigureStatusRow:KISS_LINES=27

--- DRY ---
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:1): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:2): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:3): import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /export const dynamic = 'force-static'; /import { renderPublicPage } from '../../../../web/components/render-public-page';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:4): import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /export function generateMetadata(): Metadata { /import { renderPublicPage } from '../../../../web/components/render-public-page';

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
WARN SRP: possible god file (node) — ./web/content/keys.ts: 444 lines, 0 methods (split by responsibility)
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

--- Comments ---
WARN Comments: commented-out code (./scripts/check-sitemap.ts:20)

--- Naming ---
WARN Naming: noise word in type name (PublicPageData) (./web/components/PublicPage.tsx:19)
WARN Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
WARN Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:310)

--- Null discipline ---
WARN Null-discipline: return null (./scripts/check-sitemap.ts:177)
WARN Null-discipline: return null (./web/ingest/run-compute.ts:287)
WARN Null-discipline: return null (./web/seo/share-card.tsx:108)
WARN Null-discipline: return null (./web/components/public-page-props.ts:54)
WARN Null-discipline: return null (./web/components/public-page-props.ts:57)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:37)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:50)
WARN Null-discipline: return null (./web/components/public/NumberStep.tsx:92)

---------------------------------------------
✘ Design-principles check: 5 FAIL(s), 20 WARN(s).
  Reference: docs/CODING_CONVENTIONS.md §Design Principles, docs/ARCHITECTURE.md, docs/TESTING.md

--- --json transcript (2026-11-09T09:02:40Z) ---
{
  "tier": "mvp",
  "gates": ["complexity", "dry", "yagni", "solid", "component-per-file", "property-tests", "comments", "naming", "null-discipline"],
  "fails": [{ "message": "Method body >20 lines (node): ./web/ingest/figures.ts:342:366:compute:KISS_LINES=26", "file": "./web/ingest/figures.ts", "line": "342" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:29:63:SiteFooter:KISS_LINES=36", "file": "./web/components/public/SiteFooter.tsx", "line": "29" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:72:105:IndexPanel:KISS_LINES=35", "file": "./web/components/public/SiteHeader.tsx", "line": "72" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:116:136:SiteHeader:KISS_LINES=22", "file": "./web/components/public/SiteHeader.tsx", "line": "116" }, { "message": "Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:37:65:FigureStatusRow:KISS_LINES=27", "file": "./web/components/FigureStatusRow.tsx", "line": "37" }],
  "warns": [{ "message": "Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23", "file": "./web/seo/share-card.tsx", "line": "41" }, { "message": "Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "10" }, { "message": "Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "9" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:1): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /import type { Metadata } from 'next';", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "1" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:2): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /import type { Metadata } from 'next';", "file": "./app/(public)/(home)/cifras/page.tsx", "line": "2" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:3): import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /export const dynamic = 'force-static'; /import { renderPublicPage } from '../../../../web/components/render-public-page';", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "3" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:4): import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /export function generateMetadata(): Metadata { /import { renderPublicPage } from '../../../../web/components/render-public-page';", "file": "./app/(public)/(home)/cifras/page.tsx", "line": "4" }, { "message": "SRP: possible god file (node) — ./web/content/keys.ts: 444 lines, 0 methods (split by responsibility)", "file": "./web/content/keys.ts", "line": "" }, { "message": "Comments: commented-out code (./scripts/check-sitemap.ts:20)", "file": "./scripts/check-sitemap.ts", "line": "20" }, { "message": "Naming: noise word in type name (PublicPageData) (./web/components/PublicPage.tsx:19)", "file": "./web/components/PublicPage.tsx", "line": "19" }, { "message": "Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)", "file": "./web/components/public/NumberStep.tsx", "line": "37" }, { "message": "Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:310)", "file": "./web/ingest/run-compute.ts", "line": "310" }, { "message": "Null-discipline: return null (./scripts/check-sitemap.ts:177)", "file": "./scripts/check-sitemap.ts", "line": "177" }, { "message": "Null-discipline: return null (./web/ingest/run-compute.ts:287)", "file": "./web/ingest/run-compute.ts", "line": "287" }, { "message": "Null-discipline: return null (./web/seo/share-card.tsx:108)", "file": "./web/seo/share-card.tsx", "line": "108" }, { "message": "Null-discipline: return null (./web/components/public-page-props.ts:54)", "file": "./web/components/public-page-props.ts", "line": "54" }, { "message": "Null-discipline: return null (./web/components/public-page-props.ts:57)", "file": "./web/components/public-page-props.ts", "line": "57" }, { "message": "Null-discipline: return null (./web/components/public/MethodRegion.tsx:37)", "file": "./web/components/public/MethodRegion.tsx", "line": "37" }, { "message": "Null-discipline: return null (./web/components/public/MethodRegion.tsx:50)", "file": "./web/components/public/MethodRegion.tsx", "line": "50" }, { "message": "Null-discipline: return null (./web/components/public/NumberStep.tsx:92)", "file": "./web/components/public/NumberStep.tsx", "line": "92" }]
}

## Evidence: scenario-to-behavior spot check

command: python3 - (reads tests/acceptance/AC-007-08-title-kicker.test.ts, tests/acceptance/AC-007-09-seo.test.ts and the emitted .next HTML; prints assertions and artifacts)
exit: 0
at: 2026-11-09T09:06:49Z

== test assertions: AC-007-14/15 ==
AC-007-14 -> it('AC-007-14: title and og:title start with the promise and end with the country', () => { for (const locale of LOCALES) { const promise = PROMISE[locale].replace('{year}', String(YEAR)); const country = content(locale).country.name; const meta = pageMetadata(locale); expect(meta.title, locale).toContain(promise); expect(meta.title.endsWith(` · ${country}`), locale).toBe(true); const resolved = metadataFor(locale); expect(String(resolved.title), locale).toBe(meta.title); expect(String((resolved.openGraph as { title?: string }).title), locale).toBe(meta.ogTitle); } });
AC-007-15 -> it('AC-007-15: the kicker is the locale’s exact string, above the h1 and not a heading', () => { for (const locale of LOCALES) { const html = historiaPage(locale); expect(html, locale).toContain(`<p class="hero__kicker">${KICKER[locale]}</p>`); const kicker = html.indexOf(`<p class="hero__kicker">${KICKER[locale]}</p>`); expect(kicker, locale).toBeLessThan(html.indexOf('<h1')); const kickerElement = html.slice(kicker, html.indexOf('</p>', kicker)); expect(kickerElement, locale).not.toContain('<h1'); expect(kickerElement, locale).not.toContain('<h2'); } });
== test assertions: AC-007-18/19 ==
AC-007-18 -> it('AC-007-18: every one of the twenty routes publishes its own canonical in all three places', () => { for (const locale of LOCALES) { for (const kind of PAGE_KINDS) { const canonical = canonicalUrl(pagePathFor(locale, kind)); const meta = metadataFor(locale, kind); expect(String(meta.alternates?.canonical), `${locale}/${kind}`).toBe(canonical); expect(String(meta.openGraph?.url), `${locale}/${kind}`).toBe(canonical); expect(pageOf(kind, locale), `${locale}/${kind} footer`).toContain(`<code>${canonical}</code>`); } } }); it('AC-007-18: no route publishes another route’s canonical', () => { const canonicals = new Set<string>(); for (const locale of LOCALES) { for (const kind of PAGE_KINDS) c
AC-007-19 -> it('AC-007-19: five locales plus x-default, each the same page kind', () => { for (const locale of LOCALES) { for (const kind of PAGE_KINDS) assertAlternates(locale, kind); } }); it('AC-007-19: a sub-page never advertises the home URL as its alternate', () => { for (const locale of LOCALES) { for (const kind of SUB_PAGE_FILES) { const hrefs = Object.values((metadataFor(locale, kind).alternates?.languages ?? {}) as Record<string, string>); expect(hrefs, `${locale}/${kind}`).not.toContain(canonicalUrl('/')); } } });
== emitted artifacts ==
home title: Sistema de pensiones: la promesa que no se sostiene · 2042 · pensiones · España
home canonical: ['https://pensions-system-delta.vercel.app']
home alternates: 6
kicker before h1: Sistema de pensiones: esquema de reparto
cifras canonical: ['https://pensions-system-delta.vercel.app/cifras']
cifras og:url: ['https://pensions-system-delta.vercel.app/cifras']
cifras footer canonical: ['https://pensions-system-delta.vercel.app/cifras']
cifras alternates: [('es', 'https://pensions-system-delta.vercel.app/cifras'), ('en', 'https://pensions-system-delta.vercel.app/en/cifras'), ('fr', 'https://pensions-system-delta.vercel.app/fr/cifras'), ('de', 'https://pensions-system-delta.vercel.app/de/cifras'), ('it', 'https://pensions-system-delta.vercel.app/it/cifras'), ('x-default', 'https://pensions-system-delta.vercel.app/cifras')]

Finding: the four assertions match their Given/When/Then. AC-007-14 checks the promise string with
the committed year and the country suffix, and that `og:title` resolves to the same string; the
emitted home title confirms it. AC-007-15 checks the exact per-locale kicker, its position before
`<h1>` and its non-heading role; the emitted HTML confirms the same node order. AC-007-18 checks
canonical, `og:url` and the footer citation for all 20 route/kind pairs, and that the 20 canonicals
are distinct; emitted `/cifras` confirms all three. AC-007-19 checks five locales + `x-default`,
same page kind, absolute origin, and that a sub-page never advertises `/`; emitted alternates
confirm. No false green found.

---

# Attempt 2, phase 1 — scoped re-verification

- **Attempt:** 2, phase 1 (`SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=1`, `SPEC_PHASE2_RETRIES=0`)
- **Branch:** `spec/007-four-page-story` — HEAD unchanged at `95bf0f6`; base ref `main` = `1ced4c4`
- **Trigger:** attempt 1's `design-principles` FAIL — five `KISS_LINES` findings handed to the Refactorer
- **Verification window:** 2026-11-09T09:17:21Z → 2026-11-09T09:20:40Z (~199 s)
- **Scope:** only the previously failing gate (check 3.5), per AC-007-02. Checks 1, 2, 3, 4 and 5 keep
  their attempt-1 evidence above and were **not** re-run. The `npx vitest run` below is a rendering
  smoke test on the refactored files, not a re-verification of check 2.
- **Verdict: PASS (scoped)** — the gate exits 0 at both tiers with 0 FAIL / 20 WARN. No new FAIL and
  no new WARN appeared.

## Result

| Gate | Attempt 1 | Attempt 2 | Exit |
|---|---|---|---|
| Design-principles, default tier (script reports `mvp`) | FAIL — 5 FAIL / 20 WARN | **PASS** — 0 FAIL / 20 WARN | 0 |
| Design-principles, `--tier production` | FAIL — 5 FAIL / 20 WARN | **PASS** — 0 FAIL / 20 WARN | 0 |
| Render smoke (`npx vitest run`) | n/a | **PASS** — 129 files / 1136 tests | 0 |

All five attempt-1 FAILs are absent from both tiers:

- `web/ingest/figures.ts:342:366:compute:KISS_LINES=26` → gone
- `web/components/public/SiteFooter.tsx:29:63:SiteFooter:KISS_LINES=36` → gone
- `web/components/public/SiteHeader.tsx:72:105:IndexPanel:KISS_LINES=35` → gone
- `web/components/public/SiteHeader.tsx:116:136:SiteHeader:KISS_LINES=22` → gone
- `web/components/FigureStatusRow.tsx:37:65:FigureStatusRow:KISS_LINES=27` → gone

The 20 WARNs are the same 20 as attempt 1 (KISS `share-card.tsx:41` = 23; six DRY blocks; one god-file
SRP; one commented-out-code; three naming; eight null-discipline). **No new WARN, no new FAIL.**

## Fix review — the gate was satisfied by structure, not by suppression

The five findings were fixed by extraction, and the counter was not gamed:

- **`web/ingest/figures.ts`** — the three duplicated align-and-map blocks (`alignedYears`,
  `nationalDependencyFigure.compute`, `nationalCoverFigure.compute`) collapse into one generic
  `joinSeries<T>(left, right, keyOf, valueOf)` helper. Filter/map semantics are unchanged, rows are
  still never forward-filled, and `alignedYears` keeps its empty-series `throw`. This is a genuine DRY
  win on top of the KISS fix. `COVER_ASSUMPTIONS` is hoisted to a module constant, values verbatim.
- **`web/components/public/SiteFooter.tsx`** — body split into `FooterSources`, `FooterClaims`,
  `FooterCitation`, `FooterLocaleLinks`; the old import of `localePath` from `SiteHeader` is gone.
- **`web/components/public/SiteHeader.tsx`** — body split into `HeaderBrand`, `PageLinks`,
  `IndexLocaleList`, `IndexPanelBody`, `IndexPanel`. Nested JSX was moved into real components, not
  reflowed onto fewer lines.
- **`web/components/FigureStatusRow.tsx`** — `FigureRowHead` and `FigureRowDefinition` extracted;
  `FigureState` type alias added.
- **No suppression markers** were introduced: `grep -E '^\+.*(noqa|nolint|design-principles|eslint-disable|@ts-ignore|KISS|disable)'`
  over the four diffs returns nothing.
- **The gate script itself is untouched**: `.standards` submodule work tree is clean
  (`git -C .standards status --porcelain` → empty); the only `.standards` change is the pointer bump
  already recorded in attempt 1's §No unaccounted behaviour item 2.
  `sha256sum .standards/scripts/check-code-principles.sh` = `6e2e9a82c9e0891330a920aed981d7e13ed856aa9c371683592172b1cb1e6424`.

## Notes carried to the Architect (not gate findings)

1. **Unasserted link-target behaviour in the delta.** `web/components/FigureStatusRow.tsx` now renders
   the method link as `href={pagePathFor(content.locale, 'metodo')}`; the diff-vs-`main` shows
   `href="#metodo"` before. That is behaviour, not structure, and no test asserts the target — the
   three tests that touch this row (`tests/acceptance/accessibility.test.ts:247`,
   `tests/unit/design-revision.test.ts:100`, `:327`) assert only the label text
   (`figure.methodLink`). The change is consistent with spec 007's four-page model (a `#metodo`
   in-page anchor no longer exists on Historia), and the suite is green, but the target itself is
   uncovered. Flagged for the Architect / a follow-up assertion; not fixed here.
2. **Attribution of the per-page footer/nav hunks.** The delta-vs-`main` for these files also carries
   per-page footer canonical (`pageKind` prop) and page-links-instead-of-anchors. Those were already
   in the working tree at attempt 1 — attempt 1's emitted-HTML evidence recorded
   `cifras footer canonical: https://pensions-system-delta.vercel.app/cifras`, which the HEAD version
   could not emit. They trace to Tasks 6 and 9, not to this fix.
3. **`localePath` removed cleanly.** `grep -rn localePath` over `app/ web/ tests/ scripts/` → no hits.
   Its replacement `publicPathFor` is behaviourally identical: `pagePathFor(locale,'historia')` →
   `locale === DEFAULT_LOCALE ? '' : '/'+locale`, and `DEFAULT_LOCALE = 'es'`
   (`web/content/types.ts:7`), matching the deleted `locale === 'es' ? '/' : '/${locale}'`.
4. **Working tree still dirty** (98 paths incl. `runs.jsonl` telemetry, untracked `specs/`, route
   directories, `docs/changes/007-four-page-story.md`, and the two stray screenshots
   `live-005-top.png` / `live-006box.png`). Unchanged in character from attempt 1 — the pipeline's
   in-progress state. Nothing stashed, nothing committed, nothing pushed. Attempt 1's item 1
   (out-of-scope commits on the branch) and item 3 (stray screenshots) still stand.
5. **`web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23`** remains a WARN at both tiers — identical to
   attempt 1, pre-existing, not diff-introduced by this fix.

## Evidence: design-principles gate (attempt 2, scoped)

command: bash .standards/scripts/check-code-principles.sh -BaseRef main
exit: 0
at: 2026-11-09T09:17:25Z

[ANSI colour codes stripped; text otherwise verbatim]

Checking design principles in: . (tier: mvp)

PASS Complexity/KISS (java): no violations found
WARN Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23

--- DRY ---
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:1): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:2): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:3): import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /export const dynamic = 'force-static'; /import { renderPublicPage } from '../../../../web/components/render-public-page';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:4): import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /export function generateMetadata(): Metadata { /import { renderPublicPage } from '../../../../web/components/render-public-page';

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
WARN SRP: possible god file (node) — ./web/content/keys.ts: 444 lines, 0 methods (split by responsibility)
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
Property tests: skipped (project tier is mvp — production+ required)

--- Comments ---
WARN Comments: commented-out code (./scripts/check-sitemap.ts:20)

--- Naming ---
WARN Naming: noise word in type name (PublicPageData) (./web/components/PublicPage.tsx:19)
WARN Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
WARN Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:310)

--- Null discipline ---
WARN Null-discipline: return null (./scripts/check-sitemap.ts:177)
WARN Null-discipline: return null (./web/ingest/run-compute.ts:287)
WARN Null-discipline: return null (./web/seo/share-card.tsx:108)
WARN Null-discipline: return null (./web/components/public-page-props.ts:54)
WARN Null-discipline: return null (./web/components/public-page-props.ts:57)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:37)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:50)
WARN Null-discipline: return null (./web/components/public/NumberStep.tsx:92)

---------------------------------------------
✔ Design-principles check: 0 FAIL(s), 20 WARN(s).
  WARNs are review hints — verify each before merging.

## Evidence: design-principles gate, production tier (attempt 2, scoped)

command: bash .standards/scripts/check-code-principles.sh --tier production -BaseRef main
exit: 0
at: 2026-11-09T09:17:52Z

[ANSI colour codes stripped; the block is identical to the default-tier run except the tier line and
the Property-tests section, which the project declares production and satisfy]

Checking design principles in: . (tier: production)

PASS Complexity/KISS (java): no violations found
WARN Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23

--- DRY ---
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {
WARN Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:1): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:2): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /import type { Metadata } from 'next';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:3): import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /export const dynamic = 'force-static'; /import { renderPublicPage } from '../../../../web/components/render-public-page';
WARN Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:4): import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /export function generateMetadata(): Metadata { /import { renderPublicPage } from '../../../../web/components/render-public-page';

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
WARN SRP: possible god file (node) — ./web/content/keys.ts: 444 lines, 0 methods (split by responsibility)
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

--- Comments ---
WARN Comments: commented-out code (./scripts/check-sitemap.ts:20)

--- Naming ---
WARN Naming: noise word in type name (PublicPageData) (./web/components/PublicPage.tsx:19)
WARN Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
WARN Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:310)

--- Null discipline ---
WARN Null-discipline: return null (./scripts/check-sitemap.ts:177)
WARN Null-discipline: return null (./web/ingest/run-compute.ts:287)
WARN Null-discipline: return null (./web/seo/share-card.tsx:108)
WARN Null-discipline: return null (./web/components/public-page-props.ts:54)
WARN Null-discipline: return null (./web/components/public-page-props.ts:57)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:37)
WARN Null-discipline: return null (./web/components/public/MethodRegion.tsx:50)
WARN Null-discipline: return null (./web/components/public/NumberStep.tsx:92)

---------------------------------------------
✔ Design-principles check: 0 FAIL(s), 20 WARN(s).
  WARNs are review hints — verify each before merging.

--- --json transcript (attempt 2, 2026-11-09T09:19:34Z, exit 0) ---

{
  "tier": "mvp",
  "gates": [
    "complexity",
    "dry",
    "yagni",
    "solid",
    "component-per-file",
    "property-tests",
    "comments",
    "naming",
    "null-discipline"
  ],
  "fails": [],
  "warns": [
    {
      "message": "Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23",
      "file": "./web/seo/share-card.tsx",
      "line": "41"
    },
    {
      "message": "Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {",
      "file": "./app/(public)/[locale]/cifras/page.tsx",
      "line": "10"
    },
    {
      "message": "Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';",
      "file": "./app/(public)/[locale]/cifras/page.tsx",
      "line": "9"
    }
  ]
}

[... 17 further identical WARN entries elided for length; total warns = 20, fails = 0 ...]

## Evidence: render smoke test (attempt 2, scoped confirmation)

command: npx vitest run
exit: 0
at: 2026-11-09T09:18:37Z

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  129 passed (129)
      Tests  1136 passed (1136)
   Start at  10:18:38
   Duration  46.66s (tests 90%, import 8%, environment 1%, transform 1%)

    Isolate  129 workers spawned · ~281ms startup each (spawn + environment, per file)
             at least ~3.02s faster with isolate: false — reuses workers across files instead of one per file

--- skip guard ---
$ grep -nE "skipped|todo|\[use\]|only" <vitest output>
no skipped/todo/only tests; every test that ran is counted. Same file/test count as attempt 1
(129 files / 1136 tests), so the extraction changed no test's outcome.

## Verdict (attempt 2, phase 1)

**PASS (scoped).** The previously failing gate now exits 0 at both tiers: 0 FAIL, 20 WARN, no new WARN.
The five KISS findings were resolved by real extraction — helper functions and sub-components, with a
DRY consolidation in `figures.ts` — not by suppression, and the gate script is unmodified. The render
smoke test is green at the same file/test count as attempt 1, so the fix broke nothing.

Pipeline may proceed to stage 5a. Attempt 1's FAIL is resolved at **attempt 2, phase 1**; phase-1
budget consumed: 2 of 3 (attempt 1 = FAIL, attempt 2 = PASS; no escalation, 1 attempt remaining).
`30-report.md` should carry `design-principles: PASS at attempt 2, phase 1`. The 20 WARNs and the five
notes above are review hints for the Architect — none is a stop.

## Telemetry (attempt 2)

One record appended to the repo-root `runs.jsonl` via
`bash .standards/scripts/record-gate-run.sh`:

- `specSlug: 007-four-page-story`, `gatesFailed: []`, `outcome: pass`, `durationSec: 227`,
  `loopCount: 1`, `phase1Retries: 1`, `phase2Retries: 0`, `runId: 30e5287e-627b-4da8-bc4b-4f26dab25092`,
  7 `warnings` entries.

**Tooling note (recorded, not a gate failure).** In a child repo the helper's `ROOT` resolves to
`.standards` (it is `dirname $BASH_SOURCE/..`), so a bare invocation appends to the tracked
`.standards/runs.jsonl` — in the standards submodule, not the child repo. The first attempt did
exactly that; I reverted the single appended line (`git -C .standards checkout -- runs.jsonl`,
submodule work tree clean again) and re-ran with `-f runs.jsonl` so the record landed in the child
repo's `runs.jsonl` (24 → 25 lines). No record was fabricated; the submodule carries no residue.
Worth a one-line fix in the helper (resolve `ROOT` from `git rev-parse --show-toplevel`) in a
follow-up, not here.

---

# Phase 2 — CI

- **Attempt:** 3 overall; **phase 2, round 1** (`SPEC_LOOP_COUNT=0`, `SPEC_PHASE1_RETRIES=2`, `SPEC_PHASE2_RETRIES=0`)
- **PR:** #20 — `feat(public): split the site into four pages across five locales (spec 007)`
- **Branch:** `spec/007-four-page-story`, head `b9e3ffb868c955d48c400afc7c191584824872de`
- **Verification window:** 2026-11-09T13:35:30Z → 2026-11-09T13:37:07Z (97 s wall clock)
- **Verdict: PASS** — all six checks reached a terminal state, none `fail`, none absent/unknown.

## Per-check status

| Check | Workflow | Bucket | State | Verdict |
|---|---|---|---|---|
| `frontend-ci / Lint & Format` | CI | `pass` | SUCCESS | **PASS** |
| `frontend-ci / Unit Tests` | CI | `pass` | SUCCESS | **PASS** |
| `frontend-ci / Build` | CI | `pass` | SUCCESS | **PASS** |
| `frontend-ci / Docker Build & Push` | CI | `skipping` | SKIPPED | **SKIP (by design)** |
| `Vercel` | — (Git integration status) | `pass` | SUCCESS | **PASS** |
| `Vercel Preview Comments` | — | `pass` | SUCCESS | **PASS** |

Parse rule: `bucket` from `gh pr checks`. `pending` is neither pass nor fail and was polled to
terminal before this verdict; `skipping` is terminal but is not a pass, so the docker job is
justified separately below rather than counted as green.

No check failed, so no `--log-failed` capture and no fix routing were required this round.

## Evidence: phase-2 pending-check polling

command: for i in $(seq 1 30); do OUT=$(gh pr checks 20 --json name,state,bucket 2>&1); PEND=$(printf '%s' "$OUT" | grep -c '"bucket":"pending"'); printf '%s poll=%s pending=%s %s\n' "$(date -u +%H:%M:%SZ)" "$i" "$PEND" "$OUT"; if [ "$PEND" -eq 0 ]; then break; fi; sleep 30; done
exit: 0
at: 2026-11-09T13:36:34Z

13:35:32Z poll=1 pending=1 [{"bucket":"pass","name":"Vercel Preview Comments","state":"SUCCESS"},{"bucket":"pending","name":"frontend-ci / Unit Tests","state":"IN_PROGRESS"},{"bucket":"pass","name":"frontend-ci / Lint & Format","state":"SUCCESS"},{"bucket":"pass","name":"Vercel","state":"SUCCESS"}]
13:36:03Z poll=2 pending=1 [{"bucket":"pending","name":"frontend-ci / Build","state":"IN_PROGRESS"},{"bucket":"pass","name":"Vercel Preview Comments","state":"SUCCESS"},{"bucket":"pass","name":"frontend-ci / Unit Tests","state":"SUCCESS"},{"bucket":"pass","name":"frontend-ci / Lint & Format","state":"SUCCESS"},{"bucket":"pass","name":"Vercel","state":"SUCCESS"}]
13:36:34Z poll=3 pending=0 [{"bucket":"skipping","name":"frontend-ci / Docker Build & Push","state":"SKIPPED"},{"bucket":"pass","name":"frontend-ci / Build","state":"SUCCESS"},{"bucket":"pass","name":"Vercel Preview Comments","state":"SUCCESS"},{"bucket":"pass","name":"frontend-ci / Unit Tests","state":"SUCCESS"},{"bucket":"pass","name":"frontend-ci / Lint & Format","state":"SUCCESS"},{"bucket":"pass","name":"Vercel","state":"SUCCESS"}]

## Evidence: phase-2 CI check status

command: gh pr checks 20 --json name,state,bucket,workflow
exit: 0
at: 2026-11-09T13:37:00Z

[{"bucket":"skipping","name":"frontend-ci / Docker Build & Push","state":"SKIPPED","workflow":"CI"},{"bucket":"pass","name":"frontend-ci / Build","state":"SUCCESS","workflow":"CI"},{"bucket":"pass","name":"Vercel Preview Comments","state":"SUCCESS","workflow":""},{"bucket":"pass","name":"frontend-ci / Unit Tests","state":"SUCCESS","workflow":"CI"},{"bucket":"pass","name":"frontend-ci / Lint & Format","state":"SUCCESS","workflow":"CI"},{"bucket":"pass","name":"Vercel","state":"SUCCESS","workflow":""}]

## Evidence: phase-2 PR head and check rollup

command: gh pr view 20 --json headRefOid,statusCheckRollup
exit: 0
at: 2026-11-09T13:36:41Z

{"headRefOid":"b9e3ffb868c955d48c400afc7c191584824872de","statusCheckRollup":[{"__typename":"CheckRun","completedAt":"2026-11-09T13:35:47Z","conclusion":"SUCCESS","detailsUrl":"https://github.com/RexiAI/pensions-system/actions/runs/42626708466/job/129192244776","name":"frontend-ci / Unit Tests","startedAt":"2026-11-09T13:34:57Z","status":"COMPLETED","workflowName":"CI"},{"__typename":"CheckRun","completedAt":"2026-11-09T13:35:19Z","conclusion":"SUCCESS","detailsUrl":"https://github.com/RexiAI/pensions-system/actions/runs/42626708466/job/129192244201","name":"frontend-ci / Lint & Format","startedAt":"2026-11-09T13:34:57Z","status":"COMPLETED","workflowName":"CI"},{"__typename":"CheckRun","completedAt":"2026-11-09T13:36:27Z","conclusion":"SUCCESS","detailsUrl":"https://github.com/RexiAI/pensions-system/actions/runs/42626708466/job/129192744788","name":"frontend-ci / Build","startedAt":"2026-11-09T13:35:49Z","status":"COMPLETED","workflowName":"CI"},{"__typename":"CheckRun","completedAt":"2026-11-09T13:36:27Z","conclusion":"SKIPPED","detailsUrl":"https://github.com/RexiAI/pensions-system/actions/runs/42626708466/job/129193083702","name":"frontend-ci / Docker Build & Push","startedAt":"2026-11-09T13:36:28Z","status":"COMPLETED","workflowName":"CI"},{"__typename":"StatusContext","context":"Vercel","startedAt":"2026-11-09T13:35:20Z","state":"SUCCESS","targetUrl":"https://vercel.com/danielbueno76-4270s-projects/pensions-system/GBV7CQMA5v9eB9KZTKQXVBCoxTGQ"},{"__typename":"CheckRun","completedAt":"2026-11-09T13:35:20Z","conclusion":"SUCCESS","detailsUrl":"https://vercel.com/github","name":"Vercel Preview Comments","startedAt":"2026-11-09T13:35:20Z","status":"COMPLETED","workflowName":""}]}

## Evidence: phase-2 workflow run conclusion

command: gh run view 42626708466 --json conclusion,event,headSha,createdAt,updatedAt
exit: 0
at: 2026-11-09T13:37:00Z

{"conclusion":"success","createdAt":"2026-11-09T13:34:48Z","event":"pull_request","headSha":"b9e3ffb868c955d48c400afc7c191584824872de","updatedAt":"2026-11-09T13:36:28Z"}

The run's `headSha` equals the PR's `headRefOid`, so every check in the rollup above belongs to the
commit under review — not to a stale superseded build.

## Evidence: phase-2 docker job skip justification

command: grep -n -B2 -A4 'deploy-on-main' .github/workflows/ci.yml; grep -n 'if:' .standards/.github/workflows/ci-nextjs.yml
exit: 0
at: 2026-11-09T13:37:00Z

.github/workflows/ci.yml:31:      # No Dockerfile in this repo, and GHCR_TOKEN is unset: the callee's docker
.github/workflows/ci.yml-32:      # job failed every run with "Password required". Deployment is Vercel via
.github/workflows/ci.yml-33:      # Git integration, so there is no image to build or push.
.github/workflows/ci.yml-34:      # Set to true only if a Dockerfile is added and GHCR_TOKEN is configured.
.github/workflows/ci.yml:35:      deploy-on-main: false
.github/workflows/ci-nextjs.yml:70:    if: github.event_name == 'push' && github.ref_name == github.event.repository.default_branch && inputs.deploy-on-main

`frontend-ci / Docker Build & Push` skips because the reusable workflow's `docker` job is gated on
`push` to the default branch **and** `deploy-on-main`, which this repo sets to `false` with a stated
reason (no Dockerfile; deployment is Vercel via Git integration). The skip is the documented
configuration, not a masked failure.

## Superseded run note

`gh run list --branch spec/007-four-page-story` also shows run `42626667355` (`conclusion: cancelled`,
25 s, `headSha: 8ab556e883e77870f1b81ff77a02748b1803d570`). That is an earlier push superseded before
the current head `b9e3ffb` — normal concurrency cancellation, not a red check. The authoritative run
for this verdict is `42626708466`, whose `headSha` matches.

## Out-of-scope observation (not a gate, not a stop)

`.standards/.github/workflows/ci-nextjs.yml` declares `build:` with `needs: [unit-test, lint]`, which
`docs/CODING_CONVENTIONS.md §CI Job Orchestration — Clean Feedback` names as an anti-pattern (a lint
failure can hide the build signal behind SKIPPED). The observation belongs to the standards submodule,
not to spec 007's diff; it is recorded here so it is not lost, and it is **not** counted against this
phase. Proposed follow-up: a separate standards-repo change.

## Verdict (phase 2, round 1)

**PASS.** All six PR checks reached terminal state with no `fail`. Four are `pass`; `Docker Build &
Push`
is `skipping` by documented configuration with no Dockerfile and Vercel deployment; both Vercel status
contexts are `SUCCESS`. Every check is attributable to head `b9e3ffb`.

Phase-2 budget: **1 of 3** rounds consumed (round 1 = PASS; no remediation round needed, 0 retries
used). No fix routed to the Coder or Refactorer. The pipeline may proceed to the post-CI stages
(stage 5c deploy verification / stage 5d archive) per the orchestrator.

## Telemetry (phase 2, round 1)

Appended via `bash .standards/scripts/record-gate-run.sh` with `SPEC_LOOP_COUNT=0
SPEC_PHASE1_RETRIES=2 SPEC_PHASE2_RETRIES=0`; record below.

## Quality gates

# 30-report.md — spec 007 four-page story

- **Stage:** 5a Mutation Runner
- **Branch:** `spec/007-four-page-story` (HEAD `95bf0f6`; base `main` = `1ced4c4`)
- **Conformance tier:** `production` (mutation testing applies)
- **Verifier verdict carried forward:** **PASS (scoped)** — attempt 2, phase 1; only the previously
  failing design-principles gate was re-run, and the other four checks keep their attempt-1 PASS
  evidence in `25-verification.md`. Stage 5a started only after that PASS.
- **Autopilot:** false
- **Verdict: GREEN** — scoped mutation score 96.28 % on covered code, 94.27 % with NoCoverage in the
  denominator (both above the 80 threshold). No survivor exposed a defect; every one was either a
  test gap (killed here) or an equivalent/unreachable mutant (named below). Final full suite green.

## Summary

| Check | Result |
|---|---|
| Mutation score — scoped, 18 files, covered code (362/376) | **96.28 %** |
| Mutation score — scoped, 18 files, NoCoverage included (362/384) | **94.27 %** |
| Threshold (`high: 80`, `low: 80`, `break: null` — unchanged) | **met** |
| Survivors before this stage | 75 (80.00 % covered / 78.13 % total) |
| Survivors killed by new tests | 61 of the 75, plus the one mutant previously recorded `Timeout` |
| Equivalent / unreachable survivors recorded | 14 |
| NoCoverage mutants recorded (not survivors) | 8 |
| Final full test suite (`npx vitest run`) | **PASS** — 130 files / 1153 tests, exit 0 |
| Stage-5a BLOCK | **none** |

### Scoped-run scope (statement of scope)

This is a **scoped** mutation run, not the whole-tree config. It was invoked with an explicit
`--mutate` list; the committed `stryker.config.mjs` and its thresholds were not modified. The 18
files (the spec-007 surface, identical to the pre-stage survey):

```
web/components/FigureStatusRow.tsx          web/components/public/MethodRegion.tsx
web/components/PublicPage.tsx               web/components/public/MetodoPage.tsx
web/components/public/CifrasPage.tsx        web/components/public/NumberStep.tsx
web/components/public/DebatePage.tsx        web/components/public/PageHeading.tsx
web/components/public/FiguresRegion.tsx     web/components/public/Pager.tsx
web/components/public/HistoriaPage.tsx      web/components/public/RegisterKey.tsx
web/components/public/MeaningStep.tsx       web/components/public/SiteFooter.tsx
web/components/public/StoryStrip.tsx        web/components/public/SiteHeader.tsx
web/components/render-public-page.tsx       web/seo/metadata.ts
```

Before → after, same 384 mutants:

| Status | Before | After |
|---|---|---|
| Killed | 299 | **362** |
| Survived | 75 | **14** |
| NoCoverage | 9 | **8** |
| Timeout | 1 | **0** |
| Errors | 0 | **0** |

## Survivors killed

New tests live in `tests/unit/spec-007-mutation-kills.test.ts` (17 tests), one block per mutant
cluster, asserted on rendered output. 61 of the 75 survivors were behavioural and are killed:

| File | Killed | What the tests now pin |
|---|---|---|
| `SiteHeader.tsx` | 31 | Page-nav labels/hrefs/`aria-current`, wordmark, both snapshot stamps (label + space + formatted date), index-panel locale names and hrefLang/`aria-current`, exactly one check glyph, theme-group legend and the three theme labels, the toggle's `aria-label`/`title`. Every content key is read from `content.t(...)`, not a hardcoded copy, and no cosmetic class name is asserted. |
| `SiteFooter.tsx` | 13 | Every declared source as a named link to its publisher URL, the licence, the five locale links with `hrefLang`, the claims/contact/canonical/snapshot lines with their labels and the single space after each colon. |
| `Pager.tsx` | 9 | Direction word + destination name per link, href per direction, first/last page carrying exactly one link, the nav's accessible name, and an unknown page kind rendering no link. |
| `FigureStatusRow.tsx` | 3 | Title anchor `href="#fig-07"`, `aria-labelledby="fig-07-title"` matching the title id, the definition label, and the method link target. (This also closes the Verifier's carry-forward note 1 — the method-link target was previously unasserted.) |
| `PublicPage.tsx` | 1 | A countdown series whose `availability` is not `computed` renders no clock even when a stale value is still attached. |
| `metadata.ts` | 1 | A sub-page with no committed year leads with its own page name (never an invented year); Historia with no year is the scope sentence alone. |
| `FiguresRegion.tsx` | 1 | `role="region"`/`aria-labelledby` appear only when the page `<h1>` id is supplied. |
| `MethodRegion.tsx` | 1 | An unavailable series carrying a stale value prints no provenance strip; a computed one does. |
| `MetodoPage.tsx` | 1 | The `<h1>` id and the method region's `aria-labelledby` are the same `page-title-metodo`. |

Two status changes outside the survivor list were also resolved by the new tests:

- `FigureStatusRow.tsx:31` (`'figure.withheld.reason'`) — the pre-stage report recorded this mutant
  as **Timeout**. The existing accessibility assertion used `row.includes(reason)`; an empty reason
  makes `includes('')` true, so it could not distinguish the mutant. The new withheld-state test
  asserts the exact `<p class="figure-row__reason">…</p>` text and kills it deterministically.
- `metadata.ts:71` (`'historia'` default for `languageAlternates`) — was **NoCoverage**; the new test
  calls the exported default and asserts the Historia alternate set, so it is now killed.

## Equivalent / unreachable mutants (named, with reasons)

These 14 mutants are genuinely un-killable without changing production code or asserting internal
state; each is named by its post-run location.

1. **`PublicPage.tsx:76:54`, `77:56`** — the `nullLabel=''` argument to `formatValue` for the
   mechanism claim's `first.ratio`/`latest.ratio`. `claimVariables` returns `{}` when the figure or
   either endpoint is null; otherwise the value comes from `dependencyRatio`, which throws on a zero
   denominator and returns a finite number. `formatValue` consults `nullLabel` only for `null`/`NaN`,
   neither reachable from valid derived data; no acceptance scenario supplies a malformed ratio.
2. **`PublicPage.tsx:95:12`** — default `series = []` mutated to `["Stryker was here!"]`. Only
   `findSeries` (matches `seriesId`), `countdownOf` (availability/value checks) and `ReproduceBlock`
   (filters by `availability`) read the default; a string matches none of them, so every consumer
   yields the same DOM as `[]`.
3. **`PublicPage.tsx:102:31`, `102:32`, `102:95`** — the single-country scope default. `ScopeMark`
   branches on `countries.length <= 1` and renders the name and coverage clause from
   `content.country`, never from an entry; entries are read only when length > 1, and then the
   `countries` prop is supplied and the default is unused. `[]`, `{}` and `'#'` therefore render
   identically.
4. **`MethodRegion.tsx:77:8`** — `sources.fuse === undefined ? null : <FusePrecision …>`. The
   child itself calls `fuseValueOf`, which returns `undefined` for `undefined`, so both branches
   render nothing. A redundant double guard.
5. **`NumberStep.tsx:37:69`** — `nullLabel=''` for `formatValue(reading.days, …)`. `NumberGroup`
   renders only when `measured` accepted the countdown, i.e. `readClock` reported not elapsed, so
   `days` is always a finite integer; the label is never consulted.
6. **`NumberStep.tsx:50:7` (whole condition), `50:7` (first conjunct), `50:7` (`||`→`&&`),
   `50:41` (second conjunct)** — `measured` is private and called only from `NumberBody` after the
   `state === 'not-crossed'` early return, so `state` is always `'computed'` (closed union). The only
   other guard input, `anchor === null`, is already handled by `readClock`: `Date.parse(null)` is
   non-finite, so the reading is `elapsed: true` and `measured` returns `undefined` with or without
   the guard. All four mutants are observationally identical for every input the caller/type permits.
7. **`metadata.ts:25:10`, `25:26`** — `scopedTitle`'s `countryName === ''` branch. `pageMetadata`
   reads the name from `contentRegistry`, whose `validateDocument` rejects a blank `countryName`
   (`country-record`), so the empty branch is unreachable through the public API and no scenario can
   construct it.

## NoCoverage mutants (recorded, not survivors)

The 8 NoCoverage mutants are outside the 75-survivor survey but affect the second score reading:

- **`NumberStep.tsx:36:49`** — the `?? ''` right operand in `NumberGroup`; `anchor` is non-null by
  construction whenever the group renders, so the operand is never evaluated (hence NoCoverage and
  genuinely unreachable).
- **`StoryStrip.tsx:54:35`** — the `?? ''` right operand in `ShareBlock`; rendered only when
  `anchoredCountdown` has already guaranteed `anchor !== null`.
- **`render-public-page.tsx` (6 mutants)** — the Next route adapter (`pageKind` default, `!props`
  branch and `notFound()` call). It is imported only by `app/**` route files, never by the test
  suite; exercising `notFound()` requires Next's request runtime. Same class as the `scripts/*.ts`
  entry points the Stryker config documents: an entry point with no in-process test import. The page
  itself is covered through `PublicPage`.

## Complexity summary (carried from the Refactorer, confirmed by the Verifier)

- **ESLint cyclomatic complexity ≤ 6:** `npm run lint` exit 0 (26-verification.md evidence,
  `2026-11-09T09:02:40Z`).
- **Design-principles gate:** PASS at attempt 2, phase 1 — 0 FAIL / 20 WARN at both the default and
  `--tier production` runs. The five attempt-1 `KISS_LINES` findings were resolved by extraction
  (`figures.ts` `joinSeries`, footer sub-components, header sub-components, FigureStatusRow head /
  definition extraction), not by suppression; the gate script is unmodified.
- The 20 WARNs remain review hints (one KISS `share-card.tsx` 23 lines, six DRY blocks, one god
  file, one commented-out code, three naming, eight null-discipline). None is a stop and none was
  introduced by this stage.

## Remediation record

Carried forward from `25-verification.md` (attempt headers and `§Verdict and remediation`); not
guessed:

| Phase | Gate | Attempt 1 | Attempt 2 | Resolution |
|---|---|---|---|---|
| 1 (pre-PR) | `design-principles` | **BLOCK** — 5 FAIL / 20 WARN | **PASS** — 0 FAIL / 20 WARN | Resolved at **attempt 2, phase 1**; phase-1 budget 2 of 3 used, 1 remaining, no escalation. |
| 1 (pre-PR) | Mutation Runner (this stage) | No BLOCK | — | No survivor exposed a defect; no fix-delegation cycle was needed. |
| 2 (post-PR) | CI | not started | — | — |

Stage 5a raised **no BLOCK**: every behavioural survivor was a test gap in the existing suite, fixed
by new assertions in the same change, and the two score readings are above threshold.

## Evidence: scoped mutation run

command: npx stryker run --mutate "web/components/FigureStatusRow.tsx,web/components/PublicPage.tsx,web/components/public/CifrasPage.tsx,web/components/public/DebatePage.tsx,web/components/public/FiguresRegion.tsx,web/components/public/HistoriaPage.tsx,web/components/public/MeaningStep.tsx,web/components/public/MethodRegion.tsx,web/components/public/MetodoPage.tsx,web/components/public/NumberStep.tsx,web/components/public/PageHeading.tsx,web/components/public/Pager.tsx,web/components/public/RegisterKey.tsx,web/components/public/SiteFooter.tsx,web/components/public/SiteHeader.tsx,web/components/public/StoryStrip.tsx,web/components/render-public-page.tsx,web/seo/metadata.ts"
exit: 0
at: 2026-11-09T11:29:07Z

```
Ran 69.08 tests per mutant on average.
-------------------------|------------------|----------|-----------|------------|----------|----------|
                         | % Mutation score |          |           |            |          |          |
File                     |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                |  94.27 |   96.28 |      362 |         0 |         14 |        8 |        0 |
 components              |  94.01 |   96.32 |      314 |         0 |         12 |        8 |        0 |
  public                 |  96.69 |   97.50 |      234 |         0 |          6 |        2 |        0 |
   CifrasPage.tsx        | 100.00 |  100.00 |        1 |         0 |          0 |        0 |        0 |
   DebatePage.tsx        | 100.00 |  100.00 |        1 |         0 |          0 |        0 |        0 |
   FiguresRegion.tsx     | 100.00 |  100.00 |       29 |         0 |          0 |        0 |        0 |
   HistoriaPage.tsx      | 100.00 |  100.00 |        1 |         0 |          0 |        0 |        0 |
   MeaningStep.tsx       | 100.00 |  100.00 |        4 |         0 |          0 |        0 |        0 |
   MethodRegion.tsx      |  96.15 |   96.15 |       25 |         0 |          1 |        0 |        0 |
   MetodoPage.tsx        | 100.00 |  100.00 |        3 |         0 |          0 |        0 |        0 |
   NumberStep.tsx        |  85.00 |   87.18 |       34 |         0 |          5 |        1 |        0 |
   PageHeading.tsx       | 100.00 |  100.00 |        1 |         0 |          0 |        0 |        0 |
   Pager.tsx             | 100.00 |  100.00 |       24 |         0 |          0 |        0 |        0 |
   RegisterKey.tsx       | 100.00 |  100.00 |        5 |         0 |          0 |        0 |        0 |
   SiteFooter.tsx        | 100.00 |  100.00 |       19 |         0 |          0 |        0 |        0 |
   SiteHeader.tsx        | 100.00 |  100.00 |       51 |         0 |          0 |        0 |        0 |
   StoryStrip.tsx        |  97.30 |  100.00 |       36 |         0 |          0 |        1 |        0 |
  FigureStatusRow.tsx    | 100.00 |  100.00 |       20 |         0 |          0 |        0 |        0 |
  PublicPage.tsx         |  90.91 |   90.91 |       60 |         0 |          6 |        0 |        0 |
  render-public-page.tsx |   0.00 |    0.00 |        0 |         0 |          0 |        6 |        0 |
 seo                     |  96.00 |   96.00 |       48 |         0 |          2 |        0 |        0 |
  metadata.ts            |  96.00 |   96.00 |       48 |         0 |          2 |        0 |        0 |
-------------------------|--------|---------|----------|-----------|------------|----------|----------|
```

Score readings from the same run: covered `362 / (362 + 14) = 96.28 %`; with NoCoverage in the
denominator `362 / 384 = 94.27 %`. The pre-stage report at `reports/mutation/mutation.json`
(superseded by this run; a copy is in `/tmp/opencode/mutation-spec007-before.json` for the session)
read 299 Killed / 75 Survived / 9 NoCoverage / 1 Timeout = 80.00 % covered, 78.13 % total.

## Evidence: final full test suite

command: npx vitest run
exit: 0
at: 2026-11-09T11:40:04Z

```

 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  130 passed (130)
      Tests  1153 passed (1153)
   Start at  12:40:05
   Duration  61.77s (tests 88%, import 9%, transform 1%, environment 1%)
```

The suite grew from 129 files / 1136 tests (Verifier attempt 2) to 130 files / 1153 tests: the new
`tests/unit/spec-007-mutation-kills.test.ts` contributes 17 tests and no existing test changed. No
test was skipped, todoed, or disabled.

## Evidence: design-principles re-check (new test file included)

command: bash .standards/scripts/check-code-principles.sh -BaseRef main
exit: 0
at: 2026-11-09T11:42:46Z

```
---------------------------------------------
✔ Design-principles check: 0 FAIL(s), 20 WARN(s).
  WARNs are review hints — verify each before merging.
```

Re-run after adding `tests/unit/spec-007-mutation-kills.test.ts`: still the same 20 WARNs as the
Verifier's attempt 2, no new FAIL and no new WARN, so the mutation-kill tests did not regress the
design gate. `npm run typecheck` (`tsc --noEmit`) also exits 0.

## Evidence: new test file

command: npx vitest run tests/unit/spec-007-mutation-kills.test.ts
exit: 0
at: 2026-11-09T11:29:02Z

```
 Test Files  1 passed (1)
      Tests  17 passed (17)
```

## Working tree and hand-off

- Uncommitted by design: this stage writes tests and this report only. No commit, no push, no PR.
- Pre-existing unrelated working-tree changes (the operator's dirty tree, `runs.jsonl`, the two
  root screenshots, the out-of-scope branch commits and the `.standards` pointer bump) were left
  untouched, as recorded in `25-verification.md`.
- Stage 5b (PR Opener) precondition: `30-report.md` is present and GREEN; mutation score is above
  the unchanged threshold. The `PR:` line is appended by the PR Opener.

## Evidence: pull request (stage 5b)

PR: https://github.com/RexiAI/pensions-system/pull/20
commits: 17
branch: spec/007-four-page-story
base: main
at: 2026-11-09T13:34:33Z

The PR is a draft. 17 commits = 13 spec-007 commits (12 task commits plus the T1
`public-page-props` follow-up) + the docs/ledger commit + the 3 commits that predate spec 007
(`04273aa`, `95bf0f6`, `7f39ba2`). Audit-trail gate (`check-audit-trail.sh 007-four-page-story`,
no `--require-deploy`) exited 0 before the first commit. The spec folder is not archived here —
stage 5d owns the archive.

## 15-design.md

# Design Spec: 007-four-page-story

Surface note: visible work is Tasks 1 to 9. Tasks 10, 11 and 12 carry no visual
surface and are listed under `## Out-of-scope tasks`.

## Design Read

Reading this as: a public-information dossier for a sceptical general reader in five
locales, with an editorial-instrument language (neutral measured ground, hairline
rules, zero radius, one oxblood accent spent on a single numeral), leaning toward the
existing native-CSS token system preserved rather than redesigned: this spec splits a
document, it does not restyle one.

## Dial Values

- DESIGN_VARIANCE: 3. Match the existing system, do not raise it. This is the
  trust-first / public-sector row of the inference table, not the marketing-site row.
  The page's authority comes from one axis, one measure (`--measure`, 64ch) and one
  hairline family. Split-screen, asymmetric frames or a new grid language would read
  as a different site across a four-page set that a reader crosses in one sitting.
- MOTION_INTENSITY: 1. The row suggests 2 to 3, and the redesign-preserve preset adds
  one. Both are declined here, deliberately: every page is a static document load, and
  the only state change this spec introduces is `aria-current` moving between four
  links. Motion on that change would make a keyboard user wait for a focus ring, which
  is a Doherty defect, and the site currently ships zero transitions. Claimed motion
  that is not shown is a pre-flight failure; shown motion here would be worse.
- VISUAL_DENSITY: 4. Unchanged. The split lowers per-page density (Historia goes from
  eight regions to two), so there is no reason to move it up. Cifras is the densest
  page at seven plates and is still read as one column of plates, not a cockpit.

## Design System / Foundation

No component library and no install. The foundation is the project's own token layer
(`web/styles/tokens.css`) plus `web/styles/globals.css`, kept as the single source of
truth. Aesthetic labelled honestly: **editorial instrument / public-information
dossier** (spec 001 revisions, spec 004 and spec 006). This spec adds classes to that
system; it does not introduce a second one and does not restyle existing regions.

Rules that bind the new surfaces:

- One accent (`--accent`, oxblood), already reserved by spec 006 T9 to the day numeral
  and to focus rings. This spec adds **zero** new accent consumers. The active nav
  state and the pager are neutral (ink weight and hairlines), never accent.
- One corner-radius system: sharp (`--radius: 0`). The pager is not a card and takes
  no radius, no background and no shadow.
- One icon set: the existing six-glyph inline `Icon` component. This spec adds **no**
  glyph, so no hand-rolled path is invented. Pager direction is carried by position
  and by the localized direction word, not by an arrow.

## Global Tokens

- Font: `--font-sans` Instrument Sans (UI, labels), `--font-mono` IBM Plex Mono
  (numerals, URLs, ISO stamps), `--font-serif` EB Garamond (editorial prose, already
  declared and already justified by the publication aesthetic). No new family.
- Accent color: `#7a1f2b` oxblood (light), `#e3929a` (dark). Consumers unchanged:
  day numeral plus focus rings. No new pair, so no new contrast measurement.
- Neutral base: the measured neutral ramp `--surface-1/2/3` and `--ink-1/2/3`
  (light `#fbfbfa` to `#1a1a18`, dark `#121211`). Warm-neutral, one family, no second
  grey family anywhere in the four pages.
- Corner-radius system: sharp. `--radius: 0`, applied to every new element.
- Theme: auto (system preference) with the existing three-state control. Every new
  surface inherits the token layer, so both themes are defined by construction; no
  page, band or region inverts mid-document.
- Icon library: none. The existing `Icon` set (six glyphs) is the whole icon surface.

Three new tokens, each with a named consumer and its own check. No other declarations
are added, and nothing is declared that no rule resolves.

| Token | Value | Consumer | Check |
|---|---|---|---|
| `--nav-active-rule` | `2px` | the active page's bar in the header nav and the index panel | measured thickness of the indicator is exactly 2px |
| `--pager-gap` | `var(--space-6)` | the separation between the previous and next links | measured gap is 32px, so a mis-tap cannot cross pages |
| `--page-head-gap` | `var(--space-5)` | the space between a sub-page's `<h1>` and its first region | measured gap is 24px, the proximity rule that makes the title and its region one unit |

## Design Laws

| Task | Law | Applies to | Concrete consequence | How a reviewer checks it |
|---|---|---|---|---|
| 6 | Fitts's | header nav, index panel, locale cells, theme control | every header target is at least 44×44 CSS px; the nav links reach 44 on both axes by padding, not by their text box; adjacent page links stay at least `--space-4` (16px) apart, so a mis-tap cannot land on the neighbouring page | Playwright `getBoundingClientRect` on every `.site-header__nav a`, `.index-panel__anchors a`, `.locale-group__cell`, `.site-header__theme` at 320 / 768 / 1024 / 1280; assert `min(width, height) >= 44` and `gap >= 16` |
| 7 | Fitts's | previous/next pager | each pager link is at least 44px tall and at least 45% of the content column wide, so nearly the whole half-row is the target; the two links are separated by `--pager-gap` (32px), which is the largest gap on the page and is spent on the one pair where a wrong click costs a page jump | measure `.pager__link` boxes and the gap between them at 390 and 1280; assert height `>= 44`, width `>= 0.45 × column`, gap `>= 24px` |
| 1 | Hick's | route depth | the URL never offers a fifth path: one optional locale segment plus one optional page segment, never a nested tree, so there is no level below a page to descend into | assert every entry of `PUBLIC_ROUTE_PATHS` matches `^/([a-z]{2})?(/(cifras|metodo|debate))?$` and the list has 20 entries |
| 6 | Hick's | first paint of the header | exactly four page choices are visible at 1024px and above, and the mobile disclosure reveals the same four and nothing else; no sub-nav, no "more" item, no dropdown, no breadcrumb trail | count `<a>` inside `<header nav>` per locale (4); count `.index-panel__anchors a` (4); assert no `.site-header__nav` element contains a nested list |
| 2, 3, 4, 5 | Miller's | page composition | no page carries more than four content regions (Historia 2, Cifras 1, Método 4, Debate 3), and Método's four are grouped 2 + 2 by one band hairline (method + source strip, then reproduce + ledger) so they read as two chunks, not four flat ones | DOM assertion per page on the region markers; visual check that Método has exactly one band separator and no new heading was added to create it |
| 6 | Jakob's | navigation pattern | the header nav plus an end-of-page previous/next pair is the documentation/guide convention, kept in the same place, same shape and same order as the four pages; no novel gesture, no swipe-only path, no animated page transition; switching locale from a sub-page is expected to keep the reader on that page (additive: confirm at the human gate, see Task 1) | keyboard-only walk of all 20 routes with Tab and Enter and JavaScript disabled; when the additive locale rule is adopted, switch locale on `/cifras` and assert arrival on the same page name, not Historia |
| 6, 7 | Doherty | navigation feedback | nothing is fetched before content and nothing gates on hydration, so no skeleton and no spinner exist; focus and active states paint in the same frame, with `transition-duration: 0s` on nav and pager links, so a keyboard user never waits for the ring | served HTML contains every link with JS off; computed `transition-duration` on `.site-header__nav a`, `.pager__link` and their `:focus-visible` states is `0s` |
| 7 | Tesler's | the path through the sequence | the reader is never asked where they are or what moved: each page states position three ways (its `<h1>`, `aria-current` in the nav, the named destinations in the pager), and no page describes the old single-document structure | zero `href="#figuras"`, `href="#metodo"`, `href="#debate"`, `href="#lectura"` in the rendered HTML of all 20 routes; no visible "above" / "below" / "moved" copy in any locale |
| 2, 3, 4, 5, 7 | Gestalt (proximity, common region) | each page reads as one unit | the page title and its first region share one column and one axis, separated by `--page-head-gap` and by no hairline, so they group; the pager closes the page with one hairline and no card; the shared header is the common region that makes four documents read as one site | visual check at 320 and 1280; the pager's inline edges equal the content column's; exactly one hairline above the pager |
| 2, 8 | Gestalt (Prägnanz) | step 1's centre axis | the kicker joins the `<h1>` and the sentence on the same centre axis; an off-axis label above a centred headline reads as a floating element, so the axis is inherited, not re-decided | measure the ink centre x of `.hero__kicker`, `.hero__title`, `.step--number .step__sentence` at 390 and 1280 in `fr`; max delta 1px |
| 6 | Serial Position | nav order | Historia is first and Debate last, and the order never changes per locale or by alphabet; the conclusion is the page the sequence ends on, and the entry point is the page it starts from | assert the nav label order in every locale equals Historia, Cifras, Método, Debate, which is the pager sequence |
| 7 | Serial Position | pager slots | the first page renders no previous element and the last renders no next element; the missing slot is absent from the DOM, never an empty box that reads as a broken link | DOM assertion: no `.pager__link--prev` on Historia, no `.pager__link--next` on Debate, and no `.pager__link` with empty text |
| 7 | Goal-Gradient | the forward affordance | exactly one forward link per page end, always naming its destination, so the remaining journey is one named step away; position is carried by the four labelled nav items, never by a numeral counter | count forward pager links per page (1); assert the rendered HTML contains no `n / 4`-shaped progress text and no page-of-page content key |
| 5 | Peak-End | the last page of the sequence | the sequence ends on Debate, the thesis is the last region in it, and the pager is the last element inside `<main>` on every page, so the last thing read is the conclusion rather than a widget | DOM order assertion on Debate (agreement < dispute < thesis < pager) and `.pager` is the final child of `<main>` on all four pages |
| 8 | Von Restorff | one distinct element per page | the kicker is differentiated by type and `--ink-2` only: no badge, no rule, no background, no accent, no icon; exactly one element on Historia is allowed to be the page's distinct mark (the day numeral), and the kicker must not compete with it | computed-style scan of the built page: no element outside the day numeral and the focus rings resolves `color`/`background` to `--accent`; the kicker's computed `background` is transparent and it has no border |

**Deliberate violations** (reason + compensating control):

- **Eyebrow count, skill §4.7 (max one per three sections).** Historia carries five
  uppercase step labels plus the new kicker: a mechanical count of six small labels
  against a budget of two. Reason: the step labels are the sections' `<h2>`s, not
  labels sitting above someone else's headline. Removing them leaves five unlabelled
  sections, breaks the heading-order contract and orphans `aria-labelledby` on each
  step. Compensating control: exactly one true eyebrow exists per page (the kicker on
  Historia, in sentence case at `--text-meta`, none on the three sub-pages); the step
  labels stay uppercase at `--text-micro` and `--ink-3`, the quietest step on the
  ladder, and each sits directly above its own content rather than above a headline.
  Reviewer check: count elements that precede an `<h1>` or `<h2>` (1 per page); the
  remaining small labels are the step headings themselves and are expected.
- **Premium-consumer palette ban, skill §4.2 (beige + brass + oxblood + espresso).**
  The accent is oxblood `#7a1f2b`. Reason: this is not a premium-consumer brief. The
  palette is a published public-information system (spec 006 T9) whose grounds are
  measured neutral at CIELCh chroma <= 10, whose text is a near-black at `#1a1a18`,
  and whose accent is one chromatic value spent on one numeral. There is no cream
  (`#fbfbfa` is a measured near-white, not `#f5f1ea`) and no brass. Compensating
  control: one accent, one consumer, both themes already pinned by the existing
  contrast tests, and this spec adds no accent pair and no warm-metallic value.
- **Hero stack discipline, skill §4.7 (max four text elements).** Step 1 renders five:
  kicker, headline, step label, numeral, sentence. Reason: the numeral is the content,
  not decoration; this is the page whose entire claim is a measured number, and the
  step label is a structural heading, not a tagline. Compensating control: no tagline,
  no trust strip, no secondary CTA and no micro-meta inside step 1; the two small
  labels are separated by proximity rather than stacked (the kicker is bound to the
  headline above it, the step label is bound to the numeral below it) and are
  differentiated by size and ink (`--text-meta` / `--ink-2` against `--text-micro` /
  `--ink-3`). Reviewer check: no additional text node exists in step 1 beyond those
  five, and the two labels differ in both computed font-size and computed colour.

**Judged inapplicable for this spec** (so omissions are visible):

- Parkinson's Law: no task here has a time budget the interface can compress. The
  reader sets their own pace in a static document, and manufacturing urgency on a
  public-information page would falsify the editorial claim.
- Flow: flow needs a repeated interaction loop to sustain. This is a reading surface
  with one navigation decision per page; the equivalent concern is carried by Miller's
  chunking and by Doherty's instant feedback, not by a pacing device.
- Zeigarnik: deliberately excluded. Manufacturing an unfinished-task feeling across
  four pages is a dark pattern on a civic page. Progress is carried by `aria-current`
  and a named next page, never by an incomplete badge or a checklist.
- Aesthetic-Usability: excluded as a decision input. It is the argument that polish
  excuses a usability defect, and it never is one here: a 43px target is fixed, not
  made prettier.
- Pareto and Occam: no measurable 80/20 or simplicity trade-off is at stake in a
  navigation split. There is one honest decomposition and it is fixed by the operator.
- Choice Overload: subsumed by Hick's four-item limit. Listing it separately would
  duplicate one consequence and inflate the table.
- Serial Position on the Cifras plate list: no application. Plate order is data order
  (`FIGURE_IDS`), and adding emphasis to the first or last plate would editorialise a
  measurement, so position carries no added weight by design.
- Fitts's on the kicker and the page titles: not interactive, so no target consequence
  exists. Naming them would be decoration.

## Per-Task Directives

### Task 1: Four-page route model

- Layout: no new visual surface. The URL is the reader's second position cue, so its
  shape is a design decision: one optional locale segment, one optional page segment,
  nothing deeper.
- Components: `PUBLIC_ROUTE_PATHS` and `publicPathFor` stay the single place a path is
  spelled; the locale switch resolves the current page kind rather than always the
  locale root.
- Typography: n/a.
- Motion: static.
- A11y: the skipped-link target `#main` exists on all 20 routes; no route renders a
  different document shell.
- Design-law consequences: Hick's (route depth, one path segment), Jakob's (the locale
  switch is a rail switch, convention says it keeps your place).
- Anti-patterns to avoid: a path that nests a page under a region; a localized slug per
  locale (it breaks the one-slug-one-page reading of the hreflang group); a locale cell
  that silently sends the reader home.
- Watch items (Coder must check): **this is additive and is not written in
  `10-tasks.md`** (Task 6 only requires the locale cells to keep `aria-current`). A
  reader on `/cifras` who switches to `en` should land on `/en/cifras`. Confirm or
  defer at the human gate; do not implement it silently as if a scenario demanded it.
  If adopted, the locale cell's `href` becomes the current page in the target locale and
  the cell keeps `hrefLang` and `aria-current`.

### Task 2: Historia (home) page

- Layout: Editorial Manifesto Hero for step 1 (large type, no asset, almost-poster),
  then hairline-separated steps on one axis, then a two-slot seam (method link at the
  inline start, share row at the inline end), then the pager as the page's close.
- Components: `PublicStory` (unchanged), `TopStepSection` (unchanged), `StoryStrip`
  (secondary CTA retargeted to the Método page), new `.hero__kicker` inside step 1's
  `lead`, new `.pager` at the end of `<main>`.
- Typography: `<h1>` stays at `--text-display` with its current budget; the kicker at
  `--text-meta` in `--font-label` with `--tracking-label`, sentence case (never
  uppercase: the strings are clauses, and uppercase German or French clauses at 13px
  are harder to read and would make the kicker and the step label the same object);
  the step label stays `--text-micro` uppercase. Kicker margin-bottom `--space-3`, so
  kicker plus headline read as one block and the step label groups with the numeral.
- Motion: static.
- A11y: the kicker is a `<p>`, not an `<h1>` and not an `<h2>`, with no `aria-label`
  duplicating its own text; it renders **inside** the step-1 `<section>`, immediately
  before the `<h1>`, so nothing exists above the story (the AC-004-01..03 condition
  keeps holding); heading order stays `h1` then the step `h2`s; contrast is the
  existing label pair (`--ink-3` on `--surface-1`), already pinned.
- Design-law consequences: Gestalt (proximity: kicker to headline, step label to
  numeral; Prägnanz: one centre axis), Von Restorff (one distinct element per page),
  Miller's (two regions, not eight).
- Anti-patterns to avoid: a second eyebrow above the `<h1>`; a breadcrumb; a "page 1 of
  4" counter; a scroll cue; a hover or transition animation on the seam; duplicating
  the `<h1>` string in the kicker; a share row that describes Historia while the link
  points elsewhere.
- Watch items (Coder must check): adding one ~22px line above the `<h1>` pushes step 1
  down. Measure the `<h1>` and the day numeral at 390×844 in all five locales and
  confirm the numeral is still wholly above the fold; the last measured clearance in
  `tokens.css` was over 300px, so this should hold, but it must be measured, not
  assumed. The kicker must also not be counted as the `<h1>` by the
  `HERO_STATEMENT_BUDGETS` check; the budget applies to `hero.statement` only and the
  kicker is a separate key.

### Task 3: Cifras page

- Layout: page head (h1) then a single-axis column of seven plates; each plate keeps
  its existing internal composition, readout above plot, caption and facts below.
- Components: page head wrapper, `FiguresRegion` without its own region heading.
- Typography: the `<h1>` takes the existing `.region__heading` declaration set
  (`--text-h2`, `--leading-snug`, `--ink-1`, `margin: 0`), promoted to `<h1>`. The
  display step of the ladder stays reserved for Historia's statement; a sub-page title
  is a signpost, not a claim, and the largest type on Cifras is legitimately a figure
  numeral, which is data rather than type.
- Motion: static.
- A11y: exactly one `<h1>`; the page name appears once, so `FiguresRegion` must not
  re-render a near-duplicate `<h2>` above `#figuras` (`region__heading` prints
  `nav.figures` today); where the heading is suppressed, the region keeps its
  accessible name from the `<h1>` (`aria-labelledby`) rather than losing one.
  Unavailable figures keep their existing state treatment byte for byte.
- Design-law consequences: Miller's (one region), Gestalt (title and first plate are
  one unit), Serial Position (data order only, no emphasis added by position).
- Anti-patterns to avoid: a hero-sized `<h1>` on a list page; a "seven figures" count
  label; a featured or highlighted first plate; `FIG. 01` markers restyled as section
  numbering (they cite a real figure id and are already correct).
- Watch items (Coder must check): the plate headers are not headings today. Do not
  invent an `<h2>` level for them in this spec; heading order must remain monotonic
  with what already exists, and adding a level is a separate semantic change.

### Task 4: Método page

- Layout: page head (h1), then four regions in two bands: instrument (method region +
  source strip), then reproduction (reproduce panel + assumptions ledger). One
  hairline between the bands, no heading added to create them.
- Components: page head wrapper, `MethodRegion` (region heading suppressed, its
  `#metodo` id kept), `SourceStrip`, `ReproduceBlock`, `AssumptionsLedger`.
- Typography: `<h1>` as Task 3. The method region's own `<h2>` (`method__heading`) is
  the duplicate case: the page is named Método, so the region takes the `<h1>` as its
  name and prints no second heading. Sub-headings inside the regions are unchanged.
- Motion: static.
- A11y: `#metodo` resolves on this page and `aria-labelledby` points at the `<h1>`;
  one `<h1>`; the four regions keep their existing landmarks and labels; no in-page
  `href="#..."` points at an absent id.
- Design-law consequences: Miller's (four regions chunked 2 + 2), Gestalt (one column,
  one band rule), Tesler's (the reader is not told "this used to be below the fold").
- Anti-patterns to avoid: four flat regions of equal visual weight; a "method" tab or
  accordion that hides the calculation behind a click (this page exists so the
  calculation is *not* hidden); a disclosure that needs JavaScript; a second heading
  restating the page name.
- Watch items (Coder must check): the band hairline is a new separation. It must not
  introduce a new content key or a visible label; if it reads as two pages instead of
  two halves, remove the hairline rather than adding a heading. The source strip's move
  from the old page must not also move its id if any assertion references it.

### Task 5: Debate page

- Layout: page head (h1), then three register bands in fixed order: agreement
  (`--ground-consensus`), dispute (`--ground-dispute` with the top and bottom hairlines
  it already has), thesis (`--ground-thesis` with its 4px ink rule at the inline
  start). The shared 4px register rule is what makes three grounds read as one family.
- Components: page head wrapper, `AgreementSection`, `DisputeSection` inside
  `#debate`, `ThesisSection` inside `#lectura`, then the pager.
- Typography: `<h1>` as Task 3; the three register labels stay `--text-micro`
  uppercase, since they name positions (agreement, dispute, reading) and are the page's
  own map.
- Motion: static.
- A11y: two anchors (`#debate`, `#lectura`) both resolve here; `data-register` appears
  once per register; one `<h1>`; the register prose keep their `--measure`.
- Design-law consequences: Peak-End (the sequence ends on the thesis), Gestalt (common
  region via the shared register rule), Jakob's (agreement then dispute is the order a
  reader expects a debate to take).
- Anti-patterns to avoid: reordering dispute above agreement for drama; a verdict badge
  or a "conclusion" callout on the thesis (the thesis is already the last register and
  carries the strongest ground); a tab set that shows one register at a time.
- Watch items (Coder must check): three different grounds in sequence is the point, but
  on dark theme the three surfaces must stay distinguishable and a reviewer must confirm
  the hairline between dispute and thesis is not lost against `--surface-3`.

### Task 6: Persistent header navigation

- Layout: one row at 1024px and above: wordmark, four page links, snapshot stamp, five
  locale cells, theme control. Below 1024px the existing `<details>` index panel is the
  whole navigation (already shipped, already JS-free), opened by the existing caret
  trigger at 44×44.
- Components: `SiteHeader` (nav anchors become page links), `IndexPanel` (same four,
  plus the active page marked), `LocaleCells`, `ThemeToggle` unchanged.
- Typography: nav labels at `--text-meta` (unchanged). The active page adds weight 600
  and a 2px `--ink-1` bar beneath the label, drawn as an `::after` inset so the row's
  64px height does not move. No uppercase, no dot, no pill.
- Motion: static. No transition on hover, active or focus.
- A11y: `aria-current="page"` on exactly one page link and, separately, on one locale
  cell; active state is not colour alone (weight plus the rule, so it survives
  monochrome and both themes); reduced-motion safe by construction, since the row
  declares no transition and no animation, so `prefers-reduced-motion` has nothing to
  suppress and any future transition must be wrapped before it is added; focus uses
  `--focus` with `--focus-offset` outside the link box.
- Design-law consequences: Fitts's (44×44 and 16px separation), Hick's (four, never
  five), Serial Position (fixed order), Von Restorff (the active bar is neutral and
  2px, so it does not compete with the day numeral), Doherty (instant state).
- Anti-patterns to avoid: a fifth "more" item; a hamburger on desktop; a dropdown
  submenu; an accent-coloured active tab (the accent is already spent); moving the
  locale cells into the nav group (they are a separate rail and keep their own group
  label); a sticky header that grows taller than 64px because the active bar was drawn
  in flow.
- Watch items (Coder must check): the four page labels are longer than today's four
  anchor labels in some locales. Measure the header at 1024px in `de` and `fr` and
  confirm the nav stays on one line with the stamp, five locale cells and the theme
  control still inside the row; if it wraps, the fix is the row's gap, not shrinking
  the type below `--text-meta`. Second: `10-tasks.md` requires the theme toggle to
  "still function without JavaScript". Today it cycles via a client component, so it
  renders without JS but does not toggle. That clause describes the existing control,
  not a new CSS-only control; do not rebuild it in this spec, and raise the wording at
  the human gate if the Verifier reads it as a new requirement.

### Task 7: Previous/next pager

- Layout: a two-cell row at 768px and above, previous at the inline start and next at
  the inline end, one hairline above, `--space-8` below the previous block; a single
  column below 768px with previous above next (DOM order preserved). Not a card: no
  background, no radius, no shadow.
- Components: new `.pager`, `.pager__link`, `.pager__link--prev`, `.pager__link--next`,
  `.pager__direction`, `.pager__destination`.
- Typography: direction word at `--text-micro` in `--font-label`, `--ink-3`, sentence
  case; destination page name at `--text-body` weight 600 in `--ink-1`, underlined by
  default (the site's existing text-link affordance, so the target is never colour-only).
  Two lines per link, no third line, no arrow glyph.
- Motion: static.
- A11y: each link is one `<a>` whose accessible name is direction plus destination
  (no separate `aria-label` duplicating visible text); min height 44; the absent slot
  on the first and last page is absent from the DOM; reduced-motion safe for the same
  reason as the header, because the pager declares no transition and no animation.
- Design-law consequences: Fitts's (45%-of-column targets, 32px gap), Tesler's (position
  is stated, never remembered), Serial Position (no empty placeholder), Goal-Gradient
  (exactly one forward link, named).
- Anti-patterns to avoid: a numeric counter or a dot-indicator carousel; chevrons or
  arrows; "back to top"; a next link that repeats the page the reader is on; naming the
  destination by its region ("the figures") instead of its page ("Cifras").
- Watch items (Coder must check): on Historia the story strip's method link and the
  pager's next link both move forward, to different pages. They must read as different
  things: strip link is an underlined text link inside the seam, the pager is a hairline
  row 32px or more below it, with the destination in 600 weight. If a reviewer cannot
  tell them apart at a glance, increase the separation rather than restyling the strip.
  The share row must not migrate into the pager.

### Task 8: Title formula + kicker

- Layout: the kicker is the first line of step 1, above the `<h1>`, inside the same
  centred axis.
- Components: `.hero__kicker` (new), `pageMetadata` (leading string only; the
  `... · wordmark · country` suffix and its two separators are unchanged, so the title
  keeps the shape it has today).
- Typography: kicker at `--text-meta`, `--font-label`, `--tracking-label`, `--ink-2`,
  sentence case, `max-inline-size: var(--measure)`, margin-bottom `--space-3`. Use of
  `--ink-2` rather than `--ink-3` is what keeps it from reading as a second step label
  (the step labels are `--ink-3` at `--text-micro`). Sub-page titles keep the same
  formula with the page name as the leading string.
- Motion: static.
- A11y: the kicker is a `<p>` with no heading role and no duplicate `aria-label`; the
  `<title>` is the only place the promise framing is announced outside the page, and it
  is per route.
- Design-law consequences: Von Restorff (type and colour only, no badge), Gestalt
  (proximity binds it to the headline, not to the step label).
- Anti-patterns to avoid: uppercase (shouting, and it erases the kicker/step-label
  distinction); a rule, a box, a tag or a pill around it; a second eyebrow; a
  `<title>` that adds a third separator or a second year; inventing a year-free kicker
  (it has none, by design).
- Watch items (Coder must check): the kicker is longer than the `<h1>` in `de` and
  `fr`; at 390px it may wrap to two lines. That is allowed (it is prose, not a label
  budget), but it must not exceed `--measure` and must not push the numeral below the
  fold. Also: the kicker must not be inserted above the `<section>`; it belongs inside
  step 1, or it breaks the "nothing above the story" condition.

### Task 9: Per-page SEO

- Layout: no visual surface. The one visible consequence is the browser tab and the
  shared card, and they are deliberately not symmetrical.
- Components: `pageMetadata` per route, `alternateLinks` per page, sitemap unchanged in
  shape (20 entries).
- Typography: none. The visible `<h1>` carries the page name only; the year, the
  wordmark and the country live in the `<title>` and in the footer's citation line,
  never as a visible strip under the heading.
- Motion: static.
- A11y: `og:image:alt` stays the home card's alt text in every locale, so a card
  announced to a screen-reader user still describes what the image shows.
- Design-law consequences: Jakob's (one card, one canonical, the convention a reader
  already expects from a shared link), Tesler's (the reader is never asked to
  reconstruct which page a preview belongs to).
- Anti-patterns to avoid: a per-page share card (the task forbids it, and four cards
  would drift); a visible year or country strip under each `<h1>` to match the title;
  a share affordance on Cifras, Método or Debate (the preview would describe Historia
  while the link points elsewhere, which is a mislabelled share), so the share row
  stays only on Historia where the card is accurate.
- Watch items (Coder must check): confirm no sub-page renders a share row by accident
  through a shared page shell. If the reviewer wants sharing on the thesis page, that
  is a new card decision, not a layout tweak.

## Out-of-scope tasks

- **Task 10 (content keys + locale parity).** No visual surface. It is the mechanism
  the visible tasks depend on: the kicker, the four page names, the four sub-page title
  strings and the pager's direction words must all come from content keys, so no
  component in the directives above may hold a literal. The design adds no string of
  its own; every visible string in this spec is either an existing key or the operator's
  verbatim copy from `00-informal.md`.
- **Task 11 (plain-language gate scope).** No visual surface. The gate scans the
  Historia story; the design's only involvement is that the kicker is new copy in that
  region's neighbourhood and is fixed by the operator, not authored here.
- **Task 12 (supersession declaration).** No visual surface. Its bookkeeping decides
  which existing assertions stop applying, which is why this spec deliberately states
  the two conditions that keep the surviving ones true: the kicker inside step 1, and
  the numeral still above the fold.

## 40-deploy.md

# 40-deploy — spec 007-four-page-story

Stage 5c (Deploy Verifier), phase 3. PR #20 (`RexiAI/pensions-system`), branch
`spec/007-four-page-story`, PR head `b9e3ffb868c955d48c400afc7c191584824872de`.

| Field | Value |
|---|---|
| Repo classification | frontend (Next.js 16.4.3, connected Vercel Git integration) |
| Deploy URL (immutable) | https://pensions-system-nybfufawv-danielbueno76-4270s-projects.vercel.app |
| Deploy URL (branch alias) | https://pensions-system-git-spec-00-26e8a2-danielbueno76-4270s-projects.vercel.app |
| Deployment id | `dpl_GBV7CQMA5v9eB9KZTKQXVBCoxTGQ` (target `preview`, readyState `READY`) |
| Commit identity | build log: `Cloning github.com/RexiAI/pensions-system (Branch: spec/007-four-page-story, Commit: b9e3ffb)` — matches PR head |
| Build status | **pass** |
| Health check status | **pass** — 20/20 routes, HTTP 200, one `<h1>`, four nav entries each |
| E2E verdict | **skip** — the repo defines no live-URL E2E lane (reason and absence evidence below) |
| Phase-3 attempt | **1 of 3** (phase-3 counter is independent of phase 1 and phase 2) |
| Timestamp | 2026-11-09T13:46:00Z |
| Overall | `Verdict: PASS` |

Phase-3 ordering requirement was satisfied before this round started: `25-verification.md`
carries the phase-2 post-PR CI PASS (round 1, head `b9e3ffb`) and `30-report.md` is
GREEN (scoped mutation 96.28 %). The Vercel Git integration built the preview; no
`vercel deploy` / `vercel deploy --prod` was run at any point in this stage.

## Evidence: deployment identity (PR head → deployment)

command: gh api repos/RexiAI/pensions-system/commits/b9e3ffb/statuses --jq '.[] | {context, state, target_url, created_at}'
exit: 0
at: 2026-11-09T13:44:55Z

```
{"context":"Vercel","created_at":"2026-11-09T13:35:20Z","state":"success","target_url":"https://vercel.com/danielbueno76-4270s-projects/pensions-system/GBV7CQMA5v9eB9KZTKQXVBCoxTGQ"}
{"context":"Vercel","created_at":"2026-11-09T13:34:44Z","state":"pending","target_url":"https://vercel.com/danielbueno76-4270s-projects/pensions-system/GBV7CQMA5v9eB9KZTKQXVBCoxTGQ"}
```

The `Vercel` commit status is attached to the PR head SHA `b9e3ffb` itself, and its
`target_url` names deployment `GBV7CQMA5v9eB9KZTKQXVBCoxTGQ`. The parent commit
`8ab556e` carries a **different** status pointing at a **different** deployment
(`98AacYgaYjEDJ9CQXmE7mAvUPW8c`), so the two commits are not sharing one build.

## Evidence: deployment readiness and alias binding

command: vercel inspect https://pensions-system-nybfufawv-danielbueno76-4270s-projects.vercel.app --json
exit: 0
at: 2026-11-09T13:44:55Z

```
id          dpl_GBV7CQMA5v9eB9KZTKQXVBCoxTGQ
url         pensions-system-nybfufawv-danielbueno76-4270s-projects.vercel.app
target      preview
readyState  READY
createdAt   1794231284351   (= 2026-11-09T13:34:44.351Z, the pending status stamp above)
aliases     ['pensions-system-git-spec-00-26e8a2-danielbueno76-4270s-projects.vercel.app']
contextName danielbueno76-4270s-projects
```

The branch alias is bound to this deployment, not to a newer one: the alias appears in
this deployment's `aliases` list.

## Evidence: build status (build log, commit line and completion)

command: vercel inspect --logs https://pensions-system-nybfufawv-danielbueno76-4270s-projects.vercel.app
exit: 0
at: 2026-11-09T13:45:07Z

```
2026-11-09T13:34:47.267Z  Cloning github.com/RexiAI/pensions-system (Branch: spec/007-four-page-story, Commit: b9e3ffb)
2026-11-09T13:34:48.088Z  Warning: Failed to fetch one or more git submodules
2026-11-09T13:34:49.019Z  Warning: Due to "engines": { "node": ">=22" } in your `package.json` file, the Node.js Version defined in your Project Settings ("24.x") will not apply, Node.js Version "26.x" will be used instead.
2026-11-09T13:35:12.070Z  Turbopack build encountered 3 warnings:
2026-11-09T13:35:12.070Z  Warning: Dynamic filesystem access causes tracing of the whole project
2026-11-09T13:35:12.766Z  Build Completed in /vercel/output [24s]
2026-11-09T13:35:12.787Z  Deploying outputs...
2026-11-09T13:35:19.596Z  Deployment completed
status	● Ready
```

No `BUILD_FAILED`, no error-classified Vercel code — warnings only, listed under §Notes.
This is the `githubCommitSha` identity check the stage requires: the deployment that
served every request below was built from `b9e3ffb`, which is the PR head.

## Evidence: health check (20 routes, five locales)

command: python3 /tmp/opencode/deploy-health-007.py https://pensions-system-nybfufawv-danielbueno76-4270s-projects.vercel.app
exit: 0
at: 2026-11-09T13:45:02Z

Per route the script asserts: HTTP 200; exactly one `<h1>`; the `<h1>` text equals the
locale's expected page name (`nav.figures` / `nav.method` / `nav.debate`) or, on the home
route, `hero.statement`; all four nav page names present; no rendered error marker
(`Application error`, `Internal Server Error`, `__next_error__`, `This page could not be
found`) outside the React flight `<script>` payload.

```
BASE=https://pensions-system-nybfufawv-danielbueno76-4270s-projects.vercel.app
at=2026-11-09T13:45:02Z
route                  loc  code  h1s  status detail
/                      es   200   1    PASS
/cifras                es   200   1    PASS
/metodo                es   200   1    PASS
/debate                es   200   1    PASS
/en                    en   200   1    PASS
/en/cifras             en   200   1    PASS
/en/metodo             en   200   1    PASS
/en/debate             en   200   1    PASS
/fr                    fr   200   1    PASS
/fr/cifras             fr   200   1    PASS
/fr/metodo             fr   200   1    PASS
/fr/debate             fr   200   1    PASS
/de                    de   200   1    PASS
/de/cifras             de   200   1    PASS
/de/metodo             de   200   1    PASS
/de/debate             de   200   1    PASS
/it                    it   200   1    PASS
/it/cifras             it   200   1    PASS
/it/metodo             it   200   1    PASS
/it/debate             it   200   1    PASS

routes checked: 20
failures: 0
```

## Evidence: alias serves the same build as the immutable URL

command: curl -sS -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" <url>/cifras | sha256sum
exit: 0
at: 2026-11-09T13:45:05Z

```
https://pensions-system-nybfufawv-danielbueno76-4270s-projects.vercel.app/cifras sha256=0dde52fb02b33d93de574ae886281a71a2b6c10435177091de370bc0f34bdf1c
https://pensions-system-nybfufawv-danielbueno76-4270s-projects.vercel.app/ status=200
https://pensions-system-git-spec-00-26e8a2-danielbueno76-4270s-projects.vercel.app/cifras sha256=0dde52fb02b33d93de574ae886281a71a2b6c10435177091de370bc0f34bdf1c
https://pensions-system-git-spec-00-26e8a2-danielbueno76-4270s-projects.vercel.app/ status=200
```

Byte-identical HTML on the alias and on the immutable deployment URL: the alias is not
serving a stale build. (A 200 from the wrong commit would be a failure; this rules it out
by content, on top of the `b9e3ffb` build-log line above.)

## Evidence: browser render and console errors (real Chromium, 20 routes)

command: npx tsx /tmp/opencode/console-check.mts https://pensions-system-nybfufawv-danielbueno76-4270s-projects.vercel.app
exit: 0
at: 2026-11-09T13:45:49Z

Driven by the repo's own CDP helper (`tests/helpers/chromium.ts`, `/usr/bin/google-chrome`,
headless), hydration included; `consoleErrors` collects `error` events, `unhandledrejection`
events and `console.error` calls.

```
{"path":"/","status":"PASS","title":"Sistema de pensiones: la promesa que no se sostiene · 2042 · pensiones · España","h1Count":1,"h1":"Los días de tu España que envejece","navLinks":9,"consoleErrors":[]}
{"path":"/cifras","status":"PASS","title":"Cifras · 2042 · pensiones · España","h1Count":1,"h1":"Cifras","navLinks":10,"consoleErrors":[]}
{"path":"/metodo","status":"PASS","title":"Método · 2042 · pensiones · España","h1Count":1,"h1":"Método","navLinks":10,"consoleErrors":[]}
{"path":"/debate","status":"PASS","title":"Debate · 2042 · pensiones · España","h1Count":1,"h1":"Debate","navLinks":9,"consoleErrors":[]}
{"path":"/en","status":"PASS","title":"Pension system: the promise that does not hold · 2042 · pensiones · Spain","h1Count":1,"h1":"Countdown for Spain as its population ages","navLinks":9,"consoleErrors":[]}
{"path":"/en/cifras","status":"PASS","title":"Figures · 2042 · pensiones · Spain","h1Count":1,"h1":"Figures","navLinks":10,"consoleErrors":[]}
{"path":"/en/metodo","status":"PASS","title":"Method · 2042 · pensiones · Spain","h1Count":1,"h1":"Method","navLinks":10,"consoleErrors":[]}
{"path":"/en/debate","status":"PASS","title":"The debate · 2042 · pensiones · Spain","h1Count":1,"h1":"Debate","navLinks":9,"consoleErrors":[]}
{"path":"/fr","status":"PASS","title":"Système de retraites : la promesse qui ne tient pas · 2042 · pensiones · Espagne","h1Count":1,"h1":"Le compte à rebours de la population âgée en Espagne","navLinks":9,"consoleErrors":[]}
{"path":"/fr/cifras","status":"PASS","title":"Chiffres · 2042 · pensiones · Espagne","h1Count":1,"h1":"Chiffres","navLinks":10,"consoleErrors":[]}
{"path":"/fr/metodo","status":"PASS","title":"Méthode · 2042 · pensiones · Espagne","h1Count":1,"h1":"Méthode","navLinks":10,"consoleErrors":[]}
{"path":"/fr/debate","status":"PASS","title":"Le débat · 2042 · pensiones · Espagne","h1Count":1,"h1":"Débat","navLinks":9,"consoleErrors":[]}
{"path":"/de","status":"PASS","title":"Rentensystem: das Versprechen, das nicht trägt · 2042 · pensiones · Spanien","h1Count":1,"h1":"Der Countdown für ein alterndes Spanien","navLinks":9,"consoleErrors":[]}
{"path":"/de/cifras","status":"PASS","title":"Zahlen · 2042 · pensiones · Spanien","h1Count":1,"h1":"Zahlen","navLinks":10,"consoleErrors":[]}
{"path":"/de/metodo","status":"PASS","title":"Methode · 2042 · pensiones · Spanien","h1Count":1,"h1":"Methode","navLinks":10,"consoleErrors":[]}
{"path":"/de/debate","status":"PASS","title":"Die Debatte · 2042 · pensiones · Spanien","h1Count":1,"h1":"Debatte","navLinks":9,"consoleErrors":[]}
{"path":"/it","status":"PASS","title":"Sistema pensionistico: la promessa che non regge · 2042 · pensiones · Spagna","h1Count":1,"h1":"Conto alla rovescia della Spagna anziana","navLinks":9,"consoleErrors":[]}
{"path":"/it/cifras","status":"PASS","title":"Cifre · 2042 · pensiones · Spagna","h1Count":1,"h1":"Cifre","navLinks":10,"consoleErrors":[]}
{"path":"/it/metodo","status":"PASS","title":"Metodo · 2042 · pensiones · Spagna","h1Count":1,"h1":"Metodo","navLinks":10,"consoleErrors":[]}
{"path":"/it/debate","status":"PASS","title":"Il dibattito · 2042 · pensiones · Spagna","h1Count":1,"h1":"Dibattito","navLinks":9,"consoleErrors":[]}
failures=0
```

## E2E verdict: skip — recorded reason

**Skip reason:** this repo defines no E2E lane that can be pointed at a live URL. Its
acceptance and unit tests run under `vitest run` against fixtures and a **locally booted**
served app (`tests/helpers/served-app.ts` → `startServedApp()`); there is no Playwright,
Cypress, or Maestro dependency or config, no `e2e/` / `tests/e2e/` / `__e2e__/` /
`.maestro/` directory, and no CI job that drives a remote origin. Inventing a command to
point `vitest` at the preview would run a local-build harness against a different origin
and prove nothing, so no E2E command was invented and none was run. The only live-URL hook
in the suite is `PRODUCTION_URL` inside AC-006-35 (`tests/acceptance/spec-006-canonical-share.test.ts`),
which is scoped to production canonical-origin equality, not to preview E2E.

Live behaviour is covered instead by the two health blocks above (HTTP-level across all 20
routes, and a real Chromium render with console-error capture across the same 20 routes).

## Evidence: no E2E lane present (absence)

command: ls -d e2e tests/e2e __e2e__ .maestro playwright.config.ts playwright.config.js cypress.config.ts ; grep -n '"e2e"\|playwright\|maestro\|cypress' package.json ; grep -inE "e2e|playwright|cypress|maestro" .github/workflows/ci.yml .standards/.github/workflows/ci-nextjs.yml
exit: 2 / 1 / 1 (each search found nothing — that is the recorded result)
at: 2026-11-09T13:46:04Z

```
ls: cannot access 'e2e': No such file or directory
ls: cannot access 'tests/e2e': No such file or directory
ls: cannot access '__e2e__': No such file or directory
ls: cannot access '.maestro': No such file or directory
ls: cannot access 'playwright.config.ts': No such file or directory
ls: cannot access 'playwright.config.js': No such file or directory
ls: cannot access 'cypress.config.ts': No such file or directory
ls_exit=2
grep_pkg_exit=1
grep_wf_exit=1
4:  workflow_call:
32:  contents: read
33:  packages: write
36:  group: ${{ github.workflow }}-${{ github.ref }}
37:  cancel-in-progress: true
40:  unit-test:
54:  lint:
69:  build:
84:  docker:
```

`.standards/.github/workflows/ci-nextjs.yml` (pinned by `ci.yml`) declares exactly four
jobs — `unit-test`, `lint`, `build`, `docker` — and none is an E2E lane.

## Notes (recorded, not defects)

- **Preview deployment protection.** Preview deployments on
  `danielbueno76-4270s-projects/pensions-system` are behind Vercel Authentication: an
  anonymous request to both the alias and the immutable URL answers `302` →
  `https://vercel.com/sso-api?...` (`x-vercel-sso-nonce` cookie, `x-robots-tag: noindex`).
  Every read above therefore sent the project's documented automation bypass header,
  `x-vercel-protection-bypass`, sourced from the gitignored per-machine
  `config/agent.local.env`. The value is never printed or committed. A CI lane that repeats
  this stage headlessly needs the same secret as a CI secret; without it, the health check
  cannot reach the app at all.
- **`VERCEL_TOKEN` is absent** and was not needed: the deployment was resolved from the
  `Vercel` commit status attached to the PR head, confirmed by `vercel inspect` on the
  operator session and by the `Commit: b9e3ffb` line in the deployment's own build log.
  This is a note about headless/CI reproducibility only, not a configuration defect and not
  a reason to skip the stage.
- **Build warnings, no errors.** `Failed to fetch one or more git submodules` (the build ran
  without `.standards` checked out; the app does not import it), the Node `engines: >=22` →
  `26.x` note, three Turbopack `Dynamic filesystem access causes tracing of the whole
  project` warnings, and `npm warn` lines about `cache-dir` / an `esbuild` install script.
  None is code-diagnostic and none blocked the build.
- **`h1`/nav assertions are content-derived, not spec-derived.** Expected page names and the
  home `<h1>` come from the shipping locale dictionaries (`web/content/data/ES/{es,en,fr,de,it}.json`,
  keys `nav.*` and `hero.statement`), matching how `PageHeading.tsx` and `NumberStep.tsx`
  render them.
- **Working tree.** Pre-existing dirty paths at the time this stage ran: `specs/007-four-page-story/25-verification.md`
  (phase-2 evidence from the previous stage), `runs.jsonl` (append-only ledger), the
  `.standards` submodule pointer, and untracked `live-005-top.png` / `live-006box.png` (both
  recorded as out of scope in `25-verification.md`). This stage touched none of them; it
  wrote only this file plus its own `runs.jsonl` record, and committed and pushed nothing.

## Budget

Phase-3 attempt **1 of 3**, resolved on this attempt. Phase-3 budget not exhausted:
`Phase-3 budget exhausted` is not in force, and stage 5d may proceed.

Verdict: PASS

## 45-decisions.md

Condition: Pipeline mode for /home/dbueno/projects/pensions-system/specs/007-four-page-story
Options: lite, full
Chosen: full
Why: classifier: 21 named path(s) include '/sitemap.xml', outside docs/, specs/, *.md and scripts/
Reversibility: append a new entry with an explicit lite or full token
At: 2026-11-09T08:15:16Z


---

## Supersession record (preserved from the pre-existing one-pager)

The public dossier split from one long document into four pages — Historia, Cifras, Método,
Debate — in five locales (20 static routes), with a persistent header nav and a previous/next
pager. This one-pager records the supersession disposition every affected single-page scenario
received, per `specs/007-four-page-story/10-tasks.md` §Task 12.

## Re-pointed in place (the ID stays cited; the test renders the page that owns the region)

| ID | Old single-page assertion | New home |
|----|---------------------------|----------|
| AC-004-01, AC-004-02, AC-004-03, AC-004-05 | five-step contract + "nothing above/before the story" | Historia (unchanged substance) |
| AC-004-08, AC-005-04 | one `<h1>` in step 1 | Historia |
| AC-004-33, AC-004-34, AC-004-35 | method precision + register key in `#metodo` | Método |
| AC-004-36 | every in-page `#metodo` reference resolves | Método owns `#metodo`; header/pager links are page hrefs |
| AC-004-43, AC-004-52 | figure plates live in `#figuras` | Cifras |
| AC-005-28, AC-005-29, AC-005-30, AC-005-31 | register occurrence/order after `#debate` | Debate (order still agreement → dispute → thesis) |
| AC-002-31 … AC-002-35 | CTA hierarchy; `#figuras`/`#metodo` href targets | hrefs become `/cifras` and `/metodo` |
| AC-003-34, AC-003-35, AC-003-36, AC-003-37, AC-003-38 | title/og carry the year + scope suffix; year-free fallback | title content is the promise framing; invariants unchanged |
| AC-001-52, AC-006-34, AC-006-35 | alternates + sitemap + one origin | 20 routes, per-page alternates, one origin |
| AC-006-07 … AC-006-14 | above-the-fold target set, type scale, one accent, `aria-current` | per-page; nav targets become page links |

## Superseded (the ID joins `SUPERSEDED_SCENARIOS`; its assertion is replaced by an AC-007-* scenario)

| ID | Superseded assertion | Replaced by |
|----|----------------------|-------------|
| AC-004-04 | the fifth step precedes `#figuras`, `#figuras` non-empty | AC-007-05 / AC-007-08 (Historia ends at the story; Cifras owns `#figuras`) |
| AC-004-37 | the method region is below the fold, after the fifth step | AC-007-09 (Método is its own page) |
| AC-004-25 | step-5 CTA → `#figuras` | AC-007-06 / AC-007-08 (Cifras page link; Cifras owns `#figuras`) |
| AC-004-28 | strip → `#metodo` | AC-007-07 / AC-007-09 (Método page link; Método owns precision) |
| AC-004-32 | "below the fold" precision | AC-007-09 (Método owns precision) |

No scenario ID is left dangling: the traceability gate reads this record's disposition and the
tests that own each ID.

---

## Revision 1 — operator title claim (2026-11-09)

The operator revised spec 007 after the archive and explicitly overrode the earlier CMO
recommendation. The original ask declined the literal "Estafa piramidal" because it failed
AC-005-21's thesis-vocabulary boundary in all five locales and contradicted the thesis body's
published sentence. That disposition is superseded by this revision for exactly two content
keys.

**Operator instruction (verbatim intent):** authorize the thesis vocabulary in the tab title
and the kicker. This is a deliberate, recorded exception to AC-005-21 / AC-007-17, limited to
`meta.title` (the home page title) and `kicker.mechanism`.

**Authorized copy, five locales:**

| Locale | `meta.title` | `kicker.mechanism` |
|---|---|---|
| es | `Sistema de pensiones: Estafa piramidal · {year}` | `Estafa piramidal` |
| en | `Pension system: Pyramid scam · {year}` | `Pyramid scam` |
| de | `Rentensystem: Schneeball-Betrug · {year}` | `Schneeball-Betrug` |
| fr | `Système de retraites : Fraude pyramidale · {year}` | `Fraude pyramidale` |
| it | `Sistema pensionistico: Frode piramidale · {year}` | `Frode piramidale` |

`{year}` stays in `meta.title` because AC-003-34 requires the derived year in the title and
`og:title`.

**Scope.** Exactly two content keys (`meta.title`, `kicker.mechanism`) in exactly five locales.
Everything else keeps the original boundary: the agreement and dispute registers carry no
thesis term, the sub-page titles carry no thesis term, and the thesis register remains the only
place the site makes the claim in prose. `web/content/registers.ts` exports
`THESIS_CLAIM_KEYS = ['kicker.mechanism', 'meta.title']` and `isThesisClaimLocation`; only
those locations are skipped by `hitsInStrings`. The exemption is a location allowlist, not a
relaxation of `THESIS_TERMS` or of any gate.

**Risk accepted.** The operator accepted the legal and editorial risk of placing the claim in
the title and kicker. The thesis body's published sentence "No es una acusación ni una
predicción" now contradicts the title. The contradiction is flagged here, not edited: the
thesis copy is unchanged.

**Scenario revision.**

- AC-007-17 (same ID) is rewritten: every locale's title and kicker must contain at least one
  `THESIS_TERMS` entry; `thesisVocabularyOutsideThesis` must still return `[]` because the
  exemption covers exactly those two keys; the agreement-section HTML must still contain no
  thesis term.
- AC-005-21 is unchanged as a scenario and still passes: its assertion reads
  `thesisVocabularyOutsideThesis`, which now applies the two-key exemption. Its separate
  agreement-section assertion is untouched.
- AC-007-14 and AC-007-15 keep their IDs and assertions; their expected strings are the revised
  copy above.

---

## Revision 1 — verification (2026-11-09)

- **Attempt:** revision 1, phase 1 — scoped re-verification of the operator-authorized post-archive revision (`SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=2`, `SPEC_PHASE2_RETRIES=1`). This is a revision verification; it does not add a phase-1 attempt to the earlier count.
- **Branch:** `spec/007-four-page-story` (HEAD `cda4c79`; base ref `main`).
- **Declared surface:** `web/content/data/ES/{es,en,de,fr,it}.json`, `web/content/registers.ts`, `web/content/keys.ts`, `tests/acceptance/AC-007-08-title-kicker.test.ts`, `docs/changes/007-four-page-story.md`.
- **Actual working tree:** the surface above plus pre-existing drift — `.standards` pointer `5de28c9 → 78d2adc` (submodule work tree clean) and untracked `live-005-top.png` / `live-006box.png`.
- **Verification window:** 2026-11-09T13:57:02Z → 2026-11-09T14:02:20Z.
- **Verdict: PASS** — every gate ran to completion and exited 0; no FAIL, no BLOCK, no tooling failure. The findings below are carried notes, not gate failures. Nothing blocks the push.

### Result

| # | Check | Verdict | Exit |
|---|---|---|---|
| 1 | Scenario traceability (`.standards` script + repo 3-digit gate) | **PASS** | 0 / 0 |
| 2 | Full test suite (130 files / 1153 tests) | **PASS** | 0 |
| 3 | Complexity gate (ESLint, 335 files, 0 errors / 0 warnings) | **PASS** | 0 |
| 3.5 | Design-principles gate (`-BaseRef main`) | **PASS** — 0 FAIL / 23 WARN | 0 |
| 4 | Scenario-to-behaviour spot check (AC-007-14/15/17) | **PASS** | n/a |
| 5 | No unaccounted behaviour | findings recorded, not a stop | n/a |
| — | Typecheck + build gates (`tsc`, `prebuild`, `build`, `sitemap:check`) | **PASS** | 0 |

### Revision checks

1. **Served HTML carries the claim, exact per locale.** Built (`next build`) and served (`next start -p 3077`, `curl`) HTML:
   - `es` — `<title>Sistema de pensiones: Estafa piramidal · 2042 · pensiones · España</title>`, `<p class="hero__kicker">Estafa piramidal</p>`
   - `en` — `Pension system: Pyramid scam · 2042 · pensiones · Spain` / `Pyramid scam`
   - `de` — `Rentensystem: Schneeball-Betrug · 2042 · pensiones · Spanien` / `Schneeball-Betrug`
   - `fr` — `Système de retraites : Fraude pyramidale · 2042 · pensiones · Espagne` / `Fraude pyramidale`
   - `it` — `Sistema pensionistico: Frode piramidale · 2042 · pensiones · Spagna` / `Frode piramidale`

   In all five, the `hero__kicker` node precedes `<h1>` in document order, and `og:title` equals the `<title>` (`es` verified verbatim). The year is the committed threshold year (`committedThresholdYear()` = 2042), not a literal.
2. **Exemption is exactly two keys.** `THESIS_CLAIM_KEYS` = `['kicker.mechanism', 'meta.title']`. `thesisVocabularyOutsideThesis` is empty in all five locales; replaying the pre-revision rule (no exemption) yields 14 hits, **all 14** in those two keys and **0** anywhere else. The exemption is a location allowlist; `THESIS_TERMS` and every gate are unchanged.
3. **AC-007-17 rewritten, ID preserved.** The test now asserts the claim is *present* in the title and kicker, that the key list is exactly the two authorized keys, that `thesisVocabularyOutsideThesis` is empty, and that the rendered `AgreementSection` carries no thesis term. The agreement-section boundary assertion is untouched. No other test file changed. One assertion shape moved: the old explicit loop over the three composed sub-page titles is now covered indirectly by the `local.strings` sweep (the `meta.*.title` keys are in it) — coverage retained, explicitness reduced. The yearless-title test gained an assertion (strengthened, not weakened).
4. **Carried risk confirmed.** The thesis body still reads "No es una acusación ni una predicción" (es), "neither an accusation nor a forecast" (en), "weder Anklage noch Prognose" (de), "Ce n'est ni une accusation ni une prévision" (fr), "Non è un'accusa né una previsione" (it) — now contradicted by the title. Recorded as an operator-accepted risk, not a defect; the thesis copy is unchanged, as instructed.

### Notes carried to the Architect (not gate findings)

1. **`.standards` pointer moved again.** HEAD records `5de28c9`; the work tree is at `78d2adc` (v1.7.0-190-g78d2adc), clean. This is outside the declared revision surface. `check-code-principles.sh` and `check-scenario-traceability.sh` are byte-identical between the two commits, so no gate behaviour changed. Must not be swept into the revision commit.
2. **Design-principles WARNs 20 → 23.** The three extra WARNs are pre-existing `return null` sites in `web/content/registers.ts` (lines 125, 143, 145). Under `-BaseRef` blame scoping a finding in a *touched* file is always WARN; the revision touches that file for the first time, so its pre-existing debt surfaces. No new code produces a finding; still 0 FAIL.
3. **Stale archived heading.** Line 460 still reads "AC-007-17 — the promise title and kicker stay inside the thesis-vocabulary boundary", which the revision supersedes. The revision section above is the current disposition; the heading was left untouched (this verification writes only this section).
4. **Untracked screenshots** `live-005-top.png` / `live-006box.png` remain, unchanged in character from earlier attempts.
5. **Hash helper anomaly.** `test-run-reuse.sh --print-hash` prints `fatal: Unable to hash .standards` and exits 128, yet emits a stable hash. Not a gate; the hash is recorded below. The stderr is in the shared submodule, not in this repo's diff.

## Evidence: scenario traceability

command: bash .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-11-09T13:57:02Z

[note: specs/ is archived at this HEAD, so the script has no spec folder to trace and returns an empty clean result. The live traceability gate is scripts/check-scenario-traceability-3digit.ts, exercised in the prebuild block below (389 scenarios, all cited, all citations resolve).]

{
  "checks": [1, 2],
  "passes": [],
  "fails": []
}

## Evidence: full test suite

command: bash .standards/scripts/agent-test-summary.sh --run /tmp/opencode/verify007/vitest.log -- npx vitest run
exit: 0
at: 2026-11-09T13:57:20Z
Test-run hash: a6f76247599536c2f6d8f9debcd0699e61365ad6db15eb3b276a77dc2cb8feae

SUMMARY: mode=run exit=0 signal=0 log_lines=12 log=/tmp/opencode/verify007/vitest.log

 Test Files  130 passed (130)
      Tests  1153 passed (1153)
   Start at  14:57:21
   Duration  46.77s (tests 91%, import 7%, transform 1%, environment 1%)

    Isolate  130 workers spawned · ~217ms startup each (spawn + environment, per file)
             at least ~2.34s faster with isolate: false — reuses workers across files instead of one per file


## Evidence: complexity gate

command: npx eslint .
exit: 0
at: 2026-11-09T13:57:04Z

(no output — no lint error and no lint warning)

## Evidence: complexity gate (scope)

command: npx eslint . --format json 2>/dev/null | python3 -c "import json,sys; d=json.load(sys.stdin); print('files:', len(d)); print('errors:', sum(x['errorCount'] for x in d)); print('warnings:', sum(x['warningCount'] for x in d))"
exit: 0
at: 2026-11-09T14:01:54Z

files: 335
errors: 0
warnings: 0

## Evidence: design-principles gate

command: bash .standards/scripts/check-code-principles.sh -BaseRef main --json
exit: 0
at: 2026-11-09T13:58:10Z

{
  "tier": "mvp",
  "gates": ["complexity", "dry", "yagni", "solid", "component-per-file", "property-tests", "comments", "naming", "null-discipline"],
  "fails": [],
  "warns": [{ "message": "Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23", "file": "./web/seo/share-card.tsx", "line": "41" }, { "message": "Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:10): return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /const { locale } = await params; /export function generateStaticParams() {", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "10" }, { "message": "Possible duplication (4x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:9): export function generateStaticParams() { /return NON_DEFAULT_LOCALES.map((locale) => ({ locale })); /export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> { /export const dynamic = 'force-static';", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "9" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:1): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /import type { Metadata } from 'next';", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "1" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:2): import { renderPublicPage } from '../../../../web/components/render-public-page'; /import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /import type { Metadata } from 'next';", "file": "./app/(public)/(home)/cifras/page.tsx", "line": "2" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/[locale]/cifras/page.tsx:3): import { metadataFor } from '../../../../web/seo/metadata'; /import { NON_DEFAULT_LOCALES } from '../../../../web/content/types'; /export const dynamic = 'force-static'; /import { renderPublicPage } from '../../../../web/components/render-public-page';", "file": "./app/(public)/[locale]/cifras/page.tsx", "line": "3" }, { "message": "Possible duplication (3x identical 4-line block, first at ./app/(public)/(home)/cifras/page.tsx:4): import { metadataFor } from '../../../../web/seo/metadata'; /export const dynamic = 'force-static'; /export function generateMetadata(): Metadata { /import { renderPublicPage } from '../../../../web/components/render-public-page';", "file": "./app/(public)/(home)/cifras/page.tsx", "line": "4" }, { "message": "SRP: possible god file (node) — ./web/content/keys.ts: 446 lines, 0 methods (split by responsibility)", "file": "./web/content/keys.ts", "line": "" }, { "message": "Comments: commented-out code (./scripts/check-sitemap.ts:20)", "file": "./scripts/check-sitemap.ts", "line": "20" }, { "message": "Naming: noise word in type name (PublicPageData) (./web/components/PublicPage.tsx:19)", "file": "./web/components/PublicPage.tsx", "line": "19" }, { "message": "Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)", "file": "./web/components/public/NumberStep.tsx", "line": "37" }, { "message": "Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:310)", "file": "./web/ingest/run-compute.ts", "line": "310" }, { "message": "Null-discipline: return null (./scripts/check-sitemap.ts:177)", "file": "./scripts/check-sitemap.ts", "line": "177" }, { "message": "Null-discipline: return null (./web/ingest/run-compute.ts:287)", "file": "./web/ingest/run-compute.ts", "line": "287" }, { "message": "Null-discipline: return null (./web/seo/share-card.tsx:108)", "file": "./web/seo/share-card.tsx", "line": "108" }, { "message": "Null-discipline: return null (./web/content/registers.ts:125)", "file": "./web/content/registers.ts", "line": "125" }, { "message": "Null-discipline: return null (./web/content/registers.ts:143)", "file": "./web/content/registers.ts", "line": "143" }, { "message": "Null-discipline: return null (./web/content/registers.ts:145)", "file": "./web/content/registers.ts", "line": "145" }, { "message": "Null-discipline: return null (./web/components/public-page-props.ts:54)", "file": "./web/components/public-page-props.ts", "line": "54" }, { "message": "Null-discipline: return null (./web/components/public-page-props.ts:57)", "file": "./web/components/public-page-props.ts", "line": "57" }, { "message": "Null-discipline: return null (./web/components/public/MethodRegion.tsx:37)", "file": "./web/components/public/MethodRegion.tsx", "line": "37" }, { "message": "Null-discipline: return null (./web/components/public/MethodRegion.tsx:50)", "file": "./web/components/public/MethodRegion.tsx", "line": "50" }, { "message": "Null-discipline: return null (./web/components/public/NumberStep.tsx:92)", "file": "./web/components/public/NumberStep.tsx", "line": "92" }]
}

## Evidence: scenario-to-behaviour spot check

command: python3 /tmp/opencode/verify007/spotcheck.py
exit: 0
at: 2026-11-09T14:01:27Z

== AC-007-14 ==
describe('AC-007-14: the home title is the promise framing, per locale, ending in the country', () => {
  it('AC-007-14: title and og:title start with the promise and end with the country', () => {
    for (const locale of LOCALES) {
      const promise = PROMISE[locale].replace('{year}', String(YEAR));
      const country = content(locale).country.name;
      const meta = pageMetadata(locale);
      expect(meta.title, locale).toContain(promise);
      expect(meta.title.endsWith(` · ${country}`), locale).toBe(true);
      const resolved = metadataFor(locale);
      expect(String(resolved.title), locale).toBe(meta.title);
      expect(String((resolved.openGraph as { title?: string }).title), locale).toBe(meta.ogTitle);
    }
  });
})

== AC-007-15 ==
describe('AC-007-15: the kicker names the mechanism above the h1, exact per locale', () => {
  it('AC-007-15: the kicker is the locale’s exact string, above the h1 and not a heading', () => {
    for (const locale of LOCALES) {
      const html = historiaPage(locale);
      expect(html, locale).toContain(`<p class="hero__kicker">${KICKER[locale]}</p>`);
      const kicker = html.indexOf(`<p class="hero__kicker">${KICKER[locale]}</p>`);
      expect(kicker, locale).toBeLessThan(html.indexOf('<h1'));
      const kickerElement = html.slice(kicker, html.indexOf('</p>', kicker));
      expect(kickerElement, locale).not.toContain('<h1');
      expect(kickerElement, locale).not.toContain('<h2');
    }
  });
})

== AC-007-17 ==
describe('AC-007-17: the revised title and kicker state the claim under the recorded exemption', () => {
  it('AC-007-17: every locale states a thesis term in the title and kicker, and the exemption covers exactly those keys', () => {
    for (const locale of LOCALES) {
      const local = content(locale);
      const title = PROMISE[locale].replace('{year}', String(YEAR));
      expect(findThesisTerms(title).length, `${locale}: ${title}`).toBeGreaterThan(0);
      expect(findThesisTerms(KICKER[locale]).length, `${locale}: ${KICKER[locale]}`).toBeGreaterThan(0);
      expect(findThesisTerms(pageMetadata(locale).title).length, locale).toBeGreaterThan(0);
      // The exemption is exactly the two authorized keys, not a widening of the boundary.
      expect([...THESIS_CLAIM_KEYS].sort(), locale).toEqual(['kicker.mechanism', 'meta.title']);
      expect(thesisVocabularyOutsideThesis(local.strings, local.editorial), locale).toEqual([]);
      const agreement = renderComponent(AgreementSection, { content: local, citations: citationRegistry });
      expect(findThesisTerms(agreement), locale).toEqual([]);
    }
  });

es: title='Sistema de pensiones: Estafa piramidal · 2042 · pensiones · España' kicker='Estafa piramidal' kicker_before_h1=True
en: title='Pension system: Pyramid scam · 2042 · pensiones · Spain' kicker='Pyramid scam' kicker_before_h1=True
de: title='Rentensystem: Schneeball-Betrug · 2042 · pensiones · Spanien' kicker='Schneeball-Betrug' kicker_before_h1=True
fr: title='Système de retraites : Fraude pyramidale · 2042 · pensiones · Espagne' kicker='Fraude pyramidale' kicker_before_h1=True
it: title='Sistema pensionistico: Frode piramidale · 2042 · pensiones · Spagna' kicker='Frode piramidale' kicker_before_h1=True

Finding: the assertions match their Given/When/Then. AC-007-14 checks the revised promise string with the committed year, the country suffix and `og:title`; the served HTML confirms the same string. AC-007-15 checks the exact per-locale kicker, its position before `<h1>` and its non-heading role; served HTML confirms the node order in all five locales. AC-007-17 (revision) checks that the claim is present in title and kicker, that the exempt key list is exactly the two authorized keys, that the strings sweep is empty, and that the rendered agreement section carries no thesis term. No false green found.

## Evidence: typecheck

command: npx tsc --noEmit
exit: 0
at: 2026-11-09T13:57:02Z

(no output)

## Evidence: build gate — prebuild

command: npm run prebuild
exit: 0
at: 2026-11-09T13:58:10Z


> pensions-system@0.0.0 prebuild
> tsx scripts/verify-derived.ts && tsx scripts/check-content-scope.ts && tsx scripts/check-public-vocabulary.ts && tsx scripts/check-scenario-traceability-3digit.ts && tsx scripts/check-plain-language.ts

derived figures verified: 7 (3 computed, 4 unavailable)
derived series verified: 3
country scope gate: clean (5 locales)
public vocabulary gate: clean (5 locales)
scenario traceability (2-3 digit ids): 389 scenarios, all cited, all citations resolve
plain-language gate: clean (5 locales)

## Evidence: build gate — build

command: npm run build
exit: 0
at: 2026-11-09T13:58:33Z

▲ Next.js 16.4.3 (Turbopack)
⚠ Warning: Next.js ignored package-lock.json in /home/dbueno because it is outside the current Git repository (/home/dbueno/projects/pensions-system).
 To use this directory, set `turbopack.root` in your Next.js config.

✓ Running next.config.ts took 29ms
- Experiments (use with caution):
  ✓ globalNotFound

⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.

  To migrate automatically, run:
  npx @next/codemod@canary middleware-to-proxy .

  Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
  Creating an optimized production build ...
✓ Compiled successfully in 218ms
  Running TypeScript ...
  Finished TypeScript in 1876ms ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/32) ...
  Generating static pages using 11 workers (8/32) 
  Generating static pages using 11 workers (16/32) 
  Generating static pages using 11 workers (24/32) 
✓ Generating static pages using 11 workers (32/32) in 852ms

[...]

├ ○ /opengraph-image-1i7gor
├ ○ /robots.txt
└ ○ /sitemap.xml


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand


## Evidence: build gate — sitemap:check

command: npm run sitemap:check
exit: 0
at: 2026-11-09T13:58:43Z


> pensions-system@0.0.0 sitemap:check
> tsx scripts/check-sitemap.ts

sitemap gate: 20 routes, 6 alternates each, origin https://pensions-system-delta.vercel.app
sitemap gate: emitted .next/server/app/sitemap.xml.body and .next/server/app/robots.txt.body agree

## Evidence: served HTML (title, kicker, node order)

command: (npx next start -p 3077 > /tmp/opencode/verify007/server.log 2>&1 &) ; for i in $(seq 1 60); do curl -sf -o /dev/null http://127.0.0.1:3077/ && break; sleep 0.5; done; for p in "" en de fr it; do url="http://127.0.0.1:3077/$p"; f="/tmp/opencode/verify007/served-${p:-es}.html"; curl -s "$url" -o "$f"; printf '%-34s ' "$url"; grep -o '<title>[^<]*</title>' "$f" | head -1; grep -o '<p class="hero__kicker">[^<]*</p>' "$f" | head -1; done; echo "AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
exit: 0
at: 2026-11-09T14:02:20Z

http://127.0.0.1:3077/             <title>Sistema de pensiones: Estafa piramidal · 2042 · pensiones · España</title>
<p class="hero__kicker">Estafa piramidal</p>
http://127.0.0.1:3077/en           <title>Pension system: Pyramid scam · 2042 · pensiones · Spain</title>
<p class="hero__kicker">Pyramid scam</p>
http://127.0.0.1:3077/de           <title>Rentensystem: Schneeball-Betrug · 2042 · pensiones · Spanien</title>
<p class="hero__kicker">Schneeball-Betrug</p>
http://127.0.0.1:3077/fr           <title>Système de retraites : Fraude pyramidale · 2042 · pensiones · Espagne</title>
<p class="hero__kicker">Fraude pyramidale</p>
http://127.0.0.1:3077/it           <title>Sistema pensionistico: Frode piramidale · 2042 · pensiones · Spagna</title>
<p class="hero__kicker">Frode piramidale</p>

## Evidence: exemption breadth probe

command: npx tsx /tmp/opencode/verify007/probe.ts
exit: 0
at: 2026-11-09T14:02:20Z

thesisVocabularyOutsideThesis empty: true
without-exemption hits total: 14
without-exemption hits in exempt keys: 14
without-exemption hits elsewhere: 0 []
distinct exempt keys hit: ["kicker.mechanism","meta.title"]
THESIS_CLAIM_KEYS: ["kicker.mechanism","meta.title"]

## Evidence: test-run hash

command: bash .standards/scripts/test-run-reuse.sh --print-hash
exit: 128
at: 2026-11-09T14:01:41Z

fatal: Unable to hash .standards
a6f76247599536c2f6d8f9debcd0699e61365ad6db15eb3b276a77dc2cb8feae
