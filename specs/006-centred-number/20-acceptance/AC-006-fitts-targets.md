# AC-006: Meet Fitts' law above the fold

Task 4. Interactive elements are `a[href]`, `button`, `summary`, `input`, `select`,
`[tabindex]:not([tabindex="-1"])`, and anything carrying `[role="button"]` or `[role="link"]` —
the role list is there because a `div` with a role is a target to a reader and would otherwise be
invisible to a criterion that claims to count "every interactive element"; "rendered above the
fold" is defined in `10-tasks.md` §2.1–2.2.

## AC-006-07 — Every above-the-fold target reaches `--tap-min`

Given the served page at each of the five locales and each of the three viewports
When every rendered interactive element above the fold is measured
Then `--tap-min` resolves to 44 px
And no such element has a short axis smaller than 44 px
And an element measuring exactly 44 px passes
And the measured set includes the off-canvas skip link, which parks at `left: -9999px` until focused and is a target by name and by measurement.

## AC-006-08 — The target grows, the type does not

Given the same above-the-fold interactive elements
When each element's own computed `font-size` is read
And the locale cell's declared size is read from the stylesheet
Then every element's own text computes at most 17 px (`--text-body`)
And `--locale-cell` still resolves to 36 px
And the locale cells still declare `inline-size` and `block-size` from `var(--locale-cell)`, so the 44 px floor was added as a minimum, not by redefining the cell.

## AC-006-09 — Nothing is hidden to reach the floor

Given the served page at each of the three viewports
When the above-the-fold target set is enumerated by `href` and by role
Then the set is counted under the contract's rendered rule (§2.1), which counts a `<summary>` trigger and excludes the closed panel it opens
And at 1366×768 and 1440×900 at least 12 targets render
And that set includes an anchor for `#main`, an anchor for `#figuras`, `#metodo`, `#debate` and `#lectura`, five locale anchors covering `/`, `/en`, `/fr`, `/de` and `/it`, a wordmark anchor to `/`, and a theme toggle button
And at 390×844 at least 4 targets render, which is the measured count on the current page once the summary is counted rather than dropped with its closed panel
And that set includes the skip link, the wordmark, the index trigger `<summary>` and the theme toggle.
