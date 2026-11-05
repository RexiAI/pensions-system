# 004-plain-countdown

> Spec pipeline archive. Original source: `specs/004-plain-countdown/` (deleted by this script).
> Archived: 2026-11-05

## Original ask

# 004-plain-countdown — informal spec

Petición original (usuario, 2026-11-01):

> In the current page i see in the sidebar lots of spaces. That is antipratonic.
> Look for websites with countdowns to know what attracts people or tell me how
> can i guide you. Next the ux is completely wrong i do not know how it is
> possible to have designed this shit.
>
> […la página entera, pegada…] all this lines confuse people, this needs to be
> done for the dumber. It needs to be a countdown when the system likely breaks,
> also explaining why with the pyramid, etc.

La spec 003 puso el reloj delante. Esta spec corrige cómo lo puso: el número
llegó, la explicación no.

## Decisiones ya tomadas con el usuario (2026-11-01)

| Pregunta | Decisión |
|---|---|
| ¿A qué cuenta la cuenta atrás? | Se mantiene **2042** — el año en que la proyección central de Eurostat sitúa el ratio de dependencia en 50 por cada 100. Sin cambios de datos. |
| Alcance | **Recomposición completa** de la página pública. No es un parche de CSS. |
| Cifras 3–7 (hoy `unavailable`) | **Se ocultan** de la página pública hasta que existan. Seguimiento en admin, no en portada. |
| Identidad visual | **Se mantiene el instrumento** (paleta, tipos, reglas, radios, oliva/ámbar) y se le añade **una capa de lenguaje llano** en la parte alta. |
| Idiomas | **Los cinco** (es, en, fr, de, it) mantienen paridad. |

## Estado actual, medido

Medido en la build servida (`npm run start`, 1440×900, 2026-11-01) con
`getBoundingClientRect()` y captura de pantalla.

| Hallazgo | Medida |
|---|---|
| `.hero--band` es una rejilla de dos columnas (`667px \| 477px`) con **un solo hijo**, colocado en la columna 2 | **699 × 552 px de papel vacío** a la izquierda del panel de "Gasto público en pensiones" |
| Altura de la banda de cuenta atrás | **1046 px** |
| Párrafos que explican el mismo número dentro de la banda | **3** ("fecha convencional del umbral…", "Cuenta hasta el 1 de enero de 2042…", "Los 16 años son la diferencia entre 2042 y 2026…") |
| Posición vertical de la pirámide (`#demografia`) | **y = 1970** — 2,2 pantallas por debajo del pliegue |
| Titular de la pirámide | `14,98 % → 32,68 %` y `25,14 % → 16,00 %` — cuatro porcentajes en una frase |
| Altura del documento | **10 208 px** |
| Palabras en la página | **1 771** |
| Encabezados | **22** |
| Cifras `unavailable` | **5 de 8** (`fig-03`…`fig-07`), renderizadas como un bloque "5 cifras en preparación sin calcular" en mitad de la página |

La causa del hueco: la spec 003 movió el `<h1>` y las acciones del hero a la
banda (prop `lead`), pero el hero conservó su rejilla de dos columnas y la
colocación del panel en la segunda. Nadie colapsó la rejilla cuando se quedó sin
inquilino en la primera.

## Qué quiero

1. **La portada cuenta una historia en cinco pasos, en este orden, y cada paso
   cabe en una pantalla.** Nada más arriba del pliegue que estos cinco:

   | # | Paso | Forma |
   |---|---|---|
   | 1 | El número | `Faltan 5 539 días` |
   | 2 | Qué se rompe | una línea: 50 mayores por cada 100 en edad de trabajar |
   | 3 | Por qué — **la pirámide manda aquí** | tres pirámides anotadas, no etiquetadas |
   | 4 | Cuánto camino llevamos | la mecha como barra simple: `62 %` |
   | 5 | Qué significa para ti | una frase y el botón `Ver cuánto te queda` |

2. **La pirámide es la explicación, no un anexo.** Sube al tercer paso. Lleva
   anotación que diga qué mirar —el baby boom que se jubila, la base que no
   repone— y no cuatro porcentajes en un titular.

3. **Una cifra, una frase.** Las tres paráfrasis de la misma fecha se funden en
   una sola frase llana. La precisión metodológica (fecha convencional, proyección
   y no fecha calculada, variantes 2039–2043) se conserva **debajo del pliegue**,
   no en la cara del reloj.

4. **Nada de jerga en la parte alta.** Fuera de los cinco pasos no aparecen
   `ratio de dependencia`, `demo_pjan`, `ESSPROS`, `spr_exp_pens`, nombres de
   serie, ni tablas de procedencia. Todo eso baja a Método.

5. **Fuera las cifras que no existen.** La portada pública no muestra ninguna
   cifra `unavailable`. Si no hay número, no hay bloque.

6. **El hueco desaparece.** Ninguna sección deja una columna vacía a ningún ancho
   de 320 px a 1440 px, ni en ninguna de las cinco lenguas.

7. **La capa de lenguaje llano vive encima del instrumento.** La paleta, los
   tipos, las reglas de 1 px, el radio 0 y el oliva/ámbar no cambian. Cambia lo
   que se dice y en qué orden.

## Lo que NO quiero

- No se cambia a qué se cuenta: sigue siendo el 1 de enero de 2042.
- No se inventan umbrales nuevos, ni series nuevas, ni cifras nuevas.
- No se toca la exactitud de las cifras que ya existen (verificación, manifiestos,
  reproducibilidad por comando).
- No se abandona la identidad: ni tarjetas redondeadas, ni sombras, ni una paleta
  nueva.
- No se traduce a menos idiomas.
- No se borra el contenido de método, fuentes, cuatro voces, debate y supuestos:
  **se reordena y se colapsa**, no se elimina.

## Preguntas abiertas

- Ninguna bloqueante. Las cinco decisiones de arriba cierran el alcance.

## Nota sobre criterios heredados

La disposición actual está fijada por criterios de aceptación de las specs
001–003 (entre otros, la geometría del reloj y el orden de la banda: `AC-001-111`,
`AC-003-06`, `AC-003-50`, y las tablas de `tests/acceptance/first-viewport.test.ts`).
Esta spec **sustituye** los que fijen el orden y la composición actuales, y
**conserva** los que fijen exactitud, accesibilidad, trazabilidad y
reproducibilidad. Cuáles exactamente es trabajo de la etapa 1.

## Tasks

# 004-plain-countdown — tasks (stage 1)

Source: `specs/004-plain-countdown/00-informal.md`. Scope is fixed by the five decisions in that
document's §Decisiones ya tomadas; none of them is re-opened here.

This spec is a **recomposition** of the public page, not a CSS patch. It replaces the page's
top-of-page composition with a five-step story, moves the pyramid into the story as its
explanation, collapses three paraphrases of the target date into one plain sentence, relocates the
methodological precision below the fold, removes the figures that have no value, and removes the
structural cause of the empty column.

## Reading order

| # | Task | Why it is here |
|---|---|---|
| T1 | The five-step contract and the top-of-page order | the order every other task plugs into |
| T2 | Step 1 — the number, in plain words | the page's hook |
| T3 | Step 2 — what breaks, one plain line | the hook's consequence |
| T4 | Step 3 — the pyramid moves up and is annotated | "la pirámide manda aquí" |
| T5 | Step 4 — the fuse as a simple percentage | "cuánto camino llevamos" |
| T6 | Step 5 — what it means, and the one action | the page's ask |
| T7 | One plain sentence for the target date | the three paraphrases collapse |
| T8 | The methodological precision relocates into `#metodo` | precision is kept, not deleted |
| T9 | The plain-language gate | makes "no jargon at the top" checkable |
| T10 | Unavailable figures leave the public page | "si no hay número, no hay bloque" |
| T11 | Figures 3–7 are tracked in admin | the tracking the spec asks for |
| T12 | The hero/band composition is retired | the structural cause of the empty column |
| T13 | No empty column at any width, in any locale | the reported defect |
| T14 | Each of the five steps fits one screen | the "cada paso cabe en una pantalla" clause |
| T15 | Visual identity preserved | the instrument must survive |
| T16 | Locale parity for the new and retired keys | five locales, no exception |
| T17 | Retire the layout pins of 001–003, keep the rest | the inherited-criteria work |

T1 is a prerequisite for T2–T6. T7 depends on T2/T8. T12 must land before T13 can be measured
honestly. T17 depends on every other task having decided its final composition.

---

## T1 — The five-step contract and the top-of-page order

One declaration holds the page's five steps, in order, with one id and one anchor each. The page's
lead is composed from that declaration, so the order exists in exactly one place and no component
can disagree with it.

Acceptance criteria:

- A module `web/components/public/top-steps.ts` exports `TOP_STEPS`, a `readonly` array of exactly
  five entries, in this order, with these ids: `number`, `breakage`, `why`, `distance`, `meaning`.
- Each entry exposes a stable `id` (used as the DOM id of its section, prefixed `paso-`) and a
  `headingKey` that resolves from the content model (no literal string in the module).
- `web/components/PublicPage.tsx` renders the five step sections in `TOP_STEPS` order, immediately
  after `<main id="main">` opens.
- No element that is not one of the five step sections renders between `<main>` and the end of the
  fifth step. Specifically absent from that range: `SourceStrip`, any `ProvenanceStrip` (any
  `data-operator="true"` subtree), any `MetricPlate`, `RegisterKey`, and `ReproduceBlock`.
- Each step section is a `<section>` with `aria-labelledby` pointing at its own `<h2>`, and the five
  `<h2>` ids are unique on the page.
- The five step sections are the only elements carrying `data-top-step` on the page.
- Nothing on the page renders before the first step except `site-header` page chrome and the
  existing stale-snapshot banner (`.banner`) — page chrome is not a step.

## T2 — Step 1: the number, in plain words

Step 1 states the wait as one number and one plain sentence. It carries no methodological
footnote, no variant range, no source line and no back-cast.

Acceptance criteria:

- Step 1's day count is read from the committed `countdown` series value (`days` is computed by
  `CountdownClock` from `countdown.anchor` at the render instant, as today); no day count is
  authored or re-derived from a second source.
- Step 1's visible text, with `data-operator="true"` subtrees stripped, consists of exactly: the
  years numeral and its unit, the day count and its label, the three sub-day fields with their
  labels, one plain sentence, and the step's `<h2>`. Nothing else.
- The page's only `<h1>` renders inside step 1, above the day-count group, and its text still
  contains the locale's country name (preserved `AC-001-103` / `AC-002-22`).
- The day numeral keeps the ladder's top step (`--text-num-xl`), and it is the largest numeral on
  the page (preserved `AC-003-02`, `AC-003-03`).
- Step 1 renders none of these content keys: `countdown.definition`, `countdown.range`,
  `countdown.source`, `countdown.backCast`, `countdown.yearLabel`, `countdown.clock.definition`,
  `countdown.clock.arithmetic`.
- When the countdown series is not `computed` (no threshold year, no anchor), step 1 renders the
  plain sentence and no day count, no clock group and no substitute number; the other four steps
  keep their order and no step renders empty (preserved `AC-001-101`, `AC-001-110`).

## T3 — Step 2: what breaks, one plain line

One sentence, in plain words, states the threshold. It is bound to the shared parameter, never
typed.

Acceptance criteria:

- Step 2's markup contains exactly one text block (one `<p>`), resolved from a content key.
- That key's template carries the threshold and the base as placeholders (`{threshold}`, `{base}`),
  resolved from `COUNTDOWN_THRESHOLD` and `100` — not from a literal in the copy.
- The line contains no repository identifier and passes T9's plain-language gate.
- The 50-per-100 statement appears exactly once inside the five steps' visible text (step 2); no
  other step restates it as a number.
- Step 2 renders no chart, no figure, no provenance and no link.

## T4 — Step 3: the pyramid moves up and is annotated

The age structure becomes the page's explanation: it is the third of the five steps, it carries an
annotation that says what to look at, and it loses the four-percentage headline sentence from its
face.

Acceptance criteria:

- The `#demografia` section renders as the third step, after step 2 and before step 4 and
  `#figuras`.
- The step's `<h2>` contains no `%` sign, and the block between the `<h2>` and the first panel
  contains no more than one `%` sign.
- `demography.finding` is not rendered between the step's `<h2>` and the first panel. It renders
  collapsed, inside the step's data-table disclosure, below the panels.
- The six-value readout (`demography__readout`) is not rendered between the `<h2>` and the panels;
  it renders collapsed inside the same disclosure.
- Each of the three panels renders exactly one annotation element (three annotations in total),
  from a content key, naming an age band by its published band label (a value from
  `bandLabel` / `AGE_BANDS`). Annotations are plain sentences and pass T9's gate.
- The `<svg>` panels keep their accessible name and `role="img"` per panel, and the data table is
  still emitted by the same component as the charts (preserved `AC-001-44`, `AC-001-45`,
  `AC-001-97`).
- The pyramids' `ProvenanceStrip` is not inside step 3; it renders inside `#metodo` (T8).
- When the `pyramid` series is not `computed`, step 3 renders nothing at all (no heading, no
  "unavailable" row) and the remaining steps keep their relative order.

## T5 — Step 4: the fuse as a simple percentage

The fuse keeps its drawing and states one thing on its face: how much of the way is gone.

Acceptance criteria:

- Step 4's face label is resolved from a content key whose template contains exactly one
  placeholder, `{percent}`, and no other placeholder. No `{ratio}`, `{year}` or `{threshold}`.
- The rendered label's text contains the whole-percent value computed by `displayPercent` /
  `formatWholePercent` from the committed fuse value, and no other numeral.
- `fuse.label` (the technical label carrying ratio, year and threshold) and `fuse.definition` (which
  names `demo_pjan`) render only inside `#metodo`, never inside step 4.
- The drawn geometry is unchanged: the same `viewBox`, the same cord/burnt rects computed from
  `burnPoint(consumedPercent)`, the `<svg>` still `aria-hidden` with `focusable="false"`.
- The graphic still carries no `role="progressbar"`, no value attribute, no date, and does not move
  while the clock ticks (preserved `AC-003-21`).
- When the `fuse` series has no computed value, step 4 renders nothing and the remaining steps keep
  their relative order (preserved `AC-003-18`).
- The reproduce link (`fuse.reproduce`) does not render inside step 4; `#reproducir` stays
  reachable from `#metodo`.

## T6 — Step 5: what it means, and the one action

The last step is one sentence and one button.

Acceptance criteria:

- Step 5 contains exactly one `<p>` and exactly one `<a>`.
- That anchor's visible text is the `hero.ctaPrimary` string and its `href` is `#figuras`
  (preserved `AC-002-35`).
- That anchor is the only `--accent`-filled action above the fold (preserved `AC-002-31`).
- Step 5 is the fifth and last of the five steps.
- The share row (`ShareRow`) renders after the fifth step, not inside any step, and is present in
  the server HTML and usable without JavaScript (preserved `AC-003-23`).
- `hero.ctaSecondary` / `hero.ctaMethod` still render somewhere on the page with `href="#metodo"`
  (preserved `AC-002-35`'s target); they do not render inside steps 1–5.

## T7 — One plain sentence for the target date

The three paraphrases become one.

Acceptance criteria:

- Within the five steps' visible text (text nodes only, `data-operator="true"` stripped), the
  formatted anchor date (as produced by `formatDate(countdown.anchor, locale, CLOCK_TIME_ZONE)`)
  occurs exactly once.
- The keys `countdown.clock.definition` and `countdown.clock.arithmetic` are not rendered inside
  the five steps, in any locale.
- `countdown.definition` is not rendered inside the five steps.
- The clock group's accessible name (`countdown.clock.a11y`) states the target date in plain words:
  it contains the formatted date, does not contain the string `fecha convencional` (or its
  equivalents in the other four locales), and does not contain the word for "umbral"/"threshold".
- The date occurrence counted above is inside the same step as the day count (step 1), and no other
  step names the date.

## T8 — The methodological precision relocates into `#metodo`

Everything the top drops is still on the page, below the fold, in one region.

Acceptance criteria:

- `#metodo` resolves to a region that renders, in every locale: `countdown.definition`,
  `countdown.yearLabel`, `countdown.range` (when the value publishes a range), `countdown.source`,
  `countdown.backCast` (when the value publishes one), `countdown.clock.definition`,
  `countdown.clock.arithmetic`, `countdown.eyebrow`, `fuse.label`, `fuse.definition`, and the
  provenance strips of the pyramid and the fuse.
- `#metodo` also still contains the register key (`RegisterKey`), so the existing heading it
  provides is unchanged and `AC-001-91` still resolves.
- Every in-page reference to `#metodo` resolves to an existing element id in the rendered document:
  the four `nav.*` anchors, `hero.ctaSecondary`, `hero.ctaMethod`, and any `figure.methodLink`
  remaining on the page.
- The `#metodo` region renders after the fifth step in document order.
- The strings appear verbatim from the content model — the same keys, the same interpolations, no
  paraphrase and no summarising rewrite.
- `demography.finding` and the six-value readout are reachable on the page (inside step 3's
  disclosure per T4) — nothing from `00-informal.md`'s "no se borra" list is lost.

## T9 — The plain-language gate

"No jargon at the top" becomes a build gate, not a review habit.

Acceptance criteria:

- `web/build/public-plain-language.ts` exports a `BANNED_TOP_TERMS` list and a
  `scanTopRegion(html, locale)` function that strips `data-operator="true"` subtrees (reusing
  `stripOperatorSubtrees`) before scanning text nodes **and** `aria-label` / `alt` / `title`
  attribute values.
- `BANNED_TOP_TERMS` covers, in all five locales, at minimum: the "dependency ratio" phrase
  (`ratio de dependencia`, `dependency ratio`, `ratio de dépendance`, `Altersquotient` /
  `Abhängigkeitsquotient`, `rapporto di dipendenza`), the four dataset identifiers `demo_pjan`,
  `ESSPROS`, `spr_exp_pens`, `proj_23np`, and the series-name phrases `proyecciones demográficas`
  plus its four translations.
- The scan also rejects every identifier returned by `internalTermsOf(figures, series)`, so a new
  source or formula id cannot leak by being absent from the hand-written list.
- A build step (`npm run check:plain-language`, wired into `npm run build`) runs the scan against
  the rendered top region of every locale and exits non-zero on any hit.
- The gate exits 1 on a fixture page whose top region carries a banned term, and exits 0 on the
  shipped page in all five locales.
- The gate does not scan `#metodo`, the registers, or any `data-operator="true"` subtree.

## T10 — Unavailable figures leave the public page

No figure without a value appears on the public page.

Acceptance criteria:

- With the committed data (`fig-01`/`fig-02` computed, `fig-03`…`fig-07` `unavailable`), the
  rendered page contains none of: `figure.unavailable.chip`, `figure.unavailable.reason`, any
  `fig.0N.reason`, `pending.heading.one`, `pending.heading.other`, `figure.statusSummary`.
- `#figuras` renders exactly the figures whose `availability === 'computed'`, in `FIGURE_IDS` order.
- `web/components/PendingBlock.tsx` is deleted and no module imports it. `FigureStatusRow` is
  **kept**: `PlateShell` still renders it for a figure that claims `computed` but is promoted to
  `withheld` by `figureState` — that is a data-integrity failure mode, not an unavailable figure,
  and hiding it would silently drop a figure the data says is computed.
- A figure whose `availability` is not `computed` never reaches `#figuras`, so no
  `figure.unavailable.*` or `figure.withheld.*` string renders for the five committed placeholder
  figures.
- `pending.heading.one` and `pending.heading.other` are removed from `REQUIRED_KEYS` and from all
  five locale documents; `figure.unavailable.*` keys stay in `REQUIRED_KEYS` only if something still
  renders them (a series' unavailable state may), otherwise they are removed too.
- With every figure computed (a fixture), `#figuras` renders all seven plates and no other block.
- With zero figures computed (a fixture), the page renders with no `#figuras` content and no empty
  block or heading, and no other region is affected.
- Each rendered plate keeps its chart+table pairing and its provenance (preserved `AC-001-97`,
  `AC-001-105`).

## T11 — Figures 3–7 are tracked in admin

The figures that no longer appear in public are still visible to the operator.

Acceptance criteria:

- The admin panel home (`app/(admin)/admin/(authed)/page.tsx`) renders a per-figure list: one row
  per figure in `FIGURE_IDS` order, carrying the figure id and its `availability`.
- The list is read from the same derived store the panel already reads
  (`createFileDerivedStore().readAll()`); no figure id, count or availability is hard-coded in the
  admin view.
- The list renders all seven figures, including the five `unavailable` ones, and the row count
  equals the derived store's length.
- The list's strings come from `adminT` (the admin content model), not from a literal in the view.
- The admin list is not linked to, referenced by, or rendered on any public route.

## T12 — The hero/band composition is retired

The empty column's structural cause is removed, not edged around.

Acceptance criteria:

- No element on the page carries the class `band` or `hero--band`.
- The rules `.hero--band`, `.band`, `.hero--band > .hero__panel` and
  `.hero--band > .hero__status` are removed from `web/styles/globals.css`; no remaining rule
  declares `grid-column: 2`.
- `web/components/series/CountdownBand.tsx` and `web/components/public/HeroLeadBlock.tsx` are
  deleted or reduced to a module no page composes; the page has exactly one lead path.
- The figure plates (`MetricPlate` for `fig-01`, `fig-02`) render inside `#figuras` only.
- The lead block's provenance facts (`hero.definitionLabel`, `hero.periodLabel`,
  `provenance.source`, `provenance.dataset`) do not render inside the five steps; they render inside
  `#figuras` beside the plate they belong to.
- `web/components/public/Hero.tsx` and `web/components/public/hero-subject.ts` are removed if the
  five-step lead replaces them entirely, or reduced to what `#figuras` still needs; no dead export
  remains (the design-principles gate's dead-code and pass-through heuristics stay clean).
- The page still renders with zero series and zero computed figures without throwing.

## T13 — No empty column at any width 320–1440 px, in any locale

Acceptance criteria:

- In a real Chromium (the existing CDP harness, `tests/helpers/chromium.ts`), for every element
  inside `<main>` whose computed `display` is `grid` and whose resolved `grid-template-columns`
  yields two or more tracks: **no track of width ≥ 8 px is unoccupied**, where unoccupied means no
  in-flow direct child's horizontal bounding box intersects that track's range.
- That assertion passes at widths 320, 360, 390, 768, 1024, 1280, 1366 and 1440 px, each at
  900 px height, in all five locales.
- `document.documentElement.scrollWidth` does not exceed the viewport width at 320 px, in all five
  locales.
- No element inside `<main>` has a computed width of 0 while containing text (a collapsed column
  that is not a deliberate `display: none` disclosure summary).
- The specific retired shape cannot return: no stylesheet rule places a sole child of a
  multi-column grid into a column other than the first, asserted structurally against
  `globals.css`.
- The measured evidence (per width, per locale, the number of grid containers scanned and the
  unoccupied-track count, which must be 0) is printed by the test on failure.

## T14 — Each of the five steps fits one screen

Acceptance criteria:

- In a real Chromium, each of the five step sections' `getBoundingClientRect().height` is less than
  or equal to the viewport height, at each of the three measured viewports the suite already uses:
  390×844, 1366×768 and 1440×900.
- That holds in all five locales.
- Step 3's height is recorded explicitly per locale per viewport (it is the tallest step, and its
  record is the one that catches a regression).
- A closed `details` inside a step counts as its closed height; opening it is not required and no
  step is allowed to hide content to meet the bound (no `display: none` on step content, no
  `overflow: hidden` with a fixed height).
- Steps 1–5 all measure greater than 0.

## T15 — Visual identity preserved

Acceptance criteria:

- Every colour, font-family, font-size, spacing, radius and shadow token in
  `web/styles/tokens.css` keeps its current value in both themes: `--surface-1..3`,
  `--surface-hero`, `--ink-1..3`, `--rule-1/2`, `--accent`, `--on-accent`, `--data-*`,
  `--radius: 0`, `--shadow: none`, `--font-*`, `--text-*`, `--space-*`.
- No rules are added that introduce a new hue: the CSS contains no new `color`/`background`
  declaration whose value is a literal hex, `rgb()`, `hsl()` or named colour outside
  `tokens.css`.
- `--radius` is still `0`, and no new rule declares a non-zero `border-radius` or a `box-shadow`
  other than `none`.
- The 1px rule convention survives: `--border-hair` is still `1px solid var(--rule-1)` and the new
  step section boundaries use it (no heavier separator is introduced).
- The olive/amber relationship is unchanged: `--accent` is still the olive, `--data-projection` is
  still the amber alias set, and no new colour token is added.
- The new CSS declares no literal: every `font-size`, `margin`, `padding`, `gap`, `color` and
  `background` in the new rules resolves a `var(--…)` token.

## T16 — Locale parity for the new and retired keys

Acceptance criteria:

- `REQUIRED_KEYS` is updated with every key T1–T8 introduces and without every key they retire.
- All five locale documents (`es`, `en`, `fr`, `de`, `it`) carry exactly the same key set as
  `REQUIRED_KEYS`: `missingKeys` returns `[]` and `unknownKeys` returns `[]` for each.
- No locale carries a key another locale does not (no asymmetric addition, no asymmetric
  retirement).
- Every new key's value is non-blank in all five locales, and each locale's new values are written
  in that locale's language (not copied Spanish).
- The five public routes still prerender and each document's `<html lang>` matches its locale
  (preserved `AC-003-44`).
- `AC-002-24`'s "exactly 270 keys / no key added, removed or renamed" freeze is superseded: the
  parity rule above replaces it, and its test asserts parity rather than a frozen count.

## T17 — Retire the layout pins of 001–003, keep the rest

The inherited acceptance criteria are split by a stated rule, not by convenience.

**Rule.** A criterion is **retired** when its substance is *where something sits / how tall it is /
in which order it renders / which grid holds it / which fold edge it clears*. A criterion is
**preserved** when its substance is *a value, an accuracy property, an accessibility property, a
traceability property or a reproducibility property*. A criterion is **superseded** when its
substance is preserved but its subject (the band, the pending block, the inline provenance) no
longer exists.

**Retired** (no test may cite these ids after this spec): `AC-001-107`, `AC-002-09`, `AC-002-10`,
`AC-002-11`, `AC-002-12`, `AC-002-16`, `AC-002-18`, `AC-002-19`, `AC-002-20`, `AC-002-21`,
`AC-002-29`, `AC-002-30`, `AC-002-36`, `AC-003-01`, `AC-003-06`, `AC-003-10`, `AC-003-48`,
`AC-003-49`, `AC-003-50`.

**Superseded** (subject removed; substance carried by this spec's scenarios): `AC-002-24` (key
freeze → T16), `AC-003-39`, `AC-003-40`, `AC-003-42` (pending block → T10), `AC-003-51` (inline
collapse → T8).

**Re-pointed, not retired** (the criterion stands; the element it names moved): `AC-001-111`
(no-JS completeness — the centring clause inside it is dropped with `AC-002-16`), `AC-002-31`,
`AC-002-32`, `AC-002-35` (CTA hierarchy → step 5), `AC-003-02`, `AC-003-03`, `AC-003-04`
(numeral hierarchy → step 1), `AC-003-05` (anchor + both disclosures retained → they render in
`#metodo`), `AC-003-09` (clock behaviour unchanged, re-read as unchanged by *this* recomposition
rather than by the band), `AC-003-28` (copy-link still writes the canonical URL, now from the
share row that follows step 5).

**Preserved unchanged**: everything else, and in particular the accuracy, accessibility,
traceability and reproducibility criteria — all of `AC-001-01`…`-10`, `-11`…`-32`, `-33`…`-35`,
`-37`…`-45`, `-46`…`-73`, `-74`…`-78`, `-81`, `-91`, `-92`, `-97`, `-98`…`-101`, `-102`…`-106`,
`-108`…`-110`, `-112`…`-117`, and `AC-002-01`…`-08`, `-13`, `-14`, `-15`, `-17`, `-22`, `-23`,
`-25`…`-28`, `-33`, `-34`, `AC-003-07`, `-08`, `-11`…`-38`, `-41`, `-43`…`-47`.

Acceptance criteria:

- No test file in `tests/` cites a retired id. `grep -rn 'AC-001-107\|AC-002-09\|…' tests/`
  returns nothing for every id in the retired list.
- Every preserved id still has at least one test citing it, and that test passes.
- `scripts/check-scenario-traceability.sh` exits 0: every `AC-004-*` id is cited by a test, every
  citation resolves, and no retired id is cited.
- `tests/acceptance/first-viewport.test.ts` no longer asserts the retired geometry constants
  (`436.52`, `613.28`, `--measure-face: 17.5rem`, the 50 px clearance table, the "exactly 270 keys"
  count); its surviving describes are re-pointed to preserved ids or removed with the id they
  carried.
- `tests/acceptance/countdown-band.test.ts` and `tests/acceptance/countdown-band-browser.test.ts`
  are split: the describes for retired ids are removed, the describes for re-pointed ids are
  rewritten against the new composition and keep their id.
- `tests/acceptance/pending.test.ts` is deleted with `AC-003-39`/`-40`/`-42`; the assertions it
  carried that survive (computed plates keep their order and provenance) move to the `#figuras`
  test under a preserved or new id.
- No gate configuration is changed to make any of this pass: `--measure-face` and the other fold
  tokens may change their *value* with a recorded re-measurement, but no contrast, complexity,
  coverage or mutation threshold is lowered.

## Scenario index

Seventy-nine scenarios, `AC-004-01` … `AC-004-79`, defined in `20-acceptance/` (one file per
task).

| Task | File | Scenarios |
|---|---|---|
| T1 | `AC-004-five-step-order.md` | 01–05 |
| T2 | `AC-004-number-step.md` | 06–09 |
| T3 | `AC-004-breakage-step.md` | 10–12 |
| T4 | `AC-004-pyramid-step.md` | 13–19 |
| T5 | `AC-004-fuse-step.md` | 20–23 |
| T6 | `AC-004-meaning-step.md` | 24–28 |
| T7 | `AC-004-one-date.md` | 29–32 |
| T8 | `AC-004-method-below-fold.md` | 33–37 |
| T9 | `AC-004-plain-language-gate.md` | 38–41 |
| T10 | `AC-004-unavailable-figures-hidden.md` | 42–46 |
| T11 | `AC-004-admin-figure-tracking.md` | 47–49 |
| T12 | `AC-004-hero-retired.md` | 50–54 |
| T13 | `AC-004-no-empty-columns.md` | 55–59 |
| T14 | `AC-004-one-screen-per-step.md` | 60–63 |
| T15 | `AC-004-visual-identity.md` | 64–68 |
| T16 | `AC-004-locale-parity.md` | 69–73 |
| T17 | `AC-004-retired-criteria.md` | 74–79 |

---

## Open questions

None of these blocks `/build` — each carries a stated default that satisfies every constraint in
`00-informal.md`, and each should be confirmed at the human gate.

1. **Where the `<h1>` lives among the five steps.** "Nada más arriba del pliegue que estos cinco"
   and "the page keeps exactly one `<h1>` naming the country" (`AC-001-103`, `AC-002-22`) collide
   if the `<h1>` is a sixth element. **Default taken:** the `<h1>` is step 1's own heading, directly
   above the day-count group, so it is inside the five rather than above them.
2. **Whether the clock's years numeral and sub-day fields stay inside step 1.** The five steps name
   only `Faltan 5 539 días`. **Default taken:** they stay (nothing in the informal spec removes
   them; removing the current clock would be a new requirement), with the years numeral and the
   four fields inside step 1's number group and all methodological prose removed from it.
3. **"la mecha como barra simple"** — a new graphic or a simpler label? **Default taken:** the
   drawing is unchanged (it already reads as a bar at 62 %) and the *label* simplifies to the whole
   percent; the `role="progressbar"` ban of `AC-003-21` is preserved.
4. **Where the share row goes**, given the fold holds only the five steps. **Default taken:**
   directly after step 5, still in the server HTML and usable without JavaScript.
5. **What `#metodo` now means.** It currently points at `RegisterKey`. **Default taken:** `#metodo`
   becomes the region that opens with the relocated methodological precision and still contains the
   register key, so every existing in-page reference keeps resolving.
6. **What "one screen" means for T14.** **Default taken:** the three viewports the acceptance suite
   already measures — 390×844, 1366×768, 1440×900.

## Out of scope

- Any change to what the countdown counts to (1 January 2042) or to any derived value, manifest,
  source or formula.
- Any change to the admin security model, the audit log, or the revision workflow.
- Any new language, and any translation of existing copy beyond what the new plain-language keys
  require.
- Deleting the method, sources, four-voice, debate or assumptions content. It is reordered and
  collapsed, never removed.
- Retiring `AC-002-31`…`-35` (CTA hierarchy) — the hierarchy survives at step 5.

## Acceptance scenarios

## AC-004-01 — The five steps exist, in the stated order, from one declaration
## AC-004-02 — Nothing else renders above the fifth step
## AC-004-03 — Each step is a labelled section with its own heading
## AC-004-04 — The step stack precedes the figures
## AC-004-05 — The page chrome is not a step
## AC-004-06 — The day count comes from the committed countdown
## AC-004-07 — Step 1 carries the number and one plain sentence, nothing else
## AC-004-08 — The `<h1>` is step 1's heading and still names the country
## AC-004-09 — No threshold year, no number, and no empty step
## AC-004-10 — One sentence, bound to the shared parameter
## AC-004-11 — The threshold statement is stated once at the top
## AC-004-12 — Step 2 adds nothing but the sentence
## AC-004-13 — The pyramid is the third step and precedes the figures
## AC-004-14 — No four-percentage headline on the pyramid's face
## AC-004-15 — The finding sentence and the readout survive, collapsed, below the panels
## AC-004-16 — Three panels, one annotation each, naming a band
## AC-004-17 — Accessibility of the chart is unchanged by the move
## AC-004-18 — The pyramid's provenance is not in step 3
## AC-004-19 — No pyramid series, no step
## AC-004-20 — The face states one quantity
## AC-004-21 — The technical label and the dataset name leave the step
## AC-004-22 — The drawing is unchanged and still implies nothing
## AC-004-23 — No fuse value, no step
## AC-004-24 — One sentence and one button
## AC-004-25 — The action is the page's primary promise
## AC-004-26 — Step 5 closes the story
## AC-004-27 — The share row follows the steps and works without JavaScript
## AC-004-28 — The secondary action survives, outside the steps
## AC-004-29 — The target date is named once at the top
## AC-004-30 — The three paraphrases are gone from the top
## AC-004-31 — The clock's accessible name is plain
## AC-004-32 — The date and the arithmetic survive below the fold
## AC-004-33 — Every dropped precision string is still on the page
## AC-004-34 — The strings are the content model's, not a rewrite
## AC-004-35 — `#metodo` keeps the register key
## AC-004-36 — Every in-page reference to `#metodo` resolves
## AC-004-37 — The method region is below the fold content
## AC-004-38 — The gate exists, with the named terms in five languages
## AC-004-39 — The shipped top region passes in every locale
## AC-004-40 — The gate fails on jargon
## AC-004-41 — The gate sees attribute copy and repository identifiers
## AC-004-42 — No figure without a value appears
## AC-004-43 — `#figuras` renders exactly the computed plates, in order
## AC-004-44 — The pending block is gone, the withheld row is kept
## AC-004-45 — Every figure computed renders every plate
## AC-004-46 — Zero computed figures is a page, not a hole
## AC-004-47 — The admin panel lists every figure and its availability
## AC-004-48 — The list is data, not a literal
## AC-004-49 — The five unavailable figures are visible to the operator only
## AC-004-50 — The band is gone
## AC-004-51 — One lead path
## AC-004-52 — The figure plates live in `#figuras`
## AC-004-53 — The lead's provenance facts move to the figures
## AC-004-54 — No dead hero surface
## AC-004-55 — No unoccupied grid track on the page
## AC-004-56 — The guarantee holds at every measured width
## AC-004-57 — The guarantee holds in all five locales
## AC-004-58 — No horizontal overflow at the 320 floor
## AC-004-59 — The retired shape cannot return structurally
## AC-004-60 — Every step fits the viewport at the three measured sizes
## AC-004-61 — Every step fits in every locale
## AC-004-62 — The tallest step's record is kept
## AC-004-63 — Nothing is hidden to meet the bound
## AC-004-64 — The palette and the type scale are untouched
## AC-004-65 — Radius, shadow and the rule weight are unchanged
## AC-004-66 — No new hue, no new colour token
## AC-004-67 — The new rules are token-only
## AC-004-68 — The contrast pairs still pass
## AC-004-69 — `REQUIRED_KEYS` matches what the page renders
## AC-004-70 — All five locales carry exactly the required set
## AC-004-71 — Every new key is translated, not copied
## AC-004-72 — Five routes, five languages
## AC-004-73 — Parity replaces the key freeze
## AC-004-74 — No retired id is cited by a test
## AC-004-75 — Every preserved id still has a passing test
## AC-004-76 — Scenario traceability is green
## AC-004-77 — The retired geometry constants are gone from the tests
## AC-004-78 — The band tests are split, not silently weakened
## AC-004-79 — No gate is lowered to make any of this pass

## Verification

# 25-verification — 004-plain-countdown (stage 4)

- Re-verification: **attempt 1, phase 1** (pre-PR loop; `SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=0`, `SPEC_PHASE2_RETRIES=0`)
- Re-verification: **attempt 2, phase 1** (`SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=1`, `SPEC_PHASE2_RETRIES=0`) — scoped to check 5 only
- Branch: `spec/004-plain-countdown`
- Verdict, current standing: **PASS** — attempt 1 failed check 5 only; attempt 2 re-ran check 5 and it passed.
  Attempt 1's report is preserved below verbatim as history; its verdict lines describe attempt 1, not the
  current standing. The current verdict is §Verdict (attempt 2) at the end of this file.

I wrote no production code and fixed nothing. I re-executed every claim made by stage 2
(Coder) and stage 3 (Refactorer) rather than reading it, and everything below is a
transcription of a real run.

## Summary of the five contract checks

| # | Check | Result | exit |
|---|---|---|---|
| 1 | scenario traceability | PASS | 0 |
| 2 | full test suite | PASS | 0 |
| 3 | complexity gate | PASS | 0 |
| 4 | design-principles gate | PASS at diff scope (0 FAIL / 5 WARN) — the in-place invocation exits **141** (tooling failure, §OOS-1) | 141 in place; 0 on the re-execution |
| 5 | scenario-to-behavior spot check | attempt 1: **FAIL** (2 scenarios) → attempt 2: **PASS** | n/a (analysis) |

---

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh
exit: 0
at: 2026-11-01T15:46:39Z

Scenario IDs found: 79 live, 186 archived

PASS AC-004-01 — traced to a test
PASS AC-004-02 — traced to a test
PASS AC-004-03 — traced to a test
PASS AC-004-04 — traced to a test
[… 72 more PASS lines, AC-004-05 … AC-004-79, same format …]
PASS AC-004-79 — traced to a test


✔ Scenario traceability check: every scenario traced, every reference resolves.

The project's own pre-build variant of the same check was also run, because it is the one
wired into `npm run build`:

command: ./node_modules/.bin/tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-11-01T15:46:34Z

scenario traceability (2-3 digit ids): 285 scenarios, all cited, all citations resolve

## Evidence: full test suite

command: npm test
exit: 0
at: 2026-11-01T15:40:36Z

> pensions-system@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  86 passed (86)
      Tests  923 passed (923)
   Start at  16:40:36
   Duration  25.29s (tests 82%, import 14%, transform 3%, environment 1%, worker 1%)

    Isolate  86 workers spawned · ~290ms startup each (spawn + environment, per file)
             at least ~1.98s faster with isolate: false — reuses workers across files instead of one per file

86 files / 923 tests matches the Refactorer's claim exactly. Nothing is skipped or disabled:
`grep -rnE "\.(skip|todo|only|fails)\b|xit\(|xdescribe\(" tests/` returns **zero** hits, and the
conditional suites were proved to have really executed rather than silently skipped —
`vitest run tests/acceptance/no-empty-columns.test.ts tests/acceptance/one-screen-per-step.test.ts`
reported `8 passed (8)` with real per-test timings (1.0 s / 5.1 s / 9.3 s / 3.1 s against real
Chromium), and `BUILD_PRESENT` is true (`.next/server/app` exists) with `/usr/bin/google-chrome`
present.

## Evidence: complexity gate

command: npm run lint
exit: 0
at: 2026-11-01T15:41:12Z

> pensions-system@0.0.0 lint
> eslint .

`eslint.config.mjs` carries `complexity: ['error', 6]`, so a clean run is the ≤6 cyclomatic
bound holding over every linted source file. `.next/**` and `.standards/**` are in the config's
`ignores`, which is correct for linting purposes: this gate judges the repo's own source.

The design-principles gate's independent `complexity` category agrees (see the two blocks
below): `PASS Complexity/KISS (java): no violations found` and no `Cyclomatic complexity >6`
FAIL inside the tree under review.

## Evidence: design-principles gate

command: .standards/scripts/check-code-principles.sh --tier production
exit: 141
at: 2026-11-01T15:41:18Z

Checking design principles in: . (tier: production)

PASS Complexity/KISS (java): no violations found
WARN Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:45:71:main:KISS_LINES=28
WARN Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:101:124:checkCompensationPairs:KISS_LINES=25
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:48:67:ActionForms:KISS_LINES=21
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:69:91:ProposalPage:KISS_LINES=23
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:35:67:ReviewTable:KISS_LINES=26
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx:7:34:RefreshPage:KISS_LINES=28
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:59:84:PendingTable:KISS_LINES=24
WARN Method body >20 lines (node): ./app/(admin)/admin/login/page.tsx:5:30:LoginPage:KISS_LINES=26
FAIL Cyclomatic complexity >6 (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10
[… elided: 27 lines of the same FAIL/WARN shape, all inside ./.next/… build output …]
WARN Method body >20 lines (node): ./web/components/registers/ThesisSection.tsx:19:43:ThesisSection:KISS_LINES=22
WARN Method body >20 lines (node): ./web/components/share/ShareRow.tsx:62:88:ShareRow:KISS_LINES=24
WARN Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:36:64:FigureStatusRow:KISS_LINES=27

--- DRY ---

[59 lines total; the process then died with SIGPIPE — exit 141, no verdict line, the DRY section
never completed. The diff-scoped form of the same command fails identically:]

command: .standards/scripts/check-code-principles.sh --tier production -BaseRef main
exit: 141
at: 2026-11-01T15:41:44Z

Checking design principles in: . (tier: production)

PASS Complexity/KISS (java): no violations found
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:59:84:PendingTable:KISS_LINES=24
WARN Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21

--- DRY ---

This is a **tooling failure, not a finding**: 141 is 128+13 (SIGPIPE), the run produced no
verdict, and §OOS-1 records the defect. Because a non-zero exit for a non-finding reason is
never a pass, I did not stop at the abort and did not reason about what the script "would have"
said — I executed the same script, at the same tier, with the same gate set, against the same
tree with the untracked build directory (`.next/`, gitignored, 0 tracked files, 194 generated
`.js` files) removed from the scan set. That is the tree the gate is chartered to audit.

## Evidence: design-principles gate (supplementary execution — source-only tree)

command: .standards/scripts/check-code-principles.sh --tier production /tmp/opencode/verif/src-only
exit: 1
at: 2026-11-01T15:46:58Z

Checking design principles in: /tmp/opencode/verif/src-only (tier: production)

FAIL Cyclomatic complexity >6 (node): /tmp/opencode/verif/src-only/.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10
[… 37 WARN lines, none inside this repo's own source: the same KISS_LINES set printed above,
   plus WARN Empty method body (java) in .standards/ci/templates/archunit/{Saga,Outbox}ArchRules.java
   and WARN SRP: possible god file (node) — web/content/keys.ts: 408 lines, 0 methods …]

✘ Design-principles check: 1 FAIL(s), 37 WARN(s).
  Reference: docs/CODING_CONVENTIONS.md §Design Principles, docs/ARCHITECTURE.md, docs/TESTING.md

**1 FAIL / 37 WARN — exactly the Refactorer's reported whole-tree number.** The single FAIL is
`./.standards/skills/hallmark/site/examples/cobalt-01/script.js` (§OOS-2: verified pre-existing
and unreachable from this change).

command: .standards/scripts/check-code-principles.sh --tier production -BaseRef main
exit: 0
at: 2026-11-01T15:46:58Z

Checking design principles in: . (tier: production)

PASS Complexity/KISS (java): no violations found
WARN Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:59:84:PendingTable:KISS_LINES=24
WARN Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21

--- DRY ---
WARN Possible duplication (4x identical 4-line block, first at ./app/(admin)/admin/(authed)/page.tsx:80): </tbody> /</table> /); /))}
WARN Possible duplication (3x identical 4-line block, first at ./app/(admin)/admin/(authed)/page.tsx:79): ))} /</tbody> /</table> /</tr>

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
WARN SRP: possible god file (node) — ./web/content/keys.ts: 408 lines, 0 methods (split by responsibility)
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

✔ Design-principles check: 0 FAIL(s), 5 WARN(s).
  WARNs are review hints — verify each before merging.

**0 FAIL / 5 WARN — exactly the Refactorer's reported diff-scoped number, reproduced.** Every
FAIL/WARN line above is verbatim. None of the 5 WARNs is a defect on review:

- The two `Possible duplication` hits are JSX closing boilerplate (`</tbody></table>` plus the
  map-closing parentheses) shared by four independently-shaped admin tables. Different columns,
  different row models, no shared reason to change — the DRY gate's own rule
  (`docs/CODING_CONVENTIONS.md` §DRY) says not to consolidate these.
- The two `KISS_LINES` hits are methods that already existed and were touched by T11's edit to
  the same file; `PendingTable` (24 lines) is 4 lines over the guideline.
- `web/content/keys.ts` at 408 lines is the content-key registry; it is a list, not logic, and
  splitting it would be the artificial split §SRP warns against.

## Evidence: scenario-to-behavior spot check

command: manual inspection of specs/004-plain-countdown/20-acceptance/*.md against the tests that cite each id, plus an independent Chromium measurement (see below)
exit: 1
at: 2026-11-01T15:48:16Z

Four scenarios checked across four different steps of the story. Two assert what their
scenario says; two do not.

### Checked and sound — AC-004-06 (step 1, number formatting)

`tests/acceptance/story-steps.test.ts:26-43`. The scenario says the day count equals the
committed anchor's count read at the pinned instant, the numeral sits on `--text-num-xl`, and it
is larger than the `<h1>`. The test computes `readClock(countdownValue().anchor, nowMs).days` and
asserts that exact numeral is in step 1's markup, and asserts `clock__value--days` occurs exactly
once (no second source of days). Sound, and it would fail if the day count were hard-coded.

Caveat (recorded, not a failure): the "largest numeral on the page" clause is asserted from the
**CSS declarations** (`--text-num-xl` maxes at 5rem, `--text-display` at 4rem), not from the
rendered value — the same substitution that went wrong twice at the design stage. I therefore
measured it myself in a real Chromium against `next start` on the built app:

    {"locale":"es","size":"390x844","dayFontPx":44,"h1FontPx":40,...}
    {"locale":"es","size":"1366x768","dayFontPx":80,"h1FontPx":64,...}
    {"locale":"es","size":"1440x900","dayFontPx":80,"h1FontPx":64,...}
    {"locale":"de","size":"390x844","dayFontPx":44,"h1FontPx":40,...}
    {"locale":"de","size":"1366x768","dayFontPx":80,"h1FontPx":64,...}
    {"locale":"de","size":"1440x900","dayFontPx":80,"h1FontPx":64,...}

The claim holds at every measured viewport in both locales (44 > 40, 80 > 64). The test's proxy
is correct even though it is a proxy.

### Checked and sound — AC-004-01…05 / AC-004-26 (ordering)

`tests/acceptance/five-step-order.test.ts` and `story-steps.test.ts:233-239` assert the exact
`data-top-step` sequence `['number','breakage','why','distance','meaning']` from the rendered
markup and that exactly five elements carry the attribute — the criterion T1 states. A sixth
section or a reordering fails it.

### FAILING SPOT CHECK — AC-004-59 (T13, the structural backstop)

`tests/acceptance/no-empty-columns.test.ts:103-119`. The scenario has two `Then` clauses:

1. "no rule places a sole grid child into a column other than the first" — **asserted, and
   generally**: every `grid-column:` value in `globals.css` must be `1 / -1` or `auto`, every
   `grid-area:` must be `auto`. I confirmed the retired shape is really gone
   (`grep -n "grid-column" web/styles/globals.css` → only `1 / -1` at lines 1394 and 1431; no
   `grid-column: 2` anywhere). This half is the general property and it is done right.
2. "no rule declares a two-column track list on an element that the page renders with a single
   child" — **not asserted. The assertion is vacuous.**

```js
const templates = [...CSS.matchAll(/grid-template-columns:\s*([^;]+);/g)].map((match) => match[1]?.trim() ?? '');
for (const template of templates) {
  expect(template, template).not.toContain('grid-template-areas');
}
```

The capture group is the *value* of `grid-template-columns` (e.g. `1fr auto`, `repeat(3,
minmax(0, 1fr))`). Such a value can never contain the string `grid-template-areas`, so the
assertion can never fail for any stylesheet — `templates` is computed and then used only in a
tautology. The test is titled "no rule pins a child to a column other than the first" and is
cited by AC-004-59, but its second clause is dead.

This matters more than a normal dead assertion because it is the belt-and-braces for the exact
defect this spec exists to fix: the runtime scan (AC-004-55/56/57) only covers `es` at
320/360/1024/1280/1366 and all five locales at 390/768/1440, so a void that appears only at an
unscanned width in a non-`es` locale would be caught by nothing. **A test that passes for the
wrong reason.** Routed to the Coder (test behaviour).

### FAILING SPOT CHECK — AC-004-72 (T16, locale routing)

`tests/acceptance/locale-parity.test.ts:75-83`. Scenario:

> Given the production build / Then five public routes prerender successfully / And each served
> document's `<html lang>` matches its locale / And no locale 404s

```
it('AC-004-72: each locale renders a document whose lang matches', () => {
  for (const locale of LOCALES) {
    const html = storyPage(locale);
    expect(html, locale).toContain('data-top-step="number"');
    expect(strings(locale)['site.skipLink'], locale).not.toBe('');
  }
});
```

`storyPage()` renders the `PublicPage` component with `renderToStaticMarkup` — there is no
document, no `<html>` element and no HTTP response in it. The test's own name promises "a
document whose lang matches" and the body asserts no lang at all, and nothing about a 404. The
second assertion (a non-empty `site.skipLink`) is not one of the scenario's clauses.

The *behaviour* is verified elsewhere — `tests/acceptance/served-document.test.ts` serves every
route from `next start`, asserts each route's `<html lang>` and asserts an unknown locale answers
404 — but that file cites `AC-001-52`, not `AC-004-72`. So no shipped behaviour is unverified;
what is false is the mapping this id's citation claims. Routed to the Coder (test behaviour);
fix is either asserting the served lang here or re-pointing the scenario to the test that does.

---

## The retirements are legitimate (T17)

I did not take "19 retired, 5 superseded" on trust. I diffed the id *set* cited under
`tests/` at `HEAD` against the id set cited now:

    comm -23 <(git grep -rhoE "AC-[0-9]{3}-[0-9]{2,3}" HEAD -- tests/ | sort -u) \
             <(grep -rhoE "AC-[0-9]{3}-[0-9]{2,3}" tests/ | sort -u)

Exactly **24** ids lost all their citations, and they are exactly T17's lists:

- the 19 **retired**: `AC-001-107`, `AC-002-09`, `-10`, `-11`, `-12`, `-16`, `-18`, `-19`,
  `-20`, `-21`, `-29`, `-30`, `-36`, `AC-003-01`, `-06`, `-10`, `-48`, `-49`, `-50`;
- the 5 **superseded**: `AC-002-24`, `AC-003-39`, `-40`, `-42`, `-51`.

No id outside those two lists was retired, and `grep` for each retired id under `tests/`
returns 0 for all 24 — so nothing was deleted merely to reach green, and no *preserved* id lost
its last citation.

I also checked that the re-pointed ids were re-pointed rather than gutted, because that is where
a green-washing edit would hide. Sample:

- `AC-003-02/03/04` (`tests/acceptance/countdown-band.test.ts:61-105`) keep 2, 2 and 3 tests,
  each asserting the ladder declarations *and* the rendered markup (`expect(html).not.toContain('hero__value')`).
- `AC-001-109` (`tests/acceptance/clock.test.ts:137-181`) keeps 3 tests, two of them looping all
  five locales over seven disclosure slots.
- `AC-001-113` (`clock.test.ts:285-308`) keeps 4 tests — aria-hidden field counting, no
  live-region attributes, group labelling, and accessible-tree stability across motion modes.
- `AC-002-35` (`tests/acceptance/cta-hierarchy.test.ts:149-180`) keeps 3 tests, now against step
  5 and the after-story strip.

And the whole-tree search the project's own gate performs agrees
(`scripts/check-scenario-traceability-3digit.ts` `RETIRED_SCENARIOS` is byte-for-byte T17's 24
ids, and it only removes them from the "untested" demand; citing a retired id remains an error).

## Stage-claim reconciliation

### (a) The remaining whole-tree FAIL is pre-existing and unreachable from this change — CONFIRMED

- `script.js` is tracked in the submodule and unmodified in the submodule working tree:
  `git -C .standards status --short skills/hallmark/site/examples/cobalt-01/script.js` → empty.
- It was last touched by a submodule commit, `30bec2d 2026-10-15 feat(standards): add Angular,
  Ionic, Python/FastAPI and Rust stack guides (#80)` — three weeks before this branch.
- `git -C .standards stash list` → empty (nothing hidden there).
- This branch does not touch it and does not move the submodule pointer: `git diff --stat --
  .standards` is `0 insertions(+), 0 deletions(-)`, and `git diff HEAD --submodule=log --
  .standards` reports only "Submodule .standards contains modified content" (the pre-existing
  local edit to `.standards/agents/spec-ux.md` and the untracked `.standards/skills/laws-of-ux/`,
  neither of which is spec-004 code).
- It is a demo asset inside the standards repo (`skills/hallmark/site/examples/`), not reachable
  from any code this repo runs.

### (b) The SIGPIPE abort is a real defect in the gate script — CONFIRMED

`check_dry()` ends with:

    done | sort -rn | head -10 > "$tmp"

`head -10` closes the pipe as soon as it has ten lines; `sort` then dies of SIGPIPE; `set -o
pipefail` + `set -e` turn that into the script's own exit status. The abort only fires when the
DRY candidate stream yields more than ten groups — which is what `.next/` (66 MB, 194 generated
`.js` files) supplies. Isolation:

- `--gates dry .` → 141 (aborts at DRY);
- `--gates dry web` → `0 FAIL(s), 10 WARN(s)`, exit 0 — completes, and stops at exactly 10
  because that is `head -10`;
- the same whole-tree run against the tree with `.next/` removed → completes, exit 1.

The defect is older than this spec: `git -C .standards blame -L 709,714` puts the `sort -rn |
head -10` line in submodule commit `b3d5a757`, dated 2026-08-12. A second, related defect in the
same function's inputs: `GREP_EXCLUDES` and `FIND_PRUNE` exclude `node_modules`, `target`,
`vendor`, `.git`, `dist` and `build`, but **not** `.next` — which is why the in-place run scanned
194 generated files and produced three bogus FAILs against vendored Next.js runtime code
(`.next/server/chunks/…:CC=47`). Both are recorded as out-of-scope findings (§OOS-1) with a
follow-up spec proposed; nothing in this branch can fix a submodule script, and `Gate config is
off-limits to agents` cuts both ways.

Consequence for the record: the Refactorer's reported diff-scoped number is **only** reproducible
with the build directory absent. In the repo's post-`npm run build` state the canonical command —
in both scopes — aborts, so the reported "0 FAIL / 5 WARN" was produced in a state that differs
from the one this branch is committed in.

### (c) The eight orphan tokens are kept because tests pin them — FALSE for four of eight

The claim: 8 tokens lost their last consumer and were deliberately kept because existing tests
assert they stay declared. Verified one by one (`grep -rn -- "--<token>" tests/` plus the token
lists in `tests/acceptance/visual-identity.test.ts`):

| token | consumer in `globals.css` | pinned by a test? |
|---|---|---|
| `--text-h3` | none | **yes** — `visual-identity.test.ts:40` (`AC-004-64`) |
| `--measure-face` | none | **yes** — `first-viewport.test.ts:54` asserts the declaration survives |
| `--text-clock-sub` | none | **yes** — `countdown-band.test.ts:95` asserts it is *not* used |
| `--rule-projection` | none | **yes** — `projection-colour.test.ts:34` (`--rule-projection: 3px`) |
| `--text-clock-days` | none | **no test cites it anywhere** |
| `--text-band-years` | none | **no test cites it anywhere** |
| `--band-pad-block` | none | **no test cites it anywhere** |
| `--hero-min-h` | none | **no test cites it anywhere** |

The last four are genuinely orphaned: their only pinning test was the one T17 retired with
`AC-001-107` (`first-viewport.test.ts` used to assert `--hero-min-h: 560px` and
`min-height: var(--hero-min-h)` on the retired `.hero` rule). Keeping them is still *permitted* —
T15 requires every token in `tokens.css` to keep its value — but the stated justification does
not hold for half the list, and nothing now pins those four against a silent edit. Recorded as
WARN (§W-3), not a blocker: no behaviour depends on them.

## Measured, not asserted

`15-design.md` and several tests state rendered geometry. I re-measured the load-bearing ones in
real Chromium (headless, via the repo's own CDP helper) against `next start` on the built app:

    {"locale":"es","size":"390x844","steps":[{"id":"number","h":513},{"id":"breakage","h":371},{"id":"why","h":744},{"id":"distance","h":187},{"id":"meaning","h":416}],"viewportH":844}
    {"locale":"es","size":"1366x768","steps":[{"id":"number","h":471},{"id":"breakage","h":272},{"id":"why","h":631},{"id":"distance","h":199},{"id":"meaning","h":309}],"viewportH":768}
    {"locale":"es","size":"1440x900","steps":[{"id":"number","h":471},{"id":"breakage","h":279},{"id":"why","h":631},{"id":"distance","h":201},{"id":"meaning","h":314}],"viewportH":900}
    {"locale":"de","size":"390x844","steps":[{"id":"number","h":584},{"id":"breakage","h":340},{"id":"why","h":744},{"id":"distance","h":210},{"id":"meaning","h":447}],"viewportH":844}
    {"locale":"de","size":"1366x768","steps":[{"id":"number","h":537},{"id":"breakage","h":272},{"id":"why","h":631},{"id":"distance","h":199},{"id":"meaning","h":348}],"viewportH":768}
    {"locale":"de","size":"1440x900","steps":[{"id":"number","h":537},{"id":"breakage","h":279},{"id":"why","h":631},{"id":"distance","h":201},{"id":"meaning","h":354}],"viewportH":900}

- T14 holds in my own measurement: every step ≤ its viewport, in both locales at all three
  viewports; step 3 (`why`, 744 px at 390×844) is the tallest and still clears the fold by 100 px.
- The primary action measures 221×52 px (`es`) and 227×52 px (`de`) — above the 44 px target floor.
- `<html lang>` measured `es` and `de` on the two routes I opened.

**A trap I hit and am recording so no later stage wastes a round on it:** the dev server listening
on `http://localhost:3000` is serving the **pre-004 composition** — `curl -s
http://localhost:3000/` still emits `class="band"` and `hero--band` and no `data-top-step`. Any
geometry measured there is a measurement of the old page. All numbers above come from a fresh
`next start` over the built `.next`, which is the same app `no-empty-columns.test.ts` and
`one-screen-per-step.test.ts` measure.

Related, minor: `AC-004-62` requires step 3's height to be "recorded explicitly per locale per
viewport". The test builds a `records` array of exactly those 15 strings and then asserts only
its length — nothing is printed or persisted, so the record cannot be quoted from the run. The
numbers above are what that record should have contained.

## The plain-language gate is not vacuous — reproduced

`scripts/check-plain-language.ts` is wired into `prebuild` (and therefore into `npm run build`).

    $ npm run check:plain-language
    plain-language gate: clean (5 locales)                     → exit 0

I mutated a copy of the tree (rsync into `/tmp/opencode/verif/gate-mut`, `node_modules`
symlinked, no tracked file touched) by appending `proj_23np` to the Spanish
`steps.number.sentence` — a single dataset identifier inside the story region:

    $ ./node_modules/.bin/tsx scripts/check-plain-language.ts
    es: proj_23np — …mayor alcanza la proporción que explica el paso siguiente. proj_23np</p></section><section class="step step--breakage"…
    plain-language gate: 1 hit(s) in the story                  → exit 1

So the gate fails when it should, names the locale, the term and the surrounding context, and
exits 1. It also exits 0 on the shipped page in all five locales. `scanTopRegion` scans the raw
region string, so `aria-label`/`alt`/`title` values are in scope by construction, and
`data-operator="true"` subtrees are stripped before scanning. Not vacuous.

## No unaccounted behavior

Finding lines, not a command:

- Every new module maps to a task: `top-steps.ts` / `TopStepSection.tsx` / `PublicStory.tsx` → T1;
  `NumberStep` → T2; `BreakageStep` → T3; `PyramidStep` → T4; `DistanceStep` → T5; `MeaningStep` /
  `StoryStrip` → T6–T7; `MethodRegion` / `CountdownPrecision` → T8; `public-plain-language.ts` →
  T9; `FiguresRegion` → T10; `web/admin/views/FigureTable.tsx` → T11; `SubjectFacts` → T12.
- Deletions map to T10/T12 (`PendingBlock.tsx`, `Hero.tsx`, `HeroLeadBlock`, `hero-subject.ts`,
  `CountdownBand.tsx`); no module imports any of them and no dead export remains.
- The one piece of the diff that is not directly task-shaped is the Refactorer's extraction of
  `SummaryList` / `PublishedSummary` out of `PanelHome` in `app/(admin)/admin/(authed)/page.tsx`
  — a KISS fix for the `KISS_LINES` WARN on the file T11 edited. Same file, same behaviour,
  accounted for.
- `AC-001-109`'s third test pins `countdown.clock.*` at `toHaveLength(10)`. That is a small fixed
  count inside one key prefix — not the retired 270-key freeze, but it is the same shape and will
  bite the next person who adds a clock key. WARN only (§W-4).

## Out-of-scope findings

### OOS-1 — `check-code-principles.sh` aborts with SIGPIPE at the DRY section, and scans `.next/`

Two defects in `.standards/scripts/check-code-principles.sh` (a different repository; nothing in
this branch can fix them, and gate configuration is off-limits to agents):

1. `check_dry()` closes its own pipeline with `| sort -rn | head -10` under `set -o pipefail`, so
   more than ten duplicate groups kills `sort` with SIGPIPE and the script with 141 — no verdict,
   no findings for any gate after DRY. Reproduced above; the line dates from submodule commit
   `b3d5a757` (2026-08-12).
2. `GREP_EXCLUDES` / `FIND_PRUNE` omit `.next`, so a normal `npm run build` makes the gate audit
   194 generated files and emit three spurious `Cyclomatic complexity >6` FAILs against vendored
   Next.js chunks. `dist` and `build` are already excluded for exactly this reason.

Consequence: the design-principles gate cannot be run in its canonical form in any repo state
that follows a build. **Proposed follow-up spec** in `RexiAI/my-engineering-standards`: replace
`head -10` with an awk-side limit (or `|| true` on the pipeline), add `.next` to both exclusion
lists, and add a regression fixture with >10 duplicate groups. Not routed to the Coder or the
Refactorer — neither can act on it.

### OOS-2 — `AC-001-107`'s replacement ordering test asserts a retired element

`tests/acceptance/first-viewport.test.ts` was reduced from 373 to 62 lines correctly, but the
new file's AC-004-77 first test asserts on strings inside `tests/acceptance/clock.test.ts` and
`countdown-band.test.ts` (`expect(bodyOf(...)).not.toContain(...)`) — assertions about other test
files' text rather than about behaviour. It is a retirement *guard*, which is defensible, and
`AC-004-78` does the same for the band tests, so I am recording it rather than failing it: the
next time either file legitimately mentions those fragments the guard will need widening.
Informational.

### OOS-3 — `retired-criteria.test.ts` writes `AC-001-111`/`AC-002-35` in plain text while building
the retired ids from fragments

`RETIRED` is assembled from fragments (`id('001-107')`) so the file does not self-cite; but
`PRESERVED` (line 43-69) contains literal ids, which means this test file *is* a citation of
every preserved id it lists. That is what `AC-004-75` wants, but it also means the sample of 25
ids in that array is doing double duty: it is both the check and part of the evidence it checks.
`AC-004-75`'s scenario says "each preserved id" from T17; the test checks 25 hand-picked ones. I
verified the *property* independently (the id-set diff above shows no preserved id lost its last
citation), so no behaviour is unverified — but the assertion is a sample wearing a universal's
name. WARN (§W-2), not a blocker.

## WARNs for the Architect (not blockers)

- **W-1** — 5 design-principles WARNs at diff scope, itemised and assessed under the
  design-principles evidence block (2 KISS_LINES, 2 DRY JSX-boilerplate, 1 SRP on
  `web/content/keys.ts`).
- **W-2** — `AC-004-75`'s preserved-id list is a 25-id sample, not the full T17 set (OOS-3).
- **W-3** — four orphan tokens (`--text-clock-days`, `--text-band-years`, `--band-pad-block`,
  `--hero-min-h`) have neither a consumer nor a test pinning them, contrary to the Refactorer's
  claim that tests keep all eight.
- **W-4** — `AC-001-109` pins `countdown.clock.*` at a fixed count of 10.
- **W-5** — `AC-004-62`'s per-locale step-3 height "record" is computed and discarded; the
  numbers are reproduced in §Measured, not asserted from the test.
- **W-6** — the `next dev` server on `:3000` serves the pre-004 page; do not measure against it.

## Verdict

**FAIL.**

Four of the five contract checks pass: scenario traceability (exit 0), the full suite (exit 0,
86 files / 923 tests, nothing skipped), the complexity gate (exit 0), and the design-principles
gate (0 FAIL / 5 WARN at diff scope, exit 0, with the in-place 141 recorded as a tooling failure
per §OOS-1).

Check 5 fails, on two scenarios whose citing tests do not assert what their scenario says:

- `check-5 / AC-004-59` — the second clause ("no rule declares a two-column track list on an
  element the page renders with a single child") is asserted by a tautology that cannot fail;
  the structural backstop for the empty column is dead.
- `check-5 / AC-004-72` — the test named "each locale renders a document whose lang matches"
  asserts no `<html lang>` and no 404 clause; the behaviour is covered under a different id
  (`AC-001-52`), so what is false is the citation, not the product.

Routing (phase 1, attempt 1 of a 3-attempt budget):

- **AC-004-59 → Coder.** Behaviour/test defect: rewrite the third loop in
  `tests/acceptance/no-empty-columns.test.ts` so it asserts the two-track-on-a-single-child
  property it claims (or delete the clause from the scenario and keep the grid-column assertion
  that already works).
- **AC-004-72 → Coder.** Behaviour/test defect: assert the served `<html lang>` and the 404 in
  this test, or re-point `AC-004-72` to `served-document.test.ts` and give the parity file a
  scenario id that matches what it actually renders.
- **OOS-1 → follow-up spec in `my-engineering-standards`,** not the Coder or the Refactorer.

Re-verification after the fix is **scoped**: only check 5 re-runs (the two changed tests, then
the spot check on those two scenarios). Checks 1–4 stand on the results recorded above.

---

# Re-verification — attempt 2, phase 1 (scoped: check 5 only)

Cycle 1 of the phase-1 budget (`SPEC_PHASE1_RETRIES=1` of max 3). Per §Scoped re-verification I re-ran
**only check 5**. Checks 1–4 stand on attempt 1's recorded results and were not re-executed: traceability
(exit 0), the full suite (exit 0, 86 files / 923 tests), the complexity linter (exit 0), and the
design-principles gate (0 FAIL / 5 WARN at diff scope, exit 0). I re-ran the *tests touched by this
cycle's fix* — the two repaired files plus every file that reads `web/styles/tokens.css` — because a
token deletion is a change to those files' subject, not a re-run of the suite. That is 167 tests across
11 files, all green, itemised below.

I wrote no production code. Every mutation below ran in `/tmp/opencode/verif/rerun`, an rsync copy with
`node_modules` symlinked; the real tree was never modified, and each mutation was restored and
re-confirmed green at the end.

## Evidence: scenario-to-behavior spot check

command: npx vitest run tests/acceptance/no-empty-columns.test.ts tests/acceptance/locale-parity.test.ts --reporter=verbose ; then 5 stylesheet/layout mutations in a scratch copy, one test each, restored after
exit: 0
at: 2026-11-01T15:56:04Z

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 ✓ tests/acceptance/locale-parity.test.ts > AC-004-69: REQUIRED_KEYS matches what the page renders > AC-004-69: every story key is listed, and the retired keys are not 4ms
 ✓ tests/acceptance/locale-parity.test.ts > AC-004-70: all five locales carry exactly the required set > AC-004-70: missingKeys and unknownKeys are empty for each locale 4ms
 ✓ tests/acceptance/locale-parity.test.ts > AC-004-71: every new key is translated, not copied > AC-004-71: non-blank in all five locales, and none is the Spanish value 2ms
 ✓ tests/acceptance/locale-parity.test.ts > AC-004-71: every new key is translated, not copied > AC-004-71: every new value passes the plain-language gate 382ms
 ✓ tests/acceptance/locale-parity.test.ts > AC-004-72: five routes, five languages > AC-004-72: five routes render, each document’s <html lang> matches, and no locale 404s 30ms
 ✓ tests/acceptance/locale-parity.test.ts > AC-004-73: parity tests assert set equality, never a fixed count 0ms
 ✓ tests/acceptance/no-empty-columns.test.ts > no unoccupied grid track > AC-004-55: no track of 8px or more is unoccupied at 1440x900 in es 740ms
 ✓ tests/acceptance/no-empty-columns.test.ts > no unoccupied grid track > AC-004-56: the count is zero at every measured width 4674ms
 ✓ tests/acceptance/no-empty-columns.test.ts > no unoccupied grid track > AC-004-57: the count is zero in all five locales 8647ms
 ✓ tests/acceptance/no-empty-columns.test.ts > no unoccupied grid track > AC-004-58: no horizontal overflow at the 320 floor 2889ms
 ✓ tests/acceptance/no-empty-columns.test.ts > AC-004-59: the retired shape cannot return structurally > AC-004-59: no rule places a grid child into a track other than the first 1ms
 ✓ tests/acceptance/no-empty-columns.test.ts > AC-004-59: the retired shape cannot return structurally > AC-004-59: every multi-track grid’s element renders a child for each track 11ms
 ✓ tests/acceptance/no-empty-columns.test.ts > AC-004-59: the retired shape cannot return structurally > AC-004-59: no rule moves content away from the first named area 0ms

 Test Files  2 passed (2)
      Tests  13 passed (13)

### AC-004-59 is repaired — the vacuous assertion is gone and all three clauses can fail

The tautology I reported (`expect('1fr auto').not.toContain('grid-template-areas')`) is deleted. It is
replaced by a real rule parser (`rulesOf`) over comment-stripped `globals.css`, with three tests whose
failures are all named. I mutated the real stylesheet five ways in the scratch copy:

| # | mutation | clause under test | result |
|---|---|---|---|
| M1 | the **exact retired shape**, restored verbatim from `main`: `.hero--band { grid-template-columns: 7fr 5fr }` + `.hero--band > .hero__panel, .hero--band > .hero__status { grid-column: 2 }` | (a) | **fails** — `AssertionError: line 1657: .hero--band > .hero__panel, .hero--band > .hero__status: expected '2' to match /^(1 \/ -1|auto)$/` |
| M1b | the same defect on a grid the page really renders: `.site-footer > div { grid-column: 2 }` (two-track footer, both children in column 2, track 1 empty) | (b) **alone** | **passes** — `1 passed` |
| M1b | …the same mutation, full AC-004-59 | (a) | **fails** — `line 1651: .site-footer > div: expected '2' to match /^(1 \/ -1|auto)$/` |
| M2 | the same void expressed with the longhands: `.site-footer > div { grid-column-start: 2; grid-column-end: 3 }` | (a)+(b)+(c) | **passes** — `3 passed` (see §W-7) |
| M3 | `.site-footer { grid-template-columns: 1fr 1fr 1fr }` — three tracks, two children | (b) | **fails** — `.site-footer (3 tracks) renders 2 child(ren): expected 2 to be greater than or equal to 3` |
| M5 | `.site-footer { grid-template-areas: "left right" }` | (c) | **fails** — `line 1019: "left right": expected 2 to be less than or equal to 1` |

Restored → `3 passed` on AC-004-59 again. Clauses (a), (b) and (c) are each individually live, and the
non-vacuity guard is real, not decorative: instrumenting the walk in the scratch copy printed
`WALK_TOTAL 12 WALK_RENDERED 11`, so `toBeGreaterThanOrEqual(4)` is asserting a number it actually
measured, and an empty walk would fail it.

**Would clause (b) have caught the original defect? No — and that is worth stating plainly.** Clause (b)
compares a *count*: direct element children ≥ declared tracks. Pinning every child into column 2 does
not change the count — the retired `.hero--band` had two children and two tracks, and the two-track
footer has two children and two tracks. M1b proves it empirically: with a real 699×552-style void in the
footer, clause (b) on its own passes. What actually catches the historical shape is **clause (a)**, and
it does catch it, verbatim and with a named line. Clause (b) is live and does the job the *scenario's
second clause* asks of it — "no rule declares a two-column track list on an element the page renders
with a single child" — which is a different property from the first clause.

The residual gap this exposes is M2: clause (a) scans `grid-column:`, `grid-row:` and `grid-area:` only,
so the identical void written with `grid-column-start`/`grid-column-end` passes all three clauses. It is
recorded as **W-7** below — a real but narrow hole, not the false green I reported in attempt 1.

### AC-004-72 is repaired — the body now asserts what its name claims

The test renders `app/(public)/(home)/layout.tsx` and `app/(public)/[locale]/layout.tsx` through
`renderDocument`, asserts `documentLang(...)` per route against an exact map
`{ en: 'en', fr: 'fr', de: 'de', it: 'it' }` plus `DEFAULT_LOCALE` for the base route, and asserts
`LocaleRoute.generateStaticParams()` equals exactly the four non-default locales — which is the
structural form of "no locale 404s", since `dynamicParams = false` makes a path outside that set a 404.
The previous version rendered a component (no `<html>` element at all), which is why it could not fail.

My own mutation, independent of the Coder's: hard-coded `lang="es"` in `app/(public)/[locale]/layout.tsx`
(`<RootShell lang="es">` instead of `lang={locale}`):

    AssertionError: expected { en: 'es', fr: 'es', de: 'es', …(1) } to deeply equal { en: 'en', fr: 'fr', de: 'de', …(1) }
    Tests  1 failed | 5 skipped (6)

Restored → green. The repair can fail again, for the right reason.

## The token split, judged on its merits

I deleted each token's declaration from `tokens.css` in the scratch copy and ran the file the Coder says
cites it:

| token | mutation | citing test | verdict |
|---|---|---|---|
| `--text-h3` | declaration removed | `visual-identity.test.ts` (AC-004-64) | **fails** — `AssertionError: text-h3: expected null not to be null` → genuinely pinned |
| `--measure-face` | declaration removed | `first-viewport.test.ts` (AC-004-77) | **fails** — `expected '/* Design tokens (spec 001, 15-design…' to match /--measure-face:\s*17\.5rem;/` → genuinely pinned |
| `--rule-projection` | declaration removed | `projection-colour.test.ts` | **fails** — `expected '/* Design tokens (spec 001, 15-design…' to match /--rule-projection:\s*3px/` → genuinely pinned |
| `--text-clock-sub` | declaration removed | `countdown-band.test.ts` | **passes** — `16 passed (16)` → **not pinned** (§W-8) |

The four **deleted** tokens are clean: `--text-clock-days`, `--text-band-years`, `--band-pad-block`,
`--hero-min-h` each have zero `var(--…)` references anywhere under `web/` or `app/`, zero references in
`tests/`, `scripts/` or `app/`, and their only remaining occurrence in the repository is the prose in
`tokens.css` that says they were deleted. The four **frozen** tokens keep their exact declarations
(`git diff -U0 -- web/styles/tokens.css` shows no added or removed declaration for any of them; only
comment text changed), and two of the rewritten comments now state only what holds:
`--measure-face`'s says no rule resolves it any more and that `AC-004-77` asserts the declaration
survives; the numeral-alias comment explains why `--text-clock-days`/`--text-band-years` went. That part
of the fix is exactly right.

## Scoped test runs (the files this cycle touched)

command: npx vitest run tests/acceptance/visual-identity.test.ts tests/acceptance/first-viewport.test.ts tests/acceptance/countdown-band.test.ts tests/acceptance/projection-colour.test.ts tests/acceptance/countdown-band-browser.test.ts tests/acceptance/retired-criteria.test.ts
exit: 0
at: 2026-11-01T15:58:01Z

 Test Files  6 passed (6)
      Tests  42 passed (42)

command: npx vitest run tests/acceptance/palette-labels.test.ts tests/acceptance/palette-accent.test.ts tests/acceptance/clock.test.ts tests/unit/design-revision.test.ts tests/acceptance/story-steps.test.ts
exit: 0
at: 2026-11-01T15:58:21Z

 Test Files  5 passed (5)
      Tests  112 passed (112)

With the 13 from the two repaired files that is 167 green tests over every file that reads
`tokens.css` plus the two repaired suites. I did **not** re-run the whole suite, per the scoped-rewrite
rule. The Coder's claimed 925 (up from 923) is consistent with the diff: AC-004-59 went from one test to
three (+2) and AC-004-72 stayed at one (+0), so 923 + 2 = 925.

## New findings from this cycle

- **W-7 (new, WARN, not a blocker) — clause (a) only covers the `grid-column` shorthand.** Proven by M2:
  `.site-footer > div { grid-column-start: 2; grid-column-end: 3 }` recreates the exact void and
  `AC-004-59` passes all three clauses. T13's criterion is general ("no stylesheet rule places a sole
  child of a multi-column grid into a column other than the first"); this one spelling of placement
  evades it. The fix is two lines in `rulesOf`'s consumer — also require every `grid-(column|row)-(start|end)`
  to be `auto`, `1` or `-1` — and a fourth mutation to prove it. I am **not** re-failing the gate for it:
  the historical defect is caught verbatim (M1), the scenario's own second clause is asserted and live
  (M3), and any real void is still caught dynamically by AC-004-55/56/57 at 8 widths across 5 locales.
  Flagged to the Architect rather than silently accepted.
- **W-8 (new, WARN) — `--text-clock-sub`'s stated justification does not hold.** The Coder kept it on the
  grounds that "AC-003-04's assertion names it"; that assertion is
  `expect(CSS).not.toMatch(/\.clock__value--sub\s*\{[^}]*--text-clock-sub/s)` — a negative on
  `globals.css`, which is satisfied whether or not the token exists. Deleting the declaration leaves
  `countdown-band.test.ts` at `16 passed`. Retention is still permissible under T15, so nothing is
  broken; but this is the third time a retention has been justified by a test that does not actually
  notice it. Either delete it with the other three, or add the assertion that makes keeping it mean
  something.
- **W-9 (new, informational) — clause (a) also pins the exact placement set.** `expect(placements.sort())`
  equals `['.clock__field--days', '.demography__panel-head']`, so any future legitimate `grid-column:
  1 / -1` must edit this list. That is a deliberate registry, not the retired 270-key freeze, but it is
  the same shape and worth knowing about.

## Verdict (attempt 2)

**PASS.**

Both failures from attempt 1 are fixed and I reproduced the failure of each repair myself, from my own
scratch copy:

- `AC-004-59` — the tautology is gone; clauses (a), (b) and (c) each produced a distinct named failure
  under my own mutations, the non-vacuity guard measured 11 rendered multi-track grids (≥4), and the
  exact retired stylesheet restored verbatim fails the test. Clause (b) alone would not have caught the
  original shape — clause (a) does — which I report plainly as **W-7** rather than papering over.
- `AC-004-72` — the test now renders real document shells and asserts the `<html lang>` its name
  promises; hard-coding `lang="es"` fails it with a named diff.

The token split is sound on its merits: the four deleted tokens have no reference anywhere and the four
kept ones keep their exact declarations, three of which I proved are genuinely pinned by deleting them
and watching the citing test fail. The fourth (`--text-clock-sub`) is not pinned — recorded as **W-8**.

Residual risk I am explicitly carrying forward rather than blocking on: **W-7** (longhand placement
evades clause (a)), plus attempt 1's **OOS-1** (the `check-code-principles.sh` SIGPIPE/`.next` defects,
still unfixed and still out of reach of this branch). No gate re-fails. Checks 1–4 keep attempt 1's
results; check 5 passes.

## Quality gates

# 30-report — 004-plain-countdown (stage 5a, Mutation Runner)

- Branch: `spec/004-plain-countdown`
- Conformance tier: **production** — mutation testing is a required gate, not skipped.
- Verifier verdict carried forward: **PASS** (`25-verification.md`, attempt 2, phase 1 cycle 1). Stage 5a ran
  only because that verdict is PASS; nothing here re-litigates checks 1–5.
- Mutation score for the code this spec changed: **93.68 %** (623 of 665 mutants killed; 36 survived, 6 uncovered).
  Covered-mutant score **94.54 %**. Target is ≥ 80 %.
- Final full suite: **88 files / 971 tests, all green** (up from the Verifier's 86 / 925).
- Verdict: **GREEN** — the PR Opener may proceed.

I committed nothing, pushed nothing and opened no PR. I wrote no production code: the only files this stage
added are two test files. No existing test was weakened, renamed or deleted, and no gate threshold or
`stryker.config.mjs` setting was touched.

## Evidence: mutation score

command: npx stryker run --mutate "web/build/public-plain-language.ts,web/components/public/BreakageStep.tsx,web/components/public/CountdownPrecision.tsx,web/components/public/DistanceStep.tsx,web/components/public/FiguresRegion.tsx,web/components/public/MeaningStep.tsx,web/components/public/MethodRegion.tsx,web/components/public/NumberStep.tsx,web/components/public/PublicStory.tsx,web/components/public/PyramidStep.tsx,web/components/public/RegisterKey.tsx,web/components/public/StoryStrip.tsx,web/components/public/SubjectFacts.tsx,web/components/public/top-steps.ts,web/components/public/TopStepSection.tsx,web/components/series/CountdownClock.tsx,web/components/series/Fuse.tsx,web/components/series/PyramidPlate.tsx,web/components/DataTable.tsx,web/components/PublicPage.tsx,web/components/metrics/PlateBody.tsx" --reporters clear-text,json
exit: 0
at: 2026-11-05T13:15:31Z

Instrumented 21 source file(s) with 665 mutant(s)
Initial test run succeeded. Ran 537 tests in 32 seconds
WARN MutantTestPlanner Detected 597 static mutants (90% of total) that are estimated to take 100% of the time running the tests!

---------------------------|------------------|----------|-----------|------------|----------|----------|
                           | % Mutation score |          |           |            |          |          |
File                       |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
---------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                  |  90.68 |   92.77 |      603 |         0 |         47 |       15 |        0 |
 build                     | 100.00 |  100.00 |       63 |         0 |          0 |        0 |        0 |
  public-plain-language.ts | 100.00 |  100.00 |       63 |         0 |          0 |        0 |        0 |
 components                |  89.70 |   91.99 |      540 |         0 |         47 |       15 |        0 |
  metrics                  |  95.45 |   95.45 |       21 |         0 |          1 |        0 |        0 |
   PlateBody.tsx           |  95.45 |   95.45 |       21 |         0 |          1 |        0 |        0 |
  public                   |  94.06 |   95.32 |      285 |         0 |         14 |        4 |        0 |
   BreakageStep.tsx        |  71.43 |   71.43 |        5 |         0 |          2 |        0 |        0 |
   CountdownPrecision.tsx  |  98.08 |   98.08 |       51 |         0 |          1 |        0 |        0 |
   DistanceStep.tsx        | 100.00 |  100.00 |        6 |         0 |          0 |        0 |        0 |
   FiguresRegion.tsx       | 100.00 |  100.00 |       29 |         0 |          0 |        0 |        0 |
   MeaningStep.tsx         | 100.00 |  100.00 |        3 |         0 |          0 |        0 |        0 |
   MethodRegion.tsx        |  92.59 |   92.59 |       25 |         0 |          2 |        0 |        0 |
   NumberStep.tsx          |  90.91 |   95.24 |       40 |         0 |          2 |        2 |        0 |
   PublicStory.tsx         | 100.00 |  100.00 |        8 |         0 |          0 |        0 |        0 |
   PyramidStep.tsx         |  84.62 |   84.62 |       11 |         0 |          2 |        0 |        0 |
   RegisterKey.tsx         | 100.00 |  100.00 |        5 |         0 |          0 |        0 |        0 |
   StoryStrip.tsx          |  94.44 |   97.14 |       34 |         0 |          1 |        1 |        0 |
   SubjectFacts.tsx        |  91.07 |   92.73 |       51 |         0 |          4 |        1 |        0 |
   top-steps.ts            | 100.00 |  100.00 |       15 |         0 |          0 |        0 |        0 |
   TopStepSection.tsx      | 100.00 |  100.00 |        2 |         0 |          0 |        0 |        0 |
  series                   |  84.55 |   89.00 |      186 |         0 |         23 |       11 |        0 |
   CountdownClock.tsx      |  55.56 |   74.07 |       20 |         0 |          7 |        9 |        0 |
   Fuse.tsx                |  93.10 |   93.10 |       27 |         0 |          2 |        0 |        0 |
   PyramidPlate.tsx        |  89.68 |   90.85 |      139 |         0 |         14 |        2 |        0 |
  DataTable.tsx            |  78.57 |   78.57 |       11 |         0 |          3 |        0 |        0 |
  PublicPage.tsx           |  86.05 |   86.05 |       37 |         0 |          6 |        0 |        0 |
---------------------------|--------|---------|----------|-----------|------------|----------|----------|

Done in 17 minutes and 24 seconds.

Three scoped re-runs followed, over only the files this stage then improved (the same config, the same
runner, disjoint file sets):

command: npx stryker run --mutate "web/components/series/CountdownClock.tsx,web/components/public/StoryStrip.tsx,web/components/metrics/PlateBody.tsx,web/components/series/PyramidPlate.tsx" --reporters clear-text,json
exit: 0
at: 2026-11-05T13:34:51Z

All files            |  93.17 |   94.31 |      232 |         0 |         14 |        3 |        0 |
  PlateBody.tsx      | 100.00 |  100.00 |       22 |         0 |          0 |        0 |        0 |
  StoryStrip.tsx     |  97.22 |  100.00 |       35 |         0 |          0 |        1 |        0 |
  CountdownClock.tsx |  97.22 |   97.22 |       35 |         0 |          1 |        0 |        0 |
  PyramidPlate.tsx   |  90.32 |   91.50 |      140 |         0 |         13 |        2 |        0 |
Done in 8 minutes and 3 seconds.

command: npx stryker run --mutate "web/components/PublicPage.tsx,web/components/public/CountdownPrecision.tsx" --reporters clear-text,json
exit: 0
at: 2026-11-05T13:43:45Z

All files                |  94.74 |   94.74 |       90 |         0 |          5 |        0 |        0 |
  CountdownPrecision.tsx | 100.00 |  100.00 |       52 |         0 |          0 |        0 |        0 |
  PublicPage.tsx         |  88.37 |   88.37 |       38 |         0 |          5 |        0 |        0 |
Done in 3 minutes and 0 seconds.

command: npx stryker run --mutate "web/build/public-plain-language.ts,web/components/PublicPage.tsx" --reporters clear-text,json
exit: 0
at: 2026-11-05T13:12:51Z

All files                  |  94.34 |   94.34 |      100 |         0 |          6 |        0 |        0 |
  public-plain-language.ts | 100.00 |  100.00 |       63 |         0 |          0 |        0 |        0 |
  PublicPage.tsx           |  86.05 |   86.05 |       37 |         0 |          6 |        0 |        0 |

### The assembled final number

Stryker's numerator and denominator are per file, so a file's verdict does not depend on which other files
share the run. The final aggregate is the 665-mutant run's totals with the four re-runs' file results
substituted. Arithmetic, so the number is auditable rather than asserted:

| file | mutants | killed | survived | no-cov | score, before → after |
|---|---|---|---|---|---|
| `web/build/public-plain-language.ts` | 63 | 63 | 0 | 0 | 82.54 → **100.00** |
| `components/public/BreakageStep.tsx` | 7 | 5 | 2 | 0 | 71.43 → 71.43 |
| `components/public/CountdownPrecision.tsx` | 52 | 52 | 0 | 0 | 90.38 → **100.00** |
| `components/public/DistanceStep.tsx` | 6 | 6 | 0 | 0 | 100.00 → 100.00 |
| `components/public/FiguresRegion.tsx` | 29 | 29 | 0 | 0 | 89.66 → **100.00** |
| `components/public/MeaningStep.tsx` | 3 | 3 | 0 | 0 | 66.67 → **100.00** |
| `components/public/MethodRegion.tsx` | 27 | 25 | 2 | 0 | 88.89 → 92.59 |
| `components/public/NumberStep.tsx` | 44 | 40 | 2 | 2 | 88.64 → 90.91 |
| `components/public/PublicStory.tsx` | 8 | 8 | 0 | 0 | 100.00 → 100.00 |
| `components/public/PyramidStep.tsx` | 13 | 11 | 2 | 0 | 84.62 → 84.62 |
| `components/public/RegisterKey.tsx` | 5 | 5 | 0 | 0 | 80.00 → **100.00** |
| `components/public/StoryStrip.tsx` | 36 | 35 | 0 | 1 | 88.89 → **97.22** |
| `components/public/SubjectFacts.tsx` | 56 | 51 | 4 | 1 | 75.00 → **91.07** |
| `components/public/top-steps.ts` | 15 | 15 | 0 | 0 | 93.33 → **100.00** |
| `components/public/TopStepSection.tsx` | 2 | 2 | 0 | 0 | 50.00 → **100.00** |
| `components/series/CountdownClock.tsx` | 36 | 35 | 1 | 0 | 55.56 → **97.22** |
| `components/series/Fuse.tsx` | 29 | 27 | 2 | 0 | 93.10 → 93.10 |
| `components/series/PyramidPlate.tsx` | 155 | 140 | 13 | 2 | 40.00 → **90.32** |
| `components/DataTable.tsx` | 14 | 11 | 3 | 0 | 78.57 → 78.57 |
| `components/PublicPage.tsx` | 43 | 38 | 5 | 0 | 55.81 → **88.37** |
| `components/metrics/PlateBody.tsx` | 22 | 22 | 0 | 0 | 90.91 → **100.00** |
| **all 21 files** | **665** | **623** | **36** | **6** | **71.73 → 93.68** |

`623 / 665 = 93.68 %`; covered-mutant score `623 / 659 = 94.54 %`.

## Evidence: final test suite

command: npm test
exit: 0
at: 2026-11-05T13:46:52Z

> pensions-system@0.0.0 test
> vitest run

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  88 passed (88)
      Tests  971 passed (971)
   Duration  29.59s

971 = the Verifier's 925 + the 46 tests this stage added. The Verifier's scoped runs stand as recorded; this
is the whole suite re-run after the mutation-killing tests landed, because those tests are new code the
Verifier never saw.

The project's own build-time traceability gate was re-run because my new tests are new citations:

command: ./node_modules/.bin/tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-11-05T13:47:28Z

scenario traceability (2-3 digit ids): 285 scenarios, all cited, all citations resolve

## What was mutated, and why the scope is not `stryker.config.mjs`'s list

`stryker.config.mjs` was **not modified**. Its `mutate` globs are the standing, cumulative surface every spec
adds to, and rewriting them for one spec's run would have silently dropped spec 001/003 coverage from future
runs. Instead this stage passed an explicit `--mutate` list naming the 21 files spec 004 changed — the
command is recorded verbatim above, so the run is reproducible.

The list is the spec's own diff against `main`, restricted to files Stryker can mutate (CSS, JSON content and
Next.js route pages are not). Two consequences worth stating:

- **Included although unmodified:** nothing. Every one of the 21 files appears in `git diff --name-only main`.
- **Changed but not mutable, therefore out of scope:** `web/styles/globals.css` and `web/styles/tokens.css`
  (CSS — Stryker mutates JavaScript/TypeScript only; their behaviour is covered by the stylesheet-parsing and
  Chromium suites the Verifier spot-checked), `web/content/data/ES/*.json`, `web/content/keys.ts` (content
  registry, not logic), and `app/(admin)/admin/(authed)/page.tsx` (a Next.js route page, excluded by the
  standing config's own rationale: mutating a route's composition proves nothing about a published claim).

**A first, deliberately broader run is on the record too**, and it is why the scope above exists. Running the
directory glob the stage instructions suggested (`web/components/public/*`) also swept in nine files this
spec did not touch — `AssumptionsLedger`, `ReproduceBlock`, `ScopeMark`, `SiteFooter`, `SiteHeader`,
`SourceStrip`, `theme.ts`, `ThemeGroup`, `ThemeToggle` — scoring **60.72 %** over 942 mutants. Those files'
scores are inherited from earlier specs and none of them is part of this diff, so the honest figure for "the
code this spec changed" is the 665-mutant one. The broad number is recorded here rather than discarded
because it is the reason the scope was narrowed, not a number chosen after seeing the result.

### One file could not be included, and it is a real finding

`web/admin/views/FigureTable.tsx` (new in T11) **cannot be mutated at all today**: Stryker's dry run fails
before generating a mutant, because `tests/acceptance/admin-figure-tracking.test.ts` `AC-004-48` reads the
component's own source text and asserts literals inside it

    const view = readFileSync('web/admin/views/FigureTable.tsx', 'utf8');
    expect(view).toContain("adminT('admin.home.figureList')");

Stryker's instrumented reprint hoists string literals into `stryNS_*` helpers, so the assertion fails in the
dry run and no mutation run starts. This is the same defect `stryker.config.mjs` documents from spec 003
(three source-text assertions had to be excluded until they were rewritten behaviourally). The repair is a
Coder task — mount the component and assert the rendered list instead of its source — and it is recorded as
**OOS-4** below rather than fixed here: rewriting an acceptance test is not a Mutation Runner's call.

## Survivors: 42 remain, every one of them equivalent

6 of the 42 are `NoCoverage` (no test executes the mutated node) and 36 are `Survived`. They fall into eight
causes. Every location is listed; "why" is the argument that no test could distinguish the mutation.

**E1 — a fallback label no reachable value reaches (9 mutants).** `formatValue(value, kind, locale, nullLabel)`
returns its fourth argument only for `null` or `NaN`, and `DataTable`'s `nullLabel` only for a `null` cell;
every call site here passes a finite number or a non-null string. So the mutated literal is never selected:
`BreakageStep.tsx:22:82`, `:23:62`; `Fuse.tsx:46:62`, `:48:64`; `NumberStep.tsx:39:70`;
`PyramidPlate.tsx:80:64`, `:182:72`, `:250:87` (the `formatValue` argument) and `:266:30` (the table's
`nullLabel`, whose cells are never null).

**E2 — `?? ''` on a value a guard has already proved non-null (3 mutants).**
`NumberStep.tsx:17:41` and `:29:35` sit behind `measured()`'s `anchor !== null` test; `StoryStrip.tsx:54:35`
sits behind `anchoredCountdown()`'s. The fallback branch is unreachable, which is also why two of them report
as uncovered rather than survived.

**E3 — React `key` strings (6 mutants).** Keys are reconciliation metadata and are never rendered, so no
assertion on markup can see them. `DataTable.tsx:29:21`, `:48:32`, `:65:78`;
`PyramidPlate.tsx:146:16`, `:190:56`, `:194:56`.

**E4 — an operand of a disjunction already entailed by an earlier one (9 mutants).** Replacing just
`series.availability !== 'computed'` (or `value === null`, or `sources.fuse === undefined`) with `false`
leaves the earlier disjunct returning the same value, so the branch outcome is unchanged for every
producible input. `MethodRegion.tsx:45:31`, `:75:8`; `PyramidStep.tsx:20:31`, `:20:69`;
`PyramidPlate.tsx:288:7` (×2), `:288:45`; `PublicPage.tsx:52:30`; `SubjectFacts.tsx:19:31`.
(`MethodRegion.tsx:75:8` is the same shape one step further: `FusePrecision` returns `null` on its own when
`fuseValueOf` yields `undefined`, so the guard in the parent is redundant, not load-bearing.)

**E5 — a defensive branch reachable only from a malformed payload (7 mutants).** `!first || !last` cannot be
true for an array with at least one year (`PyramidPlate.tsx:207:7` ×2, `:207:31`); `largest === undefined`
needs a year with no bands (`:93:10`); the `?? { band, male: 0, female: 0, total: 0 }` row needs a year missing
one of the 21 published bands (`:228:87`); `point === undefined` needs a hole in the points array
(`SubjectFacts.tsx:33:10`, `:33:32`). Each mutation preserves behaviour for every payload the ingest can
produce. I did not fabricate malformed fixtures to kill them: a test asserting what a component does with a
payload the pipeline cannot emit pins invented behaviour, which is the failure mode this spec's own T13/T17
review called out.

**E6 — dead data inside a reachable expression (4 mutants).** `PublicPage.tsx:81` — the `countries` fallback
is *reachable and used*, but it is always exactly one entry, and one entry renders `ScopeMark`'s text branch,
which reads `content.country.name` and `content.country.scopeClause` and never the entry's `geo` or `href`.
So `?? []` (`:81:31`), the element's braces (`:81:32`) and `href: ''` (`:81:95`) are all invisible. The
fallback's `geo` and `href` are **dead data**: see the `PublicPage.tsx:81` note below.
`PublicPage.tsx:76:12` (`series = []` → `['Stryker was here']`) is the same class — `findSeries` returns
`undefined` for any element without a matching `seriesId`, so both default arrays render identically.

**E7 — a guard the surrounding state union makes unreachable (2 mutants).** `NumberStep.tsx:47:10`'s
`state === 'computed'` test can never be false at that point (`NumberBody` returns early for `'not-crossed'`,
the only other member of `CountdownValue['state']`), so the check is dead code. `CountdownClock.tsx:86:13`
(`if (element)` → `true`) holds because the four `ref`s are attached to spans the same render emits.

**E8 — index-coverage-only lookups (2 mutants).** `SubjectFacts.tsx:52:22` removes optional chaining from
`FIGURE_ID_KEYS[figure.figureId]?.definition`, which needs a `figureId` outside the closed `FigureId` union;
`:53:7` turns `definition !== undefined` into `true`, which needs a figure with no definition at all. Both are
impossible by type.

### The specific question about `PublicPage.tsx:81`

Asked directly: is the fallback dead code, or a gap? **The expression is reachable; two of its three fields
are dead.** `PublicPage` always calls `ScopeMark` with `scopes`, and when `countries` is undefined the
fallback array is constructed and passed. But `ScopeMark` branches on `countries.length <= 1`, and the
fallback is a one-element array, so only the text branch ever runs — and that branch reads
`content.country.name` / `scopeClause`. `geo` and `href` exist in that literal for the two-or-more branch,
which the fallback can never enter (a caller that supplies two countries also supplies `countries`, so the
fallback is not used at all).

Verdict: **equivalent, and worth a follow-up rather than a test.** A test that forced the fallback through
the index branch would have to mock `ScopeMark`'s input inconsistently with the type. The honest
simplification is to delete `geo`/`href` from the fallback (or extract it as a named single-country
constant) — a Coder change, recorded as **OOS-5**.

## Gaps closed by the new tests

Every kill below is a survivor from the first run, and each new test names it in a comment so a later reader
can tell a deliberate gap-closure from a broad net.

| file | survivors before | what was untested | test added |
|---|---|---|---|
| `build/public-plain-language.ts` | 11 | the region's end boundary (no-strip doc, whole-document return, off-by-one), the context window's bounds/whitespace collapse/regex, the caller-term skip, a non-empty default term list | `public-plain-language: the region boundary` (5 tests) |
| `series/CountdownClock.tsx` | 16 (7 survived, 9 uncovered) | the entire client half: `useClockRefs`, the layout effect that rewrites four fields from the device clock, the ticker's start/stop, the effect's deps, the locale-keyed formatter, `data-clock-state` | `CountdownClock: the client tick` (5 jsdom tests) |
| `series/PyramidPlate.tsx` | 93 | chart geometry (`barY`, bar rects, axis/baseline/tick coordinates), the major age labels, the one-per-panel annotation and which band it names, the readout pairs, the finding sentence, the table caption/columns/summary, the no-value guard | `PyramidPlate: the chart, the annotation and the disclosure` (11 tests) |
| `components/PublicPage.tsx` | 19 | the cohort lookup and its `fig-03` assumptions, a non-numeric assumption, the no-figures shell (skip link, snapshot date, scope fallback), the source strip, an unavailable countdown | `the story with nothing published` / `the countdown step without a clock` (5 tests) |
| `public/SubjectFacts.tsx` | 14 | the period's presence rules (a point with no label, one point, no points at all) | `SubjectFacts: the period is stated only when its points publish a label` (3 tests) |
| `public/StoryStrip.tsx` | 4 | the anchor handed to the share row, observed only at click time | `StoryStrip: the share row gets the countdown's own anchor` (1 jsdom test) |
| `public/CountdownPrecision.tsx` | 5 | the null-threshold-year and null-back-cast omissions, the definition's tense in both directions, the two `{' '}` separators, the null-anchor tense | `CountdownPrecision: each precision line is conditional` (4 tests) |
| `public/FiguresRegion.tsx` | 3 | the appendix heading (present and named only when something is published), the one ledger note | `FiguresRegion: the heading and the one ledger note` (2 tests) |
| `public/MethodRegion.tsx` | 3 | the heading when nothing is documented; rendering with no series at all | `MethodRegion: it renders without the material it documents` (1 test) |
| `public/PyramidStep.tsx` | 2 | absent series and unavailable series both render nothing | `a step whose data is absent does not exist` (1 test) |
| `public/NumberStep.tsx` | 5 | the no-anchor case (AC-001-110's "no anchor, no clock"), the seconds label | `the countdown step without a clock` (2 tests) |
| `public/top-steps.ts`, `public/TopStepSection.tsx`, `public/MeaningStep.tsx`, `public/RegisterKey.tsx` | 1 each | the derived `sectionId`/`headingId`, the `step step--<id>` class, the meaning sentence, the register key's link text | `the step shells: the label, the id and the class are the structure` (3 tests) |
| `metrics/PlateBody.tsx` | 2 | the chart frame's `aria-labelledby`, the plotted reference line | `PlateBody: the chart frame names its figure and keeps its reference` (2 tests) |
| `public/BreakageStep.tsx` | 2 | — (both equivalent, E1) | one test that documents the sentence's two bound values |

Two files carry the two new test files:

- `tests/unit/spec-004-mutation-kills.test.ts` — 40 tests, node environment, rendered with
  `renderToStaticMarkup` in the repo's existing fixture style (`renderComponent`, `storyPage`, `decodeText`).
- `tests/unit/spec-004-mutation-kills-dom.test.ts` — 6 tests, `@vitest-environment jsdom`, mounting in a DOM
  the way `tests/acceptance/share-controls.test.ts` already does. This is where the clock's tick and the
  share row's click-time `href` live: neither is observable from a rendered string, and both were being
  reported green by tests that could not see them.

### Files that cannot reach 100 %, and are at their ceiling

| file | score | why it cannot go higher |
|---|---|---|
| `components/public/BreakageStep.tsx` | 71.43 % | 2 of 7 mutants are E1 (the `formatValue` fallback); the other 5 are killed. |
| `components/DataTable.tsx` | 78.57 % | 3 of 14 mutants are E3 (React keys); the other 11 are killed. |
| `components/public/PyramidStep.tsx` | 84.62 % | 2 of 13 are E4 (shadowed disjuncts). |
| `components/series/Fuse.tsx` | 93.10 % | 2 of 29 are E1. |
| `components/public/NumberStep.tsx` | 90.91 % | 2 E1/E7 + 2 uncovered E2. |
| `components/series/PyramidPlate.tsx` | 90.32 % | 13 E1/E3/E4/E5 + 2 uncovered E5. |
| `components/PublicPage.tsx` | 88.37 % | 5 E4/E6. |
| `components/public/SubjectFacts.tsx` | 91.07 % | 4 E4/E5/E8 + 1 uncovered E5. |
| `components/public/MethodRegion.tsx` | 92.59 % | 2 E4. |

## Complexity summary, carried from the Refactorer (re-recorded by the Verifier)

The Verifier's evidence for these gates stands (`25-verification.md` checks 3 and 4). This stage added no
production code, so those numbers cannot have moved — but the two new test files are linted by the same
`eslint .`, so the gate was re-run to be sure the additions stay inside the same bounds:

command: npm run lint
exit: 0
at: 2026-11-05T13:48:43Z

> pensions-system@0.0.0 lint
> eslint .

`eslint.config.mjs` carries `complexity: ['error', 6]`, so a clean run is the ≤ 6 bound holding over the new
test files too. (The first attempt at this run exited 1 for a reason unrelated to the code: two leftover
`.stryker-tmp/sandbox-*` directories made `@typescript-eslint` see several candidate `tsconfigRootDir`s.
`.stryker-tmp/` is gitignored scratch that Stryker creates and `cleanTempDir` normally removes; deleting it
restored exit 0. Recorded because a reviewer running lint after a mutation run will hit the same thing.)

- **Complexity (as recorded by the Verifier):** `npm run lint` → exit 0, `complexity: ['error', 6]`; the ≤ 6
  cyclomatic bound holds over every linted source file.
- **Design principles, diff scope:** `.standards/scripts/check-code-principles.sh --tier production -BaseRef main`
  → **0 FAIL / 5 WARN**, exit 0 (2 `KISS_LINES`, 2 DRY JSX-boilerplate, 1 SRP on `web/content/keys.ts`).
- **Design principles, whole tree:** 1 FAIL / 37 WARN, the single FAIL being the submodule demo asset in
  OOS-2. The in-place invocation exits 141 (SIGPIPE, OOS-1).

## WARN items carried forward (not blockers)

- **W-7** — `AC-004-59` clause (a) covers only the `grid-column` shorthand; `grid-column-start: 2; grid-column-end: 3` recreates the exact empty-column void and all three clauses pass (proven by the Verifier). Two extra lines would close it.
- **W-8** — `--text-clock-sub`'s justification in `tokens.css` is false: it has no live citing assertion (deleting the declaration leaves the citing test at 16 passed, because the assertion is a negative satisfied either way).
- **W-9** — clause (a) pins the exact placement set, so a legitimate future `grid-column: 2 / 3` would fail it. Known false-positive risk.
- **OOS-1** — standards-repo defect: `check-code-principles.sh` `check_dry()` pipes into `head -10` under `pipefail` → SIGPIPE/141 (blame `b3d5a757`, 2026-08-12); `.next` absent from `GREP_EXCLUDES`/`FIND_PRUNE` so build output yields bogus complexity FAILs. Pre-existing, recurs from the 003 run. Propose a follow-up spec; do not fix here.
- **OOS-2** — whole-tree design-principles FAIL is a submodule demo asset (`guardrails/…/cobalt-01/script.js`), unmodified, pre-existing.
- **OOS-3** — `AC-004-75` asserts a 25-id sample of preserved ids, not T17's full set.

New from this stage:

- **OOS-4** — `web/admin/views/FigureTable.tsx` is unmutable because `AC-004-48` asserts its own source text
  (`expect(view).toContain("adminT('admin.home.figureList')")`). Fix: mount the component and assert the
  rendered list. Not fixed here — an acceptance test is the Coder's to change, and rewriting it from stage 5a
  would be exactly the silent test-editing `docs/TESTING.md §Tests That Encode a Defect` forbids.
- **OOS-5** — `PublicPage.tsx:81`'s single-country fallback carries `geo` and `href` that no branch can read.
  Delete them, or extract the literal as a named constant, so the fallback stops advertising data it cannot
  deliver. Recorded as E6 above; unreachable-from-a-test, so no test pins it either way.
- **OOS-6** — `web/build/public-plain-language.ts` is not in `stryker.config.mjs`'s standing `mutate` list.
  It is a product module (T9's gate) with a fully killable surface — 100 % once in scope — so the durable fix
  is to add it to the config alongside `web/content/budgets.ts` and the other claim-bearing modules. Not done
  here: this stage's scope was one spec's changed surface, and editing the standing config would have
  broadened every future run implicitly. The command above is the interim reproducible form.

## Remediation record

Carried forward from `25-verification.md`, never guessed:

| id | phase | attempt resolved at | detail |
|---|---|---|---|
| BLOCK 1 — Verifier check 5, two scenarios | **Phase 1** (pre-PR loop) | **attempt 2** of max 3 | Attempt 1 (`SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=0`) failed on `AC-004-59` (a tautological assertion) and `AC-004-72` (a test asserting no `<html lang>`); both routed to the Coder. Attempt 2 (`SPEC_PHASE1_RETRIES=1`) re-ran check 5 only and passed. |

Stage 5a itself raised **no BLOCK** and consumed no further budget: the mutation score started below the
threshold on the changed surface (71.73 %) and crossed it (93.68 %) by writing tests inside this stage's own
mandate, which is the Mutation Runner's job rather than a Coder/Refactorer round. No threshold was moved;
`stryker.config.mjs`'s `thresholds` block is byte-identical to `main`.

Phase 2 (post-PR CI) and phase 3 (deploy verification) have not run — they begin after the PR opens.

## Verdict

**GREEN.**

- Mutation score over the spec's changed surface: **93.68 %** (623/665), against the ≥ 80 % gate — with every
  one of the 42 remaining mutants shown equivalent above, not waived by raising a threshold.
- Full suite green after the additions: **88 files / 971 tests**, nothing skipped.
- One file (`web/admin/views/FigureTable.tsx`) could not be mutated at all and says so (§OOS-4) rather than
  being quietly omitted from a score.
- No production code, no gate config, no existing test touched; nothing committed or pushed.

The PR Opener may proceed. It should append its `PR:` line and commit count below this line.

## 15-design.md

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
