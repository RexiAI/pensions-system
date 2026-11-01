# 003-countdown-hero — Verification (stage 4)

Independent re-run of stages 2–3 against branch `spec/003-countdown-hero`. Nothing below is taken
from the Coder's or the Refactorer's self-report: every gate was executed again by this stage, and
every measurement is this stage's own.

## Revision 4 verification

**attempt 1, phase 1.**

- **Revision 4** (the build that carries Gate decisions 2 / D1 + D2).
- Budget context for the record: `SPEC_LOOP_COUNT=5`, `SPEC_PHASE1_RETRIES=0`,
  `SPEC_PHASE2_RETRIES=0`.
- Date: 2026-11-01. Environment: Node 24.21.0, Chromium 155 (`/usr/bin/google-chrome`),
  Next 16.4.3. Build: `npm run build` run by this stage in this session, exit 0, all five public
  routes prerendered (`○ /`, `● /en /fr /de /it`), `/admin*` dynamic; `.next/BUILD_ID` =
  `WycxWhb4LUbO4m0jKqVLj`.
- Working tree: dirty by design — stages 2–3's deliverable is uncommitted work; stage 5b (the PR
  Opener) is the stage that commits. Nothing was stashed, committed or reverted by this stage.

## Verdict

**PASS** for the spec's deliverable, with one out-of-scope gate FAIL recorded and not waived.

Stated plainly, because the distinction matters:

- Every gate that this stage can attribute to the spec's own source tree (`app/`, `web/`, `tests/`,
  `scripts/`, `middleware.ts`) is green: traceability 0, full suite 0, ESLint complexity 0, `tsc` 0,
  build 0, every content gate 0.
- `check-code-principles.sh --tier production` exits **1** with exactly **one** FAIL:
  `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`). That file is inside
  the `.standards/` git submodule — it is not part of this spec's deliverable, it is unchanged by
  this branch, no pipeline agent may edit it, and the same single FAIL has been recorded in
  `docs/changes/001-pension-math.md` and `docs/changes/002-hero-conversion.md` since 2026-10-29.
  The exit code is transcribed as-is below; the FAIL stands. It is not attributable to this spec,
  and the 001/002 precedent for this exact finding is "PASS for the spec's deliverable (with an
  out-of-scope FAIL noted)". A strict reading of "any FAIL stops the pipeline" would stop the
  pipeline on a submodule file no stage in this repo can fix; this stage records both readings
  rather than silently smoothing one away.

## Check table

| # | Check | Gate | Verdict | Detail |
|---|---|---|---|---|
| 1 | Scenario traceability | `scripts/check-scenario-traceability.sh --json` + `check-scenario-traceability-3digit.ts` | **PASS** | exit 0 / exit 0; 51/51 `AC-003-01`…`-51` traced, 0 fails; local wrapper: 206 scenarios all cited and resolving |
| 2 | Full test suite | `npx vitest run` | **PASS** | exit 0; **71 files / 895 tests passed, 0 failed, 0 skipped** (no skip lines in the run) |
| 2b | Type/build/content gates | `npx tsc --noEmit`, `npm run build` (runs `verify:derived`, `check:content-scope`, `check:public-vocabulary`, 3-digit traceability), `npm run sitemap:check` | **PASS** | all exit 0 (see §Supplementary gate runs) |
| 3 | Complexity gate | `npx eslint .` (`complexity: ['error', 6]`) | **PASS** | exit 0, no findings; `tsc --noEmit` exit 0 |
| 3.5 | Design-principles gate | `check-code-principles.sh --tier production --json` | **FAIL (1, out of scope)** | exit 1; exactly one FAIL, `.standards/` submodule; **0 FAILs in project source**; 42 WARNs (33 project, 9 submodule) — see caveat below |
| 4 | Scenario-to-behavior spot check | manual, then scoped re-run | **PASS** | `AC-003-15`, `AC-003-19`, `AC-003-26` read against their Given/When/Then; assertions match |
| 5 | No unaccounted behavior | diff skim (finding line, not a command) | **PASS with notes** | every changed file traces to T1–T5 or to an explicitly declared re-point; see §No unaccounted behavior |

## Browser measurements (this stage's own CDP harness, built app, `next start`)

Five locales × three viewports, `getComputedStyle` / `getBoundingClientRect` against the real
build. Every number below is from this stage's run, not from the repo's test file.

| Locale | Viewport | day numeral | `h1` | seconds | `16 años` | max numeral on page | `h1` top | share top | clock fields | fuse | overflow-x |
|---|---|---|---|---|---|---|---|---|---|---|---|
| es | 1440×900 | **80px** | 64px | **32px** | 32px | **80px** | 104 | 687.92 | 339.39–508.48 | 516.48–604.88 | none |
| es | 1366×768 | **80px** | 64px | **32px** | 32px | **80px** | 104 | 687.92 | 339.39–508.48 | 516.48–604.88 | none |
| es | 390×844 | **44px** | 40px | 32px | 32px | **44px** | 68 | 862.36 (not asserted) | 480.91–613.28 | 621.28–779.31 | none |
| en | 1440×900 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| en | 1366×768 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| en | 390×844 | 44px | 40px | 32px | 32px | 44px | 68 | 841.31 (not asserted) | 459.86–592.23 | 600.23–758.27 | none |
| fr | 1440×900 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| fr | 1366×768 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| fr | 390×844 | 44px | 40px | 32px | 32px | 44px | 68 | 862.36 (not asserted) | 480.91–613.28 | 621.28–779.31 | none |
| de | 1440×900 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| de | 1366×768 | 80px | 64px | 32px | 32px | 80px | 104 | 753.19 | 404.66–573.75 | 581.75–670.14 | none |
| de | 390×844 | 44px | 40px | 32px | 32px | 44px | 68 | 838.06 (not asserted) | 480.91–613.28 | 621.28–755.02 | none |
| it | 1440×900 | 80px | 64px | 32px | 32px | 80px | 104 | 687.92 | 339.39–508.48 | 516.48–604.88 | none |
| it | 1366×768 | 80px | 64px | 32px | 32px | 80px | 104 | 687.92 | 339.39–508.48 | 516.48–604.88 | none |
| it | 390×844 | 44px | 40px | 32px | 32px | 44px | 68 | 862.36 (not asserted) | 480.91–613.28 | 621.28–779.31 | none |

Read against the criteria:

- **Day numeral is the largest numeral on the page** — `maxNumeralPx` (the largest computed
  `font-size` of any element whose own text nodes carry a digit) equals the day numeral at every
  locale and viewport: 80px desktop, 44px at 390. It is **strictly** larger than the `h1` (64px /
  40px) everywhere. `--text-display` still resolves to `clamp(2.5rem, 4.9vw, 4rem)`.
- **Seconds ≥ 32px on desktop** — 32px exactly at 1366×768 and 1440×900, in all five locales.
- **`h1` top inside the viewport** — 104 < 900, 104 < 768, 68 < 844. Its computed size is 64/64/40,
  i.e. `--text-display`'s resolved value: the move into the band relocated the element without
  restyling it.
- **Share row top inside the viewport at the two desktop widths** — 687.92 (es/it) and 753.19
  (en/fr/de) against 768. At 1366×768 the row's *bottom* is ~797, i.e. below the fold — which is
  exactly why AC-003-50 is a top-edge assertion, and the spec says so. At 390 it measures 838–862
  and is not asserted, as specified.
- **Clock and fuse wholly inside the viewport at all three widths** — clock fields bottom ≤ 613.28,
  fuse bottom ≤ 779.31 against 844; both wholly inside at 1366 and 1440 as well.
- **No horizontal overflow** — `documentElement.scrollWidth` 1425/1440, 1351/1366, 375/390 at every
  locale: no scrollbar-less overflow anywhere.
- **No layout shift while the seconds tick** — measured a field's box across a real tick (seconds
  text 57→56, 55→54, 53→52 at the three viewports): day box, seconds box, fuse box and share box
  were byte-identical before/after, and the fuse's `outerHTML` did not change.
- **Band composition in paint order** (es, 1440×900): `h1` 104 → eyebrow 267.6 → `16 años` numeral
  295 → day numeral 339.4 → fuse 516.5 → share 687.9 → clock anchor 938.2 → clock definition 982.5
  → clock arithmetic 1047.1 → hero figure 1265.4 → figure strip 3418.1. The eyebrow sits between
  the `h1` and the day numeral; nothing renders text between the fuse group's bottom (679.9) and
  the share row's top (687.9) — an independent scan for text-bearing elements wholly inside that
  gap returned `[]`. The `h1` is inside the band and it is the page's only `h1`; the hero's figure
  panel is **not** in the band.

## Fuse (T2), measured and re-derived

- Committed derived value: `{"consumedPercent":62.44,"observedRatio":31.22,"observedYear":2025,"threshold":50}`,
  `availability: computed`. Label renders `Mecha: 62 % consumida — ratio de dependencia observado
  31,22 (2025) ÷ umbral 50`.
- Drawn geometry (server-computed attributes, `viewBox="0 0 1000 6"`): cord `x=0 width=375.6 h=1`,
  burnt `x=375.6 width=624.4 h=6`. 624.4/1000 = **62.44 %** — the stored fraction, drawn; the label
  prints the integer half-up form. Half-up (`62.5 → 63`) and the unclamped case (`110 %`) are
  covered by `AC-003-13`/`AC-003-15`.
- **Reproduces from the committed snapshot by its own published command.**
  `npx tsx scripts/compute.ts --series fuse --offline` exit 0, printing
  `349e3be6838779a11ff031592d4658069684a39ed9d006000715a40c6f794425` (the committed
  `inputHash`) and `"consumedPercent":62.44`.
- **Never reads the projected series.** `web/series/fuse.ts` imports only `readAgeCounts` /
  `observedDependency` / `COUNTDOWN_THRESHOLD`; `FUSE_SERIES.requirementSources` is
  `[DEMO_PJAN_SOURCE]` only; the compute path reads `payloadOf(inputs, DEMO_PJAN_SOURCE)`. The
  `proj_23np` 2025 back-cast 31.91 appears once on the page, in the countdown's own back-cast
  sentence, and the test that alters both projection snapshots leaves the fuse value and hash
  unchanged (`AC-003-20`).
- **Disappears entirely with no observed value.** Rendering the band with no fuse series, with
  `availability: unavailable`, and with `value: null` produces no `fuse` substring at all (no line,
  label, definition, disclosure or reproduce link); no threshold year produces no band countdown at
  all. Confirmed by render, not by reading the conditional.
- **Provenance inside the method disclosure.** Closed `<details>` in the band, summary
  `Cómo se calcula` (the existing `figure.methodLink` key), 4 provenance fields, the 64-hex digest
  and the reproduce path inside it; `open` absent; closed details' height is the summary alone (44px,
  `scrollHeight == clientHeight`), `elementFromPoint` over the hidden body returns `null`, and the
  collapsed body contributes nothing to `innerText` — i.e. no manifest value is visible above the
  share row. Expanding it reveals the fields, the hash and `scripts/compute.ts` +
  `data/derived/series/fuse.json`.

## Share (T3), no-JS / JS / network / new tab

- **No-JS (server HTML, fetched raw, per locale).** Exactly four plain anchors — `wa.me`, `t.me/
  share/url`, `x.com/intent/post`, `linkedin.com/sharing/share-offsite/` — each
  `target="_blank" rel="noopener noreferrer"`. No `<button>` in the server HTML; the copy-link
  affordance is `<input class="share__url" readOnly>` with its `share.linkLabel` label, i.e. the
  canonical URL as selectable text. The no-JS text begins with the derived year (`2042`) and
  contains the Eurostat-projection clause and the canonical URL, and contains neither `Faltan` nor
  a day count. URL shape: `searchParams.url` (or the trailing token of `text`) is exactly
  `canonicalUrl(route)`; no `utm_*`, `fbclid`, `gclid`, `ref=`, `source=` anywhere in the page.
- **With JS, the day count is the clock's value at click time.** Clicking the WhatsApp anchor
  rewritten at click time produced `text=Faltan 5539 días para el 1 de enero de 2042 …` — the same
  day count the clock was showing at that instant, from the same anchor; the server-rendered `href`
  (year-led, no days) was the value before the click. Telegram drops the trailing URL into its own
  `url` param; LinkedIn sends only the URL.
- **Copy link gives feedback.** With the clipboard granted: button text `Copiar enlace → Enlace
  copiado` (es) / `Copy link → Link copied` (en), a `role="status"` sibling carrying the same
  locale string, clipboard content exactly the canonical URL of the route, and the label reverting
  after ~2 s. Without the Clipboard API the `<input>` is revealed and focused instead
  (`state === 'fallback'`).
- **Native share.** `navigator.share` undefined → no native button in the DOM (1 button = copy
  link). With `navigator.share` stubbed → 2 buttons, the first labelled `Compartir…`, and its
  payload is `{ text: "Faltan 5539 días …", url: canonicalUrl('/') }` — the same text and URL as
  the links.
- **Zero third-party origins, all five locales.** Load: 10 requests, all same-origin. Idle 3 s: 0
  new requests. Every share action (native + copy + all four network links): 0 new requests from
  the page's own context, 0 third-party requests overall, and `Network.getCookies` → 0 cookies.
  No `preconnect` / `dns-prefetch` / `prefetch` hints in any page.
- **The new tab a share link opens — observed here.** Clicking a network link for real creates a
  new page target whose URL is
  `https://api.whatsapp.com/send/?text=Faltan+5539+d%C3%ADas+…&app_absent=0` — the navigation is
  attempted, in a new browsing context, carrying the click-time text. This is the observation the
  Coder reported it could not make; it is confirmed. What this stage still cannot verify from a
  sandboxed headless browser: that a signed-in user's network session completes the share (that is
  the network's own behaviour, outside the page), and that Chromium's own `noopener` isolation
  behaves as expected across every network (only `rel="noopener noreferrer"`'s presence is
  verifiable).

## Copy rules (T3 / OQ-5)

- The `es` `share.text` value is **byte-identical** to the approved template in `10-tasks.md`
  §OQ-5 (`Faltan {days} días para el 1 de enero de {year}: … Compruébalo: {url}`) — compared
  programmatically, `True`.
- `share.*` rule set accepts all five locales' `share.text` and `share.textNoJs` (0 problems each).
- It rejects, in all five locales, the depletion verb, the bomb word, `!` and the urgency list —
  exercised with each locale's own vocabulary:
  `es` quedan / bomba / `!` / urgente, inminente, alarmante, catastrófico, desastroso;
  `en` " left" / remain / bomb / `!` / urgent, imminent, alarming, catastrophic, disastrous;
  `fr` il reste, restent / bombe / `!` / urgent, imminent, alarmant, catastrophique, désastreux;
  `de` bleiben / Bombe / `!` / dringend, alarmierend, katastrophal, verheerend;
  `it` restano, rimangono / bomba / `!` / urgente, imminente, allarmante, catastrofico, disastroso.
  Every sample returned a non-empty problem list; every shipped template returned empty.
- `countdown.*` bans stay outside `share.*`: no `countdown.*` string contains `faltan`,
  `compruébalo`, `quedan`, `cuenta atrás`, `bomba`, `explota` or `!`.

## Title / preview (T4)

| Locale | `<title>` / `og:title` | `og:description` | `og:image:alt` |
|---|---|---|---|
| es | `2042: España llega a 50 mayores de 65 por cada 100 en edad de trabajar · pensiones · España` | contains 2042 | `pensiones — 2042: España llega …` |
| en | `2042: Spain reaches 50 people aged 65 and over per 100 of working age · pensiones · Spain` | contains 2042 | distinct |
| fr | `2042 : l'Espagne atteint 50 … · pensiones · Espagne` | contains 2042 | distinct |
| de | `2042: Spanien erreicht 50 Menschen ab 65 je 100 im Erwerbsalter · pensiones · Spanien` | contains 2042 | distinct |
| it | `2042: la Spagna arriva a 50 persone over 65 ogni 100 in età lavorativa · pensiones · Spagna` | contains 2042 | distinct |

- Year is derived (`committedThresholdYear()` → `pageMetadata(locale, year)`), and **no hand-typed
  `2042` exists in any locale file, component, `app/`, `scripts/` or generated source** — a
  `grep -rn 2042` over `web/ app/ scripts/ middleware.ts` returns no files.
- No static artefact carries a day count: `<title>`, `meta description`, every `og:*` tag,
  `og:image:alt`, `sitemap.xml` (5 routes × 6 alternates) and `manifest.webmanifest` contain no
  day/hour/minute/second value and not the anchor's full date. `twitter:*` is not emitted at all.
- **Limit stated honestly:** the share card's *component* text was verified (it contains the year,
  and its year-free form contains no digit at all); the rendered **PNG pixels** were not OCR'd —
  the image route is generated at build and this stage verified its strings, not its rasterised
  pixels.

## "En preparación" (T5)

- Exactly **one** `class="pending"` block on the `es` page, heading `5 cifras en preparación` +
  the chip; the count comes from the data (5 figures with `availability !== 'computed'`:
  fig-03…fig-07).
- `sin calcular` appears **exactly once** in the rendered `es` text (the chip in the block heading).
- Every row keeps its name, its published definition, its reason and its `Cómo se calcula` method
  link — 5 method links for 5 rows. No `<svg>`, no `<table>`, no `<code>`, no 64-hex digest, no
  `npx tsx` command inside the block; no substitute value.
- Zero unavailable figures → no block; one → singular heading. Registers still match the rendered
  counts; no thesis vocabulary in the block.

## Invariants

- **Static prerender** of all five public routes (build output: `○ /`, `● /en /fr /de /it`), each
  document's `<html lang>` equal to its route locale (`es/en/fr/de/it`, checked over HTTP, status
  200).
- **`hreflang`**: six `<link rel="alternate">` entries per route (5 locales + `x-default`) with
  absolute canonical hrefs. Note for future audits: Next 16 emits the attribute as `hrefLang`
  (camel-cased) in the HTML stream — an ASCII case-insensitive match for `hreflang`, so browsers
  and crawlers are unaffected, but a case-sensitive grep for `hreflang=` will miss it.
- **`/admin` fail-closed**: `GET /admin` → **503**, `GET /admin/login` → **503**
  (`text/plain`), with the admin credential unconfigured, while the public routes serve 200
  unchanged.
- **Reduced motion**: with `prefers-reduced-motion: reduce` the three sub-day fields resolve
  `display: none` (all three), no interval is created (the day count was byte-identical across
  2.5 s), and the day count shown (5539) equals the count computed for the render instant — "hide,
  not freeze".
- **Thesis register**: still its own section after the debate and outside the band; the new CSS
  section references neither thesis content nor `--data-deficit`/`--data-projection`; the band and
  pending regions contain no thesis text.
- **No cookies**: `Network.getCookies` → 0 for every locale; no `Set-Cookie` on `/`.

## Adjudications (deviations handed to this stage)

### 1. `display: contents` on `.clock` inside the band — does it break T1 in substance?

**No — T1's substance survives; the consequence is visual-order-only reflow, and it is a real
trade-off worth recording, not a violation.**

What T1 (and `20-acceptance/`) actually require of the clock subtree:

| Requirement | Holds? | How this stage checked |
|---|---|---|
| the three clock disclosures "travel inside the clock subtree" | **yes** | `.clock.contains(el)` is `true` for `.clock__anchor`, `.clock__definition`, `.clock__arithmetic` — `display: contents` does not move nodes in the DOM tree |
| accessible tree unchanged (AC-001-113), `role="group"` with its label present | **yes** | `Accessibility.getFullAXTree` returns `group` / `"Cuenta hasta el 1 de enero de 2042, fecha convencional del umbral."` — the labelled group node survives `display: contents`, exactly as the Coder claimed |
| the disclosures visible, outside any `<details>`/`title`/tooltip (AC-003-05) | **yes** | all three have client rects, `inDetails: false`, `.clock__arithmetic` computed `display: block` |
| no `<svg>`, no `aria-live` inside the clock subtree (AC-001-99/116) | **yes** | neither string appears in the clock block of the prerendered HTML |
| the fuse is a sibling of the clock, never inside it (AC-003-22) | **yes** | `clock.contains(fuseGroup) === false` |
| nothing renders text between the fuse's bottom and the share row's top (AC-003-48) | **yes** | scan returned `[]`; gap is 679.9 → 687.9 |
| countdown prose never between fuse and share — may sit after the share row (T1) | **yes** | prose `order: 7`, clock disclosures `order: 8`, share `order: 6`; measured tops 938/982/1047 are after share 687.9 |
| keyboard order unaffected | **yes** | 0 focusable elements (`a`/`button`/`input`) inside the clock subtree in the prerendered HTML — nothing was reordered out from under the tab sequence |

What it does cost, stated rather than hidden: DOM order no longer equals paint order inside the
band. A screen reader's linear traversal and a select-all copy follow DOM order (identity →
countdown prose → clock fields → clock disclosures → fuse → share), while the visual order is
identity → eyebrow → numerals → fields → fuse → share → disclosures. No acceptance criterion
asserts DOM order equals visual order — T1 says the composition is the **rendered top-edge order**,
which is satisfied — and this is the mechanism that bought both the fold targets and AC-003-48's
"nothing between fuse and share" clause without splitting the clock's component contract. Recorded
as a review note for the Architect, not as a failure.

### 2. `15-design.md` was stale when the build ran

**Resolved during this verification, and now consistent with the build.** The file was refreshed
while this stage was working (`15-design.md` mtime moved from 12:38 to 13:13 to 13:16 during the
session) and now carries a `## Revision 4 (post-measurement)` section. Checked line by line against
the build:

- §"OQ-2 recommendation" now says "`h1` … leads the band (D1, Revision 4)" — no longer "h1 placed
  after the band".
- T1 §Layout now states rendered order 1→8 (lead, eyebrow, years numeral, field row, fuse group,
  share row, countdown prose, clock disclosures) with `display: contents` named as the mechanism —
  which is exactly the order and mechanism this stage measured.
- T1 per-breakpoint no longer predicts "h1 at ~520px"; it records the measured `h1` top **y 104**
  and share top **y 688**, the same numbers this stage measured independently.
- T2 §Layout no longer puts the provenance strip under the fuse; it says "the provenance is
  deliberately **not** visible here".
- T3 §Layout now places the share row "directly under the fuse", before the countdown's prose.
- The token table's `--band-pad-block` (`--space-6` / `--space-4`) and `--clock-sub-col` (`3rem`)
  match `web/styles/tokens.css`.

So: no contradiction remains, and nothing was recorded as a failure. **Finding-level note for the
Architect:** the design artifact trailed the build for the whole of stages 2–3, and a reader of
`15-design.md` between the gate decisions and this refresh would have been reading the superseded
composition. Q-D1 in `10-tasks.md` asked for the refresh before the *next* spec builds on this
band, not as a stage-2 precondition; it is now done.

### 3. The share-network new-tab observation the Coder could not make

**Verified here** (see §Share): the click creates a new page target navigated to the network's
share URL, carrying the click-time text. What remains unverifiable from this environment is only
the network's own post-redirect behaviour. Nothing in the pipeline was blocked on this.

## Findings

1. **`check-code-principles.sh` FAIL, out of scope** — one FAIL,
   `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7` (`CC=10`), inside the
   `.standards/` submodule. Pre-existing (recorded in the 001 and 002 archives), unowned by this
   repo's pipeline, uneditable by any pipeline agent. Zero FAILs land in project source.
2. **`check-code-principles.sh` SIGPIPE with `.next` present** — running the same gate without
   moving `.next` aside exits **141** (`sort … | head -10` under `set -o pipefail`, the DRY
   sub-pipeline; the huge compiled-chunk window set closes `head` early). That is the tool's
   known defect, documented in `docs/changes/002-hero-conversion.md`, not a code finding — and
   with `.next` present the run also reports FAILs against compiled Turbopack runtime chunks
   (`.next/server/chunks/…`, CC up to 15), which are build output, not source. Both are why this
   stage moved `.next` aside for the gate run, as the stage brief directed.
3. **Design-principles WARNs (42: 33 in project source, 9 in the submodule).** Review hints, not
   stops; recorded verbatim in the evidence block and flagged to the Architect. The two that touch
   this spec's own code: `web/components/share/ShareRow.tsx:62` (body 24 lines) and
   `web/seo/share-card.tsx:41` (body 23 lines). Everything else is pre-existing
   (`Hero.tsx`, `SiteHeader.tsx`, `PyramidPlate.tsx`, admin pages, `ProvenanceStrip.tsx`, …).
4. **`ProvenanceStrip.tsx` carries a DRY WARN** ("5× identical 4-line block at line 56") — a hint
   about the strip's repeated row markup, unchanged in kind by this spec (the strip gained a
   `collapsed` form). Not a stop; noted for the Architect.
5. **`AC-003-30`/`AC-003-31` are asserted structurally in `share.test.ts`** (source scanning for
   `fetch(`/`sendBeacon`/`window.open`/`preventDefault`) rather than by network recording; the
   behavioural evidence for those two scenarios lives in `countdown-band-browser.test.ts`, which
   builds a real request log. That split is defensible, but the browser file is
   `describe.skipIf(!BUILD_PRESENT || !CHROME_PATH)` — on a checkout with no `.next` and no
   Chromium, ~13 of the spec's Chromium-only assertions would skip silently. In this run the build
   and Chromium were both present and **0 tests skipped** (895 passed, no skip lines), and this
   stage re-measured all of them independently; flagged so the Architect knows where the
   environment dependency is.
6. **`hrefLang` attribute casing** (see §Invariants) — cosmetic, worth knowing for grep-based
   audits.
7. **Share card PNG pixels not OCR'd** (see §Title/preview) — strings verified, raster not.

## No unaccounted behavior

Skim of the 30-file diff against `10-tasks.md` / `20-acceptance/`:

- **New source all traces to a task**: `CountdownBand.tsx` (T1/D1 composition, lead slot),
  `Fuse.tsx` + `web/series/fuse.ts` + `web/ingest/series.ts` (+`FUSE_SERIES`) + `series-types.ts`
  (T2), `web/share/links.ts` + `share/ShareRow.tsx` + `CopyLink.tsx` + `ShareIcon.tsx` +
  `web/content/share-copy.ts` (T3), `web/seo/threshold-year.ts` + `share-card.tsx` + `metadata.ts`
  (T4), `PendingBlock.tsx` + `FigureStatusRow.tsx` `nested` prop (T5), `HeroLead.tsx` /
  `HeroLeadBlock.tsx` (T1/D1 lead extraction), `ProvenanceStrip.tsx` `collapsed` form (T2/D1),
  `format.ts` `formatWholePercent` (T2 OQ-3), `keys.ts`/`registry.ts`/locale JSONs (the 22 new
  keys T3/T4/T5 need), `scripts/compute.ts` + `reproduce-command.ts` (T2's published reproduce
  command), `globals.css`/`tokens.css` (T1–T3 tokens and rules).
- **Existing tests edited — each edit is one `10-tasks.md` explicitly declares, and no assertion
  was weakened**:
  - `first-viewport.test.ts` — re-measured per AC-003-10; the 50px clearance margin, the viewport
    set and the whole-box vs top-edge split are all intact, and the file gained a test asserting
    the retired demography clause cannot come back (`AC-001-107` / D2).
  - `scope-mark.test.ts` — AC-001-102 re-pointed to "no digits other than the derived year"
    (T4's declared amendment), keeping the scope-suffix-last assertion as a new check.
  - `design-revision.test.ts` — D7 re-pointed; the year-free card still has to carry **no digit at
    all**, which is the original assertion kept on the form it still applies to.
  - `hero-copy.test.ts` — key count 248→270 (22 new keys × 5 locales), parity still enforced;
    `reproduce.test.ts` — series count 2→3 (T2's third series); `series-coverage-gaps.test.ts` —
    closed series-id set gains `fuse`; `content-locale.test.ts` — the "no `slice` on the headline"
    scan now follows the `<h1>` to `HeroLead.tsx` (D1).
- **Nothing found that traces to no task.** No new dependency, no new token colour, no new
  network surface, no new secret, no new `--data-*` hue.

## Post-PR CI check (phase 2)

Not run. No PR exists yet — stage 5b (PR Opener) owns creating it, and this stage was invoked for
the pre-PR verification only. Phase 2 remains unconsumed (`SPEC_PHASE2_RETRIES=0`).

## Supplementary gate runs (not one of the five contract checks)

| Command | Exit | Output |
|---|---|---|
| `npm run build` | 0 | prebuild gates green; all five public routes prerendered; `/admin*` dynamic |
| `npm run verify:derived` | 0 | `derived figures verified: 7 (2 computed, 5 unavailable)` / `derived series verified: 3` |
| `npm run check:content-scope` | 0 | `country scope gate: clean (5 locales)` |
| `npm run check:public-vocabulary` | 0 | `public vocabulary gate: clean (5 locales)` |
| `npm run sitemap:check` | 0 | `5 routes, 6 alternates each`; emitted sitemap/robots agree |
| `npm run check:client-secrets` | 0 | `no admin secret configured in this environment; .next/static not grepped` |
| `npx tsx scripts/check-scenario-traceability-3digit.ts` | 0 | `206 scenarios, all cited, all citations resolve` |
| `check-audit-trail.sh 003-countdown-hero` | **1** | 3 PASS + `FAIL … missing 25-verification.md (AC-015-11)` + `FAIL … missing 30-report.md (AC-015-12)` — both correct at this instant: this file is the one this stage just wrote (so the first FAIL is stale by construction and re-runs clean), and `30-report.md` belongs to stage 5a, which has not run yet. Re-run by the PR Opener per AC-015-15. |

## Evidence: scenario traceability

command: .standards/scripts/check-scenario-traceability.sh --json  &&  npx tsx scripts/check-scenario-traceability-3digit.ts
exit: 0
at: 2026-11-01T12:22:31Z

Both gate scripts, run from the repo root: the upstream two-digit matcher and the repo-local
three-digit wrapper `10-tasks.md` requires ("run both", §Traceability note).

start: 2026-11-01T12:22:30Z
{
  "checks": [1, 2],
  "passes": ["AC-003-01 — traced to a test", "AC-003-02 — traced to a test", "AC-003-03 — traced to a test", "AC-003-04 — traced to a test", "AC-003-05 — traced to a test", "AC-003-06 — traced to a test", "AC-003-07 — traced to a test", "AC-003-08 — traced to a test", "AC-003-09 — traced to a test", "AC-003-10 — traced to a test", "AC-003-11 — traced to a test", "AC-003-12 — traced to a test", "AC-003-13 — traced to a test", "AC-003-14 — traced to a test", "AC-003-15 — traced to a test", "AC-003-16 — traced to a test", "AC-003-17 — traced to a test", "AC-003-18 — traced to a test", "AC-003-19 — traced to a test", "AC-003-20 — traced to a test", "AC-003-21 — traced to a test", "AC-003-22 — traced to a test", "AC-003-23 — traced to a test", "AC-003-24 — traced to a test", "AC-003-25 — traced to a test", "AC-003-26 — traced to a test", "AC-003-27 — traced to a test", "AC-003-28 — traced to a test", "AC-003-29 — traced to a test", "AC-003-30 — traced to a test", "AC-003-31 — traced to a test", "AC-003-32 — traced to a test", "AC-003-33 — traced to a test", "AC-003-34 — traced to a test", "AC-003-35 — traced to a test", "AC-003-36 — traced to a test", "AC-003-37 — traced to a test", "AC-003-38 — traced to a test", "AC-003-39 — traced to a test", "AC-003-40 — traced to a test", "AC-003-41 — traced to a test", "AC-003-42 — traced to a test", "AC-003-43 — traced to a test", "AC-003-44 — traced to a test", "AC-003-45 — traced to a test", "AC-003-46 — traced to a test", "AC-003-47 — traced to a test", "AC-003-48 — traced to a test", "AC-003-49 — traced to a test", "AC-003-50 — traced to a test", "AC-003-51 — traced to a test"],
  "fails": []
}
EXIT_UPSTREAM:0
scenario traceability (2-3 digit ids): 206 scenarios, all cited, all citations resolve
EXIT_LOCAL:0
end: 2026-11-01T12:22:31Z

## Evidence: full test suite

command: npx vitest run
exit: 0
at: 2026-11-01T12:21:17Z

 RUN  v5.0.5 /home/dbueno/projects/pensions-system

 Test Files  71 passed (71)
      Tests  895 passed (895)
   Start at  13:21:17
   Duration  55.18s (tests 77%, import 19%, transform 4%, worker 1%)

No `skipped` line: every collected test ran. The Coder's "895 tests / 71 files" claim is reproduced
exactly. A second, independent run earlier in this session (12:12:05Z) produced the same
71/895 with `EXIT:0`.

## Evidence: complexity gate

command: npx eslint . ; grep -n "complexity" eslint.config.mjs ; npx tsc --noEmit
exit: 0
at: 2026-11-01T12:22:43Z

The real linter for this stack: ESLint carries the cyclomatic-complexity budget as an error, so a
function above 6 decision points fails the run rather than warning.

at: 2026-11-01T12:22:43Z
EXIT_ESLINT:0
17:      complexity: ['error', 6],
EXIT_TSC:0
at_end: 2026-11-01T12:22:48Z

`EXIT_ESLINT:0` with empty stdout = no findings at all, complexity included. `EXIT_TSC:0` = the
type gate is clean over the changed files as well.

## Evidence: design-principles gate

command: .standards/scripts/check-code-principles.sh --tier production --json   (with `.next` moved aside)
exit: 1
at: 2026-11-01T12:20:57Z

Exit **1** = findings. Transcript below is the script's own JSON, unedited. `tier` is forced to
`production` because this repo's declared tier is production while the script's auto-detection
looks for `AGENTS_*.md` and this repo uses `AGENTS.md`; the six gates are the full set.

{
  "tier": "production",
  "gates": ["complexity", "dry", "yagni", "solid", "component-per-file", "property-tests"],
  "fails": [{ "message": "Cyclomatic complexity >6 (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::CC=10", "file": "./.standards/skills/hallmark/site/examples/cobalt-01/script.js", "line": "7" }],
  "warns": [{ "message": "Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:45:71:main:KISS_LINES=28", "file": "./.standards/ci/templates/go-saga-lint.go", "line": "45" }, { "message": "Method body >20 lines (go): ./.standards/ci/templates/go-saga-lint.go:101:124:checkCompensationPairs:KISS_LINES=25", "file": "./.standards/ci/templates/go-saga-lint.go", "line": "101" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:48:67:ActionForms:KISS_LINES=21", "file": "./app/(admin)/admin/(authed)/proposals/[id]/page.tsx", "line": "48" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/proposals/[id]/page.tsx:69:91:ProposalPage:KISS_LINES=23", "file": "./app/(admin)/admin/(authed)/proposals/[id]/page.tsx", "line": "69" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/revisions/[id]/page.tsx:35:67:ReviewTable:KISS_LINES=26", "file": "./app/(admin)/admin/(authed)/revisions/[id]/page.tsx", "line": "35" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx:7:34:RefreshPage:KISS_LINES=28", "file": "./app/(admin)/admin/(authed)/refresh/[runId]/page.tsx", "line": "7" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:57:82:PendingTable:KISS_LINES=24", "file": "./app/(admin)/admin/(authed)/page.tsx", "line": "57" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/(authed)/page.tsx:84:123:PanelHome:KISS_LINES=39", "file": "./app/(admin)/admin/(authed)/page.tsx", "line": "84" }, { "message": "Method body >20 lines (node): ./app/(admin)/admin/login/page.tsx:5:30:LoginPage:KISS_LINES=26", "file": "./app/(admin)/admin/login/page.tsx", "line": "5" }, { "message": "Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90::KISS_LINES=41", "file": "./.standards/skills/hallmark/site/examples/cobalt-01/script.js", "line": "7" }, { "message": "Method body >20 lines (node): ./.standards/skills/hallmark/site/examples/cobalt-01/script.js:93:225::KISS_LINES=43", "file": "./.standards/skills/hallmark/site/examples/cobalt-01/script.js", "line": "93" }, { "message": "Method body >20 lines (node): ./web/seo/share-card.tsx:41:62:Mark:KISS_LINES=23", "file": "./web/seo/share-card.tsx", "line": "41" }, { "message": "Method body >20 lines (node): ./web/components/DataTable.tsx:32:57:DataTable:KISS_LINES=27", "file": "./web/components/DataTable.tsx", "line": "32" }, { "message": "Method body >20 lines (node): ./web/components/series/PyramidPlate.tsx:72:106:Panel:KISS_LINES=35", "file": "./web/components/series/PyramidPlate.tsx", "line": "72" }, { "message": "Method body >20 lines (node): ./web/components/series/PyramidPlate.tsx:181:229:PyramidPlate:KISS_LINES=47", "file": "./web/components/series/PyramidPlate.tsx", "line": "181" }, { "message": "Method body >20 lines (node): ./web/components/CitationChip.tsx:12:38:CitationChip:KISS_LINES=28", "file": "./web/components/CitationChip.tsx", "line": "12" }, { "message": "Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:9:28:Chart:KISS_LINES=21", "file": "./web/components/metrics/PlateBody.tsx", "line": "9" }, { "message": "Method body >20 lines (node): ./web/components/metrics/PlateBody.tsx:41:62:ChartWithTable:KISS_LINES=23", "file": "./web/components/metrics/PlateBody.tsx", "line": "41" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteFooter.tsx:28:62:SiteFooter:KISS_LINES=36", "file": "./web/components/public/SiteFooter.tsx", "line": "28" }, { "message": "Method body >20 lines (node): ./web/components/public/ScopeMark.tsx:27:52:ScopeMark:KISS_LINES=24", "file": "./web/components/public/ScopeMark.tsx", "line": "27" }, { "message": "Method body >20 lines (node): ./web/components/public/Hero.tsx:256:280:Hero:KISS_LINES=26", "file": "./web/components/public/Hero.tsx", "line": "256" }, { "message": "Method body >20 lines (node): ./web/components/public/ReproduceBlock.tsx:53:100:ReproduceBlock:KISS_LINES=48", "file": "./web/components/public/ReproduceBlock.tsx", "line": "53" }, { "message": "Method body >20 lines (node): ./web/components/public/AssumptionsLedger.tsx:43:83:AssumptionsLedger:KISS_LINES=41", "file": "./web/components/public/AssumptionsLedger.tsx", "line": "43" }, { "message": "Method body >20 lines (node): ./web/components/public/ThemeGroup.tsx:13:36:ThemeGroup:KISS_LINES=21", "file": "./web/components/public/ThemeGroup.tsx", "line": "13" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:62:101:IndexPanel:KISS_LINES=41", "file": "./web/components/public/SiteHeader.tsx", "line": "62" }, { "message": "Method body >20 lines (node): ./web/components/public/SiteHeader.tsx:108:134:SiteHeader:KISS_LINES=28", "file": "./web/components/public/SiteHeader.tsx", "line": "108" }, { "message": "Method body >20 lines (node): ./web/components/registers/DisputeSection.tsx:17:42:DisputeSection:KISS_LINES=25", "file": "./web/components/registers/DisputeSection.tsx", "line": "17" }, { "message": "Method body >20 lines (node): ./web/components/registers/ThesisSection.tsx:19:43:ThesisSection:KISS_LINES=22", "file": "./web/components/registers/ThesisSection.tsx", "line": "19" }, { "message": "Method body >20 lines (node): ./web/components/share/ShareRow.tsx:62:88:ShareRow:KISS_LINES=24", "file": "./web/components/share/ShareRow.tsx", "line": "62" }, { "message": "Method body >20 lines (node): ./web/components/FigureStatusRow.tsx:36:64:FigureStatusRow:KISS_LINES=27", "file": "./web/components/FigureStatusRow.tsx", "line": "36" }, { "message": "Possible duplication (5x identical 4-line block, first at ./web/components/ProvenanceStrip.tsx:56): </li> /))} /</ul> /</a>", "file": "./web/components/ProvenanceStrip.tsx", "line": "56" }, { "message": "Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:115): type: \"problem\", /docs: { /description: /meta: {", "file": "./.standards/ci/templates/eslint-saga-rules/saga-compensation.js", "line": "115" }, { "message": "Possible duplication (3x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:132): schema: [], /}, /create(context) { /},", "file": "./.standards/ci/templates/eslint-saga-rules/saga-compensation.js", "line": "132" }, { "message": "Possible duplication (3x identical 4-line block, first at ./web/components/public/Hero.tsx:150): primary={actions.primary} /secondary={actions.secondary} //> /countries={countries}", "file": "./web/components/public/Hero.tsx", "line": "150" }, { "message": "Possible duplication (3x identical 4-line block, first at ./web/components/public/Hero.tsx:149): countries={countries} /primary={actions.primary} /secondary={actions.secondary} /content={content}", "file": "./web/components/public/Hero.tsx", "line": "149" }, { "message": "Possible duplication (3x identical 4-line block, first at ./web/components/public/Hero.tsx:148): content={content} /countries={countries} /primary={actions.primary} /<HeroLead", "file": "./web/components/public/Hero.tsx", "line": "148" }, { "message": "Possible duplication (3x identical 4-line block, first at ./web/components/metrics/views.ts:153): ...headValue, /summary: summaryOf(input.content, value.points.length), /readout: [ /return {", "file": "./web/components/metrics/views.ts", "line": "153" }, { "message": "Possible duplication (2x identical 4-line block, first at ./web/ingest/run-compute.ts:96): }, /}; /return { kind: 'ok', snapshot }; /detail: freshness.reason ?? 'outside freshness window',", "file": "./web/ingest/run-compute.ts", "line": "96" }, { "message": "Possible duplication (2x identical 4-line block, first at ./.standards/ci/templates/eslint-saga-rules/saga-compensation.js:133): }, /create(context) { /return { /schema: [],", "file": "./.standards/ci/templates/eslint-saga-rules/saga-compensation.js", "line": "133" }, { "message": "Possible duplication (2x identical 4-line block, first at ./web/components/public/SiteHeader.tsx:120): {content.t(anchor.label)} /</a> /))} /<a key={anchor.href} href={anchor.href}>", "file": "./web/components/public/SiteHeader.tsx", "line": "120" }, { "message": "Empty method body (java): ./.standards/ci/templates/archunit/OutboxArchRules.java:30", "file": "./.standards/ci/templates/archunit/OutboxArchRules.java", "line": "30" }, { "message": "Empty method body (java): ./.standards/ci/templates/archunit/SagaArchRules.java:33", "file": "./.standards/ci/templates/archunit/SagaArchRules.java", "line": "33" }]
}

Counts: **1 FAIL, 42 WARN**, 0 findings of any severity in the spec's own deliverable. The single
FAIL is `./.standards/skills/hallmark/site/examples/cobalt-01/script.js:7:90` (`CC=10`) — a file in
the `.standards/` git submodule, pre-existing since 001, untouchable by any pipeline agent in this
repo. Every other `.standards/*` entry above (`ci/templates/*`) is likewise submodule content.

`property-tests` gate: **pass** (0 FAIL) — `fast-check` is a devDependency and the suite uses it.
`component-per-file`, `solid`, `yagni`: 0 FAILs. `dry`: 0 FAILs in project source, one project-source
WARN (`ProvenanceStrip.tsx:56`, 5× 4-line row markup) plus the documented submodule templates.

Same command **without** moving `.next` aside exits **141** (SIGPIPE in the DRY sub-pipeline) and
additionally FAILs compiled Turbopack chunks under `.next/server/chunks/` — build output, not
source, and the reason this gate is run with `.next` set aside.

## Evidence: scenario-to-behavior spot check

command: npx vitest run tests/acceptance/fuse.test.ts tests/acceptance/share.test.ts -t "AC-003-15|AC-003-19|AC-003-26"
exit: 0
at: 2026-11-01T12:22:34Z

Three scenarios drawn from `20-acceptance/` were read against their own test bodies first, then
re-run scoped. (`36 skipped` here is the `-t` filter excluding the other tests in those two files —
not disabled tests; the full-suite run above has zero skips.)

start: 2026-11-01T12:22:34Z

 RUN  v5.0.5 /home/dbueno/projects/pensions-system


 Test Files  2 passed (2)
      Tests  3 passed | 36 skipped (39)
   Start at  13:22:34
   Duration  801ms (transform 35%, import 34%, tests 30%, worker 1%)

EXIT:0
end: 2026-11-01T12:22:35Z

What each assertion actually checks, against the scenario text:

- **AC-003-15 (the percentage is not capped above the threshold).** Then-clauses: prints `110 %`,
  drawn consumed length = the full fuse length. The test builds `{observedRatio: 55, threshold: 50,
  consumedPercent: 110}`, asserts the rendered `<figure class="fuse">` contains `110 %`, and asserts
  the rendered `<rect class="fuse__burnt">` has `x="0" … width="1000"` in the `0 0 1000 6` viewBox —
  i.e. the drawn line, not just the clamp helper. Matches, including the "drawing is clamped,
  printing is not" split the scenario intends.
- **AC-003-19 (no threshold year, no fuse).** Given `not-crossed`, `unavailable` and `withheld`
  countdowns *with a valid fuse series present*: Then no `class="fuse"` and no `fuse__line`
  renders. The test renders the full page for all three countdown states with the fuse series in
  the input and asserts both absences — so it cannot pass by the series simply being missing.
  Matches.
- **AC-003-26 (the shared URL is canonical and clean).** Then `{url}` equals `canonicalUrl(route)`
  and no tracking parameter is appended. The test iterates all five locales × four networks,
  extracts the shared URL from `searchParams.url` (LinkedIn/Telegram) or the trailing token of
  `text` (WhatsApp/X), asserts exact equality with `canonicalUrl(publicPathFor(locale))`, rejects
  `utm_|fbclid|gclid|ref=|source=`, and separately asserts the no-JS `<input>` holds that same URL.
  Matches, and it is the same property this stage re-checked against the served HTML.

No test in these three families asserts the right scenario ID for the wrong behaviour.

