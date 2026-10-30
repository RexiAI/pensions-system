# 002-hero-conversion

> Spec pipeline archive. Original source: `specs/002-hero-conversion/` (deleted by this script).
> Archived: 2026-10-30

## Original ask

# 002-hero-conversion — informal spec

Petición original (usuario, 2026-10-29):

> en ../ hay un png con una captura de pantalla. Quiero que se cambie el color a
> uno mas atractivo. Tienes que analizar por firecrawl las paginas equivalentes
> con trafico para poder atraer a mas usuarios. Luego quiero que centres el reloj
> y los años como si fuese una cuenta atrás de una bomba para poder atraer a la
> gente. Tambien cambia las frases analizando linkedin o redes sociales de los
> top 100 influencers

Captura de referencia: `/home/dbueno/sistema_pensiones.PNG` (hero actual en
`pensions-system-delta.vercel.app`, locale `es`, tema claro).

## Objetivo

Subir la atracción del hero de la home pública sin romper el contrato de
integridad del sitio (cada cifra con su manifiesto, su fuente y su comando de
reproducción), para que más visitantes entren desde buscador y redes.

Cuatro cambios de superficie:

1. Paleta: acento más saturado.
2. Reloj: años + días/horas/min/seg como **un solo grupo centrado**, estilo
   cuenta atrás.
3. Copy: registro de conversión (segunda persona, urgencia) en los 5 locales.
4. `.gitignore`: cerrar el scratch de pipeline que hoy ensucia el árbol.

## Decisiones ya resueltas con el usuario

- **El reloj revierte una decisión documentada.** `CountdownBlock.tsx` sostiene
  que la regla de 1px entre el numeral de años y el conteo de días *"no es
  decoración: es lo que impide que el numeral de años y el conteo de días formen
  un solo grupo tipográfico, para que nadie los divida"*. El usuario ha elegido
  revertirla. Esta spec es el registro de esa reversión: el separador
  desaparece, los dos numerales pasan a un único bloque centrado, y el riesgo
  que la regla mitigaba (invitar a dividir años entre días) queda **aceptado y
  escrito**, no silenciado. La prosa del componente debe actualizarse para decir
  eso, no para seguir afirmando lo contrario.
- **Paleta: papel cálido + acento saturado.** Se mantiene la identidad de papel
  cálido (`--surface-1 #fdf2e1` y familia) y se sube saturación/contraste del
  acento. No se adopta el fondo blanco de los comparables, ni se cambia
  `--radius: 0`, ni se introducen sombras.
- **Copy: registro de conversión, gates intactos.** El usuario pidió copy
  orientado a conversión en vez de la voz editorial actual. Eso cambia el
  registro, **no** las reglas: el `<h1>` sigue obligado a (a) nombrar el país
  (`scripts/check-content-scope.ts`), (b) caber en su presupuesto por locale
  (`web/content/budgets.ts`: `es: 42`), y (c) mantener paridad de claves en los 5
  locales. Ningún gate se modifica: el decision matrix prohíbe a los agentes
  tocar la configuración de un gate. Si una frase de conversión no cabe, se
  reescribe — nunca se trunca ni se reduce el tipo, y nunca se sube el
  presupuesto.
- **LinkedIn queda descartado como fuente.** Firecrawl responde `"we do not
  support this site"` al scrapear un post público de LinkedIn, y no existe una
  lista canónica de "top 100 influencers" de pensiones. En su lugar el copy se
  ancla en los patrones de titular observados en las páginas equivalentes
  (ver §Evidencia).
- **El registro de conversión se limita a `hero.*`.** Resuelto con el usuario
  tras descubrir que `tests/acceptance/countdown.test.ts:214-247` prohíbe, en las
  cinco locales y para **toda** clave `countdown.*`, el vocabulario de urgencia
  (`faltan`, `quedan`, `solo`, `apenas`, `cuenta atrás`, `bomba`, `explota`), el
  signo `!`, la palabra `ya` y la segunda persona (`tú`/`tu`, `you`/`your`,
  `vous`/`ton`, `du`/`dein`, `tu`/`tuo`). Ese test **no se toca**: el bloque que
  publica una proyección estadística sigue hablando en registro factual.
  Matiz que hay que sostener: la *estética* de cuenta atrás aprobada arriba es de
  **layout** (centrado, años y reloj en un grupo, sin separador), no de
  vocabulario. El layout cambia; las palabras del reloj, no.
- **`AC-001-119` se reescribe, con autorización explícita.** Las dos aserciones
  de `tests/acceptance/clock.test.ts` — línea 566 (`the projection group and the
  clock rail are separated by a 1px rule`) y línea 576 (`The years numeral and
  the day count are never in one typographic group`) — codifican exactamente la
  decisión que esta spec revierte. Su ID se preserva, y el PR debe registrar qué
  aserción cambió y por qué, según `docs/TESTING.md §Tests That Encode a Defect`.

## Evidencia de la investigación (Firecrawl, 2026-10-29)

Criterio de selección: primeros resultados para consultas en español sobre
pensión/jubilación (`calculadora pensión jubilación España`, `datos pensiones
España estadísticas`) más dos explicadores de datos de referencia. **No hay
cifras de tráfico verificables** — Firecrawl no las devuelve; lo medido es
visibilidad en buscador, no tráfico.

Paleta extraída con el formato `branding` de Firecrawl:

| Página | Fondo | Acento | Radio |
|---|---|---|---|
| Our World in Data | `#FFFFFF` | `#CE261E` | 4px |
| epdata (`pensiones-graficos-datos`) | `#FFFFFF` | `#05576B` | 3px |
| BBVA Mi Jubilación | `#F4F4F4` | `#072146` / `#001391` | 0–3px |
| Instituto Santa Lucía | `#FFFFFF` | `#0061C8` + `#FFDD44` | 10px / pills 80px |
| **Este sitio (hoy)** | `#fdf2e1` | `#425425` | **0**, sin sombra |

Patrón común de los cuatro comparables: fondo claro + **un** acento saturado +
un CTA dominante. Este sitio es el antitético por diseño (papel cálido, oliva
apagado, dos CTA de igual peso). La palanca de atracción con evidencia es el
acento y la jerarquía del CTA, no el hype en el copy.

## Alcance

Dentro:

- `web/styles/tokens.css`: acento más saturado en claro y oscuro, con los pares
  de contraste recalculados.
- `web/components/series/CountdownBlock.tsx` + `CountdownClock.tsx` + su CSS en
  `web/styles/globals.css`: años y reloj como un grupo centrado único.
- `web/content/data/ES/{es,en,fr,de,it}.json`: claves `hero.*` en registro de
  conversión. Las claves `countdown.*` **no** cambian de registro.
- `.gitignore`: `reports/` únicamente. *(Corregido 2026-10-30: esta línea pedía
  ignorar también `runs.jsonl`. Era un error de redacción de este brief —
  `record-gate-run.sh` documenta que ese fichero es la telemetría append-only
  **trackeada en git** y que `gate-stats.sh` la lee de la raíz del repo.
  Ignorarla habría dejado la telemetría del pipeline sin sobrevivir a ningún
  merge.)*

Fuera:

- Cambiar gates, presupuestos o umbrales (`budgets.ts`, `tokens` prohibición de
  literales, `check-content-scope.ts`, `check-public-vocabulary.ts`).
- Cambiar `--radius`, introducir sombras, o migrar a fondo blanco.
- Tocar las cifras, sus manifiestos, o la lógica de `web/metrics/`.
- Añadir JS de cliente al reloj más allá de lo que ya existe.

## Restricciones que el Coder y el Verifier deben respetar

- `tests/acceptance/first-viewport.test.ts` (AC-001-107) mide el hueco del reloj
  en el primer viewport a 390×844 en los 5 locales. Unificar años y reloj cambia
  la altura del bloque: `--measure-face`, `--clock-sub-col` y `--clock-days-min`
  se recalibran contra medición real en Chromium, no a ojo, y la tabla de
  medidas del test se actualiza con las nuevas cifras.
- `tests/acceptance/palette-labels.test.ts` y `projection-colour.test.ts`
  verifican los pares de contraste (AC-001-117). El acento nuevo pasa o no pasa;
  no se relaja el test.
- `tests/acceptance/clock.test.ts` y `countdown.test.ts` cubren las invariantes
  del reloj: la fecha ancla sigue visible como texto, el reloj sigue sin afirmar
  que el umbral se ha cruzado, y "sin ancla, sin reloj" sigue vigente.
- El sitio sigue siendo cero-JS en la home pública.
- Atribución: toda afirmación publicada resuelve por `web/content/citations.ts`
  (`README §Integrity rules`). El copy nuevo no introduce afirmaciones sin
  cita.

## Dirección de copy (ejemplos, no definitivos)

Registro: segunda persona, una sola idea por frase, un CTA dominante y uno
secundario subordinado. **Aplica solo a `hero.*`.** Sujeto a los tres límites de
arriba.

| Clave | Hoy (`es`) | Dirección |
|---|---|---|
| `hero.statement` | `La aritmética de las pensiones en España` (39) | `La pensión que te espera en España` (33) |
| `hero.sub` | `Cifras oficiales con su fórmula, su fuente y el comando para reproducirlas.` | `Cuánto, cuándo y con qué fórmula. Compruébalo tú.` |
| `hero.ctaPrimary` | `Ver las cifras` | `Ver cuánto te queda` |
| `hero.ctaSecondary` | `Cómo se calcula` | `Cómo se calcula` |
| `countdown.eyebrow` | `Proyección central · Eurostat` | **Sin cambios.** Segunda persona y urgencia están prohibidas en este namespace. |
| `countdown.definition` | (definición larga) | Se mantiene: es la definición, no copy |

Fuente para `de`/`en`/`fr`/`it`: traducción del mismo registro, respetando cada
presupuesto (`de: 55`, `en: 46`, `fr: 52`, `it: 50`).

## Preguntas abiertas

1. ¿Cuánto puede subir el acento antes de dejar de leerse como "instrumento" y
   pasar a leerse como "medio partidista"? El sitio publica una tesis; el
   límite no es medible con un gate.
2. El día que se revise la proyección, ¿el registro de conversión sobrevive a un
   umbral que se aleja? Ninguna de las frases nuevas debe depender de que el
   número se mantenga.

## Tasks

# 002-hero-conversion — task list

Four surface changes (plus the CTA hierarchy the evidence also calls for), one
measurement recalibration, one prose rewrite, one encoding-test rewrite. Numbered in
implementation dependency order: T4 and T5 both depend on T3 (they measure and
re-assert the unified clock's new structure); T7 depends on T2 (the hierarchy must
hold against the raised accent); the rest are independent.

Every task below encodes gate-enforced constraints as acceptance criteria. A task
that cannot meet a constraint must fail the pipeline, never edit the gate, the
budget, the threshold, or the test expectation to make it pass. "Fix the code,
never the threshold" is load-bearing throughout this spec.

Resolutions already settled with the user, recorded here so a later run cannot
drift back:

- **`countdown.*` register — layout yes, vocabulary no.** The unified centred
  clock aesthetic is approved (layout), but every `countdown.*` string keeps its
  factual register. The ban in `tests/acceptance/countdown.test.ts` (urgency
  vocabulary, `!`, `ya`, second person) is not touched. Copy work is confined to
  `hero.*`.
- **`AC-001-119` is rewritten, with explicit authorization.** Its two assertions
  encode the decision this spec reverts; they are rewritten with the ID preserved,
  and the PR body records which assertion changed and why.

---

## T1 — Close the pipeline scratch in `.gitignore`

The working tree accumulates Stryker scratch under `reports/` that is not ignored. Add
it to `.gitignore`; change nothing else.

> **Corrected 2026-10-30.** An earlier version of this task also told the Coder to ignore
> `runs.jsonl`. That was wrong: `runs.jsonl` is the append-only telemetry log that
> `.standards/scripts/record-gate-run.sh` writes ("one JSON object per line … tracked in
> git — the trend is the point, it survives merges") and that
> `.standards/scripts/gate-stats.sh` reads from `<repo-root>/runs.jsonl`. It must remain
> **tracked** — ignoring it would mean the pipeline's own telemetry never survives a merge.
> The requirement was wrong and is fixed here, not silently erased.

**Acceptance criteria**
- `.gitignore` gains an entry that ignores the `reports/` directory (a trailing-slash
  directory entry, matching the file's existing convention for directories).
- `.gitignore` gains **no** entry for `runs.jsonl`; `runs.jsonl` is not listed in
  `.gitignore`, and once committed it stays tracked so
  `.standards/scripts/gate-stats.sh` can read it.
- No pre-existing entry (`node_modules/`, `.next/`, `out/`, `coverage/`, `*.tsbuildinfo`,
  `.envrc`, `.env`, `.env.local`, `data/pending/*.json`, `data/proposals/*.json`,
  `.vitest/`, `.stryker-tmp/`, `.playwright-mcp/`) is removed, reordered, or altered.
- With the change applied, a `reports/` directory at the repo root is ignored by git
  (`git status` shows it as untracked-free), and `runs.jsonl` is tracked by git
  (`git ls-files runs.jsonl` lists it once committed).

---

## T2 — Saturated accent (light and dark), contrast pairs recomputed

Raise the saturation of `--accent` in both themes, keeping the warm-paper identity
intact, and recompute the contrast pairs the accent participates in. No white
background, no radius change, no shadows.

**Acceptance criteria**
- `--accent` in `:root` (light) is replaced with a new literal hex whose CIELCh chroma
  (the measure already used by `tests/acceptance/palette-labels.test.ts`) is strictly
  greater than the current `#425425`. The dark `--accent` is replaced with a value whose
  chroma is strictly greater than `#9cc17f`.
- The accent stays in the olive/green family: its CIELCh hue angle does not move to one
  of the comparable pages' accents (red `#CE261E`, teal `#05576B`, blue `#0061C8`). The
  permitted hue drift is **±8°** in each theme, and it must **not** move toward the ochre
  `--data-projection`. Reason: AC-001-117 requires a hue gap greater than 20° from
  `--data-projection`, and the light accent sits only ~37° from it — a drift past ~17°
  toward the ochre fails that gate, so ±8° is the design's safe band, preferring a small
  move *away* from the ochre (hue slightly up). The design's recommended targets are
  `#3b5512` (light, H≈122) and `#91c46d` (dark, H≈130), chroma band light C*40–44 / dark
  C*46–52, each with chroma strictly greater than today's value (both themes).
- The warm-paper grounds are unchanged: `--surface-1`, `--surface-2`, `--surface-3`,
  `--surface-hero`, the ink ladder and the rule tokens keep their current literal values
  (light and dark). No `#ffffff` / `#FFFFFF` ground is introduced.
- `--radius: 0` and `--shadow: none` are unchanged.
- Contrast pairs are recomputed and still meet their minimums, both themes (verified by
  the existing AC-001-117 test, which is not relaxed): `accent on surface-1/2/3/hero`
  ≥ 4.5:1, `on-accent on accent` ≥ 4.5:1. `--on-accent` is **verified** against the new
  accent (recomputed only if the pair fails; the design prefers it unchanged when it
  holds — it holds at ≥7.0 / ≥9.0 with the recommended pair).
- The accent remains one of exactly three chromatic hues (chroma > 20) with a hue gap
  > 20° from `--data-projection` and `--data-deficit` — the AC-001-117 "exactly three
  chromatic hues" invariant still passes.
- No literal colour is introduced in `web/components` or `web/series` (AC-001-117's
  "no component carries a literal colour" watch item still holds).

---

## T3 — Unify the years numeral with the day/hour/minute/second row into one centred group

This is the documented reversal. `CountdownBlock.tsx` currently asserts the 1px rule
(`.clock { border-top: var(--border-hair) }`) exists "to keep the years numeral and the
day count out of one typographic group, so a reader is never invited to divide one by
the other." The user has chosen to reverse that: the separator goes, the years numeral
and the day count become one centred group, and the risk the rule mitigated is accepted
and written down — never silently deleted.

**Acceptance criteria**
- `web/styles/globals.css`: the `.clock` rule no longer declares `border-top`
  (`border-top: var(--border-hair)` is removed — the 1px separator between the
  projection block and the clock rail is gone).
- In the rendered markup (computed state), the years numeral (`countdown__numeral`,
  with its unit label `countdown__unit`) and the day value (`clock__value--days`, with
  its `clock__label`) are siblings inside one centred container, with no rule and no
  separate block boundary between them. The sub-day fields (hours/minutes/seconds) keep
  sitting in the same group.
- The merged group is centred: it inherits the existing centred axis (`.countdown {
  text-align: center; justify-items: center }`) and no left-aligning declaration
  (`text-align: left/start`, `justify-*: left/start`, `margin-left: 0`) is introduced
  for it.
- `CountdownBlock.tsx`'s documentation prose is rewritten: it no longer asserts the 1px
  rule keeps the two numerals apart; it states the separator has been removed, the two
  numerals now form a single centred group, and the risk that a reader could divide
  years by days is accepted. The prose must not continue to assert the opposite.
- The projection block's remaining content is preserved: the threshold year line
  (`countdown__year-line`), the definition, the variant range, the source, and the
  back-cast sentence still render in the computed state. (The years numeral leaves the
  projection block — that is the change.)
- Invariants do not regress (each covered by an existing acceptance test, none relaxed):
  - "no anchor, no clock" — the merged group renders only when the countdown is
    `computed`; the not-crossed state renders no years numeral and no clock.
  - The anchor date stays visible as text.
  - The clock never states the threshold has been crossed (the elapsed sentence is
    preserved; no "crossed/validated/reached" language is introduced).
  - The home page stays zero-JS: the clock remains server-rendered complete, writes the
    four animated fields through refs (no React state), and owns a single timer.
- The years quantity keeps its unit label and carries no sub-annual unit; the day and
  sub-day fields keep their labels. This is a regrouping, not a renaming or a re-derivation.

The tests that currently encode the old layout are rewritten in T4, not here.

---

## T4 — Rewrite the five assertions that encode the old layout (depends on T3)

Five assertion sites encode "the years numeral is a separate projection block above the
clock rail, behind a 1px rule" — exactly the decision this spec reverts. They are
rewritten to assert the new structure, with their IDs preserved, and the PR body records
what changed. Per `docs/TESTING.md` §"Tests That Encode a Defect", this is the authorized
procedure for a behavior change, never a silent edit to make a suite green.

The five sites, flagged so the human gate sees exactly which assertions change:

1. **AC-001-119** — `tests/acceptance/clock.test.ts`, the `it` "the projection group and
   the clock rail are separated by a 1px rule": `expect(rule).toContain('border-top:
   var(--border-hair)')` and `expect(block.slice(yearsNumeralAt, railAt)).not.toContain(
   'clock__fields')` are rewritten to assert the separator is gone and the two numerals
   **are** in one group. ID `AC-001-119` preserved. (Authorized by the user — resolution 2.)
2. **AC-001-111 — hairline `it`** — `tests/acceptance/clock.test.ts` (~line 866),
   `expect(declared('.clock', 'border-top')).toEqual(['var(--border-hair)'])` inside
   "the threshold rule and the rail hairline still span the whole face": the `border-top`
   assertion is removed and re-pointed. **Invariant to survive:** the threshold rule still
   spans the face (`justify-self: stretch`, `height: var(--rule-projection)` on
   `.countdown__rule`) and `.clock` still spans the face via `justify-self: stretch` — the
   span is carried by the grid stretch, not by the removed hairline. The check is not
   replaced with a weaker "still spans" claim that is now false. ID `AC-001-111` preserved.
3. **AC-001-111 — face-list coverage** — `tests/acceptance/clock.test.ts`, the
   "every element the face renders is one this contract covers" `it`: the `FACE_ELEMENTS`
   list **may legitimately stay unchanged** (the merge keeps every class — `countdown__value`,
   `countdown__numeral`, `countdown__unit` and the clock classes all still render, only
   their container changes). If a class leaves or joins, add or remove only that class. If
   the list is left untouched, the commit body says so — a reviewed-and-unchanged list and
   a forgotten list look identical in a diff. The centring invariant is **not** relaxed:
   centred grid (not a flex row), no left-aligning declaration, prose centred in
   `--measure-face`. ID `AC-001-111` preserved.
4. **AC-001-99** — `tests/acceptance/countdown.test.ts`, "both integers are printed beside
   the number…": the projection-group slice `projectionGroup = html.slice(0,
   html.indexOf('class="clock"'))` is re-pointed so the invariant it actually protects
   still holds — the years quantity (wherever it now renders) carries no sub-annual unit
   (`día/mes/hora/minuto/segundo` and their plural forms). ID `AC-001-99` preserved.
5. **AC-001-107** — `tests/acceptance/first-viewport.test.ts` (~line 185),
   `expect(CSS.slice(CSS.indexOf('.clock {')).toContain('var(--border-hair)')` inside
   "nothing on the way is shrunk or hidden to make room": the `var(--border-hair)` proxy
   is re-pointed to a declaration of `.clock` that still exists after the separator is
   removed. **Invariant to survive:** the `.clock` rule is still declared at its own type
   scale in the desktop sheet and not overridden at the mobile breakpoint (no
   `display: none`, no `font-size`, no `.clock` in the mobile query). Never deleted
   outright. ID `AC-001-107` preserved.

- The change record for this task (commit body and/or PR body) states which assertion
  changed and why, for every site above, citing `docs/TESTING.md` §Tests That Encode a
  Defect.
- New acceptance tests cite `AC-002-15`, `AC-002-16`, `AC-002-17`, `AC-002-29` and
  `AC-002-30`, so `scripts/check-scenario-traceability` stays green.
- No other test is modified to make anything pass; the five sites above are the only
  test-expectation changes, and each reflects the reversal rather than relaxing a gate.

## T5 — Re-measure the unified clock and recalibrate the fold tokens (depends on T3)

Unifying the years numeral with the day row changes the block's height, so the
first-viewport guarantee (AC-001-107) must be re-verified against the real, built app
in Chromium — not by eye — and the three fold tokens plus the measurement table updated
with the new figures.

**Acceptance criteria**
- `--measure-face`, `--clock-sub-col`, and `--clock-days-min` in `web/styles/tokens.css`
  are recalibrated to values measured in Chromium against the built app (`npm run build`,
  `next start`), at 390×844, in all five locales, such that the clock's bottom edge is at
  or above `viewport height − 50px` in every one of the five locales, and the per-locale
  clearance table is recorded (so a regression in any one locale is visible, not averaged
  away). [Corrected 2026-10-29: the earlier clause "no locale is worse than the Spanish
  baseline" was written from a false premise — the shipped Revision-4 record already had
  `fr 35.5` vs `es 54.9`. Spec-002 measurement: es/en/de/it 75.92px, fr 56.48px clearance;
  the clock is 343.17px in all five, and French's extra `--text-micro` line sits in the
  projection block above the clock, not in the clock.]
- The `--measure-face` comment in `tokens.css` is rewritten to record the new measured
  clearance table (per-locale clearance vs. measure, and the binding constraint), with
  the measurement date, exactly as the current comment does.
- `tests/acceptance/first-viewport.test.ts`'s `MEASURED_CLOCK` table (and the prose table
  above it) is updated with the newly measured `clock` and `fields` ranges for 390×844,
  and the recorded 360×640 / 1366×768 rows are re-measured or re-recorded as the same
  "recorded, not asserted" rows.
- The AC-001-107 assertions are not relaxed: the "whole clock box inside the first
  viewport" check, the `clock[1] ≤ viewport − 50` clearance margin, and the "no shrink /
  no hide to make room" assertions keep their exact thresholds. Only the measured
  numbers change, and only to values backed by the recorded Chromium measurement.

---

## T6 — Conversion-register copy for the hero, in all five locales (`hero.*` only)

Rewrite the hero's conversion surface in second-person, one-idea-per-sentence register,
subject to the three named gates. The `<h1>` budget, the country-name requirement, and
key parity are build gates, not guidelines: a sentence that does not fit is rewritten,
never truncated and never set smaller, and no budget is raised. Copy work is confined
to `hero.*`; every `countdown.*` string keeps its factual register.

**Acceptance criteria**
- Each locale's `hero.statement` names its country — it contains that locale's
  `countryName` (`España` / `Spain` / `Espagne` / `Spanien` / `Spagna`) — so
  `scripts/check-content-scope.ts` stays green.
- Each locale's `hero.statement` fits its budget (`web/content/budgets.ts`): `es ≤ 42`,
  `en ≤ 46`, `fr ≤ 52`, `de ≤ 55`, `it ≤ 50`, measured as `statement.length`.
- All five locales keep key parity: each `strings` object still has exactly 248 keys, with
  no missing and no unknown keys — `web/content/registry.ts` stays green. Only `hero.*`
  string values change; no key is added or removed.
- The `hero.statement`, `hero.sub` and `hero.ctaPrimary` strings are rewritten into the
  conversion register: second-person address and a single idea each (direction, not final
  wording: `es` `La pensión que te espera en España` / `Cuánto, cuándo y con qué fórmula.
  Compruébalo tú.` / `Ver cuánto te queda`). `hero.ctaSecondary` may stay as-is or follow
  the same register.
- Every `countdown.*` string is unchanged — in particular `countdown.eyebrow` stays
  `Proyección central · Eurostat` (and its translations), never adopting second person or
  urgency. The ban in `tests/acceptance/countdown.test.ts` (urgency vocabulary, `!`,
  `ya`, second person) stays green on every `countdown.*` string.
- The copy introduces no factual assertion that requires a citation: the `hero.*` strings
  make no new quantity, source, or institution claim. The `editorial` object
  (`agreement` / `disputes` / `thesis`) and the `countdown.clock.*` / `fig.*` strings are
  not modified by this task.
- No gate is modified to make the copy pass: `budgets.ts`, `registry.ts`, `keys.ts`,
  `check-content-scope.ts`, `check-public-vocabulary.ts`, and every acceptance test keeps
  its current contents — with one declared exception: `tests/acceptance/content-locale.test.ts`
  (the re-recording below). Only the five JSON files' `hero.*` values change.
- `tests/acceptance/content-locale.test.ts` — the `MEASURED` record and the prose table
  above it are re-recorded from a real measurement at 1280×800, under the same conditions
  as the record it replaces, because T6 rewrites `hero.statement` in all five locales while
  that file pins the statement's measured character count and per-line widths. The new
  record is `es 34 chars [533,535]`, `en 39 [504,642]`, `fr 38 [578,565]`, `de 39 [635,515]`,
  `it 36 [544,543]`. What must survive: every statement still sets in exactly two lines
  inside the 667px column, and no entry in `web/content/budgets.ts` is widened to fit.
  **This site was changed before it was authorized** — the Coder modified it on an
  authorization that did not exist, and the human ratified the substance retroactively on
  2026-10-29 as a mandatory consequence of this task. The trail records the order of
  events; it does not imply the change was planned.

---

## T7 — CTA hierarchy: one dominant primary, one subordinate secondary (depends on T2)

The brief's evidence names two attraction levers — a more saturated accent, and one
dominant CTA. Only the accent got a task. Today both hero actions inherit the global
`a { color: var(--accent) }`, so raising the accent's chroma makes the secondary action
*louder*, not quieter. This task fixes the hierarchy in CSS; copy wording belongs to T6
and is not touched here.

**Acceptance criteria**
- One visually dominant primary action: the primary (`.hero__cta`) is a filled `--accent`
  block with `--on-accent` ink, no underline, `--radius: 0`, `--text-body`, and the
  existing `--space-3`/`--space-5` padding. It is the only accent-coloured action above
  the fold, and its label must not wrap in any locale (no two-line CTA).
- One clearly subordinate secondary action: the secondary is a text link in `--ink-2`
  with a visible 1px underline, no fill, no accent colour, at `--text-body-lg` or
  `--text-body` — never larger than the primary.
- Token-only styling: every colour, size, spacing and radius in the CTA rules resolves a
  token (`--accent`, `--on-accent`, `--ink-2`, `--text-body`, `--text-body-lg`,
  `--space-*`, `--radius`); no literal hex/rgba/px appears in those rules (AC-001-117's
  no-literal watch item).
- The secondary no longer competes on hue: the secondary link's colour is not `--accent`,
  so T2's accent rise leaves its prominence unchanged. The accent does one job above the
  fold — the primary CTA's material.
- Both links keep their existing href targets and accessible names: the numeric tier's
  primary targets `#figuras` and its secondary `#metodo`; the proposition tier's primary
  targets `#metodo` and its secondary `#figuras`. Each link's visible text is unchanged
  and remains its accessible name.
- A11y: the secondary keeps a visible underline so affordance never rests on colour
  alone; the primary keeps `--on-accent` contrast ≥ 4.5:1 against the accent and a
  visible focus ring (`--focus` + `--focus-offset`) outside the filled box.
- No motion: no hover grow, no underline animation, no arrow slide.
- This task changes `web/styles/globals.css` only; if a class name is needed on the
  secondary link, that markup change preserves the href and the accessible name. It does
  not modify any JSON content or string.

## Open questions (non-blocking, carried from the owner's brief)

1. How far can the accent's saturation rise before the site reads as a partisan medium
   rather than an instrument? The limit is not measurable by a gate.
2. The day the projection is revised, does the conversion register survive a threshold
   that moves away? No new sentence may depend on the number staying fixed.

## Acceptance scenarios

## AC-002-01 — The scratch directory is ignored
## AC-002-02 — The runs log is tracked, not ignored
## AC-002-03 — Every pre-existing entry is preserved
## AC-002-04 — The light accent is more saturated
## AC-002-05 — The dark accent is more saturated
## AC-002-06 — The accent keeps the olive family, held within ±8° of its current hue
## AC-002-07 — Warm paper, radius and shadow are unchanged
## AC-002-08 — The accent's contrast pairs are recomputed and still meet their minimums
## AC-002-09 — The 1px separator between the projection block and the clock rail is gone
## AC-002-10 — The years numeral and the day count are one centred group
## AC-002-11 — The merged group is centred, with no left alignment reintroduced
## AC-002-12 — The component prose records the accepted risk
## AC-002-13 — "No anchor, no clock" still holds
## AC-002-14 — The integrity invariants are preserved
## AC-002-15 — AC-001-119 asserts the new structure, no longer the 1px rule
## AC-002-16 — AC-001-111 keeps the centring invariant; the face list is reviewed, not churned
## AC-002-17 — AC-001-99 keeps its invariant while the years numeral relocates
## AC-002-18 — The fold tokens are recalibrated from real Chromium measurement
## AC-002-19 — The measurement table in `first-viewport.test.ts` is updated
## AC-002-20 — The first-viewport guarantee still holds in every locale
## AC-002-21 — The clearance margin is measurement-driven, not relaxed
## AC-002-22 — Every statement names its country
## AC-002-23 — Every statement fits its locale budget
## AC-002-24 — Key parity is preserved across all five locales
## AC-002-25 — The hero copy is in the conversion register, second person
## AC-002-26 — The copy introduces no factual claim that requires a citation
## AC-002-27 — No gate is modified to make the copy pass
## AC-002-28 — Every `countdown.*` string keeps its factual register
## AC-002-29 — AC-001-111's hairline assertion is re-pointed to the surviving span
## AC-002-30 — AC-001-107's hairline proxy is re-pointed to a surviving declaration
## AC-002-31 — One visually dominant primary action
## AC-002-32 — A clearly subordinate secondary action
## AC-002-33 — CTA styling is token-only, with no literal
## AC-002-34 — The secondary no longer competes on hue
## AC-002-35 — Both links keep their href targets and accessible names
## AC-002-36 — The statement-width record is re-measured, never the budget

## Verification

# Verification — 002-hero-conversion

**Verifier:** spec-verifier (stage 4, independent re-check)
**Attempt:** 1, phase 1
**Branch:** `spec/002-hero-conversion`
**Date:** 2026-10-29
**Verified against:** `10-tasks.md`, `15-design.md`, `20-acceptance/` (36 scenarios `AC-002-01`…`AC-002-36`).
`00-informal.md` was **not** read (information barrier).

## Scope of the re-check

Every prior-stage self-report was re-executed, not trusted. Coder's reported
`npm test` 0 / `764→763`, typecheck 0, lint 0, build 0; Refactorer's "behaviour
unchanged, check-code-principles.sh scoped clean" — all re-run below.

---

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh
exit: 0
at: 2026-10-29T21:50:25Z

Scenario IDs found: 36 live, 99 archived
PASS AC-002-01 — traced to a test
PASS AC-002-02 — traced to a test
PASS AC-002-03 — traced to a test
PASS AC-002-04 — traced to a test
PASS AC-002-05 — traced to a test
PASS AC-002-06 — traced to a test
PASS AC-002-07 — traced to a test
PASS AC-002-08 — traced to a test
PASS AC-002-09 — traced to a test
PASS AC-002-10 — traced to a test
PASS AC-002-11 — traced to a test
PASS AC-002-12 — traced to a test
PASS AC-002-13 — traced to a test
PASS AC-002-14 — traced to a test
PASS AC-002-15 — traced to a test
PASS AC-002-16 — traced to a test
PASS AC-002-17 — traced to a test
PASS AC-002-18 — traced to a test
PASS AC-002-19 — traced to a test
PASS AC-002-20 — traced to a test
PASS AC-002-21 — traced to a test
PASS AC-002-22 — traced to a test
PASS AC-002-23 — traced to a test
PASS AC-002-24 — traced to a test
PASS AC-002-25 — traced to a test
PASS AC-002-26 — traced to a test
PASS AC-002-27 — traced to a test
PASS AC-002-28 — traced to a test
PASS AC-002-29 — traced to a test
PASS AC-002-30 — traced to a test
PASS AC-002-31 — traced to a test
PASS AC-002-32 — traced to a test
PASS AC-002-33 — traced to a test
PASS AC-002-34 — traced to a test
PASS AC-002-35 — traced to a test
PASS AC-002-36 — traced to a test

✔ Scenario traceability check: every scenario traced, every reference resolves.

command: npx tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-10-29T21:50:25Z

scenario traceability (2-3 digit ids): 155 scenarios, all cited, all citations resolve

All 36 live scenarios trace to a test; every test reference resolves. The
repo's own `check-scenario-traceability-3digit.ts` wrapper (155 scenarios,
which additionally covers spec 001's 3-digit IDs) is also clean.

---

## Evidence: full test suite

command: npm test
exit: 0
at: 2026-10-29T21:50:31Z

> pensions-system@0.0.0 test
> vitest run

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  60 passed (60)
      Tests  763 passed (763)
   Start at  22:50:32
   Duration  4.92s (tests 53%, import 35%, transform 10%, worker 1%)

command: npm run typecheck
exit: 0
at: 2026-10-29T21:50:40Z

> pensions-system@0.0.0 typecheck
> tsc --noEmit

command: npm run lint
exit: 0
at: 2026-10-29T21:50:40Z

> pensions-system@0.0.0 lint
> eslint .

60 files / 763 tests pass; typecheck clean; lint clean. No test skipped or
disabled. The 764→763 count is the one authorised consolidation: the AC-001-119
body was rewritten in place (see the T4 spot check below), not a deleted guard.

---

## Evidence: complexity gate

command: npm run lint
exit: 0
at: 2026-10-29T21:50:40Z

> pensions-system@0.0.0 lint
> eslint .

The repo's authoritative complexity gate is ESLint `complexity: ['error', 6]`
(`eslint.config.mjs`, unchanged) run as `npm run lint`. Exit 0 = no function
exceeds 6. The `check-code-principles.sh` heuristic complexity gate, scoped to
the changed files, agrees (0 FAIL — see the design-principles block).

---

## Evidence: design-principles gate

The design-principles script was run more than one way, because the task's
known-tooling-facts warning is accurate: the all-gates invocation SIGPIPEs at
the DRY gate, and the whole-tree scan includes `.next/` (compiled output) and
`.standards/` (the submodule). Each invocation's command and exit code is
recorded verbatim; the classification of each finding is stated plainly.

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates complexity
exit: 0
at: 2026-10-29T21:51:15Z

Checking design principles in: . (tier: production)
PASS Complexity/KISS (java): no violations found

✔ Design-principles check (gates: complexity): 0 FAIL(s), 0 WARN(s).

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates yagni
exit: 0
at: 2026-10-29T21:51:16Z

--- YAGNI ---
PASS YAGNI (go): no premature abstractions detected
PASS YAGNI (node): no premature abstractions detected
✔ Design-principles check (gates: yagni): 0 FAIL(s), 0 WARN(s).

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates solid
exit: 0
at: 2026-10-29T21:51:17Z

--- SOLID ---
PASS SOLID-SRP (java): no oversized files
PASS SOLID-SRP (go): no oversized files
PASS SOLID-OCP (java): no large type-dispatch chains
PASS SOLID-OCP (go): no large type-dispatch chains
PASS SOLID-OCP (node): no large type-dispatch chains
PASS SOLID-LSP (java): no heavy instanceof dispatch
PASS SOLID-ISP (java): no fat interfaces
PASS SOLID-ISP (node): no fat interfaces
PASS SOLID-DIP (java): no domain→infrastructure imports
PASS SOLID-DIP (go): no domain→infrastructure imports
PASS SOLID-DIP (node): no domain→infrastructure imports
PASS SOLID-DIP (python): no domain→infrastructure imports
PASS SOLID-DIP (rust): no domain→infrastructure imports
✔ Design-principles check (gates: solid): 0 FAIL(s), 0 WARN(s).

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates component-per-file
exit: 0
at: 2026-10-29T21:51:18Z

--- Component-per-file ---
PASS Component-per-file: no violations
✔ Design-principles check (gates: component-per-file): 0 FAIL(s), 0 WARN(s).

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates property-tests
exit: 0
at: 2026-10-29T21:51:18Z

--- Property tests ---
PASS Property tests (java): jqwik/@Property in use
PASS Property tests (go): testing/quick in use
PASS Property tests (node): fast-check in use
✔ Design-principles check (gates: property-tests): 0 FAIL(s), 0 WARN(s).

command: .standards/scripts/check-code-principles.sh . --tier production -BaseRef HEAD --gates dry
exit: 141
at: 2026-10-29T21:51:19Z

Checking design principles in: . (tier: production)

--- DRY ---
(then the process died — exit 141, SIGPIPE, no further output)

**Tool-defect findings — none of these are code defects:**

1. **DRY gate SIGPIPE (exit 141).** The DRY sub-pipeline is
   `… | sort -rn | head -10 > "$tmp"` (`.standards/scripts/check-code-principles.sh`
   line 709). Under `set -o pipefail`, when the whole tree yields >10 duplicate
   4-line windows, `head -10` closes the pipe and `sort` dies with SIGPIPE → the
   whole script exits 141. This kills the all-gates run *before* the FAIL-capable
   gates report. Isolated here with `--gates dry` to show the SIGPIPE is the DRY
   gate's own sub-pipeline, not a code finding. **DRY is a warn-only gate** (not in
   the default blocking set `complexity,property-tests,component-per-file`), so this
   is a submodule-script bug, not a blocking code defect.

2. **Whole-tree scan includes `.next/` and `.standards/`.** The un-pruned
   whole-tree `--gates complexity --json` run reported FAILs only in:
   `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (CC=10) and
   `./.next/server/chunks/…` (compiled Turbopack runtime, CC up to 47). **No FAIL
   landed in project source** (`web/`, `app/`, `tests/`, `scripts/`). Those two
   paths are compiled output and the submodule — not this repo's deliverable.

3. **Tier auto-detection reports `mvp`** because the script globs `AGENTS_*.md`
   and this repo's file is `AGENTS.md`. `--tier production` was passed explicitly
   (this repo's declared tier), so the property-test gate is meaningful and passed
   (fast-check in use).

**Verdict for this gate:** scoped to the changed files (`-BaseRef HEAD`), every
blocking gate — `complexity`, `component-per-file`, `property-tests` — passes
with 0 FAIL / 0 WARN; the warn-only gates `yagni` and `solid` also pass with
0 findings. The only non-zero exit is the DRY gate's SIGPIPE (tool defect,
warn-only). No FAIL lands inside project source.

---

## Evidence: scenario-to-behavior spot check

command: read tests/acceptance/{clock-unify,cta-hierarchy,first-viewport,clock,countdown}.test.ts + web/components/series/{CountdownBlock,CountdownClock}.tsx + web/components/public/Hero.tsx
exit: 0 (manual read; no command exit)
at: 2026-10-29T21:53:00Z

Four scenarios from four different tasks were read to the assertion level.

**AC-002-10 (T3, clock-unify)** — `tests/acceptance/clock-unify.test.ts`:
`it('AC-002-10: both numerals render inside the .clock container, the years first')`
asserts `numeralAt > clockAt`, `numeralAt < fieldsAt`, `unitAt` beside the numeral
and `< fieldsAt`, `daysAt > fieldsAt`; and `it('… no rule and no block boundary sits
between the two numerals')` asserts the slice between the years `</p>` and the
fields `<div>` is empty (no `<hr>`, no `countdown__rule`, `between.trim() === ''`).
This matches the scenario's "siblings inside one centred container, no rule element
and no separate block boundary between them, sub-day fields in the same group" —
**PASS, asserts what the scenario says.**

**AC-002-18 (T5, clock-recalibrate)** — `tests/acceptance/first-viewport.test.ts`:
`it('AC-002-18: every locale’s clock box stays inside the first viewport at 390x844')`
asserts `Object.keys(MEASURED_CLOCK_BY_LOCALE).sort()` equals `[...LOCALES].sort()`
and each locale's clock bottom `<= 844 - CLEARANCE` (50) and `< 844`. The table
carries five distinct rows (`es/en/de/it` 768.08, `fr` 787.52) — per-locale, not
averaged, and a missing locale fails the key-set equality. The corrected clause
("every locale's clock bottom at or above viewport − 50px") genuinely bites for all
five. The old "no locale is worse than the Spanish baseline" clause appears nowhere
in tests or web source (only in the acceptance markdown's dated correction note).
**PASS, asserts what the scenario says.**

**AC-002-31 (T7, CTA hierarchy)** — `tests/acceptance/cta-hierarchy.test.ts`:
`it('AC-002-31: the primary is a filled accent block with --on-accent ink and no
underline')` asserts `.hero__cta` declares `background: var(--accent)`,
`color: var(--on-accent)`, `text-decoration: none`, `border-radius: var(--radius)`,
`font-size: var(--text-body)`, `padding: var(--space-3) var(--space-5)`; and
`it('… only accent-coloured action above the fold')` asserts `.hero__cta-secondary`
does not resolve `var(--accent)` and no other hero-action rule uses `color:
var(--accent)`. AC-002-32/33/34/35 cover the subordinate secondary, token-only
styling, hue opt-out, and href/accessible-name preservation respectively.
**PASS, asserts what the scenario says.**

**AC-001-119 → AC-002-15 (T4, authorised rewrite)** — `tests/acceptance/clock.test.ts`:
the rewritten `it('AC-001-119: the years numeral and the day count are one group,
with no rule between them')` now asserts `rule).not.toContain('border-top')`,
`yearsNumeralAt > railAt`, `yearsNumeralAt < fieldsAt`, and `between` (numeral→fields)
contains no `<hr`/`countdown__rule`/`clock__value--days`. The ID `AC-001-119` is
preserved. A companion `it('AC-002-15: …')` reads the neighbour's body and pins the
re-pointing (not a deletion, not a weakening). **PASS, re-pointed in the positive
direction, never weakened.**

No spot-checked scenario had a test that merely carried the right ID with the wrong
assertion; all four assert the scenario's Given/When/Then.

---

## No unaccounted behavior

Skimmed the full diff. Everything traces to a task/scenario:

- `tests/helpers/colour.ts` (new) — the CIELCh/WCAG arithmetic extracted out of
  `palette-labels.test.ts` (DRY; used by `palette-accent.test.ts` and
  `tests/unit/colour-metrics.test.ts`). No math change (`lab` returns an object
  instead of a tuple, values identical).
- `tests/helpers/render-document.ts`, `tests/fixtures/series.ts` — `decodeText` /
  `countdownAt` helpers hoisted out of `clock.test.ts`.
- `tests/unit/clock-properties.test.ts`, `tests/unit/colour-metrics.test.ts` (new) —
  fast-check property tests (production-tier requirement).
- `web/components/public/Hero.tsx` — `HeroLead`/`ReadingsPanel`/`StatusPanel`/
  `subjectFactRows` extraction + the `.hero__cta-secondary` class (T7).
- `web/components/series/CountdownBlock.tsx` / `CountdownClock.tsx` — the merged
  group (T3) + `NotCrossed`/`ThresholdYearLine`/… extractions.
- `tests/acceptance/{gitignore,hero-copy,palette-accent,clock-unify,cta-hierarchy}.test.ts`
  (new) — T1, T6, T2, T3, T7 acceptance coverage.

No orphan logic. No helper unaccounted for.

## Specific claims the prior stages reported (re-verified)

1. **`npm run build` really ran the prebuild gates.** `npm run prebuild` output names
   all four: `verify-derived.ts` ("derived figures verified: 7 (2 computed, 5
   unavailable)"; "derived series verified: 2"), `check-content-scope.ts` ("country
   scope gate: clean (5 locales)"), `check-public-vocabulary.ts` ("public vocabulary
   gate: clean (5 locales)"), `check-scenario-traceability-3digit.ts` ("155 scenarios,
   all cited, all citations resolve"). Exit 0. `npm run build` then runs `next build`
   to a clean compile (exit 0; 3 pre-existing Turbopack `series-store.ts` filesystem
   warnings, not from this spec's files).

2. **No gate/budget/threshold/config modified.** `git diff` for `web/content/budgets.ts`,
   `web/content/registry.ts`, `web/content/keys.ts`, `scripts/**`,
   `eslint.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `package.json`,
   `next.config.ts` — all UNCHANGED.

3. **Assertion changes within the authorised set.** The five modified acceptance files
   are `clock`, `countdown`, `first-viewport`, `content-locale`, `palette-labels`.
   - `clock.test.ts`: AC-001-119 rewritten (new structure), AC-001-111 hairline
     re-pointed to `.toEqual([])` with span assertions kept; IDs preserved.
   - `countdown.test.ts`: AC-001-99 slice re-pointed (`html.indexOf('countdown__value')`
     instead of the projection-group slice), invariant (no sub-annual unit) kept.
   - `first-viewport.test.ts`: `MEASURED_CLOCK` re-recorded, `MEASURED_CLOCK_BY_LOCALE`
     added, AC-001-107 hairline proxy re-pointed to `margin-top: var(--space-4)` +
     `.clock__value--days/--sub` font-size declarations; the three AC-001-107
     thresholds (`clock[1] ≤ viewport`, `≤ viewport − 50`, no shrink/no hide) unchanged.
   - `content-locale.test.ts`: `MEASURED` re-recorded to `es 34 [533,535] / en 39
     [504,642] / fr 38 [578,565] / de 39 [635,515] / it 36 [544,543]`, 667px column and
     two-line invariant intact (AC-002-36).
   - `palette-labels.test.ts`: colour helpers moved to `tests/helpers/colour.ts`
     (identical arithmetic); `lab()[0]` → `lab().lightness`. No assertion weakened.
   **No assertion was deleted or made vacuous.** The one measured-number change
   (`toBeCloseTo(310,1)` → `toBeCloseTo(343.17,1)`) is exactly what AC-002-21 authorises
   ("only the measured numbers change").

4. **AC-002-18 dropped clause gone, replacement enforced.** "no locale is worse than
   the Spanish baseline" appears nowhere in tests/web (only the dated correction note
   in the acceptance markdown). The replacement — per-locale table, each locale's
   bottom `<= viewport − 50px` at 390×844 — is asserted by `AC-002-18` over all five
   locales and fails if any locale is absent (key-set equality with `LOCALES`).

5. **`countdown.*` register intact.** `tests/acceptance/countdown.test.ts` (register-
   rules describe block) still bans urgency vocabulary (`faltan/quedan/solo/apenas/
   cuenta atrás/bomba/explota`), `!`, `\bya\b`, and per-locale second person over every
   `countdown.*` string (plus an extended `countdown.clock.*` ban). JSON diffs touch
   only `hero.*`; `countdown.eyebrow` is unchanged in all five locales.

6. **Zero-JS on the public home page.** No new `'use client'` in the hero/clock tree —
   `CountdownClock.tsx`'s `'use client'` is pre-existing (`git show HEAD` confirms);
   `Hero.tsx`/`CountdownBlock.tsx` remain server components. The clock writes four
   fields through refs, no `useState`, no `setInterval` (asserted by AC-002-14).

7. **Token discipline.** `grep` for `#[0-9a-f]{3,8} | \d+px | rgba?(` in the changed
   components (`Hero.tsx`, `CountdownBlock.tsx`, `CountdownClock.tsx`) finds only a
   prose comment ("1px rule"). No literal colour/spacing/size in code.

8. **Key parity / budgets.** 248 keys in all five locales (AC-002-24). Statement
   lengths: es 34, en 39, fr 38, de 39, it 36 — all within `budgets.ts` (42/46/52/55/50)
   (AC-002-23). Every `hero.statement` names its country (`España/Spain/Espagne/
   Spanien/Spagna`) (AC-002-22).

9. **`.gitignore` (T1).** Adds `reports/` and `runs.jsonl` only; both now ignored
   (`git check-ignore` exit 0); no pre-existing entry removed.

---

## Overall verdict

All five contract checks ran and produced no code findings:

1. scenario traceability — PASS (exit 0, both scripts)
2. full test suite — PASS (npm test 0, typecheck 0, lint 0)
3. complexity gate — PASS (ESLint complexity ≤ 6, exit 0)
4. design-principles gate — PASS for changed files (0 FAIL in every blocking gate,
   scoped; the only non-zero exit is the submodule script's DRY SIGPIPE, warn-only)
5. scenario-to-behavior spot check — PASS (4 scenarios, assertions match)

The DRY-gate SIGPIPE (exit 141), the `.next/`/`.standards/` whole-tree noise, and the
`mvp` tier auto-detection are all submodule-script defects, recorded above and flagged
to the Architect as review hints — none is a code defect and none is a blocking FAIL.

**VERDICT: PASS**

---

## Evidence: phase-2 CI round 1

command: gh pr checks 9 --json name,state,bucket,workflow,link
exit: 0
at: 2026-10-29T22:14:16Z

Head SHA checks ran against: 7160df18020dd8e7ccf580b60e754a44075f0ec6
(`spec/002-hero-conversion`, PR #9, draft; SPEC_PHASE2_RETRIES=0)

Per-check outcome (bucket is the PASS/FAIL parse rule):

| check | state | bucket | verdict | workflow |
|---|---|---|---|---|
| frontend-ci / Lint & Format | SUCCESS | pass | PASS | CI |
| frontend-ci / Unit Tests | SUCCESS | pass | PASS | CI |
| frontend-ci / Build | SUCCESS | pass | PASS | CI |
| frontend-ci / Docker Build & Push | SKIPPED | skipping | PASS (skipped, not a failure) | CI |
| Vercel Preview Comments | SUCCESS | pass | PASS | — |
| Vercel | SUCCESS | pass | PASS | — |

No check is `fail`. No failing check IDs captured; no job logs read.

Notes:

- `frontend-ci / Build` was `QUEUED`/`IN_PROGRESS` on first query and reached
  terminal `SUCCESS` (`pass`) after a bounded poll (2 re-queries, ~15s apart).
- `frontend-ci / Docker Build & Push` is `SKIPPED` (bucket `skipping`). A skipped
  check is neither a pass nor a fail and carries no finding here; it is a draft-PR /
  push-condition skip, not a code failure.
- The Vercel preview and its comments check are both `pass` — the deploy lane
  (phase 3) is green at the PR-head level; no phase-2 code failure and no
  phase-3 lane failure to route.
- Known non-failing items confirmed absent from this run's failure set: the DRY
  sub-pipeline SIGPIPE (exit 141, warn-only) and the `CountdownClock.tsx` 60.53%
  mutation score are not surfaced by CI, and the `first-viewport.test.ts:161`
  two-statements-on-one-line cosmetic defect does not fail ESLint/tsc (consistent
  with prior phase-1 finding — recorded, not a CI failure).

Routing: none required — zero failing checks.

**PHASE-2 ROUND 1: PASS**

## Quality gates

# Report — 002-hero-conversion

**Stage:** 5a, Mutation Runner (`spec-mutation-runner`)
**Branch:** `spec/002-hero-conversion`
**Conformance tier:** `production` (repo root `AGENTS.md`) — mutation testing is **required**, not skipped
**Verifier verdict carried forward:** **PASS** (`25-verification.md`, attempt 1, phase 1, zero remediation)
**Date:** 2026-10-29
**Information barrier:** `specs/002-hero-conversion/00-informal.md` was **not** read. Mutants were
killed from the tests and from `20-acceptance/` only.

Nothing was committed, pushed, or opened as a PR. Production code was not modified: the only
files this stage added are three unit test files.

---

## Scope of the run, and one decision that needs the Architect's attention

The spec's production surface is:

| Changed file | Mutated? | Why |
|---|---|---|
| `web/components/series/CountdownBlock.tsx` | **yes** | in the run |
| `web/components/series/CountdownClock.tsx` | **yes** | in the run |
| `web/components/public/Hero.tsx` | **yes** | in the run |
| `web/styles/tokens.css` | **no** | CSS — Stryker has no CSS mutator configured |
| `web/styles/globals.css` | **no** | same |

**The committed gate does not cover this spec's code at all.** `stryker.config.mjs`'s `mutate`
globs are all `*.ts` (`web/metrics`, `web/manifest`, `web/sources`, `web/ingest`, `web/series`,
`web/content/budgets.ts`, `scripts/check-scenario-traceability-3digit.ts`). No `*.tsx` file
matches, and **no non-test `.ts` file changed in this spec** — verified:

```
$ git status --porcelain | awk '{print $2}' | grep -E '\.ts$' | grep -v '^tests/'
NONE (no non-test .ts changed)
```

So a stock `npx stryker run` would have mutated spec 001's surface and reported a number about a
tree this spec never touched. I scoped the run to the changed components with Stryker's
documented `--mutate` CLI option. **`stryker.config.mjs` is byte-identical to what the Verifier
checked** — no gate, threshold, budget, lint, TypeScript, Vitest, or Stryker config was edited.

```
$ git status --porcelain | grep -E 'stryker|vitest.config|eslint|tsconfig|package.json|budgets|registry.ts|keys.ts'
NONE modified
```

**Finding for the Architect / PR Opener (recorded, not fixed):** the run below proves the
component surface *is* mutation-testable and currently has real gaps (baseline 68.68%). The
config's own comment excludes JSX deliberately ("mutating JSX and generated markup proves nothing
… and it costs hours"). That reasoning was sound for spec 001's numeric claims; it is no longer
sufficient now that the hero and clock are the product's primary surface. Widening `mutate` to
`web/components/**/*.tsx` is a deliberate config decision for its own spec — a stage-5a agent must
not make it.

**CSS is out of mutation scope, stated plainly.** No CSS mutator plugin is installed, so
`tokens.css` and `globals.css` cannot be mutated by this toolchain. Their changes are instead
pinned by the text-asserting acceptance tests that parse the stylesheets (`AC-002-09`, `-10`,
`-11`, `-18`, `-29`, `-30`) — a different mechanism, not a skipped one.

---

## Evidence: mutation score

Baseline, before any killing test. `thresholds.break` is `null` in the config, so exit 0 does not
itself assert the score — the table below does.

command: npx stryker run --mutate 'web/components/series/CountdownBlock.tsx,web/components/series/CountdownClock.tsx,web/components/public/Hero.tsx'
exit: 0
at: 2026-10-29T21:57:43Z

```
Instrumented 3 source file(s) with 182 mutant(s)
Dry run: Ran 195 tests in 7 seconds

---------------------|------------------|----------|-----------|------------|----------|----------|
                     | % Mutation score |          |           |            |          |          |
File                 |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
All files            |  68.68 |   72.67 |      125 |         0 |         47 |       10 |        0 |
 public              |  75.00 |   75.00 |       60 |         0 |         20 |        0 |        0 |
  Hero.tsx           |  75.00 |   75.00 |       60 |         0 |         20 |        0 |        0 |
 series              |  63.73 |   70.65 |       65 |         0 |         27 |       10 |        0 |
  CountdownBlock.tsx |  71.88 |   73.02 |       46 |         0 |         17 |        1 |        0 |
  CountdownClock.tsx |  50.00 |   65.52 |       19 |         0 |         10 |        9 |        0 |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
Done in 2 minutes and 33 seconds.
```

Final, after the killing tests.

command: npx stryker run --mutate 'web/components/series/CountdownBlock.tsx,web/components/series/CountdownClock.tsx,web/components/public/Hero.tsx'
exit: 0
at: 2026-10-29T22:04:20Z

```
Instrumented 3 source file(s) with 182 mutant(s)
Ran 65.55 tests per mutant on average.

---------------------|------------------|----------|-----------|------------|----------|----------|
                     | % Mutation score |          |           |            |          |          |
File                 |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
All files            |  86.26 |   91.28 |      157 |         0 |         15 |       10 |        0 |
 public              |  95.00 |   95.00 |       76 |         0 |          4 |        0 |        0 |
  Hero.tsx           |  95.00 |   95.00 |       76 |         0 |          4 |        0 |        0 |
 series              |  79.41 |   88.04 |       81 |         0 |         11 |       10 |        0 |
  CountdownBlock.tsx |  90.63 |   92.06 |       58 |         0 |          5 |        1 |        0 |
  CountdownClock.tsx |  60.53 |   79.31 |       23 |         0 |          6 |        9 |        0 |
---------------------|--------|---------|----------|-----------|------------|----------|----------|
Done in 2 minutes and 45 seconds.
```

**Score: 68.68% → 86.26%** (+32 mutants killed), against a target of ≥80%. **Target met.**

Per-file honesty: `series` (79.41%) and `CountdownClock.tsx` (60.53%) sit below 80% on their own.
Both are dragged down by one cluster — 15 mutants in `CountdownClock.tsx`'s client-only runtime,
which this repo's test environment cannot reach (named in full below). The aggregate passes; the
per-file figures are stated rather than hidden behind it.

The machine-readable report is `reports/mutation/mutation.json` (`git check-ignore` confirms
`reports/` is ignored — T1's `.gitignore` entry).

---

## Surviving mutants: 25, all accounted for

Every one of the 25 remaining mutants is either **equivalent** (10) or **client-runtime-only and
unreachable from this test environment** (15). No mutant was left unclassified, and no vacuous
test was written to inflate the score.

### Equivalent mutants (10) — no observable behaviour differs

**`CountdownBlock.tsx`**

| Mutant | Replacement | Why it is un-killable |
|---|---|---|
| `16:64` `StringLiteral` | `t('table.notDefined')` → `""` | `ratio()` formats `backCast.projected` / `backCast.observed`, both typed `number` in `CountdownValue['backCast']`. `formatValue` takes its `nullLabel` branch only for `null`/`NaN`, and `computeCountdown` fills both from `roundTo(...)` of finite inputs. Reaching the label would require feeding a value the type forbids. |
| `26:17` `ConditionalExpression` | `countdown.years === null ? 0 : countdown.years` → condition `false` | `clockStrings` is called only from `ClockRail`, rendered only in the `computed` branch. `computeCountdown`'s `computedState` sets `years = thresholdYear - snapshotYear` exactly when it sets `state: 'computed'`, so `years` is always a number at that call site. The `null` arm is unreachable by data invariant. |
| `72:8` `ConditionalExpression` | `countdown.range === null` → `false` | `range` comes from `rangeOf(crossings)` over **every** projection variant, baseline included. `state === 'computed'` means the baseline series crosses, so `rangeOf` always yields `{min,max}`. A computed countdown with a null range cannot be produced. |
| `73:11` `StringLiteral` (also `NoCoverage`) | the `? ''` arm → `"Stryker was here!"` | Same unreachability as `72:8`: the null-range arm has no reachable input, which is also why Stryker reports it uncovered even though `VariantRangeLine` itself is covered. |
| `120:7` `ConditionalExpression` | `if (countdown.anchor === null)` → `false` | `ClockRail` is called only from the `computed` branch. The "no anchor, no clock" guarantee is carried structurally by `countdown.state !== 'computed'` (line 157) — already killed. `anchor` is non-null in every computed value `computeCountdown` builds. Killing this would mean asserting on a `{state:'computed', anchor:null}` value the derivation cannot produce: a vacuous test. |
| `127:70` `StringLiteral` | `formatValue(…, '')` null label → `"Stryker was here!"` | Same invariant as `26:17`: `years` is a number in the computed state, so `formatValue` never reaches `nullLabel`. |

**`Hero.tsx`**

| Mutant | Replacement | Why it is un-killable |
|---|---|---|
| `34:69` `StringLiteral` | `valueText`'s `t('table.notDefined')` → `""` | `HeroValueKind` is `'ratio' \| 'percentPoints'`, and `hero-subject.ts` states the invariant in the source: *"Non-nullable `ValueKind`s a hero figure can carry, so no null label path is reachable here"*. `headline` and `comparison.value` are `number`. |
| `39:10` `ArrayDeclaration` | `defaultScope`'s `[{…}]` → `[]` | `defaultScope` returns exactly one entry, and `ScopeMark` enters its multi-country branch only when `countries.length > 1`. With one **or zero** entries it renders `content.country.name` and `content.country.scopeClause` from the content record and never reads `geo`/`name`/`href` from the array. |
| `39:11` `ObjectLiteral` | the same entry → `{}` | Same as above: the entry's fields are never read on the single-country path. |
| `39:74` `StringLiteral` | `href: '#'` → `""` | The `href` is consumed only by `ScopeMark`'s multi-country `<a>` list, which a one-entry array never reaches. |

For `39:10`/`39:11`/`39:74` specifically: all three render **byte-identical** markup. A test
asserting "the country name appears when no `countries` prop is passed" would pass under all three
— which is exactly the vacuous test the brief says not to write, so none was written.

### Client-runtime-only mutants (15) — not equivalent, but unreachable here

These are real behavioural differences **in a browser**. They are unkillable from this repo's test
environment, and that is a statement about the harness, not about the mutants.

| Mutant(s) | Location | Why unreachable |
|---|---|---|
| `58:10` | `useClockRefs` returned object → `{}` | Refs are never serialised into HTML; a missing ref is invisible to `renderToStaticMarkup`. |
| `79:10`, `80:3` | `useLayoutEffect(...)` body / call → `{}` / `;` | `useLayoutEffect` does not run under `react-dom/server`; neither the pre-paint correction nor the tick exists in a server render. |
| `80:25`, `81:49`, `82:50`, `88:77`, `90:13` (×2) | effect body, ref-write map, field loop, `if (element)` guard (both arms) | Executed only inside the layout effect, i.e. only in the browser. |
| `93:5`, `94:37`, `95:12` | `write(readClock(...))`, `startClockTicker({...})`, the `ticker.stop()` teardown | Same — the tick lifecycle. |
| `98:6` | effect dependency array → `[]` | Changes when the effect re-subscribes: observable only across client re-renders. |
| `177:62` | `useMemo(..., [locale])` → `[]` | On the server the memo computes once per render regardless; the dependency list only matters on re-render. |
| `179:18` | `useClockTicker({ anchor, formatDays, refs })` → `{}` | The argument feeds the effect, which never runs server-side, so nothing downstream is observable. |

Un-killable because: `vitest.config.ts` sets `environment: 'node'`, and **no DOM emulation is
installed** — `jsdom`, `happy-dom` and `@testing-library/react` are all absent from
`package.json`. There is no way to mount this client leaf and execute its layout effect. Adding a
DOM dependency plus a test-environment change is outside stage 5a's remit (it is a dependency and
config change, and the brief forbids inventing either). Restructuring the page so these paths run
without a DOM is likewise forbidden: **zero-JS on the public home page must survive**, so no
killing test here requires a client component, and no `'use client'` directive was added or moved.
`CountdownClock.tsx`'s `'use client'` is pre-existing (the Verifier confirmed this against
`git show HEAD`).

If a later spec adopts a DOM test environment, these 15 are the backlog: they are reachable in
principle and would take `CountdownClock.tsx` from 60.53% to ~100%.

---

## Killing tests added (31 → 32 mutants killed)

Three unit files, 16 tests, all rendering through `react-dom/server` exactly as the existing
suite does. **None cites an `AC-002-NN` scenario ID**, deliberately: these pin copy slots and
structural details (a `{' '}` between spans, a blanked i18n key, a join separator, an `href`)
that no AC-002 scenario states. Attaching a scenario ID would claim coverage the scenario does not
assert. `check-scenario-traceability-3digit.ts` is unchanged and still green.

### `tests/unit/countdown-block-copy.test.ts` — 5 tests, 9 mutants

The projection's copy slots, asserted as **whole rendered regions** rather than substrings. That
distinction is load-bearing: the arithmetic sentence further down the block also contains
`16 años` and `2042`, so a `toContain` on the number or the year passes with the space removed.

| Test | Kills |
|---|---|
| prints the threshold year and its label as one line, separated by a space | `62:53` (`?? 0` → `&& 0`), `62:107` (space), `63:58` (`countdown.yearLabel` key) |
| prints the source and the year it was observed, separated by a space | `100:52` (`provenance.observedAt` key), `100:78` (space) |
| renders no back-cast line when the projection carries none | `84:7` (`backCast === null` → `false`) |
| carries its eyebrow as both its accessible name and its visible label | `49:81` (not-crossed `aria-label`), `50:52` (visible eyebrow) |
| still states where the projection came from | `53:51` (not-crossed source) |

The back-cast test asserts a **positive control first** (`countdownValue()` *does* contain
`countdown__backcast`) so the absence assertion cannot pass vacuously. `backCast: null` is
constructed rather than derived because the committed snapshots always carry one; it is a real
production branch — `computeCountdown` returns `null` when the observed dataset has no year at or
before the snapshot vintage — and the mutant turns clean absence into a `TypeError` mid-render.

### `tests/unit/countdown-clock-leaf.test.ts` — 4 tests, 7 mutants

| Test | Kills |
|---|---|
| labels all four fields, in the order the group reads them | `42:30` (`label: 'seconds'`) |
| sets the years numeral and its unit as two words inside one group | `105:59` (space) |
| joins the anchor's label to its date, and prints the date rather than its placeholder | `29:23` (`countdown.clock.anchor` key), `29:49` (`{ date }` vars → `{}`), `152:76` (space) |
| publishes the running state while the anchor is still ahead | `186:55` (`'running'`) |

The seconds label is the single character `s` and the minutes label is `min`, so only the
**ordered label list** pins them — a substring check is meaningless here.

### `tests/unit/hero-panels.test.ts` — 7 tests, 16 mutants

| Test | Kills |
|---|---|
| labels all four facts, in the order the panel reads them | `95:24`, `96:24`, `97:24`, `98:24` (the four label keys), `98:5` (the 4th entry → `{}`) |
| gives every fact a value, none of them empty | `93:20` (dataset `Set` → `[]`), `98:5` |
| joins the publishers with a comma and the datasets with a middot | `92:80` (`join(', ')`), `93:76` (`join(' · ')`) |
| stamps the snapshot with its label, a space, and the date the instant carries | `147:20` (`hero.snapshotLabel`), `147:43` (space), `148:47` (`.slice(0, 10)`) |
| links every row to its own figure's anchor | `209:16` (`` `#${figureId}` `` → empty template) |
| counts only the figures that are actually computed | `231:35` (filter callback), `231:47` (`=== 'computed'` → `false`), `231:85` (`'computed'` → `""`) |
| still renders the countdown when the tier has one | `235:10` (`countdown === undefined` → `true`) |

Three of these needed a fixture the suite did not have:
- **Two publishers.** Separators `', '` and `' · '` are never emitted for a single-source figure,
  so `makeFigure({ sourceUrl: [INE, Eurostat] })` is required to make them observable at all.
- **A partially computed proposition tier.** With `unresolvedFigures()` every figure is
  unavailable, so `computed` is 0 and a mutant that forces 0 is indistinguishable. The fixture
  makes exactly one figure computed (`fig-03`), so the summary reads `7 figuras · 1 calculadas`
  and a forced 0 dies.
- **A null back-cast** (above).

The last test also asserts the negative: rendering the same tier *without* a `countdown` contains
no `class="countdown"`, so the positive assertion is not vacuous.

---

## Evidence: final test status

The full suite, one final time, after the new tests. The Verifier confirmed it once; this
re-confirms it because the killing tests are new code that check did not cover.

command: npm test
exit: 0
at: 2026-10-29T22:07:21Z

```

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  63 passed (63)
      Tests  779 passed (779)
   Start at  23:07:21
   Duration  5.29s (tests 54%, import 37%, transform 8%, worker 1%)
```

763 → 779 tests (+16, the new unit tests); 60 → 63 files. No test was skipped, disabled,
weakened, or deleted. The mutation run's own dry run executed 195 tests per mutant against the
instrumented copies — so the assertions that kill mutants are the same ones that pass here.

command: npm run typecheck
exit: 0
at: 2026-10-29T22:07:21Z

```
> pensions-system@0.0.0 typecheck
> tsc --noEmit
```

command: npm run lint
exit: 0
at: 2026-10-29T22:07:21Z

```
> pensions-system@0.0.0 lint
> eslint .
```

command: npx tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-10-29T22:07:34Z

```
scenario traceability (2-3 digit ids): 155 scenarios, all cited, all citations resolve
```

**Suite green: 779/779. Typecheck clean. Lint clean. Traceability clean.**

Not re-run, and why: `npm run build`. No production source, content, or config changed in this
stage — only three test files were added — so the Verifier's recorded `npm run build` evidence
(exit 0, all four prebuild gates green, clean `next build`) still describes this tree. Re-running
it would test nothing new.

---

## Complexity summary (carried forward from the Refactorer)

The Refactorer leaves no report artifact by design (`docs/SPEC_PIPELINE.md` §Audit contract); its
measurements are re-recorded by the Verifier, and are carried here unchanged from
`25-verification.md`:

| Gate | Result |
|---|---|
| ESLint `complexity: ['error', 6]` — the repo's authoritative complexity gate | PASS, exit 0 — "no function exceeds 6" |
| `check-code-principles.sh --gates complexity`, scoped to changed files | PASS — 0 FAIL, 0 WARN |
| `component-per-file` | PASS — 0 FAIL, 0 WARN |
| `property-tests` (fast-check in use) | PASS |
| `yagni` | PASS — 0 FAIL, 0 WARN |
| `solid` | PASS — 0 FAIL, 0 WARN |
| `dry` | exit 141 — **submodule tool defect**, not a code finding: the DRY sub-pipeline (`… | sort -rn | head -10`) SIGPIPEs under `set -o pipefail` when the tree yields >10 duplicate windows. Warn-only gate; does not block. |

I re-ran `npm run lint` after adding the new tests (exit 0, above), so the complexity claim still
holds over the current tree rather than only over the pre-stage-5a tree. The three new test files
add no production complexity: their helpers are single-branch and their assertions are flat.

---

## Stop-and-Ask decision matrix: conditions encountered

| Condition | Resolution |
|---|---|
| Working tree dirty | **Not a stop.** The dirty set is precisely this spec's in-flight deliverable (the Coder's and Refactorer's work on `spec/002-hero-conversion`), already consumed and verified by stage 4, plus the three test files this stage added. There is no unknown state to protect against, and the PR Opener — not this stage — commits it. Recorded rather than stashed or auto-committed, per the matrix. |
| Spec artifacts not found | Not encountered — `10-tasks.md`, `20-acceptance/` (36 scenarios), `15-design.md` all present. |
| Version bump / git tag | Not requested; none created. |
| Design gate blocks | None. Mutation target met; complexity, traceability, lint, typecheck all green. |
| Design gate WARN | The DRY gate's SIGPIPE (141) is warn-only and a submodule defect — carried above, not fixed. |
| Acceptance criteria ambiguous | None encountered; no mutant required interpreting a scenario. |
| Verifier verdict FAIL | Not the case — PASS, pre-confirmed before any mutant ran. |
| Out-of-scope finding | One, recorded above: the committed `mutate` globs exclude the very surface this spec changed. Not fixed; proposed as a follow-up spec. |

---

## Remediation record

`none` — **no BLOCK occurred at any point in this run**, so no phase or attempt count was consumed.

Carried forward from `25-verification.md`: the Verifier recorded **attempt 1, phase 1**, and
resolved everything with zero remediation — no BLOCK was raised there either. Concretely, this
stage:

- ran the mutation gate twice: once as a baseline measurement, once after adding killing tests.
  The second run is a measurement of new tests, **not** a remediation re-run under
  `docs/SPEC_PIPELINE.md §Remediation budget` — no gate failed, so no phase-1 counter moved;
- raised no gate failure to the Coder or the Refactorer;
- modified no threshold, budget, gate, or config.

Provenance: the attempt information above comes from the header of `25-verification.md`
("**Attempt:** 1, phase 1") and from the absence of any BLOCK entry in it. Nothing was inferred or
invented; no orchestrator loop summary was available to this stage, and none is claimed.

| Phase | Budget | Consumed | BLOCKs raised | Resolved at |
|---|---|---|---|---|
| 1 (pre-PR) | 3 | 0 | 0 | — |
| 2 (post-PR CI) | 3 | 0 | 0 | — |
| 3 (deploy verification) | 3 | 0 | 0 | — |

---

## Gates summary

| Gate | Status |
|---|---|
| Verifier precondition (stage 4 PASS) | PASS — confirmed before running |
| Mutation testing (`production` tier) | **RUN** — 68.68% → **86.26%**, target ≥80% **met** |
| Mutation scope | 3 changed `.tsx` components; CSS not mutable by this toolchain (stated above) |
| Final full test suite | **PASS** — 779/779, exit 0 |
| Typecheck | PASS — exit 0 |
| Lint / complexity (ESLint ≤ 6) | PASS — exit 0 |
| Scenario traceability | PASS — 155 scenarios, exit 0 |
| Production code modified | **none** — three test files added only |
| Config / gate / threshold modified | **none** |
| Zero-JS home page | **intact** — no `'use client'` added or moved; every new test uses `react-dom/server` |
| Commit / push / PR | **not performed** — PR Opener's job (stage 5b) |

**Mutation score: 86.26% (target ≥80%, met). Suite green. Uncommitted, per stage 5a's remit.**

---

## Evidence: PR

command: gh pr create --draft --base main --head spec/002-hero-conversion
exit: 0
at: 2026-10-29T22:12:43Z

PR: https://github.com/RexiAI/pensions-system/pull/9
commits: 9 on `spec/002-hero-conversion` (8 product/spec commits + this record commit) — stage 5b, PR Opener

Draft PR opened against `main`. Body links `10-tasks.md`, `25-verification.md`, `15-design.md` and
this report, and carries the verbatim assertion-change record. The archive is stage 5d's job
(`docs/SPEC_PIPELINE.md` §Archive in the PR) — 5b no longer archives, so `specs/002-hero-conversion/`
is expected to be present on this PR head and gone after 5d runs.

## 15-design.md

# Design Spec: 002-hero-conversion

## Design Read

Reading this as: a public-interest pension instrument's home hero for a Spanish-first search-and-social audience, with a trust-first editorial-instrument language that must now carry one saturated accent and a single dominant CTA, leaning toward the site's own Revision 4 token system (warm paper, radius 0, no shadows, mono numerals) with the "countdown" gravity carried by layout and typography alone. This is a **redesign-preserve**: the identity is settled and correct, and three levers move inside it (accent chroma, one merged centred group, hero CTA hierarchy). Nothing else.

## Dial Values

- DESIGN_VARIANCE: 3 — the brief's audience is a regulated, citation-bearing public-data site (skill Section 1.A "trust-first / public-sector / regulated" row), and the site's identity *is* symmetry: one centred axis, no floating asymmetry, no scroll choreography. The one structural change in this spec (merging years and clock) makes the panel **more** symmetric, not less. The baseline 8 would be vandalism here. 3, not 2, because the merged group is a genuinely new composition and must be resolved deliberately rather than by inheritance.
- MOTION_INTENSITY: 2 — the home page is zero-JS and the brief explicitly caps client script at what already exists. The only motion is the pre-existing 1 Hz tick on four fields plus the pre-existing `prefers-reduced-motion` behaviour that hides the sub-day fields. There is no scroll animation, no reveal, no hover choreography to add. 2, not 1, because a ticking counter is real state motion and the countdown read depends on it; the motion must never be increased to manufacture urgency.
- VISUAL_DENSITY: 5 — the merged block stacks a years numeral, a four-field band, the anchor line, a two-sentence definition and (desktop only) an arithmetic sentence inside a 280px measure. That is dense, deliberately: it is an instrument face. 5 holds the density without letting the merge become a wall; 4 would invite spacing that costs the first-viewport clearance the test guards.

## Design System / Foundation

**No external design system.** The foundation is already in-repo: `web/styles/tokens.css` (Revision 4) is a complete, self-consistent token set, and `web/styles/globals.css` forbids a literal colour in `web/components` / `web/series` (AC-001-117). No install command exists or should exist, and importing a system (shadcn, Carbon, GOV.UK Frontend) is out of scope by construction: it would replace the palette, the radius and the type scale the brief locks.

Honest label for the aesthetic: **warm-paper editorial instrument**. Warm paper grounds, a warm ink ladder, mono numerals as the only "data voice", zero radius, zero shadow, one saturated accent doing exactly one job above the fold.

Deliberate override of the skill's default, recorded so a later reader does not "correct" it: skill Section 9.A forbids oversaturated accents ("desaturate to blend with neutrals"). That default is overridden here, by evidence rather than taste: the four comparables in `00-informal.md` §Evidencia all run a light ground with one saturated accent (`#CE261E` C\*78.7, `#05576B` C\*22.7, `#072146` C\*26.8, `#0061C8` C\*62.3), and the owner has chosen the accent as the attraction lever. The override is bounded on both sides: chroma rises into the comparables' band, and hue and the warm-paper grounds do not move. The skill's other locked items stay locked (no shadows, no radius, no glassmorphism, no gradient text, no decorative dots, no scroll cues, zero em-dashes in copy).

## Global Tokens

- **Font**: unchanged. `--font-sans` ('Instrument Sans'), `--font-mono` ('IBM Plex Mono') for every numeral in the hero, `--font-label` (an alias of sans) for micro labels. No new family, no new weight token, no new size token.
- **Accent color**: `--accent: #3b5512` in `:root` (light) and `--accent: #91c46d` in `[data-theme='dark']`. This is a **recommended target**, computed against the same CIELCh and WCAG arithmetic `tests/acceptance/palette-labels.test.ts` uses; the implementer re-verifies with the test and may land anywhere inside the stated band.
  - Light `#3b5512`: L\* 32.9, C\* 39.9, H 122.1 (from `#425425`: L\* 33.2, C\* 29.5, H 122.3). Chroma +35%, hue held.
  - Dark `#91c46d`: L\* 73.9, C\* 50.0, H 130.0 (from `#9cc17f`: L\* 74.0, C\* 38.0, H 129.6). Chroma +32%, hue held.
  - Allowed band: light C\* 40 to 44, dark C\* 46 to 52. Above 44 at hue 122 the sRGB gamut edge is at about C\* 46 at L\* 33, and the hue leaves the olive family into lime; that is the brief's open question 1 made concrete, and the band is the answer to it. Below 34 the change is not visible enough to be the lever the brief asked for.
  - Why hold L\*: at constant L\* the accent's contrast against the paper barely moves, so the saturation lever is bought without spending any contrast headroom. That is the whole point of choosing chroma over lightness.
- **Neutral base**: unchanged, and locked. `--surface-1: #fdf2e1`, `--surface-2: #f6ead7`, `--surface-3: #f0e1c9`, `--surface-hero: #fee8d0`, the `--ink-1/2/3` ladder, `--rule-1/2`, all dark-theme counterparts. No `#ffffff` ground, ever. Every ground stays below C\* 20 (the "warmth is the paper, never a fourth hue" invariant).
- **Corner-radius system**: **sharp**, `--radius: 0`, unchanged and locked. One system, no exceptions, including the CTA (a filled rectangle, not a pill or a button).
- **Theme**: **auto** (`html { color-scheme: light dark }` plus the explicit `[data-theme='dark']` block). Both themes are first-class and both carry the new accent; no section flips theme mid-page.
- **Icon library**: **none**. The hero renders no icon: no chevron on the CTA, no clock glyph beside the countdown, no status dots, no hand-rolled SVG. The panel's meaning is carried by numerals, words and one rule. If an icon is ever genuinely required, the library choice is Phosphor, not a hand-rolled path.

**Contrast targets for every pair the accent participates in** (computed from the current tokens; the new accent must meet the floor in both themes, and should stay at or above the design target so no pair regresses):

| Pair | Today light | Today dark | Floor (AC-001-117) | Design target light / dark |
|---|---|---|---|---|
| accent on `--surface-1` | 7.51 | 9.23 | 4.5 | ≥ 7.0 / ≥ 9.0 |
| accent on `--surface-2` | 6.99 | 8.65 | 4.5 | ≥ 6.5 / ≥ 8.4 |
| accent on `--surface-3` | 6.46 | 7.81 | 4.5 | ≥ 6.4 / ≥ 7.8 |
| accent on `--surface-hero` | 6.99 | 8.89 | 4.5 | ≥ 6.5 / ≥ 8.6 |
| `--on-accent` on accent | 7.51 | 9.23 | 4.5 | ≥ 7.0 / ≥ 9.0 |
| accent as `--focus` ring on `--surface-1` / `--surface-hero` | 7.51 / 6.99 | 9.23 / 8.89 | 3.0 (non-text) | unchanged |

`--on-accent` (`#fdf2e1` light, `#17110b` dark) is verified against the new accent rather than changed: it holds at 7.60 / 9.20 with the recommended pair, so the token keeps its value and the AC's "recomputed" is satisfied by verification. `--surface-3` is the binding pair in light (darkest paper): it is the one that fails first if the accent drifts light.

**The accent also paints `--chart-series-1`, `--chart-observed` and `--focus`.** That propagation is **accepted**, for three reasons, and the design does want it: (1) a chart series benefits from chroma, since a low-chroma olive line on beige paper was the weakest mark in the set; (2) hue is locked, so the accent stays 36.9° (light) / 36.5° (dark) away from the ochre `--data-projection`, which is the separation that keeps a measured line from reading as a projected one; (3) hue is never the sole encoding anywhere (AC-001-106: dash, position and a printed word), so no chart depends on the accent's exact hue. The one caution is stated in T2's watch items: the chroma rise must not be paired with a hue drift toward 85°, because that gap is what the charts actually rely on.

## Per-Task Directives

### Task 1: Close the pipeline scratch in `.gitignore`

- **No design surface.** This task has no layout, component, typographic, motion, a11y or palette consequence. Do not touch a token, a stylesheet, a component or a content file while doing it, and do not "tidy" any design file in the same commit.

### Task 2: Saturated accent (light and dark), contrast pairs recomputed

- **Layout**: none. Token-only. Nothing moves.
- **Components**: `web/styles/tokens.css` only, both theme blocks. No component, series module or content file may gain a colour, and no component may start quoting the new hex.
- **Typography**: unchanged. The accent carries no type decision, and the CTA's type is set by T6's hierarchy, not by this token.
- **Motion**: none.
- **A11y**: hit every row of the contrast table above in both themes, with `--surface-3` as the binding light pair and `--surface-hero` as the binding dark pair; verify the focus ring (accent on paper, and accent offset over the panel's warmer sheet) still reads at ≥ 3:1; keep link affordance from resting on hue alone (the global `a` underline stays, see T6); keep the accent out of any pair where it would be text below 4.5:1 (it is link text at body size, so the 4.5 floor is real, not the 3.0 non-text floor).
- **Anti-patterns to avoid**: adopting a comparable's white ground; importing a comparable's hue (red, teal, navy, blue, and the yellow `#FFDD44`); a neon or lime reading at the top of the chroma band; adding a fourth chromatic hue by way of a background; letting `--surface-hero` cross C\* 20 while chasing warmth; adding a shadow or a radius to make the CTA "pop" instead of raising chroma; a gradient anywhere near the accent.
- **Watch items (Coder must check)**:
  1. **The hue budget is narrower than the AC says.** AC-002-06 allows hue within 20° of the current accent, but AC-001-117 also requires a hue gap **greater than 20°** from `--data-projection`. With the light accent at H 122.3 and `--data-projection` at H 85.2, the gap is only 37.1°, so the real budget is about **17° toward the ochre** (hue ≥ ~105 in light; the dark pair has 36.4° of slack, same shape). Design target: hold hue within **±8°**, and prefer a small move **away** from the ochre (H slightly up), which widens the chart gap instead of narrowing it. A change that satisfies AC-002-06 at −18° would fail AC-001-117.
  2. Chroma must be **strictly greater** in *both* themes (AC-002-04 / 05). Tuning one theme and copying the other fails.
  3. The accent must stay one of exactly three chromatic tokens, so its chroma must stay **above** 20, not merely above the current value.
  4. `--on-accent` is verified, not assumed: the AC lets it be recomputed, and the design prefers it unchanged if the pair holds.
  5. No `#ffffff` / `#FFFFFF` string anywhere in `tokens.css`, and no reordering of the existing declarations (AC-002-07's "unchanged" is checked on literals, so a cosmetic reflow of the block is a needless risk).

### Task 3: Unify the years numeral with the day/hour/minute/second row into one centred group

- **Layout**: Asymmetric Split Hero (7fr / 5fr), hero panel as a material sheet (no card, no border, no radius, no shadow), and inside the panel a **centred counter face**: one group, one vertical axis, read top to bottom as numeral, four-field band, anchor line, definition (arithmetic sentence at ≥1024px only). On a phone the panel's two blocks separate and the counter face keeps its order at the top of the page.

  **The read, now that the rule is gone.** Four things do the work the 1px rule used to do, and none of them is a line:
  1. **The visual anchor is the years numeral.** It keeps `--text-num-xl` (`clamp(2.75rem, 6.4vw, 5rem)`, so 44px on a 390px screen) against the day count's `--text-num-l` (2rem). Years is the headline quantity; days is the running quantity. The **ratio must not fall below 1.3**: if the day numeral is promoted to `--text-num-xl`, the two become members of one numeric series and the division read the old rule guarded against becomes the default read.
  2. **Two different label grammars, not two members of a series.** The years unit (`countdown__unit`, "años") sits **beside** the numeral on its baseline, at `--text-num-m` in `--ink-2`. The day label (`clock__label`, "días") sits **below** its numeral, at `--text-micro` in `--ink-3`, exactly like the three sub-day labels. Beside-versus-below is the structural cue that these are two sentences ("N años", then "M días HH MM SS"), not a numerator and a denominator. **Do not unify the label position, and do not demote the years unit to `--text-micro`** to "de-emphasise" it: on the phone that unit word is the only thing separating the two quantities in words (see the unresolved tension in the report below, and the arithmetic line being desktop-only).
  3. **The anchor line is the group's shared terminus.** Order is also meaning: `16 años` then `1.234 días 05 12 33` then `fecha convencional del umbral: 1 de enero de 2042`. Both quantities resolve to the same date, so a reader who sees them stacked reads a chain with one destination rather than a fraction. Keep the anchor line **immediately** below the four-field band, never above the numeral, and never separated from the band by a rule.
  4. **A rhythm hierarchy replaces the rule: more air above the group than inside it.** The group must stay separated from the projection block above (keep `margin-top: var(--space-4)` on `.clock`), while the gap between the years numeral and the four-field band is the tight `--space-2` the rest of the face uses. Removing the border **and** the padding it was clearing is right (the `padding-top: var(--space-3)` exists only to clear the rule); removing the top margin as well would collapse the group into the back-cast sentence and lose the grouping entirely. Rule out, breathing room in, nothing else.

  The merged group's container is `.clock` itself: the years numeral becomes its **first child**, in DOM order, above `.clock__fields`. That is what makes AC-002-10's "siblings inside one centred container" true rather than approximated, and it is also what keeps DOM order equal to reading order for a screen reader.

- **Components**: `web/components/series/CountdownBlock.tsx` (the numeral row leaves the projection block; the doc comment is rewritten to state the reversal and the accepted risk, and stops asserting the opposite), `web/components/series/CountdownClock.tsx` (receives the years numeral and its unit as pre-resolved **plain text**, the same convention as the existing ten `ClockStrings` slots, and renders them first inside `.clock`), `web/styles/globals.css` (the `.clock` rule: no `border-top`, no `padding-top`, keep `margin-top`; keep `justify-self: stretch` and `text-align: center`). The projection block keeps eyebrow, the 3px `--data-projection` rule, the threshold year line, the definition, the variant range, the source and the back-cast sentence.
- **Typography**: three registers, all at constant sizes, no new tokens.
  - Years: `--font-mono`, `--text-num-xl`, `--leading-tight`, tabular, `--ink-1`; unit beside it at `--text-num-m`, `--ink-2`.
  - Days: `--font-mono`, `--text-num-l`, tabular, `--ink-1`, `min-inline-size: var(--clock-days-min)` (5ch, so its box is a stable band whatever the number says); label below at `--font-label` / `--text-micro` / `--ink-3`.
  - Sub-day: `--font-mono`, `--text-small`, `--ink-2`, equal fixed columns `--clock-sub-col`, labels `--text-micro`.
  - The countdown **feel** is entirely here: mono, tabular, tight leading on the biggest numeral, an equal-column band of four counters, and one axis. No italic, no display serif, no outline, no letter-spacing trick, no rule to fake a chassis.
- **Motion**: static. The existing behaviour is the entire motion budget: server-rendered complete, corrected pre-paint, 1 Hz tick writing four `textContent` values through refs, no React state, `prefers-reduced-motion` hides the sub-day fields. Do not add a count-up, a pulse, a blink, a flip, a scale, a reveal, or a progress track to "make it feel like a countdown". The brief's urgency budget is spent on layout, and the vocabulary ban in `countdown.test.ts` (urgency words, `!`, `ya`, second person, in all five locales) means there is no verbal budget left either. There is also **no new copy slot**: key parity is exactly 248 keys, so no string may be added for the group.
- **A11y**: the years numeral is the first DOM child of `.clock`, so visual order and reading order agree and no CSS `order` may place it; the group keeps its single `role="group"` and `countdown.clock.a11y` label; the anchor date stays visible text (not a tooltip, not a `<time>` with no text); the sub-day fields stay `aria-hidden="true"`; nothing announces a tick; the elapsed state keeps its factual sentence; contrast of every numeral against `--surface-hero` is already carried by the ink ladder (16.1 / 10.1 / 6.1 at `--surface-1`), so no numeral may be recoloured to the accent to look "live".
- **Anti-patterns to avoid**: replacing the 1px rule with a different separator (a second rule, a hairline under the numeral, a divider, a box, a chip, a card, a shadow, a radius, a gradient fade); colour-coding the two quantities so that hue does the dividing (that is colour as the primary encoding of a value, banned by AC-001-106, and it also breaks the "accent does one job" rule); reintroducing any left alignment, `margin-left: 0`, or a flex row in place of `.clock__fields`' centred three-column grid (AC-001-111 / AC-002-11; `.countdown__value`'s own flex row for numeral-plus-unit is existing and stays); making the numeral row and the day row the same size so they read as one series; adding a colon or a separator glyph between the fields; adding an eyebrow ("TIEMPO RESTANTE") above the group, which would be both a new key and a section-number-style micro-label; putting the years numeral *above* the projection rule, which would invert the block's meaning; a `will-change`, a transform, or an animation on any numeral.
- **Watch items (Coder must check)**:
  1. **Five assertion sites encode the old layout, not three.** T4 names three. Two more will go red and must not be "fixed" by relaxing anything: `clock.test.ts:866` (`expect(declared('.clock', 'border-top')).toEqual(['var(--border-hair)'])`, inside AC-001-111's hairline `it`, which T4's stated scope for AC-001-111 does not name), and **`tests/acceptance/first-viewport.test.ts:185`** (`expect(CSS.slice(CSS.indexOf('.clock {')).toContain('var(--border-hair)')`). The latter is in a different file from every test T4 lists, and after the removal it is the only remaining `var(--border-hair)` occurrence after `.clock {` in `globals.css`, so it fails. Both belong to T4's authorized set in spirit; the gate must decide explicitly, and the decision must be recorded in the PR body, not discovered by the suite.
  2. `CLOCK_RULES.filter((rule) => rule.selectors.includes('.clock')).toHaveLength(1)` (AC-001-111): edit the existing `.clock` rule, do **not** add a second rule whose selector list contains `.clock`.
  3. `.clock__value` currently inherits `--leading-body` (1.62), so the day numeral sits in a body-leading box. Tightening it is the single biggest typographic lever for the counter read and for the fold, but **no task's acceptance criteria cover it**: do not do it here. It is recorded as a follow-up below.
  4. The three `.clock__fields` slices in the clock tests take `clock.slice(indexOf('clock__fields'), indexOf('clock__anchor'))`, so they are safe as long as the numeral renders **before** `clock__fields`. If the numeral is placed between the fields and the anchor line, those tests silently change meaning.
  5. `countdown__value`, `countdown__numeral` and `countdown__unit` keep their class names: AC-002-10 locates the group by them, FACE_ELEMENTS lists them, and `palette-labels.test.ts` requires `.countdown__numeral` to be a `--font-mono` rule. A rename breaks three files.
  6. Also confirm `.hero__panel-rule` (the `<hr>` between the countdown block and the readings) is untouched: the brief removes the rule **inside** the countdown, not the one between the panel's two blocks.
  7. The component prose is an acceptance criterion (AC-002-12), not a tidy-up: it must say the separator is gone, the two numerals now form one centred group, and the risk of a reader dividing them is accepted. It must not keep the old rationale anywhere.

### Task 4: Rewrite the three assertions that encode the old layout

- **Layout**: none. This task changes what is asserted, not what is drawn.
- **Components**: the test files only. No production file.
- **Typography**: none.
- **Motion**: none.
- **A11y**: the rewritten AC-001-111 must keep the centring invariant exactly (centred grid, not a flex row; no left-aligning declaration; prose centred inside `--measure-face`), because that invariant is what carries the design's single axis. Do not trade it for the new structure.
- **Anti-patterns to avoid**: deleting the assertion instead of re-pointing it (a deletion removes the guard and is not the authorized rewrite); asserting something weaker and calling it a reversal (AC-001-119 must assert the two numerals **are** in one group, in that direction); rewriting a fourth or fifth assertion that T4 does not name as if it were authorized; touching `countdown.test.ts`'s vocabulary ban in any way.
- **Watch items (Coder must check)**: the two unnamed sites listed under T3 watch item 1 (`clock.test.ts:866`, `first-viewport.test.ts:185`) are the whole risk of this task. Also: AC-001-111's `FACE_ELEMENTS` list may legitimately stay unchanged, because the merge keeps every class (`countdown__value`, `countdown__numeral`, `countdown__unit` all still render, and the clock classes all still render) and only their container changes. If it stays unchanged, say so in the commit body, because "the list was left untouched" and "the list was forgotten" look identical in a diff.

### Task 5: Re-measure the unified clock and recalibrate the fold tokens

- **Layout**: the design read on proportions is that the merge makes the block **taller as a box and shallower as a footprint**: the years numeral moves *into* the clock box, so `.clock`'s top edge rises to include it, while the box loses exactly the separator chrome it no longer needs (1px border plus `--space-3` of padding). Everything below the group stays where it was, so what the fold actually depends on, the box's **bottom**, should move *up*. The first viewport should therefore get **more** clearance, not less.
- **Components**: `web/styles/tokens.css` (three tokens plus the `--measure-face` comment), `tests/acceptance/first-viewport.test.ts` (`MEASURED_CLOCK` and its prose table).
- **Typography**: none directly. The measure is a wrapping decision, so it is typographic by consequence; do not change any `font-size` to buy clearance (AC-001-107's "no shrink" assertion is explicit).
- **Motion**: none.
- **A11y**: nothing here may be solved by hiding content (no `display: none` in the mobile query for anything currently rendered; the only permitted hide remains the pre-existing reduced-motion rule for the sub-day fields).
- **Anti-patterns to avoid**: recalibrating to eye; widening `--measure-face` "because there is now room" (the existing comment already records that 288px buys nothing, so extra clearance is not a licence to grow the measure); changing the `clock[1] ≤ viewport − 50` margin or the "whole box inside the first viewport" assertion; deleting the 360×640 and 1366×768 rows instead of re-recording them honestly; measuring `next dev` instead of the built app.
- **Watch items (Coder must check)**: **the numbers below are predictions read off the declarations, not measurements.** Verify every one in Chromium against the built app, at 390×844, in all five locales, on 2026-xx-xx and record the real ones; do not transcribe these.
  - Predicted, from `globals.css` / `tokens.css` as they stand: `.clock`'s height grows from the recorded 310px to roughly **350px** (+ the years numeral's line box at ~44px and one `--space-2` gap, − 1px border − `--space-3` padding), its top rises from the recorded 479 to roughly **426**, and its bottom moves from 789 to roughly **776**, i.e. clearance against 844 rises from 55px to roughly **68px**.
  - The pinned `expect(measured.clock[1] - measured.clock[0]).toBeCloseTo(310, 1)` is therefore expected to become a new pin near 350. It is a measured number, so AC-002-21 allows it to change; nothing else in AC-001-107 may.
  - **Recalibration target**: `--measure-face` stays at `17.5rem` unless measurement shows a locale's clearance falling to the 50px margin or below; if it does, narrow it (never widen it) and re-derive the German binding point. `--clock-sub-col` (3rem) and `--clock-days-min` (5ch) are expected to be **measured and unchanged**, because the four-field row's structure does not move. The honest outcome of this task may well be "three tokens measured, none changed, comment and table rewritten", and that is a pass: AC-002-18 asks for values that hold the box in the viewport, not for a diff.
  - The `--measure-face` comment must record the new per-locale clearance table and the measurement date whether or not the value changes.

### Task 6: Conversion-register copy for the hero, in all five locales (`hero.*` only)

- **Layout**: the hero stack keeps its discipline: `<h1>`, the scope mark, the sub, the actions, then the panel. No new text element, no eyebrow above the headline, no micro-line under the CTAs, no trust strip. The register changes; the shape does not.
- **Components**: the five locale JSON files, `hero.*` values only. The CTA hierarchy this task's brief calls for is CSS, and **no task in `10-tasks.md` owns it**: see the coverage gap in the report below. The design requirement, for whenever it is authorized: one dominant primary (the filled `--accent` block, `--on-accent` ink, no underline, `--text-body`, unchanged `--space-3 / --space-5` padding, `--radius: 0`), and one clearly subordinate secondary (a text link in `--ink-2` with a 1px underline, `--text-body-lg` or `--text-body`, **not** accent-coloured, no fill). The point is that the accent does exactly one job above the fold: it is the primary CTA's material. Today both actions are accent-coloured, so raising chroma makes the hierarchy *worse* rather than better, which is why this cannot be dropped silently. Whatever the gate decides, the secondary must stop competing on hue.
- **Typography**: the ladder is display (`--text-display`, `--leading-tight`, `--tracking-display`) → `--text-body-lg` for the sub → `--text-body` for the primary CTA label → the secondary one step below the primary at most. The `<h1>` must fit its locale budget and fill one to two lines at 1280px; a statement that lands at one short line leaves the lead column visually empty beside a 350px clock, so prefer a phrasing near the budget rather than far under it. The primary CTA label must not wrap at any locale (skill pre-flight: no two-line CTA). The sub must stay at or under two lines at 390px.
- **Motion**: none. No hover grow, no arrow slide, no underline animation.
- **A11y**: the secondary keeps a visible underline so affordance never rests on colour alone; the primary keeps `--on-accent` contrast ≥ 4.5:1 against the new accent and the focus ring stays visible because `--focus-offset` puts it outside the filled box; both remain `<a href="#…">` with their visible text as the accessible name, and the two CTAs keep distinct intents (`#figuras` versus `#metodo`); second-person address is confined to `hero.*` and must not leak into any `countdown.*` string, where it is a test failure in all five locales.
- **Anti-patterns to avoid**: urgency vocabulary anywhere (`faltan`, `quedan`, `solo`, `apenas`, `cuenta atrás`, `bomba`, `explota`), `!`, `ya`, or second person inside `countdown.*`; two CTAs with the same intent; a tertiary "learn more" link; filler verbs ("descubre", "eleva", "desbloquea", "revoluciona"); a hyped claim that needs a citation; an em-dash; a headline that trades the country name for a slogan (the country name is a build gate); shrinking the h1 or truncating the sub to fit.
- **Watch items (Coder must check)**: the three build gates fail loudly (`check-content-scope.ts` on the country name, `budgets.ts` on `statement.length`, `registry.ts` on 248-key parity), so any copy that "almost fits" is a rewrite, never a budget edit. `hero.ctaMethod` / `hero.ctaFigures` (the proposition tier's pair) must follow the same register as the numeric tier's pair, or the two hero variants will speak in two voices; they are `hero.*` keys, so they are in scope. The `en` budget (46) is the tightest relative to its expansion rate, and `de` (55) is the longest absolute: check both first.

## Out-of-scope tasks

- **Task 1 (`.gitignore`)** has no frontend surface: no design read, no token, no component, and no visual consequence.

## 40-deploy.md

# 40 — Deploy verification

Spec 002 `hero-conversion` · stage 5c (Deploy Verifier) · branch `spec/002-hero-conversion` · PR #9
**Phase-3 attempt 2 of 3** (budget max 3, counter independent of phase 1 and phase 2).
Round 1 (attempt 1) escalated on Vercel Deployment Protection; its record is preserved
verbatim-in-substance at the end of this document under §Round 1 — attempt 1.

Phase 2 was green before this round started (`frontend-ci / Build`, `Unit Tests`,
`Lint & Format` all `SUCCESS` on head `7160df1` — see *Evidence: phase-2 precondition and
head attribution*), so phase 3 was allowed to run.

## Verdict

**Verdict: PASS**

All eight checks now execute against the live preview deployment and all eight pass. The
preview is reachable because the owner configured **Protection Bypass for Automation** on the
Vercel project; this stage reads `VERCEL_AUTOMATION_BYPASS_SECRET` at runtime from the gitignored
`config/agent.local.env` and sends it as `x-vercel-protection-bypass`. The secret value is
redacted from every command and every captured output in this document, and was never echoed,
never printed, and never passed as a CLI flag.

| Field | Value |
|---|---|
| Deploy URL | `https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app` |
| Branch alias | `https://pensions-system-git-spec-00-db19fe-danielbueno76-4270s-projects.vercel.app` |
| Deployment id | `dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG` |
| Deployment status | `status: ● Ready`, `target: preview`, build 39s, post-build 17s |
| Build status | **`pass`** — Git integration built head `7160df1`; see *Evidence: deployment state* |
| Health check status | **`pass`** — `200` on `/` and on all four non-default locales with the bypass header (`302` without it — the control request) |
| E2E verdict | **`pass`** — the eight-check browser journey executed against the live preview URL (see §E2E on the live preview: what ran and what did not) |
| Timestamp | 2026-10-30T08:21:19Z |
| Phase-3 attempt count | **2** (of 3) |
| Deploy command run | **none** — `vercel deploy` / `vercel deploy --prod` were never invoked, and are denied in this agent's frontmatter |
| Phase-3 budget marker | **not written** — `Phase-3 budget exhausted` belongs to the 3rd *failed* round; round 2 passed |
| Protection bypass | `x-vercel-protection-bypass` read at runtime from `config/agent.local.env`; value redacted throughout |

## What changed between round 1 and round 2

One thing: the access condition. Round 1's diagnosis was that the `302 → vercel.com/sso-api`
came from Vercel's edge, not from the application, and that `vercel logs` showing `0` records
meant no request had reached the app. Round 2 confirms both halves of that diagnosis with a
direct control:

- With `x-vercel-protection-bypass`: `200`, 215 756 bytes of server-rendered HTML, `lang="es"`.
- Without the header, same URL, same second: `302 → vercel.com/sso-api` (see *Evidence: control
  request without the bypass header*).

The deployment was **not** rebuilt for this round. `dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG` is the
deployment round 1 inspected, still `Ready`, created 2026-10-29T22:12:49Z and immutable. Nothing
in the application changed between the two rounds; only its reachability did.

## Deployment under test

| Item | Value |
|---|---|
| Vercel project | `pensions-system` (`prj_ZS8blMFO18fwOrMaJfRJAEJgqZbz`) |
| Team / scope | `danielbueno76-4270s-projects` (`team_zhU6yZm1eKX0jOZX7UFAkt6p`) |
| Repository | `RexiAI/pensions-system` |
| Branch | `spec/002-hero-conversion` |
| Head commit | `7160df18020dd8e7ccf580b60e754a44075f0ec6` |
| Commit time | 2026-10-29T22:12:43Z (`2026-10-29T23:12:43+01:00`) |
| Deployment created | 2026-10-29T22:12:49Z — **6 s after the commit**, i.e. the Git integration built this commit |
| Attribution | The PR's `Vercel` check run for head `7160df1` links to `dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG` — resolved from the check run, not from a remembered string |
| Aliases | git branch alias only; no custom domain assigned to this project |

**Correspondence with the pushed head, stated precisely.** The round-2 brief described the branch
as carrying local commits not yet pushed. That is not the case, and the measurement says so:
`git ls-remote origin refs/heads/spec/002-hero-conversion` returns `7160df1` and
`git rev-list --left-right --count origin/spec/002-hero-conversion...HEAD` returns `0 0` — zero
commits ahead, zero behind. Local `HEAD` **is** the pushed head **is** the deployed commit.

What the working tree does carry is **uncommitted** modification: `.gitignore`, three spec
markdown files, `specs/002-hero-conversion/25-verification.md` (the phase-2 round-1 evidence
block appended by the previous stage), `tests/acceptance/first-viewport.test.ts` (a two-line
line-break reformat) and `tests/acceptance/gitignore.test.ts`, plus untracked `runs.jsonl`.
**The preview does not include any of it** — it is not committed, so it is not in `7160df1` and
not in the build. Nothing tracked under `web/` is modified (`git diff --stat HEAD -- web/` is
empty), which is what makes the local-build comparison in *Evidence: local production build*
meaningful. This stage changed none of it: nothing was stashed, committed, reverted or edited.

## Evidence: deployment state

command: `vercel inspect 3epFsQ2HvUUZNvdY9ETpGK1FcFfG --scope danielbueno76-4270s-projects`
exit: 0
at: 2026-10-30T08:20:38Z

```
Vercel CLI 64.5.0 (Node.js 24.21.0)
Fetching deployment "dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG" in danielbueno76-4270s-projects
> Fetched deployment "pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app" in danielbueno76-4270s-projects [584ms]

  General

    id		dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG
    name	pensions-system
    target	preview
    status	● Ready
    url		https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app
    created	Thu Oct 29 2026 23:12:49 GMT+0100 (Central European Standard Time) [10h ago]

  Build Machine

    requested build machine basic
    actual assigned cores   2 vCPU (actual assignment)
    memory                  8192 MiB
    selection type          fixed
    selection source        plan-default

  Duration

    build duration	39s
    post-build duration	17s
    billable duration	1m
    CPU Minutes Usage	2 minutes (1m x 2vCPU)

  Aliases

    ╶ https://pensions-system-git-spec-00-db19fe-danielbueno76-4270s-projects.vercel.app
```

## Evidence: phase-2 precondition and head attribution

command: `gh pr checks 9 --json name,state,bucket --jq '.[] | "\(.bucket)\t\(.state)\t\(.name)"'`
exit: 0
at: 2026-10-30T08:21:19Z

```
skipping	SKIPPED	frontend-ci / Docker Build & Push
pass	SUCCESS	frontend-ci / Build
pass	SUCCESS	Vercel Preview Comments
pass	SUCCESS	frontend-ci / Unit Tests
pass	SUCCESS	frontend-ci / Lint & Format
pass	SUCCESS	Vercel
```

command: `git ls-remote origin refs/heads/spec/002-hero-conversion && git rev-list --left-right --count origin/spec/002-hero-conversion...HEAD && git rev-parse HEAD && gh pr checks 9 --json name,state,bucket,workflow,link --jq '.[] | select(.name=="Vercel")'`
exit: 0
at: 2026-10-30T08:21:14Z

```
7160df18020dd8e7ccf580b60e754a44075f0ec6	refs/heads/spec/002-hero-conversion
0	0
7160df18020dd8e7ccf580b60e754a44075f0ec6
{"bucket":"pass","link":"https://vercel.com/danielbueno76-4270s-projects/pensions-system/3epFsQ2HvUUZNvdY9ETpGK1FcFfG","name":"Vercel","state":"SUCCESS","workflow":""}
```

The `Vercel` check run's `link` is how the deployment under test was identified in this round: the
URL was read out of the check run for head `7160df1`, never carried over from round 1's text.

## Evidence: health check `GET /` with protection bypass

command: `curl -sS -D - -o /tmp/r2-h1.html -w 'http=%{http_code} time=%{time_total}s size=%{size_download} redirect=%{redirect_url}\n' --max-time 60 -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app/`
exit: 0
at: 2026-10-30T08:20:43Z

```
http=200 time=0.199905s size=215756 redirect=
HTTP/2 200 
accept-ranges: bytes
access-control-allow-origin: *
age: 432
cache-control: public, max-age=0, must-revalidate
content-disposition: inline
content-type: text/html; charset=utf-8
date: Fri, 30 Oct 2026 08:20:43 GMT
etag: "26d7a533a60adf00a99040b6b7469972"
server: Vercel
strict-transport-security: max-age=63072000; includeSubDomains; preload
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch
x-matched-path: /
x-nextjs-prerender: 1
x-robots-tag: noindex
x-vercel-cache: PRERENDER
content-length: 215756
```

`$VERCEL_AUTOMATION_BYPASS_SECRET` was read from `config/agent.local.env` at runtime. Its value is
32 characters and is redacted here and everywhere else in this document; the length is the only
property recorded, and the header value was never echoed to stdout.

## Evidence: control request without the bypass header

command: `curl -sS -o /dev/null -w 'http=%{http_code} redirect=%{redirect_url}\n' --max-time 30 https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app/`
exit: 0
at: 2026-10-30T08:20:43Z

```
http=302 redirect=https://vercel.com/sso-api?url=https%3A%2F%2Fpensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app%2F&nonce=ba5324272f98201d214212a93424e2353290d07ec70ae48933e296b404459010
```

Same URL, same second, no header — still `302` to the SSO edge. The bypass header is doing the
work and the preview has **not** been left open to the public. This is also the positive control
that round 1 lacked: `200`-with-header next to `302`-without-header proves the `200` came from the
application, not from a protection setting that had been disabled account-wide.

## Evidence: five locales render

command: `for loc in "" en fr de it; do curl -sS -o /tmp/r2-l.html -w '%{http_code}' --max-time 60 -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" "$URL/$loc"; done`
exit: 0
at: 2026-10-30T08:20:43Z → 2026-10-30T08:20:44Z

```
GET / -> 200  <html lang="es"  <title>pensiones · España</title>
GET /en -> 200  <html lang="en"  <title>pensiones · Spain</title>
GET /fr -> 200  <html lang="fr"  <title>pensiones · Espagne</title>
GET /de -> 200  <html lang="de"  <title>pensiones · Spanien</title>
GET /it -> 200  <html lang="it"  <title>pensiones · Spagna</title>
```

## Evidence: deployed stylesheet — accent tokens

command: `curl -sS -o /tmp/r2-css3.css -w 'css http=%{http_code} size=%{size_download}\n' -H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET" "$URL/_next/static/immutable/chunks/37zq0gke2eu09.css" && sha256sum /tmp/r2-css3.css && grep -o -- '--accent:[^;}]*' /tmp/r2-css3.css && echo "old-hex-total: $(grep -o -i -e 425425 -e 9cc17f /tmp/r2-css3.css | wc -l)" && echo "font-face-count: $(grep -o '@font-face' /tmp/r2-css3.css | wc -l)" && grep -o -- '--rule-projection:[^;}]*' /tmp/r2-css3.css && grep -o '\.clock{[^}]*}' /tmp/r2-css3.css`
exit: 0
at: 2026-10-30T08:22:22Z

```
css http=200 size=37462
f99e37e32d54aaf695b9aae892b86e38547c3ac183bb11d553467e15de6e8e8f  /tmp/r2-css3.css
--accent:#3b5512
--accent:#91c46d
old-hex-total: 0
font-face-count: 0
--rule-projection:3px
.clock{margin-top:var(--space-4);text-align:center;justify-self:stretch}
```

The `#3b5512` declaration sits in the `:root` token block (light theme); `#91c46d` sits in the
`[data-theme=dark]` block. The two superseded hexes (`#425425` light, `#9cc17f` dark) do not
appear anywhere in the served stylesheet. `.clock`'s rule carries **no `border-top`** — the
separator is gone from the declaration, not merely overridden. `--rule-projection: 3px` is intact,
which is the height the projection rule above the year line still uses.

The `@font-face` count of `0` is recorded here because it becomes material in
§Discrepancy with the recorded local measurement, below.

## Evidence: eight-check browser journey against the live preview (checks 1–5, 7, 8)

command: `node /tmp/r2-final.cjs` (Playwright 153.0.8010.12, real Chromium,
`newContext({ viewport: 390x844, extraHTTPHeaders: { 'x-vercel-protection-bypass': $VERCEL_AUTOMATION_BYPASS_SECRET } })`, `PREVIEW_URL=https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app`)
exit: 0
at: 2026-10-30T08:20:18Z → 2026-10-30T08:20:30Z

```
browser: 153.0.8010.12
base: https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app
bypass header sent: x-vercel-protection-bypass (value redacted)

CHECK 1+2+3+4+5+7+8 — per locale, viewport 390x844
/    http=200 lang=es title="pensiones · España"
     accent=#3b5512 clock: top=424.91 bottom=768.08 clearance=75.92 (viewport 844, limit 794)
     clock present: border-top=0px hr-inside=0 rule-inside=0 numerals-inside=16 sub-rows-inside=3
     countdown__rule count=1 height=3px bg=rgb(107, 82, 10) above-year-line=true
     cta=1 "Ver cuánto te queda" bg=rgb(59, 85, 18) | cta2=1 "Cómo se calcula" bg=rgba(0, 0, 0, 0) color=rgb(71, 57, 42)
     consoleErrors=0 pageErrors=0

/en  http=200 lang=en title="pensiones · Spain"
     accent=#3b5512 clock: top=424.91 bottom=768.08 clearance=75.92 (viewport 844, limit 794)
     clock present: border-top=0px hr-inside=0 rule-inside=0 numerals-inside=16 sub-rows-inside=3
     countdown__rule count=1 height=3px bg=rgb(107, 82, 10) above-year-line=true
     cta=1 "See your figure" bg=rgb(59, 85, 18) | cta2=1 "How it is calculated" bg=rgba(0, 0, 0, 0) color=rgb(71, 57, 42)
     consoleErrors=0 pageErrors=0

/fr  http=200 lang=fr title="pensiones · Espagne"
     accent=#3b5512 clock: top=424.91 bottom=768.08 clearance=75.92 (viewport 844, limit 794)
     clock present: border-top=0px hr-inside=0 rule-inside=0 numerals-inside=16 sub-rows-inside=3
     countdown__rule count=1 height=3px bg=rgb(107, 82, 10) above-year-line=true
     cta=1 "Voir votre montant" bg=rgb(59, 85, 18) | cta2=1 "Comment on calcule" bg=rgba(0, 0, 0, 0) color=rgb(71, 57, 42)
     consoleErrors=0 pageErrors=0

/de  http=200 lang=de title="pensiones · Spanien"
     accent=#3b5512 clock: top=424.91 bottom=787.52 clearance=56.48 (viewport 844, limit 794)
     clock present: border-top=0px hr-inside=0 rule-inside=0 numerals-inside=16 sub-rows-inside=3
     countdown__rule count=1 height=3px bg=rgb(107, 82, 10) above-year-line=true
     cta=1 "Deinen Betrag sehen" bg=rgb(59, 85, 18) | cta2=1 "Wie gerechnet wird" bg=rgba(0, 0, 0, 0) color=rgb(71, 57, 42)
     consoleErrors=0 pageErrors=0

/it  http=200 lang=it title="pensiones · Spagna"
     accent=#3b5512 clock: top=424.91 bottom=768.08 clearance=75.92 (viewport 844, limit 794)
     clock present: border-top=0px hr-inside=0 rule-inside=0 numerals-inside=16 sub-rows-inside=3
     countdown__rule count=1 height=3px bg=rgb(107, 82, 10) above-year-line=true
     cta=1 "Vedere quanto ti resta" bg=rgb(59, 85, 18) | cta2=1 "Come si calcola" bg=rgba(0, 0, 0, 0) color=rgb(71, 57, 42)
     consoleErrors=0 pageErrors=0

CHECK 4 — accent, both themes (desktop viewport)
light --accent=#3b5512  dark[data-theme=dark] --accent=#91c46d
dark: hero__cta bg=rgb(145, 196, 109)  hero__cta-secondary color=rgb(203, 190, 173)
```

Notes on individual checks, read off the above:

- `rgb(59, 85, 18)` is `#3b5512`; `rgb(107, 82, 10)` is `#6b520a` (`--data-projection`, the ochre
  the projection rule is drawn in); `rgb(71, 57, 42)` is `#47392a` (`--ink-2`); `rgb(145, 196, 109)`
  is `#91c46d`.
- `numerals-inside=16` reads "the `.clock` element contains exactly one `.countdown__numeral`,
  whose text is `16`" — the years numeral is inside the group, not beside it.
- `hr-inside=0` and `rule-inside=0` are measured against the `.clock` subtree, so the page's four
  other `<hr>` elements (the hero panel rules) are correctly excluded.
- `above-year-line=true` compares the projection rule's `getBoundingClientRect().bottom` against
  the year line's `top`: `158.44 ≤ 166.44`. The 3px ochre rule is still there, still above the year.
- CTA hierarchy is one `.hero__cta` (filled `#3b5512`, text `--on-accent` `#fdf2e1`) and exactly
  one `.hero__cta-secondary` (transparent background, `--ink-2` ink, no accent).

`/tmp/r2-final.cjs` is a throwaway verification harness written for this round — it is not
committed, and it is not production code. It launches Chromium directly
(`playwright.chromium.launch`), reads the bypass secret from `config/agent.local.env` itself so the
value never crosses a tool argument, and prints the block above verbatim. The same harness with
`PREVIEW_URL=http://127.0.0.1:3199` produces the local-build block further down.

## Evidence: zero-JS first paint (check 6)

command: `node /tmp/r2-final.cjs` — `newContext({ viewport: 390x844, javaScriptEnabled: false, extraHTTPHeaders: { 'x-vercel-protection-bypass': $VERCEL_AUTOMATION_BYPASS_SECRET } })`
exit: 0
at: 2026-10-30T08:20:18Z → 2026-10-30T08:20:30Z

```
CHECK 6 — zero-JS (javascriptEnabled: false), 390x844
/    http=200 hero=true clock=true numeral=16 subRows=3 clockBottom=768.08 ctaBg=rgb(59, 85, 18) textLen=10480
/en  http=200 hero=true clock=true numeral=16 subRows=3 clockBottom=768.08 ctaBg=rgb(59, 85, 18) textLen=10141
/fr  http=200 hero=true clock=true numeral=16 subRows=3 clockBottom=768.08 ctaBg=rgb(59, 85, 18) textLen=10834
/de  http=200 hero=true clock=true numeral=16 subRows=3 clockBottom=787.52 ctaBg=rgb(59, 85, 18) textLen=10632
/it  http=200 hero=true clock=true numeral=16 subRows=3 clockBottom=768.08 ctaBg=rgb(59, 85, 18) textLen=10419
```

With script execution disabled in the context, the hero, the years numeral, the three sub-day
fields and the accent-filled primary CTA are all present in every locale — they are
server-rendered, and the same geometry is reproduced (`de` is 787.52 here too, which is an
independent confirmation that the fold result does not depend on the client ticker running).

## Evidence: local production build of the same head reproduces every measured value

This block exists to answer one question: does the **deployed** artifact match a build of the same
commit, or has the deployment drifted? The build was made from the working tree, and `web/` is
byte-identical to `HEAD` (`git diff --stat HEAD -- web/` empty), so it serves `7160df1`'s source.

command: `npm run build` && `PORT=3199 npx next start -p 3199` && `PREVIEW_URL=http://127.0.0.1:3199 node /tmp/r2-node.cjs`
exit: 0, 0, 0
at: 2026-10-30T08:18:52Z (build finished) · 2026-10-30T08:19:16Z (measurement)

```
LOCAL BUILD of HEAD (next start, same Chromium)
/     http=200 lang=es clockTop=424.91 clockBottom=768.08 clearance=75.92 height=343.17 borderTop=0px hrInClock=0 ruleInClock=0 numeral='16' subs=3 ruleH=3px ruleBg=rgb(107, 82, 10) ruleAbove=True accent=#3b5512 ctaBg=rgb(59, 85, 18) cta2Bg=rgba(0, 0, 0, 0) cta2Color=rgb(71, 57, 42) console=[] pageerr=[]
/en   http=200 lang=en clockTop=424.91 clockBottom=768.08 clearance=75.92 height=343.17 borderTop=0px hrInClock=0 ruleInClock=0 numeral='16' subs=3 ruleH=3px ruleBg=rgb(107, 82, 10) ruleAbove=True accent=#3b5512 ctaBg=rgb(59, 85, 18) cta2Bg=rgba(0, 0, 0, 0) cta2Color=rgb(71, 57, 42) console=[] pageerr=[]
/fr   http=200 lang=fr clockTop=424.91 clockBottom=768.08 clearance=75.92 height=343.17 borderTop=0px hrInClock=0 ruleInClock=0 numeral='16' subs=3 ruleH=3px ruleBg=rgb(107, 82, 10) ruleAbove=True accent=#3b5512 ctaBg=rgb(59, 85, 18) cta2Bg=rgba(0, 0, 0, 0) cta2Color=rgb(71, 57, 42) console=[] pageerr=[]
/de   http=200 lang=de clockTop=424.91 clockBottom=787.52 clearance=56.48 height=362.61 borderTop=0px hrInClock=0 ruleInClock=0 numeral='16' subs=3 ruleH=3px ruleBg=rgb(107, 82, 10) ruleAbove=True accent=#3b5512 ctaBg=rgb(59, 85, 18) cta2Bg=rgba(0, 0, 0, 0) cta2Color=rgb(71, 57, 42) console=[] pageerr=[]
/it   http=200 lang=it clockTop=424.91 clockBottom=768.08 clearance=75.92 height=343.17 borderTop=0px hrInClock=0 ruleInClock=0 numeral='16' subs=3 ruleH=3px ruleBg=rgb(107, 82, 10) ruleAbove=True accent=#3b5512 ctaBg=rgb(59, 85, 18) cta2Bg=rgba(0, 0, 0, 0) cta2Color=rgb(71, 57, 42) console=[] pageerr=[]

light: {'accent': '#3b5512'} dark: {'before': '#3b5512', 'after': '#91c46d', 'ctaBg': 'rgb(145, 196, 109)', 'cta2Color': 'rgb(203, 190, 173)'}
```

Deployed and local-build values are **identical on every measured property in every locale**,
including the per-locale clock heights (`343.17` es/en/fr/it, `362.61` de), the console-error count
(`0`), and both accents. The deployed artifact is the same artifact a local build of this commit
produces. A further cross-check: the hero markup of `/fr` is 2 809 bytes on both sides and differs
only in the live clock numerals (`5542` vs `5541` days) — the pages are the same HTML with a
different tick.

The `.next/` output the build wrote is gitignored (`git check-ignore` → `.gitignore:2:.next/`), and
`git status --short` was byte-identical before and after the build. No deployment was created: this
is a local `next build`/`next start`, not a Vercel build.

## Evidence: runtime log query (round 2)

command: `vercel logs --deployment https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app --scope danielbueno76-4270s-projects`
exit: 0
at: 2026-10-30T08:20:47Z

```
{"type":"summary","recordsReturned":0,"timeRange":{"start":"2026-10-30T07:50:48.404Z","end":"2026-10-30T08:20:48.404Z"},"pagination":{"hasMore":false,"next":null},"excludedIntervals":[]}
```

Still `0` records over a window that contains several hundred served requests — and this time the
requests demonstrably succeeded. The explanation is visible in the health-check headers:
`x-vercel-cache: PRERENDER` and `x-nextjs-prerender: 1`. These routes are fully prerendered and
served from the CDN, so no serverless function is invoked and there is no runtime log to return.

Recorded as a correction to round 1's reasoning: `recordsReturned: 0` on its own does **not**
prove "no request reached the application" for a prerendered deployment — it only proves no
function ran. Round 1's conclusion was still right, but the decisive evidence there was the `302`,
not the zero. `vercel logs` is not a usable diagnostic for this deployment's runtime behaviour.

## Per-check verdicts

| # | Check | Verdict | Evidence |
|---|---|---|---|
| 1 | `GET /` returns 2xx | **pass** | `200`, 215 756 B, `lang="es"` |
| 2 | `/en`, `/fr`, `/de`, `/it` each render | **pass** | `200` each, correct `lang` and title (5/5) |
| 3 | Years numeral + sub-day row inside one group; separator absent; 3px ochre rule still above the year line | **pass** | `.clock` `border-top: 0px`; 0 `<hr>` and 0 `.countdown__rule` inside `.clock`; one `.countdown__numeral` inside it; `.countdown__rule` count 1, `3px`, `rgb(107, 82, 10)`, bottom `158.44` ≤ year-line top `166.44` |
| 4 | New accent applied, old absent | **pass** | `--accent:#3b5512` light, `#91c46d` on `[data-theme=dark]`; compound styles resolve to `rgb(59,85,18)` / `rgb(145,196,109)`; `#425425` and `#9cc17f` appear 0 times in the served stylesheet |
| 5 | One dominant filled primary CTA + one non-accent secondary | **pass** | 1 × `.hero__cta` filled `rgb(59,85,18)`; 1 × `.hero__cta-secondary`, background transparent, ink `rgb(71,57,42)` |
| 6 | Zero-JS: hero and clock render | **pass** | With `javaScriptEnabled: false`, all five locales: hero, `16`, 3 sub-day rows, accent CTA |
| 7 | Clock bottom ≤ 844 − 50 = 794 at 390×844, every locale | **pass** | es 768.08 (75.92 clearance), en 768.08 (75.92), fr 768.08 (75.92), **de 787.52 (56.48)**, it 768.08 (75.92) — worst case 6.48 px inside the limit |
| 8 | No console errors on first paint | **pass** | `consoleErrors=0 pageErrors=0` in all five locales |

Check 7 passes, but see the finding immediately below: the locale that binds is **de**, not **fr**
as the repository's recorded measurement states.

## Discrepancy with the recorded local measurement (finding, not a blocker)

The round-2 brief expected `es/en/de/it 768.08` and `fr 787.52`. The deployed artifact — and a
local build of the same commit measured in the same Chromium, and the zero-JS render — all produce
the opposite attribution: **de 787.52, fr 768.08**. Both figures appear in the repo, attached to
the wrong locale:

- `tests/acceptance/first-viewport.test.ts:150` (`MEASURED_CLOCK_BY_LOCALE`) records
  `fr: { clock: [444.34, 787.52] }` and `de: { clock: [424.91, 768.08] }`.
- The PR body's "How to verify" step 3 states "measured clearance: es/en/de/it 75.92px,
  fr 56.48px".

Measured cause, from the deployed page:

```
element                               /      /en      /fr      /de      /it
.clock__fields                      131      131      131   150.44      131
.clock__anchor                    48.59    48.59    48.59    48.59    48.59
.clock__definition                97.19    97.19    97.19    97.19    97.19
```

```
/de   sub label='Stunden' fieldH=67.17 labelH=38.88 labelW=48    labelFS=12px lh=19.44px ws=normal
/fr   sub label='heures'  fieldH=47.73 labelH=19.44 labelW=40.91 labelFS=12px lh=19.44px ws=normal
```

German's hours label `Stunden` measures exactly `48px` — the value of `--clock-sub-col: 3rem` —
so it wraps to a second line, its grid row grows by one `19.44px` line, and the whole clock grows
from `343.17` to `362.61`. French's `heures` (`40.91px`) fits and does not wrap. The record's
`fr` entry instead shows the clock **starting** 19.43 px lower (`444.34` vs `424.91`), which is the
signature of an extra line in the projection block **above** the clock — a different mechanism
that does not reproduce here in either build.

The reason both numbers travel without contradiction is that nothing measures them
mechanically: the suite asserts only inequalities against these constants
(`bottom <= 844 - 50`, `fields[1] <= 844`, `clock[0] >= 0`), and the `tokens.css` comment check
requires the strings `75.92` and `56.48` to be present, not to be attached to the right locale. A
swapped attribution passes all of it.

The likely driver is font metrics: the served stylesheet contains **no `@font-face` at all** (see
*Evidence: deployed stylesheet*), so `--font-sans: 'Instrument Sans', system-ui, …` falls back to
whatever `system-ui` the client resolves. `Stunden` sitting at exactly the 48 px column width means
the wrap is decided by font metrics, so the per-locale clearance figures are a property of the
measuring client, not of the artifact. On a client with wider metrics than this one, German would
still wrap (it already does) but could tip past the 794 limit; nothing currently measures that.

**Verdict impact: none for this gate.** The deployed artifact satisfies the check-7 criterion in
every locale (worst case `787.52 ≤ 794`), which is what the gate asserts. The defect is in the
recorded numbers and their attribution, not in the deployed behaviour.

**Routing: recorded, not fixed, not re-routed.** This is neither an E2E-exit-code failure against
the live preview (the deployed artifact passes), nor a Vercel configuration-classified error, nor a
structural gate failure, and it is not an ambiguous build or health-check failure — the cause is
established, not ambiguous. Per the Stop-and-Ask matrix's *Out-of-scope finding* row, this stage
records it and proposes a follow-up rather than fixing it: stage 5c writes no production code and
commits nothing. Proposed follow-up (a small docs/fixture spec, not a behaviour fix): re-measure
`MEASURED_CLOCK_BY_LOCALE` per locale on two font stacks, correct the `fr`/`de` rows, and decide
whether the fold guarantee should be asserted against a named font stack instead of `system-ui`.

## E2E on the live preview: what ran and what did not

The E2E lane for this spec **was** executed against the live preview URL (never a local dev
server): the eight-check browser journey in §Evidence: eight-check browser journey is that
execution, driven through a real Chromium with the bypass header on the context, at 390×844, in all
five locales, with console and page-error capture on first paint. Its verdict is `pass`.

What did **not** happen is a delegation to the `e2e-runner` subagent, and the reason is recorded
rather than glossed: this repository has no agentic E2E suite to run. There is no `e2e/` directory,
no `playwright.config.*`, no `*.e2e.*` file, and no `e2e` script in `package.json`; the
`skills/e2e-testing` standard applies to child repos that have adopted the `e2e` framework, and this
one has not. Authoring a suite is outside stage 5c's mandate — this stage verifies, it does not
write tests or production code. Recording the gap is the honest option; inventing a runner
invocation that could only report "no suite" would have produced a meaningless exit code.

No non-zero runner exit was consumed, so no behaviour fix was routed to `spec-coder`.

## Fix routing

| Lane | Applies? | Reason |
|---|---|---|
| E2E runner non-zero → `spec-coder` (behaviour) | **no** | The live-preview journey exited 0; eight of eight checks pass. |
| Vercel configuration-classified error → self-retry after repair | **no** | The round-1 access condition was resolved by the owner's Protection Bypass configuration; nothing remains mis-configured. `vercel.json`, framework preset and project env vars were not changed by this stage. |
| Structural / complexity gate → `spec-refactorer` | **no** | No gate ran and none failed; the cloud build is green. |
| Ambiguous build/health failure → STOP and escalate | **no** | Neither applies: the build is `Ready` with no failure to classify, and the health check is `200`. The one anomaly (the fr/de attribution) has a measured cause and is recorded as an out-of-scope finding, not an ambiguous failure. |

**Routing: no fix to route. Phase-3 round 2 ends with `Verdict: PASS`.** Nothing was committed,
pushed, tagged, or PR-edited; the archive (stage 5d) is unblocked.

## Conditions resolved per the Stop-and-Ask matrix

| Condition | Resolution |
|---|---|
| Working tree dirty | Encountered and left untouched. Modified paths: `.gitignore`, three spec markdown files, `25-verification.md` (the phase-2 round-1 evidence block appended by a prior stage), `tests/acceptance/first-viewport.test.ts` (a two-line reformat), `tests/acceptance/gitignore.test.ts`, plus untracked `runs.jsonl`. Nothing was stashed, committed, reverted or edited. `git diff --stat HEAD -- web/` is empty, which is what made the local-build comparison valid. Recorded, not resolved. |
| Local commits not yet pushed | Investigated and found **not** to be the case: `git ls-remote` returns `7160df1`, ahead/behind is `0 0`. What exists is uncommitted working-tree modification, which the preview does not include. Stated explicitly under §Deployment under test. |
| Protection bypass secret absent or rejected | Not encountered. The secret was present (32 characters) and accepted on the first request; a control request without it still returns `302`, so the header is what is being honoured. |
| Design / structural gate | Not applicable at this stage; none run. |
| Version bump / git tag | Not requested, not created. CI owns versioning. |

## Prohibitions honoured

- **No deployment was created.** `vercel deploy` / `vercel deploy --prod` were never invoked; the
  Git integration remains the only builder in this lane. The `vercel deploy*` command is denied in
  this agent's `permission.bash` frontmatter and was not attempted.
- Only `vercel inspect` and `vercel logs` were run this round — both observation. No `env add`, no
  `pull`, no `domains` mutation.
- **The bypass secret was never printed, echoed, or passed as a flag.** It was read from the
  gitignored `config/agent.local.env` into a shell variable (and, in the Playwright script, read
  from the same file by the script itself, so it never crossed a tool argument), sent only as the
  `x-vercel-protection-bypass` request header, and redacted from every command and captured output
  in this document. Its length is the only property recorded anywhere.
- `VERCEL_TOKEN` was never printed and never passed as a `--token` flag; the CLI used its existing
  per-machine session.
- Nothing was committed, pushed, tagged, or PR-edited. `specs/002-hero-conversion/00-informal.md`
  was never read.

---

# Round 1 — attempt 1 (ESCALATED) — historical record, preserved

Round 1 ended in `Verdict: ESCALATED` for the reason recorded below. It is kept because the
escalation is part of this spec's audit trail and because round 2 is only meaningful against it.
Evidence headings in this appendix are demoted to `###` to keep them distinguishable from round 2's
`##` blocks; the commands, exit codes, timestamps and outputs are the originals, unedited.

**Round-1 verdict: ESCALATED.**

The Vercel build of the PR head **succeeded** (`status: Ready`, 39s). The live surface could **not**
be checked: Vercel Deployment Protection gated the preview and every unauthenticated request was
answered by Vercel's SSO edge with a `302` before the application was reached. Both available
observation clients — `curl` and a real Chromium (`playwright`) — hit that wall, and `vercel logs`
returned **zero** records for the deployment.

| Round-1 field | Value |
|---|---|
| Deploy URL | `https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app` |
| Deployment id | `dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG` (the same deployment round 2 verified) |
| Build status | `pass` — `status: ● Ready`, `target: preview`, build 39s, post-build 17s |
| Health check status | `fail (blocked)` — `302` to `vercel.com/sso-api` on `/` and `/en` |
| E2E verdict | `skip (blocked)` — target unreachable |
| Timestamp | 2026-10-29T22:17:47Z |
| Phase-3 attempt count | 1 (of 3) |
| Deploy command run | none |
| Phase-3 budget marker | not written — belongs to the 3rd failed round |

### Round 1 — Evidence: deployment state

command: `vercel inspect 3epFsQ2HvUUZNvdY9ETpGK1FcFfG --scope danielbueno76-4270s-projects`
exit: 0
at: 2026-10-29T22:16:50Z

```
Vercel CLI 64.5.0 (Node.js 24.21.0)
Fetching deployment "dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG" in danielbueno76-4270s-projects
> Fetched deployment "pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app" in danielbueno76-4270s-projects [532ms]

  General

    id		dpl_3epFsQ2HvUUZNvdY9ETpGK1FcFfG
    name	pensions-system
    target	preview
    status	● Ready
    url		https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app
    created	Thu Oct 29 2026 23:12:49 GMT+0100 (Central European Standard Time)

  Aliases

    ╶ https://pensions-system-git-spec-00-db19fe-danielbueno76-4270s-projects.vercel.app
```

### Round 1 — Evidence: head-commit attribution

command: `gh api repos/RexiAI/pensions-system/commits/7160df18020dd8e7ccf580b60e754a44075f0ec6/check-runs --jq '.check_runs[] | {name, conclusion, status, details_url}'`
exit: 0
at: 2026-10-29T22:15:40Z

```
{"conclusion":"skipped","details_url":"https://github.com/RexiAI/pensions-system/actions/runs/40964107401/job/123764640883","id":123764640883,"name":"frontend-ci / Docker Build & Push","status":"completed","target_url":null}
{"conclusion":"success","details_url":"https://github.com/RexiAI/pensions-system/actions/runs/40964107401/job/123764401186","id":123764401186,"name":"frontend-ci / Build","status":"completed","target_url":null}
{"conclusion":"success","details_url":"https://vercel.com/github","id":123764351378,"name":"Vercel Preview Comments","status":"completed","target_url":null}
{"conclusion":"success","details_url":"https://github.com/RexiAI/pensions-system/actions/runs/40964107401/job/123764076721","id":123764076721,"name":"frontend-ci / Unit Tests","status":"completed","target_url":null}
{"conclusion":"success","details_url":"https://github.com/RexiAI/pensions-system/actions/runs/40964107401/job/123764076185","id":123764076185,"name":"frontend-ci / Lint & Format","status":"completed","target_url":null}
```

### Round 1 — Evidence: health check `GET /`

command: `curl -sS -o /tmp/home.html -w 'http=%{http_code} time=%{time_total}s size=%{size_download} redirect=%{redirect_url}\n' --max-time 45 https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app/`
exit: 0
at: 2026-10-29T22:16:23Z

```
http=302 time=0.258311s size=263 redirect=https://vercel.com/sso-api?url=https%3A%2F%2Fpensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app%2F&nonce=e5836f3062a3864f6732e0d8c4b45f95bd1a5b062c7ddce972795ec51487e926
```

Response headers on `GET /en` showed the identical edge behaviour:

```
HTTP/2 302 
cache-control: no-store, max-age=0
content-type: text/plain
date: Thu, 29 Oct 2026 22:16:35 GMT
location: https://vercel.com/sso-api?url=https%3A%2F%2Fpensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app%2Fen&nonce=ec5b8dfd80bd68bddc4a003626f9d6731dd802e24b9fc01d5520c591c4daa3d9
server: Vercel
set-cookie: _vercel_sso_nonce=2199cfb35984c123c769675457b4247b86f2cea944c9ab17; Max-Age=3600; Path=/; Secure; HttpOnly; SameSite=Lax
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-frame-options: DENY
x-robots-tag: noindex
x-vercel-id: cdg1::9gdht-1793312195670-becb7d98c1d4
```

### Round 1 — Evidence: browser first paint

Playwright (real Chromium, unauthenticated profile) against the same deployment URL:

command: `playwright browser_navigate { url: "https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app/" }`
exit: 0 (navigate succeeded; landed on Vercel's login, not the app)
at: 2026-10-29T22:17:06Z

```
- Page URL: https://vercel.com/login?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fpensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app%252F%26nonce%3Da2b69338ce6b732d382a6746d8a1f9ba964baac2a9112c07bde4cedf059ccc62
- Page Title: Login – Vercel
```

### Round 1 — Evidence: runtime log query

command: `vercel logs --deployment https://pensions-system-a5m7zjio2-danielbueno76-4270s-projects.vercel.app --scope danielbueno76-4270s-projects`
exit: 0
at: 2026-10-29T22:17:31Z

```
{"type":"summary","recordsReturned":0,"timeRange":{"start":"2026-10-29T21:47:31.036Z","end":"2026-10-29T22:17:31.036Z"},"pagination":{"hasMore":false,"next":null},"excludedIntervals":[]}
```

### Round 1 — Evidence: project domain inventory

command: `vercel domains ls --scope danielbueno76-4270s-projects`
exit: 0
at: 2026-10-29T22:17:45Z

```
 Domain             Registrar           Nameservers         Expiration Date    Creator                     Age    
 rexi-ai.com        Third Party         Third Party         -                  danielbueno76-4270          20d
```

### Round 1 — routing, and what unblocked round 2

Round 1's fix-routing table concluded that none of the three deterministic lanes applied — no
runner exit existed, the condition was Deployment Protection rather than a repairable Vercel
configuration error, and the cloud build was green — so the health check's failure was treated as
the ambiguous case and escalated rather than guessed. It named two ways to unblock:

1. Add a documented exception for `vercel curl` to this agent's permitted-command list (the CLI's
   authenticated fetch, which spec 001's phase-3 verification had used on this project).
2. **Configure a protection bypass for automation** and hand the secret to the pipeline as an env
   var, so a plain `curl -H "x-vercel-protection-bypass: …"` satisfies every check without
   widening the CLI allow-list.

The owner took option 2. That is what made round 2 possible, and it is why no command outside the
permitted set was needed to carry it out.

Verdict: PASS
