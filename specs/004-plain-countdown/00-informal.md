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
