# Design Spec: 006-centred-number

## Design Read

Reading this as: a public-service editorial landing page for a general Spanish-reading audience, in an instrument-panel / printed-statistical-plate language, leaning toward the project's own token system on native CSS — now a neutral near-white page with a single oxblood measurement, no panel, no clock, and one centred axis.

## Dial Values

The skill's three dials, plus the two project dials spec 004 established. Revision 2 moves one of them and tightens two consequences.

- **DESIGN_VARIANCE: 2** (004 set 3; skill baseline 8). The page loses its one panel and gains one centred axis: less structure, more symmetry. Not 1: the header stays asymmetric (wordmark left; stamp, locale group and theme right) and the sentence keeps a ragged edge inside `--measure`.
  *CSS consequence:* one axis, in step 1 only. Four units, no per-unit pixel offsets, no `translate` for optical correction, no second centred region anywhere in the story. Steps 2–5 keep 004's flush-left axis.

- **MOTION_INTENSITY: 1** (was 2). Revision 1 had one thing that moved: a number that changed because time passed. Revision 2 removes the seconds, so nothing on the page moves at all — not a tick, not a transition, not a focus animation. The dial goes to the floor because the page's only motion was the clock, and the clock is deleted.
  *CSS consequence:* zero `@keyframes`, zero `transition` declarations on anything this spec touches, no `animation-timeline`, no scroll observers, no `will-change`. Measured on the built page: every element inside the header and step 1 computes `transition-duration: 0s` and `animation-name: none`.

- **VISUAL_DENSITY: 3** (was 4). The story loses two of its four numbers and its only painted ground; step 1's height falls from 559.5 to 427.8 px at 1440 and from 641.4 to 510.7 at 390 (measured). The appendix register below `#figuras` is untouched, so the two-register rule survives with a wider gap between the registers than before.
  *Census consequence, recorded:* 004 counted "items below 17 px per step: 4 / 1 / 4 / 1 / 1". Step 1's census is now **1** — its own step label at 12 px. The sub-day labels are gone with their row. This is the only place revision 2 removes small text rather than restyling it.

- **HIERARCHY: 9** (unchanged, consequence sharpened). Exactly one element at `--text-num-xl` (80 px desktop / 44 px phone), exactly **one** numeral above 20 px in the whole story — the years numeral moved to `#metodo`, so the story's second numeral is gone. One size per role, and the number now carries two distinctions (size and hue) instead of one.

- **RESTRAINT: 10** (was 9). The page's loud materials are now countable on one hand and they are: **one** chromatic value on the entire page, at **one** place (the day numeral). No panel, no chip, no second accent, no third hue in the charts, no decoration. The dial reaches its ceiling because there is nothing left to restrain.

## Design System / Foundation

**Not a packaged design system, and unchanged by this spec.** The system is the one already shipped in `web/styles/tokens.css`; revision 2 revalues its colour layer and retires one ground. Named honestly so nobody reaches for a library:

- **Visual lineage:** a printed statistical plate. Three inks, hairlines, monospace for measurements, no radius, no shadow, no card. Revision 2 removes the plate's last filled panel: the page is now paper and ink, with the one colour spent on the one number.
- **Copy lineage:** the public-sector plain-language register (spec 005), frozen. The sentence survives verbatim; it already said "estos días" and referenced neither the years quantity nor the sub-day fields.
- **No install command.** No new dependency, no component library, no icon package, no motion library, no font. `web/styles/tokens.css` changes only its colour tokens and retires `--surface-hero` (AC-006-18).
- **Deliberate departure from the skill, restated:** §4.3's anti-center bias fires above `DESIGN_VARIANCE 4`; at 2 it does not, and §4.3's override permits a centred hero where the message is the design. Step 1 is the message. Steps 2–5 are the evidence and stay flush left.

## Global Tokens

One each, locked. The colour layer is **revalued**, not extended: no token is added, one is retired, and every other value is a measured replacement (AC-006-18, AC-006-24).

- **Font:** `--font-sans` (Instrument Sans) for story copy, headings and labels via `--font-label`; `--font-mono` (IBM Plex Mono) for the one numeral and only the one numeral.
- **Accent color:** `--accent`, oxblood — `#7a1f2b` light (CIELCh chroma 42.80, hue 21.7°), `#e3929a` dark (chroma 32.74, hue 15.2°). **One job on the page: the day numeral's text colour.** It is the page's only chromatic value.
- **Neutral base:** a near-white / near-black neutral ramp with a trace of warmth at hue ~110° and chroma ≤ 3.21 in every token — the ramp reads neutral and is measured neutral, not "almost neutral" (§2.11's 10/20 band).
- **Corner-radius system:** sharp. `--radius: 0`. No exception added.
- **Theme:** auto (`color-scheme: light dark`, `[data-theme]` overrides, the existing three-way system → light → dark). Both themes measured; no section inverts.
- **Icon library:** the project's own `web/components/Icon.tsx`, six hand-rolled paths. Kept, unchanged. The skill prefers Phosphor / HugeIcons / Tabler; that preference is unmet by inheritance, and RESTRAINT 10 forbids new icons.
- **Imagery:** none added. The page's only visuals are data-drawn SVG (three pyramid panels, the fuse). No photography, no generated image, no div-based mock.

### The palette, as measured pairs

Every value below is a `tokens.css` replacement. Chroma, hue and contrast are computed with `tests/helpers/colour.ts` — the same `chroma()`, `hue()`, `contrast()` the palette tests already use — on the declared hexes, never on a quoted number.

**Light theme**

| Token | Was | Is | L\* | Chroma | Hue |
|---|---|---|---|---|---|
| `--surface-1` | `#fdf2e1` | `#fbfbfa` | 98.59 | 0.50 | 110.0 |
| `--surface-2` | `#f6ead7` | `#f3f3f1` | 95.79 | 1.01 | 110.0 |
| `--surface-3` | `#f0e1c9` | `#e9e9e6` | 92.27 | 1.54 | 110.0 |
| `--surface-hero` | `#fee8d0` | **retired** | — | — | — |
| `--ink-1` | `#1e160d` | `#1a1a18` | 9.19 | 1.48 | 109.7 |
| `--ink-2` | `#47392a` | `#464643` | 29.63 | 1.92 | 109.8 |
| `--ink-3` | `#645341` | `#686863` | 43.86 | 2.98 | 109.7 |
| `--rule-1` | `#d6c8b7` | `#d0d0cb` | 83.35 | 2.63 | 109.9 |
| `--rule-2` | `#b9a892` | `#aeaea7` | 70.91 | 3.80 | 109.8 |
| `--accent` | `#3b5512` | `#7a1f2b` | 27.55 | **42.80** | **21.7** |
| `--on-accent` | `#fdf2e1` | `#fbfbfa` | 98.59 | 0.50 | 110.0 |
| `--data-deficit` | `#96472a` | `#464643` | 29.63 | 1.92 | 109.8 |
| `--data-projection` | `#6b520a` | `#686863` | 43.86 | 2.98 | 109.7 |
| `--chart-series-2` | `#6f6658` | `#686863` | 43.86 | 2.98 | 109.7 |

**Dark theme**

| Token | Was | Is | L\* | Chroma | Hue |
|---|---|---|---|---|---|
| `--surface-1` | `#17110b` | `#121211` | 5.43 | 0.59 | 110.2 |
| `--surface-2` | `#1f1810` | `#1b1b1a` | 9.73 | 0.74 | 109.9 |
| `--surface-3` | `#292117` | `#252524` | 14.65 | 0.70 | 110.0 |
| `--surface-hero` | `#201406` | **retired** | — | — | — |
| `--ink-1` | `#f5eddf` | `#f4f4f1` | 96.12 | 1.52 | 110.0 |
| `--ink-2` | `#cbbead` | `#c4c4bd` | 78.98 | 3.72 | 109.8 |
| `--ink-3` | `#a09180` | `#9a9a93` | 63.42 | 3.89 | 109.7 |
| `--rule-1` | `#312a22` | `#343433` | 21.67 | 0.67 | 110.0 |
| `--rule-2` | `#473e34` | `#4a4a49` | 31.43 | 0.63 | 110.0 |
| `--accent` | `#91c46d` | `#e3929a` | 68.91 | **32.74** | **15.2** |
| `--on-accent` | `#17110b` | `#121211` | 5.43 | 0.59 | 110.2 |
| `--data-deficit` | `#d08a63` | `#c4c4bd` | 78.98 | 3.72 | 109.8 |
| `--data-projection` | `#d8bf60` | `#9a9a93` | 63.42 | 3.89 | 109.7 |
| `--chart-series-2` | `#aba192` | `#9a9a93` | 63.42 | 3.89 | 109.7 |

**Chromatic count.** Max chroma among non-accent tokens: **3.21** light, **3.89** dark. One value above 20 in each theme, the accent's, and both accents sit inside the 340°–40° band. Today three values are chromatic (accent 39.9, projection 41.6, deficit 44.9 in light).

**Aliases re-pointed, not revalued:** `--chart-series-1: var(--ink-2)` (was `var(--accent)`), `--chart-observed: var(--chart-series-1)`, `--chart-projection: var(--data-projection)`, `--chart-ref: var(--ink-3)`, `--chart-grid: var(--rule-1)`. The derived mixes stay neutral: `--data-projection-ground` computes `#e9e9e8` (chroma 0.51) light, `#222221` (0.71) dark; `--chart-hatch`'s ink computes chroma 0.51 / 0.66.

**The pair table** (`contrast()` on the declared hexes; minimums per the project's existing convention — 7 AAA, 4.5 AA, 3 non-text):

| Pair | Light | Dark | Min | Verdict |
|---|---|---|---|---|
| `--ink-1` on `--surface-1` | 16.83:1 | 17.01:1 | 7 | pass |
| `--ink-1` on `--surface-2` | 15.69:1 | 15.64:1 | 7 | pass |
| `--ink-1` on `--surface-3` | 14.33:1 | 13.92:1 | 7 | pass |
| `--ink-2` on `--surface-1` | 9.15:1 | 10.69:1 | 4.5 | pass |
| `--ink-2` on `--surface-2` | 8.52:1 | 9.83:1 | 4.5 | pass |
| `--ink-2` on `--surface-3` | 7.78:1 | 8.75:1 | 4.5 | pass |
| `--ink-3` on `--surface-1` | 5.41:1 | 6.62:1 | 4.5 | pass |
| `--ink-3` on `--surface-2` | 5.04:1 | 6.09:1 | 4.5 | pass |
| `--ink-3` on `--surface-3` | 4.60:1 | 5.42:1 | 4.5 | pass |
| `--accent` on `--surface-1` (the numeral) | 9.85:1 | 7.89:1 | 4.5 | pass |
| `--accent` on `--surface-2` | 9.18:1 | 7.26:1 | 4.5 | pass |
| `--accent` on `--surface-3` | 8.39:1 | 6.46:1 | 4.5 | pass |
| `--on-accent` on `--accent` | 9.85:1 | 7.89:1 | 7 | pass |
| `--on-accent` on `--ink-1` (the primary action's label) | 16.83:1 | 17.01:1 | 7 | pass |
| `--accent` on `--surface-1` (focus ring) | 9.85:1 | 7.89:1 | 3 | pass |
| `--ink-1` on `--ink-3` (the fuse's two segments) | 3.11:1 | 2.57:1 | 3 | light pass, dark below (see T9) |
| `--ink-2` / `--data-projection` / `--data-deficit` on `--surface-1` | 9.15 / 5.41 / 9.15 | 10.69 / 6.62 / 10.69 | 3 | pass |
| `--rule-2` on `--surface-1` (decorative rule) | 2.15:1 | 2.11:1 | none | today 2.09 / 1.79 |
| `--rule-1` on `--surface-1` (hairline) | 1.49:1 | 1.50:1 | none | today 1.48 / 1.32 |

Two rows carry a note rather than a silent pass. The **decorative rules** have no minimum in the project's convention (they are hairlines, not component boundaries or meaningful graphics), and both achieved values are at or above today's, so no minimum is lowered. The **fuse's two segments** are a division inside one bar, not two graphics against the ground: each segment clears 3:1 against the surface (5.41 and 16.83 light; 6.62 and 10.69 dark), and the internal boundary improves from today's 1.14 / 1.51 to 3.11 / 2.57. Dark's 2.57 is stated, not rounded up.

`--state-pending` and `--state-danger` remain chromatic and remain **admin-only**; they are not in the public palette's bound and this spec does not touch the admin surface. Recorded so the "one chromatic value" claim is not read as covering a screen the reader never sees.

## Design Laws

Every row has a consequence the Coder implements and a check a reviewer runs on the built page. Measurement contract: 10-tasks §2 (per-text-node `Range` rects for ink; step 1's content box, not the window, as the reference; five locales × three viewports).

| Task | Law | Applies to | Concrete consequence | How a reviewer checks it |
|---|---|---|---|---|
| 1 | Gestalt — Proximity | the four centred units | The axis is the centre of `[data-top-step="number"]`'s content box — 712.5 at 1440, 675.5 at 1366, 504.5 at 1024, 376.5 at 768, 187.5 at 390, 152.5 at 320 — and each unit's ink centre lands within **0.01 px** of it. | Measure each unit's per-text-node ink against the content-box centre. Measured 0.00–0.01 offset, residual ≤0.02, in 15 matrix pages plus 320/360/768/1024. |
| 1 | Gestalt — Prägnanz | the number as one object | The numeral and `días` occupy one line and one ink extent: one baseline, one centre, a 12 px gap. The number is read as a phrase, not a digit block with a caption. | Compare the numeral's and unit's ink tops/bottoms (they overlap on one line) and their gap. Measured: gap 12.0 px, one line, all 15 pages. |
| 1 | Tesler | the sentence's measure | The system absorbs the scan: the sentence's ink stays ≤ **722.7 px** inside a 1176 px content box, so no reader sweeps the full width. The irreducible part exposed instead is the sentence's two threshold numerals, printed rather than implied. | Sentence ink width vs content box. Measured 655.1 es, 722.7 de, 651.3 en, 627.8 fr, 684.1 it at 1440. |
| 1 | Jakob | the composition | Copies the poster-measurement convention: headline, caps label, quantity + unit, one sentence. Nothing reordered, nothing invented. If the axis had needed a new reading order it would have owed the reader a learning cost; it does not. | DOM order of the four units; no `order`, `grid-row` or `grid-column` added by T1. |
| 1 | Occam | the rule set | Four units on four box types, each needing its own alignment property and nothing else: no offsets, no magic numbers, no optical compensation. | Read the diff: no bare length literal in any rule T1 adds. |
| 2 | Miller | the number group | One chunk, two elements: the numeral and its unit. The chunking that remains is the sentence's, which is one sentence. | Enumerate the group's descendants: exactly two text-carrying leaves. |
| 2 | Doherty | the numeral's finality | Nothing is corrected after paint, so there is no round trip to wait behind and no placeholder to flash. The value is final in the served HTML — including the hour-stale case, where the number is *different*, not *pending*. | Two seconds after load, step 1's visible text equals the served markup's. Measured under ISR: the numeral is present in the response body. |
| 4 | Fitts | 12 header targets | Every above-the-fold target ≥ 44×44 on its short axis, from `min-block-size`/`min-inline-size: var(--tap-min)` inside the fixed 64/56 px flex row, so the header's height does not move. | Measure `min(width, height)` of every above-fold target and the header height. Measured: min 44.0, 12 targets desktop / 4 phone, header 64/56, `scrollWidth − clientWidth` 0 from 320 to 1440. |
| 4 | Hick | first paint | The fix adds no control and removes none: 12 targets at desktop, 4 at 390, unchanged by the redesign. Nothing is bought by hiding a target. | Enumerate above-fold targets by `href`/role and compare with §1's named list. |
| 5 | Von Restorff | the one distinct element | Exactly one text leaf carries the accent (the numeral) and exactly one leaf sits at its size. No ground is painted anywhere above the fold. The current locale is marked by weight, not colour. | Count accent-coloured leaves (measured 1, the numeral), painted grounds (measured 0), leaves per distinct size (exactly one at 80/44), and `font-weight` on the current cell. |
| 5 | Aesthetic-Usability (guard) | "calm" | Calm may not be bought with illegibility or a smaller number: the numeral stays strictly larger than the `<h1>` (80 > 64; 44 > 40) and the accent's contrast is 9.85:1 / 7.89:1. | AC-006-12 and the pair table. A "calmer" page that shrank or dimmed the number fails both. |
| 6 | Law of Similarity | the type scale | 10 sizes → **7** at 1440/1366 and **6** at 390/360/320, one size per job class, no role carrying two sizes. The 1 px pair that survives (12 vs 13) is separated structurally: 12 never appears in the header's navigation row as an affordance, 13 never appears as a caps label. | Enumerate distinct computed `font-size` values and the leaves at each. |
| 7 | Serial Position | the four units' order | The number sits third of four — neither first nor last — so its dominance must come from **hue and scale**, not position. That is why T5's two-distinctions clause is load-bearing rather than decorative. | DOM order unchanged; AC-006-12 and AC-006-11 together. |
| 8 | Gestalt — Common Region | step 1's ground | The band is deleted, so step 1 claims no region. Separation is the header's hairline above and the shared `.step + .step` hairline below, plus 32 px of block padding on each side. | Count painted grounds (0); measure step 1's first text ink below the header (59 px at 1440, 61 at 390; floor 32). |
| 9 | Gestalt — Similarity | the three chart panels | One hue for three panels means the panels are one class; the distinction that remains is form plus the printed word, which is a *different* channel rather than a weaker version of the same one. | Read `--demography-hue` on all three panel modifiers (one resolved value) and each panel's state word. |
| 9 | Von Restorff (colour side) | the whole page | The accent paints exactly one thing: the numeral's text. Links, the primary action, the fuse and every series move to ink. | Collect every `color:`/`background:`/`fill:` resolving `var(--accent)` in the sheet: one rule, the numeral. |
| 10 | WCAG 1.4.1 (as a check, not a flourish) | observed vs projected | No information is carried by colour alone: the projected series carries a dash and a hatch the observed series does not, and every panel prints its state. | `CSS.supports('fill','url(#projection-hatch)')` is `true` (measured); `CSS.supports('fill','repeating-linear-gradient(…))` is `false` (measured), so the hatch must be a `<pattern>`. |
| 11 | Miller | step 1's content | One quantity, one unit, one sentence. The four numbers the reader was asked to hold (`16 años`, the day count, and three sub-day fields) become one. | Enumerate step 1's text leaves: numeral, unit, label, sentence. |
| 12 | Doherty | the render's finality | ISR at `revalidate = 3600` means the number is at most an hour old and *declared* as such, so a stale value is attributable rather than invisible. Nothing in the viewport corrects it. | Read the declared instant in the markup and confirm the numeral equals `readClock(anchor, instant).days`. |
| 13 | Jakob | the share control | A share link goes to the page you are on. The origin is the site's own; a project alias is a broken affordance, not a stylistic choice. | Every share href's embedded origin equals the serving origin; no `-projects.vercel.app`. |

### Deliberate violations (reason + what pays for it)

- **The primary action is not the accent.** A filled accent CTA is the convention, and it is what the page does today. **Departure:** step 5's button becomes `--ink-1` with an `--on-accent` label. **Why:** the accent is *reserved to the numeral* — a locked decision, not a preference; a red button would give the same colour two meanings on one page. **What pays for it:** the action keeps the strongest non-chromatic affordance available (a solid near-black block, 16.83:1 label, 44 px minimum height), and the two colours never compete because they never co-occur. Reversible in one declaration (`background: var(--accent)`) if the gate disagrees.
- **The fuse's burnt segment is ink, not accent.** A measured "distance travelled" bar in red would read as an alarm — the register this spec removes. **Departure:** `--fuse-burnt: var(--ink-1)`, cord `--ink-3`. **What pays for it:** the segment pair improves from 1.14:1 (light) / 1.51:1 (dark) to 3.11:1 / 2.57:1, and each segment clears 3:1 against the ground in both themes.
- **All three demography panels share one tone.** Small multiples are normally separated by tone. **Departure:** reference, measured and projected all resolve `--demography-hue` to the same neutral. **Why:** one chromatic value, and the observed/projected distinction must survive *by form* — a tone difference would just be a second (weaker) colour encoding, which is the defect being removed. **What pays for it:** the hatch, the dash, the printed state word and the panel's own shape.
- **The numeral's mass sits 25.4 px left of the axis.** With the unit beside it on one line, the *phrase's* ink is centred and the numeral's own mass is not. **Departure:** no optical compensation. **Why:** AC-006-01 measures the union, and any nudge that centred the glyphs would fail it by exactly the amount it corrected. **What pays for it:** the reader reads "5534 días", not "5534" — the phrase is what is centred, at 235–300 px wide depending on locale. Recorded because it is measurable and someone will notice it.
- **A centred multi-line paragraph.** Centred prose loses its left anchor. **Departure:** the sentence's ink is centred. **Why:** the criterion measures ink; a flush-left block in a centred box reproduces the 427 px residual the user complained about. **What pays for it:** `--measure` cap, `text-wrap: balance` (measured 2 lines at 1440 in every locale, 4–5 at 390), 19 px at 1.62 leading, and it is one sentence, never a paragraph.
- **`.clock__value--days` stops reserving `5ch`.** The token keeps its value; the declaration goes. **Why:** a reservation 56.48 px wider than the glyphs is a hole between the numeral and its unit as soon as the unit is on the same line — measured 40.23 px of ink gap with the reservation kept versus 12.0 px without. **What pays for it:** the number is one object, and the token remains declared for any future sub-day return. **This re-points one line inside AC-003-02's carrier** (see the findings at the end).
- **The focus ring keeps the accent.** It is the only accent outside the numeral's text. **Why:** WCAG 2.4.7 wants a visible indicator, and a 2 px oxblood ring at 9.85:1 / 7.89:1 against the page is the most visible one available. It is a **state**, never a resting paint, and it appears for one reader at a time.

### Judged inapplicable for this spec (so omissions are visible)

- **Peak–End** — the page's terminal state is step 5 and the footer, outside this spec's surface; step 1 is an opening.
- **Zeigarnik / Goal–Gradient** — nothing to complete, no progress affordance, so nothing to show or withhold.
- **Parkinson's / Flow** — no task pacing and no interruption; revision 2 removes the only thing that ever changed on its own.
- **Choice Overload** — no choice is added or removed: the 12 header targets are fixed chrome, and the redesign removes *things to read*, not decisions to make.
- **Pareto** — subsumed by the Occam row for T1; naming it separately would add no consequence.
- **Fitts's destructive-vs-safe spacing** — the public page has no destructive action.
- **Serial Position** is applied (T7), not excluded: it explains why hue and scale must carry the number.

## Per-Task Directives

Every number below is **measured on the built page** (`npx next build` + `npx next start -p 3111`, Chromium via Playwright) at 1440×900, 1366×768, 1024×900, 768×900, 390×844, 360×900, 320×900 in `es`, `en`, `fr`, `de`, `it`, with the 10-tasks §2 contract. Because Tasks 9–12 are not implemented yet, the composition was measured by applying the proposed token block and the four unit rules to the served page and **removing the years line and the sub-day cells from the DOM** — the geometry the implementation will produce, not a hidden-element approximation. Contrast ratios are computed from the declared hexes, not read from a screenshot.

Two sheet-versus-rendered traps found on the way, both load-bearing:

1. **`--chart-hatch` paints nothing as a fill.** `CSS.supports('fill','repeating-linear-gradient(45deg, #000 0 3px, #fff 3px 4px)')` returns **false** in Chromium, and `CSS.supports('fill','url(#projection-hatch)')` returns **true**. The sheet has `pattern` elements: **0**. So today the hatch is a declaration that renders nothing, and a criterion written as "is a hatch declared" would pass on a mechanism that does not paint.
2. **The projected series' only form cue today is on the axis, not the data.** Measured: `.demography__panel--projected .demography__baseline` computes `stroke-dasharray: 6px, 4px`; the measured panel's baseline computes `none`; but all 126 `.demography__bar` elements are solid fills. The projected *bars* differ from the observed ones by hue alone. That is the encoding AC-006-28 must move onto the series.

### Task 1 — Compose step 1 on one axis

- **Layout:** single centred measure. Axis = centre of the step's content box (712.5 / 675.5 / 504.5 / 376.5 / 187.5 / 152.5 at 1440 / 1366 / 1024 / 768 / 390 / 320). Four units in DOM order: `<h1>`, step label, the number line, the sentence. Tolerances are tokens: centre ≤ `--space-1` (4 px), residual ≤ `--space-2` (8 px).
- **Components:** no new component. Four existing nodes get alignment. Step 1's `--surface-hero` background is deleted and nothing replaces it (Task 8).
- **Typography:** unchanged by this task; Task 6 owns the ledger.
- **Motion:** static. No declaration with a time value in any touched rule.
- **A11y:** centring is visual only — reading order, focus order and the heading sequence are untouched. No `text-align` is applied to a container that also carries interactive content.
- **Design-law consequences:** Proximity, Prägnanz, Tesler, Jakob, Occam.
- **Anti-patterns to avoid:** `text-align: center` on `.step--number` alone (centres boxes, leaves glyphs flush left; the contract's §2.4 per-text-node rule exists to catch exactly that). Widening a unit to force its offset to zero. A centred axis for steps 2–5 "for consistency". `transform: translateX()` optical correction.
- **Watch items:** the sentence needs `margin-inline: auto` **after** the existing `margin: var(--space-5) 0 0`, or the shorthand re-zeroes it. German at 320 px is where line breaking is tightest; the centred sentence's ink measures 252.4 px there and still centres to 0.01. Step 1's content box, padding and total height must be unchanged by the *centring* (the height reduction comes from Task 11).

### Task 2 — Recompose the number group as one measured quantity

- **Layout:** one line, baseline-aligned: numeral, 12 px gap, unit. Not stacked — the unit beside the numeral is what AC-006-03 requires and what makes the pair one object.
- **Components:** the surviving shape is `.clock__value--days` (the numeral) and its `.clock__label` (the unit) inside one block on the axis. The years line and the three sub-day cells are gone (T11). `.clock` loses `role="group"`, `aria-label` and `data-clock-state` (T12).
- **Typography:** numeral `--text-num-xl` (80 at 1440, 65.54 at 1024, 49.15 at 768, 44 at 390/320); unit **19** (`--text-body-lg`), measured 12.0 px from the numeral's ink in every locale and every viewport.
- **Motion:** none. `font-variant-numeric: tabular-nums` stays — it is now a guard against a *future* render's digit count, not against a tick.
- **A11y:** the unit is text in the DOM, not an `aria-label`. With the clock wrapper gone there is no second statement of the date; the sentence is the date's only accessible path (AC-004-29/AC-005-09's "once").
- **Design-law consequences:** Miller, Doherty.
- **Anti-patterns to avoid:** keeping `.clock__fields` as a one-cell grid (leaves a track and a `grid-column` pin with nothing to place). Re-basing the unit to `--text-num-m` or smaller to "balance" the line. Putting the unit in an `aria-label` on a span of digits. Keeping `min-inline-size: var(--clock-days-min)` on the numeral.
- **Watch items:** `--clock-days-min` and `--clock-sub-col` survive as declared tokens with no consumer — do not delete them (AC-006-18's change set is the declared one, and it retires only `--surface-hero`). The number's collapsed box means its own width is the glyph run: `5534` at 80 px is 184.3 px, and the whole line measures 235.2 (es) to 299.5 (fr).

### Task 3 — Make the sub-day fields legible — **SUPERSEDED, do not implement**

- **Layout:** none. **Components:** none. **Typography:** none. **Motion:** none.
- **A11y:** the row's `aria-hidden` cells disappear with it; nothing is hidden by CSS (AC-006-05's third clause).
- **Design-law consequences:** none — the row's Miller/Similarity problem is dissolved rather than solved.
- **Anti-patterns to avoid:** implementing the revision-1 requirement (grow the row to 15 px) on a row that is being deleted. Recolouring or re-spacing a row on its way out.
- **Watch items:** the two ids this task carried (AC-006-05, AC-006-06) now assert the removal (Task 11) and must stay cited. The design's answer to "what should the row have become" is recorded here and nowhere else: at 15 px it passed the axis at 0.01 but added a fourth register to a step that now has one.

### Task 4 — Meet Fitts' law above the fold

- **Layout:** no layout change. Header stays one row, `flex-wrap: nowrap`, 64 px / 56 px. Targets grow **inside** the row via minimums, so the fold budget does not move.
- **Components:** `.skip-link`, `.site-header__wordmark`, the four nav anchors, the five locale cells, the theme toggle, the index trigger `<summary>`.
- **Typography:** the type does not grow to buy the box. Nav and locale cells stay `--text-meta` (13); the wordmark and skip link move **down** to `--text-small` (15) for Task 6's merge. Measured: every target's own font-size ≤ 16 (the textless theme button); nav 13.
- **Motion:** none; no `:active` transform.
- **A11y:** measured min short axis **44.0**, 12 targets at 1366/1440, 4 at 390, none hidden, `scrollWidth − clientWidth` 0 from 320 to 1440. Focus ring untouched.
- **Design-law consequences:** Fitts, Hick.
- **Anti-patterns to avoid:** padding on a text-only anchor (grows the row), `line-height` inflation, a pseudo-element hit area that makes adjacent locale cells overlap, dropping the stamp to "make room".
- **Watch items:** nav anchors need `min-inline-size` **and** `justify-content: center` — without the inline minimum `Cifras` measures 43.1×44 and fails by 0.9 px. The skip link is off-canvas at `left: −9999px` until focused and must still measure ≥44 in both axes while parked (measured 107.9×44 at 390).

### Task 5 — Give Von Restorff one winner

- **Layout:** unchanged; the winner is established by subtraction.
- **Components:** `.step--number` loses `background`; `.locale-group__cell[aria-current='page']` loses its `--ink-1` ground and keeps `font-weight: 600`; `a`, the wordmark, the nav and the skip link move to `--ink-2`.
- **Typography:** the numeral is the only leaf at its size and strictly larger than the `<h1>` (80 vs 64; 44 vs 40).
- **Motion:** none.
- **A11y:** removing a ground must not remove a marker — `aria-current="page"` on exactly one cell, `font-weight` as the non-colour difference (WCAG 1.4.1). `--ink-2` on the page ground is 9.15:1 / 10.69:1.
- **Design-law consequences:** Von Restorff, Aesthetic-Usability (guard).
- **Anti-patterns to avoid:** a subtler band (`--surface-2`, an inset frame, a left rule) — any distinct ground above the fold fails the count. Keeping the locale chip "because it is small". A tinted or bolder numeral to add interest.
- **Watch items:** on a 390 px phone the numeral is 44 against a 40 px `<h1>` — a 10 % size gap, so the hue is doing real work; do not "help" by shrinking the `<h1>` (the display scale is pinned). The focus ring is the accent's one appearance outside the numeral and is a state — see the violations list.

### Task 6 — Spend fewer type sizes above the fold

- **Layout:** none; this task is the ledger.

- **Typography — the surviving scale (measured at 1366×768, `es`, 20 leaves):**

  | Size | Token | Leaves | Job |
  |---|---|---|---|
  | 12 | `--text-micro` | 4 | Instrument labels: the snapshot caption and its date, and each step's caps label (steps 1 and 2 are above the fold). |
  | 13 | `--text-meta` | 9 | Navigation and locale selection: 4 header anchors + 5 locale cells. |
  | 15 | `--text-small` | 2 | Small reading: the skip link and the wordmark. |
  | 19 | `--text-body-lg` | 3 | The reading size and the unit: the sentence and `días`. |
  | 32.78 | `--text-h2` (clamp) | 1 | Step 2's statement (34.56 at 1440, 26 at 1024 and below — one size resolving per viewport). |
  | 64 | `--text-display` (clamp) | 1 | The page's one `<h1>`. |
  | 80 | `--text-num-xl` (clamp) | 1 | The day count. The only leaf at its size. |

  **Count: 7** at 1440/1366 (was 10). **6** at 390/360/320 (12, 15, 19, 26, 40, 44). Every value is a `--text-*` token's resolved value; no literal is introduced.

- **The merges:** the years numeral (32) and the sub-day values/labels (13 and 12) leave with their elements — that is four of the ten sizes removed by deletion, not restyling. 17 (wordmark) → 15, and 16 (skip link) → 15.
- **Motion:** none.
- **A11y:** nothing shrinks; the two smallest sizes are caps labels and navigation, both ≥12 px with ≥5.41:1 contrast.
- **Design-law consequences:** Law of Similarity.
- **Anti-patterns to avoid:** a `13.5px` literal to move the count. Moving the display or heading scale. Deleting a leaf to lower the count (all remaining leaves are copy, and copy is frozen).
- **Watch items:** **`.demography__tick` is a 9 px literal** — it enters the above-fold count at 768 and 1024 (measured 8 sizes there) but not on any of the fifteen matrix pages, and it is chart internals whose size is not a token. Do not add a token for it (AC-006-18) and do not count it if the test is written per the contract's fifteen pages; note it in the test comment so the discrepancy is explained rather than discovered. The optional sixth merge — nav 13 → 12 — would give 6 at desktop; it is **not** taken, because 12 px navigation reads as a footer and the 1 px pair is structurally separated (12 never appears as an affordance, 13 never as a caps label). It is one declaration if the gate prefers the lower count.

### Task 7 — Record the supersessions and keep every frozen criterion green

- **Layout / Components / Typography / Motion:** none directly; the motion clause is a gate (measured: `transition-duration: 0s` and `animation-name: none` on every element inside the header and step 1).
- **A11y:** the inverted ground clauses remove a panel and a chip; the marker moves to weight (Task 5). Nothing here weakens focus, contrast or semantics.
- **Design-law consequences:** Serial Position (the order this task's record protects).
- **Anti-patterns to avoid:** adding `001-118` or `005-16` to `RETIRED` (deletes the record instead of inverting it). Deleting an assertion rather than inverting it. Editing the token file to make something fit. Spending the retirement budget on ids whose subject survives.
- **Watch items:** the record now carries **31** affected criteria — 15 retired, 16 re-pointed — plus the four clause-level items this design surfaced. `docs/TESTING.md §Tests That Encode a Defect` applies by analogy: the tests encode superseded decisions, this spec is the authorisation, keep the ids, quote the reason, record it in the PR body. Every added or changed `color`/`background`/`border-color` resolves `var(--…)`.

### Task 8 — Remove the box

- **Layout:** step 1 paints nothing: `background: none`, no border on any side, `box-shadow: none`. The story's five steps are separated by the existing `.step + .step` hairline and their 32 px block padding, and by nothing else.
- **Components:** `.step--number` loses one declaration. No replacement element, no divider, no inset.
- **Typography:** none.
- **Motion:** none.
- **A11y:** step 1's first text ink must sit ≥32 px below the header's bottom edge so removing the panel does not leave the story glued to the chrome. Measured 59 px at 1440 and 61 px at 390 (the `<h1>`'s ink is the first ink).
- **Design-law consequences:** Gestalt Common Region; Prägnanz (a page with one surface reads as one sheet, not a stack of cards).
- **Anti-patterns to avoid:** replacing the band with `--surface-2`, a 1 px inset, a top rule, or a "very light" tint — every one of them restores the box under another name and fails the ground count. Giving the header a second tint to "separate" it: it paints `--surface-1`, the same value as the page, and that is the correct reading of one surface.
- **Watch items:** the registers below the story (`--ground-consensus`, `--ground-dispute`, `--ground-thesis`) are **not** steps, keep their grounds, and are out of scope; AC-003-46 keeps the thesis uncoloured. Removing step 1's ground also removes the page's only 1176×559 painted rectangle — the page no longer has a "material moment" in the surface sense; what replaces it is the numeral's hue (Task 9), and that is the whole argument of revisions 2's palette.

### Task 9 — A neutral palette with one accent

- **Layout:** none.
- **Components:** token values only, plus the three link rules and the one numeral rule (`color: var(--accent)` on the day numeral, and nowhere else).
- **Typography:** none.
- **Motion:** none.
- **A11y:** every pair in the table above is measured on the declared hexes; the numeral at 9.85:1 / 7.89:1 clears AA for text twice over. `--on-accent` keeps a live job (the primary action's label on `--ink-1`, 16.83:1 / 17.01:1) **and** its accent pair (9.85 / 7.89) is still measured, so the token's name does not become a lie about a value that never renders.
- **Design-law consequences:** Gestalt Similarity (one chromatic class), Von Restorff (colour side).
- **Anti-patterns to avoid:** a "neutral" at chroma 12–18 (the §2.11 band exists to make that a failure rather than a debate). Keeping the amber for projection "because it is data". Re-tinting the accent toward brown to keep it warm — hue must stay within 340°–40°. Introducing a second accent for the CTA.
- **Watch items:** `--surface-hero` is **deleted**, both declarations, and no rule resolves it (AC-006-23 scans for the two peach hexes). `--data-deficit` becomes a neutral ink though it has no live consumer today (measured: 0 uses outside the token file), so the charts lose no encoding by it. The admin's `--state-*` values stay chromatic and stay out of the public bound.

### Task 10 — Observed vs projected, by form

- **Layout:** none in the story; the three panels keep their order and geometry.
- **Components:** three `--demography-hue` declarations collapse to one value (`var(--ink-2)`); `PyramidPlate.tsx` gains one `<pattern>` in the **projected panel's own `<defs>`**; `.demography__panel--projected .demography__bar` gets `fill: url(#projection-hatch)`.
- **Typography:** none.
- **Motion:** none — the pattern is static.
- **A11y:** the encoding is not colour alone (WCAG 1.4.1): hatch + dash + printed state word + the table's printed values. Every plotted value stays in the table.
- **Design-law consequences:** Gestalt Similarity, WCAG 1.4.1 check.
- **Anti-patterns to avoid:** `fill: var(--chart-hatch)` (a CSS gradient as an SVG fill — measured `CSS.supports` false; it paints nothing). A hatch "declared" in CSS but never emitted as a `<pattern>`. Encoding the projection on the *baseline* only (today's state — measured, the bars are solid). A second neutral tone for the projected panel instead of a pattern (that is a weaker colour encoding, not a form one).
- **Watch items:** **the pattern id must be unique in the document** and defined inside the SVG that uses it; only the projected panel renders, so `#projection-hatch` occurs once — if a second projected panel ever renders, the CSS `url(#…)` resolves to the first, and the id must become panel-scoped. The pattern's geometry reuses `--dash-projection`'s *rhythm* (period 10, stroke 6, gap 4) as component constants alongside the file's existing `PITCH`/`BAR_HEIGHT`, because SVG attributes cannot read custom properties; the stripe's **colour** comes from a class (`fill: var(--demography-hue)`), so no literal enters the sheet. Keep the baseline's `stroke-dasharray: var(--dash-projection)`; it is a second cue on the same panel, not the encoding. `.chart__bar--negative`'s `fill: var(--chart-hatch)` is a latent broken paint — measured **0** such bars render on this page today — so it is not this spec's defect to fix; flag it, do not "fix" it into scope.

### Task 11 — One number

- **Layout:** step 1 is four elements on the axis: headline, caps label, the number line, the sentence. Step 1's height falls from 559.5 to **427.8** at 1440 and from 641.4 to **510.7** at 390 (measured); it still fits the viewport at every matrix point, including 653.8 at 320 in German.
- **Components:** the years numeral (`p.countdown__value`) and the three `.clock__field--sub` cells are **removed from the DOM**, not hidden. The surviving group is the day numeral and `días`. The removed fields' content keys are re-pointed to `#metodo` or kept and recorded (AC-005-34 pins the key set).
- **Typography:** the number at `--text-num-xl`: **80 px** desktop (`5534` 184.3 px wide, whole line 235.2–299.5 depending on the unit's width in the locale), **44 px** at 390 (numeral 101.4 px, line 152.3–191.1). Unit 19 px beside it, 12.0 px gap.
- **Motion:** none. Nothing in step 1 changes after paint.
- **A11y:** the date's accessible path is the sentence's visible text, exactly once; the numeral carries no `aria-label` restating it. `#metodo` must carry the years quantity, its two integers, the anchor and the arithmetic as **visible** text outside any `<details>`.
- **Design-law consequences:** Miller, and Hick's "fewer things to read" (not "fewer choices").
- **Anti-patterns to avoid:** keeping the years line "because it is only 32 px". A second sentence to explain the number. Re-adding `hh:mm:ss` as a "detail" in step 1. Rewriting the sentence — it already reads correctly without the removed quantities.
- **Watch items:** the informal spec writes `5 534`; the served numeral is `5534` and the formatter's grouping is locale-driven (`5.534` de, `5 534` fr, `5,534` en). Do not add a separator the committed formatter does not produce. German's `Tage` makes the widest unit line at 390 (191.1 px inside a 343 px content box) — still comfortably centred.

### Task 12 — Step 1 is static HTML

- **Layout:** none. **Components:** `CountdownClock` and `clock-ticker` are deleted; `NumberStep` becomes a server component. `readClock()` stays (the day count and the share message both use it).
- **Typography:** none. The numeral is rendered by the server with `tabular-nums`, so an hour-later render that changes a digit does not change the line's width.
- **Motion:** none — no interval, no timeout, no animation frame. Measured: no timer attributable to the story.
- **A11y:** the deleted wrapper takes `role="group"`, `aria-label`, `data-clock-state` and the `aria-hidden` ticking region with it (AC-006-33). Nothing announces; nothing needs to.
- **Design-law consequences:** Doherty — the value is final at paint, and a *stale* value is declared rather than silently corrected.
- **Anti-patterns to avoid:** a placeholder or zero rendered before a correction. A `<time>` element used as the numeral (the date is the sentence's job). Carrying the old accessible name across as a second statement of the date.
- **Watch items:** **ISR, not `force-static`.** The decided behaviour is `revalidate = 3600`: the numeral is the render's value, at most an hour old, and the render instant is declared in the markup so staleness is attributable (D16). AC-006-32's *Given* clause still says the routes are `dynamic = 'force-static'` and that "the numeral is the build's value" — that sentence contradicts the decision and needs re-pointing before `/build` (see the findings). The assertion itself ("the numeral equals `readClock(anchor, declaredInstant)`") holds under both. No `data-rendered-at` attribute exists on the built page today (measured: 0 occurrences; the only `time[datetime]` is the snapshot stamp), so D16 is new markup, not a rename.

### Task 13 — The share link is canonical

- **Layout:** none. The four share controls keep their geometry and their `--tap-min` targets.
- **Components:** `web/content/site.ts`'s `DEFAULT_SITE_URL` becomes the site's own origin; `SITE_URL` keeps overriding it. One constant, not a component edit.
- **Typography:** none.
- **Motion:** none — a share opens the OS sheet, not a page transition.
- **A11y:** the controls' accessible names are unchanged; the share row stays `justify-content: center` with `--share-gap`.
- **Design-law consequences:** Jakob.
- **Anti-patterns to avoid:** comparing each control to the same constant that builds it (that is how the wrong host shipped); adding a `utm_*` parameter while "fixing" the origin; hard-coding the production host in a component.
- **Watch items:** the criterion is not self-referential — the origin must be checked against the origin that served the page, which a local `next start` cannot supply. The committed default currently carries `pensions-system-danielbueno76-4270s-projects.vercel.app`, a project alias; the preview serves on `pensions-system-delta.vercel.app`.

## Out-of-scope tasks

None of T1–T13 is out of scope. Three surfaces are untouched and recorded so a reviewer does not expect work there:

- **Steps 2–5** — axis, spacing, type and grounds unchanged, except that step 2's statement is now visible above the fold (step 1 shrank) and step 3's panels lose their hue differences (Task 10). Their flush-left axis stays; the centred axis is step 1's, not the page's.
- **The admin surface** (`/admin`) — untouched; its `--admin-row-h` 40 px targets and `--state-*` colours are outside Fitts' 12 and outside the public palette's bound.
- **The registers below the story** (`#debate`, `#lectura`) — their grounds (`--ground-consensus`, `--ground-dispute`, `--ground-thesis`) survive Task 8 by definition, since they are not steps.

## Findings this design surfaced (for the human gate, before `/build`)

Four items where the artefact set, as written, cannot be satisfied by any correct implementation. Each is measured, and each is a one-line edit to `10-tasks.md` or `20-acceptance/`.

1. **AC-006-05's second clause is unsatisfiable.** It requires that "no element in step 1 computes a `font-size` of 12 px or 13 px". Step 1's own caps label computes **12 px** (measured: `step__label` in every locale, every viewport) and the type scale is frozen. Scope the clause to the number group's subtree (where the removed row lived), not all of step 1.
2. **The measurement contract excludes the `<summary>` trigger.** §2.1 excludes "a descendant of a `<details>` that is not `open`". The trigger is a descendant of its own closed `<details>`; measured at 390×844 the physically-above-the-fold targets are the skip link, the wordmark, the **summary** and the theme toggle — and the four index-panel anchors are the phantom rects the rule exists to exclude. Under the literal rule, 3 targets count and AC-006-09's "at least 4" fails by construction. The exclusion must read "…excluding the `<details>`'s own `<summary>`".
3. **AC-006-32's *Given* contradicts the decided caching.** It states `dynamic = 'force-static'` and "the numeral is the build's value"; the decision is ISR at `revalidate = 3600`. Re-point the *Given* to "the route is cached for at most an hour, so the numeral is the render's value", and keep the assertion unchanged — it holds under ISR and would also have held under a static build.
4. **A kept-in-force criterion pins a declaration this design must drop.** `countdown-band.test.ts`'s `AC-003-02` test asserts `.clock__value--days { min-inline-size: var(--clock-days-min) }`. With the unit beside the numeral on one line, that reservation measures 40.23 px of ink gap (it must be ≤12) and pushes the union 14.11 px off-axis; with it removed, both measure correctly (12.0 px, 0.01 px). AC-003-02 is in §4.3 "kept in force", so this is a clause-level re-point **outside** the 31-row record: the token keeps its `5ch` value, the declaration stops resolving it. (The second pin, in `clock.test.ts`'s `AC-001-114`, is retired with its describe and costs nothing.)

Two lesser items, recorded for the Coder and not blocking: `.chart__bar--negative`'s gradient `fill` paints nothing (measured 0 such bars render today, so it is latent), and `.demography__tick`'s **9 px literal** enters the above-fold size count only at 768–1024, outside the fifteen matrix pages.
