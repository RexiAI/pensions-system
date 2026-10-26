# Design Spec: pension-math

> **Amendment status:** §Revision 1 (live E2E findings) amends this document. Where a directive in Revision 1 disagrees with an earlier section, Revision 1 wins. Everything else stands.

## Design Read

Reading this as: an editorial data-journalism publication for a skeptical cold visitor arriving from a social feed, with a statistical-bulletin language (paper, ink, mono numerals, hairline rules, no photography), leaning toward native CSS + Tailwind v4 tokens + server-rendered SVG charts, deliberately no component library and almost no client JavaScript.

The product is a measuring instrument that happens to be a magazine. Every visual decision below is scored on one question: does it make a doubtful reader believe the number sooner?

### Scroll contract, what the reader must feel at each stage

| Stage | Reader's state on arrival | What the design must produce | What must NOT happen |
|---|---|---|---|
| Viewport 1, hero | Cold, half-attending, scrolling past | "This is instrumented, not opinionated." One computed number, its date, the names of the official bodies it came from, and the promise that the number is checkable. | No argument, no adjective, no urgency, no photograph of an elderly couple |
| Viewport 2, register key | "Who is this site and what is it selling me" | "It tells me which of its own sentences are arithmetic, which are contested, and which are its own opinion." Trust earned by self-limitation before any claim is made. | No claim about pensions yet |
| Viewports 3 to 7, the five figures | Willing, verifying | "The arithmetic is shown, not asserted." Each plate: the finding as a plain caption, the numbers, three labelled anchors, the source, the formula id, the hash, the reproduce command, the full table. | No tooltip-hidden numbers, no single headline debt figure, no red alarm areas |
| Register block, consensus and dispute | Testing for bias | "It is being fair to the other side." Two positions, equal column width, equal type size, each with its own citation. | No stagger, no tint, no winner |
| Thesis | Suspicious again, because now the site has a view | "It is allowed an opinion and it has labelled it as one." Ground changes, voice changes, a signature appears, and the label says so. | No thesis language anywhere upstream of this block |
| Reproduce, assumptions, revisions | Deciding whether to cite it | "I could audit this." The command, the hashes, the assumption ledger, the site's own revision log. | No hidden assumptions, no v1.4.2 build stamp theatre |
| Footer | Leaving | "It told me what it does not claim." | No newsletter modal, no engagement bait |

The credibility ladder is: instrument, then self-limitation, then verification, then fairness, then labelled opinion, then auditability, then disclaimer. Each stage removes one reason to distrust. That ordering is the design.

### Credibility mechanism per stage, named

1. **Hero:** a computed ratio in `font-mono` with `tabular-nums`, three dated comparison values (1996, 2010, latest), and a snapshot stamp in the same strip. Numbers in mono are the visual signature of a measurement, not a pitch.
2. **Register key:** the site's own taxonomy, exposed with live samples of each register, before any argument.
3. **Figures:** provenance as a full-width instrument plate under every figure (see T1), always visible, never behind a click.
4. **Dispute:** strict symmetry. Identical column width, identical type size, identical citation chip placement. Any asymmetry here reads as editorialising.
5. **Thesis:** four simultaneous markers (ground tint, 4px ink rule, serif voice, signature) plus an explicit disclaimer sentence. Redundancy is the point: a reader who missed three markers still catches one.
6. **Reproduce:** monospace commands and full digests, in a section that looks like a terminal transcript on purpose.
7. **Footer:** a plain, short "what this site does not claim" paragraph in body type, not 10px legalese.

### The three registers, solved structurally

Register is carried by **ground, label, type voice, and border**, never by colour temperature. That is what keeps the separation legible to a colourblind reader, in dark mode, in print, and to a screen reader.

| Register | Ground | Label (mono, 13px) | Type voice | Border | Components |
|---|---|---|---|---|---|
| **Instrument** (computed, uncontested) | `--surface-1` | `FIG. 01` inside `<figcaption>` | sans + mono numerals | 1px `--rule-1` top rule | Figure plate |
| **Consensus** (`T10` agreement) | `--surface-1` | `Lo que no se discute` | sans prose, 62ch | none | `<AgreementSection>` |
| **Dispute** | `--surface-2` inset, full-bleed | `Lo que se discute` | sans prose, two-column dossier | 1px `--rule-1` top and bottom | `<DisputeSection>` |
| **Thesis** (the site's own reading) | `--surface-3` inset, full-bleed | `Nuestra lectura` | EB Garamond for the thesis statement only, then sans | 4px `--ink-1` left rule | `<ThesisSection>` |

Hard rules that follow from the table:

- The "fraud / chain-letter / pyramid scheme" vocabulary may appear only inside `thesis.*` locale keys and only inside `<ThesisSection>`. No figure plate uses `--surface-3` ground. No figure caption uses the serif. (Token-level counterpart of AC-001-41 and AC-001-42.)
- Links between registers are one-directional: the thesis may link out to a figure (`#fig-05`); a figure may link to the dispute section only, never to the thesis. This is a design constraint on the content model, enforceable as a test.
- The three prose-register labels are the only eyebrows on the page. Figure labels are `<figcaption>` text with a real semantic role (they are the anchor target of cross-references and citations), not decorative section numbering.
- No motion between registers. The thesis panel is deliberately static: animating it would dramatise it, which is exactly the register failure this design exists to prevent.

## Dial Values

- **DESIGN_VARIANCE: 5**: Offset, not expressive. Editorially asymmetric: a 7/5 hero split, figure plates with an off-centre metadata rail that alternates side, prose measure locked at 64ch against a wider grid. Above 6, asymmetry starts to read as "designed to impress", and a site that is trying to impress a skeptical reader about arithmetic has already lost. Below 4, it reads as a government form and nobody scrolls. 5 is the narrow band where the page looks made by a masthead rather than a template or a ministry.
- **MOTION_INTENSITY: 4**: The floor of the fluid band, and no higher. Exactly three motion primitives exist: a 160ms fade plus 4px rise on figure-plate entry (once, threshold 0.15), 120ms transitions on links, buttons, and focus rings, and a 60ms stagger across the 9 cells of the Fig. 5 matrix (once). That is the difference between a long scroll that feels alive and a PDF, and it is the maximum a numbers page can carry without the motion becoming salesmanship. Deliberately refused: chart line-draw (a line drawing itself implies performance, not measurement), odometer counters, parallax, scroll pinning or hijacking, sticky stacking, and any infinite loop. The baseline of 6 would have required justifying animation on a page whose whole argument is that nothing is being embellished.
- **VISUAL_DENSITY: 5**: Upper edge of the daily-app band. The chrome stays airy (96px plate gaps at desktop, prose at 64ch, generous leading) so a tired reader on a phone can finish a paragraph, while the plates themselves are dense: mono numerals, tables, hashes, six-line provenance strips. Density is earned by the data, not spent on page furniture. Deliberately refused: cockpit density (8+, hairline-separated everything) because it makes the site look like an internal tool, and gallery density (1-3) because it would starve the figures.

Restraint, stated explicitly, because it is the highest-risk judgement here: this spec spends its boldness on **provenance typography and the register system** and spends nothing on decoration. There is no hero image, no gradient, no glass, no icon illustration, no colour accent used ornamentally. All eleven permitted uses of colour are semantic (link, focus, computed series, band, deficit, ground, rule, text at three levels).

These three values are **page-level and describe the public surface**. The admin surface at `/admin` declares its own triple, `8 / 2 / 2` (§Admin Surface), as a local dialect of the same token system: density up, motion down, variance down. It is a different surface with a different job, not a second design system.

## Design System / Foundation

### Foundation

No official design system applies. GOV.UK and USWDS are wrong jurisdiction and wrong register (this is a publication, not a government service). Carbon, Fluent, Material, Primer and shadcn all carry a product-UI signature that would make a public-interest arithmetic site look like a SaaS dashboard. Honest label: **editorial / statistical-document aesthetic**, built on our own token layer.

| Concern | Decision | Install |
|---|---|---|
| Framework | Next.js App Router, server components by default | (already the project stack) |
| Styling | Tailwind v4 with `@theme` mapped onto CSS custom properties in `web/styles/tokens.css` | none extra |
| Component library | **None.** Native `<details>`, `<dialog>` (unused), `<select>`, `<table>`, `<figure>` cover every semantic need. No Radix, no shadcn. Fewer deps, and the whole surface is text, tables, and SVG. | none |
| Charts | No chart library. A small internal SVG primitive set, server-rendered from committed JSON. | none |
| Icons | `@phosphor-icons/react` (import from `@phosphor-icons/react/dist/ssr` in server components), weight `regular`, sizes 16 and 20 | `npm i @phosphor-icons/react` |
| Fonts | `next/font/google`: Instrument Sans, IBM Plex Mono, EB Garamond. Subsets `latin`, `latin-ext`. | none extra |
| Motion | CSS transitions only. No Motion, no GSAP. One `<Reveal>` client leaf (IntersectionObserver, `once`) wrapping plates. | none |

### Chart strategy

- Every chart is **static SVG rendered on the server** from `data/derived/*.json`. No canvas, no chart library, no client-side data fetching.
- Two server-rendered variants per chart: `chart--wide` (viewBox 1000 × H) and `chart--compact` (viewBox 360 × H'). CSS shows one, hides the other at 640px. Reason: an SVG that scales from 1000 to 360 shrinks a 13px axis label to 4.7px. Two variants cost about 15kB gzipped and remove the entire text-scaling and CLS problem. Both variants carry identical data.
- **Nothing is hover-only.** No tooltips, no crosshair readouts that exist only on pointer devices. Instead, each figure carries an always-visible **readout strip** above the plot (three to four labelled values in mono) and a **data table** below. Hover and focus add a thin vertical guide only, never new information.
- Path coordinates are rounded to one decimal at build time. Target budget: ≤ 18kB of inline SVG per figure, both variants combined.
- **Interactivity is navigation, disclosure, and selection:** anchor values link to their provenance panel, tables are `<details>`, and the Fig. 3 cohort selector is a set of links writing `?cohort=1980` (server-rendered, zero JS). See the departure note in the closing report.

### Page inventory and layout families

Sixteen blocks. Layout families are counted to satisfy the repetition rules.

| # | Block | Layout family | Player |
|---|---|---|---|
| 1 | Header (sticky, 64px, one line ≥1024px) | Utility bar | wordmark, 4 anchors, 5-locale switcher, theme toggle, snapshot stamp |
| 2 | Hero (7/5 asymmetric split, 96px top padding max) | Asymmetric Split Hero | statement + instrument panel |
| 3 | Source strip (one row, 5 official bodies, plain names in mono) | Attribution row | real institutions only, no invented logos |
| 4 | Register key (3 stacked rows, live samples) | Register Key list | teaches the taxonomy |
| 5 | Fig. 1 dependency ratio | Figure Plate A (rail left) | |
| 6 | Fig. 2 contribution cover | Figure Plate B (rail right) | |
| 7 | Fig. 3 cohort return | Figure Plate C (rail left, selector) | |
| 8 | Fig. 4 implicit debt | Figure Plate D (rail right, four-row ladder) | |
| 9 | Fig. 5 required base growth | Figure Plate E (full width, matrix + range) | the widest plate |
| 10 | Consensus | Prose register block | |
| 11 | Dispute | Two-column dossier inset | |
| 12 | Thesis | Signed panel inset | |
| 13 | Reproduce | Mono data block | |
| 14 | Assumptions ledger | Grouped chunks, 3 clusters | |
| 15 | Revisions | Mono changelog | |
| 16 | Footer (2 columns) | Footer | sources, statement, locales, no-tracking |

Families in use: 9 distinct. Eyebrow count: 3 (`Lo que no se discute`, `Lo que se discute`, `Nuestra lectura`) against 13 sections, budget `ceil(13/3) = 5`. Pass. `FIG. 0N` labels live inside `<figcaption>`, not above an `<h2>`.

Deliberate override, stated: five figure plates intentionally share one grammar. A statistical bulletin repeats its figure grammar so the reader learns the plate once and then reads five figures quickly. The variants differ structurally (rail side, chart form, readout placement, selector presence), not cosmetically. This is the one place the "one layout family per page" rule is overridden, and the reason is reader throughput on the content that matters.

No photography anywhere. No bento. No cards with shadows. No image-plus-text splits, so the zigzag cap cannot be violated.

### State model (shared vocabulary)

Every figure-plate component implements these states. They are the only permitted states; no ad-hoc spinners.

| State | Trigger | Visual | Copy slot |
|---|---|---|---|
| `current` | manifest valid, `fetchedAt` inside freshness window | normal plate, provenance strip in `--ink-3` | none |
| `null-value` | T3/T4/T5/T6 edge case resolves to `undefined` | `<NullPlate>`: 45° hatch of `--chart-null` over a 120px band, the mono reason string (`affiliates = 0`), formula id, table still rendered with the null cell reading `no definido` | `plate.null.<metricId>` |
| `stale` | snapshot outside freshness window (cannot reach production, T2 fails the build; exists for preview and for the post-deploy window) | page-level banner above the header, 3px `--data-deficit` left rule, mono, one line: snapshot date, window, and "no vigente" | `banner.stale` |
| `withheld` | manifest fails validation at runtime (should be impossible; exists so it can never render a bare number) | `<WithheldPlate>`: no chart, the reason, the failing field name | `plate.withheld` |
| `error` | route not found, or unsupported locale (AC-001-34) | typographic error shell: one sentence, the 5 locales listed as links, home link, `noindex` | `error.notFound`, `error.locale` |
| `focus` / `hover` | keyboard or pointer | 2px `--accent` ring, 2px offset; chart guide line 1px `--rule-2` | none |
| `reduced-motion` | `prefers-reduced-motion: reduce` | `<Reveal>` renders final state immediately, no transform, no stagger | none |
| `forced-colors` | `forced-colors: active` | series strokes `CanvasText`, hatch replaced by `stroke-dasharray` patterns, grounds `Canvas`; table unchanged | none |
| `print` | print | light token set forced, tables and provenance expanded, `<Reveal>` neutralised, figure `break-inside: avoid` | none |

There is no loading skeleton anywhere: every route is statically generated, so there is no loading state to design. If a streamed route is ever added, the skeleton is a plate-shaped block at the plate's exact aspect ratio, never a spinner.

This table describes the public surface only. The admin views declare their own state vocabulary in §Admin Surface (`running`, `noUpdate`, `no-changes`, `superseded`, `publishing`, `published`, `publish-failed`, `auth.lockedOut`, and the rest). The two vocabularies do not overlap, which is intentional: a public state word must never appear in an operator view, and the reverse.

### Mobile and performance direction

- **First paint already shows a number.** The hero value, its comparison strip, the snapshot stamp, and the hero sparkline's SVG path are all server-rendered HTML. LCP element is the hero numeral (a text node), so LCP is font-bound, not image-bound. `next/font` with `display: swap` and `adjustFontFallback` keeps CLS at 0.
- **Zero JavaScript for reading.** Charts, tables, provenance, prose, locale links, and the cohort selector all work with JS disabled. The only client components are `ThemeToggle` (about 300 bytes plus a blocking inline head script to avoid a flash) and `Reveal` (IntersectionObserver, one per plate, cleanup on unmount; it must never wrap content that carries information, only the visual transition).
- **Mobile charts.** Compact variant, fixed 220px (M1, M2), 260px (M3, M5), 200px (M4). Axis ticks are server-marked `data-tier="major|minor"` and minor ticks are hidden under 640px by CSS, so there is no re-render and no layout shift. The readout strip wraps to two lines. The table disclosure is promoted to a full-width secondary button directly under the chart, labelled with its row count (`Ver los 360 datos`).
- **Tables on mobile** scroll horizontally inside their own container (`tabindex="0"`, `aria-label`, visible focus) so the page body never scrolls sideways.
- **Budgets.** JS shipped to the client under 20kB gzipped for the whole site. Fonts: two weights of sans, two of mono, and the serif only on the route that renders the thesis (subset, italic plus regular, one size). No third-party scripts, no analytics beyond a cookieless counter disclosed in the footer, no consent banner because nothing is stored.
- **Core Web Vitals target:** LCP < 2.0s on 4G mobile, INP < 100ms, CLS < 0.02.
- **Print is a first-class target.** A reader may want to cite this. `@media print` forces the light token set, expands tables and provenance, hides the header controls, and prints the footer with the snapshot date and the site URL.

### Anti-patterns banned on this product

Each of these is a specific credibility failure, not a generic style preference.

1. Any alarm-red palette, red tickers, or "collapse" iconography. The deficit colour is a muted terracotta used on 2px marks only; large adverse areas are hatched, never filled red.
2. Stock photography of any kind: elderly people, empty chairs, piggy banks, hourglasses, handshakes, flags. `00-informal.md` names aggressive stock imagery as a crank signal.
3. All-caps headlines, underlined or bold-run emphasis for rhetorical stress, justified text, centred body prose.
4. Exclamation marks, rhetorical questions as headings, and any second-person accusation.
5. Animated counters or odometer numbers. Values are static, exact, and skimmable.
6. "Live" semantics: no ticking timestamps, no "actualizado hace 3 segundos", no pulsing dots. A snapshot is a snapshot.
7. Dark hero over a mesh gradient, glassmorphism, neon glows, purple or indigo anywhere.
8. Three equal cards, for the registers or for the five metrics.
9. Hover-only data of any kind.
10. Truncated provenance: no ellipsis on a timestamp, a hash, or a source URL. A shortened hash is a 12-character prefix followed by a copy control, with the full 64 characters in the DOM and in the reproduce table.
11. A single headline implicit-debt figure. Fig. 4's largest type is its rate labels, and no KPI strip sits above it.
12. Colour-only encoding, and red/green good-bad semantics on arithmetic. Every encoded value is also printed.
13. Em-dashes and en-dashes as separators in any UI string, caption, or quote attribution.
14. Silent locale fallback, machine-translated thesis prose, or an English string leaking into `es`.
15. Crank tells: superscript footnote clutter instead of citation chips, institution names in caps, "LA VERDAD" style banners, a "share this shocking number" bar.
16. Newsletter modals, exit-intent overlays, cookie-banner theatre, autoplay media.
17. Fake precision in examples or empty states. If a value is absent, say why.
18. A country switcher (T8 open question 2 resolves to Spain only; showing a disabled or single-option switcher is worse than none).

## Global Tokens

All values live in `web/styles/tokens.css` as CSS custom properties and are exposed to Tailwind v4 through `@theme`. No component may contain a literal colour, size, radius, or duration. The repo standard already forbids inline styles and hardcoded literals; these are the names to use.

### Type

```css
/* families */
--font-sans:  'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-mono:  'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace;
--font-serif: 'EB Garamond', Georgia, 'Times New Roman', serif; /* thesis statement only */

/* weights loaded: sans 400/500/600, mono 400/500, serif 400/400i */

/* scale (clamp: min, fluid, max) */
--text-display:  clamp(2.25rem, 4.6vw, 3.75rem);  /* hero h1, max 2 lines desktop */
--text-h2:       clamp(1.5rem, 2.1vw, 2rem);
--text-h3:       1.25rem;
--text-plate:    clamp(1.125rem, 1.4vw, 1.375rem); /* figure caption line */
--text-body-lg:  1.1875rem;  /* article prose */
--text-body:     1.0625rem;
--text-small:    0.9375rem;
--text-meta:     0.8125rem;  /* provenance, table captions, chips */
--text-micro:    0.75rem;    /* mono only, never body prose, min 12px */

/* numerals */
--text-num-xl:   clamp(2.75rem, 6.4vw, 5rem);   /* hero value only */
--text-num-l:    2rem;                          /* per-plate primary value */
--text-num-m:    1.25rem;                       /* readout strip */

/* leading + tracking */
--leading-tight: 1.04;   /* display, sans only */
--leading-snug:  1.18;   /* h2/h3 */
--leading-body:  1.62;   /* prose */
--leading-meta:  1.45;
--tracking-display: -0.018em;
--tracking-label:    0.06em;   /* the three register labels, mono */
```

Rules: every numeral on the site uses `--font-mono` with `font-variant-numeric: tabular-nums`, including numbers inside prose, tables, and captions. That is the instrument signature and it is also what makes columns align across locales. Italic is used in exactly one place (the thesis pull statement) and never inside a display headline, so the italic descender clearance rule has no other surface to violate. `hyphens: auto` with a correct `lang` attribute on every locale route.

### Space, grid, measure

```css
--space-1: 4px;  --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
--space-5: 24px; --space-6: 32px;  --space-7: 48px;  --space-8: 64px;
--space-9: 96px; --space-10: 128px;

--grid-max: 1240px;
--gutter: clamp(16px, 4vw, 32px);
--measure: 64ch;          /* prose, never wider */
--measure-wide: 78ch;     /* dispute columns */
--rail: 180px;            /* figure metadata rail, >=1280px only */
--header-h: 64px;
--touch: 44px;            /* minimum interactive box */

/* section rhythm */
--gap-plate: var(--space-9);      /* desktop */
--gap-plate-mobile: var(--space-7);
--gap-prose: var(--space-5);

/* breakpoints: 480 / 640 / 768 / 1024 / 1280 / 1536 */

/* z-index, systemic only */
--z-base: 0; --z-sticky: 20; --z-overlay: 40; --z-skip: 60;
```

Mobile collapse is explicit per block, not left to Tailwind defaults: every multi-column layout in the inventory declares its `< 768px` single-column form using `--gutter` and `--gap-plate-mobile`.

### Colour

Two token sets, one theme at a time, page-level lock. The page never inverts mid-scroll. Section grounds are steps within the same neutral family at low contrast, which is permitted; there is no light-to-dark flip.

```css
/* light (default) */
--surface-1:  #F4F5F2;   /* page paper */
--surface-2:  #ECEEE8;   /* dispute inset, figure plate ground */
--surface-3:  #E4E7DF;   /* thesis inset, mono/code blocks */
--ink-1:      #141A1B;   /* primary text, headings */
--ink-2:      #384446;   /* body secondary, captions */
--ink-3:      #5A6769;   /* metadata, provenance, axis labels */
--rule-1:     #C9CFC7;   /* hairline, decorative only */
--rule-2:     #A9B2A8;   /* stronger divider, decorative only, hover guides */
--accent:     #17564A;   /* links, focus, computed series. One accent. */
--on-accent:  #F4F5F2;   /* text on accent fills */
--data-deficit: #96472A; /* muted terracotta, 2px marks and small text only */

/* dark */
[data-theme='dark'] {
  --surface-1:  #0F1416;
  --surface-2:  #161C1E;
  --surface-3:  #1D2426;
  --ink-1:      #E9EDE8;
  --ink-2:      #B9C2BE;
  --ink-3:      #8D9A96;
  --rule-1:     #2A3335;
  --rule-2:     #3C4747;
  --accent:     #56B39A;
  --on-accent:  #0F1416;
  --data-deficit: #D08A63;
}

/* chart encoding (mapped from the above, per theme) */
--chart-series-1: var(--accent);          /* computed series */
--chart-series-2: #6E7A79;                /* comparison, projection (dark: #A8B3B1) */
--chart-ref:      var(--ink-3);            /* any line that carries meaning: 1.00, zero, g_proj */
--chart-grid:     var(--rule-1);           /* background scale only, carries no meaning alone */
--chart-band:     color-mix(in srgb, var(--accent) 12%, transparent);
--chart-band-edge:color-mix(in srgb, var(--accent) 40%, transparent);
--chart-hatch:    repeating-linear-gradient(45deg, transparent 0 3px,
                    color-mix(in srgb, var(--ink-1) 16%, transparent) 3px 4px);
--chart-null:     repeating-linear-gradient(45deg, transparent 0 5px,
                    color-mix(in srgb, var(--rule-2) 55%, transparent) 5px 6px);

/* register grounds (aliases, so a component never names a raw surface) */
--ground-instrument: var(--surface-1);
--ground-consensus:  var(--surface-1);
--ground-dispute:    var(--surface-2);
--ground-thesis:     var(--surface-3);
```

Encoding rules that go with the tokens:

- Any line that conveys information (the 1.00 break-even line, the zero baseline, the projected-growth marker) uses `--chart-ref`, which is `--ink-3`. `--rule-1` and `--rule-2` are below 3:1 by design and may only be used for separators and background scale, never as the sole carrier of a value.
- Adverse values are drawn as a hatch of `--chart-hatch`, not as a red fill. `--data-deficit` appears as a 2px rule, a 3px border, or small text at 4.5:1 or better.
- Every encoded value is also printed as a numeral. Colour and hatch are redundant encoding, never primary.

### Contrast verification

Computed WCAG 2.1 relative-luminance ratios for the pairs that actually occur. AA needs 4.5:1 for text, AAA 7:1; non-text graphical objects need 3:1.

| Pair | Ratio | Verdict |
|---|---|---|
| light `--ink-1` on `--surface-1` | 16.08 | AAA |
| light `--ink-1` on `--surface-2` | 15.05 | AAA |
| light `--ink-1` on `--surface-3` | 14.07 | AAA |
| light `--ink-2` on `--surface-1` | 9.21 | AAA |
| light `--ink-2` on `--surface-2` | 8.62 | AAA |
| light `--ink-3` on `--surface-1` | 5.36 | AA |
| light `--ink-3` on `--surface-2` | 5.02 | AA |
| light `--ink-3` on `--surface-3` | 4.69 | AA |
| light `--accent` on `--surface-1` | 7.78 | AAA |
| light `--accent` on `--surface-3` | 6.81 | AAA |
| light `--on-accent` on `--accent` (button) | 7.78 | AAA |
| light `--data-deficit` on `--surface-1` | 5.94 | AA |
| light `--data-deficit` on `--surface-2` | 5.56 | AA |
| light `--chart-series-2` on `--surface-1` | 4.06 | non-text 3:1 pass, and AA as text |
| dark `--ink-1` on `--surface-1` | 15.68 | AAA |
| dark `--ink-2` on `--surface-1` | 10.18 | AAA |
| dark `--ink-3` on `--surface-1` | 6.36 | AA (AAA margin at meta sizes) |
| dark `--ink-3` on `--surface-3` | 5.40 | AA |
| dark `--accent` on `--surface-1` | 7.34 | AAA |
| dark `--accent` on `--surface-3` | 6.24 | AA |
| dark `--on-accent` on `--accent` | 7.34 | AAA |
| dark `--data-deficit` on `--surface-1` | 6.62 | AA |
| dark `--data-deficit` on `--surface-3` | 5.63 | AA |
| dark `--chart-series-2` on `--surface-1` | 8.61 | AAA |
| light `--rule-1` on `--surface-1` | 1.45 | decorative only, never a value carrier |
| light `--rule-2` on `--surface-1` | 1.99 | decorative only, never a value carrier |

Focus ring is `--accent` at 2px with 2px offset: 7.78:1 light, 7.34:1 dark against the page, above the 3:1 requirement for non-text UI. Body prose clears AAA in both modes; `--ink-3` metadata clears AA everywhere it is used, which is the reason 13px is the smallest size permitted for it and 12px is mono-only, short-string-only.

### Radius, elevation, border, focus

```css
--radius: 0;                 /* every corner. No exceptions. No radius on chips, buttons, tables. */
--border-hair: 1px solid var(--rule-1);
--border-strong: 1px solid var(--rule-2);
--border-register: 4px solid var(--ink-1);   /* thesis left rule only */
--shadow: none;              /* no drop shadows anywhere; separation is rules and grounds */
--focus: 2px solid var(--accent);
--focus-offset: 2px;
```

Sharp corners are the shape-consistency decision and they are load-bearing: rounded 12-16px cards are the single most recognisable template signature, and this site cannot afford to look templated. A spreadsheet and a statistical bulletin are square.

### Theme, dark mode, print

- `Theme: auto` (system preference) with a 3-state toggle (system / light / dark) in the header, persisted in `localStorage`, applied by a blocking inline script that sets `data-theme` on `<html>` before paint. No flash, no layout shift.
- Dark mode is a genuine token swap, not an inversion. Charts re-map series to the lightened accent so line weight does not disappear on a dark ground; the plate ground stays a step above the page so strokes read.
- Contrast is verified in both modes (table above) and both modes are reviewed before the build is considered done.
- Print: light tokens forced, `--shadow` irrelevant, tables and `<details>` expanded (see T11), header controls hidden, footer retains the snapshot stamp and the canonical URL.

### Locale guidance

Five locales: `es` (primary, no prefix at `/`, canonical), `en`, `fr`, `de`, `it`. All Latin script, LTR, no RTL work in v1. Static routes per locale, `hreflang` and `x-default` to `es`.

**Text expansion against Spanish.** German +30 to +35%, French +15 to +20%, English -5 to -10%, Italian +5 to +10%. Budgets below are enforced as content-model validation, not as CSS guesses.

| Slot | es budget | de budget | Notes |
|---|---|---|---|
| `hero.statement` (h1) | 46 chars | 60 chars | Measured against 2 lines at `--text-display`. If de exceeds, the content is rewritten, not the type scale. |
| `hero.sub` | 90 chars / 20 words | 110 chars | Hard cap 20 words in every locale. |
| `hero.cta` primary | 24 chars, 2 words | 28 chars | Must not wrap at 1280px (see pre-flight) |
| `nav.item` | 14 chars | 18 chars | Nav must stay one line at 1024px in `de`; that is the binding constraint for all locales. |
| `fig.title` | 48 chars | 64 chars | Two lines maximum. |
| `fig.caption` finding | 110 chars | 145 chars | One sentence. |
| `plate.limit` | 120 chars | 160 chars | The "what this does not tell you" line. |
| `register.label` | fixed strings | translated | These three labels are the page's only eyebrows; they must remain 2 to 4 words. |
| `chip.source` | 34 chars | 44 chars | Chips may wrap to 2 lines. Never truncated. |
| `table.header` | 18 chars | 26 chars | Use `<abbr title>` for the long form; the abbreviation itself must be a locale key. |

**Number and date formatting.** One shared `formatValue(value, kind, locale)` and `formatDate(iso, locale)` built on `Intl`, used by readouts, tables, chart labels, provenance, and metadata. No `toFixed`, no string concatenation, no hand-written separators.

| | es | de | en | fr | it |
|---|---|---|---|---|---|
| Decimal | `0,53` | `0,53` | `0.53` | `0,53` | `0,53` |
| Thousands | `1.234.567` | `1.234.567` | `1,234,567` | `1 234 567` (narrow nbsp) | `1.234.567` |
| Percent | `4,2 %` (nbsp before) | `4,2 %` | `4.2%` | `4,2 %` | `4,2 %` |
| Currency | `1.234 €` (suffix) | `1.234 €` | `€1,234` | `1 234 €` | `1.234 €` |
| Date long | `1 de octubre de 2026` | `1. Oktober 2026` | `1 October 2026` | `1 octobre 2026` | `1 ottobre 2026` |

Currency values are integers in minor units internally (repo standard) and are rendered with `Intl.NumberFormat` at EUR's 2 decimals. Never round a monetary value for display. Percentages are rendered from the ratio with `Intl.NumberFormat(style:'percent', maximumFractionDigits:1)` unless the derivation fixes 2 decimals (T3, T4 require 2).

**Font coverage.** `latin` plus `latin-ext` covers every glyph these five locales require (ß, äöü, œ, àâçéèêëîïôùû, ñ, áéíóúü, ìò). No fallback font may ever render a figure: numerals are in Plex Mono for all locales precisely so a missing glyph cannot appear inside a number.

**Where text breaks a layout, and the answer.**

1. **`de` nav.** Four anchors plus five locale codes plus a theme toggle at 18-character labels will overflow 1024px. Answer: nav labels are separate short keys (`nav.figures`, `nav.method`, `nav.debate`, `nav.reading`) with an 18-character cap, the locale switcher uses 2-letter codes only, and the nav switches to the `<details>` index at 1024px, not at 768px, for `de` and `fr` only if measurement proves it necessary. The rule is a measured breakpoint, not a per-locale hack: one nav component, one breakpoint token `--nav-collapse`.
2. **`de` compound nouns in `<h2>`.** Hyphenation is enabled with `lang="de"`; `<h2>` has a 2-line budget and `text-wrap: balance`. A compound that cannot break within two lines is a content failure; the content model rejects it.
3. **`fr` dispute columns.** French is 15 to 20% longer and the dossier is two equal columns. At 1024px the columns are 46ch each; French quotes exceed 3 lines more often. Answer: the quote block caps display at 4 lines in `fr` with the full verbatim text in the citation panel, and the dossier collapses to one column below 900px rather than shredding into 30ch measures.
4. **`de` and `fr` figure titles** wrap to two lines where `es` fits one. The plate header is a flex area that grows; the chart's top margin is fixed, so nothing shifts. Titles are never truncated.
5. **`it` readout strip.** Italian percent labels (`al 2 per cento` style long forms) are avoided: readouts use the compact numeric form with the unit in the mono label, which fits every locale at 4 values per row.
6. **Currency position** in the euro readouts differs by locale (suffix in `es`, `de`, `fr`, `it`; prefix in `en`). Numerals are right-aligned with `tabular-nums`, so a prefix currency simply occupies the same right edge. Do not build a layout that assumes the symbol is on the left.

### Iconography

`@phosphor-icons/react`, weight `regular`, 16px inline and 20px in buttons. Seven icons total: `arrow-square-out` (source opens), `copy` (hash copy), `caret-down` (disclosure), `table` (data table), `info` (assumption), `translate` (locale), `sun`/`moon`/`monitor` (theme, 3 states). Decorative icons get `aria-hidden="true"`; icon-only buttons require an `aria-label` from a locale key. No illustration, no logo marks for other institutions (naming them is more accurate than reproducing their marks), no hand-rolled SVG except inside chart primitives.

### Admin tokens (added)

These are the only tokens added for the admin surface. Nothing above changes; the public palette is untouched.

```css
/* semantic state, admin only. No green anywhere: 'published' is neutral, not good. */
--state-pending:        #7A5310;   /* dark: #E0B25C */
--state-danger:         #8A2C1E;   /* dark: #E7907E */
--state-pending-ground: color-mix(in srgb, var(--state-pending) 10%, var(--surface-1));
--state-danger-ground:  color-mix(in srgb, var(--state-danger)  10%, var(--surface-1));

/* admin geometry */
--admin-max: 1440px;      /* wider than --grid-max: diff tables need columns */
--admin-row-h: 40px;      /* table row height, 56px on <768px */
--admin-gap: var(--space-5);
--operator-bar-h: 48px;
--diff-rule: 2px;         /* left rule marking a changed row */
--chip-h-sm: 24px;        /* status chips inside rows; public chips stay 32px */
--z-operator: 30;         /* between --z-sticky (20) and --z-overlay (40) */
```

Contrast for the added pairs (computed, WCAG 2.1): `--state-pending` 6.25 on `--surface-1`, 5.85 on `--surface-2`, 5.47 on `--surface-3`; `--state-danger` 7.80 / 7.30 / 6.83; dark `--state-pending` 9.45 / 8.77 / 8.02; dark `--state-danger` 7.68 / 7.13 / 6.52. `--ink-1` on either tinted ground is 10.97 or better in both themes. `--on-accent` on a `--state-danger` fill is 7.80 light and 7.68 dark. All pass AA, most pass AAA.

Usage boundaries, enforced at review:

- `--state-pending` and `--state-danger` are **never** used on the public site. `--data-deficit` is **never** used in admin. Two vocabularies, two surfaces, no overlap.
- Neither state colour is ever the only carrier of meaning: every state is also a word (`pendiente`, `fallo`, `en curso`, `publicado`) in `--text-micro` mono.
- The accent keeps its public meaning (interactive / computed) and in admin additionally means "operation running". It never marks approval or failure.

## Per-Task Directives

Shared across every rendering task: all strings resolve through locale keys (T8), all numerals use mono plus `tabular-nums`, no inline styles, no literal colours or sizes, every figure plate ends with a provenance strip (T1) and a data table (T11), and the plate's `<figcaption>` contains a one-sentence finding in plain declarative language with no evaluative adjective.

### Task 1: Derived-figure manifest (provenance record + reproduce path)

- Layout: **Provenance strip**, a full-width band directly under each figure, inside the `<figure>` element so it is part of the figure for assistive technology. Above it, a 1px `--rule-1` hairline. Grid: five labelled fields on one line at ≥1024px, two lines at 768 to 1023px, stacked at <768px. Field labels sit **above** their values in `--text-micro` mono (`--ink-3`), values in `--text-meta` mono (`--ink-2`). It must look like the specification plate on a measuring instrument, not like a footnote: generous 24px column gaps, no bullets, no icons except the two functional ones (copy, external).
- Components: `<ProvenanceStrip manifest>` (server), `<ProvenancePanel>` (a `<details>` disclosure under the strip, summary `Reproducir este dato`), `<HashChip>` (12-character prefix, `title` and `data-hash` carrying the full digest, a copy button with `aria-live="polite"` confirmation), `<FormulaChip>` (formula id, mono, 1px border, links to the methodology anchor for that id).
- Fields and their treatment, in order:
  1. `sourceUrl` rendered as the institution's short name plus a padlock-free external icon, one link per entry, `rel="noopener"`. Multiple sources appear comma-separated at desktop, one per line on mobile.
  2. `fetchedAt` rendered via `formatDate`, plus a `<time datetime>` element. Never abbreviated, never "hace 3 días".
  3. `formulaId` in a `<FormulaChip>`.
  4. `inputHash` in a `<HashChip>`, labelled `sha256` so the algorithm is visible.
  5. `reproducePath` as a link to the file on the repository at the deployed commit, mono, with the leading path in `--ink-3` and the filename in `--ink-1`.
- The panel contains: the exact command, the JSON pointer into `data/derived/`, the full 64-character digest, the freshness window, and the two lines of copy explaining what a changed hash means. Render as a `<dl>`, mono values, `--surface-3` ground, 1px border, no rounding. The command string is **derived from the manifest's `reproducePath`**, never authored in the component, so it cannot drift from what the compute script actually is.
- Type and tokens: `--text-micro` labels, `--text-meta` values, `--font-mono` throughout, `--space-5` column gap.
- States: `withheld` when a manifest fails validation (see the state model) so a figure can never render a bare number. There is no partial state: five fields or no plate.
- Motion: the panel opens instantly. A disclosure on provenance is not a moment for choreography.
- A11y: `<dl>` with real `<dt>`/`<dd>`; copy button announces success; the external-link icon is `aria-hidden` and the link text carries the institution name; the hash's 12-character prefix is `aria-hidden` with an `aria-label` reading the full digest, so a screen reader never hears a fragment as if it were the whole.
- Anti-patterns: footnote-style superscripts; grey 11px provenance with 1.9:1 contrast; collapsing provenance behind a tooltip; ellipsis anywhere; showing the hash without saying which algorithm.
- Watch items: do not let the strip wrap into an unlabeled run of text; five labelled fields at 768px is the realistic limit, so the two-line layout must keep each label attached to its value.

### Task 2: Build-time ingest and computation harness (visible surface only)

The fetcher and the arithmetic kernels are out of design scope. What has a surface:

- **Snapshot stamp** in the header, right-aligned before the theme toggle: mono, `--text-micro`, `--ink-3`, one line, `Datos: 1 oct 2026`. It is a `<time>` element with `title` giving the full ISO timestamp and the freshness window. At <768px it drops to a second header line (`--header-h` becomes 88px) rather than being truncated or hidden: hiding the date would be the single most damaging omission on this page.
- **Stale banner** above the header when `fetchedAt` is outside the window: `--surface-2` ground, 3px `--data-deficit` left rule, mono `--text-small`, two lines max. Copy states the date, the window in days, and that the figures below are "no vigente". No icon, no dismiss button (it cannot be dismissed; it is a fact).
- **Build-failure route.** The build fails before deploy (T2 AC-05 to AC-07), so there is no rendered error page in production. The route still exists for previews: the same typographic shell as the 404, naming the failing source and the metric it blocks. It must not display any number.
- **Reproduce table** (block 13) is the harness made visible: five rows, one per derived file, with formula id, snapshot date, full digest, and the command. Mono, `--surface-3`, row groups by metric, no hairline under every row (a single rule above each group). This is the section that proves AC-001-04 to AC-001-07 to a reader.
- States: `stale`, `error`. No loading state exists.
- Anti-patterns: "live" or "updating" language; a green "all systems operational" badge (backend health is not the reader's question); a spinner.
- Watch items: the stale banner must not push the hero out of the viewport by more than 40px; measure it at 1024 × 620.

### Task 3: Dependency ratio (metric 1, Fig. 1)

- Layout: **Figure Plate A**, metadata rail left. At ≥1280px, a 180px left rail holds `FIG. 01`, the formula id, and the source count, vertically aligned to the plot's top. The plot occupies the remaining width. At 768 to 1279px the rail collapses into a single meta line above the title. Below 768px everything is a single column.
- Chart form: **single-series monthly line**, x = `1996-01` to latest month, y = 0 to `ceil(max × 1.15)` at 0.10 steps. 2px `--chart-series-1` stroke, no area fill (a filled area implies magnitude; a ratio is a line), a 5px end dot, and the latest value labelled in `--text-num-m` mono at the right edge with 8px of clearance.
- Readout strip above the plot (always visible, no hover): three values in mono `--text-num-m` with `--text-micro` labels: latest month and value, the 10-year mean, and the value in `1996-01`. These three numbers are the finding, available without interaction.
- Annotations: at most two, each a 1px leader line plus a two-line label in `--ink-2` (date in mono, note in sans). Content-driven from locale keys, not authored in the component. Mobile shows one.
- Axis treatment: horizontal rules at 0.25 intervals in `--chart-grid`, labelled at the left in `--ink-3` mono 12px; x labels yearly at desktop, every 5 years at <640px via `data-tier="minor"`. No vertical gridlines.
- States: `null-value` when `affiliates = 0` for a month (render the month's point absent from the line and mark the gap with `--chart-null` hatch plus a one-line note, and the same month in the table reads `no definido`); `current` otherwise. The line must not interpolate across a null month.
- Clicks: the latest value opens the provenance panel for that figure; the `Ver los 360 datos` disclosure opens the monthly table; the source count in the rail jumps to the reproduce table row.
- Motion: plate entry only (fade plus 4px rise, 160ms, once).
- A11y: `<figure>` with `<figcaption>` carrying `FIG. 01`, the title, and the one-sentence finding; SVG `role="img"` with `aria-labelledby` pointing at the caption title and `aria-describedby` at the readout strip; table carries every monthly value.
- Anti-patterns: an alarm-red area fill; a "crisis begins" vertical marker line with a label like `EL COLAPSO`; interpolating across missing months; a legend for a single series (there is nothing to disambiguate).
- Watch items: 360 monthly points at 1000 units of width is 2.7 units per point; drop to a 4px step is invisible but the path string must not be rounded so hard that the line develops visible steps. Round to one decimal in viewBox units, not to integer pixels.

### Task 4: Contribution cover (metric 2, Fig. 2)

- Layout: **Figure Plate B**, metadata rail right (mirrors Fig. 1 for rhythm). Same construction otherwise.
- Chart form: **line crossing a reference**, annual, x = first available year to latest, y = 0 to `max(1.4, max × 1.1)`. The series is 2px `--chart-series-1`. The **break-even line at 1.00** is 1px `--chart-ref` (2px dashed, `stroke-dasharray: 6 4`) with the label `equilibrio 1,00` at the right end in mono 12px. Where the series sits below 1.00, the region between the series and the 1.00 line is filled with `--chart-hatch`. That hatched wedge is the whole argument of this figure and it is drawn without a single red pixel.
- Readout strip: latest ratio, the gap in euros for the latest year (mono, `formatValue` currency), and the number of years in the series that were below 1.00 (an integer, no percentage).
- Interaction beyond disclosure: none. Two series on two axes would be a lie; the euro amounts live in the readout and the table, not on a second axis.
- States: `null-value` when expenditure is 0 (NullPlate); a genuine 0.00 contributions year renders honestly with the hatch at maximum and the readout showing the gap, because that is real data.
- Clicks: `Ver los datos` table; the gap value links to the reproduce row for IGAE contributions; the `equilibrio` label links to the methodology definition of cover.
- A11y: the hatching is never the only carrier; the table prints both ratio and gap per year, and the caption sentence states the number of years below break-even.
- Anti-patterns: a red-filled deficit region; a "bankruptcy countdown" annotation; a dual axis for expenditure; a KPI card above the chart repeating the same number.
- Watch items: the hatch pattern at 1px scale can moiré on low-DPI screens. Test at 100% zoom on a 1366×768 display; if it shimmers, raise the stripe pitch from 3/4px to 4/5px rather than lowering contrast.

### Task 5: Cohort return, IRR with sensitivity band (metric 3, Fig. 3)

- Layout: **Figure Plate C**, rail left, plus a selector row under the title.
- Chart form: **return ladder**. One row per cohort (content-driven, minimum two, v1 uses four). Shared x axis in percent, from −2% to +8%, with a 0% reference line in `--chart-ref`. Per row: the 9 grid combinations of the sensitivity band rendered as 5px dots at 30% opacity in `--chart-series-1`, the `[min, max]` range as a 2px whisker with caps, and the central value as a 9px filled dot. The central value is also printed as a right-aligned mono numeral at `--text-num-m`. Rows are 56px apart with a single `--rule-1` line above the group, not between rows.
- Assumption chips directly under the ladder, in one row, each a `<button>` opening an inline `<details>` definition: `entrada 25`, `jubilación 65`, `14 pagas`, `esperanza de vida <n>`, `π 2,0 %`. These are the T5 and open-question assumptions and they must be visible next to the result, not in a methodology appendix (informal spec: do not hide assumptions).
- Selector: a `role="radiogroup"` of links (`?cohort=1980`), server-rendered, 44px tall, 1px border, radius 0, selected state = 1px `--accent` border plus `aria-current="true"`. Selecting a cohort swaps the driver table below (contribution, pension, life expectancy, years contributing, years drawing) which is a real `<table>`. Zero JavaScript.
- States: `null-value` when contributions are 0 (no finite IRR) and when `R = 0` (IRR = −1, which is a real number and renders as `-100,0 %`, not as null). The two cases must look different: −1 is data, null is not.
- Clicks: cohort selector; each assumption chip; `Ver los datos` table (cohorts × central, min, max, drivers).
- A11y: the ladder's dots are decorative; every value appears in the table and in the printed right-hand numerals. The radiogroup uses real links with `aria-current`, so it works with a screen reader and with the back button.
- Anti-patterns: a bar chart of IRR (bars imply a zero baseline and a magnitude that an internal rate of return does not have); a band drawn as a blurred gradient; hiding the drivers behind hover; presenting the central value without its band.
- Watch items: at four cohorts the ladder is 224px tall plus the assumption row; on a 640px-wide phone the printed numeral and the axis will collide. At <640px, move the printed numeral under each row's label and shorten the axis to −2%..+6% with 2% ticks.

### Task 6: Implicit debt across four discount rates (metric 4, Fig. 4)

- Layout: **Figure Plate D**, rail right, and the plate's largest type is the **rate labels**, not any debt value. There is no KPI strip above this figure, no hero treatment, and no single number in `--text-num-l` or larger. This is a hard constraint from T6 AC-25 and from the anti-pattern list.
- Chart form: **rate ladder**, four horizontal rows at 1%, 2%, 3%, 4%. Shared linear x axis in billions of euros from 0 to `ceil(max × 1.08)`. Each row: rate label left (mono, `--text-num-m`, `--ink-1`), a 24px-tall bar in `--chart-series-1` at 100% with no fill track behind it (a background track is dashboard clutter), the value right-aligned in mono `--text-num-l`. Below the four rows, separated by a single `--rule-1` line: one row for `Fondo de Reserva` drawn as a 24px bar on the same axis, which will be a sliver, preceded by the computed ratio in body text: `los activos equivalen al 0,4 % de la deuda implícita al 2 %`. Seeing the sliver is the point; the ratio sentence makes it exact.
- Negative values (assets exceed PV, AC-001-26): the bar extends left of a 3px `--ink-1` zero baseline, hatched with `--chart-hatch`, and the row is labelled `superávit`. Never clamped, never recoloured.
- Readout strip: the four values are already the chart. The strip instead carries the four `PV(obligations)` values with the asset line subtracted, in mono, so a reader can verify the subtraction themselves.
- States: `null-value` if the obligation stream is absent (NullPlate). The four rates are a fixed set: a partial set is a schema failure, not a visual state, so the component asserts exactly four keys and renders `withheld` otherwise.
- Clicks: each row opens its provenance panel (the discount rate is an assumption, so the panel must name where 1/2/3/4% comes from); the asset row links to the Fondo de Reserva source; the table.
- A11y: the bar is redundant with the printed numeral. Table = rate × [PV, assets, implicit debt], plus a total row.
- Anti-patterns: a single headline number anywhere on the page; a log axis that hides the order of magnitude; a red bar for the highest rate; a "€X trillion" callout in display type; comparing the four rates as if one were correct.
- Watch items: the four bars on a shared axis make the 1% bar about 30% longer than the 4% bar. That is honest and must not be "fixed" by normalising.

### Task 7: Required base growth (metric 5, Fig. 5, thesis carrier)

- Layout: **Figure Plate E**, full width, taller than the others (a deliberate 25% extra vertical space, because this is the figure the argument rests on), rail left. Two stacked components: the gap chart on top, the 3 × 3 sensitivity matrix below it at ≥900px, matrix first and chart second at <900px.
- Chart form, gap chart: a **range versus point** comparison on one axis in percent per year from −2% to +8%, zero marked with `--chart-ref`. `g_required` renders as a solid `--chart-series-1` bar from the band minimum to the band maximum (24px tall, no track) with a 2px `--ink-1` central tick; `g_proj` renders as a 3px `--ink-1` vertical marker spanning the plot height, labelled with its value in mono above the axis. The region between the central tick and the marker is filled with `--chart-hatch` and labelled `diferencia` with the numeric gap in `--text-num-l` mono. The hatching is bounded by two labelled rules, so the reader can see exactly which two numbers produce it. Caption language stays neutral: the caption names the two quantities, it does not name a conclusion.
- Matrix, 3 × 3: rows = `g_wage` ∈ {0,00, 0,01, 0,02}, columns = the T5 band {min, central, max}. Each cell contains the gap value in mono, right-aligned, plus the cell background stepped through a single-hue sequential ramp (accent at 0/10/20/30% mix). A `<caption>`-level note states that the shading is a scale aid and the printed numbers are authoritative. Cells are not interactive; there is no hover state.
- Assumption line under the figure, always visible: `r_paid_real 3,1 % · g_wage 1,0 % · g_proj -0,2 % · horizonte 2026-2070`, each value linking to its assumption ledger row (AC-001-31 requires exactly these four beside the value).
- States: `null-value` if the projection series is missing; `withheld` if the 9-cell grid is incomplete, because a partial sensitivity grid would misrepresent the band.
- Clicks: each of the four assumption values; `Ver los datos` (matrix as a real table with the same 9 values); a link from the caption to the dispute section (never to the thesis).
- Anti-patterns: a single `g_required` number in display type; an arrow or trend line implying a forecast; a "the system is doomed" annotation; a diverging red/blue colour ramp on the matrix; the thesis vocabulary in the caption.
- Watch items: nine mono numerals in cells at 640px will overflow. At <640px the matrix keeps three columns but drops to 13px numerals with `--space-2` cell padding, and the row labels move to a second line above each row rather than a left column. Verify no cell wraps.

### Task 8: Content model keyed by country and locale, i18n coverage

- Layout: no new layout. This task governs every string on the page, so its design surface is (a) per-locale budgets enforced as validation, (b) the locale switcher, (c) the unsupported-locale page.
- Locale switcher: five 2-letter codes in the header, each a real link to the corresponding route, 40 × 40px hit area, mono 13px uppercase-on-purpose-not (the label is a code, so it is not subject to the all-caps headline ban). Current locale marked with a 1px `--accent` bottom border and `aria-current="page"`. No dropdown, no JS, no flags. Flags for languages are wrong (one flag, one country, several languages) and are a credibility smell on a site about institutions.
- Unsupported locale: a full page in the shell, one sentence, the five valid locales as links, `noindex`, HTTP 404 status. Never a redirect, never a silent fallback.
- Number and date formatting: one shared formatter module, locale-aware, used everywhere (see Global Tokens). Any component that calls `Intl` directly is a defect; the formatter is the only entry point, and it is what the mutation and unit tests can pin.
- Type: no new tokens. The only locale-conditional token is the optional `--nav-collapse` breakpoint discussed under locale guidance.
- A11y: `lang` on `<html>` per route and on any quoted foreign-language passage; `hreflang` alternates; the switcher links carry the language name in their `aria-label` in the current locale's language (`Cambiar a alemán`), so a screen reader user is not read five bare codes.
- Anti-patterns: flags; a dropdown of languages; partially translated chrome ("Fuente" in an otherwise German page); machine-translated thesis prose (the thesis is the one place where translation must be human, and the design cannot police it, so state it here as a content rule); English fallback shown silently; a locale switcher that only works on the home route.
- Watch items: the five-code switcher plus the snapshot stamp plus four anchors plus the theme toggle is the width budget at 1024px. Measure in `de` before shipping; if it overflows, the nav collapses to the `<details>` index at 1024 for all locales, not just `de`.

### Task 9: Citation, attribution and contested-claim rendering

- Components: `<CitationChip>` (inline, mono `--text-meta`, 1px `--rule-2` border, radius 0, 32px min height, chevron after the label, `aria-expanded`), `<CitationPanel>` (inline `<details>`, `--surface-3` ground, `<dl>` with institution / document / table or series / date / page if applicable / URL), `<ContestedClaim>` (the dossier), `<Quote>`.
- Chip placement: immediately after the claim, at the end of the sentence, never as a superscript numeral. Reads `Fuente: AIReF, Proyecciones 2024` and wraps to two lines without truncation.
- Dossier: a two-column grid of equal `1fr` columns separated by a 1px `--rule-2` vertical rule, both columns top-aligned with identical type sizes and identical chip placement. Each position: the position's short name in `--ink-1` (`--text-h3`), the proponent as name plus role in `--ink-2`, the verbatim quote, the chip. Header row above the pair: the mono register label. No tint on either column, no ordering language like "however", no winner. Below 900px the rule becomes horizontal and the columns stack with identical treatment.
- Quotes: sans `--text-body-lg`, `--ink-1`, a 2px `--rule-2` left rule, and **not** the serif. The serif belongs to the site's voice only; a quoted economist must never look like the site speaking. Quotes display up to 3 lines at desktop; if the verbatim text is longer, show the opening with an explicit `[...]` marker and `Leer la cita completa` opening the full verbatim text plus the source. Truncation without the marker is banned.
- Unresolvable citation: nothing renders. The design requirement is that the *layout* must not betray this: dossier columns and prose blocks are generated from content arrays with `null` filtering, so no empty slot, no orphan rule, no "citation unavailable" placeholder ever appears. If a whole dispute block loses one position, the block does not render either, because a one-sided dispute is a false statement.
- A11y: `<blockquote cite="...">` with `<cite>` for the source; the chip is a `<button>` with `aria-expanded`/`aria-controls`; the panel is `aria-labelledby` the chip.
- Anti-patterns: superscript footnote numbers with a list at the bottom; "according to some experts"; a quote set in italics with no attribution; a source chip that is a bare domain name; a citation panel that is a modal overlay.
- Watch items: a citation panel inside a `<details>` inside a two-column dossier must not overflow the column at 900 to 1023px. Give the panel `overflow-wrap: anywhere` for long URLs and verify a 120-character URL does not blow the grid.

### Task 10: Thesis, dispute, agreement section structure

- Components: `<RegisterKey>` (block 4), `<AgreementSection>`, `<DisputeSection>`, `<ThesisSection>`. Each is a separate component with its own ground token; none shares a prose container with the metrics.
- `<RegisterKey>`: three stacked rows, each showing a live sample of its register (the first real item, not a mock): row 1 renders the provenance strip from Fig. 1 under a 1px rule; row 2 renders the two-column rule and one chip; row 3 renders the `--surface-3` ground with the 4px ink rule and the serif line. Each row also carries its mono label and a one-sentence explanation. This block exists so the taxonomy is learned before it is needed.
- `<AgreementSection>`: `--surface-1`, prose at 64ch, no border, mono label `Lo que no se discute`. Every claim carries a `<CitationChip>`. No tint and no panel, because agreement is the default register and marking it heavily would make it look like a position.
- `<DisputeSection>`: full-bleed `--surface-2` inset with 1px `--rule-1` top and bottom, mono label `Lo que se discute`, then one or more dossiers. The inset is the marker: crossing into it must feel like entering a different room, and it must be obvious on a greyscale printout.
- `<ThesisSection>`: full-bleed `--surface-3` inset, 4px `--ink-1` left rule, mono label `Nuestra lectura`, then (in order) the disclaimer line in `--text-small` sans (`Esto es nuestra lectura. No es un resultado del cálculo.`), the thesis statement in `--font-serif` italic at `clamp(1.5rem, 3vw, 2.125rem)` with `--leading-body`, then two or three short paragraphs in sans, then a signature block (name, role, link to the biography page) and the figure links it rests on (`FIG. 03`, `FIG. 05`). The serif appears here and nowhere else on the site.
- Motion: none in any of the three. In particular the thesis does not fade, slide, or reveal on scroll. Deliberate.
- A11y: each section is a `<section aria-labelledby>` with a real `<h2>`; the mono label is part of the heading structure (`<p>` with `aria-hidden="false"` above the `<h2>`, or the label folded into the `<h2>` as a `<span>`, whichever the Coder picks, as long as the heading outline never reads "Lo que se discute" twice); the contention is conveyed by the label text, not by the rule or tint.
- Anti-patterns: the fraud reading appearing in a figure caption, a meta description, an OG image, a nav label, or an aria-label; a thesis section that visually rhymes with the figures; the dispute rendered as a debate with a verdict; agreement rendered as a wall of quote cards; any transition animation between registers; the thesis panel using the accent colour as its rule (it uses ink, so the accent stays reserved for interactive and computed semantics).
- Watch items: three full-bleed tinted insets in a row can start to look like the page is alternating themes. Keep the tints within 4 to 6 lightness points of the page paper (as specified) and keep the vertical gaps between them at `--space-9`; verify on a greyscale screenshot that the three blocks still read as distinct.

### Task 11: Accessibility, non-visual data for charts

- Component: one shared `<DataTable>`, server-rendered, used by all five figures. It is the accessible representation and it is designed, not appended.
- Structure: `<details>` with a `<summary>` styled as a full-width secondary control (44px, 1px `--rule-2`, radius 0, caret icon, label from a locale key plus the row count, e.g. `Ver los 360 datos`). Closed by default at every breakpoint, so there is no hydration-dependent state. The table is present in the DOM when closed.
- Table design: `<caption>` always rendered, visible, `--text-micro` mono, `--ink-3`, containing the metric name, unit, source, and formula id. `<thead>` with `position: sticky; top: 0` on `--surface-2`. Numeric cells right-aligned, mono, `tabular-nums`. Row groups by decade or year via `<tbody>` with `<th scope="rowgroup">`. Exactly one hairline above each `<tbody>`, none between rows. Zebra striping is banned; a 300-row striped table is a migraine.
- Null cells read `no definido` in `--ink-3` italic-free sans, never `0`, never `-`, never empty.
- Scrolling: at <640px the table sits in a container with `overflow-x: auto`, `tabindex="0"`, and an `aria-label` naming the table, so a keyboard user can scroll it. The page body never scrolls horizontally.
- Chart pairing: `<figure>` contains `<figcaption>` (the finding sentence) and the SVG with `role="img"`, `aria-labelledby` the caption title, `aria-describedby` the readout strip. The SVG is a redundant visual: nothing exists in the SVG that is not in the caption, the readout, or the table. A text-only render of the page must still deliver every number and every claim.
- Second table for Fig. 1: a five-column annual summary table appears *above* the monthly table inside the same disclosure, because 360 monthly rows are navigable but not readable. The annual summary is derived, labelled as such, and does not replace the monthly data.
- Motion and contrast: `prefers-reduced-motion` removes plate entry and the matrix stagger. `prefers-contrast: more` raises series stroke to 3px and hatch mix to 30%. `forced-colors: active` maps series to `CanvasText` and replaces hatch with `stroke-dasharray` patterns.
- Anti-patterns: an `aria-label` on the SVG that only says "chart"; an sr-only table that is technically present but styled as a 1px clipped box with no `<caption>`, `<th>`, or scope attributes; a table that omits the null months; a "download CSV" link offered instead of an accessible table (the CSV is welcome in addition, never instead).
- Watch items: `<details>` content is not exposed to some assistive-technology search-in-page implementations until opened. That is acceptable per AC-001-45 (present in the DOM with an accessible name and the same values) but the summary label must therefore be explicit and the table must never be inside a JS-only disclosure.

### Page shell (not owned by a task, must still be built)

The eleven tasks own the data, the registers, and the tables. The shell that carries them is specified here so the Coder does not invent it. Everything below is server-rendered.

- **Header**, 64px, sticky, `--surface-1` at 97% with a 1px `--rule-1` bottom rule (no blur, no glass, no shadow). Single row at ≥1024px: wordmark (text, not a logo mark, `--font-sans` 600 at 17px, lowercase, no tagline) then the four anchors then the snapshot stamp, the locale codes, and the theme toggle, right-aligned. At <1024px: wordmark, snapshot stamp, and a native `<details>` "Índice" disclosure containing the anchors and the locale codes. No hamburger icon animation, no drawer, no JS. `--header-h` becomes 88px at <768px because the snapshot stamp takes its own line.
- **Hero**, `padding-top: var(--space-9)` and never more (96px, the skill's cap is 96px at desktop), `min-height: calc(100dvh - var(--header-h))` on ≥768px only, never `h-screen`. Grid 7/5 with a `--space-8` column gap. Left column: `<h1>` at `--text-display` (2 lines maximum at 1280px, 3 at 360px), a `<p>` subtext capped at 20 words, then one primary link-button (`--accent` fill, `--on-accent` text, 48px tall, 2-word label, radius 0) and one secondary text link. That is the whole stack: no eyebrow, no tagline under the CTAs, no trust strip, no scroll cue.
- **Hero instrument panel** (right 5 columns): `--surface-2` ground, 1px `--rule-1` border, radius 0, `--space-5` padding. Contents in order: a mono micro label naming the ratio, the latest value in `--text-num-xl` mono, a three-row comparison strip (`1996`, `2010`, `último`) each with a mono value, a 96px-tall sparkline of the last 30 years (no axes, single 2px `--chart-series-1` stroke, the last point dotted and labelled), then a footer line at `--text-micro` with the snapshot date and the source link. This panel is the first paint's LCP context and it must not depend on JS: the sparkline path is inlined at build time.
- **Viewport-1 budget** (measured at 1280 × 800 and 390 × 844): header 64 + hero top padding 96 + h1 (2 lines, 120) + subtext (2 lines, 60) + CTA (48) + gaps (64) = 452px of the left column, so the panel and the first scroll hint sit inside the fold at 800px. At 390 × 844 the panel stacks under the CTAs and may fall below the fold; the h1, subtext, CTA, and snapshot stamp must all be visible without scrolling.
- **Source strip** (block 3): one row, `--text-meta` mono, `--ink-2`, the five official bodies as plain names, each a link to the exact series, separated by `--space-5` gaps and no dot separators, followed by the "cómo lo calculamos" link. Plain names rather than logo marks: reproducing an institution's mark implies an affiliation this site does not have, and the name is the accurate citation.
- **Reproduce block** (block 13): `--surface-3` ground, mono throughout, five row groups by metric, each row showing formula id, snapshot date, the full 64-character digest (wrapping, never truncated), and the command. A `<copy>` control per digest. This block is deliberately the most "terminal" surface on the site and is the one place where a dense 13px mono table is the correct answer rather than a compromise. Below 768px each row becomes a labelled stack (label above value), and a 64-character digest is allowed to wrap at any character with `overflow-wrap: anywhere`; the block never scrolls sideways.
- **Assumptions ledger** (block 14): three labelled clusters (`Cohorte y pagas`, `Tipos y crecimiento`, `Datos y ventanas`), each a `<dl>` of name, value, and one-sentence consequence. One `--rule-1` above each cluster, nothing between rows. Every assumption named in T3 to T7 and in `10-tasks.md` open questions 3 to 7 must appear here, and every figure that depends on one links to its row. Below 768px each cluster's `<dl>` is already single-column; only the cluster gaps shrink to `--space-6`.
- **Revisions** (block 15): a `<ol>` of the last five snapshot changes, each `fecha · qué cambió · hash anterior`, mono. This is the site publishing its own error record, which is the cheapest credibility in the design and the most commonly omitted.
- **Footer** (block 16): two columns at ≥768px, single column below with the source list first and the statement second. Left: full source list with official URLs, then the licence and the locale links. Right: a short "what this site does not claim" paragraph in `--text-body` (not legalese), the no-tracking statement, a real contact, and the canonical URL plus snapshot date for citation. One `--rule-1` above. No version string, no build stamp, no social icons row.
- States: `stale` banner sits above the header and pushes the whole page by its own height; everything else is `current`.
- A11y: skip link to `#main` as the first focusable element, `<header>`/`<nav>`/`<main>`/`<footer>` landmarks, one `<h1>` per page, the hero panel's sparkline `aria-hidden` because the three comparison values carry it.
- Anti-patterns: a hero image; a gradient behind the hero number; a "scroll" cue; a cookie banner; a language dropdown; a logo mark drawn by hand; a tagline under the CTA; a version footer.
- Watch items: the hero panel's three-value strip plus sparkline is the only decoration this design permits, and it earns its place by carrying real values. If the data for the sparkline is missing, the panel renders the value and the strip without a chart, and does not substitute a placeholder line.

### Task 12: Admin authentication

- Layout and views: **Login** (§Admin Surface). Routes `/admin/login`. One field, no username, 360px column, top-offset `--space-9`, no card.
- Components: `<AdminShell>`, `<OperatorBar>`, `<LoginForm>`, `<LockoutPanel>`, `<SessionExpiredPanel>`, `<AdminError kind requestId at />`.
- Type and tokens: `--text-h3` title, `--text-body` labels, `--text-meta` for the lockout timer and the request id, `--state-danger` for the failure line and the lockout rule. No new tokens beyond those in §Admin tokens.
- Motion: none. A failed attempt re-renders the same form; the field keeps focus. No shake, no red flash, no toast.
- A11y: the error line is `role="alert"` and is the first thing after the `<h1>`; the lockout panel replaces the form so there is no focusable control left inside it; the password field keeps `autocomplete="current-password"` and is never re-populated after failure; `aria-describedby` links the field to the error line. Touch targets 44px.
- Anti-patterns: a username field (it creates the oracle AC-46 exists to close); a "remember me" checkbox; a password-reveal toggle (its only value is typo recovery on a single-operator surface; its cost is a shoulder-surfing affordance); a "forgot password" link (there is no recovery path, so the link is a dead end that hints at an account system); an attempt counter ("2 de 5"); a per-identity error message; an error toast; redirecting a failed login back to `/admin` with a flash message.
- Watch items: the login page must render no session-bearing markup and no operator bar, because an operator bar implies a session. Session expiry is a page state, not a toast: any admin action returning 401 replaces the body with `<SessionExpiredPanel>` and the login link carries **no** return path (a `next=` parameter is an open-redirect vector and is not needed on a single-operator surface).

### Task 13: Fail-closed configuration

- Layout and views: **503 unconfigured** (§Admin Surface). Applies to `/admin` and every admin API route, with the same body.
- Components: `<ConfigClosedPanel>` rendered as the entire page. Critically: it renders **no form element of any kind**. That absence is the design signal that separates a configuration fault from an authentication failure.
- Type and tokens: `503` in `--text-num-l` mono `--ink-2` (not `--text-num-xl`: a giant error code is a consumer error page), title in `--text-h2`, body in `--text-body` at `--measure`, diagnostic row in `--text-micro` mono, plus a 4px `--state-danger` left rule and a mono `CONFIG` chip.
- Motion: none.
- A11y: `<h1>` names the fault; the diagnostic row is a `<dl>`; no `role="alert"` (this is a page, not an announcement).
- Anti-patterns: naming `ADMIN_PASSWORD_HASH` or the session secret (AC-56 forbids it, and the panel gives a request id instead so the operator correlates with server logs); "are you sure your password is right?"; a disabled login form; a retry button; a contact-the-administrator link that goes nowhere; a 500 page instead of 503; a stack trace.
- Watch items: the 503 body must be byte-identical for a missing password hash and a missing session secret. If the two cases render different copy, an attacker learns which secret is absent. The 503 response must also escape the admin root layout entirely: no operator bar, no session affordances, no navigation, because chrome implies a working surface behind it. `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store` on the 503, not only on the 200 paths.

### Task 14: Refresh trigger and pending revision

- Layout and views: **Panel home**, **Refresh in progress**, **Pending revision review**, **Approval and publish** (§Admin Surface).
- Components: `<PublishedRevisionBlock>`, `<RefreshButton>`, `<RunProgress stages>`, `<StageRow>`, `<ReviewTable figures>`, `<BlastRadius figures>`, `<FigureDiffRow>`, `<PublishConfirm revision>`, `<StatusChip state>`.
- Type and tokens: table numerals in `--font-mono` `tabular-nums` at `--text-body`; row height `--admin-row-h`; changed rows carry a `--diff-rule` left rule in `--state-pending`; unchanged rows are dimmed to `--ink-3`, never hidden by default; status chips `--chip-h-sm`; primary action fills `--accent` at 44px.
- Motion: 120ms state transitions only. No progress shimmer, no row highlight animation, no animated delta numbers. The in-progress indicator is a 2px linear indeterminate bar plus a text stage line, gated by `prefers-reduced-motion`.
- A11y: the review table is a real `<table>` with `<caption>`, `<th scope="col">`, and a per-row `<th scope="row">` naming the figure; the blast-radius sentence is the first paragraph after the `<h1>` and is not in a callout that a screen reader could skip; stage rows are an `<ol>` with the state word in text; the approve flow's checkbox is a real `<input type="checkbox">` with a visible label.
- Anti-patterns: red/green diffing of numeric changes (a rising dependency ratio is a change, not a failure, and colour would train approval by hue); a summary card ("5 figures updated") as the primary artifact instead of the per-figure table; inline editing of any value (the admin never edits a computed figure); auto-approval on timeout; an approve button that is present when the diff is empty or the revision is superseded; rendering an upstream error body or workflow log tail (it can carry credentials; mirrors `docs/SECURITY.md` on upstream error responses).
- Watch items: the approve control must exist only inside a rendered review page. The review route mints a server-side `reviewToken` bound to the revision id; the approve form carries it as a hidden input and a POST without it is rejected. That is what makes "the operator saw the diff" a property of the system rather than a hope, and it means no URL can publish.

### Task 15: Parameter proposals

- Layout and views: **Parameter proposal review** (§Admin Surface). Distinct surface from the figure diff: a *rule* change, not a value change.
- Components: `<ProposalReview proposal>`, `<RuleDiff before after>`, `<BlastRadius kind="parameter" figures>`, `<CitationBlock>` (the T9 `<CitationChip>` and `<CitationPanel>`, unchanged), `<RejectProposal>`.
- Type and tokens: parameter name in `--text-h3`; the rule diff as two full sentences in `--text-body-lg` with the changed numerals in mono; the blast-radius block on `--state-danger-ground` with a 3px `--state-danger` left rule; the machine-provenance line in `--text-micro` mono `--ink-3`; the citation quote in sans `--text-body-lg` with a 2px `--rule-2` left rule (never the public serif, which belongs to the site's own voice).
- Value shapes, rendered honestly: integer (`14`), range (`1.200,00 € - 4.720,50 €` with a hyphen, never an en-dash), enumerated choice (the option's label plus its identifier in mono). Never render a parameter as a bare JSON value.
- Motion: none.
- A11y: the rule diff is a `<dl>` of `antes`/`ahora`; the blast radius is prose, not a chart; the citation is `<blockquote cite>` with `<cite>`; the reject reasons are a real radio group with a legend.
- Anti-patterns: presenting a parameter proposal in the figure-diff table (it would imply a one-figure blast radius); auto-approving; showing a proposal as a diff of numbers rather than a diff of rules; hiding the machine origin of the proposal; an "unsupported proposal" card in the UI (out-of-set proposals are rejected server-side and appear only in the audit log, and a UI representation would imply the UI can handle them); a reject control that is a one-click button with no reason (the reason is what the audit log needs).
- Watch items: a parameter proposal that reaches approval must not be publishable in one step. Approving the parameter commits the rule; the *publication* that follows requires a re-computation and a second, separate figure review (§View: parameter proposal review). If the implementation collapses those into one action, the blast-radius design has been defeated and the reviewer will not see which figures moved.

### Task 16: Audit log

- Layout and views: **Audit log** (§Admin Surface). Route `/admin/audit`, server-rendered, filterable by GET.
- Components: `<AuditTable entries>`, `<AuditRow>`, `<FilterForm>`, `<ChainStatus verifiedAt>`, `<CopyControl>`.
- Type and tokens: rows at `--admin-row-h`, `--text-body` for action and target, `--text-meta` mono for timestamps and request ids, `before → after` in mono with right-aligned numerals so a scan down the column reads.
- Motion: none.
- A11y: `<caption>` states the filter in force and the entry count, so a filtered view cannot be mistaken for a complete one; `<th scope="col">` on every column; pagination links are `<a>` with `rel="next"`/`rel="prev"`; the filter form has visible labels and a submit button (no auto-submit).
- Anti-patterns: edit, delete, or bulk-select affordances of any kind (the table component accepts no `actions` prop, so it is structurally incapable); highlighting failed-authentication rows in `--state-danger` (a red wall trains an operator to ignore red, and it hands an attacker who reaches the log a visual signal); infinite scroll; relative timestamps ("hace 3 días") in place of the absolute time; rendering the attempted credential (AC-66), the request body, or any header value.
- Watch items: chain verification is displayed as a claim with a timestamp (`cadena verificada hasta <ISO>`) or as `sin verificar` in `--state-pending`. Never display "verified" without the verification's own timestamp, because an unverifiable claim in an audit log is worse than no claim.

## Admin Surface

A utility surface, not a marketing surface. `/admin` is an instrument panel where a wrong click corrupts a public claim, so every decision below is scored on: can the operator see exactly what will change, and can they avoid changing it by accident.

### Dial dialect and register marker

`DESIGN_VARIANCE 2`, `MOTION_INTENSITY 2`, `VISUAL_DENSITY 8`, applied to the admin root layout only.

- **Variance 2**: symmetric grid, aligned columns, no offsets, no asymmetry. A dashboard that decorates is a dashboard that hides things.
- **Motion 2**: 120ms transitions on focus, hover, and disclosure. One indeterminate 2px bar for a running job, disabled under `prefers-reduced-motion`. Nothing else moves.
- **Density 8**: `--admin-gap` instead of `--space-6..9`, 40px rows, 1440px max width, hairlines above groups only, and mono numerals everywhere (already a global rule, and here it is load-bearing).

**Register marker: inverted chrome.** The admin root renders an `<OperatorBar>`: 48px tall, `--ink-1` ground with `--surface-1` text (so it inverts automatically in both themes), sticky, `--z-operator`. Left: a mono wordmark `administración` and the environment (`producción` or `previsualización`). Right: the session expiry as an absolute local time (`caduca 14:32`, mono), the snapshot the panel is currently showing, and `Salir` (a POST form, never a link, so a prefetch cannot sign the operator out).

The inverted bar is deliberately not the public site's 4px ink rule (which marks the thesis). Two registers must not share one device. An operator glancing at any admin screenshot sees a solid dark band across the top and knows immediately this is not the public page.

Admin is a separate root layout (`app/admin/layout.tsx`), not a section of the public page, so the public page's theme lock is not in play. The bar is inverted in both themes, once, at the top, and never mid-page.

**Locale**: Spanish only, `lang="es"`, no locale switcher, no hreflang. One operator, one identity. The T8 no-hardcoded-strings rule still applies: admin strings live in an `admin` namespace of the same locale resource system. A shared component that emits a locale link is a defect in admin.

**Routes**: `/admin` (home), `/admin/login`, `/admin/revisions/[id]`, `/admin/proposals/[id]`, `/admin/audit`, `/admin/refresh/[runId]`. Every one carries `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store`.

Structurally, two route groups: an **unauthenticated group** (`/admin/login`, and the 503 which escapes the admin layout entirely) that renders no operator bar and no navigation, and an **authenticated group** that renders the operator bar. The 503 is not a page inside the admin layout; it is the response instead of it (T13).

**Status chips.** `<StatusChip>` is admin-only and its `state` is a closed union of six: `published`, `pending`, `running`, `changed`, `superseded`, `failed`. Each renders a `--chip-h-sm` box with a 1px border and the state word in `--text-micro` mono; `pending` and `failed` additionally take `--state-pending` and `--state-danger` text and border. The word is always present, so the chip is never a colour-only signal.

### View: 503 unconfigured

Purpose: tell an operator the surface is closed for a configuration reason, without teaching anyone anything about credentials.

Geometry: single column, `--measure`, `--space-9` top offset, left-aligned, `--surface-1`. A 4px `--state-danger` left rule runs the height of the content block. No header, no operator bar (there is no session and no configuration, so pretending to have chrome would be misleading).

Contents, in order:
1. A mono chip `CONFIG` in `--state-danger`.
2. `<h1>` = `Administración no configurada`.
3. One paragraph: the surface is closed because the deployment's administrative configuration is incomplete, and no one can enter until it is completed at the deployment. No key names, no values, no hint about what kind of credential exists.
4. A mono `<dl>`: `petición` (request id, copyable), `hora` (ISO 8601 UTC), `estado` (`service unavailable`).
5. A single text link back to the public site.

What makes it unmistakably a configuration fault and not a login error: there is **no form**, no field, no button, no retry, and the only actionable token is a request id, which is the artifact you hand to whoever owns the deployment. A login failure always leaves you a way to try again; this page deliberately does not.

Anti-patterns: naming the env keys (AC-56); a greyed-out form; "contact your administrator to reset your password"; a 500; a generic "something went wrong"; an illustration.

Watch items: identical body for a missing password hash and a missing session secret. The 503 also escapes the admin layout entirely: no operator bar, no navigation, no session affordances, because chrome implies a working surface behind it. `no-store` and `noindex` on the 503 response itself.

### View: login

Geometry: 360px column, horizontally centred in a 1440px `--admin-max` canvas, `--space-9` from the top of the content area. Not vertically centred: a login floating in the middle of a tall empty viewport reads as a consumer app, and this surface should read as an instrument.

Contents: `<h1>` `Acceso` in `--text-h3`; label `Contraseña` above a single `type="password"` input (`autocomplete="current-password"`, 44px, 1px `--rule-2`, focus ring `--accent`); one primary button `Entrar` full width, 44px, `--accent` fill; nothing else. No logo, no illustration, no tagline, no secondary links, no footer.

States:

| State | Rendering |
|---|---|
| initial | field focused on load, no error, no message |
| `auth.failed` | one line above the field in `--state-danger`, `role="alert"`: `No se ha podido iniciar sesión.` Field cleared, refocused, no counter, no attempt number |
| `auth.lockedOut` | the form is **replaced** by `<LockoutPanel>`: `--surface-2` ground, 3px `--state-danger` left rule, `<h2>` `Acceso bloqueado temporalmente`, body naming the scope (`desde esta red`), the remaining time in `--text-num-m` mono, and one line `El bloqueo se libera automáticamente.` No field, no button, no link except the public site |
| `auth.rateLimitedGlobal` | same panel, body says the limit is global (`para todo el servicio`), because the operator must not think their own IP is at fault when it is not |
| `session.expired` | `<SessionExpiredPanel>` rendered in place of the admin body on any 401: one sentence, a primary link to `/admin/login`, no return path |

Why this is not an oracle: with **no username field**, "unknown user" is not expressible, so the wrong-password response and every other credential response are the same response (AC-46 is satisfied structurally, not by copy discipline). There is no attempt counter before the threshold. The lockout panel reveals only the rate limiter's own state, which the attacker could already measure from the response delay, and it names the scope so a legitimate operator is not misled. The page never distinguishes "configured but wrong" from anything else; the configuration case is a different route with no form at all (T13), and it is only reachable when the whole surface is closed, so it cannot be probed with a credential.

Never persisted: no `localStorage`, no `sessionStorage`, no "remember me", no autofill of the field after failure, no credential in any URL or query string, no credential in the audit log. The only artifact is the `HttpOnly` session cookie, which client code cannot read.

### View: panel home

Purpose: answer three questions in one screen. What is published, how old is it, and what can I do.

Contents, top to bottom:

1. **`<PublishedRevisionBlock>`**, full width, `--surface-2` ground, 1px `--rule-1`, radius 0, `--space-5` padding, no shadow:
   - `PUBLICADO` mono label, `--text-micro`, `--ink-3`, plus a `<StatusChip state="published">`.
   - The revision id in `--text-h3` mono (`rev 2026-10-01.3`).
   - A definition list: `hora` (absolute, `<time>` with full ISO in `title`), `commit` (12-char prefix in mono plus copy, linking to the commit), `figuras` (`5`), `snapshot` (`2026-10-01`, `hace 12 días` as a secondary qualifier only, never as the primary value), `ventana` (`45 días`), `hash` (the derived snapshot digest, 12-char prefix plus copy).
   - Two links: `Ver en el sitio` (opens the public figure in a new tab, `rel="noopener"`) and `Ver el registro` (filtered audit view for this revision).
2. **The single primary action**: `Solicitar actualización`, `--accent` fill, 44px, full width on mobile, left-aligned at desktop. Directly beneath it, one line in `--text-small`: `Se ejecuta el cálculo en GitHub Actions y se crea una revisión pendiente. Nada se publica hasta que la apruebes.` That sentence is the whole safety design of this screen: it names the blast radius before the click.
3. **Pending work**, one table: `Tipo | Creada | Figuras | Estado`, rows for pending revisions and parameter proposals, each row a link to its review. Hairline above the group only.
4. **Empty state** for pending work: one line, `No hay revisiones pendientes.` plus `Comprobado a las 14:02.` No illustration, no encouragement.
5. Audit link at the bottom of the content, as a text link, because it is reference material rather than an action.

If a pending revision already exists for the current source snapshot, `<RefreshButton>` renders disabled (44px, `--rule-2` border, `--ink-3` label) with a one-line reason: `Ya existe una revisión pendiente para este snapshot.` The UI enforces the intent of AC-59 instead of letting the operator discover it as an error.

Anti-patterns: KPI cards, sparklines, a "system healthy" badge, a chart of anything, a welcome message with the operator's name and time-of-day, a notification bell.

### View: refresh in progress

Purpose: the job runs elsewhere (GitHub Actions) and takes minutes. The operator needs to know what is running and to be able to leave without cancelling.

Contents:
1. `<h1>` `Actualización en curso`, plus `<StatusChip state="running">`.
2. A definition list: `despachada` (absolute time), `ejecución` (run id, mono, copyable), `origen` (`manual` or `programada`), and a link `Ver la ejecución en GitHub` (external icon, `rel="noopener"`).
3. `<RunProgress>`: an ordered list of four stages, `Despacho`, `Descarga`, `Cálculo`, `Revisión pendiente`. Each `<StageRow>`: an 8px square (outline `--rule-2` = pending, filled `--accent` = running, filled `--ink-1` = done, filled `--state-danger` = failed), the stage name, the state word in `--text-micro` mono, and the stage's own timestamp when it has one. Squares, not dots and not spinners: a square reads as an instrument indicator, a dot reads as decoration, and a spinner hides which stage you are in.
4. A 2px indeterminate bar in `--accent` under the stage list, only while any stage is running, disabled under reduced motion (the text state line remains, so nothing is lost).
5. `transcurrido` in `--text-num-m` mono, server-rendered at page load and updated by the optional poll.
6. Two actions, deliberately unequal:
   - `Dejar de seguir` is a **text link** (no border, no fill, underline on hover): it navigates to `/admin` and does not touch the job. A one-line note states `La ejecución continúa. Cuando termine, la revisión aparecerá en el panel.`
   - `Cancelar ejecución` is a **danger-outline button** (`--state-danger` text, 1px `--state-danger` border, transparent fill) placed after the link and reachable only inside a `<details>` `Opciones de la ejecución`, with a confirmation step. Cancelling is destructive: it throws away a computation the operator waited for.

Refresh mechanics: the page is server-rendered and stateless. The no-JS baseline is a plain `Actualizar estado` link that re-requests the page. Progressive enhancement adds a 5s poll in a client leaf that (a) only runs when `document.visibilityState === 'visible'`, (b) clears on unmount, (c) re-renders only the stage list and the elapsed time. No state is stored; the poll is a read.

States:
- `running`, normal.
- `noUpdate`: no stage change for more than 10 minutes. Show `sin actualización desde <hora>` in `--state-pending` and the GitHub link. Do **not** claim failure: the panel cannot distinguish a slow run from a stuck one, and guessing would be exactly the improvisation the pipeline forbids. Escalate to the run link.
- `done`: replace the stage list with a single line and a link to the pending revision (`La revisión está lista para revisar.`). The page does not auto-redirect; the operator chooses.
- `failed`: the failing `<StageRow>` in `--state-danger`, a fixed locale sentence naming the class of failure (dispatch, fetch, compute, publish), the request id, and the GitHub link. A secondary `Reintentar` appears only when the failure class is retryable. **No raw stderr, no workflow log tail, no upstream error body** is ever rendered.
- `cancelled`: stages after the cancellation point render as `no ejecutada` in `--ink-3`.

Anti-patterns: a full-page spinner; a fake percentage ("73%"); auto-redirect on completion; a cancel button adjacent to "leave" (the two must not be one click apart); printing the run's raw logs.

### View: pending revision review

The highest-stakes screen in the product. Design for comparison, not summary.

Geometry: full `--admin-max` width. One `<h1>` `Revisión <id>`. Immediately beneath it, `<BlastRadius>`: a full-width block on `--state-pending-ground` with a 3px `--state-pending` left rule, containing two generated sentences:
- `Aprobar publica 5 figuras: ratio de dependencia, cobertura, retorno por cohorte, deuda implícita, crecimiento requerido.` (built from the diff's figure list, never authored)
- `Nada cambia en el sitio público hasta este paso.`

Then the table. Columns, left to right: `Figura` (220) | `Antes` (120) | `Ahora` (120) | `Δ` (90) | `Fuente` (200) | `Snapshot` (130) | `Hash` (130). `Δ` is a signed numeral with the metric's unit; when unchanged it reads `sin cambio` in `--ink-3`. Numerals right-aligned, mono, `tabular-nums`.

Row treatment:
- **changed**: `--diff-rule` left rule in `--state-pending`, a `<StatusChip state="changed">` `cambiado` chip beside the figure name, values in `--ink-1`.
- **unchanged**: no rule, values and delta in `--ink-3`. Dimmed, not hidden: the operator needs to see that a figure did *not* move, because "the dependency ratio held steady while cover fell" is information.
- A header control `Ocultar sin cambios` toggles `?changed=1` (a link, server-rendered). It is a convenience, never the default, and the count of hidden rows is printed when it is active.

No red/green. A change is marked as a change; whether it is good is not the instrument's job, and colour-coding deltas trains an operator to approve by hue. Direction is carried by the sign and the numeral.

Row expansion: a `<details>` per row (`Ver detalle`) opening a full-width panel on `--surface-2` with the formula id, the full 64-character input hash before and after, the source URL before and after when it changed, the byte size of the pending JSON, and a link to the pending file. Not a modal: a modal over a diff table removes the comparison, which is the one thing this screen exists for.

Blocking pre-flight, rendered above the table when present (and disabling approval):
- `sin manifiesto` on any figure (T1 coupling, AC-60): a `--state-danger` row naming the figure and the missing field.
- `Contenido sin cita` when the revision would publish a named-person claim without a resolvable citation (AC-68): a `--state-danger` row naming the unit and the claim, with the citation slot that failed.
Both are generated from the publication gate's own output, so the panel shows the same reason the server would reject with.

States:
- `pending`, normal.
- `no-changes`: every figure identical. The approve control is **not rendered**; the only action is `Descartar revisión` (danger-outline). A sentence explains that a revision with no changed figure publishes nothing. This is the anti-muscle-memory guard.
- `superseded`: a newer revision exists. A `--state-pending` banner names the newer one and links to it; approval is not rendered; the only actions are `Ir a la revisión vigente` and `Descartar`.
- `publishing`, `published`, `publish-failed`: see the approval view.

Clicks: row detail disclosure, the `?changed=1` toggle, the provenance links, the log link, and the approval flow. **No cell in this table is an input.**

### View: parameter proposal review

Purpose: a parameter change is a change to a *rule*, so it is reviewed as a rule, never as a number in the figure table.

Layout: single column at `--measure-wide` (~78ch), not a table. Contents in order:

1. `<h1>` `Propuesta de parámetro` plus `<StatusChip state="pending">`.
2. A mono line naming the machine origin: `propuesta por <modelo> · <fecha> · <id>`. The operator must always know a model wrote this.
3. The parameter name in `--text-h3` and its enumerated member identity in `--text-micro` mono (`pension_payment_count`).
4. `<RuleDiff>`: two full sentences stacked as a `<dl>`, `Antes` and `Ahora`, in `--text-body-lg`, with the changed numerals in mono. Full sentences, because the consequence is semantic: `La pensión se abona en 12 mensualidades al año.` becomes `La pensión se abona en 14 mensualidades al año.` A bare `12 → 14` is not reviewable.
5. `<BlastRadius kind="parameter">` on `--state-danger-ground`, 3px `--state-danger` left rule. Generated from the parameter's dependency map, never authored: `Este parámetro re-deriva 3 de 5 figuras: retorno por cohorte, deuda implícita, crecimiento requerido. Sus valores publicados cambiarán en el siguiente cálculo.` Plus one comparison sentence, present on this screen and only this screen: `Un cambio de dato afecta a una figura. Un cambio de parámetro re-deriva tres.` That sentence is the design answer to making blast radius legible.
6. `<CitationBlock>`: the verbatim legal or official text in `<blockquote cite>` with a 2px `--rule-2` left rule, sans (never the public serif), followed by `<CitationChip>` and `<CitationPanel>` exactly as T9 defines them, plus the source's own date and the article or reference identifier.
7. Actions: `Aceptar parámetro` (accent fill) and `Rechazar` (danger-outline, opening a `<details>` with a required reason radio group: `la cita no resuelve`, `fuera del conjunto enumerado`, `sin cambio neto`, `fuente de clase incorrecta`, plus a confirm). Rejection is a first-class, audited act with an enumerated reason, not a close button.

The two-gate flow, and the reason it exists: accepting a parameter commits the rule change but publishes no figure. The panel then shows `Recalcular con el nuevo parámetro` as the only primary action, which dispatches the T14 workflow. The resulting figures arrive as an ordinary pending revision with the rule already changed, and are reviewed in the figure table. One gate for the rule, one for the numbers. If the numbers were derivable at accept-time, a single gate would hide which figures moved, which is the exact failure this task's blast-radius requirement is about.

Anti-patterns: rendering a proposal as a figure diff; auto-approval; a parameter shown as a bare JSON value; a citation collapsed by default; a reject button with no reason; an "unsupported proposal" card; the public serif on the legal quote.

### View: approval and publish

Two deliberate acts, and the second one shows the values.

Step 1, on the review page: `Revisar y aprobar` is a `<summary>` styled as the primary button, opening a `<details>` inline (not a modal, so the diff stays visible beside it). Inside:

- A restatement table, compact: one row per changed figure, `Figura | Ahora`, with the previous value in `--ink-3` before an arrow. This is the "show what will go live" requirement: the operator confirms against values, not against a label.
- The revision id, the figure count, and the count of rows suppressed by `Ocultar sin cambios` if it is active (so a filter cannot hide a change at the moment of approval).
- One checkbox: `Entiendo que estos valores pasan a ser públicos.` Placed *after* the values, because a consent control placed before the evidence is a formality.
- `Publicar revisión` (accent fill, 44px) and `Cancelar` (plain text link).
- A hidden `reviewToken` input bound to the revision id.

Step 2, after submission: the page becomes a **publication receipt**, never a toast. `--surface-2` ground, `<h1>` `Publicado`, `<StatusChip state="published">`, the revision id, the commit sha, the timestamp, `Ver en el sitio`, `Ver el registro`, and `Volver al panel`. A toast would be the wrong register: this is irreversible state, and transience is the enemy of a record.

Failure: `<h1>` `No se ha publicado`, a fixed sentence naming the class (`la revisión no ha pasado la comprobación de publicación`), the request id, and the unchanged review still on screen below so no work is lost. The button re-enables; the server is idempotent by revision id, so a double submit cannot publish twice.

Anti-patterns: a single unguarded click; a confirm dialog that only repeats the revision id; a success toast; a "published" state that does not name the commit; auto-publish when the diff is trivially small; approval available from the panel home without loading the diff.

### View: audit log

Route `/admin/audit`, server-rendered, `--admin-max`, 40px rows.

Header: `<h1>` `Registro`, then `<ChainStatus>`: `cadena verificada hasta 2026-10-01T14:02:11Z` in `--text-micro` mono, or `sin verificar` in `--state-pending` when no verification run exists. Never a bare "verified".

`<FilterForm>`: a GET form with `acción` (a `<select>` of the enumerated action set, never free text), `desde` and `hasta` (`<input type="date">`), and a `Filtrar` submit plus a `Limpiar` link. The current filter is restated in the table's `<caption>`, with the entry count, so a filtered log can never be mistaken for the complete record.

Columns: `Hora` | `Identidad` | `Acción` | `Objetivo` | `Antes → Ahora` | `Petición`. The last column carries the request id (mono, copyable) which is the join key to server logs. Absolute timestamps only, in the operator's local time with the ISO value in `title`.

Row rendering by action class, all at the same height and weight:
- data actions: `antes → ahora` as numerals, mono, right-aligned.
- session actions: `-` → `sesión iniciada` / `sesión cerrada` / `sesión caducada`.
- failed authentication: `-` → `intento fallido`, target `login`, no credential field and no highlight. Visually ordinary, deliberately: a red row trains an operator to ignore red, and it reveals to anyone who reaches the log where to look.
- publication: `revisión <id>` → `publicada`, with the commit sha in the detail.
- proposal actions: `propuesta <id>` → `aceptada` / `rechazada`, with the reason code in the detail.

Per-row `<details>` (`Detalle`) holds the chain hash (12-char prefix plus copy), the full target path, the reason code when present, and the request id in full.

There is no edit affordance of any kind: `<AuditTable>` accepts no `actions` prop, has no checkboxes, no row menu, no inline control, and the component is separate from every other table in the product so it cannot inherit one.

Pagination: 100 rows per page, `Anterior` / `Siguiente` links, a count line, and one sentence at the bottom: `Las entradas no se modifican ni se eliminan.` Empty state: `Sin entradas.` with no softening, because on a live deployment an empty log means something is wrong.

### Small screens

Both high-stakes views are tables that cannot survive at 360px. What collapses, and what never does:

**Revision review (< 768px).** The seven-column table becomes one block per figure:
- Heading row: figure name plus `<StatusChip>`.
- A two-column comparison, `Antes | Ahora`, values at `--text-num-m` mono, side by side because comparison is the task. This is the one place where two numerals are allowed to be large on mobile.
- A line: `Δ -0,03` in mono, or `sin cambio` in `--ink-3`.
- `Fuente`, `Snapshot`, `Hash` as label-above-value pairs in `--text-micro`, wrapping, never truncated.
- Row height become `56px` minimum for the tappable detail disclosure; the values themselves are not tappable.

Never collapsed at any width: the figure name, the before value, the after value, the delta sign, the changed/unchanged state, the blast-radius sentences, and the approve/reject consequences. If those cannot be shown together, the layout is wrong, not the requirement.

The actions are not in a sticky bottom bar: a fixed bar covers the last row and invites mis-taps on the exact screen where a mis-tap is expensive. Instead the blast radius and a `Revisar y aprobar` jump link appear at the top, and the full action block repeats after the last row.

**Audit log (< 768px).** Each entry becomes a fixed four-line stack: line 1 `Hora · Acción`, line 2 `Objetivo`, line 3 `Antes → Ahora` (wrapping, mono), line 4 hidden inside `Detalle` along with identity, request id, and chain hash. One shape for every action class, because a conditional layout would make some entries unreadable for reasons the reader cannot see.

**Panel home (< 768px).** `<PublishedRevisionBlock>` stacks its definition list to one column; the primary action goes full width; the pending table keeps `Tipo` and `Creada` and moves the rest into the row link's detail.

**Login and 503** are already single-column; only the top offset shrinks to `--space-7`.

Touch targets: 44px minimum everywhere, 56px for rows that are disclosures. No horizontal page scroll at any width; long hashes wrap with `overflow-wrap: anywhere`.

### Error, secret, and oracle discipline

**Secret never rendered.** One component, `<AdminError kind requestId at />`, where `kind` is a closed union (`config.unconfigured`, `auth.failed`, `auth.lockedOut`, `session.expired`, `dispatch.failed`, `fetch.failed`, `compute.failed`, `publish.failed`, `internal.error`). It accepts **no** `message`, `detail`, `error`, or `cause` prop and never interpolates anything but a server-generated request id and an ISO timestamp. Each `kind` maps to one locale key with no placeholders. There is no `dangerouslySetInnerHTML` anywhere in the admin tree, and no component receives an upstream response object.

Consequences, stated as rules the Coder can check:
- No env key name, secret value, hash string, stack trace, workflow log, GitHub API body, or SQL fragment can reach the DOM, because no prop can carry one.
- The failed-login panel and the 503 panel share no component that could accept extra detail.
- The password field is never re-populated and never rendered with a `value` prop.
- The audit log records failed attempts without the attempted credential (AC-66); the design gives it no field to put one in.
- Upstream errors (GitHub dispatch, fetch failures) are logged server-side in full and rendered as a fixed sentence plus a request id. This mirrors `docs/SECURITY.md` §Upstream Error Responses Must Not Reach the Client, applied to the operator as the client.

**Oracle avoidance, summarised as five structural facts:**
1. There is no identity input, so no response can distinguish an unknown identity.
2. The failure line is one fixed string; there is no attempt counter before the threshold.
3. The lockout panel names only the limiter's own scope and release time, both of which the attacker can already observe as delay.
4. The configuration case is a different route with no form, reachable only when the surface is entirely closed, so it cannot be probed with a guess.
5. Nothing in the UI changes shape between "wrong password" and "not configured". The former keeps a form; the latter has none. A difference in *page class*, never in *error text*.

### noindex and shared components

- `X-Robots-Tag: noindex, nofollow` is sent as a **header** on every admin response, including 401, 403, 404, and 503. A meta tag alone is insufficient because error responses and redirects are exactly what a crawler encounters first.
- No admin URL appears in `sitemap.xml`, and the sitemap is generated from an explicit public-route manifest, never from filesystem discovery, so adding an admin route cannot leak it.
- `robots.txt` does **not** carry `Disallow: /admin`. A disallow would stop crawlers from fetching the page and therefore from seeing the `noindex`, while still advertising the path to anyone who reads the file. `noindex` plus sitemap exclusion is the correct pair. (AC-52 requires both; it does not require a robots rule, and the design forbids one.)
- Shared components may be reused in admin (`<DataTable>`, `<CitationChip>`, `<CitationPanel>`, `<ProvenanceStrip>`, `<HashChip>`, `<CopyControl>`, `<StatusChip>` stays admin-only). Every shared component must be metadata-free: no `<link rel="canonical">`, no `hreflang` alternates, no Open Graph tags, no JSON-LD, no locale switcher, no document `<title>` logic. Those belong to route-level layouts. A canonical URL emitted from a shared component would point an index at a public page while the content is an admin view, which is both wrong and a leak.
- Admin has its own root layout. The public layout must not be imported into admin, and admin routes must not be children of the public layout, because the public layout emits the header, the snapshot banner, the locale links, and the analytics-free footer that admin does not want and should not assert.
- Admin pages set `<meta name="robots" content="noindex, nofollow">` as well, redundantly, so a misconfigured proxy that strips headers still cannot index them.

### Client-side state persistence

**None.** Specifically:

| Mechanism | Decision |
|---|---|
| `localStorage` | not used |
| `sessionStorage` | not used |
| `IndexedDB` | not used |
| Cookies | the `HttpOnly` `Secure` `SameSite=Strict` session cookie only, unreadable from JS, plus the CSRF synchronizer token (delivered in the form, held in memory) |
| `history.state` | not used; no revision data is ever pushed into history |
| Service worker / cache | none; admin responses are `Cache-Control: no-store` |
| URL query | only the view filters that must be shareable: `?changed=1` and the audit filters. No revision data, no tokens |

Why this is safe rather than merely minimal: (a) any persisted admin state is a second copy of operational data living outside the audit trail, and the audit trail is the product's control; (b) a persisted selection or "resume where you left off" could restore a stale pending revision and publish the wrong thing, and the blast radius of that mistake is a public claim; (c) any future content-injection path would gain a persistence target, and there is no reason to hand it one.

The one exception, considered and rejected: remembering the audit filter across visits. It creates a hidden state in which a filtered log looks complete, which is the single worst property an audit view can have.

The theme preference (`localStorage`, public site) is not carried into admin: the admin shell follows the system preference only, because an operator toggling a theme mid-review is a distraction with no benefit and the inverted bar reads correctly in both modes.

### Where admin conflicts with the public design

| Conflict | Resolution | Which yields |
|---|---|---|
| Public bans alarm red and "deficit" red as a crank signal; admin needs unambiguous destructive states | Admin adds `--state-danger` and `--state-pending`, used only inside `/admin`; `--data-deficit` never appears in admin, `--state-danger` never appears on the public site | The public rule yields **inside `/admin` only**, and the public palette is unchanged |
| Public bans live indicators, ticking timestamps, and pulsing dots (a snapshot is a snapshot); admin has a genuinely running job whose elapsed time matters | Admin may show elapsed time, a stage line, and one 2px indeterminate bar; it still bans the word "live", pulsing dots, and fake percentages | The public rule yields; the public surface is untouched |
| Public bans status dots; admin needs stage state | 8px squares paired with a state word, admin only | The public rule yields |
| Public page locks one theme and forbids inverted sections; admin's marker is an inverted operator bar | Admin is a separate root layout, not a section of the public page, so the lock does not apply | The public lock yields **structurally** (different layout root), never visually mid-page |
| Public dials are 5 / 4 / 5; admin is 8 / 2 / 2 | Dials are page-scoped; each surface declares its own triple over one token system | Neither yields; the dials are scoped, not shared |
| Public forbids modals and uses `<details>`; admin's approval could argue for a modal | Admin also uses `<details>`, so the diff stays visible while confirming | The public instinct holds; the cost is that the confirm does not block the rest of the page, accepted at this scale |
| Public reserves the serif for the site's own voice (thesis only) | Admin never uses the serif, including for legal quotations | No conflict: the rule extends unchanged |
| Public sets `--grid-max: 1240px`; diff tables need more width | Admin uses `--admin-max: 1440px` | The public width yields for admin only; both are tokens, neither is a literal |

## Out-of-scope tasks

Seven tasks are partially or wholly backend, and only their rendering surface is specified here.

- **T1 manifest:** the value object, hash computation, and validation are out of design scope. In scope: `<ProvenanceStrip>`, `<ProvenancePanel>`, `<HashChip>`, `<FormulaChip>`, and the `withheld` plate state.
- **T2 ingest harness:** the fetcher, the freshness evaluation, and the committed-JSON writer are out of design scope. In scope: the snapshot stamp, the stale banner, the build-failure route, and the reproduce table.
- **T3 to T7 calculation kernels** (formulas, rounding, edge-case semantics, property-test invariants) are out of design scope. In scope: chart form, encoding, readout, states, table shape, and clicks for each metric.
- **T12 authentication internals:** argon2id parameters, HMAC construction, the rate limiter, and the CSRF verifier are out of design scope. In scope: the login view, the generic failure line, the lockout panel, the session-expired panel, and the operator bar.
- **T13 configuration boundary:** secret loading, the build-output grep gate, and the 503 routing are out of design scope. In scope: the 503 view and the rule that it renders no form.
- **T14 dispatch and pending store:** the GitHub `workflow_dispatch` call, the pending store under `data/pending/`, idempotency, and the commit-on-approval mechanics are out of design scope. In scope: panel home, run progress, the revision review table, the blast-radius block, the approval flow, and the publication receipt.
- **T15 proposal write path:** the enumerated parameter type, the structural separation from derived figures, and citation resolution are out of design scope. In scope: the proposal review view, the rule diff, the blast-radius block, the citation block, and the reject flow.
- **T16 log persistence:** JSONL storage, the chained hash, and the verification job are out of design scope. In scope: the audit table, the filter form, the chain-status line, and the rule that the table accepts no actions.

No task has zero frontend surface, so no task is skipped entirely.

## Revision 1: live E2E findings

Measured against the built app (Chromium, 1440×900 and 390×844, `es` and `de`, plus `/admin`). This section is additive: it does not restate anything that already works, and it does not touch the token palette, the dial values, the three-register system, the admin surface, or the chart forms (those are unexercised, not wrong).

**What the pass confirmed and this revision preserves unchanged:** the register separation reads correctly at a glance (instrument plate / untinted consensus prose / `--surface-3` thesis inset with the serif and an `OPINIÓN` label); German does not overflow; `/admin` returns 503 with no nav, no form, and no password field. Do not redesign any of those.

### Severity ranking

| # | Directive | Finding | Severity |
|---|---|---|---|
| D4 | Overflow containment, 320px floor | F3 | **Blocks launch** |
| D1 | Unresolved figure state, promoted to first-class | F1, F6, F8 | **Blocks launch** |
| D2 | Hero subject ladder | F1, F6 | **Blocks launch** |
| D3 | Public vs operator vocabulary boundary | F2 | **Blocks launch** |
| D5 | Empty-state accessibility contract | F4 | **Blocks launch** |
| D6 | Provenance strip, designed form | F7 | Degrades quality |
| D8 | Locale switcher and mobile header budget | F9, F10 | Degrades quality |
| D7 | Mark, favicon, share card | F5 | Degrades quality (share card), polish (favicon) |

The five blocking items share one root cause: the app was built for the state where data exists, and shipped in the state where it does not. Fixing D1 and D2 collapses the measured 7674px page to roughly 2600px at 390 and 2200px at 1440 with nothing computed, and removes the "unfinished product" reading without inventing a single claim.

### D1 (blocks launch): the unresolved figure state. Findings F1, F6, F8.

Supersedes the *rendering* of the `null-value` and `withheld` rows in §State model, and adds one state. The states keep their names; what changes is the space they are allowed to occupy.

**When data is absent, the figure stops being a figure.** A figure in a non-computed state does not render a plate, a chart frame, a hatched area, a dashed "coming soon" box, or any numeral at any scale. It renders one row.

| State | Cause | Public rendering | Vertical budget |
|---|---|---|---|
| `computed` | manifest valid, value present, inside freshness window | full plate: caption, readout, chart, table, provenance strip | 420 to 560px |
| `null-value` | the formula returns no value (T3, T4, T5 edge cases: zero denominator, zero contributions) | full plate; the chart renders with the gap hatched by `--chart-null`; the table row reads `no definido` plus a public-words reason | full plate |
| `unavailable` **(new)** | the figure has never been computed in this deployment (its source series is not yet specified or resolved) | one ledger row | 48px row plus `--space-5` gap |
| `withheld` | the manifest fails validation (T1) | one ledger row, different sentence | 48px row plus `--space-5` gap |
| `stale` | snapshot outside the freshness window | must not reach production (T2 fails the build); preview banner only | n/a |

**`<FigureStatusRow>`**, the whole design of an unresolved figure:

- One row, `min-height: var(--figure-state-row-min)` (48px), `border-top: 1px solid var(--rule-1)`, nothing else. No ground change, no icon, no illustration.
- Grid `[1fr auto]`: left, the figure's name as a link to its own anchor (`id="fig-03"` stays on the row, so every cross-reference from the thesis and the dispute section still resolves); right, a state chip.
- State chip: `--text-micro` mono, 1px `--rule-1`, `--ink-3`, one of exactly two words: `sin calcular` (`unavailable`) or `no verificado` (`withheld`). `null-value` has no chip because it is not a ledger state: it renders a full plate, and a plate carries its provenance strip instead of a status word.
- One reason line under the name, `--text-small`, `--ink-3`, maximum two lines at 390px, from a locale key per state (see copy rules below).
- Then one link, `Cómo se calcula`, to the methodology anchor for that figure.

**`<FigureLedgerNote>`**, rendered exactly once per page, above the first unresolved figure: one short paragraph in `--text-body-lg` at `--measure`, on `--surface-1`, no border. It states the situation once so the rows do not have to: "Algunas cifras todavía no se calculan en este despliegue. Las que faltan están marcadas y su método está publicado." Nothing more. It is not an apology and it is not a promise.

**Ordering.** Strict figure order, `fig-01` to `fig-05`, interleaving plates and rows. Grouping the unresolved rows together would reorder the narrative and put `fig-05` above `fig-03`; the note above the first one is enough.

**Copy rules, enforced as review + a content test:**

- Three locale keys, one per state, and every one of them names the state, never the mechanism: `figure.unavailable.reason`, `figure.null.reason`, `figure.withheld.reason`.
- Banned words in all three, in every locale: `resolver`, `serie`, `parse`, `fetch`, `null`, `undefined`, `JSON`, `hash`, `manifiesto`, `rev`, `build`, `deploy`, `pronto`, `en breve`, `estamos trabajando`, `disculpas`.
- Banned permanently: any forward-looking promise. The site does not know when a figure will exist, so it never says. `sin calcular` is a state; `próximamente` is a claim.
- **No state word may use a display or numeral token.** `Serie sin resolver` at 90px is the failure this directive exists to prevent. Mechanically checkable: a component that renders any of the three state words may not reference `--text-display`, `--text-h2`, `--text-num-xl`, `--text-num-l`, or `--text-num-m`.

**Why this does not look broken.** A ruled row with a name, a state word, a sentence, and a link is a *deliberate absence*, the way a statistical bulletin prints a dash and a footnote rather than an empty chart frame. An empty chart frame is a wireframe tell; a ruled row is a document. The measured alternative, five chart-shaped holes at plate weight, is what produced the bug reading.

**`<NullPlate>` is retired.** §State model's whole-plate null rendering goes away: a figure is either `computed` (and may contain null *data points*, hatched inside an otherwise normal chart) or `unavailable` (a ledger row). A computed figure whose every data point is null is treated as `unavailable`, with the null reason preserved in the row's reason line, so there is no state in which a plate renders empty axes.

**Interaction with T11:** see D5. A table is emitted if and only if a chart is emitted.

### D2 (blocks launch): hero subject ladder. Findings F1, F6.

The hero must never spend the largest type on the page announcing an absence. Supersedes §Page shell's hero description, which assumed `fig-01` unconditionally.

**`selectHeroSubject(derived)`**, a pure function evaluated at build time, first match wins. It returns a discriminated union, `{ kind: 'figure', figureId, value, comparisons }` or `{ kind: 'proposition' }`, so it can be unit-tested and so the hero variant is fixed at build time with no CLS and no client JavaScript.

Eligibility, and the exclusions are the point:

```
eligible(figure) := figure.state === 'computed'
                 && figure.headlineValue is a single scalar
                 && figure.id in ['fig-02', 'fig-01']     // fixed priority order
```

- `fig-03` is excluded because its headline is the central value of a band, and a hero that shows the central value without its band would publish the thing AC-001-21 exists to prevent.
- `fig-04` is excluded because AC-001-25 forbids a single headline implicit-debt number, and the hero is the loudest single-value slot on the site.
- `fig-05` is excluded because it carries the thesis, and promoting a thesis-adjacent number to the hero would blur the register boundary that AC-001-41 and AC-001-42 protect. The site does not lead with its conclusion, even when the number is available.

**Tier 1, `fig-02` computed:** the same numeric hero, relabelled to pension expenditure as a share of GDP, showing the current value, the first and peak observations, and three dated comparisons. Leads with this figure because the computed series carries a visible trend where the dependency ratio is flat across the recent decade (0.3293 in 2016, 0.3314 in 2024) — a flat headline invites "so what" in the first viewport.

**Tier 2, `fig-01` computed:** the numeric hero as originally specified, showing the ratio, three dated comparisons and the sparkline.

**Product-owner decision (2026-10-26), recorded here rather than inferred:** tier order is `fig-02` then `fig-01`. The rationale is the measured series, not aesthetics — `fig-02` rises from 9.82% of GDP in 1995 to 13.23% in 2024 (peak 14.39% in 2020), while `fig-01` is effectively flat over the last decade. Do not revert this ordering without the same evidence.

**Tier 3, no eligible figure (today's state): propositional hero.**

- Layout 8/4, not 7/5. The extra column goes to the sentence, because there is no number to give it to.
- Left column: `<h1>` from the `hero.proposition` slot (budget 90 chars `es`, 115 `de`; two lines at desktop, three at 390), a subtext capped at 20 words, one primary link `Leer el método` to `#metodo`, one secondary link `Qué cifras publicamos` to `#figuras`. Method first, and never the thesis: the credibility order a cold reader needs is method, then evidence, then opinion.
- Right column: the **status summary**, not an empty plate. A five-row list, one row per figure, each `name` plus its state chip, then one line in `--text-micro`: `5 figuras · 0 calculadas`, with the count computed from data, not authored. Rows link to their anchors. No frame, no border on the block, no chart placeholder.
- The largest type on the page is the proposition. No numeral larger than `--text-micro` appears above the fold, and the only one at that size is the snapshot date; the status summary's counts are `--text-micro` too.
- `min-height`: the `calc(100dvh - var(--header-h))` rule applies to the numeric hero only. The propositional hero takes its content height. This removes the measured dead space; the next section becomes visible at the fold, which is what invites the scroll.

**When the proposition slot is missing:** the build fails. A missing content key is a content bug, and silently falling back to a state word would recreate exactly the failure this directive fixes.

**The thesis is never a hero fallback.** If there is no number, the site leads with what it does, not with what it thinks.

### D3 (blocks launch): public vs operator vocabulary. Finding F2.

The rule, in one sentence: **if a string's meaning is defined by this repository rather than by the publisher, it is operator vocabulary and does not appear on a public page.**

| Operator vocabulary (public page: never) | Public replacement |
|---|---|
| `10-tasks.md`, `(pregunta abierta 1)`, `open question 1` | the reader-facing reason sentence from D1 |
| `T3`, `AC-001-08`, `spec 001` | nothing. These never have a reader-facing equivalent |
| `ss-pensioners`, `ss-affiliates`, `ine-tempus3`, any internal source slug | publisher + dataset as the publisher titles it + observation date |
| `dep-ratio-v1`, any formula id | `Cómo se calcula`, linking to the methodology anchor |
| a 64-character digest, a run id, a revision id | nothing on the public surface; `Cómo se calcula` if the reader asks for provenance depth |
| `data/derived/dependency.json`, any repo path | nothing; the reproduce path lives in the disclosure |
| env key names (`ADMIN_PASSWORD_HASH`) | nothing, ever, anywhere, including `/admin` |

**The public form of a source**, three fields in this order, rendered as the labelled grid in D6 (not as a dot-joined string):

```
Fuente     Seguridad Social
Serie      Afiliados a la Seguridad Social
Dato de    octubre de 2026
```

**The test that decides a grey area:** can a reader paste the identifier into the publisher's own site and land on the source? Yes means public. An INE table number, a Eurostat dataset code (`spr_exp_pens`), and a BOE article number all pass, and they belong on the page because they are how a reader finds the data. An internal slug, a formula id, a hash, and a spec filename all fail, because they resolve only inside this repository.

**Where operator vocabulary is acceptable:** `/admin/*`; the reproduce panel and the provenance disclosure (both marked `data-operator="true"` on their subtree); the audit log; code comments and commit messages; `data-*` attributes. Nowhere else, including captions, notices, alt text, `aria-label`, meta descriptions, and the share card.

**Enforcement (a build-time gate, not a review habit):** for every public route, take the rendered text, drop every `[data-operator="true"]` subtree, and fail the build on a match for: `\.md\b`, `AC-\d{3}-\d{2}`, `pregunta abierta`, `open question`, `[0-9a-f]{16,}`, and any value of any `sourceKey` field present in `data/derived/*.json`. The last clause is the one that would have caught `ss-pensioners:` and it stays current as sources are added.

**F2's specific strings** are not to be translated or softened: `(10-tasks.md, pregunta abierta 1)` is deleted outright. The need behind it, telling a reader why a figure is missing, is served by D1's reason line in public vocabulary.

### D4 (blocks launch): overflow containment and the 320px floor. Finding F3.

Measured: `documentElement.scrollWidth` 713 against a 390 window, with the plate clipped. Primary offender: `code.hash--full`, a 64-character digest in a `<code>` with default wrapping.

**Minimum supported width is 320px**, token `--bp-min`. Zero horizontal overflow is required at 320, 390, 768, and 1440.

Rules, in the order a Coder should apply them:

1. **Identifiers wrap anywhere.** `code, samp, kbd, .identifier, .hash, .url` get `overflow-wrap: anywhere; word-break: break-word; max-inline-size: 100%;`. This is the direct fix for the measured offender.
2. **Grid and flex children that can contain a table, `<pre>`, `<code>`, or `<svg>` get `min-inline-size: 0`.** This is the cause of most overflow that "should not" happen: the default `min-width: auto` refuses to shrink below content.
3. **SVG never forces width.** `svg { display: block; max-inline-size: 100%; height: auto; }`.
4. **Tables scroll inside themselves, never the page.** The container keeps `overflow-x: auto`, `overscroll-behavior-x: contain`, `scrollbar-gutter: stable`, `tabindex="0"`, and an `aria-label`.
5. **The compact chart viewBox is 320 wide**, token `--chart-compact-w`, replacing the 360 in §Chart strategy. At 320 it renders 1:1, so a 12px axis label stays 12px. At 390 it scales up by 1.22, which is acceptable; it can never scale down below the floor.
6. **Prose wraps like prose.** `hyphens: auto` with the correct `lang`, plus `overflow-wrap: break-word`. Never `anywhere` in prose: it breaks words mid-syllable and reads as a bug even when it is not.
7. **No `overflow-x: hidden` on `html` or `body`.** It hides the next regression instead of containing it, and it breaks sticky positioning in some engines.
8. **No ellipsis on any identifier, title, date, or figure name.** Wrap, or move it into a disclosure. Truncation on a credibility surface is a defect, not a layout compromise.

**Acceptance, as an automated check** (Playwright, four widths, both locales): `documentElement.scrollWidth === document.documentElement.clientWidth`, and no element's `getBoundingClientRect().right` exceeds `innerWidth + 1`. Run it on `/`, a resolved-figure route when one exists, and `/admin`.

### D5 (blocks launch): empty-state accessibility contract. Finding F4.

Measured: 0 `<table>`, 0 `<svg>`, 0 `<canvas>`, 0 chart hosts, and 9 `<details>` with nothing inside them.

**Decision: an unresolved figure renders no chart and no table. The status section is the non-visual equivalent.** A table with headers and zero data rows is worse than nothing: a screen-reader user is told "table, 3 columns, 0 rows" and learns the same fact they already heard from the heading, twice, with more ceremony.

**One rule makes the coupling unconditional:** a table is emitted **if and only if** a chart is emitted. One component produces both; there is no code path that renders one without the other. That is what prevents the measured state from recurring the moment a chart is re-enabled, and it is the whole of T11's guarantee expressed as a structural invariant.

What a screen-reader user encounters, per state:

| State | Encountered |
|---|---|
| `computed` | `<section id="fig-0N" aria-labelledby="fig-0N-title">`, heading, caption sentence, the chart with `role="img"` and `aria-describedby` the readout, then the `<details>` disclosure whose summary names the row count, containing the table with `<caption>`, scoped headers, and values |
| `null-value` | the same, with `no definido` cells and the reason in the caption |
| `unavailable` | heading (level 2, naming the figure), one sentence stating it is not calculated in this deployment, one link `Cómo se calcula`. Nothing else: no empty table, no `role="img"` on nothing, no live region |
| `withheld` | heading, one sentence stating it is not published because it did not pass the source check, one link |

No `aria-live` region anywhere on the public site: pages are static, so nothing appears or disappears without a navigation, and a live region would announce nothing but its own emptiness.

**Scenario note:** AC-001-44 and AC-001-45 hold under the conditional reading ("every chart renders a non-visual representation" is vacuously satisfied where no chart renders). The specifier should add the words *when a chart renders* to both, so the conditional reading is explicit rather than inferred. No contradiction, one clarification.

### D6 (degrades quality): provenance strip, designed form. Finding F7.

Measured: raw source URLs as a dense row of small text, reading as a log dump. The strip is the product's central credibility device; it cannot look accidental. Supersedes §Task 1's field list for the **public** strip; the disclosure keeps every field.

**Public strip** (rendered on `computed` figures only), directly under the plate's table, inside the `<figure>`:

- A 1px `--rule-1` above, `--space-3` padding-top, no ground change, no box.
- A three-field labelled grid at ≥1024px (`1fr 1fr 1fr auto`) and three stacked field pairs below 768px: label in `--text-micro` mono `--ink-3`, value in `--text-meta` `--ink-2`. The `Serie` value may take two lines; it is never truncated.
- The trailing cell holds two links, each a 44px hit target: `Fuente original ↗` (external icon 16px) and `Cómo se calcula`. More than three sources collapse to `Fuentes (3)` opening a three-item list; never an inline URL run.
- Fields, exactly: `Fuente`, `Serie`, `Dato de`. Nothing else. No hash, no formula id, no path, no slug, no JSON pointer, no spec reference on the public strip.

**Disclosure** (`Cómo se calcula`), marked `data-operator="true"`, `--surface-3` ground, 1px `--rule-1`, radius 0:

- A six-row `<dl>`: `fórmula`, `fuente`, `serie`, `dato de`, `huella sha256`, `ruta de reproducción`, `ventana de frescura`, all values in `--font-mono` `--text-meta`.
- The digest in a bordered `<code>` block, full 64 characters, `overflow-wrap: anywhere`, with a copy control and an `aria-live="polite"` confirmation.
- One sentence explaining what a changed digest means. That sentence is the only prose in the disclosure.

**Banned:** a list of URLs presented as provenance. A URL is not provenance; a named publisher, a named dataset, and a date are. The URL is reachable in one click from `Fuente original`, which is a different affordance from a wall of raw links.

**Compliance note:** AC-001-01 constrains the *manifest data* (`sourceUrl`, `fetchedAt`, `formulaId`, `inputHash`, `reproducePath` must all be non-empty in `data/derived/*.json`). It says nothing about the DOM. Moving four of those five fields into the disclosure is therefore compliant, and the disclosure must still render every one of them.

### D7 (degrades quality for the share card, polish for the favicon): mark, favicon, share card. Finding F5.

Measured: `favicon.ico` 404 on every route, and no icon declared. A blank tab, and worse, a blank share card, on a product whose traffic arrives from social feeds.

- **The mark is typographic, not illustrative.** One glyph: the site's initial letter, set in `--font-sans` weight 600, optically centred, on an `--ink-1` ground with an `--surface-1` letter, **`border-radius: 0`** to match the shape lock. No symbol, no shield, no chart glyph, no hand-drawn shape.
- **Files, all generated from one committed script** (`scripts/build-brand.mjs`) so they cannot drift: `app/icon.svg` (32, scales), `app/apple-icon.png` (180), `app/favicon.ico` (32, which stops the measured 404), and `app/manifest.ts` with 192 and 512 PNGs. Letter and colours come from tokens, not literals.
- **Declarations:** `<link rel="icon" type="image/svg+xml" href="/icon.svg">`, `<link rel="apple-touch-icon" href="/apple-icon.png">`, and `theme-color` meta with a light and a dark `media` variant.
- **Share card:** one static 1200×630 per locale, build-generated from the same tokens: `--ink-1` ground, the lettermark small in one corner, the wordmark, the `hero.proposition` string, and one line listing the five official sources. **No metric, no number, no date on the share card.** Third parties cache share images for weeks, so a number there becomes a false claim the first time the figure changes, and today there is no number to put there. The card's job is to state what the site is and that it cites official sources, which is true in every state.
- `og:image:alt` carries the site name and the proposition. Do not put a figure name in it.

### D8 (degrades quality): locale switcher and mobile header. Findings F9, F10.

**Locale switcher, ≥1024px.** Five 36×36 cells (`--locale-cell`) in one bordered group: 1px `--rule-1` outer border, 1px hairlines between cells, radius 0, 2-letter code in mono 13px. The active cell is **inverted** (`--ink-1` ground, `--surface-1` text) with `aria-current="page"`; inactive cells are `--ink-2` on transparent with a `--surface-2` hover. A 2px accent underline at 36px is a one-in-five cue and that is precisely what failed; a filled cell is unmistakable at a glance. The group carries `role="group"` and `aria-label="Idioma"`; each cell's accessible name is the language name in the current locale (`Cambiar a alemán`), while the visible label stays the two-letter code. 36px clears WCAG 2.5.8 (24px); `--touch: 44px` continues to apply to primary actions only, and this is not one.

**Header below 768px.** Exactly **56px**, one row, from 320 up. Token `--header-h-mobile: 56px`, which supersedes the 88px in §Page shell.

- Left to right: wordmark (text, ≤96px), the snapshot date in **ISO 8601** (`2026-10-01`, `--text-micro` mono, `title` and `aria-label` carrying the long localised form), the index trigger (40px, `caret-down` icon, `aria-label="Índice"`), the theme toggle (40px).
- **No navigation links and no locale cells in the bar.** The measured 49-links-0-buttons header is the symptom of building navigation out of anchors; every control that performs an action is a `<button>` or a `<summary>`, and only navigation is an `<a>`.
- Index panel: a native `<details>` opening a full-width panel under the header, `--surface-2`, 1px bottom rule, `max-height: min(70dvh, 420px)`, `overflow-y: auto`, no JavaScript, no overlay, no drawer. Contents in order: the four anchors at 48px rows; a hairline; `Idioma` as five full-width 44px rows showing language names (`Español`, `English`, `Français`, `Deutsch`, `Italiano`) with the active one marked `aria-current="page"` and a check icon; a hairline; the full snapshot stamp (`Datos: 1 de octubre de 2026 · ventana 45 días`) at `--text-meta`; a hairline; the theme choice as a three-row radio group (`Sistema`, `Claro`, `Oscuro`).
- Width budget to verify rather than guess, at 320: gutters 32 + wordmark 90 + ISO date 72 + index 40 + theme 40 + three 8px gaps 24 = **298px**, which fits. If the wordmark exceeds 96px in `de`, shorten the wordmark, not the date.
- **768 to 1023px** keeps the 64px header and the index panel from §Page shell, with the full snapshot stamp inline. Only below 768px does the 56px row apply. One header component, two density modes, one breakpoint token.
- `check` joins the icon set (eight total) for the active locale row in the index panel.

### New tokens

Five, and nothing else:

```css
--bp-min: 320px;              /* minimum supported width; the overflow floor */
--locale-cell: 36px;          /* switcher cell */
--header-h-mobile: 56px;      /* supersedes the 88px in §Page shell */
--chart-compact-w: 320;       /* compact SVG viewBox width, was 360 */
--figure-state-row-min: 48px; /* unresolved figure row */
```

Share-card dimensions (1200×630) stay constants inside `scripts/build-brand.mjs` with a comment pointing here: they are a build-script concern, not a component token, and putting them in `tokens.css` would invite their use in layout.

### Scenarios that need amending

| Scenario | Status | What the specifier must do |
|---|---|---|
| **AC-001-04** | Gap, and my design depends on closing it | Add a per-figure `availability: 'computed' \| 'unavailable'` field to the derived-JSON contract (T1/T2) and a scenario for the `unavailable` state. As written, the scenario cannot distinguish "a required source failed to fetch" (build must fail) from "this figure has never been specified" (a data state that publishes a ledger row). The deployed app satisfies neither reading, which is why the absence read as a bug |
| **AC-001-05**, **AC-001-06** | Amendment required | Both forbid publishing a partial snapshot. They are correct for *fetch failures* and must keep failing the build. Add one sentence to each: a figure explicitly marked `unavailable` in the committed data is not a partial snapshot, is never labelled current, and does not trigger the failure path. Without that sentence, the D1 rendering is arguably prohibited by the letter of the scenario |
| **AC-001-44**, **AC-001-45** | No contradiction, one clarification | Prefix both with *when a chart renders*. The conditional reading is already correct; the words make it explicit |
| **AC-001-07** | Unchanged | A stale snapshot still fails the build. D1 does not weaken it: `stale` is not `unavailable` |
| **AC-001-21**, **AC-001-25**, **AC-001-31**, **AC-001-41**, **AC-001-42** | Unchanged, and D2 is derived from them | Figure 3, 4, and 5 hero exclusions exist to keep these true |
| **AC-001-52**, **AC-001-53**, **AC-001-54**, **AC-001-55**, **AC-001-56** | Unchanged | The admin surface was confirmed working and this revision does not touch it |

### Not changing

The register system and its three labels; the token palette and every contrast pair verified above; the dial values `5 / 4 / 5` and the admin dialect `8 / 2 / 2`; the chart forms for all five metrics (unexercised, not disproven); the admin surface, including the 503 view confirmed in the pass; the thesis confinement rule; the citation requirement; the four-rate implicit-debt rule; the `<details>`-over-modal discipline; the no-photography decision.

