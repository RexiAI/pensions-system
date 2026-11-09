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
