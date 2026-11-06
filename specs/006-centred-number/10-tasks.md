# 006-centred-number — tasks (stage 1)

Source: `specs/006-centred-number/00-informal.md` (user decision, 2026-11-06: **one centred
axis**). This file is the only requirements input the later stages read. Nothing here is
implemented yet; the human gate reviews this file and `20-acceptance/` before `/build`.

The change is a **composition and palette** change on the public page. Spec 004 fixed structure,
spec 005 fixed words. Neither touched what the page looks like, and the served page fails the
usability laws the pipeline requires in its own design artifact — plus four defects the user named
after seeing it deployed: the peach panel, the palette, four numbers for one quantity, and a share
link pointing at the wrong host.

**Revision 2 (2026-11-06, after the deployed review).** Three decisions were added and are locked:
a neutral palette with one accent, one number in step 1, and a canonical share origin. Removing the
sub-day fields also removes the client clock, which makes step 1 static HTML — a criterion, not an
afterthought. Tasks 1–7 are kept; where the new scope contradicts one it is revised in place and
the revision is stated, never applied silently. Tasks 8–13 are new. The supersession burden grew
from 3 criteria to **35**: §4 names every one.

Still frozen: type families and the type scale, the instrument register (004), the copy (005) except
the one sentence whose numerals change, the data, and five-locale parity.

## 1. Baseline, measured on the served page

Measured on `https://pensions-system-delta.vercel.app/` on 2026-11-06 with
`getBoundingClientRect()`, `getComputedStyle()` and `Range.getClientRects()` over every text leaf
and every interactive element above the fold. These are the numbers the criteria below are
written against; they are not estimates.

| Viewport | Step 1 content box | Centre | `h1` ink offset | Step-label ink offset | Sentence ink offset | Sentence residual asymmetry | Step 1 height / viewport | Text leaves | Distinct sizes | Interactive above fold | Of those, short axis < 44px |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 390×844 | 16 – 359 | 187.5 | −39.8 | −134.6 | −1.4 | +3 | 641 / 844 | 18 | 10 | 4 | 4 |
| 1366×768 | 88 – 1264 | 675.5 | −42.0 | −551.1 | −213.6 | +427 | 559 / 768 | 28 | 10 | 12 | 12 |
| 1440×900 | 125 – 1301 | 712.5 | −42.0 | −551.1 | −213.6 | +427 | 559 / 900 | 28 | 10 | 12 | 12 |

Reconciliation with the informal spec's headline figures, so no later stage thinks two numbers
disagree:

- **"402 px of empty paper"** is the *box-level* gap: the sentence's 774 px box inside the step's
  1176 px content box leaves 402 px on the right and 0 on the left. The **ink-level** residual in
  the table is 427 px because the sentence's last line ends 26 px short of its own 774 px box.
  Both are real and both are the same defect; the criteria measure **ink**, because ink is what a
  reader sees and it is the only measure that survives a change of `max-inline-size`.
- **"28 leaves in 10 sizes"** reproduces exactly at 1366×768 and 1440×900. At 390×844 the same
  expression returns 18 leaves in 10 sizes once the closed `<details>` index panel's contents are
  excluded (Chrome reports non-zero rects for them; see §2.1). Its `<summary>` trigger stays counted
  and carries no text leaf, so the count is unaffected by the exemption.
- **"the `días` unit at 12 px" does not reproduce.** The served page computes `días` at **19 px**
  (`--text-body-lg`) at every measured viewport; the 12 px items are the three sub-day *labels*
  (`horas`, `min`, `s`) and the 13 px items are the three sub-day *values*. The requirement the
  informal spec draws from that number ("the unit stops being a 12 px tombstone") is satisfied by
  19 px today, so no criterion is written against it. The 12/13 px defect is real and is carried
  by Task 3. Recorded as D7 in §6.
- **Twelve interactive elements**, named, at 1366×768 and 1440×900: skip link `#main` (115×26),
  wordmark `/` (96×28), four nav anchors `#figuras` (37×21), `#metodo` (48×21), `#debate` (47×21),
  `#lectura` (49×21), five locale cells `/`, `/en`, `/fr`, `/de`, `/it` (36×36), theme toggle
  button (40×40). At 390×844 the desktop nav and locale group are `display:none` by the existing
  responsive rules, and four targets render above the fold: skip link (115×26), wordmark (86×24),
  index trigger `<summary>` (40×40), theme toggle (40×40).
- **Three competing accents** above the fold: accent-coloured text (`--accent`, `rgb(59,85,18)` —
  six leaves at 1440), the current locale cell's `--ink-1` ground (`rgb(30,22,13)`), and step 1's
  `--surface-hero` band (`rgb(254,232,208)`, 1176×559).

### 1b. The four defects the deployed review added (measured 2026-11-06)

| # | Defect | Measurement |
|---|---|---|
| 1 | **The box is glued to the header** | step 1's border box starts at **y = 64 px**, exactly the header's bottom edge: **0 px** of gap. It is 1176 × 559 painted `rgb(254,232,208)`. |
| 2 | **The colour reads as a stain, not a surface** | `--surface-hero` `#fee8d0` on `--surface-1` `#fdf2e1`: CIEL\* **93.16** against **95.92**, a **2.76 L\*** gap, contrast **1.073:1**. In dark: `#201406` on `#17110b`, 1.93 L\*, **1.038:1**. A surface that is neither absent nor discernible. |
| 3 | **Four numbers for one quantity** | step 1 renders `16 años`, `5534`, `días` and `14 / 19 / 57` (hours, minutes, seconds) — four quantities, one of which is a ticking clock. |
| 4 | **The share link points at another host** | `<link rel=canonical>`, `og:url` and all four share controls carry `https://pensions-system-danielbueno76-4270s-projects.vercel.app`; the page is served from `https://pensions-system-delta.vercel.app`. Root cause: `web/content/site.ts`'s `DEFAULT_SITE_URL` is that project alias, and every absolute URL derives from it. |

Defect 3 is what makes the static requirement exist: with no seconds there is nothing to tick, so step 1 needs no
client clock and becomes static HTML. The current number group is a `'use client'` component
(`web/components/series/CountdownClock.tsx`) with a 1 Hz ticker (`web/series/clock-ticker.ts`).

## 2. Measurement contract

Every layout criterion in `20-acceptance/` is stated in these terms. The Coder implements the
tests with this vocabulary verbatim; a test that measures something else is not evidence for the
criterion.

1. **Rendered** — the element has a non-zero border box, `visibility` is not `hidden`, and it is
   not a descendant of a closed `<details>` **other than that `<details>`'s own `<summary>`
   child**. The trigger is painted, focusable and a real target; the closed panel's contents are
   not. Chrome returns non-zero rects for the whole subtree of a closed `<details>` on the page as
   served (measured: the closed mobile index panel reports a 40×420 box at x = 271), so the
   exclusion has to name the summary explicitly — "no descendant of a closed details" also drops
   the trigger, and the trivial version ("exempt the details element") drops nothing.
   Worked check at 390×844: with the panel's contents excluded and its summary counted, **four**
   targets render above the fold (skip link, wordmark, `<summary>`, theme toggle); the literal
   "no descendant" rule returns **three**, which makes AC-006-09 unsatisfiable by construction.
   A nested closed `<details>` is resolved by the same rule against the element's nearest closed
   ancestor, and only that ancestor's own summary is exempt.
2. **Above the fold** — rendered, and `rect.top < innerHeight` and `rect.bottom > 0`. Horizontal
   position is *not* considered: the skip link parks at `left: −9999px` until focused and is still
   a target the informal spec names.
3. **Text leaf** — an element with at least one direct child text node whose `textContent.trim()`
   is non-empty, and no child element that itself carries text. This counts a leaf once, not once
   per wrapper.
4. **Ink extent of a unit** — the union of `Range.getClientRects()` taken **over each text node**
   inside the unit, keeping rects wider than 1 px. `Range.selectNodeContents` over an element also
   returns its element children's boxes, so an element-level range makes a full-width block look
   centred when its text is flush left. Per-text-node ranges are the measurement.
5. **Content box of step 1** — `[data-top-step="number"]`'s border box inset by its computed
   `padding-left` and `padding-right`. The window centre is *not* the reference: the measured pages
   carry a 15 px scrollbar, so at 1440 the visual viewport centre is 712.5, not 720.
6. **Centre offset** — `|inkCentre − contentBoxCentre|`, where `inkCentre` is the midpoint of the
   unit's ink extent.
7. **Residual asymmetry** — `(contentRight − inkRight) − (inkLeft − contentLeft)`, i.e. the trailing
   gap minus the leading gap. It equals `−2 ×` the centre offset, so the two forms are one
   measurement; it is written out because it is the literal form of "no half-empty right side" and
   it is the number the informal spec complains about (0 leading, 427 trailing on the sentence's ink
   before this spec, 402 on its box).
8. **Painted ground** — an element (other than `html`/`body`) whose computed `background-color` is
   not transparent and differs from the nearest ancestor's non-transparent `background-color`, with
   a painted box of at least 32×32 CSS px (`--space-6` squared). The area floor keeps a rule, a
   border and a 1 px inset out of the count; it does not let a real panel through (the baseline
   measured two: a 36×36 chip and the 1176×559 band).
9. **Distinct type size count** — the number of distinct computed `font-size` values among the
   rendered text leaves above the fold.
10. **Locale × viewport matrix** — the five locales (`es`, `en`, `fr`, `de`, `it`) at the three
    viewports the suite already uses: 390×844, 1366×768, 1440×900. Fifteen pages. Width sweeps use
    the eight widths AC-004-56 already walks: 320, 360, 390, 768, 1024, 1280, 1366, 1440 (height
    900 except 390, which keeps 844).
11. **Chromatic / neutral** — computed with the project's existing helper, `tests/helpers/colour.ts`:
    a token is **chromatic** when its CIELCh `chroma()` exceeds **20** (the threshold the palette
    tests already use for "this is a hue") and **neutral** when it is at most **10**. The band
    between 10 and 20 is a "tint" and is not allowed as a public token value: a palette that is
    supposed to be neutral but carries a 15-chroma tint is the peach defect again. A worked
    palette that satisfies both bounds is in §6 D14 — it is a feasibility proof, not a value this
    spec prescribes.
12. **Contrast** — `contrast(foreground, ground)` from the same helper, a WCAG 2.1 relative-luminance
    ratio, evaluated on the declared hexes and never on a quoted number. Minimums follow the
    project's existing convention (`palette-labels.test.ts`): **3:1** for non-text graphics,
    **4.5:1** (AA) for text, **7:1** (AAA) where the shipped table already demanded it. A pair table
    is a list of real `{foreground, ground, minimum}` rows on the page, not a list of colours.
13. **Form encoding** — a distinction carried by something other than colour: a `stroke-dasharray`,
    or a `fill: url(#…)` that resolves to an SVG `<pattern>`. It must be a *valid* paint, and this
    is measurable: `CSS.supports('fill', 'repeating-linear-gradient(45deg, #000 0 3px, #fff 3px 4px)')`
    is **false** in Chromium, while `CSS.supports('fill', 'url(#hatch)')` is **true**. The existing
    `--chart-hatch` is a CSS gradient used as a `fill`, so it paints nothing today; a criterion that
    asked only "is a hatch declared" would pass on a mechanism that does not render.

**Tolerances and their justification.** Centre offset ≤ **4 px** (`--space-1`); residual asymmetry
≤ **8 px** (`--space-2`). Both are existing scale values, and both are two orders of magnitude
smaller than the smallest defect they must catch (134.6 px at 390×844, on the step label). The
tolerance is on the *centre*, not on width, so German's longer compounds change line breaks and not
the centre — a correct implementation is exact to sub-pixel rounding in all five languages. A
tolerance stated as a width budget would have been the locale-fragile one; this one is not.

## 3. Scope

In scope, by file:

- `web/styles/globals.css` — the header chrome, the five story steps, the number group, the
  demography panel encoding.
- `web/styles/tokens.css` — **the colour tokens only** (surface, ink, rule, accent, on-accent,
  data-*, chart-*). A colour token may be revalued or retired; no type, space or geometry token may
  change except where §4 names it. `--surface-hero` is retired.
- `web/content/site.ts` — the committed canonical origin.
- `web/components/public/NumberStep.tsx` and `web/components/series/CountdownClock.tsx`,
  `web/series/clock-ticker.ts` — the number group becomes server-rendered; the clock component and
  its ticker are deleted. `readClock()` itself stays: the day count and the share message still use
  it.
- `web/components/**` and `web/series/**` — only where a demography panel's paint moves from hue to
  form.
- The acceptance tests that carry the frozen numbers, and the two retirement lists (§4).

Out of scope, frozen: font families and the type scale, `--space-*` values, the copy (AC-005-01…11,
except the removal of two quantities from step 1 and the sentence's own numerals, which do not
change), the data and the derived series, the five-step order, the five locales, the admin surface,
the registers below the story, and motion (there is none).

**The markup does change now.** Revision 1 expected a CSS-only composition; revision 2 removes two
rendered quantities and a client component, so `NumberStep` loses a subtree. Everything else in the
story keeps its DOM shape, and `.clock__field--days`' `grid-column: 1 / -1` constraint
(AC-004-59) is moot because that row is deleted — see §4 for the criterion that changes with it.

## 4. Supersessions — named, not implied

Revisions 2 and 3 touch **35 criteria** across specs 001, 002, 003, 004 and 005: **15 are retired**
(their subject no longer exists) and **20 are re-pointed** (the subject survives, the assertion
moves). Two of the 20 are clause-level re-points — AC-003-02 and AC-003-03 — where the criterion
survives but one pinned declaration inside it cannot. Two more — **AC-002-31** and **AC-003-22** —
are the ones revision 3 adds: they *mandated* the accent fill on the primary action and on the
fuse's burnt segment, so a Coder following the design's "one accent, on the numeral" had to turn
the suite red. Their absence from revision 2's record is what let AC-006-26 stay green while four
things painted the accent. Nothing is deleted silently, and no retired id is left cited by a test — the two lists in
`scripts/check-scenario-traceability-3digit.ts` are the mechanism, and §4.5 spells out the edit.

### 4.1 Retired — the subject is gone, with the id that replaces it

| Criterion | What it encoded | Replaced by |
|---|---|---|
| **AC-001-109** | A definition/disclosure line inside step 1 is unconditional in every state where the clock renders. | AC-006-29 — step 1 is the quantity, the unit and the sentence; there is no in-step disclosure and no clock. |
| **AC-001-111** | Without JavaScript the server-rendered clock's markup is complete and correct. | AC-006-32 — the served HTML *is* the value; there is no second, hydrated value to compare it with. |
| **AC-001-112** | `prefers-reduced-motion` shows the static value and creates no tick. | AC-006-33 — no ticker exists in any media state. |
| **AC-001-113** | The accessible tree is stable and the animated region is `aria-hidden`. | AC-006-33 — there is no animated region to hide. |
| **AC-001-114** | Exactly one interval is created, cleared on unmount, with no layout shift. | AC-006-33 — zero intervals are created. |
| **AC-001-116** | The clock is confined to the instrument register. | AC-006-29 — the register boundary is carried by AC-004-30/32, which stay in force. |
| **AC-002-04** | The light accent is more saturated (greater CIELCh chroma) than `#425425`. | AC-006-25 — the accent is specified by contrast against the new surfaces and by being the only chromatic token; a chroma delta from the olive is meaningless once the family changes. |
| **AC-002-05** | The dark accent is more saturated than `#9cc17f`. | AC-006-25 — same. |
| **AC-002-06** | The accent keeps the olive family within ±8°, and is not red, teal or blue. | AC-006-26 — the accent is red (oxblood) **by decision**; what is bounded instead is where it may appear. |
| **AC-002-07** | Warm paper, radius and shadow are unchanged; every ground literal is what it was. | AC-006-24 (the paper is now neutral, and its pairs are measured) + **AC-004-65**, which stays in force for radius and shadow. |
| **AC-003-04** | The seconds tick at display size on desktop. | AC-006-29 — the seconds field does not exist. |
| **AC-003-07** | Reduced motion hides the tick and does not freeze it. | AC-006-33 — no tick. |
| **AC-003-09** | Clock behaviour is unchanged by the band. | AC-006-29 — neither the band nor the clock exists. |
| **AC-004-31** | The clock's `role="group"` accessible name carries the date and no jargon. | AC-006-30 — the date's accessible path is the sentence's visible text, which AC-004-29/AC-005-09 already count exactly once. |
| **AC-004-64** | The palette and the type scale are untouched; every named colour keeps its shipped value. | AC-006-24 (palette) + AC-006-14 (the type scale is still pinned and still ≤9 sizes). |

### 4.2 Re-pointed — the subject survives, the assertion moves

| Criterion | What it encoded | Now asserts |
|---|---|---|
| **AC-001-099** | The years quantity is the difference of two printed integers with no sub-annual unit, printed beside them **in step 1**. | The same invariant, at its new position: the years quantity and its two integers are visible text in `#metodo` (AC-006-31). |
| **AC-001-106** | A projected value is encoded by dash, position and a printed word — *and* the amber literal is declared, and `.countdown__year` is painted in it. | The form encoding is the **only** encoding: hue is identical across panels, the projected series carries a dash or a valid pattern the observed series does not, the state is printed in words (AC-006-27, AC-006-28). The two hue clauses are dropped. |
| **AC-001-110** | No clock renders without a threshold year. | No numeral renders without a threshold year; without an anchor the step falls back to the projection's own sentence (AC-006-29). |
| **AC-001-115** | The elapsed state means the date passed, and nothing more. | The elapsed state renders the sentence and no numeral (AC-006-29). |
| **AC-001-117** | Every real text/ground pair meets its stated minimum in both themes; no retired value survives; the deficit hue is unchanged. | The same method and minimums on the **new** pair table; the "deficit hue unchanged" clause becomes "the deficit series is a neutral ink plus the hatch form" (AC-006-25, AC-006-24). |
| **AC-002-08** | The accent's pairs are recomputed on four surfaces; exactly three chromatic hues, each >20° from the accent; `--on-accent` keeps its design target. | The accent's pairs on the surviving surfaces, and **one** chromatic token rather than three (AC-006-24, AC-006-25). |
| **AC-002-17** | AC-001-099's slice locates `class="countdown__value"` in step 1. | The slice locates the years quantity in `#metodo` (AC-006-31). |
| **AC-002-31** | "One visually dominant primary action": the CTA is a **filled accent block** (`background: var(--accent)`, `color: var(--on-accent)`) and the page's *only* accent-filled action — `expect(filled).toEqual(['.hero__cta'])`. | The primary action stays dominant but stops being the accent: an ink ground (`--ink-1`) with surface ink (`--surface-1`, 16.83:1 light and 17.01:1 dark), same radius, padding, type, and "no underline". The accent budget is now owned page-wide by AC-006-26, and the ring still sits outside the fill via `--focus-offset` (AC-006-36). The `filled === ['.hero__cta']` assertion **inverts** to "no rule fills with the accent". |
| **AC-003-02** *(clause)* | The day numeral is larger than the `h1` on the ladder: `--text-num-xl` on the numeral, the display cap at 4rem, **and** `min-inline-size: var(--clock-days-min)` (5ch) reserving a fixed advance on `.clock__value--days`. | The size comparison survives and is asserted by AC-006-12 and the browser measurement. The **5ch reservation is dropped**: with it the numeral's box is wider than its glyphs, so the unit-beside gap measures **40.23 px** and the numeral's ink union sits **14.11 px** off the axis; without it, **12.0 px** and **0.01 px** (design measurement, 2026-11-06). What holds the invariant now is AC-006-03 (gap ≤ `--space-3`) and AC-006-01 (axis ≤ 4 px). |
| **AC-003-03** *(clause)* | The day numeral is the largest numeral on the page: among other things, `.countdown__numeral { font-size: var(--text-num-l) }` — the years numeral's step-down to 2rem. | The years numeral leaves the story, so that rule has no user and the clause cannot be asserted. The invariant — no numeral larger than the day count, no plate numeral competing — survives and is asserted by AC-006-12 and by the browser measurement `days === maxNumeral`. |
| **AC-003-22** | "The fuse carries no alarm hue and no new hue": burnt is `fill: var(--accent)`, cord is `fill: var(--ink-3)`, no deficit/projection token in the fuse block — and the fuse is outside the **clock** subtree. | Burnt becomes an ink (`--ink-1`) and the pair **improves to 3.11 light / 2.57 dark**, from 1.82 / 1.19 while the neutral accent still filled it (1.14 / 1.51 was the retired olive palette's pair, and 3.11 / 2.57 is the design's own target). The "no alarm hue, no new hue" invariant survives and is now stronger: no chromatic value at all on the fuse. The clock-subtree clause is re-pointed to "step 4, not step 1", because there is no clock. The measured floor is AC-006-37. |
| **AC-003-26** | Every share control shares the route's `canonicalUrl()`, with no tracking parameter — a self-consistency check, which passed while the canonical origin was the wrong host. | The shared origin **is the origin serving the page**, and the committed default is not a Vercel project alias (AC-006-34, AC-006-35). |
| **AC-004-06** | The day count comes from the committed countdown and appears exactly once; the numeral sits on the ladder's top step. | The same, with the numeral's new carrier (AC-006-29). |
| **AC-004-07** | Step 1 carries the number group and one sentence and nothing else; the group's class list includes `countdown__numeral` (the years line). | Step 1 carries **one quantity**, its unit, the label and the sentence (AC-006-29). |
| **AC-004-59** | No rule places a grid child outside the first track, and the sheet holds exactly two `grid-column` pins: `.clock__field--days` and `.demography__panel-head`. | The same rule with **one** pin: `.clock__field--days` is deleted with its row, so the list is `.demography__panel-head` alone. The "no placement off track 1" clause is unchanged. |
| **AC-004-66** | No new hue and no new colour token; no colour literal outside `tokens.css`. | Exactly **one** chromatic token (the accent, revalued) and still no literal outside `tokens.css` (AC-006-24). |
| **AC-004-68** | The contrast pairs still pass and no minimum is lowered. | The same on the new pair table; no minimum moves (AC-006-25). |
| **AC-005-14** | Headline, **clock** and sentence are separated enough to read as three things (a ≥`--space-5` gap measured on the `.clock` box). | Headline, **number** and sentence, measured on the number element's box (AC-006-01). |
| **AC-005-16** | The air is spent with tokens; step 1 keeps its ground and gains no border; the token file is byte-identical. | Only the first clause survives (and it applies to the new rules). The ground clause is retired by AC-006-22; the byte-identity clause by AC-006-18, revised. |
| **AC-005-38** | The retired list is **unchanged** and has exactly 24 entries; no preserved id is lost. | The list is the **union** — spec 005's 24 plus this spec's 15 — and every id in `PRESERVED` still has a test (AC-006-21, §4.5). |

### 4.3 Kept in force

Named because this revision could plausibly break them: **AC-001-101** (its "no clock" clause becomes
vacuously true), **AC-001-118** (already re-pointed for the ground by AC-006-15; its display-scale
and `--measure` clauses stand and are the reason AC-006-14 can still pin the type scale),
**AC-002-13**, **AC-002-14**, **AC-003-05**, **AC-003-28**, **AC-003-44**, **AC-003-46**,
**AC-004-29**,
**AC-004-30**, **AC-004-32**, **AC-004-33**, **AC-004-55…58**, **AC-004-60…63**, **AC-004-65**,
**AC-004-67**, **AC-005-01…13**, **AC-005-15**, **AC-005-17…37**, **AC-005-39**.

Some of those lose their *carrier file* rather than their assertion and must be re-cited verbatim in
a surviving file: **AC-002-13** and **AC-002-14** live in `clock-unify.test.ts`, which is about the
merged group and goes with it; **AC-001-101** lives in `countdown.test.ts`, which survives because it
also carries the countdown value, but its "no clock" clause has to be re-read now that no step
renders one.
`AC-003-05` already asserts the anchor and both disclosures are visible text **in `#metodo`**, so it
survives untouched. AC-003-22 is **not** in this list: it is re-pointed (§4.2) because it mandated
the accent fill the design removes. `AC-003-02` and `AC-003-03` are **clause-level re-points**, not
preserved wholesale: their size comparisons stay in force and are restated by AC-006-12, but the two
declarations they pin — the 5ch reservation and the years numeral's `--text-num-l` rule — cannot
survive (§4.2).

`AC-002-10` and `AC-002-11` ("the years numeral and the day count are one centred group; no left
alignment reintroduced") were **retired by spec 004**. Their substance returns under AC-006-01, but
their ids stay retired: reviving them would put two tests on one requirement and misstate which
spec decided it.

### 4.4 This spec's own revision — ids revised in place

No id is renumbered and none is dropped. These eight keep their number and their citation, and
their scenario text states the reversal:

| Id | Was | Is |
|---|---|---|
| AC-006-01, AC-006-02 | six centred units, including the days line and the sub-day row | **four** centred units — and since revision 3 the set is **derived from the DOM**, not listed, so a fifth block cannot escape it: `h1`, step label, the one number, the sentence |
| AC-006-04 | the group publishes four fields, in order | the group publishes **exactly one** quantity and nothing else |
| AC-006-05, AC-006-06 | the sub-day row is at least 15 px and fits at 320 | the sub-day row is **gone** from step 1; the detail survives in `#metodo` |
| AC-006-11 | no text above the fold carries the accent | exactly **one text leaf's `color`** does, and it is the day numeral; every other above-fold text leaf is an ink and none is a surface colour. The every-channel, whole-page count is **AC-006-26's**, not this criterion's |
| AC-006-16 | AC-005-16's ground clause is inverted | also names the third clause (token byte-identity) as superseded by AC-006-18 |
| AC-006-18 | the token file is byte-identical | the token file's change set is the declared one (colour revalued/retired; type, space and geometry frozen) |

**Revision 3 — the counting-method sweep.** The Verifier found that AC-006-26 counted `color:`
declarations while claiming to bound where the accent paints, and that AC-006-11 counted
above-fold text leaves while claiming the fold. The cause was not those two criteria alone but a
shape they shared with several others: **a criterion that counts one channel and claims a class**.
Each instance is fixed one of two ways — by making the count see what the claim covers, or by
narrowing the claim to what the count sees — and the id surface is unchanged either way:

| Id | Counted | Now counts |
|---|---|---|
| AC-006-26 | `color:` declarations only | every paint channel, every rendered element, plus every resting rule: `color`, `background-color`, `border-*-color`, `fill`, `stroke`, `outline-color`, `box-shadow` |
| AC-006-11 | above-fold text leaves' `color` | **not widened** — the claim was narrowed instead. It stays the fold's text-leaf half, and the every-channel count lives in AC-006-26 |
| AC-006-10 | `background-color` | also borders of 2 px or more and non-`none` `box-shadow`s, so a competing rectangle cannot migrate into a border |
| AC-006-12 | "the only element" | "the only **text**" — the claim now matches the measurement instead of the measurement being widened to a meaningless claim |
| AC-006-13 | background + weight/decoration | also `border-*-color`, so the locale marker cannot migrate into a border |
| AC-006-20 | four paint properties | every paint property, so a `fill:` or `box-shadow:` literal cannot hide |
| AC-006-25 | a hand-list of pairs | the full ink × surface matrix, with a row retired only when nothing paints it |
| AC-006-29 | "no time-of-day text" | a digit-bearing text-node count inside the number group: exactly one |
| AC-006-01 | the four named units | every text-bearing direct child, derived |
| AC-006-07 | a selector list | also `[role="button"]` and `[role="link"]` |

### 4.5 The mechanical consequence of retiring an id

Retiring is a procedure here, not a deletion, and it has a cost that must be paid in the same
change:

1. Add the id to `RETIRED_SCENARIOS` in `scripts/check-scenario-traceability-3digit.ts`. The gate
   then stops demanding a citation and still refuses one.
2. Add it to `RETIRED` in `tests/acceptance/retired-criteria.test.ts`, built with that file's
   `id()` helper so the file does not cite the id in its own text.
3. Remove the four ids this spec retires from that file's `PRESERVED` list: **AC-001-111**,
   **AC-001-112**, **AC-003-04**, **AC-003-07**.
4. Delete the citations from every file that carried them — `clock.test.ts`,
   `clock-coverage-gaps.test.ts`, `countdown-band.test.ts`, `countdown-band-browser.test.ts`,
   `palette-accent.test.ts`, `visual-identity.test.ts`, `story-steps.test.ts`, `hero-copy.test.ts`.
   The clock and band describes go with the clock they test; the palette describes lose the rows
   whose tokens retired. The ids that survive from those files (AC-001-110, AC-001-115, AC-002-13,
   AC-002-14, AC-003-02, AC-003-03) must be re-cited in the surviving number-step test, and
   AC-001-101's and AC-003-05's carriers (`countdown.test.ts`, `countdown-band.test.ts`) must not
   take their ids down with the clock.
5. `RETIRED` grows from 24 entries to **39**, so AC-005-38's `toHaveLength(24)` is re-pointed (§4.2)
   in the same commit. A criterion that pins a count of retirements is a criterion every later
   retirement breaks; that is why it is re-pointed rather than deleted.
6. Two **re-points invert an assertion rather than move it** — AC-002-31 and AC-003-22 — and their
   carriers are `cta-hierarchy.test.ts` and `fuse.test.ts`. Both tests currently assert the accent
   is *present* (`background: var(--accent)` on `.hero__cta`; `fill: var(--accent)` on
   `.fuse__burnt`), so re-pointing them means rewriting the assertion to its opposite and keeping
   the id. These are the two that made "the accent is spent once" unimplementable, and the record
   has to say so rather than let a future reader think the Coder invented the change.
7. Two **clause-level** re-points do not touch either list: AC-003-02 and AC-003-03 keep their ids
   and their citations, and lose one pinned declaration each. Their carriers are
   `countdown-band.test.ts` (lines pinning `min-inline-size: var(--clock-days-min)` and
   `.countdown__numeral`) and `countdown-band-browser.test.ts` (which measures
   `days === maxNumeral` and therefore still passes once the years numeral is gone).

## 5. Tasks

### Task 1 — Compose step 1 on one axis

**Goal.** Every unit of step 1 is composed on the centre of the step's content width, so the
402 px of empty paper on its right disappears and the same block is symmetric in all five
languages at every width from 320 to 1440.

**The centred units** — four since revision 2, and this is the complete list. The criterion
measures ink (contract §2.4), so an implementation that centres a box while leaving its glyphs
flush left fails:

1. the `<h1>` (`.hero__title`)
2. the step label (`.step__label`)
3. the number — the day numeral and `días` on one line (`.clock__value--days` and its unit)
4. the sentence (`.step__sentence`)

Revision 1 listed six: the years line and the three-cell sub-day row were units 3 and 5. Both are
gone (Task 11), so the axis now has two less to hold and one more thing to prove — that the four
that remain are centred in five languages, which the scenarios still require.

**Acceptance criteria**
- For each of the four units, in all fifteen pages of the matrix, `|centre offset| ≤ 4 px`
  (`--space-1`) and `|residual asymmetry| ≤ 8 px` (`--space-2`).
- The same holds across the eight-width sweep at `es`, and at 320 and 1440 at `de` (the longest
  words).
- Step 1's content box, its padding and its total height are unchanged by this task (the air
  criteria AC-005-12…15 stay green untouched).
- The criterion is not satisfied by widening: the sentence's ink stays at most `--measure`
  wide, and no unit is grown to the full content box to force its offset to zero.
- The number is a single visual object: the numeral and `días` share one line and one centre, and
  the unit is not pushed to a second line by the centring.
- AC-004-55…58 stay true. Their premise (a container whose tracks start at its left edge) no
  longer has the sub-day row to worry about, because the row is deleted; nothing in Task 1 may
  introduce a centred multi-track grid in its place.

**Watch items**
- If `.clock__value--days` keeps a `min-inline-size: var(--clock-days-min)` (5ch) reservation it
  reserves about one character more than the four digits occupy — roughly 48 px at 1440's 80 px
  numeral. The slot was dropped because of this. If
  that box is centred with `text-align: start`, its glyphs sit about half of that to the left of
  the box's centre and miss the 4 px tolerance. The numeral's own box must centre its glyphs, or
  the reserved advance must shrink to the content (the token itself must not change).
- `.step__sentence` is `max-inline-size: var(--measure)` (774 px) today. Centring it means
  `margin-inline: auto` **after** the existing `margin: var(--space-5) 0 0`, or the shorthand
  re-zeroes it. `margin-inline` is not in AC-005-16's token-resolving property list, so `auto` is
  permitted there; a bare `margin: 24px auto 0` would not be.
- German at 320 px is where line breaking is tightest; the tolerance is on the centre, so nothing
  in the criterion tightens with longer words — but the 320 sweep is the case that proves it.

**Scenarios.** AC-006-01, AC-006-02.

### Task 2 — Recompose the number group as one measured quantity

**Goal.** The day numeral and its unit read as one object on the axis, and the group publishes
exactly one quantity: `5534 días` and one sentence. The years numeral and the three sub-day fields
leave step 1 (Task 11 carries the removal; this task carries the surviving group's composition).

**Acceptance criteria**
- The ink gap between the day numeral and its unit is `≤ --space-3` (12 px) — the unit stays
  *beside* the number, not floated off it — in the fifteen pages of the matrix. Today the same gap
  is `var(--space-3)` on the days line; the criterion forbids the unit drifting while everything is
  re-centred.
- The unit's computed `font-size` is `≥ --text-small` (15 px): it is legible next to an 80 px
  numeral and cannot regress while the composition is reworked. (It computes 19 px today — see
  §1's reconciliation. The floor is a regression guard, not a change to make.)
- The group renders, in DOM order: the day numeral, `días`, then nothing else. No years numeral, no
  sub-day cell, no unit other than `días`, no second quantity of any kind.
- No field is hidden by CSS to satisfy the previous bullet: the elements are absent from the DOM,
  not `display: none`.
- The numeral and the unit keep their accessible reading: the unit is text, not an `aria-label` on
  a `<span>` of digits, and the group's accessible name is not a substitute for either.

**Watch items**
- `countdown.clock.days` is the `días` string; `countdown.clock.hours`/`minutes`/`seconds` become
  unused by the story and move to `#metodo`'s detail (Task 11) or leave the content model with
  their keys — AC-005-34 pins the key set, so a key may not be deleted silently: re-point it, do not
  strand it.
- `--clock-days-min` (5ch) and `--clock-sub-col` survive as tokens even though the three-column row
  does not: do not delete a token to tidy up, AC-006-18's change set is the declared one.

**Scenarios.** AC-006-03, AC-006-04.

### Task 3 — Make the sub-day fields legible — **SUPERSEDED by Task 11**

> **Status: superseded, do not implement.** Revision 1 asked for the sub-day row to grow from
> 13 px to a legible size. Revision 2 removes the row: there is no 12 px label left to make
> legible, because there is no label. The task is kept, unedited below, as the record of what was
> required and why it changed — the failure this file must never commit is deleting it as if it had
> never existed. Its two scenarios, **AC-006-05** and **AC-006-06**, are revised in place to assert
> the removal (Task 11), so the ids stay cited and the reversal is visible in the suite.

**Goal (revision 1, no longer applicable).** The three sub-day fields stop being the smallest text
on the page — 12 px labels under a 13 px value, beneath an 80 px numeral — and become readable
without hunting, while keeping the row of three columns.

**Acceptance criteria**
- Every text leaf inside `.clock__fields` — the three values **and** the three labels, and the
  `días` label — computes `font-size ≥ --text-small` (15 px), in all fifteen pages. Before this
  spec: values 13 px, labels 12 px. The `días` label already computes 19 px and is unaffected.
- No leaf inside `.clock__fields` computes 12 px or 13 px any more.
- At 320 px, in every locale, the row's ink lies inside step 1's content box on both sides (the
  enlarged row does not spill into the gutter). AC-004-58's page-level `scrollWidth` check stays
  green and is not replaced by this.
- The row still resolves to exactly three grid tracks (AC-004-59's `trackCount` still counts 3).
- Step 1 still fits the viewport at all three measured sizes in all five locales
  (AC-004-60…63), which is the budget this task spends: 203 px of headroom at 390×844.

**Watch items**
- 15 px is the floor, `--text-small`, not a target: the informal spec asks for "a size that reads
  without being looked for", and 15 px is the smallest existing token that does that. Going to
  17 px (`--text-body`) also passes and additionally removes one more distinct size (Task 6), at
  the cost of more of the one-screen budget — a design call for `15-design.md`, not a requirement
  of this task.
- The labels are abbreviations in some locales (`min`, `s`), not in others (`horas`). At 15 px
  the widest label still sits inside a 48 px track; if a locale does not, solve it with the cell's
  own wrapping or with the row's track sizing — do not widen `--clock-sub-col`. (Revision 1's reason
  was a byte-identical token file; that no longer holds. The reason now: no type or space token may
  move, AC-006-18.)

**Scenarios.** AC-006-05, AC-006-06.

### Task 4 — Meet Fitts' law above the fold

**Goal.** Every interactive target above the fold reaches `--tap-min` (44 px) on its short axis —
the target grows, the type does not.

**Acceptance criteria**
- In all fifteen pages, the count of rendered interactive elements (`a[href]`, `button`, `summary`,
  `input`, `select`, `[tabindex]:not([tabindex="-1"])`) above the fold whose
  `min(width, height) < 44` is **0**.
- `--tap-min` resolves to 44 px, so "44" is a token value and not a literal in a rule.
- For every one of those elements, its own computed `font-size ≤ --text-body` (17 px). This clause
  is deliberately independent of the box clause: a 44 px box may not be reached by making the
  nav's text 44 px.
- The target set is not reduced to reach the floor. At 1366×768 and 1440×900, at least 12 targets
  render above the fold and include the skip link (`#main`), the wordmark (`/`), one anchor for
  each of `#figuras`, `#metodo`, `#debate`, `#lectura`, the five locale anchors (`/`, `/en`,
  `/fr`, `/de`, `/it`) and a theme toggle button. At 390×844, at least 4 render and include the
  skip link, the wordmark, the index trigger `<summary>` and the theme toggle.
- Today's header heights are not the way to do it: `--locale-cell` stays `36 px` in the token file
  and `.locale-group__cell` keeps its `inline-size`/`block-size: var(--locale-cell)` declarations.
  The 44 px is added as a `min-*` (or padding), not by redefining the cell token.

**Watch items**
- At 1024 px the header is `flex-wrap: nowrap` with wordmark + 4 nav links + 5 locale cells +
  theme toggle + stamp. Five 44 px cells add 40 px to that row; the suite measures 1366 and 1440,
  but 1024 is one of AC-004-56's sweep widths, so check the row does not overflow there.
- The skip link is off-canvas (`left: −9999px`) until focused. It is in scope by name and by
  measurement: its 26 px height is one of the four failures the informal spec lists.

**Scenarios.** AC-006-07, AC-006-08, AC-006-09.

### Task 5 — Give Von Restorff one winner

**Goal.** Above the fold there is exactly one distinct element — the numeral. The other two
accents stop competing, using only tokens that already exist.

**Acceptance criteria**
- In all fifteen pages, the number of painted grounds above the fold (§2.8) is **0**. Before this
  spec: 2 at 1366/1440 (the current-locale chip at `--ink-1`, step 1's `--surface-hero` band) and 1
  at 390 (the band). `html` and `body` are excluded by definition.
- Above the fold, **every paint channel is inventoried, not only text colour** — and the inventory
  is carried by **two criteria, not overclaimed by one**: **AC-006-26** counts every rendered element
  of the whole page on every channel (`color`, `background-color`, every painted `border-*-color`,
  `fill`, `stroke`, painted `outline-color`, and the colours inside a non-`none` `box-shadow`), and
  **AC-006-11** counts the above-fold text leaves' `color`, including a second *hue* that is not the
  accent value. Together they assert what this bullet requires; neither asserts it alone. Before
  this spec: 6 accent text leaves at 1440 and 6 at 390, plus the current locale cell's `--surface-1`
  text on its `--ink-1` chip.
  (Revision 2 counted text leaves only; revision 3 widened the *spec* — AC-006-26 for the page, and
  AC-006-11 kept as the text half rather than restated as something its test does not check.)

- The accent is not the numeral's *only* distinction by accident: AC-006-12 still requires the
  numeral to be the largest text, so the number is the one element that differs in both size and
  hue.
- The days numeral is the largest text leaf above the fold and is **strictly** larger than the
  `<h1>` at every viewport. Today: 80 > 64 at 1366/1440, 44 > 40 at 390. This is the clause that
  stops "calm" from being achieved by shrinking the number.
- The current locale is still marked — and marked without a ground and without colour:
  `aria-current="page"` is retained on exactly one cell, and that cell differs from its four
  siblings by computed `font-weight` or `text-decoration-line` (non-colour, WCAG 1.4.1). Removing
  the chip's ground must not remove the marker.

**Watch items**
- `a { color: var(--accent) }` is a global rule; the nav, wordmark and skip link inherit it. It
  must become an ink, with the existing underline carrying the affordance — not a new hover colour.
  AC-006-26 checks the whole sheet for a surviving `color: var(--accent)`, so this is the reason
  that criterion exists and not an incidental tidy-up.
- Step 1 loses its ground and gains no border (AC-005-16's `border-top` and `--surface-2`
  negatives still stand), so the step is separated from the header by spacing only. That is the
  intended consequence: the numeral is the only thing that stands out.
- Do not reach for `--surface-3` or `--surface-2` to "keep" the band; any distinct ground above
  the fold fails the count, whatever token it names.

**Scenarios.** AC-006-10, AC-006-11, AC-006-12, AC-006-13.

### Task 6 — Spend fewer type sizes above the fold

**Goal.** The number of distinct type sizes above the fold decreases from the 10 measured, and
every size that survives has a job.

**Acceptance criteria**
- The count of distinct computed `font-size` values among rendered text leaves above the fold
  (§2.9) is `≤ 9` in all fifteen pages. Baseline: 10 at every measured viewport.
- Every distinct size above the fold equals the resolved value of a `--text-*` token at that
  viewport. No ad-hoc literal (`13.5px`, `0.9rem`) is introduced to move the count: a size the
  token scale cannot produce is not a "job", it is a new size.
- The surviving sizes are declared with their jobs in `15-design.md`; this task's criterion is the
  count, and the design stage names what each survivor is for.

**Watch items**
- The reduction comes from Task 11, and not from where revision 2 expected it: removing the years
  line takes the years numeral's 32 px (`--text-num-l`) and its unit's 20 px (`--text-num-m`) out
  of the above-fold set, which is 10 → 8 at every viewport. The 12 px and 13 px sizes **survive** —
  they are the step labels (`--text-micro`) and the chrome (`--text-meta`) — so a Coder must not
  chase them, and the sub-day removal is not what moves this count. 8 clears ≤9 with one size to
  spare; lowering the target to 8 is not required and would be a design decision, not this task's.
- 34.56 px at 1440 and 32.784 px at 1366 are the `--text-h2` clamp resolving per viewport; they
  are one size, not two, and the count is per viewport, not across viewports.

**Scenario.** AC-006-14.

### Task 7 — Record the supersessions and keep every frozen criterion green

**Goal.** The two inverted clauses and the one re-pointed rationale are written down in the suite,
not deleted, and nothing else in 001–005 is weakened.

**Acceptance criteria**
- AC-001-118's ground clause now asserts `.step--number` does **not** contain
  `var(--surface-hero)`; the id is still cited by a test, and its sibling clauses are byte-for-byte
  unchanged.
- AC-005-16's ground clause is inverted the same way; its spacing-token clause and its
  token-file-hash clause are unchanged; the id is still cited.
- AC-004-77's assertions are unchanged and its comment names spec 006 as the reason the axis is
  centred again, while still asserting that `--measure-face` is unused and still `17.5rem`.
- `web/styles/tokens.css`'s change set is the declared one (AC-006-18): colour tokens revalued, `--surface-hero` retired, and no type, space or geometry token touched. The file is no longer byte-identical, and AC-005-16's old assertion of that is named as superseded in §4.2.
- No rule touched by Tasks 1–6 adds motion: no `transition`, `animation` or `@keyframes`
  declaration on the header chrome, step 1 or the clock rules; and on the served page no element
  inside the header or step 1 computes a `transition-duration` above `0s` or an `animation-name`
  other than `none` (measured across every element of those two subtrees: all durations `0s`, no
  animation).
- No rule touched declares a colour literal: every `color`, `background-color`, `border-color`
  and `background` declaration added or changed resolves `var(--…)`.
- Every scenario in `20-acceptance/` is cited by a test with its id in the test name, no test is
  skipped or focused, and `scripts/check-scenario-traceability` reports no untested and no unknown
  id.
- The 15 retirements of §4.1 are performed by the five steps of §4.5, in one change: the ids are in
  `RETIRED_SCENARIOS` and in `retired-criteria.test.ts`'s `RETIRED`, the four of them that were
  `PRESERVED` are removed from that list, no test cites a retired id, and AC-005-38's count is
  re-pointed to the union (39, not 24).
- The 20 re-points of §4.2 each keep a citation: every re-pointed id still appears in a test name,
  on the assertion §4.2 describes, and no re-pointed id is added to either list.
- Ids whose carrier file dies are re-cited verbatim in the surviving number-step test:
  AC-001-101, AC-001-110, AC-001-115, AC-002-13, AC-002-14, AC-003-02, AC-003-03.

**Watch items**
- `retired-criteria.test.ts` lists 24 retired ids and asserts none of them start with `005-`.
  Nothing here retires an id: both superseded criteria keep their ids and their other assertions.
  Do not add `001-118` or `005-16` to `RETIRED` — that would delete the record rather than invert
  it.
- `docs/TESTING.md §Tests That Encode a Defect` applies by analogy: these tests encode a
  *superseded decision*, not a bug, and this spec is the authorization. Keep the ids, quote the
  reason in the test comment, and record it in the PR body.

**Scenarios.** AC-006-15, AC-006-16, AC-006-17, AC-006-18, AC-006-19, AC-006-20, AC-006-21.

### Task 8 — Remove the box

**Goal.** No story step paints a rectangle behind its content. Step 1 is the number on the page's
own ground: no panel, no border, no shadow, no stain — and the chrome does not butt against it.

**Acceptance criteria**
- At each of the fifteen pages, no `[data-top-step]` element paints a background: its computed
  `background-color` is `transparent` or equals the page's. Before this spec
  `[data-top-step="number"]` painted `rgb(254,232,208)` over 1176 × 559.
- Step 1 declares no `border` on any side and no `box-shadow` other than `none`.
- The number's ink starts at least `--space-6` (32 px) below the header's bottom edge, so removing
  the panel does not leave the story glued to the chrome. Before this spec the panel's edge sat
  exactly on the header's (both at y = 64) and the `h1`'s ink started 64 px lower.
- The five steps remain visually distinct from one another: the existing hairline between steps
  (`.step + .step`) survives, so "no box" does not become "no boundaries".

**Watch items**
- The registers below the story (`--ground-consensus`, `--ground-dispute`, `--ground-thesis`) are
  **not** steps and are out of scope; AC-003-46 keeps the thesis uncoloured.
- `.site-header` paints `--surface-1`, the same value as the page. That is not a distinct ground
  and AC-006-10's count already treats it as one surface. Do not "fix" it by giving the header a
  second tint.

**Scenarios.** AC-006-22, AC-006-23.

### Task 9 — A neutral palette with one accent

**Goal.** A near-white ground, a dark neutral ink scale, and exactly one chromatic colour reserved
to the day numeral. The peach is retired, the amber is retired, and every pair is measured rather
than asserted.

**Acceptance criteria**
- In both themes, exactly **one distinct chromatic value** appears among the public colour tokens
  (`chroma() > 20`): the accent's. Every other resolved value — every surface, ink, rule, `data-*`
  and `chart-*` — is neutral (`chroma() ≤ 10`). The scan covers tokens that resolve to a single
  colour; `--chart-hatch`, `--dash-projection` and `--focus` are gradients or paint shorthands and
  are excluded, because `chroma()` cannot read them and a criterion that assumed every `chart-*`
  token were a colour would throw rather than assert. The count is of *values*, not of names: an alias
  such as `--chart-series-1: var(--accent)` resolves to the accent and is not a second colour.
  Before this spec three values were chromatic: `--accent` (olive), `--data-projection` (amber) and
  `--data-deficit` (rust).
- `--accent` is a deep red: `chroma() > 20` and its CIELCh hue within 40° of 0° (i.e. 340°–40°).
  It was olive — hue 122.1° light, 130.0° dark — so the band is a 120°-wide change, not a
  nudge. This is the mechanical form of "rojo profundo / oxblood"; the exact hex belongs to
  `15-design.md`.
- Every pair in the page's real pair table meets its stated minimum in both themes, measured with
  `contrast()` on the declared hexes: **7:1** for `--ink-1` on every surface, **4.5:1** for
  `--ink-2`, `--ink-3`, `--accent` and `--on-accent` on the surfaces they actually paint, **3:1** for
  the non-text series strokes. No minimum may be lowered to make a value pass.
- No colour literal appears outside `web/styles/tokens.css` — the clause AC-004-66 carried, now at
  AC-006-24 — and no token is added whose purpose is a second accent.
- The accent is spent **exactly once on the whole page**, and the budget is counted across every
  paint channel — `color`, `background-color`, `border-*-color`, `fill`, `stroke`, `outline-color`,
  and the colours inside a `box-shadow` — over every rendered element and every rule that paints at
  rest, excluding the admin-scoped selectors the project already lists in `ADMIN_PREFIXES`
  (`.admin-btn` fills with the accent today and never renders on the public page). The one permitted
  use is the day numeral's `color`. Three paints carried the accent when this spec began and had to
  leave it: the primary action's fill (AC-002-31, re-pointed), the fuse's burnt segment
  (AC-003-22, re-pointed) and every chart series alias (so `--chart-series-1` and
  `--chart-observed` stop resolving `var(--accent)`). The focus ring is the single exception, and
  only as a state — AC-006-36 states the boundary and why it is defensible.
- Every link — the nav, the wordmark, the skip link, the in-page anchors — computes an ink, with the
  existing underline carrying the affordance. This is a consequence of the budget, not a separate
  rule: an accent-coloured link would be the second resting paint.

**Watch items**
- `--surface-hero` is retired: no rule may resolve it and the peach values (`#fee8d0` light,
  `#201406` dark) may not survive anywhere in the sheet. Deleting the token and its two
  declarations is the clean edit; leaving an unused token is permitted only if nothing resolves it.
- `--on-accent` is the text that sits on the accent ground (the primary action). With the accent
  revalued it must be re-measured, not assumed: today it carries a 7:1 design target it may not
  lose.
- `--data-deficit` becomes a neutral ink; the negative series keeps its meaning through the hatch
  form (Task 10), not through rust.
- **The primary action loses its fill, not its prominence.** `.hero__cta` becomes `--ink-1` ground
  with `--surface-1` text (16.83:1 light, 17.01:1 dark, measured); it keeps the radius, the padding, the type size and
  its position. Do not "compensate" by enlarging it or by giving it an accent border — either would
  re-enter the budget through another channel.
- **The fuse's burnt segment becomes `--ink-1` and the pair improves** — to 3.11 light / 2.57 dark,
  from 1.82 / 1.19 while the neutral accent still filled it (1.14 / 1.51 under the retired olive).
  The value is carried
  by the burnt length and the label, so the pair is a redundant cue; AC-006-37 holds the floor.
- **The focus ring is the one exception and it is load-bearing in two ways.** `--focus` may keep
  resolving the accent, but only `:focus-visible` may use it. With the CTA now an ink fill, the
  ring must be drawn *outside* that fill: accent on `--ink-1` measures **1.71:1 light and 2.15:1
  dark**, below the 3:1 non-text minimum, while accent on the page ground measures 9.85:1 light and
  7.89:1 dark. `--focus-offset` is what keeps
  it outside — removing it would make the ring invisible on the primary action.
- A neutral is not "almost neutral": a token at chroma 15 is the peach defect in a new hue. The
  10/20 band in the contract (§2.11) exists to make that a failure rather than a taste argument.
- Feasibility was checked before the bound was set: a near-white ground with a ≤6-chroma neutral
  ramp and an oxblood accent clears every minimum in both themes (§6 D14). The bound is not
  aspirational.

**Scenarios.** AC-006-24, AC-006-25, AC-006-26, AC-006-36, AC-006-37.

### Task 10 — Observed vs projected, by form

**Goal.** The charts keep saying which series is projected and which is measured, with no second
alarm colour. The distinction survives as a stroke or a pattern, plus the printed word, and the
criterion proves the mechanism actually paints.

**Acceptance criteria**
- The three demography panels resolve to **one** `--demography-hue`: reference, measured and
  projected have identical computed fill. Before this spec three hues distinguished them, and the
  third was the amber.
- The projected series carries a form the observed series does not: a `stroke-dasharray` bound to
  `--dash-projection`, or a `fill: url(#…)` resolving to an SVG `<pattern>`. At least one of the
  two is present in the served SVG, not only in CSS.
- The pattern is a **valid paint**: `CSS.supports('fill', …)` returns true for the value used. A CSS
  gradient function is not a valid SVG fill in Chromium (measured: `false`), so the existing
  `--chart-hatch` used as a `fill` paints nothing today and may not be the mechanism this criterion
  accepts.
- Each panel's state is printed in words beside it (`demography.year.observed` /
  `demography.year.projected`), in every locale, so no panel is distinguished by paint alone.
- The series colours stop resolving the accent: `--chart-series-1` and `--chart-observed` become
  neutral inks. Task 9's page-wide budget counts every channel, so an alias that still resolved
  `var(--accent)` would fail it even though the chart is below the fold — and it would put a second
  red on the page, which is the thing the palette decision forbids.
- Every plotted value is still printed in the table (AC-001-106's sixth clause, unchanged), so the
  encoding is redundant by construction.

**Watch items**
- This is the clause that decides whether the palette can collapse at all: removing the amber is
  only safe because the dash and the printed word already carry the meaning. If the implementation
  removes the dash while removing the amber, the chart loses its encoding and this criterion is the
  one that catches it.
- `--chart-hatch`'s gradient is fine for an HTML ground; it is not fine as an SVG `fill`. If a hatch
  is wanted, it needs a `<pattern>` element and `fill="url(#id)"`.

**Scenarios.** AC-006-27, AC-006-28.

### Task 11 — One number

**Goal.** Step 1 shows `5534 días` and one sentence that says what date it counts to. Nothing else.
The years numeral and the three sub-day fields leave the story; the detail they carried lives in
Method.

**Acceptance criteria**
- Step 1 renders exactly one quantity: the day numeral and its unit. No years numeral, no
  `countdown.clock.hours`/`minutes`/`seconds`, no second unit, no time-of-day text. The elements are
  absent from the DOM, not hidden.
- The **five** steps still exist in their order, and the other four are unchanged.
- The sentence is unchanged except where it depends on the removed quantities, and it still reads:
  it names the anchor date, it carries exactly one date in step 1 (AC-005-09 stays green), and its
  only deictic reference ("these days") resolves to the one numeral above it. No sentence left
  referring to years, hours, minutes or seconds.
- The three sub-day strings stop being rendered anywhere on the page, in the story or in `#metodo`:
  they were a clock reading, not published data, so there is nothing to preserve. They stay
  *declared* in the content model — AC-005-34 pins the key set and may not be weakened by deleting a
  key — and simply have no renderer.
- The detail survives in `#metodo` as visible text: the years quantity, its two printed integers,
  the anchor date and the arithmetic are all present and outside any disclosure (`AC-003-05`,
  `AC-004-32` stay green).
- The day count still comes from the committed countdown at the render instant (AC-004-06's
  invariant), and the numeral is still the largest glyph (AC-006-12).

**Watch items**
- `steps.number.sentence` is `"Faltan estos días para el {date}: ese día la población de 65 y más
  años llega a {threshold} por cada {base} personas de 15 a 64 años."` — it references "estos días"
  and two threshold numerals, and **not** the years quantity or the sub-day fields. So the sentence
  survives as written; the risk is a Coder "fixing" a sentence that is not broken. If a locale's
  sentence does reference a removed quantity, that locale's string is the only one that changes,
  and the change is recorded.
- `countdown.clock.a11y` ("Días hasta el {date}.") was the clock's accessible name. With the clock
  gone the date's accessible path is the sentence's text; do not carry the attribute across to the
  numeral as a second statement of the date (that would break AC-004-29/AC-005-09's "once").
- The informal spec writes the number as `5 534`; the served numeral is `5534` (measured). That is
  the same quantity set with a space, **not** a new number format: do not add a grouping separator
  that the committed formatter does not produce.

**Scenarios.** AC-006-29, AC-006-30, AC-006-31. (AC-006-05 and AC-006-06, revised from Task 3,
also belong here: they assert that the row and the three sub-day strings are gone from the page.)

### Task 12 — Step 1 is static HTML

**Goal.** With no seconds there is nothing to tick, so the number group is server-rendered and the
served markup is the value. No client clock, no timer, no hydration delta. The HTML is regenerated
hourly (D17) and states the instant it was generated at (D16).

**Acceptance criteria**
- The served HTML already carries the final day count: the numeral in the response body equals
  `readClock(anchor, instant).days`, with no placeholder, no zero and no pending state.
- The instant the numeral was computed at is **declared** in the markup (a machine-readable
  `datetime` or `data-*` value on the numeral or its section), so the number is attributable to a
  render rather than to "some time before the response". Without it, a stale number and a fresh one
  are indistinguishable and the criterion could never fail.
- Two seconds after load, in Chromium, step 1's visible text is identical to the served markup's.
  A ticking field would differ — which is why this, and not two HTTP requests, is the assertion:
  the public routes are statically generated and revalidated hourly (`revalidate = 3600`), so two
  requests inside the window return the same bytes and would pass even if a clock were baked in.
- No module reachable from the number step's render path carries the `'use client'` directive.
  `NumberStep` and its children are server components.
- No interval, timeout or animation frame is created for the story: the served page's scripts do not
  include the clock ticker, and loading the page creates no timer attributable to it.
- The deleted machinery leaves nothing behind: `CountdownClock` and `clock-ticker` are removed, and
  no `aria-hidden` region, `data-clock-state` attribute or `role="group"` clock wrapper survives in
  step 1.

**Watch items**
- `readClock()` stays: the day count and the share message both use it, and deleting it would change
  the share's behaviour (AC-003-25, in force).
- **The rendering mode is ISR with a one-hour window (D17).** `app/(public)/(home)/page.tsx` and
  `app/(public)/[locale]/page.tsx` keep `export const dynamic = 'force-static'` and gain
  `export const revalidate = 3600`. Both lines coexist: the mode stays static, the generated HTML is
  revalidated at most hourly. AC-001-69 (`the source contains 'force-static'`) and AC-003-44
  (`dynamic === 'force-static'`, `dynamicParams === false`) therefore stay green and are **not**
  re-pointed.
- **Verify the window is applied, do not assume it.** After `next build`, the route table must list
  both public routes as ISR (`1h`), not as a plain static prerender. If `force-static` swallows
  `revalidate` in this Next version, the page is build-frozen and D17's bound is fiction — check the
  build output, and if the two do not combine, drop `dynamic = 'force-static'` (keeping the route
  statically generated via `generateStaticParams`) and re-point AC-001-69 / AC-003-44 as a
  consequence, recording it in this file first.
- The midnight edge is inherent and harmless: a generation that lands either side of midnight
  publishes the day count for its own instant, and the declared instant says which.
- Server rendering still has an instant: the page is rendered with `now`, so the numeral is the
  render's value. That is the requirement, not a limitation.

**Scenarios.** AC-006-32, AC-006-33.

### Task 13 — The share link is canonical

**Goal.** What a reader shares leads to the site's own origin, not to a Vercel project alias. Every
absolute URL the page publishes derives from one origin, and that origin is the one that serves it.

**Acceptance criteria**
- The committed default origin in `web/content/site.ts` is the site's own origin; it contains no
  `-projects.vercel.app` project-alias segment, and `SITE_URL` still overrides it when the
  deployment sets it.
- Every absolute URL the page publishes carries that one origin: `<link rel="canonical">`,
  `og:url`, every `hreflang` alternate, the sitemap, and all four share controls' URLs.
- **The criterion is not self-referential.** Comparing each control against `canonicalUrl()` proves
  internal consistency and passes on any origin, which is exactly how the wrong host shipped.
  The share URL's origin is compared against an independently established one: the origin the page
  was served from.
- On the production origin, every share href's origin equals the origin that served the page. This
  is checkable at deploy time and is what AC-006-35 asserts.
- No share URL gains a tracking parameter while the origin is corrected.

**Watch items**
- The root cause is one constant: `const DEFAULT_SITE_URL =
  'https://pensions-system-danielbueno76-4270s-projects.vercel.app'`. Changing it is a data change
  in `web/content/site.ts`, not a component edit — the file's own doc comment says `SITE_URL` is the
  single origin every absolute URL derives from. Keep it that way.
- The preview deployment serves on `pensions-system-delta.vercel.app`; a local `next start` serves on
  127.0.0.1. That is why AC-006-34 asserts the *shape* (one origin, no project alias) and AC-006-35
  asserts the *equality* on the real host.
- AC-003-23…25, 27…33 (share works without JS, no third-party request, the message template) stay in
  force. This task changes an origin, not the sharing mechanism.

**Scenarios.** AC-006-34, AC-006-35.

## 6. Decisions taken (defaults this stage had to choose)

Each is recorded so the human gate can reverse it cheaply. None of them blocks; one wants
confirmation.

- **D1 — The whole of step 1 is centred, not only the four things the informal spec names.** The
  informal spec lists "the number, its unit, the sub-day fields and the sentence"; the `<h1>` and
  the step label are not in that list. They are centred here anyway, because the requirement that
  governs is stated for the *step* ("no empty half to the right of step 1") and because a centred
  numeral under a flush-left display headline is two axes, not one. Reversible: remove units 1 and
  2 from Task 1 and the remaining four still pass. **Confirm at the human gate.**
- **D2 — The tolerance is a centre tolerance (4 px), not a width budget.** A width budget would
  need a per-locale number and would fail German for being German. The centre is locale-invariant.
- **D3 — The distinct-size target is 9, not lower.** The informal spec asks only that the count
  "go down from the 10 measured"; 9 is that requirement made checkable and does not invent a
  design target that belongs in `15-design.md`.
- **D4 — Legibility floor for the sub-day row is `--text-small` (15 px).** **Moot in revision 2**:
  the row is removed (Task 11), so there is nothing to make legible. Kept here because the floor is
  still the rule *if* sub-day fields ever return, which the informal spec says must be an explicit
  decision and not a side effect.
- **D5 — The Fitts anti-inflation ceiling is `--text-body` (17 px).** Every above-the-fold target
  computes ≤17 px today, so it is a guard against a Coder growing the type to grow the box, and
  not a new design constraint.
- **D6 — "Rendered" excludes the contents of a closed `<details>`, and not its `<summary>`.**
  Measured, not assumed: the closed mobile index panel reports a 40×420 box in Chrome on the served
  page, so its *contents* must be excluded or leaf counts disagree between viewports for no visible
  reason. Its `<summary>` is a painted, focusable target and must be counted, or AC-006-07 and
  AC-006-09 lose a real target and the 390 px count falls to three (design measurement, revision 3).
  The rule names the summary explicitly because both sloppier versions fail silently: "no
  descendant" drops the trigger, "exempt the details element" drops nothing.
- **D7 — The `días`-is-12 px figure in the informal spec is recorded as not reproducing (it is
  19 px) and no criterion is written against it.** The 12 px items are the sub-day labels, which
  revision 2 removes. The record stays so that no later stage cites a measurement the page never
  had.
- **D8 — Revised in revision 2: the token file changes, and only in the declared way.** Revision 1
  asserted the file would be byte-identical. The palette decision makes that false, so AC-006-18 is
  re-pointed to "the change set is the declared one" rather than deleted, and AC-005-16's hash
  clause is named as superseded (§4.2). A criterion that said "nothing changes" and a decision that
  changes the palette cannot both stand; the honest move is to say which one won.
- **D9 — "Neutral" is chroma ≤ 10 and "chromatic" is > 20; the band between is forbidden.** The
  palette tests already treat 20 as the floor of a hue. The gap to 10 is deliberate: the peach
  defect was a 2.76 L\* tint, and a 15-chroma "neutral" would reproduce it in a new hue.
- **D10 — Closed in revision 3: the accent is bounded page-wide, on every channel.**
  `15-design.md` states the accent is spent **exactly once on the whole page, on the numeral**, and
  takes the harder half — the primary action leaves the accent too. So the chart aliases leave it
  as well, and the count covers `color`, `background-color`, `border-*-color`, `fill`, `stroke`,
  `outline-color` and `box-shadow`. Revision 2's narrower reading ("text above the fold; `color:`
  in the sheet") is what let four paints survive a criterion that claimed to bound one.
- **D18 — The focus ring is excluded as a *state*, under stated conditions.** Excluding it is
  defensible because a focus indicator is a user-agency affordance required by WCAG 2.4.7, it
  exists only while `:focus-visible` matches, and removing it would be an accessibility regression
  rather than a palette simplification. The exclusion is bounded so it cannot become a loophole:
  no resting rule may paint the ring (AC-006-36), only one rule may use `--focus`, and the ring
  must still reach 3:1 against the ground it is drawn on — which is why `--focus-offset` stays.
- **D19 — The fuse's pair floor is 3:1 light and 2.5:1 dark, not 3:1 both.** The burnt segment is a
  redundant cue: the fuse's value is its burnt *length* plus its label (AC-003-11, AC-003-21), so
  WCAG 1.4.11's 3:1 is not the governing floor for the pair alone. The pair measures 3.11 / 2.57 as
  shipped, and a 3:1 demand in dark would fail a correct palette by 0.43. The light floor stays at
  3:1 because the shipped pair reaches it; the dark floor is 2.5:1 for the same reason the pair is
  not the sole encoding. Both floors sit far above the 1.82 / 1.19 the pair measured while the
  accent still filled the burnt segment.
- **D11 — The share criterion may not be self-referential.** AC-003-26 compared each control against
  the same constant that was wrong, so it was green on a page that shared the wrong host. The new
  criterion compares against the origin the page was served from; the build-time half asserts the
  *shape* (one origin, no project-alias segment) because a local `next start` cannot be the
  production origin.
- **D12 — Retiring an id is a five-step procedure in one commit** (§4.5), not a deletion. It touches
  the gate's `RETIRED_SCENARIOS`, the test's `RETIRED` and `PRESERVED`, and AC-005-38's count. The
  count is re-pointed rather than deleted because a criterion that pins "24 retirements" is broken
  by every future retirement.
- **D13 — The sentence does not change.** Its five strings already say "estos días" and the two
  threshold numerals, and reference neither the years quantity nor the sub-day fields. Removing the
  two quantities therefore leaves it grammatical and complete. If a locale turns out to reference a
  removed quantity, only that locale's string changes and the change is recorded — the English
  sentence is not rewritten to accommodate a translation.
- **D14 — Feasibility proof for the palette bounds (non-normative).** A near-white ground
  (`#fafaf9`), a neutral ramp topping out at chroma 6.0, and an oxblood accent (`#7a1f2b`, chroma
  42.8, hue 21.7°) clear every minimum in both themes: ink-1 17.77:1, ink-2 10.82:1, ink-3 6.45:1,
  accent 9.77:1, on-accent 9.77:1 light / 16.44 / 10.87 / 6.75 / 7.68 / 7.68 dark. These hexes are
  **not** a value this spec prescribes — they prove the criterion is satisfiable before a Coder is
  asked to satisfy it. The shipped palette settled on a different ramp (`tokens.css`: `#fbfbfa`,
  `#1a1a18`, `#7a1f2b`), which clears the same bounds; AC-006-25 holds the measured results and this
  paragraph is not a claim about them.
- **D15 — Task 3 is kept as a superseded record, not deleted.** Its text stays under a
  "do not implement" banner and its two scenarios are revised in place. Deleting the task would
  erase the fact that the smallest text on the page was once the thing this spec set out to fix.
- **D16 — The numeral declares its render instant.** "The value is the render's" is only a
  criterion if the render is identifiable, so the numeral (or its section) carries a
  machine-readable instant. This is the smallest addition that makes AC-006-32 falsifiable, and it
  is what turns an unavoidable build-time staleness into a disclosed one rather than an invisible
  one. It does not change the value, the layout or the copy.
- **D17 — The public routes move to ISR with a one-hour window, and stay `force-static`.**
  `export const revalidate = 3600` is added to `app/(public)/(home)/page.tsx` and
  `app/(public)/[locale]/page.tsx`; `export const dynamic = 'force-static'` stays, so AC-001-69 and
  AC-003-44 keep passing untouched (both assert the mode, neither asserts the absence of a
  revalidation window). Staleness is bounded to one hour instead of one deploy interval, and D16's
  declared instant makes the actual generation time visible. This is the answer to the question
  revision 2 left open.


## 7. Open questions

Nothing blocks stage 1. Three items for the human gate, one of which must be answered before
`/build` because it changes what the code does:

1. **D1 (still open)** — is the whole of step 1 composed on the axis, or only the units the informal
   spec enumerates? The tasks are written for the whole step; narrowing it is a two-line edit to
   Task 1 and no other task moves.
2. **Staleness — answered by decision D17.** The public routes keep `dynamic = 'force-static'` and
   add `revalidate = 3600`, so the numeral is at most an hour old and its generation instant is
   declared (D16). AC-001-69 and AC-003-44 are **not** re-pointed: they assert the rendering mode,
   which does not change. The only thing that must be verified is that the build actually applies
   the window — see Task 12's watch item.
3. **D10 — answered.** `15-design.md` says the accent is spent once on the whole page, the primary
   action included. The chart aliases leave it too, and AC-006-26 counts every channel. Nothing is
   left to decide here.
