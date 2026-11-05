# AC-005: Step 1 stops being the tightest box

Task T3. Step 1 is `[data-top-step="number"]`; its rule is `.step--number` in
`web/styles/globals.css`. Token values: `--space-6` 32 px, `--space-7` 48 px,
`--space-8` 64 px.

## AC-005-12 — The declared padding of step 1 is not smaller than any other step's

Given `web/styles/globals.css` parsed into rules, and `web/styles/tokens.css` parsed into
  custom-property values
And every selector that matches a `[data-top-step]` section and declares `padding-block`,
  `padding-block-start` or `padding-block-end`
When each declaration is resolved through the token table to a pixel value
Then `.step--number`'s resolved `padding-block-start` is greater than or equal to the maximum of
  every other step selector's resolved `padding-block-start`
And `.step--number`'s resolved `padding-block-end` is greater than or equal to the maximum of
  every other step selector's resolved `padding-block-end`
And the comparison is computed from the parsed declarations, so it holds whatever values the
  rules take (shipped: `.step` 64 px and `.step--distance` 48 px against `.step--number` 32 px,
  which fails, as the informal spec measured)

## AC-005-13 — The rendered padding of step 1 is not smaller than any other step's

Given the built app served by `next start` and a real Chromium
When `getComputedStyle` is read for `padding-block-start` and `padding-block-end` on every
  element carrying `data-top-step`, at 1440×900
Then step 1's `padding-block-start` is greater than or equal to every other step's
And step 1's `padding-block-end` is greater than or equal to every other step's
And the assertion holds in each of the five locales
And the measured numbers are printed on failure

## AC-005-14 — Headline, clock and sentence are separated enough to read as three things

Given the built app served by `next start` and a real Chromium
And `--space-5` resolved from `tokens.css` (24 px)
When at 390×844 and at 1440×900 the bounding boxes of `.hero__title`, `.clock` and
  `.step__sentence` are measured inside `[data-top-step="number"]`
Then `.clock`'s top minus `.hero__title`'s bottom is greater than or equal to `--space-5`
And `.step__sentence`'s top minus `.clock`'s bottom is greater than or equal to `--space-5`
And the assertion holds in each of the five locales
And the two measured gaps are printed per locale and per viewport on failure

## AC-005-15 — The extra air does not break the one-screen bound

Given the built app served by `next start` and a real Chromium
When the height of `[data-top-step="number"]` is measured at 390×844, 1366×768 and 1440×900
Then it is less than or equal to the viewport height at each size
And it is greater than 0
And the assertion holds in each of the five locales
And no step achieves the bound by hiding content: step 1 declares no `display: none` on its
  content and no fixed height with `overflow: hidden` (preserved AC-004-60, AC-004-61)

## AC-005-16 — The air is spent with tokens, and the ground is kept

Given the rules in `web/styles/globals.css` that T3 touches
When each `padding`, `margin` and `gap` declaration in them is read
Then every value resolves a `var(--…)` token and none is a literal length
And `.step--number` still declares `background: var(--surface-hero)`
And `.step--number` declares no `border-top`
And no rule declares `background: var(--surface-2)` for step 1
And every token in `web/styles/tokens.css` keeps its shipped value, `--space-*` included
  (preserved AC-001-118, AC-004-64, AC-004-65, AC-004-66)
