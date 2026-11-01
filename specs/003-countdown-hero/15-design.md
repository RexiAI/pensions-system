# Design Spec: 003-countdown-hero

Scope: T1, T2, T3 (visible surface), T4 (preview strings + card), T5 are frontend. The
computation/manifest halves of T2 and the cross-cutting invariants are out of scope here (see end).
Archived design (001 §15-design + Revisions 1–3, 002) stays in force except where named below.

## Revision 4 (post-measurement)

Two owner-approved amendments, decided **after measuring the built app** rather than the layout as
designed. Recorded in `10-tasks.md` §"Gate decisions 2"; asserted by AC-003-48…51, AC-003-06.

- **D1 — band composition.** The hero copy (`h1`, scope mark, `hero__sub`, both CTAs) moves to the
  **top of the band**, above the eyebrow and the clock. The fuse's provenance collapses into the
  existing `Cómo se calcula` `<details>` (`ProvenanceStrip collapsed`) instead of occupying inline
  space under the fuse. The share row sits **directly under the fuse**, inside the band, before the
  countdown's own prose. Measured after the change, Chromium against the built app, 2026-11-01:
  `h1` top **y 104** and share-row top **y 688**, at **both** 1440×900 and 1366×768; the clock and
  the fuse stay wholly inside the first viewport at both.
- **D2 — AC-001-107's demography-at-fold clause is retired at every width.** It was already unmet
  at 1366×768 before Revision 3 (the clock box measured 480.91–925.59 on 2026-10-29) and cannot
  hold on a band-first page. AC-001-107 is amended, not deleted; the clock/fuse fold guarantees
  (AC-003-06) replace the retired clause as this spec's fold guarantee for the leading block.
  Every "demography heading at the fold" claim in this document is withdrawn.

Why the earlier estimate was wrong: the per-breakpoint figures below originally summed the band's
*intended* box heights (band ≈ 440px, "h1 at ~520px") and treated the band as the only thing above
the hero. The build measured the `h1` at **y 1294 against a 900px viewport** — the hero copy, its
scope mark, its sub and two CTAs each contribute a block, and the countdown's seven prose lines
plus the fuse's provenance strip sat between the clock and the share row. Arithmetic over designed
heights is not a measurement: the per-breakpoint text below states rendered order and the numbers
taken from the build, and no longer predicts a `y` it has not measured.

## Design Read

A public-records instrument that has to travel: one full-width band that states the claim, then a
verifiable day count ticking at display size above a static, data-measured fuse, then a plain share
row — warmth and pressure from scale, rhythm and paper, never from alarm red, illustration or
urgency copy.

## Dial Values

- DESIGN_VARIANCE: 3 — unchanged from 001/002. The page's credibility is its sobriety; the change
  is one band getting very large, not a new composition grammar. Centred group kept (AC-002-11).
- MOTION_INTENSITY: 5 — unchanged (001 Rev 3). The clock stays the only continuous primitive.
  This spec adds **zero** motion: the fuse is static, share feedback is a text swap, no
  transitions on digits, buttons or the band.
- VISUAL_DENSITY: 4 — the band is deliberately sparse (one identity block, one eyebrow, one
  numeral row, one fuse line with its label, one share row; the countdown's prose and the clock's
  three disclosures are ordered below the share row, where they no longer compete for the fold);
  density elsewhere unchanged. The T5 block lowers density below the fold by removing nine
  repeated chips.

## Design System / Foundation

The shipped in-house token system (`web/styles/tokens.css`) — warm paper, olive accent, three
chromatic hues, radius 0, no shadow, Instrument Sans / IBM Plex Mono / EB Garamond. No library,
no install. Labelled honestly: editorial-instrument, not a SaaS landing page.

## Global Tokens

- Font: unchanged. Clock numerals and fuse figures `--font-mono` (IBM Plex Mono, already-loaded
  weight only — no new weight file), `tabular-nums`; copy `--font-sans`; thesis `--font-serif`.
- Accent color: `--accent` unchanged — light `#3b5512`, dark `#91c46d` (002 §T2). Used here for
  the fuse's burnt segment only. Share controls do **not** use it (AC-002-31: one accent action).
- Neutral base: warm paper ladder unchanged (`--surface-hero` band ground, `--ink-1/2/3`,
  `--rule-1/2`).
- Corner-radius system: sharp, `--radius: 0`, everywhere including share controls.
- Theme: auto (existing light `:root` + dark scheme), both measured below.
- Icon library: Phosphor (MIT), **regular weight, four brand glyphs only** (WhatsappLogo,
  TelegramLogo, XLogo, LinkedinLogo) + Copy + ShareNetwork, copied as path data into the repo at
  build time and inlined as `<svg aria-hidden="true" fill="none" stroke="currentColor">` — same-origin,
  no runtime fetch, no sprite URL. Monochrome `currentColor`; no brand colours.

### New tokens (all in `web/styles/tokens.css`, no literal elsewhere)

| Token | Value | Purpose |
|---|---|---|
| `--text-clock-days` | `var(--text-num-xl)` → `clamp(2.75rem, 6.4vw, 5rem)` | Day numeral. Alias, not a new size (see OQ-2). |
| `--text-clock-sub` | `var(--text-num-l)` → `2rem` (32px) | Hours/min/seconds at every viewport. |
| `--text-band-years` | `var(--text-num-l)` → `2rem` | The `16 años` numeral, demoted from `--text-num-xl`. |
| `--band-pad-block` | `var(--space-6)` (32px) from 768px up, `var(--space-4)` (16px) below | Band vertical padding. Fold budget, not decoration (D1): it and the mobile inline padding (`--space-3`, 12px, under 768px) are the band-edge values D1 traded for the `h1` and share-row fold targets — no content size, measure or line height moved to buy those pixels. |
| `--fuse-burnt-h` | `6px` | Thickness of the consumed segment. |
| cord thickness | `1px`, as the cord `<rect>`'s `height` attribute in the SVG's own units | Not a token: both segment heights live side by side in the component that draws them, so the 6-vs-1 thickness encoding is read in one place. |
| burn point | the cord's own square end (`x = burnPoint(consumed)`) | Not a token: nothing is drawn between cord and segment, so there is no end-cap to size — no glow, no dot, no cut mark. |
| `--tap-min` | `44px` | Minimum block and inline size of every share control (WCAG 2.5.5). |
| `--share-gap` | `var(--space-2)` | Gap between share controls. |
| `--share-icon` | `1.125rem` | Inline glyph size. |

No new colour token. No new hue.

### Contrast, measured (WCAG 2.x relative luminance, on `--surface-hero`)

| Pair | Light | Dark | Need |
|---|---|---|---|
| `--ink-1` numerals on band | 15.03 | 15.52 | 4.5 |
| `--ink-2` disclosures | 9.36 | 9.89 | 4.5 |
| `--ink-3` labels / cord | 6.19 | 5.89 | 4.5 text / 3 non-text |
| `--accent` burnt segment | 7.08 | 8.87 | 3 non-text |
| `--rule-2` (rejected for cord) | 1.95 | 1.72 | 3 — **fails** |
| `--accent` vs `--ink-3` (segment vs segment) | 1.14 | 1.51 | — luminance-indistinct |
| `--on-accent` on `--accent` (CTA, unchanged) | 7.60 | 9.20 | 4.5 |
| share control border `--rule-2` on `--surface-hero` | 1.95 | 1.72 | not load-bearing: label text is the boundary cue |

Consequence: the cord is `--ink-3`, not `--rule-*` (OQ-4 allowed either; `--rule-*` fails 3:1).
Because burnt vs cord differ by only 1.14–1.51 in luminance, **the encoding is thickness (6px vs
1px), not colour** — colour is the second channel; the percentage text is the primary one.

## OQ-2 recommendation — dominance within the cap

**Recommend: day numeral on `--text-num-xl` (existing token, 5rem cap); h1 stays on
`--text-display` and leads the band (D1, Revision 4). No cap is raised.**

Measured reasoning (computed sizes from the tokens' clamps):

| Viewport | h1 `--text-display` | Days `--text-num-xl` | Ratio | Seconds |
|---|---|---|---|---|
| 390×844 | 40px (floor 2.5rem) | 44px (floor 2.75rem) | 1.10 | 32px |
| 768×1024 | 40px (4.9vw = 37.6 → floor) | 49.2px | 1.23 | 32px |
| 1366×768 | 64px (4.9vw = 66.9 → cap) | 80px (6.4vw = 87.4 → cap) | 1.25 | 32px |
| 1440×900 | 64px | 80px | 1.25 | 32px |

- Refusal (12) caps **display type** at `--text-display: 4rem`; numerals already have their own
  ladder (`--text-num-xl` 5rem ships today on `.hero__value` and `.countdown__value`). Moving the
  day numeral onto the existing numeral top step satisfies "≥ h1" strictly (not just equal) at all
  four viewports without overriding refusal (12).
- Option "shrink h1": rejected — the h1 is already 64px against a 32px numeral; shrinking it to
  make room is subtraction where the owner asked for addition, and it hurts the page title's role.
- Option "raise cap for the numeral to 6–7rem": rejected for now — 80px mono × 4 digits + 3 sub
  fields fits one row at ≥ 768px; 112px would force a two-row layout at 1366 and push the fuse
  toward the 768px fold budget. Ask again only if, after build, the screenshot still reads as
  a sidebar.
- Dominance beyond size comes from: the full-width `--surface-hero` band leading the page,
  `--ink-1` on every clock field (seconds raised from `--ink-2`), the band's own 32px clear space
  above and below, mono against the sans `h1`, and the numeral being the only moving thing on the
  page. **The `h1` now precedes the clock inside the band (D1)**, so the numeral is no longer the
  *first* large shape read; the trade is deliberate and measured — the page's identity and its
  only spreading mechanism are one short block at the top of the band, and the numeral still
  out-sizes the 64px-capped `h1` by 1.10–1.25 across the four viewports (table above), which is
  what "at least as large as the `h1`" asks for. Reader order is: what this page is, then how
  long, then how much is burned, then how to pass it on.
- Consequence (required by AC-003-03): `.countdown__value` (`16`) drops `--text-num-xl` →
  `--text-band-years` (32px), and `.hero__value` must be `--demoted` whenever the band renders.

## OQ-5 — share-text register, with copy

**Is `Quedan N días` factual?** The number is factual (calendar arithmetic to a disclosed anchor).
The verb is not: *quedan* presents the days as a stock that runs out, implying something ends on
1 January 2042. Nothing ends — that date is a conventional anchor for a projected crossing. So
`Quedan` is rhetoric. `Faltan N días para el 1 de enero de 2042` is plain calendar language
("N days until date") and is factual, provided the projection is named in the same sentence.

Proposal: a new `share.*` namespace with its own register — keeps every `countdown.*` ban
**except** that `faltan` is allowed when immediately followed by `días para` + the anchor date,
and the imperative `compruébalo` is allowed (second person, as 002 allowed in `hero.*`).
Still banned in `share.*`: `quedan`, `solo`, `apenas`, `ya`, `bomba`, `explota`, `colapso`,
`última oportunidad`, `!`.

Spanish options for the owner (JS text / no-JS text; `{days}` at click time, `{year}` derived):

- **A — strictly under today's bans (default if no answer)**
  JS: `España: {days} días hasta el 1 de enero de {year}. Ese año la proyección de Eurostat llega a 50 personas de 65 o más por cada 100 de 15 a 64. {url}`
  no-JS: `España, {year}: la proyección de Eurostat llega a 50 personas de 65 o más por cada 100 de 15 a 64. {url}`
- **B — recommended**
  JS: `Faltan {days} días para el 1 de enero de {year}: el año en que, según la proyección de Eurostat, España llega a 50 mayores de 65 por cada 100 personas en edad de trabajar. Compruébalo: {url}`
  no-JS: `{year}: el año en que, según la proyección de Eurostat, España llega a 50 mayores de 65 por cada 100 personas en edad de trabajar. Compruébalo: {url}`
- **C — shortest, for X**
  JS: `{days} días para {year}. 50 mayores de 65 por cada 100 en edad de trabajar en España (proyección Eurostat). {url}`
- **Refused — `Quedan {days} días…`**, any `tic tac`, any bomb/fuse word in shared text.

Other locales follow the chosen option literally (en `{days} days until 1 January {year}…`;
`Check it:` for B). The fuse percentage is not in share text (it would need its definition to
be honest, and that does not fit).

## Per-Task Directives

### Task T1: Countdown hero band

- Layout: full-content-width band ("hero band", Section 10: centred stat hero). The band renders
  inside the page's `--grid-max` container, so its `--surface-hero` ground spans the **page's
  content width** — a full-width band in the "no side rail, no column beside it" sense, not a
  viewport bleed. Content box = the page container (`--grid-max` 1240px, `--gutter`) less the
  band's own `--space-5` inline padding; the band's border-box width is what AC-003-01 measures.
  Not sticky, not floating.
  Rendered top-edge order inside `<div class="band">` (D1; the band is one CSS grid whose items are
  ordered explicitly, and the countdown's and the clock's own boxes are dissolved with
  `display: contents` so their children take their place by `order` — see Watch items and A11y):
  1. **the page's identity block** — the single `h1` (`--text-display`, 002 typography untouched),
     the scope mark, `hero__sub`, the primary and the secondary CTA. The band renders it from its
     own lead slot; the hero section renders it only when the band does not, so the page never
     carries two `h1`s and never two CTA pairs.
  2. eyebrow (`countdown.eyebrow`, `--text-meta`, `--ink-3`, uppercase tracking-label) — it is the
     `countdown` section's `aria-labelledby` target
  3. the years numeral `16 años` + its unit (`--text-band-years`, 32px)
  4. the clock's four fields — days, hours, minutes, seconds (unchanged component contract,
     AC-001-113/116)
  5. the fuse (sibling of the clock, never inside it — OQ-4)
  6. the share row (T3), **directly under the fuse** — nothing that renders text sits between the
     fuse's bottom edge and the share row's top edge but the band's own gap
  7. the countdown's own prose: `countdown__rule`, `year-line` (threshold year), `definition` (the
     projection sentence, AC-001-109), `range`, `source`, `backcast`
  8. the clock's three disclosures: `clock__anchor` with `fecha convencional del umbral`,
     `clock__definition`, `clock__arithmetic` (`16 años` at `--text-band-years`)

  Steps 7–8 are the placement D1 left free (`10-tasks.md` T1): **after** the share row, never
  between the fuse and the share row. They stay visible and outside any `<details>` (AC-003-05).
  After the band, the hero section keeps its readings panel alone (`hero--band`): the demoted
  figure value and its subject facts — no identity block, no second CTA pair.
- Per breakpoint (the order above holds at every width; only the row geometry changes):
  - **1440×900 / 1366×768**: the identity block is one flex row at ≥ 900px — the `h1` on its own
    `flex-basis: 100%` row, then the scope mark, the sub and the two CTAs sharing the next one
    (`--space-4` column gap, centred). Spanish and Italian are one `h1` line, English/French/German
    two; stacked, that second line alone was more than the difference between the share row's fold
    target and the fold. Clock: one centred row, baselines aligned,
    `[days 80px][días label] [hh 32px h] [mm 32px min] [ss 32px s]`, column gap `--clock-gap`.
    Fuse at the band's content width — the page's content box less the band's 24px inline padding;
    label and definition centred under it (`--measure` 64ch). Share row centred.
    **Measured after D1** (Chromium, built app, 2026-11-01): `h1` top **y 104**, share row top
    **y 688**, at both widths; clock rail 295.00–508.48 at 1366×768. The fuse group sits between
    the field row and the share row, so its bottom is above 688. The clock and the fuse clear the
    fold as whole boxes; the share row is asserted on its top edge only — at its `--tap-min` 44px
    control height it runs to about 732 against 768, inside the viewport but without the 50px
    clearance the clock and fuse keep, which is precisely why AC-003-50 is a top-edge target.
  - **768**: same single clock row — days 49px (~5ch ≈ 150px) plus three fields (~40px each with
    their labels) fits the band's content width at this size. Identity block stacks (the flex row
    starts at 900px). Prose lines wrap to 2 lines. The share row's fold position is **not**
    asserted at this width (AC-003-50 covers 1440×900 and 1366×768 only); it may wrap.
  - **390×844**: identity block stacks — `h1` (40px), scope mark, sub, then the two CTAs; the band
    pays for it at its own edges (`margin-top: 0`, `--band-pad-block` `--space-4` = 16px,
    padding-inline `--space-3` = 12px; the `h1`'s bottom margin and the actions' top margin come
    down with them, and no type size, measure or line height moves). Clock: two rows — days + `días`
    centred on row 1 (44px), h/min/s on row 2 as the existing 3-column grid (`--clock-sub-col`,
    3rem). Fuse at the band's content width. **Measured after D1**: the `h1` top is inside the
    first viewport (AC-003-49 asserts it), the clock rail runs 436.52–613.28 (es) and
    415.47–592.23 (en), both wholly inside 844. The share row's top is **not** asserted here — it
    wraps to two lines (AC-003-50). Steps 7–8 are the first things below the fold at this width.
    The demography heading is **not** at the fold at any width (D2): the clock/fuse guarantee is
    this spec's fold guarantee, and nothing in the band is shrunk or hidden to buy it.
- Components: existing `CountdownBlock`/clock leaf; new `CountdownBand` wrapper; the hero's own
  lead block (`HeroLead` → `HeroLeadBlock`) rendered through the band's lead slot; `Fuse`;
  `ShareRow`; `ProvenanceStrip` in its `collapsed` form for the fuse's manifest.
- Typography: days `--text-clock-days`, `--leading-tight`, `--tracking-display`, mono, `--ink-1`;
  h/min/s `--text-clock-sub`, mono, `--ink-1` (was 15px `--ink-2`); field labels `--text-meta`
  `--ink-3`; `16 años` `--text-band-years`. The identity block keeps 002's type untouched — the
  band declares no `font-size` for the `h1` (AC-002-33 keeps force); only its margins are re-set
  inside the band (`--space-2` under the `h1`, `--space-3` above the actions, `--space-1`/`--space-2`
  on phones), because the hero grid's margins are the difference between the fuse clearing the fold
  and missing it.
- Tick rhythm: `tabular-nums`; fixed `min-inline-size` per field (`--clock-days-min` 5ch,
  `--clock-unit-min` 2ch) so no width change on any digit; zero-padded `07`; no colon separators
  (labels carry units, nothing blinks); no transition/animation on value change — the digit swap
  is the tick. Seconds is the last field in reading order so the eye lands on motion.
- Motion: existing 1 Hz interval only (AC-001-114). Nothing else.
- A11y: accessible tree unchanged (AC-001-113; no `aria-live` on ticking fields). Ordering the band
  by `order` does not reorder the tree's group: `.band > .countdown` and `.band .clock` are
  `display: contents`, and Chromium keeps the labelled `role="group"` node in the accessibility
  tree through it (verified over CDP against the build); none of the reordered nodes is focusable,
  so keyboard order still follows the band's reading order. Reduced motion: sub-day fields
  `display: none`, no interval, days from render instant (AC-001-112). Band in dark mode uses dark
  `--surface-hero #201406`; all pairs above pass.
- Anti-patterns to avoid: red/alarm hue, hue shift near the anchor, glow/pulse on seconds, flip-
  clock or odometer digits, blinking colons, gradient or grain on the band, sticky band, a
  "final day" style, display text above 4rem.
- Watch items (Coder must check):
  - **One `h1`, one lead.** When the band renders, the hero must render no lead block
    (`bandShown`): a second `h1` or a second CTA pair is the failure mode here, not a restyle.
    AC-003-48/49 count blocks and find the first `<h1>`.
  - **The band's `order` values are the composition**: 1 lead, 2 eyebrow, 3 years numeral,
    4 field row, 5 fuse group, 6 share row, 7 countdown prose, 8 clock disclosures. Moving the
    prose lines above the share row fails AC-003-48's "no text between fuse and share" clause;
    leaving the clock's disclosures inside the group's box breaks the fold budget.
  - `.countdown__value` and `.hero__value` currently `--text-num-xl` (80px) — must drop or
    AC-003-03 fails.
  - Re-measure fold tokens from Chromium (AC-003-10); never relax margins. The `h1`/share-row
    targets are **top-edge** assertions and the clock/fuse ones are whole-box: do not convert one
    into the other to make a number pass.
  - `--band-pad-block` and the mobile inline padding are fold budget, not decoration — a content
    size, measure or line height traded for them fails AC-002-21.
  - Mono at 80px: check `--clock-days-min` 5ch still holds `5 541`-style grouped output without
    reflow; locale group separators differ (`5.541` es, `5,541` en, `5 541` fr thin space).
  - `--clock-sub-col` widening must not break AC-002-10/11 centring tests.

### Task T2: Data-driven fuse (visible surface)

- Layout: one horizontal line across the full band content width, between the clock's field row
  and the share row. Under the line, in this order: the label line, the ratio's definition, the
  `Reproducir` link — all centred on the band's own axis (the band centres its contents; the label
  is not aligned to the fuse's start). The provenance is deliberately **not** visible here.
- Form — a cord that has burned **from its far end**, not a bar that fills:
  - Remaining cord: 1px, `--ink-3`, from inline-start to the burn point (a `height` attribute in
    the SVG's own units, beside the burnt segment's).
  - Burnt segment: `--fuse-burnt-h` 6px, `--accent`, from the burn point to **inline-end**,
    ending flush at the band edge. Burning right-to-left inverts the fill direction every progress
    bar uses.
  - Burn point: the cord's own square end — no cap is drawn, so no ember, glow, flame, spark or dot.
  - No track box, no border, no rounded ends, no tick marks, no end marker, no date, no "50"
    flag at either end. No `role="progressbar"`, no `aria-valuenow`.
- Length mapping: burnt length = `clamp(consumed,0,1) × content width`, linear. Rendered as an
  inline `<svg aria-hidden="true" viewBox="0 0 1000 6" preserveAspectRatio="none">` with two
  `<rect>`s whose `x`/`width` are attributes computed server-side (no `style=` prop, no client
  JS). The SVG is outside the `CountdownBlock` subtree (see contradictions).
- Label (visible text, primary channel), `fuse.*` keys: `--text-small`, `--ink-1`, tabular figures
  (`font-variant-numeric: tabular-nums`) — sans, like the prose it sits in; mono stays reserved for
  the clock's numerals and the years numeral.
  es: `Mecha: 62 % consumida — ratio de dependencia observado 31,22 (2025) ÷ umbral 50`
  Definition line, `--text-meta` `--ink-3`: `Personas de 65 o más por cada 100 de 15 a 64,
  España, Eurostat demo_pjan, último año observado.` Then a `Reproducir` link to the reproduce panel
  entry (same pattern as other computed figures), and — behind it, closed — the provenance: the
  four fields, the input hash with its copy control, the source URLs, the derived file and the
  reproduce path all render **inside the existing `Cómo se calcula` `<details>`**
  (`ProvenanceStrip` with `collapsed`), not as a strip occupying inline space under the fuse
  (D1, AC-003-51). Collapsed, not removed: the same manifest, one click away, still listed in the
  reproduce panel.
  Above-threshold: label prints the unclamped value (`104 %`), drawn line fully burnt.
- Absent state: the whole fuse (svg, label, definition, `Reproducir` link, and the disclosure that
  carries its provenance) is not rendered; no reserved height, no placeholder, no "sin dato" chip.
  Band closes up.
- Motion: static. Does not change on tick, never animates in, no CSS transition.
- A11y: meaning is the label text; graphic `aria-hidden`. Thickness carries burnt vs remaining
  in monochrome/forced-colors (in `forced-colors: active` both segments resolve `CanvasText`,
  thickness still distinguishes).
- Anti-patterns to avoid: progress-bar look (rounded track, fill from left, percentage at the
  fill tip), any illustration (bomb body, flame, spark), red/`--data-deficit`, `--data-projection`
  (it is an observed value), projected 31.9 for "now".
- Watch items: OQ-3 half-up rounding `62.44 → 62`, `62.5 → 63` (no banker's rounding via
  `Intl` default — `Intl.NumberFormat` uses half-expand, verify); the label must not contain any
  year other than the observation year; the provenance stays inside the disclosure — re-expanding
  it as a strip under the fuse puts text between the fuse and the share row and fails AC-003-48;
  the collapsed disclosure must not change the fuse's asserted drawn box (AC-003-21 measures the
  line and its label, not the `<details>`).

### Task T3: Share row

- Layout: single row inside the band, **directly under the fuse** and before the countdown's prose
  (band order 6 — D1, AC-003-50), centred; wraps to 2 rows at 390 (`flex-wrap`, `--share-gap`).
  Order: **[Compartir…] (native, JS-only, only if
  `navigator.share`)**, WhatsApp, Telegram, X, LinkedIn, **Copiar enlace**. WhatsApp first: the
  Spanish audience's primary channel.
- Control appearance (all six identical in weight; none is the page's primary action):
  `min-block-size` and `min-inline-size` `--tap-min` 44px, padding `--space-2 --space-3`,
  `--border-strong`, `--radius` 0, background transparent, text `--ink-1` `--text-small`,
  glyph `--share-icon` `currentColor` + visible text label (icon never alone). Hover: border
  `--ink-2`; focus: global `:focus-visible`. No accent fill, no brand colours.
- No-JS form: four `<a href target="_blank" rel="noopener noreferrer">` with the no-JS text
  (year, no days). Copy-link is a `<button>`; without JS it is replaced by a `<input readonly>`
  holding the canonical URL with a label (`share.linkLabel`) — present in server HTML inside
  `<noscript>`-free markup that JS swaps for the button (progressive enhancement, not
  `<noscript>`, so no-JS completeness tests see it).
- Web Share button: not in server HTML; inserted only when `navigator.share` exists. Not
  disabled-when-absent.
- Copy feedback: button text swaps `Copiar enlace` → `Enlace copiado` for 2s; a visually-hidden
  `role="status"` sibling outside the clock subtree announces it. No toast, no animation.
  No Clipboard API → reveal the readonly input, pre-selected.
- A11y: accessible name = visible text (+ `share.newWindow` suffix for `_blank` links).
- Anti-patterns: third-party widgets/SDKs, brand-coloured pills, follower counts, share counts,
  floating share bar, prefetch/preconnect to networks.
- Watch items: the share row must not resolve `var(--accent)` anywhere (AC-002-31 "only
  accent-coloured action"); glyph SVGs must not land inside `CountdownBlock` (AC-001-99 `<svg`).

### Task T4: Link preview

- `<title>` / `og:title` (scope suffix kept, `{year}` derived):
  - es `{year}: España llega a 50 mayores por cada 100 en edad de trabajar · pensiones · España`
  - en `{year}: Spain reaches 50 people over 65 per 100 of working age · pensions · Spain`
  - fr `{year} : l'Espagne atteint 50 personnes de 65 ans ou plus pour 100 en âge de travailler · retraites · Espagne`
  - de `{year}: Spanien erreicht 50 Menschen ab 65 je 100 im Erwerbsalter · Renten · Spanien`
  - it `{year}: la Spagna arriva a 50 persone over 65 ogni 100 in età lavorativa · pensioni · Spagna`
- `og:description` (es; others parallel): `Proyección de Eurostat, variante base. El año, la
  fuente y el cálculo, reproducibles con un comando.`
- Year-free fallback: current strings, unchanged.
- Share card 1200×630, generated at build: `--surface-hero` ground (light theme literal resolved
  at build), 64px margins; top-left eyebrow `PROYECCIÓN · EUROSTAT` mono 28px `--ink-3`;
  centred-left `{year}` IBM Plex Mono 300px `--ink-1`; under it one line (Instrument Sans 40px
  `--ink-2`) = the title sentence without the year; bottom-left scope line (AC-001-102); bottom-
  right site host. A 6px `--accent` rule under the year, full card width — **not** the fuse (no
  ratio, no percentage, no length mapping). No day count, no date, no metric.
  `og:image:alt` per locale names the year and the sentence.
- Watch items: generator reads `thresholdYear`; test with threshold 40/60 that the card text
  moves; fonts embedded at build from repo files (no Google Fonts fetch).

### Task T5: "en preparación" block

- Layout: one compact section in the figures area, at the position of the first unavailable
  figure's former slot; `--surface-2` ground, `--border-hair`, padding `--space-5`.
- Heading (h3, `--text-h3`): `5 cifras en preparación` (count from data, ICU plural; singular
  `1 cifra en preparación`), followed by the single chip `sin calcular` (`--text-meta`,
  `--state-pending` ink — existing token) — its only occurrence on the page.
- List: `<dl>`-style rows, each: figure name (`--text-body`, `--ink-1`), reason (`--text-small`,
  `--ink-2`), definition (one sentence, `--text-small`, `--ink-2`), `Método →` link. No chart,
  hash, table, or reproduce command.
- Motion: static. Not inside `<details>` (definitions must stay stated and visible).
- Anti-patterns: thesis vocabulary, apology copy, skeleton loaders or greyed-out chart ghosts,
  "coming soon" badges.
- Watch items: AC-001-91 section-count headings; any 001 test asserting the chip in the figure's
  own slot is re-pointed, not deleted.

## Archived design rules overridden (and why)

- **001 Rev 3 refusal (9)** full-width band — overridden for full-width only (T1; owner's brief).
  Sticky/floating still refused.
- **001 Rev 3 refusal (7)** fuse — overridden for the data fuse only (T2). Its form here is a
  line, not an illustration.
- **001 D7 / Rev 2 refusal 6** no number on card — amended for the derived year only (T4).
- **001 sizing of the clock** (days `--text-num-l`, sub `--text-small`/`--ink-2`) — overridden:
  days `--text-num-xl`, sub `--text-num-l` `--ink-1`.
- **Hierarchy "years numeral largest" (Rev 3/002 T3)** — overridden: `16 años` demoted to 32px.
- Not overridden: refusal (12) 4rem display cap — kept (the numeral uses the existing numeral
  ladder). Measure ≥ 64ch kept.

## Out-of-scope tasks

- T2 computation, manifest, hash, reproduce command (no visual surface beyond the label/link).
- T3 network-request and cookie invariants (behavioural).
- Cross-cutting invariants AC-003-44/45/46 (prerender, lang, hreflang, admin, thesis).

## Contradictions with scenarios (by ID)

1. **AC-001-99** asserts `CountdownBlock` HTML contains no `<svg>` and no `aria-live`. The fuse
   SVG, share glyphs and copy `role="status"` must therefore render in sibling components
   outside `CountdownBlock`. If the Coder places them inside, AC-001-99 fails — structure, not
   the test, must change.
2. **AC-003-03** vs the base CSS: `.countdown__value`'s numeral and `.hero__value` declare
   `--text-num-xl` (80px) at their base rules; what AC-003-03 measures is the computed size, so the
   band's `.countdown__numeral` override (32px) and the `hero__value--demoted` class must both be in
   force whenever the band renders. A missing override is a guaranteed failure, not a scenario
   conflict.
3. **AC-003-33 / AC-002-28** vs OQ-5 option B: `Faltan` and `Compruébalo` violate the
   `countdown.*` bans the scenario applies "until answered". B ships only if the gate approves a
   separate `share.*` register; otherwise A.
4. **AC-002-31** "the only accent-coloured action above the fold": the fuse uses `--accent` but is
   not an action; share controls are deliberately non-accent. Verifier should confirm the test
   checks actions, not any accent pixel.
5. **OQ-4 "`--rule-*` or `--ink-3`" for the remainder**: `--rule-*` fails 3:1 non-text in both
   themes (1.38–1.95); this design fixes `--ink-3`.

## Refusals (with reasons)

- `Quedan N días` and any countdown verb implying depletion — rhetoric, not arithmetic.
- Fuse ember/flame/spark/glow, bomb body, or any burning animation — illustration adds assertion
  without evidence (001 R7 rule).
- Fuse percentage or fuse drawing on the share card — a metric on a static artefact goes stale
  with the snapshot and violates T4's metric ban.
- Raising the display cap above 4rem — not needed; 80px numeral already beats the 64px h1.
- Brand-coloured share buttons, third-party share SDKs, share counters — tracking surface and
  visual noise; also would add hues.
- Animating digits (flip, roll, fade) — layout and motion budget; the swap is the tick.
- Red, `--data-deficit`, or `--data-projection` on the fuse — alarm hue / mislabels an
  observation as a projection.
