# 007 — Four-page story

The public dossier split from one long document into four pages — Historia, Cifras, Método,
Debate — in five locales (20 static routes), with a persistent header nav and a previous/next
pager. This one-pager records the supersession disposition every affected single-page scenario
received, per `specs/007-four-page-story/10-tasks.md` §Task 12.

## Re-pointed in place (the ID stays cited; the test renders the page that owns the region)

| ID | Old single-page assertion | New home |
|----|---------------------------|----------|
| AC-004-01, AC-004-02, AC-004-03, AC-004-05 | five-step contract + "nothing above/before the story" | Historia (unchanged substance) |
| AC-004-08, AC-005-04 | one `<h1>` in step 1 | Historia |
| AC-004-33, AC-004-34, AC-004-35 | method precision + register key in `#metodo` | Método |
| AC-004-36 | every in-page `#metodo` reference resolves | Método owns `#metodo`; header/pager links are page hrefs |
| AC-004-43, AC-004-52 | figure plates live in `#figuras` | Cifras |
| AC-005-28, AC-005-29, AC-005-30, AC-005-31 | register occurrence/order after `#debate` | Debate (order still agreement → dispute → thesis) |
| AC-002-31 … AC-002-35 | CTA hierarchy; `#figuras`/`#metodo` href targets | hrefs become `/cifras` and `/metodo` |
| AC-003-34, AC-003-35, AC-003-36, AC-003-37, AC-003-38 | title/og carry the year + scope suffix; year-free fallback | title content is the promise framing; invariants unchanged |
| AC-001-52, AC-006-34, AC-006-35 | alternates + sitemap + one origin | 20 routes, per-page alternates, one origin |
| AC-006-07 … AC-006-14 | above-the-fold target set, type scale, one accent, `aria-current` | per-page; nav targets become page links |

## Superseded (the ID joins `SUPERSEDED_SCENARIOS`; its assertion is replaced by an AC-007-* scenario)

| ID | Superseded assertion | Replaced by |
|----|----------------------|-------------|
| AC-004-04 | the fifth step precedes `#figuras`, `#figuras` non-empty | AC-007-05 / AC-007-08 (Historia ends at the story; Cifras owns `#figuras`) |
| AC-004-37 | the method region is below the fold, after the fifth step | AC-007-09 (Método is its own page) |
| AC-004-25 | step-5 CTA → `#figuras` | AC-007-06 / AC-007-08 (Cifras page link; Cifras owns `#figuras`) |
| AC-004-28 | strip → `#metodo` | AC-007-07 / AC-007-09 (Método page link; Método owns precision) |
| AC-004-32 | "below the fold" precision | AC-007-09 (Método owns precision) |

No scenario ID is left dangling: the traceability gate reads this record's disposition and the
tests that own each ID.
