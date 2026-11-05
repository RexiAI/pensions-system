# AC-004: The hero/band composition is retired

## AC-004-50 — The band is gone
Given the page rendered in any locale
Then no element on the page carries the class `band`
And no element carries the class `hero--band`
And a search of `web/styles/globals.css` for `hero--band` returns no match
And it contains no `grid-column: 2` declaration

## AC-004-51 — One lead path
Given `web/components/series/CountdownBand.tsx` and `web/components/public/HeroLeadBlock.tsx`
Then neither is composed by `PublicPage` or by any module it reaches
And the repository contains no second component that renders the page's lead

## AC-004-52 — The figure plates live in `#figuras`
Given the page rendered in any locale with two computed figures
Then each computed figure's plate renders inside `#figuras`
And no plate renders above the fifth step

## AC-004-53 — The lead's provenance facts move to the figures
Given the page rendered in any locale
When the five steps' text is read
Then it contains none of `hero.definitionLabel`, `hero.periodLabel`, `provenance.source` or `provenance.dataset`
And each of those labels renders beside the plate it belongs to, inside `#figuras`

## AC-004-54 — No dead hero surface
Given the repository after the recomposition
Then no exported module, component or type is left with no importer among `web/components/public/Hero.tsx`, `web/components/public/HeroLead.tsx` and `web/components/public/hero-subject.ts` unless it is still used by `#figuras`
And the page renders without throwing when given zero figures and zero series
