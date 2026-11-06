# AC-006: Observed vs projected, by form

Task 10. The distinction must survive the removal of the amber, and it must be a paint that
actually renders — `10-tasks.md` §2.13.

## AC-006-27 — The panels share one hue, and each prints its state

Given the demography plate in each of the five locales
When the three panels' computed fill and their state words are read
Then reference, measured and projected resolve to one `--demography-hue`
And no panel's fill differs chromatically from another's
And each panel prints its state word (`demography.year.observed` / `demography.year.projected`) beside it.

## AC-006-28 — The projected series differs by a form that paints

Given the served demography SVG
When the projected series' paint is compared with the observed series' paint
Then the projected series carries at least one of a `stroke-dasharray` bound to `--dash-projection`, or a `fill: url(#…)` resolving to an SVG `<pattern>`
And that form is absent from the observed series
And when the mechanism is a fill, `CSS.supports('fill', …)` returns true for the value used
And a CSS gradient function is not accepted as the mechanism, because `CSS.supports('fill', 'repeating-linear-gradient(…))` is false in Chromium and paints nothing.
