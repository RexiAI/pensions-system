# 003-countdown-hero — Tasks

Extends the shipped product (archived specs `docs/changes/001-pension-math.md`,
`docs/changes/002-hero-conversion.md`). Every 001/002 task, scenario ID and integrity rule
stays in force **except where a task below names an archived scenario or directive and states
the change explicitly**. Nothing here is a silent contradiction: if a downstream stage finds a
conflict not listed under "Archived scenarios affected", it is an open question, not a licence.

Scenario IDs: `AC-003-01` … `AC-003-51`. `AC-003-48`…`AC-003-51` were added by
**Gate decisions 2** (2026-11-01, D1/D2) and are appended, never renumbered: no existing ID
changes meaning.

> **Traceability note for downstream stages.** The upstream gate
> `.standards/scripts/check-scenario-traceability.sh` only matches two-digit scenario numbers.
> All IDs in this spec are two-digit (`AC-003-01`…`AC-003-51`), but the archived three-digit IDs
> this spec re-points (`AC-001-107`, `AC-001-116`, …) are only seen by the repo-local wrapper
> `scripts/check-scenario-traceability-3digit.ts`. Run both.

Measurement conventions used throughout (so criteria are checkable, not judged):
- "Desktop" = Chromium viewport 1366×768 **and** 1440×900. "Mobile" = 390×844.
- "Computed font size" = `getComputedStyle(el).fontSize` in a real Chromium page (the same
  harness as `tests/acceptance/first-viewport.test.ts`), not a token read.
- "First viewport" = the element's bounding box satisfies `top ≥ 0` and `bottom ≤ innerHeight`
  with no scroll.
- "Public page" = each of the five prerendered locale routes (`es`, `en`, `fr`, `de`, `it`).
- "Third-party origin" = any request origin other than the page's own origin (`SITE_URL`).

---

## T1 — Countdown hero band

**Goal.** Make the countdown the dominant element of the page: a full-width band, the day
numeral the largest number on the page, the seconds visibly ticking at display size — keeping
every disclosure 001/002 requires.

**Acceptance file.** `20-acceptance/AC-003-countdown-band.md`

**Acceptance criteria.**
- The countdown renders inside one band whose bounding-box width equals the document's content
  width at 390×844, 1366×768 and 1440×900 (no side rail, no column beside it).
- **Band composition (D1, 2026-11-01).** Inside the band, in rendered top-edge order: the hero
  copy — the page's single `h1` (the hero statement), the `hero__sub` line and the two hero
  actions — then the `countdown.eyebrow`, then the clock, then the fuse, then the share row.
  The `h1` is the band's first text block, and nothing that renders text sits between the
  fuse's bottom edge and the share row's top edge except the band's own spacing. The hero's
  internal order (`h1` → scope mark → `hero__sub` → the two actions) is unchanged from 002. The
  hero's figure panel (the demoted numeral and its subject facts) is **not** moved into the
  band: D1 names the `h1` and the statement/CTA block, and nothing else.
- **Fold targets (D1, 2026-11-01).** At 1440×900, 1366×768 and 390×844: the `h1`'s
  bounding-box top is inside the first viewport, and the clock (day numeral through seconds
  field) and the fuse (drawn line and label) are wholly inside it. At 1440×900 and 1366×768 the
  share row's bounding-box top is inside the first viewport. The share row's top is **not**
  asserted at 390×844 (the row wraps to two lines there). "Inside the first viewport" means
  `top ≥ 0` and, for the whole-box clauses, `bottom ≤ innerHeight`.
- The day numeral's computed font size ≥ the `<h1>`'s computed font size, at all three viewports,
  in all five locales.
- No other numeral on the public page has a computed font size greater than the day numeral's.
- The seconds field's computed font size ≥ 32px at 1366×768 and 1440×900.
- Retained, visible, outside any `<details>`/`title`/tooltip, in all five locales: the anchor
  date with its `fecha convencional del umbral` label, the sentence stating the threshold year is
  a projection (AC-001-109), and the two-reference sentence `countdown.clock.arithmetic`
  (AC-001-119 as amended by AC-002-15). The fuse's new `<details>` (T2, D1) must not swallow
  any of the three.
- The `h1` keeps `--text-display`'s resolved size and its 002 hero typography after moving into
  the band: the move relocates the element, it does not restyle it (AC-002-33 keeps force; the
  band must not restate `font-size` for `h1`).
- Placement left free by D1, to be spent on the fold targets: the countdown's own prose lines
  (`.countdown__rule`, `year-line`, `definition`, `range`, `source`, `backcast`) sit either
  between the clock and the fuse or after the share row — **never** between the fuse and the
  share row. Recommended default: after the share row, since that is the placement that buys
  the fold budget. No scenario asserts which of the two; AC-003-05 keeps them visible and
  outside any `<details>` either way, and the clock's own three disclosures travel inside the
  clock subtree.
- All 001/002 clock behaviour holds unchanged: one interval at 1 Hz (AC-001-114), no-JS
  completeness (AC-001-111), accessible tree (AC-001-113), elapsed state (AC-001-115), no clock
  without a threshold year (AC-001-110).
- Reduced motion: the sub-day fields are `display: none` and no interval is created; the day
  count stays and still reflects the render instant (AC-001-112 unchanged — "hide, not freeze").
- Type scale (OQ-2, decided): the day numeral uses the numeral ladder `--text-num-xl` (80px
  desktop, 44px at 390) and is strictly larger than the `h1` at every width; the 4rem
  `--text-display` cap is unchanged. While the band shows, the `16 años` numeral is 32px and the
  hero figure uses its demoted style, so no numeral exceeds the day count.
- Copy added for the band lives under `countdown.*` and keeps the factual register (AC-002-28):
  no second person, no `bomba`/`explota`/exclamation mark.

**Archived scenarios / directives affected (explicit changes).**
- **001 Revision 3 refusal (9)** "a sticky, floating, or full-width clock band" — **superseded
  for "full-width" only**. Sticky and floating stay refused.
- **AC-001-107** — "at 1280×800 and 390×844 the hero does not fill the viewport, and the
  demography heading and finding sentence are visible at the fold." **D2 (2026-11-01, owner
  approved): the demography-heading-and-finding-at-fold clause is retired at every width.**
  Recorded history, not a preference: the clause was already unmet at 1366×768 before 001
  revision 3 — the clock box measured 480.91–925.59 in Chromium against the built app on
  2026-10-29, so the projection block and everything under it sat below a 768px fold — and a
  band-first page cannot put the demography heading at the fold at any width while the band, the
  clock and the fuse lead the page. Retiring it is a scoped override, not a deletion: AC-001-107
  keeps its other clauses (the hero does not fill the viewport — `--hero-min-h: 560px`, no
  viewport-height minimum at any breakpoint, at 1280×800 and 390×844), and its "the countdown
  leads the page, above the figure strip" assertion is re-pointed a second time (003 T1
  re-pointed it once): the band precedes the figure strip, the countdown is inside the band, and
  the hero figure keeps its demoted value — while the `h1` now precedes the clock inside the band
  (D1, AC-003-48). The clock-and-fuse fold guarantees below (AC-003-06) replace the retired
  clause as this spec's fold guarantee for the leading block.
- **AC-002-18 / AC-002-20 / AC-002-21** — the fold tokens and the pinned measurement table in
  `first-viewport.test.ts` are re-measured from real Chromium (AC-002-21's rule: measured numbers
  may change; budgets/margins may not be relaxed to pass). D1 adds rows to that table — the `h1`
  and the share row at 390×844, 1366×768 and 1440×900 — and adds 1440×900 to the clock and fuse
  rows. The `h1` and share-row assertions are top-edge-only because the owner's decision is a
  top-edge target; the clock and the fuse keep the whole-box budget and the 50px clearance
  margin. A top-edge target is a narrower assertion than a whole-box one, not a relaxed one.
- **AC-002-10 / AC-002-11** — the years numeral and clock remain one centred group; the band
  widens the container, it does not reintroduce left alignment.

---

## T2 — Data-driven fuse

**Goal.** A static fuse whose consumed fraction is a reproducible figure: the latest **observed**
old-age dependency ratio ÷ the threshold.

**Acceptance file.** `20-acceptance/AC-003-fuse.md`

**Acceptance criteria.**
- Definition: `consumed = observedRatio(latestObservedYear) ÷ threshold`, where
  `observedRatio` = population 65+ per 100 aged 15–64, Spain, Eurostat `demo_pjan`, read from the
  committed snapshot `data/snapshots/eurostat-demo-pjan.json`; `latestObservedYear` = the greatest
  year in that snapshot for which both age classes are present; `threshold` = the same documented
  threshold parameter T18 (001) uses — not a second literal.
- With the committed snapshot: `observedRatio = 31.22` (year 2025), `consumed = 0.6244`.
- Stored precision: the fraction as a percentage to two decimals (`62.44`), per AC-001-08's
  two-decimal convention. Display rounding: **integer percent, round half up** (`62 %`), the
  observed ratio printed with two decimals (`31,22` in `es`, locale decimal separator) and its
  year printed beside it. (OQ-3 decided: whole percent half-up, `62 %`, stored `62.44`.)
- `consumed` is clamped to `[0, 1]` for the drawn length only; the printed percentage is the
  unclamped value (an observed ratio above the threshold prints > 100 %, never a capped 100 %).
- The fuse is a derived figure with its own complete manifest (`formulaId`, `definitionId`,
  `sourceUrl`, `fetchedAt`, `inputHash`, `reproducePath`, `snapshotYear` — the AC-001-01 field
  set), a definition string in instrument vocabulary (AC-001-92), a reproduce command, and
  provenance (D1, 2026-11-01): the four provenance fields, the input hash, the source URLs and
  the reproduce path all render **inside the existing `figure.methodLink` disclosure** — the same
  "Cómo se calcula" `<details>` every computed figure already carries, closed by default —
  instead of as a strip occupying inline space under the fuse. It is listed in the reproduce
  panel.
- Reproducing: running the published reproduce command on the committed snapshot outputs the same
  `inputHash` and the same `62.44`.
- `inputHash` changes when the `demo_pjan` snapshot changes (AC-001-02 rule applied).
- No observed value (snapshot absent, no year with both age classes, or `availability` ≠
  `computed`) → the fuse element, its percentage and its provenance do not render at all; no
  placeholder, no substitute from `proj_23np`. The clock is unaffected.
- No threshold year (clock states `not-crossed`/`unavailable`/`withheld`, AC-001-110) → no fuse
  either (the fuse sits in the countdown band and has no meaning without it).
- Never uses `proj_23np` (including its 2025 back-cast 31.9) for the "now" value; the projected
  series is never read by the fuse computation.
- Never implies a date: the fuse carries no date, year-of-crossing, or day count other than the
  observation year of its input; no element maps fuse length to time; it does not animate,
  burn down or change with the clock tick (it is not a progress bar toward the anchor).
- Colour: the fuse's subtree resolves no `--data-deficit` and introduces no new hue token; it
  uses only existing palette tokens: consumed segment `--accent`, remainder `--ink-3` (OQ-4,
  decided; `--rule-*` measured below the 3:1 graphic minimum); the fuse is a sibling of the clock
  subtree, never inside it. AC-001-117 (deficit hue unchanged,
  three chromatic hues) holds.
- Accessible: the fuse's meaning is exposed as text (percentage, ratio, year, threshold) — the
  graphic is `aria-hidden`; no `role="progressbar"`, no `aria-valuenow` (it is not progress).
- The fuse's drawn line and its label are wholly inside the first viewport at 390×844,
  1366×768 and 1440×900 when it renders (D1). The collapsed disclosure is not part of that
  asserted box.

**Archived scenarios / directives affected (explicit changes).**
- **001 Revision 3 refusal (7)** "a fuse / bomb / hourglass / siren illustration" — **superseded
  for a data-driven fuse only** (user decision in `00-informal.md`). Bomb, hourglass, siren and any
  decorative fuse stay refused.
- **001 Revision 3 refusal (8)** "a progress bar toward the anchor" — **stays in force**; T2's
  "never implies a date / not progress" criteria are how the fuse complies.
- **T18 (001)** "never mixing a `demo_pjan` observation" — scoped to the **projected series**;
  it stays true there. The fuse is a separate figure reading `demo_pjan` only. AC-001-98 ("the
  published series never mixes the observation into the projection") is unchanged.
- **AC-001-116** "the clock is the page's only continuous element" — unchanged: the fuse is static.
- **AC-001-105** — the fuse is a computed figure, so it is advertised as reproducible.

---

## T3 — Sharing without tracking

**Goal.** One-tap sharing that keeps the footer's no-tracking promise true.

**Acceptance file.** `20-acceptance/AC-003-share.md`

**Acceptance criteria.**
- Share controls: WhatsApp, X, Telegram, LinkedIn, copy link, and a native-share button.
- WhatsApp/X/Telegram/LinkedIn are plain `<a href>` elements to the networks' documented share
  URLs, present in the server-rendered HTML, working with JavaScript disabled.
- No-JS link text leads with the threshold year (`2042`), derived from `thresholdYear` — no day
  count, no `Faltan`.
- With JS, on click, the share text is recomputed at click time: the day count equals the clock's
  day value at the click instant (same computation as the clock, same anchor). It never comes from
  the render instant.
- The shared URL is the canonical URL of the current locale route (`canonicalUrl`, AC-001-35).
- Native share: the button renders only when `navigator.share` exists; when absent, it is not in
  the DOM (not disabled). Its payload is the same text + URL as the links.
- Copy link writes the canonical URL to the clipboard and shows a visible confirmation from a
  locale key; with no Clipboard API, the URL is shown as selectable text instead.
- Zero third-party scripts, iframes, images, fonts or pixels: no `<script src>`/`<iframe>`/`<img>`
  with a third-party origin in any public page; icons are inline/same-origin.
- Network: loading a public page and activating each share control makes zero requests to a
  third-party origin from the page (the navigation opened by an `<a target>` to the network is a
  user-initiated top-level navigation in a new browsing context and is excluded; `prefetch`/
  `preconnect`/`dns-prefetch` to those origins are forbidden).
- Links carry `rel="noopener noreferrer"`; no tracking parameters (`utm_*`, `fbclid`, etc.) are
  appended to the shared URL.
- The footer string promising no cookies / no third-party analytics / no tracking is unchanged
  and no cookie is set on a public route.
- All share strings come from locale keys in all five locales (AC-001-35, key parity AC-002-24).
- Share copy (OQ-5, decided — option B), es template:
  `Faltan {days} días para el 1 de enero de {year}: el año en que, según la proyección de Eurostat, España llega a 50 mayores de 65 por cada 100 personas en edad de trabajar. Compruébalo: {url}`.
  Other locales: equivalent factual wording. Lives under a separate `share.*` copy-rule set that
  permits `faltan`, the explicit anchor date and the imperative `Compruébalo`; it still bans
  `Quedan`, `bomba`, `!` and urgency adjectives.
- Accessible names for every control in every locale.
- Placement (D1, 2026-11-01): the share row is inside the band and directly under the fuse —
  no element rendering text between the fuse's bottom edge and the share row's top edge — not
  below the band and not inside the hero (AC-003-48).
- Fold (D1): the share row's bounding-box top is inside the first viewport at 1440×900 and at
  1366×768. At 390×844 the share row's top is not asserted: the row wraps to two lines there.

**Archived scenarios affected (explicit changes).**
- **AC-002-28** (factual register / `countdown.*` bans) — **scoped override for `share.*` only**:
  `faltan`, the anchor date and `Compruébalo` are permitted in `share.*`; `Quedan`, `bomba`, `!`
  and urgency adjectives stay banned there. AC-002-28 is unchanged for `countdown.*`, `hero.*` and
  every other namespace (AC-003-33, AC-003-47).
- AC-001-35 (no string literal in a component) and AC-002-24 (key parity) apply to the new keys.

---

## T4 — Link preview built on 2042

**Goal.** Make the shared preview about the threshold year, never a day count.

**Acceptance file.** `20-acceptance/AC-003-preview.md`

**Acceptance criteria.**
- On every public route: `<title>`, `og:title`, `og:description`, and the share card image contain
  the threshold year, in all five locales.
- The year is interpolated from `thresholdYear` in derived data; no locale string, component,
  or generated file contains a hand-typed `2042` (a test changes the threshold and sees the year
  move, as AC-001-108 does for the anchor).
- No static artefact (`<title>`, `<meta name="description">`, any `og:*`/`twitter:*` tag, share
  card image, `og:image:alt`, sitemap, manifest) contains a day count, an hour/minute/second
  value, or the anchor's full date.
- When there is no threshold year (`not-crossed`/`unavailable`/`withheld`), the preview falls back
  to the year-free strings (current behaviour) — no substitute year.
- The scope suffix from the country record (AC-001-102) is kept on `<title>` and `og:title`.
- `og:image:alt` stays distinct per locale (001 fix) and names the year if the card does.

**Archived scenarios / directives affected (explicit changes).**
- **001 design D7 / Revision 2 refusal 6** "no metric, no number, no date on the share card" and
  **T18 (001)** "the number never appears in the meta description or the share card" —
  **amended**: the threshold **year**, derived, is permitted; the countdown number, any day/time
  value and the anchor date remain banned. Rationale from `00-informal.md`: a year survives until
  the projection is revised, a day count is wrong tomorrow.
- **AC-001-102** — test "the share card carries the scope line and no metric, number or date" is
  re-pointed to "… and no metric, no day/time value and no date other than the derived threshold
  year". **Scoped override:** the share card (and static preview) may carry the derived threshold
  year only; the day count permitted in the click-time share text (T3, OQ-5) never reaches the
  card or any static artefact. Its other assertions are unchanged.
- **AC-001-116** "appears in no … share card, `og:*`, or meta description" — unchanged: the year
  is not the clock.

---

## T5 — Collapse the unavailable figures

**Goal.** The five unresolved figures stop dominating the page: one "en preparación" block.

**Acceptance file.** `20-acceptance/AC-003-pending.md`

**Acceptance criteria.**
- All figures with `availability` ≠ `computed` render in exactly one block, headed with the count
  derived from data (`5 cifras en preparación` in `es` today; the number is not typed).
- Each entry: figure name, its reason (from data/locale keys), its published definition
  (AC-001-77/84/87 keep "unavailable with its definition stated"), and a link to its method.
- The visible string of `figure.unavailable.chip` (`sin calcular` in `es`) occurs at most once in
  the rendered text of the `es` public page; the equivalent key occurs at most once per locale.
- No chart, no table, no hash, no reproduce command for those figures (AC-001-75, `reproduce.omitted`).
- Computed figures are unaffected; their position and provenance are unchanged.
- When zero figures are unavailable, the block does not render. When one is, the heading uses the
  singular form.
- Section-count headings still match the registers rendered (AC-001-91).
- The block is outside the thesis register and carries no thesis vocabulary (AC-001-41/42/92).

**Archived scenarios affected (explicit changes).** **AC-001-81 / AC-001-84 / AC-001-87** — still
"render unavailable, never a substitute", but the rendering location moves from the figure's own
slot to the collapsed block. Any 001 test asserting the chip inside the figure's own slot is
re-pointed to the block; the "no substitute" assertion is unchanged.

---

## Cross-cutting invariants (no single task owns them)

**Acceptance file.** `20-acceptance/AC-003-invariants.md` — regressions that must not happen:
static prerender of the five public routes (AC-001-69), `<html lang>` per route, `hreflang` set
(AC-001-52), `/admin` fail-closed (AC-001-53/54), no-JS completeness, thesis register uncoloured
and separate (AC-001-41/42/43).

---

## Gate decisions (2026-10-30)

Owner approved at the human gate. These close OQ-1…OQ-6; the open-question list below is kept
for history only.

- **OQ-1** — AC-001-107 stays in force at 1280×800; at 390×844 only the "demography heading at
  the fold" clause is retired; clock and fuse must be in the first viewport. (T1, AC-003-06)
  *Superseded in part by **D2** (see Gate decisions 2): the demography-at-fold clause is retired
  at every width, 1280×800 included. The clock-and-fuse half stands.*
- **OQ-2** — day numeral uses `--text-num-xl` (80px desktop, 44px at 390), larger than the `h1`
  at every width; 4rem display cap unchanged; `16 años` numeral drops to 32px and the hero figure
  uses its demoted style while the band shows. (T1, AC-003-02, AC-003-03)
- **OQ-3** — fuse shown as whole percent half-up (`62 %`), stored `62.44`. (T2, AC-003-13)
- **OQ-4** — consumed `--accent`; remainder `--ink-3` (`--rule-*` below 3:1 in both themes); fuse
  is a sibling of the clock subtree. (T2, AC-003-22)
- **OQ-5** — option B. es template:
  `Faltan {days} días para el 1 de enero de {year}: el año en que, según la proyección de Eurostat, España llega a 50 mayores de 65 por cada 100 personas en edad de trabajar. Compruébalo: {url}`.
  No-JS form drops the day count and leads with `{year}`. Separate `share.*` copy-rule set permits
  `faltan`, the anchor date and `Compruébalo`; `countdown.*` bans stay in force elsewhere;
  `Quedan`, `bomba`, `!`, urgency adjectives banned in `share.*` too. Other locales: equivalent
  factual wording. (T3, AC-003-24, AC-003-25, AC-003-33, AC-003-47)
- **OQ-6** — reduced motion exactly as AC-001-112. (T1, AC-003-07)

## Gate decisions 2 (2026-11-01)

Owner-approved amendments, measured on the built app before the decision: at 1440×900 the `h1`
sat at y 1294 (viewport 900) and the share row at y 1106; at 390×844 the `h1` at y 1604 and the
share at y 1384. The band was correct about the clock and wrong about the page: its own identity
and its only way to spread were two screens down.

Affected tasks: **T1, T2, T3**. T4 (preview) and T5 (pending block) are unchanged by both
decisions.

- **D1 — band composition.** The hero copy (the `h1` and the statement/CTA block) moves to the
  **top of the band**, above the clock. The fuse's provenance strip is **collapsed into the
  existing "Cómo se calcula" disclosure** (`figure.methodLink`) rather than occupying inline
  space under the fuse. The **share row sits directly under the fuse**, inside the band. Targets,
  asserted: at 1440×900, 1366×768 and 390×844 the `h1` top is inside the first viewport; the
  share row's top is inside the first viewport at 1440×900 and 1366×768; the clock and the fuse
  remain wholly inside the first viewport at all three widths. (T1, T2, T3 — AC-003-06,
  AC-003-48, AC-003-49, AC-003-50, AC-003-51.)
- **D2 — retire the demography-at-fold clause.** AC-001-107's "demography heading and finding
  sentence at the fold" clause is **retired at every width**, recorded as a scoped override with
  the measured history: the desktop clock was already below the fold at 1366×768 (measured
  480.91–925.59 on 2026-10-29) before revision 3, so the clause has been unmet since then and
  cannot hold on a band-first page. The clock-and-fuse fold guarantees in this spec remain in
  force. AC-001-107 is **amended, not deleted**: its other clauses keep force and its
  countdown-precedes-the-figure assertion is re-pointed (see T1). (T1 — AC-003-06, AC-003-48.)

Both decisions were approved at the gate before these artifacts were amended. They are recorded
here, not re-opened: a downstream stage that finds a conflict with either one raises it as an
open question, it does not pick the alternative.

**Consistency note — `15-design.md` predates both decisions.** Where `15-design.md` and the
artifacts above disagree, `10-tasks.md` + `20-acceptance/` win, and the design line is stale. The
stale lines are: §"OQ-2 recommendation" ("the h1 placed after the band so the numeral is the first
large shape read"); §T1 "Layout" (the band's DOM order list — eyebrow, clock, fuse, disclosures,
share row — and "then, after the band, the existing hero: h1 …"); §T1 per-breakpoint "h1 at ~520px"
and "Disclosures then share row; h1 below"; §T2 "Layout" (label line under the fuse, "then the
standard provenance strip"); §T3 "Layout" ("after the disclosures"). Re-running the UX stage to
refresh `15-design.md` against D1/D2 is a follow-up, not a precondition for stage 2 — the criteria
here are self-sufficient (AC-003-06, AC-003-48, AC-003-49, AC-003-50, AC-003-51).

## Open questions (resolved — see Gate decisions and Gate decisions 2)

1. **OQ-1 — AC-001-107's demography-at-fold half.** A full-width band with a display-size clock
   and a fuse may not leave room for the demography heading at the fold at 390×844.
   *Recommended default:* keep AC-001-107 in force at 1280×800; at 390×844 retire only the
   "demography heading and finding sentence at the fold" clause and keep "clock and fuse in the
   first viewport" (T1/T2). Needs explicit approval since it changes an archived scenario.
2. **OQ-2 — Display-type cap.** 001 refusal (12) caps display type at `--text-display: 4rem`.
   "Day numeral ≥ h1" is satisfiable at the cap (equal), but "the strongest thing on the page" may
   want more. *Recommended default:* keep the 4rem cap; the day numeral uses `--text-display`
   (equal to the h1) and dominance comes from the band and weight, not a new size.
3. **OQ-3 — Fuse display rounding.** *Recommended default:* integer percent, round half up
   (`62 %`), matching `00-informal.md`; stored value two decimals (`62.44`). Alternative: one
   decimal (`62,4 %`).
4. **OQ-4 — Fuse hue.** The fuse is an **observed** value, so `--data-projection` (reserved for
   projected values, AC-001-106) would mislabel it; `--data-deficit` is banned.
   *Recommended default:* `--accent` (the 002 saturated olive) for the consumed segment and
   `--rule-*`/`--ink-3` for the remainder. Note AC-001-116 restricts the **clock's** subtree to
   `--ink-*`/`--data-projection`; the fuse must therefore be a sibling subtree in the band, not
   inside the clock subtree.
5. **OQ-5 — Share-text register.** 001 bans `cuenta atrás`, `quedan`, `faltan`, second person,
   etc. in countdown copy; 002 allowed second person in `hero.*` only. *Recommended default:* new
   `share.*` namespace under the `countdown.*` bans (factual: "España: el ratio de dependencia
   alcanza 50 en 2042 — {days} días hasta el 1 de enero de 2042 (proyección).") — no `bomba`, no
   urgency phrasing, no exclamation.
6. **OQ-6 — "Hide, not freeze" scope.** 001 hides all sub-day fields under reduced motion
   (AC-001-112). *Recommended default:* keep exactly that; the brief's "hides the tick and does not
   freeze it" is read as AC-001-112 + "no stale value: the day count reflects the render instant".
7. **Q-D1 — `15-design.md` refresh.** Not a requirements question: D1/D2 were approved against the
   built app, so the design artifact is stale rather than undecided. *Direction:* amend the five
   `15-design.md` lines named in Gate decisions 2 (or re-run `spec-ux`) before the next spec builds
   on this band. Stage 2 is not blocked — the acceptance criteria carry the composition.
