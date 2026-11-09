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
