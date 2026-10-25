# AC-001: Accessibility for charts

## AC-001-44 — Every chart renders non-visual data
Given a chart for a computed metric
When the chart is rendered
Then a non-visual representation (accessible table, `aria-label`, or text alternative) carrying the same values is present alongside the visual chart

## AC-001-45 — Non-visual data is exposed to assistive technology
Given a rendered chart
When the DOM is inspected
Then the non-visual data representation is present with an accessible name/role and contains the same values as the visual chart
