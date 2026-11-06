# 006-centred-number

> Spec pipeline archive. Original source: `specs/006-centred-number/` (deleted by this script).
> Archived: 2026-11-06

## Original ask

# 006-centred-number — informal spec

Petición original (usuario, 2026-11-06), viendo la página en producción tras la
spec 005:

> merged but i still see awful the color, not space between the box (why is
> there a fucking box)?????????? and the coundown i do not understand. also why
> the fuck there is javascript ocmmand in the web
>
> are you following laws of ux????????????????????? 1. centred.

La spec 004 fijó la estructura, la 005 las palabras. Ninguna tocó **lo que se
ve**: hay una caja de color pegada a la cabecera, el color es un melocotón sobre
beige, y la cuenta atrás enseña cuatro números para una sola cantidad.

## Decisiones tomadas con el usuario (2026-11-06)

| Pregunta | Decisión |
|---|---|
| Composición | **Un solo eje centrado.** El número manda en el centro. Desaparece la mitad vacía del paso 1. |
| Color | **Blanco neutro y un solo acento.** Fondo casi blanco, tinta oscura, **un** acento (rojo profundo) reservado al numeral. Se retira el melocotón. |
| La cuenta atrás | **Un solo número.** `5 534 días`. La fecha vive en la frase. Desaparecen `16 años` y `hh:mm:ss`. |
| El enlace de compartir | **Debe apuntar al dominio canónico**, no al host de proyecto de Vercel. |

## Lo que falla hoy, medido en producción

Medido sobre `https://pensions-system-delta.vercel.app/`, 1440×900, 2026-11-06.

| # | Defecto | Medida |
|---|---|---|
| 1 | **La caja.** `.step--number` es un panel de 1176 × 559 px pintado `rgb(254,232,208)`, con **y = 64 px**: pegado a la cabecera, sin separación | 0 px de hueco arriba; ~500 px de papel muerto a la derecha |
| 2 | **El color.** `--surface-hero` (#fee8d0) sobre `--surface-1` (#fdf2e1) | dos melocotones a ~3 L\* de distancia: el panel lee como mancha, no como superficie |
| 3 | **Cuatro números para una cantidad** | `16 años` + `5534` + `días` + `12 / 56 / 28`, con etiquetas a 12–13 px bajo un numeral de 80 px |
| 4 | **El enlace de compartir apunta a otro host** | `pensions-system-danielbueno76-4270s-projects.vercel.app` en WhatsApp/Telegram/X; el sitio vive en `pensions-system-delta.vercel.app` |
| 5 | **Fitts** | 12 elementos interactivos sobre el pliegue, **los 12 por debajo de 44 px** (nav 21, idiomas 36, tema 40, salto 26) |
| 6 | **Von Restorff** | **3** acentos/fondos compitiendo sobre el pliegue |
| 7 | **Law of Similarity** | 28 hojas de texto en **10 tamaños** distintos; 19 de 28 a ≤13 px |

## Qué quiero

1. **Sin caja.** El paso 1 no lleva fondo propio: ni panel, ni borde, ni mancha.
   El número vive sobre el fondo de la página. Ninguna sección del relato pinta
   un rectángulo detrás de su contenido.

2. **Blanco y un acento.** Fondo casi blanco, tinta oscura, y **un solo** acento
   reservado al numeral de días. Todo lo demás —cabecera, etiquetas, texto,
   reglas— en la escala de grises/neutros. El acento no aparece dos veces sobre
   el pliegue. Contraste AA en cada par texto/fondo, medido. La distinción
   **observado vs proyectado** en las gráficas se conserva, pero por forma
   (trazo discontinuo, trama) y no por un segundo color de alarma.

3. **Un número.** El paso 1 muestra `5 534` y `días`, y una frase que dice a qué
   fecha cuenta. Nada más. Sin años, sin horas, sin minutos, sin segundos. Si el
   lector quiere el detalle, está en Método.

4. **Centrado, de verdad.** Número, unidad y frase comparten un eje centrado en
   el ancho de contenido, con tolerancia medida en píxeles y verificada en las
   cinco lenguas y en los tres anchos que la suite ya prueba. Nada de media caja
   vacía a la derecha.

5. **Fitts se cumple.** Todo elemento interactivo sobre el pliegue alcanza
   `--tap-min` (44 px) en su eje corto. La tipografía **no** crece para
   conseguirlo.

6. **Un solo ganador en Von Restorff.** Sobre el pliegue queda un elemento
   distinto: el numeral. Los demás acentos se retiran o se atenúan.

7. **El enlace de compartir es canónico.** Lo que se comparte lleva al dominio
   del sitio, no al host de proyecto de Vercel.

8. **Sin JavaScript en el relato.** Al no haber segundos que hacer correr, el
   paso 1 no necesita reloj de cliente. Se sirve como HTML estático; el valor es
   el del render. Si algún día vuelve a haber campos sub-diarios, que sea una
   decisión explícita y no un efecto colateral.

## Lo que NO quiero

- No se toca el texto de la spec 005: titular, frase del paso 1, mecanismo y
  lectura quedan como están, salvo la frase del paso 1 en lo que la fecha
  respecta.
- No se inventan cifras ni se tocan los datos.
- No se reordena la historia de cinco pasos.
- No se maqueta solo para escritorio: los cinco pasos se componen centrados
  también a 390 px.
- No se añade movimiento.

## Advertencia de alcance

Esta spec **sustituye** criterios de las specs 001, 003, 004 y 005: los que fijan
el reloj de segundos, los campos sub-diarios, el numeral de años, el fondo del
paso 1 y el acento ámbar de proyección. Cada sustitución debe nombrarse, no
implicarse. La etapa 1 las enumera; ninguna se retira en silencio.

## Preguntas abiertas

- Ninguna bloqueante.

## Tasks

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

## Acceptance scenarios

## AC-006-01 — Every centred unit sits on the content box's centre
## AC-006-02 — The axis holds at every width, including German at the narrowest
## AC-006-03 — The unit stays beside its numeral, and stays legible
## AC-006-04 — The group publishes exactly one quantity
## AC-006-05 — The sub-day row is gone from step 1
## AC-006-06 — The sub-day quantities are gone from the page, not moved around it
## AC-006-07 — Every above-the-fold target reaches `--tap-min`
## AC-006-08 — The target grows, the type does not
## AC-006-09 — Nothing is hidden to reach the floor
## AC-006-10 — No element above the fold paints a competing ground
## AC-006-11 — Exactly one text leaf carries the accent, and it is the numeral
## AC-006-12 — The numeral is the only **text** above the fold at its size
## AC-006-13 — The current locale is still marked, without a ground or a colour
## AC-006-14 — The distinct sizes above the fold decrease
## AC-006-15 — AC-001-118's ground clause is inverted, not deleted
## AC-006-16 — AC-005-16's ground clause is inverted, and its hash clause is superseded
## AC-006-17 — AC-004-77's rationale names this spec; its assertions are unchanged
## AC-006-18 — The token file's change set is the declared one
## AC-006-19 — The touched rules add no motion
## AC-006-20 — The touched rules add no colour literal
## AC-006-21 — Every scenario is cited, every retirement is performed, nothing is skipped
## AC-006-22 — No story step paints a ground
## AC-006-23 — The two retired peach values cannot return
## AC-006-24 — Exactly one chromatic token, and it is a deep red
## AC-006-25 — Every real pair meets its minimum, measured
## AC-006-26 — The accent is spent once on the page, counted on every channel
## AC-006-27 — The panels share one hue, and each prints its state
## AC-006-28 — The projected series differs by a form that paints
## AC-006-29 — Step 1 renders exactly one quantity
## AC-006-30 — The sentence still carries the date and binds to the one numeral
## AC-006-31 — The detail survives in Method
## AC-006-32 — The served HTML is the value, and says when it was rendered
## AC-006-33 — No client clock remains
## AC-006-34 — One origin, and it is not a project alias
## AC-006-35 — On production, the shared origin is the serving origin
## AC-006-36 — The focus ring is a state, and its exclusion is bounded
## AC-006-37 — The fuse's burnt segment reads after de-accenting

## Verification

# Verification — 006-centred-number

**Verifier:** spec-verifier (stage 4, independent re-check)
**Attempt:** 1, phase 1
**Branch:** `spec/006-centred-number`
**Date:** 2026-11-06
**Verified against:** `10-tasks.md`, `15-design.md`, `20-acceptance/` (35 scenarios
`AC-006-01`…`AC-006-35`). `00-informal.md` was **not** read (information barrier).

## Overall verdict

**PASS** on the five contract gates: scenario traceability, full test suite (`npm test` +
`npx tsc --noEmit`), the complexity linter, the design-principles gate, and the
scenario-to-behavior spot check all ran and produced no gate failure.

Two findings are recorded and escalated, neither of which is a runnable-gate failure:

- **F1 (design conformance, escalated to the Architect/Specifier):** the accent is spent
  four times on the delivered page, not once. The *letter* of `AC-006-11` and `AC-006-26`
  is satisfied; the design's Von Restorff intent is defeated. The Coder was forced here by
  two in-force criteria (`AC-002-31`, `AC-003-22`) that `10-tasks.md` §4 never re-pointed.
- **F2 (verification gap):** `AC-006-35`'s live-origin equality is guarded by
  `PRODUCTION_URL`, which nothing in this repo's CI sets, so the scenario's "serving origin"
  clause is not exercised by `npm test` and must be verified by stage 5c (Deploy Verifier).

Both are recorded under **Findings**. Per the Stop-and-Ask matrix they are recorded, not
fixed here; the Verifier writes no production code and does not commit or push.

## Gate summary

| # | Check | Command | Exit | Verdict |
|---|---|---|---|---|
| 1 | Scenario traceability | `npx tsx scripts/check-scenario-traceability-3digit.ts; bash .standards/scripts/check-scenario-traceability.sh --json` | 0 | PASS |
| 2 | Full test suite | `npm test; npx tsc --noEmit` | 0 | PASS (112 files / 1040 tests, **0 skipped**) |
| 3 | Complexity gate | `npm run lint; npx eslint <changed>` | 0 | PASS |
| 4 | Design-principles gate | `bash .standards/scripts/check-code-principles.sh . --json` (+ `-BaseRef main`) | 0 | PASS (0 FAIL / 213 WARN) |
| 5 | Scenario-to-behavior spot check | manual: AC-006-04, AC-006-22, AC-006-32, AC-006-35 | 0 | PASS for 3; AC-006-35 live half deferred (F2) |

## Evidence: scenario traceability

command: npx tsx scripts/check-scenario-traceability-3digit.ts; bash .standards/scripts/check-scenario-traceability.sh --json
exit: 0
at: 2026-11-06T11:25:52Z

scenario traceability (2-3 digit ids): 359 scenarios, all cited, all citations resolve
--- upstream ---
{
  "checks": [1, 2],
  "passes": ["AC-006-01 — traced to a test", "AC-006-02 — traced to a test", "AC-006-03 — traced to a test", "AC-006-04 — traced to a test", "AC-006-05 — traced to a test", "AC-006-06 — traced to a test", "AC-006-07 — traced to a test", "AC-006-08 — traced to a test", "AC-006-09 — traced to a test", "AC-006-10 — traced to a test", "AC-006-11 — traced to a test", "AC-006-12 — traced to a test", "AC-006-13 — traced to a test", "AC-006-14 — traced to a test", "AC-006-15 — traced to a test", "AC-006-16 — traced to a test", "AC-006-17 — traced to a test", "AC-006-18 — traced to a test", "AC-006-19 — traced to a test", "AC-006-20 — traced to a test", "AC-006-21 — traced to a test", "AC-006-22 — traced to a test", "AC-006-23 — traced to a test", "AC-006-24 — traced to a test", "AC-006-25 — traced to a test", "AC-006-26 — traced to a test", "AC-006-27 — traced to a test", "AC-006-28 — traced to a test", "AC-006-29 — traced to a test", "AC-006-30 — traced to a test", "AC-006-31 — traced to a test", "AC-006-32 — traced to a test", "AC-006-33 — traced to a test", "AC-006-34 — traced to a test", "AC-006-35 — traced to a test"],
  "fails": []
}
COMBINED_EXIT=0

Both gates agree: the repo-local three-digit gate finds **359 declared scenarios, all
cited, all citations resolve**; the upstream gate resolves all 35 `AC-006` scenarios and
reports `"fails": []`.

## Evidence: full test suite

command: npm test; npx tsc --noEmit
exit: 0
at: 2026-11-06T11:27:22Z


> pensions-system@0.0.0 test
> vitest run


 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  112 passed (112)
      Tests  1040 passed (1040)
   Start at  12:26:31
   Duration  49.50s (tests 93%, import 5%, transform 1%, environment 1%)

--- tsc ---
test_exit=0 tsc_exit=0

`vitest` transpiles without type-checking, so `npx tsc --noEmit` is run as a separate
gate (exit 0, no `error TS` lines). The suite reports **112 files, 1040 tests passed, 0
skipped** in this environment. All 18 `skipIf` guards in `tests/` are environment guards
(`BUILD_PRESENT = existsSync('.next/server/app')` and `CHROME_PATH`); with the fresh build
and Chromium present, every browser-guarded acceptance test executed. There are no
`.skip(`, `.only(` or `.todo(` occurrences in `tests/`.

## Evidence: complexity gate

command: npm run lint; npx eslint web/components/public/NumberStep.tsx web/components/series/PyramidPlate.tsx web/components/series/PyramidPanel.tsx web/series/clock.ts web/content/site.ts
exit: 0
at: 2026-11-06T11:25:53Z


> pensions-system@0.0.0 lint
> eslint .


```
$ grep -n complexity eslint.config.mjs
      complexity: ['error', 6],
```

The project's real linter carries the cyclomatic-≤6 rule as an **error**; it reports no
violation on the whole repo and none on the changed source files. The design-principles
complexity heuristic independently reports 0 FAIL (see next block).

## Evidence: design-principles gate

command: bash .standards/scripts/check-code-principles.sh . --json
exit: 0
at: 2026-11-06T11:26:28Z

```json
{
  "tier": "mvp",
  "gates": ["complexity","dry","yagni","solid","component-per-file","property-tests","comments","naming","null-discipline"],
  "fails": [],
  "warns": [ 213 entries — listed verbatim below ]
}
```

**0 FAIL, 213 WARN.** The tier auto-detect reads `AGENTS_*.md`; this repo's file is
`AGENTS.md`, so the script ran as `mvp`. Re-running the property-test gate explicitly at
the repo's declared tier is clean:

```
$ bash .standards/scripts/check-code-principles.sh . --tier production --gates property-tests --json
{
  "tier": "production",
  "gates": ["property-tests"],
  "fails": [],
  "warns": []
}

--- warn lines, verbatim (213) ---
Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:45:71:main:KISS_LINES=28
Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:101:124:checkCompensationPairs:KISS_LINES=25
Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:48:67:ActionForms:KISS_LINES=21
Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:69:91:ProposalPage:KISS_LINES=23
Method body >20 lines (node): ./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:35:67:ReviewTable:KISS_LINES=26
Method body >20 lines (node): ./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx:7:34:RefreshPage:KISS_LINES=28
Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:59:84:PendingTable:KISS_LINES=24
Method body >20 lines (node): ./app/(admin)/admin/login/page.tsx:5:30:LoginPage:KISS_LINES=26
Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:111:242::KISS_LINES=38
Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23
Method body >20 lines (node): ./web/components/CitationChip.tsx:12:38:CitationChip:KISS_LINES=28
Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21
Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:28:62:SiteFooter:KISS_LINES=36
Method body >20 lines (node): ./web/components/public/ScopeMark.tsx:27:52:ScopeMark:KISS_LINES=24
Method body >20 lines (node): ./web/components/public/ReproduceBlock.tsx:53:100:ReproduceBlock:KISS_LINES=48
Method body >20 lines (node): ./web/components/public/AssumptionsLedger.tsx:43:83:AssumptionsLedger:KISS_LINES=41
Method body >20 lines (node): ./web/components/public/ThemeGroup.tsx:13:36:ThemeGroup:KISS_LINES=21
Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:62:101:IndexPanel:KISS_LINES=41
Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:108:134:SiteHeader:KISS_LINES=28
Method body >20 lines (node): ./web/components/registers/DisputeSection.tsx:17:42:DisputeSection:KISS_LINES=25
Method body >20 lines (node): ./web/components/registers/ThesisSection.tsx:19:43:ThesisSection:KISS_LINES=22
Method body >20 lines (node): ./web/components/share/ShareRow.tsx:62:88:ShareRow:KISS_LINES=24
Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:36:64:FigureStatusRow:KISS_LINES=27
Possible duplication (5x identical 4-line block, first at ./web/components/ProvenanceStrip.tsx:56): </li> /))} /</ul> /</a>
Possible duplication (4x identical 4-line block, first at ./app/(admin)/admin/(authed)/page.tsx:80): </tbody> /</table> /); /))}
Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:115): type: "problem", /docs: { /description: /meta: {
Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:132): schema: [], /}, /create(context) { /},
Possible duplication (3x identical 4-line block, first at ./web/components/metrics/views.ts:153): ...headValue, /summary: summaryOf(input.content, value.points.length), /readout: [ /return {
Possible duplication (3x identical 4-line block, first at ./app/(admin)/admin/(authed)/page.tsx:79): ))} /</tbody> /</table> /</tr>
Possible duplication (2x identical 4-line block, first at ./web/ingest/run-compute.ts:96): }, /}; /return { kind: 'ok', snapshot }; /detail: freshness.reason ?? 'outside freshness window',
Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:133): }, /create(context) { /return { /schema: [],
Possible duplication (2x identical 4-line block, first at ./web/components/public/SiteHeader.tsx:120): {content.t(anchor.label)} /</a> /))} /<a key={anchor.href} href={anchor.href}>
Possible duplication (2x identical 4-line block, first at ./web/derived/series-store.ts:35): try { /files = readdirSync(dir).filter((file) => file.endsWith('.json')); /} catch { /let files: string[];
Empty method body (java): ./.standards/ci/templates/archunit/OutboxArchRules.java:30
Empty method body (java): ./.standards/ci/templates/archunit/SagaArchRules.java:33
SRP: possible god file (node) — ./web/content/keys.ts: 408 lines, 0 methods (split by responsibility)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:18)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:26)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:29)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:36)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:39)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:46)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:55)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:63)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:70)
Comments: commented-out code (./tests/acceptance/invariants-003.test.ts:78)
Comments: commented-out code (./tests/acceptance/gitignore.test.ts:48)
Comments: commented-out code (./tests/acceptance/gitignore.test.ts:52)
Comments: commented-out code (./tests/acceptance/gitignore.test.ts:57)
Comments: commented-out code (./tests/unit/design-revision.test.ts:136)
Comments: commented-out code (./tests/unit/design-revision.test.ts:143)
Comments: commented-out code (./tests/unit/design-revision.test.ts:157)
Comments: commented-out code (./tests/unit/design-revision.test.ts:161)
Comments: commented-out code (./tests/unit/design-revision.test.ts:171)
Comments: commented-out code (./tests/unit/design-revision.test.ts:175)
Comments: commented-out code (./tests/unit/design-revision.test.ts:183)
Comments: commented-out code (./tests/unit/design-revision.test.ts:199)
Comments: commented-out code (./tests/unit/design-revision.test.ts:206)
Comments: commented-out code (./tests/unit/design-revision.test.ts:215)
Comments: commented-out code (./tests/unit/design-revision.test.ts:222)
Comments: commented-out code (./tests/unit/design-revision.test.ts:226)
Comments: commented-out code (./tests/unit/design-revision.test.ts:234)
Comments: commented-out code (./tests/unit/design-revision.test.ts:242)
Comments: commented-out code (./tests/unit/design-revision.test.ts:249)
Comments: commented-out code (./tests/unit/design-revision.test.ts:256)
Comments: commented-out code (./tests/unit/series-coverage-gaps.test.ts:169)
Comments: commented-out code (./scripts/compute.ts:16)
Comments: commented-out code (./scripts/check-sitemap.ts:20)
Comments: comment restates the following line (./session-start-check.sh:25)
Comments: comment restates the following line (./session-start-check.sh:43)
Comments: commented-out code (./.standards/scripts/check-code-principles.selftest.sh:641)
Comments: section-divider comment (./.standards/scripts/check-code-principles.selftest.sh:639)
Comments: comment restates the following line (./.standards/scripts/tests/gate-telemetry.selftest.sh:150)
Comments: commented-out code (./.standards/scripts/check-bats-assertions.sh:21)
Comments: TODO/FIXME without an issue reference (./.standards/scripts/gate-clean-code-lib.sh:97)
Comments: commented-out code (./.standards/scripts/verify-production-deploy.sh:30)
Comments: commented-out code (./.standards/scripts/check-code-principles.sh:58)
Comments: commented-out code (./.standards/scripts/check-code-principles.sh:121)
Comments: TODO/FIXME without an issue reference (./.standards/scripts/check-code-principles.sh:57)
Comments: attribution comment (./.standards/scripts/check-code-principles.sh:59)
Comments: comment restates the following line (./.standards/scripts/check-remediation-budget.sh:139)
Comments: comment restates the following line (./.standards/scripts/check-remediation-budget.sh:209)
Comments: commented-out code (./.standards/scripts/lint-outbox-schema.sh:13)
Comments: commented-out code (./.standards/scripts/lint-outbox-schema.sh:22)
Comments: TODO/FIXME without an issue reference (./.standards/scripts/check-saga-timeouts.sh:185)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:51)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:53)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:90)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:92)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:132)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:134)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:149)
Comments: section-divider comment (./.standards/scripts/ci-smoke-test.sh:151)
Comments: commented-out code (./.standards/scripts/check-loop-files.sh:10)
Comments: section-divider comment (./.standards/scripts/init-ci.sh:6)
Comments: section-divider comment (./.standards/scripts/init-ci.sh:43)
Comments: commented-out code (./.standards/scripts/check-loop-triage.sh:39)
Comments: commented-out code (./.standards/scripts/check-loop-triage.sh:49)
Comments: commented-out code (./.standards/scripts/check-loop-triage.sh:67)
Comments: commented-out code (./.standards/scripts/token-stats.sh:10)
Comments: commented-out code (./.standards/scripts/classify-spec-size.sh:28)
Comments: commented-out code (./.standards/scripts/guard-env.sh:21)
Comments: commented-out code (./.standards/scripts/check-ci-sweeper.sh:37)
Comments: commented-out code (./.standards/scripts/check-security-hardening.sh:39)
Comments: commented-out code (./.standards/scripts/judgment-preflight.sh:16)
Comments: commented-out code (./.standards/scripts/check-model-env.sh:30)
Comments: commented-out code (./.standards/scripts/gate-stats.sh:20)
Comments: commented-out code (./.standards/scripts/check-pr-babysitter.sh:56)
Comments: TODO/FIXME without an issue reference (./.standards/scripts/check-saga-tests.sh:85)
Comments: comment restates the following line (./session-end-check.sh:14)
Comments: comment restates the following line (./session-end-check.sh:38)
Naming: boolean flag parameter (hasDedupStore) (./.standards/ci/templates/archunit/OutboxArchRules.java:197)
Naming: boolean flag parameter (hasCompensation) (./.standards/ci/templates/archunit/SagaArchRules.java:147)
Naming: boolean flag parameter (hasStateStore) (./.standards/ci/templates/archunit/SagaArchRules.java:201)
Naming: more than three parameters (Fprintf) (./.standards/ci/templates/go-saga-lint.go:61)
Naming: noise word in type name (PanelData) (./app/(admin)/admin/(authed)/page.tsx:12)
Naming: noise word in type name (ProposalData) (./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:12)
Naming: noise word in type name (ReviewData) (./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:11)
Naming: single-character identifier (a) (./web/admin/auth/constant-time.ts:9)
Naming: single-character identifier (b) (./web/admin/auth/constant-time.ts:10)
Naming: more than three parameters (plan) (./web/admin/routes.ts:42)
Naming: more than three parameters (yAt) (./web/charts/geometry.ts:34)
Naming: single-character identifier (x) (./web/charts/geometry.ts:61)
Naming: single-character identifier (y) (./web/charts/geometry.ts:62)
Naming: more than three parameters (xForValue) (./web/charts/geometry.ts:112)
Naming: noise word in type name (DataTableProps) (./web/components/DataTable.tsx:11)
Naming: single-character identifier (t) (./web/components/ProvenanceStrip.tsx:70)
Naming: single-character identifier (t) (./web/components/ProvenanceStrip.tsx:99)
Naming: single-character identifier (y) (./web/components/charts/LineChart.tsx:32)
Naming: more than three parameters (yAt) (./web/components/charts/LineChart.tsx:32)
Naming: single-character identifier (y) (./web/components/charts/RangeChart.tsx:27)
Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
Naming: single-character identifier (y) (./web/components/series/PyramidPanel.tsx:73)
Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-compute.ts:303)
Naming: more than three parameters (unfinishedOutcome) (./web/ingest/run-series.ts:190)
Naming: more than three parameters (addToBand) (./web/series/age-structure.ts:117)
Naming: more than three parameters (accumulateExcluded) (./web/series/age-structure.ts:124)
Naming: more than three parameters (accumulateExcluded) (./web/series/age-structure.ts:142)
Naming: more than three parameters (addToBand) (./web/series/age-structure.ts:145)
Naming: more than three parameters (structureFor) (./web/series/age-structure.ts:237)
Naming: more than three parameters (addToYear) (./web/series/countdown.ts:96)
Naming: more than three parameters (addToYear) (./web/series/countdown.ts:108)
Null-discipline: return null (./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:20)
Null-discipline: return null (./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:20)
Null-discipline: return null (./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:65)
Null-discipline: return null (./scripts/check-sitemap.ts:176)
Null-discipline: return null (./scripts/ingest-population-projection.ts:29)
Null-discipline: return null (./web/series/age-bands.ts:34)
Null-discipline: return null (./web/series/clock.ts:42)
Null-discipline: return null (./web/series/clock.ts:43)
Null-discipline: return null (./web/series/clock.ts:94)
Null-discipline: return null (./web/series/countdown.ts:155)
Null-discipline: return null (./web/series/countdown.ts:176)
Null-discipline: return null (./web/series/countdown.ts:223)
Null-discipline: return null (./web/series/countdown.ts:226)
Null-discipline: return null (./web/series/fuse.ts:37)
Null-discipline: return null (./web/series/fuse.ts:46)
Null-discipline: return null (./web/series/fuse.ts:48)
Null-discipline: return null (./web/sources/labels.ts:8)
Null-discipline: return null (./web/sources/eurostat.ts:56)
Null-discipline: return null (./web/sources/eurostat.ts:59)
Null-discipline: return null (./web/sources/ine.ts:23)
Null-discipline: return null (./web/sources/ine.ts:25)
Null-discipline: return null (./web/sources/ine.ts:31)
Null-discipline: return null (./web/sources/ine.ts:33)
Null-discipline: return null (./web/metrics/npv.ts:76)
Null-discipline: return null (./web/metrics/npv.ts:86)
Null-discipline: return null (./web/metrics/npv.ts:93)
Null-discipline: return null (./web/metrics/dependency-ratio.ts:49)
Null-discipline: return null (./web/metrics/pension-share.ts:20)
Null-discipline: return null (./web/metrics/pension-share.ts:29)
Null-discipline: return null (./web/metrics/cohort-irr.ts:66)
Null-discipline: null argument (./web/ingest/deterministic-json.ts:7)
Null-discipline: return null (./web/ingest/validate-figure.ts:43)
Null-discipline: return null (./web/ingest/run-series.ts:178)
Null-discipline: return null (./web/ingest/run-compute.ts:280)
Null-discipline: return null (./web/manifest/validate.ts:126)
Null-discipline: return null (./web/seo/share-card.tsx:108)
Null-discipline: return null (./web/content/registers.ts:110)
Null-discipline: return null (./web/content/registers.ts:128)
Null-discipline: return null (./web/content/registers.ts:130)
Null-discipline: null argument (./web/admin/http.ts:28)
Null-discipline: return null (./web/admin/revisions/pending-store.ts:66)
Null-discipline: return null (./web/admin/revisions/review-token.ts:39)
Null-discipline: return null (./web/admin/revisions/review-token.ts:41)
Null-discipline: return null (./web/admin/revisions/review-token.ts:48)
Null-discipline: return null (./web/admin/revisions/review-token.ts:51)
Null-discipline: return null (./web/admin/auth/session.ts:55)
Null-discipline: return null (./web/admin/auth/session.ts:59)
Null-discipline: return null (./web/admin/auth/session.ts:70)
Null-discipline: return null (./web/admin/auth/session.ts:72)
Null-discipline: return null (./web/components/public-page-props.ts:53)
Null-discipline: return null (./web/components/public-page-props.ts:56)
Null-discipline: return null (./web/components/series/PyramidPlate.tsx:140)
Null-discipline: return null (./web/components/ProvenanceStrip.tsx:47)
Null-discipline: return null (./web/components/metrics/figure-state.ts:25)
Null-discipline: return null (./web/components/metrics/range-views.ts:52)
Null-discipline: return null (./web/components/metrics/PlateBody.tsx:56)
Null-discipline: return null (./web/components/public/PyramidStep.tsx:20)
Null-discipline: return null (./web/components/public/CountdownPrecision.tsx:15)
Null-discipline: return null (./web/components/public/CountdownPrecision.tsx:26)
Null-discipline: return null (./web/components/public/CountdownPrecision.tsx:39)
Null-discipline: return null (./web/components/public/CountdownPrecision.tsx:50)
Null-discipline: return null (./web/components/public/SubjectFacts.tsx:19)
Null-discipline: return null (./web/components/public/SubjectFacts.tsx:27)
Null-discipline: return null (./web/components/public/DistanceStep.tsx:28)
Null-discipline: return null (./web/components/public/MethodRegion.tsx:32)
Null-discipline: return null (./web/components/public/MethodRegion.tsx:45)
Null-discipline: return null (./web/components/public/NumberStep.tsx:92)
Null-discipline: return null (./web/components/charts/LineChart.tsx:44)
Null-discipline: return null (./web/components/registers/DisputeSection.tsx:19)
Null-discipline: return null (./web/components/registers/AgreementSection.tsx:21)
Null-discipline: return null (./web/components/share/ShareRow.tsx:44)

The 213 WARNs are advisory only (complexity/DRY/YAGNI/SOLID are the blocking set; naming
and null-discipline never FAIL). 52 of them are inside the `.standards/` submodule, which
the script scans because it is not in its prune list. Scoped to this change:

command: bash .standards/scripts/check-code-principles.sh . -BaseRef main --json
exit: 0

```
fails 0 warns 7
Naming: more than three parameters (formatValue) (./web/components/public/NumberStep.tsx:37)
Naming: single-character identifier (y) (./web/components/series/PyramidPanel.tsx:73)
Null-discipline: return null (./web/series/clock.ts:42)
Null-discipline: return null (./web/series/clock.ts:43)
Null-discipline: return null (./web/series/clock.ts:94)
Null-discipline: return null (./web/components/series/PyramidPlate.tsx:140)
Null-discipline: return null (./web/components/public/NumberStep.tsx:92)
```

No new complexity, duplication, YAGNI or SOLID FAIL was introduced by the change.

## Evidence: scenario-to-behavior spot check

command: manual inspection of AC-006-04, AC-006-22, AC-006-32, AC-006-35 against tests/acceptance/spec-006-number-group.test.ts, spec-006-box.test.ts, spec-006-static-html.test.ts, spec-006-canonical-share.test.ts
exit: 0
at: 2026-11-06T11:29:00Z

**AC-006-04 (Task 2, "the group publishes exactly one quantity")** — the test slices
`clock__field--days` through `</p>`, asserts it contains `clock__value--days` and
`class="clock__label">${días}<`, asserts `clockLabels(group)` equals exactly `[días]`,
asserts the sub-day/years markers are absent, asserts the four content keys are still
declared, and asserts the anchor is non-null. Matches the Then clauses. **PASS.**

**AC-006-22 (Task 8, "no story step paints a ground")** — the test iterates every
`[data-top-step]`, requires `transparent` or the page ground, requires step 1's border
width `0` and `box-shadow: none`, measures the first-ink-to-header gap `>= 32`, and
measures the shared hairline `> 0`. Matches the Then clauses. **PASS.** (Independent
measurement below: 0 grounds, border 0, shadow none, clearance 59–61 px.)

**AC-006-32 (Task 12, "the served HTML is the value")** — the test reads the numeral, the
`data-rendered-at` attribute, recomputes `readClock(anchor, declaredInstant).days`,
compares the numeral's digits, waits two seconds and asserts step 1's text is unchanged,
and separately asserts `revalidate = 3600` in both layouts and `dynamic = 'force-static'`
in both pages. Matches the Then clauses. **PASS.**

**AC-006-35 (Task 13, "the shared origin is the serving origin")** — **partial.** The test
compares the served page's four share hrefs to the page's own `<link rel="canonical">`
origin and that origin to `SITE_URL`; the live equality (`PRODUCTION_URL`) is inside
`if (process.env.PRODUCTION_URL …)`. `PRODUCTION_URL` is set nowhere in `.github/` or
`.standards/.github/`, so the scenario's "equals the origin that served the page" clause
is **not exercised** by `npm test` or by this repo's CI. The test's own name is honest
("…and it is the canonical's"), so this is an uncovered clause, not a test asserting the
wrong thing. Recorded as **F2**; stage 5c must verify it against the live origin.

## Supplementary evidence

These are outside the five contract checks but are the measurements the design and the
claim "ISR is real" depend on.

### Build and ISR route table

command: npm run build
exit: 0
at: 2026-11-06T11:27:35Z

```
> pensions-system@0.0.0 prebuild
> tsx scripts/verify-derived.ts && … && tsx scripts/check-scenario-traceability-3digit.ts && tsx scripts/check-plain-language.ts
derived figures verified: 7 (2 computed, 5 unavailable)
derived series verified: 3
country scope gate: clean (5 locales)
public vocabulary gate: clean (5 locales)
scenario traceability (2-3 digit ids): 359 scenarios, all cited, all citations resolve
plain-language gate: clean (5 locales)

> pensions-system@0.0.0 build
> next build

▲ Next.js 16.4.3 (Turbopack)
✓ Compiled successfully in 208ms
  Running TypeScript ...
  Finished TypeScript in 1745ms ...
✓ Generating static pages using 11 workers (17/17) in 746ms

Route (app)                                             Revalidate  Expire
┌ ○ /                                                           1h      1y
├ ○ /_not-found
├   /[locale]
│ ├ ● /en                                                       1h      1y
│ ├ ● /fr                                                       1h      1y
│ ├ ● /de                                                       1h      1y
│ └ ● /it                                                       1h      1y
…
○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

`/` (the `es` route) and all four `/[locale]` children are **○/● with `Revalidate 1h`**.
`force-static` does **not** swallow `revalidate` in Next 16.4.3: the pages keep
`export const dynamic = 'force-static'`, the layouts declare `export const revalidate =
3600`, and the build output applies the window. D17 is real, not fiction.

### Served-page measurement (390×844, 1366×768, 1440×900; `es` and `de`)

command: npx tsx /tmp/verifier-measure.mts (scratch harness, removed after the run; it reuses tests/helpers/served-browser.ts — headless Chromium over CDP against `next start`, per-text-node `Range` rects, step 1 content box as the reference)
exit: 0
at: 2026-11-06T11:27:57Z

| locale | viewport | step 1 bg | border | shadow | first ink below header | max unit centre offset | residual max | numeral↔unit gap | painted grounds | accent text leaves | distinct sizes | max size (h1) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| es | 390×844 | transparent | 0 | none | 61 px | 0.01 px | 0.02 px | 12.0 px | 0 (contract) | 1 (`5534`) | 6 | 44 (40) |
| es | 1366×768 | transparent | 0 | none | 59 px | 0.01 px | 0.02 px | 12.0 px | 0 | 1 (`5534`) | 7 | 80 (64) |
| es | 1440×900 | transparent | 0 | none | 59 px | 0.01 px | 0.02 px | 12.0 px | 0 | 1 (`5534`) | 8* | 80 (64) |
| de | 390×844 | transparent | 0 | none | 61 px | 0.01 px | 0.02 px | 12.0 px | 0 (contract) | 1 (`5.534`) | 6 | 44 (40) |
| de | 1366×768 | transparent | 0 | none | 59 px | 0.01 px | 0.02 px | 12.0 px | 0 | 1 (`5.534`) | 7 | 80 (64) |
| de | 1440×900 | transparent | 0 | none | 59 px | 0.01 px | 0.02 px | 12.0 px | 0 | 1 (`5.534`) | 7 | 80 (64) |

\* The raw scan counts the chart's 9 px axis tick at 1440×900 `es` (see **F3**); the
acceptance test excludes `.demography__svg` from the count, so its count is 7.

At 390×844 the only raw non-transparent box is the **closed** mobile index panel
(`.index-panel`, 44×420), a phantom rect that contract §2.1 explicitly excludes; the
contract's rendered predicate returns **0** painted grounds (verified in the accent run).
The `.locale-group__cell[aria-current='page']` carries `font-weight: 600` against siblings'
`400`, with all backgrounds transparent; exactly one `aria-current="page"`.

**Box gone, axis centred:** step 1 paints nothing, has no border and no shadow, and its
first text ink starts 59–61 px below the header (floor 32). All four units — `<h1>`, step
label, number line, sentence — centre to ≤0.01 px with residual ≤0.02 px in both `es` and
`de` at all three viewports, and `scrollWidth === clientWidth` everywhere.

### Contrast, recomputed from the declared hexes

command: npx tsx /tmp/verifier-contrast.ts (scratch; tests/helpers/colour.ts `contrast`, `chroma`, `hue`)
exit: 0
at: 2026-11-06T11:28:56Z

Every pair the design lists was recomputed on the declared hexes, not on quoted numbers.
All rows pass, in both themes. Representative output:

```
--- light ---
ink-1 on surface-1: 16.83 (min 7) PASS
ink-2 on surface-1: 9.15 (min 4.5) PASS
ink-3 on surface-3: 4.60 (min 4.5) PASS
accent on surface-1: 9.85 (min 4.5) PASS
on-accent on accent: 9.85 (min 7) PASS
chromatic>20: accent
tint 10-20: (none)
max neutral chroma: 3.80
accent hue: 21.7 gap from 0: 21.7
--- dark ---
ink-1 on surface-1: 17.01 (min 7) PASS
ink-2 on surface-1: 10.69 (min 4.5) PASS
ink-3 on surface-3: 5.42 (min 4.5) PASS
accent on surface-1: 7.89 (min 4.5) PASS
on-accent on accent: 7.89 (min 7) PASS
chromatic>20: accent
tint 10-20: (none)
max neutral chroma: 3.89
accent hue: 15.2 gap from 0: 15.2
```

One chromatic value per theme (the accent, inside the 340°–40° band); every other public
token is ≤10 chroma; the 10–20 "tint" band is empty. The palette ships no failing pair.

### Projection form paints (measured, not read from CSS)

command: npx tsx /tmp/verifier-measure.mts (same scratch harness; computed SVG fill + CSS.supports in Chromium)
exit: 0
at: 2026-11-06T11:27:57Z

```
patternCount = 1            (#projection-hatch, inside the projected panel's own <defs>)
CSS.supports('fill','url(#projection-hatch)')            = true
CSS.supports('fill','repeating-linear-gradient(…))       = false
projected bars (42) computed fill = url("#projection-hatch")
observed bars (84) computed fill = rgb(70, 70, 67)       (--ink-2, neutral)
projected baseline stroke-dasharray = 6px, 4px; observed = none
```

The hatch is a real `<pattern>`, the projected bars resolve it, and the CSS gradient the
old `--chart-hatch` used is (correctly) not the mechanism. AC-006-27/28's form encoding
renders.

### Supersession lists

command: grep/count over tests/ and retired-criteria.test.ts
exit: 0
at: 2026-11-06T11:28:56Z

```
RETIRED (15) cited in tests/: must all be 0
AC-001-109 0 … AC-004-64 0        (all 15 are 0)

RE-POINTED (18) citations: must all be >=1
AC-001-99 2  AC-001-106 2  AC-001-110 2  AC-001-115 3  AC-001-117 2
AC-002-08 2  AC-002-17 2  AC-003-02 4  AC-003-03 4  AC-003-26 2
AC-004-06 2  AC-004-07 2  AC-004-59 2  AC-004-66 2  AC-004-68 2
AC-005-14 2  AC-005-16 2  AC-005-38 2

RETIRED entries 39
PRESERVED entries 21

skip mechanisms in tests/: 18 .skipIf(  (no .skip( / .only( / .todo( )
```

The 15 retired ids appear in no test; the 18 re-pointed ids keep their citation with the
assertion moved; `RETIRED` is 39 and `PRESERVED` is 21. `AC-001-099` in the tasks is the
archived id `AC-001-99` (two-digit form); its test now locates the years quantity in
`#metodo`.

## Findings

### F1 — The accent is spent four times; the letter is met, the design's purpose is defeated

**Verdict on the conflict: letter satisfied, purpose defeated.** This is the
"check-that-cannot-fail" pattern in a new form, and the criterion that cannot see it is
`AC-006-26`.

**Measured.** On the delivered page the accent (`#7a1f2b`, chroma 42.80) appears in four
places:

| Appearance | Declaration | Above the fold? |
|---|---|---|
| the day numeral's text | `.clock__value--days { color: var(--accent) }` | yes (the intended one) |
| the primary CTA's filled ground | `.hero__cta { background: var(--accent) }` | no (step 5) |
| the fuse's burnt segment | `.fuse__burnt { fill: var(--accent) }` | no (figures register) |
| the focus ring (state) | `--focus: 2px solid var(--accent)` | on focus only |

(`.admin-btn` is also accent-filled but is admin-only and outside the public bound.)

**What the design required.** `15-design.md` RESTRAINT 10 says "**one** chromatic value on
the entire page, at **one** place (the day numeral)", and its deliberate-violations list is
explicit: the CTA "becomes `--ink-1` with an `--on-accent` label", and the fuse's burnt
segment "is ink, not accent" (`--fuse-burnt: var(--ink-1)`, cord `--ink-3`). Neither
departure is implemented.

**Why the gates are still green.** `AC-006-11` counts *text leaves above the fold*; the
CTA's text is `--on-accent` and the fuse is an SVG `fill`, so neither is a text leaf.
`AC-006-26`'s *title* says "The accent paints one rule, and only one", but its *Then*
clause counts only `color:` declarations — a `background:` and a `fill:` are invisible to
it. `AC-006-24` counts chromatic *token values*, and both extra appearances reuse the same
accent value, so it sees one colour. The three criteria each measure a proxy narrower than
the design property ("one place on the whole page").

**Root cause is the spec set, not the Coder.** Two in-force criteria *require* the fills,
and `10-tasks.md` §4 neither retires nor re-points them:

- `AC-002-31`'s test asserts `.hero__cta { background: var(--accent) }` and that it is
  "the page's only accent-filled action". `RETIRED` does not contain it; `PRESERVED` does.
- `AC-003-22`'s test asserts `.fuse__burnt { fill: var(--accent) }`. §4.3 lists it as
  "kept in force (now stronger: no chroma at all)" — a parenthetical that cannot hold
  while its own unmodified test mandates the accent.

The Coder could not honour `15-design.md` without turning the suite red. The CSS comment
next to `.hero__cta` states the choice explicitly ("The primary action keeps its filled
accent ground (AC-002-31 stays in force)"). **Routing:** structure/spec →
Specifier (re-point `AC-002-31` and `AC-003-22`, and add one criterion that counts accent
appearances across `color`/`background`/`fill`/`stroke` on the whole page, not just text
leaves), then Refactorer/Coder; alternatively confirm the design's stricter intent and
amend `15-design.md`. This is not a runnable-gate FAIL and does not stop stage 5a, but the
Architect should **not** record the design's "one accent, one place" intent as met.

### F2 — `AC-006-35`'s live equality is never exercised

The test's live branch is inside `if (process.env.PRODUCTION_URL …)`. `PRODUCTION_URL` is
set in no workflow (`.github/`, `.standards/.github/`). In a plain `npm test` the test
compares the share hrefs to the page's own canonical link and that link to `SITE_URL` —
the exact self-referential shape D11 warns about. The scenario's core clause ("each
embedded URL's origin equals the origin that served the page … checked against the live
deployment") is therefore **unverified at stage 4 and unverified in CI**. Stage 5c must
supply `PRODUCTION_URL` (or its equivalent) and assert the equality against the live
preview origin. Routing: test/CI wiring → Coder/PR Opener, verification → stage 5c.

### F3 — `AC-006-14` excludes chart internals from the count; the design's note is factually wrong at 1440×900

The test filters `!el.closest('.demography__svg')` out of the above-fold leaf set, then
asserts the remaining sizes are token values and separately asserts every
`.demography__svg text` size is 9 px. That is a deliberate design instruction, but it
narrows contract §2.9 ("rendered text leaves above the fold", no exclusion). Independently
measured, the 9 px `.demography__tick` **does** enter the above-fold set at **1440×900
`es`** (8 distinct sizes including 9), contradicting the design's watch item ("not on any
of the fifteen matrix pages"). The count still passes (`8 ≤ 9`) and the 9 px literal is
pre-existing, so this is a recorded deviation, not a FAIL. It is listed because a future
change could rely on the design's incorrect claim.

### F4 — Design-principles tier auto-detect reads `mvp`, not the repo's `production`

The script globs `AGENTS_*.md`; this repo's declaration lives in `AGENTS.md`, so the gate
ran at `mvp`. The property-test gate was re-run explicitly at `--tier production` and is
clean (0 FAIL / 0 WARN), and the suite contains 7 new `fc.property` blocks across
`tests/unit/step-number-properties.test.ts` (3) and `tests/unit/pyramid-panel-properties.test.ts`
(4). Recorded so the tier mismatch is not mistaken for a pass-by-luck.

### F5 — The Refactorer's "11 skipped" does not reproduce

This run reports **0 skipped** (112 files / 1040 passed). The suite has exactly 18
`.skipIf(` guards (11 of them the spec-006 browser `describe` blocks), all keyed on
`BUILD_PRESENT && CHROME_PATH`; with the build and Chromium present every one executed.
No acceptance criterion is parked behind a CI-only path except `AC-006-35`'s live half
(F2). The "11" is most consistent with the 11 browser-guarded spec-006 suites counted at
suite level; it is not 11 parked tests.

### F6 — `AC-006-21`'s "no test is skipped" regex misses `.skipIf`

The check scans for `.(skip|only|todo)(`, which does not match `describe.skipIf(` or
`it.skipIf(`. The environment guards are legitimate, so this is a note, not a failure;
a future criterion that intends to forbid conditional tests should match `skipIf` too.

### What prior stages missed

- **The accent conflict is a spec-set defect, not a Coder defect.** The Coder's and
  Refactorer's reports treated the palette as coherent. Neither noticed that
  `15-design.md`'s CTA and fuse de-accenting cannot be implemented while `AC-002-31` and
  `AC-003-22` remain in force with tests that mandate `.hero__cta { background:
  var(--accent) }` and `.fuse__burnt { fill: var(--accent) }`. The Specifier's §4 should
  have re-pointed both criteria (or the design should have accepted the fills).
- **"11 skipped" is not reproducible.** This run reports 0 skipped with the build and
  Chromium present; the only guards are `BUILD_PRESENT`/`CHROME_PATH` conditionals.
- **The design's `.demography__tick` note is factually wrong.** It claims the 9 px literal
  is "not on any of the fifteen matrix pages"; independently measured, it enters the
  above-fold set at 1440×900 `es` (8 distinct sizes including 9). The count still passes.
- **`AC-006-35`'s live half is unwired.** `PRODUCTION_URL` is set in no workflow, so the
  serving-origin equality is unverified at stage 4 and in CI.
- **The design-principles tier auto-detect reads `mvp`.** It globs `AGENTS_*.md`; this repo
  declares `production` in `AGENTS.md`, so the property-test gate was re-run explicitly at
  the declared tier (clean) rather than trusted from the auto-detected run.

## No unaccounted behavior

Skimmed the tracked diff (43 files, +592/−2270) against `10-tasks.md`. Everything maps:

- `web/components/series/CountdownClock.tsx`, `web/series/clock-ticker.ts` deleted;
  `CLOCK_TICK_MS`, `CLOCK_FIELDS`, `ClockField` removed from `web/series/clock.ts` —
  Task 12.
- `NumberStep.tsx` loses the years line and sub-day subtree, becomes a server component,
  carries `data-rendered-at` — Tasks 2, 11, 12.
- `PyramidPlate.tsx` split into `PyramidPlate.tsx` + `PyramidPanel.tsx` (component-per-file
  / SRP, Refactorer); `PyramidPanel` adds the `<pattern>` and the projected-bar fill —
  Task 10.
- `tokens.css` colour revaluation and `--surface-hero` retirement — Task 9; `globals.css`
  centring, tap minimums, locale marker, ground removal, link ink, panel hue — Tasks 1, 4,
  5, 8, 9, 10.
- `web/content/site.ts` default origin — Task 13.
- Brand assets (`web/brand/generated.ts`, `app/icon.svg`, `app/apple-icon.png`,
  `app/favicon.ico`, `public/icon-192.png`, `public/icon-512.png`) regenerated from the
  old ink/on-accent (`#1e160d`/`#fdf2e1`) to the new (`#1a1a18`/`#fbfbfa`) — a consequence
  of Task 9, produced by the existing brand builder.
- Test-file edits are citation removals/re-points and the new `tests/helpers/served-browser.ts`
  harness — Task 7 / §4.5.

No production logic without a task behind it. Pre-existing dirt not attributed:
`.standards` pointer, `runs.jsonl`, `live-005-top.png`, `live-006box.png`, untracked
`specs/`.

## Re-verification and telemetry

Attempt **1, phase 1**. There is no prior `25-verification.md` for this spec, so this is a
full run, not a scoped re-trigger. No gate BLOCKed and no fix was routed.

Telemetry appended via `bash .standards/scripts/record-gate-run.sh` with
`SPEC_LOOP_COUNT=1`, `SPEC_PHASE1_RETRIES=0`, `SPEC_PHASE2_RETRIES=0`; `specSlug`
`006-centred-number`, `gatesFailed: []`, `warnings` for F1–F6, `outcome: "pass"`.

Operational note: in a child repo the helper's default `$ROOT/runs.jsonl` resolves to
`.standards/runs.jsonl` (the submodule), not the repo root. The record was written to the
repo-root `runs.jsonl` with `-f`, exactly once (`grep -c` = 1), and the stray submodule
line was removed. This is a helper-path quirk worth fixing upstream; it did not lose a
record.

---

# Verification — attempt 2 (phase 1, cycle 1 of max 3)

**Verifier:** spec-verifier (scoped re-verification — the revision-3 fix set)
**Attempt:** 2, phase 1 (cycle 1 of max 3)
**Branch:** `spec/006-centred-number`
**Date:** 2026-11-06
**Scope:** the fixes routed from attempt 1 — `AC-002-31`/`AC-003-22` inversions,
`AC-006-26`'s two-half inventory, `AC-006-36`/`AC-006-37`, the ten-criterion
counting-method sweep, the 37/39/21/20 totals, and the Coder's reported flake.
**Prior attempt:** attempt 1 above; preserved, not rewritten.

## Attempt 2 verdict

**BLOCK.** Two independent reasons, plus three recorded warnings:

1. **Full test suite — BLOCK (harness/tooling).** One initial run was green, but
   **6/6 repeated full runs exited 1**, every failure `Hook timed out in 10000ms` in a
   browser suite's `beforeAll`/`afterAll`. **No assertion failed**; the test bodies that
   ran passed (1043–1046 of 1046). The suite is not reliably green, so the gate cannot be
   transcribed as green. The Coder's "three consecutive full runs green" does not
   reproduce here.
2. **Scenario-to-behaviour — FAIL.** `AC-006-20`'s test uses the exact **shorter property
   list** its scenario forbids, and its `(?:^|;)` anchor misses a rule's *first*
   declaration. Injecting `outline: 1px solid #ff0000` and `border-top-color: #ff0000`
   leaves every literal test green. A false green, and a direct contradiction of the
   scenario's "the shorter property list is not used".

The revision-3 fixes themselves are substantially correct: the accent budget is now real
on `box-shadow` and `border-color` (both halves), the de-accented pairs pass, the ring is
bounded, the fuse pair improves, the inversions fail on the old CSS, the gap is 12.0 px,
and the totals are 37 / 39 / 21 / 20.

## Evidence (attempt 2): full test suite and the flake

command: npm test (one initial run, then six repeated full runs)
exit: 0 on the initial run; 1 on all six repeated runs
at: 2026-11-06T12:02:56Z

```
initial:  Test Files 112 passed (112) | Tests 1046 passed (1046) | exit 0
          start 2026-11-06T11:53:06Z end 2026-11-06T11:54:18Z

repeated full runs (identical command, no code change):
run 1  11:55:17Z-11:56:35Z  exit 1  Test Files 6 failed | 106 passed  Tests 1044 passed | 2 skipped
run 2  11:56:35Z-11:57:55Z  exit 1  Test Files 5 failed | 107 passed  Tests 1046 passed
run 3  11:57:55Z-11:59:30Z  exit 1  Test Files 3 failed | 109 passed  Tests 1043 passed | 3 skipped
run 4  11:59:30Z-12:00:37Z  exit 1  Test Files 1 failed | 111 passed  Tests 1046 passed
run 5  12:00:37Z-12:01:46Z  exit 1  Test Files 1 failed | 111 passed  Tests 1046 passed
run 6  12:01:46Z-12:02:56Z  exit 1  Test Files 1 failed | 111 passed  Tests 1046 passed

failing suites per run (all "Hook timed out in 10000ms"):
run 1  countdown-band-browser, no-empty-columns, spec-005-step-air-browser,
       spec-006-box, spec-006-canonical-share, spec-006-supersessions
run 2  countdown-band-browser, one-screen-per-step, spec-006-centred-axis,
       spec-006-number-group, spec-006-palette
run 3  no-empty-columns, spec-006-palette, spec-006-projection-form
run 4  spec-006-type-scale
run 5  spec-006-number-group
run 6  spec-005-step-air-browser
```

The Coder's exact "two browser-test failures" are **not recoverable** from the artifact —
no failing-run log was preserved — so the identification below is from these six
reproductions. The reproduced failures are suite-level hook timeouts, and the failing
suite set varies run to run.

**Flake determination: harness contention, not a geometry/painting defect.** The
evidence that distinguishes the two:

- **Every failure is a hook timeout** (`beforeAll`/`afterAll`), with **zero
  `AssertionError`** in 6/6 runs. A real geometry/painting defect would fail an assertion
  and name the measured value.
- **The failing set is non-deterministic** — 6 suites in run 1, 1 in run 4, a different
  single suite in run 6. A defect in a specific test would fail the same test every run.
- **Every test body that ran passed** (1043–1046 of 1046); the "skipped" counts are tests
  inside suites whose hook timed out.
- **Mechanism:** `vitest.config.ts` sets no `hookTimeout` (default 10 s), while
  `startServedBrowser()` waits for a `next start` server (up to 60 s) plus Chromium, and
  `served.close()` closes pages sequentially. Under the suite's own 11 concurrent browser
  files, setup/teardown can exceed 10 s. The Coder's "runner/browser contention"
  attribution is confirmed in kind — but "three consecutive green" is **not reproducible**
  here (1 green, 6 red), so the suite is not reliably green as claimed.

**Residual risk.** When a hook times out, that suite's browser assertions do not run, so a
real intermittent geometry defect could be dismissed as the same flake. The distinguishing
evidence is the error class: a hook timeout is not an assertion failure; the measured
geometry/painting assertions pass in every suite whose hook completes (including the
initial green run and the green-hook suites in each red run). To remove the residual risk,
the hook must be made deterministic — raise `hookTimeout` (or pass per-hook timeouts) and
parallelise `served.close()` — and the suite re-run. Routing: Coder/Refactorer, test
configuration only; do not lower any assertion.

## Evidence (attempt 2): `AC-006-20` — the sweep's one false green

command: npx vitest run tests/acceptance/spec-006-supersessions.test.ts tests/acceptance/visual-identity.test.ts (in a scratch copy with injected literals)
exit: 0 (the test passes with the literals present)
at: 2026-11-06T12:04:00Z

The scenario (`AC-006-20`) requires the full list — `color`, `background`,
`background-color`, `border`, `border-*-color`, `fill`, `stroke`, `outline`,
`outline-color`, `box-shadow` — and says "the shorter property list is not used, because it
would let a `fill` or a `box-shadow` carry a literal the criterion claims does not exist."

The test uses exactly the shorter list, and a `(?:^|;)` anchor that only matches a
declaration after a semicolon:

```
const literal = /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\blab\(/i;
for (const match of css.matchAll(/(?:^|;)\s*(color|background|background-color|border-color):\s*([^;]+);/g)) {
```

Construction (scratch copy, current CSS restored between cases):

```
inject .mutant-outline { outline: 1px solid #ff0000; }
       .mutant-border-top { border-top-color: #ff0000; border-top-style: solid; border-top-width: 1px; }
run   spec-006-supersessions + visual-identity
      Test Files 2 passed (2) | Tests 20 passed | 1 skipped  → exit 0   (false green)

inject .mutant-a { color: var(--ink-1); fill: #ff0000; }      (fill AFTER a semicolon)
run   visual-identity -t "no rule outside tokens.css declares a colour literal"
      AC-004-66 FAIL (fill: expected '#ff0000' not to match …)  → exit 1

inject .mutant-b { fill: #ff0000; color: var(--ink-1); }      (fill FIRST in the rule)
run   same test
      Tests 1 passed  → exit 0                                    (anchor misses first decl)
```

Two distinct defects, either sufficient to make the test unfalsifiable for its scenario:

1. **Short list.** `border`, `border-*-color`, `fill`, `stroke`, `outline`,
   `outline-color` and `box-shadow` are never matched. `fill`/`stroke` are partly covered
   by `AC-004-66`, and any non-`none` `box-shadow` is forbidden by `AC-004-65`; `outline`,
   `outline-color`, `border-*-color` and the `border` shorthand are covered by **no** test.
2. **Anchor.** A rule whose literal is its *first* declaration (after `{`) is invisible
   even for the four properties the test lists.

Routing: Coder — widen the `matchAll` to every paint property the scenario names and
anchor it so the first declaration in a rule is scanned (or parse declarations per rule,
as `spec-006-palette.test.ts` does). The scenario is right; the test was not swept.

## Evidence (attempt 2): `AC-006-26` — the widened inventory can now fail

command: scratch mutants (sheet half) + headless Chromium injection (element half)
exit: 1 on the box-shadow and border-color mutants; 0 on the border shorthand
at: 2026-11-06T12:04:00Z

**Sheet half** (`.standards`-style rule scan, current CSS restored between cases):

```
.mutant-shadow   { box-shadow: 0 0 0 2px var(--accent); }
  → AC-006-26 "exactly one resting rule declares the accent" FAIL
    expected [ {…}, {…} ] to deeply equal [ {…} ]            exit 1
.mutant-border   { border-color: var(--accent); border-style: solid; border-width: 1px; }
  → same FAIL                                               exit 1
.mutant-shorthand{ border: 1px solid var(--accent); }
  → PASS                                                    exit 0   (residual gap)
```

**Element half** (real served page, `es` 1440×900, then runtime injection):

```
base                          → 1 hit: span.clock__value--days channels ["color"]
+.step__label accent box-shadow → 2 hits: h2.step__label ["box-shadow"] + numeral ["color"]
+.step__label accent border     → 2 hits: h2.step__label ["border-top/right/bottom/left-color"]
                                 + numeral ["color"]
```

The element half sees a `box-shadow` and a `border-*-color`; the test asserts exactly one
hit, so each injection fails it. **The widened criterion is real for the obvious cases,
on both halves.**

**Residual gap (WARN):** the sheet half's `PAINT_CHANNELS` omits the `border`/`outline`
shorthands, so a shorthand in a rule that renders nothing (e.g. a non-focus state) is
invisible to both halves. The element half catches a shorthand on a rendered element
(computed `border-*-color`). Adding `border`/`outline` to the sheet's channel regex, or
documenting the exclusion, closes it.

## Evidence (attempt 2): de-accented pairs, ring, fuse, gap

command: npx tsx /tmp/v006b-contrast.mts; npx tsx /tmp/v006b-browser.mts
exit: 0
at: 2026-11-06T12:03:43Z (contrast), 2026-11-06T12:03:10Z (browser)

```
CTA text (--surface-1 on --ink-1):            light 16.83 / dark 17.01   (min AAA 7) PASS
fuse burnt/cord (--ink-1 on --ink-3):         light 3.11  / dark 2.57    (3 / 2.5)  PASS
numeral (--accent on --surface-1):            light 9.85  / dark 7.89    (min 4.5)  PASS
--on-accent on --accent:                      light 9.85  / dark 7.89    (min 7)    PASS
ring inside the ink fill (--accent on --ink-1): light 1.71 / dark 2.15   (<3, offset required) PASS
accent chroma:                                42.80 light / 32.74 dark
```

The Coder's quoted **16.13:1** (CTA) and the spec's quoted **2.12:1** (ring inside the
fill) are both numerically wrong — the recomputed values are 16.83/17.01 and 1.71/2.15.
The test assertions (`>= 7`, `< 3`) hold, so this is a documentation WARN, not a gate
failure.

**Ring bounds** (`es`, 1440×900, headless Chromium):

```
at rest   outlinesAtRest 0
Tab       ringCount 1, a, style solid, width 2px, outline-offset 2px
blur      ringCount 0
```

Exactly one `var(--focus)` rule in the sheet, `:focus-visible` (verified by rule scan);
no resting outline declaration. Ring on the page ground 9.85 / 7.89 (>=3); inside the ink
fill 1.71 / 2.15 (<3), which is why `--focus-offset: 2px` is load-bearing. `AC-006-36`
holds.

**Fuse floor** (`AC-006-37`): burnt `--ink-1`, cord `--ink-3`; light 3.11 ≥ 3, dark 2.57
≥ 2.5; both cues (burnt width and label) survive in step 4. Holds.

**Clock unit gap**, independently measured with per-text-node `Range` rects:

```
es 1440×900  gap 12.0 px, unit 19 px, same line true
es  390×844  gap 12.0 px, unit 19 px, same line true
de 1440×900  gap 12.0 px, unit 19 px, same line true
```

The CSS comment's 40.23 px is the with-reservation design figure; the render is 12.0 px,
matching `AC-006-03` and the 5ch-reservation removal. Holds.

## Evidence (attempt 2): the inversions fail on the old CSS

command: scratch copy with `.hero__cta { background: var(--accent); color: var(--on-accent) }` and `.fuse__burnt { fill: var(--accent) }` restored
exit: 1 (expected — the inverted assertions must reject the old CSS)
at: 2026-11-06T12:04:00Z

```
AC-002-31 "ink block with surface ink"      FAIL  expected … to contain 'background: var(--ink-1)'
AC-002-31 "no rule fills with the accent"   FAIL  expected [ '.hero__cta' ] to deeply equal []
AC-003-22 "burnt is --ink-1 …"              FAIL  expected … to match /\.fuse__burnt … fill: var(--ink-1)/
AC-006-26 "exactly one resting rule …"      FAIL  expected [ …(3) ] to deeply equal [ …(1) ]
AC-006-26 "the paints that carried …"       FAIL  .hero__cta background … not to contain '--accent'
Test Files 3 failed | Tests 5 failed | 3 passed | 41 skipped
```

The two inversions are genuine, not relabelled: restoring the old accent fills turns the
suite red in exactly the two carriers plus the widened budget.

## Evidence (attempt 2): ISR and the totals

command: npm run build; npx tsx scripts/check-scenario-traceability-3digit.ts; list greps
exit: 0
at: 2026-11-06T12:03:24Z (build), 2026-11-06T11:52:58Z (traceability)

```
✓ Compiled successfully in 283ms
✓ Generating static pages using 11 workers (17/17)

Route (app)                                             Revalidate  Expire
┌ ○ /                                                           1h      1y
│ ├ ● /en                                                       1h      1y
│ ├ ● /fr                                                       1h      1y
│ ├ ● /de                                                       1h      1y
│ └ ● /it                                                       1h      1y

scenario traceability (2-3 digit ids): 361 scenarios, all cited, all citations resolve
declared AC-006 scenarios: 37
RETIRED: 39   PRESERVED: 21   re-pointed: 20 (includes AC-002-31, AC-003-22)
```

ISR is real (`/` and every `/[locale]` child `Revalidate 1h`), the scenario count is 37,
`RETIRED` is 39, `PRESERVED` is 21, and the re-pointed list is 20 including the two
paint-channel inversions.

## Attempt 2 findings

- **A2-F1 (BLOCK, harness):** the full suite is not reliably green — 6/6 repeated runs
  exit 1 on `Hook timed out in 10000ms`, 0 assertion failures. Fix `hookTimeout` /
  teardown, not assertions. Routing: Coder/Refactorer (test config).
- **A2-F2 (FAIL, test coverage):** `AC-006-20`'s test uses the forbidden shorter property
  list and misses a rule's first declaration; `outline`/`border-top-color` literals pass
  every literal test. Routing: Coder (widen and re-anchor the scan).
- **A2-F3 (WARN):** the `AC-006-26` sheet half does not see `border`/`outline` shorthands;
  the element half sees rendered shorthands. Add them to `PAINT_CHANNELS` or document the
  exclusion.
- **A2-F4 (WARN, documentation):** 16.13 vs 16.83/17.01 (CTA) and 2.12 vs 1.71/2.15 (ring
  inside the ink fill); the assertions hold.
- **A2-F5 (WARN, spec text):** `10-tasks.md` §4.4 says `AC-006-11` now counts "every
  above-fold element on every channel, and *any* hue"; the scenario and test still count
  **text leaves**. The scenario is satisfied; the task's summary overstates it. The
  non-text channels are covered by `AC-006-10` (thick borders/shadows) and `AC-006-26`
  (accent paints); a non-accent 1 px border above the fold is the one edge neither sees.

## Attempt 2 totals

| Item | Attempt 1 | Attempt 2 |
|---|---|---|
| AC-006 scenarios | 35 | **37** |
| `RETIRED` | 39 | **39** |
| `PRESERVED` | 21 | **21** |
| Re-pointed | 18 | **20** |
| Traceability (declared) | 359 | **361** |
| Test files / tests | 112 / 1040 | **112 / 1046** |
| `tsc` | 0 | **0** |
| `lint` | 0 | **0** |
| Design principles | 0 FAIL / 213 WARN | **0 FAIL / 213 WARN** (scoped 7 WARN) |
| ISR | 1h | **1h** |
| Full-suite stability | green | **1 green / 6 red (hook timeouts)** |

Attempt 2 is a scoped re-verification; attempt 1 above is unchanged. No production code
was written, nothing was committed or pushed.

---

# Verification — attempt 3 (phase 1, cycle 2 of max 3)

**Verifier:** spec-verifier (scoped re-verification — the cycle-2 stability and `AC-006-20` fixes)
**Attempt:** 3, phase 1 (cycle 2 of max 3)
**Branch:** `spec/006-centred-number`
**Date:** 2026-11-06
**Scope:** the two attempt-2 BLOCK classes — browser-suite stability (port allocation,
hook timeout, teardown) and `AC-006-20`'s literal scan — plus the corrected contrast
figures, the inversion guard, and the standard gates.
**Prior attempts:** 1 and 2 above; preserved, not rewritten.

## Attempt 3 verdict

**PASS.** All six gates are green and the suite is stable across five independent
consecutive runs. The cycle-2 fixes are real: the debugging port is OS-allocated, the
hook budget clears the helper's own 60 s deadline, `AC-006-20` now scans every paint
channel in every declaration position (including the first), and `AC-006-26` now sees the
`border`/`outline` shorthands. Two documentation warnings remain (stale figures in the
spec text; a TOCTOU residual in `freePort`), neither a gate.

### Five consecutive full-suite runs

| Run | Start (UTC) | End (UTC) | Exit | Files | Tests |
|---|---|---|---|---|---|
| 1 | 12:17:46 | 12:19:02 | **0** | 112 | 1047 |
| 2 | 12:19:02 | 12:20:19 | **0** | 112 | 1047 |
| 3 | 12:20:19 | 12:21:31 | **0** | 112 | 1047 |
| 4 | 12:21:31 | 12:22:49 | **0** | 112 | 1047 |
| 5 | 12:22:49 | 12:24:06 | **0** | 112 | 1047 |

Leaked `next-server`/Chromium/vitest processes before the series: **0**; after: **0**.
Every run: `Test Files 112 passed (112)`, `Tests 1047 passed (1047)`. No hook timeout, no
failure, no skip. The Coder's "5 consecutive, all exit 0, 112/1047" is **reproduced**
independently.

## Evidence (attempt 3): the port hypothesis

command: code inspection of tests/helpers/chromium.ts, tests/helpers/served-browser.ts, vitest.config.ts
exit: 0 (inspection)
at: 2026-11-06T12:24:10Z

**The fix is in the code, not in the test count:**

```
// tests/helpers/chromium.ts
async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {           // OS-allocated
      const address = server.address();
      const port = typeof address === 'object' && address !== null ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}
export async function launchBrowser(port?: number) {
  const debuggingPort = port ?? (await freePort());
  … spawn(CHROME_PATH, ['--headless=new', `--remote-debugging-port=${debuggingPort}`, …])
}
```

`versionOf` retries **600 × 100 ms = 60 s** (was 100 × 100 ms = 10 s); the page-load wait
is **60 s** (was 20 s); `served-app.ts`'s `waitForServer` is 60 s; `served-browser.ts`'s
`close()` is **`Promise.all(pages.map((page) => page.close()))`** (was a serial loop);
`vitest.config.ts` sets **`hookTimeout: 120_000`** with the reason recorded (2× the
helper's 60 s deadline).

**Consistent with the attempt-2 failure pattern? Yes.** The old default was
`9400 + random(400)`. With 13 browser files booting concurrently the birthday collision
probability is `1 − exp(−13·12/(2·400)) ≈ 17.7 %` (the Coder's ~19 % is the same
arithmetic). On a collision the second Chrome cannot bind the port; `versionOf(port)`
then reads the **first** browser's `/json/version` and the second test attaches to the
first browser. When either file's `browser.close()` runs `child.kill('SIGKILL')`, it kills
the shared browser and the other file's pages die — the hook never settles. That predicts
exactly what attempt 2 saw: **a non-deterministic failing suite set, hook timeouts, zero
assertion failures, and every test body that ran passing** (the surviving file keeps a
working page; the collided file loses its target). A deterministic defect in a specific
test would have failed the same suite every run; it did not.

**Residual (WARN):** `freePort()` closes its probe socket before Chrome binds, so a
TOCTOU window remains in principle. The OS ephemeral range is large and the window is
short; the collision probability is far below the old 400-port birthday. A retry-on-bind
or a child-side port report would remove it entirely, but it is not required for this
gate.

## Evidence (attempt 3): injection proofs

command: scratch copy at /tmp/v006c-scratch, current CSS restored between cases; sha256 of the real CSS 3bde5009425fff1f1aef58f2d38a25afa0d787aa85ef0a1ae968ec4c833f20b9
exit: 1 on every injected case (the tests fail as they must); 0 after restore
at: 2026-11-06T12:25:17Z

| Injected declaration | Test | Result |
|---|---|---|
| `.mutant-outline { outline: 1px solid #ff0000; }` (first/only declaration) | `AC-006-20` | **FAIL** (both assertions) |
| `.mutant-first { border-top-color: #ff0000; border-top-style: solid; border-top-width: 1px; }` (**literal in first-declaration position** — the attempt-2 hole) | `AC-006-20` | **FAIL** — `expected '#ff0000' to match /var(--|^none$|…/` |
| `.mutant-accent-outline { outline: 1px solid var(--accent); }` | `AC-006-26` sheet half | **FAIL** (2 declarations) |
| `.mutant-accent-border { border-color: var(--accent); … }` | `AC-006-26` sheet half | **FAIL** (2 declarations) |
| `.mutant-accent-shorthand { border: 1px solid var(--accent); }` (the attempt-2 shorthand gap) | `AC-006-26` sheet half | **FAIL** (2 declarations) |

Each case was applied to the scratch copy, the test run, and the real CSS restored. The
final scratch file is **byte-identical** to the real one (`cmp` identical; sha256
`3bde5009…` both sides). `AC-006-20`'s non-vacuity guard also passes on the clean sheet
(`paint.length > 50`, includes `border` and `fill`).

## Evidence (attempt 3): corrected contrast figures

command: npx tsx /tmp/v006c-contrast.mts (tests/helpers/colour.ts `contrast` on the declared hexes)
exit: 0
at: 2026-11-06T12:25:20Z

```
CTA text --surface-1 on --ink-1:         light 16.83 / dark 17.01   PASS (>= 7)
ring --accent on --ink-1:                light 1.71  / dark 2.15    PASS (< 3, offset required)
fuse --ink-1 on --ink-3:                 light 3.11  / dark 2.57    PASS (3 / 2.5)
numeral --accent on --surface-1:         light 9.85  / dark 7.89    PASS (>= 4.5)
```

Both corrected figures are confirmed: **16.83 / 17.01** for the CTA pair and
**1.71 / 2.15** for the ring inside the ink fill. They are in `web/styles/globals.css`'s
CTA comment and `spec-006-palette.test.ts`'s `AC-006-36` comment. **The spec text is
still stale** (`10-tasks.md` §4.2 and §Task 9 carry 16.13 / 2.12; `AC-006-palette.md`
line 56 carries 2.12) — a documentation WARN, not a gate, because no assertion quotes
those numbers.

## Evidence (attempt 3): the inversions still fail on the old CSS

command: scratch copy with `.hero__cta { background: var(--accent); color: var(--on-accent) }` and `.fuse__burnt { fill: var(--accent) }` restored
exit: 1 (expected)
at: 2026-11-06T12:25:26Z

```
AC-002-31 "ink block with surface ink"      FAIL  expected … to contain 'background: var(--ink-1)'
AC-002-31 "no rule fills with the accent"   FAIL  expected [ '.hero__cta' ] to deeply equal []
AC-003-22 "burnt is --ink-1 …"              FAIL  expected … to match /\.fuse__burnt … fill: var(--ink-1)/
AC-006-26 "exactly one resting rule …"      FAIL  expected [ …(3) ] to deeply equal [ …(1) ]
AC-006-26 "the paints that carried …"       FAIL  .hero__cta background … not to contain '--accent'
Test Files 3 failed | Tests 5 failed | 3 passed | 41 skipped
```

Restored byte-identically (`sha256 3bde5009…` both sides). Nothing was weakened: the
re-pointed criteria still reject the pre-fix CSS.

## Evidence (attempt 3): gates and ISR

command: npx tsc --noEmit; npm run lint; npm run build; bash .standards/scripts/check-code-principles.sh . --json
exit: 0 for all
at: 2026-11-06T12:25:41Z

```
tsc --noEmit: 0
npm run lint: 0
npm run build: 0
  ✓ Compiled successfully; ✓ Generating static pages (17/17)
  Route (app)                                             Revalidate  Expire
  ┌ ○ /                                                           1h      1y
  │ ├ ● /en                                                       1h      1y
  │ ├ ● /fr                                                       1h      1y
  │ ├ ● /de                                                       1h      1y
  │ └ ● /it                                                       1h      1y
design-principles: 0 FAIL / 213 WARN  (tier auto-detected mvp; scoped -BaseRef main: 0 FAIL / 7 WARN)
```

The seven scoped WARNs are the same advisory naming/null-discipline hints as attempts 1–2;
none is a FAIL. `AC-006-36`/`AC-006-37` and the 37/39/21/20 totals are unchanged and green
in the full suite.

## Attempt 3 findings

- **A3-W1 (WARN, documentation):** the corrected contrast values are in the CSS/test
  comments, but `10-tasks.md` (§4.2, §Task 9 watch item) and `AC-006-palette.md` (line
  56) still state 16.13 and 2.12. A one-line spec-text edit; no assertion depends on the
  quoted numbers.
- **A3-W2 (WARN, residual):** `freePort()`'s close-then-bind window is a TOCTOU residual;
  the collision risk is now far below the old 400-port birthday. Optional hardening:
  retry on bind failure.
- **A3-W3 (WARN, carried from attempt 2):** `10-tasks.md` §4.4 still says `AC-006-11`
  counts "every above-fold element on every channel"; the scenario and test count **text
  leaves**. The scenario is satisfied; the task summary overstates it. No test change
  needed unless the broader claim is intended.

## Attempt 3 totals

| Item | Attempt 1 | Attempt 2 | Attempt 3 |
|---|---|---|---|
| AC-006 scenarios | 35 | 37 | **37** |
| `RETIRED` / `PRESERVED` | 39 / 21 | 39 / 21 | **39 / 21** |
| Re-pointed | 18 | 20 | **20** |
| Traceability (declared) | 359 | 361 | **361** |
| Test files / tests | 112 / 1040 | 112 / 1046 | **112 / 1047** |
| `tsc` / `lint` | 0 / 0 | 0 / 0 | **0 / 0** |
| Design principles | 0 FAIL / 213 WARN | 0 FAIL / 213 WARN | **0 FAIL / 213 WARN** (scoped 0/7) |
| ISR | 1h | 1h | **1h** |
| Full-suite stability | green | 1 green / 6 red | **5 green / 5, 0 leaked** |

Attempt 3 is a scoped re-verification; attempts 1 and 2 above are unchanged. No production
code was written, nothing was committed or pushed. The scratch copy was removed after the
runs; the working tree carries only the Coder's changes.

---

# Verification — attempt 4 (phase 1, cycle 3 of max 3 — the last)

**Verifier:** spec-verifier (scoped re-verification — the aborted-stage-5a delta)
**Attempt:** 4, phase 1 (cycle 3 of max 3)
**Branch:** `spec/006-centred-number`
**Date:** 2026-11-06
**Scope:** the tree the aborted Mutation Runner left behind — a +9-test delta and production
mtimes after attempt 3's PASS. The question is tree certifiability, not a new feature.
**Prior attempts:** 1–3 above; preserved, not rewritten.

## Attempt 4 verdict

**PASS. The tree is certifiable.** The +9 tests are legitimate, non-vacuous additions; no
production file is left in a mutated state; and every gate holds on the current tree.

- `npm test`: **113 files / 1056 tests passed**, exit **0** (the 1047 → 1056 delta is exactly
  the 9 new tests).
- `npx tsc --noEmit`: **0**.
- All nine new tests were mutation-checked from a scratch copy: removing the production
  guard/separator each targets makes the corresponding test fail, then the file is restored
  **byte-identically**. They are not vacuous and not duplicates.
- Every `web/` production change (plus the two `app/` ISR layouts) was read against
  `10-tasks.md`/`15-design.md`; the current text matches the required change. No surviving
  mutation.

## Evidence (attempt 4): the current tree

command: npm test; npx tsc --noEmit
exit: 0 (test 0, tsc 0)
at: 2026-11-06T13:44:35Z

```
Test Files  113 passed (113)
     Tests  1056 passed (1056)
  Duration  65.02s
test_exit=0 tsc_exit=0
```

The 9-test delta is `tests/unit/spec-006-mutation-kills.test.ts` (+4) and the appended
`describe` in `tests/acceptance/site-identity.test.ts` (+5). Every earlier count is
unchanged: 37 AC-006 scenarios, `RETIRED` 39, `PRESERVED` 21, re-pointed 20.

## Evidence (attempt 4): the nine new tests are legitimate

command: scratch copy /tmp/v006d-scratch; each production guard mutated, the new test run, the file restored
exit: 1 for every mutation (the test fails as it must); restore byte-identical every time
at: 2026-11-06T13:45:39Z

| New test | Production mutation | Result |
|---|---|---|
| `AC-006-04`: numeral and unit separated by a space | remove `{' '}` in `NumberStep.tsx` | **FAIL** `'5540días'` vs `'5540 días'` |
| `AC-006-27`: year and state word separated by a space | remove `{' '}` in `PanelHead` | **FAIL** `'2025observado'` |
| `AC-004-16`: empty band list annotates the base band | drop `largest === undefined ? BASE_BAND :` | **FAIL** `TypeError: … reading 'band'` |
| `AC-004-15`: empty year list renders the empty finding | drop `if (!first || !last) return ''` | **FAIL** `TypeError: … reading 'year'` |
| `AC-001-35`: every trailing slash is stripped | `replace(/\/+$/, '')` → `replace(/\/$/, '')` | **FAIL** `…es//` vs `…es` |
| `AC-001-35`: address cap is 254, inclusive | `> 254` → `> 255` | **FAIL** promise resolved instead of rejecting |
| `AC-001-35`: no cookie-setting counter | `COOKIELESS_COUNTER_ENABLED = true` | **FAIL** `true` vs `false` |
| `AC-001-35`: inbox pattern anchored | remove `^` and `$` from `CONTACT_PATTERN` | **FAIL** unanchored address accepted |
| `AC-001-35`: only a bare root collapses | drop `url.search === ''` | **FAIL** query lost |

**Not duplicates.** The shipped `spec-006-one-number` / `spec-006-number-group` / `spec-006-projection-form`
tests render through `textOf`, which replaces tags with a **space** and therefore cannot see a
dropped `{' '}`; the new `bareText` tests remove tags **without** inserting a space. The
existing `spec-004-mutation-kills` tests exercise `annotatedBand` and `findingSentence` on the
**non-empty** fixtures; the new ones target the empty-payload guards those fixtures never
reach. The five `AC-001-35` tests exercise `site.ts` branches the shipped defaults never take.
Each is a survivor-kill for the aborted run, on rendered output, never on a helper that
rebuilds the expectation.

## Evidence (attempt 4): no production file is left mutated

command: git diff main -- web/; read every changed file against 10-tasks.md / 15-design.md
exit: 0 (review)
at: 2026-11-06T13:46:00Z

| File (tracked diff under `web/`) | Current change | Spec | Positive confirmation |
|---|---|---|---|
| `web/brand/generated.ts` | `ground #1a1a18`, `onGround #fbfbfa` | T9 palette | matches the new ink/surface values |
| `web/components/public/NumberStep.tsx` | server-rendered group; `{' '}`; `data-rendered-at`; `measured` guards; elapsed → sentence | T2/T11/T12 | read in full: no `'use client'`, no timer, `{' '}` present, all guards intact |
| `web/components/series/CountdownClock.tsx` | deleted | T12 | file gone |
| `web/components/series/PyramidPlate.tsx` | panel extracted; table/readout/caption retained; `findingSentence` guard; null guard | T10 | read in full: `if (!first \|\| !last) return ''` and `series.availability !== 'computed' … return null` both intact; only the panel moved |
| `web/components/series/PyramidPanel.tsx` (new) | panel, bars, axis, hatch; `{' '}`; `annotatedBand` guard | T10 | read in full: `largest === undefined ? BASE_BAND : largest.band`, `sideLength` clamp, `#projection-hatch` present |
| `web/content/site.ts` | `DEFAULT_SITE_URL` → `https://pensions-system-delta.vercel.app` | T13 | exactly one value changed; no `-projects.vercel.app` |
| `web/series/clock-ticker.ts` | deleted | T12 | file gone |
| `web/series/clock.ts` | `CLOCK_TICK_MS`, `CLOCK_FIELDS`, `ClockField` removed | T12 | only those three exports removed; `readClock` intact |
| `web/styles/globals.css` | links/CTA/fuse ink; centring; tap mins; locale weight; no step ground; one panel hue + hatch | T1/T4/T5/T8/T9/T10 | read the whole diff: every value matches the spec; accent only on the numeral |
| `web/styles/tokens.css` | palette revalued; `--surface-hero` retired; aliases re-pointed | T9 | every hex matches `15-design.md`; no type/space/geometry token changed |
| `app/(public)/(home)/layout.tsx` | `revalidate = 3600` | T12/D17 | present |
| `app/(public)/[locale]/layout.tsx` | `revalidate = 3600` | T12/D17 | present |

The split is a pure move: the old `PyramidPlate.tsx` (at `main`) already carried the
`annotatedBand` empty-list guard, the `findingSentence` empty-years guard and the
`bandByYear` zero fallback; the new panel preserves all three. The only behavioural change
in the split is the projected-series `<pattern>` (Task 10). No production file is mutated.

## Evidence (attempt 4): the canonical clause

command: grep/read web/content/site.ts and the AC-006-34/35 carriers
exit: 0
at: 2026-11-06T13:46:30Z

`DEFAULT_SITE_URL = 'https://pensions-system-delta.vercel.app'` — **no `-projects.vercel.app`
segment**. `AC-006-34`'s test asserts `SITE_URL` and the `site.ts` source both lack the alias,
that the URL is a bare origin, and that `SITE_URL` still overrides it. That clause **is
genuinely exercised** (the suite is green on it).

`AC-006-35`'s *equality against the serving origin* is still inside
`if (process.env.PRODUCTION_URL …)`. `PRODUCTION_URL` is set in no workflow
(`.github/`, `.standards/.github/`), so the live half is **not exercised** by `npm test` or
this repo's CI. Stage 5c must supply it. Recorded as **A4-W2** (carried from attempts 1–2),
not a gate: the committed default and every published URL are correct; the live equality is
a deploy-time check.

## Evidence (attempt 4): prior gates hold on this tree

command: traceability; npm run lint; npm run build; check-code-principles.sh; served-page accent inventory
exit: 0 for all
at: 2026-11-06T13:47:06Z

```
scenario traceability (2-3 digit ids): 361 scenarios, all cited, all citations resolve  (exit 0)
upstream traceability --json: fails []                                                  (exit 0)
npm run lint: 0
design-principles: 0 FAIL / 213 WARN   (scoped -BaseRef main: 0 FAIL / 7 WARN)
npm run build: 0
  Route (app)                                             Revalidate  Expire
  ┌ ○ /                                                           1h      1y
  │ ├ ● /en                                                       1h      1y
  │ ├ ● /fr                                                       1h      1y
  │ ├ ● /de                                                       1h      1y
  │ └ ● /it                                                       1h      1y
accent inventory (served page, es 1440/390, de 1440, en 1440):
  hits 1 each — span.clock__value--days, channel ["color"]
```

The public resting accent paint site is exactly **one** (the numeral). `grep` confirms the
only `var(--accent)` uses in the sheet are `.admin-btn` (admin-only), `.clock__value--days`
(the numeral) and the `--focus` token (a `:focus-visible` state). The attempt-3 acceleration
fixes are unchanged; this run adds no production change to destabilise them.

## Attempt 4 findings (all WARN; none blocks)

- **A4-W1 (WARN, stale comment):** the comment above `a { color: var(--ink-2) }` in
  `globals.css` still says "The primary action keeps its filled accent ground … `--on-accent`
  text". The code is correct (`.hero__cta` is `--ink-1` / `--surface-1`); the comment
  describes the pre-revision-3 state.
- **A4-W2 (WARN, carried):** `AC-006-35`'s live equality needs `PRODUCTION_URL`, which no
  workflow sets; stage 5c must verify it.
- **A4-W3 (WARN, carried):** the corrected contrast figures live in the CSS/test comments;
  `10-tasks.md` (16.13/2.12) and `AC-006-palette.md` line 56 (2.12) still carry the old
  numbers. No assertion quotes them.
- **A4-W4 (WARN, carried):** `10-tasks.md` §4.4 overstates `AC-006-11` ("every element on
  every channel"); the scenario and test count text leaves, which is satisfied.
- **A4-W5 (WARN, carried):** `freePort()`'s close-then-bind TOCTOU remains. Attempt 3's
  5/5 green series stands; the only delta here is nine static tests, and the browser helper
  and `hookTimeout` are unchanged.

## Attempt 4 totals

| Item | Attempt 1 | Attempt 2 | Attempt 3 | Attempt 4 |
|---|---|---|---|---|
| AC-006 scenarios | 35 | 37 | 37 | **37** |
| `RETIRED` / `PRESERVED` | 39 / 21 | 39 / 21 | 39 / 21 | **39 / 21** |
| Re-pointed | 18 | 20 | 20 | **20** |
| Traceability (declared) | 359 | 361 | 361 | **361** |
| Test files / tests | 112 / 1040 | 112 / 1046 | 112 / 1047 | **113 / 1056** |
| `tsc` / `lint` | 0 / 0 | 0 / 0 | 0 / 0 | **0 / 0** |
| Design principles | 0 FAIL / 213 WARN | 0 FAIL / 213 WARN | 0 FAIL / 213 WARN | **0 FAIL / 213 WARN** (scoped 0/7) |
| ISR | 1h | 1h | 1h | **1h** |
| Full-suite stability | green | 1 green / 6 red | 5 green / 5 | **green (1/1; +9 static tests)** |
| Production files mutated | — | — | — | **none** |

Attempt 4 is a scoped re-verification; attempts 1–3 above are unchanged. No production code
was written, nothing was committed or pushed. The scratch copy was removed after the runs.

---

# Phase 2 — post-PR CI (round 0)

**Verifier:** spec-verifier (phase 2 — post-PR CI check, `docs/spec-pipeline/post-pr-loops.md`)
**Attempt:** round 0 of max 3 — phase-2 counter, **independent of phase 1** (phase 1 is exhausted at 3/3; attempts 1–4 above stand)
**PR:** [#18](https://github.com/RexiAI/pensions-system/pull/18) · branch `spec/006-centred-number` · base `main` · **draft** · 17 commits · head `d86ce528daf113d1825fadb56f7205fcf9f609a8`
**Workflow:** `CI` (`.github/workflows/ci.yml` → reusable `ci-nextjs.yml` @ `21046d9`), run **42256625219**, conclusion `success`
**Scope:** CI checks only. No production code, no fix, no commit, no push. `gh` queries throughout.

## Phase 2 round-0 verdict

**PASS.** Every CI check reached a terminal state; none failed. Three jobs ran and passed
(Unit Tests, Lint & Format, Build), two Vercel contexts are `SUCCESS`, and one job is `SKIPPED`
by design (`deploy-on-main: false`, no Dockerfile). The pipeline may proceed to **stage 5c**.

| Check | Workflow | Job / check id | Bucket | State |
|---|---|---|---|---|
| `frontend-ci / Unit Tests` | CI | 128025418475 | **pass** | SUCCESS |
| `frontend-ci / Lint & Format` | CI | 128025418901 | **pass** | SUCCESS |
| `frontend-ci / Build` | CI | 128026061623 | **pass** | SUCCESS |
| `frontend-ci / Docker Build & Push` | CI | 128026679723 | **skipping** | SKIPPED (by design) |
| `Vercel Preview Comments` | — | 128025571388 | **pass** | SUCCESS |
| `Vercel` (deployment context) | — | 7605747526 (deploy) | **pass** | SUCCESS |

`skipping` is a fourth bucket, not `pending` and not `fail`. Pending was polled to zero before
this verdict was written (`poll 1 16:54:26Z pending=1` … `poll 7 16:56:34Z pending=0`). Nothing
was treated as green while pending.

**Nothing is red, so nothing is routed.** No fix goes to `spec-coder` or `spec-refactorer`.

## Evidence: phase 2 CI status query

command: gh pr checks 18 --json name,state,bucket,workflow,link; gh api repos/RexiAI/pensions-system/commits/d86ce528daf113d1825fadb56f7205fcf9f609a8/check-runs; gh run list --branch spec/006-centred-number --workflow "CI" --limit 3 --json databaseId,conclusion,headSha,event
exit: 0 (checks 0, check-runs 0, run list 0)
at: 2026-11-06T16:58:28Z

```
### 1. gh pr checks 18 --json name,state,bucket,workflow,link
[{"bucket":"skipping","link":"https://github.com/RexiAI/pensions-system/actions/runs/42256625219/job/128026679723","name":"frontend-ci / Docker Build & Push","state":"SKIPPED","workflow":"CI"},{"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/42256625219/job/128026061623","name":"frontend-ci / Build","state":"SUCCESS","workflow":"CI"},{"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/42256625219/job/128025418475","name":"frontend-ci / Unit Tests","state":"SUCCESS","workflow":"CI"},{"bucket":"pass","link":"https://github.com/RexiAI/pensions-system/actions/runs/42256625219/job/128025418901","name":"frontend-ci / Lint & Format","state":"SUCCESS","workflow":"CI"},{"bucket":"pass","link":"https://vercel.com/github","name":"Vercel Preview Comments","state":"SUCCESS","workflow":""},{"bucket":"pass","link":"https://vercel.com/danielbueno76-4270s-projects/pensions-system/8Vykw89Yx8xbiNK1XebYvbrmaYYw","name":"Vercel","state":"SUCCESS","workflow":""}]
checks_exit=0

### 2. gh api .../commits/d86ce52.../check-runs
skipped  128026679723  frontend-ci / Docker Build & Push
success  128026061623  frontend-ci / Build
success  128025571388  Vercel Preview Comments
success  128025418901  frontend-ci / Lint & Format
success  128025418475  frontend-ci / Unit Tests
checkruns_exit=0

### 3. gh run list --branch spec/006-centred-number --workflow CI
42256625219 success d86ce52 pull_request
42256573875 cancelled 7e01001 pull_request
runlist_exit=0
```

`42256573875` (head `7e01001`) is `cancelled`, not failed: it was superseded by the push of
`d86ce52` under the workflow's `concurrency: cancel-in-progress`. Cancelled-superseded is not a
finding — the run that counts for this head is `42256625219`.

## Evidence: Unit Tests — totals and every skip accounted for

command: gh run view 42256625219 --log  (Unit Tests job 128025418475); per-file skip tally; guard scan across tests/
exit: 0
at: 2026-11-06T16:58:36Z

```
 Test Files  107 passed | 9 skipped (116)
      Tests  1022 passed | 46 skipped (1068)
   Duration  19.12s (tests 56%, import 32%, transform 7%, environment 4%, worker 1%)

tests/acceptance/spec-006-palette.test.ts            2
tests/acceptance/spec-006-supersessions.test.ts      1
tests/acceptance/no-empty-columns.test.ts            4
tests/acceptance/spec-006-von-restorff.test.ts       4
tests/acceptance/spec-006-canonical-share.test.ts    1
tests/acceptance/served-document.test.ts             6
tests/acceptance/spec-006-number-group.test.ts       1
tests/acceptance/spec-006-static-html.test.ts        1
tests/acceptance/spec-006-projection-form.test.ts    2
tests/acceptance/spec-006-centred-axis.test.ts       3
tests/acceptance/spec-005-step-air-browser.test.ts   3
tests/acceptance/spec-006-fitts.test.ts              3
tests/acceptance/one-screen-per-step.test.ts         3
tests/acceptance/spec-006-subday-legibility.test.ts  2
tests/acceptance/countdown-band-browser.test.ts      4
tests/acceptance/invariants-003.test.ts              1
tests/acceptance/spec-006-box.test.ts                2
tests/acceptance/spec-005-locale-parity.test.ts      1
tests/acceptance/spec-006-type-scale.test.ts         2
SKIPPED_TOTAL=46
```

CI total is **1068 tests**, the same number the local suite runs (orchestrator-reported local
1068 passed). So no test is *missing* from CI — 46 of the same 1068 are environment-gated and
run locally instead. The skip count is larger than the phase-1 local run for exactly the reason
this spec grew browser coverage: 19 files now carry browser or build guards.

## Evidence: every skip is an environment guard, no parked criterion

command: grep -rnE "^\s*(it|test|describe)\.skip\(" tests/ ; guard idiom per skipping file; guard definitions
exit: 1 for the unconditional-skip scan (no matches — none exist); 0 for the guard scan
at: 2026-11-06T16:58:43Z

```
### 5. no unconditional .skip( in tests/ (exit 1 = no match, i.e. none)
unconditional_skip_grep_exit=1

### 5b. guard idiom per skipping file
tests/acceptance/spec-006-palette.test.ts          describe.skipIf(!BROWSER_READY) describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-006-supersessions.test.ts    describe.skipIf(!BROWSER_READY)
tests/acceptance/no-empty-columns.test.ts          describe.skipIf(!READY)
tests/acceptance/spec-006-von-restorff.test.ts     describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-006-canonical-share.test.ts  describe.skipIf(!BROWSER_READY)
tests/acceptance/served-document.test.ts           describe.skipIf(!BUILD_PRESENT)
tests/acceptance/spec-006-number-group.test.ts     describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-006-static-html.test.ts      describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-006-projection-form.test.ts  describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-006-centred-axis.test.ts     describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-005-step-air-browser.test.ts describe.skipIf(!READY)
tests/acceptance/spec-006-fitts.test.ts            describe.skipIf(!BROWSER_READY)
tests/acceptance/one-screen-per-step.test.ts       describe.skipIf(!READY)
tests/acceptance/spec-006-subday-legibility.test.ts describe.skipIf(!BROWSER_READY)
tests/acceptance/countdown-band-browser.test.ts    describe.skipIf(!READY)
tests/acceptance/invariants-003.test.ts            it.skipIf(!BUILD_PRESENT)
tests/acceptance/spec-006-box.test.ts              describe.skipIf(!BROWSER_READY)
tests/acceptance/spec-005-locale-parity.test.ts    describe.skipIf(!BUILD_PRESENT)
tests/acceptance/spec-006-type-scale.test.ts       describe.skipIf(!BROWSER_READY)

### 5c. guard definitions
14:export const BUILD_PRESENT = existsSync('.next/server/app');
15:export const CHROME_PATH = CANDIDATES.find((path): path is string => typeof path === 'string' && existsSync(path));
13:export const BROWSER_READY = BUILD_PRESENT && CHROME_PATH !== undefined;
16:const READY = BUILD_PRESENT && CHROME_PATH !== undefined;
```

Every one of the 46 skips sits inside a `skipIf` keyed on `.next/server/app` existing
(`BUILD_PRESENT`) and/or a Chromium binary being installed (`CHROME_PATH`) — neither of which the
CI `unit-test` job has: the jobs are separate, `Build` does not publish `.next` to `Unit Tests`,
and no browser is installed. There is **no unconditional `.skip(` anywhere in `tests/`**, so no
acceptance criterion was parked to make CI green. The three `BUILD_PRESENT`-only files
(`served-document`, `invariants-003` AC-003-44, `spec-005-locale-parity` AC-005-35) are served-HTML
checks that need a real `next start`; they run locally where the build exists.

## Evidence: Lint & Format and Build really ran

command: gh run view 42256625219 --log  (Lint & Format job 128025418901, Build job 128026061623)
exit: 0
at: 2026-11-06T16:56:40Z

```
> pensions-system@0.0.0 lint
> eslint .

> next build
 ✓ Running next.config.ts took 32ms
  ✓ globalNotFound
✓ Compiled successfully in 4.7s
✓ Generating static pages using 3 workers (17/17) in 809ms
Route (app)                                             Revalidate  Expire
```

`lint` is `eslint .` (the reusable workflow also runs `npm run format:check --if-present`);
`next build` succeeded and type-checks the tree — it produced the ISR route table, so the
`revalidate = 3600` work is present in the compiled output. No `tsc --noEmit` step exists in this
CI (local `tsc` was 0 at phase 1); `next build` is the type gate here.

## Evidence: Docker job skip cause and absent spec gates

command: grep -n "if: github.event_name" .standards/.github/workflows/ci-nextjs.yml; grep -n "deploy-on-main" .github/workflows/ci.yml; gh run view 42256625219 (job list)
exit: 0
at: 2026-11-06T16:58:36Z

```
84:    if: github.event_name == 'push' && github.ref_name == github.event.repository.default_branch && inputs.deploy-on-main
34:      deploy-on-main: false

JOBS
✓ frontend-ci / Unit Tests in 54s (ID 128025418475)
✓ frontend-ci / Lint & Format in 50s (ID 128025418901)
✓ frontend-ci / Build in 1m7s (ID 128026061623)
- frontend-ci / Docker Build & Push in 0s (ID 128026679723)
```

`Docker Build & Push` can only run on a push to the default branch **and** with
`deploy-on-main: true`; this caller sets `false` (no Dockerfile, GHCR_TOKEN unset, deployment is
Vercel via Git integration — commented in `.github/workflows/ci.yml`). On a PR it is unconditionally
skipped. **By design, not a red.**

The run has exactly four jobs. **`check-specs-archived.sh` is absent from CI** — as expected for
this repo (no such job, no such workflow): it cannot be a CI signal here and its absence is not
this branch's defect. **`check-code-principles.sh` exit 141 does not appear** — the script is not
invoked by this CI at all (`self-ci`/standards-side only), and no job failed with 141 in this run.

## Evidence: 5c handoff — the preview belongs to this head

command: gh api "repos/RexiAI/pensions-system/deployments?sha=d86ce52…&per_page=5"; gh api repos/RexiAI/pensions-system/commits/d86ce52…/status
exit: 0
at: 2026-11-06T16:58:58Z

```
7605747526 Preview 2026-11-06T16:54:16Z d86ce528daf113d1825fadb56f7205fcf9f609a8
Vercel success https://vercel.com/danielbueno76-4270s-projects/pensions-system/8Vykw89Yx8xbiNK1XebYvbrmaYYw
```

Deployment `7605747526` is recorded against **`d86ce52`**, the PR head — not a stale branch alias.
Branch alias for 5c: `https://pensions-system-git-spec-00-af5e9e-danielbueno76-4270s-projects.vercel.app`
(Vercel "Ready"). 5c must still match `githubCommitSha == d86ce52` before trusting a 200.

## Phase 2 round-0 findings

No gate failed. Recorded for the Architect, none of which blocks:

- **P2-0-W1 (carried, W-1):** `AC-006-35` is skipped **entirely** in CI — the test lives inside
  `describe.skipIf(!BROWSER_READY)`, and its live half additionally requires `PRODUCTION_URL`,
  which no workflow sets. CI therefore exercises neither half. The committed-origin half runs
  locally (build + Chromium present); the **live serving-origin equality is stage 5c's job**.
  Do **not** route this to the Coder.
- **P2-0-W2 (reconciliation, informational):** phase-1 attempt 4 recorded 113 files / 1056 tests;
  the head now has 116 files / 1068 tests (+3 files, +12 tests, added while phase 1's budget was
  already at 3/3). CI executes all 1068 and they pass, so the delta is covered by this run rather
  than by a fifth local attempt — but no Verifier attempt ever ran against this exact tree locally.
- **P2-0-W3 (upstream, not this branch):** the reusable `ci-nextjs.yml` gates `build` on
  `needs: [unit-test, lint]`, which contradicts `docs/CODING_CONVENTIONS.md §CI Job Orchestration —
  Clean Feedback` (a lint failure would hide the build signal). It is a `.standards/` submodule
  defect, unchanged by this spec; report only.
- **P2-0-W4 (info):** annotations are deprecation notices only — Node.js 20 actions forced onto
  Node 24, and the `ubuntu-latest` → Ubuntu 26 migration notice. Nothing branch-specific.

## Phase 2 round-0 outcome

| Item | Value |
|---|---|
| Checks queried / terminal | 6 / 6 |
| pass / fail / skipping(pending) | **4 / 0 / 1 (Docker, by design)** (+1 Vercel deployment context) |
| Run conclusion | `success` (42256625219) |
| Unit tests | 1022 passed, 46 skipped (1068) — every skip an environment guard |
| Lint & Format / Build | pass / pass |
| Failing check IDs | none |
| Routed owner | none |
| Verdict | **PASS** |
| Next stage | **5c may proceed** (Deploy Verifier) |


## Phase 2 round-0 addendum (write hygiene, same round)

Two tree-state observations, recorded because a downstream stage performs working-tree checks.
Neither is a CI finding and neither is mine to fix:

- **P2-0-W5:** two untracked scratch files sit at the repo root — `live-005-top.png`,
  `live-006box.png` — not in any of the PR's 17 commits. They are verifier-side artifacts from an
  earlier round; the orchestrator/Architect should decide whether they are discarded before
  stage 5d's clean-tree check. Left untouched here.
- **P2-0-W6:** `.standards` is checked out at `5de28c9` while the child's recorded gitlink is
  `6eb2c99` (`git submodule status` → `+`). Pre-existing, unrelated to this spec, and the source of
  the ` M .standards` line in `git status`. Left untouched.

**Telemetry:** `record-gate-run.sh` resolves its repo root to the `.standards` submodule when
invoked by that path, so the first append landed in `.standards/runs.jsonl`. That stray line was
reverted (`git -C .standards checkout -- runs.jsonl`, submodule working tree clean again) and the
record was written once to this repo's `runs.jsonl` with `-f`. Verdict unchanged: `outcome: pass`.

## Quality gates

# Mutation report — 006-centred-number

**Stage:** 5a, Mutation Runner
**Branch:** `spec/006-centred-number`
**Date:** 2026-11-06
**Tier:** `production` (`AGENTS.md` §Conformance tier) — mutation testing is a `production`-tier
gate, so it was run, not skipped.
**Precondition:** `25-verification.md` **attempt 4, phase 1, cycle 3 of 3 — PASS**. Read before
any work started. No gate was re-run as a substitute for it, and no report artifact existed
before this one.

## Result

| Row | Verdict |
|---|---|
| Verifier's verdict (carried forward) | **PASS** — attempt 4, phase 1 cycle 3 of 3 (113 files / 1056 tests, `tsc` 0) |
| Mutation score (reproducible) | **95.62 %** (415 killed / 434 valid) — floor 80 % |
| Mutation score (baseline, this stage's first run) | 91.71 % (398 / 434) |
| Improvement | **+3.91 points**, +17 mutants killed |
| Surviving mutants | 19 — **all equivalent**, none a testable gap (named below) |
| Final test status | **116 files / 1068 tests passed**, exit 0 |
| `npx tsc --noEmit` | **exit 0** |
| Report verdict | **GREEN** |

Scope was an explicit `--mutate` list over the six source files this spec changes, with
`stryker.config.mjs`'s standing coverage and thresholds left untouched:

```
scripts/check-scenario-traceability-3digit.ts
web/components/public/NumberStep.tsx
web/components/series/PyramidPlate.tsx
web/components/series/PyramidPanel.tsx
web/content/site.ts
web/series/clock.ts
```

`web/components/series/CountdownClock.tsx` and `web/series/clock-ticker.ts` are deleted by Task
12 and so have nothing left to mutate.

## Evidence: mutation score, baseline

command: npx stryker run --mutate "scripts/check-scenario-traceability-3digit.ts,web/components/public/NumberStep.tsx,web/components/series/PyramidPlate.tsx,web/components/series/PyramidPanel.tsx,web/content/site.ts,web/series/clock.ts"
exit: 0
at: 2026-11-06T14:02:49Z

The process was backgrounded, so its exit status was not captured directly; the completed JSON
report and the `Done in 12 minutes and 46 seconds` line are the evidence that the run finished
clean, and `stryker.config.mjs` sets `thresholds.break: null`, so a survivor never fails the
process.

```
Found 6 of 395 file(s) to be mutated.
Instrumented 6 source file(s) with 456 mutant(s)
DryRunExecutor  Initial test run succeeded.

                                        | % Mutation score |          |           |            |          |          |
File                                    |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                               |  91.71 |   92.77 |      398 |         0 |         31 |        5 |       22 |
 scripts                                |  91.28 |   93.15 |      136 |         0 |         10 |        3 |        4 |
  check-scenario-traceability-3digit.ts |  91.28 |   93.15 |      136 |         0 |         10 |        3 |        4 |
 web                                    |  91.93 |   92.58 |      262 |         0 |         21 |        2 |       18 |
  components                            |  90.36 |   91.28 |      178 |         0 |         17 |        2 |        0 |
   public                               |  82.05 |   84.21 |       32 |         0 |          6 |        1 |        0 |
    NumberStep.tsx                      |  82.05 |   84.21 |       32 |         0 |          6 |        1 |        0 |
   series                               |  92.41 |   92.99 |      146 |         0 |         11 |        1 |        0 |
    PyramidPanel.tsx                    |  97.62 |   97.62 |       82 |         0 |          2 |        0 |        0 |
    PyramidPlate.tsx                    |  86.49 |   87.67 |       64 |         0 |          9 |        1 |        0 |
  content                               | 100.00 |  100.00 |       35 |         0 |          0 |        0 |       18 |
   site.ts                              | 100.00 |  100.00 |       35 |         0 |          0 |        0 |       18 |
  series                                |  92.45 |   92.45 |       49 |         0 |          4 |        0 |        0 |
   clock.ts                             |  92.45 |   92.45 |       49 |         0 |          4 |        0 |        0 |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
MutationTestExecutor  Done in 12 minutes and 46 seconds.
```

`reports/mutation/mutation.json` left by the aborted earlier attempt was stale; it was not
resumed. Its numbers happened to match this run exactly, which is the only evidence that the
six files did not move between the two attempts.

## Evidence: mutation score, after the kill tests

command: npx stryker run --mutate "scripts/check-scenario-traceability-3digit.ts,web/components/public/NumberStep.tsx,web/components/series/PyramidPlate.tsx,web/components/series/PyramidPanel.tsx,web/content/site.ts,web/series/clock.ts"
exit: 0
at: 2026-11-06T16:19:46Z

```
Instrumented 6 source file(s) with 456 mutant(s)

                                        | % Mutation score |          |           |            |          |          |
File                                    |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                               |  95.62 |   95.84 |      415 |         0 |         18 |        1 |       22 |
 scripts                                |  97.32 |   97.32 |      145 |         0 |          4 |        0 |        4 |
  check-scenario-traceability-3digit.ts |  97.32 |   97.32 |      145 |         0 |          4 |        0 |        4 |
 web                                    |  94.74 |   95.07 |      270 |         0 |         14 |        1 |       18 |
  components                            |  94.42 |   94.90 |      186 |         0 |         10 |        1 |        0 |
   public                               |  84.62 |   86.84 |       33 |         0 |          5 |        1 |        0 |
    NumberStep.tsx                      |  84.62 |   86.84 |       33 |         0 |          5 |        1 |        0 |
   series                               |  96.84 |   96.84 |      153 |         0 |          5 |        0 |        0 |
    PyramidPanel.tsx                    |  98.81 |   98.81 |       83 |         0 |          1 |        0 |        0 |
    PyramidPlate.tsx                    |  94.59 |   94.59 |       70 |         0 |          4 |        0 |        0 |
  content                               | 100.00 |  100.00 |       35 |         0 |          0 |        0 |       18 |
   site.ts                              | 100.00 |  100.00 |       35 |         0 |          0 |        0 |       18 |
  series                                |  92.45 |   92.45 |       49 |         0 |          4 |        0 |        0 |
   clock.ts                             |  92.45 |   92.45 |       49 |         0 |          4 |        0 |        0 |
----------------------------------------|--------|---------|----------|-----------|------------|----------|----------|
MutationTestExecutor  Done in 12 minutes and 20 seconds.
```

### Why 95.62 % and not the 95.85 % a later run printed

The same command re-run at `2026-11-06T16:39:31Z` (exit 0) reported **95.85 %** — 416 killed,
17 survived. The entire delta is one mutant, `NumberStep.tsx:50:7`, whole-condition
`countdown.state !== 'computed' || countdown.anchor === null` → `false`. That mutant is
**logically equivalent** (§Equivalent mutants, E-4), so no assertion can kill it; two isolated
reruns of the same file, `npx stryker run --mutate "web/components/public/NumberStep.tsx"` at
`16:40:41Z` and `16:42:23Z`, both reported it **survived** (33 killed / 5 survived / 1 no coverage,
twice). The 416 is a false kill: a test *run* failed — the documented harness hook-timeout flake
(W-2 / verification attempt 2) is recorded by Stryker as detection even when no assertion fails.
**95.62 % is the reproducible figure** and the one reported. Both runs clear the 80 % floor.

`reports/mutation/mutation.json` on disk is the later, 95.85 % run; `reports/` is gitignored, so
it is a local artifact, not part of the branch.

### Per file

| File | Before | After | Δ killed |
|---|---|---|---|
| `scripts/check-scenario-traceability-3digit.ts` | 136/149 = **91.28 %** | 145/149 = **97.32 %** | +9 |
| `web/components/public/NumberStep.tsx` | 32/39 = **82.05 %** | 33/39 = **84.62 %** | +1 |
| `web/components/series/PyramidPlate.tsx` | 64/74 = **86.49 %** | 70/74 = **94.59 %** | +6 |
| `web/components/series/PyramidPanel.tsx` | 82/84 = **97.62 %** | 83/84 = **98.81 %** | +1 |
| `web/content/site.ts` | 35/35 = **100.00 %** | 35/35 = **100.00 %** | 0 |
| `web/series/clock.ts` | 49/53 = **92.45 %** | 49/53 = **92.45 %** | 0 |
| **All files** | **398/434 = 91.71 %** | **415/434 = 95.62 %** | **+17** |

## Survivors and verdicts

Nineteen mutants are not killed: 18 `Survived`, 1 `NoCoverage`. Every one is equivalent — the
mutation cannot change behaviour for any input the production call graph can produce. None is an
untested behaviour.

| # | File:location | Mutator | Verdict | Why |
|---|---|---|---|---|
| E-1 | `NumberStep.tsx:36:49` | StringLiteral `''` → `"Stryker was here!"` | **equivalent** | `NumberGroup` is private and has one call site, `measured()`'s result (L99). `measured` returns a countdown only when `readClock(anchor)` found a future anchor, so `countdown.anchor` is never null there and the `??` right operand is never evaluated. This is also why the mutant is `NoCoverage`. |
| E-2 | `NumberStep.tsx:37:69` | StringLiteral `''` → `"Stryker was here!"` (null label) | **equivalent** | `formatValue`'s `nullLabel` is returned only for `null`/`NaN`; `readClock().days` is always a number. |
| E-3 | `NumberStep.tsx:50:7` | ConditionalExpression → `false` (the `state` operand), LogicalOperator `\|\|`→`&&`, ConditionalExpression `50:41` → `false` | **equivalent** (3 mutants) | `CountdownValue['state']` is exactly `'computed' \| 'not-crossed'`; `NumberBody` returns for `'not-crossed'` before calling `measured` (L85–91), so the state test is always false at the only call site. An `anchor === null` countdown is caught one line later: `readClock(null)` parses to `NaN`, is non-finite, and returns `elapsed: true`, so `measured` still returns `undefined`. |
| E-4 | `NumberStep.tsx:50:7` | ConditionalExpression, whole condition → `false` | **equivalent** | Same proof as E-3, for the whole-guard form. This is the mutant the 95.85 % run falsely killed. |
| E-5 | `PyramidPlate.tsx:17:72` | StringLiteral `'table.notDefined'` → `''` | **equivalent** | `formatValue`'s `nullLabel` is unreachable: `percentPoints` takes a `number`. |
| E-6 | `PyramidPlate.tsx:42:7` | LogicalOperator `\|\|`→`&&` | **equivalent** | `years` is an array: length 0 makes both `!first` and `!last` true; length ≥ 1 makes both false. `!first && !last` and `!first \|\| !last` agree on every array. |
| E-7 | `PyramidPlate.tsx:94:95` | StringLiteral `''` → `"Stryker was here!"` (null label) | **equivalent** | `year.population` is a `number`; the null label is unreachable. |
| E-8 | `PyramidPlate.tsx:118:30` | StringLiteral `'table.notDefined'` → `''` | **equivalent** | `DataTable` reads `nullLabel` only for a `null` cell; every row cell comes from `percentPoints`, which returns a string. |
| E-9 | `check-scenario-traceability-3digit.ts:45:11` | BlockStatement `catch` body → `{}` | **equivalent** | Falling through executes `return walk(dir, extensions).sort()`. `walk` catches the same `statSync` failure (`ENOENT`) and, for a non-directory, `readdir`'s `ENOTDIR`, returning `[]` in both cases. |
| E-10 | `check-scenario-traceability-3digit.ts:43:7` | BlockStatement `try` body → `{}` | **equivalent** | Same reason as E-9: the `isDirectory` guard only pre-empts a path whose `walk` returns `[]` anyway. |
| E-11 | `check-scenario-traceability-3digit.ts:44:9` | ConditionalExpression `!statSync(dir).isDirectory()` → `false` | **equivalent** | Same reason as E-9. |
| E-12 | `check-scenario-traceability-3digit.ts:60:11` | ConditionalExpression `if (match[1])` → `true` | **equivalent** | `SCENARIO_HEADING`'s capture group is mandatory in the pattern, so `match[1]` is always a defined string when the branch is reached. |
| E-13 | `clock.ts:42:7` | ConditionalExpression → `false` (×2), LogicalOperator `\|\|`→`&&`, ConditionalExpression `42:33` → `false` | **equivalent** (4 mutants) | The guard is redundant: the next line is `if (!Number.isInteger(thresholdYear)) return null`, and `Number.isInteger(null)` and `Number.isInteger(undefined)` are both `false`. Every input reaches the same `null`. |
| E-14 | `PyramidPanel.tsx:102:58` | StringLiteral `''` → `"Stryker was here!"` (null label) | **equivalent** | `AXIS_TICKS` is `[2, 4]`; a tick is always a number, so the null label is unreachable. |

### Runtime errors (`# errors` = 22) are not gaps

`site.ts` reports 18 `RuntimeError` mutants and the gate 4. These are mutants whose test run
aborts **outside** a test — the module's own import-time guard fires while the suite loads:

```
StringLiteral L12 ('https://pensions-system-delta.vercel.app' → '')
  An error occurred outside of a test run: .../tests/acceptance/spec-005-mechanism-fact.test.ts:
  SITE_URL is not an absolute URL:
```

Stryker cannot attribute that to a test, so it excludes them from the score rather than counting
them killed. `site.ts` still scores 100 % on the 35 valid mutants, and `AC-006-34` plus the
`AC-001-35` import cases do assert the throw — the invalid mutants are a reporting artifact of a
module that fails loudly at import, not an unasserted branch.

## Tests written

All in the project's existing style: rendered output or the gate's own public report, fixtures
built from the committed snapshots, scenario ids reused from the scenario the assertion serves.
No production file was edited.

| Test | Kills |
|---|---|
| `tests/unit/spec-006-mutation-kills.test.ts` — `AC-006-32: a computed countdown with no anchor writes the empty date` | `NumberStep.tsx:17:41` |
| `tests/unit/spec-006-mutation-kills.test.ts` — `AC-004-19: a computed series with a null value renders nothing instead of throwing` | `PyramidPlate.tsx:140:7` (`\|\|`→`&&`, `value === null` → `false`) |
| `tests/unit/spec-006-mutation-kills.test.ts` — `AC-004-19: an unavailable series renders nothing even when a stale value is attached` | `PyramidPlate.tsx:140:7` (`availability !== 'computed'` → `false`) |
| `tests/unit/spec-006-mutation-kills.test.ts` — `AC-001-97: a missing band reads as the zero share, not as an unformatted value` | `PyramidPlate.tsx:64:66` |
| `tests/unit/spec-006-mutation-kills-gate.test.ts` — `AC-001-119: a docs/changes path that is a plain file declares nothing` | `…3digit.ts:44:46` |
| `tests/unit/spec-006-mutation-kills-gate.test.ts` — `AC-001-119: an acceptance directory outside specs does not declare a scenario` | `…3digit.ts:54:30` |
| `tests/unit/spec-006-mutation-kills-gate.test.ts` — `AC-001-119: a markdown file beside docs/changes does not declare a scenario` | `…3digit.ts:55:38` |
| `tests/unit/spec-006-mutation-kills-gate.test.ts` — `AC-001-119: a TypeScript file outside tests is not a citation` | `…3digit.ts:69:44` |
| `tests/unit/spec-006-mutation-kills-gate.test.ts` — `AC-001-119: a process with no argv entry imports the module without throwing` | `…3digit.ts:186:3` |
| `tests/unit/spec-006-mutation-kills-gate-order.test.ts` — `AC-001-119: the citation is recorded against the first path of the sorted walk` | `…3digit.ts:48:10`, `…3digit.ts:72:11` |
| `tests/unit/spec-006-mutation-kills-gate-order.test.ts` — `AC-001-119: a readdir that throws is an empty listing` | `…3digit.ts:32:11`, `…3digit.ts:33:12` |
| `tests/unit/spec-006-mutation-kills-dom.test.ts` — `AC-006-27: the readout and the age gutter reconcile without a duplicate-key warning` | `PyramidPlate.tsx:25:56`, `PyramidPlate.tsx:29:56`, `PyramidPanel.tsx:165:16` |

Two notes on method:

- **The ordering test drives the filesystem rather than trusting it.** Which file wins a
  duplicated citation id is only observable through readdir order, and asserting on whatever the
  host filesystem happens to return would be a coin-flip kill. `spec-006-mutation-kills-gate-order.test.ts`
  replaces `readdirSync` for that file alone (`vi.mock('node:fs')`, real module otherwise) and
  reverses the listing, so a missing `sort` is deterministic. The gate's own code is unchanged.
- **The DOM test exists because a `key` never reaches the document.** The readout's six items and
  the age gutter's 21 `<text>` nodes are lists; flattening their keys makes React emit a
  duplicate-key warning. That is the only surface a key mutation has, so the assertion is on it —
  with the render itself still checked (6 readout items, 21 age labels).

### Mutation-check: each new test fails against the mutation it targets

command: scratch harness, per case: write the mutation into the production file, `npx vitest run <file> -t <filter>`, restore, compare sha256
exit: 1 for each of the 17 mutations that had to be detected; one further candidate was correctly *not* detected (below) and was dropped. Every source restored byte-identically (sha256 checked on each case).
at: 2026-11-06T16:52:00Z

| Mutation | Result |
|---|---|
| `NumberStep.tsx` `anchor ?? ''` → `anchor ?? 'Stryker was here!'` | **FAIL** — sentence text differs |
| `PyramidPlate.tsx` `\|\|` → `&&` in the availability guard | **FAIL** — render throws `reading 'years'` |
| `PyramidPlate.tsx` `availability !== 'computed'` → `false` | **FAIL** — unavailable series renders |
| `PyramidPlate.tsx` `value === null` → `false` | **FAIL** — render throws |
| `PyramidPlate.tsx` band filler `{ band, male: 0, … }` → `{}` | **FAIL** — cells read `NaN` |
| `…3digit.ts` walk `catch {}` | **FAIL** — `undefined.sort()` |
| `…3digit.ts` walk `catch` → placeholder path | **FAIL** — `ENOENT` reading a bogus path |
| `…3digit.ts` filesUnder non-directory `[]` → placeholder | **FAIL** — `ENOENT` reading a bogus path |
| `…3digit.ts` `.sort()` dropped (reversed listing) | **FAIL** — `tests/z.test.ts` wins instead of `tests/a.test.ts` |
| `…3digit.ts` `'specs'` → `''` | **FAIL** — the out-of-tree acceptance directory declares a scenario |
| `…3digit.ts` `'changes'` → `''` | **FAIL** — `docs/notes.md` declares a scenario |
| `…3digit.ts` `'tests'` → `''` | **FAIL** — `scripts/helper.ts` cites a scenario |
| `…3digit.ts` `if (!cited.has(id))` → `if (true)` | **FAIL** — last file wins |
| `…3digit.ts` `process.argv[1] !== undefined` → `true` | **FAIL** — `pathToFileURL(undefined)` throws on import |
| `PyramidPlate.tsx` readout key flattened (×2) | **FAIL** — duplicate-key warning |
| `PyramidPanel.tsx` age-label key flattened | **FAIL** — duplicate-key warning |

One candidate was **rejected** by this check: emptying `filesUnder`'s `catch` body does not fail
any test, because the fall-through `walk` returns `[]` for the same paths. It is equivalent (E-9),
and the test that would have claimed the kill was removed rather than kept as a paper kill.

## Evidence: final test status

command: npm test
exit: 0
at: 2026-11-06T16:48:58Z

```
> pensions-system@0.0.0 test
> vitest run

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  116 passed (116)
      Tests  1068 passed (1068)
   Start at  17:47:53
   Duration  62.68s (tests 90%, import 8%, environment 1%, transform 1%)
```

116 files / 1068 tests, 0 failed, 0 skipped. The 1056 → 1068 delta is exactly the 12 tests
added here (+4 in the existing `spec-006-mutation-kills.test.ts`, +5 gate, +2 gate-order, +1 DOM);
the 113 → 116 file delta is the three new test files.

## Evidence: type check

command: npx tsc --noEmit
exit: 0
at: 2026-11-06T16:48:58Z

```
(no output)
```

`tsc` caught one real defect in the new suite before it shipped — the `process.argv` test assigned
`undefined` to a `string[]` element (TS2322). Fixed with an explicit narrowing cast; the affected
mutant was re-checked afterwards and is still killed.

## Complexity summary, carried from the Refactorer

The Refactorer leaves no artifact; the figures below are the ones `25-verification.md` re-ran
independently on this tree (attempt 1 §Evidence: complexity gate, attempt 4 §prior gates hold):

| Gate | Result | Source |
|---|---|---|
| ESLint `complexity: ['error', 6]` (cyclomatic ≤ 6) | 0 violations, whole repo and the changed files | verification attempt 1 / attempt 4 |
| `check-code-principles.sh` complexity heuristic | 0 FAIL | verification attempt 1 (0 FAIL / 213 WARN repo-wide; 0 FAIL / 7 WARN scoped `-BaseRef main`) |
| Duplication (DRY), YAGNI, SOLID | 0 FAIL | same |
| Property tests added by the Refactorer | 7 `fc.property` blocks (`step-number-properties.test.ts` ×3, `pyramid-panel-properties.test.ts` ×4) | verification attempt 1, F4 |

This stage wrote no production code, so no complexity measurement changed.

## Warnings carried forward

- **W-1** — `AC-006-35`'s live serving-origin equality is gated on `PRODUCTION_URL`, set in no
  workflow; unexercised by `npm test`/CI. Stage 5c must supply it.
- **W-2** — `freePort()`'s close-then-bind TOCTOU is a residual stability risk.
- **W-3** — `AC-006-25`'s thinnest pair is `--ink-3` on `--surface-3` at 4.6:1 light against a
  4.5 floor.
- **W-4** — the 9 px `.demography__tick` enters the above-fold size count at 1440×900 `es`
  (8 sizes, still ≤9); chart internals are excluded explicitly.
- **W-5** — a stale comment above `a { color: var(--ink-2) }` still claims the CTA keeps its
  accent ground; the code is correct.
- **W-6** — spec-text figures 16.13/2.12 may still appear in `10-tasks.md` and
  `AC-006-palette.md`; no assertion quotes them.

## Findings from this stage (none blocks)

- **M-1 — `web/content/site.ts` is outside the standing mutation scope.** `stryker.config.mjs`
  mutates `web/content/budgets.ts` and `web/content/share-copy.ts` but not `site.ts`, which is
  where Task 13's canonical origin lives. It was mutated here only because the `--mutate` flag was
  given an explicit list. The config was deliberately left untouched (constraint), so a future
  `npx stryker run` will not look at the one file `AC-006-34`/`AC-006-35` depend on. **Proposed
  follow-up:** add `web/content/site.ts` to the `mutate` array — it scores 100 % (35 valid
  mutants, 0 survivors), so the change costs coverage time, not a red gate.
- **M-2 — a hook timeout can record a false kill.** One of three full-scope runs marked an
  equivalent mutant killed (§Why 95.62 %, not 95.85). This is the same harness class as W-2 and
  verification attempt 2's BLOCK, now visible on the mutation side: a failed *run* is
  indistinguishable from a failed *assertion* to Stryker. It inflates a score by at most one
  mutant here; it cannot deflate one. Recorded so a future reading of `reports/mutation/*.json`
  is not surprised by a one-mutant swing between runs.

## Out of scope (pre-existing dirt, not mine)

`.standards` (submodule pointer), `runs.jsonl`, `live-005-top.png`, `live-006box.png`.

## Remediation record

Phase 1 only; no PR was opened, so **phase 2 did not run** and **phase 3 did not run**.

| BLOCK | Phase / attempt | Resolved at |
|---|---|---|
| Verification attempt 2 — BLOCK (browser-suite hook timeouts; `AC-006-20`'s shorter property list) | phase 1, cycle 1 of max 3 (attempt 2) | attempt 3, phase 1 cycle 2 of max 3 — PASS |
| Stage 5a precondition refusal — the +9-test delta and post-PASS mtimes left by the aborted mutation run | phase 1, cycle 3 of max 3 (attempt 4) | attempt 4, phase 1 cycle 3 of max 3 — PASS (tree certified; no fix was routed, the tree was correct) |

Both records are carried from `25-verification.md` (attempt headers and §Attempt 4 verdict); the
orchestrator's loop summary supplied nothing additional. No BLOCK occurred **during this stage**:
the baseline was measured, the killers were written, and the re-run cleared 80 % on the first
attempt. No gate threshold was changed, no test was weakened or deleted.

## Verdict

**GREEN.** Mutation score 95.62 % (floor 80 %), all 19 survivors named as equivalent, final suite
116 files / 1068 tests green, `tsc` exit 0. Nothing was committed or pushed — that is stage 5b.

## PR

PR: https://github.com/RexiAI/pensions-system/pull/18
Commits: 16 (17 including this record)
at: 2026-11-06T16:53:41Z

Stage 5b, PR Opener. The branch was committed one task at a time — T1, T2,
T4–T13 (T3 superseded by T11), plus the stage-5a kill tests, the harness fix
from phase-1 BLOCK 1, and these spec artifacts — pushed to `spec/006-centred-number`,
and opened as a draft PR against `main`. `specs/006-centred-number/` is still on
the branch on purpose: stage 5c writes `40-deploy.md` into it and stage 5d is the
stage that archives it.

## 15-design.md

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

## 40-deploy.md

# Deploy verification — 006-centred-number

**Deploy Verifier:** spec-deployer (stage 5c)
**Attempt:** 1 of 3 (phase 3); fix-and-redeploy rounds consumed: **0 of 3**
**PR:** #18 (draft), branch `spec/006-centred-number`, head `d86ce528daf113d1825fadb56f7205fcf9f609a8`
**Date:** 2026-11-06
**Verified against:** the live Vercel preview deployment built by the Git integration for the
PR head, plus `10-tasks.md` and `20-acceptance/`. `00-informal.md` was **not** read
(information barrier).

## Verdict

Verdict: PASS

The preview deployment the Git integration built for `d86ce52` is READY, the served HTML is
that commit's build, the app answers **200** and the rendered page matches the spec's
appearance requirements at `es` and `de` on 390×844 and 1440×900. One check — `AC-006-35`'s
serving-origin equality — **cannot pass before merge by construction**; it is measured and
interpreted below and is not a defect in this commit.

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Build status | **PASS** | deployment READY; commit status `success`; GitHub deployment `7605747526` → `d86ce52` |
| 2 | Health check | **PASS** | `200` with the project's automation-bypass header; `302` → Vercel SSO for anonymous requests (deployment protection, not an app failure) |
| 3 | The box is gone | **PASS** | step 1 `background-color: rgba(0,0,0,0)`, all four borders `0px`, `box-shadow: none` |
| 4 | Neutral palette, one accent | **PASS** | ground `rgb(251,251,250)`, ink `rgb(70,70,67)`, exactly **1** accent paint site in the rasterised full page (`rgb(122,31,43)`, bbox x 609–784 × y 262–321 = the numeral) |
| 5 | One number | **PASS** | `5534` / `días` / one sentence; one digit-bearing text node in the number group; no `16 años`, no `hh:mm:ss`, no sub-day field in step 1 |
| 6 | Centred axis | **PASS** | four derived units, centre offset **≤ 0.01 px** (tolerance 4 px), residual asymmetry **≤ 0.02 px** (tolerance 8 px) |
| 7 | Projection by form | **PASS** | projected bars `fill: url("#projection-hatch")`; rasterised row alternates ink/ground (24 % ink, runs 4 px ink / 11 px ground) vs the observed bar's solid 99 % ink |
| 8 | Static HTML, no client clock | **PASS** | numeral `5534` in the served bytes; step 1 text identical after 2 s; `data-rendered-at="2026-11-06T16:54:08.215Z"`, **9.6 min** old at measurement (≤ 1 h) |
| 9 | Canonical share / `AC-006-35` | **PASS (shape) — live equality not verifiable pre-merge** | all 4 share controls and canonical/`og:url`/alternates carry `https://pensions-system-delta.vercel.app` — the project's **production** origin (`vercel inspect` → `target: production`) — not the `-projects.vercel.app` alias. Equality against the *preview* origin does not hold and cannot hold before merge; see §AC-006-35 |
| 10 | E2E against the live URL | **SKIP** | this repo has no agentic `e2e` suite (no `e2e/`, no `tests/e2e/`, no Playwright/Maestro dependency) — recorded skip, not a failure |

`vercel deploy` / `vercel deploy --prod` were **not** run: the Git integration is the source
of truth and a CLI deploy would double-build the same commit.

## Evidence: deployment identity

`VERCEL_TOKEN` is unset for this machine. That is not a defect for this lane: the deployment
resolved from the `Vercel` commit status on the PR head, the GitHub deployment record, and
`vercel inspect` through the CLI's stored operator session.

command: git show -s --format='%H%n%ci' d86ce52; vercel inspect pensions-system-git-spec-00-af5e9e-danielbueno76-4270s-projects.vercel.app --scope danielbueno76-4270s-projects; gh api repos/RexiAI/pensions-system/commits/d86ce528daf113d1825fadb56f7205fcf9f609a8/status; gh api "repos/RexiAI/pensions-system/deployments?sha=d86ce528daf113d1825fadb56f7205fcf9f609a8"; gh api repos/RexiAI/pensions-system/deployments/7605747526/statuses
exit: 0
at: 2026-11-06T17:08:24Z

```
d86ce528daf113d1825fadb56f7205fcf9f609a8
2026-11-06 17:53:51 +0100

> Fetched deployment "pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app"
    id      dpl_8Vykw89Yx8xbiNK1XebYvbrmaYYw
    name    pensions-system
    target  preview
    status  Ready
    url     https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app
    created Fri Nov 06 2026 17:53:54 GMT+0100 [15m ago]

{"context":"Vercel","created_at":"2026-11-06T16:54:16Z","description":"Deployment has completed","state":"success","target_url":"https://vercel.com/danielbueno76-4270s-projects/pensions-system/8Vykw89Yx8xbiNK1XebYvbrmaYYw"}
{"created_at":"2026-11-06T16:54:16Z","environment":"Preview","id":7605747526,"ref":"d86ce528daf113d1825fadb56f7205fcf9f609a8"}
{"created_at":"2026-11-06T16:54:17Z","description":"Deployment has completed","environment_url":"https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app","state":"success"}
```

Identity chain, in order: commit `d86ce52` created **16:53:51Z** → deployment created
**16:53:54Z** → first server render `data-rendered-at` **16:54:08Z** → the GitHub deployment
record `7605747526` carries `ref`/`sha` = `d86ce52` → its `environment_url` is the
immutable URL above → the `Vercel` commit status on that same SHA points at inspector
`8Vykw89Yx8xbiNK1XebYvbrmaYYw`, which `vercel inspect` resolves to the same immutable URL.
The branch alias resolves to the same deployment, not a stale one — the failure mode that
matters. Measured: the alias and the immutable URL return **byte-identical HTML** for `/`
(230 291 bytes, sha256 `aab33adb8cf8621d304806d24679062b9e4402bc64c3e2ff5ebc9a365af3f9c7`)
and for `/de` (230 500 bytes, sha256 `aad2dc6ee8281a332503e3668932bb74e362750a466f249f9a1e96ef24e76165`),
both `200` with the bypass header (2026-11-06T17:08:58Z).

**Deploy URL:** `https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app`
**Branch alias:** `https://pensions-system-git-spec-00-af5e9e-danielbueno76-4270s-projects.vercel.app`

## Evidence: health check

command: curl -sS -D - -o /dev/null "https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app/" ; curl -sS -o /dev/null -w "%{http_code} %{redirect_url}" "https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app/" ; curl -sS -D - -o /dev/null -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" ".../de"
exit: 0
at: 2026-11-06T17:09:07Z

```
302 https://vercel.com/sso-api?url=https%3A%2F%2Fpensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app%2F&nonce=…

HTTP/2 200
age: 457
cache-control: public, max-age=0, must-revalidate
content-type: text/html; charset=utf-8
x-vercel-cache: HIT

HTTP/2 200   (/de, age: 456, x-vercel-cache: HIT)
```

The preview carries Vercel **Deployment Protection**: an anonymous request is redirected to
`vercel.com/sso-api` before the app is reached. With the project's own automation-bypass
header the app answers `200` and serves the page. Recorded as a property of the project's
preview configuration, not a health failure. (`/es` is `404` anonymously and with the
bypass; `GET /` serves the `es` page. Production `pensions-system-delta.vercel.app/es` is
also `404`, and the alternates map `es` → root, so this is pre-existing routing, unchanged
by this spec.)

## Evidence: rendered page measurements

A real Chromium over CDP (the repo's own `tests/helpers/chromium.ts`), pointed at the live
preview URL with the bypass header — never a local dev server. Four cells:
`es` and `de` at 390×844 and 1440×900.

command: tsx /tmp/opencode/live-measure.mts (PREVIEW_ORIGIN set to the deployment URL)
exit: 0
at: 2026-11-06T17:03:42Z

```
cell                 es 390×844   es 1440×900   de 390×844   de 1440×900
step1 background     rgba(0,0,0,0) rgba(0,0,0,0) rgba(0,0,0,0) rgba(0,0,0,0)
step1 border widths  0/0/0/0       0/0/0/0       0/0/0/0       0/0/0/0
step1 box-shadow     none          none          none          none
first ink below hdr   61 px         59 px         61 px         59 px     (≥32 required)
ground (html)        rgb(251,251,250) at 1440 es; body/main `rgba(0,0,0,0)` in all four cells
ink (sentence)       rgb(70,70,67)     — all four cells
accent --accent      #7a1f2b → rgb(122,31,43)
accent paint sites   1             1             1             1
  → site             span.clock__value--days (color)  — all four cells
numeral              5534          5534          5.534         5.534
unit                 días          días          Tage          Tage
numeral→unit gap     12.0 px       12.0 px       12.0 px       12.0 px   (≤12 required)
digit text nodes     1             1             1             1         (inside .clock)
unit centre offset   h1 0.00 / label −0.01 / clock 0.00 / sentence 0.00 px
residual asymmetry   ≤0.02 px      ≤0.02 px      ≤0.02 px      ≤0.02 px
sentence ink width   340.16        748.73        330.66        722.66
content box width    343           1176          343           1176
rendered-at          2026-11-06T16:54:08.215Z (es) / …08.365Z (de)
text after 2 s       identical     identical     identical     identical
data-clock-state     absent        absent        absent        absent
role="group" clock   none          none          none          none
```

Projection by form, pixel-level (1440×900, `es`):

command: tsx /tmp/opencode/live-shots.mts (viewport screenshot after scrolling `.demography__panel--projected` into view; rows sampled across the first bar of each panel)
exit: 0
at: 2026-11-06T17:06:09Z

```
PROJECTED bar  y=577  distinct 20  ink 16/66 px (24%)  runs I1 .9 I4 .11 I3 .11 I4 .11 I4 .8
OBSERVED  bar  y=577  distinct  3  ink 85/86 px (99%)  runs .1 I85
computed       projected bar fill: url("#projection-hatch"); observed bar fill: rgb(70,70,67)
pattern        #projection-hatch → <line stroke="rgb(70,70,67)" stroke-width="6">
CSS.supports  fill: url(...) → true ; fill: repeating-linear-gradient(...) → false
```

The hatch is a `<pattern>`, not a CSS gradient — the mechanism the design warned about
(`CSS.supports('fill','repeating-linear-gradient(…))` is `false`) is not used, and the
projected bar demonstrably alternates ink and ground in the rasterised page.

Accent counted on the raster, not in CSS: full-page screenshot (1425×10835), every pixel
equal to `rgb(122,31,43)` lies in **one** band, y 262–321, x 609–784 — the day numeral.
(Chromatic pixels elsewhere are LCD sub-pixel fringes on glyph edges, not paints.)

## AC-006-35 with `PRODUCTION_URL` set

`PRODUCTION_URL` is set in no workflow, so this scenario's live branch had never executed.
It was run twice.

command: PRODUCTION_URL="https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app" npx vitest run tests/acceptance/spec-006-canonical-share.test.ts
exit: 1
at: 2026-11-06T17:07:13Z

```
FAIL  tests/acceptance/spec-006-canonical-share.test.ts > the share hrefs carry one origin on the served page > AC-006-35: every share control embeds one origin, and it is the canonical’s
AssertionError: the production origin serves the shared origin: expected 'https://vercel.com' to be 'https://pensions-system-a9xl3opbw-dan…' // Object.is equality
Expected: "https://pensions-system-a9xl3opbw-danielbueno76-4270s-projects.vercel.app"
Received: "https://vercel.com"
 ❯ tests/acceptance/spec-006-canonical-share.test.ts:135:97
 Tests  1 failed | 3 passed (4)
```

command: PRODUCTION_URL="https://pensions-system-delta.vercel.app" npx vitest run tests/acceptance/spec-006-canonical-share.test.ts
exit: 1
at: 2026-11-06T17:07:29Z

```
AssertionError: the production origin serves the shared origin: expected 'https://pensions-system-danielbueno76…' to be 'https://pensions-system-delta.vercel.…'
Expected: "https://pensions-system-delta.vercel.app"
Received: "https://pensions-system-danielbueno76-4270s-projects.vercel.app"
 Tests  1 failed | 3 passed (4)
```

**What the two failures mean.**

1. *Preview run:* the test's `fetch(production)` has no deployment-protection bypass, so it
   received the Vercel SSO page and parsed `https://vercel.com` out of it. The failure is the
   preview's access control, not a share href. The share hrefs themselves were measured
   **with** the bypass header on the live preview: all four controls
   (`WhatsApp`, `Telegram`, `X`, `LinkedIn`) embed
   `https://pensions-system-delta.vercel.app`, and `link[rel=canonical]`, `og:url` and all
   five `hreflang` alternates carry the same origin. The page was served from the preview
   alias, so the embedded origin is **not** the preview origin.

2. *Production run:* this is the defect the spec exists to fix, still live on production
   today because the PR is unmerged. Production `pensions-system-delta.vercel.app` is served
   from the **production** deployment of `main`, whose canonical and share hrefs carry
   `https://pensions-system-danielbueno76-4270s-projects.vercel.app` — the project alias.
   The preview build already carries the corrected origin, so the equality will hold once
   this commit is production.

**Why the preview's non-equality is not a deploy defect, stated plainly:**

- `pensions-system-delta.vercel.app` is the project's production origin — `vercel inspect`
  reports `target: production` for it — and it answers `200`. It is the host that will serve
  this exact build after merge, so every share link lands on the site that published it.
- The preview origin cannot be the shared origin: anonymous requests to it are redirected to
  Vercel SSO (`302 → vercel.com/sso-api`, measured above). Publishing preview URLs in share
  links would send every recipient to a login wall. `site.ts`'s committed default is the
  deployed origin (production), and `SITE_URL` remains the single override — `AC-006-34`
  still passes (`3 passed`, including the "no `-projects.vercel.app`" clause).
- Therefore the criterion's literal precondition ("Given the deployed page **on the
  production origin**") is unmet by a preview, and its live equality is only observable
  post-merge. It is not recorded here as verified: the post-merge lane
  (`scripts/verify-production-deploy.sh`, `.github/workflows/ci-vercel-production-verify.yml`)
  is where `AC-006-35` becomes provable. **Carried as a limitation, not claimed as a pass.**

If the operator's rule is applied literally — "share hrefs must carry the *preview* serving
origin" — this check fails. I did not classify that as a defect because doing so would
require publishing an SSO-gated URL, and because the criterion itself is written for the
production origin.

## E2E

**SKIPPED — no agentic `e2e` suite in this repository.** Checked: no `e2e/` or `tests/e2e/`
directory, no `e2e` / `@playwright/test` / Maestro dependency in `package.json`, and no
`e2e` script. The repo's end-to-end layer for this stack is the acceptance suite run in
phase 2 (green on this head); there is nothing to point at the live URL.

## Phase-3 budget

- Phase-3 attempts: **1 of 3**
- Fix-and-redeploy rounds consumed: **0 of 3**
- No `Phase-3 budget exhausted` marker: the attempt passed.
- Phase 1 and phase 2 counters untouched by this stage.

## Notes

- `VERCEL_TOKEN` is unset on this machine; the deployment was resolved from the `Vercel`
  commit status, the GitHub deployment record and `vercel inspect`'s stored session. No
  credential problem is recorded (the resolution did not need one). CI reproducibility of
  these checks would need `VERCEL_TOKEN` for the API-only paths, nothing more.
- `VERCEL_AUTOMATION_BYPASS_SECRET` (from the gitignored `config/agent.local.env`) was used
  as a request header to read the protected preview; the value is not reproduced anywhere in
  this document.
- Vercel **Deployment Protection** on previews is what makes the `AC-006-35` live branch
  unusable pre-merge: the test fetches without the bypass header. Whether that test should
  learn to send the header is a follow-up wiring question, recorded here rather than fixed.
- Working-tree dirt not mine and left untouched: `.standards`, `runs.jsonl`,
  `specs/006-centred-number/25-verification.md`, `live-005-top.png`, `live-006box.png`.
  This stage ran `npm run build` locally (gitignored `.next` only) and wrote this file.
  Nothing was committed, pushed, tagged, archived, or deployed from the CLI.

## 45-decisions.md

Condition: Pipeline mode for /home/dbueno/projects/pensions-system/specs/006-centred-number
Options: lite, full
Chosen: full
Why: classifier: 16 named path(s) include 'AC-003-02/03', outside docs/, specs/, *.md and scripts/
Reversibility: append a new entry with an explicit lite or full token
At: 2026-11-06T10:40:22Z


## Commits

- Branch commits ahead of `main` at the archived head: **20** (this record is the 20th).
- Stage 5d added: `docs(changes): record phase-2 CI and deploy verification for 006`,
  `docs(changes): archive 006-centred-number`, and this record.
- at: 2026-11-06T17:11:09Z
