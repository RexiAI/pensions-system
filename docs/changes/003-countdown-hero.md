# 003-countdown-hero

> Spec pipeline archive. Original source: `specs/003-countdown-hero/` (deleted by this script).
> Archived: 2026-11-01

## Original ask

# 003-countdown-hero — informal spec

Petición original (usuario, 2026-10-30):

> analiza este proyecto, el contexto del chat y haz los cambios necesarios para
> que el usuario llegue a su objetivo: vender esta página web al público con un
> reloj bomba de tic tac.

Decisiones ya tomadas con el usuario:

- Se construye **encima de la spec 002** (PR #9) una vez fusionada; no la sustituye.
- La "bomba" es una **mecha basada en datos**, no una ilustración de bomba.

## Objetivo

Que la página se comparta. Hoy el reloj existe pero es una barra lateral y la
página no tiene forma de propagarse. Medido en producción y en la rama de la
spec 002 (1440×900):

| Elemento | Hoy |
|---|---|
| `h1` | 64 px |
| Numeral de días | 32 px |
| Segundos que hacen "tic" | 15 px — tamaño de texto corrido |
| Botones para compartir | 0 |
| `<title>` | `pensiones · España` — no menciona 2042 ni la cuenta atrás |
| "sin calcular" en la página | 10 apariciones |

El reloj tiene que ser lo más fuerte de la página, y quien lo vea tiene que
poder mandarlo con un toque.

## Lo que quiero

1. **La cuenta atrás es el héroe.** Una banda de ancho completo. El numeral de
   días es el número más grande de la página — al menos tan grande como el `h1`.
   Los segundos se ven hacer tic a tamaño de pantalla, no a tamaño de nota al pie.
   Ancla y explicaciones de la spec 001/002 se mantienen: la fecha convencional
   (1 de enero de 2042), que el año del umbral es una proyección, y la frase de las
   dos referencias (16 años es aritmética de años; los días se cuentan hasta la
   fecha).

2. **La mecha.** Una mecha encendida cuya longitud consumida es un dato
   comprobable: el ratio de dependencia de vejez **observado** más reciente
   (65+ por cada 100 personas de 15 a 64, `demo_pjan`, hoy 31,22 para 2025)
   dividido entre el umbral de 50. Hoy: 31,22 / 50 = **62 % consumida**. La
   mecha lleva su fuente, su fórmula y su manifiesto como cualquier otra cifra,
   y se puede reproducir con un comando. Si el dato observado no está, no hay
   mecha — igual que no hay reloj sin umbral.

   Lo que la mecha NO puede hacer: no puede insinuar una fecha distinta de la del
   reloj, no puede usar el valor proyectado para el "ahora", y no puede llevar
   color de alarma (rojo). El calor sale de la paleta que ya existe.

3. **Compartir sin rastreo.** WhatsApp, X, Telegram, LinkedIn, copiar enlace y
   el menú nativo del móvil (Web Share API) cuando exista. Enlaces planos, sin
   scripts de terceros, sin píxeles: el pie de página promete "sin cookies, sin
   analítica de terceros, sin rastreo" y tiene que seguir siendo verdad. Los
   enlaces funcionan sin JavaScript. El texto compartido calcula los días en el
   momento del clic para no quedarse viejo; el enlace sin JS usa el año (2042).

4. **Una vista previa que se clique.** `<title>`, `og:title`, `og:description`
   y la tarjeta compartida giran alrededor de **2042**, el año — no del número de
   días, porque una tarjeta estática estaría mal mañana. En los cinco idiomas.

5. **Una sola línea para lo que falta.** Las cinco cifras sin calcular se
   agrupan en un único bloque "5 cifras en preparación" con su motivo, en lugar
   de diez apariciones de "sin calcular". Siguen siendo honestas y siguen
   enlazando a su método; simplemente dejan de dominar el recorrido.

## Lo que no puede romperse

- Cada cifra publicada con manifiesto, fuente, hash y comando de reproducción.
- El registro de tesis sigue sin color y sigue separado de lo calculado.
- Sin reloj donde no hay umbral; sin mecha donde no hay dato observado.
- Funciona sin JavaScript; `prefers-reduced-motion` oculta el tic, no lo congela.
- Prerender estático de las cinco rutas públicas, `lang` correcto por ruta,
  `hreflang`, `/admin` cerrado.
- El reloj sigue visible sin hacer scroll en 390×844 y 1366×768.

## Cómo sé que funciona

- Numeral de días ≥ tamaño del `h1`, segundos ≥ 32 px en escritorio.
- Reloj y mecha dentro del primer viewport a 390×844 y 1366×768.
- Cero peticiones de red a terceros al cargar la página y al pulsar compartir.
- `<title>` y `og:title` contienen 2042 en los cinco idiomas.
- "sin calcular" aparece como mucho una vez en la página pública.
- La mecha se reproduce con un comando y su porcentaje coincide con
  `demo_pjan` ÷ 50.

## Tasks

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

## Acceptance scenarios

## AC-003-01 — The band spans the full content width
## AC-003-02 — The day numeral is larger than the h1 on the numeral ladder
## AC-003-03 — The day numeral is the largest numeral on the page
## AC-003-04 — The seconds tick at display size on desktop
## AC-003-05 — Anchor and both disclosures are retained
## AC-003-06 — Clock and fuse inside the first viewport at every measured width; AC-001-107's demography clause retired (D2)
## AC-003-07 — Reduced motion hides the tick and does not freeze it
## AC-003-08 — No clock without a threshold year, band included
## AC-003-09 — Clock behaviour is unchanged by the band
## AC-003-10 — Fold measurements are re-measured, budgets are not relaxed
## AC-003-11 — The fuse reproduces the observed ratio over the threshold
## AC-003-12 — The latest observed year is taken, not the first
## AC-003-13 — The display rounding is pinned
## AC-003-14 — The threshold is the shared parameter, not a second literal
## AC-003-15 — Above the threshold the percentage is not capped
## AC-003-16 — The fuse carries a complete manifest and reproduces by command
## AC-003-17 — Changing the snapshot changes the hash
## AC-003-18 — No observed value, no fuse
## AC-003-19 — No threshold year, no fuse
## AC-003-20 — The projected value is never used for now
## AC-003-21 — The fuse implies no date and does not move with the clock
## AC-003-22 — The fuse carries no alarm hue and no new hue
## AC-003-23 — Share links exist in server HTML and work without JavaScript
## AC-003-24 — The no-JS share text leads with the derived year, no day count
## AC-003-25 — The share text computes days at click time from the approved template
## AC-003-26 — The shared URL is canonical and clean
## AC-003-27 — Native share appears only when available
## AC-003-28 — Copy link writes the canonical URL and confirms
## AC-003-29 — No third-party element in the markup
## AC-003-30 — Zero third-party requests during load
## AC-003-31 — Zero third-party requests when sharing
## AC-003-32 — The no-tracking promise stays true
## AC-003-33 — Share strings are localised and named; countdown bans stay outside share.*
## AC-003-34 — Title and og:title carry the year in every locale
## AC-003-35 — og:description and the share card carry the year
## AC-003-36 — The year is derived, never typed
## AC-003-37 — No day count in any static artefact
## AC-003-38 — No threshold year, no year in the preview
## AC-003-39 — One block holds every unavailable figure
## AC-003-40 — "sin calcular" appears at most once
## AC-003-41 — Unavailable figures still expose no reproduction
## AC-003-42 — The block tracks the data
## AC-003-43 — Computed figures and registers are unaffected
## AC-003-44 — Public routes stay static with correct language
## AC-003-45 — Admin stays fail-closed
## AC-003-46 — The thesis register stays uncoloured and separate
## AC-003-47 — The share.* rule set accepts the approved template and rejects alarm copy
## AC-003-48 — Band composition: hero copy, eyebrow, clock, fuse, share row (D1)
## AC-003-49 — The h1 is inside the first viewport at all three widths (D1)
## AC-003-50 — The share row's top is inside the first viewport at both desktop widths (D1)
## AC-003-51 — The fuse's provenance is inside the method disclosure, not inline under the fuse (D1)

## Verification

# 003-countdown-hero — Verification (stage 4)

Independent re-run of stages 2–3 against branch `spec/003-countdown-hero`. Nothing below is taken
from the Coder's or the Refactorer's self-report: every gate was executed again by this stage, and
every measurement is this stage's own.

## Revision 4 verification

**attempt 1, phase 1.**

- **Revision 4** (the build that carries Gate decisions 2 / D1 + D2).
- Budget context for the record: `SPEC_LOOP_COUNT=5`, `SPEC_PHASE1_RETRIES=0`,
  `SPEC_PHASE2_RETRIES=0`.
- Date: 2026-11-01. Environment: Node 24.21.0, Chromium 155 (`/usr/bin/google-chrome`),
  Next 16.4.3. Build: `npm run build` run by this stage in this session, exit 0, all five public
  routes prerendered (`○ /`, `● /en /fr /de /it`), `/admin*` dynamic; `.next/BUILD_ID` =
  `WycxWhb4LUbO4m0jKqVLj`.
- Working tree: dirty by design — stages 2–3's deliverable is uncommitted work; stage 5b (the PR
  Opener) is the stage that commits. Nothing was stashed, committed or reverted by this stage.

## Verdict

**PASS** for the spec's deliverable, with one out-of-scope gate FAIL recorded and not waived.

Stated plainly, because the distinction matters:

- Every gate that this stage can attribute to the spec's own source tree (`app/`, `web/`, `tests/`,
  `scripts/`, `middleware.ts`) is green: traceability 0, full suite 0, ESLint complexity 0, `tsc` 0,
  build 0, every content gate 0.
- `check-code-principles.sh --tier production` exits **1** with exactly **one** FAIL:
  `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`). That file is inside
  the `.standards/` git submodule — it is not part of this spec's deliverable, it is unchanged by
  this branch, no pipeline agent may edit it, and the same single FAIL has been recorded in
  `docs/changes/001-pension-math.md` and `docs/changes/002-hero-conversion.md` since 2026-10-29.
  The exit code is transcribed as-is below; the FAIL stands. It is not attributable to this spec,
  and the 001/002 precedent for this exact finding is "PASS for the spec's deliverable (with an
  out-of-scope FAIL noted)". A strict reading of "any FAIL stops the pipeline" would stop the
  pipeline on a submodule file no stage in this repo can fix; this stage records both readings
  rather than silently smoothing one away.

## Check table

| # | Check | Gate | Verdict | Detail |
|---|---|---|---|---|
| 1 | Scenario traceability | `scripts/check-scenario-traceability.sh --json` + `check-scenario-traceability-3digit.ts` | **PASS** | exit 0 / exit 0; 51/51 `AC-003-01`…`-51` traced, 0 fails; local wrapper: 206 scenarios all cited and resolving |
| 2 | Full test suite | `npx vitest run` | **PASS** | exit 0; **71 files / 895 tests passed, 0 failed, 0 skipped** (no skip lines in the run) |
| 2b | Type/build/content gates | `npx tsc --noEmit`, `npm run build` (runs `verify:derived`, `check:content-scope`, `check:public-vocabulary`, 3-digit traceability), `npm run sitemap:check` | **PASS** | all exit 0 (see §Supplementary gate runs) |
| 3 | Complexity gate | `npx eslint .` (`complexity: ['error', 6]`) | **PASS** | exit 0, no findings; `tsc --noEmit` exit 0 |
| 3.5 | Design-principles gate | `check-code-principles.sh --tier production --json` | **FAIL (1, out of scope)** | exit 1; exactly one FAIL, `.standards/` submodule; **0 FAILs in project source**; 42 WARNs (33 project, 9 submodule) — see caveat below |
| 4 | Scenario-to-behavior spot check | manual, then scoped re-run | **PASS** | `AC-003-15`, `AC-003-19`, `AC-003-26` read against their Given/When/Then; assertions match |
| 5 | No unaccounted behavior | diff skim (finding line, not a command) | **PASS with notes** | every changed file traces to T1–T5 or to an explicitly declared re-point; see §No unaccounted behavior |

## Browser measurements (this stage's own CDP harness, built app, `next start`)

Five locales × three viewports, `getComputedStyle` / `getBoundingClientRect` against the real
build. Every number below is from this stage's run, not from the repo's test file.

| Locale | Viewport | day numeral | `h1` | seconds | `16 años` | max numeral on page | `h1` top | share top | clock fields | fuse | overflow-x |
|---|---|---|---|---|---|---|---|---|---|---|---|
| es | 1440×900 | **80px** | 64px | **32px** | 32px | **80px** | 104 | 687.92 | 339.39–508.48 | 516.48–604.88 | none |
| es | 1366×768 | **80px** | 64px | **32px** | 32px | **80px** | 104 | 687.92 | 339.39–508.48 | 516.48–604.88 | none |
| es | 390×844 | **44px** | 40px | 32px | 32px | **44px** | 68 | 862.36 (not asserted) | 480.91–613.28 | 621.28–779.31 | none |
| en | 1440×900 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| en | 1366×768 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| en | 390×844 | 44px | 40px | 32px | 32px | 44px | 68 | 841.31 (not asserted) | 459.86–592.23 | 600.23–758.27 | none |
| fr | 1440×900 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| fr | 1366×768 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| fr | 390×844 | 44px | 40px | 32px | 32px | 44px | 68 | 862.36 (not asserted) | 480.91–613.28 | 621.28–779.31 | none |
| de | 1440×900 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| de | 1366×768 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| de | 390×844 | 44px | 40px | 32px | 32px | 44px | 68 | 838.06 (not asserted) | 480.91–613.28 | 621.28–755.02 | none |
| it | 1440×900 | 80px | 64px | 32px | 32px | 80px | 104 | 687.92 | 339.39–508.48 | 516.48–604.88 | none |
| it | 1366×768 | 80px | 64px | 32px | 32px | 80px | 104 | 687.92 | 339.39–508.48 | 516.48–604.88 | none |
| it | 390×844 | 44px | 40px | 32px | 32px | 44px | 68 | 862.36 (not asserted) | 480.91–613.28 | 621.28–779.31 | none |

Read against the criteria:

- **Day numeral is the largest numeral on the page** — `maxNumeralPx` (the largest computed
  `font-size` of any element whose own text nodes carry a digit) equals the day numeral at every
  locale and viewport: 80px desktop, 44px at 390. It is **strictly** larger than the `h1` (64px /
  40px) everywhere. `--text-display` still resolves to `clamp(2.5rem, 4.9vw, 4rem)`.
- **Seconds ≥ 32px on desktop** — 32px exactly at 1366×768 and 1440×900, in all five locales.
- **`h1` top inside the viewport** — 104 < 900, 104 < 768, 68 < 844. Its computed size is 64/64/40,
  i.e. `--text-display`'s resolved value: the move into the band relocated the element without
  restyling it.
- **Share row top inside the viewport at the two desktop widths** — 687.92 (es/it) and 753.19
  (en/fr/de) against 768. At 1366×768 the row's *bottom* is ~797, i.e. below the fold — which is
  exactly why AC-003-50 is a top-edge assertion, and the spec says so. At 390 it measures 838–862
  and is not asserted, as specified.
- **Clock and fuse wholly inside the viewport at all three widths** — clock fields bottom ≤ 613.28,
  fuse bottom ≤ 779.31 against 844; both wholly inside at 1366 and 1440 as well.
- **No horizontal overflow** — `documentElement.scrollWidth` 1425/1440, 1351/1366, 375/390 at every
  locale: no scrollbar-less overflow anywhere.
- **No layout shift while the seconds tick** — measured a field's box across a real tick (seconds
  text 57→56, 55→54, 53→52 at the three viewports): day box, seconds box, fuse box and share box
  were byte-identical before/after, and the fuse's `outerHTML` did not change.
- **Band composition in paint order** (es, 1440×900): `h1` 104 → eyebrow 267.6 → `16 años` numeral
  295 → day numeral 339.4 → fuse 516.5 → share 687.9 → clock anchor 938.2 → clock definition 982.5
  → clock arithmetic 1047.1 → hero figure 1265.4 → figure strip 3418.1. The eyebrow sits between
  the `h1` and the day numeral; nothing renders text between the fuse group's bottom (679.9) and
  the share row's top (687.9) — an independent scan for text-bearing elements wholly inside that
  gap returned `[]`. The `h1` is inside the band and it is the page's only `h1`; the hero's figure
  panel is **not** in the band.

## Fuse (T2), measured and re-derived

- Committed derived value: `{"consumedPercent":62.44,"observedRatio":31.22,"observedYear":2025,"threshold":50}`,
  `availability: computed`. Label renders `Mecha: 62 % consumida — ratio de dependencia observado
  31,22 (2025) ÷ umbral 50`.
- Drawn geometry (server-computed attributes, `viewBox="0 0 1000 6"`): cord `x=0 width=375.6 h=1`,
  burnt `x=375.6 width=624.4 h=6`. 624.4/1000 = **62.44 %** — the stored fraction, drawn; the label
  prints the integer half-up form. Half-up (`62.5 → 63`) and the unclamped case (`110 %`) are
  covered by `AC-003-13`/`AC-003-15`.
- **Reproduces from the committed snapshot by its own published command.**
  `npx tsx scripts/compute.ts --series fuse --offline` exit 0, printing
  `349e3be6838779a11ff031592d4658069684a39ed9d006000715a40c6f794425` (the committed
  `inputHash`) and `"consumedPercent":62.44`.
- **Never reads the projected series.** `web/series/fuse.ts` imports only `readAgeCounts` /
  `observedDependency` / `COUNTDOWN_THRESHOLD`; `FUSE_SERIES.requirementSources` is
  `[DEMO_PJAN_SOURCE]` only; the compute path reads `payloadOf(inputs, DEMO_PJAN_SOURCE)`. The
  `proj_23np` 2025 back-cast 31.91 appears once on the page, in the countdown's own back-cast
  sentence, and the test that alters both projection snapshots leaves the fuse value and hash
  unchanged (`AC-003-20`).
- **Disappears entirely with no observed value.** Rendering the band with no fuse series, with
  `availability: unavailable`, and with `value: null` produces no `fuse` substring at all (no line,
  label, definition, disclosure or reproduce link); no threshold year produces no band countdown at
  all. Confirmed by render, not by reading the conditional.
- **Provenance inside the method disclosure.** Closed `<details>` in the band, summary
  `Cómo se calcula` (the existing `figure.methodLink` key), 4 provenance fields, the 64-hex digest
  and the reproduce path inside it; `open` absent; closed details' height is the summary alone (44px,
  `scrollHeight == clientHeight`), `elementFromPoint` over the hidden body returns `null`, and the
  collapsed body contributes nothing to `innerText` — i.e. no manifest value is visible above the
  share row. Expanding it reveals the fields, the hash and `scripts/compute.ts` +
  `data/derived/series/fuse.json`.

## Share (T3), no-JS / JS / network / new tab

- **No-JS (server HTML, fetched raw, per locale).** Exactly four plain anchors — `wa.me`, `t.me/
  share/url`, `x.com/intent/post`, `linkedin.com/sharing/share-offsite/` — each
  `target="_blank" rel="noopener noreferrer"`. No `<button>` in the server HTML; the copy-link
  affordance is `<input class="share__url" readOnly>` with its `share.linkLabel` label, i.e. the
  canonical URL as selectable text. The no-JS text begins with the derived year (`2042`) and
  contains the Eurostat-projection clause and the canonical URL, and contains neither `Faltan` nor
  a day count. URL shape: `searchParams.url` (or the trailing token of `text`) is exactly
  `canonicalUrl(route)`; no `utm_*`, `fbclid`, `gclid`, `ref=`, `source=` anywhere in the page.
- **With JS, the day count is the clock's value at click time.** Clicking the WhatsApp anchor
  rewritten at click time produced `text=Faltan 5539 días para el 1 de enero de 2042 …` — the same
  day count the clock was showing at that instant, from the same anchor; the server-rendered `href`
  (year-led, no days) was the value before the click. Telegram drops the trailing URL into its own
  `url` param; LinkedIn sends only the URL.
- **Copy link gives feedback.** With the clipboard granted: button text `Copiar enlace → Enlace
  copiado` (es) / `Copy link → Link copied` (en), a `role="status"` sibling carrying the same
  locale string, clipboard content exactly the canonical URL of the route, and the label reverting
  after ~2 s. Without the Clipboard API the `<input>` is revealed and focused instead
  (`state === 'fallback'`).
- **Native share.** `navigator.share` undefined → no native button in the DOM (1 button = copy
  link). With `navigator.share` stubbed → 2 buttons, the first labelled `Compartir…`, and its
  payload is `{ text: "Faltan 5539 días …", url: canonicalUrl('/') }` — the same text and URL as
  the links.
- **Zero third-party origins, all five locales.** Load: 10 requests, all same-origin. Idle 3 s: 0
  new requests. Every share action (native + copy + all four network links): 0 new requests from
  the page's own context, 0 third-party requests overall, and `Network.getCookies` → 0 cookies.
  No `preconnect` / `dns-prefetch` / `prefetch` hints in any page.
- **The new tab a share link opens — observed here.** Clicking a network link for real creates a
  new page target whose URL is
  `https://api.whatsapp.com/send/?text=Faltan+5539+d%C3%ADas+…&app_absent=0` — the navigation is
  attempted, in a new browsing context, carrying the click-time text. This is the observation the
  Coder reported it could not make; it is confirmed. What this stage still cannot verify from a
  sandboxed headless browser: that a signed-in user's network session completes the share (that is
  the network's own behaviour, outside the page), and that Chromium's own `noopener` isolation
  behaves as expected across every network (only `rel="noopener noreferrer"`'s presence is
  verifiable).

## Copy rules (T3 / OQ-5)

- The `es` `share.text` value is **byte-identical** to the approved template in `10-tasks.md`
  §OQ-5 (`Faltan {days} días para el 1 de enero de {year}: … Compruébalo: {url}`) — compared
  programmatically, `True`.
- `share.*` rule set accepts all five locales' `share.text` and `share.textNoJs` (0 problems each).
- It rejects, in all five locales, the depletion verb, the bomb word, `!` and the urgency list —
  exercised with each locale's own vocabulary:
  `es` quedan / bomba / `!` / urgente, inminente, alarmante, catastrófico, desastroso;
  `en` " left" / remain / bomb / `!` / urgent, imminent, alarming, catastrophic, disastrous;
  `fr` il reste, restent / bombe / `!` / urgent, imminent, alarmant, catastrophique, désastreux;
  `de` bleiben / Bombe / `!` / dringend, alarmierend, katastrophal, verheerend;
  `it` restano, rimangono / bomba / `!` / urgente, imminente, allarmante, catastrofico, disastroso.
  Every sample returned a non-empty problem list; every shipped template returned empty.
- `countdown.*` bans stay outside `share.*`: no `countdown.*` string contains `faltan`,
  `compruébalo`, `quedan`, `cuenta atrás`, `bomba`, `explota` or `!`.

## Title / preview (T4)

| Locale | `<title>` / `og:title` | `og:description` | `og:image:alt` |
|---|---|---|---|
| es | `2042: España llega a 50 mayores de 65 por cada 100 en edad de trabajar · pensiones · España` | contains 2042 | `pensiones — 2042: España llega …` |
| en | `2042: Spain reaches 50 people aged 65 and over per 100 of working age · pensiones · Spain` | contains 2042 | distinct |
| fr | `2042 : l'Espagne atteint 50 … · pensiones · Espagne` | contains 2042 | distinct |
| de | `2042: Spanien erreicht 50 Menschen ab 65 je 100 im Erwerbsalter · pensiones · Spanien` | contains 2042 | distinct |
| it | `2042: la Spagna arriva a 50 persone over 65 ogni 100 in età lavorativa · pensiones · Spagna` | contains 2042 | distinct |

- Year is derived (`committedThresholdYear()` → `pageMetadata(locale, year)`), and **no hand-typed
  `2042` exists in any locale file, component, `app/`, `scripts/` or generated source** — a
  `grep -rn 2042` over `web/ app/ scripts/ middleware.ts` returns no files.
- No static artefact carries a day count: `<title>`, `meta description`, every `og:*` tag,
  `og:image:alt`, `sitemap.xml` (5 routes × 6 alternates) and `manifest.webmanifest` contain no
  day/hour/minute/second value and not the anchor's full date. `twitter:*` is not emitted at all.
- **Limit stated honestly:** the share card's *component* text was verified (it contains the year,
  and its year-free form contains no digit at all); the rendered **PNG pixels** were not OCR'd —
  the image route is generated at build and this stage verified its strings, not its rasterised
  pixels.

## "En preparación" (T5)

- Exactly **one** `class="pending"` block on the `es` page, heading `5 cifras en preparación` +
  the chip; the count comes from the data (5 figures with `availability !== 'computed'`:
  fig-03…fig-07).
- `sin calcular` appears **exactly once** in the rendered `es` text (the chip in the block heading).
- Every row keeps its name, its published definition, its reason and its `Cómo se calcula` method
  link — 5 method links for 5 rows. No `<svg>`, no `<table>`, no `<code>`, no 64-hex digest, no
  `npx tsx` command inside the block; no substitute value.
- Zero unavailable figures → no block; one → singular heading. Registers still match the rendered
  counts; no thesis vocabulary in the block.

## Invariants

- **Static prerender** of all five public routes (build output: `○ /`, `● /en /fr /de /it`), each
  document's `<html lang>` equal to its route locale (`es/en/fr/de/it`, checked over HTTP, status
  200).
- **`hreflang`**: six `<link rel="alternate">` entries per route (5 locales + `x-default`) with
  absolute canonical hrefs. Note for future audits: Next 16 emits the attribute as `hrefLang`
  (camel-cased) in the HTML stream — an ASCII case-insensitive match for `hreflang`, so browsers
  and crawlers are unaffected, but a case-sensitive grep for `hreflang=` will miss it.
- **`/admin` fail-closed**: `GET /admin` → **503**, `GET /admin/login` → **503**
  (`text/plain`), with the admin credential unconfigured, while the public routes serve 200
  unchanged.
- **Reduced motion**: with `prefers-reduced-motion: reduce` the three sub-day fields resolve
  `display: none` (all three), no interval is created (the day count was byte-identical across
  2.5 s), and the day count shown (5539) equals the count computed for the render instant — "hide,
  not freeze".
- **Thesis register**: still its own section after the debate and outside the band; the new CSS
  section references neither thesis content nor `--data-deficit`/`--data-projection`; the band and
  pending regions contain no thesis text.
- **No cookies**: `Network.getCookies` → 0 for every locale; no `Set-Cookie` on `/`.

## Adjudications (deviations handed to this stage)

### 1. `display: contents` on `.clock` inside the band — does it break T1 in substance?

**No — T1's substance survives; the consequence is visual-order-only reflow, and it is a real
trade-off worth recording, not a violation.**

What T1 (and `20-acceptance/`) actually require of the clock subtree:

| Requirement | Holds? | How this stage checked |
|---|---|---|
| the three clock disclosures "travel inside the clock subtree" | **yes** | `.clock.contains(el)` is `true` for `.clock__anchor`, `.clock__definition`, `.clock__arithmetic` — `display: contents` does not move nodes in the DOM tree |
| accessible tree unchanged (AC-001-113), `role="group"` with its label present | **yes** | `Accessibility.getFullAXTree` returns `group` / `"Cuenta hasta el 1 de enero de 2042, fecha convencional del umbral."` — the labelled group node survives `display: contents`, exactly as the Coder claimed |
| the disclosures visible, outside any `<details>`/`title`/tooltip (AC-003-05) | **yes** | all three have client rects, `inDetails: false`, `.clock__arithmetic` computed `display: block` |
| no `<svg>`, no `aria-live` inside the clock subtree (AC-001-99/116) | **yes** | neither string appears in the clock block of the prerendered HTML |
| the fuse is a sibling of the clock, never inside it (AC-003-22) | **yes** | `clock.contains(fuseGroup) === false` |
| nothing renders text between the fuse's bottom and the share row's top (AC-003-48) | **yes** | scan returned `[]`; gap is 679.9 → 687.9 |
| countdown prose never between fuse and share — may sit after the share row (T1) | **yes** | prose `order: 7`, clock disclosures `order: 8`, share `order: 6`; measured tops 938/982/1047 are after share 687.9 |
| keyboard order unaffected | **yes** | 0 focusable elements (`a`/`button`/`input`) inside the clock subtree in the prerendered HTML — nothing was reordered out from under the tab sequence |

What it does cost, stated rather than hidden: DOM order no longer equals paint order inside the
band. A screen reader's linear traversal and a select-all copy follow DOM order (identity →
countdown prose → clock fields → clock disclosures → fuse → share), while the visual order is
identity → eyebrow → numerals → fields → fuse → share → disclosures. No acceptance criterion
asserts DOM order equals visual order — T1 says the composition is the **rendered top-edge order**,
which is satisfied — and this is the mechanism that bought both the fold targets and AC-003-48's
"nothing between fuse and share" clause without splitting the clock's component contract. Recorded
as a review note for the Architect, not as a failure.

### 2. `15-design.md` was stale when the build ran

**Resolved during this verification, and now consistent with the build.** The file was refreshed
while this stage was working (`15-design.md` mtime moved from 12:38 to 13:13 to 13:16 during the
session) and now carries a `## Revision 4 (post-measurement)` section. Checked line by line against
the build:

- §"OQ-2 recommendation" now says "`h1` … leads the band (D1, Revision 4)" — no longer "h1 placed
  after the band".
- T1 §Layout now states rendered order 1→8 (lead, eyebrow, years numeral, field row, fuse group,
  share row, countdown prose, clock disclosures) with `display: contents` named as the mechanism —
  which is exactly the order and mechanism this stage measured.
- T1 per-breakpoint no longer predicts "h1 at ~520px"; it records the measured `h1` top **y 104**
  and share top **y 688**, the same numbers this stage measured independently.
- T2 §Layout no longer puts the provenance strip under the fuse; it says "the provenance is
  deliberately **not** visible here".
- T3 §Layout now places the share row "directly under the fuse", before the countdown's prose.
- The token table's `--band-pad-block` (`--space-6` / `--space-4`) and `--clock-sub-col` (`3rem`)
  match `web/styles/tokens.css`.

So: no contradiction remains, and nothing was recorded as a failure. **Finding-level note for the
Architect:** the design artifact trailed the build for the whole of stages 2–3, and a reader of
`15-design.md` between the gate decisions and this refresh would have been reading the superseded
composition. Q-D1 in `10-tasks.md` asked for the refresh before the *next* spec builds on this
band, not as a stage-2 precondition; it is now done.

### 3. The share-network new-tab observation the Coder could not make

**Verified here** (see §Share): the click creates a new page target navigated to the network's
share URL, carrying the click-time text. What remains unverifiable from this environment is only
the network's own post-redirect behaviour. Nothing in the pipeline was blocked on this.

## Findings

1. **`check-code-principles.sh` FAIL, out of scope** — one FAIL,
   `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`), inside the
   `.standards/` submodule. Pre-existing (recorded in the 001 and 002 archives), unowned by this
   repo's pipeline, uneditable by any pipeline agent. Zero FAILs land in project source.
2. **`check-code-principles.sh` SIGPIPE with `.next` present** — running the same gate without
   moving `.next` aside exits **141** (`sort … | head -10` under `set -o pipefail`, the DRY
   sub-pipeline; the huge compiled-chunk window set closes `head` early). That is the tool's
   known defect, documented in `docs/changes/002-hero-conversion.md`, not a code finding — and
   with `.next` present the run also reports FAILs against compiled Turbopack runtime chunks
   (`.next/server/chunks/…`, CC up to 15), which are build output, not source. Both are why this
   stage moved `.next` aside for the gate run, as the stage brief directed.
3. **Design-principles WARNs (42: 33 in project source, 9 in the submodule).** Review hints, not
   stops; recorded verbatim in the evidence block and flagged to the Architect. The two that touch
   this spec's own code: `web/components/share/ShareRow.tsx:62` (body 24 lines) and
   `web/seo/share-card.tsx:41` (body 23 lines). Everything else is pre-existing
   (`Hero.tsx`, `SiteHeader.tsx`, `PyramidPlate.tsx`, admin pages, `ProvenanceStrip.tsx`, …).
4. **`ProvenanceStrip.tsx` carries a DRY WARN** ("5× identical 4-line block at line 56") — a hint
   about the strip's repeated row markup, unchanged in kind by this spec (the strip gained a
   `collapsed` form). Not a stop; noted for the Architect.
5. **`AC-003-30`/`AC-003-31` are asserted structurally in `share.test.ts`** (source scanning for
   `fetch(`/`sendBeacon`/`window.open`/`preventDefault`) rather than by network recording; the
   behavioural evidence for those two scenarios lives in `countdown-band-browser.test.ts`, which
   builds a real request log. That split is defensible, but the browser file is
   `describe.skipIf(!BUILD_PRESENT || !CHROME_PATH)` — on a checkout with no `.next` and no
   Chromium, ~13 of the spec's Chromium-only assertions would skip silently. In this run the build
   and Chromium were both present and **0 tests skipped** (895 passed, no skip lines), and this
   stage re-measured all of them independently; flagged so the Architect knows where the
   environment dependency is.
6. **`hrefLang` attribute casing** (see §Invariants) — cosmetic, worth knowing for grep-based
   audits.
7. **Share card PNG pixels not OCR'd** (see §Title/preview) — strings verified, raster not.

## No unaccounted behavior

Skim of the 30-file diff against `10-tasks.md` / `20-acceptance/`:

- **New source all traces to a task**: `CountdownBand.tsx` (T1/D1 composition, lead slot),
  `Fuse.tsx` + `web/series/fuse.ts` + `web/ingest/series.ts` (+`FUSE_SERIES`) + `series-types.ts`
  (T2), `web/share/links.ts` + `share/ShareRow.tsx` + `CopyLink.tsx` + `ShareIcon.tsx` +
  `web/content/share-copy.ts` (T3), `web/seo/threshold-year.ts` + `share-card.tsx` + `metadata.ts`
  (T4), `PendingBlock.tsx` + `FigureStatusRow.tsx` `nested` prop (T5), `HeroLead.tsx` /
  `HeroLeadBlock.tsx` (T1/D1 lead extraction), `ProvenanceStrip.tsx` `collapsed` form (T2/D1),
  `format.ts` `formatWholePercent` (T2 OQ-3), `keys.ts`/`registry.ts`/locale JSONs (the 22 new
  keys T3/T4/T5 need), `scripts/compute.ts` + `reproduce-command.ts` (T2's published reproduce
  command), `globals.css`/`tokens.css` (T1–T3 tokens and rules).
- **Existing tests edited — each edit is one `10-tasks.md` explicitly declares, and no assertion
  was weakened**:
  - `first-viewport.test.ts` — re-measured per AC-003-10; the 50px clearance margin, the viewport
    set and the whole-box vs top-edge split are all intact, and the file gained a test asserting
    the retired demography clause cannot come back (`AC-001-107` / D2).
  - `scope-mark.test.ts` — AC-001-102 re-pointed to "no digits other than the derived year"
    (T4's declared amendment), keeping the scope-suffix-last assertion as a new check.
  - `design-revision.test.ts` — D7 re-pointed; the year-free card still has to carry **no digit at
    all**, which is the original assertion kept on the form it still applies to.
  - `hero-copy.test.ts` — key count 248→270 (22 new keys × 5 locales), parity still enforced;
    `reproduce.test.ts` — series count 2→3 (T2's third series); `series-coverage-gaps.test.ts` —
    closed series-id set gains `fuse`; `content-locale.test.ts` — the "no `slice` on the headline"
    scan now follows the `<h1>` to `HeroLead.tsx` (D1).
- **Nothing found that traces to no task.** No new dependency, no new token colour, no new
  network surface, no new secret, no new `--data-*` hue.

## Post-PR CI check (phase 2)

Not run. No PR exists yet — stage 5b (PR Opener) owns creating it, and this stage was invoked for
the pre-PR verification only. Phase 2 remains unconsumed (`SPEC_PHASE2_RETRIES=0`).

## Supplementary gate runs (not one of the five contract checks)

| Command | Exit | Output |
|---|---|---|
| `npm run build` | 0 | prebuild gates green; all five public routes prerendered; `/admin*` dynamic |
| `npm run verify:derived` | 0 | `derived figures verified: 7 (2 computed, 5 unavailable)` / `derived series verified: 3` |
| `npm run check:content-scope` | 0 | `country scope gate: clean (5 locales)` |
| `npm run check:public-vocabulary` | 0 | `public vocabulary gate: clean (5 locales)` |
| `npm run sitemap:check` | 0 | `5 routes, 6 alternates each`; emitted sitemap/robots agree |
| `npm run check:client-secrets` | 0 | `no admin secret configured in this environment; .next/static not grepped` |
| `npx tsx scripts/check-scenario-traceability-3digit.ts` | 0 | `206 scenarios, all cited, all citations resolve` |
| `check-audit-trail.sh 003-countdown-hero` | **1** | 3 PASS + `FAIL … missing 25-verification.md (AC-015-11)` + `FAIL … missing 30-report.md (AC-015-12)` — both correct at this instant: this file is the one this stage just wrote (so the first FAIL is stale by construction and re-runs clean), and `30-report.md` belongs to stage 5a, which has not run yet. Re-run by the PR Opener per AC-015-15. |

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh --json  &&  npx tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-11-01T12:22:31Z

Both gate scripts, run from the repo root: the upstream two-digit matcher and the repo-local
three-digit wrapper `10-tasks.md` requires ("run both", §Traceability note).

start: 2026-11-01T12:22:30Z
{
  "checks": [1, 2],
  "passes": ["AC-003-01 — traced to a test", "AC-003-02 — traced to a test", "AC-003-03 — traced to a test", "AC-003-04 — traced to a test", "AC-003-05 — traced to a test", "AC-003-06 — traced to a test", "AC-003-07 — traced to a test", "AC-003-08 — traced to a test", "AC-003-09 — traced to a test", "AC-003-10 — traced to a test", "AC-003-11 — traced to a test", "AC-003-12 — traced to a test", "AC-003-13 — traced to a test", "AC-003-14 — traced to a test", "AC-003-15 — traced to a test", "AC-003-16 — traced to a test", "AC-003-17 — traced to a test", "AC-003-18 — traced to a test", "AC-003-19 — traced to a test", "AC-003-20 — traced to a test", "AC-003-21 — traced to a test", "AC-003-22 — traced to a test", "AC-003-23 — traced to a test", "AC-003-24 — traced to a test", "AC-003-25 — traced to a test", "AC-003-26 — traced to a test", "AC-003-27 — traced to a test", "AC-003-28 — traced to a test", "AC-003-29 — traced to a test", "AC-003-30 — traced to a test", "AC-003-31 — traced to a test", "AC-003-32 — traced to a test", "AC-003-33 — traced to a test", "AC-003-34 — traced to a test", "AC-003-35 — traced to a test", "AC-003-36 — traced to a test", "AC-003-37 — traced to a test", "AC-003-38 — traced to a test", "AC-003-39 — traced to a test", "AC-003-40 — traced to a test", "AC-003-41 — traced to a test", "AC-003-42 — traced to a test", "AC-003-43 — traced to a test", "AC-003-44 — traced to a test", "AC-003-45 — traced to a test", "AC-003-46 — traced to a test", "AC-003-47 — traced to a test", "AC-003-48 — traced to a test", "AC-003-49 — traced to a test", "AC-003-50 — traced to a test", "AC-003-51 — traced to a test"],
  "fails": []
}
EXIT_UPSTREAM:0
scenario traceability (2-3 digit ids): 206 scenarios, all cited, all citations resolve
EXIT_LOCAL:0
end: 2026-11-01T12:22:31Z

## Evidence: full test suite

command: npx vitest run
exit: 0
at: 2026-11-01T12:21:17Z

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  71 passed (71)
      Tests  895 passed (895)
   Start at  13:21:17
   Duration  55.18s (tests 77%, import 19%, transform 4%, worker 1%)

No `skipped` line: every collected test ran. The Coder's "895 tests / 71 files" claim is reproduced
exactly. A second, independent run earlier in this session (12:12:05Z) produced the same
71/895 with `EXIT:0`.

## Evidence: complexity gate

command: npx eslint . ; grep -n "complexity" eslint.config.mjs ; npx tsc --noEmit
exit: 0
at: 2026-11-01T12:22:43Z

The real linter for this stack: ESLint carries the cyclomatic-complexity budget as an error, so a
function above 6 decision points fails the run rather than warning.

at: 2026-11-01T12:22:43Z
EXIT_ESLINT:0
17:      complexity: ['error', 6],
EXIT_TSC:0
at_end: 2026-11-01T12:22:48Z

`EXIT_ESLINT:0` with empty stdout = no findings at all, complexity included. `EXIT_TSC:0` = the
type gate is clean over the changed files as well.

## Evidence: design-principles gate

command: .standards/scripts/check-code-principles.sh --tier production --json   (with `.next` moved aside)
exit: 1
at: 2026-11-01T12:20:57Z

Exit **1** = findings. Transcript below is the script's own JSON, unedited. `tier` is forced to
`production` because this repo's declared tier is production while the script's auto-detection
looks for `AGENTS_*.md` and this repo uses `AGENTS.md`; the six gates are the full set.

{
  "tier": "production",
  "gates": ["complexity", "dry", "yagni", "solid", "component-per-file", "property-tests"],
  "fails": [{ "message": "Cyclomatic complexity >6 (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10", "file": "./.standards/skills/hallmark/site/examples/cobalt-01/script.js", "line": "7" }],
  "warns": [{ "message": "Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:45:71:main:KISS_LINES=28", "file": "./.standards/ci/templates/go-saga-lint.go", "line": "45" }, { "message": "Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:101:124:checkCompensationPairs:KISS_LINES=25", "file": "./.standards/ci/templates/go-saga-lint.go", "line": "101" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:48:67:ActionForms:KISS_LINES=21", "file": "./app/(admin)/admin/(authed)/proposals/[id]/page.tsx", "line": "48" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:69:91:ProposalPage:KISS_LINES=23", "file": "./app/(admin)/admin/(authed)/proposals/[id]/page.tsx", "line": "69" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:35:67:ReviewTable:KISS_LINES=26", "file": "./app/(admin)/admin/(authed)/revisions/[id]/page.tsx", "line": "35" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx:7:34:RefreshPage:KISS_LINES=28", "file": "./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx", "line": "7" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:57:82:PendingTable:KISS_LINES=24", "file": "./app/(admin)/admin/(authed)/page.tsx", "line": "57" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:84:123:PanelHome:KISS_LINES=39", "file": "./app/(admin)/admin/(authed)/page.tsx", "line": "84" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/login/page.tsx:5:30:LoginPage:KISS_LINES=26", "file": "./app/(admin)/admin/login/page.tsx", "line": "5" }, { "message": "Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::KISS_LINES=41", "file": "./.standards/skills/hallmark/site/examples/cobalt-01/script.js", "line": "7" }, { "message": "Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:93:225::KISS_LINES=43", "file": "./.standards/skills/hallmark/site/examples/cobalt-01/script.js", "line": "93" }, { "message": "Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23", "file": "./web/seo/share-card.tsx", "line": "41" }, { "message": "Method body >20 lines (node): ./web/components/DataTable.tsx:32:57:DataTable:KISS_LINES=27", "file": "./web/components/DataTable.tsx", "line": "32" }, { "message": "Method body >20 lines (node): ./web/components/series/PyramidPlate.tsx:72:106:Panel:KISS_LINES=35", "file": "./web/components/series/PyramidPlate.tsx", "line": "72" }, { "message": "Method body >20 lines (node): ./web/components/series/PyramidPlate.tsx:181:229:PyramidPlate:KISS_LINES=47", "file": "./web/components/series/PyramidPlate.tsx", "line": "181" }, { "message": "Method body >20 lines (node): ./web/components/CitationChip.tsx:12:38:CitationChip:KISS_LINES=28", "file": "./web/components/CitationChip.tsx", "line": "12" }, { "message": "Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21", "file": "./web/components/metrics/PlateBody.tsx", "line": "9" }, { "message": "Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:41:62:ChartWithTable:KISS_LINES=23", "file": "./web/components/metrics/PlateBody.tsx", "line": "41" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:28:62:SiteFooter:KISS_LINES=36", "file": "./web/components/public/SiteFooter.tsx", "line": "28" }, { "message": "Method body >20 lines (node): ./web/components/public/ScopeMark.tsx:27:52:ScopeMark:KISS_LINES=24", "file": "./web/components/public/ScopeMark.tsx", "line": "27" }, { "message": "Method body >20 lines (node): ./web/components/public/Hero.tsx:256:280:Hero:KISS_LINES=26", "file": "./web/components/public/Hero.tsx", "line": "256" }, { "message": "Method body >20 lines (node): ./web/components/public/ReproduceBlock.tsx:53:100:ReproduceBlock:KISS_LINES=48", "file": "./web/components/public/ReproduceBlock.tsx", "line": "53" }, { "message": "Method body >20 lines (node): ./web/components/public/AssumptionsLedger.tsx:43:83:AssumptionsLedger:KISS_LINES=41", "file": "./web/components/public/AssumptionsLedger.tsx", "line": "43" }, { "message": "Method body >20 lines (node): ./web/components/public/ThemeGroup.tsx:13:36:ThemeGroup:KISS_LINES=21", "file": "./web/components/public/ThemeGroup.tsx", "line": "13" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:62:101:IndexPanel:KISS_LINES=41", "file": "./web/components/public/SiteHeader.tsx", "line": "62" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:108:134:SiteHeader:KISS_LINES=28", "file": "./web/components/public/SiteHeader.tsx", "line": "108" }, { "message": "Method body >20 lines (node): ./web/components/registers/DisputeSection.tsx:17:42:DisputeSection:KISS_LINES=25", "file": "./web/components/registers/DisputeSection.tsx", "line": "17" }, { "message": "Method body >20 lines (node): ./web/components/registers/ThesisSection.tsx:19:43:ThesisSection:KISS_LINES=22", "file": "./web/components/registers/ThesisSection.tsx", "line": "19" }, { "message": "Method body >20 lines (node): ./web/components/share/ShareRow.tsx:62:88:ShareRow:KISS_LINES=24", "file": "./web/components/share/ShareRow.tsx", "line": "62" }, { "message": "Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:36:64:FigureStatusRow:KISS_LINES=27", "file": "./web/components/FigureStatusRow.tsx", "line": "36" }, { "message": "Possible duplication (5x identical 4-line block, first at ./web/components/ProvenanceStrip.tsx:56): </li> /))} /</ul> /</a>", "file": "./web/components/ProvenanceStrip.tsx", "line": "56" }, { "message": "Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:115): type: \"problem\", /docs: { /description: /meta: {", "file": "./.standards/ci/templates/eslint-saga-rules/saga-compensation.js", "line": "115" }, { "message": "Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:132): schema: [], /}, /create(context) { /},", "file": "./.standards/ci/templates/eslint-saga-rules/saga-compensation.js", "line": "132" }, { "message": "Possible duplication (3x identical 4-line block, first at ./web/components/public/Hero.tsx:150): primary={actions.primary} /secondary={actions.secondary} //> /countries={countries}", "file": "./web/components/public/Hero.tsx", "line": "150" }, { "message": "Possible duplication (3x identical 4-line block, first at ./web/components/public/Hero.tsx:149): countries={countries} /primary={actions.primary} /secondary={actions.secondary} /content={content}", "file": "./web/components/public/Hero.tsx", "line": "149" }, { "message": "Possible duplication (3x identical 4-line block, first at ./web/components/public/Hero.tsx:148): content={content} /countries={countries} /primary={actions.primary} /<HeroLead", "file": "./web/components/public/Hero.tsx", "line": "148" }, { "message": "Possible duplication (3x identical 4-line block, first at ./web/components/metrics/views.ts:153): ...headValue, /summary: summaryOf(input.content, value.points.length), /readout: [ /return {", "file": "./web/components/metrics/views.ts", "line": "153" }, { "message": "Possible duplication (2x identical 4-line block, first at ./web/ingest/run-compute.ts:96): }, /}; /return { kind: 'ok', snapshot }; /detail: freshness.reason ?? 'outside freshness window',", "file": "./web/ingest/run-compute.ts", "line": "96" }, { "message": "Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:133): }, /create(context) { /return { /schema: [],", "file": "./.standards/ci/templates/eslint-saga-rules/saga-compensation.js", "line": "133" }, { "message": "Possible duplication (2x identical 4-line block, first at ./web/components/public/SiteHeader.tsx:120): {content.t(anchor.label)} /</a> /))} /<a key={anchor.href} href={anchor.href}>", "file": "./web/components/public/SiteHeader.tsx", "line": "120" }, { "message": "Empty method body (java): ./.standards/ci/templates/archunit/OutboxArchRules.java:30", "file": "./.standards/ci/templates/archunit/OutboxArchRules.java", "line": "30" }, { "message": "Empty method body (java): ./.standards/ci/templates/archunit/SagaArchRules.java:33", "file": "./.standards/ci/templates/archunit/SagaArchRules.java", "line": "33" }]
}

Counts: **1 FAIL, 42 WARN**, 0 findings of any severity in the spec's own deliverable. The single
FAIL is `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90` (`CC=10`) — a file in
the `.standards/` git submodule, pre-existing since 001, untouchable by any pipeline agent in this
repo. Every other `.standards/*` entry above (`ci/templates/*`) is likewise submodule content.

`property-tests` gate: **pass** (0 FAIL) — `fast-check` is a devDependency and the suite uses it.
`component-per-file`, `solid`, `yagni`: 0 FAILs. `dry`: 0 FAILs in project source, one project-source
WARN (`ProvenanceStrip.tsx:56`, 5× 4-line row markup) plus the documented submodule templates.

Same command **without** moving `.next` aside exits **141** (SIGPIPE in the DRY sub-pipeline) and
additionally FAILs compiled Turbopack chunks under `.next/server/chunks/` — build output, not
source, and the reason this gate is run with `.next` set aside.

## Evidence: scenario-to-behavior spot check

command: npx vitest run tests/acceptance/fuse.test.ts tests/acceptance/share.test.ts -t "AC-003-15|AC-003-19|AC-003-26"
exit: 0
at: 2026-11-01T12:22:34Z

Three scenarios drawn from `20-acceptance/` were read against their own test bodies first, then
re-run scoped. (`36 skipped` here is the `-t` filter excluding the other tests in those two files —
not disabled tests; the full-suite run above has zero skips.)

start: 2026-11-01T12:22:34Z

 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  2 passed (2)
      Tests  3 passed | 36 skipped (39)
   Start at  13:22:34
   Duration  801ms (transform 35%, import 34%, tests 30%, worker 1%)

EXIT:0
end: 2026-11-01T12:22:35Z

What each assertion actually checks, against the scenario text:

- **AC-003-15 (the percentage is not capped above the threshold).** Then-clauses: prints `110 %`,
  drawn consumed length = the full fuse length. The test builds `{observedRatio: 55, threshold: 50,
  consumedPercent: 110}`, asserts the rendered `<figure class="fuse">` contains `110 %`, and asserts
  the rendered `<rect class="fuse__burnt">` has `x="0" … width="1000"` in the `0 0 1000 6` viewBox —
  i.e. the drawn line, not just the clamp helper. Matches, including the "drawing is clamped,
  printing is not" split the scenario intends.
- **AC-003-19 (no threshold year, no fuse).** Given `not-crossed`, `unavailable` and `withheld`
  countdowns *with a valid fuse series present*: Then no `class="fuse"` and no `fuse__line`
  renders. The test renders the full page for all three countdown states with the fuse series in
  the input and asserts both absences — so it cannot pass by the series simply being missing.
  Matches.
- **AC-003-26 (the shared URL is canonical and clean).** Then `{url}` equals `canonicalUrl(route)`
  and no tracking parameter is appended. The test iterates all five locales × four networks,
  extracts the shared URL from `searchParams.url` (LinkedIn/Telegram) or the trailing token of
  `text` (WhatsApp/X), asserts exact equality with `canonicalUrl(publicPathFor(locale))`, rejects
  `utm_|fbclid|gclid|ref=|source=`, and separately asserts the no-JS `<input>` holds that same URL.
  Matches, and it is the same property this stage re-checked against the served HTML.

No test in these three families asserts the right scenario ID for the wrong behaviour.

## Quality gates

# 003-countdown-hero — Mutation report (stage 5a)

**Verdict: GREEN**

Scope: the configured mutation set (`web/metrics/**`, `web/manifest/**`, `web/sources/**`,
`web/ingest/**`, `web/series/**`, `web/content/budgets.ts`,
`scripts/check-scenario-traceability-3digit.ts`) **plus this spec's new code** —
`web/series/fuse.ts`, `web/share/**`, `web/seo/threshold-year.ts`, `web/seo/metadata.ts`,
`web/content/share-copy.ts`, and the conditional logic in `CountdownBand.tsx`, `Fuse.tsx`,
`PendingBlock.tsx`, `HeroLead.tsx`. 47 files, 3,078 mutants, two rounds.

Environment: Node 24.21.0, `@stryker-mutator/core` 10.1.1 with the vitest runner, vitest 5.0.5,
12 vCPU. Branch `spec/003-countdown-hero`. The working tree is dirty by design — stages 2–3's
deliverable is uncommitted work and stage 5b is the stage that commits. Nothing was stashed,
committed, or reverted by this stage; the only file this stage added to the repo is
`tests/unit/spec-003-mutation-kills.test.ts`.

## Verifier verdict, carried forward

`25-verification.md` = **PASS** for the spec's deliverable, with one out-of-scope
`check-code-principles.sh` FAIL recorded and not waived (a file inside the `.standards/`
submodule, pre-existing since 001). Gates green there: traceability 0, full suite 0
(**71 files / 895 tests, 0 failed, 0 skipped**), ESLint complexity 0, `tsc` 0, build 0, every
content gate 0. That PASS is this stage's precondition and was not re-litigated.

## Scores

Definitions, stated once because two are easy to confuse: **total** = detected ÷
(mutants − errors) — no-coverage mutants count against it, as Stryker's own "total" column does;
**covered** = detected ÷ (mutants − no-coverage − errors). "Detected" = `Killed` + `Timeout`.
`RuntimeError` mutants are detected-by-crash, not by an assertion; they are excluded from both
denominators and counted separately.

### Headline

| Measurement | Mutants | Total | Covered |
|---|---|---|---|
| **Round 1** — whole scope, one run | 3,078 | **91.71%** | 92.68% |
| **Round 2** — the six files re-run after the killing tests | 232 | **95.63%** | 95.63% |
| **Merged** — r2 for those six files, r1 for the other 41 (two measured runs, not one) | 3,078 | **92.43%** | 93.29% |

Round 1 was 3,078 mutants: 2,798 killed, 2 timed out, 221 survived, 32 no-coverage, 25
`RuntimeError`. After round 2 the merged set is 2,820 killed + 2 timeouts, 203 survived, 28
no-coverage, 25 errors. 22 mutants moved from survived/no-coverage to killed.

The merged figure is a union of two real runs, not a single invocation — the 43-minute full run
was not repeated after the fix (see §Rounds and §Remediation record).

### The three sub-areas this spec named, separately

| Area | Round 1 | Round 2 (final) | Verdict |
|---|---|---|---|
| `web/series/fuse.ts` | **96.67%** (29/30) | **100.00%** (30/30) | ✅ |
| `web/share/**` (`links.ts`) | **100.00%** (21/21) | **100.00%** (21/21) | ✅ |
| SEO year derivation — `threshold-year.ts` | **100.00%** (12/12) | **100.00%** (12/12) | ✅ |
| SEO year derivation — `metadata.ts` | **83.87%** (26/31) | **93.55%** (29/31) | ✅ |
| `web/seo/` (directory) | 88.37% | **95.35%** (41/43) | ✅ |

Nothing in these three areas fell below 80%, at either round. Two things fell below 80% in
round 1 and are stated plainly, because an aggregate has hidden a 77.39% in this project before:

- **`web/ingest/series.ts` = 79.49%** (62/78) in round 1 — **below 80%**, and not a pre-existing
  file: this spec edited it to add `FUSE_SERIES`. Raised to **93.33%** (70/75) by round 2.
- **`web/sources/labels.ts` = 78.72%** (37/47) — still below 80% after round 2, and untouched by
  this spec (it has carried this score since 001; see §Findings 4).

### Per-directory (merged)

| Directory | Total | Detected / non-error |
|---|---|---|
| `web/share/` | **100.00%** | 21/21 |
| `web/content/` | **100.00%** | 49/49 |
| `web/seo/` | **95.35%** | 41/43 |
| `web/components/` | **95.04%** | 115/121 |
| `web/metrics/` | 93.62% | 279/298 |
| `web/manifest/` | 93.27% | 485/520 |
| `web/ingest/` | 93.05% | 763/820 |
| `web/series/` | 91.21% | 529/580 |
| `web/sources/` | 90.38% | 451/499 |
| `scripts/` (3-digit traceability gate) | 87.25% | 89/102 |

### Per file (merged; files this spec added or touched shown first)

| File | Total | Detected / non-error |
|---|---|---|
| `web/components/series/CountdownBand.tsx` | 97.22% | 35/36 |
| `web/components/series/Fuse.tsx` | 94.59% | 35/37 |
| `web/components/PendingBlock.tsx` | **100.00%** | 20/20 |
| `web/components/public/HeroLead.tsx` | 89.29% | 25/28 |
| `web/content/share-copy.ts` | **100.00%** | 48/48 (+2 `RuntimeError`) |
| `web/seo/threshold-year.ts` | **100.00%** | 12/12 |
| `web/seo/metadata.ts` | 93.55% | 29/31 |
| `web/series/fuse.ts` | **100.00%** | 30/30 |
| `web/share/links.ts` | **100.00%** | 21/21 |
| `web/ingest/series.ts` | 93.33% | 70/75 (+3 `RuntimeError`) |
| `web/ingest/series-types.ts` | 92.86% | 13/14 |
| `web/content/budgets.ts` | 100.00% | 1/1 |
| `web/metrics/rounding.ts` · `dependency-ratio.ts` · `pension-share.ts` · `contribution-cover.ts` · `implicit-debt.ts` · `required-base-growth.ts` | 100.00% | 5/5 · 40/40 · 36/36 · 38/38 · 10/10 · 29/29 |
| `web/metrics/cohort-irr.ts` | 96.00% | 48/50 |
| `web/metrics/npv.ts` | 81.11% | 73/90 |
| `web/manifest/validate.ts` | 95.64% | 307/321 |
| `web/manifest/definitions.ts` | 85.19% | 115/133 |
| `web/manifest/hash.ts` · `formula-ids.ts` · `repo-file.ts` | 93.94% · 94.12% · 100.00% | 31/33 · 16/17 · 16/16 |
| `web/ingest/validate-figure.ts` | 96.97% | 160/165 |
| `web/ingest/figures.ts` | 94.47% | 188/199 |
| `web/ingest/run-compute.ts` | 93.00% | 186/200 |
| `web/ingest/run-series.ts` | 84.80% | 106/125 |
| `web/ingest/write-derived.ts` | 88.24% | 15/17 |
| `web/ingest/deterministic-json.ts` · `types.ts` | 100.00% | 14/14 · 11/11 |
| `web/series/age-bands.ts` | 97.62% | 41/42 |
| `web/series/clock-ticker.ts` · `clock.ts` | 95.96% · 92.45% | 95/99 · 49/53 |
| `web/series/countdown.ts` | 88.72% | 173/195 |
| `web/series/age-structure.ts` | 87.58% | 141/161 |
| `web/sources/freshness.ts` · `types.ts` | 100.00% | 29/29 · 12/12 |
| `web/sources/ine.ts` | 95.71% | 67/70 |
| `web/sources/countries.ts` | 93.22% | 55/59 |
| `web/sources/live.ts` | 90.91% | 40/44 |
| `web/sources/eurostat.ts` | 89.52% | 188/210 |
| `web/sources/load.ts` | 82.14% | 23/28 |
| `web/sources/labels.ts` | **78.72%** | 37/47 |
| `scripts/check-scenario-traceability-3digit.ts` | 87.25% | 89/102 |

Preserved local artifacts (gitignored, not committed): `reports/mutation/r1.json`,
`reports/mutation/r2.json`. `reports/mutation/mutation-prev-spec002.json` is the previous run's
report, kept so the earlier score stays auditable.

## Rounds

| Round | What ran | Scope | Mutants | Duration | Result |
|---|---|---|---|---|---|
| 1 | measure | 47 files (configured set + new code, minus two files — see §Findings 1) | 3,078 | 43m19s | 91.71% total; 31 survivors + 4 no-coverage in this spec's own files |
| 2 | measure after 8 killing tests | the 6 files that carried those survivors | 232 | 2m53s | 95.63%; 13 survivors, all adjudicated |

No gate BLOCK occurred, so no remediation round was consumed. The two runs are one measurement
plus one re-measurement of the fixed files, not two fix-and-repush cycles.

## Survivors and verdicts

Round 1 left **31 survivors + 4 no-coverage mutants** in this spec's own files (35 mutants across
`fuse.ts`, `metadata.ts`, `CountdownBand.tsx`, `Fuse.tsx`, `HeroLead.tsx`, `PendingBlock.tsx`,
`ingest/series.ts`); round 2 killed 22 of them and adjudicates the 13 that remain — 8 equivalent,
5 reachable-but-uncovered. `share-copy.ts` had no survivor, only 2 `RuntimeError` mutants:

| File:line | Mutator | Replacement | Verdict |
|---|---|---|---|
| `web/series/fuse.ts:35` | ConditionalExpression | `true` | **Killed** — `computeFuse` always reported the newest year's ratio even when that year cannot be divided (NaN). New test: the year is skipped. |
| `web/seo/metadata.ts:29` ×3 | ConditionalExpression, ObjectLiteral, StringLiteral | `false`, `{}`, `"Stryker was here!"` | **Killed** — the unknown-locale fallback was never executed. New test drives `pageMetadata('xx')`. |
| `web/components/series/CountdownBand.tsx:34,35,36` | StringLiteral | `""` | **Killed** — `share.native` / `share.copy` / `share.copied` resolved from a blank key. New test: the band asks the content model for those keys. |
| `web/components/series/CountdownBand.tsx:86` ×2 | StringLiteral, ObjectLiteral | `""`, `{}` | **Killed** — the click-time template's key and its `{year,url,days}` variables. New test asserts the exact `t('share.text', ...)` call. |
| `web/components/series/Fuse.tsx:38` | ArithmeticOperator | `BURNT_H * 2` | **Killed** — the cord's `y` (its centring inset). New test asserts both rects' attributes. |
| `web/components/series/Fuse.tsx:39` | ArithmeticOperator | `VIEW_W + at` | **Killed** — the burnt segment's width. New test asserts `width="624.4"`. |
| `web/components/series/Fuse.tsx:66` | StringLiteral | `""` | **Killed** — the ratio's definition paragraph could have been empty; nothing read it. New test asserts the locale string. |
| `web/components/series/Fuse.tsx:75` | StringLiteral | `""` | **Killed** — the reproduce link's label could have been empty. New test asserts it. |
| `web/components/PendingBlock.tsx:32` | StringLiteral | `""` | **Killed** — the space between the heading and the `sin calcular` chip; the words ran together. New test asserts the heading's text. |
| `web/ingest/series.ts:24` ×3 | OptionalChaining, ConditionalExpression, StringLiteral | `snapshot.resolved`, `false`, `` `` `` | **Killed** — the "not resolved" guard and its message. New test: a missing snapshot throws by name. |
| `web/ingest/series.ts:85,86,88` | BlockStatement, ObjectLiteral, StringLiteral | `{}`, `{}`, `""` | **Killed** — `fuseAssumptions`. New test asserts the assumptions object the series publishes. |
| `web/ingest/series.ts:106` ×2 | ConditionalExpression, StringLiteral | `false`, `""` | **Killed** — the no-observable-year refusal and its message. New test: an uncomputable observation throws by name. |
| `web/components/series/CountdownBand.tsx:79` | ConditionalExpression | `false` | **Equivalent** — see E1. |
| `web/components/series/Fuse.tsx:48,50` | StringLiteral | `"Stryker was here!"` | **Equivalent** — see E2. |
| `web/seo/metadata.ts:24` ×2 | ConditionalExpression, StringLiteral | `false`, `"Stryker was here!"` | **Equivalent** — see E3. |
| `web/components/public/HeroLead.tsx:16` ×3 | ArrayDeclaration, ObjectLiteral, StringLiteral | `[]`, `{}`, `""` | **Equivalent** — see E4. |
| `web/ingest/series.ts:30` | OptionalChaining | `value.years[0].bands` | **Defensive/unreachable** — see E5. |
| `web/ingest/series.ts:46,47,50,51` | MethodExpression, ConditionalExpression ×3 | `value.variants`, `true`, `false`, `false` | **Reachable, not killed — round budget** — see §Findings 3. |

## The four honesty-critical branches

Ranked above the aggregate, per the stage brief. Result: **all four clean — no surviving mutant
in any of them.**

1. **Fuse absent-state (no observed value → nothing renders).** `fuse.ts` 100%, `Fuse.tsx`
   94.59% with both survivors equivalent (`nullLabel`), `CountdownBand.tsx`'s only survivor is
   the sibling ternary. No mutant survives in `fuseValueOf`, in `computeFuse`'s two `return null`
   arms, or in `bandCountdown`'s guards. AC-003-18/AC-003-19 render-tests kill them.
2. **Fuse never reading the projected series.** `fuse.ts` 100% — the module's only imports are
   `readAgeCounts` / `observedDependency` / `COUNTDOWN_THRESHOLD`, and no mutant touch that could
   introduce a projection read survives. AC-003-20's structural and behavioural assertions hold.
   The round-1 survivor at `fuse.ts:35` was not a projection leak: it was the newest-*observed*-year
   fallback, now killed.
3. **Share text carries the click-time day count while the no-JS form does not.** `links.ts`
   100% (21/21) — `messageAt`'s `elapsed → withoutDays` arm, the `{days}` substitution and every
   network builder are killed. In the component, the round-1 survivors that let the *server* form
   or the *click* form resolve from the wrong template key/variables are now killed
   (`CountdownBand.tsx:86` ×2, `:34–36`); the only remaining survivor there is unrelated to the
   template (`:79`).
4. **`share.*` rejecting the banned words.** `share-copy.ts` 100% (48/48 non-error) with no
   survivors: `COMMON` (`bomb`, `!`), every locale's vocabulary list, the case-folding and the
   `includes` predicate are all killed by AC-003-47's per-locale samples. The two `RuntimeError`
   mutants (`ObjectLiteral` on `BY_LOCALE`, `BlockStatement` on the function body) are detected by
   the suite crashing, not by an assertion — they are not free passes, but they are not
   assertion-killed either, and are recorded as such.

## Equivalent mutants (each named, with why it cannot be killed)

**E1 — `CountdownBand.tsx:79`, `ConditionalExpression` → `false`.** Source:
`{fuse === undefined ? null : <Fuse … />}`. Mutated to always render `<Fuse>`, the output is
byte-identical: `Fuse` begins with `fuseValueOf(series)`, which returns `undefined` for a
`undefined` series, `availability !== 'computed'`, or `value === null` — and `Fuse` then returns
`null`. Both branches produce the same markup for every input the component can receive, so no
test can distinguish them. Not a gap: the duplication is the reason the branch is redundant, and
`Fuse`'s own guard is mutation-covered (97.22% / 100% of its four absent-state arms).

**E2 — `Fuse.tsx:48` and `Fuse.tsx:50`, `StringLiteral` → `"Stryker was here!"`.** The mutated
literal is `formatValue(value.observedRatio, 'ratio', locale, '')`'s and
`formatValue(value.threshold, 'integer', locale, '')`'s fourth argument — the `nullLabel`, read
only when `value === null` or `Number.isNaN(value)`. `FuseValue.observedRatio` and
`.threshold` are typed `number`, and `computeFuse` cannot produce a null ratio: it *skips* an
undividable year (that fallback is now killed — see the table) and returns `null` for the whole
figure when no year can be divided. So the only inputs that observe the difference are ones the
type system forbids and the compute path never emits.

**E3 — `metadata.ts:24` ×2, `countryName === ''` → `false` / `''` → `"Stryker was here!"`.**
`scopedTitle`'s empty-name arm. `pageMetadata` reaches it only through
`contentRegistry.get('ES', locale)`, which returns `!ok` for an unknown locale (so the round-2
test kills the *fallback* arm at line 29 instead) and can only be `ok` for one of the five
shipped locale documents. Every one of those names its country, and the build gate
`countryRecordProblems` fails the content set if a document's name is blank — AC-001-103. The
blank-name state is therefore unreachable by construction, and the arm is dead code. Recorded as
a YAGNI hint rather than a test gap: the cleanest fix is to delete the arm, not to fabricate a
nameless country document.

**E4 — `HeroLead.tsx:16` ×3, `ArrayDeclaration` → `[]`, `ObjectLiteral` → `{}`,
`StringLiteral` → `""`.** All three mutations of `defaultScope`'s single entry produce the same
page: `ScopeMark` branches on `countries.length <= 1` and, for that branch, renders the *country
record's* own `name` and `scopeClause` — it never reads the entry's `geo`, `name` or `href`. A
one-entry fallback and a zero-entry fallback render identical markup; so does an entry with an
undefined name or `href`, because neither is read at that length. The entry's fields become
load-bearing only for the `> 1` branch, which `defaultScope` — by its own contract of one
published country — cannot reach.

**E5 — `ingest/series.ts:30`, `OptionalChaining` → `value.years[0].bands`.** `pyramidAssumptions`
reads `value.years[0]?.bands.length ?? 0`; the mutation drops the guard. `computePyramid` always
returns three year structures (two observed, one projected) and the harness refuses a pyramid that
does not, so the zero-year `PyramidValue` the mutant would crash on is not constructible from any
payload the compute path accepts.

## Findings

1. **Two files of this spec's new code are outside the mutation scope for a tooling reason, not a
   convenience one.** `web/components/share/ShareRow.tsx` and `web/components/share/CopyLink.tsx`
   cannot be mutated: three existing tests assert on their own raw source text
   (`share.test.ts` AC-003-27 `toContain("typeof navigator.share === 'function'")`, AC-003-28
   `toContain('navigator.clipboard.writeText(url)')`, AC-003-31
   `toContain('event.currentTarget.href = shareHref(network, message(), url);')`). Stryker
   reparses and reprints every instrumented file, so those literals are absent from the sandbox
   copy and **the dry run fails before any mutation is generated** (`expected '\'use client\';
   \n\nfunction stryNS_9f…' to contain 'typeof navigator.share === 'function…'`). Including them
   would have made the whole run impossible; the two files' conditional logic is therefore
   covered behaviourally (AC-003-27/28/31 and the Chromium suite
   `tests/acceptance/countdown-band-browser.test.ts`) but **not mutation-tested**, and that is a
   real hole in the evidence, stated rather than hidden. It is fixable in one edit: make those
   three assertions whitespace- and quote-insensitive (or drop the positive source-text scans in
   favour of the behavioural assertions that already exist). This stage did not make that edit —
   the brief confines it to adding tests — and it is enumerated below.
2. **The mutate list needs widening, and only the orchestrator's brief authorises that, so it is
   enumerated and not made.** This stage ran with `--mutate` overrides; `stryker.config.mjs`
   itself is unchanged (no threshold was touched: `break: null`, `high/low: 80` as shipped).
   Recommended one-line addition to the `mutate` array, with the same reasoning style as the
   existing entries:
   ```js
   // Spec 003's own claim surface: the observed-only fuse, the share links, the copy rules and
   // the derived threshold year. Added when those modules shipped, for the same reason the
   // revision-2/3 entries above were added.
   'web/share/**/*.ts',
   'web/content/share-copy.ts',
   'web/seo/threshold-year.ts',
   'web/seo/metadata.ts',
   'web/components/**/*.tsx',
   ```
   (The `.tsx` glob is what makes the four component files re-measurable next time; it must not
   be added until Finding 1 is resolved, or the dry run fails again.)
3. **Five reachable survivors in `web/ingest/series.ts` remain, named, because the two-round
   cap was reached.** Lines 46, 47, 50, 51 (`countdownAssumptions`: the `variants` filter, the
   `thresholdYear !== null` predicate, and the two `backCast === null` arms). They are killable —
   `SERIES`' countdown definition computed at a threshold that never crosses (`countdownAt(90)`,
   already a fixture) would exercise all four. They are **not** in the fuse path and **not** in
   any of the four honesty-critical branches, so the priority rule in the stage brief puts them
   below the cap. This is the stage's one unfinished item; a third round would close it.
4. **`web/sources/labels.ts` sits at 78.72% and this spec did not touch it.** Its 10 survivors
   date from spec 001, like the other pre-existing survivor sets below. Stated plainly because
   the brief asks for it: the aggregate is not hiding it — the per-file table shows it.
5. **The rest of the survivor set is pre-existing and was not re-adjudicated here.** Of the 203
   survivors in the merged set, this stage adjudicated **13** (the eight equivalents and the five
   reachable ones above). A further **18** sit in files this branch does modify, but on lines it
   does not add — `manifest/definitions.ts` (16), `manifest/formula-ids.ts` (1),
   `ingest/series-types.ts` (1) — and the remaining **172** are in modules this branch never
   touches: `series/countdown.ts` (20), `sources/eurostat.ts` (20), `ingest/run-series.ts` (16),
   `metrics/npv.ts` (15), `series/age-structure.ts` (14), `manifest/validate.ts` (14),
   `sources/labels.ts` (10), `ingest/run-compute.ts` (10), the 3-digit traceability gate (10),
   `ingest/figures.ts` (8), `ingest/validate-figure.ts` (5), `series/clock-ticker.ts` /
   `clock.ts` / `sources/countries.ts` / `live.ts` (4 each), `sources/ine.ts` (3),
   `ingest/write-derived.ts` / `manifest/hash.ts` / `metrics/cohort-irr.ts` (2 each),
   `series/age-bands.ts` (1) — plus 26 no-coverage mutants across those same modules. Their
   scores are unchanged in kind from the previous report and they were accepted at their own
   gates; adjudicating 190 mutants outside this spec's diff is a separate work item. It is not
   silently dropped: this paragraph names every file and count.
6. **`RuntimeError` mutants are detection, not assertion.** 25 across the scope (`share-copy.ts`
   ×2, `ingest/series.ts` ×3, the 3-digit gate ×4, `ingest/*` ×17 minus overlaps). The suite
   crashes on them, which is how Stryker detects them; they are excluded from the score
   denominators and are not claimed as kills.
7. **`disableTypeChecks: false` is load-bearing for this scope.** The instrumenter only handles
   TSX correctly because type-check stripping is off; enabling it makes the run fail on the
   submodule's HTML (already documented in the config). No change recommended.

## Remediation record

Carried forward verbatim from `25-verification.md`, never guessed:

- **Verifier, revision 4:** `attempt 1, phase 1` — recorded at the top of `25-verification.md`,
  with budget context `SPEC_LOOP_COUNT=5`, `SPEC_PHASE1_RETRIES=0`, `SPEC_PHASE2_RETRIES=0`.
  That file records **no per-attempt history for revisions 1–3**; `SPEC_LOOP_COUNT=5` is the
  only trace that earlier loops happened, so no phase/attempt count is claimed for them here.
- **Phase 2:** not started — no PR exists yet (stage 5b owns it), so `SPEC_PHASE2_RETRIES=0`
  stands.
- **Stage 5a (this stage):** `none` — no BLOCK occurred. Two measurement rounds were run
  (§Rounds); neither was a remediation attempt under a budget, and neither phase-1 nor phase-2
  counters were touched.

## Complexity summary, carried from the Refactorer via the Verifier

`25-verification.md` check 3, re-executed by that stage, is the source; re-stated here because the
audit contract asks this report to carry it:

- `npx eslint .` — exit **0**, no findings at all. The budget is `complexity: ['error', 6]`
  (`eslint.config.mjs:17`), so a function above 6 decision points fails the run rather than
  warning; nothing in the tree trips it.
- `npx tsc --noEmit` — exit **0**.
- `check-code-principles.sh --tier production --json` — exit 1 with **one** FAIL, in the
  `.standards/` submodule (`skills/hallmark/site/examples/cobalt-01/script.js:7`, CC=10), plus
  **42 WARN** (33 in project source). Zero FAILs in project source. Two WARNs are in this spec's
  own code and unchanged by this stage: `web/components/share/ShareRow.tsx:62` (24-line body),
  `web/seo/share-card.tsx:41` (23-line body); `web/components/ProvenanceStrip.tsx:56` carries the
  DRY WARN (5× identical 4-line row).
- This stage's own new code was held to the same budget: the first draft of
  `tests/unit/spec-003-mutation-kills.test.ts` tripped `complexity: 8 > 6` on one helper. The
  **code** was split (three helpers), not the threshold — `npx eslint` on the file is now exit 0.

## Final test status

Full suite, run after the mutation-kill work, with the new file present:

```
 Test Files  72 passed (72)
      Tests  903 passed (903)
   Duration  55.85s
```

903 = the Verifier's 895 + this stage's 8 new tests; 72 = 71 + 1 new file. Zero failed, zero
skipped (no `skipped` line in the run). The eight new tests:

`tests/unit/spec-003-mutation-kills.test.ts` — AC-003-12 (the observed-ratio lookup skips a year
it cannot divide), AC-003-38 (unknown locale falls back to the bare wordmark), AC-003-33 (the band
resolves every share key, with `{days}` left in the click-time template), AC-003-13 (the drawn
cord and burnt segment), AC-003-21 (the definition paragraph and the reproduce label), AC-003-39
(the pending heading reads as one sentence), AC-003-20 (the fuse series' published assumptions;
and that a missing or uncomputable observation stops the series by name).

Both gates that read the test files are green with them in place: `check-scenario-traceability.sh
--json` exit 0 (51/51 AC-003 IDs traced) and `check-scenario-traceability-3digit.ts` exit 0
(206 scenarios, all cited, all citations resolve). Build green — `npm run build` exit 0, all five
public routes prerendered, `/admin*` dynamic — which also re-runs the four prebuild content gates.

## Evidence: mutation score, round 1

command: cat /tmp/opencode/mutate-r1.txt | xargs -I{} npx stryker run --mutate "{}" --concurrency 8
exit: 0
at: 2026-11-01T12:27:50Z

Scope string actually passed to `--mutate`:

web/metrics/**/*.ts,web/manifest/**/*.ts,web/sources/**/*.ts,web/ingest/**/*.ts,web/series/**/*.ts,web/content/budgets.ts,scripts/check-scenario-traceability-3digit.ts,web/share/**/*.ts,web/seo/threshold-year.ts,web/seo/metadata.ts,web/content/share-copy.ts,web/components/series/CountdownBand.tsx,web/components/series/Fuse.tsx,web/components/PendingBlock.tsx,web/components/public/HeroLead.tsx

Stryker's own summary table (unedited):

```
Found 47 of 325 file(s) to be mutated.
Instrumented 47 source file(s) with 3078 mutant(s).
Initial test run succeeded. Ran 808 tests in 37 seconds.
WARN MutantTestPlanner Detected 2041 static mutants (66% of total) that are estimated to take 99% of the time running the tests!

----------------------------------------|------------------|----------|-----------|------------|----------|----------|
                                        | % Mutation score |          |           |            |          |          |
File                                    |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                               |  91.71 |   92.68 |     2798 |         2 |        221 |       32 |       25 |
 web                                    |  91.87 |   92.78 |     2709 |         2 |        211 |       29 |       21 |
  components                            |  86.78 |   86.78 |      105 |         0 |         16 |        0 |        0 |
  content                               | 100.00 |  100.00 |       49 |         0 |          0 |        0 |        2 |
  ingest                                |  92.07 |   93.44 |      755 |         0 |         53 |       12 |       17 |
  manifest                              |  93.27 |   93.63 |      485 |         0 |         33 |        2 |        2 |
  metrics                               |  93.62 |   94.26 |      278 |         1 |         17 |        2 |        0 |
  seo                                   |  88.37 |   92.68 |       38 |         0 |          3 |        2 |        0 |
   metadata.ts                          |  83.87 |   89.66 |       26 |         0 |          3 |        2 |        0 |
   threshold-year.ts                    | 100.00 |  100.00 |       12 |         0 |          0 |        0 |        0 |
  series                                |  91.03 |   92.31 |      528 |         0 |         44 |        8 |        0 |
   fuse.ts                              |  96.67 |   96.67 |       29 |         0 |          1 |        0 |        0 |
  share                                 | 100.00 |  100.00 |       21 |         0 |          0 |        0 |        0 |
   links.ts                             | 100.00 |  100.00 |       21 |         0 |          0 |        0 |        0 |
  sources                               |  90.38 |   90.93 |      450 |         1 |         45 |        3 |        0 |
 scripts                                |  87.25 |   89.90 |       89 |         0 |         10 |        3 |        4 |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
Done in 43 minutes and 19 seconds.
```

## Evidence: mutation score, round 2

command: npx stryker run --mutate "web/series/fuse.ts,web/seo/metadata.ts,web/components/series/CountdownBand.tsx,web/components/series/Fuse.tsx,web/components/PendingBlock.tsx,web/ingest/series.ts" --concurrency 8
exit: 0
at: 2026-11-01T13:15:16Z

```
Found 6 of 325 file(s) to be mutated.
Instrumented 6 source file(s) with 232 mutant(s).

                     | % Mutation score |          |           |            |          |          |
File                 |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
All files            |  95.63 |   95.63 |      219 |         0 |         10 |        0 |        3 |
 components          |  96.77 |   96.77 |       90 |         0 |          3 |        0 |        0 |
  series             |  95.89 |   95.89 |       70 |         0 |          3 |        0 |        0 |
   CountdownBand.tsx |  97.22 |   97.22 |       35 |         0 |          1 |        0 |        0 |
   Fuse.tsx          |  94.59 |   94.59 |       35 |         0 |          2 |        0 |        0 |
  PendingBlock.tsx   | 100.00 |  100.00 |       20 |         0 |          0 |        0 |        0 |
 ingest              |  93.33 |   93.33 |       70 |         0 |          5 |        0 |        3 |
  series.ts          |  93.33 |   93.33 |       70 |         0 |          5 |        0 |        3 |
 seo                 |  93.55 |   93.55 |       29 |         0 |          2 |        0 |        0 |
  metadata.ts        |  93.55 |   93.55 |       29 |         0 |          2 |        0 |        0 |
 series              | 100.00 |  100.00 |       30 |         0 |          0 |        0 |        0 |
  fuse.ts            | 100.00 |  100.00 |       30 |         0 |          0 |        0 |        0 |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
Done in 2 minutes and 53 seconds.
```

Residual survivors, exactly as adjudicated above: `CountdownBand.tsx:79`; `Fuse.tsx:48,50`;
`metadata.ts:24` ×2; `ingest/series.ts:30,46,47,50,51` (`HeroLead.tsx` was not re-run in round 2 —
its three survivors are equivalent and its line did not change).

## Evidence: final full test suite

command: npx vitest run
exit: 0
at: 2026-11-01T13:19:02Z

```
 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  72 passed (72)
      Tests  903 passed (903)
   Start at  14:19:03
   Duration  55.85s (tests 77%, import 18%, transform 4%, worker 1%)
```

No `skipped` line: every collected test ran. The Verifier's 895/71 is reproduced, plus this
stage's 8 tests in 1 file.

## Evidence: build

command: npm run build
exit: 0
at: 2026-11-01T13:20:01Z

Prebuild gates (all inside `npm run build`, all green) — `tsx scripts/verify-derived.ts`
(`derived figures verified: 7 (2 computed, 5 unavailable)` / `derived series verified: 3`),
`check-content-scope.ts`, `check-public-vocabulary.ts`,
`check-scenario-traceability-3digit.ts` — then `next build`:

```
Route (app)
├ ○ /
├ ● /en
├ ● /fr
├ ● /de
├ ● /it
├ ● /[locale]/opengraph-image-…/[__metadata_id__]
├ ƒ /admin
├ ƒ /admin/audit
├ ƒ /admin/login
├ ƒ /admin/proposals/[id]
├ ƒ /admin/refresh/[runId]
├ ƒ /admin/revisions/[id]
├ ƒ /api/admin/…
├ ○ /apple-icon.png
├ ○ /icon.svg
├ ○ /manifest.webmanifest
├ ○ /opengraph-image-…
├ ○ /robots.txt
└ ○ /sitemap.xml

ƒ Proxy (Middleware)
```

All five public routes prerendered, `/admin*` dynamic — unchanged from the Verifier's own build.

## Evidence: scenario traceability (re-run with the new tests present)

command: .standards/scripts/check-scenario-traceability.sh --json  &&  npx tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-11-01T13:20:12Z

```
EXIT_UPSTREAM:0
  "passes": ["AC-003-01 — traced to a test", … "AC-003-51 — traced to a test"],
  "fails": []
scenario traceability (2-3 digit ids): 206 scenarios, all cited, all citations resolve
EXIT_LOCAL:0
```

51/51 `AC-003-*` scenarios still traced; the base suite's 206 scenarios still all cited, and the
eight new tests' citations resolve (they re-cite existing IDs rather than inventing one).

## What this stage did not do

No commit, no push, no PR, no deploy. No production code changed. No gate config, no threshold,
no `.standards/**` file, and nothing under `specs/` except this report. No `Stryker disable`
comment or equivalent-mutant exception was added anywhere — every exception above is a measured
`Survived` mutant with its reason recorded here, which is the only form of exception this stage
uses.

## 15-design.md

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
