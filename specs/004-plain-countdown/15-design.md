# Design Spec: plain-countdown

Surface note: this spec is mixed. In scope for design: T1, T2, T3, T4, T5, T6, T7, T8,
T10, T12, T13, T14, T15. Out of scope for the skill: T9 (build gate), T11 (admin panel,
a dashboard), T16 (locale data parity), T17 (test retirement). Those four get no visual
language of their own; see §Out-of-scope tasks.

Read with `00-informal.md` §Estado actual for the measurements this document reasons from,
and `10-tasks.md` for the contract each directive has to satisfy.

## Design Read

**Reading this as:** a public-sector data page for a general audience, in a plain-language
editorial register, leaning toward the project's own instrument system (`web/styles/tokens.css`)
relaid as a five-step story, with zero motion and one reading axis.

### Why the current page fails, in measured terms

The failure is not aesthetic. Every token in the instrument is good; the composition spends
them against the reader. Six findings, each measurable:

1. **The band is 1046px tall and it ends in 335px of small print.** Measured on the served build at
   1440x900 (`getComputedStyle().fontSize`, `getBoundingClientRect()`, 2026-11-01). Every size in
   the table is the served build's:

   | item | text | size | kind | y |
   |---|---|---|---|---|
   | `.countdown__eyebrow` | `PROYECCIÓN CENTRAL · EUROSTAT` | 12px | caveat | 268 |
   | `.countdown__numeral` | `16` | 32px | content | 295 |
   | `.clock__value--days` | `5539` | **80px** | content | 339 |
   | `.clock__fields` (sub-day) | `08` / `20` / `02` | 32px | content | 339 |
   | `.fuse__label` | the 62% sentence | 15px | content | 530 |
   | `.countdown__year-line` | `2042` + `año del umbral` | 20px / 12px | caveat | 751 |
   | `.countdown__definition` | "Años hasta que la población…" | 15px | caveat | 791 |
   | `.countdown__range` | "variantes 2039 a 2043" | 12px | caveat | 848 |
   | `.countdown__source` | "Eurostat, proyecciones demográficas 2024…" | 12px | caveat | 875 |
   | `.countdown__backcast` | "La proyección da 31,22 para 2025…" | 12px | caveat | 903 |
   | `.clock__anchor` | `1 de enero de 2042` + `fecha convencional…` | 15px / 12px | caveat | 938 |
   | `.clock__definition` | "Cuenta hasta el 1 de enero de 2042…" | 15px | caveat | 983 |
   | `.clock__arithmetic` | "Los 16 años son la diferencia…" | 12px | caveat | 1047 |

   Two measured facts, and the second is the one that matters:

   **The numeral hierarchy is right.** `5539` at 80px is the loudest glyph and `16` is 32px (spec
   003's OQ-2 override in the `.band` block, `globals.css` lines 1850 to 1862). Nothing about the
   number needs enlarging.

   **The visual order and the DOM order disagree.** Visually the caveat stack sits *below* the
   number: only `.countdown__eyebrow` (y=268) precedes `5539` (y=339), and the seven caveat items
   then occupy 751 to 1086, i.e. **335px of the band's 1046px is 12 to 15px small print stacked at
   its end**, right before the reader leaves the fold. In the DOM it is the other way round:
   `.band .countdown { display: contents }` plus the `order` cascade puts eyebrow, year line,
   definition, source and back-cast *before* the fields, so a screen reader hears five caveats
   before it hears the number. Sighted readers get the number then the wall; assistive readers get
   the wall then the number. That is a WCAG 1.3.2 (meaningful sequence) defect produced by
   presentation-only reordering, and it is why this composition cannot be patched: the band's
   reading order is asserted in CSS.

   Alongside both: once the number arrives it is one of **four** numerals at 32px (`16` plus the
   three ticking sub-day fields at `--text-clock-sub` in full `--ink-1`), and **29 of the 40**
   text-bearing elements above the fold at 1440x900 are at 15px or smaller, 22 of them at 13px or
   smaller, in 9 distinct sizes (measured with `visibility:hidden` and sub-2px text excluded, so
   the count is text a reader actually sees; at 390x844 it is 12 of 22).

   So the page does not need a bigger number. It needs the caveat stack out of the band, the four
   large numerals reduced to two, and one order instead of two.

2. **The empty column is a grid that lost its tenant, and it is measured, not inferred.**
   `.hero` declares `grid-template-columns: 7fr 5fr`; `.hero--band` keeps it and pins its content to
   the second track (`.hero--band > .hero__panel` and `.hero--band > .hero__status` both declare
   `grid-column: 2`, `globals.css` lines 411 to 419). Measured on the served build at 1440x900:
   `.hero--band` resolves `grid-template-columns` to **667.328px 476.672px with 1 child**, and that
   child sits in the second track. 667.33 + the 32px gap = 699.33, which is the reported width
   exactly, measured to the panel's left edge. The cause is not spacing: it is a two-track grid
   whose first track has no tenant, and the pin is stated per-child, so the rendered child count is
   not what makes the track empty.

3. **Three paragraphs explain one date, and none of them is behind a disclosure.** I checked:
   `CountdownBlock.tsx` and `CountdownClock.tsx` contain no `<details>` at all, so every string
   below is visible text. `countdown.clock.definition`, `countdown.clock.arithmetic` and
   `countdown.definition` all sit on the clock's face inside a 1046px band (`00-informal.md`
   measured table), alongside `countdown.range`, `countdown.source`, `countdown.backCast` and the
   `countdown.clock.anchorLabel` phrase, which names the same date again.

4. **The explanation is 2.2 screens away.** `#demografia` measures y = 1970 at 1440x900. The
   page's "why" arrives after the reader has already left.

5. **The "why" arrives as four percentages.** `demography.finding` states four share values in
   one sentence at `--text-plate`, and `.demography__readout` adds six more as a six-track grid.
   Ten numerals on the face of a chart whose job is to be looked at.

6. **The document is 10 208px at 1440x900 and 15 367px at 390x844** (both measured), 1 771 words
   and 22 headings (`00-informal.md` measured table), and two of seven figures are `computed`. The
   five `unavailable` figures render as one "cifras en preparación" block that occupies the figure
   plate's slot in the middle of the page, between the reader and the two plates that actually carry
   a number (five of seven `FIGURE_IDS`). `#figuras` sits at y=3418 and `#demografia` at y=1970
   (both measured, matching `00-informal.md`), so the two plates arrive 3.8 screens down.

The common cause behind 1, 3, 5 and 6 is two habits, and neither is a lack of hierarchy: **the
page asserts its reading order in CSS while its content lives in the component tree, so the two
drift** (finding 1's `order` cascade, and 3's three paragraphs each rendered where it was computed),
**and it gives its caveats the typographic weight of its facts** (finding 1's 12 to 15px block,
finding 5's ten numerals, finding 6's five-plate apology). The recomposition's job is to make the
DOM order the reading order, and to give the facts the top of the page with the caveats below it,
where a reader who wants them can find them and a reader who does not is never stopped by them.

## Dial Values

Skill dials (`design-taste-frontend` §1), then two project dials this brief needs and the skill's
three do not carry.

- **DESIGN_VARIANCE: 3** (baseline 8). Trust-first / public-sector / accessibility-critical reads
  3-4; "redesign, preserve" says match the existing, which is 3. The existing page is already
  symmetric and flush-left; the void was not a variance problem.
  *CSS consequence:* one axis. Every story element's inline start is the page's content edge. No
  `grid-column` placement anywhere in the story, no negative-margin overlaps, no offset
  two-column header/body splits, no centred block. Asymmetry is permitted in exactly one form:
  the ragged right edge of measure-capped prose. Multi-track grids survive only where every track
  has a child (T13).

- **VISUAL_DENSITY: 4**, with a **two-register rule**. The page runs two densities and the
  boundary between them is visible and named:
  *story register (steps 1 to 5): density 3.* One claim per screen, one size per role, 64px of
  block padding, no boxes, no chips, no tables, and, the load-bearing part, **no caveat layer**.
  The countable form, because "no small text" is false the moment a chart has a label: every item
  below 17px in the story is one of three named things, a step label (`--text-micro`, once per
  step), the three sub-day labels in step 1 (`--text-micro`), or the three chart annotations in
  step 3 (`--text-meta`). Items below 17px per step: 4 / 1 / 4 / 1 / 1. Nothing else is small, and
  in particular no definition, source, variant, back-cast or provenance line lives in the story:
  those 9 strings move to `#metodo` (T8). Today the band carries 22 items at 13px or smaller.
  *appendix register (`#figuras` and below): density 6.* The instrument as it exists today:
  hairlines between rows, mono numerals, `--text-meta` provenance, definition lists, measure-capped
  prose.
  The register change happens at the 96px seam between the story and `#figuras`, and it is the
  only density change on the page. Set 4 rather than 3 because the appendix must not be
  simplified (AC-004-34 requires its strings verbatim) and 6 rather than 7 because five of seven
  plates leave the page (T10).

- **MOTION_INTENSITY: 2.** Trust-first reads 2-3, "preserve" would add 1, and the page needs the 1
  back: the one thing that moves here is a number that changes because time passed, which is
  content, not transition. A countdown with an entrance animation is a countdown the reader has to
  wait for.
  *CSS consequence:* zero new `@keyframes`; zero `transition` declarations outside the existing
  interactive set; no `animation-timeline`, no scroll observers, no `will-change`; the fuse and
  the pyramids are static SVG; the clock group's per-second text update is a text change, not a
  transition. `prefers-reduced-motion: reduce` keeps its existing behaviour (hides the sub-day
  fields entirely) and gains nothing new to disable.

- **HIERARCHY: 9** (project dial: how far apart the top and the bottom of the story's type ladder
  sit, and how few things occupy the top). Consequences are countable, not aesthetic:
  exactly one element at `--text-num-xl` (the day count, already true from spec 003's override and
  preserved by AC-004-06); **exactly two numerals above 20px in the whole story** (the day count at
  80px and the years at 32px), which is the one hierarchy change this spec actually makes, because
  the shipped page has four (finding 1); exactly two elements at `--text-h2` in the story (step 2's
  statement, step 5's sentence); every step label at `--text-micro` (12px), so no step heading
  competes with its own content; one size per role, and no role with two sizes.
  *The dial is not asking for a bigger top. It is asking for fewer things at the top.*

- **RESTRAINT: 9** (project dial: how many jobs the page's loud materials are allowed to do).
  Consequences are countable: two accent fills above the fold (the fuse's burnt segment, and the
  step 5 primary action, AC-004-25); zero new hues; zero new icons; zero numerals on the pyramid's
  face; zero `·` separators added; zero decoration of any kind (no arrows, no scroll cues, no step
  numbering, no status dots, no dividers that separate nothing).

## Design System / Foundation

**Not a packaged design system.** This is a bespoke editorial-instrument system, already shipped
in `web/styles/tokens.css`, and this spec adds a plain-language *layer* on top of it rather than a
foundation under it. Named honestly so nobody reaches for a library:

- **Visual lineage:** a printed statistical page. Warm paper, three ink weights, hairlines,
  flush-left setting, monospace for measurements, no radius, no shadow, no card. That is already
  the project's identity and it is preserved (T15).
- **Copy lineage:** the public-sector plain-language register (GOV.UK-style: one idea per
  sentence, no jargon above the fold, the number before the caveat). Borrowed for *copy discipline
  only*; no GOV.UK visual component, token or typeface enters the page.
- **No install command.** No new dependency, no component library, no icon library, no motion
  library, no font.
- **Imagery:** the page's only images are data-drawn SVG (the pyramids, the fuse). There is no
  photography and there must be no div-based mock of anything: a fake chart built from styled
  rectangles would be the exact tell this system exists to avoid, and every mark on this page is
  a real value from a committed series.

One decision inside this, because a reviewer will challenge it: **step 1 keeps
`--surface-hero`.** `.hero__panel` and `.band` are its only two current users and both retire under
T12, which would leave a token frozen by AC-004-64 with nothing rendering it. The story needs
exactly one material moment and the number is it, so step 1 sits on that ground. It is *not* the
old panel widened: it spans the full 1176px content width (not a 477px column), its content is
flush to its left edge on the same axis as every subsequent step (not centred), it has no border,
no radius, no shadow, and there is no neighbouring column. Fallback if the human gate disagrees:
`background: none` on step 1 and `--surface-hero` becomes a frozen-but-unused token, recorded as
such. One line either way.

## Global Tokens

Nothing new. The position of this spec is **zero new tokens**, and that is a design decision, not
an oversight: a token set that grows every time the composition moves is a token set nobody can
hold. Every value below already exists in `web/styles/tokens.css`.

- **Fonts:** `--font-sans` (Instrument Sans) for all story copy and headings; `--font-mono`
  (IBM Plex Mono) for numerals and only numerals; `--font-label` (an alias of the sans) for the
  five step labels and every micro-label. `--font-serif` (EB Garamond) does not appear in the
  story; it stays where it is, in the appendix's quoted voices. No italics anywhere in the story:
  the only 1.02 leading on the page sits under a monospace numeral, and italic descenders under a
  tight leading is the one typographic bug this composition could pick up for free.
- **Accent:** `--accent`, the olive. Two jobs above the fold, listed in RESTRAINT above. Never a
  label colour, never a rule colour, never a link colour inside the story (links under the story
  are `--ink-2` plus an underline, so the affordance never rests on colour alone).
- **Neutral base:** `--surface-1` page, `--surface-hero` for step 1 only, `--ink-1` for the number,
  the h1 and the statements, `--ink-2` for sentences and values, `--ink-3` for labels and
  annotations. `--rule-1` for every hairline. `--rule-2` for nothing in the story.
- **Corner radius:** `--radius` = 0, unchanged, everywhere, with no exception. There is no
  rounded element on this page and this spec adds none.
- **Theme:** **auto**, existing `data-theme` mechanism, both themes token-complete. No section
  inverts. New rules resolve tokens only, so dark mode needs no new declarations (T15).
- **Icon library:** none. The page's only glyphs are the six existing share icons
  (`web/components/share/ShareIcon.tsx`), unchanged. No icon is added by this spec.
- **Type ladder by role** (one size per role, and no role with two sizes):

  | role | token | value at 1440 | count in the story |
  |---|---|---|---|
  | page title | `--text-display` | 64px (clamp caps at 4rem) | 1 (the `<h1>`) |
  | the number | `--text-num-xl` | 80px (clamp caps at 5rem) | 1 (the day count) |
  | statement | `--text-h2` | 34.6px (2.4vw; the 38px cap binds only above 1583px) | 2 (step 2, step 5) |
  | secondary numerals | `--text-num-l` | 32px | 1 (years) |
  | measurement line | `--text-plate` | 22.3px (1.55vw; 19px at 390) | 1 (fuse label) |
  | sentence, day unit | `--text-body-lg` | 19px | 2 (step 1's sentence, `días`) |
  | chart panel title | `--text-small` | 15px | 3 (the pyramid year lines) |
  | annotation, sub-day value | `--text-meta` | 13px | 3 + 3 |
  | step label, sub-day label | `--text-micro` | 12px | 5 + 3 |

  Every value in that column is read from the clamp in `tokens.css` at the measured viewport, not
  from the clamp's upper bound.

- **Tokens that change role** (values untouched; assignment only):
  `--text-micro` + `--font-label` + `--tracking-label` + `--ink-3` become the step-label
  treatment. `--surface-hero` moves from a 477px panel to the step 1 ground.
- **Tokens that leave the story** (still defined, no story user): `--measure-face`
  (17.5rem, the centred face's measure: the story is flush left, and T17 already retires the test
  that pins it), `--band-pad-block`, `--text-clock-days`, `--text-clock-sub`, `--text-band-years`,
  `--hero-min-h`. The clock's own geometry helpers (`--clock-sub-col`, `--clock-gap`,
  `--clock-days-min`, `--clock-unit-min`) stay in use if the sub-day row keeps its three equal
  tracks, which the design allows. Each retired token is either deleted with its rule or retained
  for the appendix; what the design requires is that no story rule uses a centred-face geometry.
- **Spacing:** `--space-6` (32) for step 1's block padding, `--space-8` (64) for steps 2 to 5
  above 768 and `--space-7` (48) below it, `--space-9` (96) for the story-to-appendix seam and for
  the lead-in to `#metodo`. No new spacing token.
- **Grid:** `--grid-max` and `--gutter` unchanged. Content width resolves to 1176px at both desktop
  viewports and 358px at 390. Every story element starts at that content edge.

## Per-Task Directives

### Task 1: The five-step contract and the top-of-page order

- **Layout:** editorial section stack. One column, full content width, five `<section>`s separated
  by a single `border-top: var(--border-hair)` each (no step gets a bottom border, so two adjacent
  steps share one line and there is no doubled rule). Step 1 has no top border; it opens the page.
  `TOP_STEPS` is the order, and the DOM order is the only order (no `order`, no `grid-area`).
- **Components:** `web/components/public/top-steps.ts` (the declaration), one step shell (label +
  body), `PublicPage` composing them directly after `<main id="main">`.
- **Typography:** the step label is the step's only chrome: `--font-label`, `--text-micro`,
  `--tracking-label`, `text-transform: uppercase`, `--ink-3`, 6.6:1 on `--surface-1` (computed
  from the token values, AA for normal text). It is the quietest text in its step by design: a
  signpost, not a headline. All five labels come from content keys.
- **Motion:** none. The step stack never animates, never reveals on scroll, never fades in.
- **A11y:** five labelled sections, five distinct `<h2>` ids. The `<h1>` renders inside step 1
  above the day-count group (AC-004-08), so step 1's heading order is `<h1>` then its own `<h2>`,
  which is monotonic and valid. The `<h2>` may sit after the `<h1>` in the DOM even though the
  section is `aria-labelledby` it; labelling does not require document precedence. Skip link, focus
  ring and `--tap-min` are untouched.
- **Anti-patterns to avoid:** no step numbering of any kind ("01/05", "Paso 1", "Step 1:") even
  though `TOP_STEPS` carries ids, because the ids are DOM handles and never rendered; no per-step
  icons or glyphs; no card, shadow or radius per step (step 1's ground is the one specified
  exception, T2); no scroll cue; no `·` between steps; no step label that restates its own heading
  in the body.
- **Watch items:** (a) a step that renders nothing must be absent from the DOM, not an empty shell
  (see T13's rule); (b) `data-top-step` on exactly five elements; (c) in-page anchors currently
  land under the 56/64px sticky header because no rule declares `scroll-margin-block-start`.
  Recorded, and fixed at T6 where it is the primary action's target; do not fix it silently
  elsewhere; (d) the five micro-labels are a judged, recorded deviation from the anti-slop
  eyebrow count, and the argument must be re-made by anyone tempted to raise it to six: they are
  `<h2>` elements, not decorative spans, they carry no numbers, and they are the *only*
  uppercase micro-label the story has. The appendix already carries its own micro-labels, and this
  spec adds none there.

### Task 2: Step 1, the number in plain words

- **Layout:** editorial manifesto opener. Full content width on the `--surface-hero` ground, with
  `padding-block: var(--space-6)` and **`padding-inline: 0`** (an inline inset would break the
  page's single axis; the text must sit exactly on the content edge, and the ground's left edge is
  that edge). Reading order top to bottom: `<h1>`, step label, the number group, one sentence.
  The number group is: the day numeral (80px) with its label beside it on the baseline; the years
  numeral (32px) with its unit, one line below; the three sub-day pairs on their own row below
  that. Nothing else. No `<details>`, no source line, no range, no back-cast (AC-004-07).
  One positional change inside the group is deliberate: today the day's label sits under the
  numeral at `--text-micro` (12px, measured), which at 80px makes the unit a caption the reader
  has to hunt for. It moves beside the numeral on the baseline at `--text-body-lg`, so the group
  reads as one measurement, `5 539 días`, at a glance.
  **The 3px amber threshold rule (`.countdown__rule`) does not come with the number.** Measured on
  the shipped build it is one of four elements above the fold carrying the accent or projection
  colour, and in step 1 the numeral is already the one thing that differs. It retires with the band.
- **Layout at the three measured viewports:**

  | viewport | content width | step height budget | largest element | 1st / 2nd / 3rd fixation |
  |---|---|---|---|---|
  | 1440x900 | 1176px | ~390px | day numeral, 80px | the `<h1>` (top-left, 64px) / the day numeral (largest mass) / the sentence |
  | 1366x768 | 1176px | ~390px | day numeral, 80px | same, and the step sits ~378px inside the 768px bound |
  | 390x844 | 358px | ~450px (es) / ~490px (de) | day numeral, 44px | the `<h1>` (measured: 122px, 3 lines es; German runs longer) / the day numeral / the sentence |

  The budgets are derived, not measured: the Coder measures and records per AC-004-62. But the 390
  line has an audit trail worth keeping, and part of it is measured. The shipped clock box measures
  400px tall at 390x844 (`tokens.css`, the `--measure-face` re-measurement of 2026-10-31, 135.44 to
  536.30, and that box already includes the years numeral since the spec 002 merge), and the shipped
  `<h1>` measures 122px at 390 (three lines, not the two earlier drafts assumed). Step 1 takes
  roughly 195px of prose and the anchor line out of the clock box, shortens the sub-day row by about
  26px, and puts the `<h1>` (122px), the step label (25px) and one sentence (62px) back in: 400 less
  195 less 26 plus 209, about 450 with padding. Same arithmetic at 1440, where the `<h1>` measures
  65px (one line).

  The `<h1>` wins the first fixation by position, the numeral wins by mass. That order is
  deliberate: you must know what the number is about before you take it in, and it is why the
  `<h1>` stays above the numeral rather than beside it.
- **Components:** `<h1>` from `hero.statement`; step label; the number group; one sentence from a
  new key (`steps.number.sentence`), which is where the target date appears for the only time in
  the story.
- **Typography:** every value here is already in use on the shipped page, which is why this task
  *keeps* most of it and changes three things only.
  Kept as measured: day numeral `--font-mono`, `--text-num-xl` (80px at 1440, 44px at 390),
  `--leading-tight`, `font-variant-numeric: tabular-nums`, `--ink-1`; years numeral `--text-num-l`
  (32px) with its unit `--text-num-m` (20px) and `--ink-2`, exactly as `.countdown__numeral` and
  `.countdown__unit` do it today; the `<h1>` at `--text-display`, `--leading-tight`,
  `--tracking-display`, `--ink-1`, uncapped (`--measure` is a character measure, so at 64px it
  resolves to roughly 2250px and correctly never binds).
  Changed, and this is the whole of the type work in step 1:
  1. the sub-day values drop from `--text-clock-sub` (32px, full `--ink-1`) to `--text-meta`
     (13px, `--ink-2`), with labels at `--text-micro` / `--ink-3`. Four numerals at 32px become
     one;
  2. the day's label moves from `--text-micro` under the numeral to `--text-body-lg` beside it on
     the baseline. The numeral does not change size, its unit becomes legible;
  3. the seven caveat items measured in finding 1 (eyebrow, year line, year label, definition,
     range, source, back-cast) and the anchor line leave the step entirely, for `#metodo` under
     T8.
  *The hierarchy fix in one line:* the story goes from **four numerals at 32px plus seven lines of
  12 to 15px small print above the number** to **one numeral at 32px and no small print at all**,
  with the 80px day count and the 64px `<h1>` exactly where they already are. The change is in the
  deletions.
- **Motion:** none. The accent rule that `prefers-reduced-motion: reduce` hides the sub-day fields
  survives exactly as it is (AC-001-112): under reduced motion step 1 is the day count, the years
  and the sentence, and it gets shorter, which is fine for T14.
- **A11y:** the number group keeps an accessible name carrying the formatted date and no
  "conventional date" or "threshold" phrasing (AC-004-31, which is a content edit in five
  locales, not a markup change). No `aria-live` anywhere; the seconds field changes silently and
  must not announce. Contrast on the ground, computed from the token values: `--ink-2` on
  `--surface-hero` is 9.4:1 in light and the worst pair anywhere in the story is `--ink-3` on
  `--surface-hero`, 6.2:1 light and 5.9:1 dark. Both pass AA for normal text, so no minimum moves.
- **Anti-patterns to avoid:** no centred numeral (centring is what made the block a card in a
  column; AC-001-111's centring clause is dropped by T17 for exactly this reason); no eyebrow above
  the `<h1>`; no second sentence; no source, range or back-cast line; no `<details>` in this step;
  no chip, pill or box around the number; no repeated "días" label under a numeral that already
  carries it; no accent colour anywhere in this step.
- **Watch items:** (a) the `<h1>` measures 122px at 390 (three lines in Spanish, measured) against 65px
  at 1440 (one line), so the 390 budget above is the tighter one and German may add a fourth line
  (about 40px). The Coder measures and records per AC-004-62; (b) the existing `.clock` geometry is
  centred (`text-align: center`, `justify-items: center`, fixed equal tracks) and must not be
  inherited into the story, or the axis breaks; (c) the ground must not acquire an inline inset, or
  step 1 is one `--space-6` (32px) out of alignment with steps 2 to 5; (d) **step 1 carries 6 text
  leaves where the anti-slop hero-stack rule allows 4, and that is a recorded deviation, not an
  oversight.** Four of the six are named by AC-004-07 and AC-004-08 as step 1's exhaustive content
  (day count, its label, the sub-day fields, the years numeral, the one sentence), so the stack
  cannot be compressed further without breaking a criterion. If a future change must compress it,
  the sentence is the last thing to lose and the number's label is the first thing to keep.

### Task 3: Step 2, what breaks in one plain line

- **Layout:** single statement screen. One object only: a `<p>` at `--text-h2`, flush left, capped
  by nothing (at 34.6px `--measure` resolves past the content width, so the sentence sets at the full
  1176px in about two lines at 1440 and about five at 390). This is the page's first breath: the
  step after the number is one sentence, and the rest of that screen is empty on purpose.
  `padding-block: var(--space-8)`, the same as every other step, so the step is roughly 250px at
  1440 and 320px at 390, and it reads as a deliberate pause rather than a stub.
- **Components:** step label plus one `<p>` from a new key whose template carries `{threshold}` and
  `{base}`. Nothing else: no figure, no chart, no link, no provenance (AC-004-12).
- **Typography:** `--text-h2`, `--leading-snug`, `--ink-1`. Not `--text-body-lg`: this sentence is
  the page's claim and it is the one place where the statement size is spent on a `<p>` rather than
  a heading.
- **Motion:** none.
- **A11y:** the `<p>` is the section's only text besides its label, so its accessible name (the
  label) and its content do not compete. No heading is required for the sentence; the section's
  `<h2>` label already carries the structure.
- **Anti-patterns to avoid:** the sentence must not name the date (AC-004-29 puts the date in step
  1 once, and step 2 is where the ratio lives); it must not restate the ratio anywhere else; no
  "50 %" or any other percentage; no arrow glyph or "ver más" affordance; no centred statement; no
  second clause joined by a colon or a semicolon.
- **Watch items:** (a) the copy must state the threshold without the year, which is the one content
  constraint most likely to be violated by a well-meaning translator; (b) the label and the
  sentence must not both use `--text-h2`, or the step reads as a heading plus a subhead.

### Task 4: Step 3, the pyramid moves up and is annotated

- **Layout:** annotated small multiples, and the only full-width moment in the story. Label, then
  three panels side by side from 768px up; below 768 each panel becomes a row of
  `[chart 5fr | annotation 7fr]` with a `--space-4` gap, three rows stacked. This is where the
  full 1176px is used, and it is deliberate: the widest thing on the page is the explanation.
  No summary sentence above the panels: the three annotations *are* the explanation, which is what
  "annotated, not labelled" means and what keeps the step inside one screen at 390.

  | viewport | panel width | panel internals | step height budget |
  |---|---|---|---|
  | 1440x900 | 370px each, 3 up | year line 13px / chart 329px tall / annotation ~2 lines | ~560px |
  | 1366x768 | 370px each, 3 up | same | ~560px, clears the fold with ~208px |
  | 390x844 | chart 142px, annotation 199px | year line above the row / chart 127px tall / annotation ~3 lines | ~610px (es), ~640px (de) |

- **The annotation, precisely.** Each panel carries exactly one `<p>` under its chart,
  `--space-3` below the SVG, at `--text-meta` / `--leading-meta` / `--ink-2`, left-aligned, no
  measure of its own (it wraps to the panel's width), no italics, no accent colour, no arrow
  glyph. Its text is one sentence of at most 16 words, resolved from a content key with a `{band}`
  placeholder filled by `bandLabel` for a published band. Its job is to place the eye, not to
  restate a value, so **annotations carry no numerals at all.**

  The in-chart half of the annotation is a mark, not a colour: the annotated band's two bars get a
  `1px` `--ink-2` stroke and no fill change, so the meaning is carried by an outline plus the
  sentence naming the band, and never by hue alone (WCAG 1.4.1). Suggested bands, one per panel,
  chosen so the three annotations read as one argument split in three: the base band in the
  earliest panel (the wide foot), the largest band in the latest observed panel (the bulge that
  retires), the base band again in the projected panel (the foot that no longer replaces it). Two
  bands, three marks, one story: "el baby boom que se jubila, la base que no repone".

- **What the annotation replaces.** `demography.finding` currently states four share values in one
  sentence at `--text-plate`, directly under the heading, and `.demography__readout` adds six more
  in a six-track grid. The face of the chart goes from ten numerals to zero: the finding sentence,
  the six-value readout and the data table all move into one `<details>` below the three panels
  (AC-004-15). Use the existing `.data-table summary` treatment unchanged for that disclosure
  (boxed, `--border-strong`, `min-block-size: 44px`) rather than inventing a second summary style;
  the finding, then the readout, then the table go inside it, in that order.
- **Components:** the existing `PyramidPlate` section (now the third step, id `demografia`
  unchanged and inside `data-top-step="why"`), three panels, three annotation paragraphs, one
  disclosure. The per-panel `<svg>` keeps `role="img"` and its `<title>`; the table keeps being
  emitted by the same component as the charts (AC-001-97).
- **Typography:** year line at `--font-label` `--text-small` (15px) `--ink-2`, with the year itself in
  `--font-mono` `--ink-1`. Today `.demography__panel-head` sets the same line at `--text-micro`
  (12px, measured), which is caption size for something that names the panel; 15px reads as a title
  without competing with the annotation below it. Annotations `--text-meta` / `--ink-2`. Nothing
  else on the face.
- **Motion:** none. The charts are server-rendered SVG with no transition and no reveal. The
  three-up to three-row switch is a layout change at 768px, not an animated one.
- **A11y:** the outlined band is decorative reinforcement; the annotation text carries the meaning.
  Each panel's accessible name stays its own `<title>`. The annotations are visible text, not
  `aria-label`s, so nothing is announced twice. At 390 the chart column is 142px and carries no
  axis labels (the existing `max-width: 767px` rule already hides ticks and non-major age labels),
  which is acceptable because the values live in the disclosure's table.
- **Anti-patterns to avoid:** no four-percentage sentence on the face; no legend; no "sin datos" or
  "en preparación" row in place of the step; no change to the charts' hues, dash encoding or
  scales; no pie chart, no heatmap, no sparkline substitute; no per-panel card or border; no
  numbered annotation markers; no tooltip (the page has no JavaScript motion budget for one).
  Note that three panels in a row is *not* the banned "three equal feature cards": it is one chart
  at three times, same axes, same scale, same encoding, which is what a small multiple is for.
- **Watch items:** (a) exactly three annotation elements, one per panel, no more and no fewer;
  (b) the band mark is a stroke, never a fill and never a new hue; (c) `bandLabel` returns a label
  whose band separator is an en dash in the content model, and `countdown.range` does the same:
  those characters are data, they stay verbatim, and the zero-dash rule of this spec applies to
  newly authored copy only; (d) `demography--unavailable` must be deleted from the public path,
  not restyled, since AC-004-19 requires the step to vanish when the series is not computed;
  (e) do not nest two `<details>`: either the table's own disclosure hosts the finding and readout,
  or a host disclosure suppresses it, and one of the two is chosen explicitly; (f) the 390 row mode
  must occupy both its tracks or T13 fails on this very section.

### Task 5: Step 4, the fuse as a simple percentage

- **Layout:** one thin full-measure mark and one measurement line. The 6px fuse line spans the full
  1176px content width (358 at 390), flush left, nothing above it but the step label, and one line
  of text `--space-3` below it. `padding-block: var(--space-8)` above 768, `--space-7` below.
  Height budget ~200px at 1440 and ~180px at 390: this is the page's shortest step, and it is
  short on purpose.
- **Why the quietest step is the right call:** step 4 states a status, not a claim. A status that
  shouts would compete with the number in step 1 and with the two statements around it. Its visual
  weight comes from *width* instead of height: a 1176px hairline with 729px of it burnt is the
  widest object in the story, so the eye registers it without the page spending a heading on it.
- **Components:** the existing `Fuse` drawing (viewBox, cord and burnt rects from `burnPoint`,
  `aria-hidden`, `focusable="false"`) and one label from a content key whose template holds exactly
  one placeholder, `{percent}`.
- **The percentage must name its denominator, and this changed because of a measurement.** The
  committed value is `consumedPercent: 62.44`, `observedRatio: 31.22`, `threshold: 50`
  (`data/derived/series/fuse.json`), so 62.44 is the *ratio's share of the threshold*:
  31.22 divided by 50. It is **not** elapsed time. The countdown's own denominator is the other
  one: the snapshot year is 2026 and the anchor is 2042-01-01, so the time elapsed at the snapshot
  is about 0% of the span, not 62%. Two different quantities, adjacent in a five-step narrative that
  reads as one road, and the previous draft of this step called it "how much of the way is gone",
  which invites the wrong one by 62 points. So: the label's words around `{percent}` must name what
  the percentage is a share of (the threshold), and step 4's step label must not use a
  journey/progress metaphor unless the same sentence states what the road is. `{percent}` stays the
  only numeral (AC-004-20 allows words, not a second numeral), and the words are the fix.
- **Typography:** the label is rendered as one string at `--text-plate` (22.3px at 1440, 19px at
  390), `--ink-1`, `--leading-snug`, flush left. One string, one size: splitting the numeral out of
  the template would be a second typographic system for one line, and the 6px mark above it already
  carries the quantity.
- **Motion:** none, and this one is contractual: the geometry must not change across a clock tick
  (AC-004-22).
- **A11y:** the graphic stays decorative with the label carrying the meaning. No `role="progressbar"`
  (banned), no value attribute, no date in the graphic.
- **Anti-patterns to avoid:** no progress bar, no background track, no filled container, no end
  labels with years, no percentage inside a pill, no second numeral in the label, no
  `fuse.definition` and no `fuse.label` inside the step, no reproduce link inside the step, no
  accent-coloured rule or heading in this step (the burnt segment is the step's only accent, and it
  is the page's second-largest accent area after the step 5 button: 729x6px of accent against the
  button's ~180x51px, so the button stays dominant).
- **Watch items:** (a) the label template's placeholder count, because a translator adding a second
  numeral breaks AC-004-20 silently; (b) `displayPercent` / `formatWholePercent` must be the only
  source of the numeral; (c) with no computed fuse value the step must be absent entirely, not a
  labelled empty figure; (d) the denominator words are a content constraint the build cannot check:
  a Spanish "del camino recorrido" (of the way travelled) or its German equivalent re-introduces the
  time reading no matter what the number says. Review all five locale strings against
  `data/derived/series/fuse.json` before signing the step off.

### Task 6: Step 5, what it means and the one action

- **Layout:** statement plus one action, flush left. The sentence at `--text-h2` (the page's second
  and last statement), then `--space-5` below it the primary action, then the story ends. The
  sentence before the button, not beside it: the vertical path is read then act.
  Below the step and outside it, one strip: the secondary action (a text link to `#metodo`,
  `--text-small`, `--ink-2`, underlined) at the inline start and the existing share row at the
  inline end, laid out with `flex` and `flex-wrap` (never a grid, so there is no track to leave
  empty). The strip is the seam between the story and the appendix: `--space-9` of air after it,
  and no rule, so the seam never reads louder than the steps.
- **Components:** one `<p>` from a new key (`steps.meaning.sentence`), one `<a class="hero__cta">`
  whose text is `hero.ctaPrimary` and whose href is `#figuras`, then `ShareRow` and the
  `hero.ctaMethod` / `hero.ctaSecondary` link, both outside any `data-top-step`.
- **Typography:** sentence `--text-h2`, `--leading-snug`, `--ink-1`, `max-inline-size: var(--measure)`.
  Button keeps the existing `.hero__cta`: `--accent` ground, `--on-accent` text (7.6:1, computed),
  `--radius`, `--text-body`, `--space-3`/`--space-5` padding, about 51px tall and clearing
  `--tap-min`.
- **Motion:** the button's hover and focus states are the existing ones; nothing new.
- **A11y:** the step's only interactive element is the button (measured today at 221x52, which clears
  `--tap-min`), and it sits inside the fifth step so the keyboard order still follows the reading
  order. One `<h1>`, one primary action, no duplicate intent ("Ver cuánto te queda" goes to the
  figures, the method link goes to the method).
  **The method link must be a real target, not a 28px line.** Measured on the shipped build at
  1440x900, `.hero__cta-secondary` is 139x**28** and `.fuse__reproduce` is 70x**21**; both are under
  the project's own `--tap-min: 44px`, and both are above the fold today. The strip's method link
  therefore carries `min-block-size: var(--tap-min)` with `display: inline-flex` and
  `align-items: center`, so the visible stroke stays a text link and the target is 44px.
  **Add `scroll-margin-block-start` to the in-page anchor targets** (`--header-h` above 768,
  `--header-h-mobile` below, both existing tokens, no literal): the primary action's target is
  `#figuras`, and without it the click lands under the sticky header. This is additive, token-only,
  and it does not lower any gate.
- **Anti-patterns to avoid:** no second button; no accent-filled method link; no share control
  inside the step; no CTA label that wraps (verified: the longest locale's CTA at `--text-body`
  plus 48px of padding stays inside 288px, the 320px floor's content width); no micro-copy under
  the button ("no credit card", "it's free" style reassurance); no `·` between the method link and
  the share row.
- **Watch items:** (a) the strip must not become a grid with an empty trailing track when the share
  row is absent; (b) `hero.sub` leaves the page under this composition (it names three things and
  says nothing about consequence), so it must be retired from `REQUIRED_KEYS` and from all five
  locale documents rather than left dangling; (c) the method link is the page's only underlined
  text above `#figuras` and must not be given an accent colour; (d) **the primary action is far
  below the fold and that is a known cost.** Measured today the CTA sits at y=208; under this
  composition step 5 is the fifth step, so at 1440x900 the button lands around y=1700. T1 forbids
  anything between `<main>` and the end of step 5 that is not one of the five steps, and AC-004-25
  wants the reason above the action, so the distance is the spec's own ordering winning. Flagged for
  the human gate because AC-004-25's clause as written ("the only `--accent`-filled action above the
  fold") becomes vacuous once the CTA is below the fold: read it as "the page's only `--accent`-filled
  action", or move the clause. Do not solve it by adding a second CTA above the fold.

### Task 7: One plain sentence for the target date

- **Layout:** not a layout, a copy consolidation with one positional consequence. The formatted
  date appears once in the story, inside step 1's sentence, which sits directly under the day
  count. Nothing moves for this task beyond deleting the three paraphrases from the clock's face.
- **Components:** step 1's sentence key; the clock group's accessible name.
- **Typography:** the date inside the sentence is plain text, not `--font-mono` and not a separate
  element: it is a word in a sentence, at the sentence's size. Monospace is for measured values,
  and a date stated in prose is being described, not measured.
- **Motion:** none.
- **A11y:** the clock group's accessible name states the date in plain words; it is an attribute,
  not a text node, so it does not count against the once-only rule. `countdown.clock.a11y` is
  rewritten in all five locales to drop the "conventional date / threshold" phrasing.
- **Anti-patterns to avoid:** `countdown.clock.anchor` and `countdown.clock.anchorLabel` must not
  render in the story: together they are the phrase that turns a date into a methodology note. No
  date in step 2, step 3 or step 5; no date in the fuse and none in the pyramid.
- **Watch items:** (a) the once-only rule counts text nodes with operator subtrees stripped, so a
  date inside `data-operator="true"` markup would not be caught by the test but would still be
  visible; do not rely on the strip; (b) five locales, five rewordings, and the German and Italian
  versions are where "Schwellenwert" and "soglia" reappear out of habit.

### Task 8: The methodological precision relocates into `#metodo`

- **Layout:** one reading column, `max-inline-size: var(--measure)`, flush left, in three groups
  separated by `--border-hair` and `--space-6`: the countdown's precision, the fuse's, then the
  provenance strips. It opens with the scope mark (see below) and closes with the register key.
  Order inside the first group: `countdown.eyebrow`, `countdown.definition`, the year pair (2042
  with `countdown.yearLabel` as its label), `countdown.range`, `countdown.clock.definition`,
  `countdown.clock.arithmetic`, `countdown.backCast`, `countdown.source`. Then a hairline and the
  fuse's `fuse.label` and `fuse.definition`, then the hairline and the two provenance strips, then
  the register key.
- **Typography:** appendix register. Sentences `--text-small` / `--ink-2`; labels and dates
  `--text-meta` / `--ink-3`; numeric fragments in `--font-mono` with
  `font-variant-numeric: tabular-nums`. Region heading `nav.method` at `--text-h2`. The
  `countdown.yearLabel` pair is the one place a definition-list form earns itself: 2042 in mono as
  the value, the label key as its `<dt>`.
- **Motion:** none.
- **A11y:** the precision renders as **open text, never inside a collapsed disclosure**: AC-004-32
  requires `countdown.clock.definition` and `countdown.clock.arithmetic` outside any collapsed
  element. The distinction the design is making: the *story* demotes precision by **position**, not
  by **interaction**. The only collapsed thing on the page is step 3's data disclosure.
  `#reproducir` is reachable from here and its inbound link inherits the tap-size rule from T6:
  measured today the link is 70x**21**, so it carries `min-block-size: var(--tap-min)` in this
  register too. Demoting a control's position must not shrink its target.
  `id="metodo"` must exist exactly once on the new wrapping section, with `RegisterKey` nested
  inside it rather than carrying the id itself.
- **Anti-patterns to avoid:** no accordion for the countdown precision; no paraphrase or
  summarising of any of these strings (AC-004-34); no new label keys invented to "explain" the
  rows (the strings are self-describing and new labels would need five translations each); no
  card, no ground, no per-row box; no monospace for a full sentence.
- **Watch items:** (a) the scope mark has to land here, because AC-004-07 makes step 1's text
  exhaustive and the scope mark is not on that list, and AC-004-05 forbids anything before step 1
  except page chrome. `#metodo` is the right home: it is the region that answers "what exactly is
  measured, and where". In a multi-country deployment its country switcher therefore moves below
  the story, which is a real, recorded trade-off, out of scope to fix here, and a follow-up spec
  candidate (the header's index panel is the natural home and changing it is an IA change this
  spec does not authorise). (b) The register key's heading count is interpolated from the rows it
  renders (AC-001-91), so nesting must not change the number of rows.

### Task 9: The plain-language gate (out of scope for design)

- **Layout:** none. Build gate.
- **What the design owes it:** the copy rules below are the gate's human half and the gate is the
  mechanical half, so both must state the same thing: no dataset identifiers, no series names, no
  "dependency ratio" phrase, in any of five locales, in text nodes and in `aria-label` / `alt` /
  `title`.
- **Anti-patterns to avoid:** treating a passing gate as permission to keep jargon the list
  happens not to contain. `countdown.eyebrow` ("Proyección central · Eurostat") is the live example:
  it passes a term list and still does not belong above the fold, which is why T8 moves it.
- **Watch items:** the gate scans the rendered top region, so a banned term inside a locale only
  reachable at one route is a false green. Run it per locale, which the acceptance scenarios
  already require.

### Task 10: Unavailable figures leave the public page

- **Layout:** the appendix opens with a region heading and then only the plates that have numbers.
  At the committed data that is two plates. The heading is **outside** the `#figuras` element, not
  inside it (AC-004-43 admits no other block inside `#figuras`), so the anchor still lands on the
  first plate. Lead-in from the story: `--space-9`, no rule. Each plate keeps its existing
  `border-top: var(--border-hair)` and `--space-9` margin, so two plates read as two sections of
  one appendix and not as a list.
- **Typography:** region heading `nav.figures` at `--text-h2`, `--ink-1`. Everything inside the
  plates is unchanged.
- **Motion:** none.
- **A11y:** a `<section>` for the appendix with the heading as its label; with zero computed
  figures the heading does not render either, so a screen reader never meets an empty region.
- **Anti-patterns to avoid:** no "5 cifras en preparación" summary, no chip rows, no dashed
  placeholder plate, no progress indicator for missing data, no "coming soon" register; above all
  no greyed-out plate. A figure with no number is not a visual event.
- **Watch items:** `FigureStatusRow` stays (it signals a data-integrity failure on a figure that
  claims to be computed), so "no unavailable block" and "no withheld row" are different rules: do
  not delete the row while deleting the block.

### Task 11: Figures 3 to 7 tracked in admin (out of scope for design)

- **Layout:** none authored here. The admin panel is a dashboard and the frontend skill does not
  apply to it.
- **One directive:** the per-figure list reuses the existing `.admin-table` treatment (caption,
  `--admin-row-h`, hairlines) and adds no new visual language, no new colour and no new spacing
  token. It must look like the rest of the panel or it will look like a feature.
- **Watch items:** `--admin-row-h: 40px` is below `--tap-min: 44px`; rows are not interactive here
  so this is fine, but do not put a control in a 40px row.

### Task 12: The hero/band composition is retired

- **Layout:** the whole composition goes, and this is where the void is actually removed rather
  than edged around: `.hero`, `.hero--band`, `.band`, `.hero--band > .hero__panel`,
  `.hero--band > .hero__status`, `.hero__panel*`, `.hero__status*`, `.countdown*`, `.clock*`, the
  `max-width: 900px` reflow block that reorders the band, and every `order` declaration that only
  existed to sequence it.
- **The `order` cascade is the defect, not a style choice.** Measured on the shipped build at
  1440x900, the visual order of the band is eyebrow (y=268), years (295), days (339), fuse (530),
  share (688), and then year line (751), definition (791), range (848), source (875), back-cast
  (903), anchor (938), definition (983), arithmetic (1047); the **DOM order is eyebrow, year line,
  definition, source, back-cast, days, anchor**. `.band .countdown { display: contents }` plus
  `order:` produces two different reading orders, so a screen reader hears five caveats before the
  number while a sighted reader meets the number first. That is WCAG 1.3.2 (meaningful sequence)
  failing by construction, and it is why the recomposition deletes the mechanism instead of
  correcting the values: after this task **no rule in `globals.css` declares `order:`**, and the
  story's DOM order is its reading order in both media.
- **What replaces what:** `.band`'s ground becomes step 1's ground (full content width, flush
  left). `.band`'s centring and its `display: contents` sequencing do not survive in any form. The
  readings panel is not relocated: its content was the two figures, which now live in `#figuras`.
- **Typography:** none of the retired rules' typography carries over. The numerals are re-set on
  the story ladder (T2), not on `--text-clock-*`.
- **Motion:** the band had none; nothing to remove.
- **A11y:** the `.band .clock { display: contents }` trick existed to keep the clock's
  `role="group"` node in the accessibility tree while reordering. With no reordering there is no
  reason for `display: contents` in the story at all, and one fewer accessibility-tree edge case
  to verify.
- **Anti-patterns to avoid:** keeping `.band` as an alias for the new step 1, or keeping
  `.hero--band` "just for the mobile query". AC-004-50 greps the stylesheet; a surviving selector
  is a surviving defect.
- **Watch items:** `grid-column: 2` must appear nowhere in the stylesheet after this task, and
  neither should any `grid-area` placement on a sole child. If a two-column layout is genuinely
  needed later, it needs two children. The header is untouched by this task and by this spec:
  `SiteHeader` keeps its one-line nav, its five-cell locale group and its snapshot stamp, all of
  which are real controls and real provenance rather than decoration, and none of which is a
  locale or weather strip.

### Task 13: No empty column at any width, in any locale

**The general rule.** The defect was not a spacing bug, so the rule that prevents it is not a
spacing rule. Five statements, in the order a reviewer should apply them:

1. **A container renders only if it has content.** Every optional region (a step, `#figuras`, the
   scope mark, a plate, the share row) is a component that returns `null` when its data is absent.
   Absence is expressed by the section not existing. It is never expressed by an empty shell, an
   "unavailable" row, a placeholder, or a heading with nothing under it.
2. **A grid declares only the tracks it fills.** A multi-track `grid-template-columns` is allowed
   only when the element has at least one in-flow child per track. One child means one column, or
   no grid at all.
3. **No placement onto a track nothing occupies.** No `grid-column: 2` on a sole child, no
   `grid-area`, no `grid-template-areas` with an empty region, no `1fr` filler track, no
   `auto-fit`/`minmax` pattern whose trailing track can end up unoccupied.
4. **Right-hand metadata is placed by order, not by column.** If a row needs "thing on the left,
   counters on the right", it is `display: flex` with `justify-content: space-between` and
   `flex-wrap: wrap`, because flex has no tracks to leave empty and it degrades to two rows on a
   phone without a media query.
5. **A measure is a `max-inline-size`, never a narrow track.** An empty right margin is paper, and
   prose is allowed to be ragged. An empty track is a hole, and it is what the user saw.

The two places in the story that legitimately use multi-track grids both satisfy statement 2 by
construction: the sub-day row (three fields, three tracks) and the pyramids (three panels, three
tracks, or three rows of two tracks). Neither has an optional child.

- **Layout:** nothing to build beyond the five statements above; this task is a *removal* task
  plus a test.
- **Components:** the only component work is making each optional region able to return `null`
  without leaving a sibling behind.
- **Typography:** not applicable, and that is the point: no typographic fix exists for this defect.
- **Motion:** none.
- **A11y:** statement 1 is also the accessibility rule: a region with no content is not a landmark
  either. A screen reader should never arrive at a heading whose section is empty.
- **Anti-patterns to avoid:** the tempting non-fixes. A `1fr` spacer track. `justify-content:
  flex-end`. `margin-inline-start: auto`. `min-height` on the empty column. A `grid-column: 1 / -1`
  on the surviving child (which fixes the void and keeps the useless grid). A blanket
  `:has(> :only-child)` override (which fixes the symptom and leaves every future two-track grid
  free to fail the same way).
- **Watch items:** (a) the readout's `repeat(6, minmax(0, 1fr))` and the panels'
  `repeat(3, ...)` are the two existing multi-track grids whose child counts are data-shaped. The
  readout was measured at 1440x900 as `186px` six times with **6 children**, so today it is honest;
  but its tracks are fixed while its items come from the value, so a published year yielding fewer
  than six items becomes an empty-track violation. Count the children, not the intent. (b)
  **`AC-004-59`'s "sole grid child" wording is narrower than the defect it is meant to catch.**
  Measured, the rendered `.hero--band` has **1 child** and that child is pinned to track 2, so the
  sole-child form does catch today's shape. It would stop catching it the moment another tier
  rendered a second child, because the stylesheet pins `.hero--band > .hero__panel` *and*
  `.hero--band > .hero__status`, each independently, to column 2. The structural assertion should
  therefore be the general one, on every rule in `globals.css` that pins any child of a multi-track
  grid to a track other than the first, regardless of sibling count. Flagged for the Specifier at the
  human gate: it changes what the test must assert, not what the page must look like.

### Task 14: Each of the five steps fits one screen

- **Layout:** each step is content-height, never viewport-height. **Do not give a step
  `min-block-size`**: `100dvh` would turn step 2 (one sentence) into a 900px gallery of paper, and
  a screen full of nothing is the same complaint as a column full of nothing. The viewport is a
  ceiling, not a target.
- **Height budgets** (derived from the token values; the Coder measures and records per AC-004-62,
  and the recorded number is the assertion):

  | step | 1440x900 | 1366x768 | 390x844 (es / de) |
  |---|---|---|---|
  | 1 the number | ~390 | ~390 | ~450 / ~490 |
  | 2 what breaks | ~250 | ~250 | ~320 / ~350 |
  | 3 the pyramid | ~560 | ~560 | ~610 / ~640 |
  | 4 the distance | ~200 | ~200 | ~165 / ~180 |
  | 5 the meaning | ~320 | ~320 | ~310 / ~340 |

  The tightest case is step 3 at 390 in German, and it is tight because annotation copy grows
  faster than chart geometry: roughly 200px of headroom against the 844px bound. That is the
  number to protect.
- **Typography:** the budget is bought with prose, not with type sizes. If a step overflows, the
  fix is a shorter sentence or a tighter annotation, never a smaller font and never a hidden line
  (AC-004-63).
- **Motion:** none.
- **A11y:** the reduced-motion sub-day hide makes step 1 shorter, which is fine. A closed
  `<details>` counts at its closed height, and step 3's disclosure is the only one that can carry
  height.
- **Anti-patterns to avoid:** fixed heights with `overflow: hidden`; `clamp()` on a `line-clamp`
  to make a sentence fit; dropping the annotation on small screens to make room.
- **Watch items:** the three measured viewports are the floor of the contract, not its ceiling:
  768 and 1024 must not be *worse* than either end. The current 1023px breakpoint is exactly that
  failure mode (a full-width single pyramid at 704px wide is 626px tall, so step 3 alone would run
  to 2058px at 768). This is why T4 moves the three-up breakpoint from 1024 to 768.

### Task 15: Visual identity preserved

- **Layout:** no layout consequence. This is the lock that stops the recomposition sliding into a
  redesign:
  - **Palette lock:** `--surface-1/2/3`, `--surface-hero`, `--ink-1/2/3`, `--rule-1/2`, `--accent`,
    `--on-accent`, `--data-*`, in both themes, unchanged. No rule outside `tokens.css` declares a
    colour literal.
  - **Shape lock:** `--radius` 0 everywhere, `--shadow: none` everywhere, and the only border in
    the story is `--border-hair` (1px). The chart annotation's band mark is a 1px stroke of
    `--ink-2`, not a new device. The disclosure keeps `--border-strong`.
  - **Material lock:** one ground (step 1), one accent (olive), one alarm (amber, and only where
    it already was: the projected panel and the threshold rule).
  - **Type lock:** the three families, at the roles in §Global Tokens.
- **Typography:** the ladder in §Global Tokens is the contract. The recomposition changes which
  role a size plays, never a size.
- **Motion:** the lock is `MOTION_INTENSITY: 2`, and it is the one place a future contributor is
  most likely to drift: an entrance fade on the number, a scroll-driven fuse, a count-up
  animation on the day numeral. All three are refused here, and the reason is written into the
  contract: the page's subject is a number that changes because time passed. Dressing that in
  motion makes the number look like a decoration.
- **A11y:** both themes are token-complete, so no new rule needs a dark counterpart. Test in both
  (Step 1's ground and the annotations are the new pairs: 6.2:1 light, 5.9:1 dark, worst case).
- **Anti-patterns to avoid:** a "slightly softer" hairline; a tinted step label; a subtle
  background to distinguish odd steps; a hover state on the pyramid; an accent-coloured annotation
  marker; a 2px rule "for the step boundary"; any `color-mix` in the story.
- **Watch items:** the identity's own text is a source of drift here. `countdown.eyebrow` contains
  a `·`, the `bandLabel` and `countdown.range` strings contain an en dash. Those are existing data
  strings and stay byte-identical (AC-004-34). Newly authored copy in this spec contains no `·`,
  no colon, no semicolon, no parentheses and no dashes of any kind.

### Task 16: Locale parity for the new and retired keys

- **Layout:** no layout consequence, one layout *risk*: the five labels are the only fixed-width
  chrome in the story and German runs about 30% longer than Spanish. A step label that wraps to two
  lines adds about 17px to every step's height budget (12px at `--leading-meta`). Accept the wrap
  (never `white-space: nowrap`, never a truncation) and budget for it.
- **Typography:** all five locales set on the same ladder. No locale gets its own size, and no
  locale gets a `clamp` override to make a sentence fit. If German overflows a step, the copy
  shortens.
- **Motion:** none.
- **A11y:** `<html lang>` per route is unchanged.
- **Anti-patterns to avoid:** translating a template's placeholder away; adding a numeral that the
  Spanish original did not have; leaving `hero.sub` in the documents after it leaves the page.
- **Watch items:** the length-critical strings, in order of risk: step 5's sentence (it is `--text-h2`
  and the longest statement), the three annotations (they set the 390 row mode's height), the
  step 2 statement (it must not acquire the year), and the CTA label (must not wrap; verified at
  the 320px floor with about 19px of slack in the worst locale).

### Task 17: Retire the layout pins of 001 to 003, keep the rest

- **Layout:** this is the task that makes the composition legal. What dies with the old layout is
  exactly what measured it: the 7fr/5fr geometry, the `--measure-face` pin (17.5rem) and the
  centred face it measured, the 50px fold-clearance table, the fixed key count, and the band's
  own order. What survives is everything whose substance is a value, an accuracy property, an
  accessibility property or a reproducibility property, and those now measure the story: the
  numeral hierarchy (`AC-003-02/03/04`) is measured on step 1, the CTA hierarchy
  (`AC-002-31/32/35`) on step 5, the anchor and both disclosures (`AC-003-05`) inside `#metodo`.
- **Typography:** the re-pointed criteria keep their *substance* and their *subject*. `AC-003-02`'s
  "the day numeral is larger than the `<h1>`" is already true on the shipped page (80px against 64px,
  spec 003's OQ-2 override), so this spec preserves it rather than achieving it: the numeral does not
  move, it stops being one of four large numerals. The criterion is re-pointed at step 1 because the
  band it was written against no longer exists, not because the property changed.
- **Motion:** `AC-003-21`'s "the graphic does not move while the clock ticks" is preserved and now
  has one fewer moving part around it.
- **A11y:** every preserved accessibility criterion is asserted against the new DOM, not the old
  one, and none is re-worded to fit.
- **Anti-patterns to avoid:** re-pointing a criterion by loosening its assertion. If a preserved id
  cannot be satisfied by the new composition, that is a design failure to escalate, not a test to
  relax (AC-004-79 makes this mechanical).
- **Watch items:** `AC-001-111`'s no-JS completeness survives minus its centring clause. Verify
  the story renders complete with JavaScript disabled, because the share row and the disclosure are
  the only interactive things on the page and both must work without it.

## Law Audit

Audited against the `laws-of-ux` binding subset (16 laws) plus every additional catalogue law this
design actually triggers. Visual claims are read from the served build at
http://localhost:3000, measured 2026-11-01 at 1440x900 and 390x844 with
`getComputedStyle` / `getBoundingClientRect`, or from `web/styles/tokens.css` and
`data/derived/series/*.json`. Where a "today" figure appears, it is a measurement of the shipped
page; the design figure is what this spec specifies. Every row states the measurable consequence,
not a preference.

| Law | Status | Evidence |
|---|---|---|
| Cognitive Load | Satisfied | Above the fold today: 40 text-bearing elements, 29 at ≤15px, 22 at ≤13px, 9 distinct sizes. Step 1 carries 6 leaves in 3 chunks (title / number / sentence); steps 2, 4 and 5 carry 2 to 3 leaves each; step 3 carries 11 leaves as 3 chunks of [year, chart, annotation]. |
| Paradox of the Active User | Satisfied | In 5 seconds today a sighted reader gets the `<h1>` (64px) and `5539` (80px) but cannot say what it counts to: `.clock__anchor` measures y=938 at 1440x900, 38px below the fold, and y=1280 at 390x844. The design puts the formatted date inside step 1's sentence, and step 1's whole budget is ~390px tall (T2), so the referent lands on the same screen as the number. |
| Selective Attention | Satisfied | Today 335px of the band's 1046px is caveat chrome at 12 to 15px, in the class of object readers skip, and 22 items above the fold measure 13px or smaller. In the design every item below 17px in the story is one of three named things: a step label (once per step, `--text-micro`), the 3 sub-day labels in step 1, or the 3 chart annotations in step 3 (`--text-meta`). Items below 17px per step: 4 / 1 / 4 / 1 / 1. No definition, source, variant, back-cast or provenance line remains in the story. |
| Von Restorff | Deliberately overridden | Measured today, 4 elements above the fold carry `--accent` or `--data-projection`: `.hero__cta` (bg), `.countdown__rule` (3px bg), `.countdown__year` (ink), the fuse's burnt `rect` (fill), plus 2 large-type elements (80px numeral, 64px h1). The design reduces emphasis to 1 (the 80px numeral) and retires `.countdown__rule` (T2), but keeps 2 accent fills and the amber projected pyramid panel. **Winner: the projection encoding.** Amber distinguishes projected from observed data, which the accuracy criteria require; encoding is not emphasis. |
| Serial Position | Satisfied | First: `<h1>` at y=104 then `5539` at y=339 (measured). Last of the story: step 5's CTA. Today the band's last position is `.clock__arithmetic` at y=1047, a 12px footnote, where the ask should be. |
| Hick's Law | Satisfied | Interactive targets above the fold: 9 at 1440x900 and 4 at 390x844 today; **0** in the design, because steps 1 to 4 carry no interactive element. The five steps carry exactly 1 (step 5's CTA); the after-story strip carries 7 (the method link plus 6 share controls, required by AC-004-27), all in one row. Decision points: 2 (figures, method). |
| Choice Overload | Satisfied | Today 17 controls are reachable before the story: 9 interactive elements above the fold plus 5 locale cells plus 3 theme options. The design leaves 0 above the fold and 8 before the appendix, all in one strip instead of scattered through a 1046px band; the header controls are untouched (Jakob). |
| Miller's Law | Satisfied | One fact per step, 5 facts. Step 1 holds 6 leaves but 3 groups. Numerals above 20px in the story: 2 (80px day count, 32px years), down from 4 at 32px today. |
| Chunking | Satisfied | Story = 5 chunks; step 1 = 3 chunks; pyramid = 3 chunks of [year, chart, annotation]; `#metodo` = 3 groups separated by 2 `--border-hair` lines. |
| Law of Proximity | Satisfied | `--space-8` (64px) between steps, `--space-2` (8px) between a step label and its body, `--measure` (64ch) on prose. The 699.33px of whitespace (667.328px track + 32px gap, measured) that was asked to carry a grouping it did not contain is removed. |
| Law of Common Region | Satisfied | One ground only: `--surface-hero` on step 1, full 1176px content width. Grouping in the story is done by 5 `border-top: var(--border-hair)` lines, not by boxes: `--radius: 0`, `--shadow: none`, 0 cards. |
| Law of Uniform Connectedness | Satisfied | Every story element starts at the content edge: 1176px at 1440 and 1366, 358px at 390. One left axis; `text-align: center` and every `order` declaration retire with the band. |
| Law of Similarity | Satisfied | Today `.countdown__definition` (the claim) and `.clock__definition` (the caveat) both measure 15px and both 49px tall, so they are indistinguishable by size. The design gives each role exactly one size (80 / 34.6 / 32 / 22.3 / 19 / 13 / 12), so no claim and caveat share a size in the story. |
| Tesler's Law | Satisfied | Irreducible complexity (variants 2039 to 2043, back-cast, the conventional-date caveat, `demo_pjan`, provenance) moves to `#metodo`, which renders after step 5 and is reachable from `nav.method` and the after-story method link. Nothing is deleted: AC-004-33 and AC-004-34 require the strings verbatim. |
| Occam's Razor | Satisfied | Every story element maps to an acceptance criterion (h1 to AC-004-08, 5 labels to AC-004-03, day numeral to AC-004-06, sentence to AC-004-29, annotations to AC-004-16, CTA to AC-004-25); elements with no criterion: 0. Removed without replacement: `PendingBlock`, `.hero__status`, `hero.sub`, the readings panel. Moved rather than removed: the band's 9 caveat strings, into `#metodo` (T8). |
| Goal-Gradient | Satisfied | The fuse is the page's only progress affordance and its value is `consumedPercent: 62.44` = `observedRatio 31.22 / threshold 50` (`data/derived/series/fuse.json`). Elapsed time over the same span is about 0% (snapshot 2026, anchor 2042). Adjacent as steps 1 and 4 that would read as 62% of the road, which is wrong by 62 points, so step 4's label names its denominator (T5) and the label's words are the measurable fix. |
| Fitts's Law | Deliberately overridden | Sizes: measured today `.hero__cta-secondary` is 139x28 and `.fuse__reproduce` is 70x21, both under `--tap-min: 44px`; both now carry `min-block-size: var(--tap-min)` (T6, T8). The CTA is 221x52 and clears it. Distance: the primary action moves from y=208 (measured) to about y=1700, because T1 forbids anything between `<main>` and the end of step 5 that is not one of the five steps. **Winner: the spec's five-step order and AC-004-25's reason-before-action, over acquisition time.** |
| Jakob's Law | Satisfied | Navigation untouched: `SiteHeader` keeps its 4 anchors (`#figuras`, `#metodo`, `#debate`, `#lectura`), the 5-cell locale group and the sticky bar (`--header-h` 64px, `--header-h-mobile` 56px, the latter measured as the band top at 390). Every anchor id is preserved. One deliberate deviation: the fuse looks like a progress bar and is not one (`aria-hidden`, no `role="progressbar"`, banned by AC-003-21), which is a mental-model cost accepted for the accessibility gain. |
| Peak-End Rule | Deliberately overridden | Peak: step 1's 80px numeral. Story end: step 5's CTA. Document end: `AssumptionsLedger`, whose last text measures y=9409 of a 10208px document. **Winner: `00-informal.md` §Lo que NO quiero**, which forbids deleting the method and assumptions content, so the page cannot end on the action. Both ends inside the story are explicit. |
| Aesthetic-Usability Effect | Satisfied | The defect the polish hid, named: `--surface-hero` plus `--rule-1` hairlines made a 667.328px empty track read as generous margin, and it survived the layout pins that T17 now retires from specs 001 to 003. Defects the polish still hides and this spec fixes: the 28px and 21px targets, and 62.44% presented as distance travelled. |
| Mental Model | Satisfied | A countdown is a deadline; a fuse is fuel spent. Today both sit inside one band with different denominators. The design separates them by 2 steps and forces step 4's label to name what its percentage is a share of. |
| Working Memory | Satisfied | No value must be carried between steps: the date appears once (step 1), the 50-per-100 statement once (step 2), the percentage once (step 4), each inside a step that also states its own unit. Today the reader must hold a caveat from y=903 to interpret a mark at y=530. |
| Law of Prägnanz | Satisfied | Three pyramids at 370px each (1176px less 2 x 32px gaps, divided by 3) are read as silhouettes before values, so the annotations name a band in words and the numerals move to the disclosure. At 390 the chart column is 142px with ticks hidden by the existing `max-width: 767px` rule. |
| Parkinson's Law | Satisfied | The band measures 1046px at 1440x900 and 1456px at 390x844 for 40 and 22 text elements: content expanded to the space the band allowed. The design bounds each step by AC-004-60 (≤ viewport height) and forbids `min-block-size` on a step (T14). |
| Pareto Principle | Satisfied | Four elements carry the page's meaning: the 80px day count, the 50-per-100 sentence, the 3-pyramid comparison, the 62% line. Everything else is an entry point (1 h1, 5 labels) or the appendix. |
| Flow | Satisfied | The only autonomous change is the seconds field, reduced from 32px `--ink-1` to 13px `--ink-2` and one of four numerals to one of two; no `aria-live`. `MOTION_INTENSITY: 2` means nothing else moves after first paint. |
| Doherty Threshold | Satisfied | The reading path is static HTML with no client fetch; the only client work is the 1s tick in `web/series/clock-ticker.ts`, and the page is complete without JavaScript (AC-001-111). |
| Zeigarnik Effect | Satisfied | One open loop, held for one screen: step 2 poses the threshold, step 3 answers it, and AC-004-60 keeps each step within one viewport, so the loop closes on the next scroll rather than three screens later as it does today (`#demografia` at y=1970). |
| Postel's Law | Not applicable | The public page accepts no input. The only input surface is the admin panel, which is out of scope here (T11). |
| Cognitive Bias | Not applicable | It is a category, not a criterion; its actionable instance on this page is the Aesthetic-Usability Effect, which has its own row. |

Pre-flight re-run against this artefact, with the failures routed into the task they belong to:

- **Every binding law has a row.** 16 of 16, plus 10 triggered catalogue laws.
- **No Satisfied row without a number, token, path or count.** Checked row by row.
- **Every override names a winner.** 3 overrides, 3 named winners (projection encoding; T1's order
  plus AC-004-25; `00-informal.md` §Lo que NO quiero).
- **Elements that differ are exactly one, or the exception is justified.** One emphasis (80px
  numeral); the exception is the amber encoding, justified above.
- **First and last screens named.** First at 1440x900: step 1 (`<h1>` at y=104 measured, day numeral
  at y=339 measured, step height budget ~390px per T2) with the top of step 2 inside the fold.
  Last: `AssumptionsLedger` from about y=9000 to the footer at 10208. Last of the story: step 5's
  CTA.
- **Nothing above the fold serves the author.** Step 1's first screen carries 6 leaves; the one
  author-side object is the step label required by AC-004-03, at `--text-micro`, 1 of 6.
  Recorded rather than removed: it is a criterion, not a preference.
- **Complexity removed from the top is still reachable.** `#metodo`, linked from `nav.method` and
  the after-story method link, rendering verbatim strings outside any disclosure (AC-004-32).
- **Two `design-taste-frontend` deviations found and routed, not silenced:**
  1. "Hero fits the viewport / CTA visible without scroll" now fails: the CTA is at about y=1700
     because T1 forbids anything between `<main>` and the end of step 5 that is not a step. Routed
     to T6's watch item (d) and recorded as the Fitts override above.
  2. "Hero stack discipline: max 4 text elements" now fails: step 1 carries 6 leaves (h1, step
     label, day numeral + label, years numeral + unit, sub-day row, sentence). Four of the six are
     required by AC-004-07 and AC-004-08, which name the day count, its label, the sub-day fields,
     the years numeral and the one sentence as step 1's exhaustive content. Routed to T2's watch
     list: the Coder may not compress the stack further, and if it must, the sentence is the last
     thing to lose, never the number's label.

  The rest of that checklist was re-walked and holds.

## Out-of-scope tasks

| Task | Why it is out of scope | What the design owes it |
|---|---|---|
| T9 plain-language gate | a build gate, no visual surface | the copy rules above are the human half of the same rule |
| T11 admin figure tracking | admin panel / dashboard, which the frontend skill excludes | reuse `.admin-table`; add no visual language |
| T16 locale parity | content-model and test work | the length-risk list under T16, and the no-per-locale-type rule |
| T17 retired criteria | test and traceability work | the statement of which layout pins die with this composition |

Two findings recorded here and deliberately not fixed, proposed as follow-up specs rather than
smuggled into this one:

1. **In-page anchors land under the sticky header.** No rule in `globals.css` declares
   `scroll-margin-block-start`. T6 fixes it for the story's two anchor targets because the primary
   action's destination is one of them; the appendix's anchors inherit the same defect.
2. **The multi-country scope switcher moves below the story** when the scope mark relocates to
   `#metodo` (T8). The header's index panel is its natural home, and moving it is an information
   architecture change this spec does not authorise.

Open question for the human gate, and the only one that changes what the Coder builds: whether
step 1 keeps `--surface-hero` as its ground. The design takes yes, with the fallback stated in
§Design System / Foundation.
