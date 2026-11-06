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
