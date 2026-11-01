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
