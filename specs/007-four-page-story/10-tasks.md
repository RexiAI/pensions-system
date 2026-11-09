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
