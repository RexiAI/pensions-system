# AC-004: Visual identity preserved

## AC-004-64 — The palette and the type scale are untouched
Given `web/styles/tokens.css`
Then `--surface-1`, `--surface-2`, `--surface-3`, `--surface-hero`, `--ink-1`, `--ink-2`, `--ink-3`, `--rule-1`, `--rule-2`, `--accent`, `--on-accent`, `--data-projection`, `--data-deficit` keep their current values in the light theme
And the dark theme overrides keep their current values
And every `--font-*` and `--text-*` token keeps its current value

## AC-004-65 — Radius, shadow and the rule weight are unchanged
Given `web/styles/tokens.css`
Then `--radius` is still `0`
And `--shadow` is still `none`
And `--border-hair` is still `1px solid var(--rule-1)`
And no rule outside `tokens.css` declares a non-zero `border-radius` or a `box-shadow` other than `none`

## AC-004-66 — No new hue, no new colour token
Given `web/styles/tokens.css` and `web/styles/globals.css`
Then no colour token is added
And no rule outside `tokens.css` declares a `color`, `background`, `border-color` or `fill` whose value is a hex literal, an `rgb()`, an `hsl()` or a named colour

## AC-004-67 — The new rules are token-only
Given the rules added by this spec
Then every `font-size`, `font-family`, `margin`, `padding`, `gap`, `color`, `background` and `border` resolves a `var(--…)` token
And none of them declares a raw pixel length other than `1px` inside a border or a hairline

## AC-004-68 — The contrast pairs still pass
Given the palette this spec leaves unchanged
Then every pair asserted today still meets its minimum contrast ratio
And no contrast minimum is lowered
