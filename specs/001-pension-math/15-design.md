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

> **Revision 2 amendment:** the palette gains one hue (`--data-projection`) and two chart aliases. The declarations are in §Revision 2, "New tokens"; the allowed-meanings table and the contrast verification for every new pair are in §Revision 2 R3. No existing value changes, and the three hues already in use keep their meanings.

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

## Revision 2: alarm register

Product-owner review of the deployed site (2026-10-26). Three asks, verbatim: "hay que jugar con colores"; "hay que poner bombas de relojería, pirámides invertidas, etc. hay que atraer a la gente!!"; "recalcar que esto es en españa solo!!". Plus one defect: the Reproducir section advertises seven figures, five of which publish no value, no digest and no command.

Directive ids below are `R1` to `R7`, distinct from Revision 1's `D1` to `D8`. Findings are `G1` to `G6`, all from that review:

| # | Finding |
|---|---|
| G1 | The page is monochrome and reads as quiet to the point of not registering. Colour is doing no work because there is none. |
| G2 | Nothing in the first screens pulls a cold visitor forward: no tension, no shape, no reason to scroll past the hero. |
| G3 | The Spain-only scope is not unmistakable. A visitor can take the site for a generic or international analysis, which makes every national figure ambiguous. |
| G4 | Reproducir advertises seven figures, five of which publish no value. It offers a digest and a command for numbers that do not exist: a false reproducibility claim, in the section whose only job is to prove reproducibility. |
| G5 | The hero is one instrument showing one number, inside a hero defined to be a full viewport, so nothing can appear at the fold by construction. |
| G6 | There is no demographic evidence on the page at all. The two computed figures are money ratios, and the demographic driver (`T7`) is `unavailable`, so the site argues about pensions without ever showing the age structure the argument rests on. |

**The tension is real and is not resolved by pretending it away.** Revision 1 refused the alarm aesthetic on purpose: "collapse" iconography, red tickers and urgency copy are what a crank site looks like, and a site whose credibility is built on arithmetic cannot borrow the visual grammar of the sites it is arguing against. The owner is now asking for exactly that grammar. Neither capitulation (red on black, an illustrated fuse) nor refusal (a polite "we considered it") serves them.

**Resolution, and it is a rule, not a mood: drama from data, never from decoration.** A time bomb drawn as an icon is rhetoric; a countdown computed from an official projection and printed with its own uncertainty is evidence. This revision admits the second and refuses the first, everywhere, without exception. Concretely: the biggest type on the page becomes a number nobody has to trust (16 years, and the year it lands on, and the range across the six official projection variants); the most arresting shape on the page becomes the Spanish age structure in 2050, drawn from Eurostat, with the same provenance strip as every other computed thing. No icon, no fuse, no flag, no siren, no red.

**What this revision is not.** It does not touch the register system, the admin surface, the existing chart forms, the token values already verified, or any figure's computation. It adds one hue, one data view, one derived metric, one first-viewport composition, one scope marker, and one deletion.

### Severity ranking

| # | Directive | Finding | Severity |
|---|---|---|---|
| R1 | Population pyramid, the centrepiece | G2, G6 | **Blocks the brief** |
| R2 | The countdown, data-derived | G2, G5 | **Blocks the brief** |
| R3 | Colour system, register-safe | G1 | **Blocks the brief** |
| R4 | Spain-only scope, three levels, data-driven | G3 | **Blocks the brief** |
| R5 | First-viewport recomposition and page order | G2, G5 | **Blocks the brief** |
| R6 | Reproducir advertises only what exists | G4 | **Blocks launch** (correctness defect) |
| R7 | The alarm vocabulary that is refused | G1, G2 | Degrades quality if omitted |

G6 is the finding nobody named out loud. It is the substantive one: the pension argument is demographic, the page publishes two fiscal ratios, and the demography is invisible. The owner asked for pyramids and got something better than they asked for, which is a population pyramid that is the actual input to every other figure on the page.

### Dial values: unchanged, and why

`DESIGN_VARIANCE 5`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 5` stand. This is a deliberate answer to "hay que atraer a la gente", not an oversight.

- **Variance stays 5.** What changes is scale and colour, not composition. The pyramid is a wide, full-bleed three-panel instrument, which is more composition than the page has ever carried, but its grid is straight. Raising variance to 6 or 7 would add offset for its own sake, and offset is the cheapest kind of energy: it makes a page look designed to impress, which is the accusation this site cannot survive.
- **Motion stays 4, and this is the load-bearing refusal.** Owner pressure for drama produces animation nine times out of ten: a ticking counter, a scroll-triggered fuse, a number that counts up. All three are banned here (anti-patterns 5 and 6, and §R7). The countdown adds **zero** motion primitives. The three primitives from Revision 1 are unchanged and no new one is introduced. A static integer that a reader can verify is more alarming than an odometer, because the reader cannot dismiss it as a gimmick.
- **Density stays 5.** The pyramid plate is dense in the way the existing plates are dense: numbers, a table, a provenance strip. Nothing about this revision licenses page furniture.

### R1 (blocks the brief): the population pyramid, as the page's centrepiece. Findings G2, G6.

A three-panel age-structure view, server-rendered SVG, no JavaScript, carrying its own manifest. It is the largest single visual object on the site and it is the answer to "pirámides invertidas" that survives being checked.

**Not `fig-08`. A distinct component with its own manifest.** Recommended, and the reason is structural, not aesthetic:

- `FigureId` is a closed union of seven (`web/ingest/types.ts`) and each id maps to a metric's copy, edge cases, definitions and hero eligibility. A demography view is none of those: it is not one of the five metrics, it has no "national definition" counterpart, and it has no place in the `T3`–`T7` edge-case contract.
- Numbering it would invite the hero ladder (D2), the "no single headline implicit-debt number" rule (AC-001-25) and the thesis cross-reference set to start treating a population chart as a metric, which would blur both the metric set and the register boundary.
- Provenance is not optional, so the component carries the same `Manifest` shape from `web/manifest/types.ts` (whose `figureId` is already `string`), with its own `formulaId` and `definitionId` added to the documented closed sets, its own `inputHash`, its own `reproducePath`. It appears in Reproducir as its own group (§R6). Nothing about it is unverifiable.

**Data contract (semantics fixed here; the JSON schema is T17's job).**

- Two Eurostat datasets, both verified machine-readable on 2026-10-26 against the dissemination API:
  - `demo_pjan`, "Population on 1 January by age and sex". Dimensions `freq, unit, age, sex, geo, time`. Spain: 1960–2025. Age codes `Y_LT1`, `Y1`…`Y99`, `Y_OPEN`, plus `TOTAL` and `UNK`; sex codes `T`, `M`, `F`.
  - `proj_23np`, "Population on 1st January by age, sex and type of projection". Dimensions `freq, projection, sex, age, unit, geo, time`. Spain: 2022–2100. Age codes `Y_LT1`, `Y1`…`Y99`, `Y_GE100` (note: **not** `Y_OPEN`), no `UNK`; `projection` ∈ {`BSL`, `LFRT`, `LMRT`, `HMIGR`, `LMIGR`, `NMIGR`}.
- **The variant is pinned to `BSL`** (baseline) and named on the page. The other five are not decoration: they produce the range printed beside the countdown (§R2).
- Years shown: **1995, 2025, 2050.** 1995 is the earliest year the page already publishes (`fig-02` first observation), so the reader meets one past year rather than two; 2025 is the latest `demo_pjan` observation; 2050 is the year the 65-and-over share reaches its plateau (32.7% in 2050, 32.9% by 2055, and it stays between 32.7% and 33.1% for the next two decades), and it sits inside `T7`'s 2026–2070 horizon.
- 1995 and 2025 are labelled `observado`; 2050 is labelled `proyectado`. The label is a word, not a colour.
- **Granularity: 5-year bands, 21 rows** (0–4 … 95–99, 100+). Not single years: 101 rows × 2 sexes × 3 years is 606 bars, a 1.2px band pitch at 320px, and roughly triple the inline-SVG budget in §Chart strategy. 5-year bands keep a 3px minimum bar at 320px, keep the shape legible at every width, and put the single-year fidelity where it belongs, in the committed data file behind `reproducePath`. Stated cost: the 5-year bands smooth the 1970s cohort echo. A pyramid is read as a shape; that is the trade and it is deliberate.
- **Encoding: share of that year's total population, per band, per sex, in percent.** Not absolute counts. Absolute counts would make the panels incomparable (the population *grows*: 39.6M → 49.1M → 50.5M) and would let the 2050 panel look merely bigger when what changed is its composition. This is also the honest frame: the pyramid inverts while the population rises, and the caption says so in generated words, so no reader can carry away "Spain is emptying" from a chart that says the opposite.
- **Shared x axis across all three panels, 0 to 4.5% per side**, ticks at 2% and 4%. Shared scale is a hard rule: a bar of the same length must mean the same share in every panel. The observed maximum side share across the three years is 4.34% (1995, band 20–24), so 4.5% clips nothing.
- **Orientation: age increases upward.** 0–4 at the bottom, 100+ at the top. Deliberately *not* flipped. The inversion this directive is about is in the data — by 2050 the widest band sits at 70–74 and the 80–84 band is wider than the 0–4 band — and drawing the axis upside down would force the reader to translate before comparing, hand a critic the sentence "they drew it upside down to make a point", and buy nothing. The drama is that the real shape becomes a top-heavy pyramid; the drawing stays conventional so the shape can be believed.
- **Both sexes mirrored**, males left of the centre line, females right. The two sides differ by up to 0.7 points of total population in the same band at 2050 (80–84: 2.39% male, 3.09% female), which is a real component of the story, and mirroring is how every statistical office draws it. **Both sides use the same colour.** Sex is encoded by side and by the column header, never by hue: a pink/blue sex palette is the single most clichéd move in data visualisation and it would spend the page's scarce hue budget on something position already says.
- **One hue per panel**: 1995 `--chart-series-2` (the past as reference), 2025 `--chart-series-1` (measured now), 2050 `--chart-projection` (projected). The reader is never asked to compare hues inside one panel, only across panels, and each panel is also labelled with its year and its `observado`/`proyectado` word.

**Layout.**

- Block 4 of the page inventory, immediately after the source strip and **before** the register key. The register key still precedes every prose register, which is the ordering that protects the consensus/dispute/thesis separation; what moves ahead of it is an instrument, and the hero has been showing an instrument above it since Revision 1. Amended scroll contract row, which supersedes the corresponding row of the original table:

  | Stage | Reader's state on arrival | What the design must produce | What must NOT happen |
  |---|---|---|---|
  | Viewport 2, the pyramid | Cold but hooked by the countdown | "That shape is the reason the money numbers look like that, and I can check it." The claim as one generated sentence, then the three shapes. | No adjective, no "collapse", no projection presented as an observation, no fourth panel |

- ≥1024px: three panels side by side, equal width, `--space-6` gutters, a shared centre line, one age-label gutter on the outer left only.
- 1024–768px: three panels stacked, same scale, 8px band pitch.
- <768px: three panels stacked, 6px band pitch, age labels every 20 years only (0, 20, 40, 60, 80, 100+), percentage axis hidden. Three panels stay visible rather than a one-at-a-time selector: the argument is the *change between* them, and a selector would hide exactly the comparison the block exists for. The panels total about 440px at 320px and the block with its heading, sentence and readout about 560px, which is under one and a half screens.
- Above the panels: the `<h2>`, then the generated finding sentence at `--text-plate`, then the always-visible readout strip (six values, `--text-num-m` mono, two lines at <768px): `65+` and `<20` share for each of the three years. The readout is the claim; the charts are the evidence for it. This ordering also puts the *sentence* at the fold when the block peeks, instead of the empty apex of the 2050 pyramid (§R5).
- `<figure>` inside `<section id="demografia" aria-labelledby>`. The `<figcaption>` carries the mono label `DEMOGRAFÍA` (not `FIG. 0N`; it does not borrow the metric numbering), the `<h2>`, and the finding sentence.

**Provenance, and the trap in the file layout.**

- The public strip uses the D6 form, extended for a multi-source, multi-year view: three rows of `Fuente · Serie · Dato de` (1995 and 2025 from `demo_pjan`; 2050 from `proj_23np`, baseline variant named in the `Serie` cell), then `Fuente original ↗` and `Cómo se calcula`. The disclosure carries `fórmula`, `fuente`, `serie`, `dato de`, `huella sha256`, `ruta de reproducción`, `ventana de frescura`, plus the exclusion the definition requires: `UNK` age rows are excluded (`0` persons in both observation years) and the definition string says so.
- **The derived file lives at `data/derived/series/pyramid.json`, never at `data/derived/pyramid.json`.** `createFileDerivedStore().readAll()` parses every top-level `*.json` in that directory and casts `figureId` to the closed union; a top-level file would be read as a metric figure and would either crash or be published as one. The subdirectory is skipped by the flat `readdirSync`, which is the entire reason for it. Add a comment in the store naming that reason, so the next person who "tidies" the layout does not delete the constraint.

**States.** `computed` (the three-panel plate) and `unavailable` (a D1 ledger row named as a data view, no chart, no table, one sentence, no empty frames). Never `null-value`: the two datasets have no null cells in either observation year, and a partially populated pyramid would be a false shape. `withheld` if the manifest fails. The build fails loudly if either dataset fails to fetch (AC-001-05/06 unchanged); `unavailable` here means the series has never been specified, which is not today's state.

**Accessibility.** The table is emitted if and only if the chart is (§D5, AC-001-44/45), one component produces both. `<details>` summary labelled with the row count (`Ver los 21 grupos de edad`). Table: `<caption>` naming both datasets, the variant, and the three year totals; seven columns (`Grupo de edad | H 1995 | M 1995 | H 2025 | M 2025 | H 2050 | M 2050`); `<th scope="col">` on every column and `<th scope="row">` on the band; values right-aligned mono with `tabular-nums`; header labels from locale keys, never `H`/`M` literals. At <640px the table scrolls inside its own container. The SVG is `role="img"` with `aria-labelledby` the caption title and `aria-describedby` the readout strip; nothing exists in the SVG that is not in the readout or the table.

**Anti-patterns for this plate.** A fourth panel ("what if"); a projection drawn in the same colour as an observation; a silhouette or "ghost" pyramid overlay; a percentage-change callout; the word `colapso`, `invierno demográfico`, `hecatombe` or any other noun from the doom vocabulary (that vocabulary is thesis-only, AC-001-41); an inverted axis used as a visual pun; a single headline "2050" number in display type.

**Watch items the Coder must check.** (1) `Y_OPEN` versus `Y_GE100`: the two datasets spell the open-ended band differently. A hardcoded code silently drops the 100+ band from one dataset, which is precisely the quiet omission this page cannot afford. Resolve both by label, per the existing `resolveCategoryCode` discipline. (2) The `sex` dimension contains `T` alongside `M` and `F`; summing every sex code double-counts. Use `M` + `F` resolved by label, and assert `M + F == T` as a property test. (3) Band shares per year must sum to 100 ± 0.1 (property test). (4) The 2050 panel must render whenever 2025 does, and a missing third year is a build failure, not a two-panel plate.

### R2 (blocks the brief): the countdown, computed, with its uncertainty printed beside it. Findings G2, G5.

**What is being counted, exactly.** The year in which the **old-age dependency ratio** first reaches **50** under Eurostat's baseline projection: population aged 65 and over per 100 people aged **15 to 64**, Spain, `proj_23np`, `projection = BSL`, series 2022–2100.

- **15–64, not 20–64, and this is a checkability decision.** 15–64 is the age class behind Eurostat's own old-age dependency ratio, so a reader can put this number beside the publisher's published indicator and get the same answer. A 20–64 denominator would be our own definition, defensible but not printed by anyone, and the first critic to recompute it would find a different figure and be right to ask why. It is also the exact band this repository already resolves from labels for `lfsi_emp_a` ("From 15 to 64 years", `web/sources/eurostat.ts`), so one resolved age class serves the page twice.
- Threshold **50** because it is exact, one-clause expressible (`dos personas en edad de trabajar por cada persona de 65 o más`), and it is crossed cleanly and never re-crossed inside the horizon, so the answer is a single year rather than a first-of-many.
- **Verified values** (computed from the live dataset, 2026-10-26; the Coder should reproduce them and treat a mismatch as a pipeline defect, not as a copy problem): ratio 31.9 in 2025; 36.2 in 2030; 40.5 in 2034; 45.6 in 2038; **51.3 in 2042**; 59.0 in 2050; maximum 65.8 across the horizon.
- **The answer today: 2042, which is 16 years from the snapshot year 2026.** Arithmetic rule, fixed so nobody invents precision: `years = thresholdYear − snapshotYear`, both integers, both printed. Not months, not days, not a difference of dates. This is why the block cannot become a ticker: the underlying quantity changes when the projection is revised, not when the clock moves.
- **The range is printed beside the number, and it is not optional.** Across the six published variants the crossing lands: `NMIGR` 2039, `LMIGR` 2040, `LFRT` 2041, `LMRT` 2041, `BSL` 2042, `HMIGR` 2043. So the block prints `2042` and, in `--text-micro` mono directly under it, `variantes 2039–2043`. This is the single most credibility-preserving element in the whole revision: it refuses to pick the worst case, it survives "you chose the scary projection", and it strengthens rather than weakens the point, because a range of two years either side says the crossing is not a modelling artefact of one variant.

**Copy slots (keys, with the `es` exemplar).**

| Key | `es` exemplar | Slot |
|---|---|---|
| `countdown.eyebrow` | `Proyección central · Eurostat` | names source and variant in the label, before the number |
| `countdown.value` | `16` | `--text-num-xl` mono, `--ink-1` |
| `countdown.unit` | `años` | `--text-num-m` sans, `--ink-2`, beside the numeral, never inside it |
| `countdown.year` | `2042` | `--text-num-m` mono, `--data-projection` |
| `countdown.yearLabel` | `año del umbral` | `--text-micro` mono, `--ink-3` |
| `countdown.definition` | `Años hasta que la población de 65 y más años alcance 50 por cada 100 personas de 15 a 64 años.` | `--text-small`, `--ink-2`, one sentence, what is counted |
| `countdown.range` | `variantes 2039–2043` | `--text-micro` mono, `--ink-3` |
| `countdown.source` | `Eurostat, proyecciones demográficas 2024` · `Dato de 2025` | `--text-micro` mono, `--ink-3` |

Banned in every locale: `faltan`, `quedan`, `solo`, `apenas`, `ya`, `cuenta atrás`, `bomba`, `explota`, any exclamation mark, any second-person address, and any verb in the future tense other than the declarative `alcanza`/`cruza`. The sentence states what a projection says. It does not tell the reader what to feel, and the words `bomba de relojería` appear nowhere on the public surface: the owner's metaphor is the brief, not the copy.

**Where it lives.** Inside the hero instrument panel (§R5), above the figure strip. It is not repeated anywhere else on the page, and no other surface carries a "time is running out" line.

**States.**

| State | Cause | Rendering |
|---|---|---|
| `computed` | `thresholdYear` found within the horizon | full block as above |
| `not-crossed` | the pinned variant never reaches 50 inside 2022–2100 | **no numeral at all.** The projection-coloured rule, the eyebrow, and one sentence: the baseline projection does not reach the threshold before the horizon ends in 2100. Never substitute a different threshold to keep a number |
| `unavailable` | `proj_23np` never specified or never resolved | the block does not render; the hero falls back to the D2 ladder with no countdown, and the figure value returns to `--text-num-xl` |
| `withheld` | manifest invalid | same as `unavailable`; the block is a number carrier, so it renders nothing rather than an unprovenanced number |

The countdown is never a hero fallback carrier: if there is no figure subject and no countdown, the propositional hero (D2 tier 3) renders unchanged and the pyramid is still the pull below it.

**Why this and not the other two candidates.** (a) "Year the projected working-age population falls below a stated level" is honestly computable (peak 32.140M in 2027, 26.553M by 2070) but the *level* is arbitrary, and a level in millions is a magnitude a reader cannot calibrate; the ratio 50 per 100 is one a reader can hold. Instead of a second threshold, the block's disclosure prints the one real inflection it already has: the working-age population peaks in 2027 and declines afterwards. (b) "Countdown to the end of the projection horizon" is refused outright: that counts Eurostat's publication horizon, not a Spanish fact, and dressing a dataset boundary as a national deadline is exactly the kind of invention this site exists to not do.

**Provenance.** Own manifest, own `formulaId`/`definitionId`, own digest and reproduce path, and its own group in Reproducir (§R6). The definition string names what is counted and excluded in instrument vocabulary: `población de 65 y más años dividida por la población de 15 a 64 años, por año, proyección central de Eurostat`; it contains no adjective and no conclusion (AC-001-92).

**Anti-patterns.** A ticking clock; a fuse, bomb, hourglass or siren icon; `DÍAS` or `HORAS` beneath the number; a red number; a progress bar toward 2042; a "cuenta atrás" heading; the number appearing in the meta description or the share card (a cached share image with a countdown in it becomes a false claim within weeks, D7).

**Watch items.** (1) The series must be drawn entirely from `proj_23np`, including its own 2025 value (31.9), which differs from the `demo_pjan` 2025 observation on the same definition (31.2). Mixing an observation into a projection series is the small dishonesty that would discredit the large honest one; the disclosure states that the projection's 2025 back-cast and the observation differ, and by how much. (2) `thresholdYear` must be derived, not authored: change the threshold parameter and the year must move. (3) The variant range is computed over all six variants at build time, not typed as `2039–2043`. (4) The ratio depends on the age band; the band is a documented parameter beside the threshold, not a literal buried in the aggregation loop.

### R3 (blocks the brief): colour, without collapsing the three registers. Finding G1.

The page gets colour and gains exactly one hue. Three hues exist on the public surface, each bound to one meaning, and nothing else carries a hue (the last row of the table is the neutral set, listed only to close the list):

| Hue | Token | Means | May be used as | May never be used as |
|---|---|---|---|---|
| Teal | `--accent` (unchanged) | measured data and interaction | series stroke for observed values, links, focus ring, primary fill | decoration, a register marker, an urgency signal |
| Terracotta | `--data-deficit` (unchanged) | an adverse quantity | 2px rule, 3px border, small text at 4.5:1+ | a fill, a large area, anything inside a plot area |
| Olive-gold | `--data-projection` (**new**) | a projected extent, not yet measured | stroke or fill for a projected series, the countdown threshold rule, the threshold year numeral | any observation, any deficit mark, any text that is not about a projection |
| Neutrals | `--ink-*`, `--rule-*`, `--surface-*` | everything structural | text, rules, grounds, axes | — |

Why olive-gold, with evidence rather than taste:

- **It is the only hue left.** Red is banned (anti-pattern 1), purple and indigo are banned (anti-pattern 7), and pink/blue for sex is refused (R1). Blue was the other candidate and it fails on accessibility, not on style. Simulated deuteranopia and protanopia (Machado severity 1.0), CIE76 ΔE against the existing teal accent: olive-gold **45.3 / 42.9 deutan / 59.8 protan**; a slate blue `#2B4A5E` **24.5 / 12.5 / 14.1**. Blue collapses into the accent for a dichromat reader; olive-gold does not. That is why the hue is warm.
- **And it collides with terracotta for the same readers** — ΔE olive-gold vs terracotta is 33.6 normal but **10.8 under deuteranopia**. So the separation between "projected" and "adverse" cannot rest on hue for everyone. It rests on three redundancies that are therefore mandatory, not optional: a **dash pattern** (`--dash-projection: 6 4`) on every projected line, **position** (a projected panel is its own panel; a deficit mark is never inside a plot), and a **printed word** (`proyectado`, `umbral`). Colour is the third encoding, never the first.

**Allowed meanings, enforced at review.**

| Surface | `--data-projection` | Urgency language |
|---|---|---|
| Hero countdown | yes: the threshold rule and the year numeral | yes, declarative only (§R2 copy rules) |
| Pyramid, 2050 panel | yes: the only projection-coloured fill on the page | no |
| Figures 1–7 plates | only for a projected *extent*. `fig-05`'s `g_proj` is a single reference marker, so it stays `--ink-1` | no |
| Register key, consensus, dispute | no | no |
| **Thesis** | **no, and this is the rule that keeps the register** | n/a |
| Reproduce, assumptions, revisions, footer, share card | no | no |
| `/admin` | separate palette, unchanged | separate vocabulary |

**The rule that keeps the thesis distinguishable, now that colour exists.** Before this revision, colour was absent everywhere, so it could not blur the registers. Now it exists, so the thesis becomes the one block where hue is *forbidden*: `--surface-3` ground, `--ink-1` text, the 4px ink rule, the serif, the signature, no hue of any kind, and no projection-coloured area adjacent to it without a 1px `--rule-1` separator. The absence is now a marker rather than a default. A reader who has learned that warm-gold means "a projection, not a measurement" learns, one block later, that nothing here is gold: the site's opinion is not a projection and does not get to look like data. That is a stronger separation than the page had when it was monochrome.

**Where urgency may not appear, stated as bans.** No urgency in the metric plates, the dispute, the thesis, the reproduce block, the assumptions ledger, the footer, or the share card. No urgency icon, badge, pill, siren, countdown chip or "act now" phrasing anywhere. Urgency is legal in exactly one block, and inside it urgency is carried by scale and by the datum, never by colour temperature.

**Contrast verification for every new pair** (WCAG 2.1, computed; AA 4.5:1 text, 3:1 non-text):

| Pair | Ratio | Verdict |
|---|---|---|
| light `--data-projection` on `--surface-1` | 6.22 | AA |
| light `--data-projection` on `--surface-2` | 5.82 | AA |
| light `--data-projection` on `--surface-3` | 5.45 | AA |
| light `--data-projection` on `--data-projection-ground` | 5.23 | AA |
| light `--ink-1` on `--data-projection-ground` | 13.51 | AAA |
| light `--ink-2` on `--data-projection-ground` | 7.74 | AAA |
| light `--ink-3` on `--data-projection-ground` | 4.51 | AA |
| dark `--data-projection` on `--surface-1` | 10.26 | AAA |
| dark `--data-projection` on `--surface-2` | 9.53 | AAA |
| dark `--data-projection` on `--surface-3` | 8.72 | AAA |
| dark `--data-projection` on `--data-projection-ground` | 8.17 | AAA |
| dark `--ink-1` on `--data-projection-ground` | 12.48 | AAA |
| dark `--ink-2` on `--data-projection-ground` | 8.10 | AAA |
| dark `--ink-3` on `--data-projection-ground` | 5.06 | AA |
| `--data-projection` vs `--accent`, dichromacy | ΔE 45.3 / 42.9 / 59.8 | distinguishable with the dash rule |
| `--data-projection` vs `--data-deficit`, deuteranopia | ΔE 10.8 | **not** distinguishable by hue: dash, position and the printed word are mandatory |

`--data-projection-ground` is 12% of the hue over `--surface-1` in each theme, and only over `--surface-1`: at 12% over `--surface-2` the `--ink-3` pair drops to 4.24 and fails AA, so a plate needing the tint takes it over `--surface-1`, not over an inset.

### R4 (blocks the brief): Spain only, at three levels, from data. Finding G3.

The marker is **typographic, in a locale key, and derived from the country record**. No flag, no map silhouette, no badge, no pill (anti-pattern 2's stock-imagery ban covers flags; a pill is the most recognisable template signature this design spends effort avoiding).

**Level 1, the first viewport.** Two mechanisms, redundant on purpose:

1. **The `<h1>` itself names the scope.** Content-model validation: in every locale, `hero.statement` must contain the country's display name (`country.ES.name` in that locale). Not "should", must: a build that fails this check fails. The headline is the only string a social visitor reads, so the scope belongs in it, and this is the one place where the marker cannot be a separate element.
2. **A scope line directly under the `<h1>`**, above the subtext: `ESPAÑA` in `--font-mono` at `--text-meta` with `--tracking-label`, `--ink-2` (9.21:1 on `--surface-1`), followed by a `·` and the coverage clause (`sistema contributivo de la Seguridad Social`) in the same line. Uppercase is permitted here for the same reason it is permitted for the two-letter locale codes: it is a label, not a headline. 24px of vertical presence, no border, no ground, no icon.

**Level 2, every figure.** The D6 public provenance strip gains a fourth field, `Ámbito`, rendered in the same labelled grid (`Fuente · Serie · Dato de · Ámbito`), value `España`. It is generated from the country record like every other strip field. The pyramid gets the same field. The figure tables' `<caption>` sentence also names the scope, because a table can be read out of context.

**Level 3, shared and social artefacts.** The `<title>` template takes a scope suffix from the country record (`… · España`); `og:title` uses the same derived string; the share card (§D7) gains one line, the scope mark, in the card's existing type system. D7's rule stands unchanged: **no metric, no number, no date on the share card.** A country name is none of those, and it is the one string that survives every revision of every figure.

**How it degrades when a second country arrives.** The marker is not the string "España"; it is `country.<GEO>.name` resolved through the content model for the requested `(country, locale)`, and the coverage clause is `country.<GEO>.scopeClause`. Adding France is a content row plus a `geo` in `PUBLISHED_GEOS`, and every level picks it up with no code change:

| Published geos | Header and hero mark | Share card and `<title>` |
|---|---|---|
| exactly 1 (today) | plain text, not a control. Anti-pattern 18 stands: a single-option switcher is worse than none | that country's name |
| 2 or more | the mark becomes the country index, the same bare `<details>` pattern as the mobile site index, no flags, no dropdown styling | the requested country's name |

Two failure modes, both loud: a country record missing `name` or `scopeClause` in any published locale fails the build (it is a content bug, and silently falling back to `ES` would relabel a French page as Spanish); and `Ámbito` never renders an empty cell, because a strip with a blank field is a claim without a scope.

**Anti-patterns.** A flag (any flag); a map outline; the EU stars; `España` in the wordmark (the wordmark is the publication, the scope is the data); a "coming soon: more countries" line; a disabled country selector; the scope mark repeated in a footer only.

### R5 (blocks the brief): the first 900px. Findings G2, G5.

The problem is structural, not cosmetic: the hero is *defined* to be a full viewport (`min-height: calc(100dvh - var(--header-h))` at ≥768px), so at any common laptop height the next section cannot appear at the fold by construction, and there is nothing to scroll toward. Three changes, and no modal, no interstitial, no scroll cue, nothing hidden behind interaction.

1. **`--hero-min-h: 560px` at ≥1024px, replacing `min-height: calc(100dvh - var(--header-h))`.** This supersedes the D2 hero-height rule and the corresponding line in §Page shell. At 1280×800 that leaves roughly 176px of the pyramid block visible at the fold: its heading, its generated finding sentence, and the top of the readout strip. The reader is pulled by a *sentence about the data*, not by the empty apex of a chart, which is why the sentence sits above the panels (R1) rather than below them.
2. **The hero panel becomes one plate carrying two instruments, in strict hierarchy.** Supersedes the hero instrument panel description in §Page shell for the case where the countdown is `computed`:
   1. `countdown.eyebrow` mono micro;
   2. a 3px `--data-projection` rule, full panel width, top edge of the countdown block;
   3. the countdown row: `16` at `--text-num-xl` with `años` beside it, `2042` at `--text-num-m` in `--data-projection` under `año del umbral`;
   4. `countdown.definition`, one sentence, `--text-small`;
   5. `countdown.range` and `countdown.source`, `--text-micro` mono;
   6. a 1px `--rule-1`, then the figure strip: the ladder's figure label, its value at **`--text-num-l`** (demoted from `--text-num-xl`), the three dated comparisons, `Cómo se calcula`, and the snapshot stamp.

   Two numerals at `--text-num-xl` would be two headlines and therefore no hierarchy; the countdown takes the largest size because it is the only number on the page whose *scale* is unfamiliar, and because it is unconditional (it does not depend on which metric is computable). When the countdown is not `computed`, the figure value returns to `--text-num-xl` and the panel is exactly as Revision 1 shipped it. One boolean, tested both ways, no third composition.
3. **Colour placement in the first viewport, as a budget of two.** The only coloured elements above the fold are the 3px threshold rule and the `2042` numeral, both `--data-projection`. Everything else is ink on paper. This is what makes the colour read as a signal: a page with two coloured marks in its first screen has a hierarchy that a page with ten does not.

**What the hero must show, complete list.** Skip link; stale banner if stale; header; scope line; `<h1>` naming Spain; subtext ≤20 words; one primary CTA and one secondary link; the countdown; the figure strip with its three comparisons and the snapshot stamp. That is all. **What it must not show:** the pyramid itself (it is the destination, not the hook), any chart in the hero, a scroll cue, a badge, an icon, a second countdown, a "share" control, and any number without its provenance link within one click.

**The propositional hero (D2 tier 3), amended.** It keeps its 8/4 grid, its method-first ordering and its status summary, and it gains the scope line and the countdown. Because the countdown numeral is a projection-derived fact rather than a figure, D2's rule that no numeral larger than `--text-micro` appears above the fold is **superseded for the countdown only**, and the countdown renders at `--text-num-l` (32px) so the `<h1>` remains the largest type on the page. The hierarchy claim D2 was protecting, that the site never spends its largest type announcing an absence, still holds: the countdown is not an absence.

**Nav.** No fifth anchor. The countdown links to `#demografia`, and that is the only new path into the block. D8's 1024px width budget (298px at 320px, one row) is not disturbed, which is the reason for this restriction.

**Anti-patterns.** A full-viewport hero; a scroll arrow; a hero image of any kind; a `16` that counts up on load; a sticky countdown bar; a modal; a "¿Sabías que…?" interstitial.

**Watch items.** (1) The 560px minimum must not clip the panel at 1024×620 with a stale banner present: measure with the banner and at 200% zoom. (2) If the two-instrument panel starts to read as a dashboard, the fix is fewer elements inside one plate, never a second card. (3) The `<h1>` scope validation must be a build-time check, not a review habit.

### R6 (blocks launch): Reproducir advertises only what exists. Finding G4.

Measured defect: `ReproduceBlock` maps over every derived figure, so five `unavailable` figures render a title, a `formulaId`, a snapshot date, a 64-character digest and a reproduce command, none of which describes a value that exists. It advertises reproducibility for numbers the site does not publish. On a page whose entire promise is "everything here is checkable", that is the most damaging possible bug, because it is a false claim in the section whose job is to prove nothing is a false claim.

**Rendered form.**

- Rows are rendered for `availability === 'computed'` figures only (today: two), grouped, followed by one group for the derived series (the pyramid, if `computed`). Row content is unchanged from §Page shell.
- Above the groups, one generated count line in `--text-micro` mono: `2 figuras calculadas · 1 serie derivada` (both numbers from data, no authored plural).
- Below the last group, **one** line in `--text-small` `--ink-2`, from the `reproduce.omitted` key with `{unavailable}` and `{total}` slots: `5 de las 7 figuras no tienen valor calculado en este despliegue y no tienen huella ni comando de reproducción. Arriba aparecen con su método.` The count is derived. The line renders nothing when `unavailable === 0`, so the sentence can never become false.
- **No row, no cell, no chip and no placeholder for an `unavailable` figure in this section.** The five already have their canonical rendering one screen up, as D1 ledger rows with a state word, a reason and a method link. Duplicating them here would add five rows whose only content is an absence, which is exactly what D1 was written to stop.
- `data-operator="true"` stays: this is operator vocabulary by D3's definition, and the gate must keep ignoring it.

**Invariants, testable.** `rendered row count === figures.filter(computed).length + series.filter(computed).length`; no `<code>` element inside the section matches `[0-9a-f]{16,}` unless its row's figure is `computed`; the omitted line's number equals the unavailable count; nothing in the section names a figure as reproducible unless a digest for it is rendered.

**Watch item, and it is a live trap.** The block derives each row's public title with `Number(figure.figureId.slice(-1))`. That works only while every id is `fig-0N`. It breaks the moment a non-numbered derived artefact enters the section, which R1 introduces. Route the label through an id-to-key lookup, not an arithmetic slice on the id string.

### R7 (degrades quality if omitted): the alarm vocabulary that is refused.

Written down because a future maintainer, told "make it more dramatic" and shown a page with a warm-gold rule at the top, will reach for an icon, and the icon is the whole difference between this site and the ones it criticises. The refusals are enumerated in the closing block of this revision; what belongs here is the rule that generates them, so the next judgement call does not need to be escalated:

> **Anything a reader could not verify is decoration. Anything a reader can verify is drama.**
>
> A drawn bomb, a red badge, a siren, an arrow, a silhouette, a pulsing dot, a counter that moves: none of these can be checked against a source, so they add only assertion. A year, a share, a range of variants, a pyramid whose bars can be summed: all of them can be checked, so they are permitted at any scale the layout can carry.

Three consequences, for the Coder:

- The visual intensity of this page is permitted to come from **size, density and contrast**, and from nothing else.
- Any element that exists to add feeling without adding a verifiable quantity is out, regardless of how good it looks. That includes the temptation to make the countdown numeral warm-red at the last minute.
- The anti-pattern list in §"Anti-patterns banned on this product" is extended, not weakened: item 6 (no live semantics) now explicitly covers countdowns rendered as tickers; item 7's hue ban stands, and `--data-projection` is not an exception to it because it is not violet, indigo, red or neon.

### New tokens (Revision 2)

Nine, and nothing else. The declarations are authoritative here; §Colour points at them.

```css
/* Revision 2 — the alarm register. One hue, two aliases, layout only beyond that. */
--data-projection:        #6A5A12;   /* dark: #D8C05C. Projected extent. Hue 49deg */
--data-projection-ground: color-mix(in srgb, var(--data-projection) 12%, var(--surface-1));
--data-projection-edge:   color-mix(in srgb, var(--data-projection) 40%, transparent);

--chart-observed:         var(--accent);            /* measured; aliased so the pair is symmetric in code */
--chart-projection:       var(--data-projection);   /* projected; never used without --dash-projection */
--dash-projection:        6 4;                      /* stroke-dasharray on every projected line */

--rule-projection:        3px;       /* the countdown threshold rule */
--hero-min-h:             560px;     /* supersedes min-height: calc(100dvh - var(--header-h)) >=1024px */
--pyramid-band-h:         14px;      /* 5-year band pitch; 8px <1024px, 6px <768px */
```

Dark-mode declaration, to be added inside the existing `[data-theme='dark']` block:

```css
--data-projection: #D8C05C;
```

`--radius`, `--shadow`, the type scale, the space scale and every existing colour value are untouched. The pyramid's axis maximum (4.5) and the share-card dimensions stay constants in their chart module and build script, not tokens, for the reason Revision 1 gives: a token invites its use in layout.

### Scenarios that need amending

| Scenario | Status | What the specifier must do |
|---|---|---|
| **AC-001-44**, **AC-001-45** | Unchanged, and the pyramid is their first real test | The pyramid's table must carry the same 21 bands × 3 years × 2 sexes as the chart. No text change needed; add the pyramid as an explicit example so the coupling is exercised on a chart that is not a metric |
| **AC-001-25** | Unchanged | The countdown is not implicit debt and does not relax the single-headline ban there. Nothing to do |
| **AC-001-35** | Unchanged | R4 adds a validation rule (scope strings from the country record). AC-001-35 already forbids the literal, so this is enforcement, not amendment |
| **AC-001-78** | Unchanged, but blocks R1/R2 until the data exists | The pyramid and the countdown need new `formulaId` and `definitionId` entries in the documented closed sets, or their manifests fail validation. Data change plus the documented set, no scenario change |
| **AC-001-80** | Unchanged | The scope mark must not become a country control while only `ES` is published (R4's degradation table) |
| **AC-001-92** | Unchanged | Applies to the two new definition strings, which are instrument vocabulary |
| **AC-001-01**, **AC-001-02**, **AC-001-03** | Unchanged | The pyramid and countdown carry the same `Manifest` shape; their digests are computed over their own input snapshots |
| **AC-001-05**, **AC-001-06** | Unchanged | A failed `proj_23np` or `demo_pjan` fetch fails the build; neither new artefact may publish `unavailable` to dodge a fetch failure |

### What this revision contradicts

Declared rather than buried, because each one is a directive someone could otherwise cite against this work.

1. **The scroll contract's viewport-1 row.** It says the hero must produce "no argument, no adjective, no urgency" and specifically forbids urgency. R2 puts a countdown in the hero, which is urgency. The row is superseded for the hero only, and the justification is narrow: the urgency is a computed integer with its source, its variant range and its definition printed beside it, and it carries no evaluative adjective. Every other row of that table stands, including "no urgency" for the metric plates.
2. **D2 tier 3's no-numeral rule.** `--text-num-l` is larger than `--text-micro`. Superseded for the countdown only, at a size below the `<h1>`, with the reasoning in R5.
3. **D2's hero `min-height`.** `calc(100dvh - var(--header-h))` is replaced by `--hero-min-h: 560px` at ≥1024px. The full-viewport hero is the structural cause of the "nothing to scroll toward" reading.
4. **§Page shell's hero instrument panel.** Its contents are reordered and its figure numeral demoted when the countdown renders. The panel's construction, ground, border and stamp are unchanged.
5. **§Page inventory gains one block** (the pyramid, inserted as block 4), so the count goes from sixteen to seventeen. Section count 13 to 14, eyebrow count still 3, budget `ceil(14/3) = 5`. The inventory's numbering shifts by one from block 4 onward; no block id changes.

Nothing else is contradicted. In particular the three-register table, the token values, the chart forms, the four-rate implicit-debt rule, the `<details>`-over-modal discipline, the thesis confinement rule and the admin surface are all untouched.

### New tasks and scenarios the Specifier must formalise

Five additions, plus two rendering invariants. Scenario numbers start at `AC-001-93` (the highest in use is 92).

**T17 (new, implements R1) — population age structure.** Ingest `demo_pjan` and `proj_23np`, band to 21 five-year groups, compute per-sex shares of each year's total, select 1995/2025/2050, write `data/derived/series/pyramid.json` with its own manifest, and expose the axis maximum. Scenarios:
- `AC-001-93` — band aggregation: single-year codes resolve to 5-year bands, the open-ended band resolves from **either** `Y_OPEN` or `Y_GE100` by label, and the 100+ band is present for every year (this is the scenario that catches the dropped band).
- `AC-001-94` — `M + F == T` per band and per year; band shares sum to 100 ± 0.1; `UNK` excluded and recorded in the definition string.
- `AC-001-95` — the derived file carries a complete manifest with a `formulaId` and `definitionId` from the documented sets, its own `inputHash`, and a `reproducePath` that resolves; an unknown id fails validation.
- `AC-001-96` — the file is written to `data/derived/series/`, and `readDerivedFigures()` does not pick it up as a metric figure.
- `AC-001-97` — the chart and the table are emitted together or not at all (the AC-001-44 coupling, exercised on the pyramid).

**T18 (new, implements R2) — projected threshold crossing.** Compute the old-age dependency ratio per year from `proj_23np` `BSL`, find the first year at or above the documented threshold, compute the countdown against the snapshot year, and compute the crossing year for all six variants. Scenarios:
- `AC-001-98` — the ratio is computed from the pinned variant and pinned age definition, and the threshold is a documented parameter, not a literal: changing it changes the year.
- `AC-001-99` — `years = thresholdYear − snapshotYear`, both integers, both printed with the number; a check that no sub-annual unit appears.
- `AC-001-100` — the variant range is computed over all six variants and printed; a variant that never crosses is excluded from the range and does not make the block fail.
- `AC-001-101` — when the pinned variant never crosses the threshold inside the horizon, the block renders no numeral and the fixed sentence; it never substitutes a different threshold, and the hero falls back to the D2 ladder.

**T19 (new, implements R4) — country scope mark.** `country.<GEO>.name` and `.scopeClause` in five locales, the `<ScopeMark>` component at the three levels, the `hero.statement` validation, the `<title>`/`og:title` derivation, and the share-card line. Scenarios:
- `AC-001-102` — the scope mark renders from the country record in all five locales; no hardcoded country string exists in any component.
- `AC-001-103` — a build whose `hero.statement` does not contain the country name in some locale fails.
- `AC-001-104` — with exactly one published geo the mark is text and not a control; with two or more it is the country index; it is never a disabled or single-option control.

**T2 (amended, implements R6) — Reproducir truthfulness.** One scenario: `AC-001-105` — the reproduce section renders a row only for a `computed` figure or series, its omitted-count line equals the unavailable count, no digest or command is rendered for an unavailable figure, and the section's rows are labelled without deriving a key from the id string.

**T8 (amended, implements R4) — scope content.** No new scenario beyond `AC-001-102`/`AC-001-103`; the country record's two new fields are additive content, and the existing locale-completeness scenario covers their presence once the fields are listed in it.

**R3 and R5 (no new task).** The colour tokens land in the rendered tasks that use them (T3–T7, T11, T17), and R5's composition lands in the existing hero work, which already has a task. Two invariants belong as scenarios anyway:
- `AC-001-106` — every projected value is encoded by dash and by a printed word as well as by hue, so no projected data is distinguished by colour alone (R3).
- `AC-001-107` — at 1280×800 and 390×844 the hero does not occupy the full viewport, and the demography block's heading and its finding sentence are visible without scrolling (R5).

**Suggested order.** T19 and the T2 amendment first (small, immediately visible, and the Reproducir fix is the launch blocker); then T17 (ingest plus plate, the largest piece); then T18, which depends on T17's dataset reader and nothing else; then R3's tokens and R5's hero, which can land against whichever figure state exists at that point.

### What this revision refuses to specify, with the reason

1. **A clock bomb, fuse, hourglass, siren, alarm bell, or any illustration of time running out.** Reason: it is unfalsifiable, so it adds assertion and no evidence, and it is the exact crank tell the informal spec names. R7's rule generates the refusal.
2. **A ticking, animating or sub-annual countdown.** Reason: it would imply the number changes as the clock moves, when it changes only when the projection is revised; it violates anti-pattern 6 (a snapshot is a snapshot) and 5 (no animated counters), and precision below a year would be false precision, since the crossing year moves by up to three years across the six official variants.
3. **Red, alarm red, or any "critical" hue for the countdown.** Reason: the page may not assert that a threshold crossing is bad; that judgement belongs to the thesis register and is labelled there. Terracotta stays reserved for quantities the data itself marks as adverse.
4. **A literally inverted axis, or an upside-down pyramid drawn for effect.** Reason: it costs the reader a translation, buys no information, and hands a critic the sentence "they drew it upside down to make a point". The inversion must be the data's.
5. **A flag, a map, or the EU stars in the scope mark.** Reason: a flag is the stock cliché banned in anti-pattern 2, it equates a state with the system being measured, and one flag cannot represent five locales.
6. **The countdown number on the share card, in the meta description, or in any OG image.** Reason: third parties cache share images for weeks, so a number there becomes a false claim the first week after a revision (D7's standing rule).
7. **An international ranking ("Spain is second worst in the EU").** It is computable from the same dataset and it would pull readers hard. Reason: it changes the site's subject from "here is the arithmetic for Spain" to "Spain versus others", requires a sourcing and definition contract for every peer, and collides with v1's single-country scope (AC-001-80). Proposed instead as a follow-up spec with its own data contract and its own dispute section.
8. **A regional (CCAA) pyramid.** Reason: INE regional data is a document/manual source in this project's source classes, it triples the ingest surface, and a regional age map invites a political reading the instrument register cannot carry. Follow-up spec at most.
9. **A second threshold, or a selector over thresholds.** Reason: one threshold with its range is evidence; a slider over thresholds is a toy that lets the reader manufacture the answer they prefer, which is the opposite of what this page is for.
10. **A warm section ground for the demography block.** Reason: grounds encode register. A fourth tint would dilute a system that currently works precisely because there are exactly three, and the block is an instrument, which already has a ground.
11. **An alternative projection variant rendered side by side as a fourth panel.** Reason: it is the most tempting addition and it would be decoration dressed as rigour. The uncertainty is stated as a range beside the number; six panels of "what if" would bury the one shape that makes the argument.


## Revision 3: the anchor and the paper

Product-owner review of the deployed revision 2 (2026-10-26). Two asks, verbatim: *"it looks too formal the color of the web"*, and *"i still do not see like a clock that is counting to our destruction, like i want. a ticking bomb it is what i want."*

Directive ids below are `P1` to `P5`, distinct from Revision 1's `D1` to `D8` and Revision 2's `R1` to `R7`.

| # | Finding |
|---|---|
| K1 | The palette reads as an official form. Every neutral sits under 3 units of chroma and, apart from the warm terracotta, under 200° of hue: the paper is a green-cast grey, the ink is a blue-cast black, and the accent is a desaturated teal. Three cool, low-chroma decisions plus zero radius plus hairline rules is a government form. |
| K2 | There is no moving element anywhere on the page. Revision 2 refused a ticker on purpose and shipped a static integer; the owner does not perceive a clock, and a static number cannot produce the reading they are asking for. |
| K3 | The formality is not only colour. The mono-label system (12px mono label above 13px mono value, in every metadata block) is literally a field form; the hero panel is a bordered box; the top of the type scale is 60px against a 12px floor, a 5× range where a bulletin runs 7-8×. |
| K4 | A ticking element is the most persuasive device the page could carry, and the most dangerous. Unanchored, it is exactly the crank tell Revision 2 refused, and it would be false: the threshold is a year, not an instant. |
| K5 | The palette change moves the admin surface's contrast pairs whether or not the admin design changes, because admin shares `--surface-*` and `--ink-*`. That regression is this revision's to verify, not the Coder's to discover. |

**The condition, restated as the design, not as a caveat.** The clock counts to **1 January 2042**, the conventional date assigned to the threshold year, and that anchor is printed beside the clock in every state where the clock renders. It is a date the reader can check against their own calendar. That is the entire honesty of the effect: the reader can verify the target, so the motion is a measurement rather than a mood. An anchor that is implied, hidden in a `title`, inside a `<details>`, or derived from nothing is not permitted by this revision.

**What this revision is not.** It does not touch the three registers, the pyramid, the Reproducir section, the admin views, the chart forms, `--radius`, `--shadow`, or the token names. It adds no hue. It replaces the neutral and accent values, adds one continuous motion primitive, and de-formalises four non-colour surfaces.

### Design read, restated

Reading this as: **an editorial data-journalism instrument for a skeptical cold visitor, printed on warm paper with a warmer ink, leaning toward native CSS + Tailwind v4 tokens + server-rendered SVG and exactly one continuous motion primitive.**

The product has not changed. It is still a measuring instrument that happens to be a magazine. What changes is the paper it is printed on, and that one reading on it moves.

### Dial values

- **DESIGN_VARIANCE: 5**, unchanged. The clock is a vertical stack inside a plate that already exists; it adds no composition. Formality is a property of material and typography, not of symmetry, so raising variance would have been motion for its own sake and would have missed the complaint entirely.
- **MOTION_INTENSITY: 4 to 5.** This is the revision's one dial change and it is accounted for, not conceded. The dial counts primitives. Revision 2 had three (plate entry, 120ms transitions, the matrix stagger) and refused a fourth. The clock is the fourth and the only *continuous* one, so the number moves. 5 is the ceiling and the ceiling is load-bearing: 6 would license a second continuous primitive, scroll-driven motion, or a transition between registers, and all three remain refused. Within 5, the clock's motion is deliberately the smallest the medium allows: 1 Hz, on three fields 15px tall, in the panel's least prominent type.
- **VISUAL_DENSITY: 5**, unchanged in number, redistributed in fact. Chrome density falls (mono labels leave, five ledger rules leave, the panel border leaves) while plate density is untouched. The page gets less crowded without losing a number.

### Severity ranking

| # | Directive | Finding | Severity |
|---|---|---|---|
| P1 | The palette: warm paper, warm ink, a present accent | K1 | **Blocks the brief** |
| P2 | The anchored clock | K2, K4 | **Blocks the brief** |
| P3 | Formality beyond colour: four surfaces | K1, K3 | **Blocks the brief** |
| P4 | Register safety for the clock | K4 | **Blocks launch** (correctness) |
| P5 | The refusals that survive the clock | K2, K4 | Degrades quality if omitted |
| — | Admin contrast re-verification | K5 | **Blocks launch** (regression) |

K3 is the finding the owner did not name. They said "the colour", but a warm palette alone on a page whose metadata is a stack of mono field labels would read as a warm government form. P3 is the other half of P1.

### P1 (blocks the brief): the palette. Warmth from ground, ink temperature and accent saturation. Finding K1.

**Diagnosis, measured rather than asserted.** In CIELCh, which separates "how dark" from "how coloured" from "which colour":

| Token | Old value | L\* | C\* | h | Reading |
|---|---|---|---|---|---|
| `--surface-1` | `#F4F5F2` | 96.39 | 1.57 | 123° | a green-cast grey with almost no colour at all |
| `--ink-1` | `#141A1B` | 8.71 | 2.98 | 213° | a blue-cast black |
| `--accent` | `#17564A` | 32.55 | 23.00 | 177° | a desaturated teal |

Three cool decisions, none above 3 units of chroma except the accent. That is the form: no material, no temperature, and therefore no presence. The 0 radius and the hairline rules finish the job, and P3 addresses those.

**Directive.** Replace the neutral and accent values in both themes. The hue count stays three. No red is added, no fourth hue is introduced, and `--data-deficit` does not change at all.

```css
/* light (default) — supersedes the light block in §Global Tokens §Colour */
--surface-1:  #F5EFE2;   /* warm paper */
--surface-2:  #EEE7D7;   /* plate ground, inset */
--surface-3:  #E7DECB;   /* thesis inset, mono/code blocks */
--ink-1:      #1B1610;   /* warm near-black */
--ink-2:      #443B2F;   /* body secondary, captions */
--ink-3:      #5F5544;   /* metadata, axis labels */
--rule-1:     #D3C9B6;
--rule-2:     #B5A992;
--accent:     #0E5C3C;   /* pine. Measured data + interaction, unchanged meaning */
--on-accent:  #F5EFE2;
--chart-series-2: #6B6759;

/* changed too, and only to hold 4.5:1 on the warmer, darker grounds: */
--data-projection: #6B520A;   /* was #6A5A12 */

/* deliberately NOT changed: */
--data-deficit: #96472A;

[data-theme='dark'] {
  --surface-1:  #15110D;
  --surface-2:  #1D1813;
  --surface-3:  #27211A;
  --ink-1:      #F2EDE1;
  --ink-2:      #C6BDAE;
  --ink-3:      #9B9182;
  --rule-1:     #312A22;
  --rule-2:     #473E34;
  --accent:     #63C398;
  --on-accent:  #15110D;
  --chart-series-2: #A8A292;
  --data-projection: #D8BF60;
  --data-deficit:    #D08A63;   /* unchanged */
}
```

**What each move buys, in numbers rather than adjectives.**

| Move | Before | After | Evidence |
|---|---|---|---|
| Ground temperature | C\* 1.57, h 123° | C\* 6.99, h 91.5° | 4.4× the chroma, hue rotated from green-grey to amber-yellow; ΔE 5.99 |
| Ground presence | L\* 96.39 | L\* 94.58 | 1.8 L\* darker. A paper, not a screen |
| Ink temperature | C\* 2.98, h 213° (blue) | C\* 4.60, h 74.5° (amber) | the ink rotates 139° across the hue circle; ΔE 7.20 |
| Accent saturation | C\* 23.00, h 177° | C\* 33.28, h 158.6° | +45% chroma, hue rotated 18° toward yellow and away from teal; ΔE 13.64 |
| Dark ground | `#0F1416` (blue-black) | `#15110D` (warm charcoal) | ΔE 5.12 |

**The three hard rules that keep this from becoming a campaign.**

1. **No red.** No value in the public palette moves toward the red band. `--accent` stays in the green band (h 158.6°), `--data-deficit` stays a muted terracotta at h 46.3°, and the projection hue moves by 1.3° (86.5° to 85.2°), which is a lightness correction rather than a hue change. Warmth comes from the *paper* and the *ink*, not from urgency.
2. **`--data-deficit` is byte-identical to Revision 2 (ΔE 0.00).** It is the one hue whose warmth is load-bearing: it already reads as adverse because it is the warmest chromatic value on the page, and warming it further would collapse "adverse quantity" into "alarm", which is the single thing anti-pattern 1 and R7 exist to prevent. If a future revision wants more heat, it warms the paper, not the alarm.
3. **No fourth hue, no gradient, no texture, no grain overlay, no paper photograph.** The warmth is a value in the token layer. A photograph of paper would be the first decoration on a page whose whole argument is that it does not decorate, and it would be a stock-image tell under anti-pattern 2.

**Both themes work, and the dark theme is a genuine token swap.** The dark ground warms to `#15110D` and the ink to `#F2EDE1`; the accent lightens to `#63C398` at C\* 40.6, so a 2px series stroke keeps its weight on a warm dark ground and the brand stays recognisable (same hue family, h 161° against light's 158.6°). Ground steps widen in both themes (light total spread 5.17 → 5.87 L\*, dark 7.65 → 7.87), which is the one place this revision strengthens the register system while de-formalising the page: the thesis inset is now a more visible step of the same paper, not a new material.

**Contrast verification, every pair this palette introduces.** WCAG 2.1 relative luminance, computed from the values above; AA is 4.5:1 for text, AAA 7:1, 3:1 for non-text graphics.

| Pair | Light | Dark | Need |
|---|---|---|---|
| `--ink-1` on `--surface-1` | 15.68 | 16.08 | 7 |
| `--ink-1` on `--surface-2` | 14.58 | 15.08 | 7 |
| `--ink-1` on `--surface-3` | 13.44 | 13.63 | 7 |
| `--ink-2` on `--surface-1` | 9.58 | 10.10 | 4.5 |
| `--ink-2` on `--surface-2` | 8.91 | 9.47 | 4.5 |
| `--ink-2` on `--surface-3` | 8.21 | 8.56 | 4.5 |
| `--ink-3` on `--surface-1` | 6.39 | 6.05 | 4.5 |
| `--ink-3` on `--surface-2` | 5.94 | 5.67 | 4.5 |
| `--ink-3` on `--surface-3` | 5.47 | 5.13 | 4.5 |
| `--accent` on `--surface-1` | 7.01 | 8.76 | 4.5 |
| `--accent` on `--surface-2` | 6.52 | 8.21 | 4.5 |
| `--accent` on `--surface-3` | 6.01 | 7.42 | 4.5 |
| `--on-accent` on `--accent` | 7.01 | 8.76 | 4.5 |
| `--data-deficit` on `--surface-1` | 5.67 | 6.71 | 4.5 |
| `--data-deficit` on `--surface-2` | 5.28 | 6.29 | 4.5 |
| `--data-deficit` on `--surface-3` | 4.86 | 5.69 | 4.5 |
| `--data-projection` on `--surface-1` | 6.46 | 10.32 | 4.5 |
| `--data-projection` on `--surface-2` | 6.01 | 9.68 | 4.5 |
| `--data-projection` on `--surface-3` | 5.54 | 8.75 | 4.5 |
| `--chart-series-2` on `--surface-1` | 4.94 | 7.38 | 3 (non-text) |
| `--chart-series-2` on `--surface-2` | 4.60 | 6.92 | 3 |
| `--chart-series-2` on `--surface-3` | 4.23 | 6.25 | 3 |
| `--data-projection` on `--data-projection-ground` (`#E4DCC8` / `#2C2617`) | 5.42 | 8.26 | 4.5 |
| `--ink-1` on `--data-projection-ground` | 13.15 | 12.87 | 7 |
| `--ink-2` on `--data-projection-ground` | 8.04 | 8.08 | 4.5 |
| `--ink-3` on `--data-projection-ground` | 5.36 | 4.84 | 4.5 |
| `--rule-1` on `--surface-1` | 1.43 | 1.33 | decorative only |
| `--rule-2` on `--surface-1` | 2.02 | 1.79 | decorative only |

Every text pair clears AA; every body pair clears AAA; `--ink-3` gains headroom in every position it is used (light 5.36/5.02/4.69 → 6.39/5.94/5.47), which is the reason P3's smaller sans labels are safe at 12px on cream.

**Hue separation, normal and simulated deficiency** (CIE76 ΔE against the locked accent and projection values, Machado 2009 severity 1.0 applied in linear RGB):

| Pair | Normal | Deuteranopia | Protanopia |
|---|---|---|---|
| `--accent` vs `--data-projection` | 45.28 | 30.60 | 26.59 |
| `--accent` vs `--data-deficit` | 66.75 | 26.43 | 10.14 |
| `--data-projection` vs `--data-deficit` | 30.61 | **7.44** | 16.48 |

The last row is the load-bearing one and it is *worse* than Revision 2's 10.8, not better: for a deuteranope, a projected extent and an adverse quantity are the same colour. That is tolerable only because R3 already made the separation structural, and this revision keeps it mandatory rather than optional: **a dash pattern (`--dash-projection: 6 4`) on every projected line, position (a projected panel is its own panel; a deficit mark is never inside a plot), and a printed word (`proyectado`, `umbral`).** No projected value may be distinguished by hue alone anywhere, and AC-001-106 stays as written.

**Admin, re-verified without being redesigned (K5).** The admin state colours are unchanged in value, but they sit on the new grounds, so their ratios move:

| Pair | Light s1 / s2 / s3 | Dark s1 / s2 / s3 |
|---|---|---|
| `--state-pending` | 5.97 / 5.55 / 5.11 | 9.56 / 8.97 / 8.30 |
| `--state-danger` | 7.45 / 6.93 / 6.39 | 7.77 / 7.29 / 6.75 |
| `--on-accent` on a `--state-danger` fill | 7.45 | 7.77 |
| `--ink-1` on the 10% pending / danger tint | 13.60 / 13.28 | — |

All pass AA, most pass AAA. No admin view, layout, or component changes; the two tinted grounds are `color-mix` over `--surface-1` and follow it automatically.

**Pairs retired.** These stop existing. Every one is replaced by the pair on the row immediately below it, and no component may still render the old combination.

| Retired pair | Old ratio | Replaced by | New ratio |
|---|---|---|---|
| `#141A1B` on `#F4F5F2` | 16.08 | `#1B1610` on `#F5EFE2` | 15.68 |
| `#384446` on `#F4F5F2` | 9.21 | `#443B2F` on `#F5EFE2` | 9.58 |
| `#5A6769` on `#F4F5F2` | 5.36 | `#5F5544` on `#F5EFE2` | 6.39 |
| `#5A6769` on `#E4E7DF` | 4.69 | `#5F5544` on `#E7DECB` | 5.47 |
| `#17564A` on `#F4F5F2` | 7.78 | `#0E5C3C` on `#F5EFE2` | 7.01 |
| `#F4F5F2` on `#17564A` | 7.78 | `#F5EFE2` on `#0E5C3C` | 7.01 |
| `#6A5A12` on `#F4F5F2` | 6.22 | `#6B520A` on `#F5EFE2` | 6.46 |
| `#6A5A12` on `#ECEEE8` | 5.82 | `#6B520A` on `#EEE7D7` | 6.01 |
| `#96472A` on `#F4F5F2` | 5.94 | `#96472A` on `#F5EFE2` | 5.67 |
| `#C9CFC7` on `#F4F5F2` | 1.45 | `#D3C9B6` on `#F5EFE2` | 1.43 |
| `#6E7A79` on `#F4F5F2` | 4.06 | `#6B6759` on `#F5EFE2` | 4.94 |

Note the last-but-one row: the terracotta *pair* is retired because its ground changed, while the hue itself is not retired at all. `--data-deficit` is the only chromatic value that survives this revision intact, in both themes.

**Anti-patterns.** A gradient ground ("warmth" as a mesh); a paper or grain texture image; a warm accent that drifts into amber, orange or red; a fourth hue; warming `--data-deficit`; a light and a dark palette that are not the same design (the dark theme is a swap of the same roles, not a second mood); colour as the only change in a component that was also reading as a form.

**Watch items.** (1) The warm ground makes an inherited cool chart stroke look dirty rather than contrasty: after the swap, grep for every literal colour in `web/components/**` and `web/series/**` and confirm zero. (2) The projection-ground tint (`12%` over `--surface-1`) is only safe over `--surface-1`; over `--surface-2` the `--ink-3` pair drops below AA, exactly as R3 documented, and this palette does not change that constraint. (3) `--chart-series-2` on `--surface-3` is 4.23: a non-text pass, a text fail. It may carry a stroke, never a label. (4) Print forces the light set; verify the new cream prints as paper rather than as a yellow cast on a laser printer at 60% coverage.

### P2 (blocks the brief): the anchored clock. Findings K2, K4.

**Two quantities, never merged.** This is the whole of the directive and the reason the effect survives being checked.

| Quantity | What it is | Derived from | Behaviour |
|---|---|---|---|
| **The projection** | `16 años`, `2042`, `variantes 2039-2043` | Eurostat `proj_23np`, six variants, R2's existing arithmetic | **static.** It changes when the projection is revised, not when the clock moves. Untouched by this revision |
| **The clock** | days, hours, minutes, seconds to the anchor | the anchor date and the reader's own clock | **ticks** |

The clock adds a second reading of the same instrument. It does not replace, relabel, or re-derive the projection, and it never states when the threshold is crossed.

#### The anchor

- **`1 de enero de 2042`, 00:00, Europe/Madrid.** Derived, not authored. The anchor is the derived `thresholdYear` rendered as an ISO instant: year, then `-01-01T00:00:00+01:00`. It comes from the same derived countdown value T18 already computes, so changing the threshold parameter moves the anchor, and that is the test.
- **Why the year's first instant.** The projection is annual, so the threshold lands on a *year*, not an instant. Assigning the year's first instant is a stated convention, and the block says so in words. January in Madrid is CET, a fixed +01:00, so there is no DST ambiguity to get wrong.
- **Disclosed in the block, in every state where the clock renders**, at `--text-small`, immediately under the fields, never inside a `<details>`, a `title`, or a tooltip:

| Key | `es` exemplar | Slot |
|---|---|---|
| `countdown.clock.anchor` | `1 de enero de 2042` | `--text-small` sans, `--ink-1` |
| `countdown.clock.anchorLabel` | `fecha convencional del umbral` | `--text-micro` sans, `--ink-3` |
| `countdown.clock.definition` | `Cuenta hasta el 1 de enero de 2042, la fecha convencional del umbral. El año del umbral es una proyección, no una fecha calculada.` | `--text-small` sans, `--ink-2`, two sentences, never truncated |
| `countdown.clock.arithmetic` | `Los 16 años son la diferencia entre 2042 y 2026. Los días se cuentan hasta el 1 de enero de 2042.` | `--text-micro` sans, `--ink-3`, rendered always in the countdown's own group in Reproducir, and in the clock block itself at `≥1024px` |
| `countdown.clock.a11y` | `Cuenta hasta el 1 de enero de 2042, fecha convencional del umbral.` | `aria-label` on the clock's group |
| `countdown.clock.elapsed` | `La fecha convencional del umbral ha pasado.` | `--text-small` sans, `--ink-2` |
| field labels | `días`, `horas`, `min`, `s` | `--text-micro` sans, `--ink-3` |

`countdown.clock.arithmetic` exists because of a real trap, not for decoration: `16` is a difference of year *numbers* measured from 1 January 2026, and `5.545` is elapsed time from today. A reader who divides one by the other gets 15.2 and concludes the page is wrong. The sentence makes the two references explicit. **Watch item:** no visible line may place `16` and the day count in the same typographic group; the clock rail is separated from the projection group by a `1px --rule-1`, which is what keeps the comparison from being invited.

#### Units: what ticks, and why seconds is permitted here and was refused there

Revision 2 refused a sub-annual countdown for a specific reason: it would imply the number changes as the clock moves, when it changes only when the projection is revised, and precision below a year would be false, because the crossing moves by up to three years across the six official variants. **That objection is not overruled. It is scoped.** What it forbids is a per-second interval to a *modelled crossing date*, and this revision does not build one. What it does not forbid is a clock to a *disclosed calendar date*, which is a different quantity with a different, checkable definition.

The honest question is not "is a tick honest" (it is: every digit is verifiable against the reader's own clock) but **which unit carries information, and which units exist below it only to make the thing read as a clock.**

At 5,545 days out, the interval is about **479 million seconds**. A 1 Hz ticker therefore advances one part in 479,000,000 per second: the eighth significant digit. The consequences are concrete:

- the seconds field changes 60 times a minute and no single change is legible as a delta at any size that fits the panel;
- its only honest reading at 15 years is "a clock is running", not "a second was spent";
- and a reader who tries to *use* the seconds field is reading noise, because the quantity that matters (the year) has nothing to do with them.

**Decision: `days` is the informative unit. `hours`, `minutes` and `seconds` are permitted below it as clock fields, on four conditions, all of which are mandatory:**

1. The anchor is a disclosed calendar instant, so the sub-day fields count real elapsed time to something the reader can check, rather than to a modelled event.
2. They are the smallest type in the block and are never the largest thing in the block or the plate.
3. They are `aria-hidden`, so nothing announces sixty times a minute.
4. The block never claims the threshold is crossed at the anchor. The words "convencional" and "proyección, no una fecha calculada" are present in every locale.

**Why not a larger unit.** Days is the coarsest unit with an exact, checkable definition. Months have no fixed length, so a `months` field would require an arbitrary rule the reader cannot verify, and `años y meses` would be uncheckable arithmetic dressed as precision. Days/hours/minutes/seconds are all exact; that is the entire set this design uses.

**Why not a smaller unit.** Milliseconds are theatre: nothing can check them and nothing depends on them.

**The last day, and the endgame.** Because the value is years away, the sub-day fields are effectively constant until the final day, and that is acceptable: they are the fields that make the instrument read as a clock, and the day count is the field that carries the information. Two rules for the endgame, both of which refuse an authored judgement:

- **The days field always renders, including `0`.** It is never hidden, and there is no "final day" styling: no colour change, no weight change, no emphasis. A scheduled emphasis would be the page asserting a meaning at a moment it chose.
- **`elapsed`.** Once the anchor has passed, the timer does not run, all four fields render `0`, and `countdown.clock.definition` is replaced by `countdown.clock.elapsed`. Reaching a conventional date does not mean the projection was right, so the block says only that the date has passed; the projection group above it continues to state whatever the data says at that time.

#### Layout and type

The clock is the **bottom rail of the existing `CountdownBlock`**, inside it, marked by one `1px --rule-1`. No ground of its own, no border, no chip, no icon.

| Element | Type | Token |
|---|---|---|
| separate the rail | `1px` rule, full panel width | `--rule-1` |
| fields row | `display: flex; gap: var(--clock-gap); align-items: baseline` | — |
| `días` value | mono, `tabular-nums` | `--text-num-l` (32px), `--ink-1`, `min-inline-size: var(--clock-days-min)` |
| `horas` / `min` / `s` values | mono, `tabular-nums` | `--text-small` (15px), `--ink-2`, `min-inline-size: var(--clock-unit-min)` |
| field labels | sans, below each value, `--space-1` above | `--text-micro` (12px), `--ink-3` |
| anchor line | sans, `--space-2` below the fields | `--text-small`, `--ink-1`, with the label at `--text-micro` `--ink-3` |
| definition | sans, `--space-3` below | `--text-small`, `--ink-2` |

Values above labels, not labels above values: an instrument prints the quantity and then names it, a form prints the field name and then fills it in. Values are right-aligned within their fixed-width fields so the four numbers form a stable block.

**No colons between fields.** A `:` at 15px turns the row into a wristwatch graphic; the labels do it better and in words.

**Placement, and why there are not two countdowns.** In DOM order inside `<CountdownBlock>`, after `countdown.source` and the back-cast line:

```
countdown.eyebrow
3px --data-projection rule
16 años            (--text-num-xl)
2042 · año del umbral   (--text-num-m, --data-projection)
countdown.definition
countdown.range    (variantes 2039-2043)
countdown.source
countdown.backCast
1px --rule-1       <-- the clock rail starts here
días / horas / min / s
1 de enero de 2042 · fecha convencional del umbral
countdown.clock.definition
[ then R5's existing 1px rule and the figure strip ]
```

Five rules make "one countdown" structural rather than a promise:

1. The clock is a sub-group of the countdown block, not a sibling block. There is no fifth block in the page inventory.
2. Exactly one region of the page moves without user input, and it is these three sub-day fields.
3. The clock prints **no year numeral**: the `2042` above it is the only year in the panel. The anchor line repeats it as a date in words, and that repetition is the disclosure, which is the one repetition the design requires.
4. Within the panel, exactly one numeral is larger than the day field: the `16`. The day field shares `--text-num-l` with the figure strip's value, which is deliberate (two subordinate instruments under one headline) and is kept legible by the rules between them.
5. No fifth nav anchor and no link from the clock. R5's `#demografia` link on the countdown is unchanged.

#### No JavaScript: the server-rendered value is complete and correct

`<CountdownClock>` is a client component that Next server-renders, so **all four fields, the anchor line and the definition are in the HTML**. The contract:

- **Without JavaScript**, the block renders the four fields computed from the render instant, and the anchor and the definition are present and correct. The value is a snapshot, exactly as every other number on this page is a snapshot (anti-pattern 6), and the page's snapshot stamp is the as-of for all of them. No field is missing, no field is a placeholder, and no part of the disclosure depends on script.
- **With JavaScript**, an isomorphic layout effect recomputes from `Date.now()` before the browser paints, so a page served from cache never paints a stale clock, and then one 1 Hz interval takes over. The four value spans carry `suppressHydrationWarning` because their text is expected to differ from the server render.
- Because the correction is pre-paint, there is no visible jump, no flash of a stale second, and no layout shift.
- **The sub-day fields are never the only reason a value is on screen.** The day count and the anchor are the accessible content in both modes.

#### Reduced motion

`prefers-reduced-motion: reduce` gets the static value and no tick:

- no interval is created at all (`matchMedia('(prefers-reduced-motion: reduce)').matches` is checked before the timer and re-checked on change);
- the three sub-day fields are removed from the visual layout with `display: none` under the media query, and the clock renders the day count with the anchor line and the definition.

**They are hidden rather than frozen, and that is the specific reason.** A seconds field that never changes is a stopped clock: it reads as broken, and it asserts a point in time that is wrong within a second. A day count is complete without a clock, so reduced motion loses motion and loses nothing else. The accessible tree is identical in both motion modes (§P2 Accessibility), which is asserted as a test rather than left as a consequence.

#### Accessibility

- `horas`, `min` and `s` are each wrapped in `aria-hidden="true"`. They are the animated part, and they change 60 times a minute.
- `días` is **not** hidden. It changes at most once a day, which is not spam, and it is the informative field.
- The clock is a `<div role="group">` labelled by `countdown.clock.a11y` (`Cuenta hasta el 1 de enero de 2042, fecha convencional del umbral.`), so a screen reader user hears the target when they reach the group.
- **No `aria-live`, no `role="timer"`, no `aria-atomic`, no `aria-busy`.** The design's standing rule (D5: no live region anywhere on the public site) is intact; the clock is the element most likely to break it, so it is named here.
- The anchor line and the definition are ordinary `<p>` elements in document order, so the disclosure is read after the numbers rather than skipped.
- Field labels are real text in the DOM, not `aria-label`s, so the labels are visible to everyone and the group's label carries the meaning.

#### Performance

- **One timer.** A single `setInterval` per page, at `CLOCK_TICK_MS` from `web/series/clock.ts`, created in one client leaf and cleared on unmount. The constant is the only place the frequency exists: a CSS custom property cannot be read by JavaScript, so a `--clock-tick` token would be a token nothing consumes, and this design does not ship those.
- **Paused when hidden.** `visibilitychange` clears the interval on `hidden` and recomputes-and-restarts on `visible`. A background tab must not run a fifteen-year timer.
- **Zero React renders per tick.** The leaf holds four refs and writes `textContent`; there is no state update, no VDOM diff and no re-render 60 times a minute.
- **One `Intl.NumberFormat`, constructed once per mount** and reused for the day count. Constructing a formatter per tick is the expensive mistake here.
- **No layout thrash.** `tabular-nums` plus `min-inline-size` on each field means `59 → 00` cannot reflow; CLS contribution is 0. No transform, no `will-change`, no font-weight change per tick.
- **It cannot block first paint or hydration.** The markup is complete without it; the pre-paint correction is one `Date.now()` and four `textContent` writes.
- **No `requestAnimationFrame`**, no `setTimeout` chain, and `Date.parse(anchor)` runs once at module scope rather than per tick.
- Budget: the leaf is roughly 700 bytes gzipped. §Mobile and performance direction's 20kB client budget is unaffected in kind.

#### States

| State | Clock | Reason |
|---|---|---|
| `computed` | renders, ticks | a threshold year exists, so an anchor exists |
| `not-crossed` | **does not render** | there is no threshold year, therefore no anchor, therefore nothing to count to. R2's sentence renders instead |
| `unavailable` | does not render | the block is absent |
| `withheld` | does not render | the block is absent |
| `elapsed` | renders four `0` fields, no timer, `countdown.clock.elapsed` replaces the definition | the anchor has passed |

The first four rows are the structural guarantee that the clock can never tick toward nothing: **the anchor is derived from the same value the projection is derived from, so a state with no threshold year has no anchor and no clock.** No fallback anchor, no default year, no "until further notice".

#### Anti-patterns

A fuse, bomb, hourglass, siren, alarm bell, or any illustration of time running out; a progress bar toward the anchor (it would invent an origin); a sticky or floating clock; the clock at `--text-num-xl` or above the years numeral; months as a unit; milliseconds; a clock that changes hue or weight as the anchor approaches; `aria-live` on any part of it; a second clock anywhere; the clock in the thesis section, the share card, `og:*` or the meta description; "live" or "actualizado hace" language; a `DÍAS` heading in caps; and the copy bans R2 already sets, extended by §P5.

#### Watch items

1. **Hero panel budget.** The clock adds roughly 92px. Measure at 1024×620 with the stale banner present and at 200% zoom. If it overflows, drop the sub-day fields to `--text-meta` and `días` to `--text-num-m`; never remove the clock and never split the panel into a second card (R5's watch item stands).
2. **Timezone.** The anchor carries an explicit `+01:00`. Never `new Date('2042-01-01')`, which parses as UTC and is an hour off in Madrid, and never a `toLocaleString` round-trip to derive it.
3. **The reader's clock is the source.** If the device clock is wrong, the clock is wrong. That is unavoidable and it is precisely why the anchor date is printed: a reader who distrusts the numbers can check the target instead.
4. **Leap seconds** are ignored. Over fifteen years the drift is one second, and claiming otherwise would be false precision about a quantity nobody is measuring.
5. **`countdown.clock.arithmetic` must not be dropped for length.** It is the sentence that stops a careful reader concluding the page contradicts itself.
6. **Do not animate the days field.** A day field that rolls is a slot machine; it carries the one number on the rail that is worth reading.
7. **`suppressHydrationWarning` belongs on the four value spans only**, never on the anchor or the definition, which must match exactly and would hide a real content bug.

### P3 (blocks the brief): formality beyond colour. Findings K1, K3.

**Diagnosis first, because the owner named colour and half the cause is not colour.** Five properties make this page read as an official form, measured rather than judged:

| # | Property | What it is now | Why it reads as a form |
|---|---|---|---|
| 1 | Type-scale range | 12px floor to 60px ceiling, a 5× range; `--leading-tight` 1.04; `--tracking-display` -0.018em | a statistical bulletin runs 7-8×. At 5× the display and the metadata are near neighbours, and a near-neighbour hierarchy is a document's, not a masthead's |
| 2 | The mono-label system | 12px mono labels at 0.06em tracking above 13px mono values, in every metadata block, on every plate, in table captions, in chips | that is literally a form field: a label, and a filled value beneath it. The provenance strip alone is four of them per computed figure |
| 3 | Ruled boxes | hero panel is a 1px bordered box; every plate opens with a rule; the five ledger rows each carry a `border-top`; `--radius: 0` throughout | the shape vocabulary is "box, rule, box". Rules everywhere read as a printed form's field boundaries |
| 4 | Ground materiality | three grounds stepped by 2.59 and 2.58 L\* | at that step the insets are not paper layers, they are form *sections*, and the difference communicates nothing except "another part of the document" |
| 5 | Line length | `--measure: 64ch` at 19px | **not the cause. No change.** |

Property 5 is diagnosed and deliberately left alone. 64ch at `--text-body-lg` is already an editorial measure, and shortening it would fragment the register blocks and cost horizontal rhythm for a mood. A designer who changes five things to look busy has changed nothing.

**Four changes. Each names the token or the component, and nothing here is a new hue.**

**F1. The palette.** §P1. Not repeated here.

**F2. Mono leaves the label system. `--font-label: var(--font-sans)`.**

This is the highest-leverage change in the revision and it costs no numbers. Add one token and one rule:

> **Mono is a measurement device, not a paperwork device.** `--font-mono` is permitted for: every numeral; hashes and identifiers; commands; numeric table cells; the two-letter locale codes; and the Reproduce block. `--font-mono` is **forbidden** for: field labels, eyebrows, chip words, state words, table captions, the scope mark, and provenance labels. Those use `--font-label`.

`--tracking-label` falls from `0.06em` to `0.02em`: tracked-out caps at 12px is the single most recognisable form-label signature, and 0.02em is enough to open a sans label without announcing a field.

What this keeps: every number on the page still looks measured, which is the credibility signature the design was built on. What it loses: the page stops looking like something to be filled in. Mechanically checkable (AC-001-118): no element whose role is a label may resolve `--font-mono`.

**F3. Material instead of box. De-border the hero panel; widen the ground steps.**

- The hero instrument panel loses `--border-hair`. It keeps its `--surface-2` ground, and its top edge is already the 3px `--data-projection` rule, which is a better edge than a hairline because it carries meaning.
- Internal rules in the panel: three, the projection rail's, the clock rail's from P2, and R5's rule above the figure strip. No outer border.
- Ground steps widen: light 2.59 / 2.58 → 2.79 / 3.08 L\* (total spread 5.17 → 5.87, +13.5%), dark 3.80 / 3.85 → 3.35 / 4.52 (total 7.65 → 7.87). This stays inside Revision 1's 4-6 L\* band for the light tints, so Revision 1's watch item stands unchanged and the register separation is strengthened rather than reopened.

**F4. The top of the type scale rises.**

```css
--text-display:   clamp(2.5rem, 4.9vw, 4rem);      /* was clamp(2.25rem, 4.6vw, 3.75rem) */
--text-h2:        clamp(1.625rem, 2.4vw, 2.375rem); /* was clamp(1.5rem, 2.1vw, 2rem) */
--text-plate:     clamp(1.1875rem, 1.55vw, 1.5rem); /* was clamp(1.125rem, 1.4vw, 1.375rem) */
--leading-tight:  1.02;    /* was 1.04 */
--tracking-display: -0.026em; /* was -0.018em */
```

Display-to-micro range goes from 5.0× to 5.33×; h2-to-micro from 2.67× to 3.17×. **Content cost, stated rather than absorbed:** at 1280px the 7/5 hero split leaves about 686px for the `<h1>`, and 64px display type sets roughly 21 characters to the line. The `hero.statement` budget in §Locale guidance therefore falls from **46 to 42 characters** in `es` (and 60 to 55 in `de`) so the h1 still sets in two lines. The Coder must not shrink the type to fit the old budget; the budget is the thing that moves, and the Specifier formalises it.

**F5. The ledger rows lose their rule.**

`<FigureStatusRow>` drops its `border-top`, separates rows by `--space-5`, and keeps `min-height: var(--figure-state-row-min)`. The state word moves from `--text-micro` mono to `--text-small` sans `--ink-3`; the figure name rises to `--text-body-lg` sans `--ink-1`.

This amends D1's *styling*, and D1's *structure* is untouched and still binding: no plate, no chart frame, no hatched placeholder, no numeral at any scale, one reason line, one method link, strict figure order, and no state word in a display or numeral token. The reasoning for the change is narrow and it is worth stating because D1 was written against a real bug: D1's argument was that a ruled row is a *document* rather than a wireframe, and that argument was correct against an empty chart frame. But five ruled rows in a vertical run is also the single most form-like passage on the page, and a name at `--text-body-lg` with generous space between rows is a table of contents. The absent figure reads as an absence either way; it stops reading as a blank field.

**Anti-patterns.** Replacing the mono system with wide-tracked caps in a sans (same form, different font); de-bordering every box until the page has no edges at all (the thesis 4px rule and the plate top rules are load-bearing, and this revision removes exactly one border); a display size that pushes the h1 to three lines at 1280px; shrinking the body or the measure to make the display look bigger.

**Watch items.** (1) After F2, verify the provenance strip still scans: four label/value pairs in sans at 12/13px are less separated than glyph-distinct mono was, so the strip needs `--space-5` column gaps and the value at `--ink-1`, not `--ink-2`. (2) After F5, confirm the five ledger rows still read as five distinct items rather than one paragraph; if they blur, add `--space-6` rather than restoring the rule. (3) After F3, check the hero panel against `--surface-1` at 100% zoom on a low-DPI display: a cream ground on cream paper with no border can disappear, and `--surface-2` at L\* 91.79 against L\* 94.58 is a 2.79 step. If it disappears, the fix is one `1px --rule-1` on the top edge behind the projection rule, not a full border. (4) F4 interacts with P2's hero budget: measure both together, not separately.

### P4 (blocks launch): register safety for the clock. Finding K4.

The clock is the most persuasive element on the page. Persuasion is where the register system can fail silently, so the containment is written as rules with mechanical checks rather than as a caution.

**Why the clock is instrument and not thesis.** The instrument register carries what can be checked; the thesis register carries what the site *thinks*. The clock measures an interval against a public, checkable date, so it is instrument. It never states what the interval means. "The crossing is bad" is a thesis sentence, it lives in `<ThesisSection>` behind its label and its signature, and the clock cannot borrow its weight.

| Rule | What it forbids | How it is checked |
|---|---|---|
| 1. Ground and palette | the clock may use only `--ink-*` and `--data-projection`; never `--data-deficit`, `--state-danger`, `--state-pending`, `--surface-3`, the serif family, or the 4px ink rule | component test on the rendered subtree's computed styles and class tokens |
| 2. The disclosure is unconditional | the anchor date and `countdown.clock.definition` render in every state where the clock renders, in the same block, outside any `<details>`, outside any `title` or tooltip | renders-through test in all five locales, `computed` and `elapsed` |
| 3. No crossing claim | the clock may not state or imply that the threshold is crossed on 1 January 2042; `2042` keeps its `año del umbral` label and its variant range | copy test: the clock subtree may not contain any string asserting a crossing |
| 4. Namespace isolation | the clock's strings resolve from `countdown.clock.*`; none may come from `thesis.*` | content test + component test (AC-001-116) |
| 5. No fraud vocabulary | the fraud reading stays confined to `thesis.*` and `<ThesisSection>` (AC-001-41); the clock's two new strings are instrument vocabulary (AC-001-92) | existing citation/fraud tests extended to the new keys |
| 6. No migration of urgency | the clock is the only place a continuous element exists; no other block gains one, and the metric plates, dispute, thesis, Reproduce, assumptions, revisions, footer and share card carry no clock, no countdown chip and no urgency icon | page-level test: one moving element |
| 7. Nowhere else | the clock does not appear in the thesis section, the dispute section, the agreement section, the share card, `og:*` or the meta description | build-time grep plus the share-card generator's own input list |

**The consequence worth stating plainly.** A reader can dismiss an odometer as a gimmick and go back to their scepticism. They cannot dismiss a date they can check. That asymmetry is why the anchor is disclosed rather than implied, and it is also why the clock must never acquire a hue that says "bad": the moment it does, the site is asserting a conclusion it has promised to label as an opinion.

### P5 (degrades quality if omitted): the refusals that survive the clock.

R7's rule still generates the judgement calls, with one amendment:

> Anything a reader could not verify is decoration. Anything a reader can verify is drama. **The clock is verifiable, so it is permitted: every digit it prints can be checked against the reader's own clock and the date printed beside it.**

Three consequences, for the Coder:

- Visual intensity is permitted to come from **size, density, contrast, and one continuous measurement at 1 Hz**, and from nothing else. R7's third bullet is amended by exactly that clause.
- The clock's copy is bound by R2's banned vocabulary (`faltan`, `quedan`, `solo`, `apenas`, `ya`, `cuenta atrás`, `bomba`, `explota`, exclamation marks, second person, future tense other than the declarative `alcanza`/`cruza`) **plus**: `destrucción`, `colapso`, `explosión`, `se agota`, `fin`, `última oportunidad`. The owner's metaphor is the brief. It is not the copy, and it appears nowhere on the public surface.
- Anti-pattern 6 ("no live semantics, a snapshot is a snapshot") now has one declared exception with one sentence of justification: the clock is not a snapshot, it is a stopwatch to a fixed public date, and it is labelled as one. Nothing else on the page acquires "live" language, and the snapshot stamp keeps its meaning.

### New tokens

Revision 3 replaces values and adds four names. (`CLOCK_TICK_MS = 1000` in `web/series/clock.ts` is a module constant, not a token: JavaScript cannot read a custom property, and a token nothing consumes is worse than a constant.) Everything else in the token layer is untouched: `--radius`, `--shadow`, the space scale, `--measure`, the breakpoints, the admin tokens, and every token Name.

```css
/* Revision 3 — the anchor and the paper.
   The colour values supersede §Global Tokens §Colour in full; the type values supersede
   the corresponding declarations in §Global Tokens §Type. */

/* labels are not measurements */
--font-label: var(--font-sans);

/* the anchored clock */
--clock-gap:      var(--space-5);   /* between the four fields */
--clock-days-min: 5ch;              /* fixed day field: 5.545 cannot reflow on a tick */
--clock-unit-min: 2ch;              /* 59 -> 00 cannot reflow */

/* type, changed values */
--text-display:     clamp(2.5rem, 4.9vw, 4rem);
--text-h2:          clamp(1.625rem, 2.4vw, 2.375rem);
--text-plate:       clamp(1.1875rem, 1.55vw, 1.5rem);
--leading-tight:    1.02;
--tracking-display: -0.026em;
--tracking-label:   0.02em;
```

Colour declarations are in §P1 and are authoritative there. The anchor's timezone (`Europe/Madrid`) is a constant in the clock module with a comment pointing here, not a token: it invites use in layout, which is the same reason R1 gave for the pyramid's axis maximum and D7's share-card dimensions.

### What this revision contradicts

Declared rather than buried, because each of these is a directive someone could otherwise cite against this work.

1. **R2's anti-pattern, "a ticking clock".** Now permitted in exactly one form: anchored to a disclosed conventional date, with the anchor printed beside it. The refused form (a per-second interval to a modelled crossing) remains refused.
2. **R7's third bullet, "intensity from size, density and contrast, and from nothing else".** Amended to add one continuous measurement at 1 Hz.
3. **Anti-patterns 5 and 6** (no animated counters, no ticking timestamps). Amended for the clock only, and for nothing else on the page.
4. **§Global Tokens §Colour.** Every neutral and the accent are replaced; the light block and the dark block are both superseded.
5. **§Global Tokens §Type.** Six values change (§New tokens).
6. **Revision 2 R3's "No existing value changes".** Superseded for the neutrals and the accent. The three-hue semantics, the allowed-meanings table, the thesis hue ban and the mandatory dash/position/word redundancies all stand unchanged.
7. **Revision 1 D6's provenance strip label treatment.** Labels leave mono for sans (§P3 F2). Field set, field order, `data-operator` marking and the disclosure's six rows are unchanged.
8. **Revision 1 D1's ledger row rule.** The `border-top` goes; the structure and the prohibition on numerals at any scale stay.
9. **§Locale guidance's `hero.statement` budget.** 46 → 42 characters `es`, 60 → 55 `de`, a consequence of §P3 F4.
10. **§Dial Values, `MOTION_INTENSITY`.** 4 → 5, accounted for above.
11. **§Page shell's hero panel construction.** `--border-hair` removed; the 3px projection rule is the panel's top edge.

Nothing else is contradicted. In particular the three-register table, the pyramid, the Reproducir rules, the admin surface, the chart forms, the four-rate implicit-debt rule, the `<details>`-over-modal discipline, the scope mark and the share-card bans are all untouched.

### Scenarios the Specifier must add or amend

Scenario numbers start at **AC-001-108** (the highest in use is 107). Two new tasks; the rest are amendments.

**T20 (new, implements P2 and P4) — the anchored clock.** Derive `anchor` from `thresholdYear`, render the four fields and the disclosure, run one timer, and hold the register containment. Scenarios:

- **AC-001-108** — the anchor is derived, not authored: `anchor` equals 1 January of `thresholdYear` at 00:00 with the documented offset; changing the threshold parameter moves the anchor; a hand-typed anchor date in any component fails a test.
- **AC-001-109** — the disclosure is unconditional: in every state where the clock renders, the output contains the anchor date and the `fecha convencional del umbral` label outside any `<details>`, plus the sentence stating the threshold year is a projection, in all five locales.
- **AC-001-110** — no clock without a threshold year: in `not-crossed`, `unavailable` and `withheld`, the block renders no day, hour, minute or second field and no anchor.
- **AC-001-111** — without JavaScript the four fields, the anchor and the definition are present in the HTML, computed from the render instant, and no element on the page displays a sub-day value without a day value beside it.
- **AC-001-112** — under `prefers-reduced-motion: reduce` no interval is created and the sub-day fields are not displayed; the day count, the anchor and the definition remain.
- **AC-001-113** — the accessible tree is stable: the sub-day fields are `aria-hidden`, the clock carries no `aria-live` and no `role="timer"`, the day count and the anchor are exposed, and the accessible tree is byte-identical in both motion modes.
- **AC-001-114** — one timer: exactly one interval exists, it is cleared on unmount and while `document.visibilityState === 'hidden'`, and a `59 → 00` transition causes no layout shift.
- **AC-001-115** — the `elapsed` state: after the anchor, all four fields render `0`, no timer runs, `countdown.clock.elapsed` replaces the definition, and no string claims the threshold has been crossed.
- **AC-001-116** — register containment: the clock's rendered subtree resolves only `--ink-*` and `--data-projection`, carries no `--data-deficit`, no `--surface-3`, no serif family and no string from the `thesis.*` namespace, and appears in no other block, the share card, `og:*` or the meta description.

**T21 (new, implements P1 and P3) — the palette and label-system migration.** Replace the colour values, add `--font-label`, migrate labels off mono, remove the panel border, widen the ground steps, raise the display scale, un-rule the ledger rows. Scenarios:

- **AC-001-117** — the palette: every pair in §P1's table meets its stated minimum in both themes, computed from `web/styles/tokens.css` by a test; no retired value string remains anywhere in `web/`; `--data-deficit` still equals its Revision 2 value in both themes.
- **AC-001-118** — labels are not measurements: no element whose role is a field label, eyebrow, chip word, state word, table caption, scope mark or provenance label resolves `--font-mono`, and every numeral still does.

**Amendments.**

| Scenario | Status | What the specifier must do |
|---|---|---|
| **AC-001-99** | Amendment required | It pins `years = thresholdYear − snapshotYear` and "no sub-annual unit". Scope it: the *years* quantity keeps integer arithmetic and no sub-annual unit; the *clock* is a separate quantity with its own definition and its own scenarios (108-118). Without the scoping the two rules contradict |
| **AC-001-101** | Unchanged, now load-bearing | "No numeral and no substitute threshold" already implies no clock in `not-crossed`. The Specifier adds the clock explicitly as the example, because it is the first element whose absence is a consequence of this state |
| **AC-001-106** | Unchanged, strengthened | Projection stays encoded by dash, position and a printed word. The new values make projection and deficit *closer* under deuteranopia (ΔE 7.44 against 10.8), so this scenario is now the only thing keeping the two apart |
| **AC-001-41**, **AC-001-42** | Unchanged | The clock's containment rules are enforcement of these, not amendments to them. Add the clock to the list of places that must carry no thesis content |
| **AC-001-35** | Unchanged | The clock's six copy keys and its four field labels are locale keys. The prohibition on literals already covers them |
| **AC-001-78** | Unchanged | T18's derived countdown gains an `anchor` field; its manifest shape does not change, but the field must be documented in the closed set or validation rejects it |
| **AC-001-07** | Unchanged | A stale snapshot still fails the build. The clock's staleness without JS is a different thing: it is bounded by the deploy, disclosed by the snapshot stamp, and never labelled current |
| **AC-001-107** | Unchanged | The hero still does not fill the viewport and the demography heading is still at the fold. §P2's watch item measures the panel *after* the clock, which is the next thing that could break it |

**Suggested order.** T21 first: it is a token-and-label migration with no new behaviour, it is the change the owner will actually see, and it makes the clock land on the right paper. Then T20, which is one component plus one scenario set. Then the AC-001-99 scoping, which is a documentation fix and must not be last.

### What this revision refuses to specify, with the reason

1. **A per-second countdown to a modelled crossing date.** Reason: no source produces one, and the crossing moves by up to three years across the six official variants. A per-second interval to a date the model does not produce would be false by roughly 10^8 seconds. The disclosed anchor is a calendar convention, and that difference is the whole of the effect's honesty.
2. **A larger unit than a day that is not days itself** (months, "años y meses"). Reason: months have no fixed length, so the arithmetic would be uncheckable and the page would be asking the reader to trust a rule it invented. Days is the coarsest unit with an exact definition.
3. **Milliseconds, or any sub-second animation.** Reason: nothing can check it and nothing depends on it.
4. **Alarm red, or any hue shift on the clock as the anchor approaches.** Reason: the page may not assert that crossing the threshold is bad. That judgement belongs to the thesis register and is labelled there.
5. **Changing `--data-deficit`.** Reason: it is the one hue whose warmth is load-bearing, and warming it further collapses "adverse quantity" into "alarm" — the exact move anti-pattern 1 and R7 exist to prevent. If a future revision wants more heat, it warms the paper.
6. **A fourth hue.** Reason: three hues with three fixed meanings is the system. "More colour" is answered here by warmer neutrals and a more present accent, which is the version of the request that survives a reader who is looking for a crank.
7. **A fuse, bomb, hourglass, siren, or any illustration of time running out.** Reason: unfalsifiable, so it adds assertion and no evidence, and it is the crank tell the informal spec names.
8. **A progress bar toward the anchor.** Reason: a bar needs an origin. There is none, so any percentage would be authored, and an authored percentage under a real date is the worst of both.
9. **A sticky, floating, or full-width clock band.** Reason: it would make the clock the page's frame instead of one instrument inside it, it would collide with the sticky header's budget, and a second clock region would read as a campaign. One clock, in the hero, inside the countdown block.
10. **A "final day" mode with its own styling.** Reason: any scheduled emphasis is the page choosing a moment to feel something, which is a thesis act performed by an instrument.
11. **A decorative texture, gradient, grain overlay, or paper photograph for warmth.** Reason: warmth here is a value in the token layer. A texture would be the first decoration on a page whose entire argument is that it does not decorate, and a paper photograph is a stock-image tell.
12. **A display size beyond `--text-display: 4rem`, or a measure below 64ch.** Reason: the first breaks the `<h1>`'s two-line budget at 1280px and would force the hero to grow into the space R5 freed; the second trades real reading comfort for a mood.
13. **Any change to the pyramid, the three registers, the Reproducir section, or the admin surface.** Reason: settled by instruction, and each carries its own revision record. The admin's contrast pairs are re-verified above; nothing about its design is reopened.
