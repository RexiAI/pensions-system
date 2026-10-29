# AC-002: Saturated accent (light and dark), contrast pairs recomputed

The saturation metric is CIELCh chroma — the same measure
`tests/acceptance/palette-labels.test.ts` already computes as `chroma(hex)`. Contrast
is WCAG 2.1 relative luminance, as that test computes it.

## AC-002-04 — The light accent is more saturated
Given the current light accent `#425425`
And the new light accent declared at `--accent` in `:root`
When the CIELCh chroma of each is computed
Then chroma(new accent) is strictly greater than chroma(`#425425`)

## AC-002-05 — The dark accent is more saturated
Given the current dark accent `#9cc17f`
And the new dark accent declared at `--accent` in `[data-theme='dark']`
When the CIELCh chroma of each is computed
Then chroma(new accent) is strictly greater than chroma(`#9cc17f`)

## AC-002-06 — The accent keeps the olive family, held within ±8° of its current hue
Given the current light accent hue and the new light accent hue (CIELCh)
And the comparable accents (`#CE261E`, `#05576B`, `#0061C8`)
When the hue angle of the new accent is computed
Then hue(new light accent) is within ±8° of hue(`#425425`) (≈122°)
And hue(new dark accent) is within ±8° of hue(`#9cc17f`) (≈130°)
And the drift does not move toward the ochre `--data-projection`: the hue gap from
`--data-projection` stays greater than 20° in both themes (AC-001-117)
And the new accent is not red, teal, or blue

## AC-002-07 — Warm paper, radius and shadow are unchanged
Given `web/styles/tokens.css`
When the ground and shape tokens are read
Then `--surface-1`, `--surface-2`, `--surface-3` and `--surface-hero` keep their current
literal values in both themes
And the ink ladder and rule tokens keep their current literal values
And no `#ffffff` / `#FFFFFF` ground is introduced
And `--radius: 0` is unchanged
And `--shadow: none` is unchanged

## AC-002-08 — The accent's contrast pairs are recomputed and still meet their minimums
Given the new accent in both themes
When WCAG contrast is computed for each accent-bearing pair
Then `accent on surface-1`, `accent on surface-2`, `accent on surface-3`, and
`accent on surface-hero` each have a ratio of at least 4.5 in both themes
And `on-accent on accent` has a ratio of at least 4.5 in both themes (`--on-accent`
recomputed against the new accent)
And the accent remains one of exactly three chromatic hues (chroma greater than 20),
with a hue gap greater than 20° from both `--data-projection` and `--data-deficit`
And no component or series module carries a literal colour
