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
- `.gitignore`: `reports/` y `runs.jsonl`.

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
