# AC-004: Step 3 — the pyramid moves up and is annotated

## AC-004-13 — The pyramid is the third step and precedes the figures
Given a computed `pyramid` series
When the page is rendered in any locale
Then `id="demografia"` is inside the element carrying `data-top-step="why"`
And that element follows `data-top-step="breakage"`
And it precedes `data-top-step="distance"` and `id="figuras"`

## AC-004-14 — No four-percentage headline on the pyramid's face
Given the page rendered in any locale
When the block between step 3's `<h2>` and its first panel is read
Then its `<h2>` contains no `%` sign
And that block contains at most one `%` sign
And it renders no `demography__finding`
And it renders no `demography__readout`

## AC-004-15 — The finding sentence and the readout survive, collapsed, below the panels
Given the page rendered in any locale
When the whole of step 3 is read
Then `demography__finding` renders inside a `<details>` that follows the three panels
And `demography__readout` renders inside a `<details>` that follows the three panels
And the data table renders in the same disclosure as the charts

## AC-004-16 — Three panels, one annotation each, naming a band
Given a computed `pyramid` series with three panels
When step 3 is rendered in any locale
Then each panel carries exactly one annotation element
And there are exactly three annotations in total
And each annotation's text contains a band label produced by `bandLabel` for one of the published age bands
And each annotation is resolved from a content key, not a literal

## AC-004-17 — Accessibility of the chart is unchanged by the move
Given the page rendered in any locale
Then each pyramid `<svg>` still has `role="img"` and an accessible name from its own `<title>`
And the data table is emitted if and only if the charts are emitted
And the table still carries the chart's values

## AC-004-18 — The pyramid's provenance is not in step 3
Given the page rendered in any locale
When step 3 is scanned
Then it contains no element with `data-operator="true"`
And the pyramid's provenance renders inside `#metodo`

## AC-004-19 — No pyramid series, no step
Given a `pyramid` series that is not `computed`
When the page is rendered
Then step 3 renders no heading, no panel and no body text
And no "unavailable" row, chip or method link renders in its place
And the remaining four steps keep their relative order
