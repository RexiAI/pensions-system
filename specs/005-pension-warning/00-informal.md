# 005-pension-warning — informal spec

Petición original (usuario, 2026-11-05), tras ver la página fusionada:

> La pensión que te espera en España / El número / 16 años / 5535 días / 06 horas /
> 57 min / 59 s / Faltan estos días para el 1 de enero de 2042, el día en que la
> población mayor alcanza la proporción que explica el paso siguiente.
> **no space in that box.** next *la pension que te espera en españa* -> **and what
> is the pension????** we need to be clear and keep it simple. we need to alert
> that people will not have a pension (at least a decent one) and how much time we
> have. we need to start a way between elder and young people!!!

La spec 004 arregló la estructura. No arregló las palabras. El titular sigue
prometiendo una cifra de pensión que la página nunca da, el primer párrafo no
dice qué mide, y el recuadro más importante del documento es el que menos aire
tiene.

## Decisiones ya tomadas con el usuario (2026-11-05)

| Pregunta | Decisión |
|---|---|
| El titular promete una pensión que la página no da | **Se retitula** para que diga lo que la página mide. La cifra de pensión real queda como spec 006, no entra aquí. |
| Cómo avisar de que la pensión puede no llegar | **Sólo el mecanismo, como hecho**: las pensiones se pagan con lo que cotizan los que trabajan hoy, y cada ocupado sostiene a más beneficiarios. Sin profecías. |
| El conflicto generacional | **Mecanismo en el registro de hechos** (quién paga, quién recibe, hacia dónde va el ratio) y **el juicio en «Nuestra lectura»**, etiquetado como opinión. |
| Alcance de esta spec | **Sólo texto y espaciado.** Sin cifras nuevas, sin series nuevas. El comparador paga/recibe y las cinco cifras sin calcular quedan fuera. |

## Defectos medidos

| # | Defecto | Evidencia |
|---|---|---|
| 1 | El `<h1>` promete una pensión; la página mide un ratio de dependencia | clave `hero.statement` = «La pensión que te espera en España»; ninguna cifra de pensión en toda la página |
| 2 | La frase del paso 1 es circular y aplaza el número | clave `steps.number.sentence` = «…alcanza **la proporción que explica el paso siguiente**». No dice 50 por cada 100 en ningún sitio del primer paso |
| 3 | El recuadro más importante tiene la mitad de aire que los demás | `.step--number { padding-block: var(--space-6) }` = **32 px**; `.step { padding-block: var(--space-8) }` = **64 px** |
| 4 | La consecuencia nunca se enuncia | el paso 2 da el ratio; ningún paso dice qué implica para quien lee |

## Qué quiero

1. **Un titular que diga la verdad.** Que nombre la cuenta atrás y el
   envejecimiento, no una pensión que la página no calcula. Cinco idiomas.

2. **Un primer párrafo que nombre el número.** Que diga la proporción —50 personas
   de 65 y más por cada 100 de 15 a 64— en la misma frase que la fecha. Que se
   entienda sin leer el paso siguiente.

3. **El mecanismo, como hecho comprobable.** Que la página diga, en lenguaje llano
   y apoyado en las cifras que ya publica, que las pensiones se pagan con lo que
   cotizan los que trabajan hoy y que cada persona ocupada sostiene a más
   beneficiarios de los que sostenía antes. Con su cifra y su fuente, como
   cualquier otra.

4. **El juicio, en su registro.** La lectura intergeneracional —que el peso cae
   sobre quien trabaja hoy y sobre quien trabajará mañana— vive en «Nuestra
   lectura», marcada como la lectura de la página, no como medición.

5. **Aire en el paso 1.** El recuadro del número deja de ser el más apretado del
   documento. Su padding no puede ser menor que el de cualquier otro paso, y el
   titular, el reloj y la frase se separan lo suficiente para leerse como tres
   cosas y no como un bloque.

## Lo que NO quiero

- No se inventan cifras de pensión. 「Cuánto vas a cobrar」 necesita datos que la
  página no tiene; eso es la spec 006.
- No se calculan las cinco cifras que siguen sin calcular (`fig-03`…`fig-07`).
- No se cambia la estructura de cinco pasos de la spec 004.
- No se toca el registro visual: paleta, tipos, reglas, radios.
- No se traduce a menos idiomas.
- No se afirma como hecho ninguna afirmación moral sobre un colectivo. Las
  personas mayores cotizaron; la tensión es de mecanismo y de reparto, y así se
  escribe.

## Preguntas abiertas

- Ninguna bloqueante. Las cuatro decisiones de arriba cierran el alcance.

## Nota sobre el registro

La página tiene tres registros: «Lo que no se discute» (hechos), «Lo que se
discute» (disputa documentada) y «Nuestra lectura» (opinión). Esta spec no los
mezcla. Un juicio en el registro de hechos cuesta credibilidad justo entre
quienes hay que convencer; el mecanismo, en cambio, es más contundente porque se
puede comprobar.
