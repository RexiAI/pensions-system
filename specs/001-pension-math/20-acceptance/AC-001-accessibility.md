# AC-001: Accessibility for charts

## AC-001-44 — When a chart renders, the chart renders non-visual data
Given a computed metric or a derived data view (the population pyramid)
When its chart is rendered
Then a non-visual representation (accessible table, `aria-label`, or text alternative) carrying
  the same values is present alongside the visual chart
And a table is emitted if and only if a chart is emitted: one component produces both, so there
  is no code path that renders one without the other

## AC-001-45 — When a chart renders, non-visual data is exposed to assistive technology
Given a rendered chart for a computed metric or a derived data view (the population pyramid)
When the DOM is inspected
Then the non-visual data representation is present with an accessible name/role and contains the
  same values as the visual chart
And the table is emitted if and only if the chart is emitted

## AC-001-75 — An unresolved figure renders no chart and no table, deliberately
Given a figure whose `availability` is `unavailable` (or a figure that is `withheld`)
When the page is rendered
Then no chart and no table are emitted for that figure (no empty table, no `role="img"` on
  nothing, no live region)
And a screen-reader user encounters instead a level-2 heading naming the figure, one sentence
  stating it is not calculated in this deployment, and a link to its methodology
And that absence is deliberate and unconditional: the table is absent because the chart is
  absent, never as a separate decision
